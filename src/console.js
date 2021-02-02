var path = require('path');
var fs = require('fs');
var util = require('util');
var math = require('mathjs');
var readlineSync = require('readline-sync');
var Factory = require('./api/models/factory');
var BitslerDice = require('./api/models/bitsler');
var NineDice = require('./api/models/nine');
var YoloDice = require('./api/models/yolo');
var PrimeDice = require('./api/models/prime');
var StakeDice = require('./api/models/stake');
var CryptoDice = require('./api/models/crypto');
var Simulator = require('./api/models/simulator');
var EpicDice = require('./api/models/epic');
var KryptoGames = require('./api/models/kryptogames');
var DuckDice = require('./api/models/duckdice');
var FreeBitco = require('./api/models/freebitco');
var WinDice = require('./api/models/windice');
var WolfBet = require('./api/models/wolfbet');
var NineDoge = require('./api/models/ninedoge');
var SatoshiDice = require('./api/models/satoshidice');
var ParaDice = require('./api/models/paradice');
var regpath = path.join(__dirname,'public/js/reg.js');
eval(fs.readFileSync(regpath, 'utf8'));
var readdir = util.promisify(fs.readdir);

(async () => {

var needUserSites = ['999Dice','FreeBitco','999Doge','SatoshiDice'];
var needTokenSites = ['PrimeDice','Stake','WolfBet','ParaDice'];
var needApiKeySites = ['Bitsler'];
var needOnlyApiKeySites = ['YoloDice','Crypto-Games','DuckDice','WinDice'];
var needSteemActiveKeySites = ['EpicDice','KryptoGames'];
var needSimulatorActiveKeySites = ['Simulator'];

var nums = 0, currency = 'btc', base = 0, isloop = false, iswin = false;
var toggleDonate = false;
var code;
var startTime = new Date(), settime, difftime = 0, intervalBetTime = 0;
var basebet = 0.00000001, nextbet = 0.00000001, chance = 90, bethigh = false;
var previousbet = 0, win = false, currentprofit = 0, balance = 0, bets = 0, wins = 0, losses = 0, profit = 0, currentstreak = 0, currentroll = 0 ,wagered = 0, totalprofit = 0, donateprofit =0;
var maxwinstreak = 0, maxlossstreak = 0, maxwinstreakamount = 0, maxlossstreakamount = 0, maxstreakamount = 0, minstreakamount = 0, maxbetamount = 0 ;
var lastbet = {id:0,chance:chance, date:'',roll:49.5,amount:nextbet,nonce:1000,serverhash:'mydice',serverseed:'mydice',clientseed:'',profit:profit,uid:1000,high:bethigh};
var currencies = ['BTC', 'Doge', 'LTC', 'ETH'];
var stop = false;
var req = {};
var sleepTime = 0;
req.setTimeout = function (time){}
req.session = {};
req.body = {'site':'Simulator','username':'mydicebot','password':'mydicebot','twoFactor':123456,'apiKey':'mydicebot'};
req.query = {};
if(readlineSync.keyInYN('Whether to read the last configuration?')) {
    console.log('load recent configuration..........');
    let rawdata = fs.readFileSync('./recent_account_info.json');
    req.body = JSON.parse(rawdata);
} else {
    sites = ['Simulator', '999Dice', 'Bitsler', 'Crypto-Games', 'DuckDice', 'PrimeDice', 'Stake', 'YoloDice','WolfBet', 'FreeBitco', 'WinDice', 'EpicDice', 'KryptoGames', '999Doge', 'SatoshiDice','ParaDice'];
    index = readlineSync.keyInSelect(sites, 'Which site?');
    if(index < 0 ){
        return false;
    }
    req.body.site = sites[index];
    console.log(req.body.site);
    if (readlineSync.keyInYN('Do you need to register an account?')) {
        console.log("register link: " + registerUrls[req.body.site]);
    }
    if(needUserSites.indexOf(req.body.site)>-1){
        req.body.username = readlineSync.question('Please input Username?');
        req.body.password = readlineSync.question('Please input Password?');
        req.body.twoFactor = readlineSync.question('Please input 2fa?');
    } else if(needTokenSites.indexOf(req.body.site)>-1) {
        req.body.username= '';
        req.body.password= '';
        req.body.apiKey = readlineSync.question('Please input token?');
        req.body.twoFactor = readlineSync.question('Please input 2fa?');
    } else if (needApiKeySites.indexOf(req.body.site)>-1) {
        req.body.username = readlineSync.question('Please input Username?');
        req.body.password = readlineSync.question('Please input Password?');
        req.body.twoFactor = readlineSync.question('Please input 2fa?');
        req.body.apiKey = readlineSync.question('Please input Api Key?');
    } else if(needOnlyApiKeySites.indexOf(req.body.site)>-1) {
        req.body.username= '';
        req.body.password= '';
        req.body.apiKey = readlineSync.question('Please input Api Key?');
        req.body.twoFactor = readlineSync.question('Please input 2fa?');
    } else if(needSteemActiveKeySites.indexOf(req.body.site)>-1) {
        req.body.username = readlineSync.question('Please input Username?');
        req.body.password= '';
        req.body.apiKey = readlineSync.question('Please input Active Key?');
    } else {
        req.body.site = 'Simulator';
        req.body.HouseEdge = 0.001;
        intervalBetTime = 1000;
    }

    if (readlineSync.keyInYN('Do you use proxy?')) {
        req.body.proxy_ip = readlineSync.question('Please input proxy ip ?');
        req.body.proxy_port = readlineSync.question('Please input proxy port?');
        req.body.proxy_user = readlineSync.question('Please input proxy user?');
        req.body.proxy_password = readlineSync.question('Please input proxy password?');
    }
}

let proxy = {};
if(typeof req.body.proxy_ip !== 'undefined'){
    proxy.ip = req.body.proxy_ip;
    proxy.port = req.body.proxy_port;
    proxy.user = req.body.proxy_user;
    proxy.password = req.body.proxy_password;
}
Factory.register('Bitsler', new BitslerDice(proxy));
Factory.register('999Dice', new NineDice(proxy));
Factory.register('YoloDice', new YoloDice(proxy));
Factory.register('PrimeDice', new PrimeDice(proxy));
Factory.register('Stake', new StakeDice(proxy));
Factory.register('Crypto-Games', new CryptoDice(proxy));
Factory.register('Simulator', new Simulator(proxy));
Factory.register('EpicDice', new EpicDice(proxy));
Factory.register('KryptoGames', new KryptoGames(proxy));
Factory.register('DuckDice', new DuckDice(proxy));
Factory.register('FreeBitco', new FreeBitco(proxy));
Factory.register('WinDice', new WinDice(proxy));
Factory.register('WolfBet', new WolfBet(proxy));
Factory.register('999Doge', new NineDoge(proxy));
Factory.register('SatoshiDice', new SatoshiDice(proxy));
Factory.register('ParaDice', new ParaDice(proxy));

//var content = await loadScript();

scripts = await readdir("./script/js/");
index = readlineSync.keyInSelect(scripts, 'Which script?');
if(index < 0 ){
    process.exit();
}

eval("function stop(){isloop = false;}");
var content =  fs.readFileSync("./script/js/"+scripts[index], 'utf8');
eval(content.toLowerCase());



let spath = path.join(__dirname,'public/js/'+req.body.site+'/info.js');
eval(fs.readFileSync(spath, 'utf8'));
consoleInit();

let currencyValue = readlineSync.keyInSelect(currencies, 'Which Currencies?');
if(currencyValue < 0 ){
    return false;
}
currency = (currencies[currencyValue]).toLowerCase();
req.query.currency = currency;

console.log('==== Information of Your Computer ====');
console.log(req.body);
//readlineSync.keyInPause();
readlineSync.question('Hit Enter key to continue.............', {hideEchoBack: true, mask: ''});
console.log('It\'s executing now...');
let data = JSON.stringify(req.body);
fs.writeFileSync('./recent_account_info.json', data);

var blessed = require('blessed');
var contrib = require('blessed-contrib');
var screen = blessed.screen();
var grid = new contrib.grid({rows: 4, cols: 4, screen: screen});

var table1 =  grid.set(0, 0, 1.4, 0.8, contrib.table,
  { keys: true
  , fg: 'green'
  , label: 'Total Status'
  , columnSpacing: 1
  , columnWidth: [10, 12]});
var table2 =  grid.set(0, 0.8, 1.4, 0.8, contrib.table,
  { keys: true
  , fg: 'green'
  , label: 'Current Status 1'
  , columnSpacing: 1
  , columnWidth: [10, 12]});
var table3 =  grid.set(0, 1.6, 1.4, 0.8, contrib.table,
  { keys: true
  , fg: 'green'
  , label: 'Current Status 2'
  , columnSpacing: 1
  , columnWidth: [18, 12]});
var table5 =  grid.set(0, 2.4, 1.4, 0.8, contrib.table,
  { keys: true
  , fg: 'green'
  , label: 'Current Status 3'
  , columnSpacing: 1
  , columnWidth: [24]});
var table4 =  grid.set(0, 3.2, 1.4, 0.8, contrib.table,
  { keys: true
  , fg: 'green'
  , label: 'Info'
  , columnSpacing: 1
  , columnWidth: [20]});
var datalog =  grid.set(1.4, 0, 1.2, 4, contrib.log,
   { fg: "green"
   , selectedFg: "green"
   , label: 'Bet Info'
   , border: {type: "line", fg: "cyan"}});
var logs =  grid.set(2.6, 0, 1.4, 4, contrib.log,
   { fg: "green"
   , selectedFg: "green"
   , label: 'Server Log'});

table4.setData(
    { headers: ['Info']
        , data:
        [['Start(Enter)'],
            ['Stop(S)'],['Quit(Ctrl-C)']] });
table5.setData(
      { headers: ['Info']
          , data:
          [['TIME:0:0:0:0'],
              ['BETS:0'],
              ['PROFIT/H:0'],
              ['PROFIT/D:0'],
              ['AVGPROFIT:0']] });

screen.key(['C-c'], function(ch, key) {
  return process.exit(0);
});

screen.key(['s'], function(ch, key) {
    isloop = false;
});


screen.key(['enter'],async function(ch, key) {
    if(isloop) {
        console.log("The script is still running!");
        return false;
    }
    betTime();
    console.log("Script start!");
    isloop = true;
    let i = 0;
    req.logdata = "betid,amount,low_high,payout,chance,actual_chance,profit";
    let nowdate = new Date(); 
    let logname = req.body.site+'_'+ nowdate.getFullYear() + '-' +
    ("0" + (nowdate.getMonth() + 1)).slice(-2) + '-' +
    ("0" + (nowdate.getDate())).slice(-2) + '_' +
    ("0" + nowdate.getHours()).slice(-2) + '-' +
    ("0" + nowdate.getMinutes()).slice(-2) + '-' +
    ("0" + nowdate.getSeconds()).slice(-2)+ '_bet.csv';
    await saveLog(logname,req.logdata+'\r\n');
    betfunc = (() => {
        (async() => {
            if(!isloop){
                stopBetTime();
                console.log("Script stopped!");
                isloop = false;
                return false;
            }
            if(i == 0) {
              isloop = await bet(true, req);
            } else {
              isloop = await bet(false, req);
            }
            if(isloop){
                await sleep(intervalBetTime);
                betfunc();
            } else {
                console.log("isloop is false");
                let ret = await donate(req);
            }
            await saveLog(logname,req.logdata+'\r\n');
            i++;
        })();
    });
    betfunc();
});

let dice = Factory.create(req.body.site);
await login(req);

screen.render();

console.log = function (message) {
    try {
        if (typeof message == 'object') {
            message =  JSON.stringify(message) ==='{}' ? message.toString() : (JSON.stringify(message)).replace(/\"/g,"");
        }
        logs.log(message+"\r\n");
    } catch(err){
        console.error(err);
        process.exit();
    }
}
console.error = function (message) {
    try {
        if (typeof message == 'object') {
            message =  JSON.stringify(message) ==='{}' ? message.toString() : (JSON.stringify(message)).replace(/\"/g,"");
        }
        logs.log(message+"\r\n");
        out('error_log',message+'\r\n');
    } catch(err){
        console.error(err);
        process.exit();
    }
}

async function login(req) {
    await dice.login(req.body.username, req.body.password, req.body.twoFactor, req.body.apiKey, req);
    let ret = await dice.getUserInfo(req);
    ret = await dice.clear(req);
    consoleStats(ret,currencyValue);

}

async function donate(req) {
    //console.log("totalprofit:"+totalprofit);
    //console.log("donateprofit:"+donateprofit);
    let damount =  parseFloat(totalprofit) - parseFloat(donateprofit);
    damount = damount * 0.01;
    //console.log("toggleDonate:"+toggleDonate);
    //console.log("damount:"+damount);
    if(damount >0.00000001 && toggleDonate ){
        req.query.amount = damount;
        req.query.currency = currency;
        let ret = await dice.donate(req);
        console.log("donate ret:");
        console.log(ret);
        if(ret.Pending) {
            donateprofit = donateprofit + totalprofit;
        }
        if(ret.TotpFailure) {
            toggleDonate = false;
        }
    }
}

async function resetseed() {
    try {
        let ret = await dice.resetseed(req);
    } catch(err){
        console.error(err);
    }
}

async function betScript(req) {
    if(!checkParams(req.body.PayIn,req.body.Chance)) {
        console.log('Please enter the correct parameters');
        return false;
    }
    iswin = false;
    if(!isloop){
        return false;
    }
    let currentAmount =  req.body.PayIn/100000000;
    let ret  = await dice.bet(req);
    if(isError(ret)) {
        try {
            iswin = getWinStatus(ret);
            setStreak(iswin, currentAmount);
            setBetToLua(ret, currencyValue, currentAmount);
            req.logdata =  consoleData(ret, iswin);
            consoleStats(ret.info, currencyValue);
        } catch(err){
            console.error(err);
        }
    } else {
        isloop = false;
    }
    if (isloop) {
        return true;
    } else {
        return false;
    }
}

async function out(logname, logdata){
    fs.writeFile('./log/'+logname, logdata, {flag: 'a'}, function (err) {
        if(err) {
            console.error(err);
        }
    });
}
async function saveLog(logname, logdata){
    fs.writeFile('./log/'+logname, logdata, {flag: 'a'}, function (err) {
        if(err) {
            console.error(err);
        }
    });
}
async function scriptBet(init, req){
    try{
        if(!init){
            dobet();
        }
        previousbet = nextbet;
        req.body.PayIn = Math.round(parseFloat(nextbet*100000000));
        req.body.High = bethigh.toString();
        req.body.Currency = currency;
        req.body.CurrencyValue = currencyValue;
        req.body.Chance = chance;
        isloop = await betScript(req);
        return isloop;
    }catch(err){
        console.error(err);
    }
}

async function bet(init, req) {
    isloop = await scriptBet(init, req);
    return isloop;
}

function setStreak(win, currentAmount){
    if(currentAmount>maxbetamount){
        maxbetamount = currentAmount.toFixed(8);
    }
    if(win){
        maxstreakamount = maxstreakamount + currentAmount;
        if(currentstreak>=0) {
            currentstreak++;
            if(maxwinstreakamount<=maxstreakamount){
                maxwinstreakamount = maxstreakamount.toFixed(8) ;
            }
        } else {
            currentstreak = 1;
            if(maxlossstreakamount>=minstreakamount){
                maxlossstreakamount = minstreakamount.toFixed(8) ;
            }
            minstreakamount = 0;
        } 
        if(maxwinstreak<currentstreak){
            maxwinstreak = currentstreak;
        }
    } else {
        minstreakamount = minstreakamount - currentAmount;
        if(currentstreak<0) {
            currentstreak--;
            if(maxlossstreakamount>=minstreakamount){
                maxlossstreakamount = minstreakamount.toFixed(8) ;
            }
        } else {
            currentstreak = -1;
            if(maxwinstreakamount<=maxstreakamount){
                maxwinstreakamount = maxstreakamount.toFixed(8) ;
            }
            maxstreakamount = 0;
        } 
        if(maxlossstreak>currentstreak){
            maxlossstreak = currentstreak;
        }
    }
}

function setBetToLua(ret, currencyValue, currentAmount){
    profit = getProfit(ret.info,currencyValue);
    balance = getBalance(ret.info)
    win = getWinStatus(ret);
    currentprofit = getCurrProfit(ret);
    currentroll = getCurrentRoll(ret);
    totalprofit = totalprofit + currentprofit;
    bets = bets + 1;
    if(getWinStatus(ret)){
        wins = wins + 1;
    } else {
        losses = losses + 1;
    }
    lastbet = {id:getCurrentBetId(ret),chance:chance, date:getBetDate(ret),roll:currentroll,amount:currentAmount,nonce:getNonce(ret),serverhash:getServerHash(ret),serverseed:getServerSeed(ret),clientseed:getClientSeed(ret),profit:profit,uid:getUid(ret),high:bethigh};
}

function betTime() {
  difftime++;
  dayf = difftime/(24*60*60);
  day = Math.floor(dayf);
  hourf = (dayf - day) * 24;
  hour = Math.floor(hourf);
  minf = (hourf-hour) * 60;
  min = Math.floor(minf);
  secf = (minf- min) * 60;
  sec = Math.floor(secf);
  table5.setData(
        { headers: ['Info']
            , data:
            [['TIME:'+day+':'+hour+':'+min+':'+sec],
                ['BETS:'+ bets],
                ['PROFIT/H:'+ parseFloat(totalprofit/(dayf*24)).toFixed(10)],
                ['PROFIT/D:'+ parseFloat(totalprofit/dayf).toFixed(10)],
                ['AVGPROFIT:'+parseFloat(totalprofit/bets).toFixed(10) ]] });
  settime = setTimeout(function(){ betTime() }, 1000);
}

function stopBetTime() {
    clearTimeout(settime);
}

function betinterval(ms) {
    intervalBetTime  =  ms;
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

})();
