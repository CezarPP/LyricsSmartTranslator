export class ImageModel {
    id: number;
    img: Buffer;

    constructor(id: number, img: Buffer) {
        this.id = id;
        this.img = img;
    }
}
