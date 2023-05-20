import { Pool } from 'pg';
import { User } from '../models/User';

export class UsersRepository {
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

    // async getUser(username: String, password: String): Promise<User | null> {
    //     const query = 'SELECT * FROM Users WHERE username = $1 AND password = $2';
    //     const values = [username, password];
    //     const result = await this.db.query(query, values);
    //
    //     if(result.rows.length === 0){
    //         return null;
    //     }
    //
    //     const row = result.rows[0];
    //     return new User(row.id, row.img_id, row.username, row.password);
    // }
    //

    async getUserByName(username: String): Promise<User| null>{
        const query = 'SELECT * FROM Users WHERE username = $1';
        const values = [username];
        const result = await this.db.query(query, values);

        if(result.rows.length === 0){
            return null;
        }
        const row = result.rows[0];
        return new User(row.id, row.img_id, row.username, row.password);
    }
    async getAllUsers(): Promise<User[] | null> {
        const query = 'SELECT * FROM Users';
        const result = await this.db.query(query);
        if (result.rows.length === 0) {
            return null;
        }
        const users: User[] = result.rows.map((row: any) => {
            return new User(row.id, row.img_id, row.username, row.password);
        });
        return users;
    }

    async getUserById(id: number): Promise<User | null>{
        const query = 'SELECT * FROM Users WHERE id = $1';
        const values = [id];
        const result = await this.db.query(query, values);

        if(result.rows.length === 0){
            return null;
        }
        const row = result.rows[0];
        return new User(row.id, row.img_id, row.username, row.password);
    }

    async addUser(username: String, password: String): Promise<number>{
        const query = 'INSERT INTO users(username, password, img_id) VALUES($1, $2, $3) RETURNING id';
        const values = [username, password, 1];
        try{
            const result = await this.db.query(query, values);
            return result.rows[0].id;
        }catch (error){
            console.error(`Failed to insert user into database: ${error}`);
            throw error;
        }
    }
    async updateUser(id: number, newUsername: string, newPassword: string, newImg_id: number): Promise<boolean> {
        const query = 'UPDATE Users SET username = $1, password = $2, img_id = $3 WHERE id = $4';
        const values = [newUsername, newPassword, newImg_id, id];
        try {
            const result = await this.db.query(query, values);
            return result.rowCount > 0; // Returns true if at least one row was affected
        } catch (error) {
            console.error(`Failed to update user in the database: ${error}`);
            throw error;
        }
    }
    async deleteUser(id: number): Promise<boolean> {
        const query = 'DELETE FROM Users WHERE id = $1';
        const values = [id];
        try {
            const result = await this.db.query(query, values);
            return result.rowCount > 0; // Returns true if at least one row was affected
        } catch (error) {
            console.error(`Failed to delete user from the database: ${error}`);
            throw error;
        }
    }
}