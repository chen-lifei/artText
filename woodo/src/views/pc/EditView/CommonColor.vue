<template>
    <transition name="modal-fade">
        <div class="common_color" :data-type="color_selector.type" ref="common_color" v-if="show_color" @click.stop>
            <!--选择颜色面板-->
            <div class="color_menu">
                <div class="head_bar">
                    <!-- 切换颜色选择器 -->
                    <button class="color_btn color_picker_btn" title="配色库" v-if="!show_color_picker" @click="open_color_picker" v-bdtongji="`编辑器-全部格式-填充-左侧-填充-配色库`"></button>
                    <!-- 返回默认颜色 -->
                    <button class="color_btn color_back_btn" title="返回" v-if="show_color_picker" @click="back_default_color"></button>
                    <div class="bar_right">
                        <!-- 打开吸色器 -->
                        <button class="color_btn color_dye_btn" title="吸色" @click="show_get_color($event)" v-bdtongji="`编辑器-全部格式-填充-左侧-填充-吸色`"></button>
                        <!-- 设置无色（透明） -->
                        <button class="color_btn color_none_btn" title="无色" v-if="!color_selector.hide_transparent" @click="select_color('transparent')" v-bdtongji="`编辑器-全部格式-填充-左侧-填充-无色`"></button>
                    </div>
                </div>
                <template v-if="!show_color_picker">
                    <!-- 选择颜色类型 -->
                    <div class="color_type_panel" :class="{show:show_color_type}" ref="colorType">
                        <div class="color_type" @click.stop="toggle_color_type">
                            <p>{{color_type_list.filter(item => item.key === current_color_type)[0].name}}</p>
                            <!-- 我的颜色设置 -->
                            <button class="my_color_setting" v-if="current_color_type === 'mine'" @click.stop="open_mycolor"></button>
                        </div>
                        <transition name="modal-fade">
                            <ul class="color_type_list" v-if="show_color_type">
                                <li :class="{'show':current_color_type === item.key}" 
                                    v-for="item in color_type_list" 
                                    :key="item.key" 
                                    @click.stop="change_color_type(item)">
                                    {{item.name}}
                                </li>
                            </ul>
                        </transition>
                    </div>
                    <!-- 预设颜色列表 -->
                    <div class="default_color_list" v-if="['default', 'ant_design','ios_ui','brand_color'].indexOf(current_color_type) >= 0">
                        <span v-for="item in default_color_list[current_color_type].list" 
                            :style="{background:item, border:item === '#ffffff' ? '1px solid #ddf5ff' : 'none'}" 
                            @click="select_color(item)" 
                            v-bdtongji="`编辑器-全部格式-填充-左侧-填充-默认颜色`">
                        </span>
                    </div>
                    <!-- 我的颜色 -->
                    <div class="my_color_list" v-if="current_color_type === 'mine'">
                        <!-- 空状态 -->
                        <div class="no_color" v-if="!my_color_list[0]">
                            <p>你还未添加任何颜色哦~</p>
                            <button @click="open_mycolor"><i>+ </i>添加</button>
                        </div>
                        <span v-else
                            v-for="(item,index) in my_color_list"
                            :key="index"
                            :style="{background:item || 'transparent', border: !item ? '1px solid #d3dae4' : 'none'}"
                            :class="{white: item}"
                            @click="item ? select_color(item) : open_mycolor()"
                        ></span>
                    </div>
                    <!-- 最近选择颜色（最多7个） -->
                    <div class="color_history" v-if="color_history.length > 0">
                        <p>最近使用</p>
                        <ul>
                            <li v-for="item in color_history" :key="item" v-if="item !== 'transparent' && item !== ''" @click="select_color(item)" :style="{background:item,border:item === '#ffffff' ? '1px solid #ddf5ff' : 'none'}"></li>
                        </ul>
                    </div>
                </template>
                <!-- 颜色选择器 -->
                <div class="color_picker" ref="colorPicker" v-show="show_color_picker">
                    <Chrome v-if="show_color_picker" v-model="picker_colors" class="picker_main"></Chrome> 
                </div>
            </div>
        </div>
    </transition>
</template>

<script>
    import Vue from 'vue';
    import page_opt from '@/assets/pc/js/opt/page_opt.js';
    import base_opt from '@/assets/pc/js/opt/base_opt.js';
    import color_scheme from '@/assets/pc/json/ColorScheme.json'
    import { Chrome } from 'vue-color'
    Vue.use(Chrome);

    export default{
        components:{ Chrome },
        data(){
            return{
                show_color: false,
                color_selector: {},
                show_color_type: false,
                current_color_type: 'default',
                color_type_list: [
                    {name:'默认颜色',key:'default'},
                    {name:'Ant Design',key:'ant_design'},
                    {name:'Apple iOS UI',key:'ios_ui'},
                    {name:'品牌颜色',key:'brand_color'},
                    {name:'我的颜色',key:'mine'}
                ],
                default_color_list: {},
                my_color_list: [],           // 我的颜色列表
                color_history: [],           // 历史颜色列表

                // 拾色器相关
                show_color_picker: false,
                can_set_pickerColor: false,
                picker_colors: {
                    hex: '#000000'
                },
                show_picker_number: 0,       // 拾色器展示的是hex rgb 或 hsl 
            }
        },
        watch:{
            picker_colors:{
                handler(value) {
                    if (this.can_set_pickerColor) this.select_color(value.hex);
                    'event' in window && event.preventDefault();
                },
                deep: true
            },
        },
        mounted () {
            let that = this;
            that.default_color_list = color_scheme;
            // 获取历史颜色
            that.color_history = localStorage.getItem("color_history") ? localStorage.getItem("color_history").split(",") : [];
            // 鼠标未松开时，禁止颜色生效
            $(document).on('mousedown','.color_picker',() => {
                that.can_set_pickerColor = false;
                $(document).on('mousemove','.color_picker',() => {
                    that.can_set_pickerColor = false;
                })
                $(document).on('mouseup','.color_picker',() => {
                    $('.color_picker').unbind('mousemove')
                    that.can_set_pickerColor = true;
                })
            });
            // 输入框回车失焦
            $(document).on('keydown','.color_picker input',(e) => {
                if (e.keyCode === 13) {
                    this.select_color(that.picker_colors.hex);
                }
            });
            // 输入框失焦时，颜色生效
            $(that.$refs.colorPicker).on('blur','.color_picker input',() => {
                this.select_color(that.picker_colors.hex);
            });
        },
        methods:{
            show(obj){
                let that = this;
                let target = obj.$em;
                that.show_color = true;
                that.show_color_picker = false;
                that.show_color_type = false;
                that.color_selector = obj;
                that.confirm_event = obj.click;
                that.$nextTick(() => {
                    if(obj.prepend){
                        target.prepend(that.$refs.common_color);
                    }else{
                        target.append(that.$refs.common_color);
                    }
                })
            },
            close(){
                this.show_color = false;
                this.show_color_picker = false;
            },
            // 打开/关闭颜色类型选择列表
            toggle_color_type(){
                this.show_color_type = !this.show_color_type;
            },
            // 切换颜色类型
            change_color_type(item){
                let that = this;
                that.current_color_type = item.key;
                if(item.key === 'mine'){
                    that.get_my_color_list();
                }
                that.show_color_type = false;
            },
            // 获取我的颜色
            get_my_color_list(){
                let that = this;
				that.$axios.get('/api/member/mycolor/list/').then((data)=>{
                    if(data.data.code == 2){
                        that.my_color_list = data.data.data
                    }
                    that.my_color_list.length = 30;
				}).catch((err)=>{
                    that.my_color_list.length = 30;
                })
            },
            // 打开我的颜色设置面板
            open_mycolor(){
                this.$emit('show_mycolor');
                this.show_color_type = false;
            },
            // 返回初始面板
            back_default_color(){
                this.show_color_picker = false;
            },
            // 选择颜色
            select_color(data){
                let that = this;
                // 打开拾色器状态下记录颜色类型是hex rgb或者hsl
                if (that.show_color_picker) {
                    let $fields = $('.vc-chrome-fields');
                    for (let i in $fields) {
                        if($fields.eq(i).css('display') !== 'none') {
                            that.show_picker_number = i;
                            break;
                        }
                    }
                }
                that.confirm_event(data);
                that.save_color_history(data);
            },
            // 调用拾色器
            open_color_picker(){
                let that = this;
                that.show_color_picker = true;
                that.$nextTick(() => {
                    let $fields = $('.vc-chrome-fields');
                    for (let i in $fields) {
                        $fields.eq(i).hide();
                    }
                    $fields.eq(that.show_picker_number).css('display', 'flex');
                })
            },
            // 调用吸色面板
            show_get_color(e){
                this.show_color_picker = false;
                this.begin_color_picker(e);
            },
            // 开始吸色
            begin_color_picker: function (e) {
                let that = this;
                let page_scale = base_opt.page_scale;
                let $page = base_opt.get_canvas_page();
                let page_rect = base_opt.fn.get_client_rect($page);
                let page_width = $page.width() * page_scale;
                let page_height = $page.height() * page_scale;
                let picker_html = `
                    <div class="color-picker-container" id="color-picker-canvas">
                        <div class="picker-loading"></div>
                        <div class="edit_content" style="top:${page_rect.top}px; left:${page_rect.left}px;">${$page[0].outerHTML}</div>
                    </div>
                `;
                let $picker = $(picker_html);
                $('body').append($picker);
                let loadtimer = setTimeout(() => {
                    $picker.find('.picker-loading').show();
                }, 60);
                let loaddone = function () {
                    clearTimeout(loadtimer);
                    $picker.find('.picker-loading').hide();
                }
                // 生成canvas
                let getcanvas = that.$common.svg_2_base64($page[0].outerHTML, false);
                getcanvas.then(res => {
                    if (!res) {
                        return;
                    }
                    loaddone();
                    let $canvas = document.createElement('canvas');
                    let ctx = $canvas.getContext('2d');
                    $canvas = $($canvas);
                    $canvas.attr({
                        'width': page_width,
                        'height': page_height,
                    }).css({
                        'top': page_rect.top,
                        'left': page_rect.left,
                    });
                    let img = new Image();
                    img.src = res;
                    img.onload = e => {
                        ctx.drawImage(img, 0, 0, page_width, page_height);
                        $picker.append($canvas);
                        // 事件绑定
                        that.color_picker_event();
                    }
                    img.onerror = e => {
                        that.$toast('吸色器异常~');
                        that.remove_color_picker();
                    }
                }).catch(err => {
                    console.log('吸色器异常：' + err);
                    that.$toast('吸色器异常~');
                    that.remove_color_picker();
                    loaddone();
                });
            },
            // 吸色板事件
            color_picker_event: function () {
                let that = this;
                let $picker = $('#color-picker-canvas');
                let $canvas = $picker.find('canvas');
                let offset = $canvas.offset();
                let ctx = $canvas[0].getContext('2d');
                let get_canvas_color = function (x, y) {
                    let canvas_data = ctx.getImageData(x - offset.left, y - offset.top, 1, 1).data;
                    let color = canvas_data.slice(0, 3).join();
                    return base_opt.fn.color_exchange_function('rgb', `rgb(${color})`);
                }
                // 添加手势样式
                let $cursor = $(`<div class="color-picker-cursor"><i class="color-picker-main"></i></div>`);
                $picker.append($cursor);
                // 事件绑定
                $picker.click(that.remove_color_picker);
                $canvas.on('mousemove', event => {
                    event.stopPropagation();
                    let x = event.clientX;
                    let y = event.clientY;
                    $cursor.css({
                        'left': x,
                        'top': y,
                    });
                    $cursor.show();
                    // 更新预览颜色
                    $cursor.find('.color-picker-main').css('background-color', get_canvas_color(x, y));
                }).on('mouseleave', event => {
                    event.stopPropagation();
                    $cursor.hide();
                }).on('click', event => {
                    event.stopPropagation();
                    let x = event.clientX;
                    let y = event.clientY;
                    that.select_color(get_canvas_color(x, y));
                    that.remove_color_picker();
                });
            },
            // 结束吸色
            remove_color_picker: function () {
                $('#color-picker-canvas').remove();
            },
            // 添加颜色历史
            save_color_history(data) {
                let that = this,
                    array = that.color_history;
                if(data.indexOf('#') < 0) return false;
                if(array.length > 0){
                    array.forEach(function(item, index){
                        if(data === item) array.splice(index, 1);
                    });
                    array.unshift(data);
                    if (array.length > 10) array.pop();
                }else{
                    array.unshift(data);
                }
                that.color_history = array;
                localStorage.setItem("color_history", array.toString());
            },
        }
    }
</script>

<style lang="less" scoped>
    @bg_image:url(~@/assets/pc/images/edit/color_sp.png) no-repeat;
    @deep: ~'>>>';
    /* 颜色选择器 */
    .common_color{
        position:absolute;
        right:-5px;
        margin-top:5px;
        box-shadow: 0 3px 4px 0 rgba(74, 75, 77, 0.05);
        z-index:100;
    }
    .color_menu{
        width:272px;
        height:auto;
        line-height:initial;
        padding:10px 10px 12px;
        white-space: initial;
        border-radius:2px;
        background-color: #ffffff;
        border: solid 1px #e9eaec;
        text-align:left;
        cursor:default;
        // 头部
        .head_bar{
            width:100%;
            height:auto;
            margin-bottom:10px;
            button:hover{
                opacity:0.7;
            }
            .bar_right{
                float: right;
                text-align:right;
            }
        }
        // 颜色分类
        .color_type_panel{
            position:relative;
            width: 100%;
            height: auto;
            margin-bottom:16px;
            .color_type{
                position:relative;
                width:100%;
                height:30px;
                border:1px solid #b1bdca;
                border-radius:2px;
                background:#fff;
                text-align:left;
                p{
                    height:100%;
                    line-height:28px;
                    padding-left:13px;
                    font-size:12px;
                    color:#1e2226;
                    cursor:pointer;
                    transition:all .2s;
                    &:hover{
                        color:var(--mainColor);
                    }
                }
                .my_color_setting{
                    position:absolute;
                    right:27px;
                    top:0;
                    height:100%;
                    width:26px;
                    border-right:1px solid #b1bdca;
                    border-left:1px solid #b1bdca;
                    background:@bg_image -39px -34px;
                }
                &::after{
                    content:"";
                    position:absolute;
                    right:8px;
                    top:12px;
                    border-top:5px solid #8e98a2;
                    border-left:5px solid transparent;
                    border-right:5px solid transparent;
                    transition:all .3s;
                    cursor:pointer;
                }
            }
            &.show .color_type::after{
                transform:rotate(180deg);
            }
            ul{
                position:absolute;
                top:30px;
                left:0;
                height:auto;
                width:100%;
                padding:4px 13px;
                z-index:10;
                background:#fff;
                border-radius:2px;
                border:1px solid #b1bdca;
                border-top:none;
                box-shadow: 0px 10px 21px 0px rgba(74, 75, 77, 0.15);
                li{
                    width:100%;
                    height:30px;
                    line-height:30px;
                    font-size:12px;
                    color:#1e2226;
                    cursor:pointer;
                    &.current,&:hover{
                        color:var(--mainColor);
                    }
                }
            }
        } 
        // 面板按钮
        .color_btn{
            display:inline-block;
            vertical-align:middle;
            width:27px;
            height:26px;
            background:@bg_image no-repeat;
            &.color_picker_btn{
                background-position:-6px -6px;
            }
            &.color_back_btn{
                background-position:-108px -6px;
            }
            &.color_dye_btn{
                background-position:-40px -6px;
            }
            &.color_none_btn{
                margin-left: 15px;
                background-position:-74px -6px;
            }
        }
        // 默认颜色
        .default_color_list{ 
            width: 100%;
            height: 180px;
            span{
                float: left;
                width:28px;
                height:28px;
                margin:0 8px 8px 0;
                border-radius: 50%;
                cursor:pointer;
                &:hover{
                    box-shadow: 0 2px 5px 0 rgba(0, 0, 0, 0.18);
                }
                &:nth-child(7n){
                    margin-right: 0;
                }
            }
        }
        // 我的颜色
        .my_color_list{
            padding-left:8px;
            span{
                position:relative;
                display:inline-block;
                vertical-align:top;
                width:28px;
                height:28px;
                margin:0 13px 11px 0;
                border-radius: 50%;
                cursor:pointer;
                transition:all .3s;
                &:nth-child(6n){
                    margin-right:0;
                }
                &::after{
                    content:"+";
                    position:absolute;
                    left: 6px;
                    top: -3px;
                    opacity:0;
                    z-index:-1;
                    font-size: 22px;
                    font-weight: bold;
                    color: #aab5c4;
                    transition:all .3s;
                }
                &:hover{
                    box-shadow: 0px 6px 6px 0px rgba(52, 63, 80, 0.13);
                    &::after{
                        opacity:1;
                        z-index:2;
                    }
                }
                &.white::after{
                    display:none;
                }
            }
            .no_color{
                margin:26px 0 50px -8px;
                text-align:center;
                &::before{
                    content:"無";
                    display:block;
                    margin-bottom:8px;
                    font-size:60px;
                    color:#d9e2ea;
                }
                p{
                    font-size:12px;
                    color:#9ca7b1;
                }
                button{
                    position:relative;
                    width: 66px;
                    height: 30px;
                    line-height: 30px;
                    margin-top:19px;
                    padding-left:15px;
                    background-color: var(--mainColor);
                    border-radius: 4px;
                    color:#fff;
                    font-size:12px;
                    transition:all .3s;
                    i{
                        position: absolute;
                        left: 12px;
                        font-size:20px;
                        font-weight:bold;
                    }
                    &:hover{
                        opacity:0.8;
                    }
                }
            }
        }
        // 最近选择
        .color_history{
            padding-top:15px; 
            margin-top:4px;
            border-top:1px solid #e8e8e8;
            text-align:left;
            p{
                margin-bottom:10px;
                color:#1e2226;
                font-size:12px; 
            }
            ul{
                height:27px;
                overflow:hidden;
            }
            li{
                display:inline-block;
                width:22px;
                height:22px;
                margin:0 10px 5px 0;
                border-radius:2px;
                cursor:pointer;
                &:last-child{
                    margin-right:0;
                }
                &:hover{
                    box-shadow:0 2px 5px 0 rgba(0, 0, 0, 0.18);
                    border-color:#31afe6;
                }
                &.transparent{
                    background:url(~@/assets/pc/images/edit/transparent_bg.png) repeat !important;
                }
            } 
        }
        // 拾色器
        .color_picker{
            text-align:center;
            button{
                width: 60px;
                height: 28px;
                line-height: 28px;
                margin-top: 20px;
                border-radius: 4px;
                text-align:center;
                font-size:12px;
                &:hover{
                    opacity:0.8;
                }
                &.cancel{
                    margin-right:15px;
                    background:#dee4eb;
                    color:#46586b;
                }
                &.sure{
                    background:var(--mainColor);
                    color:#ffffff;
                }
            }
            @{deep} .vc-chrome{
                width:calc(100% - 28px);
                margin:14px auto 0;
                background:#fff;
                border-radius:0;
                box-shadow:none;
                font-family: inherit;
                // 色板
                .vc-chrome-saturation-wrap{
                    height:130px;
                    border-radius:4px;
                }
                // 底部
                .vc-chrome-body{
                    padding:10px 16px 0 16px;
                }
                .vc-chrome-active-color{
                    width:28px;
                    height:28px;
                    border-radius:14px;
                }
                .vc-chrome-color-wrap .vc-checkerboard{
                    width:28px;
                    height:28px;
                    border-radius:14px;
                }
                .vc-chrome-hue-wrap{
                    margin:10px 0 0;
                    .vc-hue-picker{
                        width:14px;
                        height:14px;
                        border-radius:7px;
                        transform:translate(-7px, -3px);
                    }
                }
                .vc-chrome-alpha-wrap{display:none;}
                .vc-chrome-fields-wrap{
                    width:calc(100% + 28px);
                    position:relative;
                    left:-14px;
                    padding-top:10px;
                    .vc-chrome-fields{
                        margin-left:0px;
                        .vc-chrome-field{padding-left:0px;}
                        .vc-input__input{
                            width:100%;
                            height:28px;
                            line-height:28px;
                            background-color:#ffffff;
                            border-radius:4px;
                            border:solid 1px #f0f0f0;
                            box-shadow:none;
                            color:#525151;
                            font-size:14px;
                        }
                    }
                    .vc-chrome-toggle-icon{
                        margin-right:0;
                        margin-top:2px;
                        &:hover{
                            filter:url(#filter_1b7cf3);
                        }
                    }
                    .vc-chrome-toggle-icon-highlight{
                        display:none !important;
                    }
                }
                .vc-chrome-fields:not(:first-child) .vc-chrome-field:last-child{
                    display:none !important;
                }
                
            }
        }
    }
    .common_color[data-type=text],
    .common_color[data-type=hilite]{
        margin-top:30px;
    }
</style>