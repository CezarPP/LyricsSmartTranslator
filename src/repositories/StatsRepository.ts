import {Pool, QueryResult} from "pg";
import {User} from "../models/User";

export class StatsRepository {
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

    async getMostActiveUsers(maxRows: number) {
        try {
            const result
                = await this.db.query('SELECT * FROM get_most_active_users($1);', [maxRows]);

            const users: User[] = [];
            const rows = result.rows;
            for (let i = 0; i < rows.length; i++) {
                users.push(new User(rows[i].user_id, rows[i].img_id, rows[i].username, rows[i].activity_count));
            }
            return users;
        } catch (err) {
            console.error('Error executing query ' + err);
            throw err;
        }
    }

    async getNewestSongs(maxRows: number) {
        try {
            const result = await this.db.query('SELECT * FROM get_newest_songs($1);', [maxRows]);
            return await this.getSongsFromResult(result);
        } catch (err) {
            console.error('Error executing query for newest songs', err);
            return [];
        }
    }

    async getMostCommentedSongs(maxRows: number) {
        try {
            const result = await this.db.query('SELECT * FROM get_most_commented_songs($1);', [maxRows]);
            return await this.getSongsFromResult(result);
        } catch (err) {
            console.error('Error executing query for most commented songs', err);
            return [];
        }
    }

    async getMostViewedSongs(maxRows: number) {
        try {
            const result = await this.db.query('SELECT * FROM get_most_viewed_songs($1);', [maxRows]);
            return await this.getSongsFromResult(result);
        } catch (err) {
            console.error('Error executing query for most viewed songs', err);
            return [];
        }
    }


    async getSongsFromResult(result: QueryResult) {
        const songs: Object[] = [];
        const rows = result.rows;
        for (let i = 0; i < rows.length; i++) {
            songs.push({
                songId: rows[i].song_id,
                artist: rows[i].artist,
                title: rows[i].title,
                translationId: rows[i].translation_id
            });
        }
        return songs;
    }
}