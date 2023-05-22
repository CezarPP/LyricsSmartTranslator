import {IncomingMessage, ServerResponse} from "http";
import {CommentsRepository} from "../repositories/CommentsRepository";
import {Comment} from "../models/Comment";
import {UsersRepository} from "../repositories/UsersRepository";
import {InstanceResponseCallback} from "@google-cloud/storage/build/src/nodejs-common";
import {UsersController} from "./UsersController";
import {TranslationsController} from "./TranslationsController";
import {TranslationsRepository} from "../repositories/TranslationsRepository";

export class CommentsController {
    private commentsRepository: CommentsRepository;
    private usersController: UsersController;
    private translationsRepository: TranslationsRepository;

    constructor() {
        this.commentsRepository = new CommentsRepository();
        this.usersController = new UsersController();
        this.translationsRepository = new TranslationsRepository();
    }

    async handleApiRequest(req: IncomingMessage, res: ServerResponse) {
        if (!req.url) {
            return; // nu are cum sa intre aici niciodata;
        }
        console.log(req.url);
        const parsedURL = req.url.split('/');
        if (req.method == 'POST') {
            if (parsedURL.length === 3) {
                await this.postComment(req, res);
                return;
            }
        } else if (req.method == 'GET') {
            if (parsedURL.length === 3) {
                await this.getAllComments(req, res);
                return;
            } else if (parsedURL.length === 4) {
                await this.getCommentsFromTranslation(req, res);
                return;
            }
        } else if (req.method == 'PUT') {
            if (parsedURL.length === 4) {
                await this.updateComment(req, res);
                return;
            }
        } else if (req.method == 'DELETE') {
            if (parsedURL.length === 4) {
                await this.deleteComment(req, res);
                return;
            }
        }
        res.writeHead(404, {'Content-Type': 'application/json'});
        res.write(JSON.stringify({message: 'Resource not found'}));
        res.end();
    }

    async postComment(req: IncomingMessage, res: ServerResponse) {
        try {
            let body = '';

            req.on('data', (chunk) => {
                body += chunk.toString();
            });
            req.on('end', async () => {
                const {translationId, content} = JSON.parse(body);
                const user = await this.usersController.getLoggedUser(req, res);
                if (user === null) {
                    res.writeHead(401, {'Content-Type': 'application/json'});
                    res.write(JSON.stringify({message: 'You need to be logged in to comment'}));
                    res.end();
                    return;
                }

                const transId = parseInt(translationId);
                const translation = await this.translationsRepository.getTranslationById(transId);
                if (translation === null) {
                    res.writeHead(404, {'Content-Type': 'application/json'});
                    res.write(JSON.stringify({message: 'Translation not found'}));
                    res.end();
                    return;
                }

                const comment = new Comment(0, user.id, translation.id, content);
                console.log(comment);
                const commentId = await this.commentsRepository.addComment(comment);
                res.writeHead(200, {'Content-Type': 'application/json'});
                res.write(JSON.stringify({message: 'Comment added successfully', id: commentId}));
                res.end();
            });
        } catch (error) {
            res.writeHead(500, {'Content-Type': 'application/json'});
            res.write(JSON.stringify({message: 'Internal Server Error'}));
            res.end();
        }
    }

    async getAllComments(req: IncomingMessage, res: ServerResponse) {
        try {
            let comments: Comment[] | null = null;
            comments = await this.commentsRepository.getAllComments();
            if (comments == null) {
                res.writeHead(404, {'Content-Type': 'application/json'});
                res.write(JSON.stringify({message: 'No comments yet'}));
                res.end();
            } else {
                console.log(comments);
                res.writeHead(200, {'Content-Type': 'application/json'});
                res.write(JSON.stringify(comments));
                res.end();
            }
        } catch (error) {
            res.writeHead(500, {'Content-Type': 'application/json'});
            res.write(JSON.stringify({message: 'Internal Server Error'}));
            res.end();
        }
    }

    async getCommentsFromTranslation(req: IncomingMessage, res: ServerResponse) {
        try {
            if (!req.url) {
                return // nu are cum sa fie aici
            }
            const transId = parseInt(req.url.split('/')[3]);

            const translation = await this.translationsRepository.getTranslationById(transId);

            if (translation === null) {
                res.writeHead(404, {'Content-Type': 'application/json'});
                res.write(JSON.stringify({message: 'Translation not found'}));
                res.end();
                return;
            }

            let comments: Comment[] | null = null;
            comments = await this.commentsRepository.getCommentsByTranslationId(transId);

            if (comments == null) {
                res.writeHead(404, {'Content-Type': 'application/json'});
                res.write(JSON.stringify({message: 'No comments yet'}));
                res.end();
            } else {
                res.writeHead(200, {'Content-Type': 'application/json'});
                res.write(JSON.stringify(comments));
                res.end();
            }
        } catch (error) {
            res.writeHead(500, {'Content-Type': 'application/json'});
            res.write(JSON.stringify({message: 'Internal Server Error'}));
            res.end();
        }
    }

    async updateComment(req: IncomingMessage, res: ServerResponse) {
        try {
            let body = '';
            req.on('data', chunk => {
                body += chunk.toString();
            });

            req.on('end', async () => {
                const {newContent} = JSON.parse(body);
                console.log(newContent);

                if (!req.url) {
                    return; // nu are cum sa ajung aici
                }
                const commId = parseInt(req.url.split('/')[3]);
                const comment = await this.commentsRepository.getCommentById(commId);

                if (comment === null) {
                    res.writeHead(404, {'Content-Type': 'application/json'});
                    res.write(JSON.stringify({message: 'Comment not found'}));
                    res.end();
                } else {
                    const loggedUser = await this.usersController.getLoggedUser(req, res);
                    if (loggedUser === null) {
                        res.writeHead(401, {'Content-Type': 'application/json'});
                        res.end(JSON.stringify({message: 'Unauthorized'}));
                    } else if (loggedUser.id === 1 || loggedUser.id === comment.userId) {
                        const status = await this.commentsRepository.updateComment(commId, newContent);

                        if (status) {
                            res.writeHead(200, {'Content-Type': 'application/json'});
                            res.end(JSON.stringify({message: 'Comment successfully updated'}));
                        } else {
                            res.writeHead(500, {'Content-Type': 'application/json'});
                            res.write(JSON.stringify({message: 'Failed to update comment'}));
                        }
                    } else {
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

    async deleteComment(req: IncomingMessage, res: ServerResponse) {
        try {
            if (!req.url) {
                return; // nu are cum sa ajung aici
            }
            const commId = parseInt(req.url.split('/')[3]);
            const comment = await this.commentsRepository.getCommentById(commId);

            if (comment === null) {
                res.writeHead(404, {'Content-Type': 'application/json'});
                res.write(JSON.stringify({message: 'Comment not found'}));
                res.end();
            } else {
                const loggedUser = await this.usersController.getLoggedUser(req, res);
                if (loggedUser === null) {
                    res.writeHead(401, {'Content-Type': 'application/json'});
                    res.end(JSON.stringify({message: 'Unauthorized'}));
                } else if (loggedUser.id === 1 || loggedUser.id === comment.userId) {
                    const status = await this.commentsRepository.deleteComment(commId);

                    if (status) {
                        res.writeHead(200, {'Content-Type': 'application/json'});
                        res.end(JSON.stringify({message: 'Comment successfully updated'}));
                    } else {
                        res.writeHead(500, {'Content-Type': 'application/json'});
                        res.write(JSON.stringify({message: 'Failed to delete comment'}));
                    }
                } else {
                    res.writeHead(401, {'Content-Type': 'application/json'});
                    res.end(JSON.stringify({message: 'Unauthorized'}));
                }
            }
        } catch (error) {
            res.writeHead(500, {'Content-Type': 'application/json'});
            res.end(JSON.stringify({message: 'Internal Server Error'}));
        }
    }
}