import fs from "fs";
import {extname, join} from "path";
import {IncomingMessage, ServerResponse} from "http";

export const sendStaticFile = async (req: IncomingMessage, res: ServerResponse) => {
    // TODO(sanitize)
    if (!req.url) {
        return;
    }
    let url = req.url;

    let ext: string = String(extname(url)).toLowerCase();

    const mimeTypes: { [index: string]: string } = {
        '.html': 'text/html',
        '.js': 'text/javascript',
        '.css': 'text/css',
        '.json': 'application/json',
        '.png': 'image/png',
        '.jpg': 'image/jpg',
        '.gif': 'image/gif',
        '.svg': 'image/svg+xml',
        '.xml': 'application/xml'
    };

    let filePath: string = '';
    console.log("URL is to serve is" + url);
    if (url === '/') {
        console.log("Serving index.html");
        filePath = join(__dirname, '../public', '/index.html');
        ext = '.html';
    } else if (ext === '.html' || ext == '.xml' || ext == '.json') {
        filePath = join(__dirname, '../public/assets/pages', url);
    } else if (ext === '.css' || ext === '.js') {
        filePath = join(__dirname, '../public', url);
    } else if (url.startsWith('/img') || ext === '.jpg' || ext === 'png')
        filePath = join(__dirname, '../public/assets', url);
    console.log('Filepath is ' + filePath);

    const contentType: string = mimeTypes[ext] || 'application/octet-stream';
    fs.readFile(filePath, (error, content: Buffer): void => {
        if (error) {
            if (error.code == 'ENOENT') {
                // ENOENT stands for Error NO ENTry, file not found
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