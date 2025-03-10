import '@/utils/lodash-fix';
import _ from "@/npm/lodash/index";
import {
	addBase64Prefix,
	getBase64Promise,
	getRemoteOnePicture,
	getRemoteOnePicturePromise,
	matchBase64,
	md5ToUrl
} from '@/utils/image';
import {
	SERVICE_URL_VIDEO_RECORD_DELETE,
	SERVICE_URL_VIDEO_GET,
	SERVICE_URL_VIDEO_SAVE,
	QUESTION_TEXT_SAMPLE,
	SERVICE_URL_VIDEO_RECORDS_GET,
	SAMPLE_JPG,
	SAMPLE_MP3,
	SAMPLE_MP4
} from '@/utils/constant';
import {
	isAnyEmpty,
	isNotAnyEmpty
} from '@/utils/util';
import {
	getAuthorization
} from '@/utils/storage';
import {
	store
} from '@/store/index';
import {
	formatDate,
	getDateHoursAdd
} from '@/utils/date';
import {
	getImageExtName
} from '@/utils/file';
const VIDEO_STATUS_DRAFT = "draft"
const VIDEO_STATUS_WAITING = "waiting"
const VIDEO_STATUS_ERROR = "error"
const VIDEO_STATUS_EXECUTING = "executing"
const VIDEO_STATUS_FAIL = "fail"
const VIDEO_STATUS_FINISH = "finish"
const canDeleteStatus = [
	VIDEO_STATUS_ERROR,
	VIDEO_STATUS_DRAFT,
	VIDEO_STATUS_FAIL,
	VIDEO_STATUS_FINISH
]
const canEditStatus = canDeleteStatus
const {
	default: AIPage
} = require("@/base/ai_page");
const {
	getWebUrl,
	servicePost,
	getUrl
} = require("@/utils/service");

const defaultStructs = [{
	type: "text",
	text: "欢迎使用 AI 短视频"
}, {
	type: "text",
	text: "您只需要提供文字图片,即可生成视频;还可添加LOGO、背景音乐、片头片尾"
}]
const bodyMap = {
	"灿馨": 2,
	"逍馨": 3,
	"关馨": 4,
	"家馨": 5
}
const bodyMapReverse = _.invert(bodyMap)
const bodies = Object.keys(bodyMap)

const resolutions = [
	[1920, 1080],
	[1280, 720],
	[1024, 576],
	[1080, 1920],
	[720, 1280],
	[576, 1024]
]

const voiceMap = {
	"馨小美-女生": 0,
	"馨小宇-男生": 1,
	"馨小云-男生": 3,
	"馨小丫-女童": 4,
	"馨小娇-女生": 5,
	"馨小朵-女童": 103,
	"馨小博-男生": 106,
	"馨小童-男童": 110,
	"馨小萌-女生": 111,
	"馨小遥-男生": 5003,
	"馨小婷-女生": 5118,
	"馨小耀-男生": 4003,
	"馨小雯-女生": 4100,
	"馨小米-男童": 4103,
	"馨小灵-女生": 4105,
	"馨小文-男生": 4106,
	"馨小贤-男生": 4115,
	"馨小乔-女生": 4117,
	"馨小鹿-女生": 4119,
	"馨姗姗-女生": 4144,
	"馨小新-女生": 4140,
	"馨清风-男生": 4143,
	"馨小彦-男生": 4129,
	"馨小贝-女生": 4278,
	"馨小清-女生": 4254,
	"馨星河-男生": 4149
}
const voiceMapReverse = _.invert(voiceMap)
const voices = Object.keys(voiceMap)
const CHARACTER_COUNT_MINUTE = 260
AIPage({

	/**
	 * 页面的初始数据
	 */
	data: {
		title: "AI 短视频",
		logo: getWebUrl("/mp_images/ai_video.png"),
		textImagesShow: false,
		aiGenerateShow: false,

		structs: _.cloneDeep(defaultStructs),

		text: null,
		type: true,
		mediaSource: {
			urlRemote: getWebUrl("/mp_images/sample_star.jpg")
		},

		editing: false,
		tail: false,
		index: null,

		prompt: QUESTION_TEXT_SAMPLE,
		bodies,
		selectedBodyIndex: null,
		resolutions,
		selectedResolutionIndex: 0,
		voices,
		selectedVoiceIndex: 0,
		videoLogo: null,
		bgMusic: null,
		videoBegin: null,
		videoEnd: null,
		sugar: null,
		innerAudioContext: null,
		name: null,
		id: null,
		videoRecordsShow: false,
		video_records: [],
		_timeHandler: null,
	},
	computed: {
		wordCount(data) {
			return _.sum(_.map(_.filter(data.structs, struct => struct["type"] === "text"), struct => struct["text"].length))
		},
		seconds(data) {
			return data.wordCount * 60 / CHARACTER_COUNT_MINUTE
		},
		calculatePoints(data) {
			return (data.seconds / 60) * (12 + 62 * (_.isNil(data.selectedBodyIndex) ? 0 : 1))
		},
		toSpendMoney(data) {
			const PRICE_VIDEO_POINT = _.get(data.setting, ["PRICE_VIDEO_POINT"], 0)
			const PRICE_TIMES_VIDEO = _.get(data.setting, ["PRICE_TIMES_VIDEO"], 0)
			return (data.calculatePoints * PRICE_VIDEO_POINT * PRICE_TIMES_VIDEO)
		},
		tip(data) {
			return _.join([
				"数字人价格较高,但效果较好",
				`字数=${data.wordCount}`,
				`预估秒长=${data.seconds.toFixed(0)}`,
				`预估点数=${data.calculatePoints.toFixed(0)}`,
				`预估价格=${data.toSpendMoney.toFixed(2)}`,
				"最短秒长5秒"
			], ";")
		},
		sugarUrl(data) {
			return _.get(data.sugar, ["mediaSource", "urlLocal"]) || _.get(data.sugar, ["mediaSource", "urlBase64"]) || _.get(data.sugar, ["mediaSource", "urlRemote"]) || _.get(data.sugar, ["mediaSource", "url"])
		},
		sugarType(data) {
			return _.get(data.sugar, ["type"])
		},
		sugarSample(data) {
			const map = {
				videoLogo: SAMPLE_JPG,
				bgMusic: SAMPLE_MP3,
				videoBegin: SAMPLE_MP4,
				videoEnd: SAMPLE_MP4
			}
			return _.get(map, data.sugarType)
		},
		cant_set_sugar(data) {
			return _.isNil(data.sugarUrl)
		},
		cant_generate(data) {
			return isAnyEmpty(data.name) || data.seconds < 5
		},
		cant_save(data) {
			return isAnyEmpty(data.name)
		},
		bgMusicButtons(data) {
			if (_.isNil(data.sugarUrl))
				return []
			else return [{
				text: "播放",
				value: "play",
				primary: true,
				visible: _.get(data.sugar, ["playing"]) !== true
			}, {
				text: "暂停",
				value: "pause",
				primary: true,
				visible: _.get(data.sugar, ["playing"]) === true
			}, {
				text: "停止",
				value: "stop",
				primary: true,
				visible: _.get(data.sugar, ["playing"]) === true
			}]
		},
		textImageDesc(data) {
			const [text, image] = _.partition(data.structs, struct => struct['type'] === "text")
			return data.structs.length === 0 ? null : `${text.length}文${image.length}图`
		}
	},
	closeVideoRecords() {
		this.setData({
			videoRecordsShow: false
		})
	},
	resetBody() {
		this.setData({
			selectedBodyIndex: null
		})
	},
	bgMusicButtonsTap(e) {
		const update = (status) => {
			_.set(this.data.sugar, ["playing"], status)
			this.setData({
				sugar: this.data.sugar
			})
		}
		if (this.data.innerAudioContext === null) {
			this.data.innerAudioContext = wx.createInnerAudioContext({
				useWebAudioImplement: false
			})
			this.data.innerAudioContext.onPlay(() => update(true))
			this.data.innerAudioContext.onPause(() => update(false))
			this.data.innerAudioContext.onStop(() => update(false))
		}
		if (isAnyEmpty(this.data.innerAudioContext.src))
			this.data.innerAudioContext.src = this.data.sugarUrl
		switch (e.detail.item.value) {
			case "play":
				this.data.innerAudioContext.play()
				break
			case "pause":
				this.data.innerAudioContext.pause()
				break
			case "stop":
				this.data.innerAudioContext.stop()
				break
		}
		console.log("debug", this.data.innerAudioContext)
	},
	setSugar(e) {
		const type = e.currentTarget.dataset.type
		let sugar = _.get(this.data, [type])
		const sugarMap = {
			"videoLogo": "视频标识",
			"bgMusic": "背景音乐",
			"videoBegin": "视频片头",
			"videoEnd": "视频片尾",
		}
		sugar = Object.assign({}, sugar, {
			sugarName: sugarMap[type],
			type
		})
		this.setData({
			sugar
		})
	},
	unsetSugar() {
		const type = _.get(this.data.sugar, ["type"])
		this.setData({
			[type]: null,
			sugar: null
		})
		this.releaseVoice()
	},
	confirmSugar() {
		const type = _.get(this.data.sugar, ["type"])
		this.setData({
			[type]: this.data.sugar,
			sugar: null
		})
		this.releaseVoice()
	},
	getRemoteSugar() {
		wx.showModal({
			title: '网络资源',
			content: this.data.sugarSample,
			editable: true,
			complete: async (res) => {
				if (res.confirm) {
					if (isAnyEmpty(res.content)) return
					if (!res.content.startsWith("http")) return
					_.set(this.data.sugar, ["mediaSource", "urlRemote"], res.content)
					if (this.data.sugarType === "videoLogo")
						_.set(this.data.sugar, ["mediaSource", "urlBase64"], addBase64Prefix(await getRemoteOnePicturePromise(res.content)))
					this.setData({
						sugar: this.data.sugar
					})
				}
			}
		})
	},
	selectLocalSugar() {
		const type = _.get(this.data.sugar, ["type"])
		const gotFile = (rs) => {
			console.log("gotfile", rs)
			const urlLocal = _.first(rs.tempFilePaths) || _.get(_.first(rs.tempFiles), ["path"]) || rs.tempFilePath
			if (_.isNil(urlLocal)) return
			_.set(this.data.sugar, ["mediaSource", "urlLocal"], urlLocal)
			this.setData({
				sugar: this.data.sugar
			})
		}
		switch (type) {
			case "videoLogo":
				wx.chooseImage({
					success: gotFile
				})
				break
			case "bgMusic":
				wx.chooseMessageFile({
					count: 1,
					extension: [".mp3"],
					success: gotFile,
					fail: e => console.error("music", e)
				})
				break
			case "videoBegin":
			case "videoEnd":
				wx.chooseVideo({
					success: gotFile
				})
				break
		}
	},
	selectLocal() {
		wx.chooseImage({
			success: async rs => {
				const urlLocal = _.first(rs.tempFilePaths)
				this.setData({
					mediaSource: {
						urlLocal
					}
				})
			}
		})
	},
	getRemote() {
		wx.showModal({
			title: '网络图片',
			content: '请输入网络图片地址',
			editable: true,
			complete: (res) => {
				if (res.confirm) {
					if (res.content.startsWith("http")) {
						const urlRemote = res.content
						getRemoteOnePicture(urlRemote, (base64) => {
							const urlBase64 = addBase64Prefix(base64, getImageExtName(urlRemote))
							this.setData({
								mediaSource: {
									urlBase64,
									urlRemote
								}
							})
						})
					}
				}
			}
		})
	},
	aiGenerate() {
		this.setData({
			aiGenerateShow: true
		})
	},
	doneGenerate() {
		this.setData({
			aiGenerateShow: false
		})
	},
	gotGenerated(e) {
		if (this.data.type) {
			this.setData({
				text: e.detail,
				aiGenerateShow: false
			})
		} else {
			const {
				base64,
				md5
			} = e.detail
			this.setData({
				mediaSource: {

					url: (md5 && md5ToUrl(md5)) || (addBase64Prefix(base64))
				},
				aiGenerateShow: false
			})
		}
	},
	toTextImages() {
		this.setData({
			textImagesShow: true
		})
	},

	closeSugar() {
		this.releaseVoice()
		this.setData({
			sugar: null
		})
	},
	closeTextImages() {
		this.setData({
			textImagesShow: false
		})
	},
	confirmUpsert() {
		const new_struct = {
			text: this.data.text,
			type: this.data.type ? "text" : "image",
			mediaSource: this.data.mediaSource
		}
		if (this.data.editing === true) this.data.structs[this.data.index] = new_struct
		else {
			if (this.data.tail) this.data.structs.push(new_struct)
			else this.data.structs.splice(this.data.index + 1, 0, new_struct)
		}
		this.setData({
			structs: this.data.structs
		})
		this.doneUpsert()
	},
	doneUpsert() {
		this.setData({
			text: null,
			type: true,
			mediaSource: {
				urlRemote: getWebUrl("/mp_images/sample_star.jpg")
			},
			editing: false,
			tail: false,
			index: null
		})
	},
	add(e) {
		this.setData({
			editing: false,
			index: e.currentTarget.dataset.index
		})
	},
	edit(e) {
		const index = e.currentTarget.dataset.index
		const struct = this.data.structs[index]
		struct['type'] = struct['type'] === "text"
		this.setData({
			editing: true,
			index,
			...struct
		})
	},
	delete() {
		wx.showModal({
			title: '删除确认',
			content: `确定删除这个${(this.data.type||true) ? '文本':'图片'}吗?`,
			complete: (res) => {
				if (res.confirm) {
					this.data.structs.splice(this.data.index, 1)
					this.setData({
						structs: this.data.structs
					})
				}
			}
		})
	},
	onUnload() {
		this.releaseVoice()
	},
	releaseVoice() {
		if (this.data.innerAudioContext !== null) {
			this.data.innerAudioContext.stop()
			this.data.innerAudioContext.destroy()
			this.data.innerAudioContext = null
		}
	},
	decomposeStructList(structs) {
		_.forEach(structs, struct => {
			const url = _.get(struct, ["mediaSource", "url"])
			if (isNotAnyEmpty(url) && !url.startsWith("http"))
				_.set(struct, ["mediaSource", "url"], addBase64Prefix(url))
		})
		return structs
	},
	composeStructList() {
		return Promise.all(_.map(this.data.structs, async struct => {
			struct = _.cloneDeep(struct)
			switch (struct['type']) {
				case "text":
					_.unset(struct, "mediaSource")
					return Promise.resolve(struct)
				case "image":
					_.unset(struct, "text")
					return this.getMediaSource(struct).then(ms => {
						_.set(struct, ["mediaSource"], ms)
						return struct
					})
			}
		}))
	},
	getMediaSource(struct) {
		const urlLocal = _.get(struct, ["mediaSource", "urlLocal"])
		const urlRemote = _.get(struct, ["mediaSource", "urlRemote"])
		const urlBase64 = _.get(struct, ["mediaSource", "urlBase64"])
		const url = urlRemote || urlBase64
		if (url) return Promise.resolve({
			type: 3,
			url
		})
		else if (urlLocal) return getBase64Promise(urlLocal).then(base64 => base64 ? ({
			type: 3,
			url: addBase64Prefix(base64, getImageExtName(urlLocal))
		}) : null)
		else return Promise.resolve(null)
	},
	getLocal2RemotePromise(localFile, sugarType) {
		if (_.isNil(localFile)) return Promise.resolve(null)
		const media = {
			"videoLogo": "image",
			"bgMusic": "audio",
			"videoBegin": "video",
			"videoEnd": "video"
		} [sugarType]
		return new Promise((resolve) => wx.uploadFile({
			filePath: localFile,
			name: "file",
			header: {
				"Authorization": getAuthorization()
			},
			formData: {
				media
			},
			url: getUrl('/video/mp_upload_file'),
			success: (rs) => resolve(_.trim(rs.data, "\"")),
			fail: (e) => {
				console.error("getLocal2RemotePromise", e, localFile)
				resolve(null)
			}
		}))
	},
	getSugarMediaSource(sugar) {
		if (_.isNil(sugar)) return null
		const sugarType = _.get(sugar, ["type"])
		const urlLocal = _.get(sugar, ["mediaSource", "urlLocal"])
		const urlRemote = _.get(sugar, ["mediaSource", "urlRemote"])
		if (urlRemote) return Promise.resolve({
			mediaSource: {
				type: 3,
				url: urlRemote
			}
		})
		else return this.getLocal2RemotePromise(urlLocal, sugarType).then(url => ({
			mediaSource: {
				type: 3,
				url
			}
		}))
	},
	getFileBytes(struct) {
		const urlLocal = _.get(struct, ["mediaSource", "urlLocal"])
		if (_.isNil(urlLocal)) return null
		return wx.getFileSystemManager().readFileSync(urlLocal)
	},
	decomposeVideoOriginal(ai_video) {
		const {
			source,
			config
		} = ai_video
		const {
			structs
		} = source
		const {
			digitalHumanId,
			resolution,
			ttsPer,
			videoLogo,
			bgMusic,
			videoBegin,
			videoEnd
		} = config
		const selectedBodyIndex = digitalHumanId && bodies.indexOf(bodyMapReverse[String(digitalHumanId)])
		const selectedResolutionIndex = resolution && resolutions.indexOf(resolution)
		const selectedVoiceIndex = ttsPer && voices.indexOf(voiceMapReverse[String(ttsPer)])
		this.setData({
			structs: this.decomposeStructList(structs),
			selectedBodyIndex,
			selectedResolutionIndex,
			selectedVoiceIndex,
			videoLogo,
			bgMusic,
			videoBegin,
			videoEnd
		})
	},
	deleteRecord(e) {
		const index = e.currentTarget.dataset.index
		const record = this.data.video_records[index]
		wx.showModal({
			title: '确认删除',
			content: `确定要删除吗？ ${record.name}`,
			complete: (res) => {
				if (res.confirm) {
					servicePost(SERVICE_URL_VIDEO_RECORD_DELETE, () => {
						wx.showToast({
							title: '删除成功',
						})
						this.data.video_records.splice(index, 1)
						this.setData({
							video_records: this.data.video_records
						})
					}, {
						id: record.id
					})
				}
			}
		})
	},
	copyRecord(e) {
		const record = this.data.video_records[e.currentTarget.dataset.index]
		const video = JSON.parse(record['video_json_str'])
		_.unset(video, ["id"])
		this.decomposeVideoOriginal(video)
		wx.showToast({
			title: '文件已打开',
		})
		this.setData({
			videoRecordsShow: false,
			name: `${record['name']}的副本`
		})
	},
	editRecord(e) {
		const record = this.data.video_records[e.currentTarget.dataset.index]
		const video = JSON.parse(record['video_json_str'])
		this.decomposeVideoOriginal(video)
		wx.showToast({
			title: '文件已打开',
		})
		this.setData({
			videoRecordsShow: false,
			name: record.name,
			id: record.id
		})
	},
	copyAddress(e) {
		wx.setClipboardData({
			data: e.currentTarget.dataset.address,
			success: (res) => wx.showToast({
				title: '拷贝成功',
			})
		})
	},
	onUnload() {
		if (this.data._timeHandler !== null) {
			clearInterval(this.data._timeHandler)
			console.log("定时器已经清除")
		}
	},
	onReady() {
		this.loadRecords()
		this.loopLatestResults()
	},
	loopLatestResults() {
		if (this.data._timeHandler !== null) return
		this.data._timeHandler = setInterval(this.loadRecords, 60 * 1000);
	},
	viewReason(e) {
		wx.showModal({
			title: '失败原因',
			content: e.currentTarget.dataset.reason
		})
	},
	viewRecords() {
		this.setData({
			videoRecordsShow: true
		})
	},
	loadRecords() {
		if (this.data.videoRecordsShow) {
			console.log("loadRecords ignored for show mode")
		}
		servicePost(SERVICE_URL_VIDEO_RECORDS_GET, (video_records) => {
			console.log(`video_records ${video_records.length}个`)
			this.setData({
				video_records: _.map(video_records, record => Object.assign({}, record, {
					create_time: formatDate(getDateHoursAdd(record.create_time, 0)),
					can_delete: canDeleteStatus.includes(record.status),
					can_edit: canEditStatus.includes(record.status),
					basicDuration: record.basicDuration && (record.basicDuration / 1000).toFixed(1),
					digitalHumanDuration: record.digitalHumanDuration && (record.digitalHumanDuration / 1000).toFixed(1),
					money: record.money && (record.money).toFixed(2)
				}))
			})
		}, null, null, null, (e) => {
			console.error("loadRecords", e)
		})
	},
	composeVideoOriginal() {
		const [videoLogo, bgMusic, videoBegin, videoEnd] = [this.data.videoLogo, this.data.bgMusic, this.data.videoBegin, this.data.videoEnd]
		const structs = this.data.structs
		return ({
			source: {
				structs
			},
			config: {
				digitalHumanId: this.data.selectedBodyIndex && bodyMap[bodies[this.data.selectedBodyIndex]],
				resolution: resolutions[this.data.selectedResolutionIndex],
				ttsPer: voiceMap[voices[this.data.selectedVoiceIndex]],
				videoLogo,
				bgMusic,
				videoBegin,
				videoEnd
			}
		})
	},
	composeVideo() {
		const medias = [this.data.videoLogo, this.data.bgMusic, this.data.videoBegin, this.data.videoEnd]
		const mediasRemote = Promise.all(_.map(medias, this.getSugarMediaSource))
		const structs = this.composeStructList()
		const all = Promise.all([structs, mediasRemote])
		return all.then(([structs, [videoLogo, bgMusic, videoBegin, videoEnd]]) => ({
			source: {
				structs
			},
			config: {
				digitalHumanId: this.data.selectedBodyIndex && bodyMap[bodies[this.data.selectedBodyIndex]],
				resolution: resolutions[this.data.selectedResolutionIndex],
				ttsPer: voiceMap[voices[this.data.selectedVoiceIndex]],
				videoLogo,
				bgMusic,
				videoBegin,
				videoEnd
			}
		}))
	},
	saveVideo() {
		servicePost(SERVICE_URL_VIDEO_SAVE, (id) => {
			wx.showToast({
				title: '保存成功',
			})
			this.setData({
				id
			})
		}, {
			video: this.composeVideoOriginal(),
			name: this.data.name,
			id: this.data.id
		})
	},
	async generateVideo() {
		wx.showLoading({
			title: "文件上传中...",
		})
		const postData = await this.composeVideo().then(video => ({
			params: JSON.stringify({
				video,
				name: this.data.name,
				id: this.data.id
			})
		}))
		wx.hideLoading()
		wx.showLoading({
			title: "任务提交中...",
		})
		console.log("postdata", postData)
		this.checkMoney(this.data.toSpendMoney, () => {
			servicePost(SERVICE_URL_VIDEO_GET, (id) => {
				wx.showToast({
					title: '成功提交',
				})
				wx.hideLoading()
				this.setData({
					id
				})
			}, postData, null, null, (e => {
				wx.hideLoading()
				console.error("generateVideo", e)
			}))
		})
	}
})