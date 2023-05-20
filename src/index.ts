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
import {UsersController} from "./controllers/UsersController";
import {SongsController} from "./controllers/SongsController";
import {TranslationsController} from "./controllers/TranslationsController";

const http = require('http');

const server = http.createServer((req: IncomingMessage, res: ServerResponse) => {
    const url = req.url as string;
    const method = req.method;
    const imagesController = new ImagesController();
    const userController = new UsersController();
    const songsController = new SongsController();
    const translationsController = new TranslationsController();

    if (url.startsWith('/api/song')) {
        songsController
            .handleApiRequest(req, res)
            .then();
    } else if(url.startsWith('/api/translation')) {
        translationsController
            .handleApiRequest(req, res)
            .then();
    } else if(url.startsWith('api/user')){
        userController
            .handleApiRequest(req, res)
            .then();
    } else if (method === 'GET' && url.startsWith("/css") ||
        url.startsWith("/js") || url === '/' && url.startsWith('/img/')) {
        // for main page, css, js
        sendStaticFile(req, res)
            .then()
            .catch(() => console.log("Error sending static file"));
    } else if (method === 'POST' && url === '/image') {
        imagesController.addImage(req, res).then(() => console.log("Added image"));
    } else if (method == 'POST' && url == '/login') {
        userController.loginUser(req, res);
    } else if (method == 'POST' && url == '/register') {
        userController.registerUser(req, res);
    } else if (method == 'POST' && url == '/logout') {
        userController.logoutUser(req, res);
    } else if (method == 'GET' && url && url === '/profile') {
        userController.getUserPage(req, res);
    } else if (method == 'GET') {
        sendStaticFile(req, res)
            .then()
            .catch(() => console.log("Error sending static file"));
        // res.writeHead(404, {'Content-Type': 'text/plain'});
        // res.end('Not Found');
    }
});

server.listen(3000, () => {
    console.log('Server is running on port 3000');
});