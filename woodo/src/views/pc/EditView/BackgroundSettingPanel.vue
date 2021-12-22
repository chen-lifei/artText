<template>
    <div class="bg_setting_contain">
        <!-- 背景设置弹框 -->
        <transition name="modal-slide">
            <div class="modal_contain" v-if="show_modal">
                <div class="header">
                    <p class="title">画布背景</p>
                    <button class="close" @click="close">
                        <i class="edit-ico edit-ico-close_1"></i>
                    </button>
                </div>
                <div class="body" :class="{'image': current_bg_type.key.indexOf('image') >= 0}">
                    <!-- 类型切换面板 -->
                    <div class="type_panel">
                        <button v-for="item in background_type_list"
                            :key="item.key"
                            :class="{current:item === current_bg_type}"
                            @click="change_background_type(item)"
                        >{{item.name}}</button>
                    </div>
                    <!-- 类型主体 -->
                    <div class="background_main" :class="current_bg_type.key">
                        <!-- 图片类型-->
                        <template  v-if="current_bg_type.key.indexOf('image') >= 0">
                            <!-- 背景图列表 -->
                            <ul class="background_image_list" v-if="!empty">
                                <li v-for="(item, index) in background_image_list"
                                    :class="{'gif_tag': item.gif_img, 'svg_tag': item.svg_img}"
                                    :key="index" 
                                    @click="set_background(current_bg_type.key, {src: item.largeImage.indexOf('?') > -1 ? item.largeImage.slice(0, item.largeImage.indexOf('?')) : item.largeImage,type: current_fill_type})"
                                    @mouseenter="static2dynamic($event, item)"
                                    @mouseleave="dynamic2static($event, item)" >
                                    <img :src="item.image" @load="img_load_done($event)" v-lazy="item.image"/>
                                    <a class="favorite_btn edit-ico" 
                                        :title="favorite_map[item.id] ? '取消收藏' : '加入收藏'" 
                                        :class="favorite_map[item.id] ? 'edit-ico-favorite_01' : 'edit-ico-not_favorite_01'" 
                                        @click.stop="image_material_favorite(item.id)" 
                                    ></a>
                                    <a class="enlarge_btn edit-ico edit-ico-enlarge_01" 
                                        title="查看大图" 
                                        @mouseenter="images_enlarge($event, item)" 
                                        @mouseleave="images_enlarge_restore" 
                                        @click.stop
                                    ></a>
                                </li>
                            </ul>
                            <!-- 空状态 -->
                            <div class="empty" v-if="empty && !loading">
                                <img src="~@/assets/common/images/empty_1.png" alt="暂无数据"/>
                                <p>该分类下暂无图片~</p>
                            </div>
                            <!-- 加载状态 -->
                            <div class="loading" v-show="loading">
                                <img src="~@/assets/pc/images/edit/scroll_loading.gif" alt="图片加载中"/>
                            </div>
                            <!-- 没有更多了 -->
                            <p class="no_more" v-if="no_more">没有更多了哦~</p>
                        </template>
                    </div>
                </div>
                <div class="footer" v-if="current_bg_type.key.indexOf('image') >= 0">
                    <input type="file" 
                        id="upload_bg"
                        accept="image/gif, image/jpeg, image/png, image/bmp, image/webp, image/svg+xml" 
                        multiple 
                        @change="images_upload($event)" 
                    />
                    <label for="upload_bg" class="upload">✚本地上传</label>
                    <p class="tip">{{current_bg_type.key === 'imageTexture' ? '仅支持SVG格式,大小不超过20M' : '仅支持JPGE、PNG格式,大小不超过5M'}}</p>
                    <div class="set_page_image_type">
                        <span :class="{'check': current_fill_type === 'cover'}" @click="change_background_size('cover')">
                            <i class="edit-ico edit-ico-check_blue" v-if="current_fill_type === 'cover'"></i>铺满
                        </span>
                        <span :class="{'check': current_fill_type === 'repeat'}" @click="change_background_size('repeat')">
                            <i class="edit-ico edit-ico-check_blue" v-if="current_fill_type === 'repeat'"></i>平铺
                        </span>
                    </div>
                </div> 
            </div>
        </transition>
    </div>
</template>

<script>
    import Vue from 'vue';
    import page_opt from '@/assets/pc/js/opt/page_opt.js';
    import opt_factory from '@/assets/pc/js/opt/opt_factory.js';
    import material from '@/assets/pc/js/material.js';
    export default{
        inject: ['EditView'],
        props: ['page_info'],
        data(){
            return{
                show_modal: false,          // 弹框展示状态
                setting_target: 'page',     // 设置对象
                background_type_list: [     // 背景类型
                    {key: 'color',        name: '纯色'},
                    {key: 'gradient',     name: '渐变'},
                    {key: 'image',        name: '图片', id: 973},
                    {key: 'imageTexture', name: '动态', id: 971},
                    {key: 'imageDynamic', name: '纹理', id: 970},
                ],
                current_bg_type: {},        // 当前背景类型
                background_opt: {},         // 当前背景相关数据
                background_image_list: [],  // 背景图片列表 --- 包括图片、纹理、动态,
                empty: false,               // 图片空状态标识
                loading: false,             // 列表加载标识
                favorite_map: {},           // 列表收藏map
                current_fill_type: 'cover',
                no_more: false,             // 没有更多了
            }
        },
        methods:{
            // 打开弹框
            open(target, background, type){
                let that = this;
                type = type || background.type;
                that.setting_target = target;
                that.show_modal = true;
                that.background_opt = background;
                that.current_bg_type = that.background_type_list.filter(item => item.key === type)[0];
                if (type.indexOf('image') < 0){
                    that.$nextTick(() => {
                        that.open_child_modal(type);
                    })
                }else{
                    that.close_child_modal();
                    if(that.page_info.background.image){
                        that.current_fill_type = that.page_info.background.image.type;
                    }
                    that.change_background_type(that.current_bg_type)
                }
            },
            // 关闭弹框
            close(){
                this.show_modal = false;
            },
            // 更换文档页背景图类型
            change_background_size(type){
                let that = this,
                    $page = $('.page_contain .edit_page'),
                    $bg = $page.find('.page_bg'),
                    bg_opt = page_opt.fn.clone_object(that.page_info).background;
                that.current_fill_type = type;
                bg_opt.image.type = type;
                that.set_background(bg_opt.type, bg_opt.image)
            },
            // 切换背景类型
            change_background_type(item){
                let that = this;
                that.current_bg_type = item;
                // 颜色类型打开子弹框
                if (item.key.indexOf('image') < 0) {
                    that.open_child_modal(item.key);
                }else{
                    that.close_child_modal();
                    // 图片类型操作
                    that.get_background_image();
                }
            },
            // 打开颜色子弹框
            open_child_modal(type){
                let that = this, color = '';
                // 关闭所有颜色组件
                that.close_child_modal();
                switch (type) {
                    // 纯色
                    case 'color':
                        // 当前非纯色背景时，默认设置为白色
                        if (that.background_opt.type !== 'color') {
                            color = '#ffffff';
                        }
                        // 调用通用颜色面板
                        that.$parent.$refs.common_color.show({
                            value: typeof color === 'string' ? color : '#ffffff',
                            $em: $('.background_main'),
                            hide_transparent: true,
                            click: (data) => {
                                that.set_background('color',data)
                            }
                        });
                        break;
                    // 渐变
                    case 'gradient':
                        // 当前非渐变背景时，默认设置为黑白渐变
                        if (that.background_opt.type !== 'gradient') {
                            color =  {
                                type: 'linear',
                                rotate: 90,
                                code:[
                                    {color:'#ffffff', opacity: 100, offset: 0},
                                    {color:'#000000', opacity: 100, offset: 100},
                                ]
                            };
                        }
                        that.$parent.$refs.gradient_color.show({
                            value: typeof color === 'object' ? color : that.background_opt.color,
                            $em: $('.background_main'),
                            click: (data) => {
                                that.set_background('gradient',data)
                            }
                        });
                        break;
                    default:
                        break;
                }
            },
            // 关闭颜色子弹框
            close_child_modal(){
                $('.common_color').remove();
                $('.gradient_color_modal').remove();
                this.$parent.$refs.common_color.close();
                this.$parent.$refs.gradient_color.close();
            },
            // 设置背景
            set_background(type, data){
                let that = this;
                let opt = {
                    type: type,
                    color: type.indexOf('image') < 0 ? data : that.background_opt.color,
                    image: type.indexOf('image') < 0 ? null : data
                }
                if (that.setting_target === 'page'){
                    let $edit_page = $('.page_contain .edit_page');
                    page_opt.set_page_background($edit_page, opt);
                }else{
                    page_opt.set_document_background(that.$parent, opt, true);
                }
                that.background_opt = opt;
            },
            // 获取背景图片列表
            get_background_image(obj){
                let that = this;
                let $params = {
                    cid: null,
                    pageNumber: 1,
                    pageSize: 40,
                }
                that.no_more = false;
                that.loading = true;
                $params = Object.assign($params, obj)
                $params.cid = that.current_bg_type.id;
                if (+$params.pageNumber === 1) {
                    // 首次加载或切换分类时清空列表并触发加载状态
                    that.background_image_list = [];
                    that.empty = false;
                }
                that.$axios.get('/api/material/list/',{params:{
                    pageSize: $params.pageSize,
                    pageNumber: $params.pageNumber,
                    cid: $params.cid,
                }})
                .then((data) => {
                    let res_data = data.data;
                    if(res_data.code !== '2'){
                        that.$toast(res_data.content, 1500);
                        return;
                    }
                    that.loading = false;
                    // 图片转webp处理 && gif处理
                    let list = material.method.preview_towebp(res_data.data.dataList, 0);
                    that.background_image_list = that.background_image_list.concat(list);
                    that.favorite_map = Object.assign(that.favorite_map, res_data.data.favoriteMap);
                    that.empty = that.background_image_list.length === 0;
                    that.no_more = $params.pageNumber >= res_data.data.totalPages;
                    // 绑定滚动加载
                    that.image_load_more({
                        pageNumber: $params.pageNumber,
                        totalPages: res_data.data.totalPages
                    })
                })
            },
            // 滚动加载方法
            image_load_more(pagination){
                let that = this;
                utils.onReachBottom({
                    $scroll: $('.body')[0],
                    reach: 0.9,
                    // 阻止触发
                    factor: function() {
                         if ((pagination.pageNumber - 1) >= pagination.totalPages) {
                            that.$toast('没有更多啦~', 1500);
                            return true;   
                        }
                    },
                    // 触底时触发
                    onReach: function() {
                        let _pageNumber = pagination.pageNumber,  // 当前页码
                            _totalPages = pagination.totalPages;  // 总页码
                        _pageNumber++;
                        if(_pageNumber <= _totalPages){
                            that.get_background_image({
                                pageNumber: _pageNumber
                            })
                        }
                    }
                })
            },
            // 加入收藏 & 取消收藏
            image_material_favorite(id) {
                let that = this;
                let favorite_id = that.favorite_map[id];
                // 已收藏的素材，执行解除收藏
                let state = favorite_id ? 'delete' : 'save';
                that.$axios.post(`/api/member/favorite/${state}/`, {
                    'mid': id,
                }).then((res) => {
                    let res_data = res.data;
                    if (res_data.type === 'success') {
                        if (state === 'delete') {
                            that.$set(that.favorite_map, id, false);
                            that.$toast('取消收藏成功', 1000);
                        } else {
                            that.$set(that.favorite_map, id, res_data.data);
                            that.$toast('收藏成功', 1000);
                        }
                    } else {
                        // 错误处理
                        if (state === 'delete') {
                            that.$toast('取消收藏失败！');
                        } else {
                            that.$toast('加入收藏失败！');
                        }
                    }
                }).catch((err) => {
                    console.error(err);
                    that.$toast('操作失败！');
                });
            },
            // 图片上传
            images_upload (event) {
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
                if (last_file.size / 1024 / 1024 > 20 && /(svg\+xml)$/.test(last_file.type)) {
                    that.$toast(`${last_file.name}上传失败，只能上传20M以下的图片哦~`);
                    return;
                }
                if (last_file.size / 1024 / 1024 > 5 && /(jpg|jpeg|png|JPG|PNG|gif|GIF)$/.test(last_file.type)) {
                    that.$toast(`${last_file.name}上传失败，只能上传5M以下的图片哦~`);
                    return;
                }
                // 图片上传到服务器 -> 生成图片数据对象 -> 更改背景 -> 添加到我的上传
                material.api.common_image_upload(that, {
                    file: last_file,
                    builddone: ($ele, template, option) => {
                        that.set_background('image',{src: template.url,type: that.current_fill_type})
                    },
                    error: () => {
                        // 关闭图片上传的状态
                        that.$parent.close_img_load();
                        that.$toast(`上传图片失败，请重试！`);
                    },
                });
                $this.value = '';
            },
            // 图片静转动
            static2dynamic(event, item) {
                material.method.static2dynamic(event, item)
            },
            // 图片动转静
            dynamic2static(event, item) {
                material.method.dynamic2static(event, item)
            },
            // 图片放大预览
            images_enlarge(event, item){
                material.method.images_enlarge(event, item);
            },
            // 关闭放大预览
            images_enlarge_restore(){
                material.method.images_enlarge_restore()
            },
            // 图片加载完毕
            img_load_done(event){
                // 图片库png图片加载完毕后清除背景图，防止背景图溢出
                if (event.target.getAttribute('lazy') === 'loaded') {
                    $(event.target).parents('li').css('background','#ffffff');
                }
            },
        }
    }
</script>

<style lang="less" scoped>
    @bg_image:url(~@/assets/pc/images/edit/color_sp.png) no-repeat;
    @deep: ~'>>>';
    .my_color_modal {
        position: absolute;
        top: 0;
        left: 0;
        width: 0;
        height: 100%;
        z-index: 100;
    }
    
    .modal_contain{
        position:absolute;
        width: 296px;
        top: 0;
        left: 0;
        height: 100%;
        background-color: #ffffff;
        box-shadow: 3px 0px 3px 0px rgba(0, 0, 0, 0.04);
        font-size: 14px;
        z-index: 100;
        overflow: visible;
        user-select: none;
        .header {
            padding: 0 15px;
            border-bottom:1px solid #ccd5e2;
            .title {
                height: 42px;
                line-height: 50px;
                color: #1e2226;
                font-size: 12px;
                font-weight: bold;
            }
            .close {
                position: absolute;
                right: 20px;
                top: 10px;
                width: 30px;
                height: 30px;
                text-align: center;
                transform: scale(0.8);
                transition: all 0.3s;
                &:hover {
                    transform: rotate(180deg) scale(0.8);
                }
            }
        }
        .body{
            height: calc(100% - 43px);
            padding:12px 15px;
            overflow: auto;
            &::-webkit-scrollbar{
                width: 5px;
            }
            &::-webkit-scrollbar-track{
                background-color:#ffffff;
            }
            &::-webkit-scrollbar-thumb{
                background-color:#e4e4e4;
            }
            .type_panel{
                button{
                    width: 44px;
                    height: 22px;
                    line-height: 21px;
                    margin-right: 10px;
                    background-color: #ffffff;
                    border-radius: 2px;
                    border: solid 1px #c9cfd6;
                    font-size:12px;
                    color:#717b87;
                    text-align:center;
                    transition:all .2s;
                    &:last-child{
                        margin-right:0;
                    }
                    &:hover,&.current{
                        background:var(--mainColor);
                        color:#fff;
                        border-color:transparent;
                    }
                }
            }
            .background_main{
                width:100%;
                padding-top:25px;
                &.color{
                    @{deep} .common_color{
                        position:unset;
                        box-shadow:none;
                        .color_menu{
                            width:100%;
                            padding:0;
                            border:none;
                            box-shadow:none;
                        }
                        .default_color{
                            width:30px;
                            span{
                                width:30px;
                                height:30px;
                            }
                        }
                        .my_color_list span{
                            width:30px;
                            height:30px;
                        }
                        .color_history{
                            padding-top:35px; 
                            border-top:1px solid #e8e8e8;
                            border:none;
                            ul{
                                height:38px;
                            }
                            li{
                                width:30px;
                                height:30px;
                            }
                        }
                    }
                }
                &.gradient{
                    @{deep} .gradient_color_modal{
                        position:unset;
                        width: 100%;
                        border: none;
                        box-shadow: none;
                        .default_color{
                            padding:10px 0 20px 0;
                            li{
                                margin:0 10px 10px 0;
                            }
                        }
                        .gradient_opt_panel{
                            padding-top:20px;
                        }
                        .opacity_panel{
                            width: calc(100% + 20px);
                            margin-left: -10px;
                        }
                    }
                    @{deep} .common_color{
                        right: -258px;
                        margin-top: -27px;
                    }
                }
                .background_image_list{
                    height: 100%;
                    width: 100%;
                    padding: 0 5px;
                    li{
                        display: inline-block;
                        position: relative;
                        width: calc(50% - 3px);
                        height: 69px;
                        margin: 0 6px 6px 0;
                        border: 1px solid #f2f2f2;
                        cursor: pointer;
                        &:nth-child(2n){
                            margin-right: 0;
                        }
                        img{
                            width: 100%;
                            height: 100%;
                            opacity: 0;
                            &[lazy="loaded"] {
                                opacity: 1;
                            }
                        }
                        &:hover{
                            border-color: var(--mainColor);
                            .favorite_btn,.enlarge_btn{
                                opacity: 1;
                            }
                        }
                        .favorite_btn {
                            position: absolute;
                            top: 5px;
                            right: 5px;
                            z-index: 1;
                            width: 20px;
                            height: 20px;
                            border-radius: 4px;
                            overflow: hidden;
                            opacity: 0;
                            transition: opacity 0.3s;
                        }
                        .enlarge_btn {
                            position: absolute;
                            top: 29px;
                            right: 5px;
                            z-index: 1;
                            width: 20px;
                            height: 20px;
                            border-radius: 4px;
                            overflow: hidden;
                            opacity: 0;
                            transition: opacity 0.3s;
                        }
                    }
                    & > li.gif_tag::after {
                        content: "GIF";
                        position: absolute;
                        bottom: 2px;
                        left: 3px;
                        width: 28px;
                        height: 16px;
                        line-height: 15px;
                        border: 1px solid #a8b1ba;
                        border-radius: 22px;
                        font-size: 8px;
                        color: #a8b1ba;
                        text-align: center;
                    }
                    & > li.svg_tag::after {
                        content: "SVG";
                        position: absolute;
                        bottom: 2px;
                        left: 3px;
                        width: 28px;
                        height: 16px;
                        line-height: 15px;
                        border: 1px solid #a8b1ba;
                        border-radius: 22px;
                        font-size: 8px;
                        color: #a8b1ba;
                        text-align: center;
                    }
                }
                .empty{
                    position: absolute;
                    width: 80%;
                    height: 250px;
                    top: 0;
                    right: 0;
                    left: 0;
                    bottom: 0;
                    margin: auto;
                    img{
                        width: 100%;
                    }
                    p{
                        color: #222222;
                        font-size: 14px;
                        text-align: center;
                    }
                }
                .loading{
                    position: relative;
                    padding: 30px;
                    height: 100px;
                    img{
                        position: absolute;
                        top: 0;
                        right: 0;
                        bottom: 0;
                        left: 0;
                        margin: auto;
                    }
                }
                .no_more{
                    padding: 20px 0;
                    text-align: center;
                    color: #646363;
                }
            }
            &.image{
                height: calc(100% - 165px);
            }
        }
        .footer{
            position: relative;
            height: 122px;
            width: 100%;
            padding: 18px 22px;
            background-color: #ffffff;
            box-shadow: 0px -5px 5px 0px rgba(74, 75, 77, 0.14);
            input[type="file"] {
                display: none;
            }
            .upload{
                display: block;
                width: 80px;
                line-height: 26px;
                margin: 0 83px 8px;
                border-radius: 13px;
                border: solid 1px var(--mainColor);
                color: var(--mainColor);
                background-color: #ffffff;
                font-size: 12px;
                font-family: MicrosoftYaHei-Bold;
                text-align: center;
                cursor: pointer;
                &:hover{
                    background: var(--mainColor);
                    color: #ffffff;
                }
            }
            .tip{
                font-size: 12px;
                color: #84919d;
                text-align: center;
            }
            .set_page_image_type{
                margin-top: 23px;
                text-align: center;
                span{
                    position: relative;
                    font-size: 14px;
                    color: #4a4a4a;
                    cursor: pointer;
                    i{
                        position: absolute;
                        left: 6px;
                        bottom: 6px;
                        color: var(--mainColor);
                    }
                    &:first-child{
                        margin-right: 45px;
                    }
                    &:hover{
                        opacity: .8;
                    }
                    &::before{
                        content: "";
                        display: inline-block;
                        vertical-align: top;
                        width: 16px;
                        height: 16px;
                        margin-right: 9px;
                        border: solid 1px #4a4a4a;
                        border-radius: 4px;
                        background: #fff;
                        text-align: center;
                    }
                    &.check{
                        &::before{
                            border-color: var(--mainColor);
                        }
                    }
                }
            }
        }
    }

    @media screen and (max-height : 800px) {
        .gradient{
            @{deep} .gradient_color_modal{
                .default_color li{
                    margin-right: 9px !important;
                }
            }
        } 
    }
    @media screen and (max-height : 880px) {
        .gradient{
            @{deep} .common_color{
                bottom: 8px !important;
            }
        }
    }
</style>
