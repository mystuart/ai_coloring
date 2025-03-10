import '@/utils/lodash-fix';
import {
	getNormalizedName
} from "@/utils/name"
import _ from "@/npm/lodash/index";
import {
	EXTENSIONS,
	setImage
} from "@/utils/image"
import {
	getExtName,
	saveFile
} from "@/utils/file"
import {
	StoreComponent
} from '@/base/store_component';
StoreComponent({

	/**
	 * 组件的属性列表
	 */
	properties: {
		maxCount: {
			type: Number,
			value: 9
		}
	},

	/**
	 * 组件的初始数据
	 */
	data: {
		tip: `支持的文件格式有:${_.join(EXTENSIONS,",")}`,
		tempFiles: [],
		showInput: false,
		inputText: "",
		inputFileName: "",
		inputButtons: [{
			text: "取消",
		}, {
			text: "确定",
			type: "primary"
		}, ]
	},
	computed: {
		tempFilesHas(data) {
			return data.tempFiles.length > 0
		}
	},
	/**
	 * 组件的方法列表
	 */
	methods: {
		delete(e) {
			const index = e.currentTarget.dataset.index
			const files = this.data.tempFiles
			files.splice(index, 1)
			this.setData({
				tempFiles: files
			})
		},
		appendTempFiles(files) {
			let rs = _.map(files, setImage)
			rs = _.concat(this.data.tempFiles, rs)
			this.setData({
				tempFiles: rs
			})
		},

		inputTap(e) {
			this.setData({
				showInput: false
			})
			if (e.detail.index === 1) {
				let name = getNormalizedName(this.data.inputFileName)
				if (!name) name = new Date().getTime()
				name = `${name}.txt`
				saveFile(name, this.data.inputText, (tempFile) => this.appendTempFiles([tempFile]))
			}
		},
		showInputDialog() {
			this.setData({
				showInput: !this.data.showInput
			})
		},
		ok() {
			this.triggerEvent("filesChanged", this.data.tempFiles)
			this.setData({
				tempFiles: []
			})
		},

		upload() {
			wx.chooseMessageFile({
				count: this.data.maxCount,
				type: "file",
				extension: EXTENSIONS,
				success: (rs) => {
					const files = _.filter(rs.tempFiles, t => EXTENSIONS.includes(getExtName(t['path'])))
					wx.showToast({
						title: `${files.length}个文件`,
					})
					this.appendTempFiles(files)
				}
			})
		}
	}
})