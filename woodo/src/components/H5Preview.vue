<template>
    <transition name="modal-fade">
        <div class="h5preview_layer" v-if="isshow" @click="hide">
            <div class="h5preview_container" @click.stop>
                <div class="left_container">
                    <div class="h5preview_body">
                        <div class="slides_list" 
                            ref="slides_container" 
                            :style="{'width': `${svg_w}px`, 'height': `${svg_h}px`}"
                        >
                            <div class="slide_page" 
                                v-for="(item, index) in document_pages" 
                                :key="index"
                                :data-switch="String(switch_type)" 
                                :style="{'width': `${svg_w}px`, 'height': `${svg_h}px`}"
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
                        </div>
                        <!-- 背景音乐 -->
                        <div class="h5_BGM_container" 
                            ref="h5_BGM_container"
                            v-if="document_info.attr && document_info.attr.backgroundMusic && document_info.attr.backgroundMusic.src"
                        >
                            <img v-webp="require(`../assets/pc/images/common/record.png`)" alt="" @click="h5_BGM_toggle_play"/>
                            <audio :src="document_info.attr.backgroundMusic.src" 
                                :autoplay="document_info.attr.backgroundMusic.autoplay" 
                                :loop="document_info.attr.backgroundMusic.loop"
                                :data-fadein="document_info.attr.backgroundMusic.fadeIn"
                                :data-fadeout="document_info.attr.backgroundMusic.fadeOut"
                                :data-hideonshow="document_info.attr.backgroundMusic.hideOnShow"
                                @loadedmetadata="BGM_start_play"
                                @play="h5_BGM_playing_animation"
                                @pause="h5_BGM_playing_animation"
                            ></audio>
                        </div>
                    </div>
                    <div class="h5preview_foot">
                        <a href="javascript:;" class="page_turning" :class="{'disabled': page_number <= 0}" @click="page_switch_control('prev')">上一页</a>
                        <span class="page_number">{{ page_number + 1 }} / {{ document_pages.length }}</span>
                        <a href="javascript:;" class="page_turning" :class="{'disabled': page_number >= document_pages.length - 1}" @click="page_switch_control('next')">下一页</a>
                    </div>
                    <div class="start-animation-container"></div>
                </div>
                <div class="right_container">
                    <base-logo type="text" theme="gray"></base-logo>
					<button class="modal-close" @click="hide"></button>
                    <div class="share_container">
                        <div class="edit_info_container">
                            <div class="title">
                                <img v-lazy="require(`../assets/pc/images/common/h5_icon.png`)" width="27" height="18" alt="">
                                <p>{{ document_info.title }}</p>
                            </div>
                            <div class="remarks">
                                <textarea maxlength="60" v-model="share_info.remark" @focus="remark_select"></textarea>
                                <div class="maxlength">{{ share_info.remark.length }}/60</div>
                            </div>
                            <div class="date">最后编辑：{{ share_info.date }}</div>
                            <div class="changebgm">注：更换背景音乐请在 <a href="javascript:;" @click="open_theme_modal">全局设置</a> 中操作</div>
                        </div>
                        <div class="share_info_container">
                            <div class="share_tips">
                                <span>扫码手机查看并分享</span>
                            </div>
                            <div class="qrcode_container">
                                <base-logo type="code" width="30" height="30"></base-logo>
                                <img class="qrcode" :src="share_info.qrcode_dataurl" alt="">
                            </div>
                            <div class="link_copy">
                                <p>{{ share_info.share_url }}</p>
                                <a href="javascript:;" v-clipboard:copy="share_info.share_url" v-clipboard:success="onCopy" v-clipboard:error="onError">复制</a>
                            </div>
                            <a href="javascript:;" class="create_poster_btn" @click="open_poster">生成海报分享给好友</a>
                        </div>
                    </div>
                </div>
            </div>
            <!-- 海报 -->
            <div @click.stop>
                <poster_modal ref="poster_modal"
                    :document_info="document_info"
                    :document_pages="document_pages"
                    :qrcode_url="share_info.qrcode_dataurl"
                ></poster_modal>
            </div>
        </div>
    </transition>
</template>

<script>
import Vue from 'vue'
import QRCode from 'qrcode';
import svg_modal from '@/components/SvgPageModal.vue';
import poster_modal from '@/components/PosterModal.vue';
import page_opt from '@/assets/pc/js/opt/page_opt.js';
import element_animate from '@/assets/pc/js/element_animate.js';
import opt_factory from "@/assets/pc/js/opt/opt_factory.js";

Vue.use(QRCode);

export default {
    name: 'H5Preview',
    components: {
        svg_modal,
        poster_modal
    },
    data() {
        return {
            isshow: false,

            // 文档相关
            document_info: {},
            document_pages: [],
            share_info: {
                remark: '',
                defalut_remark: `我刚刚在吾道幻灯片上做了一个非常有意思的PPT作品，里面有你感兴趣的内容，快来围观我吧~`,
                date: '',
                share_url: '',
                qrcode_dataurl: '',
            },
            // 默认背景音乐
            backgroundMusic: {
                fadeOut: "00:00",
                src: "https://file.woodo.cn/upload/media/202002/18/39fdf356-6078-4560-9c95-031c6f5382c6.mp3",
                fadeIn: "00:00",
                loop: true,
                hideOnShow: false,
                autoplay: true,
            },

            // 渲染相关
            svg_w: 910,
            svg_h: 512,
            svg_view: [0, 0, 0, 0],
            switch_type: null,
            page_number: 0,
            changing: false,
        }
    },
    methods: {
        show(id) {
            if (!id) return;
            this.isshow = true;
            this.page_number = 0;
            this.get_document_info(id);
        },
        hide() {
            window.removeEventListener('resize', this.svg_render);
            this.isshow = false;
        },
        get_show() {
            return this.isshow;
        },

        // 获取文档信息
        get_document_info(url) {
            let that = this;
            if (!url) {
                return;
            }
            that.$axios.get(`/api/document/${url}/?createH5=true`).then(res => {
                let res_data = res.data;
                if (res_data.type === 'error') {
                    return;
                }
                let document_info = that.$common.document_dataparse(res_data.data.document);
                let document_pages = that.$common.document_pages_dataparse(res_data.data.documentPages);
                document_info.attr['backgroundMusic'] = Object.assign(that.backgroundMusic, document_info.attr['backgroundMusic'] || {});
                that.document_info = document_info;
                that.document_pages = document_pages;
                that.share_info.date = utils.dateFormat(new Date(document_info.modifyDate), 'yyyy-MM-dd HH:mm:ss');
                // 获取h5分享信息
                that.get_h5_share_info(document_info.id);
                // 初始化渲染
                that.svg_render();
                that.$nextTick(() => {
                    that.init_function();
                });
            }).catch(err => {
                console.error(err);
            });
        },
        get_h5_share_info(id) {
            let that = this;
            if (!id) {
                return;
            }
            that.$axios.get(`/api/document_share/get_share_content/`, {
                params: {
                    docId: id,
                },
            }).then(res => {
                let res_data = res.data;
                that.share_info.remark = res_data.data['shareContent'] || that.share_info.defalut_remark;
            });
        },
        // 初始化渲染模板
        svg_render() {
            let that = this;
            if (that._isDestroyed) {
                return;
            }
            let document_info = that.document_info;
            let document_pages = that.document_pages;
            let ratio = document_info.width / document_info.height;
            let width = 0;
            let height = 0;
            let contain_width = document.querySelector('.h5preview_body').clientWidth;
            let contain_height = document.querySelector('.h5preview_body').clientHeight;
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
        },
        // 接口数据获取完成，进行渲染
        init_function() {
            window.addEventListener('resize', this.svg_render);
            this.change_page();
            this.create_qrcode();
        },
        // 生成二维码
        create_qrcode() {
            let that = this;
            that.share_info.share_url = `${window.origin}/mobile/h5/slides/${that.document_info.url}/`;
            QRCode.toCanvas(that.share_info.share_url, {
                width: 200,
                errorCorrectionLevel: 'Q',
            }).then((canvas) => {
                let ctx = canvas.getContext('2d');
                that.share_info.qrcode_dataurl = canvas.toDataURL('image/png', 1);
            }).catch((err) => {
                console.error(err);
            });
        },
        // 复制链接成功
        onCopy() {
            this.$toast("复制成功");
        },
        // 复制链接失败
        onError() {
            this.$toast("复制失败");
        },
        // 编辑h5分享描述，全选
        remark_select(event) {
            let that = this;
            let $textarea = event.target;
            let old_value = $textarea.value;
            $textarea.select();
            // 失焦保存
            $textarea.onblur = e => {
                if (!that.share_info.remark) {
                    that.share_info.remark = that.share_info.defalut_remark;
                }
                if (old_value === that.share_info.remark) {
                    return;
                }
                that.$axios.post(`/api/member/document_share/save/`, {
                    docId: that.document_info.id,
                    shareContent: that.share_info.remark,
                }).then(res => {
                    let res_data = res.data;
                    if (res_data.type === 'error') {
                        that.$toast('保存信息失败');
                    }
                });
            }
        },

        /**
         * 翻页
         */
        // 切换控制，用于拦截 action = 'next' || 'prev' || Number
        page_switch_control(action) {
            this.set_page_switch(action);
        },
        // 上下翻页方法   gradual = 'next' || 'prev' || Number
        set_page_switch(gradual) {
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
            // 最后一页
            if (index >= that.document_pages.length) return;
            that.changing = true;
            that.page_number = index;
            // 切换文档页
            that.$nextTick(() => {
                that.change_page();
            });
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

        /**
         * 动画 媒体
         */
        // 全屏演示时设置页面元素动画
        start_page_animation() {
            let that = this;
            let list = that.document_pages[that.page_number];
            if (!list) {
                return;
            }
            // 媒体元素开始自动播放
            that.media_autoplay_start();
            // 创建动画并执行
            element_animate.buildAnimation({
                contain: that.$refs.slides_container.querySelector('.slide_page.show'),
                elementList: list.elementList,
                autoplay: true,
            });
        },
        // 重置指定的文档页动画元素
        reset_page_animation(index) {
            let that = this;
            let list = that.document_pages[that.page_number];
            if (!list) {
                return;
            }
            let $edit_page = $(that.$refs.slides_container).find('.slide_page').eq(that.page_number);
            // 重置至动画播放前状态
            element_animate.resetTobefore($edit_page, list.elementList);
        },
        // 所有页 媒体 停止播放并重置播放进度
        media_element_pause() {
            let that = this;
            // audio video
            let $contain = $(that.$refs.slides_container);
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
            // 媒体自动播放
            // audio video
            let $media = $show_page.find('video[data-autoplay="true"], audio[data-autoplay="true"]');
            $media.each((i, item) => {
                item.play();
            });
            // iframe
            let $iframe = $show_page.find('iframe');
            $iframe.attr('src', $iframe.attr('data-src'));
        },
        // 背景音乐
        // 背景音乐播放开始
        BGM_start_play: function (event) {
            let that = this;
            let audio = event.target;
            // 渐强渐弱
            let option = opt_factory.init_opt('audio');
            option.fadein_and_fadeout(audio);
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
        // h5 背景音乐
        h5_BGM_playing_animation() {
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

        // 打开海报
        open_poster() {
            if (this.document_pages.length === 0) {
                return;
            }
            this.$refs.poster_modal.show();
        },
        // 打开全局背景音乐设置
        open_theme_modal() {
            let that = this;
            if (that.$parent && that.$parent.open_theme_modal) {
                that.hide();
                that.$parent.open_theme_modal();
            } else {
                that.$toast('请在编辑器中修改背景音乐');
            }
        },
    }
}
</script>

<style lang="less" scoped>
@keyframes rotate {
    from { transform: rotate(0); transform-origin: center center; }
    to { transform: rotate(360deg); transform-origin: center center; }
}

.h5preview_layer {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 22;
    background-color: rgba(0, 0, 0, 0.5);
}
.h5preview_container {
    position: absolute;
    top: 30px;
    bottom: 30px;
    left: 100px;
    right: 100px;
    font-size: 0;
    text-align: left;
    .modal-close {
        position: absolute;
        top: 14px;
        right: 14px;
        z-index: 1;
    }
    .left_container,
    .right_container {
        display: inline-block;
        vertical-align: top;
        height: 100%;
        background-color: #ffffff;
        border-radius: 4px;
    }
    .left_container {
        position: relative;
        width: calc(100% - 330px);
        margin-right: 10px;
        padding: 10px;
        .h5preview_body {
            position: relative;
            width: 100%;
            height: calc(100% - 55px);
            margin-bottom: 10px;
            font-size: 0;
            text-align: center;
            &::after {
                content: "";
                display: inline-block;
                vertical-align: middle;
                width: 0;
                height: 100%;
            }
            .slides_list {
                position: relative;
                display: inline-block;
                vertical-align: middle;
                width: 100%;
                height: 100%;
                margin: auto;
                font-size: 14px;
                overflow: hidden;
                perspective: 1500px;
                text-align: left;
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
        .h5_BGM_container {
            position: absolute;
            top: 15px;
            right: 15px;
            z-index: 100;
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
        .h5preview_foot {
            width: 100%;
            height: 45px;
            font-size: 14px;
            text-align: center;
            .page_turning,
            .page_number {
                display: inline-block;
                vertical-align: middle;
            }
            .page_turning {
                width: 96px;
                height: 45px;
                line-height: 43px;
                color: #50555e;
                background-color: #ffffff;
                border-radius: 24px;
                border: solid 1px rgba(169, 178, 194, 0.56);
                &.disabled {
                    cursor: no-drop;
                    opacity: 0.5;
                    &:hover {
                        opacity: 0.5;
                    }
                }
                &:not(.disabled):hover {
                    opacity: 1;
                    color: var(--mainColor);
                    border-color: var(--mainColor);
                }
            }
            .page_number {
                line-height: 45px;
                margin: 0 120px;
                color: #a5acb7;
            }
        }
    }
    .right_container {
        position: relative;
        width: 320px;
        font-size: 12px;
        & > img {
            position: absolute;
            bottom: 20px;
            left: 50%;
            margin-left: -50px;
            width: 100px;
            opacity: 0.4;
        }
        .share_container {
            width: 100%;
            height: 100%;
            padding: 20px;
            overflow-x: hidden;
            overflow-y: auto;
        }
    }
    .edit_info_container {
        min-height: 240px;
        height: calc(100% - 460px);
        .title {
            position: relative;
            padding-left: 32px;
            margin-bottom: 18px;
            height: 22px;
            font-size: 16px;
            color: #50555e;
            font-weight: bold;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
            img {
                position: absolute;
                top: 2px;
                left: 0;
            }
            p{
                max-width:90%;
                overflow:hidden;
                text-overflow: ellipsis;
                white-space:nowrap;
            }
        }
        .remarks {
            position: relative;
            height: 100px;
            padding: 8px;
            margin-bottom: 10px;
            background-color: #ffffff;
            border-radius: 2px;
            border: solid 1px rgba(169, 178, 194, 0.56);
            textarea {
                width: 100%;
                height: 100%;
                resize: none;
                color: #63676c;
            }
            .maxlength {
                position: absolute;
                bottom: 8px;
                right: 8px;
                color: #babdc2;
            }
        }
        .date {
            margin-bottom: 40px;
            color: #b0b2b6;
        }
        .changebgm {
            color: #63676c;
            a {
                color: var(--mainColor);
                text-decoration: underline;
            }
        }
    }
    .share_info_container {
        .share_tips {
            position: relative;
            margin-bottom: 4px;
            text-align: center;
            color: #5d6064;
            &::before {
                content: "";
                position: absolute;
                left: 0;
                right: 0;
                top: 50%;
                height: 1px;
                background-color: #9ea9bb;
            }
            span {
                position: relative;
                padding: 0 0.5em;
                background-color: #ffffff;
            }
        }
        .qrcode_container {
            position: relative;
            width: 200px;
            height: 200px;
            margin: 0 auto 20px;
            .base-logo {
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
        .link_copy {
            margin-bottom: 40px;
            p, a {
                display: inline-block;
                vertical-align: top;
                height: 40px;
                line-height: 40px;
            }
            p {
                width: calc(100% - 64px);
                padding: 0 10px;
                color: #6b7279;
                overflow: hidden;
                text-overflow: ellipsis;
                white-space: nowrap;
                background-color: #edf0f3;
            }
            a {
                width: 64px;
                text-align: center;
                color: #ffffff;
                background-color: var(--mainColor);
            }
        }
        .create_poster_btn {
            display: block;
            width: 170px;
            height: 40px;
            line-height: 38px;
            margin: 0 auto 10px;
            text-align: center;
            font-size: 14px;
            color: #69707b;
            background-color: #ffffff;
            box-shadow: 0px 4px 7px 0px rgba(0, 0, 0, 0.08);
            border-radius: 4px;
            border: solid 1px rgba(169, 178, 194, 0.56);
        }
    }
}
</style>