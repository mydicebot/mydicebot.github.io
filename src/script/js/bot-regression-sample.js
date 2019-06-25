/************************************
    This script doubles the bet after a loss but starts at a very high chance of success:  95%.  
    After each bet the chance reduces enough to bring equilibrium to profit but stops reducing chance at 49.5%.  
    First loss goes from 95% to 67%, then 57% and then gradually lower and closer to 49.5%.  
    It basically buys you a few more higher probability roles before the same old 49.5% martingale.
    author: grendel25aaaaa
    link: https://bot.seuntjie.com/scripts.aspx?id=38
*************************************/

// init
chance = 95;
basebet = 0.00000100;
bethigh = false;
lossstreakcount = 0; // sample: user-defined lossstreakcount.
nextbet = basebet;

// do bet and let's rock
function dobet() {

    // adjust the stopping condition of session profit.
    if (profit >= 0.00001000) {
        console.log("profit done, so stop.");
        stop();
    }

    // adjust the stopping condition of wins.
    if (wins >= 1000) {
        console.log("wins done, so stop.");
        stop();
    }

    // adjust the stopping condition of bets. 
    if (bets >= 5000) { 
        console.log("bets done, so stop.");
        stop();
    }

    // adjust the stopping condition of loss streak. 
    // eg. -10 means 10 loss streak
    if (currentstreak <= -10) {
        console.log("10 loss streak, so stop.");
        stop();
    }

    // if win, reset bet to base amount.
    if (win) {
        chance = 95;
        nextbet = basebet;
        lossstreakcount = 0;
        console.log("WIN");
    }

    // if loss, 
    // first loss goes from 95% to 67%, 
    // then 57% and then gradually lower and closer to 49.5%.
    if (!win) {
        lossstreakcount += 1;
        if (lossstreakcount > 1) {
            nextbet = previousbet*2;
            chance = (1/(((nextbet+(nextbet-basebet))/nextbet)))*100;
            if (chance < 49.5) {chance = 49.5;}
            bethigh = !bethigh;
            console.log ("LOSE");
        } else {
            nextbet = previousbet*2;
            chance = (1/(((basebet+nextbet))/nextbet))*100;
            if (chance < 49.5) {chance = 49.5;}
            bethigh = !bethigh;
            console.log ("LOSE");
        }
    }
}