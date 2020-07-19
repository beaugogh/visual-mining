import { Observation } from './observation';
import { TimelineDatum } from './timeline-datum';
import { ObservationDatum } from './observation-datum';

export class Timeline extends TimelineDatum {
	public observations: Observation[];
	// visual parameters
	public x1: number = 0;
	public x2: number = 0;
	public y: number = 0;
	public lineStroke: string = 'lightgray';
	public textStroke: string = 'none';
	public textFill: string = '#303030'; // darker gray
	public fontFamily: string = 'Helvetica';
	public fontSize: number = 12;

	constructor(datum: TimelineDatum) {
		super(datum.id, datum.label, datum.observationData);
		this.observations = datum.observationData.map(
			(obsDatum: ObservationDatum) => {
				return new Observation(obsDatum, this);
			}
		);
	}

	public updateDatum(datum: TimelineDatum) {
		this.id = datum.id;
		this.label = datum.label;
		this.observationData = datum.observationData;
		const dataIds: string[] = this.observationData.map(
			(o: ObservationDatum) => {
				return o.id;
			}
		);
		const visualDataIds: string[] = this.observations.map((o: Observation) => {
			return o.id;
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
		// remove observations with exit ids
		this.observations = this.observations.filter((o: Observation) => {
			return !exitIds.includes(o.id);
		});
		// insert new observations with enter ids
		this.observationData.forEach((o: ObservationDatum, i: number) => {
			if (enterIds.includes(o.id)) {
				this.observations.splice(i, 0, new Observation(o, this));
			}
		});
		// update the observations with update ids
		this.observations.forEach((o: Observation, i: number) => {
			if (updateIds.includes(o.id)) {
				o.updateDatum(this.observationData[i]);
			}
		});
	}

	public drawLine(selection: any): any {
		return selection
			.transition()
			.duration(500)
			.attr('x1', this.x1)
			.attr('y1', this.y)
			.attr('x2', this.x2)
			.attr('y2', this.y)
			.attr('stroke', this.lineStroke)
			.attr('stroke-width', '1px');
	}

	public drawLabel(selection: any): any {
		return selection
			.transition()
			.duration(500)
			.text(this.label)
			.attr('x', this.x1 - 10)
			.attr('y', this.y)
			.attr('dy', this.fontSize / 2)
			.attr('stroke', this.textStroke)
			.attr('fill', this.textFill)
			.attr('font-size', this.fontSize)
			.attr('font-family', this.fontFamily)
			.style('text-anchor', 'end');
	}
}
