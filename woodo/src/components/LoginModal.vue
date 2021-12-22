<template>
    <transition name="modal-fade">
        <div class="login_modal" :class="modal_class" v-if="show_modal">
            <div class="modal_masking" v-if="modal_class !== 'module'"></div>
            <div class="modal_contain clearfix">
                <button class="modal_close" v-if="modal_class !== 'module'" @click="close"></button>
                <div class="contain_left" v-if="modal_class !== 'module'">
                    <template v-if="['phone', 'email', 'wechat'].indexOf(login_type) >= 0">
                        <h3>初次见面</h3>
                        <h3><span>注册一起</span>搞事情！</h3>
                    </template>
                    <template v-else>
                        <h3>欢迎回来</h3>
                        <h3><span>登录一起</span>搞事情！</h3>
                    </template>
                    <h4>在线制作，安全专业，简单高效</h4>
                    <p>粤ICP备18137964号 © 2018-2020 爆裂科技 All rights reserved</p>
                </div>
                <div class="contain_right">
                    <!-- 帐号密码登录 -->
                    <div class="item accounts" v-if="login_type === 'account'">
                        <div class="accounts_content">
                            <div class="header">
                                <p class="panel_title">登录吾道</p>
                            </div>
                            <div class="center_main" :style="{'margin-top': valid_msg_show ? '0' :''}">
                                <div class="login_type">
                                    <span @click="change_login_type('qrcode')">扫码登录</span>
                                    <span class="checked">账号登录</span>
                                </div>
                                <!--错误提示-->
                                <div class="valid_error" v-if="valid_text">
                                    <span>{{valid_text}}</span>
                                </div>
                                <!--账号-->
                                <div class="field username_field">
                                    <input type="text" ref="username" @input="remove_space($event, 'username')" placeholder="请输入手机号或者邮箱" @keyup.13="username_submit_event">
                                    <i class="icon"></i>
                                </div>
                                <!--密码-->
                                <div class="field pwd_field">
                                    <input type="password" ref="password" placeholder="密码" @keyup.13="username_submit_event">
                                    <i class="icon" v-tooltip="show_password ? '隐藏' : '显示'" @click="toggle_password_show($event)"></i>
                                </div>
                                <!-- 记住密码 -->
                                <div class="field pwd_option">
                                    <a href="javascript:void(0)" class="pwd_remember" :class="{'check': remember_pwd}" @click="toggle_remember_pwd">记住密码</a>
                                    <a href="javascript:void(0)" class="pwd_forget" @click="change_login_type('phone_pwd')">忘记密码?</a>
                                </div>
                                <!-- 登录 -->
                                <div class="submit" @click="username_submit_event">
                                    <button type="button">登录</button>
                                </div>
                            </div>
                            <div class="foot">
                                没有账号？请 <a @click="change_login_type('phone')">注册</a>
                            </div>
                        </div>
                    </div>
                    <!-- 微信登录 -->
                    <div class="item wechat" v-if="login_type === 'qrcode'">
                        <div class="accounts_content">
                            <div class="header"><p class="panel_title">登录吾道</p></div>
                            <div class="center_main">
                                <div class="login_type">
                                    <span class="checked">扫码登录</span>
                                    <span @click="change_login_type('account')">账号登录</span>
                                </div>
                                <div class="ewm" id="weixin_qrcode_image">
                                    <img v-show="!wechat_img" class="qrcode_loading" src="../assets/pc/images/common/edit_loading.gif"/>
                                    <img id="weixin_qrcode_image" v-if="wechat_img" :src="wechat_img"/>
                                    <div class="expired_tip" v-if="ewm_expired">
                                        <span>二维码已失效</span>
                                        <a href="javascript:;" id="reflesh_qrcode" @click="refresh_wexin_qrcode">刷新</a>
                                    </div>
                                </div>
                            </div>
                            <div class="foot">
                                没有账号？请 <a @click="change_login_type('wechat')">注册</a>
                            </div>
                        </div>
                    </div>
                    <!-- 微信注册 -->
                    <div class="item wechat_reg" v-if="login_type === 'wechat'">
                        <div class="accounts_content">
                            <div class="header"><p class="panel_title">注册吾道</p></div>
                            <div class="center_main">
                                <div class="sign_up_type">
                                    <span class="checked">微信注册</span>
                                    <span @click="change_login_type('phone')">手机注册</span>
                                    <span @click="change_login_type('email')">邮箱注册</span>
                                </div>
                                <div class="reg_code">
                                    <span class="tip">使用微信扫码注册</span>
                                    <div class="ewm" id="weixin_qrcode_image">
                                        <img v-show="!wechat_img" class="qrcode_loading" src="../assets/pc/images/common/edit_loading.gif"/>
                                        <img class="ewm" id="weixin_qrcode_image" v-if="wechat_img" :src="wechat_img"/>
                                        <div class="expired_tip" v-if="ewm_expired">
                                            <span>二维码已失效</span>
                                            <a href="javascript:;" id="reflesh_qrcode" @click="refresh_wexin_qrcode">刷新</a>
                                        </div>
                                    </div>
                                </div>
                                <p class="submit_tips">
                                    注册即代表您同意<a href="/agreement/" target="_blank">《吾道用户协议》</a>
                                </p>
                            </div>
                            <div class="foot">
                                已有账号？请 <a @click="change_login_type('account')">登录</a>
                            </div>
                        </div>
                    </div>
                    <!-- 邮箱注册 -->
                    <div class="item email" v-if="login_type === 'email'">
                        <div class="accounts_content">
                            <div class="header"><p class="panel_title">注册吾道</p></div>
                            <div class="center_main">
                                <div class="sign_up_type">
                                    <span @click="change_login_type('wechat')">微信注册</span>
                                    <span @click="change_login_type('phone')">手机注册</span>
                                    <span class="checked">邮箱注册</span>
                                </div>
                                <!--错误提示-->
                                <div class="valid_error" v-if="valid_text">
                                    <span>{{valid_text}}</span>
                                </div>
                                <!--邮箱-->
                                <div class="field email_field" :class="test_email">
                                    <input type="email" ref="email" placeholder="邮箱" @blur="validate_email" autocomplete="new-password"
                                        @input="reset_input_state('email')" @keyup.13="email_register" v-model="account"/>
                                    <span class="error">{{ valid_detail_text.email }}</span>
                                </div>
                                <!--邮箱验证码-->
                                <div class="field code_field" :class="test_code">
                                    <input type="text"  class="hidden" />
                                    <input type="text" ref="code" placeholder="输入验证码" maxlength="20" autocomplete="new-password"
                                        @blur="validate_code($event)" @input="reset_input_state('code')" @keyup.13="email_register"/>
                                    <input type="text"  class="hidden" />
                                    <span class="error">{{ valid_detail_text.code }}</span>
                                    <button class="mobile_code_btn"
                                            :class="{able:can_get_code && test_email.success}"
                                            @click="get_email_code"
                                    >{{code_text}}</button>
                                </div>
                                <!--密码-->
                                <div class="field pwd_field" :class="test_pwd">
                                    <input type="password" ref="password" placeholder="请输入密码" autocomplete="new-password"
                                        @blur="validate_password($event)" @input="reset_input_state('pwd')" @keyup.13="email_register"/>
                                    <i class="icon" v-tooltip="show_password ? '隐藏' : '显示'"  @click="toggle_password_show($event)"></i>
                                    <span class="error">{{ valid_detail_text.pwd }}</span>
                                </div>
                                <!--再次输入密码-->
                                <div class="field pwd_field" :class="test_repeat_pwd">
                                    <input type="password" ref="repeat_pwd" placeholder="再次输入密码" autocomplete="new-password"
                                         @blur="validate_repeat_pwd($event)" @input="reset_input_state('repeat_pwd')"  @keyup.13="email_register"/>
                                    <i class="icon" v-tooltip="show_password ? '隐藏' : '显示'"  @click="toggle_password_show($event)"></i>
                                    <span class="error">{{ valid_detail_text.repeat_pwd }}</span>
                                </div>
                                <!--昵称-->
                                <div class="field nickname_field" :class="test_nick_name">
                                    <input type="text" ref="nick_name" placeholder="请输入昵称" autocomplete="new-password"
                                        @blur="validate_nickname($event)" @input="reset_input_state('nick_name')" @keyup.13="email_register">
                                    <span class="error">{{ valid_detail_text.nick_name }}</span>
                                </div>
                                <div class="submit" @click="email_register">
                                    <button type="button">注册</button>
                                </div>
                                <p class="submit_tips">
                                    注册即代表您同意<a href="/agreement/" target="_blank">《吾道用户协议》</a>
                                </p>
                            </div>
                            <div class="foot">
                                已有账号？请 <a @click="change_login_type('account')">登录</a>
                            </div>
                        </div>
                    </div>
                    <!-- 手机注册 -->
                    <div class="item phone" v-if="login_type === 'phone'">
                        <div class="accounts_content">
                            <div class="header"><p class="panel_title">注册吾道</p></div>
                            <div class="center_main">
                                <div class="sign_up_type">
                                    <span @click="change_login_type('wechat')">微信注册</span>
                                    <span class="checked">手机注册</span>
                                    <span @click="change_login_type('email')">邮箱注册</span>
                                </div>
                                <!--错误提示-->
                                <div class="valid_error" v-if="valid_text">
                                    <span>{{valid_text}}</span>
                                </div>
                                <!--手机号-->
                                <div class="field phone_field" :class="test_phone">
                                    <span class="prefix">+86</span>
                                    <input type="text" ref="phone" placeholder="手机号" @blur="validate_phone" autocomplete="new-password"
                                        @input="reset_input_state('phone')" @keyup.13="phone_register" v-model="account"/>
                                    <span class="error">{{ valid_detail_text.phone }}</span>
                                </div>
                                <!--验证码-->
                                <div class="field code_field" :class="test_code">
                                    <input type="text" class="hidden" />
                                    <input type="text" placeholder="输入验证码" maxlength="20" ref="phone_code" autocomplete="new-password"
                                        @blur="validate_code($event)" @input="reset_input_state('code')" @keyup.13="phone_register"/>
                                    <input type="text" class="hidden" />
                                    <span class="error">{{ valid_detail_text.code }}</span>
                                    <button class="mobile_code_btn"
                                            :class="{able:can_get_code && test_phone.success}"
                                            @click="get_phone_code"
                                    >{{code_text}}</button>
                                </div>
                                <!--密码-->
                                <div class="field pwd_field" :class="test_pwd">
                                    <input type="password" ref="password" placeholder="请输入密码" autocomplete="new-password"
                                        @blur="validate_password($event)" @input="reset_input_state('pwd')"  @keyup.13="phone_register"/>
                                    <i class="icon" v-tooltip="show_password ? '隐藏' : '显示'"  @click="toggle_password_show($event)"></i>
                                    <span class="error">{{ valid_detail_text.pwd }}</span>
                                </div>
                                <!--再次输入密码-->
                                <div class="field pwd_field" :class="test_repeat_pwd">
                                    <input type="password" ref="repeat_pwd" placeholder="再次输入密码"  autocomplete="new-password"
                                        @blur="validate_repeat_pwd($event)" @input="reset_input_state('repeat_pwd')" @keyup.13="phone_register"/>
                                    <i class="icon" v-tooltip="show_password ? '隐藏' : '显示'"  @click="toggle_password_show($event)"></i>
                                    <span class="error">{{ valid_detail_text.repeat_pwd }}</span>
                                </div>
                                <!--昵称-->
                                <div class="field nickname_field" :class="test_nick_name">
                                    <input type="text" ref="nick_name" placeholder="请输入昵称" autocomplete="new-password"
                                         @blur="validate_nickname($event)" @input="reset_input_state('nick_name')" @keyup.13="phone_register"/>
                                    <span class="error">{{ valid_detail_text.nick_name }}</span>
                                </div>

                                <div class="submit" @click="phone_register">
                                    <button type="button">注册</button>
                                </div>
                                <p class="submit_tips">
                                    注册即代表您同意<a href="/agreement/" target="_blank">《吾道用户协议》</a>
                                </p>
                            </div>
                            <div class="foot">
                                已有账号？请 <a @click="change_login_type('account')">登录</a>
                            </div>
                        </div>
                    </div>
                    <!-- 邮箱找回 -->
                    <div class="item email_pwd" v-if="login_type === 'email_pwd'">
                        <div class="accounts_content">
                            <div class="header"><p class="panel_title">密码重置</p></div>
                            <div class="center_main">
                                <div class="login_type">
                                    <span @click="change_login_type('phone_pwd')">手机找回</span>
                                    <span class="checked">邮箱找回</span>
                                </div>
                                <!--错误提示-->
                                <div class="valid_error" v-if="valid_text">
                                    <span>{{valid_text}}</span>
                                </div>
                                <!--邮箱-->
                                <div class="field email_field" :class="test_email">
                                    <span class="error">{{ valid_detail_text.email }}</span>
                                    <input type="email" name="email" ref="email" placeholder="邮箱" autocomplete="new-password"
                                         @blur="validate_email" @input="reset_input_state('email')" @keyup.13="reset_password" v-model="account"/>
                                </div>
                                <!--邮箱验证码-->
                                <div class="field code_field" :class="test_code">
                                    <span class="error">{{ valid_detail_text.code }}</span>
                                    <input type="text" class="hidden" />
                                    <input type="text" placeholder="输入验证码" ref="email_code" maxlength="20" autocomplete="new-password"
                                         @blur="validate_code($event)" @input="reset_input_state('code')" @keyup.13="reset_password"/>
                                    <input type="text" class="hidden" />
                                    <button class="mobile_code_btn"
                                            :class="{able:can_get_code && test_email.success}"
                                            @click="get_email_code"
                                    >{{code_text}}</button>
                                </div>
                                <!--密码-->
                                <div class="field pwd_field" :class="test_pwd">
                                    <span class="error">{{ valid_detail_text.pwd }}</span>
                                    <input type="password" name="password" ref="password" placeholder="请输入新密码" autocomplete="new-password"
                                        @blur="validate_password($event)" @input="reset_input_state('pwd')" @keyup.13="reset_password"/>
                                </div>
                                <!--确认密码-->
                                <div class="field repeat_pwd_field" :class="test_repeat_pwd">
                                    <span class="error">{{ valid_detail_text.repeat_pwd }}</span>
                                    <input type="password" ref="repeat_pwd" placeholder="请再次输入密码" autocomplete="new-password"
                                        @blur="validate_repeat_pwd($event)" @input="reset_input_state('repeat_pwd')" @keyup.13="reset_password"/>
                                </div>

                                <div class="submit" @click="reset_password">
                                    <button type="button">提交</button>
                                </div>
                            </div>
                            <div class="foot">
                                已有账号？请 <a @click="change_login_type('account')">登录</a>
                            </div>
                        </div>
                    </div>
                    <!-- 手机找回 -->
                    <div class="item phone_pwd" v-if="login_type === 'phone_pwd'">
                        <div class="accounts_content">
                            <div class="header"><p class="panel_title">密码重置</p></div>
                            <div class="center_main">
                                <div class="login_type">
                                    <span class="checked">手机找回</span>
                                    <span @click="change_login_type('email_pwd')">邮箱找回</span>
                                </div>
                                <!--错误提示-->
                                <div class="valid_error" v-if="valid_text">
                                    <span>{{valid_text}}</span>
                                </div>
                                <!--手机号-->
                                <div class="field phone_field" :class="test_phone">
                                    <span class="error">{{ valid_detail_text.phone }}</span>
                                    <span class="prefix">+86</span>
                                    <input type="text" ref="phone" placeholder="手机号" @blur="validate_phone" autocomplete="new-password"
                                        @input="reset_input_state('phone')" @keyup.13="reset_password" v-model="account">
                                </div>
                                <!--验证码-->
                                <div class="field code_field" :class="test_code">
                                    <span class="error">{{ valid_detail_text.code }}</span>
                                    <input type="text" class="hidden" />
                                    <input type="text" ref="phone_code" placeholder="请输入验证码" maxlength="20" autocomplete="new-password"
                                        @blur="validate_code($event)" @input="reset_input_state('code')" @keyup.13="reset_password"/>
                                    <input type="text" class="hidden" />
                                    <button class="mobile_code_btn"
                                            :class="{able:can_get_code && test_phone.success}"
                                            @click="get_phone_code"
                                    >{{code_text}}</button>
                                </div>
                                <!--新密码-->
                                <div class="field pwd_field" :class="test_pwd">
                                    <span class="error">{{ valid_detail_text.pwd }}</span>
                                    <input type="password" ref="password" placeholder="请输入新密码" autocomplete="new-password"
                                        @blur="validate_password($event)" @input="reset_input_state('pwd')" @keyup.13="reset_password"/>
                                </div>
                                <!--确认密码-->
                                <div class="field repeat_pwd_field" :class="test_repeat_pwd">
                                    <span class="error">{{ valid_detail_text.repeat_pwd }}</span>
                                    <input type="password" ref="repeat_pwd" placeholder="请再次输入密码" autocomplete="new-password"
                                        @blur="validate_repeat_pwd($event)" @input="reset_input_state('repeat_pwd')" @keyup.13="reset_password"/>
                                </div>

                                <div class="submit" @click="reset_password">
                                    <button type="button">提交</button>
                                </div>
                            </div>
                            <div class="foot">
                                已有账号？请 <a @click="change_login_type('account')">登录</a>
                            </div>
                        </div>
                    </div>
                    <!-- 绑定手机号或邮箱-->
                    <div class="item bind_account" v-if="login_type === 'bind_account'">
                        <div class="accounts_content">
                            <div class="header"><p class="panel_title">只差最后一步啦</p></div>
                            <div class="center_main">
                                <!--错误提示-->
                                <div class="valid_error" v-if="valid_text">
                                    <span>{{valid_text}}</span>
                                </div>
                                <div class="bind_tip">绑定手机号或邮箱，开启双重保护</div>
                                <!-- 手机号或邮箱 -->
                                <div class="field phone_field" :class="test_bind_account">
                                    <input type="text" ref="account" placeholder="请输入手机号或邮箱" autocomplete="new-password"
                                        @blur="validate_account(false)" @input="reset_input_state('bind_account')" @keyup.13="bind_account" v-model="account"/>
                                    <span class="error">{{ valid_detail_text.account }}</span>
                                </div>
                                <!-- 验证码 -->
                                <div class="field code_field" :class="test_code">
                                    <input type="text" class="hidden" />
                                    <input type="text" ref="code" placeholder="请输入验证码" maxlength="20"  autocomplete="new-password"
                                        @blur="validate_code($event)" @input="reset_input_state('code')" @keyup.13="bind_account"/>
                                    <input type="text" class="hidden" />
                                    <button class="mobile_code_btn"
                                            :class="{able:can_get_code && test_bind_account.success}"
                                            @click="validate_account(true)"
                                    >{{code_text}}</button>
                                    <span class="error">{{ valid_detail_text.code }}</span>
                                </div>
                                <!--密码-->
                                <div class="field pwd_field" :class="test_pwd" v-if="!has_password">
                                    <input type="password" ref="password" placeholder="请输入密码" autocomplete="new-password"
                                        @blur="validate_password($event)" @input="reset_input_state('pwd')" @keyup.13="phone_register"/>
                                    <i class="icon" v-tooltip="show_password ? '隐藏' : '显示'"  @click="toggle_password_show($event)"></i>
                                    <span class="error">{{ valid_detail_text.pwd }}</span>
                                </div>
                                <div class="submit" @click="bind_account">
                                    <button type="button">确认关联</button>
                                </div>
                            </div>
                        </div>
                    </div>
                    <!-- 绑定微信 -->
                    <div class="item bind_wechat" v-if="login_type === 'bind_wechat'">
                        <div class="accounts_content">
                            <div class="header">
                                <p class="panel_title">只差最后一步啦</p>
                            </div>
                            <div class="center_main">
                                <div class="reg_code">
                                    <span class="tip">扫一扫绑定微信号，开启双重保护</span>
                                    <div class="ewm" id="weixin_qrcode_image">
                                        <img v-show="!wechat_img" class="qrcode_loading" src="../assets/pc/images/common/edit_loading.gif"/>
                                        <img class="ewm" id="weixin_qrcode_image" v-if="wechat_img" :src="wechat_img"/>
                                        <div class="expired_tip" v-if="ewm_expired">
                                            <span>二维码已失效</span>
                                            <a href="javascript:;" id="reflesh_qrcode" @click="refresh_wexin_qrcode">刷新</a>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div class="toast" v-show="toast_show"> {{ toast_content }}</div>
        </div>
    </transition>
</template>

<style lang="less" scoped>
    @import url("../assets/pc/css/common.css");
    @background_image:url('../assets/pc/images/login/login_icon.png') no-repeat;
    .toast{
        position: fixed;
        top: 50%;
        left: 50%;
        max-width:80%;
        padding:8px 16px;
        text-align:center;
        z-index:9999;
        font-size:14px;
        color:#1f1f1f;
        border-radius:4px;
        background:#fff6b2;
    }
    .login_modal{
        position: relative;
        z-index: 10;
    }
    .modal_masking{
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0,0,0,.5);
    }
    .modal_contain{
        background: #ffffff;
        z-index: 11;
        .modal_close{
            position: absolute;
            top: 16px;
            right: 16px;
            width: 16px;
            height: 16px;
            background: url('../assets/pc/images/login/icon_close.png') no-repeat center center;
            transition: all .4s;
            &:hover{
                transform: rotate(180deg);
                opacity: .8;
            }
        }
        .contain_left{
            float: left;
            height: 100%;
            padding-top: 192px;
            text-align: left;
            color: #ffffff;
            user-select: none;
            h3{
                font-size: 32px;
                font-weight: bold;
                span{
                    display: inline-block;
                    font-size: 32px;
                    font-weight: bold;
                    border-bottom: 2px solid #ffffff;
                    margin-bottom: 32px;
                }
            }
            h4{
                display: block;
                font-size: 14px;
                font-weight: normal;
            }
            p{
                position: absolute;
                left: 79px;
                bottom: 25px;
                opacity: .7;
            }
        }
        .contain_right{
            float: right;
            width: 320px;
            height: 100%;
            text-align: left;
        }
        &.clearfix{
            zoom: 1;
            &::after{
                content: ".";
                display: block;
                height: 0;
                clear: both;
                visibility: hidden;
                font-size: 0;
            }
        }
    }
    // 通用界面
    .item{
        position:relative;
        width:100%;
        background:#ffffff;
        .header{
            padding-bottom:35px;
            .panel_title{
                height:24px;
                line-height:24px;
                font-size:24px;
                color:#333333;
                text-align:center;
            }
        }
        .field{
            position:relative;
            width:100%;
            height:35px;
            margin-bottom:6px;
            overflow:hidden;
            input{
                display:inline-block;
                width:100%;
                height:35px;
                padding-top: 10px;
                font-size:14px;
                border-bottom:1px solid #e5e5e5;
                &::-webkit-input-placeholder{
                    color:#cccccc;
                }
                &:-moz-placeholder{
                    color:#cccccc;
                }
                &:-ms-input-placeholder{
                    color:#cccccc;
                }
                &::-moz-placeholder{
                    color:#cccccc;
                }
                &:-webkit-autofill{
                    box-shadow: inset 0 0 0 1000px white !important;
                }
                &:focus{
                    border-bottom-color: #000000;
                }
            }
            &.error{
                border-color:#ff7575;
            }
            &.success:after{
                content:'';
                position:absolute;
                bottom:6px;
                right:0;
                display:inline-block;
                width:16px;
                height:16px;
                background:url('../assets/pc/images/login/check_blue.png') no-repeat center center;
            }
            &.pwd_field{
                input{
                    &:focus +.icon{
                        background: url('../assets/pc/images/login/icon_bi_hover.png') no-repeat center center;
                        &.show{
                            background: url('../assets/pc/images/login/icon_password_hover.png') no-repeat center center;
                        }
                    }
                }
                i{
                    display: inline-block;
                    position: absolute;
                    bottom: 5px;
                    right: 0;
                    width: 13px;
                    height: 15px;
                    background: url('../assets/pc/images/login/icon_bi.png') no-repeat center center;
                    cursor: pointer;
                    &:hover{
                        background: url('../assets/pc/images/login/icon_bi_hover.png') no-repeat center center;
                    }
                    &.show{
                        background: url('../assets/pc/images/login/icon_password.png') no-repeat center center;
                        &:hover{
                            background: url('../assets/pc/images/login/icon_password_hover.png') no-repeat center center;
                        }   
                    }
                }
                &::after{
                    display: none;
                }
            }
        }
        .login_type{
            display: flex;
            justify-content: space-around;
            padding: 0 35px;
            margin-bottom: 48px;
            text-align:center;
            user-select:none;
            span{
                position: relative;
                height: 27px;
                line-height: 25px;
                font-size: 16px;
                color: #999999;
                cursor: pointer;
                &:hover{
                    opacity:0.8;
                    color: var(--mainColor);
                }
                &.checked{
                    color: var(--mainColor);
                    cursor: default;
                    &::after{
                        content: '';
                        display: block;
                        position: absolute;
                        bottom: 0;
                        left: 12px;
                        width: 40px;
                        height: 2px;
                        background-color: var(--mainColor);
                    }
                }
            }
        }
        .sign_up_type{
            height:30px;
            line-height:30px;
            margin-bottom:63px;
            border-bottom:1px solid #e5e5e5;
            text-align:center;
            user-select:none;
            span{
                position:relative;
                display:inline-block;
                width:56px;
                height:30px;
                line-height:30px;
                border-bottom:2px solid transparent;
                font-size:14px;
                color:#777777;
                cursor:pointer;
                &:hover{
                    opacity:0.8;
                }
                &.checked{
                    color: var(--mainColor);
                    border-color:var(--mainColor);
                }
                &:nth-child(2){
                    margin: 0 50px;
                }
            }
        }
        .valid_error{
            position: absolute;
            top: 120px;
            left: 35px;
            height: 18px;
            line-height: 18px;
            font-size: 12px;
            color: #ff4500;
            user-select: none;
        }
        .submit{
            width: 100%;
            height: 56px;
            line-height: 56px;
            margin-bottom: 48px;
            background: #68adfb;
            border-radius: 28px;
            text-align:center;
            cursor:pointer;
            &:hover{
                background: #68adfb;
            }
            button{
                font-size:16px;
                color:#fff;
            }
            &.able{
                background: var(--mainColor);
            }
        }
        .foot{
            width:100%;
            font-size:14px;
            color:#cccccc;
            text-align:center;
            user-select: none;
            a{
                color:var(--mainColor);
            }
        }
    }
    // 帐号密码登录界面
    .accounts{
        .center_main{
            position: relative;
            .valid_error{
                top: 56px;
                left: 0;
            }
            .username_field{
                position: relative;
                margin-bottom: 25px;
                input{
                    &:focus +.icon{
                        background: url('../assets/pc/images/login/icon_user_hover.png') no-repeat center center;
                    }
                }
                i{
                    display: inline-block;
                    position: absolute;
                    bottom: 5px;
                    right: 0;
                    width: 13px;
                    height: 15px;
                    background: url('../assets/pc/images/login/icon_user.png') no-repeat center center;
                    &:hover{
                        background: url('../assets/pc/images/login/icon_user_hover.png') no-repeat center center;
                    }
                }
            }
            .pwd_field{
                position: relative;
                margin-bottom: 14px;
            }    
            .pwd_option{
                display: flex;
                justify-content: space-between;
                height: 20px;
                line-height: 20px;
                margin-bottom: 61px;
                border-bottom: none;
                a{
                    font-size: 12px;
                    color: #cccccc;
                    &:hover{
                        color: #666666;
                    }
                }
                .pwd_remember{
                    &::before{
                        content: '';
                        display: inline-block;
                        width: 12px;
                        height: 12px;
                        margin-right: 8px;
                        border: solid 1px #cccccc;
                        border-radius: 2px;
                        vertical-align: middle;
                        margin-bottom: 2px;
                    }
                    &:hover{
                        &::before{
                            border-color: var(--mainColor);
                        }
                    }
                    &.check{
                        &::before{
                            background: var(--mainColor) url('../assets/pc/images/login/check_white.png') no-repeat center center;
                            border-color: var(--mainColor);
                        }
                    }
                }
                .pwd_forget{
                    border-bottom: 1px solid #cccccc;
                    &:hover{
                        border-bottom-color: #666666;
                    }
                }
            }
            .submit{
                background: var(--mainColor);
            }
        }
    }
    // 微信扫码界面
    .wechat, .bind_wechat{
        .center_main{
            text-align:center;
            .ewm{
                position:relative;
                width:210px;
                height:210px;
                margin:0 auto 90px;
            }
            img{
                width:100%;
                height:100%;
                user-select: none;
            }
            .qrcode_loading {
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                margin: auto;
                width: 80px;
                height: 80px;
            }
        }
    }
    // 手机、电子邮箱注册
    .phone, .email, 
    .bind_account, .phone_pwd, 
    .email_pwd, .bind_wechat{
        .sign_up_type{
            margin-bottom: 8px;
        }
        .field{
            height: 56px;
            padding-top: 24px;
            margin-bottom: 0;
            input{
                height: 31px;
                padding-top: 0;
            }
            .error{
                position: absolute;
                top: 13px;
                left: 0;
                font-size: 12px;
                letter-spacing: 1px;
	            color: #ff4500;
            }
            &.nickname_field{
                margin-bottom: 40px;
            }
            &.code_field{
                .hidden{
                    width: 0;
                    height: 0;
                    font-size: 0;
                }
                .mobile_code_btn{
                    position:absolute;
                    bottom:5px;
                    right:0;
                    z-index:2;
                    width:100px;
                    height:28px;
                    line-height:28px;
                    border-radius:4px;
                    background:#68adfb;
                    font-size:12px;
                    letter-spacing: 1px;
                    color:#ffffff;
                    text-align:center;
                    &.able, &:hover{
                        background:var(--mainColor);
                    }
                }
            }
            &.phone_field{
                .prefix{
                    position: absolute;
                    left: 0;
                    top: 29px;
                    width:42px;
                    height:20px;
                    line-height:20px;
                    margin-right: 9px;
                    font-size:14px;
                    color:#666666;
                    text-align:center;
                    &::after{
                        content: '';
                        display: inline-block;
                        width: 1px;
                        height: 10px;
                        margin-left: 8px;
                        background: #666666;
                        vertical-align: baseline;
                    }
                }
                input{
                    padding-left: 51px;
                }
            }
        }
        .submit_tips{
            padding-bottom: 23px;
            margin-bottom: 23px;
            border-bottom: solid 1px #e5e5e5;
            text-align: center;
            font-size: 14px;
            color: #cccccc;
            a{
                color: var(--mainColor);
            }
        }
        .submit{
            margin-bottom: 22px;
        }
        .valid_error{
            top: 395px;
            left: 0;
            width: 100%;
            text-align: center;
        }
    }
    // 绑定手机号或邮箱
    .bind_account{
        .header{
            padding-bottom: 45px;
        }
        .center_main{
            .bind_tip{
                font-size: 16px;
                color: #666666;
                text-align: center;
                margin-bottom: 56px;
            }
            .submit{
                margin-top: 92px;
            }
            .valid_error{
                top: 385px;
            }
            .phone_field{
                input{
                    padding-left: 0;
                }
            }
        }
    }
    .wechat_reg{
        .reg_code{
            display:inline-block;
            width:100%;
            font-size:14px;
            text-align:center;
            user-select: none;
            span{
                color: #ffffff;
            }
            .tip{
                color: #666666;
            }
            .ewm{
                position:relative;
                width:160px;
                height:160px;
                margin:0 auto;
            }
            div.ewm{
                margin: 22px auto 58px; 
            }
            img{
                width:100%;
                height:100%;
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
                padding-top: 50px;
            }
        }
        .submit_tips{
            padding-bottom: 60px;
            margin-bottom: 32px;
            border-bottom: 1px solid #e5e5e5;
            text-align: center;
            font-size: 14px;
            color: #cccccc;
            a{
                color: var(--mainColor);
            }
        }
    }
    .bind_wechat{
        .header{
            padding-bottom: 46px;
        }
        .reg_code{
            .ewm{
                margin-top: 50px;
            }
            .expired_tip{
                top: 50px;
            }
            .tip{
                font-size: 16px;
                color: #666;
            }
        }
    }
    // 密码重置
    .phone_pwd, .email_pwd{
        .center_main{
            .login_type{
                margin-bottom: 8px;
            }
            .repeat_pwd_field{
                margin-bottom: 40px;
            }
            .valid_error{
                top: 338px;
            }
        }
    }
    // 二维码失效
    .expired_tip{
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        box-sizing: border-box;
        background-color: rgba(0,0,0,.6);
        padding-top: 67px;
        text-align: center;
        font-size: 14px;
        span{
            display: block;
            color:#ffffff;
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
    // 嵌入登录页面样式
    .module{
        width: 460px;
        height: 680px;
        background-color: #ffffff;
        box-shadow: 2px 4px 24px 0px rgba(0, 0, 0, 0.16);
        border-radius: 16px;
        z-index: 9;
        overflow: hidden;
        padding: 80px 70px 0;
        .modal_contain{
            height: 100%;
            .contain_right{
                width: 100%;
            }
        }
    }
    .component{
        position: fixed;
        top: 0;
        left: 0;
        width: 100vw;
        height: 100vh;
        .modal_contain{
            position: absolute;
            top: 0;
            right: 0;
            bottom: 0;
            left: 0;
            width: 1020px;
            height: 680px;
            margin: auto;
            padding: 61px 65px 20px 79px;
            background: #ffffff url('../assets/pc/images/login/modal_bg.png') no-repeat center center/contain;
            box-shadow: 0px 4px 48px 0px rgba(0, 0, 0, 0.24);
            border-radius: 16px;
        }
    }
    @media screen and (max-height : 800px){
        .component .modal_contain{
            transform: scale(0.95);
        }
        .module{
            transform: scale(0.9);
        }
    }
    @media screen and (max-height : 750px){
        .component .modal_contain{
            transform: scale(0.85) !important;
        }
        .module{
            transform: scale(0.85) !important;
        }
    }
</style>

<script>
    export default {
        name: 'LoginModal',
        data() {
            return {
                user: null,
                show_modal: false,                  // 展示标识
                login_type: 'qrcode',               // 打开登录还是注册面板
                modal_class: 'component',           // 弹框样式 (组件还是页面)
                /** 微信扫码登录相关data */
                show_wxLogin: false,                //是否显示微信扫码组件
                weixin_qrcode_expire:true,          //是否已过期，默认已过期
                weixin_qrcode_expire_time: 300,       //5分钟过期
                weixin_qrcode_expire_timeer:"",     //微信二维码过期定时器，时刻检测过期
                weixin_qrcode_timeer:"",            //微信二维码登录定时器，时刻检测登录
                wechat_img:"",                      // 公众号二维码
                ewm_expired: false,                 // 二维码过期
                user_email:"",
                poling_code:"",

                /*输入校验相关*/
                valid_text: null,                   // 错误提示内容
                valid_detail_text: {
                    email: null,
                    phone: null,
                    code: null,
                    pwd: null,
                    repeat_pwd: null,
                    nick_name: null,
                },                                  // 详细的错误提示内容
                test_email: {
                    error: false,
                    success: false
                },                  // 邮箱校验结果
                test_code: {
                    error: false,
                    success: false
                },             // 验证码校验结果
                test_phone: {
                    error: false,
                    success: false
                },                  // 手机校验结果
                test_nick_name: {
                    error: false,
                    success: false
                },              // 昵称校验结果
                test_pwd: {
                    error: false,
                    success: false
                },                                  // 密码校验结果
                test_repeat_pwd: {
                    error: false,
                    success: false
                },             // 确认密码校验结果
                test_bind_account: {
                    error: false,
                    success: false,
                },            // 手机号或者邮箱校验结果
                code_text: '获取验证码',             // 验证码按钮文本
                can_get_code: true,                 // 获取验证码状态
                countdown:60,                       // 发送验证码倒计时

                valid_msg_show:false,
                mid:"SMS_150742979",                // 手机模版id（找回密码）
                sign_up_mid:'SMS_150738151',        // 手机模板id（手机注册）
                bind_mid: "SMS_150742973",           // 绑定账号mid
                // 验证码倒计时
                code_interval: null,
                account: '',                        // 输入的手机号或邮箱
                has_password: false,
                remember_pwd: false,                // 是否记住密码
                show_password: false,               // 展示密码标识
                toast_content: null,                // toast提示内容
                toast_show: false,                  // 展示toast提示标识
            } 
        },
        watch:{
            login_type(){
                this.$nextTick(function(){
                    $('input').val('');
                })
            },
            account: {
                handler(n, o) {
                    if (n && typeof n === 'string') {
                        this.account = n.replace(/\s/g, '');
                    }
                },
            },
        },
        mounted () {
        },
        methods: {
            // 打开登录弹框
            open (opt) {
                let that = this;
                let body = document.body || window.document.body;
                let option = {
                    type: 'qrcode',
                    className: 'component',
                }
                option = Object.assign(option, opt);
                that.login_type = option.type;
                that.modal_class = option.className;
                that.show_modal = true;
                that.change_login_type(that.login_type);
                that.modal_class === 'component' && $(body).css('overflow', 'hidden');
            },
            // 关闭弹框
            close () {
                let body = document.body || window.document.body;
                this.show_modal = false;
                this.modal_class === 'component' && $(body).css('overflow', 'auto');
                if (this.login_type === 'bind_wechat') this.$emit('success_callback');
                // 清除定时器 
                clearInterval(this.weixin_qrcode_expire_timeer);
                clearInterval(this.weixin_qrcode_timeer);
                clearInterval(this.code_interval);
            },
            // 获取用户个人信息
            get_user_info () {
                let that = this;
                that.user = that.$common.get_login_state()
                let no_email = $validate(that.user.email).empty(),
                    no_phone = $validate(that.user.mobile).empty();
                // 未设置密码
                if (!no_email && !no_phone) that.has_password = true;
            },
            // 清除空格
            remove_space(e, key) {
                let value = e.target.value;
                let nowrap_value;
                if (typeof value === 'string' && value.includes(' ')) {
                    nowrap_value = value.replace(/\s/g, '');
                    this.$refs[key].value = nowrap_value;
                }
            },
            /*------------------- wechat start -------------------*/

            // 设置小程序码链接
            get_wxlogin_msg (type){
                let that = this;
                let sceneType = type === 'bind_wechat' ? 'binding' : 'login';
                that.$axios.get("/api/weixin/app/create_app_code/",{params:{sceneType :sceneType}})
                .then((data) => {
                    that.wechat_img = "data:image/png;base64," + data.data.data.image;
                    that.weixin_qrcode_expire = false;
                    that.weixin_qrcode_expire_time = 300;
                    that.show_wxLogin = true;
                    that.ewm_expired = false;
                    that.poling_code = data.data.data.polingCode;
                    that.wechat_timmer_start();
                })
            },
            // 微信扫码检测
            weixin_login_check () {
                let that = this;
                let sceneType = that.login_type === 'bind_wechat' ? 'binding' : 'login';
                that.$axios.get("/api/weixin/app/check_scan/",{params:{polingCode: that.poling_code,sceneType: sceneType}})
                .then(function(data){
                    if(data.data.code === "2"){
                        let toast_content = that.login_type === 'bind_wechat' ? '绑定成功' : '登录成功';
                        that.get_user_info();
                        that.$toast(toast_content, 2000);
                        that.$emit('get_user_info');
                        // 清除定时器 
                        clearInterval(that.weixin_qrcode_expire_timeer);                
                        clearInterval(that.weixin_qrcode_timeer);
                        // toast延时
                        setTimeout(function(){
                            if(!utils.getCookies('woodo_memberMobile') && !utils.getCookies('woodo_memberEmail')){
                                that.change_login_type('bind_account');
                                return;
                            }
                            that.close();
                            that.$emit('success_callback');
                        },500);
                    } else if (data.data.code === '3') {
                        // 清除定时器 
                        clearInterval(that.weixin_qrcode_expire_timeer);                
                        clearInterval(that.weixin_qrcode_timeer);
                        that.ewm_expired = true;
                        that.$toast(data.data.content, 2000);
                    }
                });
            },
            // 二维码刷新
            refresh_wexin_qrcode () {
                let that = this;
                // 重新获取微信登录二维码
                that.get_wxlogin_msg(that.login_type);
                // 启动定时器
                that.wechat_timmer_start();
            },

            wechat_timmer_start () {
                let that = this;
                // 启动扫描登录检测定时器
                that.weixin_qrcode_expire_timeer = setInterval(that.weixin_login_check,1500);
                // 二维过期定时器，5分钟过期
                that.weixin_qrcode_timeer = setInterval(function(){
                    that.weixin_qrcode_expire_time--;
                    if(that.weixin_qrcode_expire_time <= 0){
                        // 清除定时器 
                        clearInterval(that.weixin_qrcode_expire_timeer);
                        clearInterval(that.weixin_qrcode_timeer);
                        that.ewm_expired = true;
                    }
                },1000);
            },

            /*------------------- wechat end -------------------*/

            // 切换登录方式
            change_login_type (type) {
                let that = this;
                // 清除定时器 
                clearInterval(that.weixin_qrcode_expire_timeer);
                clearInterval(that.weixin_qrcode_timeer);
                clearInterval(that.code_interval);
                that.$emit('type_change',type);
                // 初始化状态
                that.countdown = 60;
                that.wechat_img = null;
                that.valid_text = null;
                that.account = null;
                that.valid_detail_text = {
                    email: null,
                    phone: null,
                    code: null,
                    pwd: null,
                    repeat_pwd: null,
                    nick_name: null,
                },     
                that.test_email = {error: false, success: false};
                that.test_code = {error: false, success: false};
                that.test_phone = {error: false, success: false};
                that.test_nick_name = {error: false, success: false};
                that.test_pwd = {error: false, success: false};
                that.test_repeat_pwd = {error: false, success: false};
                that.test_bind_account = {error: false, success: false};
                that.can_get_code = true;
                that.code_text ='获取验证码';
                that.login_type = type;
                // 切换到二维码登录页后才进行轮询
                if (['wechat', 'qrcode', 'bind_wechat'].indexOf(type) >=0 ) that.get_wxlogin_msg(type)
                if (type === 'bind_account') that.get_user_info();
                if (type === 'account') {
                    that.$nextTick(() => {
                        setTimeout(() => {
                            that.get_cookies();
                        }, 30)
                    })
                }
                // 切换时清除表单数据，防止表单数据乱套
                $('.center_main input').each(() => {
                    $(this).val(null);
                })
            },
            // 校验昵称是否可用
            useful_nick_name (name, callback) {
                let that = this,
                    result;
                that.$axios.get("/api/register/check_nickName/",{params:{nickName:name}})
                    .then(function(data){
                        if(data.data.code === '2'){
                            result = true;
                        }else{
                            result = false;
                        }
                        if(typeof callback === 'function'){callback(result)}
                    })
            },
            // 校验邮箱是否可用
            useful_email (email,callback) {
                let that = this,
                    result,content;
                that.$axios.get("/api/register/check_email/",{params:{email:email}})
                    .then(function(data){
                        if(data.data.code === '2'){
                            result = true;
                            content = '';
                        }else{
                            result = false;
                            content = data.data.content;
                        }
                        if(typeof callback === 'function'){callback(result,content)}
                    })
            },
            // 校验手机是否可用
            useful_phone (phone, callback) {
                let that = this,
                    result,
                    tips;
                that.$axios.get("/api/register/check_mobile/",{params:{mobile:phone}})
                .then(function(data){
                    let code = data.data.code;
                    if(typeof callback === 'function'){callback(code)}
                })
            },

            /*帐号登录*/
            username_submit_event () {
                let that = this,
                    password = that.$refs.password.value,
                    username = that.$refs.username.value.replace(/\s/g, '');
                that.valid_text = '';
                if($validate(password).empty() || $validate(username).empty()){
                    that.valid_text = '请输入登录账号和密码';
                    return false;
                }
                $(".accounts .submit button").prop("disabled", true);
                that.$axios.get("/api/common/public_key/").then(function(data){
                    let RsaKey = that.$rsa,
                        Base64 = that.$base64,
                        rsakey = new RsaKey(),
                        base64 = new Base64(),
                        modulus = data.data.modulus,
                        exponent = data.data.exponent;
                    rsakey.setPublic(base64.b64tohex(modulus), base64.b64tohex(exponent));
                    let enPassword = base64.hex2b64(rsakey.encrypt(password));
                    that.$axios.post("/api/login/submit/",{username: username, enPassword: enPassword,})
                    .then(function(data){
                        if (data.data.code === '2'){
                            that.$toast("登录成功", 2000);
                            that.get_user_info();
                            that.$emit('get_user_info');
                            that.valid_text = null;
                            if (that.remember_pwd) {
                                that.set_cookies();
                            } else {
                                that.delete_cookies();
                            }
                            setTimeout(function(){
                                // 判断是否绑定微信
                                let user = that.$common.get_login_state();
                                if(user.BindWeixin){
                                    that.close();
                                    that.$emit('success_callback');
                                }else{
                                    that.change_login_type('bind_wechat');
                                }
                            }, 300);
                        } else if (data.data.code === '3') {
                            that.valid_text = data.data.content;
                            let error_count = 5 - Number(data.data.data); // data是当前次数，剩余次数显示需要+1
                            if (error_count <= 3 && error_count >= 0) {
                                that.valid_text = '用户名或密码错误，再输入' + error_count + '次将锁定该账号';
                            }
                            if (error_count <= 0) {
                                that.valid_text = '用户名或密码错误，账号已被锁定，24小时后解除';
                            }
                        } else {
                            that.valid_text = data.data.content;
                        }
                        $(".accounts .submit button").prop("disabled", false);
                    })
                })
            },
            /* 记住密码功能 */
            toggle_remember_pwd () {
                this.remember_pwd = !this.remember_pwd;
            },
            // 设置cookies
            set_cookies () {
                let that = this;
                let account = that.$refs.username.value.replace(/\s/g, '');
                let pwd = that.$refs.password.value;
                // 存储cookie时插入盐值
                let salt_value = '500dwoodo';
                pwd = salt_value + pwd;
                pwd = window.btoa(pwd);
                utils.setCookies('woodo_remember_pwd', true);
                utils.setCookies('woodo_account', account);
                utils.setCookies('woodo_pwd', pwd);
            },
            // 获取cookies
            get_cookies () {
                let that = this;
                if (!utils.getCookies('woodo_remember_pwd')) return false;
                that.remember_pwd = true;
                let account = utils.getCookies('woodo_account');
                let pwd = utils.getCookies('woodo_pwd');
                let salt_value = '500dwoodo';
                pwd = window.atob(pwd).replace(salt_value,'');
                $('.username_field input').val(account);
                $('.pwd_field input').val(pwd)
            },
            // 删除cookies
            delete_cookies () {
                utils.deleteCookies('woodo_remember_pwd');
                utils.deleteCookies('woodo_account');
                utils.deleteCookies('woodo_pwd');
            },
            /*邮箱注册*/
            // 邮箱校验
            validate_email () {
                let that = this,
                    email = that.account;
                if(!email){
                    that.valid_detail_text.email = null;
                    that.test_email = {error: false, success: false};
                    return false;
                }
                if(!$validate(email).email()){
                    that.valid_detail_text.email = "格式错误";
                    that.test_email = {error: true, success: false};
                    return false;
                }
                that.useful_email(email,function(result,content){
                    if(that.login_type === 'email' && !result){
                        that.valid_detail_text.email = content;
                        that.test_email = {error: true, success: false};
                    }else if(that.login_type === 'email_pwd' && result){
                        that.valid_detail_text.email = '该邮箱号未注册，请检查后输入';
                        that.test_email = {error: true, success: false};
                    }else{
                        that.valid_detail_text.email = null;
                        that.test_email = {error: false, success: true};
                    }
                });
            },
            // 获取邮箱验证码
            get_email_code () {
                let that = this,
                    type = that.login_type,
                    email = that.account,
                    mid = null,
                    en_email;
                if (type === 'email') {
                    mid = that.sign_up_mid;
                } else {
                    mid = type === 'bind_account' ? that.bind_mid : that.mid;
                }
                if (!that.can_get_code) return false;
                if (that.test_email.error ) return false; 
                if (that.login_type === 'bind_account' && !that.test_bind_account.success ) return false; 
                that.$axios.get("/api/common/public_key/",{params: {
                    email: email
                }}).then(function(data){
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
                        enEmail: en_email,
                        modulus:modulus,
                        exponent:exponent
                    })
                        .then(function(data){
                            if(data.data.code === '2'){
                                that.show_toast('验证码已发送，注意邮箱通知~');
                                that.can_get_code = false;
                                that.code_text = '重新发送' + that.countdown;
                                that.code_interval = setInterval(function(){
                                    if(that.countdown <= 0){
                                        clearInterval(that.code_interval);
                                        that.code_text = '获取验证码';
                                        that.countdown = 60;
                                        that.can_get_code = true;
                                    }else{
                                        that.countdown += -1;
                                        that.code_text = '重新发送' + that.countdown;
                                    }
                                },1000);
                            }else{
                                that.show_toast(data.data.content);
                            }
                        })
                });
            },
            // 密码校验
            validate_password (e) {
                let that = this,
                    pwd = e.target.value,
                    pwd_reg = /^(\w){6,20}$/;
                if(pwd === ''){
                    that.valid_detail_text.pwd = null;
                    that.test_pwd = {error: false, success: false};
                    return false;
                }
                if(pwd.length < 6 || pwd.length > 20){
                    that.valid_detail_text.pwd = '请输入6-20个字符的密码';
                    that.test_pwd = {error: true, success: false};
                    return false;
                }
                if(!pwd_reg.test(pwd)){
                    that.valid_detail_text.pwd = '只能输入6-20个字母、数字、下划线';
                    that.test_pwd = {error: true, success: false};
                    return false;
                }
                if(that.login_type !== 'bind_account' && pwd === that.$refs.repeat_pwd.value && that.$refs.repeat_pwd.value) {
                    that.valid_detail_text.repeat_pwd = null;
                    that.test_repeat_pwd = {error: false, success: true};
                }
                that.valid_detail_text.pwd = null;
                that.test_pwd = {error: false, success: true};
            },
            // 昵称校验
            validate_nickname (e) {
                let that = this,
                    name = e.target.value,
                    str_reg = /^[a-zA-Z0-9_\-\u4e00-\u9fa5]+$/;
                if(name === ''){
                    that.valid_detail_text.nick_name = null;
                    that.test_nick_name = {error: false, success: false};
                    return false;
                }
                if(name.length > 6){
                    that.valid_detail_text.nick_name = '不能超过6个字符哦~';
                    that.test_nick_name = {error: true, success: false};
                    return false;
                }
                if(!str_reg.test(name)){
                    that.valid_detail_text.nick_name = '昵称不能含有特殊字符！';
                    that.test_nick_name = {error: true, success: false};
                    return false;
                }
                that.useful_nick_name(name, function(result){
                    if(result){
                        that.valid_detail_text.nick_name = null;
                        that.test_nick_name = {error: false, success: true};
                    }else{
                        that.valid_detail_text.nick_name = '该昵称已被占用';
                        that.test_nick_name = {error: true, success: false};
                    }
                });
            },
            // 邮箱注册提交事件
            email_register () {
                let that = this,
                    email = that.$refs.email.value,
                    code = that.$refs.code.value,
                    password = that.$refs.password.value,
                    nick_name = that.$refs.nick_name.value;
                if(!that.test_email.error && !that.test_email.success){
                    that.test_email.error = true;
                    that.valid_text = "请完善注册内容";
                    return false;
                }
                if(!that.test_nick_name.error && !that.test_nick_name.success){
                    that.test_nick_name.error = true;
                    that.valid_text = "请完善注册内容";
                    return false;
                }
                if(!that.test_pwd.error && !that.test_pwd.success){
                    that.test_pwd.error = true;
                    that.valid_text = "请完善注册内容";
                    return false;
                }
                if(!that.test_repeat_pwd.error && !that.test_repeat_pwd.success){
                    that.test_repeat_pwd.error = true;
                    that.valid_text = "请完善注册内容";
                    return false;
                }
                if(!that.test_code.error && !that.test_code.success){
                    that.test_code.error = true;
                    that.valid_text = "请完善注册内容";
                    return false;
                }
                $(".submit button").prop("disabled", true);
                that.$axios.get("/api/common/public_key/").then(function(data){
                    let RsaKey = that.$rsa,
                        Base64 = that.$base64,
                        rsakey = new RsaKey(),
                        base64 = new Base64(),
                        modulus = data.data.modulus,
                        exponent = data.data.exponent;
                    rsakey.setPublic(base64.b64tohex(modulus), base64.b64tohex(exponent));
                    let enPassword = base64.hex2b64(rsakey.encrypt(password));
                    that.$axios.post("/api/register/submit/",{
                        code: code,
                        nickName: nick_name,
                        email: email,
                        enPassword: enPassword,
                        mid: that.sign_up_mid
                    }).then(function(data){
                            if(data.data.code === '2'){
                                that.show_toast("注册成功~");
                                that.get_user_info();
                                that.$emit('get_user_info');
                                // 判断是否绑定微信
                                let user = that.user;
                                if(user.BindWeixin){
                                    that.close();
                                    that.$emit('success_callback');
                                }else{
                                    that.change_login_type('bind_wechat');
                                }
                            }else{
                                let content = data.data.content;
                                that.valid_text = content;
                                switch(true){
                                    case content.indexOf('验证码') >= 0 :
                                        that.test_code = {error: true, success: false};
                                        break;
                                    case content.indexOf('邮箱') >= 0 :
                                        that.test_email = {error: true, success: false};
                                        break;
                                    case content.indexOf('密码') >= 0 :
                                        that.test_pwd = {error: true, success: false};
                                        break;
                                    case content.indexOf('昵称') >= 0 :
                                        that.test_nick_name = {error: true, success: false};
                                        break;
                                }
                            }
                            $(".submit button").prop("disabled", false);
                    })
                });
            },

            /*------------------- 手机注册 -------------------*/

            // 手机校验
            validate_phone (get_code) {
                let that = this,
                    phone = that.account;
                if(!phone){
                    that.valid_detail_text.phone = null;
                    that.test_phone = {error: false, success: false};
                    return false;
                }
                if(!$validate(phone).phone()){
                    that.valid_detail_text.phone = "格式错误";
                    that.test_phone = {error: true, success: false};
                    return false;
                }
                that.useful_phone(phone,function(code){
                    if(that.login_type === 'phone' && code !== '2'){
                        if(code === '3'){
                            that.valid_detail_text.phone = '该手机已被注册，请直接登录';
                            that.test_phone = {error: true, success: false};
                        }else{
                            that.valid_detail_text.phone = '该号码格式暂不支持，请更换后继续';
                            that.test_phone = {error: true, success: false};
                        }
                    }else if(that.login_type === 'phone_pwd' && code === '2'){
                        that.valid_detail_text.phone = '该手机未注册，请检查后输入';
                        that.test_phone = {error: true, success: false};
                    }else{
                        that.valid_detail_text.phone = null;
                        that.test_phone = {error: false, success: true};
                        if (get_code) that.get_phone_code;
                    }
                });
            },
            // 获取手机验证码
            get_phone_code () {
                let that = this,
                    type = that.login_type,
                    phone = that.account,
                    mid = null;
                if (type === 'phone') {
                    mid = that.sign_up_mid;
                } else {
                    mid = type === 'bind_account' ? that.bind_mid : that.mid;
                }
                if (!that.can_get_code) return false;
                if (that.test_phone.error ) return false; 
                if (that.login_type === 'bind_account' && !that.test_bind_account.success ) return false; 
                that.$axios.post('/api/common/mobile_code_ext/',{
                    mobile: phone,
                    mid: mid
                }).then(function(data){
                        if(data.data.code === '2'){
                            that.show_toast('验证码已发送，注意短信通知~');
                            that.can_get_code = false;
                            that.code_text = '重新发送' + that.countdown;
                            that.code_interval = setInterval(function(){
                                if(that.countdown <= 0){
                                    clearInterval(that.code_interval);
                                    that.can_get_code = true;
                                    that.code_text = '获取验证码';
                                    that.countdown = 60;
                                }else{
                                    that.countdown += -1;
                                    that.code_text = '重新发送' + that.countdown;
                                }
                            },1000);
                        }else{
                            that.show_toast(data.data.content);
                        }
                    })
            },
            // 手机注册提交事件
            phone_register () {
                let that = this,
                    mobile = that.$refs.phone.value,
                    code = that.$refs.phone_code.value,
                    password = that.$refs.password.value,
                    nick_name = that.$refs.nick_name.value;
                if(!that.test_phone.error && !that.test_phone.success){
                    that.test_phone.error = true;
                    that.valid_text = "请完善注册内容";
                    return false;
                }
                if(!that.test_nick_name.error && !that.test_nick_name.success){
                    that.test_nick_name.error = true;
                    that.valid_text = "请完善注册内容";
                    return false;
                }
                if(!that.test_pwd.error && !that.test_pwd.success){
                    that.test_pwd.error = true;
                    that.valid_text = "请完善注册内容";
                    return false;
                }
                if(!that.test_code.error && !that.test_code.success){
                    that.test_code.error = true;
                    that.valid_text = "请完善注册内容";
                    return false;
                }
                if(!that.test_repeat_pwd.error && !that.test_repeat_pwd.success){
                    that.test_repeat_pwd.error = true;
                    that.valid_text = "请完善注册内容";
                    return false;
                }
                $(".submit button").prop("disabled", true);
                that.$axios.get("/api/common/public_key/").then(function(data){
                    let RsaKey = that.$rsa,
                        Base64 = that.$base64,
                        rsakey = new RsaKey(),
                        base64 = new Base64(),
                        modulus = data.data.modulus,
                        exponent = data.data.exponent;
                    rsakey.setPublic(base64.b64tohex(modulus), base64.b64tohex(exponent));
                    let enPassword = base64.hex2b64(rsakey.encrypt(password));
                    that.$axios.post("/api/register/mobile_submit/",{
                        mid: that.sign_up_mid,
                        code: code,
                        mobile: mobile,
                        nickName: nick_name,
                        enPassword: enPassword
                    })
                        .then(function(data){
                            if(data.data.code === '2'){
                                that.show_toast("注册成功~");
                                that.get_user_info();
                                that.$emit('get_user_info');
                                // 判断是否绑定微信
                                let user = that.user;
                                if(user.BindWeixin){
                                    that.close();
                                    that.$emit('success_callback');
                                }else{
                                    that.change_login_type('bind_wechat')
                                }
                            }else{
                                let content = data.data.content;
                                that.valid_text = content;
                                switch(true){
                                    case content.indexOf('验证码') >= 0 :
                                        that.test_code = {error: true, success: false};
                                        break;
                                    case content.indexOf('手机') >= 0 :
                                        that.test_phone = {error: true, success: false};
                                        break;
                                    case content.indexOf('密码') >= 0 :
                                        that.test_pwd = {error: true, success: false};
                                        break;
                                    case content.indexOf('昵称') >= 0 :
                                        that.test_nick_name = {error: true, success: false};
                                        break;
                                }
                            }
                            $(".submit button").prop("disabled", false);
                        })
                });
            },

            /*------------------- 找回密码 -------------------*/

            // 确认密码校验
            validate_repeat_pwd (e) {
                let that = this,
                    password = that.$refs.password.value,
                    repeat_password = e.target.value;
                // 判断密码输入错误 -> 返回
                if(that.test_pwd.error) return false;
                if(!password){
                    that.valid_detail_text.repeat_pwd = null;
                    that.test_repeat_pwd = {error: false, success: false};
                    return false;
                }
                if(password !== repeat_password){
                    that.valid_detail_text.repeat_pwd = '两次输入密码不一致';
                    that.test_repeat_pwd = {error: true, success: false};
                    return false;
                }
                that.valid_detail_text.repeat_pwd = null;
                that.test_repeat_pwd = {error: false, success: true};
            },
            // 重置密码
            reset_password () {
                let that = this,
                    password = that.$refs.password.value,
                    test_account = that.login_type === 'email_pwd' ? 'test_email' : 'test_phone';
                that.valid_text = '';
                if(!that[test_account].error && !that[test_account].success){
                    that[test_account].error = true;
                    that.valid_text = "请输入正确的信息";
                }
                if(!that.test_pwd.error && !that.test_pwd.success){
                    that.test_pwd.error = true;
                    that.valid_text = "请输入正确的信息";
                }
                if(!that.test_repeat_pwd.error && !that.test_repeat_pwd.success){
                    that.test_repeat_pwd.error = true;
                    that.valid_text = "请输入正确的信息";
                }
                if(!that.test_code.error && !that.test_code.success){
                    that.test_code.error = true;
                    that.valid_text = "请输入正确的信息";
                }
                if(that[test_account].error || that.test_code.error || that.test_pwd.error || that.test_repeat_pwd.error) return false;
                let code, user_name, mid, enPassword;
                if (that.login_type === 'email_pwd') {
                    code = that.$refs.email_code.value;
                    user_name = that.$refs.email.value;
                    mid = that.mid;
                } else {
                    user_name = that.$refs.phone.value;
                    code = that.$refs.phone_code.value;
                    mid = that.mid;
                }
                if(code.length <= 0) return false;
                that.$axios.get("/api/common/public_key/").then(function(data){
                    let RsaKey = that.$rsa,
                        Base64 = that.$base64,
                        rsakey = new RsaKey(),
                        base64 = new Base64(),
                        modulus = data.data.modulus,
                        exponent = data.data.exponent;
                    rsakey.setPublic(base64.b64tohex(modulus), base64.b64tohex(exponent));
                    enPassword = base64.hex2b64(rsakey.encrypt(password));
                    that.$axios.post('/api/password/find_password_submit/', {
                        code: code,
                        username: user_name,
                        mid: mid,
                        enPassword: enPassword
                    })
                        .then(function (data) {
                            if(data.data.code === '2'){
                                that.can_get_code = true;
                                that.show_toast('修改成功');
                                that.delete_cookies();
                                that.change_login_type('account');
                            }else{
                                let content = data.data.content;
                                that.valid_text = content;
                                if (that.login_type === 'email_pwd'){
                                    switch (true) {
                                        case content.indexOf('验证码') >= 0 :
                                            that.test_code = {error: true, success: false};
                                            break;
                                        case content.indexOf('邮箱') >= 0 :
                                            that.test_email = {error: true, success: false};
                                            break;
                                        case content.indexOf('密码') >= 0 :
                                            that.test_pwd = {error: true, success: false};
                                            break;
                                    }
                                }else{
                                    switch (true) {
                                        case content.indexOf('验证码') >= 0 :
                                            that.test_code = {error: true, success: false};
                                            break;
                                        case content.indexOf('手机') >= 0 :
                                            that.test_phone = {error: true, success: false};
                                            break;
                                        case content.indexOf('密码') >= 0 :
                                            that.test_pwd = {error: true, success: false};
                                            break;
                                    }
                                }
                            }
                        })
                });
            },

            /* 验证码校验 */
            validate_code (e) {
                let that = this,
                    code = e.target.value,
                    code_reg = /^\d{6}$/,
                    obj = that.test_code;
                if(code === ''){
                    that.valid_detail_text.code = null;
                    obj = {error: false, success: false};
                    that.test_code = obj;
                    return false;
                }
                if(!code_reg.test(code)){
                    that.valid_detail_text.code = "请输入正确的验证码";
                    obj = {error: true, success: false};
                    that.test_code = obj;
                    return false;
                }
                that.valid_detail_text.code = null;
                obj = {error: false, success: true};
                that.test_code = obj;
            },

            // 控制密码是否明文展示
            toggle_password_show (e) {
                let that = this;
                let $input = $(e.target).parent().find('input');
                let type = $input.attr('type') === 'password' ? 'text' : 'password';
                $input.attr('type', type);
                that.show_password = ! that.show_password;
                $(e.target).toggleClass('show');
            }, 

            /*------------------- 绑定账号 -------------------*/
            validate_account (get_code) {
                let that = this,
                    account = that.account;
                if (!account) {
                    that.valid_detail_text.account = null;
                    that.test_bind_account = {error: false, success: false};
                    return false;
                }
                if (!$validate(account).phone() && !$validate(account).email()) {
                    that.valid_detail_text.account = "格式错误";
                    that.test_bind_account = {error: true, success: false};
                    return false;
                }
                // 手机号校验
                if ($validate(account).phone()) {
                    that.useful_phone(account, (code) => {
                        if (code === '2') {
                            that.valid_detail_text.account = null;
                            that.test_bind_account = {error: false, success: true};
                            if (that.can_get_code && get_code) that.get_phone_code();
                        } else {
                            that.valid_detail_text.account = '该手机已被绑定';
                            that.test_bind_account = {error: true, success: false};
                        }
                    })
                }
                // 邮箱号校验
                if ($validate(account).email()) {
                    that.useful_email(account, (result,content) => {
                        if (!result) {
                            that.valid_detail_text.account = '该邮箱已被绑定';
                            that.test_bind_account = {error: true, success: false};
                        } else {
                            that.valid_detail_text.account = null;
                            that.test_bind_account = {error: false, success: true};
                            if (that.can_get_code && get_code) that.get_email_code();
                        }
                    });
                }
            },
            // 绑定手机或邮箱
            bind_account () {
                let that = this;
                let account = that.account;
                if (!that.test_bind_account.error && !that.test_bind_account.success) {
                    that.test_bind_account.error = true;
                    that.valid_text = "请输入正确的信息";
                    return false;
                }
                if (!that.test_code.error && !that.test_code.success){
                    that.test_code.error = true;
                    that.valid_text = "请输入正确的信息";
                    return false;
                }
                if (!that.test_pwd.error && !that.test_pwd.success && !that.has_password){
                    that.test_pwd.error = true;
                    that.valid_text = "请输入正确的信息";
                    return false;
                }
                if ($validate(account).phone()) {
                    that.bind_account_by_type('mobile');
                } else {
                    that.bind_account_by_type('email');
                }
            },
            // 绑定邮箱或手机号
            bind_account_by_type (type) {
                let that = this;
                let account = that.account;
                let code = that.$refs.code.value;
                let url = `/api/member/bind_${type}_submit/`;
                let params = {}
                if (type === 'email') {
                    params = {
                        mid: that.bind_mid,
                        email: account,
                        code: code,
                    } 
                } else {
                    params = {
                        mid: that.bind_mid,
                        mobile: account,
                        code: code,
                    } 
                }
                // 已有密码时
                if (that.has_password) {
                    that.$axios.post(url, params).then((data) =>{
                        if (data.data.code === '2') {
                            that.$toast("关联成功", 2000);
                            that.close();
                            that.$emit('success_callback');
                        } else {
                            that.$toast(data.data.content, 2000);
                        }
                    })
                } else {
                    let password = that.$refs.password.value;
                    that.$axios.get("/api/common/public_key/").then((data) => {
                        let res_data = data.data;
                        let RsaKey = that.$rsa,
                            Base64 = that.$base64,
                            rsakey = new RsaKey(),
                            base64 = new Base64(),
                            modulus = res_data.modulus,
                            exponent = res_data.exponent;
                        rsakey.setPublic(base64.b64tohex(modulus), base64.b64tohex(exponent));
                        let enPassword = base64.hex2b64(rsakey.encrypt(password));
                        params.enPassword = enPassword;
                        that.$axios.post(url, params).then((data) => {
                            if (data.data.code === '2') {
                                that.$toast("关联成功", 2000);
                                that.close();
                                that.$emit('success_callback');
                            } else {
                                that.$toast(data.data.content, 2000);
                            }                                      
                        })
                    });
                }
            },
            // 重置输入框状态
            reset_input_state (type) {
                let that = this;
                let test = `test_${type}`
                let all_have_value = true;
                $('.center_main input').each((index, ele) => {
                    if (!$(ele).hasClass('hidden') && !$(ele).val()) all_have_value = false;
                })
                if (all_have_value) {
                    $('.center_main .submit').addClass('able');
                } else {
                    $('.center_main .submit').removeClass('able');
                }
                if (that[test]) {
                    that[test] = {error: false, success: false};
                    that.valid_detail_text[type] = null;
                }
            },
            // 显示toast提示
            show_toast (content) {
                let that = this;
                that.toast_content = content;
                that.toast_show = true;
                setTimeout(() => {
                    that.toast_show = false;
                    that.toast_content = null;
                }, 1500)
            },
        },
    }
</script>
