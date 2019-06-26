'use strict';

import {BaseDice} from './base'
import FormData from 'form-data';
import {APIError} from '../errors/APIError'
import { request, GraphQLClient } from 'graphql-request'

export class PrimeDice extends BaseDice {
    constructor(){
        super();
        this.url = 'https://api.primedice.com/graphql';
        this.benefit = '?ref=mydicebot'
        this.currencys = ["btc","eth","ltc","doge","bch"];
    }

    async login(userName, password, twoFactor ,apiKey, req) {
        let data = "query{user {activeServerSeed { seedHash seed nonce} activeClientSeed{seed} id balances{available{currency amount}} statistic {game bets wins losses amount profit currency}}}";
        let ret = await this._send('', 'POST', data, apiKey);
        req.session.accessToken = apiKey;
        req.session.username = apiKey;
        return true;
    }

    async getUserInfo(req) {
        return true;
    }

    async refresh(req) {
        console.log('refresh');
        let info = req.session.info;
        if(!info){
            return false;
        }
        let data = "query{user {activeServerSeed { seedHash seed nonce} activeClientSeed{seed} id balances{available{currency amount}} statistic {game bets wins losses amount profit currency}}}";
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
                userinfo.wagered = parseFloat(ret.statistic[i].amount).toFixed(8);
            }
        }
        userinfo.success = 'true';
        info.info = userinfo;
        req.session.info = info;
        return info;
    }

    async clear(req) {
        console.log('clear');
        let data = "query{user {activeServerSeed { seedHash seed nonce} activeClientSeed{seed} id balances{available{currency amount}} statistic {game bets wins losses amount profit currency}}}";
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
            console.log(ret.balances[i].available);
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
                userinfo.wagered = parseFloat(ret.statistic[i].amount).toFixed(8);
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
            target = 9999-Math.floor((req.body.Chance*100));
        } else {
            target = Math.floor((req.body.Chance*100));
        }
        target = parseFloat(target/100).toFixed(2);
        let data = " mutation{primediceRoll(amount:"+amount+",target:"+target+",condition:"+ condition +",currency:"+currency+ ") { id nonce currency amount payout state { ... on CasinoGamePrimedice { result target condition } } createdAt serverSeed{seedHash seed nonce} clientSeed{seed} user{balances{available{amount currency}} statistic{game bets wins losses amount profit currency}}}}";
        let ret = await this._send('', 'POST', data, req.session.accessToken);
        let info = req.session.info;
        let betInfo = ret.primediceRoll;
        betInfo.iid = betInfo.id;
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

    async _send(route, method, body, accessToken){
        let endpoint =`${this.url}`;

        let graphQLClient = new GraphQLClient(endpoint, {
            headers: {
                'x-access-token': accessToken,
            },
        })
        try {
            let res = await graphQLClient.request(body);
            return res;
        } catch(err) {
            if(err.response.errors) {
                let errs = new Error(err.response.errors[0].message);
                errs.value = err.response.errors[0].message;
                throw new APIError(err.response.errors[0].message, errs);
            } else {
                let errs = new Error(err.response.error);
                errs.value = err.response.error;
                throw new APIError(err.response.error, errs);
            }
        }
    }
}
