import MediaControls from '@/assets/common/js/media_controls.js';
import base_opt from '@/assets/pc/js/opt/base_opt.js';
import alioss from '@/assets/pc/js/ali_oss.js';
import axios from '@/util/axios.js';

let audio_opt = {
    // 数据模板
    template: {
        id: '',
        type: 'audio',
        group: null,
        lock: false,
        opacity: 1,
        translate: '0,0',
        rotate: '0,0,0',
        scale: '1,1',
        width: null,
        height: null,
        src: '',
        fadein: '00.00',        // 淡入（渐强）
        fadeout: '00.00',       // 淡出（渐弱）
        autoplay: false,        // 自动播放
        loop: false,            // 循环播放
        hideonshow: false,    	// 放映时隐藏元素
        animation: [],
    },
    // 应用的模板
    using_data: {},
    // 初始化方法
    init: function(){
        let base = Object.assign({}, base_opt);
        return Object.assign(base, this);
    },
    // 选中方法
	select: function(ele){
		// 错误状态判断
		if(!ele || ele.length !== 1) {
			console.error('audio select params type error');
			return false;
		}
		// 更新左侧栏数据
		let base_msg = base_opt.get_common_message(ele).page,
			msg = this.get_edit_message(ele),
			result = Object.assign(base_msg, msg);
		result.w = Math.round(result.w);
		result.h = Math.round(result.h);
		result.x = Math.round(result.x);
		result.y = Math.round(result.y);
        ele.addClass('checked');
		return result;
    },
    // 获取左侧栏面板数据
    get_edit_message: function (ele) {
		// 错误状态判断
		if(!ele || ele.length !== 1) {
			console.error('audio get_edit_message params type error');
			return false;
		}
		let result = {};
		let $audio = ele.find('.audio_layer');
		result.fadein = isNaN($audio.attr('data-fadein')) ? '00.00' : $audio.attr('data-fadein');
        result.fadeout = isNaN($audio.attr('data-fadeout')) ? '00.00' : $audio.attr('data-fadeout');
		result.autoplay = JSON.parse($audio.attr('data-autoplay') || 'false');
		result.loop = JSON.parse($audio.attr('data-loop') || 'false');
		result.hideonshow = JSON.parse($audio.attr('data-hideonshow') || 'false');
		result.src = $audio.attr('data-src');
        return result;
    },
    // 元素 - 节点 -> 数据方法
    dom_2_ele: function (dom) {
        // 错误状态判断
		if(!dom || dom.length <= 0) {
			console.error('audio dom_2_ele params type error');
			return false;
        }
        let obj = {},
			$audio = dom.find('.audio_layer'),
            $icon = dom.find('.audio_icon'),
            transform = base_opt.get_transform(dom);
        obj.id = dom.attr('id');
		obj.type = dom.attr('data-type');
		obj.group = dom.attr('data-group') === 'undefined' ? '' : dom.attr('data-group');
        obj.lock = dom.hasClass('lock');
        obj.opacity = dom.find('.ele_rotate')[0].style.opacity || 1;
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
        obj.width = $icon.attr('width');
		obj.height = $icon.attr('height');
        obj.fadein = isNaN($audio.attr('data-fadein')) ? '00.00' : $audio.attr('data-fadein');
        obj.fadeout = isNaN($audio.attr('data-fadeout')) ? '00.00' : $audio.attr('data-fadeout');
        obj.autoplay = JSON.parse($audio.attr('data-autoplay') || 'false');
        obj.loop = JSON.parse($audio.attr('data-loop') || 'false');
        obj.hideonshow = JSON.parse($audio.attr('data-hideonshow') || 'false');
        obj.src = $audio.attr('data-src');
        return obj;
    },
    // 元素 - 数据 -> 节点方法
    ele_2_dom:function (obj, is_str) {
		// 错误状态判断
        if(!obj || typeof obj !== 'object' || !obj.id) {
            console.error('params type error');
            return false;
		}
        //1、数据处理
		let ele = base_opt.fn.clone_object(obj);
		ele.lock = (ele.lock ? 'lock' : '');
		ele.group = (ele.group ? ele.group : '');
		let translate_arr = ele.translate.split(',');
        ele.translate_x = translate_arr[0];
		ele.translate_y = translate_arr[1];
        let rotate_arr = ele.rotate.split(',');
		ele.rotate_deg = rotate_arr[0];
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
						<div class="ele_rotate" data-rotate="${ele.rotate}" style="width:${ele.width}px; height:${ele.height}px; transform:rotate(${ele.rotate_deg}deg); opacity:${ele.opacity};">
							<div class="ele_scale" data-scale="${ele.scale}">
								<div class="audio_layer" data-src="${ele.src}" data-fadein="${ele.fadein}" data-fadeout="${ele.fadeout}" data-autoplay="${ele.autoplay}" data-loop="${ele.loop}" data-hideonshow="${ele.hideonshow}">
									<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 1024 1024" version="1.1" class="audio_icon" width="${ele.width}" height="${ele.height}">
										<path d="M529.1 901.6 C526.4 901.6 517 897.5 512.1 892.6 L511.8 892.3 L281.4 702.2 H96.1 C87.2 702.2 77.8 697.6 73.4 693.2 C69 688.8 64.4 679.4 64.4 670.5 V351.5 C64.4 344.5 67.1 338.6 68.8 336.9 H71 L73.4 334.5 C77.8 330.1 87.2 325.5 96.1 325.5 H281.4 L511.8 129.7 L512 129.5 C517.8 123.7 524.9 122.5 529.8 122.5 C534.2 122.5 538.7 123.5 542.4 125.4 L542.9 125.7 L543.4 125.9 C555.9 130.1 560.6 137.2 560.6 152.3 V870.1 C560.6 885.2 555.9 892.4 543.4 896.5 L541.6 897.1 L540.2 898.5 C537.2 901.5 534.6 901.6 529.1 901.6Z" fill="#3695ff"></path>
										<path d="M688.6 696.6 C680.3 696.6 666 686.9 661.7 678.3 L661.5 677.8 L661.2 677.4 C653 665 662 647 675.7 637.7 C682.1 634.3 736.6 602.2 736.6 505.4 C736.6 458.9 718.6 427 703.4 408.4 C686.9 388.2 670.3 379 669.7 378.6 L669.1 378.3 L668.4 378.1 C662.6 376.2 657 369.6 654.1 361.3 C651.2 353 651.8 344.7 655.5 339.1 L656.1 338.2 L656.4 337.2 C659.3 328.6 672 321.1 683.7 321.1 C688.2 321.1 692.3 322.2 695.4 324.3 L697.5 325.7 H699 C703.5 327.4 728.1 339.7 752.5 367.6 C774.2 392.5 800.1 435.7 800.1 499.8 C800.1 572.7 775.6 620 755.1 646.9 C732.5 676.4 709.5 689.1 704.7 691 H702.3 L699.9 693.4 C696.7 696.4 694.2 696.6 688.6 696.6Z" fill="#3695ff"></path>
										<path d="M808.2 821.9 C798.3 821.9 785.1 816.8 781.3 809.3 C772.3 791.3 775.5 772.9 789.2 763.2 C794 761.2 800.8 756 809.5 747.6 C818.4 738.9 831.9 723.9 845.7 701.9 C868.7 665.1 896.1 602.2 896.1 511 S867.1 356.8 842.8 319.9 C828.3 297.9 814 282.9 804.6 274.3 C798 268.2 789.7 261.3 783.6 258.8 C771 249.7 766.6 227.4 774.7 214.3 C784.1 205.2 795.3 200 805.5 200 C810.9 200 815.9 201.4 820.3 204.2 C821 204.8 821.9 205.5 823.3 206.6 C852.7 229.7 878.2 258 899.1 290.7 C939.2 353.6 959.6 427.7 959.6 511 C959.6 594.7 939.9 669.1 901.2 732.1 C881.1 764.8 856.7 793 828.6 815.7 C826.9 817.1 826 817.8 825.3 818.5 C821.9 821.9 812 821.9 808.2 821.9Z" fill="#3695ff"></path>
									</svg>
								</div>
							</div>
						</div>
					</div>`;
		if(is_str){
			return html;
		}
		return $(html);
	},
    // 生成元素节点方法 -> 返回节点字符串
    build: function (obj) {
        // 错误状态判断
		if(!obj || typeof obj !== 'object') {
			console.error('audio build params type error');
			return false;
		}
		let template = base_opt.fn.clone_object(this.template),
			param = Object.assign(template, obj),
            $dom = this.ele_2_dom(param);
		return $dom.prop('outerHTML');
    },
	// 设置缩放
	set_size: function(ele,data){
		// 错误状态判断
		if(!ele || ele.length !== 1 || !data || !data.w || !data.h) {
			console.error('audio set_size params type error');
			return false;
		}
		let $rotate = ele.find('.ele_rotate'),
			$scale = ele.find('.ele_scale'),
			$icon = ele.find('.audio_icon'),
			ele_rotate = base_opt.get_transform(ele, 'rotate');
		ele_rotate[1] = data.w / 2;
		ele_rotate[2] = data.h / 2;
		$rotate[0].setAttribute('data-rotate', ele_rotate.join(','));
		$scale[0].setAttribute('data-scale', `1,1`);
		$rotate.css({
			'width': `${data.w}px`,
			'height': `${data.h}px`,
		});
		$icon.attr({
            'width': data.w,
			'height': data.h,
		});
    },
	// 设置节点定位适应
	fit_dom_offset: function(ele){
		// 错误状态判断
		if(!ele || ele.length !== 1) {
			console.error('audio fit_dom_offset params type error');
			return false;
		}
        let $page = $('.page_contain .edit_page'),
			// 获取画布大小
			page_w = $page[0].offsetWidth,
            page_h = $page[0].offsetHeight,
            // 获取元素大小
			ele_msg = base_opt.compute_ele_offset(ele).page,
			ele_w = ele_msg.w,
			ele_h = ele_msg.h,
			ele_x, ele_y;
		ele_x = page_w / 2 - ele_w / 2;
		ele_y = page_h / 2 - ele_h / 2;
		base_opt.set_translate(ele, ele_x, ele_y);
	},

    // 音频上传
    audio_upload: function (opt) {
		let option = {
			file: {},
			maxSize: 100,
			cancel: null,
			progress: null,
			success: null,
			error: null,
		};
        option = Object.assign(option, opt);
		let size = option.file.size ? option.file.size / 1024 / 1024 : 0;     // 单位 MB
		if (option.file.type && option.file.type.indexOf('audio') < 0) {
            if (typeof option.error === 'function') {
                option.error({ message: 'type' });
            }
            return;
		}
		if (size > option.maxSize || size <= 0) {
            if (typeof option.error === 'function') {
                option.error({ message: 'size', maxSize: option.maxSize });
            }
            return;
		}

		let form = new FormData();
		form.append('file', new File([], 'img.jpg')); // 后端要求参数一定要有个文件
		axios({
			method: 'post',
			url: '/api/member/upload_media/',
			headers: { 'Content-Type': 'multipart/form-data' },
			data: form,
			dataType: 'file',
		}).then(function (data) {
			if (data.data.code === "2") {
				//阿里OSS直传
				alioss.upload_file({
					file: option.file,
					fileType: 'media',
					success: data => {
						option.success(data);
					},
					fail: data => {
						option.error(data);
					},
					progress: data =>{
						option.progress(data);
					},
					cancel: data =>{
						option.cancel(data);
					}
				});
			}else{
				option.error(data.data.data);
			}
		}).catch(option.error);
	},
	// 视频参数设置
	set_config: function (ele, key, value) {
		// 错误状态判断
		if(!ele || ele.length !== 1) {
			console.error('audio set_config params type error');
			return false;
		}
		let $audio = ele.find('.audio_layer');
		$audio.attr(`data-${key}`, value);
	},
	// 音量渐强渐弱
	fadein_and_fadeout: function (audio) {
		if (!audio || audio.nodeName !== 'AUDIO') {
			return console.error('audio fadein_and_fadeout type error');
		}
		// 渐强 渐弱 播放
		let init_volume = audio.volume;
		let total = audio.duration;
		let fadein = Number(audio.getAttribute('data-fadein'));
		let fadeout = Number(audio.getAttribute('data-fadeout'));
		// 根据当前播放时间更新渐强渐弱音量
		audio.ontimeupdate = function () {
			let cur_time = audio.currentTime;
			// 渐弱
			if (cur_time > total - fadeout) {
				let cur_vol = (init_volume / fadeout) * (total - cur_time);
				audio.volume = cur_vol >= init_volume ? init_volume : cur_vol;
			} else 
			// 渐强
			if (cur_time < fadein) {
				let cur_vol = (init_volume / fadein) * cur_time;
				audio.volume = cur_vol >= init_volume ? init_volume : cur_vol;
			}
		}
		// 恢复初始音量
		audio.onended = function () {
			audio.volume = init_volume;
		}
	},
	// 显示音频控件
	audio_control_show: function (ele, container) {
		if (!ele || !container) {
			return console.error('audio audio_control_show type error');
		}
		let id = ele.attr('id');
		// 生成audio元素
		let audio = new Audio();
		audio.src = ele.find('.audio_layer').attr('data-src');
		container.append($(audio));
		let control = MediaControls(audio, container[0], id);
		return control;
	},
	// 移出控件
	audio_control_remove: function () {
		$('.operate_media_container').html('');
	},
	// 暂时隐藏控件 拖动时与缩放时隐藏
	audio_control_hide: function () {
		$('.operate_media_container').css('display', 'none');
	},
	// 音频控件位置更新
	audio_control_position: function (ele) {
		if (ele.length !== 1 || ele.attr('data-type') !== 'audio') {
			return;
		}
		let offset = base_opt.compute_ele_offset(ele);
		let rect = offset.window_scaled;
		let page_rect = document.querySelector('#page_contain #edit_page').getBoundingClientRect();
		let control_width = 295;
		let top = rect.y + rect.h + 10;
		let left = rect.x - (control_width - rect.w) / 2;
		if (left < page_rect.left) {
			left = page_rect.left;
		} else if (left + control_width > page_rect.width + page_rect.left) {
			left = page_rect.left + page_rect.width - control_width;
		}
		// 媒体控件定位
		$('.operate_media_container').css({
			'display': 'block',
			'top': `${top}px`,
			'left': `${left}px`,
		});
	},
    //保存用户上传的多媒体文件
    save_member_media: function(obj){
        return new Promise(function(resolve,reject){
            axios.post('/api/member/myupload/save_media/', {
                elementList: "[" + JSON.stringify(obj.elementList) + "]",
                imageSize: Math.round(obj.size),
				type: 'audio'
            }).then(function (media) {
               resolve(media);
            });
        });
    },
};

export default audio_opt;