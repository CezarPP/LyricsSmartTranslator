/*import http from 'http';

const port: number = 3000;

const index: http.Server = http.createServer((req: http.IncomingMessage, res: http.ServerResponse) => {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'text/plain');
    res.end('Hello World\n');
});

index.listen(port, () => {
    console.log(`Server running`);
});
*/

import {IncomingMessage, ServerResponse} from "http";
import {ImagesController} from './controllers/ImagesController';
import {sendStaticFile} from "./util/sendStaticFile";

const http = require('http');

const server = http.createServer((req: IncomingMessage, res: ServerResponse) => {
    const url = req.url;
    const method = req.method;
    let imagesController = new ImagesController();
    if (method === 'POST' && url === '/image') {
        imagesController.addImage(req, res);
    } else if (method === 'GET' && url && url.startsWith('/image/')) {
        imagesController.getImage(req, res);
    } else if (method == 'GET') {
        sendStaticFile(req, res)
            .then(() => console.log("Sent static file"))
            .catch(() => console.log("Error sending static file"));
        // res.writeHead(404, {'Content-Type': 'text/plain'});
        // res.end('Not Found');
    }
});

server.listen(3000, () => {
    console.log('Server is running on port 3000');
});