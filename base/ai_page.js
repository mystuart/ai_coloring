import themeMixin from './behaviors/theme'
import '@/utils/lodash-fix';
import _ from "@/npm/lodash/index";
import {
	storeBehavior
} from "./store_binding"
import {
	waitCondition
} from '@/utils/time';
import {
	aiMixin
} from './behaviors/aiMixin';
import { assistants } from '@/pages/home/assistants';
const computedBehavior = require('miniprogram-computed').behavior

const AIPage = function (options) {
	const prefix = _.get(options, ["data", "title"]) || _.join(_.map(assistants, a => a[0]), ",")
	const suffix = prefix.length < 20 ? ">AI馨办公小助手" : ""
	const dataShare = {
		title: `${prefix}${suffix}`
	}
	const logo = _.get(options, ["data", "logo"])
	if (logo) _.set(dataShare, ["imageUrl"], logo)
	const add = {
		behaviors: [themeMixin, storeBehavior, computedBehavior, aiMixin].concat(options.behaviors || []),
		options: {
			pureDataPattern: /^_/
		},
		data: _.merge({}, options["data"] || {}, {
			executing: false
		}),

		onShareAppMessage() {
			return options.onShareAppMessage ? options.onShareAppMessage() : dataShare
		},
		onShareTimeline() {
			return options.onShareTimeline ? options.onShareTimeline() : dataShare
		},
		waitAutoLogDone(action) {
			waitCondition(() => this.data.logAutoDone, action)
		},
		checkMoney(spend, action) {
			if (this.data.account - (spend || 0) < 0) {
				wx.showToast({
					title: '余额不足了',
				})
				return
			}
			action && action()
		},
		onLoad(query) {
			const app = getApp()
			this.themeChanged(app.globalData.theme)
			app.watchThemeChange && app.watchThemeChange(this.themeChanged)
			options.onLoad && options.onLoad.call(this, query)
		},
		onUnload() {
			const app = getApp()
			app.unWatchThemeChange && app.unWatchThemeChange(this.themeChanged)
			options.onUnload && options.onUnload.call(this)
		}
	}
	return Page(
		Object.assign({}, options, add)
	)
}
export default AIPage