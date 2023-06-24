import {IncomingMessage, ServerResponse} from "http";
import {ImagesController} from './controllers/ImagesController';
import {sendStaticFile} from "./util/sendStaticFile";
import {SongsController} from "./controllers/SongsController";
import {TranslationsController} from "./controllers/TranslationsController";
import {CommentsController} from "./controllers/CommentsController";
import {sendFile} from "./util/sendFile";
import {AnnotationsController} from "./controllers/AnnotationsController";
import {sendMessage} from "./util/sendMessage";
import {sendUpdatesPage} from "./util/sendUpdatesPage";
import {sendRecoveriesPage} from "./util/sendRecoveriesPage";
import {ExportController} from "./controllers/ExportController"
import {ExportAllSongsController} from "./controllers/ExportAllSongsController"
import {forwardRequestAuth} from "./util/forwardRequestAuth";
import {startAuthMicroservice} from "./util/startAuthMicroservice";


const http = require('http');

const imagesController = new ImagesController();
const songsController = new SongsController();
const translationsController = new TranslationsController();
const commentsController = new CommentsController();
const annotationsController = new AnnotationsController();
const exportController = new ExportController();
const exportAllSongsController = new ExportAllSongsController();

const server = http.createServer((req: IncomingMessage, res: ServerResponse) => {
    if (req.url === undefined || req.method === undefined) {
        console.log("Undefined url or method");
        return;
    }
    const url = req.url;
    const method = req.method;

    if (url.startsWith('/api/songs')) {
        songsController
            .handleApiRequest(req, res)
            .then();
    } else if (url.startsWith('/api/translations')) {
        translationsController
            .handleApiRequest(req, res)
            .then();
    } else if (url.startsWith('/api/user') ||
        (method === 'GET' && url && url === '/api/me') ||
        (method === 'GET' && url.startsWith('/profile')) ||
        url.startsWith('/api/recover')) {
        forwardRequestAuth(req, res)
            .then();
    } else if (url.startsWith('/api/images')) {
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
    } else if (method === 'GET' && url.startsWith("/css") ||
        url.startsWith("/js") || url === '/' && url.startsWith('/img/')) {
        // for main page, css, js
        sendStaticFile(req, res)
            .then()
            .catch(() => console.log("Error sending static file"));
    } else if (method === 'GET' && url.startsWith('/add-translation/')) {
        sendFile(req, res,
            '../public/assets/pages/add-translation.html', 'text/html')
            .then();
    } else if (method === 'GET' && (url === '/updates' || url === '/updates.html')) {
        sendUpdatesPage(req, res)
            .then();
    } else if (method === 'GET' && (url === '/recoveries' || url === '/recoveries.html')) {
        sendRecoveriesPage(req, res)
            .then();
    } else if (method == 'POST' && url == '/export/tumblr') {
        exportController
            .handleTumblrExport(req, res)
            .then();
    } else if (method == 'GET' && url.startsWith('/export-data/tumblr')) {
        exportController
            .handleTumblrExportData(req, res)
            .then();
    } else if (method == 'POST' && url == '/export/wordpress') {
        exportController
            .handleWordpressExport(req, res)
            .then();
    } else if (method == 'GET' && url.startsWith('/export-data/wordpress')) {
        exportController
            .handleWordpressExportData(req, res)
            .then();
    } else if (method == 'GET' && url == '/all-songs') {
        exportAllSongsController
            .exportAllSongs(req, res)
            .then();
    } else if (method === 'GET') {
        sendStaticFile(req, res)
            .then()
            .catch(() => console.log("Error sending static file"));
    } else {
        sendMessage(res, 404, 'Page not found');
    }
});

(async () => {
    await startAuthMicroservice();

    server.listen(8000, () => {
        console.log('Server is running on port 8000');
    });
})();
