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
    let imagesController = new ImagesController();
    let userController = new UsersController();
    let songsController = new SongsController();

    if (method === 'GET' && url.startsWith("/css") ||
        url.startsWith("/js") || url === '/') {
        // for main page, css, js
        sendStaticFile(req, res)
            .then(() => console.log("Sent static file"))
            .catch(() => console.log("Error sending static file"));
    } else if (method === 'POST' && url === '/image') {
        imagesController.addImage(req, res).then(() => console.log("Added image"));
    } else if (method === 'GET' && url && url.startsWith('/img')) {
        imagesController.getImage(req, res).then(() => "imagesController got image");
    } else if (method == 'POST' && url == '/login') {
        userController.loginUser(req, res);
    } else if (method == 'POST' && url == '/register') {
        userController.registerUser(req, res);
    } else if (method == 'POST' && url == '/logout'){
        userController.logoutUser(req, res);
    } else if (method == 'GET' && url && url==='/profile') {
        userController.getUserPage(req, res);
    } else if (method == 'GET' && url && url==='/stats'){
        userController.getUserStats(req, res);
    } else if (method == 'POST' && url && url.startsWith('/get-song-data/')) {
        console.log("Handling get song");
        songsController.handleGetSong(req, res)
            .then(() => console.log("Handled get song"));
    } else if (method == 'GET') {
        sendStaticFile(req, res)
            .then(() => console.log("Sent static file"))
            .catch(() => console.log("Error sending static file"));
        // res.writeHead(404, {'Content-Type': 'text/plain'});
        // res.end('Not Found');
    } else if (method == 'POST' && url == "/submit-song.html") {
        console.log("Submitting song");
        const songsController = new SongsController();
        songsController.handleSongSubmit(req, res).then(() => console.log("Songs controller added song"));
    } else if (method == 'POST' && url == '/submit-translation.html') {
        console.log("Submitting translation");
        const translationController = new TranslationsController();
        translationController.handleTranslationSubmit(req, res).then(() => console.log("Translation controller added song"))
    }
});

server.listen(3000, () => {
    console.log('Server is running on port 3000');
});