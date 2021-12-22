import base_opt from '@/assets/pc/js/opt/base_opt.js';
import axios from '@/util/axios';

let image_opt = {
	// 图片元素模板
	template: {
		id: '',
		type: 'img',
		group: false,
		lock: false,
		opacity: 1,
		translate: '0,0',
		rotate: '0,0,0',
		scale: '1,1',
		url: '',
		image_w: 0,
		image_h: 0,
		clip: null,
		border_w: null,
		border_s: null,
		border_c: null,
		border_o: null,
		shadow:{
			open:false,
			distance: 15,
			blur: 15,
			rotate: 50,
			opacity: 25,
			color: '#000000',
		},
		animation: [],
		staticImage: '', // 新增字段，存储svg素材的静态图以供导出使用
	},
	// 应用的模板
	using_data: {},
	// 图片裁剪前保存的旧裁剪数据
	before_clip_image: null,
	// 多图片上传 - 居中位置记录
	previous_img_translate:{x:0, y:0},
	// 图片元素裁剪形状模板
	clip_shape: [
		{
			mode: 'shape',
			type: 'RECT',
			w: 400,
			h: 400,
			d: 'M0,0 L400,0 L400,400 L0,400 L0,0 L0,0 Z',
		},
		{
			mode: 'shape',
			type: 'ROUND_RECT',
			w: 400,
			h: 400,
			d: 'M0.006,46.320 C0.006,20.741 20.793,0.006 46.435,0.006 L354.564,0.006 C380.205,0.006 400.994,20.741 400.994,46.320 L400.994,353.680 C400.994,379.262 380.205,399.994 354.564,399.994 L46.435,399.994 C20.793,399.994 0.006,379.262 0.006,353.680 L0.006,46.320 Z'
		},
		{
			mode: 'shape',
			type: 'SNIP_1_RECT',
			w: 400,
			h: 400,
			d: 'M0.001,0.006 L333.428,0.006 L400.000,66.671 L400.000,399.994 L0.001,399.994 L0.001,0.006 L0.001,0.006 Z'
		},
		{
			mode: 'shape',
			type: 'SNIP_2_SAME_RECT',
			w: 400,
			h: 400,
			d: 'M66.671,0.006 L333.326,0.006 L399.994,66.671 L399.994,399.994 L399.994,399.994 L0.006,399.994 L0.006,399.994 L0.006,66.671 L66.671,0.006 L66.671,0.006 Z'
		},
		{
			mode: 'shape',
			type: 'SNIP_2_DIAG_RECT',
			w: 400,
			h: 400,
			d: 'M0.006,0.006 L333.326,0.006 L399.994,66.671 L399.994,399.994 L399.994,399.994 L66.671,399.994 L0.006,333.330 L0.006,0.006 L0.006,0.006 L0.006,0.006 Z'
		},
		{
			mode: 'shape',
			type: 'ROUND_2_SAME_RECT',
			w: 400,
			h: 400,
			d: 'M66.838,0.006 L334.160,0.006 C371.073,0.006 400.994,29.853 400.994,66.671 L400.994,399.994 L0.006,399.994 L0.006,66.671 C0.006,29.853 29.927,0.006 66.838,0.006 L66.838,0.006 Z'
		},
		{
			mode: 'shape',
			type: 'ROUND_2_DIAG_RECT',
			w: 400,
			h: 400,
			d: 'M66.736,0.006 L401.000,0.006 L401.000,333.330 C401.000,370.147 371.117,399.994 334.262,399.994 L0.001,399.994 L0.001,66.671 C0.001,29.853 29.879,0.006 66.736,0.006 L66.736,0.006 Z'
		},
		{
			mode: 'shape',
			type: 'ELLIPSE',
			w: 400,
			h: 400,
			d: 'M0.001,200.000 C0.001,89.546 89.543,0.006 199.999,0.006 C310.455,0.006 400.000,89.546 400.000,200.000 C400.000,310.454 310.455,399.994 199.999,399.994 C89.543,399.994 0.001,310.454 0.001,200.000 L0.001,200.000 Z'
		},
		{
			mode: 'shape',
			type: 'RT_TRIANGLE',
			w: 400,
			h: 400,
			d: 'M0.001,399.994 L0.001,0.006 L400.000,399.994 L0.001,399.994 L0.001,399.994 Z'
		},
		{
			mode: 'shape',
			type: 'PARALLELOGRAM',
			w: 400,
			h: 400,
			d: 'M0.006,398.994 L69.302,0.006 L398.994,0.006 L329.695,398.994 L0.006,398.994 L0.006,398.994 Z'
		},
		{
			mode: 'shape',
			type: 'TRAPEZOID',
			w: 400,
			h: 400,
			d: 'M0.006,398.994 L72.685,0.006 L326.314,0.006 L398.994,398.994 L0.006,398.994 L0.006,398.994 Z'
		},
		{
			mode: 'shape',
			type: 'DIAMOND',
			w: 400,
			h: 400,
			d: 'M0.006,197.500 L197.501,0.006 L394.994,197.500 L197.501,394.994 L0.006,197.500 L0.006,197.500 Z'
		},
		{
			mode: 'shape',
			type: 'PENTAGON',
			w: 400,
			h: 400,
			d: 'M0.006,152.407 L199.501,0.006 L398.994,152.407 L322.795,398.994 L76.205,398.994 L0.006,152.407 L0.006,152.407 Z'
		},
		{
			mode: 'shape',
			type: 'HEXAGON',
			w: 400,
			h: 400,
			d: 'M0.006,199.000 L96.128,0.006 L301.872,0.006 L397.994,199.000 L301.872,397.994 L96.128,397.994 L0.006,199.000 L0.006,199.000 Z'
		},
		{
			mode: 'shape',
			type: 'HEPTAGON',
			w: 400,
			h: 400,
			d: 'M0.001,255.952 L39.415,78.834 L198.999,0.006 L358.586,78.834 L398.000,255.952 L287.563,397.994 L110.438,397.994 L0.001,255.952 L0.001,255.952 Z'
		},
		{
			mode: 'shape',
			type: 'OCTAGON',
			w: 400,
			h: 400,
			d: 'M0.006,116.574 L116.573,0.006 L281.425,0.006 L397.994,116.574 L397.994,281.428 L281.425,397.994 L116.573,397.994 L0.006,281.428 L0.006,116.574 L0.006,116.574 Z'
		},
		{
			mode: 'shape',
			type: 'DECAGON',
			w: 400,
			h: 400,
			d: 'M0.006,199.500 L38.105,76.205 L137.852,0.006 L261.146,0.006 L360.894,76.205 L398.994,199.500 L360.894,322.795 L261.146,398.994 L137.852,398.994 L38.105,322.795 L0.006,199.500 L0.006,199.500 Z'
		},
		{
			mode: 'shape',
			type: 'DODECAGON',
			w: 400,
			h: 400,
			d: 'M0.001,146.410 L53.593,53.599 L146.406,0.006 L253.592,0.006 L346.406,53.599 L400.000,146.410 L400.000,253.594 L346.406,346.404 L253.592,399.994 L146.406,399.994 L53.593,346.404 L0.001,253.594 L0.001,146.410 L0.001,146.410 Z'
		},
		{
			mode: 'shape',
			type: 'TEARDROP',
			w: 400,
			h: 400,
			d: 'M0.006,200.500 C0.006,89.770 89.769,0.006 200.501,0.006 C267.330,0.006 334.160,0.006 400.994,0.006 C400.994,66.838 400.994,133.670 400.994,200.500 C400.994,311.230 311.231,400.994 200.501,400.994 C89.769,400.994 0.006,311.230 0.006,200.500 L0.006,200.500 Z'
		},
		{
			mode: 'shape',
			type: 'PLUS',
			w: 400,
			h: 400,
			d: 'M0.006,99.854 L100.002,99.854 L100.002,0.001 L299.995,0.001 L299.995,99.854 L399.994,99.854 L399.994,300.145 L299.995,300.145 L299.995,400.000 L100.002,400.000 L100.002,300.145 L0.006,300.145 L0.006,99.854 L0.006,99.854 Z'
		},
		{
			mode: 'shape',
			type: 'PLAQUE',
			w: 400,
			h: 400,
			d: 'M0.001,66.502 C36.727,66.502 66.502,36.730 66.502,0.001 L332.495,0.001 C332.495,36.730 362.271,66.502 399.000,66.502 L399.000,332.499 C362.271,332.499 332.495,362.271 332.495,399.000 L66.502,399.000 C66.502,362.271 36.727,332.499 0.001,332.499 L0.001,66.502 Z'
		},
		{
			mode: 'shape',
			type: 'HEART',
			w: 400,
			h: 400,
			d: 'M200.501,96.239 C283.438,-140.020 606.890,96.239 200.501,400.001 C-205.891,96.239 117.564,-140.020 200.501,96.239 L200.501,96.239 Z'
		},
		{
			mode: 'shape',
			type: 'STAR_5',
			w: 400,
			h: 400,
			d: 'M0.006,152.787 L152.788,152.787 L200.001,0.001 L247.209,152.787 L399.994,152.787 L276.391,247.211 L323.604,400.000 L200.001,305.571 L76.396,400.000 L123.609,247.211 L0.006,152.787 L0.006,152.787 Z'
		},
		{
			mode: 'shape',
			type: 'STAR_6',
			w: 400,
			h: 400,
			d: 'M0.001,99.753 L132.999,99.751 L199.499,0.006 L265.999,99.751 L399.000,99.753 L332.499,199.500 L399.000,299.249 L265.999,299.249 L199.499,398.994 L132.999,299.249 L0.001,299.249 L66.499,199.500 L0.001,99.753 L0.001,99.753 Z'
		},
		{
			mode: 'shape',
			type: 'STAR_7',
			w: 400,
			h: 400,
			d: 'M0.006,256.597 L61.445,177.573 L39.519,79.027 L138.062,79.027 L199.501,0.001 L260.940,79.027 L359.481,79.027 L337.554,177.573 L398.994,256.597 L310.213,300.453 L288.282,399.000 L199.501,355.143 L110.718,399.000 L88.789,300.453 L0.006,256.597 L0.006,256.597 Z'
		},
		{
			mode: 'shape',
			type: 'TRIANGLE',
			w: 400,
			h: 400,
			d: 'M0.006,398.994 L199.501,0.006 L398.994,398.994 L0.006,398.994 L0.006,398.994 Z'
		},
	],
	// 初始化方法
	init: function(){
		let base = Object.assign({}, base_opt);
		return Object.assign(base,this);
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
			image_msg = this.get_edit_message(ele),
			result = Object.assign(base_msg, image_msg);
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
		let $border = ele.find('.image_border path'),
			$rotate = ele.find('.ele_rotate'),
			$image = ele.find('.img_content image'),
			result = {};
		// 获取链接
		result.image_src = $image.attr("href");
		// 获取图片透明度
		result.opacity = Math.ceil($rotate.css('opacity') * 100);
		// 获取图片边框颜色
		result.border_c = $border.attr('stroke') ? base_opt.fn.color_exchange_function('rgb',$border.attr('stroke')) : 'transparent';
		// 获取图片边框厚度
		result.border_w = $border.attr('stroke-width')  ?  Number($border.attr('stroke-width')) * 2 : '0';
		// 获取图片边框透明度
		result.border_o = $border.attr('stroke-opacity')  ?  Number($border.attr('stroke-opacity')) * 100 : 100;
		// 获取图片边框样式
        let border_s = $border.attr('data-border_s');
		switch(true){
            case result.border_w == 0 || !border_s:
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
		// 获取图片阴影
		let shadow_filter = $rotate.css('filter');
		result.shadow = {};
        if (shadow_filter !== 'none' && shadow_filter !== '' && ($rotate.attr('data-shadow-distance') != 0 || $rotate.attr('data-shadow-blur') != 0)) {
            result.shadow.open = true;
			result.shadow.distance = $rotate.attr('data-shadow-distance');
			result.shadow.rotate = $rotate.attr('data-shadow-rotate');
			result.shadow.blur = $rotate.attr('data-shadow-blur');
			result.shadow.color = $rotate.attr('data-shadow-color');
			result.shadow.opacity = $rotate.attr('data-shadow-opacity');
		}else{
			result.shadow = base_opt.fn.clone_object(this.template).shadow;
			result.shadow.open = false;
        }
        // 获取与裁剪有关的图片信息
        result.clip_message = {};
        result.clip_message.type = ele.find(".image_clip").attr('data-type');
        result.clip_message.new_w = Math.floor(ele.find('.img_content svg').attr('width'));
        result.clip_message.new_h = Math.floor(ele.find('.img_content svg').attr('height'));
        result.clip_message.old_w = Math.floor($image.attr('width'));
        result.clip_message.old_h = Math.floor($image.attr('height'));
        return result;
	},
	// 图片元素 旧数据 格式化为 新数据
	format_image_data: function(data){
		// 错误情况判断
		if(!data || data.type !== 'img') {
			console.error('params type error');
			return false;
		}
        let result = base_opt.fn.clone_object(data);
        // 内置裁剪形状
		let shape_arr = [
            {
                type: 'RECT',
                w: 400,
                h: 400,
                d: 'M-0.5,-0.994 L401.000,-0.994 L401.000,400.994 L-0.5,400.994 L-0.5,-0.994 L-0.5,-0.994 Z',
            },
            {
                type: 'ELLIPSE',
                w: 400,
                h: 400,
                d: 'M0.001,200.000 C0.001,89.546 89.543,0.006 199.999,0.006 C310.455,0.006 400.000,89.546 400.000,200.000 C400.000,310.454 310.455,399.994 199.999,399.994 C89.543,399.994 0.001,310.454 0.001,200.000 L0.001,200.000 Z'
            },
        ];
		if(!result.clip){
			// 判断当前已有图片裁剪 -> circle 转化为 path
			if(result.circle_clip){
				let clip_shape = shape_arr[1],
					clip_id = base_opt.fn.uuid(),
					clip_w_scale = result.clip_w / clip_shape.w,
					clip_h_scale = result.clip_h / clip_shape.h,
					d = clip_shape.d;
				result.clip = {
					id: clip_id,
					type: clip_shape.type,
					scale: `${clip_w_scale},${clip_h_scale}`,
					x: result.clip_x,
					y: result.clip_y,
					w: result.clip_w,
					h: result.clip_h,
					d: d,
				};
			}
			// 当前非圆形裁剪 -> 添加为 path
			else{
				let clip_shape = shape_arr[0],
					clip_id = base_opt.fn.uuid(),
					clip_w_scale = result.clip_w / clip_shape.w,
					clip_h_scale = result.clip_h / clip_shape.h,
					d = clip_shape.d;
				result.clip = {
					id: clip_id,
					type: clip_shape.type,
					scale: `${clip_w_scale},${clip_h_scale}`,
					x: result.clip_x,
					y: result.clip_y,
					w: result.clip_w,
					h: result.clip_h,
					d: d,
				};
			}
			// 去除无用key
			delete result.clip_w;
			delete result.clip_h;
			delete result.clip_x;
			delete result.clip_y;
			delete result.clip_id;
			delete result.clip_dom;
			delete result.circle_clip;
		}
		// 阴影旧数据处理
		result = this.format_old_shadow(result);
		// 旧数据不存在翻转
		if (!result.reversal) {
			result.reversal = {
				translate: '0,0',
				matrix: '1,0,0,1,0,0'
			}
        };
        // 错误数据处理
        if (result.border_w === 'NaN') result.border_w = 0;
		// 返回格式化数据
		return result;
	},
	// 图片元素 - 节点 -> 数据方法
	dom_2_ele: function(dom){
		// 错误状态判断
		if(!dom || dom.length <= 0) {
			console.error('params type error');
			return false;
		}
		let type = dom.attr('data-type'),
			transform = base_opt.get_transform(dom),
			$scale = dom.find('.ele_scale'),
			$image_border = dom.find('.image_border path'),
			$image_clip = dom.find('.image_clip'),
			$image = dom.find('.img_content image'),
			$rotate = dom.find('.ele_rotate'),
			clip_box = dom.find('.img_content svg')[0].getAttribute('viewBox').split(' '),
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
		obj.border_w = $image_border.attr('stroke-width') || 0;
		obj.border_c = $image_border.attr('stroke');
		obj.border_s = $image_border.attr('data-border_s');
		obj.border_o = $image_border.attr('stroke-opacity') * 100 || 0;
		obj.image_w = $image.attr('width');
		obj.image_h = $image.attr('height');
		obj.url = $image.attr('href');
		obj.clip = {
			id: $image_clip.attr('id'),
			type: $image_clip.attr('data-type'),
			scale: $image_clip.attr('data-scale'),
			x: clip_box[0],
			y: clip_box[1],
			w: clip_box[2],
			h: clip_box[3],
			d: dom.find('clipPath path').attr('d')
		};
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
			obj.shadow = base_opt.fn.clone_object(this.template).shadow
			obj.shadow.open = false;
		}
		// 镜像翻转
		obj.reversal = {
			translate: $scale.attr('data-translate'),
			matrix: $scale.attr('data-matrix')
		}
		obj.staticImage = dom.attr('data-static-image') === 'undefined' ? '' : dom.attr('data-static-image');
		return obj;
	},
	// 图片元素 - 数据 -> 节点方法
	ele_2_dom:function(obj, is_str){
		// 错误状态判断
		if(!obj || typeof obj !== 'object' || !obj.id) {
			console.error('params type error');
			return false;
		}
		// 格式化旧数据
		if (obj.border_w === 'NaN') obj.border_w = 0;
		if (!obj.clip || !obj.shadow || obj.shadow.x || obj.shadow.x == 0 || !obj.reversal) obj = this.format_image_data(obj);
		let ele = base_opt.fn.clone_object(obj);
		//1、数据处理
		ele.lock = (ele.lock ? 'lock' : '');
		ele.group = (ele.group ? ele.group : '');
		ele.staticImage = (ele.staticImage || '')
		let translate_arr = ele.translate.split(',');
		ele.translate_x = translate_arr[0];
		ele.translate_y = translate_arr[1];
		ele.link = ((!ele.link || ele.link == null) ? '' : base_opt.fn.escapeHtmlAttrString(ele.link));
		let scale_arr = ele.scale.split(',');
		ele.scale_x = Number(scale_arr[0]);
		ele.scale_y = Number(scale_arr[1]);
		ele.clip.scale_w = (ele.clip.w * ele.scale_x);
		ele.clip.scale_h = (ele.clip.h * ele.scale_y);
		let rotate_arr = ele.rotate.split(',');
		ele.rotate_deg = rotate_arr[0];
		// 阴影部分
		let shadow = this.split_shadow_data(ele);
		let shadow_data = `data-shadow-rotate="${ele.shadow.rotate}" data-shadow-opacity="${ele.shadow.opacity}" data-shadow-blur="${ele.shadow.blur}" data-shadow-color="${ele.shadow.color}" data-shadow-distance="${ele.shadow.distance}"`;
		//边框
		ele.border_w = ((ele.border_w && !isNaN(ele.border_w)) ? Number(ele.border_w) : 0);
		ele.border_s = Number(ele.border_s);
		ele.border_c = ((!ele.border_c || ele.border_c === null || ele.border_c === 'undefined') ? 'transparent' : ele.border_c);
		ele.border_o = ((ele.border_o && !isNaN(ele.border_o)) ? Number(ele.border_o) : 100);
		let border_dasharray = base_opt.get_dasharray(ele.border_s, ele.border_w);
		let border_linecap = ((ele.border_s === 16) ? 'round' : '');
		let border_linejoin = ((ele.border_s === 16) ? 'round' : '');
		let border_miterlimit = ((ele.border_s === 16) ? 8 : '');
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
						data-static-image="${ele.staticImage}"
					>
						<div class="ele_rotate" style="width:${ele.clip.scale_w}px; height:${ele.clip.scale_h}px; transform:rotate(${ele.rotate_deg}deg); opacity:${ele.opacity};filter:${shadow};" ${shadow_data} data-rotate="${ele.rotate}" title="${ele.link}">
							<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" overflow="visible" width="${ele.clip.scale_w}" height="${ele.clip.scale_h}" class="img_content">
								<g class="ele_scale" data-scale="${ele.scale}" data-matrix="${ele.reversal.matrix}" data-translate="${ele.reversal.translate}" transform="scale(${ele.scale})translate(${ele.reversal.translate})matrix(${ele.reversal.matrix})">
									<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" width="${ele.clip.w}" height="${ele.clip.h}" viewBox="${ele.clip.x} ${ele.clip.y} ${ele.clip.w} ${ele.clip.h}">
										<image href="${ele.url}" xlink:href="${ele.url}" width="${ele.image_w}" height="${ele.image_h}" clip-path="url(#${ele.clip.id})" xmlns:xlink="http://www.w3.org/1999/xlink"></image>
									</svg>
									<g class="image_border" transform="scale(${ele.clip.scale})">
										<path fill="transparent" vector-effect="non-scaling-stroke" d="${ele.clip.d}" stroke="${ele.border_c}" stroke-width="${ele.border_w}" stroke-opacity="${ele.border_o / 100}" stroke-dasharray="${border_dasharray}" stroke-linecap="${border_linecap}" stroke-linejoin="${border_linejoin}" stroke-miterlimit="${border_miterlimit}" data-border_s="${ele.border_s}"></path>
									</g>
									<defs>
										<clipPath id="${ele.clip.id}" data-type="${ele.clip.type}" data-scale="${ele.clip.scale}" transform="translate(${ele.clip.x},${ele.clip.y})" class="image_clip">
											<path d="${ele.clip.d}" fill="transparent" transform="scale(${ele.clip.scale})"></path>
										</clipPath>
									</defs>
								</g>
							</svg>
						</div>
					</div>`;
		if(is_str){
			return html;
		}
		return $(html);
	},
	// 生成图片元素节点方法 -> 返回节点字符串
	build: function(obj){
		// 错误状态判断
		if(!obj || typeof obj !== 'object') {
			console.error('params type error');
			return false;
		}
		let template = base_opt.fn.clone_object(this.template),
			param = Object.assign(template, obj),
			$dom = this.ele_2_dom(param);
		return $dom.prop('outerHTML');
	},
	// 图片上传
	image_upload: function (file, name) {
		let form = new FormData();
		if (name) {
			form.append('file', file, name);
		} else {
			form.append('file', file);
		}
		return new Promise((resolve, reject) => {
			if (window.FileReader && file.type === 'image/svg+xml') {
                let reader = new FileReader();
                reader.onloadend = function (evt) {
                    if (evt.target.readyState == FileReader.DONE) {
                        let reg = new RegExp(/<script.*?>.*?<\/script>/i);
                        resolve(!reg.test(evt.target.result));
                    }else{
                    	resolve(false);
                    }
                };
                reader.readAsText(file);
            }else{
            	resolve(true);
            }
		}).then((vaild)=>{
			return new Promise((resolve, reject) => {
				if(!vaild){
					reject("文件内容不合法");
					return;
				}
				axios({
					method: 'post',
					url: '/api/member/upload_img/',
					headers: { 'Content-Type': 'multipart/form-data' },
					data: form,
					dataType: 'file',
				}).then(function (data) {
					if (data.data.code === "2") {
						resolve(data.data.data);
					} else {
						reject(data.data.data);
					}
				}).catch((err) => {
					reject(err);
				});
			})
		});
	},
	// 生成图片元素对象 -> 返回 promise
	build_obj: function(url){
		// 错误情况判断
		if(!url || typeof url !== 'string') {
			console.error('params type error');
			return false;
		}
		let that = this, 
			template = base_opt.fn.clone_object(that.template),
			$reader = new Image(),
			shape = that.clip_shape[0],
			w, h;
		// 返回 promise
		return new Promise(function(resolve, reject){
			$reader.src = url;
			$reader.onload = function(){
				template.id = base_opt.fn.uuid();
				if (!template.clip || !template.shadow || !template.shadow.fiflter_w) template = that.format_image_data(template);
				w = $reader.width;
				h = $reader.height;
				template.rotate = `0,${w / 2},${h / 2}`;
				template.image_w = w;
				template.image_h = h;
				template.url = url;
				template.clip = {
					id: base_opt.fn.uuid(),
					scale: `${w / shape.w},${h / shape.h}`,
					type:'RECT',
					w: w,
					h: h,
					x: 0,
					y: 0,
					d: shape.d,
				};
				resolve(template);
			};
			$reader.onerror = function(error){
				reject(error);
			};
		});
	},
	// 添加图片至我的上传 -> 返回promise
	add_myupload: function(template,obj){
		return new Promise(function(resolve,reject){
			axios.post('/api/member/myupload/save/', {
				elementList: "[" + JSON.stringify(template) + "]",
				image: template.url,
				imageWidth: template.image_w.toFixed(0),
				imageHeight: template.image_h.toFixed(0),
				imageSize: Math.round(obj.size / 1024),
			})
			.then(function (img) {
				resolve(img);
			});
		})
	},
	// 设置节点大小适应
	fit_dom_size: function(ele){
		// 错误状态判断
		if(!ele || ele.length !== 1 || ele.attr('data-type') !== 'img') {
			console.error('params type error');
			return false;
		}
		let $page = $('.page_contain .edit_page'),
			// 获取画布大小
			page_w = $page[0].offsetWidth,
			page_h = $page[0].offsetHeight,
			// 获取图片比例
			ele_msg = base_opt.compute_ele_offset(ele).page,
			ratio = ele_msg.w / ele_msg.h,
			ele_w = page_w * 0.5,
			ele_h = ele_w / ratio;
		// 超出画布情况
		if(ele_h > page_h * 0.8){
			ele_h = page_h * 0.8;
			ele_w = ele_h * ratio;
		}
		this.set_size(ele, {w: ele_w, h: ele_h});
	},
	// 设置节点定位适应
	fit_dom_offset: function(ele, multiple){
		// 错误状态判断
		if(!ele || ele.length !== 1 || ele.attr('data-type') !== 'img') {
			console.error('params type error');
			return false;
		}
		let $page = $('.page_contain .edit_page'),
			// 获取画布大小
			page_w = $page[0].offsetWidth,
			page_h = $page[0].offsetHeight,
			// 获取图片大小
			ele_msg = base_opt.compute_ele_offset(ele).page,
			ele_w = ele_msg.w,
			ele_h = ele_msg.h,
			ele_x, ele_y;
		if (multiple && multiple.index && multiple.index !== multiple.length - 1){
			ele_x = this.previous_img_translate.x + 10;
			ele_y = this.previous_img_translate.y + 10;
		}else{
			ele_x = page_w / 2 - ele_w / 2;
			ele_y = page_h / 2 - ele_h / 2;
		}
		this.previous_img_translate.x = ele_x;
		this.previous_img_translate.y = ele_y;
		base_opt.set_translate(ele, ele_x, ele_y);
	},
	// 设置缩放
	set_size: function(ele,data){
		// 错误状态判断
		if(!ele || ele.length !== 1 || !data || !data.w || !data.h) {
			console.error('params type error');
			return false;
		}
		let $svg = ele.find('.img_content'),
			$rotate = ele.find('.ele_rotate'),
			$scale = ele.find('.ele_scale'),
			ele_rotate = base_opt.get_transform(ele, 'rotate'),
			ele_scale = base_opt.get_transform(ele, 'scale'),
			ele_w = base_opt.compute_ele_offset(ele).page.w,
			ele_h = base_opt.compute_ele_offset(ele).page.h,
			ele_matrix = $scale.attr('data-matrix') || `1,0,0,1,0,0`,
			init_w = ele_w / ele_scale[0],
			init_h = ele_h / ele_scale[1],
			new_scale_x = data.w / init_w,
			new_scale_y = data.h / init_h,
			new_translate_x = ele_matrix.split(',')[0] === '1' ? '0' : data.w,
			new_translate_y = ele_matrix.split(',')[3] === '1' ? '0' : data.h;
		// 修改旋转中心
		ele_rotate[1] = data.w / 2;
		ele_rotate[2] = data.h / 2;
		new_translate_x /= new_scale_x;
		new_translate_y /= new_scale_y;
		$svg[0].setAttribute('width', data.w);
		$svg[0].setAttribute('height', data.h);
		$rotate[0].setAttribute('data-rotate', ele_rotate.join(','));
		$rotate[0].style.width = `${data.w}px`;
		$rotate[0].style.height = `${data.h}px`;
		$scale[0].setAttribute('data-scale', `${new_scale_x},${new_scale_y}`);
		$scale[0].setAttribute('data-translate', `${new_translate_x},${new_translate_y}`);
		$scale[0].setAttribute('transform', `scale(${new_scale_x},${new_scale_y})translate(${new_translate_x},${new_translate_y})matrix(${ele_matrix})`);
		// 重新计算阴影大小
		if($rotate.css('filter') !== 'none'){
			let shadow_obj = {
				shadow:{
					open: true,
					distance: $rotate.attr('data-shadow-distance'),
					rotate: $rotate.attr('data-shadow-rotate'),
					blur: $rotate.attr('data-shadow-blur'),
					color: $rotate.attr('data-shadow-color'),
					opacity: $rotate.attr('data-shadow-opacity')
				},
				clip:{
					scale_w: data.w,
					scale_h: data.h,
				}
			}
			$rotate[0].style.filter = `${this.split_shadow_data(shadow_obj)}`;
		}
	},
	// 切换节点图片链接
	change_url: function(ele, obj){
		// 错误状态判断
		if(!ele || ele.length !== 1 || !obj || obj === '') {
			console.error('params type error');
			return false;
		}
		// 获取当前节点信息
		let o_image = this.dom_2_ele(ele),
			n_image = typeof obj === 'string' ? JSON.parse(obj)[0] : obj,
			$svg = ele.find('.img_content'),
			$rotate = ele.find('.ele_rotate'),
			$scale = ele.find('.ele_scale'),
			$image = $svg.find('image'),
			$clip = ele.find('.image_clip'),
			$border = ele.find('.image_border'),
			o_rotate = base_opt.get_transform(ele, 'rotate'),
			o_scale = base_opt.get_transform(ele, 'scale'),
			o_clip_ratio = o_image.clip.w / o_image.clip.h,
			o_image_offset = base_opt.compute_ele_offset(ele).page,
			n_image_ratio = n_image.image_w / n_image.image_h,
			shape = this.clip_shape.filter(item => item.type === o_image.clip.type)[0],
			result = {}, offset_w, offset_h;
			
		// 重新计算图片大小
		if (o_image.image_w >= o_image.image_h) {
			result.image_w = o_image.image_w;
			result.image_h = o_image.image_w / n_image_ratio;
			offset_w = o_image_offset.w;
			offset_h = o_image_offset.w / o_clip_ratio;
		} else {
			result.image_w = o_image.image_h * n_image_ratio;
			result.image_h = o_image.image_h;
			offset_w = o_image_offset.h * o_clip_ratio;
			offset_h = o_image_offset.h;
		}
		// 记录裁剪数据
		result.clip_id = o_image.clip.id;
		result.clip_type = o_image.clip.type;
		result.clip_w = o_image.clip.w;
		result.clip_h = o_image.clip.h;
		result.clip_d = o_image.clip.d;
		// 裁剪范围超出新图片宽高 -> 重置裁剪范围
		if (o_image.clip.w > result.image_w || o_image.clip.h > result.image_h) {
			shape = this.clip_shape[0];
			result.clip_id = base_opt.fn.uuid();
			result.clip_type = shape.type;
			result.clip_w = result.image_w;
			result.clip_h = result.image_h;
			result.clip_d = shape.d;
			// 更新图片显示比例 & 显示大小
			o_clip_ratio = result.clip_w / result.clip_h;
			offset_h = offset_w / o_clip_ratio;
		}
		// 计算旋转中心
		o_rotate[1] = offset_w / 2;
		o_rotate[2] = offset_h / 2;
		// 计算元素缩放
		o_scale[0] = offset_w / result.clip_w;
		o_scale[1] = offset_h / result.clip_h;
		// 计算裁剪缩放
		result.clip_scale = `${result.clip_w / shape.w},${result.clip_h / shape.h}`;
		// 计算裁剪定位
		result.clip_x = result.image_w - result.clip_w === 0 ? 0 : (result.image_w - result.clip_w) / 2;
		result.clip_y = result.image_h - result.clip_h === 0 ? 0 : (result.image_h - result.clip_h) / 2;
		// 更新节点数据
		ele.attr('data-static-image', n_image.staticImage || '');
		$rotate.attr({
			'data-rotate': o_rotate.join(','),
		});
		$svg.attr({
			'width': offset_w,
			'height': offset_h,
		});
		$scale.attr({
			'data-scale': o_scale.join(','),
			'transform': `scale(${o_scale.join(',')})`,
		});
		$image.parent()[0].setAttribute('viewBox', `${result.clip_x} ${result.clip_y} ${result.clip_w} ${result.clip_h}`);
		$image.parent().attr({ 'width': result.clip_w, 'height': result.clip_h});
		$image.attr({
			'href': n_image.url,
			'xlink:href': n_image.url,
			'width': result.image_w,
			'height': result.image_h,
			'clip-path': `url(#${result.clip_id})`,
		});
		$clip.attr({
			'id': result.clip_id,
			'data-type': result.clip_type,
			'data-scale': result.clip_scale,
			'transform': `translate(${result.clip_x},${result.clip_y})`
		});
		$clip.find('path').attr({
			'd': result.clip_d,
			'fill':'transparent',
			'transform': `scale(${result.clip_scale})`
		});
		// 重置图片边框
		$border.attr({
			'transform': `scale(${result.clip_scale})`
		}).find('path').attr({
			'd': result.clip_d,
		});
	},
	// 设置边框颜色
	set_border_color: function(ele, data){
		// 错误状态判断
		if(!ele || ele.length !== 1 || !data) {
			console.error('params type error');
			return false;
		}
		let $border = ele.find('.image_border path');
		if(data === 'transparent'){
			$border.attr({
				'stroke': '',
				'stroke-width': '',
				'stroke-dasharray': '',
				'stroke-linecap': '',
				'stroke-linejoin': '',
				'stroke-miterlimit': '',
				'data-border_s': '',
			});
		}else{
			// 设置边框颜色
			$border.attr('stroke', data);
			// 当前不存在边框颜色时 - 设置边框宽度
			let border_w = Number($border.attr('stroke-width'));
			if (!border_w || isNaN(border_w)) this.set_border_width(ele, 1);
			// 当前不存在边框样式时 - 设置边框样式
			let border_s = $border.attr('data-border_s');
			if (!border_s || border_s === '') this.set_border_style(ele, 'solid');
		}
	},
	// 设置边框宽度
	set_border_width: function(ele, data){
		// 错误状态判断
		if(!ele || ele.length !== 1 || isNaN(Number(data))) {
			console.error('params type error');
			return false;
		}
		let $border = ele.find('.image_border path');
		// 设置边框宽度
		$border.attr('stroke-width', data / 2);
		// 当前不存在边框颜色时 - 设置边框颜色
		let border_c = $border.attr('stroke');
		if(!border_c || border_c === '') this.set_border_color(ele, '#000000');
		// 当前不存在边框样式时 - 设置边框样式
		let border_s = $border.attr('data-border_s');
		if(!border_s || border_s === '') {
			this.set_border_style(ele, 'solid');
		} else {
			// 重置边框样式
			let dasharray = base_opt.get_dasharray(border_s, +data);
			$border.attr({ 'stroke-dasharray': dasharray });
		}
	},
	// 设置边框透明度
	set_border_opacity: function(ele, data){
		// 错误状态判断
		if(!ele || ele.length !== 1 || isNaN(Number(data))) {
			console.error('params type error');
			return false;
		}
		let $border = ele.find('.image_border path');
		// 设置边框宽度
		$border.attr('stroke-opacity', data / 100);
	},
	// 设置边框样式
	set_border_style: function(ele, data){
		// 错误状态判断
		if(!ele || ele.length !== 1 || !data) {
			console.error('params type error');
			return false;
		}
		let $border = ele.find('.image_border path'),
			bs;
		if(data === 'none'){
			$border.attr({
				'stroke': '',
				'stroke-width': '',
				'stroke-dasharray': '',
				'stroke-linecap': '',
				'stroke-linejoin': '',
				'stroke-miterlimit': '',
				'data-border_s': '',
			});
		}else{
			// 当前不存在边框颜色时 - 设置边框宽度
			let border_w = $border.attr('stroke-width');
			if(!border_w || border_w === '') this.set_border_width(ele, 1);
			// 当前不存在边框颜色时 - 设置边框颜色
			let border_c = $border.attr('stroke');
			if(!border_c || border_c === '' || border_c === 'transparent') this.set_border_color(ele, '#000000');
			// 重置宽度
			border_w = $border.attr('stroke-width');
			let dasharray;
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
			$border.attr({
				'stroke-dasharray': dasharray,
				'stroke-linecap': bs === 16 ? 'round' : '',
				'stroke-linejoin': bs === 16 ? 'round' : '',
				'stroke-miterlimit': bs === 16 ? 8 : '',
				'data-border_s': bs,
			});
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
            'data-shadow-rotate': result.rotate,
            'data-shadow-distance': result.distance,
            'data-shadow-color': result.color,
            'data-shadow-blur': result.blur,
            'data-shadow-opacity': result.opacity,
        })
	},
	// 阴影属性拼接
	split_shadow_data: function (obj) {
		let shadow = 'none';
		let _obj = base_opt.fn.clone_object(obj);
		// 旧数据处理
		_obj = this.format_old_shadow(_obj);
		if (_obj.shadow.open) {
			let distance = Number(_obj.shadow.distance);
			let shadow_rotate = Number(_obj.shadow.rotate);
			let shadow_x = distance * Math.cos(shadow_rotate * Math.PI / 180);
			let shadow_y = distance * Math.sin(shadow_rotate * Math.PI / 180);
			if (!_obj.clip.scale_w && _obj.clip.scale_w != 0) {
				let scale_arr = _obj.scale.split(',');
				_obj.clip.scale_w = (_obj.clip.w * Number(scale_arr[0]));
				_obj.clip.scale_h = (_obj.clip.h * Number(scale_arr[1]));
			}
			shadow_x = (Number(_obj.clip.scale_w) * shadow_x * 0.01).toFixed(2);
			shadow_y = (Number(_obj.clip.scale_h) * shadow_y * 0.01).toFixed(2);
			let shadow_color = base_opt.fn.color_exchange_function('rgba', _obj.shadow.color === 'transparent' ? '#000000' : _obj.shadow.color, false, +_obj.shadow.opacity / 100);
			shadow = `drop-shadow(${shadow_x}px ${shadow_y}px ${+_obj.shadow.blur / 2.5}px ${shadow_color})`;
		}
		return shadow;
	},
	// 阴影旧数据处理
	format_old_shadow: function(obj){
		let result = base_opt.fn.clone_object(obj);
		let new_shadow = {};
		if (!result.shadow) {
			result.shadow = base_opt.fn.clone_object(this.template).shadow
			result.shadow.open = false;
		} else if ((result.shadow.x == 0 && result.shadow.y == 0 && result.shadow.blur == 0) || (result.shadow.distance == 0 && result.shadow.blur == 0)) {
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
	set_reversal: function (ele, data) {
		// 错误状态判断
		if (!ele || ele.length !== 1 || typeof data !== 'string') {
			console.error('params type error');
			return false;
		};
		let $svg = ele.find('.img_content svg'),
			$scale = ele.find('.ele_scale'),
			width = Number($svg.attr('width')),
			height = Number($svg.attr('height')),
			translate = $scale.attr('data-translate'),
			matrix = $scale.attr('data-matrix').split(',').map(i => Number(i));
		// 判断翻转类型
		switch (data) {
			case 'horizontal':    //垂直翻转
				if (matrix[0] < 0) {
					matrix[0] = 1;
					$scale.attr({
						'data-translate': 0 + ',' + translate.split(',')[1],
						'data-matrix': matrix.join(","),
						'transform': `scale(${$scale.attr('data-scale')})translate(${0 + ',' + translate.split(',')[1]})matrix(${matrix.join(",")})`
					});
				} else {
					matrix[0] = -1;
					$scale.attr({
						'data-translate': width + ',' + translate.split(',')[1],
						'data-matrix': matrix.join(","),
						'transform': `scale(${$scale.attr('data-scale')})translate(${width + ',' + translate.split(',')[1]})matrix(${matrix.join(",")})`
					});
				}
				break;
			case 'vertical':  //水平翻转
				if (matrix[3] < 0) {
					matrix[3] = 1;
					$scale.attr({
						'data-translate': translate.split(',')[0] + ',' + 0,
						'data-matrix': matrix.join(","),
						'transform': `scale(${$scale.attr('data-scale')})translate(${translate.split(',')[0] + ',' + 0})matrix(${matrix.join(",")})`
					});
				} else {
					matrix[3] = -1;
					$scale.attr({
						'data-translate': translate.split(',')[0] + ',' + height,
						'data-matrix': matrix.join(","),
						'transform': `scale(${$scale.attr('data-scale')})translate(${translate.split(',')[0] + ',' + height})matrix(${matrix.join(",")})`
					});
				}
				break;
		}
	},
	reset_convformat_position(){
		// 重新设置快捷面板的位置
		$('.convformat_contain').css({
		    'top': $('#clip_wrap').offset().top - 60,
		    'left': $('#clip_wrap').offset().left
		})
	},

	/**
	 * 图片裁剪方法
	 */
	// 开始裁剪方法 {shape： object， ratio：number || string} echo为true时只是用来回显，不改变裁剪框的位置或大小
	clip_begin: function(obj){
		let ele = obj.ele;
		let	shape = obj.shape;
		let ratio = obj.ratio;
		let echo = obj.echo;
		// 错误状态判断
		if(!ele || ele.length !== 1 || ele.attr('data-type') !== 'img') {
			console.error('params type error');
			return false;
		}
		let image = this.dom_2_ele(ele),
			page_scale = base_opt.page_scale,
			ele_scale = base_opt.get_transform(ele, 'scale'),
			$operate = $('.operate'),
			$outer = $operate.find('.cropper'),
			$clip_img = $outer.find('img').eq(1),
			default_w = base_opt.fn.unit_2_px(image.image_w * ele_scale[0] * page_scale),
			default_h = base_opt.fn.unit_2_px(image.image_h * ele_scale[1] * page_scale),
			clip_msg = base_opt.fn.clone_object(image.clip);
		// 清除裁剪框裁剪样式
		$clip_img.css({'clip':'', 'clip-path':''});
		// 传裁剪参数的情况下， 修改裁剪数据
		if(shape){
			clip_msg.d = shape.d;
			clip_msg.type = shape.type;
			// 修改裁剪数据
			if (!echo) {
				switch(true){
					// 自由裁剪
					case !ratio:
						clip_msg.x = 0;
						clip_msg.y = 0;
						clip_msg.w = image.image_w;
						clip_msg.h = image.image_h;
						break;
					// 等比裁剪
					case ratio === 1:
						if(default_h > default_w){
							clip_msg.x = 0;
							clip_msg.y = (image.image_h - image.image_w) / 2;
							clip_msg.w = image.image_w;
							clip_msg.h = image.image_w;
						}else{
							clip_msg.x = (image.image_w - image.image_h) / 2;
							clip_msg.y = 0;
							clip_msg.w = image.image_h;
							clip_msg.h = image.image_h;
						}
						break;
					// 非等比，图片高大于宽情况
					case default_h > default_w:
						clip_msg.w = image.image_w;
						clip_msg.h = image.image_w / ratio;
						clip_msg.x = 0;
						clip_msg.y = (image.image_h - clip_msg.h) / 2;
						while(clip_msg.h > image.image_h){
							clip_msg.w = clip_msg.w - 10;
							clip_msg.h = clip_msg.w / ratio;
							clip_msg.x = (image.image_w - clip_msg.w) === 0 ? 0 : (image.image_w - clip_msg.w) / 2;
							clip_msg.y = (image.image_h - clip_msg.h) === 0 ? 0 : (image.image_h - clip_msg.h) / 2;
						}
						break;
					// 非等比，图片宽大于高情况
					case default_w >= default_h:
						clip_msg.w = image.image_h * ratio;
						clip_msg.h = image.image_h;
						clip_msg.x = (image.image_w - clip_msg.w) / 2;
						clip_msg.y = 0;
						while(clip_msg.w > image.image_w){
							clip_msg.h = clip_msg.h - 10;
							clip_msg.w = clip_msg.h * ratio;
							clip_msg.x = (image.image_w - clip_msg.w) === 0 ? 0 : (image.image_w - clip_msg.w) / 2;
							clip_msg.y = (image.image_h - clip_msg.h) === 0 ? 0 : (image.image_h - clip_msg.h) / 2;
						}
						break;
				}
			}
			// 计算裁剪缩放
			clip_msg.scale = `${clip_msg.w / shape.w},${clip_msg.h / shape.h}`;
		}
		// 根据裁剪数据，计算裁剪样式
		let $clip = $operate.find('#clip_wrap'),
			$clip_path = $('#operate_clip_path'),
			$ele_border = ele.find('.image_border'),
			$ele_shadow = ele.find('.image_shadow'),
			clip_scale = clip_msg.scale.split(',').map(i => Number(i)),
			clip_translate_x = base_opt.fn.unit_2_px(clip_msg.x * ele_scale[0] * page_scale),
			clip_translate_y = base_opt.fn.unit_2_px(clip_msg.y * ele_scale[1] * page_scale),
			clip_scale_x = base_opt.fn.unit_2_px(clip_scale[0] * ele_scale[0] * page_scale),
			clip_scale_y = base_opt.fn.unit_2_px(clip_scale[1] * ele_scale[1] * page_scale);
		// 设置元素边框节点 样式
		$ele_border.find('path').attr({
			'd': clip_msg.d,
		});
		// 设置元素阴影节点 样式
		$ele_shadow.find('path').attr({
			'd': clip_msg.d,
		});
		// 设置裁剪模板节点 样式
		$clip_path.attr({
			'data-translate': `${clip_translate_x},${clip_translate_y}`,
			'transform': `translate(${clip_translate_x},${clip_translate_y})`,
		});
		$clip_path.find('path').attr({
			'd': clip_msg.d,
			'data-scale': `${clip_scale_x},${clip_scale_y}`,
			'transform':`scale(${clip_scale_x},${clip_scale_y})`,
		});
		// 设置裁剪图片节点 样式
		$clip_img.css('clip-path', 'url(#operate_clip_path)');
		// 设置裁剪外部样式
		$outer.css({
			"left": -base_opt.fn.unit_2_px(image.clip.x * ele_scale[0] * page_scale),
			"top": -base_opt.fn.unit_2_px(image.clip.y * ele_scale[1] * page_scale),
			"width": default_w,
			"height": default_h,
		});
		// 设置裁剪内图片样式
		$outer.find('img').attr({
			'src': image.url,
			'width': '100%',
			'height': '100%'
		});
		// 设置裁剪框样式
		$clip.css({
			"left": base_opt.fn.unit_2_px(clip_msg.x * ele_scale[0] * page_scale),
			"top": base_opt.fn.unit_2_px(clip_msg.y * ele_scale[1] * page_scale),
			"width": base_opt.fn.unit_2_px(clip_msg.w * ele_scale[0] * page_scale) - (!isNaN(ratio) && ratio <= 1 ? 1 * ratio : 0),
			"height": base_opt.fn.unit_2_px(clip_msg.h * ele_scale[1] * page_scale) - (!isNaN(ratio) && ratio <= 1 ? 1 : 0),
		}).attr({'data-type': clip_msg.type});
		// 储存原元素
		image_opt.before_clip_image = base_opt.fn.clone_object(image);
		// 更新元素裁剪
		this.clip_sync(ele);
		// 隐藏图片元素
		ele.hide();
		// 进入裁剪状态
		$operate.addClass('clip_image');
		this.reset_convformat_position();
	},
	// 裁剪框移动方法{ele: 正在裁剪的元素, data: jquery-ui 插件返回值 ui.position}
	clip_move: function(ele, data){
		// 错误情况判断
		if(!ele || ele.length !== 1 || !data) {
			console.error('params type error');
			return false;
		}
		let $clip_path = $('#operate_clip_path');
		$clip_path.attr({
			'data-translate': `${data.left},${data.top}`,
			'transform': `translate(${data.left},${data.top})`,
		});
		//处理clipath translate不生效
		let $clip_image = $("#operate .cropper").find('img').eq(1);
		let $clone_ele = $clip_image.clone();
		$clip_image.remove();
		$("#operate .cropper").find('img').after($clone_ele);
		this.clip_sync(ele);
		this.reset_convformat_position();
	},
	// 裁剪框缩放方法{ele: 正在裁剪的元素, data: {x, y, w, h}}
	clip_scale: function(ele, data){
		// 错误情况判断
		if(!ele || ele.length !== 1 || !data || (!data.x && data.x !== 0) || (!data.y && data.y !== 0) || !data.w || !data.h) {
			console.error('params type error');
			return false;
		}
		let $clip_path = $('#operate_clip_path'),
			// 400 为裁剪矩形 svg的width、height
			clip_scale_x = data.w / 400,
			clip_scale_y = data.h / 400;
		$clip_path.attr({
			'data-translate': `${data.x},${data.y}`,
			'transform': `translate(${data.x},${data.y})`,
		});
		$clip_path.find('path').attr({
			'data-scale': `${clip_scale_x},${clip_scale_y}`,
			'transform': `scale(${clip_scale_x},${clip_scale_y})`
		});
		this.clip_sync(ele);
		this.reset_convformat_position();
	},
	// 裁剪数据同步元素方法
	clip_sync: function(ele){
		// 错误状态判断
		if(!ele || ele.length !== 1 || ele.attr('data-type') !== 'img') {
			console.error('params type error');
			return false;
		}
		let $page = base_opt.get_canvas_page(),
			page_rect = base_opt.fn.get_client_rect($page),
			page_scale = base_opt.page_scale,
			get_transform = base_opt.get_transform(ele),
			$operate = $('.operate'),
			operate_x = base_opt.fn.unit_2_px($operate.css('left')),
			operate_y = base_opt.fn.unit_2_px($operate.css('top')),
			$outer = $operate.find('.cropper'),
			outer_l = base_opt.fn.unit_2_px($outer[0].style.left),
			outer_t = base_opt.fn.unit_2_px($outer[0].style.top),
			$clip = $operate.find('#clip_wrap'),
			clip_l = base_opt.fn.unit_2_px($clip[0].style.left),
			clip_t = base_opt.fn.unit_2_px($clip[0].style.top),
			clip_w = base_opt.fn.unit_2_px($clip[0].style.width),
			clip_h = base_opt.fn.unit_2_px($clip[0].style.height),
			ele_rotate = get_transform.rotate,
			ele_scale = get_transform.scale,
			op_middle_arr = $operate.css('transform-origin').split(' ').filter(item => /\d+/.test(item)).map(item => base_opt.fn.unit_2_px(item)),
			op_middle = {
				x: base_opt.fn.unit_2_px((operate_x + op_middle_arr[0] - page_rect.left) / page_scale),
				y: base_opt.fn.unit_2_px((operate_y + op_middle_arr[1] - page_rect.top) / page_scale),
			},
			clip_middle = {
				x: base_opt.fn.unit_2_px((operate_x + outer_l + clip_l + clip_w / 2 - page_rect.left) / page_scale),
				y: base_opt.fn.unit_2_px((operate_y + outer_t + clip_t + clip_h / 2 - page_rect.top) / page_scale),
			},
			n_middle = base_opt.fn.after_rotate_point(clip_middle, op_middle, ele_rotate[0]);
		// 1. 计算元素定位，大小，旋转中心
		let ele_w = clip_w / page_scale;
		let ele_h = clip_h / page_scale;
		ele_rotate[1] = ele_w / 2;
		ele_rotate[2] = ele_h / 2;
		let ele_x = base_opt.fn.unit_2_px(n_middle.x - ele_rotate[1]);
		let ele_y = base_opt.fn.unit_2_px(n_middle.y - ele_rotate[2]);
		// 2. 计算裁剪定位，缩放
		let $clip_path = $operate.find('#operate_clip_path'),
			clip_translate = $clip_path.attr('data-translate').split(','),
			clip_x = clip_translate[0] / ele_scale[0] / page_scale,
			clip_y = clip_translate[1] / ele_scale[1] / page_scale,
			clip_scale = $clip_path.find('path').attr('data-scale').split(','),
			scale_x = clip_scale[0] / ele_scale[0] / page_scale,
			scale_y = clip_scale[1] / ele_scale[1] / page_scale;
		// 3. 更新节点数据
		let $rotate = ele.find('.ele_rotate'),
			$scale = ele.find('.ele_scale'),
			$ele_clip = ele.find('.image_clip'),
			$ele_border = ele.find('.image_border'),
			$ele_shadow = ele.find('.image_shadow'),
			$svg = ele.find('.img_content'),
			$svg2 = $svg.find('svg');
		// 修改元素定位
		base_opt.set_translate(ele, ele_x, ele_y);
		// 修改 ele_rotate 大小 & 旋转中心
		$rotate.attr({
			'data-rotate': ele_rotate.join(','),
		}).css({
			'width':`${ele_w}px`,
			'height':`${ele_h}px`
		});
		// 修改首层 svg 大小
		$svg.attr({
			'width': ele_w,
			'height': ele_h,
		});
		// scale 修改翻转属性
		let matrix = $scale.attr('data-matrix').split(',').map(i => Number(i));
		let scale_translate = [(matrix[0] > 0 ? 0 : ele_w / ele_scale[0]), (matrix[3] > 0 ? 0 : ele_h / ele_scale[1])];
		$scale.attr({
			'data-translate': scale_translate.join(','),
			'transform': `scale(${$scale.attr('data-scale')})translate(${scale_translate.join(',')})matrix(${matrix.join(",")})`
		});
		// 修改第二层 svg 大小
		$svg2.attr({
			'width': ele_w / ele_scale[0],
			'height': ele_h / ele_scale[1],
		})[0].setAttribute('viewBox', `${clip_x} ${clip_y} ${ele_w / ele_scale[0]} ${ele_h / ele_scale[1]}`);
		// 修改裁剪形状坐标 & 缩放
		$ele_clip.attr({
			'data-type': $clip.attr('data-type'),
			'data-scale': `${scale_x},${scale_y}`,
			'transform': `translate(${clip_x},${clip_y})`
		});
		$ele_clip.find('path').attr({
			'd': $clip_path.find('path').attr('d'),
			'transform': `scale(${scale_x},${scale_y})`
		});
		// 修改边框形状缩放
		$ele_border.attr({
			'transform': `scale(${scale_x},${scale_y})`
		});
		// 修改阴影形状缩放
		$ele_shadow.attr({
			'transform': `scale(${scale_x},${scale_y})translate(0.1,0.1)`
		});
	},
	// 确认裁剪方法
	clip_sure: function(ele){
		// 错误状态判断
		if(!ele || ele.length !== 1 || ele.attr('data-type') !== 'img') {
			console.error('params type error');
			return false;
		}
		let $operate = $('.operate');
		$operate.removeClass('clip_image');
		ele.show();
	},
	// 取消裁剪方法
	clip_cancel: function(ele){
		// 错误状态判断
		if(!ele || ele.length !== 1 || ele.attr('data-type') !== 'img') {
			console.error('params type error');
			return false;
		}
		let $operate = $('.operate'),
			o_obj = image_opt.before_clip_image,
			$o_ele = this.ele_2_dom(o_obj);
		ele[0].outerHTML = $o_ele[0].outerHTML;
		ele.addClass('checked');
		$operate.removeClass('clip_image');
	},
};
export default image_opt;