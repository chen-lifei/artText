const {parseSVG, makeAbsolute} = require('svg-path-parser');
const CssDom = require('cssdom');
import base_opt from '@/assets/pc/js/opt/base_opt.js';
import {edit_shape_operate, edit_shape_json} from './shape_edit_opt.js';

let shape_opt = {
	// 形状元素模板
	template: {
		id: '',
		type: 'shape',
		group: null,
		lock: false,
		opacity: 1,
		translate: '0,0',
		rotate: '0,0,0',
		scale: '1,1',
		border_c: null,
		border_w: null,
		border_s: null,
		width: 200,
		height:200,
		background: {
            type: 'color',
            color: '#000000',
            image: null
        },
		d: '',
		edit_point: [],
		// 形状添加文本标识 text => {translate, scale, content, width, height}
		text: null,
		shape_editor: null,
		shadow:{
			open:false,
			distance: 15,
			blur: 15,
			rotate: 50,
			opacity: 25,
			color: '#000000',
		},
		animation: [],
	},
	// 应用的模板
	using_data: {
		shape_editor: null,
		d: null,
		width: null,
		height: null,
		background: null,
		color: null,
		family: null,
	},
	// 初始化方法
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
			shape_msg = this.get_edit_message(ele),
			result = Object.assign(base_msg, shape_msg);
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
		let ele_shape_editor = ele.attr('shape-editor'),
			support_rect_fillet = ['shape_rect_round_1', 'shape_rect_1'],
			$rotate = ele.find('.ele_rotate'),
			$scale = ele.find('.ele_scale'),
            ele_msg = base_opt.compute_ele_offset(ele).page,
			ele_scale = base_opt.get_transform(ele, 'scale'),
			$all_path = $scale.find('path'),
			result = {};
		// 形状 尺寸 路径
		result.svg_width = ele_msg.w;
		result.svg_height = ele_msg.h;
		result.svg_scale = ele_scale.join(',');
		result.svg_path = $all_path.map((i, ele) => $(ele).attr('d')).toArray();
		// 获取元素透明度
        result.opacity = Math.ceil($rotate.css('opacity') * 100);
        
        // 获取元素边框相关
		let $path = $scale.find('path').eq(0),
			border_w = $path.attr('stroke-width'),
			border_s = $path.attr('data-border_s'),
			border_c = $path.attr('stroke');
		// 获取形状边框颜色
		result.border_c = border_c ? base_opt.fn.color_exchange_function('rgb',border_c) : 'transparent';
		// 获取形状边框粗细
		result.border_w = border_w ? Number(border_w) * 2 : '0';
		// 获取形状边框样式
		switch(true){
            case border_w == 0 && (border_s == 0 || !border_s):
                result.border_s = 'none';
                break;
			case border_s === '0':
				result.border_s = 'solid';
				break;
			case border_s === '16':
				result.border_s = 'dotted';
				break;
			case border_s === '8':
				result.border_s = 'dashed';
				break;
			case border_s === '9':
				result.border_s = 'dashed1';
				break;
			case border_s === '10':
				result.border_s = 'dashed2';
				break;
			case border_s === '11':
				result.border_s = 'dashed3';
				break;
			case border_s === '12':
				result.border_s = 'dashed4';
				break;
			case border_s === '13':
				result.border_s = 'dashed5';
				break;
        }
		// 获取形状边框透明度
		result.border_o = Math.ceil($path.attr('stroke-opacity') * 100);
		
        // 背景
        let background = {
            type: '',
            color: $path.attr('fill') || '#000000',
            image: null
        }
        let bg_type = $scale.attr('data-background');
        switch (true) {
            // 纯色
            case bg_type === 'color':
                background.type = 'color';
                break;
            // 渐变
            case bg_type === 'gradient':
                background.color = {};
                let $gradient = ele.find('.gradient_bg');
                let $linear = $gradient.find('linearGradient');
                let $radial = $gradient.find('radialGradient');
                let $stop = $gradient.find('stop');
                let gradient_type = $linear.length ? 'linear' : 'radial';
                let code_list = [];
                if (gradient_type === 'linear') {
                    let gradientTransform = $linear[0].attributes['gradientTransform'].value;
                    let rotate = Number(gradientTransform.slice(gradientTransform.indexOf("(") + 1, gradientTransform.indexOf(",")));
                    rotate = rotate + 90 >= 360 ? rotate - 270 : rotate + 90;
                    background.color.rotate = rotate;
                } else {
                    background.color.direction = $radial.attr('data-type');
                }
                background.color.type = gradient_type;
                background.color.code = []
                $stop.each(function () {
                    let code = {
                        color: $(this).attr('stop-color'),
                        opacity: Number($(this).attr('stop-opacity')) * 100,
                        offset: $(this).attr('offset').slice(0, -1),
                    }
                    code_list.push(code);
                });
                background.color.code = code_list;
                background.type = 'gradient';
                break;
            // 图片
            case bg_type.indexOf('image') >= 0:
                background.type = bg_type;
                background.color = '#000000';
                background.image = {};
                background.image.type = 'cover';
                break;
            default:
                break;
		}
        result.background = background;

		// 获取形状阴影
		let shadow_filter = $rotate.css('filter');
        result.shadow = {};
        if (shadow_filter !== 'none' && shadow_filter !== '' && ($rotate.attr('data-shadow-distance') != 0 || $rotate.attr('data-shadow-blur') != 0)){
			result.shadow.open = true;
			result.shadow.distance = $rotate.attr('data-shadow-distance');
			result.shadow.rotate = Number($rotate.attr('data-shadow-rotate')) + 90;
			result.shadow.blur = $rotate.attr('data-shadow-blur');
			result.shadow.color = $rotate.attr('data-shadow-color');
			result.shadow.opacity = $rotate.attr('data-shadow-opacity');
		}else{
			result.shadow = base_opt.fn.clone_object(this.template).shadow;
			result.shadow.open = false;
        }
		let $text = ele.find('.show_text'),
			$span = $text.find('span'),
			$ol = $text.find('ol').eq(0),
			$ul = $text.find('ul').eq(0),
			color_arr = [],
			size_arr = [],
			family_arr = [],
			font_weight_arr = [],
			font_style_arr = [],
			text_hilite_arr = [],
			text_shadow_arr = [],
			letter_spacing_arr = [],
			text_decoration_arr = [];
		family_arr.push($text.css('fontFamily'));
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
		// 获取文本字体颜色
		result.color = color_arr.length > 0 ? base_opt.fn.color_exchange_function('rgb', color_arr[0]) : base_opt.fn.color_exchange_function('rgb', $text.css('color'));
		// 获取文本字体大小
		result.size = size_arr.length > 0 ? base_opt.fn.unit_2_px(size_arr[0]) / 2 : base_opt.fn.unit_2_px($text.css('fontSize')) / 2;
		// 获取文本字体
		let family_name = '微软雅黑';
		switch (family_arr[0]) {
			case 'Calibri':
				family_name = '微软雅黑';
				break;
			case 'SimSun':
				family_name = '宋体';
				break;
			case 'KaiTi':
				family_name = '楷体';
				break;
			case 'LiSu':
				family_name = '隶书';
				break;
			case 'YouYuan':
				family_name = '幼圆';
				break;
			case 'Impact':
				family_name = 'IMPACT';
				break;
			case 'Arial':
				family_name = 'Arial';
				break;
			case 'Verdana':
				family_name = 'verdana';
				break;
		}
		result.font_family = family_name;
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
		// 获取文字对齐方式
		result.text_align = $text.css("textAlign");
        // 获取文本高亮
		result.hilite = text_hilite_arr.length > 0 ? base_opt.fn.color_exchange_function('rgb', text_hilite_arr[0]) : 'transparent';
		// 获取文本元素行高
		result.line_height = $text[0].style.lineHeight === '' ? '1' : $text[0].style.lineHeight;
		// 获取有序无序列表
		let ul_style = $ul.attr('class') || $ul.css('listStyleType')
		result.ul = ul_style || 'none';
		let ol_style = $ol.attr('class') || $ol.css('listStyleType');
		result.ol = ol_style || 'none';
		// 获取文本预设版式
		result.text_preset_key = $text.attr('data-preset') || 'none';
		// 是否是可编辑元素
		result.support_edit = ele_shape_editor || false;
		// 可编辑形状4个圆角值
		if (support_rect_fillet.indexOf(ele_shape_editor) >= 0) {
			let fillet_value = edit_shape_json[ele_shape_editor].getPath($all_path.eq(0).attr('d'));
			let rect_fillet_arr = [fillet_value.r1, fillet_value.r2, fillet_value.r3, fillet_value.r4].map(item => Math.floor(item));
			result.rect_fillet = rect_fillet_arr;
			result.rect_fillet_max = Math.max.apply(null, rect_fillet_arr);
		} else {
			result.rect_fillet = false;
			result.rect_fillet_max = 0;
		}
		return result;
	},
	// 格式化形状方法
	format_shape_data: function(data){
		// 错误情况判断
		if(!data || data.type !== 'shape') {
			console.error('params type error');
			return false;
		}
		// 旧形状数据不存在文本
		let result = base_opt.fn.clone_object(data),
			color = this.color ? this.color : '#ffffff',
			family = this.family ? this.family : '',
			content = `<div class="show_text" contenteditable="true" style="line-height:1.4; font-family: ${family}; font-size:20px; color:${color};"></div>`;
		if(!result.text){
			result.text = {
				scale: '0.5,0.5',
				content: content,
			};
		}
		// 阴影旧数据处理
		result = this.format_old_shadow(result);
		// 旧数据不存在翻转
		if (!result.reversal) {
			result.reversal = {
				translate: '0,0',
				matrix: '1,0,0,1,0,0'
			}
        }

        // 旧背景数据
        if (!result.background.type) {
            let bg_type = '';
            let o_color = result.background;
            let n_color = {};
            // 纯色
            if (typeof o_color === 'string') {
                bg_type = 'color';
                n_color = o_color;
            }
            // 渐变色
            else if (typeof o_color === 'object') {
                bg_type = 'gradient';
                n_color = {
                    rotate: o_color.rotate,
                    type: 'linear',
                    code: [{
                            color: o_color.left_color,
                            opacity: o_color.left_opacity || 100,
                            offset: o_color.left_x
                        },
                        {
                            color: o_color.right_color,
                            opacity: o_color.right_opacity || 100,
                            offset: o_color.right_x
                        }
                    ]
                }
            }
            result.background = {
                type: bg_type,
                color: n_color,
                image: null
            }
        }

		// 返回格式化数据
		return result;
	},
	// 形状元素 - 节点 -> 数据方法
	dom_2_ele: function(dom){
		// 错误状态判断
		if(!dom || dom.length <= 0) {
			console.error('params type error');
			return false;
		}
		let type = dom.attr('data-type'),
			transform = base_opt.get_transform(dom),
			$rotate = dom.find('.ele_rotate'),
			$svg = dom.find('.shape_path svg'),
			$scale = dom.find('.ele_scale'),
            $path = $scale.find('path'),
			d = [],
			obj = {};
		// 获取元素通用数据
		obj.type = type;
		obj.id = dom.attr('id');
		obj.lock = dom.hasClass('lock');
		obj.group = dom.attr('data-group') === 'undefined' ? '' : dom.attr('data-group');
		obj.link = $rotate.attr('title') && $rotate.attr('title') !== '' ? $rotate.attr('title') : null;
		obj.opacity = $rotate[0].style.opacity ? $rotate[0].style.opacity : 1;
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
		// point
		obj.translate = transform.translate.join(',');
		obj.rotate = transform.rotate.join(',');
		obj.scale = transform.scale.join(',');
		// 获取全部 path d 属性
		d = $path.map((i, ele) => $(ele).attr('d')).toArray();
		// 赋值对象
		obj.border_w = $path.attr('stroke-width') ? Number($path.attr('stroke-width')) * 2 : 0;
		obj.border_c = $path.attr('stroke');
		obj.border_s = Number($path.attr('data-border_s'));
		obj.border_o = $path.attr('stroke-opacity') ? Number($path.attr('stroke-opacity')) * 100 : 100;
		obj.width = $svg[0].getAttribute('width');
		obj.height = $svg[0].getAttribute('height');
		obj.d = d;
		obj.text = {
			scale: '0.5,0.5',
			content: dom.find('.show_text').prop('outerHTML'),
		};
        // 背景
        let background = {
            type:'',
            color: $path.attr('fill') || '#000000',
            image: null
        }
        let bg_type = $scale.attr('data-background');
        switch (true) {
            // 纯色
            case bg_type === 'color':
                background.type = 'color';
                break;
            // 渐变
            case bg_type === 'gradient':
                background.color = {};
                let $gradient = dom.find('.gradient_bg');
                let $linear = $gradient.find('linearGradient');
                let $radial = $gradient.find('radialGradient');
                let $stop = $gradient.find('stop');
                let gradient_type = $linear.length ? 'linear' : 'radial';
                if (gradient_type === 'linear') {
                    let gradientTransform = $linear[0].attributes['gradientTransform'].value;
                    background.color.rotate = gradientTransform.slice(gradientTransform.indexOf("(") + 1, gradientTransform.indexOf(","));
                }else{
                    background.color.direction = {
                        type: $radial.attr('data-type'),
                        cx: $radial.attr('cx'),
                        cy: $radial.attr('cy'),
                        r: $radial.attr('r')
                    }
                }
                background.color.type = gradient_type;
                background.color.code = []
                $stop.each(function () {
                    let code = {
                        color: $(this).attr('stop-color'),
                        opacity: Number($(this).attr('stop-opacity')) * 100,
                        offset: $(this).attr('offset').slice(0,-1),
                    }
                    background.color.code.push(code);
                })
                background.type = 'gradient';
                break;
            // 图片
            case bg_type.indexOf('image') >= 0:
                background.type = bg_type;
                background.color = '#000000';
                background.image = {
                    type: 'cover',
                    src: $svg.find('image').attr('xlink:href'),
                } 
                break;
            default:
                break;
        }
        obj.background = background;

		// 阴影
		if($rotate.css('filter') !== 'none'){
			obj.shadow = {
				open:true,
				distance: $rotate.attr('data-shadow-distance'),
				rotate: $rotate.attr('data-shadow-rotate'),
				blur: $rotate.attr('data-shadow-blur'),
				color: $rotate.attr('data-shadow-color'),
				opacity: $rotate.attr('data-shadow-opacity'),
			};
		}else{
			obj.shadow = base_opt.fn.clone_object(this.template).shadow;
			obj.shadow.open = false;
		}
		// 镜像翻转
		obj.reversal = {
			translate: $scale.attr('data-translate'),
			matrix: $scale.attr('data-matrix')
		};
		// 可编辑标识
		obj.shape_editor = dom.attr('shape-editor');
		if (obj.shape_editor) {
			try {
				obj.edit_point = JSON.parse(dom.find('.shape_path').attr('data-points'));
			} catch (err) {}
		}
		return obj;
	},
	// 形状元素 - 数据 -> 节点方法
	ele_2_dom:function(obj, is_str){
		// 错误状态判断
		if (!obj || typeof obj !== 'object' || !obj.id) {
			console.error('params type error');
			return false;
        }
        // 旧数据处理
		let ele = base_opt.fn.clone_object(obj);
		if (!ele.text || !ele.reversal || !ele.shadow || ele.shadow.x || ele.shadow.x == 0 || !ele.background.type){
			ele = this.format_shape_data(ele);
		};
		//1、数据处理
		ele.lock = (ele.lock ? 'lock' : '');
		ele.group = ele.group || '';
		ele.shape_editor = ele.shape_editor || '';
		ele.edit_point = ((ele.shape_editor && ele.edit_point) ? JSON.stringify(ele.edit_point) : '');
		let translate_arr = ele.translate.split(',');
		ele.translate_x = ((parseFloat(translate_arr[0]) < 0) ? - parseFloat(Math.abs(translate_arr[0])) : parseFloat(translate_arr[0]));
		ele.translate_y = ((parseFloat(translate_arr[1]) < 0) ? - parseFloat(Math.abs(translate_arr[1])) : parseFloat(translate_arr[1]));
		ele.link = ((!ele.link || ele.link == null) ? '' : base_opt.fn.escapeHtmlAttrString(ele.link));	
        ele.rotate_deg = ele.rotate.split(',')[0];
        // 背景部分
        let background = ele.background;
        ele.graBackground_id = '';
        ele.graBackground_html = '';
        ele.graBackground_rotate = '';
        ele.imgBackground_id = '';
        ele.imgBackground_html = '';
        ele.clip_d_html = '';
        switch (background.type) {
            // 渐变
            case 'gradient':
                ele.graBackground_id = `background_${base_opt.fn.uuid()}`;
                ele.graBackground_rotate = background.color.rotate;
                let gradient_html = '';
                // 线性渐变
                if (background.color.type === 'linear') {
                    gradient_html = `<linearGradient id="${ele.graBackground_id}" x1="0%" y1="0%" x2="100%" y2="0%" gradientTransform="rotate(${ele.graBackground_rotate},0.5,0.5)">`
                }
                // 径向渐变
                else{
                    let direction = background.color.direction;
                    gradient_html = `<radialGradient id="${ele.graBackground_id}" cx="${direction.cx}" cy="${direction.cy}" r="${direction.r}" data-type="${direction.type}" gradientUnits="userSpaceOnUse">`
                }
                $.each(background.color.code, (index, item) => {
                    gradient_html += `<stop offset="${item.offset}%" stop-color="${item.color}" stop-opacity="${item.opacity / 100}"></stop>`;
                });
                gradient_html += background.color.type === 'linear' ? `</linearGradient>` : `</radialGradient>`;
                ele.graBackground_html = gradient_html;
                break;
            // 图片
            case 'image':
                ele.imgBackground_html = `<image preserveAspectRatio="none" x="0" y="0" style="pointer-events: none;" width="${ele.width / ele.scale.split(',')[0]}" height="${ele.height / ele.scale.split(',')[1]}" xlink:href="${background.image.src}"></image>`
                ele.imgBackground_id = `background_${base_opt.fn.uuid()}`;
                break;
            default:
                break;
        }

		// 阴影部分
		let shadow = shape_opt.split_shadow_data(ele);
		let shadow_data = `data-shadow-rotate="${ele.shadow.rotate}" data-shadow-opacity="${ele.shadow.opacity}" data-shadow-blur="${ele.shadow.blur}" data-shadow-color="${ele.shadow.color}" data-shadow-distance="${ele.shadow.distance}"`;
		//形状部分
		let wrong_data;
		ele.d_html = '';
		ele.border_w = ((ele.border_w && !isNaN(ele.border_w)) ? Number(ele.border_w) : 0);
		ele.border_s = ((ele.border_s && !isNaN(ele.border_s)) ? Number(ele.border_s) : 0);
		ele.border_c = ((!ele.border_c || ele.border_c === null || ele.border_c === 'undefined') ? 'transparent' : ele.border_c);
		ele.border_o = ((ele.border_o && !isNaN(ele.border_o)) ? Number(ele.border_o) : 100);
		try{
			ele.d.forEach(function(d){
				if(d.indexOf('NaN') > 0) return;
				let fill = (ele.background.type === 'color' ? ele.background.color : `url(#${ele.graBackground_id})`),
					stroke_width = ((ele.border_w == 0) ? 0 : (ele.border_w / 2)),
					stroke_linejoin = ((ele.border_s == 16) ? 'round' : ''),
					stroke_linecap = ((ele.border_s === 16) ? 'round' : 'butt'),
					dasharray;//重置边框样式
				dasharray = base_opt.get_dasharray(+ele.border_s, ele.border_w);
                ele.d_html += `<path vector-effect="non-scaling-stroke" d="${d}" fill="${fill}" stroke="${ele.border_c}" stroke-width="${stroke_width}" stroke-dasharray="${dasharray}" stroke-linecap="${stroke_linecap}" stroke-linejoin="${stroke_linejoin}" stroke-miterlimit="8" stroke-opacity="${ele.border_o / 100}" data-border_s="${ele.border_s}"></path>`;
                if (ele.background.type.indexOf('image') >= 0) ele.clip_d_html += `<path d="${d}"></path>`;
			});
		}catch(e){
			console.log(e);
			wrong_data = true
        }
        if (wrong_data) return console.error('params type error');
		//处理数据，使用js处理
		let text_content = (ele.text && ele.text.content) ? ele.text.content : '<div class="show_text" contenteditable="true" style="line-height:1.4; font-size:20px; color:#ffffff;"></div>';
		$(text_content).attr('contenteditable', 'true');
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
						shape-editor="${ele.shape_editor}"
						data-animation-name="${animation_name}"
                        data-animation-default="${animation_default}"
                        data-animation-start="${animation_start}"
                        data-animation-duration="${animation_duration}"
                        data-animation-delay="${animation_delay}"
                        data-animation-index="${animation_index}"
					>
						<div class="ele_rotate" title="${ele.link}" data-rotate="${ele.rotate}" style="width:${ele.width}px; height:${ele.height}px; transform:rotate(${ele.rotate_deg}deg); opacity:${ele.opacity}; filter:${shadow}" ${shadow_data}>
							<div class="shape_path" data-points='${ele.edit_point}'>
								<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" overflow="visible" width="${ele.width}" height="${ele.height}">
                                    <defs class="gradient_bg">${ele.graBackground_html}</defs>
                                    <clipPath id="${ele.imgBackground_id}">${ele.clip_d_html}</clipPath>
                                    <g clip-path="url(#${ele.imgBackground_id})" class="ele_scale" data-scale="${ele.scale}" data-translate="${ele.reversal.translate}" data-matrix="${ele.reversal.matrix}" data-background="${ele.background.type}" transform="scale(${ele.scale})translate(${ele.reversal.translate})matrix(${ele.reversal.matrix})">
                                        ${ele.imgBackground_html}
										${ele.d_html}
									</g>
								</svg>
							</div>
							${text_content}
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
			param = Object.assign(template, obj),
			$dom;
		if (data.d) param.d = data.d;
		if (data.width) param.width = data.width;
		if (data.height) param.height = data.height;
		if (data.border_c) param.border_c = data.border_c;
		if (data.border_s) param.border_s = data.border_s;
		if (data.border_w) param.border_w = data.border_w;
		if (data.border_o) param.border_o = data.border_o;
		if (data.background) param.background = data.background;
		if (data.shape_editor) param.shape_editor = data.shape_editor;
		$dom = this.ele_2_dom(param);
		if(data.color){
			let $text = $dom.find('.show_text');
			$text.css('color', data.color);
		}
		if(data.family){
			let $text = $dom.find('.show_text');
			$text.css('fontFamily', data.family);
		}
		return $dom.prop('outerHTML');
	},
	// 设置缩放 data:{w,h}
	set_size: function(ele, data){
		// 错误状态判断
		if (!ele || !data || !data.w || !data.h) {
			console.error('params type error');
			return false;
		}
		let width = Number(data.w);
		let height = Number(data.h);
		let $rotate = ele.find('.ele_rotate');
		let $scale = ele.find('.ele_scale');
		let $svg = ele.find('.shape_path svg');
        let $bgImage = ele.find('image');
		let svg_matrix = $scale.attr('data-matrix') || `1,0,0,1,0,0`;
		let ele_rotate = base_opt.get_transform(ele, 'rotate');
		let ele_rect = $scale[0].getBBox();
		let new_translate_x = svg_matrix.split(',')[0] === '1' ? 0 : width;
		let new_translate_y = svg_matrix.split(',')[3] === '1' ? 0 : height;
		let eidtshape_data = {
			width: width,
			height: height,
			oldwidth: +$svg[0].getAttribute('width'),
			oldheight: +$svg[0].getAttribute('height'),
		};
		// 设置尺寸 & 修改旋转中心
		ele_rotate[1] = width / 2;
		ele_rotate[2] = height / 2;
		$svg[0].setAttribute('width', width);
		$svg[0].setAttribute('height', height);
		$rotate[0].setAttribute('data-rotate', ele_rotate.join(','));
		$rotate[0].style.width = `${width}px`;
		$rotate[0].style.height = `${height}px`;
		// 处理编辑形状
		edit_shape_operate(ele, eidtshape_data, {
			success: function () {
				$scale[0].setAttribute('data-scale', `1, 1`);
				$scale[0].setAttribute('data-translate', `${new_translate_x},${new_translate_y}`);
				$scale[0].setAttribute('transform', `scale(1, 1)translate(${new_translate_x},${new_translate_y})matrix(${svg_matrix})`);
			},
			error: function () {
				// 不可编辑的形状使用缩放属性设置大小
				let new_scale_x = width / (ele_rect.width || 1);
				let new_scale_y = height / (ele_rect.height || 1);
				new_translate_x = new_scale_x === 0 ? new_translate_x : new_translate_x / new_scale_x;
				new_translate_y = new_scale_x === 0 ? new_translate_y : new_translate_y / new_scale_y;
				$scale[0].setAttribute('data-scale', `${new_scale_x},${new_scale_y}`);
				$scale[0].setAttribute('data-translate', `${new_translate_x},${new_translate_y}`);
				$scale[0].setAttribute('transform', `scale(${new_scale_x},${new_scale_y})translate(${new_translate_x},${new_translate_y})matrix(${svg_matrix})`);

			}
        });
        // 处理背景图
        if ($bgImage.length) {
            let n_scale = $scale[0].getAttribute('data-scale').split(',');
            $bgImage[0].setAttribute('width', width / Number(n_scale[0]));
            $bgImage[0].setAttribute('height', height / Number(n_scale[1]));
        }
		// 处理阴影
		if ($rotate.css('filter') !== 'none') {
			let shadow_obj = {
				width: width,
				height: height,
				shadow: {
					open: true,
					distance: $rotate.attr('data-shadow-distance'),
					rotate: $rotate.attr('data-shadow-rotate'),
					blur: $rotate.attr('data-shadow-blur'),
					color: $rotate.attr('data-shadow-color'),
					opacity: $rotate.attr('data-shadow-opacity')
				}
			}
			$rotate[0].style.filter = `${this.split_shadow_data(shadow_obj)}`;
		}
	},
	// 设置边框颜色 data: String
	set_border_color: function(ele, data){
		// 错误状态判断
		if(!ele || ele.length !== 1 || !data) {
			console.error('params type error');
			return false;
		}
		let $path = ele.find('.ele_scale path');
		if (data === 'transparent') {
			$path.attr({
				'stroke': '',
				'stroke-width': '',
				'stroke-dasharray': '',
				'stroke-linecap': '',
				'data-border_s': '',
			});
		} else {
			$path.attr('stroke', data);
			// 当前不存在边框颜色时 - 设置边框宽度
			let border_w = Number($path.attr('stroke-width'));
			if(!border_w || isNaN(border_w)) this.set_border_width(ele, 1);
			// 当前不存在边框样式时 - 设置边框样式
			let border_s = +$path.attr('data-border_s');
			if (!border_s) {
				this.set_border_style(ele, 'solid');
			} else {
				// 重置边框样式
				let dasharray = base_opt.get_dasharray(border_s, border_w);
				$path.attr({ 'stroke-dasharray': dasharray });
			}
		}
	},
	// 设置边框宽度 data: Number
	set_border_width: function(ele, data){
		// 错误状态判断
		if(!ele || ele.length !== 1 || isNaN(Number(data))) {
			console.error('params type error');
			return false;
		}
		let $path = ele.find('.ele_scale path');
		// 设置边框宽度
		$path.attr('stroke-width', data / 2);
		// 当前不存在边框颜色时 - 设置边框颜色
		let border_c = $path.attr('stroke');
		if(!border_c || border_c === '') this.set_border_color(ele, '#000000');
		// 当前不存在边框样式时 - 设置边框样式
		let border_s = $path.attr('data-border_s'), dasharray;
		if(!border_s || border_s === ''){
			this.set_border_style(ele, 'solid');
		}else{
			// 重置边框样式
			dasharray = base_opt.get_dasharray(border_s, +data);
			$path.attr({ 'stroke-dasharray': dasharray });
		}
	},
	// 设置边框样式 data: String
	set_border_style: function(ele, data){
		// 错误状态判断
		if(!ele || ele.length !== 1 || !data) {
			console.error('params type error');
			return false;
		}
		let $path = ele.find('.ele_scale path'),
			bs, dasharray;
		if(data === 'none'){
			$path.attr({
				'stroke': '',
				'stroke-width': '',
				'stroke-dasharray': '',
				'data-border_s': '',
			});
		}else{
			// 当前不存在边框颜色时 - 设置边框宽度
			let border_w = $path.attr('stroke-width');
			if(!border_w || border_w === '') this.set_border_width(ele, 1);
			// 当前不存在边框颜色时 - 设置边框颜色
			let border_c = $path.attr('stroke');
			if(!border_c || border_c === '' || border_c === 'transparent') this.set_border_color(ele, '#000000');
			// 重置宽度
			border_w = $path.attr('stroke-width');
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
			dasharray = base_opt.get_dasharray(bs, border_w)
			$path.attr({
				'stroke-dasharray': dasharray,
				'stroke-linejoin': bs === 16 ? '' : 'round',
				'stroke-linecap': bs === 16 ? 'round' : 'butt', 
				'data-border_s': bs,
			});
		}
	},
	// 设置边框透明度 data : Number
	set_border_opacity: function(ele, data){
		// 错误状态判断
		if(!ele || ele.length !== 1 || isNaN(Number(data))) {
			console.error('params type error');
			return false;
		}
		let $path = ele.find('.ele_scale path');
		// 设置边框透明度
		$path.attr('stroke-opacity', data / 100);
	},
	// 设置背景 data: object
	set_background: function(ele, data){
		// 错误状态判断
		if(!ele || ele.length !== 1) {
			console.error('params type error');
			return false;
        }
        let $rotate = ele.find('.ele_rotate');
        let $scale = ele.find('.ele_scale');
        let $svg = ele.find('svg');
        let $clip = ele.find('clipPath');
        let $path = $scale.find('path');
        let color_opt = data.color;
        let image_opt = data.image;
        $scale.attr('data-background',data.type);
		switch (data.type) {
            // 纯色填充
            case 'color':
                $path.attr('fill', color_opt);
                // 移除背景图
                $clip.attr('id','').find('path').remove();
                $scale.attr('clip-path','').find('image').remove();
                // 移除渐变
                ele.find('linearGradient').remove();
                ele.find('radialGradient').remove();
                break;
            // 渐变填充
            case 'gradient':
                let $defs = ele.find('.gradient_bg');
                let gradient_id = `background_${base_opt.fn.uuid()}`;
                let gradient_html = '';
                // 线性渐变
                if (color_opt.type === 'linear') {
                    let rotate = Number(color_opt.rotate);
                    rotate = rotate - 90 < 0 ? 360 + rotate - 90 : rotate - 90;
                    gradient_html = `<linearGradient id="${gradient_id}" x1="0%" y1="0%" x2="100%" y2="0%" gradientTransform="rotate(${rotate},0.5,0.5)">`
                }
                // 径向渐变
                else {
                    let scale_x = Number($scale.attr('data-scale').split(',')[0]);
                    let scale_y = Number($scale.attr('data-scale').split(',')[1]);
                    let svg_w = Number($svg.attr('width')) / scale_x;
                    let svg_h = Number($svg.attr('height')) / scale_y;
                    let cx, cy, r;
                    switch (color_opt.direction) {
                        case 'left_top':
                            cx = 0;
                            cy = 0;
                            r = Math.sqrt(Math.pow(svg_w, 2) + Math.pow(svg_h, 2));
                            break;
                        case 'left_bottom':
                            cx = 0;
                            cy = svg_h;
                            r = Math.sqrt(Math.pow(svg_w, 2) + Math.pow(svg_h, 2));
                            break;
                        case 'right_top':
                            cx = svg_w;
                            cy = 0;
                            r = Math.sqrt(Math.pow(svg_w, 2) + Math.pow(svg_h, 2));
                            break;
                        case 'right_bottom':
                            cx = svg_w;
                            cy = svg_h;
                            r = Math.sqrt(Math.pow(svg_w, 2) + Math.pow(svg_h, 2));
                            break;
                        case 'top':
                            cx = svg_w / 2;
                            cy = 0;
                            r = Math.sqrt(Math.pow(svg_w, 2) + Math.pow(svg_h, 2));
                            break;
                        case 'bottom':
                            cx = svg_w / 2;
                            cy = svg_h;
                            r = Math.sqrt(Math.pow(svg_w, 2) + Math.pow(svg_h, 2));
                            break;
                        case 'center':
                            cx = svg_w / 2;
                            cy = svg_h / 2;
                            r = Math.sqrt(Math.pow(svg_w, 2) + Math.pow(svg_h, 2)) / 2;
                            break;
                        default:
                            break;
                    }
                    gradient_html = `<radialGradient id="${gradient_id}" cx="${cx}" cy="${cy}" r="${r}" data-type="${color_opt.direction}" gradientUnits="userSpaceOnUse">`
                }
                // 组装色标节点
                $.each(color_opt.code, (index, item) => {
                    gradient_html += `<stop offset="${item.offset}%" stop-color="${item.color}" stop-opacity="${item.opacity / 100}"></stop>`;
                });
                gradient_html += color_opt.type === 'linear' ? `</linearGradient>` : `</radialGradient>`;
                $defs[0].innerHTML = gradient_html;
                $scale.find('path').attr('fill', `url(#${gradient_id})`);
                // 移除背景图
                $clip.attr('id', '').find('path').remove();
                $scale.attr('clip-path', '').find('image').remove();
                break;
            // 图片填充
            case 'image':
                let width = base_opt.fn.unit_2_px($rotate.css('width')),
                    height = base_opt.fn.unit_2_px($rotate.css('height')),
                    scale_x = Number($scale.attr('data-scale').split(',')[0]),
                    scale_y = Number($scale.attr('data-scale').split(',')[1]),
                    image_id = `background_${base_opt.fn.uuid()}`,
                    image_html = '',
					d_html = '';
				// 已有图片
				if ($scale.find('image').length > 0){
					$scale.find('image').attr('xlink:href', image_opt.src);
				}else{
					image_html = `<image preserveAspectRatio="none" x="0" y="0" style="pointer-events: none;" width="${width / scale_x}" height="${height / scale_y}" xlink:href="${image_opt.src}"></image>`;
					$path.each(function(){
						d_html += `<path d="${$(this).attr('d')}"></path>`
						$(this).attr('fill', 'transparent');
					});
					let path_html = $scale[0].innerHTML;
					$scale[0].innerHTML = image_html + path_html;
					$clip[0].innerHTML = d_html;
					$clip.attr('id', image_id);
					$scale.attr('clip-path',`url(#${image_id})`);
					// 移除渐变
					ele.find('linearGradient').remove();
					ele.find('radialGradient').remove();
				}
                break;
            default:
                break;
        }
	},
	// 设置背景渐变 data: Object
	set_linear: function (ele, data) {
		// 错误状态判断
		if (!ele || typeof obj === 'string') {
			console.error('params type error');
			return false;
        }
	},
	// 设置投影
	set_shadow: function (ele, obj) {
		// 错误状态判断
		if (!ele || ele.length !== 1) {
			console.error('params type error');
			return false;
        }
        let shadow = 'none';
		let $rotate = ele.find('.ele_rotate');
		let width = $rotate.width();
		let height = $rotate.height();
		let result = base_opt.fn.clone_object(obj);
		let distance = Number(result.distance);
		let rotate = Number(result.rotate);
		let blur = Number(result.blur) / 2.5;
		let color = result.color;
		let opacity = Number(result.opacity) / 100;
        let x, y;
        rotate = rotate - 90 < 0 ? 360 + rotate - 90 : rotate - 90;
        if(obj.open){
            // 颜色&透明度计算
            color = base_opt.fn.color_exchange_function('rgba', result.color === 'transparent' ? '#000000' : result.color, false, opacity);
            // x,y坐标轴偏移值计算
            if (distance || distance == 0) {
                x = distance * Math.cos(rotate * Math.PI / 180);
                y = distance * Math.sin(rotate * Math.PI / 180);
            }
            x = (width * x * 0.01).toFixed(2);
            y = (height * y * 0.01).toFixed(2);
            shadow = `drop-shadow(${x}px ${y}px ${blur}px ${color})`;
        }
		$rotate.css({
			filter: shadow
		}).attr({
			'data-shadow-rotate': rotate,
			'data-shadow-distance': result.distance,
			'data-shadow-color': result.color,
			'data-shadow-blur': result.blur,
			'data-shadow-opacity': result.opacity,
		})
	},
	// 阴影属性拼接
	split_shadow_data: function(obj){
		let shadow = 'none';
		let _obj = base_opt.fn.clone_object(obj);
		// 旧数据处理
		_obj = this.format_old_shadow(_obj);
		if (_obj.shadow.open) {
			let distance = Number(_obj.shadow.distance);
			let shadow_rotate = Number(_obj.shadow.rotate);
			let shadow_x = distance * Math.cos(shadow_rotate * Math.PI / 180);
			let shadow_y = distance * Math.sin(shadow_rotate * Math.PI / 180);
			shadow_x = (Number(_obj.width) * shadow_x * 0.01).toFixed(2);
			shadow_y = (Number(_obj.height) * shadow_y * 0.01).toFixed(2);
			let shadow_color = base_opt.fn.color_exchange_function('rgba', _obj.shadow.color === 'transparent' ? '#000000' : _obj.shadow.color, false, +_obj.shadow.opacity / 100);
			shadow = `drop-shadow(${shadow_x}px ${shadow_y}px ${+_obj.shadow.blur / 2.5}px ${shadow_color})`;
		}
		return shadow;
	},
	// 阴影旧数据处理
	format_old_shadow: function (obj) {
		let result = base_opt.fn.clone_object(obj);
		let new_shadow = {};
		// 旧形状数据不存在阴影
		if (!result.shadow) {
			result.shadow = base_opt.fn.clone_object(this.template).shadow
			result.shadow.open = false;
		} else if ((result.shadow.x == 0 && result.shadow.y == 0 && result.shadow.blur == 0) || (result.shadow.distance == 0 && result.shadow.blur ==0)){
			result.shadow = base_opt.fn.clone_object(this.template).shadow
			result.shadow.open = false;
		} else if (result.shadow.x || result.shadow.x == 0) {
			new_shadow.open = true;
			new_shadow.distance = Math.round(Math.sqrt(Math.pow(result.shadow.x, 2) + Math.pow(result.shadow.y, 2)));
			new_shadow.opacity = ((result.shadow.color === 'transparent') ? 100 : Math.round((Number(result.shadow.color.split(' ')[18]) * 100)));
			new_shadow.color = ((result.shadow.color === 'transparent') ? 'transparent' : base_opt.fn.color_exchange_function('matrix', result.shadow.color));
			new_shadow.blur = result.shadow.blur;
			new_shadow.rotate = result.shadow.rotate;
			result.shadow = new_shadow;
		}
		return result;
	},
	// 设置镜像翻转
	set_reversal: function(ele,data) {
		// 错误状态判断
		if (!ele || ele.length !== 1 || typeof data !== 'string') {
			console.error('params type error');
			return false;
		};
		let $rotate = ele.find('.ele_rotate'),
			$scale = ele.find('.ele_scale'),
			width = base_opt.fn.unit_2_px($rotate.css('width')),
			height = base_opt.fn.unit_2_px($rotate.css('height')),
			scale_x = Number($scale.attr('data-scale').split(',')[0]),
			scale_y = Number($scale.attr('data-scale').split(',')[1]),
			translate = $scale.attr('data-translate'),
			matrix = $scale.attr('data-matrix').split(',');
		// 判断翻转类型
		switch (data) {
			case 'horizontal':    //水平翻转
				if (Number(matrix[0]) < 0) {
					matrix[0] = 1;
					$scale.attr({
						'data-translate': '0,' + translate.split(',')[1],
						'data-matrix': matrix.join(","),
						'transform': `scale(${$scale.attr('data-scale')})translate(${'0,' + translate.split(',')[1]})matrix(${matrix.join(",")})`
					});
				} else {
					matrix[0] = -1;
					$scale.attr({
						'data-translate': width / scale_x + ',' + translate.split(',')[1],
						'data-matrix': matrix.join(","),
						'transform': `scale(${$scale.attr('data-scale')})translate(${width / scale_x + ',' + translate.split(',')[1]})matrix(${matrix.join(",")})`
					});
				}
				break;
			case 'vertical':  //垂直翻转
				if (Number(matrix[3]) < 0) {
					matrix[3] = 1;
					$scale.attr({
						'data-translate': translate.split(',')[0] + ',0',
						'data-matrix': matrix.join(","),
						'transform': `scale(${$scale.attr('data-scale')})translate(${translate.split(',')[0] + ',' + 0})matrix(${matrix.join(",")})`
					});
				} else {
					matrix[3] = -1;
					$scale.attr({
						'data-translate': translate.split(',')[0] + ',' + height / scale_y,
						'data-matrix': matrix.join(","),
						'transform': `scale(${$scale.attr('data-scale')})translate(${translate.split(',')[0] + ',' + height / scale_y})matrix(${matrix.join(",")})`
					});
				}
				break;
		}
	},
	// 切换形状
	change: function(ele, data){
		// 错误状态判断
		if(!ele || ele.length !== 1 || !data || typeof data !== 'object') {
			console.error('params type error');
			return false;
		}
		// 获取当前元素对象
        let o_obj = this.dom_2_ele(ele);
        // 计算新元素数据
		let n_obj = {},
			n_ratio = data.width / data.height,
			n_rotate = o_obj.rotate.split(','),
			$n_ele;
		n_obj.d = typeof data.d === 'object' ? data.d : [data.d];
		n_obj.width = o_obj.width;
		n_obj.height = o_obj.width / n_ratio;
		n_obj.scale = `${n_obj.width / data.width},${n_obj.height / data.height}`;
		n_obj.shape_editor = data.shape_editor;
		n_rotate[1] = n_obj.width / 2;
		n_rotate[2] = n_obj.height / 2;
		n_obj.rotate = n_rotate.join(',');
		// 更新元素对象
		n_obj = Object.assign(o_obj, n_obj);
        $n_ele = this.ele_2_dom(n_obj);
        // 更新节点
		let $rotate = ele.find('.ele_rotate'),
			$scale = ele.find('.ele_scale'),
            $linear = ele.find('.gradient_bg').children(),
            $clipPath = ele.find('clipPath'),
			$svg = ele.find('.shape_path svg'),
			n_path = $n_ele.find('.ele_scale').html();
		ele.attr({
			'shape-editor': $n_ele.attr('shape-editor'),
        });
        if(n_obj.background.type === 'gradient'){
            let start = $n_ele.find('.ele_scale path').attr('fill').indexOf('#') + 1,
                end = $n_ele.find('.ele_scale path').attr('fill').length - 1;
            $linear.attr({
                'id': $n_ele.find('.ele_scale path').attr('fill').slice(start, end)
            })
        }else if(n_obj.background.type === 'image'){
            $clipPath.html($n_ele.find('clipPath').html());
        }
		
		$rotate.attr({
			'data-rotate': n_obj.rotate
		}).css({
			'width': n_obj.width,
			'height': n_obj.height
		});
		$scale.attr({
			'data-scale': n_obj.scale,
			'data-translate': n_obj.reversal.translate,
			'data-matrix': n_obj.reversal.matrix,
			'transform': `scale(${n_obj.scale})translate(${n_obj.reversal.translate})matrix(${n_obj.reversal.matrix})`
		});
		$svg.attr({
			'width': n_obj.width,
			'height': n_obj.height
		});
		$scale.html(n_path);
		this.set_size(ele, {
			w: n_obj.width,
			h: n_obj.height,
		});
	},
	// 设置节点大小适应
	fit_dom_size: function(ele){
		// 错误状态判断
		if(!ele || ele.length !== 1 || ele.attr('data-type') !== 'shape') {
			console.error('params type error');
			return false;
		}
		let $page = base_opt.get_canvas_page(),
			// 获取画布大小
			page_w = $page[0].offsetWidth,
			// 获取形状比例
			ele_msg = base_opt.compute_ele_offset(ele).page,
			ratio = ele_msg.w / ele_msg.h,
			ele_w = page_w / 5,
			ele_h = ele_w / ratio;
		// 最大尺寸限制
		if(ele_h > 200){
			ele_w = ele_w * 0.65;
			ele_h = ele_w / ratio;
		}
		this.set_size(ele, {w: ele_w, h: ele_h});
	},
	// 设置节点定位适应
	fit_dom_offset: function(ele){
		// 错误状态判断
		if(!ele || ele.length !== 1 || ele.attr('data-type') !== 'shape') {
			console.error('params type error');
			return false;
		}
		let $page = base_opt.get_canvas_page(),
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
	// 黏贴形状方法
	format_paste_shape:function(str){
		str =  str.replace(/<\?[^>]+\?>/g, '');
		let opt = this,
			$svg = $(str),
			$style = $svg.find('style'),
			css = new CssDom($style.html()),
			view_box = $svg[0].getAttribute('viewBox'),
			svg_w = $svg[0].getAttribute('width'),
			svg_h = $svg[0].getAttribute('height');
		// 获取不到宽高时不做操作
		if(!view_box && !svg_w && !svg_h) return false;
		let view_box_arr = view_box ? view_box.split(' ') : null;
		if(!svg_w && view_box_arr){
			svg_w = view_box_arr[2];
		}
		if(!svg_h && view_box_arr){
			svg_h = view_box_arr[3];
		}
		
		let element = {
			id: base_opt.fn.uuid(),
            type: 'shape',
            group: null,
            lock: false,
            opacity: 1,
            translate: '0,0',
            rotate: '0,0,0',
            scale: '1,1',
            border_c: null,
            border_w: null,
			border_s: null,
			border_o: null,
            width: svg_w,
            height: svg_h,
            background: "rgb(0,0,0)",
            d: [],
		}
		let element_list = [];

		let min_x = 0;
		let min_y = 0;
		let min_x_arr = [];
        let min_y_arr = [];
        let max_x_arr = [];
        let max_y_arr = [];
        // 遍历 line,polygon,ellipse,circle,rect,path 标签
		let $doms = $svg.find('line,polygon,ellipse,circle,rect,path');
		//获取非合并path元素
		$doms.each(function(){
			let $this = $(this);
			let data;
			if(this.tagName === 'line'){
				data = opt.format_line_2_path($this, css);
			}else if(this.tagName === 'polygon'){
				data = opt.format_polygon_2_path($this, css);
			}else if(this.tagName === 'ellipse' || this.tagName === 'circle'){
				data = opt.format_ellipse_2_path($this, css);
			}else if(this.tagName === 'rect'){
				data = opt.format_rect_2_path($this, css);
			}else if(this.tagName === 'path'){
				data = opt.format_path_2_path($this, css);
			}
			if(data){
				let data_element = data.element;
				data_element.id = base_opt.fn.uuid();
                element_list.push(data_element);
				//获取x、y最小值
				if(typeof(data.min_x) !== 'undefined'){
                    min_x_arr.push(data.min_x);
                    max_x_arr.push(data.max_x);
				}
				if(typeof(data.min_y) !== 'undefined'){
					min_y_arr.push(data.min_y);
                    max_y_arr.push(data.max_y);
                }
			}
        });
        
		//获取合并path元素
		min_x = Math.min.apply(null, min_x_arr);
        min_y = Math.min.apply(null, min_y_arr);
        // 计算path实际宽高
        let width = Math.max.apply(null, max_x_arr) - min_x;
        let height = Math.max.apply(null, max_y_arr) - min_y;
		element['width'] = (width / view_box_arr[2] * svg_w).toFixed(4);
        element['height'] = (height / view_box_arr[3] * svg_h).toFixed(4);

		$doms.each(function () {
			let $this = $(this);
			let data;
			if(this.tagName === 'line'){
				data = opt.format_line_2_path($this, css);
			}else if(this.tagName === 'polygon'){
				data = opt.format_polygon_2_path($this, css);
			}else if(this.tagName === 'ellipse' || this.tagName === 'circle'){
				data = opt.format_ellipse_2_path($this, css);
			}else if(this.tagName === 'rect'){
				data = opt.format_rect_2_path($this, css);
			}else if(this.tagName === 'path'){
				data = opt.format_path_2_path($this, css, min_x, min_y);
			}
			if(data){
				element.d.push(data.original_d);
			}
        });
		return {
			element : element,
			element_list : element_list
		};
	},
	// 黏贴形状 => line 标签处理方法
	format_line_2_path:function($line,css){
		// 错误状态判断
		if(typeof $line !== 'object') return false;
		let element = base_opt.fn.clone_object(this.template),
			line_x1 = Number($line.attr('x1')),
			line_y1 = Number($line.attr('y1')),
			line_x2 = Number($line.attr('x2')),
			line_y2 = Number($line.attr('y2')),
			new_color = $line.attr('stroke'),
			min_x = line_x1 < line_x2 ? line_x1 : line_x2,
			max_x = line_x1 < line_x2 ? line_x2 : line_x1,
			min_y = line_y1 < line_y2 ? line_y1 : line_y2,
			max_y = line_y1 < line_y2 ? line_y2 : line_y1,
			d = 'M' + (line_x1 - min_x) + ',' + (line_y1 - min_y) + ' L' + (line_x2 - min_x) + ',' + (line_y2 - min_y),
			original_d = 'M' + line_x1 + ',' + line_y1 + ' L' + line_x2 + ',' + line_y2,
			ele_w = (max_x - min_x) || 1,
			ele_h = (max_y - min_y) || 1,
			border_w = 0,
			border_s = '0';
		//内联、内部样式处理
		try{
			//边框颜色
			let css_new_color = $line.css('stroke');
			if(!css_new_color){
				css_new_color = this.format_path_css($line, css, 'stroke');
			}
			new_color = css_new_color ? base_opt.fn.color_exchange_function('rgb',css_new_color) : new_color;
			//边框粗细
			let css_border_w = $line.css('stroke-width');
			if(!css_border_w){
				css_border_w = this.format_path_css($line, css, 'stroke-width');
			}
			border_w = css_border_w ? Math.round((base_opt.fn.unit_2_px(css_border_w) || 0) * 2) : border_w;
			//边框样式
			let css_border_s = this.format_path_css($line, css, 'stroke-dasharray');
			border_s = css_border_s ? '8' : border_s;
		}catch(e){}
		element.d = [d];
		element.width = ele_w;
		element.height = ele_h;
		element.translate = min_x +','+ min_y;
		element.border_w = border_w;
		element.border_c = new_color;
		element.border_s = border_s;
		// 返回元素对象
		return {
			element : element,
			original_d : original_d
		};
	},
	// 黏贴形状 => polygon,polyline 标签处理方法
	format_polygon_2_path:function($polygon,css){
		// 错误状态判断
		if(typeof $polygon !== 'object') return false;
		let element = base_opt.fn.clone_object(this.template),
			tag_name = $polygon.prop('nodeName'),
			polygon_d = $polygon.attr('points'),
			new_fill_color = $polygon.attr('fill'),
			new_border_color = $polygon.attr('stroke'),
			border_width = Math.round($polygon.attr('stroke-width')*2),
			polygon_arr = polygon_d.replace(/[^-\d.\d]/g,",").split(',').filter(s => $.trim(s).length > 0),
			x_arr = [],
			y_arr = [];
		// 分离点的 x坐标 和 y坐标
		polygon_arr.forEach(function(item, index){
			if(index%2 === 0) x_arr.push(item);
			if(index%2 === 1) y_arr.push(item);
		});
		// 获取 d 属性
		let d = 'M',
			min_x = Math.min.apply(null, x_arr),
			max_x = Math.max.apply(null, x_arr),
			min_y = Math.min.apply(null, y_arr),
			max_y = Math.max.apply(null, y_arr),
			width = max_x - min_x,
			height = max_y - min_y;
		let new_x_arr = [];
		let new_y_arr = [];
		x_arr.forEach(function(item, index){new_x_arr[index] = Math.round((item - min_x) * 1000)/1000;});
		y_arr.forEach(function(item, index){new_y_arr[index] = Math.round((item - min_y) * 1000)/1000;});
		new_x_arr.forEach(function(item, index){
			switch (true) {
				case index !== 0 && tag_name === 'polygon':
					d += 'L'+ item +','+ new_y_arr[index] +' ';
					break;
				case index !== 0 && tag_name === 'polyline':
					d += 'L'+ item +','+ new_y_arr[index] + ' ';
					break;
				default:
					d += item +','+ new_y_arr[index] + ' ';
					break;
			}
		});
		let original_d = 'M';
		new_x_arr = [];
		new_y_arr = [];
		x_arr.forEach(function(item, index){new_x_arr[index] = Math.round((item) * 1000)/1000;});
		y_arr.forEach(function(item, index){new_y_arr[index] = Math.round((item) * 1000)/1000;});
		new_x_arr.forEach(function(item, index){
			switch (true) {
				case index !== 0 && tag_name === 'polygon':
					original_d += 'L'+ item +','+ new_y_arr[index] +' ';
					break;
				case index !== 0 && tag_name === 'polyline':
					original_d += 'L'+ item +','+ new_y_arr[index] + ' ';
					break;
				default:
					original_d += item +','+ new_y_arr[index] + ' ';
					break;
			}
		});
		//内联、内部样式处理
		try{
			//填充颜色
			let css_new_fill_color = $polygon.css('fill');
			if(!css_new_fill_color){
				css_new_fill_color = this.format_path_css($polygon, css, 'fill');
			}
			new_fill_color = css_new_fill_color ? base_opt.fn.color_exchange_function('rgb',css_new_fill_color) : new_fill_color;
			//边框颜色
			let css_new_border_color = $polygon.css('stroke');
			if(!css_new_border_color){
				css_new_border_color = this.format_path_css($polygon, css, 'stroke');
			}
			new_border_color = css_new_border_color ? base_opt.fn.color_exchange_function('rgb',css_new_border_color) : new_border_color;
			//边框粗细
			let css_border_width = $polygon.css('stroke-width');
			if(!css_border_width){
				css_border_width = this.format_path_css($polygon, css, 'stroke-width');
			}
			border_width = css_border_width ? Math.round((base_opt.fn.unit_2_px(css_border_width) || 0) * 2) : border_width;
		}catch(e){}
		// 修改元素对象属性
		element.d = tag_name === 'polyline' ? [d] : [d +'z'];
		element.width = width;
		element.height = height;
		element.translate = Number(min_x) +','+ Number(min_y);
		element.rotate = '0,'+ width / 2 +','+ height / 2;
		element.background = {type:'color',color:new_fill_color,image:null};
		element.border_s = '0';
		element.border_w = border_width >= 1 ? border_width:1;
		element.border_c = new_border_color;
		// 返回元素对象
		return {
			element : element,
			original_d : original_d
		};
	},
	// 黏贴形状 => ellipse,circle 标签处理方法
	format_ellipse_2_path:function($ellipse,css){
		// 错误状态判断
		if(typeof $ellipse !== 'object') return false;
		let element = base_opt.fn.clone_object(this.template),
			cx = Number($ellipse.attr('cx')) || 0,
			cy = Number($ellipse.attr('cy')) || 0,
			new_color = $ellipse.attr('fill'),
			new_border_color = $ellipse.attr('stroke'),
			border_width = Math.round($ellipse.attr('stroke-width')*2),
			rx = $ellipse.attr('r') ? Number($ellipse.attr('r')) : Number($ellipse.attr('rx')),
			ry = $ellipse.attr('r') ? Number($ellipse.attr('r')) : Number($ellipse.attr('ry')),
			min_x = cx - rx,
			min_y = cy - ry;
		// 获取 d 属性
		if (isNaN(cx - cy + rx - ry)) return;
		let d = 'M 0 ' + ry + 'a' + rx + ' ' + ry + ' 0 1 0 ' + (2*rx) + ' 0' + 'a' + rx + ' ' + ry + ' 0 1 0 ' + (-2*rx) + ' 0' + 'z';
		let original_d = 'M' + cx + ' ' + (cy - ry) +'A' + rx + ' ' + ry + ' 0 1 0 ' + cx + ' ' + (cy + ry) +'A' + rx + ' ' + ry + ' 0 1 0 ' + cx + ' ' + (cy - ry) + 'Z';
		//内联、内部样式处理
		try{
			//填充颜色
			let css_new_color = $ellipse.css('fill');
			if(!css_new_color){
				css_new_color = this.format_path_css($ellipse, css, 'fill');
			}
			new_color = css_new_color ? base_opt.fn.color_exchange_function('rgb',css_new_color) : new_color;
			//边框颜色
			let css_new_border_color = $ellipse.css('stroke');
			if(!css_new_border_color){
				css_new_border_color = this.format_path_css($ellipse, css, 'stroke');
			}
			new_border_color = css_new_border_color ? base_opt.fn.color_exchange_function('rgb',css_new_border_color) : new_border_color;
			//边框粗细
			let css_border_width = $ellipse.css('stroke-width');
			if(!css_border_width){
				css_border_width = this.format_path_css($ellipse, css, 'stroke-width');
			}
			border_width = css_border_width ? Math.round((base_opt.fn.unit_2_px(css_border_width) || 0) * 2) : border_width;
		}catch(e){}
		// 修改元素对象属性
		element.width = rx * 2;
		element.height = ry * 2;
		element.d = [d];
		element.translate = Number(min_x) +','+ Number(min_y);
		element.rotate = '0,'+ Number(rx * 2) +','+ Number(ry * 2);
		element.background = {type:'color',color:new_color,image:null};
		element.border_s = '0';
		element.border_w = border_width >= 1 ? border_width:1;
		element.border_c = new_border_color;
		// 返回元素对象
		return {
			element : element,
			original_d : original_d
		};
	},
	// 黏贴形状 => rect 标签处理方法
	format_rect_2_path:function($rect,css){
		// 错误状态判断
		if(typeof $rect !== 'object') return false;
		let element = base_opt.fn.clone_object(this.template),
			x = Number($rect.attr('x')) || 0,
			y = Number($rect.attr('y')) || 0,
			new_color = $rect.attr('fill'),
			new_border_color = $rect.attr('stroke'),
			border_width = Math.round($rect.attr('stroke-width')*2),
			rx = Number($rect.attr('rx')) || Number($rect.attr('ry')) || 0,
			ry = Number($rect.attr('ry')) || Number($rect.attr('rx')) || 0,
			width = Number($rect.attr('width')),
			height = Number($rect.attr('height')),
			min_x = x,
			min_y = y - ry,
			d = '',
			original_d = '';
		if(isNaN(x - y + width - height + rx - ry)) return false;
		rx = rx > width / 2 ? width / 2 : rx;
		ry = ry > height / 2 ? height / 2 : ry;
		// 获取 d 属性
		if(rx === 0 || ry === 0){
			d = 'M'+ (x-min_x) +','+ (y-min_y) +' L'+ (x+width-min_x) +','+ (y-min_y) +' L'+ (x+width-min_x) +','+ (y+height-min_y) +' L'+ (x-min_x) +','+ (y+height-min_y) +' Z';
			original_d = 'M'+ (x) +','+ (y) +' L'+ (x+width) +','+ (y) +' L'+ (x+width) +','+ (y+height) +' L'+ (x) +','+ (y+height) +' Z';
		}else{
			d = 'M'+ (x-min_x) +' '+ (y-min_y) +'a'+ rx +' '+ ry +' 0 0 1 '+ rx +' '+ (-ry) +'h'+ (width-rx-rx) +'a'+ rx +' '+ ry +' 0 0 1 '+ rx +' '+ ry +'v'+ (height-ry-ry) +'a'+ rx +' '+ ry +' 0 0 1 '+ -rx +' '+ ry +'h'+ (rx+rx-width) +'a'+ rx +' '+ ry +' 0 0 1 '+ -rx +' '+ -ry + 'z';
			original_d = 'M'+ (x) +' '+ (y) +'a'+ rx +' '+ ry +' 0 0 1 '+ rx +' '+ (-ry) +'h'+ (width-rx-rx) +'a'+ rx +' '+ ry +' 0 0 1 '+ rx +' '+ ry +'v'+ (height-ry-ry) +'a'+ rx +' '+ ry +' 0 0 1 '+ -rx +' '+ ry +'h'+ (rx+rx-width) +'a'+ rx +' '+ ry +' 0 0 1 '+ -rx +' '+ -ry + 'z';
		}
		//内联、内部样式处理
		try{
			//填充颜色
			let css_new_color = $rect.css('fill');
			if(!css_new_color){
				css_new_color = this.format_path_css($rect, css, 'fill');
			}
			new_color = css_new_color ? base_opt.fn.color_exchange_function('rgb',css_new_color) : new_color;
			//边框颜色
			let css_new_border_color = $rect.css('stroke');
			if(!css_new_border_color){
				css_new_border_color = this.format_path_css($rect, css, 'stroke');
			}
			new_border_color = css_new_border_color ? base_opt.fn.color_exchange_function('rgb',css_new_border_color) : new_border_color;
			//边框粗细
			let css_border_width = $rect.css('stroke-width');
			if(!css_border_width){
				css_border_width = this.format_path_css($rect, css, 'stroke-width');
			}
			border_width = css_border_width ? Math.round((base_opt.fn.unit_2_px(css_border_width) || 0) * 2) : border_width;
		}catch(e){}
		// 修改元素对象属性
		element.width = width;
		element.height = height;
		element.d = [d];
		element.translate = Number(min_x) +','+ Number(min_y);
		element.rotate = '0,'+ Number(width / 2) +','+ Number(height / 2);
		element.background = {type:'color',color:new_color,image:null};
		element.border_s = '0';new_color
		element.border_w = border_width >= 1 ? border_width:1;
		element.border_c = new_border_color;
		// 返回元素对象
		return {
			element : element,
			original_d : original_d
		};
	},
	// 黏贴形状 => path 标签处理方法
	format_path_2_path:function($path,css,min_x,min_y){
		// 错误状态判断
		if(typeof $path !== 'object') return false;
		let element = base_opt.fn.clone_object(this.template),
			d = $path.attr('d'),
			new_color = $path.attr('fill'),
			new_border_color = $path.attr('stroke'),
			border_width = Math.round(($path.attr('stroke-width') || 0) * 2);
		// 生成节点 获取宽高尺寸
		let $testdiv = $('<div style="position: absolute; left: -9999999px; top: -9999999px; visibility: hidden;"></div>');
		let $testsvg = $('<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1"></svg>');
		$testsvg.append($path);
		$testdiv.append($testsvg).appendTo($('body'));
		let path_rect = $testdiv.find('path')[0].getBBox();
		let width = path_rect.width;
		let height = path_rect.height;
		$testdiv.remove();
		// 绝对坐标转换
		let commands = parseSVG(d);
		makeAbsolute(commands);
		// x,y最小值
		if(typeof(min_x) === 'undefined'){
			min_x = path_rect.x;
		}
		if(typeof(min_y) === 'undefined'){
			min_y = path_rect.y;
		}
		let x_arr = [];
		let y_arr = [];
		// path d 拼接字符串
		let params = ['rx','ry','xAxisRotation','largeArc','sweep','x1','y1','x2','y2','x','y'];
		let new_d = commands.map((cmd) => {
			let a = [];
			let code = cmd.code;
			if (code === 'Z') {
				return code;
            }
			// H 命令 push x
			if (code === 'H') {
				x_arr.push(cmd['x']);
				let val = cmd['x'] - min_x;
				val = +((val - ~~val).toFixed(3)) + ~~val;
				a.push(val);
			} else
			// V 命令 push y
			if (code === 'V') {
				y_arr.push(cmd['y']);
				let val = cmd['y'] - min_y;
				val = +((val - ~~val).toFixed(3)) + ~~val;
				a.push(val);
			} else {
				params.forEach((param) => {
					if (param in cmd) {
						let val = cmd[param] * 1;
						if (a.length && !isNaN(val)) a.push(' ');
						// 最多显示小数后3位
						if (['x1','x2','x'].indexOf(param) >= 0) {
                            x_arr.push(val);
							val -= min_x;
						}
						if (['y1','y2','y'].indexOf(param) >= 0) {
							y_arr.push(val);
							val -= min_y;
						}
						val = +((val - ~~val).toFixed(3)) + ~~val;
						a.push(val);
					}
				});
			}
			return ` ${code + a.join(' ')}`;
		}).join('');
		new_d = new_d.replace(/\s+/g, ' ');
		//内联、内部样式处理
		try{
			//填充颜色
			let css_new_color = $path.css('fill');
			if(!css_new_color){
				css_new_color = this.format_path_css($path, css, 'fill');	
			}
			new_color = css_new_color ? base_opt.fn.color_exchange_function('rgb',css_new_color) : new_color;
			//边框颜色
			let css_new_border_color = $path.css('stroke');
			if(!css_new_border_color){
				css_new_border_color = this.format_path_css($path, css, 'stroke');
			}
			new_border_color = css_new_border_color ? base_opt.fn.color_exchange_function('rgb',css_new_border_color) : new_border_color;
			//边框粗细
			let css_border_width = $path.css('stroke-width');
			if(!css_border_width){
				css_border_width = this.format_path_css($path, css, 'stroke-width');
			}
			border_width = css_border_width ? Math.round((base_opt.fn.unit_2_px(css_border_width) || 0) * 2) : border_width;
		}catch(e){}
		// 修改元素对象属性
		element.width = width.toFixed(3);
		element.height = height.toFixed(3);
		element.d = [new_d];
		element.translate = `${path_rect.x},${path_rect.y}`;
		element.rotate = '0,'+ Number(width / 2) +','+ Number(height / 2);
		element.background = {type:'color',color:new_color,image:null};
		element.border_s = '0';
		element.border_w = border_width >= 1 ? border_width : 1;
        element.border_c = new_border_color;
        // 返回元素对象
		return {
			element : element,
			original_d : new_d,
			min_x : Math.min.apply(null, x_arr),
			max_x : Math.max.apply(null, x_arr),
			min_y : Math.min.apply(null, y_arr),
			max_y : Math.max.apply(null, y_arr),
		};
	},
	format_path_css:function($dom,css,property){
		let property_val,
			_class = $dom.attr('class'),
			class_arr = _class ? _class.split(' ') : [];
		if(class_arr.length > 0){
			$.each(css.property(property), function(i,item){
				var match = false;
				$.each(class_arr,function(j,jtem){
					if(item.selectors.indexOf('.' + jtem.replace(/\s+/g,'')) > -1){
						match = true;
						return false;
					}
				});
				if(match && item.declarations[property]){
					property_val = item.declarations[property];
				}
			});
		}
		return property_val;
	}
};
export default shape_opt;