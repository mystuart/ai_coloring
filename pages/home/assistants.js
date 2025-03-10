import {
	getWebUrl
} from '@/utils/service'

export const assistants = [
	["AI WORD", "从标题到段落，从段落到内容，两步式AI生成图文文档,用于快速写论文、公众号、小红书，可下载\n有别于同类产品的是：既可根据指定的文件即私域模型来生成内容，也可自由配置大模型算法及其参数", getWebUrl("/mp_images/ai_word.png"), "word", "八大金刚之1青除灾"],
	["AI 抠图", "提供图片,即可换掉背景,支持纯色替换风景替换", getWebUrl("/mp_images/kou_tu.png"), "background_change", "八大金刚之2辟毒"],
	["AI 文生图", "提供文字说明,即可生成图片,支持简单和专家模式,还能随时随地一键生成", getWebUrl("/mp_images/text2image.svg"), "text2image", "八大金刚之3黄随求"],
	["AI 卡照识别", "提供图片,输出识别文字。支持身份证、社保卡、名片、结婚证、银行卡和营业执照", getWebUrl("/mp_images/image2text_batch.svg"), "image2text_batch", "八大金刚之4白净水"],
	["AI Chat", "提供文字说明,精准回答还能批量,支持上传文件制作私人模型,还能随时随地一键生成", getWebUrl("/mp_images/chat.svg"), "ai_chat", "八大金刚之5赤声火"],
	["AI 提示词工程", "更多选择，生成大模型提问词\n支持漫画油画壁画、规划写作神学", getWebUrl("/mp_images/prompt.svg"), "prompt", "八大金刚之6定持灾"],
	["AI 改头换面", "其他照片上的人脸，换成自己的\n是AI 抠图的AI伴侣", getWebUrl("/mp_images/face_swap.svg"), "face_swap", "八大金刚之7紫贤金刚"],
	["AI 短视频", "提供文字图片,即可生成视频\n可加LOGO、背景音乐、片头片尾", getWebUrl("/mp_images/ai_video.svg"), "ai_video", "八大金刚之8大神"],
]