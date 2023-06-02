export default function Annotation(id, userId, translationId, beginPos, endPos, content, reviewed) {
    this.id = id;
    this.userId = userId;
    this.translationId = translationId;
    this.beginPos = beginPos;
    this.endPos = endPos;
    this.content = content;
    this.reviewed = reviewed;
}

Annotation.prototype.toObject = function () {
    return {
        id: this.id,
        userId: this.userId,
        translationId: this.translationId,
        beginPos: this.beginPos,
        endPos: this.endPos,
        content: this.content,
        reviewed: this.reviewed,
    };
};