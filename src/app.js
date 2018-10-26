import express from 'express';
import path from 'path';
import logger from 'morgan';
import cookieParser from 'cookie-parser';
import bodyParser from 'body-parser';
import session from 'express-session';
import {createServer} from 'http';
import routes from './api/routes/api';
import commandExists from 'command-exists'
import execa from 'execa'
import opn from 'opn'

let params = process.argv;
let port = 3000;
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
      secret: 'mydicebot987',
      cookie: {},
      resave: false,
      saveUninitialized: false
}
if (app.get('env') === 'production') {
  app.set('trust proxy', 1);
}
app.use(session(sess))
routes(app);

let url = 'http://127.0.0.1:'+port+'/login';
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
