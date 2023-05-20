import {IncomingMessage, ServerResponse} from 'http';
import {UsersRepository} from '../repositories/UsersRepository';
import {User} from '../models/User';
import * as jwt from 'jsonwebtoken';
import {JwtPayload, verify} from "jsonwebtoken";
import {parse} from "cookie";
import fs from "fs";
import {extname, join} from "path";

const secretKey = 'ionut';

export class UsersController {
    private usersRepository: UsersRepository;

    constructor() {
        this.usersRepository = new UsersRepository;
    }


    async handleApiRequest(req: IncomingMessage, res: ServerResponse){
        if(req.method === 'POST'){

        }
    }
    async loginUser(req: IncomingMessage, res: ServerResponse) {
        try {
            let body = '';
            req.on('data', chunk => {
                body += chunk.toString();
            });

            req.on('end', async () => {
                console.log(body);
                const {username, password} = JSON.parse(body);

                const user = await this.usersRepository.getUserByName(username);
                if (user) {
                    const userPassword = user.password;
                    if (!(userPassword === password)) {
                        res.writeHead(401, {'Content-Type': 'application/json'});
                        res.end(JSON.stringify({message: 'Invalid credentials'}));
                    } else {
                        const token = jwt.sign({userId: user.id}, secretKey, {expiresIn: '20d'});

                        res.setHeader('Set-Cookie', `jwt=${token}; HttpOnly; SameSite=Strict`);
                        res.writeHead(200, {'Content-Type': 'application/json'});
                        res.end(JSON.stringify({token, message: 'Login successful'}));
                    }
                } else {
                    res.writeHead(401, {'Content-Type': 'application/json'});
                    res.end(JSON.stringify({message: 'Invalid credentials'}));
                }
            });
        } catch (error) {
            res.writeHead(500, {'Content-Type': 'application/json'});
            res.end(JSON.stringify({message: 'Internal Server Error'}));
        }
    }

    async logoutUser(req: IncomingMessage, res: ServerResponse) {
        res.setHeader('Set-Cookie', 'jwt=; HttpOnly; SameSite=Strict; Max-Age=0');
        res.writeHead(200, {'Content-Type': 'application/json'});
        res.end(JSON.stringify({message: 'Logout successful'}));
    }

    async registerUser(req: IncomingMessage, res: ServerResponse) {
        try {
            let body = '';

            req.on('data', (chunk) => {
                body += chunk.toString();
            });

            req.on('end', async () => {
                const {username, password} = JSON.parse(body);

                if (!username || !password) {
                    res.writeHead(400, {'Content-Type': 'application/json'});
                    res.write(JSON.stringify({message: 'Invalid input data'}));
                    res.end();
                    return;
                }

                // trebuie salvat in database
                const existingUser = await this.usersRepository.getUserByName(username);
                if (existingUser) {
                    res.writeHead(400, {'Content-Type': 'application/json'});
                    res.write(JSON.stringify({message: 'User already exists'}));
                    res.end();
                    return;
                }

                const userId: number = await this.usersRepository.addUser(username, password);

                res.writeHead(200, {'Content-Type': 'application/json'});
                res.write(JSON.stringify({message: 'User registered successfully', id: userId}));
                res.end();
            });
        } catch (error) {
            res.writeHead(500, {'Content-Type': 'application/json'});
            res.write(JSON.stringify({message: 'Internal Server Error'}));
            res.end();
        }
    }

    async getLoggedUser(req: IncomingMessage, res: ServerResponse) {
        const userId = this.authenticateUser(req, res);
        const user = await this.usersRepository.getUserById(userId);
        return user;
    }

    async getUserPage(req: IncomingMessage, res: ServerResponse) {
        try {
            console.log(req.url);
            const user = await this.getLoggedUser(req, res);
            if (user === null) {
                res.writeHead(404, {'Content-Type': 'application/json'});
                res.write(JSON.stringify({message: 'User not found'}));
                res.end();
            } else {
                const filePath = join(__dirname, '../public/assets/pages/profile.html');
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
                        res.writeHead(200, {'Content-Type': `text/html`});
                        res.end(content, 'utf-8');
                    }
                });
            }
        } catch (error) {
            res.writeHead(500, {'Content-Type': 'application/json'});
            res.write(JSON.stringify({message: 'Internal Server Error'}));
            res.end();
        }
    }

    async getUserStats(req: IncomingMessage, res: ServerResponse) {
        try {
            const user = await this.getLoggedUser(req, res);
            if (user === null) {
                res.writeHead(404, {'Content-Type': 'application/json'});
                res.write(JSON.stringify({message: 'User not found'}));
                res.end();
            } else {
                const translationsCount = 0;
                const annotationsCount = 0;
                const commentsCount = 0;
                res.writeHead(200, {'Content-Type': 'application/json'});
                res.write(JSON.stringify({
                    message: 'User profile',
                    username: user.username,
                    password: user.password,
                    img_id: user.img_id,
                    translationsCount,
                    annotationsCount,
                    commentsCount
                }));
            }
            res.end();
        } catch (error) {
            res.writeHead(500, {'Content-Type': 'application/json'});
            res.write(JSON.stringify({message: 'Internal Server Error'}));
            res.end();
        }
    }

    authenticateUser(req: IncomingMessage, res: ServerResponse): number {
        const cookies = req.headers.cookie;
        console.log(cookies);
        // Parse the cookie to retrieve the JWT
        const parsedCookies = parse(cookies || '');
        const jwtCookie = parsedCookies.jwt;

        if (jwtCookie) {
            try {
                // Verify and decode the JWT to access the payload
                const decodedToken = verify(jwtCookie, secretKey) as JwtPayload;
                const userId = decodedToken.userId;
                return userId;
            } catch (error) {
                // Handle JWT verification errors
                console.error('JWT verification failed:', error);
            }
        }
        return -1;
    }
}
