const utils = {
    /**
	 * 生成uuid
	 * @param {string} before uuid前缀
	 */
	uuid(before) {
		let uuid = String(before || "uuid");
		for (let i = 1; i <= 28; i++) {
			let n = Math.floor(Math.random() * 16.0).toString(16);
			uuid += n;
			if (i == 8 || i == 12 || i == 16 || i == 20) uuid += "";
		}
		return uuid;
	},
	/**
	 * 校验指定值是否是对象
	 * @param {*} val
	 */
	isObject(val) {
		return Object.prototype.toString.call(val) === `[object Object]`;
	},
	/**
	 * 校验指定值是否是函数，如果是函数则立即执行
	 * @arguments (object|function, function|[params], [...params])
	 */
	isFunctionCall() {
		let arg = Array.from(arguments);
		let t = this;
		let fn = arg[0];
		let params = arg.slice(1);
		if (utils.isObject(arg[0])) {
			t = arg[0];
			fn = arg[1];
			params = arg.slice(2);
		}
		if (utils.isFunction(fn)) {
			return fn.apply(t, params);
		} else {
			return false;
		}
	},
	/**
	 * 校验指定值是否是函数
	 * @param {*} fun
	 */
	isFunction(fun) {
		return typeof fun === 'function';
	},
	/**
	 * 校验指定值是否是HTML节点
	 * @param {*} val
	 */
	isNode(val) {
		return /^\[object.*Element\]$/.test(Object.prototype.toString.call(val));
	},
	/**
	 * 校验指定值是否是HTML节点伪数组
	 * @param {*} val
	 */
	isNodeList(val) {
		return Object.prototype.toString.call(val) === `[object NodeList]`;
	},
	/**
	 * 校验字符串是否是合法颜色值
	 * @param {*} val
	 */
	isColor(val) {
		if (typeof val !== `string`) {
			return false;
		}
		let colors = [`transparent`];
		let vali = $validate(val);
		switch (true) {
			case vali.colorHex():
				return true;
			case vali.colorRgb():
				return true;
			case vali.colorRgba():
				return true;
			case colors.includes(val):
				return true;
			default:
				return false;
		}
	},
	/**
	 * 对象深拷贝
	 * @param {object} target 目标对象
	 */
	deepClone(target) {
        return JSON.parse(JSON.stringify(target));
	},
	/**
	 * 对象浅层比较
	 * @arguments (...object)
	 */
	objectEqual(object1, object2) {
		const keys1 = Object.keys(object1);
		const keys2 = Object.keys(object2);
		if (keys1.length !== keys2.length) {
		  return false;
		}
		for (let index = 0; index < keys1.length; index++) {
		  const val1 = object1[keys1[index]];
		  const val2 = object2[keys2[index]];
		  if ((val1 || val2) && val1 !== val2) {
			return false;
		  }
		}
		return true;
	},
	// 比较2个数组是否有相同的值，有则返回第一个相同的值
    arrayCompareSameValue(arr1, arr2, fn) {
        let result;
        let query = typeof fn === 'function' && typeof fn() === 'string' && fn();
        if (Array.isArray(arr1) && Array.isArray(arr2)) {
            is:for (let i = 0; i < arr1.length; i++) {
                for (let j = 0; j < arr2.length; j++) {
                    let quote_value = !!(arr1[i] && typeof arr1[i] === 'object' && arr2[j] && typeof arr2[j] === 'object');
                    if (query && quote_value) {
                        if (arr2[j][query] === arr1[i][query]) {
                            result = arr1[i];
                            break is;
                        }
                    } else {
                        if (arr2[j] === arr1[i]) {
                            result = arr1[i];
                            break is;
                        }
                    }
                }
            }
        }
        return result;
    },
    // 比较2个数组中相同的值，并返回一个有相同部分值的新数组
    arrayCompareSameList(arr1, arr2, fn) {
        let result = [];
        let query = typeof fn === 'function' && typeof fn() === 'string' && fn();
        if (Array.isArray(arr1) && Array.isArray(arr2)) {
            for (let i = 0; i < arr1.length; i++) {
                for (let j = 0; j < arr2.length; j++) {
                    let quote_value = !!(arr1[i] && typeof arr1[i] === 'object' && arr2[j] && typeof arr2[j] === 'object');
                    if (query && quote_value) {
                        if (arr2[j][query] === arr1[i][query]) {
                            result.push(arr1[i]);
                            break;
                        }
                    } else {
                        if (arr2[j] === arr1[i]) {
                            result.push(arr1[i]);
                            break;
                        }
                    }
                }
            }
        }
        return result;
    },

	// 判断设备环境
	deviceENV() {
		let dev = {
			userAgent: "",
			mobile: false,
			ios: false,
			mac: false,
			safari: false,
			android: false,
			chrome: false,
			firefox: false,
			ie: false,
			edge: false,
			wechat: false,
			wechatPC: false,
			QQBrowser: false,
			QQBrowserLite: false,
			Maxthon: false,
			liebao: false,
			baidu: false,
			sougou: false,
		};
		try {
			let ua = window.navigator.userAgent;
			dev.userAgent = ua;
			dev.ios = /(iPhone|iPod|iPad)/gi.test(ua);
			dev.mac = /Mac OS/gi.test(ua);
			dev.safari = (dev.ios || dev.mac) && /(Safari|Version)/gi.test(ua);
			dev.android = /(Linux|Android)/gi.test(ua);
			dev.mobile = /Mobile/gi.test(ua);
			dev.chrome = /Chrome/gi.test(ua);
			dev.firefox = /Firefox/gi.test(ua);
			dev.ie = /(Trident|MSIE)/gi.test(ua) && "ActiveXObject" in window;
			dev.edge = /Edge/gi.test(ua);
			dev.wechat = /MicroMessenger/gi.test(ua);
			dev.wechatPC = /WindowsWechat/gi.test(ua) && dev.wechat;
			dev.QQBrowser = /QQBrowser/gi.test(ua);
			dev.QQBrowserLite = /QQBrowserLite/gi.test(ua) && dev.safari;
			dev.Maxthon = /Maxthon/gi.test(ua);
			dev.liebao = /lbbrowser/gi.test(ua);
			dev.baidu = /BIDUBrowser/gi.test(ua);
			dev.sougou = /SE 2\.X MetaSr/gi.test(ua);
			switch (true) {
				case dev.chrome:
					let chromeversion = ua.match(/Chrome\/[\d\.]+/g);
					if (chromeversion) {
						dev.version = parseFloat(chromeversion[0].replace(`Chrome/`, ""));
					}
					break;
				case dev.safari:
					let safariversion = ua.match(/Version\/[\d\.]+/g);
					if (safariversion) {
						dev.version = parseFloat(safariversion[0].replace(`Version/`, ""));
					}
					break;
				case dev.ie:
					let ieversion = ua.match(/rv:[\d\.]+/g);
					if (ieversion) {
						dev.version = parseFloat(ieversion[0].replace(`rv:`, ""));
					}
					break;
			}
		} catch (error) {
			console.error(error);
		}
		return dev;
	},
	// 判读是否是微信小程序环境
	isMiniProgramENV() {
        return new Promise((resolve, reject) => {
            if(!utils.deviceENV().wechat){
                resolve(false)
            }else{
                var wx = require('weixin-js-sdk');
                wx.miniProgram.getEnv((res) => {
                    if (!res.miniprogram) {
                        resolve(false)
                    } else {
                        resolve({"miniprogram":true,"wx":wx})
                    }
                })
            }
        })
    },
	/**
	 * url参数查询
	 * @param {string} name 需查询的参数名
	 * @param {string} url 指定url 默认当前页面地址链接
	 */
	getUrlQuery(name, url) {
		try {
			let reg = new RegExp(`(^|&)${name}=([^&]*)(&|$)`, "i");
			let u = url || window.location.href;
			let r = u.substring(u.indexOf("?") + 1).match(reg);
			if (r) {
				return decodeURIComponent(r[2]);
			}
			return "";
		} catch (e) {}
		return "";
	},
	/**
	 * @desc 函数防抖
	 * @param func 函数
	 * @param wait 延迟执行毫秒数
	 * @param immediate true 表立即执行，false 表非立即执行
	 */
	debounce(func, wait, immediate) {
		var timeout;
		return function() {
			var context = this;
			var args = arguments;
			if (timeout) clearTimeout(timeout);
			if (immediate) {
				var callNow = !timeout;
				timeout = setTimeout(function() {
					timeout = null;
				}, wait);
				if (callNow) func.apply(context, args);
			} else {
				timeout = setTimeout(function() {
					func.apply(context, args);
				}, wait);
			}
		};
	},
	/**
	 * @desc 函数节流
	 * @param func 函数
	 * @param wait 延迟执行毫秒数
	 * @param type true 表时间戳版，false 表定时器版
	 */
	throttle(func, wait, type) {
		var previous = 0;
		var timeout;
		return function() {
			var context = this;
			var args = arguments;
			if (type) {
				var now = Date.now();
				if (now - previous > wait) {
					func.apply(context, args);
					previous = now;
				}
			} else {
				if (!timeout) {
					timeout = setTimeout(function() {
						timeout = null;
						func.apply(context, args);
					}, wait);
				}
			}
		};
	},
	/**
	 * 将参数转化为px数值（number） 默认保留小数4位
	 * @param {string} value 带单位的数值
	 */
	fix(value, toFixed){
		let n = isNaN(toFixed) ? 4 : Math.floor(toFixed);
		let l = `1` + `0`.repeat(n);
		let unit_px = this.unit2px(value);
		return Math.floor(unit_px * l) / l;
	},
	/**
	 * 四舍五入保留小数
	 * @param  {Number} num 数值
	 * @param  {Number} len 小数位数
	 */
	round(num, len){
		return Math.round(num * Math.pow(10, len)) / Math.pow(10, len);
	},
	/**
	 * 其他单位数值转换px数值（number）
	 * @param {string} value 带单位的数值
	 */
	unit2px(value) {
		let device_dpi = 72;
		let _1in = 2.541;
		let unit_px = 0;
		let unit = String(value);
		switch (true) {
			case unit.indexOf('mm') >= 0:
				unit_px = Number(unit.slice(0, -2)) / 10 / _1in * device_dpi;
				break;
			case unit.indexOf('cm') >= 0:
				unit_px = Number(unit.slice(0, -2)) / _1in * device_dpi;
				break;
			case unit.indexOf('in') >= 0:
				unit_px = Number(unit.slice(0, -2)) * device_dpi;
				break;
			case unit.indexOf('px') >= 0:
			case unit.indexOf('em') >= 0:
				unit_px = Number(unit.slice(0, -2));
				break;
			default:
				unit_px = Number(unit);
				break;
		}
		if (isNaN(unit_px)) {
			unit_px = 0;
		}
		return unit_px;
	},
	/**
	 * 数字范围控制
	 * @param {number} number 数值
	 * @param {number} min 最小值
	 * @param {number} max 最大值
	 */
	NumberRange(number, min, max) {
		if (isNaN(number)) {
			return number;
		}
		if (!isNaN(min)) {
			if (Number(number) < Number(min)) {
				return Number(min);
			}
		}
		if (!isNaN(max)) {
			if (Number(number) > Number(max)) {
				return Number(max);
			}
		}
		return Number(number);
	},
	/**
	 * 时长转时间格式
	 * @param {number} stamp 毫秒时长
	 * @param {boolean} useH 强制使用 小时格式
	 * @param {boolean} hasMillisecond 是否需要显示 毫秒数
	 */
	timeStampTransform(stamp, useH, hasMillisecond) {
		let format = ["00", "00", "00"];
		let ms = '00';
		if (!isNaN(stamp)) {
			let s = Math.floor(stamp / 1000);
			let h = String(Math.floor(s / 3600)).padStart(2, "0");
			let m = String(Math.floor(Math.floor(s % 3600) / 60)).padStart(2, "0");
			s = String(s % 60).padStart(2, "0");
			format = [h, m, s];
			ms = String(Math.floor(stamp % 1000)).padStart(3, "0").substr(0, 2);
            if (!useH && h === '00') {
                format.shift();
            }
		}
		return hasMillisecond ? format.join(":") + '.' + ms : format.join(":");
	},
	/**
	 * 分秒转时间戳
	 * @param {number} time 分秒
	 */
	timeToStamp(time) {
		let stamp = 0;
		if (time) {
			let split = String(time).split(/\s*:\s*/).map(i => Number(i)).filter(i => !isNaN(i));
			if (split.length) {
				if (split.length > 1) {
					let min = split[0] * 60;
					let sec = split[1];
					stamp = (min + sec) * 1000;
				} else {
					stamp = split[0] * 1000;
				}
			}
		}
　　　　return stamp;
	},
	/**
	 * 时间格式转换
	 * @param {Date} date 时间对象
	 * @param {string} format 格式
	 */
    dateFormat(date, format) {
        let month = date.getMonth() + 1;
        if(month < 10){
            month = "0" + month;
        }
        var o = {
            "M+": month, // month
            "d+": date.getDate(), // day
            "H+": date.getHours(), // hour
            "m+": date.getMinutes(), // minute
            "s+": date.getSeconds(), // second
            "q+": Math.floor((date.getMonth() + 3) / 3), // quarter
            "S": date.getMilliseconds(),
        };
        if (/(y+)/.test(format)) {
            format = format.replace(RegExp.$1, (date.getFullYear() + "").substr(4 - RegExp.$1.length));
        }
        for (let k in o) {
            if (new RegExp("(" + k + ")").test(format)) {
                format = format.replace(RegExp.$1, RegExp.$1.length == 1 ? o[k]: ("00" + o[k]).substr(("" + o[k]).length));
            }
        }
        return format; 
	},
	/**
	 * 时间戳转换具体时间判断
	 * @param {number} stamp 时间戳
	 */
    timeStampDetail(timestamp) {
        let save_time = new Date(timestamp * 1000),
            save_y = save_time.getFullYear(),
            save_m = save_time.getMonth() + 1 < 10 ? '0' + (save_time.getMonth() + 1) : save_time.getMonth() + 1,
            save_d = save_time.getDate();
        let now_time = new Date(),
            now_y = now_time.getFullYear(),
            now_m = now_time.getMonth() + 1 < 10 ? '0' + (now_time.getMonth() + 1) : now_time.getMonth() + 1,
            now_d = now_time.getDate();
        let save_time_str = '';
        if (save_y === now_y && save_m === now_m && save_d === now_d) {
            if(save_time.getHours() <= 12){
                save_time_str = "上午 " + save_time.getHours() + ':' + (Number(save_time.getMinutes()) + 1 < 10 ? '0' + save_time.getMinutes() : save_time.getMinutes());
            }else{
                save_time_str = "下午 " + (save_time.getHours() - 12) + ':' + (Number(save_time.getMinutes()) + 1 < 10 ? '0' + save_time.getMinutes() : save_time.getMinutes());
            }
        } else {
            save_time_str = save_y + "年" + save_m + "月" + save_d + "日";
        }
        return save_time_str;
	},
	// 100 => 01:40 数字转 分:秒格式
    numberToMinuteFormat(number) {
        let result = '00:00';
        if (isNaN(number)) {
            return result;
        }
        let date = parseInt(number);
        let s = date % 60;
        s = s < 10 ? '0' + s : s;
        let m = Math.floor(date / 60) % 60;
        m = m < 10 ? '0' + m : m;
        m += ':';
        let h = Math.floor(date / (60 * 60)) % 60;
        h = h < 10 ? '0' + h : h;
        h = Number(h) ? h + ':' : '';
        return h + m + s;
    },
	// 计算时间差，返回相对时间
	returnRelativeTime(time) {
        let _time = time || 0;
        if (_time === 0) {
            console.error("非法参数");
        } else {
            let save_time = new Date(_time);
            let minute = 1000 * 60, hour = minute * 60, day = hour * 24, month = day * 30, now = new Date().getTime(), diffValue = now - _time, diff_m =diffValue/month, diff_d =diffValue/day;
            if(diff_m>=1){
                if(diff_m<=12){
                    return parseInt(diff_m) + "个月前";
                }else{
                    return parseInt(diff_m/12) + "年前";
                }
            } else if(diff_d>=1){
                return parseInt(diff_d) +"天前";
            } else{
                return (save_time.getHours() < 10 ? '0' + save_time.getHours() : save_time.getHours()) + ':' + (Number(save_time.getMinutes()) < 10 ? '0' + save_time.getMinutes() : save_time.getMinutes());
            }
        }
    },
	/**
	 *	相对时间计算
	 *  @params time => 转化的时间戳
	 *  @params date_connector => 日期链接符号
	 *  @params hour_connector => 小时链接符号
	 */
    relativeTime(obj) {
        let time = obj.time || 0,
            date_connector = obj.date_connector || '-',
            hour_connector = obj.hour_connector || ':',
            result = {};
        // 错误状态判断
        if(time === 0) return false;
        // 计算时间戳日期
        let time_obj = new Date(time),
            years = time_obj.getFullYear(),
            month = time_obj.getMonth() + 1,
            day = Number(time_obj.getDate()) + 1 > 10 ? time_obj.getDate() : '0' + time_obj.getDate(),
            hour = time_obj.getHours(),
            minute = time_obj.getMinutes(),
            second = time_obj.getSeconds();
        result.date = years + date_connector + month + date_connector + day;
        result.hour = hour + hour_connector + minute + hour_connector + second;
        // 计算相对日期
        let save_time_str = "",
            _minute = 1000 * 60,
            _hour = _minute * 60,
            _day = _hour * 24,
            _month = _day * 30,
            now = new Date().getTime(),
            diff = now - time,
            diff_m = diff / _month,
            diff_d = diff / _day;
        if(diff_m >= 1){
            if(diff_m <= 12){
                save_time_str = parseInt(diff_m) + "个月前";
            }else{
                save_time_str = parseInt(diff_m / 12) + "年前";
            }
        } else if(diff_d >= 1){
            save_time_str = parseInt(diff_d) +"天前";
        } else{
            save_time_str = "今天 " + hour + ':' + (Number(minute) + 1 < 10 ? '0' + minute : minute);
        }
        result.relative = save_time_str;
        // 返回结果
        return result;
    },
    // 计算相差时间
    calculateDiffTime(start,end,type) {
        let diffMs = (end - start);
        if (type === 'day') {
            return parseInt(diffMs / (24 * 60 * 60 * 1000));
        } else if (type === 'hours') {
            return parseInt(diffMs / (60 * 60 * 1000));
        } else {   //minutes
            return parseInt(diffMs / (60 * 1000));
        }
    },
	// 到期时间计算(精确至小时)
    expireTime(time) {
        let diff = '';
        let time_diff = time - new Date().getTime(); //时间差的毫秒数 
        // 计算出相差天数
        let days = Math.floor(time_diff / (24 * 3600 * 1000));
        if (days > 0) {
            diff += days + 1 + '天';
        } else {
            // 计算出小时数
            let leave1 = time_diff % (24 * 3600 * 1000);
            let hours = Math.floor(leave1 / (3600 * 1000));
            if (hours > 0) {
                diff += hours + 1 + '小时';
            } else {
                diff = '1小时';
            }
        }
        return diff;
    },
	/**
     * 字节单位转换
     * @param {number} size 大小
     * @param {string} unit 单位 (默认B)
     */
    bytesFormat(size, unit) {
		let pow1024 = (num) => {
            return Math.pow(1024, num);
        }
		if (!size) return '';
		if (unit === 'KB') size = size * pow1024(1);
		if (unit === 'MB') size = size * pow1024(2);
		if (unit === 'GB') size = size * pow1024(3);
		if (unit === 'TB') return size + 'TB';
		if (size < pow1024(1)) return size + 'B';
		if (size < pow1024(2)) return (size / pow1024(1)).toFixed(0) + 'KB';
		if (size < pow1024(3)) return (size / pow1024(2)).toFixed(0) + 'MB';
		if (size < pow1024(4)) return (size / pow1024(3)).toFixed(0) + 'GB';
		return (size / pow1024(4)).toFixed(0) + 'TB';
    },
	/**
	 * 文本复制功能
	 * @param {string} text 复制的文本
	 * @param {function} success 复制成功回调
	 * @param {function} error 复制失败回调
	 */
	copy(text, success, error) {
		if (!document.queryCommandSupported(`copy`) || !document.queryCommandSupported(`selectAll`) || !text) {
			utils.isFunctionCall(error);
			return;
		}
		let beforeActive = document.activeElement;
		let copyDom = document.createElement(`div`);
		copyDom.setAttribute(`contenteditable`, true);
		copyDom.setAttribute(`style`, `position: fixed; left: 0; top: 0; width: 100%; height: 100%;`);
		copyDom.textContent = String(text);
		document.body.appendChild(copyDom);
		copyDom.focus();
		document.execCommand(`selectAll`);
		if (window.getSelection().isCollapsed) {
			utils.isFunctionCall(error);
		} else {
			document.execCommand(`copy`);
			if (beforeActive) {
				beforeActive.focus();
			}
			utils.isFunctionCall(success);
		}
		document.body.removeChild(copyDom);
	},
    /**
     * 获取文件扩展名
     * @param {string} filename 文件名
     */
    getSuffix(filename) {
        let pos = filename.lastIndexOf('.');
        let suffix = '';
        if (pos != -1) {
            suffix = filename.substring(pos);
        }
        return suffix;
    },
	/**
	 * 获取cookie
	 * @param {String} key cookie键值
	 */
	getCookies(key) {
		let reg = new RegExp("(^| )"+ key +"=([^;]*)(;|$)"),
			arr;
		return (arr = document.cookie.match(reg)) ? decodeURI(arr[2]) : null;
	},
	/**
	 * 设置ookie
	 * @param {String} key cookie键值
	 * @param {String} value cookie值
	 */
	setCookies(key,value) {
		if($validate(key).empty() || $validate(value).empty()) return;
		document.cookie = key + "="+ encodeURI (value) + "; path=/";
	},
	/**
	 * 删除ookie
	 * @param {String} key cookie键值
	 */
	deleteCookies(key) {
		let date = new Date(),
			value = utils.getCookies(key);
		date.setTime(date.getTime() - 1);
		if(value) document.cookie = key + "=null;expires="+ date.toUTCString() + "; path=/";
	},
	/**
	 * 鼠标按下移动事件监听方法
	 * @param {function} move 鼠标移动事件回调
	 * @param {function} up 鼠标按键弹起事件回调
	 */
	mouseDownMoveEvent(move, up) {
		let mousemove = function (mevent) {
			typeof move === "function" && move(mevent);
		};
		let mouseup = function (uevent) {
			document.removeEventListener("mousemove", mousemove);
			document.removeEventListener("mouseup", mouseup);
			typeof up === "function" && up(uevent);
		};
		document.addEventListener("mousemove", mousemove);
		document.addEventListener("mouseup", mouseup);
	},
	/**
	 * svg 转 base64链接
	 * @param {node/string} svg 元素节点 或 字符串
	 */
	svgToBase64(svg) {
		let base64 = "";
		let svgnode;
		if (utils.isNode(svg)) {
			svgnode = svg;
		}
		if (typeof svg === `string`) {
			let div = document.createElement(`div`);
			div.innerHTML = svg;
			svgnode = div.querySelector(`svg`);
		}
		if (svgnode) {
			let xmlStr = new XMLSerializer().serializeToString(svgnode);
			base64 = `data:image/svg+xml,${encodeURIComponent(xmlStr)}`;
		}
		return base64;
    },
    /**
     * 任意色值 转 rgb(a)
     * @param {String} color 色值
     */
    colorToRgb(color) {
        if (!utils.isColor(color)) return '';
        var div = document.createElement('div');
        div.style.backgroundColor = color;
        document.body.appendChild(div);
        var c = window.getComputedStyle(div).backgroundColor;
        document.body.removeChild(div);
        return c;
    },
    /**
     * rgb 转 rgba
     * @param {String} color 色值
     * @param {String} alp 透明度
     */
    rgbToRgba(color, alp) {
        let rgbaAttr = color.match(/[\d.]+/g);
        if (rgbaAttr.length >= 3) {
            let r, g, b;
            r = rgbaAttr[0];
            g = rgbaAttr[1];
            b = rgbaAttr[2];
            return `rgba(${r},${g},${b},${alp})`
        }
    },
    /**
     * rgb(a) 转 hex
     * @param {String} color 色值
     */
    colorHex(color) {
        if (!utils.isColor(color) || $validate(color).colorHex() || color === `transparent`) return color;
        let value = color.replace(/[^\d,]/g, '').replace(/(\d+)/g, (s, s1) => {
            if (s1 == 1) return '';
            return parseInt(s1).toString(16);
        });
        return `#${value.replace(/,/g, '').toLowerCase()}`;
    },
    /**
     * 获取rgba透明度
     * @param {String} color 色值
     */
    getRgbaAlp(color) {
        let alp = 1;
        if ($validate(color).colorRgba()) {
            let rgbaReg = /rgba\([\d ]+(?:\,([\d. ]+)){3}\)/;
            if (rgbaReg.test(color)) {
                alp = color.replace(rgbaReg, '$1');
            }
        } else if (color === 'transparent') {
            alp = 0;
        }
        return parseFloat(alp);
	},
	// 判断当前色系
	getColorSystem(color) {
		if (!utils.isColor(color)) return color;
		if ($validate(color).colorHex()) {
			color = utils.colorToRgb(color);
		}
        let rgbaAttr = color.match(/[\d.]+/g);
		// 浅色系
		if (Number(rgbaAttr[0]) * 0.299 + Number(rgbaAttr[1]) * 0.578 + Number(rgbaAttr[2]) * 0.114 >= 192) {
			return `light`;
		} else {
			return `dark`;
		}
	},
	// 颜色 转 互补色rgb
	colorToComplementaryRgb(color){
		if (!utils.isColor(color)) return '';
		let rgbStr = utils.colorToRgb(color);
		let rgbaAttr = rgbStr.match(/[\d.]+/g);
		let [r, g, b] = [255 - parseFloat(rgbaAttr[0]), 255 - parseFloat(rgbaAttr[1]), 255 - parseFloat(rgbaAttr[2])]
		let complementaryRgb = `rgb(${r}, ${g}, ${b})`;
		return complementaryRgb;
	},
	/**
	 * 输入框回车交互方法
	 * @param {array} inputArr input组
	 * @param {function} submit 最后一个input回车回调
	 */
	inputsEnter(inputArr, submit) {
		let filterInput = Array.from((inputArr && typeof inputArr === `object`) ? inputArr : []);
		filterInput = filterInput.filter(item => {
			return item.nodeName === `INPUT` && [`text`, `email`, `password`, `number`, `search`].includes(item.type);
		});
		let focus = document.activeElement;
		if (!filterInput.length || focus.nodeName !== `INPUT`) {
			return;
		}
		let index = filterInput.findIndex(item => {
			return focus === item;
		});
		focus.onkeyup = function (event) {
			if (event.keyCode !== 13) {
				return;
			}
			if (index === filterInput.length - 1) {
				utils.isFunctionCall(submit);
				return;
			}
			let next = filterInput[index + 1];
			if (index > -1 && utils.isNode(next)) {
				next.focus();
			}
		}
	},
	/**
	 * base64 转 blob
	 * @param {string} base64 base64字符串
	 */
	base64ToBlob(base64) {
		if (base64 && typeof base64 === "string") {
			let arr = base64.split(',');
			let mime = arr[0].match(/:(.*?);/)[1];
			let bstr = atob(arr[1]);
			let n = bstr.length;
			let u8arr = new Uint8Array(n);
			while (n--) {
				u8arr[n] = bstr.charCodeAt(n);
			}
			return new Blob([u8arr], { type: mime });
		}
		return new Blob();
	},
	/**
	 * 获取上传文件的本地路径
	 * @param {object} file 本地上传文件
	 */
	getFileUrl(file) {
		let url = null;
		// basic
		if (window.createObjectURL != undefined) {
			url = window.createObjectURL(file);
		} else
		// mozilla(firefox)
		if (window.URL != undefined) {
			url = window.URL.createObjectURL(file);
		} else
		// webkit or chrome
		if (window.webkitURL != undefined) {
			url = window.webkitURL.createObjectURL(file);
		}
		return url;
	},
	//获取图片代理链接
    getImageProxyUrl(url) {
        if (!url || typeof url !== 'string') {
            return '';
        }
        let protocol;
        let domain = url.split('/');
        if(domain[0]) {
            protocol = domain[0].replace(':','');
        } else {
            protocol = '';
        }
        if(domain[2]) {
            if(domain[2] === location.host){//非跨域不处理
                return url;
            }
            domain = domain[2];
        } else {
            domain = '';
        }
        url = url.replace(/^http(s)?:\/\/(.*?)\//,location.protocol+'//'+location.host+'/image_proxy/');
        if(url.indexOf("?") === -1){
            url +="?";
        }
        if(domain){
            url += ('&domain=' + encodeURI(domain));
        }
        if(protocol){
            if(protocol === 'http' && domain === 'file.woodo.cn'){
                protocol = 'https';
            }
            url += ('&protocol=' + encodeURI(protocol));
        }
        return url;
    },
	// 新窗口打开方法
    windowOpenNewtab(url) {
        let newTab = document.createElement('a');
        newTab.setAttribute('href', url);
        newTab.setAttribute('target', '_blank');
        newTab.setAttribute('rel', 'noreferrer noopener');
        newTab.style.display = 'none';
        newTab.click();
        newTab.remove();
    },
	// 关闭当前页面
	closeWindow() {
		window.opener = null;
		window.open('', '_self');
		window.close();
	},
	// 文件下载
	download(src, name = `未命名`) {
		if (!src) return;
		try{
			let el = document.createElement('a');
			el.href = src;
			el.download = name;
			el.click();
		}catch(e){
			console.error(e);
			alert('文件下载失败，请重试');
		}
	},
	downloadFile(src, name=`未命名`) {
		let xhr = new XMLHttpRequest();
		xhr.open('GET', src);
		xhr.responseType = 'blob';
		xhr.onreadystatechange = function() {
			if (xhr.readyState === 4) {
				let url = URL.createObjectURL(xhr.response);
				utils.download(url, name);
			}
		}
		xhr.send('');
	},
	// 创建桌面快捷方式
    downloadDesktopShortcut(filename, fileurl) {
        try{
            let filedata = '', extension = '';
            if(this.get_device().mac){
                filedata =
                    `<?xml version="1.0" encoding="UTF-8"?>
                    <!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
                    <plist version="1.0">
                    <dict>
                    <key>URL</key>
                    <string>${fileurl}</string>
                    </dict>
                    </plist>`;
                extension = 'webloc';
            }else{
                filedata = 
                    `[InternetShortcut]
                    URL=${fileurl}`;
                extension = 'url';
            }
            filedata = new Blob([filedata]);
            filename += `.${extension}`;
            if (window.navigator.msSaveBlob) {
                window.navigator.msSaveBlob(filedata, filename);
            }else{
                let urlObject = window.URL || window.webkitURL || window;
                let url = urlObject.createObjectURL(filedata);
                let el = document.createElement('a');
                el.href = url;
                el.download = filename;
                el.click();
                urlObject.revokeObjectURL(url);
            }
        }catch(e){
            console.error(e);
            that.$toast('创建快捷方式失败,请重试!',2000);
        }
    },
	// 获取浏览器插件，返回浏览器插件列表， plugins_name：查询浏览器插件
    getNavigatorPlugins(plugins_name) {
        let plugins = [];
        try {
            plugins = Array.from(navigator.plugins);
            if (plugins_name) {
                return plugins.filter(item => {
                    return item.name.toLowerCase().indexOf(plugins_name.toLowerCase()) >= 0 || item.filename.toLowerCase().indexOf(plugins_name.toLowerCase()) >= 0;
                });
            } else {
                return plugins;
            }
        } catch (error) {
            return plugins;
        }
    },
	// 数字千位格式化（每三位加逗号）
	toThousands(num) {
		let result = '';
		num = (num || 0).toString();
		while (num.length > 3) {
			result = ',' + num.slice(-3) + result;
			num = num.slice(0, num.length - 3);
		}
		if (num) { result = num + result; }
		return result;
	},
	// 当前字体是否支持
    isSupportFontFamily(fontFamily) {
        if (typeof fontFamily != "string") {
            return false
        }
        var default_compared = "Arial";
        if (fontFamily.toLowerCase() == default_compared.toLowerCase()) {
            return true
        }
        var e = "a";
        var d = 100;
        var a = 100,
            i = 100;
        var c = document.createElement("canvas");
        var b = c.getContext("2d");
        c.width = a;
        c.height = i;
        b.textAlign = "center";
        b.fillStyle = "black";
        b.textBaseline = "middle";
        var g = function (j) {
            b.clearRect(0, 0, a, i);
            b.font = d + "px " + j + ", " + default_compared;
            b.fillText(e, a / 2, i / 2);
            var k = b.getImageData(0, 0, a, i).data;
            return [].slice.call(k).filter(function (l) {
                return l != 0
            })
        };
        return g(default_compared).join("") !== g(fontFamily).join("");
    },
    // 获取系统默认字体
    getSystemDefaultFont() {
        let _defaultFont = null;
        let default_fonts = ["Microsoft YaHei","PingFang SC"];
        for (var i = 0; i < default_fonts.length; i++) {
            if(utils.isSupportFontFamily(default_fonts[i])){
                _defaultFont = default_fonts[i];
                break;
            }
        }
        return _defaultFont;
    },
	// 通用滚动触底
    onReachBottom(opt) {
        let option = {
            $scroll: null,      // 监听滚动事件的document
            reach: 0.8,         // 触底距离 0 - 1 = 0% - 100%
            factor: null,       // 附加的阻止滚动条件
            onScroll: null,     // 滚动时回调
            onReach: null,      // 触底时回调
        };
        option = Object.assign(option, opt);
        if (!option.$scroll) {
            return;
        }
        try {
            let is_window = option.$scroll === window;
            let is_scroll = false;
            option.$scroll.onscroll = function (event) {
                let $this = event.target;
                let client_height = $this.clientHeight;
                let scroll_height = $this.scrollHeight;
                let scroll_top = $this.scrollTop;
                if (is_window) {
                    client_height = document.body.clientHeight;
                    scroll_height = document.body.scrollHeight;
                    scroll_top = window.scrollY;
                }
                if (typeof option.onScroll === 'function') option.onScroll();
                /**
                 * 滚动触底计算
                 * 滚动偏移量大于0 并且 滚动距离 大于 dom高度 90% 触发加载下一页
                 */
                let scroll_scale = (scroll_top + client_height) / scroll_height;
                if (scroll_top > 0 && scroll_scale > option.reach) {
                    // 列表正在加载中，停止触发
                    if (is_scroll) {
                        return;
                    }
                    is_scroll = true;
                    if (typeof option.factor === 'function' && option.factor()) {
                        return;
                    }
                    if (typeof option.onReach === 'function') option.onReach();
                }
            };
        } catch (error) {
        }
    },
};
if (window) {
	window.utils = utils;
}
export default utils