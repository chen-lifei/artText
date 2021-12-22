<template>
    <i
        v-if="!svgId"
        class="base-icon iconfont"
        :style="iconStyle"
        @click="$emit('click', $event)"
    >
        <slot></slot>
    </i>
    <!-- svg图标 -->
    <svg v-else 
        class="base-icon iconsvg"
        aria-hidden="true"
        :style="iconStyle"
        @click="$emit('click', $event)"
    >
        <use :xlink:href="`#${svgId}`"></use>
    </svg>
</template>

<script>
/**
 * 通用图标组件
 * @prop svgId[string]                      svg类名
 * @prop color[string]                      图标颜色
 * @prop size[number]                       图标尺寸
 * @prop rotate[number]                     图片旋转
 * 
 * @slot Unicode图标字符
 *
 * @event click                             点击事件
 */
export default {
    name: "base-icon",
    props: {
        svgId: String,
        color: String,
        size: [Number, String],
        rotate: [Number, String]
    },
    computed: {
        iconStyle() {
            return {
                color: this.color || "",
                fontSize: this.size ? `${this.size}px` : "",
                transform: this.rotate ? `rotate(${this.rotate}deg)` : ""
            };
        },
    },
    methods: {},
};
</script>

<style lang="less">
.iconfont {
    display: inline-block;
    font-family: "iconfont" !important;
    font-size: 16px;
    color: inherit;
    font-style: normal;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    &::before {
        display: inline-block;
        width: 100%;
        height: 100%;
    }
}
.iconsvg {
    width: 1em;
    height: 1em;
    vertical-align: -0.15em;
    fill: currentColor;
    overflow: hidden;
}
</style>