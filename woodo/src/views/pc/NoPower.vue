<template>
    <div class="no_power_contain">
        <!--头部-->
        <base-logo theme="white" link="/home/" width="64"></base-logo>
        <!--无权限-->
        <div class="function_panel no_power" :class="{nonexistent: type === 'nonexistent'}">
            <a class="back_doc" href="/home/" v-if="content[type].type && content[type].type === 'HAD_TEAM'">< 返回工作台</a>
            <p>{{content[type].head}}</p>
            <span class="tips">{{content[type].tips}}</span>
            <a class="btn" v-if="content[type].button_url" :href="content[type].button_url">{{content[type].button_text}}</a>
            <span class="foot">— 专注办公演示文档制作 —</span>
        </div>
    </div>
</template>

<script>
    export default {
        metaInfo: {
            title: '吾道-无权限',
            meta: [
                {
                    property: 'og:title',
                    content: '吾道-无权限'
                },
                {
                    property: 'og:url',
                    content: 'https://www.woodo.cn/no_power/'
                },
            ]
        },
        name: "NoPower",
        data() {
            return {
                type: 'preview',
                content: {
                    preview:{
                        head: '没有权限访问',
                        tips: '该文档暂不支持外部查看，请联系所有者开放权限',
                        button_text:'返回主页',
                        button_url:'/',
                    },
                    edit:{
                        head: '没有权限访问',
                        tips: '文档暂不支持第三方编辑',
                        button_text:'返回主页',
                        button_url:'/',
                    },
                    nonexistent:{
                        head: '抱歉！查看失败',
                        tips: '该文档已删除，请联系文档所有者',
                        button_text:'返回主页',
                        button_url:'/',
                    },
                    team:{
                        head: '加入团队失败',
                        tips: '',
                        button_text : '返回工作台',
                        button_url:'/home/',
                    },
                    url_expired:{
                        head: '文档链接已过期',
                        tips: '该文档访问链接已过期，请联系所有者修改',
                        button_text:'返回主页',
                        button_url:'/',
                    },
                    platform_param_null:{
                        head: '授权失败',
                        tips: '平台校验失败，appId和token不允许为null',
                        button_text:'返回主页',
                        button_url:'/',
                    },
                    platform_null:{
                        head: '授权失败',
                        tips: '平台校验失败，不存在或未启用',
                        button_text:'返回主页',
                        button_url:'/',
                    },
                    platform_valid_error:{
                        head: '授权失败',
                        tips: '平台校验失败，token校验失败',
                        button_text:'返回主页',
                        button_url:'/',
                    },
                    platform_member_add_error:{
                        head: '授权失败',
                        tips: '平台用户新增失败',
                        button_text:'返回主页',
                        button_url:'/',
                    },
                    platform_service_expire:{
                        head: '授权失败',
                        tips: '平台校验失败，吾道SDK相关服务已到期，可联系服务方处理',
                        button_text:'返回主页',
                        button_url:'/',
                    },
                    platform_unknown_error:{
                        head: '授权失败',
                        tips: '平台校验失败，未知异常',
                        button_text:'返回主页',
                        button_url:'/',
                    },
                },
            }
        },
        methods: {
            scroll_event:function(){
                let that = this,
                    inner_height = window.innerHeight,
                    scroll_top = window.scrollTop,
                    element_offseTop = document.getElementById('xxx').offsetTop;

                if(inner_height + scroll_top >= element_offseTop && !that.scrolling){
                    that.scrolling = true;
                    //做些什么事情
                    //做些什么事情
                    that.scrolling = false;
                }
            },


        },
        mounted() {
            const that = this;
            if(that.$route.query.type){
                let type = that.$route.query.type;
                if(type === 'team'){
                    let tips_obj = JSON.parse(localStorage.getItem("error_tip"));
                    that.content['team'].tips = tips_obj.content;
                    that.content['team'].button_text = tips_obj.buttonText;
                    that.content['team'].type = tips_obj.type;
                    switch (tips_obj.type) {
                        case 'ALREADY_JOINED':
                            that.content['team'].button_url = '/home/?type=myTeam';
                            break;
                        case 'HAD_TEAM':
                            that.content['team'].button_url = '/home/?type=myTeam';
                            localStorage.setItem("teamType", 'member');
                            break;
                        default:
                            break;
                    }
                }
                that.type = type;
            } 
        }
    }
</script>

<style lang="less" scoped>
    @import url("../../assets/pc/css/common.css");

    .no_power_contain{
        position:fixed;
        top:0;
        left:0;
        min-width:1240px;
        width:100%;
        height:100%;
        background:url(../../assets/pc/images/common/display_bg_2.jpg) center no-repeat;
        background-size:cover;
        overflow-y:auto;
        .base-logo{
            position:absolute;
            left:30px;
            top:30px;
        }
        /*无权限*/
        .no_power{
            position:absolute;
            top:50%;
            left:50%;
            width:940px;
            height:630px;
            margin:-315px 0 0 -470px;
            padding-top:68px;
            border-radius:4px;
            background:#ffffff;
            font-size:0;
            text-align:center;
            box-shadow:0 0 10px 2px rgba(0,0,0,0.1);
            user-select:none;
            &:after{
                content:'';
                display:block;
                width:537px;
                height:386px;
                margin:0 0 0 229px;
                background:url(../../assets/common/images/no_power_2.jpg) center no-repeat;
            }
            &.nonexistent:after{
                background:url(../../assets/common/images/no_power_3.jpg) center no-repeat;
            }
            .back_doc{
                position: absolute;
                top: -50px;
                left: 0;
                height: 50px;
                line-height: 50px;
                text-align: left;
                font-size: 18px;
                font-weight: 100;
                color: #fff;
                cursor: pointer;
            }
            p{
                height:68px;
                line-height:68px;
                font-size:36px;
                color:#323232;
                &:before, &:after{
                    content:'';
                    position:relative;
                    top:-3px;
                    display:inline-block;
                    width:40px;
                    height:1px;
                    margin:0 8px;
                    background:#000000;
                    vertical-align:middle;
                }
            }
            .tips{
                display:block;
                height:46px;
                line-height:46px;
                font-size:14px;
                color:#707070;
            }
            .foot{
                position:fixed;
                bottom:30px;
                left:0;
                display:block;
                width:100%;
                height:14px;
                line-height:14px;
                font-size:14px;
                color:#cfcfcf;
            }
            .btn {
              width: 170px;
              height: 40px;
              display: block;
              margin: 10px auto 0px auto;
              line-height: 40px;
              background: var(--mainColor);
              color: #fff; 
              border-radius: 4px;
              font-size: 14px;
              &:hover {
                opacity: 0.8;
              }
            }
        }
    }
</style>