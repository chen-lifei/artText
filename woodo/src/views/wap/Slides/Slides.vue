<template>
    <div class="slides_body">
        <!-- 竖屏状态 -->
        <div class="slides_vertical" 
            v-if="screenType === 'vertical'"
            :class="{'flex_center': flex_center}"
            @scroll="vertical_scroll_slide"
            @touchstart="touchstart"
            @touchend="vertical_touchend"
        >
            <!-- 竖屏状态插槽内容 -->
            <slot name="verticalheader"></slot>
            <!-- 竖屏文档页列表 正常文档排版 -->
            <div v-if="!h5_mode" class="normal_wap_page">
                <div class="wap_page" 
                    v-for="(item, index) in document_pages" 
                    :key="index" 
                    :style="{'width': `${vertical_pages_template.w}px`, 'height': `${vertical_pages_template.h}px`, 'margin-bottom': index !== (document_pages.length - 1) ? '4px' : ''}"
                >
                    <div class="svg_list" :style="{'width': `${vertical_pages_template.w}px`, 'height': `${vertical_pages_template.h}px`}">
                        <svg_modal ref="svg_modal" 
                            :svg_w="vertical_pages_template.w"
                            :svg_h="vertical_pages_template.h"
                            :svg_view="vertical_pages_template.view"
                            :document="document_info"
                            :page_info="item"
                            :use_link="true"
                            :use_audio="true"
                            :use_video="use_video"
                            :mode="`preload`"
                            :lazyshow="Math.abs(index - page_number) < 5"
                        >
                            <template slot="cannotplayTips">
                                <p v-if="miniprogram" class="outside_video_tips">小程序不支持链接视频播放</p>
                            </template>
                        </svg_modal>
                    </div>
                </div>
            </div>
            <!-- 竖屏文档页列表 h5演示排版 -->
            <div v-else class="h5_wap_page">
                <transition-group tag="div" class="SP_transition_div" :name="tranName">
                    <div class="wap_page" 
                        v-for="(item, index) in document_pages" 
                        :key="index" 
                        :data-show="page_number === index"
                        v-show="page_number === index"
                    >
                        <div class="svg_list" :style="{'width':`${window_width}px`, 'height':`${window_height}px`, 'background':item.page_background}">
                            <svg_modal ref="svg_modal" 
                                :svg_w="vertical_pages_template.w"
                                :svg_h="vertical_pages_template.h"
                                :svg_view="vertical_pages_template.view"
                                :document="document_info"
                                :page_info="item"
                                :use_link="true"
                                :use_audio="true"
                                :use_video="use_video"
                                :mode="`preload`"
                                :lazyshow="Math.abs(index - page_number) < 3"
                            >
                                <template slot="cannotplayTips">
                                    <p v-if="miniprogram" class="outside_video_tips">小程序不支持链接视频播放</p>
                                </template>
                            </svg_modal>
                        </div>
                    </div>
                </transition-group>
            </div>
            <!-- 页码 / 页数 底栏隐藏 则显示 -->
            <transition name="modal-fade">
                <div class="page_number_total" v-if="!h5_mode" v-show="!tool" @click="show_number_modal = true">
                    <span>{{ page_number + 1 }}</span> / {{ document_pages.length }}
                </div>
            </transition>
            <!-- 页码弹窗 -->
            <transition name="modal_fade">
                <div class="page_number_list" v-if="!h5_mode" v-show="show_number_modal" @touchstart.stop @touchend.stop>
                    <div class="list_contain">
                        <ul>
                            <li v-for="(item, index) in document_pages" :key="index" @click="set_page_number(index)">
                                <a :class="{'blue': index === page_number}">第 {{ index + 1 }} 页</a>
                            </li>
                        </ul>
                        <div>
                            <a class="cancel" @click="show_number_modal = false">取消</a>
                        </div>
                    </div>
                </div>
            </transition>
            <!-- 竖屏状态插槽内容 -->
            <slot name="verticalfooter"></slot>
        </div>
        <!-- 横屏状态 -->
        <div class="slides_horizontal" 
            v-else
            @touchstart="touchstart"
            @touchend="horizontal_touchend"
        >
            <transition-group tag="div" class="SP_transition_div" :name="tranName">
                <div class="wap_page" 
                    v-for="(item, index) in document_pages" 
                    :key="index" 
                    :data-show="page_number === index"
                    v-show="page_number === index"
                >
                    <div class="svg_list" :style="{'width':`${window_height}px`, 'height':`${window_width}px`, 'background':item.page_background}">
                        <svg_modal ref="svg_modal" 
                            :svg_w="horizontal_pages_template.w"
                            :svg_h="horizontal_pages_template.h"
                            :svg_view="horizontal_pages_template.view"
                            :document="document_info"
                            :page_info="item"
                            :use_link="true"
                            :use_audio="true"
                            :use_video="use_video"
                            :mode="`preload`"
                            :lazyshow="Math.abs(index - page_number) < 3"
                        >
                            <template slot="cannotplayTips">
                                <p v-if="miniprogram" class="outside_video_tips">小程序不支持链接视频播放</p>
                            </template>
                        </svg_modal>
                    </div>
                </div>
                <!-- 播放结束，滑动退出 -->
                <div class="wap_page last_page_tip" 
                    v-show="page_number === document_pages.length"
                    key="last"
                    @touchstart.stop
                    @touchmove.stop
                    @touchend.stop="out_horizontal"
                >
                    <p>播放结束，继续滑动可退出</p>
                </div>
            </transition-group>
            <!-- 缩略图 -->
            <div class="thumbnail" :class="{'show': tool}" @touchstart.stop @touchend.stop>
                <div class="thumbnail_list" 
                    v-for="(item, index) in document_pages" 
                    :key="index" 
                    :data-pagenum="index + 1" 
                    :class="{'check':index === page_number}" 
                    @click="set_page_number(index)"
                >
                    <div class="thumbnail_svg" :style="{'height': `${thumbnail_pages_template.h}px`, 'width': `${thumbnail_pages_template.w}px`}">
                        <svg_modal ref="svg_modal" 
                            :svg_w="thumbnail_pages_template.w"
                            :svg_h="thumbnail_pages_template.h"
                            :svg_view="[0, 0, document_info.width, document_info.height]"
                            :document="document_info"
                            :page_info="item"
                            :mode="`thumbnail`"
                        ></svg_modal>
                    </div>
                </div>
            </div>
        </div>
        <!-- 背景音乐图标（固定位置显示） -->
        <div class="BGM_container" 
            ref="BGM_container"
            v-if="!h5_mode && document_info.attr && document_info.attr.backgroundMusic && document_info.attr.backgroundMusic.src"
        >
            <div class="record" @click="BGM_toggle_play">
                <img src="../../../assets/wap/images/display/record_w.png" alt="">
            </div>
            <audio :src="document_info.attr.backgroundMusic.src" 
                :autoplay="document_info.attr.backgroundMusic.autoplay" 
                :loop="document_info.attr.backgroundMusic.loop"
                :data-autoplay="document_info.attr.backgroundMusic.autoplay" 
                :data-fadein="document_info.attr.backgroundMusic.fadeIn"
                :data-fadeout="document_info.attr.backgroundMusic.fadeOut"
                :data-hideonshow="document_info.attr.backgroundMusic.hideOnShow"
                @loadedmetadata="BGM_start_play"
                @play="BGM_playing_animation"
                @pause="BGM_playing_animation"
            ></audio>
        </div>
        <!-- h5 背景音乐 -->
        <div class="h5_BGM_container"
            ref="h5_BGM_container"
            v-if="h5_mode && document_info.attr && document_info.attr.backgroundMusic && document_info.attr.backgroundMusic.src"
        >
            <img src="../../../assets/wap/images/display/record.png" alt="" @click="h5_BGM_toggle_play">
            <audio :src="document_info.attr.backgroundMusic.src" 
                :autoplay="document_info.attr.backgroundMusic.autoplay" 
                :loop="document_info.attr.backgroundMusic.loop"
                :data-autoplay="document_info.attr.backgroundMusic.autoplay" 
                :data-fadein="document_info.attr.backgroundMusic.fadeIn"
                :data-fadeout="document_info.attr.backgroundMusic.fadeOut"
                :data-hideonshow="document_info.attr.backgroundMusic.hideOnShow"
                @loadedmetadata="BGM_start_play"
                @play="h5_BGM_playing_animation"
                @pause="h5_BGM_playing_animation"
            ></audio>
        </div>
        <!-- 动画触发器 -->
        <div class="start-animation-container"></div>
    </div>
</template>

<script>
import svg_modal from "@/components/SvgPageModal.vue";
import opt_factory from "@/assets/pc/js/opt/opt_factory.js";
import element_animate from '@/assets/pc/js/element_animate.js';

export default {
    name: "Slides",
    props: {
        screenType: {
            type: String,
            default: "vertical"
        },
        tool: Boolean,
        document_info: Object,
        document_pages: Array,
        enable_animation: {
            type: Boolean,
            default: true,
        },
        h5_mode: Boolean,
    },
    components: {
        svg_modal,
    },
    data() {
        return {
            window_width: 0,                        // 当前设备尺寸宽
            window_height: 0,                       // 当前设备尺寸高
            window_rotate: false,                   // 屏幕是否旋转
            page_number: 0,                         // 当前页码
            show_number_modal: false,               // 显示页码弹窗
            tranName: '',                           // 横屏翻页切换动画
            vertical_pages_template: {              // 竖屏
                w: 910,
                h: 512,
                view: [0, 0, 0, 0],
            },
            horizontal_pages_template: {            // 横屏
                w: 910,
                h: 512,
                view: [0, 0, 0, 0],
            },
            thumbnail_pages_template: {             // 缩略图尺寸
                w: 910,
                h: 512,
            },
            touch_throttle: false,                  // 横屏翻页节流
            point: {                                // 手指触摸位置
                x: 0,
                y: 0,
            },
            show_thumbnail: false,                  // 缩略图显示
            flex_center: false,                     // 竖屏列表滚动高度小于窗口高度，添加居中样式
            auto_play: false,                       // 动画自动播放
            auto_play_timer: null,                  // 动画自动切换定时器
            h5_auto_play: false,                    // h5模式下自动播放标识，优先应用h5自动播放
            use_video: 'no',                        // 是否启用视频
            miniprogram: false,                     // 小程序环境
        };
    },
    watch: {
        // 文档渲染
        document_pages(n, o) {
            let that = this;
            that.$nextTick(() => {
                that.svg_render();
                that.media_can_autoplay();
                // 执行动画
                that.start_page_animation();
                // 竖屏文档列表居中
                that.vertical_list_flex();
            });
        },
        // 横竖屏切换
        screenType(n, o) {
            let that = this;
            if (n === 'horizontal') {
                that.set_horizontal();
            } else if (n === 'vertical') {
                that.set_vertical();
            }
            that.stop_auto_play();
            // 执行动画
            that.$nextTick(() => {
                that.clear_all_animation();
                that.start_page_animation();
            });
        },
        // 翻页切换监听
        page_number(n, o) {
            let that = this;
            that.$nextTick(() => {
                that.thumbnail_scroll_center();
                that.media_element_pause();
                // 重置下页元素动画的动画前效果
                that.reset_page_animation(n);
                // 执行动画
                that.start_page_animation();
            });
        },
    },
    mounted() {
        let that = this;
        that.update_screen_info();
        // 小程序环境判断
        utils.isMiniProgramENV().then(res =>{
            if(res.miniprogram){
                that.miniprogram = true;
                // 小程序中只支持上传的视频
                that.use_video = 'inside';
            } else {
                that.use_video = 'all';
            }
        }).catch((res) =>{
            console.error("error " + res);
        });
        // 通过设备旋转设置横竖屏
        window.addEventListener('onorientationchange' in window ? 'orientationchange' : 'resize', e => {
            let before_screenType = that.screenType;
            setTimeout(() => {
                that.update_screen_info();
                that.svg_render();
                // 已设置横屏状态下，旋转屏幕，原因：screenType值没改变，watch没监听
                that.$nextTick(() => {
                    if (before_screenType !== that.screenType) {
                        return;
                    }
                    if (that.screenType === 'horizontal') {
                        that.set_horizontal();
                    } else if (that.screenType === 'vertical') {
                        that.set_vertical();
                    }
                });
            }, 240);
        });
        // 页面隐藏时，后台运行时 暂停媒体播放
        let hidden, visibilityChange;
        if (typeof document.hidden !== "undefined") {
            hidden = "hidden";
            visibilityChange = "visibilitychange";
        } else if (typeof document.msHidden !== "undefined") {
            hidden = "msHidden";
            visibilityChange = "msvisibilitychange";
        } else if (typeof document.webkitHidden !== "undefined") {
            hidden = "webkitHidden";
            visibilityChange = "webkitvisibilitychange";
        }
        if (hidden === undefined) {
            console.log("This demo requires a browser, such as Google Chrome or Firefox, that supports the Page Visibility API.");
        } else {
            let before_playing_arr = [];
            document.addEventListener(visibilityChange, e => {
                if (document[hidden]) {
                    // 暂停播放
                    before_playing_arr = that.media_hidden_pause();
                } else {
                    // 恢复播放
                    before_playing_arr.forEach(item => {
                        item.play();
                    });
                }
            });
        }
    },
    methods: {
        /**
         * 渲染文档相关方法
         */
        // 初始化渲染模板
        svg_render() {
            let that = this;
            let document_info = that.document_info;
            let ratio = document_info.width / document_info.height;
            let window_w = that.window_rotate ? that.window_height : that.window_width;
            let window_h = that.window_rotate ? that.window_width : that.window_height;
            let vertical_page_w = window_w;
            let vertical_page_h = window_w / ratio;
            let horizontal_page_w = window_w;
            let horizontal_page_h = window_w / ratio;
            // 横屏的时候，屏幕宽高调转
            let horizontal_window_w = window_h;
            let horizontal_window_h = window_w;
            // 计算横屏状态下的文档宽高
            if (horizontal_window_w / ratio > horizontal_window_h) {
                horizontal_page_h = horizontal_window_h;
                horizontal_page_w = horizontal_page_h * ratio;
            } else {
                horizontal_page_w = horizontal_window_w;
                horizontal_page_h = horizontal_page_w / ratio;
            }
            // view下标含义，0: margin_left, 1: margin_top, 2: document_width, 3: document_height
            // 横屏尺寸
            that.horizontal_pages_template.w = horizontal_page_w;
            that.horizontal_pages_template.h = horizontal_page_h;
            that.horizontal_pages_template.view[0] = (window_h - horizontal_page_w) / 2;
            that.horizontal_pages_template.view[1] = (window_w - horizontal_page_h) / 2;
            that.horizontal_pages_template.view[2] = document_info.width;
            that.horizontal_pages_template.view[3] = document_info.height;
            // 竖屏尺寸
            that.vertical_pages_template.w = vertical_page_w;
            that.vertical_pages_template.h = vertical_page_h;
            that.vertical_pages_template.view[0] = 0;
            that.vertical_pages_template.view[1] = 0;
            that.vertical_pages_template.view[2] = document_info.width;
            that.vertical_pages_template.view[3] = document_info.height;
            // h5演示状态下，竖屏单页显示一页文档页
            if (that.h5_mode) {
                if (ratio > (window_w / window_h)) {
                    vertical_page_w = window_w;
                    vertical_page_h = vertical_page_w / ratio;
                } else {
                    vertical_page_h = window_h;
                    vertical_page_w = vertical_page_h * ratio;
                }
                that.vertical_pages_template.w = vertical_page_w;
                that.vertical_pages_template.h = vertical_page_h;
                that.vertical_pages_template.view[0] = (window_w - vertical_page_w) / 2;
                that.vertical_pages_template.view[1] = (window_h - vertical_page_h) / 2;
            }
        },
        // 更新屏幕尺寸，方向
        update_screen_info() {
            let that = this;
            // 初始化渲染方向
            that.window_width = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
            that.window_height = window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight;
            that.window_rotate = that.window_width > that.window_height;
            that.event_screen(that.window_rotate ? `horizontal` : `vertical`);
        },
        // 设置横屏
        set_horizontal() {
            let that = this;
            let w = that.window_width;
            let h = that.window_height;
            let css = {};
            if (that.window_rotate) {
                css = {
                    'width': `${w}px`,
                    'height': `${h}px`,
                    'max-width': `none`,
                    'overflow': `hidden`,
                    'transform': `rotate(0) translate(0, 0)`,
                    'transform-origin': 'center center',
                    'transition': 'transform 0.2s linear',
                };
            } else {
                css = {
                    'width': `${h}px`,
                    'height': `${w}px`,
                    'max-width': `none`,
                    'overflow': `hidden`,
                    'transform': `rotate(90deg) translate(${(h - w) / 2}px, ${(h - w) / 2}px)`,
                    'transform-origin': 'center center',
                    'transition': 'transform 0.2s linear',
                };
            }
            $('body').css(css);
            // 缩略图尺寸
            that.$nextTick(() => {
                let $thumbnail = $('.slides_horizontal .thumbnail');
                if ($thumbnail.length > 0) {
                    let height = $thumbnail.height();
                    let document_info = that.document_info;
                    let ratio = (document_info.width || 910) / (document_info.height || 512);
                    that.thumbnail_pages_template.h = height;
                    that.thumbnail_pages_template.w = height * ratio;
                }
            })
        },
        // 设置竖屏
        set_vertical() {
            let that = this;
            let w = that.window_width;
            let h = that.window_height;
            let css = {};
            if (that.window_rotate) {
                css = {
                    'width': `${h}px`,
                    'height': `${w}px`,
                    'max-width': `none`,
                    'overflow': `hidden`,
                    'transform': `rotate(-90deg) translate(${(w - h) / 2}px, 0)`,
                    'transform-origin': 'center center',
                    'transition': 'transform 0.2s linear',
                };
            } else {
                css = {
                    'width': `100%`,
                    'height': `100%`,
                    'max-width': `none`,
                    'overflow': `hidden`,
                    'transform': `rotate(0) translate(0, 0)`,
                    'transform-origin': 'center center',
                    'transition': 'transform 0.2s linear',
                };
            }
            $('body').css(css);
        },
        // 切换控制，用于拦截 action = 'next' || 'prev' || Number
        page_switch_control(action) {
            if (this.touch_throttle) {
                return;
            }
            // 自动播放无法触发
            if (this.h5_auto_play || this.auto_play) {
                return;
            }
            // 动画正在播放时，禁止翻页
            if ($('.start-animation-container').children().length > 0) {
                return;
            }
            switch (action) {
                case !isNaN(Number(action)):
                    this.set_page_number(action);
                    break;
                case 'next':
                    this.page_next();
                    break;
                case 'prev':
                    this.page_prev();
                    break;
            }
        },
        // 横屏状态下翻页
        page_next() {
            let that = this;
            let max_number = that.document_pages.length;
            // h5模式竖屏状态
            if (that.h5_mode && that.screenType === 'vertical' && that.page_number >= max_number - 1) {
                return;
            }
            // 自动循环演示
            let autoloop = that.document_info.attr && that.document_info.attr['playType'] === 'autoloop';
            // 正常流程
            if (that.page_number >= max_number - 1) {
                if (!autoloop) {
                    that.stop_auto_play();
                } else {
                    that.page_number = -1;
                }
            }
            that.touch_throttle = true;
            that.tranName = 'svg-next';
            that.page_number++;
            setTimeout(() => {
                that.touch_throttle = false;
            }, 500);
        },
        page_prev() {
            let that = this;
            if (that.page_number <= 0) {
                return;
            }
            that.touch_throttle = true;
            that.tranName = 'svg-pre';
            that.page_number--;
            setTimeout(() => {
                that.touch_throttle = false;
            }, 500);
        },
        // 设置显示指定页
        set_page_number(index = 0) {
            let that = this;
            that.page_number = index;
            if (that.screenType === 'vertical') {
                let $body = $('.slides_body .slides_vertical');
                let item_height = $body.find('.svg_list').height() + 4;
                $body.animate({
                    'scrollTop': item_height * index,
                });
                that.show_number_modal = false;
            }
        },
        // 缩略图居中
        thumbnail_scroll_center() {
            let $contain = $('.slides_horizontal .thumbnail');
            let $checked = $contain.find('.thumbnail_list.check');
            if ($contain.length === 0 || $checked.length === 0) {
                return;
            }
            let contain_width = $contain.outerWidth();
            let list_width = $checked.outerWidth();
            let current_left = $checked[0].offsetLeft;
            let scroll_left = current_left - (contain_width - list_width) / 2;
            $contain.animate({
                'scrollLeft': scroll_left
            }, 0);
        },
        // 竖屏文档列表居中
        vertical_list_flex() {
            let $slides_vertical = document.querySelector('.slides_vertical');
            if (!$slides_vertical) {
                return;
            }
            this.flex_center = $slides_vertical.scrollHeight <= $slides_vertical.clientHeight;
        },
        // 切换页停止自动播放
        stop_auto_play() {
            clearTimeout(this.auto_play_timer);
            this.auto_play = false;
        },
        // 切换页开始自动播放
        start_auto_play() {
            let that = this;
            let auto_play = false;
            clearTimeout(that.auto_play_timer);
            let doc_attr = that.document_info.attr;
            let page_attr = that.document_pages[that.page_number] && that.document_pages[that.page_number].attr;
            // 全屏演示状态下自动播放执行 需 文档自动循环演示 或 单页自动演示
            that.auto_play = ((doc_attr && doc_attr['playType'] === 'autoloop') || (page_attr && page_attr['playType'] === 'auto'));
        },
        // 间隔 3秒 自动切换下一页文档页  由 SvgPageModal 自定义事件触发
        auto_switch_next() {
            let that = this;
            that.auto_play_timer = setTimeout(() => {
                that.page_next();
            }, 3000);
        },

        /**
         * 手势操作方法
         */
        touchstart(e) {
            let touch_point = e.touches[0];
            if (!touch_point) {
                return;
            }
            this.point.x = touch_point.pageX;
            this.point.y = touch_point.pageY;
            let $ele_item = $(e.target).parents('.ele_item[data-type][data-group]');
            // a标签不拦截默认事件
            if (this.h5_mode) {
                if ($ele_item.length && $(e.target).is('a')) {
                    return;
                }
                // 有设置链接的元素不拦截默认事件
                if ($ele_item.length && $ele_item.find('.ele_rotate').attr('title')) {
                    return;
                }
                e.preventDefault();
            }
        },
        // 竖屏滑动方法
        vertical_touchend(e) {
            let that = this;
            let touch_point = e.changedTouches[0];
            let gap = that.point.y - touch_point.pageY;
            let threshold = 20;
            switch (true) {
                // 下滑
                case gap > threshold:
                    that.event_tool(false);
                    // h5模式 单页 翻页
                    if (that.h5_mode) {
                        that.page_switch_control('next');
                    }
                    break;
                // 上滑
                case gap < 0 && Math.abs(gap) > threshold:
                    that.event_tool(true);
                    // h5模式 单页 翻页
                    if (that.h5_mode) {
                        that.page_switch_control('prev');
                    }
                    break;
                // 点击
                default:
                    setTimeout(() => {
                        that.event_tool(!that.tool);
                    }, 300);
                    break;
            }
        },
        // 竖屏状态滚动方法
        vertical_scroll_slide(e) {
            let that = this;
            let top = e.target.scrollTop;
            if (top === 0) {
                return that.page_number = 0;
            }
            let height = e.target.scrollHeight;
            let max_length = that.document_pages.length - 1;
            if (top + that.window_height >= height) {
                return that.page_number = max_length;
            }
            let item_height = $(e.target).find('.svg_list').height() + 4;
            if (that.page_number <= max_length) {
                that.page_number = Math.ceil((top + item_height / 2) / item_height) - 1;
            }
        },
        // 横屏滑动方法
        horizontal_touchend(e) {
            let that = this;
            let touch_point = e.changedTouches[0];
            let gap_x = that.point.x - touch_point.pageX;
            let gap_y = that.point.y - touch_point.pageY;
            let threshold = 50;
            switch (true) {
                // 左滑
                case gap_y > threshold || gap_x > threshold:
                    that.page_switch_control('next');
                    that.event_tool(false);
                    break;
                // 右滑
                case (gap_y < 0 && Math.abs(gap_y) > threshold) || (gap_x < 0 && Math.abs(gap_x) > threshold):
                    that.page_switch_control('prev');
                    that.event_tool(false);
                    break;
                // 点击
                default:
                    setTimeout(() => {
                        that.event_tool(!that.tool);
                        that.show_thumbnail = !that.show_thumbnail;
                    }, 300);
                    break;
            }
        },
        // 横屏状态最后一页滑动
        out_horizontal(e) {
            this.event_screen('vertical');
            // 重置页码
            this.page_number = 0;
        },

        /**
         * 媒体&动画
         */
        // 检测当前浏览器是否能自动播放
        media_can_autoplay() {
            let that = this;
            let isshow_canplay_modal = false;
            let $all_media = $(`
                .h5_BGM_container audio[data-autoplay="true"],
                .BGM_container audio[data-autoplay="true"],
                .slides_body .slide_page.show audio[data-autoplay="true"],
                .slides_body .slide_page.show video[data-autoplay="true"]
            `);
            $all_media.each((index, el) => {
                let promise = el.play();
                if (promise) {
                    // 检测是否能自动播放
                    promise.then(res => {
                        // can autoplay
                    }).catch(err => {
                        console.error('自动播放失败：', err);
                        // 不能自动播放
                        if (!isshow_canplay_modal) {
                            isshow_canplay_modal = true;
                            that.$modal({
                                modalClass: 'canplay-modal',
                                modalTitle: '温馨提示',
                                modalContent: '当前浏览器不支持音频自动播放，是否手动开启？',
                                buttonSubmitTxt: '开启',
                                zIndex: 999,
                                submitCallback: (modal) => {
                                    $all_media.each((i, e) => {
                                        e.play();
                                    });
                                    modal.close();
                                },
                            });
                        }
                    });
                }
            });
        },
        // 背景音乐播放开始
        BGM_start_play(event) {
            let that = this;
            let audio = event.target;
            // 渐强渐弱
            let option = opt_factory.init_opt('audio');
            option.fadein_and_fadeout(audio);
        },
        // 背景音乐暂停播放
        BGM_toggle_play(event) {
            let bgm = this.$refs.BGM_container;
            let audio = bgm.querySelector('audio');
            if (!audio) {
                return;
            }
            if (audio.paused) {
                audio.play();
            } else {
                audio.pause();
            }
        },
        // h5 背景音乐暂停播放
        h5_BGM_toggle_play(event) {
            let bgm = this.$refs.h5_BGM_container;
            let audio = bgm.querySelector('audio');
            if (!audio) {
                return;
            }
            if (audio.paused) {
                audio.play();
            } else {
                audio.pause();
            }
        },
        // 背景音乐播放暂停图标动画
        BGM_playing_animation(event) {
            let bgm = this.$refs.BGM_container;
            let audio = event.target;
            let is_play = !audio.paused;
            $(bgm).toggleClass('playing', is_play);
            // 放映时隐藏
            let is_hideonshow = audio.getAttribute('data-hideonshow') === 'true';
            if (is_hideonshow) {
                $(bgm).css('visibility', is_play ? 'hidden' : 'visible');
            }
        },
        // h5 背景音乐
        h5_BGM_playing_animation(event) {
            let bgm = this.$refs.h5_BGM_container;
            let audio = event.target;
            let is_play = !audio.paused;
            $(bgm).toggleClass('playing', is_play);
            // 放映时隐藏
            let is_hideonshow = audio.getAttribute('data-hideonshow') === 'true';
            if (is_hideonshow) {
                $(bgm).css('visibility', is_play ? 'hidden' : 'visible');
            }
        },
        // 所有页 媒体 停止播放并重置播放进度
        media_element_pause() {
            let $show_page = $('.SP_transition_div');
            // 媒体暂停
            let $media = $show_page.find('video, audio');
            $media.each((i, item) => {
                item.currentTime = 0;
                item.pause();
            });
            // iframe
            let $iframe = $show_page.find('iframe');
            $iframe.removeAttr('src');
        },
        // 当前页 媒体 运行自动播放
        media_autoplay_start() {
            let $show_page = $('.SP_transition_div').find('.wap_page[data-show]');
            // 媒体播放
            let $media = $show_page.find('video[data-autoplay="true"], audio[data-autoplay="true"]');
            $media.each((i, item) => {
                item.play();
            });
            // iframe
            let $iframe = $show_page.find('iframe');
            $iframe.attr('src', $iframe.attr('data-src'));
        },
        // 等待媒体播放结束执行
        media_autoplay_wait(callback) {
            let that = this;
            let duration_arr = [0];
            // 自动播放开始
            that.media_autoplay_start();
            let $show_page = $('.SP_transition_div').find('.wap_page[data-show]');
            // 获取媒体最大时长
            let $media = $show_page.find('video[data-autoplay="true"], audio[data-autoplay="true"]');
            $media.each((i, item) => {
                duration_arr.push(Math.ceil(item.duration));
            });
            setTimeout(() => {
                if (typeof callback === 'function') callback();
            }, Math.max.apply(null, duration_arr) * 1000);
        },
        // 返回正在播放的所有媒体，并暂停
        media_hidden_pause() {
            let slide = document.querySelector('.slides_body');
            let media_arr = Array.from(slide.querySelectorAll('audio, video'));
            let playing_arr = [];
            media_arr.forEach(item => {
                if (!item.paused) {
                    playing_arr.push(item);
                    item.pause();
                }
            });
            return playing_arr;
        },
        // 全屏演示时设置页面元素动画
        start_page_animation() {
            let that = this;
            let list = that.document_pages[that.page_number];
            if (!list) {
                return;
            }
            // h5演示模式默认播放动画
            if (that.h5_mode) {
                // 媒体元素开始自动播放
                that.media_autoplay_start();
            } else {
                if (that.screenType === 'vertical') {
                    return;
                }
                // 禁用动画状态下  媒体自动播放正常流程
                if (!that.enable_animation) {
                    that.media_autoplay_start();
                    return;
                }
            }
            that.start_auto_play();
            // h5模式强制自动播放动画
            if (that.h5_mode) {
                that.h5_auto_play = true;
            }
            // 创建动画并执行
            element_animate.buildAnimation({
                contain: document.querySelector('.SP_transition_div .wap_page[data-show]'),
                elementList: list.elementList,
                autoplay: that.h5_auto_play || that.auto_play,
                playTrigger: document.querySelector('.start-animation-container'),
                animationEnd: () => {
                    // h5模式竖屏状态无需自动翻页
                    if (that.h5_mode) {
                        that.h5_auto_play = false;
                        if (that.screenType === 'vertical') {
                            that.stop_auto_play();
                            return;
                        }
                    }
                    // 动画结束 媒体自动播放 并等待播放结束
                    that.media_autoplay_wait(() => {
                        if (that.auto_play) {
                            that.auto_switch_next();
                        }
                    });
                },
            });
        },
        // 重置指定的文档页动画元素
        reset_page_animation(index) {
            let that = this;
            let list = that.document_pages[that.page_number];
            if (!that.enable_animation || !list) {
                return;
            }
            let $edit_page = $('.SP_transition_div .wap_page').eq(that.page_number);
            // 重置至动画播放前状态
            element_animate.resetTobefore($edit_page, list.elementList);
        },
        // 清除全部页动画
        clear_all_animation() {
            let $page = $('.SP_transition_div .wap_page');
            $('.start-animation-container').html('');
            element_animate.clearAll($page);
        },

        /**
         * 传递给父组件的事件
         */
        // 工具栏显示/隐藏
        event_tool(state) {
            this.$emit('sendToolbar', state);
        },
        // 横竖屏设置
        event_screen(type) {
            this.$emit('sendScreen', type);
        },
    },
};
</script>

<style lang="less">
.modal.canplay-modal {
    .modal-header,
    .modal-body,
    .modal-footer {
        text-align: center;
    }
}
</style>
<style lang="less" scoped>
@keyframes rotate {
    from { transform: rotate(0); transform-origin: center center; }
    to { transform: rotate(360deg); transform-origin: center center; }
}
// 文档主体
.slides_body {
    position: relative;
    width: 100%;
    height: 100%;
    overflow: hidden;
    // 竖屏状态
    .slides_vertical {
        position: relative;
        width: 100%;
        height: 100%;
        overflow-x: hidden;
        overflow-y: auto;
        &.flex_center {
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
        }
        .wap_page {
            width: 100%;
            height: 100%;
        }
        .normal_wap_page {
            .wap_page {
                font-size: 0;
                overflow: hidden;
            }
        }
        .h5_wap_page {
            position: relative;
            width: 100%;
            height: 100%;
            overflow: hidden;
            .wap_page {
                position: absolute;
            }
        }
        // 翻页过渡动画
        // 向前翻页
        .svg-pre-enter-to {
            opacity: 1;
            transform: translateY(0);
            transition: all 0.4s linear;
        }
        .svg-pre-leave-active {
            opacity: 0;
            transform: translateY(10%);
            transition: all 0.4s linear;
        }
        .svg-pre-enter {
            opacity: 0;
            transform: translateY(-10%);
        }
        .svg-pre-leave {
            opacity: 1;
            transform: translateY(0);
        }
        // 向后翻页
        .svg-next-enter-to {
            opacity: 1;
            transform: translateY(0);
            transition: all 0.4s linear;
        }
        .svg-next-leave-active {
            opacity: 0;
            transform: translateY(-10%);
            transition: all 0.4s linear;
        }
        .svg-next-enter {
            opacity: 0;
            transform: translateY(10%);
        }
        .svg-next-leave {
            opacity: 1;
            transform: translateY(0);
        }
    }
    // 横屏状态
    .slides_horizontal {
        position: fixed;
        left: 0;
        top: 0;
        width: 100%;
        height: 100%;
        overflow: hidden;
        .wap_page {
            position: absolute;
            width: 100%;
            height: 100%;
        }
        .last_page_tip {
            background-color: #1c1c1c;
            & > p {
                position: absolute;
                left: 0;
                right: 0;
                top: 50%;
                line-height: 2rem;
                margin-top: -1rem;
                color: #ffffff;
                font-size: 0.8rem;
                text-align: center;
            }
        }
        // 翻页过渡动画
        // 向前翻页
        .svg-pre-enter-to {
            transform: translateX(0);
            transition: all 0.5s ease-in-out;
        }
        .svg-pre-leave-active {
            transform: translateX(100%);
            transition: all 0.5s ease-in-out;
        }
        .svg-pre-enter {
            transform: translateX(-100%);
        }
        .svg-pre-leave {
            transform: translateX(0);
        }
        // 向后翻页
        .svg-next-enter-to {
            transform: translateX(0);
            transition: all 0.5s ease-in-out;
        }
        .svg-next-leave-active {
            transform: translateX(-100%);
            transition: all 0.5s ease-in-out;
        }
        .svg-next-enter {
            transform: translateX(100%);
        }
        .svg-next-leave {
            transform: translateX(0);
        }
    }
    // tranName 动画组件
    .SP_transition_div {
        width: 100%;
        height: 100%;
    }
    .outside_video_tips {
        position: absolute;
        top: 50%;
        left: 0;
        right: 0;
        z-index: 2;
        margin-top: -0.7rem;
        line-height: 1.4rem;
        text-align: center;
        color: #ffffff;
        font-size: 1rem;
        white-space: nowrap;
    }
}
.start-animation-container {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 1;
    &:empty {
        z-index: -1;
    }
}

// 缩略图
.thumbnail {
    position: fixed;
    bottom: -4rem;
    left: 0;
    right: 0;
    display: flex;
    justify-content: flex-start;
    align-items: center;
    min-width: 100%;
    height: 4rem;
    padding: 0.65rem 0.375rem;
    overflow-x: scroll;
    overflow-y: hidden;
    background-color: rgba(0, 0, 0, 0.8);
    -webkit-overflow-scrolling: touch;
    transition: bottom 0.1s;
    &.show {
        bottom: 0;
    }
    .thumbnail_list {
        position: relative;
        border: 2px solid transparent;
        &::before {
            content: "";
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            z-index: 1;
            opacity: 0;
        }
        &::after {
            content: attr(data-pagenum);
            position: absolute;
            top: 0;
            right: 0;
            z-index: 2;
            padding: 0 0.2rem;
            height: 0.8rem;
            line-height: 0.8rem;
            text-align: center;
            color: #fff;
            font-size: 0.3rem;
            background-color: rgba(0, 0, 0, 0.5);
        }
        & + .thumbnail_list {
            margin-left: 10px;
        }
        &.check {
            border-color: var(--mainColor);
            &::after {
                background-color: var(--mainColor);
            }
        }
        .thumbnail_svg {
            max-height: 3rem;
            overflow: hidden;
        }
    }
}

// 页码
.page_number_total {
    position: fixed;
    bottom: 1.5rem;
    left: 1rem;
    z-index: 2;
    padding: 0 0.8em;
    height: 1.6rem;
    line-height: 1.54rem;
    background-color: #ffffff;
    box-shadow: 0rem 0.23rem 0.18rem 0rem rgba(0, 0, 0, 0.13);
    border-radius: 0.8rem;
    border: solid 0.03rem #e6e6e6;
    text-align: center;
    color: #5f656d;
    font-size: 0.62rem;
    span {
        color: var(--mainColor);
    }
}
.page_number_list {
    position: fixed;
    top: 0;
    left: 0;
    z-index: 21;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.5);
    text-align: center;
    &::after {
        content: "";
        display: inline-block;
        vertical-align: middle;
        width: 0;
        height: 100%;
    }
    .list_contain {
        display: inline-block;
        vertical-align: middle;
        width: 80%;
        height: 40%;
        padding: 2rem 0;
        border-radius: 6px;
        background-color: #fff;
        overflow: hidden;
        &::after {
            content: "";
            display: inline-block;
            vertical-align: middle;
            text-align: center;
        }
    }
    ul {
        height: 100%;
        padding: 0 3rem;
        overflow-y: auto;
    }
    li {
        display: block;
        color: #000;
        height: 2.185rem;
        font-size: 0.6rem;
        text-align: center;
        line-height: 2.185rem;
        border-bottom: 1px solid #ddd;
        &:last-child {
            border-bottom: none;
        }
        .blue {
            color: var(--mainColor);
        }
    }
    .cancel {
        display: block;
        margin-right: 1rem;
        line-height: 2.185rem;
        font-size: 0.6rem;
        text-align: right;
        color: var(--mainColor);
    }
}

// 背景音乐
.BGM_container {
    position: fixed;
    top: 2.5rem;
    right: 0;
    z-index: 20;
    width: 2rem;
    height: 1.8rem;
    padding: 0.2rem;
    border-radius: 0.9rem 0 0 0.9rem;
    background-color: var(--mainColor);
    opacity: 0.6;
    transition: all 0.2s;
    &:active {
        opacity: 1;
    }
    &.playing {
        .record {
            &::before {
                display: none;
            }
            img {
                opacity: 1;
                animation-play-state: running;
            }
        }
    }
    .record {
        position: relative;
        width: 1.4rem;
        height: 1.4rem;
        border-radius: 50%;
        background-color: #ffffff;
        &::before {
            content: "";
            position: absolute;
            top: 0.35rem;
            left: 0.5rem;
            width: 0;
            height: 0;
            border-top: 0.35rem solid transparent;
            border-bottom: 0.35rem solid transparent;
            border-right: 0.5rem solid transparent;
            border-left: 0.5rem solid var(--mainColor);
        }
        img {
            display: block;
            width: 100%;
            height: 100%;
            opacity: 0;
            animation-name: rotate;
            animation-duration: 5s;
            animation-timing-function: linear;
            animation-iteration-count: infinite;
            animation-play-state: paused;
        }
    }
    audio {
        display: none;
    }
}
.h5_BGM_container {
    position: fixed;
    top: 3rem;
    right: 1.5rem;
    z-index: 20;
    width: 1.5rem;
    height: 1.5rem;
    overflow: hidden;
    &::before {
        content: "";
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        z-index: 1;
        margin: auto;
        width: 80%;
        height: 2px;
        transform: rotate(45deg);
        background-color: rgb(211, 90, 90);
    }
    &.playing {
        &::before {
            display: none;
        }
        img {
            animation-play-state: running;
        }
    }
    img {
        display: block;
        width: 100%;
        height: 100%;
        cursor: pointer;
        animation-name: rotate;
        animation-duration: 5s;
        animation-timing-function: linear;
        animation-iteration-count: infinite;
        animation-play-state: paused;
    }
    audio {
        display: none;
    }
}
</style>