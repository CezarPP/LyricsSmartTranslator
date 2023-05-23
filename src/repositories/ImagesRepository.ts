import {Pool} from 'pg';
import {ImageModel} from '../models/ImageModel';
import {Storage} from '@google-cloud/storage';
import {v4 as uuidv4} from 'uuid';

export class ImagesRepository {
    private db: Pool;
    private storage: Storage;
    private bucketName = 'images-post';

    constructor() {
        this.storage = new Storage();
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

    async addImage(imageBuffer: Buffer): Promise<ImageModel | null> {
        const bucket = this.storage.bucket(this.bucketName);
        // either jpeg or png
        const ext = await this.getExtension(imageBuffer);
        if (ext == null) {
            console.log("Not a valid image extension");
            return null;
        }
        const contentType = `image/${ext}`;
        const filename = `image-${uuidv4()}.${ext}`;
        const file = bucket.file(filename);

        try {
            await file.save(imageBuffer, {
                contentType: contentType,
            });

            const imageUrl = `https://storage.googleapis.com/${bucket.name}/${filename}`;

            // Insert the image details into the database
            const query = 'INSERT INTO Images (link, extension) VALUES ($1, $2) RETURNING id';
            const values = [imageUrl, ext];
            const result = await this.db.query(query, values);

            const insertedId = result.rows[0].id;
            return new ImageModel(insertedId, imageUrl, ext);
        } catch (error) {
            console.error(`Failed to upload image to Cloud Storage: ${error}`);
            throw error;
        }
    }

    private async getExtension(buffer: Buffer): Promise<string | null> {
        // PNG: 137 80 78 71 13 10 26 10
        const pngBytes = [137, 80, 78, 71, 13, 10, 26, 10];
        const jpgStart = [255, 216];
        const jpgEnd = [255, 217];
        let isPng = true;
        for (let i = 0; i < pngBytes.length; i++) {
            if (pngBytes[i] !== buffer[i])
                isPng = false;
        }
        if (isPng)
            return 'png';
        let isJpg = true;
        for (let i = 0; i < jpgStart.length; i++)
            if (buffer[i] !== jpgStart[i]) {
                isJpg = false;
            }
        if (buffer[buffer.length - 1] !== jpgEnd[1] || buffer[buffer.length - 2] !== jpgEnd[0])
            isJpg = false;
        if (isJpg)
            return 'jpeg';
        return null;
    }

    async getImageById(id: number): Promise<ImageModel | null> {
        const query = 'SELECT * FROM images WHERE id = $1';
        const values = [id];
        const result = await this.db.query(query, values);

        if (result.rows.length === 0) {
            return null;
        }

        const row = result.rows[0];
        return new ImageModel(row.id, row.link, row.extension);
    }

    async getAllImages() {
        try {
            const result = await this.db.query('SELECT * FROM images');
            const rows = result.rows;
            const images: ImageModel[] = [];
            for (let i = 0; i < rows.length; i++) {
                images.push(new ImageModel(rows[i].id, rows[i].link, rows[i].ext));
            }
            return images;
        } catch (err) {
            console.error('Error executing query to get all images', err);
            return [];
        }
    }

}
