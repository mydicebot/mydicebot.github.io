'use strict';

var BaseDice = require('./base');
var fetch = require('isomorphic-fetch');
var FormData = require('form-data');
var APIError = require('../errors/APIError');
var SocksProxyAgent = require('socks-proxy-agent');

module.exports = class CryptoDice extends BaseDice {
    constructor(proxy){
        super(proxy);
        //this.url = 'https://api.crypto-games.net';
        this.url = 'https://api.crypto.games';
    }

    async login(userName, password, twoFactor ,apiKey, req) {
        let ret = await this._send('user/btc', 'GET', '', apiKey);
        req.session.accessToken = apiKey;
        req.session.username = apiKey;
        return true;
    }

    async getUserInfo(req) {
        return true;
    }

    async refresh(req) {
        //console.log('refresh');
        let info = req.session.info;
        if(!info){
            return false;
        }
        let ret = await this._send('user/'+req.query.currency, 'GET', '', req.session.accessToken);
        //console.log(ret);
        let userinfo = info.info;
        userinfo.bets = ret.TotalBets;
        userinfo.profit = ret.Profit;
        userinfo.wagered = ret.Wagered;
        userinfo.balance = ret.Balance;
        userinfo.success = 'true';
        info.info = userinfo;
        req.session.info = info;
        return info;
    }

    async clear(req) {
        console.log('loading....');
        let ret = await this._send('user/'+req.query.currency, 'GET', '', req.session.accessToken);
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
        info.currentInfo.balance = ret.Balance;
        userinfo.bets = ret.TotalBets;
        userinfo.profit = ret.Profit;
        userinfo.wagered = ret.Wagered;
        userinfo.balance = ret.Balance;
        userinfo.success = 'true';
        info.info = userinfo;
        req.session.info = info;
        return info;
    }

    async bet(req) {
        let amount = parseFloat(req.body.PayIn/100000000);
        //let amount = 0.00000001;
        let condition = req.body.High;
        let currency = req.body.Currency.toLowerCase();
        let target = 0;
        if(req.body.High == "true"){
            target = 999999-Math.floor((req.body.Chance*10000))+1;
        } else {
            target = Math.floor((req.body.Chance*10000))-1;
        }
        target = target/10000;
        let underOver = condition + ' ' + target;
        let payout = parseFloat(parseFloat((100 - 0.8) / target).toFixed(4));
        let data = {};
        data.Payout = payout;
        data.UnderOver = condition;
        data.Bet = amount;
        data.ClientSeed = Math.sin(1).toString().substr(6);
        let ret = await this._send('placebet/'+currency, 'POST', data, req.session.accessToken);
        console.log(ret);
        let info = req.session.info;
        let betInfo = {};
        //{ "BetId": 327333162, "Roll": 47.002, "UnderOver": true, "ClientSeed": "somerandomseed", "Target": " < 49.600", "Profit": 0.000010240000000000, "ServerSeed": "5PCWsiBDsZ1D07cZ14pYKt0T2HUCkcLoTdF70Cmp", "NextServerSeedHash": "4647c8c18b7da5d7174614c6e473864956b42fadf84e24a2f08bd9c2aa69a268", "Balance": 0.010010240000000000 }/
        betInfo.condition = req.body.High == "true"?'>':'<';
        betInfo.id = ret.BetId;
        betInfo.clientSeed = ret.ClientSeed;
        betInfo.serverSeed = ret.ServerSeed;
        betInfo.serverHash = ret.NextServerSeedHash;
        betInfo.target = target;
        betInfo.profit = ret.Profit;
        betInfo.roll = ret.Roll;
        betInfo.payout = payout;
        betInfo.amount = amount;
        info.info.balance = (parseFloat(info.info.balance) + parseFloat(ret.Profit)).toFixed(8);
        info.currentInfo.balance = (parseFloat(info.currentInfo.balance) + parseFloat(ret.Profit)).toFixed(8);
        info.info.bets++;
        info.currentInfo.bets++;
        info.info.profit = (parseFloat(info.info.profit) + parseFloat(ret.Profit)).toFixed(8);
        info.info.wagered = (parseFloat(info.info.wagered) + parseFloat(amount)).toFixed(8);
        info.currentInfo.wagered = (parseFloat(info.currentInfo.wagered) + parseFloat(amount)).toFixed(8);
        info.currentInfo.profit = (parseFloat(info.currentInfo.profit) + parseFloat(ret.Profit)).toFixed(8);
        if(ret.Profit>0){
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
        return returnInfo;
    }

    async _send(route, method, body, accessToken){
        let url = `${this.url}/v1/${route}/${accessToken}`;
        let options = {
            method,
            headers: {
                Accept: 'application/json, text/plain, */*',
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
        //console.log(data);
        if (!res.ok) {
            let errs = new Error(data.Message);
            errs.value = data.Message;
            throw new APIError(data.Message ,errs);
        }
        return data;
    }
}
exports.CryptoDice
