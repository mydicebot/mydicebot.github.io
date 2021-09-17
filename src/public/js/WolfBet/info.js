function consoleInit() {
    currencies = ['BTC', 'ETH', 'DOGE', 'LTC','TRX','BCH','XRP','BNB','XLM','SUSHI','UNI','ETC','ADA','DOT','USDT'];
}

function init() {
    console.log('hello WolfBet');
    $$("bet_currency_selection").define("options", [
        {id:1,value:"BTC"},
        {id:2,value:"ETH"},
        {id:3,value:"DOGE"},
        {id:4,value:"LTC"},
        {id:5,value:"TRX"},
        {id:6,value:"BCH"},
        {id:7,value:"XRP"},
        {id:8,value:"BNB"},
        {id:9,value:"XLM"},
        {id:10,value:"SUSHI"},
        {id:11,value:"UNI"},
        {id:12,value:"ETC"},
        {id:13,value:"ADA"},
        {id:14,value:"DOT"},
        {id:15,value:"USDT"},
    ]);
    $$("bet_currency_selection").refresh();
    minBetAmount = 0.00000001;
    $$("manual_bet_amount").setValue(minBetAmount.toFixed(8));
    $$("auto_bet_base_amount").setValue(minBetAmount.toFixed(8));
    consoleInit();
}

function checkParams(p,ch){
    //console.log(p,ch);
    if(p < 0.00000001 || p > 1000000000*1000000000) {
        return false
    }
    if(ch>98 || ch<0.01) {
        return false
    }
    return true;
}

function initScriptBalance(currencyValue, cb){
    getInfo(function(userinfo){
        if(userinfo.info.success == true){
            try {
                balance = userinfo.info.balance;
                bets = userinfo.info.bets;
                wins = userinfo.info.wins;
                losses = userinfo.info.losses;
                profit = userinfo.info.profit;
            } catch(err){
                console.error(err.message);
                webix.message({type: 'error', text: err.message});
                return false;
            }
            cb();
        }
    });
}

function getBalance(userinfo){
    balance = userinfo.info.balance
    return balance;
}

function getProfit(userinfo){
    profit = userinfo.currentInfo.profit;
    //console.log('actprofit:'+actProfit);
    return profit;
}

function getCurrProfit(ret){
    currentprofit = ret.betInfo.profit
    //console.log('currprofit:'+currProfit);
    return currentprofit;
}

function getCurrentBetId(ret){
    let betId = ret.betInfo.id;
    //console.log('currentBetId:'+betId);
    return betId;
}

function getCurrentRoll(ret){
    currentroll = ret.betInfo.roll;
    //console.log('currentRoll:'+roll);
    return currentroll;
}

function getNonce(ret){
    return ret.betInfo.nonce;
}

function getBetDate(ret){
    return ret.betInfo.time;
}

function getServerHash(ret){
    return ret.betInfo.serverHash;
}

function getServerSeed(ret){
    return 'nosupport';
    //return ret.betInfo.serverSeed;
}

function getClientSeed(ret){
    return 'nosupport';
    //return ret.betInfo.clientSeed;
}

function getUid(ret){
    return 1000;
}

function outError(ret){
    let mess = ret.err;
    return checkerr(mess);
}

function isError(ret){
    if(typeof ret.err != "undefined")
        return false;
    else
        return true;
}

function getWinStatus(ret){
    return ret.betInfo.win;
}

function setDatatable(ret){
    let chanceStr = '<font size="3" color="red">'+ ret.betInfo.condition + ' '+ ret.betInfo.target +'</font>';
    if(ret.betInfo.win){
        chanceStr = '<font size="3" color="green">'+ ret.betInfo.condition + ' '+ ret.betInfo.target +'</font>';
    }
    let profitStr = '<font size="3" color="red">' + ret.betInfo.profit+ '</font>';
    if(ret.betInfo.profit>0) {
        profitStr = '<font size="3" color="green">' + ret.betInfo.profit + '</font>';
    }
    $$('bet_datatable').add({
        bet_datatable_id:ret.betInfo.id,
        bet_datatable_amount:ret.betInfo.amount,
        bet_datatable_low_high:ret.betInfo.condition,
        bet_datatable_payout:ret.betInfo.payout,
        bet_datatable_bet_chance:chanceStr,
        bet_datatable_actual_chance:ret.betInfo.roll,
        bet_datatable_profit:profitStr,
        bet_datatable_currency:currency,
    },0);
}

function setStats(userinfo, cv){
    if(userinfo.info.success == true){
        $$('bet_total_stats').setValues({
            bet_total_stats_balance:userinfo.info.balance,
            bet_total_stats_win:userinfo.info.wins,
            bet_total_stats_loss:userinfo.info.losses,
            bet_total_stats_bet:userinfo.info.bets,
            bet_total_stats_profit:userinfo.info.profit,
            bet_total_stats_wagered:userinfo.info.wagered,
        });
        $$('bet_current_stats').setValues({
            bet_current_stats_balance:userinfo.currentInfo.balance,
            bet_current_stats_win:userinfo.currentInfo.wins,
            bet_current_stats_loss:userinfo.currentInfo.losses,
            bet_current_stats_bet:userinfo.currentInfo.bets,
            bet_current_stats_profit:userinfo.currentInfo.profit,
            bet_current_stats_wagered:userinfo.currentInfo.wagered,
        });
    }
}

function consoleData(ret, iswin){
    let chanceStr = ret.betInfo.condition + ' '+ ret.betInfo.target;
    let profitStr = ret.betInfo.profit;
    datalog.log('betid:' +ret.betInfo.id + ' amount:'+ ret.betInfo.amount+ ' low_high:'+ ret.betInfo.condition+' payout:'+ ret.betInfo.payout +' chance:'+chanceStr+' actual_chance:'+ ret.betInfo.roll +' profit:'+profitStr +' currency:'+ currency);
    return ret.betInfo.id + ','+ ret.betInfo.amount+ ','+ ret.betInfo.condition+','+ ret.betInfo.payout +','+chanceStr+','+ ret.betInfo.roll +','+profitStr +','+ currency;
}

function consoleStats(userinfo, cv){
    if(userinfo.info.success == true){
        let info = JSON.stringify(userinfo.info);
        console.log(info.replace(/\"/g,""));
        wagered = userinfo.info.wagered;
        table1.setData({   
            headers: ['Info'],
            data: [
                ['BALANCE', userinfo.info.balance],
                ['WIN', userinfo.info.wins],
                ['LOSS', userinfo.info.losses],
                ['BET', userinfo.info.bets],
                ['PROFIT', userinfo.info.profit],
                ['WAGERED', userinfo.info.wagered]
            ]
        });
        table2.setData({
            headers: ['Info'],
            data: [
                ['BALANCE', userinfo.currentInfo.balance],
                ['WIN', userinfo.currentInfo.wins],
                ['LOSS', userinfo.currentInfo.losses],
                ['BET', userinfo.currentInfo.bets],
                ['PROFIT', userinfo.currentInfo.profit],
                ['WAGERED', userinfo.currentInfo.wagered]
            ] 
        });
        table3.setData({ 
            headers: ['Info'],
            data: [
                ['CURRENT STREAK', currentstreak],
                ['MAX WIN STREAK', maxwinstreak],
                ['MAX LOSS STREAK', maxlossstreak],
                ['MAX LOSTRK AMOUNT', maxlossstreakamount],
                ['MAX BET AMOUNT', maxbetamount]
            ]
        });
        table1.focus()
        table2.focus()
        table3.focus()
        screen.render();
    }
}
