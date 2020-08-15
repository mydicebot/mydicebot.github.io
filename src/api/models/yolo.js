'use strict';

var BaseDice = require('./base');
var tls = require('tls');
var bitcore = require('bitcore-lib');
var Message = require('bitcore-message');

module.exports = class YoloDice extends BaseDice {

    constructor(proxy){
        super(proxy);
        this.host = 'api.yolodice.com';
        this.port = '4444';
        this.connected = false;
    }

    async connect(apiKey){
        let yolo = this; 
        this.id = 0;
        this.client = tls.connect(this.port, this.host);
        this.client.setKeepAlive(true, 0);

        this.client.on('close', function() {
            yolo.connected = false;
            console.log("Connection closed");
        });
        this.client.on('error', function(error) {
            yolo.connected = false;
            console.log(error);
        });
        let options = {
            id: this.id++,
            method: 'generate_auth_challenge'
        };
        let ret = await this._send(options);
        let challenge = JSON.parse(ret).result;
        //console.log(challenge);
        let privateKey = bitcore.PrivateKey.fromWIF(apiKey);
        let sig = Message(challenge).sign(privateKey);
        options = {
            id:this.id++,
            method: 'auth_by_address',
            params: {
                address: privateKey.toAddress().toString(),
                signature: sig
            }
        }
        ret = await this._send(options);
        let user = JSON.parse(ret).result;
        this.connected = true;
        return user;
    }

    async login(userName, password, twoFactor ,apiKey, req) {
        let user = await this.connect(apiKey);
        req.session.apiKey = apiKey;
        req.session.username = user.name;
        req.session.userid = user.id;
        return true;
    }

    async refresh(req) {
        if(!this.connected){
            await this.connect(req.session.apiKey);
        }
        //console.log('refresh')
        //await this.connect(req.session.apiKey);
        let options = {
            id:this.id++,
            method: 'read_user_coin_data',
            params: {
                selector:{
                    id: req.session.userid+'_'+req.query.currency
                }
            }
        }
        let ret = await this._send(options);
        let info = req.session.info;
        //console.log(info);
        if(!info){
            return true;
        }
        let currentInfo = ret;
        info.info = JSON.parse(ret).result;
        req.session.info = info;
        return info;
    }

    async clear(req) {
        console.log('loading....');
        if(!this.connected){
            await this.connect(req.session.apiKey);
        }
        //await this.connect(req.session.apiKey);
        let options = {
            id:this.id++,
            method: 'read_user_coin_data',
            params: {
                selector:{
                    id: req.session.userid+'_'+req.query.currency
                }
            }
        }
        let ret = await this._send(options);
        let currentInfo = ret;
        let info = {};
        info.info = JSON.parse(ret).result;
        info.currentInfo = JSON.parse(currentInfo).result;
        info.currentInfo.bets = 0;
        info.currentInfo.wins = 0;
        info.currentInfo.losses = 0;
        info.currentInfo.profit = 0;
        info.currentInfo.wagered = 0;
        req.session.info = info;
        return info;
    }

    async bet(req) {
        //await this.connect(req.session.apiKey);
        if(!this.connected){
            await this.connect(req.session.apiKey);
        }
        let betRoll = 0;
        let currency = req.body.Currency.toLowerCase();
        //console.log(currency)
        let range = 'lo';
        if(req.body.High =="true"){
            range = 'hi';
            //betRoll = 999999-Math.floor((req.body.Chance*10000))+1;
            betRoll = Math.floor((req.body.Chance*10000));
        } else {
            range = 'lo';
            betRoll = Math.floor((req.body.Chance*10000))-1;
        }
        let options = {
            id:this.id++,
            method: 'create_bet',
            params: {
                attrs:{
                    coin: currency,
                    amount: req.body.PayIn,
                    target: betRoll,
                    range: range,
                }
            }
        }
        console.log(options);
        let ret = await this._send(options);
        console.log(ret);
        let info = req.session.info;
        let betInfo = JSON.parse(ret);
        if(betInfo.error){
            return betInfo.error;
        }
        betInfo = betInfo.result;
        betInfo.range = req.body.High == "true"?'>':'<';
        betInfo.payout = betInfo.amount + betInfo.profit ;
        info.info.bets++;
        info.currentInfo.bets++;
        info.info.balance = info.info.balance + betInfo.profit;
        info.currentInfo.balance = info.currentInfo.balance + betInfo.profit;
        info.info.wagered = info.info.wagered + betInfo.amount;
        info.currentInfo.wagered = info.currentInfo.wagered + betInfo.amount;
        info.currentInfo.profit = info.currentInfo.profit + betInfo.profit;
        info.info.profit = info.info.profit + betInfo.profit;
        if(betInfo.win){
            info.info.wins++;
            info.currentInfo.wins++;
        } else {
            info.info.losses++;
            info.currentInfo.losses++;
        }
        let returnInfo = {};
        returnInfo.betInfo= betInfo;
        returnInfo.info = info;
        req.session.info = info;
        console.log(returnInfo);
        return returnInfo;
    }

    async getUserInfo(req) {
        //console.log('get user info')
        //await this.connect(req.session.apiKey);
        if(!this.connected){
            await this.connect(req.session.apiKey);
        }
        let options = {
            id:this.id++,
            method: 'read_user_coin_data',
            params: {
                selector:{
                    id: req.session.userid+'_'+req.query.currency
                }
            }
        }
        let ret = await this._send(options);
        let info = req.session.info;
        //console.log(info);
        if(!info){
            return true;
        }
        let currentInfo = ret;
        info.info = JSON.parse(ret).result;
        req.session.info = info;
        //console.log(info);
        return info;
    }

    async resetseed(req) {
        //await this.connect(req.session.apiKey);
        if(!this.connected){
            await this.connect(req.session.apiKey);
        }
        let seed = Math.random().toString(32).substring(2);
        let options = {
            id:this.id++,
            method: 'create_seed',
            attrs:{
                client_seed: seed,
            }
        }

        let ret = await this._send(options);
        let info = JSON.parse(ret).result;
        console.log(info);
        //info.seed = ret.rotateServerSeed.seed;
        //info.seedHash = ret.rotateServerSeed.seedHash;
        info.seed = seed; 
        info.success = true;
        return info;
    }

    async _send(options){
        return new Promise(async (resolve, reject) => {
            let basestring = JSON.stringify(options)+'\n';
            console.log(basestring);
            this.client.write(basestring);
            this.client.on("data", function(data) {
                resolve(Buffer.from(data,'hex').toString('utf8'));
            });
        });
    }
}
exports.YoloDice
