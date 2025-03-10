const getFileSize = (filePath) => new Promise((resolve, reject) => wx.getFileSystemManager().getFileInfo({
	filePath,
	success: ({
		size
	}) => resolve(size),
	fail: (err) => reject(err)
}))

const getImageSize = (src) => new Promise((resolve) => wx.getImageInfo({
	src,
	success: ({
		width,
		height
	}) => resolve({
		width,
		height
	})
}))
const MAX_SIZE = 512 * 1024
export async function canvasToImage({
	path,
	size
}, canvas, limit) {
	limit = limit || MAX_SIZE
	const ratio = 0.618
	const {
		width: imgWidth,
		height: imgHeight
	} = await getImageSize(path)
	const errorResult = {
		path,
		size,
		compressed: false
	}
	return new Promise((resolve, reject) => {
		canvas.width = imgWidth;
		canvas.height = imgHeight;
		let pic = canvas.createImage();
		pic.onload = function () {
			let ctx = canvas.getContext('2d');
			ctx.clearRect(0, 0, imgWidth, imgHeight);
			ctx.drawImage(pic, 0, 0, imgWidth, imgHeight);
			wx.canvasToTempFilePath({
				canvas,
				width: imgWidth,
				height: imgHeight,
				destHeight: imgHeight * ratio,
				destWidth: imgWidth * ratio,
				fileType: 'jpg',
				success: async (res) => {
					const pathNew = res.tempFilePath
					const sizeNew = await getFileSize(pathNew)
					const successResult = {
						path: pathNew,
						size: sizeNew,
						compressed: true
					}
					if (sizeNew <= limit) resolve(successResult)
					else resolve(await canvasToImage(successResult, canvas, limit))
				},
				fail: (err) => reject(errorResult)
			});
		}
		pic.src = path;
		pic.onerror = function (err) {
			console.error("canvasToImage", error)
			reject(errorResult)
		}
	});
}