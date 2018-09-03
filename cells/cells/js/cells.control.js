cells.control = {
	vis: {},
	init: function(vis) {
		this.vis = vis;
		// ------ reset button
		var reset_anchor_id = 'reset_anchor';
		var reset_btn_id = 'reset_btn';
		var reset_btn_html = '<button type="button" class="btn btn-default btn-xs" id=\"'+reset_btn_id+'\" style="font-weight:bold;">Reset</button>';
		$(reset_btn_html).insertAfter('#'+reset_anchor_id);
		$('#'+reset_btn_id).click($.proxy(function () {
     		this.on_btn_reset();
 		},this));
		// ------ expand all button
		var expand_anchor_id = 'expand_anchor';
		var expand_btn_id = 'expand_btn';
		var expand_btn_html = '<button type="button" class="btn btn-default btn-xs" id=\"'+expand_btn_id+'\" style="font-weight:bold;">Expand</button>';
		$(expand_btn_html).insertAfter('#'+expand_anchor_id);
		$('#'+expand_btn_id).click($.proxy(function () {
     		this.on_btn_expand();
 		},this));
		// ------ shrink all button
		var shrink_anchor_id = 'shrink_anchor';
		var shrink_btn_id = 'shrink_btn';
		var shrink_btn_html = '<button type="button" class="btn btn-default btn-xs" id=\"'+shrink_btn_id+'\" style="font-weight:bold;">Shrink</button>';
		$(shrink_btn_html).insertAfter('#'+shrink_anchor_id);
		$('#'+shrink_btn_id).click($.proxy(function () {
     		this.on_btn_shrink();
 		},this));

		// ------ auto expansion
		var auto_expansion_anchor_id = 'auto_expansion_anchor';
		var auto_expansion_checkbox_id = 'auto_expansion_checkbox';
		var auto_expansion_html = '<label>Auto Expansion&nbsp;</label><input type="checkbox" id=\"'+auto_expansion_checkbox_id+'\">';
		$(auto_expansion_html).insertAfter('#'+auto_expansion_anchor_id);
		$('#'+auto_expansion_checkbox_id).change(function() {
			  // console.log('auto_expansion');
			  var checked = $(this).is(':checked');
			  vis.auto_expand = checked;
		});
		// ------ fixed header anchor
		var fixed_header_anchor_id = 'fixed_header_anchor';
		var fixed_header_checkbox_id = 'fixed_header_checkbox';
		var fixed_header_html = '<label>Fixed Header&nbsp;</label><input type="checkbox" id=\"'+fixed_header_checkbox_id+'\">';
		$(fixed_header_html).insertAfter('#'+fixed_header_anchor_id);
		$('#'+fixed_header_checkbox_id).change(function() {
			  // console.log('auto_expansion');
			  var checked = $(this).is(':checked');
			  vis.header_fixed = checked;
		});
		// ------ color coding
		// var color_coding_anchor_id = 'color_coding_anchor';
		// var color_coding_checkbox_id = 'color_coding_checkbox';
		// var color_coding_html = '<label>ColorCoding&nbsp;</label><input type="checkbox" id=\"'+color_coding_checkbox_id+'\">';
		// $(color_coding_html).insertAfter('#'+color_coding_anchor_id);
		// $('#'+color_coding_checkbox_id).change(function() {
		// 	  console.log('color coding ' + $(this).is(':checked'));
		// 	  var checked = $(this).is(':checked');
		// });
		
	},//init
	on_btn_reset: function() {
		// console.log('reset');
		this.reset_layout();
		// reset the colors
		for(var i=0; i<cells.all_cells.length; i++) { //console.log(i);
			cells.all_cells[i].color_mode = 'alphabet';
			cells.all_cells[i].rect
					.style('fill', Cell.fill_default);	
		}
		//reset the header menus
		for (var i=0; i<cells.header_row.length; i++) {
			var key = 'alphabet';
			var idx = i;
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
		}
		for (var i = 0; i < cells.cols[0].cells.length; i++) {
			cells.cols[0].cells[i].v_rect
					.style('fill', Cell.fill_v_color_default);	
		};
	},
	on_btn_shrink: function() {
		// console.log('shrink');
		this.shrink_layout();
	},
	on_btn_expand: function() {
		// console.log('expand');
		this.expand_layout();
	},
	reset_layout: function() {
		// console.log('shrink layout');
		/*
		 * re-arrange guides
		 */
		var cells = this.vis;
		cells.width = cells.default_svg_width;
		cells.height = cells.width/1.618;
		cells.svg.attr('width',cells.width)
				 .attr('height',cells.height);
		var guides = this.vis.guides;
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
			row_h=(min+1);
			var newh = row_h*nrows + nrowls*rlh + chlh;
			cells.height = newh;
			cells.svg.attr('height', newh);
			col_h = newh - chlh; 
		}
		var col_w = (row_w -ncolls*clw) /ncols; 
		if(col_w<min) {
			col_w=min;
			var neww = col_w*ncols + clw*ncolls + rhlw;
			cells.width = neww;
			cells.svg.attr('width', neww);
			row_w = neww - rhlw;
		}

		for(var i=0; i<guides.nr_row_lines; i++) {
			var y = chlh + (row_h + rlh) *i;
			if(i>0) {
				var mrow = cells.rows[i-1];
				mrow.fixed = false;
			}
			guides.row_header_lines[i]
					.attr('y',y + rlh/2 - rhlh/2);
			guides.row_lines[i]
					.attr('y', y)
					.attr('width',row_w);			
		}//for

		for(var i=0; i<guides.nr_col_lines; i++) {
			var x = (col_w + clw)*i + rhlw;
			guides.col_header_lines[i]
					.attr('x',x + clw/2 - chlw/2);
			guides.col_lines[i]
					.attr('x', x)
					.attr('height',col_h);				
		}//for
		/*
		 * adjust corrsponding cells and header cells
		 */
		for(var i=0; i<cells.all_cells.length; i++) { //console.log(i);
			cells.all_cells[i].adjust_rect(true);
		}
		for (var i=0; i<cells.header_row.length; i++) {
			cells.header_row[i].adjust_rect(true);
		}
	},//reset layout
	shrink_layout: function() {
		// console.log('shrink layout');
		/*
		 * re-arrange guides
		 */
		var cells = this.vis;
		var guides = this.vis.guides;
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
		var row_h = min+1;
		var col_h = cells.height-chlh;
		cells.height = row_h*nrows + nrowls*rlh + chlh;		
		cells.width = cells.default_svg_width;
		var row_w = cells.width-rhlw; 
		var col_w = (row_w -ncolls*clw) /ncols; 
		if(col_w<min) {
			col_w=min;
			var neww = col_w*ncols + clw*ncolls + rhlw;
			cells.width = neww;
			row_w = neww - rhlw;
		}
		cells.svg.attr('width',cells.width)
				 .attr('height',cells.height);

		for(var i=0; i<guides.nr_row_lines; i++) {
			var y = chlh + (row_h + rlh) *i;
			if(i>0) {
				var mrow = cells.rows[i-1];
				mrow.fixed = false;
			}
			guides.row_header_lines[i]
					.attr('y',y + rlh/2 - rhlh/2);
			guides.row_lines[i]
					.attr('y', y)
					.attr('width',row_w);			
		}//for

		for(var i=0; i<guides.nr_col_lines; i++) {
			var x = (col_w + clw)*i + rhlw;
			guides.col_header_lines[i]
					.attr('x',x + clw/2 - chlw/2);
			guides.col_lines[i]
					.attr('x', x)
					.attr('height',col_h);				
		}//for
		/*
		 * adjust corrsponding cells and header cells
		 */
		for(var i=0; i<cells.all_cells.length; i++) { //console.log(i);
			cells.all_cells[i].adjust_rect(true);
		}
		for (var i=0; i<cells.header_row.length; i++) {
			cells.header_row[i].adjust_rect(true);
		}
	},
	expand_layout: function() {
		// console.log('expand layout');
		/*
		 * re-arrange guides
		 */
		var cells = this.vis;
		var guides = this.vis.guides;
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

		var col_widths = [];
		var total_w = 0;
		for (var i = 0; i < cells.cols.length; i++) {
			var col_cells = cells.cols[i].cells;
			var max_width = cells.header_row[i].text_full_width*1.2; 
			for (var j = 0; j < col_cells.length; j++) {
				if(col_cells[j].text_full_width > max_width) {
					max_width = col_cells[j].text_full_width*1.2;
				}
			}
			col_widths.push(max_width);
			total_w += max_width;
		}

		cells.width = total_w + ncolls*clw + rhlw; //console.log(total_w);
		var leftover = 0;
		if(cells.width < cells.default_svg_width) {
			leftover = (cells.default_svg_width - cells.width)/ncols;
			cells.width = cells.default_svg_width;
		}
		cells.height = nrows*Cell.fisheye_h + nrowls*rlh + chlh + 30;
		cells.svg.attr('width',cells.width)
				 .attr('height',cells.height);

		var row_w = cells.width - rhlw - 10; 
		var row_h = Cell.fisheye_h;
		// var col_w = Cell.fisheye_w;
		var col_h = cells.height - chlh - 20;

		for(var i=0; i<guides.nr_row_lines; i++) {
			var y = chlh + (row_h + rlh) *i;
			if(i>0) {
				var mrow = cells.rows[i-1];
				var mcell = mrow.cells[0];
				mrow.fixed = true;
				mrow.south_shift = guides.minimum_cell_spacing - Cell.fisheye_h+1;
			}
			guides.row_header_lines[i]
					.attr('y',y + rlh/2 - rhlh/2);
			guides.row_lines[i]
					.attr('y', y)
					.attr('width',row_w);					
		}//for

		var accx = rhlw;
		for(var i=0; i<guides.nr_col_lines; i++) {
			var x = accx;
			guides.col_header_lines[i]
					.attr('x',x + clw/2 - chlw/2);
			guides.col_lines[i]
					.attr('x', x)
					.attr('height',col_h);
			if(i<guides.nr_col_lines-1) {
				accx += col_widths[i] + chlw + leftover;
			}							
		}//for
		/*
		 * adjust corrsponding cells and header cells
		 */
		for(var i=0; i<cells.all_cells.length; i++) { //console.log(i);
			cells.all_cells[i].adjust_rect(true);
		}
		for (var i=0; i<cells.header_row.length; i++) {
			cells.header_row[i].adjust_rect(true);
		}
	}
};
