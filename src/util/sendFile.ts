import {IncomingMessage, ServerResponse} from "http";
import fs from "fs";
import {sendNotFound} from "./sendNotFound";

/**
 * The file path should be absolute
 * @param req
 * @param res
 * @param filePath
 * @param contentType
 */
export const sendFile = async (req: IncomingMessage, res: ServerResponse, filePath: string, contentType: string) => {
    fs.readFile(filePath, (error, content: Buffer): void => {
        if (error) {
            sendNotFound(req, res);
        } else {
            res.writeHead(200, {'Content-Type': contentType});
            res.end(content, 'utf-8');
        }
    });
}