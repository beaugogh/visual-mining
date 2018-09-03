(function(window){
	'use strict';
	// --- define freebu ---
	function define_freebu() {
		var freebu = {
			version: "0",
			// --- ids on the control pannel (index.html) --- 
			_DIV_ID_CONTROL: "div-control",
			_DIV_ID_VIS: "div-vis",
			_DIV_ID_FILTER: "div-filter",
			_DIV_PADDING: 30,
			_TOGGLE_ID_RUN: "toggle-run",
			_BUTTON_ID_SORT: "btn-sort",
			_TOGGLE_ID_COLLAPSE: "toggle-collapse",
			_TOGGLE_ID_LABEL: "toggle-label",
			_TOGGLE_ID_LASSO: "toggle-lasso",
			_TOGGLE_ID_CONFINE: "toggle-confine",
			_LABEL_ID_TOGGLE_RUN: "toggle-run-label",
			_LABEL_ID_TOGGLE_COLLAPSE: "toggle-collapse-label",
			_LABEL_ID_TOGGLE_CONFINE: "toggle-confine-label",
			_RADIO_ID_NETWORK_VIEW: "networkV",
			_RADIO_ID_CIRCLE_VIEW: "circleV",
			_RADIO_ID_RANK_VIEW: "rankV",
			_BUTTON_ID_RESET: "btn-reset",			
			// --- global variables ---
			svg: {},
			g: {},
			hulls: {},
			tip: {},
			nodes: {},
			links: {},
			data: {},
			data_path: {},
			dx:0, //offset due to svg translation
			dy:0,
			is_mouse_left_down:false,
			is_mouse_dragging:false,
			is_lassoable:false,
			// --- zoom params ---
			min_zoom: 0.3,
			max_zoom: 10,
			// --- styles ---
			color: {},
			short_duration: 500,
			moderate_duration: 1000,
			long_duration: 2000,
			font_default_size: 14,
			font_max_size: 30,
			font_min_size: 6,
			node_default_radius: 5,
			node_max_radius: 8,
			node_min_radius: 4,
			node_circle_max_radius:30,
			node_circle_min_radius:3,
			node_rank_default_radius: 10,
			node_rank_max_radius: 20,
			node_rank_min_radius: 10,
			link_default_width: 1,
			link_max_width: 3,
			link_min_width: 0.1,
			node_default_style: {
				"fill": "steelblue",
				"fill-opacity": "0.8",
				"stroke": "#fff",
				"stroke-width": "1.5px"
			},
			node_circle_default_style: {
				"fill": "steelblue",
				"fill-opacity": "0.8",
				"stroke": "#fff",
				"stroke-width": "1.5px"
			},
			node_default_stroke_style: {
				"stroke": "#fff",
				"stroke-width": "1.5px"
			},
			super_node_default_stroke_style: {
				"stroke": "navy",
				"stroke-width": "1px",
				"stroke-dasharray": ("10, 10")
			},
			node_highlight_stroke_style: {
				"stroke": "orange",
				"stroke-width": "3px"
			},
			node_fixed_stroke_style: {
				"stroke": "#505050",
				"stroke-width": "2px"
			},
			node_default_color_style: {
				"fill": "steelblue"
			},
			node_dormant_color_style: {
				"fill": "#d0d1e6"
			},
			node_text_default_style: {
				"font": "sans-serif",
				"font-size": 14,
				"stroke": "none",
				"fill": "black"
			},
			link_default_style: {
				"stroke": "#999",
			  	"stroke-width": "1px",
			    "stroke-opacity": "0.6"
			},
			link_super_style: {
				"stroke": "#999",
			  	"stroke-linecap": "round",
			    "stroke-opacity": "0.6"
			},
			lasso_node_stroke_style: {
				"stroke": "#A80000",
				"stroke-opacity": "0.7",
				"stroke-width": "5px"
			},
			// --- dimension ---
			width: function(x) {
				if(x) freebu.width = x;
				else return freebu.width;
			},
			height: function(x) {
				if(x) freebu.height = x;
				else return freebu.height;
			},
			resize: function() {
				var _w = document.getElementById(freebu._DIV_ID_VIS).offsetWidth-freebu._DIV_PADDING;
				var _h = _w/1.618; //console.log("resizing: " + _w + ", " + _h); //console.log(document.getElementById(freebu._DIV_ID_VIS));
				freebu.width = _w;
				freebu.height = _h;
				freebu.svg.attr("width",_w);
				freebu.svg.attr("height",_h);
				freebu.svg.select("#svgrect")
						  .attr("width",_w)
						  .attr("height",_h);
				if(freebu.filter.list_data.length>0){
					// var w = freebu.filter.list_w;
					// var x = freebu.width-w-freebu.filter.list_padding;
					// freebu.filter.lists.each(function(d,i){
					// 	var list_node = d3.select(this);
					// 	var shift = x - list_node.select("rect").attr("x");
					// 	/* a problem using transform: enlarge or shrink browser window mess up the objects' positions*/
					// 	list_node.attr("transform","translate("+shift+",0)");
					// });
					freebu.filter.align_lists();
				}		  
			},
			adjust_tip_direction: function(d) {
				var padding = 30;
				var rect = freebu.g[0][0].getBoundingClientRect();
				var left = rect.left;
				var right = left + rect.width;

				if(Math.abs(d.y-rect.top) < padding) {
					// freebu.tip.offset()
					freebu.tip.direction('s');
				}
				else if(Math.abs(rect.bottom - d.y) < padding) freebu.tip.direction('n');
				else freebu.tip.direction('e');
			},
			// --- initialize ---
			init: function(data_path, which_view) {
				var _w = document.getElementById(freebu._DIV_ID_VIS).offsetWidth-freebu._DIV_PADDING;
				var _h = _w/1.618;
				console.log("size: ("+_w+","+_h.toFixed(0)+")");
				freebu.width = _w;
				freebu.height = _h;
				freebu.svg = d3.select("#"+freebu._DIV_ID_VIS)
							   .append("svg")
							   .attr("id","vis-svg")
							   .attr("width",freebu.width)
							   .attr("height",freebu.height);
				freebu.svg.append("rect").attr("id", "svgrect")
						.attr("x",0).attr("y",0)
						.attr("width",freebu.width)
						.attr("height",freebu.height)
						.attr("rx", 15).attr("ry", 15)
						.style("stroke", "rgba(130,130,130,130)")
						.style("stroke-width", 1).style("fill", "none")
						.style("opacity",0);	
				freebu.g = freebu.svg.append("g").attr("id","visg");						   
				//initialize tip
				freebu.tip = d3.tip().attr("class","d3-tip")
			    	.offset([0, 10])
			    	.html(function(d) { 
			    		var html = '<p style="color:orange;display:inline">'+d.name+"</p><br>";
			    		if(d.nr_children == 0) {
			    			var info=freebu.filter.summary['info'][d.id];
				    		for(var i=0; i<info.length; i++) {
				    			var obj = info[i];
				    			html += obj.name+": "+obj.value+"<br>";
				    		}
			    		}
			    		return html;
			    	});		    	
				window.onresize	= freebu.resize;

				d3.json(data_path, function(error, data) {
					if (error) throw error;
					freebu.data = data;
					console.log("#nodes: " + data.nodes.length);
					console.log("#links: " + data.links.length);
					//inject properties to data
					$.each(freebu.data.links, function(i, link_item) {
						link_item.id = i;
						link_item.weight = 1;
					});
					$.each(freebu.data.nodes, function(i, node_item) {
						node_item.degree = 0;
						node_item.nr_children = 0;//>0 if it's a super node
					});
					
					//initialize links
					freebu.links = freebu.g.append("g")
							  .attr("id", "linkg")
							  .selectAll(".link")
						      .data(data.links, function(d){return d.id;});
					//initialize hulls and lasso
					freebu.g.append("g").attr("id","hullg");
					d3.select("#hullg").append("rect")
							  .attr("id", "lasso_area")
							  .attr("width",freebu.width)
		                      .attr("height",freebu.height)
		                      // .style("fill", "red") 
		                      .style("opacity",0);
		            freebu.lasso.init();     
		            freebu.g.append("g").attr("id", "listg");    
					//initialize nodes	      
					freebu.nodes = freebu.g.append("g")
							   .attr("id","nodeg")
							   .selectAll(".node")
							   .data(data.nodes, function(d){return d.id;});		   	
					// freebu.nodes.each(function(d){
					// 		// d3.select(this).attr("id","node_"+d.id);
					// 		console.log(d3.select(this));
					// 		d.dormant = false; 
					// 		d.marked = false;
					// });		   		 		  
					// ------------ vis ------------
					freebu.force.init(data);
					// else if(which_view=='circleV')freebu.force.init(data);
					// else if(which_view=='rankV')freebu.force.init(data);
					// ------------ filter ------------
					freebu.filter.init();

					console.log("data loaded");

					$(document).mousedown(function(e) {
						if(e.which == 1) freebu.is_mouse_left_down = true;
					});
					$(document).mouseup(function(e) {
						if(e.which == 1) freebu.is_mouse_left_down = false;
					});

					// ------------ control ------------
					freebu.control.init();
				});//d3.json
				
			},
			re_init: function(input_data) {
				//drop user's own file
				var data = {};
				data.nodes = input_data.nodes;
				data.links = input_data.links;
				freebu.data = data;
				console.log("#nodes: " + data.nodes.length);
				console.log("#links: " + data.links.length);
				//inject properties to data
				$.each(freebu.data.links, function(i, link_item) {
					link_item.id = i;
					link_item.weight = 1;
				});
				$.each(freebu.data.nodes, function(i, node_item) {
					node_item.degree = 0;
					node_item.nr_children = 0;//>0 if it's a super node
				});
				
				//initialize links
				freebu.links = d3.select('#linkg').selectAll(".link")
				      .data(data.links, function(d){return d.id;}); 
				freebu.links.exit().remove();     
				//initialize nodes	  
				freebu.nodes = d3.select('#nodeg').selectAll(".node")
					   .data(data.nodes, function(d){return d.id;}); 
				freebu.nodes.exit().remove();	     	   			   		 		  
				// ------------ vis ------------
				freebu.force.init(data);
				// ------------ filter ------------
				$('#div-filter').remove();
				$('<div class="col-md-2" id="div-filter"></div>').insertAfter('#div-vis');
    			freebu.filter.init();

				
				freebu.control.current_view = $('#'+freebu._RADIO_ID_NETWORK_VIEW).attr("id");
				freebu.control.remove_network_toggles();
				freebu.control.remove_rank_toggles();
		 		freebu.control.add_network_toggles();
		 		freebu.control.remove_hierarchy_circles();

				freebu.links.each(function(d,i){
					var line = d3.select(this).select('line');
					line.style('visibility', 'visible');
				});
				freebu.nodes.each(function(d,i){
					var circle = d3.select(this).select('circle');
					circle.attr('r',freebu.node_default_radius);
				});
				$('#'+freebu._TOGGLE_ID_RUN).bootstrapToggle("on");
			},
			reset_nodes: function() {
				freebu.nodes.each(function(d,i){
					d.fixed = false; d.dormant = false;
					var circle = d3.select(this).select("circle");
					if(d.nr_children == 0) {
						if(freebu.control.current_view == freebu._RADIO_ID_NETWORK_VIEW) {
							var r = freebu.node_default_radius;
							circle.attr("r", r);
							circle.transition().duration(freebu.moderate_duration).style(freebu.node_default_style);
						}
						else if(freebu.control.current_view == freebu._RADIO_ID_RANK_VIEW){
							var r = freebu.node_rank_default_radius;
							circle.attr("r", r);
							circle.transition().duration(freebu.moderate_duration).style(freebu.node_default_style);
						}
						else if(freebu.control.current_view == freebu._RADIO_ID_CIRCLE_VIEW) {
							circle.transition().duration(freebu.moderate_duration).style(freebu.node_circle_default_style);
						}
					}
					
				});
				freebu.force.nr_ticks = 0;
				$('#'+freebu._DIV_ID_FILTER).find("input").each(function() {
					var id = $(this).attr('id'); 
					if(id !== undefined) {
						if(id.indexOf('intersection') == -1) {
							$(this).attr("checked", false);	
						}
						else $(this).attr("checked", true);	
					}	
				});
				if(freebu.control.current_view == freebu._RADIO_ID_RANK_VIEW) {
					freebu.rank.align_nodes();
				}
			},
			reset_nodes_color: function() {
				freebu.nodes.each(function(d,i){
					if(d.nr_children == 0) {
						var circle = d3.select(this).select("circle");
						circle.transition().duration(freebu.moderate_duration)
						.style(freebu.node_default_color_style);
					}
				});
			}
			// --- ---	
		};
		return freebu;

	}

	if(typeof(freebu) === 'undefined') {
		window.freebu = define_freebu();
	}
	else{
		console.log("freebu already defined");
	}

})(window);