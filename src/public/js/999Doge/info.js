function consoleInit() {
    currencies = ['BTC', 'Doge', 'LTC', 'ETH'];
    toggleDonate = true;
}

function init(){
    console.log('hello 999Doge');
    $$("manual_resetseed_button").hide();
    $$("auto_resetseed_button").hide();
    consoleInit();
}

function checkParams(p,ch){
    //console.log(p,ch);
    if(p < 0.00000001 || p > 1000000000*1000000000) {
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
            try {
                balance = parseFloat(userinfo.Balances[currencyValue].Balance/100000000).toFixed(8);
                bets = userinfo.CurrentBalances[currencyValue].TotalBets;
                wins = userinfo.CurrentBalances[currencyValue].TotalWins;
                losses = (userinfo.CurrentBalances[currencyValue].TotalBets-userinfo.CurrentBalances[currencyValue].TotalWins);
                profit = ((userinfo.CurrentBalances[currencyValue].TotalPayIn+userinfo.CurrentBalances[currencyValue].TotalPayOut)/100000000).toFixed(8);
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
    balance = (userinfo.Balances[currencyValue].Balance/100000000).toFixed(8)
    return parseFloat(balance);
}

function outError(ret){
    let mess = ret.error;
    if(ret.NoPossibleProfit == 1) {
        mess = 'NoPossibleProfit';
    }
    return checkerr(mess);
}

function isError(ret){
    if(ret.BetId)
        return true;
    else
        return false;
}

function getWinStatus(ret){
    //console.log('win status:'+ ret.Win);
    return ret.Win;
}

function getProfit(userinfo,currencyValue){
    profit = ((userinfo.CurrentBalances[currencyValue].TotalPayIn+userinfo.CurrentBalances[currencyValue].TotalPayOut)/100000000).toFixed(8);
    //console.log('actprofit:'+actProfit);
    return parseFloat(profit);
}

function getCurrProfit(ret){
    currentprofit = ((ret.PayOut-ret.PayIn)/100000000).toFixed(8)
    //console.log('currprofit:'+currProfit);
    return parseFloat(currentprofit);
}

function getCurrentBetId(ret){
    return ret.BetId;
}

function getCurrentRoll(ret){
    currentroll = ret.Secret/10000;
    //console.log('currentRoll:'+roll);
    return currentroll;
}

function getNonce(ret){
    return 'nosupport';
}

function getBetDate(ret){
    return  Math.round(new Date().getTime()/1000);
}

function getServerHash(ret){
    return ret.Next;
}

function getServerSeed(ret){
    return ret.ServerSeed;
}

function getClientSeed(ret){
    return 'nosupport';
}

function getUid(ret){
    return 1000;
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
        bet_datatable_currency:currency,
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

function consoleData(ret, iswin){
    let chanceStr = ret.High + ' '+ ret.BetRoll/10000 ;
    let profitStr = ((ret.PayOut-ret.PayIn)/100000000).toFixed(8);
    datalog.log('betid:' +ret.BetId + ' amount:'+ (ret.PayIn/100000000).toFixed(8)+ ' low_high:'+ ret.High+' payout:'+ (ret.PayOut/100000000).toFixed(8)+' chance:'+chanceStr+' actual_chance:'+ ret.Secret/10000 +' profit:'+profitStr+' currency:'+currency );
    return ret.BetId + ','+ (ret.PayIn/100000000).toFixed(8)+ ','+ ret.High+','+ (ret.PayOut/100000000).toFixed(8)+','+chanceStr+','+ ret.Secret/10000 +','+profitStr +','+ currency;
}

function consoleStats(userinfo, cv){
    let info = JSON.stringify(userinfo.Balances[cv]);
    console.log(info.replace(/\"/g,""));
    wagered = (Math.abs(userinfo.Balances[cv].TotalPayIn)/100000000).toFixed(8);
    table1.setData({
        headers: ['Info'],
            data: [
                ['BALANCE', parseFloat(userinfo.Balances[cv].Balance/100000000).toFixed(8)],
                ['WIN', userinfo.Balances[cv].TotalWins],
                ['LOSS', (userinfo.Balances[cv].TotalBets-userinfo.Balances[cv].TotalWins)],
                ['BET', userinfo.Balances[cv].TotalBets],
                ['PROFIT', ((userinfo.Balances[cv].TotalPayIn+userinfo.Balances[cv].TotalPayOut)/100000000).toFixed(8)],
                ['WAGERED', (Math.abs(userinfo.Balances[cv].TotalPayIn)/100000000).toFixed(8)]
            ]
    });
    table2.setData({
        headers: ['Info'],
            data: [
                ['BALANCE', parseFloat(userinfo.CurrentBalances[cv].Balance/100000000).toFixed(8)],
                ['WIN', userinfo.CurrentBalances[cv].TotalWins],
                ['LOSS', (userinfo.CurrentBalances[cv].TotalBets-userinfo.CurrentBalances[cv].TotalWins)],
                ['BET', userinfo.CurrentBalances[cv].TotalBets],
                ['PROFIT', ((userinfo.CurrentBalances[cv].TotalPayIn+userinfo.CurrentBalances[cv].TotalPayOut)/100000000).toFixed(8)],
                ['WAGERED', (Math.abs(userinfo.CurrentBalances[cv].TotalPayIn)/100000000).toFixed(8)]
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
