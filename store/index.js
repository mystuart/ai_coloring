import {
	dateTextToday
} from '@/utils/date'
import {
	servicePost
} from "@/utils/service"
import {
	GPT_4,
	GPT_3DOT5_TURBO,
	GPT_3DOT5_TURBO_16K,
	IMAGE_SMALL,
	IMAGE_MIDDLE,
	IMAGE_BIG,
	PRICE_BACKGROUND_CHANGE_RMB,
	PAPER,
	IMAGE_MODEL_OPENAI_DEFAULT,
	IMAGE_SD_XL,
	TOKEN_KEY,
	GPT_NAME_MAP} from "@/utils/constant"
import {
	observable,
	action
} from 'mobx-miniprogram'
import '@/utils/lodash-fix';
import _ from "@/npm/lodash/index";
import {
	setToken
} from '../utils/storage'
export function questionId() {
	return Number(`${store.userId}${new Date().getTime()}${_.toInteger(Math.random()*1000000)}`).toString(36)
}
export function monthItemText(item) {
	return _.join([`价格:${item.money}`,
		`类别:${item.category}`,
		`级别:${item.level}`,
		`提问:${item.text_count}`,
		`绘画:${item.image_count}`,
		`OCR:${item.ocr_count}`
	], " ")
}

function getDetail(v) {
	return `最大Token数-${v.MAX_TOKENS},每千输入Token价格-${v.INPUT_1K_TOKENS_RMB.toFixed(2)}元,每千输出Token价格-${v.OUTPUT_1K_TOKENS_RMB.toFixed(2)}元`
}
export const store = observable({
	myTitle: null,
	maxContent: null,
	user: null,
	setting: null,
	configs: null,
	modelPrice: null,
	selectedPublicModelImage: IMAGE_MODEL_OPENAI_DEFAULT,
	selectedPublicModel: PAPER,
	selectedPrivateModelId: null,
	logAutoDone: false,
	models: [],
	get isSD_XL() {
		return _.get(this.selectedPublicModelImage, ["model_name"]) === IMAGE_SD_XL
	},
	get dialogIdPrefix() {
		return `${store.userId}__`
	},

	get getGenerationBasic() {
		return ({
			id: questionId(),
			user_id: this.userId,
			dialogue_id: `${store.userId}__${dateTextToday()}`
		})
	},
	get DialogChat() {
		return ({
			...this.getGenerationBasic,
			...this.AIGeneration
		})
	},
	get AIGeneration() {
		return {
			...this.selectedPublicModel,
			model_id: this.selectedPrivateModelId
		}
	},
	get PRICE_BACKGROUND_CHANGE_RMB() {
		return _.get(this.setting, [PRICE_BACKGROUND_CHANGE_RMB], 0.05)
	},
	get GIVE_PERCENT_STEP() {
		return _.get(this.setting, ["GIVE_PERCENT_STEP"], 0.05)
	},
	get GIVER_POLICY() {
		return _.get(this.setting, ["GIVER_POLICY"], {})
	},
	get giver_items() {
		return _.sortBy(_.map(this.GIVER_POLICY, (givePercentTimes, charge) => ({
			givePercentTimes,
			charge,
			givePercent: (givePercentTimes * this.GIVE_PERCENT_STEP * 100).toFixed(1),
			real: (charge * (givePercentTimes * this.GIVE_PERCENT_STEP + 1)).toFixed(1)
		})), item => parseInt(item.charge))
	},
	get MONTH_ITEMS() {
		return _.get(this.setting, ["MONTH_ITEMS"], [])
	},
	get is_month() {
		return _.get(this.user, ["is_month"]) === true
	},
	get userId() {
		return _.get(this.user, ["id"], null)
	},
	get phone() {
		return _.get(this.user, ["phone"], null)
	},
	get openid() {
		return _.get(this.user, ["openid"], null)
	},
	get account() {
		const a = _.get(this.user, ["account"])
		return a ? a.toFixed(2) : null
	},
	get logged() {
		return this.user !== null
	},
	get modelPriceList() {
		const price = this.modelPrice
		if (price == null) return null
		const m = GPT_NAME_MAP
		return [`${m[GPT_4]}:${getDetail(price[GPT_4])}`,
			`${m[GPT_3DOT5_TURBO_16K]}:${getDetail(price[GPT_3DOT5_TURBO_16K])}`,
			`${m[GPT_3DOT5_TURBO]}:${getDetail(price[GPT_3DOT5_TURBO])}`,
			`简单模式 生成大图片:${price[IMAGE_BIG].toFixed(2)}元`,
			`简单模式 生成中图片:${price[IMAGE_MIDDLE].toFixed(2)}元`,
			`简单模式 生成小图片:${price[IMAGE_SMALL].toFixed(2)}元`,
			`专业模式即SD-XL 生成图片:${_.get(this.setting,['PRICE_SD_RMB'])}元`,
			`提示:在价格方面简而言之，不同模型算法价格差异较大，对于同一模型算法，价格取决于提问+回答的长度`,
			`哪里用到大模型：`,
			`AI 招聘: 1、简历摘要提取; 2、简历排序; 3、AI招聘的自动回复`,
			`AI 话画: 1、文本提问; 2、图片生成`,
			`AI 机器人: 1、自动回复`,
			`AI WORD及AI PPT: 段落、内容的生成`
		]
	},
	// actions
	setMaxContent: action(function (maxContent) {
		this.maxContent = maxContent
		if (maxContent === null) return
		wx.navigateTo({
			url: '/pages/max_text/max_text',
		})
	}),
	setImageModel: action(function (model) {
		this.selectedPublicModelImage = model || IMAGE_MODEL_OPENAI_DEFAULT
	}),
	setPrivateModelId: action(function (modelId) {
		this.selectedPrivateModelId = modelId
	}),
	setMyTitle: action(function (myTitle) {
		this.myTitle = myTitle
	}),
	logoutUser: action(function () {
		setToken(null)
		this.logAutoDone = false
		this.user = null
	}),
	setUser: action(function (user) {
		this.logAutoDone = true
		this.user = user
		setToken(_.get(user, [TOKEN_KEY]))
	}),
	setSetting: action(function (setting) {
		this.setting = setting
	}),
	setConfigs: action(function (configs) {
		this.configs = configs
	}),
	setModelPrice: action(function (modelPrice) {
		this.modelPrice = modelPrice
	}),
	setPublic: action(function (model) {
		console.log("setPublic", model, PAPER)
		this.selectedPublicModel = model || PAPER
	}),
	setModels: action(function (models) {
		this.models = models
	}),
	getFiles: action(function (callback) {
		servicePost("/model/get_files", (models) => {
			this.setModels(models)
			callback && callback()
		})
	}),

})