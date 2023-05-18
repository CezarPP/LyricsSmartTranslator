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
                const {username, password} = JSON.parse(body);

                const user = await this.usersRepository.getUser(username, password);
                if (user) {
                    const token = jwt.sign({userId: user.id}, secretKey, {expiresIn: '1h'});

                    res.writeHead(200, {'Content-Type': 'application/json'});
                    res.end(JSON.stringify({token}));
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
                const existingUser = await this.usersRepository.getUser(username, password);
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


    // to do: getUserProfile
    // async getUserProfile(req: IncomingMessage, res: ServerResponse){
    //     try{
    //
    //     } catch (error){
    //         res.writeHead(500, {'Content-Type': 'application/json'});
    //         res.write(JSON.stringify({message: 'Internal Server Error'}));
    //         res.end();
    //     }
    // }

    // to do: update user credentials

}

