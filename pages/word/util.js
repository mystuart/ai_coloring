import '@/utils/lodash-fix';
import _ from "@/npm/lodash/index";
import {
	TYPE_TITLE,
	TYPE_HEADER,
	TYPE_TEXT,
	TYPE_IMAGE
} from "@/utils/constant"
import {
	getWebUrl
} from '@/utils/service';
import {
	sample_base64
} from '@/utils/image';

export const SAMPLE_FILE_NAME = "AI WORD 的关键特色"
export const NEW_FILE_NAME = "我的AI WORD文件"
const IMAGE_TEST = [{
	type: TYPE_HEADER,
	content: "图片",
	deep: 0
}, {
	type: TYPE_IMAGE,
	content: sample_base64
}]
const IMAGE_ITEMS = [{
	type: TYPE_HEADER,
	content: "APP版本",
	deep: 0
}, {
	type: TYPE_TEXT,
	content: "如果在这里使用并不方便，那么可以下载AI功能更为丰富的APP版本:https://rocy-ai.wang/download/ai-assistant.apk"
}, {
	type: TYPE_IMAGE,
	content: getWebUrl("/img/download_robot.png")
}, {
	type: TYPE_HEADER,
	content: "欢迎垂询",
	deep: 0
}, {
	type: TYPE_IMAGE,
	content: getWebUrl("/img/wanghongquan_wechat.jpg ")
}]
const HEADER_ITEMS = [{
	type: TYPE_TITLE,
	content: SAMPLE_FILE_NAME
}, {
	type: TYPE_TEXT,
	content: "既智能又简单，既能用大模型快速生成，也能应用私域模型量身定制",
	deep: null
}, {
	type: TYPE_HEADER,
	content: "智能简单",
	deep: 0
}, {
	type: TYPE_HEADER,
	content: "文本大模型",
	deep: 1
}, {
	type: TYPE_TEXT,
	content: "写好标题就能智能生成段落标题，有了段落标题就能生成子级段落标题和文字内容"
}, {
	type: TYPE_TEXT,
	content: "有了文字内容，就能进一步扩写内容、缩写内容、替换内容、生成摘要和关键字"
}, {
	type: TYPE_TEXT,
	content: "特别的是：大模型的算法及其参数您是自由控制的,何愁自动生成不准确?!"
}, {
	type: TYPE_TEXT,
	content: "更特别的是：上传文件就能拥有私有模型,也就能私人订制大模型,这是公有大模型做不到的?!"
}, {
	type: TYPE_HEADER,
	content: "绘画大模型",
	deep: 1
}, {
	type: TYPE_TEXT,
	content: "既能简单快速地生成大中小图片，也能专业地定制各种风格图片"
}, {
	type: TYPE_TEXT,
	content: "值得注意的是：有简单和专家模式可选,各种风格各种大小的图片,都能随意生成!"
}, {
	type: TYPE_HEADER,
	content: "提供下载",
	deep: 0
}, {
	type: TYPE_TEXT,
	content: "文档撰写的难点是内容编写，这由AI Word来搞定，下载之后就能格式化和美化喽！"
}]

export const TEST_WORD_ITEMS = _.concat(HEADER_ITEMS, IMAGE_ITEMS)

export const ttt = _.join(_.map(TEST_WORD_ITEMS, t => {
	return `ParagraphItem(ParagraphType.${t['type']},${_.isNil(t['deep']) ? "null" : `"${t.deep + 1}"`}, "${t.content}")`
}),"\n,")


export const SAMPLE_WORD = {
	items: TEST_WORD_ITEMS,
	itemIndex: 0,
	filename: SAMPLE_FILE_NAME,
	id: null
}

export const NEW_WORD = {
	items: [{
		type: TYPE_TITLE,
		content: NEW_FILE_NAME
	}],
	itemIndex: 0,
	filename: NEW_FILE_NAME,
	id: null
}

export function addLevel(items) {
	const headers = _.filter(items, item => item.type === TYPE_HEADER)

	function sameDeepLevel(header, header_index) {
		let index = header_index
		let count = 0
		for (; index >= 0; index--) {
			const tmpHeader = headers[index];
			if (tmpHeader.deep === header.deep) count += 1
			if (tmpHeader.deep < header.deep) break
		}
		return count
	}

	function getParent(header, header_index) {
		let index = header_index
		for (; index >= 0; index--) {
			const tmpHeader = headers[index];
			if (tmpHeader.deep < header.deep)
				return index
		}
		return null
	}

	function loop(header, index) {
		const levels = []
		levels.unshift(sameDeepLevel(header, index))
		let tmpIndex = index
		let tmpHeader = headers[index]
		while (true) {
			tmpIndex = getParent(tmpHeader, tmpIndex)
			if (tmpIndex == null) break
			tmpHeader = headers[tmpIndex]
			levels.unshift(sameDeepLevel(tmpHeader, tmpIndex))
		}
		_.set(header, ["level"], _.join(levels, "."))
	}
	_.forEach(headers, (header, index) => loop(header, index))
}

export function test() {
	addLevel(TEST_WORD_ITEMS)
}