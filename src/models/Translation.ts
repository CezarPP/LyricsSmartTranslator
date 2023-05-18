export class Translation {
    id: number;
    songId: number;
    userId: number;
    language: string;
    description: string;
    lyrics: string;
    no_views: number;
    no_likes: number;
    time: Date;

    constructor(id: number, songId: number, userId: number, language: string,
                description: string, lyrics: string, no_views: number,
                no_likes: number, time: Date) {
        this.id = id;
        this.songId = songId;
        this.userId = userId;
        this.language = language;
        this.description = description;
        this.lyrics = lyrics;
        this.no_views = no_views;
        this.no_likes = no_likes;
        this.time = time;
    }
}