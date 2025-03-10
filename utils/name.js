export const getNormalizedName = (name) => {
	if (!name) return name
	return name.replace(/[^0-9a-zA-Z\u4e00-\u9fa5]/g, "")
}