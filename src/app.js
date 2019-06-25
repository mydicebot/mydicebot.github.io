import express from 'express';
import path from 'path';
import logger from 'morgan';
import cookieParser from 'cookie-parser';
import bodyParser from 'body-parser';
import session from 'express-session';
import {createServer} from 'http';
import routes from './api/routes/api';
import commandExists from 'command-exists'
import config from 'config'
import execa from 'execa'
import opn from 'opn'

let params = process.argv;
let port = 57432;
let portIndex = params.indexOf('-port');
if(portIndex != -1) {
    let reg = /[0-9]+/;
    if(reg.test(params.slice(portIndex+1,portIndex+2)[0])){
        port = params.slice(portIndex+1,portIndex+2)[0];
    }
}
let browser = [];
let browserIndex = params.indexOf('-browser');
if(browserIndex != -1) {
    let reg = /^--[a-zA-Z0-9]+/;
    if(params.slice(browserIndex+1,browserIndex+2)[0] == 'chrome'){
        if (['darwin'].includes(process.platform)) {
            browser.push('Google Chrome');
        } else if (['win32'].includes(process.platform)) {
            browser.push('chrome');
        } else {
            browser.push('google-chrome');
        }
    } else {
        browser.push(params.slice(browserIndex+1,browserIndex+2)[0]);
    }
    if(reg.test(params.slice(browserIndex+2,browserIndex+3)[0])){
        browser.push(params.slice(browserIndex+2,browserIndex+3)[0]);
    }
    console.log(browser);
}
let consoleIndex = params.indexOf('-console');
if(consoleIndex != -1) {
    console.log("console bet");
}

let app = express();
app.set('port', port);
let server = createServer(app);
server.listen(port, () => {
      console.log('Listening on port '+ port)
});
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
let sess = {
      secret: 'mydicebot12323',
      cookie: {
          secure: false,
          maxAge: 1000 * 60 * 30,
          httpOnly: true,
      },
      resave: false,
      saveUninitialized: false
}
app.set('trust proxy', 1);
app.use(session(sess))
routes(app);

if(process.env.NODE_ENV == 'production' && typeof config.mydice =='undefined') {
    config.mydice = {};
    config.mydice.auth = {};
    config.mydice.chat = {};
    config.mydice.oauth = {};
    config.mydice.oauth.github = {};
    config.mydice.oauth.google = {};
    config.mydice.oauth.steem = {};
    config.mydice.pkg = true;
    config.mydice.auth.url = 'https://auth.mydicebot.com/';
    config.mydice.chat.url = 'https://chat.mydicebot.com/';
    config.mydice.oauth.github.url= 'https://github.com/login/oauth/authorize?client_id=9f8842af70978390f78d';
    config.mydice.oauth.google.url = 'https://accounts.google.com/o/oauth2/auth?response_type=code&access_type=offline&client_id=192445019791-rupf3vtns5708bhtpt1vrmbhqk817qrr.apps.googleusercontent.com&redirect_uri=http://localhost:57432/google/cb&scope=https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/userinfo.email';
    config.mydice.oauth.steem.url = 'https://app.steemconnect.com/oauth2/authorize?client_id=mydicebot&redirect_uri=http://localhost:57432/steem/cb&scope=login&response_type=code';
}

console.log('pkg:',config.mydice.pkg);
if (config.mydice.pkg) {
    let url = 'http://localhost:'+port+'/login';
    if (['win32', 'darwin'].includes(process.platform)) {
        opn(url, {
            wait: false,
            app:browser
        })
    } else {
        try {
            const xdgOpenExists = commandExists('xdg-open')
            if (!xdgOpenExists) {
                throw new Error('xdg-open does not exist')
            }
            execa('xdg-open', [url])
        } catch (_) {
            log(`Unable to open your browser automatically. Please open the following URI in your browser:\n\n${oAuthURL}\n\n`)
        }
    }
}
