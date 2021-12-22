<template>
    <div class="slides_container" :class="{'skeleton-wrapper': !renderready, 'component': isComponent && fullScreen}" @click="toggleThumbNail()">
        <div class="slides_center">
            <top_progress ref="top_progress" v-if="!isComponent" :renderdone="renderdone"></top_progress>
            <!-- 加载层 -->
            <loading_masking v-if="isComponent && !renderready"></loading_masking>

            <!-- 非全屏下组件状态关闭按钮 -->
            <a href="javascript:;" class="outer_page" v-if="isComponent" v-show="!fullScreen" @click="sendCloseEvent" v-bdtongji="'演示页面-预览状态-右上角-右上角-关闭'"></a>

            <!-- 演示头部 全屏需隐藏-->
            <CommonHead :options="head_options" ref="CommonHead" v-show="!fullScreen && !isComponent"></CommonHead>

            <div class="slides_wrapper" :style="{'height': fullScreen ? '100%' : 'calc(100vh - 60px - 60px)'}">
                <!-- 跳转上一页 -->
                <div class="pre_page_area" 
                    :style="{'width': !fullScreen ? `calc(50% - ${svg_w /2 }px)`: '25%'}"
                    :class="{'full': fullScreen}"
                    v-show="page_number > 0"
                    @click="set_page_switch('prev')">
                </div>
                <!-- 跳转下一页 -->
                <div class="next_page_area" 
                    :style="{'width': !fullScreen ? `calc(50% - ${svg_w /2 }px)`: '25%'}"
                    :class="{'full': fullScreen}"
                    v-show="page_number < (document_pages.length - 1)"
                    @click="set_page_switch('next')">
                </div>

                <!-- 骨架预览图 -->
                <div class="slides_skeleton" v-if="!renderready">
                    <img src="~@/assets/pc/images/display/slides-skeleton.png" alt="" />
                </div>

                <!-- 右上角退出全屏按钮 -->
                <div class="full_screen_out" v-show="fullScreen">
                    <div class="wrapper">
                        <a href="javascript:;" class="out_full" @click="outFullScreen" v-bdtongji="'演示页面-全屏状态-右上角-右上角-取消全屏'"></a>
                        <a href="javascript:;" class="out_page" v-if="isComponent" @click="sendCloseEvent" v-bdtongji="'演示页面-全屏状态-右上角-右上角-关闭全屏'">退出</a>
                    </div>
                </div>
                
                <!-- 演示区域 -->
                <div class="slides_middle" :style="{'height': fullScreen ? '100%' : 'auto'}">   
                    <!-- 演示区域主体 -->
                    <slides_main ref="slides_main"
                        :svg_w="svg_w"
                        :svg_h="svg_h"
                        :svg_view="svg_view"
                        :document_info="document_info"
                        :document_pages="document_pages"
                        :fullScreen="fullScreen"
                        :enable_deferrender="!isComponent"
                        :enable_animation="enable_animation"
                        :auto_play_media="auto_play_media"
                        :usePageStyle="true"
                        @sendPageNumber="async_page_number"
                        @sendOutFull="async_out_full"
                        @renderFirst="render_first"
                        @renderDone="render_done"
                    ></slides_main>
                    <a v-show="!fullScreen" 
                        class="preview_btn" 
                        :style="{'top': `calc(50vh - ${svg_h / 2 + 60}px)`, 'right': `calc(50% - ${svg_w /2}px)`}" 
                        v-tooltip.bottom="`演示`"
                        @click="inFullScreen">
                    </a>
                </div>
            </div>

            <!-- 演示底部 全屏需隐藏 -->
            <div class="slide_footer" v-show="!fullScreen">
                <div class="footer_left"><img :src="author_info.headUrl"/><span class="name">{{ author_info.nickName }}</span><span>创建时间：{{ document_info.createTime }}</span><span>文档ID：{{ document_info.id }}</span></div>
                <div class="footer_middle"><span class="doc_title">{{ document_info.title }}</span></div>
                <div class="footer_right">
                    <a class="qrcode_btn" href="javascript:void(0);">二维码
                        <div class="qrcode_modal">
                            <canvas id="share_qrcode"></canvas>
                            <p>手机扫一扫，查看更方便</p>
                        </div>
                    </a>
                    <a class="collect_btn" href="javascript:void(0);" v-show="!is_mine && !fullScreen" :class="{collected:is_favorite}" @click="document_favorite">收藏</a>
                    <a class="share_btn" href="javascript:void(0);" v-if="document_info.visitType !== 'privacy'" @click="open_share">分享</a>
                </div>
            </div>
        </div>
        <!-- 全屏需隐藏 -->
        <recommend_modal :user="user" :fullScreen="fullScreen" v-show="!fullScreen"></recommend_modal>
        <!-- 分享弹窗 -->
        <share_modal ref="share_modal"></share_modal>
    </div>
</template>

<script>
import Vue from 'vue';
import QRCode from 'qrcode';
import share_modal from '@/components/ShareModal.vue';
import slides_main from '@/views/pc/Slides/components/Slides.vue';
import top_progress from '@/components/TopProgress.vue';
import loading_masking from '@/components/LoadingMasking.vue';
import CommonHead from '@/components/nav/CommonHead.vue';
import recommend_modal from '@/components/RecommendModal.vue';


Vue.use(QRCode);

export default {
    name: "SlidesDocument",
    components: {
        slides_main,
        share_modal,
        top_progress,
        loading_masking,
        CommonHead,
        recommend_modal
    },
    data() {
        return {
            head_options: {
                theme: 'deepdark',
                slides: true,
            },
            user: {},
            isComponent: this.$parent.$el !== this.$root.$el,                   // 是否是以组件载入页面
            fullScreen: false,                                                  // 是否全屏
            loaddone: false,                                                    // 数据是否加载完成
            renderready: false,                                                 // 渲染文档准备完成，已完成第一页渲染
            renderdone: false,                                                  // 幻灯片是否渲染完成
            throttle: false,                                                    // 节流阀

            // 文档数据相关
            document_info: {},
            author_info: {},
            document_pages: [],                     // 文档页数据
            is_mine: false,                         // 是否是当前用户的
            is_favorite: false,                     // 是否已收藏
            page_number: 0,                         // 页码

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
            title: !this.isComponent ? `${this.$store.state.metaInfo.title ? `${this.$store.state.metaInfo.title}-` : ''}吾道幻灯片` : document.title,
            meta: [
                {
                    name: 'robots',
                    content: 'noindex,nofollow,noarchive'
                },
                {
                    property: 'og:title',
                    content: `${this.$store.state.metaInfo.title ? `${this.$store.state.metaInfo.title}-` : ''}吾道幻灯片`
                },
                {
                    property: 'og:url',
                    content: `https://www.woodo.cn/document/slides/${this.$store.state.metaInfo.query}/`
                },
            ],
        };
    },
    asyncData({store,host,route}) {
        return store.dispatch('setMeta',{url:`${host}/api/common/document/url_info/`, params:{url:route.params.id}});

    },
    mounted() {
        let that = this;
        that.user = that.$common.get_login_state();
        if (!that.isComponent) {
            that.get_document_info(that.$route.params.id);
        }
    },
    methods: {
        // 在组件状态下，调用此方法可加载演示层
        show(opt) {
            let that = this;
            let option = {
                url: '',                // document_info.url
                begin: 0,               // 起始演示页面下标
                inFullScreen: true,     // 进入全屏
                enableAnimation: true,  // 启用动画
                autoPlayMedia: [],      // 自动播放一组媒体
            };
            option = Object.assign(option, opt);
            that.auto_play_media = option.autoPlayMedia;
            that.enable_animation = option.enableAnimation;
            that.$refs.slides_main.set_page_number(option.begin);
            if (option.inFullScreen) {
                that.inFullScreen();
            }
            that.get_document_info(option.url);
        },
        /**
         * 初始化方法
         */
        // 幻灯片渲染完成第一页
        render_first() {
            this.renderready = true;
        },
        render_done() {
            this.renderdone = true;
        },
        // 获取文档信息
        get_document_info(url, callback) {
            let that = this;
            if (!url) {
                return;
            }
            // 分享统计
            let docShare = false;
            if (sessionStorage) {
                let oldUrls = sessionStorage.getItem("urls"),
                    newUrls = !oldUrls ? [] : oldUrls.split(",");
                if ($.inArray(url, newUrls) < 0) {
                    docShare = true;
                }
            }
            that.$axios.get(`/api/document/${url}/`, {
                headers: {
                    docShare: docShare,
                },
            }).then(res => {
                let res_data = res.data;
                that.loaddone = true;
                // 访问错误  无权限处理
                if (res_data.type === 'error') {
                    let redirect_href = '/no_power/?type=nonexistent';
                    switch (res_data.content) {
                        case 'documentAccessDenied':
                            redirect_href = '/no_power/?type=preview';
                            break;
                        case '哎呀~我家主公的演示文档现在貌似不方便被查看':
                            redirect_href = '/no_power/?type=preview';
                            break;
                        case '链接访问已过有效期':
                            redirect_href = '/no_power/?type=url_expired';
                            break;
                    }
                    window.location.href = redirect_href;
                    return;
                }
                let document_info = that.$common.document_dataparse(res_data.data.document);
                let document_pages = that.$common.document_pages_dataparse(res_data.data.documentPages);
                // 演示页 协作成员可编辑状态直接进入编辑页
                if (!that.isComponent && that.user.login) {
                    let collaborateRoleType = res_data.data.collaborateRoleType;
                    if (['owner', 'edit', 'onlyReview'].indexOf(collaborateRoleType) > -1) {
                        that.render_done();
                        setTimeout(() => {
                            window.location.href = `/edit/?docId=${document_info.id}`;
                        }, 16);
                        return;
                    }
                }
                // 分享统计
                if (sessionStorage && docShare) {
                    if (typeof newUrls !== 'undefined') {
                        newUrls.push(url);
                        sessionStorage.setItem("urls", newUrls);
                    }
                }
                that.document_info = document_info;
                that.document_pages = document_pages;
                that.is_mine = res_data.data.isMine;
                that.is_favorite = res_data.data.isFavorite;
                that.author_info = res_data.data.member;
                that.document_info.createTime = utils.timeStampDetail(that.document_info.createDate / 1000);
                // 生成分享二维码
                that.create_share_qrcode();
                // 初始化渲染
                that.svg_render();
                that.$nextTick(() => {
                    that.init_function();
                    if (typeof callback === 'function') callback();
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
                let contain_height = document.querySelector('.slides_wrapper').clientHeight - 70;
                if (contain_height * ratio > contain_width) {
                    width = contain_width;
                    height = contain_width / ratio;
                } else {
                    width = contain_height * ratio;
                    height = contain_height;
                }
                that.svg_w = width;
                that.svg_h = height;
                that.svg_view = [0, 0, document_info.width, document_info.height];
            }
        },
        // 接口数据获取完成，进行页面渲染
        init_function() {
            let that = this;
            // 按键事件绑定
            that.key_listener();
            // 窗口size改变同步样式
            window.removeEventListener("onorientationchange" in window ? "orientationchange" : "resize", that.window_resize_event);
            window.addEventListener("onorientationchange" in window ? "orientationchange" : "resize", that.window_resize_event);
            // 鼠标滚动事件 绑定翻页
            if (utils.deviceENV().firefox) {
                document.querySelector('.slides_list').addEventListener("DOMMouseScroll", that.wheel_listener);
            } else {
                document.querySelector('.slides_list').addEventListener("mousewheel", that.wheel_listener);
            }
            $('.slides_body').on('mouseenter', () => {
                $('.slides_container').css('overflow-y', 'hidden');
            }).on('mouseleave', () => {
                $('.slides_container').css('overflow-y', 'auto');
            })
            // 更新页码 页标题
            that.async_page_number(0);
            // 页码关闭
            $(document).on('click', e => {
                if (e.target === that.$refs.switch_pagenumber) {
                    return;
                }
                that.hide_numberlist();
            });
        },
        window_resize_event(e) {
            let that = this;
            if (that.loaddone) {
                // 判断是否退出预览
                let isFull = (document.fullScreenElement && document.fullScreenElement !== null) || document.mozFullScreen || document.webkitIsFullScreen;
                if (!isFull && that.fullScreen) {
                    that.fullScreen = false;
                    // 组件情况直接关闭
                    that.sendCloseEvent();
                }
                that.$nextTick(() => {
                    that.svg_render();
                });
            }
        },
        // 以组件形式进入时，向父组件传递的事件
        sendCloseEvent() {
            let that = this;
            that.outFullScreen();
            if (!that.isComponent) {
                return;
            }
            that.$nextTick(() => {
                that.$emit('close');
            });
        },

        /**
         * 操作类方法
         */
        // 登录跳转
        to_login(callback) {
            let that = this;
            if (that.user.login) {
                if (typeof callback === 'function') callback();
                return;
            }
            let redirect_url = encodeURI(window.location.pathname + window.location.search);
            window.location.href = '/login/?redirectUrl=' + redirect_url;
        },
        // 文档收藏
        document_favorite() {
            let that = this;
            if (that.is_mine) {
                return;
            }
            that.to_login(() => {
                let api, toast;
                if (that.is_favorite) {
                    api = `/api/member/delete_collect/`;
                    toast = `取消收藏成功`;
                } else {
                    api = `/api/member/collection/`;
                    toast = `收藏成功`;
                }
                that.$axios.post(api, {
                    documentId: that.document_info.id,
                    type: `document`,
                }).then(res => {
                    let res_data = res.data;
                    if (res_data.type === 'success') {
                        that.is_favorite = !that.is_favorite;
                    }
                    that.$toast(toast);
                }).catch(err => {
                    console.error(err);
                    that.$toast('操作失败!');
                });
            });
        },
        // 打开分享弹窗
        open_share() {
            let that = this;
            that.$refs.share_modal.show({
                type: that.document_info.documentType,
                urlid: that.document_info.url,
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
        // 切换页面 action: 'next' || 'prev' || number
        set_page_switch(action) {
            this.$refs.slides_main.page_switch_control(action)
        },
        // 鼠标滚动事件
        wheel_listener(event) {
            let that = this;
            if (that.throttle) {
                return;
            }
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
            // 节流处理，测试到滚动事件会影响到动画的性能问题
            that.set_page_switch(action);
            that.throttle = true;
            setTimeout(() => {
                that.throttle = false;
            }, 300);
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
                that.set_page_switch(action);
            }
        },
        // 显示页码列表
        show_numberlist() {
            let that = this;
            if ($(that.$refs.switch_pagenumber).hasClass('show')) {
                that.hide_numberlist();
                return;
            }
            $(that.$refs.switch_pagenumber).addClass('show');
            $(that.$refs.page_number_list).fadeIn();
        },
        hide_numberlist() {
            let that = this;
            $(that.$refs.switch_pagenumber).removeClass('show');
            $(that.$refs.page_number_list).fadeOut();
        },
        // 页码列表点击更新页码
        to_page_number(number) {
            if (isNaN(number)) {
                return;
            }
            this.set_page_switch(number);
        },
        // 子组件 pagenumber 更新同步
        async_page_number(number) {
            this.page_number = number;
        },
        // 子组件全屏演示结束
        async_out_full() {
            let that = this;
            // 在组件状态下，给父组件提供退出事件
            if (that.isComponent) {
                that.sendCloseEvent();
            } else {
                that.outFullScreen();
            }
        },
        // 生成二维码
        create_share_qrcode() {
            let that = this;
            let url = `${location.origin}/mobile/document/slides/${that.document_info.url}`;
            let $canvas = document.getElementById('share_qrcode');
            QRCode.toCanvas($canvas, url, {width:120}, function(error) {if(error) console.error(error);});
        },
        toggleThumbNail() {
            this.$refs.slides_main.toggleThumbNail(false);
        },
    }
};
</script>

<style lang="less" scoped>
@import url("~@/assets/pc/css/common.css");
@perview_sp: url("~@/assets/pc/images/common/preview_sp.png") no-repeat;
@display_sp: url("~@/assets/pc/images/display/display_sp.png") no-repeat;

.slides_body {
    margin: auto;
}

.skeleton-wrapper {
    .slide_footer *{
        display: none !important;
    }
    .slides_skeleton {
        position: absolute;
        top: 0;
        left: 0;
        z-index: 9999;
        width: 100%;
        height: 100%;
        padding: 35px 100px;
        text-align: center;
        font-size: 0;
        img {
            display: block;
            margin: auto;
            width: auto;
            height: auto;
            max-width: 100%;
            max-height: 100%;
            min-width: 100%;
            min-height: 100%;
            object-fit: contain;
        }
    }
}

.slides_container {
    width: 100%;
    height: 100%;
    overflow-x: hidden;
    overflow-y: auto;
    text-align: left;
    background: #0b0b0b;
    &::-webkit-scrollbar{
        display: none;
    }
    .outer_page {
        position: absolute;
        top: -50px;
        right: -50px;
        z-index: 2;
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
    .slides_center{
        width: 100vw;
        height: 100vh;
        overflow: hidden;
    }
    &.component{
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        z-index: 10000;
    }
}

.slides_wrapper {
    position: relative;
    width: 100%;
    height: 100%;
    overflow: hidden;
    background: #1d1d1d url("~@/assets/common/images/logo_watermark.png") repeat;
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
        width: 100%;
        height: 40px;
        line-height: 40px;
        text-align:right;
        font-size: 0;
        opacity: 0;
        transition: opacity 0.2s;
        .wrapper{
            float:right;
            width:auto;
            height:100%;
            padding: 0 10px;
            background-color: rgba(0, 0, 0, 0.2);
            border-radius: 0 0 0 4px;
        }
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
            background: url('~@/assets/pc/images/slides/outfull.png') no-repeat center;
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
    .pre_page_area, .next_page_area{
        position: absolute;
        top: 0;
        width: 25%;
        height: 100%;
        opacity: 0;
        z-index: 1;
        cursor: pointer;
    }
    .pre_page_area{
        left: 0;
    }
    .next_page_area{
        right: 0;
    }
    .slides_middle {
        display: inline-block;
        vertical-align: middle;
        width: 100%;
        &:hover .preview_btn{
            opacity: 1;
        }
        .preview_btn{
            position: absolute;
            top: 20px;
            right: 0;
            width: 32px;
            height: 32px;
            background: rgba(0,0,0,.2) url('~@/assets/pc/images/slides/full.png') no-repeat center;
            opacity: 0;
        }
        .slides_body{
            position: static;
        }
    }
}

.slide_footer {
    position:relative;
    width: 100%;
    height: 60px;
    line-height: 60px;
    padding: 0 20px;
    background:#0b0b0b;
    text-align:center;
    z-index: 1;
    span {
        font-size:12px;
        color: #ffffff;
        user-select: none;
    }
    .footer_left{
        float:left;
        *{
            display: inline-block;
            vertical-align:middle;
        }
        img{
            width: 32px;
            height: 32px;
            border-radius:50%;
            overflow: hidden;
        }
        span{
            margin: 0 20px;
            &.name{
                margin: 0 20px 0 10px;
                &::after{
                    content: '';
                    display: inline-block;
                    width: 1px;
                    height: 14px;
                    margin-left: 20px;
                    background-color: #545454;
                    vertical-align: middle;
                }
            }
        }
    }
    .footer_middle{
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        text-align: center;
        z-index: -1;
        span{
            font-size: 15px;
        }
    }
    .footer_right{
        float:right;
        a{
            display: inline-block;
            vertical-align:middle;
            font-size:12px;
            color: #ffffff;
            margin-right: 20px;
            opacity: .9;
            &:hover{
                opacity: 1;
            }
            &:last-child{
                margin-right: 0;
            }
            &::before{
                content: '';
                display: inline-block;
                position: relative;
                top: 1px;
                width: 18px;
                height: 18px;
                margin-right:8px;
                background-position: center;
                background-repeat: no-repeat;
                vertical-align: text-bottom;
            }
        }
        .qrcode_btn{
            position: relative;
            overflow: hidden;
            &::before{
                background-image: url('~@/assets/pc/images/slides/qrcode.png');
            }
            &:hover{
                overflow: visible;
            }
            .qrcode_modal{
                position: absolute;
                top: -200px;
                left: -80px;
                width: 188px;
                height: 188px;
                padding: 20px 20px 0;
                background-color: #ffffff;
                cursor: default;
                user-select: none;
                p{
                    line-height: 1;
                    margin-top: -13px;
                    color: #666;
                    font-size: 12px;
                    text-align: center;
                }
            }
        }
        .collect_btn{
            &::before{
                background-image: url('~@/assets/pc/images/slides/collect_white.png');
            }
            &.collected{
                &::before{
                background-image: url('~@/assets/pc/images/slides/collect_yellow.png');
            }
            }
        }
        .share_btn{
            &::before{
                background-image: url('~@/assets/pc/images/slides/share.png');
            }
        }
    }
}

.un_login_tip {
    position:absolute;
    left: 0;
    bottom: 0;
    width: 100%;
    height: 90px;
    line-height: 90px;
    background-color: rgba(0,0,0,0.8);
    font-size: 0;
    color: #ffe981;
    text-align: center;
    z-index: 9;
    span {
        font-size: 16px;
        vertical-align: middle;
    }
    a {
        display: inline-block;
        width: 90px;
        height: 40px;
        line-height: 40px;
        margin-left: 16px;
        border-radius: 4px;
        background-color: var(--mainColor);
        font-size: 16px;
        color: #ffffff;
        vertical-align: middle;
    }
    i {
        position: absolute;
        top: 50%;
        right: 26px;
        width: 20px;
        height: 20px;
        margin-top: -10px;
        background: @perview_sp -48px -30px;
        transition: transform 0.3s;
        opacity: 0.2;
        cursor: pointer;
        &:hover {
            transform: rotate(90deg);
        }
    }
}
</style>