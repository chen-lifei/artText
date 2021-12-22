<template>
    <div class="template-search">
        <div class="search-group">
            <!-- 搜索按钮 -->
            <button class="search-btn" @click="search()">
                <base-icon class="iconsousuo"></base-icon>
            </button>
            <!-- 搜索框 -->
            <input maxlength="200" :placeholder="placeholder" v-model="keyword" @focus="focus($event)" @blur="is_focus = false" @keyup.enter="search()" />
            <!-- 清空 -->
            <button class="clear-btn" data-tooltip="清空搜索" v-show="keyword" @click="clearKeyword()">
                <base-icon class="iconchacha"></base-icon>
            </button>
        </div>

        <!-- 搜索框无输入且聚焦时显示的面板  但是鼠标悬浮在面板上时搜索框没有聚焦也不会消失 -->
        <div class="search-panel" v-show="!keyword && (is_focus || is_mouseenter)" @mouseenter="is_mouseenter = true" @mouseleave="is_mouseenter = false">
            <div class="lately" v-if="lately_list&&lately_list.length">
                <div class="title">最近搜寻</div>
                <div class="list">
                    <ul>
                        <li v-for="(v, i) in lately_list" :key="v" @click="inputListKeyword(v)">
                            {{ v }}
                            <base-icon class="iconchacha" @click.stop="delLatelyItem(i)"></base-icon>
                        </li>
                    </ul>
                </div>
            </div>
            <div class="hot">
                <div class="title">热门搜索</div>
                <div class="list">
                    <ul>
                        <li v-for="(v, i) in recommendList" :key="v" @click.stop="inputListKeyword(v)">
                            <div class="num">{{ i+1 }}</div>
                            <span>{{ v }}</span>
                        </li>
                    </ul>
                </div>
            </div>
        </div>
        <!-- 关键字匹配列表 -->
        <ul class="keyword-list" v-show="keyword &&  (is_focus || is_mouseenter)" @click="is_mouseenter = false" @mouseenter="is_mouseenter = true" @mouseleave="is_mouseenter = false">
            <li v-for="(v, i) in keyword_list" :key="v" @click="inputListKeyword(keywordList[i])" v-html="v"></li>
        </ul>
    </div>
</template>

<script>
export default {
    model: {
        prop: 'keyword',
        event: 'input'
    },
    props: {
        // 关键词列表
        keywordList: {
            type: Array,
            default: () => []
        },
        // 热门搜索列表
        recommendList: {
            type: Array,
            default: () => []
        },
        // 本地缓存枚举名
        saveKey: {
            type: String,
            default: ''
        }
    },
    data() {
        return {
            keyword: '',
            debounce: null,  // 高频操作节流防抖
            lately_list: [], // 最近搜索列表
            is_focus: false, // 搜索框是否聚焦
            is_mouseenter: false // 鼠标是否悬浮在上方
        };
    },
    computed: {
        placeholder() {
            return this.is_focus ? '' : '想要找什么模板？';
        },
        // 匹配搜索词列表
        keyword_list() {
            // 关键词主题色高亮
            return this.keywordList.map(v => v.replace(this.keyword, `<font color="#005fff">${this.keyword}</font>`));
        }
    },
    watch: {
        // 更新最近搜索
        lately_list: {
            handler(newVal) {
                if (!this.saveKey) return;
                localStorage.setItem(this.saveKey, JSON.stringify(newVal));
            },
            deep: true
        },
        keyword(n){
            this.$emit('change', n);
            clearTimeout(this.debounce)
            this.debounce = setTimeout(() => {
                this.$emit('associate', n);
            }, 300);
        },
    },
    mounted() {
        this.lately_list = (localStorage.getItem(this.saveKey) && JSON.parse(localStorage.getItem(this.saveKey))) || [];
    },
    methods: {
        // 搜索
        search(val) {
            val = val || this.keyword;
            this.$emit('search', val);
            if (!this.keyword) return false;
            this.updateLatelyItem(this.keyword)
        },
        // 更新最近搜索
        updateLatelyItem(val) {
            this.lately_list = this.lately_list.filter(v => v !== val);  // 如果最近搜索已经有这个词了，那就把这个词放到最前面
            this.lately_list.unshift(val);
            if (this.lately_list.length > 6) this.lately_list.length = 6; // 固定数组长度不超过6个
        },
        // 删除单个最近搜索
        delLatelyItem(i) {
            this.lately_list.splice(i, 1);
        },
        // 删除全部最近搜索
        delLatelyAll() {
            this.lately_list = [];
        },
        // 点击列表关键字
        inputListKeyword(val) {
            this.keyword = val;
            this.updateLatelyItem(val);
            this.search(val);
        },
        // 清空关键字
        clearKeyword() {
            this.keyword = ``;
            this.search('');
        },
        focus() {
            this.is_focus = true;
            this.$emit('focus');
        },
        setValue(val) {
            this.keyword = val;
        }
    }
};
</script>

<style lang="less" scoped>
.template-search {
    position: relative;
    width: 540px;
    height: 52px;
    background: #fff;
    border-radius: 4px;
    // 搜索模块
    .search-group {
        position: relative;
        display: flex;
        align-content: center;
        width: 100%;
        height: 100%;
        // 搜索按钮
        .search-btn {
            display: flex;
            justify-content: center;
            align-items: center;
            width: 60px;
            height: 100%;
            .base-icon {
                font-size: 24px;
                color: #999999;
            }
        }
        // 输入框
        input {
            padding-right: 50px;
            flex: 1;
            display: flex;
            align-content: center;
            vertical-align: middle;
            font-size: 14px;
            color: #333333;
            &::-webkit-input-placeholder {
                color: #9ba5b1;
            }
        }
        // 清空按钮
        .clear-btn {
            position: absolute;
            top: 50%;
            right: 20px;
            transform: translateY(-50%);
            display: flex;
            justify-content: center;
            align-items: center;
            width: 24px;
            height: 24px;
            font-size: 22px;
            background: #d2d2d8;
            border-radius: 50%;

            .base-icon {
                font-size: 14px;
                color: #000000;
            }
        }
    }

    // 面板
    .search-panel {
        position: absolute;
        top: calc(100% + 1px);
        left: 0;
        z-index: 5;
        padding: 0 30px;
        width: 100%;
        background: #ffffff;
        border: 1px solid #e5e5e5;
        border-radius: 4px;
        .lately {
            padding: 30px 0;
            border-bottom: 1px solid #e5e5e5;

            .title {
                color: #999999;
                font-size: 14px;
            }

            .list {
                ul {
                    li {
                        display: inline-block;
                        position: relative;
                        padding: 8px 20px;
                        margin-top: 10px;
                        margin-right: 10px;
                        font-size: 12px;
                        color: #333333;
                        border-radius: 16px;
                        background: #f6f6f9;
                        cursor: pointer;
                        .base-icon {
                            display: none;
                            position: absolute;
                            top: 50%;
                            right: 0;
                            transform: translate(50%, -50%);
                            width: 16px;
                            height: 16px;
                            line-height: 16px;
                            font-size: 8px;
                            text-align: center;
                            background: #d2d2d8;
                            border-radius: 50%;
                        }
                        &:hover {
                            .base-icon {
                                display: block;
                            }
                        }
                    }
                }
            }
        }

        .hot {
            padding: 30px 0;
            .title {
                color: #999999;
                font-size: 14px;
            }

            .list {
                ul {
                    display: flex;
                    flex-wrap: wrap;
                    li {
                        margin-top: 20px;
                        display: flex;
                        align-items: center;
                        width: 33.33%;
                        cursor: pointer;
                        .num {
                            display: inline-block;
                            min-width: 24px;
                            height: 24px;
                            line-height: 24px;
                            text-align: center;
                            font-size: 12px;
                            background: #d2d2d8;
                            border-radius: 50%;
                            color: #ffffff;
                        }
                        span {
                            margin-left: 10px;
                            font-size: 12px;
                            color: #333333;
                            overflow: hidden;
                            text-overflow: ellipsis;
                            white-space: nowrap;
                        }
                        &:nth-of-type(1) {
                            .num {
                                background: #de5858;
                            }
                        }
                        &:nth-of-type(2) {
                            .num {
                                background: #e77d3f;
                            }
                        }
                        &:nth-of-type(3) {
                            .num {
                                background: #e7c53f;
                            }
                        }
                    }
                }
            }
        }
    }

    // 关键字列表
    .keyword-list {
        position: absolute;
        top: calc(100% + 1px);
        left: 0;
        z-index: 3;
        width: 100%;
        background: #ffffff;
        border-radius: 4px;
        box-shadow: 0px 0px 2px 0px #d2d2d8;
        li {
            padding-left: 47px;
            width: 100%;
            height: 40px;
            line-height: 40px;
            font-size: 14px;
            cursor: pointer;
            &:hover {
                background: #edeff3;
            }
        }
    }
}
</style>