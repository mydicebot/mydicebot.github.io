function consoleInit() {
    currencies = ["BTC","DOGE","LTC","ETH"];
}

function init() {
    console.log('hello YoloDice');
    $$("bet_currency_selection").define("options", [
        {id:1,value:"BTC"},
        {id:2,value:"DOGE"},
        {id:3,value:"LTC"},
        {id:4,value:"ETH"}
    ]);
    $$("bet_currency_selection").refresh();
    consoleInit();
}

function checkParams(p,ch){
    //console.log(p,ch);
    if(p < 0.00000001 || p > 1000000000*1000000000) {
        return false
    }
    if(ch>98.99 || ch<0.0001) {
        return false
    }
    return true;
}

function initScriptBalance(currencyValue, cb){
    getInfo(function(userinfo){
        if(userinfo.info.id){
            try {
                balance = (userinfo.info.balance/100000000).toFixed(8);
                bets = userinfo.info.bets;
                wins = userinfo.info.wins;
                losses = userinfo.info.losses;
                profit = (userinfo.info.profit/100000000).toFixed(8);
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
    balance = (userinfo.info.balance/100000000).toFixed(8)
    return parseFloat(balance);
}

function getProfit(userinfo){
    profit = (userinfo.currentInfo.profit/100000000).toFixed(8);
    //console.log('actprofit:'+actProfit);
    return parseFloat(profit);
}

function getCurrProfit(ret){
    currentprofit = (ret.betInfo.profit/100000000).toFixed(8)
    //console.log('currprofit:'+currProfit);
    return parseFloat(currentprofit);
}

function getCurrentBetId(ret){
    let betId = ret.betInfo.id;
    //console.log('currentBetId:'+betId);
    return betId;
}

function getCurrentRoll(ret){
    currentroll = ret.betInfo.rolled/10000;
    //console.log('currentRoll:'+roll);
    return currentroll;
}

function getNonce(ret){
    let betId = ret.betInfo.nonce;
}

function getBetDate(ret){
    return  Math.round(new Date().getTime()/1000);
}

function getServerHash(ret){
    return 'nosupport';
}

function getServerSeed(ret){
    return 'nosupport';
}

function getClientSeed(ret){
    let betId = ret.betInfo.seed_id;
}

function getUid(ret){
    return 1000;
}

function outError(ret){
    let mess = ret.err;
    return checkerr(mess);
}

function isError(ret){
    if(typeof ret.betInfo != "undefined")
        return true;
    else
        return false;
}

function getWinStatus(ret){
    return ret.betInfo.win;
}

function setDatatable(ret){
    let chanceStr = '<font size="3" color="red">'+ ret.betInfo.range + ' '+ ret.betInfo.target/10000 +'</font>';
    if(ret.betInfo.win){
        chanceStr = '<font size="3" color="green">'+ ret.betInfo.range + ' '+ ret.betInfo.target/10000 +'</font>';
    }
    let profitStr = '<font size="3" color="red">' + (ret.betInfo.profit/100000000).toFixed(8) + '</font>';
    if(ret.betInfo.profit>0) {
        profitStr = '<font size="3" color="green">' + (ret.betInfo.profit/100000000).toFixed(8) + '</font>';
    }
    $$('bet_datatable').add({
        bet_datatable_id:ret.betInfo.id,
        bet_datatable_amount:(ret.betInfo.amount/100000000).toFixed(8),
        bet_datatable_low_high:ret.betInfo.range,
        bet_datatable_payout:(ret.betInfo.payout/100000000).toFixed(8),
        bet_datatable_bet_chance:chanceStr,
        bet_datatable_actual_chance:ret.betInfo.rolled/10000,
        bet_datatable_profit:profitStr,
        bet_datatable_currency:currency,
    },0);
}

function setStats(userinfo, cv){
    if(userinfo.info.id){
        $$('bet_total_stats').setValues({
            bet_total_stats_balance:(userinfo.info.balance/100000000).toFixed(8),
            bet_total_stats_win:userinfo.info.wins,
            bet_total_stats_loss:userinfo.info.losses,
            bet_total_stats_bet:userinfo.info.bets,
            bet_total_stats_profit:((userinfo.info.profit)/100000000).toFixed(8),
            bet_total_stats_wagered:(Math.abs(userinfo.info.wagered)/100000000).toFixed(8),
        });
        $$('bet_current_stats').setValues({
            bet_current_stats_balance:(userinfo.currentInfo.balance/100000000).toFixed(8),
            bet_current_stats_win:userinfo.currentInfo.wins,
            bet_current_stats_loss:userinfo.currentInfo.losses,
            bet_current_stats_bet:userinfo.currentInfo.bets,
            bet_current_stats_profit:((userinfo.currentInfo.profit)/100000000).toFixed(8),
            bet_current_stats_wagered:(Math.abs(userinfo.currentInfo.wagered)/100000000).toFixed(8),
        });
    }
}

function consoleData(ret, iswin){
    let chanceStr = ret.betInfo.range + ' '+ ret.betInfo.target/10000;
    let profitStr = (ret.betInfo.profit/100000000).toFixed(8);
    datalog.log('betid:' +ret.betInfo.id + ' amount:'+ (ret.betInfo.amount/100000000).toFixed(8)+ ' low_high:'+ ret.betInfo.range+' payout:'+ (ret.betInfo.payout/100000000).toFixed(8) +' chance:'+chanceStr+' actual_chance:'+ ret.betInfo.rolled/10000 +' profit:'+profitStr+' currency:'+currency );
    return ret.betInfo.id + ','+ (ret.betInfo.amount/100000000).toFixed(8)+ ','+ ret.betInfo.range+','+ (ret.betInfo.payout/100000000).toFixed(8) +','+chanceStr+','+ ret.betInfo.rolled/10000 +','+profitStr +','+ currency;
}

function consoleStats(userinfo, cv){
    if(userinfo.info.id){
        let info = JSON.stringify(userinfo.info);
        console.log(info.replace(/\"/g,""));
        wagered = (Math.abs(userinfo.currentInfo.wagered)/100000000).toFixed(8);
        table1.setData({   
            headers: ['Info'],
            data: [
                ['BALANCE', (userinfo.info.balance/100000000).toFixed(8)],
                ['WIN', userinfo.info.wins],
                ['LOSS', userinfo.info.losses],
                ['BET', userinfo.info.bets],
                ['PROFIT', ((userinfo.info.profit)/100000000).toFixed(8)],
                ['WAGERED', (Math.abs(userinfo.info.wagered)/100000000).toFixed(8)]
            ]
        });
        table2.setData({
            headers: ['Info'],
            data: [
                ['BALANCE', (userinfo.currentInfo.balance/100000000).toFixed(8)],
                ['WIN', userinfo.currentInfo.wins],
                ['LOSS', userinfo.currentInfo.losses],
                ['BET', userinfo.currentInfo.bets],
                ['PROFIT', ((userinfo.currentInfo.profit)/100000000).toFixed(8)],
                ['WAGERED', (Math.abs(userinfo.currentInfo.wagered)/100000000).toFixed(8)]
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
