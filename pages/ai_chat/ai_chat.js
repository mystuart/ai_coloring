import '@/utils/lodash-fix';
import _ from "@/npm/lodash/index";
const {
	default: AIPage
} = require("@/base/ai_page");
import {
	IMAGE_DALL_E3,
	IMAGE_MIDDLE,
	SERVICE_URL_CHAT_ANSWER,
	SERVICE_URL_IMAGE_GENERATE
} from '@/utils/constant'
import {
	questionId,
	store
} from '@/store/index';
import {
	downloadAndSaveImage,
	md5ToUrl,
	saveBase64Image
} from '@/utils/image';
import {
	isAnyEmpty
} from '@/utils/util';
import {
	queueExecute
} from '@/utils/time';
import {
	getWebUrl
} from '@/utils/service';
import {
	text_is_censor
} from '@/utils/security';
AIPage({

	/**
	 * 页面的初始数据
	 */
	data: {
		batch: false,
		drawing: false,
		SERVICE_URL_CHAT_ANSWER,
		title: "AI Chat",
		logo: getWebUrl("/mp_images/chat.png"),
		showDialog: false,
		selectedDateIndex: null,
		dialogDates: [],
		dialogList: [],
		currentItem: null,
		showGalleryIndex: -1,
		showGalleryMd5: false,
		prompt: null
	},
	computed: {
		selectedDate(data) {
			return _.get(data.dialogDates, [data.selectedDateIndex])
		},
		md5Images(data) {
			const md5List = _.reject(_.map(data.dialogList, d => _.get(d, ["md5"])), _.isNil)
			return _.map(md5List, md5ToUrl)
		},
		generationArg() {
			return store.AIGeneration || ({})
		}
	},
	saveImage(e) {
		const md5 = e.currentTarget.dataset.md5
		downloadAndSaveImage(md5ToUrl(md5))
	},
	toPrompt() {
		wx.navigateTo({
			url: '/pages/prompt/prompt',
		})
	},
	send() {
		if (isAnyEmpty(this.data.prompt)) wx.showToast({
			title: '请输入问题'
		})
		else {
			text_is_censor(this.data.prompt).then(is => {
				if (is === true) {
					wx.showToast({
						title: '输入敏感!',
					})
					return
				}
				const questions = (this.data.batch === true) ? _.reject(_.split(this.data.prompt, "\n"), isAnyEmpty) : [this.data.prompt]
				if (this.data.drawing === true) {
					const args = _.map(questions, question => Object.assign({}, store.getGenerationBasic, {
						question,
						id: questionId(),
						size: IMAGE_MIDDLE,
						n: 1,
						model_name: IMAGE_DALL_E3
					}))
					wx.showLoading({
						title: 'AI思考中...',
					})
					queueExecute(args, async (arg) => await this.baseServicePost(SERVICE_URL_IMAGE_GENERATE, arg), 3000, () => this.initialize(() => wx.hideLoading()))
				} else {
					const args = _.map(questions, question => Object.assign({}, store.DialogChat, {
						question
					}))
					wx.showLoading({
						title: 'AI思考中...',
					})
					queueExecute(args, async (arg) => await this.baseServicePost(SERVICE_URL_CHAT_ANSWER, arg), 3000, () => this.initialize(() => wx.hideLoading()))
				}
			})
		}
	},
	getQAText(qa) {
		const {
			question,
			answer
		} = qa
		if (_.isNil(answer)) return null
		return _.join(["问:" + question, "答:" + answer], "\n")
	},
	copyDialog() {
		wx.setClipboardData({
			data: _.join(_.reject(_.map(this.data.dialogList, this.getQAText), _.isNil), "\n\n"),
		})
	},
	showGallery(e) {
		this.setData({
			showGalleryIndex: this.data.md5Images.indexOf(md5ToUrl(e.currentTarget.dataset.md5)),
			showGalleryMd5: true
		})
	},
	copyItem(e) {
		wx.setClipboardData({
			data: e.currentTarget.dataset.item
		})
	},
	closeItemDetail() {
		this.setData({
			currentItem: null
		})
	},
	closeGallery() {
		this.setData({
			showGalleryIndex: -1,
			showGalleryMd5: false,
		})
	},
	showItemDetail(e) {
		let currentItem = e.currentTarget.dataset.item
		currentItem["change"] = currentItem["change"].toFixed(3)
		this.setData({
			currentItem
		})
	},
	closeDialog() {
		this.setData({
			showDialog: false
		})
	},
	moreClicked() {
		this.setData({
			showDialog: !this.data.showDialog
		})
	},
	selectedDateChanged(e) {
		this.setData({
			selectedDateIndex: parseInt(e.detail.value)
		})
		this.getDialogList()
	},
	getDialogList(callback) {
		if (_.isNil(this.data.selectedDate)) return []
		this.baseServicePost("/chat/get_dialogue_list", {
			asc: false,
			page_size: 10,
			page_index: 0,
			dialogue_id: `${store.dialogIdPrefix}${this.data.selectedDate}`,
			only_md5: true
		}).then(dialogList => {
			this.setData({
				dialogList
			})
			callback && callback()
		})
	},
	moreClicked() {
		this.setData({
			showDialog: !this.data.showDialog
		})
	},
	initialize(callback) {
		this.baseServicePost("/chat/phone_get_dialogue_ids", {
			"id_prefix": store.dialogIdPrefix
		}).then(dialogDates => {
			dialogDates = _.reverse(_.map(dialogDates, d => d.replace(store.dialogIdPrefix, "")))
			this.setData({
				dialogDates,
				selectedDateIndex: dialogDates.length > 0 ? 0 : null
			})
			this.getDialogList(callback)
		})
	},
	/**
	 * 生命周期函数--监听页面加载
	 */
	onLoad(options) {
		this.setData({
			drawing: _.get(options, ["drawing"]) === "true",
			prompt: _.get(options, ["prompt"], null)
		})

		this.waitAutoLogDone(() => {
			if (this.data.logged === false) wx.navigateTo({
				url: `/pages/login/login?from=/pages/ai_chat/ai_chat`,
			})
			else this.initialize()
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