(function(window) {
	'use strict';
	function define_mcells() {
		var mcells = {
			version: '0',
			//------ tsv column names
			CMP: "comparison",
			CMP_A: "comparison_attribute",
			CMP_L: "comparison_left",
			CMP_R: "comparison_right",
			CMP_S: "comparison_sign",
			CMP_P: "comparison_p",
			//------ index.html ids
			_DIV_VIS_ID: "div_vis",
			_DIV_CONTROL_ID: "div_control",
			_VIS_SVG_ID: "vis_svg",
			_VIS_G_ID: "vis_g",
			_VIS_INFO_G_ID: "vis_info_g",
			//------ components
			svg: "",			
			g: "",
			info_g: "",
			width: 0,
			height: 0,
			default_svg_width: 800,
			font_size: 15,
			categories: [],//the categories are the keys in dict
			dict: {},
			sections: [],
			rowlines: [],
			prev_y: 0,
			mouse_coords: [],
			tooltip: '',
			init: function (data) { console.log('initialize mcells');
				this.width = this.default_svg_width;
				this.height = this.width/1.618;
				this.svg = d3.select('#'+this._DIV_VIS_ID)
							.append('svg')
							.datum(this)
							.attr('id',this._VIS_SVG_ID)
							.attr('width',this.width)
							.attr('height',this.height);
				this.g = this.svg.append('g').attr('id', this._VIS_G_ID);
				this.info_g = this.svg.append('g').attr('id', this._VIS_INFO_G_ID);
				this.tooltip = d3.select("body")
						.append("div")
						.style("position", "absolute")
						.style("z-index", "10")
						.style("visibility", "hidden")
						.style('background-color', 'white')
						.text("a simple tooltip");
				$.when(
				    $.getScript( "js/rowline.js" ),
				    $.getScript( "js/section.js" ),
				    $.getScript( "js/graph.js" ),
				    $.getScript( "js/mcells.control.js" ),
				    $.Deferred(function( deferred ){
				        $( deferred.resolve );
				    })
				).done(function(){					
					init_data(data);
					init_rowlines();
					init_sections();
					mcells.control.init(window.mcells);
				});//finish loading the scripts			
			}
		}
		return mcells;
	}

	function init_data (data) { //console.log(data);
		var categories = [];
		var dict = {};

		var name_arr = []; name_arr.push(mcells.CMP_A); 
		name_arr.push(mcells.CMP_L); name_arr.push(mcells.CMP_S); 
		name_arr.push(mcells.CMP_R); name_arr.push(mcells.CMP_P);
		for(var i=0; i<data.length; i++) {
			var obj = data[i]; 
			var text = obj[mcells.CMP_A]+': '+obj[mcells.CMP_L]+' '+obj[mcells.CMP_S]+' '+obj[mcells.CMP_R];
			if(categories.indexOf(text) == -1) {
				categories.push(text); 
				dict[text] = [];
			}
			var a_obj = {};
			for(var key in obj) { 
				if(obj.hasOwnProperty(key) && name_arr.indexOf(key) == -1) { 
					a_obj[key] = ""+obj[key]; 
				}
			}//for each col
			dict[text].push(a_obj);
		}//for each row

		mcells.categories = categories;
		mcells.dict = dict;
		// console.log(categories);
		// console.log(dict);
	}

	function init_rowlines() {
		var d = 200;
		var y = 0;
		for (var i = 0; i < mcells.categories.length+1; i++) {
			var rl = Object.create(Rowline);
			rl.init(mcells, i, y);
			y += d;
			mcells.rowlines.push(rl);
		};
		var n = mcells.rowlines.length-1;
		var bottom_y = mcells.rowlines[n].y;
		mcells.svg.attr('height', bottom_y+30);
	}

	function init_sections() {
		for (var i = 0; i < mcells.rowlines.length-1; i++) {
			var rltop = mcells.rowlines[i];
			var rlbottom = mcells.rowlines[i+1];
			var x = rltop.x;
			var y = rltop.y+rltop.h;
			var w = rltop.w;
			var h = rlbottom.y - y;
			var text = mcells.categories[i];
			var arr = mcells.dict[text]; 
			var sect = Object.create(Section); 
			sect.init(mcells, i, x, y, w, h, text, arr);
			//construct graph for the section

			//
			mcells.sections.push(sect);
		};
		//compute the total count for each node and link
		var nodecount_dict = {};
		var linkcount_dict = {};
		for (var i = 0; i < mcells.sections.length; i++) {
			var graph = mcells.sections[i].graph;
			for (var j = 0; j < graph.nodes.length; j++) {
				var n = graph.nodes[j];
				if(nodecount_dict.hasOwnProperty(n.text)) { 
					var count = +nodecount_dict[n.text];
					count = count + n.count;
					nodecount_dict[n.text] = count;
				}
				else{
					nodecount_dict[n.text] = +n.count;
				}
			};//for each node
			for (var j = 0; j < graph.links.length; j++) {
				var l = graph.links[j];
				var s_t = graph.nodes[l.source].text +'_'+graph.nodes[l.target].text;
				var t_s = graph.nodes[l.target].text +'_'+graph.nodes[l.source].text;
				if(linkcount_dict.hasOwnProperty(s_t)) {
					var count = +linkcount_dict[s_t];
					count = count + l.count;
					linkcount_dict[s_t] = count;
				}
				else if(linkcount_dict.hasOwnProperty(t_s)) {
					var count = +linkcount_dict[t_s];
					count = count + l.count;
					linkcount_dict[s_t] = count;
				}
				else{
					linkcount_dict[s_t] = +l.count;
				}
			};//for each link
		};//for each section
		// console.log(nodecount_dict);
		// console.log(linkcount_dict);
		for (var i = 0; i < mcells.sections.length; i++) {
			var graph = mcells.sections[i].graph;
			for (var j = 0; j < graph.nodes.length; j++) {
				var n = graph.nodes[j];
				n.total_count = +nodecount_dict[n.text];
			};//for each node
			for (var j = 0; j < graph.links.length; j++) {
				var l = graph.links[j];
				var s_t = graph.nodes[l.source].text +'_'+graph.nodes[l.target].text;
				var t_s = graph.nodes[l.target].text +'_'+graph.nodes[l.source].text;
				if(linkcount_dict.hasOwnProperty(s_t)) {
					l.total_count = +linkcount_dict[s_t];
				}
				else if(linkcount_dict.hasOwnProperty(t_s)) {
					l.total_count = +linkcount_dict[t_s];
				}
			};//for each link
		};//for each section
	}

	if(typeof(mcells) === 'undefined') {
		window.mcells = define_mcells();
	}
	else{
		console.log("The cells-meta visualization is already defined.");
	}
})(window);