import {IncomingMessage, ServerResponse} from "http";
import assert from "assert";
import url from "url";
import {sendMessage} from "../util/sendMessage";
import {SongsRepository} from "../repositories/SongsRepository";
import {TranslationsRepository} from "../repositories/TranslationsRepository";
import {ImagesRepository} from "../repositories/ImagesRepository";

export abstract class BaseController {

    protected songRepository: SongsRepository;
    protected translationRepository: TranslationsRepository;
    protected imagesRepository: ImagesRepository;

    protected constructor() {
        this.songRepository = new SongsRepository();
        this.translationRepository = new TranslationsRepository();
        this.imagesRepository = new ImagesRepository();
    }

    abstract handleGetById(req: IncomingMessage, res: ServerResponse): Promise<void>;

    abstract handleGetAll(req: IncomingMessage, res: ServerResponse): Promise<void>;

    abstract handleFiltering(req: IncomingMessage, res: ServerResponse): Promise<void>;

    abstract handlePost(req: IncomingMessage, res: ServerResponse): Promise<void>;

    abstract handlePut(req: IncomingMessage, res: ServerResponse): Promise<void>;

    abstract handleDelete(req: IncomingMessage, res: ServerResponse): Promise<void>;

    async handleApiRequest(req: IncomingMessage, res: ServerResponse) {
        if (req.method === 'GET') {
            assert(req.url);
            const parsedUrl = url.parse(req.url, true);
            const hasParameters = Object.keys(parsedUrl.query).length > 0;
            if (req.url.split('/').length > 3) {
                await this.handleGetById(req, res);
            } else if (!hasParameters) {
                await this.handleGetAll(req, res);
            } else {
                await this.handleFiltering(req, res);
            }
        } else if (req.method === 'POST') {
            await this.handlePost(req, res);
        } else if (req.method === 'PUT') {
            await this.handlePut(req, res);
        } else if (req.method === 'DELETE') {
            await this.handleDelete(req, res);
        } else {
            sendMessage(res, 405, `Method not allowed for path ${req.url}`);
        }
    }
}