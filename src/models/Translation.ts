class Translation {
    id: number;
    song_id: number;
    user_id: number;
    description: string;
    lyrics: string;
    no_views: number;
    no_likes: number;
    time: Date;

    constructor(id: number, song_id: number, user_id: number, description: string, lyrics: string, no_views: number, no_likes: number, time: Date) {
        this.id = id;
        this.song_id = song_id;
        this.user_id = user_id;
        this.description = description;
        this.lyrics = lyrics;
        this.no_views = no_views;
        this.no_likes = no_likes;
        this.time = time;
    }
}