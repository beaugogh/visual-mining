<template>
	<div class="timeline-container">
		<div class="input-container">
			<v-layout row wrap align-center="true" justify-center="true">
				<v-flex xs3>
					<v-container light>
						<v-text-field class="px-4" placeholder="Filter" v-model="filterTerm" @input="onFilter()"></v-text-field>
					</v-container>
				</v-flex>
				<v-flex xs4>
					<v-card min-height="80px" color="white">
						<template v-if="observationInfo.length > 0">
							<template v-for="(item, index) in observationInfo">
								<div class="text-sm-left info-item" :key="index">{{item}}</div>
							</template>
						</template>
						<template v-else>
							<div class="text-sm-left info-item-empty">Selected observation</div>
						</template>
					</v-card>
				</v-flex>
				<v-flex xs3>
					<v-container light>
						<v-btn color="primary" @click="onResetBrush()">Reset brush</v-btn>
					</v-container>
				</v-flex>
			</v-layout>
		</div>
	</div>
</template>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.timeline-container {
	background-color: white;
	width: 100%;
	height: 100%;
}
.input-container {
	position: fixed;
	width: 100%;
	background-color: lightblue;
	top: 0px;
	padding: 0.5em;
	z-index: 1;
	border-bottom: 1px lightgray dashed;
}
.input-container h2 {
	font-weight: bolder;
	font-family: Georgia, 'Times New Roman', Times, serif;
}
.container {
	padding: 0.5em;
}
.info-item-empty {
	margin-left: 1em;
	padding-top: 0.2em;
	color: lightgray;
	font-size: 1.1em;
	font-weight: bolder;
}
.info-item {
	margin-left: 1em;
	padding-top: 0.2em;
	color: gray;
	font-size: 1.1em;
	font-weight: bold;
}
</style>

<script lang="ts">
import { Component, Prop, Vue, Watch, Emit } from 'vue-property-decorator';
import { Timeline } from '../models/timeline';
import * as d3 from 'd3';
import { Observation } from '../models/observation';
import moment from 'moment';
import { Util } from '../utilities/util';
import { TimelineDatum } from '../models/timeline-datum';
import { ObservationDatum } from '../models/observation-datum';
import { TimeFormatOption } from '../models/time-format-option';

@Component
export default class Timelines extends Vue {
	public svg: any;
	public padding: number = 10;
	public spacing: number = 20; // the spacing between two adjacent timelines
	public xScale: any;
	public axis: any;
	public minDate!: Date;
	public maxDate!: Date;
	public brush: any;
	public timeFormat: any;
	public categoricalColors: any;
	public filterTerm: string = '';
	public selectedObservation?: any = null;

	@Prop() private data!: TimelineDatum[];
	// the subset of the 'data' from filtering actions
	private filteredData: TimelineDatum[] = [];
	// the subset of the 'data' from brushing actions
	private brushedData: TimelineDatum[] = [];
	// the visual representation of the intersection of the filtered and the brushed data
	private timelines: Timeline[] = [];

	constructor() {
		super();
	}

	@Watch('data', { deep: true })
	public onDataChanged() {
		// when data is changed, reset the filtered data and the brushed data
		this.filteredData = this.data;
		this.brushedData = this.data;
		this.visualize();
	}

	public onFilter() {
		this.filteredData = this.data.filter((t: TimelineDatum) => {
			return t.label.includes(this.filterTerm);
		});
		this.visualize();
	}
	public onResetBrush() {
		this.brushedData = this.data;
		this.clearBrush();
		this.visualize();
	}

	public toggleAxisFormat(option: TimeFormatOption) {
		this.timeFormat = this.getTimeFormat(option);
		this.axis.tickFormat(this.timeFormat);
		this.svg.select('.axis').call(this.axis);
	}

	get observationInfo(): any[] {
		if (this.selectedObservation) {
			return [
				this.selectedObservation.timeline.label,
				this.timeFormat(this.selectedObservation.startMoment),
				this.timeFormat(this.selectedObservation.endMoment)
			];
		} else {
			return [];
		}
	}

	private mounted() {
		this.initialize();
	}

	private initialize() {
		Util.timelinesVue = this;
		// append svg
		this.svg = d3
			.select('.timeline-container')
			.append('svg')
			.attr('width', '100%')
			.attr('height', '2000px')
			.style('position', 'absolute')
			.style('top', '66px')
			.style('left', '3px')
			.style('z-index', 0);
		// create color palette
		this.categoricalColors = Util.shuffle(
			d3.schemeCategory10.concat(d3.schemeDark2)
		);
		// create time format
		this.timeFormat = this.getTimeFormat(TimeFormatOption.ABSOLUTE);
		// append axis graphical element
		this.svg.append('g').classed('axis', true);
		// append brush graphical element
		this.svg.append('g').classed('brush', true);
		this.brush = d3.brushX().on('end', this.brushed);
		// handle window resize
		window.addEventListener('resize', _ => {
			this.prepareTimelines();
			this.visualizeUpdate();
			this.visualizeAxis();
		});
	}

	private brushed() {
		const selection = d3.event.selection;
		if (selection) {
			const min: Date = this.xScale.invert(selection[0]);
			const max: Date = this.xScale.invert(selection[1]);
			const subset: TimelineDatum[] = [];
			this.data.forEach((t: TimelineDatum) => {
				const observationData: ObservationDatum[] = [];
				t.observationData.forEach((o: ObservationDatum) => {
					if (
						moment(o.startMoment).isSameOrAfter(min) &&
						moment(o.endMoment).isSameOrBefore(max)
					) {
						observationData.push(o);
					}
				});
				if (observationData.length > 0) {
					subset.push(new TimelineDatum(t.id, t.label, observationData));
				}
			});
			this.brushedData = subset;
			this.clearBrush();
			this.visualize();
		}
	}

	private clearBrush() {
		d3.select('.brush').call(this.brush.move, null);
	}

	/**
	 * Update visual data for timeline rendering.
	 */
	private prepareTimelines() {
		// compute the intersection between filtered and brushed data
		const data: TimelineDatum[] = this.intersect(
			this.filteredData,
			this.brushedData
		);
		/**
		 * Derive the enter, update and exit ids
		 * based on data (as the intersection aforementionied) and the visual data (as in timelines)
		 */
		const dataIds: string[] = data.map((t: TimelineDatum) => {
			return t.id;
		});
		const visualDataIds: string[] = this.timelines.map((t: Timeline) => {
			return t.id;
		});
		const enterIds: string[] = dataIds.filter((dataId: string) => {
			return !visualDataIds.includes(dataId);
		});
		const updateIds: string[] = dataIds.filter((dataId: string) => {
			return visualDataIds.includes(dataId);
		});
		const exitIds: string[] = visualDataIds.filter((visualDataId: string) => {
			return !dataIds.includes(visualDataId);
		});
		// remove timelines with exit ids
		if (exitIds.length > 0) {
			this.timelines = this.timelines.filter((t: Timeline) => {
				return !exitIds.includes(t.id);
			});
		}
		/**
		 * retrieve dimensions of the parent container
		 */
		const padding = this.padding;
		const spacing = this.spacing;
		const node: any = d3.select('.timeline-container').node();
		const top = node['offsetTop'] as number;
		const left = node['offsetLeft'] as number;
		const leftStart = left + 10 * padding; // the left start position of the timelines
		const w = node['offsetWidth'] as number;
		const h = node['offsetHeight'] as number;
		// console.log('w, h, top, left: ', w, ',', h, ', ', top, ', ', left);
		/**
		 * find the min and max dates of all observations,
		 * insert new timelines with enter ids
		 */
		const allDates: Date[] = [];
		data.forEach((t: TimelineDatum, i: number) => {
			// insert new visual data based on enterIds
			if (enterIds.includes(t.id)) {
				this.timelines.splice(i, 0, new Timeline(t));
			}
			t.observationData.forEach((o: ObservationDatum) => {
				allDates.push(o.startMoment);
				allDates.push(o.endMoment);
			});
		});
		this.minDate = d3.min(allDates) as Date;
		this.maxDate = d3.max(allDates) as Date;
		/**
		 * construct scales for x and y directions
		 */
		this.xScale = d3
			.scaleTime()
			.domain([this.minDate, this.maxDate])
			.range([leftStart, left + w - padding]);
		const xmin = this.xScale(this.minDate);
		const xmax = this.xScale(this.maxDate);
		let ymax = padding;
		/**
		 * update the remaining timelines with update ids and
		 * initialize the visual data for each timeline and each observation
		 */
		this.timelines.forEach((t: Timeline, i: number) => {
			if (updateIds.includes(t.id)) {
				t.updateDatum(data[i]);
			}
			const colorIndex = i % this.categoricalColors.length;
			t.x1 = xmin;
			t.x2 = xmax;
			t.y = 2 * padding + spacing * i;
			ymax = t.y + spacing;
			t.observations.forEach((o: Observation) => {
				o.x1 = this.xScale(o.startMoment);
				o.x2 = this.xScale(o.endMoment);
				o.y = t.y;
				if (!o.colorLocked) {
					o.circleFill = this.categoricalColors[colorIndex];
					o.lineStroke = o.circleFill;
					o.colorLocked = true;
				}
			});
		});
		/**
		 * initialize axis
		 */
		this.axis = d3
			.axisBottom(this.xScale)
			.ticks(12)
			.tickFormat(this.timeFormat)
			.tickSize(10)
			.tickPadding(5);
		this.svg
			.select('.axis')
			.transition()
			.duration(300)
			.attr('transform', 'translate(0,' + ymax + ')');
		// resize svg
		this.svg.attr('height', ymax + 10 * spacing);
		/**
		 * initialize brush
		 */
		const extentX = Number(this.svg.style('width').split('px')[0]);
		const extentY = ymax + 10;
		this.brush.extent([[left, 0], [extentX, extentY]]);
		d3.select('.brush').call(this.brush);
	}

	private getTimeFormat(option: TimeFormatOption): (d: Date) => string {
		if (option === TimeFormatOption.RELATIVE) {
			return (d: Date) => {
				return Util.formatRelativeDate(d, this.minDate);
			};
		} else {
			// alternative formats: '%Y-%m-%d', '%Y-%b-%d'
			return d3.timeFormat('%b %_d, %Y');
		}
	}

	/**
	 * Remark:
	 * Typescript gives out error when directly using 'd3.select(this)' inside 'each()',
	 * need to use the old function syntax, and provide 'this' as the 1st argument
	 */
	// draw newly introduced timelines
	private visualizeEnter() {
		const timelineGroup = this.timelineNodeSelection(this.timelines)
			.enter()
			.append('g')
			.classed('timeline', true);

		// draw the grey base line of the current timeline
		timelineGroup.append('line').each(function(this: any, t: Timeline) {
			t.drawLine(d3.select(this));
		});
		// draw the label of the current timeline
		timelineGroup.append('text').each(function(this: any, t: Timeline) {
			t.drawLabel(d3.select(this));
		});

		const observationGroup = this.observationNodeSelection(this.timelines)
			.enter()
			.append('g')
			.classed('observation', true);

		// draw the line for each observation
		observationGroup.append('line').each(function(this: any, o: Observation) {
			o.drawLine(d3.select(this));
		});
		// draw the circle for each observation
		observationGroup
			.append('circle')
			.each(function(this: any, o: Observation) {
				o.drawCircle(d3.select(this));
			})
			.on('mouseover', function(this: any, o: Observation) {
				o.onCircleMouseover(d3.select(this));
			})
			.on('mouseout', function(this: any, o: Observation) {
				o.onCircleMouseout(d3.select(this));
			});
	}
	// draw existing but updated timelines
	private visualizeUpdate() {
		const timelines = this.timelines;
		// draw the grey base line of the current timeline
		const timelineNode = this.timelineNodeSelection(timelines);
		timelineNode.select('line').each(function(this: any, t: Timeline) {
			t.drawLine(d3.select(this));
		});
		timelineNode.select('text').each(function(this: any, t: Timeline) {
			t.drawLabel(d3.select(this));
		});
		const observationNode = this.observationNodeSelection(timelines);

		// draw the circle for each observation
		observationNode
			.selectAll('circle')
			.each(function(this: any, o: Observation) {
				o.drawCircle(d3.select(this));
			});
		// draw the line for each observation
		observationNode.selectAll('line').each(function(this: any, o: Observation) {
			o.drawLine(d3.select(this));
		});
	}
	// draw exiting timelines and remove them
	private visualizeExit() {
		// remove timeline elements of which the data has been removed
		this.timelineNodeSelection(this.timelines)
			.exit()
			.transition()
			.remove();
		this.observationNodeSelection(this.timelines)
			.exit()
			.transition()
			.remove();
	}
	// draw time axis
	private visualizeAxis() {
		this.svg
			.select('.axis')
			.transition()
			.delay(301)
			.duration(300)
			.call(this.axis)
			.selectAll('text')
			.transition()
			.style('text-anchor', 'end')
			.attr('font-family', 'Helvetica')
			.attr('font-weight', 'bold')
			.attr('dx', '-.8em')
			.attr('dy', '.15em')
			.attr('transform', 'rotate(-50)');
	}
	// draw all
	private visualize() {
		this.prepareTimelines();
		this.visualizeEnter();
		this.visualizeUpdate();
		this.visualizeExit();
		this.visualizeAxis();
	}
	/**
	 * get the d3 timeline node selection,
	 * note that such nodes only exist when visualizeEnter() appends them
	 */
	private timelineNodeSelection(timelines: Timeline[]) {
		return this.svg.selectAll('.timeline').data(timelines, this.keyBound);
	}

	/**
	 * get the d3 observation node selection,
	 * note that such nodes exist only after visualizeEnter() appends them
	 */
	private observationNodeSelection(timelines: Timeline[]) {
		return this.timelineNodeSelection(timelines)
			.selectAll('.observation')
			.data((t: Timeline) => {
				return t.observations;
			}, this.keyBound);
	}

	/**
	 * key binding function to explictily tell d3 to bind selection with id as keys
	 */
	private keyBound(d: Timeline | Observation) {
		return d.id;
	}

	/**
	 * compute the intersection between two TimelineDatum collections based on the id field
	 */
	private intersect(a: TimelineDatum[], b: TimelineDatum[]): TimelineDatum[] {
		const aIds = a.map((t: TimelineDatum) => {
			return t.id;
		});
		return b.filter((t: TimelineDatum) => {
			return aIds.includes(t.id);
		});
	}
}
</script>
