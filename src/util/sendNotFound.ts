import {IncomingMessage, ServerResponse} from "http";
import fs from "fs";
import {sendMessage} from "./sendMessage";
import {join, resolve} from "path";

export const sendNotFound = async (req: IncomingMessage, res: ServerResponse) => {
    const baseDir = resolve(__dirname, '../public');
    const filePath = join(baseDir, '/assets/pages/404.html');
    console.log("Filepath is " + filePath);
    fs.readFile(filePath, (error, content: Buffer) => {
        if (error) {
            sendMessage(res, 500, 'Server error');
        } else {
            res.writeHead(404, {'Content-Type': 'text/html'});
            res.end(content, 'utf-8');
        }
    });
}