Rowline = {
	vis: '',
	id: '',
	index: -1,
	x: 0,
	y: 0,
	w: 0,
	h: 1,
	min_h: 1,
	margin: 1,
	rect: '',
	fill_color: 'black',
	fill_opacity: .1,
	stroke_color: 'none',
	init: function(vis, index, y) {
		this.vis = vis;
		this.id = 'rowline_'+index;
		this.index = index;
		this.y = y;
		this.x += this.margin;
		this.w = vis.width;
		this.h = 6;

		var row_drag = d3.behavior.drag().origin(Object)
					.on('dragstart', this.on_row_drag_start)
	    			.on('drag',this.on_row_drag);
		this.rect = this.vis.g.append('rect')
					.datum(this)
					.attr('id', this.id)
					.attr('x',this.x)
					.attr('y',this.y)
					.attr('width',this.w)
					.attr('height',this.h)
					.attr("cursor", "ns-resize")
					.style('fill', this.fill_color)
					.style('fill-opacity', this.fill_opacity)
					.style('stroke', this.stroke_color)
					.call(row_drag);
	},
	on_row_drag_start: function() {
		d3.event.sourceEvent.stopPropagation();
		mcells.prev_y = d3.mouse(this)[1];
	},
	on_row_drag: function(d) { //console.log('row drag');
		if(d.index > 0) {
			var coords = d3.mouse(this);
			mcells.mouse_coords = coords;
			var prev_rl = d.vis.rowlines[d.index-1]; 
			var y_limit = prev_rl.y+prev_rl.h+prev_rl.min_h;
			var y_target = coords[1] - d.h/2;
			if(y_target > y_limit) {
				var shift = y_target - d.rect.attr('y');
				d.y = y_target;
				d.rect.attr('y',d.y);

				for(var i=d.index+1; i<d.vis.rowlines.length; i++) {
					var rl = d.vis.rowlines[i];
					var cur_y = +rl.y;
					rl.y = cur_y + shift;
					rl.rect.attr('y', rl.y);
				}//for
				var n = d.vis.rowlines.length-1;
				var bottom_y = d.vis.rowlines[n].y;
				d.vis.svg.attr('height', bottom_y+30);
				//update sections
				for (var i = d.index-1; i < d.vis.rowlines.length-1; i++) {
					var rltop = d.vis.rowlines[i];
					var rlbottom = d.vis.rowlines[i+1];
					var x = rltop.x;
					var y = rltop.y+rltop.h;
					var w = rltop.w;
					var h = rlbottom.y - y;
					var sect = d.vis.sections[i];
					sect.update_position(x,y,w,h);
				};
			}//if
			mcells.prev_y = coords[1];
		}//if
	}//on_row_drag
}