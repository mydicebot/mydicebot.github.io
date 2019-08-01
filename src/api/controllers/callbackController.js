'use strict';
import config from 'config';
import fetch from 'isomorphic-fetch';
import {APIError} from '../errors/APIError';

let oauths = [
    'github',
    'google',
    'steem'
];

exports.logout = async function(req, res) {
    try{
        req.session.user = null;
        req.session.sid = null;
        return res.status(200).json('ok');
    } catch(err) {
        return res.status(500).json({resCode:500, err:'error'});
    }
};

exports.user = async function(req, res) {
    try{
        if (!req.session.user) {
            return res.status(401).json({resCode:401, err:'please login chat'});
        } else {
            return res.status(200).json({user:req.session.user, sid:req.session.sid});
        }
    } catch(err) {
        return res.status(500).json({resCode:500, err:'error'});
    }
};

exports.cb = async function(req, res) {
    try{
        let code = req.query.code;
        let ref = req.query.ref;
        let route = req.params.oauth
        if(oauths.indexOf(route) == -1) {
            return res.status(500).json({resCode:500, err:'error'});
        }
        let method = 'POST';
        let body = {};
        body.code = code;
        body.ref = ref;
        let user = await _send(route, method, body);
        req.session.user = user.user;
        req.session.sid = user.sid;
        res.render('cb', {message:'login success',skin:req.session.skin});
    } catch(err) {
        console.log(err);
        res.render('login', {message:err.toString(),skin:req.session.skin});
    }
};

async function _send(route, method, body){
    let url = config.get('mydice.auth.url')+route+'/auth';
    let res = await fetch(url, {
        method,
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
    });
    if(res.status == 200){
        let data = await res.json();
        return data;
    } else {
        console.log('call api error ');
        throw new APIError("call api error",{value:"api error"});
    }
}

