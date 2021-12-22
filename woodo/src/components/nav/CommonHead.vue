<template>
    <div class="common_head_contain" :style="{background:head_options.theme.bg}" :class='{shadow:head_options.shadow,fixed:head_options.fixed,white:head_options.theme.bg === "#fff",slides:head_options.slides} '>
        <div class="head_wrapper">
            <!-- 头部左侧 -->
            <div class="head_left">
                <base-logo :theme="head_options.theme.logo === 'blue' ? `main` : `white`" :link="user.login ? '/home/' : '/'"></base-logo>
            </div>
            <!-- 头部中间 -->
            <div class="head_center">
                <!-- 导航 -->
                <div class="navigate_bar">
                    <router-link class="navi_item" v-if="!judgeRoute('home') && !head_options.slides && $route.path !== '/'" to="/home/" v-bdtongji="`PC-2.6.7-通用导航-顶部-导航栏-首页`">首页</router-link>
                    <!-- 模板中心 -->
                    <router-link class="navi_item" to="/template/" :class="{current: judgeRoute('template')}" v-bdtongji="`PC-2.6.7-通用导航-顶部-导航栏-模板中心`">模板中心</router-link>
                    <!-- 素材中心 -->
                    <div class="navi_item pull_bar material_navi" @mouseenter="getMaterial">
                        <router-link class="navi_item" to="/material/" :class="{current: judgeRoute('material')}" v-bdtongji="`PC-2.6.7-通用导航-顶部-导航栏-素材中心`">素材中心</router-link>
                        <ul class="category_panel">
                            <router-link tag="li" :to="{ path: '/material/', query: { categoryId: IMAGES_IMAGE_ID }}" v-bdtongji="`PC-2.6.7-素材中心-左侧-素材分类-图片`">图片</router-link>
                            <router-link tag="li"
                                v-for="item in material_category_list" 
                                :key="item.id"
                                :to="{ path: '/material/', query: { categoryId: item.id }}"
                                v-bdtongji="`PC-2.6.7-素材中心-左侧-素材分类-${item.name}`"
                            >
                                {{ item.name }}
                            </router-link>
                            <router-link tag="li" :to="{ path: '/material/', query: { categoryId: ICONS_ID }}" v-bdtongji="`PC-2.6.7-素材中心-左侧-素材分类-图标`">图标</router-link>
                        </ul>
                    </div>
                    <router-link class="navi_item" to="/design/" :class="{current: judgeRoute('design')}" v-bdtongji="`PC-2.6.7-通用导航-顶部-导航栏-设计实验室`">设计实验室</router-link>
                    <router-link class="navi_item" to="/work_share/" :class="{current: judgeRoute('material')}" v-bdtongji="`PC-2.6.7-通用导航-顶部-导航栏-共享作品`">共享作品</router-link>
                    <template v-if="!head_options.slides">
                        <router-link class="navi_item" to="/open_api/" :class="{current: judgeRoute('open_api')}" v-bdtongji="`PC-2.6.7-通用导航-顶部-导航栏-企业客户`">企业客户</router-link>
                        <!-- 更多 -->
                        <div class="navi_item pull_bar more_navi">
                            <a href="javascript:;" class="navi_name">●●●</a>
                            <div class="more">
                                <ul>
                                    <router-link to="/member/upgrade/">定价</router-link>
                                    <router-link to="/help/">帮助中心</router-link>
                                </ul>
                            </div>
                        </div>
                        <!-- 加入吾道 -->
                        <a class="join" href="https://www.yuque.com/docs/share/b33c57ad-a52f-4fbd-bd56-74c5e8e4b9fc?#" target="_blank">吾道招人啦</a>
                    </template>
                </div>
            </div>
            <!-- 头部右侧 -->
            <div class="head_right">
                <!-- 已登录 -->
                <template v-if="user.login">
                    <!-- 消息中心 -->
                    <div class="user_news" v-if="!head_options.slides"  @mouseenter="message_show = true" @mouseleave="message_show = false">
                        <img v-if="head_options.theme.bg === '#fff'" src="../../assets/pc/images/common/user_news_dark.png" alt="">
                        <img v-else src="../../assets/pc/images/common/user_news.png" alt="">
                        <i class="count" v-show='message_unread_count > 0'>{{ message_unread_count }}</i>
                        <NavMessageModal :show="message_show" @unread="getMessageUnread"></NavMessageModal>
                    </div>
                    <!-- 用户信息  -->
                    <div class="user_panel" @mouseenter="user_show = true" @mouseleave="user_show = false">
                        <!-- 用户头像昵称 -->
                        <div class="user_head" v-bdtongji="`全部-全部-全部-右上角-头像名称`">
                            <router-link to="/home/" tag="img" :src="user.photo" alt=""></router-link>
                            <router-link to="/home/">{{ user.nickname }}</router-link>
                        </div>
                        <NavUserModal :show="user_show" :user="user" @update="getUser"></NavUserModal>
                    </div>
                </template>
                <!-- 未登录 -->
                <!--登录注册按钮-->
                <div class="un_login" v-else>
                    <a href="javascript:;" class="login" @click="toLogin('account')">登录</a>
                    <a class="sign_up" @click="toLogin('wechat')">注册</a>
                </div>
            </div>
        </div>
        <!-- 登录/注册弹框-->
        <loginModal ref="loginModal" 
            :user="user"
            @success_callback="getUser"
            @get_user_info="getUser"
        ></loginModal>
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
                theme: String,
                customize: Object,
                shadow: Boolean,
                fixed: Boolean,
                slides: Boolean,
            },
        },
        data(){
            return{
                // 默认配置
                head_options: {
                    theme: {
                        bg: 'transparent',
                        logo: 'white',
                    },
                    shadow: false,
                    fixed: false,
                    slides: false,
                },
                // 头部主题
                theme_arr: {
                    'blue':{
                        bg:'#0063fa',
                        logo: 'white',
                    },
                    'white':{
                        bg:'#fff',
                        logo: 'blue',
                    },
                    'dark':{
                        bg:'#0b1328',
                        logo: 'white',
                    },
                    'transparent':{
                        bg:'transparent',
                        logo: 'white',
                    },
                    'deepdark': {
                        bg:'#0b0b0b',
                        logo: 'blue',
                    },
                },
                
                // 消息相关
                message_show: false,
                message_unread_count: 0,           // 未读消息数
                
                // 用户信息相关
                user: {},
                user_show: false,

                // 素材相关
                IMAGE_ID: 7,                          // 图片库id
                ICONS_ID: 21,                         // 图标库接口id
                IMAGES_IMAGE_ID: -1,                  // 图片二级菜单 除以下几类外的图片类，固定id = -1
                material_category_list: [],           // 素材分类列表

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
                        fixed: false
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
            // 判断当前路由
            judgeRoute(type) {
                return this.$route.path.indexOf(type) > -1;
            },
            // 更新未读消息
            getMessageUnread(val) {
                this.message_unread_count = val;
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
                if (user.name.length > 6) {
                    user.nickname = user.name.substring(0, 6) + '...'; // 昵称显示长度为注册时限制的长度
                } else {
                    user.nickname = user.name;
                }
                that.user = user;
                let pathname = window.location.pathname.replace('/','');
                if (!pathname) {
                    that.$parent.user = that.user;
                }
            },
            // 获取素材分类
            getMaterial() {
                let that = this;
                if (that.material_category_list.length > 0) return;
                that.$axios.get('/api/material/category/fast_enter/',{
                    params: {
                        categoryId: that.IMAGE_ID,
                        type: 'material'
                    }
                }).then((data) => {
                    if(data.data.code === '2'){
                        that.material_category_list = data.data.data;
                    }
                }).catch(err => {
                    console.log(err);
                })
            },
            // 登录
            toLogin(type) {
                this.$refs.loginModal.open({
                    type: type,
                })
            },
        }
    }
</script>

<style lang="less" scoped>
    @user_bg: url(../../assets/pc/images/common/user_info_bg.png) no-repeat;
    .common_head_contain{
        position:relative;
        width:100%;
        min-width:1240px;
        height:60px;
        z-index:10;
        .head_wrapper{
            position:relative;
            width:100%;
            height:100%;
            min-width:1240px;
            line-height:60px;
            padding:0 30px;
            text-align:center;
            &>div{
                display:inline-block;
                vertical-align:top;
                height:100%;
            }
        }
    }
    .head_left{
        float:left;
        height:100%;
    }
    .head_center{
        margin:0 auto;
        .navigate_bar{
            height:100%;
            .navi_item{
                position:relative;
                display: inline-block;
                vertical-align: top;
                width: auto;
                height: 100%;
                line-height: 60px;
                margin-right: 55px;
                text-align: center;
                &.current{
                    border-bottom:3px solid #fff;
                }
                &:hover{
                    opacity:0.7;
                }
                &:last-child{
                    margin-right:0;
                }
            }
            a{
                color: #fff;
                font-size:15px;
            }
            .join{
                display: inline-block;
                width: 115px;
                height: 30px;
                line-height: 30px;
                background-color: var(--mainColor);
                border-radius: 18px;
                text-align: center;
                font-size: 14px;
                color: #fff !important;
                transition: all .3s;
                &:hover{
                    opacity: .7;
                }
            }
            .pull_bar{
                position: relative;
                display: inline-block;
                vertical-align: top;
                margin-right: 55px;
                height: 100%;
                &:hover{opacity:1;}
            }
        }
        .material_navi{
            cursor: pointer;
            .navi_item{
                margin: 0;
                padding-right: 10px;
            }
            .category_panel{
                display: none;
                position: absolute;
                top: 60px;
                left: -17px;
                width: 105px;
                padding: 12px 0;
                background: #ffffff;
                box-shadow: 0px 6px 13px 0px rgba(68, 68, 68, 0.29);
                border-radius: 4px;
                cursor: default;
                li{
                    width: 100%;
                    line-height: 32px;
                    font-size: 14px;
                    color: #3a3f49;
                    text-align: center;
                    cursor: pointer;
                    &:hover, &.checked{
                        color: #1c7cf4;
                        background-color: #e8f2ff;
                    }
                }
            }
            &::after{
                content: "";
                position: absolute;
                top: calc(50% - 1px);
                right: -2px;
                width: 0;
                height: 0;
                border-left: 4px solid transparent;
                border-right: 4px solid transparent;
                border-top: 4px solid #fff;
                transition: transform 0.3s;
            }
            &:hover{
                &::after{
                    transform: rotate(180deg);
                }
                .category_panel{
                    display:block;
                }
            }
        }
        // 更多下拉
        .more_navi{
            .navi_name{
                display: inline-block;
                transform: scale(0.9);
                font-size: 12px;
                letter-spacing: 2px;
            }
            ul{
                display:none;
                position:absolute;
                top: 50px;
                left:-30px;
                width: 95px;
                height: auto;
                padding:5px 0;
                z-index:100;
                background-color: #ffffff;
                border-radius: 4px;
                border: solid 1px #e4e8ed;
                a{
                    display:inherit;
                    position:relative;
                    height: 40px;
                    line-height: 40px;
                    margin:0;
                    color: #656565;
                    font-size: 12px;
                    text-align: center;
                    cursor: pointer;
                    &:hover{
                        color: var(--mainColor);
                    }
                }
            }
            &:hover ul{
                display: block;
            }
        }
    }
    .head_right{
        float:right;
        .user_news {
            position: relative;
            display:inline-block;
            height: 100%;
            width: 60px;
            text-align: center;
            cursor:pointer;
            img{
                display:inline-block;
                vertical-align: middle;
            }
            i {
                position: absolute;
                top: 15px;
                right: 12px;
                height: 18px;
                min-width: 18px;
                line-height: 18px;
                background-color: #fe3f3f;
                border-radius: 10px;
                text-align: center;
                color: #fff;
            }
        }
        .user_panel{
            position:relative;
            display:inline-block;
            width:auto;
            min-width:90px;
            height:100%;
            line-height:60px;
            &::after{
                content:"";
                display:inline-block;
                vertical-align:middle;
                position: relative;
                width: 6px;
                height: 6px;
                margin: 0 0 8px 8px;
                border:2px solid #fff;
                border-left:transparent;
                border-top:transparent;
                transform:rotate(45deg);
                transition:transform 0.3s;
            }
            &:hover{
                &::after{
                    transform:rotate(-135deg);
                    top:4px;
                }
            }
            .user_head{
                position:relative;
                display:inline-block;
                i{
                    position:absolute;
                    top:13px;
                    left:22px;
                    width:8px;
                    height:8px;
                    background:#f62a00;
                    border-radius:20px;
                }
                img{
                    display:inline-block;
                    vertical-align:middle;
                    margin:0 10px 4px 0;
                    height:30px;
                    width:30px;
                    border-radius:50%;
                }
                a{
                    display:inline-block;
                    color:#fff;
                    font-size:14px;
                }
            }
        }
        .un_login{
            position:absolute;
            top:0;
            right:40px;
            display:inline-block;
            height:60px;
            line-height:60px;
            font-size:0;
            a{
                display:inline-block;
                width:60px;
                height:30px;
                line-height:30px;
                font-size:14px;
                color:#fff;
                text-align:center;
                vertical-align:middle;
            }
            .login {
                color:#fff;
            }
            .sign_up{
                margin-left:5px;
                border-radius:30px;
                background:#ffffff;
                color: var(--mainColor);
            }
        }
    }
    &.shadow{
        box-shadow: 0px 4px 4px 0px rgba(135, 135, 135, 0.1);
    }
    &.fixed{
        position:fixed !important;
        top:0;
        z-index:999;
        box-shadow:0 5px 5px rgba(0,0,0,.07);
        background:#ffffff;
    }
    &.fixed,&.white{
        .head_wrapper{
            .navigate_bar{
                a{
                    color:#141414;
                    &.current{
                        border-color: var(--mainColor);
                    }
                    &:hover{
                        color: var(--mainColor);
                        opacity:1;
                    }
                }
                .template_navi::after{
                    border-top-color: #1d1d1d;
                }
                .material_navi::after{
                    border-top-color: #1d1d1d;
                }
                .more_navi{
                    .navi_name{
                        color:#909ba7;
                    }
                    &:hover .navi_name{
                        color: var(--mainColor);
                    }
                }
            }
            .user_panel::after{
                border-color:#8c9197;
            }
            .user_head a{
                color:#3d4650;
            }
            .un_login .login{
                color:#687480;
            }
        }
    }
    &.slides{
        .navi_item{
            &.current{
                border-bottom: none !important;
            }
            &:hover{
                color: #0d7bf7 !important;
                opacity: 1 !important;
            }
        }
        .head_wrapper{
            padding-right: 20px;
        }
        .head_center{
            float:left;
            margin-left:100px;
            .navigate_bar{
                a{
                    font-size: 14px;
                }
                .navi_item.material_navi::after{
                    top: 23px;
                    right: -12px;
                    width: 6px;
                    height:6px;
                    border-left: 2px solid rgba(255,255,255,.3);
                    border-bottom: 2px solid rgba(255,255,255,.3);
                    border-top: 2px solid transparent;
                    border-right: 2px solid transparent;
                    transform: rotate(-45deg);
                }
                .navi_item.material_navi:hover::after{
                    top: 28px;
                    transform: rotate(135deg);
                }
            }
        }
        .head_right{
            .un_login{
                a{      
                    width: 60px;
                    height: 40px;
                    line-height: 40px;
                    border-radius: 5px;
                    color: #ffffff;
                    font-size: 14px;
                    &:hover{
                        opacity: 1;
                    }
                }
                .login{
                    border: 1px solid rgba(255,255,255,.2);
                    background-color: transparent;
                    &:hover{
                        border-color: #1d1d1d;
                        background-color: #1d1d1d;
                    }
                }
                .sign_up{
                    margin-left: 10px;
                    background-color: #0062FA;
                    &:hover{
                        background-color: #0151CD;
                    }
                }
            }
            .user_panel{
                min-width: auto;
                &::after{
                    display:none;
                }
                .user_head{
                    a:first-child{
                        position: relative;
                        img{
                            margin:0;
                        }
                        &::after{
                            content: '';
                            position: absolute;
                            top: auto;
                            bottom: 14px;
                            right: -3px;
                            width: 0;
                            height: 0;
                            border-left: 5px solid transparent;
                            border-right: 5px solid transparent;
                            border-top: 5px solid #cccccc;
                            transform: rotate(-45deg);
                        }
                    }
                }
            }
        }
    }
</style>