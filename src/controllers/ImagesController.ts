import {IncomingMessage, ServerResponse} from 'http';
import {ImagesRepository} from '../repositories/ImagesRepository';

export class ImagesController {
    private imagesRepository: ImagesRepository;

    constructor() {
        this.imagesRepository = new ImagesRepository();
    }

    async addImage(req: IncomingMessage, res: ServerResponse) {
        const chunks: Buffer[] = [];

        req.on('data', chunk => {
            chunks.push(chunk);
        });

        req.on('end', async () => {
            const buffer: Buffer = Buffer.concat(chunks);
            const imageId: number = await this.imagesRepository.addImage(buffer);
            console.log("Image id is " + imageId);

            res.writeHead(200, {'Content-Type': 'application/json'});
            res.end(JSON.stringify({message: 'Image added successfully', id: imageId}));
        });
    }

    async getImage(req: IncomingMessage, res: ServerResponse) {
        const url: URL = new URL(req.url as string, `http://${req.headers.host}`);
        const id: number = Number(url.searchParams.get('id'));

        if (isNaN(id)) {
            res.writeHead(400, {'Content-Type': 'application/json'});
            res.end(JSON.stringify({message: 'Invalid id parameter'}));
            return;
        }

        const image = await this.imagesRepository.getImage(id);

        if (image === null) {
            res.writeHead(404, {'Content-Type': 'application/json'});
            res.end(JSON.stringify({message: 'Image not found'}));
            return;
        }

        res.writeHead(200, {'Content-Type': 'application/json'});
        res.end(JSON.stringify(image));
    }
}
