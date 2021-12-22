<template>
    <div class="content">
        <!--生成邀请链接-->
        <div class="generate_invite_link" v-if="invite_type === 'send'">
            <div class="content">
                <div class="first_step">
                    <span>第一步：点击右上角</span>
                </div>
                <div class="second_step">
                    <span>第二步：发送给好友</span>
                </div>
            </div>
        </div>
        <!-- 接收邀请链接 -->
        <template v-if="invite_type === 'receive'">
            <!--直接接受邀请-->
            <div class="invite_msg" v-if="!user_can_choose">
                <div class="success" v-if="success_msg">{{msg_content}}</div>
                <div class="error" v-if="!success_msg">
                    <img src="../../assets/wap/images/authority/doc_share_bg.png" alt="">
                    <p>{{msg_content}}</p>
                    <a href="/mobile/home/">返回文档中心</a>
                </div>
            </div>
            <!-- 选择是否接受邀请 -->
            <div class="invite_choose_contain" v-if="user_can_choose">
                <img class="head" src="../../assets/wap/images/invite/invite_choose_head.png">
                <div class="body">
                    <h1>{{choose_info.title}}</h1>
                    <p v-html="choose_info.content"></p>
                </div>
                <div class="footer">
                    <button class="refuse" @click="choose_info.refuse_callback()">{{choose_info.refuse_text}}</button>
                    <button class="accept" @click="choose_info.accept_callback()">{{choose_info.accept_text}}</button>
                    <base-logo theme="gray"></base-logo>
                </div>
            </div>
        </template>
    </div>
</template>

<script>
    export default {
        name: "WechatInvite",
        data() {
            return {
                user: {},                       // 当前用户信息
                is_miniprogram: false,          // 当前环境是否为小程序
                wx_miniprogram: {},             // 小程序环境下私有对象
                
                msg_content: '',          // 消息内容
                msg_show: false,          // 消息是否展示标识
                invite_type: '',      // 邀请类型（receive：收到邀请  send:发出邀请）
                user_can_choose: false,   // 用户可选择是否接受邀请标识
                success_msg: true,        // 成功/失败消息
                choose_info: {            // 邀请选择相关
                    title: '',
                    content: '',
                    refuse_text: '拒绝',
                    accept_text: '接受',
                    refuse_callback: function(){},
                    accept_callback: function(){}
                },          
            }
        },
        mounted() {
            let that = this;
            let use_invite_link = that.$route.query.use_invite_link || false;
            let doc_id = that.$route.query.docId;
            let code = that.$route.query.code;
            let key = that.$route.query.key || false;
            let ownerName = that.$route.query.ownerName || '';
            that.user = that.$common.get_login_state();
            // 判断当前是否为小程序环境
            utils.isMiniProgramENV().then(res =>{
                if(res.miniprogram){
                    that.is_miniprogram = true;
                    that.wx_miniprogram = res.wx.miniProgram;
                    that.share_referrer = that.$route.query.detal == '1';
                } else {
                    // 判断页面打开来源，如果为空则为分享打开的状态
                    that.share_referrer = document.referrer === '';
                }
            }).catch((res) =>{
                console.error("error " + res);
            });
            // 当前邀请类型（发出/接收）
            that.invite_type = use_invite_link ? 'receive' : 'send';
            let callback = function(data,url){
                let content = '';
                try {
                    content = JSON.parse(data.content).content;
                }catch(err){
                    content = data.content;
                }
                if(data == 2){
                    that.msg_content = content + ',正在跳转...';
                    setTimeout(function(){
                        location.href = url;
                    },1000)
                }else{
                    that.user_can_choose = false;
                    that.success_msg = false;
                    that.msg_content = content;
                }
            };
            // 团队文档邀请
            if(key){
                // 发出邀请
                if(!use_invite_link){
                    if(!utils.deviceENV().wechat){
                        that.invite_type = 'receive';
                        that.msg_content = '请在微信内打开此页面';
                        return;
                    }
                    let title = '吾道演示文档';
                    let desc = '您收到一个团队邀请，请点击加入';
                    let url =  window.location.protocol +'//'+ window.location.host +'/mobile/invite?use_invite_link=true&key=' + key;
                    that.$common.get_wexin_sdk(title, desc, url);
                }
                //接收邀请
                else{
                    that.user_can_choose = true;
                    that.choose_info = {
                        title:'团队协作邀请',
                        content:`你的好友 <i style="font-style:normal;text-decoration:underline;color:#005bff;">${ownerName}</i> 邀请你加入 TA 的团队协作`,
                        refuse_text:'拒绝',
                        accept_text:'接受',
                        refuse_callback: function(){
                            that.user_login_redirect(() => {
                                that.$axios.post('/api/member/team/reject_team_invite/', {inviteKey: key}).then(function(data){
                                    callback(data.data,'/mobile/home/');
                                });
                            })
                        },
                        accept_callback: function(){
                            that.user_login_redirect(() => {
                                that.$axios.post('/api/member/team/accept_invitation/', {inviteKey: key}).then(function(data){
                                    callback(data.data,'/mobile/home/');
                                });
                            })
                        }
                    }
                }
            }
            // 协作文档邀请
            else{
                // 发送邀请
                if(!use_invite_link){
                    if(!utils.deviceENV().wechat){
                        that.invite_type = 'receive';
                        that.msg_content = '请在微信内打开此页面';
                        return;
                    }
                    that.$axios.get('/api/member/document_collaborate/generate_invite_link/', {params:{docId: doc_id}}).then(function(data){
                        if(data.data.code === '2'){
                            let code = data.data.data;
                            let title = '吾道演示文档';
                            let desc = '您收到一份协作文档邀请，请点击加入协作';
                            let url = window.location.protocol +'//'+ window.location.host +'/mobile/invite?use_invite_link=true&code='+ code +'&docId='+ doc_id;
                            that.$common.get_wexin_sdk(title, desc, url);
                        }else{
                            if('documentAccessDenied' == data.data.content){
                                data.data.content = "该账号没有邀请权限";
                            }
                            that.invite_type = 'receive';
                            callback(data.data);
                        }
                    });
                }
                // 接收邀请
                else{
                    that.$axios.post('/api/member/document_collaborate/use_invite_link/', {docId: doc_id, code: code}).then(function(data){
                        callback(data.data,utils.deviceENV().mobile ? '/mobile/home/' : '/edit/?docId='+ doc_id);
                    });
                }
            }
        },
        methods: {
            // 登录拦截方法
            user_login_redirect: function (callback) {
                let that = this;
                // 登录拦截
                if (!that.user.login) {
                    if (that.is_miniprogram) {
                        let redirectUrl = escape('/pages/document_detail/document_detail?redirectUrl='),
                            redirectParam = escape(location.pathname + location.search);
                        that.wx_miniprogram.redirectTo({url:'/pages/login/login?redirectUrl='+redirectUrl + '&redirectParam='+redirectParam});   
                    } else {
                        that.$toast('请登录后再进行操作',1000,'wap');
                        setTimeout(() => {
                            let redirect_url = encodeURIComponent(window.location.pathname + window.location.search);
                            window.location.href = '/mobile/login/?redirectUrl=' + redirect_url;
                        }, 1000);
                    }
                    return;
                }
                if (typeof callback === 'function') callback();
            },
        }
    }
</script>

<style lang="less" scoped>
    @import url("../../assets/wap/css/common.css");
    /*生成邀请链接*/
    .generate_invite_link{
        position:fixed;
        top:0;
        left:0;
        width:100%;
        height:100%;
        line-height:100%;
        font-size:0;
        text-align:center;
        &:after{
            content:'';
            display:inline-block;
            width:0;
            height:100%;
            vertical-align:middle;
        }
        .content{
            display:inline-block;
            height:21.5rem;
            line-height:initial;
            vertical-align:middle;
        }
        .first_step, .second_step{
            &:before{
                content:'';
                display:inline-block;
                width:6rem;
                height:6rem;
                border-radius:100%;
                background-size:100%;
            }
            span{
                display:block;
                height:1.75rem;
                line-height:1.75rem;
                font-size:0.75rem;
                color:#282828;
            }
            &.first_step{
                margin-bottom:6rem;
                &:before{
                    background-image:url(../../assets/wap/images/invite/invite_step_1.png);
                }
                span:after{
                    content:'';
                    position:relative;
                    top:-1px;
                    right:-0.375rem;
                    display:inline-block;
                    width:0.95rem;
                    height:0.2rem;
                    background-image:url(../../assets/wap/images/invite/invite_step.png);
                    background-size:100%;
                    vertical-align:middle;
                }
            }
            &.second_step{
                &:before{
                    background-image:url(../../assets/wap/images/invite/invite_step_2.png);
                }
            }
        }
    }
    /*邀请信息*/
    .invite_msg{
        position:fixed;
        top:0;
        left:0;
        width:100%;
        height:100%;
        background:#ffffff;
        .success{
            position:absolute;
            top:50%;
            left:0;
            width:100%;
            height:1rem;
            line-height:1rem;
            margin-top:-0.5rem;
            font-size:0.75rem;
            color:#282828;
            text-align:center;
        }
        .error{
            width:100%;
            padding-top:5rem;
            text-align:center;
            img{
                display:block;
                width:13.875rem;
                height:auto;
                margin:0 auto;
            }
            p{
                width: 80%;
                margin: 1rem auto 0;
                font-size: 0.8rem;
                color: #282828;
            }
            a{
                display:inline-block;
                width:6.25rem;
                height:2rem;
                line-height:2rem;
                margin-top:2.325rem;
                border-radius:4px;
                background:#4d8aff;
                font-size:0.7rem;
                color:#ffffff;
                cursor:pointer;
            }
        }
    }
    // 选择是否接受
    .invite_choose_contain{
        .head{
            width:100%;
            height:100%;
        }
        .body{
            width:80%;
            margin:1.3rem auto;
            text-align:center;
            h1{
                height:2.8rem;
                line-height:2.8rem;
                color:#586575;
                font-size:1rem;
                font-weight:bold;
            }
            p{
                color:#586575;
                font-size:0.6rem;
            }
        }
        .footer{
            width:90%;
            margin:3rem auto 0;
            text-align:center;
            button{
                width:calc(50% - 0.71rem);
                height:2.3rem;
                line-height:2.3rem;
                text-align:center;
                color:#fff;
                font-size:0.8rem;
                border-radius:8px;
                &.refuse{
                    margin-right:1.42rem;
                    background:#c7d2de;
                }
                &.accept{
                    background:var(--mainColor);
                }
            }
            img{
                position: absolute;
                bottom: 0.5rem;
                left: calc(50% - 34px);
            }
        }
    }
</style>