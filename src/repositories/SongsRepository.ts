import {Pool} from "pg";
import {Song} from "../models/Song";
import fs from "fs";

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
            song.artist,
            song.title,
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

    async getAllSongTitles(): Promise<string[]> {
        const query = 'SELECT * FROM songs';

        try {
            const result = await this.db.query(query);
            let songs: string[] = [];
            for (let i = 0; i < result.rows.length; i++)
                songs.push(result.rows[i].title);
            return songs;
        } catch (error) {
            console.error(`Failed to fetch song: ${error}`);
            throw error;
        }
    }

    async getAllSongs(): Promise<Song[]> {
        const query = 'SELECT * FROM songs';
        try {
            const result = await this.db.query(query);
            let songs: Song[] = [];
            for (let i = 0; i < result.rows.length; i++) {
                const song = result.rows[i];
                songs.push(new Song(song.id, song.primary_translation, song.image_id, song.artist, song.title, song.link));
            }
            return songs;
        } catch (error) {
            console.error(`Failed to fetch all songs: ${error}`);
            throw error;
        }
    }

    async deleteSong(songId: number) {
        try {
            const result = await this.db.query('DELETE FROM songs WHERE id = $1', [songId]);
            console.log('Song deleted successfully');
        } catch (err) {
            console.error('Error executing query to delete song ', err);
        }
    }

    async updateSong(songId: Number, newArtist: string, newTitle: string, newLink: string) {
        try {
            const result = await this.db.query('UPDATE Songs SET artist = $1, title = $2, link = $3 WHERE id = $4', [newArtist, newTitle, newLink, songId]);
            console.log('Song updated successfully');
        } catch (err) {
            console.error('Error executing query', err);
        }
    }
    async updateRSSFeed(){
        try{
            const queryResult = await this.db.query('SELECT generate_rss_feed();');

            const rssFeed = queryResult.rows[0].generate_rss_feed;
            console.log(rssFeed);

            fs.writeFileSync('src/public/assets/pages/feed.xml', rssFeed);

            console.log("ok");
        } catch(err) {
            console.error('Error updating RSS', err);
        }
    }
}