import {StatsRepository} from "../repositories/StatsRepository";
import {IncomingMessage, ServerResponse} from "http";
import assert from "assert";

export class StatsController {
    private statsRepository: StatsRepository;

    constructor() {
        this.statsRepository = new StatsRepository();
    }

    async handleApiRequest(req: IncomingMessage, res: ServerResponse) {
        const url = req.url;
        assert(url);
        if (url.startsWith("/api/stats/users")) {
            await this.getMostActiveUsers(req, res);
        } else {
            res.statusCode = 404;
            res.end(`Method not found for path ${req.url}`);
        }
    }

    async getMostActiveUsers(req: IncomingMessage, res: ServerResponse) {
        const users = await this.statsRepository.getMostActiveUsers(25);
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify(users));
    }
}