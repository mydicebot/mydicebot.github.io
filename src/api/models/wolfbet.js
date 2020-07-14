'use strict';

var BaseDice = require('./base');
var fetch = require('isomorphic-fetch');
var APIError = require('../errors/APIError');
var SocksProxyAgent = require('socks-proxy-agent');

module.exports = class WolfBet extends BaseDice {
    constructor(proxy){
        super(proxy);
        this.url = 'https://wolf.bet';
        this.benefit = '?c=mydicebot'
    }

    async login(userName, password, twoFactor ,apiKey, req) {
        let ret = await this._send('api/v1/user/balances', 'GET', '', 'Bearer '+apiKey);
        console.log(ret);
        req.session.accessToken = apiKey;
        req.session.username = apiKey;
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
        let currency = req.query.currency;
        let ret = await this._send('api/v1/user/stats/bets', 'GET', '', 'Bearer '+accessToken);
        let userinfo = {};
        userinfo.bets = eval("ret.dice."+req.query.currency+".total_bets");
        userinfo.wins = eval("ret.dice."+req.query.currency+".win");
        userinfo.losses = eval("ret.dice."+req.query.currency+".lose");
        userinfo.profit = eval("ret.dice."+req.query.currency+".profit");
        userinfo.wagered = eval("ret.dice."+req.query.currency+".waggered");
        ret = await this._send('api/v1/user/balances', 'GET', '', 'Bearer '+accessToken);
        ret.balances.forEach(function(item){
            if(currency == item.currency) {
                userinfo.balance = item.amount;
            }
        })
        userinfo.success = true;
        info.info = userinfo;
        req.session.info = info;
        return info;
    }

    async clear(req) {
        console.log('loading....');
        let accessToken = req.session.accessToken;
        let currency = req.query.currency;
        let info = {};
        let ret = await this._send('api/v1/user/stats/bets', 'GET', '', 'Bearer '+accessToken);
        let userinfo = {};
        userinfo.bets = eval("ret.dice."+req.query.currency+".total_bets");
        userinfo.wins = eval("ret.dice."+req.query.currency+".win");
        userinfo.losses = eval("ret.dice."+req.query.currency+".lose");
        userinfo.profit = eval("ret.dice."+req.query.currency+".profit");
        userinfo.wagered = eval("ret.dice."+req.query.currency+".waggered");
        ret = await this._send('api/v1/user/balances', 'GET', '', 'Bearer '+accessToken);
        ret.balances.forEach(function(item){
            if(currency == item.currency) {
                userinfo.balance = item.amount;
            }
        })
        userinfo.success = true;
        info.info = userinfo;
        info.currentInfo = {};
        ret.balances.forEach(function(item){
            if(currency == item.currency) {
                userinfo.balance = item.amount;
                info.currentInfo.balance = item.amount;
            }
        })
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
        data.currency = currency;
        data.game = "dice";
        data.amount = parseFloat(amount).toFixed(8);
        data.rule = condition;
        data.multiplier = multiplier.toFixed(4);
        data.bet_value= (game/100).toFixed(2);
        let ret = await this._send('api/v1/bet/place', 'POST', data, 'Bearer '+accessToken);
        console.log(ret);
        let info = req.session.info;
        let betInfo = {};
        betInfo.condition = req.body.High == "true"?'>':'<';
        betInfo.id = ret.bet.hash;
        betInfo.serverHash = ret.bet.hash;
        betInfo.nonce = ret.bet.nonce;
        betInfo.time = ret.bet.published_at;
        betInfo.target = ret.bet.bet_value;
        betInfo.roll = ret.bet.result_value;
        betInfo.amount = amount.toFixed(8);
        info.info.bets++;
        info.currentInfo.bets++;
        betInfo.profit = ret.bet.profit;
        betInfo.payout = (parseFloat(amount) + parseFloat(betInfo.profit)).toFixed(8);;
        if(ret.bet.state == "win"){
            betInfo.win = true;
            info.info.wins++;
            info.currentInfo.wins++;
        } else {
            betInfo.win = false;
            info.info.losses++;
            info.currentInfo.losses++;
        }
        console.log(betInfo);
        info.info.profit = (parseFloat(info.info.profit) + parseFloat(betInfo.profit)).toFixed(8);
        info.info.balance = parseFloat(ret.userBalance.amount).toFixed(8);
        info.currentInfo.balance = parseFloat(ret.userBalance.amount).toFixed(8);
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

    async resetseed(req) {
        let data = {};
        let accessToken = req.session.accessToken;
        data.client_seed = Math.random().toString(12).substring(2);
        //let ret = await this._send('randomize?api_key='+ accessToken, 'POST',data,'');
        let ret = await this._send('/api/v1/user/seed/refresh', 'POST', data, 'Bearer '+accessToken);
        console.log(ret);
        let info = {};
        info.current_client = ret.seed;
        info.hash = ret.seed;
        info.new_hash = ret.seed;
        info.seed = data.client_seed;
        info.success = true;
        return info;
    }

    async _send(route, method, body, accessToken){
        let url = `${this.url}/${route}`;
        console.log(JSON.stringify(body));
        let options = {
            method,
            headers: {
                'User-Agent': 'MyDiceBot',
                'Authorization': accessToken,
                'Content-Type': 'application/json',
                'X-Requested-With': 'XMLHttpRequest'
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

        if(data.errors) {
            let errs = new Error(JSON.stringify(data.errors));
            errs.value = JSON.stringify(data.errors);
            throw new APIError(JSON.stringify(data.errors) ,errs);
        }
        if(data.error) {
            let errs = new Error(JSON.stringify(data.error));
            errs.value = JSON.stringify(data.error);
            throw new APIError(JSON.stringify(data.error) ,errs);
        }
        return data;
    }
}
