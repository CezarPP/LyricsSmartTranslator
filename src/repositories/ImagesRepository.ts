import {Pool} from 'pg';
import {ImageModel} from '../models/ImageModel';

export class ImagesRepository {
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

    async addImage(imageData: Buffer): Promise<number> {
        const query = 'INSERT INTO images(img) VALUES($1) RETURNING id';
        const values = [imageData];

        try {
            const result = await this.db.query(query, values);
            return result.rows[0].id;
        } catch (error) {
            console.error(`Failed to insert image into database: ${error}`);
            throw error;
        }
    }

    async getImage(id: number): Promise<ImageModel | null> {
        try {
            await this.db.connect();
        } catch (error) {
            console.error('Failed connection');
            throw error;
        }
        const query = 'SELECT * FROM Images WHERE id = $1';
        const values = [id];
        const result = await this.db.query(query, values);

        if (result.rows.length === 0) {
            return null;
        }

        const row = result.rows[0];
        return new ImageModel(row.id, row.img);
    }
}
