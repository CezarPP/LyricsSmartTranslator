import {IncomingMessage, ServerResponse} from 'http';
import {UsersRepository} from '../repositories/UsersRepository';
import {User} from '../models/User';
import * as jwt from 'jsonwebtoken';
import {JwtPayload, verify} from "jsonwebtoken";
import {parse} from "cookie";
import fs from "fs";
import {extname, join} from "path";
import {sendFile} from "../util/sendFile";

const secretKey = 'ionut';

export class UsersController {
    private usersRepository: UsersRepository;

    constructor() {
        this.usersRepository = new UsersRepository();
    }

    async handleApiRequest(req: IncomingMessage, res: ServerResponse){
        if(!req.url){
            return; // nu are cum sa intre aici niciodata
        }
        console.log(req.url);
        const parsedURL = req.url.split('/');
        console.log(parsedURL);
        console.log(parsedURL.length);
        if(req.method === 'POST'){
            if(parsedURL.length === 4) {
                if (parsedURL[3] === 'login') {
                    await this.loginUser(req, res);
                    return;
                }
                else if (parsedURL[3] === 'logout') {
                    await this.logoutUser(req, res);
                    return;
                }
                else if (parsedURL[3] === 'register') {
                    await this.registerUser(req, res);
                    return;
                }
            }
        } else if(req.method === 'GET'){
            if(parsedURL.length === 3) {
                await this.getUsersStats(req, res);
                return;
            }
            else if(parsedURL.length === 4) {
                await this.getUserStats(req, res, parsedURL[3]);
                return;
            }
        } else if(req.method === 'PUT'){
            if(parsedURL.length === 4) {
                await this.updateUserProfile(req, res, parsedURL[3]);
                return;
            }
        } else if(req.method === 'DELETE'){
            if(parsedURL.length === 4) {
                await this.deleteUser(req, res, parsedURL[3]);
                return;
            }
        }
        res.writeHead(404, {'Content-Type': 'application/json'});
        res.write(JSON.stringify({message: 'Resource not found'}));
        res.end();
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

                        res.setHeader('Set-Cookie', `jwt=${token}; Path=/; HttpOnly; SameSite=Strict`);
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
        res.setHeader('Set-Cookie', 'jwt=; Path=/; HttpOnly; SameSite=Strict; Max-Age=0');
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
    async getUserStats(req: IncomingMessage, res: ServerResponse, username:String) {
        try {
            const user = await this.usersRepository.getUserByName(username);
            if (user === null) {
                res.writeHead(404, {'Content-Type': 'application/json'});
                res.write(JSON.stringify({message: 'User not found'}));
                res.end();
            } else {
                const translationsCount = await this.usersRepository.getNumberOfTranslations(user.id);
                const annotationsCount = await this.usersRepository.getNumberOfAnnotations(user.id);
                const commentsCount = await this.usersRepository.getNumberOfComments(user.id);
                res.writeHead(200, {'Content-Type': 'application/json'});
                res.write(JSON.stringify({
                    username: user.username,
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
    async getUsersStats(req: IncomingMessage, res: ServerResponse){
        try {
            let users: User[] | null = null;
            users = await this.usersRepository.getAllUsers();
            if (users === null) {
                res.writeHead(404, { 'Content-Type': 'application/json' });
                res.write(JSON.stringify({ message: 'User not found' }));
                res.end();
            } else {
                const usersData = users.map((user) => ({
                    username: user.username,
                    img_id: user.img_id,
                }));
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.write(JSON.stringify(usersData));
                res.end();
            }
        } catch (error) {
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.write(JSON.stringify({ message: 'Internal Server Error' }));
            res.end();
        }
    }
    async updateUserProfile(req: IncomingMessage, res: ServerResponse, username:String){
        try {
            let body = '';
            req.on('data', chunk => {
                body += chunk.toString();
            });

            req.on('end', async () => {
                const {newUsername, newImg_id, newPassword} = JSON.parse(body);
                console.log(newImg_id);
                console.log(newUsername);
                console.log(newPassword);
                const user = await this.usersRepository.getUserByName(username);
                if (user === null) {
                    res.writeHead(404, {'Content-Type': 'application/json'});
                    res.write(JSON.stringify({message: 'User not found'}));
                    res.end();
                } else {
                    const loggedUser = await this.getLoggedUser(req, res);
                    if(loggedUser === null){
                        res.writeHead(401, {'Content-Type': 'application/json'});
                        res.end(JSON.stringify({message: 'Unauthorized'}));
                    } else if(loggedUser.id === 1 || loggedUser.id === user.id){
                        const oldUser = await this.usersRepository.getUserByName(newUsername);
                        if(oldUser !== null && oldUser.id !== user.id) {
                            res.writeHead(401, {'Content-Type': 'application/json'});
                            res.end(JSON.stringify({message: 'User with this username already exists'}));
                        } else {
                            // am adaugat asta acum
                            let goodPassword = newPassword;
                            if(goodPassword.trim().length === 0)
                                goodPassword = user.password;

                            const status = await this.usersRepository.updateUser(user.id, newUsername, goodPassword, newImg_id);
                            if(status){
                                res.writeHead(200, {'Content-Type': 'application/json'});
                                res.end(JSON.stringify({message: 'User successfully updated'}));
                            }
                            else{
                                res.writeHead(500, {'Content-Type': 'application/json'});
                                res.write(JSON.stringify({message: 'Failed to update user'}));
                            }
                        }
                    } else{
                        res.writeHead(401, {'Content-Type': 'application/json'});
                        res.end(JSON.stringify({message: 'Unauthorized'}));
                    }
                }
            });
        } catch (error) {
            res.writeHead(500, {'Content-Type': 'application/json'});
            res.end(JSON.stringify({message: 'Internal Server Error'}));
        }
    }
    async deleteUser(req: IncomingMessage, res: ServerResponse, username: String) {
        try{
            const user = await this.usersRepository.getUserByName(username);
            if (user === null) {
                res.writeHead(404, {'Content-Type': 'application/json'});
                res.write(JSON.stringify({message: 'User not found'}));
                res.end();
            } else {
                const loggedUser = await this.getLoggedUser(req, res);
                if(loggedUser === null){
                    res.writeHead(401, {'Content-Type': 'application/json'});
                    res.end(JSON.stringify({message: 'Unauthorized'}));
                } else if(loggedUser.id === 1 || loggedUser.id === user.id){
                    const status = await this.usersRepository.deleteUser(user.id);
                    if(status){
                        res.writeHead(200, {'Content-Type': 'application/json'});
                        res.end(JSON.stringify({message: 'User successfully deleted'}));
                    }
                    else{
                        res.writeHead(500, {'Content-Type': 'application/json'});
                        res.write(JSON.stringify({message: 'Failed to delete user'}));
                    }
                } else{
                    res.writeHead(401, {'Content-Type': 'application/json'});
                    res.end(JSON.stringify({message: 'Unauthorized'}));
                }
            }
            res.end();
        } catch (error) {
            res.writeHead(500, {'Content-Type': 'application/json'});
            res.write(JSON.stringify({message: 'Internal Server Error'}));
            res.end();
        }
    }
    async getUserProfilePage(req: IncomingMessage, res: ServerResponse) {
        try {
            if(!req.url){
                //nu e posibil sa ajung aici
                return;
            }
            const parsedURL = req.url.split('/');
            if(parsedURL.length !== 3){
                res.writeHead(404, {'Content-Type': 'application/json'});
                res.write(JSON.stringify({message: 'Resource not found'}));
                res.end();
                return;
            }
            //vad la ce user vreau sa iau profilul
            const username = parsedURL[2];
            const user = await this.usersRepository.getUserByName(username);
            if(user === null){
                res.writeHead(404, {'Content-Type': 'application/json'});
                res.write(JSON.stringify({message: 'User not found'}));
                res.end();
                return;
            }
            const loggedUser = await this.getLoggedUser(req, res);
            if (loggedUser === null || (loggedUser.id !== 1 && loggedUser.id !== user.id )) {
                // trebuie sa trimit pagina normala de profil
                sendFile(req, res,
                    '../public/assets/pages/profile.html', 'text/html')
                    .then();
            } else {
                // trimit pagina lui
                sendFile(req, res,
                    '../public/assets/pages/profile-me.html', 'text/html')
                    .then();
            }
        } catch (error) {
            res.writeHead(500, {'Content-Type': 'application/json'});
            res.write(JSON.stringify({message: 'Internal Server Error'}));
            res.end();
        }
    }
    async getLoggedUserUsername(req:IncomingMessage, res: ServerResponse){
        try {
            const user = await this.getLoggedUser(req, res);
            if (user === null){
                res.writeHead(404, {'Content-Type': 'application/json'});
                res.write(JSON.stringify({message:'No user is logged in'}));
                res.end();
            } else{
                res.writeHead(200, {'Content-Type': 'application/json'});
                res.write(JSON.stringify({ username: user.username}));
                res.end();
            }
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
