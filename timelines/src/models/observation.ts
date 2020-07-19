import { Timeline } from './timeline';
import * as d3 from 'd3';
import { Util } from '../utilities/util';
import { ObservationDatum } from './observation-datum';

export class Observation extends ObservationDatum {
	public timeline?: Timeline;
	/**
	 * visualization of an observation:
	 * a circle followed by a tail, the circle indicates the starting moment,
	 * the end of the tail line indicates the end moment
	 *    *----------
	 *    |          |
	 *  r, (x1,y1)   (x2,y2)
	 *
	 * r is the radius of the circle, (x1,y1) is the center of the circle,
	 * (x1,y1) and (x2,y2) are the two end points of the line
	 */
	public x1: number = 0;
	public x2: number = 0;
	public y: number = 0;
	public r: number = 7;
	public circleFill: string = 'grey';
	public circleStroke: string = 'none';
	public circleStrokeWidth: number = 1;
	public lineStroke: string = 'grey';
	public lineStrokeWidth: number = 3;
	public colorLocked: boolean = false;

	constructor(datum: ObservationDatum, timeline?: Timeline) {
		super(datum.id, datum.startMoment, datum.endMoment);
		this.timeline = timeline;
	}

	public updateDatum(datum: ObservationDatum) {
		this.id = datum.id;
		this.startMoment = datum.startMoment;
		this.endMoment = datum.endMoment;
	}

	/**
	 * @param selection This selection must be the circle node selection
	 */
	public drawCircle(selection: any): any {
		const size = 1000;
		return selection
			.transition()
			.duration(500)
			.attr('cx', this.x1)
			.attr('cy', this.y)
			.attr('r', this.r)
			.attr('fill', this.circleFill)
			.attr('stroke', this.circleStroke);
	}

	/**
	 * @param selection This selection must be the line node selection
	 */
	public drawLine(selection: any): any {
		return selection
			.transition()
			.duration(500)
			.attr('x1', this.x1)
			.attr('y1', this.y)
			.attr('x2', this.x2)
			.attr('y2', this.y)
			.attr('stroke', this.lineStroke)
			.attr('stroke-width', this.lineStrokeWidth);
	}

	/**
	 * @param selection This selection must be the circle node selection
	 */
	public onCircleMouseover(selection: any) {
		const brighter = d3
			.lab(this.circleFill)
			.brighter()
			.toString();
		const cThicker = this.circleStrokeWidth * 2;
		const lThicker = this.lineStrokeWidth * 2;
		// highlight the circle
		selection
			.attr('fill', brighter)
			.attr('stroke', brighter)
			.attr('stroke-width', cThicker);
		// highlight the line
		const parent = d3.select(selection.node().parentNode);
		parent
			.select('line')
			.attr('stroke', brighter)
			.attr('stroke-width', lThicker);
		// add contextual highlights
		this.addContextualHighlights(parent);
		// tell the timeline vue component that there is a new observation highlighted
		Util.timelinesVue.selectedObservation = this;
	}

	/**
	 * @param selection This selection must be the circle node selection
	 */
	public onCircleMouseout(selection: any) {
		selection
			.attr('fill', this.circleFill)
			.attr('stroke', this.circleStroke)
			.attr('stroke-width', this.circleStrokeWidth);
		const parent = d3.select(selection.node().parentNode);
		parent
			.select('line')
			.attr('stroke', this.lineStroke)
			.attr('stroke-width', this.lineStrokeWidth);
		// remove contextual highlights
		this.removeContextualHighlights(parent);
		// tell the timeline vue component that the observation is no longer highlighted
		Util.timelinesVue.selectedObservation = null;
	}
	/**
	 * @param selection This selection must be the parent node selection
	 */
	private addContextualHighlights(selection: any) {
		const translate = d3.select('.axis').attr('transform');
		const maxHeight = Number(translate.split(',')[1].replace(')', '')) + 55;
		// draw the vertical lines
		const vlines = [
			{ x1: this.x1, y1: -1, x2: this.x1, y2: this.y - this.r },
			{ x1: this.x1, y1: this.y + this.r, x2: this.x1, y2: maxHeight },
			{ x1: this.x2, y1: -1, x2: this.x2, y2: maxHeight }
		];
		selection
			.selectAll('.vertical-line')
			.data(vlines)
			.enter()
			.append('line')
			.classed('vertical-line', true)
			.attr('x1', (d: any) => d.x1)
			.attr('y1', (d: any) => d.y1)
			.attr('x2', (d: any) => d.x2)
			.attr('y2', (d: any) => d.y2)
			.attr('stroke', this.lineStroke);
		// draw the vertical labels
		const timeFormat = d3.timeFormat('%b %_d, %Y');
		const vlabels = [
			{ x: this.x1, y: maxHeight, label: timeFormat(this.startMoment) },
			{ x: this.x2, y: maxHeight, label: timeFormat(this.endMoment) }
		];
		if (Math.abs(this.x1 - this.x2) < 10) {
			vlabels.splice(1, 1);
		}
		selection
			.selectAll('.vertical-label')
			.data(vlabels)
			.enter()
			.append('text')
			.classed('vertical-label', true)
			.style('text-anchor', 'end')
			.attr('font-family', 'Helvetica')
			.attr('font-size', 12)
			.attr('dx', '-.5em')
			.attr('dy', '.5em')
			.attr('font-weight', 'bold')
			.attr('fill', d3.lab(this.lineStroke).darker())
			.attr(
				'transform',
				(d: any) => 'translate(' + d.x + ',' + d.y + ') rotate(-50)'
			)
			.text((d: any) => d.label);

		// emphasize the parent timeline's label to the left
		const parent = d3.select(selection.node().parentNode);
		parent
			.select('text')
			.attr('font-size', '1.1em')
			.attr('font-weight', 'bolder');
	}
	/**
	 * @param selection This selection must be the parent node selection
	 */
	private removeContextualHighlights(selection: any) {
		selection
			.selectAll('.vertical-line')
			.transition()
			.duration(200)
			.attr('stroke', 'transparent')
			.remove();
		selection
			.selectAll('.vertical-label')
			.transition()
			.duration(200)
			.attr('stroke', 'transparent')
			.remove();
		// de-emphasize the parent timeline's label to the left
		const parent = d3.select(selection.node().parentNode);
		parent
			.select('text')
			.attr('font-size', '0.9em')
			.attr('font-weight', 'normal');
	}
}
