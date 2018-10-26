'use strict';

import api from '../controllers/apiController';
import {NineDice} from '../models/nine'
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
    Factory.register('999Dice', new NineDice());
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


