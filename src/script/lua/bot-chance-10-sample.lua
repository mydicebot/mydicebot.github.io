chance = 10
nextbet = 0.00001000
basebet = 0.00001000
installBet = 0.00001000
X = 1.101
memberbet = 0
breakpoint = 0
bethigh = false
game = true
regame = true


function dobet()
  if balance >= breakpoint then
    breakpoint = balance
  end

  if bethigh and currentroll < chance then
    X = X + 0.001
  end

  if !bethigh and currentroll > (100-chance) then
    X = X + 0.001
  end

  if game then
    if !win then
      installBet = previousbet*X
    end
    if win then
      installBet = memberbet
    end
    if currentstreak < -10 then
      game = false
      regame = false
      installBet = 0.00001000
      memberbet = 0.00001000
      X = 1.101
    end
    nextbet = installBet
  end

  if !game and currentstreak < -20 then
    regame = true
    installBet = 0.00001000
    memberbet = 0.00001000
    X = 1.101
  end

  if win and regame then
    game = true
    nextbet = memberbet
  end

  if win and balance >= breakpoint then
    game = true
    memberbet = 0.00001000
    X = 1.101
    nextbet = 0.00001000
  end

  if previousbet >= memberbet then
    memberbet = previousbet
  end
  
end