export class Annotation {
    id: number;
    userId: number;
    translationId: number;
    beginPos: number;
    endPos: number;
    content: string;
    reviewed: boolean;

    constructor(id: number, userId: number, translationId: number, beginPos: number, endPos: number, content: string, reviewed: boolean) {
        this.id = id;
        this.userId = userId;
        this.translationId = translationId;
        this.beginPos = beginPos;
        this.endPos = endPos;
        this.content = content;
        this.reviewed = reviewed;
    }

    toObject() {
        return {
            id: this.id,
            userId: this.userId,
            translationId: this.translationId,
            beginPos: this.beginPos,
            endPos: this.endPos,
            content: this.content,
            reviewed: this.reviewed,
        };
    }
}