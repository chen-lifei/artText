import member_rankauthorities from '@/assets/common/js/member_rankauthorities.js';
import base_opt from '@/assets/pc/js/opt/base_opt.js';
import group_opt from '@/assets/pc/js/opt/group_opt.js';
import chart_opt from '@/assets/pc/js/opt/chart_opt.js';

let page_opt = {
    //预设版式数据
    default_page_info : {
        id: '',
        pageNumber: null,
        background: {},
        backgroundImage: null,
        backgroundImageWidth: null,
        backgroundImageHeight: null,
        switchType : 'fadeInAndOut',
        elementList: [],
        modifyDate: '未保存'
    },
    // 画布尺寸相关
    page_size:{},
    // 文档页模板
    template: {},
    // 获取 base_opt 中的 fn
    fn: base_opt.fn,
    //文档页最大数量
    document_page_list_max_length:99,
    // 提取文档页节点为对象
    get_page: function(dom){
        // 错误状态判断
        if(!dom || dom.length !== 1 || !dom.hasClass('edit_page')){
            console.error('params type error');
            return false;
        }
        let $ele = dom.find('.ele_item'),
            ele_list = group_opt.dom_2_ele_list($ele),
            $bg = dom.find('.page_bg');
        return {
            uuid : dom.attr('data-uuid'),
            background: base_opt.background_style_2_obj($bg,true),
            elementList : ele_list,
        };
    },
    // 生成文档页节点
    get_dom: function(doc, page, page_scale){
        // 错误状态判断
        if(!doc || typeof doc !== 'object' || !page || typeof page !== 'object'){
            console.error('params type error');
            return false;
        }
        let page_w = doc.width;
        let page_h = doc.height;
        let content = `<div id="edit_page" class="edit_page">
                            <div class="page_bg"></div>
                            {{ele_html}}
                        </div>`;
        let $content = $(content);
        // 设置文档id
        $content.attr({'data-uuid': page.uuid});
        // 设置画布大小
        $content.css({
            'width': `${page_w}px`,
            'height': `${page_h}px`
        }).find('.page_bg').css({
            'width': `${page_w}px`,
            'height': `${page_h}px`
        });
        // 设置画布缩放
        if(typeof(page_scale) !== 'undefined'){
            $content.css({
                'transform': `scale(${page_scale})`
            });
        }
        // 设置画布背景
        // 旧背景图数据
        let page_background = base_opt.fn.clone_object(page.background);
        if (page.backgroundImageWidth && page.backgroundImageHeight) {
            page_background.image.width = page.backgroundImageWidth;
            page_background.image.height = page.backgroundImageHeight;
        }
        page_opt.set_page_background($content, page_background);
        content = $content.prop('outerHTML');
        // 遍历元素
        let ele_html = "";
        if(page.elementList && page.elementList.length > 0) {
            ele_html = group_opt.ele_list_2_dom(page.elementList);
        }
        return content.replace('{{ele_html}}', ele_html);
    },
    //渲染(uuid:目标渲染文档页uuid,cursor_position:光标定位信息)
    render : function(that,uuid,cursor_position){
        that.stop_document_observer();
        that.init_document_other_data();
        let $page_contain = $('#page_contain'),
            $edit_page = $('#page_contain').find('.edit_page'),
            old_document_info_width = $edit_page.css('width'),
            old_document_info_height = $edit_page.css('height');
        if(typeof(uuid) !== 'undefined' && uuid !== null){
            $.each(that.document_page_list, function(i, item){
                if(item.uuid === uuid){
                    that.page_info = item;
                    return false;
                }
            });
        }
        let content = page_opt.get_dom(that.document_info, that.page_info, that.page_scale.user_set);
        $page_contain.html(content);
        $page_contain.find('.ele_item[data-type="chart"]').each((index, item)=>{//图表初始化
            chart_opt.init_instance($(item));
        });
        let new_document_info_width = that.document_info.width + 'px',
            new_document_info_height = that.document_info.height + 'px';
        if(old_document_info_width !== new_document_info_width || old_document_info_height !== new_document_info_height){
            that.compute_suitable_scale();
        }
        page_opt.set_cursor_position(that,cursor_position);
        that.build_ele_masking();
        that.start_document_observer();
    },
    //渲染协作
    render_collaborate : function(that,command){
        that.stop_document_observer();
        that.init_document_other_data();
        if(!command){
            return;
        }
        let $edit_page = $('.page_contain .edit_page');
        let $background = $edit_page.find('.page_bg');
        let old_document_info_width = $edit_page.css('width');
        let old_document_info_height = $edit_page.css('height');
        //是否同一页
        let old_uuid = $edit_page.attr('data-uuid');
        let new_uuid = that.page_info.uuid;
        if(old_uuid !== new_uuid){
            this.render(that);
            return;
        }
        let page_info_command;
        $.each(command.documentPages, function(i,item){
            if(item.type !== 'delete' && item.uuid === that.page_info.uuid){
                page_info_command = item;
                return false;
            }
        });
        //设置文档页uuid
        $edit_page.attr({'data-uuid': that.page_info.uuid});
        $edit_page.css({width:that.document_info.width, height:that.document_info.height});
        $background.css({width:that.document_info.width, height:that.document_info.height});
        //设置文档页背景色
        page_opt.set_page_background($edit_page, that.page_info.background);
        // 编辑正被选中
        let edit_checked = false;
        if(page_info_command){
            //元素添加(废弃兼容)
            if(typeof(page_info_command.elementList.add) !== 'undefined'){
                $.each(page_info_command.elementList.add, function(i,item){
                    if($edit_page.find('#'+item.id+'.checked').length > 0){
                        edit_checked = true;
                    }
                    $edit_page.append(group_opt.ele_list_2_dom([item]));
                    // 图表初始化
                    if (item.type === 'chart') {
                        chart_opt.init_instance($edit_page.find(`#${item.id}`));
                    }
                });
            }
            //元素编辑
            $.each(page_info_command.elementList.edit, function(i,item){
                if($edit_page.find('#'+item.id+'.checked').length > 0){
                    edit_checked = true;
                }
                let $ele = $edit_page.find('#' + item.id);
                if($ele.length === 0){
                    $edit_page.append(group_opt.ele_list_2_dom([item]));
                }else{
                    $ele.prop('outerHTML', group_opt.ele_list_2_dom([item]));
                }
                // 更新图表数据
                if (item.type === 'chart') {
                    chart_opt.init_instance($edit_page.find(`#${item.id}`));
                }
            });
            //元素删除
            $.each(page_info_command.elementList.delete, function(i,item){
                if($edit_page.find('#'+item+'.checked').length > 0){
                    edit_checked = true;
                }
                $edit_page.find('#' + item).remove();
            });
            //元素排序
            let $prev;
            $.each(page_info_command.elementList.order,function(i,item){
                let $item = $edit_page.find('#'+item);
                if($item.length === 0){
                    return true;
                }
                if(typeof($prev) === 'undefined' && !$item.hasClass('checked')){
                    $edit_page.prepend($item);
                }else if(!$item.hasClass('checked')){
                    $prev.after($item);
                }
                $prev = $item;
            });
            $edit_page.prepend($edit_page.find('.page_bg'));
        }
        //设置画布大小
        this.set_page_scale(that);
        let new_document_info_width = $edit_page.css('width');
        let new_document_info_height = $edit_page.css('height');
        if(old_document_info_width !== new_document_info_width || old_document_info_height !== new_document_info_height){
            that.compute_suitable_scale();
        }
        //更新虚线框
        if(edit_checked){
            let $checked = $edit_page.find('.ele_item.checked');
            that.ele_cancel_checked();
            that.set_ele_checked($checked);
        }
        that.start_document_observer();
    },
    /**
     * 添加
     * data:
     * @param {type} 插入方式(up|down),非必填,默认down 
     * @param {use_theme} 是否使用主题,非必填
     * @param {add_page_infos} 新增文档页,非必填,空则插入空白文档页
     * @param {target_page_info_uuid} 目标页uuid,非必填,空则插入首页位置 
     */
    add: function(that, data){
        let _this = this;
        //返回数据
        let result = {
            //前一页uuid
            pre_page_info_uuid : null,
            //新增文档页uuid
            add_page_info_uuids : [],
            //插入方式
            type:'down'
        }
        //限制校验
        let page_maxlength = member_rankauthorities.getrank().documentPageAdd || 20;
        if (that.document_page_list.length >= page_maxlength){
            return member_rankauthorities.modal.documentPageAdd();
        }
        //参数获取
        let target_page_info_uuid = data.target_page_info_uuid;
        let type = data.type;
        let add_page_infos = data.add_page_infos;
        let use_theme = data.use_theme;
        //1、查找插入位置
        let insert_index;
        let tmp_insert_index;
        $.each(that.document_page_list,function(i,item){
            if(item.uuid === target_page_info_uuid){
                insert_index = i;
                result.pre_page_info_uuid = target_page_info_uuid;
                return false;
            }
        });
        // 默认第一页
        if(typeof(insert_index) === 'undefined'){
            insert_index = -1;
        }
        tmp_insert_index = insert_index;
        //2、插入方式
        if(!type){
            type = 'down';
        }
        result.type = type;
        //3、处理新增文档页
        if(!add_page_infos){
            add_page_infos = [];
            add_page_infos.push(_this.default_page_info);
        }
        if($.isPlainObject(add_page_infos)){
            add_page_infos = [add_page_infos];
        }
        add_page_infos = base_opt.fn.clone_object(add_page_infos);
        //插入新增文档页
        $.each(add_page_infos,function(i,item){
            let new_page_info = {
                id : null,
                uuid : base_opt.fn.uuid(),
                sign : null,
                title : null,
                background : {
                    type: 'color',
                    color: '#ffffff',
                    image: null
                },
                switchType : 'fadeInAndOut',
                isLock : false,
                elementList : [],
                pageNumber : 1,
                attr: null
            };
            new_page_info.switchType = that.document_info.switchType || new_page_info.switchType;
            new_page_info.attr = {};
            new_page_info.attr['defaultAnimation'] = !!(that.document_info.attr && that.document_info.attr['defaultAnimation']);
            new_page_info.attr['playType'] = that.document_info.attr && that.document_info.attr['playType'];
            // 基于对象结构附值
            $.map(new_page_info, function(value, key){
                if($.inArray(key, ['id', 'uuid', 'sign', 'title', 'pageNumber', 'switchType', 'isLock', "attr"]) !== -1){
                    return true;
                }
                let newValue = item[key];
                try{
                    if(key === 'elementList' || key === 'background'){
                        if (typeof (newValue) === 'string') {
                            newValue = JSON.parse(newValue);
                        }
                    }
                }catch(e){}
                new_page_info[key] = typeof(newValue) !== 'undefined' ? newValue : null;
            });

            if(type === 'down'){
                ++tmp_insert_index;
            }
            that.document_page_list.splice(tmp_insert_index, 0, new_page_info);
            result.add_page_info_uuids.push(new_page_info.uuid);
            //继承样式
            if(use_theme){
                let doc={document_info:that.document_info,document_page_list:[new_page_info]};
                // 文档主题
                let theme = {
                    // 如果是第一页向上新增页 那就继承第一页
                    background: that.document_page_list[tmp_insert_index > 0 ? tmp_insert_index - 1 : tmp_insert_index + 1].background,
                    shapeColor: that.document_info.shapeColor,
                    textColor : that.document_info.textColor
                };
                _this.set_document_theme(doc, theme, false);
                // 文档字体
                let document_info_font = that.document_info.font;
                if (document_info_font) _this.set_document_font(doc, document_info_font, false);
            }
        });
        //标识修改页
        let pageNumber = that.document_page_list.slice(0,insert_index).length;
        $.each(that.document_page_list,function(i,item){
            if(i >= insert_index){
                item.sign = base_opt.fn.uuid();
                item.pageNumber = ++pageNumber;
            }
        });
        //渲染
        let page_info_uuid = result.add_page_info_uuids[0];
        if(page_info_uuid){
            _this.render(that,page_info_uuid);
        }
        return result;
    },
    //复制(uuid:文档页uuid)
    copy : function(that, uuid){
        let _this = this;
        let result = {
            pre_page_info_uuid : "",
            add_page_info_uuids : [],
        }
        //限制校验
        let page_maxlength = member_rankauthorities.getrank().documentPageAdd || 20;
        if (that.document_page_list.length >= page_maxlength){
            return member_rankauthorities.modal.documentPageAdd();
        }
        if(typeof(uuid) === 'undefined' || uuid === null){
            return;
        }
        let index;
        $.each(that.document_page_list, function(i, item){
            if(item.uuid === uuid){
                index = i;
                result.pre_page_info_uuid = item.uuid;
            }else if(typeof(index) !== 'undefined'){
                item.sign = base_opt.fn.uuid();
                item.pageNumber++;
            }
        });
        if(typeof(index) === 'undefined'){
            return;
        }
        let new_page_info = base_opt.fn.clone_object(that.document_page_list[index]);
        new_page_info.id = null;
        new_page_info.uuid = base_opt.fn.uuid();
        new_page_info.sign = null;
        new_page_info.pageNumber++;
        new_page_info.isLock = false;
        $.each(new_page_info.elementList,function(i,item){
            item.id = base_opt.fn.uuid();
        });
        that.document_page_list.splice(index + 1, 0, new_page_info);
        that.page_info = new_page_info;
        result.add_page_info_uuids.push(that.page_info.uuid);
        this.render(that);
        that.$toast("复制成功", 1000);
        return result;
    },
    //删除页(uuids:文档页uuid)
    delete : function(that, uuids){
        let _this = this;
        let result = {
            delete_page_info_uuids : []
        };
        if(typeof(uuids) === 'undefined'){
            return;
        }
        if(typeof(uuids) === 'string'){
            uuids = [uuids];
        }
        let uuids_length = uuids.length;
        if(uuids_length === 0){
            return;
        }
        let document_page_list_length = that.document_page_list.length;
        if(document_page_list_length - uuids_length < 1){
            that.$toast("删除失败,删除文档页数量超出文档所需文档页数量(>=1)", 800);
            return;
        }
        if(uuids.filter(v => that.checked_id_arr[v] && that.checked_id_arr[v].length > 0).length > 0){
            that.$toast('其他协作者正在编辑此页不可删除', 800);
            return;
        }
        let new_page_info_index;
        $.each(uuids, function(i,item){
            let deleteIndex = null;
            $.each(that.document_page_list, function(j,jtem){
                if(item === jtem.uuid){
                    deleteIndex = j;
                    result.delete_page_info_uuids.push(jtem.uuid);
                }else if(deleteIndex !== null){
                    jtem.sign = base_opt.fn.uuid();
                    jtem.pageNumber--;
                }
            })
            if(deleteIndex !== null){
                that.document_page_list.splice(deleteIndex, 1);
                if(!new_page_info_index || deleteIndex < new_page_info_index){//获取删除后的后一页下标
                    new_page_info_index = deleteIndex;
                }
                deleteIndex = null;
            }
        });
        if($.inArray(that.page_info.uuid, uuids) !== -1){//如删除是当前页
            let new_page_info;
            if(typeof(new_page_info_index) !== 'undefined'){
                new_page_info = that.document_page_list[new_page_info_index > 0 ? --new_page_info_index: new_page_info_index];//渲染删除页的前一页
            }
            if(!new_page_info){
                new_page_info = that.document_page_list[that.document_page_list - 1];
            }
            that.page_info = new_page_info;
            _this.render(that);
        }
        that.$toast("删除成功", 1000);
        return result;
    },
    //替换页(replace_page_infos替换页数据(map结构,key:uuid,value:page_info)
    replace : function(that, replace_page_infos){
        let _this = this;
        let result = {
            replace_page_info_uuids:[]
        };
        if(!replace_page_infos){
            return;
        }
        if(Object.keys(replace_page_infos).filter(v => that.checked_id_arr[v] && that.checked_id_arr[v].length > 0).length > 0){
            that.$toast('其他协作者正在编辑此页不可替换', 800);
            return;
        }
        //替换文档页
        let replace_flag = false;
        $.each(that.document_page_list, function(i,item){
            let new_page_info = replace_page_infos[item.uuid];
            if(!new_page_info){
                return true;
            }
            item.sign = base_opt.fn.uuid();
            $.map(item, function(value, key){
                if($.inArray(key, ['id', 'uuid', 'sign', 'pageNumber', 'isLock']) !== -1){
                    return true;
                }
                let newValue = new_page_info[key];
                try{
                    if(key === 'elementList' || key === 'background'){
                        if (typeof newValue === 'string') {
                            newValue = JSON.parse(newValue);
                        }
                    }
                }catch(e){}
                item[key] = typeof(newValue) !== 'undefined' ? newValue : null;
            });
            //当前文档页被替换
            if(that.page_info.uuid === item.uuid){
                replace_flag = true;
            }
            result.replace_page_info_uuids.push(item.uuid);
        });
        //渲染文档页
        if(replace_flag){
            _this.render(that);
        }
        return result;
    },
    // 锁定(uuid: 文档)
    lock: function(that, uuid){
        $.each(that.document_page_list, function(i,item){
            if(item.uuid === uuid){
                item.sign = base_opt.fn.uuid();
                item.isLock = !item.isLock;
                return false;
            }
        });
        that.$toast('设置成功',800);
    },
    // 切换页预览动画效果，只触发动画效果 opt.in_html = 入场html  opt.direction = 入场方向  type = 翻页效果  timer = 切换时间
    page_switch_preview: function (opt) {
        let _this = this;
        let option = {
            in_html: null,
            type: 'fadeInAndOut',
            timer: null,
            direction: '',
            switchBefore: null,
            switchAfter: null,
        };
        option = Object.assign(option, opt);
        if (!option.direction) {
            if (typeof option.switchBefore === 'function') option.switchBefore();
            if (typeof option.switchAfter === 'function') option.switchAfter();
            return;
        }
        let is_in = option.direction === 'next';
        // 当前画布
        let $page = base_opt.get_canvas_page();
        let page_msg = $page[0].getBoundingClientRect();
        let $contain = $('.switch_page_animation_container');
        let $content = $contain.find('.switch_page_content');
        let $inner = $contain.find('.switch_page_inner');
        let $out = $inner.eq(0);
        let $in = $inner.eq(1);
        // 动画预览dom样式设置
        $content.css({
            'top': `${page_msg.top}px`,
            'left': `${page_msg.left}px`,
            'width': `${page_msg.width}px`,
            'height': `${page_msg.height}px`,
        });
        $inner.css({
            'width': `${page_msg.width}px`,
            'height': `${page_msg.height}px`,
        }).attr('data-switch', String(option.type));
        // 动画预览dom节点渲染
        $out.html($page.prop('outerHTML')).addClass('show');
        $in.html(option.in_html);
        $contain.show();
        // 动画结束隐藏节点重置效果
        let end = function () {
            $contain.hide();
            $in.removeClass('show in out prev_in prev_out next_in next_out');
            $out.removeClass('show in out prev_in prev_out next_in next_out');
            if (typeof option.switchAfter === 'function') option.switchAfter();
        }
        // 等待节点渲染完成
        setTimeout(() => {
            if (typeof option.switchBefore === 'function') option.switchBefore();
            _this.switch_effect_case({
                type: option.type,
                timer: option.timer,
                isIn: is_in,
                in: $in,
                out: $out,
                complete: end,
            });
        }, 10);
    },
    // 翻页切换效果 switch 
    switch_effect_case: function (opt) {
        let option = {
            type: '',
            timer: 600,
            isIn: true,
            in: null,
            out: null,
            complete: null,
        }
        option = Object.assign(option, opt);
        if (!option.timer) {
            option.timer = 600;
        }
        let is_in = option.isIn;
        let $in = $(option.in);
        let $out = $(option.out);
        switch (option.type) {
            case 'fadeInAndOut':    // 淡入淡出
                $out.removeClass('show');
                $in.addClass('show');
                break;
            case 'pagingDown':      // 上下翻页
                if (is_in) {
                    $out.removeClass('show').addClass('prev_out');
                    $in.addClass('next_in');
                } else {
                    $out.removeClass('show').addClass('next_out');
                    $in.addClass('prev_in');
                }
                break;
            case 'pagingRight':     // 左右翻页
                if (is_in) {
                    $out.removeClass('show').addClass('prev_out');
                    $in.addClass('next_in');
                } else {
                    $out.removeClass('show').addClass('next_out');
                    $in.addClass('prev_in');
                }
                break;
            case 'gooseDown':       // 上下推移
                if (is_in) {
                    $out.removeClass('show').addClass('prev_out');
                    $in.addClass('next_in');
                } else {
                    $out.removeClass('show').addClass('next_out');
                    $in.addClass('prev_in');
                }
                break;
            case 'gooseRight':      // 左右推移
                if (is_in) {
                    $out.removeClass('show').addClass('prev_out');
                    $in.addClass('next_in');
                } else {
                    $out.removeClass('show').addClass('next_out');
                    $in.addClass('prev_in');
                }
                break;
            case 'flipping':        // 翻转
                if (is_in) {
                    $out.removeClass('show').addClass('prev_out');
                    $in.addClass('next_in');
                } else {
                    $out.removeClass('show').addClass('next_out');
                    $in.addClass('prev_in');
                }
                break;
            case 'switching':       // 切换
                if (is_in) {
                    $out.removeClass('show').addClass('prev_out');
                    $in.addClass('next_in');
                } else {
                    $out.removeClass('show').addClass('next_out');
                    $in.addClass('prev_in');
                }
                option.timer = 1200;
                break;
            case 'library':         // 库
                if (is_in) {
                    $out.removeClass('show').addClass('prev_out');
                    $in.addClass('next_in');
                } else {
                    $out.removeClass('show').addClass('next_out');
                    $in.addClass('prev_in');
                }
                option.timer = 1000;
                break;
            case 'cube':            // 立方体（暂不支持使用）
                if (is_in) {
                    $out.removeClass('show').addClass('prev_out');
                    $in.addClass('next_in');
                } else {
                    $out.removeClass('show').addClass('next_out');
                    $in.addClass('prev_in');
                }
                option.timer = 1000;
                break;
            case 'zoom':            // 缩放
                if (is_in) {
                    $out.removeClass('show').addClass('prev_out');
                    $in.addClass('next_in');
                } else {
                    $out.removeClass('show').addClass('next_out');
                    $in.addClass('prev_in');
                }
                break;
            case 'ferrisWheel':     // 摩天轮
                if (is_in) {
                    $out.removeClass('show').addClass('prev_out');
                    $in.addClass('next_in');
                } else {
                    $out.removeClass('show').addClass('next_out');
                    $in.addClass('prev_in');
                }
                option.timer = 1500;
                break;
            case 'track':           // 轨道
                if (is_in) {
                    $out.removeClass('show').addClass('prev_out');
                    $in.addClass('next_in');
                } else {
                    $out.removeClass('show').addClass('next_out');
                    $in.addClass('prev_in');
                }
                option.timer = 1500;
                break;
            default:
                $out.removeClass('show');
                $in.addClass('show');
                option.timer = 100;
                break;
        }
        setTimeout(() => {
            if (typeof option.complete === 'function') option.complete();
        }, option.timer - 60);
    },
    //切换页(index:目标文档页下标,action:动作(previous:上一页,next:下一页))
    change : function(that, index, action){
        let _this = this;
        if(_this.page_loading || that.show_image_loading){
            return false;
        }
        _this.page_loading = true;
        // 清除文本粘贴格式设置
        that.clean_text_format();
        // 清除画布状态
        that.clear_page_status();
        // 清除元素选中状态
        that.ele_cancel_checked();
        // 移除协作者
        $('.editing_element_masking .item:not(.template)').remove();
        // 格式刷样式保存
        let format_painter_style = '';
        if (that.had_format_painter) {
            format_painter_style = that.format_painter_style;
        }
        let page_scale = base_opt.page_scale;
        // 获取目标页html
        let target_page = that.document_page_list[index];
        let target_page_html = _this.get_dom(that.document_info, target_page);
        target_page_html = $(target_page_html).css('transform', `scale(${page_scale})`).prop('outerHTML');
        _this.page_switch_preview({
            in_html: target_page_html,
            direction: action,
            timer: 300,
            switchBefore: () => {
                // 更新当前页
                that.page_info = target_page;
            },
            switchAfter: () => {
                // 更新当前页
                _this.render(that);
                // 更新状态
                _this.page_loading = false;
                that.$nextTick(function () {
                    // 右侧评论列表更新
                    that.get_right_comment();
                });
                // 恢复格式刷功能(暂时没有好的方案处理)
                if (format_painter_style !== '') {
                    that.had_format_painter = true;
                    that.format_painter_style = format_painter_style;
                }
            },
        });
        return true;
    },
    //设置标题(uuid:文档页uuid,title:文档页标题)
    set_title : function(that, uuid, title){
        if($validate(title).emoji()){
            that.page_info_title = that.page_info.title;
            return that.$toast('存在非法字符，请重新输入！')
        }
        $.each(that.document_page_list, function(i,item){
            if(item.uuid === uuid){
                item.sign = base_opt.fn.uuid();
                item.title = title;
                return false;
            }
        });
        if(that.page_info_title !== that.page_info.title){
            that.page_info_title = that.page_info.title;
            that.$toast('设置成功',800);
        }
    },
    /**
     * 设置顺序
     * data
     * @param {order_uuids} 需排序的uuids,必填 
     * @param {after_uuid} 移至指定uuid后,非必填,空则移动到首位 
     */
    set_sort : function(that, data){
        let result = {
            after_uuid : null,
            order_uuids : []
        };
        //参数获取
        let after_uuid = data.after_uuid;
        let order_uuids = data.order_uuids;
        if(typeof(order_uuids) === 'undefined' || order_uuids.length === 0){
            return;
        }
        //查找排序到目标位置
        let after_uuid_index;
        let pageNumber;
        if(typeof(after_uuid) !== 'undefined' && after_uuid !== null){
            $.each(that.document_page_list, function(i,item){
                if(item.uuid === after_uuid){
                    after_uuid_index = i;
                    pageNumber = item.pageNumber;
                    result.after_uuid = item.uuid;
                }
            });
        }
        if(typeof(after_uuid_index) === 'undefined' || typeof(pageNumber) === 'undefined'){
            after_uuid_index = -1;
            pageNumber = 0;
        }
        $.each(that.document_page_list,function(i,item){
            if(i > after_uuid_index){
                item.pageNumber += order_uuids.length;
            }
            if($.inArray(item.uuid, order_uuids) !== -1){
                item.pageNumber = ++pageNumber;
                result.order_uuids.push(item.uuid);
            }
        });
        that.document_page_list.sort(function(a,b){
            return a.pageNumber > b.pageNumber ? 1 : -1;
        });
        $.each(that.document_page_list, function(i,item){
            item.sign = base_opt.fn.uuid();
            item.pageNumber = i + 1;
        });
        return result;
    },
    //设置文档单页切换效果，重置document_info.switchType
    set_page_switchType(that, uuid, switchType){
        let type = switchType;
        if (!type) {
            type = null;
        }
        let list = that.document_page_list.find(item => item.uuid === uuid && item.switchType !== type);
        if (list) {
            list.sign = base_opt.fn.uuid();
            list.switchType = type;
            // 全局
            that.document_info.switchType = null;
        }
    },
    // 设置文档切换效果
    set_document_switchType: function (that, switchType) {
        let type = switchType;
        if (!type) {
            type = null;
        }
        that.document_info.switchType = type;
        if (type) {
            for (let i = 0, len = that.document_page_list.length; i < len; i++) {
                let item = that.document_page_list[i];
                item.switchType = type;
                item.sign = utils.uuid();
            }
        }
    },
    //设置文档标题
    set_document_title : function(that){
        let title = that.document_info_title;
        if(title === null || title === ''){
            that.document_info_title = that.document_info.title;
            that.$toast("文档标题不能为空");
        } else if ($validate(title).emoji()) {
            that.document_info_title = that.document_info.title;
            that.$toast('存在非法字符，请重新输入！')
        } else if (that.document_info.title !== title) {
            that.document_info.title = title;
            document.title = `${title}-吾道幻灯片`;
            that.$toast('设置成功', 800);
        }
    },
    // 设置文档背景(document_page_list:文档页列表, background:背景, reRender:重渲染)
    set_document_background : function(that, background, reRender){
        let opt = this;
        background = {
            type : background.type,
            color : background.color,
            image : background.image
        };
        that.document_info.background = base_opt.fn.clone_object(background);
        that.document_page_list.forEach(function(item){
            item.background = base_opt.fn.clone_object(background);
            // 更新保存标识
            item.sign = opt.fn.uuid();
        });
        group_opt.ele_sync_theme(that.document_info);
        if(typeof(reRender) !== 'undefined' && reRender){
            this.render(that);
        }
    },
    // 设置背景音乐
    set_document_backgroundMusic: function (that, musicKey, musicValue) {
        if (!that) {
            return;
        }
        if (!that.document_info.attr) {
            that.document_info.attr = {};
        }
        if (!musicKey) {
            that.$set(that.document_info.attr, 'backgroundMusic', null);
        } else {
            let music_obj = that.document_info.attr.backgroundMusic || {};
            // 单次设置多个
            if (Object.prototype.toString.call(musicKey) === '[object Object]') {
                for (let key in musicKey) {
                    music_obj[key] = musicKey[key];
                }
            } else {
                music_obj[musicKey] = musicValue;
            }
            that.$set(that.document_info.attr, 'backgroundMusic', music_obj);
        }
    },
    // 设置文档主题(theme:主题(background:背景, shapeColor:形状颜色, textColor:文本颜色) ,reRender:重渲染)
    set_document_theme : function(that, theme, reRender){
        // 错误状态判断
        if(!that || !theme || (!theme.background && theme.background !== null) || (!theme.shapeColor && theme.shapeColor !== null) || (!theme.textColor && theme.textColor !== null)){
            console.error('params type error');
            return false;
        }
        let opt = this;
        // 修改文档数据
        that.document_info.shapeColor = theme.shapeColor;
        that.document_info.textColor = theme.textColor;
        let document_background = base_opt.fn.clone_object(theme.background);
        that.document_info.background = {
            type: document_background.type,
            color: document_background.color,
            image: document_background.image
        };
        // 修改文档页列表数据
        that.document_page_list.forEach(function(item){
            // 修改文档页背景色
            let page_background = base_opt.fn.clone_object(theme.background);
            item.background = {
                type: page_background.type,
                color: page_background.color,
                image: page_background.image
            };
            // 更新保存标识
            item.sign = opt.fn.uuid();
            // 修改元素列表
            let element_arr = item.elementList;
            if (element_arr && element_arr.length > 0){
                element_arr.forEach(function (el) {
                    switch (el.type) {
                        case 'text':
                            let $element = $(el.content);
                            // 设置文本颜色
                            if (theme.textColor){
                                $element.css('color', theme.textColor).find('*').each(function () {
                                    if ($(this)[0].style.color) $(this).css({ 'color': theme.textColor });
                                });
                            }
                            el.content = $element[0].outerHTML;
                            break;
                        case 'line':
                            // 设置线条颜色
                            if (theme.shapeColor) el.border_c = theme.shapeColor;
                            break;
                        case 'shape':
                            // 设置文本颜色
                            if (el.text) {
                                let $element = $(el.text.content),
                                    color = theme.textColor === theme.shapeColor ? '#ffffff' : theme.textColor;
                                if (color){
                                    $element.css('color', color).find('*').each(function () {
                                        if ($(this)[0].style.color) $(this).css({ 'color': color });
                                    });
                                }
                                el.text.content = $element[0].outerHTML;
                            }
                            // 设置形状背景色
                            if (theme.shapeColor){
                                el.background = {
                                    type: 'color',
                                    color: theme.shapeColor,
                                    image: null
                                };
                            }
                            break;
                        case 'table':
                            el.tr_list.forEach(function (tr) {
                                tr.forEach(function (cel) {
                                    // 设置单元格背景色
                                    if (theme.background && theme.background.type === 'color') {
                                        cel.background = theme.background;
                                    }
                                    // 设置文本颜色
                                    if (cel.content) {
                                        let $cel = $(cel.content);
                                        if (theme.textColor != null){
                                            $cel.css('color', theme.textColor).find('*').each(function () {
                                                if ($(this)[0].style.color) $(this).css({ 'color': theme.textColor });
                                            });
                                        }
                                        cel.content = $cel[0].outerHTML;
                                    }
                                })
                            });
                            break;
                    }
                });
            }
        });
        // 元素模板同步主题设置
        group_opt.ele_sync_theme(that.document_info);
        // 判断渲染
        if(typeof(reRender) !== 'undefined' && reRender) this.render(that);
    },
    // 设置文档主题字体(font:字体, reRender:重渲染)
    set_document_font : function(that, font, reRender){
        // 错误状态判断
        if(!that || !font || typeof font !== 'string'){
            console.error('params type error');
            return false;
        }
        let opt = this;
        // 修改文档数据
        that.document_info.font = font;
        // 修改文档页列表数据
        that.document_page_list.forEach(function(item){
            // 更新保存标识
            item.sign = opt.fn.uuid();
            // 修改元素列表
            let element_arr = item.elementList;
            if (element_arr && element_arr.length > 0){
                element_arr.forEach(function (el) {
                    switch (el.type) {
                        case 'text':
                            let $element = $(el.content);
                            // 设置文本颜色
                            $element.css('fontFamily', font).find('*').each(function(){
                                if($(this)[0].style.fontFamily) $(this).css({'fontFamily': font});
                            });
                            el.content = $element[0].outerHTML;
                            break;
                        case 'shape':
                            // 设置文本颜色
                            if (el.text) {
                                let $element = $(el.text.content);
                                $element.css('fontFamily', font).find('*').each(function(){
                                    if($(this)[0].style.fontFamily) $(this).css({'fontFamily': font});
                                });
                                el.text.content = $element[0].outerHTML;
                            }
                            break;
                        case 'table':
                            el.tr_list.forEach(function (tr) {
                                tr.forEach(function (cel) {
                                    // 设置文本颜色
                                    if (cel.content) {
                                        let $cel = $(cel.content);
                                        $cel.css('fontFamily', font).find('*').each(function(){
                                            if($(this)[0].style.fontFamily) $(this).css({'fontFamily': font});
                                        });
                                        cel.content = $cel[0].outerHTML;
                                    }
                                })
                            });
                            break;
                    }
                });
            }
        });
        // 元素模板同步主题设置
        group_opt.ele_sync_theme(that.document_info);
        // 判断渲染
        if(typeof(reRender) !== 'undefined' && reRender) this.render(that);
    },
    // 更改文档尺寸
    set_document_size: function(doc, page_w, page_h){
        // 错误状态判断
        if(!page_w || !page_h){
            console.error('params type error');
            return false;
        }
        let $content = base_opt.get_canvas_page();
        doc.width = page_w;
        doc.height = page_h;
        // 设置画布大小
        $content.css({
            'width': `${page_w}px`,
            'height': `${page_h}px`
        }).find('.page_bg').css({
            'width': `${page_w}px`,
            'height': `${page_h}px`
        });
     },
    // 存储画布偏移尺寸
    save_page_offset: function(){
        page_opt.page_size = {
            top_panel: $('.edit_head')[0].clientHeight,
            bottom_panel: $('.edit-footer')[0].clientHeight,
            left_panel: $('.edit_left').innerWidth(),
            right_panel: $('.edit-right').innerWidth(),
            top_offset: 25,
            left_offset: 30,
            right_offset: 10
        }
    },
    // 设置画布缩放
    set_page_scale: function(that){
        // 错误状态判断
        if(!that){
            console.error('params type error');
            return false;
        }
        let doc = that.document_info;
        let $outer = $('.edit_body .page');
        let $contain = $('.page_contain');
        let $body = $('.edit_body');
        let $bottom = $('.edit-footer');
        let $page = $contain.find('.edit_page');
        let page_top = $('.edit_head').height();
        let size = page_opt.page_size;
        let page_w = doc.width;
        let page_h = doc.height;
        let page_scale = that.page_scale.user_set;
        let page_w_scaled = page_w * page_scale;
        let page_h_scaled = page_h * page_scale;
        let window_w = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
        let window_h = window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight;
        $outer.css({
            'width': `${page_w_scaled}px`,
            'height': `${page_h_scaled}px`,
        });
        // 编辑器顶部基准计算
        $('.edit_body_wrapper').css({
            'height': `calc(100% - ${page_top}px)`
        })
        $body.css({
            "width": `calc(100% - ${size.left_panel}px - ${size.right_panel}px)`,
        });

        // 画布比例放大至超出屏幕时
        if (window_w - (size.left_panel + size.left_offset + size.right_panel) < page_w_scaled){
            $outer.css({
                'margin': `-${(page_h_scaled) / 2}px 0 0 0`,
                'top': '50%',
                'left': '0'
            });
            if (window_h - (size.top_panel + size.top_offset + size.bottom_panel) < page_h_scaled) {
                $outer.css({
                    'margin': `${size.top_offset}px 0 ${size.bottom_panel}px 0`,
                    'top': '0',
                });
            }
        }else{
            $outer.css({
                'margin': `-${(page_h_scaled ) / 2}px 0 0 -${page_w_scaled / 2}px`,
                'top': '50%',
                'left': '50%'
            });
            if (window_h - (size.top_panel + size.top_offset + size.bottom_panel) < page_h_scaled) {
                $body.css({
                    "width": `calc(100% - ${size.left_panel + size.left_offset}px - ${size.right_panel}px)`
                });
                $outer.css({
                    'margin': `${size.top_offset}px 0 ${size.bottom_panel}px -${page_w_scaled / 2 + 20}px`,
                    'top': '0',
                });
            }
        }
        $contain.css({
            'width': `${page_w_scaled}px`,
            'height': `${page_h_scaled}px`,
        });
        $page.css({
            'transform': `scale(${page_scale})`
        });

        if (window_h - (size.top_panel + size.top_offset + size.bottom_panel) < Math.floor(page_h_scaled)) {
            $outer.css('height', `${page_h_scaled}px`);
        }
        
        // 同步画布阴影
        let $page_shadow = $('.page_shadow');
        $page_shadow.css({
            'top': 0,
            'left': 0,
            'width': page_w_scaled,
            'height': page_h_scaled
        });
        // 协作者选中元素更新
        that.build_ele_masking();
    },
    // 设置文档页节点背景 data:{color: string || object, image:{url, w, h} || null}（可选）
    set_page_background: function($page, background){
        // 错误状态判断
        if (!$page || !background) {
            console.error('params type error');
            return false;
        }
        let $background = $page.find('.page_bg');
        let page_background = base_opt.fn.clone_object(background);
        let color_data = page_background.color;
        let image_data = page_background.image;
        let is_image = page_background.type.indexOf('image') >= 0;
        // 无图片类型时默认铺满
        if (is_image && !image_data.type) {
            if ($background.css('background-image') === 'none' || $background.css('background-repeat') !== 'repeat') {
                image_data.type = 'cover';
            } else if ($background.css('background-repeat') === 'repeat') {
                image_data.type = 'repeat';
            }
        };
        // 清空背景样式
        $background.css('background', '');
        // 清空渐变属性
        $background.attr('data-radialtype', '');
        // 清空图片属性
        $background.attr('data-imagetype', '');
        // 无背景色时默认白色
        if (!color_data || color_data === 'transparent' || page_background.type === 'gradient' || (image_data && image_data.src.indexOf('png') < 0)) {
            color_data = "#ffffff";
        }
        // 获取背景样式
        let background_style = base_opt.background_obj_2_style(page_background);
        // 设置背景样式
        $background[0].style.cssText += background_style;
        // 渐变设置渐变类型属性
        if (background.type === 'gradient' && background.color.type === 'radial') {
            $background.attr('data-radialtype', color_data.direction || 'center');
        }
        // 图片设置图片类型属性
        if (is_image) {
            $background.attr('data-imagetype', page_background.type);
        }
    },
    //保存光标位置
    save_cursor_position : function(that,is_save){
        //获取节点路径
        function getElementPath(element){
            return $(element).parents().andSelf().map(function() {
                let $this = $(this);
                let tagName = $this[0].tagName;
                if(typeof(tagName) === 'undefined'){
                    return;
                }
                if ($this.siblings(tagName).length > 0) {
                    tagName += ":eq(" + $this.prevAll(tagName).length + ")";
                }
                return tagName;
            }).get().join(">").toUpperCase();
        }
        try{
            if(is_save){
                that.cursor_position.prev_range = base_opt.fn.clone_object(that.cursor_position.next_range);
            }
            //默认光标
            that.cursor_position.next_range.page_info_uuid = that.page_info.uuid;
            that.cursor_position.next_range.element = null;
            that.cursor_position.next_range.startContainer = null;
            that.cursor_position.next_range.startOffset = 0;
            that.cursor_position.next_range.endContainer = null;
            that.cursor_position.next_range.endOffset = 0;
            that.cursor_position.next_range.checked_elements = [];
            //获取光标
            let $edit_page = $('.page_contain .edit_page');//编辑区域
            let $dom = $edit_page.find('.ele_item div[contenteditable="true"]:focus');//获取被选中节点
            let $ele_item = $dom.closest('.ele_item');//元素
            let _ele_item_id = $ele_item.attr('id');//元素id
            if($dom.length !== 0 && $ele_item.length !== 0 && typeof(_ele_item_id) !== 'undefined'){
                let selection = window.getSelection();
                if(selection.rangeCount > 0) {
                    let range = window.getSelection().getRangeAt(0);
                    that.cursor_position.next_range.page_info_uuid = that.page_info.uuid;
                    that.cursor_position.next_range.element = _ele_item_id;
                    that.cursor_position.next_range.startContainer = getElementPath(range.startContainer);
                    that.cursor_position.next_range.startOffset = range.startOffset;
                    that.cursor_position.next_range.endContainer = getElementPath(range.endContainer);
                    that.cursor_position.next_range.endOffset = range.endOffset;
                }
            }
            //获取选中元素
            $.each($edit_page.find('.ele_item.checked'),function(i,item){
                let id = $(item).attr('id');
                if(typeof(id) === 'undefined' || id === ''){
                    return true;
                }
                that.cursor_position.next_range.checked_elements.push(id);
            });
        }catch(e){
            console.error('保存光标失败',e);
        }
    },
    //设置光标位置
    set_cursor_position : function(that,cursor_position){
        try{
            that.ele_cancel_checked();
            if(typeof(cursor_position) === 'undefined' || cursor_position === null || cursor_position.page_info_uuid !== that.page_info.uuid){
                return;
            }
            let $edit_page = $('.page_contain .edit_page');
            //设置光标
            if(typeof(cursor_position.element) !== 'undefined' && cursor_position.element !== null){
                let $dom = $edit_page.find('#'+cursor_position.element+' div[contenteditable="true"]');
                let $ele_item = $dom.closest('.ele_item');//元素
                if($dom.length > 0 && $ele_item.length > 0){
                    let range = document.createRange();
                    range.selectNodeContents($dom[0]);
                    let start_childNodes = $(cursor_position.startContainer)[0].childNodes[0];
                    let end_childNodes = $(cursor_position.endContainer)[0].childNodes[0];
                    let startOffset = cursor_position.startOffset;
                    let endOffset = cursor_position.endOffset;
                    if(start_childNodes.length < startOffset){
                        startOffset = start_childNodes.length;
                    }
                    if(end_childNodes.length < endOffset){
                        endOffset = end_childNodes.length;
                    }
                    range.setStart(start_childNodes, startOffset);
                    range.setEnd(end_childNodes, endOffset);
                    let selection = window.getSelection();
                    selection.removeAllRanges();
                    selection.addRange(range);
                }
            }
            //设置选中元素
            if(typeof(cursor_position.checked_elements) !== 'undefined' && cursor_position.checked_elements.length > 0){
                let $ele_items = $edit_page.find('#' + cursor_position.checked_elements.join(',#'));
                $ele_items.addClass('checked');
                that.set_ele_checked($ele_items);
            }
            page_opt.save_cursor_position(that,false);
        }catch(e){
            console.log('设置光标失败', e);
        }
    },
    // 设置文档单页 attr属性
    set_page_attr: function (that, uuid, attr_key, value) {
        if (!that || !uuid || !attr_key) {
            return;
        }
        let list = that.document_page_list.find(item => item.uuid === uuid);
        if (list) {
            let attr = list.attr || {};
            // 单次修改多个值
            if (Object.prototype.toString.call(attr_key) === '[object Object]') {
                for (let key in attr_key) {
                    attr[key] = attr_key[key];
                }
            } else {
                attr[attr_key] = value;
            }
            list.attr = attr;
            list.sign = utils.uuid();
        }
    },
    // 设置全部文档页 attr属性
    set_document_attr: function (that, attr_key, value) {
        if (!that || !attr_key) {
            return;
        }
        let document_attr = that.document_info.attr || {};
        if (typeof document_attr === 'string') {
            try {
                document_attr = JSON.parse(document_attr);
            } catch (error) {
                document_attr = document_attr;
            }
        }
        let document_page_list = that.document_page_list;
        // 单次修改多个值
        if (Object.prototype.toString.call(attr_key) === '[object Object]') {
            for (let key in attr_key) {
                document_attr[key] = attr_key[key];
                // 设置空值不改变 page_list 的值
                if (!attr_key[key]) {
                    continue;
                }
                for (let i = 0, len = document_page_list.length; i < len; i++) {
                    let item = document_page_list[i];
                    let attr = item.attr || {};
                    attr[key] = attr_key[key];
                    item.attr = attr;
                    item.sign = utils.uuid();
                }
            }
        } else {
            document_attr[attr_key] = value;
            // 设置空值不改变 page_list 的值
            if (value) {
                for (let i = 0, len = document_page_list.length; i < len; i++) {
                    let item = document_page_list[i];
                    let attr = item.attr || {};
                    attr[attr_key] = value;
                    item.attr = attr;
                    item.sign = utils.uuid();
                }
            }
        }
        that.document_info.attr = document_attr;
    },
    // 文档页默认动画名称返回，默认动画需对应文档页切换
    get_default_animation_name: function (that) {
        let name = 'fade';
        if (that) {
            let default_map = {
                'pagingDown': 'topFly',
                'gooseDown': 'bottomFly',
                'pagingRight': 'leftFly',
                'gooseRight': 'rightFly',
                'null': 'appear',
            };
            if (default_map[String(that.page_info.switchType)]) {
                name = default_map[String(that.page_info.switchType)];
            }
        }
        return name;
    },
    // 全部文档页默认动画清除 & 恢复  del_rec = true(删除) false(恢复)
    document_default_animation_operate: function (that, del_rec) {
        let _this = this;
        if (!that || typeof del_rec === 'undefined') {
            return;
        }
        let list = that.document_page_list;
        for (let i = 0; i < list.length; i++) {
            let element_list = list[i].elementList;
            if (!element_list || element_list.length === 0) {
                continue;
            }
            let is_change = false;
            for (let j = 0; j < element_list.length; j++) {
                let item = element_list[j];
                if (item.animation && item.animation.default === 'true') {
                    item.animation.name = del_rec ? '' : _this.get_default_animation_name(that);
                    is_change = true;
                }
            }
            if (is_change) {
                list[i].sign = utils.uuid();
            }
        }
    },
};
export default page_opt;