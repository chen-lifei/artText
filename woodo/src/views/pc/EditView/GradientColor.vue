<template>
    <transition name="modal-fade">
        <div class="gradient_color_modal" v-if="show_color" ref="gradient_modal" @click.stop>
            <!-- 颜色列表 -->
            <div class="default_color">
                <div class="color-item" :style="{'background': item}" @click.stop="change_gradient_color(default_color_list[index])" v-for="(item, index) in gradient_color_list" :key="index"></div>
                <div class="color-item seat" v-for="v in 8" :key="v"></div>
            </div>
            <div class="gradient_opt_panel">
                <!-- 渐变类型（线性&径向） -->
                <div class="opt-item-type" :class="{show: show_gradient_type}">
                    <span>样式</span>
                    <div class="pull-module">
                        <button class="gradient-type-btn" :class="{'current': show_gradient_type}" @click="toggle_gradient_type()" ref="gradient_type">
                            <span>{{gradient_opt.type === 'linear' ? '线性' : '径向'}}</span>
                        </button>
                        <transition name="modal-fade">
                            <ul v-if="show_gradient_type" class="gradient-type-list">
                                <li @click="change_gradient_type('linear')" :class="{show:gradient_opt.type === 'linear'}">线性</li>
                                <li @click="change_gradient_type('radial')" :class="{show:gradient_opt.type === 'radial'}">径向</li>
                            </ul>
                        </transition>
                    </div>
                </div>
                <!-- 线性角度 -->
                <div class="opt-item-rotate" v-if="gradient_opt.type === 'linear'">
                    <span>回转</span>
                    <base-knob v-model="gradient_opt.rotate" :max="360"></base-knob>
                    <base-unit-input
                        unit="度"
                        v-model="gradient_opt.rotate"
                        @add="change_gradient_rotate(gradient_opt.rotate + 1)"
                        @cut="change_gradient_rotate(gradient_opt.rotate - 1)"
                    ></base-unit-input>
                </div>
                <!-- 径向定位 -->
                <div class="opt-item-position" v-else>
                    <span>方向</span>
                    <div class="pull-module">
                        <button class="radial-position-btn" ref="gradient_position" :class="{'current': show_radial_position}" @click="toggle_gradient_position">
                            <span>{{radial_position_list.find(item => item.key === gradient_opt.direction).name}}</span>
                        </button>
                        <transition name="modal-fade">
                            <ul v-if="show_radial_position" class="radial-position-list">
                                <li v-for="item in radial_position_list" :key="item.key" @click="change_radidal_position(item)">{{item.name}}</li>
                            </ul>
                        </transition>
                    </div>
                </div>
                <!-- 色标拖动条 -->
                <div class="code_slider_panel">
                    <div class="code_increase">
                        <button class="add" @click="change_code_num(1)">+</button>
                        <button class="reduce" @click="change_code_num(-1)">-</button>
                    </div>
                    <div class="slider_color" :style="`background:${slider_color}`"></div>
                    <div class="color_btn"
                        v-for="(item,index) in gradient_opt.code"
                        :key="index"
                        :style="{left:`${item.offset}%`,background:item.color}"
                        :class="{check: item === current_code}"
                        @mousedown="index > 0 && index !== gradient_opt.code.length - 1 && change_code_offset($event,item,index)"
                        @click="current_code = item"
                        @dblclick="openPicker(item)"
                    ></div>
                </div>
            </div>
            <!-- 拾色器 -->
            <div class="color_picker" v-show="picker_show">
                <span>自定义颜色</span>
                <Chrome v-if="picker_show" v-model="picker_colors" class="picker_main"></Chrome>
                <div class="btn-group">
                    <button class="cancel" @click="closePicker()">取消</button>
                    <button class="confirm" @click="confirmPicker()">确定</button>
                </div>
            </div>
        </div>
    </transition>
</template>

<script>
    import Vue from 'vue';
    import baseKnob from '@/components/base/base-knob.vue';
    import baseUnitInput from '@/components/base/base-unit-input.vue';
    import base_opt from '@/assets/pc/js/opt/base_opt.js';
    import color_scheme from '@/assets/pc/json/ColorScheme.json';
    import { Chrome } from 'vue-color'
    Vue.use(Chrome);
    export default{
        components: { baseKnob, baseUnitInput, Chrome },
        data(){
            return{
                show_color: false,
                color_ready: false,
                gradient_opt:{
                    type: 'linear',
                    rotate: 0,
                    direction:'center',
                    code:[
                        {
                            color: "#ffffff",
                            opacity: 100,
                            offset: 0
                        },
                        {
                            color: "#000000",
                            opacity: 100,
                            offset: 100
                        }
                    ]
                },
                default_color_list: [],
                gradient_color_list: [],
                radial_position_list:[
                    {name: "居中",  key: "center"},
                    {name: "左上角",key: "left_top"},
                    {name: "右上角",key: "right_top"},
                    {name: "左下角",key: "left_bottom"},
                    {name: "右下角",key: "right_bottom"},
                    {name: "正下方",key: "bottom"},
                    {name: "正上方",key: "top"},
                ],
                
                show_gradient_type: false,
                show_radial_position: false,
                current_code:{},
                code_sliding: false,
                slider_color: '',
                seekbar_obj:{},

                /* 拾色器 */
                // 颜色数据
                picker_colors: {
                    hex: '#000000',
                    hex8: '#000000ff'
                },
                picker_show: false, // 拾色器显示状态
                /* 拾色器 end*/

            }
        },
        mounted () {
            let that = this;
            that.gradient_color_list = color_scheme['gradients'].list.map(item => {
                item = that.gradient_style_splice(item);
                return item;
            })
            that.default_color_list = color_scheme['gradients'].list;
            $('.gradient_color_modal').on('click', e => {
                if (e.target !== that.$refs.gradient_type) {
                    that.show_gradient_type = false;
                }
                if (e.target !== that.$refs.gradient_position) {
                    that.show_radial_position = false;
                }
                if (e.target !== that.$refs.common_color){
                    that.$parent.$refs.common_color.close();
                }
            });
        },
        watch:{
            gradient_opt:{
                handler(value) {
                    if(this.color_ready){
                        // console.log('gradient_opt=>', this.gradient_opt)
                        this.seekbar_obj.value = this.current_code.opacity;
                        // console.log('gradient_style_splice')
                        this.gradient_style_splice(this.gradient_opt);
                        // console.log('confirm_event')
                        this.confirm_event(this.gradient_opt);
                        // console.log('end')
                    }
                },
                deep:true
            },
        },
        methods:{
            show(obj){
                let that = this;
                let target = obj.$em;
                that.show_color = true;
                that.confirm_event = obj.click;
                if(obj.value && typeof obj.value === 'object'){
                    that.gradient_opt = obj.value;
                }else if(obj.value === '#ffffff'){
                    that.gradient_opt.code[1].color = '#000000';
                }else{
                    that.gradient_opt.code[1].color = obj.value;
                }
                that.current_code = that.gradient_opt.code[0];
                that.seekbar_obj = {
                    value: that.current_code.opacity,
                    callback: (data) => that.change_code_opacity(data)
                };
                that.gradient_style_splice(that.gradient_opt);
                that.$nextTick(() => {
                    that.color_ready = true;
                    target.append(that.$refs.gradient_modal);
                })
            },
            close(){
                this.color_ready = false;
                this.show_color = false;
            },
            // 关闭所有面板
            closeAllPanel(){
                this.show_gradient_type = false; // 关闭渐变类型下拉面板
                this.show_radial_position = false; // 关闭径向定位下拉面板
                this.closePicker(); // 关闭拾色器
            },
            // 切换渐变类型下拉面板显示
            toggle_gradient_type(){
                if(!this.show_gradient_type){
                    this.closeAllPanel();
                }
                this.show_gradient_type = !this.show_gradient_type
            },
            // 修改渐变类型
            change_gradient_type(type){
                this.gradient_opt.type = type;
                this.show_gradient_type = false;
                if(type === 'linear'){
                    this.gradient_opt.rotate = 90;
                }else{
                    this.gradient_opt.direction = 'center';
                }
            },
            // 修改角度
            change_gradient_rotate(data){
                data = Number(data);
                this.gradient_opt.rotate = data;
            },
            // 切换径向定位下拉面板显示
            toggle_gradient_position(){
                if(!this.show_radial_position){
                    this.closeAllPanel();
                }
                this.show_radial_position = !this.show_radial_position
            },
            // 修改径向定位
            change_radidal_position(data){
                this.gradient_opt.direction = data.key;
            },
            // 修改色标数量
            change_code_num(data){
                let that = this;
                let code_list = that.gradient_opt.code;
                let check_index = code_list.findIndex(item => item === that.current_code);
                let check_code = base_opt.fn.clone_object(that.current_code);
                let closest_code = {};
                if (that.current_code === code_list[code_list.length - 1]) {
                    if (code_list.length === 2) {
                        closest_code = base_opt.fn.clone_object(code_list[0]);
                    } else if (code_list.length > 2) {
                        closest_code = base_opt.fn.clone_object(code_list[check_index - 1]);
                    }
                }else{
                    closest_code = base_opt.fn.clone_object(code_list[check_index + 1]);
                }
                if (data > 0) {
                    if (code_list.length === 10) return that.$toast("无法添加更多色标噢~",1500);
                    let new_code = {};
                    check_code.color = that.hex_2_rgbArray(check_code.color);
                    closest_code.color = that.hex_2_rgbArray(closest_code.color);
                    let new_color = [];
                    $.each(check_code.color,(index,item) => {
                        new_color.push(Math.round((Number(item) + Number(closest_code.color[index])) / 2))
                    });
                    new_color = "rgb(" + new_color.join(",") + ")";
                    new_code = {
                        opacity: 100,
                        color: base_opt.fn.color_exchange_function('rgb', new_color),
                        offset: Math.round((Number(check_code.offset) + Number(closest_code.offset)) / 2)
                    }
                    that.current_code = new_code;
                    that.gradient_opt.code.splice(check_index + 1,0,new_code);
                }else{
                    if (code_list.length === 2) return;
                    if (check_index === 0 || check_index === code_list.length - 1) return;
                    that.gradient_opt.code.splice(check_index,1);
                    that.current_code = that.gradient_opt.code[check_index - 1];
                }
                that.gradient_opt.code = that.gradient_opt.code.sort(function(a,b){
                    return a.offset - b.offset;
                });
            },
            // hex转rgb数组 => [R, G, B]
            hex_2_rgbArray(hex){
                // hex转rgb
                let rgb = base_opt.fn.color_exchange_function('hex', hex);
                let array = rgb.split(',').map((item) => item.replace(/[^0-9]+/g,''));
                return array;
            },
            // 修改色标位置
            change_code_offset(e,item,index){
                let that = this;
                let code_list = that.gradient_opt.code;
                let $bar = $('.slider_color'),
                    bar_w = $bar[0].offsetWidth,
                    offset = bar_w * (item.offset / 100),
                    diff_x = e.pageX - offset;
                that.code_sliding = true;
                $(document).mousemove(function(e){
                    if(that.code_sliding){
                        offset = e.pageX - diff_x;
                        if (offset <= 0) {
                            offset = 0
                        }else if(offset >= bar_w){
                            offset = bar_w;
                        }
                        offset = offset / bar_w;
                        code_list[index].offset = parseInt(offset * 100);
                        that.code_list = code_list;
                    }
                });
                $(document).mouseup(function(){
                    that.code_sliding = false;
                    $(document).unbind('mousemove');
                    $(document).unbind('mouseup');
                });
            },
            // 打开拾色器
            openPicker(item){
                let {color } = item;
                if(color) {
                    this.picker_colors.hex = color;
                }
                this.closeAllPanel();
                this.picker_show = true;
            },
            // 关闭拾色器
            closePicker(){
                this.picker_show = false;
            },
            // 拾色器确定
            confirmPicker(){
                this.current_code.color = this.picker_colors.hex;
                let check_index = this.gradient_opt.code.findIndex(item => item === this.current_code);
                this.gradient_opt.code[check_index].color = this.picker_colors.hex8;
                this.closePicker();
            },
            // 拼接渐变色样式
            gradient_style_splice(opt){
                let code_list = opt.code;
                let slider_color = `linear-gradient(90deg`;
                let gradient_str = `linear-gradient(${opt.rotate}deg`;
                if (opt.rotate) opt.rotate = Number(opt.rotate);
                $.each(code_list, (index, item) => {
                    let color = base_opt.fn.color_exchange_function('rgba', item.color, '', item.opacity / 100);
                    slider_color += `, ${color} ${item.offset}%`;
                    gradient_str += `, ${color} ${item.offset}%`;
                });
                this.slider_color = slider_color + ')';
                return gradient_str + ')';
            },
            // 修改色标透明度
            change_code_opacity(value){
                let that = this;
                let check_index = that.gradient_opt.code.findIndex(item => item === that.current_code);
                that.$set(that.current_code,'opacity',value);
                that.gradient_opt.code[check_index].opacity = value;
            },
            // 更换渐变色
            change_gradient_color(color){
                let data = base_opt.fn.clone_object(color);
                this.gradient_opt = data;;
                this.gradient_style_splice(data);
                this.current_code = data.code[0];
            }
        }
    }
</script>

<style lang="less" scoped>
    .gradient_color_modal{
        position:absolute;
        top: 0;
        right: 0;
        z-index: 100;
        width: 272px;
        height: auto;
        background: #ffffff;
        border: 1px solid #eeeeee;
        border-radius: 5px;
        box-shadow: 0px 0px 8px 0px rgba(153,153,153,0.10); 
        user-select: none;
        // 颜色列表
        .default_color{
            padding: 20px;
            display: flex;
            flex-wrap: wrap;
            justify-content: space-between;
            width: calc(100% + 5px);
            transform: translateX(-5px);
            .color-item{
                margin-left: 5px;
                margin-bottom: 5px;
                width: 28px;
                height: 28px;
                border-radius: 5px;
                &.seat{
                    margin-bottom: 0;
                    height: 0;
                }
            }
        }
        // 渐变设置
        .gradient_opt_panel{
            padding:0 14px;
            position: relative;
            height: 200px;
            // 渐变类型
            .opt-item-type{
                padding-top: 12px;
                display: flex;
                justify-content: space-between;
                align-items: center;
                width: 100%;
                
                >span{
                    font-size: 12px;
                    font-weight: 400;
                    color: #444444;
                }

                .pull-module{
                    position: relative;
                    .gradient-type-btn{
                        padding: 0 10px;
                        display: flex;
                        justify-content: space-between;
                        align-items: center;
                        width: 100px;
                        height: 32px;
                        background: #ffffff;
                        border: 1px solid #dddddd;
                        border-radius: 5px;
                        cursor: pointer;
                        >span{
                            font-size: 12px;
                            font-weight: 400;
                            color: #111111;
                        }
                        &::after{
                            content:"";
                            width: 0;
                            height: 0;
                            margin-top: 2px;
                            border-width: 4px;
                            border-style: solid;
                            border-color: #999999 transparent transparent transparent;
                        }
                        &.current{
                            &::after{
                                margin-top: -2px;
                                border-color: transparent transparent #999999 transparent;
                            }
                        }
                    }
                    .gradient-type-list{
                        position: absolute;
                        top: 100%;
                        left: 0;
                        z-index: 5;
                        width: 100%;
                        max-height: 150px;
                        background: #ffffff;
                        border: 1px solid #eeeeee;
                        border-radius: 5px;
                        box-shadow: 0px 0px 8px 0px rgba(153,153,153,0.10); 
                        user-select: none;
                        overflow: auto;
                        li{
                            display: flex;
                            justify-content: center;
                            align-items: center;
                            width: 100%;
                            height: 32px;
                            &:hover{
                                color: var(--mainColor);
                                background: #f4f4f4;
                            }
                        }
                    }
                }
            }
            // 线性角度
            .opt-item-rotate{
                margin-top: 10px;
                display: flex;
                justify-content: space-between;
                align-items: center;
                width: 100%;
                >span{
                    font-size: 12px;
                    font-weight: 400;
                    color: #444444;
                }

            }
            // 径向定位
            .opt-item-position{
                padding-top: 12px;
                display: flex;
                justify-content: space-between;
                align-items: center;
                width: 100%;
                
                >span{
                    font-size: 12px;
                    font-weight: 400;
                    color: #444444;
                }

                .pull-module{
                    position: relative;
                    .radial-position-btn{
                        padding: 0 10px;
                        display: flex;
                        justify-content: space-between;
                        align-items: center;
                        width: 100px;
                        height: 32px;
                        background: #ffffff;
                        border: 1px solid #dddddd;
                        border-radius: 5px;
                        cursor: pointer;
                        >span{
                            font-size: 12px;
                            font-weight: 400;
                            color: #111111;
                        }
                        &::after{
                            content:"";
                            width: 0;
                            height: 0;
                            margin-top: 2px;
                            border-width: 4px;
                            border-style: solid;
                            border-color: #999999 transparent transparent transparent;
                        }
                        &.current{
                            &::after{
                                margin-top: -2px;
                                border-color: transparent transparent #999999 transparent;
                            }
                        }
                    }
                    .radial-position-list{
                        position: absolute;
                        top: 100%;
                        left: 0;
                        z-index: 5;
                        width: 100%;
                        max-height: 150px;
                        background: #ffffff;
                        border: 1px solid #eeeeee;
                        border-radius: 5px;
                        box-shadow: 0px 0px 8px 0px rgba(153,153,153,0.10); 
                        user-select: none;
                        overflow: auto;
                        li{
                            display: flex;
                            justify-content: center;
                            align-items: center;
                            width: 100%;
                            height: 32px;
                            cursor: pointer;
                            &:hover{
                                color: var(--mainColor);
                                background: #f4f4f4;
                            }
                        }
                    }
                }

            }
            // 色标拖动条
            .code_slider_panel{
                position:relative;
                display:inline-block;
                width:100%;
                margin-top:25px;
                .code_increase{
                    width:100%;
                    button{
                        width: 18px;
                        height: 18px;
                        line-height: 16px;
                        background-color: #ffffff;
                        border-radius: 4px;
                        border: solid 1px #dae2ea;
                        text-align:center;
                        font-size:18px;
                        font-weight:bold;
                        color:#8a9aab;
                        &:hover{
                            color:var(--mainColor);
                        }
                    }
                    .reduce{
                        float:right;
                    }
                }
                .slider_color{
                    width:100%;
                    height:16px;
                    margin-top:7px;
                    background:#000;
                }
                .color_btn{
                    position:absolute;
                    top:50px;
                    width:14px;
                    height:14px;
                    margin-left:-7px;
                    border:2px solid #bfbebe;
                    background:#000;
                    cursor:pointer;
                    &::before{
                        content:"";
                        position:absolute;
                        top:-16px;
                        left:-2px;
                        border-width:7px;
                        border-style:solid;
                        border-color:transparent transparent #bfbebe transparent;
                    }
                    &.check{
                        border-color:var(--mainColor);
                        &::before{
                            border-color:transparent transparent var(--mainColor) transparent;
                        }
                    }
                }
            }
            .opacity_panel{
                display:flex;
                justify-content:space-between;
                width: 100%;
                margin-top: 60px;
                span{
                    font-size: 12px;
                    color: #1e2226;
                }
                &.show{
                    position: absolute;
                    margin-top: 15px;
                }
            }
        }
        // 拾色器面板
        .color_picker {
            padding: 20px;
            position: absolute;
            top: 10px;
            left: 20px;
            background: #ffffff;
            border: 1px solid #eeeeee;
            border-radius: 5px;
            box-shadow: 0px 0px 8px 0px rgba(153, 153, 153, 0.1);
            span {
                font-size: 12px;
                font-weight: 400;
                text-align: left;
                color: #333333;
            }

            // 拾色器
            /deep/.vc-chrome {
                margin-top: 10px;
                font-family: inherit;
                background: none;
                border-radius: 0;
                box-shadow: none;
                // 色板
                .vc-chrome-saturation-wrap {
                    border-radius: 5px;
                }
                .vc-chrome-body {
                    padding: 10px 0;
                    // 颜色工具
                    .vc-chrome-controls {
                        // 当前颜色显示
                        // .vc-chrome-color-wrap{}

                        // 滑动条模块
                        .vc-chrome-sliders {
                            // 色相
                            .vc-chrome-hue-wrap {
                                height: 14px;
                                // 滑动块
                                .vc-hue-picker {
                                    width: 8px;
                                    height: 16px;
                                    border: 1px solid #000000;
                                    border-radius: 2px;
                                }
                            }
                            // 透明度
                            .vc-chrome-alpha-wrap {
                                height: 14px;
                                // 滑动块
                                .vc-alpha-picker {
                                    width: 8px;
                                    height: 16px;
                                    border: 1px solid #000000;
                                    border-radius: 2px;
                                }
                            }
                        }
                    }

                    // 色值模块
                    .vc-chrome-fields-wrap {
                        align-items: center;
                        // 色值模块
                        .vc-chrome-fields {
                            // 输入框
                            .vc-editable-input {
                                .vc-input__input {
                                    height: 32px;
                                    font-size: 12px;
                                    font-weight: 400;
                                    color: #999999;
                                    border: 1px solid #dddddd;
                                    border-radius: 5px;
                                    &:focus {
                                        color: #333333;
                                    }
                                }
                            }
                            // 输入框下面的文字
                            .vc-input__label {
                                display: none;
                            }
                        }

                        // 切换色值模式按钮
                        .vc-chrome-toggle-btn {
                            .vc-chrome-toggle-icon {
                                margin-top: 0;
                            }
                            .vc-chrome-toggle-icon-highlight {
                                top: 0;
                                left: 12px;
                            }
                        }
                    }
                }
            }

            // 按钮
            .btn-group{
                display: flex;
                justify-content: center;
                align-items: center;
                width: 100%;
                button{
                    margin: 0 5px;
                    width: 56px;
                    height: 28px;
                    font-size: 12px;
                    font-weight: 400;
                    border-radius: 5px;
                    &.cancel{
                        color: #999999;
                        background: #ffffff;
                        border: 1px solid #dddddd;
                    }
                    &.confirm{
                        color: #ffffff;
                        background: var(--mainColor);
                    }
                }
            }
        }
    }

</style>