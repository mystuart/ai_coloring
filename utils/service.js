export const base_url = "https://rocy-ai.wang:18000"
export const BASE_URL_WEB = "https://rocy-ai.wang"
import '@/utils/lodash-fix';
import _ from "@/npm/lodash/index";
const SERVICE_URLS = [
	"/pay/generate_prepay_mp",
	"/background/change",
	"/user/send_code",
	"/user/delete_me",
	"/model/delete_file",
	"/model/delete_models",
	"/office/save",
	"/office/get_offices",
	"/office/delete",
	"/image/generate",
	"/ppt/generate_contents"
]
import {
	getAuthorization
} from './storage'
export const getWebUrl = function (url) {
	return `${BASE_URL_WEB}${url}`
}
export const getUrl = function (url) {
	return `${base_url}${url}`
}
export const servicePostMock = (result, url, success, data, contentType, responseType, error) => {
	success(result)
}
export const servicePostPromise = (url, data, contentType, responseType) => new Promise((resolve, reject) => {
	servicePost(url, (result) => resolve(result), data, contentType, responseType, () => reject())
})
export const servicePost = (url, success, data, contentType, responseType, error) => {
	wx.request({
		url: `${base_url}${url}`,
		header: {
			"Content-Type": contentType || "application/json",
			"AUTHORIZATION": getAuthorization()
		},
		"data": data || {},
		method: "POST",
		responseType: responseType || "text",
		success: function (rs) {
			if (rs.statusCode === 200) success(rs.data)
			else {
				error && error(rs)
				switch (rs.statusCode) {
					case 401:
						wx.showModal({
							title: '请登录',
							content: '当前操作需要登录,要登录吗?',
							complete: (res) => {
								if (res.confirm) {
									wx.navigateTo({
										url: '/pages/login/login',
									})
								}
							}
						})
						break
					case 402:
						wx.showToast({
							title: '余额不足了',
						})
						break
					case 422:
						console.error("参数错误", rs, data)
						break
				}
			}
		},
		fail: function (e) {
			error && error(e)
			console.error("error", e, base_url, url)
		}
	})
}