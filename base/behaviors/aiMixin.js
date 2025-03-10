import '@/utils/lodash-fix';
import _ from "@/npm/lodash/index";
import {
	servicePostPromise
} from "@/utils/service"

export const aiMixin = Behavior({
	data: {
		executing: false
	},
	methods: {
		beginExecuting(loading) {
			this.setData({
				executing: true
			})
			if (loading) wx.showLoading({
				title: 'AI思考中...',
			})
		},
		doneExecuting(loading) {
			this.setData({
				executing: false
			})
			if (loading) wx.hideLoading()
		},
		baseServicePostPromiseList(url, dataList, contentType, responseType, loading) {
			try {
				this.beginExecuting(loading)
				return Promise.all(_.map(dataList, async data => await servicePostPromise(url, data, contentType, responseType)))
			} catch (error) {
				console.error("baseServicePostPromiseList", error)
				this.doneExecuting(loading)
				return Promise.reject()
			} finally {
				this.doneExecuting(loading)
			}
		},
		async baseServicePostList(url, dataList, contentType, responseType) {
			try {
				this.beginExecuting()
				return await Promise.all(_.map(dataList, async data => await servicePostPromise(url, data, contentType, responseType)))
			} catch (error) {
				this.doneExecuting()
				return await Promise.reject()
			} finally {
				this.doneExecuting()
			}
		},
		async baseServicePost(url, data, contentType, responseType) {
			try {
				this.beginExecuting()
				return await servicePostPromise(url, data, contentType, responseType)
			} catch (error) {
				this.doneExecuting()
				return await Promise.reject()
			} finally {
				this.doneExecuting()
			}
		},
	}
})