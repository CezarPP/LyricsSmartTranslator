import {IncomingMessage, ServerResponse} from 'http';
import {ImagesRepository} from '../repositories/ImagesRepository';
import {ImageModel} from '../models/ImageModel';

export class ImagesController {
    private imagesRepository: ImagesRepository;

    constructor() {
        this.imagesRepository = new ImagesRepository();
    }

    async addImage(req: IncomingMessage, res: ServerResponse) {
        let body = '';
        req.on('data', chunk => {
            body += chunk.toString();
        });

        req.on('end', async () => {
            const image = JSON.parse(body) as ImageModel;
            await this.imagesRepository.addImage(image);

            res.writeHead(200, {'Content-Type': 'application/json'});
            res.end(JSON.stringify({message: 'Image added successfully'}));
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
