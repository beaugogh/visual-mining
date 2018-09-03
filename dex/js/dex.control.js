dex.control = {
	current_view: dex._BTN_ID_BUBBLES,
	transition_time: 660,
	matrix_rows:[],
	matrix_cols:[],
	init: function() {
		dex.control.add_controls();
	},
	add_controls: function() {
		//three views
		$('#'+dex._DIV_ID_CONTROL).append('<button type="button" class="btn btn-default" id="'+dex._BTN_ID_BUBBLES+'">Bubbles</button><br>');
		$('#'+dex._DIV_ID_CONTROL).append('<button type="button" class="btn btn-default" id="'+dex._BTN_ID_BARS+'">Bars</button><br>');
		$('#'+dex._DIV_ID_CONTROL).append('<button type="button" class="btn btn-default" id="'+dex._BTN_ID_LINKS+'">Cells</button><br>');

		$('#'+dex._DIV_ID_CONTROL).append('<hr><label style="font-size:85%;"><input type="checkbox" id="'+dex._CHECK_ID_PD+'">  P(N)D</label><br>');
		//color encoding
		$('#'+dex._DIV_ID_CONTROL).append('<hr><span class="label label-primary" style="background-color:LightSteelBlue;">color</span><br>');
		$('#'+dex._DIV_ID_CONTROL).append('<label style="font-size:85%;"><input type="checkbox" id="'+dex._CHECK_ID_SUPP_COLOR+'">  Support</label><br>');
		$('#'+dex._DIV_ID_CONTROL).append('<label style="font-size:85%;"><input type="checkbox" id="'+dex._CHECK_ID_CONF_COLOR+'">  Confidence</label><br>');
		$('#'+dex._DIV_ID_CONTROL).append('<label style="font-size:85%;"><input type="checkbox" id="'+dex._CHECK_ID_MEAS_COLOR+'">  Measure</label><br>');
		//size encoding
		$('#'+dex._DIV_ID_CONTROL).append('<hr><span class="label label-primary" style="background-color:LightSteelBlue;">layout</span><br>');
		$('#'+dex._DIV_ID_CONTROL).append('<label style="font-size:85%;"><input type="checkbox" id="'+dex._CHECK_ID_SUPP_SIZE+'">  Support</label><br>');
		$('#'+dex._DIV_ID_CONTROL).append('<label style="font-size:85%;"><input type="checkbox" id="'+dex._CHECK_ID_CONF_SIZE+'">  Confidence</label><br>');
		$('#'+dex._DIV_ID_CONTROL).append('<label style="font-size:85%;"><input type="checkbox" id="'+dex._CHECK_ID_MEAS_SIZE+'">  Measure</label><br>');
		//info board
		$('#'+dex._DIV_ID_CONTROL).append('<hr id="top_hr"><div id='+dex._DIV_ID_INFO+'></div>')

		//events - views
		$('#'+dex._BTN_ID_BUBBLES).click(function () {
			// console.log("show bubbles");
			dex.control.call_bubbles();
		});
		$('#'+dex._BTN_ID_BARS).click(function () {
			// console.log("show bars");
			dex.control.call_bars();
		});
		$('#'+dex._BTN_ID_LINKS).click(function () {
			// console.log("show links");
			dex.control.call_links();
		});
		$('#'+dex._CHECK_ID_PD).change(function() {
			var checked = $('#'+dex._CHECK_ID_PD).is(':checked');
			if(checked) {
				dex.nodes.each(function(d,i) {
					if(d.pd) {
						d3.select(this).select('circle')
						.transition().duration(dex.control.transition_time)
						.style(dex.circle_pd_stroke);
						if(dex.control.current_view==dex._BTN_ID_BARS) {
							d3.select(this).select('text')
							.transition().duration(dex.control.transition_time)
							.style('fill','crimson');
						}
					}
				});
				if(dex.control.current_view==dex._BTN_ID_LINKS){
					d3.selectAll('.cell_legend').each(function(d,i){
						if(d.pd) {
							d3.select(this).select('text')
							.transition().duration(dex.control.transition_time)
							.style('fill','crimson');
						}
					});
				}
			}
			else{
				dex.nodes.each(function(d,i) {
					if(d.pd) {
						d3.select(this).select('circle')
						.transition().duration(dex.control.transition_time)
						.style(dex.circle_default_stroke);
						if(dex.control.current_view==dex._BTN_ID_BARS) {
							d3.select(this).select('text')
							.transition().duration(dex.control.transition_time)
							.style('fill','black');
						}
					}
				});
				if(dex.control.current_view==dex._BTN_ID_LINKS){
					d3.selectAll('.cell_legend').each(function(d,i){
						if(d.pd) {
							d3.select(this).select('text')
							.transition().duration(dex.control.transition_time)
							.style('fill','black');
						}
					});
				}
			}	
			// console.log("check pd: " + checked);
		});

		//events - colors
		$('#'+dex._CHECK_ID_SUPP_COLOR).change(function() {
			var checked = $('#'+dex._CHECK_ID_SUPP_COLOR).is(':checked');
			if(checked) {
				$('#'+dex._CHECK_ID_CONF_COLOR).prop('checked',false);
				$('#'+dex._CHECK_ID_MEAS_COLOR).prop('checked',false);
			}
			dex.control.change_color();
			// console.log("color check conf: " + checked);
		});
		$('#'+dex._CHECK_ID_CONF_COLOR).change(function() {
			var checked = $('#'+dex._CHECK_ID_CONF_COLOR).is(':checked');
			if(checked) {
				$('#'+dex._CHECK_ID_SUPP_COLOR).prop('checked',false);
				$('#'+dex._CHECK_ID_MEAS_COLOR).prop('checked',false);
			}
			dex.control.change_color();
			// console.log("color check conf: " + checked);
		});
		$('#'+dex._CHECK_ID_MEAS_COLOR).change(function() {
			var checked = $('#'+dex._CHECK_ID_MEAS_COLOR).is(':checked');
			if(checked) {
				$('#'+dex._CHECK_ID_SUPP_COLOR).prop('checked',false);
				$('#'+dex._CHECK_ID_CONF_COLOR).prop('checked',false);
			}
			dex.control.change_color();
			// console.log("color check meas: " + checked);
		});
		//events - sizes
		$('#'+dex._CHECK_ID_SUPP_SIZE).change(function() {
			var checked = $('#'+dex._CHECK_ID_SUPP_SIZE).is(':checked');
			if(checked) {
				$('#'+dex._CHECK_ID_CONF_SIZE).prop('checked',false);
				$('#'+dex._CHECK_ID_MEAS_SIZE).prop('checked',false);
			}
			dex.control.change_size();
			// console.log("size check conf: " + checked);
		});
		$('#'+dex._CHECK_ID_CONF_SIZE).change(function() {
			var checked = $('#'+dex._CHECK_ID_CONF_SIZE).is(':checked');
			if(checked) {
				$('#'+dex._CHECK_ID_SUPP_SIZE).prop('checked',false);
				$('#'+dex._CHECK_ID_MEAS_SIZE).prop('checked',false);
			}
			dex.control.change_size();
			// console.log("size check conf: " + checked);
		});
		$('#'+dex._CHECK_ID_MEAS_SIZE).change(function() {
			var checked = $('#'+dex._CHECK_ID_MEAS_SIZE).is(':checked');
			if(checked) {
				$('#'+dex._CHECK_ID_SUPP_SIZE).prop('checked',false);
				$('#'+dex._CHECK_ID_CONF_SIZE).prop('checked',false);
			}
			dex.control.change_size();
			// console.log("size check meas: " + checked);
		});
	},
	change_color: function() {
		if(dex.control.current_view == dex._BTN_ID_BARS) { 
			dex.control.adjust_bar_color(); }//if bar view
		else{ dex.control.adjust_bubble_color(); }
	},
	change_size: function() { 
		if(dex.control.current_view==dex._BTN_ID_BUBBLES){ 
			dex.control.adjust_bubble_size(); 
		}//if bubble view
		else if(dex.control.current_view == dex._BTN_ID_BARS) { 
			dex.control.adjust_bar_size(); 
		}//if bar view
		else if(dex.control.current_view==dex._BTN_ID_LINKS){
			dex.control.shift_cells();
		}
	},	
	call_bubbles: function() {
		if(dex.control.current_view == dex._BTN_ID_BARS) { 
			dex.nodes.each(function(d,i){
				d3.select(this).select('line').style('visibility', 'hidden');
			});
		}//if current view is bars
		else if(dex.control.current_view == dex._BTN_ID_LINKS){
			dex.links.each(function(d,i){
				var link = d3.select(this);
				link.select('line').style('visibility', 'hidden');
			});
			d3.selectAll('.cell_legend').remove();
			d3.selectAll('.cell').remove();
		}//if current view is links

		if(dex.control.current_view !== dex._BTN_ID_BUBBLES) { 
			dex.control.current_view = dex._BTN_ID_BUBBLES;
			dex.nodes.each(function(d,i){
				d3.select(this).select('circle').style('visibility', 'visible');
				d3.select(this).select('text').style('visibility', 'visible');
			});
			// dex.control.adjust_bar_color();
			dex.control.adjust_bubble_size();
		}//if current view is not bars		
	},//call_bars
	call_bars: function() {
		if(dex.control.current_view == dex._BTN_ID_BUBBLES) { 
			dex.nodes.each(function(d,i){
				d3.select(this).select('circle').style('visibility', 'hidden');
			});
		}//if current view is bubbles
		else if(dex.control.current_view == dex._BTN_ID_LINKS){
			dex.nodes.each(function(d,i){
				d3.select(this).select('circle').style('visibility', 'hidden');
			});
			dex.links.each(function(d,i){
				var link = d3.select(this);
				link.select('line').style('visibility', 'hidden');
			});
			d3.selectAll('.cell_legend').remove();
			d3.selectAll('.cell').remove();
		}//if current view is links

		if(dex.control.current_view !== dex._BTN_ID_BARS) { 
			dex.control.current_view = dex._BTN_ID_BARS;
			dex.nodes.each(function(d,i){
				d3.select(this).select('line').style('visibility', 'visible');
				d3.select(this).select('text').style('visibility', 'visible');
			});
			// dex.control.adjust_bar_color();
			dex.control.adjust_bar_size();
		}//if current view is not bars		
	},//call_bars
	call_links: function() {
		if(dex.control.current_view !== dex._BTN_ID_LINKS) { 
			dex.control.current_view = dex._BTN_ID_LINKS;
			dex.nodes.each(function(d,i){
				var node = d3.select(this);
				node.select('circle').style('visibility', 'hidden');
				node.select('line').style('visibility', 'hidden');
				node.select('text').style('visibility', 'hidden');
			});
			dex.control.create_cells();
		}//if current view is not bars	
	},//call_bars
	adjust_bubble_color: function() {
		var c = d3.scale.linear() //.pow().exponent(2);
				.range(['#deebf7', '#3182bd']);
		var _min=Number.MAX_VALUE, _max=Number.MIN_VALUE;
		var supp_checked = $('#'+dex._CHECK_ID_SUPP_COLOR).is(':checked');
		var conf_checked = $('#'+dex._CHECK_ID_CONF_COLOR).is(':checked');
		var meas_checked = $('#'+dex._CHECK_ID_MEAS_COLOR).is(':checked');
		if(supp_checked || conf_checked || meas_checked) {
			if(supp_checked) { //console.log("color change: supp");
				dex.nodes.each(function(d,i) {
					var num = d.supp;
					if(num <_min) _min = num;
					if(num >_max) _max = num;
				});
				c.domain([_min, _max]);
				dex.nodes.each(function(d,i) {
					d3.select(this).select('circle')
					.transition().duration(dex.control.transition_time)
					.style('fill', function(d){return c(d.supp);})
					.style('fill-opacity', 1);
				});
			}
			else if(conf_checked) { //console.log("color change: conf");
				dex.nodes.each(function(d,i) {
					var num = d.conf;
					if(num <_min) _min = num;
					if(num >_max) _max = num;
				});
				c.domain([_min, _max]);
				dex.nodes.each(function(d,i) {
					d3.select(this).select('circle')
					.transition().duration(dex.control.transition_time)
					.style('fill', function(d){return c(d.conf);})
					.style('fill-opacity', 1);
				});
			}
			else if(meas_checked) { //console.log("color change: meas");
				dex.nodes.each(function(d,i) {
					var num = d.meas;
					if(num <_min) _min = num;
					if(num >_max) _max = num;
				});
				c.domain([_min, _max]);
				dex.nodes.each(function(d,i) {
					d3.select(this).select('circle')
					.transition().duration(dex.control.transition_time)
					.style('fill', function(d){return c(d.meas);})
					.style('fill-opacity', 1);
				});
			}
		}
		else{
			dex.nodes.each(function(d,i) {
				d3.select(this).select('circle')
				.transition().duration(dex.control.transition_time)
				.style(dex.circle_default_fill);
			});
		}
	},
	adjust_bar_color: function() {
		var c = d3.scale.linear() //.pow().exponent(2);
				.range(['#deebf7', '#3182bd']);
		var _min=Number.MAX_VALUE, _max=Number.MIN_VALUE;
		var supp_checked = $('#'+dex._CHECK_ID_SUPP_COLOR).is(':checked');
		var conf_checked = $('#'+dex._CHECK_ID_CONF_COLOR).is(':checked');
		var meas_checked = $('#'+dex._CHECK_ID_MEAS_COLOR).is(':checked');
		if(supp_checked || conf_checked || meas_checked) {
			if(supp_checked) { //console.log("color change: supp");
				dex.nodes.each(function(d,i) {
					var num = d.supp;
					if(num <_min) _min = num;
					if(num >_max) _max = num;
				});
				c.domain([_min, _max]);
				dex.nodes.each(function(d,i) {
					d3.select(this).select('line')
					.transition().duration(dex.control.transition_time)
					.style('stroke', function(d){return c(d.supp);})
					.style('stroke-opacity', 1);
				});
			}
			else if(conf_checked) { //console.log("color change: conf");
				dex.nodes.each(function(d,i) {
					var num = d.conf;
					if(num <_min) _min = num;
					if(num >_max) _max = num;
				});
				c.domain([_min, _max]);
				dex.nodes.each(function(d,i) {
					d3.select(this).select('line')
					.transition().duration(dex.control.transition_time)
					.style('stroke', function(d){return c(d.conf);})
					.style('stroke-opacity', 1);
				});
			}
			else if(meas_checked) { //console.log("color change: meas");
				dex.nodes.each(function(d,i) {
					var num = d.meas;
					if(num <_min) _min = num;
					if(num >_max) _max = num;
				});
				c.domain([_min, _max]);
				dex.nodes.each(function(d,i) {
					d3.select(this).select('line')
					.transition().duration(dex.control.transition_time)
					.style('stroke', function(d){return c(d.meas);})
					.style('stroke-opacity', 1);
				});
			}
		}
		else{
			dex.nodes.each(function(d,i) {
				d3.select(this).select('line')
				.transition().duration(dex.control.transition_time)
				.style(dex.line_default_stroke);
			});
		}
	},
	adjust_bubble_size: function() {
		var supp_checked = $('#'+dex._CHECK_ID_SUPP_SIZE).is(':checked');
		var conf_checked = $('#'+dex._CHECK_ID_CONF_SIZE).is(':checked');
		var meas_checked = $('#'+dex._CHECK_ID_MEAS_SIZE).is(':checked');
		var padding = 5;
		var pack = d3.layout.pack().padding(padding)
				.size([dex.width-padding, dex.width-padding]);
		var pack_data = {};
		pack_data.name = "root";
		pack_data.children = dex.node_data;	
			
		if(supp_checked || conf_checked || meas_checked) {
			if(supp_checked) { //console.log("size change: supp");
				pack.value(function(d) {return d.supp;}); }
			else if(conf_checked) { //console.log("size change: conf");
				pack.value(function(d) {return d.conf;}); }
			else if(meas_checked) { //console.log("size change: meas");
				pack.value(function(d) {return d.meas;}); }
			var _data = pack.nodes(pack_data); 
			_data = _data.filter(function(d) { return !d.children; });
			for(var i=0; i<_data.length; i++) {
				var dat = _data[i];
				dex.nodes.each(function(d,j){
					if(dat.id == d.id) {
						var circ = d3.select(this).select('circle');
						circ.transition().duration(dex.control.transition_time)
							.attr('cx', d.x).attr('cy', d.y)
							.attr('r', d.r);
						var text = d3.select(this).select('text');
						text.transition().duration(dex.control.transition_time)
							.attr('x', d.x).attr('y', d.y);
						text.text(function(d) {
								var idx = 2*d.r/8;
								return d.name.substring(0,idx);
							})
							.style("text-anchor", "middle");
						return false;	
					}
				});
			}//for
		}//if one checkbox on
		else {
			pack.value(function(d) { return 10; });
			var _data = pack.nodes(pack_data); 
			_data = _data.filter(function(d) { return !d.children; });
			for(var i=0; i<_data.length; i++) {
				var dat = _data[i];
				dex.nodes.each(function(d,j){
					if(dat.id == d.id) {
						var circ = d3.select(this).select('circle');
						circ.transition().duration(dex.control.transition_time)
							.attr('cx', d.x).attr('cy', d.y)
							.attr('r', d.r);
						var text = d3.select(this).select('text');
						text.text(function(d) { return d.name.substring(0, d.r / 4); })
							.transition().duration(dex.control.transition_time) 
							.attr("x", d.x).attr("y", d.y)
							.style("font-size", dex.font_size)
							.style("text-anchor", "middle");	
						return false;	
					}
				});
			}//for
		}//else
	},
	adjust_bar_size: function() {
		var supp_checked = $('#'+dex._CHECK_ID_SUPP_SIZE).is(':checked');
		var conf_checked = $('#'+dex._CHECK_ID_CONF_SIZE).is(':checked');
		var meas_checked = $('#'+dex._CHECK_ID_MEAS_SIZE).is(':checked');
		//sorting comparator
		var comp = null;
		if(supp_checked) {
			comp = function(a,b) {
				return a.supp > b.supp ? -1 : a.supp < b.supp ? 1 : a.supp <= b.supp ? 0 : NaN;
			}
		}
		else if(conf_checked) {
			comp = function(a,b) {
				return a.conf > b.conf ? -1 : a.conf < b.conf ? 1 : a.conf <= b.conf ? 0 : NaN;
			}
		}
		else if(meas_checked) {
			comp = function(a,b) {
				return a.meas > b.meas ? -1 : a.meas < b.meas ? 1 : a.meas <= b.meas ? 0 : NaN;
			}
		}
		var _min=Number.MAX_VALUE, _max=Number.MIN_VALUE;
		dex.nodes.each(function(d,i){
			var num = null;
			if(supp_checked) num = d.supp;
			else if(conf_checked) num = d.conf;
			else if(meas_checked) num = d.meas;

			if(num <_min) _min = num;
			if(num >_max) _max = num;
		});
		if(supp_checked || conf_checked || meas_checked) {
			var len = d3.scale.linear().domain([_min, _max]).range([10, dex.width/2]);
			var x1 = 10, x2, y1=10, y2;
			dex.nodes.sort(comp).each(function(d,i){ 
				var num;
				if(supp_checked) num = d.supp;
				else if(conf_checked) num = d.conf;
				else if(meas_checked) num = d.meas;
				var span = len(num);
				x2 = x1 + span;
				y2 = y1;
				var node = d3.select(this);
				node.select('line').transition()
					.duration(dex.control.transition_time)
					.attr('x2',x2).attr('y1',y1).attr('y2',y2);
				node.select('text')
					.text(function(d){return d.name;})
					.style("text-anchor", "start")
					.transition().duration(dex.control.transition_time)
					.attr('x', (x2+2)).attr('y', y2);
				y1+=(dex.bar_width+2);	
			});			
		}else{
			dex.nodes.each(function(d,i){
				var node = d3.select(this);
				var line = node.select('line');
				var x2 = 110;
				line.attr('x2', 110);
				var y2 = line.attr('y2');
				node.select('text')
					.text(function(d){return d.name;})
					.style("text-anchor", "start")
					.transition().duration(dex.control.transition_time)
					.attr('x', (+x2+2)).attr('y', y2);	
			});
		}
	},//adjust_bar_size
	create_cells: function() { //getComputedTextLength
		// var comp = dex.control.comp_name_asc;
		var comp = dex.control.comp_supp_asc;
		var nodeg = d3.select('#nodeg');
		var padding = 5, len=120;
		var hx=len+6*padding,hy=padding+len;
		var vx=hx-4*padding, vy=hy+3*padding;
		var x=vx+2*padding,y=hy+padding; 

		var sorted = dex.nodes.sort(comp);
		sorted.each(function(d,i){
			//vertical legend
			var cell_le = nodeg.append('g').datum(d)
				.attr('class','cell_legend')
				.attr('id','cell_legend_v_'+d.id)
				.on('click', dex.control.cell_legend_click);
			cell_le.append('title').text(d.name);
			var cell_le_t = cell_le.append('text')
				.text(function(){
					var indx = len/9; 
					var label = d.name.substring(0,indx);
					return label;
				})
				.style("text-anchor", "end")
				.attr('y', 0)
				.transition().duration(dex.control.transition_time)
				.attr('x',vx).attr('y',vy);
			vy += dex.font_size+padding;

			//horizontal legend
			var cell_le1 = nodeg.append('g').datum(d)
				.attr('class','cell_legend')
				.attr('id','cell_legend_h_'+d.id)
				.on('click', dex.control.cell_legend_click);
			cell_le1.append('title').text(d.name);
			var cell_le1_t = cell_le1.append('text')
				.text(function(){
					var indx = len/(dex.font_size-3); 
					var label = d.name.substring(0,indx);
					return label;
				})
				.transition().duration(dex.control.transition_time)
				.attr('transform', 'translate('+hx+','+hy+') rotate(270)');
			hx += dex.font_size+padding; //console.log(x);

			//cells
			var row = {}; row.name = d.name; row.children = [];
			var col = {}; col.name = row.name; col.children = [];
			sorted.each(function(d1,i1){ 
				var cell = nodeg.append('g')
					.attr('class', 'cell')
					.attr('id','cell_'+d.id+'_'+d1.id)
					.append('rect')
					.attr('width',dex.font_size)
					.attr('height',dex.font_size)
					.style('fill','white')
					.style('stroke','grey')
					.style('stroke-width', '1px')
					.style('stroke-opacity', 0.5);
				cell.transition().duration(dex.control.transition_time)
					.attr('x',x).attr('y',y);
				row.children.push('cell_'+d.id+'_'+d1.id);	
				x += dex.font_size+padding;	
			});
			y += dex.font_size+padding;
			x = vx+2*padding;
			dex.control.matrix_rows.push(row);
			dex.control.matrix_cols.push(col);
		}); 
		//columns
		for(var k=0; k<dex.control.matrix_cols.length; k++) {
			var row = dex.control.matrix_rows[k];
			for(var j=0; j<row.children.length; j++) {
				var cell = row.children[j];
				dex.control.matrix_cols[j].children.push(cell);
			}
		}
		//coloring
		var _min=Number.MAX_VALUE,_max=Number.MIN_VALUE;
		for(var i=0; i<dex.link_data.length; i++) {
			var dat = dex.link_data[i];
			var mi = dat.mutual_info;	
			if(mi>_max)_max=mi;
			if(mi<_min)_min=mi;		
		}
		var scale = d3.scale.pow().exponent(1.2)
			.domain([0,_max])
			// .range(['white','black']);
			.range(['#deebf7','#3182bd']);
		for(var i=0; i<dex.link_data.length; i++) {
			var dat = dex.link_data[i];
			var mi = dat.mutual_info; //console.log(mi);	
			var cell_i = dat.source;
			var cell_j = dat.target;
			var cell_id_1 = 'cell_'+cell_i+'_'+cell_j;
			var cell_id_2 = 'cell_'+cell_j+'_'+cell_i;
			var c = scale(mi);
			d3.select('#'+cell_id_1).datum(dat).select('rect')
				.style('fill',c)
				.on('mouseover', dex.control.cell_mouseover)
				.on('mouseout', dex.control.cell_mouseout);
			d3.select('#'+cell_id_2).datum(dat).select('rect')
				.style('fill',c)
				.on('mouseover', dex.control.cell_mouseover)
				.on('mouseout', dex.control.cell_mouseout);
		}	
	},//create_cells
	shift_cells: function() { //console.log('shift_cells');
		var supp_checked = $('#'+dex._CHECK_ID_SUPP_SIZE).is(':checked');
		var conf_checked = $('#'+dex._CHECK_ID_CONF_SIZE).is(':checked');
		var meas_checked = $('#'+dex._CHECK_ID_MEAS_SIZE).is(':checked');
		var comp = dex.control.comp_name_asc;
		if(supp_checked) comp = dex.control.comp_supp_asc;
		else if(conf_checked) comp = dex.control.comp_conf_asc;
		else if(meas_checked) comp = dex.control.comp_meas_asc;
		var padding = 5, len=120;
		var hx=len+6*padding,hy=padding+len;
		var vx=hx-4*padding, vy=hy+3*padding;
		var x=vx+2*padding,y=hy+padding;
		var sorted = dex.nodes.sort(comp);
		//cell legends
		sorted.each(function(d,i){ 
			//console.log(d.name+": supp: "+d.supp+", pos: "+vy);
			//vertical legend
			d3.select('#cell_legend_v_'+d.id).select('text')
				.transition().duration(dex.control.transition_time)
				.attr('x',vx).attr('y',vy);
			vy += dex.font_size+padding;
			//horizontal legend
			d3.select('#cell_legend_h_'+d.id).select('text')
				.transition().duration(dex.control.transition_time)
				.attr('transform', 'translate('+hx+','+hy+') rotate(270)');
			hx += dex.font_size+padding; //console.log(x);
			//cells
			sorted.each(function(d1,i1){ 
				// console.log(d3.select('#cell_'+d.id+'_'+d1.id));
				d3.select('#cell_'+d.id+'_'+d1.id).select('rect')
					.transition().duration(dex.control.transition_time)
					.attr('x',x).attr('y',y); 
				x += dex.font_size+padding;	
			});
			y += dex.font_size+padding;
			x = vx+2*padding;
		});
	},
	cell_mouseover: function(d) { //console.log(d);
		var rect = d3.select(this)
			.style('stroke', 'coral')
			.style('stroke-width', '2px')
			.style('stroke-opacity', 1);
		var small = 3;
		var x = +rect.attr('x')-small, y = +rect.attr('y')-small;
		var s = +rect.attr('width')+2*small; 
		rect.attr('x',x).attr('y',y)
		   	.attr('width',s).attr('height',s);	

		var source = dex.control.find_node_by_id(d.source);
		var target = dex.control.find_node_by_id(d.target);   	
		var html = '<b>'+ source.name+' </b><br><b>'+ target.name+' </b><br>';
		html += 'mutual info: '+d.mutual_info.toFixed(2); 
		var mousey = d3.mouse(this)[1]; 
		var ref = $('#top_hr').offset().top; 
		var diff = mousey - ref; if(diff < 0) diff = 0; 
		$('#'+dex._DIV_ID_INFO).append(html).css({
		    top:diff
		});   	
	},
	cell_mouseout:function(d) { //console.log('out');
		var rect = d3.select(this)
			.style('stroke', 'grey')
			.style('stroke-width', '1px')
			.style('stroke-opacity', 0.5);
		var small = 3;
		var x = +rect.attr('x')+small, y = +rect.attr('y')+small;
		var s = +rect.attr('width')-2*small; 
		rect.attr('x',x).attr('y',y)
		   	.attr('width',s).attr('height',s);
		$('#'+dex._DIV_ID_INFO).empty();   	
	},
	cell_legend_click: function(d) { //console.log(d.name+" clicked");
		var id = d3.select(this).attr('id'); 
		var delim = '_v_';
		if(id.indexOf('_h_') !== -1) { //console.log('horizontal');
			delim = '_h_';
		}else if(id.indexOf('_v_') !== -1) { //console.log('vertical');
			delim = '_v_';
		}
		var node_id = id.split(delim)[1]; //console.log(node_id);
		var arr = []; 
		dex.nodes.each(function(dat,indx){
			var obj = {}; obj.id = dat.id; 
			obj.name = dat.name; obj.mi = 0;
			var other_node_id = dat.id;
			var cell_id = 'cell_'+node_id+'_'+other_node_id;
			var cell = d3.select('#'+cell_id);
			var cell_datum = cell.datum();
			if(cell_datum !== undefined) {
				obj.mi = cell_datum.mutual_info;
			}
			arr.push(obj);
		});
		var arr = arr.sort(dex.control.comp_mutual_info_desc);
		var padding = 5, len=120;
		var hx=len+6*padding,hy=padding+len;
		var vx=hx-4*padding, vy=hy+3*padding;
		var x=vx+2*padding,y=hy+padding;
		//legend shift
		var map = {};
		for(var i=0; i<arr.length; i++) { //console.log(arr[i].id);
			//move cell legends
			var delim_other = '_h_';
			if(delim == '_h_') {//vertical shift
				delim_other = '_v_';
				var legend_id = 'cell_legend'+delim_other+arr[i].id;
				d3.select('#'+legend_id).select('text')
					.transition().duration(dex.control.transition_time)
					.attr('x',vx).attr('y',vy);
				map[arr[i].name] = vy;
			}
			else{//horizontal shift
				var legend_id = 'cell_legend'+delim_other+arr[i].id;
				d3.select('#'+legend_id).select('text')
					.transition().duration(dex.control.transition_time)
					.attr('transform', 'translate('+hx+','+hy+') rotate(270)');
				map[arr[i].name] = hx;
			}
			vy += dex.font_size+padding;
			hx += dex.font_size+padding;
		}
		// console.log(map);
		//cell shift
		if(delim == '_h_') {//row shift
			for(var i=0; i<dex.control.matrix_rows.length; i++) {
				var row = dex.control.matrix_rows[i];
				var pos = map[row.name]
				for(var k=0; k<row.children.length; k++) {
					var cell_id = row.children[k]; //console.log(cell_id);
					d3.select('#'+cell_id).select('rect')
					.transition().duration(dex.control.transition_time)
					.attr('y', pos-2*padding);
				}
			}
		}
		else{//column shift
			for(var i=0; i<dex.control.matrix_cols.length; i++) {
				var col = dex.control.matrix_cols[i];
				var pos = map[col.name]
				for(var k=0; k<col.children.length; k++) {
					var cell_id = col.children[k]; //console.log(cell_id);
					d3.select('#'+cell_id).select('rect')
					.transition().duration(dex.control.transition_time)
					.attr('x', pos-2*padding);
				}
			}
		}
	},
	find_node_by_id: function(_id) {
		var found = null;
		for(var i=0; i<dex.node_data.length; i++) {
			var dat = dex.node_data[i];
			if(dat.id == _id) {
				found = dat; break;
			}
		}
		return found;
	},
	comp_name_asc: function(a,b) {
		return a.name < b.name ? -1 : a.name > b.name ? 1 : a.name >= b.name ? 0 : NaN;
	},
	comp_supp_asc: function(a,b) {
		return a.supp < b.supp ? -1 : a.supp > b.supp ? 1 : a.supp >= b.supp ? 0 : NaN;
	},
	comp_conf_asc: function(a,b) {
		return a.conf < b.conf ? -1 : a.conf > b.conf ? 1 : a.conf >= b.conf ? 0 : NaN;
	},
	comp_meas_asc: function(a,b) {
		return a.meas < b.meas ? -1 : a.meas > b.meas ? 1 : a.meas >= b.meas ? 0 : NaN;
	},
	comp_mutual_info_desc: function(a,b) {
		return a.mi > b.mi ? -1 : a.mi < b.mi ? 1 : a.mi <= b.mi ? 0 : NaN;
	}
}