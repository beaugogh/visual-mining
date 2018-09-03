Section = {
	vis:'',
	index: -1,
	id: '',
	text: '',
	text_obj: '',
	arr: [],
	graph: '',
	x: 0,
	y: 0,
	w: 0,
	h: 0,
	rect: '',
	fill_color: 'beige',
	fill_opacity: .05,
	stroke_color: 'none',
	init: function(vis, index, x, y, w, h, text, arr) {
		this.vis = vis;
		this.index = index;
		this.id = 'sect_'+index;
		this.x = x;
		this.y = y;
		this.w = w;
		this.h = h;
		this.text = text;
		this.arr = arr;
		this.rect = vis.g.append('rect')
					.attr('id', this.id+'_rect')
					.attr('x',this.x)
					.attr('y',this.y)
					.attr('width',this.w)
					.attr('height',this.h)
					.style('fill', this.fill_color)
					.style('fill-opacity', this.fill_opacity)
					.style('stroke', this.stroke_color);
		this.text_obj = vis.g.append('text')
					.attr('id', this.id+'_text')
					.attr('x', x)
					.attr('y', y+vis.font_size)
					.attr('dx', 10)
					.attr('dy', vis.font_size)
					.style('stroke', 'none')
					.style('fill', 'steelblue')
					.style('font-family', 'palatino')
					.style('text-anchor', 'left')
					.style('font-size', vis.font_size+5)
					.style('font-weight', 'bold')
					.text(this.text);
		this.graph = Object.create(Graph);
		this.graph.init(vis, this);
	},
	update_position: function(x, y, w, h) {
		this.x = x;
		this.y = y;
		this.w = w;
		this.h = h;
		this.rect
			.attr('x',x)
			.attr('y',y)
			.attr('width',w)
			.attr('height',h);
		this.text_obj
			.attr('x', x)
			.attr('y', y+this.vis.font_size);
		this.graph.drag_update_position();	
	}
}