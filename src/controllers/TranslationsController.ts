import {SongsRepository} from "../repositories/SongsRepository";
import {TranslationsRepository} from "../repositories/TranslationsRepository";
import {IncomingMessage, ServerResponse} from "http";
import {Translation} from "../models/Translation";
import {UsersController} from "./UsersController";

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
            await this.handleGet(req, res);
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
            res.statusCode = 500;
            res.end('Invalid url');
            return;
        }
        const translationId = parseInt(req.url.split('/')[3]);
        const translation: Translation | null = await this.translationRepository.getTranslationById(translationId);
        if (translation === null) {
            res.statusCode = 404;
            res.end('No translation found');
            return;
        }
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify(translation.toObject()));
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

            language = language.toLowerCase();

            const song = await this.songRepository.getSongById(songId);
            if (song === null) {
                res.statusCode = 500;
                res.end('Error: not a valid song');
                return;
            }
            let translation
                = await this.translationRepository.getTranslationByNameAndLanguage(song.title, language);

            if (translation !== null) {
                res.statusCode = 500;
                res.end('There exists a translation in this language for this song');
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
            const postData = JSON.parse(body);
            const lyrics = postData.lyrics as string;
            const description = postData.description as string;

            if (!req.url) {
                res.statusCode = 500;
                res.end('Server error');
                return;
            }
            const translationId: number = parseInt(req.url.split('/')[3]);
            console.log('Song id to delete is ' + translationId);

            const translation: Translation | null = await this.translationRepository.getTranslationById(translationId);
            if (translation === null) {
                const data = {
                    message: 'Translation not found'
                }
                res.end(JSON.stringify(data));
                return;
            }

            const user = await this.usersController.getLoggedUser(req, res);
            if (user === null) {
                const data = {
                    message: 'You need to be authenticated in order to update a translation'
                }
                res.end(JSON.stringify(data));
                return;
            }

            // Owner or admin
            if (translation.userId !== user.id || translation.userId === 1) {
                const data = {
                    message: 'Only the user that added the translation can update it'
                }
                res.end(JSON.stringify(data));
                return;
            }
            await this.translationRepository.updateTranslation(translationId, description, lyrics);
        });
    }

    async handleDelete(req: IncomingMessage, res: ServerResponse) {
        if (!req.url) {
            res.statusCode = 500;
            res.end('Server error');
            return;
        }
        const translationId: number = parseInt(req.url.split('/')[3]);
        console.log('Translation id to delete is ' + translationId);

        const translation: Translation | null = await this.translationRepository.getTranslationById(translationId);
        if (translation === null) {
            const data = {
                message: 'Translation not found'
            }
            res.end(JSON.stringify(data));
            return;
        }

        const user = await this.usersController.getLoggedUser(req, res);
        if (user === null) {
            const data = {
                message: 'You need to be authenticated in order to delete a translation'
            }
            res.end(JSON.stringify(data));
            return;
        }

        // Owner or admin
        if (translation.userId !== user.id || translation.userId === 1) {
            const data = {
                message: 'Only the user that added the translation can delete it'
            }
            res.end(JSON.stringify(data));
            return;
        }
        // Cascade delete will happen because of trigger in db

        await this.translationRepository.deleteTranslation(translationId);

        res.statusCode = 200;
        const data = {
            message: 'Translation deleted successfully!'
        }
        res.end(JSON.stringify(data));
    }

}