import {
	store
} from '@/store/index'


function getPosition() {
	return store.myTitle ? `我是一名${store.myTitle},` : ""
}
export function getDialogChat(prompt) {
	return {
		...store.DialogChat,
		question: prompt
	}
}
export function getGenerationPrompt(prompt) {
	return {
		...store.AIGeneration,
		prompt
	}
}
export function toHeaders(title, toCount, length) {
	return `${getPosition()}请为主题《${title}》编写${toCount||3}条目录,每条目录不超过${length||20}字，谢谢`
}

export function toText(title, maxTokens) {
	return `${getPosition()}请编写关于《${title}》的内容，字数限制在${maxTokens||4096}字以内，谢谢`
}

export function toImage(reference) {
	return `${getPosition()}请根据如下内容生成图片，谢谢:\n${reference}`
}