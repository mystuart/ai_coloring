// components/ai_item.js
Component({

	/**
	 * 组件的属性列表
	 */
	properties: {
		alias: {
			type: String,
			value: ''
		},
		title: {
			type: String,
			value: ''
		},
		description: {
			type: String,
			value: ''
		},
		image: {
			type: String,
			value: ''
		},
		page: {
			type: String,
			value: ''
		},
	},

	/**
	 * 组件的初始数据
	 */
	data: {

	},

	/**
	 * 组件的方法列表
	 */
	methods: {
		goto() {
			wx.navigateTo({
				url: `/pages/${this.data.page}/${this.data.page}`,
			})
		}
	}
})