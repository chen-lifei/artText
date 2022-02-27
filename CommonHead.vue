<template>
    <div class="common-head-container"
        :style="{ background: head_options.theme.bg }"
        :class="{ shadow: head_options.shadow, fixed: head_options.fixed, light: head_options.theme.key === 'light', slides: head_options.slides, dark: head_options.theme.key === 'dark', border: head_options.border  }">
        <div class="head-wrapper flex">
            <!-- 头部左侧 -->
            <div class="head-left flex">
                <img class="logo" @click="toHome" :src="require('public/logo-48.png')" alt="">
                <!-- 导航 -->
                <div class="navigate-bar flex">
                    <div class="navigate-item"
                        v-for="(navItem, index) in navList"
                        :key="index"
                        :class="navItem.key">
                        <router-link class="name" v-if="navItem.router" :to="navItem.router">{{ navItem.name }}</router-link>
                        <base-icon class="icongengduoanniu name" v-else-if="navItem.key === 'more'"></base-icon>
                        <span class="name" v-else>{{ navItem.name }}</span>
                        <base-icon v-if="navItem.list && navItem.key !== 'more'" class="iconxialazhankaijiantou arrow-icon" :size="12"></base-icon>
                        <div v-if="navItem.list" class="dropdown-wrapper">
                            <div class="dropdown-item"
                                v-for="(item, index) in navItem.list"
                                :key="index"
                                @click="jumpToLink(item)">
                                <router-link class="item-name" v-if="item.router" :to="item.router">{{ item.name }}</router-link>
                                <div class="item-name" v-else>{{ item.name }}</div>
                                <div class="item-desc" v-if="item.desc">{{ item.desc }}</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <!-- 头部右侧 -->
            <div class="head-right flex">
                <!-- 已登录 -->
                <template v-if="user.login">
                    <!-- 消息中心 -->
                    <div class="user-news flex" v-if="!head_options.slides"  @mouseenter="showMessage = true" @mouseleave="showMessage = false">
                        <div class="news-icon">
                            <base-icon class="iconring" size=20></base-icon>
                            <span class="unread" v-show='unreadMessage > 0'></span>
                        </div>                        
                        <NavMessageModal :show="showMessage" @unread="getMessageUnread"></NavMessageModal>
                    </div>
                    <!-- 用户信息  -->
                    <div class="user-panel flex" @mouseenter="showUser = true" @mouseleave="showUser = false">
                        <!-- 用户头像 -->
                        <router-link class="user-head" v-bdtongji="`全部-全部-全部-右上角-头像名称`" to="/home/" tag="img" :src="user.photo" alt=""></router-link>
                        <NavUserModal :show="showUser" :user="user" @update="getUser"></NavUserModal>
                    </div>
                </template>
                <!-- 未登录 - 登录注册按钮-->
                <template v-else>
                    <div class="login" @click="toLogin('account')">登录</div>
                    <div class="signup" @click="toLogin('wechat')">注册</div>
                </template>
            </div>
        </div>
        <!-- 登录/注册弹框-->
        <loginModal ref="loginModal" :user="user" @success_callback="getUser" @get_user_info="getUser"></loginModal>
    </div>
</template>

<script>
    /**
     *  通用头部配置
     *  @param theme {   头部主题 || String || 默认blue主题
     *      bg           背景色 || String
     *      logo         logo颜色(white:白色,blue:主题色) || String
     *  }    
     *  @param customize 自定义主题 || Object
     *  @param shadow    是否添加阴影 || Boolean || 默认false
     *  @param fixed     是否滚动时固定(滚动方法需在父组件内绑定) || Boolean || 默认false
     */
    import loginModal from '@/components/LoginModal.vue';
    import NavUserModal from '@/components/nav/NavUserModal.vue';
    import NavMessageModal from '@/components/nav/NavMessageModal.vue';
    export default{
        components:{ loginModal, NavUserModal, NavMessageModal },
        props:{
            options: {
                theme: Object,
                customize: Object,
                shadow: Boolean,
                fixed: Boolean,
                slides: Boolean,
                border: Boolean,
            },
        },
        data(){
            return{
                // 默认配置
                head_options: {
                    theme: {
                        key: 'light',
                        bg: 'transparent',
                        logo: 'white',
                    },
                    shadow: false,
                    fixed: false,
                    slides: false,
                    border: false,
                },
                // 头部主题
                theme_arr: {
                    'blue':{
                        key: 'light',
                        bg:'#0063fa',
                        logo: 'white',
                    },
                    'white':{
                        key: 'light',
                        bg:'#fff',
                        logo: 'blue',
                    },
                    'dark':{
                        key: 'dark',
                        bg:'#303135',
                        logo: 'white',
                    },
                    'transparent':{
                        key: 'light',
                        bg:'transparent',
                        logo: 'white',
                    },
                    'deepdark': {
                        key: 'dark',
                        bg:'#0b0b0b',
                        logo: 'blue',
                    },
                },
                showMessage: false,                 // 是否显示消息面板
                unreadMessage: 0,                   // 未读消息数
                user: {},                           // 用户信息
                showUser: false,                    // 是否显示用户信息面板
                navList: [                          // 导航菜单列表
                    { key: 'product', name: '产品', list: [{ name: '演示文档', desc: '吾道幻灯片，让演示汇报更精彩', link: 'https://www.woodo.cn/home/' }, { name: '视频剪辑', desc: '极简单的视频创作工具，三分钟轻松上手', link: 'https://www.procut.cc/' }, { name: '求职简历', desc: '千万求职者都在用的智能简历工具', link: 'https://www.500d.me/' }] },
                    { key: 'template', name: '模板', list :[{ name: 'PPT模板', designKey: 'template' }, { name: '视频工程', designKey: 'project' }, { name: '简历模板', link: 'https://www.500d.me/' }, { name: '营销设计', designKey: 'template_design' }] },
                    { key: 'material', name: '资源', list :[{ name: '图片', designKey: 'photo' }, { name: '视频', designKey: 'video' }, { name: '音频', designKey: 'audio', designCode: 'YinLe' }, { name: '矢量素材', designKey: 'vectors', designCode: 'ShiLiang' }, { name: '共享文库', designKey: 'works_share' }] },
                    { key: 'price', name: '定价', router: '/member/upgrade/' },
                    { key: 'more', list: [{ name: '企业服务', router: '/open_api/' }, { name: '帮助中心', router: '/help/' }] }
                ]
            }
		},
        watch:{
            options:{
                handler(value) {
                    this.headOptionsDeal(value);
                },
                deep: true
            },
        },
        mounted() {
            // 头部配置处理
            this.headOptionsDeal(this.options);
            // 获取用户信息
            this.getUser();
		},
        methods:{
            // 头部配置处理
            headOptionsDeal(options) {
                let that = this;
                let head_options = that.head_options;
                if(!options){
                    head_options = {
                        theme: that.theme_arr['blue'],
                        shadow: false,
                        fixed: false,
                        border: false,
                    }
                }else if(options.theme){
                    that.head_options.theme = that.theme_arr[options.theme];
                    delete options.theme;
                }else if(options.customize){
                    that.head_options.theme = options.customize;
                    delete options.customize;
                }
                that.head_options = options ? Object.assign(head_options, options) : head_options;
            },
            // 更新未读消息
            getMessageUnread(val) {
                this.unreadMessage = val;
            },
            // 获取用户信息
            getUser() {
                let that = this;
                let user = that.$common.get_login_state();
                if (!user.login) {
                    return;
                }
                if (user.memberVipExpire) {
                    user.memberVipExpire = utils.dateFormat(new Date(user.memberVipExpire), 'yyyy-MM-dd');
                }
                that.user = user;
                let pathname = window.location.pathname.replace('/','');
                if (!pathname) {
                    that.$parent.user = that.user;
                }
            },
            toHome() {
                this.user.login ? this.$router.push({ path: '/home/' }) : this.$router.push({ path: '/' });
            },
            // 登录
            toLogin(type) {
                this.$refs.loginModal.open({ type: type });
            },
            jumpToLink(item) {
                if (item.link) {
                    utils.windowOpenNewtab(item.link);
                } else if (item.designKey) {
                    if (item.designCode) {
                        this.$router.push({ name: `DesignLibrary`, params: { type: item.designKey }, query: { code: item.code } });
                    } else {
                        this.$router.push({path: `/design/${item.designKey}/`});
                    }
                }
            },
        }
    }
</script>

<style lang="less" scoped>
    .common-head-container {
        position: relative;
        width: 100%;
        min-width: 1240px;
        height: 88px;
        z-index: 10;

        .head-wrapper {
            justify-content: space-between;
            width: 100%;
            height: 100%;
            padding: 0 10%;

            .head-left {
                height: 100%;
                .logo {
                    width: 48px;
                    height: 48px;
                    margin-right: 60px;
                    border-radius: 12px;
                    cursor: pointer;
                }
                .navigate-bar {
                    height: 100%;
                    .navigate-item {
                        position: relative;
                        width: 90px;
                        padding: 30px 0;
                        text-align: center;
                        cursor: pointer;
                        .name {
                            color: #242529;
                            font-size: 14px;
                            margin-right: 5px;
                        }
                        .arrow-icon {
                            color: #242529;
                            transition: all .3s ease;
                        }
                        .dropdown-wrapper {
                            display: none;
                            position: absolute;
                            top: 68px;
                            left: -14px;
                            width: 118px;
                            padding: 5px;
                            border-radius: 5px;
                            border: 1px solid #E3E6EC;
                            background-color: #FFFFFF;
                            box-shadow: 0 5px 10px rgba(227,230,236,0.4);
                            .dropdown-item {
                                height: 36px;
                                line-height: 36px;
                                .item-name {
                                    color: #242529;
                                }
                                &:hover {
                                    background-color: #F6F6F9;
                                }
                            }
                        }
                        &.product {
                            .dropdown-wrapper {
                                width: 320px;
                                left: -115px;
                                .dropdown-item {
                                    display: flex;
                                    flex-direction: column;
                                    justify-content: center;
                                    height: 68px;
                                    line-height: 22px;
                                    padding-left: 20px;
                                    text-align: left;
                                    .item-name {
                                        font-size: 14px;
                                        font-weight: bold;
                                    }
                                    .item-desc {
                                        color: #949496;
                                    }
                                }
                            }
                        }
                        &:hover {
                            color: var(--mainColor);
                            .dropdown-wrapper {
                                display: inline-block;
                            }
                            .arrow-icon {
                                transform: rotate(180deg);
                            }
                        }
                    }
                }
            }

            .head-right {
                height: 100%;
                .user-news,
                .user-panel {
                    position: relative;
                    width: 36px;
                    height: 100%;
                    cursor:pointer;
                }
                .user-news {
                    margin-right: 10px;
                    .news-icon {
                        position: relative;
                        width: 100%;
                        height: 36px;
                        text-align: center;
                        line-height: 36px;
                        background-color: #E3E6EC;
                        border-radius: 50%;
                        .base-icon {
                            color: #242529;
                        }
                    }
                    .unread {
                        position: absolute;
                        top: -2px;
                        right: 2px;
                        width: 8px;
                        height: 8px;
                        background: #fece0a;
                        border-radius: 50%;
                    }
                }
                .user-panel {
                    .user-head {
                        width: 36px;
                        height: 36px;
                        border-radius: 50%;
                    }
                }
                .login,
                .signup {
                    display: inline-block;
                    width: 58px;
                    height: 36px;
                    border-radius: 8px;
                    text-align: center;
                    line-height: 36px;
                    cursor: pointer;
                    transition: all .3s ease;
                }
                .login {
                    color: #242529;
                    background-color: transparent;
                    font-size: 14px;
                    &:hover {
                        color: var(--mainColor);
                        background-color: #F6F6F9;
                    }
                }
                .signup {
                    margin-left: 15px;
                    color: #FFFFFF;
                    background-color: #242529;
                    &:hover {
                        color: #FFFFFF;
                        background-color: var(--mainColor);
                    }
                }
            }
        }

        &.border {
            border-bottom: 1px solid #E3E6EC;
        }

        &.shadow {
            box-shadow: 0px 4px 4px 0px rgba(135, 135, 135, 0.1);
        }

        &.fixed {
            position: fixed !important;
            top: 0;
            z-index: 99;
            box-shadow: 0 5px 5px rgba(0,0,0,.07);
            background: #FFFFFF;
        }

        &.dark {
            .head-wrapper {
                .head-left {
                    .navigate-bar .navigate-item {
                        .name,
                        .arrow-icon {
                            color: #FFFFFF;
                        }
                        .dropdown-wrapper {
                            border: 1px solid #3E3F42;
                            background-color: #303135;
                            box-shadow: 0 5px 10px rgba(23,24,27,0.8);
                            .dropdown-item {
                                .item-name {
                                    color: #FFFFFF;
                                }
                                &:hover {
                                    background-color: #3C3D41;
                                }
                            }
                        }
                    }
                    
                }
                .head-right {
                    .user-news {
                        .news-icon {
                            .base-icon {
                                color: #FFFFFF;
                            }
                        }
                    }
                    .login {
                        color: #FFFFFF;
                        &:hover {
                            color: var(--mainColor);
                            background-color: #3C3D41;
                        }
                    }
                    .signup {
                        color: #242529;
                        background-color: #FFFFFF;
                        &:hover {
                            color: #FFFFFF;
                            background-color: var(--mainColor);
                        }
                    }
                }
            }
        }

        &.slides {
            .head-wrapper {
                padding: 0 5%;
                .head-left {
                    .navigate-item.price,
                    .navigate-item.more {
                        display: none !important;
                    }
                }
            }
        }
    }
</style>