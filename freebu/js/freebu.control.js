freebu.control = {
	current_view: freebu._RADIO_ID_NETWORK_VIEW,
	init: function() {
		freebu.control.add_network_toggles();
		//view selection, mouse click behavior
		$('#'+freebu._RADIO_ID_NETWORK_VIEW).click(function() {
			if(freebu.control.current_view !== $('#'+freebu._RADIO_ID_NETWORK_VIEW).attr("id")) {
			  freebu.control.current_view = $('#'+freebu._RADIO_ID_NETWORK_VIEW).attr("id");
			  freebu.control.remove_rank_toggles();
			  freebu.control.add_network_toggles();

	    	  freebu.links.each(function(d,i){
				    var line = d3.select(this).select('line');
			     	line.style('visibility', 'visible');
			  });
			  freebu.nodes.each(function(d,i){
			  		var circle = d3.select(this).select('circle');
			  		circle.attr('r',freebu.node_default_radius);
			  });
			  // freebu.force.d3force.start();
			  $('#'+freebu._TOGGLE_ID_RUN).bootstrapToggle("on");
			  freebu.control.remove_hierarchy_circles();
			}   
		});
		$('#'+freebu._RADIO_ID_CIRCLE_VIEW).click(function() {
			if(freebu.control.current_view !== $('#'+freebu._RADIO_ID_CIRCLE_VIEW).attr("id")) {
			  freebu.control.current_view = $('#'+freebu._RADIO_ID_CIRCLE_VIEW).attr("id");
			  freebu.control.remove_network_toggles();
			  freebu.control.remove_rank_toggles();
			  freebu.circles.init();
			}    
		});
		$('#'+freebu._RADIO_ID_RANK_VIEW).click(function() {
			if(freebu.control.current_view !== $('#'+freebu._RADIO_ID_RANK_VIEW).attr("id")) {
			  freebu.control.current_view = $('#'+freebu._RADIO_ID_RANK_VIEW).attr("id");
			  freebu.control.remove_network_toggles();
			  freebu.control.add_rank_toggles();
			  freebu.rank.init();
			  freebu.control.remove_hierarchy_circles();
			}    
		});
		//reset button
		$('#'+freebu._BUTTON_ID_RESET).click(function() {
			if(freebu.control.current_view == freebu._RADIO_ID_NETWORK_VIEW) {
			  freebu.reset_nodes();
			  freebu.force.resume();
			  $('#'+freebu._TOGGLE_ID_RUN).bootstrapToggle("on");
			}
			else if(freebu.control.current_view == freebu._RADIO_ID_CIRCLE_VIEW) {
				freebu.reset_nodes();
			}
			else if(freebu.control.current_view == freebu._RADIO_ID_RANK_VIEW) {
				freebu.reset_nodes();
			}
		});
		//toggle run button
		$('#'+freebu._TOGGLE_ID_RUN).change(function() {
			if($('#'+freebu._TOGGLE_ID_RUN).prop('checked')) {
				freebu.force.nr_ticks = 0;
			  	freebu.force.resume(); 
			}
			else{
			  	freebu.force.stop();
			}
		});
		//toggle label button
		$('#'+freebu._TOGGLE_ID_LABEL).change(function() {
			if(freebu.control.current_view !== freebu._RADIO_ID_CIRCLE_VIEW) {
				if($('#'+freebu._TOGGLE_ID_LABEL).prop('checked')) {
				  freebu.nodes.append("text")
				    // .attr("dx", 6)
				    // .attr("dy", "-0.25em")
				    .attr("text-anchor", "middle")
				    .style(freebu.node_text_default_style)
				    .text(function(d){ return d.name})
				    .on('mouseover', freebu.control.text_over)
				    .on('mouseout', freebu.control.text_out);
				  freebu.nodes.each(function(d){
				  		var tx = d3.select(this).select("circle").attr("cx");
				  		var ty = d3.select(this).select("circle").attr("cy");
				  		d3.select(this).select("text").attr("x", tx);
				  		d3.select(this).select("text").attr("y", ty);
				  	});
				}
				else{
				  freebu.svg.selectAll(".node text").remove();
				}
			}
		});
		//toggle lasso button
		$('#'+freebu._TOGGLE_ID_LASSO).change(function() {
			if($('#'+freebu._TOGGLE_ID_LASSO).prop('checked')) {
				freebu.is_lassoable = true; //console.log("is_lassoable: " + freebu.is_lassoable);
				freebu.svg.style("cursor", "cell");
				freebu.lasso.lasso.enabled(true);
				freebu.lasso.lasso.items(d3.selectAll(".node circle"));
				freebu.lasso.node_dblclick();
				// d3.select("#lasso_area")
				// 	.attr("x", -freebu.dx).attr("y", -freebu.dy);
			}
			else{
				freebu.is_lassoable = false; //console.log("is_lassoable: " + freebu.is_lassoable);
				freebu.svg.style("cursor", "move");
				freebu.lasso.lasso.enabled(false);
				freebu.nodes.each(function(d,i){
					d.possible = false;
					var circle = d3.select(this).select('circle');
					if(d.nr_children == 0) circle.style(freebu.node_default_stroke_style);
					else circle.style(freebu.super_node_default_stroke_style);
				});
				freebu.svg.selectAll(".lasso_hull").remove();
			}
		});
	},
	add_network_toggles: function() {
		// toggle-run
	    $('<input type="checkbox" id="toggle-run">').insertAfter('#'+freebu._LABEL_ID_TOGGLE_RUN);
	    $('#'+freebu._TOGGLE_ID_RUN).bootstrapToggle({
	        on:"running",      
	        off:"stopped"
	    });
		$('#'+freebu._TOGGLE_ID_RUN).change(function() {
			if($('#'+freebu._TOGGLE_ID_RUN).prop('checked')) {
			  freebu.force.resume();
			}
			else{
			  freebu.force.stop();
			}
		});
		$('#'+freebu._TOGGLE_ID_RUN).bootstrapToggle("on");
		//toggle-collapse
		$('<input type="checkbox" id="toggle-collapse">').insertAfter('#'+freebu._LABEL_ID_TOGGLE_COLLAPSE);
	    $('#'+freebu._TOGGLE_ID_COLLAPSE).bootstrapToggle({
	        on:"hulls on",      
	        off:"hulls off"
	    });
		$('#'+freebu._TOGGLE_ID_COLLAPSE).change(function() {
			if($('#'+freebu._TOGGLE_ID_COLLAPSE).prop('checked')) {
			  freebu.force.hulls_on(); 
			  //d3.select("#lasso_area").style("visibility","hidden");
			}
			else{
			  freebu.force.hulls_off(); 
			  //d3.select("#lasso_area").style("visibility","visible");
			}
		});
		//toggle-confine
		$('<input type="checkbox" id="toggle-confine">').insertAfter('#'+freebu._LABEL_ID_TOGGLE_CONFINE);
	    $('#'+freebu._TOGGLE_ID_CONFINE).bootstrapToggle({
	        on:"confined",      
	        off:"free-form"
	    });
		$('#'+freebu._TOGGLE_ID_CONFINE).change(function() {
			if($('#'+freebu._TOGGLE_ID_CONFINE).prop('checked')) {
			  freebu.force.confined = true;
			}
			else{
			  freebu.force.confined = false;
			}
		});
	},
	remove_network_toggles: function() {
		 $('#'+freebu._TOGGLE_ID_RUN).bootstrapToggle('destroy');
		 $('#'+freebu._TOGGLE_ID_RUN).remove();
		 if($('#'+freebu._TOGGLE_ID_COLLAPSE).prop('checked')) {
		 	freebu.force.hulls.remove();
		 }
		 $('#'+freebu._TOGGLE_ID_COLLAPSE).bootstrapToggle('destroy');
		 $('#'+freebu._TOGGLE_ID_COLLAPSE).remove();
		 $('#'+freebu._TOGGLE_ID_CONFINE).bootstrapToggle('destroy');
		 $('#'+freebu._TOGGLE_ID_CONFINE).remove();
		 
		 freebu.force.expand_all_hulls();
		 freebu.force.stop();

	},
	add_rank_toggles: function() {
		// toggle-run
	    $('<button type="button" class="btn btn-default" id="'+freebu._BUTTON_ID_SORT+'">sort</button>').insertAfter('#'+freebu._LABEL_ID_TOGGLE_RUN);
		$('#'+freebu._BUTTON_ID_SORT).on('click',function() {
			freebu.rank.sort_nodes(null);
		});
	},
	remove_rank_toggles: function() {
		 $('#'+freebu._BUTTON_ID_SORT).remove();
	},
	remove_hierarchy_circles: function() {
		d3.selectAll(".node text").remove();
		d3.selectAll(".hi-circle")
	  		.transition(freebu.moderate_duration)
	  		.style("fill-opacity", 0)
	  		.remove();
	},
	text_over: function(d, i) { 
		var circle = d3.select(this.parentNode).select('circle');
		freebu.svg.style("cursor","initial");
		if(d.nr_children == 0) {
			var r = circle.attr("r");
			circle.attr("r", 1.5*r);
		}
		circle.style(freebu.node_highlight_stroke_style);
		freebu.adjust_tip_direction(d);  
		freebu.tip.show(d,i);
	},
	text_out: function(d, i) {
		var circle = d3.select(this.parentNode).select('circle');
		if(freebu.is_lassoable) freebu.svg.style("cursor", "cell");
		else freebu.svg.style("cursor", "move");
		if(d.nr_children == 0) {
			var r = circle.attr("r");
			circle.attr("r", r/1.5);
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
};
