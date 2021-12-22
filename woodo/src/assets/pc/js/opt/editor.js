import base_opt from "./base_opt";

let editor_opt = {
	// range 合集
	range_obj:{},
	// 手动设置文本选中
	set_selection: function(dom){
		let editor = (dom.nodeType === 1) ? dom : dom[0]; // 判断传入的元素 是否为jq还是dom对象
		if (document.selection) {
			let range = document.body.createTextRange();
			range.moveToElementText(editor);
			range.select();
		} else if (window.getSelection) {
			let range = document.createRange();
			range.selectNodeContents(editor);
			window.getSelection().removeAllRanges();
			window.getSelection().addRange(range);
		}
	},
	// 储存文本选区
	save_text_selection:function(ele){
		// 错误状态判断
		if(!ele || ele.length !== 1) {
			return false;
		}
		let $text = ele.hasClass('show_text') ? ele : ele.find('.show_text'),
			$select_node,
			select_text = '';
		if(ele.attr('data-type') === 'table'){
			$text = ele.hasClass('show_text') ? ele : ele.find('.cel_edit .show_text');
			$text = $text.filter(':visible');
		}
		// 选中文本不在指定区域内时，退出
		if(window.getSelection){
			$select_node = $(window.getSelection().focusNode);
			if($select_node.parents('.show_text').length < 0 && !$select_node.hasClass('.show_text')) return;
			select_text = window.getSelection().toString();
		}
		if(document.selection){
			$select_node = $(document.activeElement);
			if($select_node.parents('.show_text').length < 0 && !$select_node.hasClass('.show_text')) return;
			select_text = document.selection.createRange().text;
		}
		// 选中文本为空时，退出
		if(select_text.length <= 0) return;
		// 生成自定义选区
		this.toggle_customize_selection($text,true);
	},
	// 恢复文本选区
	recover_text_selection(ele){
		// 错误状态判断
		if(!ele || ele.length !== 1) {
			return false;
		}
		let $text = '', $select = '';
		if (ele.attr('data-type') === 'table') {
			$text = ele.hasClass('show_text') ? ele : ele.find('.cel_edit .show_text');
			$text = $text.filter(':visible');
		}else{
			$text = ele.hasClass('show_text') ? ele : ele.find('.show_text');
		}
		$select = $text.find('.customize_selection');
		if($select.length > 0){
			this.toggle_customize_selection($text,false);
		}
	},
	// 生成 || 去除自定义文本选区
	toggle_customize_selection: function(ele, create){
		if(!ele || ele.length !== 1) {
			console.error('params type error');
			return false;
		}
		let $text = ele.hasClass('show_text') ? ele : ele.find('.show_text');
		if (ele.attr('data-type') === 'table') {
			$text = ele.hasClass('show_text') ? ele : ele.find('.cel_edit .show_text');
		}
		if(create){
			// *先生成选区标签，再获取选区，否则会有问题
			document.execCommand("styleWithCSS", false, true);
			document.execCommand('backColor', false, '#3390ff');
			let sel = window.getSelection(),
				uuid = base_opt.fn.uuid();
			this.range_obj[uuid] = sel.getRangeAt(0).cloneRange();
			$text.find('span,a').each(function () {
				if ($(this)[0].style.backgroundColor !== ''){
					$(this).addClass('customize_selection');
					$(this).attr('data-range', uuid);
				}
			});
		}else{
			let $customize = $text.find('.customize_selection'),
				uuid = $customize.attr('data-range'),
				sel = window.getSelection();
			sel.removeAllRanges();
			if(this.range_obj[uuid]){
				sel.addRange(this.range_obj[uuid]);
				delete this.range_obj[uuid];
			}
			$customize.each(function(){$(this).removeClass('customize_selection').css('background-color','');});
		}
	},
	// 判断文本选区是否全选 或者 节点框选
	decideSelectAll(ele){
		if(!ele || ele.length !== 1) {
			console.error('params type error');
			return false;
		}
		let text = window.getSelection ? window.getSelection() : document.selection.createRange().text,
			select_text = window.getSelection().toString().replace(/\n+/g, ''),
			$text = ele.hasClass('show_text') ? ele : ele.find('.show_text');
		/* text.type => 
			None: 当前没有选择。
			Caret: 选区已折叠（即 光标在字符之间，并未处于选中状态）。
			Range: 选择的是一个范围 
		*/
		// 选中文本所在的节点 or 全选
		return (text.type && text.type !== 'Range') || select_text === $text.text();
	},
	// 格式化粘贴文本
	format_paste_text: function(pNode, cNode, from_inside){
		if(!pNode || !cNode) {
			console.error('params type error');
			return false;
        }
		let old_node = cNode[0],
			font_family_arr = ['Microsoft YaHei', 'SimSun', 'KaiTi', 'LiSu', 'YouYuan', 'Impact', 'Arial', 'Verdana', '等线'],
			$text, $child, parent_style, computed_style;
		// 判断旧节点，生成新节点
		switch (cNode[0].tagName) {
			case 'UL':
				$text = $('<ul></ul>').html(old_node.innerHTML);
				break;
			case 'OL':
				$text = $('<ol></ol>').html(old_node.innerHTML);
				break;
			case 'LI':
				$text = $('<li></li>').html(old_node.innerHTML);
				break;
			case 'BR':
				$text = $('<br>');
				break;
			case 'A':
				$text = $('<a></a>').html(old_node.innerHTML).attr('href', cNode.attr('href'));
				break;
			case 'SUP':
				$text = $('<span></span>').css({ 'vertical-align': 'super', 'font-size': 'smaller' }).html(old_node.innerHTML);
				break;
			case 'SUB':
				$text = $('<span></span>').css({ 'vertical-align': 'sub', 'font-size': 'smaller' }).html(old_node.innerHTML);
				break;
			default:
				if (getComputedStyle(cNode[0])['display'] === 'block') {
					$text = $('<div></div>').html(old_node.innerHTML);
				} else {
                    // 判断是否存在块级的字节点,如果存在,要用div包裹,不能用span包裹
                    let child_arr = cNode[0].childNodes;
                    let has_block = false;
                    $.each(child_arr, function(i,item) {
                        if (item.nodeType === 3) return true;
                        if (getComputedStyle(item)['display'] === 'block') {
                            has_block = true;
                            return false;
                        }
                    })
                    if(has_block){
                        $text = $('<div></div>').html(old_node.innerHTML);
                    }else{
                        $text = $('<span></span>').html(old_node.innerHTML);
                    }
                }
				break;
		}
		// 新节点继承样式
		if (!pNode[0] || !old_node) {
			return false;
		}
		parent_style = window.getComputedStyle(pNode[0]);
		computed_style = window.getComputedStyle(old_node);
		let family = font_family_arr.indexOf(computed_style.fontFamily) < 0 && computed_style.fontFamily.indexOf('woodo-') < 0 ? font_family_arr[0] : computed_style.fontFamily,
			decoration = computed_style.textDecoration.indexOf('none') >= 0 ? '' : computed_style.textDecoration,
			size = computed_style.fontSize,
			bold = computed_style.fontWeight,
			style = computed_style.fontStyle,
			color = computed_style.color,
            letter_s = computed_style.letterSpacing,
            list_style = computed_style.listStyleType;
		// 样式特殊格式处理
		if (typeof (+computed_style.fontWeight) === 'number') {
			switch (true) {
				case +computed_style.fontWeight < 600:
					bold = 'normal'
					break;
				default:
					bold = 'bold'
					break;
			}
        };
		// 节点样式处理
		switch (true) {
			case $text[0].tagName === 'UL' || $text[0].tagName === 'OL':
				let max_size = 0;
				$text.find('*').each(function(){
					let _size = base_opt.fn.unit_2_px($(this).css('font-size'));
					max_size = max_size < _size ? _size : max_size;
				});
				$text.css({
					"listStyleType": list_style,
					"fontSize": max_size > 0 ? `${from_inside ? max_size : max_size * 2}px` : ''
				});
				break;
			case $text.css('vertical-align') === 'super' || $text.css('vertical-align') === 'sub':
				$text.css({
					'color': color === parent_style.color ? '' : color,
					'fontWeight': bold === parent_style.fontWeight ? '' : bold,
					'fontStyle': style === parent_style.fontStyle ? '' : style,
					'fontFamily': family === parent_style.fontFamily ? '' : family,
					'letterSpacing': letter_s === parent_style.letterSpacing ? '' : letter_s,
					'textDecoration': decoration === parent_style.textDecoration ? '' : decoration,
				});
				break;
			default:
				$text.css({
					'color': color === parent_style.color ? '' : color,
					'fontSize': size === parent_style.fontSize ? '' : `${from_inside ? base_opt.fn.unit_2_px(size) : base_opt.fn.unit_2_px(size) * 2}px`,
					'fontWeight': bold === parent_style.fontWeight ? '' : bold,
					'fontStyle': style === parent_style.fontStyle ? '' : style,
					'fontFamily': family === parent_style.fontFamily ? '' : family,
					'letterSpacing': letter_s === parent_style.letterSpacing ? '' : letter_s,
					'textDecoration': decoration === parent_style.textDecoration ? '' : decoration,
				});
				break;
		}
		// 新节点替换旧节点
		pNode[0].replaceChild($text[0], old_node);
		// 获取子节点
		$child = $text.children();
		// 判断存在子节点 -> 触发递归
		let _this = this;
		if($child.length > 0){
			$child.each(function(index,ele){
				_this.format_paste_text($text, $(ele), from_inside);
			});
		}
	},
	// 设置字体大小
	set_size: function(ele, data){
		// 错误状态判断
		if(!ele || ele.length <= 0 || !data) {
			console.error('params type error');
			return false;
		}
		let text = window.getSelection ? window.getSelection() : document.selection.createRange().text,
			select_text = window.getSelection().toString().replace(/\n+/g, ''), // 去除换行
			$text = ele.hasClass('show_text') ? ele : ele.find('.show_text');
		if(text.type === 'Range' || text.length > 0){
			document.execCommand("styleWithCSS", false, true);
			document.execCommand('fontSize', false, data+'px');
			$text.find('font[size]').css("font-size", data+'px');
			//过滤fontsize的非法字符，例如xx-large，small等等
			let $allFontSizeTag=$text.find('[style*="font-size"]');
			$allFontSizeTag.each(function(index,item){
				if($(item)[0].style==undefined){
					return ;
				}
				//如果fontSize不是数字，则需要替换成当前的执行字体大小
				let fs=$(item)[0].style.fontSize.replace(/\D+/g, '');
				if(fs==""||fs==undefined||Number(fs)<=0){
					$(item).css("font-size", data+'px');
				}
			})
			//同步字体大小
			let $sameFontNodes=$text.find('[style*="font-size: '+data+'px"]');
			$sameFontNodes.each(function(index,ele){
				let $ele_parent=$(ele).parent();
				if ($ele_parent.hasClass('show_text')) return false;
				//字体同步处理
				if($ele_parent.length>0 && $ele_parent[0].childNodes.length>0){
					let maxFontSize=0;
					//遍历子节点，获取子节点最大的字体大小，同步到父节点上
					for (let i =0;i<$ele_parent[0].childNodes.length;i++) {
						let fontSize=0;
						//如果子节点不存在Style,则默认使用父节点的
						if($ele_parent[0].childNodes[i].style==undefined){
							fontSize=base_opt.fn.unit_2_px($ele_parent.css("font-size"));
						}else{
							fontSize=base_opt.fn.unit_2_px($($ele_parent[0].childNodes[i]).css("font-size"));
						}
						if(Number(fontSize)>maxFontSize){
							maxFontSize=Number(fontSize);
						}
					}
					$ele_parent.css("font-size",maxFontSize+'px');
				}
			});
			// 判断全选文字时
			if(select_text === $text.text())$text.css('fontSize', data +'px');// 修改字体改变编辑框的font-size
			// 形状文本聚焦
			if(ele.attr('data-type') === 'shape') ele.find('.show_text').focus();
		}else{
			$text.css('fontSize', data +'px').find('*').css('fontSize', data +'px');
		}
		// 去除预设版式标识
		$text.attr('data-preset', '');
		$text.find('font').contents().unwrap().wrap('<span style=" font-size: ' + data + 'px"></span>');
	},
	// 设置后续字体大小
	set_next_size: function(ele, data){
		// 错误状态判断
		if(!ele || ele.length <= 0 || !data || Number(data) <= 0) {
			console.error('params type error');
			return false;
		}
		let select_text = window.getSelection().toString().replace(/\s+/g, ''),
			$text = ele.hasClass('show_text') ? ele : ele.find('.show_text');
		if(select_text.length > 0) return false;
		let sel, range;
		if (window.getSelection) {
			sel = window.getSelection();
			if (sel.getRangeAt && sel.rangeCount) {
				range = sel.getRangeAt(0);
				range.deleteContents();
				let el = document.createElement("div");
				el.innerHTML = '<span class="chang_size_node"><span>#测试插入#</span></span>';
				let frag = document.createDocumentFragment(), node, lastNode;
				while ((node = el.firstChild)) { lastNode = frag.appendChild(node); }
				range.insertNode(frag);
				if (lastNode) {
					range = range.cloneRange();
					range.setStartAfter(lastNode);
					range.collapse(true);
					sel.removeAllRanges();
					sel.addRange(range);
				}
			}
		}else if (document.selection && document.selection.type !== "Control") {
			document.selection.createRange().pasteHTML('<span class="chang_size_node"><span>#测试插入#</span></span>');
		}
		let $span = document.querySelector('.chang_size_node'),
			$span_child = $span.querySelector('span');
		$span.style.fontSize = `${data}px`;
		// 选择到span内部的span
		this.set_selection($span_child);
		// 删除选中的 span 内的 span
		document.execCommand('delete');
		// 去除 span 的 class
		$span.setAttribute('class', '');
		// 去除预设版式标识
		$text.attr('data-preset', '');
	},
	// 设置节点字体大小
	set_node_size: function(ele,scale,type){
		ele = ele.not('.merge_hide');	// 去除隐藏的单元格
		// 错误状态判断
		if(!ele || ele.length <= 0) {
			console.error('params type error');
			return false;
		}
		let text = window.getSelection ? window.getSelection() : document.selection.createRange().text,
			select_text = window.getSelection().toString().replace(/\s+/g, ''),
            $text = ele.hasClass('show_text') ? ele : ele.find('.show_text'),
            max_data = 0;
		let opt_function = function($text){
			// 获取节点渲染样式
			let data = Number($text.css('font-size').slice(0, -2)) * Number(scale[0]);
			if(type === 'add'){
				data++;
				data = data / Number(scale[0]);
			}else{
				data--;
				data = data < 6 ? 12 : data / Number(scale[0]);
			}
            data = Math.floor(data);
            max_data = data > max_data ? data : max_data;
			$text.css('fontSize',data + 'px');
		};
		if(text.type === 'Range' || text.length > 0){
			// execCommand不能直接设置字间距  需要其他属性代替生成span标签重新设置样式
			document.execCommand("styleWithCSS", false, true);
			document.execCommand('subscript', false);
			let $set_dom = $text.find('[style*="vertical-align: sub;"]'),
				reg = new RegExp("vertical-align: sub", "g"),
				get_css = '';
			$set_dom.each(function(){
				let $this = $(this);
				get_css = $this.attr('style').replace(reg, "");
				$this.attr('style', get_css);
				opt_function($this);
				$this.find('div,span').each(function(){
					opt_function($(this));
				})
			})
            // 判断全选文字时修改字体改变编辑框的font-size
			if (select_text === $text.text()) $text.css('fontSize', max_data + 'px');
		}else{
			if (ele.hasClass('.show_text')) {
				opt_function(ele);
				opt_function(ele.find('div, span'));
			} else {
				opt_function(ele.find('.show_text, .show_text div, .show_text span'));
			}
		}
	},
	// 同步父级字号
	sync_parent_fontsize: function ($text) {
		let size_sync = function ($text) {
			for (var i = 0; i < $text[0].childNodes.length; i++) {
				let $dom = $text[0].childNodes[i];
				let size = '';
				// 文本节点同步父级字号并用span标签包裹
				if ($dom.nodeType == 3) {
					size = window.getComputedStyle($dom.parentNode).fontSize;
					let $spannode = document.createElement("SPAN");
					$spannode.innerHTML = $dom.textContent;
					$spannode.style.fontSize = size;
					$dom.parentNode.replaceChild($spannode, $dom)
				}
				// 存在子节点的继续递归
				else if ($dom.childNodes.length > 0 && $dom.childNodes[0].nodeType !== 3) {
					size_sync($($dom))
				}
				// 换行节点不做处理
				else if ($dom.tagName === 'BR') {
					continue;
				}
				// 无子节点的同步字号
				else {
					size = window.getComputedStyle($dom).fontSize;
					$($dom).css('font-size', size);
				}
			}
			$text[0].style["fontSize"] = null;
		}
		size_sync($text);
	},
	// 设置字体
	set_family: function(ele, data){
		if(!ele || !data || ele.length !== 1) {
			console.error('params type error');
			return false;
		}
		let text = window.getSelection ? window.getSelection() : document.selection.createRange().text,
			$text = ele.hasClass('show_text') ? ele : ele.find('.show_text');
		if(text.type === 'Range' || text.length > 0){
			document.execCommand("styleWithCSS", false, true);
			document.execCommand('fontName',false,data);
			// 形状文本聚焦
			if (ele.attr('data-type') === 'shape') ele.find('.show_text').focus();
		}else{
			$text.css('fontFamily', data);
			$text.find('*').css('fontFamily', data);
		}
		$text.find('font').contents().unwrap().wrap('<span style=" font-family: ' + data + '"></span>'); 
	},
	// 设置颜色
	set_color: function(ele, data){
		// 错误状态判断
		if(!ele || !data || ele.length !== 1) {
			console.error('params type error');
			return false;
		}
		let text = window.getSelection ? window.getSelection() : document.selection.createRange().text,
			$text = ele.hasClass('show_text') ? ele : ele.find('.show_text'),
			all_range_text = text.toString().replace(/\s+/g, ''),
			all_text = $text.text().replace(/\s+/g, '');
		if ((text.type === 'Range' || text.length > 0) && !$text.hasClass('art') && all_range_text !== all_text) {
			document.execCommand("styleWithCSS", false, true);
			document.execCommand('foreColor',false, data);
			// 序列表 li 完全在选区内 设置 color
			$text.find('li').each((index, item)=>{
				if (text.containsNode) {
					let is_contains = text.containsNode(item, true);
					let $this_text = $(item).text();
					if (is_contains && text.toString().indexOf($this_text) >= 0) {
						$(item).css('color', data);
					}
				}
			});
		}else{
			$text.css('color', data);
			$text.find('*').css('color', data);
			// 形状文本聚焦
			if (ele.attr('data-type') === 'shape') $text.focus();
		}
	},
	// 设置粗体 {type: bold || normal 可选}
	set_bold: function(ele, type){
		// 错误状态判断
		if(!ele || ele.length !== 1) {
			console.error('params type error');
			return false;
		}
		if(type && (type !== 'normal' && type !== 'bold')) {
			console.error('params type error');
			return false;
		}
		let text = window.getSelection ? window.getSelection() : document.selection.createRange().text,
			$text = ele.hasClass('show_text') ? ele : ele.find('.show_text');
		if(text.type === 'Range' || text.length > 0){
			document.execCommand("styleWithCSS", false, true);
			document.execCommand('Bold');
		}else{
			if(type){
				$text.css('fontWeight', type);
				$text.find('*').css('fontWeight', type);
			}else{
				this.set_selection($text);
				document.execCommand("styleWithCSS", false, true);
				document.execCommand('Bold');
				window.getSelection().removeAllRanges();
			}
		}
		$text.find('b').contents().unwrap().wrap('<span style="font-weight: bold;"></span>');
	},
	// 设置斜体 {type: normal || italic}
	set_italic: function(ele, type){
		// 错误状态判断
		if(!ele || ele.length !== 1) {
			console.error('params type error');
			return false;
		}
		if(type && (type !== 'normal' && type !== 'italic')) {
			console.error('params type error');
			return false;
		}
		let text = window.getSelection ? window.getSelection() : document.selection.createRange().text,
			$text = ele.hasClass('show_text') ? ele : ele.find('.show_text');

		if(text.type === 'Range' || text.length > 0){
			document.execCommand("styleWithCSS", false, true);
			document.execCommand('italic');
		}else{
			if(type){
				// 给没有span包裹的子级文本节点加上span标签包裹
				$text.contents().map(function(){
					this.nodeName === '#text' && $(this).wrap('<span></span>');
				});
				$text.find('*').css('fontStyle', type);
			}else{
				this.set_selection($text);
				document.execCommand("styleWithCSS", false, true);
				document.execCommand('italic');
				window.getSelection().removeAllRanges();
			}
		}
		$text.find('i').contents().unwrap().wrap('<span style="font-style: italic;"></span>');
	},
	// 设置下划线 {type: none || underline}
	set_underline: function(ele, type){
		// 错误状态判断
		if(!ele || ele.length !== 1) {
			console.error('params type error');
			return false;
		}
		if(type && (type !== 'none' && type !== 'underline')) {
			console.error('params type error');
			return false;
		}
		let text = window.getSelection ? window.getSelection() : document.selection.createRange().text,
			$text = ele.hasClass('show_text') ? ele : ele.find('.show_text');
		if(text.type === 'Range' || text.length > 0){
			document.execCommand("styleWithCSS", false, true);
			document.execCommand('underline');
		}else{
			if(type){
				// 给没有span包裹的子级文本节点加上span标签包裹
				$text.contents().map(function(){
					this.nodeName === '#text' && $(this).wrap('<span></span>');
				});
				$text.find('*').css('textDecoration', type);
			}else{
				this.set_selection($text);
				document.execCommand("styleWithCSS", false, true);
				document.execCommand('underline');
				window.getSelection().removeAllRanges();
			}
		}
		// 导出样式兼容
		let data = $text.find("[style *='text-decoration-line: underline']").css('textDecorationLine');
		$text.find("[style *='text-decoration-line: underline']").css({ 'textDecorationLine': 'none', 'textDecoration': data});
		$text.find('u').contents().unwrap().wrap('<span style=" text-decoration: underline;"></span>');
	},
	// 设置中划线 {type: line-through || none 可选}
	set_linethrough: function (ele, type) {
		// 错误状态判断
		if (!ele || ele.length !== 1) {
			console.error('params type error');
			return false;
		}
		if (type && (type !== 'none' && type !== 'linethrough')) {
			console.error('params type error');
			return false;
		}
		let text = window.getSelection ? window.getSelection() : document.selection.createRange().text,
			$text = ele.hasClass('show_text') ? ele : ele.find('.show_text');
		if (text.type === 'Range' || text.length > 0) {
			document.execCommand("styleWithCSS", false, true);
			document.execCommand('strikeThrough');
		} else {
			if (type) {
				// 给没有span包裹的子级文本节点加上span标签包裹
				$text.contents().map(function(){
					this.nodeName === '#text' && $(this).wrap('<span></span>');
				});
				$text.find('*').css('textDecoration', type === 'none' ? 'none' : 'line-through');
			} else {
				this.set_selection($text);
				document.execCommand("styleWithCSS", false, true);
				document.execCommand('strikeThrough');
				window.getSelection().removeAllRanges();
			}
		}
		// 导出样式兼容
		let data = $text.find("[style *='text-decoration-line: line-through']").css('textDecorationLine');
		$text.find("[style *='text-decoration-line: line-through']").css({ 'textDecorationLine': 'none', 'textDecoration': data });
		$text.find('strike').contents().unwrap().wrap('<span style=" text-decoration: line-through;"></span>');
	},
	// 设置高亮 {type: hilite || none 可选}
	set_hilite: function (ele, data,type) {
		// 错误状态判断
		if (!ele || ele.length !== 1) {
			console.error('params type error');
			return false;
		}
		if (type && (type !== 'none' && type !== 'hilite')) {
			console.error('params type error');
			return false;
		}
		let text = window.getSelection ? window.getSelection() : document.selection.createRange().text,
			$text = ele.hasClass('show_text') ? ele : ele.find('.show_text');
		if (text.type === 'Range' || text.length > 0) {
			document.execCommand("styleWithCSS", false, true);
			document.execCommand('hiliteColor', false, base_opt.fn.color_exchange_function('rgb', data));
		} else {
			// 表格
			if (type) {
				// 给没有span包裹的子级文本节点加上span标签包裹
				$text.contents().map(function(){
					this.nodeName === '#text' && $(this).wrap('<span></span>');
				});
				$text.find('*').css('background', type === 'transparent' ? 'transparent' : data);
			} 
			// 其他
			else {
				this.set_selection($text);
				document.execCommand("styleWithCSS", false, true);
				document.execCommand('hiliteColor', false, base_opt.fn.color_exchange_function('rgb', data));
				window.getSelection().removeAllRanges();
			}
		}
	},
	// 设置投影 {type: shadow || none 可选}
	set_shadow: function (ele, type) {
		// 错误状态判断
		if (!ele || ele.length !== 1) {
			console.error('params type error');
			return false;
		}
		if (type && (type !== 'none' && type !== 'shadow')) {
			console.error('params type error');
			return false;
		}
		let text = window.getSelection ? window.getSelection() : document.selection.createRange().text,
			$text = ele.hasClass('show_text') ? ele : ele.find('.show_text'),
			text_shadow_not = 'text-shadow: none;',
			text_shadow_has = 'text-shadow: rgb(154, 154, 154) 0.06em 0.04em 0.04em;',
			sub_not_reg = /vertical-align: none(;?)/g,
			sub_has_reg = /vertical-align: sub(;?)/g;
		if (text.type === 'Range' || text.length > 0) {
			// text-shadow替换为投影sub
			$text.find('span').map(function(){
				let rep_str = $(this).attr('style').replace(text_shadow_not, 'vertical-align: none;'),
					rep_style = rep_str.replace(text_shadow_has, 'vertical-align: sub;');
				$(this).attr('style', rep_style);
			});
			// execCommand不能直接设置shadow  需要其他属性代替生成span标签重新设置样式
			document.execCommand("styleWithCSS", false, true);
			document.execCommand('subscript', false);
			// 处理ie、Edge
			$text.find('sub').contents().unwrap().wrap(`<span style="vertical-align: sub;"></span>`);
			// sub替换为投影text-shadow
			$text.find('span').map(function(){
				let rep_str = $(this).attr('style').replace(sub_has_reg, text_shadow_has),
					rep_style = rep_str.replace(sub_not_reg, text_shadow_not);
				$(this).attr('style', rep_style);
			});
		} else {
			// 给没有span包裹的子级文本节点加上span标签包裹
			$text.contents().map(function(){
				this.nodeName === '#text' && $(this).wrap('<span></span>');
			});
			$text.find('*').each(function(){
				// 如果有没有投影的文字 则全部变成投影
				if($(this).css('text-shadow') === 'none'){
					$text.find('*').css('text-shadow', 'rgb(154, 154, 154) 0.06em 0.04em 0.04em');
					return false;
				}
				// 如果全是投影 则 全都取消投影
				$(this).css('text-shadow', 'none');
			});
		}
	},
	// 设置列表 {type: insertOrderedList || insertUnorderedList, style: string}
	set_font_list: function(ele, type, style){
		// 错误状态判断
		if(!ele || ele.length !== 1) {
			console.error('params type error');
			return;
		}
		if(type && (type !== 'insertOrderedList' && type !== 'insertUnorderedList')) {
			console.error('params type error');
			return;
		}
		let text = window.getSelection ? window.getSelection() : document.selection,
			select_text = window.getSelection().toString().replace(/\s+/g, ''),
            $text = ele.hasClass('show_text') ? ele : ele.find('.show_text')
		// 无选中文本情况 - 选中全部
		if(select_text.length <= 0){
            $text.focus();
            document.execCommand('selectAll');
			text = window.getSelection ? window.getSelection() : document.selection;
		}
		// 存在选中文本情况 - 设置列表
		if ((text.type === 'Range' || text.length > 0)){
			// 获取富文本内 span 标签 -> 保留标签样式
            let $span = $text.find('span');
			$span.each(function(){
				$(this).before('<span style="font-size:0;">wd_savecss</span>');
			});
			// 序列表样式设置处理
			if (style !== 'none') {
				// 设置有序无序列表 列表项标志
				if (type === 'insertOrderedList') {
					if ($(text.anchorNode).parents('ol').length === 0){
						document.execCommand("styleWithCSS", false, true);
						document.execCommand(type);
					}
					$(text.anchorNode).parents('ol').css('list-style-type', style);
				} else {
					if ($(text.anchorNode).parents('ul').length === 0){
						document.execCommand("styleWithCSS", false, true);
						document.execCommand(type);
					}
					$(text.anchorNode).parents('ul').removeAttr('class');
					if (['disc', 'square'].indexOf(style) >= 0) {
						$(text.anchorNode).parents('ul').css('list-style-type', style);
					} else {
						$(text.anchorNode).parents('ul').attr('class', style).css('list-style-type', 'none');
					}
				}
			}
			// 选区移除序列表 - 遍历编辑区域内所有的dom，is_conntains是否在选区中
			else {
				$text.find('*:not(br)').each(function(i, item){
					let is_contains = text.containsNode(item, true);
					if (is_contains) {
						if ($(item).is('ol') || $(item).parents('ol').length > 0) {
							document.execCommand("styleWithCSS", false, true);
							document.execCommand('insertOrderedList');
						}
						if ($(item).is('ul') || $(item).parents('ul').length > 0) {
							document.execCommand("styleWithCSS", false, true);
							document.execCommand('insertUnorderedList');
						}
					}
				});
			}
			// 去除保留样式标识
			if ($text[0].innerHTML.indexOf("wd_savecss") >= 0) {
				let reg = new RegExp('wd_savecss', 'gi'),
					html = $text[0].innerHTML;
				$text[0].innerHTML = html.replace(reg, "");
			}
			// 重新获取 span 标签
			$span = $text.find("span");
			$span.each(function () {
				let $this = $(this),background;
				// 不继承子节点的高亮设置
				if ($this[0].style.cssText.indexOf('background') >= 0){
					background = $this.css('background-color');
					$this.css('background', 'none');
				}
				// 恢复子节点高亮设置
				$this.css('background', background);
                // 去除多余空标签
				if ($this.text() === '' && $this.css('font-size') === '0px') $this.remove();
			});
		}
	},
	// 设置字间距
	set_font_spacing: function(ele, data){
		if(!ele || (!data && data !== 0) || ele.length !== 1) {
			console.error('params type error');
			return false;
		}
		let text = window.getSelection ? window.getSelection() : document.selection.createRange().text,
			select_text = window.getSelection().toString().replace(/\s+/g, ''),
			$text = ele.hasClass('show_text') ? ele : ele.find('.show_text');
		if(text.type === 'Range' || text.length > 0){
			// execCommand不能直接设置字间距  需要其他属性代替生成span标签重新设置样式
			document.execCommand("styleWithCSS", false, true);
			document.execCommand('subscript', false);
			let $set_dom = $text.find('[style*="vertical-align: sub;"]'),
				reg = new RegExp("vertical-align: sub", "g"),
				get_css = '';
			$set_dom.each(function(){
				get_css = $(this).attr('style').replace(reg, "");
				$(this).attr('style', get_css);
				$(this).css("letter-spacing", data + 'px');
			})
			if (select_text === $text.text()) $text.css('letterSpacing', data + 'px').find('*').css('letterSpacing', data + 'px');
		}else{
			// 判断不被span包裹文本
			if($text.find('span').length <= 0) $text.find('li').each(function(){$(this)[0].innerHTML = '<span>' + $(this)[0].innerHTML + '</span>'});
			// 设置字间距
			$text.css('letterSpacing', data + 'px').find('*').css('letterSpacing', data + 'px');
			// ol 特殊情况处理
			$text.find('ol, ul').css('letterSpacing', '').find('li').css('letterSpacing', '');
		}
	},
	// 设置行高
	set_font_lineHeight: function(ele, data){
		if (!ele || !data || ele.length !== 1) {
            console.error('params type error');
            return false;
        }
        let text = window.getSelection ? window.getSelection() : document.selection.createRange().text,
            select_text = window.getSelection().toString().replace(/\s+/g, ''),
            $text = ele.hasClass('show_text') ? ele : ele.find('.show_text');
        if (text.type === 'Range' || text.length > 0) {
            // execCommand不能直接设置行高 需要其他属性代替生成span标签重新设置样式
            document.execCommand("styleWithCSS", false, true);
            document.execCommand('subscript', false);
            let $set_dom = $text.find('[style*="vertical-align: sub;"]'),
                reg = new RegExp("vertical-align: sub", "g"),
                get_css = '';
            $set_dom.each(function () {
                get_css = $(this).attr('style').replace(reg, "");
                $(this).attr('style', get_css);
                $(this).css("lineHeight", data);
            })
            if (select_text === $text.text()) $text.css('lineHeight', data).find('*').css('lineHeight', data);
        } else {
            // 判断不被span包裹文本
            if ($text.find('span').length <= 0) $text.find('li').each(function () {
                $(this)[0].innerHTML = '<span>' + $(this)[0].innerHTML + '</span>'
            });
            // 设置行高
            $text.css('lineHeight', data).find('*').css('lineHeight', data);
            // ol 特殊情况处理
            $text.find('ol, ul').css('lineHeight', '').find('li').css('lineHeight', '');
        }
	},
	// 设置文本对齐
	set_font_align: function(ele, type){
		// 错误状态判断
		if(!ele || ele.length !== 1 || !['left', 'center', 'right', 'justify'].includes(type)) {
			console.error('params type error');
			return false;
		}
		let $text = ele.hasClass('show_text') ? ele : ele.find('.show_text');
		// 文本元素设置到父节点上
		if (ele.attr('data-type') === 'text') {
			$text = $text.parents('.text_content');
		}
		$text.css('textAlign', type).find('*').css('textAlign', type);
	},
	// 设置文本缩进
	set_indent: function(){
		document.execCommand("styleWithCSS", false, true);
		document.execCommand('Indent');
	},
	// 设置文本超链接
	set_link: function (ele, link) {
		if (link.indexOf('http') < 0) link = 'http://' + link;
		let aDom = ele.find('a[href]');
		if(aDom.length) {
			aDom.attr('href', link);
		}else{
			// 恢复储存选区
			editor_opt.recover_text_selection(ele);
			// 设置超链接
			document.execCommand("createLink", false, link);
			let sel = window.getSelection();
			// 超链接默认添加下划线
			let $sel_parent = sel.anchorNode.parentNode.parentNode;
			let underline = window.getComputedStyle($sel_parent)['textDecoration'].indexOf('underline');
			if (sel.anchorNode.parentNode.nodeName === 'A' && $sel_parent && underline < 0) {
				document.execCommand("styleWithCSS", false, true);
				document.execCommand('underline');
				document.execCommand('foreColor', false, 'rgb(0, 0, 238)');
			}
		}
	},
	// 删除文本超链接
	remove_link: function (dom) {
		editor_opt.set_selection(dom);
		let sel = window.getSelection();
		// 存在下划线时取消超链接同时删除下划线
		document.execCommand("unlink", false);
		if (sel.anchorNode.parentNode && getComputedStyle(sel.anchorNode.parentNode).textDecorationLine.indexOf('underline') >= 0) {
			document.execCommand('underline');
		}
		dom.focus();
		window.getSelection().removeAllRanges();
	},
	// 修改文本超链接
	change_link: function (dom,link) {
		$(dom).attr('href',link);
	},
	// 获取格式刷样式
	get_font_format: function(ele){
		if(!ele || ele.length !== 1) {
			console.error('params type error');
			return false;
		}
		let $text = '';
		if (ele.attr('data-type') === 'table') {
			$text = ele.hasClass('show_text') ? ele : ele.find('.cel_edit .show_text');
		} else {
			$text = ele.hasClass('show_text') ? ele : ele.find('.show_text');
		}
		if (window.getSelection()) {
			if (!$text[0].style) return;
			let select_node = window.getSelection().anchorNode,
				font_style = $text[0].style.cssText;
			// 判断选中节点是否为span
			if (select_node.nodeName === 'DIV') {
				select_node = $(select_node).find('*:not(div)')[0];
			} else {
				select_node = select_node.parentNode;
			}
			if (select_node) {
                // 循环获取样式
				while (select_node.nodeName !== "DIV") {
					font_style = font_style + select_node.style.cssText;
					select_node = select_node.parentNode;
                }
				if(select_node.nodeName === 'DIV' && font_style === ''){
					select_node = $text[0];
					font_style += select_node.style.cssText;
                }
			} else {
				font_style = $text[0].style.cssText;
			}
			// 无样式获取情况
			if (font_style && font_style === '') return false;
			// 处理非文本样式
			let style_arr = font_style.split(';'),
				not_font_style = ['display', 'width', 'height', 'min-height', 'transform', 'padding'];
			style_arr = style_arr.filter(function (item) {
				let key = item.split(':')[0].replace(/(^\s*)|(\s*$)/g, "");
				if (not_font_style.indexOf(key) < 0) return item;
			});
			// 返回样式
			return style_arr.join(';') + ';';
		}
	},
	// 设置文本格式刷
	set_format_painter: function (n, style) {
		if (!n || !n.length) {
			return;
		}
		let $text;
		let $node;
		if (n.hasClass('ele_item')) {
			if(n.find('.cel_selected')){
				$text = n.find('.cel_selected .show_text');
				$node = $text;
			}else{
				$text = n.find('.show_text');
				$node = $text;
			}
		} else {
			$text = n.parents('.show_text');
			$node = n.not('br');
		}
		let styleObj = {};
		//将原本的样式由字符串转换成对象的形式
		let styleArr = style.split(';');
		if(styleArr.length>0){
			styleArr.forEach((val)=>{
				styleObj[(val.split(':')[0]).trim()] = val.split(':')[1];
			});
		}
		//默认样式对象
		let tempObj = {
			"display":"inline-block",
			"font-size":"32px",
			"font-weight":"normal",
			"font-style":"normal",
			"font-family":"'Microsoft YaHei','PingFang SC',sans-serif",
			"text-shadow":"none",
			"text-align":"left",
			"line-height":"1.4",
			"letter-spacing":"normal",
			"color":"rgb(60,77,75)",
			"background-color":"transparent",
		}
		if(n.find('.cel_selected')){
			tempObj.display = "";
		}
		style = '';
		Object.assign(tempObj,styleObj);
		for (const key in tempObj) {
			if(key){
				style+=`${key}:${tempObj[key]};`
			}
		}
		$text.attr('data-preset', '');
		$node.attr('style', style).find('*').not('br').attr('style', '');
    },
    // 获取选区文本及样式
    range_node_handle: function(){
        let text_style = '',
            list_style = '',
            range, text_container, parent_node, select_node, style_node;
        // 获取选区节点
        if (window.getSelection || document.getSelection) {
            range = window.getSelection().getRangeAt(0);
            text_container = document.createElement('div');
            text_container.appendChild(range.cloneContents());
        } else if (document.selection) {
            // IE
            range = document.selection.createRange();
            text_container = $(range.htmlText)[0];
        };
        select_node = style_node = range.commonAncestorContainer;
        if (range.commonAncestorContainer.nodeType === 3) {
            select_node = style_node = range.commonAncestorContainer.parentNode;
        }
        let text_range = range.cloneRange();
        // 无内容拦截
        if (text_container.innerHTML === '') return false;

        // 循环获取样式
        while (style_node) {
            if (style_node.className === 'show_text') break;
            if (style_node.style) {
                if (style_node.nodeName === 'UL' || style_node.nodeName === 'OL') {
                    list_style = style_node.style.cssText
                } else {
                    text_style = style_node.style.cssText + text_style;
                }
            }
            style_node = style_node.parentNode;
        };
        if(style_node) text_style = style_node.style.cssText + text_style;
        // 处理非文本样式
        let style_arr = text_style.split(';'),
            not_font_style = ['width', 'height', 'min-height', 'transform', 'padding'];
        style_arr = style_arr.filter(function (item) {
            let key = item.split(':')[0].replace(/(^\s*)|(\s*$)/g, "");
            if (not_font_style.indexOf(key) < 0) return item;
        });
        text_style = style_arr.join(';') + ';text-indent: -999px;'

        // 节点处理
        for (var i = 0; i < text_container.childNodes.length; i++) {
            let $dom = text_container.childNodes[i];
            if ($dom.nodeType === 3) {
                parent_node = document.createElement('span');
                parent_node.appendChild($dom);
                parent_node.style.cssText = text_style;
                text_container.insertBefore(parent_node, text_container.childNodes[i]);
            } else if (['UL', 'OL', 'BR'].indexOf($dom.nodeName) < 0) {
                $dom.style.cssText = text_style + $dom.style.cssText;
            }
        };
        // 列表结构处理
        let tagName = select_node.tagName;
        if (tagName === 'UL' || tagName === 'OL') {
            parent_node = document.createElement(select_node.tagName);
            $(text_container.innerHTML).each(function () {
                parent_node.appendChild($(this)[0]);
            });
            parent_node.style.cssText = list_style;
            if ($(parent_node).css('list-style-type') === 'none'){
                if (tagName === 'UL'){
                    $(parent_node).css('list-style-type', 'disc');
                }else{
                    $(parent_node).css('list-style-type', 'decimal');
                }
            }
            text_container.innerHTML = parent_node.outerHTML;
        };
        return {'value':text_container, 'range':text_range}
    },
	// 设置艺术字渐变色
	set_font_gradient: function(ele, type, data){
		/**
		 * type: before渐变开始    after渐变结束
		 */
		// 错误状态判断
		if(!ele || ele.length !== 1 || typeof type !== 'string' || typeof data !== 'string') {
			console.error('params type error');
			return false;
		}
		let $text = ele.find('.show_text'),
			gradient = $text[0].style['backgroundImage'],
			before = gradient.match(/rgb\([\d,\s]*\)/g)[0],
			after = gradient.match(/rgb\([\d,\s]*\)/g)[1],
			color = base_opt.fn.color_exchange_function('hex', data).toLocaleLowerCase().replace(/,\s?/g, ', ');
		if (type === 'gradient_before') {
			let before_gradient = gradient.replace(before, color);
			$text[0].style.backgroundImage = before_gradient;
		}
		if (type === 'gradient_after') {
			let after_gradient = gradient.replace(after, color);
			$text[0].style.backgroundImage = after_gradient;
		}

	},
	// 编辑富文本，使选区部分被span标签包裹，并返回span节点
	editor_buildwrap: function () {
		let sel = window.getSelection();
		document.execCommand('styleWithCSS', false, false);
		document.execCommand('fontName', false, 'createSpanElement');
		let node = $(sel.anchorNode).parents('[contenteditable="true"]').find('font[face="createSpanElement"]').contents().unwrap().wrap('<span></span>').parent();
		return node;
	},
};
export default editor_opt;