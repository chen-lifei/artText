/**
 * 形状编辑方法实现流程
 * 1. 重写 svg path 标签的 d 属性，可编辑的形状中有 'setPath' & 'getPath' 方法，数据结构中新增 shape_editor 字段标识着此形状可编辑，shape_editor 的值 为 shape_arr 对象中的子级
 * 2. setPath用来设置形状的坐标点，返回的字符串是对应形状 path 标签的 d 属性值，规则与重写时的 d 属性值一致，方法提供参数设置 (w = width, h = height, r1 = 可编辑点的值, r2 ...)，根据不同的形状路径需定制不同的设置规则
 * 3. getPath用来获取对应形状 setPath 方法设置的参数
 * 4. shape_opt.js 中的 set_size 方法触发时会调用 shape_opt 方法，通过key参数用来区分形状是否可编辑，key对应着 shape_arr 对象中的子级
 * 5. 在元素选中时会触发 edit_point 方法，operate_opt.buildPoint 方法创建可编辑形状的操作点，bindMove 方法将操作点绑定鼠标事件实现拖动编辑
 * 6. 鼠标拖动操作点时，实际先修改 path 标签的 d 属性，再同步操作点的位置
 */

import base_opt from './base_opt.js';
import operate_opt from '@/assets/pc/js/opt/operate_opt.js';

/**
 * export
 * @param {dom} $path <path></path>
 * @param {string} key shape_arr中对应的形状
 * @param {object} point {w, h} 设置数据 width, height
 * @param {function} callback 未查询到key回调 callback.success || callback.error
 */
let shape_opt = function (ele, point, callback) {
    let ele_creating = !ele.hasClass('checked');
    let key = ele.attr('shape-editor');
    let $path = ele.find('.ele_scale path')[0];
    let $clip_path = ele.find('clipPath path')[0];
    let shape_obj = shape_arr[key];
    // 默认值，防止空数组时，获取下标报错
    let old_points = [{ x: 0, y: 0, }, { x: 0, y: 0, }, { x: 0, y: 0, }, { x: 0, y: 0, }];
    try {
        let points = JSON.parse(ele.find('.shape_path').attr('data-points'));
        // 有数据时才赋值
        if (points.length > 0) {
            old_points = points;
        }
    } catch (error) {}
    // 可编辑的形状
    if (typeof shape_obj !== 'undefined' && typeof shape_obj.shape !== 'undefined') {
        let path_text = '';
        let d = $path.getAttribute('d');
        let w = point.width || 0;
        let h = point.height || 0;
        let old_w = point.oldwidth || 0;
        let old_h = point.oldheight || 0;
        let min = w < h ? w : h;
        let path_info = shape_obj.getPath(d);
        let path_point = [];
        let data_points = [];
        let w_scale_ratio = w / old_w;
        let h_scale_ratio = h / old_h;
        let equal_ratio = old_w !== w && old_h !== h;
        let r1, r2, r3, r4;
        switch (key) {
            // 矩形，默认4个角相同
            case 'shape_rect_1':
                // 获取上次更新时的数据
                r1 = path_info.r1;
                r2 = path_info.r2;
                r3 = path_info.r3;
                r4 = path_info.r4;
                // 同步编辑点
                path_point = [{ x: r1, y: 0, }];
                // 更新编辑点数据
                data_points = [{ x: Math.max(r1, r2, r3, r4), y: 0, }];
                // 判断保存的坐标点是否大于当前的点，用于设置尺寸时还原到上次编辑的形状
                if (!equal_ratio) {
                    if (r1 > 0 && r1 <= old_points[0].x) {
                        r1 = old_points[0].x;
                    }
                    if (r2 > 0 && r2 <= old_points[0].x) {
                        r2 = old_points[0].x;
                    }
                    if (r3 > 0 && r3 <= old_points[0].x) {
                        r3 = old_points[0].x;
                    }
                    if (r4 > 0 && r4 <= old_points[0].x) {
                        r4 = old_points[0].x;
                    }
                }
                path_text = shape_obj.setPath(w, h, r1, r2, r3, r4);
                break;
            case 'shape_rect_round_1':
                // 获取上次更新时的数据
                r1 = path_info.r1;
                r2 = path_info.r2;
                r3 = path_info.r3;
                r4 = path_info.r4;
                if (ele_creating) {
                    r1 = min * 0.2;
                    r2 = min * 0.2;
                    r3 = min * 0.2;
                    r4 = min * 0.2;
                } else if (equal_ratio) {
                    r1 = w_scale_ratio * r1;
                    r2 = w_scale_ratio * r2;
                    r3 = w_scale_ratio * r3;
                    r4 = w_scale_ratio * r4;
                }
                // 同步编辑点
                path_point = [{ x: r1, y: 0, }];
                // 更新编辑点数据
                data_points = [{ x: Math.max(r1, r2, r3, r4), y: 0, }];
                // 判断保存的坐标点是否大于当前的点，用于设置尺寸时还原到上次编辑的形状
                if (!equal_ratio) {
                    if (r1 > 0 && r1 <= old_points[0].x) {
                        r1 = old_points[0].x;
                    }
                    if (r2 > 0 && r2 <= old_points[0].x) {
                        r2 = old_points[0].x;
                    }
                    if (r3 > 0 && r3 <= old_points[0].x) {
                        r3 = old_points[0].x;
                    }
                    if (r4 > 0 && r4 <= old_points[0].x) {
                        r4 = old_points[0].x;
                    }
                }
                path_text = shape_obj.setPath(w, h, r1, r2, r3, r4);
                break;
            case 'shape_rect_round_2':
                r1 = path_info.r1;
                r2 = path_info.r2;
                if (ele_creating) {
                    r1 = 0;
                    r2 = min * 0.2;
                } else if (equal_ratio) {
                    r1 = w_scale_ratio * r1;
                    r2 = w_scale_ratio * r2;
                }
                path_point = [{ x: r1, y: 0, }, { x: w - r2, y: 0, }];
                data_points = [{ x: r1, y: 0, }, { x: r2, y: 0, }];
                if (!equal_ratio) {
                    if (r1 <= old_points[0].x) {
                        r1 = old_points[0].x;
                    }
                    if (r2 <= old_points[1].x) {
                        r2 = old_points[1].x;
                    }
                }
                path_text = shape_obj.setPath(w, h, r1, r2);
                break;
            case 'shape_rect_round_3':
                r1 = path_info.r1;
                if (ele_creating) {
                    r1 = min * 0.2;
                } else if (equal_ratio) {
                    r1 = w_scale_ratio * r1;
                }
                path_point = [{ x: r1, y: 0, }];
                data_points = [{ x: r1, y: 0, }];
                if (!equal_ratio) {
                    if (r1 <= old_points[0].x) {
                        r1 = old_points[0].x;
                    }
                }
                path_text = shape_obj.setPath(w, h, r1);
                break;
            case 'shape_rect_angle_1':
                r1 = path_info.r1;
                if (ele_creating) {
                    r1 = min * 0.4;
                } else if (equal_ratio) {
                    r1 = w_scale_ratio * r1;
                }
                path_point = [{ x: w - r1, y: 0, }];
                path_text = shape_obj.setPath(w, h, r1);
                break;
            case 'shape_rect_angle_2':
                r1 = path_info.r1;
                if (ele_creating) {
                    r1 = min * 0.2;
                } else if (equal_ratio) {
                    r1 = w_scale_ratio * r1;
                }
                path_point = [{ x: r1, y: 0, }];
                path_text = shape_obj.setPath(w, h, r1);
                break;
            case 'shape_rect_angle_3':
                r1 = path_info.r1;
                r2 = path_info.r2;
                if (ele_creating) {
                    r1 = 0;
                    r2 = min * 0.2;
                } else if (equal_ratio) {
                    r1 = w_scale_ratio * r1;
                    r2 = w_scale_ratio * r2;
                }
                path_point = [{ x: r1, y: 0, }, { x: w - r2, y: 0, }];
                path_text = shape_obj.setPath(w, h, r1, r2);
                break;
            // 基本形状
            case 'shape_base_triangle_1':
                r1 = w_scale_ratio * path_info.r1;
                if (ele_creating) {
                    r1 = w / 2;
                }
                path_point = [{ x: r1, y: 0, }];
                path_text = shape_obj.setPath(w, h, r1);
                break;
            case 'shape_base_skewrect_1':
                r1 = path_info.r1;
                if (ele_creating) {
                    r1 = w * 0.4;
                } else if (equal_ratio) {
                    r1 = w_scale_ratio * r1;
                }
                path_point = [{ x: r1, y: 0, }];
                path_text = shape_obj.setPath(w, h, r1);
                break;
            case 'shape_base_skewrect_2':
                r1 = path_info.r1;
                if (ele_creating) {
                    r1 = w * 0.25;
                } else if (equal_ratio) {
                    r1 = w_scale_ratio * r1;
                }
                path_point = [{ x: r1, y: 0, }];
                path_text = shape_obj.setPath(w, h, r1);
                break;
            case 'shape_base_round_2':
                // 将圆垂直切割一分为二，angle1 = 起点对应圆心的角度，angle2 = 终点对应圆心的角度，angle1 - angle2 = 真实角度
                let angle1 = path_info.angle1;
                let angle2 = path_info.angle2;
                r1 = path_info.r1;
                r2 = path_info.r2;
                r3 = path_info.r3;
                r4 = path_info.r4;
                // lenghty = 是否是大弧度   rad = 弧度数值
                let lenghty, px1 = r1, py1 = r2, px2 = r3, py2 = r4;
                if (ele_creating) {
                    angle1 = 0;
                    angle2 = 90;
                    px1 = w / 2;
                    py1 = 0;
                    px2 = w;
                    py2 = h / 2;
                } else {
                    // 正圆情况
                    if (w === h) {
                        let rad1 = (Math.PI / 180) * angle1;
                        px1 = w / 2 + Math.sin(rad1) * (w / 2);
                        py1 = h / 2 - Math.cos(rad1) * (h / 2);
                        let rad2 = (Math.PI / 180) * angle2;
                        px2 = w / 2 + Math.sin(rad2) * (w / 2);
                        py2 = h / 2 - Math.cos(rad2) * (h / 2);
                    }
                    // 椭圆情况
                    else {
                        // x方向拉长
                        if (w !== old_w) {
                            px1 = w_scale_ratio * px1;
                            px2 = w_scale_ratio * px2;
                        }
                        // y方向拉长
                        if (h !== old_h) {
                            py1 = h_scale_ratio * py1;
                            py2 = h_scale_ratio * py2;
                        }
                    }
                }
                if (angle1 > angle2) {
                    lenghty = Number((angle1 - angle2) > 180);
                } else {
                    lenghty = Number((angle2 - angle1) < 180);
                }
                path_point = [{ x: px1, y: py1, }, { x: px2, y: py2, }];
                path_text = shape_obj.setPath(w, h, lenghty, px1, py1, px2, py2);
                break;
            case 'shape_base_border_1':
                r1 = path_info.r1;
                r2 = path_info.r2;
                if (ele_creating) {
                    r1 = w * 0.2;
                    r2 = h * 0.2;
                } else if (equal_ratio) {
                    r1 = w_scale_ratio * r1;
                    r2 = h_scale_ratio * r2;
                }
                path_point = [{ x: r1, y: 0, }, { x: w, y: h - r2 }];
                path_text = shape_obj.setPath(w, h, r1, r2);
                break;
            case 'shape_base_border_2':
                r1 = path_info.r1;
                if (ele_creating) {
                    r1 = min * 0.2;
                } else if (equal_ratio) {
                    r1 = w_scale_ratio * r1;
                }
                path_point = [{ x: r1, y: r1, }];
                path_text = shape_obj.setPath(w, h, r1);
                break;
            case 'shape_base_border_3':
                r1 = path_info.r1;
                if (ele_creating) {
                    r1 = min * 0.2;
                } else if (equal_ratio) {
                    r1 = w_scale_ratio * r1;
                }
                path_point = [{ x: r1, y: h / 2, }];
                path_text = shape_obj.setPath(w, h, r1);
                break;
            case 'shape_base_symbol_1':
                r1 = path_info.r1;
                r2 = path_info.r2;
                if (ele_creating) {
                    r1 = w * 0.4;
                    r2 = h * 0.4;
                } else if (equal_ratio) {
                    r1 = w_scale_ratio * r1;
                    r2 = h_scale_ratio * r2;
                }
                path_point = [{ x: r1, y: 0, }, { x: w, y: r2, }];
                path_text = shape_obj.setPath(w, h, r1, r2);
                break;
            case 'shape_base_symbol_3':
                r1 = path_info.r1;
                r2 = path_info.r2;
                if (ele_creating) {
                    r1 = h * 0.4;
                    r2 = min * 0.12;
                } else if (equal_ratio) {
                    r1 = h_scale_ratio * r1;
                    r2 = w_scale_ratio * r2;
                }
                path_point = [{ x: 0, y: r1, }, { x: w / 2 - r2, y: 0, }];
                path_text = shape_obj.setPath(w, h, r1, r2);
                break;
            case 'shape_base_symbol_4':
                r1 = path_info.r1;
                if (ele_creating) {
                    r1 = h * 0.3;
                } else if (equal_ratio) {
                    r1 = h_scale_ratio * r1;
                }
                path_point = [{ x: 0, y: r1, }];
                path_text = shape_obj.setPath(w, h, r1);
                break;
            case 'shape_base_polygon_4':
                r1 = path_info.r1;
                if (ele_creating) {
                    r1 = h * 0.4;
                } else if (equal_ratio) {
                    r1 = h_scale_ratio * r1;
                }
                path_point = [{ x: 0, y: r1, }];
                path_text = shape_obj.setPath(w, h, r1);
                break;
            // 箭头形状
            case 'shape_arrow_1':
                r1 = path_info.r1;
                r2 = path_info.r2;
                if (ele_creating) {
                    r1 = w * 0.5;
                    r2 = h * 0.3;
                } else if (equal_ratio) {
                    r1 = w_scale_ratio * r1;
                    r2 = h_scale_ratio * r2;
                } else {
                    r1 += (w - old_w);
                }
                path_point = [{ x: r1, y: 0, }, { x: 0, y: r2, }];
                path_text = shape_obj.setPath(w, h, r1, r2);
                break;
            case 'shape_arrow_2':
                r1 = path_info.r1;
                r2 = path_info.r2;
                if (ele_creating) {
                    r1 = w * 0.5;
                    r2 = h * 0.3;
                } else if (equal_ratio) {
                    r1 = w_scale_ratio * r1;
                    r2 = h_scale_ratio * r2;
                }
                path_point = [{ x: r1, y: 0, }, { x: w, y: r2, }];
                path_text = shape_obj.setPath(w, h, r1, r2);
                break;
            case 'shape_arrow_3':
                r1 = path_info.r1;
                r2 = path_info.r2;
                if (ele_creating) {
                    r1 = h * 0.5;
                    r2 = w * 0.3;
                } else if (equal_ratio) {
                    r1 = h_scale_ratio * r1;
                    r2 = w_scale_ratio * r2;
                }
                path_point = [{ x: 0, y: r1, }, { x: r2, y: h, }];
                path_text = shape_obj.setPath(w, h, r1, r2);
                break;
            case 'shape_arrow_4':
                r1 = path_info.r1;
                r2 = path_info.r2;
                if (ele_creating) {
                    r1 = w * 0.3;
                    r2 = h * 0.5;
                } else if (equal_ratio) {
                    r1 = w_scale_ratio * r1;
                    r2 = h_scale_ratio * r2;
                } else {
                    r2 += (h - old_h);
                }
                path_point = [{ x: r1, y: 0, }, { x: 0, y: r2, }];
                path_text = shape_obj.setPath(w, h, r1, r2);
                break;
            case 'shape_arrow_5':
                r1 = path_info.r1;
                r2 = path_info.r2;
                if (ele_creating) {
                    r1 = w * 0.3;
                    r2 = h * 0.3;
                } else if (equal_ratio) {
                    r1 = w_scale_ratio * r1;
                    r2 = h_scale_ratio * r2;
                }
                path_point = [{ x: r1, y: 0, }, { x: w - r1, y: r2, }];
                path_text = shape_obj.setPath(w, h, r1, r2);
                break;
            case 'shape_arrow_6':
                r1 = path_info.r1;
                r2 = path_info.r2;
                if (ele_creating) {
                    r1 = h * 0.3;
                    r2 = w * 0.3;
                } else if (equal_ratio) {
                    r1 = h_scale_ratio * r1;
                    r2 = w_scale_ratio * r2;
                }
                path_point = [{ x: 0, y: r1, }, { x: w - r2, y: r1, }];
                path_text = shape_obj.setPath(w, h, r1, r2);
                break;
            case 'shape_arrow_7':
                r1 = path_info.r1;
                r2 = path_info.r2;
                r3 = path_info.r3;
                if (ele_creating) {
                    r1 = min * 0.44;
                    r2 = min * 0.22;
                    r3 = min * 0.2;
                } else if (equal_ratio) {
                    r1 = w_scale_ratio * r1;
                    r2 = w_scale_ratio * r2;
                    r3 = w_scale_ratio * r3;
                }
                path_point = [{ x: (w - r1) / 2, y: 0, }, { x: (w - r1) / 2 + r1, y: r2, }, { x: (w - r3) / 2, y: r2, }];
                path_text = shape_obj.setPath(w, h, r1, r2, r3);
                break;
            case 'shape_arrow_10':
                r1 = path_info.r1;
                if (ele_creating) {
                    r1 = w * 0.5;
                } else if (equal_ratio) {
                    r1 = w_scale_ratio * r1;
                }
                path_point = [{ x: w - r1, y: 0, }];
                path_text = shape_obj.setPath(w, h, r1);
                break;
            case 'shape_arrow_12':
                r1 = path_info.r1;
                r2 = path_info.r2;
                r3 = path_info.r3;
                if (ele_creating) {
                    r1 = w * 0.2;
                    r2 = w * 0.65;
                    r3 = h * 0.3;
                } else if (equal_ratio) {
                    r1 = w_scale_ratio * r1;
                    r2 = w_scale_ratio * r2;
                    r3 = h_scale_ratio * r3;
                } else {
                    r2 += (w - old_w);
                }
                path_point = [{ x: w / 2 - r1, y: h, }, { x: r2, y: 0, }, { x: r2, y: (h - r3 * 2) + r3, }];
                path_text = shape_obj.setPath(w, h, r1, r2, r3);
                break;
            case 'shape_arrow_14':
                r1 = path_info.r1;
                if (ele_creating) {
                    r1 = w * 0.75;
                } else if (equal_ratio) {
                    r1 = w_scale_ratio * r1;
                }
                path_point = [{ x: r1, y: 0, }];
                path_text = shape_obj.setPath(w, h, r1);
                break;
            case 'shape_other_34':
                r1 = path_info.r1;
                if (ele_creating) {
                    r1 = min * 0.1;
                } else if (equal_ratio) {
                    r1 = w_scale_ratio * r1;
                }
                path_point = [{ x: 0, y: r1, }];
                path_text = shape_obj.setPath(w, h, r1);
                break;
            case 'shape_other_35':
                r1 = path_info.r1;
                if (ele_creating) {
                    r1 = min * 0.1;
                } else if (equal_ratio) {
                    r1 = w_scale_ratio * r1;
                }
                path_point = [{ x: 0, y: r1, }];
                path_text = shape_obj.setPath(w, h, r1);
                break;
            case 'shape_other_36':
                r1 = path_info.r1;
                if (ele_creating) {
                    r1 = min * 0.2;
                } else if (equal_ratio) {
                    r1 = w_scale_ratio * r1;
                }
                path_point = [{ x: 0, y: r1, }];
                path_text = shape_obj.setPath(w, h, r1);
                break;
            case 'shape_other_37':
                r1 = path_info.r1;
                if (ele_creating) {
                    r1 = min * 0.2;
                } else if (equal_ratio) {
                    r1 = w_scale_ratio * r1;
                }
                path_point = [{ x: w, y: r1, }];
                path_text = shape_obj.setPath(w, h, r1);
                break;
            case 'shape_other_38':
                r1 = path_info.r1;
                if (ele_creating) {
                    r1 = min * 0.2;
                } else if (equal_ratio) {
                    r1 = w_scale_ratio * r1;
                }
                path_point = [{ x: w / 2, y: r1, }];
                path_text = shape_obj.setPath(w, h, r1);
                break;
            case 'shape_other_39':
                r1 = path_info.r1;
                if (ele_creating) {
                    r1 = min * 0.2;
                } else if (equal_ratio) {
                    r1 = w_scale_ratio * r1;
                }
                path_point = [{ x: w / 2, y: r1, }];
                path_text = shape_obj.setPath(w, h, r1);
                break;
            default:
                // 未匹配到的形状  也按原来的处理方式处理
                if (typeof callback.error === 'function') callback.error();
                return;
        }
        // 初始生成或等比放大时，更新编辑点位置信息，之后只在手动编辑时更新
        if (ele_creating || equal_ratio) {
            updatePoint(path_point, ele, data_points);
        } else {
            updatePoint(path_point);
        }
        $path.setAttribute('d', path_text);
        if($clip_path) $clip_path.setAttribute('d', path_text);
        if (typeof callback.success === 'function') callback.success();
    } else {
        // 无法编辑的形状  按原来的处理方式处理
        if (typeof callback.error === 'function') callback.error();
    }
};

/**
 * export
 * @param {object} that vue 实例
 * @param {dom} el 选中的元素，只在单选时触发
 */
let edit_point = function (that, el) {
    operate_opt.buildPoint();
    let page_scale = base_opt.page_scale;
    let ele_type = el.attr('data-type');
    let key = el.attr('shape-editor');
    let shape_obj = shape_arr[key];
    // 校验
    if (ele_type !== 'shape' || el.length !== 1) return;
    if (typeof shape_obj === 'undefined' || typeof shape_obj.shape === 'undefined') return;
    // 形状操作
    let $path = el.find('.ele_scale path')[0];
    let $clip_path = el.find('clipPath path')[0];
    let d = $path.getAttribute('d');
    let path_info = shape_obj.getPath(d);
    let path_point = [];
    let data_points = [];
    switch (key) {
        // 矩形
        case 'shape_rect_1':
            // 创建操作点
            path_point = [{ x: path_info.r1, y: 0, }];
            operate_opt.buildPoint(path_point);
            // 操作点事件绑定
            bindMove({
                target: $(`#path_point_0`),
                move: function (e, p) {
                    let r1, r2, r3, r4;
                    if (path_info.r1 === 0 && path_info.r2 === 0 && path_info.r3 === 0 && path_info.r4 === 0) {
                        r1 = path_info.r1 + p.x;
                        r2 = path_info.r2 + p.x;
                        r3 = path_info.r3 + p.x;
                        r4 = path_info.r4 + p.x;
                    } else {
                        r1 = path_info.r1 === 0 ? 0 : path_info.r1 + p.x;
                        r2 = path_info.r2 === 0 ? 0 : path_info.r2 + p.x;
                        r3 = path_info.r3 === 0 ? 0 : path_info.r3 + p.x;
                        r4 = path_info.r4 === 0 ? 0 : path_info.r4 + p.x;
                    }
                    // 更新path，并重新获取path同步操作点位置
                    let path_text = shape_obj.setPath(path_info.w, path_info.h, r1, r2, r3, r4);
                    let update_path_info = set_path_attr(path_text);
                    e.css('left', `${(update_path_info.r1 * page_scale)}px`);
                    // 同步 path_point
                    data_points[0].x = update_path_info.r1;
                    // 更新 工具栏 格式面板 圆角值
                    that.element_message.rect_fillet = [r1, r2, r3, r4];
                    that.element_message.rect_fillet_max = Math.floor(update_path_info.r1);
                },
            });
            break;
        case 'shape_rect_round_1':
            // 创建操作点
            path_point = [{ x: path_info.r1, y: 0, }];
            operate_opt.buildPoint(path_point);
            // 操作点事件绑定
            bindMove({
                target: $(`#path_point_0`),
                move: function (e, p) {
                    let r1, r2, r3, r4;
                    if (path_info.r1 === 0 && path_info.r2 === 0 && path_info.r3 === 0 && path_info.r4 === 0) {
                        r1 = path_info.r1 + p.x;
                        r2 = path_info.r2 + p.x;
                        r3 = path_info.r3 + p.x;
                        r4 = path_info.r4 + p.x;
                    } else {
                        r1 = path_info.r1 === 0 ? 0 : path_info.r1 + p.x;
                        r2 = path_info.r2 === 0 ? 0 : path_info.r2 + p.x;
                        r3 = path_info.r3 === 0 ? 0 : path_info.r3 + p.x;
                        r4 = path_info.r4 === 0 ? 0 : path_info.r4 + p.x;
                    }
                    // 更新path，并重新获取path同步操作点位置
                    let path_text = shape_obj.setPath(path_info.w, path_info.h, r1, r2, r3, r4);
                    let update_path_info = set_path_attr(path_text);
                    e.css('left', `${(update_path_info.r1 * page_scale)}px`);
                    // 同步 path_point
                    data_points[0].x = update_path_info.r1;
                    // 更新 工具栏 格式面板 圆角值
                    that.element_message.rect_fillet = [r1, r2, r3, r4];
                    that.element_message.rect_fillet_max = Math.floor(update_path_info.r1);
                },
            });
            break;
        case 'shape_rect_round_2':
            path_point = [{ x: path_info.r1, y: 0, }, { x: path_info.w - path_info.r2, y: 0, }];
            operate_opt.buildPoint(path_point);
            bindMove({
                target: $(`#path_point_0`),
                move: function (e, p) {
                    let r1 = path_info.r1 + p.x;
                    let path_text = shape_obj.setPath(path_info.w, path_info.h, r1, path_info.r2);
                    let update_path_info = set_path_attr(path_text);
                    e.css('left', `${(update_path_info.r1 * page_scale)}px`);
                    data_points[0].x = update_path_info.r1;
                },
            });
            bindMove({
                target: $(`#path_point_1`),
                move: function (e, p) {
                    let r2 = path_info.r2 - p.x;
                    let path_text = shape_obj.setPath(path_info.w, path_info.h, path_info.r1, r2);
                    let update_path_info = set_path_attr(path_text);
                    e.css('left', `${((update_path_info.w - update_path_info.r2) * page_scale)}px`);
                    data_points[1].x = update_path_info.r2;
                },
            });
            break;
        case 'shape_rect_round_3':
            path_point = [{ x: path_info.r1, y: 0, }];
            operate_opt.buildPoint(path_point);
            bindMove({
                target: $(`#path_point_0`),
                move: function (e, p) {
                    let r1 = path_info.r1 + p.x;
                    let path_text = shape_obj.setPath(path_info.w, path_info.h, r1);
                    let update_path_info = set_path_attr(path_text);
                    e.css('left', `${(update_path_info.r1 * page_scale)}px`);
                    data_points[0].x = update_path_info.r1;
                },
            });
            break;
        case 'shape_rect_angle_1':
            path_point = [{ x: path_info.w - path_info.r1, y: 0, }];
            operate_opt.buildPoint(path_point);
            bindMove({
                target: $(`#path_point_0`),
                move: function (e, p) {
                    let r1 = path_info.r1 - p.x;
                    let path_text = shape_obj.setPath(path_info.w, path_info.h, r1);
                    let update_path_info = set_path_attr(path_text);
                    e.css('left', `${((update_path_info.w - update_path_info.r1) * page_scale)}px`);
                    data_points[0].x = update_path_info.w - update_path_info.r1;
                },
            });
            break;
        case 'shape_rect_angle_2':
            path_point = [{ x: path_info.r1, y: 0, }];
            operate_opt.buildPoint(path_point);
            bindMove({
                target: $(`#path_point_0`),
                move: function (e, p) {
                    let r1 = path_info.r1 + p.x;
                    let path_text = shape_obj.setPath(path_info.w, path_info.h, r1);
                    let update_path_info = set_path_attr(path_text);
                    e.css('left', `${(update_path_info.r1 * page_scale)}px`);
                    data_points[0].x = update_path_info.r1;
                },
            });
            break;
        case 'shape_rect_angle_3':
            path_point = [{ x: path_info.r1, y: 0, }, { x: path_info.w - path_info.r2, y: 0, }];
            operate_opt.buildPoint(path_point);
            bindMove({
                target: $(`#path_point_0`),
                move: function (e, p) {
                    let r1 = path_info.r1 + p.x;
                    let path_text = shape_obj.setPath(path_info.w, path_info.h, r1, path_info.r2);
                    let update_path_info = set_path_attr(path_text);
                    e.css('left', `${(update_path_info.r1 * page_scale)}px`);
                    data_points[0].x = update_path_info.r1;
                },
            });
            bindMove({
                target: $(`#path_point_1`),
                move: function (e, p) {
                    let r2 = path_info.r2 - p.x;
                    let path_text = shape_obj.setPath(path_info.w, path_info.h, path_info.r1, r2);
                    let update_path_info = set_path_attr(path_text);
                    e.css('left', `${((update_path_info.w - update_path_info.r2) * page_scale)}px`);
                    data_points[1].x = update_path_info.w - update_path_info.r2;
                },
            });
            break;
        // 基本形状
        case 'shape_base_triangle_1':
            path_point = [{ x: path_info.r1, y: 0, }];
            operate_opt.buildPoint(path_point);
            bindMove({
                target: $(`#path_point_0`),
                move: function (e, p) {
                    let r1 = path_info.r1 + p.x;
                    let path_text = shape_obj.setPath(path_info.w, path_info.h, r1);
                    let update_path_info = set_path_attr(path_text);
                    e.css('left', `${(update_path_info.r1 * page_scale)}px`);
                    data_points[0].x = update_path_info.r1;
                },
            });
            break;
        case 'shape_base_skewrect_1':
            path_point = [{ x: path_info.r1, y: 0, }];
            operate_opt.buildPoint(path_point);
            bindMove({
                target: $(`#path_point_0`),
                move: function (e, p) {
                    let r1 = path_info.r1 + p.x;
                    let path_text = shape_obj.setPath(path_info.w, path_info.h, r1);
                    let update_path_info = set_path_attr(path_text);
                    e.css('left', `${(update_path_info.r1 * page_scale)}px`);
                    data_points[0].x = update_path_info.r1;
                },
            });
            break;
        case 'shape_base_skewrect_2':
            path_point = [{ x: path_info.r1, y: 0, }];
            operate_opt.buildPoint(path_point);
            bindMove({
                target: $(`#path_point_0`),
                move: function (e, p) {
                    let r1 = path_info.r1 + p.x;
                    let path_text = shape_obj.setPath(path_info.w, path_info.h, r1);
                    let update_path_info = set_path_attr(path_text);
                    e.css('left', `${(update_path_info.r1 * page_scale)}px`);
                    data_points[0].x = update_path_info.r1;
                },
            });
            break;
        case 'shape_base_round_2':
            let el_position;
            path_point = [{ x: path_info.r1, y: path_info.r2, }, { x: path_info.r3, y: path_info.r4, }];
            operate_opt.buildPoint(path_point);
            bindMove({
                target: $(`#path_point_0`),
                down: function (e, p) {
                    el_position = base_opt.compute_ele_offset(el).window_scaled;
                },
                move: function (e, p) {
                    let cx = el_position.x + el_position.w / 2;
                    let cy = el_position.y + el_position.h / 2;
                    let movex = p.clientX;
                    let movey = p.clientY;
                    // 获取终点对应圆心的角度
                    let angle2 = Math.round(Math.atan2(path_info.r3 - path_info.w / 2, path_info.h / 2 - path_info.r4) * 180 / Math.PI);
                    angle2 %= 360;
                    if (angle2 <= 0) angle2 += 360;
                    // 获取鼠标位置相对元素中心点的角度
                    let angle1 = Math.round(Math.atan2(movex - cx, cy - movey) * 180 / Math.PI);
                    // 处理元素旋转后调整
                    angle1 += (360 - p.rotate);
                    // 大于 360 时 -360 ， 小于 0 时 +360
                    angle1 %= 360;
                    if (angle1 < 0) angle1 += 360;
                    // path a 命令 第 4个值 小弧度 = 0 大弧度 = 1
                    let lenghty;
                    if (angle1 > angle2) {
                        lenghty = Number((angle1 - angle2) > 180);
                    } else {
                        lenghty = Number((angle2 - angle1) < 180);
                    }
                    let rad = (Math.PI / 180) * angle1;
                    // 计算弧度终点位置
                    let px1 = path_info.w / 2 + Math.sin(rad) * (path_info.w / 2);
                    let py1 = path_info.h / 2 - Math.cos(rad) * (path_info.h / 2);
                    let path_text = shape_obj.setPath(path_info.w, path_info.h, lenghty, px1, py1, path_info.r3, path_info.r4);
                    let update_path_info = set_path_attr(path_text);
                    e.css('left', `${(update_path_info.r1 * page_scale)}px`);
                    e.css('top', `${(update_path_info.r2 * page_scale)}px`);
                    data_points[0].x = update_path_info.r1;
                    data_points[0].y = update_path_info.r2;
                },
            });
            bindMove({
                target: $(`#path_point_1`),
                down: function (e, p) {
                    el_position = base_opt.compute_ele_offset(el).window_scaled;
                },
                move: function (e, p) {
                    let cx = el_position.x + el_position.w / 2;
                    let cy = el_position.y + el_position.h / 2;
                    let movex = p.clientX;
                    let movey = p.clientY;
                    // 获取起点对应圆心的角度
                    let angle1 = Math.round(Math.atan2(path_info.r1 - path_info.w / 2, path_info.h / 2 - path_info.r2) * 180 / Math.PI);
                    angle1 %= 360;
                    if (angle1 <= 0) angle1 += 360;
                    // 获取鼠标位置相对元素中心点的角度
                    let angle2 = Math.round(Math.atan2(movex - cx, cy - movey) * 180 / Math.PI);
                    // 处理元素旋转后调整
                    angle2 += (360 - p.rotate);
                    // 大于 360 时 -360 ， 小于 0 时 +360
                    angle2 %= 360;
                    if (angle2 < 0) angle2 += 360;
                    // path a 命令 第 4个值 小弧度 = 0 大弧度 = 1
                    let lenghty;
                    if (angle1 > angle2) {
                        lenghty = Number((angle1 - angle2) > 180);
                    } else {
                        lenghty = Number((angle2 - angle1) < 180);
                    }
                    let rad = (Math.PI / 180) * angle2;
                    // 计算弧度终点位置
                    let px2 = path_info.w / 2 + Math.sin(rad) * (path_info.w / 2);
                    let py2 = path_info.h / 2 - Math.cos(rad) * (path_info.h / 2);
                    let path_text = shape_obj.setPath(path_info.w, path_info.h, lenghty, path_info.r1, path_info.r2, px2, py2);
                    let update_path_info = set_path_attr(path_text);
                    e.css('left', `${(update_path_info.r3 * page_scale)}px`);
                    e.css('top', `${(update_path_info.r4 * page_scale)}px`);
                    data_points[1].x = update_path_info.r3;
                    data_points[1].y = update_path_info.r4;
                },
            });
            break;
        case 'shape_base_border_1':
            path_point = [{ x: path_info.r1, y: 0, }, { x: path_info.w, y: path_info.h - path_info.r2 }];
            operate_opt.buildPoint(path_point);
            bindMove({
                target: $(`#path_point_0`),
                move: function (e, p) {
                    let r1 = path_info.r1 + p.x;
                    let path_text = shape_obj.setPath(path_info.w, path_info.h, r1, path_info.r2);
                    let update_path_info = set_path_attr(path_text);
                    e.css('left', `${(update_path_info.r1 * page_scale)}px`);
                    data_points[0].x = update_path_info.r1;
                },
            });
            bindMove({
                target: $(`#path_point_1`),
                move: function (e, p) {
                    let r2 = path_info.r2 - p.y;
                    let path_text = shape_obj.setPath(path_info.w, path_info.h, path_info.r1, r2);
                    let update_path_info = set_path_attr(path_text);
                    e.css('left', `${(update_path_info.w * page_scale)}px`);
                    e.css('top', `${((update_path_info.h - update_path_info.r2) * page_scale)}px`);
                    data_points[1].x = update_path_info.w;
                    data_points[1].y = update_path_info.h - update_path_info.r2;
                },
            });
            break;
        case 'shape_base_border_2':
            path_point = [{ x: path_info.r1, y: path_info.r1, }];
            operate_opt.buildPoint(path_point);
            bindMove({
                target: $(`#path_point_0`),
                move: function (e, p) {
                    let r1 = path_info.r1 + p.x;
                    let path_text = shape_obj.setPath(path_info.w, path_info.h, r1);
                    let update_path_info = set_path_attr(path_text);
                    e.css('top', `${(update_path_info.r1 * page_scale)}px`);
                    e.css('left', `${(update_path_info.r1 * page_scale)}px`);
                    data_points[0].x = update_path_info.r1;
                    data_points[0].y = update_path_info.r1;
                },
            });
            break;
        case 'shape_base_border_3':
            path_point = [{ x: path_info.r1, y: path_info.h / 2, }];
            operate_opt.buildPoint(path_point);
            bindMove({
                target: $(`#path_point_0`),
                move: function (e, p) {
                    let r1 = path_info.r1 + p.x;
                    let path_text = shape_obj.setPath(path_info.w, path_info.h, r1);
                    let update_path_info = set_path_attr(path_text);
                    e.css('top', `${(update_path_info.h * page_scale) / 2}px`);
                    e.css('left', `${(update_path_info.r1 * page_scale)}px`);
                    data_points[0].x = update_path_info.r1;
                    data_points[0].y = update_path_info.h / 2;
                },
            });
            break;
        case 'shape_base_symbol_1':
            path_point = [{ x: path_info.r1, y: 0, }, { x: path_info.w, y: path_info.r2, }];
            operate_opt.buildPoint(path_point);
            bindMove({
                target: $(`#path_point_0`),
                move: function (e, p) {
                    let r1 = path_info.r1 + p.x;
                    let path_text = shape_obj.setPath(path_info.w, path_info.h, r1, path_info.r2);
                    let update_path_info = set_path_attr(path_text);
                    e.css('left', `${(update_path_info.r1 * page_scale)}px`);
                    data_points[0].x = update_path_info.r1;
                },
            });
            bindMove({
                target: $(`#path_point_1`),
                move: function (e, p) {
                    let r2 = path_info.r2 + p.y;
                    let path_text = shape_obj.setPath(path_info.w, path_info.h, path_info.r1, r2);
                    let update_path_info = set_path_attr(path_text);
                    e.css('left', `${(update_path_info.w * page_scale)}px`);
                    e.css('top', `${((update_path_info.r2) * page_scale)}px`);
                    data_points[1].x = update_path_info.w;
                    data_points[1].y = update_path_info.r2;
                },
            });
            break;
        case 'shape_base_symbol_3':
            path_point = [{ x: 0, y: path_info.r1, }, { x: path_info.w / 2 - path_info.r2, y: 0, }];
            operate_opt.buildPoint(path_point);
            bindMove({
                target: $(`#path_point_0`),
                move: function (e, p) {
                    let r1 = path_info.r1 + p.y;
                    let path_text = shape_obj.setPath(path_info.w, path_info.h, r1, path_info.r2);
                    let update_path_info = set_path_attr(path_text);
                    e.css('top', `${update_path_info.r1 * page_scale}px`);
                    data_points[0].y = update_path_info.r1;
                },
            });
            bindMove({
                target: $(`#path_point_1`),
                move: function (e, p) {
                    let r2 = path_info.r2 - p.x;
                    let path_text = shape_obj.setPath(path_info.w, path_info.h, path_info.r1, r2);
                    let update_path_info = set_path_attr(path_text);
                    e.css('left', `${(update_path_info.w / 2 - update_path_info.r2) * page_scale}px`);
                    data_points[1].x = update_path_info.w / 2 - update_path_info.r2;
                },
            });
            break;
        case 'shape_base_symbol_4':
            path_point = [{ x: 0, y: path_info.r1, }];
            operate_opt.buildPoint(path_point);
            bindMove({
                target: $(`#path_point_0`),
                move: function (e, p) {
                    let r1 = path_info.r1 + p.y;
                    let path_text = shape_obj.setPath(path_info.w, path_info.h, r1);
                    let update_path_info = set_path_attr(path_text);
                    e.css('top', `${update_path_info.r1 * page_scale}px`);
                    data_points[0].y = update_path_info.r1;
                },
            });
            break;
        case 'shape_base_polygon_4':
            path_point = [{ x: 0, y: path_info.r1, }];
            operate_opt.buildPoint(path_point);
            bindMove({
                target: $(`#path_point_0`),
                move: function (e, p) {
                    let r1 = path_info.r1 + p.y;
                    let path_text = shape_obj.setPath(path_info.w, path_info.h, r1);
                    let update_path_info = set_path_attr(path_text);
                    e.css('top', `${update_path_info.r1 * page_scale}px`);
                    data_points[0].y = update_path_info.r1;
                },
            });
            break;
        // 箭头形状
        case 'shape_arrow_1':
            path_point = [{ x: path_info.r1, y: 0, }, { x: 0, y: path_info.r2, }];
            operate_opt.buildPoint(path_point);
            bindMove({
                target: $(`#path_point_0`),
                move: function (e, p) {
                    let r1 = path_info.r1 + p.x;
                    let path_text = shape_obj.setPath(path_info.w, path_info.h, r1, path_info.r2);
                    let update_path_info = set_path_attr(path_text);
                    e.css('left', `${update_path_info.r1 * page_scale}px`);
                    data_points[0].x = update_path_info.r1;
                },
            });
            bindMove({
                target: $(`#path_point_1`),
                move: function (e, p) {
                    let r2 = path_info.r2 + p.y;
                    let path_text = shape_obj.setPath(path_info.w, path_info.h, path_info.r1, r2);
                    let update_path_info = set_path_attr(path_text);
                    e.css('top', `${update_path_info.r2 * page_scale}px`);
                    data_points[1].y = update_path_info.r2;
                },
            });
            break;
        case 'shape_arrow_2':
            path_point = [{ x: path_info.r1, y: 0, }, { x: path_info.w, y: path_info.r2, }];
            operate_opt.buildPoint(path_point);
            bindMove({
                target: $(`#path_point_0`),
                move: function (e, p) {
                    let r1 = path_info.r1 + p.x;
                    let path_text = shape_obj.setPath(path_info.w, path_info.h, r1, path_info.r2);
                    let update_path_info = set_path_attr(path_text);
                    e.css('left', `${update_path_info.r1 * page_scale}px`);
                    data_points[0].x = update_path_info.r1;
                },
            });
            bindMove({
                target: $(`#path_point_1`),
                move: function (e, p) {
                    let r2 = path_info.r2 + p.y;
                    let path_text = shape_obj.setPath(path_info.w, path_info.h, path_info.r1, r2);
                    let update_path_info = set_path_attr(path_text);
                    e.css('top', `${update_path_info.r2 * page_scale}px`);
                    data_points[1].x = update_path_info.w;
                    data_points[1].y = update_path_info.r2;
                },
            });
            break;
        case 'shape_arrow_3':
            path_point = [{ x: 0, y: path_info.r1, }, { x: path_info.r2, y: path_info.h, }];
            operate_opt.buildPoint(path_point);
            bindMove({
                target: $(`#path_point_0`),
                move: function (e, p) {
                    let r1 = path_info.r1 + p.y;
                    let path_text = shape_obj.setPath(path_info.w, path_info.h, r1, path_info.r2);
                    let update_path_info = set_path_attr(path_text);
                    e.css('top', `${update_path_info.r1 * page_scale}px`);
                    data_points[0].y = update_path_info.r1;
                },
            });
            bindMove({
                target: $(`#path_point_1`),
                move: function (e, p) {
                    let r2 = path_info.r2 + p.x;
                    let path_text = shape_obj.setPath(path_info.w, path_info.h, path_info.r1, r2);
                    let update_path_info = set_path_attr(path_text);
                    e.css('left', `${update_path_info.r2 * page_scale}px`);
                    data_points[1].x = update_path_info.r2;
                    data_points[1].y = update_path_info.h;
                },
            });
            break;
        case 'shape_arrow_4':
            path_point = [{ x: path_info.r1, y: 0, }, { x: 0, y: path_info.r2, }];
            operate_opt.buildPoint(path_point);
            bindMove({
                target: $(`#path_point_0`),
                move: function (e, p) {
                    let r1 = path_info.r1 + p.x;
                    let path_text = shape_obj.setPath(path_info.w, path_info.h, r1, path_info.r2);
                    let update_path_info = set_path_attr(path_text);
                    e.css('left', `${update_path_info.r1 * page_scale}px`);
                    data_points[0].x = update_path_info.r1;
                },
            });
            bindMove({
                target: $(`#path_point_1`),
                move: function (e, p) {
                    let r2 = path_info.r2 + p.y;
                    let path_text = shape_obj.setPath(path_info.w, path_info.h, path_info.r1, r2);
                    let update_path_info = set_path_attr(path_text);
                    e.css('top', `${update_path_info.r2 * page_scale}px`);
                    data_points[1].y = update_path_info.r2;
                },
            });
            break;
        case 'shape_arrow_5':
            path_point = [{ x: path_info.r1, y: 0, }, { x: path_info.w - path_info.r1, y: path_info.r2, }];
            operate_opt.buildPoint(path_point);
            bindMove({
                target: $(`#path_point_0`),
                move: function (e, p) {
                    let r1 = path_info.r1 + p.x;
                    let path_text = shape_obj.setPath(path_info.w, path_info.h, r1, path_info.r2);
                    let update_path_info = set_path_attr(path_text);
                    e.css('left', `${update_path_info.r1 * page_scale}px`);
                    data_points[0].x = update_path_info.r1;
                    // 同步 r2 点位置
                    $(`#path_point_1`).css('left', `${(update_path_info.w - update_path_info.r1) * page_scale}px`);
                    data_points[1].x = update_path_info.w - update_path_info.r1;
                },
            });
            bindMove({
                target: $(`#path_point_1`),
                move: function (e, p) {
                    let r2 = path_info.r2 + p.y;
                    let path_text = shape_obj.setPath(path_info.w, path_info.h, path_info.r1, r2);
                    let update_path_info = set_path_attr(path_text);
                    e.css('top', `${update_path_info.r2 * page_scale}px`);
                    data_points[1].y = update_path_info.r2;
                },
            });
            break;
        case 'shape_arrow_6':
            path_point = [{ x: 0, y: path_info.r1, }, { x: path_info.w - path_info.r2, y: path_info.r1, }];
            operate_opt.buildPoint(path_point);
            bindMove({
                target: $(`#path_point_0`),
                move: function (e, p) {
                    let r1 = path_info.r1 + p.y;
                    let path_text = shape_obj.setPath(path_info.w, path_info.h, r1, path_info.r2);
                    let update_path_info = set_path_attr(path_text);
                    e.css('top', `${update_path_info.r1 * page_scale}px`);
                    data_points[0].y = update_path_info.r1;
                    // 同步 r3 点位置
                    $(`#path_point_1`).css('top', `${update_path_info.r1 * page_scale}px`);
                    data_points[1].y = update_path_info.r1;
                },
            });
            bindMove({
                target: $(`#path_point_1`),
                move: function (e, p) {
                    let r2 = path_info.r2 - p.x;
                    let path_text = shape_obj.setPath(path_info.w, path_info.h, path_info.r1, r2);
                    let update_path_info = set_path_attr(path_text);
                    e.css('left', `${(update_path_info.w - update_path_info.r2) * page_scale}px`);
                    data_points[1].x = update_path_info.w - update_path_info.r2;
                },
            });
            break;
        case 'shape_arrow_7':
            path_point = [{
                x: (path_info.w - path_info.r1) / 2,
                y: 0,
            }, {
                x: (path_info.w - path_info.r1) / 2 + path_info.r1,
                y: path_info.r2,
            }, {
                x: (path_info.w - path_info.r3) / 2,
                y: path_info.r2,
            }];
            operate_opt.buildPoint(path_point);
            bindMove({
                target: $(`#path_point_0`),
                move: function (e, p) {
                    let r1 = path_info.r1 - p.x * 2;
                    let path_text = shape_obj.setPath(path_info.w, path_info.h, r1, path_info.r2, path_info.r3);
                    let update_path_info = set_path_attr(path_text);
                    e.css('left', `${(update_path_info.w - update_path_info.r1) / 2 * page_scale}px`);
                    data_points[0].x = update_path_info.w - update_path_info.r1;
                    // 同步 r2 r3 点位置
                    $(`#path_point_1`).css('left', `${((update_path_info.w - update_path_info.r1) / 2 + update_path_info.r1) * page_scale}px`);
                    data_points[1].x = (update_path_info.w - update_path_info.r1) / 2 + update_path_info.r1;
                    $(`#path_point_2`).css('left', `${(update_path_info.w - update_path_info.r3) / 2 * page_scale}px`);
                    data_points[2].x = (update_path_info.w - update_path_info.r3) / 2;
                },
            });
            bindMove({
                target: $(`#path_point_1`),
                move: function (e, p) {
                    let r2 = path_info.r2 + p.y;
                    let path_text = shape_obj.setPath(path_info.w, path_info.h, path_info.r1, r2, path_info.r3);
                    let update_path_info = set_path_attr(path_text);
                    e.css('top', `${update_path_info.r2 * page_scale}px`);
                    data_points[1].y = update_path_info.r2;
                    // 同步 r3 点位置
                    $(`#path_point_2`).css('top', `${update_path_info.r2 * page_scale}px`);
                    data_points[2].y = update_path_info.r2;
                },
            });
            bindMove({
                target: $(`#path_point_2`),
                move: function (e, p) {
                    let r3 = path_info.r3 - p.x * 2;
                    let path_text = shape_obj.setPath(path_info.w, path_info.h, path_info.r1, path_info.r2, r3);
                    let update_path_info = set_path_attr(path_text);
                    e.css('left', `${(update_path_info.w - update_path_info.r3) / 2 * page_scale}px`);
                    data_points[2].x = (update_path_info.w - update_path_info.r3) / 2;
                },
            });
            break;
        case 'shape_arrow_10':
            path_point = [{ x: path_info.w - path_info.r1, y: 0, }];
            operate_opt.buildPoint(path_point);
            bindMove({
                target: $(`#path_point_0`),
                move: function (e, p) {
                    let r1 = path_info.r1 - p.x;
                    let path_text = shape_obj.setPath(path_info.w, path_info.h, r1);
                    let update_path_info = set_path_attr(path_text);
                    e.css('left', `${(update_path_info.w - update_path_info.r1) * page_scale}px`);
                    data_points[0].x = update_path_info.w - update_path_info.r1;
                },
            });
            break;
        case 'shape_arrow_12':
            path_point = [{
                x: path_info.w / 2 - path_info.r1,
                y: path_info.h,
            }, {
                x: path_info.r2,
                y: 0,
            }, {
                x: path_info.r2,
                y: (path_info.h - path_info.r3 * 2) + path_info.r3,
            }];
            operate_opt.buildPoint(path_point);
            bindMove({
                target: $(`#path_point_0`),
                move: function (e, p) {
                    let r1 = path_info.r1 - p.x;
                    let path_text = shape_obj.setPath(path_info.w, path_info.h, r1, path_info.r2, path_info.r3);
                    let update_path_info = set_path_attr(path_text);
                    e.css('left', `${(update_path_info.w / 2 - update_path_info.r1) * page_scale}px`);
                    data_points[0].x = update_path_info.w / 2 - update_path_info.r1;
                },
            });
            bindMove({
                target: $(`#path_point_1`),
                move: function (e, p) {
                    let r2 = path_info.r2 + p.x;
                    let path_text = shape_obj.setPath(path_info.w, path_info.h, path_info.r1, r2, path_info.r3);
                    let update_path_info = set_path_attr(path_text);
                    e.css('left', `${update_path_info.r2 * page_scale}px`);
                    data_points[1].x = update_path_info.r2;
                    // 同步 r3 位置
                    $(`#path_point_2`).css('left', `${update_path_info.r2 * page_scale}px`);
                    data_points[2].x = update_path_info.r2;
                },
            });
            bindMove({
                target: $(`#path_point_2`),
                move: function (e, p) {
                    let r3 = path_info.r3 - p.y;
                    let path_text = shape_obj.setPath(path_info.w, path_info.h, path_info.r1, path_info.r2, r3);
                    let update_path_info = set_path_attr(path_text);
                    e.css('top', `${((update_path_info.h - update_path_info.r3 * 2) + update_path_info.r3) * page_scale}px`);
                    data_points[2].y = (update_path_info.h - update_path_info.r3 * 2) + update_path_info.r3;
                },
            });
            break;
        case 'shape_arrow_14':
            path_point = [{ x: path_info.r1, y: 0, }];
            operate_opt.buildPoint(path_point);
            bindMove({
                target: $(`#path_point_0`),
                move: function (e, p) {
                    let r1 = path_info.r1 + p.x;
                    let path_text = shape_obj.setPath(path_info.w, path_info.h, r1);
                    let update_path_info = set_path_attr(path_text);
                    e.css('left', `${update_path_info.r1 * page_scale}px`);
                    data_points[0].x = update_path_info.r1;
                },
            });
            break;
        case 'shape_other_34':
            path_point = [{ x: 0, y: path_info.r1, }];
            operate_opt.buildPoint(path_point);
            bindMove({
                target: $(`#path_point_0`),
                move: function (e, p) {
                    let r1 = path_info.r1 + p.y;
                    let path_text = shape_obj.setPath(path_info.w, path_info.h, r1);
                    let update_path_info = set_path_attr(path_text);
                    e.css('top', `${update_path_info.r1 * page_scale}px`);
                    data_points[0].y = update_path_info.r1;
                },
            });
            break;
        case 'shape_other_35':
            path_point = [{ x: 0, y: path_info.r1, }];
            operate_opt.buildPoint(path_point);
            bindMove({
                target: $(`#path_point_0`),
                move: function (e, p) {
                    let r1 = path_info.r1 + p.y;
                    let path_text = shape_obj.setPath(path_info.w, path_info.h, r1);
                    let update_path_info = set_path_attr(path_text);
                    e.css('top', `${update_path_info.r1 * page_scale}px`);
                    data_points[0].y = update_path_info.r1;
                },
            });
            break;
        case 'shape_other_36':
            path_point = [{ x: 0, y: path_info.r1, }];
            operate_opt.buildPoint(path_point);
            bindMove({
                target: $(`#path_point_0`),
                move: function (e, p) {
                    let r1 = path_info.r1 + p.y;
                    let path_text = shape_obj.setPath(path_info.w, path_info.h, r1);
                    let update_path_info = set_path_attr(path_text);
                    e.css('top', `${update_path_info.r1 * page_scale}px`);
                    data_points[0].y = update_path_info.r1;
                },
            });
            break;
        case 'shape_other_37':
            path_point = [{ x: path_info.w, y: path_info.r1, }];
            operate_opt.buildPoint(path_point);
            bindMove({
                target: $(`#path_point_0`),
                move: function (e, p) {
                    let r1 = path_info.r1 + p.y;
                    let path_text = shape_obj.setPath(path_info.w, path_info.h, r1);
                    let update_path_info = set_path_attr(path_text);
                    e.css('top', `${update_path_info.r1 * page_scale}px`);
                    data_points[0].y = update_path_info.r1;
                },
            });
            break;
        case 'shape_other_38':
            path_point = [{ x: path_info.w / 2, y: path_info.r1, }];
            operate_opt.buildPoint(path_point);
            bindMove({
                target: $(`#path_point_0`),
                move: function (e, p) {
                    let r1 = path_info.r1 + p.y;
                    let path_text = shape_obj.setPath(path_info.w, path_info.h, r1);
                    let update_path_info = set_path_attr(path_text);
                    e.css('top', `${update_path_info.r1 * page_scale}px`);
                    data_points[0].y = update_path_info.r1;
                },
            });
            break;
        case 'shape_other_39':
            path_point = [{ x: path_info.w / 2, y: path_info.r1, }];
            operate_opt.buildPoint(path_point);
            bindMove({
                target: $(`#path_point_0`),
                move: function (e, p) {
                    let r1 = path_info.r1 + p.y;
                    let path_text = shape_obj.setPath(path_info.w, path_info.h, r1);
                    let update_path_info = set_path_attr(path_text);
                    e.css('top', `${update_path_info.r1 * page_scale}px`);
                    data_points[0].y = update_path_info.r1;
                },
            });
            break;
    }
    // 更新 path_info & d
    function update_pathinfo () {
        d = $path.getAttribute('d');
        path_info = shape_obj.getPath(d);
    }
    // 设置 path 属性 、 更新 d 并返回 path
    function set_path_attr (path_text) {
        $path.setAttribute('d', path_text);
        if ($clip_path) $clip_path.setAttribute('d', path_text);
        d = $path.getAttribute('d');
        let new_path = shape_obj.getPath(d);
        return new_path;
    }
    /**
     * 绑定移动事件
     */
    function bindMove (param) {
        let opt = {
            target: null,
            down: function () {},
            move: function () {},
            up: function () {},
        };
        opt = Object.assign(opt, param);
        opt.target.on('mousedown', start);
        function start (e) {
            let $this = $(this);
            let rotate = +base_opt.get_transform(el, 'rotate')[0];
            let x = e.clientX;
            let y = e.clientY;
            update_pathinfo();
            data_points = base_opt.fn.clone_object(path_point);
            opt.down($this, {
                x: x,
                y: y,
                clientX: x,
                clientY: y,
            });
            $(document).on('mousemove', move);
            $(document).on('mouseup', end);
            // 移动事件
            function move (ev) {
                let relative_x, relative_y; // 鼠标每次移动的距离
                switch (true) {
                    // 90° 方向 上下方向
                    case (rotate >= 45 && rotate < 135):
                        relative_x = ev.clientY - y;
                        relative_y = x - ev.clientX;
                        break;
                    // 180° 方向 左右方向相反
                    case (rotate >= 135 && rotate < 225):
                        relative_x = x - ev.clientX;
                        relative_y = y - ev.clientY;
                        break;
                    // 270° 方向 上下反方向
                    case (rotate >= 225 && rotate < 345):
                        relative_x = y - ev.clientY;
                        relative_y = ev.clientX - x;
                        break;
                    // 正常方向
                    default:
                        relative_x = ev.clientX - x;
                        relative_y = ev.clientY - y;
                        break;
                }
                opt.move($this, {
                    x: relative_x / page_scale,
                    y: relative_y / page_scale,
                    clientX: ev.clientX,
                    clientY: ev.clientY,
                    rotate: rotate,
                });
            }
            // 移动结束 解绑
            function end () {
                $(document).off('mousemove', move);
                $(document).off('mouseup', end);
                el.find('.shape_path').attr('data-points', JSON.stringify(data_points));
                opt.up($this);
            }
        }
    }
};

/**
 * 缩放时更新操作点位置
 */
function updatePoint (point_arr, ele, data_points_arr) {
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
    // 更新节点上的 编辑点数据
    if (ele && data_points_arr) {
        ele.find('.shape_path').attr('data-points', JSON.stringify(data_points_arr));
    }
}


// 常用列表
let common_use = [
    // 矩形
    {
        "id": "shape_rect_1",
        "type": "shape",
        "group": null,
        "lock": false,
        "opacity": 1,
        "translate": "0,0",
        "rotate": "0,50,50",
        "width": 100,
        "height": 100,
        "scale": "1,1",
        "border_c": null,
        "border_w": null,
        "border_s": null,
        "background": "",
        "d": "M0 0 L100 0 L100 100 L0 100 Z",
        "name": "矩形",
        "shape_editor": "shape_rect_1",
        "icon": "iconbianjiye-01"
    },
    // 圆
    {
        "id": "shape_base_round_1",
        "type": "shape",
        "group": null,
        "lock": false,
        "opacity": 1,
        "translate": "0,0",
        "rotate": "0,50,50",
        "scale": "1,1",
        "width": 100,
        "height": 100,
        "border_c": null,
        "border_w": null,
        "border_s": null,
        "background": "",
        "d": "M0 50 A50 50 0 1 1 100 50 A50 50 0 1 1 0 50 Z",
        "name": "圆形",
        "icon": "iconbianjiye-10"
    },
    // 圆角矩形
    {
        "id": "shape_rect_round_1",
        "type": "shape",
        "group": null,
        "lock": false,
        "opacity": 1,
        "translate": "0,0",
        "rotate": "0,50,50",
        "scale": "1,1",
        "width": 100,
        "height": 100,
        "border_c": null,
        "border_w": null,
        "border_s": null,
        "background": "",
        "d": "M0 20 A20 20 0 0 1 20 0 L80 0 A20 20 0 0 1 100 20 L100 80 A20 20 0 0 1 80 100 L20 100 A20 20 0 0 1 0 80 L0 20 Z",
        "shape_editor": "shape_rect_round_1",
        "name": "圆角矩形",
        "icon": "iconbianjiye-09"
    },
    // 线
    {
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
        name: "直线",
        icon: "iconbianjiye2-69"
    },
    // 箭头
    {
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
        name: "箭头",
        icon: "iconbianjiye2-70"
    },
    // 三角形
    {
        "id": "shape_base_triangle_1",
        "type": "shape",
        "group": null,
        "lock": false,
        "opacity": 1,
        "translate": "0,0",
        "rotate": "0,50,50",
        "scale": "1,1",
        "width": 100,
        "height": 100,
        "border_c": null,
        "border_w": null,
        "border_s": null,
        "background": "",
        "d": "M0 100 L100 100 L50 0 Z",
        "shape_editor": "shape_base_triangle_1",
        "name": "三角形",
        "icon": "iconbianjiye-11"
    },
    // 星形
    {
        "id": "shape_49",
        "type": "shape",
        "group": null,
        "lock": false,
        "opacity": 1,
        "translate": "0,0",
        "rotate": "0,50,50",
        "scale": "1,1",
        "width": 20,
        "height": 20,
        "border_c": null,
        "border_w": null,
        "border_s": null,
        "background": "",
        "d": "M10,0 L13.296,6.285 L20,7.639 L15.333,12.878 L16.18,20 L10,16.952 L3.819,20 L4.667,12.878 L0,7.639 L6.704,6.285 L10,0 Z",
        // "shape_editor": "shape_other_1",
        "name": "星形",
        "icon": "iconbianjiye-51"
    },
]


/**
 * export
 * 可编辑形状 d 属性写法规范
 * 1.命令一律为大写
 * 2.L 只写2个数值，禁止连写（例：L100 100 200 200）
 * 3.数据结构
    shape: {
        material: '',
        shape: {},
        setPath: function () {},
        getPath: function () {},
    },
 */
let shape_arr = {
    // 矩形
    shape_rect_1: {
        material: 'rectangle',
        shape: {
            "id": "shape_rect_1",
            "type": "shape",
            "group": null,
            "lock": false,
            "opacity": 1,
            "translate": "0,0",
            "rotate": "0,50,50",
            "width": 100,
            "height": 100,
            "scale": "1,1",
            "border_c": null,
            "border_w": null,
            "border_s": null,
            "background": "",
            "d": "M0 0 L100 0 L100 100 L0 100 Z",
            "shape_editor": "shape_rect_1",
            "icon": "iconbianjiye-01"
        },
        // 顺时针排列，r1 = 左上角开始
        setPath: function (w, h, r1, r2, r3, r4) {
            w = Number(w.toFixed(3));
            h = Number(h.toFixed(3));
            let min = w < h ? w : h;
            if (r1 <= 0) r1 = 0;
            if (r1 >= (min / 2)) r1 = min / 2;
            if (r2 <= 0) r2 = 0;
            if (r2 >= (min / 2)) r2 = min / 2;
            if (r3 <= 0) r3 = 0;
            if (r3 >= (min / 2)) r3 = min / 2;
            if (r4 <= 0) r4 = 0;
            if (r4 >= (min / 2)) r4 = min / 2;
            r1 = Number(r1.toFixed(3));
            r2 = Number(r2.toFixed(3));
            r3 = Number(r3.toFixed(3));
            r4 = Number(r4.toFixed(3));
            return `M0 ${r1} A${r1} ${r1} 0 0 1 ${r1} 0 L${(w - r2).toFixed(3)} 0 A${r2} ${r2} 0 0 1 ${w} ${r2} L${w} ${(h - r3).toFixed(3)} A${r3} ${r3} 0 0 1 ${(w - r3).toFixed(3)} ${h} L${r4} ${h} A${r4} ${r4} 0 0 1 0 ${(h - r4).toFixed(3)} L0 ${r1} Z`;
        },
        getPath: function (d) {
            let obj = {
                w: 0,
                h: 0,
                r1: 0,
                r2: 0,
                r3: 0,
                r4: 0,
            };
            // 分解 A 命令
            let Acommand = commandDecompose(d, 'A');
            if (Acommand) {
                let r1 = commandValueDecompose(Acommand[0]);
                obj.r1 = Number(r1[0]);
                let r2 = commandValueDecompose(Acommand[1]);
                obj.r2 = Number(r2[0]);
                let r3 = commandValueDecompose(Acommand[2]);
                obj.r3 = Number(r3[0]);
                let r4 = commandValueDecompose(Acommand[3]);
                obj.r4 = Number(r4[0]);
            }
            // 分解 L 命令
            let Lcommand = commandDecompose(d, 'L');
            if (Lcommand) {
                let w_arr = [], h_arr = [];
                Lcommand.forEach(item => {
                    let Litem = commandValueDecompose(item);
                    w_arr.push(Litem[0]);
                    h_arr.push(Litem[1]);
                });
                obj.w = Math.max.apply(null, w_arr);
                obj.h = Math.max.apply(null, h_arr);
            }
            return obj;
        },
    },
    shape_rect_round_1: {
        material: 'rectangle',
        shape: {
            "id": "shape_rect_round_1",
            "type": "shape",
            "group": null,
            "lock": false,
            "opacity": 1,
            "translate": "0,0",
            "rotate": "0,50,50",
            "scale": "1,1",
            "width": 100,
            "height": 100,
            "border_c": null,
            "border_w": null,
            "border_s": null,
            "background": "",
            "d": "M0 20 A20 20 0 0 1 20 0 L80 0 A20 20 0 0 1 100 20 L100 80 A20 20 0 0 1 80 100 L20 100 A20 20 0 0 1 0 80 L0 20 Z",
            "shape_editor": "shape_rect_round_1",
            "icon": "iconbianjiye-09"
        },
        // 顺时针排列，r1 = 左上角开始
        setPath: function (w, h, r1, r2, r3, r4) {
            w = Number(w.toFixed(3));
            h = Number(h.toFixed(3));
            let min = w < h ? w : h;
            if (r1 <= 0) r1 = 0;
            if (r1 >= (min / 2)) r1 = min / 2;
            if (r2 <= 0) r2 = 0;
            if (r2 >= (min / 2)) r2 = min / 2;
            if (r3 <= 0) r3 = 0;
            if (r3 >= (min / 2)) r3 = min / 2;
            if (r4 <= 0) r4 = 0;
            if (r4 >= (min / 2)) r4 = min / 2;
            r1 = Number(r1.toFixed(3));
            r2 = Number(r2.toFixed(3));
            r3 = Number(r3.toFixed(3));
            r4 = Number(r4.toFixed(3));
            return `M0 ${r1} A${r1} ${r1} 0 0 1 ${r1} 0 L${(w - r2).toFixed(3)} 0 A${r2} ${r2} 0 0 1 ${w} ${r2} L${w} ${(h - r3).toFixed(3)} A${r3} ${r3} 0 0 1 ${(w - r3).toFixed(3)} ${h} L${r4} ${h} A${r4} ${r4} 0 0 1 0 ${(h - r4).toFixed(3)} L0 ${r1} Z`;
        },
        getPath: function (d) {
            let obj = {
                w: 0,
                h: 0,
                r1: 0,
                r2: 0,
                r3: 0,
                r4: 0,
            };
            // 分解 A 命令
            let Acommand = commandDecompose(d, 'A');
            if (Acommand) {
                let r1 = commandValueDecompose(Acommand[0]);
                obj.r1 = Number(r1[0]);
                let r2 = commandValueDecompose(Acommand[1]);
                obj.r2 = Number(r2[0]);
                let r3 = commandValueDecompose(Acommand[2]);
                obj.r3 = Number(r3[0]);
                let r4 = commandValueDecompose(Acommand[3]);
                obj.r4 = Number(r4[0]);
            }
            // 分解 L 命令
            let Lcommand = commandDecompose(d, 'L');
            if (Lcommand) {
                let w_arr = [], h_arr = [];
                Lcommand.forEach(item => {
                    let Litem = commandValueDecompose(item);
                    w_arr.push(Litem[0]);
                    h_arr.push(Litem[1]);
                });
                obj.w = Math.max.apply(null, w_arr);
                obj.h = Math.max.apply(null, h_arr);
            }
            return obj;
        },
    },
    shape_rect_round_2: {
        material: 'rectangle',
        shape: {
            "id": "shape_rect_round_2",
            "type": "shape",
            "group": null,
            "lock": false,
            "opacity": 1,
            "translate": "0,0",
            "rotate": "0,50,50",
            "scale": "1,1",
            "width": 100,
            "height": 100,
            "border_c": null,
            "border_w": null,
            "border_s": null,
            "background": "",
            "d": "M0 10 A10 10 0 0 1 10 0 L80 0 A20 20 0 0 1 100 20 L100 90 A10 10 0 0 1 90 100 L20 100 A20 20 0 0 1 0 80 L0 10 Z",
            "shape_editor": "shape_rect_round_2",
            "icon": "iconbianjiye2-80"
        },
        setPath: function (w, h, r1, r2) {
            w = Number(w.toFixed(3));
            h = Number(h.toFixed(3));
            let min = w < h ? w : h;
            if (r1 <= 0) r1 = 0;
            if (r2 <= 0) r2 = 0;
            if (r1 >= (min / 2)) r1 = min / 2;
            if (r2 >= (min / 2)) r2 = min / 2;
            r1 = Number(r1.toFixed(3));
            r2 = Number(r2.toFixed(3));
            return `M0 ${r1} A${r1} ${r1} 0 0 1 ${r1} 0 L${Number((w - r2).toFixed(3))} 0 A${r2} ${r2} 0 0 1 ${w} ${r2} L${w} ${Number((h - r1).toFixed(3))} A${r1} ${r1} 0 0 1 ${Number((w - r1).toFixed(3))} ${h} L${r2} ${h} A${r2} ${r2} 0 0 1 0 ${Number((h - r2).toFixed(3))} L0 ${r1} Z`;
        },
        getPath: function (d) {
            let obj = {
                w: 0,
                h: 0,
                r1: 0,
                r2: 0,
            };
            // 分解 A 命令
            let Acommand = commandDecompose(d, 'A');
            if (Acommand) {
                let r1 = commandValueDecompose(Acommand[0]);
                let r2 = commandValueDecompose(Acommand[1]);
                obj.r1 = Number(r1[0]);
                obj.r2 = Number(r2[1]);
            }
            // 分解 L 命令
            let Lcommand = commandDecompose(d, 'L');
            if (Lcommand) {
                let w_arr = [], h_arr = [];
                Lcommand.forEach(item => {
                    let Litem = commandValueDecompose(item);
                    w_arr.push(Litem[0]);
                    h_arr.push(Litem[1]);
                });
                obj.w = Math.max.apply(null, w_arr);
                obj.h = Math.max.apply(null, h_arr);
            }
            return obj;
        },
    },
    shape_rect_round_3: {
        material: 'rectangle',
        shape: {
            "id": "shape_rect_round_3",
            "type": "shape",
            "group": null,
            "lock": false,
            "opacity": 1,
            "translate": "0,0",
            "rotate": "0,50,50",
            "scale": "1,1",
            "width": 100,
            "height": 100,
            "border_c": null,
            "border_w": null,
            "border_s": null,
            "background": "",
            "d": "M0 20 A20 20 0 0 1 20 0 L80 0 A20 20 0 0 1 100 20 L100 100 L0 100 L0 20 Z",
            "shape_editor": "shape_rect_round_3",
            "icon": "iconbianjiye2-81"
        },
        setPath: function (w, h, r1) {
            w = Number(w.toFixed(3));
            h = Number(h.toFixed(3));
            let min = w < h ? w : h;
            if (r1 <= 0) r1 = 0;
            if (r1 >= (min / 2)) r1 = min / 2;
            r1 = Number(r1.toFixed(3));
            return `M0 ${r1} A${r1} ${r1} 0 0 1 ${r1} 0 L${Number((w - r1).toFixed(3))} 0 A${r1} ${r1} 0 0 1 ${w} ${r1} L${w} ${h} L0 ${h} L0 ${r1} Z`;
        },
        getPath: function (d) {
            let obj = {
                w: 0,
                h: 0,
                r1: 0,
            };
            // 分解 A 命令
            let Acommand = commandDecompose(d, 'A');
            if (Acommand) {
                let r1 = commandValueDecompose(Acommand[0]);
                obj.r1 = Number(r1[0]);
            }
            // 分解 L 命令
            let Lcommand = commandDecompose(d, 'L');
            if (Lcommand) {
                let w_arr = [], h_arr = [];
                Lcommand.forEach(item => {
                    let Litem = commandValueDecompose(item);
                    w_arr.push(Litem[0]);
                    h_arr.push(Litem[1]);
                });
                obj.w = Math.max.apply(null, w_arr);
                obj.h = Math.max.apply(null, h_arr);
            }
            return obj;
        },
    },
    shape_rect_angle_1: {
        material: 'rectangle',
        shape: {
            "id": "shape_rect_angle_1",
            "type": "shape",
            "group": null,
            "lock": false,
            "opacity": 1,
            "translate": "0,0",
            "rotate": "0,50,50",
            "scale": "1,1",
            "width": 100,
            "height": 100,
            "border_c": null,
            "border_w": null,
            "border_s": null,
            "background": "",
            "d": "M0 0 L60 0 L100 40 L100 100 L0 100 L0 0 Z",
            "shape_editor": "shape_rect_angle_1",
            "icon": "iconbianjiye-04"
        },
        setPath: function (w, h, r1) {
            w = Number(w.toFixed(3));
            h = Number(h.toFixed(3));
            let min = w < h ? w : h;
            if (r1 <= 0) r1 = 0;
            if (r1 >= (min / 2)) r1 = min / 2;
            r1 = Number(r1.toFixed(3));
            return `M0 0 L${(w - r1)} 0 L${w} ${r1} L${w} ${h} L0 ${h} L0 0 Z`;
        },
        getPath: function (d) {
            let obj = {
                w: 0,
                h: 0,
                r1: 0,
            };
            // 分解 L 命令
            let Lcommand = commandDecompose(d, 'L');
            if (Lcommand) {
                let r1 = commandValueDecompose(Lcommand[1]);
                let w_h = commandValueDecompose(Lcommand[2]);
                obj.w = Number(w_h[0]);
                obj.h = Number(w_h[1]);
                obj.r1 = Number(r1[1]);
            }
            return obj;
        },
    },
    shape_rect_angle_2: {
        material: 'rectangle',
        shape: {
            "id": "shape_rect_angle_2",
            "type": "shape",
            "group": null,
            "lock": false,
            "opacity": 1,
            "translate": "0,0",
            "rotate": "0,50,50",
            "scale": "1,1",
            "width": 100,
            "height": 100,
            "border_c": null,
            "border_w": null,
            "border_s": null,
            "background": "",
            "d": "M0 20 L20 0 L80 0 L100 20 L100 100 L0 100 L0 20 Z",
            "shape_editor": "shape_rect_angle_2",
            "icon": "iconbianjiye-05"
        },
        setPath: function (w, h, r1) {
            w = Number(w.toFixed(3));
            h = Number(h.toFixed(3));
            let min = w < h ? w : h;
            if (r1 <= 0) r1 = 0;
            if (r1 >= (min / 2)) r1 = min / 2;
            r1 = Number(r1.toFixed(3));
            return `M0 ${r1} L${r1} 0 L${(w - r1)} 0 L${w} ${r1} L${w} ${h} L0 ${h} L0 ${r1} Z`;
        },
        getPath: function (d) {
            let obj = {
                w: 0,
                h: 0,
                r1: 0,
            };
            // 分解 L 命令
            let Lcommand = commandDecompose(d, 'L');
            if (Lcommand) {
                let r1 = commandValueDecompose(Lcommand[0]);
                let w_h = commandValueDecompose(Lcommand[3]);
                obj.w = Number(w_h[0]);
                obj.h = Number(w_h[1]);
                obj.r1 = Number(r1[0]);
            }
            return obj;
        },
    },
    shape_rect_angle_3: {
        material: 'rectangle',
        shape: {
            "id": "shape_rect_angle_3",
            "type": "shape",
            "group": null,
            "lock": false,
            "opacity": 1,
            "translate": "0,0",
            "rotate": "0,50,50",
            "scale": "1,1",
            "width": 100,
            "height": 100,
            "border_c": null,
            "border_w": null,
            "border_s": null,
            "background": "",
            "d": "M0 10 L10 0 L60 0 L100 40 L100 90 L90 100 L40 100 L0 60 L0 10 Z",
            "shape_editor": "shape_rect_angle_3",
            "icon": "iconbianjiye-06"
        },
        setPath: function (w, h, r1, r2) {
            w = Number(w.toFixed(3));
            h = Number(h.toFixed(3));
            let min = w < h ? w : h;
            if (r1 <= 0) r1 = 0;
            if (r2 <= 0) r2 = 0;
            if (r1 >= (min / 2)) r1 = min / 2;
            if (r2 >= (min / 2)) r2 = min / 2;
            r1 = Number(r1.toFixed(3));
            r2 = Number(r2.toFixed(3));
            return `M0 ${r1} L${r1} 0 L${Number((w - r2).toFixed(3))} 0 L${w} ${r2} L${w} ${Number((h - r1).toFixed(3))} L${Number((w - r1).toFixed(3))} ${h} L${r2} ${h} L0 ${Number((h - r2).toFixed(3))} L0 ${r1} Z`;
        },
        getPath: function (d) {
            let obj = {
                w: 0,
                h: 0,
                r1: 0,
                r2: 0,
            };
            // 分解 L 命令
            let Lcommand = commandDecompose(d, 'L');
            if (Lcommand) {
                let r1 = commandValueDecompose(Lcommand[0]);
                let r2 = commandValueDecompose(Lcommand[2]);
                let w = commandValueDecompose(Lcommand[3]);
                let h = commandValueDecompose(Lcommand[4]);
                obj.r1 = Number(r1[0]);
                obj.r2 = Number(r2[1]);
                obj.w = Number(w[0]);
                obj.h = Number(h[1]);
            }
            return obj;
        },
    },

    // 基本形状
    shape_base_round_1: {
        material: 'basic',
        shape: {
            "id": "shape_base_round_1",
            "type": "shape",
            "group": null,
            "lock": false,
            "opacity": 1,
            "translate": "0,0",
            "rotate": "0,50,50",
            "scale": "1,1",
            "width": 100,
            "height": 100,
            "border_c": null,
            "border_w": null,
            "border_s": null,
            "background": "",
            "d": "M0 50 A50 50 0 1 1 100 50 A50 50 0 1 1 0 50 Z",
            "icon": "iconbianjiye-10"
        },
    },
    shape_base_triangle_1: {
        material: 'basic',
        shape: {
            "id": "shape_base_triangle_1",
            "type": "shape",
            "group": null,
            "lock": false,
            "opacity": 1,
            "translate": "0,0",
            "rotate": "0,50,50",
            "scale": "1,1",
            "width": 100,
            "height": 100,
            "border_c": null,
            "border_w": null,
            "border_s": null,
            "background": "",
            "d": "M0 100 L100 100 L50 0 Z",
            "shape_editor": "shape_base_triangle_1",
            "icon": "iconbianjiye-11"
        },
        setPath: function (w, h, r1) {
            w = Number(w.toFixed(3));
            h = Number(h.toFixed(3));
            if (r1 <= 0) r1 = 0;
            if (r1 >= w) r1 = w;
            r1 = Number(r1.toFixed(3));
            return `M0 ${h} L${w} ${h} L${r1} 0 Z`;
        },
        getPath: function (d) {
            let obj = {
                w: 0,
                h: 0,
                r1: 0,
            };
            // 分解 L 命令
            let Lcommand = commandDecompose(d, 'L');
            if (Lcommand) {
                let w_h = commandValueDecompose(Lcommand[0]);
                let r1 = commandValueDecompose(Lcommand[1]);
                obj.w = Number(w_h[0]);
                obj.h = Number(w_h[1]);
                obj.r1 = Number(r1[0]);
            }
            return obj;
        },
    },
    shape_base_triangle_2: {
        material: 'basic',
        shape: {
            "id": "shape_base_triangle_2",
            "type": "shape",
            "group": null,
            "lock": false,
            "opacity": 1,
            "translate": "0,0",
            "rotate": "0,50,50",
            "scale": "1,1",
            "width": 100,
            "height": 100,
            "border_c": null,
            "border_w": null,
            "border_s": null,
            "background": "",
            "d": "M0 100 L100 100 L0 0 Z",
            "icon": "iconbianjiye-12"
        },
    },
    shape_base_skewrect_1: {
        material: 'basic',
        shape: {
            "id": "shape_base_skewrect_1",
            "type": "shape",
            "group": null,
            "lock": false,
            "opacity": 1,
            "translate": "0,0",
            "rotate": "0,50,50",
            "scale": "1,1",
            "width": 100,
            "height": 100,
            "border_c": null,
            "border_w": null,
            "border_s": null,
            "background": "",
            "d": "M40 0 L100 0 L60 100 L0 100 Z",
            "shape_editor": "shape_base_skewrect_1",
            "icon": "iconbianjiye-13"
        },
        setPath: function (w, h, r1) {
            w = Number(w.toFixed(3));
            h = Number(h.toFixed(3));
            if (r1 <= 0) r1 = 0;
            if (r1 >= (w - 1)) r1 = w - 1;
            r1 = Number(r1.toFixed(3));
            return `M${r1} 0 L${w} 0 L${Number((w - r1).toFixed(3))} ${h} L0 ${h} Z`;
        },
        getPath: function (d) {
            let obj = {
                w: 0,
                h: 0,
                r1: 0,
            };
            // 分解 M 命令
            let Mcommand = commandDecompose(d, 'M');
            let r1 = commandValueDecompose(Mcommand[0]);
            obj.r1 = Number(r1[0]);
            // 分解 L 命令
            let Lcommand = commandDecompose(d, 'L');
            if (Lcommand) {
                let w = commandValueDecompose(Lcommand[0]);
                let h = commandValueDecompose(Lcommand[1]);
                obj.w = Number(w[0]);
                obj.h = Number(h[1]);
            }
            return obj;
        },
    },
    shape_base_skewrect_2: {
        material: 'basic',
        shape: {
            "id": "shape_base_skewrect_2",
            "type": "shape",
            "group": null,
            "lock": false,
            "opacity": 1,
            "translate": "0,0",
            "rotate": "0,50,50",
            "scale": "1,1",
            "width": 100,
            "height": 100,
            "border_c": null,
            "border_w": null,
            "border_s": null,
            "background": "",
            "d": "M0 100 L20 0 L80 0 L100 100 Z",
            "shape_editor": "shape_base_skewrect_2",
            "icon": "iconbianjiye-14"
        },
        setPath: function (w, h, r1) {
            w = Number(w.toFixed(3));
            h = Number(h.toFixed(3));
            if (r1 <= 0) r1 = 0;
            if (r1 >= (w / 2)) r1 = w / 2;
            r1 = Number(r1.toFixed(3));
            return `M0 ${h} L${r1} 0 L${Number((w - r1).toFixed(3))} 0 L${w} ${h} Z`;
        },
        getPath: function (d) {
            let obj = {
                w: 0,
                h: 0,
                r1: 0,
            };
            // 分解 L 命令
            let Lcommand = commandDecompose(d, 'L');
            if (Lcommand) {
                let r1 = commandValueDecompose(Lcommand[0]);
                let w_h = commandValueDecompose(Lcommand[2]);
                obj.r1 = Number(r1[0]);
                obj.w = Number(w_h[0]);
                obj.h = Number(w_h[1]);
            }
            return obj;
        },
    },
    shape_base_skewrect_3: {
        material: 'basic',
        shape: {
            "id": "shape_base_skewrect_3",
            "type": "shape",
            "group": null,
            "lock": false,
            "opacity": 1,
            "translate": "0,0",
            "rotate": "0,50,50",
            "scale": "1,1",
            "width": 100,
            "height": 100,
            "border_c": null,
            "border_w": null,
            "border_s": null,
            "background": "",
            "d": "M0 50 L50 0 L100 50 L50 100 Z",
            "icon": "iconbianjiye-15"
        },
    },
    shape_base_polygon_1: {
        material: 'basic',
        shape: {
            "id": "shape_base_polygon_1",
            "type": "shape",
            "group": null,
            "lock": false,
            "opacity": 1,
            "translate": "0,0",
            "rotate": "0,50,50",
            "scale": "1,1",
            "width": 30,
            "height": 28.5,
            "border_c": null,
            "border_w": null,
            "border_s": null,
            "background": "",
            "d": "M24.252 28.5 L5.711 28.481 L0 10.867 L15.011 0 L30 10.898 L24.252 28.5 Z",
            "icon": "iconbianjiye-16"
        },
    },
    shape_base_round_2: {
        material: 'basic',
        shape: {
            "id": "shape_base_round_2",
            "type": "shape",
            "group": null,
            "lock": false,
            "opacity": 1,
            "translate": "0,0",
            "rotate": "0,50,50",
            "scale": "1,1",
            "width": 100,
            "height": 100,
            "border_c": null,
            "border_w": null,
            "border_s": null,
            "background": "",
            "d": "M50 50 L50 0 A50 50 0 1 0 100 50 Z",
            // "shape_editor": "shape_base_round_2",
            "icon": "iconbianjiye2-82"
        },
        setPath: function (w, h, lenghty, px1, py1, px2, py2) {
            // 绘制方向为逆时针
            let rx = w / 2;
            let ry = h / 2;
            rx = Number(rx.toFixed(3));
            rx = Number(ry.toFixed(3));
            // 防止终点与起点重合，重合时svg不会绘制图形
            if (px1 === px2 && py1 === py2) {
                if (px1 === w || px1 === 0) {
                    py2 += 0.1;
                } else if (py1 === 0 || py1 === h) {
                    px2 += 0.1;
                }
            }
            lenghty = Number(lenghty.toFixed(3));
            px1 = Number(px1.toFixed(3));
            px2 = Number(px2.toFixed(3));
            py2 = Number(py2.toFixed(3));
            py2 = Number(py2.toFixed(3));
            return `M${rx} ${ry} L${px1} ${py1} A${rx} ${ry} 0 ${lenghty} 0 ${px2} ${py2} Z`;
        },
        getPath: function (d) {
            let obj = {
                w: 0,
                h: 0,
                angle1: 0,  // 起点对应圆心的角度
                angle2: 0,  // 终点对应圆心的角度
                r1: 0,      // 起点 x轴坐标
                r2: 0,      // 起点 y轴坐标
                r3: 0,      // 终点 x
                r4: 0,      // 终点 y
            };
            // 分解 M 命令
            let Mcommand = commandDecompose(d, 'M');
            if (Mcommand) {
                let w_h = commandValueDecompose(Mcommand[0]);
                obj.w = Number(w_h[0]) * 2;
                obj.h = Number(w_h[1]) * 2;
            }
            // 分解 L 命令 获取起点坐标
            let Lcommand = commandDecompose(d, 'L');
            if (Lcommand) {
                let p1 = commandValueDecompose(Lcommand[0]);
                obj.r1 = Number(p1[0]);
                obj.r2 = Number(p1[1]);
            }
            // 分解 A 命令 获取终点坐标
            let Acommand = commandDecompose(d, 'A');
            if (Acommand) {
                let p2 = commandValueDecompose(Acommand[0]);
                obj.r3 = Number(p2[5]);
                obj.r4 = Number(p2[6]);
            }
            let cx = obj.w / 2;
            let cy = obj.h / 2;
            let px1 = obj.r1;
            let py1 = obj.r2;
            let px2 = obj.r3;
            let py2 = obj.r4;
            let angle1 = Math.round(Math.atan2(px1 - cx, cy - py1) * 180 / Math.PI);
            angle1 %= 360;
            if (angle1 < 0) angle1 += 360;
            let angle2 = Math.round(Math.atan2(px2 - cx, cy - py2) * 180 / Math.PI);
            angle2 %= 360;
            if (angle2 < 0) angle2 += 360;
            obj.angle1 = angle1;
            obj.angle2 = angle2;
            return obj;
        },
    },
    shape_base_polygon_2: {
        material: 'basic',
        shape: {
            "id": "shape_base_polygon_2",
            "type": "shape",
            "group": null,
            "lock": false,
            "opacity": 1,
            "translate": "0,0",
            "rotate": "0,50,50",
            "scale": "1,1",
            "width": 27,
            "height": 30,
            "border_c": null,
            "border_w": null,
            "border_s": null,
            "background": "",
            "d":"M27,22.5 L13.5,30 L0,22.5 L0,7.5 L13.5,0 L27,7.5 L27,22.5 Z",
            "icon": "iconbianjiye-18"
        },
    },
    shape_base_polygon_3: {
        material: 'basic',
        shape: {
            "id": "shape_base_polygon_3",
            "type": "shape",
            "group": null,
            "lock": false,
            "opacity": 1,
            "translate": "0,0",
            "rotate": "0,50,50",
            "scale": "1,1",
            "width": 30,
            "height": 30,
            "border_c": null,
            "border_w": null,
            "border_s": null,
            "background": "",
            "d": "M30,21.19 L21.23,29.983 L8.81,30 L0.017,21.23 L0,8.81 L8.77,0.017 L21.19,0 L29.983,8.77 L30,21.19 Z",
            "icon": "iconbianjiye-19"
        },
    },
    shape_base_border_1: {
        material: 'basic',
        shape: {
            "id": "shape_base_border_1",
            "type": "shape",
            "group": null,
            "lock": false,
            "opacity": 1,
            "translate": "0,0",
            "rotate": "0,50,50",
            "scale": "1,1",
            "width": 100,
            "height": 100,
            "border_c": null,
            "border_w": null,
            "border_s": null,
            "background": "",
            "d": "M0 0 L20 0 L20 80 L100 80 L100 100 L0 100 Z",
            "shape_editor": "shape_base_border_1",
            "icon": "iconbianjiye-20"
        },
        setPath: function (w, h, r1, r2) {
            w = Number(w.toFixed(3));
			h = Number(h.toFixed(3));
            if (r1 <= 1) r1 = 1;
            if (r2 <= 1) r2 = 1;
            if (r1 >= w) r1 = w;
            if (r2 >= h) r2 = h;
            r1 = Number(r1.toFixed(3));
            r2 = Number(r2.toFixed(3));
            return `M0 0 L${r1} 0 L${r1} ${Number((h - r2).toFixed(3))} L${w} ${Number((h - r2).toFixed(3))} L${w} ${h} L0 ${h} Z`;
        },
        getPath: function (d) {
            let obj = {
                w: 0,
                h: 0,
                r1: 0,
                r2: 0,
            };
            // 分解 L 命令
            let Lcommand = commandDecompose(d, 'L');
            if (Lcommand) {
                let r1 = commandValueDecompose(Lcommand[0]);
                let w_h = commandValueDecompose(Lcommand[3]);
                let r2 = commandValueDecompose(Lcommand[1]);
                obj.w = Number(w_h[0]);
                obj.h = Number(w_h[1]);
                obj.r1 = Number(r1[0]);
                obj.r2 = obj.h - Number(r2[1]);
            }
            return obj;
        },
    },
    shape_base_border_2: {
        material: 'basic',
        shape: {
            "id": "shape_base_border_2",
            "type": "shape",
            "group": null,
            "lock": false,
            "opacity": 1,
            "translate": "0,0",
            "rotate": "0,50,50",
            "scale": "1,1",
            "width": 100,
            "height": 100,
            "border_c": null,
            "border_w": null,
            "border_s": null,
            "background": "",
            "d": "M0 0 L100 0 L100 100 L0 100 L0 0 Z M20 20 L20 80 L80 80 L80 20 Z",
            "shape_editor": "shape_base_border_2",
            "icon": "iconbianjiye-21"
        },
        setPath: function (w, h, r1) {
            w = Number(w.toFixed(3));
			h = Number(h.toFixed(3));
            let min = w < h ? w : h;
            if (r1 <= 1) r1 = 1;
            if (r1 >= (min / 2)) r1 = min / 2;
            r1 = Number(r1.toFixed(3));
            return `M0 0 L${w} 0 L${w} ${h} L0 ${h} L0 0 Z M${r1} ${r1} L${r1} ${Number((h - r1).toFixed(3))} L${Number((w - r1).toFixed(3))} ${Number((h - r1).toFixed(3))} L${Number((w - r1).toFixed(3))} ${r1} Z`;
        },
        getPath: function (d) {
            let obj = {
                w: 0,
                h: 0,
                r1: 0,
            };
            // 分解 M 命令
            let Mcommand = commandDecompose(d, 'M');
            if (Mcommand) {
                let r1 = commandValueDecompose(Mcommand[1]);
                obj.r1 = Number(r1[0]);
            }
            // 分解 L 命令
            let Lcommand = commandDecompose(d, 'L');
            if (Lcommand) {
                let w_h = commandValueDecompose(Lcommand[1]);
                obj.w = Number(w_h[0]);
                obj.h = Number(w_h[1]);
            }
            return obj;
        },
    },
    shape_base_border_3: {
        material: 'basic',
        shape: {
            "id": "shape_base_border_3",
            "type": "shape",
            "group": null,
            "lock": false,
            "opacity": 1,
            "translate": "0,0",
            "rotate": "0,50,50",
            "scale": "1,1",
            "width": 100,
            "height": 100,
            "border_c": null,
            "border_w": null,
            "border_s": null,
            "background": "",
            "d": "M0 50 A50 50 0 1 1 0 51 Z M80 50 A30 30 0 1 0 80 51 Z",
            "shape_editor": "shape_base_border_3",
            "icon": "iconbianjiye-22"
        },
        setPath: function (w, h, r1) {
            // +1 为了不与起点重合，绘制圆形起点如果与 A 命令的终点重合不会绘制
            w = Number(w.toFixed(3));
			h = Number(h.toFixed(3));
            let min = w < h ? w : h;
            if (r1 <= 1) r1 = 1;
            if (r1 > (min / 2)) r1 = min / 2;
            r1 = Number(r1.toFixed(3));
            return `M0 ${h / 2} A${w / 2} ${Number((h / 2).toFixed(3))} 0 1 1 0 ${Number((h / 2 + 1).toFixed(3))} Z M${Number((w - r1).toFixed(3))} ${Number((h / 2).toFixed(3))} A${Number(((w - r1 * 2) / 2).toFixed(3))} ${Number(((h - r1 * 2) / 2).toFixed(3))} 0 1 0 ${Number((w - r1).toFixed(3))} ${Number((h / 2 + 1).toFixed(3))} Z`;
        },
        getPath: function (d) {
            let obj = {
                w: 0,
                h: 0,
                r1: 0,
            };
            // 分解 A 命令
            let Acommand = commandDecompose(d, 'A');
            if (Acommand) {
                let w_h = commandValueDecompose(Acommand[0]);
                obj.w = Number(w_h[0]) * 2;
                obj.h = Number(w_h[1]) * 2;
            }
            // 分解 M 命令
            let Mcommand = commandDecompose(d, 'M');
            if (Mcommand) {
                let r1 = commandValueDecompose(Mcommand[1]);
                obj.r1 = obj.w - Number(r1[0]);
            }
            return obj;
        },
    },
    shape_base_sundry_1: {
        material: 'basic',
        shape: {
            "id": "shape_base_sundry_1",
            "type": "shape",
            "group": null,
            "lock": false,
            "opacity": 1,
            "translate": "0,0",
            "rotate": "0,50,50",
            "scale": "1,1",
            "width": 31.763,
            "height": 26.637,
            "border_c": null,
            "border_w": null,
            "border_s": null,
            "background": "",
            "d": "M23.011 5.583 C22.898 1.349 20.471 -2.111 17.234 0 C16.089 0.747 15.467 2.19 14.333 2.958 C13.289 3.666 11.987 3.757 10.769 3.752 C8.301 3.743 5.432 2.655 4.691 6.058 C4.187 8.375 7.101 9.853 6.39 12.084 C6.167 12.781 5.477 13.297 4.909 13.732 C3.501 14.812 2.452 15.74 1.409 17.276 C-0.545 20.148 -0.683 21.486 0 23.295 C0.74 25.256 3.509 27.097 5.807 26.177 C8.563 25.074 8.302 22.72 11.369 21.501 C13.957 20.472 14.745 22.678 15.716 24.484 C17.547 27.889 21.103 27.759 23.525 24.804 C24.314 23.841 25.66 21.737 25.393 20.359 C25.178 19.247 23.728 18.576 23.026 17.823 C20.555 15.173 24.706 14.221 26.882 13.248 C28.963 12.318 32.317 10.406 31.209 6.955 C30.829 5.772 28.178 4.712 27.11 5.125 C25.599 5.709 23.055 7.22 23.011 5.583Z",
            "icon": "iconbianjiye-23"
        },
    },
    shape_base_sundry_2: {
        material: 'basic',
        shape: {
            "id": "shape_base_sundry_2",
            "type": "shape",
            "group": null,
            "lock": false,
            "opacity": 1,
            "translate": "0,0",
            "rotate": "0,50,50",
            "scale": "1,1",
            "width": 30,
            "height": 30,
            "border_c": null,
            "border_w": null,
            "border_s": null,
            "background": "",
            "d": "M22.814,5.124 C22.814,7.732 21.692 9.574 20.479,11.373 C20.209,11.778 20.569 12.047 20.883,11.733 C21.692,10.923 22.814 9.889 25.329,9.889 C28.024,9.889 30 12.227 30,16.722 C30,21.578 27.036 25.174 23.713,25.174 C20.479,25.174 17.38 22.207 16.483,20.273 C16.167,19.6 15.899 19.15 15.583,19.15 C15.36,19.15 15.27 19.419 15.27,19.779 C15.27,23.826 16.976 27.615 18.944,28.687 C19.007,28.721 19.531 29.205 18.564,29.412 C17.77,29.585 12.522 30 10.809,28.918 C10.588,28.778 10.816 28.477 11.034,28.423 C13.765,27.753 14.327 21.667 14.327,19.33 C14.327,18.97 14.237 18.7 13.968,18.7 C13.653,18.7 13.474 19.016 13.294,19.375 C12.261,21.488 9.881 24.274 6.288,24.274 C2.695,24.274 0 20.138 0,16.183 C0,12.227 2.156 8.99 5.21,8.99 C7.006,8.99 8.893 10.159 10.059,10.879 C10.375,11.058 10.599 10.699 10.285,10.474 C8.353,9.08 7.725 7.462 7.725,5.035 C7.725,3.416 9.342 0 15.09,0 C20.839,0 22.814 2.247 22.814,5.124 Z",
            "icon": "iconbianjiye-24"
        },
    },
    shape_base_cone_1: {
        material: 'basic',
        shape: {
            "id": "shape_base_cone_1",
            "type": "shape",
            "group": null,
            "lock": false,
            "opacity": 1,
            "translate": "0,0",
            "rotate": "0,50,50",
            "scale": "1,1",
            "width": 24.094,
            "height": 28.266,
            "border_c": null,
            "border_w": null,
            "border_s": null,
            "background": "",
            "d":"M12.24 28.266 C12.24 28.266 -6.604 8.473 3 2 C8.54 -1.734 12.146 3.045 12.146 3.045 C12.146 3.045 15.752 -1.734 21.292 2 C30.896 8.473 12.24 28.266 12.24 28.266Z",
            // "shape_editor": "shape_base_cone_1",
            "icon": "iconbianjiye-25"
        },
        setPath: function () {},
        getPath: function () {},
    },
    shape_base_cone_2: {
        material: 'basic',
        shape: {
            "id": "shape_base_cone_2",
            "type": "shape",
            "group": null,
            "lock": false,
            "opacity": 1,
            "translate": "0,0",
            "rotate": "0,50,50",
            "scale": "1,1",
            "width": 22.5,
            "height": 30,
            "border_c": null,
            "border_w": null,
            "border_s": null,
            "background": "",
            "d":"M22.5,20.69 C22.5,25.832 17.463 30 11.25,30 C5.037,30 0 25.832 0,20.69 C0,15.548 11.25 0 11.25,0 C11.25,0 22.5 15.548 22.5,20.69 Z",
            // "shape_editor": "shape_base_cone_2",
            "icon": "iconbianjiye-26"
        },
        setPath: function () {},
        getPath: function () {},
    },
    shape_base_sundry_3: {
        material: 'basic',
        shape: {
            "id": "shape_base_sundry_3",
            "type": "shape",
            "group": null,
            "lock": false,
            "opacity": 1,
            "translate": "0,0",
            "rotate": "0,50,50",
            "scale": "1,1",
            "width": 29.772,
            "height": 29.772,
            "border_c": null,
            "border_w": null,
            "border_s": null,
            "background": "",
            "d": "M29.459,13.071 C30,14.187 29.772 16.858 28.083,17.293 C26.396,17.729 15.056 14.909 15.056,14.909 C15.056,14.909 22.622 5.761 24.235,5.091 C25.85,4.42 27.557 6.443 27.757,7.673 C27.956,8.904 27.383 9.68 27.754,10.658 C28.125,11.636 28.918 11.955 29.459,13.071 Z M8.773,2.837 C8.653,1.049 11.048 0 12.246,0.185 C13.443,0.37 13.982 1.172 14.999,1.11 C16.017,1.049 16.556 0.37 17.754,0.185 C18.951,0 21.346 1.049 21.226,2.837 C21.106,4.626 14.999 14.866 14.999,14.866 C14.999,14.866 8.893 4.626 8.773,2.837 Z M1.916,17.293 C0.228,16.858 0 14.187 0.54,13.071 C1.081,11.955 1.988 11.674 2.245,10.658 C2.503,9.642 2.043 8.904 2.242,7.673 C2.442,6.443 4.149 4.42 5.764,5.091 C7.378,5.761 14.943 14.908 14.943,14.908 C14.943,14.908 3.604 17.729 1.916,17.293 Z M14.965,14.978 C14.965,14.978 14.063 26.96 13.14,28.481 C12.216,30 9.68 29.398 8.817,28.523 C7.954,27.648 7.975 26.673 7.117,26.107 C6.259,25.54 5.435 25.762 4.361,25.187 C3.287,24.612 1.948 22.313 3.065,20.938 C4.183,19.564 14.965 14.978 14.965,14.978 Z M26.934,20.938 C28.052,22.313 26.712 24.612 25.638,25.187 C24.564,25.763 23.671 25.441 22.882,26.107 C22.093,26.773 22.045 27.648 21.182,28.523 C20.319,29.398 17.783 30 16.86,28.481 C15.937,26.96 15.035 14.978 15.035,14.978 C15.035,14.978 25.816 19.564 26.934,20.938 Z",
            "icon": "iconbianjiye-27"
        },
    },
    shape_base_sundry_4: {
        material: 'basic',
        shape: {
            "id": "shape_base_sundry_4",
            "type": "shape",
            "group": null,
            "lock": false,
            "opacity": 1,
            "translate": "0,0",
            "rotate": "0,50,50",
            "scale": "1,1",
            "width": 27.091,
            "height": 28.006,
            "border_c": null,
            "border_w": null,
            "border_s": null,
            "background": "",
            "d": "M9.64 0 C15.237 2.193 18.108 8.687 15.911 14.276 C13.715 19.864 7.397 22.617 1.8 20.424 C1.172 20.178 0.552 19.812 0 19.47 C1.458 22.618 4.086 25.232 7.575 26.599 C14.757 29.413 22.864 25.881 25.682 18.71 C28.5 11.54 24.963 3.445 17.782 0.631 C15.088 -0.424 12.266 -0.587 9.64 0Z",
            // "shape_editor": "shape_base_sundry_4",
            "icon": "iconbianjiye-28"
        },
        setPath: function () {},
        getPath: function () {},
    },
    shape_base_symbol_1: {
        material: 'basic',
        shape: {
            "id": "shape_base_symbol_1",
            "type": "shape",
            "group": null,
            "lock": false,
            "opacity": 1,
            "translate": "0,0",
            "rotate": "0,50,50",
            "scale": "1,1",
            "width": 100,
            "height": 100,
            "border_c": null,
            "border_w": null,
            "border_s": null,
            "background": "",
            "d":"M40 0 L60 0 L60 40 L100 40 L100 60 L60 60 L60 100 L40 100 L40 60 L0 60 L0 40 L40 40 L40 0 Z",
            "shape_editor": "shape_base_symbol_1",
            "icon": "iconbianjiye-29"
        },
        setPath: function (w, h, r1, r2) {
            w = Number(w.toFixed(3));
			h = Number(h.toFixed(3));
            if (r1 <= 0) r1 = 0;
            if (r2 <= 0) r2 = 0;
            if (r1 >= (w / 2 - 1)) r1 = w / 2 - 1;
            if (r2 >= (h / 2 - 1)) r2 = h / 2 - 1;
            r1 = Number(r1.toFixed(3));
            r2 = Number(r2.toFixed(3));
            return `M${r1} 0 L${Number((w - r1).toFixed(3))} 0 L${Number((w - r1).toFixed(3))} ${r2} L${w} ${r2} L${w} ${Number((h - r2).toFixed(3))} L${Number((w - r1).toFixed(3))} ${Number((h - r2).toFixed(3))} L${Number((w - r1).toFixed(3))} ${h} L${r1} ${h} L${r1} ${Number((h - r2).toFixed(3))} L0 ${Number((h - r2).toFixed(3))} L0 ${r2} L${r1} ${r2} L${r1} 0 Z`;
        },
        getPath: function (d) {
            let obj = {
                w: 0,
                h: 0,
                r1: 0,
                r2: 0,
            };
            // 分解 M 命令
            let Mcommand = commandDecompose(d, 'M');
            if (Mcommand) {
                let r1 = commandValueDecompose(Mcommand[0]);
                obj.r1 = Number(r1[0]);
            }
            // 分解 L 命令
            let Lcommand = commandDecompose(d, 'L');
            if (Lcommand) {
                let w_arr = [], h_arr = [];
                let r2 = commandValueDecompose(Lcommand[2]);
                Lcommand.forEach(item => {
                    let Litem = commandValueDecompose(item);
                    w_arr.push(Litem[0]);
                    h_arr.push(Litem[1]);
                });
                obj.w = Math.max.apply(null, w_arr);
                obj.h = Math.max.apply(null, h_arr);
                obj.r2 = Number(r2[1]);
            }
            return obj;
        },
    },
    shape_base_symbol_2: {
        material: 'basic',
        shape: {
            "id": "shape_base_symbol_2",
            "type": "shape",
            "group": null,
            "lock": false,
            "opacity": 1,
            "translate": "0,0",
            "rotate": "0,50,50",
            "scale": "1,1",
            "width": 100,
            "height": 20,
            "border_c": null,
            "border_w": null,
            "border_s": null,
            "background": "",
            "d":"M0 0 L100 0 L100 20 L0 20 L0 0 Z",
            "icon": "iconbianjiye-30"
        },
    },
    shape_base_symbol_3: {
        material: 'basic',
        shape: {
            "id": "shape_base_symbol_3",
            "type": "shape",
            "group": null,
            "lock": false,
            "opacity": 1,
            "translate": "0,0",
            "rotate": "0,50,50",
            "scale": "1,1",
            "width": 100,
            "height": 100,
            "border_c": null,
            "border_w": null,
            "border_s": null,
            "background": "",
            "d": "M0 40 L100 40 L100 60 L0 60 Z M50 0 A15 15 0 1 1 49 0 Z M50 70 A15 15 0 1 1 49 70 Z",
            "shape_editor": "shape_base_symbol_3",
            "icon": "iconbianjiye-31"
        },
        setPath: function (w, h, r1, r2) {
            w = Number(w.toFixed(3));
			h = Number(h.toFixed(3));
            let min = w < h ? w : h;
            if (r1 <= 0) r1 = 0;
            if (r2 <= 1) r2 = 1;
            if (r1 >= h / 2 - 1) r1 = h / 2 - 1;
            if (r2 >= (min / 2)) r2 = min / 2;
            r1 = Number(r1.toFixed(3));
            r2 = Number(r2.toFixed(3));
            return `M0 ${r1} L${w} ${r1} L${w} ${Number((h - r1).toFixed(3))} L0 ${Number((h - r1).toFixed(3))} Z M${Number((w / 2).toFixed(3))} 0 A${r2} ${r2} 0 1 1 ${Number((w / 2 - 1).toFixed(3))} 0 Z M${Number((w / 2).toFixed(3))} ${Number((h - r2 * 2).toFixed(3))} A${r2} ${r2} 0 1 1 ${Number((w / 2 - 1).toFixed(3))} ${Number((h - r2 * 2).toFixed(3))} Z`;
        },
        getPath: function (d) {
            let obj = {
                w: 0,
                h: 0,
                r1: 0,
                r2: 0,
            };
            // 分解 L 命令 获取 width，height，r1
            let Lcommand = commandDecompose(d, 'L');
            if (Lcommand) {
                let w = commandValueDecompose(Lcommand[0]);
                let h = commandValueDecompose(Lcommand[1]);
                obj.w = Number(w[0]);
                obj.r1 = Number(w[1]);
                obj.h = Number(h[1]) + obj.r1;
            }
            // 分解 A 命令 获取 r2
            let Acommand = commandDecompose(d, 'A');
            if (Acommand) {
                let r2 = commandValueDecompose(Acommand[0]);
                obj.r2 = Number(r2[0]);
            }
            return obj;
        },
    },
    shape_base_symbol_4: {
        material: 'basic',
        shape: {
            "id": "shape_base_symbol_4",
            "type": "shape",
            "group": null,
            "lock": false,
            "opacity": 1,
            "translate": "0,0",
            "rotate": "0,50,50",
            "scale": "1,1",
            "width": 100,
            "height": 100,
            "border_c": null,
            "border_w": null,
            "border_s": null,
            "background": "",
            "d":"M0 0 L100 0 L100 30 L0 30 L0 0 Z M0 60 L100 60 L100 100 L0 100 L0 60 Z",
            "shape_editor": "shape_base_symbol_4",
            "icon": "iconbianjiye-32"
        },
        setPath: function (w, h, r1) {
            w = Number(w.toFixed(3));
			h = Number(h.toFixed(3));
            if (r1 <= 1) r1 = 1;
            if (r1 >= (h / 2)) r1 = h / 2;
            r1 = Number(r1.toFixed(3));
            return `M0 0 L${w} 0 L${w} ${r1} L0 ${r1} L0 0 Z M0 ${Number((h - r1).toFixed(3))} L${w} ${Number((h - r1).toFixed(3))} L${w} ${h} L0 ${h} L0 ${Number((h - r1).toFixed(3))} Z`;
        },
        getPath: function (d) {
            let obj = {
                w: 0,
                h: 0,
                r1: 0,
            };
            // 分解 L 命令 获取 width，height，r1
            let Lcommand = commandDecompose(d, 'L');
            if (Lcommand) {
                let w_arr = [], h_arr = [];
                let r1 = commandValueDecompose(Lcommand[1]);
                Lcommand.forEach(item => {
                    let Litem = commandValueDecompose(item);
                    w_arr.push(Litem[0]);
                    h_arr.push(Litem[1]);
                });
                obj.w = Math.max.apply(null, w_arr);
                obj.h = Math.max.apply(null, h_arr);
                obj.r1 = Number(r1[1]);
            }
            return obj;
        },
    },
    shape_base_symbol_5: {
        material: 'basic',
        shape: {
            "id": "shape_base_symbol_5",
            "type": "shape",
            "group": null,
            "lock": false,
            "opacity": 1,
            "translate": "0,0",
            "rotate": "0,50,50",
            "scale": "1,1",
            "width": 30.576999999999998,
            "height": 30.578000000000003,
            "border_c": null,
            "border_w": null,
            "border_s": null,
            "background": "",
            "d": "M30.577,3.182 L28.221,5.539 L29.539,5.539 L29.539,13.039 L20.721,13.039 L16.221,17.539 L29.539,17.539 L29.539,25.039 L8.721,25.039 L3.182,30.578 L0,27.396 L2.539,24.857 L2.539,17.539 L9.857,17.539 L14.357,13.039 L2.539,13.039 L2.539,5.539 L21.857,5.539 L27.396,0 L30.577,3.182 Z",
            // "shape_editor": "shape_base_symbol_5",
            "icon": "iconbianjiye-33"
        },
        setPath: function () {},
        getPath: function () {},
    },
    shape_base_symbol_6: {
        material: 'basic',
        shape: {
            "id": "shape_base_symbol_6",
            "type": "shape",
            "group": null,
            "lock": false,
            "opacity": 1,
            "translate": "0,0",
            "rotate": "0,50,50",
            "scale": "1,1",
            "width": 27,
            "height": 27,
            "border_c": null,
            "border_w": null,
            "border_s": null,
            "background": "",
            "d": "M20.864,27 L13.5,19.636 L6.136,27 L0,20.863 L7.364,13.5 L0,6.136 L6.136,0 L13.5,7.364 L20.864,0 L27,6.136 L19.636,13.5 L27,20.863 L20.864,27 Z",
            // "shape_editor": "shape_base_symbol_6",
            "icon": "iconbianjiye-34"
        },
        setPath: function () {},
        getPath: function () {},
    },
    shape_base_polygon_4: {
        material: 'basic',
        shape: {
            "id": "shape_base_polygon_4",
            "type": "shape",
            "group": null,
            "lock": false,
            "opacity": 1,
            "translate": "0,0",
            "rotate": "0,50,50",
            "scale": "1,1",
            "width": 100,
            "height": 100,
            "border_c": null,
            "border_w": null,
            "border_s": null,
            "background": "",
            "d":"M50 0 L100 40 L100 100 L0 100 L0 40 L50 0 Z",
            "shape_editor": "shape_base_polygon_4",
            "icon": "iconbianjiye-35"
        },
        setPath: function (w, h, r1) {
            w = Number(w.toFixed(3));
			h = Number(h.toFixed(3));
            if (r1 <= 0) r1 = 0;
            if (r1 >= h) r1 = h;
            r1 = Number(r1.toFixed(3));
            return `M${Number((w / 2).toFixed(3))} 0 L${w} ${r1} L${w} ${h} L0 ${h} L0 ${r1} L${Number((w / 2).toFixed(3))} 0 Z`;
        },
        getPath: function (d) {
            let obj = {
                w: 0,
                h: 0,
                r1: 0,
            };
            let Lcommand = commandDecompose(d, 'L');
            if (Lcommand) {
                let w_h = commandValueDecompose(Lcommand[1]);
                obj.w = Number(w_h[0]);
                obj.h = Number(w_h[1]);
                let r1 = commandValueDecompose(Lcommand[0]);
                obj.r1 = Number(r1[1]);
            }
            return obj;
        },
    },
    shape_base_cone_3: {
        material: 'basic',
        shape: {
            "id": "shape_base_cone_3",
            "type": "shape",
            "group": null,
            "lock": false,
            "opacity": 1,
            "translate": "0,0",
            "rotate": "0,50,50",
            "scale": "1,1",
            "width": 30,
            "height": 30,
            "border_c": null,
            "border_w": null,
            "border_s": null,
            "background": "",
            "d": "M14.993,9.22 C11.12,0 0.112 2.151 0.04,12.853 C0,18.73 5.282 20.927 8.798,23.277 C12.208,25.556 14.635 28.673 15.016,30 C15.341,28.7 18.045 25.494 21.201,23.213 C24.653,20.719 30 18.666 29.96,12.789 C29.887,2.061 18.687 0.368 14.993,9.22 Z",
            "icon": "iconbianjiye-36"
        },
    },
    shape_base_ellipse_1: {
        material: 'basic',
        shape: {
            "id": "shape_base_ellipse_1",
            "type": "shape",
            "group": null,
            "lock": false,
            "opacity": 1,
            "translate": "0,0",
            "rotate": "0,50,50",
            "scale": "1,1",
            "width": 16,
            "height": 16,
            "border_c": null,
            "border_w": null,
            "border_s": null,
            "background": "",
            "d": "M8 0 C10.157 0 16 0 16 0 C16 0 16 5.738 16 8 C16 12.418 12.418 16 8 16 C3.582 16 0 12.418 0 8 C0 3.582 3.582 0 8 0Z",
            "icon": "iconbianjiye2-82"
        },
    },
    shape_base_polygon_5: {
        material: 'basic',
        shape: {
            "id": "shape_base_polygon_5",
            "type": "shape",
            "group": null,
            "lock": false,
            "opacity": 1,
            "translate": "0,0",
            "rotate": "0,50,50",
            "scale": "1,1",
            "width": 17.5,
            "height": 16.5,
            "border_c": null,
            "border_w": null,
            "border_s": null,
            "background": "",
            "d": "M0,0 L0,16.500 L6.500,11.500 L6.500,5.500 L12.5,5.500 L17.500,0.00 L0,0 Z",
            "icon": "iconbianjiye2-02"
        },
    },
    shape_base_border_4: {
        material: 'basic',
        shape: {
            "id": "shape_base_border_4",
            "type": "shape",
            "group": null,
            "lock": false,
            "opacity": 1,
            "translate": "0,0",
            "rotate": "0,50,50",
            "scale": "1,1",
            "width": 16.5,
            "height": 16.5,
            "border_c": null,
            "border_w": null,
            "border_s": null,
            "background": "",
            "d": "M16.500,16.500 L8.500,16.500 L6.500,16.500 L0,16.500 L0,0 L8.500,0 L8.500,5.500 L16.500,5.500 L16.500,16.500 Z",
            "icon": "iconbianjiye2-03"
        },
    },
    shape_base_skewrect_4: {
        material: 'basic',
        shape: {
            "id": "shape_base_skewrect_4",
            "type": "shape",
            "group": null,
            "lock": false,
            "opacity": 1,
            "translate": "0,0",
            "rotate": "0,50,50",
            "scale": "1,1",
            "width": 16.5,
            "height": 16.5,
            "border_c": null,
            "border_w": null,
            "border_s": null,
            "background": "",
            "d": "M0,7.500 L0,16.500 L16.500,0 L7.500,0 L0,7.500 Z",
            "icon": "iconbianjiye2-04"
        },
    },
    shape_base_polygon_6: {
        material: 'basic',
        shape: {
            "id": "shape_base_polygon_5",
            "type": "shape",
            "group": null,
            "lock": false,
            "opacity": 1,
            "translate": "0,0",
            "rotate": "0,50,50",
            "scale": "1,1",
            "width": 16.5,
            "height": 16.5,
            "border_c": null,
            "border_w": null,
            "border_s": null,
            "background": "",
            "d": "M16.500,13.500 L13.500,13.500 L13.500,16.500 L3.500,16.500 L3.500,13.500 L0,13.500 L0,3.500 L3.500,3.500 L3.500,0 L13.500,0 L13.500,3.500 L16.500,3.500 L16.500,13.500 Z",
            "icon": "iconbianjiye2-05"
        },
    },
    shape_base_polygon_7: {
        material: 'basic',
        shape: {
            "id": "shape_base_polygon_6",
            "type": "shape",
            "group": null,
            "lock": false,
            "opacity": 1,
            "translate": "0,0",
            "rotate": "0,50,50",
            "scale": "1,1",
            "width": 16.5,
            "height": 16.5,
            "border_c": null,
            "border_w": null,
            "border_s": null,
            "background": "",
            "d": "M16.500,12.500 C16.500,12.500 15.525,12.500 14.538,12.500 C11.944,12.500 12.500,16.500 12.500,16.500 L4.500,16.500 C4.500,16.500 5.083,12.500 2.510,12.500 C1.507,12.500 0,12.500 0,12.500 L0,4.500 C0.500,4.500 1.316,4.500 2.500,4.500 C5.084,4.500 4.500,0 4.500,0 L12.500,0 C12.500,0 11.815,4.500 14.306,4.500 C15.367,4.500 16.500,4.500 16.500,4.500 L16.500,12.500 Z",
            "icon": "iconbianjiye2-06"
        },
    },
    shape_base_round_3: {
        material: 'basic',
        shape: {
            "id": "shape_base_round_3",
            "type": "shape",
            "group": null,
            "lock": false,
            "opacity": 1,
            "translate": "0,0",
            "rotate": "0,50,50",
            "scale": "1,1",
            "width": 14,
            "height": 14,
            "border_c": null,
            "border_w": null,
            "border_s": null,
            "background": "",
            "d": "M2.489,1.647 C-0.467,4.138 -0.844,8.554 1.647,11.511 C4.139,14.467 8.555,14.844 11.511,12.353 C14.467,9.862 14.844,5.445 12.353,2.489 C9.861,-0.467 5.445,-0.844 2.489,1.647 ZM2.972,10.395 C1.282,8.390 1.346,5.493 3.003,3.568 L9.705,11.521 C7.526,12.828 4.661,12.399 2.972,10.395 ZM10.997,10.432 L4.295,2.479 C6.473,1.172 9.339,1.601 11.028,3.605 C12.718,5.610 12.654,8.507 10.997,10.432 Z",
            "icon": "iconbianjiye2-09"
        },
    },
    shape_base_polygon_8: {
        material: 'basic',
        shape: {
            "id": "shape_base_polygon_7",
            "type": "shape",
            "group": null,
            "lock": false,
            "opacity": 1,
            "translate": "0,0",
            "rotate": "0,50,50",
            "scale": "1,1",
            "width": 16,
            "height": 16,
            "border_c": null,
            "border_w": null,
            "border_s": null,
            "background": "",
            "d": "M6 0 L0 2 L4 6 L2 7 L8 10 L5 11 L16 16 L12 10 L14 9 L8 5 L11 4 L6 0Z",
            "icon": "iconbianjiye2-10"
        },
    },
    shape_base_polygon_9: {
        material: 'basic',
        shape: {
            "id": "shape_base_polygon_8",
            "type": "shape",
            "group": null,
            "lock": false,
            "opacity": 1,
            "translate": "0,0",
            "rotate": "0,50,50",
            "scale": "1,1",
            "width": 17.5,
            "height": 17.5,
            "border_c": null,
            "border_w": null,
            "border_s": null,
            "background": "",
            "d": "M12.329,3.550 L15.510,2.490 L14.450,5.671 L12.329,3.550 ZM9.000,13.500 C6.515,13.500 4.500,11.485 4.500,9.000 C4.500,6.515 6.515,4.500 9.000,4.500 C11.485,4.500 13.500,6.515 13.500,9.000 C13.500,11.485 11.485,13.500 9.000,13.500 ZM9.000,0.500 L10.500,3.500 L7.500,3.500 L9.000,0.500 ZM1.990,1.990 L5.171,3.050 L3.050,5.171 L1.990,1.990 ZM3.500,10.500 L0.500,9.000 L3.500,7.500 L3.500,10.500 ZM5.671,14.450 L2.490,15.510 L3.550,12.329 L5.671,14.450 ZM9.000,17.500 L7.500,14.500 L10.500,14.500 L9.000,17.500 ZM14.500,7.500 L17.500,9.000 L14.500,10.500 L14.500,7.500 ZM16.010,16.010 L12.829,14.950 L14.950,12.829 L16.010,16.010 Z",
            "icon": "iconbianjiye2-11"
        },
    },
    shape_base_polygon_10: {
        material: 'basic',
        shape: {
            "id": "shape_base_polygon_9",
            "type": "shape",
            "group": null,
            "lock": false,
            "opacity": 1,
            "translate": "0,0",
            "rotate": "0,50,50",
            "scale": "1,1",
            "width": 18,
            "height": 8,
            "border_c": null,
            "border_w": null,
            "border_s": null,
            "background": "",
            "d": "M4 0 L14 0 C16.209 0 18 1.791 18 4 C18 6.209 16.209 8 14 8 L4 8 C1.791 8 0 6.209 0 4 C0 1.791 1.791 0 4 0Z",
            "icon": "iconbianjiye2-12"
        },
    },
    shape_base_polygon_11: {
        material: 'basic',
        shape: {
            "id": "shape_base_polygon_10",
            "type": "shape",
            "group": null,
            "lock": false,
            "opacity": 1,
            "translate": "0,0",
            "rotate": "0,50,50",
            "scale": "1,1",
            "width": 18.523,
            "height": 12.014,
            "border_c": null,
            "border_w": null,
            "border_s": null,
            "background": "",
            "d": "M18.523 5.363 L13.253 12 L5.572 12.014 L0 5.65 L5.253 0 L13.253 0 L18.523 5.363Z",
            "icon": "iconbianjiye2-13"
        },
    },
    shape_base_polygon_12: {
        material: 'basic',
        shape: {
            "id": "shape_base_polygon_11",
            "type": "shape",
            "group": null,
            "lock": false,
            "opacity": 1,
            "translate": "0,0",
            "rotate": "0,50,50",
            "scale": "1,1",
            "width": 16,
            "height": 15,
            "border_c": null,
            "border_w": null,
            "border_s": null,
            "background": "",
            "d": "M0 15 L0 6 L16 0 L16 15 L0 15Z",
            "icon": "iconbianjiye2-14"
        },
    },
    shape_base_polygon_13: {
        material: 'basic',
        shape: {
            "id": "shape_base_polygon_12",
            "type": "shape",
            "group": null,
            "lock": false,
            "opacity": 1,
            "translate": "0,0",
            "rotate": "0,50,50",
            "scale": "1,1",
            "width": 16,
            "height": 16,
            "border_c": null,
            "border_w": null,
            "border_s": null,
            "background": "",
            "d": " M0 0 L16 0 L16 11 L8 16 L0 11 L0 0Z",
            "icon": "iconbianjiye2-15"
        },
    },
    shape_base_polygon_14: {
        material: 'basic',
        shape: {
            "id": "shape_base_polygon_13",
            "type": "shape",
            "group": null,
            "lock": false,
            "opacity": 1,
            "translate": "0,0",
            "rotate": "0,50,50",
            "scale": "1,1",
            "width": 16,
            "height": 16,
            "border_c": null,
            "border_w": null,
            "border_s": null,
            "background": "",
            "d": "M16 0 L16 16 L0 16 L0 5 L5 0 L16 0Z",
            "icon": "iconbianjiye2-16"
        },
    },
    shape_base_polygon_15: {
        material: 'basic',
        shape: {
            "id": "shape_base_polygon_14",
            "type": "shape",
            "group": null,
            "lock": false,
            "opacity": 1,
            "translate": "0,0",
            "rotate": "0,50,50",
            "scale": "1,1",
            "width": 16.5,
            "height": 16.5,
            "border_c": null,
            "border_w": null,
            "border_s": null,
            "background": "",
            "d": "M16.500,0 C16.500,0 12.500,4.956 12.500,8.434 C12.500,11.956 16.500,16.500 16.500,16.500 L3.500,16.500 C3.500,16.500 0,11.956 0.500,8.434 C0,4.956 3.500,0 3.500,0 L16.500,0 Z",
            "icon": "iconbianjiye2-17"
        },
    },
    shape_base_polygon_16: {
        material: 'basic',
        shape: {
            "id": "shape_base_polygon_15",
            "type": "shape",
            "group": null,
            "lock": false,
            "opacity": 1,
            "translate": "0,0",
            "rotate": "0,50,50",
            "scale": "1,1",
            "width": 16,
            "height": 16,
            "border_c": null,
            "border_w": null,
            "border_s": null,
            "background": "",
            "d": "M0 0 L10 0 C10 0 16 1.653 16 7.646 C16 15.316 10 16 10 16 L0 16 L0 0Z",
            "icon": "iconbianjiye2-18"
        },
    },
    shape_base_round_4: {
        material: 'basic',
        shape: {
            "id": "shape_base_round_4",
            "type": "shape",
            "group": null,
            "lock": false,
            "opacity": 1,
            "translate": "0,0",
            "rotate": "0,50,50",
            "scale": "1,1",
            "width": 16,
            "height": 16,
            "border_c": null,
            "border_w": null,
            "border_s": null,
            "background": "",
            "d": "M16 16 L8 16 C3.582 16 0 12.418 0 8 C0 3.582 3.582 0 8 0 C12.418 0 16 3.582 16 8 C16 9.893 15.339 11.63 14.24 13 L16 13 L16 16Z",
            "icon": "iconbianjiye2-19"
        },
    },
    shape_base_polygon_17: {
        material: 'basic',
        shape: {
            "id": "shape_base_polygon_16",
            "type": "shape",
            "group": null,
            "lock": false,
            "opacity": 1,
            "translate": "0,0",
            "rotate": "0,50,50",
            "scale": "1,1",
            "width": 16,
            "height": 14,
            "border_c": null,
            "border_w": null,
            "border_s": null,
            "background": "",
            "d": "M3 0 L0 7 L3 14 L10 14 C10 14 16 12.974 16 6.96 C16 1.187 10 0 10 0 L3 0Z",
            "icon": "iconbianjiye2-22"
        },
    },
    shape_base_round_5: {
        material: 'basic',
        shape: {
            "id": "shape_base_round_5",
            "type": "shape",
            "group": null,
            "lock": false,
            "opacity": 1,
            "translate": "0,0",
            "rotate": "0,50,50",
            "scale": "1,1",
            "width": 16,
            "height": 16,
            "border_c": null,
            "border_w": null,
            "border_s": null,
            "background": "",
            "d": "M8.000,16.001 C3.588,16.001 -0.002,12.412 -0.002,8.000 C-0.002,3.588 3.588,-0.001 8.000,-0.001 C12.412,-0.001 16.001,3.588 16.001,8.000 C16.001,12.412 12.412,16.001 8.000,16.001 ZM8.000,0.733 C3.992,0.733 0.732,3.993 0.732,8.000 C0.732,12.007 3.992,15.267 8.000,15.267 C12.007,15.267 15.268,12.007 15.268,8.000 C15.268,3.993 12.007,0.733 8.000,0.733 ZM8.977,12.387 L7.022,12.387 L7.022,8.978 L3.612,8.978 L3.612,7.022 L7.022,7.022 L7.022,3.613 L8.977,3.613 L8.977,7.022 L12.386,7.022 L12.386,8.978 L8.977,8.978 L8.977,12.387 Z",
            "icon": "iconbianjiye2-23"
        },
    },
    shape_base_round_6: {
        material: 'basic',
        shape: {
            "id": "shape_base_round_6",
            "type": "shape",
            "group": null,
            "lock": false,
            "opacity": 1,
            "translate": "0,0",
            "rotate": "0,50,50",
            "scale": "1,1",
            "width": 16,
            "height": 16,
            "border_c": null,
            "border_w": null,
            "border_s": null,
            "background": "",
            "d": "M7.999,16.001 C3.588,16.001 -0.001,12.412 -0.001,8.000 C-0.001,3.588 3.588,-0.001 7.999,-0.001 C12.411,-0.001 16.001,3.588 16.001,8.000 C16.001,12.412 12.411,16.001 7.999,16.001 ZM7.999,0.733 C3.993,0.733 0.733,3.993 0.733,8.000 C0.733,12.007 3.993,15.267 7.999,15.267 C12.007,15.267 15.267,12.007 15.267,8.000 C15.267,3.993 12.007,0.733 7.999,0.733 ZM3.613,7.022 L12.387,7.022 L12.387,8.978 L3.613,8.978 L3.613,7.022 Z",
            "icon": "iconbianjiye2-24"
        },
    },
    shape_base_round_7: {
        material: 'basic',
        shape: {
            "id": "shape_base_round_7",
            "type": "shape",
            "group": null,
            "lock": false,
            "opacity": 1,
            "translate": "0,0",
            "rotate": "0,50,50",
            "scale": "1,1",
            "width": 16,
            "height": 16,
            "border_c": null,
            "border_w": null,
            "border_s": null,
            "background": "",
            "d": "M7.999,16.000 C3.589,16.000 0.001,12.411 0.001,8.000 C0.001,3.589 3.589,0.000 7.999,0.000 C12.410,0.000 15.999,3.589 15.999,8.000 C15.999,12.411 12.410,16.000 7.999,16.000 ZM7.999,0.734 C3.993,0.734 0.735,3.994 0.735,8.000 C0.735,12.007 3.993,15.266 7.999,15.266 C12.006,15.266 15.265,12.007 15.265,8.000 C15.265,3.994 12.006,0.734 7.999,0.734 ZM1.620,8.000 L10.597,2.817 L7.465,8.081 L10.597,13.182 L1.620,8.000 Z",
            "icon": "iconbianjiye2-26"
        },
    },
    shape_base_round_8: {
        material: 'basic',
        shape: {
            "id": "shape_base_round_8",
            "type": "shape",
            "group": null,
            "lock": false,
            "opacity": 1,
            "translate": "0,0",
            "rotate": "0,50,50",
            "scale": "1,1",
            "width": 16,
            "height": 16,
            "border_c": null,
            "border_w": null,
            "border_s": null,
            "background": "",
            "d": "M8.001,16.000 C12.411,16.000 15.999,12.411 15.999,8.000 C15.999,3.589 12.411,0.000 8.001,0.000 C3.590,0.000 0.001,3.589 0.001,8.000 C0.001,12.411 3.590,16.000 8.001,16.000 ZM8.001,0.734 C12.007,0.734 15.265,3.994 15.265,8.000 C15.265,12.007 12.007,15.266 8.001,15.266 C3.994,15.266 0.735,12.007 0.735,8.000 C0.735,3.994 3.994,0.734 8.001,0.734 ZM14.380,8.000 L5.403,2.817 L8.535,8.081 L5.403,13.182 L14.380,8.000 Z",
            "icon": "iconbianjiye2-27"
        },
    },
    shape_base_round_9: {
        material: 'basic',
        shape: {
            "id": "shape_base_round_9",
            "type": "shape",
            "group": null,
            "lock": false,
            "opacity": 1,
            "translate": "0,0",
            "rotate": "0,50,50",
            "scale": "1,1",
            "width": 16,
            "height": 16,
            "border_c": null,
            "border_w": null,
            "border_s": null,
            "background": "",
            "d": "M0.000,8.001 C0.000,12.411 3.589,15.999 8.000,15.999 C12.411,15.999 16.000,12.411 16.000,8.001 C16.000,3.590 12.411,0.001 8.000,0.001 C3.589,0.001 0.000,3.590 0.000,8.001 ZM15.266,8.001 C15.266,12.007 12.006,15.265 8.000,15.265 C3.993,15.265 0.734,12.007 0.734,8.001 C0.734,3.994 3.993,0.735 8.000,0.735 C12.006,0.735 15.266,3.994 15.266,8.001 ZM8.000,14.380 L13.183,5.403 L7.919,8.535 L2.818,5.403 L8.000,14.380 Z",
            "icon": "iconbianjiye2-28"
        },
    },
    shape_base_round_10: {
        material: 'basic',
        shape: {
            "id": "shape_base_round_10",
            "type": "shape",
            "group": null,
            "lock": false,
            "opacity": 1,
            "translate": "0,0",
            "rotate": "0,50,50",
            "scale": "1,1",
            "width": 16,
            "height": 16,
            "border_c": null,
            "border_w": null,
            "border_s": null,
            "background": "",
            "d": "M0.000,7.999 C0.000,3.589 3.589,0.001 8.000,0.001 C12.411,0.001 16.000,3.589 16.000,7.999 C16.000,12.410 12.411,15.999 8.000,15.999 C3.589,15.999 0.000,12.410 0.000,7.999 ZM15.266,7.999 C15.266,3.993 12.006,0.735 8.000,0.735 C3.993,0.735 0.734,3.993 0.734,7.999 C0.734,12.005 3.993,15.265 8.000,15.265 C12.006,15.265 15.266,12.005 15.266,7.999 ZM8.000,1.620 L13.183,10.597 L7.919,7.465 L2.818,10.597 L8.000,1.620 Z",
            "icon": "iconbianjiye2-29"
        },
    },
    shape_base_triangle_3: {
        material: 'basic',
        shape: {
            "id": "shape_base_triangle_3",
            "type": "shape",
            "group": null,
            "lock": false,
            "opacity": 1,
            "translate": "0,0",
            "rotate": "0,50,50",
            "scale": "1,1",
            "width": 15,
            "height": 14.5,
            "border_c": null,
            "border_w": null,
            "border_s": null,
            "background": "",
            "d": "M2.324,14.500 C3.060,14.439 12.032,14.441 12.538,14.500 C16.205,14.931 14.827,12.170 14.440,11.500 C14.130,10.963 8.746,1.890 8.211,0.974 C7.860,0.373 7.023,0.383 6.671,0.974 C6.279,1.633 0.876,10.720 0.440,11.500 C0.120,12.071 0,14.777 2.324,14.500 Z",
            "icon": "iconbianjiye2-30"
        },
    },
    shape_base_cylinder_1: {
        material: 'basic',
        shape: {
            "id": "shape_base_cylinder_1",
            "type": "shape",
            "group": null,
            "lock": false,
            "opacity": 1,
            "translate": "0,0",
            "rotate": "0,50,50",
            "scale": "1,1",
            "width": 14,
            "height": 16,
            "border_c": 'rgb(0,0,0)',
            "border_w": 2,
            "border_s": 'solid',
            "background": "",
            "d": "M7,0 C10.314,0 13.000,1.567 13.000,3.500 C13.000,5.433 10.314,7.000 7.000,7.000 C3.686,7.000 1.000,5.433 1.000,3.500 C1.000,1.567 3.686,0 7.000,0 ZM6.000,0 L8.000,0 C11.314,0 14.000,2.686 14.000,6.000 L14.000,10.000 C14.000,13.314 11.314,16.000 8.000,16.000 L6.000,16.000 C2.686,16.000 0,13.314 0,10.000 L0,6.000 C0,2.686 2.686,0 6.000,0 Z",
            "icon": "iconbianjiye2-07"
        },
    },
    shape_base_cube_1: {
        material: 'basic',
        shape: {
            "id": "shape_base_cube_1",
            "type": "shape",
            "group": null,
            "lock": false,
            "opacity": 1,
            "translate": "0,0",
            "rotate": "0,50,50",
            "scale": "1,1",
            "width": 16,
            "height": 16,
            "border_c": 'rgb(0,0,0)',
            "border_w": 2,
            "border_s": 'solid',
            "background": "",
            "d": "M12.000,4.000   L16.000,0 Z M0,4.000 L12.000,4.000 L12.000,16.000 L0,16.000 L0,4.000 Z M4.000,0 L16.000,0 L16.000,12.000 L12.000,16.000 L0,16.000 L0,4.000 L4.000,0 Z",
            "icon": "iconbianjiye2-08"
        },
    },

    // 箭头类型
    shape_arrow_1: {
        material: 'arrow',
        shape: {
            "id": "shape_arrow_1",
            "type": "shape",
            "group": null,
            "lock": false,
            "opacity": 1,
            "translate": "0,0",
            "rotate": "0,50,50",
            "scale": "1,1",
            "width": 20,
            "height": 12,
            "border_c": null,
            "border_w": null,
            "border_s": null,
            "background": "",
            "d": "M50 0 L100 50 L50 100 L50 70 L0 70 L0 30 L50 30 Z",
            "shape_editor": "shape_arrow_1",
            "icon": "iconbianjiye-37"
        },
        setPath: function (w, h, r1, r2) {
            w = Number(w.toFixed(3));
			h = Number(h.toFixed(3));
            if (r1 <= 0) r1 = 0;
            if (r1 >= (w - 1)) r1 = w - 1;
            if (r2 <= 0) r2 = 0;
            if (r2 >= (h / 2 + 1)) r2 = h / 2 + 1;
            r1 = Number(r1.toFixed(3));
            r2 = Number(r2.toFixed(3));
            return `M${r1} 0 L${w} ${Number((h / 2).toFixed(3))} L${r1} ${h} L${r1} ${Number(((h - r2 * 2) + r2).toFixed(3))} L0 ${Number(((h - r2 * 2) + r2).toFixed(3))} L0 ${r2} L${r1} ${r2} Z`;
        },
        getPath: function (d) {
            let obj = {
                w: 0,
                h: 0,
                r1: 0,
                r2: 0,
            };
            let Lcommand = commandDecompose(d, 'L');
            if (Lcommand) {
                let w_arr = [], h_arr = [];
                Lcommand.forEach(item => {
                    let Litem = commandValueDecompose(item);
                    w_arr.push(Litem[0]);
                    h_arr.push(Litem[1]);
                });
                obj.w = Math.max.apply(null, w_arr);
                obj.h = Math.max.apply(null, h_arr);
                let r2 = commandValueDecompose(Lcommand[h_arr.length - 1]);
                obj.r2 = Number(r2[1]);
            }
            let Mcommand = commandDecompose(d, 'M');
            if (Mcommand) {
                let r1 = commandValueDecompose(Mcommand[0]);
                obj.r1 = Number(r1[0]);
            }
            return obj;
        },
    },
    shape_arrow_2: {
        material: 'arrow',
        shape: {
            "id": "shape_arrow_2",
            "type": "shape",
            "group": null,
            "lock": false,
            "opacity": 1,
            "translate": "0,0",
            "rotate": "0,50,50",
            "scale": "1,1",
            "width": 100,
            "height": 100,
            "border_c": null,
            "border_w": null,
            "border_s": null,
            "background": "",
            "d": "M50 0 L0 50 L50 100 L50 70 L100 70 L100 30 L50 30 Z",
            "shape_editor": "shape_arrow_2",
            "icon": "iconbianjiye-38"
        },
        setPath: function (w, h, r1, r2) {
            w = Number(w.toFixed(3));
			h = Number(h.toFixed(3));
            if (r1 <= 1) r1 = 1;
            if (r1 >= w) r1 = w;
            if (r2 <= 0) r2 = 0;
            if (r2 >= (h / 2 + 1)) r2 = h / 2 + 1;
            r1 = Number(r1.toFixed(3));
            r2 = Number(r2.toFixed(3));
            return `M${r1} 0 L0 ${Number((h / 2).toFixed(3))} L${r1} ${h} L${r1} ${Number(((h - r2 * 2) + r2).toFixed(3))} L${w} ${Number(((h - r2 * 2) + r2).toFixed(3))} L${w} ${r2} L${r1} ${r2} Z`;
        },
        getPath: function (d) {
            let obj = {
                w: 0,
                h: 0,
                r1: 0,
                r2: 0,
            };
            let Lcommand = commandDecompose(d, 'L');
            if (Lcommand) {
                let w_arr = [], h_arr = [];
                Lcommand.forEach(item => {
                    let Litem = commandValueDecompose(item);
                    w_arr.push(Litem[0]);
                    h_arr.push(Litem[1]);
                });
                obj.w = Math.max.apply(null, w_arr);
                obj.h = Math.max.apply(null, h_arr);
                let r2 = commandValueDecompose(Lcommand[h_arr.length - 1]);
                obj.r2 = Number(r2[1]);
            }
            let Mcommand = commandDecompose(d, 'M');
            if (Mcommand) {
                let r1 = commandValueDecompose(Mcommand[0]);
                obj.r1 = Number(r1[0]);
            }
            return obj;
        },
    },
    shape_arrow_3: {
        material: 'arrow',
        shape: {
            "id": "shape_arrow_3",
            "type": "shape",
            "group": null,
            "lock": false,
            "opacity": 1,
            "translate": "0,0",
            "rotate": "0,50,50",
            "scale": "1,1",
            "width": 100,
            "height": 100,
            "border_c": null,
            "border_w": null,
            "border_s": null,
            "background": "",
            "d": "M50 0 L100 50 L70 50 L70 100 L30 100 L30 50 L0 50 Z",
            "shape_editor": "shape_arrow_3",
            "icon": "iconbianjiye-39"
        },
        setPath: function (w, h, r1, r2) {
            w = Number(w.toFixed(3));
			h = Number(h.toFixed(3));
            if (r1 <= 1) r1 = 1;
            if (r1 >= h) r1 = h;
            if (r2 <= 0) r2 = 0;
            if (r2 >= (w / 2 + 1)) r2 = w / 2 + 1;
            r1 = Number(r1.toFixed(3));
            r2 = Number(r2.toFixed(3));
            return `M${Number((w / 2).toFixed(3))} 0 L${w} ${r1} L${Number(((w - r2 * 2) + r2).toFixed(3))} ${r1} L${Number(((w - r2 * 2) + r2).toFixed(3))} ${h} L${r2} ${h} L${r2} ${r1} L0 ${r1} Z`;
        },
        getPath: function (d) {
            let obj = {
                w: 0,
                h: 0,
                r1: 0,
                r2: 0,
            };
            let Lcommand = commandDecompose(d, 'L');
            if (Lcommand) {
                let w_arr = [], h_arr = [];
                Lcommand.forEach(item => {
                    let Litem = commandValueDecompose(item);
                    w_arr.push(Litem[0]);
                    h_arr.push(Litem[1]);
                });
                obj.w = Math.max.apply(null, w_arr);
                obj.h = Math.max.apply(null, h_arr);
                let r1 = commandValueDecompose(Lcommand[0]);
                obj.r1 = Number(r1[1]);
                let r2 = commandValueDecompose(Lcommand[3]);
                obj.r2 = Number(r2[0]);
            }
            return obj;
        },
    },
    shape_arrow_4: {
        material: 'arrow',
        shape: {
            "id": "shape_arrow_4",
            "type": "shape",
            "group": null,
            "lock": false,
            "opacity": 1,
            "translate": "0,0",
            "rotate": "0,50,50",
            "scale": "1,1",
            "width": 100,
            "height": 100,
            "border_c": null,
            "border_w": null,
            "border_s": null,
            "background": "",
            "d": "M30 0 L70 0 L70 50 L100 50 L50 100 L0 50 L30 50 Z",
            "shape_editor": "shape_arrow_4",
            "icon": "iconbianjiye-40"
        },
        setPath: function (w, h, r1, r2) {
            w = Number(w.toFixed(3));
			h = Number(h.toFixed(3));
            if (r1 <= 0) r1 = 0;
            if (r1 >= (w / 2 - 1)) r1 = w / 2 - 1;
            if (r2 <= 0) r2 = 0;
            if (r2 >= (h + 1)) r2 = h + 1;
            r1 = Number(r1.toFixed(3));
            r2 = Number(r2.toFixed(3));
            return `M${r1} 0 L${Number(((w - r1 * 2) + r1).toFixed(3))} 0 L${Number(((w - r1 * 2) + r1).toFixed(3))} ${r2} L${w} ${r2} L${Number((w / 2).toFixed(3))} ${h} L0 ${r2} L${r1} ${r2} Z`;
        },
        getPath: function (d) {
            let obj = {
                w: 0,
                h: 0,
                r1: 0,
                r2: 0,
            };
            let Lcommand = commandDecompose(d, 'L');
            if (Lcommand) {
                let w_arr = [], h_arr = [];
                Lcommand.forEach(item => {
                    let Litem = commandValueDecompose(item);
                    w_arr.push(Litem[0]);
                    h_arr.push(Litem[1]);
                });
                obj.w = Math.max.apply(null, w_arr);
                obj.h = Math.max.apply(null, h_arr);
                let r = commandValueDecompose(Lcommand[h_arr.length - 1]);
                obj.r1 = Number(r[0]);
                obj.r2 = Number(r[1]);
            }
            return obj;
        },
    },
    shape_arrow_5: {
        material: 'arrow',
        shape: {
            "id": "shape_arrow_5",
            "type": "shape",
            "group": null,
            "lock": false,
            "opacity": 1,
            "translate": "0,0",
            "rotate": "0,50,50",
            "scale": "1,1",
            "width": 100,
            "height": 100,
            "border_c": null,
            "border_w": null,
            "border_s": null,
            "background": "",
            "d": "M0 50 L40 0 L40 30 L60 30 L60 0 L100 50 L60 100 L60 70 L40 70 L40 100 Z",
            "shape_editor": "shape_arrow_5",
            "icon": "iconbianjiye-41"
        },
        setPath: function (w, h, r1, r2) {
            w = Number(w.toFixed(3));
			h = Number(h.toFixed(3));
            if (r1 <= 1) r1 = 1;
            if (r1 >= (w / 2)) r1 = w / 2;
            if (r2 <= 0) r2 = 0;
            if (r2 >= (h / 2 - 1)) r2 = h / 2 - 1;
            r1 = Number(r1.toFixed(3));
            r2 = Number(r2.toFixed(3));
            return `M0 ${Number((h / 2).toFixed(3))} L${r1} 0 L${r1} ${r2} L${Number((w - r1).toFixed(3))} ${r2} L${Number((w - r1).toFixed(3))} 0 L${w} ${Number((h / 2).toFixed(3))} L${Number((w - r1).toFixed(3))} ${h} L${Number((w - r1).toFixed(3))} ${Number(((h - r2 * 2) + r2).toFixed(3))} L${r1} ${Number(((h - r2 * 2) + r2).toFixed(3))} L${r1} ${h} Z`;
        },
        getPath: function (d) {
            let obj = {
                w: 0,
                h: 0,
                r1: 0,
                r2: 0,
            };
            let Lcommand = commandDecompose(d, 'L');
            if (Lcommand) {
                let w_arr = [], h_arr = [];
                Lcommand.forEach(item => {
                    let Litem = commandValueDecompose(item);
                    w_arr.push(Litem[0]);
                    h_arr.push(Litem[1]);
                });
                obj.w = Math.max.apply(null, w_arr);
                obj.h = Math.max.apply(null, h_arr);
                let r = commandValueDecompose(Lcommand[1]);
                obj.r1 = Number(r[0]);
                obj.r2 = Number(r[1]);
            }
            return obj;
        },
    },
    shape_arrow_6: {
        material: 'arrow',
        shape: {
            "id": "shape_arrow_6",
            "type": "shape",
            "group": null,
            "lock": false,
            "opacity": 1,
            "translate": "0,0",
            "rotate": "0,50,50",
            "scale": "1,1",
            "width": 100,
            "height": 100,
            "border_c": null,
            "border_w": null,
            "border_s": null,
            "background": "",
            "d": "M50 0 L100 40 L70 40 L70 60 L100 60 L50 100 L0 60 L30 60 L30 40 L0 40 Z",
            "shape_editor": "shape_arrow_6",
            "icon": "iconbianjiye-42"
        },
        setPath: function (w, h, r1, r2) {
            w = Number(w.toFixed(3));
			h = Number(h.toFixed(3));
            if (r1 <= 1) r1 = 1;
            if (r1 >= (h / 2)) r1 = h / 2;
            if (r2 <= 0) r2 = 0;
            if (r2 >= (w / 2 - 1)) r2 = w / 2 - 1;
            r1 = Number(r1.toFixed(3));
            r2 = Number(r2.toFixed(3));
            return `M${Number((w / 2).toFixed(3))} 0 L${w} ${r1} L${Number(((w - r2 * 2) + r2).toFixed(3))} ${r1} L${Number(((w - r2 * 2) + r2).toFixed(3))} ${Number((h - r1).toFixed(3))} L${w} ${Number((h - r1).toFixed(3))} L${Number((w / 2).toFixed(3))} ${h} L0 ${Number((h - r1).toFixed(3))} L${r2} ${Number((h - r1).toFixed(3))} L${r2} ${r1} L0 ${r1} Z`;
        },
        getPath: function (d) {
            let obj = {
                w: 0,
                h: 0,
                r1: 0,
                r2: 0,
            };
            let Lcommand = commandDecompose(d, 'L');
            if (Lcommand) {
                let w_arr = [], h_arr = [];
                Lcommand.forEach(item => {
                    let Litem = commandValueDecompose(item);
                    w_arr.push(Litem[0]);
                    h_arr.push(Litem[1]);
                });
                obj.w = Math.max.apply(null, w_arr);
                obj.h = Math.max.apply(null, h_arr);
                let r = commandValueDecompose(Lcommand[h_arr.length - 2]);
                obj.r1 = Number(r[1]);
                obj.r2 = Number(r[0]);
            }
            return obj;
        },
    },
    shape_arrow_7: {
        material: 'arrow',
        shape: {
            "id": "shape_arrow_7",
            "type": "shape",
            "group": null,
            "lock": false,
            "opacity": 1,
            "translate": "0,0",
            "rotate": "0,50,50",
            "scale": "1,1",
            "width": 100,
            "height": 100,
            "border_c": null,
            "border_w": null,
            "border_s": null,
            "background": "",
            "d": "M50 0 L70 25 L60 25 L60 40 L75 40 L75 30 L100 50 L75 70 L75 60 L60 60 L60 75 L70 75 L50 100 L30 75 L40 75 L40 60 L25 60 L25 70 L0 50 L25 30 L25 40 L40 40 L40 25 L30 25 L50 0 Z",
            "shape_editor": "shape_arrow_7",
            "icon": "iconbianjiye-43"
        },
        setPath: function (w, h, r1, r2, r3) {
            w = Number(w.toFixed(3));
			h = Number(h.toFixed(3));
            let min = w < h ? w : h;
            if (r1 <= 1) r1 = 1;
            if (r1 >= min) r1 = min;
            if (r2 <= 1) r2 = 1;
            if (r2 >= (min / 2)) r2 = min / 2;
            if (r3 <= 1) r3 = 1;
            if (r3 >= r1) r3 = r1;
            r1 = Number(r1.toFixed(3));
            r2 = Number(r2.toFixed(3));
            r3 = Number(r3.toFixed(3));
            return `M${Number((w / 2).toFixed(3))} 0 L${Number(((w - r1) / 2 + r1).toFixed(3))} ${r2} L${Number(((w - r3) / 2 + r3).toFixed(3))} ${r2} L${Number(((w - r3) / 2 + r3).toFixed(3))} ${Number(((h - r3) / 2).toFixed(3))} L${Number((w - r2).toFixed(3))} ${Number(((h - r3) / 2).toFixed(3))} L${Number((w - r2).toFixed(3))} ${Number(((h - r1) / 2).toFixed(3))} L${w} ${Number((h / 2).toFixed(3))} L${Number((w - r2).toFixed(3))} ${Number(((h - r1) / 2 + r1).toFixed(3))} L${Number((w - r2).toFixed(3))} ${Number(((h - r3) / 2 + r3).toFixed(3))} L${Number(((w - r3) / 2 + r3).toFixed(3))} ${Number(((h - r3) / 2 + r3).toFixed(3))} L${Number(((w - r3) / 2 + r3).toFixed(3))} ${Number((h - r2).toFixed(3))} L${Number(((w - r1) / 2 + r1).toFixed(3))} ${Number((h - r2).toFixed(3))} L${Number((w / 2).toFixed(3))} ${h} L${Number(((w - r1) / 2).toFixed(3))} ${Number((h - r2).toFixed(3))} L${Number(((w - r3) / 2).toFixed(3))} ${Number((h - r2).toFixed(3))} L${Number(((w - r3) / 2).toFixed(3))} ${Number(((h - r3) / 2 + r3).toFixed(3))} L${r2} ${Number(((h - r3) / 2 + r3).toFixed(3))} L${r2} ${Number(((h - r1) / 2 + r1).toFixed(3))} L0 ${Number((h / 2).toFixed(3))} L${r2} ${Number(((h - r1) / 2).toFixed(3))} L${r2} ${Number(((h - r3) / 2).toFixed(3))} L${Number(((w - r3) / 2).toFixed(3))} ${Number(((h - r3) / 2).toFixed(3))} L${Number(((w - r3) / 2).toFixed(3))} ${r2} L${Number(((w - r1) / 2).toFixed(3))} ${r2} L${Number((w / 2).toFixed(3))} 0 Z`;
        },
        getPath: function (d) {
            let obj = {
                w: 0,
                h: 0,
                r1: 0,
                r2: 0,
                r3: 0,
            };
            let Lcommand = commandDecompose(d, 'L');
            if (Lcommand) {
                let w_arr = [], h_arr = [];
                Lcommand.forEach(item => {
                    let Litem = commandValueDecompose(item);
                    w_arr.push(Litem[0]);
                    h_arr.push(Litem[1]);
                });
                obj.w = Math.max.apply(null, w_arr);
                obj.h = Math.max.apply(null, h_arr);
                let r1_r2 = commandValueDecompose(Lcommand[0]);
                obj.r1 = obj.w - (obj.w - Number(r1_r2[0])) * 2;
                obj.r2 = Number(r1_r2[1]);
                let r3 = commandValueDecompose(Lcommand[1]);
                obj.r3 = obj.w - (obj.w - Number(r3[0])) * 2;
            }
            return obj;
        },
    },
    shape_arrow_8: {
        material: 'arrow',
        shape: {
            "id": "shape_arrow_8",
            "type": "shape",
            "group": null,
            "lock": false,
            "opacity": 1,
            "translate": "0,0",
            "rotate": "0,50,50",
            "scale": "1,1",
            "width": 20,
            "height": 18,
            "border_c": null,
            "border_w": null,
            "border_s": null,
            "background": "",
            "d": "M7.76,2.369 C3.474,2.369 0 5.868 0,10.184 C0,14.501 3.474 18 7.76,18 L16.043,18 L16.043,14.683 L7.76,14.683 C5.293,14.683 3.293 12.669 3.293,10.184 C3.293,7.699 5.293 5.685 7.76,5.685 L13.074,5.685 L13.074,8.054 L20,4.027 L13.074,0 L13.074,2.369 L7.76,2.369 Z",
            // "shape_editor": "shape_arrow_8",
            "icon": "iconbianjiye-44"
        },
        setPath: function () {},
        getPath: function () {},
    },
    shape_arrow_9: {
        material: 'arrow',
        shape: {
            "id": "shape_arrow_9",
            "type": "shape",
            "group": null,
            "lock": false,
            "opacity": 1,
            "translate": "0,0",
            "rotate": "0,50,50",
            "scale": "1,1",
            "width": 26,
            "height": 18,
            "border_c": null,
            "border_w": null,
            "border_s": null,
            "background": "",
            "d": "M17.324,10.306 C17.324,10.306 20.56 6.424 26,5.153 C20.56,3.881 17.324 0 17.324,0 L18.278,3.365 C0,4.752 12.336 17.748 18.574,18 C15.117,16.607 8.462 7.769 18.278,6.94 L17.324,10.306 L17.324,10.306 Z",
            "icon": "iconbianjiye-45"
        },
    },
    shape_arrow_10: {
        material: 'arrow',
        shape: {
            "id": "shape_arrow_10",
            "type": "shape",
            "group": null,
            "lock": false,
            "opacity": 1,
            "translate": "0,0",
            "rotate": "0,50,50",
            "scale": "1,1",
            "width": 100,
            "height": 100,
            "border_c": null,
            "border_w": null,
            "border_s": null,
            "background": "",
            "d": "M0 0 L50 0 L100 50 L50 100 L0 100 L50 50 Z",
            "shape_editor": "shape_arrow_10",
            "icon": "iconbianjiye-46"
        },
        setPath: function (w, h, r1) {
            w = Number(w.toFixed(3));
			h = Number(h.toFixed(3));
            if (r1 <= 0) r1 = 0;
            if (r1 >= (w - 1)) r1 = w - 1;
			r1 = Number(r1.toFixed(3));
            return `M0 0 L${Number((w - r1).toFixed(3))} 0 L${w} ${Number((h / 2).toFixed(3))} L${Number((w - r1).toFixed(3))} ${h} L0 ${h} L${r1} ${Number((h / 2).toFixed(3))} Z`;
        },
        getPath: function (d) {
            let obj = {
                w: 0,
                h: 0,
                r1: 0,
            };
            let Lcommand = commandDecompose(d, 'L');
            if (Lcommand) {
                let w_h = commandValueDecompose(Lcommand[1]);
                obj.w = Number(w_h[0]);
                obj.h = Number(w_h[1]) * 2;
                let r1 = commandValueDecompose(Lcommand[Lcommand.length - 1]);
                obj.r1 = Number(r1[0]);
            }
            return obj;
        },
    },
    shape_arrow_11: {
        material: 'arrow',
        shape: {
            "id": "shape_45",
            "type": "shape",
            "group": null,
            "lock": false,
            "opacity": 1,
            "translate": "0,0",
            "rotate": "0,50,50",
            "scale": "1,1",
            "width": 20,
            "height": 17,
            "border_c": null,
            "border_w": null,
            "border_s": null,
            "background": "",
            "d": "M0,17 L0,7.932 C0,5.107 2.265 2.816 5.06,2.816 L11.795,2.816 L11.795,0 L20,4.789 L11.795,9.577 L11.795,6.761 L5.06,6.761 C4.402,6.761 3.869 7.299 3.869,7.964 L3.869,17 L0,17 Z",
            // "shape_editor": "shape_arrow_11",
            "icon": "iconbianjiye-47"
        },
        setPath: function () {},
        getPath: function () {},
    },
    shape_arrow_12: {
        material: 'arrow',
        shape: {
            "id": "shape_46",
            "type": "shape",
            "group": null,
            "lock": false,
            "opacity": 1,
            "translate": "0,0",
            "rotate": "0,50,50",
            "scale": "1,1",
            "width": 100,
            "height": 100,
            "border_c": null,
            "border_w": null,
            "border_s": null,
            "background": "",
            "d": "M0 0 L30 0 L50 50 L30 100 L0 100 L20 50 Z M20 30 L65 30 L65 0 L100 50 L65 100 L65 70 L20 70 Z",
            "shape_editor": "shape_arrow_12",
            "icon": "iconbianjiye-48"
        },
        setPath: function (w, h, r1, r2, r3) {
            w = Number(w.toFixed(3));
			h = Number(h.toFixed(3));
            if (r1 <= 0) r1 = 0;
            if (r1 >= (w / 2 - 2)) r1 = w / 2 - 2;
            if (r2 <= (w / 2)) r2 = w / 2;
            if (r2 >= (w - 1)) r2 = w - 1;
            if (r3 <= 0) r3 = 0;
            if (r3 >= (h / 2 - 1)) r3 = h / 2 - 1;
			r1 = Number(r1.toFixed(3));
			r2 = Number(r2.toFixed(3));
			r3 = Number(r3.toFixed(3));
            return `M0 0 L${Number((w / 2 - r1).toFixed(3))} 0 L${Number((w / 2).toFixed(3))} ${Number((h / 2).toFixed(3))} L${Number((w / 2 - r1).toFixed(3))} ${h} L0 ${h} L${r1} ${Number((h / 2).toFixed(3))} Z M${r1} ${r3} L${r2} ${r3} L${r2} 0 L${w} ${Number((h / 2).toFixed(3))} L${r2} ${h} L${r2} ${Number(((h - r3 * 2) + r3).toFixed(3))} L${r1} ${Number(((h - r3 * 2) + r3).toFixed(3))} Z`;
        },
        getPath: function (d) {
            let obj = {
                w: 0,
                h: 0,
                r1: 0,
                r2: 0,
                r3: 0,
            };
            let Lcommand = commandDecompose(d, 'L');
            if (Lcommand) {
                let w_arr = [], h_arr = [];
                Lcommand.forEach(item => {
                    let Litem = commandValueDecompose(item);
                    w_arr.push(Litem[0]);
                    h_arr.push(Litem[1]);
                });
                obj.w = Math.max.apply(null, w_arr);
                obj.h = Math.max.apply(null, h_arr);
                let r1 = commandValueDecompose(Lcommand[0]);
                obj.r1 = obj.w / 2 - Number(r1[0]);
                let r2_r3 = commandValueDecompose(Lcommand[5]);
                obj.r2 = Number(r2_r3[0]);
                obj.r3 = Number(r2_r3[1]);
            }
            return obj;
        },
    },
    shape_arrow_13: {
        material: 'arrow',
        shape: {
            "id": "shape_47",
            "type": "shape",
            "group": null,
            "lock": false,
            "opacity": 1,
            "translate": "0,0",
            "rotate": "0,50,50",
            "scale": "1,1",
            "width": 20,
            "height": 20,
            "border_c": null,
            "border_w": null,
            "border_s": null,
            "background": "",
            "d": "M9.678,20 L20,9.639 L9.678,0 L9.678,3.012 L0,3.012 L0,16.988 L9.678,16.988 L9.678,20 Z",
            "icon": "iconbianjiye-49"
        },
    },
    shape_arrow_14: {
        material: 'arrow',
        shape: {
            "id": "shape_arrow_14",
            "type": "shape",
            "group": null,
            "lock": false,
            "opacity": 1,
            "translate": "0,0",
            "rotate": "0,50,50",
            "scale": "1,1",
            "width": 100,
            "height": 100,
            "border_c": null,
            "border_w": null,
            "border_s": null,
            "background": "",
            "d": "M0 0 L70 0 L100 50 L70 100 L0 100 Z",
            "shape_editor": "shape_arrow_14",
            "icon": "iconbianjiye-50"
        },
        setPath: function (w, h, r1) {
            w = Number(w.toFixed(3));
			h = Number(h.toFixed(3));
            if (r1 <= 0) r1 = 0;
            if (r1 >= w) r1 = w;
			r1 = Number(r1.toFixed(3));
            return `M0 0 L${r1} 0 L${w} ${Number((h / 2).toFixed(3))} L${r1} ${h} L0 ${h} Z`;
        },
        getPath: function (d) {
            let obj = {
                w: 0,
                h: 0,
                r1: 0,
            };
            let Lcommand = commandDecompose(d, 'L');
            if (Lcommand) {
                let r1 = commandValueDecompose(Lcommand[0]);
                obj.r1 = Number(r1[0]);
                let w_h = commandValueDecompose(Lcommand[1]);
                obj.w = Number(w_h[0]);
                obj.h = Number(w_h[1]) * 2;
            }
            return obj;
        },
    },
    shape_arrow_15: {
        material: 'arrow',
        shape: {
            "id": "shape_arrow_15",
            "type": "shape",
            "group": null,
            "lock": false,
            "opacity": 1,
            "translate": "0,0",
            "rotate": "0,50,50",
            "scale": "1,1",
            "width": 16,
            "height": 14,
            "border_c": null,
            "border_w": null,
            "border_s": null,
            "background": "",
            "d": "M10.000,8.000 L11.000,8.000 L11.000,6.001 L16.000,10.000 L11.000,14.000 L11.000,12.000 L5.000,12.000 L5.000,14.000 L0.000,10.000 L5.000,6.001 L5.000,8.000 L6.000,8.000 L6.000,5.000 L4.001,5.000 L8.000,0.000 L12.000,5.000 L10.000,5.000 L10.000,8.000 Z",
            "icon": "iconbianjiye2-31"
        },
    },
    shape_arrow_16: {
        material: 'arrow',
        shape: {
            "id": "shape_arrow_16",
            "type": "shape",
            "group": null,
            "lock": false,
            "opacity": 1,
            "translate": "0,0",
            "rotate": "0,50,50",
            "scale": "1,1",
            "width": 16,
            "height": 16,
            "border_c": null,
            "border_w": null,
            "border_s": null,
            "background": "",
            "d": "M11.500,13.000 L7.001,8.000 L9.000,8.000 L9.000,6.000 C9.000,6.000 8.025,5.000 7.038,5.000 C6.026,5.000 5.000,6.000 5.000,6.000 L5.000,16.000 L0.000,16.000 L0.000,5.000 C0.000,5.000 1.000,3.258 2.000,2.000 C3.000,0.758 5.000,0.000 5.000,0.000 L9.000,0.000 C9.000,0.000 10.923,0.923 12.000,2.000 C12.908,2.908 14.000,5.000 14.000,5.000 L14.000,8.000 L16.000,8.000 L11.500,13.000 Z",
            "icon": "iconbianjiye2-32"
        },
    },
    shape_arrow_17: {
        material: 'arrow',
        shape: {
            "id": "shape_arrow_17",
            "type": "shape",
            "group": null,
            "lock": false,
            "opacity": 1,
            "translate": "0,0",
            "rotate": "0,50,50",
            "scale": "1,1",
            "width": 16.5,
            "height": 16.5,
            "border_c": null,
            "border_w": null,
            "border_s": null,
            "background": "",
            "d": "M14.500,5.499 L14.500,9.500 L14.500,12.500 L14.500,14.500 L5.500,14.500 L5.500,16.499 L0.500,12.000 L5.500,7.501 L5.500,9.500 L9.500,9.500 L9.500,5.499 L7.501,5.499 L12.000,0.500 L16.499,5.499 L14.500,5.499 Z",
            "icon": "iconbianjiye2-34"
        },
    },
    shape_arrow_18: {
        material: 'arrow',
        shape: {
            "id": "shape_arrow_18",
            "type": "shape",
            "group": null,
            "lock": false,
            "opacity": 1,
            "translate": "0,0",
            "rotate": "0,50,50",
            "scale": "1,1",
            "width": 15,
            "height": 14,
            "border_c": null,
            "border_w": null,
            "border_s": null,
            "background": "",
            "d": "M13.000,5.000 L13.000,9.000 L13.000,12.000 L13.000,14.000 L13.000,14.000 L0.000,14.000 L0.000,14.000 L0.000,14.000 L0.000,9.000 L0.000,9.000 L8.000,9.000 L8.00,5.000 L6.001,5.000 L10.500,0.000 L15.000,5.000 L13.000,5.000 Z",
            "icon": "iconbianjiye2-35"
        },
    },
    shape_arrow_19: {
        material: 'arrow',
        shape: {
            "id": "shape_arrow_23",
            "type": "shape",
            "group": null,
            "lock": false,
            "opacity": 1,
            "translate": "0,0",
            "rotate": "0,50,50",
            "scale": "1,1",
            "width": 17,
            "height": 16,
            "border_c": null,
            "border_w": null,
            "border_s": null,
            "background": "",
            "d": "M16.499,8.000 L8.501,15.498 L8.501,11.500 L4.500,11.500 L4.500,4.500 L8.501,4.500 L8.501,0.502 L16.499,8.000 ZM2.500,4.500 L3.500,4.500 L3.500,11.500 L2.500,11.500 L2.500,4.500 ZM0.500,4.500 L1.500,4.500 L1.500,11.500 L0.500,11.500 L0.500,4.500 Z",
            "icon": "iconbianjiye2-40"
        },
    },
    shape_arrow_20: {
        material: 'arrow',
        shape: {
            "id": "shape_arrow_24",
            "type": "shape",
            "group": null,
            "lock": false,
            "opacity": 1,
            "translate": "0,0",
            "rotate": "0,50,50",
            "scale": "1,1",
            "width": 16,
            "height": 15,
            "border_c": null,
            "border_w": null,
            "border_s": null,
            "background": "",
            "d": "M16.000,7.500 L8.001,15.000 L8.001,11.000 L0,11.000 L3.000,7.440 L0,4.000 L8.001,4.000 L8.001,0 L16.000,7.500 Z",
            "icon": "iconbianjiye2-41"
        },
    },
    shape_arrow_21: {
        material: 'arrow',
        shape: {
            "id": "shape_arrow_25",
            "type": "shape",
            "group": null,
            "lock": false,
            "opacity": 1,
            "translate": "0,0",
            "rotate": "0,50,50",
            "scale": "1,1",
            "width": 16,
            "height": 11,
            "border_c": null,
            "border_w": null,
            "border_s": null,
            "background": "",
            "d": "M0,11 L5.411,4.500 L0,0 L10.589,0 L16,5.500 L10.589,11 L0,11 Z",
            "icon": "iconbianjiye2-42"
        },
    },
    shape_arrow_22: {
        material: 'arrow',
        shape: {
            "id": "shape_arrow_26",
            "type": "shape",
            "group": null,
            "lock": false,
            "opacity": 1,
            "translate": "0,0",
            "rotate": "0,50,50",
            "scale": "1,1",
            "width": 17,
            "height": 13,
            "border_c": null,
            "border_w": null,
            "border_s": null,
            "background": "",
            "d": "M17.000,6.500 L10.001,12.000 L10.001,9.000 L8.000,9.000 L8.000,13.000 L0.000,13.000 L0.000,0.000 L8.000,0.000 L8.000,4.000 L10.001,4.000 L10.001,1.001 L17.000,6.500 Z",
            "icon": "iconbianjiye2-43"
        },
    },
    shape_arrow_23: {
        material: 'arrow',
        shape: {
            "id": "shape_arrow_27",
            "type": "shape",
            "group": null,
            "lock": false,
            "opacity": 1,
            "translate": "0,0",
            "rotate": "0,50,50",
            "scale": "1,1",
            "width": 16,
            "height": 13,
            "border_c": null,
            "border_w": null,
            "border_s": null,
            "background": "",
            "d": "M16.000,6.500 L11.000,11.000 L11.000,9.000 L10.000,9.000 L10.000,13.000 L6.000,13.000 L6.000,9.000 L5.000,9.000 L5.000,11.000 L0.000,6.500 L5.000,2.001 L5.000,4.000 L6.000,4.000 L6.000,0 L10.000,0 L10.000,4.000 L11.000,4.000 L11.000,2.001 L16.000,6.500 Z",
            "icon": "iconbianjiye2-44"
        },
    },
    shape_arrow_24: {
        material: 'arrow',
        shape: {
            "id": "shape_arrow_28",
            "type": "shape",
            "group": null,
            "lock": false,
            "opacity": 1,
            "translate": "0,0",
            "rotate": "0,50,50",
            "scale": "1,1",
            "width": 14,
            "height": 16,
            "border_c": null,
            "border_w": null,
            "border_s": null,
            "background": "",
            "d": "M0,16.000 L7.575,8.000 L0,0 L6.425,0.000 L14.005,8.000 L6.425,16.000 L0,16.000 Z",
            "icon": "iconbianjiye2-45"
        },
    },
    shape_arrow_25: {
        material: 'arrow',
        shape: {
            "id": "shape_arrow_29",
            "type": "shape",
            "group": null,
            "lock": false,
            "opacity": 1,
            "translate": "0,0",
            "rotate": "0,50,50",
            "scale": "1,1",
            "width": 16,
            "height": 16,
            "border_c": null,
            "border_w": null,
            "border_s": null,
            "background": "",
            "d": "M0,16.000 L2.873,8.000 L0,0 L16.000,8.000 L0,16.000 Z",
            "icon": "iconbianjiye2-46"
        },
    },
    shape_arrow_26: {
        material: 'arrow',
        shape: {
            "id": "shape_arrow_26",
            "type": "shape",
            "group": null,
            "lock": false,
            "opacity": 1,
            "translate": "0,0",
            "rotate": "0,50,50",
            "scale": "1,1",
            "width": 15.5,
            "height": 18.5,
            "border_c": null,
            "border_w": null,
            "border_s": null,
            "background": "",
            "d": "M15.499,14.000 L10.500,18.499 L10.500,16.500 L3.500,16.500 C3.500,16.500 0.383,15.773 0.500,12.500 C0.570,10.533 0.500,8.500 0.500,8.500 C0.500,8.500 2.775,11.343 4.500,11.500 C7.312,11.756 10.500,11.500 10.500,11.500 L10.500,9.501 L15.499,14.000 Z M15.500,5.500 C15.500,5.500 8.029,5.467 5.269,5.500 C3.310,5.517 1.000,8.500 0.500,8.500 C0.500,8.500 0.078,5.309 0.836,3.500 C1.543,1.813 4.769,0.500 4.769,0.500 L15.500,0.500 L15.500,5.500 Z",
            "icon": "iconbianjiye2-36"
        },
    },
    shape_arrow_27: {
        material: 'arrow',
        shape: {
            "id": "shape_arrow_27",
            "type": "shape",
            "group": null,
            "lock": false,
            "opacity": 1,
            "translate": "0,0",
            "rotate": "0,50,50",
            "scale": "1,1",
            "width": 15,
            "height": 18,
            "border_c": null,
            "border_w": null,
            "border_s": null,
            "background": "",
            "d": "M0,13.500 L5.000,18.000 L5.000,16.000 L12.000,16.000 C12.000,16.000 15.117,15.273 15.000,12.000 C15.000,10.033 15.000,8.000 15.000,8.000 C15.000,8.000 12.765,10.843 11.000,11.000 C8.188,11.256 6.000,11.000 5.000,11.000 L5.000,9.001 L0,13.500 Z M0,5.000 C0,5.000 8.000,4.967 11.731,5.000 C12.190,5.017 15.000,8.000 15.000,8.000 C15.000,8.000 15.000,4.809 15.000,3.000 C14.957,1.313 11.731,0 11.71,0 L0,0 L0,5.000 Z",
            "icon": "iconbianjiye2-37"
        },
    },
    shape_arrow_28: {
        material: 'arrow',
        shape: {
            "id": "shape_arrow_28",
            "type": "shape",
            "group": null,
            "lock": false,
            "opacity": 1,
            "translate": "0,0",
            "rotate": "0,50,50",
            "scale": "1,1",
            "width": 18.3,
            "height": 15.5,
            "border_c": null,
            "border_w": null,
            "border_s": null,
            "background": "",
            "d": "M5.437,0.437 C5.437,0.437 5.405,8.409 5.437,11.169 C5.455,12.627 8.437,15.437 8.437,15.437 C8.437,15.437 5.246,15.859 3.437,15.101 C1.751,14.395 0.437,11.169 0.437,11.169 L0.437,0.437 L5.437,0.437 Z M13.937,0.438 L18.436,5.437 L16.437,5.437 L16.437,12.437 C16.437,12.437 15.710,15.554 12.437,15.437 C10.471,15.367 8.437,15.437 8.437,15.437 C8.437,15.437 11.280,13.163 11.437,11.437 C11.694,8.626 11.437,5.437 11.437,5.437 L9.439,5.437 L13.937,0.438 Z ",
            "icon": "iconbianjiye2-38"
        },
    },
    shape_arrow_29: {
        material: 'arrow',
        shape: {
            "id": "shape_arrow_29",
            "type": "shape",
            "group": null,
            "lock": false,
            "opacity": 1,
            "translate": "0,0",
            "rotate": "0,50,50",
            "scale": "1,1",
            "width": 18.7,
            "height": 15,
            "border_c": null,
            "border_w": null,
            "border_s": null,
            "background": "",
            "d": "M14.437,15.062 L18.936,10.063 L16.937,10.063 L16.937,3.062 C16.937,3.062 16.210,0 12.937,0.062 C10.971,0.133 8.937,0.062 8.937,0.062 C8.937,0.062 11.780,2.337 11.937,4.062 C12.194,6.874 11.937,10.063 11.937,10.063 L9.939,10.063 L14.437,15.062 Z M5.937,15.062 C5.937,15.062 5.905,7.091 5.937,4.331 C5.955,2.873 8.937,0.062 8.937,0.062 C8.937,0.062 5.746,0 3.937,0.399 C2.251,0.105 0.937,4.331 0.937,4.331 L0.937,15.062 L5.937,15.062 Z",
            "icon": "iconbianjiye2-39"
        },
    },

    // 其他形状
    shape_other_1: {
        material: 'other',
        shape: {
            "id": "shape_49",
            "type": "shape",
            "group": null,
            "lock": false,
            "opacity": 1,
            "translate": "0,0",
            "rotate": "0,50,50",
            "scale": "1,1",
            "width": 20,
            "height": 20,
            "border_c": null,
            "border_w": null,
            "border_s": null,
            "background": "",
            "d": "M10,0 L13.296,6.285 L20,7.639 L15.333,12.878 L16.18,20 L10,16.952 L3.819,20 L4.667,12.878 L0,7.639 L6.704,6.285 L10,0 Z",
            // "shape_editor": "shape_other_1",
            "icon": "iconbianjiye-51"
        },
        setPath: function () {},
        getPath: function () {},
    },
    shape_other_2: {
        material: 'other',
        shape: {
            "id": "shape_50",
            "type": "shape",
            "group": null,
            "lock": false,
            "opacity": 1,
            "translate": "0,0",
            "rotate": "0,50,50",
            "scale": "1,1",
            "width": 20,
            "height": 20,
            "border_c": null,
            "border_w": null,
            "border_s": null,
            "background": "",
            "d": "M17.071,12.929 L20,10 L17.071,7.071 L17.071,2.929 L12.929,2.929 L10,0 L7.071,2.929 L2.929,2.929 L2.929,7.071 L0,10 L2.929,12.929 L2.929,17.071 L7.071,17.071 L10,20 L12.929,17.071 L17.071,17.071 L17.071,12.929 Z",
            // "shape_editor": "shape_other_2",
            "icon": "iconbianjiye-52"
        },
        setPath: function () {},
        getPath: function () {},
    },
    shape_other_3: {
        material: 'other',
        shape: {
            "id": "shape_51",
            "type": "shape",
            "group": null,
            "lock": false,
            "opacity": 1,
            "translate": "0,0",
            "rotate": "0,50,50",
            "scale": "1,1",
            "width": 20,
            "height": 20,
            "border_c": null,
            "border_w": null,
            "border_s": null,
            "background": "",
            "d": "M10,0 L11.733,4.928 L16.18,1.91 L14.537,6.865 L20,6.91 L15.608,10 L20,13.09 L14.537,13.135 L16.18,18.09 L11.733,15.073 L10,20 L8.267,15.073 L3.819,18.09 L5.463,13.135 L0,13.09 L4.392,10 L0,6.91 L5.463,6.865 L3.819,1.91 L8.267,4.928 L10,0 Z",
            // "shape_editor": "shape_other_3",
            "icon": "iconbianjiye-53"
        },
        setPath: function () {},
        getPath: function () {},
    },
    shape_other_4: {
        material: 'other',
        shape: {
            "id": "shape_52",
            "type": "shape",
            "group": null,
            "lock": false,
            "opacity": 1,
            "translate": "0,0",
            "rotate": "0,50,50",
            "scale": "1,1",
            "width": 20,
            "height": 20,
            "border_c": null,
            "border_w": null,
            "border_s": null,
            "background": "",
            "d": "M16.054,12.245 C18.169,12.326 20 11.617 20,11.617 C20,11.617 18.455 10.245 16.419,9.641 C18.387,8.862 19.777 7.477 19.777,7.477 C19.777,7.477 17.811 6.843 15.703,7.11 C17.192,5.605 17.906 3.777 17.906,3.777 C17.906,3.777 15.699 4.004 13.832,5.204 C14.631,3.138 14.493 1.037 14.493,1.037 C14.493,1.037 12.474 2.248 11.304,4.227 C11.156,1.934 10.04 0 10.04,0 C10.04,0 8.921 1.736 8.635,3.841 C7.564,2.015 5.982 0.853 5.982,0.853 C5.982,0.853 5.656 2.893 6.242,4.934 C4.527,3.694 2.611 3.268 2.611,3.268 C2.611,3.268 3.134 5.266 4.493,6.899 C2.423,6.454 0.497 6.835 0.497,6.835 C0.497,6.835 1.782 8.454 3.683,9.401 C1.609,9.827 0 10.951 0,10.951 C0,10.951 1.827 11.916 3.949,12.018 C2.222,13.242 1.202 14.919 1.202,14.919 C1.202,14.919 3.264 15.066 5.247,14.305 C4.159,16.122 3.902 18.067 3.902,18.067 C3.902,18.067 5.847 17.372 7.356,15.877 C7.092,17.977 7.64 19.862 7.64,19.862 C7.64,19.862 9.141 18.442 9.92,16.467 C10.524,18.495 11.785 20 11.785,20 C11.785,20 12.586 18.096 12.504,15.974 C13.874,17.587 15.634 18.458 15.634,18.458 C15.634,18.458 15.601 16.392 14.671,14.483 C16.575,15.408 18.536 15.496 18.536,15.496 C18.536,15.496 17.674 13.618 16.054,12.245 Z",
            // "shape_editor": "shape_other_4",
            "icon": "iconbianjiye-54"
        },
        setPath: function () {},
        getPath: function () {},
    },
    shape_other_5: {
        material: 'other',
        shape: {
            "id": "shape_53",
            "type": "shape",
            "group": null,
            "lock": false,
            "opacity": 1,
            "translate": "0,0",
            "rotate": "0,50,50",
            "scale": "1,1",
            "width": 18,
            "height": 15,
            "border_c": null,
            "border_w": null,
            "border_s": null,
            "background": "",
            "d": "M18,18.238 C11.659,25 5.727 10.943 0,18.238 L0,7.295 C5.727,0 11.659 14.057 18,7.295 L18,18.238 Z",
            // "shape_editor": "shape_other_5",
            "icon": "iconbianjiye-55"
        },
        setPath: function () {},
        getPath: function () {},
    },
    shape_other_6: {
        material: 'other',
        shape: {
            "id": "shape_54",
            "type": "shape",
            "group": null,
            "lock": false,
            "opacity": 1,
            "translate": "0,0",
            "rotate": "0,50,50",
            "scale": "1,1",
            "width": 17,
            "height": 19,
            "border_c": null,
            "border_w": null,
            "border_s": null,
            "background": "",
            "d": "M0.673,0 L0,0 L0,19 L0.673,19 L0.673,8.319 L17,4.16 L0.673,0 Z",
            // "shape_editor": "shape_other_6",
            "icon": "iconbianjiye-56"
        },
        setPath: function () {},
        getPath: function () {},
    },
    shape_other_7: {
        material: 'other',
        shape: {
            "id": "shape_55",
            "type": "shape",
            "group": null,
            "lock": false,
            "opacity": 1,
            "translate": "0,0",
            "rotate": "0,50,50",
            "scale": "1,1",
            "width": 22.822000000000003,
            "height": 19.734,
            "border_c": null,
            "border_w": null,
            "border_s": null,
            "background": "",
            "d": "M19.144,15.144 C13.241,13.726 13.381 19.734 7.256,16.103 C4.326,14.366 1.016 16.104 0,17.044 L3.678,3.318 C4.694,2.378 8.004 0.64 10.934,2.377 C17.058,6.008 16.919 0 22.822,1.418 L19.144,15.144 Z",
            // "shape_editor": "shape_other_7",
            "icon": "iconbianjiye-57"
        },
        setPath: function () {},
        getPath: function () {},
    },
    shape_other_8: {
        material: 'other',
        shape: {
            "id": "shape_56",
            "type": "shape",
            "group": null,
            "lock": false,
            "opacity": 1,
            "translate": "0,0",
            "rotate": "0,50,50",
            "scale": "1,1",
            "width": 24,
            "height": 24,
            "border_c": null,
            "border_w": null,
            "border_s": null,
            "background": "",
            "d": "M14.27,8.129 L20.485,3.515 L15.871,9.73 C15.483,9.069 14.931 8.517 14.27,8.129 Z M10.868,7.656 L12,0 L13.132,7.656 C12.77,7.562 12.391 7.511 12,7.511 C11.609,7.511 11.23 7.562 10.868,7.656 Z M8.129,9.73 L3.515,3.515 L9.729,8.129 C9.069,8.517 8.517 9.069 8.129,9.73 Z M7.512,12 C7.512,12.391 7.562 12.77 7.656,13.132 L0,12 L7.656,10.868 C7.562,11.23 7.512 11.609 7.512,12 Z M9.73,15.871 L3.515,20.486 L8.129,14.27 C8.517,14.931 9.07 15.483 9.73,15.871 Z M13.132,16.344 L12,24 L10.868,16.344 C11.23,16.438 11.609 16.488 12,16.488 C12.391,16.488 12.77 16.438 13.132,16.344 Z M12,15.692 C9.961,15.692 8.308 14.039 8.308,12 C8.308,9.961 9.961 8.308 12,8.308 C14.039,8.308 15.692 9.961 15.692,12 C15.692,14.039 14.039 15.692 12,15.692 Z M15.871,14.27 L20.485,20.485 L14.27,15.871 C14.931,15.483 15.483 14.931 15.871,14.27 Z M24,12 L16.344,13.132 C16.438,12.77 16.488 12.391 16.488,12 C16.488,11.609 16.438 11.23 16.344,10.868 L24,12 Z",
            "icon": "iconbianjiye-58"
        },
    },
    shape_other_9: {
        material: 'other',
        shape: {
            "id": "shape_57",
            "type": "shape",
            "group": null,
            "lock": false,
            "opacity": 1,
            "translate": "0,0",
            "rotate": "0,50,50",
            "scale": "1,1",
            "width": 20,
            "height": 16,
            "border_c": null,
            "border_w": null,
            "border_s": null,
            "background": "",
            "d": "M4.388,3.804 C3.826,1.563 8.622 1.199 8.877,2.866 C10.102,0 14.031 1.199 13.673,3.283 C16.377,2.137 17.959 3.961 16.939,5.837 C20,6.202 18.469 9.485 17.602,9.798 C18.571,12.821 15.561 13.238 14.592,12.612 C14.081,15.583 10.612 14.332 10.204,12.769 C8.367,16 6.173 13.498 6.173,12.612 C3.418,13.707 2.143 12.039 2.5,10.788 C0.357,10.736 0 7.922 1.684,7.088 C0,4.899 2.755 2.658 4.388,3.804 Z",
            "icon": "iconbianjiye-59"
        },
    },
    shape_other_10: {
        material: 'other',
        shape: {
            "id": "shape_58",
            "type": "shape",
            "group": null,
            "lock": false,
            "opacity": 1,
            "translate": "0,0",
            "rotate": "0,50,50",
            "scale": "1,1",
            "width": 18,
            "height": 20,
            "border_c": null,
            "border_w": null,
            "border_s": null,
            "background": "",
            "d": "M9.127,14.504 C9.021,15.988 8.759 17.857 8.134,19.326 C7.846,20 6.041 19.82 7.058,18.947 C7.751,18.351 8.151 16.388 8.252,14.572 C3.072,14.989 0.836 11.323 0,9.588 C0.202,9.182 1.639 6.527 5.506,7.244 C5.4,3.835 6.458 2.024 9,0 C11.541,2.024 12.6 3.835 12.494,7.244 C16.361,6.527 17.798 9.182 18,9.588 C17.131,11.391 14.752 15.279 9.127,14.504 Z",
            "icon": "iconbianjiye-60"
        },
    },
    shape_other_11: {
        material: 'other',
        shape: {
            "id": "shape_59",
            "type": "shape",
            "group": null,
            "lock": false,
            "opacity": 1,
            "translate": "0,0",
            "rotate": "0,50,50",
            "scale": "1,1",
            "width": 18,
            "height": 20,
            "border_c": null,
            "border_w": null,
            "border_s": null,
            "background": "",
            "d": "M9.499,1.432 C18,1.794 17.923 10.458 17.923,10.458 C16.379,9.04 15.079 9.04 13.779,10.458 C12.219,9.04 11.179 9.04 9.749,10.458 L9.749,16.003 C10.009,18.84 7.539 20 5.59,18.711 C4.825,18.205 4.94 16.39 5.85,16.647 C7.799,19.097 7.913 16.132 7.913,16.132 L7.913,10.458 C6.63,9.04 5.2 9.04 3.9,10.458 C2.99,9.169 1.69 8.911 0,10.458 C0,10.458 0.105 2.117 8.19,1.547 L8.709,0 L9.499,1.432 Z",
            "icon": "iconbianjiye-61"
        },
    },
    shape_other_12: {
        material: 'other',
        shape: {
            "id": "shape_60",
            "type": "shape",
            "group": null,
            "lock": false,
            "opacity": 1,
            "translate": "0,0",
            "rotate": "0,50,50",
            "scale": "1,1",
            "width": 20,
            "height": 18,
            "border_c": null,
            "border_w": null,
            "border_s": null,
            "background": "",
            "d": "M10,18 C11.634,17.018 19.519 16.135 18.846,5.827 C18.706,3.688 20 3.177 20,3.177 L19.231,1.017 C16.923,2.392 12.5 2.338 10,0 C7.5,2.338 3.077 2.392 0.769,1.017 L0,3.177 C0,3.177 1.294 3.688 1.154,5.827 C0.481,16.135 8.365 17.018 10,18 Z",
            "icon": "iconbianjiye-62"
        },
    },
    shape_other_13: {
        material: 'other',
        shape: {
            "id": "shape_61",
            "type": "shape",
            "group": null,
            "lock": false,
            "opacity": 1,
            "translate": "0,0",
            "rotate": "0,50,50",
            "scale": "1,1",
            "width": 20,
            "height": 14,
            "border_c": null,
            "border_w": null,
            "border_s": null,
            "background": "",
            "d": "M20,5.685 C20,2.545 15.523 0 10,0 C4.477,0 0 2.545 0,5.685 C0,8.372 3.279 10.622 7.686,11.216 C7.327,12.221 6.729 13.406 5.79,13.997 C7.599,14 9.383 12.598 10.606,11.359 C15.846,11.181 20 8.709 20,5.685 Z",
            // "shape_editor": "shape_other_13",
            "icon": "iconbianjiye-63"
        },
        setPath: function () {},
        getPath: function () {},
    },
    shape_other_14: {
        material: 'other',
        shape: {
            "id": "shape_62",
            "type": "shape",
            "group": null,
            "lock": false,
            "opacity": 1,
            "translate": "0,0",
            "rotate": "0,50,50",
            "scale": "1,1",
            "width": 24,
            "height": 17,
            "border_c": null,
            "border_w": null,
            "border_s": null,
            "background": "",
            "d": "M20.504,5.71 C21.982,2.773 14.795 0 13.168,3.002 C12.174,0.484 5.679 0.966 6.27,3.551 C4.114,1.922 0.026 4.639 1.787,7.508 C0,9.185 2.277 13.895 5.46,12.574 C6.425,15.711 12.149 15.594 13.576,14.462 C14.377,15.539 13.932 16.172 12.743,16.903 C14.575,17 15.496 16.139 16.456,14.538 C18.542,14.503 21.001 13.612 20.703,11.566 C24,11.653 23.638 5.459 20.504,5.71 Z",
            // "shape_editor": "shape_other_14",
            "icon": "iconbianjiye-64"
        },
        setPath: function () {},
        getPath: function () {},
    },
    shape_other_15: {
        material: 'other',
        shape: {
            "id": "shape_63",
            "type": "shape",
            "group": null,
            "lock": false,
            "opacity": 1,
            "translate": "0,0",
            "rotate": "0,50,50",
            "scale": "1,1",
            "width": 20,
            "height": 14,
            "border_c": null,
            "border_w": null,
            "border_s": null,
            "background": "",
            "d": "M16.8,0 L3.2,0 C1.433,0 0 1.393 0,3.111 L0,7.933 C0,9.652 1.433 11.045 3.2,11.045 L14.142,11.045 L13.44,14 L15.872,11.045 L16.8,11.045 C18.567,11.045 20 9.652 20,7.933 L20,3.111 C20,1.393 18.567 0 16.8,0 Z",
            // "shape_editor": "shape_other_15",
            "icon": "iconbianjiye-65"
        },
        setPath: function () {},
        getPath: function () {},
    },
    shape_other_16: {
        material: 'other',
        shape: {
            "id": "shape_64",
            "type": "shape",
            "group": null,
            "lock": false,
            "opacity": 1,
            "translate": "0,0",
            "rotate": "0,50,50",
            "scale": "1,1",
            "width": 20,
            "height": 11,
            "border_c": null,
            "border_w": null,
            "border_s": null,
            "background": "",
            "d": "M18.711,5.5 C18.711,7.26 20 11 20,11 C20,11 15.555 9.739 10,9.739 C4.444,9.739 0 11 0,11 C0,11 1.289 7.26 1.289,5.5 C1.289,3.74 0 0 0,0 C0,0 4.444 1.261 10,1.261 C15.555,1.261 20 0 20,0 C20,0 18.711 3.74 18.711,5.5 Z",
            // "shape_editor": "shape_other_16",
            "icon": "iconbianjiye-66"
        },
        setPath: function () {},
        getPath: function () {},
    },
    shape_other_17: {
        material: 'other',
        shape: {
            "id": "shape_65",
            "type": "shape",
            "group": null,
            "lock": false,
            "opacity": 1,
            "translate": "0,0",
            "rotate": "0,50,50",
            "scale": "1,1",
            "width": 20,
            "height": 11,
            "border_c": null,
            "border_w": null,
            "border_s": null,
            "background": "",
            "d": "M17.778,5.5 L20,11 L10,9.167 L0,11 L2.178,5.5 L0,0 L10,1.797 L20,0 L17.778,5.5 Z",
            // "shape_editor": "shape_other_17",
            "icon": "iconbianjiye-67"
        },
        setPath: function () {},
        getPath: function () {},
    },
    shape_other_18: {
        material: 'other',
        shape: {
            "id": "shape_66",
            "type": "shape",
            "group": null,
            "lock": false,
            "opacity": 1,
            "translate": "0,0",
            "rotate": "0,50,50",
            "scale": "1,1",
            "width": 20,
            "height": 19,
            "border_c": null,
            "border_w": null,
            "border_s": null,
            "background": "",
            "d": "M14.441,11.615 L20,18.966 L19.967,19 L13.059,14.233 L12.96,16.851 L11.414,14.972 L8.487,18.9 L8.355,14.535 L0.756,16.281 L0.724,16.247 L7.072,11.313 L4.211,11.514 L4.178,11.48 L6.645,10.037 L0,6.411 L0.033,6.378 L8.256,8.258 L6.185,6.009 L8.421,6.411 L6.315,0.034 L6.348,0 L11.579,5.572 L12.73,3.927 L12.993,6.277 L16.776,1.779 L16.809,1.812 L14.145,8.627 L18.881,8.09 L18.914,8.124 L15,9.836 L18.355,12.118 L18.322,12.152 L14.441,11.615 Z",
            "icon": "iconbianjiye-68"
        },
        setPath: function () {},
        getPath: function () {},
    },
    shape_other_19: {
        material: 'other',
        shape: {
            "id": "shape_other_19",
            "type": "shape",
            "group": null,
            "lock": false,
            "opacity": 1,
            "translate": "0,0",
            "rotate": "0,50,50",
            "scale": "1,1",
            "width": 16.5,
            "height": 16.5,
            "border_c": null,
            "border_w": null,
            "border_s": null,
            "background": "",
            "d": "M11.303,0.500 L11.099,4.474 L14.258,3.761 L12.933,6.003 L16.296,6.513 L13.545,8.245 L16.500,10.283 L13.035,10.080 L14.054,14.054 C14.054,14.054 11.026,11.265 10.997,11.303 C10.967,11.340 10.385,15.175 10.385,15.175 L8.449,11.608 L6.920,16.500 L6.309,12.118 L4.067,13.545 L4.780,10.793 L0.602,11.303 L3.353,9.264 L0.500,6.818 L3.965,6.105 L0.908,2.232 L6.003,5.188 L6.717,2.131 L8.551,4.780 L11.303,0.500 Z",
            "icon": "iconbianjiye2-47"
        },
    },
    shape_other_20: {
        material: 'other',
        shape: {
            "id": "shape_other_20",
            "type": "shape",
            "group": null,
            "lock": false,
            "opacity": 1,
            "translate": "0,0",
            "rotate": "0,50,50",
            "scale": "1,1",
            "width": 16.5,
            "height": 16.5,
            "border_c": null,
            "border_w": null,
            "border_s": null,
            "background": "",
            "d": "M11.167,0.500 L11.167,4.906 L13.485,2.819 L12.326,5.601 L16.500,5.370 L13.022,7.225 L13.949,8.848 L12.326,9.775 L14.413,12.326 L11.167,10.935 L11.167,13.485 L9.312,12.094 L9.080,14.645 L7.688,13.254 L6.761,15.109 L6.065,13.717 L3.978,16.500 L4.210,13.949 L1.196,13.717 L3.051,12.094 L0.500,10.007 L3.514,9.312 L0.964,6.529 L4.442,6.529 L3.746,3.283 L6.761,5.370 L7.457,2.123 L9.080,3.283 L11.167,0.500 Z",
            "icon": "iconbianjiye2-48"
        },
    },
    shape_other_21: {
        material: 'other',
        shape: {
            "id": "shape_other_21",
            "type": "shape",
            "group": null,
            "lock": false,
            "opacity": 1,
            "translate": "0,0",
            "rotate": "0,50,50",
            "scale": "1,1",
            "width": 18.5,
            "height": 18.5,
            "border_c": null,
            "border_w": null,
            "border_s": null,
            "background": "",
            "d": "M0.499,9.500 C0.499,9.500 4.523,8.851 6.815,6.559 C9.022,4.352 9.500,0.499 9.500,0.499 C9.500,0.499 10.153,4.528 12.447,6.822 C14.652,9.026 18.501,9.500 18.501,9.500 C18.501,9.500 14.523,10.103 12.253,12.373 C10.023,14.603 9.500,18.501 9.500,18.501 C9.500,18.501 8.985,14.611 6.759,12.385 C4.485,10.111 0.499,9.500 0.499,9.500 Z",
            "icon": "iconbianjiye2-49"
        },
    },
    shape_other_22: {
        material: 'other',
        shape: {
            "id": "shape_other_22",
            "type": "shape",
            "group": null,
            "lock": false,
            "opacity": 1,
            "translate": "0,0",
            "rotate": "0,50,50",
            "scale": "1,1",
            "width": 18,
            "height": 18,
            "border_c": null,
            "border_w": null,
            "border_s": null,
            "background": "",
            "d": "M11.107,6.807 L18.000,6.807 L12.414,11.030 L14.571,18.000 L9.000,13.613 L3.429,18.000 L5.586,11.030 L0,6.807 L6.893,6.807 L9.000,0 L11.107,6.807 Z",
            "icon": "iconbianjiye2-50"
        },
    },
    shape_other_23: {
        material: 'other',
        shape: {
            "id": "shape_other_23",
            "type": "shape",
            "group": null,
            "lock": false,
            "opacity": 1,
            "translate": "0,0",
            "rotate": "0,50,50",
            "scale": "1,1",
            "width": 16,
            "height": 17,
            "border_c": null,
            "border_w": null,
            "border_s": null,
            "background": "",
            "d": "M13.230,8.500 L16.000,13.000 L10.461,13.000 L8.000,17.000 L5.539,13.000 L0,13.000 L2.770,8.500 L0,4.000 L5.539,4.001 L8.000,0 L10.461,4.001 L16.000,4.001 L13.230,8.500 Z",
            "icon": "iconbianjiye2-51"
        },
    },
    shape_other_24: {
        material: 'other',
        shape: {
            "id": "shape_other_24",
            "type": "shape",
            "group": null,
            "lock": false,
            "opacity": 1,
            "translate": "0,0",
            "rotate": "0,50,50",
            "scale": "1,1",
            "width": 16,
            "height": 16,
            "border_c": null,
            "border_w": null,
            "border_s": null,
            "background": "",
            "d": "M13.514,7.163 L16.000,10.392 L12.323,12.211 L11.429,16.000 L8.050,14.351 L4.506,16.000 L3.578,12.071 L0,10.227 L2.415,7.140 L1.469,3.134 L5.548,3.134 L8.000,0 L10.413,3.134 L14.465,3.134 L13.514,7.163 Z",
            "icon": "iconbianjiye2-52"
        },
    },
    shape_other_25: {
        material: 'other',
        shape: {
            "id": "shape_other_25",
            "type": "shape",
            "group": null,
            "lock": false,
            "opacity": 1,
            "translate": "0,0",
            "rotate": "0,50,50",
            "scale": "1,1",
            "width": 16.5,
            "height": 16.5,
            "border_c": null,
            "border_w": null,
            "border_s": null,
            "background": "",
            "d": "M13.657,5.657 L16.000,8.000 L13.657,10.343 L13.657,13.657 L10.343,13.657 L8.000,16.000 L5.657,13.657 L2.343,13.657 L2.343,10.343 L0,8.000 L2.343,5.657 L2.343,2.343 L5.657,2.343 L8.000,0 L10.343,2.343 L13.657,2.343 L13.657,5.657 Z",
            "icon": "iconbianjiye2-53"
        },
    },
    shape_other_26: {
        material: 'other',
        shape: {
            "id": "shape_other_26",
            "type": "shape",
            "group": null,
            "lock": false,
            "opacity": 1,
            "translate": "0,0",
            "rotate": "0,50,50",
            "scale": "1,1",
            "width": 228,
            "height": 165,
            "border_c": null,
            "border_w": null,
            "border_s": null,
            "background": "",
            "d": " M 0 0 L 37.786 0 L 94.465 0 L 226.716 0 L 226.716 85.412 L 226.716 122.017 L 226.716 146.421 L 94.465 146.421 L 66.126 164.723 L 37.786 146.421 L 0 146.421 L 0 122.017 L 0 85.412 Z",
            "icon": "iconbianjiye2-571"
        },
    },
    shape_other_27: {
        material: 'other',
        shape: {
            "id": "shape_other_27",
            "type": "shape",
            "group": null,
            "lock": false,
            "opacity": 1,
            "translate": "0,0",
            "rotate": "0,50,50",
            "scale": "1,1",
            "width": 192,
            "height": 150,
            "border_c": null,
            "border_w": null,
            "border_s": null,
            "background": "",
            "d": " M 0 22.235 C 0 9.955 9.955 0 22.235 0 L 31.941 0 L 79.853 0 L 169.413 0 C 181.692 0 191.647 9.955 191.647 22.235 L 191.647 77.824 L 191.647 111.177 L 191.647 111.177 C 191.647 123.457 181.692 133.412 169.413 133.412 L 79.853 133.412 L 55.898 150.088 L 31.941 133.412 L 22.235 133.412 C 9.955 133.412 0 123.457 0 111.177 L 0 111.177 L 0 77.824 Z",
            "icon": "iconbianjiye2-581"
        },
    },
    shape_other_28: {
        material: 'other',
        shape: {
            "id": "shape_other_28",
            "type": "shape",
            "group": null,
            "lock": false,
            "opacity": 1,
            "translate": "0,0",
            "rotate": "0,50,50",
            "scale": "1,1",
            "width": 16,
            "height": 16,
            "border_c": null,
            "border_w": null,
            "border_s": null,
            "background": "",
            "d": "M7.000,13.000 L5.000,16.000 L3.432,13.297 C1.945,12.013 0,9.119 0,7.000 C0,3.134 3.137,0.152 7.000,0 C13.726,0 16.138,2.760 16.000,7.000 C15.822,12.450 10.866,13.000 7.000,13.000 Z",
            "icon": "iconbianjiye2-591"
        },
    },
    shape_other_29: {
        material: 'other',
        shape: {
            "id": "shape_other_29",
            "type": "shape",
            "group": null,
            "lock": false,
            "opacity": 1,
            "translate": "0,0",
            "rotate": "0,50,50",
            "scale": "1,1",
            "width": 16.5,
            "height": 15.5,
            "border_c": null,
            "border_w": null,
            "border_s": null,
            "background": "",
            "d": "M16.435,1.549 C16.321,1.261 16.051,1.075 15.748,1.075 L13.578,1.075 C13.573,0.714 13.555,0.500 13.555,0.500 L8.500,0.500 L3.445,0.500 C3.445,0.500 3.427,0.714 3.422,1.075 L1.252,1.075 C0.949,1.075 0.679,1.261 0.565,1.549 C0.270,2.292 1.010,5.226 2.348,6.415 C2.839,6.850 3.433,7.120 4.100,7.217 C4.283,7.280 4.426,7.417 4.412,7.525 C4.388,7.705 4.042,7.736 4.187,8.089 C4.348,8.482 5.233,8.284 5.369,7.658 C5.836,8.167 6.414,8.591 7.127,8.871 C8.051,9.233 7.402,13.068 7.402,13.464 C7.402,13.464 5.928,13.464 5.668,13.844 C5.507,14.080 5.538,14.352 5.538,14.352 C5.538,14.352 4.584,14.648 4.584,15.029 C4.584,15.410 4.584,15.500 4.584,15.500 L8.500,15.500 L12.416,15.500 C12.416,15.500 12.416,15.410 12.416,15.029 C12.416,14.648 11.462,14.352 11.462,14.352 C11.462,14.352 11.494,14.080 11.332,13.844 C11.072,13.464 9.598,13.464 9.598,13.464 C9.598,13.068 8.949,9.233 9.873,8.871 C10.587,8.591 11.164,8.167 11.631,7.658 C11.767,8.284 12.653,8.482 12.813,8.089 C12.958,7.736 12.612,7.705 12.588,7.525 C12.574,7.417 12.717,7.280 12.900,7.217 C13.568,7.120 14.161,6.850 14.652,6.415 C15.991,5.226 16.730,2.292 16.435,1.549 ZM1.252,1.736 C1.481,1.736 2.763,1.736 3.428,1.736 C3.469,2.994 3.693,4.981 4.605,6.595 C3.899,6.584 3.294,6.361 2.805,5.925 C1.538,4.800 0.942,1.736 1.252,1.736 ZM14.196,5.925 C13.706,6.361 13.102,6.584 12.395,6.595 C13.307,4.981 13.532,2.994 13.572,1.736 C14.236,1.736 15.520,1.736 15.748,1.736 C16.058,1.736 15.463,4.800 14.196,5.925 Z",
            "icon": "iconbianjiye2-601"
        },
    },
    shape_other_30: {
        material: 'other',
        shape: {
            "id": "shape_other_30",
            "type": "shape",
            "group": null,
            "lock": false,
            "opacity": 1,
            "translate": "0,0",
            "rotate": "0,50,50",
            "scale": "1,1",
            "width": 14,
            "height": 16,
            "border_c": null,
            "border_w": null,
            "border_s": null,
            "background": "",
            "d": "M14.002,0.005 L4.052,1.735 L4.052,1.739 L4.052,12.750 C3.787,12.508 3.344,12.436 2.828,12.436 C2.238,12.436 1.530,12.722 0.970,13.165 C0.410,13.593 -0.003,14.179 -0.003,14.764 C-0.003,15.136 0.159,15.450 0.439,15.664 C0.704,15.878 1.088,16.007 1.501,16.007 C2.150,16.007 2.887,15.750 3.447,15.321 C4.023,14.893 4.421,14.307 4.421,13.665 L4.421,3.022 L13.637,1.420 L13.637,11.084 C13.372,10.841 12.929,10.770 12.413,10.770 C11.823,10.770 11.116,11.056 10.555,11.498 C9.995,11.927 9.582,12.512 9.582,13.098 C9.582,13.469 9.744,13.784 10.024,13.998 C10.290,14.212 10.673,14.341 11.086,14.341 C11.735,14.341 12.472,14.084 13.033,13.655 C13.608,13.227 14.006,12.641 14.006,11.998 L14.002,0.005 Z",
            "icon": "iconbianjiye2-61"
        },
    },
    shape_other_31: {
        material: 'other',
        shape: {
            "id": "shape_other_31",
            "type": "shape",
            "group": null,
            "lock": false,
            "opacity": 1,
            "translate": "0,0",
            "rotate": "0,50,50",
            "scale": "1,1",
            "width": 16.5,
            "height": 14.5,
            "border_c": null,
            "border_w": null,
            "border_s": null,
            "background": "",
            "d": "M16.418,1.279 C16.127,-0.269 13.994,0.795 12.055,1.859 C10.116,2.923 8.824,6.115 8.824,6.115 C8.824,6.115 8.600,6.185 8.743,5.874 C8.870,5.598 8.791,5.458 8.688,5.388 L9.582,3.317 C9.618,3.289 9.664,3.221 9.701,3.135 C9.754,3.011 9.769,2.899 9.733,2.884 C9.698,2.868 9.626,2.956 9.573,3.080 C9.536,3.166 9.518,3.246 9.522,3.292 L8.632,5.357 C8.542,5.317 8.459,5.320 8.501,5.325 C8.542,5.331 8.462,5.329 8.373,5.366 L7.479,3.292 C7.484,3.246 7.466,3.166 7.429,3.080 C7.376,2.956 7.304,2.868 7.268,2.884 C7.233,2.899 7.247,3.011 7.300,3.135 C7.337,3.221 7.383,3.289 7.420,3.317 L8.316,5.395 C8.213,5.461 8.131,5.595 8.258,5.874 C8.401,6.185 8.178,6.115 8.178,6.115 C8.178,6.115 6.885,2.923 4.946,1.859 C3.007,0.795 0.875,-0.269 0.584,1.279 C0.293,2.827 0.842,2.827 1.004,3.504 C1.165,4.181 1.327,6.051 1.876,6.502 C2.426,6.954 4.655,6.986 4.655,6.986 C4.655,6.986 2.167,8.340 2.200,9.146 C2.232,9.952 2.910,14.434 4.300,14.499 C5.689,14.563 6.594,12.467 6.982,11.468 C7.370,10.468 7.854,8.437 8.048,8.373 C8.242,8.308 8.081,9.695 8.210,10.017 C8.339,10.339 8.501,10.299 8.501,10.299 C8.501,10.299 8.662,10.339 8.792,10.017 C8.921,9.695 8.759,8.308 8.953,8.373 C9.147,8.437 9.632,10.468 10.019,11.468 C10.407,12.467 11.312,14.563 12.702,14.499 C14.091,14.434 14.770,9.952 14.802,9.146 C14.834,8.340 12.346,6.986 12.346,6.986 C12.346,6.986 14.576,6.954 15.125,6.502 C15.674,6.051 15.836,4.181 15.998,3.504 C16.159,2.827 16.708,2.827 16.418,1.279 Z",
            "icon": "iconbianjiye2-62"
        },
    },
    shape_other_32: {
        material: 'other',
        shape: {
            "id": "shape_other_32",
            "type": "shape",
            "group": null,
            "lock": false,
            "opacity": 1,
            "translate": "0,0",
            "rotate": "0,50,50",
            "scale": "1,1",
            "width": 16,
            "height": 16,
            "border_c": null,
            "border_w": null,
            "border_s": null,
            "background": "",
            "d": "M14.932,11.975 C14.230,13.246 13.246,14.232 11.980,14.933 C10.712,15.635 9.388,15.986 8.005,15.986 C6.622,15.986 5.297,15.635 4.031,14.933 C2.763,14.232 1.777,13.246 1.072,11.975 C0.367,10.705 0.014,9.381 0.014,8.006 C0.014,6.615 0.372,5.281 1.088,3.999 C1.804,2.719 2.800,1.735 4.078,1.047 C5.355,0.358 6.665,0.014 8.005,0.014 C9.346,0.014 10.654,0.358 11.932,1.047 C13.209,1.735 14.204,2.719 14.917,3.999 C15.630,5.281 15.986,6.615 15.986,8.006 C15.986,9.381 15.635,10.705 14.932,11.975 ZM13.768,4.666 C13.172,3.598 12.341,2.775 11.276,2.201 C10.210,1.626 9.120,1.338 8.005,1.338 C6.883,1.338 5.791,1.626 4.730,2.201 C3.668,2.775 2.837,3.598 2.238,4.666 C1.638,5.735 1.338,6.849 1.338,8.005 C1.338,9.156 1.633,10.258 2.221,11.313 C2.811,12.367 3.635,13.189 4.693,13.779 C5.751,14.367 6.855,14.662 8.005,14.662 C9.155,14.662 10.260,14.367 11.318,13.779 C12.376,13.189 13.198,12.367 13.784,11.313 C14.369,10.258 14.662,9.156 14.662,8.005 C14.662,6.849 14.364,5.735 13.768,4.666 ZM7.987,11.390 C9.203,11.390 10.319,10.534 10.762,9.261 L12.209,9.765 C11.551,11.653 9.855,12.922 7.987,12.922 C5.498,12.922 3.474,10.733 3.474,8.043 C3.474,5.354 5.498,3.166 7.987,3.166 C9.556,3.166 10.989,4.025 11.819,5.466 L10.491,6.231 C9.938,5.271 9.002,4.698 7.987,4.698 C6.343,4.698 5.006,6.199 5.006,8.043 C5.006,9.888 6.343,11.390 7.987,11.390 Z",
            "icon": "iconbianjiye2-63"
        },
    },
    shape_other_33: {
        material: 'other',
        shape: {
            "id": "shape_other_33",
            "type": "shape",
            "group": null,
            "lock": false,
            "opacity": 1,
            "translate": "0,0",
            "rotate": "0,50,50",
            "scale": "1,1",
            "width": 16,
            "height": 16,
            "border_c": null,
            "border_w": null,
            "border_s": null,
            "background": "",
            "d": "M14.932,11.975 C14.230,13.246 13.246,14.232 11.980,14.933 C10.712,15.635 9.388,15.986 8.005,15.986 C6.622,15.986 5.297,15.635 4.031,14.933 C2.763,14.232 1.777,13.246 1.072,11.975 C0.367,10.705 0.014,9.381 0.014,8.006 C0.014,6.615 0.372,5.281 1.088,3.999 C1.804,2.719 2.800,1.735 4.078,1.047 C5.355,0.358 6.665,0.014 8.005,0.014 C9.346,0.014 10.654,0.358 11.932,1.047 C13.209,1.735 14.204,2.719 14.917,3.999 C15.630,5.281 15.986,6.615 15.986,8.006 C15.986,9.381 15.635,10.705 14.932,11.975 ZM13.768,4.666 C13.172,3.598 12.341,2.775 11.276,2.201 C10.210,1.626 9.120,1.338 8.005,1.338 C6.883,1.338 5.791,1.626 4.730,2.201 C3.668,2.775 2.837,3.598 2.238,4.666 C1.638,5.735 1.338,6.849 1.338,8.005 C1.338,9.156 1.633,10.258 2.221,11.313 C2.811,12.367 3.635,13.189 4.693,13.779 C5.751,14.367 6.855,14.662 8.005,14.662 C9.155,14.662 10.260,14.367 11.318,13.779 C12.376,13.189 13.198,12.367 13.784,11.313 C14.369,10.258 14.662,9.156 14.662,8.005 C14.662,6.849 14.364,5.735 13.768,4.666 ZM10.595,10.070 C10.887,11.316 11.100,12.178 11.272,12.522 L10.079,12.522 C9.933,12.269 9.735,11.502 9.496,10.389 C9.231,9.156 8.741,8.692 7.694,8.653 L6.607,8.653 L6.607,12.522 L5.454,12.522 L5.454,3.723 C6.037,3.603 6.886,3.524 7.667,3.524 C8.900,3.524 9.708,3.762 10.264,4.266 C10.703,4.650 10.967,5.260 10.967,5.962 C10.967,7.128 10.212,7.910 9.284,8.228 L9.284,8.268 C9.961,8.506 10.371,9.143 10.595,10.070 ZM9.801,6.081 C9.801,4.929 8.966,4.424 7.746,4.424 C7.190,4.424 6.806,4.477 6.607,4.532 L6.607,7.778 L7.787,7.778 C9.019,7.778 9.801,7.101 9.801,6.081 Z",
            "icon": "iconbianjiye2-64"
        },
    },
    shape_other_34: {
        material: 'other',
        shape: {
            "id": "shape_other_34",
            "type": "shape",
            "group": null,
            "lock": false,
            "opacity": 1,
            "translate": "0,0",
            "rotate": "0,50,50",
            "scale": "1,1",
            "width": 50,
            "height": 50,
            "border_c": "rgb(0,0,0)",
            "border_w": 2,
            "border_s": "solid",
            "background": "transparent",
            "d": "M10 0 A10 5 0 0 0 0 5 L0 45 A10 5 0 0 0 10 50 M40 0 A10 5 0 0 1 50 5 L50 45 A10 5 0 0 1 40 50",
            "shape_editor": "shape_other_34",
            "icon": "iconbianjiye2-65"
        },
        setPath: function(w, h, r1) {
            w = Number(w.toFixed(3));
            h = Number(h.toFixed(3));
            r1 = Number(r1.toFixed(3));
            let min = w < h ? w : h;
            let a = Number((min / 5).toFixed(3));
            if (r1 < 0) {
                r1 = 0;
            } else if (r1 > (h / 2)) {
                r1 = h / 2;
            }
            return `M${a} 0 A${a} ${r1} 0 0 0 0 ${r1} L0 ${h - r1} A${a} ${r1} 0 0 0 ${a} ${h} M${w - a} 0 A${a} ${r1} 0 0 1 ${w} ${r1} L${w} ${h - r1} A${a} ${r1} 0 0 1 ${w - a} ${h}`;
        },
        getPath: function(d) {
            let obj = {
                w: 0,
                h: 0,
                r1: 0,
            };
            // 分解 A 命令
            let Acommand = commandDecompose(d, 'A');
            if (Acommand) {
                let a = commandValueDecompose(Acommand[0]);
                obj.r1 = Number(a[1]);
                let h = commandValueDecompose(Acommand[1]);
                obj.h = Number(h[6]);
            }
            let Lcommand = commandDecompose(d, 'L');
            if (Lcommand) {
                let w = commandValueDecompose(Lcommand[1]);
                obj.w = Number(w[0]);
            }
            return obj;
        },
    },
    shape_other_35: {
        material: 'other',
        shape: {
            "id": "shape_other_35",
            "type": "shape",
            "group": null,
            "lock": false,
            "opacity": 1,
            "translate": "0,0",
            "rotate": "0,50,50",
            "scale": "1,1",
            "width": 50,
            "height": 50,
            "border_c": "rgb(0,0,0)",
            "border_w": 2,
            "border_s": "solid",
            "background": "transparent",
            "d": "M10 0 A5 5 0 0 0 5 5 L5 20 A5 5 0 0 1 0 25 A5 5 0 0 1 5 30 L5 45 A5 5 0 0 0 10 50 M40 0 A5 5 0 0 1 45 5 L45 20 A5 5 0 0 0 50 25 A5 5 0 0 0 45 30 L45 45 A5 5 0 0 1 40 50",
            "shape_editor": "shape_other_35",
            "icon": "iconbianjiye2-66"
        },
        setPath: function(w, h, r1) {
            w = Number(w.toFixed(3));
            h = Number(h.toFixed(3));
            r1 = Number(r1.toFixed(3));
            let min = w < h ? w : h;
            if (r1 < 0) {
                r1 = 0;
            } else if (r1 > (min / 4)) {
                r1 = min / 4;
            }
            return `M${r1 * 2} 0 A${r1} ${r1} 0 0 0 ${r1} ${r1} L${r1} ${h / 2 - r1} A${r1} ${r1} 0 0 1 0 ${h / 2} A${r1} ${r1} 0 0 1 ${r1} ${h / 2 + r1} L${r1} ${h - r1} A${r1} ${r1} 0 0 0 ${r1 * 2} ${h} M${w - r1 * 2} 0 A${r1} ${r1} 0 0 1 ${w - r1} ${r1} L${w - r1} ${h / 2 - r1} A${r1} ${r1} 0 0 0 ${w} ${h / 2} A${r1} ${r1} 0 0 0 ${w - r1} ${h / 2 + r1} L${w - r1} ${h - r1} A${r1} ${r1} 0 0 1 ${w - r1 * 2} ${h}`;
        },
        getPath: function(d) {
            let obj = {
                w: 0,
                h: 0,
                r1: 0,
            };
            // 分解 A 命令
            let Acommand = commandDecompose(d, 'A');
            if (Acommand) {
                let a = commandValueDecompose(Acommand[0]);
                obj.r1 = Number(a[0]);
                let w = commandValueDecompose(Acommand[5]);
                obj.w = Number(w[5]);
                let h = commandValueDecompose(Acommand[7]);
                obj.h = Number(h[6]);
            }
            return obj;
        },
    },
    shape_other_36: {
        material: 'other',
        shape: {
            "id": "shape_other_36",
            "type": "shape",
            "group": null,
            "lock": false,
            "opacity": 1,
            "translate": "0,0",
            "rotate": "0,50,50",
            "scale": "1,1",
            "width": 50,
            "height": 100,
            "border_c": "rgb(0,0,0)",
            "border_w": 2,
            "border_s": "solid",
            "background": "transparent",
            "d": "M50 0 A50 20 0 0 0 0 20 L0 80 A50 20 0 0 0 50 100",
            "shape_editor": "shape_other_36",
            "icon": "iconqita-85"
        },
        setPath: function(w, h, r1) {
            w = Number(w.toFixed(3));
            h = Number(h.toFixed(3));
            r1 = Number(r1.toFixed(3));
            if (r1 < 0) {
                r1 = 0;
            } else if (r1 > (h / 2)) {
                r1 = h / 2;
            }
            return `M${w} 0 A${w} ${r1} 0 0 0 0 ${r1} L0 ${h - r1} A${w} ${r1} 0 0 0 ${w} ${h}`;
        },
        getPath: function(d) {
            let obj = {
                w: 0,
                h: 0,
                r1: 0,
            };
            // 分解 A 命令
            let Acommand = commandDecompose(d, 'A');
            if (Acommand) {
                let a = commandValueDecompose(Acommand[1]);
                obj.r1 = Number(a[1]);
                obj.w = Number(a[5]);
                obj.h = Number(a[6]);
            }
            return obj;
        },
    },
    shape_other_37: {
        material: 'other',
        shape: {
            "id": "shape_other_37",
            "type": "shape",
            "group": null,
            "lock": false,
            "opacity": 1,
            "translate": "0,0",
            "rotate": "0,50,50",
            "scale": "1,1",
            "width": 50,
            "height": 100,
            "border_c": "rgb(0,0,0)",
            "border_w": 2,
            "border_s": "solid",
            "background": "transparent",
            "d": "M0 0 A50 20 0 0 1 50 20 L50 80 A50 20 0 0 1 0 100",
            "shape_editor": "shape_other_37",
            "icon": "iconqita-84"
        },
        setPath: function(w, h, r1) {
            w = Number(w.toFixed(3));
            h = Number(h.toFixed(3));
            r1 = Number(r1.toFixed(3));
            if (r1 < 0) {
                r1 = 0;
            } else if (r1 > (h / 2)) {
                r1 = h / 2;
            }
            return `M0 0 A${w} ${r1} 0 0 1 ${w} ${r1} L${w} ${h - r1} A${w} ${r1} 0 0 1 0 ${h}`;
        },
        getPath: function(d) {
            let obj = {
                w: 0,
                h: 0,
                r1: 0,
            };
            // 分解 A 命令
            let Acommand = commandDecompose(d, 'A');
            if (Acommand) {
                let a = commandValueDecompose(Acommand[1]);
                obj.r1 = Number(a[1]);
                obj.w = Number(a[0]);
                obj.h = Number(a[6]);
            }
            return obj;
        },
    },
    shape_other_38: {
        material: 'other',
        shape: {
            "id": "shape_other_38",
            "type": "shape",
            "group": null,
            "lock": false,
            "opacity": 1,
            "translate": "0,0",
            "rotate": "0,50,50",
            "scale": "1,1",
            "width": 50,
            "height": 100,
            "border_c": "rgb(0,0,0)",
            "border_w": 2,
            "border_s": "solid",
            "background": "transparent",
            "d": "M50 0 A25 10 0 0 0 25 10 L25 40 A25 10 0 0 1 0 50 A25 10 0 0 1 25 60 L25 90 A25 10 0 0 0 50 100",
            "shape_editor": "shape_other_38",
            "icon": "iconqita-83"
        },
        setPath: function(w, h, r1) {
            w = Number(w.toFixed(3));
            h = Number(h.toFixed(3));
            r1 = Number(r1.toFixed(3));
            if (r1 < 0) {
                r1 = 0;
            } else if (r1 > (h / 4)) {
                r1 = h / 4;
            }
            return `M${w} 0 A${w / 2} ${r1} 0 0 0 ${w / 2} ${r1} L${w / 2} ${h / 2 - r1} A${w / 2} ${r1} 0 0 1 0 ${h / 2} A${w / 2} ${r1} 0 0 1 ${w / 2} ${h / 2 + r1} L${w / 2} ${h - r1} A${w / 2} ${r1} 0 0 0 ${w} ${h}`;
        },
        getPath: function(d) {
            let obj = {
                w: 0,
                h: 0,
                r1: 0,
            };
            // 分解 A 命令
            let Acommand = commandDecompose(d, 'A');
            if (Acommand) {
                let a = commandValueDecompose(Acommand[3]);
                obj.r1 = Number(a[1]);
                obj.w = Number(a[5]);
                obj.h = Number(a[6]);
            }
            return obj;
        },
    },
    shape_other_39: {
        material: 'other',
        shape: {
            "id": "shape_other_39",
            "type": "shape",
            "group": null,
            "lock": false,
            "opacity": 1,
            "translate": "0,0",
            "rotate": "0,50,50",
            "scale": "1,1",
            "width": 50,
            "height": 100,
            "border_c": "rgb(0,0,0)",
            "border_w": 2,
            "border_s": "solid",
            "background": "transparent",
            "d": "M0 0 A25 10 0 0 1 25 10 L25 40 A25 10 0 0 0 50 50 A25 10 0 0 0 25 60 L25 90 A25 10 0 0 1 0 100",
            "shape_editor": "shape_other_39",
            "icon": "iconqita-86"
        },
        setPath: function(w, h, r1) {
            w = Number(w.toFixed(3));
            h = Number(h.toFixed(3));
            r1 = Number(r1.toFixed(3));
            if (r1 < 0) {
                r1 = 0;
            } else if (r1 > (h / 4)) {
                r1 = h / 4;
            }
            return `M0 0 A${w / 2} ${r1} 0 0 1 ${w / 2} ${r1} L${w / 2} ${h / 2 - r1} A${w / 2} ${r1} 0 0 0 ${w} ${h / 2} A${w / 2} ${r1} 0 0 0 ${w / 2} ${h / 2 + r1} L${w / 2} ${h - r1} A${w / 2} ${r1} 0 0 1 0 ${h}`;
        },
        getPath: function(d) {
            let obj = {
                w: 0,
                h: 0,
                r1: 0,
            };
            // 分解 A 命令
            let Acommand = commandDecompose(d, 'A');
            if (Acommand) {
                let a = commandValueDecompose(Acommand[3]);
                obj.r1 = Number(a[1]);
                obj.w = Number(a[0]) * 2;
                obj.h = Number(a[6]);
            }
            return obj;
        },
    },
};
/**
 * 分解path命令
 */
function commandDecompose (d, command) {
    let reg = new RegExp(`${command}[\\d\\.\\,\\s\\-]+`, 'g');
    return d.match(reg);
}
/**
 * 分解path命令数值
 */
function commandValueDecompose (d) {
    let command = new String(d).substring(0, 1);
    let reg = new RegExp(`[${command}\\s\\,]+`, 'g');
    return d.replace(reg, ' ').trim().split(' ');
}

/**
 * 替换形状列表
 */
let replace_shape_arr = [
    {
        "id": "",
        "type": "shape",
        "group": null,
        "lock": false,
        "opacity": 1,
        "translate": "0,0",
        "rotate": "0,50,50",
        "width": 100,
        "height": 100,
        "scale": "1,1",
        "border_c": "rgb(0,0,0)",
        "border_w": 1.5,
        "border_s": 0,
        "background": "",
        "d": "M0 0 L100 0 L100 100 L0 100 Z",
        "shape_editor": "shape_rect_1",
    },
    {
        "id": "",
        "type": "shape",
        "group": null,
        "lock": false,
        "opacity": 1,
        "translate": "0,0",
        "rotate": "0,50,50",
        "scale": "1,1",
        "width": 100,
        "height": 100,
        "border_c": null,
        "border_w": null,
        "border_s": null,
        "background": "",
        "d": "M0 20 A20 20 0 0 1 20 0 L80 0 A20 20 0 0 1 100 20 L100 80 A20 20 0 0 1 80 100 L20 100 A20 20 0 0 1 0 80 L0 20 Z",
        "shape_editor": "shape_rect_round_1",
    },
    {
        "id": "",
        "type": "shape",
        "group": null,
        "lock": false,
        "opacity": 1,
        "translate": "0,0",
        "rotate": "0,50,50",
        "scale": "1,1",
        "width": 100,
        "height": 100,
        "border_c": null,
        "border_w": null,
        "border_s": null,
        "background": "",
        "d": "M0 100 L100 100 L50 0 Z",
        "shape_editor": "shape_base_triangle_1",
    },
    {
        "id": "",
        "type": "shape",
        "group": null,
        "lock": false,
        "opacity": 1,
        "translate": "0,0",
        "rotate": "0,50,50",
        "scale": "1,1",
        "width": 100,
        "height": 100,
        "border_c": null,
        "border_w": null,
        "border_s": null,
        "background": "",
        "d": "M0 50 A50 50 0 1 1 100 50 A50 50 0 1 1 0 50 Z",
    },
    {
        "id": "",
        "type": "shape",
        "group": null,
        "lock": false,
        "opacity": 1,
        "translate": "0,0",
        "rotate": "0,50,50",
        "scale": "1,1",
        "width": 100,
        "height": 100,
        "border_c": null,
        "border_w": null,
        "border_s": null,
        "background": "",
        "d": "M0 10 A10 10 0 0 1 10 0 L80 0 A20 20 0 0 1 100 20 L100 90 A10 10 0 0 1 90 100 L20 100 A20 20 0 0 1 0 80 L0 10 Z",
        "shape_editor": "shape_rect_round_2",
    },
    {
        "id": "",
        "type": "shape",
        "group": null,
        "lock": false,
        "opacity": 1,
        "translate": "0,0",
        "rotate": "0,50,50",
        "scale": "1,1",
        "width": 100,
        "height": 100,
        "border_c": null,
        "border_w": null,
        "border_s": null,
        "background": "",
        "d": "M0 100 L100 100 L0 0 Z",
    },
    {
        "id": "",
        "type": "shape",
        "group": null,
        "lock": false,
        "opacity": 1,
        "translate": "0,0",
        "rotate": "0,50,50",
        "scale": "1,1",
        "width": 100,
        "height": 100,
        "border_c": null,
        "border_w": null,
        "border_s": null,
        "background": "",
        "d": "M40 0 L100 0 L60 100 L0 100 Z",
        "shape_editor": "shape_base_skewrect_1",
    },
    {
        "id": "",
        "type": "shape",
        "group": null,
        "lock": false,
        "opacity": 1,
        "translate": "0,0",
        "rotate": "0,50,50",
        "scale": "1,1",
        "width": 100,
        "height": 100,
        "border_c": null,
        "border_w": null,
        "border_s": null,
        "background": "",
        "d": "M0 100 L20 0 L80 0 L100 100 Z",
        "shape_editor": "shape_base_skewrect_2",
    },
    {
        "id": "",
        "type": "shape",
        "group": null,
        "lock": false,
        "opacity": 1,
        "translate": "0,0",
        "rotate": "0,50,50",
        "scale": "1,1",
        "width": 100,
        "height": 96,
        "border_c": null,
        "border_w": null,
        "border_s": null,
        "background": "",
        "d": "M87.187,69.358 L65.873,88.582 L37.351,91.585 L12.514,77.221 L0.849,50.975 L6.811,22.873 L28.125,3.649 L56.647,0.646 L81.485,15.011 L93.149,41.257 L87.187,69.358 Z"
    },
    {
        "id": "",
        "type": "shape",
        "group": null,
        "lock": false,
        "opacity": 1,
        "translate": "0,0",
        "rotate": "0,50,50",
        "scale": "1,1",
        "width": 100,
        "height": 100,
        "border_c": null,
        "border_w": null,
        "border_s": null,
        "background": "",
        "d": "M99.999,50.000 C99.999,77.613 77.613,100.000 49.999,100.000 C22.385,100.000 -0.001,77.613 -0.001,50.000 C-0.001,22.386 22.385,-0.000 49.999,-0.000 C50.379,-0.000 49.999,-0.000 49.999,-0.000 L49.999,50.000 L99.999,50.000 C99.999,50.000 99.999,49.763 99.999,50.000 Z"
    },
    {
        "id": "",
        "type": "shape",
        "group": null,
        "lock": false,
        "opacity": 1,
        "translate": "0,0",
        "rotate": "0,50,50",
        "scale": "1,1",
        "width": 100,
        "height": 104,
        "border_c": null,
        "border_w": null,
        "border_s": null,
        "background": "",
        "d": "M62.666,1.160 L93.025,88.309 C93.025,88.309 45.811,109.711 22.139,91.448 C-1.531,73.184 -5.786,43.801 7.306,22.171 C25.165,-7.335 62.666,1.160 62.666,1.160 Z"
    },
    {
        "id": "",
        "type": "shape",
        "group": null,
        "lock": false,
        "opacity": 1,
        "translate": "0,0",
        "rotate": "0,50,50",
        "scale": "1,1",
        "width": 100,
        "height": 100,
        "border_c": null,
        "border_w": null,
        "border_s": null,
        "background": "",
        "d": "M99.999,50.000 C99.999,77.614 77.614,100.000 49.999,100.000 C22.385,100.000 -0.001,77.614 -0.001,50.000 C-0.001,22.385 22.385,-0.000 49.999,-0.000 C52.941,-0.000 55.807,0.304 58.610,0.792 C60.216,0.327 61.879,-0.000 63.636,-0.000 L81.817,-0.000 L99.999,-0.000 L99.999,31.818 C99.999,34.232 99.506,36.525 98.651,38.633 C99.503,42.290 99.999,46.083 99.999,50.000 Z"
    },
    {
        "id": "",
        "type": "shape",
        "group": null,
        "lock": false,
        "opacity": 1,
        "translate": "0,0",
        "rotate": "0,50,50",
        "scale": "1,1",
        "width": 100,
        "height": 105,
        "border_c": null,
        "border_w": null,
        "border_s": null,
        "background": "",
        "d": "M61.904,-0.000 L99.999,-0.000 L-0.001,104.999 L-0.001,62.045 L61.904,-0.000 Z"
    },
    {
        "id": "",
        "type": "shape",
        "group": null,
        "lock": false,
        "opacity": 1,
        "translate": "0,0",
        "rotate": "0,50,50",
        "scale": "1,1",
        "width": 100,
        "height": 100,
        "border_c": null,
        "border_w": null,
        "border_s": null,
        "background": "",
        "d": " M 0 48 C 0 21.490 21.490 0 48 0 C 74.510 0 96 21.490 96 48 C 96 74.510 74.510 96 48 96 C 21.490 96 0 74.510 0 48 M 12.470 48 C 12.470 67.623 28.377 83.530 48 83.530 C 67.623 83.530 83.530 67.623 83.530 48 C 83.530 28.377 67.623 12.470 48 12.470 C 28.377 12.470 12.470 28.377 12.470 48"
    },
    {
        "id": "",
        "type": "shape",
        "group": null,
        "lock": false,
        "opacity": 1,
        "translate": "0,0",
        "rotate": "0,50,50",
        "scale": "1,1",
        "width": 100,
        "height": 100,
        "border_c": null,
        "border_w": null,
        "border_s": null,
        "background": "",
        "d": "M49.999,99.999 C22.385,99.999 -0.001,77.614 -0.001,50.000 C-0.001,22.385 22.385,-0.000 49.999,-0.000 C77.613,-0.000 99.999,22.385 99.999,50.000 C99.999,77.614 77.613,99.999 49.999,99.999 ZM49.999,81.818 C57.895,81.818 65.026,78.835 70.588,74.074 L19.571,41.189 C18.756,44.005 18.181,46.921 18.181,50.000 C18.181,67.572 32.426,81.818 49.999,81.818 ZM49.999,18.181 C42.103,18.181 34.972,21.164 29.410,25.925 L80.426,58.810 C81.242,55.995 81.817,53.078 81.817,50.000 C81.817,32.427 67.572,18.181 49.999,18.181 Z"
    },
    {
        "id": "",
        "type": "shape",
        "group": null,
        "lock": false,
        "opacity": 1,
        "translate": "0,0",
        "rotate": "0,50,50",
        "scale": "1,1",
        "width": 97,
        "height": 82,
        "border_c": null,
        "border_w": null,
        "border_s": null,
        "background": "",
        "d": "M-0.001,82.000 L19.230,82.000 C19.230,82.000 24.958,31.961 49.999,31.857 C73.132,31.761 76.922,82.000 76.922,82.000 L96.153,82.000 C96.153,82.000 101.820,2.928 49.999,1.000 C-1.840,-0.930 -0.001,82.000 -0.001,82.000 Z"
    },
    {
        "id": "",
        "type": "shape",
        "group": null,
        "lock": false,
        "opacity": 1,
        "translate": "0,0",
        "rotate": "0,50,50",
        "scale": "1,1",
        "width": 22,
        "height": 20,
        "border_c": null,
        "border_w": null,
        "border_s": null,
        "background": "",
        "d": "M-0.000,14.000 L11.000,14.000 L11.000,20.000 L22.000,10.000 L11.000,-0.000 L11.000,6.000 L-0.000,6.000 L-0.000,14.000 Z"
    },
    {
        "id": "",
        "type": "shape",
        "group": null,
        "lock": false,
        "opacity": 1,
        "translate": "0,0",
        "rotate": "0,50,50",
        "scale": "1,1",
        "width": 22,
        "height": 20,
        "border_c": null,
        "border_w": null,
        "border_s": null,
        "background": "",
        "d": "M22.000,14.000 L11.000,14.000 L11.000,20.000 L-0.000,10.000 L11.000,-0.000 L11.000,6.000 L22.000,6.000 L22.000,14.000 Z"
    },
    {
        "id": "",
        "type": "shape",
        "group": null,
        "lock": false,
        "opacity": 1,
        "translate": "0,0",
        "rotate": "0,50,50",
        "scale": "1,1",
        "width": 20,
        "height": 22,
        "border_c": null,
        "border_w": null,
        "border_s": null,
        "background": "",
        "d": "M6.000,22.000 L6.000,11.000 L-0.000,11.000 L10.000,-0.000 L20.000,11.000 L14.000,11.000 L14.000,22.000 L6.000,22.000 Z"
    },
    {
        "id": "",
        "type": "shape",
        "group": null,
        "lock": false,
        "opacity": 1,
        "translate": "0,0",
        "rotate": "0,50,50",
        "scale": "1,1",
        "width": 20,
        "height": 22,
        "border_c": null,
        "border_w": null,
        "border_s": null,
        "background": "",
        "d": "M6.000,-0.000 L6.000,11.000 L-0.000,11.000 L10.000,22.000 L20.000,11.000 L14.000,11.000 L14.000,-0.000 L6.000,-0.000 Z"
    },
    {
        "id": "",
        "type": "shape",
        "group": null,
        "lock": false,
        "opacity": 1,
        "translate": "0,0",
        "rotate": "0,50,50",
        "scale": "1,1",
        "width": 22,
        "height": 22,
        "border_c": null,
        "border_w": null,
        "border_s": null,
        "background": "",
        "d": "M21.000,6.000 L21.000,7.000 L20.000,7.000 L20.000,8.000 L19.000,8.000 L19.000,9.000 L18.000,9.000 L18.000,10.000 L17.000,10.000 L17.000,11.000 L16.000,11.000 L16.000,8.000 L9.841,8.000 C7.160,8.256 7.000,15.000 7.000,15.000 L7.000,22.000 L1.000,22.000 L1.000,15.000 C1.000,15.000 0.679,9.745 2.000,7.000 C3.601,3.672 5.773,3.393 8.000,3.000 L16.000,3.000 L16.000,-0.000 L17.000,-0.000 L17.000,1.000 L18.000,1.000 L18.000,2.000 L19.000,2.000 L19.000,3.000 L20.000,3.000 L20.000,4.000 L21.000,4.000 L21.000,5.000 L22.000,5.000 L22.000,6.000 L21.000,6.000 Z"
    },
    {
        "id": "",
        "type": "shape",
        "group": null,
        "lock": false,
        "opacity": 1,
        "translate": "0,0",
        "rotate": "0,50,50",
        "scale": "1,1",
        "width": 22,
        "height": 22,
        "border_c": null,
        "border_w": null,
        "border_s": null,
        "background": "",
        "d": "M21.000,6.000 L19.000,6.000 L19.000,14.000 L19.000,19.000 L6.000,19.000 L6.000,21.000 L6.000,22.000 L5.000,22.000 L5.000,21.000 L4.000,21.000 L4.000,20.000 L3.000,20.000 L3.000,19.000 L2.000,19.000 L2.000,18.000 L1.000,18.000 L1.000,17.000 L-0.000,17.000 L-0.000,16.000 L1.000,16.000 L1.000,15.000 L2.000,15.000 L2.000,14.000 L3.000,14.000 L3.000,13.000 L4.000,13.000 L4.000,12.000 L5.000,12.000 L5.000,11.000 L6.000,11.000 L6.000,12.000 L6.000,14.000 L14.000,14.000 L14.000,6.000 L12.000,6.000 L11.000,6.000 L11.000,5.000 L12.000,5.000 L12.000,4.000 L13.000,4.000 L13.000,3.000 L14.000,3.000 L14.000,2.000 L15.000,2.000 L15.000,1.000 L16.000,1.000 L16.000,-0.000 L17.000,-0.000 L17.000,1.000 L18.000,1.000 L18.000,2.000 L19.000,2.000 L19.000,3.000 L20.000,3.000 L20.000,4.000 L21.000,4.000 L21.000,5.000 L22.000,5.000 L22.000,6.000 L21.000,6.000 Z"
    },
    {
        "id": "",
        "type": "shape",
        "group": null,
        "lock": false,
        "opacity": 1,
        "translate": "0,0",
        "rotate": "0,50,50",
        "scale": "1,1",
        "width": 21,
        "height": 22,
        "border_c": null,
        "border_w": null,
        "border_s": null,
        "background": "",
        "d": "M21.000,10.000 L21.000,22.000 L-0.000,22.000 L-0.000,10.000 L8.000,10.000 L8.000,6.000 L6.000,6.000 L5.000,6.000 L5.000,5.000 L6.000,5.000 L6.000,4.000 L7.000,4.000 L7.000,3.000 L8.000,3.000 L8.000,2.000 L9.000,2.000 L9.000,1.000 L10.000,1.000 L10.000,-0.000 L11.000,-0.000 L11.000,1.000 L12.000,1.000 L12.000,2.000 L13.000,2.000 L13.000,3.000 L14.000,3.000 L14.000,4.000 L15.000,4.000 L15.000,5.000 L16.000,5.000 L16.000,6.000 L15.000,6.000 L13.000,6.000 L13.000,10.000 L21.000,10.000 Z"
    },
    {
        "id": "",
        "type": "shape",
        "group": null,
        "lock": false,
        "opacity": 1,
        "translate": "0,0",
        "rotate": "0,50,50",
        "scale": "1,1",
        "width": 22,
        "height": 22,
        "border_c": null,
        "border_w": null,
        "border_s": null,
        "background": "",
        "d": "M21.000,12.000 L21.000,13.000 L20.000,13.000 L20.000,14.000 L19.000,14.000 L19.000,15.000 L18.000,15.000 L18.000,14.000 L16.000,14.000 L16.000,22.000 L6.000,22.000 L6.000,14.000 L4.000,14.000 L4.000,15.000 L3.000,15.000 L3.000,14.000 L2.000,14.000 L2.000,13.000 L1.000,13.000 L1.000,12.000 L-0.000,12.000 L-0.000,10.000 L1.000,10.000 L1.000,9.000 L2.000,9.000 L2.000,8.000 L3.000,8.000 L3.000,7.000 L4.000,7.000 L4.000,8.000 L6.000,8.000 L6.000,-0.000 L16.000,-0.000 L16.000,8.000 L18.000,8.000 L18.000,7.000 L19.000,7.000 L19.000,8.000 L20.000,8.000 L20.000,9.000 L21.000,9.000 L21.000,10.000 L22.000,10.000 L22.000,12.000 L21.000,12.000 Z"
    },
    {
        "id": "",
        "type": "shape",
        "group": null,
        "lock": false,
        "opacity": 1,
        "translate": "0,0",
        "rotate": "0,50,50",
        "scale": "1,1",
        "width": 22,
        "height": 22,
        "border_c": null,
        "border_w": null,
        "border_s": null,
        "background": "",
        "d": "M21.000,12.000 L21.000,13.000 L20.000,13.000 L20.000,14.000 L19.000,14.000 L19.000,15.000 L18.000,15.000 L18.000,14.000 L18.000,13.000 L16.000,13.000 L16.000,16.000 L13.000,16.000 L13.000,18.000 L15.000,18.000 L15.000,19.000 L14.000,19.000 L14.000,20.000 L13.000,20.000 L13.000,21.000 L12.000,21.000 L12.000,22.000 L10.000,22.000 L10.000,21.000 L9.000,21.000 L9.000,20.000 L8.000,20.000 L8.000,19.000 L7.000,19.000 L7.000,18.000 L9.000,18.000 L9.000,16.000 L6.000,16.000 L6.000,13.000 L5.000,13.000 L4.000,13.000 L4.000,14.000 L4.000,15.000 L3.000,15.000 L3.000,14.000 L2.000,14.000 L2.000,13.000 L1.000,13.000 L1.000,12.000 L-0.000,12.000 L-0.000,10.000 L1.000,10.000 L1.000,9.000 L2.000,9.000 L2.000,8.000 L3.000,8.000 L3.000,7.000 L4.000,7.000 L4.000,8.000 L4.000,9.000 L5.000,9.000 L6.000,9.000 L6.000,6.000 L9.000,6.000 L9.000,4.000 L7.000,4.000 L7.000,3.000 L8.000,3.000 L8.000,2.000 L9.000,2.000 L9.000,1.000 L10.000,1.000 L10.000,-0.000 L12.000,-0.000 L12.000,1.000 L13.000,1.000 L13.000,2.000 L14.000,2.000 L14.000,3.000 L15.000,3.000 L15.000,4.000 L13.000,4.000 L13.000,6.000 L16.000,6.000 L16.000,9.000 L18.000,9.000 L18.000,8.000 L18.000,7.000 L19.000,7.000 L19.000,8.000 L20.000,8.000 L20.000,9.000 L21.000,9.000 L21.000,10.000 L22.000,10.000 L22.000,12.000 L21.000,12.000 Z"
    },
    {
        "id": "",
        "type": "shape",
        "group": null,
        "lock": false,
        "opacity": 1,
        "translate": "0,0",
        "rotate": "0,50,50",
        "scale": "1,1",
        "width": 20,
        "height": 22,
        "border_c": null,
        "border_w": null,
        "border_s": null,
        "background": "",
        "d": "M20.000,16.000 L17.000,22.000 L14.000,16.000 L15.639,16.000 C14.160,11.802 12.827,7.026 9.000,7.000 C3.546,6.963 2.000,22.000 2.000,22.000 L-0.000,22.000 C-0.000,22.000 -0.109,-0.478 9.000,-0.000 C16.533,0.395 17.762,12.422 17.961,16.000 L20.000,16.000 Z"
    },
    {
        "id": "",
        "type": "shape",
        "group": null,
        "lock": false,
        "opacity": 1,
        "translate": "0,0",
        "rotate": "0,50,50",
        "scale": "1,1",
        "width": 23,
        "height": 23,
        "border_c": null,
        "border_w": null,
        "border_s": null,
        "background": "",
        "d": "M22.016,3.519 L18.637,7.000 L22.000,7.000 L22.000,11.000 L14.755,11.000 L11.843,14.000 L22.000,14.000 L22.000,18.000 L7.961,18.000 L3.370,22.730 L0.306,20.158 L2.401,18.000 L-0.000,18.000 L-0.000,14.000 L6.283,14.000 L9.195,11.000 L-0.000,11.000 L-0.000,7.000 L13.078,7.000 L18.952,0.947 L22.016,3.519 Z"
    },
    {
        "id": "",
        "type": "shape",
        "group": null,
        "lock": false,
        "opacity": 1,
        "translate": "0,0",
        "rotate": "0,50,50",
        "scale": "1,1",
        "width": 18,
        "height": 21,
        "border_c": null,
        "border_w": null,
        "border_s": null,
        "background": "",
        "d": "M9.000,18.000 C8.322,18.000 7.664,17.919 7.029,17.777 L3.000,21.000 L3.000,15.695 C1.163,14.047 -0.000,11.662 -0.000,9.000 C-0.000,4.029 4.029,-0.000 9.000,-0.000 C13.971,-0.000 18.000,4.029 18.000,9.000 C18.000,13.971 13.971,18.000 9.000,18.000 Z"
    },
    {
        "id": "",
        "type": "shape",
        "group": null,
        "lock": false,
        "opacity": 1,
        "translate": "0,0",
        "rotate": "0,50,50",
        "scale": "1,1",
        "width": 22,
        "height": 20,
        "border_c": null,
        "border_w": null,
        "border_s": null,
        "background": "",
        "d": "M15.125,-0.000 L11.687,4.667 L8.937,2.000 L7.562,5.333 L0.687,2.000 L4.812,7.333 L-0.000,8.000 L4.125,10.667 L-0.000,14.000 L5.500,13.333 L4.812,16.667 L7.562,14.667 L8.937,20.000 L11.000,14.000 L13.750,18.667 L14.437,13.333 L18.562,17.333 L17.187,12.667 L22.000,12.667 L18.562,10.000 L22.000,7.333 L17.875,6.667 L19.250,4.000 L15.125,4.667 L15.125,-0.000 Z"
    },
    {
        "id": "",
        "type": "shape",
        "group": null,
        "lock": false,
        "opacity": 1,
        "translate": "0,0",
        "rotate": "0,50,50",
        "scale": "1,1",
        "width": 22,
        "height": 22,
        "border_c": null,
        "border_w": null,
        "border_s": null,
        "background": "",
        "d": "M11.000,-0.000 L14.626,7.914 L22.000,8.000 L17.000,14.000 L19.000,22.000 L11.000,17.647 L3.000,22.000 L5.000,14.000 L-0.000,8.000 L7.374,7.914 L11.000,-0.000 Z"
    },
    {
        "id": "",
        "type": "shape",
        "group": null,
        "lock": false,
        "opacity": 1,
        "translate": "0,0",
        "rotate": "0,50,50",
        "scale": "1,1",
        "width": 22,
        "height": 22,
        "border_c": null,
        "border_w": null,
        "border_s": null,
        "background": "",
        "d": "M18.562,11.000 L22.000,16.000 L15.125,16.000 L11.000,22.000 L6.875,16.000 L-0.000,16.000 L3.437,11.000 L-0.000,6.000 L6.875,6.000 L11.000,-0.000 L15.125,6.000 L22.000,6.000 L18.562,11.000 Z"
    },
    {
        "id": "",
        "type": "shape",
        "group": null,
        "lock": false,
        "opacity": 1,
        "translate": "0,0",
        "rotate": "0,50,50",
        "scale": "1,1",
        "width": 22,
        "height": 22,
        "border_c": null,
        "border_w": null,
        "border_s": null,
        "background": "",
        "d": "M18.452,22.000 L4.258,22.000 L-0.000,8.800 L11.355,-0.000 L22.000,9.533 L18.452,22.000 Z"
    },
    {
        "id": "",
        "type": "shape",
        "group": null,
        "lock": false,
        "opacity": 1,
        "translate": "0,0",
        "rotate": "0,50,50",
        "scale": "1,1",
        "width": 22,
        "height": 22,
        "border_c": null,
        "border_w": null,
        "border_s": null,
        "background": "",
        "d": "M16.489,22.000 L5.489,21.985 L-0.000,10.985 L5.511,-0.000 L16.511,0.015 L22.000,11.015 L16.489,22.000 Z"
    },
    {
        "id": "",
        "type": "shape",
        "group": null,
        "lock": false,
        "opacity": 1,
        "translate": "0,0",
        "rotate": "0,50,50",
        "scale": "1,1",
        "width": 22,
        "height": 22,
        "border_c": null,
        "border_w": null,
        "border_s": null,
        "background": "",
        "d": "M21.957,15.599 L15.496,22.000 L6.401,21.957 L-0.000,15.496 L0.043,6.401 L6.504,-0.000 L15.599,0.043 L22.000,6.504 L21.957,15.599 Z"
    },
    {
        "id": "",
        "type": "shape",
        "group": null,
        "lock": false,
        "opacity": 1,
        "translate": "0,0",
        "rotate": "0,50,50",
        "scale": "1,1",
        "width": 13,
        "height": 23,
        "border_c": null,
        "border_w": null,
        "border_s": null,
        "background": "",
        "d": "M13.000,-0.000 C13.000,-0.000 -0.000,0.003 -0.000,10.625 C-0.000,22.122 13.000,22.000 13.000,22.000 C13.000,22.000 6.000,18.083 6.000,11.125 C6.000,4.209 13.000,-0.000 13.000,-0.000 Z"
    },
    {
        "id": "",
        "type": "shape",
        "group": null,
        "lock": false,
        "opacity": 1,
        "translate": "0,0",
        "rotate": "0,50,50",
        "scale": "1,1",
        "width": 22,
        "height": 23,
        "border_c": null,
        "border_w": null,
        "border_s": null,
        "background": "",
        "d": "M0.194,11.250 L11.000,0.444 L21.806,11.250 L11.000,22.056 L0.194,11.250 Z"
    },
    {
        "id": "",
        "type": "shape",
        "group": null,
        "lock": false,
        "opacity": 1,
        "translate": "0,0",
        "rotate": "0,50,50",
        "scale": "1,1",
        "width": 22,
        "height": 22,
        "border_c": null,
        "border_w": null,
        "border_s": null,
        "background": "",
        "d": "M22.000,14.006 L16.000,22.000 L6.180,22.000 L-0.000,14.227 L2.085,4.436 L10.865,-0.000 L19.728,4.259 L22.000,14.006 Z"
    },
    {
        "id": "",
        "type": "shape",
        "group": null,
        "lock": false,
        "opacity": 1,
        "translate": "0,0",
        "rotate": "0,50,50",
        "scale": "1,1",
        "width": 22,
        "height": 21,
        "border_c": null,
        "border_w": null,
        "border_s": null,
        "background": "",
        "d": "M19.977,16.857 L14.000,21.000 L7.727,21.000 L2.179,17.071 L-0.000,10.632 L2.023,4.143 L7.000,-0.000 L14.273,-0.000 L19.821,3.929 L22.000,10.368 L19.977,16.857 Z"
    },
    {
        "id": "",
        "type": "shape",
        "group": null,
        "lock": false,
        "opacity": 1,
        "translate": "0,0",
        "rotate": "0,50,50",
        "scale": "1,1",
        "width": 22,
        "height": 22,
        "border_c": null,
        "border_w": null,
        "border_s": null,
        "background": "",
        "d": "M22.000,16.000 L16.000,16.000 L16.000,22.000 L6.000,22.000 L6.000,16.000 L-0.000,16.000 L-0.000,6.000 L6.000,6.000 L6.000,-0.000 L16.000,-0.000 L16.000,6.000 L22.000,6.000 L22.000,16.000 Z"
    },
    {
        "id": "",
        "type": "shape",
        "group": null,
        "lock": false,
        "opacity": 1,
        "translate": "0,0",
        "rotate": "0,50,50",
        "scale": "1,1",
        "width": 22,
        "height": 22,
        "border_c": null,
        "border_w": null,
        "border_s": null,
        "background": "",
        "d": "M-0.000,22.000 L-0.000,-0.000 L22.000,-0.000 L22.000,22.000 L-0.000,22.000 ZM19.000,3.000 L3.000,3.000 L3.000,19.000 L19.000,19.000 L19.000,3.000 Z"
    },
    {
        "id": "",
        "type": "shape",
        "group": null,
        "lock": false,
        "opacity": 1,
        "translate": "0,0",
        "rotate": "0,50,50",
        "scale": "1,1",
        "width": 22,
        "height": 22,
        "border_c": null,
        "border_w": null,
        "border_s": null,
        "background": "",
        "d": "M-0.000,-0.000 L-0.000,22.000 L7.000,15.000 L7.000,7.000 L15.000,7.000 L22.000,-0.000 L-0.000,-0.000 Z"
    },
    {
        "id": "",
        "type": "shape",
        "group": null,
        "lock": false,
        "opacity": 1,
        "translate": "0,0",
        "rotate": "0,50,50",
        "scale": "1,1",
        "width": 22,
        "height": 22,
        "border_c": null,
        "border_w": null,
        "border_s": null,
        "background": "",
        "d": "M22.000,22.000 L11.000,22.000 L-0.000,22.000 L-0.000,12.000 L-0.000,-0.000 L11.000,-0.000 L11.000,12.000 L22.000,12.000 L22.000,22.000 Z"
    },
    {
        "id": "",
        "type": "shape",
        "group": null,
        "lock": false,
        "opacity": 1,
        "translate": "0,0",
        "rotate": "0,50,50",
        "scale": "1,1",
        "width": 22,
        "height": 22,
        "border_c": null,
        "border_w": null,
        "border_s": null,
        "background": "",
        "d": "M17.659,13.470 C19.986,13.558 22.000,12.778 22.000,12.778 C22.000,12.778 20.300,11.269 18.061,10.605 C20.226,9.749 21.755,8.224 21.755,8.224 C21.755,8.224 19.592,7.527 17.273,7.821 C18.911,6.165 19.696,4.154 19.696,4.154 C19.696,4.154 17.268,4.405 15.215,5.724 C16.094,3.452 15.942,1.140 15.942,1.140 C15.942,1.140 13.722,2.473 12.434,4.650 C12.272,2.127 11.044,-0.000 11.044,-0.000 C11.044,-0.000 9.813,1.910 9.498,4.225 C8.321,2.216 6.580,0.938 6.580,0.938 C6.580,0.938 6.222,3.182 6.866,5.428 C4.980,4.063 2.872,3.594 2.872,3.594 C2.872,3.594 3.448,5.793 4.942,7.589 C2.665,7.099 0.547,7.519 0.547,7.519 C0.547,7.519 1.960,9.299 4.051,10.341 C1.770,10.810 -0.000,12.046 -0.000,12.046 C-0.000,12.046 2.010,13.107 4.344,13.219 C2.444,14.567 1.323,16.411 1.323,16.411 C1.323,16.411 3.590,16.573 5.771,15.736 C4.575,17.734 4.292,19.874 4.292,19.874 C4.292,19.874 6.432,19.109 8.092,17.465 C7.802,19.775 8.404,21.848 8.404,21.848 C8.404,21.848 10.055,20.286 10.912,18.113 C11.577,20.345 12.963,22.000 12.963,22.000 C12.963,22.000 13.845,19.906 13.754,17.572 C15.262,19.346 17.197,20.303 17.197,20.303 C17.197,20.303 17.161,18.031 16.138,15.931 C18.233,16.949 20.390,17.046 20.390,17.046 C20.390,17.046 19.442,14.980 17.659,13.470 Z"
    },
    {
        "id": "",
        "type": "shape",
        "group": null,
        "lock": false,
        "opacity": 1,
        "translate": "0,0",
        "rotate": "0,50,50",
        "scale": "1,1",
        "width": 20,
        "height": 22,
        "border_c": null,
        "border_w": null,
        "border_s": null,
        "background": "",
        "d": "M10.075,22.000 C10.075,22.000 -5.000,6.825 2.683,1.863 C7.115,-1.000 10.000,2.664 10.000,2.664 C10.000,2.664 12.885,-1.000 17.317,1.863 C25.000,6.825 10.075,22.000 10.075,22.000 Z"
    },
    {
        "id": "",
        "type": "shape",
        "group": null,
        "lock": false,
        "opacity": 1,
        "translate": "0,0",
        "rotate": "0,50,50",
        "scale": "1,1",
        "width": 22,
        "height": 22,
        "border_c": null,
        "border_w": null,
        "border_s": null,
        "background": "",
        "d": "M8.800,-0.000 L13.200,6.600 L11.000,6.600 L16.867,12.467 L15.400,13.200 L22.000,22.000 L9.533,14.667 L12.467,14.667 L5.133,9.533 L7.333,8.800 L-0.000,3.667 L8.800,-0.000 Z"
    },
    {
        "id": "",
        "type": "shape",
        "group": null,
        "lock": false,
        "opacity": 1,
        "translate": "0,0",
        "rotate": "0,50,50",
        "scale": "1,1",
        "width": 22,
        "height": 22,
        "border_c": null,
        "border_w": null,
        "border_s": null,
        "background": "",
        "d": "M-0.000,3.667 L-0.000,18.333 C-0.000,18.333 1.857,18.724 2.861,19.727 C3.669,20.536 3.667,22.000 3.667,22.000 L18.333,22.000 C18.333,22.000 18.541,20.326 19.469,19.397 C20.374,18.493 22.000,18.333 22.000,18.333 L22.000,3.667 C22.000,3.667 20.443,3.576 19.576,2.710 C18.614,1.748 18.333,-0.000 18.333,-0.000 L3.667,-0.000 C3.667,-0.000 3.572,1.561 2.703,2.430 C1.743,3.390 -0.000,3.667 -0.000,3.667 Z"
    },
    {
        "id": "",
        "type": "shape",
        "group": null,
        "lock": false,
        "opacity": 1,
        "translate": "0,0",
        "rotate": "0,50,50",
        "scale": "1,1",
        "width": 22,
        "height": 22,
        "border_c": null,
        "border_w": null,
        "border_s": null,
        "background": "",
        "d": "M-0.000,-0.000 L-0.000,22.000 L17.000,22.000 L22.000,11.000 L16.000,-0.000 L-0.000,-0.000 Z"
    },
    {
        "id": "",
        "type": "shape",
        "group": null,
        "lock": false,
        "opacity": 1,
        "translate": "0,0",
        "rotate": "0,50,50",
        "scale": "1,1",
        "width": 22,
        "height": 22,
        "border_c": null,
        "border_w": null,
        "border_s": null,
        "background": "",
        "d": "M22.000,11.000 L17.000,22.000 L17.000,16.000 L5.000,16.000 L5.000,22.000 L-0.000,11.000 L5.000,-0.000 L5.000,6.000 L17.000,6.000 L17.000,-0.000 L22.000,11.000 Z"
    },
    {
        "id": "",
        "type": "shape",
        "group": null,
        "lock": false,
        "opacity": 1,
        "translate": "0,0",
        "rotate": "0,50,50",
        "scale": "1,1",
        "width": 22,
        "height": 22,
        "border_c": null,
        "border_w": null,
        "border_s": null,
        "background": "",
        "d": "M11.000,22.000 L-0.000,17.000 L6.000,17.000 L6.000,5.000 L-0.000,5.000 L11.000,-0.000 L22.000,5.000 L16.000,5.000 L16.000,17.000 L22.000,17.000 L11.000,22.000 Z"
    },
    {
        "id": "",
        "type": "shape",
        "group": null,
        "lock": false,
        "opacity": 1,
        "translate": "0,0",
        "rotate": "0,50,50",
        "scale": "1,1",
        "width": 22,
        "height": 22,
        "border_c": null,
        "border_w": null,
        "border_s": null,
        "background": "",
        "d": "M22.000,11.000 L17.000,16.000 L17.000,13.000 L13.000,13.000 L13.000,17.000 L16.000,17.000 L11.000,22.000 L6.000,17.000 L9.000,17.000 L9.000,13.000 L5.000,13.000 L5.000,16.000 L-0.000,11.000 L5.000,6.000 L5.000,9.000 L9.000,9.000 L9.000,5.000 L6.000,5.000 L11.000,-0.000 L16.000,5.000 L13.000,5.000 L13.000,9.000 L17.000,9.000 L17.000,6.000 L22.000,11.000 Z"
    },
    {
        "id": "",
        "type": "shape",
        "group": null,
        "lock": false,
        "opacity": 1,
        "translate": "0,0",
        "rotate": "0,50,50",
        "scale": "1,1",
        "width": 22,
        "height": 22,
        "border_c": null,
        "border_w": null,
        "border_s": null,
        "background": "",
        "d": "M22.000,17.000 L17.000,22.000 L17.000,19.000 L5.000,19.000 L5.000,22.000 L-0.000,17.000 L5.000,12.000 L5.000,15.000 L9.000,15.000 L9.000,5.000 L7.000,5.000 L11.000,-0.000 L15.000,5.000 L13.000,5.000 L13.000,15.000 L17.000,15.000 L17.000,12.000 L22.000,17.000 Z"
    },
    {
        "id": "",
        "type": "shape",
        "group": null,
        "lock": false,
        "opacity": 1,
        "translate": "0,0",
        "rotate": "0,50,50",
        "scale": "1,1",
        "width": 22,
        "height": 15,
        "border_c": null,
        "border_w": null,
        "border_s": null,
        "background": "",
        "d": "M21.000,9.000 L21.000,10.000 L20.000,10.000 L20.000,11.000 L19.000,11.000 L19.000,12.000 L18.000,12.000 L18.000,13.000 L17.000,13.000 L17.000,14.000 L16.000,14.000 L16.000,15.000 L15.000,15.000 L15.000,14.000 L15.000,13.000 L-0.000,13.000 L-0.000,8.000 L-0.000,3.000 L-0.000,2.000 L15.000,2.000 L15.000,1.000 L15.000,-0.000 L16.000,-0.000 L16.000,1.000 L17.000,1.000 L17.000,2.000 L17.000,3.000 L18.000,3.000 L18.000,4.000 L19.000,4.000 L19.000,5.000 L20.000,5.000 L20.000,6.000 L21.000,6.000 L21.000,7.000 L22.000,7.000 L22.000,9.000 L21.000,9.000 Z"
    },
    {
        "id": "",
        "type": "shape",
        "group": null,
        "lock": false,
        "opacity": 1,
        "translate": "0,0",
        "rotate": "0,50,50",
        "scale": "1,1",
        "width": 22,
        "height": 22,
        "border_c": null,
        "border_w": null,
        "border_s": null,
        "background": "",
        "d": "M11.000,22.000 L-0.000,22.000 L12.000,11.000 L-0.000,-0.000 L11.000,-0.000 L22.000,11.000 L11.000,22.000 Z"
    },
    {
        "id": "",
        "type": "shape",
        "group": null,
        "lock": false,
        "opacity": 1,
        "translate": "0,0",
        "rotate": "0,50,50",
        "scale": "1,1",
        "width": 22,
        "height": 22,
        "border_c": null,
        "border_w": null,
        "border_s": null,
        "background": "",
        "d": "M22.000,11.000 L16.000,17.000 L16.000,14.000 L14.000,14.000 L14.000,22.000 L-0.000,22.000 L-0.000,-0.000 L14.000,-0.000 L14.000,8.000 L16.000,8.000 L16.000,5.000 L22.000,11.000 Z"
    },
    {
        "id": "",
        "type": "shape",
        "group": null,
        "lock": false,
        "opacity": 1,
        "translate": "0,0",
        "rotate": "0,50,50",
        "scale": "1,1",
        "width": 22,
        "height": 20,
        "border_c": null,
        "border_w": null,
        "border_s": null,
        "background": "",
        "d": "M-0.000,-0.000 L22.000,-0.000 L22.000,15.000 C22.000,15.000 15.347,14.492 10.424,18.000 C6.106,21.076 -0.000,18.000 -0.000,18.000 L-0.000,-0.000 Z"
    },
    {
        "id": "",
        "type": "shape",
        "group": null,
        "lock": false,
        "opacity": 1,
        "translate": "0,0",
        "rotate": "0,50,50",
        "scale": "1,1",
        "width": 22,
        "height": 22,
        "border_c": null,
        "border_w": null,
        "border_s": null,
        "background": "",
        "d": "M22.000,15.000 L15.000,15.000 L15.000,22.000 L7.000,22.000 L7.000,15.000 L-0.000,15.000 L-0.000,7.000 L7.000,7.000 L7.000,-0.000 L15.000,-0.000 L15.000,7.000 L22.000,7.000 L22.000,15.000 Z"
    },
    {
        "id": "",
        "type": "shape",
        "group": null,
        "lock": false,
        "opacity": 1,
        "translate": "0,0",
        "rotate": "0,50,50",
        "scale": "1,1",
        "width": 22,
        "height": 22,
        "border_c": null,
        "border_w": null,
        "border_s": null,
        "background": "",
        "d": "M15.950,21.607 L11.000,16.657 L6.050,21.607 L0.393,15.950 L5.343,11.000 L0.393,6.050 L6.050,0.393 L11.000,5.343 L15.950,0.393 L21.607,6.050 L16.657,11.000 L21.607,15.950 L15.950,21.607 Z"
    },
    {
        "id": "",
        "type": "shape",
        "group": null,
        "lock": false,
        "opacity": 1,
        "translate": "0,0",
        "rotate": "0,50,50",
        "scale": "1,1",
        "width": 22,
        "height": 23,
        "border_c": null,
        "border_w": null,
        "border_s": null,
        "background": "",
        "d": "M-0.000,23.000 L-0.000,14.000 L22.000,14.000 L22.000,23.000 L-0.000,23.000 ZM-0.000,-0.000 L22.000,-0.000 L22.000,9.000 L-0.000,9.000 L-0.000,-0.000 Z"
    },
    {
        "id": "",
        "type": "shape",
        "group": null,
        "lock": false,
        "opacity": 1,
        "translate": "0,0",
        "rotate": "0,50,50",
        "scale": "1,1",
        "width": 22,
        "height": 22,
        "border_c": null,
        "border_w": null,
        "border_s": null,
        "background": "",
        "d": "M-0.000,15.000 L-0.000,7.000 L22.000,7.000 L22.000,15.000 L-0.000,15.000 ZM11.500,5.000 C10.119,5.000 9.000,3.881 9.000,2.500 C9.000,1.119 10.119,-0.000 11.500,-0.000 C12.881,-0.000 14.000,1.119 14.000,2.500 C14.000,3.881 12.881,5.000 11.500,5.000 ZM11.500,17.000 C12.881,17.000 14.000,18.119 14.000,19.500 C14.000,20.881 12.881,22.000 11.500,22.000 C10.119,22.000 9.000,20.881 9.000,19.500 C9.000,18.119 10.119,17.000 11.500,17.000 Z"
    },
    {
        "id": "",
        "type": "shape",
        "group": null,
        "lock": false,
        "opacity": 1,
        "translate": "0,0",
        "rotate": "0,50,50",
        "scale": "1,1",
        "width": 22,
        "height": 22,
        "border_c": null,
        "border_w": null,
        "border_s": null,
        "background": "",
        "d": "M19.000,8.000 L22.000,11.000 L19.000,14.000 L19.000,19.000 L14.000,19.000 L11.000,22.000 L8.000,19.000 L3.000,19.000 L3.000,14.000 L-0.000,11.000 L3.000,8.000 L3.000,3.000 L8.000,3.000 L11.000,-0.000 L14.000,3.000 L19.000,3.000 L19.000,8.000 Z"
    },
    {
        "id": "",
        "type": "shape",
        "group": null,
        "lock": false,
        "opacity": 1,
        "translate": "0,0",
        "rotate": "0,50,50",
        "scale": "1,1",
        "width": 20,
        "height": 23,
        "border_c": null,
        "border_w": null,
        "border_s": null,
        "background": "",
        "d": "M0.803,8.157 C-1.000,7.081 0.373,3.611 2.747,3.715 C2.441,2.266 5.362,-0.000 7.748,2.181 C8.049,0.542 12.650,0.212 13.288,2.827 C13.981,0.969 19.269,1.969 17.982,5.331 C20.060,4.846 21.000,10.558 17.588,10.740 C18.497,12.759 15.139,14.645 13.795,13.394 C13.975,15.140 9.054,16.648 8.103,13.880 C7.731,15.626 2.824,14.461 3.561,12.094 C2.112,12.999 -0.906,10.155 0.803,8.157 ZM4.802,18.481 C4.468,19.040 4.719,20.067 5.802,19.250 C5.880,20.067 7.365,20.150 7.632,19.240 C8.432,19.799 9.121,19.102 8.669,18.201 C9.536,18.131 9.209,16.229 8.048,16.941 C8.333,16.229 6.562,15.498 6.362,16.688 C5.962,16.058 4.894,16.021 4.916,17.171 C4.264,16.891 3.733,18.458 4.802,18.481 ZM3.382,22.222 C3.192,22.703 4.312,23.000 4.407,22.289 C5.037,22.487 5.306,21.809 4.895,21.362 C5.289,20.650 4.344,20.270 4.044,20.882 C3.665,20.220 2.846,20.948 3.145,21.428 C2.499,21.693 2.972,22.437 3.382,22.222 Z"
    },
    {
        "id": "",
        "type": "shape",
        "group": null,
        "lock": false,
        "opacity": 1,
        "translate": "0,0",
        "rotate": "0,50,50",
        "scale": "1,1",
        "width": 22,
        "height": 22,
        "border_c": null,
        "border_w": null,
        "border_s": null,
        "background": "",
        "d": "M14.000,19.687 C11.511,17.811 10.061,22.197 7.742,21.126 C2.282,18.605 -0.000,21.618 -0.000,21.618 L-0.000,12.000 L-0.000,11.000 L-0.000,1.000 C-0.000,1.000 3.605,-0.432 8.000,3.000 C10.489,4.944 11.939,0.400 14.258,1.510 C19.717,4.122 22.000,1.000 22.000,1.000 L22.000,11.000 L22.000,12.000 L22.000,21.618 C22.000,21.618 18.395,23.000 14.000,19.687 Z"
    },
    {
        "id": "",
        "type": "shape",
        "group": null,
        "lock": false,
        "opacity": 1,
        "translate": "0,0",
        "rotate": "0,50,50",
        "scale": "1,1",
        "width": 22,
        "height": 22,
        "border_c": null,
        "border_w": null,
        "border_s": null,
        "background": "",
        "d": "M20.000,18.000 L11.000,18.000 L7.500,22.000 L4.000,18.000 L2.000,18.000 C0.895,18.000 -0.000,17.105 -0.000,16.000 L-0.000,2.000 C-0.000,0.895 0.895,-0.000 2.000,-0.000 L20.000,-0.000 C21.105,-0.000 22.000,0.895 22.000,2.000 L22.000,16.000 C22.000,17.105 21.105,18.000 20.000,18.000 Z"
    },
];


export {
    shape_opt as edit_shape_operate,
    edit_point as edit_shape_point,
    updatePoint as edit_update_point,
    common_use as common_use_list,
    shape_arr as edit_shape_json,
    replace_shape_arr as replace_shape_json,
};