<template>
    <div class="login_contain">
        <CommonHead :options="head_options"></CommonHead>
        <div class="login_bg"></div>
        <div class="wrapper">
            <!-- 头部 -->
            <div class="login_body">
                <div class="body_frame">
                    <div class="body_wrapper">
                        <div class="login_poster_slide">
                            <template v-if="['phone', 'email', 'wechat'].indexOf(login_type) >= 0">
                                <h3>初次见面</h3>
                                <h3><span>注册一起</span>搞事情！</h3>
                            </template>
                            <template v-else>
                                <h3>欢迎回来</h3>
                                <h3><span>登录一起</span>搞事情！</h3>
                            </template>
                            <h4>在线制作，安全专业，简单高效</h4>
                        </div>
                        <LoginModal 
                            ref="LoginModal" 
                            @success_callback="login_success"
                            @type_change="change_login_type"
                        ></LoginModal>
                    </div>
                </div>
            </div>
        </div>
        <!-- 尾部 -->
        <div class="footer">粤ICP备18137964号  © 2018-2020 爆裂科技  All rights reserved</div>
    </div>
</template>
<style lang="less" scoped>
    @import url("../../assets/pc/css/common.css");
    @deep: ~'>>>';
    .login_contain{
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        min-height: 100%;
        min-width: 1240px;
        background: linear-gradient(45deg, #005fee, #50e5fc);
        text-align:center;
        overflow: auto;
        .login_bg{
            position: absolute;
            top: 0;
            left: 0;
            &::before{
                content: '';
                display: block;
                position: absolute;
                top: 0;
                left: 0;
                width: 440px;
                height: 470px;
                background: url('../../assets/pc/images/login/bg_top_left.png') no-repeat center center;
            }
            &::after{
                content: '';
                display: block;
                position: absolute;
                top: 0;
                left: 435px;
                width: 459px;
                height: 84px;
                background: url('../../assets/pc/images/login/bg_top.png') no-repeat center center;
            }
        }
        .wrapper{
            width: 100%;
            padding-bottom: 40px;
            margin-top: 60px;
            user-select: none;
        }
        .login_body{
            position: relative;
            display: flex;
            width: 100%;
            .body_frame{
                max-width: 1500px;
                min-width: 950px;
                margin: 0 auto;
                .body_wrapper{
                    display: flex;
                    justify-content: space-between;
                    position: relative;
                    min-height: 550px;
                    margin: 0 auto; 
                }
            }
        }
        .footer{
            position: relative;
            width:100%;
            padding-bottom: 32px;
            font-size:14px;
            color:#cccccc;
            text-align:center;
        }
        &::before{
            content: '';
            display: block;
            position: fixed;
            bottom: 0;
            left: 0;
            width: 356px;
            height: 280px;
            background: url('../../assets/pc/images/login/bg_bottom_left.png') no-repeat center center;
        }
        &::after{
            content: '';
            display: block;
            position: fixed;
            bottom: 0;
            right: 0;
            width: 349px;
            height: 498px;
            background: url('../../assets/pc/images/login/bg_bottom_right.png') no-repeat center center;
        }
    }
    .login_poster_slide{
        position: relative;
        width: 300px;
        margin-top: 217px;
        margin: 217px 250px 0 0;
        color: #ffffff;
        text-align: left;
        h3{
            font-size: 32px;
            font-weight: bold;
            span{
                display: inline-block;
                margin-bottom: 32px;
                font-size: 32px;
                font-weight: bold;
                border-bottom: 2px solid #ffffff;
            }
            &:last-child{
                margin-bottom: 32px;
            }
        }
        h4{
            display: block;
            font-size: 14px;
            font-weight: normal;
        }
    }
    @{deep} .common_head_contain{
        .head_right{
            display: none !important;
        }
    }
    @media screen and (min-height : 900px){
        .footer{
            position: absolute !important;
            bottom: 0;
            left: 0;
        }
    }
    @media screen and (max-height : 800px){
        .wrapper{
            margin-top: 0;
        }
    }
    @media screen and (min-width : 1400px){
        .login_poster_slide{
            margin-right: 350px;
        }
    }
    @media screen and (min-width : 1600px){
        .login_poster_slide{
            margin-right: 500px;
        }
    }
     @media only screen and (min-height : 950px){
        .wrapper{
            position: absolute;
            top: 50%;
            left: 50%;
            max-width: 1920px;
            transform: translate(-50%, -50%);
        }
        .footer{
            position: absolute !important;
            bottom: 0;
            left: 0;
        }
    }
</style>
<script>
    import CommonHead from '@/components/nav/CommonHead.vue';
    import LoginModal from '@/components/LoginModal.vue';
    export default {
        name: 'login',          //名称
        metaInfo: {
			title: '吾道-登录注册',
			meta: [
			    {
                    property: 'og:title',
                    content: '吾道-登录注册'
                },
                {
                    property: 'og:url',
                    content: 'https://www.woodo.cn/login/'
                },
			]
        },
        components: {CommonHead, LoginModal},
        created () {
            let that = this;
            if(that.$route.query.redirectUrl){
                that.redirectUrl = that.$route.query.redirectUrl
            }else{
                that.redirectUrl = '/home/'
            }
        },
        data () {
            return{
                user: null,
                head_options: {theme:'transparent'},
                login_type: 'account',
                login_modal: '', 
                redirect_url: '',
                user_name: null,
                phone: null,
                email: null,
            }
        },
        mounted () {
            let that = this;
            that.login_modal = that.$refs.LoginModal;
            that.get_user_info ()
            that.login_modal.open({
                type: that.login_type,
                className: 'module',
            })
            that.redirect_url = decodeURI(window.pathname  + window.search);
        },
        methods: {
            get_user_info () {
                let that = this;
                that.user = that.$common.get_login_state();
                if(that.user.login) that.$router.push('/home/');
            },
            login_success () {
                window.location.href = this.redirectUrl;
            },
            change_login_type (type) {
                this.login_type = type;
            },
        },
    }
</script>