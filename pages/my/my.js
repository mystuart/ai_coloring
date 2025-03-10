import AIPage from "@/base/ai_page"
import {
	SHARE_TOKEN_KEY,
	MY_TEXTS
} from "@/utils/constant"
import {
	store
} from "@/store/index"
import '@/utils/lodash-fix';
import _ from "@/npm/lodash/index";
import {
	getToken
} from "@/utils/storage";
import {
	logout
} from "@/utils/login";
import {
	servicePost
} from "@/utils/service";
AIPage({

	/**
	 * 页面的初始数据
	 */
	data: {
		half: null,
		buttons: [{
			text: '关闭',
			type: 'default'
		}, {
			text: '拷贝',
			type: 'primary'
		}]
	},
	computed: {
		phone4(data) {
			if (data.logged === false) return null
			return data.phone.substr(7) || "AA用户"
		},

		by_share_phone4(data) {
			if (data.logged === false) return null
			return (data.user.by_share_phone && data.user.by_share_phone.substr(7)) || "毛遂自荐"
		},
		shareRegisteredCount(data) {
			if (data.logged === false) return null
			return (data.user.share_registered_count) || "正在努力"
		},
		recommendAward(data) {
			if (data.logged === false) return null
			const v = (data.user.share_registered_count || 0) * data.shareGiveRmb
			return v || "正在努力"
		},
		shareGiveRmb(data) {
			if (data.logged === false) return null
			return (_.get(data.setting, ["SHARE_GIVE_RMB"]) || 0)
		},
		registerGiveRmb(data) {
			if (data.logged === false) return null
			return (_.get(data.setting, ["REGISTER_GIVE_RMB"]) || 0)
		},
		awardTip(data) {
			if (data.logged === false) return null
			return `推荐奖励 ${data.shareGiveRmb} 元/人,注册奖励 ${data.registerGiveRmb} 元`
		}

	},
	recordTap(e) {
		const name = e.currentTarget.dataset.name
		switch (name) {
			case "下载APP":
				wx.setClipboardData({
					data: "https://rocy-ai.wang/download/ai-assistant.apk",
					success: () => wx.showToast({
						title: 'APP地址已拷贝'
					})
				})
				break
			case "PC版官网":
				wx.setClipboardData({
					data: 'https://rocy-ai.wang',
					success: () => wx.showToast({
						title: '官网地址已拷贝'
					})
				})
				break
			case "切换账号":
				logout()
				wx.navigateTo({
					url: '/pages/login/login',
				})
				break
			case "注销账号":
				wx.showModal({
					title: '账号注销',
					content: '确认要注销账号吗？该账号下的相关信息都将被删除而且无法恢复',
					complete: (res) => {
						if (res.confirm) {
							servicePost("/user/delete_me", () => {
								wx.showModal({
									title: '账号注销成功',
									content: '感谢使用本产品，欢迎再次使用，非常感谢！',
									success: () => {
										logout()
										wx.switchTab({
											url: '/pages/home/home',
										})
									}
								})
							}, null, null, null, (e) => {
								console.error("delete me", e)
							})
						}
					}
				})

				break
			case "退出":
				wx.exitMiniProgram({
					fail: (e) => {
						console.error("error", e)
					}
				})
				break
			default:
				const text = _.join(MY_TEXTS[name], "\n")
				store.setMaxContent({
					name,
					text
				})
		}
	},
	halfTap() {

	},
	recommendIt() {
		const shareText = _.get(store.configs, ["aa", "shareText"])
		const webUrl = _.get(store.configs, ["aa", "webUrl"])
		const shareLink = `${webUrl}/login?${SHARE_TOKEN_KEY}=${getToken()}`
		wx.setClipboardData({
			data: _.join([shareText, `注册地址 ${shareLink}`], "\n"),
		})
	},
	toLogin() {
		wx.navigateTo({
			url: '/pages/login/login',
		})
	},
	/**
	 * 生命周期函数--监听页面加载
	 */
	onLoad() {

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