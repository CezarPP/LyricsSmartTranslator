import * as formidable from "formidable";
import {SongsRepository} from "../repositories/SongsRepository";
import {TranslationsRepository} from "../repositories/TranslationsRepository";
import {Translation} from "../models/Translation";
import {Song} from "../models/Song";
import {IncomingMessage, ServerResponse} from "http";
import {ImagesRepository} from "../repositories/ImagesRepository";

export class SongsController {
    private songRepository: SongsRepository;
    private translationRepository: TranslationsRepository;
    private imagesRepository: ImagesRepository;

    constructor() {
        this.songRepository = new SongsRepository();
        this.translationRepository = new TranslationsRepository();
        this.imagesRepository = new ImagesRepository();
    }

    async handleSongSubmit(req: IncomingMessage, res: ServerResponse) {
        const form = new formidable.IncomingForm();
        form.parse(req, async (err, fields, files) => {
            if (err) {
                console.error('Error parsing form data:', err);
                res.statusCode = 500;
                res.end('Server error');
                return;
            }

            console.log('Received form data:', fields);

            const title = fields['title'] as string;
            console.log("Server the title of the song is " + title);
            const author = fields['author'] as string;
            console.log("Server the author of the song is " + author);
            const lyrics = fields['lyrics'] as string;
            const description = fields['description'] as string;
            const link = fields['youtube-link'] as string;
            const imageId = parseInt(fields['image-id'] as string, 10);

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

            console.log("Updated primary translation");

            console.log("Song added successfully");

            res.statusCode = 200;
            res.end('Song added successfully!');
        });
    }

    async handleGetSong(req: IncomingMessage, res: ServerResponse) {
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
        console.log("Description is " + translation.lyrics);

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