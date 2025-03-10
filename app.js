import '@/utils/lodash-fix';
import _ from "@/npm/lodash/index";
// 京ICP备2022034770号-6X 小程序备案号
/**
 * 相对于上一次的更新
 * 1、增加小程序分享
 * 2、修复密码不能输入字母的问题
 * 3、增加AI文生图模块
 */
import {
	autoLogin
} from 'utils/login'
App({
	onLaunch() {
		autoLogin()
	},
	globalData: {
		theme: "light"
	}
})