<template>
    <div class="nav-head-main" :class="$store.getters.pageTheme">
        <div class="right">
            <!-- 制作视频按钮 -->
            <div class="procut-btn">
                <a href="https://procut.cc/" target="_blank"/>
                <span>制作视频</span>
                <base-icon class="iconhot" size="20"></base-icon>
            </div>
            <!-- 切换主题按钮 -->
            <base-button :round="true" class="theme-btn hover-primary" v-tooltip.bottom="`${$store.getters.pageTheme === 'dark' ? '日间模式' : '夜间模式'}`" @click="changeTheme()"><base-icon :class="$store.getters.pageTheme === 'dark' ? 'iconlight' : 'icondark'" size="20"></base-icon></base-button>
            <!-- 消息中心模块 -->
            <div class="message-contain" v-if="userInfo.login" @mouseenter="showMessageModal = true" @mouseleave="showMessageModal = false">
                <i class="number" v-if="unreadMessage > 0">{{ unreadMessage }}</i>
                <base-button :round="true" class="message-btn hover-primary"><base-icon class="iconring" size="20"></base-icon></base-button>
                <!-- 消息中心弹框 -->
                <nav-message-modal :show="showMessageModal" @unread="getUnreadNotification"></nav-message-modal>
            </div>
            <!-- 用户菜单模块 -->
            <div class="member-contain" v-if="userInfo.login" @mouseenter="showUserModal = true" @mouseleave="showUserModal = false">
                <base-button :round="true" class="member-btn"><img :src="$common.getUserPhoto()" alt=""/></base-button>
                <!-- 用户菜单弹框 -->
                <nav-user-modal ref="memberMenu" :show="showUserModal" :user="userInfo" @update="getUser"></nav-user-modal>
            </div>
            <!-- 登录注册模块 -->
            <div class="login-contain" v-if="!userInfo.login">
                <base-button class="login" width="60" height="30" @click="toLogin('account')">登录</base-button>
                <base-button class="sign-up" width="60" height="30" @click="toLogin('wechat')">注册</base-button>
            </div>
        </div>
        <login-modal ref="loginModal" :user="userInfo" @success_callback="loginSuccess" @get_user_info="getUser"></login-modal>
    </div>
</template>
<script>
import loginModal from '@/components/LoginModal.vue';
import NavUserModal from '@/components/nav/NavUserModal.vue';
import NavMessageModal from '@/components/nav/NavMessageModal.vue';
export default {
    name: "NavHead",
    components: { loginModal, NavUserModal, NavMessageModal },
    data() {
        return {
            userInfo: {},
            unreadMessage: 0,
            showMessageModal: false,
            showUserModal: false
        }
    },
    mounted() {
        this.getUser();
    },
    methods: {
        toggle() {
            console.log(111)
        },
        // 切换主题色
        changeTheme() {
            this.$store.commit('theme/SET_THEME', this.$store.getters.pageTheme === `dark` ? `light` : `dark`);
        },
        // 获取未读消息数
        getUnreadNotification(count) {
            this.unreadMessage = count;
        },
        // 获取用户信息
        getUser() {
            let user = this.$common.get_login_state();
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
            this.userInfo = user;
        },
        toLogin(type) {
            this.$refs.loginModal.open({ type: type });
        },
        loginSuccess() {
            this.getUser();
            this.$emit('loginCallback');
        },
    }
}
</script>
<style lang="less" scoped>
    .nav-head-main {
        width: 100%;
        height: 76px;
        padding: 0 20px;
        .left {
            float: left;
            line-height: 76px;
        }
        .right {
            float: right;
            line-height: 76px;
        }
        &.dark {
            .theme-btn,
            .message-btn {
                background-color: #303135;
            }
        }
    }
    .procut-btn {
        position: relative;
        display: inline-block;
        vertical-align: middle;
        width: 110px;
        height: 36px;
        line-height: 32px;
        background: #f7335f;
        border-radius: 10px;
        text-align: center;
        font-size: 12px;
        box-shadow: 0px 5px 10px 0px rgba(247,51,95,0.40);
        color: #ffffff;
        a {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            &:hover {
                color: #ffffff;
            }
        }
        .base-icon {
            transform: translateY(1px);
            margin-left: 7px;
            color: #f6ff00;
        }
        &:hover {
            opacity: .8;
        }
    }
    .theme-btn,
    .message-btn,
    .member-btn {
        width: 36px;
        padding: 0;
        overflow: hidden;
        background: #e3e6ec;
        vertical-align: middle;
        font-size: 12px;
    }
    .theme-btn {
        margin-left: 10px;
    }
    .message-contain,
    .member-contain {
        position: relative;
        display: inline-block;
        vertical-align: top;
        margin-left: 10px;
    }
    .member-btn img{
        width: 100%;
        height: 100%;
        image-rendering: -webkit-optimize-contrast;
    }
    .message-contain {
        .number {
            position: absolute;
            top: 14px;
            right: -4px;
            display: inline-block;
            height: 18px;
            min-width: 18px;
            line-height: 18px;
            padding: 0 3px;
            background: #fece0a;
            border-radius: 50%;
            text-align: center;
            color: #fff;
            font-size: 12px;
            user-select: none;
        }
    }
    .login-contain {
        display: inline-block;
        vertical-align: middle;
        width: 132px;
        height: 38px;
        line-height: 32px;
        border-radius: 18px;
        text-align: center;
        .base-button {
            width: 62px;
            margin-right: 0;
        }
        .login-btn:hover {
            box-shadow: none !important;
            color: var(--mainColor);
        }
    }
</style>