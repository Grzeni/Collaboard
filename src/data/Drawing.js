export default class Drawing {
    constructor(color, penSize, eraserSize, isEraserSelected, pixelArray) {
        this.dataType = "drawing";
        this.color = color;
        this.penSize = penSize;
        this.eraserSize = eraserSize;
        this.isEraserSelected = isEraserSelected;
        this.pixelArray = pixelArray;
    }

    renderElement(canvElem) {
        let context = canvElem.getContext('2d');
        context.strokeStyle = this.isEraserSelected ? "white" : this.color;
        context.lineWidth = this.isEraserSelected ? this.eraserSize : this.penSize;
        context.beginPath();
        let first = true;
        for (const p of this.pixelArray) {
            let [x, y] = p;
            if (first) {
                context.moveTo(x, y);
                first = false;
            } else {
                context.lineTo(x, y);
            }
            context.stroke();
        }
        context.closePath();
    }
}