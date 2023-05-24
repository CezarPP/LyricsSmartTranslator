import {ServerResponse} from "http";

export function sendMessage(res: ServerResponse, statusCode: number, message: string) {
    res.writeHead(statusCode, {'Content-Type': 'application/json'});
    res.end(JSON.stringify({message: message}));
}