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
var Factory = require('../models/factory');
var config = require('config');
var fs = require('fs');
var path = require('path');
var fse = require('fs-extra');

module.exports = function(app) {
  app.get('/', [checkSkin], api.index);
  app.get('/login', [checkSkin], api.login);
  app.get('/:site/login', [checkSkin], api.login);
  app.post('/login', [checkSkin,createDice], api.login);
  app.post('/:site/login', [checkSkin,createDice], api.login);
  app.post('/keepass/load', [createDice,checkScript], api.keeload);
  app.post('/:site/keepass/load', [createDice,checkScript], api.keeload);
  app.put('/keepass/save', [createDice,checkScript], api.keesave);
  app.put('/:site/keepass/save', [createDice,checkScript], api.keesave);
  app.post('/keepass/reg', [createDice,checkScript], api.keereg);
  app.post('/:site/keepass/reg', [createDice,checkScript], api.keereg);
  app.get('/keepass/check', [createDice,checkScript], api.keecheck);
  app.get('/:site/keepass/check', [createDice,checkScript], api.keecheck);
  app.get('/:site/keepass/files', [createDice,checkScript], api.keefiles);
  app.get('/keepass/files', [createDice,checkScript], api.keefiles);
  app.get('/:site/clear', [createDice], api.clear);
  app.get('/:site/refresh', [createDice], api.refresh);
  app.get('/:site/resetseed', [createDice,userMiddleware], api.resetseed);
  app.get('/:site/info', [checkSkin,createDice,userMiddleware], api.info);
  app.post('/:site/bet', [createDice,userMiddleware], api.bet);
  app.get('/:site/script', [createDice,checkScript], api.script);
  app.get('/:site/file', [createDice,checkScript], api.file);
  app.post('/:site/save', [createDice,checkScript], api.save);
  app.get('/:site/del', [createDice,checkScript], api.del);
  app.post('/:site/upload', [createDice,checkScript], api.upload);
  app.get('/:site/checkerr', [createDice,checkScript], api.checkerr);
  app.get('/checkerr', [createDice,checkScript], api.checkerr);
  app.get('/:site/sound', [checkScript], api.sound);
  app.get('/:site/gists', [checkScript], api.gists);
  app.get('/:site/raw', [checkScript], api.raw);
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
    //console.log(Factory);
    Factory.register('Bitsler', new BitslerDice());
    Factory.register('999Dice', new NineDice());
    Factory.register('YoloDice', new YoloDice());
    Factory.register('PrimeDice', new PrimeDice());
    Factory.register('Stake', new StakeDice());
    Factory.register('Crypto-Games', new CryptoDice());
    Factory.register('Simulator', new Simulator());
    Factory.register('EpicDice', new EpicDice());
    Factory.register('KryptoGames', new KryptoGames());
    Factory.register('DuckDice', new DuckDice());
    Factory.register('FreeBitco', new FreeBitco());
    Factory.register('WinDice', new WinDice());
    Factory.register('WolfBet', new WolfBet());
    Factory.register('999Doge', new NineDoge());
    Factory.register('SatoshiDice', new SatoshiDice());
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


