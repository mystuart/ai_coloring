import {
	store
} from "@/store/index"
import {
	getWebUrl
} from "@/utils/service"
const webViews = {
	"用户协议": getWebUrl("/user_protocol.html"),
	"隐私政策": getWebUrl("/privacy_protocol.html")
}
Page({

	/**
	 * 页面的初始数据
	 */
	data: {
		maxContent: null,
		isWebView: false
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
		this.setData({
			maxContent: store.maxContent,
			isWebView: Object.keys(webViews).includes(store.maxContent.name),
			webViewUrl: webViews[store.maxContent.name]
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

	},


})