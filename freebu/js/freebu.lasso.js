freebu.lasso = {
	p_nodes:{},
	p_positions:{},
	np_nodes:[],
	is_dragging:false,
	is_hull_dragging:false,
	lasso:{},
	hull_path_offset:15,
	curve:{},
	init: function() {
		freebu.lasso.curve = d3.svg.line().interpolate("cardinal-closed").tension(.85);
		freebu.lasso.lasso = d3.lasso()
					  .closePathDistance(200) // max distance for the lasso loop to be closed
				      .closePathSelect(true) // can items be selected by closing the path?
				      .hoverSelect(true) // can items by selected by hovering over them?
				      .area(d3.select("#lasso_area")) // area where the lasso can be started
				      .on("start",freebu.lasso.lasso_start) // lasso start function
				      .on("draw",freebu.lasso.lasso_draw) // lasso draw function
				      .on("end",freebu.lasso.lasso_end) // lasso end function	
				      .enabled(false);				      			
		freebu.svg.select("#hullg").call(freebu.lasso.lasso);
		freebu.svg.select("#hullg").on("click", freebu.lasso.lasso_click);
	},
	lasso_start: function() {
		if(freebu.is_lassoable) {
			d3.event.sourceEvent.stopPropagation();
			freebu.svg.selectAll(".lasso_hull").remove();
		}
	},
	lasso_draw: function() { 
		if(freebu.is_lassoable) {
			freebu.lasso.is_dragging = true;
			freebu.lasso.p_nodes = freebu.lasso.lasso.items()
					.filter(function(d) {return d.possible===true});
			freebu.lasso.p_nodes.style(freebu.lasso_node_stroke_style);

			freebu.lasso.np_nodes = freebu.lasso.lasso.items()
					.filter(function(d) {return d.possible===false})
			freebu.lasso.np_nodes.each(function(d,i){
				var circle = d3.select(this);
				if(d.nr_children == 0) circle.style(freebu.node_default_stroke_style);
				else circle.style(freebu.super_node_default_stroke_style);
			});
		}
	},
	lasso_end: function() {
		if(freebu.lasso.p_nodes.length>0 &&
			freebu.lasso.p_nodes[0].length>0) {
			var path = freebu.lasso.update_hull_path();
			freebu.svg.select("#hullg")
				.append("g")
				.attr("class", "lasso_hull")
				.append("path")
				.attr("d", path)
				.style("fill", "#E8E8E8 ")
				.style("stroke", "#606060")
				.style("stroke-width", "2px")
				.style("opacity", 0.6);
			freebu.lasso.lasso_hull_drag();	
		}
	},
	lasso_click: function() {
		if(freebu.is_lassoable) {
			if (freebu.lasso.is_dragging) {
				freebu.lasso.is_dragging = false;
				return;
			}
			else if(freebu.lasso.is_hull_dragging) {
				freebu.lasso.is_hull_dragging = false;
				return;
			}
			//reset node styles
			freebu.nodes.each(function(d,i){
				var circle = d3.select(this).select('circle');
				if(d.nr_children == 0) circle.style(freebu.node_default_stroke_style);
				else circle.style(freebu.super_node_default_stroke_style);
			});
			//remove selection hull
			freebu.svg.selectAll(".lasso_hull").remove();
		}
	},
	lasso_hull_drag: function() {
		var _drag = d3.behavior.drag()
			.on("dragstart", _dragstart)
	        .on("drag", _dragmove)
	        .on("dragend", _dragend);
		freebu.svg.selectAll(".lasso_hull").call(_drag);    

	    function _dragstart(datum) {
	    	d3.event.sourceEvent.stopPropagation();
	    	freebu.lasso.p_positions = {};
	    	freebu.lasso.p_nodes.each(function(d,i){
	    		freebu.lasso.p_positions[i] = [d.x,d.y];
	    	});
	    }
	    function _dragmove(datum) {
	    	freebu.lasso.is_hull_dragging = true;
	    	freebu.lasso.p_nodes.each(function(d,i){
				d.px += d3.event.dx;
	        	d.py += d3.event.dy;
	       	 	d.x += d3.event.dx;
	        	d.y += d3.event.dy; 
			});
			freebu.lasso.update_positions(false);
			freebu.filter.check_list_mouse_over();
	    }
	    function _dragend(d, i) {
	    	d3.event.sourceEvent.stopPropagation();
	    	if(freebu.filter.selected_list != null){
	    		for(var i=0; i<freebu.filter.list_data.length; i++) {
	    			var list = freebu.filter.list_data[i];
	    			if(list.id == freebu.filter.selected_list) {
	    				freebu.lasso.p_nodes.each(function(d,i){
	    					if(!freebu.filter.if_members_contain(list.members,d.id)) {
	    						var person = {};
		    					person.id = d.id; person.name = d.name;
								list.members.push(person);
	    					}
						});//add members to the list
						break;
	    			}//find the matching list
	    		}//for each list
	    		freebu.filter.selected_list = null;
		    	freebu.lasso.p_nodes.each(function(d,i){
		    		var pos = freebu.lasso.p_positions[i];
		    		d.x = pos[0], d.y = pos[1];
		    	});
		    	freebu.lasso.update_positions(true);
	    	}//if there is a selected list

	    }//function: _dragend()
	},
	update_hull_path: function() {
		var offset = freebu.lasso.hull_path_offset;
		var arr = [];
		freebu.lasso.p_nodes.each(function(d,i){
			arr.push([d.x-offset, d.y-offset]);
			arr.push([d.x-offset, d.y+offset]);
			arr.push([d.x+offset, d.y-offset]);
			arr.push([d.x+offset, d.y+offset]);
		});
		return freebu.lasso.curve(d3.geom.hull(arr));
	},
	update_positions: function(with_transition) {
		if(with_transition) {
			//link positions
			freebu.links.each(function(d,i){
				var link = d3.select(this).select("line");
				link.transition()
					.attr("x1", d.source.x)
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
				circle.transition().attr("cx",d.x).attr("cy",d.y);
				text.transition().attr("x",d.x).attr("y",d.y);
			});
			//update hull
			var path = freebu.lasso.update_hull_path();
			freebu.svg.selectAll(".lasso_hull").select("path").transition().attr("d", path);
		}//with transition
		else{
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
			//update hull
			var path = freebu.lasso.update_hull_path();
			freebu.svg.selectAll(".lasso_hull").select("path").attr("d", path);
		}//without transition
	},
	node_dblclick: function() { 
		freebu.nodes.on("dblclick", function(d,i){ 
			if(freebu.is_lassoable && d.nr_children == 0) { 
				freebu.nodes.each(function(datum){ datum.selected = false; });
				d.selected = true;
				freebu.links.each(function(link_d,lnk_i){
					var neighbor_id = null;
					if(link_d.source.id == d.id) {
						neighbor_id = link_d.target.id;
					}else if(link_d.target.id == d.id) {
						neighbor_id = link_d.source.id;
					}
					if(neighbor_id != null) {
						d3.selectAll('#c'+neighbor_id).each(function(datum,i){
							datum.selected = true;
						});
					}
				});//for each link
				freebu.lasso.p_nodes = d3.selectAll('.node circle')
					.filter(function(d) {return d.selected===true});
				freebu.lasso.p_nodes.style(freebu.lasso_node_stroke_style);	
				freebu.lasso.lasso_end();
			}//if it is a normal node
		});//for each node
	}// -- node_dblclick ---
}