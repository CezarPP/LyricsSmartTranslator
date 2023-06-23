import {IncomingMessage, ServerResponse} from "http";
import {sendNotFound} from "./sendNotFound";
import {sendFile} from "./sendFile";
import {authenticateUser} from "./authenticateUser";

export const sendRecoveriesPage = async (req: IncomingMessage, res: ServerResponse) => {
    if (!req.url) {
        return;
    }

    const user = authenticateUser(req);
    if (user !== 1) {
        await sendNotFound(req, res)
        return;
    }

    await sendFile(req, res, '../public/assets/pages/recoveries.html', 'text/html');
}
