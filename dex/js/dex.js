(function(window){
	'use strict';
	// --- define d-explorer ---
	function define_dex() {
		var dex = {
			version: "0",
			_DIV_PADDING: 30,
			_DIV_ID_VIS: "div_vis",
			_DIV_ID_CONTROL: "div_control",
			_BTN_ID_BUBBLES: "btn_bubbles",
			_BTN_ID_BARS: "btn_bars",
			_BTN_ID_LINKS: "btn_links",
			_CHECK_ID_PD: "check_pd",
			_CHECK_ID_SUPP_COLOR: "check_supp_color",
			_CHECK_ID_CONF_COLOR: "check_conf_color",
			_CHECK_ID_MEAS_COLOR: "check_meas_color",
			_CHECK_ID_SUPP_SIZE: "check_supp_size",
			_CHECK_ID_CONF_SIZE: "check_conf_size",
			_CHECK_ID_MEAS_SIZE: "check_meas_size",
			_DIV_ID_INFO: "div_info",
			// --- style ---
			font_size: 12,
			bar_width: 15,
			circle_default_stroke: {
				'stroke': 'white',
				'stroke-width': '1.5px',
				'stroke-opacity': 0.7
			},
			circle_pd_stroke: {
				'stroke': 'crimson',
				'stroke-width': '3px',
				'stroke-opacity': 0.7
			},
			circle_default_fill: {
				'fill': 'steelblue',
				'fill-opacity': 0.7
			},
			line_default_stroke: {
				'stroke': 'steelblue',
				'stroke-width': '15px',
				'stroke-opacity': 0.9
			},
			// --- ---
			data: {},
			nr_items: 0,
			node_data: [],
			link_data: [],
			nodes: {},
			links: {},
			width: function(x) {
				if(x) dex.width = x;
				else return dex.width;
			},
			height: function(x) {
				if(x) dex.height = x;
				else return dex.height;
			},
			resize: function() {
				var _w = document.getElementById(dex._DIV_ID_VIS).offsetWidth-dex._DIV_PADDING;
				var _h = _w/0.2;
				dex.width = _w; dex.height = _h;
				dex.svg.attr("width",_w).attr("height",_h);	  
			},
			init: function(data_path) {
				//svg
				var _w = document.getElementById(dex._DIV_ID_VIS).offsetWidth-dex._DIV_PADDING;
				var _h = _w/0.2;
				console.log("size: ("+_w+","+_h.toFixed(0)+")");
				dex.width = _w;
				dex.height = _h;
				dex.svg = d3.select("#"+dex._DIV_ID_VIS)
						   .append("svg").attr("id","vis-svg")
						   .attr("width",dex.width)
						   .attr("height",dex.height);
				dex.svg.append("g").attr("id","visg");
				window.onresize = dex.resize;
				//data
				d3.csv(data_path, 
					function(d) { 
						var a_set = d.aset.split(' ');
						if(a_set[0] == "") a_set=[];
						var b_set = d.bset.split(' ');
						if(b_set[0] == "") b_set=[];
						return {
							aset: a_set,
							bset: b_set,
							conf: +d.conf,
							meas: +d.meas
						};
					},
					function(error, rows) {
						if(error) throw error;
						handle_data(rows);
					});//data.csv


				dex.control.init();
			} //init
		};
		return dex;
	}

	if(typeof(dex) === 'undefined') {
		window.dex = define_dex();
	}
	else{
		console.log("d-explorer already defined");
	}

	function handle_data(rows) {
		dex.data = rows;
		//node_data
		dex.node_data = [];
		var acount=1,bcount=1;
		for(var i=0; i<rows.length; i++) {
			var rule = rows[i];
			var aset = rule.aset;
			for(var j=0; j<aset.length; j++) {
				var item = dex.util.has_item(aset[j], dex.node_data);
				if(item == null) {
					item = {};
					item.id = 'A_'+acount; acount++;
					item.name = aset[j];
					item.supp = 1;
					item.conf = rule.conf;
					item.meas = rule.meas;
					item.pd = true;
					dex.node_data.push(item);
				}
				else {
					item.supp = item.supp+1;
					item.conf = item.conf+rule.conf;
					item.meas = item.meas+rule.meas;
				}
			}
			var bset = rule.bset;
			for(var j=0; j<bset.length; j++) {
				var item = dex.util.has_item(bset[j], dex.node_data);
				if(item == null) {
					item = {};
					item.id = 'B_'+bcount; bcount++;
					item.name = bset[j];
					item.supp = 1;
					item.conf = rule.conf;
					item.meas = rule.meas;
					item.pd = false;
					dex.node_data.push(item);
				}
				else {
					item.supp = item.supp+1;
					item.conf = item.conf+rule.conf;
					item.meas = item.meas+rule.meas;
				}
			}
			dex.nr_items += (aset.length + bset.length); 
		}//for each rule
		for(var i=0; i<dex.node_data.length; i++) {
			var item = dex.node_data[i];
			item.conf = item.conf/item.supp;
			item.meas = item.meas/item.supp;
		}//for each node 
		// console.log(dex.node_data);
		// console.log("total#items: " + dex.nr_items);
		//link_data
		for(var i=0; i<dex.node_data.length-1; i++) {
			for(var j=i+1; j<dex.node_data.length; j++) {
				var a = dex.node_data[i];
				var b = dex.node_data[j];
				var mi = dex.util.mutual_info(rows, a, b);
				if(mi > 0) {
					var link = {};
					link.id = 'l'+i+''+j;
					link.source = a.id; link.target = b.id;
					link.mutual_info = mi;
					dex.link_data.push(link);
				}//if
			}//for
		}//for
		//graphics
		construct_nodes_and_links();
	}

	function construct_nodes_and_links() {
		//dex.links	
		var linkg = d3.select('#visg').append('g')
					.attr('id', 'linkg');
		dex.links = linkg.selectAll('.link')
					.data(dex.link_data)
					.enter().append('g').attr('class', 'link');	
		// dex.links.append('line');
		//dex.nodes
		var nodeg = d3.select('#visg').append('g')
					.attr('id','nodeg');
		var padding = 5;
		var pack = d3.layout.pack()
				.padding(padding)
				.size([dex.width-padding, dex.width-padding])
				// .size([1000, 500])
				.value(function(d) { return 10; });
		var pack_data = {};
		pack_data.name = "root";
		pack_data.children = dex.node_data;
		var _data = pack.nodes(pack_data); 
		_data = _data.filter(function(d) { return !d.children; }); 
		// console.log(_data);
		dex.nodes = nodeg.selectAll('.node')
			.data(_data, function(d){ return d.id; })
			.enter().append('g').attr('class','node');
		dex.nodes	
			.append('circle')
			.attr('r', function(d){return d.r;})
			.attr('cx', function(d){return d.x;})
			.attr('cy', function(d){return d.y;})
			.style(dex.circle_default_fill)
			.style(dex.circle_default_stroke)
			.on('mouseover', circle_mouseover)
			.on('mouseout', circle_mouseout);
		var x1 = 10, x2=110, y1=10, y2;
		dex.nodes.each(function(d,i){
			var node = d3.select(this);
			y2 = y1;
			node.append('line')
				.style(dex.line_default_stroke)
				.style('visibility', 'hidden')
				.attr('x1',x1).attr('x2',x2)
				.attr('y1',y1).attr('y2',y2);
			y1+=(dex.bar_width+2);	
		});		
		dex.nodes.append("text")
			.text(function(d) {
				var idx = 2*d.r/8;
				return d.name.substring(0,idx);
			})
			.attr("dy", ".3em")
			.attr("x", function(d){return d.x;})
			.attr("y", function(d){return d.y;})
			.style("text-anchor", "middle")
			.style("font-size", dex.font_size)
			.style("font-family", "Georgia")			
			.on('mouseover', node_text_mouseover)
			.on('mouseout', node_text_mouseout);

		dex.nodes.append("title")
			.text(function(d) { return d.name; });	

		var node_drag = d3.behavior.drag()
			.on("dragstart", node_dragstart)
	        .on("drag", node_dragmove)
	        .on("dragend", node_dragend);		
	    dex.nodes.call(node_drag);
	}

	function circle_mouseover(d) {
		if(!d.mouseover) {
			d.mouseover = true;
			d3.select(this)
			.attr('r', 1.2*d.r)
			.style('stroke', 'coral')
			.style('stroke-width', 5);
		}
	}
	function circle_mouseout(d) {
		if(d.mouseover) {
			d.mouseover = false;
			d3.select(this)
			.attr('r', d.r);
			var pd_checked = $('#'+dex._CHECK_ID_PD).is(':checked');
			if(pd_checked && d.pd) {
				d3.select(this).style(dex.circle_pd_stroke);
			}else{
				d3.select(this).style(dex.circle_default_stroke);
			}
		}
	}
	function node_text_mouseover(d) {
		if(!d.mouseover) {
			d.mouseover = true;
			d3.select(this.parentNode)
			.select('circle')
			.attr('r', 1.2*d.r)
			.style('stroke', 'coral')
			.style('stroke-width', 5);
		}
	}
	function node_text_mouseout(d) {
		if(d.mouseover) {
			d.mouseover = false;
			var circ = d3.select(this.parentNode)
			.select('circle').attr('r', d.r);
			var pd_checked = $('#'+dex._CHECK_ID_PD).is(':checked');
			if(pd_checked && d.pd) {
				circ.style(dex.circle_pd_stroke);
			}else{
				circ.style(dex.circle_default_stroke);
			}
		}
	}
	function node_dragstart(d, i) {
	    d3.event.sourceEvent.stopPropagation();
    }
    function node_dragmove(d, i) {
    	d.px += d3.event.dx;
        d.py += d3.event.dy;
        d.x += d3.event.dx;
        d.y += d3.event.dy; 
        dex.control.tick(); 
    }
    function node_dragend(d, index) {
    	d3.event.sourceEvent.stopPropagation();
    }
})(window);