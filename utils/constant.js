export const BASE_URL_WEB = "https://rocy-ai.wang"
export const getWebUrl = function (url) {
	return `${BASE_URL_WEB}${url}`
}

export const SERVICE_URL_IMAGE_GENERATE = "/image/generate"
export const SERVICE_URL_CHAT_ANSWER = "/chat/get_answer"
export const SERVICE_URL_VIDEO_GET = "/video/get_video_mp"
export const SERVICE_URL_VIDEO_SAVE = "/video/save_video"
export const SERVICE_URL_VIDEO_RECORDS_GET = "/video/get_records"
export const SERVICE_URL_VIDEO_RECORD_DELETE = "/video/delete_record"
export const TYPE_TITLE = "title"
export const TYPE_HEADER = "header"
export const TYPE_TEXT = "text"
export const TYPE_IMAGE = "image"
export const ROCY_AI_HOST = "https://rocy-ai.wang"
export const MY_TEXTS = {
	"用户协议": ["用户协议\n\n",

		"欢迎您使用我们的AI大模型问答机器人移动版平台APP产品！在使用之前，请仔细阅读以下用户协议。当您点击“同意”或使用我们的服务时，即表示您已经阅读、理解并同意遵守本协议的全部条款和条件。\n",

		"一、接受条款\n",

		"1.1 本协议是您与我们之间关于使用AI大模型问答机器人移动版平台APP产品的法律协议。在使用本产品前，您应当仔细阅读本协议的全部内容。\n",

		"1.2 如果您不同意本协议的任何内容，请您立即停止使用本产品。\n",

		"1.3 我们保留随时修改本协议的权利，修改后的协议内容将在产品上公布并立即生效。您可以随时查阅最新的协议版本。\n\n",

		"二、服务内容\n",

		"2.1 AI大模型问答机器人移动版平台APP产品是基于Chat GPT的智能助理机器人，可以智能回答问题及绘画。此外，我们还提供与社交产品的集成功能，比如微信、企业微信等。\n",

		"2.2 我们将尽力保证服务的稳定性和安全性，但不对服务的及时性、准确性、完整性、可靠性做出任何承诺。\n\n",

		"三、用户权利与义务\n",

		"3.1 您在使用本产品时，应遵守国家法律法规、社会公共秩序，不得利用本产品进行任何非法活动。\n",

		"3.2 您应保证提供给我们的个人信息真实、准确、完整，且您有权提供该等个人信息。\n",

		"3.3 您不得以任何形式损害本产品的知识产权，包括但不限于复制、修改、发布、传播、展示等。\n",

		"3.4 您对使用本产品过程中的行为负全部责任，包括但不限于对其他用户的交流内容、信息的真实性、合法性等。\n\n",

		"四、知识产权保护\n",

		"4.1 我们拥有AI大模型问答机器人移动版平台APP产品的知识产权，包括但不限于著作权、商标权、专利权等。\n",

		"4.2 未经我们的书面许可，您不得以任何形式使用、修改、复制、传播、展示我方的知识产权。\n\n",

		"五、免责声明\n",

		"5.1 由于网络技术的发展和不可抗力的因素，我们不能保证本产品的服务将满足您的全部需求，也不能保证服务不会中断或出现错误。\n",

		"5.2 对于因您使用本产品所产生的任何直接或间接的损失，我们不承担任何责任。\n\n",

		"六、协议终止\n",

		"6.1 您可以随时停止使用本产品，或者通过联系我们的客服注销您的账号。\n",

		"6.2 如您违反了本协议的任何条款，我们有权立即终止向您提供服务，并保留追究您法律责任的权利。\n\n",

		"七、其他条款\n",

		"7.1 本协议适用中华人民共和国法律，如发生任何争议，应通过友好协商解决。协商不成的，您同意将争议提交至有管辖权的人民法院解决。\n",

		"7.2 如果本协议的任何条款被认定为无效或不可执行，不影响其他条款的继续有效。\n",

		"7.3 本协议的标题仅为方便阅读而设，不影响对于条款的解释和理解。\n\n",

		"感谢您阅读并同意本用户协议。我们将竭诚为您提供优质的AI大模型问答机器人移动版平台APP产品和服务！\n\n",

		"如有任何关于隐私协议的疑问或意见，请联系我们,微信号:rocy-data。感谢您的信任和支持！\n\n\n",

		"                             日期： 2024-3-1\n",

		"                             若馨科技产品团队\n"
	],
	"隐私政策": ["                             隐私协议\n\n\n",

		"欢迎使用我们开发的基于Chat GPT的AI大模型问答机器人移动版平台APP产品。在使用本产品之前，请您仔细阅读以下隐私协议，以了解我们收集、使用和保护您的个人信息的方式。\n",

		"1. 信息收集\n",

		"1.1. 我们可能会收集您在使用本产品时提供的个人信息，包括但不限于姓名、联系方式、地理位置等。这些信息将用于提供更好的服务和个性化的用户体验。\n",

		"1.2. 我们还可能在您使用本产品时自动收集某些信息，包括但不限于设备标识符、操作系统版本、网络信息等。这些信息将用于产品改进、故障排除和安全性分析。\n",

		"1.3. 为了提供更准确和个性化的服务，我们可能会使用Cookie等技术来收集和存储您的偏好设置、用户使用模式等信息。\n\n",

		"2. 信息使用\n",

		"2.1. 我们将使用收集的信息来提供、维护和改进本产品的功能和性能。\n",

		"2.2. 我们可能会使用您的个人信息来向您发送与产品相关的通知、更新和营销信息。\n",

		"2.3. 我们可能会使用您的个人信息进行用户行为分析，以改进产品的用户体验和服务质量。\n\n",

		"3. 信息共享\n",

		"3.1. 除非获得您的明确同意或法律要求，否则我们不会将您的个人信息提供给第三方。\n",

		"3.2. 在提供服务的过程中，我们可能会与第三方合作伙伴共享某些信息，以实现更好的产品功能和服务。我们会要求这些合作伙伴保护您的个人信息安全。\n\n",

		"4. 信息保护\n",

		"4.1. 我们采取合理的安全措施来保护您的个人信息，防止未经授权的访问、使用、披露、修改或损坏。\n",

		"4.2. 在您使用本产品时，您需要妥善保管您的账户信息，避免将其泄露给他人。如发现您的账户信息被盗用或存在安全问题，请立即联系我们。\n\n",

		"5. 其他条款\n",

		"5.1. 本隐私协议适用于本产品的所有用户。\n",

		"5.2. 我们可能会根据法律法规和产品运营需要，不时更新本隐私协议。更新后的隐私协议将在本产品中以适当方式通知您。\n",

		"5.3. 如您继续使用本产品，即表示您同意本隐私协议的条款。\n",

		"如有任何关于隐私协议的疑问或意见，请联系我们,微信号:rocy-data。感谢您的信任和支持！\n\n\n",

		"                                日期： 2024-3-1\n",

		"                                若馨科技产品团队\n"
	],
	"关于我们": [
		"这款产品包含网页版、APP版本、小程序版本及公众号版本，能为您提供的是Chat GPT的大模型会话能力、绘画能力、及私有模型服务，同时把这些能力以机器人的形式融入到社交，现在已经支持微信、企微、移动QQ和招聘",
		"我们还在不断努力中，我们需要您的扶持和鼓励"
	],
	"加入我们": ["微信:rocy-data", "Email:wanghongquan@mail.rocy-data.wang"],
	"商务合作": ["微信:rocy-data", "Email:wanghongquan@mail.rocy-data.wang"],
	"意见反馈": ["微信:rocy-data", "Email:wanghongquan@mail.rocy-data.wang"]
}
export const PayMethod = {
	"wechat": "wechat",
	"alipay": "alipay"
}

export const TOKEN_KEY = "accessToken";
export const SHARE_TOKEN_KEY = "shareToken";
export const TOKEN_TYPE_KEY = "tokenType";
export const AUTHORIZATION = "Authorization";
export const CODE_KEY = "code";
export const INFO_KEY = "info";
export const BEARER = "bearer";
export const IMAGE_MODEL_KEY = "IMAGE_MODEL_KEY";

export const IMAGE_SMALL = "small"
export const IMAGE_MIDDLE = "middle"
export const IMAGE_BIG = "big"
export const OPENAI_SIZES = {
	"大": IMAGE_BIG,
	"中": IMAGE_MIDDLE,
	"小": IMAGE_SMALL
}

export const PRICE_TIMES = "PRICE_TIMES"
export const INPUT_1K_TOKENS_RMB = "INPUT_1K_TOKENS_RMB"
export const OUTPUT_1K_TOKENS_RMB = "OUTPUT_1K_TOKENS_RMB"
export const MAX_TOKENS = "MAX_TOKENS"
export const GPT_4 = "gpt-4"
export const GPT_3DOT5_TURBO = "gpt-3.5-turbo"
export const GPT_3DOT5_TURBO_16K = "gpt-3.5-turbo-16k"
export const LLMs = [GPT_4, GPT_3DOT5_TURBO_16K, GPT_3DOT5_TURBO]
export const GPT_NAME_MAP = {
	[GPT_4]: "4.0大模型",
	[GPT_3DOT5_TURBO_16K]: "3.5 16K大模型",
	[GPT_3DOT5_TURBO]: "3.5大模型",
}
export const GPT_DEFAULT = GPT_3DOT5_TURBO_16K
export const IMAGE_DALL_E3 = "dall-e-3"
export const IMAGE_SD_XL = "stable-diffusion-xl"

export const SD_SIZES = {
	"头像1": "768x768",
	"头像2": "1024x1024",
	"头像3": "1536x1536",
	"头像4": "2048x2048",

	"文章配图1": "1024x768",
	"文章配图2": "2048x1536",

	"海报传单1": "576x1024",
	"海报传单2": "768x1024",
	"海报传单3": "1536x2048",

	"电脑壁纸1": "1024x576",
	"电脑壁纸2": "2048x1152"
}
export const SD_SIZE_DEFAULT = "1024x768"
export const SD_STYLES = {
	"基础风格": "Base",
	"3D模型": "3D Model",
	"模拟胶片": "Analog Film",
	"动漫": "Anime",
	"电影": "Cinematic",
	"漫画": "Comic Book",
	"工艺黏土": "Craft Clay",
	"数字艺术": "Digital Art",
	"增强": "Enhance",
	"幻想艺术": "Fantasy Art",
	"等距风格": "Isometric",
	"线条艺术": "Line Art",
	"低多边形": "Lowpoly",
	"霓虹朋克": "Neonpunk",
	"折纸": "Origami",
	"摄影": "Photographic",
	"像素艺术": "Pixel Art",
	"纹理": "Texture",
}
export const SD_STYLE_DEFAULT = "Base"
export const NOVEL = {
	modelName: GPT_DEFAULT,
	temperature: 1.5,
	maxToken: 4096
}
export const PAPER = {
	modelName: GPT_DEFAULT,
	temperature: 0.7,
	maxToken: 2048
}
export const IMAGE_MODEL_OPENAI_DEFAULT = {
	model_name: IMAGE_DALL_E3,
	size: IMAGE_MIDDLE,
	n: 1,
	question: null
}
export const SD_STEPS_DEFAULT = 20
export const IMAGE_MODEL_SD_DEFAULT = {
	model_name: IMAGE_SD_XL,
	size: SD_SIZE_DEFAULT,
	n: 1,
	style: SD_STYLE_DEFAULT,
	steps: SD_STEPS_DEFAULT,
	question: null,
	negative_prompt: null
}

export const AI_MODEL2TOKENS = {
	[GPT_3DOT5_TURBO]: 4096,
	[GPT_3DOT5_TURBO_16K]: 16384,
	[GPT_4]: 32768,
}
export const QUESTION_TEXT_SAMPLE = "请问PI的前30位是什么？"
export const QUESTION_DRAWING_SAMPLE = "帮我画一幅漂亮的山水风景画可以吗？"
export const PRICE_BACKGROUND_CHANGE_RMB = "PRICE_BACKGROUND_CHANGE_RMB"
export const PRICE_SD_RMB = "PRICE_SD_RMB"
export const PRICE_OCR = "PRICE_OCR"
export const PRICE_FACE_SWAP_RMB = "PRICE_FACE_SWAP_RMB"
export const PRICE_FACE_SWAP_VIDEO_RMB = "PRICE_FACE_SWAP_VIDEO_RMB"
export const SAMPLE_LOGO = "https://rocy-ai.wang/img/ai_gc.svg"
export const SAMPLE_MP4 = getWebUrl("/mp_images/sample.mp4")
export const SAMPLE_MP3 = getWebUrl("/mp_images/sample.mp3")
export const SAMPLE_JPG = getWebUrl("/mp_images/sample_star.jpg")