var Cell = {
	vis: {},
	id: "",//the id of the cell	
	cmp: null,
	row_index: -1,
	col_index: -1,
	row: {},
	col: {},
	rect: {}, //the rectangle of the cell
	v_rect: null, //the small rectangle used for distinguishing different values in the same attribuet
	spacing: .2,
	color_mode: 'alphabet',//or nominal/numerical
	fill_color: '',
	fill_default: 'steelblue',
	fill_opacity: .6,
	fill_opacity_empty: .1,
	fill_v_color: 'black',//the fill color for the v_rect
	fill_v_color_default: 'black',//the default fill color for the v_rect
	// fill_highlight: 'ivory',
	fisheye_w: 150,
	fisheye_h: 26,
	highlight_guides: true,
	expand_timeout: "",
	shrink_timeout: "",
	value: 0, //the value of the cell (numerical)
	text: "", //the text of the cell (nominal)
	text_obj: {},	
	text_shown: "",
	text_full_width: 0,
	font_size: 14,
	x: 0,
	y: 0,
	w: 0,
	h: 0,
	init: function (vis, id, row_index, col_index, text) {
		this.vis = vis;
		this.id = id;
		this.row_index = row_index;
		this.col_index = col_index;
		this.text = text;
	},
	init_rect: function() { 
		this.row = this.vis.rows[this.row_index]; 
		this.col = this.vis.cols[this.col_index];
		//initilize rectangle
		var spacing = this.spacing;
		var left = +this.vis.guides.col_lines[+this.col_index].attr('x')+spacing;
		var right = +this.vis.guides.col_lines[+this.col_index+1].attr('x')-spacing;
		var top = +this.vis.guides.row_lines[+this.row_index].attr('y')+spacing;
		var bottom = +this.vis.guides.row_lines[+this.row_index+1].attr('y')-spacing;

		var h_spacing = +this.vis.guides.col_lines[+this.col_index].attr('width');
		var v_spacing = +this.vis.guides.row_lines[+this.row_index].attr('height');
		left = left + h_spacing; this.x = left;
		top = top + v_spacing; this.y = top;
		var w = right-left; this.w = w;
		var h = bottom-top; this.h = h;

		this.rect = this.vis.g.append('rect')
					.datum(this)
					.attr('id', this.id)
					.attr('x',left)
					.attr('y',top)
					.attr('width',w)
					.attr('height',h)
					.style('fill',this.fill_default)
					.style('fill-opacity', function(d){
						if(d.text == "") {
							return Cell.fill_opacity_empty;
						}
						else return Cell.fill_opacity;
					})
					.style('stroke','none')
					.on('mouseover', this.on_mouseover)
					.on('mouseout', this.on_mouseout)
					.on('click', this.on_click)
					.on('mousedown', this.on_mousedown);

		this.text_obj = this.vis.g.append('text')
					.datum(this)
					.attr('id', this.id+'_text')
					.attr('class', 'cell_text')
					.style('font-family', 'palatino')
					// .style('font-weight', 'bold')
					.style('text-anchor', 'middle')
					.style('font-size', this.font_size)
					.text(this.text)
					.on('mouseover', this.on_mouseover)
					.on('mouseout', this.on_mouseout)
					.on('click', this.on_click)
					.on('mousedown', this.on_mousedown);

		this.text_full_width = this.text_obj[0][0].getBBox().width;	
		this.fisheye_w = this.text_full_width*1.2;
		this.adjust_text();
					
		if(this.h < this.font_size) {
			this.text_obj.style('visibility', 'hidden');
		}		
	},
	init_v_rect: function() {
		var w = Guides.minimum_cell_spacing+2;
		var h = this.h;
		var x = this.x + this.w - w;
		var y = this.y;
		this.v_rect = this.vis.g.append('rect')
					.attr('x',x)
					.attr('y',y)
					.attr('width',w)
					.attr('height',h)
					.style('fill', Cell.fill_v_color_default)
					.style('fill-opacity', Cell.fill_opacity*1.2)
					.style('stroke','none');
	},
	adjust_rect: function(transitioning) {
		//adjust rectangle's position and size
		var spacing = this.spacing;
		// var left = +this.vis.guides.col_lines[+this.col_index].attr('x')+spacing;
		// var right = +this.vis.guides.col_lines[+this.col_index+1].attr('x')-spacing;
		// var top = +this.vis.guides.row_lines[+this.row_index].attr('y')+spacing;
		// var bottom = +this.vis.guides.row_lines[+this.row_index+1].attr('y')-spacing;
		var left = +this.vis.guides.col_lines[+this.col_index].attr('x')+spacing;
		var right = +this.vis.guides.col_lines[+this.col_index+1].attr('x')-spacing;
		var top = +this.vis.guides.row_lines[+this.row_index].attr('y')+spacing;
		var bottom = +this.vis.guides.row_lines[+this.row_index+1].attr('y')-spacing;

		var h_spacing = +this.vis.guides.col_lines[+this.col_index].attr('width');
		var v_spacing = +this.vis.guides.row_lines[+this.row_index].attr('height');
		left = left + h_spacing;
		top = top + v_spacing;
		var w = right - left;
		var h = bottom-top;
		if(w > 0 && h > 0) {
			this.x = left;
			this.y = top;
			this.w = w;
			this.h = h; 
			if(transitioning) {
				this.rect.transition()
					.attr('x',left)
					.attr('y',top)
					.attr('width',w)
					.attr('height',h);
			}
			else{
				this.rect
					.attr('x',left)
					.attr('y',top)
					.attr('width',w)
					.attr('height',h);
			}
			this.adjust_text();
		}	

		if(this.cmp !== null) {
			this.adjust_v_rect();
		}	
	},//adjust_rect
	adjust_v_rect: function() {
		var h = this.h;
		var x = this.x + this.w - this.vis.guides.minimum_cell_spacing;
		var y = this.y;
		this.v_rect
				.attr('x',x)
				.attr('y',y)
				.attr('height',h);
	},
	adjust_text: function() {
		if(this.h > this.font_size) {
			this.text_obj.style('visibility', 'visible');
		}
		else {
			this.text_obj.style('visibility', 'hidden');
		}

		var remaining = 9;
		if(this.text_full_width > this.w) {
			var new_w = this.w - remaining;
			if(new_w >0) {
				var idx = new_w/(this.font_size-2);
				this.text_shown = this.text.substring(0,idx);
				this.text_shown += '...';
			}
			else {
				this.text_shown = '...';
			}
		}
		else{
			this.text_shown = this.text;
		}
		this.text_obj.transition()
				.attr('x', this.x+this.w/2)
				.attr('y', this.y)
				.attr('dy', this.h/2+4)
				.text(this.text_shown);	
	},
	on_mouseover: function(datum) { 
		// console.log('mouse over ' + datum.row_index+", " +datum.h);
		if(!datum.vis.mouse.down) {
			datum.rect.style('fill-opacity', function(d){
				if(d.text == "") {
					return +Cell.fill_opacity_empty/2;
				}
				else return +Cell.fill_opacity/2;
			});
			if(Cell.highlight_guides) {
				var left_i = datum.col_index;
				var right_i = datum.col_index+1;
				var top_i = datum.row_index;
				var bottom_i = datum.row_index+1;
				// datum.vis.guides.col_lines[left_i]
				// 		.style('stroke','red')
				// 		.style('stroke-width', 2);
				// datum.vis.guides.col_lines[right_i]
				// 		.style('stroke','red')
				// 		.style('stroke-width', 2);		
				datum.vis.guides.row_lines[top_i]
						.style('stroke','red')
						.style('stroke-width', 2);
				datum.vis.guides.row_lines[bottom_i]
						.style('stroke','red')
						.style('stroke-width', 2);
			}	
			if(datum.vis.auto_expand) datum.expand(datum);
		}
	},
	on_mouseout: function(datum) {

		// if(datum.color_mode == 'alphabet') {
		// 	datum.rect.style('fill',datum.fill_default);
		// }
		// else {
		// 	datum.rect.style('fill',datum.fill_color);
		// }
		
		datum.rect.style('fill-opacity', function(d){
			if(d.text == "") {
				return Cell.fill_opacity_empty;
			}
			else return Cell.fill_opacity;
		});
		if(Cell.highlight_guides) {
			var left_i = datum.col_index;
			var right_i = datum.col_index+1;
			var top_i = datum.row_index;
			var bottom_i = datum.row_index+1;
			// datum.vis.guides.col_lines[left_i]
			// 		.style('stroke','none')
			// 		.style('stroke-width', 6);
			// datum.vis.guides.col_lines[right_i]
			// 		.style('stroke','none')
			// 		.style('stroke-width', 6);		
			datum.vis.guides.row_lines[top_i]
					.style('stroke','none')
					.style('stroke-width', 6);
			datum.vis.guides.row_lines[bottom_i]
					.style('stroke','none')
					.style('stroke-width', 6);
		}
		if(datum.vis.auto_expand) datum.shrink(datum);
	},
	on_click: function(datum) {
		// d3.event.sourceEvent.stopPropagation();
		// d3.event.preventDefault();
		
		// console.log('click');
		// datum.col.fixed = !datum.col.fixed;
		// console.log(datum.row.fixed + ": " +datum.row.get_text());
		if(!datum.vis.auto_expand) {
			if(datum.row.fixed) {
				datum.row.fixed = !datum.row.fixed;
				datum.shrink(datum);
			}
			else {
				datum.expand(datum);
				datum.row.fixed = !datum.row.fixed;
			}
		}
		else {
			datum.row.fixed = !datum.row.fixed;
		}
		// console.log(datum.row.fixed);
	},
	on_mousedown: function(datum) {
		// console.log('mousedown: ' + datum.id);
		datum.vis.starting_row = datum.row;
	},
	expand: function(datum) { 
		if(!datum.vis.mouse.down) {
			var w = datum.w;
			if(w < datum.fisheye_w && !datum.col.fixed) { 
				var dist = datum.fisheye_w - w;
				datum.vis.guides.shift_east(datum.col_index, dist);
				datum.col.east_shift = -dist;
			}
			var h = datum.h;
			if(h < datum.fisheye_h && !datum.row.fixed) {
				// var dist = datum.fisheye_h - h;
				var dist = datum.fisheye_h - datum.vis.guides.minimum_cell_spacing;
			 	datum.vis.guides.shift_south(datum.row_index, dist);
			 	datum.row.south_shift = -dist;
			}
		}		
	},//function expand
	shrink: function(datum) {
		if(datum.col.east_shift !== 0 && !datum.col.fixed) {
			datum.vis.guides.shift_east(datum.col_index, datum.col.east_shift);
			datum.col.east_shift = 0;
		}
		if(datum.row.south_shift !== 0 && !datum.row.fixed) { 
			datum.vis.guides.shift_south(datum.row_index, datum.row.south_shift);
			datum.row.south_shift = 0;
		}
	}
}

var HeaderCell = {
	vis: {},
	x: 0,
	y: 0,
	w: 0,
	h: 0,
	id: "",
	index: -1,
	rect: {},
	padding: 1,
	text: "",
	text_obj: {},
	text_shown: "",
	text_full_width: 0,
	font_size: 14,
	menu_obj: {},
	which_coding: 'alphabet',//or alphabet, numerical
	init: function (vis, index, x, y, w, h, text) { 
		this.vis = vis;
		this.index = index;
		this.id = 'header_'+index;
		this.x = +x;
		this.y = +y;
		this.w = +w;
		this.h = +h;
		this.text = text;
		this.rect = vis.g.append('rect')
			.datum(this)
			.attr('id', this.id)
			.attr('class', 'header')
			.attr('x', x)
			.attr('y', y)
			.attr('width', w)
			.attr('height', h)
			.attr("cursor", "pointer")
			.style('fill', 'steelblue')
			.style('fill-opacity', .8)
			.style('stroke', 'white')
			.style('stroke-width', 2)
			.on('mouseover', this.on_mouseover)
			.on('mouseout', this.on_mouseout)
			.on('click', this.on_click);
			
		this.text_obj = vis.g.append('text')
					.datum(this)
					.attr('id', this.id+'_text')
					.attr('class', 'header_text')
					.attr('x', x+w/2)
					.attr('y', y)
					.attr('dy', this.font_size)
					.attr("cursor", "pointer")
					.style('font-family', 'impact')
					.style('text-anchor', 'middle')
					.style('font-size', this.font_size)
					.text(text)
					.on('mouseover', this.on_mouseover)
					.on('mouseout', this.on_mouseout)
					.on('click', this.on_click);
		this.text_full_width = this.text_obj[0][0].getBBox().width;

		this.menu_obj = {
        	hideAfterClick: true,

			callback: function(key, element) {
				var hc_obj = this.cells.header_row[index];
				HeaderCell.on_menu(hc_obj, key, element);
			},
			menu: {
				'alphabet': {
				  title: 'Alphabet',
				  icon: 'check-circle-o'
				},
				'nominal': {
				  title: 'Nominal',
				  icon: 'circle-o'
				},
				// 'void': 'separator',
				// 'numerical': {
				//   title: 'Numerical',
				//   icon: 'circle-o'
				// },
			}//menu
        };//menu_obj
		$('#'+this.id).nuContextMenu(this.menu_obj);
	},
	adjust_rect: function(transitioning) {
		var spacing = this.padding;
		var left = +this.vis.guides.col_lines[+this.index].attr('x')+spacing;
		var right = +this.vis.guides.col_lines[+this.index+1].attr('x')-spacing;
		var h_spacing = +this.vis.guides.col_lines[+this.index].attr('width');
		left = left + h_spacing;
		var w = right - left;
		if(w > 0) {
			this.x = left; this.width = w;
			if(transitioning) {
				this.rect.transition().attr('x',left).attr('width',w);
			}
			else{
				this.rect.attr('x',left).attr('width',w);
			}
			this.adjust_text(left, w);
		}//if
	},
	adjust_text: function(x,w) {
		var remaining = 9;
		if(this.text_full_width > w) {
			var new_w = w - remaining;
			if(new_w >0) {
				var idx = new_w/(this.font_size-2);
				this.text_shown = this.text.substring(0,idx);
				this.text_shown += '...';
			}
			else {
				this.text_shown = '...';
			}
		}
		else{
			this.text_shown = this.text;
		}
		this.text_obj.transition()
				.attr('x', x+w/2)
				.text(this.text_shown);		
	},
	maintain_header_position: function(shift) {
		var new_y =this.y + shift;
		this.rect.transition().duration(100).attr('y', new_y);
		this.text_obj.transition().duration(100).attr('y', new_y);
	},
	on_mouseover: function(datum) {
		datum.rect.style('fill-opacity', .6);
	},
	on_mouseout: function(datum) {
		datum.rect.style('fill-opacity', .8);
	},
	on_click: function(datum) {
		// console.log(datum);
		if(cells.keydown_code !== 18) { //if the pressed key is not the alt key
			datum.vis.cols[datum.index].sort();
		}
		else {
			// console.log('alt key is down');
			datum.vis.cols[datum.index].secondary_sort();
		}
	    
	},
	on_menu: function(obj, key, element) {
		obj.which_coding = key;
		var idx = obj.index;
		if(key == 'alphabet') {
			obj.vis.cols[idx].color_alphabet();
		}
		else if(key == 'nominal') {
			if(idx == 0) obj.vis.cols[idx].color_comparison_nominal();
			else obj.vis.cols[idx].color_nominal();			
		}
		else if(key == 'numerical') {
			obj.vis.cols[idx].color_numerical();
		}
		
		$('#header_menu_'+idx+' li').each(function(i, el) {
			var dkey = $(this).attr('data-key');
			if(dkey == key) {
				var iobj = $(this).find('i');
				iobj.attr('class', 'fa fa-check-circle-o');
			}
			else{
				var iobj = $(this).find('i');
				iobj.attr('class', 'fa fa-circle-o');
			}
		});
	}//on_menu

}