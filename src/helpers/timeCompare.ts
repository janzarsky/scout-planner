import {Temporal} from "@js-temporal/polyfill";

export function minTime(a: Temporal.PlainTime, ...b: Temporal.PlainTime[]): Temporal.PlainTime {
	return b.reduce((acc, time) => {
		return Temporal.PlainTime.compare(acc, time) < 0 ? acc : time
	}, a)
}

export function maxTime(a: Temporal.PlainTime, ...b: Temporal.PlainTime[]): Temporal.PlainTime {
	return b.reduce((acc, time) => {
		return Temporal.PlainTime.compare(acc, time) > 0 ? acc : time
	}, a)
}
