<template>
    <transition name="modal-fade">
        <div class="doc-preview-modal" v-show="show_modal" @click="close()">
            <div class="centent" ref="centent" @mousewheel="wheel($event)" @click.stop="checkFullPage($event)" @mousemove.stop="fullMousemove($event)">

                <!-- 主要显示内容 -->
                <div class="main-content">
                    <div ref="currentSvg" class="current-svg" :style="current_svg_style" v-if="document_info && current_page_info && document_pages_list.length > 0">
                        <transition name="modal-fade" v-for="item in document_pages_list" :key="item.id">
                            <svg-modal v-if="item.id === current_page_info.id" :svg_w="current_preview_svg.w" :svg_h="current_preview_svg.h" :svg_view="current_preview_svg.view" :document="document_info" :page_info="current_page_info"></svg-modal>
                        </transition>
                    </div>
                </div>

                <!-- 缩略图列表外框 -->
                <div class="list-show-frame" v-if="document_pages_list&&document_pages_list.length">
                    <div :class="['thumbnail-wrap', {'up-show': list_show}]" @mouseleave="list_show = false">
                        <!-- 缩略图列表 -->
                        <div class="thumbnail-svg">
                            <div class="thumbnail-list" ref="thumbnail_list">
                                <div class="thumbnail-card" v-for="(item,index) in document_pages_list" :key="item.id" @click.stop="checkThumbnail(index)" :class="current_page_index === index ? 'current' : ''" :style="{width:`${thumbnail_preview_svg.w}px`, height:`${thumbnail_preview_svg.h}px`}" v-bdtongji="`PC-2.6.7-模板中心-左侧-模板弹窗-预览页点击`">
                                    <svg-modal :svg_w="thumbnail_preview_svg.w" :svg_h="thumbnail_preview_svg.h" :svg_view="thumbnail_preview_svg.view" :document="document_info" :page_info="item" mode="thumbnail"></svg-modal>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="previous" @click="checkThumbnail(current_page_index - 1)" v-show="current_page_index > 0" v-if="document_pages_list&&document_pages_list.length">
                    <base-icon class="iconjiantou"></base-icon>
                </div>
                <div class="next" @click="checkThumbnail(current_page_index + 1)" v-show="current_page_index < document_pages_list.length - 1" v-if="document_pages_list&&document_pages_list.length">
                    <base-icon class="iconjiantou"></base-icon>
                </div>

                <!-- 进入全屏按钮 -->
                <button class="full-screen" @click="inFullScreen()" v-tooltip="'全屏'" v-show="!in_full_screen"></button>

                <div class="close-wrap" v-show="in_full_screen">
                    <!-- 关闭全屏按钮 -->
                    <button class="close-full-screen" @click.stop="outFullScreen()" v-tooltip="'关闭全屏'"></button>
                </div>

            </div>

            <!-- 关闭按钮 -->
            <button class="close" @click="close()">
                <base-icon class="iconchacha"></base-icon>
            </button>
        </div>
    </transition>
</template>

<script>
import SvgModal from '@/components/SvgPageModal.vue';
export default {
    components: {
        SvgModal
    },
    data() {
        return {
            show_modal: false, // 是否显示
            document_info: {}, // 文档信息
            template_info: {}, // 模板信息
            template_detail: {}, // 模板详情

            list_show: false, // 是否显示缩略图列表
            document_pages_list: [], // 模板页列表
            current_page_info: {}, // 当前页信息
            current_page_index: 0, // 当前页索引
            //预览内svg大小
            current_preview_svg: {
                w: 910,
                h: 0,
                view: [0, 0, 0, 0]
            },
            //缩略图svg大小
            thumbnail_preview_svg: {
                w: 910,
                h: 0,
                view: [0, 0, 0, 0]
            },

            throttle: false, // 是否在滚动滚轮中
            in_full_screen: false // 是否全屏
        }
    },
    computed: {
        current_svg_style() {
            let { w, h } = this.current_preview_svg;
            return w >= h ? { width: `100%` } : { height: `100%` };
        }
    },
    mounted() { },
    methods: {
        // 显示模态框
        show({ id, type }) {
            this.init();
            this.getTemplateDetail(id, type);
        },
        // 关闭模态框
        close() {
            // 关闭模态框
            this.show_modal = false;
            // 解绑按钮事件
            window.removeEventListener('keydown', this.modalKeydown);

            // 解除监听全屏
            ['fullscreenchange', 'webkitfullscreenchange', 'mozfullscreenchange'].forEach(item => {
                window.removeEventListener(item, this.screenChange);
            });
        },
        // 模态框键盘事件
        modalKeydown(e) {
            let key = e.keyCode;
            switch (true) {
                // f11 全屏监控
                case key === 122:
                    if (!this.in_full_screen) {
                        e.preventDefault(); // 阻止默认事件
                        this.inFullScreen()
                    };
                    break;
                // down键 ↓
                case key === 38:
                    e.preventDefault(); // 阻止默认事件
                    this.checkThumbnail(this.current_page_index - 1);
                    break;
                // up键 ↑
                case key === 40:
                    e.preventDefault(); // 阻止默认事件
                    this.checkThumbnail(this.current_page_index + 1);
                    break;
            }
        },
        // 初始化
        init() {
            this.document_info = {}; // 文档信息
            this.template_info = {}; // 模板信息
            this.template_detail = {}; // 模板详情
            this.list_show = false; // 是否显示模板页列表
            this.document_pages_list = []; // 模板页列表
            this.current_page_info = {}; // 当前页信息
            this.current_page_index = 0; // 当前页索引

            // 绑定按钮事件
            window.addEventListener('keydown', this.modalKeydown);
            // 绑定全屏切换事件
            ['fullscreenchange', 'webkitfullscreenchange', 'mozfullscreenchange'].forEach(item => {
                window.addEventListener(item, this.screenChange);
            });
        },
        getTemplateDetail(id, type) {
            let url = '';
            switch (type) {
                // 模板
                case 'template':
                    url = '/api/template/detail/';
                    break;
                // 文档
                case 'document':
                    url = '/api/document/';
                    break;
                // 共享作品
                case 'works':
                    url = '/api/works_share/detail/';
                    break;
            }

            if (!url) return false;
            return new Promise((resolve, reject) => {
                this.$axios.get(url + id).then(res => {
                    let { code, data } = res.data;
                    if (code === "2") {
                        // 格式化文档页内容
                        let doc = this.$common.document_dataparse(data.document);
                        let doc_pages = this.$common.document_pages_dataparse(data.documentPages);
                        this.document_info = doc;
                        this.template_detail = data;
                        this.template_info = data.template;
                        this.document_pages_list = doc_pages;
                        this.current_page_info = doc_pages[0];
                        // 计算svg尺寸
                        this.$nextTick(() => {
                            this.computeSvgSize();
                            window.addEventListener('resize', this.computeSvgSize);
                            resolve(res);
                        });
                        // 显示整个预览模态框
                        this.show_modal = true;
                    } else {
                        this.$toast(res.data.content, 800);
                        reject(res);
                    }
                }).catch(reject);
            });
        },
        // 计算缩略图大小
        computeSvgSize() {
            let wrap_el = this.$refs['centent'];
            let $content = $(wrap_el);
            if (!$content.length) return;
            let doc = this.document_info;
            let modal_width = $content[0].clientWidth;
            let modal_heigth = $content[0].clientHeight;

            let modal_ratio = modal_width / modal_heigth;
            let svg_ratio = doc.width / doc.height;
            let ratio = 0;
            let svg_w = 0;
            let svg_h = 0;

            let is_row = doc.width >= doc.height;// 是否横版
            if (is_row) is_row = modal_ratio <= svg_ratio; // 是否会超出容器 超出容器用竖版

            if (is_row) {
                // 横版
                ratio = doc.width / doc.height;
                svg_w = modal_width;
                svg_h = svg_w / ratio;
            } else {
                // 竖版
                ratio = doc.height / doc.width;
                svg_h = modal_heigth;
                svg_w = svg_h / ratio;
            }

            // 保存预览内容
            this.current_preview_svg.w = svg_w;
            this.current_preview_svg.h = svg_h;
            this.current_preview_svg.view[2] = doc.width;
            this.current_preview_svg.view[3] = doc.height;

            // 保存列表内容
            let list_nums = 8; // 列表展示个数
            this.thumbnail_preview_svg.w = is_row ? (svg_w - 56) / list_nums : ((svg_h - 56) / list_nums) / ratio;
            this.thumbnail_preview_svg.h = is_row ? ((svg_w - 56) / list_nums) / ratio : (svg_h - 56) / list_nums;
            this.thumbnail_preview_svg.view[2] = doc.width;
            this.thumbnail_preview_svg.view[3] = doc.height;
        },
        // 查看当前缩略图
        checkThumbnail(index) {
            // 最后一页拦截
            if (index >= this.document_pages_list.length) {
                return this.$toast({
                    text: '当前是最后一页',
                    el: this.$refs['centent']
                });
            };
            // 当前页拦截
            if (this.current_page_index === index || index < 0) return;

            this.current_page_info = this.document_pages_list[index];
            this.current_page_index = index;

            // 列表滚动
            let thumbnail_list = this.$refs['thumbnail_list'];
            let scroll_list = $(thumbnail_list);
            let card_width = $('.thumbnail-card')[0].clientWidth;
            let card_offset = $('.thumbnail-card')[index].offsetLeft;
            scroll_list.stop().animate({
                scrollLeft: card_offset - card_width * 2 - 28
            }, 300);
        },
        // 滚动事件
        wheel(e) {
            // 防抖
            if(this.throttle) return;
            let index = this.current_page_index;
            let list_length = this.document_pages_list.length - 1;
            if (e.wheelDelta > 0 && index) this.checkThumbnail(index - 1); // 向上滚动 && 当前不是第一页
            if (e.wheelDelta < 0 && index < list_length) this.checkThumbnail(index + 1); // 向下滚动 && 当前不是最后一页

            // 防抖处理
            this.throttle = true;
            setTimeout(() => {
                this.throttle = false;
            }, 300);
        },
        // 全屏模式切换
        screenChange() {
            // 是否有元素处于全屏状态
            let is_full = (document.fullScreenElement && document.fullScreenElement !== null) || document.fullScreen || document.mozFullScreen || document.webkitIsFullScreen;
            this.in_full_screen = is_full;
        },
        // 进入全屏
        inFullScreen() {
            let el = this.$refs['centent'];
            let is_ie = this.$common.get_device().ie;// 检查是不是ie浏览器

            if (is_ie) {
                this.iefull(); // ie浏览器全屏
            } else {
                let rfs = el.requestFullScreen || el.webkitRequestFullScreen || el.mozRequestFullScreen || el.msRequestFullscreen;
                if (typeof rfs !== "undefined" && rfs) {
                    rfs.call(el);
                }
            }
        },
        // 退出全屏
        outFullScreen() {
            if (!this.in_full_screen) return;
            let el = this.$refs['centent'];
            let is_ie = this.$common.get_device().ie;

            // ie浏览器
            if (is_ie) {
                this.iefull();
                return false;
            }

            if (document.exitFullscreen && document.exitFullscreen !== null) document.exitFullscreen();
            if (document.mozCancelFullScreen) document.mozCancelFullScreen();
            if (document.webkitCancelFullScreen) document.webkitCancelFullScreen();
            if (document.msExitFullscreen) document.msExitFullscreen();
        },
        // ie浏览器全屏
        iefull() {
            if (typeof window.ActiveXObject == "undefined") {
                //这的方法 模拟f11键，使浏览器全屏
                let wscript = new ActiveXObject("WScript.Shell");
                if (wscript != null) {
                    wscript.SendKeys("{F11}");
                }
            }	//ie调用ActiveX控件，需要在ie浏览器安全设置里面把 ‘未标记为可安全执行脚本的ActiveX控件初始化并执行脚本’ 设置为启用
        },
        // 全屏时切换页面
        checkFullPage(e) {
            // 非全屏或者只有一页时
            if (!this.in_full_screen || this.document_pages_list.length <= 1) return false;
            let index = this.current_page_index - 1;
            // 点击的位置是右边 or 当前为第一页时
            if (e.clientX >= e.view.innerWidth / 2 || !this.current_page_index) index = this.current_page_index + 1;
            this.checkThumbnail(index);
        },
        // 全屏时鼠标移动
        fullMousemove(e) {
            // 非全屏或者只有一页时
            if (!this.in_full_screen) return false;
            if (e.offsetY >= e.view.innerHeight - this.$refs['thumbnail_list'].offsetHeight) this.list_show = true;
        }

    }
}
</script>

<style lang="less" scoped>
.doc-preview-modal {
    position: fixed;
    left: 0;
    top: 0;
    width: 100vw;
    height: 100vh;
    background: rgba(0, 0, 0, 0.7);
    .centent {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        width: calc(5 / 6 * 100vw);
        max-width: 1440px;
        height: calc(15 / 32 * 100vw);
        max-height: 810px;
        border: none;
        /deep/.toast {
            bottom: auto;
        }

        .main-content {
            position: relative;
            width: 100%;
            height: 100%;
            border-radius: 10px;
            background: #000000;
            overflow: hidden;
            .current-svg {
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                display: flex;
                justify-content: center;
                align-items: center;
                /deep/.edit_page {
                    position: absolute;
                    transform-origin: 50% 50%;
                }
            }
        }

        .list-show-frame {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            overflow: hidden;
            .thumbnail-wrap {
                position: absolute;
                top: 100%;
                left: 50%;
                transform: translate(-50%, 0);
                padding: 10px 0;
                width: calc(39 / 40 * 100%);
                height: auto;
                background: rgba(0, 0, 0, 0.5);
                transition: 0.3s;
                &.up-show {
                    transform: translate(-50%, -100%);
                }

                // 缩略图列表
                .thumbnail-svg {
                    position: relative;
                    margin: 0 auto;
                    width: calc(100% - 20px);

                    .thumbnail-list {
                        width: 100%;
                        overflow-x: auto;
                        white-space: nowrap;
                        // scrollbar-width: none;
                        // -ms-overflow-style: none;
                        // &::-webkit-scrollbar { display: none; }
                    }
                    .thumbnail-card {
                        position: relative;
                        display: inline-block;
                        vertical-align: top;
                        margin-right: 14px;
                        white-space: initial;
                        border-radius: 8px;
                        overflow: hidden;
                        cursor: pointer;
                        &:hover::before,
                        &.current::before {
                            display: block;
                        }
                        &::before {
                            content: '';
                            display: none;
                            position: absolute;
                            top: 0;
                            left: 0;
                            width: 100%;
                            height: 100%;
                            box-sizing: border-box;
                            z-index: 2;
                            border: 2px solid #0d7bf7;
                            border-radius: 8px;
                        }
                    }
                }
            }
        }

        // 翻页按钮
        .previous,
        .next {
            position: absolute;
            top: 50%;
            transform: translateY(-50%);
            padding: 30px;
            z-index: 10;
            cursor: pointer;
            .base-icon {
                font-size: 40px;
                color: #ffffff;
            }
        }
        .previous {
            right: 100%;
        }
        .next {
            left: 100%;
            .base-icon {
                transform: rotate(180deg);
            }
        }

        // 进入全屏按钮
        .full-screen {
            position: absolute;
            top: 0;
            right: 0;
            width: 32px;
            height: 32px;
            background: rgba(0, 0, 0, 0.2)
                url('~@/assets/pc/images/slides/full.png') no-repeat center;
            opacity: 0;
            border-top-right-radius: 10px;
            transition: .3s;

            &:hover {
                background-color: rgba(0, 0, 0, 0.5);
                background-size: 73%;
            }
        }

        // 关闭按钮显示触发区域
        .close-wrap {
            position: absolute;
            top: 0;
            right: 0;
            width: 100%;
            height: 32px;
            .close-full-screen {
                position: absolute;
                top: 0;
                right: 0;
                width: 32px;
                height: 32px;
                background: rgba(0, 0, 0, 0.2)
                    url('~@/assets/pc/images/slides/outfull.png') no-repeat
                    center;
                opacity: 0;
            }
            &:hover {
                .close-full-screen {
                    opacity: 1;
                }
            }
        }

        &:hover {
            .full-screen {
                opacity: 1;
            }
        }
    }

    // 关闭按钮
    .close {
        display: flex;
        justify-content: center;
        align-items: center;
        position: absolute;
        right: 10px;
        top: 10px;
        width: 32px;
        height: 32px;
        font-size: 16px;
        border-radius: 50%;
        background: #d2d2d8;
    }
}
</style>