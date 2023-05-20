export class Song {
    id: number;
    primary_translation: number;
    imageId: number;
    artist: string;
    title: string;
    link: string;

    constructor(id: number, primary_translation: number, image_id: number, artist: string, title: string, link: string) {
        this.id = id;
        this.primary_translation = primary_translation;
        this.imageId = image_id;
        this.artist = artist;
        this.title = title;
        this.link = link;
    }

    toObject() {
        return {
            id: this.id,
            primary_translation: this.primary_translation,
            imageId: this.imageId,
            artist: this.artist,
            title: this.title,
            link: this.link
        };
    }
}