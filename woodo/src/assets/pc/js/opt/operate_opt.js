const {parseSVG, makeAbsolute} = require('svg-path-parser');
import base_opt from '@/assets/pc/js/opt/base_opt.js';
// 内置矩形
let rect = {};
let operate_opt = {
    // 是否可拖动标识
    can_drag: false,
    // 是否已拖动标识 -> 用于判断点击
    dragged: false,
    // 是否可缩放标识
    can_resize: false,
    // 是否可旋转标识
    can_rotate: false,
    // 是否允许选中组合元素中的子元素 -> 用于处理组合元素首次选中会选中内部子元素问题
    can_check_child: true,
    // 重置矩形
    reset_rect: function(ele, obj = {}){
        if(!ele || !ele.length) return false;
        // 默认参数
        let params = {
            wireframe: true // 是否更新虚线框
        }
        Object.assign(params, obj);
        // 重置样式
        let $operate = $('.edit_operation #operate');
        $operate.removeAttr('style').find('.operate_border').removeAttr('style');
        let ele_type_arr = ele.map((i, el) => $(el).attr('data-type')).toArray();
        let ele_msg = base_opt.get_common_message(ele);
        // 更新 rect 数据
        rect.x = ele_msg.window_scaled.x;
        rect.y = ele_msg.window_scaled.y;
        rect.width = ele_msg.window_scaled.w;
        rect.height = ele_msg.window_scaled.h;
        rect.rotate = Number(ele_msg.window_scaled.rotate);
        rect.lock = ele_msg.lock;
        // 单元素选中
        if (ele_type_arr.length === 1) {
            $operate.attr('class', `operate select_${ele_type_arr[0]}`);
            switch (ele_type_arr[0]) {
                // 文本元素存在边框时不显示虚线框
                case 'text':
                    if ($('.paste_clean_menu').length) {
                        operate_opt.set_format_btn();
                    }
                    break;
                // 不渲染虚线框 & 线条专属操作
                case 'line':
                    operate_opt.set_line_resize(ele, $operate);
                    break;
            }
        } else {
            // 组合选中
            $operate.attr('class', 'operate multi_select');
            // 表格禁用缩放
            if (ele_type_arr.includes('table')) {
                $operate.addClass("disable_scale_y");
            }
        }
        // 任意选中状态下
        let disable_rotate = ['table', 'line', 'chart'];
        if (utils.arrayCompareSameValue(disable_rotate, ele_type_arr)){ 
            // 禁用旋转
            $operate.addClass("disable_rotate");
        } 
        if (ele_type_arr.includes('text')){
            // 文本禁用 y 轴缩放
            $operate.addClass("disable_scale_y");
        }  
        if ($('.ele_link_tool').length) {
            // 计算超链接工具栏定位
            operate_opt.set_link_tool(ele);
        } 
        if ($('.resize_number').length){
            // 计算缩放数值定位
            operate_opt.set_resize_number();
        } 
        if (ele_msg.lock){
            // 锁定
            $operate.addClass('lock');
        } 

        if(params.wireframe) {
            // 更新助手坐标
            operate_opt.update_helper_position($operate)
        }; 
        // 子虚线框
        operate_opt.build_group_child(ele);
        // 更新快捷格式坐标
        operate_opt.set_format_position(ele);
    },
    // 获取内置形状数据
    get_inside_rect: function(){
        return base_opt.fn.clone_object(rect);
    },
    // 得到缩放指定倍数后的坐标
    get_scaled_rect: function(params, baseIndex){
        let { x, y, width, height, scale } = params,
            offset = { x: 0, y: 0 },
            deltaXScale = scale.x - 1,
            deltaYScale = scale.y - 1,
            deltaWidth = width * deltaXScale,
            deltaHeight = height * deltaYScale,
            newWidth = width + deltaWidth,
            newHeight = height + deltaHeight,
            newX = x - deltaWidth / 2,
            newY = y - deltaHeight / 2;
        if (baseIndex){
            let points = [{x, y}, {x: x+ width, y}, {x: x + width, y: y+ height}, {x, y: y+ height}],
                newPoints = [{x: newX, y: newY}, {x: newX+ newWidth, y: newY}, {x: newX + newWidth, y: newY+ newHeight}, {x: newX, y: newY+ newHeight}];
            offset.x = points[baseIndex].x - newPoints[baseIndex].x;
            offset.y = points[baseIndex].y - newPoints[baseIndex].y;
        }
        return {
            x: newX + offset.x,
            y: newY + offset.y,
            width: newWidth,
            height: newHeight
        }
    },
    // 获取旋转指定角度后的rect
    transform:function(options, angle){
        let x = options.x,
            y = options.y,
            width = options.width,
            height = options.height,
            r = Math.sqrt(Math.pow(width, 2) + Math.pow(height, 2)) / 2,
            a = Math.round(Math.atan(height / width) * 180 / Math.PI),
            tlbra = 180 - angle - a,
            trbla = a - angle,
            ta = 90 - angle,
            ra = angle,
            halfWidth = width / 2,
            halfHeight = height / 2,
            middleX = x + halfWidth,
            middleY = y + halfHeight,
            topLeft = {
                x: middleX + r * Math.cos(tlbra * Math.PI / 180),
                y: middleY - r * Math.sin(tlbra * Math.PI / 180)
            },
            top = {
                x: middleX + halfHeight * Math.cos(ta * Math.PI / 180),
                y: middleY - halfHeight * Math.sin(ta * Math.PI / 180),
            },
            topRight = {
                x: middleX + r * Math.cos(trbla * Math.PI / 180),
                y: middleY - r * Math.sin(trbla * Math.PI / 180)
            },
            right = {
                x: middleX + halfWidth * Math.cos(ra * Math.PI / 180),
                y: middleY + halfWidth * Math.sin(ra * Math.PI / 180),
            },
            bottomRight = {
                x: middleX - r * Math.cos(tlbra * Math.PI / 180),
                y: middleY + r * Math.sin(tlbra * Math.PI / 180)
            },
            bottom = {
                x: middleX - halfHeight * Math.sin(ra * Math.PI / 180),
                y: middleY + halfHeight * Math.cos(ra * Math.PI / 180),
            },
            bottomLeft = {
                x: middleX - r * Math.cos(trbla * Math.PI / 180),
                y: middleY + r * Math.sin(trbla * Math.PI / 180)
            },
            left = {
                x: middleX - halfWidth * Math.cos(ra * Math.PI / 180),
                y: middleY - halfWidth * Math.sin(ra * Math.PI / 180),
            },
            minX = Math.min(topLeft.x, topRight.x, bottomRight.x, bottomLeft.x),
            maxX = Math.max(topLeft.x, topRight.x, bottomRight.x, bottomLeft.x),
            minY = Math.min(topLeft.y, topRight.y, bottomRight.y, bottomLeft.y),
            maxY = Math.max(topLeft.y, topRight.y, bottomRight.y, bottomLeft.y);
        return {
            point: [topLeft, top, topRight, right, bottomRight, bottom, bottomLeft, left],
            width: maxX - minX,
            height: maxY - minY,
            left: minX,
            right: maxX,
            top: minY,
            bottom: maxY,
            middle:{x:middleX,y:middleY}
        }
    },
    // 获取旋转后缩放标记手势
    get_new_cursor_array:function(degree){
        const cursorStyleArray = ['ns-resize', 'nesw-resize', 'ew-resize', 'nwse-resize', 'ns-resize', 'nesw-resize', 'ew-resize', 'nwse-resize'];
        const ARR_LENGTH = 8;
        const STEP = 45;
        let startIndex = 0;
        if (degree) {
            startIndex = Math.floor(degree / STEP);
            if (degree % STEP > (STEP / 2)) {
                startIndex += 1;
            }
        }
        if (startIndex > 1) {
            const len = ARR_LENGTH - startIndex;
            return (cursorStyleArray.slice(startIndex, startIndex + len))
                .concat(cursorStyleArray.slice(0, startIndex));
        }
        return cursorStyleArray;
    },
    // 设置旋转后缩放标记手势
    set_cursor_style:function(ele, degree){
        let top = ele.find('.resizable .t'),
            topRight = ele.find('.resizable .tr'),
            right = ele.find('.resizable .r'),
            bottomRight = ele.find('.resizable .br'),
            bottom = ele.find('.resizable .b'),
            bottomLeft = ele.find('.resizable .bl'),
            left = ele.find('.resizable .l'),
            topLeft = ele.find('.resizable .tl'),
            cursorStyle = operate_opt.get_new_cursor_array(degree);
        top.css({'cursor': cursorStyle[0]});
        topRight.css({'cursor': cursorStyle[1]});
        right.css({'cursor': cursorStyle[2]});
        bottomRight.css({'cursor': cursorStyle[3]});
        bottom.css({'cursor': cursorStyle[4]});
        bottomLeft.css({'cursor': cursorStyle[5]});
        left.css({'cursor': cursorStyle[6]});
        topLeft.css({'cursor': cursorStyle[7]});
    },
    // 重绘助手
    draw:function(){
        operate_opt.css(operate_opt.box, {
            left: operate_opt.p.x + 'px',
            top: operate_opt.p.y + 'px',
            width: operate_opt.p.width + 'px',
            height: operate_opt.p.height + 'px',
            transform: 'rotate(' + operate_opt.p.rotate + 'deg)'
        });
    },
    // 同步样式
    css:function(node, ops){
        for (let index in ops) {
            node['style'][index] = ops[index];
        }
    },
    // 获取内置 rect 中心点
    get_center_point:function(){
        return {
            x: rect.x + rect.width / 2,
            y: rect.y + rect.height / 2
        };
    },
    // 取得鼠标释放点在rect8点坐标中的对应点及其对角线点
    get_point_and_opposite:function (point, ex, ey){
        let oppositePoint = {},
            currentPoint = {},
            minDelta = 1000,
            currentIndex = 0,
            oppositeIndex = 0;
        point.forEach((p, index) => {
            let delta = Math.sqrt(Math.pow(p.x - ex, 2) + Math.pow(p.y - ey, 2));
            if (delta < minDelta) {
                currentPoint = p;
                currentIndex = index;
                minDelta = delta;
                let offset = 4,
                    oIndex = index - offset;
                if (oIndex < 0)  oIndex = index + offset;
                // 取对角线点坐标
                oppositePoint = point.slice(oIndex, oIndex + 1)[0];
                oppositeIndex = oIndex;
            }
        });
        return {
            current: {
                index: currentIndex,
                point: currentPoint
            },
            opposite: {
                index: oppositeIndex,
                point: oppositePoint
            }
        };
    },
    // 根据缩放基点和缩放比例取得新的rect
    get_new_rect:function (oPoint, scale, oTransformedRect, baseIndex){
        let scaled_rect = operate_opt.get_scaled_rect({
            x: oPoint.x,
            y: oPoint.y,
            width: oPoint.width,
            height: oPoint.height,
            scale: scale
        }),
            rotate_rect = operate_opt.transform(scaled_rect, oPoint.rotate),
            // 计算到平移后的新坐标
            translatedX = oTransformedRect.point[baseIndex].x - rotate_rect.point[baseIndex].x + rotate_rect.left,
            translatedY = oTransformedRect.point[baseIndex].y - rotate_rect.point[baseIndex].y + rotate_rect.top,
            // 计算平移后元素左上角的坐标
            newX = translatedX + rotate_rect.width / 2 - scaled_rect.width / 2,
            newY = translatedY + rotate_rect.height / 2 - scaled_rect.height / 2,
            // 缩放后元素的高宽
            newWidth = scaled_rect.width,
            newHeight = scaled_rect.height;
        return {
            x: newX,
            y: newY,
            width: newWidth,
            height: newHeight
        };
    },
    // 更新按钮定位
    update_helper_position: function(operate){
        operate_opt.set_operate_position(operate, rect);
        operate_opt.set_cursor_style(operate, rect.rotate);
        operate_opt.set_resizer_position(operate.find('.resize_handle'), rect);
        operate_opt.set_rotater_position(operate.find('.rotate'), rect);
        operate_opt.set_operate_rotate(operate, rect);
    },
    // 设置虚线框定位
    set_operate_position: function(dom, data){
        dom.css({
            'left': data.x,
            'top': data.y,
            'width': data.width,
            'height': data.height,
        }).show();
    },
    // 设置虚线框旋转
    set_operate_rotate: function(dom, data){
        dom.css({
            transform: `rotate(${data.rotate}deg)`
        });
        rect.rotate = data.rotate;
    },
    // 设置缩放助手坐标
    set_resizer_position: function(dom_arr, data){
        let rect = data,
            w = Number(rect.width),
            h = Number(rect.height);
        dom_arr.each(function(){
            let $dom = $(this);
            switch (true) {
                case $dom.hasClass('tl') :
                    $dom.css({
                        left: 0,
                        top: 0
                    });
                    break;
                case $dom.hasClass('t') :
                    $dom.css({
                        left: `${w / 2}px`,
                        top: 0
                    });
                    break;
                case $dom.hasClass('tr') :
                    $dom.css({
                        left: `${w}px`,
                        top: 0
                    });
                    break;
                case $dom.hasClass('r') :
                    $dom.css({
                        left: `${w}px`,
                        top: `${h / 2}px`
                    });
                    break;
                case $dom.hasClass('br') :
                    $dom.css({
                        left: `${w}px`,
                        top: `${h}px`
                    });
                    break;
                case $dom.hasClass('b') :
                    $dom.css({
                        left: `${w / 2}px`,
                        top: `${h}px`
                    });
                    break;
                case $dom.hasClass('bl') :
                    $dom.css({
                        left: 0,
                        top: `${h}px`
                    });
                    break;
                case $dom.hasClass('l') :
                    $dom.css({
                        left: 0,
                        top: `${h / 2}px`
                    });
                    break;
            }
            // 缩放操作框大小适配
            let size = 10;
            let lrWidth = 8;// 左右编辑点的宽度
            let lrHeight = 16;// 左右编辑点的高度
            if (w < 40 || h < 40) {
                size = 8;
                lrWidth = 6;
                lrHeight = 14;
            }
            if($dom.hasClass('l') || $dom.hasClass('r')){
                $dom.css({
                    'width': lrWidth,
                    'height': lrHeight,
                    'margin': `-${lrHeight / 2}px 0 0 -${lrWidth / 2}px`,
                    'borderRadius': '5px',
                });
            }else if($dom.hasClass('t') || $dom.hasClass('b')){
                $dom.css({
                    'width': lrHeight,
                    'height': lrWidth,
                    'margin': `-${lrWidth / 2}px 0 0 -${lrHeight / 2}px`,
                    'borderRadius': '5px',
                });
            }else{
                $dom.css({
                    'width': size,
                    'height': size,
                    'margin': `-${size / 2}px 0 0 -${size / 2}px`,
                });
            }
        });
    },
    // 设置旋转助手坐标
    set_rotater_position: function(dom, data){
        let rect = data,
            w = Number(rect.width);
        dom.css({
            top: 0,
            left: `${w}px`
        });
    },
    // 设置快捷格式坐标
    set_format_position: function(ele){
        if (rect.lock) {
            return;
        }
        let $format = $('.convformat_contain');
        let _rect = base_opt.compute_ele_seat(ele).window_scaled;
        _rect.y = _rect.y - 60;
        $format.css({
            'top': `${_rect.y}px`,
            'left': `${_rect.x}px`,
        });
        // 工具栏超出屏幕处理
        let format_rect = base_opt.fn.get_client_rect($format);
        // 初次显示，因vue渲染未完成，重新渲染位置
        if (format_rect.width <= 0) {
            setTimeout(() => {
                format_rect = base_opt.fn.get_client_rect($format);
                if (_rect.x > 0 && format_rect.right > window.innerWidth) {
                    $format.css('left', `${window.innerWidth - format_rect.width}px`);
                }
                if (_rect.y > 0 && format_rect.top > window.innerHeight) {
                    $format.css('top', `${window.innerHeight - format_rect.height}px`);
                }
            }, 16);
        } else {
            if (format_rect.right > window.innerWidth) {
                _rect.x = window.innerWidth - format_rect.width;
                $format.css('left', `${_rect.x}px`);
            }
            if (_rect.x < 0) {
                $format.css('left', `0px`);
            }
            if (format_rect.bottom > window.innerHeight) {
                _rect.y = window.innerHeight - format_rect.height;
                $format.css('top', `${_rect.y}px`);
            }
            if (_rect.y < 0) {
                $format.css('top', `0px`);
            }
        }
    },
    // 设置线条缩放助手
    set_line_resize: function(ele, operate){
        // 错误状态判断
        if(!ele || ele.length !== 1 || ele.attr('data-type') !== 'line') {
			console.error('params type error');
			return false;
        }
        let page_scale = base_opt.page_scale;
        // 获取线条数据
        let $line = ele.find('.line');
        let commands = parseSVG($line.attr('d'));
		// 绝对坐标转换
        makeAbsolute(commands);
        let first_point = commands[0];
        let last_point = commands[commands.length - 1];
        let $resize_l = operate.find('.point_left');
        let $resize_r = operate.find('.point_right');
        let x1 = first_point.x * page_scale - $resize_l.width();
        let y1 = first_point.y * page_scale - $resize_l.height();
        let x2 = last_point.x * page_scale - $resize_r.width();
        let y2 = last_point.y * page_scale - $resize_r.height();
        // 水平状态
        if (y1 === y2) {
            y1 = (rect.height - $resize_l.height()) / 2 - 2;
            y2 = (rect.height - $resize_r.height()) / 2 - 2;
        }
        // 垂直状态
        if (x1 === x2) {
            x1 = (rect.width - $resize_l.width()) / 2 - 2;
            x2 = (rect.width - $resize_r.width()) / 2 - 2;
        }
        // 线头
        $resize_l.css({
            'left': `${x1}px`,
            'top': `${y1}px`,
        });
        // 线尾
        $resize_r.css({
            'left': `${x2}px`,
            'top': `${y2}px`,
        });
    },
    // 设置缩放数值位置
    set_resize_number: function(){
        let $dom = $('.resize_number'),
            op_x = rect.x,
            op_y = rect.y,
            op_w = rect.width,
            op_h = rect.height,
            rotate = rect.rotate,
            tl, tr, bl, br, middle, dom_offset;
        tl = {
            x: op_x,
            y: op_y
        };
        tr = {
            x: op_x + op_w,
            y: op_y
        };
        bl = {
            x: op_x,
            y: op_y + op_h
        };
        br = {
            x: op_x + op_w,
            y: op_y + op_h
        };
        middle = {
            x: op_x + Number(op_w / 2),
            y: op_y + Number(op_h / 2)
        };
        // 计算绕中心点旋转后，四点坐标
        let new_tl = base_opt.fn.after_rotate_point(tl, middle, rotate),
            new_tr = base_opt.fn.after_rotate_point(tr, middle, rotate),
            new_bl = base_opt.fn.after_rotate_point(bl, middle, rotate),
            new_br = base_opt.fn.after_rotate_point(br, middle, rotate);
        let position_arr = [new_tl, new_tr, new_bl, new_br];
        // 判断旋转角度
        switch (true) {
            // 0~90度始终右下角
            case rotate >= 0 && rotate <= 90:
                $dom.css({
                    top: br.y,
                    left: br.x + 20
                });
                break;
            // 获取左右侧的点
            default:
                position_arr.sort(function (a, b) {
                    return b.x - a.x
                });
                dom_offset = position_arr[0];
                $dom.css({
                    top: dom_offset.y,
                    left: dom_offset.x + 20
                });
                break;
        }
    },
    // 设置元素超链接工具栏
    set_link_tool: function (ele){
        let $tool = $('.ele_link_tool');
        let left = rect.x + rect.width / 3;
        let top = rect.y + rect.height + 10;
        $tool.css({
            'top': `${top}px`,
            'left': `${left}px`,
        });
        // 超出屏幕处理
        let tool_rect = base_opt.fn.get_client_rect($tool);
        if (tool_rect.right > window.innerWidth) {
            left = window.innerWidth - tool_rect.width;
            $tool.css('left', `${left}px`);
        }
        if (left < 0) {
            $tool.css('left', `0px`);
        }
        if (tool_rect.bottom > window.innerHeight) {
            top = window.innerHeight - tool_rect.height;
            $tool.css('top', `${top}px`);
        }
        if (top < 0) {
            $tool.css('top', `0px`);
        }
    },
    // 设置文本保留格式工具栏
    set_format_btn: function () {
        $('.paste_clean_menu').css({
            top: `${rect.y}px`,
            left: `${rect.x + rect.width + 10}px`
        });
    },
    // 生成子虚线框
    build_group_child: function(ele){
        // 错误状态判断
        if(!ele) {
			console.error('params type error');
			return false;
        }
        let $operate = $('.edit_operation #operate');
        let $child_bar = $operate.find('.group_child');
        let $childs = [];
        // 生成前移除之前的
        $child_bar.find('.child').remove();
        if (ele.length === 1) {
            return;
        }
        // 多选时文本失焦
        ele.find('.show_text').blur();
        // 获取组合情况
        let element_arr = [];
		let temp_group_uuid = {};
		ele.each((i, ele) => {
			let $ele = $(ele);
			let group = $ele.attr('data-group');
			if (group) {
				if (!temp_group_uuid[group]) {
					element_arr.push(base_opt.get_group_element($ele));
					temp_group_uuid[group] = true;
				}
			} else {
				element_arr.push($ele);
			}
        });
        // 只选中组合元素
        if (element_arr.length === 1) {
            element_arr[0].each((i, ele) => {
                let $ele = $(ele);
                let msg = base_opt.compute_ele_seat($ele).window_scaled;
                let $child = $('<div class="child"></div>');
                $child.attr({
                    'data-id': $ele.attr('id'),
                }).css({
                    'top': `${base_opt.fn.unit_2_px(msg.y) - rect.y}px`,
                    'left': `${base_opt.fn.unit_2_px(msg.x) - rect.x}px`,
                    'width': `${base_opt.fn.unit_2_px(msg.w)}px`,
                    'height': `${base_opt.fn.unit_2_px(msg.h)}px`,
                });
                $childs.push($child);
            });
        } else {
            // 多选情况，存在组合与单元素
            element_arr.forEach(item => {
                let $ele = item;
                let group = $ele.attr('data-group');
                let msg = base_opt.compute_ele_seat(item).window_scaled;
                let $child = $('<div class="child"></div>');
                let attr = {};
                attr['data-id'] = $ele.attr('id');
                if (group) {
                    attr['data-group'] = group;
                }
                $child.attr(attr).css({
                    'top': `${base_opt.fn.unit_2_px(msg.y) - rect.y}px`,
                    'left': `${base_opt.fn.unit_2_px(msg.x) - rect.x}px`,
                    'width': `${base_opt.fn.unit_2_px(msg.w)}px`,
                    'height': `${base_opt.fn.unit_2_px(msg.h)}px`,
                });
                $childs.push($child);
            });
        }
        $child_bar.append($childs);
    },
    // 更新组合单选虚线框
    set_group_operate: function(ele){
        // 错误状态判断
        if(!ele || ele.length <= 1) {
			console.error('params type error');
			return false;
		}
        let $group_operate = $('.group_operate'),
            data = base_opt.get_common_message(ele),
            group_rect = {
                x: base_opt.fn.unit_2_px(data.window_scaled.x),
                y: base_opt.fn.unit_2_px(data.window_scaled.y),
                width: base_opt.fn.unit_2_px(data.window_scaled.w),
                height: base_opt.fn.unit_2_px(data.window_scaled.h),
                rotate: Number(data.window_scaled.rotate),
                lock: data.lock,
            };
        operate_opt.set_operate_position($group_operate, group_rect);
        $group_operate.show();
    },
    // 生成可编辑操作点 point_arr = [{x:x, y:y}]
    buildPoint: function (point_arr) {
        let operate = $('#operate .operate_path_point');
        // 重置操作点
        operate.children().remove();
        if (point_arr && Array.isArray(point_arr) && point_arr.length > 0) {
            let page_scale = base_opt.page_scale;
            let $div = $('<div></div>');
            for (let i = 0; i < point_arr.length; i++) {
                let $point = $('<div class="path_point"></div>');
                let item = point_arr[i];
                $point.css({
                    'left': `${(item.x * page_scale)}px`,
                    'top': `${(item.y * page_scale)}px`,
                });
                $point.attr('id', `path_point_${i}`);
                $div.append($point);
            }
            operate.html($div.html());
        }
    },

    // 绑定旋转 {handle, before_down, down, before_move, move, before_up, up}
    bind_rotate_event:function(param){
        $(document).on('mousedown', param.handle, function(e){
            let event = e || window.event;
            // 初始化旋转状态
            operate_opt.can_rotate = true;
            // 触发 mousedown 前判断操作
            if(typeof param.before_down === "function") {
                param.before_down(event);
            }
            if(!operate_opt.can_rotate) {
                return;
            }
            // 触发 mousedown
            let $operate = $('.edit_operation .operate'),
                point = operate_opt.get_center_point(),
                prevAngle = Math.atan2(event.pageY - point.y, event.pageX - point.x) - rect.rotate * Math.PI / 180;
            // 触发 mousedown 回调
            if(typeof param.down === "function") {
                param.down(rect);
            }
            // 触发 mousemove
            $(document).on('mousemove',function(ev){
                // 触发 mousemove 前判断操作
                if(typeof param.before_move === "function") {
                    param.before_move(ev);
                }
                if(!operate_opt.can_rotate) {
                    return;
                }
                // 旋转
                let event = ev || window.event,
                    angle = Math.atan2(event.pageY - point.y, event.pageX - point.x),
                    rotate = (Math.floor((angle - prevAngle) * 180 / Math.PI) % 360) < 0 ? 360+Math.floor((angle - prevAngle) * 180 / Math.PI) : (Math.floor((angle - prevAngle) * 180 / Math.PI) % 360);
                switch (true) {
                    case rotate >= 356 || rotate <= 4 :
                        rect.rotate = 0;
                        break;
                    case rotate >= 41 && rotate <= 49 :
                        rect.rotate = 45;
                        break;
                    case rotate >= 86 && rotate <= 94 :
                        rect.rotate = 90;
                        break;
                    case rotate >= 131 && rotate <= 139 :
                        rect.rotate = 135;
                        break;
                    case rotate >= 176 && rotate <= 184 :
                        rect.rotate = 180;
                        break;
                    case rotate >= 221 && rotate <= 229 :
                        rect.rotate = 225;
                        break;
                    case rotate >= 266 && rotate <= 274 :
                        rect.rotate = 270;
                        break;
                    case rotate >= 311 && rotate <= 319 :
                        rect.rotate = 315;
                        break;
                    default :
                        rect.rotate = rotate;
                        break;
                }
                // 设置虚线框旋转
                operate_opt.set_operate_rotate($operate, rect);
                // 触发 mousemove 回调
                if(typeof param.move === "function") {
                    param.move(rect)
                }
            });
            // 触发 mouseup
            $(document).on('mouseup', function(){
                $(document).unbind('mousemove');
                $(document).unbind('mouseup');
                // 触发 mouseup 前判断操作
                if(typeof param.before_up === "function") {
                    param.before_up(event);
                }
                if(!operate_opt.can_rotate) {
                    return;
                }
                operate_opt.set_cursor_style($operate.find('.resizable'), rect.rotate);
                // 触发 mouseup 回调
                if(typeof param.up === "function") {
                    param.up(rect);
                }
                // 更新缩放数值位置
                operate_opt.set_resize_number();
                // 更新状态
                operate_opt.can_rotate = false;
            });
        });
        $(document).on('dragstart', param.handle, function(e){
            e.preventDefault();
            return false;
        });
    },
    // 绑定缩放 {handle, before_down, down, before_move, move, before_up, up}
    bind_resize_events:function(param){
        $(document).on('mousedown', param.handle, function(e){
            let event = e || window.event;
            event.preventDefault();
            operate_opt.can_resize = true;
            // 触发 mousedown 前判断操作
            if (typeof param.before_down === "function") {
                param.before_down(event);
            }
            if(!operate_opt.can_resize) {
                return;
            }
            // 触发 mousedown
            let $target = event.currentTarget,
                { x, y, width, height, rotate } = rect,
                ex = event.pageX,
                ey = event.pageY,
                // 计算初始状态旋转后的rect
                transformedRect = operate_opt.transform({x,y,width,height}, rotate),
                // 取得旋转后的8点坐标
                { point } = transformedRect,
                // 获取当前点和对角线点
                pointAndOpposite = operate_opt.get_point_and_opposite(point, ex, ey),
                { opposite } = pointAndOpposite,
                // 对角线点的索引即为缩放基点索引
                baseIndex = opposite.index,
                oppositeX = opposite.point.x,
                oppositeY = opposite.point.y,
                // 鼠标释放点距离当前点对角线点的偏移量
                offsetWidth = Math.abs(ex - oppositeX),
                offsetHeight = Math.abs(ey - oppositeY),
                // 记录最原始的状态
                oPoint = {x,y,width,height,rotate},
                // 记录 move 前 rect 值
                o_rect = base_opt.fn.clone_object(rect);
            // 触发 mousedown 回调
            if(typeof param.down === "function") {
                param.down(oPoint, rect);
            }
            // 触发 mousemove 前判断操作
            if (typeof param.before_move === "function") {
                param.before_move(event)
            }
            // 触发 mousemove
            $(document).on('mousemove', function(ev){
                let event = ev || window.event;
                if(!operate_opt.can_resize) {
                    return;
                }
                let nex = event.pageX,
                    ney = event.pageY,
                    scale = { x: 1, y: 1 },
                    realScale = 1,
                    newRect;
                // 判断是根据x方向的偏移量来计算缩放比还是y方向的来计算
                if (offsetWidth > offsetHeight) {
                    realScale = Math.abs(nex - oppositeX) / offsetWidth;
                } else {
                    realScale = Math.abs(ney - oppositeY) / offsetHeight;
                }
                // 判断缩放比例计算方式
                switch (true) {
                    case [0, 2, 4, 6].indexOf(baseIndex) > -1 :
                        scale.x = scale.y = realScale;
                        break;
                    case [1, 5].indexOf(baseIndex) > -1 :
                        scale.y = realScale;
                        break;
                    case [3, 7].indexOf(baseIndex) > -1 :
                        scale.x = realScale;
                        break;
                }
                // 获取缩放后的 rect
                newRect = operate_opt.get_new_rect(oPoint, scale, transformedRect, baseIndex);
                rect.x = newRect.x;
                rect.y = newRect.y;
                rect.width = newRect.width;
                rect.height = newRect.height;
                // 触发 mousemove 回调
                if(typeof param.move === "function") {
                    param.move(o_rect, rect, $target)
                }
                // 更新 move 前 rect
                o_rect = base_opt.fn.clone_object(rect);
            });
            // 触发 mouseup
            $(document).on('mouseup', function(){
                $(document).unbind('mousemove');
                $(document).unbind('mouseup');
                // 触发 mouseup 前判断操作
                if(typeof param.before_up === "function") {
                    param.before_up(event);
                }
                // 触发 mouseup 回调
                if(typeof param.up === "function" && operate_opt.can_resize) {
                    param.up(oPoint, rect);
                }
                // 更新状态
                operate_opt.can_resize = false;
            });
        });
        $(document).on('dragstart', param.handle, function(e){
            e.preventDefault();
            return false;
        });
    },
    // 绑定移动 {handle, before_down, down, before_move, move, before_up, up}
    bind_move_event:function(param){
        /*
        * 移动方法中， can_drag 为 false 的情况不直接 return false，为了保留 富文本框操作
        * */
        $(document).on('mousedown', param.handle, function(e){
            let event = e || window.event;
            if (event.button !== 0) {
                return;
            }
            // 初始化可拖动状态
            operate_opt.can_drag = true;
            // 初始化已拖动状态
            operate_opt.dragged = false;
            // 触发 mousedown 前判断操作
            if (typeof param.before_down === 'function') {
                param.before_down(event);
            }
            if(!operate_opt.can_drag){
                return;
            }
            let $operate = $('.edit_operation .operate'),
                old_rect = base_opt.fn.clone_object(rect),
                downmoveX = event.pageX,
                downmoveY = event.pageY,
                deltaX = event.pageX - rect.x,
                deltaY = event.pageY - rect.y,
                currentX = rect.x,
                currentY = rect.y,
                direction;
            // 触发 mousedown 回调
            if (typeof param.down === "function") {
                param.down(rect);
            }
            // 触发 mousemove
            $(document).on('mousemove', function(ev){
                // 触发 mousemove 前判断操作
                if(typeof param.before_move === 'function') {
                    param.before_move(rect);
                }
                if(!operate_opt.can_drag){
                    return;
                }
                let event = ev || window.event;
                let diff_x;
                let diff_y;
                let moveX = event.pageX;
                let moveY = event.pageY;
                let gap_moveX = Math.abs(moveX - downmoveX);
                let gap_moveY = Math.abs(moveY - downmoveY);
                downmoveX = moveX;
                downmoveY = moveY;
                // 判断shift平移
                if (event.shiftKey) {
                    switch (true) {
                        case typeof  direction === 'undefined' || direction === '' :
                            // 横向 - 固定纵坐标不变
                            if (gap_moveX > gap_moveY) {
                                direction = 'transverse';
                                rect.y = currentY;
                                rect.x = moveX - deltaX;
                            } else
                            // 纵向 - 固定横坐标不变
                            if (gap_moveY > gap_moveX) {
                                direction = 'portrait';
                                rect.x = currentX;
                                rect.y = moveY - deltaY;
                            }
                            break;
                        case direction === 'transverse' :
                            rect.y = currentY;
                            rect.x = moveX - deltaX;
                            break;
                        case direction === 'portrait' :
                            rect.x = currentX;
                            rect.y = moveY - deltaY;
                            break;
                    }
                } else {
                    rect.x = moveX - deltaX;
                    rect.y = moveY - deltaY;
                    direction = '';
                }
                // 更新移动状态
                diff_x = rect.x - old_rect.x;
                diff_y = rect.y - old_rect.y;
                if(!diff_y && !diff_x){//偏移量都等于0时，不触发移动
                    return;
                }
                old_rect = base_opt.fn.clone_object(rect);
                // 更新已拖动状态
                operate_opt.dragged = currentX !== rect.x || currentY !== rect.y;
                // 触发 mousemove 回调 更新 rect 数据至节点
                if (typeof param.move === "function") {
                    param.move(rect, diff_x, diff_y);
                }
            });
            // 触发 mouseup
            $(document).on('mouseup', function(ev){
                let event = ev || window.event;
                $(document).unbind('mousemove');
                $(document).unbind('mouseup');
                direction = '';
                // 触发 mouseup 前判断操作
                if(typeof param.before_up === 'function') {
                    param.before_up(event);
                }
                // 触发 mouseup 回调
                if (typeof param.up === "function" && operate_opt.can_drag) {
                    param.up(rect);
                }
                // 更新可拖动状态
                operate_opt.can_drag = false;
            });
        });
        $(document).on('dragstart', param.handle, function(e){
            e.preventDefault();
            return false;
        });
    },
};
export default operate_opt;