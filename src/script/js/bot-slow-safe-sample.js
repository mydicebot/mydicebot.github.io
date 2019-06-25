basebet = 0.01;
nextbet = 0.01;
bb = 0.01;
bb6 = 0.02;
pbet = 0.00000001;
pbet3 = 0.00000001;
pb3 = 1;
pb = 1;
pbb3 = 0;
pbb = 0;
nb = 0;
chance = 62;

function dobet() {

	if (pbb3 == 1) 
	    pbb3 = 0;
	
	if (pbb == 1)
	    pbb = 0;
	
	if (win && chance == 38) {
        pb3 = 1;
        pbb3 = 1;
    } else if (chance == 38 && pbb3 == 0) {
	    pb3 = 0;
 	}
	
	if (win && chance == 62) {
        pb = 1;
        pbb = 1;
    } else if (chance == 62 && pbb == 0){
	    pb = 0;
	}
	
	if (chance == 62 && pb == 0 ) {
	    pbet = pbet*3;
    } else if (chance == 62 && pb == 1) {
	    pbet = bb6;
	}
	
	if (chance == 38 && pb3 == 0) {
	    pbet3 = pbet3*1.7;
    } else if (chance == 38 && pb3 == 1) {
	    pbet3 = bb;
	}
	
	if (chance >= 62) {
        chance = 38;
        nb = 1;
        bethigh = true;
    } else {
        chance = 62;
        nb = 2;
        bethigh = false;
	}
	
	if (nb == 1) {
        nextbet = pbet3;
        nb = 2;
    } else if (nb == 2) {
        nextbet = pbet;
        nb = 1;
	}

}