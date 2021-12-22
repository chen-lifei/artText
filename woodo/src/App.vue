<template>
    <div id="app">
        <template v-if="!isMobile">
            <div class="woodo-wrap" v-if="$route.meta.showNav">
                <!-- 头部导航 -->
                <keep-alive>
                    <nav-head @loginCallback="loginCallback"></nav-head>
                </keep-alive>
                <!-- 左侧导航 -->
                <keep-alive>
                    <nav-left></nav-left>
                </keep-alive>
                <main>
                    <router-view ref="routerView" />
                </main>
            </div>
            <router-view v-else />
            <!-- 反馈组件 -->
            <feedback-button v-if="!$route.meta.hideFeedback"></feedback-button>
        </template>
        <router-view v-else />
    </div>
</template>

<script>
import NavHead from '@/components/nav/NavHead.vue';
import NavLeft from '@/components/nav/NavLeft.vue';
import FeedbackButton from '@/components/FeedbackButton.vue';
export default {
    name: "App",
    components:{
        NavHead,
        NavLeft,
        FeedbackButton
    },
    watch: {
        $route(to) {
            this.setTheme(to);
        }
    },
    computed: {
        isMobile() {
            return this.$route.path.indexOf('/mobile') > -1;
        }
    },
    mounted() {
        this.setTheme(this.$route);
    },
    methods: {
        // 更新主题色
        setTheme(router) {
            this.$store.commit('theme/SET_THEME', router.meta && router.meta.theme ? '' : 'none');
        },
        loginCallback() {
            if (this.$refs.routerView.loginCallback) this.$refs.routerView.loginCallback();
        }
    }
};
</script>

<style src="@/assets/common/css/theme.css"></style>
<style src="@/assets/iconfont/iconfont.css"></style>
<style>
    /** css 全局变量 */
    :root {
        --mainColor: #0B7BF6;          /* 主题色 */
        --mainHoverColor: #0068DD;     /* 主题色移入 */
        --mainTextColor: #000000;
        --titleTextColor: #333333;
        --naviTextColor: #666666;
        --dimTextColor: #999999;
        --errorColor: #ff7d7e;
        --darkColor: #242529;
        --lightColor: #f6f6f9;
    }
</style>
<style>
    html,
    body,
    #app {
        width: 100%;
        height: 100%;
        color: var(--textColor);
        background: var(--backColor);
        text-size-adjust: 100%;
        -webkit-text-size-adjust: 100%;
        -moz-text-size-adjust: 100%;
    }
    ::selection {
        color: #ffffff;
        background-color: var(--mainColor);
    }
    .clearfix::after {
        content: "";
        display: block;
        height: 0;
        clear: both;
        visibility: hidden;
    }
    .text-ellipsis {
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
    }
    .bold{
        font-weight: 700;
    }
    /* flex 弹性布局样式 start */
    .flex {
        display: -webkit-box;
        -webkit-box-direction: normal;
        -webkit-box-orient: horizontal;
        -webkit-box-pack: center;
        -webkit-box-align: center;
        display: flex;
        flex-direction: row;
        justify-content: center;
        align-items: center;
    }
    .flex-between {
        -webkit-box-pack: justify;
        justify-content: space-between;
    }
    .flex-evenly {
        -webkit-box-pack: justify;
        justify-content: space-between;
    }
    .skeleton-loading,
    img[lazy=loading] {
        background-image: linear-gradient(90deg, #f1f1f1 20%, #e6e6e6 40%, #f1f1f1 80%);
        background-size: 400% 100%;
        background-position: 100% 50%;
        animation: skeleton-loading 1s ease 30;
    }
    .primary,
    .hover-primary:hover {
        background-color: var(--mainColor) !important;
        border-color: var(--mainColor) !important;
        color: #ffffff;
    }
    .primary .base-icon,
    .hover-primary:hover .base-icon {
        color: #ffffff;
    }
    .primary:hover {
        background-color: var(--mainHoverColor) !important;
        border-color: var(--mainHoverColor) !important;
    }
    @keyframes skeleton-loading {
        0% {
            background-position: 100% 50%;
        }
        100% {
            background-position: 0 50%;
        }
    }

    .woodo-wrap {
        display: grid;
        height: 100vh;
        overflow: hidden;
    }
    .nav-head-main {
        grid-column: 2 / 3;
        grid-row: 1 / 3;
        height: 76px;
    }
    .nav-left-main {
        grid-column: 1 / 2;
        grid-row: 1 / 5;
        width: 220px;
        height: 100vh;
        z-index: 20;
    }
    .woodo-wrap main {
        position: relative;
        grid-row: 3 / 4;
        grid-column: 2 / 3;
        width: calc(100vw - 220px);
        height: calc(100vh - 76px);
        min-width: 1020px;
        overflow: auto;
    }
</style>

