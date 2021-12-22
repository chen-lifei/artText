<template>
    <!-- API接入说明文档 -->
	<div class="api_document_contain">
        <!-- 通用头部 -->
		<CommonHead></CommonHead>
        <!-- 主体 -->
        <div class="api_document_main">
            <!-- api介绍 -->
            <div class="introduce_panel">
                <div class="wrapper">
                    <h1>吾道幻灯片API</h1>
                    <h3>只需简单几行代码，就可将吾道幻灯片接入到您的产品/<br>CRM/OA系统当中，快速拥有强大的PPT在线协作功能。</h3>
                    <div class="access_btn">
                        <button class="apply_access" @click="toggle_price_modal">免费试用</button>
                        <button class="check_price" @click="toggle_apidemo_modal">查看Demo</button>
                    </div>
                    <div class="api_tag">
                        <p>海量模板素材</p>
                        <p>极简的编辑交互</p>
                        <p>支持多人同时协作</p>
                        <p>专属个性定制</p>
                    </div>
                </div>
            </div>
            <!-- 产品亮点 -->
            <div class="highlight_panel">
                <div class="highlight_list">
                    <div class="highlight_item clearfix">
                        <div class="content_left">
                            <span>快速接入</span>
                            <h3>接入简单</h3>
                            <p>只需几行代码，就可以将吾道幻灯片强大的编辑器<br>和协同能力集成到你的产品/CRM/OA系统中</p>
                        </div>
                        <div class="content_right">
                            <img v-webp="require(`../../assets/pc/images/api/api_highlight_01.png`)">
                        </div>
                    </div>
                    <div class="highlight_item clearfix">
                        <div class="content_left">
                            <span>优秀体验</span>
                            <h3>无差别体验</h3>
                            <p>接入API后，您的用户将享受与吾道幻灯片无差别<br>的编辑、协作体验，功能齐全，性能稳定</p>
                        </div>
                        <div class="content_right">
                            <img v-webp="require(`../../assets/pc/images/api/api_highlight_02.png`)">
                        </div>
                    </div>
                    <div class="highlight_item clearfix">
                        <div class="content_left">
                            <span>个性定制</span>
                            <h3>个性化定制</h3>
                            <p>提供个性化定制，无论是界面还是交互功能，我们<br>将最大程度的满足您的需求</p>
                        </div>
                        <div class="content_right">
                            <img v-webp="require(`../../assets/pc/images/api/api_highlight_03.png`)">
                        </div>
                    </div>
                </div>
            </div>
            <!-- 免费试用 -->
            <div class="freetry_panel">
                <div class="wrapper">
                    <h3>立即领取7天免费试用机会</h3>
                    <button @click="toggle_price_modal">免费试用</button>
                </div>
            </div>
            <!-- 都在用 -->
            <div class="using_panel">
                <div class="wrapper">
                    <h2>他们都在用</h2>
                    <img src="../../assets/pc/images/api/using_bg.png">
                </div>
            </div>
        </div>
        <!-- 定价弹框 -->
        <transition name="modal-fade">
            <div class="modal_masking price_modal" v-if="price_modal_show">
                <div class="price_modal_contain" @click.stop>
                    <div class="header">
                        <p>立即接入<吾道幻灯片API>为平台赋能</p>
                        <button class="close" @click="toggle_price_modal"></button>
                    </div>
                    <div class="body">
                        <table>
                            <thead>
                                <tr>
                                    <td></td>
                                    <td>基础版</td>
                                    <td>定制版</td>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td>使用所有基础功能、模板和素材</td>
                                    <td><i class="check"></i></td>
                                    <td><i class="check"></i></td>
                                </tr>
                                <tr>
                                    <td>界面定制</td>
                                    <td class="disabled">—</td>
                                    <td><i class="check"></i></td>
                                </tr><tr>
                                    <td>功能定制</td>
                                    <td class="disabled">—</td>
                                    <td><i class="check"></i></td>
                                </tr>
                                <tr>
                                    <td>数据储存私有化</td>
                                    <td><i class="disabled">—</i></td>
                                    <td><i class="check"></i></td>
                                </tr> 
                                <tr>
                                    <td>七天免费试用</td>
                                    <td><i class="check"></i></td>
                                    <td><i class="disabled">—</i></td>
                                </tr> 
                                <tr>
                                    <td>接入方式</td>
                                    <td>API</td>
                                    <td>本地部署</td>
                                </tr>
                                <tr>
                                    <td></td>
                                    <td class="btn">
                                        <p>￥129 / 人 / 年</p>
                                        <span>最低50人起购</span>
                                    </td>
                                    <td class="btn">
                                        <p>按需定价</p>
                                    </td>
                                </tr>
                            </tbody>
                            <tfoot>
                                <tr>
                                    <td></td>
                                    <td><button @click="toggle_adviser_modal">申请接入</button></td>
                                    <td><button @click="toggle_adviser_modal">联系顾问</button></td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>
                </div>
            </div>
        </transition>
        <!-- 顾问弹框 -->
        <transition name="modal-fade">
            <div class="modal_masking adviser_modal" v-if="adviser_modal_show">
                <div class="adviser_modal_contain" @click.stop>
                    <h1>咨询顾问</h1>
                    <button class="modal-close" @click="toggle_adviser_modal"></button>
                    <img src="../../assets/pc/images/api/adviser_ewm.png">
                    <p>微信扫码联系顾问</p>
                </div>
            </div>
        </transition>
        <!-- Demo弹框-->
        <transition name="modal-fade">
            <div class="modal_masking apidemo_mdal" v-if="apidemo_modal_show">
                <div class="api_demo_contain">
                    <div class="header">
                        <p>*本功能由吾道幻灯片平台提供技术支持，使用更多模板和功能请访问官网&nbsp;<a href="https://www.woodo.cn" target="_blank">www.woodo.cn</a></p>
                        <span @click="toggle_apidemo_modal">关闭</span>
                    </div>
                </div>
            </div>
        </transition>
        <!-- 通用底部 -->
		<CommonFoot></CommonFoot>
	</div>
</template>

<script>
	import CommonHead from '@/components/nav/CommonHead.vue';
	import CommonFoot from '@/components/nav/CommonFoot.vue';
    export default { 
        components: {CommonHead, CommonFoot},
        metaInfo() {
			return {
				title: '吾道-企业客户',
				meta: [{
                    property: 'og:title',
                    content: '吾道-企业客户'
                },
                {
                    property: 'og:url',
                    content: 'https://www.woodo.cn/open_api/'
                }]
			};
		},
		data(){
			return{
                // 定价弹框展示标识
                price_modal_show: false,
                // 顾问弹框展示标识
                adviser_modal_show: false,
                // apiDemo弹框展示标识
                apidemo_modal_show: false,
			} 
		},
		mounted () {
        },
		methods: {
            // 打开/关闭定价弹框
            toggle_price_modal () {
                this.price_modal_show = !this.price_modal_show;
                this.stop_page_scroll();
            },
            // 打开/关闭顾问弹框
            toggle_adviser_modal () {
                this.adviser_modal_show = !this.adviser_modal_show;
                this.stop_page_scroll();
            },
            // 打开/关闭apiDemo弹框
            toggle_apidemo_modal () {
                let that = this;
                // 打开弹窗
                if (!that.apidemo_modal_show) {
                    that.apidemo_modal_show = true;
                    that.insert_iframe_page();
                } else {
                    $('.header_masking').hide();
                    that.apidemo_modal_show = false;
                }
                that.stop_page_scroll();
            },
            // 插入iframe页面
            insert_iframe_page () {
                let that = this;
                let appid = 'wd0f80a67d0a2e4d45';
                // 获取token
                that.$axios.get('/api/platform/common/get_token/',{params:{
                    appId: appid,
                }}).then((data) => {
                    let res_data = data.data;
                    if (res_data.code !== '2') {
                        that.$toast(res_data.content, 1500);
                        that.apidemo_modal_show = false;
                        return;
                    }
                    let token = res_data.data.token;
                    let time = res_data.data.time;
                    // 插入iframe
                    that.loadScript("/public/sdk/api-sdk.js", (() => {
                        let host = (window.location.protocol+"//api.woodo.cn");
                        woodoJs.init({
                                appId: appid,
                                token: token,
                                time: time,
                                domain: host,
                                userUuid:'woodo_001',
                                docId: '',
                                css:host+"/public/sdk/style.css",
                                ele:".api_demo_contain",
                                fontFamily:"woodo-SourceHanSansCN-ExtraLight",
                                fontFamilyOrder:["woodo-SourceHanSansCN-ExtraLight"],
                                autoSave:false,
                                loadingStart: (() => {
                                    setTimeout(() => {
                                        $('.header_masking').show();
                                    }, 1000)
                                }),
                                loadingEnd:(() => {
                                }),
                                listenMessage: ((data) => {
                                    if(data.opt === 'addPage'){
                                        //处理返回数据，返回平台操作记录
                                        return {master:{undo:'撤回添加文档页操作'+new Date().getTime(),redo:'重做添加文档页操作'+new Date().getTime()}}
                                    }else if(data.opt === 'copyPage'){
                                        //处理返回数据，返回平台操作记录
                                        return {master:{undo:'撤回复制文档页操作'+new Date().getTime(),redo:'重做复制文档页操作'+new Date().getTime()}}
                                    }else if(data.opt === 'delPage'){
                                        //处理返回数据，返回平台操作记录
                                        return {master:{undo:'撤回删除文档页操作'+new Date().getTime(),redo:'重做删除文档页操作'+new Date().getTime()}}
                                    }else if(data.opt === 'orderPage'){
                                        //处理返回数据，返回平台操作记录
                                        return {master:{undo:'撤回排序文档页操作'+new Date().getTime(),redo:'重做排序文档页操作'+new Date().getTime()}}
                                    }else if(data.opt === 'replacePage'){
                                        
                                    }else if(data.opt === 'undo'){
                                        //恢复平台数据
                                    }else if(data.opt === 'redo'){
                                        //恢复平台数据
                                    }else if(data.opt === 'orderPageCheck'){
                                        return {orderPageCheck:false};
                                    }
                                })
                        });
                    }))
                })
            },
            // 页面禁止滚动事件
            stop_page_scroll () {
                if(this.adviser_modal_show || this.price_modal_show || this.apidemo_modal_show){
                    $('body').css('overflow','hidden')
                }else if(!this.adviser_modal_show && !this.price_modal_show && !this.apidemo_modal_show){
                    $('body').css('overflow','auto')
                }
            },
            // api_demo初始化
            loadScript (src, callback) {
                let script = document.createElement('script'),
                    head = document.getElementsByTagName('head')[0];
                script.type = 'text/javascript';
                script.charset = 'UTF-8';
                script.src = src;
                if (script.addEventListener) {
                    script.addEventListener('load', function () {
                        callback();
                    }, false);
                } else if (script.attachEvent) {
                    script.attachEvent('onreadystatechange', function () {
                        let target = window.event.srcElement;
                        if (target.readyState == 'loaded') {
                            callback();
                        }
                    });
                }
                head.appendChild(script);
            },
		}
	}
</script>

<style lang="less" scoped>
	@import url("../../assets/pc/css/common.css");
    @main_icon: url(../../assets/pc/images/api/api_icon.png) no-repeat;
	.api_document_contain{
        min-width:1240px;
        overflow:auto;
        cursor:default;
        .wrapper{
            max-width:1920px;
            margin:0 auto;
            text-align:left;
        }
        h1{
            font-size:60px;
            font-weight:normal;
            color:#071126;
        }
        h2{
            font-size:36px;
            font-weight:normal;
            color:#3a4058;
        }
        h3{
            font-size:16px;
            font-weight:normal;
            color:#3a4058;
        }
    }
    // api介绍
    .introduce_panel{
        position:relative;
        height:650px;
        padding:105px 10% 0;
        width: 80%;
        margin: 0 auto;
        background:#ffffff url("../../assets/pc/images/api/introduce_bg.png") right no-repeat;
        text-align:left;
        h1{
            margin-bottom:20px;
        }
        .access_btn{
            margin-top:70px;
            button{
                width: 211px;
                height: 56px;
                line-height: 54px;
                background-color: var(--mainColor);
                border-top-left-radius: 8px;
                border-bottom-right-radius: 8px;
                border:1px solid transparent;
                font-size:18px;
                text-align:center;
                transition:all .3s;
                &.apply_access{
                    color:#fff;
                    background:var(--mainColor);
                }
                &.check_price{
                    margin-left:14px;
                    color:#333333;
                    background:#fff;
                    border-color: #dbe0e9;
                }
                &:hover{
                    background:#68adfb;
                    color: #ffffff;
                }
            }
        }
        .api_tag{
            position:absolute;
            bottom:-65px;
            left:15%;
            width: 70%;;
            height: 130px;
            line-height: 130px;
            background-color: #ffffff;
            box-shadow: 0px 8px 13px 0px rgba(0, 0, 0, 0.04);
            border-radius: 4px;
            text-align:center;
            p{
                display:inline-block;
                vertical-align:middle;
                width:25%;
                max-width:300px;
                height:74px;
                line-height:37px;
                font-size:16px;
                color:#3b434e;
                &::before{
                    content:"";
                    display:block;
                    width:46px;
                    height:40px;
                    margin:0 auto;
                    background:@main_icon 0px 0px;
                }
                &:nth-child(1)::before{
                    background-position:2px 0px;
                }
                &:nth-child(2)::before{
                    background-position:-61px 0px;
                }
                &:nth-child(3)::before{
                    background-position:-126px 0px;
                }
                &:nth-child(4)::before{
                    background-position:-191px 0px;
                }
            }
        }
    }
    // 产品亮点
    .highlight_panel{
        padding: 225px 0 160px;
        background-color: #f4f7fa;
        .highlight_list{
            .highlight_item{
                padding-left: 89px;
                margin: 0 auto 128px;
                width: 70%;
                max-width: 1600px;
                .content_left{
                    float: left;
                    margin-top: 175px;
                    text-align: left;
                }
                .content_right{
                    float: right;
                    width: calc(100% - 540px);
                    text-align: right;
                    img{
                        display: inline-block;
                        width: 100%;
                        max-width: 700px;
                    }
                }
                span{
                    display: inline-block;
                    margin-bottom: 24px;
                    letter-spacing: 1px;
                    font-size: 12px;
                    color: #666666;
                }
                h3{
                    margin-bottom: 23px;
                    color: #333333;
                    font-size: 36px;
                    font-weight: 500;
                }
                p{
                    margin-bottom: 24px;
                    line-height: 24px;
                    font-size: 16px;
                    letter-spacing: 1px;
                    color: #666666;
                }
                &.clearfix::after{
                    clear: both;
                    content: ".";
                    display: block;
                    height: 0;
                    overflow: hidden;
                    visibility: hidden;
                }
                &:nth-child(2){
                   padding-left: 0;
                   .content_left{
                       float: right;
                       margin-right: 72px;
                   }
                   .content_right{
                       float: left;
                       text-align: left;
                   }
                }
            }
        }
    }
    // 免费试用
    .freetry_panel{
        position: relative;
        height: 333px;
        background: #3253e3 url("../../assets/pc/images/api/freetry_bg.png") no-repeat center center/cover;
        text-align: center;
        user-select: none;
        .wrapper{
            width: 100%;
            height: 100%;
            max-width: none;
            padding: 88px 0;
            margin: 0;
            background: rgba(50, 83, 227, .9);
            text-align: center;
            h3{
                position: relative;
                margin-bottom: 64px;
                font-size: 36px;
                color: #fcffff;
                &::before{
                    position: absolute;
                    bottom: -11px;
                    left: 48%;
                    display: inline-block;
                    content: '';
                    width: 70px;
                    height: 5px;
                    background-color: #ffffff;
                }
            }
            button{
                width: 210px;
                height: 56px;
                background-color: #ffffff;
                border-radius: 4px;
                color: #0d7bf8;
                font-size: 16px;
                &:hover{
                    background: #68adfb;
                    color: #ffffff;
                }
            }
        }
    }
    // 都在用
    .using_panel{
        width: 100%;
        padding: 83px 10% 126px;
        text-align:center;
        background-color: #fcffff;
        h2{
            text-align:center;
            color:#161a27;
            &::after{
                content:"";
                display:block;
                width: 70px;
                height: 5px;
                margin: 10px auto 56px;
                background:var(--mainColor);
            }
        }
        img{
            width:100%;
        }
    }
    // 通用弹框
    .modal_masking{
        position: fixed;
		top: 0;
		left: 0;
        z-index:10;
		width: 100%;
		height: 100%;
        min-width: 1240px;
		text-align: center;
        background-color: rgba(0, 0, 0, 0.5);
        &::after{
			content: "";
			display: inline-block;
			vertical-align: middle;
			width: 0;
			height: 100%;
		}
    }
    // 定价弹框
    .price_modal{
        padding-top: 14vh;
        background: url("../../assets/pc/images/api/modal_bg.png") no-repeat center center/cover;
        .price_modal_contain{
            position:relative;
            display: inline-block;
			vertical-align: middle;
            width: 85%;
            max-height: 850px;
            max-width: 1122px;
			margin: 0 auto;
            background-color: #ffffff;
            border-radius: 6px;
            user-select: none;
            box-shadow: 0px 4px 24px 0px rgba(51, 51, 51, 0.16);
            .header{
                p{
                    display: inline-block;
                    position: absolute;
                    top: -96px;
                    left: 0;
                    vertical-align: middle;
                    font-size: 36px;
                    color: #ffffff;
                    width: 100%;

                }
                .close{
                    position:absolute;
                    right:-60px;
                    top:0;
                    width:36px;
                    height:36px;
                    background:@main_icon 0 -50px;
                    &:hover{
                        opacity:.9;
                    }
                }
            }
            .body{
                width:100%;
                text-align:center;
                table{
                    width: 88%;
                    max-width:1240px;
                    margin: 0 4% 0 8%; 
                    background-color: #ffffff;
                    border-radius: 2px;
                    border: solid 1px var(--mainColor);
                    border-collapse: collapse;  
                    td{
                        width: 27%;
                        height:80px;
                        border:1px solid #d8e2f2;
                        font-size:14px;
                        color:#46505a;
                        p{
                            font-size: 16px;
                            font-weight: bold;
                            color: #000000;
                        }
                        span{
                            font-size: 12px;
                            color: #999999;
                        }
                        &:first-child{
                            width: 46%;
                            font-size: 16px;
                            border-left:hidden;
                        }
                        &:last-child{
                            border-right:hidden;
                        } 
                    }
                    thead{
                        td{
                            height: 100px;
                            font-weight:bold;
                            font-size:16px;
                            color: #333333; 
                        }
                    }
                    tfoot{
                        td{
                            height: 114px;
                            border: hidden;
                            border-top: 1px solid #d8e2f2;
                            button{
                                width: 61%;
                                height: 48px;
                                background-color: #0d7bf8;
                                border-radius: 4px;
                                font-size: 16px;
                                color: #f4f7fa;
                                &:hover{
                                    background:#68adfb;
                                    color: #ffffff;
                                }
                            }
                        }
                    }
                    .check{
                        display:inline-block;
                        width: 18px;
                        height: 15px;
                        background:@main_icon -69px -56px;
                    }
                    .disabled{
                        color:#999999;
                        font-size:18px;
                        font-weight:bold;
                    }
                }
            }
        }
    }
    // 顾问弹框
    .adviser_modal{
        .adviser_modal_contain{
            position:relative;
            display:inline-block;
            vertical-align:middle;
            width:400px;
            height:366px;
            margin:0 auto;
            padding:32px 93px 0;
            border-radius:6px;
            background:#fff;
            text-align:center;
        }
        .modal-close{
            position:absolute;
            right:12px;
            top:12px;
        }
        h1{
            margin-bottom:26px;
            font-size:30px;
            color:#303336;
        }
        p{
            margin-top:5px;
            font-size:14px;
            color:#3d3d3d;
        }
    }
    // apiDemo弹框
    .apidemo_mdal{
        background: rgba(0, 0, 0, .9);
        .api_demo_contain{
            position: relative;
            width: 100%;
            height: 100%;
            .header{
                display:flex;
                justify-content: space-between;
                position: absolute;
                width: 100%;
                top: 27px;
                left: 0;
                padding: 0 54px 0 50px;
                font-size: 13px;
                color: #a3a3a3;
                a{
                    color: #C3C3C3;
                }
                span{
                    color: #a2a2a2;
                    cursor: pointer;
                    &:hover{
                        opacity: .7;
                    }
                }
            }
        }
    }
    @media screen and (max-width : 1400px) {
        .price_modal{
            .price_modal_contain{
                width: 75%;
                .header p{
                    top: -66px;
                }
            }
        }
        .introduce_panel{
            width: 100%;
        }
        .highlight_panel .highlight_list .highlight_item{
            width: 100%;
        }
    }
    @media screen and (max-height : 930px) {
        .price_modal .price_modal_contain .body{
            table{
                td{
                    height: 62px;
                }
                thead td{
                    height: 80px;
                }
                tfoot td{
                    height: 80px;
                    button{
                        height: 40px;
                    }
                }
            }
        }
    }
    @media screen and (max-height : 700px) {
        .price_modal .price_modal_contain .body{
            table{
                td{
                    height: 50px;
                }
                thead td{
                    height: 65px;
                }
                tfoot td{
                    height: 65px;
                    button{
                        height: 40px;
                    }
                }
            }
        }
    }
</style>

<style lang="less">
    iframe{
        display: block;
        position: fixed; 
        top: 50px; 
        left: 50px; 
        width: calc(100vw - 100px); 
        height: calc(100vh - 100px);
    }
</style>