import AIPage from "@/base/ai_page"
import {
	LLMs,
	NOVEL,
	PAPER,
	AI_MODEL2TOKENS,
	GPT_NAME_MAP
} from "@/utils/constant"
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
		m:GPT_NAME_MAP,
		max_token: 2048,
		LLMs: LLMs,
		recommendButtons: [{
			text: "写小说",
			primary: true
		}, {
			text: "写论文",
			primary: true
		}]
	},
	computed: {
		max_tokens(data) {
			
			return AI_MODEL2TOKENS[data.selectedPublicModel["modelName"]]
		},
		temperature(data) {
			return (data.selectedPublicModel["temperature"] || 0.7) * 200
		}
	},
	maxTokenChanged(e) {
		const m = this.data.selectedPublicModel
		_.set(m, "maxToken", e.detail.value)
		store.setPublic(m)
	},
	temperatureChanged(e) {
		const m = this.data.selectedPublicModel
		_.set(m, "temperature", e.detail.value / 200)
		store.setPublic(m)
	},
	recommend(e) {
		switch (e.detail.index) {
			case 0:
				store.setPublic(NOVEL)
				break
			case 1:
				store.setPublic(PAPER)
				break
		}
	},
	modelChanged(e) {
		const m = this.data.selectedPublicModel
		_.set(m, "modelName", e.detail.value)
		store.setPublic(m)
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