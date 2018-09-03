dex.util = {
	has_item: function(item_name, items) {
		for(var i=0; i<items.length; i++) {
			if(item_name == items[i].name) {
				return items[i];
			}
		}
		return null;
	},
	if_rule_contains_items: function(rule, items) {
		var b = true;
		for(var i=0; i<items.length; i++) {
			if(rule.aset.indexOf(items[i].name) == -1 && rule.bset.indexOf(items[i].name) == -1) {
				b = false; break;
			}//if
		}//for
		return b;
	},
	mutual_info: function(rules, item1, item2) {
		var count1 = 0, count2 = 0, count_both = 0;
		var arr1 = [], arr2 = [], arr_both = [];
		arr1.push(item1); arr2.push(item2); 
		arr_both.push(item1); arr_both.push(item2);
		for(var i=0; i<rules.length; i++) {
			var b_both = dex.util.if_rule_contains_items(rules[i], arr_both);
			if(b_both) {
				count1++; count2++; count_both++;
			}
			else {
				var b1 = dex.util.if_rule_contains_items(rules[i], arr1);
				var b2 = dex.util.if_rule_contains_items(rules[i], arr2);
				if(b1) {count1++;}
				if(b2) {count2++;}
			}
		}//for
		
		var val = (count_both*dex.nr_items)/(count1*count2);
		val = Math.log(val);
		// console.log(count1+","+count2+","+count_both+": " + val);
		return val;
	}//mutual_info
}