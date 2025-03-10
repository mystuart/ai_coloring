import '@/utils/lodash-fix';
import _ from "@/npm/lodash/index";
import {
	ROCY_AI_HOST
} from './constant';
import {
	base_url,
	servicePost
} from './service';
import {
	isAnyEmpty
} from './util';
import {
	getImageExtName
} from './file';

export const EXTENSIONS = ["docx", "xlsx", "pdf", "txt", "csv", "md"]
const fs = wx.getFileSystemManager();

export const isPng = (path) => path.toLowerCase().endsWith(".png")

export async function convertPng2JPG(imagePath, imageInfo) {
	const {
		width,
		height
	} = imageInfo
	const canvas = wx.createOffscreenCanvas({
		type: '2d',
		width,
		height
	})
	const context = canvas.getContext('2d')
	const image = canvas.createImage()
	await new Promise(resolve => {
		image.onload = resolve
		image.src = imagePath
	})
	context.clearRect(0, 0, width, height)
	context.drawImage(image, 0, 0, width, height)
	return new Promise(resolve => {
		wx.canvasToTempFilePath({
			width,
			height,
			destWidth: width,
			destHeight: height,
			canvas,
			fileType: 'jpg',
			quality: 1,
			success(res) {
				resolve(res.tempFilePath)
			},
			fail() {
				resolve('')
			}
		})
		const imagePath = `${wx.env.USER_DATA_PATH}/temp-${Date.now()}.jpg`
		wx.getFileSystemManager().writeFile({
			filePath: imagePath,
			data: canvas.toDataURL('image/jpeg').replace(/^data:image\/\w+;base64,/, ''),
			encoding: 'base64',
			success() {
				resolve(imagePath)
			},
			fail() {
				resolve('')
			},
		})
	})
}

export function setImage(tempFile) {
	tempFile["size"] = (tempFile["size"] / 1024).toFixed(0)
	if (tempFile["size"] == 0) tempFile["size"] = 1
	tempFile["size"] = `${tempFile["size"]}K`
	const ext = _.lowerCase(_.last(_.split(tempFile["path"], ".")))
	if (EXTENSIONS.includes(ext)) tempFile["icon"] = `https://rocy-ai.wang/mp_images/${ext}.svg`
	return tempFile
}
export const getRemoteOnePicturePromise = (url) => new Promise((resolve, reject) => getRemoteOnePicture(url, (base64) => resolve(base64), e => reject(e)))
export function getRemoteOnePicture(url, callback, error) {
	servicePost("/word/get_remote_image_base64", (base64) => {
		if (_.isNil(base64)) error()
		else callback(base64)
	}, {
		image_url: url
	}, null, null, error)
}
export const selectLocalMultiPicturesPromise = () => new Promise((resolve) => {
	wx.chooseImage({
		sizeType: ['original'],
		sourceType: ['album', 'camera'],
		success: (res) => resolve(res.tempFiles)
	})
})
export function selectLocalMultiPicturesBase64(callback) {
	wx.chooseImage({
		sizeType: ['original'],
		sourceType: ['album', 'camera'],
		success: function (res) {
			var tempFiles = res.tempFiles;
			if (tempFiles.length > 0) {
				const base64Arr = []
				let count = 0
				_.forEach(tempFiles, ({
					path,
					size
				}, index) => getBase64(path, (base64) => {
					_.set(base64Arr, [index], base64)
					count += 1
					if (count === tempFiles.length) callback(tempFiles, base64Arr)
				}))
			}
		}
	})
}
export function selectLocalOnePicture(callback) {
	wx.chooseImage({
		count: 1,
		sizeType: ['original'],
		sourceType: ['album', 'camera'],
		success: function (res) {
			var tempFilePaths = res.tempFilePaths;
			if (tempFilePaths.length > 0) getBase64(tempFilePaths[0], callback)
		}
	})
}
export function getImageUrl(image) {
	return `${ROCY_AI_HOST}/mp_images/${image}`
}
export function downloadAndSaveVideo(url, name, callback, error) {
	const filePath = wx.env.USER_DATA_PATH + `/${name || "aa-mp.mp4"}`
	wx.downloadFile({
		url,
		filePath,
		success(res) {
			if (res.statusCode === 200) wx.saveVideoToPhotosAlbum({
				filePath,
				success: () => {
					callback && callback()
					wx.showToast({
						title: '保存成功',
					})
				},
				fail: () => error && error()

			})
		},
		fail: () => error && error()
	})
}
export function downloadAndSaveImage(url, name, callback) {
	const filePath = wx.env.USER_DATA_PATH + `/${name || "aa-mp.png"}`
	wx.downloadFile({
		url,
		filePath,
		success(res) {
			if (res.statusCode === 200) wx.saveImageToPhotosAlbum({
				filePath,
				success: () => {
					callback && callback()
					wx.showToast({
						title: '保存成功',
					})
				}
			})
		}
	})
}

export function saveImage(src, callback) {
	if (src.startsWith("http://tmp")) wx.saveImageToPhotosAlbum({
		filePath: src,
		success: () => {
			wx.showToast({
				title: '保存成功',
			})
			callback && callback()
		}
	})
	else if (src.startsWith("http")) downloadAndSaveImage(src, null, callback)
	else saveBase64Image(src, null, callback)
}
export const getBase64Promise = (imagePath) => new Promise((resolve, reject) => {
	function run(imagePathLocal) {
		fs.readFile({
			filePath: imagePathLocal,
			encoding: 'base64',
			success: (res) => resolve(res.data),
			fail: (err) => reject(null)
		});
	}
	if (isAnyEmpty(imagePath)) resolve(null)
	else if (imagePath.startsWith("http")) wx.downloadFile({
		url: imagePath,
		success(res) {
			if (res.statusCode === 200) run(res.tempFilePath)
		}
	})
	else run(imagePath)
})
export function getBase64(imagePath, callback) {
	function run(imagePathLocal) {
		fs.readFile({
			filePath: imagePathLocal,
			encoding: 'base64',
			success: function (res) {
				callback(res.data)
			},
			fail: function (err) {
				console.log("getBase64", err);
			}
		});
	}
	if (imagePath.startsWith("http")) wx.downloadFile({
		url: imagePath,
		success(res) {
			if (res.statusCode === 200) run(res.tempFilePath)
		}
	})
	else run(imagePath)

}
const BASE64_REGEX = /data:image\/(\w+);base64,/ig
export function isNotBase64Code(str) {
	return !isBase64Code(str)
}
export function isBase64Code(str) {
	try {
		atob(str)
		return /=+$/.test(str)
	} catch (e) {
		return false;
	}
}
export function getBase64Prefix(ext) {
	return `data:image/${ext||'png'};base64,`
}
export function matchBase64(v) {
	return BASE64_REGEX.test(v) ? RegExp.$1 : null
}
export function md5ToUrl(md5) {
	return `${base_url}/image/show?md5=${md5}`
}
export function addBase64Prefix(base64, ext) {
	if (isAnyEmpty(base64)) return null
	if (matchBase64(base64)) return base64
	if (isNotBase64Code(base64)) return base64
	return `${getBase64Prefix(ext)}${base64}`
}
export function removeBase64Prefix(base64) {
	if (matchBase64(base64)) return base64.replace(BASE64_REGEX, "")
	return base64
}

export function saveBase64Image(base64ImgUrl, name, callback) {
	const ext = getImageExtName(base64ImgUrl) || "png"
	const tmpPath = wx.env.USER_DATA_PATH + `/${name||`aa-mp.${ext}`}`
	wx.getFileSystemManager().writeFile({
		filePath: tmpPath,
		data: removeBase64Prefix(base64ImgUrl),
		encoding: 'base64',
		success: () => {
			wx.saveImageToPhotosAlbum({
				filePath: tmpPath,
				success: function () {
					callback && callback()
					wx.showToast({
						title: '保存成功',
					})
				},
				fail: function (e) {
					console.error(e)
					wx.showToast({
						title: '保存失败',
					})
				}
			})
		},
		fail: e => {
			console.error(e)
			wx.showToast({
				title: '保存失败',
			})
		}
	})
}

export const sample_base64 = "data:image/png;base64,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"