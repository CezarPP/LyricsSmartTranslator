import {IncomingMessage, ServerResponse} from "http";
import {CommentsRepository} from "../repositories/CommentsRepository";
import {Comment} from "../models/Comment";
import {UsersRepository} from "../auth-microservice/repositories/UsersRepository";
import {TranslationsRepository} from "../repositories/TranslationsRepository";
import {BaseController} from "./BaseController";
import {sendMessage} from "../util/sendMessage";
import url from "url";
import {getLoggedUser} from "../util/getLoggedUser";

export class CommentsController extends BaseController {
    private commentsRepository: CommentsRepository;
    private translationsRepository: TranslationsRepository;
    private usersRepository: UsersRepository;

    constructor() {
        super();
        this.commentsRepository = new CommentsRepository();
        this.translationsRepository = new TranslationsRepository();
        this.usersRepository = new UsersRepository();
    }

    async handleGetById(req: IncomingMessage, res: ServerResponse) {
        if (!req.url) {
            sendMessage(res, 500, 'Internal server error');
            return;
        }

        const commentId = parseInt(req.url.split('/')[3]);

        if (isNaN(commentId)) {
            sendMessage(res, 400, 'Invalid comment id');
            return;
        }

        const comment = await this.commentsRepository.getCommentById(commentId);

        if (comment === null) {
            sendMessage(res, 404, 'Comment not found');
            return;
        }

        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify(comment.toObject()));
    }

    async handleGetAll(req: IncomingMessage, res: ServerResponse) {
        try {
            const comments = await this.commentsRepository.getAllComments();
            res.writeHead(200, {'Content-Type': 'application/json'});
            res.write(JSON.stringify(comments));
            res.end();
        } catch (error) {
            res.writeHead(500, {'Content-Type': 'application/json'});
            res.write(JSON.stringify({message: 'Internal Server Error'}));
            res.end();
        }
    }

    async handleFiltering(req: IncomingMessage, res: ServerResponse) {
        if (!req.url) {
            sendMessage(res, 500, 'Internal server error');
            return;
        }

        const parsedURL = url.parse(req.url, true);
        const parameters = parsedURL.query;
        const translationIdString = parameters["translationId"] as string;
        const translationId = (translationIdString === undefined) ? 0 : parseInt(translationIdString);

        if (translationId === undefined || isNaN(translationId)) {
            sendMessage(res, 500, 'Invalid Request parameters');
            return;
        }

        const translation = await this.translationsRepository.getTranslationById(translationId);

        if (translation === null) {
            sendMessage(res, 404, 'Translation not found');
            return;
        }
        try {
            const comments = await this.commentsRepository.getCommentsByTranslationId(translationId);

            let commentsData = [];
            for (let i = 0; i < comments.length; i++) {
                const comment = comments[i];

                const user = await this.usersRepository.getUserById(comment.userId);
                if (user === null)
                    continue;
                const commentData = {
                    id: comment.id,
                    username: user.username,
                    imageId: user.img_id,
                    translationId: comment.translationId,
                    content: comment.content
                }
                commentsData.push(commentData)
            }
            res.writeHead(200, {'Content-Type': 'application/json'});
            res.write(JSON.stringify(commentsData));
            res.end();
        } catch (error) {
            sendMessage(res, 500, 'Internal server error');
            return;
        }
    }

    async handlePost(req: IncomingMessage, res: ServerResponse) {
        try {
            let body = '';

            req.on('data', (chunk) => {
                body += chunk.toString();
            });
            req.on('end', async () => {
                const parsedData = JSON.parse(body);
                const translationId = parsedData.translationId;
                const content = parsedData.content;

                if (!translationId || !content) {
                    sendMessage(res, 400, 'Invalid request parameters');
                    return;
                }

                const user = await getLoggedUser(req);

                if (user === null) {
                    sendMessage(res, 401, 'You need to be logged in to comment');
                    return;
                }

                const transId = parseInt(translationId);
                const translation = await this.translationsRepository.getTranslationById(transId);
                if (translation === null) {
                    sendMessage(res, 404, 'Translation not found');
                    return;
                }

                const comment = new Comment(0, user.id, translation.id, content);

                const commentId = await this.commentsRepository.addComment(comment);
                res.writeHead(200, {'Content-Type': 'application/json'});
                res.write(JSON.stringify({message: 'Comment added successfully', id: commentId}));
                res.end();
            });
        } catch (error) {
            sendMessage(res, 500, 'Internal server error');
        }
    }


    async handlePut(req: IncomingMessage, res: ServerResponse) {
        try {
            let body = '';
            req.on('data', chunk => {
                body += chunk.toString();
            });

            req.on('end', async () => {
                if (!req.url) {
                    sendMessage(res, 500, 'Internal server error');
                    return;
                }

                const parsedData = JSON.parse(body);
                const newContent = parsedData.newContent;

                if (!newContent) {
                    sendMessage(res, 400, 'Invalid request parameters');
                    return;
                }

                const commId = parseInt(req.url.split('/')[3]);
                const comment = await this.commentsRepository.getCommentById(commId);

                if (comment === null) {
                    sendMessage(res, 404, 'Comment not found');
                    return;
                } else {
                    const loggedUser = await getLoggedUser(req);
                    if (loggedUser === null) {
                        sendMessage(res, 401, 'Unauthorized');
                    } else if (loggedUser.id === 1 || loggedUser.id === comment.userId) {
                        const status = await this.commentsRepository.updateComment(commId, newContent);
                        if (status) {
                            sendMessage(res, 200, 'Comment successfully updated');
                        } else {
                            sendMessage(res, 500, 'Failed to update comment');
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

    async handleDelete(req: IncomingMessage, res: ServerResponse) {
        try {
            if (!req.url) {
                sendMessage(res, 500, 'Internal server error');
                return;
            }

            const commId = parseInt(req.url.split('/')[3]);
            const comment = await this.commentsRepository.getCommentById(commId);
            if (comment === null) {
                sendMessage(res, 404, 'Comment not found');
            } else {
                const loggedUser = await getLoggedUser(req);
                if (loggedUser === null) {
                    sendMessage(res, 401, 'Unauthorized');
                } else if (loggedUser.id === 1 || loggedUser.id === comment.userId) {
                    const status = await this.commentsRepository.deleteComment(commId);

                    if (status) {
                        sendMessage(res, 200, 'Comment deleted successfully');
                    } else {
                        sendMessage(res, 500, 'Failed to delete comment');
                    }
                } else {
                    sendMessage(res, 401, 'Unauthorized');
                }
            }
        } catch (error) {
            sendMessage(res, 500, 'Internal server error');
        }
    }
}