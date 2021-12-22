<template>
    <div class="login_content">
        <!-- 登录注册首页 -->
        <div class="login_index" v-if="login_type === 'index'">
            <div class="head">
                <a href="/mobile/"></a>
            </div>
            <div class="login_main">
                <base-logo theme="white"></base-logo>
                <button class="wechat_login" @click="wechat_login_event">微信登录</button>
                <button class="account_login" @click="change_login_type('account')">已有账号密码</button>
            </div>
        </div>
        <!-- 账号密码登录 -->
        <div class="login_panel account_panel" v-if="login_type === 'account'">
            <div class="head" @click="change_login_type('index')" v-if="isWechat"></div>
            <div class="title">
                <p>登录吾道</p>
            </div>
            <div class="form_contain">
                <div class="form_div account">
                    <input @focus="input_get_focus($event)" @blur="input_get_blur($event)" ref="username" placeholder="手机号或邮箱" @input="validate_input_value('account')">
                </div>
                <div class="form_div password">
                    <input @focus="input_get_focus($event)" @blur="input_get_blur($event)" ref="password" type="password" placeholder="密码" @input="validate_input_value('account')">
                </div>
            </div>
            <button class="sign_in" @click="username_submit_event" :class="{success:btn_active}" :disabled="!btn_active">登录</button>
            <a href="javascript:;" class="forget_pwd" @click="change_login_type('find_pwd')">忘记密码</a>
            <div class="footer">
                <a href="javascript:;" class="phone_register" @click="change_login_type('phone_register')">手机注册</a>
                <a href="javascript:;" class="email_register" @click="change_login_type('email_register')">邮箱注册</a>
            </div>
        </div>
        <!-- 找回密码 -->
        <div class="login_panel find_pwd_panel" v-if="login_type === 'find_pwd'">
            <div class="head" @click="change_login_type(find_pwd_return)"></div>
            <div class="title">
                <p>找回密码</p>
            </div>
            <div class="form_contain">
                <div class="form_div account">
                    <input @focus="input_get_focus($event)" @blur="input_get_blur($event)" ref="username" placeholder="输入手机或邮箱" @input="validate_input_value('username')">
                </div>
            </div>
            <button class="find_pwd" @click="find_pwd_event" :class="{success:btn_active}" :disabled="!btn_active">提交</button>
        </div>
        <!-- 重置密码 -->
        <div class="login_panel reset_pwd_panel" v-if="login_type === 'reset_pwd'">
            <div class="head" @click="change_login_type('account')"></div>
            <div class="title">
                <p>设置新密码</p>
            </div>
            <div class="form_contain">
                <div class="form_div code">
                    <input @focus="input_get_focus($event)" @blur="input_get_blur($event)" ref="code" name='code' value="" autocomplete="off" placeholder="输入验证码" @input="validate_input_value('reset_pwd')">
                    <button class="code_btn" v-if="reset_type === 'phone'" :disabled="!send_captchacode" @click="send_phone_msg(false)">{{code_btn_tip}}</button>
                    <button class="code_btn" v-if="reset_type === 'email'" :disabled="!send_captchacode" @click="send_email_msg(false)">{{code_btn_tip}}</button>
                </div>
                <div class="form_div password" :class="{error:wrong_pwd}">
                    <input @focus="input_get_focus" ref="password" type="password" placeholder="新密码" @input="validate_input_value('reset_pwd')" @blur="valid_password($event)">
                    <p class="error_tip" v-if="wrong_pwd">{{wrong_pwd_message}}</p>
                </div>
                <div class="form_div re_password">
                    <input @focus="input_get_focus($event)" @blur="input_get_blur($event)" ref="repassword" type="password" placeholder="确认密码" @input="validate_input_value('reset_pwd')">
                </div>
            </div>
            <button class="reset_pwd" @click="reset_pwd_event" :class="{success:btn_active}" :disabled="!btn_active">确认修改</button>
        </div>
        <!-- 手机/邮箱注册 -->
        <div class="login_panel register_panel" v-if="login_type === 'phone_register' || login_type === 'email_register'">
            <div class="head" @click="change_login_type('account')"></div>
            <div class="title">
                <p v-if="login_type === 'phone_register'">手机注册</p>
                <p v-if="login_type === 'email_register'">邮箱注册</p>
            </div>
            <div class="form_contain">
                <div class="form_div phone" v-if="login_type === 'phone_register'" :class="{error:wrong_phone}">
                    <span class="area_code">+86</span>
                    <input @focus="input_get_focus" ref="username" placeholder="输入手机号" @input="validate_input_value('register')" @blur="check_phone($event)">
                    <p class="error_tip" v-if="wrong_phone">{{wrong_phone_message}}</p>
                </div>
                <div class="form_div email" v-if="login_type === 'email_register'" :class="{error:wrong_email}">
                    <input @focus="input_get_focus" ref="username" placeholder="输入邮箱" @input="validate_input_value('register')" @blur="check_email($event)">
                    <p class="error_tip" v-if="wrong_email">{{wrong_email_message}}</p>
                </div>
                <div class="form_div code">
                    <input @focus="input_get_focus($event)" @blur="input_get_blur($event)" ref="code" placeholder="输入验证码" @input="validate_input_value('register')">
                    <button class="code_btn" v-if="login_type === 'phone_register'" :class="{success:send_captchacode}" :disabled="!send_captchacode" @click="send_phone_msg(true)">{{code_btn_tip == '' ? '获取手机验证码' : code_btn_tip}}</button>
                    <button class="code_btn" v-if="login_type === 'email_register'" :class="{success:send_captchacode}" :disabled="!send_captchacode" @click="send_email_msg('register')">{{code_btn_tip == '' ? '获取邮箱验证码' : code_btn_tip}}</button>
                </div>
                <div class="form_div password" :class="{error:wrong_pwd}">
                    <input @focus="input_get_focus" ref="password" type="password" placeholder="设置密码" @input="validate_input_value('register')" @blur="valid_password($event)">
                    <p class="error_tip" v-if="wrong_pwd">{{wrong_pwd_message}}</p>
                </div>
                <div class="form_div nickname" :class="{error:wrong_nickname}">
                    <input @focus="input_get_focus" ref="nickname" placeholder="设置昵称" @input="validate_input_value('register')" @blur="check_nickname($event)">
                    <p class="error_tip" v-if="wrong_nickname">{{wrong_nickname_message}}</p>
                </div>
            </div>
            <button class="sign_up" @click="register_submit_event" :class="{success:btn_active}" :disabled="!btn_active">注册</button>
            <p class="user_agreement">点击 [ 注册 ] 按钮，即代表你同意<a href="/mobile/agreement/">《吾道用户协议》</a></p>
            <div class="footer">
                <a href="javascript:;">已有账号</a>
                <a href="javascript:;" class="email_register" @click="change_login_type('account')">登录</a>
            </div>
        </div>
        <!-- 邮件发送弹框 -->
        <transition name="modal_fade">
            <div class="email_send" v-show="show_send_modal">
                <div class="modal_content">
                    <h1>亲爱的用户<br>我们已发送验证码至你的邮箱，请前往查看</h1>
                    <p>{{user_email}}</p>
                    <button class="cancel" @click="close_send_modal">知道了</button>
                </div>
            </div>
        </transition>
    </div>
</template>

<script>
    export default {
        metaInfo () {
            return {
                title: '吾道-登录注册',
                meta: [
                    {
                        name: 'viewport',
                        content: "width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0"
                    },
                    {
                        property: 'og:title',
                        content: '吾道-登录注册'
                    },
                    {
                        property: 'og:url',
                        content: 'https://www.woodo.cn/mobile/login/'
                    },
                ]
            }
        },
		data(){
			return{
                login_type: 'account',              //登陆注册面板类型
                isWechat: false,                  //是否是微信环境
                reset_type: 'phone',              //重置密码类型（手机/邮箱）
                user_email: "",                   //用户邮箱
                user_mobile: "",                  //用户手机
                input_focus:false,                //输入框聚焦
                btn_active: false,                //按钮激活状态
                show_send_modal: false,           //显示邮件发送弹框
                // 错误提示
                wrong_pwd: false,                 //密码校验是否通过
                wrong_pwd_message:"",             //密码错误提示词
                wrong_nickname: false,            //昵称校验是否通过
                wrong_nickname_message:"",        //昵称错误提示词
                wrong_phone: false,               //手机校验是否通过
                wrong_phone_message:"",           //手机错误提示词
                wrong_email: false,               //邮箱校验是否通过
                wrong_email_message:"",           //邮箱错误提示词
                /* 验证码相关 */
                code_btn_tip: '',                 //验证码按钮文案
                countdown: 60,                    //发送验证码倒计时
                send_captchacode: false,          //发送验证码状态
                screen_height:"",                 //屏幕高度
                find_mid:"SMS_150742979",         //手机模版id（找回密码）
                register_mid:"SMS_150738151",     //手机模版id（注册）
                timer:"",
                find_pwd_return:"account"                //找回密码切换面板
			}
		},
        mounted(){
            let that = this;
            if (utils.deviceENV().wechat) {
                that.login_type = 'index';
                that.isWechat = true;
            } else {
                that.login_type = 'account';
                that.isWechat = false;
            }
            if (utils.deviceENV().android) {
                that.screen_height = document.body.clientHeight;
                // resize事件
                window.onresize = function(){
                    let dom = $(".login_panel .footer"),
                        find = $(".login_panel .forget_pwd");
                    if(that.screen_height > document.body.clientHeight){
                        dom.hide();
                        find.hide();
                    }else{
                        dom.show();
                        find.show();
                    }
                };
            }
            let user = that.$common.get_login_state();
            if(user.login){
                if(that.$route.query.type === 'find_pwd'){
                    that.login_type= 'find_pwd';
                    that.find_pwd_return='member';
                }else{
                    that.$router.push('/mobile/home/')
                }
            }else{
                that.login_type='index';
                let in_wechat = utils.deviceENV().wechat,
                    login_fail = that.$route.query.type === 'wechat_login_fail';
                if(in_wechat){
                    that.login_type = that.$route.query.type && !login_fail ? that.$route.query.type : 'index';
                    if(login_fail) that.$nextTick(function(){that.$toast('微信登录失败',1000,'wap');});
                }else{
                    that.login_type = that.$route.query.type && !login_fail ? that.$route.query.type : 'account';
                }
            }
        },
		methods:{
            /* 通用方法 */
            // 输入框聚焦
            input_get_focus: function(e){
                $(e.currentTarget).parent(".form_div").addClass("focus");
                this.input_focus = true;
            },
            // 输入框失焦
            input_get_blur: function(e){
                $(e.currentTarget).parent(".form_div").removeClass("focus");
                this.input_focus = false;
            },
            // 切换登录注册面板
            change_login_type: function(type){
                let that = this;
                if(type==='member'){
                    location.href = '/mobile/member/'
                }else{
                    that.login_type = type;
                    // 初始化
                    that.btn_active = false;
                    that.input_focus = false;
                    that.send_captchacode = false;
                    that.wrong_email = false;
                    that.wrong_pwd = false,
                    that.wrong_nickname = false, 
                    that.wrong_phone = false,
                    that.countdown = 60;
                    that.code_btn_tip = '';
                    if(that.$refs.username) that.$refs.username.value = '';
                    if(that.$refs.password) that.$refs.password.value = '';
                    if(that.$refs.code) that.$refs.code.value = '';
                    clearTimeout(that.timer);
                }
                
            },
            //显示登录按钮loading
            show_loginLoad_event:function(){
                that.show_btn_loading = true;
            },  
            //隐藏登录按钮loading
            hide_loginLoad_event:function(){
                that.show_btn_loading = false;
            },
            // 监听输入框
            validate_input_value: function(type){
                let that = this;
                switch (type) {
                    case 'username':    //找回密码
                        if(that.valid_phone(that.$refs.username.value,false) || that.valid_email(that.$refs.username.value,false)){
                            that.btn_active = true;
                        }else{
                            that.btn_active = false;
                        }
                    break;
                    case 'account':     //账号登录
                        if(!that.isNull(that.$refs.username.value) && !that.isNull(that.$refs.password.value)){
                            that.btn_active = true;
                        }else{
                            that.btn_active = false;
                        }
                    break;
                    case 'reset_pwd':   //重置密码
                        that.wrong_pwd = false;
                        if(!that.isNull(that.$refs.code.value) && !that.isNull(that.$refs.password.value) &&! that.isNull(that.$refs.repassword.value)){
                            that.btn_active = true;
                        }else{
                            that.btn_active = false;
                        }
                    break;
                    case 'register':   //注册
                        let username = '';
                        if(!that.isNull(that.$refs.username.value) && !that.isNull(that.$refs.code.value) && !that.isNull(that.$refs.password.value) && !that.isNull(that.$refs.nickname.value)){
                            that.btn_active = true;
                        }else{
                            that.btn_active = false;
                        }
                        if(!that.isNull(that.$refs.username.value)){
                            that.user_mobile = that.$refs.username.value;
                        }else{
                            that.send_captchacode = false;
                        }
                    break;
                    case 'bind':    //绑定手机
                        if(!that.isNull(that.$refs.username.value) && !that.isNull(that.$refs.code.value)){
                            that.btn_active = true;
                        }else{
                            that.btn_active = false;
                        }
                        if(!that.isNull(that.$refs.username.value)){
                            that.send_captchacode = true;
                        }else{
                            that.send_captchacode = false;
                        }
                    break;
                }
            },
            /* 通用方法 end*/

            /* 通用校验 */
            // 判断有效性
            isNull: function(val){
                if(val==""||val==null||val==undefined){
                    return true;
                }else{
                    return false;
                }
            },
            // 手机校验
            valid_phone: function(phone,isMsgShow){
                let that = this, 
                    _isValid = true,
                    _reg = /^1\d{10}$/,
                    _msg;
                if(phone === ''){
                    _msg = "手机号码不能为空";
                    _isValid = false;
                }else if(!_reg.test(phone)){
                    _msg = "请输入有效的手机号码";
                    _isValid = false;
                }
                if(!_isValid && isMsgShow){
                    that.$toast(_msg,1000,'wap');
                }
                return _isValid;
            },
            // 昵称校验
            valid_nickname:function(uname){
                let that = this,
                    nickname = that.$refs.nickname.value;
                that.value_error = false;
                that.input_index = 1;
                if(!uname){
                    nickname = uname;
                }
                if(nickname == ''){
                    return false;
                }
                if(nickname.length > 6){
                    that.value_error = true;
                    that.$toast("昵称不能超过6个字符哦~",1000,'wap');
                    return false;
                }
                if(!/^[a-zA-Z0-9_\-\u4e00-\u9fa5]+$/.test(nickname)){
                    that.value_error = true;
                    that.$toast("昵称不能含有特殊字符！",1000,'wap');
                    return false;
                }
                that.input_index = 1;
                //检测昵称是否被注册
                that.check_nickname(nickname);
                return true;
            },
            // 邮箱校验
            valid_email:function(email,isMsgShow){
                let _isValid = true,that=this,
                _reg = /^(\w)+(\.\w+)*@(\w)+((\.\w+)+)$/,
                _msg;
                if(email == ''){
                    _msg = "邮箱不能为空";
                    _isValid = false;
                }else if(!_reg.test(email)){
                    _msg = "请输入有效的邮箱";
                    _isValid = false;
                }
                if(!_isValid && isMsgShow){//是否展示消息
                    that.$toast(_msg,1000,'wap');
                }
                return _isValid;
            },  
            // 密码校验
            valid_password:function(e){
                let that = this,
                    _isValid = true,
                    pwd = that.$refs.password.value,
                    myreg = /^(\w){6,20}$/,
                    _msg,
                    len = pwd.length;
                if(typeof e !== 'undefined'){
                    $(e.currentTarget).parent(".form_div").removeClass("focus");
                }
                if(pwd == ''){
                    _msg = "请填写密码";
                    _isValid = false;
                }else if(len<6 || len>20){
                    _isValid = false;
                    _msg = "请输入6-20个字符的密码";
                }
                if(!myreg.test(pwd)){
                    _isValid = false;
                    _msg = "只能输入6-20个字母、数字、下划线";
                }
                if(!_isValid && pwd !== ''){
                    that.wrong_pwd = true;
                    that.wrong_pwd_message = _msg;
                    that.btn_active = false;
                }
                return _isValid;
            },
            /* 通用校验 end */

            /* 验证码相关方法 */
            // 发送手机验证码
            send_phone_msg: function(check){
                let that = this,
                    mid;
                if(check){
                    mid = that.register_mid; 
                }else{
                    mid = that.find_mid;
                }
                that.$axios.post("/api/common/mobile_code_ext/",
                    {
                        mid: mid,
                        mobile: that.user_mobile,
                    }
                ).then(function(data){
                    that.$toast(data.data.content,1000,'wap');
                    if(data.data.code == 2) that.settime('手机');
                })
            },
            // 发送邮箱验证码（找回密码）
            send_email_msg: function(type){
                let that = this,
                    mid = type === 'find' ? that.find_mid : that.register_mid,
                    email = type === 'find' ? that.user_email : that.$refs.username.value,
                    en_email;
                that.$axios.get("/api/common/public_key/").then(function(data){
                    let RsaKey = that.$rsa,
                        Base64 = that.$base64,
                        rsakey = new RsaKey(),
                        base64 = new Base64(),
                        modulus = data.data.modulus,
                        exponent = data.data.exponent;
                    rsakey.setPublic(base64.b64tohex(modulus), base64.b64tohex(exponent));
                    en_email = base64.hex2b64(rsakey.encrypt(email));
                    that.$axios.post("/api/common/get_email_msg_code/",{
                        mid:mid,
                        email:email,
                        enEmail:en_email
                    })
                        .then(function(data){
                            if(data.data.code === '2') {
                                that.settime('邮箱');
                                that.show_send_modal = true;
                            }else{
                                that.$toast(data.data.content,1000,'wap');
                            }
                        })
                });
            },
            // 获取验证码倒计时	
            settime: function(type) {
                let that = this;
                if (that.countdown == 0) { 
                    that.send_captchacode = true;
                    that.code_btn_tip = "获取"+ type +"验证码"
                    that.countdown = 60; 
                    return;
                }else {
                    that.send_captchacode = false;
                    that.code_btn_tip = "重新发送(" + that.countdown + ")"
                    that.countdown--; 
                } 
                that.timer = setTimeout(function(){that.settime(type)},1000);
            },
            /* 验证码相关方法 end */

            // 微信自动登录
            wechat_login_event: function(){
                this.$common.wechat_login(this);
            },
            // 关闭邮件发送弹框
            close_send_modal: function(){
                this.show_send_modal = false;
            },
            // 账号密码登录
            username_submit_event: function(){
                let that = this,
                    password = that.$refs.password.value,
                    username = that.$refs.username.value;
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
                            if (data.data.code == 2) {
                                that.$toast("登录成功",1000,'wap');
                                if (that.$route.query.redirectUrl) {
                                    location.href = that.$route.query.redirectUrl;
                            } else {
                                    location.href = '/mobile/home/';
                                }
                            } else {
                                that.$toast('用户名或密码错误，请重新输入',1000,'wap');
                            }
                        })
                })
            },
            // 找回密码提交
            find_pwd_event: function(){
                let that = this,
                    username = that.$refs.username.value,
                    emailreg = /^\w+([-+.]\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/,    //判断是手机还是邮箱
                    mobilereg = /^1\d{10}$/;
                if(emailreg.test(username)){            //是邮箱
                    //1 检测邮箱是否已注册
                    that.$axios.get("/api/register/check_email/",{params:{email:username}}).then(function(data){
                        if(data.data.code == 2){
                            that.$toast("该邮箱未注册账号~",1000,'wap');
                            $(".find_pwd_panel button.find_pwd").prop("disabled", false);
                        }else if(data.data.content === '该邮箱已被注册'){
                            //2 发送邮件
                            if(that.valid_email(username,true)){
                                that.change_login_type('reset_pwd');
                                that.reset_type = "email";
                                that.user_email = username;
                                that.send_email_msg('find');
                                // 清楚自动补充
                                that.$nextTick(function(){
                                    $(".reset_pwd_panel input[name='code']").val('');
                                });
                            }
                        }else{
                            that.$toast(data.data.content,1000,'wap');
                        }
                    })
                }else if(mobilereg.test(username)){    //手机重置密码
                    //1 检测手机是已注册
                    that.$axios.get("/api/register/check_mobile/",{params:{mobile:username}}).then(function(data){
                        if(data.data.code == 2){
                            that.$toast("该手机号码未注册账号~",1000,'wap');
                        }else if(data.data.content === '手机已被注册'){
                            //校验手机号码
                            if(that.valid_phone(username,true)){
                                // 发送短信
                                that.user_mobile = username;
                                that.change_login_type('reset_pwd');
                                that.reset_type = "phone";
                                that.send_phone_msg(false);
                                // 清楚自动补充
                                that.$nextTick(function(){
                                    $(".reset_pwd_panel input[name='code']").val('');
                                });
                            }
                        }else{
                            that.$toast(data.data.content,1000,'wap');
                        }
                    })
                }else{
                    that.$toast("请输入正确的手机号或邮箱",1000,'wap');
                    return;
                }
            },
            // 手机/邮箱重置密码
            reset_pwd_event:function(){
                let that = this, 
                    password = that.$refs.password.value,
                    repassword = that.$refs.repassword.value,
                    code = that.$refs.code.value,
                    username;
                if(that.reset_type === 'phone'){
                    username = that.user_mobile;
                }else{
                    username = that.user_email;
                }
                if(!that.valid_password()){
                    return;
                };
                if(password !== repassword){
                    that.$toast("两次输入的密码不一致",1000,'wap'); 
                    return;
                }
                that.$axios.get("/api/common/public_key/").then(function(data){
                    let RsaKey = that.$rsa,
                        Base64 = that.$base64,
                        rsakey = new RsaKey(),
                        base64 = new Base64(),
                        modulus = data.data.modulus,
                        exponent = data.data.exponent;
                    rsakey.setPublic(base64.b64tohex(modulus), base64.b64tohex(exponent));
                    let enPassword = base64.hex2b64(rsakey.encrypt(password));
                    that.$axios.post('/api/password/find_password_submit/',{
                        code: code,
                        username: username,
                        mid: that.find_mid,
                        enPassword: enPassword,
                    }).then(function(data){
                        if(data.data.code == 2){
                            that.$toast("修改成功",2000,'wap');
                            setTimeout(function(){
                                that.change_login_type('account');
                            },2000)
                            
                        }else{                        
                            that.$toast(data.data.content,2000,'wap')
                        }
                    })
                });
            },

            /* 注册流程 */
            // 校验手机是否注册
            check_phone:function(e){
                let that = this, phone = that.$refs.username.value;
                if(typeof e !== 'undefined'){
                    $(e.currentTarget).parent(".form_div").removeClass("focus");
                }
                if(that.isNull(phone)){
                    that.wrong_phone = false; 
                    return;
                }
                // that.send_captchacode = true;
                //发送短信
                that.$axios.get("/api/register/check_mobile/",{params:{mobile:phone}}).then(function(data){
                    if(data.data.code == 2){
                        that.wrong_phone = false;
                        that.send_captchacode = true;
                        that.user_mobile = phone;
                        return
                        // if(typeof callback === 'function'){callback()}
                    }else{
                        that.wrong_phone = true;
                        that.wrong_phone_message = data.data.content;
                        that.btn_active = false;
                        return false;
                    }
                })  
            },
            // 校验昵称是否注册
            check_nickname:function(e){
                let that = this, nickname = that.$refs.nickname.value;
                if(typeof e !== 'undefined'){
                    $(e.currentTarget).parent(".form_div").removeClass("focus");
                }
                if(that.isNull(nickname)){
                    that.wrong_nickname = false; 
                    return;
                }
                //发送邮件
                that.$axios.get("/api/register/check_nickName/",{params:{nickName:nickname}}).then(function(data){
                    if(data.data.code == 2){
                        that.wrong_nickname= false;
                    }else{
                        that.wrong_nickname= true;
                        that.wrong_nickname_message = data.data.content;
                        that.btn_active = false;
                        return false;
                    }
                })  
            },
            // 校验邮箱是否注册
            check_email:function(e){
                let that = this, email = that.$refs.username.value;
                if(typeof e !== 'undefined'){
                    $(e.currentTarget).parent(".form_div").removeClass("focus");
                }
                if(that.isNull(email)){
                    that.wrong_email = false; 
                    return;
                }
                //发送邮件
                that.$axios.get("/api/register/check_email/",{params:{email:email}}).then(function(data){
                    if(data.data.code == 2){
                        that.wrong_email = false;
                        that.send_captchacode = true;
                        that.user_email = email;
                        return true;
                    }else{
                        that.wrong_email = true;
                        that.wrong_email_message = data.data.content
                        that.btn_active = false;
                        return false;
                    }
                })  
            },

            // 手机/邮箱注册
            register_submit_event:function(){
                let that = this,
                    nickName = that.$refs.nickname.value,
                    username = that.$refs.username.value,
                    password = that.$refs.password.value,
                    code = that.$refs.code.value,
                    flag = true;
                // 校验昵称
                if(nickName === ''){
                    that.wrong_nickname = true;
                    that.wrong_nickname_message = "请填写昵称！";
                    return;
                }else{
                    if(!that.valid_nickname(nickName)){
                        return false;
                    }
                }
                //校验邮箱
                if(that.login_type === 'email_register'){
                    if(!that.valid_email(username,true)) flag = false;
                }else if(that.login_type === 'phone_register'){
                    if(!that.valid_phone(username,true)) flag = false;
                }
                //校验密码
                if(!that.valid_password()) return;
                if(!flag) return;
                $(".register_panel .sign_up").prop("disabled", true);
                that.$axios.get("/api/common/public_key/").then(function(data){
                    let RsaKey = that.$rsa,
                        Base64 = that.$base64,
                        rsakey = new RsaKey(),
                        base64 = new Base64(),
                        modulus = data.data.modulus,
                        exponent = data.data.exponent;
                    rsakey.setPublic(base64.b64tohex(modulus), base64.b64tohex(exponent));
                    let enPassword = base64.hex2b64(rsakey.encrypt(password));
                    if(that.login_type === 'email_register'){
                        that.$axios.post('/api/register/submit/',{
                            nickName: nickName,
                            email: username,
                            enPassword: enPassword,
                            code: code,
                            mid: that.register_mid
                        }).then(function(data){
                            if (data.data.code === '2') {
                                that.$toast("注册成功",2000,'wap');
                                that.user_email = username;
                                setTimeout(() => {
                                    that.login_type = 'account';
                                }, 2000);
                            } else {
                                that.$toast(data.data.content,1000,'wap');                              
                            }
                            $(".register_panel .sign_up").prop("disabled", false);
                        })
                    }else{
                        that.$axios.post('/api/register/mobile_submit/',{
                            mid: that.register_mid,
                            code: code,
                            nickName: nickName,
                            mobile: username,
                            enPassword: enPassword
                        }).then(function(data){
                            if (data.data.code == 2) {
                                that.$toast("注册成功",2000,'wap');
                                that.user_email = username;
                                setTimeout(() => {
                                   that.login_type = 'account';
                                }, 2000);
                            } else {
                                that.$toast(data.data.content,1000,'wap');
                            }
                            $(".register_panel .sign_up").prop("disabled", false);
                        })
                    }
                })
            },
            /* 注册流程 end */
		}
	}
</script>

<style lang="less" scoped>
    @import url("../../assets/wap/css/common.css");

    .login_content{
        position:relative;
        width:100%;
        height:100vh;
        margin:0 auto;
        text-align:center;
    }
    .head{
        position:absolute;
        top:0.875rem;
        left:0.75rem;
        width:1.5rem;
        height:1.5rem;
        background:url(../../assets/wap/images/login/back.png) top center no-repeat;
        background-size:contain;
        a{
            display:block;
            width:1.5rem;
            height:1.5rem;
        }
    }
    // 通用面板
    .login_panel{
        padding-top:20%;
        background:#fff;
        .head{
            opacity:0.5;
        }
        .title p{
            margin:0 auto 20%;
            font-size:1.2rem;
            color:#323232;
        }
        .form_contain{
            width:100%;
            text-align:center;
            .form_div{
                width:15.2rem;
                height:1.825rem;
                line-height:1.825rem;
                margin:0 auto 1.2rem;
                text-align:center;
                border:0;
                border-bottom:1px solid #d9d9d9;        
                &.focus{
                    border-bottom:1px solid var(--mainColor);        
                }
                &.error{
                    border-bottom:1px solid #ff7272;
                }
            }
            input{
                display:inline-block;
                width:15.2rem;
                padding-left:1.725rem;
                border:0;
                font-size:0.75rem;
                &:last-child{
                    margin-bottom:0;
                }
            }
        }
        .form_div{
            position:relative;
            &:before{
                content:"";
                position:absolute;
                top:50%;
                left:0;
            }
            &.account:before, &.nickname:before{
                width:0.9rem;
                height:0.925rem;
                margin-top:-0.4625rem;
                background:url(../../assets/wap/images/login/account_icon.png)top center no-repeat;
                background-size:contain;
            }
            &.password:before, &.re_password:before{
                width:0.75rem;
                height:0.8rem;
                margin-top:-0.4rem;
                background:url(../../assets/wap/images/login/pwd_icon.png)top center no-repeat;
                background-size:contain;
            }
            &.code:before{
                content:"";
                width:0.75rem;
                height:0.9rem;
                margin-top:-0.45rem;
                background:url(../../assets/wap/images/login/code_icon.png) top center no-repeat;
                background-size:contain;
            }
            &.phone{
                input{
                    padding-left:4.7rem;
                }
                &:before{
                    content:"";
                    width:0.7rem;
                    height:1.1rem;
                    margin-top:-0.55rem;
                    background:url(../../assets/wap/images/login/phone_icon.png) top center no-repeat;
                    background-size:contain;
                }
            }
            &.email:before{
                content:"";
                width:0.85rem;
                height:0.6rem;
                margin-top:-0.3rem;
                background:url(../../assets/wap/images/login/email_icon.png) top center no-repeat;
                background-size:contain;
            }
        }
        .area_code{
            position:absolute;
            bottom:0;
            left:1.6rem;
            height:1.85rem;
            line-height:1.85rem;
            font-size:0.75rem;
            color:#2b2b2b;
            &:after{
                content:"";
                display:inline-block;
                vertical-align:middle;
                height:0.55rem;
                width:1px;
                margin-left:0.8rem;
                background:#bbb;
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
        .code_btn{
            position:absolute;;
            right:0;
            bottom:0.275rem;
            width:5rem;
            height:1.5rem;
            margin:0;
            background-color:#f1f1f1;
            border-radius:0.1rem;
            font-size:0.6rem;
            color: #585858;
        }
        button{
            display:block;
            width:15.2rem;
            height:2.5rem;
            margin:1.925rem auto 0;
            opacity:0.5;
            border:0;
            border-radius:0.2rem;
            color:#fff;
            background-color:var(--mainColor);
            &.success{
                opacity:1;
            }
        }
        .footer{
            position:absolute;
            bottom:4%;
            width:100%;
            text-align:center;
            a{
                font-size:0.6rem;
                color:var(--mainColor);
                &:first-child:after{
                    content:"";
                    display:inline-block;
                    vertical-align:middle;
                    height:0.45rem;
                    width:1px;
                    margin:0 1.15rem;
                    background:#e1e1e1;
                }
            }
        }
    }
    // 登录注册首页
    .login_index{
        position:relative;
        width:100%;
        height:100%;
        background:url(../../assets/wap/images/login/bg.png) center bottom no-repeat;
        background-size:cover;
        .login_main{
            position:absolute;
            bottom:20%;
            left:50%;
            margin-left:-7.6rem;
            .base-logo {
                display: block;
                width: 8rem;
                margin: 0 auto 13rem;
            }
            button{
                display:block;
                width:15.2rem;
                height:2.5rem;
                border:0;
                border-radius:0.2rem;
                color:#fff;
                &.wechat_login{
                    margin-bottom:0.95rem;
                    background-color:#09cc7c;
                    &:before{
                        content:"";
                        display:inline-block;
                        vertical-align:middle;
                        width:1.175rem;
                        height:1rem;
                        background:url(../../assets/wap/images/login/wechat.png)top center no-repeat;
                        background-size:contain;
                        margin: 0 0.4rem 0.1rem 0;
                    }
                }
                &.account_login{
                    background-color:var(--mainColor);
                }
            }
        }
    }
    // 账号密码登录
    .account_panel{
        .forget_pwd{
            display:inline-block;
            margin-top:0.825rem;
            font-size: 0.6rem;
            color: #2b2b2b;
        }
    }
    // 手机/邮箱注册
    .register_panel{
        padding-top:20%;
        .title p{
            margin-bottom:2.15rem;
        }
        .user_agreement{
            display:block;
            margin-top:0.85rem; 
            font-size:0.6rem;
            color:#444444;
            a{
                color:var(--mainColor);
                font-style:normal;
            }
        }
        .footer a:first-child{
            color:#6a6a6a;
            &:after{
                margin:0 0.475rem;
            }
        }
    }
</style>