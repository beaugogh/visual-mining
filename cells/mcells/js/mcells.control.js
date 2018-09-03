mcells.control = {
	vis: {},
	init: function(vis) { console.log('mcells.control init');
		this.vis = vis; 
		// ------ global graph resizing checkbox 
		// if checked, the nodes and links in a graph are resized according to global counts
		// else, resized according to local counts only
		var check_anchor_id = 'check_anchor';
		var check_checkbox_id = 'global_resize_checkbox';
		var check_html = '<label>global&nbsp;</label><input type="checkbox" id=\"'+check_checkbox_id+'\">';
		$(check_html).insertAfter('#'+check_anchor_id);
		$('#'+check_checkbox_id).change(function() {
			  var checked = $(this).is(':checked');
			  // console.log('global '+ checked);
			  if(checked) {
			  	for (var i = 0; i < vis.sections.length; i++) {
			  		vis.sections[i].graph.global_resize();
			  	};
			  }
			  else{
			  	for (var i = 0; i < vis.sections.length; i++) {
			  		vis.sections[i].graph.local_resize();
			  	};
			  }
		});
	}
	
};
