import { IncomingMessage, ServerResponse } from "http";
const OAuth = require('oauth').OAuth;
const url = require('url');
import crypto from "crypto";

const consumerKey = "sRw63z7tFWa3bLWqJiaRu8zolYpxa7Nk5gqHhIe9oKnwgjSYvu";
const consumerSecret = "AGhpwp3PR1gM3gUCs335HQxH7fKDCgsZYet9VrqSbpPAsW7jLm";

const tumblrOAuth = new OAuth(
    "https://www.tumblr.com/oauth/request_token",
    "https://www.tumblr.com/oauth/access_token",
    consumerKey,
    consumerSecret,
    "1.0A",
    "https://32a0-2a02-2f0e-561a-6f00-7d2b-89d7-5a08-3db2.ngrok-free.app/export-data/tumblr",
    "HMAC-SHA1"
);

export class ExportController {
    private wordpressClientId = '87363';
    private wordpressClientSecret = 'MlsIF37Dyx6ONg6TxMCRc6F5YYf8V0R3ZK7pqZq7cW0gigFAhTUaxyRrJBnq1a9E';
    private wordpressRedirectUri = 'https://lyricssmarttranslator.com/export-data/wordpress';
    static postTitle = '';
    static postContent = '';
    static songId = '';
    static tumblrOauthTokenSecret = '';
    static tumblrBlogName = '';

    async handleTumblrExport(req: IncomingMessage, res: ServerResponse) {
        console.log("Exporting to Tumblr...");
        try {
            let body = "";
            req.on("data", (chunk) => {
                body += chunk;
            });

            req.on("end", async () => {
                const postData = JSON.parse(body);
                ExportController.postTitle = postData.postTitle;
                ExportController.postContent = postData.postText;
                ExportController.tumblrBlogName = postData.blogName;
                ExportController.songId = postData.songId;

                tumblrOAuth.getOAuthRequestToken((error: string, oauthToken: string, oauthTokenSecret: string) => {
                    if (error) {
                        console.error("Error obtaining temporary OAuth credentials:", error);
                        res.writeHead(500, { "Content-Type": "application/json" });
                        res.write(
                            JSON.stringify({ error: "Failed to obtain temporary OAuth credentials." })
                        );
                        res.end();
                        return;
                    }

                    ExportController.tumblrOauthTokenSecret = oauthTokenSecret;
                    const authorizationUrl = `https://www.tumblr.com/oauth/authorize?oauth_token=${oauthToken}`;
                    console.log("Authorize the application by visiting the following URL: " + authorizationUrl);

                    // Store the oauthTokenSecret securely for later use

                    res.writeHead(200, { "Content-Type": "application/json" });
                    res.write(JSON.stringify({ message: authorizationUrl }));
                    res.end();
                });
            });
        } catch (error) {
            console.error("Error in handleTumblrExport function:", error);
            res.writeHead(500, { "Content-Type": "application/json" });
            res.write(JSON.stringify({ error: "Failed to export to Tumblr." }));
            res.end();
        }
    }

    async handleTumblrExportData(req: IncomingMessage, res: ServerResponse) {
        console.log("Enter handleTumblrExportData...");
        const query = url.parse(req.url, true).query;
        const oauthToken = query.oauth_token;
        const oauthVerifier = query.oauth_verifier;
        const blogIdentifier = ExportController.tumblrBlogName;

        //console.log(oauthToken);
        //console.log(oauthVerifier);
        tumblrOAuth.getOAuthAccessToken(oauthToken, ExportController.tumblrOauthTokenSecret, oauthVerifier, async (error: string, oauthAccessToken: string, oauthAccessTokenSecret: string) => {
            if (error) {
                console.error("Error obtaining OAuth access tokens:", error);
                res.writeHead(500, {'Content-Type': 'application/json'});
                res.write(JSON.stringify({ error: "Failed to obtain OAuth access tokens." }));
                res.end();
                return;
            }
            console.log("oauthAccessToken: ", oauthAccessToken);
            console.log("oauthAccessTokenSecret: ", oauthAccessTokenSecret);


            const apiUrl = `https://api.tumblr.com/v2/blog/${blogIdentifier}/post`;
            const postContent = {
                type: 'text',
                title: ExportController.postTitle,
                body: ExportController.postContent
            };

            const oauthParams: Record<string, string> = {
                oauth_consumer_key: consumerKey,
                oauth_nonce: this.generateNonce(),
                oauth_signature_method: 'HMAC-SHA1',
                oauth_timestamp: Math.floor(Date.now() / 1000).toString(),
                oauth_token: oauthAccessToken,
                oauth_version: '1.0a'
            };
            oauthParams.oauth_signature = this.generateSignature(apiUrl, 'POST', oauthParams, consumerSecret, oauthAccessTokenSecret);

            const authHeader = this.buildAuthHeader(oauthParams);

            const headers = {
                Authorization: authHeader,
                'Content-Type': 'application/json'
            };

            const postData = JSON.stringify(postContent);
            const requestOptions = {
                method: 'POST',
                headers: headers,
                body: postData
            };

            fetch(apiUrl, requestOptions)
                .then(response => response.json())
                .then(data => {
                    console.log('Tumblr post created:', data);
                })
                .catch(error => {
                    console.error('Error creating Tumblr post:', error);
                });

            const redirectURL = '/song-page/' + ExportController.songId;
            res.writeHead(302, { 'Location': redirectURL });
            res.end();
        });
    }

    generateNonce() {
        return Math.random().toString(36).replace(/[^a-z]+/g, '').substr(0, 32);
    }
    generateSignature(url: string, method: string, oauthParams: Record<string, string>, consumerSecret: string, tokenSecret: string) {

        const baseString = method.toUpperCase() + '&' + encodeURIComponent(url) + '&' + encodeURIComponent(this.buildParameterString(oauthParams));
        const signingKey = encodeURIComponent(consumerSecret) + '&' + encodeURIComponent(tokenSecret || '');
        const signature = crypto.createHmac('sha1', signingKey).update(baseString).digest('base64');

        return signature;
    }
    buildParameterString(params: Record<string, string>) {
        const sortedParams = Object.keys(params).sort().map(key => encodeURIComponent(key) + '=' + encodeURIComponent(params[key]));
        return sortedParams.join('&');
    }
    buildAuthHeader(oauthParams: Record<string, string>) {
        const authParams = Object.keys(oauthParams).sort().map(key => key + '="' + oauthParams[key] + '"');
        return 'OAuth ' + authParams.join(', ');
    }















    async handleWordpressExport(req: IncomingMessage, res: ServerResponse) {
        console.log("Exporting to Wordpress...");

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
