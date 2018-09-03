freebu.filter = {
	summary:{},
	diction:{},
	list_w:100,
	list_h: 50,
	list_padding:3,
	list_data:[],
	list_tip:{},
	lists:{},
	focused_list:{},
	selected_list: null,
	suggestions:[],
	summarize: function() {
		freebu.filter.summary['info'] = {};
		freebu.filter.summary['binary'] = {};
		freebu.filter.summary['polynary'] = {};
		freebu.filter.summary['numeric'] = {};
		for(var i=0; i<freebu.data.nodes.length; i++) {
			var node = freebu.data.nodes[i];
			freebu.filter.summary['info'][node.id]=[];
			if(node.attributes) {
				for(var j=0; j<node.attributes.length; j++) {
					var attr = node.attributes[j];
					/*
					 * --- info: e.g. gender, birthday, location 
					 */
					if(attr.type.indexOf('info') != -1) {
						var obj = {}; obj.name=attr.name; obj.value=attr.value;
						if(attr.type.length == 1) obj.is_info = true;
						freebu.filter.summary['info'][node.id].push(obj);
					}
					/*
					 * --- binary color coding: e.g. gender, hometown, location, work, education
					 */
					if(attr.type.indexOf('binary') != -1) {
						if(!freebu.filter.summary['binary'][attr.id]) {
							freebu.filter.summary['binary'][attr.id]={};
							freebu.filter.summary['binary'][attr.id].name=attr.name;
							freebu.filter.summary['binary'][attr.id].value=[];
						}
						for(var k=0; k<attr.value.length; k++) {
							if(!has_binary_attr(freebu.filter.summary['binary'][attr.id].value, attr.value[k])) {
								var obj = {};
								obj.id = attr.id+'_'+i+'_'+k;
								obj.name = attr.value[k];
								freebu.filter.summary['binary'][attr.id].value.push(obj);
							}
						}
					}
					/*
					 * --- polynary color coding: e.g. community
					 */
					if(attr.type.indexOf('polynary') != -1) {
						if(!freebu.filter.summary['polynary'][attr.id]) {
							freebu.filter.summary['polynary'][attr.id] = {};
							freebu.filter.summary['polynary'][attr.id].name=attr.name;
							freebu.filter.summary['polynary'][attr.id].value=new Set();
						}
						freebu.filter.summary['polynary'][attr.id].value.add(attr.value);
					}
					/*
					 * --- numeric color coding: e.g. betweenness, chat_freq
					 */
					if(attr.type.indexOf('numeric') != -1) {
						if(!freebu.filter.summary['numeric'][attr.id]) {
							freebu.filter.summary['numeric'][attr.id] = {};
							freebu.filter.summary['numeric'][attr.id].name=attr.name;
							freebu.filter.summary['numeric'][attr.id].value=new Set();
						}
						freebu.filter.summary['numeric'][attr.id].value.add(attr.value);
					}
				}//for
			}//if
		}//for 
		function has_binary_attr(arr, name) {
			var b = false;
			for(var i=0; i<arr.length; i++) {
				if(arr[i].name == name) {
					b = true; break;
				}
			}
			return b;
		}
		function compare(a,b) {
		  if (a.name < b.name)
		    return -1;
		  if (a.name > b.name)
		    return 1;
		  return 0;
		}
		//sort
		$.each(freebu.filter.summary['binary'], function(key, val){
			freebu.filter.summary['binary'][key].value.sort(compare);
		});
	},
	init: function() {
		freebu.filter.summary = {};
		freebu.filter.diction = {};
		freebu.filter.list_data = [];
		freebu.filter.list_tip = {};
		freebu.filter.lists = {};
		freebu.filter.focused_list = {};
		freebu.filter.selected_list = null;
		freebu.filter.suggestions = [];
		
		//drop zone
		freebu.filter.add_drop_zone_listener();

		var search_html = '<form role="form"><input id="search_input" type="text" class="form-control input-sm typeahead" placeholder="Search..." style="font-family:Georgia"></form>';
		$('#'+freebu._DIV_ID_FILTER).append(search_html);
		$('#'+freebu._DIV_ID_FILTER).append("<hr>");
		var button_html = '<form role="form"><div class="form-group"><input type="text" class="form-control input-sm" placeholder="List name..." id="input_add_list" style="font-family:Georgia"><button id="btn_add_list" class="btn btn-info btn-sm" type="button" style="font-family:Georgia; margin-top:2px;">Add A List</button><button id="btn_export_list" class="btn btn-success btn-sm" type="button" style="font-family:Georgia;margin-top:2px;">Export Lists</button></div></form>';
		$('#'+freebu._DIV_ID_FILTER).append(button_html);
		$('#'+freebu._DIV_ID_FILTER).append("<hr>");
		//button listeners
		freebu.filter.add_button_list_listener();
		freebu.filter.add_export_list_listener();
		freebu.filter.summarize();
		//polynary color coding
		var _html = '<ul>';
		$.each(freebu.filter.summary['polynary'], function(attr_id, obj) {
			_html += '<li>'+checkbox_html(attr_id, obj.name, true)+'</li>';
			//event listener -- begin -- 
			$('body').on('click', '#'+attr_id, function () {
		     	var checked = $(this).is(':checked');
				if(checked) {
					//uncheck the other polynary checkboxes
					$.each(freebu.filter.summary['polynary'],function(other_attr_id,other_obj){
						if(other_attr_id != attr_id) {
							$('#'+other_attr_id).attr('checked', false);
						} 
					});
					//color coding
					var ccolor = d3.scale.category10();
					if(obj.value.size > 10) { ccolor = d3.scale.category20();}
					freebu.nodes.each(function(d,i){
						if(d.attributes && d.nr_children == 0) {
							for(var i=0; i<d.attributes.length; i++) {
								var attr = d.attributes[i];
								if(attr.id == attr_id) {
									var circle = d3.select(this).select("circle");
									var _color = ccolor(attr.value);
									if(obj.name=='community') _color = freebu.color(d.group);
									circle.transition(freebu.moderate_duration)
										  .style("fill",function(){return d.color =_color;});
								}//if the attribute's id == checkbox attr_id
							}//for each of the node's attributes
						}//if node is normal 
					});//for each node
				}
				else {
					//restore default color
					freebu.nodes.each(function(d,i){
						if(d.nr_children == 0) {
							var circle = d3.select(this).select("circle");
							circle.transition(freebu.moderate_duration)
								.style(freebu.node_default_color_style);
						}
					});
				}
		   	});
			//event listener -- end -- 
		});
		_html += '</ul>'
		$('#'+freebu._DIV_ID_FILTER).append(_html);
		$('#'+freebu._DIV_ID_FILTER).append("<hr>");
		//numeric size coding
		_html = '<ul>';
		$.each(freebu.filter.summary['numeric'], function(attr_id, obj) {
			_html += '<li>'+checkbox_html(attr_id, obj.name, true)+'</li>';
			//event listener -- begin -- 
			$('body').on('click', '#'+attr_id, function () {
		     	var checked = $(this).is(':checked');
				if(checked) {
					//uncheck the other polynary checkboxes
					$.each(freebu.filter.summary['numeric'],function(other_attr_id,other_obj){
						if(other_attr_id != attr_id) {
							$('#'+other_attr_id).attr('checked', false);
						} 
					});
					var _min=Number.MAX_VALUE, _max=Number.MIN_VALUE;
					for(num of obj.value) {
						if(num <_min) _min = num;
						if(num >_max) _max = num;
					}
		     		var scale = d3.scale.linear()//.pow().exponent(2)
	     					  .domain([_min, _max]);
	     			if(freebu.control.current_view==freebu._RADIO_ID_NETWORK_VIEW){
	     				scale.range([freebu.node_min_radius, freebu.node_max_radius]);
	     			}
	     			else if(freebu.control.current_view==freebu._RADIO_ID_RANK_VIEW){
	     				scale.range([freebu.node_rank_min_radius-5, freebu.node_rank_max_radius]);
	     			}	
	     			else if(freebu.control.current_view ==freebu._RADIO_ID_CIRCLE_VIEW) {
						scale.range(["aliceblue", "steelblue"]);
					}  
	     					  
		     		freebu.nodes.each(function (d,i) {
		     			if(d.attributes && d.nr_children == 0) {
		     				for(var i=0; i<d.attributes.length; i++) {
		     					var attr = d.attributes[i];
								if(attr.id == attr_id) {
									var circle = d3.select(this).select("circle");
									if(freebu.control.current_view !==freebu._RADIO_ID_CIRCLE_VIEW) {
										circle.transition().duration(freebu.moderate_duration)
					     				  .attr("r", function() {return d.size=scale(attr.value);});
									}else { 
										circle.transition().duration(freebu.short_duration)
											.style("fill", function(){return d.color=scale(attr.value);})
									}
					     			
								}//if the attribute's id == checkbox attr_id
		     				}//for each of the node's attributes
		     			}//if node is normal
		     		});//for each node	
				}
				else {
					var r = freebu.node_default_radius;
					if(freebu.control.current_view == freebu._RADIO_ID_RANK_VIEW){
						r = freebu.node_rank_default_radius;
					}
					freebu.nodes.each(function(d,i){
						if(d.nr_children == 0) {
							var circle = d3.select(this).select("circle");
							if(freebu.control.current_view !==freebu._RADIO_ID_CIRCLE_VIEW) {
								circle.transition(freebu.moderate_duration).attr("r", r);
							}
							else {
								circle.transition(freebu.short_duration)
									.style(freebu.node_default_color_style);
							}
						}
					});
				}//else
		   	});
			//event listener -- end -- 
		});
		_html += '</ul>'
		$('#'+freebu._DIV_ID_FILTER).append(_html);
		$('#'+freebu._DIV_ID_FILTER).append("<hr>");
		//binary color coding
		_html = '<ul><li><input type="checkbox" id="toggle-intersection" checked/><span style="font-family:Georgia;color:LightSlateGray"><b><u><i>intersection</i></u></b></span></li></ul>';
		$('#'+freebu._DIV_ID_FILTER).append(_html);
		$('body').on('click', '#toggle-intersection', function () {
			freebu.filter.filter_nodes();
		});
		_html = '<ul id="binary_check_list">';
		$.each(freebu.filter.summary['binary'], function(key, obj) { 
			if(obj.value.length > 0) {
				_html += '<li class="collapsed">'+checkbox_html(key, obj.name,true)+'<ul>';
				//event handler
				$('body').on('click', '#'+key, function () {
					var checked = $(this).is(':checked');
					$.each(freebu.filter.diction[key], function(cid, obj) {
						obj.checked = checked;
					});
					freebu.filter.filter_nodes();
				});
				$.each(obj.value, function(i,_obj){ 
					_html += '<li>'+checkbox_html(_obj.id,_obj.name)+'</li>';
					//event handler
					$('body').on('click', '#'+_obj.id, function () { 
						var checked = $(this).is(':checked');
						freebu.filter.diction[key][_obj.id]["checked"] = checked;
						freebu.filter.filter_nodes();
					});
				});
				_html += '</ul></li>';
			}
		});
		_html += '</ul>';
		$('#'+freebu._DIV_ID_FILTER).append(_html);

		$('#'+freebu._DIV_ID_FILTER).tree({
			/* specify here your options */
		});

		function checkbox_html(_id, _name, is_parent) {
			if(is_parent) return '<input type="checkbox" id=\"'+_id+'\" value=\"'+_id+'\" /><span style="font-family:Georgia"><b>'+_name+'</b></span>';
			else return '<input type="checkbox" id=\"'+_id+'\" value=\"'+_name+'\" /><span style="font-family:Georgia">'+_name+'</span>';
		}
		$("#binary_check_list").children().each(function() {
			$(this).find("input").each(function() {
				var id = $(this).attr("id");
				var name = $(this).val(); //console.log(id+","+name);
				if(!id.includes('toggle')) {
					if(!id.includes('_')) {//a parent checkbox
						var category = id;
						freebu.filter.diction[category] = {};
					}
					else{
						var obj = {
							name: name,
							checked: false
						}
						var category = id.split('_')[0];
						freebu.filter.diction[category][id] = obj;
					}
				}
			});
		});
		//tip
		freebu.filter.list_tip = d3.tip().attr("class","d3-tip")
		    	.html(function(d) { 
		    		var html = '<p style="color:orange;display:inline;">members:</p><br style="line-height:16px;">';
		    		var nr_cols = 5;
		    		var col_count = 1;
		    		for(var i=0;i<d.members.length;i++){
		    			if(i%2==0) html+='<font color=#fee6ce>';
		    			else html+='<font color=white>';
		    			html += d.members[i].name + '</font>';
		    			if(i != d.members.length-1){html+=", ";}
		    			if(col_count == nr_cols) 
		    			{ html +='<br style="line-height:16px;">'; col_count=0;}
		    			col_count++;
		    		}
		    		return html;
		    	})
		    	.direction('w');
		//search
		freebu.filter.init_node_search(); 	
	},
	filter_nodes: function() {
		freebu.nodes.each(function(d,i){
			var matched = freebu.filter.does_node_match_checks(d);
			d.dormant = !matched;
			var circle = d3.select(this).select("circle");
			if(d.dormant) { 
				circle.transition().duration(freebu.moderate_duration).style(freebu.node_dormant_color_style); 
			}
			else {
				circle.transition().duration(freebu.moderate_duration).style(freebu.node_default_color_style);
			}
		});		
	},
	does_node_match_checks: function(d) {
		var is_intersect = $('#toggle-intersection').prop('checked');
		var node_attr = {};
		for(var i=0; d.attributes && i<d.attributes.length; i++) {
			var attr = d.attributes[i];
			if(attr.type.indexOf('binary') != -1) {
				node_attr[attr.id] = attr.value;
			}
		}
		var dict_attr = {};
		$.each(freebu.filter.diction, function(attr_id, obj){
			dict_attr[attr_id] = [];
			$.each(obj, function(sub_attr_id, sub_obj){
				if(sub_obj.checked) dict_attr[attr_id].push(sub_obj.name);
			});
		});
		if(is_intersect) {
			var matched = true;
			$.each(dict_attr, function(attr_id, arr) {
				if(arr.length > 0) {
					for(var i=0; i<arr.length; i++) {
						if(!node_attr[attr_id]) {
							matched = false; break;
						}
						else if(node_attr[attr_id].indexOf(arr[i]) == -1){
							matched = false; break;
						}
					}
				}
				if(!matched) return false;
			});
			return matched;
		}
		else{
			var matched = false;
			$.each(dict_attr, function(attr_id, arr) {
				if(node_attr[attr_id] && arr.length > 0) {
					for(var i=0; i<arr.length; i++) {
						if(node_attr[attr_id].indexOf(arr[i]) != -1){
							matched = true; break;
						}
					}
				}
				if(matched) return false;
			});
			return matched;
		}
	},
	is_diction_checked: function() {
		var checked = false;
		$.each(freebu.filter.diction, function(category, branch) {
			$.each(branch, function(id, obj) {
				if(obj.checked) {
					checked = true; return false;
				}
			});
		});
		// console.log("is_diction_checked: " + checked);
		return checked;
	},
	add_button_list_listener: function() {
		var w, h, x, y, arr = [1,2,3,4,5,6,7,8,9];
		function mouseover_tagclose(d) {
			//d3.event.sourceEvent.stopPropagation();
			freebu.svg.style("cursor","pointer");
			d3.select(this).style("opacity", 0.7);
		}
		function mouseout_tagclose(d) {
			freebu.svg.style("cursor","initial");
			d3.select(this).style("opacity", 0.5);
		}
		function click_tagclose(d) {
			var new_list_data = [];
			$.each(freebu.filter.list_data, function(i,obj){
				if(d.id != obj.id) {
					new_list_data.push(obj);
				}
			});
			freebu.filter.list_data = new_list_data;
			freebu.filter.lists = d3.select("#listg").selectAll(".list")
				.data(freebu.filter.list_data, function(d){return d.id;});
			freebu.filter.lists.exit().remove();	
			freebu.filter.align_lists();
		}
		function find_missing_integer() {
			var existing = [];
			var result = null;
			for(var i=0; i<freebu.filter.list_data.length; i++) {
				var item = freebu.filter.list_data[i];
				var id_num = item.id.split('_')[1];
				existing.push(Number(id_num));
			}
			for(var i=0; i<arr.length; i++) {
				if(existing.indexOf(arr[i]) == -1) {
					result = arr[i]; break;
				}
			}
			return result;
		}	

		function mouseover_list(d, i) {
			var rect = d3.select(this).select("rect");
			rect.style("opacity", 0.6); 
			rect.style("stroke", "orange");
			rect.style("stroke-width", "5px");
			freebu.filter.focused_list = d3.select(this);
		}
		function mouseout_list(d, i) {
			var rect = d3.select(this).select("rect");
			rect.style("opacity", 0.8);
			rect.style("stroke", "none");
			rect.style("stroke-width", "1px");
			freebu.filter.focused_list = null;
			freebu.filter.list_tip.hide();
		}
		function mouseclick_list(d, i) {//console.log(d);
			// freebu.filter.list_tip.offset([0, -30]).show(d,i);
			freebu.filter.list_tip.show(d,i);
		}
		function mouseup_list(d, i) {
			console.log("up");
		}

		function add_list(d,i) {
			if(freebu.filter.list_data.length<arr.length) {
				var size = freebu.filter.list_data.length;
				var integer = find_missing_integer();
				var id = "list_"+integer;
				var name = $("#input_add_list").val();
				if(name == '') name = "list#"+integer;
				$("#input_add_list").val("");
				var list = {};
				list.id = id; list.name = name;
				list.members = [];
				freebu.filter.list_data.push(list); //console.log(freebu.filter.list_data);

				w = freebu.filter.list_w, h = freebu.filter.list_h;
				x = freebu.width-w-freebu.filter.list_padding;
				y = freebu.filter.list_padding*(size+1)+size*h;

				freebu.filter.lists = d3.select("#listg").selectAll(".list")
						.data(freebu.filter.list_data, function(d){return d.id;});
				freebu.filter.lists.enter().append("g")
					.attr("class", "list tag")
					.append("rect")
					.attr("id", function(d){return d.id;})
					.attr("x", x).attr("y", y)
					.attr("rx", 20).attr("ry", 20)
					.attr("width", w).attr("height", h)
					.style("fill", d3.lab(72.5,-24.1,-24.5))
					.style("opacity", 0.8)
					.call(freebu.filter.list_tip);
				
				d3.selectAll(".list").each(function(d,i) {
					if(d.id == id) {
						var list_node = d3.select(this);
						//label of the list
						list_node.append("text")
							.style("stroke", "none")
							.style("fill","black")
							.style("text-anchor", "middle")
							.style("font-family", "Georgia")
				            .style("font-size", "20px")
				            .attr("x",x+w/2)
							.attr("y",y+h/2+5)
							.text(function(d){return d.name;});
						//close button of the list
						var sw = 15, sh = h-40, offset = 5;
						var sx1 = x+w-sw+offset, sy1 = y + (h-sh)/2;
						var sx2 = x+w-offset, sy2 = sy1 + sh;
						var sx3 = sx2, sy3 = sy1;
						var sx4 = sx1, sy4 = sy2;

						var tagclose = list_node.append("g")
							.attr("class", "tagclose");
						tagclose.append("line")
							.attr("class", "line1")
							.style("stroke", "black")
							.style("opacity", .5)
							.style("stroke-width", "2px")
							.style("stroke-linecap", "round")
							.attr("x1", sx1).attr("y1", sy1)
							.attr("x2", sx2).attr("y2", sy2);
						tagclose.append("line")
							.attr("class", "line2")
							.style("stroke", "black")
							.style("opacity", .6)
							.style("stroke-width", "2px")
							.style("stroke-linecap", "round")
							.attr("x1", sx3).attr("y1", sy3)
							.attr("x2", sx4).attr("y2", sy4);	
						tagclose.append("rect")
							.style("fill", "white")
							.style("opacity", .6)
							.style("stroke", "transparent")
							.attr("x", x+w-15)
							.attr("y", y)
							.attr("rx", 2).attr("ry", 2)
							.attr("width", 15)
							.attr("height", h)
							.on("mouseover", mouseover_tagclose)
							.on("mouseout", mouseout_tagclose)
							.on("click", click_tagclose);
						//mouse in and out of the list
						list_node.on("mouseover", mouseover_list)
								 .on("mouseout", mouseout_list)
								 .on("click", mouseclick_list);
			 
					}
				});
			}//if #lists<9, see add_button_list_listener
		}
		$('#btn_add_list').on('click', add_list);//on btn_add_list click
		d3.select('#input_add_list').on('keydown', function(){
			if(d3.event.keyCode == 13) {
				d3.event.preventDefault(); 
      			add_list();
			}
		}); 
	},//add_button_list_listener
	add_export_list_listener: function() {
		$('#btn_export_list').click(function(){
			console.log("export lists...");
			var arr = [];
			for(var i=0; i<freebu.filter.list_data.length; i++) {
				var list = freebu.filter.list_data[i];
				if(list['members'].length > 0) {
					arr.push(list);
				}
			}
			if(arr.length > 0) {
				var zip = new JSZip();
				zip.file("my_lists.json",  JSON.stringify(arr));
				var content = zip.generate({type:"blob"});
				saveAs(content, "my_lists.zip");
			}
		});
	},
	add_drop_zone_listener: function() {
		function handleFileDrop(evt) {
			evt.stopPropagation();
			evt.preventDefault();

			var files = evt.dataTransfer.files; // FileList object.
			var f = files[0];
	    	var reader = new FileReader();
	    	reader.onload = function(e) {
	    		var txt = e.target.result;
	    		var json = JSON.parse(txt);
	    		freebu.re_init(json);
				freebu.circles.load_hierarchy_data(json.hierarchy);
	    	}
	    	reader.readAsText(f,'UTF-8');

			$('#drop_zone').css('box-shadow','0px 0px 1px 1px white');
			$('#drop_zone').css('background-color', 'white');
			$('#drop_zone').empty();
		}

		function handleMouseOut(evt) {//box-shadow:0px 0px 30px 3px steelblue;
			$('#drop_zone').css('box-shadow','0px 0px 1px 1px white');
			$('#drop_zone').css('background-color', 'white');
			$('#drop_zone').empty();
		}

		function handleMouseOver(evt) {
			$('#drop_zone').empty();
			$('#drop_zone').css('box-shadow','0px 0px 10px 3px orange');
			$('#drop_zone').append("Drop my own data here.");
		}

		function handleDragOver(evt) {
			evt.stopPropagation();
			evt.preventDefault();
			evt.dataTransfer.dropEffect = 'copy'; // Explicitly show this is a copy.
			$('#drop_zone').css('box-shadow','0px 0px 20px 3px orange');
			$('#drop_zone').css('background-color', 'Bisque');
		}
		// Setup the dnd listeners.
		var dropZone = document.getElementById('drop_zone');
		dropZone.addEventListener('dragover', handleDragOver, false);
		dropZone.addEventListener('drop', handleFileDrop, false);
		dropZone.addEventListener('mouseout', handleMouseOut, false);
		dropZone.addEventListener('mouseover', handleMouseOver, false);

		// freebu.links.each(function(d,i){
		// 	var line =d3.select(this).select('line');
		// 	var x1 = Number(line.attr('x1'));
		// 	var x2 = Number(line.attr('x2'));
		// 	var x = Math.min(x1,x2);
		// 	if(x < 600) {
		// 		console.log(x);
		// 		console.log(d);
		// 	}
			
		// });
	},
	align_lists: function() {	
		var w = freebu.filter.list_w, h = freebu.filter.list_h;
		var x = freebu.width-w-freebu.filter.list_padding;
		
		freebu.filter.lists.each(function(d,i) { 
			var y = freebu.filter.list_padding*(i+1)+i*h;
			var list_node = d3.select(this);
			var bgrect = list_node.select("rect");
			bgrect.transition().attr("x", x).attr("y", y);
			var text = list_node.select("text");
			text.transition().attr("x",x+w/2).attr("y",y+h/2+5);
			//close button of the list
			var sw = 15, sh = h-40, offset = 5;
			var sx1 = x+w-sw+offset, sy1 = y + (h-sh)/2;
			var sx2 = x+w-offset, sy2 = sy1 + sh;
			var sx3 = sx2, sy3 = sy1;
			var sx4 = sx1, sy4 = sy2;
			var tagclose = list_node.select(".tagclose");
			var line1 = tagclose.select(".line1");
			line1.transition().attr("x1", sx1).attr("y1", sy1)
				 .attr("x2", sx2).attr("y2", sy2);
			var line2 = tagclose.select(".line2");
			line2.transition().attr("x1", sx3).attr("y1", sy3)
				 .attr("x2", sx4).attr("y2", sy4);
			var rect = tagclose.select("rect");
			rect.transition().attr("x", x+w-15).attr("y", y);
		});
	},// --- align_lists --- 
	check_list_mouse_over: function() {
		var mouseX = d3.event.x
			mouseY = d3.event.y; //console.log(mouseX+","+mouseY);
		freebu.filter.selected_list = null;	
		var lists = freebu.svg.selectAll(".list");
		lists.each(function(d,i){
			var rect = d3.select(this).select("rect");
			var x=rect.attr('x'),y=rect.attr('y')
				w=rect.attr('width'),h=rect.attr('height');
			var left = Number(mouseX)>Number(x);
			var right = Number(mouseX)<(Number(x)+Number(w));
			var top = Number(mouseY)>Number(y);
			var bottom = Number(mouseY)<(Number(y)+Number(h));
			if(left && right && top && bottom) {
			 	freebu.filter.selected_list =d.id;
			}
		});//console.log("selected list: " + freebu.filter.selected_list);
	},
	if_members_contain: function(members, id) {
		var b = false;
		for(var i=0; i<members.length; i++) {
			if(members[i].id == id) {
				b = true; break;
			}
		}
		return b;
	},
	init_node_search: function() {
		var arr = [];
		//name
		freebu.nodes.each(function(d,i){
			arr.push(d.name);
		});
		$.each(freebu.filter.summary, function(attr_type, obj) {
			//info
			if(attr_type == 'info') {
				$.each(obj, function(node_id, attr_arr) {
					for(var i=0; i<attr_arr.length; i++) {
						var attr_obj = attr_arr[i];
						if(attr_obj.is_info && arr.indexOf(attr_obj.value) == -1) {
							arr.push(attr_obj.value);
						}
					}
				});
			}//binary
			else if(attr_type == 'binary') {
				$.each(obj, function(binary_type, binary_obj) {
					if(binary_type == 'edu') {
						var binary_name = binary_obj.name;
						var binary_obj_arr = binary_obj.value;
						for(var i=0; i<binary_obj_arr.length; i++) {
							arr.push(binary_obj_arr[i].name);
						}
					}
				});
			}
		});//for each summary item
		freebu.filter.init_hound(arr)
	},// --- init_node_search --- 
	init_hound: function(arr) {
		var hound = new Bloodhound({
            limit: 10,
            datumTokenizer: Bloodhound.tokenizers.obj.whitespace('item'),
            queryTokenizer: Bloodhound.tokenizers.whitespace,
            local: $.map(arr, function(value) {
                return {item: value};
            })
        });
        hound.initialize();
        var typeahead_elem = $('.typeahead');
        typeahead_elem.typeahead({
            hint: true,
            highlight: true,
            minLength: 1
        },
        {
            name: 'item',
            displayKey: 'item',
            source: hound.ttAdapter(),
            templates: {
                // header: '<h3 class="node-names" style="background-color:white;margin-top:0px;margin-bottom:0px;padding-top:5px;padding-bottom:5px;">-'+arr_name+'-</h3>',
                empty: [
                    '<h5 class="node-names" style="background-color:white;margin-top:0px;margin-bottom:0px;padding-top:5px;padding-bottom:5px;">No item found.</h5>'
                ].join('\n')
            }
        });

        typeahead_elem.on("keyup", function(e){ 
        	if (e.which !== 0) {
				var query = $('.typeahead.tt-input').val(); 
				freebu.filter.search_nodes(query);
          	}
        });

        typeahead_elem.on("typeahead:selected", function(e) { 
        	var query = $('.typeahead.tt-input').val(); 
        	freebu.filter.search_nodes(query);
        });

        typeahead_elem.on("mouseout", function(e){
        	
        });

        return hound;
	},// --- init_hound ---
	search_nodes: function(query) { 
		//console.log("query: " + query);
		if(query == '') { 
			freebu.filter.filter_nodes();
		}//if
		else{
			var suggestions = [];
			for(var i=0; i<freebu.filter.suggestions.length; i++) {
				suggestions.push(freebu.filter.suggestions[i].item);
			}//console.log(suggestions);
			freebu.nodes.each(function(d,i){
				d.dormant = true;
				var circle = d3.select(this).select('circle');
				circle.transition().duration(freebu.moderate_duration)
					.style(freebu.node_dormant_color_style);
				var has_name = (suggestions.indexOf(d.name) != -1);	
				var has_binary = false;
				var has_info = false;
				if(!has_name) {
					for(var i=0; i<d.attributes.length; i++) {
						var attr = d.attributes[i];
						if(attr.type.indexOf('binary') != -1) {
							for(var j=0; j<attr.value.length; j++) {
								if(suggestions.indexOf(attr.value[j]) != -1) {
									has_binary = true; break;
								}
							}
						}
						else if(attr.type.indexOf('info') != -1) {
							if(suggestions.indexOf(attr.value) != -1) {
								has_info = true; break;
							}
						}
					}//for
				}
				if(has_name || has_binary || has_info) {
					d.dormant = false;
					circle.transition().duration(freebu.moderate_duration)
						.style(freebu.node_default_color_style);
				}
				else{
					circle.transition().duration(freebu.moderate_duration)
						.style(freebu.node_dormant_color_style);
				}
			});//for each node
		}//else
	}// --- search_nodes ---
}