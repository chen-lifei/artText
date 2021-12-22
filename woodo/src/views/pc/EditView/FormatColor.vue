<template>
    <transition name="modal-fade">
        <div class="common_color" :data-type="color_selector.type" ref="common_color" v-if="show_color" @click.stop>
            <!--选择颜色面板-->
            <div class="color_menu">
                <div class="color-panel" :class="{'open-color-picker': show_color_picker}">
                    <!-- 打开拾色器之前 -->
                    <template v-if="!show_color_picker">
                        <div class="head-bar">
                            <!-- 颜色类型选择 -->
                            <div class="color-type-panel">
                                <button :class="{'current': current_color_index !== -1, 'open': show_color_type}" @click.stop="toggle_color_type()">
                                    <span>{{ color_type_list[current_color_index !== -1 ? current_color_index : 0].name }}</span>
                                </button>
                                <transition name="modal-fade">
                                    <ul class="color-type-list" v-if="show_color_type">
                                        <li :class="{'current':current_color_type === item.key}" v-for="item in color_type_list" :key="item.key" @click.stop="change_color_type(item)">
                                            {{item.name}}
                                        </li>
                                    </ul>
                                </transition>
                            </div>
                            <!-- 我的颜色 -->
                            <button class="my-color" :class="{'current': my_color_item.key === current_color_type}" @click.stop="change_color_type(my_color_item)">
                                <span>{{my_color_item.name}}</span>
                            </button>
                        </div>
                        <!-- 预设颜色列表 -->
                        <div class="select-color-list" v-if="['default', 'ant_design','ios_ui','brand_color'].indexOf(current_color_type) >= 0">
                            <div class="color-item need-border transparent" v-if="!color_selector.hide_transparent" :style="{ background: 'transparent' }" @click="select_color('transparent')"></div>
                            <template v-for="(item, index) in default_color_list[current_color_type].list">
                                <div class="color-item" v-if="index !== 0" :class="{'need-border': item === '#ffffff'}" :style="{ background: item }" @click="select_color(item)" :key="item">
                                    <div class="current" v-if="item === (color_selector.value.color || color_selector.value) && typeof item === 'string'">
                                        <base-icon class="icondagou"></base-icon>
                                    </div>
                                </div>
                            </template>
                            <div class="color-item seat" v-for="v in 6" :key="v"></div>
                        </div>
                        <!-- 颜色工具 -->
                        <div class="color-tools" v-if="current_color_type !== my_color_item.key">
                            <!-- 打开拾色器 -->
                            <button class="color-picker-btn" :style="{background: picker_colors.hex}" @click="open_color_picker"></button>
                            <!-- 打开颜色吸管按钮 -->
                            <button class="color-dye-btn" @click="show_get_color($event)">
                                <base-icon class="iconyansexiguan"></base-icon>
                            </button>
                            <!-- 颜色编辑 -->
                            <input type="text" :value="picker_colors.hex" @input="colorInput($event)" @keydown.enter="colorEditConfirm($event)" @blur="colorEditConfirm($event)" />
                        </div>
                        <!-- 我的颜色 -->
                        <div class="my-color-list" v-if="current_color_type === my_color_item.key">
                            <div class="item add-color" @click="open_color_picker()">
                                <base-icon class="iconcharu1"></base-icon>
                            </div>
                            <div class="item color" :style="{ background: item }" @click="select_color(item)" v-for="(item, index) in my_color_list" :key="item">
                                <button class="del" @click.stop="delMyColor(index)">
                                    <base-icon class="iconchacha"></base-icon>
                                </button>
                            </div>
                            <div class="item" v-for="v in (34 - my_color_list.length)" :key="v"></div>
                        </div>
                    </template>

                    <!-- 拾色器 -->
                    <div class="color_picker" ref="colorPicker" v-show="show_color_picker">
                        <span>自定义颜色</span>
                        <Chrome v-if="show_color_picker" v-model="picker_colors" class="picker_main"></Chrome>
                        <div class="btn-group">
                            <button class="cancel" @click="back_default_color()">取消</button>
                            <button class="confirm" @click="confirmPicker()">确定</button>
                        </div>
                    </div>
                </div>
                <!-- 最近选择颜色（最多7个） -->
                <div class="color_history" v-if="color_history.length > 0 && my_color_item.key !== current_color_type">
                    <p>最近使用</p>
                    <ul>
                        <template v-for="(item, index) in color_history">
                            <li :key="item" v-if="item !== 'transparent' && item !== ''" @click="select_color(item)" :style="{background:item,border:item === '#ffffff' ? '1px solid #ddf5ff' : 'none'}">
                                <button class="del" @click.stop="del_color_history(index)">
                                    <base-icon class="iconchacha"></base-icon>
                                </button>
                            </li>
                        </template>
                        <li class="seat" v-for="v in 6" :key="v"></li>
                    </ul>
                </div>
            </div>
        </div>
    </transition>
</template>

<script>
import Vue from 'vue';
import base_opt from '@/assets/pc/js/opt/base_opt.js';
import color_scheme from '@/assets/pc/json/ColorScheme.json'
import { Chrome } from 'vue-color'
Vue.use(Chrome);

export default {
    components: { Chrome },
    data() {
        return {
            show_color: false,
            color_selector: {},
            show_color_type: false,
            current_color_type: 'default',
            color_type_list: [
                { name: '默认颜色', key: 'default' },
                { name: 'Ant Design', key: 'ant_design' },
                { name: 'Apple iOS UI', key: 'ios_ui' },
                { name: '品牌颜色', key: 'brand_color' },
            ],
            my_color_item: { name: '我的颜色', key: 'mine' },
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
    computed: {
        // 颜色类型选项当前索引
        current_color_index() {
            return this.color_type_list.findIndex(v => v.key === this.current_color_type);
        },
    },
    watch: {
        color_history: {
            handler(new_arr) {
                localStorage.setItem('color_history', JSON.stringify(new_arr));
            },
            deep: true
        }
    },
    mounted() {
        let that = this;
        that.default_color_list = color_scheme;
        // 获取历史颜色
        let color_history = localStorage.getItem("color_history");
        try{
            that.color_history = color_history ? JSON.parse(color_history) : [];
        }catch(error){
            that.color_history = color_history ? color_history.split(',') : [];
        }
        // 鼠标未松开时，禁止颜色生效
        $(document).on('mousedown', '.color_picker', () => {
            that.can_set_pickerColor = false;
            $(document).on('mousemove', '.color_picker', () => {
                that.can_set_pickerColor = false;
            })
            $(document).on('mouseup', '.color_picker', () => {
                $('.color_picker').unbind('mousemove')
                that.can_set_pickerColor = true;
            })
        });
        // 输入框回车失焦
        $(document).on('keydown', '.color_picker input', (e) => {
            if (e.keyCode === 13) {
                this.select_color(that.picker_colors.hex);
            }
        });
        // 输入框失焦时，颜色生效
        $(that.$refs.colorPicker).on('blur', '.color_picker input', () => {
            this.select_color(that.picker_colors.hex);
        });
    },
    methods: {
        show(obj) {
            let that = this;
            let target = obj.$em;
            that.show_color = true;
            that.show_color_picker = false;
            that.show_color_type = false;
            that.color_selector = obj;
            let current_color = obj.value.color || obj.value;
            current_color = typeof current_color !== 'string' || current_color === 'transparent' ? '' : current_color;
            that.picker_colors.hex = current_color;
            that.confirm_event = obj.click;
            that.input_event = obj.input;
            that.$nextTick(() => {
                if (obj.prepend) {
                    target.prepend(that.$refs.common_color);
                } else {
                    target.append(that.$refs.common_color);
                }
            })
        },
        close() {
            this.show_color = false;
            this.show_color_picker = false;
        },
        // 打开/关闭颜色类型选择列表
        toggle_color_type() {
            this.show_color_type = !this.show_color_type;
        },
        // 切换颜色类型
        change_color_type(item) {
            let that = this;
            that.current_color_type = item.key;
            if (item.key === 'mine') {
                that.get_my_color_list();
            }
            that.show_color_type = false;
        },
        // 获取我的颜色
        get_my_color_list() {
            let that = this;
            that.$axios.get('/api/member/mycolor/list/').then((res) => {
                let { code, data } = res.data
                if (code == 2) {
                    if (data.length > 34) data.length = 34;
                    that.my_color_list = data;
                }
            }).catch((err) => {
                that.$toast('获取我的颜色失败！', 2000);
            })
        },
        // 保存我的颜色
        save_my_color(color) {
            this.my_color_list.push(color);
            this.$axios.post('/api/member/mycolor/save/', { colors: this.my_color_list.join(',') }).then((res) => {
                let { code, content } = res.data;
                if (code == 2) {
                    this.$toast("保存成功", 1500);
                } else {
                    this.$toast(content, 1500);
                    this.my_color_list.pop();
                }
                this.back_default_color();
            }).catch((res) => {
                this.$toast(res.data.content, 1500);
                this.my_color_list.pop();
                this.back_default_color();
            });
        },
        // 删除我的颜色
        delMyColor(index) {
            let del_item = this.my_color_list[index];
            this.my_color_list.splice(index, 1);
            this.$axios.post('/api/member/mycolor/save/', { colors: this.my_color_list.join(',') }).then((res) => {
                let { code } = res.data;
                if (code == 2) {
                    this.$toast('删除成功', 1500);
                } else {
                    this.$toast('删除失败', 1500);
                    this.my_color_list.splice(index, 0, del_item);
                }
            }).catch((res) => {
                this.$toast('删除失败', 1500);
                this.my_color_list.splice(index, 0, del_item);
            });
        },
        // 打开我的颜色设置面板
        open_mycolor() {
            this.$emit('show_mycolor');
            this.show_color_type = false;
        },
        // 拾色器确定按钮
        confirmPicker() {
            let is_mycolor = this.my_color_item.key === this.current_color_type;
            let color = this.picker_colors.hex;
            if (is_mycolor) {
                this.save_my_color(color);
            } else {
                this.select_color(color);
            }
            this.show_color_picker = false;
        },
        // 返回初始面板
        back_default_color() {
            this.show_color_picker = false;
        },
        colorInput(e) {
            let reg = /^#([0-9a-fA-f]{3}|[0-9a-fA-f]{6})$/;
            let is_hex = reg.test(e.target.value);
            if (is_hex) {
                this.picker_colors.hex = e.target.value;
                this.select_color(this.picker_colors.hex, { event_type: 'input' });
            }
        },
        // 颜色编辑确认
        colorEditConfirm(e) {
            let reg = /^#([0-9a-fA-f]{3}|[0-9a-fA-f]{6})$/;
            let is_hex = reg.test(e.target.value);
            if (!is_hex) {
                this.$toast('请输入正确的hex值');
            }
        },
        // 选择颜色
        select_color(data, obj) {
            let that = this;
            let params = {
                event_type: 'click'
            }
            Object.assign(params, obj);
            // 打开拾色器状态下记录颜色类型是hex rgb或者hsl
            if (that.show_color_picker) {
                let $fields = $('.vc-chrome-fields');
                for (let i in $fields) {
                    if ($fields.eq(i).css('display') !== 'none') {
                        that.show_picker_number = i;
                        break;
                    }
                }
            }

            // 事件分发
            switch (params.event_type) {
                case 'click':
                    that.confirm_event(data);
                    break;
                case 'input':
                    that.input_event(data);
                    break;
                default:
                    that.confirm_event(data);
                    break;
            }

            that.save_color_history(data);
        },
        // 调用拾色器
        open_color_picker() {
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
        show_get_color(e) {
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
            if (data.indexOf('#') < 0) return false;
            if (this.color_history.length !== 0) {
                this.color_history = this.color_history.filter(v => v !== data);
            }
            this.color_history.unshift(data);
            if (this.color_history.length > 7) {
                this.color_history.length = 7
            };
        },
        // 删除颜色历史
        del_color_history(index) {
            this.color_history.splice(index, 1);
        }
    }
}
</script>

<style lang="less" scoped>
@deep: ~'>>>';
/* 颜色选择器 */
.common_color {
    position: absolute;
    right: -5px;
    margin-top: 5px;
    box-shadow: 0 3px 4px 0 rgba(74, 75, 77, 0.05);
    z-index: 100;
}
.color_menu {
    width: 272px;
    height: auto;
    line-height: initial;
    padding: 20px;
    white-space: initial;
    border-radius: 2px;
    background-color: #ffffff;
    border: solid 1px #e9eaec;
    .color-panel {
        position: relative;
        width: 100%;
        &.open-color-picker {
            min-height: 275px;
        }
        // 头部
        .head-bar {
            display: flex;
            align-items: center;
            // 颜色类型
            .color-type-panel {
                position: relative;
                button {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    cursor: pointer;
                    span {
                        margin-right: 8px;
                        font-size: 12px;
                        font-weight: 400;
                        color: #999999;
                    }
                    &::after {
                        content: '';
                        margin-top: 2px;
                        width: 0;
                        height: 0;
                        border-width: 4px;
                        border-style: solid;
                        border-color: #999999 transparent transparent
                            transparent;
                    }
                    &.current span {
                        color: #333333;
                    }
                    &.open::after {
                        margin-top: -2px;
                        border-color: transparent transparent #999999
                            transparent;
                    }
                }

                .color-type-list {
                    padding: 10px;
                    margin-top: 5px;
                    position: absolute;
                    top: 100%;
                    left: 50%;
                    transform: translateX(-50%);
                    z-index: 5;
                    background: #ffffff;
                    border: 1px solid #eeeeee;
                    border-radius: 6px;
                    box-shadow: 0px 0px 8px 0px rgba(153, 153, 153, 0.1);
                    li {
                        padding-left: 10px;
                        display: flex;
                        align-items: center;
                        width: 100px;
                        height: 28px;
                        border-radius: 4px;
                        cursor: pointer;
                        &:hover {
                            background: #fafafa;
                        }
                        &.current {
                            pointer-events: none;
                            background: #f2f7ff;
                            color: var(--mainColor);
                        }
                    }
                }
            }

            // 我的颜色
            .my-color {
                margin-left: 20px;
                display: flex;
                span {
                    margin-right: 8px;
                    font-size: 12px;
                    font-weight: 400;
                    color: #999999;
                }
                &.current span {
                    color: #333333;
                }
            }
        }
        // 默认颜色
        .select-color-list {
            margin-top: 10px;
            display: flex;
            flex-wrap: wrap;
            justify-content: space-between;
            width: calc(100% + 5px);
            transform: translateX(-5px);
            .color-item {
                margin-left: 5px;
                margin-bottom: 5px;
                display: flex;
                width: 28px;
                height: 28px;
                border-radius: 5px;
                cursor: pointer;
                &:hover {
                    box-shadow: 0 2px 5px 0 rgba(0, 0, 0, 0.18);
                }
                &.transparent {
                    display: flex;
                    &::after {
                        content: '';
                        display: block;
                        margin: auto;
                        width: 12px;
                        height: 1px;
                        background: #cccccc;
                        transform: rotate(45deg);
                    }
                }
                &.need-border {
                    border: 1px solid #dddddd;
                }
                > .current {
                    margin: auto;
                    display: flex;
                    width: 14px;
                    height: 14px;
                    opacity: 1;
                    background: rgba(255, 255, 255, 0.6);
                    border: 1px solid #dddddd;
                    border-radius: 50%;
                    .base-icon {
                        margin: auto;
                        font-size: 12px;
                        color: #000000;
                    }
                }
                &.seat {
                    margin-bottom: 0;
                    height: 0;
                }
            }
        }
        // 颜色工具
        .color-tools {
            margin-top: 10px;
            padding-top: 20px;
            display: flex;
            align-items: center;
            width: 100%;
            border-top: 1px solid #eeeeee;
            button {
                width: 32px;
                height: 32px;
                border-radius: 50%;
                border: 1px solid #dddddd;
            }
            .color-dye-btn {
                margin-left: 5px;
                display: flex;
                .base-icon {
                    margin: auto;
                }
            }
            input {
                margin-left: 5px;
                width: 156px;
                height: 32px;
                font-size: 12px;
                font-weight: 400;
                text-align: center;
                color: #999999;
                border: 1px solid #dddddd;
                border-radius: 5px;
                &:focus {
                    color: #444444;
                    border-color: #aae5ff;
                }
            }
        }
        // 我的颜色
        .my-color-list {
            margin-top: 10px;
            display: flex;
            flex-wrap: wrap;
            justify-content: space-between;
            width: calc(100% + 5px);
            transform: translateX(-5px);
            .item {
                margin-left: 5px;
                margin-bottom: 5px;
                width: 28px;
                height: 28px;
                border-radius: 5px;
                border: 1px solid #dddddd;
            }
            .add-color {
                display: flex;
                cursor: pointer;
                .base-icon {
                    margin: auto;
                    font-size: 12px;
                }
            }
            .color {
                position: relative;
                cursor: pointer;
                .del {
                    position: absolute;
                    top: 0;
                    right: 0;
                    transform: translate(50%, -50%);
                    display: flex;
                    opacity: 0;
                    width: 15px;
                    height: 15px;
                    border-radius: 50%;
                    background: rgba(0, 0, 0, 0.5);
                    .base-icon {
                        margin: auto;
                        font-size: 12px;
                        color: #ffffff;
                    }
                }
                &:hover .del {
                    opacity: 1;
                }
            }
        }
        // 拾色器面板
        .color_picker {
            padding: 20px;
            position: absolute;
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
            @{deep} .vc-chrome {
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
                                margin-top: 2px;
                            }
                            .vc-chrome-toggle-icon-highlight {
                                top: 0;
                                left: 12px;
                                background: #fafafa;
                            }
                        }
                    }
                }
            }

            // 按钮
            .btn-group {
                display: flex;
                justify-content: center;
                align-items: center;
                width: 100%;
                button {
                    margin: 0 5px;
                    width: 56px;
                    height: 28px;
                    font-size: 12px;
                    font-weight: 400;
                    border-radius: 5px;
                    &.cancel {
                        color: #999999;
                        background: #ffffff;
                        border: 1px solid #dddddd;
                    }
                    &.confirm {
                        color: #ffffff;
                        background: var(--mainColor);
                    }
                }
            }
        }
    }

    // 最近选择
    .color_history {
        margin-top: 20px;
        p {
            margin-bottom: 10px;
            color: #444444;
            font-size: 12px;
        }
        ul {
            display: flex;
            flex-wrap: wrap;
            justify-content: space-between;
            width: calc(100% + 5px);
            transform: translateX(-5px);
            li {
                position: relative;
                margin-left: 5px;
                margin-bottom: 5px;
                width: 28px;
                height: 28px;
                border-radius: 5px;
                box-shadow: 0 0 5px 0 rgba(95, 95, 95, .1);
                cursor: pointer;
                .del {
                    position: absolute;
                    top: 0;
                    right: 0;
                    transform: translate(50%, -50%);
                    display: flex;
                    opacity: 0;
                    width: 15px;
                    height: 15px;
                    border-radius: 50%;
                    background: rgba(0, 0, 0, 0.5);
                    .base-icon {
                        margin: auto;
                        font-size: 12px;
                        color: #ffffff;
                    }
                }
                &:hover .del {
                    opacity: 1;
                }
                &:hover {
                    box-shadow: 0 2px 5px 0 rgba(0, 0, 0, 0.18);
                    border-color: #31afe6;
                }
                &.transparent {
                    background: url('~@/assets/pc/images/edit/transparent_bg.png')
                        repeat !important;
                }
                &.seat {
                    margin-bottom: 0;
                    height: 0;
                }
            }
        }
    }
}
.common_color[data-type='text'],
.common_color[data-type='hilite'] {
    margin-top: 30px;
}
</style>