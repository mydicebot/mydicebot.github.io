function init() {
    console.log('hello YoloDice');
    $$("bet_currency_selection").define("options", [
        {id:1,value:"BTC"},
        {id:2,value:"DOGE"},
        {id:3,value:"LTC"},
        {id:4,value:"ETH"}
    ]);
    $$("bet_currency_selection").refresh();
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
                fengari.load('balance='+(userinfo.info.balance/100000000).toFixed(8))();
                fengari.load('bets='+userinfo.info.bets)();
                fengari.load('wins='+userinfo.info.wins)();
                fengari.load('losses='+userinfo.info.losses)();
                fengari.load('profit='+(userinfo.info.profit/100000000).toFixed(8))();
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
    let balance = (userinfo.info.balance/100000000).toFixed(8)
    return balance;
}

function getActProfit(userinfo){
    let actProfit = userinfo.currentInfo.profit;
    //console.log('actprofit:'+actProfit);
    return actProfit;
}

function getCurrProfit(ret){
    let currProfit = (ret.betInfo.profit/100000000).toFixed(8)
    //console.log('currprofit:'+currProfit);
    return currProfit;
}

function getCurrentBetId(ret){
    let betId = ret.betInfo.id;
    //console.log('currentBetId:'+betId);
    return betId;
}

function getCurrentRoll(ret){
    let roll = ret.betInfo.rolled/10000;
    //console.log('currentRoll:'+roll);
    return roll;
}

async function outError(ret){
    let mess = ret.err;
    return await retryError(mess);
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
