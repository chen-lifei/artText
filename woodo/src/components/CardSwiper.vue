<template>
    <div ref="cardSwiper" class="card-swiper">
        <div ref="content" :class="['content', {'l-gap': !leftShow && shadow, 'r-gap': !rightShow && shadow}]">
            <div ref="cardGroup" class="card-group" :style="{left: cardGroupLeft} ">
                <slot name="cards" class="card-item"></slot>
                <div class="more-btn" v-if="showMore && isShowBtn" @click="$emit('toMore')">
                    <div class="text">
                        <span>查<br />看<br />全<br />部<br /></span>
                        <base-icon class="iconchangjiantou"></base-icon>
                    </div>
                </div>
            </div>
        </div>
        <button class="prev" @click="prevPage()" v-show="leftShow"></button>
        <button class="next" @click="nextPage()" v-show="rightShow"></button>
    </div>
</template>

<script>
export default {
    props: {
        shadow: {
            type: Boolean,
            default: true
        },
        showMore: {                     // 是否需要显示更多按钮
            type: Boolean,
            default: true
        }
    },
    watch: {
        rightShow: {
            handler(value) {
                this.$emit('end', value);
            },
            immediate: true,
        }
    },
    data() {
        return {
            cardGroupLeft: 0,
            leftShow: false,     // 左按钮是否显示
            rightShow: false,    // 右按钮是否显示
            swiperObserver: null,
            isShowBtn: false,    // 更多按钮是否显示
        }
    },
    mounted() {
        let that = this;
        let el = that.$refs['cardGroup'];
        this.$nextTick(() => {
            that.btnShow();
        });
        
        that.mutationObserver(el, () => {
            that.cardGroupLeft = 0;
            that.btnShow();
            // 图片加载加入观察
            let imgs = el.querySelectorAll('img');
            if (!imgs.length) return;
            imgs.forEach(img => {
                if (!img.complete){
                    let loadCallback = () => {
                        that.btnShow();
                        img.removeEventListener('load', loadCallback);
                    }
                    img.addEventListener('load', loadCallback);
                };
            });
        });
    },
    methods: {
        // 上一页
        prevPage() {
            this.rightShow = true;
            let cardSwiperWidth = this.$refs['content'].clientWidth;
            let cardGroupLeft = this.$refs['cardGroup'].offsetLeft;
            let positionLeft = cardGroupLeft + cardSwiperWidth;
            this.cardGroupLeft = positionLeft >= 0 ? 0 : `${positionLeft}px`;
            if (this.cardGroupLeft === 0) this.leftShow = false;

        },
        // 下一页
        nextPage() {
            this.leftShow = true;
            let cardSwiperWidth = this.$refs['content'].clientWidth;
            let cardGroupLeft = this.$refs['cardGroup'].offsetLeft;
            let positionLeft = cardGroupLeft - cardSwiperWidth;
            let cardGroupWidth = this.$refs['cardGroup'].scrollWidth;

            if (-(positionLeft - cardSwiperWidth) > cardGroupWidth) {
                this.cardGroupLeft = `${-cardGroupWidth + cardSwiperWidth}px`;
                this.rightShow = false
            } else {
                this.cardGroupLeft = `${positionLeft}px`;
            }

        },
        btnShow() {
            this.leftShow = false;
            this.rightShow = false;
            this.isShowBtn = false;
            let cardGroupWidth = this.$refs['cardGroup'].scrollWidth;
            let cardSwiperWidth = this.$refs['content'].clientWidth;
            if (cardGroupWidth > cardSwiperWidth) {
                // 内容大于容器 显示下一页按钮
                this.rightShow = true;
                this.isShowBtn = true;
            } else {
                // 内容小于或者等于容器 不显示按钮
                this.leftShow = false;
                this.rightShow = false;
            }
        },
        // 监听dom树改变
        mutationObserver(el, callback) {
            if(!this.swiperObserver || this.swiperObserver.constructor !== MutationObserver){
                // 创建一个观察器实例并传入回调函数
                this.swiperObserver = new MutationObserver(callback);
            }
            // 观察器的配置（需要观察什么变动）
            let config = {
                attributeFilter: ['scrollWidth'],
                attributes: true, // 属性更改监听
                childList: true, // 子元素更改监听
                subtree: false
            };
            // 开始观察目标节点
            this.swiperObserver.observe(el, config);
        }
    },
    beforeDestroy() {
        this.swiperObserver.disconnect();
        this.swiperObserver = null;
    }
};
</script>

<style lang="less" scoped>
.card-swiper {
    position: relative;
    justify-content: flex-start;
    width: 100%;
    transition: all 0.3s;
    .content {
        position: relative;
        height: auto;
        padding: 20px 0;
        overflow-x: auto;
        overflow-y: hidden;

        // 隐藏滚动条
        scrollbar-width: none; // Firefox
        -ms-overflow-style: none; // IE 10+
        &::-webkit-scrollbar {
            // webkit
            display: none;
        }
        &.l-gap {
            width: calc(100% + 20px);
            margin-left: -20px;
        }
        &.r-gap {
            width: calc(100% + 20px);
            margin-left: -20px;
        }

        .card-group {
            display: flex;
            align-items: center;
            position: relative;
            top: 0;
            height: auto;
            transition: 0.5s;
            > * {
                align-self: start;
            }
        }
        .more-btn {
            display: inline-block;
            position: relative;
            width: 67px;
            height: 220px;
            margin-left: 6px;
            flex-shrink: 0;
            border-radius: 6px;
            color: #ffffff;
            background-color: var(--mainColor);
            cursor: pointer;
            .text {
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                .base-icon {
                    margin-top: 5px;
                }
            }
        }
    }
    > button {
        display: flex;
        justify-content: center;
        align-items: center;
        position: absolute;
        top: 50%;
        width: 40px;
        height: 40px;
        background: var(--upperColor);
        border-radius: 50%;
        border: 1px solid var(--borderColor);
        cursor: pointer;
        z-index: 10;

        &::after {
            content: '';
            display: block;
            width: 6px;
            height: 6px;
            border-top: 2px solid #949496;
        }

        &.prev {
            transform: translate(-50%, -50%);
            left: 0;
            &::after {
                margin-right: -2px;
                border-left: 2px solid #949496;
                transform: rotate(-45deg);
            }
        }

        &.next {
            transform: translate(50%, -50%);
            right: 0;
            &::after {
                margin-right: 3px;
                border-right: 2px solid #949496;
                transform: rotate(45deg);
            }
        }

        &:hover {
            background-color: var(--mainColor);
            &::after {
                border-color: #ffffff;
            }
        }
    }
}
</style>