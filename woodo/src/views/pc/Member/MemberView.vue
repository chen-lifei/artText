<template>
    <div class="member_contain" :class="{no_power:no_power}">
        <!--头部-->
        <CommonHead ref="CommonHead" :options="{theme:'transparent'}"></CommonHead>
        <div class="function_panel user_account" v-if="!member_type">
            <router-link to="/home/" class="back">返回工作台</router-link>
            <h2 class="account_title">账户管理</h2>
            <div class="accout_information">
                <div class="user_information">
                    <label class="user_photo" for="uploadavatar" title="更换头像">
                        <img :src="user_info.headUrl" alt="头像">
                        <input type="file" id="uploadavatar" name="avatar" accept="image/gif,image/jpeg,img/jpg,img/png" @change="upload_head($event)">
                    </label>
                    <div class="user_infos">
                        <p class="user_name">
                            <span>{{user_nickname}}</span>
                            <span>ID：{{user_info.memberId}}</span>
                        </p>
                        <div class="user_hcoin">
                            幻币余额：<span>{{user_info.hcoin}}</span>
                            <button @click="open_hcoin_recharge_modal">充值幻币</button>
                            <a href="https://www.woodo.cn/slides/?url=1553258579">如何获取幻币？</a>
                        </div>
                    </div>
                </div>
                <!-- 会员信息 -->
                <div class="member_rank">
                    <!-- 免费版 -->
                    <div class="member_grade" v-if="user_info.memberRankType === 'free'">
                        <div class="rank_info">
                            <span class="rank_name">{{ user_info.memberRankTypeDesc }}</span>
                            <a href="javascript:;" @click="open_member_upgrade_modal" class="member_upgrade">升级</a>
                        </div>
                        <p>开通会员尊享特权</p>
                    </div>
                    <div class="member_grade" v-else>
                        <div class="rank_info" :class="user_info.memberRankType">
                            <i></i>
                            <span class="rank_name">{{ user_info.memberRankTypeDesc }}</span>
                            <a href="javascript:;" @click="open_member_upgrade_modal" class="member_upgrade">续费</a>
                        </div>
                        <p>到期时间：{{ user_info.memberRankExpire }}</p>
                    </div>
                </div>
            </div>
            <div class="account_form_item">
                <div class="form_item nickname">
                    <span>昵称</span>
                    <input ref="nickname" v-model="user_nickname" maxlength="6" @blur="change_nickname_event">
                </div>
                <div class="form_item">
                    <span>手机</span>
                    <p>{{user_info.mobile == null || user_info.mobile == '' ? '未设置': user_info.mobile}}</p>
                    <a href="javascript:;" v-if="user_info.mobile === null || user_info.mobile == '' " @click="change_member_type('bind_phone')">设置</a>
                    <a href="javascript:;" v-if="user_info.mobile !== null && user_info.mobile !== '' " @click="change_member_type('change_phone')">修改</a>
                </div>
                <div class="form_item">
                    <span>邮箱</span>
                    <p>{{user_info.email == ''? '未绑定' : user_info.email}}</p>
                    <a href="javascript:;" v-if="user_info.email === null || user_info.email == '' " @click="change_member_type('bind_email')">设置</a>
                    <a href="javascript:;" v-if="user_info.email !== null && user_info.email !== '' " @click="change_member_type('change_email')">修改</a>
                </div>
                <div class="form_item wechat">
                    <span>微信</span>
                    <p>{{user_info.bindWechat? '已绑定' : '未绑定'}}</p>
                    <a href="javascript:;" @click="change_wechat_bind()">{{user_info.bindWechat ? '解绑' : '绑定'}}</a>
                    <i class="tips">为了提升账户的安全性，绑定后可直接使用微信登陆吾道</i>
                </div>
                <div class="form_item">
                    <span>密码</span>
                    <p>******</p>
                    <a href="javascript:;" @click="change_member_type('change_password')">修改</a>
                </div>
            </div>
        </div>
        <!--绑定手机-->
        <div class="function_panel bind_phone_panel" v-if="member_type === 'bind_phone'">
            <a class="cancel_button" @click="change_member_type()">返回</a>
            <p class="panel_title">关联手机号</p>
            <div class="user_photo">
                <img :src="user_info.headUrl" alt="头像">
            </div>
            <span class="panel_tips">绑定后，你可以直接使用手机号登录吾道</span>
            <form id="bind_phone_form" class="bind_phone_form" action="">
                <div class="form_item" :class="test_phone">
                    <span>手机号</span>
                    <input type="tel"
                           placeholder="请输入你的手机号"
                           maxlength="11"
                           ref="mobile"
                           @blur="validate_mobile($event)"
                    >
                    <i class="wrong_input_tips" v-if="test_phone.error">{{test_phone.message}}</i>
                </div>
                <div class="form_item" :class="test_code">
                    <span>手机验证码</span>
                    <input type="text"
                           placeholder="请输入手机验证码"
                           maxlength="6"
                           ref="phone_code"
                           @input="validate_code($event.target.value)"
                    >
                    <a class="mobile_code_btn"
                       :class="{able:test_phone.success && test_password.success && can_get_code}"
                       @click="get_phone_code"
                    >{{code_btn_tip}}</a>
                    <i class="wrong_input_tips" v-if="test_code.error">手机验证码错误</i>
                </div>
                <div class="form_item" :class="test_password" v-if="!has_password">
                    <span>设置密码</span>
                    <input type="password"
                           placeholder="请输入密码"
                           maxlength="20"
                           ref="password"
                           @blur="validate_password($event)"
                    >
                    <i class="wrong_input_tips" v-if="test_password.error">{{test_password.message}}</i>
                </div>
                <a class="submit_button"
                   :class="{able:test_phone.success && test_code.success && test_password.success}"
                   @click="bind_mobile_submit"
                >确认关联</a>
            </form>
        </div>
        <!--修改手机-->
        <div class="function_panel change_phone_panel" v-if="member_type === 'change_phone'">
            <a class="cancel_button" @click="change_member_type()">返回</a>
            <form action="">
                <!--旧手机校验-->
                <div class="checked_step" v-show="change_phone_step === 'checked_old_phone'">
                    <p class="panel_title">验证原手机</p>
                    <div class="form_item" :class="{error:test_phone.error}">
                        <span>原手机号</span>
                        <input type="tel"
                               placeholder="请输入你的手机号"
                               maxlength="11" ref="old_phone"
                               @blur="validate_mobile($event)"
                        >
                        <i class="wrong_input_tips" v-if="test_phone.error">{{test_phone.message}}</i>
                    </div>
                    <div class="form_item" :class="{error: test_code.error}">
                        <input type="text"
                               placeholder="请输入手机验证码"
                               maxlength="6"
                               ref="old_phone_code"
                               @input="validate_code($event.target.value)"
                        >
                        <a class="mobile_code_btn"
                           :class="{able:test_phone.success && can_get_code}"
                           @click="get_phone_code"
                        >{{code_btn_tip}}</a>
                        <i class="wrong_input_tips" v-if="test_code.error">手机验证码错误</i>
                    </div>
                    <div class="next_step" :class="{able:test_phone.success && test_code.success}">
                        <a @click="change_phone_next">下一步</a>
                    </div>
                </div>
                <!--新手机校验-->
                <div class="checked_step" v-show="change_phone_step === 'checked_new_phone'">
                    <p class="panel_title">验证新手机</p>
                    <div class="form_item" :class="{error: test_phone.error}">
                        <span>新手机号</span>
                        <input type="tel"
                               placeholder="请输入你的手机号"
                               maxlength="11"
                               ref="new_phone"
                               @blur="validate_mobile($event)"
                        >
                        <i class="wrong_input_tips" v-if="test_phone.error">{{test_phone.message}}</i>
                    </div>
                    <div class="form_item" :class="{error: test_code.error}">
                        <input type="text"
                               placeholder="请输入手机验证码"
                               maxlength="6"
                               ref="new_phone_code"
                               @input="validate_code($event.target.value)"
                        >
                        <a class="mobile_code_btn"
                           :class="{able:test_phone.success && can_get_code}"
                           @click="get_phone_code"
                        >{{code_btn_tip}}</a>
                        <i class="wrong_input_tips" v-if="test_code.error">验证码不可为空</i>
                    </div>
                    <div class="next_step" :class="{able:test_phone.success && test_code.success}">
                        <a @click="change_mobile_submit">确认修改</a>
                    </div>
                </div>
            </form>
        </div>
        <!--绑定邮箱-->
        <div class="function_panel bind_email_panel" v-if="member_type === 'bind_email'">
            <p class="panel_title">关联邮箱</p>
            <div class="user_photo">
                <img :src="user_info.headUrl" alt="头像">
            </div>
            <span class="panel_tips">绑定后，你可以直接使用邮箱登录吾道</span>
            <form action="">
                <div class="form_item" :class="{error: test_email.error}">
                    <span>邮箱账号</span>
                    <input type="email"
                           placeholder="请输入你的邮箱账号"
                           ref="email"
                           @blur="validate_email($event)"
                    >
                    <i class="wrong_input_tips" v-if="test_email.error">{{test_email.message}}</i>
                </div>
                <div class="form_item" :class="test_code">
                    <span>邮箱验证码</span>
                    <input type="text"
                           placeholder="请输入邮箱验证码"
                           maxlength="6"
                           ref="email_code"
                           @input="validate_code($event.target.value)"
                    >
                    <a class="mobile_code_btn"
                       :class="{able:test_email.success && can_get_code}"
                       @click="get_email_code"
                    >{{code_btn_tip}}</a>
                    <i class="wrong_input_tips" v-if="test_code.error">邮箱验证码错误</i>
                </div>
                <div class="form_item" :class="test_password" v-if="!has_password">
                    <span>设置密码</span>
                    <input type="password"
                           placeholder="请输入密码"
                           maxlength="20"
                           ref="password"
                           @blur="validate_password($event)"
                    >
                    <i class="wrong_input_tips" v-if="test_password.error">{{test_password.message}}</i>
                </div>
                <a class="submit_button"
                   :class="{able:test_email.success && test_code.success && test_password.success}"
                   @click="bind_email_submit"
                >确认关联</a>
            </form>
        </div>
        <!--修改邮箱-->
        <div class="function_panel change_email_panel" v-if="member_type === 'change_email'">
            <a class="cancel_button" @click="change_member_type()">返回</a>
            <form action="">
                <!--旧邮箱校验-->
                <div class="checked_step" v-show="change_email_step === 'checked_old_email'">
                    <p class="panel_title">验证原邮箱</p>
                    <div class="form_item" :class="{error: test_email.error}">
                        <span>原邮箱</span>
                        <input type="email"
                               placeholder="请输入你的邮箱账号"
                               ref="old_email"
                               @blur="validate_email($event)"
                        >
                        <i class="wrong_input_tips" v-if="test_email.error">{{test_email.message}}</i>
                    </div>
                    <div class="form_item" :class="{error: test_code.error}">
                        <input type="text"
                               placeholder="请输入邮箱验证码"
                               maxlength="6"
                               ref="old_email_code"
                               @input="validate_code($event.target.value)"
                        >
                        <a class="mobile_code_btn"
                           :class="{able:test_email.success && can_get_code}"
                           @click="get_email_code"
                        >{{code_btn_tip}}</a>
                        <i class="wrong_input_tips" v-if="test_code.error">邮箱验证码错误</i>
                    </div>
                    <div class="next_step" :class="{able: test_email.success && test_code.success}">
                        <a @click="change_email_next">下一步</a>
                    </div>
                </div>
                <!--新邮箱校验-->
                <div class="checked_step" v-show="change_email_step === 'checked_new_email'">
                    <p class="panel_title">验证新邮箱</p>
                    <div class="form_item" :class="{error: test_email.error}">
                        <span>新邮箱</span>
                        <input type="email"
                               placeholder="请输入你的新邮箱账号"
                               ref="new_email"
                               @blur="validate_email($event)"
                        >
                        <i class="wrong_input_tips" v-if="test_email.error">{{test_email.message}}</i>
                    </div>
                    <div class="form_item" :class="{error: test_code.error}">
                        <input type="text"
                               placeholder="请输入邮箱验证码"
                               maxlength="6"
                               ref="new_email_code"
                               @input="validate_code($event.target.value)"
                        >
                        <a class="mobile_code_btn"
                           :class="{able:test_email.success && can_get_code}"
                           @click="get_email_code"
                        >{{code_btn_tip}}</a>
                        <i class="wrong_input_tips" v-if="test_code.error">邮箱验证码错误</i>
                    </div>
                    <div class="next_step" :class="{able: test_email.success && test_code.success}">
                        <a @click="change_email_submit">确认修改</a>
                    </div>
                </div>
            </form>
        </div>
        <!--修改密码-->
        <div class="function_panel change_password_panel" v-if="member_type === 'change_password'">
            <a class="cancel_button" @click="change_member_type()">返回</a>
            <p class="panel_title">设置新密码</p>
            <span class="panel_tips">亲爱的用户，请在下方输入您的新密码</span>
            <form id="change_password_form" class="change_password_form" action="">
                <div class="form_item" :class="{error: test_password.error}">
                    <input type="password"
                           placeholder="请输入原密码"
                           maxlength="20"
                           ref="passwordold"
                           @input="validate_password($event)"
                    >
                    <i class="wrong_input_tips" v-if="test_password.error">{{test_password.message}}</i>
                </div>
                <div class="form_item" :class="{error: test_new_pwd.error}">
                    <input type="password"
                           placeholder="请输入新密码"
                           maxlength="20"
                           ref="password"
                           @input="validate_password($event,'test_new_pwd')"
                    >
                    <i class="wrong_input_tips" v-if="test_new_pwd.error">{{test_new_pwd.message}}</i>
                </div>
                <div class="form_item" :class="{error: test_repeat_pwd.error}">
                    <input type="password"
                           required="required"
                           placeholder="请再次输入新密码"
                           maxlength="20"
                           ref="repassword"
                           @input="validate_password($event,'test_repeat_pwd')"
                    >
                    <i class="wrong_input_tips" v-if="test_repeat_pwd.error">{{test_repeat_pwd.message}}</i>
                </div>
                <a class="submit_button"
                   :class="{able: test_password.success && test_new_pwd.success && test_repeat_pwd.success}"
                   @click="update_password_submit"
                >确认修改</a>
            </form>
        </div>
        <!--解绑弹框-->
        <transition name="modal-fade">
            <div class="options_masking untie_wechat" v-show="showUntieModal">
                <div class="options_modal">
                    <h1>确认解除微信绑定吗？</h1>
                    <p>解绑后你将不能使用微信登录以及接收公众号消息</p>
                    <div class="modal_button">
                        <button class="submit" @click="untie_wechat">确认</button>
                        <button class="cancel" @click="close_untie_modal">取消</button>
                    </div>
                </div>
            </div>
        </transition>
        <!--绑定微信-->
        <div class="function_panel bind_wechat_panel" v-if="member_type === 'bind_wechat' || member_type === 'unbind_wechat'">
            <button class="modal-close" v-if="member_type === 'unbind_wechat'" @click="close_untie_modal"></button>
            <p class="panel_title"  v-if="member_type === 'bind_wechat'">关联微信小程序</p>
            <p class="panel_title" v-else>微信解绑</p>
            <div class="wechat_ewm">
                <img v-show="!wechat_img" class="qrcode_loading" src="~@/assets/pc/images/common/edit_loading.gif"/>
                <img class="ewm" id="weixin_qrcode_image" v-if="wechat_img" :src="wechat_img"/>
                <div class="expired_tip" v-if="ewm_expired">
                    <span>二维码已失效</span>
                    <a href="javascript:;" id="reflesh_qrcode" @click="refresh_wexin_qrcode">刷新</a>
                </div>
            </div>
            <span v-if="member_type === 'bind_wechat'">打开<i>微信</i>扫描二维码关联</span>
            <span v-if="member_type === 'bind_wechat'" style="margin-top:30px;">关联小程序后即可在小程序管理你的订单，并接收消息推送</span>
            <span v-if="member_type === 'unbind_wechat'">请使用原始微信扫码解除绑定</span>
        </div>
    </div>
</template>

<style lang="less" scoped>
    @import url("~@/assets/pc/css/common.css");
    @background_image:url(~@/assets/pc/images/member/member_sp.png) no-repeat;
    @user_bg:url(~@/assets/pc/images/common/user_info_bg.png) no-repeat;

    .member_contain{
        position:fixed;
        top:0;
        left:0;
        min-width:1240px;
        min-height:700px;
        width:100%;
        height:100%;
        background:url(~@/assets/pc/images/common/display_bg.jpg) center no-repeat;
        background-size:cover;
        overflow-y:auto;

        /*功能面板*/
        .function_panel{
            position:absolute;
            top:50%;
            left:50%;
            width:940px;
            height:560px;
            margin:-240px 0 0 -470px;
            border-radius:4px;
            background:#ffffff;
            font-size:0;
            text-align:center;
            border-radius: 4px;
            box-shadow:0 0 10px 2px rgba(0,0,0,0.1);
            .panel_title{
                position:absolute;
                top:-72px;
                left:0;
                width:100%;
                height:72px;
                line-height:72px;
                font-size:28px;
                font-weight:100;
                color:#ffffff;
            }
            .panel_tips{
                display:inline-block;
                height:18px;
                line-height:18px;
                font-size:12px;
                color:#797979;
            }
        }

        form{
            width:342px;
            margin:0 auto;
            overflow:hidden;
            .form_item{
                position:relative;
                width:342px;
                height:42px;
                margin-top:28px;
                border:1px solid #eaeaea;
                border-radius:4px;
                text-align:left;
                &.error{
                    border-color:#ff7272;
                    .wrong_input_tips{
                        display:inline-block;
                    }
                }
            }
            .clear_input{
                position:absolute;
                top:13px;
                right:10px;
                display:none;
                width:15px;
                height:15px;
                background:@background_image -221px -200px;
                cursor:pointer;
            }
            .show_password{
                position:absolute;
                top:14px;
                right:20px;
                display:none;
                width:15px;
                height:12px;
                background:@background_image;
                cursor:pointer;
            }
            .wrong_input_tips{
                position:absolute;
                bottom:-23px;
                left:0;
                display:none;
                height:22px;
                line-height:22px;
                padding-left:22px;
                font-size:12px;
                color:#ff7272;
                &:before{
                    content:"";
                    position:absolute;
                    left:4px;
                    top:5px;
                    display:inline-block;
                    width:13px;
                    height:13px;
                    background:#ffffff @background_image -119px -200px;
                }
            }
        }
        input{
            &::-webkit-input-placeholder{color:#d4d4d4;}
            &:-moz-placeholder{color:#d4d4d4;}
            &::-moz-placeholder{color:#d4d4d4;}
            &:-ms-input-placeholder{color:#d4d4d4;}
            &:valid + .clear_input{
                display:inline-block;
            }
            &:valid + .show_password{
                display:inline-block;
            }
            &:valid + .show_password{
                background-position: -186px -197px;
            }
            &[type=password]:valid + .show_password{
                background-position: -152px -200px;
            }
        }
        .submit_button{
            display:inline-block;
            width:342px;
            height:50px;
            line-height:50px;
            margin-top:30px;
            border-radius:4px;
            background:#d7d7d7;
            font-size:18px;
            color:#ffffff;
            &.able{
                background:var(--mainColor);
            }
        }
        .cancel_button{
            display:inline-block;
            position:absolute;
            left:35px;
            top:15px;
            font-size:16px;
            color:#fa5959;
            &:before{
                content: "<";
                position: relative;
                top: 3px;
                margin: 0 5px 0 0;
                opacity: 0.8;
                font-size: 26px;
            }
        }
    }
    /*我的账户*/
    .user_account{
        .account_title{
            position: absolute;
            font-size: 20px;
            left: 0;
            top: -40px;
            right: 0;
            bottom: 0;
            margin: auto;
            color: #fff;
        }
        .back{
            position: absolute;
            top: -42px;
            left: 0;
            height: 42px;
            line-height: 42px;
            padding-left: 20px;
            text-align:left;
            font-size: 14px;
            font-weight: 100;
            color: #fffefe;
            cursor: pointer;
            z-index:10;
            &:before{
                content: "<";
                position: absolute;
                left: 0;
                transform: scale(0.5);
                margin: 0 5px 0 0;
                font-size: 26px;
                font-weight: bold;
            }
        }
        .accout_information{
            position: relative;
            width: 100%;
            height: 120px;
            padding: 0 55px;
            background-color: #ebf1ff;
            border-top-right-radius: 4px;
            border-top-left-radius: 4px;
        }
        .user_information{
            float: left;
            width: auto;
            height: 100%;
            padding: 20px 0;
            text-align: left;
            .user_photo{
                display: inline-block;
                vertical-align: middle;
                margin-right: 20px;
                width: 80px;
                height: 80px;
                border-radius: 50%;
                overflow: hidden;
                cursor:pointer;
                img {
                    display: block;
                    width:100%;
                    height:100%;
                    object-fit: cover;
                }
                input[type="file"] {
                    display: none;
                }
            }
            .user_infos{
                display: inline-block;
                vertical-align: middle;
                font-size: 24px;
                color: #212020;
                .user_name{
                    margin-left: -2px;
                    margin-bottom: 10px;
                    span{
                        margin-right: 20px;
                        &:last-child{
                            margin-right: 0;
                            font-size: 12px;
                            color: #000000;
                        }
                    }
                }
                .user_hcoin{
                    font-size: 12px;
                    color: #535862;
                    span{
                        color: #f14e43;
                        margin-right: 15px;
                    }
                    button{
                        margin-right: 20px;
                        font-size: 12px;
                        color: var(--mainColor);
                        transition: opacity .3s;
                        &:hover{
                            opacity: .7;
                        }
                    }
                    a{
                        color: var(--mainColor);
                        text-decoration: underline;
                    }
                }
            }
        }
        .member_rank{
            float: right;
            width: auto;
            height: 100%;
            padding: 30px 0;
            text-align: right;
            font-size: 12px;
            color: #92a0b0;
            .rank_info {
                height: 26px;
                margin-bottom: 10px;
                i {
                    display: none;
                    vertical-align: middle;
                    width: 22px;
                    height: 22px;
                    margin-right: 4px;
                }
                .rank_name {
                    display: inline-block;
                    vertical-align: middle;
                    font-weight: bold;
                }
                .member_upgrade {
                    display: inline-block;
                    vertical-align: middle;
                    margin-left: 15px;
                    width: 50px;
                    height: 26px;
                    line-height: 26px;
                    background-image: linear-gradient(-37deg,#0d7bf7,#07b4ff),linear-gradient(#169bd5,#169bd5);
                    border-radius: 20px;
                    color: #fefefe;
                    text-align: center;
                }
                &.enterprise {
                    color: #815623;
                    .rank_name {
                        color: #815623;
                    }
                    i {
                        display: inline-block;
                        background: @user_bg -144px -73px;
                    }
                }
                &.personal {
                    color: #004eff;
                    .rank_name {
                        color: #004eff;
                    }
                    i {
                        display: inline-block;
                        background: @user_bg -109px -73px;
                    }
                }
                &.premium {
                    color: #815623;
                    .rank_name {
                        color: #815623;
                    }
                    i {
                        display: inline-block;
                        background: @user_bg -75px -74px;
                    }
                }
                &.professional {
                    color: #004eff;
                    .rank_name {
                        color: #004eff;
                    }
                    i {
                        display: inline-block;
                        background: @user_bg -36px -74px;
                    }
                }
            }
        }
        .account_form_item{
            margin-top: 71px;
        }
        .user_photo_panel{
            position: relative;
            .user_photo{
                display:block;
                width:106px;
                height:106px;
                border-radius:106px;
                margin:-53px auto 15px;
                overflow:hidden;
                background: #fff;
                border:4px solid #fff;
                img{
                    min-width:100%;
                    min-height:100%;
                    width:100%;
                    cursor:pointer;
                }
                &:hover .tooltip{
                    opacity: 1;
                    visibility: visible;
                }
            }
            .tooltip{
                position: absolute;
                display: block;
                left: 57%;
                top: 39px;
                padding: 5px 9px;
                opacity: 0;
                visibility: hidden;
                z-index:200;
                border-radius:2px;
                background-color: #141010;
                font-size: 12px;
                color: #fff;
                transition: opacity .2s;
                &::before{
                    content:"";
                    position:absolute;
                    top:9px;
                    left:-5px;
                    width:0;
                    height:0;
                    border:5px solid;
                    border-left-width:0;
                    border-color:transparent #141010;
                }
            }
            p{
                margin-bottom:55px;
                font-size: 12px;
                color:#aeaeae;
            }
        }
        .form_item{
            display:block;
            position:relative;
            width:auto;
            margin:0 auto 22px;
            span{
                display:inline-block;
                vertical-align:middle;
                margin-right:10px;
                color:#909090;
                font-size:14px;
            }
            p{
                display:inline-block;
                vertical-align:middle;
                width:340px;
                height:40px;
                line-height:40px;
                border:1px solid #eaeaea;
                border-radius:4px;
                font-size:14px;
                color:#676767;
            }
            a{
                display:inline-block;
                vertical-align:middle;
                margin-left:11px;
                font-size:14px;
                color:var(--mainColor);
                &.email_validate{
                    right: -78px;
                }
            }
            i{
                display:block;
                margin-top:3px;
                font-size:12px;
                color:#aeaeae;
            }
            &.nickname{
                input{
                    display:inline-block;
                    vertical-align:middle;
                    width:340px;
                    height:40px;
                    line-height:40px;
                    text-align:center;
                    background-color: #fff9db;
                    border: solid 1px #eaeaea;
                    border-radius:4px;
                    font-size:14px;
                    color:#c89e4d;
                    margin-right: 39px;
                }
            }
        }
        .wechat p{
            background:#2ed681;
            color:#fff;
        }
    }
    /*绑定手机、邮箱*/
    .bind_phone_panel, .bind_email_panel{
        .user_photo{
            display:block;
            width:98px;
            height:98px;
            border-radius:98px;
            margin:27px auto 64px;
            overflow:hidden;
            img{
                min-width:100%;
                min-height:100%;
                width:100%;
            }
        }
        .form_item{
            span{
                display:inline-block;
                width:92px;
                height:40px;
                line-height:40px;
                padding-left:10px;
                border-right:1px solid #eaeaea;
                font-size:14px;
                color:#676767;
                vertical-align:top;
            }
            input{
                display:inline-block;
                width:248px;
                height:40px;
                line-height:40px;
                padding-left:12px;
                font-size:14px;
                color:#666666;
                vertical-align:top;
            }
            &:nth-child(2) input{
                width:146px;
            }
            a{
                display:inline-block;
                width:102px;
                height:40px;
                line-height:40px;
                border-top-right-radius:4px;
                border-bottom-right-radius:4px;
                background:#ebebeb;
                font-size:14px;
                color:#747474;
                text-align:center;
                vertical-align:top;
                &.able{
                    color:#fff;
                    background:var(--mainColor);
                }
            }
        }
    }
    /*修改手机、邮箱*/
    .change_phone_panel, .change_email_panel{
        .checked_step{
            .panel_title{
                position:static;
                height:142px;
                line-height:160px;
                font-size:28px;
                color:#262626;
            }
            .form_item{
                span{
                    display:inline-block;
                    width:92px;
                    height:40px;
                    line-height:40px;
                    padding-left:10px;
                    border-right:1px solid #eaeaea;
                    font-size:14px;
                    color:#676767;
                    vertical-align:top;
                    user-select:none;
                }
                input{
                    display:inline-block;
                    height:40px;
                    line-height:40px;
                    padding-left:12px;
                    font-size:14px;
                    color:#666666;
                    vertical-align:top;
                }
                &:nth-child(2) input{
                    width:248px;
                }
                &:nth-child(3) input{
                    width:238px;
                }
                a{
                    display:inline-block;
                    width:102px;
                    height:40px;
                    line-height:40px;
                    background:#ebebeb;
                    font-size:14px;
                    color:#747474;
                    text-align:center;
                    vertical-align:top;
                    &.able{
                        color:#ffffff;
                        background:var(--mainColor);
                    }
                }
            }
            .next_step{
                width:340px;
                height:50px;
                line-height:50px;
                margin-top:48px;
                border-radius:4px;
                background:#d7d7d7;
                font-size:18px;
                color:#ffffff;
                &.able{
                    background:var(--mainColor);
                }
            }
        }
    }
    /*修改密码*/
    .change_password_panel{
        &:before{
            content:"";
            display:block;
            width:94px;
            height:122px;
            margin:38px auto 26px;
            background:@background_image -5px -200px;
        }
        .form_item{
            input{
                display:inline-block;
                width:340px;
                height:40px;
                line-height:40px;
                padding-left:14px;
                font-size:14px;
                color:#666666;
                vertical-align:top;
            }
        }
    }
    /*解绑弹框*/
    .options_masking{
		position: fixed;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		text-align: center;
		background-color: rgba(0, 0, 0, 0.502);
		font-size: 16px;
        color: #666666;
        &:after{
            content: "";
            display: inline-block;
            vertical-align: middle;
            width: 0;
            height: 100%;
        }
        .options_modal{
            display: inline-block;
            vertical-align: middle;
            width: 500px;
            height: 290px;
            margin: 0 auto;
            padding: 55px 30px 28px;
            background-color: #fff;
            border-radius: 4px;
            text-align: center;
            &:before{
                content:"";
                display:block;
                width:48px;
                height:48px;
                margin:0 auto 15px;
                background:@background_image -112px -224px;
            }
            h1{
                font-size:18px;
                font-weight:500;
                color:var(--mainColor);
            }
            p{
                margin:12px 0 56px;
                font-size:14px;
                color:#565656;
            }
            button{
                width:100px;
                height:40px;
                line-height:40px;
                font-size:14px;
                text-align:center;
                border-radius:4px;
                &.submit{
                    margin-right:21px;
                    color:#686868;
                    border:1px solid #e4e4e4;
                }
                &.cancel{
                    border:0;
                    background:var(--mainColor);
                    color:#fff;
                }
            }
        }
    }
    /*微信扫码界面*/
    .bind_wechat_panel{
        padding-top:55px;
        &.function_panel{
            .panel_title{
                position:static;
                height:142px;
                line-height:142px;
                color:#262626;
            }
        }
        .modal-close{
            position: absolute;
            top: 20px;
            right: 20px;
        }
        span{
            display:block;
            text-align:center;
            color:#797979;
            font-size:12px;
            &:nth-child(2){
                margin-top:44px;
            }
            i{
                font-size:12px;
                color:var(--mainColor);
                font-style:normal;
            }
        }
        .wechat_ewm{
            position:relative;
            width:162px;
            height:162px;
            margin:0 auto 12px;
            background-color:#ffffff;
            border-radius:4px;
            border:solid 1px rgba(0, 0, 0, 0.1);
        }
        .ewm{
            width:160px;
            height:160px;
        }
        .qrcode_loading {
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            margin: auto;
            width: 50%;
            height: 50%;
        }
        .expired_tip{
            position:absolute;
            top:1px;
            left:1px;
            width:100%;
            height:100%;
            box-sizing:border-box;
            background-color:rgba(0,0,0,.6);
            padding:45px 0;
            text-align:center;
            font-size:14px;
            span{
                color:white;
            }
            a{
                display:inline-block;
                width:80px;
                height:30px;
                line-height:30px;
                margin:20px auto 0;
                color:white;
                background-color:var(--mainColor);
                &:hover{
                    opacity:0.8;
                }
            }
        }
    }
</style>

<script>
    import Vue from 'vue';
    import QRCode from 'qrcode';
	import CommonHead from '@/components/nav/CommonHead.vue';
    import checkapi from '@/assets/common/js/checkapi.js';
    Vue.use(QRCode)
    export default{
        metaInfo: {
			title: '吾道-我的账户',
			meta: [
			    {
                    property: 'og:title',
                    content: '吾道-我的账户'
                },
                {
                    property: 'og:url',
                    content: 'https://www.woodo.cn/member/'
                },
			]
		},
        components:{CommonHead},
        data(){
            return {
                /*用户信息面板相关*/
                img_type:{
                    accept: 'image/jpeg, image/png, image/jpg',
                },
                member_type:'',             // 个人中心展示面板标识
                user:{},                    // 用户登录信息
                user_info:{},               // 用户信息
                has_password: false,        // 是否已有账号密码标识
                user_nickname:"",           // 用户昵称
                nickname_active: false,     // 昵称修改激活状态

                /*微信相关*/
                showUntieModal:false,               // 解绑相关
                bind_weixin_success: '',            // 微信绑定相关
                weixin_qrcode_expire:true,          // 是否已过期，默认已过期
                weixin_qrcode_expire_time:5*60,     // 5分钟过期
                weixin_qrcode_expire_timeer:"",     // 微信二维码过期定时器，时刻检测过期
                weixin_qrcode_timeer:"",            // 微信二维码登录定时器，时刻检测登录
                wechat_img:"",                      // 公众号二维码
                ewm_expired: false,                 // 二维码过期
                poling_code:"",                     // 小程序扫码轮询code

                /*邮箱相关*/
                change_email_step: 'checked_old_email',     // 修改邮箱步骤
                test_email:{
                    error: false,
                    success: false,
                    message: '',
                    exist:false,
                },                // 邮箱校验结果

                /*手机相关*/
                bind_mid:"SMS_150742973",                   // 绑定手机 mid
                find_mid:'SMS_150742979',                   // 查找手机 mid
                change_phone_step: 'checked_old_phone',     // 修改手机号步骤
                test_phone:{
                    error: false,
                    success: false,
                    message: '',
                    exist:false,
                },                // 手机校验结果

                /*密码相关*/
                test_password:{
                    error: false,
                    success: false,
                    message:''
                },             // 密码校验结果
                test_new_pwd:{
                    error: false,
                    success: false,
                    message: ''
                },              // 新密码校验结果
                test_repeat_pwd:{
                    error: false,
                    success: false,
                    message: ''
                },           // 重复新密码校验

                /*验证码相关*/
                code_btn_tip: "获取验证码",                  // 获取验证码文本
                can_get_code: true,                         // 能否获取验证码标识
                countdown:60,                               // 获取验证码倒计时
                code_interval: null,                        // 获取验证码倒数计时器
                test_code: {
                    error: false,
                    success: false,
                },                           // 验证码校验结果

                /*无权限相关*/
                no_power: false,

                valid_error:false,
                input_index:"",
                valid_succ:false,
                error_message:"",
            }
        },
        methods:{
            /*我的账户面板*/
            // 获取用户个人信息
            get_user_info:function(){
                let that = this;
                that.$axios.get("/api/member/information/").then(function(data){
                    if(data.data.code !== '2') {
                        return;
                    }
                    let user_info = data.data.data;
                    user_info.memberRankExpire = utils.dateFormat(new Date(Number(user_info.memberRankExpire)), 'yyyy-MM-dd');
                    that.user_info = user_info;
                    that.user_nickname =  user_info.nickName;
                    // 判断是否拥有账号密码
                    let no_email = $validate(that.user_info.email).empty(),
                        no_phone = $validate(that.user_info.mobile).empty();
                    if(!no_email && !no_phone) {
                        that.has_password = true;
                    }
                })
            },
            // 更换个人中心界面
            change_member_type: function(type){
                let that = this;
                if(type){
                    location.href= '/member/?type=' + type;
                }else{
                    location.href='/member/';
                }
            },
            // 更换头像
            upload_head: function(e){
                let that = this;
                if (e.target.files.length === 0) {
                    return;
                }
                let file = e.target.files[0];
                // 校验格式
                if(that.img_type.accept.indexOf(file.type) < 0) return that.$toast("只支持jpg，png文件格式！",1000);
                // 校验图片大小
                if(!that.checkSize(file, true, 1)) return;
                let image = new FormData();
                image.append('file', file);
                that.$axios({
                    url: '/api/member/uploadhead/',
                    headers: { 'Content-Type': 'multipart/form-data' },
                    method: 'post',
                    data:image,
                    dataType:'file'
                }).then(function(data){
                    if(data.data.code === '2'){
                        that.$toast("修改成功",1500);
                        that.user_info.headUrl = data.data.data;
                        that.$refs.CommonHead.user.photo = data.data.data;
                    }else{
                        that.$toast(data.data.content,1500);
                    }
                });
            },
            // 检查头像文件大小
            checkSize:function(file, showAlert, max_size) {
                let that = this;
                if(!max_size)
                    max_size = 3;
                let max_file_size = max_size * 1024 * 1024;
                if(file && file.size) {
                    let size = file.size;
                    if(size > max_file_size) {
                        if(showAlert)
                            that.$toast("上传图片文件过大，请上传小于" + max_size + "M的文件！",2000);
                        return false;
                    }
                }
                return true;
            },
            // 昵称输入框激活事件
            nickname_active_event: function(type){
                this.nickname_active = type;
                this.$nextTick(()=>{
                    this.$refs.nickname.focus();
                })
            },
            // 修改昵称事件
            change_nickname_event: function(){
                let that = this,
                    name = that.$refs.nickname.value,
                    str_reg = /^[a-zA-Z0-9_\-\u4e00-\u9fa5]+$/;
                if(name === ''){
                    that.$toast("昵称不能为空哦！",2000);
                    return;
                }
                if(name.length > 6){
                    that.$toast("不能超过6个字符哦~",2000);
                    return;
                }
                if(!str_reg.test(name)){
                    that.$toast("昵称不能含有特殊字符！",2000);
                    return;
                }
                if(name === that.user_info.nickName){
                    that.nickname_active = false;
                    return;
                }
                that.$axios.get("/api/register/check_nickName/",{params:{nickName:name}})
                .then(function(data){
                    if(data.data.code === '2'){
                        that.$axios.post('/api/member/chang_member_nickname',{
                            nickName: that.$refs.nickname.value
                        }).then(function(data){
                            if(data.data.type === 'success'){
                                that.$toast("昵称修改成功",2000);
                                setTimeout(() => {
                                    that.nickname_active = false;
                                }, 1000);
                                that.$refs.nickname.blur();
                                that.$set(that.user_info, 'nickName', that.$refs.nickname.value);
                                utils.setCookies('woodo_memberNickName',that.$refs.nickname.value);
                                that.$refs.CommonHead.getUser();
                            }else{
                                that.$toast("昵称修改失败",2000);
                                that.nickname_active = false;
                            }
                        });   
                    }else{
                        that.$toast("该昵称已被注册，请换一个吧~",2000);
                    }
                });
            },
            // 打开幻币充值
            open_hcoin_recharge_modal: function(){
                let that = this;
                that.$modal({
                    templateType: 'hcoinRecharge',
                    hcoin: that.user_info.hcoin,
                    submitCallback: (() => {
                        that.get_user_info();
                    })
                });
            },

            /*微信相关*/
            // 微信登录的统一管理
            bind_weixin:function(){
                let that = this;
                //1微信绑定二位生成
                //获取微信登录二维码
                that.get_weixin_login_qrcod();
                //启动扫描登录检测定时器
                that.weixin_qrcode_expire_timeer=setInterval(that.weixin_login_check,1500);
                //2二维过期定时器，二维码5分钟过期，
                that.weixin_qrcode_timeer=setInterval(function(){
                    that.weixin_qrcode_expire_time--;
                    if(that.weixin_qrcode_expire_time<=0){
                        clearInterval(that.weixin_qrcode_expire_timeer);
                        clearInterval(that.weixin_qrcode_timeer);
                        that.ewm_expired = true;
                    }
                },1000);
            },
            //二维码刷新
            refresh_wexin_qrcode: function(){
                let that = this;
                //清除定时器
                clearInterval(that.weixin_qrcode_expire_timeer);
                //重新获取
                that.weixin_qrcode_expire_timeer=setInterval(that.weixin_login_check,1500);
                //获取微信登录二维码
                that.get_weixin_login_qrcod();
            },
            // 小程序码扫码检测
            weixin_login_check:function(){
                let that = this,
                    sceneType = that.member_type === 'bind_wechat' ? 'binding' : 'unBinding';
                if(!that.weixin_qrcode_expire){      
                  that.$axios.get("/api/weixin/app/check_scan/",{params:{sceneType:sceneType,polingCode:that.poling_code}})
                      .then(function(data){
                      if(data.data.type === "success"){
                          clearInterval(that.weixin_qrcode_expire_timeer);
                          clearInterval(that.weixin_qrcode_timeer);
                          that.weixin_qrcode_expire = true;
                          if(sceneType == 'binding'){
                              that.$toast("绑定成功~",2000);
                              setTimeout(function(){
                                  location.href= '/member/';
                              },2000);                            
                          }else{
                              that.$toast("解绑成功",1000);
                              that.showUntieModal = false;
                              that.member_type = undefined;
                              that.$set(that.user_info,"bindWechat", false);
                          }
                      } else if(data.data.type === "error" && data.data.code === "3"){
                          clearInterval(that.weixin_qrcode_expire_timeer);
                          clearInterval(that.weixin_qrcode_timeer);
                          that.$toast(data.data.content,5000);
                          that.ewm_expired = true;
                      }
                  });
                }
            },
            // 获取小程序码
            get_weixin_login_qrcod:function(){
                let that = this,
                    sceneType = that.member_type === 'bind_wechat' ? 'binding' : 'unBinding';
                that.$axios.get("/api/weixin/app/create_app_code/",{params:{sceneType :sceneType}})
                    .then(function(data){
                        if(data.data.code === '2'){
                            //获取图片
                            that.wechat_img = "data:image/png;base64,"+data.data.data.image;
                            that.poling_code = data.data.data.polingCode;
                            that.weixin_qrcode_expire = false;
                            that.weixin_qrcode_expire_time = 5*60;
                            that.ewm_expired = false;
                        }else{
                            that.$toast(data.data.content,1500);
                            that.ewm_expired = true;
                            clearInterval(that.weixin_qrcode_timeer);
                        }
                    });
            },
            // 解绑微信
            untie_wechat:function(){
                let that = this;
                if(utils.getCookies('woodo_memberMobile') == null && utils.getCookies('woodo_memberEmail') == null){
                    that.showUntieModal = false;
                    return that.$toast("未绑定邮箱或手机，不可解绑哦！",2000);
                } 
                that.member_type = 'unbind_wechat';
                that.bind_weixin();
            },
            // 修改微信绑定事件
            change_wechat_bind:function(){
                let that = this;
                if(that.user_info.bindWechat){
                    that.showUntieModal = true;
                }else{
                    that.change_member_type('bind_wechat')
                }
            },
            // 关闭解绑弹框
            close_untie_modal:function(){
                let that = this;
                that.showUntieModal = false;
                that.member_type = undefined;
                clearInterval(that.weixin_qrcode_expire_timeer);
                clearInterval(that.weixin_qrcode_timeer);
            },

            /*手机相关*/
            // 校验手机是否可用
            validate_mobile:function(e){
                let that = this,
                    value = e.target.value.replace(/(^\s*)|(\s*$)/g, ""),
                    phone_reg = /^1\d{10}$/;
                if(value.length <= 0 || value === ''){
                    that.test_phone.error = true;
                    that.test_phone.success = false;
                    that.test_phone.message = "手机号码不可为空";
                    return false;
                }else if(value.length !== 11){
                    that.test_phone.error = true;
                    that.test_phone.success = false;
                    that.test_phone.message = "请输入正确的手机号码~";
                    return false;
                }else if(!phone_reg.test(value)){
                    that.test_phone.error = true;
                    that.test_phone.success = false;
                    that.test_phone.message = "请输入正确的手机号码~";
                    return false;
                }else if(that.change_phone_step === 'checked_new_phone' && value == that.user.mobile){
                    that.test_phone.error = true;
                    that.test_phone.success = false;
                    that.test_phone.message = "不可输入当前手机号~";
                    return false;
                }else if(that.change_phone_step === 'checked_old_phone' && that.user.mobile !== '' && value !== that.user.mobile){
                    that.test_phone.error = true;
                    that.test_phone.success = false;
                    that.test_phone.message = "请输入当前已绑定的手机号码";
                }else{
                    that.useful_phone(value,function(result){
                        if(result){
                            // 手机号未被注册
                            if(that.member_type === 'bind_phone' || that.change_phone_step === 'checked_new_phone'){
                                that.test_phone.error = false;
                                that.test_phone.success = true;
                                that.test_phone.message = '';
                                that.test_phone.exist = false;
                            }else if(that.change_phone_step === 'checked_old_phone'){
                                that.test_phone.error = true;
                                that.test_phone.success = false;
                                that.test_phone.exist = false;
                                that.test_phone.message = '该手机号码未注册'
                            }
                        }else{
                            //验证原手机号
                            if(that.change_phone_step === 'checked_old_phone' && that.user.mobile !== ''){
                                that.test_phone.error = false;
                                that.test_phone.success = true;
                                that.test_phone.message = '';
                            }else{
                              that.test_phone.error = true;
                              that.test_phone.exist = true;
                              that.test_phone.success = false;
                              that.test_phone.message = '该手机号已被绑定';                              
                            }
                        }
                    });
                }
            },
            // 校验手机号是否使用
            useful_phone:function(value,callback){
                let that = this,
                    result;
                that.$axios.get("/api/register/check_mobile/",{params:{mobile:value}})
                    .then(function(data){
                        if(data.data.code === '2'){
                            result = true;
                        }else{
                            result = false;
                        }
                        if(typeof callback === 'function') callback(result);
                    })
            },
            // 关联手机号（首次）
            bind_mobile_submit:function(){
                let that = this,
                    code = that.$refs.phone_code.value,
                    phone = that.$refs.mobile.value,
                    password = that.$refs.password.value,
                    test_phone = that.test_phone.success,
                    test_pwd = that.test_password.success,
                    test_code = that.test_code.success,
                    test_exist = that.test_phone.exist;
                if(test_phone && test_code && test_pwd){
                    if(test_exist){
                        that.$toast("该手机号已被绑定",2000);                   
                    }else{
                        that.bind_mobile_submit_post(phone,code,password);
                    }
                }
            },
            //关联手机号（首次） -提交
            bind_mobile_submit_post:function(phone,code,password){
                var that = this;
                if(that.has_password){
                    that.$axios.post("/api/member/bind_mobile_submit/",{
                        mid: that.bind_mid,
                        mobile: phone,
                        code:code
                    })
                        .then(function(data){
                            if (data.data.code === '2') {
                                that.$toast("关联成功",2000);
                                setTimeout(function(){location.href = '/member/';},2000);
                            } else {
                                that.$toast(data.data.content,3000);
                            }
                        })
                }else{
                    that.$axios.get("/api/common/public_key/")
                        .then(function(data){
                            let RsaKey = that.$rsa,
                                Base64 = that.$base64,
                                rsakey = new RsaKey(),
                                base64 = new Base64(),
                                modulus = data.data.modulus,
                                exponent = data.data.exponent;
                            rsakey.setPublic(base64.b64tohex(modulus), base64.b64tohex(exponent));
                            let enPassword = base64.hex2b64(rsakey.encrypt(password));
                            that.$axios.post("/api/member/bind_mobile_submit/",{
                                mid: that.bind_mid,
                                mobile: phone,
                                code:code,
                                enPassword: enPassword
                            })
                                .then(function(data){
                                    if (data.data.code === '2') {
                                        that.$toast("关联成功",2000);
                                        setTimeout(function(){location.href = '/member/';},2000);
                                    } else {
                                        that.$toast(data.data.content,1000);                                      
                                    }
                                })
                        });
                }
            },
            // 修改手机号 - 验证旧手机
            change_phone_next:function(){
                let that = this,
                    phone = that.$refs.old_phone.value,
                    code = that.$refs.old_phone_code.value,
                    mid = that.bind_mid;
                // 校验验证码
                that.validate_code(code);
                // 判断前置条件正确时触发
                if(that.test_phone.success && that.test_code.success){
                    checkapi.change_mobile_submit_post({mid:mid,phone:phone,code:code,type:'oldMobile',
                        success: data => {
                            that.change_phone_step = 'checked_new_phone';
                            clearInterval(that.code_interval);
                            that.countdown = 60;
                            that.can_get_code = true;
                            that.test_phone = {
                                error: false,
                                success: false,
                                message: ''
                            };
                            that.test_code = {
                                error: false,
                                success: false,
                            };
                            that.code_btn_tip = '获取验证码';
                        },
                        fail: data => {
                            that.$toast(data.data.content,3000);
                            if(data.data.content.indexOf('验证码') >= 0){
                                that.test_code.error = true;
                                that.test_code.success = false;
                            }
                        }
                    },that);
                }
            },
            // 修改手机号 - 验证新手机
            change_mobile_submit:function(){
                let that = this,
                    phone = that.$refs.new_phone.value,
                    code = that.$refs.new_phone_code.value,
                    mid = that.bind_mid;
                // 校验验证码
                that.validate_code(code);
                // 判断前置条件正确时触发
                if(that.test_phone.success && that.test_code.success){
                    if(that.test_phone.exist){
                        that.$toast("该手机号已被注册",2000);                     
                    }else{
                        that.change_mobile_submit_post(mid,phone,code,'newMobile');
                    }
                }
            },
            change_mobile_submit_post:function(mid,phone,code,type){
                var that = this;
                checkapi.change_mobile_submit_post({mid:mid,phone:phone,code:code,type:type,
                    success: data => {
                      that.$toast('关联成功',2000);
                      setTimeout(function(){location.href = '/member/';},2000);
                    },
                    fail: data => {
                        that.$toast(data.data.content,3000);
                        if(data.data.content.indexOf('验证码') >= 0){
                            that.test_code.error = true;
                            that.test_code.success = false;
                        }
                    }
                },that);
            },
            /*验证码相关*/
            // 获取手机验证码
            get_phone_code:function(){
                let that = this,
                    type = that.change_phone_step,
                    mid  = that.member_type === 'bind_phone' || that.member_type === 'change_phone' ? that.bind_mid : that.find_mid,
                    phone;
                // 判断前置条件
                if(!that.test_phone.success || !that.can_get_code) return false;
                // 判断邮箱账号
                if(that.member_type === 'bind_phone'){
                    phone = that.$refs.mobile.value;
                }else if(type === 'checked_old_phone'){
                    phone = that.$refs.old_phone.value;
                }else{
                    phone = that.$refs.new_phone.value;
                }
                // 发送请求
                that.$axios.post("/api/common/mobile_code_ext/",{mid: mid, mobile: phone,})
                    .then(function(data){
                        that.$toast(data.data.content,1500);
                        if(data.data.code === '2'){
                            that.code_interval = setInterval(function(){that.get_code_timeout()},1000);
                        }
                    })
            },
            // 获取邮箱验证码
            get_email_code:function(){
                let that = this,
                    is_old = that.change_email_step === 'checked_old_email',
                    mid = that.bind_mid,
                    email, en_email;
                // 判断前置条件
                if(!that.can_get_code || !that.test_email.success) return false;
                // 判断邮箱账号
                if(that.member_type === 'bind_email'){
                    email = that.$refs.email.value;
                }else if(that.change_email_step === 'checked_old_email'){
                    email = that.$refs.old_email.value;
                }else{
                    email = that.$refs.new_email.value;
                }
                // 发送请求
                that.$axios.get("/api/common/public_key/").then(function(data){
                    let RsaKey = that.$rsa,
                        Base64 = that.$base64,
                        rsakey = new RsaKey(),
                        base64 = new Base64(),
                        modulus = data.data.modulus,
                        exponent = data.data.exponent;
                    rsakey.setPublic(base64.b64tohex(modulus), base64.b64tohex(exponent));
                    en_email = base64.hex2b64(rsakey.encrypt(email));
                    that.$axios.post("/api/common/get_email_msg_code",{
                        email: email,
                        mid: mid,
                        enEmail: en_email
                    })
                        .then(function(data){
                            that.$toast(data.data.content,1500);
                            if(data.data.code === '2'){
                                that.code_interval = setInterval(function(){that.get_code_timeout()},1000);
                            }
                        })
                });
            },
            // 获取验证码倒计时
            get_code_timeout:function() {
                let that = this;
                if(that.countdown <= 0){
                    that.can_get_code = true;
                    that.code_btn_tip = '获取验证码';
                    that.countdown = 60;
                    clearInterval(that.code_interval);
                }else{
                    that.can_get_code = false;
                    that.code_btn_tip = '重新发送('+ that.countdown +')';
                    that.countdown--;
                }
            },
            // 验证码校验
            validate_code:function(value,empty){
                let that = this,
                    code_reg = /^\d{6}$/;
                if(!code_reg.test(value) || value === ''){
                    that.test_code.error = true;
                    that.test_code.success = false;
                }else{
                    that.test_code.error = false;
                    that.test_code.success = true;
                }
            },

            /*邮箱相关*/
            // 邮箱校验
            validate_email:function(e){
                let that = this,
                    value = e.target.value.replace(/(^\s*)|(\s*$)/g, ""),
                    email_reg = /^\w+((.\w+)|(-\w+))@[A-Za-z0-9]+((.|-)[A-Za-z0-9]+).[A-Za-z0-9]+$/;
                if (that.member_type === 'change_email' && that.change_email_step === 'checked_old_email') {
                    if (value === that.user_info.email) {
                        that.test_email = {
                            error: false,
                            success: true,
                        };
                    } else {
                        that.test_email = {
                            error: true,
                            success: false,
                            message: '请输入原邮箱账号！'
                        };
                    }
                    return;
                }
                if(value.length <= 0 || value === ''){
                    that.test_email = {
                        error: true,
                        success: false,
                        message: '邮箱不可为空！'
                    };
                }else if(!email_reg.test(value)){
                    that.test_email = {
                        error: true,
                        success: false,
                        message: '请输入正确的邮箱账号！'
                    };
                }else if(that.change_email_step === 'checked_new_email' && value == that.user_info.email){
                    that.test_email = {
                        error: true,
                        success: false,
                        message: '不可输入原邮箱账号！'
                    };
                }else{
                    that.useful_email(value, function(result){
                        if(result){
                            if(that.member_type === 'bind_email' || that.change_email_step === 'checked_new_email'){
                                that.test_email = {
                                    error: false,
                                    success: true,
                                    message: '',
                                    exist: false
                                };
                            }else{
                                that.test_email = {
                                    error: true,
                                    success: false,
                                    exist: true,
                                    message: '该邮箱已被绑定'
                                };
                            }
                        }else{
                            if(that.member_type === 'change_email' && that.change_email_step === 'checked_old_email'){
                                that.test_email = {
                                    error: false,
                                    success: true,
                                    message: '',
                                    exist: false
                                };
                            }else{
                                that.test_email = {
                                    error: true,
                                    success: false,
                                    message: '该邮箱已被绑定',
                                    exist: true
                                };                              
                            }
                        }
                    });
                }
            },
            // 校验邮箱是否使用
            useful_email:function(value, callback){
                let that = this,
                    result;
                //发送邮件
                that.$axios.get("/api/register/check_email/",{params:{email:value}})
                    .then(function(data){
                        if(data.data.code === '2'){
                            result = true;
                        }else{
                            result = false;
                        }
                        if(typeof callback === 'function') callback(result);
                        // // 校验过的邮箱不再重复校验
                        // that.useful_email = true;
                        // if(data.data.code === '2'){
                        //     that.valid_error = false;
                        //     that.valid_succ = true;
                        //     return true;
                        // }else{
                        //     that.input_index= 1;
                        //     that.valid_error = true;
                        //     that.error_message = "该邮箱已被注册~";
                        //     return false;
                        // }
                    })
            },
            // 绑定邮箱（首次）
            bind_email_submit:function(){
                let that = this,
                    email = that.$refs.email.value,
                    code = that.$refs.email_code.value,
                    password = that.$refs.password.value,
                    test_email = that.test_email.success,
                    test_pwd = that.test_password.success,
                    test_code = that.test_code.success,
                    test_exist = that.test_email.exist;
                if(test_email && test_code && test_pwd){
                    if(test_exist){
                        that.$toast("该邮箱已被绑定",2000);
                    }else{
                        that.bind_email_submit_post(email,code,password);
                    }
                }
            },
            // 绑定邮箱（首次）提交
            bind_email_submit_post:function(email,code,password){
                let that = this;
                if(that.has_password){
                    that.$axios.post("/api/member/bind_email_submit/",{
                        mid: that.bind_mid,
                        email: email,
                        code:code
                    }).then(function(data){
                        if (data.data.code === '2') {
                            that.$toast("关联成功",2000);
                            setTimeout(function(){location.href = '/member/';},2000);
                        } else {
                            that.$toast(data.data.content,1000);
                        }
                    })
                }else{
                    that.$axios.get("/api/common/public_key/")
                    .then(function(data){
                        let RsaKey = that.$rsa,
                            Base64 = that.$base64,
                            rsakey = new RsaKey(),
                            base64 = new Base64(),
                            modulus = data.data.modulus,
                            exponent = data.data.exponent;
                        rsakey.setPublic(base64.b64tohex(modulus), base64.b64tohex(exponent));
                        let enPassword = base64.hex2b64(rsakey.encrypt(password));
                        that.$axios.post("/api/member/bind_email_submit/",{
                            mid: that.bind_mid,
                            email: email,
                            code:code,
                            enPassword: enPassword
                        })
                        .then(function(data){
                            if (data.data.code === '2') {
                                that.$toast("关联成功",2000);
                                setTimeout(function(){location.href = '/member/';},2000);
                            } else {                                     
                                that.$toast(data.data.content,1000);
                            }
                        })
                    });
                }
            },
            // 修改邮箱账号 - 验证旧邮箱
            change_email_next:function(){
                let that = this,
                    email = that.$refs.old_email.value,
                    code = that.$refs.old_email_code.value,
                    mid = that.bind_mid;
                // 判断前置条件正确时触发
                if(that.test_email.success && that.test_code.success){
                    checkapi.change_email_submit_post({mid:mid,email:email,code:code,type:'oldEmail',
                        success: data => {
                            that.change_email_step = 'checked_new_email';
                            clearInterval(that.code_interval);
                            that.countdown = 60;
                            that.can_get_code = true;
                            that.test_email = {
                                error: false,
                                success: false,
                                message: ''
                            };
                            that.test_code = {
                                error: false,
                                success: false,
                            };
                            that.code_btn_tip = '获取验证码';
                        },
                        fail:data => {
                            that.$toast(data.data.content,1000);
                            if(data.data.content.indexOf('验证码') >= 0){
                                that.test_code.error = true;
                                that.test_code.success = false;
                            }
                        }
                    },that);
                }
            },
            // 修改邮箱账号 - 验证新邮箱
            change_email_submit:function(){
                let that = this,
                    email = that.$refs.new_email.value,
                    code = that.$refs.new_email_code.value,
                    mid = that.bind_mid;
                // 判断前置条件正确时触发
                if(that.test_email.success && that.test_code.success){
                    if(that.test_email.exist){
                        that.$toast("该邮箱已被注册",2000);
                    }else{
                        that.change_email_submit_post(mid,email,code,'newEmail');
                    }
                }
            },
            change_email_submit_post:function(mid,email,code,type){
                var that = this;
                checkapi.change_email_submit_post({mid:mid,email:email,code:code,type:type,
                    success: data => {
                        that.$toast('关联成功',2000);
                        setTimeout(function(){location.href = '/member/';},2000);
                    },
                    fail:data => {
                        that.$toast(data.data.content,1000);
                        if(data.data.content.indexOf('验证码') >= 0){
                            that.test_code.error = true;
                            that.test_code.success = false;
                        }
                    }
                },that);                
            },
            /*密码相关*/
            // 密码校验
            validate_password:function(e,t){
                let that = this,
                    value = e.target.value.replace(/(^\s*)|(\s*$)/g, ""),
                    type = t || 'test_password',
                    password_reg = /^(\w){6,20}$/;
                // 密码正常检测
                if(value.length <= 0 || value === '' || value.length < 6 || value.length > 20){
                    that[type] = {
                        error: true,
                        success: false,
                        message: '请输入6-20个字符的密码'
                    }
                }else if(!password_reg.test(value)){
                    that[type] = {
                        error: true,
                        success: false,
                        message: '只能输入6-20个字母、数字、下划线'
                    };
                }else{
                    that[type] = {
                        error: false,
                        success: true,
                        message: ''
                    };
                }
                // 密码特殊检测
                if(that.member_type === 'change_password'){
                    switch (type) {
                        case 'test_password':
                            if(that[type].success){
                                let new_password = that.$refs.password.value;
                                if(new_password === value){
                                    that[type] = {
                                        error: true,
                                        success: false,
                                        message: '新旧密码不允许一致',
                                    };
                                }
                            }
                                break;
                        case 'test_new_pwd':
                            if(that[type].success){
                                let old_password = that.$refs.passwordold.value,
                                    repeat_pwd = that.$refs.repassword.value;
                                if(old_password === value){
                                    that[type] = {
                                        error: true,
                                        success: false,
                                        message: '新旧密码不允许一致',
                                    };
                                }
                                if(that.test_repeat_pwd.success && repeat_pwd !== value){
                                    that[type] = {
                                        error: true,
                                        success: false,
                                        message: '两次密码不一致',
                                    };
                                }

                            }
                            break;
                        case 'test_repeat_pwd':
                            if(that[type].success){
                                let new_password = that.$refs.password.value;
                                if(new_password !== value){
                                    that[type] = {
                                        error: true,
                                        success: false,
                                        message: '两次密码不一致',
                                    };
                                }
                            }
                            break;
                    }
                }
            },
            // 修改密码
            update_password_submit:function(){
                let that = this,
                    passwordold = that.$refs.passwordold.value,
                    password = that.$refs.password.value,
                    repassword = that.$refs.repassword.value,
                    test_password = that.test_password.success,
                    test_new_pwd = that.test_new_pwd.success,
                    test_repeat_pwd = that.test_repeat_pwd.success;

                // 判断前置条件
                if(!test_password || !test_new_pwd || !test_repeat_pwd) return false;
                // 发送请求
                that.$axios.get("/api/common/public_key/").then(function(data){
                    let RsaKey = that.$rsa,
                        Base64 = that.$base64,
                        rsakey = new RsaKey(),
                        base64 = new Base64(),
                        modulus = data.data.modulus,
                        exponent = data.data.exponent;
                    rsakey.setPublic(base64.b64tohex(modulus), base64.b64tohex(exponent));
                    passwordold = base64.hex2b64(rsakey.encrypt(passwordold));
                    password = base64.hex2b64(rsakey.encrypt(password));
                    // 发起请求
                    that.$axios.post("/api/member/update_password/",{
                        oldPassword: passwordold,
                        password: password,
                    }).then(function(data){
                        if(data.data.code === '2'){
                            that.$toast("密码修改成功",2000);
                            setTimeout(function(){location.href = '/member/'},2000);
                        }else{                        
                            that.$toast("原密码错误~",2000);
                        }
                    });
                });
            },
            open_member_upgrade_modal:function(){
                let that = this;
                that.$modal({templateType: 'memberGrade'});
            },
        },
        mounted () {
            const that = this;
            that.member_type = this.$route.query.type;
            that.get_user_info();
			that.user = this.$common.get_login_state();
			switch (true) {
			    // 绑定 || 解绑微信
                case that.member_type === 'bind_wechat' || that.member_type === 'unbind_wechat':
                    that.bind_weixin();
                    break;
                // 绑定成功
                case this.$route.query.bind_weixin_success:
                    that.is_change_email = false;
                    that.bind_weixin_success = true;
                    that.test_email_status = 'success';
                    location.href = '/member/';
                    break;
                // 跳转绑定微信
                case that.member_type === 'useful_email':
                    let name = 'woodo_memberIsBindWeixin' + "=", _cookie = document.cookie.split(';');
                    for (let i = 0; i < _cookie.length; i++){
                        let c = _cookie[i];
                        while (c.charAt(0) === ' ') c = c.substring(1);
                        if (c.indexOf(name) !== -1 && c.substring(name.length, c.length) === 'false'){
                            that.change_member_type('bind_wechat')
                        }
                    }
                    break;
            }
        }
    }
</script>
