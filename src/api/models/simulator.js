'use strict';

var BaseDice = require('./base');
var crypto = require('crypto');

module.exports = class Simulator extends BaseDice {
    constructor(proxy){
        super(proxy);
        this.url = 'https://magic-dice.com';
        this.benefit = '?ref=mydicebot'
        this.currencys = ["btc","eth","ltc","doge","dash","bch","xrp","zec","etc","neo","kmd","btg","lsk","dgb","qtum","strat","waves","burst"];
    }

    async login(userName, password, twoFactor ,apiKey, req) {
        req.session.username = 'Simulator';
        return true;
    }

    async getUserInfo(req) {
        let info = req.session.info;
        if(typeof info != 'undefined'){
            return true;
        }
        let userName = req.session.username;
        let userinfo = {
            'bets' : 0,
            'wins' : 0,
            'losses' : 0,
            'profit' : 0,
            'wagered' : 0,
            'balance' : 1000000,
        };
        info = {};
        let currentInfo = userinfo;
        info.info = userinfo;
        req.session.info = info;
        return info;
    }

    async refresh(req) {
        let info = req.session.info;
        if(!info){
            return false;
        }
        return info;
    }

    async clear(req) {
        console.log('loading....');
        let userName = req.session.username;
        let currency = req.query.currency;
        let balance = req.query.balance;

        let info = {};

        info.info = {
            'bets' : 0,
            'wins' : 0,
            'losses' : 0,
            'profit' : 0,
            'wagered' : 0,
            'balance' : 0.001,
        };
        info.currentInfo = {
            'bets' : 0,
            'wins' : 0,
            'losses' : 0,
            'profit' : 0,
            'wagered' : 0,
            'balance' : 0.001,
        }


        switch(currency) {

            case "currency=btc":{

                info.info.balance=1.000000000*0.01;
                info.currentInfo.balance=1.000000000*0.01;

                break;
            }
            case "currency=eth":{

                info.info.balance=1.000000000*0.001;
                info.currentInfo.balance=1.000000000*0.001;

                break;
            }

               case "currency=ltc":{

                info.info.balance=1.000000000;
                info.currentInfo.balance=1.000000000;

                break;
            }

               case "currency=doge":{

                info.info.balance=1.000000000*1000;
                info.currentInfo.balance=1.000000000*1000;

                break;
            }

               case "currency=bch":{

                info.info.balance=1.000000000;
                info.currentInfo.balance=1.000000000;

                break;
            }

            default:{
                info.info.balance=1.000000000;
                info.currentInfo.balance=1.000000000;
            }
        }
        if(balance) {
            info.info.balance=parseFloat(balance);
            info.currentInfo.balance=parseFloat(balance);
        }

        info.info.balance=info.info.balance.toFixed(8);

        info.info.success = 'true';
        req.session.info = info;
        return info;
    }

    async bet(req) {
        let info = req.session.info;
        let amount = (req.body.PayIn/100000000).toFixed(8);
        let condition = req.body.High == "true"?'over':'under';
        let currency = req.body.Currency.toLowerCase();
        let houseEdge = req.body.HouseEdge;
        let target = 0;
        if(req.body.High == "true"){
            target = 999999-Math.floor(req.body.Chance*10000)+1;
        } else {
          target = Math.floor(req.body.Chance*10000)-1;
        }
        let betInfo = await this._simulatorBet(amount, target, condition, houseEdge);
        betInfo.condition = req.body.High == "true"?'>':'<';
        betInfo.target = target/10000;
        info.info.balance = (parseFloat(info.info.balance) + parseFloat(betInfo.profit)).toFixed(8);
        info.currentInfo.balance = (parseFloat(info.currentInfo.balance) + parseFloat(betInfo.profit)).toFixed(8);
        info.info.bets++;
        info.currentInfo.bets++;
        info.info.profit = (parseFloat(info.info.profit) + parseFloat(betInfo.profit)).toFixed(8);
        info.info.wagered = (parseFloat(info.info.wagered) + parseFloat(amount)).toFixed(8);
        info.currentInfo.wagered = (parseFloat(info.currentInfo.wagered) + parseFloat(amount)).toFixed(8);
        info.currentInfo.profit = (parseFloat(info.currentInfo.profit) + parseFloat(betInfo.profit)).toFixed(8);
        if(betInfo.win){
            info.info.wins++;
            info.currentInfo.wins++;
        } else {
            info.info.losses++;
            info.currentInfo.losses++; } let returnInfo = {};
        returnInfo.betInfo= betInfo;
        returnInfo.info = info;
        req.session.info = info;
        return returnInfo; }

    async _simulatorBet(amount, target, condition, houseEdge ) {
        let betInfo = {};
        betInfo.id = 'MyDiceBot_'+Math.random().toString(16).substring(2).substr(0,10);
        betInfo.amount = parseFloat(amount);
        let serverSeed = Math.random().toString(36).substring(2);
        let clientSeed = Math.random().toString(36).substring(2);
        let cryptoHmac = crypto.createHmac('sha256', serverSeed);
        let resultSeed = cryptoHmac.update(`${clientSeed}`).digest('hex');
        let resultNumber = parseInt(resultSeed.substr(0, 10), 16);
        let diceRoll = (resultNumber % 1000000)+1;
        let factor = 1000000/(target+1);
        if(condition == 'over') {
            factor = 1000000/(999999-target+1);
        }
        let profit = (amount * factor) * (1 - houseEdge) - amount;
        //console.log(amount,factor,betInfo.amount, houseEdge);
        betInfo.serverSeed = serverSeed;
        betInfo.clientSeed = clientSeed;
        betInfo.roll_number = diceRoll/10000;
        betInfo.win = false;
        if(condition == 'over') {
            if(target<diceRoll) {
                betInfo.win = true;
            }
        } else {
            if(target>diceRoll){
                betInfo.win = true;
            }
        }
        if(betInfo.win) {
            betInfo.payout = parseFloat((betInfo.amount+profit)).toFixed(8);
            betInfo.profit = parseFloat(profit).toFixed(8);
        } else {
            betInfo.payout = 0;
            betInfo.profit = parseFloat(-betInfo.amount).toFixed(8);
        }
        //console.log(betInfo);
        return betInfo;
    }

    async donate(req) {
        let ret = {};
        let amount = req.query.amount;
        let currency = req.query.currency;
        ret.ret = 'ok';
        let account= '224280708';
        if(amount>0){
            console.log("donate:", amount, currency, ret);
        }
        return ret;
    }
}
exports.Simulator
