<template>
    <div class="my_color_modal" ref="common_color">
        <!-- 我的颜色设置 -->
        <transition name="modal-slide">
            <div class="modal_contain" v-if="show_modal">
                <div class="header">
                    <p class="title">添加颜色</p>
                    <button class="close" @click="close">
                        <i class="edit-ico edit-ico-close_1"></i>
                    </button>
                </div>
                <div class="body">
                    <!-- 配色 -->
                    <div class="color_scheme_panel">
                        <div class="scheme_options" 
                            :class="{'show': show_color_scheme}" 
                            @click="scheme_type_list.length > 1 && toggle_scheme()">
                            <p :class="{hide:scheme_type_list.length === 1}">{{current_color_scheme.name}}</p>
                            <transition name="modal-fade">
                                <ul class="scheme_type_list" v-if="show_color_scheme">
                                    <li v-for="(item, index) in scheme_type_list" 
                                        :key="index" 
                                        :class="{'show': current_color_scheme.key === item.key}" 
                                        @click.stop="change_scheme(item)">
                                        {{item.name}}
                                    </li>
                                </ul>
                            </transition>
                        </div>
                        <span>（选择你喜欢的颜色）</span>
                        <ul class="color_scheme_list">
                            <li v-for="(item,index) in color_scheme[current_color_scheme.key].list" 
                                :key="index" 
                                :style="{background:item || 'transparent', border: !item ? '1px solid #d3dae4' : 'none'}" 
                                @click="add(item)">
                            </li>
                        </ul>
                    </div>
                    <!-- 最近选择颜色 -->
                    <div class="color_history_panel" v-if="color_history.length > 0">
                        <p>最近使用</p>
                        <ul>
                            <li v-for="item in color_history" :key="item" v-if="item !== 'transparent' && item !== ''" :style="{background:item,border:item === '#ffffff' ? '1px solid #ddf5ff' : 'none'}" @click="add(item)"></li>
                        </ul>
                    </div>
                    <!-- 自定义 -->
                    <div class="color_customize">
                        <p>自定义</p>
                        <button @click="show_color_picker = true"></button>
                        <!-- 颜色选择器 -->
                        <div class="color_picker" v-show="show_color_picker">
                            <Chrome v-if="show_color_picker" v-model="colors" class="picker_main"></Chrome> 
                            <button class="cancel" @click="show_color_picker = false">取消</button>
                            <button class="sure" @click="add(color_picker_value)">确定</button>
                        </div>
                    </div>
                    <!-- 我的颜色 -->
                    <div class="my_color_panel">
                        <p>我的颜色<span>（{{my_color_list.filter(item => item).length}}）</span></p>
                        <span v-for="(item,index) in my_color_list"
                            :key="index"
                            :style="{background:item || 'transparent', border: !item || item.toLowerCase() === '#ffffff' ? '1px solid #d3dae4' : 'none'}"
                            :class="{active:item}"
                        >
                            <i @click="del(index)" v-if="item">-</i>
                        </span>
                    </div>
                </div>
                <div class="foot">
                    <button class="cancel" @click="close">取消</button>
                    <button class="sure" :class="{disabled:my_color_list.filter(item => item).length === 0}" @click="save">保存</button>
                </div>
            </div>
        </transition>
    </div>
</template>

<script>
    import Vue from 'vue';
    import color_scheme from '@/assets/pc/json/ColorScheme.json'
    import { Chrome } from 'vue-color'
    Vue.use(Chrome);

    export default{
        components:{ Chrome },
        data(){
            return{
                show_modal: false,
                scheme_type_list:[
                    {
                        name:'推荐颜色',
                        key:'recommend',
                    },
                    {
                        name:'Ant Design',
                        key:'ant_design',
                    },
                    {
                        name:'Apple iOS UI',
                        key:'ios_ui',
                    },
                    {
                        name:'品牌颜色',
                        key:'brand_color',
                    }
                ],
                color_scheme: {},
                show_color_scheme: false,
                current_color_scheme: {},
                my_color_list: [],
                color_history: [],

                // 拾色器相关
                show_color_picker: false,
                colors: {
                    hex: '#000000'
                },
                color_picker_value: '#000000'
            }
        },
        watch:{
            colors:{
                handler(value) {
                    this.color_picker_value = value.hex;
                    'event' in window && event.preventDefault();
                },
                deep: true
            },
        },
        mounted () {
            let that = this;
            that.color_scheme = color_scheme;
            // 颜色选项关闭
            $(that.$refs.common_color).on('click', e => {
                if (e.target === that.$refs.colorType) return;
                that.show_color_type = false;
            });
            that.color_history = localStorage.getItem("color_history") ? localStorage.getItem("color_history").split(",") : [];
        },
        methods:{
            open(){
                this.show_modal = true;
                this.get_mycolor();
                this.current_color_scheme = this.scheme_type_list[0];
            },
            close(){
                this.show_modal = false;
                this.show_color_picker = false;
                this.my_color_list = [];
            },
            add(color){
                // 过滤重复颜色
                if (this.my_color_list.find(data => color === data)) return;
                this.my_color_list.unshift(color);
                this.my_color_list.pop();
                this.show_color_picker = false;
                this.save_color_history(color);
            },
            del(index){
                this.my_color_list.splice(index,1);
                this.my_color_list.push(undefined);
            },
            save(){
                let that = this;
                let my_color = that.my_color_list;
                that.$axios.post('/api/member/mycolor/save/',{
                    colors: my_color.filter(item => item).join(',')
                })
                .then((data) => {
                    if(data.data.code == 2){
                        that.$emit('update_mycolor',my_color);
                        that.$toast("保存成功",1500);
                        that.close();
                    }else{
                        that.$toast(data.data.content,1500);
                    }
                })
                .catch((data) => {
                    that.$toast(data.data.content,1500);
                })
            },
            get_mycolor(){
                let that = this;
				that.$axios.get('/api/member/mycolor/list/').then((data)=>{
                    if(data.data.code == 2){
                        that.my_color_list = data.data.data;
                    }
                    that.my_color_list.length = 30;
				})
            },
            toggle_scheme(){
                this.show_color_scheme = !this.show_color_scheme;
            },
            change_scheme(item){
                this.show_color_scheme = false;
                this.current_color_scheme = item;
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
        overflow: hidden;
        user-select: none;
        .header {
            padding: 0 27px;
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
            height: calc(100vh - 180px);
            padding:22px 28px;
            overflow: auto;
        }
        .color_scheme_panel{
            .scheme_options{ 
                position:relative;
                display:inline-block;
                margin-bottom:20px;
                p{
                    display:inline-block;
                    vertical-align:middle;
                    font-size:12px;
                    color:#1e2226;
                    cursor:pointer;
                    transition:all .3s;
                    &::before{
                        content:"";
                        display:inline-block;
                        position: relative;
                        top: -2px;
                        vertical-align:middle;
                        margin-right:6px;
                        width:14px;
                        height:14px;
                        background:#fff;
                        border:1px solid #d3dae4;
                        border-radius:2px;
                    }
                    &::after{
                        content:"";
                        position:absolute;
                        left: 4px;
                        top: 8px;
                        border-top:4px solid #8d97a5;
                        border-right:4px solid transparent;
                        border-left:4px solid transparent;
                        transition:all .3s;
                    }
                    &:hover{
                        opacity:.8;
                    }
                    &.hide{
                        &::before,&::after{
                            display:none;
                        }
                    }
                }
                &.show p::after{
                    transform:rotate(180deg);
                }
                .scheme_type_list{
                    position: absolute;
                    width: 128px;
                    padding: 4px 0;
                    background-color: #ffffff;
                    border: solid 1px rgba(25, 35, 52, 0.09);
                    border-radius: 4px;
                    box-shadow: 2px 3px 5px 0px rgba(24, 48, 85, 0.1);
                    z-index: 1;
                    li{
                        line-height: 30px;
                        padding: 0 14px;
                        font-size: 12px;
                        color:#566373;
                        cursor: pointer;
                        &.show, &:hover{
                            color: #0d7bf8;
                            background: #ebf2f9;
                        }
                    }
                }
            }
            span{
                float:right;
                margin-top:2px;
                font-size:12px;
                color:#757c83;
            }
            // 配色列表
            .color_scheme_list{ 
                margin-bottom:38px;
                li{
                    position:relative;
                    display:inline-block;
                    vertical-align:top;
                    width:28px;
                    height:28px;
                    margin:0 6px 11px 0;
                    border-radius: 50%;
                    cursor:pointer;
                    transition:all .3s;
                    &:nth-child(7n){
                        margin-right:0;
                    }
                    &::after{
                        content:"+";
                        position:absolute;
                        left: 6px;
                        top: -1px;
                        opacity:0;
                        z-index:-1;
                        font-size: 21px;
                        font-weight: bold;
                        color: #fff;
                        transition:all .3s;
                    }
                    &:hover{
                        box-shadow: 0px 6px 10px 0px rgba(52, 63, 80, 0.26);
                        &::after{
                            opacity:1;
                            z-index:2;
                        }
                    }
                }
            }
        }
        // 最近选择
        .color_history_panel{
            margin-bottom:27px;
            text-align:left;
            p{
                margin-bottom:8px;
                color:#1e2226;
                font-size:12px; 
            }
            ul{
                height:35px;
                overflow:hidden;
            }
            li{
                position:relative;
                display:inline-block;
                width:22px;
                height:22px;
                margin:0 15px 10px 0;
                border-radius:2px;
                cursor:pointer;
                &::after{
                    content:"+";
                    position:absolute;
                    left: 3px;
                    top: -4px;
                    opacity:0;
                    z-index:-1;
                    font-size: 21px;
                    font-weight: bold;
                    color: #fff;
                    transition:all .3s;
                }
                &:last-child{
                    margin-right:0;
                }
                &:hover{
                    box-shadow: 0px 6px 10px 0px rgba(52, 63, 80, 0.26);
                    &::after{
                        opacity:1;
                        z-index:2;
                    }
                }
                &.transparent{
                    background:url(~@/assets/pc/images/edit/transparent_bg.png) repeat !important;
                }
            } 
        }
        // 自定义
        .color_customize{
            position: relative;
            text-align:left;
            &>p{
                margin-bottom:8px;
                color:#1e2226;
                font-size:12px; 
            }
            &>button{
                width:25px;
                height:25px;
                border-radius:2px;
                background:@bg_image -7px -42px;
            }
        }
        // 我的颜色
        .my_color_panel{
            margin-top:25px;
            border-top:1px solid #e1e7f0;
            padding-top:26px;
            p{
                margin-bottom:10px;
                font-size:12px;
                color:#1e2226;
                span{
                    color:#757c83;
                }
            }
            &>span{
                position:relative;
                display:inline-block;
                vertical-align:top;
                width:28px;
                height:28px;
                margin:0 13px 11px 0;
                border-radius: 50%;
                transition:all .3s; 
                &:nth-child(6n + 1){
                    margin-right:0;
                }
                &.active:hover{
                    box-shadow: 0px 6px 6px 0px rgba(52, 63, 80, 0.13);
                }
                i{
                    position:absolute;
                    right: -3px;
                    top: -5px;
                    width:15px;
                    height:15px;
                    line-height:12px;
                    background:#ff4745;
                    border-radius:50%;
                    font-size: 22px;
                    font-weight: bold;
                    color: #fff;
                    text-align:center;
                    cursor:pointer;
                }
            }
        }
        // 拾色器
        .color_picker{
            position:absolute;
            padding-bottom:17px;
            border-radius:2px;
            background-color: #ffffff;
            box-shadow: 0 3px 4px 0 rgba(74, 75, 77, 0.05);
            border: solid 1px #e9eaec;
            text-align:center;
            z-index:2;
            @{deep} .vc-chrome{
                width:calc(100% - 28px);
                max-width: 230px;
                margin:14px auto;
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
            button{
                width: 60px;
                height: 28px;
                line-height: 28px;
                border-radius: 4px;
                text-align:center;
                font-size:12px;
                transition:all .3s;
                &.cancel{
                    margin-right:14px;
                    background-color: #dde4ec;
                    color:#475868;
                }
                &.sure{
                    background:var(--mainColor);
                    color:#fff;
                }
                &:hover{
                    opacity:0.8;
                }
            }
        }
        .foot{
            position:absolute;
            bottom:0;
            left:0;
            width:100%;
            height:70px;
            line-height:70px;
            border-top:1px solid #dbe3eb;
            text-align:center;
            button{
                width: 60px;
                height: 28px;
                line-height: 28px;
                border-radius: 4px;
                text-align:center;
                font-size:12px;
                transition:all .3s;
                &.cancel{
                    margin-right:14px;
                    background-color: #dde4ec;
                    color:#475868;
                }
                &.sure{
                    background:var(--mainColor);
                    color:#fff;
                }
                &.disabled{
                    pointer-events:none;
                    background-color: #e5ebf2 !important;
                    color:#adb7c2 !important;
                }
                &:hover{
                    opacity:0.8;
                }
            }
        }
    }
</style>