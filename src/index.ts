import http from 'http';

const port: number = 3000;

const index: http.Server = http.createServer((req: http.IncomingMessage, res: http.ServerResponse) => {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'text/plain');
    res.end('Hello World\n');
});

index.listen(port, () => {
    console.log(`Server running`);
});
