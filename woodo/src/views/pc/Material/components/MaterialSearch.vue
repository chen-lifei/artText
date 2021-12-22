<template>
    <div class="design-search">
        <div class="search-editor">
            <div class="search-group">
                <!-- 搜索按钮 -->
                <button class="search-btn" v-tooltip.bottom="`搜索`" @click="search()">
                    <base-icon class="iconsousuo"></base-icon>
                </button>
                <!-- 搜索框 -->
                <input maxlength="200" ref="searchInput" :placeholder="placeholder" v-model="keyword" @focus="focus($event)" @keyup.enter="search()" />
                <!-- 清空 -->
                <button class="clear-btn flex" v-tooltip="`清空搜索`" v-show="keyword" @click="clearKeyword()">
                    <base-icon class="iconguanbi1" size="12"></base-icon>
                </button>
            </div>
            <!-- 搜索框无输入且聚焦时显示的面板  但是鼠标悬浮在面板上时搜索框没有聚焦也不会消失 -->
            <div class="search-panel floating-layer" v-show="(isFocus || isMouseenter) && (associateList.length || recommendList.length || latelyList.length)" @mouseenter="isMouseenter = true" @mouseleave="isMouseenter = false">
                <!-- 关键字匹配列表 -->
                <div class="keyword-item" v-if="associateList.length">
                    <ul class="list">
                        <li v-for="(v, index) in associateList" :key="index" @click.stop="inputListKeyword(v.name)" v-html="highlight(v.name)"></li>
                    </ul>
                </div>
                <!-- 最近搜索 -->
                <div class="lately-item split-line" v-if="latelyList.length">
                    <div class="title">最近搜索</div>
                    <ul class="list">
                        <li v-for="(v, i) in latelyList" :key="v" @click.stop="inputListKeyword(v)">
                            <span>{{ v }}</span>
                            <base-icon class="iconguanbi1" size="12" @click.stop="delLatelyItem(i)"></base-icon>
                        </li>
                    </ul>
                </div>
                <!-- 热门 -->
                <div class="hot-item split-line" v-if="recommendList.length">
                    <div class="title">热门标签</div>
                    <ul class="list">
                        <li v-for="(v, i) in recommendList" :key="v" @click.stop="inputListKeyword(v)">
                            <div class="num">{{ i + 1 }}</div>
                            <span>{{ v }}</span>
                        </li>
                    </ul>
                </div>
            </div>
        </div>
        <!-- 搜索筛选 -->
        <div class="search-screening" v-if="code === 'design'">
            <div class="screening-options flex flex-evenly">
                <p v-for="(s, index) in screeningList" :key="index" :class="{check: currentCode === s.key}" @click="currentCode = s.key">{{ s.name }}</p>
            </div>
        </div>
        <!-- 搜索排序 -->
        <div class="search-sort" v-else  @click="showSortList = !showSortList">
            <div class="current-sort" :class="{open: showSortList}">按{{ currentSort.name }}排序<base-icon class="iconfangxiangjiantou"></base-icon></div>
            <ul class="sort-list" v-if="showSortList">
                <li v-for="(s, index) in sortList" :key="index" :class="{check: currentSort.key === s.key}" @click="changeSort(s)">按{{ s.name }}</li>
            </ul>
        </div>
    </div>
</template>

<script>
const saveKey = 'procut_search';
export default {
    props: {
        code: String,
    },
    data() {
        return {
            currentCode: '',      // 当前搜索分类
            keyword: '',          // 搜索关键词
            debounce: null,       // 高频操作节流防抖
            stopWatching: false,  // 停止监听
            isFocus: false,       // 搜索框是否聚焦
            isMouseenter: false,  // 鼠标是否悬浮在上方
            associateList: [],    // 关键词联想列表
            latelyList: [],       // 最近搜索列表
            recommendList: [],    // 推荐标签列表
            screeningList: [
                {key: 'muban', name: '模板'},
                {key: 'shipin', name: '视频'},
                {key: 'yinpin', name: '音频'},
                {key: 'TuPian1', name: '图片'},
                {key: 'sucaiku', name: '图形'},
            ],
            sortList: [
                {key: 'common', name: '综合'},
                {key: 'hotDownload', name: '热门'},
                {key: 'newUpload', name: '新的'},
                // {key: 'vip', name: '会员'},
            ],
            currentSort: null,
            showSortList: false,
        };
    },
    computed: {
        placeholder() {
            return this.isFocus ? '' : '请输入搜索的关键词';
        },
        highlight() {
            return value => {
                return value.replace(this.keyword, `<font color="#00BCBA">${this.keyword}</font>`);
            }
        }
    },
    watch: {
        code(n) {
            this.getCurrentCategory();
        },
        // 更新最近搜索
        latelyList: {
            handler(newVal) {
                localStorage.setItem(saveKey, JSON.stringify(newVal));
            },
            deep: true
        },
        keyword(n){
            if (this.stopWatching) {
                this.stopWatching = false;
                return;
            }
            clearTimeout(this.debounce);
            if (!n) {
                this.associateList = [];
            }
            this.debounce = setTimeout(() => {
                this.getAssociateList();
            }, 300);
        },
    },
    created() {
        this.getCurrentCategory();
        this.latelyList = (localStorage.getItem(saveKey) && JSON.parse(localStorage.getItem(saveKey))) || [];
        this.currentSort = this.sortList[0];
    },
    methods: {
        clear(keyword) {
            this.setValue(keyword, false);
            this.showSortList = false;
            this.currentSort = this.sortList[0];
        },
        getCurrentCategory() {
            if (this.code === 'design') {
                this.currentCode = 'muban';
            } else {
                this.currentCode = this.code;
            }
        },
        // 搜索
        search(val) {
            val = val || this.keyword;
            this.$refs.searchInput.blur();
            this.isFocus = false;
            this.isMouseenter = false;
            this.$emit('search', {value: val, sort: this.currentSort, type: this.commonMixinGetDesignSign(this.currentCode).key});
            if (!this.keyword) return;
            this.updateLatelyItem(this.keyword)
        },
        // 获取关键词联想列表
        getAssociateList() {
            if (!this.keyword) {
                return;
            }
            if (this.currentCode === 'muban') {
                this.$api.TEMPLATE_ASSOCIATED_WORD({data: { word: this.keyword }}).then(res => {
                    this.associateList = res.data;
                })
            } else {
                this.$api.MATERIAL_ASSOCIATED_WORD({data: { categoryCode: this.currentCode, word: this.keyword }}).then(res => {
                    this.associateList = res.data;
                })
            }
        },
        // 更新最近搜索
        updateLatelyItem(val) {
            this.latelyList = this.latelyList.filter(v => v !== val);  // 如果最近搜索已经有这个词了，那就把这个词放到最前面
            this.latelyList.unshift(val);
            if (this.latelyList.length > 6) this.latelyList.length = 6; // 固定数组长度不超过6个
        },
        // 删除单个最近搜索
        delLatelyItem(i) {
            this.latelyList.splice(i, 1);
        },
        // 点击列表关键字
        inputListKeyword(val) {
            this.keyword = val;
            this.search(val);
        },
        // 清空关键字
        clearKeyword() {
            this.keyword = ``;
            this.associateList = [];
            this.search('');
        },
        focus() {
            this.isFocus = true;
            this.$emit('focus');
        },
        setValue(val, update = true) {
            this.keyword = val;
            this.stopWatching = !update;
        },
        changeSort(val) {
            this.currentSort = val;
            this.search();
        }
    }
};
</script>

<style lang="less" scoped>
.search-editor {
    position: relative;
    display: inline-block;
    vertical-align: middle;
    width: 490px;
    height: 48px;
    background: rgba(255,255,255,0.20);
    border-radius: 10px;
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
            width: 50px;
            height: 100%;
            margin-right: 4px;
            border: none;
            background: transparent;
            cursor: pointer;
            .base-icon {
                font-size: 20px;
                color: #ffffff;
            }
        }
        // 输入框
        input {
            padding-right: 50px;
            display: flex;
            flex: 1;
            align-content: center;
            vertical-align: middle;
            border: none;
            background: transparent;
            font-size: 12px;
            color: #ffffff;
            &::-webkit-input-placeholder{
                color: #ffffff;
            }
        }
        // 清空按钮
        .clear-btn {
            position: absolute;
            top: 50%;
            right: 20px;
            transform: translateY(-50%);
            width: 18px;
            height: 18px;
            border: none;
            background: rgba(255, 255, 255, .8);
            border-radius: 50%;
            .base-icon {
                color: #5f6063;
            }
        }
    }
    // 面板
    .search-panel {
        position: absolute;
        left: 0;
        top: calc(100% + 2px);
        z-index: 5;
        width: 100%;
        border-radius: 5px;
        text-align: left;
        overflow: hidden;
        & > div {
            padding: 20px 0;
            color: #242529;
            font-size: 12px;
            li {
                cursor: pointer;
            }
        }
        .keyword-item {
            padding-top: 10px;
            li {
                height: 30px;
                line-height: 30px;
                padding: 0 30px;
                font-size: 14px;
                &:hover {
                    background-color: #e3e6ec;
                }
            }
        }
        .lately-item {
            padding-left: 30px;
            padding-right: 30px;
            li {
                position: relative;
                display: inline-block;
                vertical-align: top;
                width: auto;
                height: 28px;
                line-height: 28px;
                padding: 0 20px;
                margin: 10px 10px 0 0;
                background: #dcdce5;
                border-radius: 14px;
                &:hover {
                    background: #d0d0db;
                    .base-icon {
                        display: block;
                    }
                }
            }
            .base-icon {
                display: none;
                position: absolute;
                top: 0;
                right: -2px;
                width: 12px;
                height: 12px;
                line-height: 9px;
                border: 1px solid #3e3f42;
                border-radius: 12px;
                text-align: center;
                &::before {
                    transform: scale(.7);
                }
            }
        }
        .hot-item {
            padding-left: 30px;
            padding-right: 30px;
            li {
                display: inline-block;
                vertical-align: top;
                width: auto;
                height: 32px;
                line-height: 32px;
                padding: 0 12px;
                margin: 10px 10px 0 0;
                background: #dcdce5;
                border-radius: 14px;
                text-align: center;
                &:hover {
                    background: #d0d0db;
                }
            }
        }
    }
}
.search-screening {
    display: inline-block;
    vertical-align: middle;
    margin-left: 10px;
    .screening-options {
        width: 288px;
        height: 48px;
        line-height: 48px;
        border: 1px solid #ffffff;
        border-radius: 10px;
        color: #ffffff;
        & > p {
            position: relative;
            width: 25%;
            height: calc(100% + 2px);
            border-radius: 10px;
            font-weight: 600;
            font-size: 12px;
            text-align: center;
            cursor: pointer;
            &:first-of-type {
                left: -1px;
            }
            &.check {
                background: #ffffff;
                color: #da6cb8;
            }
        }
    }
}
.search-sort {
    position: relative;
    display: inline-block;
    vertical-align: middle;
    margin-left: 20px;
    text-align: left;
    .current-sort {
        width: 120px;
        height: 44px;
        line-height: 40px;
        padding-left: 20px;
        background: rgba(255,255,255,0.1);
        border: 1px solid rgba(255,255,255,0.5);
        border-radius: 10px;
        color: #ffffff;
        font-size: 12px;
        cursor: pointer;
        &.open .base-icon {
            transform: scale(0.8) translateY(1px) rotate(180deg);
        }
        .base-icon {
            margin-left: 12px;
            transition: all .3s;
            transform: scale(0.8) translateY(1px);
        }
    }
    .sort-list {
        position: absolute;
        top: 50px;
        left: 0;
        width: 100%;
        padding: 8px 0;
        background: #ffffff;
        border: 1px solid #c9cacb;
        border-radius: 5px;
        box-shadow: 0 2px 10px 0 rgba(201,202,203,0.51);
        z-index: 12;
        li {
            padding-left: 20px;
            width: 100%;
            height: 40px;
            line-height: 40px;
            color: #5f6063;
            font-size: 12px;
            cursor: pointer;
            &.check {
                color: var(--mainColor);
            }
            &:hover {
                background-color: #fafafa;
            }
        }
    }
}
</style>