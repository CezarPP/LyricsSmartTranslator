import {IncomingMessage, ServerResponse} from "http";
import fs from "fs";
import {sendNotFound} from "./sendNotFound";
import path from "path";

/**
 * The file path can be absolute or relative to this directory
 * @param req
 * @param res
 * @param filePath
 * @param contentType
 */
export const sendFile = async (req: IncomingMessage, res: ServerResponse, filePath: string, contentType: string) => {
    if (!path.isAbsolute(filePath)) {
        filePath = path.resolve(__dirname, filePath);
    }
    fs.readFile(filePath, (error, content: Buffer): void => {
        if (error) {
            sendNotFound(req, res);
        } else {
            res.writeHead(200, {'Content-Type': contentType, 'Cache-Control': 'public, max-age=31536000'});
            res.end(content, 'utf-8');
        }
    });
}