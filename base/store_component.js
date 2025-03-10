import { ComponentWithStore } from 'mobx-miniprogram-bindings'
import { aiMixin } from './behaviors/aiMixin'

const computedBehavior = require('miniprogram-computed').behavior
import {storeBinding} from "./store_binding"
export const StoreComponent = function (options) {
	const add = {
		behaviors: [computedBehavior,aiMixin],
		storeBindings: storeBinding,
	}
	return ComponentWithStore(Object.assign({}, options, add))
}