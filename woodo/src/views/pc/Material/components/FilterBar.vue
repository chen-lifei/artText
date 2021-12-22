<template>
    <div class="filter-bar-main" :class="{close: !isOpen}">
        <div class="bar-handle" v-if="showHandle" v-tooltip.right="`${isOpen ? '收起' : '展开'}`" @click="toggleBar()">
            <img v-if="pageTheme === `newlight`" src="@/assets/images/filter-bar-light.png" alt="" />
            <img v-else src="@/assets/images/filter-bar-dark.png" alt="" />
            <base-icon class="iconfangxiangjiantou"></base-icon>
        </div>
        <div class="filter-wrapper hide-scrollbar">
            <div class="title-box flex flex-between" v-if="type !== 'vectors'">
                <span>筛选</span>
                <base-icon class="iconclear" size="20" v-tooltip="`清空筛选`" :disabled="!hadFilter" @click="clear"></base-icon>
            </div>
            <!-- 分类 -->
            <div class="filter-box category-box" v-if="filterBarShow('category') && categoryList.length">
                <p class="title">分类:</p>
                <button class="pack" v-if="categoryCount !== 5" @click="categoryCount = 5">收起</button>
                <ul class="list">
                    <li v-for="(item, index) in categoryList"
                        v-show="(!countList || countList.category[item.code]) && (categoryCount === `all` || index < categoryCount)"
                        :key="item.id"
                        :class="{'check': currentFirstCategory.id === item.id}"
                        @click="chooseCategory(item)"
                    >
                        <div class="parent-item">
                            <div class="check-box">
                                <base-icon class="iconzhengquedagou" size="12"></base-icon>
                            </div>
                            <p>{{ item.name }}</p>
                            <span v-if="countList">「{{ utils.toThousands(countList.category[item.code]) }}」</span>
                        </div>
                        <ul @click.stop>
                            <li v-for="c_item in item.childrenList"
                                v-show="(!countList || countList.category[c_item.code]) && currentFirstCategory.id === item.id && type !== 'photo'"
                                :key="c_item.id"
                                :class="{'check': currentSecondCategory.id === c_item.id}"
                                @click="chooseCategory(c_item, item)"
                            >
                                    <div class="check-box">
                                        <base-icon class="iconzhengquedagou" size="12"></base-icon>
                                    </div>
                                    <p>{{ c_item.name }}</p>
                                <span v-if="countList">「{{ utils.toThousands(countList.category[c_item.code]) }}」</span>
                            </li>
                        </ul>
                    </li>
                </ul>
                <p class="more" v-if="categoryList.length > 5" @click="showMore('category')">{{ categoryCount === `all` ? '收起' : '更多...' }}</p>
            </div>
            <!-- 时长 -->
            <div class="filter-box duration-box" v-if="filterBarShow('duration')">
                <p class="title">按照时长:</p>
                <base-slider class="duration-slider"
                    entad
                    double
                    :progress="durationProgress"
                    :autofit="autofit"
                    @change="setDuration"
                    @stop="chooseDuration"
                ></base-slider>
                <p class="mark flex flex-between">
                    <span class="start">{{ duration.start }}</span>
                    <span class="end">{{ duration.end }}</span>
                </p>
            </div>
            <!-- 比例 -->
            <div class="filter-box ratio-box" v-if="filterBarShow('ratio')">
                <p class="title">按照比例:</p>
                <ul class="list">
                    <li v-for="(item, index) in ratioList"
                        v-show="!countList || countList.ratio[item.key]"
                        :key="index"
                        :class="{'check': item.check}"
                        @click="chooseRatio(item, index)"
                    >
                        <div class="check-box">
                            <base-icon class="iconzhengquedagou" size="12"></base-icon>
                        </div>
                        <div class="ratio-shape" v-if="item.ratio" :style="`width:${(item.ratio[0] * 20) / item.ratio[1]}px;`"></div>
                        <p>{{ item.name }}</p>
                        <span v-if="countList">「{{ utils.toThousands(countList.ratio[item.key]) || 0 }}」</span>
                    </li>
                </ul>
            </div>
            <!-- 分辨率 -->
            <div class="filter-box resolution-box" v-if="filterBarShow('resolution')">
                <p class="title">按照分辨率:</p>
                <ul class="list">
                    <li v-for="(item, index) in resolutionList"
                        :key="index"
                        v-show="!countList || !countList.resolution || countList.resolution[item.key]"
                        :class="{'check': item.check}"
                        @click="chooseResolution(item, index)"
                    >
                        <div class="check-box">
                            <base-icon class="iconzhengquedagou" size="12"></base-icon>
                        </div>
                        <p>{{ item.name }}</p>
                        <span v-if="countList">「{{ utils.toThousands(countList.resolution[item.key]) || 0 }}」</span>
                    </li>
                </ul>
            </div>
            <!-- 标签 -->
            <div class="filter-box tag-box" v-if="filterBarShow('tag') && tagList.length">
                <p class="title">按照标签:</p>
                <button class="pack" v-if="tagCount !== 5" @click="tagCount = 5">收起</button>
                <ul class="list">
                    <li v-for="(item, index) in tagList"
                        v-show="(countList && !countList.tag[item.name]) && (tagCount === `all` || index < tagCount)"
                        :key="index"
                        :class="{'check': item.check}"
                        @click="chooseTag(item, index)"
                    >
                        <div class="check-box">
                            <base-icon class="iconzhengquedagou" size="12"></base-icon>
                        </div>
                        <p>{{ item.name }}</p>
                        <span v-if="countList">「{{ utils.toThousands(countList.tag[item.name]) || 0 }}」</span>
                    </li>
                </ul>
                <p class="more" v-if="tagList.length > 5" @click="showMore('tag')">{{ tagCount === `all` ? '收起' : '更多...' }}</p>
            </div>
        </div>
    </div>
</template>
<script>
export default {
    props: {
        type: String,
        category: String,
        keyword: String,
        showHandle: {
            type: Boolean,
            default: true
        }
    },
    data() {
        return {
            util,
            isOpen: true,                // 是否展开
            timer: '',
            stopWatching: false,         // 停止监听
            filterOptions: {
                categoryCode: '',
                durationBegin: '',
                durationEnd: '',
                ratio: '',
                resolution: '',
                tags: '',
                searchValue: '',
            },                           // 筛选结果
            countList: null,             // 素材数量列表

            categoryList: [],            // 分类原始列表
            categoryCount: 5,            // 分类展示数量
            currentFirstCategory: {},    // 当前首级分类
            currentSecondCategory: {},   // 当前二级分类

            resolutionList: [
                {key: '1080P', name: '1080P(HD)'},
                {key: '2K', name: '2K'},
                {key: '4K', name: '4K'},
                {key: 'other', name: '其它'},
            ],                           // 分辨率列表
            ratioList: [
                {key: '16:9', name: '横板', ratio: [16, 9]},
                {key: '1:1', name: '正方形', ratio: [1, 1]},
                {key: '9:16', name: '竖版', ratio: [9, 16]},
                {key: 'other', name: '其它'},
            ],                           // 比例列表

            durationProgress: [0, 100],  // 筛选时长区间
            durationBegin: 0,            // 开始时长
            durationEnd: '',             // 结束时长

            tagList: [],                 // 标签列表
            tagCount: 5,                 // 标签展示数量
        }
    },
    created() {
        this.getCategory();
        if (!this.category) this.getCount();
    },
    computed: {
        filterBarShow() {
            return bar => {
                let filterConfig = {
                    "template":  ['category', 'duration', 'ratio', 'tag'],
                    "video": ['category', 'duration', 'ratio', 'resolution', 'tag'],
                    "audio": ['category', 'duration', 'tag'],
                    "photo": ['category', 'ratio', 'resolution', 'tag'],
                    "vectors": ['category', 'tag'],
                };
                return filterConfig[this.type].indexOf(bar) > -1;
            }
        },
        // 时长区间自动吸附点
        autofit() {
            return new Array(24).fill(1).map((item,index)=> {
                return (100 / 23) * index;
            });
        },
        // 时长区间展示
        duration() {
            let progress = this.durationProgress;
            let arr = new Array(24).fill(1).map((item,index)=> {
                if (index <= 12) return index * 5;
                if (index > 12 && index <= 16) return 60 + ((index - 12) * 30);
                if (index > 16) return (index - 13) * 60;
            });
            let startIndex = Math.round(progress[0] / (100 / 23));
            let endIndex = Math.round(progress[1] / (100 / 23));
            let start = arr[startIndex];
            let end = arr[endIndex];
            this.durationBegin = start * 1000;
            this.durationEnd = end === 600 ? '' : end * 1000;
            start = utils.timeStampTransform(start * 1000);
            end = utils.timeStampTransform(end * 1000);
            end = end == '10:00' ? '全部' : end;
            return {start, end};
        },
        // 是否有筛选项
        hadFilter() {
            return !utils.objectEqual(this.$options.data().filterOptions, this.filterOptions);
        }
    },
    watch: {
        type() {
            this.clear(false);
            this.getCategory();
        },
        filterOptions: {
            handler() {
                if (this.stopWatching) {
                    this.stopWatching = false;
                    this.getCount();
                    return;
                }
                if (this.timer) clearTimeout(this.timer);
                this.timer = setTimeout(() => {
                    this.getCount('');
                    let currentCategory = null;
                    if (this.currentSecondCategory.id) {
                        currentCategory = this.currentSecondCategory;
                    } else if (this.currentFirstCategory.id) {
                        currentCategory = this.currentFirstCategory;
                    }
                    this.$emit('filter', this.filterOptions, currentCategory);
                }, 300);
            },
            deep: true
        }
    },
    methods: {
        // 展开收起
        toggleBar() {
            this.isOpen = !this.isOpen;
            this.$emit('update:filterOpen', this.isOpen);
        },
        // 获取分类列表
        getCategory() {
            this.$api.CATEGORY_LIST({
                data: {
                    type: this.type === 'template' ? 'template' : 'material',
                    code: this.commonMixinGetDesignSign(this.type).code,
                    grade: 3
                }
            }).then(res => {
                this.categoryList = res.data;
                if (!this.category) return;
                switch (this.category) {
                    case 'first':
                        this.currentFirstCategory = this.categoryList[0];
                        this.filterOptions.categoryCode = this.currentFirstCategory.code;
                        break;
                    case 'second':
                        this.currentFirstCategory = this.categoryList[0];
                        this.currentSecondCategory = this.categoryList[0].childrenList[0];
                        this.filterOptions.categoryCode = this.currentSecondCategory.code;
                        break;
                    default:
                        this.currentFirstCategory = this.categoryList.find(i => i.code === this.category);
                        this.filterOptions.categoryCode = this.currentFirstCategory.code;
                        break;
                }
            }).catch(err => {
                return console.error("筛选组件-获取分类列表失败");
            })
        },
        // 获取标签列表
        getTag() {
            this.$api.TAG_LIST({
                data: {
                    categoryCode: this.commonMixinGetDesignSign(this.type).code,
                }
            }).then(res => {
                this.tagList = res.data.map(i => {return {'name': i}});
            })
        },
        // 获取数量
        getCount(keyword) {
            let option = utils.deepClone(this.filterOptions);
            option.categoryCode = option.categoryCode || this.commonMixinGetDesignSign(this.type).code;
            option.tag = option.tags;
            option.searchValue = keyword || keyword === '' ? keyword : this.keyword;
            delete option.tags;
            this.$api.FILTER_GROUP_COUNT({
                data: option
            }).then(res => {
                this.countList = res.data;
            })
        },
        // 清空筛选 update是否触发列表更新,用于只做清除请筛选,但不更新列表的场景
        clear(update = true) {
            let tag = this.tagList;
            let category = this.categoryList;
            Object.assign(this.$data, this.$options.data());
            this.stopWatching = !update;
            this.categoryList = category;
            this.tagList = tag;
        },
        // 选择分类
        chooseCategory(item, parent) {
            if (parent) {
                if (this.currentSecondCategory.id === item.id) {
                    this.currentSecondCategory = {};
                } else {
                    this.currentSecondCategory = item;
                }
            } else {
                this.currentSecondCategory = {};
                if (this.currentFirstCategory.id === item.id) {
                    this.currentFirstCategory = {};
                } else {
                    this.currentFirstCategory = item;
                }
            }
            if (this.currentSecondCategory && this.currentSecondCategory.code) {
                this.filterOptions.categoryCode = this.currentSecondCategory.code;
            } else if (this.currentFirstCategory) {
                this.filterOptions.categoryCode = this.currentFirstCategory.code;
            }
        },
        // 展开更多分类/标签
        showMore(key) {
            let count = this[`${key}Count`];
            if (count < 10 && count + 5 < this.categoryList.length) {
                count += 5;
            } else if (count === `all`) {
                count = 5;
            } else {
                count = 'all';
            }
            this[`${key}Count`] = count;
        },
        // 更改时长区间（停止前，不生效）
        setDuration(progress) {
            if (progress[0] === 100) progress[0] = 95.65;
            if (progress[1] === 0) progress[1] = 4.34;
            this.durationProgress = progress;
        },
        // 选择时长区间（已停止，生效）
        chooseDuration(progress) {
            this.filterOptions['durationBegin'] = this.durationBegin;
            this.filterOptions['durationEnd'] = this.durationEnd;
        },
        // 选择比例
        chooseRatio(item) {
            this.ratioList.forEach(i => {
                if (i.key === item.key) {
                    i.check = !item.check;
                } else {
                    i.check = false;
                }
            })
            this.filterOptions.ratio = item.check ? item.key : '';
        },
        // 选择分辨率
        chooseResolution(item) {
            this.resolutionList.forEach(i => {
                if (i.key === item.key) {
                    i.check = !item.check;
                } else {
                    i.check = false;
                }
            })
            this.filterOptions.resolution = item.check ? item.key : '';
        },
        // 选择标签
        chooseTag(item, index) {
            this.tagList.forEach(i => {
                if (i.name === item.name) {
                    i.check = !item.check;
                } else {
                    i.check = false;
                }
            })
            this.filterOptions.tags = item.check ? item.name : '';
        },
    }
}
</script>
<style lang="less" scoped>
.filter-bar-main {
    position: fixed;
    top: 0;
    left: 220px;
    z-index: 10;
    border-right: 1px solid var(--borderColor);
    transition: all .3s ease;
    &.close {
        left: -20px;
        border: none !important;
        .bar-handle .base-icon {
            transform: rotate(270deg);
        }
    }
}
[data-theme="newdark"] .filter-bar-main {
    background: #2b2c30;
    ::-webkit-scrollbar-thumb {
        background-color: #2b2c30;
    }
    .pack {
        background: #292a2e;
        border: 1px solid #3e3f42;
    }
}
[data-theme="newlight"] .filter-bar-main {
    background: #e5e7ee;
    ::-webkit-scrollbar-thumb {
        background-color: #e5e7ee;
    }
    .pack {
        background: #d4d4d5;
        border: 1px solid #c9cacb;
    }
}
.filter-wrapper {
    width: 239px;
    height: 100vh;
    padding: 30px 15px 30px 20px;
    overflow: auto;
    &:hover::-webkit-scrollbar-thumb {
        background-color: var(--borderColor) !important;
    }
}
.bar-handle {
    position: absolute;
    top: calc(50% - 55px);
    right: -17px;
    width: 17px;
    height: 110px;
    cursor: pointer;
    .base-icon {
        position: absolute;
        top: calc(50% - 6px);
        right: 6px;
        font-size: 12px;
        transform: rotate(90deg);
    }
}
.title-box {
    margin-bottom: 27px;
    color: var(--stressColor);
    span {
        font-size: 14px;
        font-weight: bold;
    }
    .base-icon {
        cursor: pointer;
        &:hover {
            color: var(--mainColor);
        }
        &[disabled] {
            pointer-events: none;
        }
    }
}
.filter-box {
    position: relative;
    margin-bottom: 40px;
    .title {
        margin-bottom: 20px;
        font-size: 12px;
        color: var(--dimColor);
    }
    .list {
        li {
            margin-bottom: 20px;
            cursor: pointer;
            .parent-item:hover > p{
                color: var(--mainColor);
            }
            &.check .parent-item .check-box,
            &.check > .check-box {
                background: rgba(14,197,199,0.20);
                border: 1px solid var(--mainColor);
                .base-icon {
                    display: block;
                }
            }
            &.disabled {
                pointer-events: none;
            }
            .check-box {
                display: inline-block;
                vertical-align: middle;
                width: 20px;
                height: 20px;
                line-height: 18px;
                margin-right: 8px;
                background: var(--backColor);
                border: 1px solid var(--borderColor);
                border-radius: 5px;
                color: var(--mainColor);
                text-align: center;
                .base-icon {
                    display: none;
                }
            }
            p {
                display: inline-block;
                vertical-align: middle;
                font-size: 12px;
                color: var(--stressColor);
            }
            span {
                float: right;
                font-size: 12px;
                color: var(--dimColor);
            }
            ul {
                margin-top: 20px;
                padding-left: 14px;
                margin-left: 14px;
                border-left: 1px solid var(--borderColor);
                li {
                    margin-bottom: 14px;
                }
                li:hover p {
                    color: var(--mainColor);
                }
            }
        }
    }
    .more {
        margin-left: 30px;
        font-size: 12px;
        color: var(--dimColor);
        cursor: pointer;
        &:hover {
            color: var(--mainColor);
        }
    }
    .pack {
        position: absolute;
        top: 0;
        right: 0;
        width: 40px;
        height: 20px;
        line-height: 16px;
        border-radius: 3px;
        text-align: center;
        font-size: 12px;
        &:hover {
            border-color: var(--mainColor);
            background-color: var(--mainColor);
            color: #fff;
        }
    }
}
.ratio-box {
    .check-box {
        margin-right: 20px !important;
    }
    .ratio-shape {
        display: inline-block;
        vertical-align: top;
        height: 20px;
        margin-right: 10px;
        border-radius: 2px;
        background-color: var(--dimColor);
    }
}
.duration-box {
    .base-slider.duration-slider {
        width: 200px;
        padding: 0 0 0 0;
    }
    .mark {
        width: calc(100% + 14px);
        height: 20px;
        margin-left: -7px;
        margin-top: 18px;
        font-size: 12px;
        color: var(--textColor);
    }
}
</style>