import {IncomingMessage} from "http";
import {User} from "../models/User";
import fetch from 'node-fetch';

export async function getLoggedUser(req: IncomingMessage): Promise<User | null> {
    const headers: { [key: string]: string } = {};
    Object.keys(req.headers).forEach(key => {
        const value = req.headers[key];
        if (typeof value !== 'undefined') {
            headers[key] = Array.isArray(value) ? value.join(', ') : value;
        }
    });

    try {
        const response = await fetch('http://localhost:3000/api/me', {
            method: 'GET',
            headers: headers
        });

        if (!response.ok) {
            return null;
        }

        const data = await response.json();
        if (!data) {
            return null;
        }

        return new User(data.id, 5, data.username, '', data.email);
    } catch (error) {
        console.log("Error occurred while requesting or processing data from microservice: ", error);
        return null;
    }
}
