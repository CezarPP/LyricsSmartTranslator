import {IncomingMessage, ServerResponse} from 'http';
import {ImagesRepository} from '../repositories/ImagesRepository';

export class ImagesController {
    private imagesRepository: ImagesRepository;

    constructor() {
        this.imagesRepository = new ImagesRepository();
    }

    async addImage(req: IncomingMessage, res: ServerResponse): Promise<void> {
        let body = '';

        req.on('data', chunk => {
            body += chunk.toString();
        });

        req.on('end', async () => {
            const bodyObject = JSON.parse(body);
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

    /*    async getImage(req: IncomingMessage, res: ServerResponse) {
            if (!req.url) {
                res.writeHead(400, {'Content-Type': 'application/json'});
                res.end(JSON.stringify({message: 'Invalid URL'}));
                return;
            }

            const id: number = parseInt(req.url.split('/')[2]);
            console.log("Image id for getImage " + id);

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

            res.writeHead(200, {
                'Content-Type': 'image/jpeg'
            });
            res.end(image.img);
        }*/
}
