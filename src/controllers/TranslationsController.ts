import {IncomingMessage, ServerResponse} from "http";
import {Translation} from "../models/Translation";
import {sendMessage} from "../util/sendMessage";
import assert from "assert";
import url from "url";
import {BaseController} from "./BaseController";
import {getUTCDate} from "../util/getUTCDate";
import {getLoggedUser} from "../util/getLoggedUser";

export class TranslationsController extends BaseController {
    private nrViews: Map<number, number> = new Map();

    constructor() {
        super();
    }

    async handleGetById(req: IncomingMessage, res: ServerResponse) {
        assert(req.url);

        const translationId = parseInt(req.url.split('/')[3]);

        if (isNaN(translationId)) {
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

        await this.incrementNumberOfViews(translation);
    }

    async incrementNumberOfViews(translation: Translation) {
        let cntViews = this.nrViews.get(translation.id);
        if (cntViews === undefined) {
            this.nrViews.set(translation.id, translation.no_views + 1);
        } else {
            cntViews++;
            if (cntViews % 10 === 0) {
                await this.translationRepository.updateNoViews(translation.id, cntViews);
            }
            this.nrViews.set(translation.id, cntViews);
        }
    }

    async handleGetAll(req: IncomingMessage, res: ServerResponse) {
        const allTranslations: Translation[] = await this.translationRepository.getAllTranslations();
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify(allTranslations));
    }

    async handleFiltering(req: IncomingMessage, res: ServerResponse) {
        assert(req.url);
        const parsedUrl = url.parse(req.url, true);
        const parameters = parsedUrl.query;
        const songIdString = parameters["songId"] as string;
        const username = parameters["username"] as string;

        // If neither songId nor username parameters are provided, send an error response
        if (songIdString === undefined && username === undefined) {
            sendMessage(res, 400, 'Invalid request parameters');
            return;
        }

        // If both songId and username parameters are provided, send an error response
        if (songIdString !== undefined && username !== undefined) {
            sendMessage(res, 400, 'Invalid request parameters. You can filter by songId or username, not both at the same time.');
            return;
        }

        // Filter by songId
        if (songIdString !== undefined) {
            const songId = parseInt(songIdString);
            if (isNaN(songId)) {
                sendMessage(res, 400, 'Invalid songId parameter');
                return;
            }

            const translations: Translation[] = await this.translationRepository.getAllBySongId(songId);
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify(translations));
            return;
        }

        // Filter by username
        if (username !== undefined) {
            const translations: Translation[] = await this.translationRepository.getTranslationsByUsername(username);
            if (translations.length === 0) {
                sendMessage(res, 404, 'No translations found for this user');
                return;
            }

            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify(translations));
            return;
        }
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

            const user = await getLoggedUser(req);
            if (user === null) {
                sendMessage(res, 401, 'You need to be authenticated to submit a translation');
                return;
            }

            translation = new Translation(0, songId, user.id,
                language, description, lyrics, 0, getUTCDate());

            console.log("Preparing to add translation to repo");
            const translationId = await this.translationRepository.addTranslation(translation);
            console.log("Added translation to repo with id " + translationId);

            res.statusCode = 200;
            const data = {
                message: 'Translation added successfully!',
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
            assert(req.url);

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

            const user = await getLoggedUser(req);
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
        assert(req.url);

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

        const user = await getLoggedUser(req);
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