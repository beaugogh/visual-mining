freebu.circles = {
	root: {},
	dragging: false,
	prev_positions: {},
	cur_positions:{},
	load_hierarchy: function (hi_path) {
		d3.json(hi_path, function(error, _root) {
			console.log("loading hierarchy");
			if (error) throw error;
			freebu.circles.root = _root;
			freebu.hierarchy.root = _root;
		});
	},//load_hierarchy
	load_hierarchy_data: function(_root) {
		console.log("loading hierarchy data");
		freebu.circles.root = _root;
		freebu.hierarchy.root = _root;
	},
	init: function() { 
		d3.selectAll('.node text').remove();
		freebu.nodes.each(function(d,i){
			// d3.select(this).select('circle').transition().style('fill','red');
			d3.select(this).append('text');
		});
		freebu.links.each(function(d,i){
			var line = d3.select(this).select('line');
			line.style('visibility', 'hidden');
		});
		var w = freebu.width, h = freebu.height;
		freebu.circles.divide(w/2,h/2, w,h, freebu.circles.root, true);
		// var circle = d3.selectAll('.node circle');
		// circle.transition().style('fill','red');		
	},
	divide: function(x,y,w,h,branch,enclosure) {
		if(branch.children) {
			var padding = 5;
			var toplevel = freebu.hierarchy.get_top_level_of_branch(branch);
			var pack = d3.layout.pack()
			    .padding(padding)
			    .size([w-padding, h-padding])
			    .value(function(d) { return 10; });
			var pos = pack.nodes(toplevel); //console.log(branch);
			var dx=0,dy=0;
			for(var i=0; i<pos.length; i++) {
				var dat = pos[i];
				if(dat.children && dat.name==branch.name) {
					dx = x-dat.x;
					dy = y-dat.y;
					if(enclosure) { //console.log("enclosure");
						d3.select("#hullg")
						.append("circle")
						.datum(dat)
						.attr("class", "hi-circle").attr("id", dat.name)
						.attr("cx", function(d) { return d.x=dat.x+dx;})
						.attr("cy", function(d) { return d.y=dat.y+dy;})
						.attr("r", dat.r)
						.style("fill-opacity", 0.25)
						.style("stroke", "grey")
						.style("stroke-opacity", 0.6)
						.style("fill", "white")
						.transition()
						.style("fill", "Coral");
					}
				}
			}
			//nodes
			for(var i=0; i<pos.length; i++) {
				var dat = pos[i];
				if(dat.children && dat.name !==branch.name) {
					var hi_circle = d3.select("#hullg")
						.datum(dat)	
						.append("circle");
					hi_circle	
						.on("mouseover", function(){ freebu.svg.style("cursor", "pointer");})
						.on("mouseout", function(){ freebu.svg.style("cursor", "move");})
						.on('click', freebu.circles.click_hi_circle)
						.attr("class", "hi-circle").attr("id", dat.name)
						.attr("cx", function(d) { return d.x=dat.x+dx;})
						.attr("cy", function(d) { return d.y=dat.y+dy;})
						.attr("r", dat.r)
						.style("fill-opacity", 0.25)
						.style("stroke", "grey")
						.style("stroke-opacity", 0.6)
						.style("fill", "white")
						.transition()
						.style("fill", "grey");
										
				}
				else{
					freebu.nodes.each(function(d,i){
						if(d.id == dat.id) {
							var node = d3.select(this);
							var circle = node.select("circle");
							circle.transition()
								.attr("cx", function() {return d.x=dat.x+dx;})
								.attr("cy", function() {return d.y = dat.y+dy;})
								.attr("r", function() {return d.r=dat.r;});
							node.select('text').text(function(d) {
								var idx = 2*d.r/8;
								return d.name.substring(0,idx);
							}).attr('dy', '5px')
							.attr("text-anchor", "middle")
							.on('mouseover', freebu.control.text_over)
			    			.on('mouseout', freebu.control.text_out)
			    			.transition()
							.attr('x', d.x).attr('y', d.y);

							return false;
						}
					});
				}
			}//for each position
			freebu.circles.listen_hi_circle_drag();
		}//if branch has children
	},//divide
	merge: function(x,y,w,h,branch) { 
		freebu.circles.clear_branch_hi_circles_except_self(branch);
		var desc = [];
		freebu.hierarchy.get_descendants(branch, desc); //console.log(desc);
		var tree = {}; tree.name = branch.name;
		tree.children = desc;
		var padding = 5;
		var pack = d3.layout.pack()
		    .padding(padding)
		    .size([w-padding, h-padding])
		    .value(function(d) { return 10; });
		var pos = pack.nodes(tree);
		var dx=0,dy=0;	
		for(var i=0; i<pos.length; i++) { 
			var dat = pos[i]; 
			if(dat.children) {
				dx = x- dat.x;
				dy = y- dat.y;
				break;
			}
		}//for each position
		for(var i=0; i<pos.length; i++) { 
			var dat = pos[i]; 
			if(!dat.children) {
				freebu.nodes.each(function(d,i){
					if(d.id == dat.id) { 
						var node = d3.select(this);
						var circle = node.select("circle");
						circle.transition()
							.attr("cx", function() {return d.x=dat.x+dx;})
							.attr("cy", function() {return d.y=dat.y+dy;})
							.attr("r", function() {return d.r=dat.r;});
						node.select('text').text(function(d) {
								var idx = 2*d.r/8;
								return d.name.substring(0,idx);
							})
						.transition()
						.attr('x', d.x).attr('y', d.y);
						return false;
					}
				});
			}
		}//for each position		
	},
	clear_branch_hi_circles: function(branch) {
		if(branch.children) {
			d3.select("#"+branch.name).remove();
			var children = branch.children;
			for(var i=0; i<children.length; i++) {
				freebu.circles.clear_branch_hi_circles(children[i]);
			}
		}
	},
	clear_branch_hi_circles_except_self: function(branch) {
		if(branch.children) {
			var children = branch.children;
			for(var i=0; i<children.length; i++) {
				freebu.circles.clear_branch_hi_circles(children[i]);
			}
		}
	},
	click_hi_circle: function(d) {
		// console.log(d.name + " is clicked");
		var cur_branch = freebu.hierarchy.search_branch_by_name(freebu.circles.root, d.name); //console.log(cur_branch);
		if(!d3.event.defaultPrevented) {
			if(cur_branch) {
				var w = 2*d.r, h = 2*d.r;
				if(d.divided) { //console.log("to merge " + d.name);
					freebu.circles.merge(d.x,d.y, w,h, cur_branch);
					d.divided = false;
				}
				else { //console.log("to divide " + d.name);
					freebu.circles.divide(d.x,d.y, w,h, cur_branch, false);
					d.divided = true;
				}
			}
		}
	},//click_hi_circle
	listen_hi_circle_drag: function() {
		var hi_circle_drag = d3.behavior.drag()
			.on('dragstart', hi_circle_dragstart)
			.on('drag', hi_circle_dragmove)
			.on('dragend', hi_circle_dragend);
		d3.selectAll('.hi-circle').call(hi_circle_drag);

		function hi_circle_dragstart(d,i) { 
			if(d.name !== 'comm') {
				d3.event.sourceEvent.stopPropagation();
				var cur_branch = freebu.hierarchy.search_branch_by_name(freebu.circles.root, d.name);
				var desc = {};
				desc.mid_nodes = []; desc.leaves = [];
				freebu.hierarchy.get_all_descendants(cur_branch, desc);
				
				freebu.circles.prev_positions = {};
				freebu.circles.cur_positions = {};
				freebu.circles.prev_positions[d.name] = [d.x,d.y];
				freebu.circles.cur_positions[d.name] = [d.x,d.y];
				for(var i=0; i<desc.mid_nodes.length; i++) { 
					var circ = d3.select('#'+desc.mid_nodes[i].name); 
					if(circ[0][0] !== null) {
						var mx = circ.attr('cx');
						var my = circ.attr('cy');
						freebu.circles.prev_positions[desc.mid_nodes[i].name]=[mx,my];
						freebu.circles.cur_positions[desc.mid_nodes[i].name]=[mx,my];
					}
				}
				for(var i=0; i<desc.leaves.length; i++) {
					var mx = d3.select('#c'+desc.leaves[i].id).attr('cx');
					var my = d3.select('#c'+desc.leaves[i].id).attr('cy');
					freebu.circles.prev_positions['node_'+desc.leaves[i].id]=[mx,my];
					freebu.circles.cur_positions['node_'+desc.leaves[i].id]=[mx,my];
				}
			}//if it is not the root community circle
		}
		function hi_circle_dragmove(d,i) { 
			if(!freebu.circles.dragging) {
				freebu.circles.dragging = true;
			}
	        for(var key in freebu.circles.cur_positions) {
	        	var cx = +freebu.circles.cur_positions[key][0];
	        	var cy = +freebu.circles.cur_positions[key][1];
	        	cx += +d3.event.dx;
	        	cy += +d3.event.dy;
	        	freebu.circles.cur_positions[key][0] = cx;
	        	freebu.circles.cur_positions[key][1] = cy;

	        	var obj = d3.select('#'+key); //console.log(circ);
	        	if(key.indexOf('node_') !== -1) {
	        		obj.select('circle').attr('cx', cx).attr('cy', cy);
	        		obj.select('text').attr('x', cx).attr('y', cy);
	        	}
	        	else{
	        		obj.attr('cx', cx);
	        		obj.attr('cy', cy);
	        	}
	        }//for
	        freebu.filter.check_list_mouse_over();
		}
		function hi_circle_dragend(d,i) {
			if(freebu.circles.dragging) {
				d3.event.sourceEvent.stopPropagation();
				freebu.circles.dragging = false;
				var persons = [];
				for(var key in freebu.circles.prev_positions) {
		        	var cx = +freebu.circles.prev_positions[key][0];
		        	var cy = +freebu.circles.prev_positions[key][1];

		        	var obj = d3.select('#'+key); 
		        	if(key.indexOf('node_') !== -1) { 
		        		var person = {};
		        		obj.each(function(d,i){
		        			person.id = d.id; person.name = d.name;
		        			persons.push(person);
		        		});
		        		obj.select('circle').transition()
		        			.attr('cx', cx).attr('cy', cy);
		        		obj.select('text').transition()
		        			.attr('x', cx).attr('y', cy);
		        	}
		        	else{
		        		obj.transition().attr('cx', cx).attr('cy', cy);
		        	}
		        }//for
		        if(freebu.filter.selected_list != null) { 
					for(var i=0; i<freebu.filter.list_data.length; i++) {
		    			var list = freebu.filter.list_data[i];
		    			if(list.id == freebu.filter.selected_list) {
		    				
		    				for(var j=0; j<persons.length; j++) {
		    					if(!freebu.filter.if_members_contain(list.members,persons[j].id)) {
									list.members.push(persons[j]);
		    					} 
		    				}//add members to the list
		    				break;
		    			}//find matching list
		    		}//for each list
		    		freebu.filter.selected_list = null;
				}
			}//if hi circle is dragged
		}//function hi_circle_dragend	
	}
}