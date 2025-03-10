import AIPage from '@/base/ai_page'
import {
	getImageUrl,
	getRemoteOnePicture,
	saveImage,
	selectLocalOnePicture
} from "@/utils/image"
import {
	store
} from "@/store/index"
import {
	saveFile
} from '@/utils/file'
import {
	getNormalizedName
} from '@/utils/name'
import '@/utils/lodash-fix';
import _ from "@/npm/lodash/index";
import {
	toOfficeFile,
	toWord
} from "./word_bridge"
import {
	TYPE_TITLE,
	TYPE_HEADER,
	TYPE_TEXT,
	TYPE_IMAGE,
	OPENAI_SIZES,
	SD_SIZES,
	SD_STYLES,
	IMAGE_MODEL_OPENAI_DEFAULT,
	IMAGE_MODEL_SD_DEFAULT,
	QUESTION_DRAWING_SAMPLE
} from "@/utils/constant"
import {
	TEST_WORD_ITEMS,
	SAMPLE_WORD,
	NEW_WORD
} from "./util"
import {
	getWebUrl,
	servicePost
} from '@/utils/service';
import {
	toHeaders,
	toText,
	toImage,
	getGenerationPrompt,
	getDialogChat
} from "./generate"
import {
	addBase64Prefix
} from '@/utils/image';
import {
	isAnyEmpty
} from '@/utils/util'
import {
	text_is_censor
} from '@/utils/security'
const MENU_ITEM_NEW = "NEW"
const MENU_ITEM_SAMPLE = "SAMPLE"
const MENU_ITEM_HEADER = "HEADER"
const MENU_ITEM_TEXT = "TEXT"
const MENU_ITEM_EC = "EC"
const MENU_ITEM_MAX = "MAX"

const MENU_ITEM_KUO = "KUO"
const MENU_ITEM_SUO = "SUO"
const MENU_ITEM_ZHAI = "ZHAI"
const MENU_ITEM_JIAN = "JIAN"
const MENU_ITEM_HUAN = "HUAN"
const MENU_ITEM_TEXT_CHANGES = [MENU_ITEM_KUO, MENU_ITEM_SUO, MENU_ITEM_ZHAI, MENU_ITEM_JIAN, MENU_ITEM_HUAN]
const MENU_ITEM_TEXT_CHANGE_MAP = {
	[MENU_ITEM_KUO]: "扩写",
	[MENU_ITEM_SUO]: "缩写",
	[MENU_ITEM_ZHAI]: "摘要",
	[MENU_ITEM_JIAN]: "关键字",
	[MENU_ITEM_HUAN]: "替换"
}

function toChangePrompt(menuItem, reference) {
	let count = reference.length
	switch (menuItem) {
		case MENU_ITEM_KUO:
			return `请把如下内容调整一下，要求语句通顺、文体风格保持不变、字数在${count * 2}个左右:\n${reference}`
		case MENU_ITEM_SUO:
			return `请把如下内容调整一下，要求语句通顺、文体风格保持不变、字数在${_.toInteger(count/2)}个左右:\n${reference}`
		case MENU_ITEM_ZHAI:
			return `请从如下内容提取摘要，要求字数在100个字左右:\n${reference}`
		case MENU_ITEM_JIAN:
			return `请从如下内容提取3个关键字:\n${reference}`
		case MENU_ITEM_HUAN:
			return `请把如下内容替换一下，要求语义不变、语句通顺、风格不变、字数相差不多:\n${reference}`
	}
}
const MENU_ITEM_IMAGE = "IMAGE"
const MENU_ITEM_GALLERY = "GALLERY"
const MENU_ITEM_DELETE = "DELETE"
const MENU_ITEM_TOGGLE_SYSTEM = "TOGGLE_SYSTEM"
const MENU_ITEM_TOGGLE = "TOGGLE"
const MENU_ITEM_SAVE = "SAVE"
const MENU_ITEM_SAVE_IMAGE = "SAVE_IMAGE"
const MENU_ITEM_OPEN = "OPEN"
const MENU_ITEM_DOWNLOAD = "DOWNLOAD"
const MENU_ITEM_TOGGLE_MODEL = "TOGGLE_MODEL"
const MENU_ITEM_TOGGLE_MONEY = "TOGGLE_MONEY"

AIPage({
	data: {
		QUESTION_DRAWING_SAMPLE: QUESTION_DRAWING_SAMPLE,
		title: "AI WORD",
		logo: getWebUrl("/mp_images/ai_word.png"),
		manual_content: null,
		remoteImageUrl: null,
		showImageUrlDialog: false,
		sameLevelHeader: false,
		manualImageButtons: [{
			'text': '本地上传',
			primary: true
		}, {
			'text': '网络图片',
			primary: true
		}],
		manual: false,
		itemContentEditShow: false,
		itemContentEditing: null,
		showGallery: false,
		openSizeSelected: null,
		OPENAI_SIZES: Object.keys(OPENAI_SIZES),

		sdSizeSelected: null,
		sdSizeActions: _.map(SD_SIZES, (size, name) => ({
			text: `${name}/${size}`,
			value: size,
			type: "default"
		})),
		pickSDSizeShow: false,
		SD_SIZES: Object.keys(SD_SIZES),

		sdStyleSelected: null,
		sdStyleActions: _.map(SD_STYLES, (style, name) => ({
			text: `${name}/${style}`,
			value: style,
			type: "default"
		})),
		pickSDStyleShow: false,
		SD_STYLES: Object.keys(SD_STYLES),

		modelsTabBarListImage: [{
			text: "简单",
			iconPath: getImageUrl("simple.svg"),
			selectedIconPath: getImageUrl("simple_selected.svg"),
		}, {
			text: "专家",
			iconPath: getImageUrl("complex.svg"),
			selectedIconPath: getImageUrl("complex_selected.svg"),
		}, ],
		currentImageModelIndex: null,
		generation_menu_item: null,
		generation_to: TYPE_IMAGE,
		generation_title: null,
		generation_prompt: null,
		words: [],
		modelShow: false,
		moneyShow: false,
		showOpenWordDialog: false,
		showFileNameDialog: false,
		filename: null,
		id: null,
		menuShowSystem: false,
		menuShow: false,
		TYPE_TITLE,
		TYPE_HEADER,
		TYPE_TEXT,
		TYPE_IMAGE,
		itemIndex: null,
		items: TEST_WORD_ITEMS
	},
	computed: {
		sdStyleName(data) {
			if (_.isNil(data.sdStyleSelected)) return null
			return _.findKey(SD_STYLES, v => data.sdStyleSelected === v)
		},
		totalLength(data) {
			return _.sum(_.map(data.items || [], item => item.content.length))
		},
		itemType(data) {
			if (data.itemIndex === null) return null
			if (data.items.length === 0) return null
			return _.get(data.items, [data.itemIndex, "type"])
		},
		itemDeep(data) {
			if (data.itemIndex === null) return null
			if (data.items.length === 0) return null
			const d = _.get(data.items, [data.itemIndex, "deep"])
			return _.isNil(d) ? -1 : d
		},
		itemShort(data) {
			if (data.itemIndex === null) return null
			if (data.items.length === 0) return null
			return _.get(data.items, [data.itemIndex, "short"], false)
		},
		itemContent(data) {
			if (data.itemIndex === null) return null
			if (data.items.length === 0) return null
			return _.get(data.items, [data.itemIndex, "content"])
		},
		imgUrls(data) {
			return _.map(_.filter(data.items, item => item['type'] === TYPE_IMAGE), item => item.content)
		},
		currentUrlIndex(data) {
			if (data.itemType !== TYPE_IMAGE) return null
			return _.findIndex(data.imgUrls, url => url === data.itemContent)
		},
		menuButtonsSystem(data) {
			if (data.menuShowSystem) {
				return [{
						icon: getImageUrl("right_white.svg"),
						primary: true,
						value: MENU_ITEM_TOGGLE_SYSTEM
					}, {
						primary: true,
						text: "示例",
						value: MENU_ITEM_SAMPLE
					}, {
						primary: true,
						text: "新建",
						value: MENU_ITEM_NEW
					},
					{
						icon: getImageUrl("open_white.svg"),
						primary: true,
						value: MENU_ITEM_OPEN,
						visible: data.words.length > 1
					}, {
						icon: getImageUrl("save_white.svg"),
						primary: true,
						value: MENU_ITEM_SAVE,
						visible: data.items.length > 0
					}, {
						icon: getImageUrl("download_white.svg"),
						primary: true,
						value: MENU_ITEM_DOWNLOAD
					}, {
						icon: getImageUrl("word-delete.svg"),
						primary: true,
						value: MENU_ITEM_DELETE,
						visible: data.itemType !== TYPE_TITLE || (data.itemType === TYPE_TITLE && data.id !== null)
					}, {
						icon: getImageUrl("bg-model.svg"),
						primary: true,
						value: MENU_ITEM_TOGGLE_MODEL,
					}, {
						icon: getImageUrl("money-rmb.svg"),
						primary: true,
						value: MENU_ITEM_TOGGLE_MONEY,
					}
				]
			} else {
				return []
			}
		},
		menuButtons(data) {
			if (data.menuShow) {
				return [{
					icon: getImageUrl("left_white.svg"),
					primary: true,
					value: MENU_ITEM_TOGGLE
				}, {
					primary: true,
					value: MENU_ITEM_KUO,
					text: "扩",
					visible: [TYPE_TEXT].includes(data.itemType)
				}, {
					primary: true,
					value: MENU_ITEM_SUO,
					text: "缩",
					visible: [TYPE_TEXT].includes(data.itemType)
				}, {
					primary: true,
					value: MENU_ITEM_ZHAI,
					text: "摘",
					visible: [TYPE_TEXT].includes(data.itemType)
				}, {
					primary: true,
					value: MENU_ITEM_JIAN,
					text: "键",
					visible: [TYPE_TEXT].includes(data.itemType)
				}, {
					primary: true,
					value: MENU_ITEM_HUAN,
					text: "换",
					visible: [TYPE_TEXT].includes(data.itemType)
				}, {
					primary: true,
					value: MENU_ITEM_IMAGE,
					icon: getImageUrl("Image.svg"),
					visible: [TYPE_TEXT, TYPE_IMAGE].includes(data.itemType)
				}, {
					primary: true,
					value: MENU_ITEM_GALLERY,
					icon: getImageUrl("gallery_white.svg"),
					visible: [TYPE_IMAGE].includes(data.itemType)
				}, {
					icon: getImageUrl("save_white.svg"),
					primary: true,
					value: MENU_ITEM_SAVE_IMAGE,
					visible: [TYPE_IMAGE].includes(data.itemType)
				}, {
					icon: getImageUrl("header_white.svg"),
					primary: true,
					value: MENU_ITEM_HEADER,
					visible: [TYPE_TITLE, TYPE_HEADER].includes(data.itemType)
				}, {
					icon: data.itemShort === true ? getImageUrl("expand_white.svg") : getImageUrl("collapse_white.svg"),
					primary: true,
					value: MENU_ITEM_EC,
					visible: [TYPE_TEXT, TYPE_IMAGE].includes(data.itemType)
				}, {
					icon: getImageUrl("max_white.svg"),
					primary: true,
					value: MENU_ITEM_MAX,
					visible: data.itemType === TYPE_TEXT
				}, {
					icon: getImageUrl("paragraph_white.svg"),
					primary: true,
					value: MENU_ITEM_TEXT,
					visible: [TYPE_TITLE, TYPE_HEADER, TYPE_TEXT].includes(data.itemType)
				}]
			} else {
				return []
			}
		}
	},
	watch: {
		"logAutoDone,logged": function (logAutoDone, logged) {
			if (logAutoDone === true && logged === false) wx.navigateTo({
				url: `/pages/login/login?from=/pages/word/word`,
			})
		}
	},
	hideGallery() {
		this.setData({
			showGallery: false
		})
	},
	openSizeChanged(e) {
		this.setData({
			openSizeSelected: e.detail.value
		})
	},
	sdSizeChanged(e) {
		this.setData({
			sdSizeSelected: e.detail.value,
			pickSDSizeShow: false
		})
	},
	sdStyleChanged(e) {
		this.setData({
			sdStyleSelected: e.detail.value,
			pickSDStyleShow: false
		})
	},
	pickSDSize() {
		this.setData({
			pickSDSizeShow: true
		})
	},
	pickSDStyle() {
		this.setData({
			pickSDStyleShow: true
		})
	},
	showMenuSystem() {
		this.setData({
			menuShowSystem: true
		})
	},
	showMenu(e) {
		const itemIndex = e.currentTarget.dataset.index || this.data.itemIndex
		this.setData({
			menuShow: !this.data.menuShow,
			itemIndex
		})
	},
	maxTextEdit() {
		this.setData({
			itemContentEditShow: true,
			itemContentEditing: this.data.itemContent
		})
	},
	openWord(e) {
		const openId = e.currentTarget.dataset.id
		const find = _.find(this.data.words, word => word.id === openId)
		this.setData({
			filename: find['filename'],
			id: find['id'],
			items: find['items'],
			itemIndex: null,
			showOpenWordDialog: false
		})
	},
	gotEditContent(e) {
		if (e.detail.index === 1) this.updateContent(this.data.itemIndex, this.data.itemContentEditing)
		this.setData({
			itemContentEditShow: false
		})
	},
	gotFileName(e) {
		this.setData({
			showFileNameDialog: false
		})
		if (e.detail.index === 1) {
			const filename = getNormalizedName(this.data.filename)
			this.setData({
				filename
			})
			if (!filename) {
				wx.showToast({
					title: '输入的文件名无效',
				})
				return
			}
			this.saveWord(() => wx.showToast({
				title: '保存成功',
			}))
		}
	},
	saveWord(callback) {
		const filename = getNormalizedName(this.data.filename || _.get(this.data.items, [0, "content"])) || "ai_word"
		const office = toOfficeFile({
			items: this.data.items,
			filename,
			id: this.data.id
		})
		servicePost("/office/save", (officeId) => {
			this.getWords(() => {
				this.setData({
					id: officeId
				})
				callback && callback(officeId)
			})
		}, {
			office
		})
	},
	getWords(callback) {
		servicePost("/office/get_offices", (words) => {
			const convertedWords = _.reverse(_.sortBy(_.map(words, toWord), "create_time"))
			this.setData({
				words: convertedWords
			})
			callback && callback(convertedWords)
		}, {
			"office_type": "word"
		})
	},
	officeSave() {
		this.setData({
			showFileNameDialog: true
		})
	},
	deleteWord(e) {
		const office_id = e.currentTarget.dataset.id
		const filename = _.get(_.find(this.data.words, word => word["id"] === office_id), ["filename"])
		wx.showModal({
			title: '文件删除',
			content: `确定要删除这个文件吗:${filename}`,
			complete: (res) => {
				if (res.confirm) {
					servicePost("/office/delete", () => {
						wx.showToast({
							title: '删除成功'
						})
						this.reLoad()
					}, {
						office_id
					})
				}
			}
		})

	},
	deleteItem() {
		if (this.data.itemIndex === null) return
		const items = this.data.items
		items.splice(this.data.itemIndex, 1)
		this.setData({
			items
		})
	},
	replaceItem(newItem) {
		if (this.data.itemIndex === null) return
		const items = this.data.items
		items.splice(this.data.itemIndex, 1, newItem)
		this.setData({
			items
		})
	},
	insertItems(newItems) {
		if (this.data.itemIndex === null) return
		const items = this.data.items
		items.splice(this.data.itemIndex + 1, 0, ...newItems)
		this.setData({
			items
		})
	},
	updateContent(index, text) {
		const items = this.data.items
		_.set(items, [index, "content"], text)
		this.setData({
			items
		})
	},
	toggleShort() {
		const items = this.data.items
		const short = _.get(items, [this.data.itemIndex, "short"], false)
		_.set(items, [this.data.itemIndex, "short"], !short)
		this.setData({
			items
		})
	},
	showSample() {
		this.setData(SAMPLE_WORD)
	},
	newWord() {
		this.setData(NEW_WORD)
	},
	textChanged(e) {
		const index = e.currentTarget.dataset.index
		const text = e.detail.value
		const isTitle = index === 0
		if (isTitle) this.setData({
			filename: text
		})
		this.updateContent(index, text)
	},
	itemTap(e) {
		const index = e.currentTarget.dataset.index
		this.setData({
			itemIndex: index
		})
	},
	generate(e) {
		this.setData({
			generation_title: null
		})


		function post(url, data, callback) {
			wx.showLoading({
				title: 'AI思考中',
			})
			servicePost(url, (result) => {
				callback(result)
				wx.hideLoading()
			}, data)
		}
		if (e.detail.index === 1) {
			const prompt = this.data.generation_prompt
			text_is_censor(prompt).then(is => {
				if (is === true) wx.showToast({
					title: '输入敏感!'
				})
				else {
					switch (this.data.generation_to) {
						case TYPE_IMAGE:
							let modelArg = {
								...store.getGenerationBasic,
								question: this.data.generation_prompt
							}
							switch (this.data.currentImageModelIndex) {
								case 0:
									modelArg = Object.assign(modelArg, {
										size: _.get(OPENAI_SIZES, this.data.openSizeSelected) || IMAGE_MODEL_OPENAI_DEFAULT.size,
										model_name: IMAGE_MODEL_OPENAI_DEFAULT.model_name
									})
									break
								case 1:
									modelArg = Object.assign(modelArg, {
										size: this.data.sdSizeSelected || IMAGE_MODEL_SD_DEFAULT.size,
										model_name: IMAGE_MODEL_SD_DEFAULT.model_name,
										style: this.data.sdStyleSelected || IMAGE_MODEL_SD_DEFAULT.style
									})
									break
							}
							post("/image/generate", modelArg, (answer) => {
								this.insertItems([{
									type: TYPE_IMAGE,
									content: addBase64Prefix(_.first(answer['images'])),
								}])
							})
							break
						case TYPE_HEADER:
							if (this.data.manual === true) {
								if (isAnyEmpty(this.data.manual_content)) return
								const headers = _.reject(this.data.manual_content.split("\n"), isAnyEmpty)
								this.insertItems(_.map(headers, header => ({
									type: TYPE_HEADER,
									content: header,
									deep: this.data.sameLevelHeader === true ? this.data.itemDeep : this.data.itemDeep + 1
								})))
							} else {
								const data = {
									how: getGenerationPrompt(this.data.generation_prompt)
								}
								post("/ppt/generate_contents", data, (headers) => {
									const items = _.map(headers, header => ({
										type: TYPE_HEADER,
										content: _.trim(header, ".0123456789"),
										deep: this.data.itemDeep + 1
									}))
									this.insertItems(items)
								})
							}
							break
						case TYPE_TEXT:
							const textCallback = (answer) => {
								const content = answer['answer']
								const item = {
									type: TYPE_TEXT,
									content: content,
									short: content.length > 100,
									deep: null
								}
								const menuItem = this.data.generation_menu_item
								switch (menuItem) {
									case MENU_ITEM_KUO:
										return this.replaceItem(item)
									case MENU_ITEM_SUO:
										return this.replaceItem(item)
									case MENU_ITEM_ZHAI:
										wx.showModal({
											title: "摘要内容",
											content,
											success: () => wx.setClipboardData({
												data: content,
											})
										})
									case MENU_ITEM_JIAN:
										wx.showModal({
											title: "关键字",
											content,
											success: () => wx.setClipboardData({
												data: content,
											})
										})
									case MENU_ITEM_HUAN:
										return this.replaceItem(item)
									default:
										return this.insertItems([item])
								}
							}
							if (this.data.manual === true) {
								this.insertItems([{
									type: TYPE_TEXT,
									content: this.data.manual_content
								}])
							} else {
								const dataPost = getDialogChat(this.data.generation_prompt)
								post("/chat/get_answer", dataPost, textCallback)
							}

					}
				}
			})


		}

	},
	gotImageUrl(e) {
		this.setData({
			showImageUrlDialog: false
		})
		if (e.detail.index === 1) {
			if (_.isNil(this.data.remoteImageUrl)) return
			if (this.data.remoteImageUrl.startsWith("http") === false) {
				wx.showToast({
					title: '输入的地址无效',
				})
				return
			}
			getRemoteOnePicture(this.data.remoteImageUrl, base64 => {
				this.insertItems([{
					type: TYPE_IMAGE,
					content: addBase64Prefix(base64)
				}])
			}, () => wx.showToast({
				title: '获取图片发生错误',
			}))
		}
	},
	manualImageClicked(e) {
		this.setData({
			generation_title: null
		})
		switch (e.detail.index) {
			case 0:
				selectLocalOnePicture((base64) => {
					this.insertItems([{
						type: TYPE_IMAGE,
						content: addBase64Prefix(base64)
					}])
				})
				break;
			case 1:
				this.setData({
					showImageUrlDialog: true
				})
				break
		}
	},
	menuClicked(e) {
		const menuItem = e.detail.item.value
		this.menuProcess(menuItem)
	},
	menuProcess(menuItem) {
		if (MENU_ITEM_TEXT_CHANGES.includes(menuItem)) {
			this.setData({
				generation_menu_item: menuItem,
				generation_to: TYPE_TEXT,
				generation_title: MENU_ITEM_TEXT_CHANGE_MAP[menuItem],
				generation_prompt: toChangePrompt(menuItem, this.data.itemContent)
			})
			return
		}
		switch (menuItem) {
			case MENU_ITEM_EC:
				this.toggleShort()
				break
			case MENU_ITEM_MAX:
				this.maxTextEdit()
				break
			case MENU_ITEM_NEW:
				this.newWord()
				break
			case MENU_ITEM_DELETE:
				const isTitle = this.data.itemIndex === 0
				const content = isTitle ? "确定要删除这个文件吗?" : (this.data.itemType === TYPE_IMAGE ? '点击确定后将删除这张图片' : `点击确定后将删除如下内容：\n${this.data.itemContent.substr(0,15)}...`)
				wx.showModal({
					title: '确定删除',
					content,
					success: (res) => {
						if (res.confirm) {
							if (this.data.itemType === TYPE_TITLE) this.deleteWord()
							else this.deleteItem()
						}
					}
				})
				break
			case MENU_ITEM_SAMPLE:
				this.showSample()
				break
			case MENU_ITEM_GALLERY:
				this.setData({
					showGallery: true
				})
				break
			case MENU_ITEM_IMAGE:
				const reference = this.data.itemType === TYPE_IMAGE ? this.data.QUESTION_DRAWING_SAMPLE : this.data.itemContent
				this.setData({
					currentImageModelIndex: this.data.currentImageModelIndex === null ? 0 : this.data.currentImageModelIndex,
					generation_to: TYPE_IMAGE,
					generation_title: "生成图片",
					generation_prompt: toImage(reference)
				})
				break
			case MENU_ITEM_TEXT:
				this.setData({
					generation_to: TYPE_TEXT,
					generation_title: "生成内容",
					generation_prompt: toText(this.data.itemContent, 2048)
				})
				break
			case MENU_ITEM_HEADER:
				this.setData({
					generation_to: TYPE_HEADER,
					generation_title: "生成段落标题",
					generation_prompt: toHeaders(this.data.itemContent, 6, 20)
				})
				break
			case MENU_ITEM_OPEN:
				this.getWords(() => this.setData({
					showOpenWordDialog: true
				}))
				break
			case MENU_ITEM_DOWNLOAD:
				if (this.data.id == null) this.saveWord(this.executeDownload)
				else this.executeDownload(this.data.id)
				break
			case MENU_ITEM_TOGGLE_MONEY:
				this.setData({
					moneyShow: !this.data.moneyShow
				})
				break
			case MENU_ITEM_TOGGLE_MODEL:
				this.setData({
					modelShow: !this.data.modelShow
				})
				break
			case MENU_ITEM_SAVE:
				this.officeSave()
				break;
			case MENU_ITEM_SAVE_IMAGE:
				saveImage(this.data.itemContent)
				break;
			case MENU_ITEM_TOGGLE_SYSTEM:
				this.setData({
					menuShowSystem: !this.data.menuShowSystem
				})
				break;
			case MENU_ITEM_TOGGLE:
				this.setData({
					menuShow: !this.data.menuShow
				})
				break;
		}
	},
	closeOpenWordDialog() {
		this.setData({
			showOpenWordDialog: false
		})
	},
	executeDownload(wordId) {
		wx.showLoading({
			title: '开始下载...',
		})
		servicePost("/office/download", (it) => {
			wx.hideLoading()
			const filename = _.get(_.find(this.data.words, word => word.id === wordId) || this.data, ["filename"])
			const fileName = `${filename}_${new Date().getTime()}.docx`
			saveFile(fileName, it, ({
				path
			}) => {
				wx.openDocument({
					filePath: path,
					showMenu: true,
					fileType: "docx",
					success: () => wx.showToast({
						title: '文件已经打开'
					}),
					fail: (e) => {
						console.error("openDocument", e)
						wx.showToast({
							title: '文件打开失败',
						})
					}
				})
			})
		}, {
			"office_id": wordId
		}, "application/json", "arraybuffer")
	},
	/**
	 * 生命周期函数--监听页面加载
	 */
	showLastWord(words) {
		const last = _.last(words)
		if (last) {
			this.setData({
				id: last["id"],
				filename: last["filename"],
				items: last["items"]
			})
		} else this.showSample()
	},
	reLoad() {
		this.getWords((words) => this.showLastWord(words))
	},
	onLoad() {
		this.reLoad()
	},

	/**
	 * 生命周期函数--监听页面初次渲染完成
	 */
	onReady() {
		console.log("word onReady")
		this.waitAutoLogDone(() => {
			console.log("word waitAutoLogDone", this.data.logged)
			if (this.data.logged === false) wx.navigateTo({
				url: `/pages/login/login?from=/pages/word/word`
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