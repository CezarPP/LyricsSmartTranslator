class User {
    id: number;
    img_id: number;
    username: string;
    password: string;

    constructor(id: number, img_id: number, username: string, password: string) {
        this.id = id;
        this.img_id = img_id;
        this.username = username;
        this.password = password;
    }
}