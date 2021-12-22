<template>
    <!-- 动画效果弹框 -->
    <transition name="modal-slide">
        <div class="side_panel_contain animation-modal-contain" @click="element_animation_editing = null" v-show="show_animation_modal">
            <div class="modal-head">
                <p class="title">动画设置</p>
                <button class="close" @click="hide" v-bdtongji="`编辑器-功能区-编辑功能-顶部-过度效果-关闭`">
                    <i class="edit-ico edit-ico-close_1"></i>
                </button>
            </div>
            <div class="modal-body" @click="toggle_display(null)">
                <div class="body-nav">
                    <span :class="{current: current_animate_type === `element`}" @click="changeAnimateType(`element`)">元素动画</span>
                    <span :class="{current: current_animate_type === `page`}" @click="changeAnimateType(`page`)">页面动画</span>
                </div>
                <!-- 元素动画面板 -->
                <div class="wrapper element-wrapper" v-if="current_animate_type === `element`">
                    <!-- 添加动画 -->
                    <button class="animation-block-btn add-btn" v-show="show_createandedit" :class="{'disable': !can_set_create_animation}" @click.stop="create_animation_open" v-bdtongji="`编辑器-动效设置-动画-底部-添加动画`"><base-icon class="icontianjia1" size="15"></base-icon>添加动画</button>
                    <!-- 编辑动画 -->
                    <button class="animation-block-btn edit-btn" v-show="!show_createandedit" @click.stop="edit_animation_open_first" v-bdtongji="`编辑器-动效设置-动画-底部-编辑动画`"><base-icon class="iconbianji" size="15"></base-icon>编辑动画</button>
                    <!-- 动画数量 -->
                    <div class="wrapper-item count flex flex-between">
                        <span>动画数量：{{ element_animation_list.length }}</span>
                        <button class="preview" @click="animation_preview" v-bdtongji="`编辑器-动效设置-动画-顶部-预览|PC-统计-功能区-动效设置-动画-预览`"><base-icon class="iconxiala" color="#ffffff" size="12"></base-icon><span>预览</span></button>
                    </div>
                    <!-- 关闭默认动画 -->
                    <div class="wrapper-item default flex flex-between" :style="{ paddingBottom: !default_animation_close  ? 0 : '38px' }">
                        <span>关闭默认动画：</span>
                        <div class="switch-round-btn" :class="{'true': default_animation_close}" @click="toggle_default_animation" v-bdtongji="`编辑器-动效设置-动画-顶部-关闭默认动画`"></div>
                        <div class="pull_module default_animation" 
                            v-if="default_animation_close"
                            :class="{'show': open_status['default_animation']}" 
                            @click.stop="toggle_display('default_animation')">
                                <div class="pull_module_btn">{{ default_animation_range[default_animation_close] }}</div>
                                <transition name="modal-fade">
                                    <ul class="module_list" v-show="open_status['default_animation']">
                                        <li v-for="(value, key) in default_animation_range" 
                                            :key="key" 
                                            @click="default_animation_disable(key)" v-bdtongji="`PC-统计-功能区-动效设置-动画-关闭默认动画`">
                                                {{ value }}
                                            <base-icon class="iconxuanzhong" size="12" v-if="key === default_animation_close"></base-icon>
                                        </li>
                                    </ul>
                                </transition>
                        </div>
                    </div>
                    <!-- 动画排序 -->
                    <div class="wrapper-item sort flex flex-between">
                        <span>动画顺序：</span>
                        <div>
                            <button class="up" v-tooltip="`上移`" :class="{'disable': !can_animation_sort_up}" @click.stop="set_animation_sort('up')" v-bdtongji="`编辑器-动效设置-动画-顶部-动画顺序-上移|PC-统计-功能区-动效设置-动画-动画顺序`">
                                <base-icon class="iconshangyi" color="#444444" size="19"></base-icon>
                            </button>
                            <button class="down" v-tooltip="`下移`" :class="{'disable': !can_animation_sort_down}" @click.stop="set_animation_sort('down')" v-bdtongji="`编辑器-动效设置-动画-顶部-动画顺序-下移|PC-统计-功能区-动效设置-动画-动画顺序`">
                                <base-icon class="iconxiayi" color="#444444" size="19"></base-icon>
                            </button>
                        </div>
                    </div>
                    <!-- （空列表） -->
                    <div class="empty" v-if="!element_animation_list.length">
                        <img v-webp="require('../../../assets/common/images/empty_1.png')" alt=""/>
                        <p>请选择元素添加动画</p>
                    </div>
                    <!-- 元素动画列表 -->
                    <div class="element-animation-group" v-else>
                        <ul @click.stop>
                            <li v-for="(item, index) in element_animation_list" 
                                :key="index" 
                                :class="{'editing': element_animation_editing === item.uuid, 'checked': element_animation_selected.indexOf(item.uuid) >= 0}">
                                    <span class="index">{{ item.group_index }}</span>
                                    <div class="animate-item">
                                        <base-icon class="icondonghuaxiao" size="15"></base-icon>
                                        <span class="type">{{ item.element_type }}</span>
                                        <span class="effect">{{ `${element_animation_effect[item.animation_name]}（${element_animation_start[item.animation_start]}）` }}</span>
                                        <button class="play" @click="animation_preview(item.uuid)" v-bdtongji="`编辑器-动效设置-动画-底部-动画-播放`"><base-icon class="iconxiala" color="#ffffff" size="12"></base-icon></button>
                                        <button class="delete" @click="remove_element_animation(item)" v-bdtongji="`编辑器-动效设置-动画-底部-动画-删除|PC-统计-功能区-动效设置-动画-所有动画设置`"><base-icon class="iconshanchu" size="18"></base-icon></button>
                                        <div class="open-focus" @click="set_edit_animation($event, item.uuid)"></div>
                                        <!-- 二次编辑动画 -->
                                        <div class="edit-wrapper" v-if="element_animation_editing === item.uuid">
                                            <div class="pull_module edit-wrapper-effect" 
                                                :class="{'show': open_status['edit_animation_name']}"
                                                @click="toggle_display('edit_animation_name')">
                                                    <div class="pull_module_btn">{{ element_animation_effect[item.animation_name] }}</div>
                                                    <transition name="modal-fade">
                                                        <ul class="module_list animation-preview-list" v-show="open_status['edit_animation_name']">
                                                            <li v-for="(value, key) in element_animation_effect" 
                                                                :key="key"
                                                                :class="{checked: key === item.animation_name}"
                                                                @click.stop="set_edit_animation_options('name', key)"
                                                                v-bdtongji="`编辑器-动效设置-动画-底部-编辑动画-${value}|PC-统计-功能区-动效设置-动画-所有动画设置`">
                                                                    <span>{{value}}</span>
                                                                    <div class="hover-preview" :class="key">
                                                                        <i class="edit-ico edit-ico-animate_fade"></i>
                                                                        <i class="edit-ico edit-ico-animate_leftfly"></i>
                                                                        <i class="edit-ico edit-ico-animate_rightfly"></i>
                                                                        <i class="edit-ico edit-ico-animate_topfly"></i>
                                                                        <i class="edit-ico edit-ico-animate_bottomfly"></i>
                                                                        <i class="edit-ico edit-ico-animate_enlarge"></i>
                                                                        <i class="edit-ico edit-ico-animate_narrow"></i>
                                                                        <i class="edit-ico edit-ico-animate_rotate"></i>
                                                                    </div>
                                                            </li>
                                                        </ul>
                                                    </transition>
                                            </div>
                                            <div class="edit-wrapper-item">
                                                <span>开始</span>
                                                <div class="pull_module setting-start" 
                                                    :class="{'show': open_status['edit_animation_start']}"
                                                    @click="toggle_display('edit_animation_start')">
                                                        <div class="pull_module_btn">{{ element_animation_start[item.animation_start] }}</div>
                                                        <transition name="modal-fade">
                                                            <ul class="module_list" v-show="open_status['edit_animation_start']">
                                                                <li v-for="(value, key) in element_animation_start" 
                                                                    :key="key"
                                                                    @click.stop="set_edit_animation_options('start', key)"
                                                                    v-bdtongji="`编辑器-动效设置-动画-底部-开始-${value}|PC-统计-功能区-动效设置-动画-所有动画设置`">
                                                                        {{value}}
                                                                    <base-icon class="iconxuanzhong" size="12" v-if="key === item.animation_start"></base-icon>
                                                                </li>
                                                            </ul>
                                                        </transition>
                                                </div>
                                            </div>
                                            <div class="edit-wrapper-item">
                                                <span>速度</span>
                                                <div class="setting-time" v-tooltip="`单位：秒`" v-bdtongji="`编辑器-动效设置-动画-底部-速度|PC-统计-功能区-动效设置-动画-所有动画设置`">
                                                    <input type="number" 
                                                        v-model="item.animation_duration" 
                                                        @blur="set_edit_animation_options('duration')" 
                                                        @keydown.enter="$event.target.blur()" />
                                                    <div class="tune">
                                                        <a href="javascript:;" class="add" @click="set_edit_animation_options('duration', 'add')"></a>
                                                        <a href="javascript:;" class="reduce" @click="set_edit_animation_options('duration', 'reduce')"></a>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                            </li>
                        </ul>
                    </div>
                </div>
                <!-- 文档页切换面板 -->
                <div class="wrapper switch-wrapper" v-if="current_animate_type === `page`">
                    <div class="wrapper-item count flex flex-between">
                        <span>切换效果：</span>
                        <button class="preview" @click.stop="switch_preview" v-bdtongji="`编辑器-功能区-切换-顶部-预览|PC-统计-功能区-动效设置-切换-预览`"><base-icon class="iconxiala" color="#ffffff" size="12"></base-icon><span>预览</span></button>
                    </div>
                    <!-- 切换效果 -->
                    <div class="switch-list">
                        <ul class="flex flex-evenly">
                            <li v-for="(item, index) in document_switch_list" :key="index" :class="{checked: item.type === page_switch_type}" @click.stop="switch_apply_preview(item.type)" v-bdtongji="`编辑器-功能区-编辑功能-顶部-切换效果-${item.name}|PC-统计-功能区-动效设置-切换-${item.name}`">{{item.name}}</li>
                        </ul>
                    </div>
                    <!-- 自动播放/手动播放 -->
                    <div class="wrapper-item">
                        <span class="item-title">演示模式：</span>
                        <div class="pull_module switch-mode" 
                            :class="{'show': open_status['switch_mode']}" 
                            @click.stop="toggle_display('switch_mode')">
                                <div class="pull_module_btn" v-tooltip="switch_mode_title">{{ switch_mode_name }}</div>
                                <transition name="modal-fade">
                                    <ul class="module_list" v-show="open_status['switch_mode']">
                                        <li v-for="(item, index) in switch_mode_list" 
                                            :key="index" 
                                            v-tooltip="item.title"
                                            @click.stop="switch_mode_radio(item.type)"
                                            v-bdtongji="`编辑器-功能区-编辑功能-顶部-演示效果-${item.name}|PC-统计-功能区-动效设置-切换-${item.name}`">
                                                {{ item.name }}
                                                <base-icon class="iconxuanzhong" size="12" v-if="item.type === switch_mode_type"></base-icon>
                                        </li>
                                    </ul>
                                </transition>
                        </div>
                    </div>
                    <!-- 切换应用全部 -->
                    <div class="wrapper-item switch-all">
                        <span>应用到所有幻灯片：</span>
                        <div class="switch-round-btn" 
                            :class="{'true': switch_apply_all}" 
                            @click="toggle_switch_apply_all"
                            v-bdtongji="`编辑器-功能区-编辑功能-顶部-过度效果-${switch_apply_all ? '取消' : ''}应用到所有幻灯片|PC-统计-功能区-动效设置-切换-应用到所有幻灯片`">
                        </div>
                    </div>
                </div>
            </div>
            <!-- 创建动画面板 -->
            <transition name="modal-fade">
                <div class="add-animation-wrapper" v-show="show_create_animation_panel">
                    <div class="setting-wrapper">
                        <div class="item">
                            <span>开始</span>
                            <div class="pull_module setting-start" 
                                :class="{'show': open_status['create_animation_start']}"
                                @click="toggle_display('create_animation_start')">
                                    <div class="pull_module_btn">{{element_animation_start[create_animation_option['start']]}}</div>
                                    <transition name="modal-fade">
                                        <ul class="module_list" v-show="open_status['create_animation_start']">
                                            <li v-for="(value, key) in element_animation_start" 
                                                :key="key"
                                                @click.stop="set_create_animation_options('start', key)">
                                                    {{value}}
                                            </li>
                                        </ul>
                                    </transition>
                            </div>
                        </div>
                        <div class="item">
                            <span>速度</span>
                            <div class="setting-time" v-tooltip="`单位：秒`">
                                <input type="number" 
                                    v-model="create_animation_option['duration']" 
                                    @blur="set_create_animation_options('duration')" 
                                    @keydown.enter="$event.target.blur()" />
                                <div class="tune">
                                    <a href="javascript:;" class="add" @click="set_create_animation_options('duration', 'add')"></a>
                                    <a href="javascript:;" class="reduce" @click="set_create_animation_options('duration', 'reduce')"></a>
                                </div>
                            </div>
                        </div>
                        <ul class="animation-preview-list">
                            <li v-for="(value, key) in element_animation_effect" 
                                :key="key"
                                :class="{'checked': create_animation_option['name'] === key}"
                                @click="set_create_animation_options('name', key)">
                                    <span>{{value}}</span>
                                    <div class="hover-preview" :class="key">
                                        <i class="edit-ico edit-ico-animate_fade"></i>
                                        <i class="edit-ico edit-ico-animate_leftfly"></i>
                                        <i class="edit-ico edit-ico-animate_rightfly"></i>
                                        <i class="edit-ico edit-ico-animate_topfly"></i>
                                        <i class="edit-ico edit-ico-animate_bottomfly"></i>
                                        <i class="edit-ico edit-ico-animate_enlarge"></i>
                                        <i class="edit-ico edit-ico-animate_narrow"></i>
                                        <i class="edit-ico edit-ico-animate_rotate"></i>
                                    </div>
                            </li>
                        </ul>
                    </div>
                </div>
            </transition>
            <!-- 动画预览容器 -->
            <div class="animation-preview-container">
                <svg_modal v-if="show_animation_preview"
                    :style="{'position': 'fixed', 'top': `${animation_preview_template.top}px`, 'left': `${animation_preview_template.left}px`}"
                    :svg_w="animation_preview_template.width"
                    :svg_h="animation_preview_template.height"
                    :svg_view="animation_preview_template.view"
                    :document="doc_info"
                    :page_info="page_info">
                </svg_modal>
            </div>
        </div>
    </transition>
</template>

<script>
import svg_modal from '@/components/SvgPageModal.vue';
import opt_factory from '@/assets/pc/js/opt/opt_factory.js';
import page_opt from "@/assets/pc/js/opt/page_opt.js";
import element_animate from '@/assets/pc/js/element_animate.js';

export default {
    name: "AnimationPanel",
    props: [
        'doc_info',
        'page_info',
        'document_page_list',
    ],
    components: {
        svg_modal,
    },
    data() {
        return {
            // 弹窗显示状态
            show_animation_modal: false,
            // 当前动画目标类型
            current_animate_type: `element`,
            // 创建动画面板
            show_create_animation_panel: false,
            // 组件内所有可展开的操作状态对象，对象内的属性自定义
            open_status: {},
            // 防抖定时器
            debounce: null,
            debounce_update: null,

            /**
             * 切换页
             */
            // 当前页切换效果
            page_switch_type: 'fadeInAndOut',
            page_switch_name: '淡入淡出',
            // 动画列表
            document_switch_list: [
                { name: '无效果', type: null },
                { name: '淡入淡出', type: 'fadeInAndOut' },
                { name: '上下翻页', type: 'pagingDown' },
                { name: '左右翻页', type: 'pagingRight' },
                { name: '上下推移', type: 'gooseDown' },
                { name: '左右推移', type: 'gooseRight' },
                { name: '翻转', type: 'flipping' },
                { name: '切换', type: 'switching' },
                { name: '库', type: 'library' },
                // { name: '立方体', type: 'cube'},
                { name: '缩放', type: 'zoom' },
                { name: '摩天轮', type: 'ferrisWheel' },
                { name: '轨道', type: 'track' },
            ],
            // 切换方式  click = 点击切换  auto = 自动
            switch_mode_type: 'click',
            switch_mode_name: '手动演示',
            switch_mode_list: [
                { name: '手动演示', type: 'click', title: '' },
                { name: '自动演示', type: 'auto', title: '自动播放默认时间间隔：3秒' },
                { name: '自动循环演示', type: 'autoloop', title: '自动循环演示仅在应用全部时生效' },
            ],
            // 应用所有
            switch_apply_all: false,

            /**
             * 元素动画
             */
            // 元素动画列表
            element_animation_list: [],
            // 元素动画效果，预览页效果仅在当前组件有效
            element_animation_effect: {
                'fade': '淡入淡出',
                'leftFly': '左侧飞入',
                'rightFly': '右侧飞入',
                'topFly': '顶部飞入',
                'bottomFly': '底部飞入',
                'enlarge': '放大',
                'narrow': '缩小',
                'rotate': '旋转',
                'appear': '出现',
            },
            // 元素动画触发
            element_animation_start: {
                'click': '单击时',
                'same': '与上一项同时',
                'after': '在上一项之后',
            },
            // 显示动画预览
            show_animation_preview: false,
            animation_preview_template: {
                left: 0,
                top: 0,
                width: 910,
                height: 512,
                view:[0, 0, 910, 512]
            },
            // 是否可进行元素动画排序，选中元素和调整排序时更新值
            can_animation_sort_down: false,
            can_animation_sort_up: false,
            // 默认动画关闭状态  false = 开启默认动画， default_animation_range的key值
            default_animation_close: false,
            default_animation_range: {
                'page': '当前页面',
                'document': '所有页面',
            },
            // 元素动画二次编辑面板打开 值为 元素id 或 组id
            element_animation_editing: '',
            // 元素选中 列表选中状态，值为数组
            element_selected: [],                   // 元素选中，包含无动画元素
            element_animation_selected: [],         // 元素选中，不包含无动画元素
            // 显示元素创建 & 编辑 按钮 显示状态  true:创建 false:编辑
            show_createandedit: true,
            can_set_create_animation: false,
            // 创建元素动画默认参数
            create_animation_option: {
                'name': '',
                'start': 'click',
                'duration': 1,
                'index': [0, 0],
            },
        };
    },
    computed: {
        switch_mode_title() {
            let title = '';
            let item = this.switch_mode_list.find(i => i.type === this.switch_mode_type);
            if (item) {
                title = item.title;
            }
            return title;
        },
    },
    watch: {
        // 文档翻页监听更新
        page_info: {
            handler(n, o) {
                let that = this;
                if (!that.show_animation_modal) {
                    return;
                }
                if (n.uuid === o.uuid) {
                    return;
                }
                clearTimeout(that.debounce);
                that.init_animation_state();
                that.animation_preview_end();
                // 重置操作状态，防抖间隔时间为切换页动画结束所需时间
                that.debounce = setTimeout(() => {
                    // 更新数据
                    that.update_animation_panel();
                }, 450);
            },
            deep: true,
        },
        // 动画列表数据修改监听
        element_animation_list(n, o) {
            // 动画属性调整
            if (JSON.stringify(utils.deepClone(n)) === JSON.stringify(o)) {
                return;
            }
            // 更新画布内元素下标属性排序规则
            this.update_animation_index();
            // 更新面板内元素选中状态
            this.animation_list_select();
        },
        // 监听任意元素选中更新面板状态
        element_selected(n, o) {
            // 显示 创建 & 编辑动画按钮
            this.can_set_createandedit(utils.deepClone(n));
        },
        // 监听动画元素选中更新面板状态
        element_animation_selected(n, o) {
            // 选中的元素是否可进行重新排序
            this.can_set_sort(utils.deepClone(n));
        },
    },
    methods: {
        show(callback) {
            this.show_animation_modal = true;
            this.update_animation_panel();
            this.animation_list_select();
            this.$nextTick(() => {
                if (typeof callback === 'function') callback();
            });
        },
        hide(callback) {
            if (this.show_animation_modal) {
                this.init_animation_state();
                this.animation_preview_end();
                this.$nextTick(() => {
                    if (typeof callback === 'function') callback();
                });
            }
            this.show_animation_modal = false;
        },
        toggle(callback) {
            if (this.show_animation_modal) {
                this.hide(callback);
            } else {
                this.show(callback);
            }
        },
        // 重置组件内动画状态
        init_animation_state() {
            this.toggle_display();
            // 编辑面板
            this.element_animation_editing = '';
            // 列表选中
            this.element_animation_selected = [];
            // 动画顺序
            this.can_animation_sort_up = false;
            this.can_animation_sort_down = false;
            // 创建动画
            this.can_set_create_animation = false;
            this.show_create_animation_panel = false;
            this.create_animation_option = {
                'name': '',
                'start': 'click',
                'duration': 1,
                'index': [0, 0],
            };
            this.remove_animation_mark();
        },
        // 更新动画面板
        update_animation_panel() {
            this.get_default_animation();
            this.update_switch();
            this.update_animation_list();
        },
        // 可展开操作 key 为自定义属性
        toggle_display(key) {
            let that = this;
            if (key) {
                that.$set(that.open_status, key, !that.open_status[key]);
            }
            // 关闭其他状态
            for (let i in that.open_status) {
                if (i !== key) {
                    that.open_status[i] = false;
                }
            }
        },
        // 面板组折叠
        wrapper_toggle(event) {
            let $wrapper = $(event.target).parents('.wrapper');
            $wrapper.toggleClass('fold');
        },
        // 切换动画面板
        changeAnimateType(type) {
            if (this.current_animate_type === type) {
                return;
            }
            this.current_animate_type = type;
        },


        /**
         * 切换页
         */
        // 更新文档页切换数据
        update_switch() {
            let that = this;
            // 文档页切换效果数据
            that.page_switch_type = that.page_info.switchType;
            that.page_switch_name = that.document_switch_list.find(item => item.type === that.page_switch_type).name;
            // 切换方式 默认click
            that.switch_mode_type = that.page_info.attr && that.page_info.attr['playType'] ? that.page_info.attr['playType'] : 'click';
            that.switch_mode_name = that.switch_mode_list.find(item => item.type === that.switch_mode_type).name;
            // 全部文档页效果选中
            let mode = that.doc_info.attr && that.doc_info.attr['playType'];
            that.switch_apply_all = !!(that.doc_info.switchType && mode);
        },
        // 预览切换效果
        switch_preview() {
            let that = this;
            let $page = opt_factory.init_opt('group').get_canvas_page();
            // 切换效果预览
            page_opt.page_switch_preview({
                in_html: $page.prop('outerHTML'),
                type: that.page_switch_type,
                direction: 'next',
                switchBefore: () => {
                    $('.page_contain').css('opacity', 0);
                    $('.switch_page_content').css('background-color', '#b7b7b7');
                },
                switchAfter: () => {
                    $('.page_contain').css('opacity', 1);
                    $('.switch_page_content').css('background-color', '#ffffff');
                },
            });
        },
        // 应用当前文档页切换效果
        switch_apply_preview(type) {
            let that = this;
            that.page_switch_type = type;
            that.page_switch_name = that.document_switch_list.find(item => item.type === type).name;
            that.toggle_display();
            // 设置当前页切换状态
            page_opt.set_page_switchType(that.$parent, that.page_info.uuid, type);
            // 改变全局应用状态
            if (that.doc_info.switchType !== type) {
                that.switch_apply_all = false;
            }
            // 更新默认动画动画类型，设置默认动画元素动画属性
            if (!that.get_default_animation()) {
                that.element_default_animation('recovery');
            }
            that.switch_preview();
        },
        // 演示模式 单选
        switch_mode_radio(mode) {
            let that = this;
            that.switch_mode_type = mode;
            that.switch_mode_name = that.switch_mode_list.find(item => item.type === mode).name;
            that.toggle_display();
            // 设置效果
            page_opt.set_page_attr(that.$parent, that.page_info.uuid, 'playType', mode);
            // 设置 自动/自动循环 应用到所有幻灯片
            if (mode === 'auto' || mode === 'autoloop') {
                that.switch_apply_all = false;
                that.toggle_switch_apply_all();
                return;
            }
            // 否则改变全局应用状态
            let document_play_type = that.doc_info.attr ? that.doc_info.attr['playType'] : null;
            if (document_play_type !== mode) {
                that.switch_apply_all = false;
                page_opt.set_document_attr(that.$parent, 'playType', null);
            }
        },
        // 应用全部文档页切换效果
        toggle_switch_apply_all() {
            let that = this;
            // 应用全局切换效果
            that.switch_apply_all = !that.switch_apply_all;
            let switch_type = null;
            let mode = null;
            if (that.switch_apply_all) {
                switch_type = that.page_switch_type;
                mode = that.switch_mode_type;
            }
            page_opt.set_document_switchType(that.$parent, switch_type);
            // 应用全局演示模式
            page_opt.set_document_attr(that.$parent, 'playType', mode);
        },
        // 折叠面板
        switch_wrapper_fold() {
            $('.wrapper.switch-wrapper').addClass('fold');
        },


        /**
         * 元素动画
         */
        // 观察者监听元素修改更新数据
        observer_update() {
            let that = this;
            if (!that.show_animation_modal) {
                return;
            }
            clearTimeout(that.debounce_update);
            that.debounce_update = setTimeout(() => {
                // 列表更新
                that.update_animation_list();
            }, 100);
        },
        // elementList 转 element_animation_list （元素转动画列表数据）
        element_2_animation_list() {
            let page_info = page_opt.get_page(opt_factory.init_opt('group').get_canvas_page());
            // 整理元素动画数据渲染
            let element_animation_list = [];
            if (!Array.isArray(page_info.elementList)) {
                return element_animation_list;
            }
            // 提取动画数据
            page_info.elementList.forEach(element_item => {
                if (!Array.isArray(element_item.animation)) {
                    return;
                }
                element_item.animation.forEach(item => {
                    if (!item.name) {
                        return;
                    }
                    let obj = {};
                    if (element_item.group) {
                        obj.uuid = element_item.group;
                        obj.element_type = '组合';
                        obj.is_group = true;
                    } else {
                        obj.uuid = element_item.id;
                        obj.is_group = false;
                        switch (element_item.type) {
                            case 'shape':
                                obj.element_type = '形状';
                                break;
                            case 'text':
                                obj.element_type = '文本';
                                break;
                            case 'img':
                                obj.element_type = '图片';
                                break;
                            case 'table':
                                obj.element_type = '表格';
                                break;
                            case 'chart':
                                obj.element_type = '图表';
                                break;
                            case 'line':
                                obj.element_type = '线条';
                                break;
                            case 'video':
                                obj.element_type = '视频';
                                break;
                            case 'audio':
                                obj.element_type = '音频';
                                break;
                            default:
                                obj.element_type = '元素';
                                break;
                        }
                    }
                    let have = element_animation_list.every(i => i.uuid !== obj.uuid);
                    if (have) {
                        obj.group_index = (+item.index[0]) || 0;
                        obj.item_index = (+item.index[1]) || 0;
                        obj.animation_name = item.name;
                        obj.animation_start = item.start;
                        obj.animation_duration = parseFloat(item.duration);
                        obj.animation_delay = (+item.delay);
                        element_animation_list.push(obj);
                    }
                });
            });
            return element_animation_list;
        },
        // 更新元素动画列表，监听page_info实时更新
        update_animation_list() {
            let that = this;
            // 根据 0,0  0,1  0,2  1,0  1,1  1,2 规则排序
            that.element_animation_list = that.element_2_animation_list().sort((a, b) => a.group_index - b.group_index || a.item_index - b.item_index);
            // 更新画布内元素标记
            that.send_animation_mark();
        },
        // 更新元素动画的动画属性，更新当前页全部元素动画的 delay index
        update_animation_index() {
            let that = this;
            let list = that.element_animation_list;
            let option = opt_factory.init_opt('group');
            list.forEach((item, index, arr) => {
                let $item = option.get_element(item.uuid);
                let is_click = item.animation_start === 'click';
                /**
                 * delay: 非click触发时，延迟时间 = 上一个动画的持续时间 + 延迟时间
                 * index: index[0] = click触发时 +1 ，否则与上一个相同， index[1] = click触发时 =0 ，否则 + 1
                 */
                if (index === 0) {
                    item.group_index = Number(is_click);
                    item.item_index = 0;
                    item.animation_delay = 0;
                } else {
                    // 上一个动画的 组下标
                    let before_group_index = arr[index - 1].group_index;
                    if (is_click) {
                        item.group_index = before_group_index + 1;
                        item.item_index = 0;
                        item.animation_delay = 0;
                    } else {
                        // 上一个动画的 组内排序下标  延时时间  动画持续时间
                        let before_item_index = arr[index - 1].item_index;
                        let before_delay = arr[index - 1].animation_delay;
                        let before_duration = arr[index - 1].animation_duration;
                        item.group_index = before_group_index;
                        item.item_index = before_item_index + 1;
                        // 与上一项同时
                        if (item.animation_start === 'same') {
                            item.animation_delay = before_delay;
                        } else {
                            item.animation_delay = before_delay + before_duration;
                        }
                    }
                }
                // 值不同则设置
                let same_duration = $item.attr('data-animation-duration') !== String(item.animation_duration);
                let same_delay = $item.attr('data-animation-delay') !== String(item.animation_delay);
                let same_index = $item.attr('data-animation-index') !== [item.group_index, item.item_index].join();
                if (same_duration || same_delay || same_index) {
                    $item.attr({
                        'data-animation-duration': item.animation_duration,
                        'data-animation-delay': item.animation_delay,
                        'data-animation-index': [item.group_index, item.item_index].join(),
                    });
                }
            });
        },
        // 更新元素动画的动画属性，更新当前所选元素动画的 name start duration index
        update_animation_attr($ele, opt) {
            let that = this;
            let options = {};
            options = Object.assign(options, opt);
            // 设置属性，delay 在列表数据更新时更新
            if (typeof options['name'] !== 'undefined') {
                $ele.attr({
                    'data-animation-name': options['name'],
                    'data-animation-default': 'false',
                });
            }
            if (typeof options['start'] !== 'undefined') {
                $ele.attr('data-animation-start', options['start']);
            }
            if (typeof options['duration'] !== 'undefined') {
                $ele.attr('data-animation-duration', options['duration']);
            }
            if (typeof options['index'] !== 'undefined' && Array.isArray(options['index'])) {
                $ele.attr('data-animation-index', options['index'].join());
            }
        },
        /* ---------------------- 预览 ------------------------- */
        // 同步当前画布尺寸到动画预览容器
        set_preview_template_attr() {
            // 设置尺寸
            let that = this;
            let page_msg = opt_factory.init_opt('group').get_canvas_page()[0].getBoundingClientRect();
            that.animation_preview_template.top = page_msg.top;
            that.animation_preview_template.left = page_msg.left;
            that.animation_preview_template.width = page_msg.width;
            that.animation_preview_template.height = page_msg.height;
            that.animation_preview_template.view = [0, 0, that.doc_info.width, that.doc_info.height];
        },
        // 动画预览 uuid = string || array
        animation_preview(uuid) {
            let that = this;
            if (that.show_animation_preview) {
                return;
            }
            that.set_preview_template_attr();
            // 显示预览
            that.show_animation_preview = true;
            that.$nextTick(() => {
                let element_arr = [];
                // 匹配需要播放的动画，重置动画下标
                if (typeof uuid === 'string') {
                    element_arr = that.page_info.elementList.filter(item => {
                        return item.group === uuid || item.id === uuid;
                    });
                    element_arr = utils.deepClone(element_arr);
                    element_arr.forEach(item => {
                        if (Array.isArray(item.animation) && item.animation.length > 0) {
                            item.animation[0].index[0] = 0;
                            item.animation[0].delay = 0;
                        }
                    });
                } else if (Array.isArray(uuid)) {
                    // 数组去重匹配
                    element_arr = that.page_info.elementList.filter(item => {
                        return uuid.indexOf(item.group) >= 0 || uuid.indexOf(item.id) >= 0;
                    });
                    element_arr = utils.deepClone(element_arr);
                    element_arr.forEach((item, index) => {
                        if (Array.isArray(item.animation) && item.animation.length > 0) {
                            if (index === 0) {
                                item.animation[0].delay = 0;
                            }
                            item.animation[0].index[0] = 0;
                        }
                    });
                } else {
                    element_arr = utils.deepClone(that.page_info.elementList);
                }
                // 创建动画并执行
                element_animate.buildAnimation({
                    contain: document.querySelector('.animation-modal-contain .animation-preview-container'),
                    elementList: element_arr,
                    autoplay: true,
                    animationEnd: () => {
                        that.animation_preview_end();
                    }
                });
            });
        },
        // 动画预览完成
        animation_preview_end() {
            this.show_animation_preview = false;
        },
        /* ---------------------- 动画标记 ------------------------- */
        // 编辑页元素添加标记
        send_animation_mark() {
            let that = this;
            if (!that.show_animation_modal) {
                return;
            }
            let mark_arr = [];
            that.element_animation_list.forEach(item => {
                mark_arr.push({
                    uuid: item.uuid,
                    index: item.group_index,
                    group: item.is_group,
                });
            });
            that.$emit('animationMarkEvent', mark_arr);
        },
        // 移除标记
        remove_animation_mark() {
            this.$emit('animationMarkEvent', []);
        },

        /*  ----------------------------------- 动画 --- 增 -------------------------------  */
        // 添加元素动画面板打开，关闭
        create_animation_open() {
            if (!this.can_set_create_animation) {
                return;
            }
            this.show_create_animation_panel = true;
            this.toggle_display();
            // 收起切换面板
            if (this.element_animation_list.length) {
                this.switch_wrapper_fold();
            }
        },
        // 添加元素动画面板关闭
        create_animation_close() {
            this.toggle_display();
            this.show_create_animation_panel = false;
            this.create_animation_option = {
                'name': '',
                'start': 'click',
                'duration': 1,
                'index': [0, 0],
            };
        },
        // 创建 添加 元素动画参数设置
        set_create_animation_options(key, value) {
            let that = this;
            switch (key) {
                case 'start':
                    that.create_animation_option['start'] = value;
                    that.toggle_display('create_animation_start');
                    break;
                case 'duration':
                    // 获取数字
                    let date = Number(that.create_animation_option['duration']);
                    if (value === 'add') {
                        date += 0.5;
                    } else if (value === 'reduce') {
                        date -= 0.5;
                    }
                    if (isNaN(date)) date = 0;
                    if (date >= 10) date = 10;
                    if (date <= 0) date = 0;
                    that.create_animation_option['duration'] = Number(date.toFixed(2));
                    break;
                case 'name':
                    that.create_animation_option['name'] = value;
                    that.set_create_animation_save();
                    break;
            }
        },
        // 创建 添加 元素动画
        set_create_animation_save() {
            let that = this;
            let option = opt_factory.init_opt('group');
            let create_options = that.create_animation_option;
            // 根据最后一个动画的下标设置下标
            let list = that.element_animation_list;
            let is_click = create_options['start'] === 'click';
            if (list.length === 0) {
                create_options['index'] = [Number(is_click), 0];
            } else {
                let last = list[list.length - 1];
                if (is_click) {
                    create_options['index'] = [last.group_index + 1, 0];
                } else {
                    create_options['index'] = [last.group_index, last.item_index + 1];
                }
            }
            let $ele = option.get_checked_element().element;
            // 多选设置情况下，第一个元素不变，之后的元素默认 设置与上一项同时
            if ($ele.length > 1) {
                let $first = $ele.first();
                let $not_first = $ele.not(':first');
                // 第一个保持不变
                that.update_animation_attr($first, create_options);
                // 之后的修改为 与上一项同时
                create_options['start'] = 'same';
                that.update_animation_attr($not_first, create_options);
            } else {
                that.update_animation_attr($ele, create_options);
            }
            that.create_animation_close();
            // 预览元素动画
            setTimeout(() => {
                let uuid_arr = [];
                $ele.each((i, item) => {
                    uuid_arr.push($ele.attr('data-group') || $(item).attr('id'));
                });
                that.$nextTick(() => {
                    that.animation_preview(uuid_arr);
                });
            }, 500);
        },

        /*  ----------------------------------- 动画 --- 删 -------------------------------  */
        // 删除元素动画节点属性
        remove_animation_attr($ele) {
            if (!$ele || $ele.length === 0) {
                return;
            }
            $ele.removeAttr('data-animation-name');
        },
        // 删除元素动画，可删除多个
        remove_element_animation(item) {
            if (!item) {
                return;
            }
            // 当前需删除的在选中列表中，删除选中列表中所有元素
            this.selectedlist_include_element(item, ($ele) => {
                this.remove_animation_attr($ele);
            });
        },
        // 启用/禁用默认动画，删除/恢复当前页默认动画
        toggle_default_animation() {
            let that = this;
            let before = that.default_animation_close;
            let status = !before;
            // 关闭 / 打开默认动画
            that.default_animation_close = status ? 'page' : false;
            // 禁用当前页默认动画
            if (status) {
                page_opt.set_page_attr(that.$parent, that.page_info.uuid, 'defaultAnimation', true);
                that.element_default_animation('remove');
            } else {
                // 由 禁用全部文档页 切换至启用，则启用全部页默认动画并恢复
                if (before === 'document') {
                    that.set_default_animation_async_list(false);
                    that.element_default_animation('recovery', 'all');
                }
                // 由 禁用当前文档页 切换至启用，则启用当前页默认动画并恢复
                if (before === 'page') {
                    page_opt.set_page_attr(that.$parent, that.page_info.uuid, 'defaultAnimation', false);
                    that.element_default_animation('recovery');
                }
            }
        },
        // 单页/全部页 禁用默认动画
        default_animation_disable(status) {
            let that = this;
            if (that.default_animation_close === status) {
                return;
            }
            switch (status) {
                // 切换至禁用当前页默认动画，页属性禁用状态，全局属性开启状态
                case 'page':
                    that.default_animation_close = status;
                    that.set_default_animation_async_list(true);
                    page_opt.set_document_attr(that.$parent, 'defaultAnimation', false);
                    break;
                // 切换至禁用全部页默认动画，全部属性禁用状态
                case 'document':
                    that.default_animation_close = status;
                    that.set_default_animation_async_list(true);
                    that.element_default_animation('remove', 'all');
                    break;
            }
        },
        // 设置全局默认动画状态属性时，同步更新 page_list
        set_default_animation_async_list(status) {
            let that = this;
            page_opt.set_document_attr(that.$parent, 'defaultAnimation', !!status);
            // false状态下，set_document_attr不提供修改 page_list 的数据
            if (!status) {
                that.document_page_list.forEach(item => {
                    page_opt.set_page_attr(that.$parent, item.uuid, 'defaultAnimation', !!status);
                });
            }
        },
        // 同步画布内的元素默认动画状态 status = true(移除) false(恢复)  all = 是否处理全部文档页
        element_default_animation(state, is_all) {
            let that = this;
            let $page = opt_factory.init_opt('group').get_canvas_page();
            let status;
            // 删除动画属性
            if (state === 'remove') {
                that.remove_animation_attr($page.find('.ele_item[data-animation-default=true]'));
                status = true;
            }
            // 恢复动画
            if (state === 'recovery') {
                $page.find('.ele_item[data-animation-default=true]').attr('data-animation-name', page_opt.get_default_animation_name(that.$parent));
                status = false;
            }
            // 全部文档页默认动画删除/恢复
            if (is_all) {
                page_opt.document_default_animation_operate(that.$parent, status);
            }
        },

        /*  ----------------------------------- 动画 --- 改 -------------------------------  */
        // 展开动画编辑面板，展开第一个
        edit_animation_open_first() {
            if (!this.show_animation_modal) {
                return;
            }
            this.element_animation_editing = this.element_animation_selected[0];
        },
        // 打开动画编辑面板，动画列表选中、多选操作
        set_edit_animation(event, uuid) {
            let that = this;
            let option = opt_factory.init_opt('group');
            let ctrl = event && event.ctrlKey;
            let shift = event && event.shiftKey;
            that.toggle_display();
            // shift 多选
            if (shift) {
                let list = that.element_animation_list;
                let uuid_index = list.findIndex(item => item.uuid === uuid);
                // 选中列表有值时，添加最后选中项到指定项
                if (that.element_animation_selected.length) {
                    let last = that.element_animation_selected[that.element_animation_selected.length - 1];
                    let last_index = list.findIndex(item => item.uuid === last);
                    let min, max;
                    if (uuid_index > last_index) {
                        max = uuid_index;
                        min = last_index;
                    } else {
                        max = last_index;
                        min = uuid_index;
                    }
                    that.element_animation_selected = [];
                    for (let i = 0; i < list.length; i++) {
                        if (i < min || i > max) {
                            continue;
                        }
                        let item = list[i];
                        that.element_animation_selected.push(item.uuid);
                    }
                } else {
                    // 选中列表空时，添加第 0 个到指定项
                    for (let i = 0; i < list.length; i++) {
                        if (i > uuid_index) {
                            break;
                        }
                        let item = list[i];
                        that.element_animation_selected.push(item.uuid);
                    }
                }
                // 设置元素选中状态
                that.selectedlist_async_element(that.element_animation_selected);
            }
            // ctrl 多选
            else if (ctrl) {
                // 剔除
                if (that.element_animation_selected.includes(uuid)) {
                    let index = that.element_animation_selected.indexOf(uuid);
                    that.element_animation_selected.splice(index, 1);
                    // 同步剔除对应元素取消选中
                    option.get_element(uuid).removeClass('checked');
                } else {
                    that.element_animation_selected.push(uuid);
                }
                // 设置元素选中状态
                that.selectedlist_async_element(that.element_animation_selected);
            } else {
                // 面板展开状态
                if (that.element_animation_editing === uuid) {
                    that.element_animation_editing = null;
                    return;
                }
                // 点击已选中的列表
                if (that.element_animation_selected.includes(uuid)) {
                    that.edit_animation_open_first();
                    return;
                }
                // 单选元素
                that.$parent.ele_cancel_checked();
                // 设置元素选中
                that.$nextTick(() => {
                    that.element_animation_editing = uuid;
                    that.selectedlist_async_element([uuid]);
                });
            }
        },
        // 编辑元素动画参数设置，可编辑多个
        set_edit_animation_options(key, value) {
            let that = this;
            let item = utils.deepClone(that.element_animation_list).find(i => i.uuid === that.element_animation_editing);
            if (!item) {
                return;
            }
            let option = {};
            let selected_arr = that.selected_2_nodelist();
            switch (key) {
                case 'name':
                    that.toggle_display('edit_animation_name');
                    item.animation_name = value;
                    option['name'] = value;
                    if (selected_arr.length > 1) {
                        option['start'] = 'click';
                    }
                    break;
                case 'start':
                    that.toggle_display('edit_animation_start');
                    item.animation_start = value;
                    option['start'] = value;
                    break;
                case 'duration':
                    // 获取数字
                    let date = Number(item.animation_duration);
                    if (value === 'add') {
                        date += 0.5;
                    } else if (value === 'reduce') {
                        date -= 0.5;
                    }
                    if (isNaN(date)) date = 0;
                    if (date >= 10) date = 10;
                    if (date <= 0) date = 0;
                    item.animation_duration = Number(date.toFixed(2));
                    option['duration'] = Number(date.toFixed(2));
                    break;
            }
            // 多选设置情况下，之后的元素触发条件修改为与上一项同时
            let $first = selected_arr[0];
            if (selected_arr.length > 1) {
                // 第一个保持不变
                that.update_animation_attr($first, option);
                selected_arr.shift();
                // 之后的元素修改为 与上一项同时并调整到第一项排序之后
                option['start'] = 'same';
                option['index'] = [item.group_index, item.item_index + 0.1];
                selected_arr.forEach($el => {
                    that.update_animation_attr($el, option);
                });
            } else {
                that.update_animation_attr($first, option);
            }
            let uuid_arr = [item.uuid];
            if (that.element_animation_selected.includes(item.uuid)) {
                uuid_arr = that.element_animation_selected;
            }
            // 预览修改的元素动画
            setTimeout(() => {
                that.$nextTick(() => {
                    that.animation_preview(uuid_arr);
                });
            }, 500);
        },
        // 调整元素动画排序
        set_animation_sort(value) {
            let that = this;
            let option = opt_factory.init_opt('group');
            let list = utils.deepClone(that.element_animation_list);
            let checked_arr = that.element_animation_selected;
            let checked_item = list.filter(item => {
                if (checked_arr.indexOf(item.uuid) >= 0) {
                    return item;
                }
            });
            /**
             * 只移动（修改）所选元素第一个的前（后）一个元素
             * group_index 调整为与最后（第一个）相等；
             * item_index 调整为在最后（第一个）的基础上 +0.1（-0.1）（只 +或-0.1 是因为不与其他的item_index相等）
             * 修改dom后自动触发 update_animation_index() 进行重排
             */
            that.$nextTick(() => {
                let $ele;
                // 上移
                if (value === 'up' && that.can_animation_sort_up) {
                    let before = list[list.findIndex(item => item.uuid === checked_arr[0]) - 1];
                    before.group_index = checked_item[checked_item.length - 1].group_index;
                    before.item_index = checked_item[checked_item.length - 1].item_index + 0.1;
                    $ele = option.get_element(before.uuid);
                    that.update_animation_attr($ele, {
                        'index': [before.group_index, before.item_index],
                    });
                }
                // 下移
                if (value === 'down' && that.can_animation_sort_down) {
                    let after = list[list.findIndex(item => item.uuid === checked_arr[checked_arr.length - 1]) + 1];
                    after.group_index = checked_item[0].group_index;
                    after.item_index = checked_item[0].item_index - 0.1;
                    $ele = option.get_element(after.uuid);
                    that.update_animation_attr($ele, {
                        'index': [after.group_index, after.item_index],
                    });
                }
                // 多个选中项移动时，第一个之后的选中项触发条件改为 与上一项同时
                if (checked_item.length > 1) {
                    let first_item = checked_item.shift();
                    checked_item.forEach(item => {
                        that.update_animation_attr(option.get_element(item.uuid), {
                            'start': 'same',
                            'index': [first_item.group_index, first_item.item_index + 0.1],
                        });
                    });
                }
            });
        },

        /*  ----------------------------------- 动画 --- 查 -------------------------------  */
        // 返回指定 组动画 数组
        get_animation_group(index) {
            let arr = this.element_animation_list.filter(item => item.group_index == index);
            return utils.deepClone(arr);
        },
        // 检查指定元素是否有设置动画
        get_element_is_animation(uuid) {
            if (!uuid) {
                return false;
            }
            return !!this.element_animation_list.find(item => item.uuid === uuid);
        },
        // 设置动画列表选中，编辑器操作 选中 取消 元素 可触发
        animation_list_select() {
            let that = this;
            if (!that.show_animation_modal) {
                return;
            }
            let option = opt_factory.init_opt('group');
            let $ele = option.get_checked_element().element;
            let check_ele = [];
            // 获取所选元素 id 或 group
            $ele.each((index, item) => {
                let $item = $(item);
                check_ele.push($item.attr('data-group') || $item.attr('id'));
            });
            // data-group 去重
            that.element_selected = Array.from(new Set(check_ele));
            // 设置动画列表选中效果，过滤掉无动画元素
            let animation_list_uuid = utils.deepClone(that.element_animation_list.map(item => item.uuid));
            that.element_animation_selected = utils.arrayCompareSameList(animation_list_uuid, check_ele);
            // 选中元素准备操作，收起切换面板
            if (check_ele.length && that.element_animation_list.length) {
                that.switch_wrapper_fold();
            } else {
                // 取消选中，收起动画编辑面板
                that.element_animation_editing = null;
            }
        },
        // 根据选中元素判断是否可创建动画
        can_set_createandedit(arr) {
            let that = this;
            if (!that.show_animation_modal) {
                return;
            }
            that.show_create_animation_panel = false;
            /**
             * 元素选中数组 = arr
             * 动画元素选中数组 = that.element_animation_selected
             * 动画列表数组 = animation_list_uuid
             * 场景：
             * 1. 元素未选中，动画元素未选中（显示添加动画，不允许添加）
             * 2. 元素选中，动画元素未选中（显示添加动画按钮，允许添加）
             * 3. 元素选中数量 > 动画元素选中数量（显示添加动画按钮，允许添加，修改已存在动画的元素的动画）
             * 4. 元素选中数量 < 动画元素选中数量（显示编辑动画按钮）
             */
            let animation_list_uuid = utils.deepClone(that.element_animation_list.map(item => item.uuid));
            // 场景 1
            if (!arr || arr.length === 0) {
                that.show_createandedit = true;
                that.can_set_create_animation = false;
                return;
            }
            // 场景 2
            if (that.element_animation_selected.length === 0) {
                that.show_createandedit = true;
                that.can_set_create_animation = true;
                return;
            }
            // 场景 3
            if (arr.length > that.element_animation_selected.length) {
                that.show_createandedit = true;
                that.can_set_create_animation = true;
                return;
            }
            // 场景 4
            if (arr.length <= that.element_animation_selected.length) {
                that.show_createandedit = false;
                that.can_set_create_animation = false;
                return;
            }
        },
        // 根据选中的元素判断是否可上下移动
        can_set_sort(arr) {
            let that = this;
            if (!that.show_animation_modal) {
                return;
            }
            if (!arr || arr.length === 0) {
                that.can_animation_sort_up = false;
                that.can_animation_sort_down = false;
                return;
            }
            // 如果选中的元素已有动画，更新是否可调整排序状态
            let animation_list_uuid = utils.deepClone(that.element_animation_list.map(item => item.uuid));
            let checked_arr = utils.arrayCompareSameList(animation_list_uuid, arr);
            if (checked_arr.length === 0) {
                that.can_animation_sort_up = false;
                that.can_animation_sort_down = false;
                return;
            }
            that.can_animation_sort_up = checked_arr[0] !== animation_list_uuid[0];
            that.can_animation_sort_down = checked_arr[checked_arr.length - 1] !== animation_list_uuid[animation_list_uuid.length - 1];
        },
        // 获取关闭默认动画状态
        get_default_animation() {
            let that = this;
            let status = false;
            // attr.defaultAnimation： false(启用默认动画)  true(禁用默认动画)
            if (that.doc_info.attr && that.doc_info.attr['defaultAnimation']) {
                status = 'document';
            } else if (that.page_info.attr && that.page_info.attr['defaultAnimation']) {
                status = 'page';
            }
            that.default_animation_close = status;
            return status;
        },
        // 查询指定 uuid 是否在选中列表中，回调参数返回画布中的元素节点
        selectedlist_include_element(obj, callback) {
            let item = obj || {};
            let option = opt_factory.init_opt('group');
            if (this.element_animation_selected.includes(item.uuid)) {
                this.element_animation_selected.forEach(uuid => {
                    let $ele = option.get_element(uuid);
                    if (typeof callback === 'function') callback($ele);
                });
            } else {
                let $ele = option.get_element(item.uuid);
                if (typeof callback === 'function') callback($ele);
            }
        },
        // 动画列表选中项转 jq 数组
        selected_2_nodelist() {
            let option = opt_factory.init_opt('group');
            return this.element_animation_selected.map(item => {
                return option.get_element(item);
            });
        },
        // 根据 元素动画列表选中 同步到 画布元素选中
        selectedlist_async_element: function (uuidlist) {
            let that  = this;
            if (!Array.isArray(uuidlist) || uuidlist.length === 0) {
                return;
            }
            let option = opt_factory.init_opt('group');
            uuidlist.forEach(item => {
                option.get_element(item).addClass('checked');
            });
            let $ele = option.get_checked_element().element;
            that.$parent.set_ele_checked($ele);
        },
    }
};
</script>

<style lang="less" scoped>
@text_color: #444444;
// 下拉模块
.pull_module {
    position: relative;
    height: 28px;
    line-height: 26px; 
    padding-left: 10px;
    text-align: left;
    background-color: #ffffff;
    border-radius: 4px;
    border: solid 1px #dddddd;
    transition: all 0.3s;
    cursor: pointer;
    .pull_module_btn {
        display: block;
        width: 100%;
        height: 100%;
        color: @text_color;
        font-size: 12px;
        &::after {
            content: "";
            position: absolute;
            right: 7px;
            top: 11px;
            width: 0;
            height: 0;
            border-width: 4px;
            border-style: solid;
            border-color: #999999 transparent transparent transparent;
            transition: all 0.3s;
        }
    }
    &.show,
    &:hover {
        background-color: #eeeeee;
    }
    &.show{
        .pull_module_btn:after {
            top: 6px;
            transform: rotate(180deg);
        }
    }
    .module_display {
        display: inline-block;
        vertical-align: middle;
        width: 80%;
        height: 100%;
        color: @text_color;
        font-size: 12px;
    }
    .module_list {
        position: absolute;
        top: 28px;
        left: 0;
        width: 100%;
        height: auto;
        padding: 9px 5px;
        color: @text_color;
        font-size: 12px;
        text-align: left;
        background-color: #ffffff;
        box-shadow: 0px 0px 20px 0px rgba(180,187,199,0.20); 
        border: solid 1px #eeeeee;
        border-radius: 3px;
        z-index: 99;
        li {
            position: relative;
            display: block;
            width: 100%;
            height: 28px;
            line-height: 28px;
            padding-left: 13px;
            border-radius: 2px;
            &:hover {
                background-color: #f4f4f4;
            }
            .base-icon {
                float: right;
                color: @text_color;
                transform: translate(-5px, 1px);
            }
        }
    }
}
// 圆角开关式按钮
.switch-round-btn {
    position: relative;
    display: inline-block;
    width: 28px;
    height: 16px;
    background-color: #dddddd;
	border-radius: 8px;
    cursor: pointer;
    transition: all 0.3s;
    &::before {
        content: "";
        position: absolute;
        top: 2px;
        left: 2px;
        right: auto;
        width: 12px;
        height: 12px;
        border-radius: 50%;
        background-color: #ffffff;
        transition: all 0.3s;
    }
    &.true {
        background-color: var(--mainColor);
        &::before {
            left: auto;
            right: 2px;
        }
    }
}

.animation-modal-contain {
    position: absolute;
    padding: 0 25px;
    width: 290px;
    overflow-y: auto;
    span {
        font-size: 12px;
        color: @text_color;
    }
    // 面板head
    .modal-head {
        .title {
            height: 60px;
            line-height: 60px;
            color: @text_color;
            font-size: 14px;
        }
        .close {
            position: absolute;
            right: 20px;
            width: 30px;
            height: 30px;
            top: 14px;
            text-align: center;
            transform: scale(0.8);
            transition: all 0.3s;
            &:hover {
                transform: rotate(180deg) scale(0.8);
            }
        }
    }
    // 添加动画按钮
    // 编辑动画按钮
    .animation-block-btn {
        width: 100%;
        height: 48px;
        line-height: 48px;
        margin: 30px 0 15px;
        border: 1px dashed #cccccc;
        border-radius: 6px;
        text-align: center;
        color: var(--mainColor);
        font-size: 12px;
        &:not(.disable):hover {
            border-color: var(--mainColor);
        }
        .base-icon{
            margin-right: 9px;
            transform: translateY(1px);
        }
        &.disable {
            cursor: no-drop;
            color: #959dad;
            background-color: #f1f1f1;
        }
    }
    // 添加动画面板
    .add-animation-wrapper {
        position: absolute;
        top: 170px;
        left: 25px;
        width: 240px;
        z-index: 11;
        background-color: #ffffff;
        border: 1px solid #eeeeee;
        border-radius: 3px;
        box-shadow: 0px 0px 20px 0px rgba(180,187,199,0.20); 
        .setting-wrapper {
            width: 100%;
            height: 100%;
            padding: 20px 30px;
            overflow-x: hidden;
            overflow-y: auto;
            .item {
                width: 100%;
                height: 28px;
                line-height: 28px;
                margin-bottom: 10px;
                font-size: 12px;
                color: #666666;
                &:last-of-type{
                    margin-bottom: 20px;
                }
                .setting-start {
                    float: right;
                    width: 138px;
                }
                .setting-time {
                    float: right;
                    position: relative;
                    width: 138px;
                    height: 28px;
                    border-radius: 3px;
                    border: solid 1px #dddddd;
                    background-color: #ffffff;
                    input {
                        display: block;
                        width: calc(100% - 25px);
                        height: 100%;
                        border: none;
                        outline: none;
                        padding: 0 6px;
                    }
                    .tune {
                        position: absolute;
                        right: 0;
                        top: 0;
                        width: 25px;
                        height: 100%;
                        border-left: 1px solid #cdd2de;
                        .add,
                        .reduce {
                            display: block;
                            position: relative;
                            width: 100%;
                            height: 50%;
                            &::after {
                                content: "";
                                position: absolute;
                                top: 0;
                                left: 50%;
                                margin-left: -4px;
                                width: 0;
                                height: 0;
                                border-width: 4px;
                                border-style: solid;
                            }
                        }
                        .add::after {
                            border-color: transparent transparent #9aa2ae transparent;
                        }
                        .reduce::after {
                            top: 4px;
                            border-color: #9aa2ae transparent transparent transparent;
                        }
                    }
                }
            }
        }
    }
}
.modal-body {
    width: 100%;
    .body-nav {
        height: 30px;
        border-bottom: 1px solid #eeeeee;
        span{
            padding-bottom: 10px;
            margin-right: 36px;
            cursor: pointer;
            transition: all .2s;
            &:hover {
                opacity: .7; 
            }
        }
        .current{
            color: var(--mainColor);
            border-bottom: 2px solid var(--mainColor);
            &:hover{
                opacity: 1;
            }
        }
    }
    .wrapper {
        .wrapper-item {
            height: 24px;
            line-height: 24px;
            margin-bottom: 12px;
            &:last-of-type {
                margin-bottom: 0;
            }
            button{
                background: transparent;
                border-radius: 2px;
                transition: all .2s;
                cursor: pointer;
                &:hover{
                    background: #eeeeee;
                }
            }
            .preview {
                width: 60px;
                height: 100%;
                text-align: center;
                .base-icon{
                    width: 16px;
                    height: 16px;
                    line-height: 16px;
                    padding-left: 1px;
                    margin-right: 8px;
                    border-radius: 50%;
                    background: var(--mainColor);
                    text-align: center;
                }
            }
        }
    }
    // 文档页切换设置面板
    .switch-wrapper {
        margin-top: 20px;
        .switch-mode {
            float: right;
            width: 156px;
        }
        .switch-list{
            ul {
                flex-wrap: wrap;
            }
            li {
                width: 72px;
                height: 72px;
                margin-bottom: 12px;
                line-height: 70px;
                border: 1px dashed #cccccc;
                background-color: transparent;
                border-radius: 6px;
                text-align: center;
                font-size: 12px;
                color: #666666;
                cursor: pointer;
                transition: all .2s;
                &:hover{
                    background-color: #f4f4f4;
                }
                &.checked {
                    border-color: var(--mainColor);
                }
            }
        }
        .switch-all {
            .switch-round-btn {
                position: relative;
                float: right;
                top: 6px;
            }
        }
    }
    // 元素动画面板
    .element-wrapper {
        position: relative;
        .sort {
            .up,
            .down {
                width: 24px;
                height: 24px;
                &.disable {
                    opacity: 0.6;
                    cursor: no-drop;
                    &:hover {
                        background-color: transparent;
                    }
                }
            }
            .down {
                margin-left: 10px;
            }
        }
        .default {
            position: relative;
            height: auto;
            .default_animation {
                position: absolute;
                bottom: 0;
                right: 0;
                width: 120px;
            }
        }
        .empty {
            width: 100%;
            margin: 50px 0;
            text-align: center;
            user-select: none;
            img {
                width: 150px;
            }
            p {
                line-height: 20px;
                color: #c9c9c9;
                font-size: 12px;
            }
        }
    }
}
// 元素动画列表
.element-animation-group {
    position: relative;
    margin-top: 18px;
    padding-top: 30px;
    border-top: 1px solid #eeeeee;
    & > ul {
        background-color: #ffffff;
        & > li {
            position: relative;
            width: 100%;
            height: 32px;
            line-height: 32px;
            margin-bottom: 10px;
            font-size: 0;
            cursor: pointer;
            overflow: hidden;
            transition: all 0.15s;
            color: @text_color;
            .index{
                margin-right: 12px;
                font-size: 12px;
            }
            .animate-item{
                display: inline-block;
                vertical-align: top;
                height: 100%;
                width: calc(100% - 20px);
                padding: 0 10px;
                border: solid 1px #d9e0eb;
                border-radius: 3px;
            }
            &:hover {
                .play,
                .delete {
                    opacity: 1;
                }
                .effect {
                    opacity: 0;
                }
            }
            // 选中动画列表
            &.checked .animate-item{
                border-color: var(--mainColor);
            }
            // 二级编辑元素动画列表
            &.editing{
                height: 150px;
                overflow: visible;
                .effect,
                .play {
                    display: none;
                }
                .delete {
                    opacity: 1;
                }
                .edit-wrapper {
                    display: block;
                    line-height: 1.4;
                }
                .edit-wrapper-effect {
                    margin-bottom: 10px;
                    .animation-preview-list {
                        padding: 10px 30px;
                    }
                }
                .edit-wrapper-item {
                    width: 100%;
                    height: 25px;
                    line-height: 25px;
                    margin-bottom: 10px;
                    font-size: 12px;
                    color: #707b8e;
                    .setting-start {
                        float: right;
                        width: 120px;
                    }
                    .setting-time {
                        float: right;
                        position: relative;
                        width: 120px;
                        height: 25px;
                        border-radius: 2px;
                        border: solid 1px #cdd2de;
                        background-color: #ffffff;
                        input {
                            display: block;
                            width: calc(100% - 25px);
                            height: 100%;
                            border: none;
                            outline: none;
                            padding: 0 6px;
                        }
                        .tune {
                            position: absolute;
                            right: 0;
                            top: 0;
                            width: 25px;
                            height: 100%;
                            border-left: 1px solid #cdd2de;
                            .add,
                            .reduce {
                                display: block;
                                position: relative;
                                width: 100%;
                                height: 50%;
                                &::after {
                                    content: "";
                                    position: absolute;
                                    top: 0;
                                    left: 50%;
                                    margin-left: -4px;
                                    width: 0;
                                    height: 0;
                                    border-width: 4px;
                                    border-style: solid;
                                }
                            }
                            .add::after {
                                border-color: transparent transparent #9aa2ae transparent;
                            }
                            .reduce::after {
                                top: 4px;
                                border-color: #9aa2ae transparent transparent transparent;
                            }
                        }
                    }
                }
            }
            .base-icon.icondonghuaxiao {
                margin-right: 10px;
                color: #666666;
                transform: translateY(1px);
            }
            .type {
                color: @text_color;
                font-size: 12px;
            }
            .effect {
                float: right;
                font-size: 12px;
                color: #666666;
                opacity: 1;
                transition: opacity 0.2s;
            }
            .play,
            .delete {
                position: absolute;
                top: 4px;
                z-index: 2;
                width: 24px;
                height: 24px;
                border-radius: 2px;
                text-align: center;
                opacity: 0;
                transition: opacity 0.2s;
                overflow: hidden;
                &:hover{
                    background-color: #eeeeee;
                }
            }
            .play {
                right: 48px;
                .base-icon{
                    width: 15px;
                    height: 15px;
                    line-height: 15px;
                    padding-left: 1px;
                    border-radius: 50%;
                    background-color: var(--mainColor);
                    text-align: center;
                }
            }
            .delete {
                right: 18px;
            }
            .open-focus {
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                z-index: 1;
                height: 32px;
                opacity: 0;
            }
        }
    }
}
// 动画设置预览列表
.animation-preview-list.module_list,
.animation-preview-list {
    width: 100%;
    height: auto;
    padding-top: 10px;
    border-top: 1px solid #eeeeee;
    li {
        position: relative;
        width: calc(100% + 40px);
        height: 56px;
        padding: 0 20px;
        transform: translateX(-20px);
        border: 1px solid transparent;
        border-radius: 4px;
        cursor: pointer;
        user-select: none;
        transition: 0.1s;
        span {
            line-height: 56px;
            font-size: 12px;
            color: @text_color;
        }
        &.checked,
        &.checked:hover {
            border-color: var(--mainColor);
            background-color: rgba(0,91,255,0.10);
        }
        &:hover {
            background-color: #f4f4f4;
            border-color: #dddddd;
            .hover-preview {
                &.fade {
                    i {
                        display: none;
                    }
                    &::before {
                        opacity: 1;
                        transition: opacity 1s;
                    }
                }
                &.leftFly {
                    i {
                        display: none;
                    }
                    &::before {
                        right: 10px;
                        transition: right 0.6s;
                    }
                }
                &.rightFly {
                    i {
                        display: none;
                    }
                    &::before {
                        right: 34px;
                        transition: right 0.6s;
                    }
                }
                &.topFly {
                    i {
                        display: none;
                    }
                    &::before {
                        top: 27px;
                        transition: top 0.6s;
                    }
                }
                &.bottomFly {
                    i {
                        display: none;
                    }
                    &::before {
                        top: 9px;
                        transition: top 0.6s;
                    }
                }
                &.enlarge {
                    i {
                        display: none;
                    }
                    &::before {
                        transform: scale(1.5);
                        transition: transform 0.6s;
                    }
                }
                &.narrow {
                    i {
                        display: none;
                    }
                    &::before {
                        transform: scale(1);
                        transition: transform 0.6s;
                    }
                }
                &.rotate {
                    i {
                        display: none;
                    }
                    &::before {
                        transform: rotateY(360deg);
                        transition: transform 1s, opacity 1s;
                        opacity: 1;
                    }
                }
                &.appear {
                    &::before {
                        animation-name: appear;
                        animation-delay: 0.5s;
                        animation-fill-mode: both;
                    }
                }
            }
        }
        .hover-preview {
            float: right;
            position: relative;
            width: 68px;
            height: 50px;
            i {
                display: none;
            }
            &::before {
                content: "";
                position: absolute;
                z-index: 1;
                width: 12px;
                height: 12px;
                border-radius: 50%;
                background-color: var(--mainColor);
            }
            &.fade {
                &::before {
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    margin: auto;
                    opacity: 0;
                }
                .edit-ico-animate_fade {
                    display: block;
                    position: absolute;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    margin: auto;
                }
            }
            &.leftFly {
                &::before {
                    top: 50%;
                    right: 45px;
                    margin-top: -6px;
                }
                &::after {
                    content: "";
                    position: absolute;
                    top: 50%;
                    right: 0;
                    margin-top: -11px;
                    width: 30px;
                    height: 20px;
                    border: 1px dashed #88909c;
                }
                .edit-ico-animate_rightfly {
                    display: block;
                    position: absolute;
                    right: 20px;
                    top: 50%;
                    margin-top: -6px;
                }
            }
            &.rightFly {
                &::before {
                    top: 50%;
                    right: 0;
                    margin-top: -6px;
                }
                &::after {
                    content: "";
                    position: absolute;
                    top: 50%;
                    right: 24px;
                    margin-top: -11px;
                    width: 30px;
                    height: 20px;
                    border: 1px dashed #88909c;
                }
                .edit-ico-animate_leftfly {
                    display: block;
                    position: absolute;
                    right: 20px;
                    top: 50%;
                    margin-top: -6px;
                }
            }
            &.topFly {
                &::before {
                    top: 4px;
                    right: 9px;
                }
                &::after {
                    content: "";
                    position: absolute;
                    top: 22px;
                    right: 0;
                    width: 30px;
                    height: 20px;
                    border: 1px dashed #88909c;
                }
                .edit-ico-animate_bottomfly {
                    display: block;
                    position: absolute;
                    right: 9px;
                    top: 18px;
                }
            }
            &.bottomFly {
                &::before {
                    top: 33px;
                    right: 9px;
                }
                &::after {
                    content: "";
                    position: absolute;
                    top: 4px;
                    right: 0;
                    width: 30px;
                    height: 20px;
                    border: 1px dashed #88909c;
                }
                .edit-ico-animate_topfly {
                    display: block;
                    position: absolute;
                    right: 9px;
                    top: 16px;
                }
            }
            &.enlarge {
                &::before {
                    top: 20px;
                    right: 11px;
                    transform: scale(1);
                }
                &::after {
                    content: "";
                    position: absolute;
                    top: 50%;
                    right: 0;
                    margin-top: -16px;
                    width: 32px;
                    height: 32px;
                    border: 1px dashed #88909c;
                }
                .edit-ico-animate_enlarge {
                    display: block;
                    position: absolute;
                    right: 4px;
                    top: 14px;
                }
            }
            &.narrow {
                &::before {
                    top: 20px;
                    right: 11px;
                    transform: scale(1.5);
                }
                &::after {
                    content: "";
                    position: absolute;
                    top: 50%;
                    right: 0;
                    margin-top: -16px;
                    width: 32px;
                    height: 32px;
                    border: 1px dashed #88909c;
                }
                .edit-ico-animate_narrow {
                    display: block;
                    position: absolute;
                    right: 4px;
                    top: 14px;
                }
            }
            &.rotate {
                &::before {
                    top: 20px;
                    right: 11px;
                    transform: rotateY(0deg);
                    opacity: 0;
                }
                .edit-ico-animate_rotate {
                    display: block;
                    position: absolute;
                    right: 4px;
                    top: 16px;
                }
            }
            &.appear {
                &::before {
                    top: 50%;
                    right: 11px;
                    margin-top: -6px;
                    visibility: hidden;
                }
                &::after {
                    content: "";
                    position: absolute;
                    top: 50%;
                    right: 0;
                    margin-top: -16px;
                    width: 32px;
                    height: 32px;
                    border: 1px dashed #88909c;
                }
            }
        }
    }
}
.pull_module .module_list.animation-preview-list li.checked {
    &::after {
        position: absolute;
        top: 55px;
        left: 10px;
        right: 10px;
        height: 1px;
        width: 100%;
        margin-top: 0;
        border: none;
        transform: none;
        background-color: #e1e7f1;
    }
}
// 元素动画 出现 设置动画延时
@keyframes appear {
    0% { visibility: hidden; }
    100% { visibility: visible; }
}
// 动画预览容器
.animation-preview-container {
    position: fixed;
    top: 0;
    left: 0;
    width: 0;
    height: 0;
}
</style>