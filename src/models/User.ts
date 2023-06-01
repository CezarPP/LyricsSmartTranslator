export class User {
    id: number;
    img_id: number;
    username: string;
    password: string;
    email: string;

    constructor(id: number, img_id: number, username: string, password: string, email: string) {
        this.id = id;
        this.img_id = img_id;
        this.username = username;
        this.password = password;
        this.email = email;
    }


    toObject(){
        return{
            id: this.id,
            username: this.username,
        };
    }
}



