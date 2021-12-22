<template>
    <div class="member_contain">
        <!--回退按钮-->
        <a class="member_return" v-on:click="back" v-show="member_types !== '' && member_types !== 'update_uname'"></a>

        <!--账户设置首页-->
        <div class="member_index" v-if="member_types === '' || member_types === 'update_uname'">
            <div class="member_header">
                <div class="member_avatar">
                    <img :src="user_info.headUrl" @click="update_pic" v-show="user_info.headUrl">
                    <input type="file" name="user_pic" accept="image/*" @change="new_pic($event)" class="hidden_input" ref="submit_pic"/>
                </div>
                <p class="member_nickname">{{user_info.nickName}}</p>
                <!-- 企业版 -->
                <div class="member_grade enterprise" v-if="user_info.memberRankType === 'enterprise'">
                    <i></i>
                    <span>{{ user_info.memberVipCn }}</span>
                    <small>到期时间：{{ user_info.memberRankExpire }}</small>
                    <a href="/mobile/member/upgrade/" class="member_upgrade">立即升级</a>
                </div>
                <!-- 个人版 -->
                <div class="member_grade personal" v-else-if="user_info.memberRankType === 'personal'">
                    <i></i>
                    <span>{{ user_info.memberVipCn }}</span>
                    <small>到期时间：{{ user_info.memberRankExpire }}</small>
                    <a href="/mobile/member/upgrade/" class="member_upgrade">立即升级</a>
                </div>
                <!-- 高级版 -->
                <div class="member_grade premium" v-else-if="user_info.memberRankType === 'premium'">
                    <i></i>
                    <span>{{ user_info.memberVipCn }}</span>
                    <small>到期时间：{{ user_info.memberRankExpire }}</small>
                    <a href="/mobile/member/upgrade/" class="member_upgrade">立即升级</a>
                </div>
                <!-- 普通版 -->
                <div class="member_grade professional" v-else-if="user_info.memberRankType === 'professional'">
                    <i></i>
                    <span>{{ user_info.memberVipCn }}</span>
                    <small>到期时间：{{ user_info.memberRankExpire }}</small>
                    <a href="/mobile/member/upgrade/" class="member_upgrade">立即升级</a>
                </div>
                <!-- 免费版 -->
                <div class="member_grade" v-else>
                    <i></i>
                    <span>{{ user_info.memberVipCn }}</span>
                    <small>更多权益请升级体验</small>
                    <a href="/mobile/member/upgrade/" class="member_upgrade">立即升级</a>
                </div>
            </div>
            <!--信息显示和操作-->
            <ul class="member_body">
                <li class="index_list_hcoin">
                    <a href="/mobile/hcoin/special/" class="link">
                        <i></i>
                        <span>幻币：<strong class="hcoin">{{user_info.hcoin}}</strong></span>
                        <span class="right">如何获取幻币？</span>
                        <a href="/mobile/member/recharge/" class="right">充值幻币</a>
                    </a>
                </li>
                <li class="index_list_upgrade">
                    <a href="/mobile/member/upgrade/" class="link">
                        <i></i>
                        <span>VIP会员</span>
                        <span class="right">开通会员享受更多权益</span>
                    </a>
                </li>
                <li class="index_list_order">
                    <a href="/mobile/member/order/" class="link">
                        <i></i>
                        <span>订单记录</span>
                    </a>
                </li>
                <li class="index_list_message">
                    <a href="/mobile/notification/" class="link">
                        <i></i>
                        <span>消息通知</span>
                    </a>
                </li>
            </ul>
            <ul class="member_body">
                <li class="index_list_wechat" :class="{'no_ops':wx_state}" v-on:click="member_type(!wx_state ? 'bind_wechat' : '')">
                    <i></i>
                    <span>微信：{{user_info.bindWechat ? '已绑定' : '未绑定'}}</span>
                </li>
                <li class="index_list_nickname" v-on:click="member_type('update_uname')">
                    <i></i>
                    <span>昵称：{{user_info.nickName}}</span>
                </li>
                <li class="index_list_phone" v-on:click="member_type(tel_state ? 'original_mobile' : 'mobile_bind')">
                    <i></i>
                    <span>手机：{{tel_state ? user_info.mobile : '未绑定'}}</span>
                </li>
                <li class="index_list_email" v-on:click="member_type(email_state ? 'original_email' : 'bind_email')">
                    <i></i>
                    <span>邮箱：{{email_state ? user_info.email : '未绑定'}}</span>
                </li>
                <li class="index_list_password" v-on:click="member_type('update_pwd')">
                    <i></i>
                    <span>密码：{{pwd}}</span>
                </li>
            </ul>
            <div class="member_logout">
                <a href="/mobile/home/" class="left">
                    <i></i>
                    <span>返回文档中心</span>
                </a>
                <div class="right" @click="logout">
                    <i></i>
                    <span>退出</span>
                </div>
            </div>
        </div>

        <!--昵称修改弹框-->
        <transition name="modal_fade">
            <div class="change_name_modal" v-if="member_types=='update_uname'">
                <div class="modal_content">
                    <span>修改昵称</span>
                    <input ref="uname" type="text">
                    <a v-on:click="confirm_update">确认</a>
                    <a v-on:click="cancel_update">取消</a>
                </div>
            </div>
        </transition>

        <!--密码修改页-->
        <div class="user_pwd_update" v-if="member_types=='update_pwd'">
            <span>设置新密码</span>
            <ul>
                <li>
                    <span class="pwd_icon"></span>
                    <input type="password" @focus="input_get_focus($event)" @blur="input_get_blur($event,'pwd')" placeholder="请输入原始密码" ref="original_pwd" @input="validate_input_value('pwd_update')">
                    <p class="error_tip" v-if="wrong_pwd">{{wrong_pwd_message}}</p>
                </li>
                <li>
                    <span class="pwd_icon"></span>
                    <input type="password" @focus="input_get_focus($event)" @blur="input_get_blur($event,'pwd')" placeholder="请输入新密码" ref="setting_pwd" @input="validate_input_value('pwd_update')">
                    <p class="error_tip" v-if="wrong_pwd">{{wrong_pwd_message}}</p>
                </li>
                <li>
                    <span class="pwd_icon"></span>
                    <input type="password"  @focus="input_get_focus($event)" @blur="input_get_blur($event,'repwd')" placeholder="请输入新密码" ref="confirm_pwd" @input="validate_input_value('pwd_update')">
                </li>
            </ul>
            <button v-on:click="pwd_update" :disabled="!btn_active">确认修改</button>
            <a href="/mobile/login/?type=find_pwd">忘记密码</a>
        </div>

        <!--手机绑定页-->
        <div class="user_tel_bind" v-if="member_types=='mobile_bind'">
            <!--手机验证页-->
            <span>绑定手机</span>
            <ul>
                <li>
                    <span class="phone_icon"></span>
                    <input type="text" @focus="input_get_focus($event)" @blur="input_get_blur($event,'phone')" placeholder="请输入手机号" ref="tel_bind" @input="validate_input_value('tel_bind')">
                    <p class="error_tip" v-if="wrong_phone">{{wrong_phone_message}}</p>
                </li>
                <li>
                    <span class="code_icon"></span>
                    <input type="text" @focus="input_get_focus($event)" @blur="input_get_blur($event)" placeholder="输入验证码" ref="tel_code" @input="validate_input_value('tel_bind')">
                    <button class="send_msg" v-on:click="send_phone_code($refs.tel_bind.value)" :disabled="!code_active">{{code_btn_tip}}</button>
                </li>
                <li v-if="pwd_state">
                    <span class="pwd_icon"></span>
                    <input type="password" @focus="input_get_focus($event)" @blur="input_get_blur($event,'pwd')" placeholder="输入密码" ref="setting_pwd" @input="validate_input_value('tel_bind')">
                </li>
            </ul>
            <button v-on:click="tel_bind" :disabled="!btn_active">确认绑定</button>
        </div>

        <!--手机修改页-->
        <div class="user_tel_update" v-if="member_types=='original_mobile'||member_types=='update_mobile'" >
            <!--原手机验证页-->
            <div v-if="member_types=='original_mobile'">
                <span>修改手机号</span>
                <ul>
                    <li>
                        <span class="phone_icon"></span>
                        <input type="text" @focus="input_get_focus($event)" @blur="input_get_blur($event,'old_phone')" placeholder="请输入原始手机号" ref="old_tel" @input="validate_input_value('old_tel')">
                        <p class="error_tip" v-if="wrong_phone">{{wrong_phone_message}}</p>
                    </li>
                    <li>
                        <span class="code_icon"></span>
                        <input type="text" @focus="input_get_focus($event)" @blur="input_get_blur($event)" placeholder="输入验证码" ref="old_tel_code" @input="validate_input_value('old_tel')">
                        <button class="send_msg" v-on:click="send_phone_code($refs.old_tel.value)" :disabled="!code_active">{{code_btn_tip}}</button>
                    </li>
                </ul>
                <button v-on:click="org_tel_check" :disabled="!btn_active">下一步</button>
            </div>
            <!--新手机验证页-->
            <div v-if="member_types=='update_mobile'">
                <span>修改手机号</span>
                <ul>
                    <li>
                        <span class="phone_icon"></span>
                        <input type="text" @focus="input_get_focus($event)" @blur="input_get_blur($event,'phone')" placeholder="请输入新的手机号" ref="new_tel" @input="validate_input_value('new_tel')">
                        <p class="error_tip" v-if="wrong_phone">{{wrong_phone_message}}</p>
                    </li>
                    <li>
                        <span class="code_icon"></span>
                        <input type="text" @focus="input_get_focus($event)" @blur="input_get_blur($event)" placeholder="输入验证码" ref="new_tel_code" @input="validate_input_value('new_tel')">
                        <button class="send_msg" v-on:click="send_phone_code($refs.new_tel.value)" :disabled="!code_active">{{code_btn_tip}}</button>
                    </li>
                </ul>
                <button v-on:click="new_tel_check" :disabled="!btn_active">确认修改</button>
            </div>
        </div>

        <!--邮箱绑定页-->
        <div class="user_email_bind" v-if="member_types=='bind_email'">
            <!--邮箱验证页-->
            <span>绑定邮箱</span>
            <ul>
                <li>
                    <span class="email_icon"></span>
                    <input type="text" @focus="input_get_focus($event)" @blur="input_get_blur($event,'email')" placeholder="请输入邮箱" ref="email_bind" @input="validate_input_value('email_bind')">
                    <p class="error_tip" v-if="wrong_email">{{wrong_email_message}}</p>
                </li>
                <li>
                    <span class="code_icon"></span>
                    <input type="text" @focus="input_get_focus($event)" @blur="input_get_blur($event)" placeholder="输入验证码" ref="email_code" @input="validate_input_value('email_bind')">
                    <button class="send_msg" v-on:click="send_email_code($refs.email_bind.value)" :disabled="!code_active">{{code_btn_tip}}</button>
                </li>
                <li v-if="pwd_state">
                    <span class="pwd_icon"></span>
                    <input type="password" @focus="input_get_focus($event)" @blur="input_get_blur($event,'code')" placeholder="输入密码" ref="setting_pwd" @input="validate_input_value('email_bind')">
                </li>
            </ul>
            <button v-on:click="email_bind" :disabled="!btn_active">确认绑定</button>
        </div>

        <!--邮箱修改页-->
        <div class="user_email_update" v-if="member_types=='original_email'||member_types=='update_email'">
            <!--原邮箱验证页-->
            <div v-if="member_types=='original_email'">
                <span>修改邮箱</span>
                <ul>
                    <li>
                        <span class="email_icon"></span>
                        <input type="text" @focus="input_get_focus($event)" @blur="input_get_blur($event,'old_email')" placeholder="请输入原始邮箱" ref="old_email" @input="validate_input_value('old_email')">
                        <p class="error_tip" v-if="wrong_email">{{wrong_email_message}}</p>
                    </li>
                    <li>
                        <span class="code_icon"></span>
                        <input type="text" @focus="input_get_focus($event)" @blur="input_get_blur($event)" placeholder="输入验证码" ref="old_email_code" @input="validate_input_value('old_email')">
                        <button class="send_msg" v-on:click="send_email_code($refs.old_email.value)" :disabled="!code_active">{{code_btn_tip}}</button>
                    </li>
                </ul>
                <button v-on:click="org_email_check" :disabled="!btn_active">下一步</button>
            </div>
            <!--新邮箱验证页-->
            <div v-if="member_types=='update_email'">
                <span>修改邮箱</span>
                <ul>
                    <li>
                        <span class="email_icon"></span>
                        <input type="text" @focus="input_get_focus($event)" @blur="input_get_blur($event,'email')" placeholder="请输入新的邮箱" ref="new_email" @input="validate_input_value('new_email')">
                        <p class="error_tip" v-if="wrong_email">{{wrong_email_message}}</p>
                    </li>
                    <li>
                        <span class="code_icon"></span>
                        <input type="text" @focus="input_get_focus($event)" @blur="input_get_blur($event)" placeholder="输入验证码" ref="new_email_code" @input="validate_input_value('new_email')">
                        <button class="send_msg" v-on:click="send_email_code($refs.new_email.value)" :disabled="!code_active">{{code_btn_tip}}</button>
                    </li>
                </ul>
                <button v-on:click="new_email_check" :disabled="!btn_active">确认修改</button>
            </div>
        </div>
        
        <!-- 邮件发送弹框 -->
        <transition name="modal_fade">
            <div class="email_send" v-if="show_send_modal">
                <div class="modal_content">
                    <h1>亲爱的用户<br>我们已发送验证码至你的邮箱，请前往查看</h1>
                    <p>{{get_email}}</p>
                    <button class="cancel" @click="close_send_modal">知道了</button>
                </div>
            </div>
        </transition>
    </div>
</template>

<style lang="less" scoped>
@import url("../../assets/wap/css/common.css");
.member_return{
    position:fixed;
    z-index:1;
    width:1.5rem;
    height:1.5rem;
    top:0.7rem;
    left:0.7rem;
    background: url(../../assets/wap/images/member/return.png) no-repeat center center;
    background-size: contain;
}

.member_index {
    width: 100%;
    height: 100%;
    padding-bottom: 2.9rem;
}

.member_header{
    position:relative;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    height: 5.8rem;
    padding: 1.2rem 1.25rem 1rem;
    margin-bottom: 0.75rem;
    background-color: #292d31;
    .member_avatar{
        position: absolute;
        top: 1.2rem;
        left: 1.25rem;
        width:3.5rem;
        height:3.5rem;
        border-radius: 0.2rem;
        overflow: hidden;
        img{
            display: block;
            width: 100%;
            object-fit: contain;
        }
        .hidden_input{
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            z-index: 1;
            opacity: 0;
            visibility: hidden;
        }
    }
    .member_nickname {
        line-height: 1.4rem;
        margin-left: 4.2rem;
        color: #fff;
        font-size: 1.04rem;
    }
    .member_grade {
        margin-left: 4.2rem;
        i {
            display: inline-block;
            vertical-align: middle;
            width: 0.85rem;
            height: 0.85rem;
            margin-right: 0.2rem;
            background-image: url(../../assets/wap/images/member/grade_free.png);
            background-repeat: no-repeat;
            background-size: contain;
        }
        span {
            display: inline-block;
            vertical-align: middle;
            font-size: 0.75rem;
            color: #b3bed3;
        }
        small {
            display: block;
            margin-top: 0.15rem;
            font-size: 0.5rem;
            color: #ffffff;
            opacity: 0.6;
        }
        &.enterprise {
            i {
                background-image: url(../../assets/wap/images/member/grade_enterprise.png);
            }
            span {
                color: #f1ce93;
            }
        }
        &.premium {
            i {
                background-image: url(../../assets/wap/images/member/grade_premium.png);
            }
            span {
                color: #d7af83;
            }
        }
        &.professional,
        &.personal {
            i {
                background-image: url(../../assets/wap/images/member/grade_professional.png);
            }
            span {
                color: #52a0f8;
            }
        }
    }
    .member_upgrade {
        position: absolute;
        bottom: 1.2rem;
        right: 1.25rem;
        padding: 0 0.5rem;
        line-height: 1.4rem;
        background-image: linear-gradient(10deg, #deb46a 0%, #ffe2b1 100%), linear-gradient(#ffffff, #ffffff);
        background-blend-mode: normal, normal;
        border-radius: 1rem;
        color: #99773b;
        font-size: 0.7rem;
    }
}

.member_body{
    padding: 0.1rem 1.25rem 0;
    & + .member_body {
        border-top: 0.5rem solid #e9edf0;
    }
    li{
        position:relative;
        height: 2.8rem;
        font-size: 0.65rem;
        color: #4d4d4d;
        background-color: #ffffff;
        border-bottom: 0.05rem solid rgba(195, 203, 211, 0.5);
        &:active {
            background-color: #f4f4f4;
        }
        &:last-child {
            border-bottom: transparent;
        }
        &::after {
            content: "";
            position: absolute;
            right: 0.2rem;
            top: 50%;
            margin-top: -0.25rem;
            width: 0.5rem;
            height: 0.5rem;
            border: solid 0.1rem #afb5bc;
            border-left: none;
            border-bottom: none;
            transform: rotate(45deg);
            border-radius: 2px;
        }
        i {
            display: inline-block;
            vertical-align: middle;
            width: 1rem;
            height: 1rem;
            margin-right: 0.8rem;
            background-repeat: no-repeat;
            background-position: center center;
            background-size: contain;
        }
        a.link {
            display: block;
        }
        span,
        .right {
            display: inline-block;
            line-height: 2.75rem;
            vertical-align: middle;
        }
        .hcoin {
            color: #ff6868;
            font-family: Arial;
        }
        .right {
            margin-right: 1.3rem;
            color: var(--mainColor);
        }
        &.index_list_hcoin {
            i {
                background-image: url(../../assets/wap/images/member/hcoin_icon.png);
            }
        }
        &.index_list_upgrade {
            i {
                background-image: url(../../assets/wap/images/member/vip_icon.png);
            }
        }
        &.index_list_order {
            i {
                background-image: url(../../assets/wap/images/member/order_icon.png);
            }
        }
        &.index_list_message{
            i{
                background-image: url(../../assets/wap/images/member/message_icon.png);
            }
        }
        &.index_list_nickname {
            i {
                background-image: url(../../assets/wap/images/member/member_icon.png);
            }
        }
        &.index_list_wechat {
            i {
                background-image: url(../../assets/wap/images/member/wechat_icon.png);
            }
        }
        &.index_list_phone {
            i {
                background-image: url(../../assets/wap/images/member/phone_icon.png);
            }
        }
        &.index_list_email {
            i {
                background-image: url(../../assets/wap/images/member/email_icon.png);
            }
        }
        &.index_list_password {
            i {
                background-image: url(../../assets/wap/images/member/lock_icon.png);
            }
        }
        &.no_ops::after {
            display: none;
        }
        &.no_ops:active {
            background-color: #fff;
        }
    }
}

.member_logout {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    padding: 0 1.25rem;
    height: 2.8rem;
    font-size: 0.65rem;
    color: #4d4d4d;
    background-color: #ffffff;
    box-shadow: 0 -0.1rem 0.2rem rgba(222,222,222,0.2);
    span {
        display: inline-block;
        line-height: 2.75rem;
        vertical-align: middle;
        color: #666666;
        opacity: 0.6;
    }
    i {
        display: inline-block;
        vertical-align: middle;
        width: 1rem;
        height: 1rem;
        margin-right: 0.2rem;
        background-repeat: no-repeat;
        background-position: center center;
        background-size: contain;
    }
    .left {
        i {
            background-image: url(../../assets/wap/images/member/back_icon_2.png);
        }
    }
    .right {
        i {
            background-image: url(../../assets/wap/images/member/back_icon.png);
        }
    }
}

.change_name_modal{
    position:fixed;
    top:0;
    left:0;
    right:0;
    bottom:0;
    background:rgba(0,0,0,0.5);
    .modal_content{
        position:fixed;
        top:50%;
        left:50%;
        margin-left:-7.3625rem;
        margin-top: -4.025rem;
        width:14.725rem;
        height:8.25rem;
        border-radius:6px;
        background:#fff;
        span,input{
            display:block;
            margin:0 auto;
        }
        span{
            text-align:center;
            font-size:0.7rem;
            color:#2d2d2d;
            margin-top:1.2rem;
            margin-bottom:1.4rem;
        }
        input{
            width:13rem;
            height:1.85rem;
            border:1px solid #d1d1d1;
            border-radius:4px;
            color:#444;
            font-size:0.6rem;
            line-height:0.6rem;
            padding-left:0.5rem;
            &:focus{
                border:1px solid #d1d1d1 !important;
            }
        }
        a{
            display:inline-block;
            float:right;
            margin:1.2rem 0.9rem 1.05rem 0.9rem;
            font-size:0.6rem;
            &:nth-child(3){
                color:var(--mainColor);
            }
            &:nth-child(4){
                color:2d2d2d;
            }
        }
    }
}




.email_send{
    button{
        display:block;
        margin-left: -2.5rem;
        position: absolute;
        left: 50%;
    }
}
.user_pwd_update,.user_tel_bind,.user_tel_update,.user_email_update,.user_email_bind{
    position:absolute;
    top:0;
    bottom:0;
    left:0;
    right:0;
    padding:4.5rem 2.25rem 0 2.25rem;
    background:#fff;
    span{
        display:inline-block;
        margin:0 0 0.8rem;;
        width:100%;
        text-align:center;
        font-size:1.2rem;
        color:#323232;
    }
    ul{
        list-style:none;
        display:block;
        width:100%;
        li{
            position:relative;
            display:block;
            padding-top:2rem;
            width:100%;
            border-bottom:1px solid #d9d9d9;
            input{
                display:inline-block;
                border:none;
                font-size:0.75rem;
                color:#333;
                margin-bottom:0.5rem;
                padding-left:0.8rem;
                &:focus{
                    border:none !important;
                }
            }
            span{
                &:first-child{    
                    position:relative;
                    display:inline-block;
                    padding:0;
                    margin:0;
                    top:3px;
                    left:4px;
                    background-size:contain;
                    width:0.75rem;
                    height:0.75rem;
                }
                
            }
            .send_msg{
                position:absolute;
                display:block;
                right:0;
                bottom:0.3rem;
                margin:0;
                padding:0;
                width:5rem;
                height:1.5rem;
                background:#f1f1f1;
                border-radius:4px;
                font-size:0.6rem;
                color:#585858;
                text-align:center;
                line-height:1.5rem;
            }
            &.focus{
                border-bottom:1px solid var(--mainColor);
            }
        }
    }        
    .pwd_icon{    
        background:url("../../assets/wap/images/login/pwd_icon.png") center no-repeat;
    }
    .email_icon{
        background: url("../../assets/wap/images/login/pwd_icon.png") center no-repeat;
    }
    .code_icon{
        background: url("../../assets/wap/images/login/code_icon.png") center no-repeat;
    }
    .phone_icon{
        background:url("../../assets/wap/images/login/phone_icon.png") center no-repeat;
    }
    button,a{
        &:nth-child(3){
            display:block;
            margin-top:1.8rem;
            height:2.5rem;
            width:100%;
            background:var(--mainColor);
            color:#fff;
            font-size:0.9rem;
            text-align:center;
            line-height:2.5rem;
            border-radius:0.2rem;
        }
        &:nth-child(4){
            width:2.4rem;
            display:block;
            text-align:center;
            margin:0 auto;
            color:#2b2b2b;
            font-size:0.6rem;
            margin-top:0.8rem;
        }
        &[disabled]{
            opacity:0.5;
        }
    }
}
.update_pic1{
    display:flex;
    justify-content:center;
    flex-direction:column;
    margin:6rem auto;
    width:8rem;
    align-items:center;
    img{
        width:8rem;
        height:8rem;
        border:4px solid rgba(255, 255, 255, 0.5);
        border-bottom:none;
    }
    span{
        display:block;
        font-size:0.5rem;
        text-align:center;
        height:0.8rem;
        width:100%;
        background:#fff;
        color:#666;
    }
}
.error_tip{
    position:absolute;
    bottom:-1.5rem;
    left:0;
    color:#ff7272;
    font-size:0.6rem;
    &:before{
        content:"";
        display:inline-block;
        vertical-align:middle;
        height:0.65rem;
        width:0.65rem;
        margin-right:0.3rem;
        background:url(../../assets/wap/images/login/error_tip.png)top center no-repeat;
        background-size:contain;
    }
}

// 合并账号提醒弹框
.merge_account_modal{
        position: fixed;
        top: 0;
        left: 0;
        z-index: 11;
        width: 100%;
        height: 100%;
        text-align: center;
        background: rgba(0, 0, 0, .5);
    .merge_account_modal_contain{
            position: relative;
            top: 30%;
            display: inline-block;
            vertical-align: middle;
            width: 90%;
            height: 11.24rem;
            background: #fff;
            border-radius: 0.5rem;
            .head{  
                color: #4b525f;
                margin-top: 1.45rem; 
                line-height:1.38rem;
                font-weight: bold;
            }
            .body{
                font-size: 0.59rem;
                line-height: 1.2rem;
                color: #707b8e;
                margin: 1.5rem 0;
            }
            .foot{
                position: absolute;
                display:inline-block;
                bottom: 0;
                display: flex;
                width:100%;
                height:2.7rem;
                border-top:1px solid #e2e6ec;
                line-height: 2.7rem;
                font-size:0.78rem;
                justify-content: space-around;
                color: #707b8e;
                span{
                    width: 50%;
                     &:last-child{
                        border-left:1px solid #e2e6ec;
                        color:#0d7bf8;
                    }
                }
            }
    }
}
</style>

<script>
    import checkapi from '@/assets/common/js/checkapi.js';
    export default {
        metaInfo () {
            return {
                title: '吾道-账户设置',
                meta: [
                    {
                        name: 'viewport',
                        content: "width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0"
                    },
                    {
                        property: 'og:title',
                        content: '吾道-账户设置'
                    },
                    {
                        property: 'og:url',
                        content: 'https://www.woodo.cn/mobile/member/'
                    },
                ]
            }
        },
        data () {
            return {
                user_info:{},
                pwd:'******',
                show_send_modal: false,           //显示邮件发送弹框
                uname:'',
                wx_state: false,
                pwd_state: false,
                email_state: false,
                tel_state: false,
                member_types:'',
                img_type: 'image/jpeg, image/png, image/jpg',
                check_nickname:false,
                code_active:false,          //验证码按钮激活

                state:'',                   
                btn_active:false,           //按钮状态
                code_btn_tip: '',           //验证码提示
                countdown: 60,              //发送验证码倒计时
                send_captchacode: false,    //发送验证码状态
                wrong_pwd: false,           //密码校验是否通过
                wrong_pwd_message:"",       //密码错误提示词
                wrong_phone: false,         //手机校验是否通过
                wrong_phone_message:"",     //手机错误提示词
                wrong_email: false,         //邮箱校验是否通过
                wrong_email_message:"",     //邮箱错误提示词
                get_email:'',
            }
        },
        methods: {
            // 登出
            logout:function(){
                let that=this;
                that.$axios.get("/api/logout/submit/").then(function(data){
                    if(data.data.code === '2'){
                        that.$toast(data.data.content, 1000, 'wap');
                        setTimeout(()=>{
                            location.href = '/mobile/login/';
                        }, 1000);
                    } else {
                        that.$toast('退出登陆失败', 800, 'wap');
                    }
                }).catch((err)=>{
                    that.$toast('退出登陆失败', 800, 'wap');
                });
            },
            // 输入框聚焦
            input_get_focus: function(e){
                $(e.currentTarget).parent("li").addClass("focus");
            },
            // 输入框失焦
            input_get_blur: function(e,type){
                $(e.currentTarget).parent("li").removeClass("focus");
                let that = this;
                switch (type) {
                    case 'phone':
                        let tel = that.$refs.tel_bind ? that.$refs.tel_bind.value : that.$refs.new_tel.value,
                            _reg = /^1\d{10}$/;
                        if(tel === ''){
                            break;
                        }
                        if(!_reg.test(tel)){
                            that.wrong_phone = true;
                            that.wrong_phone_message = '请输入有效的手机号码';
                            break;
                        }
                        that.$axios.get("/api/register/check_mobile/",{params:{mobile:tel}}).then(function(data){
                            if(data.data.code !== '2'){
                                //手机号已存在
                                that.wrong_phone = true;
                                that.wrong_phone_message = '该手机号码已被绑定';
                            }else{
                                that.wrong_phone_message = '';
                                that.wrong_phone = false;
                                that.code_active = true;
                            }

                        })
                        break;
                    case 'email':
                        let email = that.$refs.email_bind ? that.$refs.email_bind.value : that.$refs.new_email.value,
                            reg = /^(\w)+(\.\w+)*@(\w)+((\.\w+)+)$/ ;
                        if(email == ''){
                            break;
                        }
                        if(!reg.test(email)){
                            that.wrong_email = true;
                            that.code_active = false;
                            that.wrong_email_message = '请输入有效的邮箱';
                            break;
                        }
                        that.$axios.get('/api/register/check_email/',{params:{email:email}}).then(function(data){
                            if(data.data.code === '2'){
                                that.code_active = true;
                                that.wrong_email = false;
                                that.wrong_email = '';
                            }else{
                                that.wrong_email = true;
                                that.code_active = false;
                                that.wrong_email_message = data.data.content;
                            }
                        });
                        break;
                    case 'old_phone':
                        let _tel = that.$refs.old_tel.value;
                        if(_tel == ''){
                            break;
                        }
                        if(Number(_tel)!==Number(that.user_info.mobile)){
                            that.wrong_phone = true;
                            that.wrong_phone_message = '与原号码不匹配';
                        }else{
                            that.code_active = true;
                            that.wrong_phone = false;
                        }
                        break;
                    case 'old_email':
                        let _email = that.$refs.old_email.value;
                        if(_email === ''){
                            break;
                        }
                        if(_email!==that.user_info.email){
                            that.wrong_email = true;
                            that.wrong_email_message = '与原邮箱不匹配';
                        }else{
                            that.code_active = true;
                            that.wrong_email = false;
                        }
                        break;
                }
            },
            // 获取用户信息
            get_user_info:function(){
                let that = this;
                that.$axios.get("/api/member/information/").then(function(data){
                    if(data.data.code === '2'){
                        that.user_info = $.extend(data.data.data, that.user_info);
                        that.wx_state = that.user_info.bindWechat;
                        that.email_state = !!that.user_info.email;
                        that.tel_state = !!that.user_info.mobile;
                        that.pwd_state = that.email_state || that.tel_state;
                        if (that.user_info.memberRankExpire) {
                            that.user_info.memberRankExpire = that.$common.date_format(new Date(that.user_info.memberRankExpire), 'yyyy-MM-dd');
                        }
                    }
                });
            },
            // 头像上传
            new_pic: function(e){
                let that = this;
                if (e.target.files.length === 0) {
                    return;
                }
                let file = e.target.files[0];
                if(that.img_type.indexOf(file.type) < 0){
                    return that.$toast("只支持jpg，png文件格式！",1000,'wap');
                }
                let max_file_size = 1024 * 1024;
                if (file.size > max_file_size) {
                    return that.$toast("上传图片文件过大，请上传小于2M的文件！",2000,'wap');
                }
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
                        that.$toast("修改成功",1000,'wap');
                        that.user_info.headUrl = data.data.data;
                        that.$common.set_cookies('woodo_memberHead',data.data.data);
                    }else{
                        that.$toast(data.data.content,1000,'wap');
                    }
                });
            },
            // 修改头像
            update_pic:function(){
                this.$refs.submit_pic.click();
            },
            // 面板切换
            member_type:function(type){
                let that=this;
                if(type==='original_mobile'||type==='update_mobile'||type==='mobile_bind'){
                    that.code_btn_tip='获取手机验证码';
                }else if(type==='update_email'||type==='original_email'||type==='bind_email'){
                    that.code_btn_tip='获取邮箱验证码';
                }else if(type==='bind_wechat'){
                    that.$axios.get('/api/weixin/mobile_wx_bind/', { params: { 'redirectUrl': location.href } }).then(function(data){
                        location.href = data.data.data;
                    });
                }
                that.member_types=type;
            },
            // 确认修改昵称
            confirm_update:function () {
                let that=this,uname=that.$refs.uname.value;
                if(uname === ''){
                    return that.$toast('昵称不能为空',2000,'wap');
                }
                if(!/^[a-zA-Z0-9_\-\u4e00-\u9fa5]+$/.test(uname)){
                    return that.$toast('不能含有特殊字符',2000,'wap');
                }
                if(uname.length>6){
                    return that.$toast('不能超过六个字符',2000,'wap');
                }
                that.check_username(function(){
                    that.$axios.post('/api/member/chang_member_nickname', {
                        nickName:uname,
                    }).then(function(data){
                        if(data.data.type === 'success'){
                            that.$toast('修改成功',2000,'wap');
                            that.user_info.nickName=uname;
                            that.$refs.uname.value='';
                            that.member_types='';
                        }else{
                            that.$toast(data.data.content,1000,'wap');
                        }
                    })
                    that.check_nickname=false;
                })
            },
            // 昵称修改检测
            check_username:function(callback){
                let that=this,
                    uname=that.$refs.uname.value;
                that.$axios.get("/api/register/check_nickName/",{params:{nickName:uname}}).then(function(data){
                    if(data.data.code==='2'){
                        that.check_nickname=true;
                        if(typeof callback === 'function'){callback()}
                    }else{
                        that.$toast('该昵称已被使用',2000,'wap');
                    }
                })
            },
            // 取消修改昵称
            cancel_update:function () {
                let that =this;
                that.member_types='';
            },
            // 密码修改验证
            pwd_update:function () {
                let that = this,
                    original_pwd = that.$refs.original_pwd.value,
                    setting_pwd = that.$refs.setting_pwd.value,
                    confirm_pwd = that.$refs.confirm_pwd.value,
                    reg = /^(\w){6,20}$/;
                switch (true) {
                    case !original_pwd:
                        that.$toast('请填写原密码！',2000,'wap');
                        break;
                    case !setting_pwd:
                        that.$toast('请填写您的新密码！',2000,'wap');
                        break;
                    case !confirm_pwd:
                        that.$toast('请再次填写您的新密码！',2000,'wap');
                        break;
                    case !reg.test(setting_pwd):
                        that.$toast('只能输入6-20个字母、数字、下划线！',2000,'wap');
                        break;
                    case setting_pwd !== confirm_pwd:
                        that.$toast('两次密码不一致！',2000,'wap');
                        break;
                    case setting_pwd === original_pwd:
                        that.$toast('新旧密码不允许一致！',2000,'wap');
                        break;
                    default:
                        that.$axios.get("/api/common/public_key/").then(function(data){
                            let RsaKey = that.$rsa,
                                Base64 = that.$base64,
                                rsakey = new RsaKey(),
                                base64 = new Base64(),
                                modulus = data.data.modulus,
                                exponent = data.data.exponent;
                            rsakey.setPublic(base64.b64tohex(modulus), base64.b64tohex(exponent));
                            original_pwd = base64.hex2b64(rsakey.encrypt(original_pwd));
                            setting_pwd = base64.hex2b64(rsakey.encrypt(setting_pwd));
                            that.$axios.post("/api/member/update_password/",{oldPassword: original_pwd, password: setting_pwd,})
                                .then(function(data){
                                    if(data.data.code === '2'){
                                        that.$toast("密码修改成功",2000,'wap');
                                        that.member_types='';
                                    }else{
                                        that.$toast(data.data.content,1000,'wap');                                     
                                    }
                                });
                        })
                    break;
                }
            },
            // 绑定手机页面
            tel_bind:function () {  
                let that=this,
                    tel_bind=that.$refs.tel_bind.value,
                    _reg = /^1\d{10}$/;
                if(that.wrong_phone){
                    that.$toast(that.wrong_phone_message,1000,'wap');
                }else{
                    that.tel_bind_post(tel_bind);
                }
            },
            //首次绑定提交
            tel_bind_post:function(tel_bind){
                var that = this;
                if(that.pwd_state){
                    that.$axios.get("/api/common/public_key/").then(function(data){
                        let RsaKey = that.$rsa,
                            Base64 = that.$base64,
                            rsakey = new RsaKey(),
                            base64 = new Base64(),
                            modulus = data.data.modulus,
                            exponent = data.data.exponent;
                        rsakey.setPublic(base64.b64tohex(modulus), base64.b64tohex(exponent));
                        let enPassword = base64.hex2b64(rsakey.encrypt(that.$refs.setting_pwd.value));
                        that.$axios.post("/api/member/bind_mobile_submit/",{
                            mid:'SMS_150742973',
                            mobile:tel_bind,
                            code:that.$refs.tel_code.value,
                            enPassword:enPassword
                        }).then(function(data){
                                if (data.data.code === '2') {
                                    that.code_btn_tip = "";
                                    that.countdown=0;
                                    that.send_captchacode = false;
                                    that.btn_active = false;
                                    that.member_types='';
                                    that.btn_active = false;    
                                    that.tel_state = true;
                                    that.user_info.mobile=tel_bind;
                                    that.$toast("绑定成功",2000,'wap');
                                } else {                                   
                                    that.$toast(data.data.content,1000,'wap');
                                }
                            })
                    })
                }else{
                    that.$axios.post("/api/member/bind_mobile_submit/",{
                        mid:'SMS_150742973',
                        mobile:tel_bind,
                        code:that.$refs.tel_code.value,
                    }).then(function(data){
                            if (data.data.code === '2') {
                                that.code_btn_tip = "";
                                that.countdown=0;
                                that.send_captchacode = false;
                                that.btn_active = false;
                                that.member_types='';
                                that.btn_active = false;    
                                that.tel_state = true;
                                that.user_info.mobile=tel_bind;
                                that.$toast("绑定成功",2000,'wap');
                            } else {
                                that.$toast(data.data.content,1000,'wap');
                            }
                        })
                }
            },
            // 原手机验证
            org_tel_check:function(){
                let that=this,
                    tel=that.$refs.old_tel.value,
                    tel_code=that.$refs.old_tel_code.value;
                checkapi.change_mobile_submit_post({mid:'SMS_150742973',phone:tel,code:tel_code,type:'oldMobile',
                  success: data => {
                    that.$refs.old_tel.value=null;
                    that.$refs.old_tel_code.value=null;
                    that.countdown=0;
                    that.send_captchacode = false;
                    that.btn_active = false;
                    that.member_types='update_mobile';
                    that.code_btn_tip = "获取手机验证码";
                  },
                  fail: data => {
                    that.$toast(data.data.content,1000,'wap');
                  }
                },that);
            },
            // 新手机验证
            new_tel_check:function(){
                let that=this,
                    tel=that.$refs.new_tel.value,
                    tel_code=that.$refs.new_tel_code.value,
                    _reg = /^1\d{10}$/;

                if(that.wrong_phone){
                    that.$toast(that.wrong_phone_message,1000,'wap');
                }else{
                    that.new_tel_check_post(tel,tel_code);
                }
            },
            new_tel_check_post:function(tel,tel_code){
                var that = this;
                checkapi.change_mobile_submit_post({mid:'SMS_150742973',phone:tel,code:tel_code,type:'newMobile',
                    success: data => {
                        that.$refs.new_tel.value=null;
                        that.$refs.new_tel_code=null;
                        that.countdown=0;
                        that.send_captchacode = false;
                        that.btn_active = false;
                        that.member_types='';
                        that.code_btn_tip = "";
                        that.user_info.mobile=tel;
                        that.$toast('修改成功',2000,'wap');
                    },
                    fail: data => {
                        that.$toast(data.data.content,1000,'wap');
                    }
                },that);
            },
            // 绑定邮箱页面
            email_bind:function () {  
                let that=this,
                    email_bind=that.$refs.email_bind.value,
                    _reg = /^(\w)+(\.\w+)*@(\w)+((\.\w+)+)$/;
                
                if(that.wrong_email){
                    that.$toast(that.wrong_email_message,2000,'wap');
                }else{
                    that.email_bind_post(email_bind);
                }    
            },
            email_bind_post:function(email_bind){
                var that = this;
                if(that.pwd_state){
                    that.$axios.get("/api/common/public_key/").then(function(data){
                        let RsaKey = that.$rsa,
                            Base64 = that.$base64,
                            rsakey = new RsaKey(),
                            base64 = new Base64(),
                            modulus = data.data.modulus,
                            exponent = data.data.exponent;
                        rsakey.setPublic(base64.b64tohex(modulus), base64.b64tohex(exponent));
                        let enPassword = base64.hex2b64(rsakey.encrypt(that.$refs.setting_pwd.value));
                        that.$axios.post("/api/member/bind_email_submit/",{
                            mid:'SMS_150742973',
                            email: email_bind,
                            code:that.$refs.email_code.value,
                            enPassword:enPassword
                        }).then(function(data){
                                if (data.data.code === '2') {
                                    that.code_btn_tip = "";
                                    that.btn_active = false;
                                    that.countdown=0;
                                    that.send_captchacode = false;
                                    that.member_types='';
                                    that.tel_state = true;
                                    that.$toast("绑定成功",2000,'wap');
                                    that.email_state=true;
                                    that.user_info.email=email_bind;
                                } else {
                                    that.$toast(data.data.content,1000,'wap');         
                                }
                            })
                    });
                }else{
                    that.$axios.post("/api/member/bind_email_submit/",{
                        mid:'SMS_150742973',
                        email: email_bind,
                        code:that.$refs.email_code.value
                    }).then(function(data){
                        if (data.data.code === '2') {
                            that.code_btn_tip = "";
                            that.btn_active = false;
                            that.countdown=0;
                            that.send_captchacode = false;
                            that.member_types='';
                            that.tel_state = true;
                            that.$toast("绑定成功",2000,'wap');
                            that.user_info.email=email_bind;
                        } else {
                            that.$toast(data.data.content,1000,'wap');
                        }
                    })
                }
            },
            // 原邮箱验证
            org_email_check:function(){
                let that=this,
                    old_email=that.$refs.old_email.value;
                that.$axios.post('/api/member/email_confr/',{
                    email:that.$refs.old_email.value,
                    mid:'SMS_150742973',
                    code:that.$refs.old_email_code.value,
                    type:'oldEmail'
                }).then(function(data){
                    if(data.data.code === '2'){
                        that.$refs.old_email.value=null;
                        that.$refs.old_email_code.value=null;
                        that.countdown=0;
                        that.send_captchacode = false;
                        that.btn_active = false;
                        that.member_types='update_email';
                        that.code_btn_tip = "获取邮箱验证码";
                    }else{
                        that.$toast('验证码错误',2000,'wap');
                        return false;
                    }
                })
            },
            // 新邮箱验证
            new_email_check:function(){
                let that=this,
                    new_email=that.$refs.new_email.value,
                    _reg = /^(\w)+(\.\w+)*@(\w)+((\.\w+)+)$/;

                if(that.wrong_email){
                    that.$toast(that.wrong_email_message,2000,'wap');
                }else{
                    that.new_email_check_post(new_email,that.$refs.new_email_code.value);
                }
            },
            new_email_check_post:function(email,code){
                var that = this;
                checkapi.change_email_submit_post({mid:'SMS_150742973',email:email,code:code,type:'newEmail',
                    success: data => {
                        that.$refs.new_email.value=null;
                        that.$refs.new_email_code.value=null;
                        that.countdown=0;
                        that.send_captchacode = false;
                        that.code_btn_tip = "";
                        that.btn_active = false;
                        that.member_types='';
                        that.user_info.email=email;
                        that.email_state=true;
                        that.$toast('修改成功',2000,'wap');
                    },
                    fail: data => {
                        that.$toast(JSON.stringify(data),2000,'wap');
                    }
                });
            },            

            // 发送手机验证码
            send_phone_code: function(tel){
                let that=this,
                    _reg = /^1\d{10}$/;
                
                if(that.member_types=='original_mobile'){
                    if(Number(tel)!==Number(that.user_info.mobile)) return that.$toast('与原号码不匹配',2000,'wap');
                    that.$axios.post("/api/common/mobile_code_ext/", {
                        mid: 'SMS_150742973',
                        mobile:tel
                    }).then(function(data){
                        that.$toast(data.data.content,2000,'wap');
                        that.member_types=='update_mobile';
                        if(data.data.code == 2) that.settime('手机');
                    });
                }

                if (that.member_types=='update_mobile'){
                    if(that.$refs.new_tel.value.length!==11) return that.$toast('请输入正确的手机号',2000,'wap');
                    if(!_reg.test(that.$refs.new_tel.value)) return that.$toast("请输入有效的手机号码",2000,'wap');
                    that.$axios.post("/api/common/mobile_code_ext/",{
                        mid: 'SMS_150742973',
                        mobile:tel,
                    }).then(function(data){
                        that.$toast(data.data.content,2000,'wap');
                        if(data.data.code == 2) that.settime('手机');
                    });
                }

                if(that.member_types=='mobile_bind'){
                    if(that.$refs.tel_bind.value.length!==11) return that.$toast('请输入正确的手机号',2000,'wap');
                    if(!_reg.test(that.$refs.tel_bind.value)) return that.$toast("请输入有效的手机号码",2000,'wap');
                    that.$axios.post("/api/common/mobile_code_ext/", {
                        mid: 'SMS_150742973',
                        mobile:tel,
                    }).then(function(data){
                        that.$toast(data.data.content,2000,'wap');
                        if(data.data.code == 2) that.settime('手机');
                    });
                }
            },
            // 发送邮箱验证码
            send_email_code: function(email){
                let that=this,
                    en_email='',
                    _reg = /^(\w)+(\.\w+)*@(\w)+((\.\w+)+)$/;
                
                that.get_email = email;
                if(that.member_types=='original_email'){
                    if(email!==that.user_info.email) return that.$toast('与原邮箱不匹配',2000,'wap');
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
                            mid:'SMS_150742973',
                            enEmail: en_email
                        }).then(function(data){
                                if(data.data.code === '2'){
                                    that.settime('邮箱');
                                    that.show_send_modal = true;
                                }
                            })
                    });
                }

                if(that.member_types=='update_email'){
                    if(!_reg.test(that.$refs.new_email.value)) return that.$toast("请输入有效的邮箱",2000,'wap');
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
                            mid:'SMS_150742973',
                            enEmail: en_email
                        }).then(function(data){
                            if(data.data.code === '2'){
                                that.settime('邮箱');
                                that.show_send_modal = true;
                            }
                        })
                    });
                }

                if(that.member_types=='bind_email'){
                    if(!_reg.test(that.$refs.email_bind.value)) return that.$toast("请输入有效的邮箱",2000,'wap');
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
                            mid:'SMS_150742973',
                            enEmail: en_email,
                        })
                            .then(function(data){
                                if(data.data.code === '2'){
                                    that.settime('邮箱');
                                    that.show_send_modal = true;
                                }
                            })
                    });
                }
                
            },
            // 激活按钮
            validate_input_value: function(type){
                let that = this;
                switch (type) {
                    case 'old_tel':
                        if(that.$refs.old_tel.value&&that.$refs.old_tel_code.value){
                            that.btn_active = true;
                        }else{
                            that.btn_active = false;
                        }
                    break;
                    case 'new_tel':
                        if(that.$refs.new_tel.value&&that.$refs.new_tel_code.value){
                            that.btn_active = true;
                        }else{
                            that.btn_active = false;
                        }
                    break;
                    case 'old_email':
                        if(that.$refs.old_email.value&&that.$refs.old_email_code.value){
                            that.btn_active = true;
                        }else{
                            that.btn_active = false;
                        }
                    break;
                    case 'new_email':
                        if(that.$refs.new_email.value&&that.$refs.new_email_code.value){
                            that.btn_active = true;
                        }else{
                            that.btn_active = false;
                        }
                    break;
                    case 'pwd_update':
                        if(that.$refs.original_pwd.value&&that.$refs.setting_pwd.value&&that.$refs.confirm_pwd.value){
                            that.btn_active = true;
                        }else{
                            that.btn_active = false;
                        }
                    break;
                    case 'email_bind':
                        if(that.pwd_state){
                            if(that.$refs.email_bind.value&&that.$refs.email_code.value&&that.$refs.setting_pwd.value){
                                that.btn_active = true;
                            }else{
                                that.btn_active = false;
                            }
                        }else{
                            if(that.$refs.email_bind.value&&that.$refs.email_code.value){
                                that.btn_active = true;
                            }else{
                                that.btn_active = false;
                            }
                        }
                    break;
                    case 'tel_bind':
                        if(that.pwd_state){
                            if(that.$refs.tel_bind.value&&that.$refs.tel_code.value&&that.$refs.setting_pwd.value){
                                that.btn_active = true;
                            }else{
                                that.btn_active = false;
                            }
                        }else{
                            if(that.$refs.tel_bind.value&&that.$refs.tel_code.value){
                                that.btn_active = true;
                            }else{
                                that.btn_active = false;
                            }
                        } 
                    break;
                }
            },
            // 页面回退
            back:function(){
                let that=this;
                that.countdown=0;
                if(that.member_types=='original_mobile' || that.member_types=='original_email' || that.member_types=='update_pwd' || that.member_types=='bind_email'||that.member_types=='mobile_bind'){
                    that.member_types='';
                    return;
                }
                if(that.member_types=='update_email'){
                    that.member_types='original_mobile';
                    return;
                }
                if(that.member_types=='update_mobile'){
                    that.member_types='original_mobile';
                    return;
                }
                location.href = '/mobile/home/';
            },
            // 验证码状态	
            settime: function(type) {
                let that = this;
                if (that.countdown <= 0) { 
                    that.code_active = true;
                    that.send_captchacode = false;
                    that.code_btn_tip = "获取"+ type +"验证码";
                    that.countdown = 60; 
                    return;
                }else {
                    that.code_active = false;
                    that.send_captchacode = true;
                    that.code_btn_tip = "重新发送(" + that.countdown + ")";
                    that.countdown--; 
                } 
                setTimeout(function(){that.settime(type)},1000);
            },
            // 关闭邮件发送弹框
            close_send_modal: function(){
                this.show_send_modal = false;
            },
        },
        mounted () {
            let that = this;
            let user = that.$common.get_login_state();
            that.user_info = user;
		    if(!user.login){
                location.href = '/mobile/login/';
            }else{
                that.get_user_info();
            }
        }
    }
</script>
