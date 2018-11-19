function init() {
    console.log('hello Stake');
    $$("bet_currency_selection").define("options", [
        {id:1,value:"BTC"},
        {id:2,value:"DOGE"},
        {id:3,value:"LTC"},
        {id:4,value:"ETH"},
        {id:5,value:"BCH"},
    ]);
    $$("bet_currency_selection").refresh();
}

function checkParams(p,ch){
    console.log(p,ch);
    if(p < 0.000000001 || p > 1000000000) {
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
    console.log('actprofit:'+actProfit);
    return actProfit;
}

function outError(ret, isLoop){
    let mess = ret.err;
    if(mess != '' && mess != undefined) {
        webix.message({type: 'error', text: mess });
        isLoop = false;
    }
    return isLoop;
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

function setBetToLua(ret){
    fengari.load('win='+ret.betInfo.win +'\nbets=bets+1\ncurrentprofit='+ret.betInfo.profit+'\n')()
    setStreak(ret.betInfo.win);
    let profit = ret.info.currentInfo.profit;
    fengari.load('profit='+profit +'\nbalance='+ret.info.currentInfo.balance)()
}

function setChart(ret, count, cv){
    let profit = ret.info.currentInfo.profit;
    $$("bet_chart").add({xValue: count, yValue: profit});
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
