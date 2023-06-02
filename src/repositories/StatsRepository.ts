import {Pool} from "pg";
import {User} from "../models/User";

export class StatsRepository {
    private db: Pool;

    constructor() {
        this.db = new Pool({
            user: 'postgres',
            host: 'post-translations.czgheu3bschd.eu-north-1.rds.amazonaws.com',
            database: 'postgres',
            password: process.env.AWSPASSWORD,
            port: 5432,
            ssl: {
                rejectUnauthorized: false
            }
        });
    }

    async getMostActiveUsers(maxRows: number) {
        try {
            const result
                = await this.db.query('SELECT * FROM get_most_active_users($1);', [maxRows]);

            const users: User[] = [];
            const rows = result.rows;
            for (let i = 0; i < rows.length; i++) {
                users.push(new User(rows[i].user_id, rows[i].img_id, rows[i].username, rows[i].activity_count, rows[i].email));
            }
            return users;
        } catch (err) {
            console.error('Error executing query ' + err);
            throw err;
        }
    }
}