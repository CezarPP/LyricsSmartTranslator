import { IncomingMessage, ServerResponse } from 'http';
import { UsersRepository } from '../repositories/UsersRepository';
import { User } from '../models/User';
import * as jwt from 'jsonwebtoken';

const secretKey = 'ionut';

export class UsersController {
    private usersRepository: UsersRepository;
    constructor() {
        this.usersRepository = new UsersRepository;
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
                    if(!(userPassword === password)){
                        res.writeHead(401, {'Content-Type': 'application/json'});
                        res.end(JSON.stringify({message: 'Invalid credentials'}));
                    } else {
                        const token = jwt.sign({userId: user.id}, secretKey, {expiresIn: '20d'});
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

    //to do: getUserProfile trebuie mai modificat putin
    async getUserProfile(req: IncomingMessage, res: ServerResponse){
        try{
            console.log(req.url);
            const url: URL = new URL(req.url as string, `http://${req.headers.host}`);

            const username = url.pathname.split('/')[2];
            const user = await this.usersRepository.getUserByName(username);
            if(user == null) {
                res.writeHead(404, {'Content-Type': 'application/json'});
                res.write(JSON.stringify({message: 'User not found'}));
                res.end();
            } else {
                res.writeHead(200, {'Content-Type': 'application/json'});
                res.write(JSON.stringify({message: 'User profile', user}));
                res.end();
            }
        } catch (error){
            res.writeHead(500, {'Content-Type': 'application/json'});
            res.write(JSON.stringify({message: 'Internal Server Error'}));
            res.end();
        }
    }



}
