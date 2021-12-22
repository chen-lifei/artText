// 图表插件 并挂载到window
// import echarts from 'echarts';                 // 加载echarts所有模块
// 按需加载
const echarts = require('echarts/lib/echarts');      // echarts 主模块
require('zrender/lib/svg/svg');                     // svg渲染模式，使用canvas渲染模式在放大情况下会模糊
require('echarts/lib/chart/line');                  // 折线图
require('echarts/lib/chart/bar');                   // 柱状图
require('echarts/lib/chart/pie');                   // 饼状图
require('echarts/lib/chart/funnel');                // 漏斗图
require('echarts/lib/component/tooltip');           // echarts 工具栏
require('@/assets/pc/js/chart_theme');              // echarts 主题
// import 'echarts/lib/component/title';             // echarts 标题

import base_opt from '@/assets/pc/js/opt/base_opt.js';
import common from '@/assets/pc/js/common.js';

let chart_opt = {
    // 数据模板
    template: {
        id: '',
        type: 'chart',
        group: null,
        lock: false,
        opacity: 1,
        translate: '0,0',
        rotate: '0,0,0',
        scale: '1,1',
        width: 0,
        height: 0,
        border_w: null,
        border_s: null,
        border_c: null,
        background_c: '',
        chart_style: '',   // 图表样式、类型编号
        chart_data: {},    // 图表数据，转换成jsonstring存储在节点上
        chart_image: '',   // 图表图片
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
			console.error('params type error');
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
        let result = {},
            $cont = ele.find('.chart_content'),
			ele_border = $cont[0].style.border ? $cont[0].style.border.split(' ') : $cont.css('border').split(' '),
            chart_data = $cont.attr('chart-data'),
            echart_options = this.get_instance($cont[0]).getOption();
        try {
            chart_data = JSON.parse(chart_data);
        } catch (error) {
            chart_data = {};
        }
        result.opacity = Math.ceil(ele.find('.ele_rotate').css('opacity') * 100);
        // 获取边框宽度
		result.border_w = ele_border[0] === "0px" || !ele_border[0] ? 0 : base_opt.fn.unit_2_px(ele_border[0]);
		// 获取边框样式
		result.border_s = ele_border[1] ? ele_border[1] : 'none';
		// 获取边框颜色
        result.border_c = '';
		ele_border.splice(0, 2);
        ele_border = ele_border.join('');
		if (ele_border !== 'rgb(80,80,80)' && result.border_w !== '0px' && result.border_s !== 'none') {
			result.border_c = base_opt.fn.color_exchange_function('rgb',ele_border);
        }
        // 获取背景颜色
        result.background_c = '';
		if ($cont.css('backgroundColor') && $cont.css('backgroundColor') !== 'rgba(0, 0, 0, 0)') {
			result.background_c = base_opt.fn.color_exchange_function('rgb',$cont.css('backgroundColor'));
        }
        // 图表 x轴 项目名称去除换行符
        if (chart_data.dataset) {
            if (chart_data.dataset.dimensions) {
                let dimensions_length = chart_data.dataset.dimensions.length;
                for (let i = 0; i < dimensions_length; i++) {
                    if (!i) {
                        continue;
                    }
                    chart_data.dataset.dimensions[i] = chart_data.dataset.dimensions[i].trim();
                }
            }
            if (chart_data.dataset.source) {
                chart_data.dataset.source.forEach((item) => {
                    item[0] = item[0].replace(/[\n\r]/g, '');
                });
            }
        }
        result.chart_data = chart_data;
        result.chart_data.color = [];
        result.chart_image = $cont.attr('chart-image');
        result.chart_style = $cont.attr('chart-style');
        if (echart_options) {
            // 图表全局文本样式
            result.size = echart_options.textStyle.fontSize;
            result.color = echart_options.textStyle.color || '';
            result.font_weight = echart_options.textStyle.fontWeight;
            result.font_style = echart_options.textStyle.fontStyle;
            // bar line  x y 轴名称设置时存在设置换行符处理，这里需去除掉换行符
            if (echart_options.xAxis.length > 0) {
                result.chart_data.xAxis.name = echart_options.xAxis[0].name.replace(/[\n\r]/g, '');
            }
            if (echart_options.yAxis.length > 0) {
                result.chart_data.yAxis.name = echart_options.yAxis[0].name.replace(/[\n\r]/g, '');
            }
            // 图表项目颜色
            result.chart_data.color = echart_options.color;
            // all 是否显示图例
            if (echart_options.legend) {
                result.chart_data.legend = echart_options.legend.length > 0;
            }

            if (echart_options.series.length > 0) {
                let formatter = echart_options.series[0].label.formatter || '';
                let markPoint = echart_options.series[0].markPoint;
                // pie 是否显示百分比
                if (formatter.indexOf('{d}%') >= 0) {
                    result.chart_data.show_series_ratio = true;
                }
                // pie 是否显示数据
                if (formatter.indexOf('{@[1]}') >= 0 || (markPoint && markPoint.data.length > 0)) {
                    result.chart_data.show_series_value = true;
                }
                // pie 是否显示环形
                if (Array.isArray(echart_options.series[0].radius)) {
                    result.chart_data.series_radius = echart_options.series[0].radius[0];
                }
                // pie 是否显示南丁格尔玫瑰图
                if (echart_options.series[0].roseType) {
                    result.chart_data.series_roseType = echart_options.series[0].roseType;
                }
                // pie 数值标签是否内部显示
                if (echart_options.series[0].label) {
                    result.chart_data.label_inside = echart_options.series[0].label.position === 'inside';
                }

                // bar 是否堆叠显示
                if (echart_options.series[0].stack) {
                    result.chart_data.series_pile = echart_options.series[0].stack;
                }
            }
            // line 线条样式
            result.chart_data.line_style = [];
            if (result.chart_style === 'line') {
                echart_options.series.forEach((item, index) => {
                    let styl = {
                        width: item.lineStyle.width,
                        type: item.lineStyle.type,
                        color: result.chart_data.color[index],
                    };
                    result.chart_data.line_style.push(styl);
                });
            }
        }
        return result;
    },
    // 元素 - 节点 -> 数据方法
    dom_2_ele: function (dom) {
        // 错误状态判断
		if(!dom || dom.length <= 0) {
			console.error('params type error');
			return false;
        }
        let obj = {},
            $cont = dom.find('.chart_content'),
            chart_data = $cont.attr('chart-data'),
            transform = base_opt.get_transform(dom);
        obj.id = dom.attr('id');
		obj.type = dom.attr('data-type');
		obj.group = dom.attr('data-group') === 'undefined' ? '' : dom.attr('data-group');
        obj.lock = dom.hasClass('lock');
        obj.link = dom.find('.ele_rotate').attr('title') || null;
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
        obj.width = base_opt.fn.unit_2_px($cont[0].style.width);
        obj.height = base_opt.fn.unit_2_px($cont[0].style.height);
        obj.background_c = $cont.css('background-color');
        obj.border_c = $cont.css('border-color');
        obj.border_s = $cont.css('border-style');
        obj.border_w = base_opt.fn.unit_2_px($cont.css('border-width'));
        obj.chart_data = JSON.parse(chart_data);
        obj.chart_image = $cont.attr('chart-image') || '';
        obj.chart_style = $cont.attr('chart-style') || '';
        return obj;
    },
    // 元素 - 数据 -> 节点方法
    ele_2_dom:function (obj, is_str) {
        // 错误状态判断
        if(!obj || typeof obj !== 'object' || !obj.id) {
            console.error('params type error');
            return false;
        }
        let ele = base_opt.fn.clone_object(obj);
        //1、数据处理
        ele.lock = (ele.lock ? 'lock' : '');
        ele.group = (ele.group ? ele.group : '');
        let translate_arr = ele.translate.split(',');
        ele.translate_x = translate_arr[0];
        ele.translate_y = translate_arr[1];
        let rotate_arr = ele.rotate.split(',');
        ele.rotate_deg = rotate_arr[0];
        ele.link = ((!ele.link || ele.link == null) ? '' : base_opt.fn.escapeHtmlAttrString(ele.link));
        ele.chart_data = JSON.stringify(ele.chart_data);
        ele.chart_image = ele.chart_image || '';
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
                        <div class="ele_rotate" style="width:${ele.width}px; height:${ele.height}px; transform:rotate(${ele.rotate_deg}deg); opacity:${ele.opacity};" data-rotate="${ele.rotate}" title="${ele.link}">
                            <div class="ele_scale" data-scale="${ele.scale}">
                                <div class="chart_content" style="width:${ele.width}px; height:${ele.height}px; background-color:${ele.background_c}; border-color:${ele.border_c}; border-style:${ele.border_s}; border-width:${ele.border_w};" chart-data='${ele.chart_data}' chart-image="${ele.chart_image}" chart-style="${ele.chart_style}"></div>
                                <img class="chart_preview" src="${ele.chart_image}" width="${ele.width}" height="${ele.height}" />
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
			console.error('chart build params type error');
			return false;
		}
		let template = base_opt.fn.clone_object(this.template),
			param = Object.assign(template, obj),
            $dom = this.ele_2_dom(param);
		return $dom.prop('outerHTML');
    },
    // 设置缩放
	set_size: function (ele, data) {
        let that = this;
		// 错误状态判断
		if(!ele || ele.length !== 1 || !data || !data.w || !data.h) {
			console.error('chart set_size params type error');
			return false;
        }
        let $cont = ele.find('.chart_content'),
			$rotate = ele.find('.ele_rotate'),
			$scale = ele.find('.ele_scale'),
			ele_rotate = base_opt.get_transform(ele, 'rotate');
        ele_rotate[1] = data.w / 2;
        ele_rotate[2] = data.h / 2;
        $rotate[0].setAttribute('data-rotate', ele_rotate.join(','));
        $rotate.css({
            'width': `${data.w}px`,
            'height': `${data.h}px`,
        });
        $scale[0].setAttribute('data-scale', `1,1`);
        $cont.css({
            'width': `${data.w}px`,
            'height': `${data.h}px`,
        });
        let chart = this.get_instance($cont[0]);
        chart.resize({
            width: data.w,
            height: data.h,
        });
        // 节流处理
        clearTimeout(that.chart_update_timer);
        that.chart_update_timer = setTimeout(() => {
            that.chart_upload_image(ele);
        }, 300);
    },
	// 设置节点定位适应
	fit_dom_offset: function (ele) {
		// 错误状态判断
		if(!ele || ele.length !== 1 || ele.attr('data-type') !== 'chart') {
			console.error('chart fit_dom_offset params type error');
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
    // 背景色
	set_background: function(ele, data){
		// 错误状态判断
		if(!ele || ele.length === 0 || !data) {
			console.error('chart set_background params type error');
			return false;
		}
		ele.find('.chart_content').css({
			'background': data
		});
    },
    // 设置边框颜色
	set_border_color: function(ele, data){
		// 错误状态判断
		if(!ele || ele.length !== 1 || !data) {
			console.error('chart border-color params type error');
			return false;
		}
		let $cont = ele.find('.chart_content'),
			ele_msg = base_opt.compute_ele_offset(ele).page,
			ele_border = $cont[0].style.border,
			border_s = 'solid';
		// 元素不存在边框
		if(ele_border === ''){
			let ele_w = ele_msg.w + 2,
				ele_h = ele_msg.h + 2;
			border_s = data === 'transparent' ? 'none' : 'solid';
			ele_border = `1px ${border_s} ${data}`;
			$cont.css({
                'width': ele_w,
				'height': ele_h,
				'border': ele_border,
			});
		}
		// 元素存在边框
		else{
			ele_border = ele_border.split(' ');
			border_s = data === 'transparent' ? 'none' : ele_border[1];
			ele_border = `${ele_border[0]} ${border_s} ${data}`;
			$cont.css({
				'border': ele_border,
			});
		}
	},
	// 设置边框宽度
	set_border_width: function(ele, data){
		// 错误状态判断
		if(!ele || ele.length !== 1 || !data || isNaN(data)) {
			console.error('chart border-width params type error');
			return false;
		}
		let $cont = ele.find('.chart_content'),
			ele_msg = base_opt.compute_ele_offset(ele).page,
			ele_border = $cont[0].style.border;
		// 元素不存在边框
		if(ele_border === ''){
			let ele_w = ele_msg.w + 2,
				ele_h = ele_msg.h + 2;
			ele_border = `${data}px solid #000000`;
			$cont.css({
                'width': ele_w,
				'height': ele_h,
				'border': ele_border,
			});
		}
		// 元素存在边框
		else{
			ele_border = ele_border.split(' ');
			let border_w = base_opt.fn.unit_2_px(ele_border[0]),
				ele_w = ele_msg.w - (border_w * 2) + (data * 2),
				ele_h = ele_msg.h - (border_w * 2) + (data * 2);
			ele_border[0] = `${data}px`;
			ele_border = ele_border.join(' ');
			$cont.css({
                'width': ele_w,
				'height': ele_h,
				'border': ele_border,
			});
		}
	},
	// 设置边框样式
	set_border_style: function(ele, data){
		// 错误状态判断
		if(!ele || ele.length !== 1 || !data) {
			console.error('chart border-style params type error');
			return false;
		}
		let $cont = ele.find('.chart_content'),
			ele_msg = base_opt.compute_ele_offset(ele).page,
			ele_border = $cont[0].style.border;
		// 元素不存在边框
		if(ele_border === ''){
			let ele_w = ele_msg.w + 2,
				ele_h = ele_msg.h + 2;
			ele_border = `1px ${data} #000000`;
			$cont.css({
                'width': ele_w,
				'height': ele_h,
				'border': ele_border,
			});
		}
		// 元素存在边框
		else{
			ele_border = ele_border.split(' ');
			ele_border[1] = data;
			ele_border = ele_border.join(' ');
			$cont.css({
				'border': ele_border,
			});
		}
    },



    /**
     * 图表实例方法
     */
    // 全局配置，只能设置未配置的属性 （不保存在数据库）
    chart_global_conf: function () {
        return {
            animation: false,
        };
    },
    // 设置固定属性值配置（不保存在数据库，获取到数据后经该方法处理再更新实例）
    chart_merge_conf: function (data) {
        // 图例
        if (data.legend) {
            data.legend.selectedMode = false;
        }
        return data;
    },
    // 初始化图表元素实例
    init_instance: function (dom, no_upload) {
        let ischart = dom.attr('data-type') !== 'chart';
        if (ischart) {
            return console.error('chart init_instance element type error');
        }
        let $cont = dom.find('.chart_content');
        let chart_style = $cont.attr('chart-style');
        if ($cont.length === 0) {
            return;
        }
        let data = {};
        try {
            data = JSON.parse($cont.attr('chart-data'));
        } catch (error) {
            console.error(error);
        }
        let chart = this.get_instance($cont[0]);
        // 合并默认数据
        data = this.chart_merge_conf(data);
        let chart_data = {};
        // 当前数据与即将更新的jsonString对比
        chart_data = this.format_data(chart_style, data);
        chart.setOption(chart_data);
        if (!$cont.attr('chart-image') && !no_upload) {
            this.chart_upload_image(dom);
        }
    },
    // 获取|创建图表实例
    get_instance: function (dom) {
        // getInstanceByDom 返回dom上的实例，没有则重新生成实例
        let chart_instance = echarts.getInstanceByDom(dom);
        if (chart_instance) {
            return chart_instance;
        }
        // 生成新的实例
        let chart = echarts.init(dom, 'roma', {
            renderer: 'svg',
        });
        // 默认配置
        chart.setOption(this.chart_global_conf());
        return chart;
    },
    // 删除实例
    destroy_instance: function (dom) {
        let ischart = dom.attr('data-type') !== 'chart';
        if (ischart) {
            return console.error('chart destroy_instance element type error');
        }
        let chart_instance = echarts.getInstanceByDom(dom.find('.chart_content')[0]);
        if (chart_instance) {
            chart_instance.dispose();
        }
    },
    // 更新图表实例
    chart_update_timer: null,           // 更新频率控制
    // dom = 图表元素   data = {}
    update_instance: function (dom, data, callback) {
        if (!dom) {
            return console.error('chart update_instance dom error');
        }
        let $cont = dom.find('.chart_content');
        let chart_style = $cont.attr('chart-style');
        let current_chart_data = $cont.attr('chart-data');
        let chart_data = {};
        // 当前数据与即将更新的jsonString对比
        chart_data = this.format_data(chart_style, data);
        if (current_chart_data === JSON.stringify(chart_data)) {
            return;
        }
        // 节流处理
        clearTimeout(this.chart_update_timer);
        this.chart_update_timer = setTimeout(() => {
            let chart = this.get_instance($cont[0]);
            // 处理 文本超长 轴线边距适应
            chart_data = this.axis_adaption(chart, chart_data);
            let new_chart_data = Object.assign({}, chart_data, this.chart_global_conf());
            // 重新覆盖新数据
            chart.setOption(new_chart_data, true);
            $cont.attr({
                'chart-data': JSON.stringify(chart_data),
            });
            this.chart_upload_image(dom);
            if (typeof callback === 'function') callback();
        }, 100);
    },
    // 修改实例类型
    switch_instance: function (dom, type) {
        let $cont = dom.find('.chart_content'),
            current_chart_data = $cont.attr('chart-data');
        try {
            current_chart_data = JSON.parse(current_chart_data);
        } catch (error) {
            current_chart_data = {};
        }
        let chart_data = this.format_data(type, current_chart_data);
        $cont.attr({
            'chart-style': type,
            'chart-data': JSON.stringify(chart_data),
        });
        let chart = this.get_instance($cont[0]);
        let new_chart_data = Object.assign({}, chart_data, this.chart_global_conf());
        // 重新覆盖新数据
        chart.setOption(new_chart_data, true);
        this.chart_upload_image(dom);
    },
    // 图表转换图片上传
    chart_upload_image: function (dom) {
        let $cont = dom.find('.chart_content');
        let chart = this.get_instance($cont[0]);
        let scale = base_opt.page_scale < 1 ? 1 : base_opt.page_scale;
        let file_name = `${dom.attr('id')}-${utils.getUrlQuery('docId')}`;
        let base_url_head = `data:image/svg+xml;charset=UTF-8,`;
        let base_url = chart.getDataURL({
                type: 'png',
                pixelRatio: 2,
                excludeComponents: ['toolbox'],
            });
        base_url = base_url.replace(base_url_head, '');
        base_url = base_url_head + encodeURIComponent(base_url);
        // svg 渲染引擎下 base_url 是svg+xml的dataurl
        let toImage = new Image();
        toImage.src = base_url;
        toImage.onload = function () {
            let canvas = document.createElement('canvas');
            canvas.width = toImage.width * scale;
            canvas.height = toImage.height * scale;
            let ctx = canvas.getContext('2d');
            ctx.drawImage(toImage, 0, 0, canvas.width, canvas.height);
            let base64 = canvas.toDataURL();
            // 生成图片上传
            common.upload_image_by_name({
                'base64': base64,
                'filename': file_name,
                'success': (src) => {
                    $cont.attr('chart-image', `${src}?v=${new Date().getTime()}`);
                },
                'error': (err) => {
                    console.error(err);
                },
            });
        }
    },
    // 直角坐标系图表 文本溢出自适应 轴线边距自适应 （需要知道图表尺寸数据等，无法在format_data方法处理）
    axis_adaption: function (chart, data) {
        if (!chart || !data) {
            console.error('chart axis_adaption arguments error');
            return {};
        }
        let that = this;
        // 初始值
        let grid = {
            bottom: 60,
            left: 60,
            right: 60,
            top: 60,
        };
        let chart_width = Math.floor(chart.getWidth());
        let text_style = data.textStyle;
        // 处理轴线边距自适应 轴刻度标签文本溢出处理
        if (data.grid) {
            let item_number_arr = [];
            data.dataset.source.forEach(item_arr => {
                item_arr.forEach((_item, _index) => {
                    if (_index) {
                        item_number_arr.push(String(_item).length);
                    }
                });
            });
            let item_number_max = Math.max.apply(null, item_number_arr);
            let number_width = text_style.fontSize * 0.85;
            let grid_left = item_number_max * number_width;
            if (grid_left < 60) {
                grid_left = 60;
            }
            data.grid.left = grid_left;
            grid = data.grid;
        }
        // 处理 x轴名称 y轴名称 超出换行
        if (data.xAxis) {
            let xAxis_name = data.xAxis.name;
            if (xAxis_name && typeof xAxis_name === 'string') {
                xAxis_name = xAxis_name.replace(/[\n\r]/g, '');
                let xAxis_name_width = that.text_width_compute(xAxis_name, text_style.fontSize, text_style.fontWeight, text_style.fontStyle);
                let xAxis_name_maxwidth = grid.right - (text_style.fontSize + 10); // 轴线与文本间隔约 1个字符 + 10px
                // 大于最大宽度添加 \n 换行处理
                data.xAxis.name = that.text_line_break_format(xAxis_name, text_style.fontSize, xAxis_name_width, xAxis_name_maxwidth);
            }
            // 处理 x轴 项目名称超长换行
            // 图表宽度 - (左间隔 + 右间隔) / 项目数
            let xAxis_item_maxwidth = Math.floor((chart_width - (grid.left + grid.right)) / data.dataset.source.length);
            data.dataset.source.forEach((item) => {
                let item_text_width = that.text_width_compute(item[0], text_style.fontSize, text_style.fontWeight, text_style.fontStyle);
                item[0] = that.text_line_break_format(item[0], text_style.fontSize, item_text_width, xAxis_item_maxwidth);
            });
        }
        // y轴文本默认居中对齐轴线，文本的最大宽度为 轴线左边距 * 2
        if (data.yAxis) {
            let yAxis_name = data.yAxis.name;
            if (yAxis_name && typeof yAxis_name === 'string') {
                yAxis_name = yAxis_name.replace(/[\n\r]/g, '');
                let yAxis_name_width = that.text_width_compute(yAxis_name, text_style.fontSize, text_style.fontWeight, text_style.fontStyle);;
                let yAxis_name_maxwidth = grid.left * 2;
                // 大于最大宽度添加 \n 换行处理
                data.yAxis.name = that.text_line_break_format(yAxis_name, text_style.fontSize, yAxis_name_width, yAxis_name_maxwidth);
            }
        }
        return data;
    },
    // 计算文本实际占用像素宽度
    text_width_compute: function(text = '', size = 12, weight = 'normal', style = 'normal') {
        let width = size * text.length;
        try {
            let canvas = document.createElement('canvas');
            let ctx = canvas.getContext('2d');
            ctx.font = `${style} ${weight} ${size}px`;
            width = Math.ceil(ctx.measureText(text).width);
        } catch (error) {
            console.error(error);
        }
        return width;
    },
    // 文本换行方法  _text = 内容  fontsize = 字号  textwidth = 当前文本不换行时占用的宽度  maxwidth = 文本需换行的宽度
    text_line_break_format: function (text, fontsize, textwidth, maxwidth) {
        if (!text || !fontsize || !textwidth || !maxwidth) {
            return '';
        }
        let _text = text.replace(/[\n\r]/g, '');
        // 大于最大宽度添加 \n 换行处理
        if (textwidth > maxwidth) {
            let newlines_point = Math.floor(maxwidth / fontsize);
            let new_string = '';
            for (let i = 0; i < (_text.length / newlines_point); i++) {
                new_string += `${_text.slice(i * newlines_point, (i + 1) * newlines_point)}\n`;
            }
            _text = new_string;
        }
        return _text;
    },

    
    /**
     * 整理图表数据并返回出去，用于设置echarts.setOptions()，line=折线图、bar=柱状图、pie=饼状图
     * 数据统一使用 options.dataset 管理，各类图表的数据格式可以保持一致
     * 不使用深拷贝原因：图表中部分数据需要根据图表类型来设置，如果设置搭配错误会导致图表样式错乱
     * 配置项文档：https://www.echartsjs.com/zh/option.html
     */
    // 获取相关图表类型数据
    format_data: function (type, data) {
        let options = data || false;
        switch (type) {
            case 'line':
                options = this.data_format_line(options);
                break;
            case 'bar':
                options = this.data_format_bar(options);
                break;
            case 'pie':
                options = this.data_format_pie(options);
                break;
            case 'funnel':
                options = this.data_format_funnel(options);
                break;
        }
        // 最终整理dataset数据
        if (Object.prototype.toString.call(options) === '[object Object]') {
            // 过滤 dataset.source 空行数据
            let source = [];
            options.dataset.source.map(item => {
                let empty_value = item.every(j => {
                    return Number(j) === 0;
                });
                if (!empty_value) {
                    source.push(item);
                }
            });
            if (source.length === 0) {
                source.push(['项目1', 100]);
            }
            options.dataset.source = source;
        }
        return options;
    },
    // dataset.soures 数据处理、填补数组空下标、清除空列数据
    format_dataset: function (dataset) {
        /**
         * 根据 dataset 渲染列数，遍历 source 如果多条数组同一下标值都为空，则不渲染
         */
        if (dataset) {
            if (dataset.dimensions) {
                let dimensions_length = dataset.dimensions.length - 1;
                for (let i = dimensions_length; i >= 0; i--) {
                    if (!i) {
                        continue;
                    }
                    let item = dataset.dimensions[i];
                    let same = dataset.dimensions.filter(j => j === item);
                    if (same.length - 1 > 0) {
                        dataset.dimensions[i] = item + new Array(same.length - 1).fill(' ').join('');
                    }
                }
            }
            if (dataset.source) {
                // 处理行数据，根据最多内容的行填补其他行的空值，数组中的 empty || undefined
                let length_arr = dataset.source.map(item => item.length);
                let max_length = Math.max.apply(null, length_arr);
                dataset.source = dataset.source.map((item) => {
                    for (let i = 1; i < max_length; i++) {
                        if (typeof item[i] === 'undefined') {
                            item[i] = 0;
                        } else {
                            item[i] = Number(item[i]);
                        }
                    }
                    return item;
                });
                // 处理空列数据
                let source_length = dataset.source.length;
                if (source_length > 0) {
                    let item_length = dataset.source[0].length;
                    // 遍历行，从尾遍历防止 splice 改变原数组 影响后面的遍历
                    for (let i = item_length; i >= 1; i--) {
                        let empty = true;
                        // 遍历列，判断该列的值是否全为空
                        for (let j = 0; j < source_length; j++) {
                            if (!empty) {
                                break;
                            }
                            // 从下标 1 起，下标 0 为项目名称
                            let value = dataset.source[j][i];
                            empty = Number(value) === 0 || typeof value === 'undefined';
                        }
                        // 空列，删除
                        if (empty) {
                            for (let j = 0; j < source_length; j++) {
                                dataset.source[j].splice(i, 1);
                            }
                        }
                    }
                }
            }
        }
        return dataset;
    },
    // 线形图
    data_format_line: function (opt) {
        let options = {
                grid: {
                    top: 60,
                    right: 60,
                    bottom: 60,
                    left: 60,
                },
                legend: {
                    selectedMode: false,
                    textStyle: [],
                },
                tooltip: {
                    axisPointer: 'none',
                    textStyle: {
                        fontSize: 12,
                    },
                },
                xAxis: {
                    type: 'category',
                    name: '',
                },
                yAxis: {
                    name: '',
                },
                dataset: {
                    dimensions: ['product', '项目组1'],
                    source: [
                        ['项目1', 100],
                        ['项目2', 200],
                        ['项目3', 300],
                        ['项目4', 400],
                    ],
                },
                series: [],
                textStyle: {
                    color: '#333333',
                    fontStyle: 'normal',
                    fontWeight: 'normal',
                    fontSize: 12,
                },
            };
        if (Object.prototype.toString.call(opt) === '[object Object]') {
            if (opt.dataset) {
                options.dataset = opt.dataset;
            }
            if (opt.textStyle) {
                options.textStyle = opt.textStyle;
                options.legend.textStyle = opt.textStyle;
                // 清除当前类型图表不支持的属性
                delete options.textStyle.formatter;
            }
            if (opt.color) {
                options.color = opt.color;
            }
            if (opt.xAxis && opt.xAxis.name) {
                options.xAxis.name = opt.xAxis.name;
            }
            if (opt.yAxis && opt.yAxis.name) {
                options.yAxis.name = opt.yAxis.name;
            }
            if (!opt.legend) {
                delete options.legend;
            }
        }
        options.xAxis.axisLabel = options.textStyle;
        // x轴 项目名称强制全部显示
        options.xAxis.axisLabel.interval = 0;
        options.yAxis.axisLabel = options.textStyle;
        // 处理dataset
        options.dataset = this.format_dataset(options.dataset);
        // 渲染有效列数
        let item_length = options.dataset.source[0].length;
        for (let i = 1; i < item_length; i++) {
            let series_obj = {};
            series_obj.type = 'line';
            // 设置线条样式
            if (Object.prototype.toString.call(opt) === '[object Object]' && opt.line_style) {
                series_obj['lineStyle'] = {
                    'width': opt.line_style[i - 1] ? opt.line_style[i - 1].width : 3,
                    'type': opt.line_style[i - 1] ? opt.line_style[i - 1].type : 'solid',
                };
            }
            // 设置显示数值
            if (opt.show_series_value) {
                let markPoint = {};
                markPoint.data = [];
                let source_point = options.dataset.source;
                for (let j = 0; j < source_point.length; j++) {
                    markPoint.data.push({
                        value: source_point[j][i],
                        yAxis: source_point[j][i],
                        xAxis: j,
                    });
                }
                series_obj.markPoint = markPoint;
            }
            options.series.push(series_obj);
        }
        return options;
    },
    // 柱状图
    data_format_bar: function (opt) {
        let options = {
                grid: {
                    top: 60,
                    right: 60,
                    bottom: 60,
                    left: 60,
                },
                legend: {
                    selectedMode: false,
                    textStyle: [],
                },
                tooltip: {
                    axisPointer: 'none',
                    textStyle: {
                        fontSize: 12,
                    },
                },
                xAxis: {
                    type: 'category',
                    name: '',
                },
                yAxis: {
                    name: '',
                },
                dataset: {
                    dimensions: ['product', '项目组1'],
                    source: [
                        ['项目1', 400],
                        ['项目2', 300],
                        ['项目3', 200],
                        ['项目4', 100],
                    ],
                },
                series: [],
                textStyle: {
                    color: '#333333',
                    fontStyle: 'normal',
                    fontWeight: 'normal',
                    fontSize: 12,
                },
            };
        if (Object.prototype.toString.call(opt) === '[object Object]') {
            if (opt.dataset) {
                options.dataset = opt.dataset;
            }
            if (opt.textStyle) {
                options.textStyle = opt.textStyle;
                options.legend.textStyle = opt.textStyle;
                // 清除当前类型图表不支持的属性
                delete options.textStyle.formatter;
            }
            if (opt.color) {
                options.color = opt.color;
            }
            if (opt.xAxis && opt.xAxis.name) {
                options.xAxis.name = opt.xAxis.name;
            }
            if (opt.yAxis && opt.yAxis.name) {
                options.yAxis.name = opt.yAxis.name;
            }
            if (!opt.legend) {
                delete options.legend;
            }
        }
        options.xAxis.axisLabel = options.textStyle;
        // x轴 项目名称强制全部显示
        options.xAxis.axisLabel.interval = 0;
        options.yAxis.axisLabel = options.textStyle;
        // 处理dataset
        options.dataset = this.format_dataset(options.dataset);
        // 更新有效列数
        let item_length = options.dataset.source[0].length;
        for (let i = 1; i < item_length; i++) {
            let series_obj = {};
            series_obj.type = 'bar';
            // 设置显示数值
            if (opt.show_series_value) {
                let markPoint = {};
                markPoint.data = [];
                let source_point = options.dataset.source;
                for (let j = 0; j < source_point.length; j++) {
                    markPoint.data.push({
                        value: source_point[j][i],
                        yAxis: source_point[j][i],
                        xAxis: j,
                    });
                }
                series_obj.markPoint = markPoint;
            }
            // 设置堆叠显示，设置相同的值可实现堆叠
            if (opt.series_pile) {
                series_obj.stack = 'pile';
            }
            options.series.push(series_obj);
        }
        return options;
    },
    // 饼状图、环形图、南丁格尔图
    data_format_pie: function (opt) {
        let options = {
                legend: {
                    selectedMode: false,
                    textStyle: [],
                },
                tooltip : {
                    trigger: 'item',
                    formatter: '{b}：{d}%',
                    textStyle: {
                        fontSize: 12,
                    },
                },
                dataset: {
                    dimensions: ['product', '项目组1'],
                    source: [
                        ['项目1', 100],
                        ['项目2', 200],
                        ['项目3', 300],
                        ['项目4', 400],
                    ],
                },
                series: [],
                textStyle: {
                    color: '',
                    fontStyle: 'normal',
                    fontWeight: 'normal',
                    fontSize: 12,
                },
            };
        if (Object.prototype.toString.call(opt) === '[object Object]') {
            if (opt.dataset) {
                options.dataset = opt.dataset;
            }
            if (opt.textStyle) {
                options.textStyle = opt.textStyle;
                options.legend.textStyle = opt.textStyle;
            }
            if (opt.color) {
                options.color = opt.color;
            }
            if (!opt.legend) {
                delete options.legend;
            }
        }
        // 去除color属性可继承图表块颜色
        options.textStyle.color === '' && delete options.textStyle.color;
        let series_obj = {};
        series_obj['radius'] = [0, '60%'];
        let label_conf = base_opt.fn.clone_object(options.textStyle);
        let format_arr = ['{b}'];
        label_conf.formatter = format_arr.join(' \n ');
        if (Object.prototype.toString.call(opt) === '[object Object]') {
            // 设置文本显示数值
            if (opt.show_series_value) {
                format_arr.push('{@[1]}');
                label_conf.formatter = format_arr.join(' \n ');
            }
            // 设置文本显示百分比
            if (opt.show_series_ratio) {
                format_arr.push('{d}%');
                label_conf.formatter = format_arr.join(' \n ');
            }
            // 设置文本内部显示
            if (opt.label_inside) {
                label_conf.position = 'inside';
            } else {
                delete label_conf.position;
            }

            // 设置环形
            if (opt.series_radius) {
                series_obj['radius'] = ['30%', '60%'];
            }
            // 设置南丁格尔玫瑰图
            if (opt.series_roseType) {
                series_obj['roseType'] = 'radius';
            } else {
                delete series_obj['roseType'];
            }
        }
        // 处理dataset
        options.dataset = this.format_dataset(options.dataset);
        // 饼状图只能渲染第一条数据
        series_obj['type'] = 'pie';
        series_obj['label'] = label_conf;
        options.series.push(series_obj);
        return options;
    },
    // 漏斗图
    data_format_funnel: function (opt) {
        let options = {
                legend: {
                    selectedMode: false,
                    textStyle: [],
                },
                tooltip : {
                    trigger: 'item',
                    formatter: '{b}：{d}%',
                    textStyle: {
                        fontSize: 12,
                    },
                },
                dataset: {
                    dimensions: ['product', '项目组1'],
                    source: [
                        ['项目1', 100],
                        ['项目2', 200],
                        ['项目3', 300],
                        ['项目4', 400],
                    ],
                },
                series: [],
                textStyle: {
                    color: '',
                    fontStyle: 'normal',
                    fontWeight: 'normal',
                    fontSize: 12,
                },
            };
        if (Object.prototype.toString.call(opt) === '[object Object]') {
            if (opt.dataset) {
                options.dataset = opt.dataset;
            }
            if (opt.textStyle) {
                options.textStyle = opt.textStyle;
                options.legend.textStyle = opt.textStyle;
            }
            if (opt.color) {
                options.color = opt.color;
            }
            if (!opt.legend) {
                delete options.legend;
            }
        }
        // 漏斗图只能渲染第一条数据
        let label_conf = base_opt.fn.clone_object(options.textStyle);
        label_conf.show = true;
        label_conf.position = 'outside';
        let format_arr = ['{b}'];
        label_conf.formatter = format_arr.join(' \n ');
        // 设置文本显示数值、百分比
        if (Object.prototype.toString.call(opt) === '[object Object]') {
            if (opt.show_series_value) {
                format_arr.push('{@[1]}');
                label_conf.formatter = format_arr.join(' \n ');
            }
            if (opt.show_series_ratio) {
                format_arr.push('{d}%');
                label_conf.formatter = format_arr.join(' \n ');
            }
        }
        // 处理dataset
        options.dataset = this.format_dataset(options.dataset);
        options.series.push({
            type: 'funnel',
            label: label_conf,
        });
        return options;
    },
};

export default chart_opt;