import fs from "fs";
import {join} from "path";
import {IncomingMessage, ServerResponse} from "http";

export const sendStaticFile = async (req: IncomingMessage, res: ServerResponse) => {
    const url = req.url;
    try {
        // TODO(sanitize)
        const html = fs.readFileSync(join(__dirname, './public/assets/pages/' + url), 'utf-8');
        res.writeHead(200, {'Content-Type': 'text/html'});
        res.end(html);
    } catch (error) {
        console.error(`Failed to read file: ${error}`);
        res.writeHead(500, {'Content-Type': 'text/plain'});
        res.end('Internal Server Error');
    }
}