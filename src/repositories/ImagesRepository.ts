import {Pool} from 'pg';
import {ImageModel} from '../models/ImageModel';

export class ImagesRepository {
    private db: Pool;

    constructor() {
        this.db = new Pool({
            user: 'ionut',
            host: 'dpg-chf53k2k728trctjdjtg-a',
            database: 'postdb_r5n0',
            password: 'WbYko7SeIKZW1Ao1ISubLFZplAJEG4nA',
            port: 5432,
        });
    }

    async addImage(image: ImageModel): Promise<void> {
        const query = 'INSERT INTO Images(id, img) VALUES($1, $2)';
        const values = [image.id, image.img];
        await this.db.query(query, values);
    }

    async getImage(id: number): Promise<ImageModel | null> {
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
