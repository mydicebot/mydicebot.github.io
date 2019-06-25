basebet=0.01
nextbet=0.01
bb=			0.01
bb6=		0.02
pbet=		0.00000001
pbet3=	0.00000001
pb3=		1
pb=			1
pbb3=		0
pbb=		0
nb=			0
chance=	62

function dobet()

	if pbb3 == 1 then
	pbb3=0
	end
	
	if pbb == 1 then
	pbb=0
	end
	
	if win and chance == 38 then
	pb3=1
	pbb3=1
	else
	if chance == 38 and pbb3 == 0 then
	pb3=0
	end
	end
	
	if win and chance == 62 then
	pb=1
	pbb=1
	else
	if chance == 62 and pbb == 0 then
	pb=0
	end
	end
	
	if chance == 62 and pb == 0 then
	pbet=pbet*3
	else
	if chance == 62 and pb == 1 then
	pbet=bb6
	end
	end
	
	if chance == 38 and pb3 == 0 then
	pbet3=pbet3*1.7
	else
	if chance == 38 and pb3 == 1 then
	pbet3=bb
	end
	end
	
	if chance >= 62 then
	chance=38
	nb=1
	bethigh=true
	else
	chance=62
	nb=2
	bethigh=false
	end
	
	if nb == 1 then
	nextbet=pbet3
	nb=2
	else
	if nb == 2 then
	nextbet=pbet
	nb=1
	end
	end
	end