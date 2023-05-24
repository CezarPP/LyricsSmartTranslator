import {IncomingMessage, ServerResponse} from "http";
import {ImagesController} from './controllers/ImagesController';
import {sendStaticFile} from "./util/sendStaticFile";
import {UsersController} from "./controllers/UsersController";
import {SongsController} from "./controllers/SongsController";
import {TranslationsController} from "./controllers/TranslationsController";
import {CommentsController} from "./controllers/CommentsController";
import {sendFile} from "./util/sendFile";
import {StatsController} from "./controllers/StatsController";
import {AnnotationsController} from "./controllers/AnnotationsController";

const http = require('http');

const server = http.createServer((req: IncomingMessage, res: ServerResponse) => {
    if (req.url === undefined || req.method === undefined) {
        console.log("Undefined url or method");
        return;
    }
    const url = req.url;
    const method = req.method;
    const imagesController = new ImagesController();
    const userController = new UsersController();
    const songsController = new SongsController();
    const translationsController = new TranslationsController();
    const statsController = new StatsController();
    const commentsController = new CommentsController();
    const annotationsController = new AnnotationsController();

    if (url.startsWith('/api/song')) {
        songsController
            .handleApiRequest(req, res)
            .then();
    } else if (url.startsWith('/api/translation')) {
        translationsController
            .handleApiRequest(req, res)
            .then();
    } else if (url.startsWith('/api/user')) {
        userController
            .handleApiRequest(req, res)
            .then();
    } else if (url.startsWith('/api/image')) {
        imagesController
            .handleApiRequest(req, res)
            .then();
    } else if (url.startsWith('/api/comments')) {
        commentsController
            .handleApiRequest(req, res)
            .then();
    } else if (url.startsWith('/api/annotations')) {
        annotationsController
            .handleApiRequest(req, res)
            .then();
    } else if (method === 'GET' && url && url === '/api/me') {
        userController
            .getLoggedUserUsername(req, res)
            .then();
    } else if (method == 'GET' && url && url.startsWith('/api/stats')) {
        statsController
            .handleApiRequest(req, res)
            .then();
    } else if (method === 'GET' && url.startsWith('/profile')) {
        userController
            .getUserProfilePage(req, res)
            .then();
    } else if (method === 'GET' && url.startsWith("/css") ||
        url.startsWith("/js") || url === '/' && url.startsWith('/img/')) {
        // for main page, css, js
        sendStaticFile(req, res)
            .then()
            .catch(() => console.log("Error sending static file"));
    } else if (method == 'GET' && url.startsWith('/add-translation/')) {
        sendFile(req, res,
            '../public/assets/pages/add-translation.html', 'text/html')
            .then();
    } else if (method == 'POST' && url == '/login') {
        userController.loginUser(req, res);
    } else if (method == 'POST' && url == '/register') {
        userController.registerUser(req, res);
    } else if (method == 'POST' && url == '/logout') {
        userController.logoutUser(req, res);
    } else if (method == 'GET') {
        sendStaticFile(req, res)
            .then()
            .catch(() => console.log("Error sending static file"));
    }
});

server.listen(3000, () => {
    console.log('Server is running on port 3000');
});