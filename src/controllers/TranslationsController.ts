import {SongsRepository} from "../repositories/SongsRepository";
import {TranslationsRepository} from "../repositories/TranslationsRepository";
import {IncomingMessage, ServerResponse} from "http";
import {Translation} from "../models/Translation";
import {UsersController} from "./UsersController";
import {sendMessage} from "../util/sendMessage";
import assert from "assert";
import {Song} from "../models/Song";

export class TranslationsController {
    private songRepository: SongsRepository;
    private translationRepository: TranslationsRepository;
    private usersController: UsersController;

    constructor() {
        this.songRepository = new SongsRepository();
        this.translationRepository = new TranslationsRepository();
        this.usersController = new UsersController();
    }

    async handleApiRequest(req: IncomingMessage, res: ServerResponse) {
        if (req.method == 'GET') {
            assert(req.url);
            if (req.url.split('/').length > 3) {
                await this.handleGet(req, res);
            } else {
                await this.handleGetAll(req, res);
            }
        } else if (req.method == 'POST') {
            await this.handlePost(req, res);
        } else if (req.method == 'PUT') {
            await this.handlePut(req, res);
        } else if (req.method == 'DELETE') {
            await this.handleDelete(req, res);
        } else {
            res.statusCode = 405;
            res.end('Method not allowed');
        }
    }

    async handleGet(req: IncomingMessage, res: ServerResponse) {
        if (!req.url) {
            sendMessage(res, 500, 'Server error');
            return;
        }
        const translationId = parseInt(req.url.split('/')[3]);

        if (isNaN(translationId)) {
            console.log("Translation id is nan");
            sendMessage(res, 400, 'Invalid translation id');
            return;
        }

        const translation: Translation | null = await this.translationRepository.getTranslationById(translationId);
        if (translation === null) {
            sendMessage(res, 404, 'Translation not found');
            return;
        }
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify(translation.toObject()));
    }

    async handleGetAll(req: IncomingMessage, res: ServerResponse) {
        const allTranslations: Translation[] = await this.translationRepository.getAllTranslations();
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify(allTranslations));
    }

    async handlePost(req: IncomingMessage, res: ServerResponse) {
        let body = '';
        req.on('data', chunk => {
            body += chunk.toString();
        });

        req.on('end', async () => {
            const postData = JSON.parse(body);
            const songId = postData.songId as number;
            const lyrics = postData.lyrics as string;
            let language = postData.language as string;
            const description = postData.description as string;

            if (songId === undefined || lyrics === undefined || language === undefined || description === undefined) {
                sendMessage(res, 400, 'Invalid request');
            }

            language = language.toLowerCase();

            const song = await this.songRepository.getSongById(songId);
            if (song === null) {
                sendMessage(res, 404, 'Song not found');
                return;
            }
            let translation
                = await this.translationRepository.getTranslationByNameAndLanguage(song.title, language);

            if (translation !== null) {
                sendMessage(res, 409, 'There exists a translation in this language for this song');
                return;
            }

            const user = await this.usersController.getLoggedUser(req, res);
            if (user === null) {
                res.statusCode = 401;
                const data = {
                    message: 'You need to be authenticated to submit a translation',
                    redirectPage: '/not-auth.html',
                    translationId: 0
                }
                res.end(JSON.stringify(data));
                return;
            }

            translation = new Translation(0, songId, user.id,
                language, description, lyrics, 0, new Date());

            console.log("Preparing to add translation to repo");
            const translationId = await this.translationRepository.addTranslation(translation);
            console.log("Added translation to repo with id " + translationId);

            res.statusCode = 200;
            const data = {
                message: 'Translation added successfully!',
                redirectPage: '/submit-translation.html',
                songId: songId,
                translationId: translationId
            }
            res.end(JSON.stringify(data));
        });
    }

    async handlePut(req: IncomingMessage, res: ServerResponse) {
        let body = '';
        req.on('data', chunk => {
            body += chunk.toString();
        });

        req.on('end', async () => {
            if (!req.url) {
                sendMessage(res, 500, 'Server error');
                return;
            }

            const postData = JSON.parse(body);
            const lyrics = postData.lyrics as string;
            const description = postData.description as string;
            const translationId: number = parseInt(req.url.split('/')[3]);

            if (isNaN(translationId) || lyrics === undefined || description === undefined) {
                console.log("Translation id is nan");
                sendMessage(res, 400, 'Invalid request');
                return;
            }

            const translation: Translation | null = await this.translationRepository.getTranslationById(translationId);
            if (translation === null) {
                sendMessage(res, 404, 'Translation not found');
                return;
            }

            const user = await this.usersController.getLoggedUser(req, res);
            if (user === null) {
                sendMessage(res, 401, 'You need to be authenticated in order to update a translation');
                return;
            }

            // Owner or admin
            if (translation.userId !== user.id && user.id !== 1) {
                sendMessage(res, 403, 'Only the user that added the translation can update it');
                return;
            }
            await this.translationRepository.updateTranslation(translationId, description, lyrics);
        });
    }

    async handleDelete(req: IncomingMessage, res: ServerResponse) {
        if (!req.url) {
            sendMessage(res, 500, 'Server error');
            return;
        }
        const translationId: number = parseInt(req.url.split('/')[3]);

        if (isNaN(translationId)) {
            console.log("Translation id is nan");
            sendMessage(res, 400, 'Invalid translation id');
            return;
        }
        console.log('Translation id to delete is ' + translationId);

        const translation: Translation | null = await this.translationRepository.getTranslationById(translationId);
        if (translation === null) {
            sendMessage(res, 404, 'Translation not found');
            return;
        }

        const user = await this.usersController.getLoggedUser(req, res);
        if (user === null) {
            sendMessage(res, 401, 'You need to be authenticated in order to delete a translation');
            return;
        }

        // Owner or admin
        if (translation.userId !== user.id && user.id !== 1) {
            sendMessage(res, 403, 'Only the user that added the translation can delete it');
            return;
        }

        // Cascade delete will happen because of trigger in db
        await this.translationRepository.deleteTranslation(translationId);

        sendMessage(res, 200, 'Translation deleted successfully!');
    }

}