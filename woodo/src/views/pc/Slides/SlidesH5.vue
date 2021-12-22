<template>
    <div class="slides_container" :class="{'skeleton-wrapper': !renderready}">
        <top_progress ref="top_progress" :renderdone="renderdone"></top_progress>

        <div class="slides_wrapper" :style="{'height': fullScreen ? '100%' : 'calc(100% - 200px)'}">
            <!-- 跳转上一页 -->
            <div class="pre_page_area" 
                :style="{'width':`calc(50% - ${svg_w /2 }px)`}"
                v-show="page_number > 0"
                @click="set_page_switch('prev')">
            </div>
            <!-- 跳转下一页 -->
            <div class="next_page_area" 
                :style="{'width':`calc(50% - ${svg_w /2 }px)`}"
                v-show="page_number < (document_pages.length - 1)"
                @click="set_page_switch('next')">
            </div>

            <!-- 骨架预览图 -->
            <div class="slides_skeleton" v-if="!renderready">
                <img src="~@/assets/pc/images/display/slides-skeleton.png" alt="" />
            </div>

            <!-- logo 全屏需隐藏 -->
            <base-logo v-show="!fullScreen" theme="gray" link="/" v-bdtongji="'演示页面-预览状态-左上角-左上角-返回首页'"></base-logo>

            <!-- 右上角登录 -->
            <div class="login_state" v-show="!fullScreen">
                <!-- 未登录 -->
                <a href="javascript:;" v-if="!user.login" class="login_btn" @click="to_login">登录 / 注册</a>
                <!-- 已登录 -->
                <div class="user-head" v-else>
                    <div class="user-center" v-bdtongji="'全部-全部-全部-右上角-头像名称'">
                        <a href="/home/" class="user-center-avatar">
                            <img :src="user.photo" alt="" />
                        </a>
                        <a href="/home/" :title="user.name">{{ user.name.length > 6 ? `${user.name.substring(0, 6)}...` : user.name}}</a>
                    </div>
                    <div class="user_info">
                        <div class="user_section">
                            <div class="info">
                                <div class="img_outer">
                                    <img :src="user.photo" alt="" />
                                </div>
                                <div class="content">
                                    <p :title="user.name">{{ user.name.length > 6 ? `${user.name.substring(0, 6)}...` : user.name }}</p>
                                    <span>{{user.email ? user.email : user.mobile}}</span>
                                </div>
                                <div class="vip_content year_grade" v-if="user.memberVip === 'premium'">
                                    <div class="vip_grade"><span>高级版</span></div>
                                    <a href="/member/upgrade/" class="up_grade" v-bdtongji="'全部-全部-全部-右上角-头像名称-续费'">续费</a>
                                </div>
                                <div class="vip_content month_grade" v-else-if="user.memberVip === 'professional'">
                                    <div class="vip_grade"><span>专业版</span></div>
                                    <a href="/member/upgrade/" class="up_grade" v-bdtongji="'全部-全部-全部-右上角-头像名称-升级'">升级</a>
                                </div>
                                <div class="vip_content" v-else>
                                    <div class="vip_grade"><span>免费版</span></div>
                                    <a href="/member/upgrade/" class="up_grade" v-bdtongji="'全部-全部-全部-右上角-头像名称-升级'">升级</a>
                                </div>
                            </div>
                            <ul class="member_list">
                                <li>
                                    <a href="/notification/" class="message_icon" :class="{'news':user.news > 0}" v-bdtongji="'全部-全部-全部-右上角-头像名称-消息通知'">消息通知</a>
                                </li>
                            </ul>
                            <ul class="member_list">
                                <li>
                                    <a href="https://www.woodo.cn/slides/?url=4589695038" target="_blank" class="log_icon" v-bdtongji="'全部-全部-全部-右上角-头像名称-更新日志'">更新日志</a>
                                </li>
                                <li>
                                    <a href="/member/" class="member_icon" v-bdtongji="'全部-全部-全部-右上角-头像名称-我的账户'">我的账户</a>
                                </li>
                                <li>
                                    <a href="/member/order/" class="order_icon" v-bdtongji="'全部-全部-全部-右上角-头像名称-我的订单'">我的订单</a>
                                </li>
                            </ul>
                            <ul class="member_list">
                                <li>
                                    <a href="javascript:void(0);" class="log_out" @click="log_out" v-bdtongji="'全部-全部-全部-右上角-头像名称-安全退出'">安全退出</a>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
            <!-- 右上角退出全屏按钮 -->
            <div class="full_screen_out" v-show="fullScreen">
                <a href="javascript:;" class="out_full" @click="outFullScreen" v-bdtongji="'演示页面-全屏状态-右上角-右上角-取消全屏'"></a>
            </div>
            <!-- 演示区域 -->
            <div class="slides_middle" :style="{'height': fullScreen ? '100%' : 'auto'}">
                <!-- 演示区域头部 全屏需隐藏 -->
                <div class="slide_header" v-show="!fullScreen" :style="{'width': `${svg_w}px`}">
                    <p class="title">
                        <img v-webp="require(`@/assets/pc/images/common/h5_icon.png`)" width="27" height="18" alt="">
                        <span class="title_text">{{ document_info.title || '' }}</span>
                    </p>
                    <a href="javascript:;" class="favorite_btn" :class="{'checked': is_favorite}" @click="document_favorite" v-bdtongji="`演示页面-预览状态-预览区-右上角-${(is_favorite ? '已收藏' : '+ 收藏')}`">
                        {{ is_favorite ? '已收藏' : '+ 收藏' }}
                    </a>
                    <a href="javascript:;" class="share_code" v-bdtongji="'演示页面-预览状态-预览区-右上角-二维码'">
                        <div class="qrcode_container">
                            <base-logo class="qrcode_logo" type="code" width="30" height="30"></base-logo>
                            <img class="qrcode" :src="qrcode_dataurl" alt="">
                        </div>
                    </a>
                    <a href="javascript:;" v-show="document_info.visitType !== 'privacy'" class="share_btn" title="分享" @click="open_share"></a>
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
                    :enable_deferrender="true"
                    :enable_animation="true"
                    :h5_mode="true"
                    @sendPageNumber="async_page_number"
                    @sendOutFull="async_out_full"
                    @renderFirst="render_first"
                    @renderDone="render_done"
                ></slides_main>

                <!-- 演示区域尾部 全屏需隐藏 -->
                <div class="slide_footer" v-show="!fullScreen" :style="{'width': `${svg_w}px`}">
                    <span>页码 <b>{{ page_number + 1 }}</b>/{{ document_pages.length }}</span>
                    <span>{{ page_title }}</span>
                </div>
            </div>
        </div>

        <!-- 缩略图 全屏需隐藏 -->
        <div v-if="renderdone" :style="{'visibility': fullScreen ? 'hidden' : 'visible'}">
            <div class="slide_thumbnail_align">
                <div class="slide_thumbnail_list" 
                    v-for="(item, index) in document_pages" 
                    :key="index" 
                    :class="{'checked': page_number === index}" 
                    @click="to_page_number(index)" 
                    v-bdtongji="'演示页面-预览状态-预览区-底部-序列表'"
                >
                    <p class="number">{{ index + 1 }}</p>
                    <div class="thumbnail" :style="{'width': `${140 / (document_info.height / document_info.width)}px`, 'height': '140px'}">
                        <svg_modal ref="thumbnail"
                            :svg_w="140 / (document_info.height / document_info.width)"
                            :svg_h="140"
                            :svg_view="[0, 0, document_info.width, document_info.height]"
                            :document="document_info"
                            :page_info="item"
                            :mode="`thumbnail`"
                        ></svg_modal>
                    </div>
                </div>
            </div>
        </div>

        <!-- 分享弹窗 -->
        <share_modal ref="share_modal"></share_modal>
    </div>
</template>

<script>
import Vue from 'vue';
import QRCode from 'qrcode';
import share_modal from '@/components/ShareModal.vue';
import slides_main from '@/views/pc/Slides/components/Slides.vue';
import svg_modal from '@/components/SvgPageModal.vue';
import top_progress from '@/components/TopProgress.vue';

Vue.use(QRCode);

export default {
    name: "SlidesH5",
    components: {
        slides_main,
        share_modal,
        svg_modal,
        top_progress,
    },
    data() {
        return {
            user: {},
            fullScreen: false,                                                  // 是否全屏
            loaddone: false,                                                    // 数据是否加载完成
            renderready: false,                                                 // 渲染文档准备完成，已完成第一页渲染
            renderdone: false,                                                  // 幻灯片是否渲染完成
            throttle: false,                                                    // 节流阀

            // 文档数据相关
            document_info: {},                      // 文档数据
            document_pages: [],                     // 文档页数据
            is_favorite: false,                     // 是否已收藏
            is_mine: false,                         // 是否是当前用户的
            page_number: 0,                         // 页码
            page_title: '未命名',                   // 页标题
            qrcode_dataurl: '',                     // 二维码 base64

            // 渲染相关
            svg_w: 910,
            svg_h: 512,
            svg_view: [0, 0, 0, 0],
            // 默认背景音乐
            backgroundMusic: {
                fadeOut: "00:00",
                src: "https://file.woodo.cn/upload/media/202002/18/39fdf356-6078-4560-9c95-031c6f5382c6.mp3",
                fadeIn: "00:00",
                loop: true,
                hideOnShow: false,
                autoplay: true,
            },
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
                    content: `https://www.woodo.cn/h5/slides/${this.$store.state.metaInfo.query}/`
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
        that.get_document_info(that.$route.params.id);
    },
    methods: {
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
            that.$axios.get(`/api/document/${url}/`).then(res => {
                let res_data = res.data;
                that.loaddone = true;
                // 访问错误  无权限处理
                if (res_data.type === 'error') {
                    if(res_data.content.indexOf('链接访问已过有效期') > -1){
                        window.location.href = '/no_power/?type=url_expired';
                    }else{
                        window.location.href = '/no_power/?type=nonexistent';
                    }
                    return;
                }
                let document_info = that.$common.document_dataparse(res_data.data.document);
                let document_pages = that.$common.document_pages_dataparse(res_data.data.documentPages);
                document_info.attr['backgroundMusic'] = Object.assign(that.backgroundMusic, document_info.attr['backgroundMusic'] || {});
                // h5模式 固定自动播放 播放时不隐藏图标
                document_info.attr.backgroundMusic['loop'] = true;
                document_info.attr.backgroundMusic['autoplay'] = true;
                document_info.attr.backgroundMusic['hideOnShow'] = false;
                that.document_info = document_info;
                that.document_pages = document_pages;
                that.is_mine = res_data.data.isMine;
                that.is_favorite = res_data.data.isFavorite;
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
                let contain_height = document.querySelector('.slides_wrapper').clientHeight - 200;
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
            // 生成二维码
            that.create_qrcode();
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
        // 退出
        log_out() {
            let that = this;
            that.$axios.get("/api/logout/submit/").then(function(data){
                if(data.data.type === "success") {
                    that.$toast("退出登录成功", 800);
                    location.href = "/";
                } else {
                    that.$toast("退出登录失败，请稍后重试", 800);
                }
            });
        },
        // 文档收藏
        document_favorite() {
            let that = this;
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
        // 生成二维码
        create_qrcode() {
            let that = this;
            let url = `${window.location.origin}/mobile/h5/slides/${that.document_info.url}/`;
            QRCode.toCanvas(url, {
                width: 200,
                errorCorrectionLevel: 'Q',
            }).then((canvas) => {
                let ctx = canvas.getContext('2d');
                that.qrcode_dataurl = canvas.toDataURL('image/png', 1);
            }).catch((err) => {
                console.error(err);
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
        // 缩略图列表滚动条同步
        thumbnail_scroll_center() {
            let that = this;
            that.$nextTick(() => {
                // 纵向滚动
                let $contain = $('.slide_thumbnail_align');
                let $checked = $contain.find('.slide_thumbnail_list.checked');
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
        // 缩略图点击更新页码
        to_page_number(number) {
            if (isNaN(number)) {
                return;
            }
            this.set_page_switch(number);
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
@import url("~@/assets/pc/css/common.css");
@perview_sp: url("~@/assets/pc/images/common/preview_sp.png") no-repeat;
@display_sp: url("~@/assets/pc/images/display/display_sp.png") no-repeat;
@user_bg: url("~@/assets/pc/images/common/user_info_bg.png") no-repeat;

.slides_body {
    margin: auto;
}

.skeleton-wrapper {
    .slide_header *,
    .slide_footer *,
    .slide_thumbnail_align *{
        display: none !important;
    }
    .slides_skeleton {
        position: absolute;
        top: 0;
        left: 0;
        z-index: 9999;
        width: 100%;
        height: 100%;
        padding: 100px;
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
    position: fixed;
    top: 0;
    left: 0;
    bottom: 0;
    right: 0;
    z-index: 1000;
    background: #2a2930 url("~@/assets/common/images/logo_watermark.png") repeat;
    overflow: hidden;
    text-align: left;
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
    .base-logo {
        position: absolute;
        top: 20px;
        left: 40px;
        z-index: 3;
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
    }
    .pre_page_area, .next_page_area{
        position: absolute;
        top: 0;
        width: 50%;
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
            &::after {
                content: "";
                display: inline-block;
                vertical-align: middle;
                width: 0;
                height: 100%;
            }
            img {
                display: inline-block;
                vertical-align: middle;
                margin-right: 10px;
            }
            .title_text {
                display: inline-block;
                vertical-align: middle;
                font-size: 18px;
                color: #ffffff;
            }
        }
        .favorite_btn {
            display: inline-block;
            vertical-align: middle;
            padding: 0 10px;
            line-height: 28px;
            font-size: 14px;
            color: #ffffff;
            background-color: #98a1b7;
            border-radius: 4px;
            &.checked {
                background-color: #ff7575;
            }
        }
        .share_code {
            position: relative;
            display: inline-block;
            vertical-align: middle;
            width: 28px;
            height: 28px;
            margin-left: 15px;
            border-radius: 4px;
            background: #98a1b7 @perview_sp -70px -27px;
            overflow: hidden;
            &:hover {
                background-color: var(--mainColor);
                overflow: visible;
                opacity: 1;
                .qrcode_container {
                    opacity: 1;
                }
            }
            .qrcode_container {
                position: absolute;
                top: 40px;
                left: -66px;
                width: 160px;
                height: 160px;
                padding: 10px;
                background-color: #ffffff;
                border-radius: 4px;
                opacity: 0;
                transition: opacity 0.3s;
                .qrcode_logo {
                    position: absolute;
                    top: 0;
                    left: 0;
                    bottom: 0;
                    right: 0;
                    z-index: 1;
                    margin: auto;
                }
                .qrcode {
                    width: 100%;
                    height: 100%;
                }
            }
        }
        .share_btn {
            display: inline-block;
            vertical-align: middle;
            width: 28px;
            height: 28px;
            margin-left: 15px;
            border-radius: 4px;
            background: #98a1b7 @display_sp  4px -20px;
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

.login_state {
    position: absolute;
    top: 20px;
    right: 30px;
    z-index: 2;
    .login_btn {
        display: block;
        width: 120px;
        height: 40px;
        line-height: 38px;
        text-align: center;
        border-radius: 20px;
        border: solid 1px rgba(255, 255, 255, 0.3);
        color: rgba(255, 255, 255, 0.6);
        transition: all 0.3s;
        &:hover {
            border-color: #ffffff;
            color: #ffffff;
        }
    }
    .user-head{
        position: relative;
        width: auto;
        min-width: 90px;
        height: 40px;
        line-height: 30px;
        &:after{
            content: "";
            display: inline-block;
            width: 7px;
            height: 7px;
            margin: 0 0 8px 12px;
            border: 2px solid #fff;
            border-left: transparent;
            border-top: transparent;
            transform: rotate(45deg);
            transition: all 0.2s;
            vertical-align: middle;
        }
        &:hover .user_info {
            display: block;
        }
        .user-center{
            position:relative;
            display:inline-block;
            i{
                position:absolute;
                top:13px;
                left:22px;
                width:8px;
                height:8px;
                background:#f62a00;
                border-radius:20px;
            }
            img{
                display:inline-block;
                vertical-align:middle;
                margin:0 10px 4px 0;
                height:30px;
                width:30px;
                border-radius:50%;
            }
            a{
                display:inline-block;
                color:#fff;
                font-size:14px;
            }
            .user-center-avatar{
                opacity: 1;
                &.news{
                    position:relative;
                    &:after{
                        content:'';
                        position:absolute;
                        top:14px;
                        right:10px;
                        display:inline-block;
                        width:8px;
                        height:8px;
                        border-radius:8px;
                        background:#f62a00;
                    }
                }
            }
        }
        .user_info {
            display: none;
            position:absolute;
            top: 40px;
            right:0;
            z-index:999;
            cursor:default;
            .user_section{
                position:relative;
                width:240px;
                padding:18px 20px 0;
                line-height: 1.4;
                border-radius:2px;
                font-size: 12px;
                background-color: #ffffff;
                overflow:hidden;
                box-shadow: -2px 2px 6px 0px rgba(0, 0, 0, 0.18);
                .info{
                    padding-bottom: 18px;
                    font-size: 0;
                    .img_outer{
                        display: inline-block;
                        vertical-align: top;
                        width:36px;
                        height:36px;
                        border-radius:50%;
                        overflow:hidden;
                        img{
                            display: block;
                            width:100%;
                        }
                    }
                    .content{
                        display: inline-block;
                        vertical-align: top;
                        width: 154px;
                        margin-left: 10px;
                        font-size: 12px;
                        overflow: hidden;
                        text-overflow: ellipsis;
                        white-space: nowrap;
                        color: #919191;
                        p {
                            margin-bottom: 5px;
                            font-size: 14px;
                            color: #1e1e1e;
                        }
                    }
                    .vip_content {
                        display: block;
                        margin: 15px 0 0 46px;
                        font-size: 12px;
                        .vip_grade {
                            display: inline-block;
                            vertical-align: top;
                            width: 88px;
                            height: 24px;
                            padding: 2px 0;
                            text-align: center;
                            background-color: rgba(217, 227, 237, 0.3);
                            border-radius: 11px;
                            &::before {
                                content: "";
                                display: inline-block;
                                vertical-align: middle;
                                width: 20px;
                                height: 20px;
                                margin-right: 4px;
                                background: @user_bg -1px -74px;
                            }
                            span {
                                display: inline-block;
                                vertical-align: middle;
                                line-height: 20px;
                                font-weight: bold;
                                color: #b2bdd2;
                            }
                        }
                        .up_grade {
                            display: inline-block;
                            vertical-align: top;
                            margin: 1px 0 0 20px;
                            width: 40px;
                            height: 22px;
                            line-height: 22px;
                            background-image: linear-gradient(-37deg, #0d7bf7 0%, #07b4ff 100%), linear-gradient(#169bd5, #169bd5);
                            background-blend-mode: normal, normal;
                            border-radius: 4px;
                            color: #fefefe;
                            text-align: center;
                        }
                        &.month_grade {
                            .vip_grade {
                                background-color: rgba(191, 217, 247, 0.3);
                                &::before {
                                    margin-right: 8px;
                                    background-position: -37px -74px;
                                }
                                span {
                                    color: #52a0f8;
                                }
                            }
                            .up_grade {
                                background-image: linear-gradient(0deg, #0d7bf8 0%, #3994fd 100%), linear-gradient(#0d7bf7, #0d7bf7);
                            }
                        }
                        &.year_grade {
                            .vip_grade {
                                background-color: rgba(255, 226, 193, 0.3);
                                &::before {
                                    margin-right: 8px;
                                    background-position: -76px -74px;
                                }
                                span {
                                    color: #d7af83;
                                }
                            }
                            .up_grade {
                                background-image: linear-gradient(-31deg, #d7af83 0%, #f7d6af 100%), linear-gradient(#0d7bf7, #0d7bf7);
                                background-blend-mode: normal, normal;
                            }
                        }
                    }
                }
                .member_list{
                    padding:5px 0;
                    border-top:1px solid #e7e7e7;
                    li{
                        height: 34px;
                        line-height: 34px;
                        a{
                            display:block;
                            font-size:12px;
                            color:#515151;
                            &::before {
                                content:"";
                                display:inline-block;
                                vertical-align: middle;
                                margin-top: -2px;
                                width: 20px;
                                height: 20px;
                                margin-right: 25px;
                                background: @user_bg;
                            }
                            &:hover{
                                color: var(--mainColor);
                            }
                            &.message_icon.news::after {
                                content: "";
                                display:inline-block;
                                vertical-align: middle;
                                margin-left: 10px;
                                margin-top: -2px;
                                width:8px;
                                height:8px;
                                border-radius:8px;
                                background:#f62a00;
                            }
                            &.message_icon::before {
                                background-position:-179px 0px;
                            }
                            &.message_icon:hover::before {
                                background-position:-179px -37px;
                            }
                            &.help_icon::before {
                                background-position:1px 1px;
                            }
                            &.help_icon:hover::before {
                                background-position:1px -37px;
                            }
                            &.log_icon::before {
                                background-position:-37px 1px;
                            }
                            &.log_icon:hover::before {
                                background-position:-37px -37px;
                            }
                            &.member_icon::before {
                                background-position:-75px 1px;
                            }
                            &.member_icon:hover::before {
                                background-position:-75px -37px;
                            }
                            &.order_icon::before {
                                background-position:-149px 1px;
                            }
                            &.order_icon:hover::before {
                                background-position:-149px -37px;
                            }
                            &.log_out::before {
                                background-position:-113px 1px;
                            }
                            &.log_out:hover::before {
                                background-position:-113px -37px;
                            }
                        }
                    }
                }
            }
        }
    }
}
</style>