export class Recover{
    id: number;
    userId: number;
    email: string;
    token: string;

    constructor(id: number, userId: number, email: string, token: string) {
        this.id = id;
        this.userId = userId;
        this.email = email;
        this.token  = token;
    }

    toObject(){
        return{
            id: this.id,
            userId: this.userId,
            email: this.email,
            token: this.token,
        };
    }
}