<template>
    <div class="design-library-main" :class="{'pack': pack}" v-if="currentRoute">
        <!-- 搜索模块 -->
        <div class="design-search-box" :style="`background: linear-gradient(270deg,${currentRoute.theme[0]}, ${currentRoute.theme[1]});`">
            <!-- 面包屑 -->
            <div class="bread-bar">
                <router-link tag="span" to="/design">素材库</router-link>
                <template v-if="currentCategory">
                    <base-icon class="iconfangxiangjiantou" size="12"></base-icon>
                    <span @click="backTopCategory"> {{ currentRoute.name }}</span>
                    <base-icon class="iconfangxiangjiantou" size="12"></base-icon>
                    {{ currentCategory.name }}
                </template>
                <template v-else>
                    <base-icon class="iconfangxiangjiantou" size="12"></base-icon>
                    {{ currentRoute.name }}
                </template>
            </div>
            <h1>{{ currentRoute.desc }}</h1>
            <design-search ref="search" :code="currentRoute.code" @search="search"></design-search>
        </div>
        <!-- 筛选组件 -->
        <filter-bar ref="filter" :type="currentRoute.key" :category="category" :keyword="keyword" :filterOpen.sync="pack" @filter="filter"></filter-bar>
        <!-- 列表主体 -->
        <design-list ref="designList" v-if="currentRoute" :keyword="keyword" :category="category" :design-type="currentRoute.key" scroll-element=".design-library-main"></design-list>
    </div>
</template>

<script>
import designSearch from '@/views/Design/components/DesignSearch.vue';
import filterBar from '@/views/Design/components/FilterBar.vue';
import designList from '@/views/Design/components/DesignList.vue';
export default {
    name: "Library",
    components: { designSearch, filterBar, designList },
    data() {
        return {
            pack: true,
            currentRoute: '',
            keyword: '',
            category: '',
            groupList: [
                {key: 'template', code: 'muban', name: "工程模板", desc: '可在线编辑的视频工程模板', theme: ["#4ccdd5", "#43c7cf"]},
                {key: 'video', code: 'shipin', name: "视频", desc: '最精彩的免费视频资源', theme: ["#D8DB9E", "#2BC0E4"]},
                {key: 'audio', code: 'YinLe', name: "音频", desc: '悦耳动听的免费音频资源', theme: ["#FBC7D4", "#9796F0"]},
                {key: 'audio', code: 'YinXiao', name: "音频", desc: '悦耳动听的免费音频资源', theme: ["#FBC7D4", "#9796F0"]},
                {key: 'photo', code: 'TuPian1', name: "图片", desc: '超高质量的免费图片资源', theme: ["#F5D74A", "#FFA751"]},
                {key: 'vectors', code: 'sucaiku', name: "图形", desc: '丰富的免费图形资源', theme: ["#fbd786", "#f7797d"]},
            ],
            currentCategory: ''
        }
    },
    watch:{
        $route(to, from){
            this.currentRoute = '';
            this.$nextTick(() => {
                this.int();
            })
        },
    },
    created() {
        this.int();
    },
    methods: {
        int() {
            this.currentCategory = null;
            this.currentRoute = this.groupList.find(i => i.key === this.$route.params.type);
            // 设置标题
            document.title = `免版权素材库-${this.currentRoute.name}-迦剪`;
            // 默认分类处理
            if (this.$route.params.category) {
                this.category = this.$route.params.category;
            } else if (this.currentRoute.key === 'audio') {
                this.category = 'first';
            } else if (this.currentRoute.key === 'vectors') {
                this.category = 'second';
            } else {
                this.category = '';
            }
            // 设置关键词
            this.keyword = this.$route.params.keyword;
            this.$nextTick(() => {
                this.$refs.search.clear(this.keyword);
            })
        },
        // 返回首级分类
        backTopCategory() {
            this.$refs.filter.clear();
            this.currentCategory = null;
        },
        // 筛选
        filter(data, bread) {
            this.keyword = '';
            setTimeout(() => {
                this.$refs.search.clear('');
                this.$refs.designList.getFilterList(data);
                this.currentCategory = bread;
            }, 0);
        },
        // 搜索
        search(data) {
            this.category = '';
            this.keyword = data.value;
            setTimeout(() => {
                this.$refs.filter.clear(false);
                this.$refs.designList.getSearchList(data);
            }, 0);
        }
    },
}
</script>

<style lang="less" scoped>
.design-library-main {
    position: relative;
    right: 0;
    width: 100%;
    height: calc(100vh - 76px);
    padding: 0 60px;
    overflow: auto;
    &.pack {
        float: right;
        width: calc(100% - 239px);
    }
}
.design-search-box {
    position: relative;
    width: 100%;
    height: 220px;
    padding-top: 50px;
    margin-bottom: 20px;
    border-radius: 15px;
    text-align: center;
    background: linear-gradient(270deg, #fe6995, #bf88ff);
    &::before,
    &::after {
        content: "";
        position: absolute;
        top: 0;
        height: 220px;
        z-index: 0;
        pointer-events: none;
    }
    &::before {
        left: 0;
        width: 246px;
        background-image: url('~@/assets/images/banner-f-1.png');
    }
    &::after {
        right: 52px;
        width: 340px;
        background-image: url('~@/assets/images/banner-f-2.png');
    }
    h1 {
        margin-bottom: 20px;
        font-size: 26px;
        color: #ffffff;
    }
    .bread-bar {
        position: absolute;
        top: 20px;
        left: 30px;
        color: #ffffff;
        span {
            cursor: pointer;
            &:hover {
                text-decoration: underline;
            }
        }
        .base-icon {
            margin: 0 6px;
            transform: rotate(-90deg) translateY(1px);
        }
    }
}
</style>