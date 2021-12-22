import base_opt from '@/assets/pc/js/opt/base_opt.js';
import axios from '@/util/axios.js';
import alioss from '@/assets/pc/js/ali_oss.js';

let video_opt = {
    // 数据模板
    template: {
        id: '',
        type: 'video',
        group: null,
        lock: false,
        opacity: 1,
        translate: '0,0',
        rotate: '0,0,0',
        scale: '1,1',
        width: null,
        height: null,
		src: '',
		cover: 'https://file.woodo.cn/upload/image/202001/19/5e5f9b40-dfbe-475b-831e-9d4b08e84544.image/jpeg',				// 视频封面图
		outside: false,			// 外站地址（视频网站分享出来的链接由iframe播放）
        controls: true,         // 控件显示
        autoplay: false,        // 自动播放
        loop: false,            // 循环播放
        muted: false,           // 静音
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
			console.error('video select params type error');
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
			console.error('video get_edit_message params type error');
			return false;
		}
		let result = {};
		let $video = ele.find('.video_layer');
        result.controls = JSON.parse($video.attr('data-controls') || 'false');
        result.autoplay = JSON.parse($video.attr('data-autoplay') || 'false');
        result.loop = JSON.parse($video.attr('data-loop') || 'false');
        result.muted = JSON.parse($video.attr('data-muted') || 'false');
		result.src = $video.attr('data-src');
		result.cover = $video.attr('data-cover');
		result.can_set = !JSON.parse($video.attr('data-outside') || 'false');
		return result;
    },
    // 元素 - 节点 -> 数据方法
    dom_2_ele: function (dom) {
        // 错误状态判断
		if(!dom || dom.length <= 0) {
			console.error('video dom_2_ele params type error');
			return false;
        }
		let obj = {},
			$rotate = dom.find('.ele_rotate'),
			$video = dom.find('.video_layer'),
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
		// 视频数据
		obj.width = base_opt.fn.unit_2_px($rotate[0].style.width);
		obj.height = base_opt.fn.unit_2_px($rotate[0].style.height);
		obj.src = $video.attr('data-src');
		obj.cover = $video.attr('data-cover');
		obj.outside = JSON.parse($video.attr('data-outside') || 'false');
		obj.controls = JSON.parse($video.attr('data-controls') || 'false');
		obj.autoplay = JSON.parse($video.attr('data-autoplay') || 'false');
		obj.loop = JSON.parse($video.attr('data-loop') || 'false');
		obj.muted = JSON.parse($video.attr('data-muted') || 'false');
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
								<div class="video_layer" data-src="${ele.src}" data-cover="${ele.cover}" data-outside="${ele.outside}" data-controls="${ele.controls}" data-autoplay="${ele.autoplay}" data-loop="${ele.loop}" data-muted="${ele.muted}">
									<img class="video_cover" src="${ele.cover}" width="${ele.width}" height="${ele.height}" />
									<div class="video_play">
										<svg viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg">
											<path d="M852.727563 392.447107C956.997809 458.473635 956.941389 565.559517 852.727563 631.55032L281.888889 993.019655C177.618644 1059.046186 93.090909 1016.054114 93.090909 897.137364L93.090909 126.860063C93.090909 7.879206 177.675064-35.013033 281.888889 30.977769L852.727563 392.447107 852.727563 392.447107Z" fill="#ffffff"></path>
										</svg>
										<p>播放</p>
									</div>
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
			console.error('video build params type error');
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
			console.error('video set_size params type error');
			return false;
		}
		let $rotate = ele.find('.ele_rotate'),
			$scale = ele.find('.ele_scale'),
			$cover = ele.find('.video_cover'),
			ele_rotate = base_opt.get_transform(ele, 'rotate');
		ele_rotate[1] = data.w / 2;
		ele_rotate[2] = data.h / 2;
		$rotate[0].setAttribute('data-rotate', ele_rotate.join(','));
		$scale[0].setAttribute('data-scale', `1,1`);
		$rotate.css({
			'width': `${data.w}px`,
			'height': `${data.h}px`,
		});
		$cover.attr({
			'width': data.w,
			'height': data.h,
		});
	},
	// 设置节点大小适应
	fit_dom_size: function(ele){
		// 错误状态判断
		if(!ele || ele.length !== 1) {
			console.error('video fit_dom_size params type error');
			return false;
		}
		let $page = $('.page_contain .edit_page')[0],
			// 获取画布大小
			page_w = $page.offsetWidth,
			page_h = $page.offsetHeight;
		let ele_msg = base_opt.compute_ele_offset(ele).page,
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
	fit_dom_offset: function(ele){
		// 错误状态判断
		if(!ele || ele.length !== 1) {
			console.error('video fit_dom_offset params type error');
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

	// 视频文件上传
	video_upload: function (opt) {
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
		if (option.file.type && option.file.type.indexOf('video') < 0) {
            if (typeof option.error === 'function') {
                option.error({ message: 'type' });
            }
            return;
		}
		if (size > option.maxSize || size <= 0) {
            if (typeof option.error === 'function') {
                option.error({ message: 'size', maxSize: option.maxSize});
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
	// 视频封面上传
	cover_upload: function (opt) {
		let option = {
			file: {},
			maxSize: 1,
			success: null,
			error: null,
		};
		option = Object.assign(option, opt);
		let size = option.file.size ? option.file.size / 1024 / 1024 : 0;     // 单位 MB
		if (option.file.type && option.file.type.indexOf('image') < 0) {
			if (typeof option.error === 'function') {
                option.error({ message: 'type' });
            }
            return;
		}
		if (size > option.maxSize || size <= 0) {
            if (typeof option.error === 'function') {
                option.error({ message: 'size' });
            }
            return;
		}
		let formdata = new FormData();
		formdata.append('file', option.file);
		axios({
			method: 'post',
			url: '/api/file/upload/',
			headers: { 'Content-Type': 'multipart/form-data' },
			dataType: 'file',
			data: formdata,
		}).then(res => {
			let res_data = res.data;
			if (res_data.type === 'success') {
				if (typeof option.success === 'function') {
					option.success(res_data.data);
				}
			} else {
				if (typeof option.error === 'function') {
					option.error(res);
				}
			}
		}).catch(err => {
			console.error(err);
			if (typeof option.error === 'function') {
				option.error(err);
			}
		});
	},
	// 视频参数设置
	set_config: function (ele, key, value) {
		// 错误状态判断
		if(!ele || ele.length !== 1) {
			console.error('video set_config params type error');
			return false;
		}
		let $video = ele.find('.video_layer');
		$video.attr(`data-${key}`, value);
		// 封面同步
		if (key === 'cover') {
			ele.find('.video_cover').attr('src', value);
		}
	},
	

	// 视频链接处理 iframe embed 浏览器页面地址
	video_src_format: function (str) {
		let src = '';
		switch (true) {
			// iframe嵌入
			case str.indexOf('<iframe') >= 0:
				src = $(str).attr('src');
				break;
			// embed 嵌入
			case str.indexOf('<embed') >= 0:
				if ($(str).is('embed')) {
					src = $(str).attr('src');
				} else {
					src = $(str).find('embed').attr('src');
				}
				break;
			// 其他地址
			default:
				// 地址校验
				if ($validate(str).url()) {
					src = this.video_website_format(str);
				}
				break;
		}
		// flash 视频格式校验，不支持置空src
		let no_flash = utils.getNavigatorPlugins('Flash').length === 0;
		if (src.indexOf('.swf') >= 0 && no_flash) {
			src = '';
		}
		return src;
	},
	// 国内视频网站播放页转iframe页处理
	video_website_format: function (src) {
		try {
			let url = new URL(src);
			let result = url.href;
			let vid;
			// 播放地址匹配
			switch (url.host) {
				// youtube
				case 'www.youtube.com':
					if (url.pathname.indexOf('/watch') === 0) {
						vid = utils.getUrlQuery('v', url.href);
						if (vid) {
							result = `https://www.youtube.com/embed/${vid}`;
						}
					}
					break;
				// 腾讯视频
				case 'v.qq.com':
					if (url.pathname.indexOf('/x/') === 0) {
						vid = url.pathname.substring(url.pathname.lastIndexOf('/') + 1).replace('.html', '');
						result = `https://v.qq.com/txp/iframe/player.html?vid=${vid}`;
					}
					break;
				// 优酷
				case 'v.youku.com':
					if (url.pathname.indexOf('/v_show/id_') === 0) {
						vid = url.pathname.replace('/v_show/id_', '').replace('.html', '');
						result = `https://player.youku.com/embed/${vid}`;
					}
					break;
				// 哔哩哔哩
				case 'www.bilibili.com':
					if (url.pathname.indexOf('/video/av') === 0) {
						vid = url.pathname.replace('/video/av', '');
						result = `https://player.bilibili.com/player.html?aid=${vid}`;
					}
					break;
				// acfun
				case 'www.acfun.cn':
					if (url.pathname.indexOf('/v/') === 0) {
						vid = url.pathname.replace('/v/', '');
						result = `https://www.acfun.cn/player/${vid}`;
					}
					break;
			}
			return result;
		} catch (error) {
			console.error(error);
			return src;
		}
	},
    //保存用户上传的多媒体文件
    save_member_media: function(obj){
        return new Promise(function(resolve,reject){
            axios.post('/api/member/myupload/save_media/', {
                elementList: "[" + JSON.stringify(obj.elementList) + "]",
                imageSize: Math.round(obj.size),
				type: 'video'
            }).then(function (media) {
               resolve(media);
            });
        });
    },
};

export default video_opt;
