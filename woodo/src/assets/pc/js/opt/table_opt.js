import base_opt from '@/assets/pc/js/opt/base_opt.js';
import operate_opt from '@/assets/pc/js/opt/operate_opt.js';
import table_preset from '@/assets/pc/json/TablePreset.json';
import font_family from '@/assets/font/fontFamily.js';

let table_opt = {
	// 形状元素模板
	template: {
		id: '',
		type: 'table',
		group: false,
		lock: false,
		opacity: 1,
		translate: '0,0',
		rotate: '0,0,0',
		scale: '0.5,0.5',
		width: 0,
		height: 0,
		column_width: [],        // 列宽
		row_height: [],          // 行高
		tr_list: [],            // 行列表
		animation: [],
	},
	// 应用的模板 || 全局变量
	using_data: {
		background: {
            type:'color',
            color:'#ffffff',
            image:null
        },
		color: null,
		family: null,
		merge_arr:[],  // 合并单元格信息
	},
	// 初始化
	init: function () {
		let base = Object.assign({}, base_opt);
		return Object.assign(base, this);
	},
	// 选中方法
	select: function (ele) {
		// 错误状态判断
		if (!ele || ele.length !== 1) {
			console.error('params type error');
			return false;
		}
		// 更新左侧栏数据
		let base_msg = base_opt.get_common_message(ele).page,
			table_msg = this.get_edit_message(ele),
			result = Object.assign(base_msg, table_msg);
		result.w = Math.round(result.w);
		result.h = Math.round(result.h);
		result.x = Math.round(result.x);
		result.y = Math.round(result.y);
		ele.addClass('checked');
		// 首次选中生成表格行列拖拽框
		if(ele.find('.table_resizer').length === 0 && !ele.hasClass('lock')) this.set_resizer_border(ele);
		return result;
	},
	// 获取左侧栏面板数据
	get_edit_message: function (ele) {
		let row = ele.find('tr').length,
			column = ele.find('tr').find('td').length / row,
			selected_cel_message = this.get_cel_message(this.get_edit_cel(ele)),
            $table = ele.find('table'),
			$edit = ele.find('.cel_edit'),
			$select = ele.find('.cel_selected'),
			$standard_row = ele.find('tr[data-row=' + selected_cel_message.cel_row_arr[0] + ']'),
			$standard_cel = ele.find('td[data-row=' + selected_cel_message.cel_row_arr[0] + '][data-column=' + selected_cel_message.cel_column_arr[0] + ']'),
			result = {};
		// 获取单元格文本信息（第一个单元格为准）
		if ($standard_cel[0].innerHTML !== '') result = this.get_table_text_message($standard_cel);
		// 获取表格列数
		result.line = column;
		// 获取表格行数
		result.row = row;
		// 行高 
		result.column_height = Math.ceil(base_opt.fn.unit_2_px($standard_row.css('height')) / 2);
		// 列宽
		result.row_width = Math.ceil(base_opt.fn.unit_2_px($standard_cel.attr('width')) / 2);
        // 背景
		result.background = base_opt.background_style_2_obj($standard_cel);
        // 边框
		result.border_w = $table.attr('data-border-width');
		result.border_c = $table.attr('data-border-color');
		result.border_s = $table.attr('data-border-style');
		// 边框颜色转换
		if (result.border_c.indexOf('#') >= 0) {
			// 将哈希值转成rgb值
			result.border_c = base_opt.fn.color_exchange_function('hex', result.border_c);
		}
		let border_color_arr = base_opt.fn.parse_rgba(result.border_c);
		if(border_color_arr.a > 0){
			result.border_c = `rgba(${border_color_arr.r}, ${border_color_arr.g}, ${border_color_arr.b}, ${border_color_arr.a})`;
			result.border_o = border_color_arr.a*100
		}else{
			result.border_c = 'transparent';
			result.border_o = 100
		}
		// 获取元素透明度
		result.opacity = Math.ceil(ele.find('.ele_rotate').css('opacity') * 100);
		if(ele.find('.cel_edit,.cel_selected').length !== 0){
			result.not_x = true;
			result.not_y = true;
		}
		result.table_preset = ele.find('table').attr('data-preset');
		result.not_rotate = true;
		// 编辑状态禁止修改表格通用操作
		if ($edit.length > 0 || $select.length > 0){
			result.not_position = true;
			result.not_w = true;
		}
		return result;
	},
	// 获取单元格内富文本数据
	get_table_text_message: function (ele) {
		// 错误状态判断
		if (!ele || ele.length !== 1) {
			console.error('params type error');
			return false;
		}
		let $text = ele.find('.show_text'),
			$span = $text.find('span'),
			$ol = $text.find('ol').eq(0),
			$ul = $text.find('ul').eq(0),
			ele_scale = [0.5, 0.5],
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
				text_decoration = $(this).css('textDecoration') || $(this).css('textDecorationLine');
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
		result.size = size_arr.length > 0 ? base_opt.fn.unit_2_px(size_arr[0]) : base_opt.fn.unit_2_px($text.css('fontSize'));
		result.size = Math.floor(result.size * ele_scale[0]);
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
			if (typeof val === 'undefined' || val === '' || val === 'none' || val.indexOf('underline') < 0) return text_underline = 'none';
		});
		result.text_underline = text_decoration_arr.length > 0 ? text_underline : $text.css('textDecorationLine') && $text.css('textDecorationLine').indexOf('underline') >= 0 ? 'underline' : 'none';
		// 获取文本中划线
		let text_linethrough = 'linethrough';
		$.each(text_decoration_arr, function (key, val) {
			if (typeof val === 'undefined' || val === '' || val === 'none' || val.indexOf('line-through') < 0) return text_linethrough = 'none';
		});
		result.text_linethrough = text_decoration_arr.length > 0 ? text_linethrough : $text.css('textDecorationLine') && $text.css('textDecorationLine').indexOf('line-through') >= 0 ? 'linethrough' : 'none';
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
		return result;
	},
	// 表格元素 - 节点 -> 数据方法
	dom_2_ele: function (dom) {
		// 错误状态判断
		if (!dom || dom.length <= 0) {
			console.error('params type error');
			return false;
		}
		let type = dom.attr('data-type'),
			transform = base_opt.get_transform(dom),
			$scale = dom.find('.ele_scale'),
			$table = dom.find('table'),
			$trs = $table.find('tr'),
			tr_count = $trs.length,
			td_count = $trs.eq(0).find('td').length,
			tr_list = [],
			row_h_arr = [],
			column_w_arr = [],
			obj = {};
		$trs.each(function () {
			let $tr = $(this),
				row_h = $tr.attr('height'),
				arr = [];
			if (row_h_arr.length < tr_count) row_h_arr.push(row_h);
			$tr.find('td').each(function () {
				let $td = $(this),
					column_w = $td.attr('width'),
					obj = {};
				if (column_w_arr.length < td_count) column_w_arr.push(column_w);
				obj.colspan = $td.attr('colspan');
				obj.rowspan = $td.attr('rowspan');
                obj.hide = $td.hasClass('merge_hide');
                // 背景色
                obj.background = base_opt.background_style_2_obj($td);
                // 边框样式
				obj.border = {
					width: parseFloat($table.attr('data-border-width')),
					style: [$td.css('border-top-style'),$td.css('border-right-style'),$td.css('border-bottom-style'),$td.css('border-left-style')],
					color: [$td.css('border-top-color'),$td.css('border-right-color'),$td.css('border-bottom-color'),$td.css('border-left-color')],
				}
                obj.content = $td.html();
				arr.push(obj);
			});
			tr_list.push(arr);
		});
		// 获取元素通用数据
		obj.id = dom.attr('id');
		obj.type = type;
		obj.preset = $table.attr('data-preset');
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
		obj.width = base_opt.fn.unit_2_px($scale.css('width'));
		obj.height = base_opt.fn.unit_2_px($scale.css('height'));
		obj.tr_list = tr_list;
		obj.column_width = column_w_arr;
		obj.row_height = row_h_arr;
		return obj;
	},
	// 表格元素 - 数据 -> 节点方法
	ele_2_dom:function (obj, is_str) {
		// 错误状态判断
		if (!obj || typeof obj !== 'object' || !obj.id) {
			console.error('params type error');
			return false;
		}
		let ele = base_opt.fn.clone_object(obj);
		//1、数据处理
		ele.lock = (ele.lock ? 'lock' : '');
		ele.group  = (ele.group ? ele.group : '');
		let translate_arr = ele.translate.split(',');
		ele.translate_x = translate_arr[0];
		ele.translate_y = translate_arr[1];
		ele.rotate_deg = ele.rotate.split(',')[0];
		ele.preset = (ele.preset ? ele.preset : '');
		ele.preset_obj = (ele.preset ? table_preset.table_preset_list.filter(item => item.table.preset === ele.preset)[0] : null);
		let tds = [];
		ele.tr_list.forEach(function (tr, tr_index) {
			tr.row = tr_index;
			tr.bg = ((ele.preset_obj !== null && ele.preset_obj.table.even) ? true : false);
			tr.forEach(function (td, td_index) {
				td.row = tr_index;
				td.column = td_index;
				// 预设样式处理
				if (ele.preset_obj !== null){
					if (((tr_index + 1) % 2) === 0) {
						if (td.background.color !== ele.preset_obj.table.even) tr.bg = false;
					} else {
						if (td.background.color !== ele.preset_obj.table.odd) tr.bg = false;
					}
				}
				// 处理文本数据，使用js处理
				let text_content = document.createElement('div');
				text_content.innerHTML = td.content;
				text_content = text_content.firstElementChild;
				text_content.setAttribute('contenteditable', 'true');
				td.content = text_content.outerHTML;
				tds.push(td);
			});
		});
		// 合并单元格处理
		tds.forEach(function(td, td_index){
			let row = Number(td.row),
				column = Number(td.column),
				rowspan = Number(td.rowspan),
				colspan = Number(td.colspan);
			td.merge = ((rowspan !== 1 || colspan !== 1) ? 'standard_merge' : '');
			td.hide = (td.hide ? 'merge_hide' : '');
			let merge_id = base_opt.fn.uuid();
			tds.forEach(function (_td, _td_index) {
				let _row = Number(_td.row),
					_column = Number(_td.column)
				if ((row <= _row && _row < row + rowspan) && (column <= _column && _column < column + colspan) && (_row !== row || _column !== column)) {
					td.merge_id = merge_id;
					_td.merge_id = merge_id;
				}
			})
		});
		let border_color = ele.border_c || ele.tr_list[0][0].border.color[0];
		let border_style = ele.border_s || (ele.tr_list[0][0].border && ele.tr_list[0][0].border.style ? ele.tr_list[0][0].border.style[0] : 'solid');
		let border_width = ele.border_w || ele.tr_list[0][0].border.width;
		// 边框颜色转换
		if (border_color.indexOf('#') >= 0) {
			// 将哈希值转成rgb值
			border_color = base_opt.fn.color_exchange_function('hex', border_color);
		}
		if(border_color == 'transparent' || base_opt.fn.parse_rgba(border_color).a <= 0){
			border_color = 'transparent';
			border_style = 'solid';
		}
		// 封装table内容
        let table_content = '';
		ele.tr_list.forEach(function (tr, tr_index) {
			let td_border_style;
			table_content += `<tr data-row="${tr.row}" height="${ele.row_height[tr.row]}">`;
			tr.forEach(function (td, td_index) {
                // 旧表格边框数据处理
				td_border_style = `border-width:${ele.border_w};border-style:${ele.border_s};border-color:${ele.border_c};`
				// 表格边框数据处理
				if(td.border){
					td_border_style  = `border-width:${td.border.width}px;border-style:${td.border.style[0]} ${td.border.style[1]} ${td.border.style[2]} ${td.border.style[3]};border-color:${td.border.color[0]} ${td.border.color[1]} ${td.border.color[2]} ${td.border.color[3]};`
				}
                let border_hide = table_opt.border_type_split(ele,td);
				let merge_id = td.merge_id ? `data-merge="${td.merge_id}"` : '';
				let td_html = `<td class="${td.hide} ${td.merge}" style="${td_border_style} ${border_hide}" ${merge_id} data-row="${td.row}" data-column="${td.column}" rowspan="${td.rowspan}" colspan="${td.colspan}" width="${ele.column_width[td.column]}">${td.content}</td>`;
                // 旧数据处理
                td.background = table_opt.old_background_deal(td.background);
                // 背景色处理
                let $td = $(td_html);
                let background_style = base_opt.background_obj_2_style(td.background);
                $td.attr('data-radialtype', '');
                $td[0].style.cssText += background_style;
                td_html = $td[0].outerHTML;
                table_content += td_html;
            });
            table_content += `</tr>`;
        });
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
						<div class="ele_rotate" data-rotate="${ele.rotate}" style="width:${ele.width / 2}px; height:${ele.height / 2}px; transform:rotate(${ele.rotate_deg}deg); opacity:${ele.opacity};">
							<div class="ele_scale" data-scale="${ele.scale}" style="width:${ele.width}px; height:${ele.height}px; transform:scale(${ele.scale});">
								<table border="0" cellPadding="0" cellSpacing="0" data-preset="${ele.preset}" data-border-color="${border_color}" data-border-width="${border_width}" data-border-style="${border_style}">
									<tbody>
										${table_content}
									</tbody>
								</table>
							</div>
						</div>
                    </div>`;
		if(is_str){
			return html;
		}
		return $(html);
    },
    // 格式化表格旧数据
    format_table_data: function(data){
        // 错误情况判断
		if (!data || data.type !== 'table') {
			console.error('params type error');
			return false;
		}
		let result = base_opt.fn.clone_object(data);
		if (result.column_w) {
		    result.column_width = [];
		    result.row_height = [];
		    result.tr_list = [];
		    result.column_w.forEach(function (item) {
		        result.column_width.push(Number(item) * 2)
		    });
		    result.row_h.forEach(function (item) {
		        result.row_height.push((Number(item) - 1) * 2)
		    });
		    // 宽高旧数据处理（部分旧表格不存在宽高）
		    if (!result.width) {
		        result.width = 0;
		        result.column_width.forEach(function (item) {
		            result.width = result.width + item;
		        })
		    } else {
		        result.width = Number(result.width) * 2;
		    }
		    if (!result.height) {
		        result.height = 0;
		        result.row_height.forEach(function (item) {
		            result.height = result.height + item;
		        });
		        result.height = Number(result.height) * 1.16;
		    } else {
		        result.height = Number(result.height) * 2;
		    }
		    result.border_w = 2;
		    result.scale = '0.5,0.5';
		    if (result.border_s == 8) {
		        result.border_s = 'dashed';
		    } else if (result.border_s == 16) {
		        result.border_s = 'dotted';
		    } else {
		        result.border_s = 'solid';
		    }
		    result.row_height.forEach(function (row, row_index) {
		        result.tr_list[row_index] = [];
		        result.cel_list.forEach(function (cel) {
		            if (cel.row_index == row_index) {
		                let str = " contenteditable='true' ",
		                    start = cel.content.indexOf('v'),
		                    end = cel.content.indexOf(' class'),
		                    line_start = cel.content.indexOf('1.4');
		                cel.content = cel.content.slice(0, start + 1) + str + cel.content.slice(end, line_start) + '1.1' + cel.content.slice(line_start + 3);
		                result.tr_list[row_index].push(cel);
		            }
		        });
		    });
        }
		result.tr_list.forEach(function (tr, tr_index) {
		    tr.forEach(function (td, td_index) {
                // 背景旧数据处理
                td.background = table_opt.old_background_deal(td.background);
		        let border_hide_html = table_opt.border_type_split(result, td);
		        let background_html = base_opt.background_obj_2_style(td.background);
				td.style_str = `border: ${result.border_w}px ${result.border_s} ${result.border_c}; ${border_hide_html} ${background_html}`;
				// 表格边框数据处理
				if(td.border){
					td.style_str  = `border-width:${td.border.width}px;border-style:${td.border.style[0]} ${td.border.style[1]} ${td.border.style[2]} ${td.border.style[3]};border-color:${td.border.color[0]} ${td.border.color[1]} ${td.border.color[2]} ${td.border.color[3]}; ${background_html}`
				}
		    })
		})
		// 返回格式化数据
		return result;
    },
	// 生成方法
	build: function (obj) {
		let template = Object.assign(base_opt.fn.clone_object(this.template), obj),
			data = base_opt.fn.clone_object(this.using_data),
			using_color = data.color == null ? '#000000' : data.color,
			using_family = data.family == null ? '' : data.family,
			using_background = data.background == null ? '#ffffff' : data.background,
			tr_list = [],
			th_list = [],
			cel_content = '',
			result, $dom;
		let init_size = this.get_init_size(template.x, template.y);
		let column_width = init_size.cell[0];
        let row_height = init_size.cell[1];
        let border = {
            width: 1,
            style: ['solid','solid','solid','solid'],
            color: ["rgb(0, 0, 0)", "rgb(0, 0, 0)", "rgb(0, 0, 0)", "rgb(0, 0, 0)"]
        }
		for (let i = 0; i < template.x; i++) {
			template.row_height.push(row_height);
			for (let j = 0; j < template.y; j++) {
				if (i === 0) template.column_width.push(column_width);
				if (template.content) {
					cel_content = content[i][j]
				}
				let th = {
					colspan: 1,
					rowspan: 1,
                    hide: false,
                    border: border,
					background: using_background,
					content: '<div contenteditable="false" class="show_text" style="font-size:28px;text-align:center;line-height:1.4;color:' + using_color + ';font-family:' + using_family + '">' + cel_content + '</div>'
				};
				th_list.push(th);
			}
			tr_list.push(th_list);
			th_list = [];
		}
		template.width = init_size.table[0];
		template.height = init_size.table[1];
		template.tr_list = tr_list;
		template.id = base_opt.fn.uuid();
		$dom = this.ele_2_dom(template);
		result = $dom.prop('outerHTML');
		return result;
	},
	// 生成表格对象(黏贴站外表格)
	build_obj: function(obj,that){
		let template = Object.assign(base_opt.fn.clone_object(this.template), obj),
			data = base_opt.fn.clone_object(this.using_data),
			page_h = Number(that.document_info.height) * 0.6 * 2,
			row_height = 45,
			width = 1,
			height = template.row * row_height + 1,
			tr_list = [],
			th_list = [],
			cel_content = '';
		for (let index = 0; index < template.width_arr.length; ++index) {
			width += template.width_arr[index];
		}
		if (template.width_arr.length < template.column) {
			width += (template.column - template.width_arr.length) * 200;
			for (let _index = 0; _index < template.column - template.width_arr.length + 1; ++_index) {
				template.width_arr.push(200);
			}
		}
		// 画布自适应大小
		if (template.row > 12) {
			row_height = page_h / template.row;
		}
		for (let i = 0; i < template.row; i++) {
			template.row_height.push(row_height);
			for (let j = 0; j < template.column; j++) {
				if (template.row_arr[i][j]) {
					cel_content = template.row_arr[i][j]
				} else {
					cel_content = '<br>'
				}
				if(!data.color){
					data.color="#000000";
				}
				if(!data.family){
					data.family="";
				}
				let th = {
					colspan: 1,
					rowspan: 1,
					hide: false,
					background: data.background || "#ffffff",
					content: '<div contenteditable="true" class="show_text" style="font-size:28px;text-align:center;line-height:1.4;color:' + data.color + ';font-family:' + data.family + '">' + cel_content + '</div>'
				};
				th_list.push(th);
			}
			tr_list.push(th_list);
			th_list = [];
		}
		template.width = width;
		template.height = height;
		template.tr_list = tr_list;
		template.column_width = template.width_arr;
		template.id = base_opt.fn.uuid();
		return template;
    },
    // 旧背景色处理
    old_background_deal: function (data) {
        // 新数据拦截
        if (typeof data !== 'string' && data.color) return data;
        return {
            type: 'color',
            color: data,
            image: null
        }
    },
	// 设置节点定位适应
	fit_dom_offset: function (ele) {
		// 错误状态判断
		if (!ele || ele.length !== 1 || ele.attr('data-type') !== 'table') {
			console.error('params type error');
			return false;
		}
		let $page = $('.page_contain .edit_page'),
			// 获取画布大小
			page_w = $page[0].offsetWidth,
			page_h = $page[0].offsetHeight,
			// 获取表格大小
			ele_msg = base_opt.compute_ele_offset(ele).page,
			ele_w = ele_msg.w,
			ele_h = ele_msg.h,
			ele_x, ele_y;
		ele_x = page_w / 2 - ele_w / 2;
		ele_y = page_h / 2 - ele_h / 2;
		base_opt.set_translate(ele, ele_x, ele_y);
	},
	// 输入监听事件
	table_edit_listener: function (ele) {
		// 错误状态判断
		if (!ele || ele.length !== 1) return console.error('params type error');
        // 1、同步表格高度
        let height = ele.find('table').height();
		ele.find('.ele_scale').css('height', height);
        ele.find('.ele_rotate').css('height', height / 2);
		// 2、操作框位置计算
        operate_opt.reset_rect(ele);
		// 3、同步行列拖动条位置
        this.set_resizer_border(ele);
	},
	// 同步行列拖动条
	set_resizer_border: function (ele) {
        // 清除旧边框
        if (ele.find('.table_resizer').length > 0) ele.find('.table_resizer').remove();
        // 校验单元格宽度
        this.validate_td_size(ele);
		let $tr = ele.find('tr');
		let $scale = ele.find('.ele_scale');
        let border_w = (+ele.find('td').css('border-width').slice(0, -2));
		let	column_w_arr = [];
		let	row_h_arr = [];
		let	resize_left = 0;
		let	resize_top = 0;
		$tr.each(function (r_index) {
            row_h_arr.push($(this)[0].clientHeight)
			if(r_index === 0){
				let $td = $(this).find('td');
				$td.each(function () {
                    column_w_arr.push(Number($(this).attr('width')));
				});
			}
        });
		// 生成纵向拖拽边框
		let $border_left = $(`<div class="table_resizer table_column_resizer left" style="left:-5px;" data-column='left'></div>`);
		$border_left.appendTo($scale);
		column_w_arr.forEach(function (column, c_index) {
			let $column_border = $(`<div class="table_resizer table_column_resizer"></div>`);
            resize_left = Number(column) + resize_left;
			$column_border.attr({
				'data-column': c_index === column_w_arr.length - 1 ? 'right' : c_index
			}).css({
                'left': resize_left,
				'width': border_w + 6
			});
			$column_border.appendTo($scale);
		});
		// 生成横向拖拽边框
		let $border_top = $(`<div class="table_resizer table_row_resizer top" style="top:-5px;" data-row='top'></div>`);
		$border_top.appendTo($scale);
		row_h_arr.forEach(function (row, r_index) {
			let $row_border = $(`<div class="table_resizer table_row_resizer"></div>`);
			resize_top += Number(row);
			$row_border.attr({
				'data-row': r_index === row_h_arr.length - 1 ? 'bottom' : r_index
			}).css({
				'top': resize_top,
				'height': border_w + 6
			});
			$row_border.appendTo($scale);
		});
	},
	// 获取正在编辑单元格
	get_edit_cel: function (ele, nohide) {
		let not_hide = nohide ? ':not(:hidden)' : ''; // 是否不需要被合并隐藏的单元格
		let $table = ele.find('table'),
			$checked_cel = $table.find(`.cel_edit${not_hide}`),
			$select_cel = $table.find(`.cel_selected${not_hide}`),
			$cel;
		// 判断当前是否为单选表格编辑
		if (ele.attr('data-type') !== 'table') return false;
		// 获取选中单元格，优先获取选中的，没有再获取编辑的
		if ($select_cel.length > 0) {
			$cel = $select_cel;
		} else {
			$cel = $table.find('td');
			if($checked_cel.length>0){
				$cel = $checked_cel;
			}
		}
		return $cel;
	},
	// 合并单元格判断
	get_merge_cel: function($select,ele,callback){
		if(ele.length === 0) ele = $select.parents('.ele_item');
		if (Number($select.attr('colspan')) !== 1 || Number($select.attr('rowspan')) !== 1) {
			let merge_cel_arr = [],
				_rowspan = Number($select.attr('rowspan')),
				_colspan = Number($select.attr('colspan')),
				standard_row = Number($select.attr('data-row')),
				standard_column = Number($select.attr('data-column'));
			ele.find('td').each(function (index, td) {
				let last = true,
					_row = Number($(td).attr('data-row')),
					_col = Number($(td).attr('data-column'));
				if(index === ele.find('td').length - 1) last = true;
				if ((standard_row <= _row && _row < standard_row + _rowspan) && (standard_column <= _col && _col < standard_column + _colspan) && (_row !== standard_row || _col !== standard_column)) {
					if(typeof callback !== 'function'){
						merge_cel_arr.push($(td));
					}else{
						callback($(td),last); //不包括自身
					}
				}
			})
			if (typeof callback !== 'function') return merge_cel_arr;
		}else{
			if (typeof callback !== 'function') return false;
		}
	},
	// 右键菜单判断是否存在合并单元格
	merge_table_judge: function (ele) {
		// 错误状态判断
		if (!ele || ele.length !== 1 || typeof data !== 'string') {
			console.error('params type error');
			return false;
		}
		let $selected = this.get_edit_cel(ele),
			has_merge = false;
		$selected.each(function(){
			this.get_merge_cel($(this),ele,function(){
				has_merge = true;
			})
		});
		return has_merge;
	},
	// 提取选中单元格行列数据
	get_cel_message: function (dom) {
		// 错误状态判断
		if(!dom || dom.length <= 0){
			console.error('params type error');
			return false;
		}
		let $selected = dom,
			standard_row = '',
			standard_column = '',
			cel_row_arr = [],
			cel_column_arr = [],
			select_cel_info = {};
		$selected.each(function (index, sel) {
			cel_row_arr.push(Number($(this).attr('data-row')));
			cel_column_arr.push(Number($(this).attr('data-column')));
			if (index == 0) {
				standard_row = Number($(this).attr('data-row'));
				standard_column = Number($(this).attr('data-column'));
			}
		});
		// 索引去重
		let _column_arr = [], _row_arr = [];
		for (var i = 0; i < cel_column_arr.length; i++) {
			if (cel_column_arr.indexOf(cel_column_arr[i]) == i) {
				_column_arr.push(cel_column_arr[i])
			}
		}
		for (var i = 0; i < cel_row_arr.length; i++) {
			if (cel_row_arr.indexOf(cel_row_arr[i]) == i) {
				_row_arr.push(cel_row_arr[i])
			}
		}
		cel_column_arr = _column_arr;
		cel_row_arr = _row_arr;
		// 索引排序
		cel_column_arr.sort(function (a, b) {
			return a - b;
		});
		cel_row_arr.sort(function (a, b) {
			return a - b;
		});

		select_cel_info.standard_row = standard_row;
		select_cel_info.standard_column = standard_column;
		select_cel_info.cel_row_arr = cel_row_arr;
		select_cel_info.cel_column_arr = cel_column_arr;
		return select_cel_info;
	},
	// 遍历存储格单元格样式
	save_cel_style: function (ele) {
		base_opt.fn.set_selection(ele);
		let font_style = '',
			has_link = false,
			select_node = window.getSelection().anchorNode,
			color = base_opt.fn.clone_object(this.using_data).color || "#000000";
		// 判断选中节点是否为span
		if (select_node.nodeName === 'DIV') {
			select_node = $(select_node).find('*:not(div)')[0];
		} else {
			select_node = select_node.parentNode;
		}
		if (select_node) {
			// 循环获取样式
			while (select_node.nodeName !== 'DIV') {
				if(select_node.nodeName === 'A'){
					select_node = select_node.parentNode;
					continue;
				}
				if(select_node.nodeName === 'SPAN'){
					let a_len = $(select_node).find('a').length;
					let all_len = $(select_node).contents().length;
					// 如果节点下面只有a标签
					if(all_len - a_len <= 0){
						select_node = select_node.parentNode;
						continue;
					}
				}
				font_style += select_node.style.cssText;
				select_node = select_node.parentNode;
			}
			if (select_node.nodeName === 'DIV' && font_style === '') {
				font_style += select_node.style.cssText;
			}
		} else {
			let $focus = ele;
			font_style = $focus[0].style.cssText;
		}
		// 恢复原本的超链接样式
		if (has_link) font_style = font_style.replace(/underline/, "none");
		// 储存格式刷状态
		if (font_style && font_style !== '') {
			// 处理非文本样式
			let style_arr = font_style.split(';'),
				not_font_style = ['width', 'height', 'min-height', 'transform', 'padding'];
			style_arr = style_arr.filter(function (item) {
				let key = item.split(':')[0].replace(/(^\s*)|(\s*$)/g, "");
				if (not_font_style.indexOf(key) < 0) return item;
			});
			style_arr = style_arr.join(';') + ';';
			if (style_arr.indexOf('font-size') < 0) style_arr += 'font-size:28px;';
			if (style_arr.indexOf('text-align') < 0) style_arr += 'text-align:center;';
			if (style_arr.indexOf('line-height') < 0) style_arr += 'line-height:1.4;';
			if (style_arr.indexOf('color:') < 0) style_arr += 'color:' + color + ';';
			return style_arr.replace(/\"/g, "'");
		} else {
			return 'font-size:28px;text-align:center;line-height:1.4;color:' + color + ';';
		}
	},

	// 设置边框颜色
	set_border_color: function (ele, data) {
		// 错误状态判断
		if (!ele || ele.length !== 1 || !data) {
			console.error('params type error');
			return false;
		}
        let $td = ele.find('td');
		let $table = ele.find('table');
        $table.attr('data-border-color',data);
		$td.each(function () {
            let $this = $(this)
			let borderColor = $this[0].style.borderColor;
            if (borderColor.indexOf('transparent') < 0) {
                $this.css('borderColor', data)
            } else {
                $this[0].style.borderColor = '';
                borderColor = borderColor.split(' ');
                $.each(borderColor,function(index,value){
                    if (value.indexOf('transparent') < 0){
                        value = data;
                    }
                    $this[0].style.borderColor += value;
                });
            }
		})
	},
	// 设置边框宽度
	set_border_width: function (ele, data) {
		// 错误状态判断
		if (!ele || ele.length !== 1 || isNaN(Number(data))) {
			console.error('params type error');
			return false;
		}
		let $td = ele.find('td');
        let $table = ele.find('table');
        $table.attr('data-border-width', data);
        $td.each(function () {
            if ($(this)[0].style.cssText.indexOf('transparent') < 0) {
                $(this).css('borderWidth', data)
            }else{
                $(this).css('borderWidth', Number(data) + 1)
            }
		});
		// 重置拖动条(拖动条随边框变化而变化)
		this.set_resizer_border(ele);
	},
	// 设置边框样式
	set_border_style: function (ele, data) {
		// 错误状态判断
		if (!ele || ele.length !== 1 || !data) {
			console.error('params type error');
			return false;
		}
		let $td = ele.find('td');
		$td.each(function () {
			$(this).css('borderStyle', data)
		})
	},
	// 设置边框透明度
	set_border_opacity: function (ele, data) {
		if(!ele || ele.length !== 1 || isNaN(data)) {
			console.error('params type error');
			return false;
		}
		let $td = ele.find('td');
		let $table = ele.find('table');
		let opacity = data / 100;
		$td.each(function () {
            let $this = $(this)
			let top_color = $this.css('border-top-color');
			let right_color = $this.css('border-right-color');
			let bottom_color = $this.css('border-bottom-color');
			let left_color = $this.css('border-left-color');
			// 边框颜色转换
			top_color = top_color.indexOf('#') >= 0 ? base_opt.fn.color_exchange_function('hex', top_color) : top_color;
			right_color = right_color.indexOf('#') >= 0 ? base_opt.fn.color_exchange_function('hex', right_color) : right_color;
			bottom_color = bottom_color.indexOf('#') >= 0 ? base_opt.fn.color_exchange_function('hex', bottom_color) : bottom_color;
			left_color = left_color.indexOf('#') >= 0 ? base_opt.fn.color_exchange_function('hex', left_color) : left_color;
			$this.css({
				'border-top-color':`rgba(${base_opt.fn.parse_rgba(top_color).r}, ${base_opt.fn.parse_rgba(top_color).g}, ${base_opt.fn.parse_rgba(top_color).b}, ${opacity})`,
				'border-right-color':`rgba(${base_opt.fn.parse_rgba(right_color).r}, ${base_opt.fn.parse_rgba(right_color).g}, ${base_opt.fn.parse_rgba(right_color).b}, ${opacity})`,
				'border-bottom-color':`rgba(${base_opt.fn.parse_rgba(bottom_color).r}, ${base_opt.fn.parse_rgba(bottom_color).g}, ${base_opt.fn.parse_rgba(bottom_color).b}, ${opacity})`,
				'border-left-color':`rgba(${base_opt.fn.parse_rgba(left_color).r}, ${base_opt.fn.parse_rgba(left_color).g}, ${base_opt.fn.parse_rgba(left_color).b}, ${opacity})`
			})
		});
		// 更新表格边框颜色信息
		let table_border_c = $table.attr('data-border-color');
		if (table_border_c.indexOf('#') >= 0) {
			// 将哈希值转成rgb值
			table_border_c = base_opt.fn.color_exchange_function('hex', table_border_c);
		}
		let border_color_arr = base_opt.fn.parse_rgba(table_border_c);
		if(border_color_arr.a > 0){
			table_border_c = `rgba(${border_color_arr.r}, ${border_color_arr.g}, ${border_color_arr.b}, ${opacity})`;
		}else{
			table_border_c = 'transparent';
		}
		$table.attr('data-border-color',table_border_c);
	},
	// 设置背景色
	set_background: function (ele, data) {
		// 错误状态判断
		if (!ele || ele.length !== 1) {
			console.error('params type error');
			return false;
		}
        let $edit = this.get_edit_cel(ele);
        let background = base_opt.fn.clone_object(data);
        let color_data = background.color;
        let image_data = background.image;
        let is_image = background.type.indexOf('image') >= 0;
        // 清除预设版式样式
        ele.find('table').attr('data-preset', '');
		$edit.each(function () {
            let $td = $(this);
            // 无图片类型时默认铺满
            if (is_image && !image_data.type) {
                if ($td.css('background-image') === 'none' || $td.css('background-repeat') !== 'repeat') {
                    image_data.type = 'cover';
                } else if ($td.css('background-repeat') === 'repeat') {
                    image_data.type = 'repeat';
                }
            };
            // 清空背景样式
            $td.css('background', '');
            // 获取背景样式
            let background_style = base_opt.background_obj_2_style(background);
            // 设置背景样式
            $td[0].style.cssText += background_style;
            // 渐变设置渐变类型属性
            if (background.type === 'gradient' && background.color.type === 'radial') {
                $td.attr('data-radialtype', color_data.direction || 'center');
            } else {
				$td.removeAttr('data-radialtype');
			}
        });
	},
	// 设置表格行高
	set_row_height: function (ele, data) {
		// 错误状态判断
		if (!ele || ele.length !== 1) {
			console.error('params type error');
			return false;
		}
		let $tr = ele.find('tr'),
			row_index_arr = this.get_cel_message(this.get_edit_cel(ele)).cel_row_arr;
		row_index_arr.forEach(function (row_index) {
			$tr.each(function () {
				if (Number($(this).attr('data-row')) === row_index) $(this).attr('height', data * 2);
			})
		});
		// 更新数据
		this.table_edit_listener(ele);
	},
	// 设置表格列宽
	set_column_width: function (ele, data) {
		// 错误状态判断
		if (!ele || ele.length !== 1) {
			console.error('params type error');
			return false;
		}
		let $td = ele.find('td'),
			width_diff = 0,
			column_index_arr = this.get_cel_message(this.get_edit_cel(ele)).cel_column_arr;
		column_index_arr.forEach(function (column_index) {
			$td.each(function () {
				if (Number($(this).attr('data-column')) === column_index) {
					if (Number($(this).attr('data-row')) === 0) {
						width_diff += data * 2 - Number($(this).attr('width'));
					}
					$(this).attr('width', data * 2);
				}
			});
        });
        let result = ele.find('table').width() + width_diff;
        if (result < 0) result = 50; 
		ele.find('.ele_scale').css('width', result);
        ele.find('.ele_rotate').css('width', result / 2);
		this.table_edit_listener(ele);
	},
	// 返回表格初始化宽高，单元格宽高(x:行数，y:列数)
	get_init_size: function (x, y) {
		if (isNaN(x) || isNaN(y)) return;
		let $page = base_opt.get_canvas_page();
        let page_h = $page[0].clientHeight * 0.9;
        // 设置初始表格的宽度为画布的0.8
        let table_width = $page.width() * 0.8;
		let column_width = table_width / y;
		let row_height = 45;
		let table_height = row_height * x;
        // 画布自适应大小
		if (table_height > page_h) {
			table_height = page_h;
			row_height = page_h / x;
        }
		return {
			'table': [table_width * 2, table_height * 2],
            'cell': [column_width * 2, row_height * 2],
		};
    },
    // 校验单元格宽高数值
    validate_td_size: function (ele){
        // 错误状态判断
        if (!ele || ele.length !== 1) {
            console.error('params type error');
            return false;
        }
        ele.find('td').each(function(){
            let _width = Number($(this).attr('width'));
            if (isNaN(_width) || _width !== _width) {
                $(this).attr('width', $(this)[0].offsetWidth);
            }
        })
    },
	// 设置缩放 data:{w,h}
	set_size: function (ele, data) {
		// 错误状态判断
		if (!ele || ele.length !== 1 || !data || (!data.w && data.w !== 0) || (!data.h && data.h !== 0)) {
			console.error('params type error');
			return false;
		}
		let $scale = ele.find('.ele_scale'),
			$rotate = ele.find('.ele_rotate'),
			$tr = ele.find('tr'),
			$td = ele.find('td'),
			o_width = $scale.width() / 2,
			o_height = $scale.height() / 2,
			scale_w = data.w / o_width,
			scale_h = data.h / o_height;
		$tr.each(function(){
			let height = +$(this).attr('height');
			if (height * scale_h <= 20) return;
			$(this).attr('height', height * scale_h);
		})
		$td.each(function(){
			let width = +$(this).attr('width');
			$(this).attr('width', width * scale_w);
		})
		$scale.css({
			'height': data.h * 2,
			'width': data.w * 2,
		});
		$rotate.css({
			'height': data.h,
			'width': data.w,
		});
		table_opt.table_edit_listener(ele);
	},
	// 增删行列
	set_row_column: function (ele, data, callback) {
		// 错误状态判断
		if (!ele || ele.length !== 1 || typeof data !== 'string') {
			console.error('params type error');
			return false;
		}
		let that = this, 
			$scale = ele.find('.ele_scale'),
			$table = ele.find('table'),
			$td = ele.find('td'),
			$tr = ele.find('tr'),
			$new_row = null, 			 // 新增行dom
			focus_column_index = 0,      //结束聚焦单元格列索引
			focus_row_index = 0,         //结束聚焦单元格行索引
			width_diff = 0,
			delete_table = false,
			merge_id = [],
            select_message = that.get_cel_message(that.get_edit_cel(ele)),
			top_index = Number(select_message.cel_row_arr[0]),
			left_index = Number(select_message.cel_column_arr[0]),
			bottom_index = Number(select_message.cel_row_arr[select_message.cel_row_arr.length - 1]),
			right_index = Number(select_message.cel_column_arr[select_message.cel_column_arr.length - 1]);
		// 存储合并单元格信息
		$td.each(function () {
			if ($(this).attr('data-merge') && !$(this).hasClass('merge_hide')) {
                let _mergeId = $(this).attr('data-merge');
                if (merge_id.filter(id => id == _mergeId).length) {
                    return;
                }
				let obj = {
					'row': Number($(this).attr('data-row')),
					'column': Number($(this).attr('data-column')),
					'rowspan': Number($(this).attr('rowspan')),
					'colspan': Number($(this).attr('colspan')),
                    'id': _mergeId
                }
				that.using_data.merge_arr.push(obj);
				//存储合并单元格的id信息
				merge_id.push($(this).attr('data-merge'));
			}
        });
        let old_merge_arr = base_opt.fn.clone_object(that.using_data).merge_arr;
		// 编辑失焦
		$('.show_text').blur();
		switch (data) {
			case 'add_left':
				focus_column_index = left_index;
				// 遍历保存文本样式
				$td.each(function () {
					if ($(this).attr('data-column') == left_index) {
						let style_arr = that.save_cel_style($(this).find('.show_text')),
							cur_html = $(this)[0].outerHTML,
							new_html;
						width_diff = Number($(this).attr('width'));
						// 清除新增列的高亮样式
						if(style_arr.split(';').length>0){
							let css_arr = style_arr.split(';');
							let no_background_arr =  css_arr.filter((value)=>{
								return value.indexOf('background') == -1;
							})
							style_arr = no_background_arr.join(';');
						}
						new_html = '<td class="cel_edit" data-column="' + $(this).attr('data-column') + '" data-row="' + $(this).attr('data-row') + '" width="' + $(this).attr('width') + '" colspan="1" rowspan="1" style="' + $(this).attr('style') + '">' + '<div contenteditable="true" class="show_text" style="' + style_arr + '"><br></div>' + '</td>'
						$(this).before(new_html);
                        $(this)[0].outerHTML = cur_html;
					}
				});
				// 新增列拖动框
                ele.find('.table_column_resizer').eq(0).before('<div class="table_resizer table_column_resizer"></div>');
                that.using_data.merge_arr.forEach((merge_item, merge_index) => {
                    // 当前行位于合并单元格前
                    if (old_merge_arr[merge_index].column >= focus_column_index) {
                        merge_item.column++;
                    }
                });
				// 更新表格单元格的列宽
				ele.find('td').each(function () {
					$(this).attr('width', $(this).attr('width') - width_diff/ele.find('tr').eq(0).find('td').length);
				});
                $scale.css('width', $table.width());
				ele.find('.ele_rotate').css('width', $table.width() / 2);
				this.table_edit_listener(ele);
				break;	
			case 'add_right':
				focus_column_index = right_index + 1;
				// 遍历保存文本样式
				$td.each(function () {
					if ($(this).attr('data-column') == right_index) {
						let style_arr = that.save_cel_style($(this).find('.show_text')),
							cur_html = $(this)[0].outerHTML,
							new_html;
						width_diff = Number($(this).attr('width'));
						// 清除新增列的高亮样式
						if(style_arr.split(';').length>0){
							let css_arr = style_arr.split(';');
							let no_background_arr =  css_arr.filter((value)=>{
								return value.indexOf('background') == -1;
							})
							style_arr = no_background_arr.join(';');
						}
						new_html = '<td class="cel_edit" data-column="' + $(this).attr('data-column') + '" data-row="' + $(this).attr('data-row') + '" width="' + $(this).attr('width') + '" colspan="1" rowspan="1" style="' + $(this).attr('style') + '">' + '<div contenteditable="true" class="show_text" style="' + style_arr + '"><br></div>' + '</td>'
						$(this).after(new_html);
						$(this)[0].outerHTML = cur_html;
					}
				});
				// 新增列拖动框
				ele.find('.table_column_resizer').eq(0).before('<div class="table_resizer table_column_resizer"></div>');
				// 更新表格单元格的列宽
				ele.find('td').each(function () {
					$(this).attr('width', $(this).attr('width') - width_diff/ele.find('tr').eq(0).find('td').length);
				});
                $scale.css('width', $table.width());
				ele.find('.ele_rotate').css('width', $table.width() / 2);
				this.table_edit_listener(ele);
				break;
			case 'add_top':
                focus_row_index = top_index;
				$tr.each(function () {
					if ($(this).attr('data-row') == top_index) $(this).before($(this)[0].outerHTML);
				});
				$new_row = ele.find('tr').eq(top_index);
				// 清除新增行的合并信息
				$new_row.find('td').attr({ 'colspan': 1, 'rowspan': 1 }).removeClass('merge_hide').removeClass('standard_merge');
				
				$new_row.find('td').each(function(){
					// 清除新增行的高亮样式
					$(this).find('.show_text').css({'background':''});
                })
                that.using_data.merge_arr.forEach((merge_item, merge_index) => {
                    // 当前行位于合并单元格前
                    if (old_merge_arr[merge_index].row >= focus_row_index) {
                        merge_item.row++;
                    }
                });
				// 清除新增行的文字内容
				that.clear_content(ele, ele.find('tr').eq(top_index).find('td'));
				// 新增行拖动框
				ele.find('.table_row_resizer').eq(0).before('<div class="table_resizer table_row_resizer"></div>');
				break;
			case 'add_bottom':
				focus_row_index = bottom_index + 1;
				$tr.each(function () {
					if ($(this).attr('data-row') == bottom_index) $(this).after($(this)[0].outerHTML);
				});
				$new_row = ele.find('tr').eq(bottom_index + 1);
				// 清除新增行的合并信息
				$new_row.find('td').attr({ 'colspan': 1, 'rowspan': 1 }).removeClass('merge_hide').removeClass('standard_merge');
				
				$new_row.find('td').each(function(){
					// 清除新增行的高亮样式
					$(this).find('.show_text').css({'background':''});
				})
				// 清除新增行的文字内容
				that.clear_content(ele, ele.find('tr').eq(bottom_index + 1).find('td'));
				// 新增行拖动框
				ele.find('.table_row_resizer').eq(0).before('<div class="table_resizer table_row_resizer"></div>');
				break;	
			case 'delete_row':
				if (select_message.cel_row_arr.length === ele.find('tr').length) {
					delete_table = true;
					// 删除元素
					ele.remove();
				} else {
					select_message.cel_row_arr.forEach(function (row) {
						$tr.each(function () {
							//当前行等于选择行
							if ($(this).attr('data-row') == row){
								let had_update_merge = []; 
								$(this).find('td').each(function (cel_index, cel) {
									//当前行的td有合并属性并且还未更新合并单元格信息
									if ($(cel).attr('data-merge') && had_update_merge.indexOf($(cel).attr('data-merge')) == -1 && merge_id.includes($(cel).attr('data-merge'))) {
										let merge_obj = that.using_data.merge_arr.filter(item => item.id === $(cel).attr('data-merge'))[0];	
										merge_obj.rowspan = merge_obj.rowspan - 1;
										had_update_merge.push($(cel).attr('data-merge'));
									}
								});
								$(this).remove();
							}
                        });
                        that.using_data.merge_arr.forEach(function (merge_item, merge_index) {
                            //当前行位于合并单元格前
                            if (old_merge_arr[merge_index].row > row) {
                               merge_item.row--;
                            }
                        });
					});
				};
				break;
			case 'delete_line':
				if (select_message.cel_column_arr.length === ele.find('tr').eq(0).find('td').length) {
					delete_table = true;
					// 删除元素
					ele.remove();
				} else {
					select_message.cel_column_arr.forEach(function (column) {
						let had_update_merge = [];
						$td.each(function (td_index,cel) {
							//td在选择列上
							if($(cel).attr('data-column') == column){
								//当前行的td有合并属性并且还未更新合并单元格信息
								if ($(cel).attr('data-merge')&&had_update_merge.indexOf($(cel).attr('data-merge'))==-1&&merge_id.includes($(cel).attr('data-merge'))) {
									let merge_obj = that.using_data.merge_arr.filter(item => item.id === $(cel).attr('data-merge'))[0];	
									merge_obj.colspan = merge_obj.colspan - 1;
									had_update_merge.push($(cel).attr('data-merge'));
                                }
								$(cel).remove();
								width_diff = Number($(cel).attr('width'));
							}
                        });
                        that.using_data.merge_arr.forEach((merge_item, merge_index) => {
                            //当前列位于合并单元格前
                            if (old_merge_arr[merge_index].column > column) {
                                merge_item.column--;
                            }
                        });
					});
                    $scale.width($table.width() - width_diff);
					ele.find('.ele_rotate').width($scale.width() * 0.5);
					// 更新表格单元格的列宽
					ele.find('td').each(function () {
						$(this).attr('width',$(this).outerWidth());
					});
				};
				break;
			case 'delete_table':
				delete_table = true;
				// 删除元素
				ele.remove();
				break;
		}
		if(delete_table && callback && typeof callback === 'function') return callback();
		// 单元格索引梳理
		ele.find('tr').each(function (row_index,row) {
			$(row).attr('data-row', row_index);
			$(row).find('td').each(function (col_index,col) {
				$(col).attr({
					'data-row':row_index,
					'data-column':col_index
				});
			})
		});
		// 预设版式样式梳理
		that.preset_cel_arrange(ele);
		// 合并单元格梳理
		that.merge_cel_arrange(ele);
		// 同步表格数据
		that.table_edit_listener(ele);
		// 不同操作展示不同交互判断
		if (data === 'add_bottom' || data === 'add_top') {
			ele.find('td[data-column=' + focus_column_index + '][data-row=' + focus_row_index + ']').click().find('.show_text').focus();
		} else if (data === 'add_left' || data === 'add_right') {
			ele.find('td[data-column=' + focus_column_index + ']').addClass('cel_selected');
		} else if (data === 'delete_row') {
			ele.find('td').addClass('cel_selected');
		} else if (data === 'delete_line') {
			ele.find('td').addClass('cel_selected');
		}
	},
	// 合并单元格梳理
	merge_cel_arrange: function(ele){
		let that = this,
			$tr = ele.find('tr'),
			$td = ele.find('td'),
			tol_row = $tr.length,
			tol_column = $td.length / tol_row,
			merge_arr = base_opt.fn.clone_object(that.using_data).merge_arr;
		// 清空存储合并数据
		that.using_data.merge_arr = [];
		if ($tr.find('.merge_hide,.standard_merge').length === 0) return;
		// 清除所有合并单元格
		$td.each(function(){
			$(this).attr({
				'colspan' : 1,
				'rowspan' : 1,
				'data-merge': ''
			}).removeClass('merge_hide').removeClass('standard_merge');
		});
		// 重置合并单元格
		merge_arr.forEach(item => {
			//如果合并的单元格被删除，则不需要处理
			if(item.rowspan<=0||item.colspan<=0){
				return;
			}
			if (item.row + item.rowspan > tol_row + 1){
				item.rowspan = tol_row - (item.row + item.rowspan)
			}
			if (item.column + item.colspan > tol_column + 1) {
				item.colspan = tol_column - (item.column + item.colspan)
			}
			$td.each(function () {
				// 1 设置合并id
				let id = base_opt.fn.uuid(),
					cur_row = Number($(this).attr('data-row')),
					cur_col = Number($(this).attr('data-column'));
				// 2 设置隐藏单元格
				if (cur_row >= item.row && cur_row < (item.row + item.rowspan) && cur_col >= item.column && cur_col < (item.column + item.colspan)){
					$(this).addClass('merge_hide').attr({'data-merge': id});
				}
				// 3 设置基准单元格
				if (cur_row === item.row && cur_col === item.column) {
					$(this).attr({
						'colspan': item.colspan,
						'rowspan': item.rowspan,
						'data-merge': id
					}).removeClass('merge_hide').addClass('standard_merge');
				}
			})
		});
	},
	// 预设版式梳理
	preset_cel_arrange: function(ele){
		let $tr = ele.find('tr'),
			preset_type = ele.find('table').attr('data-preset'),
			preset_obj = table_preset.table_preset_list.filter(item => item.table.preset === preset_type)[0];
		if (!preset_obj) return;
		$tr.each(function(tr,current_tr){
			$(current_tr).find('td').each(function(td){
				// 表格颜色梳理
				let loop_start_tr = 0;
				if(preset_obj.table.row_head){
					loop_start_tr = 1;
					if(preset_obj.table.row_head.isLoop){
						$(this).css('background-color',preset_obj.table.row_head.color[td%(preset_obj.table.row_head.color.length)]);
					}else if(preset_obj.table.row_head.color.length==2){
						$(this).css('background-color',td==0?preset_obj.table.row_head.color[0]:preset_obj.table.row_head.color[preset_obj.table.row_head.color.length-1])
					}
				}  
				if(tr>=loop_start_tr){
					$(this).css('background-color',preset_obj.table.row_loop[(tr-loop_start_tr)%(preset_obj.table.row_loop.length)])
					if(preset_obj.table.col_head&&td == 0){
						$(this).css('background-color',preset_obj.table.col_head.color[(tr-loop_start_tr)%(preset_obj.table.col_head.color.length)]);
					};
				}
				// 表格边框梳理
				let row,
					col;
				// 根据表格单元格所在行列位置映射tr_list里的边框
				if(tr==0){
					row = 0;
				}else if(tr>0&&tr<$tr.length-1){
					row = 2;
				}else{
					row = preset_obj.table.tr_list[0].length-1;
				}
				if(td==0){
					col = 0;
				}else if(td>0&&td<$(current_tr).find('td').length-1){
					col = 2;
				}else{
					col = preset_obj.table.tr_list.length-1;
				}
				let setting_border = preset_obj.table.tr_list[row][col].border;
				$(this).css('border-width',`${setting_border.width}px`);
				$(this).css('border-style',`${setting_border.style[0]} ${setting_border.style[1]} ${setting_border.style[2]} ${setting_border.style[3]}`);
				$(this).css('border-color',`${setting_border.color[0]} ${setting_border.color[1]} ${setting_border.color[2]} ${setting_border.color[3]}`);
			})
		});
	},
	// 单元格框选删除行列/内容判断
	judge_cel_delete: function (ele) {
		let all_row = false,
			all_column = false,
			has_content = false,
			$selected = this.get_edit_cel(ele),
			column_index_arr = this.get_cel_message($selected).cel_column_arr,
			row_index_arr = this.get_cel_message($selected).cel_row_arr;
		if (row_index_arr.length === ele.find('tr').length) all_row = true;
		if (column_index_arr.length === ele.find('tr').eq(0).find('td').length) all_column = true;
		$selected.each(function () {
			if ($(this).find('.show_text')[0].innerHTML !== '<br>') has_content = true;
		});
		if (!has_content && all_column) {
			this.set_row_column(ele, 'delete_row');
			return;
		}
		if (!has_content && all_row) {
			this.set_row_column(ele, 'delete_line')
			return;
		}
		this.clear_content(ele, $selected);
	},
	// 清除文字内容(保留文本样式)
	clear_content: function (ele, $dom) {
		let that = this, 
			$selected = $dom,
			column_index_arr = that.get_cel_message($selected).cel_column_arr,
			row_index_arr = that.get_cel_message($selected).cel_row_arr;
		$selected.each(function () {
			if ($(this)[0].innerHTML !== '<br>') {
				$(this)[0].innerHTML = '<div contenteditable="true" class="show_text" style="' + that.save_cel_style($(this).find('.show_text')) + '"><br></div>';
			}
		});
		ele.find('td[data-column=' + column_index_arr[0] + '][data-row=' + row_index_arr[0] + '] .show_text').focus();
		that.table_edit_listener(ele);
	},
	// 合并 || 拆分单元格
	toggle_merge: function (ele, data) {
		let $selected = this.get_edit_cel(ele),
			select_message = this.get_cel_message($selected),
			rowspan = select_message.cel_row_arr.length,
			colspan = select_message.cel_column_arr.length,
			no_content = false,
			merge_id = base_opt.fn.uuid();
		if (data === 'merge_cel') {
			// 若存在已合并的单元格，先取消合并
			$selected.attr({ 'rowspan': 1, 'colspan': 1 }).removeClass('merge_hide').removeClass('standard_merge');
			let $standard = ele.find('td[data-column=' + select_message.standard_column + '][data-row=' + select_message.standard_row + ']');
			if ($standard[0].innerHTML === '<br>') no_content = true;
			for (let row = 0; row < select_message.cel_row_arr.length; row++) {
				for (let column = 0; column < select_message.cel_column_arr.length; column++) {
					if (no_content) {
						if (ele.find('td[data-column=' + select_message.cel_column_arr[column] + '][data-row=' + select_message.cel_row_arr[row] + '] .show_text')[0].innerHTML !== '<br>') {
							ele.find('td[data-column=' + select_message.standard_column + '][data-row=' + select_message.standard_row + '] .show_text')[0].innerHTML = ele.find('td[data-column=' + select_message.cel_column_arr[column] + '][data-row=' + select_message.cel_row_arr[row] + '] .show_text')[0].innerHTML
							no_content = false;
						}
					}
					ele.find('td[data-column=' + select_message.cel_column_arr[column] + '][data-row=' + select_message.cel_row_arr[row] + ']').addClass('merge_hide').attr('data-merge', merge_id);
				}
			}
			$standard.attr({ 'rowspan': rowspan, 'colspan': colspan, 'data-merge': merge_id }).removeClass('merge_hide').addClass('standard_merge');
		}
		else {
			$selected.attr({ 'rowspan': 1, 'colspan': 1}).removeClass('merge_hide').removeClass('standard_merge');
			$selected.removeAttr('data-merge');
		}
		ele.find('td[data-column=' + select_message.standard_column + '][data-row=' + select_message.standard_row + ']').click();
		// 更新表格相关数据
		table_opt.table_edit_listener(ele);
	},
	// 文本编辑状态方向键操作
	direction: function (ele, data, tab) {
		// 错误状态判断
		if(!ele || ele.length !== 1 || ele.attr('data-type') !== 'table'){
			console.error('params type error');
			return false;
		}
		let $table = ele.find('table'),
			$focus = $table.find('.cel_edit'),
			cur_row_index = Number($focus.attr('data-row')),
			cur_column_index = Number($focus.attr('data-column')),
			next_row_index = cur_row_index,
			next_column_index = cur_column_index,
			total_row = $table.find('tr').length,
			total_col = $table.find('tr').eq(0).find('td').length,
			range = window.getSelection().getRangeAt(0),
			empty_text = false;
		if (tab) {
			// tab键切换
			$focus.removeClass('cel_edit');
			$($(document.activeElement)[0].parentNode.nextSibling).addClass('cel_edit');
			if ($($(document.activeElement)[0].offsetParent).attr('data-row') == total_row - 1 && $($(document.activeElement)[0].offsetParent).attr('data-column') == total_col - 1) {
				// 新建一行
				this.set_row_column(ele, 'add_bottom');
				window.event.returnValue = false;
				return false;
			}
		} else {
			if (range.commonAncestorContainer.nodeName === 'DIV') empty_text = true;
			switch (data) {
				case 'top':
					if ((range.commonAncestorContainer.previousElementSibling == null && range.endOffset == 0) || empty_text) {
						if (cur_row_index > 0) next_row_index--;
					} else { return }
					break;
				case 'bottom':
					if ((range.commonAncestorContainer.nextElementSibling == null && range.endOffset == range.commonAncestorContainer.length) || empty_text) {
						if (cur_row_index < total_row - 1) next_row_index++;
					} else { return }
					break;
				case 'left':
					if ((range.endOffset == 0 && range.commonAncestorContainer.previousElementSibling == null) || empty_text) {
						if (cur_column_index > 0) {
							next_column_index--;
						} else if (next_row_index > 0) {
							next_row_index--;
							next_column_index = total_col - 1;
						}
					} else { return }
					break;
				case 'right':
					if ((range.endOffset == range.commonAncestorContainer.length && range.commonAncestorContainer.nextElementSibling == null) || empty_text) {
						if (cur_column_index < total_col - 1) {
							next_column_index++;
						} else if (next_row_index < total_row - 1) {
							next_row_index++;
							next_column_index = 0;
						}
					} else { return }
					break;
			}
			let $next = $table.find('td[data-row=' + next_row_index + '][data-column=' + next_column_index + ']');
			$('.cel_edit').removeClass('cel_edit');
			$next.addClass('cel_edit').find('.show_text').focus();
		}
	},
	// 复制单元格内容
	copy_cel_content: function (ele) {
		let $cel = this.get_edit_cel(ele);
		let cel_message = this.get_cel_message($cel);
		cel_message.html = ele.find('table').html();
		return cel_message;
    },
	// 单元格粘贴剪贴板内容
	paste_cel_content: function (ele,copy_cel_info) {
		let $checked = ele,
			row_length = Number($checked.find('td:last').attr('data-row')) + 1,
			column_length = Number($checked.find('td:last').attr('data-column')) + 1,
			$cel = this.get_edit_cel($checked),
			paste_cel_info = this.get_cel_message($cel),
			$old_table = $('<div></div>').html(copy_cel_info.html);
		//数据合法校验
		if(!copy_cel_info||!copy_cel_info.cel_row_arr||!copy_cel_info.cel_column_arr){
			return;
		}
		// 1.框选的行数 >= 复制行数 并且 框选的列数 >= 复制列数
		if (paste_cel_info.cel_row_arr.length >= copy_cel_info.cel_row_arr.length || paste_cel_info.cel_column_arr.length >= copy_cel_info.cel_column_arr.length) {
			//倍数
			if ((paste_cel_info.cel_row_arr.length == 1 && paste_cel_info.cel_column_arr.length % copy_cel_info.cel_column_arr.length == 0 || paste_cel_info.cel_column_arr.length == 1 && paste_cel_info.cel_row_arr.length % copy_cel_info.cel_row_arr.length == 0) || (paste_cel_info.cel_column_arr.length % copy_cel_info.cel_column_arr.length == 0 && paste_cel_info.cel_row_arr.length % copy_cel_info.cel_row_arr.length == 0)) {
				let copy_row = -1,
					copy_column = -1,
					row_times = paste_cel_info.cel_row_arr.length / copy_cel_info.cel_row_arr.length,
					column_times = paste_cel_info.cel_column_arr.length / copy_cel_info.cel_column_arr.length,
					start_row_arr = [paste_cel_info.standard_row],
					start_column_arr = [paste_cel_info.standard_column];
				// 基准单元格行索引数组
				for (let _rowtime = 1; _rowtime < row_times; _rowtime++) {
					start_row_arr.push(paste_cel_info.standard_row + (_rowtime * paste_cel_info.cel_row_arr.length / row_times))
				}
				// 基准单元格列索引数组
				for (let _columntime = 1; _columntime < column_times; _columntime++) {
					start_column_arr.push(paste_cel_info.standard_column + (_columntime * paste_cel_info.cel_column_arr.length / column_times))
				}
				for (let _startrow = 0; _startrow < start_row_arr.length; _startrow++) {
					for (let _startcolumn = 0; _startcolumn < start_column_arr.length; _startcolumn++) {
						copy_row = -1
						for (let row = 0; row < copy_cel_info.cel_row_arr.length; row++) {
							copy_column = -1
							copy_row++;
							for (let column = 0; column < copy_cel_info.cel_column_arr.length; column++) {
								copy_column++;
								$checked.find('td[data-column=' + Number(start_column_arr[_startcolumn] + column) + '][data-row=' + Number(start_row_arr[_startrow] + row) + ']')[0].innerHTML = $old_table.find('td[data-column=' + copy_cel_info.cel_column_arr[copy_column] + '][data-row=' + copy_cel_info.cel_row_arr[copy_row] + ']')[0].innerHTML;
							}
						}
					}
				}
			}
			// 非倍数
			else {
				let copy_row = -1, copy_column = -1, start_row = paste_cel_info.standard_row, start_column = paste_cel_info.standard_column;
				for (let row = 0; row < copy_cel_info.cel_row_arr.length; row++) {
					copy_column = -1
					copy_row++;
					for (let column = 0; column < copy_cel_info.cel_column_arr.length; column++) {
						copy_column++;
						$checked.find('td[data-column=' + Number(start_column + column) + '][data-row=' + Number(start_row + row) + ']')[0].innerHTML = $old_table.find('td[data-column=' + copy_cel_info.cel_column_arr[copy_column] + '][data-row=' + copy_cel_info.cel_row_arr[copy_row] + ']')[0].innerHTML;
					}
				}
			}
		}
		// 2.框选的行数 < 复制行数 或者 框选的列数 < 复制列数
		else if (paste_cel_info.cel_row_arr.length < copy_cel_info.cel_row_arr.length || paste_cel_info.cel_column_arr.length < copy_cel_info.cel_column_arr.length) {
			// 表格总行列数 - 基准单元格行列索引 < 复制所选单元格行列总数（行或列任一）,不做处理
			if (row_length - paste_cel_info.standard_row >= copy_cel_info.cel_row_arr.length && column_length - paste_cel_info.standard_column >= copy_cel_info.cel_column_arr.length) {
				let copy_row = -1, copy_column = -1, start_row = paste_cel_info.standard_row, start_column = paste_cel_info.standard_column;
				for (let row = 0; row < copy_cel_info.cel_row_arr.length; row++) {
					copy_column = -1
					copy_row++;
					for (let column = 0; column < copy_cel_info.cel_column_arr.length; column++) {
						copy_column++;
						$checked.find('td[data-column=' + Number(start_column + column) + '][data-row=' + Number(start_row + row) + ']')[0].innerHTML = $old_table.find('td[data-column=' + copy_cel_info.cel_column_arr[copy_column] + '][data-row=' + copy_cel_info.cel_row_arr[copy_row] + ']')[0].innerHTML;
					}
				}
			}
		}
		this.table_edit_listener(ele);
	},
	paste_text_to_cel:function(ele,html){
		let $checked = ele,
			$cel = this.get_edit_cel($checked);
		if ($cel.length <= 0 || html == undefined) {
			return;
        }
		$cel.each(function(index,item){
			$(item).find(".show_text").html(html);
		})
		this.table_edit_listener(ele);
	},
	// 黏贴表格方法
	format_paste_table: function (text,content) {
        let rows = text.split('\r\n'),
            row_arr = [],
            width_arr = [],
            row = 0,
            column = 0,
            obj = {};
        let $outer = $('<div></div>').html(content).css('display', 'none');
        $outer.find('col').each(function () {
            width_arr.push(Number($(this).attr('width')) * 2);
        })
        for (let i = 0, n = rows.length; i < n; i++) {
            //获取每行的各个单元格数据
            let cells = rows[i].split('\t');
            for (let j = 0, l = cells.length; j < l; j++) {
                let value = cells[j];
                if (/\n/g.test(value)) {
                    // 单元格内文字换行处理
                    value = value.replace(/\n/g, '<br>');
                    // 去除多余双引号
                    cells[j] = value.replace(/\"/g, "");
                }
            }
            row_arr.push(cells);
        }
        row_arr.splice(row_arr.length - 1, 1);
        row = row_arr.length;
        column = row_arr[0].length;
        obj.row = row;
        obj.column = column;
        obj.row_arr = row_arr;
        obj.width_arr = width_arr;
        return obj;
    },
    // 边框设置方法
    set_border_type: function(ele,type){
        let $cel = this.get_edit_cel(ele);
        let cel_message = this.get_cel_message($cel);
        let column_arr = cel_message.cel_column_arr;
        let row_arr = cel_message.cel_row_arr;
        let color = ele.find('table').attr('data-border-color');
        let border_w = Number(ele.find('table').attr('data-border-width'));
        let setting_type = 'hidden';
        switch (type) {
            case 'all':
                $cel.css({
                    'border-color': color,
                    'border-width': border_w
                })
                break;
            case 'inside':
                $cel.each(function () {
                    if ($(this).attr('data-column') != column_arr[column_arr.length - 1]) {
                        if ($(this).css('border-right-color') === 'rgba(0, 0, 0, 0)') setting_type = 'visibile';
                    }
                    if ($(this).attr('data-row') != row_arr[row_arr.length - 1]) {
                        if ($(this).css('border-bottom-color') === 'rgba(0, 0, 0, 0)') setting_type = 'visibile';
                    }
                })
                $cel.each(function () {
                    if ($(this).attr('data-column') != column_arr[column_arr.length - 1]) {
                        if (setting_type === 'visibile') {
                            $(this).css({
                                'border-right-color': color,
                                'border-right-width': border_w
                            })
                        } else {
                            $(this).css({
                                'border-right-color': 'transparent',
                                'border-right-width': border_w + 1
                            })
                        }
                    }
                    if ($(this).attr('data-row') != row_arr[row_arr.length - 1]) {
                        if (setting_type === 'visibile') {
                            $(this).css({
                                'border-bottom-color': color,
                                'border-bottom-width': border_w
                            })
                        } else {
                            $(this).css({
                                'border-bottom-color': 'transparent',
                                'border-bottom-width': border_w + 1
                            })
                        }
                    }
                })
                break;
            case 'vertical':
                $cel.each(function () {
                    if ($(this).attr('data-column') != column_arr[column_arr.length - 1]) {
                        if ($(this).css('border-right-color') === 'rgba(0, 0, 0, 0)') setting_type = 'visibile';
                    }
                })
                $cel.each(function () {
                    if ($(this).attr('data-column') != column_arr[column_arr.length - 1]) {
                        if (setting_type === 'visibile') {
                            $(this).css({
                                'border-right-color': color,
                                'border-right-width': border_w
                            })
                        } else {
                            $(this).css({
                                'border-right-color': 'transparent',
                                'border-right-width': border_w + 1
                            })
                        }
                    }
                })
                break;
            case 'horizontal':
                $cel.each(function () {
                    if ($(this).attr('data-row') != row_arr[row_arr.length - 1]) {
                        if ($(this).css('border-bottom-color') === 'rgba(0, 0, 0, 0)') setting_type = 'visibile';
                    }
                })
                $cel.each(function () {
                    if ($(this).attr('data-row') != row_arr[row_arr.length - 1]) {
                        if (setting_type === 'visibile') {
                            $(this).css({
                                'border-bottom-color': color,
                                'border-bottom-width': border_w
                            })
                        } else {
                            $(this).css({
                                'border-bottom-color': 'transparent',
                                'border-bottom-width': border_w + 1
                            })
                        }
                    }
                })
                break;
            case 'outside':
                $cel.each(function () {
                    if ($(this).attr('data-row') == row_arr[0]) {
                        if ($(this).css('border-top-color') === 'rgba(0, 0, 0, 0)') setting_type = 'visibile';
                    }
                    if ($(this).attr('data-row') == row_arr[row_arr.length - 1]) {
                        if ($(this).css('border-bottom-color') === 'rgba(0, 0, 0, 0)') setting_type = 'visibile';
                    }
                    if ($(this).attr('data-column') == column_arr[0]) {
                        if ($(this).css('border-left-color') === 'rgba(0, 0, 0, 0)') setting_type = 'visibile';
                    }
                    if ($(this).attr('data-column') == column_arr[column_arr.length - 1]) {
                        if ($(this).css('border-right-color') === 'rgba(0, 0, 0, 0)') setting_type = 'visibile';
                    }
                })
                $cel.each(function () {
                    if ($(this).attr('data-row') == row_arr[0]) {
                        if (setting_type === 'visibile') {
                            $(this).css({
                                'border-top-color': color,
                                'border-top-width': border_w
                            })
                        } else {
                            $(this).css({
                                'border-top-color': 'transparent',
                                'border-top-width': border_w + 1
                            })
                        }
                    }
                    if ($(this).attr('data-row') == row_arr[row_arr.length - 1]) {
                        if (setting_type === 'visibile') {
                            $(this).css({
                                'border-bottom-color': color,
                                'border-bottom-width': border_w
                            })
                        } else {
                            $(this).css({
                                'border-bottom-color': 'transparent',
                                'border-bottom-width': border_w + 1
                            })
                        }
                    }
                    if ($(this).attr('data-column') == column_arr[0]) {
                        if (setting_type === 'visibile') {
                            $(this).css({
                                'border-left-color': color,
                                'border-left-width': border_w
                            })
                        } else {
                            $(this).css({
                                'border-left-color': 'transparent',
                                'border-left-width': border_w + 1
                            })
                        }
                    }
                    if ($(this).attr('data-column') == column_arr[column_arr.length - 1]) {
                        if (setting_type === 'visibile') {
                            $(this).css({
                                'border-right-color': color,
                                'border-right-width': border_w
                            })
                        } else {
                            $(this).css({
                                'border-right-color': 'transparent',
                                'border-right-width': border_w + 1
                            })
                        }
                    }
                })
                break;
            case 'left':
                $cel.each(function () {
                    if ($(this).attr('data-column') == column_arr[0]) {
                        if ($(this).css('border-left-color') === 'rgba(0, 0, 0, 0)') setting_type = 'visibile';
                    }
                })
                $cel.each(function () {
                    if ($(this).attr('data-column') == column_arr[0]) {
                        if (setting_type === 'visibile') {
                            $(this).css({
                                'border-left-color': color,
                                'border-left-width': border_w
                            })
                        } else {
                            $(this).css({
                                'border-left-color': 'transparent',
                                'border-left-width': border_w + 1
                            })
                        }
                    }
                })
                break;
            case 'top':
                $cel.each(function () {
                    if ($(this).attr('data-row') == row_arr[0]) {
                        if ($(this).css('border-top-color') === 'rgba(0, 0, 0, 0)') setting_type = 'visibile';
                    }
                })
                $cel.each(function () {
                    if ($(this).attr('data-row') == row_arr[0]) {
                        if (setting_type === 'visibile') {
                            $(this).css({
                                'border-top-color': color,
                                'border-top-width': border_w
                            })
                        } else {
                            $(this).css({
                                'border-top-color': 'transparent',
                                'border-top-width': border_w + 1
                            })
                        }
                    }
                })
                break;
            case 'right':
                $cel.each(function () {
                    if ($(this).attr('data-column') == column_arr[column_arr.length - 1]) {
                        if ($(this).css('border-right-color') === 'rgba(0, 0, 0, 0)') setting_type = 'visibile';
                    }
                })
                $cel.each(function () {
                    if ($(this).attr('data-column') == column_arr[column_arr.length - 1]) {
                        if (setting_type === 'visibile') {
                            $(this).css({
                                'border-right-color': color,
                                'border-right-width': border_w
                            })
                        } else {
                            $(this).css({
                                'border-right-color': 'transparent',
                                'border-right-width': border_w + 1
                            })
                        }
                    }
                })
                break;
            case 'bottom':
                $cel.each(function () {
                    if ($(this).attr('data-row') == row_arr[row_arr.length - 1]) {
                        if ($(this).css('border-bottom-color') === 'rgba(0, 0, 0, 0)') setting_type = 'visibile';
                    }
                })
                $cel.each(function () {
                    if ($(this).attr('data-row') == row_arr[row_arr.length - 1]) {
                        if (setting_type === 'visibile') {
                            $(this).css({
                                'border-bottom-color': color,
                                'border-bottom-width': border_w
                            })
                        } else {
                            $(this).css({
                                'border-bottom-color': 'transparent',
                                'border-bottom-width': border_w + 1
                            })
                        }
                    }
                })
                break;
            case 'none':
                $cel.css({
                    'border-color': 'transparent',
                    'border-width': border_w +  1
                })
                break;
        }
    },
    // 边框样式组装
    border_type_split: function(obj,td){
        let boder_hide_html = '';
        if (td.border_hide && td.border_hide.length > 0) {
            td.border_hide.forEach(function (d) {
                boder_hide_html += `border-${d}-color: transparent; border-${d}-width: ${Number(obj.border_w) + 1}px;`
            });
        }
        return boder_hide_html;
    },
};
export default table_opt;