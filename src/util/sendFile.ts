import {IncomingMessage, ServerResponse} from "http";
import fs from "fs";
import {join} from "path";

/**
 * The file path should be relative to the /src/util folder
 * It should NOT be relative to the file it is called from
 * @param req
 * @param res
 * @param filePath
 * @param contentType
 */
export const sendFile = async (req: IncomingMessage, res: ServerResponse, filePath: string, contentType: string) => {
    filePath = join(__dirname, filePath);
    fs.readFile(filePath, (error, content: Buffer): void => {
        if (error) {
            if (error.code == 'ENOENT') {
                fs.readFile('./404.html', (error, content: Buffer) => {
                    res.writeHead(404, {'Content-Type': 'text/html'});
                    res.end(content, 'utf-8');
                });
            } else {
                res.writeHead(500);
                res.end(`Sorry, check with the site admin for error: ${error.code} ..\n`);
            }
        } else {
            res.writeHead(200, {'Content-Type': contentType});
            res.end(content, 'utf-8');
        }
    });
}