import {
	store
} from '../store/index'
import {
	BEARER,
	TOKEN_KEY,
	IMAGE_MODEL_KEY
} from './constant'
import {
	isAnyEmpty
} from './util'
export const getToken = () => wx.getStorageSync(TOKEN_KEY)
export const hasToken = () => isAnyEmpty(getToken()) === false
export const hasNoToken = () => isAnyEmpty(getToken()) === true
export const setToken = (token) => {
	if (token === null) wx.removeStorageSync(TOKEN_KEY)
	else wx.setStorageSync(TOKEN_KEY, token)
}
export const getAuthorization = () => getToken() == null ? null : `${BEARER} ${getToken()}`

export const setImageModel = (data) => {
	store.setImageModel(data)
	wx.setStorageSync(IMAGE_MODEL_KEY, data)
}
export const getImageModel = () => wx.getStorageSync(IMAGE_MODEL_KEY)