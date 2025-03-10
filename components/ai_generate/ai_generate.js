import '@/utils/lodash-fix';
import _ from "@/npm/lodash/index";
import {
	text_is_censor
} from '@/utils/security';
const {
	StoreComponent
} = require("@/base/store_component");
const {
	getDialogChat
} = require("@/pages/word/generate");
const {
	store
} = require("@/store/index");
const {
	SERVICE_URL_CHAT_ANSWER,
	IMAGE_MODEL_OPENAI_DEFAULT,
	SERVICE_URL_IMAGE_GENERATE
} = require("@/utils/constant");
const {
	servicePost
} = require("@/utils/service");

// components/ai_generate/ai_generate.js
StoreComponent({

	/**
	 * 组件的属性列表
	 */
	properties: {
		isText: {
			type: Boolean,
			value: true
		}
	},

	/**
	 * 组件的初始数据
	 */
	data: {
		prompt: null
	},

	computed: {
		cant_generate(data) {
			return data.prompt === null || data.prompt.length === 0
		}
	},

	/**
	 * 组件的方法列表
	 */
	methods: {
		aiExecute() {
			text_is_censor(this.data.prompt).then(is => {
				if (is === true) wx.showToast({
					title: '输入敏感!',
				})
				else {
					wx.showLoading({
						title: 'AI思考中',
					})
					if (this.data.isText) {
						const dataPost = getDialogChat(this.data.prompt)
						servicePost(SERVICE_URL_CHAT_ANSWER, (result) => {
							this.triggerEvent("generated", _.get(result, ['answer']))
							wx.hideLoading()
						}, dataPost, null, null, () => {
							wx.showToast({
								title: 'AI出错了',
							})
							wx.hideLoading()
						})
					} else {
						let modelArg = {
							...store.getGenerationBasic,
							question: this.data.prompt
						}
						const dataPost = Object.assign({}, modelArg, store.selectedPublicModelImage || IMAGE_MODEL_OPENAI_DEFAULT)
						servicePost(SERVICE_URL_IMAGE_GENERATE, (result) => {
							this.triggerEvent("generated", ({
								base64: _.get(result, ['images', 0]),
								md5: _.get(result, ['md5'])
							}))
							wx.hideLoading()
						}, dataPost, null, null, () => {
							wx.showToast({
								title: 'AI出错了',
							})
							wx.hideLoading()
						})
					}
				}
			})

		}
	}
})