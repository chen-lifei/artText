/**
 * 已挂载至 window
 * @param value 校验的内容，如果值为数组则进入表单校验，并且需要调用 form(callback) 处理结果
 * @param msg 提示内容，可全部重新定制提示内容
 */

 const rule = {
	email: () => /^[a-zA-Z0-9_.-]+@[a-zA-Z0-9-]+(\.[a-zA-Z0-9-]+)*\.[a-zA-Z]{2,6}$/,
	phone: () => /^1\d{10}$/,
	url: () => /^(ht|f)tp(s?)\:\/\/.+$/,
	chinese: () => /^[\u4e00-\u9fa5]+$/,
	english: () => /^[a-zA-Z]+$/,
	special: () => /[\uD83C|\uD83D|\uD83E][\uDC00-\uDFFF][\u200D|\uFE0F]|[\uD83C|\uD83D|\uD83E][\uDC00-\uDFFF]|[0-9|*|#]\uFE0F\u20E3|[0-9|#]\u20E3|[\u203C-\u3299]\uFE0F\u200D|[\u203C-\u3299]\uFE0F|[\u2122-\u2B55]|\u303D|[\A9|\AE]\u3030|\uA9|\uAE|\u3030/i,
	illegal: () => /(<javascript|<script|<iframe|<img|<link|select\s|update\s|delete\s|insert\s|and\s|or\s)/gi,
	emoji: () => /[\uD800-\uDBFF][\uDC00-\uDFFF]/g,
	number: () => /^(\d)+\.?\d*$/,
	empty: () => /^\s+$/,
	int: () => /^\d+$/,
	floor: () => /^\d*\.\d+$/,
	colorhex: () => /^#[0-9a-fA-F]{6,8}$/,
	colorrgb: () => /^rgb\(\d{1,3}\s*\,\s*\d{1,3}\s*\,\s*\d{1,3}\)$/,
	colorrgba: () => /^rgba\(\d{1,3}\s*\,\s*\d{1,3}\s*\,\s*\d{1,3}\s*\,\s*(\d{1}|\d?\.\d+)\)$/,
};
// 内容空校验
let _empty = function (val) {
	return (val === "" || val === undefined || val === null || rule.empty().test(val)) ? true : false;
}
let _illegal = function (val) {
	return rule.illegal().test(val);
}
// 内容长度检验
let _rangelength = function (val, len) {
	let min, max;
	if (Array.isArray(len) && len.length >= 2) {
		min = Number(len[0]);
		max = Number(len[1]);
	} else if (rule.int(len)) {
		min = 0;
		max = len;
	} else {
		return false;
	}
	if (val.length >= min && val.length <= max) {
		return true;
	}
	return false;
}

class validate {
	constructor(value, msg) {
		this.value = value;
		let message = {
			"common": '请输入正确的内容',
			"email": '请输入正确的邮箱地址',
			"phone": '请输入正确的手机号码',
			"number": '请输入数字',
			"int": '请输入整数',
			"floor": '请输入带有小数点的数字',
			"url": '请输入正确的超链接',
			"cn": '请输入中文',
			"en": '请输入英文',
			"required": '请输入必填项',
			"rangelength": '输入的内容字数不符和',
			"illegal": '存在非法内容，请重新输入',
			"special": '存在特殊字符，请重新输入',
			"colorhex": `颜色HEX值错误`,
			"colorrgb": `颜色RGB值错误`,
			"colorrgba": `颜色RGBA值错误`,
		};
		this.message = Object.assign({}, message, msg);
	}
	/**
	 * 表单校验
	 * @param [{
	 *  target              --> 内容 或者 input
	 *  name                --> 自定义标识
	 *  type                --> 校验类型 & 可自定义正则表达式
	 *  message             --> 提示信息
	 *  required            --> 是否必填项
	 *  rangelength         --> 长度校验 数字或数组 数组取下标0,1
	 * }]
	 * @param callback.reject       --> 校验不通过回调处理
	 * @param callback.resolve      --> 所有项校验通过
	 * validate([{}...]).form({ reject, resolve });
	 *  */
	form(callbackOpt) {
		let that = this;
		let ruleArr = that.value;
		let option = {
			reject: null,
			resolve: null,
		};
		option = Object.assign({}, option, callbackOpt);
		if (!Array.isArray(ruleArr)) return console.error('表单校验方法参数需要是数组');
		let isSuccess = true;
		let failed = {};
		for (let i = 0, len = ruleArr.length; i < len; i++) {
			let item = ruleArr[i];
			let val = item.target;
			failed.value = val;
			failed.name = item.name;
			// message 定制
			if (typeof item.message === 'string' && item.message) {
				failed.message = item.message;
			}
			// 校验非法字符
			if (_illegal(val)) {
				isSuccess = false;
				if (!failed.message) failed.message = that.message['illegal'];
				break;
			}
			// 必填项
			if (item.required && !val) {
				isSuccess = false;
				if (!failed.message) failed.message = that.message['required'];
				break;
			}
			// 自定义校验规则 type
			if (typeof item.type === 'object') {
				if (!item.type.test(val)) {
					isSuccess = false;
					if (!failed.message) failed.message = that.message['common'];
					break;
				}
			}
			// 内置校验规则
			if (item.type === 'email' && !rule.email().test(val)) {
				isSuccess = false;
				if (!failed.message) failed.message = that.message['email'];
				break;
			}
			if (item.type === 'phone' && !rule.phone().test(val)) {
				isSuccess = false;
				if (!failed.message) failed.message = that.message['phone'];
				break;
			}
			if (item.type === 'number' && !rule.number().test(val)) {
				isSuccess = false;
				if (!failed.message) failed.message = that.message['number'];
				break;
			}
			if (item.type === 'int' && !rule.int().test(val)) {
				isSuccess = false;
				if (!failed.message) failed.message = that.message['int'];
				break;
			}
			if (item.type === 'floor' && !rule.floor().test(val)) {
				isSuccess = false;
				if (!failed.message) failed.message = that.message['floor'];
				break;
			}
			if (item.type === 'url' && !rule.url().test(val)) {
				isSuccess = false;
				if (!failed.message) failed.message = that.message['url'];
				break;
			}
			if (item.type === 'cn' && !rule.chinese().test(val)) {
				isSuccess = false;
				if (!failed.message) failed.message = that.message['cn'];
				break;
			}
			if (item.type === 'en' && !rule.english().test(val)) {
				isSuccess = false;
				if (!failed.message) failed.message = that.message['en'];
				break;
			}
			if (item.type === 'special' && !rule.special().test(val)) {
				isSuccess = false;
				if (!failed.message) failed.message = that.message['special'];
				break;
			}
			if (item.type === 'colorhex' && !rule.colorhex().test(val)) {
				isSuccess = false;
				if (!failed.message) failed.message = that.message['colorhex'];
				break;
			}
			if (item.type === 'colorrgb' && !rule.colorrgb().test(val)) {
				isSuccess = false;
				if (!failed.message) failed.message = that.message['colorrgb'];
				break;
			}
			if (item.type === 'colorrgba' && !rule.colorrgba().test(val)) {
				isSuccess = false;
				if (!failed.message) failed.message = that.message['colorrgba'];
				break;
			}
			// // 默认类型校验
			if (!item.type && _empty(val)) {
				isSuccess = false;
				if (!failed.message) failed.message = that.message['common'];
				break;
			}
			// 校验内容长度
			if (item.rangelength && _rangelength(val, item.rangelength)) {
				isSuccess = false;
				if (!failed.message) failed.message = that.message['rangelength'];
				break;
			}
		}
		if (isSuccess) {
			typeof option.resolve === 'function' && option.resolve();
		} else {
			typeof option.reject === 'function' && option.reject(failed);
		}
	}
	// 校验邮箱
	email() {
		return rule.email().test(this.value);
	}
	// 手机号
	phone() {
		return rule.phone().test(this.value);
	}
	// url
	url() {
		return rule.url().test(this.value);
	}
	// 中文字符
	chinese() {
		return rule.chinese().test(this.value);
	}
	// 英文字符
	english() {
		return rule.english().test(this.value);
	}
	// 特殊字符
	special() {
		return rule.special().test(this.value);
	}
	// 非法字符
	illegal() {
		return _illegal(this.value);
	}
	// 表情符号
	emoji() {
		return rule.emoji().test(this.value);
	}
	// 空
	empty() {
		return _empty(this.value);
	}
	// 数字
	number() {
		return rule.number().test(this.value);
	}
	// 整数
	int() {
		return rule.int().test(this.value);
	}
	// 浮点
	floor() {
		return rule.floor().test(this.value);
	}
	// 长度
	rangelength(len) {
		return _rangelength(this.value, len);
	}
	// color hex
	colorHex() {
		return rule.colorhex().test(this.value);
	}
	// color rgb
	colorRgb() {
		return rule.colorrgb().test(this.value);
	}
	// color rgba
	colorRgba() {
		return rule.colorrgba().test(this.value);
	}
}

let init = (value, msg) => {
	return new validate(value, msg);
}

if (window) {
	window.$validate = init;
}

export default init