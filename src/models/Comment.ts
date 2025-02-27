export class Comment{
    id: number;
    userId: number;
    translationId: number;
    content: String;
    constructor(id: number, userId: number, translationId: number, content: String) {
        this.id = id;
        this.userId = userId;
        this.translationId = translationId;
        this.content = content;
    }
    toObject() {
        return {
            id: this.id,
            userId: this.userId,
            translationId: this.translationId,
            content: this.content
        };
    }
}