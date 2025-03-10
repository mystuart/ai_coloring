import '@/utils/lodash-fix';
import _ from "@/npm/lodash/index";

export function waitCondition(cond, action) {
	function loop() {
		if (cond()) {
			action()
			return
		}
		console.log("waitCondition...")
		setTimeout(loop, 100);
	}
	loop()
}

export function queueExecute(queue, action, separator, done) {
	const loop = () => {
		if (queue.length === 0) {
			done && done()
			return
		}
		const arg = _.first(queue.splice(0, 1))
		action(arg)
		setTimeout(loop, separator)
	}
	loop()
}