import {IncomingMessage, ServerResponse} from "http";
import assert from "assert";
import {AnnotationsRepository} from "../repositories/AnnotationsRepository";
import {sendMessage} from "../util/sendMessage";
import {Annotation} from "../models/Annotation";
import {UsersController} from "./UsersController";
import * as url from "url";
import {BaseController} from "./BaseController";

export class AnnotationsController extends BaseController {
    private annotationsRepository: AnnotationsRepository;
    private usersController: UsersController;

    constructor() {
        super();
        this.annotationsRepository = new AnnotationsRepository();
        this.usersController = new UsersController();
    }

    async handleGetById(req: IncomingMessage, res: ServerResponse) {
        const annotation = await this._getAnnotationFromRequest(req, res);
        if (annotation === null)
            return;

        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify(annotation.toObject()));
    }

    async handleGetAll(req: IncomingMessage, res: ServerResponse) {
        const annotations: Annotation[] = await this.annotationsRepository.getAllAnnotations();
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify(annotations));
    }

    async handleFiltering(req: IncomingMessage, res: ServerResponse) {
        assert(req.url);
        const parsedUrl = url.parse(req.url, true);
        const parameters = parsedUrl.query;
        const translationIdString = parameters["translationId"] as string;
        const reviewedString = parameters["reviewed"] as string;
        let annotations: Annotation[] = [];
        if (translationIdString === undefined && reviewedString === undefined) {
            sendMessage(res, 400, 'Invalid request');
            return;
        } else if (translationIdString !== undefined && reviewedString === undefined) {
            const translationId: number = parseInt(translationIdString);
            if (isNaN(translationId)) {
                sendMessage(res, 400, 'Invalid request');
                return;
            }
            annotations = await this.annotationsRepository.getByTranslationId(translationId);
        } else if (translationIdString === undefined && reviewedString !== undefined) {
            const reviewed: number = parseInt(reviewedString);
            if (isNaN(reviewed)) {
                sendMessage(res, 400, 'Invalid request');
                return;
            }
            annotations = await this.annotationsRepository.getByReviewed((reviewed === 1));
        } else {
            const translationId: number = parseInt(translationIdString);
            const reviewed: number = parseInt(reviewedString);
            if (isNaN(translationId) || isNaN(reviewed)) {
                sendMessage(res, 400, 'Invalid request');
                return;
            }
            annotations = await this.annotationsRepository.getByTranslationIdAndReviewed(translationId, (reviewed === 1));
        }

        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify(annotations));
    }

    async handlePost(req: IncomingMessage, res: ServerResponse) {
        let body = '';
        req.on('data', chunk => {
            body += chunk.toString();
        });

        req.on('end', async () => {
            const postData = JSON.parse(body);
            const translationId = postData.translationId as number;
            const beginPos = postData.beginPos as number;
            const endPos = postData.endPos as number;
            const content = postData.content as string;

            if (translationId === undefined || beginPos === undefined ||
                endPos === undefined || content === undefined) {
                sendMessage(res, 400, 'Invalid request');
                return;
            }

            const user = await this.usersController.getLoggedUser(req, res);
            if (user === null) {
                sendMessage(res, 401, 'You need to be authenticated to post an annotation');
                return;
            }

            const translation = await this.translationRepository.getTranslationById(translationId);
            if (translation === null) {
                sendMessage(res, 404, 'Annotation not found');
                return;
            }

            const overlaps = await this.annotationsRepository.checkOverlapAnnotations(beginPos, endPos, translationId);
            if (overlaps) {
                sendMessage(res, 409, 'Annotations overlaps another one');
                return;
            }

            const annotation =
                new Annotation(0, user.id, translationId, beginPos, endPos, content, false);

            annotation.id = await this.annotationsRepository.addAnnotation(annotation);

            res.statusCode = 201;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify(annotation.toObject()));
        });
    }

    // You can only change the content, not its position
    // Changing an annotation will make it unverified unless you are the admin
    async handlePut(req: IncomingMessage, res: ServerResponse) {
        let body = '';
        req.on('data', chunk => {
            body += chunk.toString();
        });

        req.on('end', async () => {
            const putData = JSON.parse(body);
            const content = putData.content as string;
            let reviewed = putData.reviewed as boolean;
            if (content === undefined || reviewed === undefined) {
                sendMessage(res, 400, 'Invalid request');
                return;
            }

            const annotation = await this._getAnnotationFromRequest(req, res);
            if (annotation === null)
                return;
            const user = await this.usersController.getLoggedUser(req, res);
            if (user === null) {
                sendMessage(res, 401, 'You need to be authenticated to update an annotation');
                return;
            }

            if (annotation.userId !== user.id && user.id !== 1) {
                sendMessage(res, 403, 'Only the user that added the annotation can update it');
                return;
            }

            if (user.id !== 1)
                reviewed = false;

            console.log("Setting reviewed to " + reviewed);
            await this.annotationsRepository.updateAnnotationContent(annotation.id, content, reviewed);

            console.log("Annotation with id " + annotation.id + " updated successfully");

            sendMessage(res, 200, 'Annotation updated successfully!');
        });
    }

    async handleDelete(req: IncomingMessage, res: ServerResponse) {
        const annotation = await this._getAnnotationFromRequest(req, res);
        if (annotation === null)
            return;

        const user = await this.usersController.getLoggedUser(req, res);
        if (user === null) {
            sendMessage(res, 401, 'You need to be authenticated to delete an annotation');
            return;
        }

        if (annotation.userId !== user.id && user.id !== 1) {
            sendMessage(res, 403, 'Only the user that added the annotation can delete it');
            return;
        }
        await this.annotationsRepository.deleteAnnotation(annotation.id);

        sendMessage(res, 200, 'Annotation deleted successfully!');
    }

    private async _getAnnotationFromRequest(req: IncomingMessage, res: ServerResponse) {
        assert(req.url);

        const annotationId = parseInt(req.url.split('/')[3]);

        if (isNaN(annotationId)) {
            sendMessage(res, 400, 'Invalid annotation id');
            return null;
        }

        const annotation = await this.annotationsRepository.getAnnotationById(annotationId);

        if (annotation === null) {
            sendMessage(res, 404, 'Annotation not found');
        }
        return annotation;
    }
}