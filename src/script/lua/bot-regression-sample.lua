--[[
    This script doubles the bet after a loss but starts at a very high chance of success:  95%.  
    After each bet the chance reduces enough to bring equilibrium to profit but stops reducing chance at 49.5%.  
    First loss goes from 95% to 67%, then 57% and then gradually lower and closer to 49.5%.  
    It basically buys you a few more higher probability roles before the same old 49.5% martingale.
    author: grendel25aaaaa
    link: https://bot.seuntjie.com/scripts.aspx?id=38
]]

-- You could just use Sleep(n) to use LUAs built in sleep function. 
-- But this one will have the same result without killing your CPU.
function sleep(n)
	t0 = os.clock() 
	while os.clock() - t0 <= n do end
end

-- init
chance = 95
basebet = 0.00000100
bethigh = false
lossstreakcount = 0 -- sample: user-defined lossstreakcount.
nextbet = basebet

-- do bet and let's rock
function dobet()

    -- some sites limit bet latency due to the low bet amount.
    -- enable it and avoid to be banned, just in case.
    -- eg. 2 means sleeping 2 seconds
    -- sleep(2)

    -- adjust the stopping condition of session profit.
    if profit >= 0.00001000 then
        print("profit done, so stop.")
        stop()
    end

    -- adjust the stopping condition of wins.
    if wins >= 1000 then
        print("wins done, so stop.")
        stop()
    end

    -- adjust the stopping condition of bets. 
    if (bets >= 5000) then 
        print("bets done, so stop.")
        stop()
    end

    -- adjust the stopping condition of loss streak. 
    -- eg. -10 means 10 loss streak
    if (currentstreak <= -10) then
        print("10 loss streak, so stop.")
        stop()
    end

    -- if win, reset bet to base amount.
    if (win) then
        chance = 95
        nextbet = basebet
        lossstreakcount = 0
        print("WIN")
    end

    -- if loss, 
    -- first loss goes from 95% to 67%, 
    -- then 57% and then gradually lower and closer to 49.5%.
    if (!win) then
        lossstreakcount += 1
        if (lossstreakcount > 1) then
            nextbet = previousbet*2
            chance = (1/(((nextbet+(nextbet-basebet))/nextbet)))*100
            if chance < 49.5 then chance = 49.5 end
            bethigh = !bethigh
            print ("LOSE")
        else
            nextbet = previousbet*2
            chance = (1/(((basebet+nextbet))/nextbet))*100
            if chance < 49.5 then chance = 49.5 end
            bethigh = !bethigh
            print ("LOSE")
        end
    end
end