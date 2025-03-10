import '@/utils/lodash-fix';
import _ from "@/npm/lodash/index";
import {
	addBase64Prefix,
	convertPng2JPG,
	getBase64,
	isPng,
	sample_base64,
	selectLocalMultiPicturesBase64
} from '@/utils/image';
import {
	isAnyEmpty
} from '@/utils/util';
import {
	_compressImage
} from './compressImage';
const MAX_SIZE = 100 * 1024
export const convertPngPromise = async (files, limit) => {
	limit = limit || MAX_SIZE
	_.map(files, ({
		path,
		size
	}) => {
		if (isPng(path) && size > limit) {
			
		}
	})
}
async function convertPng(files, update, complete) {
	const size = files.length
	let count = 0
	let hasError = false
	const cnt = () => {
		count += 1
		if (count === size) complete(hasError)
	}
	_.forEach(files, ({
		path,
		size
	}, index) => {
		if (isPng(path) && size > MAX_SIZE) {
			wx.getImageInfo({
				src: path,
				success: async (imageInfo) => {
					const jpgPath = await convertPng2JPG(path, imageInfo)
					if (isAnyEmpty(jpgPath)) {
						hasError = true
						cnt()
					} else
						wx.getFileSystemManager().getFileInfo({
							filePath: jpgPath,
							success: ({
								size
							}) => update(index, {
								path: jpgPath,
								size
							}, () => cnt())
						})
				}
			})
		} else cnt()
	})
}

function wx_compressImage({
	canvas,
	size,
	path,
	quality,
	fail,
	success
}) {
	_compressImage({
		path,
		size
	}, canvas, )
}
export function compress(files, update, complete) {
	let hasError = false
	const step = (prev_size, src, ok) => {
		wx.compressImage({
			src,
			quality: 80,
			fail: (e) => {
				console.error("compressImage error", e)
				hasError = true
			},
			success: ({
				tempFilePath
			}) => {
				wx.getFileSystemManager().getFileInfo({
					filePath: tempFilePath,
					success: ({
						size
					}) => {
						if (size >= prev_size) {
							hasError = true
						} else if (size > MAX_SIZE) step(size, tempFilePath, ok)
						else ok({
							path: tempFilePath,
							size
						})
					}
				})
			}
		})
	}

	const size = files.length
	let count = 0
	const cnt = () => {
		count += 1
		console.log("zzz", count)
		if (count === size) complete(hasError)
	}
	const oneFile = ({
		path,
		size
	}, index) => {
		if (size > MAX_SIZE) step(size, path, file => update(index, file, () => cnt()))
		else cnt()
	}
	_.forEach(files, (file, index) => oneFile(file, index))
}

export async function convertAndCompress(data, complete) {
	const update = (index, file, callback) => {
		data.files[index] = file
		const {
			path
		} = file
		getBase64(path, (base64) => {
			data.images[index] = base64
			callback()
		})
	}
	await convertPng(data.files, update, (hasError) => {
		console.log("convert complete", data, hasError)
		compress(data.files, update, (hasError) => {
			console.log("convertAndCompress", hasError)
			// complete()
		})
	})
}