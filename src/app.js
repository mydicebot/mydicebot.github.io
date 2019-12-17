var express = require('express');
var path =require('path');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('express-session');
var createServer = require('http').createServer;
var routes = require('./api/routes/api');
var config = require('config');

let params = process.argv;
let port = 57432;
let portIndex = params.indexOf('-port');
if(portIndex != -1) {
    let reg = /[0-9]+/;
    if(reg.test(params.slice(portIndex+1,portIndex+2)[0])){
        port = params.slice(portIndex+1,portIndex+2)[0];
    }
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

config.mydice = {};
config.mydice.url = 'http://localhost:'+port;
