import '@/utils/lodash-fix';
import _ from "@/npm/lodash/index";
import {
	IMAGE_DALL_E3,
	IMAGE_MODEL_SD_DEFAULT,
	IMAGE_SD_XL,
	PRICE_SD_RMB,
	QUESTION_DRAWING_SAMPLE,
	SERVICE_URL_IMAGE_GENERATE
} from '@/utils/constant';
import {
	getWebUrl,
	servicePost
} from '@/utils/service';
import {
	isAnyEmpty
} from '@/utils/util';
import {
	store
} from '@/store/index';
import {
	refreshUser
} from '@/utils/login'
import {
	addBase64Prefix,
	saveBase64Image
} from '@/utils/image';
import {
	setImageModel
} from '@/utils/storage';
const {
	default: AIPage
} = require("@/base/ai_page");
const DALL_Sizes = {
	"small": "256x256",
	"middle": "512x512",
	"big": "1024x1024"
}
const SD_Styles = {
	"基础风格": "Base",
	"3D模型": "3D Model",
	"模拟胶片": "Analog Film",
	"动漫": "Anime",
	"电影": "Cinematic",
	"漫画": "Comic Book",
	"工艺黏土": "Craft Clay",
	"数字艺术": "Digital Art",
	"增强": "Enhance",
	"幻想艺术": "Fantasy Art",
	"等距风格": "Isometric",
	"线条艺术": "Line Art",
	"低多边形": "Lowpoly",
	"霓虹朋克": "Neonpunk",
	"折纸": "Origami",
	"摄影": "Photographic",
	"像素艺术": "Pixel Art",
	"纹理": "Texture"
}
const SD_StyleValues = Object.values(SD_Styles)
const SD_Sizes = {
	"头像1": "768x768",
	"头像2": "1024x1024",
	"头像3": "1536x1536",
	"头像4": "2048x2048",

	"文章配图1": "1024x768",
	"文章配图2": "2048x1536",

	"海报传单1": "576x1024",
	"海报传单2": "768x1024",
	"海报传单3": "1536x2048",

	"电脑壁纸1": "1024x576",
	"电脑壁纸2": "2048x1152"
}
const SD_StepNames = [
	10, 20, 30, 40, 50
]
const SD_SizeValues = Object.values(SD_Sizes)
AIPage({

	/**
	 * 页面的初始数据
	 */
	data: {
		SERVICE_URL_IMAGE_GENERATE,
		title: "AI 文生图",
		logo: getWebUrl("/mp_images/text2image.png"),
		generated: null,
		generating: false,
		SD_StepNames,
		SD_StyleNames: Object.keys(SD_Styles),
		SD_SizeNames: Object.keys(SD_Sizes),
		selectedSDStepIndex: 1,
		selectedSDStyleIndex: 0,
		selectedSDSizeIndex: 0,
		prompt: QUESTION_DRAWING_SAMPLE,
		negative_prompt: "不要有花",
		DALL_Sizes,
		selectedDallSize: "small",
		dallSizeItems: [{
				name: '小图',
				value: 'small'
			},
			{
				name: '中图',
				value: 'middle'
			},
			{
				name: '大图',
				value: 'big'
			}
		],
		currentIndex: 0,
		tabBarList: [{
			text: "简单",
			iconPath: getWebUrl("/mp_images/new_bird_white.svg"),
			selectedIconPath: getWebUrl("/mp_images/new_bird_blue.svg"),
		}, {
			text: "专业",
			iconPath: getWebUrl("/mp_images/professional_white.svg"),
			selectedIconPath: getWebUrl("/mp_images/professional_blue.svg"),
		}]
	},
	computed: {
		selectedSDSizeValue(data) {
			return _.get(SD_Sizes, data.selectedSDSizeName)
		},
		selectedSDStepName(data) {
			return _.get(data.SD_StepNames, data.selectedSDStepIndex)
		},
		selectedSDSizeName(data) {
			return _.get(data.SD_SizeNames, [data.selectedSDSizeIndex])
		},
		selectedSDStyleName(data) {
			return _.get(data.SD_StyleNames, [data.selectedSDStyleIndex])
		},
		selectedSDStyleValue(data) {
			return _.get(SD_Styles, data.selectedSDStyleName)
		},
		selectedSizeDALLPixel(data) {
			return _.get(DALL_Sizes, data.selectedDallSize)
		},
		price(data) {
			return _.get(data.setting, [PRICE_SD_RMB])
		},
		generationArg(data) {
			switch (data.currentIndex) {
				case 0:
					return ({
						"model_name": IMAGE_DALL_E3,
						"size": data.selectedDallSize
					})
				case 1:
					return ({
						"model_name": IMAGE_SD_XL,
						"size": data.selectedSDSizeValue,
						"style": data.selectedSDStyleValue,
						"steps": data.selectedSDStepName
					})
				default:
					return {}
			}
		},
	},
	dallSizeChange(e) {
		console.log(e)
		this.setData({
			selectedDallSize: e.detail.value
		})
	},
	generatedDialogTap(e) {
		if (e.detail.index === 1)
			saveBase64Image(this.data.generated, "aa_text2image.png")
		this.setData({
			generated: null
		})
	},
	save() {
		setImageModel(this.data.generationArg)
		wx.showToast({
		  title: '保存成功',
		})
	},
	execute() {
		this.checkMoney(this.data.price, () => {
			servicePost("/security/text_is_censor", (rs) => {
				if (rs === true) wx.showToast({
					title: '输入敏感!',
				})
				else {
					if (isAnyEmpty(this.data.prompt)) {
						wx.showToast({
							title: '请输入图片要求',
						})
						return
					} else {
						this.setData({
							generating: true
						})
						let arg = Object.assign({}, {
							question: this.data.prompt
						}, store.getGenerationBasic, this.data.generationArg)
						if (this.data.currentIndex === 1) arg["negative_prompt"] = this.data.negative_prompt
						servicePost(SERVICE_URL_IMAGE_GENERATE, (rs) => {
							let base64 = _.first(_.get(rs, ["images"]))
							base64 = addBase64Prefix(base64)
							this.setData({
								generating: false,
								generated: base64
							})
							refreshUser()
						}, arg)

					}
				}
			}, {
				"texts": _.reject([this.data.prompt, this.data.negative_prompt], _.isNil)
			})
		})
	},
	/**
	 * 生命周期函数--监听页面加载
	 */
	onLoad() {
		this.waitAutoLogDone(() => {
			if (this.data.logged === false) wx.navigateTo({
				url: `/pages/login/login?from=/pages/text2image/text2image`,
			})
			else {
				if (_.isNil(store.selectedPublicModelImage)) return
				if (store.isSD_XL) {
					this.setData({
						currentIndex: 1,
						selectedSDStepIndex: SD_StepNames.indexOf(_.get(store.selectedPublicModelImage, ["steps"])),
						selectedSDStyleIndex: SD_StyleValues.indexOf(_.get(store.selectedPublicModelImage, ["style"])),
						selectedSDSizeIndex: SD_SizeValues.indexOf(_.get(store.selectedPublicModelImage, ["size"]))
					})
				} else {
					this.setData({
						currentIndex: 0,
						selectedDallSize: _.get(store.selectedPublicModelImage, ["size"])
					})
				}

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

	}
})