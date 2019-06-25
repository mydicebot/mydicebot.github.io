chance = 10;
nextbet = 0.00001000;
basebet = 0.00001000;
installBet = 0.00001000;
X = 1.101;
memberbet = 0;
breakpoint = 0;
bethigh = false;
game = true;
regame = true;


function dobet() {
  if (balance >= breakpoint)
    breakpoint = balance;

  if (bethigh && currentroll < chance)
    X = X + 0.001;

  if (!bethigh && (currentroll > (100-chance))) 
    X = X + 0.001;

  if (game) {
    if (!win) 
      installBet = previousbet*X;

    if (win)
      installBet = memberbet;

    if (currentstreak < -10) {
      game = false;
      regame = false;
      installBet = 0.00001000;
      memberbet = 0.00001000;
      X = 1.101;
    }
    nextbet = installBet;
  }

  if (!game && currentstreak < -20) {
    regame = true;
    installBet = 0.00001000;
    memberbet = 0.00001000;
    X = 1.101;
  }

  if (win && regame) {
    game = true;
    nextbet = memberbet;
  }

  if (win && balance >= breakpoint) {
    game = true;
    memberbet = 0.00001000;
    X = 1.101;
    nextbet = 0.00001000;
  }

  if (previousbet >= memberbet)
    memberbet = previousbet;
  
}