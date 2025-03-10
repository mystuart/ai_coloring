import '@/utils/lodash-fix';
import _ from "@/npm/lodash/index";
import {
	getCanvas
} from '@/utils/element';
import { canvasToImage } from './compressImage';
import {
	StoreComponent
} from "../../base/store_component"
import { convertAndCompress } from './compress';
StoreComponent({

	/**
	 * 组件的属性列表
	 */
	properties: {
		files: {
			type: Array
		}
	},
	watch: {
		"files": async function (files) {
			console.log("files",files)
			const canvas = await getCanvas("uploadCanvas", this)
			const filesNew = await Promise.all(_.map(files,async file=> await canvasToImage(file,canvas)))
			this.triggerEvent("compressed",filesNew)
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