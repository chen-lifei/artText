<template>
    <transition name="modal-fade">
        <div class="material-page-preview-modal" v-show="show_modal" @click="close()">
            <div class="centent" ref="centent" @mousewheel="wheel($event)" @click.stop>

                <!-- 模板页素材内容 -->
                <div class="main-content">
                    <div class="current-svg" :style="current_svg_style">
                        <transition name="modal-fade">
                            <svg-modal v-show="show_svg" :svg_w="preview_svg.w" :svg_h="preview_svg.h" :svg_view="preview_svg.view" :page_info="page_info"></svg-modal>
                        </transition>
                    </div>
                    <div class="insert-btn" @click="insert">
                        <base-icon class="icontianjia1"></base-icon>
                        插入使用
                        <div class="vip-icon" v-if="material_info.isVip">
                            <base-icon class="iconvip1"></base-icon>
                        </div>
                    </div>
                </div>

                <!-- 上一个按钮 -->
                <div class="previous" v-if="infoIndex != 0 && !hide_arrow">
                    <base-icon class="iconjiantou" @click="previous"></base-icon>
                </div>
                <!-- 下一个按钮 -->
                <div class="next" v-if="infoIndex < length - 1 && !hide_arrow">
                    <base-icon class="iconjiantou" @click="next"></base-icon>
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
    props: ["type"],
    components: {
        SvgModal
    },
    data() {
        return {
            show_modal: false,         // 是否显示
            throttle: false,           // 是否在滚动滚轮中
            material_info: {},         // 素材信息
            length: 1,
            infoIndex: 0,
            hide_arrow: false,          // 是否隐藏左右箭头

            page_info: {},
            //预览内svg大小
            preview_svg: {
                w: 910,
                h: 0,
                view: [0, 0, 0, 0]
            },
            show_svg: false,            // 是否显示svg
        }
    },
    mounted() { },
    computed:{
        current_svg_style() {
            let { w, h } = this.preview_svg;
            return w >= h ? { width: `100%` } : { height: `100%` };
        },
    },
    methods: {
        // 显示模态框
        show(material, index, length, show_btn) {
            this.material_info = material;
            this.length = length;
            this.infoIndex = index;
            this.show_modal = true;
            if (Object.prototype.toString.call(show_btn) === '[object Object]' && show_btn.hide_arrow) {
                this.hide_arrow = true;
            }
            this.getDetail(material);
            // 绑定按钮事件
            window.addEventListener('keydown', this.modalKeydown);
        },
        getDetail(item) {
            this.$axios({ url: '/api/material/detail/', params: { mid: item.id } }).then(res => {
                let { code, data } = res.data;
                if (code == '2') {
                    let page_info = {
                        width: 910,
                        height: 512,
                        background: {
                            color: '#ffffff',
                            image: null,
                            type: 'color'
                        },
                        elementList: []
                    };
                    if(data.type === 'svg'){
                        page_info.elementList = data.html;
                        page_info = this.$common.document_pages_dataparse([page_info])[0];
                    }else if(data.type === 'page'){
                        Object.assign(page_info, JSON.parse(data.html));
                        page_info = this.$common.document_pages_dataparse([page_info])[0];
                    }
                    this.page_info = page_info;

                    this.$nextTick(() => {
                        this.computeSvgSize(data);
                        this.show_svg = true;
                    });
                }
            });
        },
        // 计算缩略图大小
        computeSvgSize(data) {
            let wrap_el = this.$refs['centent'];
            let $content = $(wrap_el);
            if (!$content.length) return;
            let modal_width = $content[0].clientWidth;
            let modal_heigth = $content[0].clientHeight;
            let modal_ratio = modal_width / modal_heigth;
            let doc = this.page_info;
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
            this.preview_svg.w = svg_w;
            this.preview_svg.h = svg_h;
            this.preview_svg.view[2] = doc.width;
            this.preview_svg.view[3] = doc.height;
        },
        // 关闭模态框
        close() {
            // 关闭模态框
            this.show_modal = false;
            this.show_svg = false;
            this.length = 1;
            this.infoIndex = 0;
            // 解绑按钮事件
            window.removeEventListener('keydown', this.modalKeydown);
        },
        // 模态框键盘事件
        modalKeydown(e) {
            let key = e.keyCode;
            switch (true) {
                // down键 ↓
                case key === 38:
                    e.preventDefault();
                    this.next();
                    break;
                // up键 ↑
                case key === 40:
                    e.preventDefault();
                    this.previous();
                    break;
            }
        },
        // 滚动事件
        wheel(e) {
            // 防抖
            if (this.throttle) return;
            // 向上滚动
            if (e.wheelDelta > 0) this.previous();
            // 向下滚动 
            if (e.wheelDelta < 0) this.next()

            // 防抖处理
            this.throttle = true;
            setTimeout(() => {
                this.throttle = false;
            }, 300);
        },
        change(item, index) {
            this.material_info = item;
            this.infoIndex = index;
            this.getDetail(item);
        },
        changeLength(length) {
            this.length = length;
        },
        // 上一个
        previous() {
            if (this.infoIndex === 0) return;
            this.$emit("change", { type: "previous", index: this.infoIndex });
        },
        // 下一个
        next() {
            if (this.infoIndex === this.length - 1) return;
            this.$emit("change", { type: "next", index: this.infoIndex });
        },
        // 插入
        insert() {
            this.$emit("insert", this.material_info);
            this.close();
        },
    }
}
</script>

<style lang="less" scoped>
.material-page-preview-modal {
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
            .insert-btn {
                position: absolute;
                right: 0;
                top: -42px;
                width: 120px;
                height: 36px;
                display: flex;
                justify-content: center;
                align-items: center;
                background: #d2d2d7;
                border-radius: 5px;
                text-align: center;
                font-size: 13px;
                color: #000;
                cursor: pointer;
                transition: all 0.2s;
                &:hover {
                    color: #ffffff;
                    background: var(--mainColor);
                }
                > .icontianjia1 {
                    transform: translateY(1px);
                    margin-right: 4px;
                }
                .vip-icon {
                    width: 48px;
                    height: 24px;
                    position: absolute;
                    top: -10px;
                    right: -18px;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    border-radius: 3px;
                    background: #fd3f40;
                    transform: scale(0.7);
                    > .iconvip1 {
                        font-size: 12px;
                        color: #fff;
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