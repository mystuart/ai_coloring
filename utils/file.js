import '@/utils/lodash-fix';
import _ from "@/npm/lodash/index";
export const saveFile = function (name, data, callback) {
	const encoding = _.isString(data) ? 'utf8' : "binary"
	const filePath = `${wx.env.USER_DATA_PATH}/${name}`
	wx.getFileSystemManager().writeFile({
		filePath,
		data,
		encoding,
		success(res) {
			wx.getFileSystemManager().getFileInfo({
				filePath: filePath,
				success: (rs) => callback({
					path: filePath,
					size: rs.size,
					name: getFileName(filePath)
				})
			})
		},
		fail(res) {}
	})
}
export const getExtName = function (path) {
	const fileName = getFileName(path)
	const splits = _.split(fileName, ".")
	return _.last(splits).toLowerCase()
}
const IMAGE_EXTENSTIONS = ["png", "jpg", "jpeg", "bmp", "svg"]
export const getImageExtName = function (path) {
	const ext = getExtName(path)
	return IMAGE_EXTENSTIONS.includes(ext) ? ext : null
}
export const getFileName = function (path) {
	return _.last(_.split(path, "/"))
}