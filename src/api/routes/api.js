'use strict';

import api from '../controllers/apiController';
import cb from '../controllers/callbackController';
import {BitslerDice} from '../models/bitsler';
import {NineDice} from '../models/nine';
import {YoloDice} from '../models/yolo';
import {PrimeDice} from '../models/prime';
import {StakeDice} from '../models/stake';
import {CryptoDice} from '../models/crypto';
import {MagicDice} from '../models/magic';
import {Simulator} from '../models/simulator';
import {EpicDice} from '../models/epic';
import {SteemBet} from '../models/steembet';
import {KryptoGames} from '../models/kryptogames';
import {DuckDice} from '../models/duckdice';
import {FreeBitco} from '../models/freebitco';
import {WinDice} from '../models/windice';
import {Factory} from '../models/factory';
import fs from 'fs';
import path from 'path';

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
  app.get('/:site/info', [checkSkin,createDice,userMiddleware], api.info);
  app.post('/:site/bet', [createDice,userMiddleware], api.bet);
  app.get('/:site/script', [createDice,checkScript], api.script);
  app.get('/:site/file', [createDice,checkScript], api.file);
  app.post('/:site/save', [createDice,checkScript], api.save);
  app.get('/:site/del', [createDice,checkScript], api.del);
  app.post('/:site/upload', [createDice,checkScript], api.upload);
  app.get('/:site/checkerr', [createDice,checkScript], api.checkerr);
  app.get('/checkerr', [createDice,checkScript], api.checkerr);

  app.get('/:oauth/cb', [checkSkin,createDice,checkScript], cb.cb);
  app.get('/:site/:oauth/cb', [checkSkin,createDice,checkScript], cb.cb);
  app.get('/user', [createDice,checkScript], cb.user);
  app.get('/:site/user', [createDice,checkScript], cb.user);
  app.get('/logout', [createDice,checkScript], cb.logout);
  app.get('/:site/logout', [createDice,checkScript], cb.logout);
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
    Factory.register('Bitsler', new BitslerDice());
    Factory.register('999Dice', new NineDice());
    Factory.register('YoloDice', new YoloDice());
    Factory.register('PrimeDice', new PrimeDice());
    Factory.register('Stake', new StakeDice());
    Factory.register('Crypto-Games', new CryptoDice());
    Factory.register('MagicDice', new MagicDice());
    Factory.register('Simulator', new Simulator());
    Factory.register('EpicDice', new EpicDice());
    Factory.register('SteemBet', new SteemBet());
    Factory.register('KryptoGames', new KryptoGames());
    Factory.register('DuckDice', new DuckDice());
    Factory.register('FreeBitco', new FreeBitco());
    Factory.register('WinDice', new WinDice());
    next();
}

function checkScript(req, res, next) {
    let filePath = path.resolve(path.join(process.execPath, '../script/lua/'));
    if(isMobile(req)) {
        filePath = path.resolve(path.join(__dirname, '../../script/lua/'));
    }
    mkdir(filePath);
    filePath = path.resolve(path.join(process.execPath, '../script/js/'));
    if(isMobile(req)) {
        filePath = path.resolve(path.join(__dirname, '../../script/js/'));
    }
    mkdir(filePath);
    filePath = path.resolve(path.join(process.execPath, '../script/py/'));
    if(isMobile(req)) {
        filePath = path.resolve(path.join(__dirname, '../../script/py/'));
    }
    mkdir(filePath);
    filePath = path.resolve(path.join(process.execPath, '../keepass/'));
    if(isMobile(req)) {
        filePath = path.resolve(path.join(__dirname, '../../keepass/'));
    }
    mkdir(filePath);
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


