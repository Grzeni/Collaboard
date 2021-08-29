
export default class Markdown {
    constructor(markdownId, markdownText, positionX, positionY, isEdited = false, isDeleted = false, isMoved = false) {
        this.dataType = "text";
        this.markdownId = markdownId;
        this.markdownText = markdownText;
        this.positionX = positionX;
        this.positionY = positionY;
        this.isEdited = isEdited;
        this.isDeleted = isDeleted;
        this.isMoved = isMoved;
    }
}