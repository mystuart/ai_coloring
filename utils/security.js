import { reject } from "lodash";
import { servicePost } from "./service";

export function text_is_censor(text){
	return new Promise((resolve,reject)=>{
		servicePost("/security/text_is_censor",(data)=>resolve(data),{
			texts:[text]
		},null,null,(e)=>reject(e))
	})
}