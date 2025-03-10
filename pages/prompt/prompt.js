const {
	default: AIPage
} = require("@/base/ai_page")
const {
	getImageUrl
} = require("@/utils/image")
const {
	TEXT_STYLES,
	DRAWING_STYLES
} = require("@/utils/prompt")
const { getWebUrl } = require("@/utils/service")

AIPage({

	/**
	 * 页面的初始数据
	 */
	data: {
		title: "AI 提示词工程",
		logo: getWebUrl("/mp_images/prompt.png"),
		currentIndex: 0,
		tabbarList: [{
			text: "语言大模型",
			iconPath: getImageUrl("paragraph_white.svg"),
			selectedIconPath: getImageUrl("paragraph.svg")
		}, {
			text: "绘画大模型",
			iconPath: getImageUrl("Image.svg"),
			selectedIconPath: getImageUrl("image_black.svg")
		}]
	},
	computed: {
		currentStyles(data) {
			return data.currentIndex === 0 ? TEXT_STYLES : DRAWING_STYLES
		}
	},
	tap(e) {
		const category = e.currentTarget.dataset.item
		wx.navigateTo({
			url: `/pages/prompt_child/prompt_child?index=${this.data.currentIndex}&category=${category}`,
		})
	},
	/**
	 * 生命周期函数--监听页面加载
	 */
	onLoad(options) {

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