import {Pool} from "pg"
import {Comment} from "../models/Comment";

export class CommentsRepository {
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
    async getCommentsByTranslationId(translationId: number): Promise<Comment[] | null> {
        const query = `SELECT * FROM comments WHERE translation_id = $1;`;
        const values = [translationId];
        try {
            const result = await this.db.query(query, values);
            if (result.rows.length === 0) {
                return null;
            }
            const comments: Comment[] = result.rows.map((row: any) => {
                return new Comment(row.id, row.userId, row.translationId, row.content);
            });
            return comments;
        } catch (error) {
            console.error(`Failed to retrieve comments from the database: ${error}`);
            throw error;
        }
    }
}