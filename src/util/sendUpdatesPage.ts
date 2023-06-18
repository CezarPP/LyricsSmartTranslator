import {IncomingMessage, ServerResponse} from "http";
import {UsersController} from "../controllers/UsersController";
import {sendNotFound} from "./sendNotFound";
import {sendFile} from "./sendFile";

export const sendUpdatesPage = async (req: IncomingMessage, res: ServerResponse) => {
    if (!req.url) {
        return;
    }
    const usersController = new UsersController();

    const user = usersController.authenticateUser(req);
    if (user !== 1) {
        await sendNotFound(req, res)
        return;
    }

    await sendFile(req, res, '../public/assets/pages/updates.html', 'text/html');
}
