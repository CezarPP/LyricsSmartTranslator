import {extname, join} from "path";
import {IncomingMessage, ServerResponse} from "http";
import {sendFile} from "./sendFile";

export const sendStaticFile = async (req: IncomingMessage, res: ServerResponse) => {
    // TODO(sanitize URL)
    if (!req.url) {
        return;
    }
    let url = req.url;

    if (url.includes('?')) {
        url = url.split('?')[0];
    }

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
        filePath = join('../public', '/index.html');
        ext = '.html';
    } else if (ext === '.html' || ext == '.xml' || ext == '.json') {
        filePath = join('../public/assets/pages', url);
    } else if (ext === '.css' || ext === '.js') {
        filePath = join('../public', url);
    } else if (url.startsWith('/song-page/')) {
        filePath = '../public/assets/pages/song-page.html';
        ext = '.html';
    } else if (url.startsWith('/img/')) {
        filePath = join('../public/assets' + url);
    }

    const contentType: string = mimeTypes[ext] || 'application/octet-stream';
    await sendFile(req, res, filePath, contentType);
}