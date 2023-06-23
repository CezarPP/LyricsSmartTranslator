import {IncomingMessage, ServerResponse} from "http";
import http from 'http';

export async function forwardRequestAuth(req: IncomingMessage, res: ServerResponse) {
    const options = {
        hostname: 'localhost',
        port: 8001,
        path: req.url,
        method: req.method,
        headers: req.headers
    };

    const proxy = http.request(options, function (targetRes) {
        if (targetRes.statusCode !== undefined) {
            res.writeHead(targetRes.statusCode, targetRes.headers);
        } else {
            res.writeHead(500, 'Unknown Status');
        }
        targetRes.pipe(res, {
            end: true
        });
    });

    req.pipe(proxy, {
        end: true
    });
}
