import {
	getNormalizedName
} from "@/utils/name"

import {
	setImage
} from '@/utils/image'
import {
	getUrl,
	servicePost
} from "@/utils/service"
import AIPage from "@/base/ai_page"
import {
	getAuthorization
} from "@/utils/storage"
import {
	store
} from "@/store/index"
import '@/utils/lodash-fix';
import _ from "@/npm/lodash/index";
AIPage({

	/**
	 * 页面的初始数据
	 */
	data: {
		percent: null,
		showModelNameDialog: false,
		newModelName: null,
		currentModelIndex: 0,
		mainButtons: [{
			text: "取消"
		}, {
			text: "选择",
			primary: true
		}],
		modelButtons: [{
			text: "添加",
			primary: true
		}, {
			text: "删除",
			primary: true
		}],
	},
	computed: {
		currentModelFiles(data) {
			if (_.isNil(data.currentModelId)) return []
			if (_.isNil(data.models)) return []
			return _.sortBy(_.map(data.models[data.currentModelId]["files"], (size, file) => setImage({
				name: file,
				path: file,
				size
			})), "file")
		},
		modelNames(data) {
			return _.sortBy(Object.keys(data.models || {}))
		},
		modelsEmpty(data) {
			return data.modelNames.length == 0
		},
		modelsTabBarList(data) {
			return _.map(data.modelNames, name => ({
				text: name,
				iconPath: "https://rocy-ai.wang/mp_images/big_model.svg",
				selectedIconPath: "https://rocy-ai.wang/mp_images/big_model_selected.svg",
			}))
		},
		currentModelId(data) {
			if (data.currentModelIndex < 0) return null
			if (data.modelNames.length === 0) return null
			return data.modelNames[data.currentModelIndex]
		},
	},
	delete(e) {
		const currentFileName = this.data.currentModelFiles[e.currentTarget.dataset.index]["name"]
		servicePost("/model/delete_file", () => {
			const models = this.data.models
			models[this.data.currentModelId]["files"] = _.omit(models[this.data.currentModelId]["files"], [currentFileName])
			store.setModels(models)
		}, {
			model_id: this.data.currentModelId,
			file_name: currentFileName
		})
	},
	gotModelName(e) {
		this.setData({
			showModelNameDialog: false
		})
		if (e.detail.index === 1) {
			const name = getNormalizedName(this.data.newModelName)
			if (!name) return
			const models = this.data.models
			models[name] = {
				files: {}
			}
			store.setModels(models)
		}
	},
	modelButtonsClicked(e) {
		if (!this.data.currentModelId) return
		if (e.detail.index === 0) this.addNewModel()
		else if (e.detail.index === 1) wx.showModal({
			title: "删除确认",
			content: `确定要删除这个模型吗? ${this.data.currentModelId}`,
			success: (rs) => {
				if (rs.confirm) {
					servicePost("/model/delete_models", () => {
						let models = this.data.models
						models = _.omit(models, [this.data.currentModelId])
						this.setData({
							currentModelIndex: Object.keys(models).length > 0 ? 0 : -1
						})
						store.setModels(models)
					}, {
						model_ids: [this.data.currentModelId]
					})
				}
			}
		})
	},
	mainButtonsClicked(e) {
		const index = e.detail.index
		if (index === 1) {
			store.setPrivateModelId(this.data.currentModelId)
			wx.showToast({
				title: '设置成功',
			})
		}
		wx.navigateBack()
	},
	uploadFileToModel(e) {
		const files = e.detail
		const count = files.length
		const currentModelId = this.data.currentModelId
		let doneCount = 0
		let failCount = 0
		const done = (success) => {
			doneCount += 1
			if (success !== true) failCount += 1
			this.setData({
				percent: _.toInteger(doneCount * 100 / count)
			})
			if (doneCount === count) {
				store.getFiles()
				this.setData({
					percent: null
				})
				if (failCount !== 0) wx.showToast({
					title: `失败${failCount}个`,
				})
			}
		}
		_.forEach(files, (item, index) => {
			wx.uploadFile({
				filePath: item.path,
				name: "file",
				header: {
					"Authorization": getAuthorization()
				},
				formData: {
					'model': currentModelId
				},
				url: getUrl('/model/upload_file'),
				success: (rs) => done(true),
				fail: (e) => {
					done(false)
					console.error("private error", error)
				}
			})
		})
	},
	addNewModel() {
		this.setData({
			showModelNameDialog: true
		})
	},
	/**
	 * 生命周期函数--监听页面加载
	 */
	onLoad(options) {
		wx.showLoading({
			title: "模型加载中..."
		})
		store.getFiles(() => wx.hideLoading())
	},

	/**
	 * 生命周期函数--监听页面初次渲染完成
	 */
	onReady() {

	},

	/**
	 * 生命周期函数--监听页面显示
	 */
	onShow() {

	},

	/**
	 * 生命周期函数--监听页面隐藏
	 */
	onHide() {

	},

	/**
	 * 生命周期函数--监听页面卸载
	 */
	onUnload() {

	},

	/**
	 * 页面相关事件处理函数--监听用户下拉动作
	 */
	onPullDownRefresh() {

	},

	/**
	 * 页面上拉触底事件的处理函数
	 */
	onReachBottom() {

	}
})