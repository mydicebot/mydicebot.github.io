
/* Internal Variables */
/* FORMAT TEMPLATE
  Variable: 
  Type: 
  Permission:
  Purpose: 
*/

/* Internal Functions */
/* FORMAT TEMPLATE
  Function: 
  Purpose: 
*/ 

/*************************************/

/*************************************
  Variable: basebet
  Type: double
  Permission: Read Write
  Purpose: Must set for the first bet.
**************************************/ 
basebet = 1.0;

/*************************************
  Variable: nextbet
  Type: double
  Permission: Read Write
  Purpose: The amount to bet in the next bet.
**************************************/ 
nextbet = 1.0;

/************************************** 
  Variable: chance
  Type: double
  Permission: Read Write
  Purpose: The chance to win when betting.
***************************************/ 
chance = 49.5;

/************************************** 
  Variable: chance
  Type: bool
  Permission: Read Write
  Purpose: Whether to bet high/over (true) or low/under(false).
***************************************/ 
bethigh = false;

/************************************** 
  Function: dobet()
  Purpose: The loop of bets
***************************************/
function dobet() {

  /**************************************  
    Variable: previousbet
    Type: double
    Permission: Read Only
    Purpose: Shows the amount of the previous bet. 
  ***************************************/ 
  console.log('previousbet: ' + previousbet);

  /**************************************  
    Variable: win
    Type: bool
    Permission: Read Only
    Purpose: Indicates whether the last bet you made was a winning bet (true) or a losing bet (false). 
  ***************************************/ 
  console.log(win);

  /**************************************  
    Variable: currentprofit
    Type: double
    Permission: Read Only
    Purpose: Shows the profit for the last bet made.. 
  ***************************************/  
  console.log('currentprofit: ' + currentprofit);

  /************************************** 
    Variable: currentroll
    Type: double
    Permission: Read Only
    Purpose: Show the roll number for the last bet made. 
  ***************************************/  
  console.log('currentroll: ' + currentroll);

  /**************************************  
    Variable: balance
    Type: double
    Permission: Read Only
    Purpose: Lists your balance at the site you're logged in to. 
  ***************************************/ 
  console.log('balance: ' + balance);

  /**************************************  
    Variable: wins
    Type: int
    Permission: Read Only
    Purpose: Shows the number of wins for the current session.
  ***************************************/
  console.log('wins: ' + wins);

  /**************************************  
    Variable: losses
    Type: int
    Permission: Read Only
    Purpose: Shows the number of losses for the current session.
  ***************************************/ 
  console.log('losses: ' + losses);

  /**************************************  
    Variable: currentstreak
    Type: int
    Permission: Read Only
    Purpose: Shows the current winning or losing streak.
  ***************************************/ 
  console.log('currentstreak: ' + currentstreak);

  /************************************** 
    Variable: profit
    Type: double
    Permission: Read Only
    Purpose: Shows your session profit. 
  ***************************************/ 
  console.log('profit: ' + profit);

  /************************************** 
    Variable: bets
    Type: int
    Permission: Read Only
    Purpose: Shows the number of bets for the current session. 
  ***************************************/ 
  console.log('bets: ' + bets);

  if (bets >= 10) {
    /************************************** 
      Function: stop()
      Purpose: Stop the bet.
    ***************************************/ 
    stop();
  }

}
