<template>
    <div class="nav-left-main">
        <!-- logo -->
        <base-icon class="logo" svgId="iconlogo1" size="100" v-if="pageTheme === 'light'" @click="toHome()"></base-icon>
        <base-icon class="logo" svgId="iconlogo" size="100" v-else @click="toHome()"></base-icon>
        <!-- 创建作品 -->
        <base-button class="create-btn primary" :round="true" :height="48"><div class="icon"></div>创建作品</base-button>
        <!-- 导航主体 -->
        <div class="nav-container">
            <div class="nav-wrapper" v-for="(item, index) in navList" :key="index">
                <p v-if="item.key === 'home'">首页</p>
                <p v-if="item.key === 'material'">素材区</p>
                <div class="nav-title nav-hover" @click="changeNav(item)" :class="{check: currentNav && item.key === currentNav.key}">
                    <label v-if="item.openable" @click="item.open = !item.open">
                        <base-icon class="arrow iconjiantou" :rotate="item.open ? 270 : 90" size="12"></base-icon>
                    </label>
                    <base-icon :class="item.icon" size="18"></base-icon>
                    <span>{{ item.name }}</span>
                </div>
                <!-- 子导航列表 -->
                <div class="nav-list" v-if="item.list.length && (!item.openable || item.open)">
                    <div class="nav-item nav-hover"
                        v-for="(citem, cindex) in item.list"
                        :key="cindex"
                        v-show="cindex <= childShowCount"
                        :class="{'check': currentChildNav && currentChildNav.key === citem.key}"
                        @click="changeChildNav(item, citem)"
                    >
                        <span>{{ citem.name }}</span>
                    </div>
                </div>
                <span class="more-list nav-hover" v-if="item.list.length > 6" @click="showMoreChild()"><base-icon class="arrow iconxiala" :rotate="childShowCount === 6 ? 90 : 270" size="12"></base-icon>{{childShowCount === 6 ? '展示其它6个' : '隐藏部分内容'}}</span>
            </div>
        </div>
    </div>
</template>

<script>
    /**
     *  通用左侧导航栏
     */
    export default{
        data(){
            return{
                // 用户信息
                userInfo: {},
                navList: [
                    {name: "工作台", key: "home", icon: "icongongzuotai", path:"/home/", list: []},
                    {name: "我的设计", key: "document", icon: "iconwodesheji", path:"/document/", list: [{name: "收藏", key: "favorite"}, {name: "回收站", key: "dustbin"}], openable: true, open: false},
                    {name: "素材广场", key: "material", icon: "iconsucaiku", path:"/material/", list: [
                        {name: "PPT模板", key: "ppt"},
                        {name: "图片", key: "photo"},
                        {name: "视频", key: "video"},
                        {name: "音乐", key: "audio", code: "YinLe"},
                        {name: "插画", key: "vectors", code: "ChaTu"},
                        {name: "营销设计", key: "design"},
                        {name: "音效", key: "audio", code: "YinXiao"},
                        {name: "矢量", key: "vectors", code: "ShiLiang"},
                        {name: "贴纸", key: "vectors", code: "tiezhi"},
                        {name: "GIF动图", key: "photo", code: "GIFDongTu"},
                        {name: "PPT共享资料", key: "worksShare"},
                        {name: "视频工程", key: "project"}]},
                    {name: "我的团队", key: "team", icon: "icontianjia", path:"/team/", list: []},
                ],                        // 导航列表
                childShowCount: 6,        // 二级导航展示数量
                currentNav: null,         // 当前一级导航
                currentChildNav: null,    // 当前二级导航

            }
		},
        watch:{
            $route(to,from){
                this.getRoute(to);
            }
        },
        computed: {
            pageTheme() {
                return this.$store.getters.pageTheme;
            }
        },
        mounted() {
            this.userInfo = this.$common.get_login_state();
            this.getRoute(this.$route);
		},
        methods:{
            getRoute(route) {
                this.currentNav = this.navList.find(item => route.path.indexOf(item.path) > -1);
                let { params, query } = route;
                if (params || query) {
                    // this.currentChildNav = this.currentNav.list.find(item => params.type ? params.type.indexOf(item.key) > -1 || query.nav?.indexOf(item.key) > -1);
                }
                if (this.currentChildNav) this.currentNav.open = true;
            },
            // 返回首页
            toHome () {
                this.$common.toIndex(this.userInfo.login);
            },
            // 切换导航
            changeNav(item) {
                if (this.currentNav === item && !this.currentChildNav) {
                    return;
                }
                item.open = true;
                this.currentNav = item;
                this.currentChildNav = null;
                this.$router.push({path: item.path});
            },
            // 切换二级导航
            changeChildNav(item, citem) {
                if (this.currentChildNav === citem) {
                    return;
                }
                this.currentNav = item;
                this.currentChildNav = citem;
                if (item.key === `design`) {
                    this.$router.push({path: `/design/${citem.key}`});
                } else if (item.key === `myproject`) {
                    this.$router.push({path: `/myProject`, query: {nav: citem.key}});
                }
            },
            // 展示更多二级分类
            showMoreChild() {
                this.childShowCount = this.childShowCount === 6 ? 12 : 6;
            }
        }
    }
</script>

<style lang="less" scoped>
.nav-left-main {
    background: var(--upperColor);
    text-align: center;
    user-select: none;
}
.logo {
    margin-bottom: 10px;
}
.create-btn {
    width: calc(100% - 40px);
    margin-bottom: 14px;
    box-shadow: 0px 5px 10px 0px rgba(13,123,246,0.30);
    .icon {
        position: relative;
        display: inline-block;
        width: 15px;
        height: 15px;
        vertical-align: bottom;
        border: 1px solid #FFFFFF;
        border-radius: 50%;
        margin-right: 13px;
        &::before {
            content: '';
            position: absolute;
            left: 4px;
            top: 6px;
            width: 5px;
            border-top: 1px solid;
        }
        &::after {
            content: '';
            position: absolute;
            left: 6px;
            top: 4px;
            height: 5px;
            border-left: 1px solid;
        }
    }
}
.nav-container {
    height: calc(100vh - 172px);
    padding-bottom: 20px;
    overflow: auto;
    .nav-wrapper {
        position: relative;
        text-align: left;
        & > p {
            margin: 26px 0 10px 0;
            padding-left: 38px;
            font-size: 12px;
            color: var(--dimColor);
        }
        & > span {
            display: block;
            height: 46px;
            line-height: 46px;
            padding-left: 68px;
            .arrow {
                position: absolute;
                left: 43px;
            }
        }
        &:last-of-type {
            margin-top: 30px;
            &::before {
                content: "";
                position: absolute;
                top: -6px;
                left: 20px;
                width: calc(100% - 40px);
                height: 1px;
                background: var(--borderColor);
            }
        }
    }
    .nav-hover {
        position: relative;
        cursor: pointer;
        &.check,
        &:hover {
            color: var(--mainColor);
            background: rgba(14,197,199,0.10);
            &::before {
                content: "";
                position: absolute;
                left: 0;
                top: 0;
                width: 4px;
                height: 100%;
                background: var(--mainColor);
            }
        }
    }
    .nav-title {
        height: 48px;
        line-height: 48px;
        padding-left: 68px;
        color: var(--stressColor);
        font-size: 14px;
        span {
            font-weight: 600;
        }
        label {
            position: absolute;
            left: 0px;
            width: 40px;
            height: 100%;
            cursor: pointer;
        }
        .base-icon {
            position: absolute;
            top: 0;
            left: 38px;
            &.arrow {
                top: 1px;
                left: 18px;
                font-weight: bold;
                color: var(--stressColor);
            }
        }
    }
    .nav-item {
        height: 46px;
        line-height: 46px;
        padding-left: 68px;
    }
}
</style>