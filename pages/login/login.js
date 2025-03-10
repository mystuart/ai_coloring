import '../../utils/lodash-fix';
import _ from "../../miniprogram_npm/lodash/index";
import {
	loginAA,
	registerAA
} from '@/utils/login';

import AIPage from '../../base/ai_page';
import {
	login_rules,
	processPhone,
	register_rules
} from './rules'
import {
	store
} from '@/store/index';
import {
	getWebUrl,
	servicePost
} from '@/utils/service';
AIPage({
	data: {
		agree: false,
		code_sent: false,
		is_register: false,
		error: "",
		formData: {
			phone: null,
			password: null
		},
		rules: login_rules,
	},
	computed: {
		phone(data) {
			return processPhone(data.formData["phone"] || "")
		}
	},
	watch: {
		"is_register": function (value) {
			if (value === true) this.setData({
				code_sent: false
			})
		}
	},
	toUserProtocol() {
		store.setMaxContent({
			name: "用户协议",
			text: getWebUrl("/user_protocol.html")
		})
	},
	toPrivacyProtocol() {
		store.setMaxContent({
			name: "用户协议",
			text: getWebUrl("/privacy_protocol.html")
		})
	},

	sendCode() {
		const phone = this.data.phone
		const isValid = (/^\d{11}$/g).test(phone)
		if (isValid === false) {
			this.setData({
				error: "输入的手机号码不正确"
			})
			return
		}
		servicePost("/user/send_code", () => {
			wx.showToast({
				title: '请查收验证码',
			})
			this.setData({
				code_sent: true
			})
		}, {
			phone
		})

	},
	loginRegisterChanged(e) {
		this.setData({
			rules: e.detail.value === true ? register_rules : login_rules
		})
	},
	formCheckChange(e) {
		console.log("formInputChange", e)
	},
	formInputChange(e) {
		const {
			field
		} = e.currentTarget.dataset
		this.setData({
			[`formData.${field}`]: e.detail.value
		})
	},
	gotUser() {
		const url = this.options["from"]
		if (url) wx.navigateTo({
			url
		})
		else wx.switchTab({
			url: '/pages/home/home',
		})
	},
	login() {
		loginAA(this.data.phone, this.data.formData.password, () => this.gotUser(), () => this.setData({
			error: '登录失败',
		}))
	},
	register() {
		const data = Object.assign({}, _.pick(this.data.formData, ["phone", "password", "code", "invite"]), {
			phone: this.data.phone
		})
		registerAA(data, () => this.gotUser(), () => this.setData({
			error: '注册失败',
		}))
	},
	submitForm() {
		this.selectComponent('#form').validate((valid, errors) => {
			if (!valid) {
				const firstError = Object.keys(errors)
				if (firstError.length) this.setData({
					error: errors[firstError[0]].message
				})
				return
			}
			if (this.data.agree !== true) {
				this.setData({
					error: '请阅读并同意《用户协议》《隐私政策》'
				})
				return
			}
			if (this.data.is_register) this.register()
			else this.login()
		})
	}
})