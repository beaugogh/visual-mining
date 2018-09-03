var Dragrect = {
	rect: "",
	id: "",
	left_bar: "",
	right_bar: "",
	top_bar: "",
	bottom_bar: "",
	left_bound: null,
	right_bound: null,
	top_bound: null,
	bottom_bound: null,
	x: 0,
	y: 0,
	w: 0,
	y: 0,
	barw: 6,
	isX: true,
	isY: true,
	left_drag_resize: function (d) { //console.log("left"); 
		if (d.isX ) { 
			var lbound = 0;
			if(d.left_bound !== null) lbound = d.left_bound;

			var oldx = d.x; 
			d.x = Math.max(lbound, Math.min(d.x + d.w - d.barw, d3.event.x)); 
			d.w = d.w + (oldx - d.x);

			d.left_bar.attr("x", function() { return d.x - (d.barw / 2); });

			d.rect
				.attr("x", function() { return d.x; })
				.attr("width", d.w);

			d.top_bar 
				.attr("x", function() { return d.x + (d.barw/2); })
				.attr("width", d.w - d.barw)
			d.bottom_bar 
				.attr("x", function() { return d.x + (d.barw/2); })
				.attr("width", d.w - d.barw);
		}
	},
	right_drag_resize: function (d) { //onsole.log("right"); 
		if (d.isX ) { 
			var rbound = cells.svg.attr('width');
			if(d.right_bound !== null) rbound = d.right_bound;

			var coords = d3.mouse(this); 
			var _x = Math.min(rbound, Math.max(d.x + d.barw, coords[0])); 
			d.w = _x - d.x;
			d.right_bar.attr("x", function() { return _x - (d.barw / 2); });

			d.rect.attr("width", d.w);
			d.top_bar.attr("width", d.w - d.barw)
			d.bottom_bar.attr("width", d.w - d.barw);
		}
	},
	top_drag_resize: function (d) { //console.log("top");
		if(d.isY) {
			var tbound = d.barw;
			if(d.top_bound !== null) tbound = d.top_bound;

			var oldy = d.y;
			var coords = d3.mouse(this);
			d.y = Math.max(tbound, Math.min(d.y+d.h-d.barw/2,coords[1]));
			d.top_bar.attr('y', function() { return d.y - d.barw / 2; });
			d.h = d.h + (oldy - d.y);

			d.rect.attr('y', d.y).attr('height', d.h);
			d.left_bar.attr('y', d.y).attr('height', d.h);
			d.right_bar.attr('y', d.y).attr('height', d.h);
		}
	},
	bottom_drag_resize: function (d) { //console.log("bottom");
		if(d.isY) {
			var bbound = cells.svg.attr('height')
			if(d.bottom_bound !== null) bbound = d.bottom_bound;

			var coords = d3.mouse(this);
			var _y = Math.min(bbound, Math.max(d.y+d.barw,coords[1]));
			d.bottom_bar.attr('y', function() { return _y - d.barw / 2; });
			d.h = _y - d.y;

			d.rect.attr('height', d.h);
			d.left_bar.attr('height', d.h);
			d.right_bar.attr('height', d.h);
		}
	},
	init: function (g, id, x, y, w, h) {
		this.id = id;
  		this.x = x;
  		this.y = y;
  		this.w = w;
  		this.h = h;
  		//the rect itself
		// this.rect = g.append("rect")
	 //      .attr("id", id)
	 //      .attr("x", x)
	 //      .attr("y", y)
	 //      .attr("height", h)
	 //      .attr("width", w)
	 //      .attr("fill-opacity", .5)
	 //      .style('fill','blue');
	    //the right bar
	    var drag_right = d3.behavior.drag().origin(Object)
	    			.on('drag',this.right_drag_resize);
	    this.right_bar = g.append("rect")
	      .datum(this)
	      .attr("id", id+"_right")
	      .attr("x", function(d) { return x + w - (Dragrect.barw/2); })
	      .attr("y", function(d) { return y; })
	      .attr("height", h)
	      .attr("width", Dragrect.barw)
	      .attr("fill", "red")
	      .attr("fill-opacity", .5)
	      .attr("cursor", "ew-resize")
	      .call(drag_right);   
	    //the left bar
	    var drag_left = d3.behavior.drag().origin(Object)
	    			.on('drag',this.left_drag_resize);
	    this.left_bar = g.append("rect")
	      .datum(this)
	      .attr("id", id+"_left")
	      .attr("x", function(d) { return x - (Dragrect.barw/2); })
	      .attr("y", function(d) { return y; })
	      .attr("height", h)
	      .attr("width", Dragrect.barw)
	      .attr("fill", "red")
	      .attr("fill-opacity", .5)
	      .attr("cursor", "ew-resize")
	      .call(drag_left);  
	    //the top bar
	    var drag_top = d3.behavior.drag().origin(Object)
	    			.on('drag',this.top_drag_resize);
	    this.top_bar = g.append("rect")
	      .datum(this)
	      .attr("id", id+"_top")
	      .attr("x", function(d) { return x + (Dragrect.barw/2); })
	      .attr("y", function(d) { return y - (Dragrect.barw/2); })
	      .attr("height", Dragrect.barw)
	      .attr("width", w - Dragrect.barw)
	      .attr("fill", "green")
	      .attr("fill-opacity", .5)
	      .attr("cursor", "ns-resize")
	      .call(drag_top);
	    //the bottom bar
	    var drag_bottom = d3.behavior.drag().origin(Object)
	    			.on('drag',this.bottom_drag_resize);
		this.bottom_bar = g.append("rect")
		  .datum(this)
		  .attr("id", id+"_bottom")
	      .attr("x", function(d) { return x + (Dragrect.barw/2); })
	      .attr("y", function(d) { return y + h - (Dragrect.barw/2); })
	      .attr("height", Dragrect.barw)
	      .attr("width", w - Dragrect.barw)
	      .attr("fill", "green")
	      .attr("fill-opacity", .5)
	      .attr("cursor", "ns-resize")
	      .call(drag_bottom);  
	}//init
};//Dragrect

// var parent = {
// 	get: function fn() {
// 		return this.val;
// 	},
// 	val: 42
// };
// var child = Object.create(parent);
// child.val = 3.14;
// var grandchild = Object.create(child);
// console.log(parent.get());

// var child = Object.create(Dragrect);
// child.init({},"childid",1,2,3,4);
// console.log(child.test());
// console.log(child.id);
// console.log(chilx);
// console.log(chily);

// var child1 = Object.create(Dragrect);
// child1.init({},"childid1",10,20,30,40);
// console.log(child1.test());
// console.log(child1.id);
// console.log(child1.x);
// console.log(child1.y);

