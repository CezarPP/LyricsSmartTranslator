import {SongsRepository} from "../repositories/SongsRepository";
import {TranslationsRepository} from "../repositories/TranslationsRepository";
import {IncomingMessage, ServerResponse} from "http";
import * as formidable from "formidable";
import {Song} from "../models/Song";
import {Translation} from "../models/Translation";

export class TranslationsController {
    private songRepository: SongsRepository;
    private translationRepository: TranslationsRepository;

    constructor() {
        this.songRepository = new SongsRepository();
        this.translationRepository = new TranslationsRepository();
    }

    async handleTranslationSubmit(req: IncomingMessage, res: ServerResponse) {
        const form = new formidable.IncomingForm();
        form.parse(req, async (err, fields, files) => {
            if (err) {
                console.error('Error parsing form data:', err);
                res.statusCode = 500;
                res.end('Server error');
                return;
            }

            console.log('Received form data:', fields);

            const title = fields['song'] as string;
            const author = fields['author'] as string;
            const description = fields['translated-lyrics'] as string;
            const lyrics = fields['description'] as string;
            let language = fields['language'] as string;
            language = language.toLowerCase();

            const song = await this.songRepository.getSongByName(title);
            if (song == null) {
                console.log("Not found song to add translation to");
                res.statusCode = 500;
                res.end('Not a valid song');
                return;
            }
            const songId = song.id;
            let translation
                = await this.translationRepository.getTranslationByNameAndLanguage(title, language);
            if (translation !== null) {
                res.statusCode = 500;
                res.end('There exists a translation in this language for this song');
            }

            console.log("This is a new translation");

            /// TODO(add userID)
            const userId = 1;

            translation = new Translation(0, songId, userId,
                language, description, lyrics, 0, 0, new Date());

            console.log("Preparing to add translation to repo");
            const translationId = await this.translationRepository.addTranslation(translation);
            console.log("Added translation to repo with id " + translationId);

            console.log("Translation added successfully");

            res.statusCode = 200;
            res.end('Translation added successfully!');
        });
    }

}