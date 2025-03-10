import '@/utils/lodash-fix';
import _ from "@/npm/lodash/index";
import { isAnyEmpty } from './util';
export const HOUR_MS = 3600 * 1000
export const DAYS_MS = 7 * 24 * HOUR_MS
export function getUTCTMSAddDays(days) {
	return getUTCMS() + days * DAYS_MS
}

export function getDateDays(date, days) {
	return new Date(date).getTime() + days * DAYS_MS
}

export function getDateHoursAdd(date, hours) {
	if (_.isNil(date)) return date
	return new Date(new Date(date).getTime() + hours * HOUR_MS)
}

export function getUTCMS() {
	const now = new Date()
	return now.getTime() + now.getTimezoneOffset() * 60000
}

export function dateTextToday() {
	const d = new Date()
	let values = [d.getFullYear(), d.getMonth() + 1, d.getDate()]
	values = _.map(values, value => _.padStart(value, 2, "0"))
	return _.join(values, "/")
}
export function dateText(ts) {
	const d = new Date(ts)
	return _.join([_.padStart(d.getMonth() + 1, 2, '0'), _.padStart(d.getDate(), 2, '0')], "-")
}

export function formatDate(d) {
	if (_.isNil(d)) return d
	const date = [d.getMonth() + 1, d.getDate()].join("-")
	const time = [d.getHours(), d.getMinutes(), d.getSeconds()].join(":")
	return [date, time].join(" ")
}