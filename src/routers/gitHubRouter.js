const { Router } = require('express');
const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));

class GitHubRouter {
    constructor() {
        this.router = Router();
        this.client_id = process.env.CLIENT_ID;
        this.client_secret = process.env.CLIENT_SECRET;
        this.token = null;
        this.gitHubData = null;
        this.#config();
    }

    #config() {
        // app.get("/login/github", (req, res) => {
        //     const redirect_uri = "http://localhost:9000/login/github/callback";
        //     res.redirect(
        //       `https://github.com/login/oauth/authorize?client_id=${process.env.GITHUB_CLIENT_ID}&redirect_uri=${redirect_uri}`
        //     );
        //   });
        this.router.get("/auth/github", (req, res) => {
            const redirect_uri = "http://localhost:3000/auth/github/callback";
            const url = `https://github.com/login/oauth/authorize?client_id=${this.client_id}&redirect_uri=${redirect_uri}`;
            res.redirect(url);
        })

        this.router.get("/auth/github/callback", async (req, res) => {
            const code = req.query.code;
            const error = req.query.error;
            if (code) {
                this.token = await this.getAccessToken({ code, client_id: this.client_id, client_secret: this.client_secret });
                this.gitHubData = await this.getGitHubUser(this.token);
                res.redirect("http://localhost:3001")
                // res.status(200).json(gitHubData);
            } else {
                res.status(401).json({ error });
            }

        })

        this.router.get("/auth", (req, res) => {
            if (this.token) {
                res.status(200).json({ auth: true, repos: this.gitHubData });
            }
        })

        this.router.get("/logout", (req, res)=>{
            this.token = null;
            this.gitHubData = null;
            res.status(200).send();
        })
    }

    getAccessToken = async ({ code, client_id, client_secret }) => {
        const resp = await fetch('https://github.com/login/oauth/access_token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                client_id,
                client_secret,
                code
            })
        })
        const text = await resp.text();
        const params = new URLSearchParams(text);
        return params.get('access_token');
    }

    getGitHubUser = async (access_token) => {
        const resp = await fetch('https://api.github.com/users/St3v3nBayer/repos', {
            method: 'GET',
            headers: {
                Authorization: `bearer ${access_token}`
            }
        })
        const data = await resp.json();
        return data;
    }
}

module.exports = GitHubRouter;