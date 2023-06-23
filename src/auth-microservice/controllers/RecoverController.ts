import {UsersRepository} from "../repositories/UsersRepository";
import {RecoverRepository} from "../repositories/RecoverRepository";
import {IncomingMessage, ServerResponse} from "http";
import {sendMessage} from "../../util/sendMessage";
import {isEmailValid} from "../../util/validation";
import {sendNotFound} from "../../util/sendNotFound";
import {sendFile} from "../../util/sendFile";
import bcrypt from "bcrypt";
import {authenticateUser} from "../../util/authenticateUser";


export class RecoverController {
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
        console.log(parsedURL);

        if (req.method === 'POST') {
            if (parsedURL.length === 3) {
                await this.postRecoverPassword(req, res);
                return;
            }
        } else if (req.method === 'GET') {
            if (parsedURL.length === 3) {
                await this.getAllRecover(req, res);
                return;
            } else if (parsedURL.length === 4) {
                await this.getRecoverPage(req, res);
                return;
            }
        } else if (req.method === 'PUT') {
            if (parsedURL.length === 3) {
                await this.recoverPassword(req, res);
                return;
            }
        } else if (req.method === 'DELETE') {
            if (parsedURL.length === 4) {
                await this.deleteRecoverPassword(req, res);
                return;
            }
        }
        sendMessage(res, 405, `Method not allowed for path ${req.url}`);
    }

    async postRecoverPassword(req: IncomingMessage, res: ServerResponse) {
        try {
            let body = '';
            req.on('data', chunk => {
                body += chunk.toString();
            });

            req.on('end', async () => {
                const parsedData = JSON.parse(body);
                const email = parsedData.email as string;

                if (!email || !isEmailValid(email)) {
                    sendMessage(res, 400, 'Invalid input data');
                    return;
                }

                const recover = await this.recoverRepository.getRecoverByEmail(email);

                if (recover !== null) {
                    sendMessage(res, 409, 'Recovery request already exists');
                    return;
                }

                const user = await this.usersRepository.getUserByEmail(email);

                if (user === null) {
                    sendMessage(res, 404, 'No user with this email');
                    return;
                }

                const newRecover = await this.recoverRepository.addRecover(user.id, email);
                if (newRecover === null)
                    sendMessage(res, 500, 'Internal server error');
                else
                    sendMessage(res, 200, 'Recovery request registered');
            });
        } catch (error) {
            sendMessage(res, 500, 'Internal server error');
        }
    }

    async getAllRecover(req: IncomingMessage, res: ServerResponse) {
        if (authenticateUser(req) !== 1) {
            sendMessage(res, 401, 'Unauthorized');
            return;
        }

        const recoverList = await this.recoverRepository.getAllRecover();
        res.writeHead(200, {'Content-Type': 'application/json'});
        res.write(JSON.stringify(recoverList));
        res.end();
    }

    async getRecoverPage(req: IncomingMessage, res: ServerResponse) {
        if (!req.url) {
            sendMessage(res, 500, 'Internal server error');
            return;
        }

        const token = req.url.split('/')[3];

        const userId = await this.recoverRepository.getUserIdToken(token);

        if (userId === null) {
            await sendNotFound(req, res);
            return;
        }

        await sendFile(req, res, '../public/assets/pages/passwordRecoveryToken.html', 'text/html');
    }

    async recoverPassword(req: IncomingMessage, res: ServerResponse) {
        try {
            let body = '';
            req.on('data', chunk => {
                body += chunk.toString();
            });

            req.on('end', async () => {
                const parsedData = JSON.parse(body);
                const token = parsedData.token;
                const newPassword = parsedData.newPassword;

                console.log(token);
                console.log(newPassword);
                if (!newPassword || !token) {
                    sendMessage(res, 400, 'Invalid input data');
                    return;
                }

                const userId = await this.recoverRepository.getUserIdToken(token);

                if (userId == null) {
                    sendMessage(res, 404, 'User not found');
                    return;
                }

                //update the new password
                const saltRounds = 10;
                const hashedPassword = await bcrypt.hash(newPassword, saltRounds);
                console.log(userId);
                const statusUpdate = await this.usersRepository.changePassword(userId, hashedPassword);
                console.log(statusUpdate);
                const statusDelete = await this.recoverRepository.deleteRecoverRequestUserId(userId);
                console.log(statusDelete);
                if (!statusUpdate || !statusDelete) {
                    sendMessage(res, 500, 'Internal server error');
                    return;
                }

                sendMessage(res, 200, 'Password successfully recovered');
            });
        } catch (error) {
            sendMessage(res, 500, 'Internal server error');
        }
    }

    async deleteRecoverPassword(req: IncomingMessage, res: ServerResponse) {
        try {
            if (!req.url) {
                sendMessage(res, 500, 'Internal server error');
                return;
            }

            if (authenticateUser(req) !== 1) {
                sendMessage(res, 401, 'Unauthorized');
                return;
            }

            const id = parseInt(req.url.split('/')[3]);
            const status = await this.recoverRepository.deleteRecoverRequestId(id);

            if (status) {
                sendMessage(res, 200, 'Recover request successfully deleted');
                return;
            }

            sendMessage(res, 404, 'Recover request not found');
        } catch (error) {
            sendMessage(res, 500, 'Internal server error');
        }
    }
}