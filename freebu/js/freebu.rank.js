freebu.rank = {
	margin: {top:10,left:10,bottom:10,right:100},
	padding: 5,
	hypo_r: 20,
	init: function () {
		freebu.links.each(function(d,i){
			var line = d3.select(this).select('line');
			line.style('visibility', 'hidden');
		});
		freebu.nodes.each(function(d,i) {
			var circle = d3.select(this).select('circle');
			circle.transition(freebu.moderate_duration)
				.attr('r',function(){return freebu.node_rank_min_radius;});
		});
		freebu.rank.align_nodes();
	},
	align_nodes: function() {
		var left = freebu.rank.margin.left, top = freebu.rank.margin.top
			right = freebu.rank.margin.right, bottom = freebu.rank.margin.bottom;
		var padding = freebu.rank.padding;
		var hypo_r = freebu.rank.hypo_r;
		var count_x = 0, count_y = 0;
		freebu.nodes.each(function(d,i) { //console.log("");
			var node = d3.select(this);
			var circle = node.select('circle');
			var tx = left + hypo_r + count_x*(2*hypo_r+padding);
			count_x++; 
			var ty = top + hypo_r + count_y*(2*hypo_r+padding);
			if(tx > (freebu.width-right-hypo_r)){
				tx = left + hypo_r; count_x = 1; count_y++; 
				ty = top + hypo_r + count_y*(2*hypo_r+padding);
			}
			circle.transition(freebu.long_duration)
				.attr('cx',function() {return d.x=tx;})
				.attr('cy',function() {return d.y=ty;});
		});
	},
	sort_nodes: function(checkbox_id) {
		if(checkbox_id !== null) {
		}
		else{
			// $('#'+freebu._DIV_ID_FILTER).find( ":checkbox" )
			//check polynary checkboxes
			var polynary_checked = false;
			var numeric_checked = false;
			var binary_checked = false;
			$.each(freebu.filter.summary, function(key, obj) {
				if(key == 'polynary') {
					$.each(obj, function(sub_key, sub_obj) {
						if($('#'+sub_key).prop('checked')) {
							polynary_checked = true; return false;
						}
					});
				}
			});
			if(!polynary_checked) {
				//check numeric checkboxes
				$.each(freebu.filter.summary, function(key, obj) {
					if(key == 'numeric') {
						$.each(obj, function(sub_key, sub_obj) {
							if($('#'+sub_key).prop('checked')) {
								numeric_checked = true; return false;
							}
						});
					}
				});
				if(!numeric_checked) {
					//check binary checkboxes
					$.each(freebu.filter.diction, function(key, obj){
						$.each(obj, function(sub_key, sub_obj) {
							if(sub_obj.checked) {
								binary_checked = true; return false;
							}
						});
					});
				}
			}

			// console.log("polynary_checked:"+polynary_checked+"--numeric_checked:"+numeric_checked+"--binary_checked:"+binary_checked);
			if(polynary_checked) {
				freebu.nodes.sort(freebu.rank.polynary_compare);
				freebu.rank.align_nodes();
			}
			else if(numeric_checked) {
				freebu.nodes.sort(freebu.rank.numeric_compare);
				freebu.rank.align_nodes();
			}
			else if(binary_checked) {
				freebu.nodes.sort(freebu.rank.binary_compare);
				freebu.rank.align_nodes();
			}
		}//else
	},// --- sort_nodes ---
	polynary_compare: function(a,b) {
		return a.color < b.color ? -1 : a.color > b.color ? 1 : a.color >= b.color ? 0 : NaN;
	},
	numeric_compare: function(a,b) {
		return a.size < b.size ? 1 : a.size > b.size ? -1 : a.size >= b.size ? 0 : NaN;
	},
	binary_compare: function(a,b) {
		return a.dormant < b.dormant ? -1 : a.dormant > b.dormant ? 1 : a.dormant >= b.dormant ? 0 : NaN;
	},
}