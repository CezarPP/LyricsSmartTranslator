import * as formidable from "formidable";
import {SongsRepository} from "../repositories/SongsRepository";
import {TranslationsRepository} from "../repositories/TranslationsRepository";
import {Translation} from "../models/Translation";
import {Song} from "../models/Song";
import {IncomingMessage, ServerResponse} from "http";

export class SongsController {
    private songRepository: SongsRepository;
    private translationRepository: TranslationsRepository;

    constructor() {
        this.songRepository = new SongsRepository();
        this.translationRepository = new TranslationsRepository();
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
            const author = fields['author'] as string;
            const lyrics = fields['lyrics'] as string;
            const description = fields['description'] as string;
            const link = fields['youtube-link'] as string;
            const imageId = parseInt(fields['image-id'] as string, 10);

            const song = new Song(0, 0, imageId, author, title, link);
            console.log("Preparing song to add to repo");
            const songId = await this.songRepository.addSongNoFk(song);
            console.log("Added song to repo with id " + songId);
            /// TODO(add userID)
            const userId = 1;
            const translation = new Translation(0, songId, userId,
                'English', description, lyrics, 0, 0, new Date());
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
}