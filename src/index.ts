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

const http = require('http');

const server = http.createServer((req: IncomingMessage, res: ServerResponse) => {
    const url = req.url as string;
    const method = req.method;
    let imagesController = new ImagesController();
    let userController = new UsersController();

    if(method === 'GET' && url.startsWith("/css") || url.startsWith("/js") || url === '/') {
        // for main page, css and js
        sendStaticFile(req, res)
            .then(() => console.log("Sent static file"))
            .catch(() => console.log("Error sending static file"));
    } else if (method === 'POST' && url === '/image') {
        imagesController.addImage(req, res).then(() => console.log("Added image"));
    } else if (method === 'GET' && url && url.startsWith('/image/')) {
        imagesController.getImage(req, res).then(() => "imagesController got image");
    } else if (method == 'POST' && url == '/login') {
        userController.loginUser(req, res);
    } else if (method == 'POST' && url == '/register') {
        userController.registerUser(req, res);
    } else if (method == 'GET' && url && url.startsWith('/profile/')) {
        userController.getUserProfile(req, res);
    } else if (method == 'GET') {
        sendStaticFile(req, res)
            .then(() => console.log("Sent static file"))
            .catch(() => console.log("Error sending static file"));
        // res.writeHead(404, {'Content-Type': 'text/plain'});
        // res.end('Not Found');
    } else if (method == 'POST' && url == "/submit-song.html") {
        console.log("Submitting song");
        const songsController = new SongsController();
        songsController.handleSongSubmit(req, res).then(r => console.log("Songs controller added song"));
    }
});

server.listen(3000, () => {
    console.log('Server is running on port 3000');
});