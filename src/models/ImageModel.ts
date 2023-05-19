export class ImageModel {
    id: number;
    link: string;
    ext: string;

    constructor(id: number, link: string, ext: string) {
        this.id = id;
        this.link = link;
        this.ext = ext;
    }
}
