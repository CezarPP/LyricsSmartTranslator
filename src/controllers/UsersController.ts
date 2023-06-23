import {IncomingMessage, ServerResponse} from 'http';
import {UsersRepository} from '../repositories/UsersRepository';
import * as jwt from 'jsonwebtoken';
import {JwtPayload, verify} from 'jsonwebtoken';
import {parse} from "cookie";
import {sendFile} from "../util/sendFile";
import url from "url";
import assert from "assert";
import {sendMessage} from "../util/sendMessage";
import {Song} from "../models/Song";
import bcrypt from 'bcrypt';
import {isEmailValid} from "../util/validation";
import {sendNotFound} from "../util/sendNotFound"
import {RecoverRepository} from "../repositories/RecoverRepository";
import {User} from "../models/User";

const secretKey = 'ionut';

export class UsersController {
    private usersRepository: UsersRepository;
    private recoverRepository: RecoverRepository;
    constructor() {
        this.usersRepository = new UsersRepository();
        this.recoverRepository = new RecoverRepository();
    }
    async handleApiRequest(req: IncomingMessage, res: ServerResponse) {
        if (!req.url) {
            sendMessage(res, 500, 'Internal server error');
            return;
        }
        const parsedURL = req.url.split('/');
        if (req.method === 'POST') {
            if (parsedURL.length === 4) {
                if (parsedURL[3] === 'login') {
                    await this.loginUser(req, res);
                    return;
                } else if (parsedURL[3] === 'logout') {
                    await this.logoutUser(req, res);
                    return;
                } else if (parsedURL[3] === 'register') {
                    await this.registerUser(req, res);
                    return;
                }
            }
        } else if (req.method === 'GET') {
            if (parsedURL.length === 3) {
                // test if it has parameters
                assert(req.url);
                const separatedURL = url.parse(req.url, true);
                const hasParameters = Object.keys(separatedURL.query).length > 0;
                if(!hasParameters) {
                    await this.getAllUserStats(req, res);
                    return;
                } else {
                    await this.getAllUserStatsFiltering(req, res);
                    return;
                }
            } else if (parsedURL.length === 4) {
                if (parsedURL[3].startsWith('recommendations'))
                    await this.getRecommendations(req, res);
                else
                    await this.getUserStats(req, res, parsedURL[3]);
                return;
            }
        } else if (req.method === 'PUT') {
            if (parsedURL.length === 4) {
                await this.updateUserProfile(req, res, parsedURL[3]);
                return;
            }
        } else if (req.method === 'DELETE') {
            if (parsedURL.length === 4) {
                await this.deleteUser(req, res, parsedURL[3]);
                return;
            }
        }
        sendMessage(res, 405, `Method not allowed for path ${req.url}`);
    }
    async loginUser(req: IncomingMessage, res: ServerResponse) {
        try {
            let body = '';
            req.on('data', chunk => {
                body += chunk.toString();
            });

            req.on('end', async () => {
                console.log(body);
                const parsedData = JSON.parse(body);
                const username = parsedData.username as string;
                const password = parsedData.password as string;

                if (!username || !password) {
                    sendMessage(res, 400, 'Invalid request');
                    return;
                }

                const user = await this.usersRepository.getUserByName(username);
                if (user) {
                    const userPassword = user.password;
                    const match = await bcrypt.compare(password, userPassword);

                    if (!match) {
                        sendMessage(res, 401, 'Invalid credentials');
                    } else {
                        this.recoverRepository.deleteRecoverRequestUserId(user.id).then();
                        const token = jwt.sign({userId: user.id}, secretKey, {expiresIn: '20d'});
                        res.setHeader('Set-Cookie', `jwt=${token}; Path=/; HttpOnly; SameSite=Strict; Secure`);
                        sendMessage(res, 200, 'Login successful');
                    }
                } else {
                    sendMessage(res, 401, 'Invalid credentials');
                }
            });
        } catch (error) {
            sendMessage(res, 500, 'Internal server error');
        }
    }
    async logoutUser(req: IncomingMessage, res: ServerResponse) {
        const user = await this.getLoggedUser(req, res);
        if (!user)
            sendMessage(res, 404, 'No user is logged in');
        else {
            res.setHeader('Set-Cookie', 'jwt=; Path=/; HttpOnly; SameSite=Strict; Max-Age=0');
            sendMessage(res, 200, 'Logout successful');
        }
    }
    async registerUser(req: IncomingMessage, res: ServerResponse) {
        try {
            let body = '';
            req.on('data', (chunk) => {
                body += chunk.toString();
            });
            req.on('end', async () => {
                const parsedData = JSON.parse(body);
                const username = parsedData.username as string;
                const email = parsedData.email as string;
                const password = parsedData.password as string;
                if (!username || !email || !password || !isEmailValid(email)) {
                    sendMessage(res, 400, 'Invalid input data');
                    return;
                }
                if(username === 'login' || username === 'register' || username === 'recommendations'){
                    sendMessage(res, 400, 'Invalid username');
                    return;
                }
                const existingUsername = await this.usersRepository.getUserByName(username);
                if (existingUsername) {
                    sendMessage(res, 409, 'User already exists');
                    return;
                }
                const existingUserMail = await this.usersRepository.getUserByEmail(email);
                if (existingUserMail) {
                    sendMessage(res, 409, 'User with this email already exists');
                    return;
                }
                //I need to encrypt the password:
                const saltRounds = 10;
                const hashedPassword = await bcrypt.hash(password, saltRounds);
                const userId: number = await this.usersRepository.addUser(username, hashedPassword, email);
                res.writeHead(200, {'Content-Type': 'application/json'});
                res.write(JSON.stringify({message: 'User registered successfully', id: userId}));
                res.end();
            });
        } catch (error) {
            sendMessage(res, 500, 'Internal server error');
        }
    }
    async getUserStats(req: IncomingMessage, res: ServerResponse, username: String) {
        try {
            const user = await this.usersRepository.getUserByName(username);
            if (user === null) {
                sendMessage(res, 404, 'User not found');
            } else {
                const translationsCount = await this.usersRepository.getNumberOfTranslations(user.id);
                const annotationsCount = await this.usersRepository.getNumberOfAnnotations(user.id);
                const commentsCount = await this.usersRepository.getNumberOfComments(user.id);
                res.writeHead(200, {'Content-Type': 'application/json'});
                res.write(JSON.stringify({
                    username: user.username,
                    img_id: user.img_id,
                    email: user.email,
                    translationsCount,
                    annotationsCount,
                    commentsCount
                }));
                res.end();
            }
        } catch (error) {
            sendMessage(res, 500, 'Internal server error');
        }
    }
    async getAllUserStats(req: IncomingMessage, res: ServerResponse) {
        try {
            const users = await this.usersRepository.getAllUsers();
            const usersData = users.map((user) => ({
                username: user.username,
                img_id: user.img_id,
                email: user.email,
                activity: 0
            }));
            res.writeHead(200, {'Content-Type': 'application/json'});
            res.write(JSON.stringify(usersData));
            res.end();
        } catch (error) {
            sendMessage(res, 500, 'Internal server error');
        }
    }
    async getAllUserStatsFiltering(req: IncomingMessage, res: ServerResponse){
        assert(req.url);
        try {
            const parsedUrl = url.parse(req.url, true);
            const parameters = parsedUrl.query;
            const filter = parameters["filter"] as string;
            const limitString = parameters["limit"] as string;
            const limit = (limitString === undefined) ? 30 : parseInt(limitString);
            if (filter === undefined || isNaN(limit) || limit < 0 || filter !== "mostActive") {
                sendMessage(res, 400, 'Invalid request parameters');
                return;
            }
            const users: User[] = await this.usersRepository.getMostActiveUsers(limit);
            const usersData = users.map((user) => ({
                username: user.username,
                img_id: user.img_id,
                email: user.email,
                activity: user.password
            }));
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify(usersData));
        } catch (error) {
            sendMessage(res, 500, 'Internal server error')
        }
    }
    async updateUserProfile(req: IncomingMessage, res: ServerResponse, username: String) {
        try {
            let body = '';
            req.on('data', chunk => {
                body += chunk.toString();
            });
            req.on('end', async () => {
                const parsedData = JSON.parse(body);
                const newUsername = parsedData.newUsername as string;
                const newImgId = parsedData.newImgId as number;
                const newPassword = parsedData.newPassword as string;
                const newEmail = parsedData.newEmail as string;

                if (!newUsername || !newImgId || newPassword === undefined || !newEmail || !isEmailValid(newEmail)) {
                    sendMessage(res, 400, 'Invalid input data');
                    return;
                }

                const user = await this.usersRepository.getUserByName(username);
                if (user === null) {
                    sendMessage(res, 404, 'User not found');
                } else {
                    const loggedUser = await this.getLoggedUser(req, res);
                    if (loggedUser === null) {
                        sendMessage(res, 401, 'Unauthorized');
                    } else if (loggedUser.id === 1 || loggedUser.id === user.id) {
                        const existingUsername = await this.usersRepository.getUserByName(newUsername);
                        if (existingUsername !== null && existingUsername.id !== user.id) {
                            sendMessage(res, 401, 'User with this username already exists');
                            return;
                        }
                        const existingUserMail = await this.usersRepository.getUserByEmail(newEmail);
                        if (existingUserMail !== null && existingUserMail.id !== user.id) {
                            sendMessage(res, 401, 'User with this email already exists');
                            return;
                        }

                        let goodPassword = newPassword;
                        if (goodPassword.trim().length === 0)
                            goodPassword = user.password;
                        else {
                            const saltRounds = 10;
                            goodPassword = await bcrypt.hash(goodPassword, saltRounds);
                        }
                        const status = await this.usersRepository.updateUser(user.id, newUsername, goodPassword, newEmail, newImgId);
                        if (status) {
                            sendMessage(res, 200, 'User successfully updated');
                        } else {
                            sendMessage(res, 500, 'Failed to update user');
                        }

                    } else {
                        sendMessage(res, 401, 'Unauthorized');
                    }
                }
            });
        } catch (error) {
            sendMessage(res, 500, 'Internal server error');
        }
    }
    async deleteUser(req: IncomingMessage, res: ServerResponse, username: String) {
        try {
            const user = await this.usersRepository.getUserByName(username);
            if (user === null) {
                sendMessage(res, 404, 'User not found');
            } else {
                const loggedUser = await this.getLoggedUser(req, res);
                if (loggedUser === null) {
                    sendMessage(res, 401, 'Unauthorized');
                } else if (loggedUser.id === 1 || loggedUser.id === user.id) {
                    const status = await this.usersRepository.deleteUser(user.id);
                    if (status) {
                        sendMessage(res, 200, 'User successfully deleted');
                    } else {
                        sendMessage(res, 500, 'Failed to delete user');
                    }
                } else {
                    sendMessage(res, 401, 'Unauthorized');
                }
            }
        } catch (error) {
            sendMessage(res, 500, 'Internal server error');
        }
    }
    async getRecommendations(req: IncomingMessage, res: ServerResponse) {
        assert(req.url);
        const parsedUrl = url.parse(req.url, true);
        const parameters = parsedUrl.query;
        let limitString = parameters["limit"] as string;
        if (limitString === undefined) {
            limitString = "30";
        }
        let limit = parseInt(limitString);
        if (isNaN(limit)) {
            sendMessage(res, 500, 'Invalid request');
            return;
        }

        const user = await this.getLoggedUser(req, res);

        if (user === null) {
            sendMessage(res, 401, 'Not logged in');
            return;
        }

        const songs: Song[] = await this.usersRepository.getRecommendations(user.id, limit);
        console.log("Songs for user are " + songs);
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify(songs));
    }
    async getUserProfilePage(req: IncomingMessage, res: ServerResponse) {
        try {
            if (!req.url) {
                sendMessage(res, 500, 'Internal server error');
                return;
            }
            const parsedURL = req.url.split('/');
            if (parsedURL.length !== 3) {
                sendMessage(res, 404, 'Resource not found');
                return;
            }
            //vad la ce user vreau sa iau profilul
            const username = parsedURL[2];
            const user = await this.usersRepository.getUserByName(username);
            if (user === null) {
                await sendNotFound(req, res);
                return;
            }
            const loggedUser = await this.getLoggedUser(req, res);
            if (loggedUser === null || (loggedUser.id !== 1 && loggedUser.id !== user.id)) {
                await sendFile(req, res, '../public/assets/pages/profile.html', 'text/html');
            } else {
                await sendFile(req, res, '../public/assets/pages/profile-me.html', 'text/html');
            }
        } catch (error) {
            sendMessage(res, 500, 'Internal server error');
        }
    }
    async getLoggedUsersInfo(req: IncomingMessage, res: ServerResponse) {
        try {
            const user = await this.getLoggedUser(req, res);
            if (user === null) {
                sendMessage(res, 404, 'No user is logged in');
            } else {
                res.writeHead(200, {'Content-Type': 'application/json'});
                res.write(JSON.stringify(user.toObject()));
                res.end();
            }
        } catch (error) {
            sendMessage(res, 500, 'Internal server error');
        }
    }
    async getLoggedUser(req: IncomingMessage, res: ServerResponse) {
        const userId = this.authenticateUser(req);
        return await this.usersRepository.getUserById(userId);
    }
    authenticateUser(req: IncomingMessage): number {
        const cookies = req.headers.cookie;
        console.log(cookies);
        // Parse the cookie to retrieve the JWT
        const parsedCookies = parse(cookies || '');
        const jwtCookie = parsedCookies.jwt;

        if (jwtCookie) {
            try {
                // Verify and decode the JWT to access the payload
                const decodedToken = verify(jwtCookie, secretKey) as JwtPayload;
                return decodedToken.userId;
            } catch (error) {
                // Handle JWT verification errors
                console.error('JWT verification failed:', error);
            }
        }
        return -1;
    }
}
