const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const GitHubRouter = require('./routers/gitHubRouter');
const HomeRouter = require('./routers/homeRouter');

class Server{
    constructor(){
        this.app = express();
        this.#config();
    }
    
    #config(){
        this.app.use(express.json());
        this.app.use(cors({'origin':'http://localhost:3001'}));
        this.app.use(morgan());

        this.app.set('PORT', process.env.PORT || 3000);

        const homeR = new HomeRouter();
        const githubR = new GitHubRouter();

        this.app.use(homeR.router);
        this.app.use(githubR.router);

        this.app.listen(this.app.get('PORT'), ()=>{
            console.log('Servidor corriendo por el puerto => ',this.app.get('PORT'));
        })
    }

}

new Server();