'use strict';

var BaseDice = require('./base')
var fetch = require('isomorphic-fetch');
var FormData = require('form-data');
var APIError = require('../errors/APIError');
var SocksProxyAgent = require('socks-proxy-agent');

module.exports  = class BitslerDice extends BaseDice {
    constructor(proxy){
        super(proxy);
        this.url = 'https://www.bitsler.com';
        this.benefit = '?ref=mydicebot'
        this.currencys = ["btc","eth","ltc","doge","dash","bch","xrp","zec","etc","neo","kmd","btg","lsk","dgb","qtum","strat","waves","burst"];
    }

    async login(userName, password, twoFactor ,apiKey, req) {
        let formData = new FormData();
        formData.append('username', userName);
        formData.append('password', password);
        formData.append('api_key', apiKey);
        if(twoFactor) {
            formData.append('twofactor', twoFactor);
        }
        let ret = await this._send('login', 'POST', formData,'');
        req.session.accessToken = ret.access_token;
        req.session.username = userName;
        return true;
    }

    async getUserInfo(req) {
        let formData = new FormData();
        let accessToken = req.session.accessToken;
        formData.append('access_token', accessToken);
        let userinfo = await this._send('getuserstats', 'POST', formData,'');
        let info = req.session.info;
        if(typeof info != 'undefined'){
            return true;
        }
        info = {};
        let currentInfo = userinfo;
        info.info = userinfo;
        req.session.info = info;
        return info;
    }

    async refresh(req) {
        let formData = new FormData();
        let info = req.session.info;
        if(info){
            console.log("info is not null");
            return info;
        }
        let accessToken = req.session.accessToken;
        formData.append('access_token', accessToken);
        let userinfo = await this._send('getuserstats', 'POST', formData,'');
        userinfo.balance = eval("ret."+req.query.currency+"_balance");
        userinfo.profit = eval("ret."+req.query.currency+"_profit");
        userinfo.wagered = eval("ret."+req.query.currency+"_wagered");
        userinfo.bets = ret.bets;
        userinfo.wins = ret.wins;
        userinfo.losses = ret.losses;
        userinfo.success = ret.success;
        info.info = userinfo;
        req.session.info = info;
        return info;
    }

    async clear(req) {
        console.log('loading....');
        let formData = new FormData();
        let accessToken = req.session.accessToken;
        formData.append('access_token', accessToken);
        let ret = await this._send('getuserstats', 'POST', formData,'');
        //console.log(ret);
        let info = {};
        let userinfo = {};
        userinfo.balance = eval("ret."+req.query.currency+"_balance");
        userinfo.profit = eval("ret."+req.query.currency+"_profit");
        userinfo.wagered = eval("ret."+req.query.currency+"_wagered");
        userinfo.bets = ret.bets;
        userinfo.wins = ret.wins;
        userinfo.losses = ret.losses;
        userinfo.success = ret.success;
        info.info = userinfo;
        info.currentInfo = {};
        info.currentInfo.balance = eval("ret."+req.query.currency+"_balance");
        info.currentInfo.bets = 0;
        info.currentInfo.wins = 0;
        info.currentInfo.losses = 0;
        info.currentInfo.profit = 0;
        info.currentInfo.wagered = 0;
        req.session.info = info;
        return info;
    }
    
    async resetseed(req) {
        let formData = new FormData();
        let accessToken = req.session.accessToken;
        let seed = Math.random().toString(36).substring(2);
        formData.append('access_token', accessToken);
        //formData.append('seed_client', Math.sin(1).toString().substr(6));
        formData.append('seed_client', seed);
        let ret = await this._send('change-seeds', 'POST', formData,'');
        console.log(ret);
        let info = {};
        info.previous_seed = ret.previous_seed;
        info.previous_client = ret.previous_client;
        info.current_client = ret.current_client;
        info.seed = seed;
        info.success = ret.success;
        return info;
    }

    async bet(req) {
        let formData = new FormData();
        let accessToken = req.session.accessToken; 
        let amount = req.body.PayIn/100000000;
        let condition = req.body.High == "true"?'true':'false';
        let currency = req.body.Currency.toLowerCase();
        let game = 0;
        if(req.body.High == "true"){
            game = 999999-Math.floor((req.body.Chance*10000))+1;
        } else {
            game = Math.floor((req.body.Chance*10000))-1;
        }
        formData.append('access_token', accessToken);
//        formData.append('type', 'dice');
        formData.append('amount', amount);
        formData.append('over', condition);
        formData.append('target', parseFloat(game/10000).toFixed(2));
        formData.append('currency', currency);
        formData.append('api_key','JNOEF-PTSBI-2MCCP-4PAAJ-GDBMP');
        //formData.append('api_key','0b2edbfe44e98df79665e52896c22987445683e78');
        let ret = await this._send('bet-dice', 'POST', formData,'');
        let info = req.session.info;
        let betInfo = ret;
        betInfo.profit = betInfo.profit;
        betInfo.condition = req.body.High == "true"?'>':'<';
        info.info.bets++;
        info.currentInfo.bets++;
        info.info.profit = (parseFloat(info.info.profit) + parseFloat(betInfo.profit)).toFixed(8);
        info.info.balance = betInfo.new_balance;
        info.currentInfo.balance = betInfo.new_balance;
        info.info.wagered = (parseFloat(info.info.wagered) + parseFloat(amount)).toFixed(8);
        info.currentInfo.wagered = (parseFloat(info.currentInfo.wagered) + parseFloat(amount)).toFixed(8);
        info.currentInfo.profit = (parseFloat(info.currentInfo.profit) + parseFloat(betInfo.profit)).toFixed(8);
        betInfo.payout = parseFloat(betInfo.amount)+parseFloat(betInfo.profit);
        if(betInfo.profit>0){
            betInfo.win = true;
            info.info.wins++;
            info.currentInfo.wins++;
        } else {
            betInfo.win = false;
            info.info.losses++;
            info.currentInfo.losses++;
        }
        let returnInfo = {};
        returnInfo.betInfo= betInfo;
        returnInfo.info = info;
        req.session.info = info;
        console.log(returnInfo.betInfo);
        return returnInfo;
    }

    async _send(route, method, body, accessToken){
        let url = `${this.url}/api/${route}${this.benefit}`;
        let options= {
            method,
            headers: {
                'User-Agent': 'DiceBot',
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
        let data = await res.json();
        if (data.success == false) {
            let errs = new Error(data.error);
            errs.value = data.error;
            throw new APIError(data.error ,errs);
        }
        return data;
    }
}
