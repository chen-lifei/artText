<template>
    <div class="nav-user-modal" v-if="show && user">
        <div class="user-info">
            <div class="img-wrap">
                <img :src="user.photo" alt="" />
            </div>
            <p class="username" :title="user.name">{{ user.nickname }}</p>
            <p class="content">
                <span>ID：{{user.id}}</span>
                <span>幻币余额：<strong>{{ user.hcoin }}</strong></span>
            </p>
            <!-- 会员信息 -->
            <div class="member-rank">
                <!-- 免费版 -->
                <div class="member-grade" v-if="user.memberVip === 'free'">
                    <strong>{{ user.memberVipCn }}</strong>
                    <span>开通会员尊享特权</span>
                </div>
                <div class="member-grade" :class="user.memberVip" v-else>
                    <i></i>
                    <strong>{{ user.memberVipCn }}</strong>
                    <span>到期时间：{{ user.memberVipExpire }}</span>
                </div>
                <a href="javascript:;" @click="openMemberUpgrade" class="member-upgrade" :data_track="'全部-全部-全部-右上角-头像名称-升级'">{{ user.memberVip === 'free' ? '立即开通' : '续费'}}</a>
            </div>
        </div>
        <ul class="navigation-list">
            <li v-for="item in navi_list" :key="item.key" :class="item.key">
                <router-link :to="item.route" v-bdtongji="`全部-全部-全部-右上角-头像名称-${item.name}`">{{ item.name }}</router-link>
            </li>
            <li class="log-out">
                <a href="javascript:void(0);" @click="logOut" v-bdtongji="`全部-全部-全部-右上角-头像名称-安全退出`">安全退出</a>
            </li>
        </ul>
    </div>
</template>

<script>
    /**
     *  导航消息中心弹框
     */
    export default{
        name: "NavUserModal",
        props:{
            show: {
                type: Boolean,
                default: false,
            },
            user: {
                type: Object,
                default: null
            }
        },
        data(){
            return{
                navi_list: [
                    {
                        name: '账户管理',
                        key: 'member',
                        route: '/member/'
                    }, {
                        name: '我的订单',
                        key: 'order',
                        route: '/member/order/'
                    }
                ]
            }
		},
        methods:{
            // 退出
            logOut() {
                let that = this;
                that.$axios.get("/api/logout/submit/").then(data => {
                    if(data.data.type === "success") {
						that.$toast("退出登录成功", 800);
                        if (this.$route.path.indexOf('home') > -1) {
                            window.location.reload();
                        } else {
                            that.$router.replace('/home/');
                        }
                    } else {
                        that.$toast("退出登录失败，请稍后重试", 800);
                    }
                });
            },
            // 打开会员升级弹框
            openMemberUpgrade() {
                let that = this;
                that.$modal({
                    templateType: 'memberGrade',
                    submitCallback: () => {
                        that.$emit('update');
                    }
                });
            }
        }
    }
</script>

<style lang="less" scoped>
    @user_bg: url(../../assets/pc/images/common/user_info_bg.png) no-repeat;
    .nav-user-modal{
        position: absolute;
        top: 71px;
        right: -5px;
        padding-top: 15px;
        width: 266px;
        background-color: #ffffff;
        box-shadow: 0px 6px 8px 0px rgba(0, 0, 0, 0.18);
        border-radius: 6px;
        line-height: normal;
        font-size: 12px;
        text-align: left;
        z-index: 999;
        overflow: hidden;
        cursor: default;
        .user-info{
            padding-bottom: 25px;
            .img-wrap{
                display: block;
                width: 60px;
                height: 60px;
                margin: 0 auto;
                border-radius: 50%;
                overflow: hidden;
                img{
                    display: block;
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                }
            }
            .username {
                margin: 10px auto;
                text-align: center;
                font-size: 16px;
                color: #1e1e1e;
            }
            .content{
                margin-bottom: 25px;
                text-align: center;
                font-size: 12px;
                color: #919191;
                span + span {
                    margin-left: 1.5em;
                }
                strong {
                    color: #f8870d;
                }
            }
            .member-rank {
                width: 100%;
                text-align: center;
            }
            .member-grade {
                display: inline-block;
                margin-bottom: 8px;
                height: 22px;
                padding: 0 12px;
                background-color: #e9effc;
                border-radius: 11px;
                font-size: 12px;
                color: #696969;
                strong {
                    display: inline-block;
                    vertical-align: middle;
                    height: 22px;
                    line-height: 22px;
                    margin-right: 1em;
                    color: #2b2b2b;
                }
                span {
                    display: inline-block;
                    vertical-align: middle;
                }
                i {
                    display: none;
                    vertical-align: middle;
                    width: 22px;
                    height: 22px;
                    margin-right: 5px;
                }
                &.enterprise {
                    background-color: #f7e5d2;
                    color: #815623;
                    strong {
                        color: #815623;
                    }
                    i {
                        display: inline-block;
                        background: @user_bg -144px -73px;
                    }
                }
                &.personal {
                    background-color: #eef0ff;
                    color: var(--mainColor);
                    strong {
                        color: var(--mainColor);
                    }
                    i {
                        display: inline-block;
                        background: @user_bg -109px -73px;
                    }
                }
                &.premium {
                    background-color: #f7e5d2;
                    color: #815623;
                    strong {
                        color: #815623;
                    }
                    i {
                        display: inline-block;
                        background: @user_bg -75px -74px;
                    }
                }
                &.professional {
                    background-color: #eef0ff;
                    color: var(--mainColor);
                    strong {
                        color: var(--mainColor);
                    }
                    i {
                        display: inline-block;
                        background: @user_bg -36px -74px;
                    }
                }
            }
            .member-upgrade {
                display: block;
                width: 64px;
                height: 22px;
                line-height: 22px;
                margin: 0 auto;
                background-image: linear-gradient(-31deg, #0d7bf8 0%, #3994fd 100%), linear-gradient(#0d7bf7, #0d7bf7);
                border-radius: 11px;
                font-size: 12px;
                color: #ffffff;
                text-align: center;
            }
        }
        .navigation-list{
            padding: 5px 45px;
            border-top: 1px solid #e7e7e7;
            li{
                height: 40px;
                line-height: 40px;
                a{
                    display:block;
                    font-size:12px;
                    color:#9097a1;
                    &::before {
                        content:"";
                        display:inline-block;
                        vertical-align: middle;
                        margin-top: -2px;
                        width: 20px;
                        height: 20px;
                        margin-right: 10px;
                        background: @user_bg;
                    }
                    &:hover{
                        color: var(--mainColor);
                    }
                }
                &.member a::before {
                    background-position:-75px 1px;
                }
                &.member a:hover::before {
                    background-position:-75px -40px;
                }
                &.order a::before {
                    background-position:-149px 1px;
                }
                &.order a:hover::before {
                    background-position:-149px -38px;
                }
                &.log-out a::before {
                    background-position:-113px 1px;
                }
                &.log-out a:hover::before {
                    background-position:-113px -38px;
                }
            }
        }
    }
</style>