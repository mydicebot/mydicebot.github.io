chance = 49.5
multiplier = 2
basebet = 0.00000001
bethigh = false
nextbet = basebet

function dobet() 
    
    if win then
        nextbet = basebet
    elseif !win then
        nextbet = previousbet * multiplier
    end

end