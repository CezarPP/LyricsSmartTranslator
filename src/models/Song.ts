class Song {
    id: number;
    primary_translation: number;
    image_id: number;
    artist: string;
    title: string;
    link: string;

    constructor(id: number, primary_translation: number, image_id: number, artist: string, title: string, link: string) {
        this.id = id;
        this.primary_translation = primary_translation;
        this.image_id = image_id;
        this.artist = artist;
        this.title = title;
        this.link = link;
    }
}