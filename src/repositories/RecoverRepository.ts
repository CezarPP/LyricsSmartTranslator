import {Pool} from "pg";
import {Recover} from "../models/Recover";
import {v4 as uuidv4} from 'uuid';

export class RecoverRepository{
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
    async addRecover(userId:number, email: string): Promise<Recover | null>{
        const token = uuidv4();

        const query = 'INSERT INTO RECOVER (user_id, email, token) VALUES ($1, $2, $3) RETURNING id';
        const values = [userId, email, token];
        try {
            const result = await this.db.query(query, values);
            const insertedId = result.rows[0].id;
            return new Recover(insertedId, userId, email, token);
        } catch(error) {
            console.error(`Failed to insert user into database: ${error}`);
            throw error;
        }
    }
    async getRecoverByEmail(email: string): Promise<Recover | null>{
        const query = 'SELECT * FROM recover WHERE email = $1';
        const values = [email];

        const result = await this.db.query(query, values);

        if (result.rows.length === 0) {
            return null;
        }
        const row = result.rows[0];
        return new Recover(row.id, row.user_id, row.email, row.token);
    }

    //used for /api/user/recover/token
    async getUserIdToken(token: string): Promise<number | null>{
        const query = 'SELECT user_id FROM recover WHERE token = $1';
        const values = [token];

        const result = await this.db.query(query, values);

        if(result.rows.length === 0){
            return null;
        }

        const row = result.rows[0];
        return row.user_id;
    }

    async deleteRecoverRequestUserId(userId: number): Promise<boolean> {
        const query = 'DELETE FROM recover WHERE user_id = $1';
        const values = [userId];
        try {
            const result = await this.db.query(query, values);
            return result.rowCount > 0; // Returns true if at least one row was affected
        } catch (error) {
            console.error(`Failed to delete recover from the database: ${error}`);
            throw error;
        }
    }
    async deleteRecoverRequestId(id: number): Promise<boolean>{
        const query = 'DELETE FROM recover WHERE id = $1';
        const values = [id];
        try {
            const result = await this.db.query(query, values);
            return result.rowCount > 0; // Returns true if at least one row was affected
        } catch (error) {
            console.error(`Failed to delete recover from the database: ${error}`);
            throw error;
        }
    }
    async getAllRecover(): Promise<Recover[]>{
        const query = 'SELECT * FROM recover';
        const result = await this.db.query(query);

        if(result.rows.length === 0)
            return [];

        return result.rows.map((row: any) => {
            return new Recover(row.id, row.user_id, row.email, row.token);
        });
    }
}