var Row = {
	vis: {},
	id: "",//the id of the row	
	header: "", //the header text
	index: -1, //the index of the row in the matrix, should be >=0
	cells: [], //the array of cells in the row
	fixed: false,
	south_shift: 0,
	init: function (vis, id, index, header) {
		this.vis = vis;
		this.id = id;
		this.index = index;
		this.header = header;
		this.cells = [];
	},
	get_text: function() {
		var text = '';
		for(var i=0; i<this.cells.length; i++) {
			text += this.cells[i].text +'__';
		}
		return text;
	}
}