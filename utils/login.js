import {
	TOKEN_KEY
} from '@/utils/constant'
import {
	servicePost
} from '@/utils/service'
import {
	setToken,
	getToken,
	hasNoToken,
	getImageModel
} from './storage'
import {
	store
} from "../store/index.js"
import '@/utils/lodash-fix';
import _ from "@/npm/lodash/index";
import {
	isAnyEmpty
} from "./util"
import {
	PRICE_TIMES,
	INPUT_1K_TOKENS_RMB,
	OUTPUT_1K_TOKENS_RMB,
	MAX_TOKENS,
	GPT_4,
	GPT_3DOT5_TURBO,
	GPT_3DOT5_TURBO_16K,
	IMAGE_SMALL,
	IMAGE_MIDDLE,
	IMAGE_BIG
} from "@/utils/constant"
const FormData = require('@/utils/formData.js')
const loadCommon = () => {
	servicePost("/robot_web/get_configs", configs => store.setConfigs(configs))
	servicePost("/admin/get_setting", setting => store.setSetting(setting))
	servicePost("/price/get_model_price", price => {
		const priceTimes = price[PRICE_TIMES]

		function pt(v) {
			return v * priceTimes
		}

		function p(o) {
			o[INPUT_1K_TOKENS_RMB] = pt(o[INPUT_1K_TOKENS_RMB])
			o[OUTPUT_1K_TOKENS_RMB] = pt(o[OUTPUT_1K_TOKENS_RMB])
			return o
		}
		price[GPT_3DOT5_TURBO] = p(price[GPT_3DOT5_TURBO])
		price[GPT_3DOT5_TURBO_16K] = p(price[GPT_3DOT5_TURBO_16K])
		price[GPT_4] = p(price[GPT_4])
		price[IMAGE_SMALL] = pt(price[IMAGE_SMALL])
		price[IMAGE_MIDDLE] = pt(price[IMAGE_MIDDLE])
		price[IMAGE_BIG] = pt(price[IMAGE_BIG])
		store.setModelPrice(price)
	})
}
const loadStorage = () => {
	store.setImageModel(getImageModel())
}
const loginSuccessed = (user) => {
	store.setUser(user)
	loadCommon()
	loadStorage()
}
export const logout = () => store.logoutUser()
export const refreshUser = () => servicePost("/user/me", (user) => {
	store.setUser(user)
})
export const getUserByToken = (callback) => servicePost("/user/me", (user) => {
	loginSuccessed(user)
	callback && callback()
})
export const autoLogin = () => {
	const token = getToken(TOKEN_KEY)
	if (isAnyEmpty(token)) wx.login({
		success: ({
			code
		}) => servicePost("/miniprogram/code2user", loginSuccessed, {
			code
		})
	})
	else {
		servicePost("/user/token_within_period", (it) => {
			if (it == true) getUserByToken()
			else setToken(null)
		}, {
			"token": token
		})
	}
}
export const registerAA = (data, callback, error) => {
	wx.login({
		success: (res) => {
			data["code_for_openid"] = res['code']
			servicePost("/user/register", (accessToken) => {
				setToken(accessToken[TOKEN_KEY])
				getUserByToken(callback)
				loadCommon()
			}, data, null, null, error)
		}
	})
}
export const loginAA = (phone, password, callback, error) => {
	const data = new FormData()
	data.append("username", phone)
	data.append("password", password)
	wx.login({
		success: (res) => {
			data.append("code", res['code'])
			const submitData = data.getData()
			servicePost("/user/login_password", (accessToken) => {
				setToken(accessToken[TOKEN_KEY])
				getUserByToken(callback)
				loadCommon()
			}, submitData.buffer, submitData.contentType, null, error)
		}
	})
}