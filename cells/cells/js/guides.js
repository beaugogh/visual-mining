var Guides = {
	vis: {},
	nr_row_lines: 0,
	nr_col_lines: 0,
	row_header_lines: [],
	col_header_lines: [],
	row_lines: [],
	col_lines: [],
	row_line_height: .1,
	col_line_width: 6,
	row_header_line_width: 20,
	row_header_line_height: 4,
	col_header_line_width: 4,
	col_header_line_height: 20,
	minimum_cell_spacing: 4,//for both cell width and height
	fill_row_line: 'beige',
	fill_col_line: 'beige',
	fill_opacity_row_line: .5,
	fill_opacity_col_line: .5,
	init: function (cells) {
		this.vis = cells;
		this.nr_row_lines = cells.rows.length+1;
		this.nr_col_lines = cells.cols.length+1;
		this.row_header_lines = [];
		this.col_header_lines = [];
		this.row_lines = [];
		this.col_lines = [];

		var nrows = cells.rows.length;
		var nrowls = cells.rows.length+1;
		var ncols = cells.cols.length;
		var ncolls = cells.cols.length+1;
		var rhlw = Guides.row_header_line_width;
		var rhlh = Guides.row_header_line_height;
		var chlw = Guides.col_header_line_width;
		var chlh = Guides.col_header_line_height;
		var rlh = Guides.row_line_height;
		var clw = Guides.col_line_width;
		var min = Guides.minimum_cell_spacing;
		var row_w = cells.width-rhlw;
		var col_h = cells.height-chlh;
		
		var row_h = (col_h - nrowls*rlh) /nrows;
		if(row_h<(min+1)) { 
			// console.log('old svg h: '+cells.svg.attr('height'));
			row_h=(min+1);
			var newh = row_h*nrows + nrowls*rlh + chlh;
			cells.height = newh;
			cells.svg.attr('height', newh);
			col_h = newh - chlh; 
			// console.log('new svg h: '+cells.svg.attr('height'));
		}
		var col_w = (row_w -ncolls*clw) /ncols;
		if(col_w<min) {
			// console.log('old svg w: '+cells.svg.attr('width'));
			col_w=min;
			var neww = col_w*ncols + clw*ncolls + rhlw;
			cells.width = neww;
			cells.svg.attr('width', neww);
			row_w = neww - rhlw;
			// console.log('new svg w: '+cells.svg.attr('width'));
		}

		var row_drag = d3.behavior.drag().origin(Object)
					.on('dragstart', this.on_row_drag_start)
	    			.on('drag',this.on_row_drag);

		for(var i=0; i<nrowls; i++) {
			var y = chlh + (row_h + rlh) *i;
			var header_datum = {};
			header_datum.guides = this;
			header_datum.type = 'row_header_line';
			header_datum.index = i;//the index is useful for positioning 
			var header = cells.g.append('rect')
						.datum(header_datum)
						.attr('id','row_header_line_'+i)
						.attr('class', 'header_line row_header_line')
						.attr('x',0)
						.attr('y',y + rlh/2 - rhlh/2)
						.attr('width', rhlw)
						.attr('height', rhlh)
						.style('fill','black')
						.style('stroke','none')
						.style("fill-opacity", .5)
						.attr("cursor", "ns-resize")
						.call(row_drag);
			this.row_header_lines.push(header);
			var line = cells.g.append('rect')
						.attr('id','row_line_'+i)
						.attr('class', 'row_line')
						.attr('x', rhlw)
						.attr('y', y)
						.attr('width',row_w)
						.attr('height',rlh)
						.style('fill',Guides.fill_row_line)
						.style("fill-opacity", Guides.fill_opacity_row_line)
						.style('stroke','none')
						.style('stroke-width', 6)
						.style('stroke-opacity', .5);
						
			this.row_lines.push(line);			
		}

		var col_drag = d3.behavior.drag().origin(Object)
					.on('dragstart', this.on_row_drag_start)
	    			.on('drag',this.on_col_drag);

		for(var i=0; i<this.nr_col_lines; i++) {
			var x = (col_w + clw)*i + rhlw;
			var header_datum = {};
			header_datum.guides = this;
			header_datum.type = 'col_header_line';
			header_datum.index = i;//the index is useful for positioning
			var header = cells.g.append('rect')
						.datum(header_datum)
						.attr('id','col_header_line_'+i)
						.attr('class', 'header_line col_header_line')
						.attr('x',x + clw/2 - chlw/2)
						.attr('y',0)
						.attr('width', chlw)
						.attr('height', chlh)
						.style('fill','black')
						.style('stroke','none')
						.style("fill-opacity", .5)
						.attr("cursor", "ew-resize")
						.call(col_drag);
			this.col_header_lines.push(header);
			var line = cells.g.append('rect')
						.datum(header_datum)
						.attr('id','col_line_'+i)
						.attr('class', 'col_line')
						.attr('x', x)
						.attr('y', chlh)
						.attr('width', clw)
						.attr('height',col_h)
						.style('fill',Guides.fill_col_line)
						.style("fill-opacity", Guides.fill_opacity_col_line)
						.style('stroke','none')
						.style('stroke-width', 6)
						.style('stroke-opacity', .5)
						.attr("cursor", "ew-resize")
						.call(col_drag);
			this.col_lines.push(line);			
		}				
	},//init
	on_row_drag_start: function(datum) {
		d3.event.sourceEvent.stopPropagation();
	},
	on_row_drag: function(datum) {
		if(datum.index > 0) { 
			var coords = d3.mouse(this);
			var min = +Guides.minimum_cell_spacing;
			var rlh = +Guides.row_line_height;
			var rhlh = +Guides.row_header_line_height;
			var y_above = +datum.guides.row_lines[datum.index-1].attr('y'); 
			var y_limit = y_above + rlh + min; 
			var y_target = coords[1] - rlh/2; 
			if(y_target > y_limit) {
				var y_prev = +datum.guides.row_lines[datum.index].attr('y');
				datum.guides.row_header_lines[datum.index].attr('y', coords[1] - rhlh/2);
				datum.guides.row_lines[datum.index].attr('y', y_target);
				var shift = y_target - y_prev; 
				for(var i=datum.index+1; i<datum.guides.row_lines.length; i++) {
					var cur_y = +datum.guides.row_lines[i].attr('y');
					datum.guides.row_lines[i].attr('y', cur_y + shift);
					var cur_hy = +datum.guides.row_header_lines[i].attr('y');
					datum.guides.row_header_lines[i].attr('y', cur_hy + shift);
				}//for
				var n = datum.guides.nr_row_lines-1;  
				var new_h = +datum.guides.row_lines[n].attr('y') + rlh;
				datum.guides.vis.svg.attr('height', new_h+30);
				var chlh = +Guides.col_header_line_height; 		
				for(var i=0; i<datum.guides.col_lines.length; i++) {
					datum.guides.col_lines[i].attr('height', new_h-chlh);
				}
				/*
				 * adjust corrsponding cells
				 */
				for(var i=0; i<datum.guides.vis.all_cells.length; i++) {
					datum.guides.vis.all_cells[i].adjust_rect(false);
				}
			}//if
		}//if
	},//on_row_drag
	on_col_drag_start: function(datum) {
		d3.event.sourceEvent.stopPropagation();
	},
	on_col_drag: function(datum) { 
		// console.log(datum);
		if(datum.index > 0) {
			datum.guides.vis.mouse.down = true;
			var coords = d3.mouse(this);
			var min = +Guides.minimum_cell_spacing;
			var clw = +Guides.col_line_width;
			var chlw = +Guides.col_header_line_width;
			var x_left = +datum.guides.col_lines[datum.index-1].attr('x'); 
			var x_limit = x_left + clw + min;
			var x_target = coords[0] - clw/2; 
			if(x_target > x_limit) {
				var x_prev = +datum.guides.col_lines[datum.index].attr('x');
				datum.guides.col_header_lines[datum.index].attr('x', coords[0] - chlw/2);
				datum.guides.col_lines[datum.index].attr('x', x_target);
				var shift = x_target - x_prev;
				for(var i=datum.index+1; i<datum.guides.col_lines.length; i++) {
					var cur_x = +datum.guides.col_lines[i].attr('x');
					datum.guides.col_lines[i].attr('x', cur_x + shift);
					var cur_hx = +datum.guides.col_header_lines[i].attr('x');
					datum.guides.col_header_lines[i].attr('x', cur_hx + shift);
				}//for
				var n = datum.guides.nr_col_lines-1; 
				var new_w = +datum.guides.col_lines[n].attr('x');
				var default_w = +datum.guides.vis.default_svg_width;
				if(new_w+10 < default_w) {
					datum.guides.vis.svg.attr('width', default_w);
				}
				else{
					datum.guides.vis.svg.attr('width', new_w+10);
				}
				var rhlw = +Guides.row_header_line_width;
				for(var i=0; i<datum.guides.row_lines.length; i++) {
					datum.guides.row_lines[i].attr('width', new_w-rhlw);
				}
				/*
				 * adjust corrsponding cells
				 */
				for(var i=0; i<datum.guides.vis.all_cells.length; i++) {
					datum.guides.vis.all_cells[i].adjust_rect(false);
				}
				for(var i=0; i<datum.guides.vis.header_row.length; i++) {
					datum.guides.vis.header_row[i].adjust_rect(false);
				}
			}//if
		}//if
	},//on_col_drag
	shift_south: function(index, dist) {
		/*
		 * shift the row lines below the row line [index] 
		 * by the amount of |dist|
		 */		
		for(var i=index+1; i<this.row_lines.length; i++) {
			var cur_y = +this.row_lines[i].attr('y');
			this.row_lines[i]
				.attr('y', cur_y+dist);
			var cur_hy = +this.row_header_lines[i].attr('y');
			this.row_header_lines[i]
				.attr('y', cur_hy+dist);
		}
		var n = +this.nr_row_lines-1;  
		var new_h = +this.row_lines[n].attr('y');
		for (var i = 0; i < this.col_lines.length; i++) {
			this.col_lines[i].attr('height', new_h);
		};
		this.vis.svg.attr('height', new_h+this.row_line_height+30);
		this.adjust_all_cells(this.vis.all_cells, true);
	}, //shift_south
	shift_east: function(index, dist) {
		/*
		 * shift the col lines to the right of the col line [index] 
		 * by the amount of |dist|
		 */		
		for(var i=index+1; i<this.col_lines.length; i++) {
			var cur_x = +this.col_lines[i].attr('x');
			this.col_lines[i]
				.attr('x', cur_x+dist);
			var cur_hx = +this.col_header_lines[i].attr('x');
			this.col_header_lines[i]
				.attr('x', cur_hx+dist);
		}
		this.adjust_all_cells(this.vis.all_cells, true);
		for(var i=0; i<this.vis.header_row.length; i++) {
			this.vis.header_row[i].adjust_rect(true);
		}
		//update row lines
		var new_w = +this.col_lines[this.nr_col_lines-1].attr('x');
		var rhlw = +Guides.row_header_line_width;
		for(var i=0; i<this.row_lines.length; i++) {
			this.row_lines[i].attr('width', new_w-rhlw);
		}
	}, //shift_south
	adjust_all_cells: function(all_cells, transitioning) { //console.log(this);
		for(var i=0; i<all_cells.length; i++) {
			all_cells[i].adjust_rect(transitioning);
		}
	}
}