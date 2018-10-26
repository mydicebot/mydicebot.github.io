webix.extend($$("bet_chart"), webix.ProgressBar);

        let isLoop = false;
        let stopOnWin = false;
        let stopOnLoss = false;
        $$("script_bet_start_stop_button").attachEvent("onItemClick", function(){
            let status = $$("script_bet_start_stop_button").getValue();
            if(status == 'STOP') {
                isLoop = false;
                $$("script_bet_start_stop_button").setValue('START');
            } else {
                let code = $$("script_bet_coding_board").getValue();
                try {
                    fengari.load(code)();
                } catch(err){
                    webix.message({type: 'error', text: err.message});
                }
                isLoop = true;
                $$("script_bet_start_stop_button").setValue('STOP');
                scriptBet(true);
            }
        });
        $$("auto_bet_start_stop_button").attachEvent("onItemClick", function(){
            let status = $$("auto_bet_start_stop_button").getValue();
            if(status == 'STOP') {
                isLoop = false;
                $$("auto_bet_start_stop_button").setValue('START');
            } else {
                $$("auto_bet_start_stop_button").setValue('STOP');
                autoBet();
                isLoop = true;
                stopOnWin = false;
                stopOnLoss = false;
            }
        });

        $$("manual_bet_amount_min_button").attachEvent("onItemClick", function(){
            $$("manual_bet_amount").setValue("0.00000001");
        });
        $$("manual_bet_amount_max_button").attachEvent("onItemClick", function(){
            $$("bet_chart").showProgress({
                type:"icon",
                delay:3000
            });
            webix.ajax().get('refresh').then(function (result) {
                let ret = result.json();
                if(ret.Balances.length>0){
                    let currencyValue = $$("bet_currency_selection").getValue() -1;
                    let balance = (ret.Balances[currencyValue].Balance/100000000).toFixed(8)
                    $$("manual_bet_amount").setValue(balance);
                }
                $$("bet_chart").hideProgress();
            });
        });
        $$("manual_bet_amount_half_button").attachEvent("onItemClick", function(){
            let betAmount = $$("manual_bet_amount").getValue()/2;
            $$("manual_bet_amount").setValue(Math.max(0.00000001, betAmount).toFixed(8));
        });
        $$("manual_bet_amount_double_button").attachEvent("onItemClick", function(){
            $$("bet_chart").showProgress({
                type:"icon",
                delay:3000
            });
            webix.ajax().get('refresh').then(function (result) {
                let ret = result.json();
                if(ret.Balances.length>0){
                    let currencyValue = $$("bet_currency_selection").getValue() -1;
                    let balance = ret.Balances[currencyValue].Balance/100000000;
                    let betAmount = $$("manual_bet_amount").getValue()*2;
                    $$("manual_bet_amount").setValue(Math.min(balance, betAmount).toFixed(8));
                }
                $$("bet_chart").hideProgress();
            });
        });
        $$("auto_bet_stop_on_next_win_button").attachEvent("onItemClick", function(){
            stopOnWin = true;
        });
        $$("auto_bet_stop_on_next_loss_button").attachEvent("onItemClick", function(){
            stopOnLoss = true;
        });
        $$("script_bet_stop_on_next_win_button").attachEvent("onItemClick", function(){
            stopOnWin = true;
        });
        $$("script_bet_stop_on_next_loss_button").attachEvent("onItemClick", function(){
            stopOnLoss = true;
        });
        $$("switch_site_button").attachEvent("onItemClick", function(id, e){
            let box = webix.confirm({
                title:"CONFIRMATION",
                ok:"Yes",
                cancel:"No",
                text:"Logout/Switch Site will reset current session. Sure?",
                callback:function(result){
                    if(result) {
                        let domain = document.domain;
                        console.log(domain);
                        window.location.href = '../login';
                    }
                }
            });
        });

        $$("bet_currency_selection").attachEvent("onChange", function(newId, oldId){
                        $$("bet_chart").showProgress({
                            type:"icon",
                            delay:3000
                        });
                        webix.ajax().get('clear').then(function (result) {
                            let ret = result.json();
                            $$('bet_total_stats').setValues({
                                bet_total_stats_balance:(ret.Balances[newId-1].Balance/100000000).toFixed(8),
                                bet_total_stats_win:ret.Balances[newId-1].TotalWins,
                                bet_total_stats_loss:ret.Balances[newId-1].TotalBets-ret.Balances[newId-1].TotalWins,
                                bet_total_stats_bet:ret.Balances[newId-1].TotalBets,
                                bet_total_stats_profit:((ret.Balances[newId-1].TotalPayIn+ret.Balances[newId-1].TotalPayOut)/100000000).toFixed(8),
                                bet_total_stats_wagered:(Math.abs(ret.Balances[newId-1].TotalPayIn)/100000000).toFixed(8),
                            });
                            $$('bet_current_stats').setValues({
                                bet_current_stats_balance:(ret.CurrentBalances[newId-1].Balance/100000000).toFixed(8),
                                bet_current_stats_win:ret.CurrentBalances[newId-1].TotalWins,
                                bet_current_stats_loss:ret.CurrentBalances[newId-1].TotalBets-ret.CurrentBalances[newId-1].TotalWins,
                                bet_current_stats_bet:ret.CurrentBalances[newId-1].TotalBets,
                                bet_current_stats_profit:((ret.CurrentBalances[newId-1].TotalPayIn+ret.CurrentBalances[newId-1].TotalPayOut)/100000000).toFixed(8),
                                bet_current_stats_wagered:(Math.abs(ret.CurrentBalances[newId-1].TotalPayIn)/100000000).toFixed(8),
                            });
                            clearSession();
                            $$("bet_chart").hideProgress();
                        });
        });
        $$("manual_bet_low_button").attachEvent("onItemClick", function(){
            let currency = $$("bet_currency_selection").getText().toLowerCase();
            let payIn = $$("manual_bet_amount").getValue();
            let chance = $$("manual_bet_chance").getValue();
            bet(currency, 0, Math.round(parseFloat(payIn*100000000)), chance);
        });
        $$("manual_bet_high_button").attachEvent("onItemClick", function(){
            let currency = $$("bet_currency_selection").getText().toLowerCase();
            let payIn = $$("manual_bet_amount").getValue();
            let chance = $$("manual_bet_chance").getValue();
            bet(currency, 1, Math.round(parseFloat(payIn*100000000)), chance);
        });
        $$("reset_session_button").attachEvent("onItemClick", function(){
            webix.confirm({
                title:"CONFIRMATION",
                ok:"Yes",
                cancel:"No",
                text:"Reset current session. Sure?",
                callback:function(result){
                    if(result){
                        $$("bet_chart").showProgress({
                            type:"icon",
                            delay:3000
                        });
                        let currencyValue = $$("bet_currency_selection").getValue() -1;
                        webix.ajax().get('clear').then(function (result) {
                            let ret = result.json();
                            let userinfo = ret;
                            $$('bet_current_stats').setValues({
                                bet_current_stats_balance:parseFloat(userinfo.CurrentBalances[currencyValue].Balance/100000000).toFixed(8),
                                bet_current_stats_win:userinfo.CurrentBalances[currencyValue].TotalWins,
                                bet_current_stats_loss:(userinfo.CurrentBalances[currencyValue].TotalBets-userinfo.CurrentBalances[currencyValue].TotalWins),
                                bet_current_stats_bet:userinfo.CurrentBalances[currencyValue].TotalBets,
                                bet_current_stats_profit:((userinfo.CurrentBalances[currencyValue].TotalPayIn+userinfo.CurrentBalances[currencyValue].TotalPayOut)/100000000).toFixed(8),
                                bet_current_stats_wagered:(Math.abs(userinfo.CurrentBalances[currencyValue].TotalPayIn)/100000000).toFixed(8),
                            });
                            clearSession();
                            $$("bet_chart").hideProgress();
                        });
                    }
                }
            });
        });

        webix.ready(function () {
            $$("bet_chart").showProgress({
                type:"icon",
                delay:3000
            });
            webix.ajax().get('refresh').then(function (result) {
                let ret = result.json();
                if(ret.Balances.length>0){
                    $$('bet_total_stats').setValues({
                        bet_total_stats_balance:(ret.Balances[0].Balance/100000000).toFixed(8),
                        bet_total_stats_win:ret.Balances[0].TotalWins,
                        bet_total_stats_loss:ret.Balances[0].TotalBets-ret.Balances[0].TotalWins,
                        bet_total_stats_bet:ret.Balances[0].TotalBets,
                        bet_total_stats_profit:((ret.Balances[0].TotalPayIn+ret.Balances[0].TotalPayOut)/100000000).toFixed(8),
                        bet_total_stats_wagered:(Math.abs(ret.Balances[0].TotalPayIn)/100000000).toFixed(8),
                    });
                    $$('bet_current_stats').setValues({
                        bet_current_stats_balance:(ret.CurrentBalances[0].Balance/100000000).toFixed(8),
                        bet_current_stats_win:ret.CurrentBalances[0].TotalWins,
                        bet_current_stats_loss:ret.CurrentBalances[0].TotalBets-ret.CurrentBalances[0].TotalWins,
                        bet_current_stats_bet:ret.CurrentBalances[0].TotalBets,
                        bet_current_stats_profit:((ret.CurrentBalances[0].TotalPayIn+ret.CurrentBalances[0].TotalPayOut)/100000000).toFixed(8),
                        bet_current_stats_wagered:(Math.abs(ret.CurrentBalances[0].TotalPayIn)/100000000).toFixed(8),
                    });
                }
                $$("bet_chart").hideProgress();
            });
        });

        let count = 1;
        function autoBet(iswin, previousbet){
            let nums =  $$("auto_bet_number_of_bets").getValue();
            let currency = $$("bet_currency_selection").getText().toLowerCase();
            let base = $$("auto_bet_base_amount").getValue();
            let chance = $$("auto_bet_base_chance").getValue();
            let lowHigh = $$("auto_bet_start_low_high").getValue() == 'LOW' ?0:1;
            let autoLossRadio = $$("auto_bet_amount_radio_on_loss").getValue();
            let autoWinRadio = $$("auto_bet_amount_radio_on_win").getValue();
            console.log(autoLossRadio, autoWinRadio);
            if(iswin == true && autoWinRadio == 'MULTIPLIER'){
                let multiWin = $$("auto_bet_amount_radio_on_win_multiplier").getValue();
                base = previousbet * multiWin;
                console.log('win'+multiWin);
            } else if(iswin == false && autoLossRadio == 'MULTIPLIER') {
                let multiLoss = $$("auto_bet_amount_radio_on_loss_multiplier").getValue();
                base = previousbet * multiLoss;
                console.log('loss'+multiLoss);
            }
            console.log(lowHigh,base,nums,currency,chance);
            bet(currency, lowHigh, Math.round(parseFloat(base*100000000)), chance);
        }
        function scriptBet(init){
            try{
                let nextbet = fengari.load('return nextbet')();
                let previousbet = fengari.load('return previousbet')();
                let chance = fengari.load('return chance')();
                let currency = $$("bet_currency_selection").getText().toLowerCase();
                let lowHigh = fengari.load('return bethigh')() == false ?0:1;
                if(init){
                    fengari.load('nextbet=basebet')();
                    nextbet = fengari.load('return basebet')();
                    fengari.load('previousbet=basebet\ncurrentprofit=0\ncurrentstreak=0\nwins=0\nlosses=0\nbets=0\nisloop=true\nprofit=0\n')();
                    fengari.load('function stop()\nisloop = false \n print(isloop)\nend')();
                } else {
                    fengari.load('dobet()')();
                    nextbet = fengari.load('return nextbet')();
                    chance = fengari.load('return chance')();
                    lowHigh = fengari.load('return bethigh')() == false ?0:1;
                }
                fengari.load('previousbet=nextbet')();
                fengari.load('print(basebet,nextbet,previousbet,chance,win,currentprofit,currentstreak,wins,losses,bets,bethigh,isloop,profit)')();
                betScript(currency, lowHigh, Math.round(parseFloat(nextbet*100000000)), chance);
            }catch(err){
                $$("script_bet_start_stop_button").setValue('START');
                webix.message({type: 'error', text: err.message});
            }
        }
        function betScript(c,h,p,ch) {
            if(!checkParams(p,ch)) {
                $$("script_bet_start_stop_button").setValue('START');
                webix.message({type: 'error', text: 'Please enter the correct parameters'});
                return false;
            }
            let iswin = false;
            $$("bet_chart").showProgress({
                type:"icon",
                delay:3000
            });
            let currencyValue = $$("bet_currency_selection").getValue() -1;
            webix.ajax().post('bet', { Currency:c, PayIn:p, High:h, Chance:ch, CurrencyValue: currencyValue }).then(function (result) {
                let ret = result.json();
                console.log(ret);
                if(isLoop) {
                    isLoop = fengari.load('return isloop')();
                }
                if(ret.BetId) {
                    try {
                        fengari.load('win='+ret.Win +'\nbets=bets+1\ncurrentprofit='+((ret.PayOut-ret.PayIn)/100000000).toFixed(8)+'\n')()
                        iswin = ret.Win;
                        if(iswin){
                            fengari.load('wins=wins+1\nif currentstreak>=0 then \n currentstreak=currentstreak+1\n else \n currentstreak=0\n end')()
                        } else {
                            fengari.load('losses=losses+1\nif currentstreak<=0 then \n currentstreak=currentstreak-1\n else \n currentstreak=0\n end')()
                        }
                    } catch(err){
                        webix.message({type: 'error', text: err.message});
                    }
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
                    let userinfo = ret.info;
                    let profit = ((userinfo.CurrentBalances[currencyValue].TotalPayIn+userinfo.CurrentBalances[currencyValue].TotalPayOut)/100000000).toFixed(8);
                    console.log(profit);
                    fengari.load('profit='+profit +'\nbalance='+parseFloat(userinfo.Balances[currencyValue].Balance/100000000).toFixed(8))()
                    $$("bet_chart").add({xValue: count, yValue: profit});
                    count++
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
                } else {
                    let mess = ret.error;
                    if(ret.NoPossibleProfit == 1) {
                        mess = 'NoPossibleProfit';
                    }
                    if(mess != '' && mess != undefined) {
                        webix.message({type: 'error', text: mess });
                        isLoop = false;
                    }
                }
                $$("bet_chart").hideProgress();
                console.log(isLoop, stopOnWin, stopOnLoss, iswin);
                if (stopOnWin == true && iswin) {
                    console.log("stop on win");
                    isLoop = false;
                }
                if (stopOnLoss == true && !iswin) {
                    console.log("stop on loss");
                    isLoop = false;
                }
                if (isLoop) {
                    scriptBet(false);
                } else {
                    $$("script_bet_start_stop_button").setValue('START');
                }
            }).fail(function (xhr) {
                $$("script_bet_start_stop_button").setValue('START');
                var response = JSON.parse(xhr.response);
                webix.message({type: 'error', text: response.error.message});
            });
        }
        function bet(c,h,p,ch) {
            if(!checkParams(p,ch)) {
                $$("auto_bet_start_stop_button").setValue('START');
                webix.message({type: 'error', text: 'Please enter the correct parameters'});
                return false;
            }
            let iswin = false;
            $$("bet_chart").showProgress({
                type:"icon",
                delay:3000
            });
            let currencyValue = $$("bet_currency_selection").getValue() -1;
            webix.ajax().post('bet', { Currency:c, PayIn:p, High:h, Chance:ch, CurrencyValue: currencyValue }).then(function (result) {
                let ret = result.json();
                console.log(ret);
                let userinfo = null;
                if(ret.BetId) {
                    iswin = ret.Win;
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
                    userinfo = ret.info;
                    let profit = ((userinfo.CurrentBalances[currencyValue].TotalPayIn+userinfo.CurrentBalances[currencyValue].TotalPayOut)/100000000).toFixed(8);
                    console.log(profit);
                    $$("bet_chart").add({xValue: count, yValue: profit});
                    count++
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
                } else {
                    let mess = ret.error;
                    if(ret.NoPossibleProfit == 1) {
                        mess = 'NoPossibleProfit';
                    }
                    if(mess != '' && mess != undefined) {
                        webix.message({type: 'error', text: mess });
                        isLoop = false;
                    }
                }
                $$("bet_chart").hideProgress();
                console.log(isLoop, stopOnWin, stopOnLoss, iswin);
                if (stopOnWin == true && iswin) {
                    console.log("stop on win");
                    isLoop = false;
                }
                if (stopOnLoss == true && !iswin) {
                    console.log("stop on loss");
                    isLoop = false;
                }
                if (isLoop) {
                    let actProfit = userinfo.CurrentBalances[currencyValue].TotalPayIn+userinfo.CurrentBalances[currencyValue].TotalPayOut;
                    let stopProfit =$$("auto_bet_stop_on_profit").getValue()*100000000;
                    console.log(actProfit);
                    console.log(stopProfit);
                    if(stopProfit != 0) {
                        if(actProfit>=stopProfit && stopProfit>0){
                                isLoop = false;
                        }
                        console.log(actProfit,stopProfit);
                        if(actProfit<=stopProfit && stopProfit<0){
                            console.log("act profit stop");
                                isLoop = false;
                        }
                    }
                    let nums =  $$("auto_bet_number_of_bets").getValue();
                    if(nums>0){
                        $$("auto_bet_number_of_bets").setValue(nums-1);
                        if(nums == 1) {
                            isLoop = false;
                        }
                    }
                    let lossNums =  $$("auto_bet_stop_on_loss").getValue();
                    if(lossNums>0 && !iswin){
                        $$("auto_bet_stop_on_loss").setValue(lossNums-1);
                        if(lossNums == 1) {
                            isLoop = false;
                        }
                    }
                    let winNums =  $$("auto_bet_stop_on_win").getValue();
                    if(winNums>0 && iswin){
                        $$("auto_bet_stop_on_win").setValue(winNums-1);
                        if(winNums == 1) {
                            isLoop = false;
                        }
                    }
                    if(isLoop){
                        autoBet(iswin,(p/100000000).toFixed(8));
                    } else {
                        $$("auto_bet_start_stop_button").setValue('START');
                    }
                } else {
                    $$("auto_bet_start_stop_button").setValue('START');
                }
            }).fail(function (xhr) {
                var response = JSON.parse(xhr.response);
                $$("auto_bet_start_stop_button").setValue('START');
                webix.message({type: 'error', text: response.error.message});
            });
        }

        function checkParams(p,ch){
            if(p < 0.000000001 || p > 1000000000) {
                return false
            }
            if(ch>95 || ch<5) {
                return false
            }
            return true;
        }

        function clearSession(){
            $$('bet_datatable').clearAll();
            $$("bet_chart").clearAll();
            stopOnWin = false;
            stopOnLoss = false;
        }
