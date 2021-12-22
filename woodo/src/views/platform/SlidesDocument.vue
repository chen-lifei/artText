<template>
    <div class="slides_container">
        <!-- 加载层 -->
        <loading_masking v-if="!loaddone"></loading_masking>

        <div class="slides_wrapper" :style="screen_style">
            <!-- 右上角退出全屏按钮 -->
            <div class="full_screen_out" v-show="fullScreen">
                <a href="javascript:;" class="out_full" @click="outFullScreen" v-bdtongji="'演示页面-全屏状态-右上角-右上角-取消全屏'"></a>
            </div>

            <!-- 演示区域 -->
            <div class="slides_middle" :style="{'height': fullScreen ? '100%' : 'auto'}">
                <!-- 演示区域头部 全屏需隐藏 -->
                <div class="slide_header" v-show="!fullScreen" :style="{'width': `${svg_w}px`}">
                    <p class="title">{{ document_info.title || '' }}</p>
                    <a href="javascript:;" class="full_srceen" title="全屏演示" @click="inFullScreen" v-bdtongji="'演示页面-预览状态-预览区-右上角-全屏'"></a>
                </div>

                <!-- 演示区域主体 -->
                <slides_main ref="slides_main"
                    :svg_w="svg_w"
                    :svg_h="svg_h"
                    :svg_view="svg_view"
                    :document_info="document_info"
                    :document_pages="document_pages"
                    :fullScreen="fullScreen"
                    :enable_animation="enable_animation"
                    :auto_play_media="auto_play_media"
                    @sendPageNumber="async_page_number"
                    @sendOutFull="async_out_full"
                ></slides_main>

                <!-- 演示区域尾部 全屏需隐藏 -->
                <div class="slide_footer" v-show="!fullScreen" :style="{'width': `${svg_w}px`}">
                    <span>页码 <b>{{ page_number + 1 }}</b>/{{ document_pages.length }}</span>
                    <span>{{ page_title }}</span>
                </div>
            </div>
        </div>

        <!-- 缩略图 全屏需隐藏 -->
        <div :style="{'visibility': fullScreen ? 'hidden' : 'visible'}">
            <div class="slide_thumbnail_vertical">
                <div class="slide_thumbnail_list" 
                    v-for="(item, index) in document_pages" 
                    :key="index" 
                    :class="{'checked': page_number === index}" 
                    @click="to_page_number(index)" 
                    v-bdtongji="'演示页面-预览状态-预览区-右侧-序列表'"
                >
                    <p class="number">{{ index + 1 }}</p>
                    <div class="thumbnail" :style="{'width': '240px', 'height': `${240 / (document_info.width / document_info.height)}px`}">
                        <svg_modal ref="thumbnail"
                            :svg_w="240"
                            :svg_h="240 / (document_info.width / document_info.height)"
                            :svg_view="[0, 0, document_info.width, document_info.height]"
                            :document="document_info"
                            :page_info="item"
                        ></svg_modal>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import Vue from 'vue';
import loading_masking from '@/components/LoadingMasking.vue';
import slides_main from '@/views/pc/Slides/components/Slides.vue';
import svg_modal from '@/components/SvgPageModal.vue';


export default {
    name: "SlidesDocument",
    components: {
        loading_masking,
        slides_main,
        svg_modal,
    },
    data() {
        return {
            fullScreen: false,                                                  // 是否全屏
            loaddone: false,                                                    // 数据是否加载完成

            // 文档数据相关
            document_info: {},                      // 文档数据
            document_pages: [],                     // 文档页数据
            page_number: 0,                         // 页码
            page_title: '未命名',                   // 页标题

            // 渲染相关
            svg_w: 910,
            svg_h: 512,
            svg_view: [0, 0, 0, 0],
            enable_animation: true,                 // 启用动画
            auto_play_media: [],                    // 禁用动画时，需自动播放的媒体
        };
    },
    metaInfo() {
        return {
            title: `${this.document_info.title ? `${this.document_info.title}-` : ''}吾道幻灯片`,
            meta: [{
                name: 'robots',
                content: 'noindex,nofollow,noarchive'
            }],
        };
    },
    computed: {
        screen_style() {
            let styleobj = {};
            if (!this.fullScreen) {
                styleobj.width = 'calc(100% - 300px)';
                styleobj.height = '100%';
            }
            return styleobj;
        }
    },
    mounted() {
        let that = this;
        let appId = that.$route.query.appId;
        let token = that.$route.query.token;
        let time = that.$route.query.time;
        let docId = that.$route.query.docId;
        let userUuid = that.$route.query.userUuid;
        if (!appId) {
            return that.$toast('appId不允许为空', 9999);
        }
        if (!token) {
            return that.$toast('token不允许为空', 9999);
        }
        if (!time) {
            return that.$toast('time不允许为空', 9999);
        }
        if (!docId) {
            return that.$toast('docId不允许为空', 9999);
        }
        if (!userUuid) {
            return that.$toast('userUuid不允许为空', 9999);
        }
        let params = {
            appId: appId,
            token: token,
            time: time,
            userUuid: userUuid
        };
        that.get_document_info(docId, params);
    },
    methods: {
        /**
         * 初始化方法
         */
        // 获取文档信息
        get_document_info(docId, params) {
            let that = this;
            that.$axios.get(`/api/platform/document/detail/${docId}/`, {
                params: params
            }).then(res => {
                let res_data = res.data;
                // 访问错误  无权限处理
                if (res_data.type === 'error') {
                    return that.$toast(res_data.content, 9999);
                }
                that.loaddone = true;
                let document_info = that.$common.document_dataparse(res_data.data.document);
                let document_pages = that.$common.document_pages_dataparse(res_data.data.documentPages);
                that.document_info = document_info;
                that.document_pages = document_pages;
                // 初始化渲染
                that.svg_render();
                that.$nextTick(() => {
                    that.init_function();
                });
            }).catch(err => {
                console.error(err);
            });
        },
        // 初始化渲染模板
        svg_render() {
            let that = this;
            let document_info = that.document_info;
            if (!document.querySelector('.slides_wrapper') || !document_info.width || !document_info.height) {
                return;
            }
            let ratio = document_info.width / document_info.height;
            let width = 0;
            let height = 0;
            // 全屏状态下
            if (that.fullScreen) {
                let window_width = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
                let window_height = window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight;
                // 计算全屏时的尺寸
                if (window_width / ratio > window_height) {
                    width = window_height * ratio;
                    height = window_height;
                } else {
                    width = window_width;
                    height = window_width / ratio;
                }
                that.svg_w = width;
                that.svg_h = height;
                that.svg_view = [((window_width - width) / 2), ((window_height - height) / 2), document_info.width, document_info.height];
            } else {
                let contain_width = document.querySelector('.slides_wrapper').clientWidth - 200;
                let contain_height = document.querySelector('.slides_wrapper').clientHeight - 180;
                if (contain_width / ratio > contain_height) {
                    width = contain_height * ratio;
                    height = contain_height;
                } else {
                    width = contain_width;
                    height = contain_width / ratio;
                }
                that.svg_w = width;
                that.svg_h = height;
                that.svg_view = [0, 0, document_info.width, document_info.height];
            }
        },
        // 接口数据获取完成，进行页面渲染
        init_function() {
            let that = this;
            // 窗口size改变同步样式
            window.removeEventListener("onorientationchange" in window ? "orientationchange" : "resize", that.window_resize_event);
            window.addEventListener("onorientationchange" in window ? "orientationchange" : "resize", that.window_resize_event);
            // 鼠标滚动事件 绑定翻页
            if (utils.deviceENV().firefox) {
                document.querySelector('.slides_wrapper').addEventListener("DOMMouseScroll", that.wheel_listener);
            } else {
                document.querySelector('.slides_wrapper').addEventListener("mousewheel", that.wheel_listener);
            }
            // 按键事件绑定
            that.key_listener();
            // 更新页码 页标题
            that.async_page_number(0);
        },
        window_resize_event() {
            let that = this;
            if (that.loaddone) {
                // 判断是否退出预览
                let isFull = (document.fullScreenElement && document.fullScreenElement !== null) || document.mozFullScreen || document.webkitIsFullScreen;
                if (!isFull && that.fullScreen) {
                    that.fullScreen = false;
                }
                that.$nextTick(() => {
                    that.svg_render();
                });
            }
        },

        /**
         * 操作类方法
         */
        // 缩略图列表滚动条同步
        thumbnail_scroll_center() {
            let that = this;
            that.$nextTick(() => {
                let $contain, $checked;
                // 纵向滚动
                $contain = $('.slide_thumbnail_vertical');
                $checked = $contain.find('.slide_thumbnail_list.checked');
                if ($contain.length === 0 || $checked.length === 0) {
                    return;
                }
                let contain_height = $contain.outerHeight();
                let list_height = $checked.outerHeight();
                let current_top = $checked[0].offsetTop;
                let scroll_top = current_top - (contain_height - list_height) / 2;
                if (scroll_top < 0) {
                    scroll_top = 0;
                }
                $contain.animate({
                    'scrollTop': scroll_top
                });
            });
        },

        /**
         * 全屏演示方法
         */
        inFullScreen() {
            let that = this;
            let el = document.documentElement;
            let is_ie = utils.deviceENV().ie;
            if (is_ie) {
                that.iefull();
            } else {
                let rfs = el.requestFullScreen || el.webkitRequestFullScreen || el.mozRequestFullScreen || el.msRequestFullscreen;
                if (typeof rfs !== "undefined" && rfs) {
                    rfs.call(el);
                }
            }
            that.fullScreen = true;
            that.$nextTick(() => {
                that.svg_render();
            });
        },
        outFullScreen() {
            let that = this;
            let is_ie = utils.deviceENV().ie;
            if (is_ie) {
                that.iefull();
            } else {
                let is_full = (document.fullScreenElement && document.fullScreenElement !== null) || document.mozFullScreen || document.webkitIsFullScreen;
                if (is_full) {
                    if (document.exitFullscreen && document.exitFullscreen !== null) document.exitFullscreen();
                    if (document.mozCancelFullScreen) document.mozCancelFullScreen();
                    if (document.webkitCancelFullScreen) document.webkitCancelFullScreen();
                    if (document.msExitFullscreen) document.msExitFullscreen();
                }
            }
            that.fullScreen = false;
        },
        iefull() {
            let el = document.documentElement;
            let rfs = el.msRequestFullScreen;
            if (typeof window.ActiveXObject == "undefined") {
                //这的方法 模拟f11键，使浏览器全屏
                let wscript = new ActiveXObject("WScript.Shell");
                if (wscript != null) {
                    wscript.SendKeys("{F11}");
                }
            }	//ie调用ActiveX控件，需要在ie浏览器安全设置里面把 ‘未标记为可安全执行脚本的ActiveX控件初始化并执行脚本’ 设置为启用
        },
        
        /**
         * 控制子组件方法 & 子组件事件传递方法
         */
        // 鼠标滚动事件
        wheel_listener(event) {
            let that = this;
            let e = event || window.event;
            if (e.ctrlKey || e.shiftKey || e.altKey || e.metaKey) {
                return;
            }
            let action;
            if (e.wheelDelta) {
                if (e.wheelDelta > 0) {
                    action = 'prev';
                } else {
                    action = 'next';
                }
            } else if (e.detail) {
                if (e.detail > 0) {
                    action = 'next';
                } else {
                    action = 'prev';
                }
            } else {
                return;
            }
            that.$refs.slides_main.page_switch_control(action);
        },
        // 按键事件
        key_listener() {
            let that = this;
            document.onkeydown = e => {
                if (!document.querySelector('.slides_container .slides_wrapper')) {
                    return;
                }
                let event = e || window.event;
                let key = e.keyCode;
                let action;
                switch (true) {
                    case key === 37 || key === 38:
                        action = 'prev';
                        break;
                    case key === 39 || key === 40:
                        action = 'next';
                        break;
                    // f11 全屏监控
                    case key === 122:
                        event.preventDefault();
                        if(that.fullScreen) {
                            that.outFullScreen();
                        } else {
                            that.inFullScreen();
                        }
                        break;
                }
                that.$refs.slides_main.page_switch_control(action);
            }
        },
        // 缩略图点击更新页码
        to_page_number(number) {
            if (isNaN(number)) {
                return;
            }
            this.$refs.slides_main.page_switch_control(number);
        },
        // 子组件 pagenumber 更新同步
        async_page_number(number) {
            this.page_number = number;
            this.page_title = this.document_pages[number] && this.document_pages[number].title ? this.document_pages[number].title : '未命名';
            this.thumbnail_scroll_center();
        },
        // 子组件全屏演示结束
        async_out_full() {
            let that = this;
            that.outFullScreen();
        },
    }
};
</script>

<style lang="less" scoped>
@import url("../../assets/pc/css/common.css");
@perview_sp: url("../../assets/pc/images/common/preview_sp.png") no-repeat;
@display_sp: url("../../assets/pc/images/display/display_sp.png") no-repeat;

.slides_body {
    margin: auto;
}

.slides_container {
    position: fixed;
    top: 0;
    left: 0;
    bottom: 0;
    right: 0;
    z-index: 1000;
    background-color: #2a2930;
    overflow: hidden;
    text-align: left;
    .outer_page {
        position: absolute;
        top: -50px;
        right: -50px;
        z-index: 1;
        width: 100px;
        height: 100px;
        border-radius: 50%;
        background-color: rgba(255, 255, 255, 0.5);
        &:hover::before {
            transform: rotate(90deg);
        }
        &::before {
            content: "";
            position: absolute;
            top: 60px;
            left: 22px;
            width: 16px;
            height: 16px;
            background: @perview_sp -45px -1px;
            opacity: 0.2;
            transition: transform 0.3s;
        }
    }
}

.slides_wrapper {
    position: relative;
    width: 100%;
    height: 100%;
    &::after {
        content: "";
        display: inline-block;
        vertical-align: middle;
        width: 0;
        height: 100%;
    }
    .full_screen_out {
        position: absolute;
        top: 0;
        right: 0;
        z-index: 30;
        padding: 0 10px;
        width: auto;
        height: 40px;
        line-height: 40px;
        background-color: rgba(37, 37, 37, 0.8);
        border-radius: 0 0 0 4px;
        font-size: 0;
        opacity: 0;
        transition: opacity 0.2s;
        &:hover {
            opacity: 1;
        }
        &::after {
            content: "";
            display: inline-block;
            vertical-align: middle;
            width: 0;
            height: 100%;
        }
        .out_full {
            display: inline-block;
            vertical-align: middle;
            width: 20px;
            height: 20px;
            background: @perview_sp -21px -30px;
        }
        .out_page {
            display: inline-block;
            vertical-align: middle;
            margin-left: 10px;
            font-size: 12px;
            color: #c1c1c1;
            &::before {
                content: "";
                display: inline-block;
                vertical-align: middle;
                width: 1px;
                height: 12px;
                background-color: #ffffff;
                opacity: 0.2;
                margin-right: 10px;
            }
            &::after {
                content: "";
                display: inline-block;
                vertical-align: middle;
                width: 0;
                height: 100%;
            }
        }
    }
    .slides_middle {
        display: inline-block;
        vertical-align: middle;
        width: 100%;
    }
    .slide_header {
        position: relative;
        z-index: 99;
        width: 100%;
        height: 50px;
        margin: auto;
        line-height: 50px;
        text-align: right;
        &::after {
            content: "";
            display: inline-block;
            vertical-align: middle;
            width: 0;
            height: 100%;
        }
        .title {
            float: left;
            font-size: 24px;
            color: #ffffff;
        }
        .full_srceen {
            display: inline-block;
            vertical-align: middle;
            width: 28px;
            height: 28px;
            margin-left: 15px;
            border-radius: 4px;
            background: var(--mainColor) @perview_sp -71px -59px;
        }
    }
    .slide_footer {
        position: relative;
        z-index: 1;
        width: 100%;
        height: 30px;
        line-height: 30px;
        margin: auto;
        font-size: 12px;
        span {
            margin-right: 1.5em;
            color: #acadae;
            b {
                color: var(--mainColor);
            }
        }
    }
}

.slide_thumbnail_vertical {
    position: absolute;
    right: 0;
    top: 0;
    width: 300px;
    height: 100%;
    padding: 20px 20px 20px 40px;
    background-color: #201F25;
    overflow-x: hidden;
    overflow-y: auto;
    .slide_thumbnail_list {
        position: relative;
        width: 100%;
        height: auto;
        margin-bottom: 20px;
        cursor: pointer;
        &:last-child {
            margin-bottom: 0;
        }
        &::after {
            content: "";
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            z-index: 1;
            opacity: 0;
            background-color: transparent;
        }
        &.checked {
            .number {
                color: var(--mainColor);
            }
            .thumbnail {
                outline-color: var(--mainColor);
            }
        }
        .number {
            position: absolute;
            top: 0;
            left: -2em;
            font-size: 14px;
            color: #a3a3a3;
        }
        .thumbnail {
            width: 240px;
            height: auto;
            outline: 3px solid transparent;
        }
    }
}
.slide_thumbnail_align {
    position: absolute;
    bottom: 0;
    left: 0;
    width: 100%;
    height: 200px;
    padding: 20px 30px;
    background-color: #201F25;
    font-size: 0;
    overflow-x: auto;
    overflow-y: hidden;
    white-space: nowrap;
    .slide_thumbnail_list {
        display: inline-block;
        position: relative;
        vertical-align: top;
        margin-right: 20px;
        width: auto;
        height: 160px;
        font-size: 14px;
        cursor: pointer;
        white-space: normal;
        &:last-child {
            margin-right: 0;
        }
        &::after {
            content: "";
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            z-index: 1;
            opacity: 0;
            background-color: transparent;
        }
        &.checked {
            .number {
                color: var(--mainColor);
            }
            .thumbnail {
                outline-color: var(--mainColor);
            }
        }
        .number {
            height: 20px;
            line-height: 1;
            font-size: 14px;
            color: #a3a3a3;
        }
        .thumbnail {
            width: auto;
            height: 140px;
            outline: 3px solid transparent;
        }
    }
}
</style>