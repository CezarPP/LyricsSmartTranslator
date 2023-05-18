import {Pool} from "pg";
import {Translation} from "../models/Translation";

export class TranslationsRepository {
    private db: Pool;

    constructor() {
        this.db = new Pool({
            user: 'ionut',
            host: 'dpg-chf53k2k728trctjdjtg-a.frankfurt-postgres.render.com',
            database: 'postdb_r5n0',
            password: 'WbYko7SeIKZW1Ao1ISubLFZplAJEG4nA',
            port: 5432,
            ssl: {
                rejectUnauthorized: false
            }
        });
    }

    async addTranslation(translation: Translation): Promise<number> {
        const query =
            'INSERT INTO translations(song_id, user_id, description, lyrics, no_views, no_likes, time, language) VALUES($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id';
        const values = [
            translation.songId,
            translation.userId,
            translation.description,
            translation.lyrics,
            translation.no_views,
            translation.no_likes,
            translation.time,
            translation.language
        ];

        try {
            const result = await this.db.query(query, values);
            return result.rows[0].id;
        } catch (error) {
            console.error(`Failed to insert translation into database: ${error}`);
            throw error;
        }
    }

}