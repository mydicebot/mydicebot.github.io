'use strict';

var BaseDice = require('./base');
var APIError = require('../errors/APIError');
var fetch = require('isomorphic-fetch');
var SocksProxyAgent = require('socks-proxy-agent');

module.exports = class StakeDice extends BaseDice {
    constructor(proxy){
        super(proxy);
        this.url = 'https://api.stake.com/graphql';
        this.benefit = '?ref=mydicebot'
        this.currencys = ["btc","eth","ltc","doge","bch"];
    }

    async login(userName, password, twoFactor ,apiKey, req) {
        let data = {};
        data.query = "query DiceBotGetBalance{user {activeServerSeed { seedHash seed nonce} activeClientSeed{seed} id balances{available{currency amount}} statistic {game bets wins losses betAmount profit currency}}}";
        let ret = await this._send('', 'POST', data, apiKey);
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
        let data = {};
        data.query = "query DiceBotGetBalance{user {activeServerSeed { seedHash seed nonce} activeClientSeed{seed} id balances{available{currency amount}} statistic {game bets wins losses betAmount profit currency}}}";
        let ret = await this._send('', 'POST', data, req.session.accessToken);
        ret = ret.user;
        let userinfo = {
            'bets' : 0,
            'wins' : 0,
            'losses' : 0,
            'profit' : 0,
            'wagered' : 0,
            'balance' : 0,
        };
        for (let i=0; i<ret.balances.length; i++) {
            if(req.query.currency  == ret.balances[i].available.currency) {
                userinfo.balance = parseFloat(ret.balances[i].available.amount).toFixed(8);
            }
        }
        for (let i=0; i<ret.statistic.length; i++) {
            if(req.query.currency  == ret.statistic[i].currency) {
                userinfo.profit = parseFloat(ret.statistic[i].profit).toFixed(8);
                userinfo.wins = ret.statistic[i].wins;
                userinfo.bets = ret.statistic[i].bets;
                userinfo.losses = ret.statistic[i].losses;
                userinfo.wagered = parseFloat(ret.statistic[i].betAmount).toFixed(8);
            }
        }
        userinfo.success = 'true';
        info.info = userinfo;
        req.session.info = info;
        return info;
    }

    async clear(req) {
        console.log('loading....');
        let data = {};
        data.query = "query DiceBotGetBalance{user {activeServerSeed { seedHash seed nonce} activeClientSeed{seed} id balances{available{currency amount}} statistic {game bets wins losses betAmount profit currency}}}";
        let ret = await this._send('', 'POST', data, req.session.accessToken);
        ret=ret.user;
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
        for (let i=0; i<ret.balances.length; i++) {
            //console.log(ret.balances[i].available);
            if(req.query.currency  == ret.balances[i].available.currency) {
                userinfo.balance = parseFloat(ret.balances[i].available.amount).toFixed(8);
                info.currentInfo.balance = parseFloat(ret.balances[i].available.amount).toFixed(8);
            }
        }

        for (let i=0; i<ret.statistic.length; i++) {
            if(req.query.currency  == ret.statistic[i].currency) {
                userinfo.profit = parseFloat(ret.statistic[i].profit).toFixed(8);
                userinfo.wins = ret.statistic[i].wins;
                userinfo.bets = ret.statistic[i].bets;
                userinfo.losses = ret.statistic[i].losses;
                userinfo.wagered = parseFloat(ret.statistic[i].betAmount).toFixed(8);
            }
        }
        userinfo.success = 'true';
        info.info = userinfo;
        req.session.info = info;
        return info;
    }

    async bet(req) {
        let amount = req.body.PayIn/100000000;
        let condition = req.body.High == "true"?'above':'below';
        let currency = req.body.Currency.toLowerCase();
        let target = 0;
        if(req.body.High == "true"){
            target = 999999-Math.floor((req.body.Chance*10000))+1;
        } else {
            target = Math.floor((req.body.Chance*10000))-1;
        }
        target = parseFloat(target/10000).toFixed(2);
        //let data = {};
        //data.query = " mutation{diceRoll(amount:"+amount+",target:"+target+",condition:"+ condition +",currency:"+currency+ ") { id nonce currency amount payout state { ... on CasinoGameDice { result target condition } } createdAt serverSeed{seedHash seed nonce} clientSeed{seed} user{balances{available{amount currency}} statistic{game bets wins losses betAmount profit currency}}}}";

        let betdata = "{\"operationName\":\"DiceRoll\",\"variables\":{\"target\":"+target+",\"condition\":\""+condition+"\",\"identifier\":\"d316d71e2f075a05339d\",\"amount\":"+amount+",\"currency\":\""+currency+"\"},\"query\":\"mutation DiceRoll($amount: Float!, $target: Float!, $condition: CasinoGameDiceConditionEnum!, $currency: CurrencyEnum!, $identifier: String!) {\\n  diceRoll(amount: $amount, target: $target, condition: $condition, currency: $currency, identifier: $identifier) {\\n    ...CasinoBetFragment\\n    state {\\n      ...DiceStateFragment\\n      __typename\\n    }\\n    __typename\\n  }\\n}\\n\\nfragment CasinoBetFragment on CasinoBet {\\n  id\\n  active\\n  payoutMultiplier\\n  amountMultiplier\\n  amount\\n  payout\\n  updatedAt\\n  currency\\n  game\\n  user {\\n    id\\n    name\\n    __typename\\n  }\\n  __typename\\n}\\n\\nfragment DiceStateFragment on CasinoGameDice {\\n  result\\n  target\\n  condition\\n  __typename\\n}\\n\"}"
        let ret = await this._sendbet('', 'POST', betdata, req.session.accessToken);
        let info = req.session.info;
        let betInfo = ret.diceRoll;
        betdata = "{\"operationName\":\"Bet\",\"variables\":{\"betId\":\""+betInfo.id+"\",\"modal\":\"bet\"},\"query\":\"query Bet($iid: String, $betId: String) {\\n  bet(iid: $iid, betId: $betId) {\\n    ...BetFragment\\n    __typename\\n  }\\n}\\n\\nfragment BetFragment on Bet {\\n  id\\n  iid\\n  type\\n  game {\\n    name\\n    icon\\n    __typename\\n  }\\n  bet {\\n    ... on CasinoBet {\\n      ...CasinoBetFragment\\n      __typename\\n    }\\n    ... on MultiplayerCrashBet {\\n      ...MultiplayerCrashBet\\n      __typename\\n    }\\n    ... on MultiplayerSlideBet {\\n      ...MultiplayerSlideBet\\n      __typename\\n    }\\n    ... on SoftswissBet {\\n      ...SoftswissBet\\n      __typename\\n    }\\n    ... on EvolutionBet {\\n      ...EvolutionBet\\n      __typename\\n    }\\n    __typename\\n  }\\n  __typename\\n}\\n\\nfragment CasinoBetFragment on CasinoBet {\\n  id\\n  active\\n  payoutMultiplier\\n  amountMultiplier\\n  amount\\n  payout\\n  updatedAt\\n  currency\\n  game\\n  user {\\n    id\\n    name\\n    __typename\\n  }\\n  __typename\\n}\\n\\nfragment MultiplayerCrashBet on MultiplayerCrashBet {\\n  id\\n  user {\\n    id\\n    name\\n    __typename\\n  }\\n  payoutMultiplier\\n  gameId\\n  amount\\n  payout\\n  currency\\n  result\\n  updatedAt\\n  cashoutAt\\n  btcAmount: amount(currency: btc)\\n  __typename\\n}\\n\\nfragment MultiplayerSlideBet on MultiplayerSlideBet {\\n  id\\n  user {\\n    id\\n    name\\n    __typename\\n  }\\n  payoutMultiplier\\n  gameId\\n  amount\\n  payout\\n  currency\\n  slideResult: result\\n  updatedAt\\n  cashoutAt\\n  btcAmount: amount(currency: btc)\\n  active\\n  createdAt\\n  __typename\\n}\\n\\nfragment SoftswissBet on SoftswissBet {\\n  id\\n  amount\\n  currency\\n  updatedAt\\n  payout\\n  payoutMultiplier\\n  user {\\n    id\\n    name\\n    __typename\\n  }\\n  softswissGame: game {\\n    id\\n    name\\n    edge\\n    extId\\n    provider {\\n      id\\n      name\\n      __typename\\n    }\\n    __typename\\n  }\\n  __typename\\n}\\n\\nfragment EvolutionBet on EvolutionBet {\\n  id\\n  amount\\n  currency\\n  createdAt\\n  payout\\n  payoutMultiplier\\n  user {\\n    id\\n    name\\n    __typename\\n  }\\n  softswissGame: game {\\n    id\\n    name\\n    edge\\n    __typename\\n  }\\n  __typename\\n}\\n\"}";
        let dataIID = await this._sendbet('', 'POST', betdata, req.session.accessToken);
        console.log(dataIID);
        betInfo.iid = dataIID.bet.iid.split(":")[1];
        betInfo.condition = req.body.High == "true"?'>':'<';
        betInfo.target = target;
        betInfo.profit = (parseFloat(betInfo.payout) - parseFloat(betInfo.amount)).toFixed(8);
        betInfo.roll = parseFloat(betInfo.state.result).toFixed(2);
        betInfo.payout = parseFloat(betInfo.payout).toFixed(8);
        betInfo.amount = parseFloat(betInfo.amount).toFixed(8);
        info.info.balance = (parseFloat(info.info.balance) + parseFloat(betInfo.profit)).toFixed(8);
        info.currentInfo.balance = (parseFloat(info.currentInfo.balance) + parseFloat(betInfo.profit)).toFixed(8);
        info.info.bets++;
        info.currentInfo.bets++;
        info.info.profit = (parseFloat(info.info.profit) + parseFloat(betInfo.profit)).toFixed(8);
        info.info.wagered = (parseFloat(info.info.wagered) + parseFloat(amount)).toFixed(8);
        info.currentInfo.wagered = (parseFloat(info.currentInfo.wagered) + parseFloat(amount)).toFixed(8);
        info.currentInfo.profit = (parseFloat(info.currentInfo.profit) + parseFloat(betInfo.profit)).toFixed(8);
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
        return returnInfo;
    }

    async resetseed(req) {
        let clientSeed = Math.random().toString(36).substring(2);
        let data = {};
        let variables = {};
        data.query = "mutation DiceBotRotateSeed ($seed: String!){rotateServerSeed{ seed seedHash nonce } changeClientSeed(seed: $seed){seed}}";
        variables.seed = clientSeed;
        data.variables = variables;
        let ret = await this._send('', 'POST', data, req.session.accessToken);
        console.log(clientSeed, ret);
        let info = {};
        info.seed = clientSeed;
        info.seedHash = ret.rotateServerSeed.seedHash;
        info.success = true;
        return info;
    }

    async _send(route, method, body, accessToken){
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

    async _sendbet(route, method, body, accessToken){
        let url = `${this.url}`;
        let options = {
            method: method,
            headers: {
                'x-access-token': accessToken,
                'Content-Type': 'application/json',
            },
            body: body
        };
        if(this.proxy.ip) {
            let socks = 'socks://'+this.proxy.ip+':'+this.proxy.port;
            if(this.proxy.user){
                socks = 'socks://'+this.proxy.user+':'+this.proxy.password+'@'+this.proxy.ip+':'+this.proxy.port;
            }
            let agent = new SocksProxyAgent(socks);
            options.agent  = agent;
        }
        options.body = body;
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
exports.StakeDice
