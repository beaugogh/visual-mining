import { ObservationDatum } from './observation-datum';

export class TimelineDatum {
	public id: string;
	public label: string;
	public observationData: ObservationDatum[];

	constructor(id: string, label: string, observationData: ObservationDatum[]) {
		this.id = id;
		this.label = label;
		this.observationData = observationData;
	}
}
