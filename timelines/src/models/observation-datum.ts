export class ObservationDatum {
	public id: string;
	public startMoment: Date;
	public endMoment: Date;

	constructor(id: string, startMoment: Date, endMoment: Date) {
		this.id = id;
		this.startMoment = startMoment;
		this.endMoment = endMoment;
	}
}
