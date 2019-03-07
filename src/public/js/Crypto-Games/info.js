function init() {
    console.log('hello CryptoGame');
    $$("bet_currency_selection").define("options", [
        {id:1,value:"BTC"},
        {id:2,value:"DOGE"},
        {id:3,value:"LTC"},
        {id:4,value:"ETH"},
        {id:5,value:"BCH"},
        {id:6,value:"DASH"},
        {id:7,value:"GAS"},
        {id:8,value:"START"},
        {id:9,value:"PPC"},
        {id:10,value:"PLAY"},
        {id:11,value:"ETC"}
    ]);
    $$("bet_currency_selection").refresh();
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
        if(userinfo.info.success == 'true'){
            try {
                fengari.load('balance='+userinfo.info.balance)();
                fengari.load('bets='+userinfo.info.bets)();
                fengari.load('wins='+userinfo.info.wins)();
                fengari.load('losses='+userinfo.info.losses)();
                fengari.load('profit='+userinfo.info.profit)();
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
    let balance = userinfo.info.balance
    return balance;
}

function getActProfit(userinfo){
    let actProfit = userinfo.currentInfo.profit * 100000000;
    //console.log('actprofit:'+actProfit);
    return actProfit;
}

function getCurrProfit(ret){
    let currProfit = ret.betInfo.profit
    //console.log('currprofit:'+currProfit);
    return currProfit;
}

function getCurrentBetId(ret){
    let betId = ret.betInfo.id;
    //console.log('currentBetId:'+betId);
    return betId;
}

function getCurrentRoll(ret){
    let roll = ret.betInfo.roll;
    //console.log('currentRoll:'+roll);
    return roll;
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
    },0);
}

function setStats(userinfo, cv){
    if(userinfo.info.success == 'true'){
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
