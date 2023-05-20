import {SongsRepository} from "../repositories/SongsRepository";
import {TranslationsRepository} from "../repositories/TranslationsRepository";
import {Translation} from "../models/Translation";
import {Song} from "../models/Song";
import {IncomingMessage, ServerResponse} from "http";
import {ImagesRepository} from "../repositories/ImagesRepository";
import assert from "assert";

export class SongsController {
    private songRepository: SongsRepository;
    private translationRepository: TranslationsRepository;
    private imagesRepository: ImagesRepository;

    constructor() {
        this.songRepository = new SongsRepository();
        this.translationRepository = new TranslationsRepository();
        this.imagesRepository = new ImagesRepository();
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

        } else if (req.method == 'DELETE') {

        } else {
            res.statusCode = 404;
            res.end(`Method not found for path ${req.url}`);
        }
    }

    async handlePost(req: IncomingMessage, res: ServerResponse) {
        let body = '';
        req.on('data', chunk => {
            body += chunk.toString();
        });

        req.on('end', async () => {
            console.log("Got all data");

            const postData = JSON.parse(body);
            const title = postData.title as string;
            const author = postData.author as string;
            const lyrics = postData.lyrics as string;
            const description = postData.description as string;
            let link = postData['youtube-link'] as string;
            const imageId = postData.imageId as number;

            console.log("Got all vars");

            // in case the url is like this
            link.replace('/watch?v=', '/embed/');

            const song = new Song(0, 0, imageId, author, title, link);
            console.log("Preparing song to add to repo with title " + song.title);

            const songId = await this.songRepository.addSongNoFk(song);
            console.log("Added song to repo with id " + songId);
            /// TODO(add userID)
            const userId = 1;
            const translation = new Translation(0, songId, userId,
                'english', description, lyrics, 0, 0, new Date());
            console.log("Preparing to add translation to repo");
            const translationId = await this.translationRepository.addTranslation(translation);
            console.log("Added translation to repo with id " + translationId);

            await this.songRepository.updatePrimaryTranslation(songId, translationId);

            console.log("Song added successfully");

            res.statusCode = 200;
            const data = {
                message: 'Song added successfully!',
                songId: songId,
                translationId: translationId
            }
            res.end(JSON.stringify(data));
        });
    }

    async handleGetById(req: IncomingMessage, res: ServerResponse) {
        if (!req.url) {
            res.statusCode = 500;
            res.end('Server error');
            return;
        }
        const songId: number = parseInt(req.url.split('/')[3]);
        console.log('Song id is ' + songId);

        const song: Song | null = await this.songRepository.getSongById(songId);
        if (song == null) {
            res.statusCode = 404;
            res.end('Song not found');
            return;
        }

        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify(song.toObject()));
    }

    async handleGetAll(req: IncomingMessage, res: ServerResponse) {
        const allSongs: Song[] = await this.songRepository.getAllSongs();
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify(allSongs));
    }

    async handleGetSongOld(req: IncomingMessage, res: ServerResponse) {
        if (!req.url) {
            res.statusCode = 500;
            res.end('Server error');
            return;
        }
        const translationId: number = parseInt(req.url.split('/')[2]);

        console.log("Translation id is " + translationId);

        const translation = await this.translationRepository.getTranslationById(translationId);
        if (translation === null) {
            res.statusCode = 404;
            res.end('Translation not found');
            return;
        }

        const song = await this.songRepository.getSongById(translation.songId);
        if (song === null) {
            res.statusCode = 405;
            res.end('Song not found');
            return;
        }

        const image = await this.imagesRepository.getImageById(song.imageId);
        if (image == null) {
            res.statusCode = 406;
            res.end('Image not found');
            return;
        }

        const data = {
            title: song.title,
            lyrics: translation.lyrics,
            description: translation.description,
            no_likes: translation.no_likes,
            no_comments: 0,
            no_views: translation.no_views,
            imageLink: image.link,
            songLink: song.link
        };

        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify(data));
    }
}