<template>
    <div class="text-family">
        <div class="text-select Soft-UI concave" @click="textFamilyToggle(!textFamilyOpen)">
            <span>{{ textFamily }}</span>
            <!-- <input type="text" readonly :value="" @focus="focus" @blur="blur" /> -->
            <base-button class="toggle-btn" :height="26" :round="true">
                <base-icon
                    class="iconfangxiangjiantou"
                    :class="{ open: textFamilyOpen }"
                ></base-icon>
            </base-button>
        </div>
        <div v-if="textFamilyOpen">
            <div
                class="option-backdrop"
                @click="textFamilyToggle(false)"
                @mousewheel="textFamilyOpen = false"
            ></div>
            <div class="text-family" ref="textFamily">
                <div class="family-lang">
                    <button
                        v-for="(item, index) in textFamilyList"
                        :key="index"
                        @click.stop="selectFamilyLang(index)"
                        :class="{ checked: selectFamilyListIndex === index }"
                    >
                        {{ item.lang }}
                    </button>
                </div>
                <div class="family-list" @click="textFamilyToggle(false)">
                    <ul class="text-family-list">
                        <li
                            v-for="item in filterFamilyList"
                            :key="item.name"
                            v-show="item.show"
                            v-html="item.content"
                            @click="selectFamily(item)"
                            :class="{
                                'checked iconfont iconzhengquedagou': item.name === textFamily && !item.childrenList,
                                'haschild': item.childrenList,
                            }"
                            @mouseenter="toggleFontChild($event, item)"
                            @mouseleave="toggleFontChild($event, item)"
                        ></li>
                    </ul>
                    <ul class="font-family-childrenList"
                        v-show="familyChildrenListShow"
                        @mouseenter="toggleFontfamilyChildListShow($event)"
                        @mouseleave="toggleFontfamilyChildListShow($event)">
                        <li v-for="(item, index) in fontFamilyChildrenList"
                            :key="index"
                            :class="{ 'checked': item.name === textFamily }"
                            @click="selectFamily(item)"
                        >
                            {{ item.alias }}
                        </li>
                    </ul>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import fontFamilyList from '@/assets/js/font/fontFamily.js';

export default {
    name: 'TextFamily',
    props: {
        textFamily: {
            type: String,
            default: ''
        }
    },
    data() {
        return {
            textFamilyList: fontFamilyList.family,                      // 字体列表 - 所有的(中英文)
            textFamilyOpen: false,                                      // 是否打开字体选择面板
            selectFamilyListIndex: 0,                                   // 筛选显示列表的下标
            filterFamilyList: fontFamilyList.family[0].item[0].item,    // 筛选显示的font-family列表
            familyChildrenListShow: false,                              // 控制字体子列表的显示
            fontFamilyChildrenList: [],                                 // 字体子列表
            fontFamilyChildrenListTimer: null,                          // 控制字体子列表显示或隐藏定时器
        }
    },
    methods: {
        // 选择文本字体语言
        selectFamilyLang(index) {
            let that = this;
            if (index === that.selectFamilyListIndex) return;
            that.selectFamilyListIndex = index;
            that.filterFamilyList = that.textFamilyList[index].item[0].item;
        },

        // 字体选择面板打开或关闭
        textFamilyToggle(value) {
            this.textFamilyOpen = value;
            if (value) {
                // 定位到选中位置
                this.$nextTick(() => {
                    let familyList = document.querySelector('.text-family-list ul');
                    let checkItem = document.querySelector('.text-family-list ul .checked');
                    if (checkItem) familyList.scrollTop = checkItem.offsetTop - 100;

                    // 让下拉列表全部显示出来
                    /* let scrollbar = document.querySelector('.right-wrap.hide-scrollbar');
                    if (scrollbar) {
                        let elementTop = $('.text-family').offset().top;
                        if (elementTop > window.innerHeight / 2) {
                            scrollbar.scrollTop = scrollbar.scrollTop + elementTop - 100;
                        }
                    } */
                    let scrollbar = $(document.querySelector('.text-family')).parents(`.hide-scrollbar`)[0];                         // 滚动条
                    let optionList = document.querySelector('.family-list');                                    // 下拉列表
                    let family = document.querySelector('.text-family');                                    // 下拉列表
                    let optionListBottom = document.body.offsetHeight - family.offsetTop - family.offsetHeight;                   // 下拉列表底部和页面底部之间的距离
                    let optionListHeight = util.fix(optionList.style.height) || optionList.offsetHeight;        // 下拉列表的高度
                    console.log(optionListBottom);
                    if (optionListBottom < optionListHeight) {
                        if (scrollbar) {
                            scrollbar.scrollTop = scrollbar.scrollTop + (optionListHeight - optionListBottom);
                        }
                        /* let newSelect = $(this.$refs.select)[0].getBoundingClientRect();
                        optionList.style.top = `${newSelect.bottom + 4}px`;
                        optionList.style.maxHeight = `${window.innerHeight - (newSelect.top + 4)}px`; */
                    }
                });
            };
        },

        // 选择字体
        selectFamily(item) {
            this.$emit('selectFamily', item.value);
            this.familyChildrenListShow = false;
        },

        toggleFontChild(event, item) {
            let that = this;
            // 当前字体没有子列表时return
            if (!item.childrenList) return;
            // 移入时获取当前字体的子列表，显示子列表并修改列表视图定位
            if(event.type === 'mouseenter') {
                clearTimeout(that.fontFamilyChildrenListTimer);
                that.fontFamilyChildrenList = item.childrenList;
                let winWidth = window.innerWidth;
                let $fontFamilyChild = $('.font-family-childrenList');
                let fontFamilyChildWidth = $fontFamilyChild.innerWidth();
                let offset = $(event.target).offset();
                let left = offset.left + event.target.clientWidth;
                if(left + fontFamilyChildWidth > winWidth){
                    left = offset.left - fontFamilyChildWidth;
                }
                $fontFamilyChild.css({
                    'top': `${offset.top}px`,
                    'left': `${left}px`,
                });
                that.familyChildrenListShow = true;
            } else {
                // 移出时隐藏子列表
                that.fontFamilyChildrenListTimer = setTimeout(() => {
                    that.familyChildrenListShow = false;
                }, 16);
            }
        },

        toggleFontfamilyChildListShow(event) {
            if (event.type === 'mouseenter') {
                clearTimeout(this.fontFamilyChildrenListTimer);
            } else {
                this.fontFamilyChildrenListTimer = setTimeout(() => {
                    this.familyChildrenListShow = false;
                }, 16);
            }
        }
    }
};
</script>

<style lang="less">
.text-family {
    position: relative;
    display: inline-block;
    .text-select {
        width: 176px;
        height: 32px;
        line-height: 32px;
        border-radius: 16px;
        padding: 0px 16px;
        user-select: none;
        cursor: pointer;
        input {
            display: block;
            width: calc(100% - 16px);
            height: 100%;
            padding: 0;
            margin: 0;
            border: none;
            background: none;
            color: var(--textColor);
            cursor: inherit;
        }
        .toggle-btn {
            position: absolute;
            top: 2px;
            right: 2px;
            width: 26px;
            padding: 0 !important;
            background-color: var(--upperColor);
            .base-icon {
                display: inline-block;
                &.open {
                    transform: rotate(180deg) translateY(1px);
                }
            }
        }
    }
    .option-backdrop {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background-color: transparent;
    }
    .text-family {
        position: absolute;
        top: 37px;
        left: 0;
        width: 100%;
        background-color: var(--upperColor);
        border-radius: 5px;
        box-shadow: 0px 5px 30px 0px rgba(191, 199, 204, 0.8);
        z-index: 3;
        .family-lang {
            display: flex;
            width: 176px;
            height: 40px;
            color: var(--textColor);
            button {
                border: none;
                width: 50%;
                height: 40px;
                background-color: var(--backColor);
                cursor: pointer;
                &:first-child {
                    border-radius: 5px 0 0 0;
                }
                &:last-child {
                    border-radius: 0 5px 0 0;
                }
            }
            .checked {
                background-color: var(--upperColor);
            }
        }
        .family-list {
            .text-family-list {
                width: 100%;
                max-height: 480px;
                overflow-y: auto;
                li {
                    position: relative;
                    display: block;
                    height: 32px;
                    line-height: 32px;
                    padding: 0 20px;
                    color: var(--textColor);
                    cursor: pointer;
                    &.checked {
                        cursor: default;
                        color: var(--mainColor);
                    }
                    &.iconfont {
                        font-size: inherit;
                        &::before {
                            position: absolute;
                            right: 5px;
                            width: 20px;
                            font-size: 20px;
                            font-weight: bold;
                        }
                    }
                    &.haschild {
                        &::after {
                            content: "";
                            position: absolute;
                            right: 6px;
                            top: 12px;
                            width: 0;
                            height: 0;
                            margin: 0 auto;
                            border-width: 6px;
                            border-style: solid;
                            border-color: #202735 transparent transparent transparent;
                            transition: all 0.3s;
                            transform: rotate(-90deg);
                            cursor: pointer;
                        }
                    }
                }
            }
            .font-family-childrenList {
                position:fixed;
                width: 90px;
                height: auto;
                padding: 5px 0;
                background-color: #ffffff;
                box-shadow: 0px 6px 8px 0px rgba(80, 85, 94, 0.2);
                border-radius: 4px;
                li {
                    line-height: 30px;
                    padding-left: 15px;
                    color: #202124;
                    font-size: 10px;
                    overflow: hidden;
                    white-space: nowrap;
                    text-overflow: ellipsis;  
                    cursor: pointer;  
                    &.checked {
                        background-color: #f4f4f4;
                    }
                    &:hover {
                        background-color: var(--upperColor);
                    }
                }
            }
        }
    }
}
</style>