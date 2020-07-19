<template>
	<v-app id="app-main">
		<Timelines :data="data" ref="timelinesRef"/>
		<div class="footer">
			<v-tooltip top>
				<template v-slot:activator="{ on }">
					<v-btn color="success" v-on="on" @click="onEnterBtnClick()">Add</v-btn>
				</template>
				<span>Generate a timeline</span>
			</v-tooltip>
			<v-tooltip top>
				<template v-slot:activator="{ on }">
					<v-btn color="info" v-on="on" @click="onUpdateBtnClick()">Update</v-btn>
				</template>
				<span>Update a timeline</span>
			</v-tooltip>
			<v-tooltip top>
				<template v-slot:activator="{ on }">
					<v-btn color="error" v-on="on" @click="onExitBtnClick()">Remove</v-btn>
				</template>
				<span>Remove a timeline</span>
			</v-tooltip>

			<span>&nbsp;&nbsp;&nbsp;</span>
			<v-btn-toggle v-model="timeFormatOption" mandatory @change="toggleAxisFormat()">
				<v-btn flat value="absolute">Absolute</v-btn>
				<v-btn flat value="relative">Relative</v-btn>
			</v-btn-toggle>
		</div>
	</v-app>
</template>

<style>
#app-main {
	background-color: transparent;
	font-family: 'Avenir', Helvetica, Arial, sans-serif;
	-webkit-font-smoothing: antialiased;
	-moz-osx-font-smoothing: grayscale;
	text-align: center;
	color: #2c3e50;
	margin-top: 60px;
}
.footer {
	position: fixed;
	bottom: 0px;
	width: 100%;
	background-color: lightgray;
}
</style>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import Timelines from './components/timelines.vue';
import { Timeline } from './models/timeline';
import { TimelineDataGenerator } from './utilities/timeline-data-generator';
import { Util } from './utilities/util';
import moment from 'moment';
import { TimelineDatum } from './models/timeline-datum';
import { TimeFormatOption } from './models/time-format-option';

@Component({
	components: {
		Timelines
	}
})
export default class App extends Vue {
	public data: TimelineDatum[] = [];
	public dataSource: TimelineDatum[] = [];
	public timeFormatOption: TimeFormatOption = TimeFormatOption.ABSOLUTE;

	public toggleAxisFormat() {
		const ref = this.$refs.timelinesRef as Timelines;
		ref.toggleAxisFormat(this.timeFormatOption);
	}
	/**
	 * Add some new dummy timeline data for testing
	 */
	public onEnterBtnClick() {
		const ts = TimelineDataGenerator.generateTimelines(1, 10);
		this.dataSource.push(ts[0]);
		this.updateTimelinesData();
	}
	/**
	 * Change some existing timeline data for testing
	 */
	public onUpdateBtnClick() {
		const timelines = this.dataSource;
		const tIndex = Util.randomIndex(timelines.length);
		const t = this.dataSource[tIndex];
		const oIndex = Util.randomIndex(t.observationData.length);
		const plusOrMinus = Math.random() > 0.5 ? 1 : -1;
		const o = t.observationData[oIndex];
		const n = 6;
		if (Math.random() > 0.5) {
			o.startMoment = moment(o.startMoment)
				.subtract(n, 'month')
				.toDate();
			o.endMoment = moment(o.endMoment)
				.subtract(n, 'month')
				.toDate();
		} else {
			o.startMoment = moment(o.startMoment)
				.add(n, 'month')
				.toDate();
			o.endMoment = moment(o.endMoment)
				.add(n, 'month')
				.toDate();
		}
		this.updateTimelinesData();
	}

	/**
	 * Remove an arbitrary timeline for testing
	 */
	public onExitBtnClick() {
		const tIndex = Util.randomIndex(this.dataSource.length);
		this.dataSource.splice(tIndex, 1);
		this.updateTimelinesData();
	}

	private mounted() {
		// the root app component is firstly created
		// then the child components are created and mounted
		// lastly the root app component is mounted
		this.dataSource = TimelineDataGenerator.generateTimelines(11, 10);
		this.updateTimelinesData();
	}

	private updateTimelinesData() {
		this.data = this.dataSource;
	}
}
</script>

