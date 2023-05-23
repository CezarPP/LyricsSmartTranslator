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
            'INSERT INTO translations(song_id, user_id, description, lyrics, no_views, time, language) VALUES($1, $2, $3, $4, $5, $6, $7) RETURNING id';
        const values = [
            translation.songId, translation.userId, translation.description,
            translation.lyrics, translation.no_views,
            translation.time, translation.language
        ];

        try {
            const result = await this.db.query(query, values);
            return result.rows[0].id;
        } catch (error) {
            console.error(`Failed to insert translation into database: ${error}`);
            throw error;
        }
    }

    async getTranslationById(translationId: number): Promise<Translation | null> {
        const query = 'SELECT * FROM translations WHERE id = $1';
        const values = [translationId];

        try {
            const result = await this.db.query(query, values);
            if (result.rows.length === 0) {
                return null;
            }

            const row = result.rows[0];
            return new Translation(row.id, row.song_id, row.user_id,
                row.language, row.description, row.lyrics,
                row.no_views, row.time);
        } catch (error) {
            console.error(`Failed to fetch translation: ${error}`);
            throw error;
        }
    }

    async getTranslationByNameAndLanguage(songName: string, language: string): Promise<Translation | null> {
        const query = `SELECT t.*
                       FROM translations t
                                INNER JOIN songs s ON t.song_id = s.id
                       WHERE s.title ILIKE $1
                         AND t.language ILIKE $2`;
        const values = [songName, language];

        try {
            const result = await this.db.query(query, values);
            if (result.rows.length === 0) {
                return null;
            }

            const row = result.rows[0];
            return new Translation(
                row.id, row.song_id, row.user_id,
                row.description, row.lyrics, row.no_views,
                row.time, row.language);
        } catch (error) {
            console.error(`Failed to fetch translation: ${error}`);
            throw error;
        }
    }

    async updateTranslation(translationId: number, newDescription: string, newLyrics: string) {
        try {
            const result = await this.db.query('UPDATE Translations SET description = $1, lyrics = $2 WHERE id = $3', [newDescription, newLyrics, translationId]);
            console.log('Translation updated successfully');
        } catch (err) {
            console.error('Error executing query to update a translation', err);
        }
    }

    async deleteTranslation(translationId: number) {
        try {
            const result = await this.db.query('DELETE FROM translations WHERE id = $1', [translationId]);
            console.log('Translation deleted successfully');
        } catch (err) {
            console.error('Error executing query to delete translation ', err);
        }
    }
}