class Annotation {
    id: number;
    user_id: number;
    translation_id: number;
    begin_pos: number;
    end_pos: number;
    content: string;

    constructor(id: number, user_id: number, translation_id: number, begin_pos: number, end_pos: number, content: string) {
        this.id = id;
        this.user_id = user_id;
        this.translation_id = translation_id;
        this.begin_pos = begin_pos;
        this.end_pos = end_pos;
        this.content = content;
    }
}