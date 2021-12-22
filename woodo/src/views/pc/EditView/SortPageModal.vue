<template>
    <div class="sort_modal_contain" :class="[sort_modal_type === 'side' ? 'sort_side_modal' : 'sort_full_modal']">
        <div class="sort_modal" @click.stop>
            <!-- 头部 -->
            <!-- 侧栏 -->
            <div class="sort_side_head" v-if="sort_modal_type !== 'full'">
                <button class="add_page_btn" @click="add_page(current_page_uuid)" v-tooltip="`点击新建 CTRL+M`" v-bdtongji="'编辑器-序列表-左侧-左侧-新建幻灯片'">
                    <span>新建页面</span>
                </button>
                <button class="preset_page_btn" :class="{show:preset_modal_show}" @click="show_preset_modal()" v-tooltip="`预设版式`" v-bdtongji="'编辑器-序列表-左侧-左侧-预设版式'">
                    <base-icon class="iconxialaxuanxiangtianchong"></base-icon>
                </button>
                <!-- 预设版式、自定义版式弹框 -->
                <transition name="modal-fade">
                    <div class="preset_layout_modal" v-if="preset_modal_show">
                        <div class="select-format">
                            <ul>
                                <li :class="{current: format_type === 'default'}" @click="format_type = 'default'">预设版式</li>
                                <li :class="{current: format_type === 'create'}" @click="format_type = 'create'">自定义版式</li>
                            </ul>
                        </div>
                        <div class="preset_list_container" v-show="format_type === 'default'">
                            <div class="preset-item" v-for="item in preset_page_list" :key="item.id" @click="add_preset_page(item,true)">
                                <img :src="item.image">
                            </div>
                        </div>
                        <div class="custom_list_container" v-show="format_type === 'create'">
                            <div class="custom-wrap add_custom_page" @click="open_custom('')">
                                <base-icon class="icontianjia1"></base-icon>
                                <span>创建版式</span>
                            </div>
                            <div class="custom-wrap" v-for="(item, index) in custom_preset_list" :key="index">
                                <div class="custom-item">
                                    <img :src="item.image">
                                    <div class="custom_masking">
                                        <button class="use_btn" v-tooltip="`使用`" @click="use_custom(item.id)">
                                            <base-icon class="iconcharu"></base-icon>
                                        </button>
                                        <button class="delete_btn" v-tooltip="`删除`" @click="delete_custom(item.id, index)">
                                            <base-icon class="iconshanchutianchong"></base-icon>
                                        </button>
                                        <button class="edit_btn" v-tooltip="`编辑`" @click="open_custom(item.id)">
                                            <base-icon class="iconbeizhu"></base-icon>
                                        </button>
                                    </div>
                                </div>
                                <div class="page_title"> {{item.name}}</div>
                            </div>
                        </div>
                    </div>
                </transition>
            </div>
            <!-- 平铺 -->
            <div class="sort_full_head" v-else>
                <div class="show_page_number">
                    <span>{{ current_page_index }}</span>/<span>&nbsp;&nbsp;{{sort_document_page_list.length}}</span>
                </div>
                <div class="close_sort_modal edit-ico edit-ico-close_1" @click="change_sort_modal_type('side')"></div>
            </div>
            <!-- 头部 end -->

            <!-- 序列表主体 -->
            <div class="sort_modal_body">
                <div :class="['sort_list', { drag_page: is_drag_page }]" @click="show_menu_id = null">
                    <draggable v-model="sort_document_page_list" class="draggable_container"
                        :options="{
                            disabled: !can_sort,
                            draggable: '.list',
                            handle: '.list',
                            ghostClass: 'drag-holder',
                            filter: '.setting',
                            fallbackClass: 'draggingStyle',
                            forceFallback: true,
                        }" @start="start_drag" @update="sort" @end="end_drag">
                        <div class="list svg_list" v-for="(item,index) in sort_document_page_list" :key="item.uuid" :style="{width: `${svg_template.w}px`}" @click="is_select = true" :class="{'list-check': item.uuid === current_page_uuid || selected_page_list.indexOf(item.uuid) > -1}" @dblclick="sort_modal_type === 'full' && edit_page(item.uuid)" @mousedown="drag_page">
                            <div class="svg_masking" v-if="sort_modal_type === 'side'"></div>
                            <!-- 页码 -->
                            <span class="svg_number">{{index+1}}</span>
                            <!-- 评论数 -->
                            <span class="svg_comment" @click="$parent.toggle_comment_modal(true)" v-tooltip="`评论数`" v-if="item.uuid === current_page_uuid && sort_modal_type === 'full'">{{comment_map[item.id] || 0}}</span>
                            <!-- 内容 -->
                            <div :class="['svg_content', { 'multiple': is_batching }]"  @mousemove.prevent @click="select_page($event,item)" :data-id="item.uuid" :style="{'width': `${sort_modal_type === 'full' ? svg_template.w - 2 : svg_template.w}px`, 'height': `${sort_modal_type === 'full' ? svg_template.h - 2 : svg_template.h}px`}">
                                <svg-modal :svg_w="svg_template.w" :svg_h="svg_template.h" :svg_view="svg_template.view" :document="sort_document_info" :page_info="item" :lazyshow="(Math.abs(index - current_page_index) < batch_lazyshow) || (!!lazyshow_map[item.uuid])"></svg-modal>
                                <template v-if="item.uuid === current_page_uuid || selected_page_list.indexOf(item.uuid) > -1">
                                    <div class="setting" @click.stop="showRightMenu($event)">
                                        <base-icon class="iconshezhi1"></base-icon>
                                    </div>
                                </template>
                            </div>
                        </div>
                    </draggable>
                </div>
                <!-- 右键菜单 -->
                <div class="right_menu_modal" v-if="show_menu_id">
                    <ul>
                        <li class="copy" @click.stop="copy_page(show_menu_id)">
                            <base-icon class="iconfuzhi1"></base-icon><span>复制</span>
                        </li>
                        <li class="delete" @click.stop="delete_page(show_menu_id)">
                            <base-icon class="iconhuishouzhan"></base-icon><span>删除</span>
                        </li>
                        <li class="comment" @click.stop="$parent.add_comment">
                            <base-icon class="iconpinglun"></base-icon><span>添加评论</span>
                        </li>
                        <li class="page-bg" @click.stop="!$parent.user_disable_edit && togglePageBackground($event)">
                            <base-icon class="iconhuabubeijing"></base-icon>
                            <span>画布背景</span>
                            <!-- 背景色/图设置 -->
                            <transition name="modal-fade">
                                <div class="page_background_modal" v-if="show_page_background" @mousedown.stop @click.stop="show_menu_id = null">
                                    <div class="set_page_color">
                                        <div class="set_title" @click="$parent.open_background_setting($parent.page_info.background.type === 'gradient' ? 'gradient' : 'color')">
                                            <span>背景色</span>
                                            <i v-if="$parent.page_info.background.type !== 'gradient'" :style="{background: $parent.page_info.background.color}"></i>
                                            <i v-else :style="{background: $parent.page_gradientStr}"></i>
                                        </div>
                                    </div>
                                    <div class="set_page_image" :class="{checked: $parent.page_info.background.image && $parent.page_info.background.image.src}">
                                        <div class="set_title" @click="$parent.page_info.background.image || $parent.open_background_setting('image')">
                                            <span>背景图</span>
                                            <i @click="$parent.remove_background_image">删除</i>
                                        </div>
                                        <div class="show_page_image" v-if="$parent.page_info.background.image && $parent.page_info.background.image.src !== ''">
                                            <button @click="$parent.open_background_setting">更换</button>
                                            <img :src="$parent.page_info.background.image.src">
                                            <div class="set_page_image_type">
                                                <span @click="$parent.change_background_type('cover')">铺满<i class="edit-ico edit-ico-check_blue" v-if="$parent.page_info.background.image.type === 'cover'"></i></span>
                                                <span @click="$parent.change_background_type('repeat')">平铺<i class="edit-ico edit-ico-check_blue" v-if="$parent.page_info.background.image.type === 'repeat'"></i></span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </transition>
                        </li>
                        <li class="up_new_page" @click.stop="add_page(show_menu_id,'up')">
                            <base-icon class="iconxiangshangxinjian"></base-icon><span>向上新建页</span>
                        </li>
                        <li class="down_new_page" @click.stop="add_page(show_menu_id,'down')">
                            <base-icon class="iconxiangxiaxinjian"></base-icon><span>向下新建页</span>
                        </li>
                    </ul>
                </div>
            </div>
            <!-- 序列表主体 end -->

        </div>
        <div class="resetting_animation" v-if="page_resetting && sort_modal_type === 'full'">
            <img src="~@/assets/pc/images/edit/sort_loading.gif">
        </div>
    </div>
</template>

<script>
import draggable from 'vuedraggable'
import SvgModal from '@/components/SvgPageModal.vue'
import page_opt from '@/assets/pc/js/opt/page_opt.js'
import opt_factory from '@/assets/pc/js/opt/opt_factory.js'
export default {
    name: 'sort_modal',
    components: {
        draggable,
        SvgModal,
    },
    props: {
        document_info: {
            type: Object,
            default: () => {
                return {}
            },
        },
        page_info: {
            type: Object,
            default: () => {
                return {}
            },
        },
        document_page_list: {
            type: Array,
            default: () => {
                return [];
            },
        },
        document_loaddone: Boolean,
        comment_map: Object,
    },
    data() {
        return {
            format_type: 'default',             // 版式  default = 预设版式  create = 自定义版式
            can_sort: true,                     // 可拖动标识
            update_debounce: null,              // 防抖
            is_select: false,                   // 选中标识
            page_resetting: true,               // 加载动效
            list_no_scroll: false,              // 列表是否允许滚动标识
            show_menu_id: null,                 // 右键菜单标识
            sort_modal_type: 'side',            // 序列表展示模式
            show_page_background: false,        // 画布背景弹框

            // 文档
            sort_document_info: {},
            sort_document_page_list: [],
            current_page_uuid: null,
            current_page_index: 0,
            selected_page_list: [],
            svg_template: {
                w: 350,
                h: 0,
                view: [0, 0, 0, 0]
            },
            batch_lazyshow: 5,
            lazyshow_map: {},

            // 预设版式
            preset_modal_show: false,           // 预设弹框展示标识
            preset_page_list: [],               // 预设版式列表
            custom_preset_list: [],              // 自定义预设版式列表
            initial_preset_count: null,         // 初始显示的预设版式数量，根据屏幕宽度显示
            show_more_preset: false,            // 提示可展示更多标识

            drag_page_offset: '',               // 移动幻灯片的鼠标事件
            is_drag_page: false,                // 判断是否正在移动幻灯片
        }
    },
    watch: {
        document_info: {
            handler(value) {
                this.sort_document_info = value;
            },
            deep: true
        },
        page_info: {
            handler(value, old) {
                this.current_page_uuid = value.uuid;
                this.current_page_index = this.get_pagenumber();
                if (old.uuid !== this.current_page_uuid) {
                    this.sort_list_position();
                }
            },
            deep: true
        },
        document_page_list: {
            handler(value) {
                this.sort_document_page_list = value;
                if (!this.selected_page_list.length) {
                    this.clear_selected_page_list();
                };
            },
            deep: true
        },
        document_loaddone(n) {
            if (n) {
                this.$nextTick(() => {
                    this.initial_list_data();
                    this.show();
                });
            }
        }
    },
    mounted() {
        let that = this;
        // 拖拽列表滚动监听
        $('.sort_modal_contain .draggable_container, .sort_modal_contain .sort_list').on('scroll', that.drag_scroll);
        // 键盘事件监听
        $(document).on('keydown', function (event) {
            let e = event || window.event;
            if(!that.is_select) return;
            //监听delete键删除
            if (!e.ctrlKey && !(e.metaKey && utils.deviceENV().mac) && !e.shiftKey && !e.altKey && e.keyCode === 46) {
                switch (that.sort_modal_type) {
                    // 平铺状态 
                    case 'full':
                        // 单选状态
                        if (that.selected_page_list.length === 0) {
                            page_opt.delete(that.$parent, that.current_page_uuid);
                        } else {
                            // 多选状态
                            that.selected_page_list.forEach(item => {
                                page_opt.delete(that.$parent, item);
                            });
                        }
                        break;
                    // 列表状态
                    case 'side':
                        // 单选状态且页面中没有选中元素
                        if (that.selected_page_list.length > 0) {
                            // 多选状态
                            that.selected_page_list.forEach(item => {
                                page_opt.delete(that.$parent, item);
                            });
                        }else{
                            that.delete_page(that.page_info.uuid);
                        }
                        break;
                }
                that.clear_selected_page_list();
            }
        });
        
    },
    methods: {
        // 打开序列表弹框
        show: function () {
            let that = this;
            that.page_resetting = false;
            // 计算序列表位置
            that.sort_list_position();
        },
        // 初始化计算列表数据
        initial_list_data: function (callback) {
            let that = this;
            let list_height = $('.draggable_container').height();
            let contain_w = that.sort_modal_type === 'side' ? $('.edit_left').width() - 6 : $('.sort_modal').width() - 6;
            let page_scale = Number(that.document_info.width) / Number(that.document_info.height);
            let item_base_w = 430;
            let item_count = 1;
            let _padding;
            let _margin = 40;
            if (that.sort_modal_type === 'side') {
                _padding = 32;
            } else {
                // 计算单行显示个数
                item_count = Math.floor(contain_w / item_base_w);
                _padding = 40;
                _margin = 60;
            }
            // 计算单项宽高
            let item_w = (contain_w / item_count) - _padding;
            let item_h = item_w / page_scale;
            // svg模板渲染相关数据
            that.svg_template.w = item_w;
            that.svg_template.h = item_h;
            that.svg_template.view[0] = 0;
            that.svg_template.view[1] = 0;
            that.svg_template.view[2] = that.document_info.width;
            that.svg_template.view[3] = that.document_info.height;
            // 更新一屏显示个数
            that.batch_lazyshow = Math.ceil(list_height / (item_h + _margin)) * item_count;
            if (typeof callback === 'function') callback();
        },
        // 计算序列表位置
        sort_list_position: function () {
            let that = this;
            // 左侧排列时
            if (that.sort_modal_type === 'side') {
                if (!$('.draggable_container .svg_list').length) return;
                // 左侧栏点击切换时不触发滚动
                if (that.list_no_scroll) {
                    return that.list_no_scroll = false;
                }
                // 选中项居中算法
                that.$nextTick(() => {
                    let list_height = $('.draggable_container').height();
                    let svg_height = $('.svg_list.list-check .svg_masking').height();
                    let current_top = $('.svg_list.list-check')[0].offsetTop - 10;
                    let scroll_top = current_top - (list_height - svg_height) / 2;
                    $(".draggable_container").animate({
                        'scrollTop': scroll_top
                    }, 0);
                    that.list_no_scroll = false;
                });
            } else
                // 全屏平铺时
                if (that.sort_modal_type === 'full') {
                    that.$nextTick(() => {
                        let current_top = $('.svg_list.list-check')[0].offsetTop - 80;
                        $('.draggable_container').animate({
                            'scrollTop': current_top
                        }, 0);
                    });
                }
        },
        // 清空序列表状态
        clear_modal: function () {
            // 右键菜单标识
            this.show_menu_id = null;
            // 列表是否允许滚动标识
            this.list_no_scroll = false;
            // 预设弹框展示标识
            this.preset_modal_show = false;
            // 已选文档页
            this.selected_page_ist = [];
        },
        // 拖拽列表滚动，列表预览图懒加载
        drag_scroll: function (event) {
            let that = this;
            let $target = $(event.target);
            let scroll_rect = event.target.getBoundingClientRect();
            $target.find('.svg_content[data-id]').each((i, el) => {
                let rect = el.getBoundingClientRect();
                if (rect.bottom >= scroll_rect.top && rect.top <= scroll_rect.bottom) {
                    that.$set(that.lazyshow_map, $(el).attr('data-id'), true);
                }
            });
        },
        // 获取当前下标页
        get_pagenumber: function () {
            let index = this.document_page_list.findIndex(item => this.current_page_uuid === item.uuid) + 1;
            if (index < 1) {
                index = 1;
            }
            return index;
        },
        togglePageBackground(e) {
            this.show_page_background = !this.show_page_background;
            if (this.show_page_background) {
                $('.page_background_modal .set_title i').css({
                    background: opt_factory.init_opt('group').gradient_obj_2_style(this.page_info.background.color)
                });
            }
            // 阻止事件冒泡
            e.stopPropagation()
        },

        // 右键菜单显示
        showRightMenu(e){
            let $target = $(e.target);
            let window_h = window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight;
            let id = $target.attr('data-id') || $target.parents('.svg_content').eq(0).attr('data-id');
            if(this.show_menu_id === id){
                this.show_menu_id = null;
                return;
            }
            this.show_menu_id = id;
            this.show_page_background = false;
            // 收起状态下给右键菜单定位
            let $el = $target.hasClass('svg_content') ? $target : $target.parents('.svg_content').eq(0);
            let offset = $el.offset();
            let top = offset.top + 20 > window_h - 310 ? window_h - 310 : offset.top + 40;
            this.$nextTick(() => {
                $('.right_menu_modal').css({
                    'position': 'fixed',
                    'top': `${top}px`,
                    'left': `${offset.left + 80}px`,
                });
            })
        },
        /**
         * 通用方法
         */
        // 更换序列表展示方式
        change_sort_modal_type: function (type) {
            let that = this;
            that.sort_modal_type = type;
            that.current_page_uuid = that.page_info.uuid;
            // 清除画布状态
            this.$parent.clear_page_status();
            if (type === 'full') {
                $(".left_button:not('.left_button:first')").hide();
            } else {
                $(".left_button").show();
            }
            that.$nextTick(function () {
                that.initial_list_data(setTimeout(() => { that.sort_list_position() }, 500));
                that.page_resetting = false;
            })
        },
        // 单击编辑文档页
        select_page: function ($event, item) {
            $event = $event || window.event;
            let that = this;
            let is_ctrl = $event.ctrlKey || ($event.metaKey && utils.deviceENV().mac);
            let is_shift = $event.shiftKey;
            that.clear_modal();
            //ctrl单选
            if (is_ctrl) {
                if (that.current_page_uuid === item.uuid) {
                    return;
                }
                if (that.selected_page_list.indexOf(that.current_page_uuid) < 0) {
                    that.selected_page_list.push(that.current_page_uuid);
                }
                let index = that.selected_page_list.indexOf(item.uuid);
                if (index !== -1) {
                    that.selected_page_list.splice(index, 1);
                } else {
                    that.selected_page_list.push(item.uuid);
                }
                return;
            }
            //shift多选
            if (is_shift) {
                let last_uuid;
                let last_index;
                let next_uuid;
                let next_index;
                last_uuid = that.current_page_uuid;
                if (that.selected_page_list.length !== 0) {
                    last_uuid = that.selected_page_list[that.selected_page_list.length - 1];
                }
                next_uuid = item.uuid;
                $.each(that.sort_document_page_list, function (j, jtem) {
                    if (jtem.uuid === last_uuid) {
                        last_index = j;
                    }
                    if (jtem.uuid === next_uuid) {
                        next_index = j;
                    }
                    if (typeof (last_index) !== 'undefined' && typeof (next_index) !== 'undefined') {
                        return false;
                    }
                });
                if (typeof (last_index) === 'undefined' || typeof (next_index) === 'undefined' || last_index === next_index) {
                    return;
                }
                if (last_index > next_index) {
                    let t = next_index;
                    next_index = last_index;
                    last_index = t;
                }
                let tmp_index = last_index;
                while (tmp_index <= next_index) {
                    let uuid = that.sort_document_page_list[tmp_index].uuid;
                    let index = that.selected_page_list.indexOf(uuid);
                    if (index !== -1) {
                        that.selected_page_list.splice(index, 1);
                        that.selected_page_list.push(uuid);
                    } else {
                        that.selected_page_list.push(uuid);
                    }
                    tmp_index++;
                }
                return;
            }
            //普通选择
            that.selected_page_list = [];
            let min_index = 0;
            let max_index = that.sort_document_page_list.length - 1;
            let current_index = min_index;
            let target_index = min_index;
            $.each(that.sort_document_page_list, function (j, jtem) {
                if (jtem.uuid === that.current_page_uuid) {
                    current_index = j;
                }
                if (jtem.uuid === item.uuid) {
                    target_index = j;
                }
            });
            if (current_index === target_index) {
                return;
            }
            if (target_index > max_index) {
                target_index = max_index;
            }
            let action = 'next';
            if (target_index < current_index) {
                action = 'previous';
            }
            that.current_page_uuid = item.uuid;
            page_opt.change(that.$parent, target_index, that.sort_modal_type === 'side' ? action : null);
            //禁止列表滚动标识
            that.list_no_scroll = true;
        },
        // 双击编辑文档页
        edit_page: function (uuid) {
            let that = this;
            that.clear_modal();
            page_opt.render(that.$parent, uuid);
            that.change_sort_modal_type('side');
        },
        // 清空多选文档页列表
        clear_selected_page_list: function () {
            this.selected_page_list = [];
        },
        // 设置是否可排序
        set_drag_sort: function (boolean) {
            this.can_sort = !!boolean;
        },
        // 开始拖动
        start_drag: function (e) {
            this.is_drag_page = true;
            $('.svg_number input').blur();
            // 添加占位样式
            $(e.clone).addClass('drag-holder');
            $('.sortable-chosen[draggable=false]').addClass('chosen');
            let $draggingElement = $('.draggingStyle');
            // 列表状态下 拖拽卡片只能上下移动
            if(this.sort_modal_type === 'side') {
                let draggingCallback = function () {
                    let oldTransform = $draggingElement[0].style.transform;
                    let newTransform = oldTransform.replace(/(-)?(\.|\d)+(px)?,/g, '0,');
                    $draggingElement.css('transform', newTransform);
                }
                let $document = $(document);
                $document.on('mousemove', draggingCallback);
                $document.one('mouseup', () => $document.off('mousemove', draggingCallback));
            } else {
                $draggingElement.css({
                    'left': `${this.drag_page_offset.clientX - 10}px`,
                    'top': `${this.drag_page_offset.clientY - 10}px`
                });
            }
        },
        end_drag: function (e) {
            this.is_drag_page = false;
            // 删除占位样式
            $(e.clone).removeClass('drag-holder');
            $('.svg_list').removeClass('chosen');
        },
        drag_page: function(event) {
            this.drag_page_offset = event || window.event;
        },
        /**
         * 文档标题相关
         */
        // 文档标题聚焦
        focus_title: function (e, index, item) {
            let that = this;
            that.clear_modal();
            if (e.type === 'mousedown') {
                if (e.target === $('input:focus')[0]) return;
                // 未选中的序列表先选中，阻止浏览器默认操作（防止聚焦）
                e.preventDefault();
                // 选中文档页
                that.select_page(e, item);
                // 页面渲染完后再聚焦输入框
                that.$nextTick(function () {
                    if (!item.title) $(e.target).attr('placeholder', '');
                    $(e.target).focus();
                });
                return;
            }
            if (e.type === 'focus') {
                that.set_drag_sort(false);
                return;
            }
        },

        /**
         * 文档页操作相关
         */
        // 新增文档页
        add_page: function (uuid, type) {
            let that = this;
            that.clear_modal();
            page_opt.add(that.$parent, { target_page_info_uuid: uuid, type: type, use_theme: true });
        },
        // 删除文档页(uuid:文档页uuid)
        delete_page: function (uuid) {
            let that = this;
            that.clear_modal();
            $.each(that.selected_page_list, function (i, item) {
                page_opt.delete(that.$parent, item);
            });
            page_opt.delete(that.$parent, uuid);
        },
        // 复制文档页(uuid:文档页uuid)
        copy_page: function (uuid) {
            let that = this;
            that.clear_modal();
            page_opt.copy(that.$parent, uuid);
        },
        // 设置文档页标题(item:编辑的文档页)
        set_page_title: function (e, item) {
            let that = this;
            that.clear_modal();
            that.set_drag_sort(true);
            let $input = $(e.target);
            let title = $input.val();
            if (!title) $input.attr('placeholder', '未添加标题');
            page_opt.set_title(that.$parent, item.uuid, title);
        },
        // 设置文档页排序
        sort: function (evt) {
            evt.stopPropagation();
            let that = this;
            that.set_drag_sort(false);
            setTimeout(() => {
                that.clear_modal();
                let order_uuid_index = evt.newIndex;
                let after_uuid_index = evt.newIndex - 1;
                let order_new_page_info = that.sort_document_page_list[order_uuid_index];
                let after_new_page_info = that.sort_document_page_list[after_uuid_index];
                let order_uuid;
                let after_uuid;
                if (order_new_page_info) {
                    order_uuid = order_new_page_info.uuid;
                }
                if (after_new_page_info) {
                    after_uuid = after_new_page_info.uuid;
                }
                if (typeof (order_uuid) === 'undefined' || order_uuid === '') {
                    that.reset_sort();
                    return that.$toast('排序失败,排序页不允许为空', 800);
                }
                let order_uuids;
                if (this.is_batching) {
                    order_uuids = this.selected_page_list;
                } else {
                    order_uuids = [order_uuid];
                };
                if (typeof (after_uuid) === 'undefined' || after_uuid === '') {
                    after_uuid = null;
                }
                page_opt.set_sort(that.$parent, { after_uuid: after_uuid, order_uuids: order_uuids });
                that.set_drag_sort(true);
            }, 100);
        },
        // 复位文档页排序
        reset_sort: function () {
            let that = this;
            that.sort_document_page_list = that.sort_document_page_list.insertSort((a, b) => {
                return a.pageNumber - b.pageNumber;
            });
        },

        /**
         * 预设版式相关
         */
        // 显示/隐藏预设版式弹框
        show_preset_modal: function () {
            let that = this;
            if (that.preset_modal_show) {
                that.clear_modal();
                return;
            }
            that.clear_modal();
            that.initial_preset_count = $(document).width() <= 1300 ? 7 : 9;
            // 获取预设版式列表
            that.$axios.get('/api/document/default_recommend/')
                .then(function (data) {
                    if (data.data.code === "2") {
                        let list = data.data.data;
                        // 设置对应图片
                        list.forEach(function (item, index) {
                            item.image = require('@/assets/pc/images/edit/page' + (index + 1) + '.png');
                        })
                        $.each(list, function (i, item) {
                            item.elementList = item.elementList ? JSON.parse(item.elementList) : [];
                        });
                        that.preset_page_list = list;
                        that.preset_modal_show = true;
                    } else {
                        that.preset_modal_show = false;
                        console.error('获取预设版式列表失败')
                    }
                })
                .catch(data => {
                    that.preset_modal_show = false;
                    console.error('获取预设版式列表失败')
                });
            // 获取自定义预设版式列表
            that.$axios.get('/api/member/mylayout/list/')
                .then(function (data) {
                    if (data.data.code === "2") {
                        that.custom_preset_list = data.data.data;
                    }
                });
        },
        // 新增预设版式文档页
        add_preset_page: function (obj, use_theme) {
            let that = this;
            let page_info = obj;
            that.clear_modal();
            // 添加默认动画
            if (page_info.elementList) {
                page_info.elementList.forEach(item => {
                    item = that.$parent.ele_build_before_format(item);
                });
            }
            page_opt.add(that.$parent, { target_page_info_uuid: that.$parent.page_info.uuid, add_page_infos: page_info, use_theme: use_theme });
        },
        // 打开自定义版式编辑
        open_custom: function (id) {
            this.$parent.toggle_action_custom(id);
        },
        // 删除自定义版式
        delete_custom: function (id, index) {
            let that = this;
            if (!id) {
                return;
            }
            that.$axios.post('/api/member/mylayout/delete/', {
                id: id,
            })
                .then(function (data) {
                    that.$toast(data.data.content, 1500);
                    if (data.data.code === '2') {
                        that.custom_preset_list.splice(index, 1);
                    }
                })
        },
        // 使用自定义版式
        use_custom: function (id) {
            let that = this;
            if (!id) {
                return;
            }
            that.$axios.get(`/api/member/mylayout/detail/`, { params: { id: id } }).then(function (data) {
                if (data.data.code === '2') {
                    let page = {};
                    page = JSON.parse(data.data.data.content);
                    that.add_preset_page(page, false);
                    that.$toast("添加成功", 1500);
                } else {
                    that.$toast(data.data.content, 1500);
                }
            });
        }
    },
    computed: {
        is_batching: function() {   // 监听幻灯片是否为批量拖动
            return this.selected_page_list.length && this.selected_page_list.length > 1;
        }
    }
}
</script>

<style lang="less" scoped>
.sort_modal_contain {
    height: 100%;
    user-select: none;
    background: #ffffff;
    .sort_modal {
        .sort_modal_body {
            .sort_list {
                .list {
                    .svg_content {
                        position: relative;
                        .setting{
                            position: absolute;
                            z-index: 10;
                            top: 4px;
                            right: 5px;
                            display: flex;
                            justify-content: center;
                            align-items: center;
                            width: 20px;
                            height: 20px;
                            background: rgba(0, 0, 0, 0.5);
                            border-radius: 3px;
                            opacity: 0;
                            .base-icon {
                                color: #ffffff;
                            }
                            &:hover {
                                background: rgba(0, 0, 0, 0.8);
                            }
                        }
                        &:hover {
                            .setting {
                                opacity: 1;
                            }
                        }
                    }
                }
                .drag-holder {
                    .svg_content {
                        background-color: #d3e2ff;
                        border: 1px dashed var(--mainColor);
                        > * {
                            display: none;
                        }
                        &::before {
                            border: none !important;
                        }
                        &:hover {
                            .setting {
                                opacity: 0 !important;
                            }
                        }
                    }
                }
                .chosen {
                    .svg_content {
                        height: 3px !important;
                        border: none !important;
                        border-bottom: 3px solid var(--mainColor) !important;
                    }
                    .svg_number {
                        opacity: 0 !important;
                    }
                    .svg_comment {
                        opacity: 0 !important;
                    }
                }
                .draggingStyle {
                    .svg_content {
                        border: none !important;
                        height: 100% !important;
                        background-color: none !important;
                        > * {
                            display: inline-block !important;
                        }
                        &::before {
                            border: 1px dashed var(--mainColor) !important;
                        }
                    }
                    .multiple {
                        &::after {
                            content: '';
                            position: absolute;
                            top: -1px;
                            left: -1px;
                            width: 100%;
                            height: 100%;
                            border: 1px dashed var(--mainColor);
                            z-index: -1;
                            transform: rotate(-4deg) translate(3px, 7px);
                        }
                    }
                }
            }
            .drag_page {
                .svg_list {
                    display: inline-block !important;
                    .svg_content:hover::before {
                        border: 1px solid #eeeeee;
                    }
                }
            }
        }
    }
}
.draggable_container {
    width: 100%;
    height: 100%;
    overflow-y: auto;
    overflow-x: hidden;
    // 火狐浏览器滚动条优化
    scrollbar-width: thin;
}
/* 全屏样式 */
.sort_full_modal {
    position: fixed;
    top: 0;
    left: 0;
    z-index: 20;
    width: 100%;
    height: 100%;
    background: transparent;
    .sort_modal {
        position: relative;
        width: 100%;
        height: 100%;
        background: #f0f3f6;
        .sort_full_head {
            position: relative;
            width: 100%;
            height: 47px;
            line-height: 47px;
            padding: 0 23px;
            margin: 0 auto;
            text-align: left;
            background: #0d1c2e;
            .show_page_number {
                display: inline-block;
                vertical-align: middle;
                min-width: 50px;
                height: 30px;
                line-height: 28px;
                border-radius: 14.5px;
                padding: 0 8px;
                text-align: center;
                font-size: 12px;
                color: #676767;
                border: 1px solid #353839;
                & > span {
                    color: var(--mainColor);
                    &:first-child {
                        margin-right: 5px;
                        color: var(--mainColor);
                    }
                }
            }
            .close_sort_modal {
                position: absolute;
                top: 50%;
                right: 20px;
                margin: -8px 0 0;
                cursor: pointer;
                transition: transform 0.3s ease;
                &:hover {
                    transform: rotate(180deg);
                    opacity: 0.8;
                }
            }
        }
        .sort_modal_body {
            width: 100%;
            height: calc(100% - 47px);
            margin: 0 auto;
            text-align: left;
            .sort_list {
                width: 100%;
                height: 100%;
                padding-top: 30px;
                overflow-x: hidden;
                overflow-y: auto;
                scrollbar-width: none;
                .draggable_container {
                    display: inline;
                }
                .list,
                .addlist_btn {
                    position: relative;
                    display: inline-block;
                    vertical-align: top;
                    width: 430px;
                    margin: 0 20px 56px;
                    font-size: 0;
                    box-shadow: 0px 11px 32px 0px rgba(0, 0, 0, 0.05);
                    border-radius: 4px;
                    border: solid 1px rgba(0, 0, 0, 0.15);
                    cursor: pointer;
                    .svg_content {
                        overflow: hidden;
                        .setting{
                            z-index: 12;
                        }
                    }
                    &.list-check {
                        box-shadow: 0px 11px 32px 0px rgba(0, 0, 0, 0.21);
                        .svg_content:before {
                            content: '';
                            position: absolute;
                            top: 0;
                            left: 0;
                            display: block;
                            width: 100%;
                            height: 100%;
                            z-index: 11;
                            border: 3px solid var(--mainColor);
                            box-sizing: border-box;
                        }
                    }
                    .svg_number {
                        position: absolute;
                        bottom: -28px;
                        left: 0;
                        text-align: left;
                        font-size: 12px;
                        color: #676767;
                    }

                    .svg_comment {
                        position: absolute;
                        right: 0;
                        bottom: -28px;
                        display: block;
                        width: 18px;
                        height: 17px;
                        line-height: 17px;
                        border-radius: 6px;
                        background: #bec2c7;
                        text-align: center;
                        color: #fff;
                        font-size: 12px;
                        cursor: pointer;
                        &:after {
                            content: '';
                            position: absolute;
                            right: 0;
                            top: -4px;
                            width: 0;
                            height: 0;
                            border-width: 4px;
                            border-style: solid;
                            border-color: #bec2c7 transparent transparent
                                transparent;
                            transform: rotate(-270deg);
                        }
                    }
                }
                .edit_page {
                    z-index: 10;
                }
                .svg_list {
                    transition: all 0.5s;
                    &:hover{
                        transform: scale(1.03);
                    }
                }
                .draggingStyle {
                    transition: none !important;
                    max-width: 430px !important;
                    .svg_content {
                        overflow: visible !important;
                    }
                    .multiple {
                        &::after {
                            transform: rotate(-2deg) translate(3px, 10px);
                        }
                    }
                }
            }
        }
        
    }
    /*列表加载动画*/
    .resetting_animation {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        line-height: 100%;
        background: #585c66;
        font-size: 0;
        text-align: center;
        &:after {
            content: '';
            position: relative;
            display: inline-block;
            width: 0;
            height: 100%;
            vertical-align: middle;
        }
        img {
            display: inline-block;
            width: 50px;
            height: 50px;
            vertical-align: middle;
        }
    }
}
/* 侧栏样式 */
.sort_side_modal {
    position: relative;
    padding: 0 12px;
    &::-webkit-scrollbar-thumb {
            display: none;
    }
    &:hover {
        &::-webkit-scrollbar-thumb {
            display: block;
        }
    }
    .sort_modal {
        height: 100%;
    }
    .sort_side_head {
        position: relative;
        top: 10px;
        left: 12px;
        width: 124px;
        height: 36px;
        line-height: 36px;
        background: #f4f4f4;
        border-radius: 0;
        border: none;
        .add_page_btn {
            position: relative;
            width: 95px;
            height: 100%;
            text-align: center;
            span {
                display: inline-block;
                vertical-align: middle;
                font-size: 12px;
                color: #444444;
            }
            &:hover {
                background: #e5e5e5;
                &::after{
                    right: 0;
                }
            }
            &::after {
                content: '';
                position: absolute;
                top: 50%;
                right: -1px;
                transform: translateY(-50%);
                width: 1px;
                height: 16px;
                background: #dddddd;
            }
        }
        .preset_page_btn {
            display: inline-block;
            vertical-align: top;
            width: 28px;
            height: 100%;
            text-align: center;

            &:hover {
                background: #e5e5e5;
            }

            .base-icon {
                font-size: 12px;
                transform: scale(0.6);
                color: #444444;
            }
        }
        // 预设版式弹框
        .preset_layout_modal {
            position: absolute;
            top: calc(100% + 5px);
            left: 75px;
            display: flex;
            width: 567px;
            height: 551px;
            background: #ffffff;
            border: solid 1px #eeeeee;
            border-radius: 6px;
            box-shadow: 0px 2px 20px 0px rgba(180, 187, 199, 0.2);
            z-index: 20;
            .select-format {
                width: 140px;
                height: 100%;
                border-right: 1px solid #eeeeee;
                ul {
                    padding-top: 20px;
                    width: 100%;
                    li {
                        width: 100%;
                        height: 44px;
                        line-height: 44px;
                        text-align: center;
                        font-size: 14px;
                        color: #444444;
                        &.current {
                            background: #eeeeee;
                        }
                        cursor: pointer;
                    }
                }
            }
            .preset_list_container,
            .custom_list_container {
                flex: 1;
                display: flex;
                justify-content: space-between;
                flex-wrap: wrap;
                padding: 30px;
                overflow-y: scroll;
                img {
                    display: block;
                    width: 100%;
                    height: auto;
                }
            }

            .preset_list_container {
                .preset-item {
                    width: 176px;
                    background: #ffffff;
                    border: 1px solid #979797;
                    margin-bottom: 14px;
                    cursor: pointer;
                    transition: 0.2s;
                    &:hover {
                        box-shadow: 0px 2px 20px 0px rgba(180, 187, 199, 0.8);
                    }
                }
            }

            .custom_list_container {
                .custom-wrap {
                    width: 176px;
                    text-align: center;
                    align-self: start;
                    font-size: 14px;
                    color: #444444;
                    margin-bottom: 14px;
                    cursor: pointer;
                    .custom-item {
                        position: relative;
                        width: 100%;
                        background: #ffffff;
                        border: 1px solid #979797;
                        transition: 0.2s;

                        .custom_masking {
                            position: absolute;
                            top: 0;
                            left: 0;
                            display: flex;
                            align-items: center;
                            justify-content: center;
                            width: 100%;
                            height: 100%;
                            background: rgba(0, 0, 0, 0.5);
                            opacity: 0;
                            button {
                                margin: 0 5px;
                                width: 32px;
                                height: 32px;
                                border-radius: 50%;
                                background: #ffffff;
                                .base-icon {
                                    color: #666666;
                                }
                                &:hover {
                                    background: var(--mainColor);
                                    .base-icon {
                                        color: #ffffff;
                                    }
                                }
                            }
                        }
                    }
                    &:hover {
                        .custom-item {
                            box-shadow: 0px 2px 20px 0px
                                rgba(180, 187, 199, 0.8);
                            .custom_masking {
                                opacity: 1;
                            }
                        }
                    }
                }

                .add_custom_page {
                    padding: 31px 0;
                    text-align: center;
                    border: 1px dashed #979797;
                    transition: 0.2s;
                    span {
                        margin-left: 5px;
                    }
                    &:hover {
                        box-shadow: 0px 2px 20px 0px rgba(180, 187, 199, 0.8);
                        background: #f4f4f4;
                    }
                }
            }
        }
    }
    .sort_modal_body {
        position: relative;
        right: 12px;
        width: calc(100% + 24px);
        height: calc(100% - 56px);
        margin-top: 20px;
        scrollbar-width: none;
    }
    .sort_list {
        width: 100%;
        height: 100%;
        overflow-y: auto;
        overflow-x: hidden;
    }
    .svg_list {
        padding-bottom: 8px;
        position: relative;
        display: inline-block;
        vertical-align: top;
        width: 244px;
        padding: 2px 0 2px 10px;
        margin: 8px 0;
        font-size: 0;
        // 页码
        .svg_number {
            position: absolute;
            top: 0;
            left: -16px;
            font-size: 12px;
            color: #676767;
        }
        .svg_comment {
            position: absolute;
            left: -18px;
            top: 30px;
            display: block;
            width: 18px;
            height: 17px;
            border-radius: 6px;
            background: #bec2c7;
            color: #fff;
            font-size: 12px;
            cursor: pointer;
            &:after {
                content: '';
                position: absolute;
                right: 0;
                top: 12px;
                width: 0;
                height: 0;
                border-width: 4px;
                border-style: solid;
                border-color: #bec2c7 transparent transparent transparent;
                transform: rotate(-270deg);
            }
        }

        .svg_content {
            position: relative;
            width: 350px;
            text-align: left;
            cursor: pointer;
            &::before {
                content: '';
                position: absolute;
                top: -3px;
                left: -3px;
                display: block;
                width: calc(100% + 6px);
                height: calc(100% + 6px);
                border: 1px solid #eeeeee;
                box-sizing: border-box;
            }
            &:hover {
                &::before {
                    border: 2px solid var(--mainColor);
                }
            }
        }
        .svg_number {
            top: 50%;
            transform: translateY(-50%);
            left: -11px;
            color: #999999;
        }
        &:hover {
            .svg_content:before {
                content: '';
                position: absolute;
                top: -3px;
                left: -3px;
                display: block;
                width: calc(100% + 6px);
                height: calc(100% + 6px);
                border: 3px solid var(--mainColor);
                box-sizing: border-box;
                z-index: 10;
            }
        }
        &.list-check {
            .svg_masking {
                position: absolute;
                left: -24px;
                top: -9px;
                width: 296px;
                height: calc(100% + 14px);
                background: #e3e7ee;
            }
            .svg_content {
                &::before {
                    content: '';
                    position: absolute;
                    top: -3px;
                    left: -3px;
                    z-index: 1;
                    display: block;
                    width: calc(100% + 6px);
                    height: calc(100% + 6px);
                    border: 2px solid var(--mainColor);
                    box-sizing: border-box;
                }
            }
            .svg_masking {
                width: 88px;
                background: transparent;
            }
        }
    }
}
// 右键菜单
.right_menu_modal {
    padding: 10px 0;
    position: absolute;
    top: 100px;
    left: 97px;
    width: 214px;
    background: #ffffff;
    border: 1px solid #eeeeee;
    border-radius: 6px;
    box-shadow: 0px -2px 20px 0px rgba(180, 187, 199, 0.2);
    z-index: 20;
    li {
        display: flex;
        align-items: center;
        width: 100%;
        height: 44px;
        padding: 0 24px;

        cursor: pointer;
        &:hover {
            background: #eaedf3;
        }
        span {
            font-size: 14px;
            color: #444444;
        }
        .base-icon {
            margin-right: 10px;
            color: #444444;
        }
        &.comment,
        &.up_new_page {
            position: relative;
            margin-top: 10px;
            &::before {
                content: '';
                position: absolute;
                top: -5px;
                left: 50%;
                transform: translateX(-50%);
                width: 167px;
                height: 1px;
                background: #eeeeee;
            }
        }
        &.page-bg {
            position: relative;
            /* 文档页背景设置弹框 */
            .page_background_modal {
                position: absolute;
                top: 0;
                left: 100%;
                width: 247px;
                text-align: left;
                border-radius: 4px;
                background: #ffffff;
                box-shadow: 0px -2px 20px 0px rgba(180, 187, 199, 0.2);
                &:hover {
                    opacity: 1;
                }
                & > div {
                    padding: 0 24px;
                }
                .set_title {
                    position: relative;
                    width: 100%;
                    height: 52px;
                    line-height: 52px;
                    padding-left: 40px;
                    cursor: pointer;
                    span {
                        font-size: 14px;
                        color: #7d7d8b;
                    }
                    &:before {
                        content: '';
                        position: absolute;
                        top: 50%;
                        left: 0;
                        background: url('~@/assets/pc/images/edit/edit_sp_2.0.1.png')
                            no-repeat;
                    }
                    i {
                        position: absolute;
                        top: 50%;
                        right: 0;
                        display: inline-block;
                        width: 15px;
                        height: 15px;
                        margin-top: -9px;
                        border: 1px solid #dfdfdf;
                        border-radius: 2px;
                        font-size: 0;
                    }
                    &:hover {
                        span {
                            color: #000;
                        }
                        i {
                            border-color: #111;
                        }
                    }
                }
                .set_page_color {
                    position: relative;
                    width: 100%;
                    height: 53px;
                    overflow: hidden;
                    .set_title:before {
                        width: 16px;
                        height: 15px;
                        margin-top: -8px;
                        background-position: -208px -133px;
                    }
                    &:hover :before {
                        background-position: -306px -133px;
                    }
                }
                .background_unable {
                    position: absolute;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 63px;
                    background: rgba(0, 0, 0, 0.1);
                }
                .set_page_image {
                    position: relative;
                    width: 100%;
                    border-top: 1px solid #dddddd;
                    overflow: hidden;
                    transition: height 0.5s;
                    .set_title:before {
                        width: 16px;
                        height: 14px;
                        margin-top: -7px;
                        background-position: -239px -133px;
                    }
                    &:hover :before {
                        background-position: -335px -133px;
                    }
                    &.checked {
                        .set_title {
                            i {
                                top: 20px;
                                width: 10px;
                                height: 10px;
                                margin-top: 0;
                                border: none;
                                background: url('~@/assets/pc/images/edit/edit_sp_2.0.1.png')
                                    no-repeat -413px -5px;
                            }
                            i:hover {
                                top: 13px;
                                right: 0;
                                width: 40px;
                                height: 24px;
                                line-height: 24px;
                                border-radius: 24px;
                                background: #ff5f5f;
                                font-size: 12px;
                                font-style: initial;
                                color: #ffffff;
                                text-align: center;
                                cursor: pointer;
                            }
                        }
                    }
                    .show_page_image {
                        width: 199px;
                        height: auto;
                        font-size: 0;
                        text-align: center;
                        &:hover button {
                            opacity: 1;
                        }
                        button {
                            position: absolute;
                            left: calc(50% - 25px);
                            top: calc(50% - 10px);
                            opacity: 0;
                            width: 50px;
                            height: 28px;
                            background: rgba(0, 0, 0, 0.5);
                            border-radius: 3px;
                            color: white;
                            transition: opacity 0.3s;
                            &:hover {
                                background: rgba(0, 0, 0, 0.7);
                            }
                        }
                        img {
                            display: inline-block;
                            max-width: 100%;
                            max-height: 100%;
                            vertical-align: middle;
                        }
                        .set_page_image_type {
                            margin: 15px 0;
                            span {
                                position: relative;
                                font-size: 14px;
                                cursor: pointer;
                                &:hover {
                                    opacity: 0.8;
                                }
                                &:first-child {
                                    margin-right: 26px;
                                }
                                &::before {
                                    content: '';
                                    display: inline-block;
                                    vertical-align: top;
                                    width: 16px;
                                    height: 16px;
                                    margin-right: 9px;
                                    border: 1px solid #e8e8e8;
                                    border-radius: 4px;
                                    background: #fff;
                                    text-align: center;
                                }
                                i {
                                    position: absolute;
                                    left: 6px;
                                    bottom: 6px;
                                    color: var(--mainColor);
                                }
                            }
                        }
                    }
                }
            }
        }
    }
}
</style>