import AIPage from '@/base/ai_page'
import '@/utils/lodash-fix';
import _ from "@/npm/lodash/index";
import {
	getUrl,
	getWebUrl,
	servicePost
} from '@/utils/service';
import {
	downloadAndSaveVideo,
	getBase64Promise,
	saveImage
} from '@/utils/image';
import {
	refreshUser
} from '@/utils/login';
import {
	getFileName
} from '@/utils/file';
import {
	formatDate,
	getDateHoursAdd
} from '@/utils/date';
import {
	Prices
} from '@/model/price';
AIPage({

	/**
	 * 页面的初始数据
	 */
	data: {
		title: "AI 改头换面",
		logo: getWebUrl("/mp_images/face_swap.png"),
		is_picture: true,
		selectedTargetPicture: getWebUrl("/mp_images/face_swap_target.jpg"),
		selectedTargetVideoHolder: getWebUrl("/mp_images/video_upload.svg"),
		selectedTargetVideo: getWebUrl("/mp_images/example_face_swap.mp4"),
		selectedFacePicture: getWebUrl("/mp_images/sample_star.jpg"),
		faceSwapResults: [],
		keepTargetFps: true,
		keepTemporaryFrames: true,
		skipTargetAudio: false,
		manyFaces: false,
		showResult: false,
		_timeHandler: null,
		result_swap: null,
		viewResultButtons: [{
			"text": " 取消",
			"value": 0
		}, {
			"text": "保存",
			"type": "primary",
			"value": 1
		}]
	},
	computed: {
		priceFace(data) {
			return data.is_picture ? Prices.FACE_SWAP : Prices.FACE_SWAP_VIDEO
		},
		can_show_result(data) {
			return data.showResult && data.faceSwapResults.length > 0
		},
		can_execute(data) {
			return data.is_picture || (data.selectedTargetVideo !== null)
		},
		selectedTarget(data) {
			return data.is_picture ? data.selectedTargetPicture : data.selectedTargetVideo
		}
	},
	selectFacePicture() {
		wx.chooseImage({
			success: rs => {
				if (_.isEmpty(rs.tempFilePaths)) return
				this.setData({
					selectedFacePicture: rs.tempFilePaths[0]
				})
			}
		})
	},
	showResultMd5(e) {
		const result_swap = e.currentTarget.dataset.data
		const url = getUrl(`/face_swap/show?md5=${result_swap.result_md5}`)
		Object.assign(result_swap, {
			url
		})
		this.setData({
			result_swap,
			showResult: false
		})
	},
	resultButtonTap(e) {
		switch (e.detail.index) {
			case 0:
				this.closeSwapResult()
				break
			case 1:
				const url = this.data.result_swap.url
				const target_filename = this.data.result_swap.target_filename
				if (this.data.result_swap.is_image)
					saveImage(url)
				else {
					wx.showLoading({
						title: '保存中...',
						mask: true
					})
					downloadAndSaveVideo(url, target_filename, () => wx.hideLoading(), () => wx.hideLoading())
				}
				break
		}
	},
	closeSwapResult() {
		this.setData({
			result_swap: null
		})
	},
	viewResult() {
		this.setData({
			showResult: true
		})
	},
	closeResult() {
		console.log("ddd")
		this.setData({
			showResult: false
		})
	},
	selectTarget() {
		if (this.data.is_picture === true) {
			wx.chooseImage({
				success: rs => {
					if (_.isEmpty(rs.tempFilePaths)) return
					this.setData({
						selectedTargetPicture: rs.tempFilePaths[0]
					})
				}
			})
		} else {
			wx.chooseVideo({
				success: rs => this.setData({
					selectedTargetVideo: rs.tempFilePath
				}),
				fail: (e) => {
					console.error("selectTarget", e)
				}
			})
		}
	},
	async getExecuteArg() {
		const arg_video = this.data.is_picture ? ({}) : ({
			"keepTargetFps": this.data.keepTargetFps,
			"keepTemporaryFrames": this.data.keepTemporaryFrames,
			"skipTargetAudio": this.data.skipTargetAudio,
			"manyFaces": this.data.manyFaces
		})
		return ({
			"source_filename": getFileName(this.data.selectedFacePicture),
			"target_filename": getFileName(this.data.selectedTarget),
			"source": await getBase64Promise(this.data.selectedFacePicture),
			"target": await getBase64Promise(this.data.selectedTarget),
			...arg_video
		})
	},
	async execute() {
		const arg = await this.getExecuteArg()
		this.setData({
			executing: true
		})
		servicePost("/face_swap/swap", () => {
			this.setData({
				executing: false
			})
			refreshUser()
			wx.showToast({
				title: '稍后查看结果,大概1分钟',
			})
		}, arg)
	},
	/**
	 * 生命周期函数--监听页面加载
	 */
	onLoad() {
		this.waitAutoLogDone(() => {
			if (this.data.logged === false) wx.navigateTo({
				url: `/pages/login/login?from=/pages/face_swap/face_swap`,
			})
		})
	},
	processTime(face) {
		const changed = {
			enqueue_ts: formatDate(getDateHoursAdd(face.enqueue_ts, 8)),
			execute_ts: formatDate(getDateHoursAdd(face.execute_ts, 8)),
			finish_ts: formatDate(getDateHoursAdd(face.finish_ts, 8)),
			index_in_queue: face.index_in_queue === null ? null : face.index_in_queue + 1
		}
		const rs = Object.assign({}, face, changed)
		return rs
	},
	getResults() {
		if (this.data.showResult) return
		servicePost("/face_swap/get_swap_list", faceSwapResults => {
			this.setData({
				faceSwapResults: _.map(faceSwapResults, this.processTime)
			})
		}, {
			only_md5: true
		})
	},
	loopLatestResults() {
		if (this.data._timeHandler !== null) return
		this.data._timeHandler = setInterval(this.getResults, 20 * 1000);
	},
	/**
	 * 生命周期函数--监听页面初次渲染完成
	 */
	onReady() {
		this.getResults()
		this.loopLatestResults()
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
		if (this.data._timeHandler !== null) {
			clearInterval(this.data._timeHandler)
			console.log("定时器已经清除")
		}
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