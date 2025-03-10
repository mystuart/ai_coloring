import '../../utils/lodash-fix';
import _ from "../../miniprogram_npm/lodash/index";
export function processPhone(phone) {
	if (_.isNil(phone)) return phone
	const rs = phone.replace(/\+86|\s+|-/ig, "")
	console.log("processPhone", rs)
	return rs
}
export const login_rules = [{
	name: "phone",
	rules: [{
		required: true,
		message: "请输入手机号"
	}, {
		validator: function (rule, value, param, models) {
			const isValid = (/^\d{11}$/g).test(processPhone(value))
			if (isValid === false) {
				return '手机号格式不正确'
			}
		}
	}]
}, {
	name: "password",
	rules: [{
		required: true,
		message: "请输入密码"
	}, {
		validator: function (rule, value, param, models) {
			if (!value || value.length < 6) {
				return '密码至少6位'
			}
		}
	}]
}]
let _register_rules = [{
	name: "password2",
	rules: [{
		required: true,
		message: "请输入确认密码"
	}, {
		validator: function (rule, value, param, models) {
			if (models['password'] !== models['password2']) {
				return '密码输入不一致'
			}
		}
	}]
}, {
	name: "code",
	rules: [{
		required: true,
		message: "请输入验证码"
	}, {
		validator: function (rule, value, param, models) {
			if (!value || value.length !== 4) {
				return '请输入4位验证码'
			}
		}
	}]
}]
export const register_rules = _.concat(login_rules, _register_rules)