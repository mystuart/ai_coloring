const {
	TEXT_STYLES,
	DRAWING_STYLES,
	text_images
} = require("@/utils/prompt")
import '@/utils/lodash-fix';
import _ from "@/npm/lodash/index";

Page({

	/**
	 * 页面的初始数据
	 */
	data: {
		name: null,
		category: null,
		style: null,
		prompt: null
	},
	execute() {
		wx.navigateTo({
			url: `/pages/ai_chat/ai_chat?drawing=${this.data.name === '绘画大模型'}&prompt=${this.data.prompt}`,
		})
	},
	tap(e) {
		this.setData({
			prompt: e.currentTarget.dataset.default
		})
	},
	/**
	 * 生命周期函数--监听页面加载
	 */
	onLoad(options) {
		const index = Number(options["index"])
		const is_text = index === 0
		const styles = index === 0 ? TEXT_STYLES : DRAWING_STYLES
		const name = index === 0 ? "语言大模型" : "绘画大模型"
		const category = options["category"]
		const style = _.find(styles, style => style["category"] === category)
		_.forEach(style.categories, c => {
			const type = is_text ? "text" : "image"
			const img = c['img']
			c['img'] = `https://rocy-ai.wang/mp_images/prompt/${type}/${img}.svg`
		})
		this.setData({
			name,
			category,
			style
		})
	},
	copy(e) {
		console.log("d", e)
		wx.setClipboardData({
			data: e.currentTarget.dataset.item + "",
			fail: (e) => {
				console.error("error", e)
			}
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

	/**
	 * 用户点击右上角分享
	 */
	onShareAppMessage() {

	}
})