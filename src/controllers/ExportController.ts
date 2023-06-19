import { IncomingMessage, ServerResponse } from "http";
import crypto from "crypto";
//import fetch from "node-fetch";
//import axios, { AxiosResponse } from 'axios';

export class ExportController {
    static tumblrTemporaryOauthToken = '';
    static tumblrTemporaryOauthTokenSecret = '';

    private wordpressClientId = '87363';
    private wordpressClientSecret = 'MlsIF37Dyx6ONg6TxMCRc6F5YYf8V0R3ZK7pqZq7cW0gigFAhTUaxyRrJBnq1a9E';
    private wordpressRedirectUri = 'https://lyricssmarttranslator.com/export-data/wordpress';

    static postTitle = '';
    static postContent = '';
    static songId = '';

    async handleTumblrExport(req: IncomingMessage, res: ServerResponse) {
        console.log("Exporting to Tumblr...");
        try {
            let body = '';
            req.on('data', (chunk) => {
                body += chunk;
            });

            req.on('end', async () => {
                const postData = JSON.parse(body);
                ExportController.postTitle = postData.postTitle;
                ExportController.postContent = postData.postText;
                ExportController.songId = postData.songId;

                const temporaryCredentials = await this.getOAuthTemporaryCredentials();
                //console.log(temporaryCredentials);
                ExportController.tumblrTemporaryOauthToken = temporaryCredentials.oauthToken;
                ExportController.tumblrTemporaryOauthTokenSecret = temporaryCredentials.oauthTokenSecret;


                const authorizationUrl = `https://www.tumblr.com/oauth/authorize?oauth_token=${temporaryCredentials.oauthToken}`;
                //console.log("Authorize the application by visiting the following URL: " + authorizationUrl);

                res.writeHead(200, {'Content-Type': 'application/json'});
                res.write(JSON.stringify({message: authorizationUrl}));
                res.end();
            });
        } catch (error) {
            console.error("Error in handleTumblrExport function from ExportController.ts: ", error);
        }
    }

    async handleTumblrExportData(req: IncomingMessage, res: ServerResponse) {
        const blogIdentifier = "proiectweb";
        const consumerKey = "sRw63z7tFWa3bLWqJiaRu8zolYpxa7Nk5gqHhIe9oKnwgjSYvu";
        const consumerSecret = "AGhpwp3PR1gM3gUCs335HQxH7fKDCgsZYet9VrqSbpPAsW7jLm";


        const url = req.url || '';
        const searchParams = new URLSearchParams(url.split('?')[1]);
        const oauthToken = searchParams.get('oauth_token') || '';
        const oauthVerifier = searchParams.get('oauth_verifier') || '';

        console.log('oauth_token:', oauthToken);
        console.log('oauth_verifier:', oauthVerifier);
        console.log('this.tumblrTemporaryOauthToken:', ExportController.tumblrTemporaryOauthToken);
        console.log('this.tumblrTemporaryOauthTokenSecret:', ExportController.tumblrTemporaryOauthTokenSecret);

        const oauthNonce = crypto.randomBytes(16).toString("hex");
        const oauthTimestamp = Math.floor(Date.now() / 1000).toString();
        const tokenCredentials = await this.getOAuthAccessTokens(ExportController.tumblrTemporaryOauthToken, ExportController.tumblrTemporaryOauthTokenSecret,
            oauthVerifier, consumerKey, consumerSecret);
        console.log(tokenCredentials);

        // Continue with the export process using the permanent access tokens
        const response = await fetch(
            `https://api.tumblr.com/v2/blog/${blogIdentifier}/post`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `OAuth oauth_consumer_key="${encodeURIComponent(consumerKey)}", oauth_token="${encodeURIComponent(tokenCredentials.oauthToken)}", oauth_signature_method="HMAC-SHA1", oauth_timestamp="${encodeURIComponent(oauthTimestamp)}", oauth_nonce="${encodeURIComponent(oauthNonce)}", oauth_version="1.0a", oauth_signature="${encodeURIComponent(tokenCredentials.oauthTokenSecret + '&' + consumerSecret)}"`,
                },
                body: JSON.stringify({
                    type: "text",
                    title: "My Exported Page",
                    body: "This is my exported page on Tumblr!",
                }),
            }
        );


        const data = await response.json();
        console.log(data);
        console.log("Post ID:", data.response.id);

        const redirectURL = '/song-page/' + ExportController.songId;
        res.writeHead(302, { 'Location': redirectURL });
        res.end();
    }

    async getOAuthTemporaryCredentials() {
        const consumerKey = "sRw63z7tFWa3bLWqJiaRu8zolYpxa7Nk5gqHhIe9oKnwgjSYvu";
        const consumerSecret = "AGhpwp3PR1gM3gUCs335HQxH7fKDCgsZYet9VrqSbpPAsW7jLm";

        try {
            const oauthNonce = crypto.randomBytes(16).toString("hex");
            const oauthTimestamp = Math.floor(Date.now() / 1000).toString();

            const oauthSignatureMethod = "HMAC-SHA1";
            const oauthVersion = "1.0a";

            const signatureBaseString = this.generateSignatureBaseString(
                "POST",
                "https://www.tumblr.com/oauth/request_token",
                {
                    oauth_consumer_key: consumerKey,
                    oauth_nonce: oauthNonce,
                    oauth_signature_method: oauthSignatureMethod,
                    oauth_timestamp: oauthTimestamp,
                    oauth_version: oauthVersion,
                }
            );
            const signingKey = `${encodeURIComponent(consumerSecret)}&`;
            const oauthSignature = this.generateHmacSha1Signature(
                signatureBaseString,
                signingKey
            );

            const authorizationHeader = this.generateOAuthAuthorizationHeader({
                oauth_consumer_key: consumerKey,
                oauth_nonce: oauthNonce,
                oauth_signature: oauthSignature,
                oauth_signature_method: oauthSignatureMethod,
                oauth_timestamp: oauthTimestamp,
                oauth_version: oauthVersion,
            });

            const response = await fetch(
                "https://www.tumblr.com/oauth/request_token",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/x-www-form-urlencoded",
                        Authorization: authorizationHeader,
                    },
                }
            );

            const data = await response.text();
            const responseParams = new URLSearchParams(data);
            const oauthToken = responseParams.get("oauth_token");
            const oauthTokenSecret = responseParams.get("oauth_token_secret");

            return {
                oauthToken: oauthToken as string,
                oauthTokenSecret: oauthTokenSecret as string,
            };
        } catch (error) {
            console.error("Failed to obtain OAuth temporary credentials:", error);
            throw error;
        }
    }

    async getOAuthAccessTokens(temporaryToken: string, temporaryTokenSecret: string, oauthVerifier: string, consumerKey: string, consumerSecret: string) {
        try {
            const oauthNonce = crypto.randomBytes(16).toString("hex");
            const oauthTimestamp = Math.floor(Date.now() / 1000).toString();
            const oauthSignatureMethod = "HMAC-SHA1";
            const oauthVersion = "1.0a";

            const signatureBaseString = this.generateSignatureBaseString(
                "POST",
                "https://www.tumblr.com/oauth/access_token",
                {
                    oauth_consumer_key: consumerKey,
                    oauth_nonce: oauthNonce,
                    oauth_signature_method: oauthSignatureMethod,
                    oauth_timestamp: oauthTimestamp,
                    oauth_token: temporaryToken,
                    oauth_verifier: oauthVerifier,
                    oauth_version: oauthVersion,
                }
            );
            const signingKey = `${encodeURIComponent(consumerSecret)}&${encodeURIComponent(temporaryTokenSecret)}`;
            const oauthSignature = this.generateHmacSha1Signature(
                signatureBaseString,
                signingKey
            );

            const authorizationHeader = this.generateOAuthAuthorizationHeader({
                oauth_consumer_key: consumerKey,
                oauth_nonce: oauthNonce,
                oauth_signature: oauthSignature,
                oauth_signature_method: oauthSignatureMethod,
                oauth_timestamp: oauthTimestamp,
                oauth_token: temporaryToken,
                oauth_verifier: oauthVerifier,
                oauth_version: oauthVersion,
            });

            const response = await fetch(
                "https://www.tumblr.com/oauth/access_token",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/x-www-form-urlencoded",
                        Authorization: authorizationHeader,
                    },
                }
            );

            const data = await response.text();
            const responseParams = new URLSearchParams(data);
            const oauthToken = responseParams.get("oauth_token");
            const oauthTokenSecret = responseParams.get("oauth_token_secret");

            return {
                oauthToken: oauthToken as string,
                oauthTokenSecret: oauthTokenSecret as string,
            };
        } catch (error) {
            console.error("Failed to obtain OAuth access tokens:", error);
            throw error;
        }
    }

    generateSignatureBaseString(httpMethod: string, url: string, baseParams: Record<string, string>) {
        const encodedParams = encodeURIComponent(Object.keys(baseParams).sort().map((key) => `${key}=${baseParams[key]}`).join("&"));
        return `${httpMethod.toUpperCase()}&${encodeURIComponent(url)}&${encodedParams}`;
    }
    generateHmacSha1Signature(signatureBaseString: string, signingKey: string) {
        return crypto.createHmac("sha1", signingKey).update(signatureBaseString).digest("base64");
    }
    generateOAuthAuthorizationHeader(params: Record<string, string>) {
        const encodedParams = Object.keys(params).sort().map((key) => `${key}="${encodeURIComponent(params[key])}"`).join(", ");
        return `OAuth ${encodedParams}`;
    }








    async handleWordpressExport(req: IncomingMessage, res: ServerResponse) {
        console.log("Exporting to Wordpress...");

        /*let body = '';
        req.on('data', (chunk) => {
            body += chunk;
        });

        req.on('end', async () => {
            const postData = JSON.parse(body);
            const tokenUrl = 'https://public-api.wordpress.com/oauth2/token';
            const clientId = postData.clientId;
            const clientSecret = postData.clientSecret;
            const grantType = 'password';
            const username = postData.username;
            const password = postData.password;
            const blogUrl = postData.blogUrl;
            const postTitle = postData.postTitle;
            const postContent = postData.postText;

            const requestBody = new URLSearchParams();
            requestBody.append('client_id', clientId);
            requestBody.append('client_secret', clientSecret);
            requestBody.append('grant_type', grantType);
            requestBody.append('username', username);
            requestBody.append('password', password);
            console.log(requestBody)

            try {
                const response = await fetch(tokenUrl, {
                    method: 'POST',
                    body: requestBody,
                });

                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }

                const data = await response.json();
                const accessToken = data.access_token;

                // Use the access token to make authenticated API calls
                const blogId = await this.getBlogId(accessToken, blogUrl);

                this.makeNewPost(accessToken, blogId, postTitle, postContent);
                // this.printAllPosts(accessToken, blogId);

            } catch (error) {
                console.error(error);
            }
        });*/

        let body = '';
        req.on('data', (chunk) => {
            body += chunk;
        });

        req.on('end', async () => {
            const postData = JSON.parse(body);
            ExportController.postTitle = postData.postTitle;
            ExportController.postContent = postData.postText;
            ExportController.songId = postData.songId;

            const authorizeUrl = 'https://public-api.wordpress.com/oauth2/authorize';
            const responseType = 'code';
            const requestUrl = `${authorizeUrl}?client_id=${this.wordpressClientId}&redirect_uri=${encodeURIComponent(this.wordpressRedirectUri)}&response_type=${responseType}`;
            //console.log("Authorize the application by visiting the following URL: " + requestUrl);

            res.writeHead(200, {'Content-Type': 'application/json'});
            res.write(JSON.stringify({message: requestUrl}));
            res.end();
        });
    }

    async handleWordpressExportData (req: IncomingMessage, res: ServerResponse)
    {
        const url = req.url || '';
        const searchParams = new URLSearchParams(url.split('?')[1]);
        const code = searchParams.get('code') || '';

        const data = await this.getTokenData(this.wordpressClientId, this.wordpressRedirectUri, this.wordpressClientSecret, code);
        //console.log(data);
        const accessToken = data.access_token;
        const blogId = data.blog_id;

        this.makeNewPost(accessToken, blogId, ExportController.postTitle, ExportController.postContent);
        //this.printAllPosts(accessToken, blogId);


        res.writeHead(302, { 'Location': '/song-page/' + ExportController.songId });
        res.end();
    }

    async getTokenData(clientId: string, redirectUri: string, clientSecret: string, code: string) {
        const tokenUrl = 'https://public-api.wordpress.com/oauth2/token';
        const grantType = 'authorization_code';

        const requestBody = new URLSearchParams();
        requestBody.append('client_id', clientId);
        requestBody.append('redirect_uri', redirectUri);
        requestBody.append('client_secret', clientSecret);
        requestBody.append('code', code);
        requestBody.append('grant_type', grantType);

        return fetch(tokenUrl, {
            method: 'POST',
            body: requestBody,
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }
                return response.json();
            })
            .catch(error => {
                console.error(error);
                throw error;
            });
    }
    async getBlogId(accessToken: string, blogUrl: string) {
        const apiUrl = 'https://public-api.wordpress.com/rest/v1.1/sites/' + blogUrl;

        try {
            const response = await fetch(apiUrl, {
                method: 'GET',
            });
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            const data = await response.json();
            //console.log(data.ID);
            return data.ID;
        } catch (error) {
            console.error(error);
        }
    }


    printAllPosts(accessToken: string, blogId: string) {
        const apiUrl = 'https://public-api.wordpress.com/rest/v1.1/sites/' + blogId + '/posts';
        const headers = {
            Authorization: 'Bearer ' + accessToken,
        };

        fetch(apiUrl, { headers })
            .then(response => response.json())
            .then(data => {
                // Handle the API response here
                console.log(data);
            })
            .catch(error => {
                console.error(error);
            });
    }
    makeNewPost(accessToken: string, blogId: string, postTitle: string, postContent: string) {
        const apiUrl = 'https://public-api.wordpress.com/rest/v1.1/sites/' + blogId + '/posts/new';
        const headers = {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
        };

        const postData = {
            title: postTitle,
            content: postContent,
        };

        fetch(apiUrl, {
            method: 'POST',
            headers,
            body: JSON.stringify(postData),
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }
                return response.json();
            })
            .then(data => {
                console.log(data);
            })
            .catch(error => {
                console.error(error);
            });
    }
}

/*
const clientId = '87363';
const clientSecret = 'MlsIF37Dyx6ONg6TxMCRc6F5YYf8V0R3ZK7pqZq7cW0gigFAhTUaxyRrJBnq1a9E';
const username = 'nechitavladmihai';
const password = '0M%iWIfjCfT3gEOzd%hYg@Rx';
const blog_url = 'proiectweb7.wordpress.com';
const redirectUri = 'https://85b4-2a02-2f0e-5103-6000-64fd-eb2a-bf89-ddb2.ngrok-free.app';
*/
