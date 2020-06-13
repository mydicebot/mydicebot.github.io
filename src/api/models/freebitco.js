'use strict';

var BaseDice = require('./base');
var fetch = require('isomorphic-fetch');
var FormData = require('form-data');
var APIError = require('../errors/APIError');
var querystring = require('querystring');
var SocksProxyAgent = require('socks-proxy-agent');

module.exports = class FreeBitco extends BaseDice {
    constructor(proxy){
        super(proxy);
        this.url = 'https://freebitco.in';
        this.benefit = '&r=16392656'
    }

    async login(userName, password, twoFactor ,apiKey, req) {
        let csrf_token = await this._getCsrfToken();
        let formData = new FormData();
        formData.append('csrf_token', csrf_token);
        formData.append('op', 'login_new');
        formData.append('btc_address', userName);
        formData.append('password', password);
        if(twoFactor) {
            formData.append('tfa_code', twoFactor);
        }
        let cookie = 'csrf_token='+csrf_token;
        let ret = await this._send('', 'POST', formData,'', cookie, false);
        req.session.accessToken = ret[2];
        req.session.username = ret[1]+':'+csrf_token;
        return true;
    }

    async getUserInfo(req) {
        return true
    }

    async refresh(req) {
        let info = req.session.info;
        if(info){
            console.log("info is not null");
            return info;
        }
        let accessToken = req.session.accessToken;
        let uname = req.session.username;
        let btc_address = uname.split(':')[0];
        let csrf_token = uname.split(':')[1];
        let cookie = 'csrf_token='+csrf_token+';btc_address='+btc_address+';password='+accessToken+';have_account=1';
        let ret = await this._send('cgi-bin/api.pl?op=get_user_stats', 'GET', '','', cookie, true);
        let userinfo = {};
        userinfo.bets = ret.rolls_played;
        userinfo.wins = 0;
        userinfo.losses = 0;
        userinfo.profit = parseFloat(ret.dice_profit/100000000).toFixed(8);
        //userinfo.wagered = parseFloat(ret.wagered/100000000).toFixed(8);
        userinfo.wagered = 0;
        userinfo.balance = parseFloat(ret.balance/100000000).toFixed(8);
        userinfo.success = true;
        info.info = userinfo;
        req.session.info = info;
        return info;
    }

    async clear(req) {
        console.log('loading....');
        let accessToken = req.session.accessToken;
        let info = {};
        let uname = req.session.username;
        let btc_address = uname.split(':')[0];
        let csrf_token = uname.split(':')[1];
        let cookie = 'csrf_token='+csrf_token+';btc_address='+btc_address+';password='+accessToken+';have_account=1';
        let ret = await this._send('cgi-bin/api.pl?op=get_user_stats', 'GET', '','', cookie, true);
        //console.log(ret);
        let userinfo = {};
        userinfo.bets = ret.rolls_played;
        userinfo.wins = 0;
        userinfo.losses = 0;
        userinfo.profit = parseFloat(ret.dice_profit/100000000).toFixed(8);
        //userinfo.wagered = parseFloat(ret.wagered/(100000000*100000000)).toFixed(8);
        userinfo.wagered = 0;
        userinfo.balance = parseFloat(ret.balance/100000000).toFixed(8);
        userinfo.success = true;
        info.info = userinfo;
        info.currentInfo = {};
        info.currentInfo.balance = parseFloat(ret.balance/100000000).toFixed(8);
        info.currentInfo.bets = 0;
        info.currentInfo.wins = 0;
        info.currentInfo.losses = 0;
        info.currentInfo.profit = 0;
        info.currentInfo.wagered = 0;
        req.session.info = info;
        return info;
    }

    async bet(req) {
        let accessToken = req.session.accessToken;
        let uname = req.session.username;
        let btc_address = uname.split(':')[0];
        let csrf_token = uname.split(':')[1];
        let cookie = 'csrf_token='+csrf_token+';btc_address='+btc_address+';password='+accessToken+';have_account=1';
        let data = {};
        let amount = parseFloat(req.body.PayIn/100000000).toFixed(8);
        let currency = req.body.Currency.toLowerCase();
        let condition = req.body.High == "true"?"hi":"lo";
        let game = 0;
        if(req.body.High == "true"){
            game = 999999-Math.floor((req.body.Chance*10000))+1;
        } else {
            game = Math.floor((req.body.Chance*10000))-1;
        }
        let multiplier = (100-5)/req.body.Chance;

        let client_seed = Math.random().toString(36).substring(2);
        let rand = this._random(0,9999999)/10000000;
        let chance = parseFloat(game/10000).toFixed(2);
        let params = querystring.stringify({ m: condition, client_seed: client_seed, jackpot: 0, stake:amount, multiplier:multiplier, rand:rand, csrf_token:csrf_token});

        //console.log(params);
        let ret = await this._send('cgi-bin/bet.pl?'+params, 'GET', '','', cookie, false);
        console.log(ret);
        let info = req.session.info;
        let betInfo = {};
        betInfo.condition = req.body.High == "true"?'>':'<';
        betInfo.id = '<a href="https://s3.amazonaws.com/roll-verifier/verify.html?server_seed='+ret[9]+'&client_seed='+client_seed+'&server_seed_hash='+ret[10]+'&nonce='+ret[12]+'" target="_blank">'+ret[9]+'</a>';
        betInfo.serverSeed = ret[9];
        betInfo.clientSeed = client_seed;
        betInfo.nonce = ret[12];
        betInfo.serverHash = ret[10];
        betInfo.iid = ret[9];
        betInfo.target = chance;
        betInfo.roll = parseFloat(ret[2]/100).toFixed(2);
        betInfo.amount = amount;
        info.info.bets++;
        info.currentInfo.bets++;
        if(ret[1] == "w"){
            betInfo.win = true;
            betInfo.profit = parseFloat(ret[4]).toFixed(8);
            info.info.wins++;
            info.currentInfo.wins++;
        } else {
            betInfo.win = false;
            betInfo.profit = parseFloat(-ret[4]).toFixed(8);
            info.info.losses++;
            info.currentInfo.losses++;
        }
        betInfo.payout = (parseFloat(amount) + parseFloat(betInfo.profit)).toFixed(8);
        info.info.profit = (parseFloat(info.info.profit) + parseFloat(betInfo.profit)).toFixed(8);
        info.info.balance = ret[3];
        info.currentInfo.balance = ret[3];
        info.info.wagered = (parseFloat(info.info.wagered) + parseFloat(betInfo.amount)).toFixed(8);
        info.currentInfo.wagered = (parseFloat(info.currentInfo.wagered) + parseFloat(betInfo.amount)).toFixed(8);
        info.currentInfo.profit = (parseFloat(info.currentInfo.profit) + parseFloat(betInfo.profit)).toFixed(8);
        let returnInfo = {};
        returnInfo.betInfo= betInfo;
        returnInfo.info = info;
        req.session.info = info;
        console.log(returnInfo.betInfo);
        return returnInfo;
    }

    async _getCsrfToken() {
        let url = this.url;
        let method = "GET";
        let options= {
            method,
            headers: {
                'User-Agent': 'MyDiceBot',
            },
        };
        if(this.proxy.ip) {
            let socks = 'socks://'+this.proxy.ip+':'+this.proxy.port;
            if(this.proxy.user){
                socks = 'socks://'+this.proxy.user+':'+this.proxy.password+'@'+this.proxy.ip+':'+this.proxy.port;
            }
            let agent = new SocksProxyAgent(socks);
            options.agent  = agent;
        }
        let res = await fetch(url, options);
        let csrfToken = this._parseCookies(res);
        return csrfToken;
    }

    async _send(route, method, body, accessToken, cookie, isJson){
        let url = `${this.url}/${route}`;
        let options = {
            method,
            headers: {
                'User-Agent': 'MyDiceBot',
                Cookie: cookie,
            },
            body: body,
        };
        if(this.proxy.ip) {
            let socks = 'socks://'+this.proxy.ip+':'+this.proxy.port;
            if(this.proxy.user){
                socks = 'socks://'+this.proxy.user+':'+this.proxy.password+'@'+this.proxy.ip+':'+this.proxy.port;
            }
            let agent = new SocksProxyAgent(socks);
            options.agent  = agent;
        }
        let res = await fetch(url, options);
        let data = "e:freebitcoin error, Please wait minutes before trying again";
        let ret = data.split(':');
        if(!isJson) {
            data = await res.text();
            //console.log(data);
            ret = data.split(':');
            if(ret[0] == 'e') {
                let errs = new Error(ret[1]);
                errs.value = ret[1];
                throw new APIError(ret[1] ,errs);
            }
            if(ret[0] == 'e6') {
                let err = ret[1];
                if(ret[1] == 20){
                    err = "Balance too low.";
                }
                let errs = new Error(err);
                errs.value = err;
                throw new APIError(err ,errs);
            }
        } else {
            data = await res.json();
            //console.log(data);
            if(data.status == 'error') {
                let errs = new Error(data.msg);
                errs.value = data.msg;
                throw new APIError(data.msg ,errs);
            }
            ret = data;
        }
        return ret;
    }

    _parseCookies(response) {
        let raw = response.headers.raw()['set-cookie'];
        let csrfToken = "";
        raw.forEach(function(entry) {
            let parts = entry.split(';');
            let cookiePart = parts[0];
            if(cookiePart.indexOf('csrf_token')>=0){
                csrfToken = cookiePart.split("=")[1];
            }
        });
        return csrfToken;
    }

    _random(low, high) {
        return Math.random() * (high - low) + low
    }
}
exports.FreeBitco
