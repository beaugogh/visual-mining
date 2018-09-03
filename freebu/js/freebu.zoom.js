freebu.zoom = {
	is_offset:false,
	from_left: 0,
	from_right: freebu.width,
	from_top: 0,
	from_bottom: freebu.height,
	to_left: 0,
	to_right: freebu.width,
	to_top: 0,
	to_bottom: freebu.height,
	ratio: function () {
		return (freebu.zoom.to_right - freebu.zoom.to_left)/(freebu.zoom.from_right - freebu.zoom.from_left);
	},
	alpha: function (wheelDelta) {
		var a = 1-wheelDelta*0.002;
		if(a < 0.1) a = 0.1;
		return a;
	},
	scale_x: d3.scale.linear(),
	scale_y: d3.scale.linear(),
	TX: function (x) {
		var mouseX = d3.event.x; if(freebu.zoom.is_offset) mouseX -= freebu.dx;
		var a = freebu.zoom.alpha(d3.event.wheelDelta);
		var w = freebu.width*a;
		freebu.zoom.from_left = mouseX - w/2;
	    freebu.zoom.from_right = mouseX + w/2;
	    freebu.zoom.to_left = mouseX - freebu.width/2;
	    freebu.zoom.to_right = mouseX + freebu.width/2;
	    freebu.zoom.scale_x
	    	.domain([freebu.zoom.from_left, freebu.zoom.from_right])
	    	.range([freebu.zoom.to_left, freebu.zoom.to_right]);
	    return freebu.zoom.scale_x(x);
	},
	TY: function (y) {
		var mouseY = d3.event.y; if(freebu.zoom.is_offset) mousey -= freebu.dy;
		var a = freebu.zoom.alpha(d3.event.wheelDelta);
		var h = freebu.height*a;
	    freebu.zoom.from_top = mouseY - h/2;
	    freebu.zoom.from_bottom = mouseY + h/2;
	    freebu.zoom.to_top = mouseY - freebu.height/2;
	    freebu.zoom.to_bottom = mouseY + freebu.height/2;
	    freebu.zoom.scale_y
	    	.domain([freebu.zoom.from_top, freebu.zoom.from_bottom])
	    	.range([freebu.zoom.to_top, freebu.zoom.to_bottom]);
	    return freebu.zoom.scale_y(y);
	}

}