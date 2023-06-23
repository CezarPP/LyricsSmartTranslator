import {Pool} from 'pg';
import {User} from '../../models/User';
import {Song} from "../../models/Song";

export class UsersRepository {
    private db: Pool;
    private cache: any;

    constructor() {
        this.db = new Pool({
            user: 'postgres',
            host: 'post-translations.czgheu3bschd.eu-north-1.rds.amazonaws.com',
            database: 'postgres',
            password: process.env.AWSPASSWORD,
            port: 5432,
            ssl: {
                rejectUnauthorized: false
            }
        });
        this.cache = {};
    }

    invalidateCache() {
        this.cache = {};
    }

    async getUserByName(username: String): Promise<User | null> {
        const query = 'SELECT * FROM users WHERE username = $1';
        const values = [username];
        const result = await this.db.query(query, values);

        if (result.rows.length === 0) {
            return null;
        }
        const row = result.rows[0];
        return new User(row.id, row.img_id, row.username, row.password, row.email);
    }

    async getUserByEmail(email: String): Promise<User | null> {
        const query = 'SELECT * FROM users WHERE email = $1';
        const values = [email];
        const result = await this.db.query(query, values);

        if (result.rows.length === 0) {
            return null;
        }
        const row = result.rows[0];
        return new User(row.id, row.img_id, row.username, row.password, row.email);
    }

    async getMostActiveUsers(maxRows: number) {
        const cacheKey = `mostActive-${maxRows}`;

        if (this.cache[cacheKey]) {
            return this.cache[cacheKey];
        }

        try {
            const result
                = await this.db.query('SELECT * FROM get_most_active_users($1);', [maxRows]);

            const users: User[] = [];
            const rows = result.rows;
            for (let i = 0; i < rows.length; i++) {
                users.push(new User(rows[i].user_id, rows[i].img_id, rows[i].username, rows[i].activity_count, rows[i].email));
            }

            this.cache[cacheKey] = users;

            return users;
        } catch (err) {
            console.error('Error executing query ' + err);
            throw err;
        }
    }

    async getAllUsers(): Promise<User[]> {
        const query = 'SELECT * FROM users';
        const result = await this.db.query(query);
        if (result.rows.length === 0) {
            return [];
        }
        return result.rows.map((row: any) => {
            return new User(row.id, row.img_id, row.username, row.password, row.email);
        });
    }

    async getUserById(id: number): Promise<User | null> {
        const query = 'SELECT * FROM users WHERE id = $1';
        const values = [id];
        const result = await this.db.query(query, values);

        if (result.rows.length === 0) {
            return null;
        }
        const row = result.rows[0];
        return new User(row.id, row.img_id, row.username, row.password, row.email);
    }

    async addUser(username: String, password: String, email: String): Promise<number> {
        this.invalidateCache();

        const query = 'INSERT INTO users(username, password, img_id, email) VALUES($1, $2, $3, $4) RETURNING id';
        const values = [username, password, 1, email];
        try {
            const result = await this.db.query(query, values);
            return result.rows[0].id;
        } catch (error) {
            console.error(`Failed to insert user into database: ${error}`);
            throw error;
        }
    }

    async updateUser(id: number, newUsername: string, newPassword: string, newEmail: string, newImgId: number): Promise<boolean> {
        this.invalidateCache();

        const query = 'UPDATE users SET username = $1, password = $2, img_id = $3, email = $4 WHERE id = $5';
        const values = [newUsername, newPassword, newImgId, newEmail, id];
        try {
            const result = await this.db.query(query, values);
            return result.rowCount > 0; // Returns true if at least one row was affected
        } catch (error) {
            console.error(`Failed to update user in the database: ${error}`);
            throw error;
        }
    }

    async deleteUser(id: number): Promise<boolean> {
        this.invalidateCache();

        const query = 'DELETE FROM users WHERE id = $1';
        const values = [id];
        try {
            const result = await this.db.query(query, values);
            return result.rowCount > 0; // Returns true if at least one row was affected
        } catch (error) {
            console.error(`Failed to delete user from the database: ${error}`);
            throw error;
        }
    }

    async getNumberOfAnnotations(userId: number): Promise<number> {
        const query = 'SELECT count_user_annotations($1) AS count';
        const values = [userId];

        try {
            const result = await this.db.query(query, values);
            return result.rows[0].count;
        } catch (error) {
            console.error(`Failed to get the number of annotations: ${error}`);
            throw error;
        }
    }

    async getNumberOfComments(userId: number): Promise<number> {
        const query = 'SELECT count_user_comments($1) AS count';
        const values = [userId];

        try {
            const result = await this.db.query(query, values);
            return result.rows[0].count;
        } catch (error) {
            console.error(`Failed to get the number of comments: ${error}`);
            throw error;
        }
    }

    async getNumberOfTranslations(userId: number): Promise<number> {
        const query = 'SELECT count_user_translations($1) AS count';
        const values = [userId];

        try {
            const result = await this.db.query(query, values);
            return result.rows[0].count;
        } catch (error) {
            console.error(`Failed to get the number of translations: ${error}`);
            throw error;
        }
    }

    async getRecommendations(userId: number, limit: number): Promise<Song[]> {
        try {
            const res =
                await this.db.query('SELECT * FROM get_combined_recommendations($1, $2)',
                    [userId, limit]);

            return res.rows.map(row =>
                new Song(row.song_id, row.primary_translation, row.image_id, row.artist, row.title, row.link));
        } catch (error) {
            console.error(error);
            throw error;
        }
    }

    async changePassword(userId: number, newPassword: string): Promise<boolean> {
        const query = 'UPDATE users SET password = $1 WHERE id = $2';
        const values = [newPassword, userId];
        try {
            const result = await this.db.query(query, values);
            return result.rowCount > 0; // Returns true if at least one row was affected
        } catch (error) {
            console.error(`Failed to update user in the database: ${error}`);
            throw error;
        }
    }
}