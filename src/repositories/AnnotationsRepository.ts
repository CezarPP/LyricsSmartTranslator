import {Pool, QueryResult} from "pg";
import {Annotation} from "../models/Annotation";

export class AnnotationsRepository {
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

    async getAnnotationById(annotationId: number) {
        const query = 'SELECT * FROM annotations WHERE id = $1';
        const values = [annotationId];

        try {
            const result = await this.db.query(query, values);
            if (result.rows.length === 0) {
                return null;
            }
            const row = result.rows[0];
            return new Annotation(row.id, row.user_id, row.translation_id,
                row.begin_pos, row.end_pos, row.content, row.reviewed);

        } catch (error) {
            console.error(`Failed to fetch annotation: ${error}`);
            throw error;
        }
    }

    async getAllAnnotations() {
        const query = 'SELECT * FROM annotations';
        const result = await this.db.query(query);
        return this.getAllAnnotationsFromResult(result);
    }

    async deleteAnnotation(annotationId: number) {
        try {
            await this.db.query('DELETE FROM annotations WHERE id = $1', [annotationId]);
            console.log('Annotation deleted successfully');
        } catch (err) {
            console.error('Error executing query to delete annotation ', err);
        }
    }

    async addAnnotation(annotation: Annotation): Promise<number> {
        try {
            const query: string = 'INSERT INTO annotations (user_id, translation_id, begin_pos, end_pos, content) VALUES ($1, $2, $3, $4, $5) RETURNING id';
            const result = await this.db.query(query,
                [annotation.userId, annotation.translationId, annotation.beginPos,
                    annotation.endPos, annotation.content]
            );
            return result.rows[0].id;
        } catch (err) {
            console.error('Error executing query to add annotation ', err);
            throw err;
        }
    }

    async getByReviewed(reviewed: boolean): Promise<Annotation[]> {
        const query = 'SELECT * FROM annotations WHERE reviewed  = $1';
        const result = await this.db.query(query, [reviewed]);
        return await this.getAllAnnotationsFromResult(result);
    }

    async getByTranslationIdAndReviewed(translationId: number, reviewed: boolean): Promise<Annotation[]> {
        const query = 'SELECT * FROM annotations WHERE translation_id = $1 AND reviewed = $2';
        const result = await this.db.query(query, [translationId, reviewed]);
        return await this.getAllAnnotationsFromResult(result);
    }

    async getByTranslationId(translationId: number): Promise<Annotation[]> {
        const query = 'SELECT * FROM annotations WHERE translation_id = $1';
        const result = await this.db.query(query, [translationId]);
        return await this.getAllAnnotationsFromResult(result);
    }

    async getAllAnnotationsFromResult(result: QueryResult): Promise<Annotation[]> {
        try {
            let annotations: Annotation[] = [];
            for (let i = 0; i < result.rows.length; i++) {
                const it = result.rows[i];
                annotations.push(
                    new Annotation(it.id, it.user_id, it.translation_id,
                        it.begin_pos, it.end_pos, it.content, it.reviewed));
            }
            return annotations;
        } catch (error) {
            console.error(`Failed to fetch all annotations: ${error}`);
            throw error;
        }
    }

    async checkOverlapAnnotations(beginPos: number, endPos: number, translationId: number): Promise<boolean> {
        // language=SQL
        const query = 'SELECT check_overlap_annotations($1, $2, $3)';
        const values = [beginPos, endPos, translationId];
        try {
            const res = await this.db.query(query, values);
            return res.rows[0].check_overlap_annotations;
        } catch (err) {
            console.error('Error checking for annotation overlap ', err);
        }
        return true;
    }

    async updateAnnotationContent(annotationId: number, content: string) {
        try {
            const query: string = 'UPDATE annotations SET content = $1, reviewed = FALSE WHERE id = $2';
            const values = [content, annotationId];
            await this.db.query(query, values);
        } catch (err) {
            console.error('Error executing query to update annotation ', err);
            throw err;
        }
    }
}