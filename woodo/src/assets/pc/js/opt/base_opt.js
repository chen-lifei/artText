let base_opt = {
	// 功能方法集
	fn: {
		// svg生成canvas转图片时产生的样式差别
		svg2canvas_initial_style: '<style type="text/css">*{padding:0; margin:0; border:none; box-sizing:border-box;} .show_text{line-height:inherit; word-break:break-all; font-family:"Microsoft YaHei","PingFang SC","sans-serif"; font-size:14px;}</style>',
		// 获取随机id
		uuid: function(){
			let uuid = "uuid";
			for (let i = 1; i <= 28; i++) {
				let n = Math.floor(Math.random() * 16.0).toString(16);
				uuid += n;
				if (i === 8 || i === 12 || i === 16 || i === 20) uuid += "";
			}
			return uuid;
		},
		// 颜色转化方法 type: 当前颜色类型, color: 颜色值, matrix: 当前为 hex 值时,是否进行 matrix 转化标识
		color_exchange_function(type,color,matrix,opacity){
            let rgb;
            if (!color) return null;
            if (color === 'transparent' || color === 'rgba(0, 0, 0, 0)') return 'transparent';
			switch (type) {
				// rgb(a) 值转 hex 色值方法
				case 'rgb':
					rgb = color || 'rgb(66, 70, 75)';
                    if (rgb.indexOf('rgba') >= 0) {
						let rgba_reg = /^rgba\((\d+),\s*(\d+),\s*(\d+),\s*(\d*\.?\d*)\)$/;
						let color_arr = rgb.match(rgba_reg);
                        if (!color_arr || color_arr.length < 4) return null;
                        color = this.color_exchange_function('rgb', `rgb(${color_arr[1]}, ${color_arr[2]}, ${color_arr[3]})`);
                        opacity = color_arr[4]
                        return {
                            color: color,
                            opacity: +opacity
                        };
                    }
					else if(rgb.indexOf('rgb') >= 0){
                        let rgb_reg = /(\d{1,3}),(\d{1,3}),(\d{1,3})/,
                            rgb_str = rgb.replace(/\s+/g,"").slice(4,-1),
                            rgb_arr = rgb_reg.exec(rgb_str),
                            hex_str = "#" +
                                (("0" + parseInt(rgb_arr[1]).toString(16)).slice(-2)) +
                                (("0" + parseInt(rgb_arr[2]).toString(16)).slice(-2)) +
                                (("0" + parseInt(rgb_arr[3]).toString(16)).slice(-2));
                        return hex_str;
					}else{
						return rgb;
					}
                    break;
				// hex 值转 rgb 色值方法
				case 'hex':
					rgb = color.toLowerCase();
					let reg = /^#([0-9a-fA-f]{3}|[0-9a-fA-f]{6})$/;
					if (rgb && reg.test(rgb)) {
						if (rgb.length === 4) {
							let rgbNew = "#";
							for (let i = 1; i < 4; i += 1) {
								rgbNew += rgb.slice(i, i + 1).concat(rgb.slice(i, i + 1));
							}
							rgb = rgbNew;
						}
						//处理六位的颜色值
						let rgbChange = [];
						for (let i = 1; i < 7; i += 2) {
							rgbChange.push(parseInt("0x" + rgb.slice(i, i + 2)));
						}
						// 矩阵转换
						if (matrix){
							return '0 0 0 0 ' + rgbChange[0] / 255 + ' 0 0 0 0 ' + rgbChange[1] / 255 + ' 0 0 0 0 ' + rgbChange[2] / 255 + ' 0 0 0 1 0';
						}else{
							return "rgb(" + rgbChange.join(",") + ")";
						}
					} else {
						return rgb;
					}
					break;
				// rgb 矩阵 转 hex 方法
				case 'matrix':
					let rgb_arr = color.split(' ');
					rgb = 'rgb(' + Number(rgb_arr[4]) * 255 + ',' + Number(rgb_arr[9]) * 255 + ',' + Number(rgb_arr[14]) * 255 + ')';
					return this.color_exchange_function('rgb',rgb);
					break;
				case 'rgba':
					return "rgba(" + parseInt("0x" + color.slice(1, 3)) + "," + parseInt("0x" + color.slice(3, 5)) + "," + parseInt("0x" + color.slice(5, 7)) + "," + opacity + ")";
					break;
				default:
					break;
			}
		},
		parse_rgba: function (rgba = '') {
			let c = {
				r: 0,
				g: 0,
				b: 0,
				a: 1,
			};
			let parse = rgba.match(/^rgba?\((\d+),\s*(\d+),\s*(\d+)(,\s*(\d*\.?\d*))?\)$/);
			if (parse && parse.length) {
				c.r = parse[1];
				c.g = parse[2];
				c.b = parse[3];
				c.a = parse[5] || 1;
			}
			return c;
		},
		// 将参数转化为px数值（number） 默认保留小数4位
		unit_2_px: function(value){
			let unit_px = base_opt.fn.unit_2_px_exact(value);
			return Math.floor(unit_px * 10000) / 10000;
		},
		// value: string（mm,cm,in,px）,将参数转化为px数值（number）
		unit_2_px_exact: function (value) {
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
					unit_px = Number(unit.slice(0, -2));
					break;
				default:
					unit_px = Number(unit);
					break;
			}
			return unit_px;
		},
		// 计算时间差，返回相对时间
		return_relative_time: function(time){
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
		// 返回绝对时间
		return_fixed_time: function(time){
			let save_time = new Date(time),
				save_y = save_time.getFullYear(),
				save_m = save_time.getMonth() + 1 < 10 ? '0' + (save_time.getMonth() + 1) : save_time.getMonth() + 1,
				save_d = save_time.getDate();
			return save_y + "年" + save_m + "月" + save_d + "日" + save_time.getHours() + ':' + (Number(save_time.getMinutes()) + 1 < 10 ? '0' + save_time.getMinutes() : save_time.getMinutes());
		},
		// 校验元素异常   @param elementList  数组，元素列表   return boolean
		check_error_element: function(elementList){
			let isError = false;
			isBreak:for (let i = 0; i < elementList.length; i++) {
				let item = elementList[i];
				// svg 坐标值
				let transform_arr = item.translate.split(',');
				for (let _item in transform_arr) {
					if (isNaN(transform_arr[_item])) {
						isError = true;
						break isBreak;
					}
				}
				// svg 旋转值
				let rotate_arr = item.rotate.split(',');
				for (let _item in rotate_arr) {
					if (isNaN(rotate_arr[_item])) {
						isError = true;
						break isBreak;
					}
				}
				// svg 缩放值
				let scale_arr = item.scale.split(',');
				for (let _item in scale_arr) {
					if (isNaN(scale_arr[_item])) {
						isError = true;
						break isBreak;
					}
				}
				// 对象私有值校验
				switch (item.type) {
					case 'shape':
						if (isNaN(item.width) || item.width <= 0) { isError = true; break isBreak; }
						if (isNaN(item.height) || item.height <= 0) { isError = true; break isBreak; }
						if (item.d.length < 1) { isError = true; break isBreak; }
						break;
					case 'text':
						if (isNaN(item.width) || item.width <= 0) { isError = true; break isBreak; }
						if (isNaN(item.height) || item.height <= 0) { isError = true; break isBreak; }
						break;
					case 'img':
						if (isNaN(item.image_w) || item.image_w <= 0) { isError = true; break isBreak; }
						if (isNaN(item.image_h) || item.image_h <= 0) { isError = true; break isBreak; }
						if (!/^http(s)?:\/\//.test(item.url)) { isError = true; break isBreak; }
						break;
				}
			}
			return isError;
		},
		// 计算点a绕点b旋转某角度后的坐标(要旋转的点，旋转中心点，旋转角度)
		after_rotate_point:function(p1, p2, degree){
			if(typeof p1.x === 'undefined' || typeof p1.y === 'undefined' || typeof p2.x === 'undefined' || typeof p2.y === 'undefined' || typeof degree === 'undefined'){
				return false
			}
			let ang = degree * Math.PI / 180;
			return {
				x: (p1.x - p2.x) * Math.cos(ang) - (p1.y - p2.y) * Math.sin(ang) + p2.x,
				y: (p1.x - p2.x) * Math.sin(ang) + (p1.y - p2.y) * Math.cos(ang) + p2.y,
			};
		},
		// 文本选中 ele: JQ || dom 节点对象
		set_selection: function(ele){
			let editor = (ele.nodeType === 1) ? ele : ele[0]; // 判断传入的元素 是否为jq还是dom对象
			if (document.selection) {
				let range = document.body.createTextRange();
				range.moveToElementText(editor);
				range.select();
			} else if (window.getSelection) {
				let range = document.createRange();
				range.selectNodeContents(editor);
				window.getSelection().removeAllRanges();
				window.getSelection().addRange(range);
			}
		},
		// 深克隆对象 obj: Object
		clone_object: function(obj){
			return JSON.parse(JSON.stringify(obj));
		},
		// 特殊字符处理
		unicodehandle: function(str){
			//过滤控制符
			let ranges = [
				'\u000b'
			];
			let reg = new RegExp(ranges.join('|'), 'g');
			str = str.replace(reg,"");
			return str;
		},
		//转义html属性字符串(单引号与双引号转义)
		escapeHtmlAttrString:function(string) {
		    let entityMap = {
		        '"': '&quot;',
		        "'": '&#39;'
		    };
		    return String(string).replace(/["']/g, function (s) {
		        return entityMap[s];
		    });
		},
		// 获取元素实际可视尺寸定位
		get_client_rect: function ($ele) {
			// 原生dom
			if ($ele && $ele.nodeType === 1) {
				return $ele.getBoundingClientRect();
			}
			// jq 选择器
			if ($ele && $ele[0] && $ele.jquery) {
				return $ele[0].getBoundingClientRect();
			}
			return {};
		},
	},
	// 默认字体大小比例       ( ppt画布短边 ÷ 默认字体大小 ÷ 2 = 默认字体大小是 16 )
	page_font_size_scale: 16, // ppt 910 * 512    512 ÷ 16 ÷ 2 = 16
	// 画布缩放比例
	page_scale: 1,
	// 获取画布节点，返回画布节点（增强统一性）
	get_canvas_page: function () {
		return $('#page_contain #edit_page');
	},
	// 获取元素
	get_element: function (id) {
		// 查到组合元素则返回组合元素
		let group = base_opt.get_canvas_page().find(`.ele_item[data-group="${id}"]`);
		if (group.length) {
			return group;
		}
		return base_opt.get_canvas_page().find(`#${id}.ele_item`);
	},
	// 获取组合元素
	get_group_element: function (ele) {
		let $ele = ele;
		let group = $ele.attr('data-group');
		if ($ele.hasClass('ele_item') && group) {
			let page = base_opt.get_canvas_page();
			$ele = page.find(`.ele_item[data-group="${group}"]`);
		}
		return $ele;
	},
	// 获取画布内过滤后的元素，不限参数个数
	get_filter_element: function () {
		let page = base_opt.get_canvas_page();
		let $ele = page.find('.ele_item');
		let params = Array.from(arguments);
		for (let i = 0; i < params.length; i++) {
			let item = params[i];
			if (typeof item !== 'string') {
				continue;
			}
			switch (item) {
				case 'lock':
					$ele = $ele.not('.lock');
					break;
				case 'checked':
					$ele = $ele.not('.checked');
					break;
			}
		}
		return $ele;
	},
	// 获取选中的元素，返回已选中元素，组元素，元素类型，锁定状态，以及其他元素（增强统一性）
	get_checked_element: function () {
		let result = {};
		let page = base_opt.get_canvas_page();
		let $checked = page.find('.ele_item.checked');
		let group = $checked.attr('data-group');
		let type = $checked.attr('data-type');
		let lock = $checked.hasClass('lock');
		if ($checked.length > 1) {
			type = 'group';
			$checked.each((i, item) => {
				if (lock) {
					return false;
				}
				lock = $(item).hasClass('lock');
			});
		}
		if (group) {
			result.group = page.find(`.ele_item[data-group="${group}"]`);
		}
		result.type = type;
		result.lock = lock;
		result.element = $checked;
		return result;
	},
	// 获取选中元素按类型区分，返回整理后的数组和jq
	get_checked_type_element: function () {
		let result = [];
		let temp_group_uuid = {};
		let $checked = base_opt.get_canvas_page().find('.ele_item.checked');
		$checked.each((i, ele) => {
			let $ele = $(ele);
			let group = $ele.attr('data-group');
			if (group) {
				if (!temp_group_uuid[group]) {
					result.push(base_opt.get_group_element($ele));
					temp_group_uuid[group] = true;
				}
			} else {
				result.push($ele);
			}
		});
		return {
			format: result,
			origin: $checked,
		};
	},
	// 获取节点通用信息
	get_common_message: function(ele){
		// 错误状态判断
		if(!ele || ele.length === 0) {
			console.error('params type error');
			return false;
		}
		let result;
		// 单选情况
		if(ele.length === 1){
			result = base_opt.compute_ele_offset(ele);
			result.type = ele.attr('data-type');
			result.lock = ele.hasClass('lock');
		}
		// 多选情况
		else{
			result = base_opt.compute_ele_seat(ele);
			result.type = 'group';
			result.lock = ele.hasClass('lock');
		}
		return result;
	},
	// 获取节点 transform 数据 type: String (translate || rotate || scale) || 空值
	get_transform: function(ele, type){
		let $rotate = ele.find('.ele_rotate').eq(0),
			$scale = ele.find('.ele_scale').eq(0),
			rotate = $rotate.attr('data-rotate').split(',').map(item => Number(item)),
			scale = $scale.attr('data-scale').split(',').map(item => Number(item)),
			x = base_opt.fn.unit_2_px(ele[0].style.left),
			y = base_opt.fn.unit_2_px(ele[0].style.top),
			result;
		switch (type) {
			case 'translate':
				result = [x,y];
				break;
			case 'rotate':
				result = rotate;
				break;
			case 'scale':
				result = scale;
				break;
			default:
				result = {
					translate: [x, y],
					rotate: rotate,
					scale: scale,
				};
				break;
		}
		return result;
	},
	// 获取 svg transform 数据
	get_svg_transform: function (ele, type) {
		if (!type) return;
		let str = ele.attr("transform"),
			re = /\s*((scale|matrix|rotate|translate)\s*\(.*?\))\s*,?\s*/,
			m = true,
			transform = {};
		if (!str) return;
		while (m) {
			m = str.match(re); //正则匹配
			str = str.replace(re, "");
			if (m && m[1]) {
				let x = m[1],
					bits = x.split(/\s*\(/),
					name = bits[0],
					val_bits = bits[1].match(/\s*(.*?)\s*\)/);
				val_bits[1] = val_bits[1].replace(/(\d)-/g, "$1 -");
				let val_arr = val_bits[1].split(/[, ]+/);
				$.each(val_arr, function (i, item) {
					val_arr[i] = parseFloat(item);
				});
				if (undefined == transform[name] || null == transform[name]) {
					transform[name] = val_arr;
				}
			}
		}
		if (!transform) return;
		if (type === 'scale' && transform[type].length === 1) transform[type].push(transform[type][0]);
		return transform[type];
	},
	// 获取节点定位 & 尺寸（单选情况）
	compute_ele_offset: function(ele){
		// 错误状态判断
		if(!ele || !ele.length) {
			console.error('params type error');
			return false;
		}
		let page_rect = base_opt.fn.get_client_rect(base_opt.get_canvas_page());// 获取画布可视 定位 尺寸
		let page_scale = base_opt.page_scale;
		let transform = base_opt.get_transform(ele);
		let scale = transform.scale;
		let rotate = transform.rotate[0];
		let w = 0;
		let h = 0;
		let result = {};
		switch(ele.attr('data-type')){
			case 'line':
				let $line = ele.find('.line')[0];
				if ($line) {
					let linebox = $line.getBBox();
					w = linebox.width;
					h = linebox.height;
				}
				break;
			default:
				let $ele_rect = ele.find('.ele_rotate')[0];
				w = base_opt.fn.unit_2_px_exact($ele_rect.style.width);
				h = base_opt.fn.unit_2_px_exact($ele_rect.style.height);
				break;
		}
		let x = transform.translate[0];
		let y = transform.translate[1];
		// 赋值相对画布元素数据 -> 未缩放情况
		result.page = {
			w: Number((w).toFixed(4)),
			h: Number((h).toFixed(4)),
			x: Number((x).toFixed(4)),
			y: Number((y).toFixed(4)),
			rotate: rotate,
			scale: scale,
		};
		// 赋值相对屏幕元素数据 -> 未缩放情况
		result.window = {
			w: Number((w).toFixed(4)),
			h: Number((h).toFixed(4)),
			x: Number((x + page_rect.left).toFixed(4)),
			y: Number((y + page_rect.top).toFixed(4)),
			rotate: rotate,
			scale: scale,
		};
		// 赋值相对画布元素数据 -> 已缩放情况
		result.page_scaled = {
			w: Number((w * page_scale).toFixed(4)),
			h: Number((h * page_scale).toFixed(4)),
			x: Number((x * page_scale).toFixed(4)),
			y: Number((y * page_scale).toFixed(4)),
			rotate: rotate,
			scale: scale,
		};
		// 赋值相对屏幕元素数据 -> 已缩放情况
		result.window_scaled = {
			w: Number((w * page_scale).toFixed(4)),
			h: Number((h * page_scale).toFixed(4)),
			x: Number((x * page_scale + page_rect.left).toFixed(4)),
			y: Number((y * page_scale + page_rect.top).toFixed(4)),
			rotate: rotate,
			scale: scale,
		};
		return result;
	},
	// 获取节点占位即矩形端点大小（多选情况）
	compute_ele_seat: function(ele){
		// 错误状态判断
		if(!ele || !ele.length) {
			console.error('params type error');
			return;
		}
		let page_rect = base_opt.fn.get_client_rect(base_opt.get_canvas_page());
		let page_scale = base_opt.page_scale;
		let t;
		let r;
		let b;
		let l;
		let result = {};
		// 遍历节点
		ele.each((i, el) => {
			let $item = $(el);
			switch($item.attr('data-type')){
				case 'line':
					$item = $item.find('.line');
					break;
				default:
					$item = $item.find('.ele_rotate');
					break;
			}
			let item_rect = $item[0].getBoundingClientRect();
			// 判断端点
			t = typeof t === 'undefined' ? item_rect.top : item_rect.top < t ? item_rect.top : t;
			r = typeof r === 'undefined' ? item_rect.right : item_rect.right > r ? item_rect.right : r;
			b = typeof b === 'undefined' ? item_rect.bottom : item_rect.bottom > b ? item_rect.bottom : b;
			l = typeof l === 'undefined' ? item_rect.left : item_rect.left < l ? item_rect.left : l;
		});
		let w = r - l;
		let h = b - t;
		// 赋值相对屏幕元素数据 -> 已缩放情况
		result.window_scaled = {
			w: Number((w).toFixed(4)),
			h: Number((h).toFixed(4)),
			x: Number((l).toFixed(4)),
			y: Number((t).toFixed(4)),
			rotate: 0
		};
		// 赋值相对画布元素数据 -> 已缩放情况
		result.page_scaled = {
			w: Number((w).toFixed(4)),
			h: Number((h).toFixed(4)),
			x: Number((l - page_rect.left).toFixed(4)),
			y: Number((t - page_rect.top).toFixed(4)),
			rotate: 0,
		};
		// 赋值相对屏幕元素数据 -> 未缩放情况
		result.window = {
			w: Number((w / page_scale).toFixed(4)),
			h: Number((h / page_scale).toFixed(4)),
			x: Number(((l - page_rect.left) / page_scale + page_rect.left).toFixed(4)),
			y: Number(((t - page_rect.top) / page_scale + page_rect.top).toFixed(4)),
			rotate: 0,
		};
		// 赋值相对画布元素数据 -> 未缩放情况
		result.page = {
			w: Number((w / page_scale).toFixed(4)),
			h: Number((h / page_scale).toFixed(4)),
			x: Number(((l - page_rect.left) / page_scale).toFixed(4)),
			y: Number(((t - page_rect.top) / page_scale).toFixed(4)),
			rotate: 0,
		};
		return result;
	},
	// 相对窗口坐标转化为相对画布坐标{data -> {x,y}, scaled: 当前值是否已缩放（Boolean）}
	window_2_page_offset:function(data, scaled = false){
		if(!data || !data.x || !data.y) {
			console.error('params type error');
			return false;
		}
		let page_rect = base_opt.fn.get_client_rect(base_opt.get_canvas_page());
		let page_scale = base_opt.page_scale;
		let result = {};
		// 判断当前坐标已经过画布缩放
		if(scaled){
			result.normal = {
				x: Number(((data.x - page_rect.left) / page_scale).toFixed(4)),
				y: Number(((data.y - page_rect.top) / page_scale).toFixed(4)),
				w: Number((data.width / page_scale).toFixed(4)),
				h: Number((data.height / page_scale).toFixed(4)),
			};
			result.scale = {
				x: Number((data.x - page_rect.left).toFixed(4)),
				y: Number((data.y - page_rect.top).toFixed(4)),
				w: Number((data.width).toFixed(4)),
				h: Number((data.height).toFixed(4)),
			};
		} else {
			result.normal = {
				x: Number((data.x - page_rect.left).toFixed(4)),
				y: Number((data.y - page_rect.top).toFixed(4)),
				w: Number((data.width).toFixed(4)),
				h: Number((data.height).toFixed(4)),
			};
			result.scale = {
				x: Number(((data.x - page_rect.left) * page_scale).toFixed(4)),
				y: Number(((data.y - page_rect.top) * page_scale).toFixed(4)),
				w: Number((data.width * page_scale).toFixed(4)),
				h: Number((data.height * page_scale).toFixed(4)),
			};
		}
		return result;
	},
	// 设置节点偏移量
	set_translate: function(ele, x, y){
		let css = {};
		if (!isNaN(x)) {
			css['left'] = `${Number(x).toFixed(3)}px`;
		}
		if (!isNaN(y)) {
			css['top'] = `${Number(y).toFixed(3)}px`;
		}
		ele.css(css);
	},
	// 设置节点旋转
	set_rotate: function(ele, deg){
		if (isNaN(deg)) {
			return;
		}
		let $rotate = ele.find('.ele_rotate'),
			old_rotate = $rotate.attr('data-rotate').split(',');
		old_rotate[0] = deg;
		$rotate.attr('data-rotate', old_rotate.join(',')).css({transform: `rotate(${deg}deg)`});
    },
	// 渐变数据转css样式
    gradient_obj_2_style: function (color) {
        let {code, direction, rotate, type} = color;
		if (!code || !code.length) {
            return '';
        }
		let cssColor = ``;
		let colorArr = [];
		code.forEach(item => {
			let rgbaColor = base_opt.fn.color_exchange_function('rgba', item.color, '', item.opacity / 100);
			let colorItem = `${rgbaColor} ${item.offset}%`;
			colorArr.push(colorItem);
		});
		switch(type) {
			// 线性渐变
			case `linear`:
				cssColor = `${type}-gradient(${rotate}deg, ${colorArr.join()})`;
				break;
			// 径向渐变
			case `radial`:
				cssColor = `${type}-gradient(ellipse at ${direction.split('_').join(' ')}, ${colorArr.join()})`;
				break;
		}
		return cssColor;
    },
    // 背景数据转css样式（表格&文档页。后续抽取和渲染文本元素背景色时，直接调取以下两个方法）
    background_obj_2_style: function(data){
        if (!data) {
            return '';
        }
        let background = base_opt.fn.clone_object(data);
        let color_data = background.color;
        let image_data = background.image;
		let style = "background-color: #ffffff;";
        // 错误拦截
        if (typeof background === 'string') {
            try {
                background = JSON.parse(background);
            } catch (error) {
                return style;
            }
        }
        // 背景图
        if (image_data && image_data.src) {
			if (!color_data) {
				color_data = '#ffffff';
			}
            if (image_data.type === 'cover') {
                let width = '100%';
                let height = '100%';
                let position = 'left top';
                // 旧数据处理0
                if (image_data.width && image_data.height){
                    width = `${image_data.width}px`;
                    height = `${image_data.height}px`;
                    position = 'center center';
                }
                style = `background-color:${color_data}; background-image:url(${image_data.src}); background-position:${position}; background-size:${width} ${height}; background-repeat:no-repeat;`;
			} else {
                style = `background-color:${color_data}; background-image:url(${image_data.src}); background-repeat:repeat;`;
            }
        } else {
			if (!color_data) {
				color_data = 'transparent';
			}
            if (background.type === 'color') {
				style = `background-color:${color_data}; background-image:none;`;
            }
            if (background.type === 'gradient') {
                let g_opt = background.color;
                let code_list = background.color.code;
                let slider_color = '';
                if (g_opt.type === 'linear') {
                    slider_color = `${g_opt.type}-gradient(${g_opt.rotate}deg`;
                } else {
                    let direction = g_opt.direction || 'center';
                    if (direction.indexOf('_') > 0) {
                        direction = direction.replace('_', " ");
                    } else {
                        direction = 'center center';
                    }
                    slider_color = `${g_opt.type}-gradient(circle at ${direction}`;
                }
                $.each(code_list, (index, item) => {
                    let color = base_opt.fn.color_exchange_function('rgba', item.color, '', Number(item.opacity) / 100);
                    slider_color += `, ${color} ${item.offset}%`;
				});
				if (slider_color.indexOf('(') >= 0) {
					slider_color += ')';
				}
				style = `background-color:transparent; background-image:${slider_color};`;
            }
        }
        return style;
    },
    // 背景css样式转数据（文本&表格&文档页）
    background_style_2_obj: function (dom,is_page) {
        // 错误拦截
        if(!dom || dom.length <= 0) {
            console.error('params type error');
            return {
                type:'color',
                color: '#ffffff',
                image: null,
            };
        };
        let bg_color = dom[0].style.backgroundColor;
        let bg_image = dom[0].style.backgroundImage;
        let background = {};
        bg_color = bg_color === 'rgba(0, 0, 0, 0)' ? 'transparent' : base_opt.fn.color_exchange_function('rgb', bg_color);
        switch (true) {
            // 图片
            case bg_image.indexOf('url') >= 0:
                let image_type = is_page && dom.attr('data-imagetype') ? dom.attr('data-imagetype') : 'image';
                background = {
                    type: image_type,
                    color: bg_color || '#ffffff',
                    image: {
                        type: dom.css('background-repeat') === 'repeat' ? 'repeat' : 'cover',
                        src: bg_image.slice(bg_image.indexOf('(') + 2, bg_image.indexOf(')') - 1),
                    },
                };
                break;
            // 渐变色
            case bg_image.indexOf('gradient') >= 0:
                let code_list = [];
                $.each(bg_image.split(', r'), (index, item) => {
                    let code = {};
                    if (item.indexOf('%') >= 0) {
                        let color = "r" + item.slice(0, item.indexOf(")") + 1);
                        let color_opt = base_opt.fn.color_exchange_function('rgb', color);
                        code = {
                            color: color_opt.color || color_opt,
                            opacity: color_opt.opacity * 100 || 100,
                            offset: `${item.slice(item.indexOf(')') + 2, item.indexOf('%'))}`,
                        };
                        code_list.push(code);
                    }
                });
                background = {
                    type: 'gradient',
                    color: {
                        type: bg_image.indexOf('linear') >= 0 ? 'linear' : 'radial',
                        rotate: bg_image.indexOf('linear') >= 0 ? bg_image.slice(bg_image.indexOf('(') + 1, bg_image.indexOf('deg')) : 0,
                        direction: dom.attr('data-radialtype') || '',
                        code: code_list,
                    },
                    image: null,
                };
                break;
            // 纯色
            default:
                background = {
                    type: 'color',
                    color: bg_color,
                    image: null,
                };
                break;
        }
        return background;
	},
	// 获取边框类型对应的stroke-dasharray值
	get_dasharray: function(type, width) {
		let dasharray;
 		switch (+type) {
			// dashed
			case 8:
				dasharray = ((width ==  0) ? '0,0' : `${(width / 2) * 4},${(width / 2) * 3}`);
				break;
			// dashed1
			case 9:
				dasharray = ((width ==  0) ? '0,0' : `${(width / 2) * 6},${(width / 2) * 3}`);
				break;
			// dashed2
			case 10:
				dasharray = ((width ==  0) ? '0,0' : `${(width / 2) * 4},${(width / 2) * 3},${(width / 2)},${(width / 2) * 3}`);
				break;
			// dashed3
			case 11:
				dasharray = ((width==  0) ? '0,0' : `${(width / 2) * 7},${(width / 2) * 3}`);
				break;
			// dashed4
			case 12:
				dasharray = ((width ==  0) ? '0,0' : `${(width / 2) * 7},${(width / 2) * 3},${(width / 2)},${(width / 2) * 3}`);
				break;
			// dashed5
			case 13:
				dasharray = ((width ==  0) ? '0,0' : `${(width / 2) * 7},${(width / 2) * 3},${(width / 2)},${(width / 2) * 3},${(width / 2)},${(width / 2) * 3}`);
				break;
			// dotted
			case 16:
				dasharray = ((width == 0) ? '0,0' : `0,${width * 4}`);
				break;
			default:
				dasharray = '';
				break;
		}
		return dasharray
	},
	// 获取画布短边
	getPageShortSide(){
		let page_rect = base_opt.fn.get_client_rect(base_opt.get_canvas_page()); // 获取画布可视 定位 尺寸
		let page_w = Math.round(page_rect.width / base_opt.page_scale);
		let page_h = Math.round(page_rect.height / base_opt.page_scale);
		return page_w > page_h ? page_h : page_w; // 画布短边
	}
};
export default base_opt;