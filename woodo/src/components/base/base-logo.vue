<template>
    <!-- icon+吾道---主题色 -->
    <router-link v-if="type !== `code` && link" tag="img" class="base-logo link" :data-mobile="isMobile" :to="link" :style="logoStyle" :src="require(`public/images/common/logo-${type}-${theme}.png`)"></router-link>
    <img v-else-if="type !== `code` && !link" class="base-logo" :data-mobile="isMobile" :style="logoStyle" :src="require(`public/images/common/logo-${type}-${theme}.png`)" />
    <!-- 二维码使用 -->
    <img v-else class="base-logo" :data-mobile="isMobile" :style="logoStyle" :src="require('public/images/common/logo-code.png')" />
</template>

<script>
/**
 * 通用图标组件
 * @prop type[string]                       icon类型（icon+吾道：normal  只有icon：icon  只有英文woodo：text  二维码使用：code）
 * @prop theme[string]                      logo颜色（主题色：main  白色：white）
 * @prop link[number]                       跳转链接（为空时，无跳转功能）
 * @prop width[number]                      Logo宽度
 * @prop height[number]                     Logo高度
 *
 * @event click                             点击事件
 */
export default {
    name: "base-logo",
    props: {
        type: {
            type: String,
            default: `normal`
        },
        theme: {
            type: String,
            default: `main`
        },
        link: {
            type: String,
            default: ``
        },
        width: [Number, String],
        height: [Number, String],
    },
    data () {
        return {
            isMobile: false,
        }
    },
    computed: {
        logoStyle() {
            return {
                width: this.width ? `${this.width}px` : "",
                height: this.height ? `${this.height}px` : "",
            };
        },
    },
    mounted () {
        this.isMobile = utils.deviceENV().mobile;
    },
};
</script>

<style lang="less">
.base-logo{
    display: inline-block;
    vertical-align: middle;
    width: 68px;
    image-rendering: -webkit-optimize-contrast;
    &[data-mobile] {
        image-rendering: auto;
    }
    &.link {
        cursor: pointer;
        transition: opacity .3s;
        &:hover{
            opacity: .8;
        }
    }
}
</style>