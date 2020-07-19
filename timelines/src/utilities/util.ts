import moment from 'moment';
import Diff = moment.unitOfTime.Diff;
import * as d3 from 'd3';

export class Util {
	public static readonly timeUnits: Diff[] = [
		'year',
		'month',
		'day',
		'hour',
		'minute',
		'second'
	];
	public static timelinesVue: any = null;

	public static formatRelativeDate(target: Date, minDate: Date): string {
		const t1 = moment(minDate);
		const t2 = moment(target);
		const f = d3.format('.1f');
		for (let i = 0; i < Util.timeUnits.length; i++) {
			const unit = this.timeUnits[i];
			const diffRound = Math.abs(Math.round(t1.diff(t2, unit)));
			if (diffRound > 0) {
				const diff = Math.abs(t1.diff(t2, unit, true));
				return `${f(diff)} ${unit}${diff > 1 ? 's' : ''}`;
			}
		}
		return 'beginning';
	}

	public static uuid(): string {
		let dt = new Date().getTime();
		const uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
			const r = (dt + Math.random() * 16) % 16 | 0;
			dt = Math.floor(dt / 16);
			return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16);
		});
		return uuid;
	}

	public static randomIndex(range: number): number {
		return Math.floor(Math.random() * range);
	}

	public static randomName(): string {
		const adjIndex = Util.randomIndex(Util.adjectives.length);
		const adj = Util.adjectives[adjIndex];
		const nounIndex = Util.randomIndex(Util.nouns.length);
		const noun = Util.nouns[nounIndex];
		return adj + ' ' + noun;
	}

	public static shuffle(array: any[]): any[] {
		return array.sort(() => Math.random() - 0.5);
	}

	private static adjectives = [
		'adamant',
		'adroit',
		'amatory',
		'animistic',
		'antic',
		'arcadian',
		'baleful',
		'bellicose',
		'bilious',
		'boorish',
		'calamitous',
		'caustic',
		'cerulean',
		'comely',
		'concomitant',
		'contumacious',
		'corpulent',
		'crapulous',
		'defamatory',
		'didactic',
		'dilatory',
		'dowdy',
		'efficacious',
		'effulgent',
		'egregious',
		'endemic',
		'equanimous',
		'execrable',
		'fastidious',
		'feckless',
		'fecund',
		'friable',
		'fulsome',
		'garrulous',
		'guileless',
		'gustatory',
		'heuristic',
		'histrionic',
		'hubristic',
		'incendiary',
		'insidious',
		'insolent',
		'intransigent',
		'inveterate',
		'invidious',
		'irksome',
		'jejune',
		'jocular',
		'judicious',
		'lachrymose',
		'limpid',
		'loquacious',
		'luminous',
		'mannered',
		'mendacious',
		'meretricious',
		'minatory',
		'mordant',
		'munificent',
		'nefarious',
		'noxious',
		'obtuse',
		'parsimonious',
		'pendulous',
		'pernicious',
		'pervasive',
		'petulant',
		'platitudinous',
		'precipitate',
		'propitious',
		'puckish',
		'querulous',
		'quiescent',
		'rebarbative',
		'recalcitant',
		'redolent',
		'rhadamanthine',
		'risible',
		'ruminative',
		'sagacious',
		'salubrious',
		'sartorial',
		'sclerotic',
		'serpentine',
		'spasmodic',
		'strident',
		'taciturn',
		'tenacious',
		'tremulous',
		'trenchant',
		'turbulent',
		'turgid',
		'ubiquitous',
		'uxorious',
		'verdant',
		'voluble',
		'voracious',
		'wheedling',
		'withering',
		'zealous'
	];
	private static nouns = [
		'ninja',
		'chair',
		'pancake',
		'statue',
		'unicorn',
		'rainbows',
		'laser',
		'senor',
		'bunny',
		'captain',
		'nibblets',
		'cupcake',
		'carrot',
		'gnomes',
		'glitter',
		'potato',
		'salad',
		'toejam',
		'curtains',
		'beets',
		'toilet',
		'exorcism',
		'stick figures',
		'mermaid eggs',
		'sea barnacles',
		'dragons',
		'jellybeans',
		'snakes',
		'dolls',
		'bushes',
		'cookies',
		'apples',
		'ice cream',
		'ukulele',
		'kazoo',
		'banjo',
		'opera singer',
		'circus',
		'trampoline',
		'carousel',
		'carnival',
		'locomotive',
		'hot air balloon',
		'praying mantis',
		'animator',
		'artisan',
		'artist',
		'colorist',
		'inker',
		'coppersmith',
		'director',
		'designer',
		'flatter',
		'stylist',
		'leadman',
		'limner',
		'make-up artist',
		'model',
		'musician',
		'penciller',
		'producer',
		'scenographer',
		'set decorator',
		'silversmith',
		'teacher',
		'auto mechanic',
		'beader',
		'bobbin boy',
		'clerk of the chapel',
		'filling station attendant',
		'foreman',
		'maintenance engineering',
		'mechanic',
		'miller',
		'moldmaker',
		'panel beater',
		'patternmaker',
		'plant operator',
		'plumber',
		'sawfiler',
		'shop foreman',
		'soaper',
		'stationary engineer',
		'wheelwright',
		'woodworkers'
	];
}
