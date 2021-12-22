<template>
    <transition name="modal-slide">
        <div class='side_panel_contain theme_modal_contain' v-if="show_modal">
            <div class="modal_head">
                <p class="title"><i class="edit-ico edit-ico-theme_tool"></i>全局设置</p>
                <button class="close" @click="close" v-bdtongji="'编辑器-功能区-编辑功能-顶部-全局设置-关闭'"><i class="edit-ico edit-ico-close_1"></i></button>
            </div>
            <div class="set_bar page_size_contain">
                <h2 class="title">画布尺寸</h2>
                <div class="size_options">
                    <!-- 16:9 -->
                    <p v-if="theme_checked.width === 910 && theme_checked.height === 512 && theme_checked.page_size_type !== '自定义'"
                        @click="toggle_document_size"
                        :class="{show:show_page_size_list}"
                    >{{theme_checked.page_size_type}}&nbsp;&nbsp;&nbsp;&nbsp;16&nbsp;:&nbsp;9</p>
                    <!-- 4:3 -->
                    <p v-else-if="theme_checked.width === 910 && theme_checked.height === 693 && theme_checked.page_size_type !== '自定义'"
                        @click="toggle_document_size"
                        :class="{show:show_page_size_list}"
                    >{{theme_checked.page_size_type}}&nbsp;&nbsp;&nbsp;&nbsp;4&nbsp;:&nbsp;3</p>
                    <!-- 其他 -->
                    <p v-else @click="toggle_document_size" :class="{show:show_page_size_list}">{{theme_checked.page_size_type}}&nbsp;&nbsp;&nbsp;&nbsp;{{theme_checked.width}} × {{theme_checked.height}} px</p>
                    <!-- 尺寸列表 -->
                    <transition name='dropdown-fade'>
                        <div class="options_list" v-if="show_page_size_list">
                            <p v-for="item in doc_size_list" @click="choose_document_size(item)" :class="{check:theme_checked.page_size_type === item.name}" v-bdtongji="'编辑器-功能区-编辑功能-顶部-全局设置-画布尺寸'">
                                <span class="name">{{item.name}}</span>
                                <span class="value" v-if="!item.hide && !item.ratio_w">{{item.width}} × {{item.height}} px</span>
                                <span class="value" v-if="!item.hide && item.ratio_w">{{item.ratio_w}} : {{item.ratio_h}}</span>
                            </p>
                        </div>
                    </transition>
                </div>
                <!-- 自定义尺寸 -->
                <div class="custom_size" :style="{'width':show_page_size_list ? 0 : '100%'}" :class="{disabled:!$parent.show_custom_scale}" @click.stop>
                    <div class="width">
                        <input type="number"
                            :style="{'border':show_custom_size_wrong ? '1px solid #ff7575' : '1px solid #e9eaec'}"
                            @focus="custom_size_timer_clear"
                            @input="check_custom_size($event)"
                            @blur="custom_document_size"
                            :disabled="!$parent.show_custom_scale"
                            v-model="theme_checked.width"
                        >
                        <span>px</span>
                    </div>
                    <i>×</i>
                    <div class="height">
                        <input type="number"
                            :style="{'border-color':show_custom_size_wrong ? '1px solid #ff7575' : '1px solid #e9eaec'}"
                            @focus="custom_size_timer_clear"
                            @input="check_custom_size($event)"
                            @blur="custom_document_size"
                            :disabled="!$parent.show_custom_scale"
                            v-model="theme_checked.height"
                        >
                        <span>px</span>
                    </div>
                </div>
                <i class="wrong_tip" v-if="show_custom_size_wrong">尺寸取值范围为 40px*40px 至 10000px*25000px！</i>
            </div>
            <!-- 全局字体 -->
            <div class="set_bar font_family_contain">
                <h2 class="title">字体</h2>
                <div class="select" :class="{'show': show_font_family}">
                    <div class="selected" @click="toggle_font_family">{{ get_current_font }}</div>
                    <ul class="options">
                        <li class="option"
                            v-for="(item, index) in doc_font_list"
                            :key="index"
                            v-show="item.show"
                            :class="{'image': !!item.image, 'checked': item.checked}"
                            @click="set_document_font(item)"
                            v-bdtongji="'编辑器-功能区-编辑功能-顶部-全局设置-字体'"
                        >
                            <img :src="item.image" alt="字体预览图" />
                            {{item.name}}
                        </li>
                    </ul>
                </div>
            </div>
            <!-- 全局背景音乐 -->
            <div class="set_bar theme_background_music">
                <h2 class="title">全局音乐</h2>
                <div class="reset_panel" v-if="document_info.attr && document_info.attr.backgroundMusic && document_info.attr.backgroundMusic.src">
                    <div class="set_item">
                        <span>渐强</span>
                        <div class="input_float_group">
                            <a href="javascript:;" class="reduce" @click="set_bgm_fade('fadeIn', 'reduce')">-</a>
                            <input type="text" 
                                title="单位（秒）"
                                v-model="document_info.attr.backgroundMusic.fadeIn"
                                @blur="set_bgm_fade('fadeIn')"
                                @keydown.enter="$event.target.blur()" 
                                onkeypress="return (/[\d\.]/.test(String.fromCharCode(event.keyCode)))" />
                            <a href="javascript:;" class="add" @click="set_bgm_fade('fadeIn', 'add')">+</a>
                        </div>
                    </div>
                    <div class="set_item">
                        <span>渐弱</span>
                        <div class="input_float_group">
                            <a href="javascript:;" class="reduce" @click="set_bgm_fade('fadeOut', 'reduce')">-</a>
                            <input type="text" 
                                title="单位（秒）"
                                v-model="document_info.attr.backgroundMusic.fadeOut"
                                @blur="set_bgm_fade('fadeOut')"
                                @keydown.enter="$event.target.blur()" 
                                onkeypress="return (/[\d\.]/.test(String.fromCharCode(event.keyCode)))" />
                            <a href="javascript:;" class="add" @click="set_bgm_fade('fadeOut', 'add')">+</a>
                        </div>
                    </div>
                    <div class="set_item">
                        <span>自动播放</span>
                        <div class="toggle_round_btn_2" :class="{'true': document_info.attr.backgroundMusic.autoplay}" @click="set_bgm_attr('autoplay')"></div>
                    </div>
                    <div class="set_item">
                        <span>循环</span>
                        <div class="toggle_round_btn_2" :class="{'true': document_info.attr.backgroundMusic.loop}" @click="set_bgm_attr('loop')"></div>
                    </div>
                    <div class="set_item">
                        <span>播放时隐藏图标</span>
                        <div class="toggle_round_btn_2" :class="{'true': document_info.attr.backgroundMusic.hideOnShow}" @click="set_bgm_attr('hideOnShow')"></div>
                    </div>
                    <a href="javascript:;" class="reset_btn" @click="remove_document_bgm">删除背景音乐</a>
                </div>
                <a href="javascript:;" class="set_bgm" v-else @click="set_document_bgm">设置背景音乐</a>
            </div>
            <!-- 全局背景色/图 -->
            <div class="set_bar background_contain">
                <h2 class="title">全局背景</h2>
                <div class="bar_content">
                    <!-- 背景类型选择 -->
                    <div class="background_type_panel" @click="control_background_type" :class="{show:show_background_type, img:current_background_type.type.indexOf('image') >= 0}">
                        <span>{{current_background_type.name}}</span>
                        <!-- 背景类型列表 -->
                        <div class="background_list" :class="{show:current_background_type.type.indexOf('image') >= 0}" v-if="show_background_type">
                            <p v-for="(item,index) in background_type_list" :key="index" @click="open_background_setting(item.type)">{{item.name}}</p>
                        </div>
                    </div>
                    <!-- 背景色块 -->
                    <div class="page_color_btn" v-if="current_background_type.type.indexOf('image') < 0" v-bdtongji="'编辑器-功能区-编辑功能-顶部-全局设置-背景色'" @click="open_background_setting(current_background_type.type)">
                        <span v-if="current_background_type.type != 'gradient'" :style="{'background': document_info.background.color}"></span>
                        <span v-else :style="{'background': $parent.document_gradientStr}"></span>
                    </div>
                    <!-- 背景图 -->
                    <div class="picture_module" v-if="current_background_type.type.indexOf('image') >= 0 && document_info.background.image">
                        <img class="bg_image" :src="document_info.background.image.src"/>
                        <i class="edit-ico edit-ico-delete_4" @click="delete_document_backgroundImage()"></i>
                        <div class="picture_masking">
                            <button class="modify_btn" @click="open_background_setting(document_info.background.type)">修改</button>
                        </div>
                        <div class="image_background_type">
                            <span class="title">填充方式：</span>
                            <span class="cover" @click="change_background_size('cover')">铺满<i class="edit-ico edit-ico-check_blue" v-if="document_info.background.image.type === 'cover'"></i></span>
                            <span class="repeat" @click="change_background_size('repeat')">平铺<i class="edit-ico edit-ico-check_blue" v-if="document_info.background.image.type === 'repeat'"></i></span>
                        </div>
                    </div>
                </div>
            </div>
            <!-- 主题色 -->
            <div class="set_bar page_theme_contain">
                <h2 class="title">主题</h2>
                <div class="bar_content">
                    <div class="doc_color_list"
                            v-for="(item, index) in doc_theme_list"
                            :key="index"
                            :class="{checked:item.checked}"
                            @click="set_document_theme(item)"
                            :style="{background:item.background.color}"
                            v-bdtongji="'编辑器-功能区-编辑功能-顶部-全局设置-主题'">
                            <div class="background_color">
                                <span class="font_color" :style="{color:item.font}">Aa</span>
                                <span class="shape_color" :style="{background:item.shape, color:item.shape_text}"></span>
                            </div>
                    </div>
                </div>
            </div>
        </div>
    </transition>
</template>

<script>
    import page_opt from '@/assets/pc/js/opt/page_opt.js';

    export default{
        props:[
            'document_info',
            'document_page_list',
            'doc_theme_list',
            'doc_font_list',
            'doc_size_list',
            'theme_checked',
        ],
        data(){
            return {
                show_modal: false,

                // 字体列表
                show_font_family: false,

                /* 尺寸相关 */
                // 展示画布尺寸下拉框
                show_page_size_list: false,
                custom_size_settimer: null,
                // 展示自定义设置错误标识
                show_custom_size_wrong: false,

                /* 背景相关 */
                show_background_type: false,                    // 展示填充选择下拉列表
                current_background_type: {type:'',name:''},     // 展示当前全局背景填充类型
                background_type_list: [                         // 填充类型列表
                    {type:"color",name:"纯色填充"},
                    {type:"gradient",name:"渐变填充"},
                    {type:"image",name:"图片填充"},
                    {type:"imageDynamic",name:"纹理填充"},
                    {type:"imageTexture",name:"动态填充"},
                ],                          
            }
        },
        computed: {
            get_current_font () {
                return this.doc_font_list.find(item => item.checked).name;
            },
        },
        watch:{
            document_info:{
                handler(value) {
                    this.update_background_type();
                },
                deep:true
            },
        },
        methods:{
            /*文档设置方法 start*/
            open: function(){
                this.show_modal = true;
            },
            // 关闭主题弹框
            close: function () {
                this.show_modal = false;
                this.$parent.theme_checked = {};
            },
            // 展示设置填充类型
            control_background_type:function(){
                this.show_background_type = !this.show_background_type;
            },
            // 显示||隐藏文档尺寸
            toggle_document_size: function(){
                this.show_page_size_list = !this.show_page_size_list;
            },
            // 选择文档尺寸
            choose_document_size: function(data){
                // 错误状态判断
                if(!data){
                    console.error('params type error');
                    return false;
                }
                let that = this,
                    size_list = that.$parent.doc_size_list,
                    chose = size_list.filter(item => item.name === data.name)[0];
                // 关闭下拉框
                that.show_page_size_list = false;
                // 重置自定义错误标识
                that.show_custom_size_wrong = false;
                // 初始化尺寸列表
                size_list.forEach(function(item){item.checked = false});
                // 更新选中项状态
                chose.checked = true;
                // 选择自定义选项
                if(!chose.width || !chose.height){
                    // 显示自定义尺寸
                    that.$parent.show_custom_scale = true;
                    // 更新文档尺寸名
                    that.$parent.theme_checked.page_size_type = '自定义';
                    // 更新文档宽度
                    that.$parent.theme_checked.width = that.$parent.document_info.width;
                    // 更新文档高度
                    that.$parent.theme_checked.height = that.$parent.document_info.height;
                    // 聚焦输入框
                    that.$nextTick(function () {$('.custom_size input').eq(0).focus();});
                }
                // 选择其他选项
                else{
                    // 判断是否修改尺寸
                    let had_change = that.$parent.document_info.width !== chose.width || that.$parent.document_info.height !== chose.height;
                    that.$parent.show_custom_scale = false;
                    if(had_change) that.set_document_size({w: chose.width, h: chose.height});
                }
            },
            // 检查自定义比例值
            check_custom_size: function(e){
                let that = this,
                    value = Number(e.target.value),
                    _max;
                switch (true) {
                    case e.target.className === 'width':
                        _max = 10000;
                        break;
                    case e.target.className === 'height':
                        _max = 25000;
                        break;
                }
                if(isNaN(value) || value < 0) return that.show_custom_size_wrong = true;
                if(value < 40) return that.show_custom_size_wrong = true;
                if(value > _max) return that.show_custom_size_wrong = true;
                that.show_custom_size_wrong = false;
            },
            // 自定义文档尺寸
            custom_document_size: function(){
                let that = this,
                    w = that.$parent.theme_checked.width,
                    h = that.$parent.theme_checked.height;
                // 错误状态判断
                if(!w || !h) return;
                if(that.show_custom_size_wrong){
                    that.$parent.theme_checked.width = that.document_info.width;
                    that.$parent.theme_checked.height = that.document_info.height;
                    that.show_custom_size_wrong = false;
                    return;
                }
                that.custom_size_settimer = setTimeout(() => {
                    // 设置文档尺寸
                    that.set_document_size({w: w, h: h});
                }, 100);
            },
            custom_size_timer_clear: function () {
                clearTimeout(this.custom_size_settimer);
            },
            // 设置文档尺寸 data:{w,h}
            set_document_size: function(data){
                // 错误状态判断
                if(!data || !data.w || !data.h){
                    console.error('params type error');
                    return false;
                }
                let that = this,
                    parent = that.$parent,
                    doc = parent.document_info;
                // 尺寸变化过大提示
                if (Math.abs(data.w / data.h - doc.width / doc.height) > 0.5) {
                    let confirm = window.confirm('画布尺寸比例改动较大，请注意页面元素是否能正常在画布显示');
                    if (!confirm) return;
                }
                // 更新主题选中信息
                parent.theme_checked.width = data.w;
                parent.theme_checked.height = data.h;
                // 更新文档信息和页面数据
                page_opt.set_document_size(doc, data.w, data.h);
                // 重置页面缩放
                parent.compute_suitable_scale();
                parent.$refs.sort_page_modal && parent.$refs.sort_page_modal.initial_list_data();
                parent.init_canvas_grid();
            },
            // 开关显示字体下拉
            toggle_font_family: function () {
                let that = this
                that.show_font_family = !that.show_font_family;
                // 更新选中项显示在最前
                if (that.show_font_family) {
                    let $scroll = document.querySelector('.font_family_contain .options');
                    let top = $scroll.querySelector('.checked').offsetTop - 10;
                    $scroll.scrollTop = top;
                }
            },
            // 设置文档主题字体
            set_document_font: function(data){
                // 错误状态判断
                if(!data && typeof data !== 'object'){
                    console.error('params type error');
                    return false;
                }
                let that = this;
                // 重置列表
                that.doc_font_list.forEach(function(item){
                    item.checked = false;
                });
                // 更新列表选中项
                data.checked = true;
                // 更新文档主题数据
                that.$parent.theme_checked.font = data.data;
                // 设置文档主题
                page_opt.set_document_font(that.$parent, data.data, true);
                that.show_font_family = false;
            },
            // 设置文档主题色
            set_document_theme: function(data){
                let that = this,
                    parent = that.$parent,
                    theme_list = parent.doc_theme_list,
                    chose = theme_list.filter(item => item.name === data.name)[0],
                    $page = $('.page_contain .edit_page');
                // 重置列表
                theme_list.forEach(function(item){
                    item.checked = false;
                });
                // 更新列表选中项
                chose.checked = true;
                // 更新文档主题数据
                parent.theme_checked.textColor = chose.font;
                parent.theme_checked.shapeColor = chose.shape;
                parent.theme_checked.background = chose.background;
                // 设置文档主题
                page_opt.set_document_theme(parent, parent.theme_checked, true);
            },
            // 设置文档背景
            delete_document_backgroundImage: function(){
                let bg_opt = {
                    type: 'color',
                    color: '#ffffff',
                    image: null
                }
                page_opt.set_document_background(this.$parent, bg_opt, true);
                // 设置初始值
                this.current_background_type = this.background_type_list[0];
            },
            // 更换文档页背景图类型
            change_background_size: function(type){
                let that = this,
                    bg_opt = that.document_info.background;
                bg_opt.image.type = type;
                page_opt.set_document_background(this.$parent, bg_opt, true);
            },
            // 打开背景设置弹框
            open_background_setting: function(type){
                this.$parent.$refs.background_setting.open('document', this.document_info.background, type);
            },
            // 更新当前背景类型
            update_background_type: function(){
                let that = this;
                that.current_background_type = that.background_type_list.find(item => item.type === that.document_info.background.type);
            },
            /*文档设置方法 end*/
            /* 设置全局背景音乐 */
            set_document_bgm: function() {
                this.close();
                this.$parent.open_media_panel('audio', { setBGM: true });
            },
            // 设置背景音乐属性
            set_bgm_attr: function (key) {
                let value = !this.document_info.attr.backgroundMusic[key];
                page_opt.set_document_backgroundMusic(this.$parent, key, value);
            },
            // 设置背景音乐渐强渐弱
            set_bgm_fade: function (key, step) {
                let value = this.document_info.attr.backgroundMusic[key];
                // 格式校验
                if (isNaN(value)) {
                    value = '00.00';
                } else {
                    value = Number(value).toFixed(2);
                }
                // 递减
                if (step === 'reduce') {
                    value = (Number(value) - 0.25).toFixed(2);
                } else 
                // 递增
                if (step === 'add') {
                    value = (Number(value) + 0.25).toFixed(2);
                }
                // 范围控制
                if (Number(value) <= 0) {
                    value = '00.00';
                }
                if (Number(value) > 300) {
                    value = '300.00';
                }
                page_opt.set_document_backgroundMusic(this.$parent, key, value);
            },
            // 删除背景音乐
            remove_document_bgm: function() {
                page_opt.set_document_backgroundMusic(this.$parent, null);
            },
            /* 设置全局背景音乐 end */
        }
    }
</script>

<style lang="less" scoped>


    .toggle_round_btn_2 {
        position: relative;
        display: inline-block;
        width: 36px;
        height: 14px;
        background-color: #ccd6e3;
        border-radius: 7px;
        cursor: pointer;
        transition: all 0.3s;
        &::before {
            content: "";
            position: absolute;
            top: -1px;
            left: -1px;
            right: auto;
            width: 14px;
            height: 14px;
            background-image: linear-gradient(1deg, #f6f7f8 0%, #fcfcfd 50%, #ffffff 100%), linear-gradient(#f0f0f0, #f0f0f0);
            background-blend-mode: normal, normal;
            box-shadow: 4px 0px 4px 0px rgba(40, 40, 40, 0.09);
            border: solid 1px #e9eaec;
            border-radius: 50%;
            transition: all 0.3s;
        }
        &.true {
            background-color: var(--mainColor);
            &::before {
                left: auto;
                right: -1px;
            }
        }
    }
    // 主题设置弹框
    .theme_modal_contain{
        position: absolute;
        overflow-y: auto;
        .modal_head{
            border-bottom:1px solid #e0e1e4;
            .title{
                height:35px;
                line-height:30px;
                color:#3c4252;
                font-size:12px;
                font-weight:bold;
                i{
                    margin:0 10px 1px 0;
                }
            }
            .close{
                position:absolute;
                right: 12px;
                width: 30px;
                height: 30px;
                top: 14px;
                text-align: center;
                transform: scale(0.8);
                transition:all .3s;
                &:hover{
                    transform:rotate(180deg) scale(0.8);
                }
            }
        }
        h2{
            margin-top:32px;
            color:#3c4252;
            font-size:12px;
            font-weight:bold;
        }
        .page_size_contain{
            h2{
                margin-top:18px;
            }
            .size_options{
                position:relative;
                margin:10px 0 10px;
                &>p{
                    position:relative;
                    display:block;
                    width:100%;
                    height:28px;
                    line-height:26px;
                    padding-left:10px;
                    font-size:12px;
                    color:#707b8e;
                    background:#ffffff;
                    border:1px solid #e9eaec;
                    border-radius:4px;
                    text-align:left;
                    cursor: pointer;
                    &:after{
                        content:"";
                        position:absolute;
                        right:10px;
                        top:32%;
                        width: 5px;
                        height: 5px;
                        border-top: 2px solid #6c7480;
                        border-right: 2px solid #6c7480;
                        transform:rotate(135deg);
                        transition: transform 0.3s;
                    }
                    &.show:after{
                        top:50%;
                        transform:rotate(315deg);
                    }
                }
                .options_list{
                    position:absolute;
                    top:28px;
                    left:0;
                    width:100%;
                    height:auto;
                    padding:12px 1px;
                    color:#707b8e;
                    font-size:12px;
                    text-align:left;
                    background-color:#ffffff;
                    box-shadow:0 9px 10px 0 rgba(0, 0, 0, 0.08);
                    border:solid 1px #e9eaec;
                    border-top:0;
                    z-index:22;
                    p{
                        position:relative;
                        display:block;
                        width:100%;
                        height:30px;
                        line-height:30px;
                        padding:0 12px;
                        font-size:12px;
                        color:#676a74;
                        text-align:left;
                        cursor: pointer;
                        span.name{
                            color:#525151;
                        }
                        span.value{
                            position:absolute;
                            right:38px;
                            font-size:13px;
                            color:#919191;
                        }
                        &:hover,&.check{
                            background: #f7f7f7;
                            span{
                                color:var(--mainColor);
                            }
                        }
                        &.check:after{
                            content: "";
                            position: absolute;
                            right: 8px;
                            top: 11px;
                            width: 8px;
                            height: 4px;
                            border: 2px solid var(--mainColor);
                            border-top: none;
                            border-right: none;
                            transform: rotate(-54deg);
                        }
                    }
                }
            }
            .custom_size{
                width:100%;
                height:28px;
                overflow: hidden;
                &.disabled input, &.disabled span{
                    opacity: 0.6;
                    cursor: not-allowed;
                }
                &>div{
                    position:relative;
                    display:inline-block;
                    vertical-align:top;
                    width:calc(50% - 8.68px);
                    height:28px;
                    line-height:26px;
                }
                input{
                    display:block;
                    width:100%;
                    height:28px;
                    line-height:26px;
                    padding:0 10px;
                    border-radius:4px;
                    font-size:12px;
                    color:#707b8e;
                    border:1px solid #e9eaec;
                    background:#fcfcfc;
                    text-align:left;
                }
                span{
                    position:absolute;
                    right:10px;
                    top:-1px;
                    color:#707b8e;
                    font-size:12px;
                }
                input::-webkit-outer-spin-button,
                input::-webkit-inner-spin-button {
                    -webkit-appearance: none;
                }
                input[type="number"]{
                    -moz-appearance: textfield;
                }
                i{
                    display:inline-block;
                    vertical-align:middle;
                    margin:-3px 1px 0;
                    color:#aeb3c3;
                    font-size:20px;
                }
            }
            .wrong_tip{
                display:block;
                margin:5px 0 0;
                width:100%;
                color:#ff7575;
                font-size:12px;
            }
        }
        .font_family_contain{
            .select {
                position: relative;
                margin-top: 10px;
                width: 100%;
                height: 40px;
                background-color: #ffffff;
                border-radius: 4px;
                border: solid 1px #e9eaec;
                overflow: hidden;
                &.show {
                    overflow: visible;
                    .options {
                        opacity: 1;
                    }
                    .selected::after {
                        top: 14px;
                        transform: rotate(180deg);
                    }
                }
                .selected {
                    position: relative;
                    width: 100%;
                    height: 38px;
                    line-height: 28px;
                    padding: 5px 10px;
                    cursor: pointer;
                    &::after{
                        content: "";
                        position: absolute;
                        right: 15px;
                        top: 18px;
                        width: 0;
                        height: 0;
                        border-width: 4px;
                        border-style: solid;
                        border-color: #9aa2ae transparent transparent transparent;
                        transition: all 0.3s;
                    }
                }
                .options {
                    position: absolute;
                    top: 40px;
                    left: -1px;
                    right: -1px;
                    max-height: 500px;
                    padding: 5px 0;
                    z-index: 2;
                    border: solid 1px #e9eaec;
                    border-top: none;
                    background-color: #ffffff;
                    box-shadow: 0 9px 10px 0 rgba(0, 0, 0, 0.08);
                    overflow-y: auto;
                    opacity: 0;
                    transition: opacity 0.2s;
                    .option {
                        position: relative;
                        width: 100%;
                        height: 34px;
                        line-height: 34px;
                        text-indent: 1em;
                        cursor: pointer;
                        background-color: #ffffff;
                        &.checked {
                            pointer-events: none;
                            background-color: #8dbdf9;
                            &::after {
                                content: "";
                                position: absolute;
                                right: 8px;
                                top: 12px;
                                width: 12px;
                                height: 5px;
                                border: 2px solid #666;
                                border-top: none;
                                border-right: none;
                                transform: rotate(-54deg);
                            }
                        }
                        &.image {
                            font-size: 0;
                            img {
                                display: block;
                            }
                        }
                        img {
                            display: none;
                            position: absolute;
                            top: 0;
                            left: 0;
                            height: 100%;
                            background-color: inherit;
                        }
                    }
                }
            }
        }
        .page_theme_contain{
            .doc_color_list{
                display:inline-block;
                vertical-align:top;
                width:calc(100%/4 - 7px);
                height:60px;
                line-height:58px;
                margin:15px 9px 0 0;
                border:1px solid transparent;
                border-radius:4px;
                font-size: 18px;
                text-align:center;
                color:#fff;
                cursor: pointer;
                &:after{
                    content:'';
                    display:block;
                    margin-top:calc(100%/4 - 7px);
                }
                &:nth-child(4n){
                    margin-right:0;
                }
                &.checked{
                    border-color:var(--mainColor);
                }
                &:hover{
                    box-shadow: 0px 5px 5px 0px rgba(0, 0, 0, 0.05);
                }
                .background_color{
                    display:inline-block;
                    vertical-align:middle;
                    margin-bottom:6px;
                }
                .font_color{
                    display:block;
                    line-height:20px;
                }
                .shape_color{
                    display:block;
                    width:16px;
                    height:16px;
                    line-height:16px;
                    margin:6px auto 0;
                }
            }
        }
        .background_contain{
            position: relative;
            .background_type_panel{
                position:relative;
                display:inline-block;
                vertical-align:top;
                width: 190px;
                height: 25px;
                line-height: 23px;
                margin-top: 10px;
                padding-left: 13px;
                border-radius: 4px;
                border: solid 1px #e9eaec;
                background-color: #ffffff;
                cursor: pointer;
                span{
                    display:block;
                    height:100%;
                    width:100%;
                    font-size: 12px;
                }
                &:hover{
                    border-color:var(--mainColor);
                }
                &:after{
                    content:"";
                    position:absolute;
                    right: 10px;
                    top: 10px;
                    width:0;
                    height:0;
                    border-width:4px;
                    border-style:solid;
                    border-color:#9aa2ae transparent transparent transparent;
                    transition:all .3s;
                }
                &.show:after{
                    top:5px;
                    transform:rotate(180deg);
                }
                &.img{
                    width: 100%;
                }
            }
            .background_list{
                position: absolute;
                top: 24px;
                left: 0;
                z-index: 13;
                width: 100%;
                height: auto;
                padding:8px 0;
                background: white;
                box-shadow: 0px 5px 5px 0px rgba(74, 75, 77, 0.15);
                border-radius: 4px;
                border: solid 1px #e9eaec;
                p{
                    position: relative;
                    padding-left: 13px;
                    line-height: 28px;
                    width: 100%;
                    height:28px;
                    font-size:12px;
                    color:black;
                    cursor:pointer;
                    &:hover{
                        background: #f3f5f9;
                        color:var(--mainColor);
                    }
                }
            }
            .page_color_btn{
                float: right;
                width: 54px;
                height: 25px;
                line-height:25px;
                margin-top: 10px;
                padding: 2px;
                background-color:#ffffff;
                border-radius:4px;
                border:solid 1px #e9eaec;
                text-align:center;
                cursor:pointer;
                &:hover{
                    border-color:var(--mainColor);
                }
                span{
                    display:inline-block;
                    vertical-align:top;
                    width:100%;
                    height:100%;
                }
            }
            // 图片填充修改面板
            .picture_module{
                position: relative;
                width: 100%;
                height: 190px;
                background-color: #eef1f4;
                padding: 10px 10px 0 10px;
                margin-top: 10px;
                .bg_image{
                    width: 100%;
                    height: 134px;
                    background-color: #ffffff;
                }
                .picture_masking{
                    position: absolute;
                    width: 246px;
                    top: 10px;
                    left: 10px;
                    height: 134px;
                    background: rgba(0, 0, 0, 0.5);
                    z-index: 1;
                    .modify_btn{
                        position: absolute;
                        top: 0;
                        right: 0;
                        bottom: 0;
                        left: 0;
                        width: 42px;
                        height: 24px;
                        line-height: 24px;
                        margin: auto;
                        background-color: var(--mainColor);
                        border-radius: 4px;
                        color: #ffffff;
                        font-size: 12px;
                        &:hover{
                            opacity: .8;
                        }
                    }
                }
                .edit-ico-delete_4{
                    position: absolute;
                    top: 3px;
                    right: 3px;
                    z-index: 2;
                    cursor: pointer;
                }
                .image_background_type{
                    line-height: 40px;
                    font-size: 12px;
                    color: #4a4a4a;
                    .title{
                        margin-right: 62px;
                    }
                    .cover{
                        margin-right: 26px; 
                    }
                    .cover,.repeat{
                        position: relative;
                        cursor: pointer;
                        i{
                            position: absolute;
                            left: 5px;
                            top: 5px;
                            cursor: pointer;
                        }
                        &::before{
                            content: "";
                            display: inline-block;
                            vertical-align: text-top;
                            width: 16px;
                            height: 16px;
                            margin-right: 6px;
                            border: 1px solid #e8e8e8;
                            border-radius: 4px;
                            background: #fff;
                            text-align: center;
                        }
                    }
                }
            }
        }
        .theme_background_music {
            .set_bgm,
            .reset_panel {
                margin-top: 10px;
            }
            .set_bgm,
            .reset_btn {
                display: block;
                width: 100%;
                height: 40px;
                line-height: 38px;
                background-color: #ffffff;
                border-radius: 4px;
                border: solid 1px #e9eaec;
                text-align: center;
                font-size: 14px;
                color: #454c57;
            }
            .set_item {
                width: 100%;
                height: 30px;
                margin-bottom: 10px;
                span {
                    line-height: 30px;
                    color: #707b8e;
                }
            }
            .toggle_round_btn_2 {
                float: right;
                top: 8px;
            }
            .input_float_group {
                float: right;
                width: 110px;
                height: 30px;
                line-height: 28px;
                border-radius: 4px;
                border: solid 1px #e9eaec;
                font-size: 0;
                text-align: center;
                .add,
                .reduce {
                    display: inline-block;
                    vertical-align: middle;
                    width: 25px;
                    height: 28px;
                    font-size: 14px;
                    font-weight: bold;
                    color: #9aa2ae;
                }
                .reduce {
                    border-right: 1px solid #e9eaec;
                }
                .add {
                    border-left: 1px solid #e9eaec;
                }
                input {
                    display: inline-block;
                    vertical-align: middle;
                    width: 58px;
                    height: 28px;
                    font-size: 12px;
                    color: #707b8e;
                    text-align: center;
                    &:focus {
                        background-color: #ffffff;
                    }
                }
            }
            .reset_btn {
                color: #fe8989;
            }
        }
    }
</style>