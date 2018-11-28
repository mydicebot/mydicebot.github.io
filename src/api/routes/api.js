'use strict';

import api from '../controllers/apiController';
import {BitslerDice} from '../models/bitsler'
import {NineDice} from '../models/nine'
import {YoloDice} from '../models/yolo'
import {PrimeDice} from '../models/prime'
import {StakeDice} from '../models/stake'
import {CryptoDice} from '../models/crypto'
import {Factory} from '../models/factory'

module.exports = function(app) {
  app.get('/', [], api.index);
  app.get('/login', [], api.login);
  app.get('/:site/login', [], api.login);
  app.post('/login', [createDice], api.login);
  app.post('/:site/login', [createDice], api.login);
  app.get('/:site/clear', [createDice], api.clear);
  app.get('/:site/refresh', [createDice], api.refresh);
  app.get('/:site/info', [createDice,userMiddleware], api.info);
  app.post('/:site/bet', [createDice,userMiddleware], api.bet);
};

function createDice (req, res, next) {
    Factory.register('Bitsler', new BitslerDice());
    Factory.register('999Dice', new NineDice());
    Factory.register('YoloDice', new YoloDice());
    Factory.register('PrimeDice', new PrimeDice());
    Factory.register('Stake', new StakeDice());
    Factory.register('Crypto-Games', new CryptoDice());
    next();
}
function userMiddleware (req, res, next) {
    if (!req.session.username) {
        console.log("username:"+req.session.username)
        res.render('login', {message:'Please Login'});
    } else {
        next();
    }
}


