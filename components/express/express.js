import '@/utils/lodash-fix';
import _ from "@/npm/lodash/index";
const {
	StoreComponent
} = require("@/base/store_component");
const {
	QUESTION_DRAWING_SAMPLE,
	SERVICE_URL_IMAGE_GENERATE,
	SERVICE_URL_CHAT_ANSWER
} = require("@/utils/constant");
const {
	refreshUser
} = require("@/utils/login");

// components/express/express.js
StoreComponent({

	/**
	 * 组件的属性列表
	 */
	properties: {
		url: {
			type: String
		},
		generationArg: {
			type: Object
		}
	},

	/**
	 * 组件的初始数据
	 */
	data: {
		QUESTION_DRAWING_SAMPLE,
		showExpress: false,
	},
	computed: {
		expressButtons: (data) => [{
			text: "一键",
			diabled: data.executing,
			primary: true
		}, {
			text: "使用",
			visible: (data.expressExamples || {}).length > 0,
			primary: true
		}],
		expressExamples(data) {
			const expresses = _.get(data.user, ["expresses"]) || []
			const found = _.find(expresses, e => e.url == data.url)
			return found ? _.toPairs(JSON.parse(_.get(found, ["examples"]))) : []
		},
	},

	/**
	 * 组件的方法列表
	 */
	methods: {
		copyExpress(e) {
			const data = e.currentTarget.dataset.data
			wx.setClipboardData({
				data,
			})
		},
		closeExpress() {
			this.setData({
				showExpress: false
			})
		},
		async expressClicked(e) {
			switch (e.detail.index) {
				case 0:
					this.baseServicePost("/express/generate", {
						generation: {
							url: this.data.url,
							arg: JSON.stringify(this.data.generationArg)
						}
					}).then(() => {
						refreshUser()
						wx.showToast({
							title: '成功了',
						})
					})
					break
				case 1:
					this.setData({
						showExpress: true
					})
					break
			}

		},
	}
})