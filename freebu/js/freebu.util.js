freebu.util = {
	is_empty: function(obj) {
	    for(var prop in obj) {
	        if(obj.hasOwnProperty(prop))
	            return false;
	    }

	    return true;
	},
	// --- disable/enable window scroll ---
	stop_scroll: function(e) {
		if(!e){ e = window.event; } /* IE7, IE8, Chrome, Safari */
		if(e.preventDefault) { e.preventDefault(); } /* Chrome, Safari, Firefox */
		e.returnValue = false; /* IE7, IE8 */
	},
	disable_window_scroll: function() { 
		document.onmousewheel = function(){ freebu.util.stop_scroll(); } /* IE7, IE8 */
		if(document.addEventListener){ /* Chrome, Safari, Firefox */
		    document.addEventListener('DOMMouseScroll', freebu.util.stop_scroll(), false);
		}
	},
	enable_window_scroll: function() {
		document.onmousewheel = null;  /* IE7, IE8 */
		if(document.addEventListener){ /* Chrome, Safari, Firefox */
		    document.removeEventListener('DOMMouseScroll', freebu.util.stop_scroll(), false);
		}
	},
	// check is a point is inside the freebu svg rectangle
	is_inside_svg: function(x,y) {
		var rect = freebu.svg[0][0].getBoundingClientRect();
		if(x > rect.left && x < rect.right && y > rect.top && y < rect.bottom)
			return true;
		else return false;
	},
	//confine x position within the svg rectangle
	confineX: function(x) {
		var rect = freebu.svg[0][0].getBoundingClientRect();
		var left = rect.left;
		var right = rect.right;
		var padding = 10;
		if(x<left+padding) return left+padding;
		else if(x>right-padding) return right-padding;
		else return x;
	},

	//confine y position within the svg rectangle
	confineY: function(y) {
		var rect = freebu.svg[0][0].getBoundingClientRect();
		var top = rect.top;
		var bottom = rect.bottom;
		var padding = 10;
		if(y<top+padding) return top+padding;
		else if(y>bottom-padding) return bottom-2*padding;
		else return y;
	},

	//insert a new css link to header
	create_css: function(filename) {
		var head = document.getElementsByTagName( 'head' )[0];
	    var fileref=document.createElement("link");
	        fileref.setAttribute("rel", "stylesheet");
	        fileref.setAttribute("type", "text/css");
	        fileref.setAttribute("href", filename);
	    head.appendChild(fileref);    
	    return fileref;
	},

	//repalce an old css link with a new one in header
	replace_css: function(oldfilename, newfilename) {
		var targetelement = "link";
		var targetattr = "href";
		var allsuspects = document.getElementsByTagName(targetelement);
		for(var i=allsuspects.length; i>0; i--) {
			if (allsuspects[i] && allsuspects[i].getAttribute(targetattr)!=null && allsuspects[i].getAttribute(targetattr).indexOf(oldfilename)!=-1) {
				var newelement = freebu.util.create_css(newfilename);
				allsuspects[i].parentNode.replaceChild(newelement, allsuspects[i]);
			}
		}
	}

};
