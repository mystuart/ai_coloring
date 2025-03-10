import {
	ComponentWithStore
} from 'mobx-miniprogram-bindings'
import '@/utils/lodash-fix';
import _ from "@/npm/lodash/index";
const computedBehavior = require('miniprogram-computed').behavior

function getColor(colors) {
	return `#${_.join(_.map(colors,s=>_.padStart(s ? s.toString(16):"00",2,"0")),"")}`
}
ComponentWithStore({
	behaviors: [computedBehavior],
	/**
	 * 组件的属性列表
	 */
	properties: {

	},

	/**
	 * 组件的初始数据
	 */
	data: {
		selectedRed: 64,
		selectedGreen: 158,
		selectedBlue: 255,
	},

	computed: {
		selectedColorR(data) {
			return getColor([data.selectedRed, null, null])
		},
		selectedColorG(data) {
			return getColor([null, data.selectedGreen, null])
		},
		selectedColorB(data) {
			return getColor([null, null, data.selectedBlue])
		},
		selectedColor(data) {
			return getColor([data.selectedRed, data.selectedGreen, data.selectedBlue])
		}
	},
	watch: {
		"selectedColor": function (selected) {
			this.triggerEvent('selectedColorChanged', selected)
		}
	},
	/**
	 * 组件的方法列表
	 */
	methods: {
		pureChanged(e) {
			switch (e.detail.value) {
				case "white":
					this.setData({
						selectedRed: 255,
						selectedGreen: 255,
						selectedBlue: 255,
					})
					break
				case "blue":
					this.setData({
						selectedRed: 64,
						selectedGreen: 158,
						selectedBlue: 255,
					})
					break
				case "red":
					this.setData({
						selectedRed: 255,
						selectedGreen: 0,
						selectedBlue: 0,
					})
					break
			}
		},
	}
})