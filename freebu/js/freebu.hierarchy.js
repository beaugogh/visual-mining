freebu.hierarchy = {
	root:{},
	get_top_level_of_branch: function(branch) {
		var flat = {}; flat.name = branch.name;
		flat.children = [];
		var children = branch.children;
		for(var i=0; i<children.length; i++) {
			var child = children[i];
			var desc = [];
			freebu.hierarchy.get_descendants(child, desc);
			var flat_branch = {};
			flat_branch.name = child.name;
			flat_branch.children = desc;
			flat.children.push(flat_branch);
		}
		return flat;
	},
	get_descendants: function(branch, desc) {
		if(branch.children) {
			var children = branch.children;
			for(var i=0; i<children.length; i++) {
				var child = children[i];
				if(!child.children) {
					desc.push(child);
				}
				else{
					freebu.hierarchy.get_descendants(child,desc);
				}
			}//for
		}
	},
	get_all_descendants: function(branch, desc) {
		if(branch.children) {
			var children = branch.children;
			for(var i=0; i<children.length; i++) {
				var child = children[i];
				if(child.children) {
					desc.mid_nodes.push(child);
					freebu.hierarchy.get_all_descendants(child,desc);
				}
				else{
					desc.leaves.push(child);
				}
			}//for
		}
	},
	search_branch_by_name: function(branch, name) {
		//console.log('checking: ' + branch.name);
		if(branch.name == name) { //console.log("found it");
			//freebu.hierarchy.focused_branch = branch;
			return branch;
		}
		if(branch.children) {
			var children = branch.children;
			for(var i=0; i<children.length; i++) {
				var child = children[i]; 
				var found = freebu.hierarchy.search_branch_by_name(child, name);
				if(found) return found;
			}
		}
		else return false;
	}
}