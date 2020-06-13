'use strict';

var BaseDice = require('./base');
var APIError = require('../errors/APIError');
var fetch = require('isomorphic-fetch');
var SocksProxyAgent = require('socks-proxy-agent');

module.exports = class ParaDice extends BaseDice {
    constructor(proxy){
        super(proxy);
        this.url = 'https://api.paradice.in/api.php';
        this.benefit = '?ref=mydicebot'
        this.currencys = ["btc","eth","ltc","doge","dash","prdc"];
    }

    async login(userName, password, twoFactor ,apiKey, req) {
        let data = {};
        data.query = "{ me{ serverSeed serverSeedNonce clientSeed id } }";
        let ret = await this._send('', 'POST', data, apiKey);
        console.log(ret);
        req.session.accessToken = apiKey;
        req.session.username = ret.me.id;
        return true;
    }

    async getUserInfo(req) {
        return true;
    }

    async refresh(req) {
        let info = req.session.info;
        if(!info){
            return false;
        }
        let data = {};
        let variables = {};
        let currency = req.query.currency;
        data.query = "query userStatistics($currency: CurrencyEnum!, $user: ID!) {userStatistics(currency: $currency, user: $user) { betsAmount totalBets totalProfit wins losses luckiness withdrawals }}";
        variables.currency = currency.toUpperCase();
        variables.user = req.session.username;
        data.variables = variables;
        let ret = await this._send('', 'POST', data, req.session.accessToken);
        console.log(ret);
        let userinfo = {
            'bets' : 0,
            'wins' : 0,
            'losses' : 0,
            'profit' : 0,
            'wagered' : 0,
            'balance' : 0,
        };
        userinfo.profit = parseFloat(ret.userStatistics.totalProfit).toFixed(8);
        userinfo.wins = ret.userStatistics.wins;
        userinfo.bets = ret.userStatistics.totalBets;
        userinfo.losses = ret.userStatistics.losses;
        userinfo.wagered = parseFloat(ret.userStatistics.betsAmount).toFixed(8);
        data = {};
        data.query = "{me{ serverSeed serverSeedNonce clientSeed id wallets{currency balance bonus}}}";
        ret = await this._send('', 'POST', data, req.session.accessToken);
        console.log(ret);
        let wallets =  ret.me.wallets;
        wallets.forEach(function (value) {
            if(value.currency == currency.toUpperCase()){
                userinfo.balance = parseFloat(value.balance).toFixed(8);
            }
        });
        userinfo.success = 'true';
        info.info = userinfo;
        req.session.info = info;
        return info;
    }

    async clear(req) {
        console.log('loading....');
        let data = {};
        let variables = {};
        let currency = req.query.currency;
        data.query = "query userStatistics($currency: CurrencyEnum!, $user: ID!) {userStatistics(currency: $currency, user: $user) { betsAmount totalBets totalProfit wins losses luckiness withdrawals }}";
        variables.currency = currency.toUpperCase();
        variables.user = req.session.username;
        data.variables = variables;
        let ret = await this._send('', 'POST', data, req.session.accessToken);
        console.log(ret);
        let info = {};
        let userinfo = {
            'bets' : 0,
            'wins' : 0,
            'losses' : 0,
            'profit' : 0,
            'wagered' : 0,
            'balance' : 0,
        };
        info.currentInfo = {
            'bets' : 0,
            'wins' : 0,
            'losses' : 0,
            'profit' : 0,
            'wagered' : 0,
            'balance' : 0,
        };
        userinfo.profit = parseFloat(ret.userStatistics.totalProfit).toFixed(8);
        userinfo.wins = ret.userStatistics.wins;
        userinfo.bets = ret.userStatistics.totalBets;
        userinfo.losses = ret.userStatistics.losses;
        userinfo.wagered = parseFloat(ret.userStatistics.betsAmount).toFixed(8);

        data = {};
        data.query = "{me{ serverSeed serverSeedNonce clientSeed id wallets{currency balance bonus}}}";
        ret = await this._send('', 'POST', data, req.session.accessToken);
        console.log(ret);
        let wallets =  ret.me.wallets;
        wallets.forEach(function (value) {
            if(value.currency == currency.toUpperCase()){
                userinfo.balance = parseFloat(value.balance).toFixed(8);
                info.currentInfo.balance = parseFloat(value.balance).toFixed(8);
            }
        });

        userinfo.success = 'true';
        info.info = userinfo;
        req.session.info = info;
        return info;
    }

    async bet(req) {
        let amount = req.body.PayIn/100000000;
        let condition = req.body.High == "true"?'ABOVE':'BELOW';
        let currency = req.body.Currency.toUpperCase();
        let target = 0;
        if(req.body.High == "true"){
            target = 9999-Math.floor((req.body.Chance*100));
        } else {
            target = Math.floor((req.body.Chance*100));
        }
        target = parseFloat(target/100).toFixed(2);
        let data = {};
        let variables = {};
        data.query = "mutation rollDice($number: Float!, $betAmount: Float!, $side: RollSideEnum!, $currency: CurrencyEnum!) { rollDice(number: $number, betAmount: $betAmount, side: $side, currency: $currency) {id date betAmount winAmount number rollSide currency roll win multiplier chance clientSeed serverSeedHashed serverSeedUnHashed }}";
        variables.number = target;
        variables.betAmount = amount;
        variables.side = condition;
        variables.currency = currency;
        data.variables = variables;
        let ret = await this._send('', 'POST', data, req.session.accessToken);
        console.log(ret);
        let info = req.session.info;
        let betInfo = ret.rollDice;
        betInfo.profit = parseFloat(betInfo.winAmount-betInfo.betAmount).toFixed(10);
        betInfo.payout = (parseFloat(betInfo.winAmount)).toFixed(8);
        if(betInfo.win){
            info.info.wins++;
            info.currentInfo.wins++;
        } else {
            info.info.losses++;
            info.currentInfo.losses++;
        }
        betInfo.condition = req.body.High == "true"?'>':'<';
        betInfo.target = target;
        betInfo.amount = parseFloat(betInfo.betAmount).toFixed(8);
        info.info.balance = (parseFloat(info.info.balance) + parseFloat(betInfo.profit)).toFixed(8);
        info.currentInfo.balance = (parseFloat(info.currentInfo.balance) + parseFloat(betInfo.profit)).toFixed(8);
        info.info.bets++;
        info.currentInfo.bets++;
        info.info.profit = (parseFloat(info.info.profit) + parseFloat(betInfo.profit)).toFixed(8);
        info.info.wagered = (parseFloat(info.info.wagered) + parseFloat(amount)).toFixed(8);
        info.currentInfo.wagered = (parseFloat(info.currentInfo.wagered) + parseFloat(amount)).toFixed(8);
        info.currentInfo.profit = (parseFloat(info.currentInfo.profit) + parseFloat(betInfo.profit)).toFixed(8);
        let returnInfo = {};
        returnInfo.betInfo= betInfo;
        returnInfo.info = info;
        req.session.info = info;
        return returnInfo;
    }

    async resetseed(req) {
        let clientSeed = Math.random().toString(36).substring(2);
        let data = {};
        let variables = {};
        data.query = "mutation setClientSeed($seed: String!) { setClientSeed(seed: $seed) {id serverSeed serverSeedNonce clientSeed}}"
        variables.seed = clientSeed;
        data.variables = variables;
        let ret = await this._send('', 'POST', data, req.session.accessToken);
        console.log(clientSeed, ret);
        let info = {};
        info.seed = clientSeed;
        info.seedHash = ret.setClientSeed.serverSeed;
        info.success = true;
        return info;
    }

    async _send(route, method, body, accessToken){
        console.log(JSON.stringify(body));
        let url = `${this.url}`;
        let options = {
            method,
            headers: {
                'User-Agent': 'MyDiceBot',
                'x-access-token': accessToken,
                'Content-Type': 'application/json',
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
            let errs = new Error(data.errors[0].message);
            errs.value = data.errors[0].message;
            throw new APIError(data.errors[0].message ,errs);
        }
        let ret = data.data;
        return ret;
    }
}
exports.ParaDice
