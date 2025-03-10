import {
	dateText
} from "@/utils/date"
import '@/utils/lodash-fix';
import _ from "@/npm/lodash/index";
import {
	TYPE_TITLE,
	TYPE_HEADER,
	TYPE_TEXT,
	TYPE_IMAGE
} from "@/utils/constant"
import {
	addLevel
} from "./util"
const DATA_CATEGORY_TITLE = "TITLE"
const DATA_CATEGORY_CONTENT_TITLE = "CONTENT_TITLE"
const DATA_CATEGORY_RICH = "RICH"
const ITEM_TYPE_RICH = "rich"
const ITEM_TYPE_IMAGE = "image"
const typeMaps = {
	[DATA_CATEGORY_TITLE]: TYPE_TITLE,
	[DATA_CATEGORY_CONTENT_TITLE]: TYPE_HEADER,
	[DATA_CATEGORY_RICH]: TYPE_TEXT,
}
export function toWord(officeFile) {
	const create_time = Date.parse(officeFile['create_time'])
	const slide = JSON.parse(_.first(officeFile["slides"]))
	const objects = slide["objects"]
	let items = _.map(objects, obj => {
		const dataCategory = obj["data_category"]
		const level = obj["level"]
		const html = obj["html"]
		const base64 = obj["base64"]
		let deep = _.split(level, ".").length - 1
		switch (obj['type']) {
			case ITEM_TYPE_RICH:
				const type = _.get(typeMaps, [dataCategory], TYPE_TEXT)
				if (type !== TYPE_HEADER) deep = null
				return ({
					type,
					level,
					content: html,
					deep
				})

			case ITEM_TYPE_IMAGE:
				return ({
					type: TYPE_IMAGE,
					level,
					content: base64
				})
			default:
				return null
		}
	})
	items = _.reject(items, item => _.isNil(item))
	return {
		items,
		id: officeFile.id,
		filename: officeFile.filename,
		create_time,
		create_text: dateText(create_time)
	}
}
export function toOfficeFile({
	items,
	filename,
	id
}) {
	addLevel(items)
	const elements = _.map(items, it => {
		switch (it.type) {
			case TYPE_TITLE:
				return getRich(it.content, DATA_CATEGORY_TITLE, it.level)
			case TYPE_HEADER:
				return getRich(it.content, DATA_CATEGORY_CONTENT_TITLE, it.level)
			case TYPE_TEXT:
				return getRich(it.content, DATA_CATEGORY_RICH, it.level)
			case TYPE_IMAGE:
				return getImage(it.content)
		}
	})
	const slide = {
		objects: elements
	}
	return ({
		id,
		filename,
		office_type: "word",
		slides: [JSON.stringify(slide)]
	})
}

function getRich(content, category, level) {
	return ({
		type: ITEM_TYPE_RICH,
		data_category: category,
		html: content,
		level: level
	})
}

function getImage(content) {
	return {
		type: ITEM_TYPE_IMAGE,
		base64: content
	}
}