import * as d3 from 'd3';
import moment from 'moment';
import { Util } from './util';
import { ObservationDatum } from '../models/observation-datum';
import { TimelineDatum } from '../models/timeline-datum';

export class TimelineDataGenerator {
	public static generateATimeline(
		label: string,
		startDate: Date,
		endDate: Date,
		numDataPoints: number
	): TimelineDatum {
		const timeScale = d3
			.scaleTime()
			.domain([startDate, endDate])
			.range([0, numDataPoints + 1]);
		const observations: ObservationDatum[] = [];
		d3.range(numDataPoints).forEach(n => {
			const plusOrMinus = Math.random() < 0.5 ? -1 : 1;
			const maxChange = 0.8;
			const change = Math.random() * maxChange;
			const num = plusOrMinus * change + n;
			// the start moment of this observation
			const startMoment = timeScale.invert(num);
			// the max end moment of this observation
			const maxEndMoment = timeScale.invert(n + 1);
			const diff = Math.random() * moment(maxEndMoment).diff(startMoment);
			const duration = moment.duration(diff);
			const endMoment = moment(startMoment)
				.add(duration)
				.toDate();
			observations.push(new ObservationDatum(Util.uuid(), startMoment, endMoment));
		});
		return new TimelineDatum(Util.uuid(), label, observations);
	}

	public static generateTimelines(
		numTimelines: number,
		maxNumDataPoints: number
	): TimelineDatum[] {
		const startDateStart = new Date(1987, 1, 11);
		const startDateEnd = new Date(2006, 8, 31);
		const endDateStart = new Date(2006, 9, 1);
		const endDateEnd = new Date(2019, 3, 31);
		const startDateScale = d3
			.scaleTime()
			.domain([startDateStart, startDateEnd])
			.range([0, numTimelines]);
		const endDateScale = d3
			.scaleTime()
			.domain([endDateStart, endDateEnd])
			.range([0, numTimelines]);
		const timelines: TimelineDatum[] = [];
		d3.range(numTimelines).forEach(n => {
			const idx = Math.random() * numTimelines;
			const numDataPoints = Math.ceil(Math.random() * maxNumDataPoints);
			const startDate = startDateScale.invert(idx);
			const endDate = endDateScale.invert(idx);
			const t = TimelineDataGenerator.generateATimeline(
				Util.randomName(),
				startDate,
				endDate,
				numDataPoints
			);
			timelines.push(t);
		});

		return timelines;
	}
}
