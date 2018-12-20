'use strict';

import {Factory} from '../models/factory'
import {APIError} from '../errors/APIError';

exports.index = function(req, res) {
    res.render('index', { title: 'My Dice Bot' });
};

exports.login = async function(req, res) {
    try{
        console.log(req.body.site);
        if(typeof req.body.username !== 'undefined'){
            let dice = Factory.create(req.body.site);
            let ret = await dice.login(req.body.username, req.body.password, req.body.twofa, req.body.apikey, req);
            if(ret != true){
                res.render('login', {message:ret});
            } else {
                res.redirect(req.protocol+"://"+req.headers.host+'/'+req.body.site+'/info');
            }
        } else {
            res.render('login');
        }
    } catch(err) {
        console.log(err);
        res.render('login', {message:err.toString()});
    }
};

exports.info = async function(req, res) {
    try{
        let dice = Factory.create(req.params.site);
        let ret = await dice.getUserInfo(req);
        res.render('info', {site: '../js/'+req.params.site+'/info.js'});
    } catch(err) {
        console.log(err);
        res.render('error',{err: err.toString()});
    }
};

exports.bet = async function(req, res) {
    try{
        let dice = Factory.create(req.params.site);
        let ret = await dice.bet(req);
        return res.status(200).json(ret);
    } catch(err) {
        console.log(err);
        return res.status(200).json({err: err.toString()});
    }
};

exports.refresh = async function(req, res) {
    try{
        let dice = Factory.create(req.params.site);
        let ret = await dice.refresh(req);
        return res.status(200).json(ret);
    } catch(err) {
        console.log(err);
        res.render('error',{err: err.toString()});
    }
};

exports.clear = async function(req, res) {
    try{
        let dice = Factory.create(req.params.site);
        let ret = await dice.clear(req);
        return res.status(200).json(ret);
    } catch(err) {
        console.log(err);
        res.render('error',{err: err.toString()});
    }
};
