'use strict';

var BaseDice = require('./base');
var fetch = require('isomorphic-fetch');
var FormData = require('form-data');
var APIError = require('../errors/APIError');
var SocksProxyAgent = require('socks-proxy-agent');

module.exports = class NineDoge extends BaseDice {
    constructor(proxy){
        super(proxy);
        this.url = 'https://www.999doge.com';
        this.benefit = '?224280708'
    }

    async login(userName, password, twoFactor ,apiKey, req) {
        apiKey = '794ec0fec4f543f1a14b0b50dbbcb345';
        let formData = new FormData();
        formData.append('a', 'Login');
        formData.append('Username', userName);
        formData.append('Password', password);
        formData.append('Key', apiKey);
        if(twoFactor) {
            formData.append('Totp', twoFactor);
        }
        let ret = await this._send('web.aspx', 'POST', formData,'');
        //console.log(ret);
        if(ret.error) {
            return ret.error;
        }
        //if(!ret.ClientSeed) {
        //    return 'Login Invalid, Please enter the correct information!';
        //}

        req.session.clientSeed = ret.ClientSeed;
        req.session.accessToken = ret.SessionCookie;
        req.session.username = userName;
        req.session.apiKey = req.body.apikey;
        return true;
    }

    async refresh(req) {
        let ret = req.session.info;
        return ret;
    }

    async getUserInfo(req) {
        let formData = new FormData();
        formData.append('a', 'GetBalances');
        formData.append('s', req.session.accessToken);
        let ret = await this._send('web.aspx', 'POST', formData,'');
        let bs =JSON.parse(JSON.stringify(ret.Balances));
        ret.CurrentBalances = bs;
        for (let i=0; i<ret.CurrentBalances.length; i++) {
            ret.CurrentBalances[i].TotalPayIn = 0;
            ret.CurrentBalances[i].TotalBets = 0;
            ret.CurrentBalances[i].TotalPayOut = 0;
            ret.CurrentBalances[i].TotalWins = 0;
        }
        //console.log(ret);
        req.session.info = ret;
        return ret;
    }

    async bet(req) {
        let formData = new FormData();
        let currency = req.body.Currency;
        formData.append('a', 'PlaceBet');
        formData.append('s', req.session.accessToken);
        formData.append('PayIn', req.body.PayIn);
        formData.append('ClientSeed', req.session.clientSeed);
        formData.append('Currency', currency);
        formData.append('ProtocolVersion', 2);
        let betRoll = 0;
        if(req.body.High == "true"){
            betRoll = 999999-Math.floor((req.body.Chance*10000))+1;
            formData.append('Low', betRoll);
            formData.append('High', 999999);
        } else {
            betRoll = Math.floor((req.body.Chance*10000))-1;
            formData.append('Low', 0);
            formData.append('High', betRoll);
        }
        let ret = await this._send('web.aspx', 'POST', formData,'');
        console.log(ret);
        if(ret.NoPossibleProfit == 1) {
            return ret;
        }
        ret.High = req.body.High == "true"?'>':'<';
        ret.PayIn = req.body.PayIn;
        let info = req.session.info;
        let currencyValue = req.body.CurrencyValue;
        info.Balances[currencyValue].TotalBets++;
        info.CurrentBalances[currencyValue].TotalBets++;
        info.Balances[currencyValue].Balance = info.Balances[currencyValue].Balance + ret.PayOut - ret.PayIn;
        info.CurrentBalances[currencyValue].Balance = info.CurrentBalances[currencyValue].Balance + ret.PayOut - ret.PayIn;
        ret.Win = false;
        if((ret.PayOut-ret.PayIn)>0) {
            ret.Win = true;
            info.Balances[currencyValue].TotalWins++;
            info.CurrentBalances[currencyValue].TotalWins++;
        }
        info.Balances[currencyValue].TotalPayIn = info.Balances[currencyValue].TotalPayIn - ret.PayIn;
        info.CurrentBalances[currencyValue].TotalPayIn = info.CurrentBalances[currencyValue].TotalPayIn - ret.PayIn;
        info.Balances[currencyValue].TotalPayOut = info.Balances[currencyValue].TotalPayOut + ret.PayOut;
        info.CurrentBalances[currencyValue].TotalPayOut = info.CurrentBalances[currencyValue].TotalPayOut + ret.PayOut;
        req.session.info = info;
        ret.info = info;
        ret.BetRoll = betRoll;
        return ret;
    }

    async clear(req) {
        console.log('loading....');
        let info = req.session.info;
        let bs =JSON.parse(JSON.stringify(info.Balances));
        info.CurrentBalances = bs;
        for (let i=0; i<info.CurrentBalances.length; i++) {
            info.CurrentBalances[i].TotalPayIn = 0;
            info.CurrentBalances[i].TotalBets = 0;
            info.CurrentBalances[i].TotalPayOut = 0;
            info.CurrentBalances[i].TotalWins = 0;
        }
        req.session.info = info;
        return info;
    }

    async donate(req) {
        let ret = {};
        let amount = req.query.amount;
        let currency = req.query.currency;
        ret.ret = 'ok';
        //mydicebot;
        let account= '224280708';
        amount =  Math.round(amount*100000000);
        console.log("donate", amount, currency);
        if(amount >= 0.00000001){
            let formData = new FormData();
            formData.append('a', 'Withdraw');
            formData.append('s', req.session.accessToken);
            formData.append('Currency', currency);
            formData.append('Amount', amount);
            formData.append('Address', account);
            ret = await this._send('web.aspx', 'POST', formData,'');
            console.log("donate", amount, currency, ret);
        }
        return ret;

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
        if(res.status == 200){
            let data = await res.json();
            return data;
        } else {
            console.log('call api error ');
            throw new APIError("call api error","api not found");
        }
    }
}
exports.NineDoge
