import '@/utils/lodash-fix';
import _ from "@/npm/lodash/index";
import {
	getBase64Promise,
	selectLocalMultiPicturesPromise
} from '@/utils/image';
import { getWebUrl } from '@/utils/service';
import { refreshUser } from '@/utils/login';

const {
	default: AIPage
} = require("@/base/ai_page");

const cardTypes = [
	"图片",
	"银行卡",
	"身份证",
	"名片",
	"营业执照",
	"社保卡",
	"结婚证"
]
AIPage({

	/**
	 * 页面的初始数据
	 */
	data: {
		title: "AI 卡照识别",
		logo: getWebUrl("/mp_images/image2text_batch.png"),
		resultButtons: [{
			text: "全部拷贝",
			type: "primary"
		}],
		showResults: false,
		showGallary: false,
		selectedIndex: 0,
		files: [],
		filesBase64: [],
		results: [],
		cardTypes
	},
	computed: {
		images(data) {
			return _.map(_.reject(data.filesBase64, file => _.isNil(file.base64)), ({
				base64
			}) => base64)
		},
		fileUrls(data) {
			return _.map(data.files, ({
				path
			}) => path)
		},
		selectedCardName(data) {
			return _.get(cardTypes, data.selectedIndex)
		}
	},
	deleteResults() {
		this.setData({
			results: []
		})
	},

	async execute() {
		const category = cardTypes[this.data.selectedIndex]
		const dataList = _.map(this.data.images, imageBase64 => ({
			imageBase64,
			category
		}))
		const results = await this.baseServicePostList("/recognize/image", dataList)
		this.setData({
			results: _.concat(this.data.results, results)
		})
		refreshUser()
	},
	viewResults() {
		this.setData({
			showResults: true
		})
	},
	copyResults() {
		const data = _.join(_.map(this.data.results, (item, index) => `${index+1}:\n${item}`), "\n\n")
		wx.setClipboardData({
			data
		})
		wx.showToast({
			title: '拷贝成功',
		})
	},
	closeResults() {
		this.setData({
			showResults: false
		})
	},
	viewImages() {
		this.setData({
			showGallary: true
		})
	},
	deleteImage(e) {
		const index = e.detail.index
		this.data.files.splice(index, 1)
		this.data.filesBase64.splice(index, 1)
		this.setData({
			files: this.data.files,
			filesBase64: this.data.filesBase64,
		})
	},
	hideGallery() {
		this.setData({
			showGallary: false
		})
	},
	async filesCompressed(e) {
		const files = e.detail
		const filesBase64 = await Promise.all(_.map(files, async file => Object.assign({}, file, {
			base64: await getBase64Promise(file.path)
		})))
		this.setData({
			filesBase64
		})
	},
	async uploadImages() {
		const uploaded = await selectLocalMultiPicturesPromise()
		this.setData({
			files: _.concat(this.data.files, uploaded)
		})
	},
	/**
	 * 生命周期函数--监听页面加载
	 */
	onLoad() {
		this.waitAutoLogDone(() => {
			if (this.data.logged === false) wx.navigateTo({
				url: `/pages/login/login?from=/pages/image2text_batch/image2text_batch`,
			})
		})
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

	},

	
})