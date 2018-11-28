function init(){
    console.log('hello 999Dice');
}

function checkParams(p,ch){
    console.log(p,ch);
    if(p < 0.000000001 || p > 1000000000) {
        return false
    }
    if(ch>95 || ch<5) {
        return false
    }
    return true;
}


function initScriptBalance(currencyValue, cb){
    getInfo(function(userinfo){
        if(userinfo.Balances.length>0){
            fengari.load('balance='+parseFloat(userinfo.Balances[currencyValue].Balance/100000000).toFixed(8))();
            fengari.load('bets='+userinfo.CurrentBalances[currencyValue].TotalBets)();
            fengari.load('wins='+userinfo.CurrentBalances[currencyValue].TotalWins)();
            fengari.load('losses='+(userinfo.CurrentBalances[currencyValue].TotalBets-userinfo.CurrentBalances[currencyValue].TotalWins))();
            fengari.load('profit='+((userinfo.CurrentBalances[currencyValue].TotalPayIn+userinfo.CurrentBalances[currencyValue].TotalPayOut)/100000000).toFixed(8))();
            cb();
        }
    });
}

function getBalance(userinfo){
    let currencyValue = $$("bet_currency_selection").getValue() -1;
    let balance = (userinfo.Balances[currencyValue].Balance/100000000).toFixed(8)
    return balance;
}

function outError(ret, isLoop){
    let mess = ret.error;
    if(ret.NoPossibleProfit == 1) {
        mess = 'NoPossibleProfit';
    }
    if(mess != '' && mess != undefined) {
        webix.message({type: 'error', text: mess });
        isLoop = false;
    }
    return isLoop;
}

function isError(ret){
    if(ret.BetId)
        return true;
    else
        return false;
}

function getWinStatus(ret){
    console.log('win status:'+ ret.Win);
    return ret.Win;
}

function getActProfit(userinfo,currencyValue){
    let actProfit = userinfo.CurrentBalances[currencyValue].TotalPayIn+userinfo.CurrentBalances[currencyValue].TotalPayOut;
    console.log('actprofit:'+actProfit);
    return actProfit;
}

function getCurrentBetId(ret){
    let betId = ret.betInfo.id;
    console.log('currentBetId:'+betId);
    return betId;
}

function getCurrentRoll(ret){
    let roll = ret.Secret/10000;
    console.log('currentRoll:'+roll);
    return roll;
}

function setBetToLua(ret, currencyValue){
    fengari.load('win='+ret.Win +'\nbets=bets+1\ncurrentprofit='+((ret.PayOut-ret.PayIn)/100000000).toFixed(8)+'\n')()
    setStreak(ret.Win);
    let profit = ((ret.info.CurrentBalances[currencyValue].TotalPayIn+ret.info.CurrentBalances[currencyValue].TotalPayOut)/100000000).toFixed(8);
    fengari.load('profit='+profit +'\nbalance='+parseFloat(ret.info.Balances[currencyValue].Balance/100000000).toFixed(8))()
}

function setChart(ret, count, currencyValue){
    let profit = ((ret.info.CurrentBalances[currencyValue].TotalPayIn+ret.info.CurrentBalances[currencyValue].TotalPayOut)/100000000).toFixed(8);
    console.log(profit);
    $$("bet_chart").add({xValue: count, yValue: profit});
}

function setDatatable(ret, iswin){
    let chanceStr = '<font size="3" color="red">'+ ret.High + ' '+ ret.BetRoll/10000 +'</font>';
    if(iswin){
        chanceStr = '<font size="3" color="green">'+ ret.High + ' '+ ret.BetRoll/10000 +'</font>';
    }
    let profitStr = '<font size="3" color="red">' +((ret.PayOut-ret.PayIn)/100000000).toFixed(8) + '</font>';
    if((ret.PayOut-ret.PayIn)>0) {
        profitStr = '<font size="3" color="green">' +((ret.PayOut-ret.PayIn)/100000000).toFixed(8) + '</font>';
    }
    $$('bet_datatable').add({
        bet_datatable_id:ret.BetId,
        bet_datatable_amount:(ret.PayIn/100000000).toFixed(8),
        bet_datatable_low_high:ret.High,
        bet_datatable_payout:(ret.PayOut/100000000).toFixed(8),
        bet_datatable_bet_chance:chanceStr,
        bet_datatable_actual_chance:ret.Secret/10000,
        bet_datatable_profit:profitStr,
    },0);
}

function setStats(userinfo, currencyValue){
    $$('bet_total_stats').setValues({
        bet_total_stats_balance:parseFloat(userinfo.Balances[currencyValue].Balance/100000000).toFixed(8),
        bet_total_stats_win:userinfo.Balances[currencyValue].TotalWins,
        bet_total_stats_loss:(userinfo.Balances[currencyValue].TotalBets-userinfo.Balances[currencyValue].TotalWins),
        bet_total_stats_bet:userinfo.Balances[currencyValue].TotalBets,
        bet_total_stats_profit:((userinfo.Balances[currencyValue].TotalPayIn+userinfo.Balances[currencyValue].TotalPayOut)/100000000).toFixed(8),
        bet_total_stats_wagered:(Math.abs(userinfo.Balances[currencyValue].TotalPayIn)/100000000).toFixed(8),
    });
    $$('bet_current_stats').setValues({
        bet_current_stats_balance:parseFloat(userinfo.CurrentBalances[currencyValue].Balance/100000000).toFixed(8),
        bet_current_stats_win:userinfo.CurrentBalances[currencyValue].TotalWins,
        bet_current_stats_loss:(userinfo.CurrentBalances[currencyValue].TotalBets-userinfo.CurrentBalances[currencyValue].TotalWins),
        bet_current_stats_bet:userinfo.CurrentBalances[currencyValue].TotalBets,
        bet_current_stats_profit:((userinfo.CurrentBalances[currencyValue].TotalPayIn+userinfo.CurrentBalances[currencyValue].TotalPayOut)/100000000).toFixed(8),
        bet_current_stats_wagered:(Math.abs(userinfo.CurrentBalances[currencyValue].TotalPayIn)/100000000).toFixed(8),
    });
} 
