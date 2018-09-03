freebu.force = {
	d3force: d3.layout.force(),
	graph: {},
	collapsed: false, // the boolean indicating whether the network view is collapsed or expanded
	ticking: true, // the boolean indicating whether the "clock" is ticking for the force-layout
	panning: false, // the boolean indicating whether the user is panning
	confined: false, // the boolean that decides if the nodes are confined wihtin the svg-rectangle 
	dragged_node: null,
	dragged_hull: null,
	singletons: new Set(), // the indices of the nodes that are singletons
	communities: {}, // the object storing each group/community's color and members' indices
	curve: {}, //the interpolator for hull-path calculation
	hulls: {},
	hull_paths: [], // the hull paths for drawing convex hulls
	hull_path_offset: 15,
	focused_hull: null,//the currenly mouse-hovered convex hull
	nr_ticks: 0,
	superscale: {},
	prev_positions: {},
	selected_list: null,
	init: function(graph) { 
		freebu.force.communities = {};
		freebu.force.hulls = {};
		freebu.force.hull_paths = [];
		freebu.force.prev_positions = {}
		freebu.force.selected_list = null;
		//back-up of the original graph
		// freebu.force.graph.nodes = [];
		// for(var i=0; i<graph.nodes.length; i++) {
		// 	freebu.force.graph.nodes.push(graph.nodes[i]);
		// }
		// freebu.force.graph.links = [];
		// for(var i=0; i<graph.links.length; i++) {
		// 	freebu.force.graph.links.push(graph.links[i]);
		// }
		freebu.svg.style("cursor","move");	      
		//
		// --- initialize d3 force layout ---	
		//  
		freebu.force.d3force
			.nodes(graph.nodes)
			.links(graph.links)
			.size([freebu.width, freebu.height])
			.charge(-120)
			.linkDistance(function(l,i){
				var dist = 46;
				var n1=l.source, n2=l.target;
				if(n1.nr_children==0 && n2.nr_children==0){
					if(n1.group != n2.group) {
						dist = 130;
					}
				}
				else{
					if(n1.nr_children>20 && n2.nr_children>20){
						dist = 260;
					}
					else dist = 180;
				}
				return dist;
			})
		    .linkStrength(0.9)
		    .friction(0.9)
		    .charge(-60)
		    .gravity(0.1)
		    .theta(0.8)
		    .alpha(0.1)
		    .on("tick", freebu.force.tick)
		    .start();

		$('#'+freebu._TOGGLE_ID_RUN).bootstrapToggle('on');
		//
		// --- initialize appearance of nodes and links --- 
		//
		freebu.nodes.enter()
					.append("g")
					.attr("class", "node")
					.attr("id", function(d){return "node_"+d.id;})
					.append("circle")
					.attr("id", function(d){return 'c'+d.id;})
			    	.attr("r", freebu.node_default_radius)
			  		.style(freebu.node_default_style);    
		freebu.links.enter()
					.append("g")
					.attr("class", "link")
					.append("line")
			  		.style(freebu.link_default_style);
		//
		// --- computating singletons, and update the degree of each node
		//
		var nodes_in_links = new Set();
		freebu.links.each(function(d,i) {
			d.source.degree = d.source.degree+1;
			d.target.degree = d.target.degree+1;
			nodes_in_links.add(d.source.id);
			nodes_in_links.add(d.target.id);
		});
		freebu.nodes.each(function(d,i) {
			if(!nodes_in_links.has(d.id)) {
				freebu.force.singletons.add(d.id);
			}
		});
		//
		// --- construct communities, note that a community excludes the nodes that are singletons, since singletons are in principle not supposed to be in any community with size >1, and modularity-based community detection algoirhtms sometimes wrongly put such singletons into a community
		//
		freebu.color = d3.scale.category10();
		var comms = new Set();
		freebu.nodes.each(function(d, i){ 
			for(var i=0; i<d.attributes.length; i++) {
				var attr = d.attributes[i];
				if(attr.type.indexOf('polynary') != -1 && attr.name=='community'){
					comms.add(attr.value);
					d.group = attr.value;
				}
			}
		});
		if(comms.size > 10) { freebu.color = d3.scale.category20(); }
		freebu.nodes.each(function(d, i){
			if(!freebu.force.communities[d.group]) {
				freebu.force.communities[d.group] = {};
			}
			if(!freebu.force.communities[d.group].nodes) {
				freebu.force.communities[d.group].nodes = [];
			}
			if(!freebu.force.communities[d.group].in_links) {
				freebu.force.communities[d.group].in_links = [];
			}
			if(!freebu.force.communities[d.group].out_links) {
				freebu.force.communities[d.group].out_links = [];
			}
			if(!freebu.force.communities[d.group].color) {
				freebu.force.communities[d.group].color = freebu.color(d.group);
			}
			if(!freebu.force.communities[d.group].members) {
				freebu.force.communities[d.group].members = [];
			}
			if(!freebu.force.singletons.has(d.id)) {
				freebu.force.communities[d.group].members.push(d.id);
				freebu.force.communities[d.group].nodes.push(d);
			}
			if(!freebu.force.communities[d.group].fixed) {
				freebu.force.communities[d.group].fixed = false;
			}
			if(!freebu.force.communities[d.group].expanded) {
				freebu.force.communities[d.group].expanded = true;
			}
		});
		
		freebu.links.each(function(d,i) {
			$.each(freebu.force.communities, function(key, val) {
				var nmembers = freebu.force.communities[key].members;
				if(nmembers.indexOf(d.source.id) != -1 
					&& nmembers.indexOf(d.target.id) != -1) {
					freebu.force.communities[key].in_links.push(d);
				}
				else if(nmembers.indexOf(d.source.id) != -1 
					&& nmembers.indexOf(d.target.id) == -1) {
					freebu.force.communities[key].out_links.push(d);
				}
				else if(nmembers.indexOf(d.source.id) == -1 
					&& nmembers.indexOf(d.target.id) != -1) {
					freebu.force.communities[key].out_links.push(d);
				}
			});
		});
		var min_nr_children=Number.MAX_VALUE, max_nr_children=Number.MIN_VALUE;
		$.each(freebu.force.communities, function(key, val) {
			var nr = freebu.force.communities[key].members.length;
			if(nr<min_nr_children) min_nr_children=nr;
			if(nr>max_nr_children) max_nr_children=nr;
		});
		superscale = d3.scale.linear()
				.domain([min_nr_children,max_nr_children])
				.range([20, 60]);
		//
		// --- preparation for hulls in the collapse/expand interaction
		//
		freebu.force.curve = d3.svg.line()
				.interpolate("cardinal-closed").tension(.85);
		// --- force link distance ---
		// freebu.force.d3force
		// 	.linkDistance(function(l, i) {
		// 		var _min_dist = 5;
		//     	var s = l.source, t = l.target;
		//     	var s_group_size=freebu.force.communities[s.group].members.length;
		//     	var t_group_size=freebu.force.communities[t.group].members.length;
		//     	var size_s = (s.group != t.group ? s_group_size:_min_dist);
		//     	var size_t = (s.group != t.group ? t_group_size:_min_dist);
		//     	var size_a = (s.nr_children>0 ? s.nr_children : size_s);
		//     	var size_b = (t.nr_children>0 ? t.nr_children : size_t);
		//     	var size_dist = 30*Math.min(size_a, size_b);

		//     	var s_group_degree=freebu.force.communities[s.group].out_links.length;
		//     	var t_group_degree=freebu.force.communities[t.group].out_links.length;
		//     	var degree_s = (s.group != t.group ? s_group_degree : _min_dist);
		//     	var degree_t = (s.group != t.group ? t_group_degree : _min_dist);
		// 		var degree_a = (s.degree>0? s.degree: degree_s);
		// 		var degree_b = (t.degree>0? t.degree: degree_t);
		// 		var degree_dist = 30*Math.min(degree_a, degree_b);

		//     	var dist = Math.min(size_dist, degree_dist, 200);
		//     	if(s.nr_children==0 && t.nr_children==0) console.log(i+": "+dist);
		//     	return dist;
		//     });		
		//
		// --- mouse behavior
		//
		freebu.force.node_over_out();
		freebu.force.node_drag();
		freebu.force.zoom_pan();
	},
	tick: function() {
		freebu.force.update_positions();
		if(freebu.force.nr_ticks == 1000) {
			freebu.force.nr_ticks = 0;
			freebu.force.d3force.stop();
			$('#'+freebu._TOGGLE_ID_RUN).bootstrapToggle('off');
		}
		freebu.force.nr_ticks++;
	},
	node_over_out: function() {
		function circ_over(d, i) {
			freebu.svg.style("cursor","initial");
			if(d.nr_children == 0) {
				var r = d3.select(this).attr("r");
				d3.select(this).attr("r", 1.5*r);
			}
			d3.select(this).style(freebu.node_highlight_stroke_style);
			freebu.adjust_tip_direction(d);  
			freebu.tip.show(d,i);
		}
		function circ_out(d, i) {
			var circle=d3.select(this);
			if(freebu.is_lassoable) freebu.svg.style("cursor", "cell");
			else freebu.svg.style("cursor", "move");
			if(d.nr_children == 0) {
				var r = circle.attr("r");
				d3.select(this).attr("r", r/1.5);
			}
			if(d.fixed) circle.style(freebu.node_fixed_stroke_style);
			else if(freebu.is_lassoable && d.selected) {
				circle.style(freebu.lasso_node_stroke_style);
			}
			else{
				if(d.nr_children==0) circle.style(freebu.node_default_stroke_style);	
				else circle.style(freebu.super_node_default_stroke_style);
			}	
			freebu.tip.hide(); 
		}		
		//
	    // --- mouse over/out and click behavior ---
	    //
		freebu.nodes.call(freebu.tip);
		freebu.nodes.each(function(d,i){
			var circle = d3.select(this).select("circle");
			circle.on("mouseover", circ_over);
			circle.on("mouseout", circ_out);
		});
	},
	node_drag: function() {
		//
		// --- node mouse drag behavior ---
		//
		var node_drag = d3.behavior.drag()
			// .origin(function(d) { return d; })
			.on("dragstart", node_dragstart)
	        .on("drag", node_dragmove)
	        .on("dragend", node_dragend);
		freebu.nodes.call(node_drag);    

	    function node_dragstart(d, i) {
	    	d3.event.sourceEvent.stopPropagation();
	    	freebu.force.stop();
	    	freebu.force.prev_positions = {};
	    	freebu.force.prev_positions[i]=[d.x,d.y];
	    	if(!d.fixed) {
	    		d.fixed = true;
	  		}
	  		else d.fixed = false;
	    }
	    function node_dragmove(d, i) {
	    	d.px += d3.event.dx;
	        d.py += d3.event.dy;
	        d.x += d3.event.dx;
	        d.y += d3.event.dy; 
	        freebu.force.tick(); // this is the key to make it work together with updating both px,py,x,y on d !
	        freebu.tip.hide();
	        if(!d.fixed) d.fixed=true;
	        freebu.is_mouse_dragging = true;
	        freebu.filter.check_list_mouse_over();
	    }
	    function node_dragend(d, index) {
	    	d3.event.sourceEvent.stopPropagation();
	    	var circle = d3.select(this).select("circle");
	    	if($('#'+freebu._TOGGLE_ID_RUN).prop('checked')) {
	        	freebu.force.resume();
	        } //console.log(freebu.filter.selected_list);
	        if(freebu.filter.selected_list != null) {
	        	for(var i=0; i<freebu.filter.list_data.length; i++) {
	    			var list = freebu.filter.list_data[i];//console.log(list.id);
	    			if(list.id == freebu.filter.selected_list) {
	    				if(!freebu.filter.if_members_contain(list.members,d.id)) {
	    					var person = {};
	        				person.id=d.id; person.name=d.name;
	        				list.members.push(person);
	    				}
	    				break;
	    			}
	    		}
	    		d.x=freebu.force.prev_positions[index][0];
		        d.y=freebu.force.prev_positions[index][1];
		        freebu.force.update_positions();
	        }
	        else{
	        	if(d.fixed) {
			        freebu.force.tick();
			        circle.style(freebu.node_fixed_stroke_style);
		    	}
		    	else{
		    		if(d.nr_children==0) circle.style(freebu.node_default_stroke_style);
		    		else circle.style(freebu.super_node_default_stroke_style);
		    	}
		        freebu.tip.hide();
	        }
	        freebu.is_mouse_dragging = false;
	    }
	},
	zoom_pan: function() {
		// --- pan ---
		var pan = d3.behavior.drag()
			.on("dragstart", panstart)
	        .on("drag", panmove)
	        .on("dragend", panend);
		freebu.svg.call(pan);
		// freebu.g.call(pan);  
	
	    function panstart() { //console.log("pan start");
	    	if(freebu.force.ticking) {
	    		freebu.force.stop();
	    		$('#'+freebu._TOGGLE_ID_RUN).bootstrapToggle("off");
	    	}
	    	if(!freebu.is_lassoable && !freebu.force.ticking) {
	    		freebu.force.panning = true;
	    	}
	    }
		function panmove() { 
	    	if(freebu.force.panning) { //console.log("pan move");
				freebu.dx += d3.event.dx;
		    	freebu.dy += d3.event.dy;
		    	// freebu.g.attr("transform", "translate("+(freebu.dx)+","+(freebu.dy)+")");
		    	freebu.nodes.each(function(d,i){
		    		 d.x += d3.event.dx;
	        		 d.y += d3.event.dy;
		    	});
		    	//hi-circle positions if it's the hierarchy view
				d3.selectAll(".hi-circle").each(function(d,i){
					var circle = d3.select(this);
					d.x += d3.event.dx;
	        		d.y += d3.event.dy;

				});
				freebu.force.tick();
	    	}
	    }
		function panend() {
	    	if(freebu.force.panning) {//console.log("pan end");
	    		freebu.force.panning = false;
	    	}
	    } 
	    // --- zoom ---
	    freebu.svg.on("mouseenter", function() {
	    	freebu.util.disable_window_scroll();
	    });
	    freebu.svg.on("mouseleave", function() {
	    	freebu.util.enable_window_scroll();
	    });
		freebu.svg.on("wheel.zoom", function() {
			// console.log(d3.event.x+","+d3.event.y);
			freebu.nodes.each(function(d){
				var node = d3.select(this);
				var circle = node.select("circle");
				var nx = freebu.zoom.TX(d.x);
				circle.attr("cx", function(){return d.x = nx;});
				var ny = freebu.zoom.TY(d.y);
				circle.attr("cy", function(){return d.y = ny;});
				var nr = freebu.zoom.ratio()*circle.attr("r");
				var maxr, minr;
				if(d.nr_children == 0) {
					if(freebu.control.current_view !== freebu._RADIO_ID_CIRCLE_VIEW) {
						maxr = freebu.node_max_radius;
						minr = freebu.node_min_radius;
						if(freebu.control.current_view == freebu._RADIO_ID_RANK_VIEW) {
							maxr = freebu.node_rank_max_radius;
							minr = freebu.node_rank_min_radius;
						}
						if(nr > maxr) { nr = maxr; }
						else if(nr < minr) { nr = minr; }
					}
					circle.attr("r", nr);
				}				
				var text = node.select("text");
				text.attr("x", nx).attr("y", ny);
			});
			freebu.links.each(function(d){
				var link = d3.select(this).select("line");
				link.attr("x1", d.source.x)
			    	.attr("y1", d.source.y)
				    .attr("x2", d.target.x)
				    .attr("y2", d.target.y);
			});

			if(freebu.force.collapsed) {
				freebu.force.update_hull_paths();
				freebu.force.hulls.data(freebu.force.hull_paths, function(d){return d.group;});
				freebu.force.hulls.each(function(d,i) {
					var path = d3.select(this).select("path");
					path.attr("d",function(d){return freebu.force.curve(d.path);});
				})
			}

			if(freebu.control.current_view == freebu._RADIO_ID_CIRCLE_VIEW) {
				d3.selectAll(".hi-circle").each(function(d){
					var circle = d3.select(this);
					var nx = freebu.zoom.TX(d.x);
					circle.attr("cx", function(){return d.x = nx;});
					var ny = freebu.zoom.TY(d.y);
					circle.attr("cy", function(){return d.y = ny;});
					var nr = freebu.zoom.ratio()*circle.attr("r");
					circle.attr("r", function(){return d.r = nr;});
				});
				// console.log('zoom in circle');
				d3.selectAll('.node text').text(function(d) {
					var circ =d3.select(this.parentNode).select('circle');
					var r = circ.attr('r');
					var idx = 2*r/8;
					return d.name.substring(0,idx);
				});
			}
			
		});	
	},
	update_positions: function() { 
		//link positions
		freebu.links.each(function(d,i){
			var link = d3.select(this).select("line");
			link.attr("x1", d.source.x)
				.attr("y1", d.source.y)
				.attr("x2", d.target.x)
				.attr("y2", d.target.y);
		})
		//node positions
		freebu.nodes.each(function(d,i){ 
			var node = d3.select(this);
			var circle = node.select("circle");
			var text = node.select("text");
			d.x = freebu.force.confineX(d.x);
			d.y = freebu.force.confineY(d.y);
			circle.attr("cx",d.x).attr("cy",d.y);
			text.attr("x",d.x).attr("y",d.y);
		});
		if(freebu.force.collapsed) {
			freebu.force.update_hull_paths();
			freebu.force.hulls.data(freebu.force.hull_paths, function(d){return d.group;});
			freebu.force.hulls.each(function(d,i) {
				var path = d3.select(this).select("path");
				path.attr("d",function(d){return freebu.force.curve(d.path);});
			})  
		}
		//hi-circle positions if it's the hierarchy view
		d3.selectAll(".hi-circle").each(function(d,i){
			var circle = d3.select(this);
			circle.attr("cx",d.x).attr("cy",d.y); 
		});
	},
	resume: function() {
		freebu.force.d3force.resume();
		freebu.force.ticking = true;
	},
	stop: function() {
		freebu.force.d3force.stop();
		freebu.force.ticking = false;
	},
	update_hull_paths: function() {
		var offset = freebu.force.hull_path_offset;
		freebu.force.hull_paths = [];
		var count = 1;
		$.each(freebu.force.communities, function(key, val) {
			if(key != 'undefined' && freebu.force.communities[key].expanded) {
				var obj = {};
				obj.id = Math.floor(Math.random() * 26) + Date.now();
				obj.group = key;
				var arr = [];
				$.each(freebu.force.communities[key].nodes, function(i, d){
					arr.push([d.x-offset, d.y-offset]);
					arr.push([d.x-offset, d.y+offset]);
					arr.push([d.x+offset, d.y-offset]);
					arr.push([d.x+offset, d.y+offset]);
				});
				obj.path = d3.geom.hull(arr);
				freebu.force.hull_paths.push(obj);
				count++;
			}
		});
	},
	hull_drag: function() {
		// --- hull drag behavior ---
		var hull_drag = d3.behavior.drag()
			.on("dragstart", hull_dragstart)
	        .on("drag", hull_dragmove)
	        .on("dragend", hull_dragend);
		freebu.force.hulls.call(hull_drag);    

	    function hull_dragstart(datum) {
	    	d3.event.sourceEvent.stopPropagation();
	    	// freebu.force.stop();
	    	var fixed = freebu.force.communities[datum.group].fixed;
	    	freebu.force.communities[datum.group].fixed = !fixed;
	    	var members = freebu.force.communities[datum.group].members;
	    	freebu.force.prev_positions = {};
	    	freebu.nodes.each(function(d,i){
	    		if(members.indexOf(d.id) != -1) { 
	    			if(!d.fixed) { d.fixed = true; }
	    			else { d.fixed = false; }
	    			freebu.force.prev_positions[i]=[d.x,d.y];
	    		}
	    	});
	    }
	    function hull_dragmove(datum) {	 
	    	var fixed = freebu.force.communities[datum.group].fixed;
	    	if(!fixed) freebu.force.communities[datum.group].fixed = true;   	 
	     	var members = freebu.force.communities[datum.group].members;
	    	freebu.nodes.each(function(d,i){
	    		if(members.indexOf(d.id) != -1) { 
	    			if(!d.fixed) d.fixed = true; 
	    			d.px += d3.event.dx;
			        d.py += d3.event.dy;
			        d.x += d3.event.dx;
			        d.y += d3.event.dy;
	    		}
	    	});
	    	freebu.force.update_positions();
	    	freebu.filter.check_list_mouse_over();
	    }
	    function hull_dragend(datum) {
	    	d3.event.sourceEvent.stopPropagation();//console.log(freebu.filter.selected_list);
	    	if(freebu.filter.selected_list != null) {
	    		var _nodes=freebu.force.communities[datum.group].nodes;
	    		for(var i=0; i<freebu.filter.list_data.length; i++) {
	    			var list = freebu.filter.list_data[i];
	    			if(list.id == freebu.filter.selected_list) {
	    				
	    				for(var j=0; j<_nodes.length; j++) {
	    					if(!freebu.filter.if_members_contain(list.members,_nodes[j].id)) {
	    						var person = {};
		    					person.id = _nodes[j].id; person.name = _nodes[j].name;
								list.members.push(person);
	    					} 
	    				}//add members to the list
	    				break;
	    			}//find matching list
	    		}//for each list
	    		freebu.filter.selected_list = null;
	    		for(var i=0; i<_nodes.length; i++) {
	    			var idx=_nodes[i].index;
	    			var pos = freebu.force.prev_positions[idx];
	    			_nodes[i].x = pos[0], _nodes[i].y = pos[1];
	    		}
	    		freebu.force.update_positions();
	    	}
	    	else{
	    		var fixed = freebu.force.communities[datum.group].fixed;
		    	if(fixed) {
		    		freebu.force.update_positions();
	    		    if($('#'+freebu._TOGGLE_ID_RUN).prop('checked')) {
			        	freebu.force.resume();
			        }
		    	}
		   		var members = freebu.force.communities[datum.group].members;
		    	freebu.nodes.each(function(d,i){
		    		if(members.indexOf(d.id) != -1) { 
		    			var circle = d3.select(this).select("circle");
		    			if(d.fixed) {
		    				circle.transition().duration(freebu.short_duration).style(freebu.node_fixed_stroke_style);
		    			}
		    			else{
		    				circle.transition().duration(freebu.short_duration).style(freebu.node_default_stroke_style);
		    			}
		    		}
		    	});
	    	}
	    	
	    }//function: hull_dragend
	},
	get_links_with_nodes: function(_nodes) {
		var link_ids = [];
		freebu.links.each(function(d, i){
			if(_nodes.indexOf(d.source.id) !== -1 ||
				_nodes.indexOf(d.target.id) !== -1){
				link_ids.push(d.id);
			}
		});
		return link_ids;
	},
	get_other_nodes: function(_node_ids) {
		var other_nodes = [];
		for(var i=0; i<freebu.data.nodes.length; i++) {
			if(_node_ids.indexOf(freebu.data.nodes[i].id) == -1){
				other_nodes.push(freebu.data.nodes[i]);
			}
		}
		return other_nodes;
	},
	hulls_off: function() {
		freebu.force.collapsed = false;
		//remove hulls
		d3.selectAll(".hull").remove();
	},
	hulls_on: function() {
		freebu.force.collapsed = true;
		freebu.force.update_hull_paths();
		freebu.force.hulls = d3.select("#hullg").selectAll("path .hull")
			.data(freebu.force.hull_paths, function(d){return d.group;});  
			
		freebu.force.hulls.enter().append("g")
			.attr("class", "hull")
			.append("path")
			.attr("d", function(d) {return freebu.force.curve(d.path);})
			.style("fill", function(d){return freebu.force.communities[d.group].color;})
			.on("mouseover", function(d,i) {
				freebu.force.focused_hull = d3.select(this);
			})
			.on("mouseout", function(d,i) {
				freebu.force.focused_hull = null;
			})
			.on("dblclick", freebu.force.hull_dblclick);

		d3.select("#hullg")
			.attr("opacity", 1e-6)
		    .transition()
		    .duration(freebu.short_duration)
		    .attr("opacity", 1);	

		freebu.force.hull_drag();
		// console.log("collapsed");
	},
	check_duplicate_super_link: function(super_links, super_node_id, node_id) {
		var found_link = null;
		for(var i=0; i<super_links.length; i++) {
			var slink = super_links[i];
			var source_id = freebu.data.nodes[slink.source].id;
			var target_id = freebu.data.nodes[slink.target].id;
			if(source_id == super_node_id && target_id == node_id) {
				found_link = slink; break;
			}
			else if(source_id == node_id && target_id == super_node_id) {
				found_link = slink; break;
			}
		}
		return found_link;
	},
	hull_dblclick: function(datum) {
		var expanded = freebu.force.communities[datum.group].expanded;
		freebu.force.communities[datum.group].expanded = !expanded; 
		if(expanded) {//to collapse hull
			freebu.force.collapse_hull(datum);
		}
		else {//to expand hull
			freebu.force.expand_hull(datum);
		}//to expand hull
		$('#'+freebu._TOGGLE_ID_RUN).bootstrapToggle("on");
		// console.log("hull dblclick");
	},
	expand_hull: function(datum) {
		//
		// --- update nodes ---------------------------------------------------
		//
		var new_data_nodes = [];
    	freebu.nodes.each(function(d,i){
    		if(d.id != datum.id) new_data_nodes.push(d);
    	});
    	var prev_nodes = freebu.force.communities[datum.group].nodes;
    	for(var i=0; i<prev_nodes.length; i++) {
    		new_data_nodes.push(prev_nodes[i]);
    	}
		freebu.data.nodes = new_data_nodes;
    	freebu.nodes = freebu.svg.select("#nodeg").selectAll(".node")
    				.data(new_data_nodes, function(d){return d.id;});
    	freebu.nodes.exit().remove();
    	freebu.nodes.enter()
			.append("g")
			.attr("class", "node")
			.append("circle")
	    	.attr("r", freebu.node_default_radius)
	  		.style(freebu.node_default_style); 
	  	freebu.force.node_over_out();
		freebu.force.node_drag();
		//
	    // --- update links ---------------------------------------------------
	    //
		var new_data_links = [];
		freebu.links.each(function(d,i){
			var id = d.id.toString();
			if(id.indexOf(datum.id.toString()) == -1) new_data_links.push(d);
		});
		var in_links = freebu.force.communities[datum.group].in_links;
		for(var i=0; i<in_links.length; i++) {
    		new_data_links.push(in_links[i]);
    	}
    	var out_links = freebu.force.communities[datum.group].out_links;
    	var member_ids = freebu.force.communities[datum.group].members;
    	var other_nodes = freebu.force.get_other_nodes(member_ids);
    	var super_links = []; 
    	for(var i=0; i<out_links.length; i++) {
    		var out_link = out_links[i];
    		var member_node = out_link.source;
    		var out_node = out_link.target;
    		if(member_ids.indexOf(out_link.target.id) != -1) {
    			member_node = out_link.target;
    			out_node = out_link.source;
    		}
    		for(var j=0; j<other_nodes.length; j++) {
    			var other_node = other_nodes[j];
    			if(other_node.nr_children == 0) {
    				if(other_node.id == out_node.id) {
    					new_data_links.push(out_link);
    				} 
				}//if the out_node is a normal node
				else{
					var other_members_ids = 
						freebu.force.communities[other_node.group].members;
					//if the super other_node's children contain the out_node
					if(other_members_ids.indexOf(out_node.id) != -1) {
						var slink = freebu.force.check_duplicate_super_link(super_links, other_node.id, member_node.id);
						if(slink == null) {
							var slink = {};
	    					slink.id="sl-"+other_node.id+"-"+member_node.id;
	    					slink.weight = 1;
	    					slink.source = freebu.data.nodes.indexOf(other_node);
	    					slink.target = freebu.data.nodes.indexOf(member_node);
	    					super_links.push(slink);
						}
						else{
							slink.weight=slink.weight+1; 
						}
					}	
				}//if the other_node is a super node
    		}//for each out_node
    	}//for each out_link
    	for(var i=0; i<super_links.length; i++) {
    		new_data_links.push(super_links[i]);
    	}
    	freebu.data.links = new_data_links;
		freebu.links = freebu.svg.select("#linkg").selectAll(".link")
    				.data(new_data_links, function(d){return d.id;});
    	freebu.links.exit().remove();
    	freebu.links.enter()
			.append("g")
			.attr("class", "link")
			.append("line")
			.style("stroke", "#999")
			.style("stroke-opacity", 0.6)
			.style("stroke-linecap", "round")
	  		.style("stroke-width", function(d){ return d.weight; });
	  	//
	    // --- update d3force ---------------------------------------------------
	    //
		freebu.force.d3force
			.nodes(freebu.data.nodes)
	      	.links(freebu.data.links).start();	
	    //
	    // --- update hulls ---------------------------------------------------
	    //
		freebu.force.update_hull_paths();
		freebu.force.hulls.remove();
		freebu.force.hulls = d3.select("#hullg").selectAll("path .hull")
			.data(freebu.force.hull_paths, function(d){return d.group;}); 
		if($('#'+freebu._TOGGLE_ID_COLLAPSE).prop('checked')) {
			freebu.force.hulls.enter().append("g")
				.attr("class", "hull")
				.append("path")
				.attr("d", function(d) {return freebu.force.curve(d.path);})
				.style("fill", function(d){return freebu.force.communities[d.group].color;})
				.on("mouseover", function(d,i) {
					freebu.force.focused_hull = d3.select(this);
				})
				.on("mouseout", function(d,i) {
					freebu.force.focused_hull = null;
				})
				.on("dblclick", freebu.force.hull_dblclick);
			freebu.force.hull_drag();	
		}//if toggle collapse is checked
	},
	collapse_hull: function(datum) {
		//
		// --- update nodes ---------------------------------------------------
		//
		var nmembers = freebu.force.communities[datum.group].members;
		var new_data_nodes = [];
    	freebu.nodes.each(function(d,i){
    		if(nmembers.indexOf(d.id) == -1) new_data_nodes.push(d);
    	});
    	var super_node = {};
    	super_node.id = "sn-"+datum.group;
    	super_node.group = datum.group;
    	super_node.nr_children = freebu.force.communities[datum.group].nodes.length;
    	super_node.name = "community ("+super_node.nr_children+")";
    	super_node.degree = 1;
    	new_data_nodes.push(super_node);
		freebu.data.nodes = new_data_nodes;
    	freebu.nodes = freebu.svg.select("#nodeg").selectAll(".node")
    				.data(new_data_nodes, function(d){return d.id;});
    	var vertices = [];
    	for(var i=0; i<freebu.force.hull_paths.length; i++) {
    		if(datum.group == freebu.force.hull_paths[i].group){
    			vertices = freebu.force.hull_paths[i].path; break;
    		}
    	}
    	var centroid = d3.geom.polygon(vertices).centroid();
    	freebu.nodes.enter().append("g")
			.attr("class", "node")
			.append("circle")
	    	.attr("r", function(d){ 
	    		d.fixed = true;
	    		return superscale(d.nr_children);
	    	})
	    	.attr("cx", function(d) {return d.x=centroid[0];})
	    	.attr("cy", function(d) {return d.y=centroid[1];})
	  		.style("fill", function(d) {
	  			return freebu.force.communities[datum.group].color;
	  		})
	  		.style("opacity", .9)
	  		.style(freebu.super_node_default_stroke_style)
	  		.on("dblclick", freebu.force.hull_dblclick);
	  	freebu.nodes.exit().remove();
	  	freebu.force.node_over_out();
		freebu.force.node_drag();
		//
	    // --- update links ---------------------------------------------------
	    //
		var lmembers = freebu.force.get_links_with_nodes(nmembers);
		var new_data_links = [];
		var super_links = [];
		freebu.links.each(function(d,i){
			if(lmembers.indexOf(d.id) == -1) { new_data_links.push(d); }
			else{
				// ----------
				var outside_id = false;
				var outside_node = {};
				if(nmembers.indexOf(d.source.id) == -1) {
					outside_id=d.source.id; outside_node=d.source;
				}
				else if(nmembers.indexOf(d.target.id) == -1) {
					outside_id=d.target.id; outside_node=d.target;
				}
				// --- if the link has a node that is outside the current community
				if(outside_id) { 
					var slink = freebu.force.check_duplicate_super_link(super_links, super_node.id, outside_id);
					// console.log(slink);
					if(slink == null) { 
						slink = {}; slink.weight=d.weight;
						slink.id = "sl-"+super_node.id+"-"+outside_id; 
						super_node.degree = super_node.degree + slink.weight;
						slink.source=new_data_nodes.indexOf(super_node); 
						slink.target=new_data_nodes.indexOf(outside_node);
						super_links.push(slink);
					}
					else{ 
						slink.weight=slink.weight+1; 
						super_node.degree = super_node.degree + slink.weight;
					}
				}	
			}
		});
		for(var i=0; i<super_links.length; i++) {
			new_data_links.push(super_links[i]);
		}
		freebu.data.links = new_data_links;
		freebu.links = freebu.svg.select("#linkg").selectAll(".link")
    				.data(new_data_links, function(d){return d.id;});
    	freebu.links.exit().remove();
    	freebu.links.enter().append("g")
			.attr("class", "link")
			.append("line")
	  		.style("stroke", "#999")
	  		.style("stroke-opacity", "0.6")
	  		.style("stroke-width", function(d){ return d.weight; })
	  		.style("stroke-linecap", "round");

	  	//
	    // --- update d3force ---------------------------------------------------
	    //
		freebu.force.d3force
			.nodes(freebu.data.nodes)
	      	.links(freebu.data.links)
	      	.start();	
	    //
	    // --- update hulls ---------------------------------------------------
	    //
		freebu.force.update_hull_paths();
		freebu.force.hulls
			.data(freebu.force.hull_paths, function(d){return d.group;})
			.exit().remove();
	},
	expand_all_hulls: function() { //console.log("expand all hulls...");
		freebu.force.collapsed = false;
		freebu.nodes.each(function(datum,i) {
			if(datum.id.indexOf('sn-') != -1) {
				var expanded = freebu.force.communities[datum.group].expanded;
				if(!expanded) {
					freebu.force.communities[datum.group].expanded = !expanded;
					freebu.force.expand_hull(datum);
				}
			}
		});
	},
	confineX: function(x) {
		/* the old version where transform is used*/
		// if(freebu.force.confined) {
		// 	var r = freebu.node_default_radius,
		// 		w = freebu.width;
		// 	return Math.max(r-freebu.dx, Math.min(w-freebu.dx-r, x));
		// }
		// else return x;

		if(freebu.force.confined) {
			var r = freebu.node_default_radius,
				w = freebu.width;
			return Math.max(r, Math.min(w-r, x));
		}
		else return x;
	},
	confineY: function(y) {
		/* the old version where transform is used*/
		// if(freebu.force.confined) {
		// 	var r = freebu.node_default_radius,
		// 		h = freebu.height;
		// 	return Math.max(r-freebu.dy, Math.min(h-r-freebu.dy, y));
		// }
		// else return y;

		if(freebu.force.confined) {
			var r = freebu.node_default_radius,
				h = freebu.height;
			return Math.max(r, Math.min(h-r, y));
		}
		else return y;
	}
};

