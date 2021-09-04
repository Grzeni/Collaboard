
export default class Markdown {
    constructor(markdownId, markdownText, positionX, positionY, isDeleted = false) {
        this.dataType = "text";
        this.markdownId = markdownId;
        this.markdownText = markdownText;
        this.positionX = positionX;
        this.positionY = positionY;
        this.isDeleted = isDeleted;
    }
}