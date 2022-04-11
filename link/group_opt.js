import base_opt from '@/assets/pc/js/opt/base_opt.js';
import text_opt from '@/assets/pc/js/opt/text_opt.js';
import line_opt from '@/assets/pc/js/opt/line_opt.js';
import shape_opt from '@/assets/pc/js/opt/shape_opt.js';
import image_opt from '@/assets/pc/js/opt/image_opt.js';
import table_opt from '@/assets/pc/js/opt/table_opt.js';
import editor_opt from '@/assets/pc/js/opt/editor.js';
import chart_opt from '@/assets/pc/js/opt/chart_opt.js';
import video_opt from '@/assets/pc/js/opt/video_opt.js';
import audio_opt from '@/assets/pc/js/opt/audio_opt.js';

let group_opt = {
	// 初始化
	init: function(){
		let base = Object.assign({}, base_opt);
		return Object.assign(base, this);
	},
	// 选中方法
	select: function(ele){
		// 错误状态判断
		if(!ele || ele.length <= 0) {
			console.error('params type error');
			return false;
		}
		// 更新左侧栏数据
		let base_msg = base_opt.get_common_message(ele).page,
			group_msg = this.get_edit_message(ele),
			result = Object.assign(base_msg, group_msg);
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
		if(!ele || ele.length <= 0) {
			console.error('params type error');
			return false;
		}
		let result = {},
			ele_msg = {},
            base_msg = {},
            background = {
                type: 'color',
                color: 'transparent',
                image: null
            },
            base_opacity,
            ele_opacity,
			ele_index = 0;
		result.is_group = true;
		result.all_text = true;
		result.group_has_text = false;
        result.shadow = {
            open: false,
            distance: 1,
            blur: 12,
            rotate: 90,
            opacity: 50,
            color: '#000000',
        }
		ele.each(function(){
			let $ele = $(this),
				ele_type = $ele.attr('data-type'),
				ele_group = $ele.attr('data-group');
			if(!ele_group || typeof ele_group === 'undefined') result.is_group = false;
			// 透明度处理
			if (ele_index === 0) base_opacity = Math.ceil($ele.find('.ele_rotate').css('opacity') * 100);
			ele_opacity = Math.ceil($ele.find('.ele_rotate').css('opacity') * 100);
            result.opacity = base_opacity === ele_opacity ? ele_opacity : 100;
            // 判断是否全部为文本元素
			if (ele_type !== 'text') result.all_text = false;
			// 判断元素类型
			switch(ele_type){
				case 'text':
					ele_msg = text_opt.get_edit_message($ele);
					if(ele_index === 0) base_msg = ele_msg;
					ele_index++;
                    result.group_has_text = true;
					result.size = base_msg.size === ele_msg.size ? ele_msg.size : 18;
					result.color = base_msg.color === ele_msg.color ? ele_msg.color : "#222222";
					result.line_height = base_msg.line_height === ele_msg.line_height ? ele_msg.line_height : 1.4;
					result.font_style = base_msg.font_style === ele_msg.font_style ? ele_msg.font_style : 'normal';
					result.font_weight = base_msg.font_weight === ele_msg.font_weight ? ele_msg.font_weight : 'normal';
					result.font_family = base_msg.font_family === ele_msg.font_family ? ele_msg.font_family : '微软雅黑';
					result.letter_spacing = base_msg.letter_spacing === ele_msg.letter_spacing ? ele_msg.letter_spacing : 0;
					result.text_underline = base_msg.text_underline === ele_msg.text_underline ? ele_msg.text_underline : 'none';
					result.text_linethrough = base_msg.text_linethrough === ele_msg.text_linethrough ? ele_msg.text_linethrough : 'none';
					result.text_shadow = base_msg.text_shadow === ele_msg.text_shadow ? ele_msg.text_shadow : 'none';
                    result.hilite = base_msg.hilite === ele_msg.hilite ? ele_msg.hilite : 'none';
                    result.background = base_msg.background === ele_msg.background ? ele_msg.background : background;
                    result.ul = base_msg.ul === ele_msg.ul ? ele_msg.ul : 'none';
                    result.ol = base_msg.ol === ele_msg.ol ? ele_msg.ol : 'none';
                    // 存在边框
					let $text = $ele.find('.show_text'),
						ele_border = $text[0].style.border ? $text[0].style.border : $text.css('border');
					ele_border = ele_border.split(' ');
					if (ele_border[1] !== 'none'){
						result.border_w = 1;
						result.border_s = 'solid';
						result.border_c = background;
					}
					result.not_h = true;
                    result.not_shadow = true;
                    break;
				case 'shape':
					ele_msg = shape_opt.get_edit_message($ele);
					if(ele_index === 0) base_msg = ele_msg;
					ele_index++;
					result.group_has_text = true;
					result.size = base_msg.size === ele_msg.size ? ele_msg.size : 18;
					result.color = base_msg.color === ele_msg.color ? ele_msg.color : "#222222";
					result.line_height = base_msg.line_height === ele_msg.line_height ? ele_msg.line_height : 1.4;
					result.font_style = base_msg.font_style === ele_msg.font_style ? ele_msg.font_style : 'normal';
					result.font_weight = base_msg.font_weight === ele_msg.font_weight ? ele_msg.font_weight : 'normal';
					result.font_family = base_msg.font_family === ele_msg.font_family ? ele_msg.font_family : '微软雅黑';
					result.letter_spacing = base_msg.letter_spacing === ele_msg.letter_spacing ? ele_msg.letter_spacing : 0;
					result.text_underline = base_msg.text_underline === ele_msg.text_underline ? ele_msg.text_underline : 'none';
					result.text_linethrough = base_msg.text_linethrough === ele_msg.text_linethrough ? ele_msg.text_linethrough : 'none';
					result.text_shadow = base_msg.text_shadow === ele_msg.text_shadow ? ele_msg.text_shadow : 'none';
                    result.hilite = base_msg.hilite === ele_msg.hilite ? ele_msg.hilite : 'none';
                    result.ul = base_msg.ul === ele_msg.ul ? ele_msg.ul : 'none';
                    result.ol = base_msg.ol === ele_msg.ol ? ele_msg.ol : 'none';
                    result.background = base_msg.background === ele_msg.background ? ele_msg.background : {color: '#42464b', image: null, type: 'color'};
                    result.shadow.open = ele_msg.shadow && ele_msg.shadow.open;
					// 判断边框
					let $path = $(this).find(".ele_scale path");
					if(typeof $path.attr('stroke-dasharray') !== 'undefined'){
						result.border_w = 1;
						result.border_s = 'solid';
						result.border_c = 'transparent';
						result.border_o = 100;
                    }
					break;
				case 'line':
					result.border_w = 1;
					result.border_s = 'solid';
					result.border_c = 'transparent';
					result.border_o = 100;
					result.not_w = true;
					result.not_h = true;
					result.not_bg = true;
					result.not_rotate = true;
                    result.not_shadow = true;
                    break;
				case 'img':
					// 判断边框
					let $image_border = $(this).find(".image_border path");
					if(typeof $image_border.attr('stroke-dasharray') !== 'undefined'){
						result.border_w = 1;
						result.border_s = 'solid';
						result.border_c = 'transparent';
						result.border_o = 100;
					}
                    if (ele_msg.shadow) result.shadow.open = ele_msg.shadow.open;
                    result.not_bg = true;
					break;
				case 'table':
					ele_msg = table_opt.get_edit_message($ele);
					result.size = base_msg.size === ele_msg.size ? ele_msg.size : 12;
					result.font_family = base_msg.font_family === ele_msg.font_family ? ele_msg.font_family : '微软雅黑';
					result.border_w = ele_msg.border_w;
					result.border_s = ele_msg.border_s;
					result.border_c = ele_msg.border_c;
					result.border_o = ele_msg.border_o;
                    result.background = ele_msg.background;
					result.group_has_text = true;
					result.not_w = true;
					result.not_h = true;
					result.not_bg = true;
					result.not_rotate = true;
                    result.not_shadow = true;
                    break;
				case 'chart':
					result.not_rotate = true;
                    result.not_shadow = true;
                    result.not_border = true;
                    break;
				case 'video':
					result.not_w = true;
					result.not_h = true;
					result.not_bg = true;
					result.not_rotate = true;
                    result.not_shadow = true;
                    result.not_border = true;
                    break;
				case 'audio':
					result.not_w = true;
					result.not_h = true;
					result.not_bg = true;
                    result.not_rotate = true;
                    result.not_shadow = true;
                    result.not_border = true;
                    break;
			}
        });
		return result;
	},
	// 元素设置同步主题
	ele_sync_theme: function(doc){
		// 错误状态判断
		if(!doc || typeof doc !== 'object') {
			console.error('params type error');
			return false;
		}
		let text_data = text_opt.using_data,
			shape_data = shape_opt.using_data,
			table_data = table_opt.using_data,
			line_data = line_opt.using_data;
		// 同步文档背景色
		if(doc.background && doc.background.type === 'color'){
			table_data.background = doc.background;
		}
		// 同步文档形状颜色
		if(doc.shapeColor){
			shape_data.background = {
                type: 'color',
                color: doc.shapeColor,
                image: null
            };
			if (doc.background && doc.background.type === 'color') line_data.border_c = doc.background.color;
		}
		// 同步文档文本颜色
		if(doc.textColor){
			text_data.color = doc.textColor;
			shape_data.color = doc.textColor === doc.shapeColor ? '#ffffff' : doc.textColor;
			table_data.color = doc.textColor;
		}
		// 同步文档主题字体
		if(doc.font){
			text_data.family = doc.font;
			shape_data.family = doc.font;
			table_data.family = doc.font;
		}
	},
	// 提取节点为对象
	dom_2_ele_list: function(dom){
		let ele_list = [];
		if(!dom || dom.length <= 0) {
			return ele_list;
		}
		dom.each(function(){
			let $item = $(this),
				type = $item.attr('data-type'),
				ele_obj;
			// 判断元素类型
			switch (type) {
				case 'text':
					ele_obj = text_opt.dom_2_ele($item);
					break;
				case 'shape':
					ele_obj = shape_opt.dom_2_ele($item);
					break;
				case 'line':
					ele_obj = line_opt.dom_2_ele($item);
					break;
				case 'img':
					ele_obj = image_opt.dom_2_ele($item);
					break;
				case 'table':
					ele_obj = table_opt.dom_2_ele($item);
					break;
				case 'chart':
					ele_obj = chart_opt.dom_2_ele($item);
					break;
				case 'video':
					ele_obj = video_opt.dom_2_ele($item);
					break;
				case 'audio':
					ele_obj = audio_opt.dom_2_ele($item);
					break;
			}
			ele_list.push(ele_obj);
		});
		return ele_list;
	},
	// 提取对象为节点
	ele_list_2_dom:function(arr){
		// 错误状态判断
		if(!arr || arr.length <= 0 || typeof arr !== 'object') {
			console.error('params type error');
			return false;
		}
		let html = '';
		arr.forEach(function(item){
			// 遍历元素
			switch (item.type) {
				case 'text':
					html += text_opt.ele_2_dom(item, true);
					break;
				case 'shape':
					html += shape_opt.ele_2_dom(item, true);
					break;
				case 'table':
					html += table_opt.ele_2_dom(item, true);
					break;
				case 'img':
					html += image_opt.ele_2_dom(item, true);
					break;
				case 'line':
					html += line_opt.ele_2_dom(item, true);
					break;
				case 'chart':
					html += chart_opt.ele_2_dom(item, true);
					break;
				case 'video':
					html += video_opt.ele_2_dom(item, true);
					break;
				case 'audio':
					html += audio_opt.ele_2_dom(item, true);
					break;
			}
		});
		return html;
	},
	// 水平对齐方法
	hor_align: function(type, align_type = 'element'){
		let get_ele = base_opt.get_checked_type_element();
		let ele_format = get_ele.format;
		let ele = get_ele.origin;
		// 单元素画布对齐
		if (align_type === 'page' || ele_format.length === 1) {
			group_opt.page_align(ele, type);
			return;
		}
		let $child = $('#operate .group_child .child');
		let operate_w = base_opt.compute_ele_seat(ele).window_scaled.w;
		let page_scale = base_opt.page_scale;
		// 等间距对齐
		if (type === 'deuce') {
			if ($child.length < 3) {
				return;
			}
			// 计算全部子虚线框宽度总和
			let w_sum = $child.map((i, el) => base_opt.fn.unit_2_px(el.style.width)).toArray().reduce((t, n) => t + n);
			// 计算子虚线框间平均距离
			let average_distance = (operate_w - w_sum) / ($child.length - 1);
			// 子虚线框重排序 -> 从左到右排序
			let child_arr = $child.toArray().sort((a, b) => {
				return (base_opt.fn.unit_2_px(a.style.left) + base_opt.fn.unit_2_px(a.style.width)) - (base_opt.fn.unit_2_px(b.style.left) + base_opt.fn.unit_2_px(b.style.width));
			});
			// 遍历 子虚线框 数组，计算偏移
			let prev_end_position = 0;
			$(child_arr).each((index, el) => {
				let $el = $(el);
				let child_x = base_opt.fn.unit_2_px(el.style.left);
				let child_w = base_opt.fn.unit_2_px(el.style.width);
				let $ele = base_opt.get_group_element(base_opt.get_element($el.attr('data-id')));
				// 首尾子虚线框不移动
				if (index === 0) {
					prev_end_position += child_w;
				} else if (index < (child_arr.length - 1)) {
					// 中间 子虚线框 偏移量计算
					let after_move = prev_end_position + average_distance;
					// 计算偏移量
					let diff = (after_move - child_x) / page_scale;
					// 更新前元素结束位置
					prev_end_position += (average_distance + child_w);
					if (Math.abs(diff) < 1) {
						return;
					}
					$ele.each((i, elem) => {
						let ele_translate = base_opt.get_transform($(elem), 'translate');
						ele_translate[0] += diff;
						base_opt.set_translate($(elem), ele_translate[0], ele_translate[1]);
					});
				}
			});
			return;
		}
		// 左 中 右 对齐
		$child.each((index, el) => {
			let $el = $(el);
			let child_x = base_opt.fn.unit_2_px(el.style.left);
			let child_w = base_opt.fn.unit_2_px(el.style.width);
			let $ele = base_opt.get_group_element(base_opt.get_element($el.attr('data-id')));
			let diff = 0;
			switch (type) {
				case 'left':
					diff = child_x <= 0 ? 0 : -(child_x / page_scale);
					break;
				case 'center':
					diff = ((operate_w / 2) - (child_w / 2) - child_x) / page_scale;
					break;
				case 'right':
					diff = (operate_w - child_w - child_x) / page_scale;
					break;
			}
			if (Math.abs(diff) === 0) {
				return;
			}
			$ele.each((i, elem) => {
				let ele_translate = base_opt.get_transform($(elem), 'translate');
				ele_translate[0] += diff;
				base_opt.set_translate($(elem), ele_translate[0], ele_translate[1]);
			});
		});
	},
	// 垂直对齐方法
	ver_align: function(type, align_type){
		let get_ele = base_opt.get_checked_type_element();
		let ele_format = get_ele.format;
		let ele = get_ele.origin;
		// 单元素画布对齐
		if (align_type === 'page' || ele_format.length === 1) {
			group_opt.page_align(ele, type);
			return;
		}
		let $child = $('#operate .group_child .child');
		let operate_h = base_opt.compute_ele_seat(ele).window_scaled.h;
		let page_scale = base_opt.page_scale;
		// 等间距对齐
		if (type === 'deuce') {
			if ($child.length < 3) {
				return;
			}
			// 计算全部子虚线框宽度总和
			let h_sum = $child.map((i, el) => base_opt.fn.unit_2_px(el.style.height)).toArray().reduce((t, n) => t + n);
			// 计算子虚线框间平均距离
			let average_distance = (operate_h - h_sum) / ($child.length - 1);
			// 子虚线框重排序 -> 从左到右排序
			let child_arr = $child.toArray().sort((a, b) => {
				return (base_opt.fn.unit_2_px(a.style.top) + base_opt.fn.unit_2_px(a.style.height)) - (base_opt.fn.unit_2_px(b.style.top) + base_opt.fn.unit_2_px(b.style.height));
			});
			// 遍历 子虚线框 数组，计算偏移
			let prev_end_position = 0;
			$(child_arr).each((index, el) => {
				let $el = $(el);
				let child_y = base_opt.fn.unit_2_px(el.style.top);
				let child_h = base_opt.fn.unit_2_px(el.style.height);
				let $ele = base_opt.get_group_element(base_opt.get_element($el.attr('data-id')));
				// 首尾子虚线框不移动
				if (index === 0) {
					prev_end_position += child_h;
				} else if (index < (child_arr.length - 1)) {
					// 中间 子虚线框 偏移量计算
					let after_move = prev_end_position + average_distance;
					// 计算偏移量
					let diff = (after_move - child_y) / page_scale;
					// 更新前元素结束位置
					prev_end_position += (average_distance + child_h);
					if (Math.abs(diff) < 1) {
						return;
					}
					$ele.each((i, elem) => {
						let ele_translate = base_opt.get_transform($(elem), 'translate');
						ele_translate[1] += diff;
						base_opt.set_translate($(elem), ele_translate[0], ele_translate[1]);
					});
				}
			});
			return;
		}
		// 上 中 下 对齐
		$child.each((index, el) => {
			let $el = $(el);
			let child_y = base_opt.fn.unit_2_px(el.style.top);
			let child_h = base_opt.fn.unit_2_px(el.style.height);
			let $ele = base_opt.get_group_element(base_opt.get_element($el.attr('data-id')));
			let diff = 0;
			switch (type) {
				case 'top':
					diff = child_y <= 0 ? 0 : -(child_y / page_scale);
					break;
				case 'middle':
					diff = ((operate_h / 2) - (child_h / 2) - child_y) / page_scale;
					break;
				case 'bottom':
					diff = (operate_h - child_h - child_y) / page_scale;
					break;
			}
			if (Math.abs(diff) === 0) {
				return;
			}
			$ele.each((i, elem) => {
				let ele_translate = base_opt.get_transform($(elem), 'translate');
				ele_translate[1] += diff;
				base_opt.set_translate($(elem), ele_translate[0], ele_translate[1]);
			});
		});
	},
	// 单元素相对画布对齐
	page_align: function(ele, type){
		// 错误状态判断
		if(!ele || !ele.length) {
			return;
		}
		let $page = base_opt.get_canvas_page();
		let page_w = $page.width();
		let page_h = $page.height();
		let message = base_opt.get_common_message(ele).page;
		let x = message.x;
		let y = message.y;
		// 判断对齐类型
		switch (type) {
			case 'left':
				x = 0;
				break;
			case 'center':
				x = page_w / 2 - message.w / 2;
				break;
			case 'right':
				x = page_w - message.w;
				break;
			case 'top':
				y = 0;
				break;
			case 'middle':
				y = page_h / 2 - message.h / 2;
				break;
			case 'bottom':
				y = page_h - message.h;
				break;
			case 'center&middle':
				x = page_w / 2 - message.w / 2;
				y = page_h / 2 - message.h / 2;
				break;
		}
		// 组合元素
		if (ele.length > 1) {
			group_opt.set_group_translate(ele, x, y);
		} else {
			base_opt.set_translate(ele, x, y);
		}
	},
	// 设置节点透明度
	set_opacity: function(ele, data){
		// 错误状态判断
		if(!ele || ele.length === 0 || !data) {
			console.error('params type error');
			return false;
		}
		ele.find('.ele_rotate').css({
			'opacity': data
		})
	},
	// 设置节点层级
	set_level: {
		top: function(ele){
			// 错误状态判断
			if(!ele || ele.length <= 0) {
				console.error('params type error');
				return false;
			}
			let $clone = ele.clone(),
				$last = $('.page_contain .edit_page .ele_item:last'),
				can_move = true;
			$clone.each(function () {
				if ($(this).attr('id') === $last.attr('id')) can_move = false;
			});
			if(!can_move) return;
			ele.remove();
			$last.after($clone);
			// 需重新选中
		},
		change: function(ele, type, onlyCheck){
			// 错误状态判断
			if(!ele || ele.length <= 0 || (type !== 'up' && type !== 'down')) {
				console.error('params type error');
				return false;
			}
			let $clone = ele.clone();
			// 下移一层
			if (type === 'down') {
				let $all_ele = $('.page_contain').find('.ele_item');
				let $prev = ele.prev().first();
				if ($prev.attr('data-group')) {
					let group_id = $prev.attr('data-group'),
						prev_id = $prev.attr('id');
					if (onlyCheck) {
						$prev = $all_ele.siblings(`[data-group=${group_id}]`);
					} else {
						$($all_ele.toArray().reverse()).each(function (index, item) {
							let prev_index = '';
							if ($(this).attr('id') === prev_id) prev_index = index;
							if ($(this).attr('data-group') === group_id && index > prev_index) $prev = $(item);
						})
					}
				}
				if ($prev.length <= 0 || $prev[0].className === 'page_bg') return false;
				if (onlyCheck) return $prev;
				ele.remove();
				$prev.before($clone);
			}
			// 上移一层
			if (type === 'up') {
				let $after = ele.next().last();
				let can_move = true;
				let $all_ele = $('.page_contain').find('.ele_item');
				if ($after.length > 0 && $after.attr('data-group')) {
					let group_id = $after.attr('data-group'),
						after_id = $after.attr('id');
					if (onlyCheck) {
						$after = $all_ele.siblings(`[data-group=${group_id}]`);
					} else {
						$all_ele.each(function (index, item) {
							let after_index = '';
							if ($(this).attr('id') === after_id) after_index = index;
							if ($(this).attr('data-group') === group_id && index > after_index) $after = $(item);
						})
					}
				}
				ele.each(function () {
					if ($(this).attr('id') === $after.attr('id')) can_move = false;
				});
				if ($after.length <= 0 || !can_move) return false;
				if (onlyCheck) return $after;
				ele.remove();
				$after.after($clone);
			}
			// 需重新选中
		},
		bottom: function(ele){
			// 错误状态判断
			if(!ele || ele.length <= 0) {
				console.error('params type error');
				return false;
			}
			let $clone = ele.clone(),
				$background = $('.page_contain .edit_page .page_bg');
			ele.remove();
			$background.after($clone);
			// 需重新选中
		},
	},
	// 剪切元素
	ele_cut: function(ele,page_info){
		// 错误状态判断
		if(!ele || ele.length <= 0) {
			console.error('params type error');
			return false;
		}
		let result = this.ele_copy(ele,page_info);
		ele.each((index, item)=>{
			if ($(item).attr('data-type') !== 'chart') {
				return;
			}
			chart_opt.destroy_instance($(item));
		});
		ele.remove();
		return result;
	},
	// 复制元素
	ele_copy: function(ele,page_info){
		// 错误状态判断
		if(!ele || ele.length <= 0) {
			console.error('params type error');
			return false;
		}
		let group_arr = [],
			ele_list, result;
		// 获取节点对应元素对象数据
		ele_list = this.dom_2_ele_list(ele);
		ele_list.forEach(function(item){
			if(item.group && item.group !== '' && group_arr.indexOf(item.group) < 0) group_arr.push(item.group);
		});
		//单个元素复制，去除组合状态
		if(ele_list.length==1){
			ele_list[0].group="";
			group_arr=[];
		}
		result = {pageUuid:page_info.uuid,list: JSON.stringify(ele_list), group: group_arr};
		return result;
	},
	// 粘贴元素 obj:{list: array, group: array},deviation: 是否设置偏差
	ele_paste: function(that, obj, deviation){
		// 错误状态判断
		if(!obj || !obj.list || typeof obj.list !== 'object' || obj.list.length <= 0) {
			console.error('params type error');
			return false;
		}
		let ele_list = obj.list,
			o_group = obj.group,
			n_group = [],
			ele_html, t, l;
		// 多选元素
		if (ele_list.length > 1) {
			ele_list.forEach(item => {
				let translate = item.translate.split(',');
				let top = +translate[1];
				let left = +translate[0];
				t = typeof t === 'undefined' ? top : top < t ? top : t;
				l = typeof l === 'undefined' ? left : left < l ? left : l;
				// 存在组合id情况
				if (o_group) { n_group.push(base_opt.fn.uuid()) }
			})
		}
		// 遍历元素对象列表
		ele_list.forEach(function(item, index){
			// 修改元素id
			item.id = base_opt.fn.uuid();
			// 修改定位
			if (deviation){
				let translate = item.translate.split(','),
					x = Number(translate[0]) + 5,
					y = Number(translate[1]) + 5;
				item.translate = `${x},${y}`;
			}
			// 修改组合id
			if(item.group && n_group.length > 1){
				let index = o_group.indexOf(item.group);
				item.group = n_group[index];
			}
			// 图片元素 - 修改裁剪id
			if(item.type === 'img' && item.clip) item.clip.id = base_opt.fn.uuid();
		});
		// 获取粘贴元素节点内容
		try {
			ele_html = this.ele_list_2_dom(ele_list);
			let $page = $('.page_contain .edit_page').append($(ele_html));
			// 图表元素生成实例
			$page.find('.ele_item[data-type="chart"]').each((index, el) => {
				chart_opt.init_instance($(el));
			});
		} catch (error) {
			console.error('group_opt ele_paste 粘贴失败');
		}
		return {
			html: ele_html,
			list: ele_list,
			group: n_group.length === 0 ? false : n_group
		};
	},
	// 删除元素
	ele_delete: function(ele){
		// 错误状态判断
		if(!ele || ele.length <= 0) {
			console.error('params type error');
			return false;
		}
		ele.each((index, item)=>{
			if ($(item).attr('data-type') !== 'chart') {
				return;
			}
			chart_opt.destroy_instance($(item));
		});
		ele.remove();
	},
	// 设置元素锁定 || 解锁
	toggle_locked: function(ele){
		// 错误状态判断
		if(!ele || ele.length <= 0) {
			console.error('params type error');
			return false;
		}
		let all_lock = true;
		ele.each(function(){
			if(!$(this).hasClass('lock')){
				all_lock = false;
				if($(this).attr('data-type') === 'table') $(this).find('.table_resizer').hide();
			}
		});
		if(all_lock){
			ele.removeClass('lock');
			ele.find('.table_resizer').show();
		}else{
			ele.addClass('lock');
		}
	},
	// 设置元素超链接
	ele_link_add: function(ele, data, linkType){
		// 错误状态判断
		if (!ele || ele.length !== 1) {
			console.error('params type error');
			return false;
		}
		ele.each((index, item) => {
			let type = linkType ? linkType : $(item).attr('data-type'),
				$rotate = $(item).find('.ele_rotate');
			switch (type) {
				case 'text':
					editor_opt.set_link(ele, data);
					break;
				case 'table':
					editor_opt.set_link(ele, data);
					break;
				default:
					$rotate.attr('title', link);
					break;
			}
		});
	},
	// 更改元素超链接
	ele_link_change: function(ele,link,dom){
		// 错误状态判断
		if (!ele || ele.length !== 1) {
			console.error('params type error');
			return false;
		}
		ele.each((index, item) => {
			let type = $(item).attr('data-type'),
				$rotate = $(item).find('.ele_rotate');
			switch (type) {
				case 'text':
					editor_opt.change_link(dom,link);
					break;
				case 'table':
					editor_opt.change_link(dom,link);
					break;
				default:
					$rotate.attr('title', link);
					break;
			}
		});
	},
	// 删除元素超链接
	ele_link_remove: function(ele,dom){
		// 错误状态判断
		if (!ele || ele.length !== 1) {
			console.error('params type error');
			return false;
		}
		ele.each((index, item) => {
			let type = $(item).attr('data-type'),
				$rotate = $(item).find('.ele_rotate');
			switch (type) {
				case 'text':
					editor_opt.remove_link(dom);
					break;
				case 'table':
					editor_opt.remove_link(dom);
					break;
				default:
					$rotate.attr('title', '');
					break;
			}
		});
	},
	// 设置元素组合 || 拆分（缺少节点移动）
	toggle_group: function(ele){
		// 错误状态判断
		if(!ele || ele.length <= 1) {
			console.error('组合元素不能少于1个');
			return false;
		}
		let group_arr = [], has_group = false;
		ele.each(function(){
			let group = $(this).attr('data-group');
			if(group && group !== 'undefined' && group_arr.indexOf(group) < 0){
				group_arr.push(group);
			} else if (!group || group === 'undefined'){
				has_group = true;
			}
		});
		// 存在未组合的元素 || 存在0个、大于1个的组合
		if (group_arr.length !== 1 || has_group){
			let group_id = base_opt.fn.uuid();
			ele.attr('data-group', group_id);
			// 整合组合节点排序
			let $prev = ele.eq(0);
			ele.each(function(index){
				let $ele = $(this);
				if(index !== 0){
					$prev.after($ele);
					$prev = $ele;
				}
			});
		}else{
			ele.attr('data-group', '');
		}
	},
	// 设置 base_opt.page_scale
	set_base_scale: function(data){
		// 错误状态判断
		if(isNaN(data)){
			console.error('params type error');
			return false;
		}
		base_opt.page_scale = data;
	},
	// 初始化定位
	fit_dom_offset: function(ele){
		// 错误状态判断
		if(!ele || ele.length <= 0) {
			console.error('params type error');
			return false;
		}
		let $page = $('.page_contain .edit_page'),
			// 获取画布大小
			page_w = $page[0].offsetWidth,
			page_h = $page[0].offsetHeight,
			// 获取形状大小
			ele_msg = base_opt.compute_ele_seat(ele).page,
			begin_x = ele_msg.x,
			begin_y = ele_msg.y,
			ele_w = ele_msg.w,
			ele_h = ele_msg.h,
			ele_x = page_w / 2 - ele_w / 2,
			ele_y = page_h / 2 - ele_h / 2,
			diff_x = ele_x - begin_x,
			diff_y = ele_y - begin_y;
		ele.each(function(){
			let $this = $(this),
				this_x = base_opt.compute_ele_offset($this).page.x,
				this_y = base_opt.compute_ele_offset($this).page.y,
				n_x = Number(this_x) + Number(diff_x),
				n_y = Number(this_y) + Number(diff_y);
			base_opt.set_translate($this, n_x, n_y);
		});
	},
	/*部分富文本方法 EditView & EditLeftBar 都有调用，抽取到组合方法中*/
	// 设置文本粗体
	ele_set_weight: function(ele){
		// 错误状态判断
		if(!ele || ele.length <= 0){
			console.error('params type error');
			return false;
		}
		// 遍历元素
		ele.each(function(){
			let $ele = $(this),
				type = $ele.attr('data-type');
			switch (type) {
				case 'text':
					editor_opt.set_bold($ele);
					// 最小宽度
					text_opt.set_ele_sync_content($ele);
					break;
				case 'shape':
					editor_opt.set_bold($ele);
					// 形状文本聚焦
					$ele.find('.show_text').focus();
					break;
				case 'table':
					let all_bold = true,                     // 判断是否全部加粗
						$selected = table_opt.get_edit_cel($ele, true);    // 获取正在编辑 且 不被合并后隐藏的 单元格
					$selected.each(function(){
						// 是否为加粗
						all_bold =$(this).attr('data-weight') == 700;
						return all_bold
					});
					if(all_bold){
						$selected.each(function(){
							// 去除加粗
							editor_opt.set_bold($(this), 'normal');
							$(this).removeAttr('data-weight');
						});
					}else{
						$selected.each(function(){
							// 加粗
							editor_opt.set_bold($(this), 'bold');
							$(this).attr('data-weight',700);
						});
					}
					break;
			}
		});
	},
	// 设置文本斜体
	ele_set_italic: function(ele){
		// 错误状态判断
		if(!ele || ele.length <= 0){
			console.error('params type error');
			return false;
		}
		// 遍历元素
		ele.each(function(){
			let $ele = $(this),
				type = $ele.attr('data-type');
			switch (type) {
				case 'text':
					editor_opt.set_italic($ele);
					break;
				case 'shape':
					editor_opt.set_italic($ele);
					// 形状文本聚焦
					$ele.find('.show_text').focus();
					break;
				case 'table':
					let all_italic = true, // 判断是否全部斜体
						$selected = table_opt.get_edit_cel($ele, true); // 获取正在编辑 且 不被合并后隐藏的 单元格
					$selected.each(function(){
						// 是否为斜体
						all_italic = $(this).attr('data-style') === 'italic';
						return all_italic;
					});
					if(all_italic){
						$selected.each(function(){
							editor_opt.set_italic($(this),'normal');
							$(this).removeAttr('data-style');
						});
					}else{
						$selected.each(function(){
							editor_opt.set_italic($(this),'italic');
							$(this).attr('data-style','italic');
						});
					}
					break;
			}
		});
	},
	// 设置文本高亮
	ele_set_hilite: function (ele,data) {
		// 错误状态判断
		if (!ele || ele.length <= 0) {
			console.error('params type error');
			return false;
		}
		// 遍历元素
		ele.each(function () {
			let $ele = $(this),
				type = $ele.attr('data-type');
			switch (type) {
				case 'text':
					editor_opt.set_hilite($ele,data);
					break;
				case 'shape':
					editor_opt.set_hilite($ele,data);
					// 形状文本聚焦
					$ele.find('.show_text').focus();
					break;
				case 'table':
					let all_hilite = true,
						$selected = table_opt.get_edit_cel($ele, true); // 获取正在编辑 且 不被合并后隐藏的 单元格
					$selected.each(function () {
						all_hilite = $(this).attr('data-hilite') === 'hilite';
						return all_hilite;
					});
					if (all_hilite) {
						$selected.each(function () {
							editor_opt.set_hilite($(this),data, 'none');
							$(this).removeAttr('data-hilite');
						})
					} else {
						$selected.each(function () {
							editor_opt.set_hilite($(this),data, 'hilite');
							$(this).attr('data-hilite', 'hilite');
						})
					}
					break;
			}
		});
	},
	// 设置文本投影
	ele_set_shadow: function (ele) {
		// 错误状态判断
		if (!ele || ele.length <= 0) {
			console.error('params type error');
			return false;
		}
		// 遍历元素
		ele.each(function () {
			let $ele = $(this),
				type = $ele.attr('data-type');
			switch (type) {
				case 'text':
					editor_opt.set_shadow($ele);
					break;
				case 'shape':
					editor_opt.set_shadow($ele);
					// 形状文本聚焦
					$ele.find('.show_text').focus();
					break;
				case 'table':
					let all_shadow = false,
						$selected = table_opt.get_edit_cel($ele, true); // 获取正在编辑 且 不被合并后隐藏的 单元格
					$selected.each(function () {
						all_shadow = $(this).attr('data-shadow') === 'shadow';
						return all_shadow;
					});
					if (all_shadow) {
						$selected.each(function () {
							editor_opt.set_shadow($(this), 'none');
							$(this).removeAttr('data-shadow');
						})
					} else {
						$selected.each(function () {
							editor_opt.set_shadow($(this), 'shadow');
							$(this).attr('data-shadow', 'shadow');
						})
					}
					table_opt.table_edit_listener($ele);
					break;
			}
		});
	},
	// 设置文本下划线
	ele_set_underline: function(ele){
		// 错误状态判断
		if(!ele || ele.length <= 0){
			console.error('params type error');
			return false;
		}
		// 遍历元素
		ele.each(function(){
			let $ele = $(this),
				type = $ele.attr('data-type');
			switch (type) {
				case 'text':
					editor_opt.set_underline($ele);
					break;
				case 'shape':
					editor_opt.set_underline($ele);
					// 形状文本聚焦
					$ele.find('.show_text').focus();
					break;
				case 'table':
					let all_underline = true,
						$selected = table_opt.get_edit_cel($ele, true); // 获取正在编辑 且 不被合并后隐藏的 单元格
					$selected.each(function(index){
						all_underline = $(this).attr('data-textDecoration') === 'underline';
						return all_underline;
					});
					if(all_underline){
						$selected.each(function(){
							editor_opt.set_underline($(this),'none');
							$(this).removeAttr('data-textDecoration');
						})
					}else{
						$selected.each(function(){
							editor_opt.set_underline($(this),'underline');
							$(this).attr('data-textDecoration','underline');
						})
					}
					break;
			}
		});
	},
	// 设置文本中划线
	ele_set_linethrough: function (ele) {
		// 错误状态判断
		if (!ele || ele.length <= 0) {
			console.error('params type error');
			return false;
		}
		// 遍历元素
		ele.each(function () {
			let $ele = $(this),
				type = $ele.attr('data-type');
			switch (type) {
				case 'text':
					editor_opt.set_linethrough($ele);
					break;
				case 'shape':
					editor_opt.set_linethrough($ele);
					// 形状文本聚焦
					$ele.find('.show_text').focus();
					break;
				case 'table':
					let all_linethrough = true,
						$selected = table_opt.get_edit_cel($ele, true); // 获取正在编辑 且 不被合并后隐藏的 单元格
					$selected.each(function (index) {
						all_linethrough = $(this).attr('data-textDecoration') === 'linethrough';
						return all_linethrough;
					});
					if (all_linethrough) {
						$selected.each(function () {
							editor_opt.set_linethrough($(this), 'none');
							$(this).removeAttr('data-textDecoration');
						})
					} else {
						$selected.each(function () {
							editor_opt.set_linethrough($(this), 'linethrough');
							$(this).attr('data-textDecoration', 'linethrough');
						})
					}
					break;
			}
		});
	},
	// 设置文本行高
	ele_set_lineHeight: function(ele, data){
		// 错误状态判断
		if(!ele || ele.length <= 0 || !data){
			console.error('params type error');
			return false;
		}
		// 遍历元素
		ele.each(function(){
			let $ele = $(this),
				type = $ele.attr('data-type'),
				line_h = data,
				$text, text_line_h;
			switch (type) {
				// 文本元素编辑
				case 'text':
					// 判断data
					if(isNaN(data)){
						$text = $ele.find('.show_text');
						text_line_h = $text[0].style.lineHeight === '' ? 1 : $text[0].style['line-height'];
						if(data === 'up'){
							text_line_h = Number(text_line_h) + 0.5;
						}else if(data === 'down'){
							text_line_h = Number(text_line_h) - 0.5 < 1 ? 1 : Number(text_line_h) - 0.5;
						}
						line_h = Math.ceil(text_line_h * 100) / 100;
					}
					// 应用行高
					editor_opt.set_font_lineHeight($ele, line_h);
					break;
				// 形状元素文本编辑
				case 'shape':
					// 判断data
					
					if(isNaN(data)){
						$text = $ele.find('.show_text');
						text_line_h = $text[0].style.lineHeight === '' ? 1 : $text[0].style['line-height'];
						if(data === 'up'){
							text_line_h = Number(text_line_h) + 0.5;
						}else if(data === 'down'){
							text_line_h = Number(text_line_h) - 0.5 < 1 ? 1 : Number(text_line_h) - 0.5;
						}
						line_h = Math.ceil(text_line_h * 100) / 100;
					}
					// 应用行高
					editor_opt.set_font_lineHeight($ele, line_h);
					// 形状文本聚焦
					$ele.find('.show_text').focus();
					break;
				// 表格编辑
				case 'table':
					// 获取正在编辑单元格
					let $cel = table_opt.get_edit_cel($ele);
					$cel.each(function(){
						// 判断data
						if(isNaN(data)){
							$text = $ele.find('.show_text');
							text_line_h = $text[0].style.lineHeight === '' ? 1 : $text[0].style['line-height'];
							if(data === 'up'){
								text_line_h = Number(text_line_h) + 0.5;
							}else if(data === 'down'){
								text_line_h = Number(text_line_h) - 0.5 < 1 ? 1 : Number(text_line_h) - 0.5;
							}
							line_h = Math.ceil(text_line_h * 100) / 100;
						}
						// 应用行高
						editor_opt.set_font_lineHeight($(this), line_h);
					});
					// 相关数据同步
					table_opt.table_edit_listener($ele);
					break;
			}
		});
	},
	// 设置文本对齐
	ele_set_align: function(ele, data){
		// 错误状态判断
		if(!ele || ele.length <= 0 || !data){
			console.error('params type error');
			return false;
		}
		// 遍历元素
		ele.each(function(){
			let $ele = $(this),
				type = $ele.attr('data-type');
			switch (type) {
				case 'text':
					editor_opt.set_font_align($ele, data);
					break;
				case 'shape':
					editor_opt.set_font_align($ele, data);
					// 形状文本聚焦
					$ele.find('.show_text').focus();
					break;
				case 'table':
					let $cel = table_opt.get_edit_cel($ele);
					if(!$cel) break;
					$cel.each(function () {
						editor_opt.set_font_align($(this), data);
					});
					break;
			}
		});
	},
	// 组合设置缩放
	set_group_size: function (ele, data) {
		if (!ele || !ele.length || typeof data !== 'object' || !data.w || !data.h) {
			return;
		}
		let operate_offset = base_opt.compute_ele_seat(ele).page;
		let operate_scale_x = data.w / Math.round(operate_offset.w);
		let operate_scale_y = data.h / Math.round(operate_offset.h);
		// 遍历选中元素
		ele.each((i, el) => {
			let $ele = $(el);
			let ele_offset = base_opt.compute_ele_offset($ele).page;
			let n_w = ele_offset.w * operate_scale_x;
			let n_h = ele_offset.h * operate_scale_y;
			let n_x = operate_offset.x + (ele_offset.x - operate_offset.x) * operate_scale_x;
			let n_y = operate_offset.y + (ele_offset.y - operate_offset.y) * operate_scale_y;
			// 设置尺寸
			switch ($ele.attr('data-type')) {
				case 'text':
					text_opt.set_size($ele, {w: n_w, h: n_h});
					break;
				case 'shape':
					shape_opt.set_size($ele, {w: n_w, h: n_h});
					break;
				case 'img':
					image_opt.set_size($ele, {w: n_w, h: n_h});
					break;
				case 'chart':
					chart_opt.set_size($ele, {w: n_w, h: n_h});
					break;
				case 'video':
					video_opt.set_size($ele, {w: n_w, h: n_h});
					break;
				case 'audio':
					audio_opt.set_size($ele, {w: n_w, h: n_h});
					break;
			}
			// 设置坐标
			base_opt.set_translate($ele, n_x, n_y);
		});
	},
	// 组合设置位置
	set_group_translate: function (ele, x, y) {
		if (!ele || !ele.length) {
			return;
		}
		let operate_offset = base_opt.compute_ele_seat(ele).page;
		let diff_x = x - operate_offset.x;
		let diff_y = y - operate_offset.y;
		// 遍历选中元素
		ele.each((i, el) => {
			let $ele = $(el);
			let ele_offset = base_opt.compute_ele_offset($ele).page;
			let n_x = ele_offset.x + diff_x;
			let n_y = ele_offset.y + diff_y;
			base_opt.set_translate($ele, n_x, n_y);
		});
	},
};
export default group_opt;