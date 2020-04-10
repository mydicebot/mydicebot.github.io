#    Sample script, you can code here and then 'Save As..' to another named file.
#    Author: MyDiceBot
from browser import document,window
chance = 49.5
multiplier = 2
basebet = 0.00000001
bethigh = False
nextbet = basebet

def dobet(event):
  	#init global
    global chance,multiplier,basebet,bethigh,nextbet
    global previousbet,bets,wins,losses,profit,currentprofit,currentstreak,currentroll,balance,win
    global currency,currencies,lastBet

    if win:
        sound('alert1.mp3')
        nextbet = basebet
    else:
        nextbet = previousbet * multiplier
    print(basebet,nextbet,previousbet,chance,win)
    print(currentprofit,currentstreak,wins,losses)
    print(bets,bethigh,isloop,profit,currentroll)
