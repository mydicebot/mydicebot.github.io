'use strict';

var BaseDice = require('./base');
var fetch = require('isomorphic-fetch');
var APIError = require('../errors/APIError');
var SocksProxyAgent = require('socks-proxy-agent');

module.exports = class SatoshiDice extends BaseDice {
    constructor(proxy){
        super(proxy);
        this.url = 'https://www.satoshidice.io';
        this.benefit = '?c=mydicebot'
    }

    async login(userName, password, twoFactor ,apiKey, req) {
        let data = {};
        data.username = userName;
        data.password = password;
        let ret = await this._send('api/login', 'POST', data, '');
        console.log(ret);
        req.session.accessToken = ret.token;
        req.session.username = userName;
        req.session.balance = ret.message.balance;
        //console.log(req.session);
        //console.log(req.session.accessToken);
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
        let userinfo = {};
        userinfo.bets = 0;
        userinfo.wins = 0;
        userinfo.losses = 0;
        userinfo.profit = 0;
        userinfo.wagered = 0;
        userinfo.balance = req.session.balance;
        userinfo.success = true;
        info.info = userinfo;
        req.session.info = info;
        return info;
    }

    async clear(req) {
        let info = {};
        let userinfo = {};
        userinfo.bets = 0;
        userinfo.wins = 0;
        userinfo.losses = 0;
        userinfo.profit = 0;
        userinfo.wagered = 0;
        userinfo.balance = req.session.balance;
        userinfo.success = true;
        info.info = userinfo;
        info.currentInfo = {};
        info.currentInfo.balance = req.session.balance;
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
        let amount = parseFloat(req.body.PayIn/100000000);
        let currency = req.body.Currency.toLowerCase();
        let condition = req.body.High == "true"?"over":"under";
        let game = 0;
        let data = {};
        if(req.body.High == "true"){
            game = 9999-Math.floor((req.body.Chance*100));
        } else {
            game = Math.floor((req.body.Chance*100));
        }
        let multiplier = (100-1)/req.body.Chance;
        data.betAmount = ""+parseFloat(amount).toFixed(8);
        data.rollNumber= ""+game;
        data.rollDirection = condition;
        let ret = await this._send('api/bet', 'POST', data, accessToken);
        //console.log(ret);
        let info = req.session.info;
        let betInfo = {};
        betInfo.condition = req.body.High == "true"?'>':'<';
        betInfo.id = "clientseed:"+ret.message.currentClientSeed +"serverseed:"+ret.message.currentServerSeedHashed ;
        betInfo.target = game;
        betInfo.roll = ret.message.rollResult;
        betInfo.serverHash = ret.message.currentServerSeedHashed;
        betInfo.clientSeed = ret.message.currentClientSeed;
        betInfo.nonce = ret.message.nextNonce;
        betInfo.amount = amount.toFixed(8);
        info.info.bets++;
        info.currentInfo.bets++;
        if(ret.message.betStatus == "win"){
            betInfo.win = true;
            info.info.wins++;
            info.currentInfo.wins++;
            betInfo.profit = parseFloat(ret.message.balance).toFixed(8) - info.info.balance;
            betInfo.payout = parseFloat(amount+betInfo.profit).toFixed(8);
        } else {
            betInfo.win = false;
            info.info.losses++;
            info.currentInfo.losses++;
            betInfo.payout = 0;
            betInfo.profit = parseFloat(-betInfo.amount).toFixed(8);
        }
        //console.log(betInfo);
        info.info.profit = (parseFloat(info.info.profit) + parseFloat(betInfo.profit)).toFixed(8);
        info.info.balance = parseFloat(ret.message.balance).toFixed(8);
        info.currentInfo.balance = parseFloat(ret.message.balance).toFixed(8);
        info.info.wagered = (parseFloat(info.info.wagered) + parseFloat(betInfo.amount)).toFixed(8);
        info.currentInfo.wagered = (parseFloat(info.currentInfo.wagered)+parseFloat(betInfo.amount)).toFixed(8);
        info.currentInfo.profit = (parseFloat(info.currentInfo.profit)+parseFloat(betInfo.profit)).toFixed(8);
        let returnInfo = {};
        returnInfo.betInfo= betInfo;
        returnInfo.info = info;
        req.session.info = info;
        console.log(returnInfo);
        return returnInfo;
    }

    async _send(route, method, body, cookie){
        let url = `${this.url}/${route}`;
        //console.log(JSON.stringify(body), cookie);
        let options = {
            method,
            headers: {
                'User-Agent': 'MyDiceBot',
                'Content-Type': 'application/json',
                'Cookie': 'token='+cookie,
            },
            body: JSON.stringify(body),
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
        let data = await res.json();
        console.log(data);
        if(route == 'api/login'){
            data.token = this._parseCookies(res);
        }

        if(!data.valid) {
            let errs = new Error(data.message);
            errs.value = JSON.stringify(data.message);
            throw new APIError(data.message ,errs);
        }
        return data;
    }

    _parseCookies(response) {
        let raw = response.headers.raw()['set-cookie'];
        let token = "";
        raw.forEach(function(entry) {
            let parts = entry.split(';');
            let cookiePart = parts[0];
            if(cookiePart.indexOf('token')>=0){
                token = cookiePart.split("=")[1];
            }
        });
        return token;
    }
}
