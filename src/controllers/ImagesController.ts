import {IncomingMessage, ServerResponse} from 'http';
import {ImagesRepository} from '../repositories/ImagesRepository';
import assert from "assert";

export class ImagesController {
    private imagesRepository: ImagesRepository;

    constructor() {
        this.imagesRepository = new ImagesRepository();
    }

    async handleApiRequest(req: IncomingMessage, res: ServerResponse) {
        if (req.method == 'GET') {
            assert(req.url);
            if (req.url.split('/').length > 3) {
                await this.handleGetById(req, res);
            } else {
                await this.handleGetAll(req, res);
            }
        } else if (req.method == 'POST') {
            await this.handlePost(req, res);
        } else {
            res.statusCode = 405;
            res.end(`Method not allowed for path ${req.url}`);
        }
    }

    async handlePost(req: IncomingMessage, res: ServerResponse): Promise<void> {
        let body = '';

        req.on('data', chunk => {
            body += chunk.toString();
        });

        req.on('end', async () => {
            let bodyObject;
            try {
                bodyObject = JSON.parse(body);
            } catch (e) {
                console.log('Error parsing image json ' + e);
                res.statusCode = 400;
                res.end('Invalid JSON');
                return;
            }
            if (bodyObject.image === undefined) {
                res.statusCode = 400;
                res.end('Invalid JSON');
                return;
            }
            const imageBuffer = Buffer.from(bodyObject.image, 'base64');

            const image = await this.imagesRepository.addImage(imageBuffer);
            if (image == null) {
                res.writeHead(500, {'Content-Type': 'application/json'});
                res.end(JSON.stringify({message: 'Not a valid image'}));
                return;
            }

            console.log("Image link is " + image.link);

            res.writeHead(200, {'Content-Type': 'application/json'});
            res.end(JSON.stringify({
                message: 'Image added successfully',
                id: image.id, link: image.link, extension: image.ext
            }));
        });
    }

    async handleGetById(req: IncomingMessage, res: ServerResponse) {
        if (!req.url) {
            res.writeHead(400, {'Content-Type': 'application/json'});
            res.end(JSON.stringify({message: 'Invalid URL'}));
            return;
        }
        const id: number = parseInt(req.url.split('/')[3]);
        console.log("Image id for getImage " + id);

        if (isNaN(id)) {
            res.writeHead(400, {'Content-Type': 'application/json'});
            res.end(JSON.stringify({message: 'Invalid image id'}));
            return;
        }

        const image = await this.imagesRepository.getImageById(id);

        if (image === null) {
            res.writeHead(404, {'Content-Type': 'application/json'});
            res.end(JSON.stringify({message: 'Image not found'}));
            return;
        }
        res.writeHead(200, {'Content-Type': 'application/json'});
        res.end(JSON.stringify({
            message: 'Image retrieved successfully',
            link: image.link
        }));
    }

    async handleGetAll(req: IncomingMessage, res: ServerResponse) {
        const images = await this.imagesRepository.getAllImages();
        res.writeHead(200, {'Content-Type': 'application/json'});
        res.end(JSON.stringify(images));
    }
}
