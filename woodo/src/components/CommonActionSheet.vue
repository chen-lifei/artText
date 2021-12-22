<template>
    <div class="action-sheet" :class="sheetClass" v-if="show">
        <transition name="modal-fade">
            <div class="action-sheet-backdrop" @click="close" v-show="show_backdrop"></div>
        </transition>
        <div class="action-sheet-container" :class="{'show': show_container}">
            <slot name="header"></slot>
            <div class="action-sheet-list" v-for="(item, index) in value" :key="index" @click="tap(item)" :class="item.class">
                <div class="list-before" v-if="item.before" v-html="item.before"></div>
                <img class="icon" v-if="item.icon" :src="item.icon" alt=""/>
                <span class="text">{{ item.text }}</span>
                <div class="list-after" v-if="item.after" v-html="item.after"></div>
            </div>
            <div class="action-sheet-cancel" v-if="showCancel" @click="close">取消</div>
            <slot name="footer"></slot>
        </div>
    </div>
</template>

<script>
/**
 * 组件配置例
 * <ActionSheet ref="ActionSheet"
        :value="value"
        :showCancel=""
        :sheetClass=""
        @onOpen=""
        @onClose=""
    >
        <template slot="header">header</template>
        <template slot="footer">footer</template>
    </ActionSheet>
    import ActionSheet from '@/components/CommonActionSheet.vue';
    this.$refs.ActionSheet.open();

    props
    value   数组对象结构
    {
        icon,           ActionSheet 列表图标
        text,           ActionSheet 列表名称
        class,          ActionSheet 列表class
        before,         ActionSheet 列表名称前插入内容
        after,          ActionSheet 列表名称后插入内容
        onClick(),      回调可通过 return false 阻止自动关闭ActionSheet
    }
    showCancel      是否显示取消按钮
    sheetClass      自定义class
 */
export default {
    name: 'ActionSheet',
    props: {
        value: {
            type: Array,
            default() {
                return [];
            }
        },
        showCancel: {
            type: Boolean,
            default: true,
        },
        sheetClass: String,
    },
    data() {
        return {
            show: false,
            show_backdrop: false,
            show_container: false,
        }
    },
    methods: {
        open() {
            if (this.show) {
                return;
            }
            this.show = true;
            setTimeout(() => {
                this.show_backdrop = true;
                this.show_container = true;
                this.$emit('onOpen', this);
            }, 32);
        },
        close() {
            if (!this.show) {
                return;
            }
            this.show_container = false;
            this.show_backdrop = false;
            setTimeout(() => {
                this.show = false;
                this.$emit('update:OpenState', this.show);
                this.$emit('onClose', this);
            }, 300);
        },
        tap(item) {
            if (!this.show) {
                return;
            }
            if (item && typeof item.onClick === 'function') {
                let fn = item.onClick();
                if (typeof fn === 'boolean' && !fn) {
                    return;
                }
                this.close();
            }
        },
    },
}
</script>

<style lang="less">
.action-sheet {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 1011;
    .action-sheet-backdrop {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background-color: rgba(0, 0, 0, 0.7);
    }
    .action-sheet-container {
        position: absolute;
        left: 0;
        right: 0;
        bottom: 0;
        height: auto;
        background-color: #ffffff;
        transform: translateY(100%);
        transition: transform 0.3s;
        &.show {
            transform: translateY(0);
        }
    }
    .action-sheet-list {
        display: block;
        position: relative;
        width: 100%;
        height: 2.4rem;
        line-height: 2.4rem;
        text-align: center;
        font-size: 0.7rem;
        color: #2d2d2d;
        &:active::before {
            content: "";
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            z-index: 1;
            background-color: #000000;
            opacity: 0.1;
        }
        span.text {
            display: inline-block;
            vertical-align: middle;
            height: 100%;
        }
        img.icon {
            display: inline-block;
            vertical-align: middle;
            width: auto;
            height: 1.5em;
            margin-right: 0.25rem;
        }
        .list-before,
        .list-after {
            display: inline-block;
            vertical-align: middle;
        }
    }
    .action-sheet-cancel {
        display: block;
        width: 100%;
        height: 2.4rem;
        line-height: 2.4rem;
        text-align: center;
        font-size: 0.75rem;
        color: #444444;
        &:active::before {
            content: "";
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            z-index: 1;
            background-color: #000000;
            opacity: 0.1;
        }
    }
}
</style>