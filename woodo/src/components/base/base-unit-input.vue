<template>
    <div class="unit-input" :class="{'disabled': disabled}" @mouseenter="mouseenter = true" @mouseleave="mouseenter = false">
        <div class="input">
            <input :type="inputType" :value="keyword" :disabled="disabled" :maxlength="maxlength" @input="input($event)" @focus="$emit('focus', $event)" @keydown="$emit('keydown', $event)" @blur="$emit('blur', $event)">
        </div>
        <div class="unit" v-show="!mouseenter || disabled">{{unit}}</div>
        <div class="btn-group" v-show="mouseenter && !disabled">
            <div class="add-btn" @click="$emit('add')"></div>
            <div class="cut-btn" @click="$emit('cut')"></div>
        </div>
    </div>
</template>

<script>
export default {
    model: {
        prop: 'keyword',
        event: 'input'
    },
    props: {
        // 输入框内容
        keyword: {
            type: [String, Number],
            default: ''
        },
        // 输入框类型
        inputType: {
            type: String,
            default: 'number'
        },
        // 输入长度
        maxlength: {
            type: [String, Number],
            default: '3'
        },
        // 单位
        unit: {
            type: String,
            default: ''
        },
        // 禁用状态
        disabled: {
            type: Boolean,
            default: false
        },
    },
    data() {
        return {
            // 鼠标是否移入
            mouseenter: false,
        }
    },
    methods: {
        input(e) {
            this.$emit('input', e.target.value);
        }
    }
}
</script>

<style lang="less" scoped>
.unit-input {
    display: flex;
    width: 100px;
    height: 32px;
    background: #ffffff;
    border: 1px solid #dddddd;
    border-radius: 6px;

    &.disabled{
        opacity: .6;
        cursor: no-drop;
        input,
        .btn-group,
        .btn-group .add-btn,
        .btn-group .cut-btn{
            cursor: no-drop;
        }
    }

    .input {
        flex: 1;
        input{
            padding-left: 10px;
            width: 100%;
            height: 100%;
            font-size: 12px;
            font-weight: 400;
            color: #111111;
        }
    }

    .unit {
        display: flex;
        justify-content: center;
        align-items: center;
        width: 30px;
        color: #666666;
    }

    .btn-group {
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        width: 30px;
        .add-btn,
        .cut-btn {
            display: flex;
            flex: 1;
            cursor: pointer;
            &::after {
                content: '';
                margin: auto;
                width: 0;
                height: 0;
                border-width: 4px;
                border-style: solid;
            }
        }
        .add-btn {
            &::after {
                margin: auto auto 2px auto;
                border-color: transparent transparent #999999 transparent;
            }
            &:hover::after {
                border-bottom-color: var(--mainColor);
            }
        }

        .cut-btn {
            &::after {
                margin: 2px auto auto auto;
                border-color: #999999 transparent transparent transparent;
            }
            &:hover::after {
                border-top-color: var(--mainColor);
            }
        }
    }
}
</style>