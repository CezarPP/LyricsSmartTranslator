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
}