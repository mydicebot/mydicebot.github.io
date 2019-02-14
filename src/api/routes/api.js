'use strict';

import api from '../controllers/apiController';
import {BitslerDice} from '../models/bitsler';
import {NineDice} from '../models/nine';
import {YoloDice} from '../models/yolo';
import {PrimeDice} from '../models/prime';
import {StakeDice} from '../models/stake';
import {CryptoDice} from '../models/crypto';
import {MagicDice} from '../models/magic';
import {Simulator} from '../models/simulator';
import {Factory} from '../models/factory';
import fs from 'fs';
import path from 'path';

module.exports = function(app) {
  app.get('/', [], api.index);
  app.get('/login', [], api.login);
  app.get('/:site/login', [], api.login);
  app.post('/login', [createDice], api.login);
  app.post('/:site/login', [createDice], api.login);
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
  app.get('/:site/info', [createDice,userMiddleware], api.info);
  app.post('/:site/bet', [createDice,userMiddleware], api.bet);
  app.get('/:site/script', [createDice,checkScript], api.script);
  app.get('/:site/file', [createDice,checkScript], api.file);
  app.post('/:site/save', [createDice,checkScript], api.save);
  app.get('/:site/del', [createDice,checkScript], api.del);
  app.post('/:site/upload', [createDice,checkScript], api.upload);
};

function createDice (req, res, next) {
    Factory.register('Bitsler', new BitslerDice());
    Factory.register('999Dice', new NineDice());
    Factory.register('YoloDice', new YoloDice());
    Factory.register('PrimeDice', new PrimeDice());
    Factory.register('Stake', new StakeDice());
    Factory.register('Crypto-Games', new CryptoDice());
    Factory.register('MagicDice', new MagicDice());
    Factory.register('Simulator', new Simulator());
    next();
}

function checkScript(req, res, next) {
    //let filePath = path.resolve(path.join(__dirname, '../../script/lua/'));
    let filePath = path.resolve(path.join(process.execPath, '../script/lua/'));
    mkdir(filePath);
    filePath = path.resolve(path.join(process.execPath, '../keepass/'));
    mkdir(filePath);
    next();
}

function userMiddleware (req, res, next) {
    if (!req.session.username) {
        console.log("username:"+req.session.username)
        res.render('login', {message:'Please Login',site:req.params.site});
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
            //fs.mkdirSync(dirpath)
            fs.mkdir(dirpath, err => {})
        }else{
            mkdir(dirname,path.dirname(dirname));
            //fs.mkdirSync(dirpath);
            fs.mkdir(dirpath, err => {})
        }
    }
}


