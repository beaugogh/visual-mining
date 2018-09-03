(function(window){
	'use strict';
	// --- define cells ---
	function define_cells() {
		var cells = {
			version: "0",
			//------ tsv column names
			CMP: "comparison",
			CMP_A: "comparison_attribute",
			CMP_L: "comparison_left",
			CMP_R: "comparison_right",
			CMP_S: "comparison_sign",
			CMP_P: "comparison_p",
			//------ index.html ids
			_DIV_VIS_ID: "div_vis",
			_DIV_FILTER_ID: "div_filter",
			_VIS_SVG_ID: "vis_svg",
			_VIS_G_ID: "vis_g",
			_VIS_INFO_G_ID: "vis_info_g",
			//------ mouse and key
			mouse: {},
			starting_row: {},//for dragging to shrink rows
			keydown_code: null,
			//------ colors
			d3color10: [ "#1f77b4", "#ff7f0e", "#2ca02c", "#d62728", "#9467bd", "#ffd700", "#e377c2", "#7f7f7f", "#bcbd22", "#17becf" ],
			d3color20: ["#1f77b4", "#aec7e8", "#ff7f0e", "#ffbb78", "#2ca02c", "#98df8a", "#d62728", "#ff9896", "#9467bd", "#c5b0d5", "#8c564b", "#c49c94", "#e377c2", "#f7b6d2", "#7f7f7f", "#c7c7c7", "#bcbd22", "#dbdb8d", "#17becf", "#9edae5"],
			d3color20b: ["#393b79","#5254a3","#6b6ecf","#9c9ede","#637939","#8ca252","#b5cf6b","#cedb9c","#8c6d31","#bd9e39","#e7ba52","#e7cb94","#843c39","#ad494a","#d6616b","#e7969c","#7b4173","#a55194","#ce6dbd","#de9ed6"],
			google10c: ["#3366cc", "#dc3912", "#ff9900", "#109618", "#990099", "#0099c6", "#dd4477", "#66aa00", "#b82e2e", "#316395", "#994499", "#22aa99", "#aaaa11", "#6633cc", "#e67300", "#8b0707", "#651067", "#329262", "#5574a6", "#3b3eac"],
			//------ components
			svg: "",			
			g: "",
			info_g: "",
			guides: "",
			width: 0,
			height: 0,
			prev_x: 0,
			prev_y: 0,
			prev_window_width: 0,
			prev_window_height: 0,
			default_svg_width: 800,
			data: "",
			header_fixed: false,
			initial_svg_top: 0,
			header_row: [], //array of rectangles for the header
			footer_row: {}, //a rectangle that stays at the bottom of the window
			rows: [],
			cols: [],
			all_cells: [],
			auto_expand: false,
			passed_rows: [],//when mouse drags, store the passed rows
			passed_cols: [],//when mouse drags, store the passed cols
			//------ initialize
			init: function(data) {
				console.log("Initialize cells... "+data.length+" rows");
				this.prev_window_width = $(window).width();
				this.prev_window_height = $(window).height();
				this.width = this.default_svg_width;
				this.height = this.width/1.618;
				this.mouse = {}; this.mouse.down = false; 
				this.passed_rows = [];
				var svg_drag = d3.behavior.drag().origin(Object)
	    				.on('drag',local_drag)
	    				.on('dragend',local_drag_end);
				this.svg = d3.select('#'+this._DIV_VIS_ID)
							.append('svg')
							.datum(this)
							.attr('id',this._VIS_SVG_ID)
							.attr('width',this.width)
							.attr('height',this.height)
							.on('mousedown', function(vis){ //console.log('mouse down');
								vis.mouse.down = true;
								vis.passed_rows = [];
								vis.passed_cols = [];
								vis.prev_x = d3.mouse(this)[0];
								vis.prev_y = d3.mouse(this)[1]; 
							})
							.on('mouseup', function(vis){
								vis.mouse.down = false; 
							})
							.call(svg_drag);
				this.g = this.svg.append('g').attr('id', this._VIS_G_ID);
				this.info_g = this.svg.append('g').attr('id', this._VIS_INFO_G_ID);
				window.onresize = resize;
				$( "body" ).keydown(function(event) { //console.log(cells.keydown_code);
					if(cells.keydown_code == null) cells.keydown_code = event.keyCode; 
				});
				$( "body" ).keyup(function(event) { //console.log(cells.keydown_code);
					cells.keydown_code = null; 
				});

				$.when(
				    // $.getScript( "js/dragrect.js" ),
				    $.getScript( "js/cell.js" ),
				    $.getScript( "js/row.js" ),
				    $.getScript( "js/col.js" ),
				    $.getScript( "js/guides.js" ),
				    $.Deferred(function( deferred ){
				        $( deferred.resolve );
				    })
				).done(function(){					
					init_rows_cols(cells, data);
					init_header_row(cells);
					init_footer_row(cells);
					// console.log(this);
					cells.control.init(window.cells);
				});//finish loading the scripts
			} //init
		};
		return cells;
	}//define_cells

	function init_rows_cols(cells, data) { //console.log(data);
		/*
		 * process the data, create cells, rows, cols
		 */
		var name_arr = []; name_arr.push(cells.CMP_A); 
		name_arr.push(cells.CMP_L); name_arr.push(cells.CMP_S); 
		name_arr.push(cells.CMP_R); name_arr.push(cells.CMP_P);
		var row_count = 0;
		var col_count = 0;
		cells.data = data;
		var col_header = [];
		for(var i=0; i<data.length; i++) {
			col_count = 0;
			var row = Object.create(Row);
			row.init(cells, 'row_'+row_count, row_count, "");

			var obj = cells.data[i];
			var cmp_cell = Object.create(Cell);
			var cmp_cell_id = 'cell_'+row_count+"_"+col_count;
			var cmp_cell_text = obj[cells.CMP_A]+': '+obj[cells.CMP_L]+' '+obj[cells.CMP_S]+' '+obj[cells.CMP_R];
			cmp_cell.init(cells, cmp_cell_id, row_count, col_count, cmp_cell_text);
			cmp_cell['cmp'] = {};
			cmp_cell.cmp[cells.CMP_A] = obj[cells.CMP_A];
			cmp_cell.cmp[cells.CMP_L] = obj[cells.CMP_L];
			cmp_cell.cmp[cells.CMP_S] = obj[cells.CMP_S];
			cmp_cell.cmp[cells.CMP_R] = obj[cells.CMP_R];
			cmp_cell.cmp[cells.CMP_P] = obj[cells.CMP_P];
			row.cells.push(cmp_cell); 
			col_count++;
			if(col_header.indexOf(cells.CMP) == -1) col_header.push(cells.CMP);

			for(var key in obj) { 
				if(obj.hasOwnProperty(key) && name_arr.indexOf(key) == -1) { 
					var other_cell = Object.create(Cell);
					var other_cell_id = 'cell_'+row_count+'_'+col_count;
					var other_cell_text = "";
					if(obj[key] !== "_") {
						other_cell_text = ""+obj[key]; 
					}
					other_cell.init(cells, other_cell_id, row_count, col_count, other_cell_text);
					row.cells.push(other_cell); 
					col_count++;
					if(col_header.indexOf(key) == -1) col_header.push(key);
				}
			}//for each col
			row_count++;
			cells.rows.push(row);
		}//for each row

		for(var i=0; i<cells.rows[0].cells.length; i++) {
			var col = Object.create(Col);
			col.init(cells, 'col_'+i, i, col_header[i]);
			for(var j=0; j<data.length; j++) {
				var c = cells.rows[j].cells[i];
				cells.all_cells.push(c);
				col.cells.push(c);
			}
			cells.cols.push(col);
		}//for each col
		// console.log(cells.rows);
		// console.log(cells.cols);

		/*
		 * init the comparison column and other columns' attribute_dict
		 */
		for (var k = 0; k < cells.cols.length; k++) { 
			var col = cells.cols[k];
			//for the comparison column
			if(k == 0) {
				var map = {};
				for (var i = 0; i < col.cells.length; i++) {
					var cmpa = col.cells[i].cmp[cells.CMP_A];
					var cmpl_r = col.cells[i].cmp[cells.CMP_L]+'\t'+col.cells[i].cmp[cells.CMP_R];
					var cmpr_l = col.cells[i].cmp[cells.CMP_R]+'\t'+col.cells[i].cmp[cells.CMP_L];
					if(!map[cmpa]) {
						map[cmpa] = [];
					}
					else{
						if(map[cmpa].indexOf(cmpl_r) == -1 && 
							map[cmpa].indexOf(cmpr_l) == -1) {
							map[cmpa].push(cmpl_r);
						}
					}
				}//for each cell
				col.attribute_dict = map;
			}
			//for the other columns
		 	else { 
		 		var categories = [];
				for (var i = 0; i < col.cells.length; i++) {
					if(col.cells[i].text !== "" && 
						categories.indexOf(col.cells[i].text) == -1) {
						categories.push(col.cells[i].text);
					}
				}
				col.attribute_dict = categories; 
		 	}
		};//for each col 
		

		/*
		 * init guides
		 */
		var guides = Object.create(Guides);
		guides.init(cells);
		cells.guides = guides;
		/*
		 * init cells' rectangles
		 */
		for(var i=0; i<cells.all_cells.length; i++) {
			var cell = cells.all_cells[i];
			cell.init_rect(); 
			if(cell.cmp !== null) {
				cell.init_v_rect();
			}
		}
	}//function init_data

	function init_header_row(vis) {
		var names = d3.keys(vis.data[0]);
		var headernames = []; headernames.push('comparison');
		for(var i=5; i<names.length; i++) {
			headernames.push(names[i]);
		}
		var padding = HeaderCell.padding;
		for(var i=0; i<vis.cols.length; i++) { 
			var hl = vis.guides.col_header_lines[i];
			var hl1 = vis.guides.col_header_lines[i+1];
			var hl_w = +hl.attr('width');
			var hl_h = +hl.attr('height');
			var x = +hl.attr('x') + hl_w + padding;
			var y = +hl.attr('y') + padding;
			var w = +hl1.attr('x') - padding - x;
			var h = hl_h - 2*padding;
			var text = headernames[i];
			var headercell = Object.create(HeaderCell);
			headercell.init(vis, i, x, y, w, h, text);
			vis.header_row.push(headercell);
		}

		//add ids to the header row right-click menus
		$('.nu-context-menu').each(function(i,div){
			div.id = 'header_menu_'+i;
		});
	}

	function init_footer_row(vis) {
		var bound = d3.select('#'+vis._VIS_SVG_ID)[0][0].getBoundingClientRect();
		// var w = bound.width;
		// var h = 16;
		// var x = bound.left; 
		// var y = bound.bottom - h;
		// vis.svg.append('rect')
		// 	.attr('id', 'footer')
		// 	.attr('x',x)
		// 	.attr('y',y)
		// 	.attr('width',w)
		// 	.attr('height',h)
		// 	.style('fill', 'red')
		// 	.style('stroke', 'white')
		// 	.style('stroke-width', 1);
		//mousewheel for header row and footer row
		window.addEventListener('scroll', scroll);
		vis.initial_svg_top = bound.top;//vis.initial_svg_top as reference point
	}

	function resize() { 
		var cur_w = $(window).width();
		if(cur_w !== cells.prev_window_width) {
			// console.log('width changing: ' + cur_w);
			cells.prev_window_width = cur_w;
		}
		var cur_h = $(window).height();
		if(cur_h !== cells.prev_window_height) {
			// console.log('height changing: ' + cur_h);
			cells.prev_window_height = cur_h;
		}
	}

	function scroll() { //console.log(cells.initial_svg_top);
		if(!cells.header_fixed) {
			var bound = d3.select('#'+cells._VIS_SVG_ID)[0][0].getBoundingClientRect();
			var shift = cells.initial_svg_top - bound.top;
			// var scroll = $(window).scrollTop(); 
			for (var i = 0; i < cells.header_row.length; i++) {
				cells.header_row[i].maintain_header_position(shift);
			}
		}
	}

	function local_drag(vis) {
		// console.log('local dragging');
		// var coords = d3.mouse(this);
		// for(var i=0; i<vis.rows.length; i++) {
		// 	var row = vis.rows[i];
		// 	var row_top = row.cells[0].y;
		// 	var row_bottom = row_top+row.cells[0].h;
		// 	if(coords[1] > row_top && coords[1] < row_bottom) {
		// 		if(vis.passed_rows.indexOf(i) == -1) {
		// 			vis.passed_rows.push(i); //console.log(row.id);
		// 		}
		// 		break;
		// 	}
		// }
		// for(var i=0; i<vis.cols.length; i++) {
		// 	var col = vis.cols[i];
		// 	var col_left = col.cells[0].x;
		// 	var col_right = col_left+col.cells[0].w;
		// 	if(coords[0] > col_left && coords[0] < col_right) {
		// 		if(vis.passed_cols.indexOf(i) == -1 ) {
		// 			vis.passed_cols.push(i);
		// 		}
		// 		break;
		// 	}
		// }	

		var coords = d3.mouse(this);
		var top = vis.prev_y, bottom = coords[1];
		if(coords[1] < vis.prev_y) {
			top = coords[1]; bottom = vis.prev_y;
		}
		var left = vis.prev_x, right = coords[0];
		if(coords[0] < vis.prev_x) {
			left = coords[0]; right = vis.prev_x;
		}
		for(var i=0; i<vis.rows.length; i++) {
			var cell0 = vis.rows[i].cells[0];
			var y = cell0.y, h = cell0.h;
			if(vis.passed_rows.indexOf(i) == -1) {
				if(y>top && y<bottom) vis.passed_rows.push(i);
				else if(y<top && (y+h)>top) vis.passed_rows.push(i);
			}
		}//for each row
		for(var i=0; i<vis.cols.length; i++) {
			var cell0 = vis.cols[i].cells[0];
			var x = cell0.x, w = cell0.w;
			if(vis.passed_cols.indexOf(i) == -1) {
				if(x>left && x<right) vis.passed_cols.push(i);
				else if(x<left && (x+w)>left) vis.passed_cols.push(i);
			}
		}//for each col
		// console.log(left+","+right+" and " + top+","+bottom);
		// console.log('passed rows:');
		// console.log(vis.passed_rows);
		// console.log('passed cols:');
		// console.log(vis.passed_cols);

		for(var i=0; i<vis.all_cells.length; i++) {
			var cell = vis.all_cells[i];
			if(vis.passed_rows.indexOf(cell.row_index) !== -1 &&
				vis.passed_cols.indexOf(cell.col_index) !== -1) {
				if(coords[0] > vis.prev_x) { //expand cols
					var w = cell.w;
					if(w < cell.fisheye_w && !cell.col.fixed) { 
						var dist = cell.fisheye_w - w;
						cell.vis.guides.shift_east(cell.col_index, dist);
						cell.col.east_shift = -dist;
					}
				}
				else { //shrink cols
					if(cell.col.east_shift !== 0 && !cell.col.fixed) {
						cell.vis.guides.shift_east(cell.col_index, cell.col.east_shift);
						cell.col.east_shift = 0;
					}
				}
				if(coords[1] > vis.prev_y) { //expand rows
					var h = cell.h;
					if(h < cell.fisheye_h && !cell.row.fixed) {
						var dist = cell.fisheye_h - h;
					 	cell.vis.guides.shift_south(cell.row_index, dist);
					 	cell.row.south_shift = -dist;
					}
					cell.row.fixed = true;
				}
				else { //shrink rows
					//if the cell is on a row that is above or equal the starting_row
					if(cell.row_index <= cell.vis.starting_row.index) {
						cell.row.fixed = false;
						if(cell.row.south_shift !== 0 && !cell.row.fixed) { 
							cell.vis.guides.shift_south(cell.row_index, cell.row.south_shift);
							cell.row.south_shift = 0;
						}
					}
				}//
			}//if cell is within passed region
		}//for each cell
	}

	function local_drag_end(vis) {
		// if (d3.event.defaultPrevented) return; 
	}

	if(typeof(cells) === 'undefined') {
		window.cells = define_cells();
	}
	else{
		console.log("The cells visualization is already defined.");
	}


	
})(window);