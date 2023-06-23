import {Translation} from "../models/Translation";
import {Song} from "../models/Song";
import {IncomingMessage, ServerResponse} from "http";
import assert from "assert";
import {isYoutubeLink} from "../util/validation";
import {sendMessage} from "../util/sendMessage";
import {getUTCDate} from "../util/getUTCDate";
import url from "url";
import {BaseController} from "./BaseController";
import {getLoggedUser} from "../util/getLoggedUser";

export class SongsController extends BaseController {
    constructor() {
        super();
    }

    async handleGetAll(req: IncomingMessage, res: ServerResponse) {
        const allSongs: Song[] = await this.songRepository.getAllSongs();
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify(allSongs));
    }

    async handleFiltering(req: IncomingMessage, res: ServerResponse) {
        assert(req.url);
        const parsedUrl = url.parse(req.url, true);
        const parameters = parsedUrl.query;
        const filter = parameters["filter"] as string;
        const limitString = parameters["limit"] as string;
        const limit = (limitString === undefined) ? 30 : parseInt(limitString);
        const filterOptions = ["newest", "mostCommented", "mostViewed"];
        const filterFunctions = [
            (limit: number) => this.songRepository.getNewest(limit),
            (limit: number) => this.songRepository.getMostCommented(limit),
            (limit: number) => this.songRepository.getMostViewed(limit),
        ];

        if (filter === undefined || isNaN(limit) || limit < 0 || !filterOptions.includes(filter)) {
            sendMessage(res, 400, 'Invalid request parameters');
            return;
        }

        const songs: Song[] = await filterFunctions[filterOptions.indexOf(filter)](limit);

        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify(songs));
    }

    async handlePost(req: IncomingMessage, res: ServerResponse) {
        let body = '';
        req.on('data', chunk => {
            body += chunk.toString();
        });

        req.on('end', async () => {
            const postData = JSON.parse(body);
            const title = postData.title as string;
            const artist = postData.artist as string;
            const lyrics = postData.lyrics as string;
            const description = postData.description as string;
            const language = postData.language as string;
            let link = postData['youtube-link'] as string;
            const imageId = postData.imageId as number;

            if (title === undefined || artist === undefined ||
                link === undefined || imageId === undefined ||
                lyrics === undefined || description === undefined
                || language === undefined) {
                sendMessage(res, 400, 'Invalid request');
                return;
            }

            if (!isYoutubeLink(link)) {
                sendMessage(res, 422, 'Invalid youtube link');
                return;
            }

            // Link has to be embedded, otherwise it won't load
            link = link.replace('/watch?v=', '/embed/');

            const user = await getLoggedUser(req);
            if (user === null) {
                sendMessage(res, 401, 'You need to be authenticated to submit a song.');
                return;
            }

            const song = new Song(0, 0, imageId, artist, title, link);
            console.log("Preparing song to add to repo with title " + song.title);

            const songId = await this.songRepository.addSongNoFk(song);
            console.log("Added song to repo with id " + songId);

            console.log("Preparing to add translation to repo");
            const translation = new Translation(0, songId, user.id,
                language, description, lyrics, 0, getUTCDate());
            const translationId = await this.translationRepository.addTranslation(translation);
            console.log("Added translation to repo with id " + translationId);

            await this.songRepository.updatePrimaryTranslation(songId, translationId);

            console.log("Song added successfully");
            await this.songRepository.updateRSSFeed();
            console.log("RSS feed updated successfully");

            song.primary_translation = translationId;
            song.id = songId;

            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify(song.toObject()));
        });
    }

    async handlePut(req: IncomingMessage, res: ServerResponse) {
        assert(req.url);
        const songId = parseInt(req.url.split('/')[3]);
        if (isNaN(songId)) {
            sendMessage(res, 400, 'Invalid song id');
            return;
        }

        let body = '';
        req.on('data', chunk => {
            body += chunk.toString();
        });

        req.on('end', async () => {
            const postData = JSON.parse(body);

            const title = postData.title as string;
            const artist = postData.artist as string;
            let link = postData['youtube-link'] as string;

            if (title === undefined || artist === undefined
                || link === undefined || !isYoutubeLink(link)) {
                sendMessage(res, 400, 'Invalid request');
                return;
            }

            // Link has to be embedded, otherwise it won't load
            link = link.replace('/watch?v=', '/embed/');

            const user = await getLoggedUser(req);
            if (user === null) {
                sendMessage(res, 401, 'You need to be authenticated to update a song.');
                return;
            }

            const song = await this.songRepository.getSongById(songId);
            if (song === null) {
                sendMessage(res, 404, 'Song not found');
                return;
            }

            const translationId: number = song.primary_translation;
            const translation = await this.translationRepository.getTranslationById(translationId);
            if (translation == null) {
                sendMessage(res, 500, 'Server error');
                return;
            }

            // Owner or admin
            if (translation.userId !== user.id && user.id !== 1) {
                sendMessage(res, 403, 'Only the owner of the song can update it');
                return;
            }

            await this.songRepository.updateSong(songId, artist, title, link);
            sendMessage(res, 200, 'Song updated successfully!');
        });
    }

    async handleGetById(req: IncomingMessage, res: ServerResponse) {
        const song = await this._getSongFromRequest(req, res);
        if (song === null)
            return;

        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify(song.toObject()));
    }

    async handleDelete(req: IncomingMessage, res: ServerResponse) {
        const song = await this._getSongFromRequest(req, res);
        if (song === null)
            return;

        const user = await getLoggedUser(req);
        if (user === null) {
            sendMessage(res, 401, 'You need to be authenticated to delete a song');
            return;
        }

        const translation: Translation | null = await this.translationRepository.getTranslationById(song.primary_translation);
        if (translation === null) {
            sendMessage(res, 500, 'Server error');
            return;
        }

        if (translation.userId !== user.id && user.id !== 1) {
            sendMessage(res, 403, 'Only the user that added the song can delete it');
            return;
        }

        // Cascade delete will happen because of trigger in db
        await this.songRepository.deleteSong(song.id);

        sendMessage(res, 200, 'Song deleted successfully!');
    }

    private async _getSongFromRequest(req: IncomingMessage, res: ServerResponse) {
        assert(req.url);
        const songId: number = parseInt(req.url.split('/')[3]);

        if (isNaN(songId)) {
            sendMessage(res, 400, 'Invalid song id');
            return null;
        }

        const song: Song | null = await this.songRepository.getSongById(songId);
        if (song === null) {
            sendMessage(res, 404, 'Song not found');
            return null;
        }

        return song;
    }
}