<template>
    <div class="slides_body" :style="{'width': fullScreen ? '100%' : `${svg_w}px`, 'height': fullScreen ? '100%' : `${svg_h}px`}">
        <div class="slides_list" 
            ref="slides_container" 
            @click="click_switch_next"
        >
            <div class="slide_page" 
                v-for="(item, index) in defer_document_pages" 
                :key="index" 
                :data-switch="String(switch_type)" 
                :style="{'width': fullScreen ? '100%' : `${svg_w}px`, 'height': fullScreen ? '100%' : `${svg_h}px`}"
            >
                <svg_modal ref="svg_modal"
                    :svg_w="svg_w"
                    :svg_h="svg_h"
                    :svg_view="svg_view"
                    :document="document_info"
                    :page_info="item"
                    :use_link="true"
                    :use_chart="true"
                    :use_audio="true"
                    :use_video="`all`"
                    :mode="`preload`"
                    :lazyshow="Math.abs(index - page_number) < 3"
                ></svg_modal>
            </div>
            <div v-if="fullScreen" class="last_page_tips">
                <p>演示结束，单击退出全屏</p>
            </div>
        </div>
        <!-- 翻页按钮 -->
        <a href="javascript:;" class="prev_btn" v-show="!flip_btn_hide && !fullScreen && page_number > 0" :style="{'margin-left': `-${svg_w / 2 + 75}px`}" @click="set_page_switch('prev')" v-bdtongji="'演示页面-预览状态-预览区-左侧-左切换'"></a>
        <a href="javascript:;" class="next_btn" v-show="!flip_btn_hide && !fullScreen && page_number < (document_pages.length - 1)" :style="{'margin-left': `${svg_w / 2 + 25}px`}" @click="set_page_switch('next')" v-bdtongji="'演示页面-预览状态-预览区-左侧-右切换'"></a>
        <!-- 背景音乐图标 -->
        <div class="BGM_container" 
            ref="BGM_container"
            v-if="!h5_mode && (document_info.attr && document_info.attr.backgroundMusic && document_info.attr.backgroundMusic.src)" 
        >
            <div class="record" @click="BGM_toggle_play">
                <img v-webp="require(`@/assets/pc/images/common/record_w.png`)" alt="">
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
            v-if="h5_mode && (document_info.attr && document_info.attr.backgroundMusic && document_info.attr.backgroundMusic.src)" 
        >
            <img v-webp="require(`@/assets/pc/images/common/record.png`)" alt="" @click="h5_BGM_toggle_play">
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
        <!-- 音频控件 -->
        <div class="media_controls_container"></div>
        <!-- 动画触发器 -->
        <div class="start-animation-container"></div>
        <!-- 全屏缩略图 -->
        <a href="javascript:void(0)" 
            v-show="!fullScreen && usePageStyle"
            class="toggle_btn" 
            :class="{'open': showThumbNail}"
            v-tooltip.top="showThumbNail ? '隐藏' : '显示'"
            @click.stop="toggleThumbNail"></a>
        <div class="full_thumbnail_align" @click.stop
            :class="{'page': usePageStyle, 'show': (usePageStyle && showThumbNail) || fullScreen, 'full': fullScreen && usePageStyle}" 
            v-if="renderstate === 'end'" 
            :style="{'visibility': fullScreen || usePageStyle ? 'visible' : 'hidden'}">
            <div class="full_thumbnail_list"
                v-for="(item, index) in defer_document_pages" 
                :key="index" 
                :class="{'checked': page_number === index}" 
                @click.stop="page_switch_control(index)" 
            >
                <div class="thumbnail"
                    :style="!usePageStyle ? 
                        {'width': `${60 / (document_info.height / document_info.width)}px`, 'height': '60px'} 
                        : {'width': `${110 / (document_info.height / document_info.width)}px`, 'height': '110px'}  ">
                    <svg_modal ref="thumbnail"
                        :svg_w="!usePageStyle ? (60 / (document_info.height / document_info.width)) : (110 / (document_info.height / document_info.width))"
                        :svg_h="!usePageStyle ? 60 : 110"
                        :svg_view="[0, 0, document_info.width, document_info.height]"
                        :document="document_info"
                        :page_info="item"
                        :mode="`thumbnail`"
                    ></svg_modal>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import svg_modal from '@/components/SvgPageModal.vue';
import opt_factory from '@/assets/pc/js/opt/opt_factory.js';
import element_animate from '@/assets/pc/js/element_animate.js';
import MediaControls from '@/assets/common/js/media_controls.js';
import page_opt from '@/assets/pc/js/opt/page_opt.js';

export default {
    name: 'Slides',
    components: {
        svg_modal,
    },
    props: {
        svg_w: Number,
        svg_h: Number,
        svg_view: {
            type: Array,
            default() {
                return [0, 0, 0, 0];
            },
        },
        document_info: Object,
        document_pages: {
            type: Array,
            default() {
                return [];
            },
        },
        fullScreen: Boolean,
        enable_deferrender: Boolean,    // 启用延迟渲染文档页
        enable_animation: Boolean,      // 启用动画
        auto_play_media: {              // 禁用动画时，可自动播放的媒体元素
            type: Array,
            default() {
                return [];
            },
        },
        h5_mode: Boolean,               // 使用 h5 模式
        flip_btn_hide: Boolean,         // 展示左右切换按钮
        usePageStyle: {
            type: Boolean,
            default: false
        }
    },
    data() {
        return {
            // 渲染状态， start -> pending -> end
            renderstate: 'start',
            // 延迟更新文档页列表
            defer_document_pages: [],

            switch_type: null,
            page_number: 0,
            auto_play: false,
            auto_play_timer: null,
            changing: false,
            showThumbNail: false,
        }
    },
    watch: {
        // 文档渲染完成
        document_pages(n, o) {
            let that = this;
            that.ready_defer_rendering(() => {
                that.change_page();
                that.media_can_autoplay();
            });
        },
        // 进入/退出全屏
        fullScreen(n, o) {
            this.$nextTick(() => {
                if (n) {
                    this.start_page_animation();
                } else {
                    this.clear_all_animation();
                    this.stop_auto_play();
                }
            });
        },
        page_number() {
            this.event_page_number();
            this.thumbnail_scroll_center();
        }
    },
    mounted() {
        let that = this;
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
         * 文档页初始化方法
         */
        // 文档页延迟渲染
        ready_defer_rendering(first, done) {
            let that = this;
            if (that.enable_deferrender) {
                let next = function (i) {
                    let index = i;
                    let item = that.document_pages[index];
                    if (item) {
                        that.defer_document_pages.push(item);
                        that.$nextTick(() => {
                            if (index === 0) {
                                that.$emit('renderFirst');
                                if (typeof first === 'function') first();
                            }
                            index += 1;
                            setTimeout(() => {
                                next(index);
                            }, 48);
                        });
                    } else {
                        that.$emit('renderDone');
                        that.renderstate = 'end';
                        if (typeof done === 'function') done();
                    }
                }
                next(0);
                that.renderstate = 'pending';
            } else {
                that.defer_document_pages = that.document_pages;
                that.$nextTick(() => {
                    that.$emit('renderFirst');
                    if (typeof first === 'function') first();
                    that.$emit('renderDone');
                    that.renderstate = 'end';
                    if (typeof done === 'function') done();
                });
            }
        },
        /**
         * 向父组件发送的事件
         */
        event_page_number() {
            this.$emit('sendPageNumber', this.page_number);
        },
        event_preview_end() {
            this.$emit('sendOutFull');
        },
        /**
         * 翻页
         */
        // 直接设置页码，需要执行此方法要在初始化前调用
        set_page_number(number = 0) {
            this.page_number = number;
        },
        // 切换控制，用于拦截 action = 'next' || 'prev' || Number
        page_switch_control(action) {
            // 切换中状态
            if (this.changing) {
                return;
            }
            // 自动播放无法触发
            if (this.auto_play) {
                return;
            }
            // 动画正在播放时，禁止翻页
            if ($('.start-animation-container').children().length > 0) {
                return;
            }
            this.set_page_switch(action);
        },
        // 上下翻页方法   gradual = 'next' || 'prev' || Number
        set_page_switch(gradual) {
            // 切换中状态
            if (this.changing) {
                return;
            }
            let index = this.page_number;
            switch (true) {
                case !isNaN(Number(gradual)):
                    index = Number(gradual);
                    break;
                case gradual === 'next':
                    index++;
                    break;
                case gradual === 'prev':
                    index--;
                    break;
            }
            this.set_page(index);
        },
        // 设置页码
        set_page(number) {
            let that = this;
            let index = number;
            // 切换中状态
            if (that.changing) return;
            // 非数字
            if (isNaN(index)) return;
            // 第一页
            if (index < 0) return;
            // 当前页
            if (Number(index) === Number(that.page_number)) return;
            let $end_page = $('.last_page_tips');
            // 最后一页
            if (index >= that.document_pages.length) {
                // 非全屏状态下
                if (!that.fullScreen) return;
                let autoloop = that.document_info.attr && that.document_info.attr['playType'] === 'autoloop';
                // 自动循环演示
                if (autoloop) {
                    // 自动循环，重新开始回到第一页
                    index = 0;
                } else {
                    that.stop_auto_play();
                    index = that.document_pages.length - 1;
                    // 已显示演示结束页
                    if ($end_page.hasClass('show')) {
                        that.changing = false;
                        that.event_preview_end();
                    } else {
                        // 显示结束页
                        that.changing = true;
                        $end_page.addClass('show');
                        // 动画 媒体全部停止
                        that.clear_all_animation();
                        that.media_element_pause();
                        setTimeout(() => {
                            that.changing = false;
                        }, 300);
                    }
                    return;
                }
            } else {
                // 已显示演示结束页
                if ($end_page.hasClass('show')) {
                    index = that.document_pages.length - 1;
                }
                $end_page.removeClass('show');
            }
            that.changing = true;
            that.page_number = index;
            // 切换文档页
            that.$nextTick(() => {
                that.change_page();
            });
        },
        // 停止自动播放
        stop_auto_play() {
            clearTimeout(this.auto_play_timer);
            this.auto_play = false;
        },
        // 开始自动播放
        start_auto_play() {
            let that = this;
            let auto_play = false;
            clearTimeout(that.auto_play_timer);
            let doc_attr = that.document_info.attr;
            let page_attr = that.document_pages[that.page_number] && that.document_pages[that.page_number].attr;
            // 全屏演示状态下自动播放执行 需 文档自动循环演示 或 单页自动演示
            that.auto_play = ((doc_attr && doc_attr['playType'] === 'autoloop') || (page_attr && page_attr['playType'] === 'auto')) && that.fullScreen;
        },
        // 间隔 3秒 自动切换下一页文档页  由 SvgPageModal 自定义事件触发
        auto_switch_next() {
            let that = this;
            that.auto_play_timer = setTimeout(() => {
                that.set_page_switch('next');
            }, 3000);
        },
        // 手动点击切换
        click_switch_next() {
            let that = this;
            if (that.auto_play || !that.fullScreen) {
                return;
            }
            that.page_switch_control('next');
        },
        // 切换页效果
        change_page() {
            let that = this;
            let $slide = $(that.$refs.slides_container).find('.slide_page');
            let $show = $(that.$refs.slides_container).find('.slide_page.show');
            let prev_index = $show.index();
            let index = that.page_number;
            let $new_slide = $slide.eq(index);
            that.switch_type = that.document_pages[index] && that.document_pages[index].switchType;
            that.$nextTick(() => {
                // 重置下页元素动画的动画前效果
                that.reset_page_animation(index);
                // 媒体元素暂停播放
                that.media_element_pause();
                let next = () => {
                    that.changing = false;
                    // 执行动画
                    that.start_page_animation();
                    // 媒体控件生成
                    that.media_controls_ready();
                }
                if (prev_index < 0) {
                    $new_slide.addClass('show');
                    next();
                } else {
                    // 执行切换效果
                    page_opt.switch_effect_case({
                        type: that.switch_type,
                        isIn: prev_index < index,
                        in: $new_slide,
                        out: $show,
                        complete: () => {
                            $show.removeClass('show in out prev_in prev_out next_in next_out');
                            $new_slide.addClass('show').removeClass('in out prev_in prev_out next_in next_out');
                            next();
                        },
                    });
                }
            });
        },
        // 缩略图居中
        thumbnail_scroll_center() {
            let that = this;
            if (!that.fullScreen && !that.usePageStyle) {
                return;
            }
            that.$nextTick(() => {
                // 纵向滚动
                let $contain = $('.full_thumbnail_align');
                let $checked = $contain.find('.full_thumbnail_list.checked');
                if ($contain.length === 0 || $checked.length === 0) {
                    return;
                }
                let contain_width = $contain.outerWidth();
                let list_width = $checked.outerWidth();
                let current_left = $checked[0].offsetLeft;
                let scroll_left = current_left - (contain_width - list_width) / 2;
                if (scroll_left < 0) {
                    scroll_left = 0;
                }
                $contain.animate({
                    'scrollLeft': scroll_left
                });
            });
        },

        /**
         * 元素级处理、动画
         */
        // 全屏演示时设置页面元素动画
        start_page_animation() {
            let that = this;
            let list = that.document_pages[that.page_number];
            if (!list) {
                return;
            }
            // 非全屏状态下不执行动画  媒体自动播放正常流程
            if (!that.fullScreen) {
                that.media_autoplay_start();
                return;
            }
            // 禁用动画状态下
            if (!that.enable_animation) {
                // 指定媒体自动播放
                let $show_page = $(that.$refs.slides_container).find('.slide_page.show');
                that.auto_play_media.forEach(item => {
                    $show_page.find(`#${item} audio, #${item} video`).attr('data-autoplay', 'true');
                });
                // 自动切换页
                that.start_auto_play();
                // 媒体自动播放 并等待播放结束
                that.media_autoplay_wait(() => {
                    if (that.auto_play) {
                        that.auto_switch_next();
                    }
                });
                return;
            }
            // 自动切换页
            that.start_auto_play();
            // 创建动画并执行
            element_animate.buildAnimation({
                contain: that.$refs.slides_container.querySelector('.slide_page.show'),
                elementList: list.elementList,
                autoplay: that.auto_play,
                playTrigger: document.querySelector('.start-animation-container'),
                animationEnd: () => {
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
            if (!that.enable_animation || !list || !that.fullScreen) {
                return;
            }
            let $edit_page = $(that.$refs.slides_container).find('.slide_page').eq(that.page_number);
            // 重置至动画播放前状态
            element_animate.resetTobefore($edit_page, list.elementList);
        },
        // 清除全部页动画
        clear_all_animation() {
            let $page = $(this.$refs.slides_container).find('.slide_page');
            $('.start-animation-container').html('');
            element_animate.clearAll($page);
        },

        /**
         * 媒体功能
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
                        let $body = document.querySelector('.slides_container');
                        if (!$body) {
                            return;
                        }
                        // 不能自动播放
                        if (!isshow_canplay_modal) {
                            isshow_canplay_modal = true;
                            that.$modal({
                                $parent: $body,
                                modalClass: 'canplay-modal',
                                modalTitle: '温馨提示',
                                modalContent: '当前浏览器不支持音频自动播放，是否手动开启？',
                                buttonSubmitTxt: '开启',
                                zIndex: 1001,
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
        // 音频媒体控件渲染、定位、相关事件绑定
        media_controls_ready() {
            let that = this;
            let $audio = $(that.$refs.slides_container).find('.slide_page.show .ele_item[data-type="audio"]');
            let option = opt_factory.init_opt('audio');
            let container = $('.media_controls_container');
            // 音频元素生成控件
            $audio.each((index, el) => {
                let $el = $(el);
                let id = $el.attr('id');
                let audio = $el.find('audio')[0];
                // 不存在audio 或 已生成控件
                if (!audio || document.getElementById(`control-${id}`)) {
                    return;
                }
                let controls = MediaControls(audio, container[0], id);
                // 音频加载完成
                controls.loaded(() => {
                    let $control = $(`#${controls.control}`);
                    // 音频控件交互
                    let timer;
                    $el.find('.audio_layer').on('mouseenter', e => {
                        clearTimeout(timer);
                        let rect = e.currentTarget.getBoundingClientRect();
                        let page_rect = that.$refs.slides_container.getBoundingClientRect();
                        let control_width = 295;
                        let control_height = 40;
                        let top = (rect.height - control_height) / 2 + rect.top;  // 40 = 控件高度
                        let left = rect.left - (control_width - rect.width) / 2;
                        if (left < page_rect.left) {
                            left = page_rect.left;
                        } else if (left + control_width > page_rect.width + page_rect.left) {
                            left = page_rect.left + page_rect.width - control_width;
                        }
                        $control.show().css({
                            'top': `${top}px`,
                            'left': `${left}px`,
                        });
                    }).on('mouseleave', e => {
                        timer = setTimeout(() => {
                            $control.hide();
                        }, 100);
                    });
                    $control.on('mouseenter', e => {
                        clearTimeout(timer);
                    }).on('mouseleave', e => {
                        $control.hide();
                    });
                });
            });
            // 背景音乐生成控件
            if (!document.getElementById(`control-BGM_container`)) {
                let bgm = that.$refs.BGM_container;
                let bgm_audio = bgm && bgm.querySelector('audio');
                if (bgm_audio) {
                    MediaControls(bgm_audio, bgm, 'BGM_container');
                }
            }
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
            let that = this;
            let $contain = $(that.$refs.slides_container);
            // 媒体暂停
            let $media = $contain.find('.slide_page video, audio');
            $media.each((i, item) => {
                item.currentTime = 0;
                item.pause();
            });
            // iframe
            let $iframe = $contain.find('.slide_page iframe');
            $iframe.removeAttr('src');
        },
        // 当前页 媒体 运行自动播放
        media_autoplay_start() {
            let that = this;
            let $show_page = $(that.$refs.slides_container).find('.slide_page.show');
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
            let $show_page = $(that.$refs.slides_container).find('.slide_page.show');
            let $media = $show_page.find('video[data-autoplay="true"], audio[data-autoplay="true"]');
            if ($media.length) {
                // 等待视频加载
                setTimeout(() => {
                    // 获取媒体最大时长
                    $media.each((i, item) => {
                        duration_arr.push(Math.ceil(item.duration));
                    });
                    let timer = Math.max.apply(null, duration_arr) - 1;
                    setTimeout(() => {
                        if (typeof callback === 'function') callback();
                    }, timer * 1000);
                }, 1000);
            } else {
                if (typeof callback === 'function') callback();
            }
        },
        // 返回正在播放的所有媒体，并暂停
        media_hidden_pause() {
            let slide = document.querySelector('.slides_body');
            let playing_arr = [];
            if (!slide) {
                return playing_arr;
            }
            let media_arr = Array.from(slide.querySelectorAll('audio, video'));
            media_arr.forEach(item => {
                if (!item.paused) {
                    playing_arr.push(item);
                    item.pause();
                }
            });
            return playing_arr;
        },
        toggleThumbNail(type) {
            if (typeof type == 'boolean') {
                this.showThumbNail = type;
                return;
            }
            this.showThumbNail = !this.showThumbNail;
        },
    },
}
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
.slides_body {
    position: relative;
    width: 100%;
    height: 100%;
    .slides_list {
        position: relative;
        width: 100%;
        height: 100%;
        overflow: hidden;
        perspective: 1500px;
    }
    .slide_page {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        font-size: 0;
        transform: translate3d(0, 0, 0) scaleZ(1);
        will-change: transform;
        word-break: break-all;
    }
    .last_page_tips {
        display: none;
        position: absolute;
        top: 0;
        left: 0;
        z-index: 2;
        width: 100%;
        height: 100%;
        text-align: center;
        background-color: #000000;
        &.show {
            display: block;
        }
        &::after {
            content: "";
            display: inline-block;
            vertical-align: middle;
            width: 0;
            height: 100%;
            opacity: 0;
        }
        p {
            display: inline-block;
            vertical-align: middle;
            font-size: 42px;
            color: #ffffff;
        }
    }
    .prev_btn,
    .next_btn {
        position: absolute;
        top: 50%;
        left: 50%;
        width: 46px;
        height: 46px;
        margin-top: -23px;
        border-radius: 50%;
        background-color: #3c3c3c;
        z-index: 2;
        &::before {
            content: "";
            position: absolute;
            top: 2px;
            left: 0;
            bottom: 0;
            right: 0;
            margin: auto;
            width: 8px;
            height: 14px;
            background: url("~@/assets/pc/images/common/preview_sp.png") no-repeat;
        }
        &:hover{
            background-color: #ffffff;
            &::before {
                background-position-y: -17px;
            }
        }
    }
    .prev_btn::before {
        left: -3px;
        background-position: 0 -1px;
    }
    .next_btn::before {
        left: 2px;
        background-position: -23px -1px;
    }
    .toggle_btn{
        position: absolute;
        width: 40px;
        height: 16px;
        right: calc(50% - 20px);
        bottom: 0px;
        background: #3c3c3c;
        border-top-right-radius: 5px;
        border-top-left-radius: 5px;
        z-index: 1;
        transition: all .2s;
        &::after{
            content: '';
            position: absolute;
            top: 7px;
            right: 15px;
            width: 6px;
            height: 6px;
            border: 1px solid transparent;
            border-left-color: #fff;
            border-bottom-color: #fff;
            transform: rotate(135deg);
        }
        &.open{
            bottom: 130px;
            &::after{
                top: 2px;
                transform: rotate(-45deg);
            }
        }
    }
    // 全屏状态缩略图
    .full_thumbnail_align {
        position: absolute;
        left: 0;
        right: 0;
        bottom: -30px;
        height: 100px;
        padding: 5px 10px 0;
        background-color: rgba(0, 0, 0, 0.7);
        opacity: 0;
        font-size: 0;
        text-align: center;
        overflow-x: auto;
        overflow-y: hidden;
        transition: all .2s;
        white-space: nowrap;
        z-index: 100;
        &:hover {
            opacity: 1;
        }
        &::-webkit-scrollbar{
            display: none;
        }
        .full_thumbnail_list {
            position: relative;
            display: inline-block;
            vertical-align: top;
            width: auto;
            height: 60px;
            text-align: left;
            font-size: 12px;
            cursor: pointer;
            opacity: 0.6;
            white-space: normal;
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
            & + .full_thumbnail_list {
                margin-left: 10px;
            }
            &.checked {
                opacity: 1;
            }
        }
        &.page{
            bottom: -70px;
            height: 130px;
            padding: 10px;
            opacity: 1;
            bottom: -130px;
            .full_thumbnail_list{
                height: 110px;
                opacity: .8;
                &.checked{
                    opacity: 1;
                }
            }
            &.show{
                bottom: 0px;
            }
        }
        &.full{
            bottom: 0;
            opacity: 0;
            &:hover{
                opacity: 1;
            }
        }
    }
}
.start-animation-container {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 99;
    &:empty {
        z-index: -1;
    }
}
.media_controls_container {
    & /deep/ audio,
    & /deep/ .media-controls {
        display: none;
        position: fixed;
        width: 295px;
        top: -999px;
        left: -999px;
    }
}
.BGM_container {
    position: absolute;
    top: 70px;
    right: 0;
    z-index: 100;
    width: 40px;
    height: 38px;
    padding: 5px;
    opacity: 0.6;
    border-radius: 20px 0 0 20px;
    background-color: var(--mainColor);
    overflow: hidden;
    transition: all 0.2s;
    &::before {
        content: "";
        position: absolute;
        top: 0;
        left: -300px;
        right: 0;
        bottom: 0;
    }
    &:hover {
        opacity: 1;
        overflow: visible;
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
        width: 28px;
        height: 28px;
        border-radius: 50%;
        background-color: #ffffff;
        cursor: pointer;
        &::before {
            content: "";
            position: absolute;
            top: 7px;
            left: 10px;
            width: 0;
            height: 0;
            border-top: 7px solid transparent;
            border-bottom: 7px solid transparent;
            border-right: 10px solid transparent;
            border-left: 10px solid var(--mainColor);
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
    & /deep/ .media-controls {
        position: absolute;
        top: -1px;
        left: -300px;
        z-index: 2;
    }
}
.h5_BGM_container {
    position: absolute;
    top: 40px;
    right: 30px;
    z-index: 98;
    width: 40px;
    height: 40px;
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

@keyframes rotate {
    from { transform: rotate(0); transform-origin: center center; }
    to { transform: rotate(360deg); transform-origin: center center; }
}
</style>