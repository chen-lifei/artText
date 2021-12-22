<template>
    <button
        class="base-button"
        :type="type"
        :style="btnStyle"
        :class="{ 'plain': plain, 'disabled': disabled }"
        @mousedown="eventMousedown"
        @click="eventClick"
        @focus="eventFocus"
    >
        <input v-if="type === `file`" v-show="false" type="file" ref="input" @click.stop :multiple="multiple" :accept="acceptVal" @change="eventChange" />
        <slot></slot>
    </button>
</template>

<script>
/**
 * 通用按钮组件
 * @prop type[string]                   按钮类型 [button|submit|reset|file]
 * @prop accept[string|array]           type=`file`，筛选文件格式 只支持 acceptMap 中列出的
 * @prop multiple[boolean]              type=`file`，多选文件
 * @prop width[number]                  设置按钮宽度
 * @prop height[number]                 设置按钮高度
 * @prop round[boolean]                 是否圆形按钮
 * @prop plain[boolean/string]          是否镂空样式按钮，可设置边框字体颜色
 * @prop disabled[boolean]              是否禁用按钮
 * 
 * @slot 按钮内容
 *
 * @event mousedown                     鼠标按下事件
 * @event click                         点击事件
 * @event change                        type=`file`，表单改变事件
 */
// 定义文件格式（由于性能问题，禁止使用 * 通配符）
const acceptMap = {
    "image": "image/jpeg, image/png, image/bmp, image/webp",
    "application": "application/pdf, application/vnd.ms-powerpoint, application/vnd.openxmlformats-officedocument.presentationml.presentation, .pptx",
    "audio": "audio/x-mpeg, audio/mp3, audio/ogg, audio/x-ms-wma, audio/x-pn-realaudio, audio/x-ms-wmv, audio/x-wav, audio/x-mpegurl, audio/mp4a-latm",
    "video": "video/mp4, video/webm, video/ogg, video/3gpp, video/x-msvideo, video/mpeg, video/vnd.mpegurl, video/x-m4v, video/quicktime, video/x-matroska, video/x-ms-asf",
};

export default {
    name: "base-button",
    props: {
        type: {
            type: String,
            validator(v) {
                return ["button", "submit", "reset", "file"].indexOf(v) !== -1;
            },
            default: `button`,
        },
        accept: [String, Array],
        multiple: Boolean,
        width: [Number, String],
        height: {
            type: [Number, String],
            default: 36,
        },
        round: {
            type: Boolean,
            default: false,
        },
        disabled: {
            type: Boolean,
            default: false,
        },
        plain: [Boolean, String],
    },
    data() {
        return {
        };
    },
    computed: {
        btnStyle() {
            let css = {
                height: `${this.height}px`,
            };
            if (!isNaN(this.width)) {
                css.width = `${this.width}px`;
                css.paddingLeft = 0;
                css.paddingRight = 0;
            }
            if (this.round) {
                css.borderRadius = `${this.height}px`;
            }
            if (typeof this.plain === 'string' && utils.isColor(this.plain)) {
                css.color = this.plain;
                css.borderColor = this.plain;
            }
            return css;
        },
        acceptVal() {
            let val = ``;
            if (this.accept) {
                if (Array.isArray(this.accept)) {
                    val = this.accept.map(i => acceptMap[String(i)]).join(`, `);
                } else if (typeof this.accept === `string` && acceptMap[String(this.accept)]) {
                    val = acceptMap[String(this.accept)];
                }
            }
            return val;
        },
    },
    methods: {
        eventMousedown(event) {
            this.$emit('mousedown', event);
        },
        eventClick(event) {
            if (this.disabled) {
                return;
            }
            this.$refs.input && this.$refs.input.click();
            this.$emit('click', event);
        },
        eventChange(event) {
            this.$emit('change', event);
            setTimeout(() => {
                event.target.value = "";
            }, 300);
        },
        eventFocus(event) {
            let btn = event.target;
            let parent = btn.parentNode;
            btn.blur();
            while (parent) {
                if (parent.getAttribute(`tabindex`) || parent === document.body) {
                    parent.focus();
                    parent = false;
                } else {
                    parent = parent.parentNode;
                }
            }
        },
    },
};
</script>

<style lang="less">
.base-button {
    display: inline-block;
    padding: 0 1em;
    line-height: 1;
    font-size: 14px;
    color: var(--textColor);
    background-color: #ffffff;
    border-radius: 5px;
    white-space: nowrap;
    border: 1px solid transparent;
    cursor: pointer;
    user-select: none;
    & > * {
        pointer-events: none;
    }
    &:active {
        opacity: 0.85;
    }
    &:hover{
        color: var(--mainColor);
    }
    &.primary {
        color: #ffffff;
        border-color: var(--mainColor);
        background-color: var(--mainColor);
        &.plain {
            color: var(--mainColor);
            &:hover{
                color: var(--mainColor);
            }
        }
        &:hover{
            border-color: var(--mainHoverColor);
            background-color: var(--mainHoverColor);
        }
    }
    &.plain {
        color: #ffffff;
        border-color: #ffffff;
        background-color: transparent;
    }
    &.disabled{
        opacity: .6;
        cursor: no-drop !important;
        &:hover{
            color: var(--titleTextColor);
        }
    }
}
</style>