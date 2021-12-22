import { parseSVG } from 'svg-path-parser';
import base_opt from './base_opt.js';
import operate_opt from '@/assets/pc/js/opt/operate_opt.js';

/**
 * 内置线条顶端箭头样式
 */
let line_marker_arr = [{
    type: 'line_path_01',
    d: '',
    w: 10,
    h: 10,
}, {
    type: 'line_path_02',
    d: 'M10,5 L0,0 5,5 0,10 Z',
    w: 10,
    h: 10,
}, {
    type: 'line_path_03',
    d: 'M0,0 L10,5 0,10 Z',
    w: 10,
    h: 10,
}, {
    type: 'line_path_04',
    d: 'm0 5a5 5 0 1 0 10 0a5 5 0 1 0 -10 0z',
    w: 10,
    h: 10,
}, {
    type: 'line_path_05',
    d: 'M0,5 L5,0 10,5 5,10 Z',
    w: 10,
    h: 10,
}];

/**
 * 内置线条样式
 */
let line_arr = [{
    id: '1',
    type: 'line',
    group: null,
    opacity: 1,
    translate: '0,0',
    rotate: '0,0,0',
    scale: '1,1',
    border_c: '#000000',
    border_w: 1,
    border_s: 0,
    line: 'M0,0 L100,100',
    line_class: 'straight',
    path_l: 'line_path_01',
    path_r: 'line_path_01',
    icon: 'iconbianjiye2-69'
}, {
    id: '2',
    type: 'line',
    group: null,
    opacity: 1,
    translate: '0,0',
    rotate: '0,0,0',
    scale: '1,1',
    border_c: '#000000',
    border_w: 1,
    border_s: 0,
    line: 'M0,0 L100,100',
    line_class: 'straight',
    path_l: 'line_path_01',
    path_r: 'line_path_03',
    icon: 'iconbianjiye2-70'
}, {
    id: '3',
    type: 'line',
    group: null,
    opacity: 1,
    translate: '0,0',
    rotate: '0,0,0',
    scale: '1,1',
    border_c: '#000000',
    border_w: 1,
    border_s: 0,
    line: 'M0,0 L100,100',
    line_class: 'straight',
    path_l: 'line_path_03',
    path_r: 'line_path_03',
    icon: 'iconbianjiye2-71'
}, {
    id: '4',
    type: 'line',
    group: null,
    opacity: 1,
    translate: '0,0',
    rotate: '0,0,0',
    scale: '1,1',
    border_c: '#000000',
    border_w: 1,
    border_s: 16,
    line: 'M0,0 L100,100',
    line_class: 'straight',
    path_l: 'line_path_01',
    path_r: 'line_path_01',
    icon: 'iconbianjiye2-72'
}, {
    id: '5',
    type: 'line',
    group: null,
    opacity: 1,
    translate: '0,0',
    rotate: '0,0,0',
    scale: '1,1',
    border_c: '#000000',
    border_w: 1,
    border_s: 0,
    line: 'M0,0 L100,100',
    line_class: 'straight',
    path_l: 'line_path_04',
    path_r: 'line_path_04',
    icon: 'iconbianjiye2-73'
}, {
    id: '6',
    type: 'line',
    group: null,
    opacity: 1,
    translate: '0,0',
    rotate: '0,0,0',
    scale: '1,1',
    border_c: '#000000',
    border_w: 1,
    border_s: 0,
    line: 'M0,0 L0,100 L100,100 L200,100',
    line_class: 'fold',
    path_l: 'line_path_01',
    path_r: 'line_path_01',
    icon: 'iconbianjiye2-74'
}, {
    id: '7',
    type: 'line',
    group: null,
    opacity: 1,
    translate: '0,0',
    rotate: '0,0,0',
    scale: '1,1',
    border_c: '#000000',
    border_w: 1,
    border_s: 0,
    line: 'M0,0 L0,100 L100,100 L200,100',
    line_class: 'fold',
    path_l: 'line_path_01',
    path_r: 'line_path_03',
    icon: 'iconbianjiye2-75'
}, {
    id: '8',
    type: 'line',
    group: null,
    opacity: 1,
    translate: '0,0',
    rotate: '0,0,0',
    scale: '1,1',
    border_c: '#000000',
    border_w: 1,
    border_s: 0,
    line: 'M0,0 L0,100 L100,100 L200,100',
    line_class: 'fold',
    path_l: 'line_path_03',
    path_r: 'line_path_03',
    icon: 'iconbianjiye2-76'
}, {
    id: '9',
    type: 'line',
    group: null,
    opacity: 1,
    translate: '0,0',
    rotate: '0,0,0',
    scale: '1,1',
    border_c: '#000000',
    border_w: 1,
    border_s: 0,
    line: 'M0,0 C100,0 100,200 200,200',
    line_class: 'curve',
    path_l: 'line_path_01',
    path_r: 'line_path_01',
    icon: 'iconbianjiye2-77'
}, {
    id: '10',
    type: 'line',
    group: null,
    opacity: 1,
    translate: '0,0',
    rotate: '0,0,0',
    scale: '1,1',
    border_c: '#000000',
    border_w: 1,
    border_s: 0,
    line: 'M0,0 C100,0 100,200 200,200',
    line_class: 'curve',
    path_l: 'line_path_01',
    path_r: 'line_path_03',
    icon: 'iconbianjiye2-78'
}, {
    id: '11',
    type: 'line',
    group: null,
    opacity: 1,
    translate: '0,0',
    rotate: '0,0,0',
    scale: '1,1',
    border_c: '#000000',
    border_w: 1,
    border_s: 0,
    line: 'M0,0 C100,0 100,200 200,200',
    line_class: 'curve',
    path_l: 'line_path_03',
    path_r: 'line_path_03',
    icon: 'iconbianjiye2-79'
}];

/**
 * 线条绘制规则
 */
let line_draw_map = {
    // 直线 生成算法
    'straight': {
        setPath(x1 = 0, y1 = 0, x2 = 0, y2 = 0) {
            return `M${Number(+x1.toFixed(3))},${Number(+y1.toFixed(3))}L${Number(+x2.toFixed(3))},${Number(+y2.toFixed(3))}`;
        },
    },
    'fold': {
        setPath(x1 = 0, y1 = 0, x2 = 0, y2 = 0, _x) {
            let fx1 = (x2 / 2) || (x1 / 2);
            let fy1 = y1;
            let fx2 = (x2 / 2) || (x1 / 2);
            let fy2 = y2;
            fx1 = typeof _x !== 'undefined' ? _x : fx1;
            fx2 = typeof _x !== 'undefined' ? _x : fx2;
            updatePoint([{ x: fx1, y: (fy1 / 2) || (fy2 / 2), }]);
            fx1 = Number(+fx1.toFixed(3));
            fy1 = Number(+fy1.toFixed(3));
            fx2 = Number(+fx2.toFixed(3));
            fy2 = Number(+fy2.toFixed(3));
            return `M${Number(+x1.toFixed(3))},${Number(+y1.toFixed(3))}L${fx1},${fy1}L${fx2},${fy2}L${Number(+x2.toFixed(3))},${Number(+y2.toFixed(3))}`;
        },
        getPath(d) {
            let commands = parseSVG(d);
            let xy1 = commands[0];
            let xy2 = commands[commands.length - 1];
            return {
                x1: xy1.x,
                y1: xy1.y,
                x2: xy2.x,
                y2: xy2.y,
                x: commands[1].x,
                y: (commands[1].y / 2) || (commands[2].y / 2),
            };
        },
    },
    'curve': {
        setPath(x1 = 0, y1 = 0, x2 = 0, y2 = 0, _cx1, _cy1, _cx2, _cy2) {
            let cx1 = (x2 / 2) || (x1 / 2);
            let cy1 = y1;
            let cx2 = cx1;
            let cy2 = y2;
            cx1 = typeof _cx1 !== 'undefined' ? _cx1 : cx1;
            cy1 = typeof _cy1 !== 'undefined' ? _cy1 : cy1;
            cx2 = typeof _cx2 !== 'undefined' ? _cx2 : cx2;
            cy2 = typeof _cy2 !== 'undefined' ? _cy2 : cy2;
            updatePoint([{ x: cx1, y: cy1, }, { x: cx2, y: cy2, }]);
            cx1 = Number(+cx1.toFixed(3));
            cy1 = Number(+cy1.toFixed(3));
            cx2 = Number(+cx2.toFixed(3));
            cy2 = Number(+cy2.toFixed(3));
            return `M${Number(+x1.toFixed(3))},${Number(+y1.toFixed(3))}C${cx1},${cy1},${cx2},${cy2},${Number(+x2.toFixed(3))},${Number(+y2.toFixed(3))}`;
        },
        getPath(d) {
            let commands = parseSVG(d);
            let xy1 = commands[0];
            let xy2 = commands[1];
            return {
                x1: xy1.x,
                y1: xy1.y,
                x2: xy2.x,
                y2: xy2.y,
                cx1: xy2.x1,
                cy1: xy2.y1,
                cx2: xy2.x2,
                cy2: xy2.y2,
            };
        },
    },
}
// 绘制方法 line_class:线条类型  path_point:线条起点终点坐标  option_point:备选参数(参数是否可用以setPath为准)
let line_draw = function (line_class = 'straight', path_point = {}, option_point = []) {
    let path = '';
    let fn = line_draw_map[line_class];
    if (fn) {
        let point = {
            x1: 0,
            y1: 0,
            x2: 0,
            y2: 0,
        };
        point = Object.assign(point, path_point);
        let arg = [point.x1, point.y1, point.x2, point.y2].concat(option_point);
        path = fn.setPath.apply(null, arg);
        // 曲线起点终点控制点连接线
        if (line_class === 'curve') {
            BezierCurveLinkline($(`#path_point_0`), $(`#path_point_0`).offset(), $('.resize_line .point_left').offset());
            BezierCurveLinkline($(`#path_point_1`), $(`#path_point_1`).offset(), $('.resize_line .point_right').offset());
        }
    }
    return path;
}

/**
 * 操作编辑点
 * @param {ele} jquery 对象，选中的元素，只在单选时触发
 */
let edit_point = function (ele) {
    operate_opt.buildPoint();
    if (!ele || !ele.jquery) return;
    if (ele.attr('data-type') !== 'line' || ele.length !== 1) return;
    let $line = ele.find('.line');
    let line_class = $line.attr('data-line_class');
    let draw = line_draw_map[line_class];
    // 不可编辑的线条
    if (!draw || !draw.getPath) {
        return;
    }
    let _point = draw.getPath($line.attr('d'));
    let point = [];
    let $outline = ele.find('.outline');
    switch (line_class) {
        case 'fold':
            point = [{ x: _point.x, y: _point.y, }];
            operate_opt.buildPoint(point);
            bindMove({
                target: $(`#path_point_0`),
                down: (t, p) => {
                    _point = draw.getPath($line.attr('d'));
                },
                move: (t, p) => {
                    let nd = draw.setPath(_point.x1, _point.y1, _point.x2, _point.y2, (_point.x + p.x));
                    $line.attr('d', nd);
                    $outline.attr('d', nd);
                },
            });
            break;
        case 'curve':
            point = [{ x: _point.cx1, y: _point.cy1, }, { x: _point.cx2, y: _point.cy2, }];
            operate_opt.buildPoint(point);
            bindMove({
                target: $(`#path_point_0`),
                down: (t, p) => {
                    _point = draw.getPath($line.attr('d'));
                },
                move: (t, p) => {
                    let nd = draw.setPath(_point.x1, _point.y1, _point.x2, _point.y2, (_point.cx1 + p.x), (_point.cy1 + p.y), _point.cx2, _point.cy2);
                    $line.attr('d', nd);
                    $outline.attr('d', nd);
                    // 更新起点终点连接线
                    BezierCurveLinkline($(`#path_point_0`), $(`#path_point_0`).offset(), $('.resize_line .point_left').offset());
                },
            });
            bindMove({
                target: $(`#path_point_1`),
                down: (t, p) => {
                    _point = draw.getPath($line.attr('d'));
                },
                move: (t, p) => {
                    let nd = draw.setPath(_point.x1, _point.y1, _point.x2, _point.y2, _point.cx1, _point.cy1, (_point.cx2 + p.x), (_point.cy2 + p.y));
                    $line.attr('d', nd);
                    $outline.attr('d', nd);
                    // 更新起点终点连接线
                    BezierCurveLinkline($(`#path_point_1`), $(`#path_point_1`).offset(), $('.resize_line .point_right').offset());
                },
            });
            // 起点终点连接线
            setTimeout(() => {
                BezierCurveLinkline($(`#path_point_0`), $(`#path_point_0`).offset(), $('.resize_line .point_left').offset());
                BezierCurveLinkline($(`#path_point_1`), $(`#path_point_1`).offset(), $('.resize_line .point_right').offset());
            }, 100);
            break;
    }
}

// 曲线生成起点终点与控制点相连的线条
function BezierCurveLinkline($el, f, t) {
    if (!$el) {
        return;
    }
    let from = {
        top: 0,
        left: 0,
    };
    let to = {
        top: 0,
        left: 0,
    };
    from = Object.assign(from, f);
    to = Object.assign(to, t);
    let width = Math.sqrt((Math.abs(from.left - to.left) ** 2) + (Math.abs(from.top - to.top) ** 2));
    let deg = Math.atan2(from.top - to.top, from.left - to.left) * 180 / Math.PI - 180;
    $el.html('');
    let line_html = `<div class="linkline" style="width: ${width}px; transform: rotate(${deg}deg);"></div>`;
    $el.append(line_html);
}

/**
 * 绑定移动事件
 */
function bindMove(param) {
    let opt = {
        target: null,
        down: function () { },
        move: function () { },
        up: function () { },
    };
    opt = Object.assign(opt, param);
    opt.target.on('mousedown', start);
    let page_scale = base_opt.page_scale;
    function start(e) {
        let $this = $(this);
        let x = e.clientX;
        let y = e.clientY;
        opt.down($this, {
            x: x,
            y: y,
            clientX: x,
            clientY: y,
        });
        $(document).on('mousemove', move);
        $(document).on('mouseup', end);
        // 移动事件
        function move(ev) {
            let relative_x = ev.clientX - x;
            let relative_y = ev.clientY - y;
            opt.move($this, {
                x: relative_x / page_scale,
                y: relative_y / page_scale,
                clientX: ev.clientX,
                clientY: ev.clientY,
            });
        }
        // 移动结束 解绑
        function end() {
            $(document).off('mousemove', move);
            $(document).off('mouseup', end);
            opt.up($this);
        }
    }
}


/**
 * 缩放时更新操作点位置
 */
function updatePoint(point_arr) {
    let $points = $('#operate .operate_path_point .path_point');
    if ($points.length === 0) return;
    let page_scale = +base_opt.page_scale.toFixed(2);
    for (let i = 0; i < point_arr.length; i++) {
        let item = point_arr[i];
        let $point = $points.eq(i);
        $point.css({
            'left': `${(item.x * page_scale)}px`,
            'top': `${(item.y * page_scale)}px`,
        });
    }
}

export {
    line_arr as line_element_list,
    line_marker_arr as line_marker_list,
    edit_point as edit_line_point,
    line_draw as draw_line_path,
};