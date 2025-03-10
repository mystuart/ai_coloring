import { BehaviorWithStore } from 'mobx-miniprogram-bindings'

import {
	store
} from "../store/index"
export const storeBinding = {
	store,
	fields: {
		logAutoDone: () => store.logAutoDone,
		selectedPrivateModelId: () => store.selectedPrivateModelId,
		selectedPublicModel: () => store.selectedPublicModel,
		selectedPublicModelImage: () => store.selectedPublicModelImage,
		models: () => store.models,
		user: () => store.user,
		setting: () => store.setting,
		configs: () => store.configs,
		logged: () => store.logged,
		account: () => store.account,
		is_month: () => store.is_month,
		openid: () => store.openid,
		phone: () => store.phone,
		MONTH_ITEMS: () => store.MONTH_ITEMS,
		giver_items: () => store.giver_items,
		GIVE_PERCENT_STEP: () => store.GIVE_PERCENT_STEP,
		GIVE_PERCENT_STEP: () => store.GIVE_PERCENT_STEP,
		modelPriceList: () => store.modelPriceList,
		PRICE_BACKGROUND_CHANGE_RMB: () => store.PRICE_BACKGROUND_CHANGE_RMB
	}
}
export const storeBehavior = BehaviorWithStore({
	storeBindings: storeBinding
})