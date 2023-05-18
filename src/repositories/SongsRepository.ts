import {Pool} from "pg";
import {Song} from "../models/Song";

export class SongsRepository {
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

    // returns the song id of the inserted song
    /**
     * Inserts a song without the primary_translation fk
     * @param song the song to be added, it doesn't add it with a primary_translation fk
     */
    async addSongNoFk(song: Song): Promise<number> {
        const query =
            'INSERT INTO songs(artist, title, image_id, link) VALUES($1, $2, $3, $4) RETURNING id';
        const values = [
            song.title,
            song.artist,
            song.imageId,
            song.link,
        ];

        try {
            const result = await this.db.query(query, values);
            return result.rows[0].id;
        } catch (error) {
            console.error(`Failed to insert song into database: ${error}`);
            throw error;
        }
    }

    async updatePrimaryTranslation(songId: number, primaryTranslationId: number): Promise<void> {
        const query = 'UPDATE songs SET primary_translation = $1 WHERE id = $2';
        const values = [primaryTranslationId, songId];

        try {
            await this.db.query(query, values);
        } catch (error) {
            console.error(`Failed to update primary translation: ${error}`);
            throw error;
        }
    }

    async getSongById(songId: number): Promise<Song | null> {
        const query = 'SELECT * FROM songs WHERE id = $1';
        const values = [songId];

        try {
            const result = await this.db.query(query, values);
            if (result.rows.length === 0) {
                return null;
            }
            const row = result.rows[0];
            return new Song(row.id, row.primary_translation, row.image_id, row.artist, row.title, row.link);

        } catch (error) {
            console.error(`Failed to fetch song: ${error}`);
            throw error;
        }
    }

    async getSongByName(songName: string): Promise<Song | null> {
        const query = 'SELECT * FROM songs WHERE title ILIKE $1';
        const values = [songName];

        try {
            const result = await this.db.query(query, values);
            if (result.rows.length === 0) {
                return null;
            }
            const row = result.rows[0];
            return new Song(row.id, row.primary_translation, row.image_id, row.artist, row.title, row.link);
        } catch (error) {
            console.error(`Failed to fetch song: ${error}`);
            throw error;
        }
    }

}