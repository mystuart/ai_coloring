import '@/utils/lodash-fix';
import _ from "@/npm/lodash/index";

Component({

	/**
	 * 组件的属性列表
	 */
	properties: {
		horizontal: {
			type: Boolean,
			value: true
		},
		buttons: {
			type: Array,
			value: []
		},
		border: {
			type: Boolean,
			value: false
		}
	},
	observers: {
		"buttons": function (buttons) {
			const visibleCount = _.filter(buttons, b => b['visible'] !== false).length
			this.setData({
				visibleCount
			})
		}
	},
	/**
	 * 组件的初始数据
	 */
	data: {
		visibleCount: 0
	},

	/**
	 * 组件的方法列表
	 */
	methods: {
		action(e) {
			const index = e.currentTarget.dataset.index
			const item = e.currentTarget.dataset.item
			this.triggerEvent("clicked", {
				index,
				item
			})
		}
	}
})