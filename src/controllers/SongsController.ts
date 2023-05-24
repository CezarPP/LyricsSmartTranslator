import {SongsRepository} from "../repositories/SongsRepository";
import {TranslationsRepository} from "../repositories/TranslationsRepository";
import {Translation} from "../models/Translation";
import {Song} from "../models/Song";
import {IncomingMessage, ServerResponse} from "http";
import {ImagesRepository} from "../repositories/ImagesRepository";
import assert from "assert";
import {UsersController} from "./UsersController";
import {isYoutubeLink} from "../util/validation";
import {sendMessage} from "../util/sendMessage";

export class SongsController {
    private songRepository: SongsRepository;
    private translationRepository: TranslationsRepository;
    private imagesRepository: ImagesRepository;
    private usersController: UsersController;

    constructor() {
        this.songRepository = new SongsRepository();
        this.translationRepository = new TranslationsRepository();
        this.imagesRepository = new ImagesRepository();
        this.usersController = new UsersController();
    }

    async handleApiRequest(req: IncomingMessage, res: ServerResponse) {
        if (req.method == 'GET') {
            assert(req.url);
            if (req.url.split('/').length > 3) {
                await this.handleGetById(req, res);
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
            sendMessage(res, 405, `Method not allowed for path ${req.url}`);
        }
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
            let link = postData['youtube-link'] as string;
            const imageId = postData.imageId as number;

            if (title === undefined || artist === undefined ||
                link === undefined || imageId === undefined ||
                lyrics === undefined || description === undefined || !isYoutubeLink(link)) {
                sendMessage(res, 400, 'Invalid request');
                return;
            }

            // Link has to be embedded, otherwise it won't load
            link = link.replace('/watch?v=', '/embed/');

            const user = await this.usersController.getLoggedUser(req, res);
            if (user === null) {
                res.statusCode = 401;
                const data = {
                    message: 'You need to be authenticated to submit a song',
                    redirectPage: '/not-auth.html',
                }
                res.end(JSON.stringify(data));
                return;
            }

            const song = new Song(0, 0, imageId, artist, title, link);
            console.log("Preparing song to add to repo with title " + song.title);

            const songId = await this.songRepository.addSongNoFk(song);
            console.log("Added song to repo with id " + songId);

            const translation = new Translation(0, songId, user.id,
                'english', description, lyrics, 0, new Date());
            console.log("Preparing to add translation to repo");
            const translationId = await this.translationRepository.addTranslation(translation);
            console.log("Added translation to repo with id " + translationId);

            await this.songRepository.updatePrimaryTranslation(songId, translationId);

            console.log("Song added successfully");

            res.statusCode = 200;
            const data = {
                message: 'Song added successfully!',
                redirectPage: '/submit-song.html',
                songId: songId,
                translationId: translationId
            }
            res.end(JSON.stringify(data));
        });
    }

    async handlePut(req: IncomingMessage, res: ServerResponse) {
        assert(req.url);
        const songId = parseInt(req.url.split('/')[3]);
        if (isNaN(songId)) {
            console.log("Song id is nan");
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

            const user = await this.usersController.getLoggedUser(req, res);
            if (user === null) {
                res.statusCode = 401;
                const data = {
                    message: 'You need to be authenticated to update a song',
                    redirectPage: '/not-auth.html',
                }
                res.end(JSON.stringify(data));
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
        if (!req.url) {
            sendMessage(res, 500, 'Server error');
            return;
        }
        const songId: number = parseInt(req.url.split('/')[3]);

        if (isNaN(songId)) {
            sendMessage(res, 400, 'Invalid song id');
            return;
        }

        console.log('Song id is ' + songId);

        const song: Song | null = await this.songRepository.getSongById(songId);

        if (song === null) {
            sendMessage(res, 404, 'Song not found');
            return;
        }
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify(song.toObject()));
    }

    async handleDelete(req: IncomingMessage, res: ServerResponse) {
        assert(req.url);
        const songId: number = parseInt(req.url.split('/')[3]);

        if (isNaN(songId)) {
            console.log("Song id is nan");
            sendMessage(res, 400, 'Invalid song id');
            return;
        }

        const song: Song | null = await this.songRepository.getSongById(songId);
        if (song === null) {
            sendMessage(res, 404, 'Song not found');
            return;
        }

        const user = await this.usersController.getLoggedUser(req, res);
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
        await this.songRepository.deleteSong(songId);

        sendMessage(res, 200, 'Song deleted successfully!');
    }


    async handleGetAll(req: IncomingMessage, res: ServerResponse) {
        const allSongs: Song[] = await this.songRepository.getAllSongs();
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify(allSongs));
    }
}