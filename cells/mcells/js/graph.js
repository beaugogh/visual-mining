Graph = {
	vis: '',
	section: '',
	d3force: '',
	nodes: [],
	links: [],
	nnames: [],
	lnames: [],
	force_nodes: [],
	force_links: [],
	min_font_size: 12,
	max_font_size: 36,
	min_line_weight: 2,
	max_line_weight: 10,
	init: function (vis, section) { //console.log(section.index+': '+section.arr);
		this.vis = vis;
		this.section = section;
		this.init_nodes_links();
		this.init_force();
		
	},//init
	init_nodes_links: function() {
		this.nodes = [];
		this.links = [];
		this.nnames = [];
		this.lnames = [];
		for (var i = 0; i < this.section.arr.length; i++) {
			var row = this.section.arr[i];
			var items = [];
			for(var key in row) {
				var val = row[key];
				if(val !== '_') {
					items.push(val);
				}
			}//for each item in the row

			/*
			 * construct nodes in this row
			 */
			for(var j=0; j<items.length; j++) { 
				var item = items[j];
				//if there hasn't been this node, create a new one
				var item_index = this.nnames.indexOf(item);
				if(item_index == -1) {
					this.nnames.push(item);
					var node = Object.create(Node);
					var nid = 'node_' + this.section.index + '_' + (this.nnames.length-1);
					node.init(this, nid, item);
					this.nodes.push(node);
				}
				//if it exists already, increment its count
				else{
					var node = this.nodes[item_index];
					node.count = +node.count + 1;
				}
			}
			/*
			 * construct links in this row
			 */
			if(items.length > 1) {
				for (var j = 0; j < items.length-1; j++) {
				 	for (var k = j+1; k < items.length; k++) {
				 		var link_item = items[j] +'\t'+items[k];
				 		var link_item1 = items[k] + '\t'+items[j];
				 		var link_index = this.lnames.indexOf(link_item);
				 		var link_index1 = this.lnames.indexOf(link_item1);
				 		//if no such link, create new one
				 		if(link_index == -1 && link_index1 == -1) {
				 			this.lnames.push(link_item);
				 			var link = Object.create(Link);
				 			var lid = 'link_'+this.section.index+'_'+(this.lnames.length-1);
				 			var source = this.nnames.indexOf(items[j]);
				 			var target = this.nnames.indexOf(items[k]);
				 			link.init(this, lid, source, target);
				 			this.links.push(link);
				 		}
				 		//if the link already exists, increment its count
				 		else if(link_index !== -1) {
				 			var link = this.links[link_index];
				 			link.count = +link.count + 1;
				 		}
				 		else if(link_index1 !== -1) {
				 			var link = this.links[link_index1];
				 			link.count = +link.count + 1;
				 		}
				 		
				 	}//for
				}//for
			}//if
			
		}//for each row in the section
		this.local_resize();
		
	},//init_nodes_links
	init_force: function() {
		this.force_nodes = [];
		this.force_links = [];
		for (var i = 0; i < this.nodes.length; i++) {
			var fnode = {};
			fnode.id = this.nodes[i].id;
			fnode.text = this.nodes[i].text;
			this.force_nodes.push(fnode);
		}
		for (var i = 0; i < this.links.length; i++) {
			var flink = {};
			flink.source = this.links[i].source;
			flink.target = this.links[i].target;
			this.force_links.push(flink);
		}

		var graph = this;
		var section = this.section;
		var padding = 10;
		var left = 200;
		var right = section.w;
		var top = section.y+padding;
		var bottom = section.y + section.h - padding;
		var nodes = this.nodes;
		var links = this.links;
		var force_nodes = this.force_nodes;
		var force_links = this.force_links;
		if(force_nodes.length > 0) {
			this.d3force = d3.layout.force()
						.charge(-120)
					    .linkDistance(function(l,i){
					    	var min = 100;
					    	var s=nodes[l.source.index]; 
					    	var t=nodes[l.target.index];
					    	var dist = s.text_width+t.text_width;
					    	if(dist<min) dist=min;
					    	return dist;
					    })
					    .size([section.w, section.h]);
			this.d3force.nodes(this.force_nodes)
						.links(this.force_links)
						.start(); 
			this.d3force
				.on('tick', ontick)
				.on('end', onend)

		}

		function ontick () { //console.log('tick');
			for (var i = 0; i < graph.nodes.length; i++) {
				var fnode = force_nodes[i];
				nodes[i].x = fnode.x;
				nodes[i].y = fnode.y;
				// fnode.y = +fnode.y +section.y;
				// fnode.x = constrainX(fnode.x);
				// fnode.y = constrainY(fnode.y);
				graph.nodes[i].text_obj
					.attr('x', fnode.x)
					.attr('y', fnode.y);
			}
			for (var i = 0; i < graph.links.length; i++) {
				var flink = force_links[i];
				graph.links[i].line
					.attr("x1", flink.source.x)
					.attr("y1", flink.source.y)
					.attr("x2", flink.target.x)
					.attr("y2", flink.target.y);
			}
			
		}//ontick

		function onend () {
			// console.log('section ' + section.index + ' ends');
			var yshift = +section.y;
			for (var i = 0; i < nodes.length; i++) {
				nodes[i].y = constrainY(+nodes[i].y + yshift);
				force_nodes[i].y = nodes[i].y;
				nodes[i].text_obj
					.attr('y', nodes[i].y)
					.style('visibility', 'visible');
			};
			for (var i = 0; i < links.length; i++) {
				var flink = force_links[i];
				links[i].line
					.attr("y1", flink.source.y)
					.attr("y2", flink.target.y)
					.style('visibility', 'visible');
			};
		}

		function constrainX(x) {
		    var nx = x;
		    if(nx < left) nx = left;
		    if(nx > right) nx = right;

		    return nx;
		}

		function constrainY(y) {
		    var ny = y;
		    if(ny < top) ny = top;
		    if(ny > bottom) ny = bottom;

		    return ny;
		}
		
	},//init_force
	drag_update_position: function() { 
		var coords = mcells.mouse_coords;
		var yshift = +coords[1] - mcells.prev_y;
		var nodes = this.nodes;
		var force_nodes = this.force_nodes;
		var links = this.links;
		var force_links = this.force_links;
		var padding = 10;
		var top = this.section.y+padding;
		var bottom = this.section.y + this.section.h - padding;

		for (var i = 0; i < nodes.length; i++) {
			nodes[i].y = constrainY(+nodes[i].y + yshift);
			force_nodes[i].y = nodes[i].y;
			nodes[i].text_obj
				.attr('y', nodes[i].y);
		};
		for (var i = 0; i < links.length; i++) {
			var flink = force_links[i];
			links[i].line
				.attr("y1", flink.source.y)
				.attr("y2", flink.target.y);
		};

		function constrainY(y) {
		    var ny = y;
		    if(ny < top) ny = top;
		    if(ny > bottom) ny = bottom;

		    return ny;
		}
	},
	local_resize: function() {//resize grpah nodes and links locally
		// console.log('graph local resize '+ this.section.index);
		//set nodes' font size
		var min_node_count = this.section.arr.length;
		var max_node_count = 0;
		for (var i = 0; i < this.nodes.length; i++) {
			var count = +this.nodes[i].count;
			if(count<min_node_count) min_node_count = count;
			if(count>max_node_count) max_node_count = count;
		};

		var nscale = d3.scale.linear()
				.domain([min_node_count, max_node_count])
				.range([this.min_font_size, this.max_font_size]);
		for (var i = 0; i < this.nodes.length; i++) {
			var node = this.nodes[i];
			node.set_font_size(nscale(+node.count));
		};

		//set links' line weight
		var min_link_count = this.section.arr.length;
		var max_link_count = 0;
		for (var i = 0; i < this.links.length; i++) {
			var count = this.links[i].count;
			if(count<min_link_count) min_link_count = count;
			if(count>max_link_count) max_link_count = count;
		};

		var wscale = d3.scale.linear()
				.domain([min_link_count, max_link_count])
				.range([this.min_line_weight, this.max_line_weight]);
		for (var i = 0; i < this.links.length; i++) {
			var link = this.links[i];
			link.set_line_weight(wscale(+link.count));
		};		

		// console.log('section: ' + this.section.index);
		// console.log(this.nodes);
		// console.log(this.links);
		// console.log(this.nnames); console.log(this.lnames);
	},
	global_resize: function() {//resize graph nodes and links globally
		// console.log('graph global resize '+ this.section.index);
		//set nodes' font size
		var min_node_count = this.section.arr.length;
		var max_node_count = 0;
		for (var i = 0; i < this.nodes.length; i++) {
			var v = +this.nodes[i].count;
			var total = +this.nodes[i].total_count;
			v = v/total;
			if(v<min_node_count) min_node_count = v;
			if(v>max_node_count) max_node_count = v;
		};

		var nscale = d3.scale.linear()
				.domain([min_node_count, max_node_count])
				.range([this.min_font_size, this.max_font_size]);
		for (var i = 0; i < this.nodes.length; i++) {
			var node = this.nodes[i];
			var v = +node.count;
			var total = +node.total_count;
			v = v/total;
			node.set_font_size(nscale(v));
		};

		//set links' line weight
		var min_link_count = this.section.arr.length;
		var max_link_count = 0;
		for (var i = 0; i < this.links.length; i++) {
			var v = +this.links[i].count;
			var total = +this.links[i].total_count;
			v = v/total;
			if(v<min_link_count) min_link_count = v;
			if(v>max_link_count) max_link_count = v;
		};

		var wscale = d3.scale.linear()
				.domain([min_link_count, max_link_count])
				.range([this.min_line_weight, this.max_line_weight]);
		for (var i = 0; i < this.links.length; i++) {
			var link = this.links[i];
			var v = +link.count;
			var total = +link.total_count;
			v = v/total;
			link.set_line_weight(wscale(v));
		};	
	}
}

Node = {
	graph: '',
	id: '',
	text: '',
	text_obj: '',
	text_width: 0,
	font_size: 15,
	count: 1,
	total_count: 1,
	x: 0,
	y: 0,
	init: function (graph, id, text) {
		this.graph = graph;
		this.id = id;
		this.text = text;
		this.x = +this.graph.section.x+this.graph.section.w;
		this.y = +this.graph.section.y;

		var text_drag = d3.behavior.drag().origin(Object)
					.on('dragstart', this.ontextdragstart)
	    			.on('drag',this.ontextdrag);
		this.text_obj = graph.vis.g.append('text')
					.attr('id', this.id)
					.attr('x', this.x)
					.attr('y', this.y)
					.attr('dy', this.font_size/2)
					.style('font-family', 'palatino')
					.style('text-anchor', 'middle')
					.style('font-size', this.font_size)
					.style('visibility', 'hidden')
					// .style('fill', 'none')
					// .style('stroke', 'red')
					.text(text)
					.on('mouseover', this.ontextmouseover)
					.on('mousemove', this.ontextmousemove)
					.on('mouseout', this.ontextmouseout)
					.call(text_drag);

	},
	set_font_size: function(size) {
		this.font_size = size;
		this.text_obj.style('font-size', size).attr('dy', this.font_size/2);
		this.text_width = this.text_obj[0][0].getBBox().width;	
	},
	ontextmouseover: function() { //console.log("mouse over: " + this.id);
		var nid = this.id;
		var ss = nid.split('_');
		var section_index = +ss[1]; 
		var node_index = +ss[2]; 
		var section = mcells.sections[section_index];
		var node = section.graph.nodes[node_index];
		var tip = 'count: ' + node.count + '<br>' + 
				  'total count: ' + node.total_count;
		// console.log(node.text + ': ' + node.count);
		mcells.tooltip.style('visibility', 'visible')
				.html(tip);
	},
	ontextmousemove: function() {
		mcells.tooltip.style("top", (event.pageY-10)+"px")
				.style("left",(event.pageX+10)+"px");
	},
	ontextmouseout: function() { //console.log("mouse out: " + this.id);
		mcells.tooltip.style('visibility', 'hidden');
	},
	ontextdragstart: function() { //console.log('text_drag start');
		d3.event.sourceEvent.stopPropagation();
	},
	ontextdrag: function() { //console.log('text_drag');
		var nid = $(this).attr('id');
		var ss = nid.split('_');
		var section_index = +ss[1]; 
		var node_index = +ss[2]; 
		var section = mcells.sections[section_index];
		var node = section.graph.nodes[node_index];
		var fnode = section.graph.force_nodes[node_index];
		var coords = d3.mouse(this);
		node.x = coords[0]; node.y = coords[1];
		fnode.x = coords[0]; fnode.y = coords[1];
		node.text_obj.attr('x', node.x).attr('y', node.y);
		for (var i = 0; i < section.graph.links.length; i++) {
			var flink = section.graph.force_links[i];
			section.graph.links[i].line
				.attr("x1", flink.source.x)
				.attr("y1", flink.source.y)
				.attr("x2", flink.target.x)
				.attr("y2", flink.target.y);
		};
	}
}

Link = {
	graph: '',
	id: '',
	source: '',//the index of the source node
	target: '',//the index of the target node
	count: 1,
	total_count: 1,
	x1: 0, 
	y1: 0,
	x2: 0, 
	y2: 0,
	line: '',
	line_weight: 1,
	init: function (graph, id, source, target) {
		this.graph = graph;
		this.id = id;
		this.source = source;
		this.target = target;
		this.line = graph.vis.g.append('line')
					.attr('id', this.id)
					.style('stroke-opacity', .5)
					.style('stroke', 'grey')
					.style('stroke-width', .8)
					.style('visibility', 'hidden')
					.on('mouseover', this.onlinemouseover)
					.on('mousemove', this.onlinemousemove)
					.on('mouseout', this.onlinemouseout);
	},
	set_line_weight: function(weight) {
		this.line_weight = weight;
		this.line.style('stroke-width', weight);
	},
	onlinemouseover: function() { //console.log(this);
		var lid = this.id;
		var ss = lid.split('_');
		var section_index = +ss[1]; 
		var link_index = +ss[2]; 
		var section = mcells.sections[section_index];
		var link = section.graph.links[link_index];
		var tip = 'count: ' + link.count + '<br>' + 
				  'total count: ' + link.total_count;
		mcells.tooltip.style('visibility', 'visible')
				.html(tip);
	},
	onlinemousemove: function() {
		mcells.tooltip.style("top", (event.pageY-10)+"px")
				.style("left",(event.pageX+10)+"px");
	},
	onlinemouseout: function() { //console.log("mouse out: " + this.id);
		mcells.tooltip.style('visibility', 'hidden');
	}
}

