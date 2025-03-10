import '@/utils/lodash-fix';
import _ from "@/npm/lodash/index";
export const isAnyEmpty = (v) => _.isEmpty(v) || _.isNil(v) || v === ""
export const isNotAnyEmpty = (v) => isAnyEmpty(v) === false