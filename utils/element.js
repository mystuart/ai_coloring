export function getCanvas(id, cmp) {
	return new Promise((resolve) => {
		let query = wx.createSelectorQuery();
		query.in(cmp);
		query.select(`#${id}`).fields({
			node: true,
			size: true
		}).exec((res) => {
			if (res[0]) resolve(res[0].node);
			else resolve(null);
		})
	});
}

export const query = (cmp, id, fn) => {
	let q = wx.createSelectorQuery()
	if (cmp) q = q.in(cmp)
	q.select(id).boundingClientRect().exec(fn)
}

export const single = (cmp, id, fn) => query(cmp, id, (rs) => fn(rs[0]))

export const scrollToView = function (elementId) {
	var query = wx.createSelectorQuery();
	query.select(`#${elementId}`).boundingClientRect(function (rect) {
		wx.pageScrollTo({
			scrollTop: rect.top + 10,
			duration: 300
		});
	}).exec();
}