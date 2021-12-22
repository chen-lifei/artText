import base_opt from '@/assets/pc/js/opt/base_opt.js';
import font_family from '@/assets/font/fontFamily.js';
import common from '@/assets/pc/js/common.js';

let text_opt = {
	// 文本元素模板
	template: {
		id: '',
		type: 'text',
		group: null,
		lock: false,
		opacity: 1,
		translate: '0,0',
		rotate: '0,0,0',
		scale: "0.5,0.5",
		width: 200,
		height: 60,
		border_w: null,
        border_s: null,
		border_c: null,
		border_o: null,
		background: {
			type: 'color',
			color: 'transparent',
			image: null,
		},
		text_align: 'left',
		content: '<div class="show_text example_text" style="font-size:28px; color:#000000; line-height:1.4; padding:2px 5px;"></div>',
		animation: [],
		image: '',
	},
	// 模板字体大小
	using_data: {
		color: null,
		family: null,
	},
	// 不能设置描边的艺术字
	no_stroke_arr: ['art_golden', 'art_douyin', 'art_power', 'art_cartoon', 'art_neon', 'art_mirror', 'art_vein', 'art_metal', 'art_color'],
	// 没有相关设置的艺术字
	disable_setting_arr: ['art_grad_right', 'art_grad_bottom', 'art_print', 'art_projection'],
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
			text_msg = this.get_edit_message(ele),
			result = Object.assign(base_msg, text_msg);
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
		let $text = ele.find('.show_text'),
			$text_outer = $text.parents('.text_content'),
			$span = $text.find('span'),
			$ol = $text.find('ol').eq(0),
			$ul = $text.find('ul').eq(0),
			ele_scale = base_opt.get_transform(ele, 'scale'),
			color_arr = [],
			size_arr = [],
			family_arr = [],
			font_weight_arr = [],
			font_style_arr = [],
			text_hilite_arr = [],
			text_shadow_arr = [],
			letter_spacing_arr = [],
			text_decoration_arr = [],
			result = {};
		if ($text[0].style.fontFamily) {
			family_arr.push($text[0].style.fontFamily);
		}
		// 获取文本样式
		$span.each(function () {
			let text_color = $(this).css('color'),
				text_size = $(this).css('fontSize'),
				text_family = $(this).css('fontFamily'),
				font_weight = $(this).css('fontWeight'),
				font_style = $(this).css('fontStyle'),
				letter_spacing = $(this).css('letterSpacing'),
				text_hilite = $(this).css('backgroundColor'),
				text_shadow = $(this).css('textShadow'),
				text_decoration = $(this).css('textDecoration');
			if (text_size === '0px') return true;
			if (size_arr.indexOf(text_size) < 0) size_arr.push(text_size);
			if (color_arr.indexOf(text_color) < 0) color_arr.push(text_color);
			if (family_arr.indexOf(text_family) < 0) family_arr.push(text_family);
			if (font_style_arr.indexOf(font_style) < 0) font_style_arr.push(font_style);
			if (font_weight_arr.indexOf(font_weight) < 0) font_weight_arr.push(font_weight);
			if (text_hilite_arr.indexOf(text_hilite) < 0) text_hilite_arr.push(text_hilite);
			if (text_shadow_arr.indexOf(text_shadow) < 0) text_shadow_arr.push(text_shadow);
			if (letter_spacing_arr.indexOf(letter_spacing) < 0) letter_spacing_arr.push(letter_spacing);
			if (text_decoration_arr.indexOf(text_decoration) < 0) text_decoration_arr.push(text_decoration);
		});
		// 获取元素透明度
		result.opacity = Math.ceil(ele.find('.ele_rotate').css('opacity') * 100);
        // 获取文本字体颜色
        result.color = color_arr.length > 0 ? base_opt.fn.color_exchange_function('rgb', color_arr[0]) : base_opt.fn.color_exchange_function('rgb', $text.css('color'));
		// 获取文本字体大小
		result.size = size_arr.length > 0 ? Math.round(base_opt.fn.unit_2_px(size_arr[0])) : Math.round(base_opt.fn.unit_2_px($text.css('fontSize')));
		result.size = Math.floor((result.size - result.size % 2) * ele_scale[0]);
		// 获取文本字体
		let get_font_family = font_family.search_exact(family_arr[0]);
		result.font_family = get_font_family ? get_font_family.name : '微软雅黑';
		// 获取文本字间距
		result.letter_spacing = letter_spacing_arr.length > 0 ? base_opt.fn.unit_2_px(letter_spacing_arr[0]) : base_opt.fn.unit_2_px($text.css('letterSpacing'));
		// 获取文字粗体
		let font_weight = 'bold';
		$.each(font_weight_arr, function (key, val) {
			if (val === '400') return font_weight = 'normal';
		});
		result.font_weight = font_weight_arr.length > 0 ? font_weight : $text.css('fontWeight') > 400 ? 'bold' : 'normal';
		// 获取文字斜体
		let font_style = 'italic';
		$.each(font_style_arr, function (key, val) {
			if (val === '' || val === 'normal') return font_style = 'normal';
		});
		result.font_style = font_style_arr.length > 0 ? font_style : $text.css('fontStyle') === 'italic' ? 'italic' : 'normal';
		// 获取文字下划线
		let text_underline = 'underline';
		$.each(text_decoration_arr, function (key, val) {
			if (!val || val === '' || val === 'none' || val.indexOf('underline') < 0) return text_underline = 'none';
		});
		result.text_underline = text_decoration_arr.length > 0 ? text_underline : $text.css('textDecoration') && $text.css('textDecoration').indexOf('underline') >= 0 ? 'underline' : 'none';
		// 获取文本中划线
		let text_linethrough = 'linethrough';
		$.each(text_decoration_arr, function (key, val) {
			if (!val || val === '' || val === 'none' || val.indexOf('line-through') < 0) return text_linethrough = 'none';
		});
		result.text_linethrough = text_decoration_arr.length > 0 ? text_linethrough : $text.css('textDecoration') && $text.css('textDecoration').indexOf('line-through') >= 0 ? 'linethrough' : 'none';
		// 获取文本投影
		let text_shadow = 'shadow';
		$.each(text_shadow_arr, function (key, val) {
			if (val === '' || val === 'none') return text_shadow = 'none';
		});
		result.text_shadow = text_shadow_arr.length > 0 ? text_shadow : $text.css('textShadow') === 'none' ? 'none' : 'shadow';
		// 获取文本高亮
		result.hilite = text_hilite_arr.length > 0 && text_hilite_arr[0] !== 'rgba(0, 0, 0, 0)' ? base_opt.fn.color_exchange_function('rgb', text_hilite_arr[0]) : 'transparent';
		// 获取文字对齐方式
		result.text_align = $text_outer.css("textAlign");
		// 获取文本背景颜色
		result.background = base_opt.background_style_2_obj($text_outer);
		// 获取文本边框
		let border =  {
			// 为兼容edge需获取borderTop的属性
			width: $text_outer.css('borderWidth') || $text_outer.css('borderTopWidth'),
			style: $text_outer.css('borderStyle') || $text_outer.css('borderTopStyle'),
			color: $text_outer.css('borderColor') || $text_outer.css('borderTopColor'),
		}
		result.border_w = base_opt.fn.unit_2_px(border.width);
		result.border_s = border.style || 'none';
		result.border_c = base_opt.fn.color_exchange_function('rgb', border.color).color || base_opt.fn.color_exchange_function('rgb', border.color);
		result.border_o = border.color.indexOf('rgba') >= 0 ? base_opt.fn.parse_rgba(border.color).a * 100 : 100;
		// 无边框时，显示透明
		if (!result.border_w || result.border_s === 'none' || result.border_c.replace(/\s*/, '') === 'rgb(80,80,80)') {
			result.border_c = 'transparent';
		}
		// 获取文本元素行高
		result.line_height = $text[0].style.lineHeight === '' ? '1' : $text[0].style.lineHeight;
		// 获取有序无序列表
		let ul_style = $ul.attr('class') || $ul.css('listStyleType')
		result.ul = ul_style || 'none';
		let ol_style = $ol.attr('class') || $ol.css('listStyleType');
		result.ol = ol_style || 'none';
		// 艺术字数据
		if ($text.hasClass('art')) {
			result.text_type = 'art';
			result.text_art_key = $text.attr('class').split(' ').find(item => item.indexOf('art') >= 0 && item !== 'art');
			// 背景图尺寸
			let bg_img = $text[0].style['backgroundImage'];
			// 渐变色
			if (bg_img.indexOf('gradient') >= 0) {
				result.gradient_before = bg_img.match(/rgb\([\d,\s]*\)/g)[0];
				result.gradient_after = bg_img.match(/rgb\([\d,\s]*\)/g)[1];
			}
			// 背景图
			if(bg_img.indexOf('url') >= 0) {
				result.bg_size = parseInt($text.css('backgroundSize').split(' ')[0]);
			} else {
				// 不应用背景图情况下 获取文本填充颜色
				result.text_fill_color = $text.css('textFillColor');
			}
			// 获取描边宽度
			let stroke_width = $text[0].style['webkitTextStrokeWidth'] || $text[0].style['webkitTextStroke'].split(' ')[0];
			result.text_stroke_width = stroke_width.substring(0, stroke_width.length - 2) * 1000;
			// 是否有描边
			result.text_has_stroke = !utils.arrayCompareSameValue($text.prop('className').split(' '), this.no_stroke_arr);
			// 是否可更改设置
			result.disable_setting = !!utils.arrayCompareSameValue($text.prop('className').split(' '), this.disable_setting_arr);
			// 描边颜色
			if($text.css('textStrokeColor') || $text.css('textStroke')){
				result.text_stroke_color = $text.css('textStrokeColor') || $text.css('textStroke').split(' ')[1];
			};
			/* 获取艺术字文本阴影 */
			// 匹配文本阴影
			result.art_text_shadow = $text.css('text-shadow').match(/rgba?\([\d, ]+\)[ \d(\.\d)?a-z?-]+/g);
			// 匹配每个文本阴影的颜色
			result.text_shadow_color = $text.css('textShadow').match(/rgba?\([\d, , ?-]+\)/gi);
		}
		// 获取文本预设版式
		result.text_preset_key = $text.attr('data-preset') || 'none';
		result.not_h = true;
		return result;
	},
	// 文本元素 数据转换
	format_text_data: function (data) {
		if (Object.prototype.toString(data) === '[object Object]') {
			let $show_text = $(data.content);
			let is_art = $show_text.hasClass('art');
			// 翻转数据格式化
			if (data.reversal === undefined) {
				data.reversal = {
					translate: '0,0',
					matrix: '1,0,0,1,0,0',
				};
			}
			// 文本元素背景
			if (data.background === undefined) {
				// 艺术字背景色设置默认透明色
				if (is_art) {
					data.background = {
						type: 'color',
						color: 'transparent',
						image: null,
					};
				} else {
					data.background = base_opt.background_style_2_obj($show_text);
					$show_text.css('background', '');
				}
			}
			// 文本元素描边
			if (data.border_w === undefined || data.border_s === undefined || data.border_c === undefined) {
				data.border_w = base_opt.fn.unit_2_px($show_text.css('borderWidth'));
				data.border_s = $show_text.css('borderStyle') || 'none';
				data.border_c = $show_text.css('borderColor');
				data.border_o = $show_text.css('borderColor').indexOf('rgba') >= 0 ? base_opt.fn.parse_rgba($show_text.css('borderColor')).a * 100 : 100;
				$show_text.css({
					'width': '',
					'height': '',
					'border': '',
				});
			}
			// 文本元素对齐
			if (data.text_align === undefined) {
				data.text_align = $show_text.css('textAlign') || 'left';
			}
			data.content = $show_text.prop('outerHTML');
			// 边框 style
			let border = '';
			if (data.border_w && data.border_s && data.border_s !== 'none') {
				border = `border: ${data.border_w}px ${data.border_s} ${data.border_c};`;
			}
			// 背景
			let background = '';
			if (data.background && typeof data.background === 'object') {
				background = base_opt.background_obj_2_style(data.background);
			}
			data.style_str = `width: ${data.width}px; height: ${data.height}px; text-align: ${data.text_align}; ${border} ${background} background-clip: content-box;`;
		}
		return data;
	},
	// 文本元素 - 节点 -> 数据方法
	dom_2_ele: function(dom){
		// 错误状态判断
		if(!dom || dom.length <= 0) {
			console.error('params type error');
			return false;
		}
		let $scale = dom.find('.ele_scale');
		let $text = dom.find('.show_text');
		let $text_outer = $text.parents('.text_content');
		let transform = base_opt.get_transform(dom);
		let obj = {};
		// 获取元素通用数据
		obj.id = dom.attr('id');
		obj.type = dom.attr('data-type');
		obj.group = dom.attr('data-group') === 'undefined' ? '' : dom.attr('data-group');
		obj.lock = dom.hasClass('lock');
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
		obj.width = base_opt.fn.unit_2_px($text_outer[0].style.width);
		obj.height = base_opt.fn.unit_2_px($text_outer[0].style.height);
		obj.text_align = $text_outer.css('textAlign');
		obj.border_w = base_opt.fn.unit_2_px($text_outer.css('borderWidth'));
		obj.border_s = $text_outer.css('borderStyle');
		obj.border_c = $text_outer.css('borderColor');
		obj.border_o = base_opt.fn.parse_rgba($text_outer.css('borderColor')).a * 100 || 100;
		obj.background = base_opt.background_style_2_obj($text_outer);
		obj.content = $text[0].outerHTML;
		// 镜像翻转
		obj.reversal = {
			translate: $scale.attr('data-translate'),
			matrix: $scale.attr('data-matrix')
		};
		// 获取图片属性
		obj.image = dom.attr('data-image') === 'undefined' ? '' : dom.attr('data-image');
		return obj;
	},
	// 文本元素 - 数据 -> 节点方法
	ele_2_dom:function(obj, is_str){
		// 错误状态判断
		if(!obj || typeof obj !== 'object' || !obj.id) {
			console.error('params type error');
			return false;
		}
		// 格式化旧数据
		let ele = base_opt.fn.clone_object(obj);
		ele = this.format_text_data(ele);
		//1、数据处理
		ele.group = (ele.group ? ele.group : '');
		ele.lock = (obj.lock ? 'lock' : '');
		ele.image = (ele.image || '')
		let translate_arr = ele.translate.split(',');
		let left = translate_arr[0];
		let top = translate_arr[1];
		let scale_arr = ele.scale.split(',');
		let scale_width = (ele.width * Number(scale_arr[0]));
		let scale_heigth = (ele.height * Number(scale_arr[1]));
		let rotate_deg = ele.rotate.split(',')[0];
		let reversal_translate_arr = ele.reversal.translate.split(',');
		let reversal_translate_x = reversal_translate_arr[0];
		let reversal_translate_y = reversal_translate_arr[1];
		let bg_radialtype = '';
		if (ele.background && typeof ele.background === 'object' && ele.background.type === 'gradient') {
			bg_radialtype = ele.background.color.direction;
		}
		//处理内容数据
		ele.content = $(ele.content).attr({
			'contenteditable': true,
			'data-preset': (ele.preset || ''),
		}).prop('outerHTML');
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
						style="left:${left}px; top:${top}px;"
						data-type="${ele.type}"
						data-group="${ele.group}"
						data-animation-name="${animation_name}"
                        data-animation-default="${animation_default}"
                        data-animation-start="${animation_start}"
                        data-animation-duration="${animation_duration}"
                        data-animation-delay="${animation_delay}"
						data-animation-index="${animation_index}"
						data-image="${ele.image}"
					>
						<div class="ele_rotate" data-rotate="${ele.rotate}" style="width:${scale_width}px; height:${scale_heigth}px; transform:rotate(${rotate_deg}deg); opacity:${ele.opacity};">
							<div class="ele_scale" data-scale="${ele.scale}" data-matrix="${ele.reversal.matrix}" data-translate="${ele.reversal.translate}" style="transform:scale(${ele.scale})translate(${reversal_translate_x}px ,${reversal_translate_y}px)matrix(${ele.reversal.matrix})">
								<div class="text_content" data-radialtype="${bg_radialtype}" style="${ele.style_str}">
									${ele.content}
								</div>
							</div>
						</div>
					</div>`;
		if(is_str){
			return html;
		}
		return $(html);
	},
	// 生成 -> 返回节点字符串
	build: function(obj){
		let template = base_opt.fn.clone_object(this.template);
		let param = Object.assign(template, obj);
		let using = this.using_data;
		let $content = $(template.content);
		let css = {
			'color': using.color,
			'fontFamily': using.family,
			'word-break': param.wordBreak,
			'white-space': param.whiteSpace
		};
		// 预置样式
		if (using.text_obj) {
			if (using.text_obj.key) {
				param.preset = using.text_obj.key;
			}
			if (using.text_obj.content) {
				$content.html(using.text_obj.content);
			}
			let using_bg = using.text_obj.background;
			if (using_bg) {
				if (typeof using_bg === 'object') {
					param.background = using_bg;
				}
				if (typeof using_bg === 'string') {
					param.background = {
						type: 'color',
						color: using_bg,
						image: null,
					};
				}
			}
			css['color'] = using.text_obj.color;
			css['fontSize'] = using.text_obj.size;
			css['fontWeight'] = using.text_obj.weight;
			css['fontFamily'] = using.text_obj.family;
		}
		$content.css(css);
		param.content = $content.prop('outerHTML');
		return this.ele_2_dom(param).prop('outerHTML');
	},
	// 元素同步内容尺寸
	set_ele_sync_content: function(ele){
		// 错误状态判断
		if(!ele || ele.length !== 1) return console.error('params type error');
		let $ele_rotate = ele.find('.ele_rotate');
		let $text_outer = ele.find('.text_content');
		let $text = ele.find('.show_text');
		let min_w = this.compute_min_size(ele).w;
		let ele_scale = base_opt.get_transform(ele, 'scale');
		if($text.css('word-break') === 'normal'){// 不限制文本宽度（文本不换行）
			let width =  $text[0].offsetWidth * ele_scale[0]; // 文本的可视宽度  文本的宽度 * 画布x轴缩放
			$ele_rotate.css({ width });
		}
		let ele_w = base_opt.compute_ele_offset(ele).page.w;
		let ele_h = $text[0].offsetHeight * ele_scale[1] + base_opt.fn.unit_2_px($text_outer.css('borderWidth'));
		this.set_size(ele, {
			w: ele_w < min_w ? min_w : ele_w,
			h: ele_h,
		});
		return ele_h;
	},
	// 设置尺寸
	set_size: function (ele, rect) {
		if(!ele || ele.length !== 1 || !rect) {
			console.error('params type error');
			return false;
		}
		let get_transform = base_opt.get_transform(ele);
		let ele_rotate = get_transform.rotate;
		let ele_scale = get_transform.scale;
		let $rotate = ele.find('.ele_rotate');
		let $text_outer = ele.find('.text_content');
		ele_rotate[1] = rect.w * ele_scale[0];
		ele_rotate[2] = rect.h * ele_scale[1];
		$rotate.css({
			'width': `${rect.w}px`,
			'height': `${rect.h}px`,
		}).attr('data-rotate', ele_rotate.join(','));
		$text_outer.css({
			'width': `${rect.w / ele_scale[0]}px`,
			'height': `${rect.h / ele_scale[1]}px`,
		});
	},
	// 设置等比尺寸并且同步字体大小
	set_size_sync_fontsize: function (ele, ratio) {
		if(!ele || ele.length !== 1 || !ratio) {
			console.error('params type error');
			return false;
		}
		if (ratio === 1) {
			return;
		}
		let $text_outer = ele.find('.text_content');
		$text_outer.find('*').each((index, ele) => {
			let $ele = $(ele);
			let fontsize = base_opt.fn.unit_2_px($ele.css('font-size'));
			if (fontsize) {
				$ele.css('font-size', `${fontsize * ratio}px`);
			}
		});
		let text_scale = base_opt.get_transform(ele, 'scale')[0];
		let size = base_opt.fn.unit_2_px(ele.find('.show_text').css('font-size'));
		size = Math.floor(size * text_scale);
		return size;
	},
	// 设置边框颜色
	set_border_color: function(ele, data){
		// 错误状态判断
		if(!ele || ele.length !== 1 || !data) {
			console.error('params type error');
			return false;
		}
		let $text_outer = ele.find('.text_content');
		let border_w = base_opt.fn.unit_2_px($text_outer.css('borderWidth'));
		let border_s = $text_outer.css('borderStyle');
		let hasborder = border_w && border_s && border_s !== 'none';
		let rect = base_opt.compute_ele_offset(ele).page;
		rect.w = rect.w / rect.scale[0];
		rect.h = rect.h / rect.scale[1];
		// 无边框情况下设置默认边框宽度样式
		if (!hasborder) {
			border_w = 1;
			border_s = 'solid';
			// 更新元素尺寸
			rect.w = rect.w + border_w * 2;
			rect.h = rect.h + border_w * 2;
			ele.find('.ele_rotate').attr({
				'data-rotate': `${rect.rotate}, ${rect.w * rect.scale[0] / 2}, ${rect.h * rect.scale[1] / 2}`,
			}).css({
				'width': rect.w * rect.scale[0],
				'height': rect.h * rect.scale[1],
			});
			$text_outer.css({
				'width': rect.w,
				'height': rect.h,
				'border': `${border_w}px ${border_s} ${data}`,
			});
		} else {
			// 去除颜色
			if (!data || data === 'transparent' || data === 'none') {
				border_s = 'none';
				rect.w = rect.w - border_w * 2;
				rect.h = rect.h - border_w * 2;
				ele.find('.ele_rotate').attr({
					'data-rotate': `${rect.rotate}, ${rect.w * rect.scale[0] / 2}, ${rect.h * rect.scale[1] / 2}`,
				}).css({
					'width': rect.w * rect.scale[0],
					'height': rect.h * rect.scale[1],
				});
				$text_outer.css({
					'width': rect.w,
					'height': rect.h,
					'border': `0px ${border_s} ${data}`,
				});
			} else {
				$text_outer.css('border', `${border_w}px ${border_s} ${data}`);
			}
		}
	},
	// 设置边框宽度
	set_border_width: function(ele, data){
		// 错误状态判断
		if(!ele || ele.length !== 1 || isNaN(data)) {
			console.error('params type error');
			return false;
		}
		let rect = base_opt.compute_ele_offset(ele).page;
		rect.w = rect.w / rect.scale[0];
		rect.h = rect.h / rect.scale[1];
		let $text_outer = ele.find('.text_content');
		let border_w = base_opt.fn.unit_2_px($text_outer.css('borderWidth'));
		let border_s = $text_outer.css('borderStyle');
		let border_c = $text_outer.css('borderColor');
		let hasborder = border_s && border_s !== 'none';
		// 无边框情况下
		if (!hasborder) {
			border_s = 'solid';
			border_c = '#000000';
		}
		
		rect.w = rect.w - border_w * 2 + data * 2;
		rect.h = rect.h - border_w * 2 + data * 2;
		ele.find('.ele_rotate').attr({
			'data-rotate': `${rect.rotate}, ${rect.w * rect.scale[0] / 2}, ${rect.h * rect.scale[1] / 2}`,
		}).css({
			'width': rect.w * rect.scale[0],
			'height': rect.h * rect.scale[1],
		});
		$text_outer.css({
			'width': rect.w,
			'height': rect.h,
			'border': `${data}px ${border_s} ${border_c}`,
		});
	},
	// 设置边框样式
	set_border_style: function(ele, data){
		// 错误状态判断
		if(!ele || ele.length !== 1 || !data) {
			console.error('params type error');
			return false;
		}
		let $text_outer = ele.find('.text_content');
		let border_w = base_opt.fn.unit_2_px($text_outer.css('borderWidth'));
		let border_s = $text_outer.css('borderStyle');
		let border_c = $text_outer.css('borderColor');
		let hasborder = border_w && border_s && border_s !== 'none';
		let rect = base_opt.compute_ele_offset(ele).page;
		rect.w = rect.w / rect.scale[0];
		rect.h = rect.h / rect.scale[1];
		// 无边框情况下设置默认边框宽度颜色
		if (!hasborder) {
			border_w = 1;
			border_c = '#000000';
			// 更新元素尺寸
			rect.w = rect.w + border_w * 2;
			rect.h = rect.h + border_w * 2;
			ele.find('.ele_rotate').attr({
				'data-rotate': `${rect.rotate}, ${rect.w * rect.scale[0] / 2}, ${rect.h * rect.scale[1] / 2}`,
			}).css({
				'width': rect.w * rect.scale[0],
				'height': rect.h * rect.scale[1],
			});
			$text_outer.css({
				'width': rect.w,
				'height': rect.h,
				'border': `${border_w}px ${data} ${border_c}`,
			});
		} else {
			// 去除样式
			if (!data || data === 'none') {
				border_c = 'transparent';
				rect.w = rect.w - border_w * 2;
				rect.h = rect.h - border_w * 2;
				ele.find('.ele_rotate').attr({
					'data-rotate': `${rect.rotate}, ${rect.w * rect.scale[0] / 2}, ${rect.h * rect.scale[1] / 2}`,
				}).css({
					'width': rect.w * rect.scale[0],
					'height': rect.h * rect.scale[1],
				});
				$text_outer.css({
					'width': rect.w,
					'height': rect.h,
					'border': `0px ${data} ${border_c}`,
				});
			} else {
				$text_outer.css('border', `${border_w}px ${data} ${border_c}`);
			}
		}
	},
	// 设置边框透明度
	set_border_opacity: function(ele, data){
		// 错误状态判断
		if(!ele || ele.length !== 1 || isNaN(data)) {
			console.error('params type error');
			return false;
		}
		let $text_outer = ele.find('.text_content');
		// 获取文本边框
		let border =  {
			// 为兼容edge需获取borderTop的属性
			width: $text_outer.css('borderWidth') || $text_outer.css('borderTopWidth'),
			style: $text_outer.css('borderStyle') || $text_outer.css('borderTopStyle'),
			color: $text_outer.css('borderColor') || $text_outer.css('borderTopColor'),
		}
		let border_w = base_opt.fn.unit_2_px(border.width);
		let border_c = border.color;
		let border_s = border.style;
		let color_arr = base_opt.fn.parse_rgba(border_c);;
		let opacity = data / 100;
		border_c = `rgba(${color_arr.r}, ${color_arr.g}, ${color_arr.b}, ${opacity})`;
		$text_outer.css({
			'border': `${border_w}px ${border_s} ${border_c}`,
		});
	},
	// 背景
	set_background: function(ele, data){
		// 错误状态判断
		if(!ele || ele.length !== 1 || !data) {
			console.error('params type error');
			return false;
		}
        let $text_outer = ele.find('.text_content');
        let background = base_opt.fn.clone_object(data);
        let color_data = background.color;
        let image_data = background.image;
        let is_image = background.type.indexOf('image') >= 0;
        // 无图片类型时默认铺满
        if (is_image && !image_data.type) {
            if ($text_outer.css('background-image') === 'none' || $text_outer.css('background-repeat') !== 'repeat') {
                image_data.type = 'cover';
            } else if ($text_outer.css('background-repeat') === 'repeat') {
                image_data.type = 'repeat';
            }
        };
        // 清空背景样式
        $text_outer.css('background', '');
        // 获取背景样式
        let background_style = base_opt.background_obj_2_style(background) + ' background-clip: content-box;';
        // 设置背景样式
        $text_outer[0].style.cssText += background_style;
        // 渐变设置渐变类型属性
        if (background.type === 'gradient' && background.color.type === 'radial') {
            $text_outer.attr('data-radialtype', color_data.direction || 'center');
        } else {
			$text_outer.removeAttr('data-radialtype');
		}
        text_opt.select(ele);
    },
	// 设置镜像翻转
	set_reversal: function (ele, data) {
		// 错误状态判断
		if (!ele || ele.length !== 1 || typeof data !== 'string') {
			console.error('params type error');
			return false;
		};
		let $scale = ele.find('.ele_scale'),
			$rotate = ele.find('.ele_rotate'),
			width = base_opt.fn.unit_2_px($rotate.css('width')),
			height = base_opt.fn.unit_2_px($rotate.css('height')),
			scale_x = Number($scale.attr('data-scale').split(',')[0]),
			scale_y = Number($scale.attr('data-scale').split(',')[1]),
			translate = $scale.attr('data-translate'),
			matrix = $scale.attr('data-matrix').split(',');
		// 判断翻转类型
		switch (data) {
			case 'vertical':    //垂直翻转
				if (Number(matrix[0]) < 0) {
					matrix[0] = 1;
					$scale.attr({
						'data-translate': 0 + ',' + translate.split(',')[1],
						'data-matrix': matrix.join(",")
					}).css({
						'transform': `scale(${$scale.attr('data-scale')})translate(${0 + 'px ,' + translate.split(',')[1] + 'px'})matrix(${matrix.join(",")})`
					});
				} else {
					matrix[0] = -1;
					$scale.attr({
						'data-translate': width / scale_x + ',' + translate.split(',')[1],
						'data-matrix': matrix.join(",")
					}).css({
						'transform': `scale(${$scale.attr('data-scale')})translate(${width / scale_x + 'px ,' + translate.split(',')[1] + 'px'})matrix(${matrix.join(",")})`
					});
				}
				break;
			case 'horizontal':  //水平翻转
				if (Number(matrix[3]) < 0) {
					matrix[3] = 1;
					$scale.attr({
						'data-translate': translate.split(',')[0] + ',' + 0,
						'data-matrix': matrix.join(",")
					}).css({
						'transform': `scale(${$scale.attr('data-scale')})translate(${translate.split(',')[0] + 'px ,' + 0 + 'px'})matrix(${matrix.join(",")})`
					});
				} else {
					matrix[3] = -1;
					$scale.attr({
						'data-translate': translate.split(',')[0] + ',' + height / scale_y,
						'data-matrix': matrix.join(",")
					}).css({
						'transform': `scale(${$scale.attr('data-scale')})translate(${translate.split(',')[0] + 'px ,' + height / scale_y + 'px'})matrix(${matrix.join(",")})`
					});
				}
				break;
		}
	},
	// 文本框最小尺寸（单字情况宽度，宽度相等高度）
	compute_min_size: function(ele){
		// 错误状态判断
		if(!ele || ele.length !== 1) {
			console.error('params type error');
			return false;
		}
		let ele_scale = base_opt.get_transform(ele, 'scale');
		let $text = ele.find('.show_text');
		let min_w = base_opt.fn.unit_2_px($text.css('font-size')) + base_opt.fn.unit_2_px($text.css('letter-spacing'));
		let min_h = base_opt.fn.unit_2_px($text.css('font-size'));
		$text.find('*').each((index, ele) => {
			let $ele = $(ele);
			let fontsize = base_opt.fn.unit_2_px($ele.css('font-size'));
			let spacing = base_opt.fn.unit_2_px($ele.css('letter-spacing'));
			if (fontsize + spacing > min_w) {
				min_w = fontsize + spacing;
			}
		});
		return {
			w: min_w * ele_scale[0],
			h: min_h * ele_scale[1],
		};
	},
	// 设置节点定位适应
	fit_dom_offset: function(ele){
		// 错误状态判断
		if(!ele || ele.length !== 1 || ele.attr('data-type') !== 'text') {
			console.error('params type error');
			return false;
		}
		let $page = $('.page_contain .edit_page'),
			// 获取画布大小
			page_w = $page[0].offsetWidth,
			page_h = $page[0].offsetHeight,
			// 获取形状大小
			ele_msg = base_opt.compute_ele_offset(ele).page,
			ele_w = ele_msg.w,
			ele_h = ele_msg.h,
			ele_x = page_w / 2 - ele_w / 2,
			ele_y = page_h / 2 - ele_h / 2;
		base_opt.set_translate(ele, ele_x, ele_y);
	},  
	// 带有阴影的艺术字转图片
	art_upload_image: function (ele) {
		// 上传的图片名称
		let file_name = `${ele.attr('id')}-${utils.getUrlQuery('docId')}`;
		let $text = ele.find('.show_text').parent().prop('outerHTML');
		return new Promise(function(resolve, reject){
            let p = common.svg_2_canvas($text);
            p.then(function(canvas){
				let base64 = canvas.toDataURL("image/jpg", 1);
				common.upload_image_by_name({
					'base64': base64,
					'filename': file_name,
					'success': (image_url) => {
						ele.attr('data-image', `${image_url}?v=${new Date().getTime()}`);
						resolve(image_url);
					},
					'error': (err) => {
						console.error(err);
					},
				});
            }).catch(err => {
                reject();
            });
        });
	},
};
export default text_opt;