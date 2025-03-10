import {
	StoreComponent
} from "../../base/store_component"
import '@/utils/lodash-fix';
import {
	PayMethod,
	PRICE_FACE_SWAP_RMB,
	PRICE_FACE_SWAP_VIDEO_RMB,
	PRICE_OCR
} from "../../utils/constant"
import _ from "@/npm/lodash/index";
import {
	Prices
} from '../../model/price'
import {
	getWebUrl,
	servicePost
} from "../../utils/service"
import {
	getUserByToken
} from "@/utils/login"
import {
	PRICE_BACKGROUND_CHANGE_RMB,
	PRICE_SD_RMB
} from "@/utils/constant"
import {
	store
} from "@/store/index";
StoreComponent({
	properties: {
		price: {
			type: String
		},
		show_model_price: {
			type: Boolean,
			value: false
		}
	},
	data: {
		showVip: false,
		showModelPriceDialog: false,
		isMonth: true,
		showCharge: false,
		currentChargeIndex: 0,
		monthButtons: [{
				type: 'default',
				text: '取消',
				value: 0
			},
			{
				type: 'primary',
				text: '充值',
				value: 1
			}
		]
	},
	computed: {
		showVipDialog(data) {
			return data.is_month_user && (data.balances.length > 0) && data.showVip
		},
		balances() {
			return _.get(store.user, ["month_balances"], [])
		},
		is_month_user() {
			return _.get(store.user, ["is_month"], false)
		},
		buttons(data) {
			return [{
				primary: true,
				text: "大模型",
				value: "大模型",
				visible: data.show_model_price === true
			}, {
				text: `价格:${data.price_text}`,
				value: "价格",
				visible: data.price_text !== null
			}, {
				text: `余额:${data.account}`,
				value: "余额",
				visible: data.account !== null
			}, {
				primary: true,
				text: "充值",
				value: "充值"
			}, {
				primary: true,
				value: "包月",
				icon: getWebUrl("/mp_images/vip.png"),
				visible: data.is_month_user,
			}, ]
		},
		price_text(data) {
			switch (data.price) {
				case Prices.BACKGROUND_CHANGE:
					return data[PRICE_BACKGROUND_CHANGE_RMB]
				case Prices.IMAGE_SD_XL:
					return _.get(data.setting, [PRICE_SD_RMB], null)
				case Prices.OCR:
					return _.get(data.setting, [PRICE_OCR], null)
				case Prices.FACE_SWAP:
					return _.get(data.setting, [PRICE_FACE_SWAP_RMB], null)
				case Prices.FACE_SWAP_VIDEO:
					return _.get(data.setting, [PRICE_FACE_SWAP_VIDEO_RMB], null)
				default:
					return null
			}
		}
	},
	methods: {
		buttonsTap(e) {
			switch (e.detail.item.value) {
				case "大模型":
					this.showModelPrice()
					break
				case "充值":
					this.charge()
					break
				case "包月":
					this.setData({
						showVip: !this.data.showVip
					})
					break
				default:
					break
			}
		},
		closeModelPriceDialog() {
			this.setData({
				showModelPriceDialog: false
			})
		},
		showModelPrice() {
			this.setData({
				showModelPriceDialog: true
			})
		},
		chargeItemChanged(event) {
			this.setData({
				currentChargeIndex: event.detail.current
			})
		},
		charge() {
			this.setData({
				showCharge: !this.data.showCharge
			})
		},
		closeVip() {
			this.setData({
				showVip: false
			})
		},
		chargeOK(e) {
			if (e.detail.index == 0) {
				this.setData({
					showCharge: false
				})
				return
			}
			const charge_value = this.data.isMonth ? this.data.MONTH_ITEMS[this.data.currentChargeIndex].money : this.data.giver_items[this.data.currentChargeIndex].charge
			let that = this
			servicePost("/pay/generate_prepay_mp", (appPrepay) => {
				wx.requestPayment({
					timeStamp: String(appPrepay.timeStamp),
					nonceStr: appPrepay.nonceStr,
					package: appPrepay.package,
					signType: appPrepay.signType,
					paySign: appPrepay.paySign,
					success(res) {
						wx.showToast({
							title: '充值成功',
						})
						getUserByToken()
						that.setData({
							showCharge: false
						})
					},
					fail(res) {
						wx.showToast({
							title: '充值失败了',
						})
						that.setData({
							showCharge: false
						})
					}
				})
			}, {
				charge_value: charge_value,
				pay_type: PayMethod.wechat,
				pay_phone: this.data.phone,
				month_index: this.data.isMonth ? this.data.currentChargeIndex : null,
				openid: this.data.openid
			})
		}
	}
})