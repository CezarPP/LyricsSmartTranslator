import {Pool} from "pg"
import {Comment} from "../models/Comment";

export class CommentsRepository {
    private db: Pool;

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
    }
    async addComment(comment: Comment): Promise<number> {
        const query = `INSERT INTO comments (user_id, translation_id, content) VALUES ($1, $2, $3) RETURNING id;`;
        const values = [comment.userId, comment.translationId, comment.content];
        try {
            const result = await this.db.query(query, values);
            return result.rows[0].id;
        } catch (error) {
            console.error(`Failed to insert comment into database: ${error}`);
            throw error;
        }
    }
    async getCommentById(id: number) : Promise<Comment | null>{
        const query = 'SELECT * FROM comments WHERE id = $1';
        const values = [id];
        const result = await this.db.query(query, values);

        if(result.rows.length === 0){
            return null;
        }
        const row = result.rows[0];
        return new Comment(row.id, row.user_id, row.translation_id, row.content);
    }
    async getAllComments(): Promise<Comment[]> {
        const query = 'SELECT * FROM comments ORDER BY id ASC';
        try{
            const result = await this.db.query(query);
            if(result.rows.length === 0){
                return [];
            }
            const comments: Comment[] = result.rows.map((row: any) => {
                return new Comment(row.id, row.user_id, row.translation_id, row.content);
            });
            return comments;
        } catch (error) {
            console.error(`Failed to retrieve comments from the database: ${error}`);
            throw error;
        }
    }

    async getCommentsByTranslationId(translationId: number): Promise<Comment[]> {
        const query = `SELECT * FROM comments WHERE translation_id = $1 ORDER BY id ASC`;
        const values = [translationId];
        try {
            const result = await this.db.query(query, values);
            if (result.rows.length === 0) {
                return [];
            }
            const comments: Comment[] = result.rows.map((row: any) => {
                return new Comment(row.id, row.user_id, row.translation_id, row.content);
            });
            return comments;
        } catch (error) {
            console.error(`Failed to retrieve comments from the database: ${error}`);
            throw error;
        }
    }

    async updateComment(id: number, newContent: String){
        const query = 'UPDATE comments SET content = $1 WHERE id = $2';
        const values = [newContent, id];
        try {
            const result = await this.db.query(query, values);
            return result.rowCount > 0; // Returns true if at least one row was affected
        } catch (error) {
            console.error(`Failed to update comment in the database: ${error}`);
            throw error;
        }
    }
    async deleteComment(id: number): Promise<boolean>{
        const query = 'DELETE FROM comments WHERE id = $1';
        const values = [id];
        try{
            const result = await this.db.query(query, values);
            return result.rowCount > 0;
        } catch (error) {
            console.error(`Failed to delete comment from the database: ${error}`);
            throw error;
        }
    }
}