'use strict';

var api = require('../controllers/apiController');
var BitslerDice = require('../models/bitsler');
var NineDice = require('../models/nine');
var NineDoge = require('../models/ninedoge');
var YoloDice = require('../models/yolo');
var PrimeDice = require('../models/prime');
var StakeDice = require('../models/stake');
var CryptoDice = require('../models/crypto');
var Simulator = require('../models/simulator');
var EpicDice = require('../models/epic');
var KryptoGames = require('../models/kryptogames');
var DuckDice = require('../models/duckdice');
var FreeBitco = require('../models/freebitco');
var WinDice = require('../models/windice');
var WolfBet = require('../models/wolfbet');
var SatoshiDice = require('../models/satoshidice');
var ParaDice = require('../models/paradice');
var Factory = require('../models/factory');
var config = require('config');
var fs = require('fs');
var path = require('path');
var fse = require('fs-extra');

module.exports = function(app) {
  app.get('/', [checkSkin], api.index);
  app.get('/login', [checkSkin], api.login);
  app.get('/:site/login', [checkSkin], api.login);
  app.post('/login', [initMiddleware,checkSkin,createDice], api.login);
  app.post('/:site/login', [initMiddleware,checkSkin,createDice], api.login);
  app.post('/keepass/load', [checkScript], api.keeload);
  app.post('/:site/keepass/load', [checkScript], api.keeload);
  app.put('/keepass/save', [checkScript], api.keesave);
  app.put('/:site/keepass/save', [checkScript], api.keesave);
  app.post('/keepass/reg', [checkScript], api.keereg);
  app.post('/:site/keepass/reg', [checkScript], api.keereg);
  app.get('/keepass/check', [checkScript], api.keecheck);
  app.get('/:site/keepass/check', [checkScript], api.keecheck);
  app.get('/:site/keepass/files', [checkScript], api.keefiles);
  app.get('/keepass/files', [checkScript], api.keefiles);
  app.get('/:site/clear', [], api.clear);
  app.get('/:site/refresh', [], api.refresh);
  app.get('/:site/resetseed', [userMiddleware], api.resetseed);
  app.get('/:site/info', [checkSkin,userMiddleware], api.info);
  app.post('/:site/bet', [userMiddleware], api.bet);
  app.get('/:site/script', [checkScript], api.script);
  app.get('/:site/file', [checkScript], api.file);
  app.post('/:site/save', [checkScript], api.save);
  app.get('/:site/del', [checkScript], api.del);
  app.post('/:site/upload', [checkScript], api.upload);
  app.get('/:site/checkerr', [checkScript], api.checkerr);
  app.get('/checkerr', [checkScript], api.checkerr);
  app.get('/:site/sound', [checkScript], api.sound);
  app.get('/:site/gists', [checkScript], api.gists);
  app.get('/:site/raw', [checkScript], api.raw);
  app.post('/:site/proxy/setting', [checkScript], api.proxysave);
  app.post('/proxy/setting', [checkScript], api.proxysave);
  app.get('/:site/proxy/setting', [checkScript], api.proxyload);
  app.get('/proxy/setting', [checkScript], api.proxyload);
  app.get('/:site/donate', [checkScript], api.donate);
  app.get('/donate', [checkScript], api.donate);
};

function checkSkin(req, res, next) {
    if(req.query.skin) {
        req.session.skin = req.query.skin;
    }
    if (!req.session.skin) {
        req.session.skin = 'Material';
    }
    next();
}

function createDice (req, res, next) {
    let proxy = {};
    if(typeof req.body.proxy_ip !== 'undefined'){
        proxy.ip = req.body.proxy_ip;
        proxy.port = req.body.proxy_port;
        proxy.user = req.body.proxy_user;
        proxy.password = req.body.proxy_password;
    }
    if(!Factory.check()){
        Factory.register('Bitsler', new BitslerDice(proxy));
        Factory.register('999Dice', new NineDice(proxy));
        Factory.register('YoloDice', new YoloDice(proxy));
        Factory.register('PrimeDice', new PrimeDice(proxy));
        Factory.register('Stake', new StakeDice(proxy));
        Factory.register('Crypto-Games', new CryptoDice(proxy));
        Factory.register('Simulator', new Simulator(proxy));
        Factory.register('EpicDice', new EpicDice(proxy));
        Factory.register('KryptoGames', new KryptoGames(proxy));
        Factory.register('DuckDice', new DuckDice(proxy));
        Factory.register('FreeBitco', new FreeBitco(proxy));
        Factory.register('WinDice', new WinDice(proxy));
        Factory.register('WolfBet', new WolfBet(proxy));
        Factory.register('999Doge', new NineDoge(proxy));
        Factory.register('SatoshiDice', new SatoshiDice(proxy));
        Factory.register('ParaDice', new ParaDice(proxy));
    }
    next();
}

function checkScript(req, res, next) {
    let filePath = path.resolve(path.join(process.execPath, '../script/lua/'));
    if(isMobile(req)) {
        filePath = path.resolve(path.join(__dirname, '../../script/lua/'));
    }
    if(process.env.electron) {
        filePath = path.resolve(path.join(config.mydice.path, '/script/lua/'));
    }
    mkdir(filePath);
    filePath = path.resolve(path.join(process.execPath, '../script/js/'));
    if(isMobile(req)) {
        filePath = path.resolve(path.join(__dirname, '../../script/js/'));
    }
    if(process.env.electron) {
        filePath = path.resolve(path.join(config.mydice.path, '/script/js/'));
    }
    mkdir(filePath);
    filePath = path.resolve(path.join(process.execPath, '../script/py/'));
    if(isMobile(req)) {
        filePath = path.resolve(path.join(__dirname, '../../script/py/'));
    }
    if(process.env.electron) {
        filePath = path.resolve(path.join(config.mydice.path, '/script/py/'));
    }
    mkdir(filePath);
    filePath = path.resolve(path.join(process.execPath, '../keepass/'));
    if(isMobile(req)) {
        filePath = path.resolve(path.join(__dirname, '../../keepass/'));
    }
    if(process.env.electron) {
        filePath = path.resolve(path.join(config.mydice.path, '/keepass/'));
    }
    mkdir(filePath);
    filePath = path.resolve(path.join(process.execPath, '../sound/'));
    if(isMobile(req)) {
        filePath = path.resolve(path.join(__dirname, '../../sound/'));
    }
    if(process.env.electron) {
        filePath = path.resolve(path.join(config.mydice.path, '/sound/'));
    }
    mkdir(filePath);
    if(process.env.electron) {
      try {
          if(process.platform === 'darwin') {
              fse.copySync(path.resolve(path.join(process.execPath, '../../script/py/')),path.resolve(path.join(config.mydice.path, '/script/py/')),{ overwrite: false });
              fse.copySync(path.resolve(path.join(process.execPath, '../../script/js/')),path.resolve(path.join(config.mydice.path, '/script/js/')),{ overwrite: false });
              fse.copySync(path.resolve(path.join(process.execPath, '../../script/lua/')),path.resolve(path.join(config.mydice.path, '/script/lua/')),{ overwrite: false });
              fse.copySync(path.resolve(path.join(process.execPath, '../../sound/')),path.resolve(path.join(config.mydice.path, '/sound/')),{ overwrite: false });
          } else {
              fse.copySync(path.resolve(path.join(process.execPath, '../script/py/')),path.resolve(path.join(config.mydice.path, '/script/py/')),{ overwrite: false });
              fse.copySync(path.resolve(path.join(process.execPath, '../script/js/')),path.resolve(path.join(config.mydice.path, '/script/js/')),{ overwrite: false });
              fse.copySync(path.resolve(path.join(process.execPath, '../script/lua/')),path.resolve(path.join(config.mydice.path, '/script/lua/')),{ overwrite: false });
              fse.copySync(path.resolve(path.join(process.execPath, '../sound/')),path.resolve(path.join(config.mydice.path, '/sound/')),{ overwrite: false });
          }
      } catch (err) {
        console.error(err)
      }
    }
    next();
}

function userMiddleware (req, res, next) {
    if (!req.session.username) {
        console.log("username:"+req.session.username)
        res.render('login', {message:'Please Login',site:req.params.site, skin:req.session.skin});
    } else {
        next();
    }
}

function initMiddleware (req, res, next) {
    Factory.clear();
    next();
}

function mkdir(dirpath,dirname){
    if(typeof dirname === "undefined"){
        if(fs.existsSync(dirpath)){
            return;
        }else{
            mkdir(dirpath,path.dirname(dirpath));
        }
    }else{
        if(dirname !== path.dirname(dirpath)){
            mkdir(dirpath);
            return;
        }
        if(fs.existsSync(dirname)){
            fs.mkdir(dirpath, err => {})
        }else{
            mkdir(dirname,path.dirname(dirname));
            fs.mkdir(dirpath, err => {})
        }
    }
}

function isMobile(req) {
    let deviceAgent = req.headers["user-agent"].toLowerCase();
    let agentID = deviceAgent.match(/(iphone|ipod|ipad|android)/);
    if(agentID){
        return true;
    }else{
        return false;
    }
}


