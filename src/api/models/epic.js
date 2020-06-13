'use strict';

var BaseDice = require('./base');
var request = require('request');
var steem = require('steem');

module.exports = class EpicDice extends BaseDice {
    constructor(proxy){
        super(proxy);
        this.url = 'https://epicdice.io';
        this.benefit = '?ref=mydicebot'
        this.currencys = ["steem","sbd"];
        steem.api.setOptions({url:'https://api.steemit.com'});
    }

    async login(userName, password, twoFactor ,apiKey, req) {
        req.session.accessToken = apiKey;
        req.session.username = userName;
        return true;
    }

    async getUserInfo(req) {
        let info = req.session.info;
        if(typeof info != 'undefined'){
            return true;
        }
        let userName = req.session.username;
        let ret = await steem.api.getAccountsAsync([userName]);
        let userinfo = {
            'bets' : 0,
            'wins' : 0,
            'losses' : 0,
            'profit' : 0,
            'wagered' : 0,
            'balance' : 0,
        };
        for(let k in ret){
            let sbd = ret[k]['sbd_balance'].split(' ');
            let steem_balance = ret[k]['balance'].split(' ');
            userinfo.balance = parseFloat(steem_balance[0]);
        }
        info = {};
        let currentInfo = userinfo;
        info.info = userinfo;
        req.session.info = info;
        //console.log(req.session.info);
        return info;
    }

    async refresh(req) {
        let info = req.session.info;
        if(info){
            return info;
        }
        let userName = req.session.username;
        let ret = await steem.api.getAccountsAsync([userName]);
        for(let k in ret){
            let balance = new Array();
            balance['sbd'] = ret[k]['sbd_balance'].split(' ');
            balance['steem'] = ret[k]['balance'].split(' ');
            info.info.balance = parseFloat(balance[req.query.currency][0]);
        }
        req.session.info = info;
        return info;
    }

    async clear(req) {
        console.log('loading....');
        let userName = req.session.username;
        let ret = await steem.api.getAccountsAsync([userName]);
        let info = {};
        info.info = {
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
        }
        for(let k in ret){
            let balance = new Array();
            balance['sbd'] = ret[k]['sbd_balance'].split(' ');
            balance['steem'] = ret[k]['balance'].split(' ');
            info.info.balance = parseFloat(balance[req.query.currency][0]);
            info.currentInfo.balance = parseFloat(balance[req.query.currency][0]);
            info.info.success = 'true';
        }
        req.session.info = info;
        return info;
    }

    async bet(req) {
        req.setTimeout(500000);
        let info = req.session.info;
        let amount = (req.body.PayIn/100000000).toFixed(3);
        let condition = req.body.High == "true"?'over':'under';
        let currency = req.body.Currency.toLowerCase();
        let target = 0;
        if(req.body.High == "true"){
            // only magic dice using this formula + 1
            target = 99-Math.floor(req.body.Chance) + 1;
        } else {
            // only magic dice using this formula + 1
            target = Math.floor(req.body.Chance) + 1;
        }
        //let memo = condition + ' ' + target + ' mydicebot' + Math.random().toString(36).substring(2);
        let memo = condition + ' ' + target;
        let bet = amount + ' '+ req.body.Currency.toUpperCase();
        let userName = req.session.username;
        let token = req.session.accessToken;
        let epicDice = 'epicdice';
	    try{
            let ret = await this._transfer(token, userName, epicDice, bet, memo);
            let data = await this._getBetInfo(ret.id, userName);
            if(typeof data._id == "undefined") {
                data = await this._getBetInfoFromUser(userName,ret.id);
            }
            if(typeof data._id != "undefined") {
                data.amount = amount;
                let betInfo = {};
                betInfo.id = data._id;
                betInfo.condition = req.body.High == "true"?'>':'<';
                betInfo.target = target;
                betInfo.profit = (parseFloat(data.payout) - parseFloat(data.amount)).toFixed(8);
                betInfo.roll_number = data.diceRoll;
                betInfo.payout = parseFloat(data.payout).toFixed(8);
                betInfo.amount = parseFloat(data.amount).toFixed(8);
                info.info.balance = (parseFloat(info.info.balance) + parseFloat(betInfo.profit)).toFixed(8);
                info.currentInfo.balance = (parseFloat(info.currentInfo.balance) + parseFloat(betInfo.profit)).toFixed(8);
                info.info.bets++;
                info.currentInfo.bets++;
                info.info.profit = (parseFloat(info.info.profit) + parseFloat(betInfo.profit)).toFixed(8);
                info.info.wagered = (parseFloat(info.info.wagered) + parseFloat(amount)).toFixed(8);
                info.currentInfo.wagered = (parseFloat(info.currentInfo.wagered) + parseFloat(amount)).toFixed(8);
                info.currentInfo.profit = (parseFloat(info.currentInfo.profit) + parseFloat(betInfo.profit)).toFixed(8);
                if(data.won){
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
            } else {
                throw new Error('bet data is null');
            }
	    } catch(e) {
            throw e;
	    }
    }

    async _getBetInfoFromUser(account, id){
        let memoRegEx = /\{(.*)/;
        return new Promise(async (resolve, reject) => {
            try {
                let options = {
                    url: ' https://api.steemit.com',
                    method: 'POST',
                    json: {
                        jsonrpc: '2.0',
                        method: 'condenser_api.get_account_history',
                        params: [account, -1, 1],
                        id: 1
                    },
                    timeout:10000
                };
                for(let tryQueryCount=0; tryQueryCount<20; tryQueryCount++) {
                        let data = await this._queryUserInfo(options,id);
                        if(data !== undefined){
                            tryQueryCount = 999;
                            console.log(data);
                            resolve(data)
                        } else {
                            console.log('Waiting for blockchain packing.....');
                            await this._sleep(15000);
                        }
                }
                resolve('not found')
            } catch (e) {
                reject( e );
            }
        });
    }



    async _getBetInfo(id, userName){
        let memoRegEx = /\{(.*)/;
        let tryQueryCount = 0;
        return new Promise(( resolve, reject ) => {
            let release = steem.api.streamOperations(async function (err, op) {
                if (err) {
                    reject( err );
                } else {
                    if (op[0] === "transfer" && op[1].to === userName) {
                        if (op[1].from === "epicdice" && op[1].memo.startsWith("You")) {
                            tryQueryCount++;
                            let json = memoRegEx.exec(op[1].memo)[0];
                            try {
                                json = JSON.parse(json);
                                if(json.TransactionId == id ){
                                    release();
                                    let memo = op[1].memo;
                                    let steems = op[1].amount.split(' ');
                                    let data = {};
                                    data.amount = json.betAmount;
                                    data.payout = steems[0];
                                    data._id = id;
                                    data.diceRoll = json.diceRolled;
                                    data.won = false;
                                    if (memo.indexOf("Won")>0) {
                                        data.won = true;
                                    }
                                    resolve(data);
                                 }
                            } catch (e) {
                                 reject( e );
                            }
                         }
                         if (op[1].from === "epicdice" && !op[1].memo.startsWith("You")) {
                             release();
                             let memo = op[1].memo;
                             console.log(memo);
                             reject(memo);
                         }
                    }
                }
                if(tryQueryCount>=100){
                    release();
                    resolve({});
                }
            });
        });
    }

    async _transfer(p,u,t,s,m){
        return new Promise(( resolve, reject ) => {
            steem.broadcast.transfer(p, u, t, s, m, function(err, result){
                if(err) {
                    reject( err );
                } else {
                    resolve( result );
                }
            });
        });
    }
    async _sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms))
    }

    async _queryUserInfo(options, id){
        let memoRegEx = /\{(.*)/;
        return new Promise(( resolve, reject ) => {
            let req = request.post(options,function (e, r, body) {
                if(e) {
                    console.log('reject error');
                    reject( e );
                } else {
                    if(body) {
                        let res = body.result;
                        for(let k  in res) {
                            let tran = res[k][1].op;
                            if (tran[0] == "transfer" && tran[1].from == "epicdice" && tran[1].memo.startsWith("You")) {
                                let json = memoRegEx.exec(tran[1].memo)[0];
                                try {
                                    json = JSON.parse(json);
                                    if(json.TransactionId == id ){
                                        let memo = tran[1].memo;
                                        let steems = tran[1].amount.split(' ');
                                        let data = {};
                                        data.amount = json.betAmount;
                                        data.payout = steems[0];
                                        data._id = id;
                                        data.diceRoll = json.diceRolled;
                                        data.won = false;
                                        if (memo.indexOf("Won")>0) {
                                            data.won = true;
                                        }
                                        resolve(data);
                                    }
                                } catch (e) {
                                    reject( e );
                                }
                            }
                            if (tran[1].from === "epicdice" && tran[1].memo.startsWith("Refund")) {
                                let memo = tran[1].memo;
                                console.log(memo);
                                reject(memo);
                            }
                        }
                    }
                    resolve();
                }
            });
        });
    }
}
exports.EpicDice
