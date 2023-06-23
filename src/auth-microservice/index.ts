import {IncomingMessage, ServerResponse} from "http";
import {UsersController} from "./controllers/UsersController";
import {RecoverController} from "./controllers/RecoverController";
import {sendMessage} from "../util/sendMessage";

const http = require('http');

const userController = new UsersController();
const recoverController = new RecoverController();

const server = http.createServer((req: IncomingMessage, res: ServerResponse) => {
    if (req.url === undefined || req.method === undefined) {
        console.log("Undefined url or method");
        return;
    }
    const url = req.url;
    const method = req.method;

    if (url.startsWith('/api/user')) {
        userController
            .handleApiRequest(req, res)
            .then();
    } else if (url.startsWith('/api/recover')) {
        recoverController
            .handleApiRequest(req, res)
            .then();
    } else if (method === 'GET' && url && url === '/api/me') {
        userController
            .getLoggedUsersInfo(req, res)
            .then();
    } else if (method === 'GET' && url.startsWith('/profile')) {
        userController
            .getUserProfilePage(req, res)
            .then();
    } else {
        sendMessage(res, 404, 'Page not found');
    }
});

server.listen(8001, () => {
    console.log('Microservice is running on port 3000');
});