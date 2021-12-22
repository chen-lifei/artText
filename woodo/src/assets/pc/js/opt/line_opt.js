import base_opt from '@/assets/pc/js/opt/base_opt.js';
import {line_marker_list, draw_line_path} from '@/assets/pc/js/opt/line_edit_opt.js';
const {parseSVG, makeAbsolute} = require('svg-path-parser');

let line_opt = {
	// 形状元素模板
	template: {
		id: '',
		type: 'line',
		group: null,
		lock: false,
		opacity: 1,
		translate: '0,0',
		rotate: '0,0,0',
		scale: '1,1',
		border_c: '#000000',
		border_w: 1,
		border_s: 0,
		border_o: 100,
		line: '',					// 修改为存储 path d 属性
		line_class: 'straight',		// straight=直线 fold=折线 curve=曲线 custom=自由线条
		path_l: 'line_path_01',
		path_r: 'line_path_01',
		animation: [],
	},
	// 应用的模板
	using_data: {
		border_c: null,
		border_s: null,
		path_l: null,
		path_r: null,
		line_class: '',
	},
	// 初始化
	init: function(){
		let base = Object.assign({}, base_opt);
		return Object.assign(base, this);
	},
	// 选中方法
	select: function(ele){
		// 错误状态判断
		if(!ele || ele.length !== 1) {
			console.error('params type error');
			return false;
		}
		// 更新左侧栏数据
		let base_msg = base_opt.get_common_message(ele).page,
			line_msg = this.get_edit_message(ele),
			result = Object.assign(base_msg, line_msg);
		result.w = Math.round(result.w);
		result.h = Math.round(result.h);
		result.x = Math.round(result.x);
		result.y = Math.round(result.y);
		ele.addClass('checked');
		return result;
	},
	// 获取左侧栏面板数据
	get_edit_message: function(ele){
		// 错误状态判断
		if(!ele || ele.length !== 1) {
			console.error('params type error');
			return false;
		}
		let $line = ele.find('.line'),
			border_w = $line.attr('stroke-width') * 2,
			border_c = base_opt.fn.color_exchange_function('rgb',$line.attr('stroke')),
			border_s = $line.attr('data-border_s'),
			border_o = $line.attr('stroke-opacity') * 100,
			result = {};
		switch (border_s) {
			case '0':
				border_s = 'solid';
				break;
			case '16':
				border_s = 'dotted';
				break;
			case '8':
				border_s = 'dashed';
				break;
			case '9':
				border_s = 'dashed1';
				break;
			case '10':
				border_s = 'dashed2';
				break;
			case '11':
				border_s = 'dashed3';
				break;
			case '12':
				border_s = 'dashed4';
				break;
			case '13':
				border_s = 'dashed5';
				break;
		}
		result.border_w = Number(border_w);
		result.border_s = border_s;
		result.border_c = border_c;
		result.border_o = border_o;
		result.line_left = $line.attr('data-path_l');
		result.line_right = $line.attr('data-path_r');
		result.not_w = true;
		result.not_h = true;
		result.not_rotate = true;
		return result;
	},
	// 线条 x1 y1 x2 y2 数据转 path d属性，线条头尾样式旧数据处理
	line_to_path: function (ele) {
		ele.rect = {
			width: 24,
			height: 24,
		};
		// 线条实体
		if (typeof ele.line === 'object') {
			ele.line = `M${ele.line.x1},${ele.line.y1}L${ele.line.x2},${ele.line.y2}`;
			ele.rect = {
				width: Math.abs(ele.line.x2 - ele.line.x1) || ele.border_w * 2,
				height: Math.abs(ele.line.y2 - ele.line.y1) || ele.border_w * 2,
			};
		} else if (typeof ele.line === 'string') {
			// 计算线条占用空间
			let commands = parseSVG(ele.line);
			if (commands.length) {
				ele.rect = {
					width: Math.abs(commands[1].x - commands[0].x) || ele.border_w * 2,
					height: Math.abs(commands[1].y - commands[0].y) || ele.border_w * 2,
				};
			}
		}
		// 线条类型
		ele.line_class = ele.line_class || 'straight';
		// 线头样式
		if (typeof ele.path_l === 'object') {
			ele.path_l = ele.path_l.type || 'line_path_01';
		}
		ele.marker_l = this.get_line_marker_data(ele.path_l);
		ele.marker_l.scale = this.line_marker_scale(ele.border_w / 2, ele.path_l);
		// 线尾样式
		if (typeof ele.path_r === 'object') {
			ele.path_r = ele.path_r.type || 'line_path_01';
		}
		// 线条透明度
		if (!ele.border_o) ele.border_o = 100;
		ele.marker_r = this.get_line_marker_data(ele.path_r);
		ele.marker_r.scale = this.line_marker_scale(ele.border_w / 2, ele.path_r);
		// 生成线条头尾箭头样式节点
		ele.marker_html = `<marker id="${ele.marker_l.id}" markerUnits="userSpaceOnUse" orient="auto" markerWidth="${ele.marker_l.w * ele.marker_l.scale}" markerHeight="${ele.marker_l.h * ele.marker_l.scale}" refx="${ele.marker_l.w * ele.marker_l.scale / 2}" refy="${ele.marker_l.h * ele.marker_l.scale / 2}">
								<path d="${ele.marker_l.d}" fill="${ele.border_c}" transform="scale(${ele.marker_l.scale}, ${ele.marker_l.scale})rotate(180,${ele.marker_l.w / 2},${ele.marker_l.h / 2})"></path>
							</marker>
							<marker id="${ele.marker_r.id}" markerUnits="userSpaceOnUse" orient="auto" markerWidth="${ele.marker_r.w * ele.marker_r.scale}" markerHeight="${ele.marker_r.h * ele.marker_r.scale}" refx="${ele.marker_r.w * ele.marker_r.scale / 2}" refy="${ele.marker_r.h * ele.marker_r.scale / 2}">
								<path d="${ele.marker_r.d}" fill="${ele.border_c}" transform="scale(${ele.marker_r.scale}, ${ele.marker_r.scale})rotate(0,${ele.marker_r.w / 2},${ele.marker_r.h / 2})"></path>
							</marker>`;
		return ele;
	},
	// 线条头尾箭头样式数据初始化
	get_line_marker_data: function (line_path) {
		let marker = line_marker_list.find(item => item.type === line_path);
		if (!marker) {
			marker = line_marker_list.find(item => item.type === 'line_path_01');
		}
		marker = base_opt.fn.clone_object(marker);
		marker.id = base_opt.fn.uuid();
		return marker;
	},
	// 线条元素 - 节点 -> 数据方法
	dom_2_ele: function(dom){
		// 错误状态判断
		if(!dom || dom.length <= 0) {
			console.error('params type error');
			return false;
		}
		let type = dom.attr('data-type'),
			transform = base_opt.get_transform(dom),
			$line = dom.find('.line'),
			obj = {};
		// 获取元素通用数据
		obj.id = dom.attr('id');
		obj.type = type;
		obj.group = dom.attr('data-group') === 'undefined' ? '' : dom.attr('data-group');
		obj.lock = dom.hasClass('lock');
		obj.link = dom.find('.ele_rotate').attr('title') && dom.find('.ele_rotate').attr('title') !== '' ? dom.find('.ele_rotate').attr('title') : null;
		obj.opacity = dom.find('.ele_rotate')[0].style.opacity ? dom.find('.ele_rotate')[0].style.opacity : 1;
		// 动画属性抽取
		let animation = {
			name: dom.attr('data-animation-name') || '',
			default: dom.attr('data-animation-default') || false,
			start: dom.attr('data-animation-start') || '',
			duration: dom.attr('data-animation-duration') || 0,
			delay: dom.attr('data-animation-delay') || 0,
			index: dom.attr('data-animation-index') ? dom.attr('data-animation-index').split(',') : [0, 0],
		};
		obj.animation = [animation];
		obj.translate = transform.translate.join(',');
		obj.rotate = transform.rotate.join(',');
		obj.scale = transform.scale.join(',');
		obj.line = $line.attr('d');
		obj.line_class = $line.attr('data-line_class');
		obj.border_w = Number($line.attr('stroke-width')) * 2;
		obj.border_c = $line.attr('stroke');
		obj.border_s = Number($line.attr('data-border_s'));
		obj.border_o = Number($line.attr('stroke-opacity')) * 100;
		obj.path_l = $line.attr('data-path_l');
		obj.path_r = $line.attr('data-path_r');
		return obj;
	},
	// 线条元素 - 数据 -> 节点方法
	ele_2_dom:function(obj, is_str){
		// 错误状态判断
		if(!obj || typeof obj !== 'object' || !obj.id) {
			console.error('params type error');
			return false;
		}
		let ele = base_opt.fn.clone_object(obj);
		// 线条旧数据处理
		ele = this.line_to_path(ele);
		//1、数据处理
		ele.lock = (ele.lock ? 'lock' : '');
		ele.group = (ele.group ? ele.group : '');
		let translate_arr = ele.translate.split(',');
		ele.translate_x = translate_arr[0];
		ele.translate_y = translate_arr[1];
		ele.rotate = (ele.rotate ? ele.rotate : '0,0,0');
		ele.link = ((!ele.link || ele.link == null) ? '' : base_opt.fn.escapeHtmlAttrString(ele.link));
		ele.scale = (ele.scale ? ele.scale : '1,1');
		ele.border_c = ele.border_c || '#000000';
		ele.border_w = Number(ele.border_w);
		ele.line_width = ele.border_w / 2;
		ele.out_line_width = ele.line_width < 20 ? 20 : ele.line_width;
		ele.border_s = Number(ele.border_s);
		ele.border_o = Number(ele.border_o);
		ele.line_dasharray = base_opt.get_dasharray(ele.border_s, ele.border_w)
		ele.line_linecap = ((ele.border_s === 16) ? 'round' : '');
		ele.line_linejoin = ((ele.border_s === 16) ? 'round' : '');
		ele.line_miterlimit = ((ele.border_s === 16) ? 10 : '');
		let animation_name = '';
		let animation_default = false;
		let animation_start = '';
		let animation_duration = 0;
		let animation_delay = 0;
		let animation_index = '0,0';
		if (ele.animation && ele.animation.length > 0) {
			animation_name = ele.animation[0].name;
			animation_default = ele.animation[0].default;
			animation_start = ele.animation[0].start;
			animation_duration = ele.animation[0].duration;
			animation_delay = ele.animation[0].delay;
			if (Array.isArray(ele.animation[0].index)) {
				animation_index = ele.animation[0].index.join();
			}
		}
		//2、模版字符串渲染
		let html = `<div id="${ele.id}"
						class="ele_item ${ele.lock}"
						style="left:${ele.translate_x}px; top:${ele.translate_y}px;"
						data-type="${ele.type}"
						data-group="${ele.group}"
						data-animation-name="${animation_name}"
                        data-animation-default="${animation_default}"
                        data-animation-start="${animation_start}"
                        data-animation-duration="${animation_duration}"
                        data-animation-delay="${animation_delay}"
                        data-animation-index="${animation_index}"
					>
						<div class="ele_rotate" style="opacity:${ele.opacity};" data-rotate="${ele.rotate}" title="${ele.link}">
							<div class="ele_scale" data-scale="${ele.scale}">
								<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" overflow="visible" width="24" height="24">
									<g>
										<defs>${ele.marker_html}</defs>
										<path class="line" d="${ele.line}" fill="none" stroke="${ele.border_c}" stroke-width="${ele.line_width}" stroke-opacity="${ele.border_o / 100}" stroke-dasharray="${ele.line_dasharray}" stroke-linecap="${ele.line_linecap}" stroke-linejoin="${ele.line_linejoin}" stroke-miterlimit="${ele.line_miterlimit}" marker-start="url(#${ele.marker_l.id})" marker-end="url(#${ele.marker_r.id})" data-path_l="${ele.path_l}" data-path_r="${ele.path_r}" data-line_class="${ele.line_class}" data-border_s="${ele.border_s}"></path>
										<path class="outline" d="${ele.line}" fill="none" stroke="transparent" stroke-width="${ele.out_line_width}"></path>
									</g>
								</svg>
							</div>
						</div>
					</div>`;
		if(is_str){
			return html;
		}
		return $(html);
	},
	// 生成方法
	build: function(obj){
		// 错误状态判断
		if(!obj || typeof obj !== 'object') {
			console.error('params type error');
			return false;
		}
		let template = base_opt.fn.clone_object(this.template),
			data = base_opt.fn.clone_object(this.using_data),
			param = Object.assign(template, obj, data),
			$dom = this.ele_2_dom(param);
		return $dom.prop('outerHTML');
	},
	// 设置尺寸
	set_size: function(ele, data) {
		// 错误状态判断
		if(!ele || ele.length !== 1 || !data || (!data.scale_x && !data.scale_y) ) {
			console.error('params type error');
			return false;
		}
		let $line = ele.find('.line');
		let $outline = ele.find('.outline');
		let commands = parseSVG($line.attr('d'));
		// 绝对坐标转换
		makeAbsolute(commands);
		let first_point = commands[0];
		let last_point = commands[commands.length - 1];
		let x1 = first_point.x;
		let y1 = first_point.y;
		let x2 = last_point.x;
		let y2 = last_point.y;
		let nx1, nx2, ny1, ny2;
		let scale_x = data.scale_x;
		let	scale_y = data.scale_y;
		// x轴位移
		if (x1 > x2) {
			nx1 = x1 * scale_x;
			nx2 = x2;
		} else {
			nx1 = x1;
			nx2 = x2 * scale_x;
		}
		// y轴位移
		if (y1 > y2) {
			ny1 = y1 * scale_y;
			ny2 = y2;
		} else {
			ny1 = y1;
			ny2 = y2 * scale_y;
		}
		// 生成线条path
		let line_class = $line.attr('data-line_class');
		// 同步调整编辑点
		let option_point = [];
		let ep = commands[1];
		if (ep) {
			if (line_class === 'fold') {
				option_point = [(ep.x * scale_x)];
			}
			if (line_class === 'curve') {
				option_point = [(ep.x1 * scale_x), (ep.y1 * scale_y), (ep.x2 * scale_x), (ep.y2 * scale_y)];
			}
		}
		let path_d = draw_line_path(line_class, {
			x1: nx1,
			y1: ny1,
			x2: nx2,
			y2: ny2,
		}, option_point);
		$line.attr('d', path_d);
		$outline.attr('d', path_d);
	},
	// 设置边框颜色
	set_border_color: function(ele, data){
		// 错误状态判断
		if(!ele || ele.length !== 1 || typeof data !== 'string') {
			console.error('params type error');
			return false;
		}
		let $line = ele.find('.line');
		$line.attr('stroke', data);
		this.update_line_marker(ele, 'color');
	},
	// 设置边框宽度
	set_border_width: function(ele, data){
		// 错误状态判断
		if(!ele || ele.length !== 1 || isNaN(Number(data))) {
			console.error('params type error');
			return false;
		}
		let $line = ele.find('.line');
		let line_w = data / 2;
		let bs = Number($line.attr('data-border_s'));
		let dasharray = base_opt.get_dasharray(bs, line_w);
		// 设置宽度
		$line.attr('stroke-width', line_w);
		ele.find('.outline').attr('stroke-width', line_w < 8 ? 8 : line_w);
		// 边框样式同步宽度
		$line.attr({
			'stroke-dasharray': dasharray,
			'stroke-linecap': bs === 16 ? 'round' : '',
			'stroke-linejoin': bs === 16 ? 'round' : '',
			'stroke-miterlimit': bs === 16 ? 10 : '',
		});
		this.update_line_marker(ele, 'scale');
	},
	// 设置边框透明度
	set_border_opacity: function(ele, data){
		// 错误状态判断
		if(!ele || ele.length !== 1 || isNaN(Number(data))) {
			console.error('params type error');
			return false;
		}
		let $line = ele.find('.line');
		$line.attr('stroke-opacity', data / 100);
	},
	// 设置边框样式
	set_border_style: function(ele, data){
		// 错误状态判断
		if(!ele || ele.length !== 1 || !data) {
			console.error('params type error');
			return false;
		}
		let $line = ele.find('.line'),
			bw = $line.attr('stroke-width') ? $line.attr('stroke-width') * 2 : 1,
			bs;
		if(data === 'none'){
			$line.attr({
				'stroke': '',
				'stroke-width': '',
				'stroke-dasharray': '',
				'stroke-linecap': '',
				'stroke-linejoin': '',
				'stroke-miterlimit': '',
				'data-border_s': '',
			})
		}else{
			switch (data) {
				case 'solid':
					bs = 0;
					break;
				case 'dotted':
					bs = 16;
					break;
				case 'dashed':
					bs = 8;
					break;
				case 'dashed1':
					bs = 9;
					break;
				case 'dashed2':
					bs = 10;
					break;
				case 'dashed3':
					bs = 11;
					break;
				case 'dashed4':
					bs = 12;
					break;
				case 'dashed5':
					bs = 13;
					break;
			}
			let dasharray = base_opt.get_dasharray(bs, bw);
			$line.attr({
				'stroke-width': bw / 2,
				'stroke-dasharray': dasharray,
				'stroke-linecap': bs === 16 ? 'round' : '',
				'stroke-linejoin': bs === 16 ? 'round' : '',
				'stroke-miterlimit': bs === 16 ? 10 : '',
				'data-border_s': bs,
			});
		}
		this.get_edit_message(ele);
	},
	// 更换箭头风格 {type: left || right, item: object}
	set_path: function(ele, type, item){
		// 错误情况判断
		if(!ele || ele.length !== 1 || typeof type !== 'string' || typeof item !== 'object') {
			console.error('params type error');
			return false;
		}
		let $line = ele.find('.line');
		switch (type) {
			// 设置左箭头
			case 'left':
				if (item.type === $line.attr('data-path_l')) {
					return;
				}
				$line.attr('data-path_l', item.type);
				break;
			// 设置右箭头
			case 'right':
				if (item.type === $line.attr('data-path_r')) {
					return;
				}
				$line.attr('data-path_r', item.type);
				break;
		}
		// 更新箭头dom
		this.update_line_marker(ele, type, item);
	},
	// 线条头尾箭头样式缩放自适应
	line_marker_scale: function (line_width, cls) {
		let min = 0.5;
		if (isNaN(line_width)) {
			return min;
		}
		let r = this.get_line_marker_data(cls);
		let scale = line_width * 3 / (r.w || 10);
		if (scale < min) {
			scale = min;
		}
		return scale;
	},
	// 更新线条头尾箭头样式
	update_line_marker: function (ele, type, data) {
		let that = this;
		if(!ele || ele.length !== 1) {
			console.error('params type error');
			return false;
		}
		let $line = ele.find('.line');
		let line_width = Number($line.attr('stroke-width'));
		let path_l = that.get_line_marker_data($line.attr('data-path_l'));
		let path_r = that.get_line_marker_data($line.attr('data-path_r'));
		let $path_l = $(`#${$line.attr('marker-start').slice(5, -1)}`);
		let $path_r = $(`#${$line.attr('marker-end').slice(5, -1)}`);
		switch (type) {
			// 同步颜色
			case 'color':
				$path_l.find('path').attr('fill', $line.attr('stroke'));
				$path_r.find('path').attr('fill', $line.attr('stroke'));
				break;
			// 修改样式
			case 'left':
				if (typeof data === 'object') {
					if ($path_l[0]) {
						let l_scale = that.line_marker_scale(line_width, path_l);
						$path_l[0].setAttribute('markerWidth', data.w * l_scale);
						$path_l[0].setAttribute('markerHeight', data.h * l_scale);
						$path_l[0].setAttribute('refX', data.w * l_scale / 2);
						$path_l[0].setAttribute('refY', data.h * l_scale / 2);
						$path_l.find('path').attr('transform', `scale(${l_scale}, ${l_scale})rotate(180, ${data.w / 2}, ${data.h / 2})`);
					}
					$path_l.find('path').attr('d', data.d);
				}
				break;
			case 'right':
				if (typeof data === 'object') {
					if ($path_r[0]) {
						let r_scale = that.line_marker_scale(line_width, path_r);
						$path_r[0].setAttribute('markerWidth', data.w * r_scale);
						$path_r[0].setAttribute('markerHeight', data.h * r_scale);
						$path_r[0].setAttribute('refX', data.w * r_scale / 2);
						$path_r[0].setAttribute('refY', data.h * r_scale / 2);
						$path_r.find('path').attr('transform', `scale(${r_scale}, ${r_scale})rotate(0, ${data.w / 2}, ${data.h / 2})`);
					}
					$path_r.find('path').attr('d', data.d);
				}
				break;
			// 仅适应尺寸
			case 'scale':
				if ($path_l[0]) {
					let l_scale = that.line_marker_scale(line_width, path_l);
					$path_l[0].setAttribute('markerWidth', path_l.w * l_scale);
					$path_l[0].setAttribute('markerHeight', path_l.h * l_scale);
					$path_l[0].setAttribute('refX', path_l.w * l_scale / 2);
					$path_l[0].setAttribute('refY', path_l.h * l_scale / 2);
					$path_l.find('path').attr('transform', `scale(${l_scale}, ${l_scale})rotate(180, ${path_l.w / 2}, ${path_l.h / 2})`);
				}
				if ($path_r[0]) {
					let r_scale = that.line_marker_scale(line_width, path_r);
					$path_r[0].setAttribute('markerWidth', path_r.w * r_scale);
					$path_r[0].setAttribute('markerHeight', path_r.h * r_scale);
					$path_r[0].setAttribute('refX', path_r.w * r_scale / 2);
					$path_r[0].setAttribute('refY', path_r.h * r_scale / 2);
					$path_r.find('path').attr('transform', `scale(${r_scale}, ${r_scale})rotate(0, ${path_r.w / 2}, ${path_r.h / 2})`);
				}
				break;
		}
	},
};
export default line_opt;