<template>
    <transition name="modal-enlarge">
        <div class="material-library-contain" v-show="material_library_type" @click.self="close_modal">
            <!-- 插入面板 -->
            <material-insert ref="material_insert" v-show="material_library_type === 'insert'" @close_modal="material_library_type = null"></material-insert>
            <!-- 模板面板 -->
            <material-template ref="material_template"
                v-show="material_library_type === 'template'"
                @close_modal="material_library_type = null"
            ></material-template>
        </div>
    </transition>
</template>

<script>
    import opt_factory from '@/assets/pc/js/opt/opt_factory.js';
    import operate_opt from '@/assets/pc/js/opt/operate_opt.js';
    import page_opt from '@/assets/pc/js/opt/page_opt.js';
    import material from '@/assets/pc/js/material.js';
    import MaterialInsert from '@/views/pc/EditView/MaterialModal/MaterialInsert.vue';
    import MaterialTemplate from '@/views/pc/EditView/MaterialModal/MaterialTemplate.vue';
    export default {
        components:{
            MaterialInsert,
            MaterialTemplate,
        },
        props: [],
        provide() {
            return {
                MaterialLibrary: this,
                EditView: this.EditView
            }
        },
        inject: ['EditView'],
        data () {
            return {
                material_library_type: null,               // 打开的面板类型 insert == 插入面板  template == 模板面板
                throttle_timer: null,                      // 节流定时器
                user:{},
                material_template_init: true,       //只对模板弹框初始化一次

                /* 图片相关数据 */
                IMAGE_ID: 7,                        // 图片分类id
                images_fast_class: [],              // 图片库一级分类
                IMAGES_IMAGE_ID: -1,                // 图片二级菜单 除以下几类外的图片类，固定id = -1
                IMAGES_GIF_ID: 268,                 // 图片二级菜单 gif类 id
                IMAGES_EXPRESSION_ID: 265,          // 图片二级菜单 表情类 id
                IMAGES_ILLUSTRATION_ID: 164,        // 图片二级菜单 插图类 id
                IMAGES_SILHOUETTE_ID: 128,          // 图片二级菜单 剪影类 id
                IMAGES_VECTOR_ID: 502,              // 图片二级菜单 矢量类 id
                IMAGES_TREND_ID: 966,               // 图片二级菜单 动态元素类 id
            }
        },
        mounted() {
            let that = this;
            that.user = Object.assign(that.user, that.$common.get_login_state());
        },
        methods: {
            /** -------------- 通用方法 -----------*/
            // 显示面板
            show(type, opt){
                this.material_library_type = type;
                switch(type){
                    case 'insert':
                        if(!opt) return;
                        if(opt.type === 'audio' || opt.type === 'video'){
                            this.$refs['material_insert'].mediaChecked(opt.type, opt.media_opt);
                        }
                        break;
                    case 'template':
                        if (this.material_template_init) {
                            this.$refs['material_template'].material_template_init();
                            this.material_template_init = false;
                        }
                        break;
                }
            },
            // 关闭弹框
            close_modal () {
                let that = this;
                material.category_array = [];
                material.images_operation_state = '';
                that.material_library_type = null;
            },
            // 刷新自适应
            re_adapt: function (current_modal) {
                let that = this;
                if (!current_modal.key) return false;
                clearTimeout(that.throttle_timer);
                that.throttle_timer = setTimeout(() => {
                    let data = current_modal.data;
                    let conf = current_modal.base_conf;
                    if (!conf.el || data.length === 0) return false;
                    data = material.method.material_adapt(data, conf);
                }, 1000 / 30);
            },
            /**------- 图片相关方法 ------------*/
            // 图片上传
            images_upload: function (event, type) {
                let that = this;
                let $this = event.target;
                let files = $this.files;
                if(!files || !files.length) {
                    return that.$toast("上传图片失败，请重试！");
                }
                if (files.length > 9) {
                    return that.$toast("最多上传9张哦！",1500);
                }
                let last_file = files[files.length - 1];
                // 在替换图片、设置背景图操作下上传图片
                switch (type) {
                    case 'element_src':
                        // 图片类型校验
                        if (last_file.type.indexOf('image') < 0) {
                            that.$toast(`不支持${last_file.name}该文件上传`);
                            return;
                        }
                        // 非指定格式
                        if (!/(jpg|jpeg|png|JPG|PNG|gif|GIF|(svg\+xml))$/.test(last_file.type)) {
                            that.$toast(`不支持${last_file.name}该格式图片上传`);
                            return;
                        }
                        // 图片size校验
                        if (last_file.size / 1024 / 1024 > 100) {
                            that.$toast(`${last_file.name}上传失败，只能上传100M以下的图片哦~`);
                            return;
                        }
                        material.api.common_image_upload(that, {
                            file: last_file,
                            builddone: ($ele, template, option) => {
                                that.images_change_element_src(template);
                            },
                            error: () => {
                                // 关闭图片上传的状态
                                that.EditView.close_img_load();
                                that.$toast(`上传图片失败，请重试！`);
                            },
                        });
                        break;
                    case 'background_src':
                        // 图片类型校验
                        if (last_file.type.indexOf('image') < 0) {
                            that.$toast(`不支持${last_file.name}该文件上传`);
                            return;
                        }
                        // 非指定格式
                        if (!/(jpg|jpeg|png|JPG|PNG|gif|GIF|(svg\+xml))$/.test(last_file.type)) {
                            that.$toast(`不支持${last_file.name}该格式图片上传`);
                            return;
                        }
                        // 图片size校验
                        if (last_file.size / 1024 / 1024 > 100) {
                            that.$toast(`${last_file.name}上传失败，只能上传100M以下的图片哦~`);
                            return;
                        }
                        material.api.common_image_upload(that, {
                            file: last_file,
                            builddone: ($ele, template, option) => {
                                that.images_change_background_src(template.url);
                            },
                            error: () => {
                                // 关闭图片上传的状态
                                that.EditView.close_img_load();
                                that.$toast(`上传图片失败，请重试！`);
                            },
                        });
                        break;
                    default:
                        that.EditView.ele_cancel_checked();
                        let $page = $('.page_contain .edit_page');
                        for (let i = 0; i < files.length; i++) {
                            let file = files[i];
                            // 图片类型校验
                            if (file.type.indexOf('image') < 0) {
                                that.$toast(`不支持${file.name}该文件上传`);
                                continue;
                            }
                            // 非指定格式
                            if (!/(jpg|jpeg|png|JPG|PNG|gif|GIF|(svg\+xml))$/.test(file.type)) {
                                that.$toast(`不支持${file.name}该格式图片上传`);
                                continue;
                            }
                            // 图片size校验
                            if (file.size / 1024 / 1024 > 100) {
                                that.$toast(`${file.name}上传失败，只能上传100M以下的图片哦~`);
                                continue;
                            }
                            // 上传图片加载弹窗
                            that.EditView.show_image_load_masking();
                            ((index) => {
                                let $el;
                                material.api.common_image_upload(that, {
                                    file: file,
                                    builddone: ($ele, template, option) => {
                                        $el = $ele;
                                        // 插入节点
                                        $ele.appendTo($page);
                                        // 初始化元素大小
                                        option.fit_dom_size($ele);
                                        // 初始化元素定位
                                        option.fit_dom_offset($ele);
                                        // 初始化操作框
                                        setTimeout(() => {
                                            operate_opt.reset_rect($ele);
                                        }, 16)
                                    },
                                    addmydone: () => {
                                        // 最后一张上传完成
                                        if (i === 0) {
                                            that.EditView.show_image_loading = false;
                                            // 选中元素
                                            that.EditView.set_ele_checked($el);
                                        }
                                    },
                                    error: () => {
                                        // 关闭图片上传的状态
                                        that.EditView.close_img_load();
                                        that.$toast(`第${index + 1}张上传图片失败，请重试！`);
                                    },
                                });
                            })(i);
                        }
                        break;
                }
                $this.value = '';
                that.close_modal();
            },
            // 替换图片链接
            images_change_element_src: function (str) {
                let that = this,
                    $ele = $('.page_contain .ele_item.checked'),
                    option = opt_factory.init_opt('img');
                // 切换图片
                option.change_url($ele, str);
                // 选中元素
                that.EditView.set_ele_checked($ele);
            },
            // 背景图链接替换
            images_change_background_src: function (str) {
                let that = this;
                let url = str.indexOf('?') > 1 ? str.slice(0, str.indexOf('?')) : str;
                let $ele = $('.page_contain .ele_item.checked');
                $ele.each(function(){
                    let $ele = $(this);
                    let ele_type = $ele.attr('data-type');
                    let option = opt_factory.init_opt(ele_type);
                    option.set_background($(this),{
                        type:'image',
                        color:'transparent',
                        image:{src: url}
                    });
                })
                // 选中元素
                that.EditView.set_ele_checked($ele);
            },
            // 替换图片、背景图操作，打开图片库 point = 打开对应的分类，值为that.images_current_menu的格式
            images_operation_state_open: function (type, point) {
                material.method.images_operation_state_open(type);
                this.show('insert');
            },

            /** -------------- 模板插入或素材插入 -------------*/
            // 根据素材类型插入，svg=插入组合，page=插入文档页，默认插入单个元素
            common_material_type_append: function (opt) {
                let that = this;
                let options = {
                    type: '',
                    html: '',
                    fit_dom_size:true,//元素大小处理
                    fit_dom_offset:true//元素定位处理
                };
                options = Object.assign(options, opt);
                // 清除其他元素选中
                that.EditView.ele_cancel_checked();
                try {
                    switch (options.type) {
                        case 'svg':
                            that.common_material_svg_append(options);
                            break;
                        case 'page':
                            that.common_material_page_append(options.html);
                            break;
                        default:
                            let data_arr = JSON.parse(options.html);
                            // 单元素使用预插入调整尺寸
                            if (data_arr.length === 1) {
                                let param = data_arr[0];
                                // 图片元素 默认大号网格 3-5 个格子
                                if (param.type === 'img') {
                                    let ratio = param.image_h / param.image_w;
                                    param.width = ratio > 1 ? 168 : 280;
                                    // （GIF：2-4，表情：1-2，动态：2-3）
                                    switch (material.images_current_menu) {
                                        case that.IMAGES_GIF_ID:
                                            param.width = ratio > 1 ? 112 : 224;
                                            break;
                                        case that.IMAGES_EXPRESSION_ID:
                                            param.width = ratio > 1 ? 56 : 112;
                                            break;
                                        case that.IMAGES_TREND_ID:
                                            param.width = ratio > 1 ? 112 : 168;
                                            break;
                                    }
                                    param.height = param.width * ratio;
                                }
                                // 形状元素（图标）默认大号网格 1 个格子 
                                if (param.type === 'shape') {
                                    let ratio = Number(param.height) / Number(param.width);
                                    param.width = 56;
                                    param.height = param.width * ratio;
                                }
                            }
                            that.EditView.element_preinsert_ready(data_arr);
                            break;
                    }
                } catch (error) {
                    console.error(error);
                    that.$toast('插入素材失败！');
                }
            },
            // 模板库模板插入
            template_material_append: function (item) {
                let that = this;
                if(item.isVip && !that.user.memberVipExpire){
                    that.$modal({templateType:'memberGrade'});
                    that.close_modal();
                    return;
                }
                // 清除其他元素选中
                that.EditView.ele_cancel_checked();
                // 设计作品插入
                if (that.EditView.document_info.documentType === 'design' && item.documentId) {
                    that.design_template_append(item);
                    return;
                }
                // 普通幻灯片插入
                material.api.common_material_append(item, null, (data) => {
                    that.common_material_type_append({
                        type: data.type,
                        html: data.html,
                    });
                    that.close_modal();
                });
            },
            // 模板库全套模板页插入
            template_group_append: function (item) {
                let that = this;
                if(item.isVip && !that.user.memberVipExpire){
                    that.$modal({templateType:'memberGrade'});
                    that.close_modal();
                    return;
                }
                if(!item) return false;
                that.common_material_type_append({
                    type: 'page',
                    html: item,
                });
                that.close_modal();
            },
            // 设计作品插入
            design_template_append: function (item) {
                let that = this;
                material.api.common_template_append(item, (data) => {
                    data.documentPages.forEach((_item) => {
                        that.common_material_type_append({
                            type: 'page',
                            html: _item,
                        });
                    });
                    that.close_modal();
                });
            },
            // 图视库素材插入
            picview_material_append: function (item) {
                let that = this;
                if(item.isVip && !that.user.memberVipExpire){
                    that.$modal({templateType:'memberGrade'});
                    that.close_modal();
                    return;
                }
                material.api.common_material_append(item, null, (data) => {
                    // 插入空白页
                    page_opt.add(that.EditView, {target_page_info_uuid:that.EditView.page_info.uuid,use_theme:true});
                    that.common_material_type_append({
                        type: data.type,
                        html: data.html,
                        fit_dom_offset: false,
                    });
                    that.close_modal();
                });
            },
            // 根据素材类型svg插入
            common_material_svg_append: function (opt) {
                let that = this;
                let options = {
                    html: '',
                    fit_dom_size: true,//元素大小处理
                    fit_dom_offset: true//元素定位处理
                };
                options = Object.assign(options, opt);
                if (!options.html) {
                    return;
                }
                try {
                    let data_arr = JSON.parse(options.html);
                    let option = opt_factory.init_opt('group');
                    let group_uuid = null;
                    if (data_arr.length > 1) {
                        group_uuid = option.fn.uuid();
                    }
                    data_arr.forEach((item) => {
                        item.id = option.fn.uuid();
                        item.group = group_uuid;
                        item = that.EditView.ele_build_before_format(item);
                    });
                    let $temp_group = $('<div></div>');
                    let item_html = option.ele_list_2_dom(data_arr);
                    $temp_group.html(item_html);
                    $temp_group.children().addClass('checked');
                    let $page = option.get_canvas_page();
                    $page.append($temp_group.children());
                    let $ele = $page.find('.ele_item.checked');
                    // 选中元素
                    that.EditView.set_ele_checked($ele);
                    // 初始化元素定位
                    if(options.fit_dom_offset) option.fit_dom_offset($ele);
                } catch (error) {
                    console.error(error);
                    that.$toast('插入素材失败！');
                }
            },
            // 根据素材类型page插入
            common_material_page_append: function (html) {
                let that = this;
                try {
                    let str, obj;
                    if (typeof html === 'string') {
                        str = html.replace(/"Microsoft YaHei"/g, "'Microsoft YaHei'");
                        obj = JSON.parse(str);
                    } else {
                        obj = html;
                    }
                    if ('elementList' in obj) {
                        if (typeof obj.elementList === 'string') {
                            obj.elementList = JSON.parse(obj.elementList);
                        }
                        // 添加默认动画
                        if (obj.elementList) {
                            obj.elementList.forEach(item => {
                                item = that.EditView.ele_build_before_format(item);
                            });
                        }
                    }
                    page_opt.add(that.EditView, {target_page_info_uuid:that.EditView.page_info.uuid,add_page_infos:obj,use_theme:false});
                } catch (error) {
                    console.error(error);
                    that.$toast('插入素材失败！');
                }
            },
            // 通用站外素材插入
            common_outside_material_append: function (item, success_callback) {
                let that = this;
                // 获取图片文件流
                if (!item) return false;
                if (!item.images) return false;
                // original = 原图  large = 大图  small = 小图  tiny = 最小图
                let src = item.images.large || '';
                if (!src) return false;
                if (that.appending) return that.$toast('正在插入素材！');
                that.appending = true;
                // 正在插入图片 蒙层状态，response success 后需在回调中解除
                item.insertion = true;
                that.$axios({
                    method: 'get',
                    url: src,
                    responseType: 'blob',
                    timeout: 30000,
                }).then((res) => {
                    let res_data = res.data;
                    // res_data = blob 文件格式
                    if (res_data) {
                        if (typeof success_callback === 'function') success_callback(res_data);
                    } else {
                        // 错误处理
                        that.$toast('图片插入失败！');
                        item.insertion = false;
                    }
                    that.appending = false;
                }).catch((err) => {
                    that.appending = false;
                    item.insertion = false;
                    that.$toast('图片插入失败！');
                    console.error(err);
                });
            },
        },
    }
</script>

<style lang="less">
    @modal_header_h: 56px;
    .material-library-contain{
        position: fixed;
        left: 0;
        top: 0;
        display: flex;
        justify-content: center;
        align-items: center;
        width: 100vw;
        height: 100vh;
        z-index: 999;
    }
    // 滚动条样式
    ::-webkit-scrollbar-thumb{
        background-color: #dddddd;
    }
    ::-webkit-scrollbar-track{
        background-color: transparent;
    }

    // 组件内modal通用样式
    input[type=search]::-webkit-search-cancel-button {
        -webkit-appearance: none;
        width: 14px;
        height: 14px;
        background: transparent url('~@/assets/pc/images/common/modal_sp.png') no-repeat;
        background-position: 2px 2px;
        cursor: pointer;
    }
    .modal-material {
        position: absolute;
        top: 35px;
        right: 35px;
        bottom: 35px;
        left: 35px;
        width: auto;
        height: auto;
        background-color: #f5f7fa;
        border-radius: 4px;
        .modal-header {
            position: relative;
            width: 100%;
            height: @modal_header_h;
            padding: 0 120px;
            line-height: @modal_header_h;
            background-image: linear-gradient(90deg, #1b7cf3 0%, #7275fb 100%), linear-gradient(#1b7cf3, #1b7cf3);
            background-blend-mode: normal, normal;
            .modal-title {
                position: absolute;
                top: 0;
                left: 20px;
                font-weight: bold;
                font-size: 18px;
                color: #ffffff;
                opacity: 0.8;
            }
            .modal-close {
                position: absolute;
                top: 20px;
                right: 20px;
            }
            .edit-ico-close {
                position: absolute;
                top: 20px;
                right: 20px;
                transition: all .4s;
                &:hover {
                    transform: rotate(180deg);
                }
            }
            .modal-header_backup {
                display: inline-block;
                vertical-align: middle;
                height: 18px;
                line-height: 18px;
                font-size: 0;
                user-select: none;
                & > span {
                    display: inline-block;
                    vertical-align: middle;
                    font-size: 18px;
                    color: #4d4d4d;
                }
                & > .edit-ico-back_arrow {
                    margin-right: 10px;
                }
            }
        }
        .modal-body {
            position: relative;
            width: 100%;
            height: calc(100% - @modal_header_h);
            padding: 0;
            &::before{
                content: "";
                position: absolute;
                left: 0;
                right: 0;
                bottom: 0;
                z-index: 1;
                height: 40px;
                background-image: linear-gradient(180deg, transparent 0%, #ffffff 100%), linear-gradient(transparent, transparent);
                background-blend-mode: normal, normal;
            }
            .to_top {
                position: absolute;
                right: 10px;
                bottom: 60px;
                z-index: 99;
                width: 45px;
                height: 45px;
                box-shadow: 1px 2px 2px rgba(0,0,0,.2);
                border-radius: 50%;
                cursor: pointer;
                user-select: none;
                background-color: #989898;
                background-image: url('~@/assets/pc/images/common/gotop.png');
                background-repeat: no-repeat;
                background-position: center 6px;
                transition: all 0.3s;
                &:hover {
                    background-color: var(--mainColor);
                    background-position: center -144px;
                }
            }
        }
    }
    // 数据列表滚动容器通用样式
    .scroll_window {
        position: relative;
        overflow-x: hidden;
        overflow-y: auto;
        width: 100%;
        height: 100%;
        padding: 20px 15px 0 25px;
        .scroll_container {
            position: relative;
            width: 100%;
            min-height: calc(100% - 100px);
            margin-bottom: 10px;
            & > li {
                position: absolute;
                top: 0;
                left: 0;
                width: 0;
                height: 0;
                font-size: 0;
                border: 1px solid #f2f2f2;
                cursor: pointer;
                text-align: center;
                transform: translateZ(0);
                transition: all 0.3s;
                overflow:hidden;
                &:hover {
                    box-shadow: 0 10px 18px 0 rgba(0, 0, 0, 0.19);
                    border-color: var(--mainColor);
                    .favorite-btn,
                    .preview-btn {
                        opacity: 1;
                    }
                }
                // 固定网格式排列，不规则图片强制居中
                &[data-place="fixed"] {
                    &::after {
                        content: "";
                        display: inline-block;
                        vertical-align: middle;
                        height: 100%;
                        width: 0;
                        opacity: 0;
                    }
                    img {
                        display: inline-block;
                        vertical-align: middle;
                        max-width: 100%;
                        max-height: 100%;
                        width: auto;
                        height: auto;
                    }
                }
            }
            img {
                display: block;
                width: 100%;
                height: 100%;
                &[lazy="loading"] {
                    background-color: transparent;
                }
            }
            .svg_view {
                width: 100%;
                height: 100%;
                text-align: initial;
            }
            .favorite-btn,
            .preview-btn { 
                position: absolute;
                right: 4px;
                width: 20px;
                height: 20px;
                line-height: 20px;
                background: rgba(0, 0, 0, 0.5);
                border-radius: 5px;
                opacity: 0;
                text-align: center;
                color: #ffffff;
            }
            .favorite-btn{
                top: 4px;
            }
            .preview-btn { 
                top: 28px;
            }
        }
        .first_loading {
            position: absolute;
            top: 50%;
            left: 50%;
            z-index: 10;
            width: 50px;
            height: 50px;
            margin: -25px 0 0 -25px;
        }
        .scroll_loading {
            width: 100%;
            height: 50px;
            margin-bottom: 30px;
            img {
                display: block;
                margin: 0 auto;
                width: 50px;
                height: 50px;
            }
        }
        .no_more {
            width: 100%;
            height: 70px;
            margin-bottom: 10px;
            text-align: center;
            transform: scale(.8);
            p {
                line-height: 32px;
                font-size: 10px;
                color: #969fac;
            }
        }
        .load_error {
            position: absolute;
            top: 0;
            right: 0;
            bottom: 0;
            left: 0;
            width: 400px;
            height: 400px;
            margin: auto;
            text-align: center;
            img {
                display: block;
                margin: auto;
            }
            p {
                font-size: 16px;
                color: #6e6e6e;
            }
            .reload_btn {
                display: inline-block;
                padding: 8px 16px;
                margin-top: 20px;
                line-height: 1.4;
                color: #fff;
                font-size: 14px;
                border-radius: 4px;
                background-color: var(--mainColor);
            }
        }
        .append_layer {
            position: absolute;
            top: 0;
            right: 0;
            bottom: 0;
            left: 0;
            background-color: rgba(0, 0, 0, 0.45);
            .lds-spinner {
                position: absolute;
                top: 0;
                right: 0;
                bottom: 0;
                left: 0;
                margin: auto;
            }
        }
    }
    // 数据列表搜索空列表通用样式
    .search_empty {
        width: 100%;
        height: 100%;
        padding: 20px 0 0 20px;
        .search_empty_tips{
            height: 160px;
            padding-top: 60px;
            margin: 0 20px 30px 0;
            background-color: #ffffff;
            text-align: center;
            p:first-child{
                line-height: 24px;
                font-size: 18px;
                color: #64686b;
                span{
                    color:var(--mainColor);
                }
            }
            p:last-child{
                line-height: 18px;
                font-size: 12px;
                color: #95989b;
                span{
                    color: #ff7373;
                }
            }
        }
        .search_empty_title {
            line-height: 32px;
            font-size: 14px;
            color: #64686b;
        }
        .scroll_window {
            padding: 0;
        }
    }
    // 按钮组通用样式
    .filter_group {
        position: relative;
        display: inline-block;
        vertical-align: middle;
        width: 100%;
        height: 20px;
        line-height: 20px;
        text-align: left;
        user-select: none;
        .filter_content {
            display: inline-block;
            vertical-align: top;
            width: calc(100% - 65px);
            height: 20px;
            .group_title {
                display: inline-block;
                vertical-align: top;
                font-size: 12px;
                color: #ffffff;
            }
            .group_btn {
                display: inline-block;
                vertical-align: top;
                width: calc(100% - 6em);
                height: 100%;
                overflow: hidden;
                .btn {
                    display: inline-block;
                    vertical-align: top;
                    padding: 0 6px;
                    line-height: 18px;
                    margin: 0 15px 0 0;
                    border: solid 1px #ced4de;
                    border-radius: 10px;
                    color: #ffffff;
                    font-size: 12px;
                    transition: all 0.3s;
                }
            }
        }
        .split_line {
            display: inline-block;
            width: 1px;
            height: 100%;
            margin: 0 40px;
            background-color: transparent;
        }
        .change_filter {
            display: inline-block;
            vertical-align: top;
            width: 65px;
            height: 20px;
            font-size: 14px;
            color: #ffffff;
            transition: all 0.3s;
            .edit-ico-update {
                display: inline-block;
                vertical-align: sub;
                margin-right: 6px;
            }
        }
    }
    // 素材空列表
    .material_empty {
        position: relative;
        width: 100%;
        height: 100%;
        overflow: hidden;
        .empty_contain {
            position: absolute;
            top: 0;
            right: 0;
            bottom: 0;
            left: 0;
            width: 220px;
            height: 220px;
            margin: auto;
            text-align: center;
            font-size: 18px;
            color: #c3c3c3;
            img {
                display: block;
                width: 100%;
                margin-bottom: 10px;
            }
        }
    }
    // 查看大图
    .enlarge_container{ 
        position: fixed; 
        box-shadow: 0px 0px 10px 0px #dfe1e7; 
        border: 1px solid #eeeeee;
        z-index: 21; 
        background-color:#fff; 
        img{
            z-index: 22; 
            border: 10px solid #fff; 
            border-radius: 4px;
        }
        .image-loading{ 
            background-image: url('~@/assets/common/images/loading3.gif'); 
            background-repeat: no-repeat;
            background-position: center center;
            background-color:#fff; 
        }
    }
    
</style>