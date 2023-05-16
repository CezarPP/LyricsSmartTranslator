import fs from "fs";
import {extname, join} from "path";
import {IncomingMessage, ServerResponse} from "http";

export const sendStaticFile = async (req: IncomingMessage, res: ServerResponse) => {
    // TODO(sanitize)
    if (!req.url) {
        return;
    }

    const ext: string = String(extname(req.url)).toLowerCase();

    const mimeTypes: { [index: string]: string } = {
        '.html': 'text/html',
        '.js': 'text/javascript',
        '.css': 'text/css',
        '.json': 'application/json',
        '.png': 'image/png',
        '.jpg': 'image/jpg',
        '.gif': 'image/gif'
    };

    let filePath: string = '';
    if (ext == '.html') {
        filePath = join(__dirname, '../public/assets/pages', req.url);
        if (req.url === '/') {
            filePath = join(__dirname, '../public', 'index.html');
        }
    } else if (ext == '.css') {
        filePath = join(__dirname, '../public/css', req.url);
    } else if (ext == '.js') {
        filePath = join(__dirname, '../public/js', req.url);
    }
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