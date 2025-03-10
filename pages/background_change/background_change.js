import AIPage from '@/base/ai_page'
import {
	getBase64,
	addBase64Prefix,
	saveBase64Image
} from "@/utils/image"
import {
	scrollToView
} from "@/utils/element"
import {
	getWebUrl,
	servicePost
} from '@/utils/service'
import {
	getUserByToken
} from "@/utils/login"
AIPage({
	data: {
		title: "AI 抠图",
		logo: getWebUrl("/mp_images/kou_tu.png"),
		selectedFacePicture: "https://rocy-ai.wang/mp_images/abm.jpg",
		selectedFacePictureBase64: null,
		selectedBackPicture: "https://rocy-ai.wang/mp_images/bg_abm.jpg",
		selectedBackPictureBase64: null,
		selectedColor: "#409EFF",
		changedResultBase64: null,
		usePureColor: true,
		executing: false
	},
	selectedColorChanged(event) {
		this.setData({
			selectedColor: event.detail
		})
	},
	selectBackPicture() {
		this.selectPicture((temp) => {
			this.setData({
				selectedBackPicture: temp
			})
			getBase64(temp, (base64) => this.setData({
				selectedBackPictureBase64: base64
			}))
		})
	},
	selectFacePicture() {
		this.selectPicture((temp) => {
			this.setData({
				selectedFacePicture: temp
			})
			getBase64(temp, (base64) => this.setData({
				selectedFacePictureBase64: base64
			}))
		})
	},
	selectPicture(callback) {
		wx.chooseImage({
			count: 1,
			sizeType: ['original'],
			sourceType: ['album', 'camera'],
			success: function (res) {
				var tempFilePaths = res.tempFilePaths;
				if (tempFilePaths.length > 0) callback(tempFilePaths[0])
			}
		})
	},
	execute() {
		this.setData({
			executing: true
		})
		wx.showLoading({
			title: "AI 抠图中...\n大约1分钟"
		})
		this.checkMoney(this.data.PRICE_BACKGROUND_CHANGE_RMB, () => {
			const c = this.data.usePureColor ? this.data.selectedColor : null
			const bg = this.data.usePureColor ? null : this.data.selectedBackPictureBase64
			const data = {
				base64_image: this.data.selectedFacePictureBase64,
				new_color: c,
				background_image: bg
			}
			servicePost("/background/change", (base64) => {
				wx.hideLoading()
				this.setData({
					changedResultBase64: addBase64Prefix(base64),
					executing: false
				})
				getUserByToken()
				scrollToView("result")
			}, data)
		})
	},

	saveResult() {
		saveBase64Image(this.data.changedResultBase64,"aa_background_change.png")
	},
	onLoad() {

	},
	/**
	 * 生命周期函数--监听页面初次渲染完成
	 */

	onReady() {
		getBase64(this.data.selectedFacePicture, (base64) => this.setData({
			selectedFacePictureBase64: base64
		}))
		getBase64(this.data.selectedBackPicture, (base64) => this.setData({
			selectedBackPictureBase64: base64
		}))
		this.waitAutoLogDone(() => {
			if (this.data.logged === false) wx.navigateTo({
				url: `/pages/login/login?from=/pages/background_change/background_change`
			})
		})
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