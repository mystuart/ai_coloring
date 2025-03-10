const { StoreComponent } = require("@/base/store_component");

// components/tip/tip.js
StoreComponent({

	/**
	 * 组件的属性列表
	 */
	properties: {
		tip: {
			type: String
		}
	},
	computed:{
		tips:function(data){
			return data.tip.split(';')
		}
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

	}
})