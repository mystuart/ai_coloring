import _ from "@/npm/lodash/index";
import {
	GPT_NAME_MAP,
	IMAGE_DALL_E3
} from "@/utils/constant";
import '@/utils/lodash-fix';
import {
	StoreComponent
} from "../../base/store_component";
const URLS = [
	'/pages/public_model/public_model',
	'/pages/text2image/text2image',
	'/pages/private_model/private_model'
]
StoreComponent({

	/**
	 * 组件的属性列表
	 */
	properties: {
		showTextModel: {
			type: Boolean,
			value: true
		},
		showImageModel: {
			type: Boolean,
			value: true
		},
	},

	/**
	 * 组件的初始数据
	 */
	data: {

	},
	computed: {
		ppButtons(data) {
			if (_.isNil(data.selectedPublicModel)) return []
			return [{
			text: GPT_NAME_MAP[data.selectedPublicModel['modelName']],
				primary: true,
				value: 0,
				visible: data.showTextModel
			}, {
				text: _.get(data.selectedPublicModelImage, ['model_name'], IMAGE_DALL_E3),
				primary: true,
				value: 1,
				visible: data.showImageModel
			}, {
				text: data.selectedPrivateModelId || "私有模型未设置",
				primary: true,
				value: 2
			}]
		}
	},

	/**
	 * 组件的方法列表
	 */
	methods: {
		btnClick(e) {
			const value = e.detail.item.value
			wx.navigateTo({
				url: URLS[value]
			})

		}
	}
})