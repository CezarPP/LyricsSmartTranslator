import {extname, join, resolve, relative} from "path";
import {IncomingMessage, ServerResponse} from "http";
import {sendFile} from "./sendFile";
import {sendMessage} from "./sendMessage";

export const sendStaticFile = async (req: IncomingMessage, res: ServerResponse) => {
    if (!req.url) {
        return;
    }

    let url = req.url;
    if (url.includes('?')) {
        url = url.split('?')[0];
    }

    const baseDir = resolve(__dirname, '../public');

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
    if (url === '/') {
        filePath = join(baseDir, 'index.html');
        ext = '.html';
    } else if (ext === '.html' || ext == '.xml' || ext == '.json') {
        filePath = join(baseDir, 'assets/pages', url);
    } else if (ext === '.css' || ext === '.js') {
        filePath = join(baseDir, url);
    } else if (url.startsWith('/song-page/')) {
        filePath = join(baseDir, 'assets/pages/song-page.html');
        ext = '.html';
    } else if (url.startsWith('/img/')) {
        filePath = join(baseDir, 'assets' + url);
    }

    filePath = resolve(filePath);
    const relativeFilePath = relative(baseDir, filePath);

    // Check if the relative path is inside the same dir
    if (relativeFilePath.startsWith('../')) {
        sendMessage(res, 403, 'Forbidden');
        return;
    }

    const contentType: string = mimeTypes[ext] || 'application/octet-stream';
    await sendFile(req, res, filePath, contentType);
}
