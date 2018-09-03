var Col = {
	vis: {},
	id: "",//the id of the column	
	header: "", //the header text
	index: -1, //the index of the column in the matrix, should be >=0
	cells: [], //the array of cells in the column
	east_shift: 0,
	direction: 'descending',//or ascending
	fixed: false,
	sorted_col_index: -1, //stores the index of the currently sorted column (i.e. the priminary col)
	attribute_dict: null, //diction that maps from attribute to values, for normal attribute, the map is a 1-level diction: vals, for the comparison attribute, the map is 2-level: attribute -> vals
	init: function (vis, id, index, header) {
		this.vis = vis;
		this.id = id;
		this.index = index;
		this.header = header;
		this.cells = [];		
	},
	sort: function() { 
		/*
		 * two types of sort: 
		 * (1) alphabetical sort for both 'alhpabet' and 'nominal' options; 
		 * (2) numerical sort for the 'numerical' option.
		 * three types of color coding: 
		 * (1) alphabet: binary color coding (default); 
		 * (2) nominal: polynary color coding;
		 * (3) numerical: gradient color coding.
		 */
		var type = this.vis.header_row[this.index].which_coding;
		var direction = this.direction;
		var comparator = function(a, b) { 
			if(type == 'nominal' || type == 'alphabet') {
				if(direction == 'ascending') {
					return d3.ascending(a.text, b.text);
				}
				else if(direction == 'descending') {
					return d3.descending(a.text, b.text);
				}
				else {
					console.log('direction is wrong, return null');
					return null;
				}
			}
			else if(type = 'numerical') {
				if(direction == 'ascending') {
					return d3.ascending(a.value, b.value);
				}
				else if(direction == 'descending') {
					return d3.descending(a.value, b.value);
				}
				else {
					console.log('direction is wrong, return null');
					return null;
				}
			}
			else {
				console.log('type is wrong, return null');
				return null;
			}
		}//comparator
		// comparator.call(this);

		//------ sort rows according to this column
		this.cells.sort(comparator);
		for(var i=0; i<this.cells.length; i++) {
			var new_row_index = i;
			var cell = this.cells[i];
			//adjust guides
			if(cell.row.fixed) {
				cell.vis.guides.shift_south(cell.row_index, cell.row.south_shift);
			}
			var cells_on_the_row = this.vis.rows[cell.row_index].cells;
			for(var j=0; j<cells_on_the_row.length; j++) {
				cells_on_the_row[j].row_index = new_row_index;
			}
			cell.row.index = new_row_index;

			//adjust guides
			if(cell.row.fixed) {
				cell.vis.guides.shift_south(cell.row_index, -cell.row.south_shift);
			}
		}//for

		//------ re-arrangel cols and rows ------
		for(var i=0; i<this.vis.cols.length; i++) {
			var new_cells = [];
			var col = this.vis.cols[i];
			for(var j=0; j<col.cells.length; j++) {
				var idx = col.cells[j].row_index;
				new_cells[idx] = col.cells[j];
			}
			col.cells = new_cells;
		}
		var new_rows = [];
		for(var i=0; i<this.vis.rows.length; i++) {
			var idx = this.vis.rows[i].index;
			new_rows[idx] = this.vis.rows[i];
		}
		this.vis.rows = new_rows;

		//------ adjust all cells ------
		for(var i=0; i<this.vis.all_cells.length; i++) {
			var cell = this.vis.all_cells[i];
			cell.adjust_rect(true);
		}

		// for(var i=0; i<this.vis.rows.length; i++) {
		// 	var s = '';
		// 	for(var j=0; j<this.vis.rows[i].cells.length; j++) {
		// 		var cell = this.vis.rows[i].cells[j];
		// 		s += '('+cell.row_index+','+cell.col_index+')';
		// 	}
		// 	console.log(s);
		// }

		// for(var i=0; i<this.vis.cols.length; i++) {
		// 	var s = '';
		// 	for(var j=0; j<this.vis.cols[i].cells.length; j++) {
		// 		var cell = this.vis.cols[i].cells[j];
		// 		s += '('+cell.row_index+','+cell.col_index+')';
		// 	}
		// 	console.log(s);
		// }

		if(direction == 'ascending') this.direction = 'descending';
		else if(direction = 'descending') this.direction = 'ascending';

		Col.sorted_col_index = this.index; 
	},//sort
	secondary_sort: function() { 
		// console.log('secondary sort for col ' + this.index + ' with priminary col = '+ Col.sorted_col_index);
		// console.log('priminary: '+ Col.sorted_col_index + ', secondary: ' + this.index);
		
		//when the user press down the control key meanwhile mouse click on a header cell,
		//the secondary sort is performed instead of the main sort, i.e. the sort above
		if(Col.sorted_col_index !== -1 && this.index !== Col.sorted_col_index) { 
			// console.log('start secondary soring..');
			var type = this.vis.header_row[this.index].which_coding;
			if(direction == 'ascending') this.direction = 'descending';
			else if(direction = 'descending') this.direction = 'ascending';
			var direction = this.direction;
			var comparator = function(a, b) { 
				if(type == 'nominal' || type == 'alphabet') {
					if(direction == 'ascending') {
						return d3.ascending(a.text, b.text);
					}
					else if(direction == 'descending') {
						return d3.descending(a.text, b.text);
					}
					else {
						console.log('direction is wrong, return null');
						return null;
					}
				}
				else if(type = 'numerical') {
					if(direction == 'ascending') {
						return d3.ascending(a.value, b.value);
					}
					else if(direction == 'descending') {
						return d3.descending(a.value, b.value);
					}
					else {
						console.log('direction is wrong, return null');
						return null;
					}
				}
				else {
					console.log('type is wrong, return null');
					return null;
				}
			}//comparator

			//------ sort rows according to each set of values of this column
			//construct the categories in the primary column
			var dict = this.vis.cols[Col.sorted_col_index].attribute_dict;
			var categories = [];
			if(Col.sorted_col_index == 0) {	
				for(var key in dict) {
					var vals = dict[key];
					for (var i = 0; i < vals.length; i++) {
						categories.push(key+'_'+vals[i]);
					};
				}
			}
			else {
				categories = dict;
				categories.push("");
			}
			// console.log(categories);
			//for each primary category, push the corresponding rows according to the cells in the secondary column
			var map = {};
			for (var j = 0; j < this.vis.rows.length; j++) {
				var row = this.vis.rows[j];
				var cell = row.cells[Col.sorted_col_index];
				var text = cell.text;
				if(Col.sorted_col_index == 0) {
					text = cell.cmp[this.vis.CMP_A]+'_'+cell.cmp[this.vis.CMP_L]+'\t'+cell.cmp[this.vis.CMP_R];
				}
				for (var i = 0; i < categories.length; i++) {
					var cat = categories[i];
					if(!map[cat]) map[cat] = [];
					if(text == cat) {
						var s_cell = row.cells[this.index];
						map[cat].push(s_cell);
						break;
					}					
				}//for each category
			};//for each row
			// console.log(map);
			
			for(var cat in map) {
				var cs = map[cat];//the cells in this category
				cs.sort(comparator);
				var offset = cs[0].row_index;
				for (var i = 1; i < cs.length; i++) {
					if(cs[i].row_index < offset) offset = cs[i].row_index;
				};
				for (var i = 0; i < cs.length; i++) {
					var new_row_index = i + offset;
					var cell = cs[i];
					//adjust guides
					if(cell.row.fixed) {
						cell.vis.guides.shift_south(cell.row_index, cell.row.south_shift);
					}
					var cells_on_the_row = this.vis.rows[cell.row_index].cells;
					for(var j=0; j<cells_on_the_row.length; j++) {
						cells_on_the_row[j].row_index = new_row_index;
					}
					cell.row.index = new_row_index;

					//adjust guides again
					if(cell.row.fixed) {
						cell.vis.guides.shift_south(cell.row_index, -cell.row.south_shift);
					}
				};
				//------ re-arrangel cols and rows ------
				for(var i=0; i<this.vis.cols.length; i++) {
					var new_cells = [];
					var col = this.vis.cols[i];
					for(var j=0; j<col.cells.length; j++) {
						var idx = col.cells[j].row_index;
						new_cells[idx] = col.cells[j];
					}
					col.cells = new_cells;
				}
				var new_rows = [];
				for(var i=0; i<this.vis.rows.length; i++) {
					var idx = this.vis.rows[i].index;
					new_rows[idx] = this.vis.rows[i];
				}
				this.vis.rows = new_rows;

			}//for each primary category, sort the rows

			//------ adjust all cells ------
			for(var i=0; i<this.vis.all_cells.length; i++) {
				var cell = this.vis.all_cells[i];
				cell.adjust_rect(true);
			}
			
		}//if primary index and secondary index are correct
	},
	color_alphabet: function() {//default
		for (var i = 0; i < this.cells.length; i++) { 
			if(this.cells[i].text !== "") {
				this.cells[i].color_mode = 'alphabet';
				this.cells[i].rect.style('fill', Cell.fill_default);
				if(this.cells[i].v_rect !== null) {
					this.cells[i].v_rect.style('fill', Cell.fill_v_color_default);
				}
			}
		};
	},
	color_nominal: function() {
		var categories = [];
		if(this.attribute_dict == null) {
			for (var i = 0; i < this.cells.length; i++) {
				if(this.cells[i].text !== "" && 
					categories.indexOf(this.cells[i].text) == -1) {
					categories.push(this.cells[i].text);
				}
			}
			this.attribute_dict = categories;
		}
		else {
			categories = this.attribute_dict;
		}
		
		var cs = cells.d3color10;
		if(categories.length > 10) cs = cells.d3color20;
		cs = this.shuffle(cs);
		for (var i = 0; i < this.cells.length; i++) {
			if(this.cells[i].text !== "") {
				var idx = categories.indexOf(this.cells[i].text);
				var c = cs[idx];
				this.cells[i].fill_color = c;
				this.cells[i].color_mode = 'nominal';
				this.cells[i].rect.style('fill', c);
			}
		};
	},
	color_comparison_nominal: function() {
		//1. color the general categories
		//2. color the small rectangle in each cell to distinguish 
		//   different values in the same attribute/category
		var categories = [];
		var map = {};
		var signmap = {};
		for (var i = 0; i < this.cells.length; i++) {
			var cmpa = this.cells[i].cmp[this.vis.CMP_A];
			var cmpl_r = this.cells[i].cmp[this.vis.CMP_L]+'\t'+this.cells[i].cmp[this.vis.CMP_R];
			var cmpr_l = this.cells[i].cmp[this.vis.CMP_R]+'\t'+this.cells[i].cmp[this.vis.CMP_L];	
			if(this.attribute_dict == null) {
				if(!map[cmpa]) {
					map[cmpa] = [];
				}
				if(map[cmpa].indexOf(cmpl_r) == -1 && 
					map[cmpa].indexOf(cmpr_l) == -1) {
					map[cmpa].push(cmpl_r);
				}
			}//if this.attribute_dict is null

			if(categories.indexOf(cmpa) == -1) {
				categories.push(cmpa);
			}//if

			var cmps = this.cells[i].cmp[this.vis.CMP_S];
			if(!signmap[cmpl_r] && !signmap[cmpr_l]) { 
				signmap[cmpl_r] = {};
				signmap[cmpl_r].larger_sign = 0;
				signmap[cmpl_r].smaller_sign = 0;
			}
			if(cmps == '>') {
				signmap[cmpl_r].larger_sign = signmap[cmpl_r].larger_sign+1;
			}
			else {
				signmap[cmpl_r].smaller_sign = signmap[cmpl_r].smaller_sign+1;
			}
		}//for each cell
		if(this.attribute_dict == null) {
			this.attribute_dict = map;
		}
		else{
			map = this.attribute_dict;
		} //console.log(signmap);

		var cs = cells.d3color10;
		if(categories.length > 10) cs = cells.d3color20;
		cs = this.shuffle(cs);

		for (var i = 0; i < this.cells.length; i++) {
			var cmps = this.cells[i].cmp[this.vis.CMP_S];
			var cmpa = this.cells[i].cmp[this.vis.CMP_A];
			var idx = categories.indexOf(cmpa);
			var c = cs[idx];
			this.cells[i].fill_color = c;
			this.cells[i].color_mode = 'nominal';
			this.cells[i].rect.style('fill', c);

			var cmpl_r = this.cells[i].cmp[this.vis.CMP_L]+'\t'+this.cells[i].cmp[this.vis.CMP_R];
			var cmpr_l = this.cells[i].cmp[this.vis.CMP_R]+'\t'+this.cells[i].cmp[this.vis.CMP_L];
			var v_idx = map[cmpa].indexOf(cmpl_r);
			if(v_idx == -1) v_idx = map[cmpa].indexOf(cmpr_l);
			var v_cs = cells.google10c;
			if(map[cmpa].length > 10) v_cs = cells.d3color20b;
			var v_c = v_cs[v_idx];
			this.cells[i].fill_v_color = v_c;
			this.cells[i].v_rect.style('fill', v_c);
			if(signmap[cmpl_r].smaller_sign !== 0 ||
			   signmap[cmpl_r].larger_sign !== 0) {
				var smaller_count = signmap[cmpl_r].smaller_sign;
				var larger_count = signmap[cmpl_r].larger_sign;
				var b1 = smaller_count>larger_count && cmps == '>';
				var b2 = larger_count>smaller_count && cmps == '<';
				if(b1 || b2) {
					this.cells[i].text_obj
						.style('font-weight','bold')
						.style('font-size', 16);
				}
			}
		};
	},
	color_numerical: function() {
		
	},
	get_minority_sign: function() {

	},
	shuffle: function (o) {
	    for(var j, x, i = o.length; i; j = Math.floor(Math.random() * i), x = o[--i], o[i] = o[j], o[j] = x);
	    return o;
	}
}