import {IncomingMessage} from "http";
import {parse} from "cookie";
import {JwtPayload, verify} from "jsonwebtoken";

const secretKey = 'ionut';

export function authenticateUser(req: IncomingMessage): number {

    const cookies = req.headers.cookie;
    console.log(cookies);
    // Parse the cookie to retrieve the JWT
    const parsedCookies = parse(cookies || '');
    const jwtCookie = parsedCookies.jwt;

    if (jwtCookie) {
        try {
            // Verify and decode the JWT to access the payload
            const decodedToken = verify(jwtCookie, secretKey) as JwtPayload;
            return decodedToken.userId;
        } catch (error) {
            // Handle JWT verification errors
            console.error('JWT verification failed:', error);
        }
    }
    return -1;
}