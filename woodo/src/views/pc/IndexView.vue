<template>
	<div class="index-contain">
		<!-- 头部 -->
		<CommonHead :options="head_options" ref="CommonHead"></CommonHead>

        <!-- 首屏banner -->
        <div class="index_fs_panel">
            <div class="index_fs_panel_content" ref="index_fs_element">
                <p class="index_fs_banner">强大的PPT幻灯片协作工具，轻松创建优秀作品</p>
                <p class="index_fs_describe">随时随地多人协同在线编辑，自动保存同步，手机管理文档，一键导出，海量PPT模板免费下载，新一代办公神器</p>
                <div class="index_fs_btn login_state" 
                    v-if="user.login" 
                    @click="to_use"
                    @mousemove="fs_btn_animate_in($event)" 
                    @mouseout="fs_btn_animate_out($event)">
                    <i></i><span>{{user.name}} , 欢迎回来吾道</span>
                </div>
                <div class="index_fs_btn" 
                    v-else @click="to_use" 
                    @mousemove="fs_btn_animate_in($event)" 
                    @mouseout="fs_btn_animate_out($event)">
                    <i></i><span v-bdtongji="'首页-首页-首屏-居中-立即免费试用'">立即免费使用</span>
                </div>
            </div>
        </div>

        <!-- 首屏banner背景 -->
        <div class="index_fs_panel_bg">
            <img v-webp="require(`../../assets/pc/images/index/index_banner.png`)" class="index_fs_banner_image" />
            <ul class="index_pd_characteristic">
                <li>
                    <img v-webp="require(`../../assets/pc/images/index/pd_characteristic_01.png`)"/>
                    <h3>在线制作</h3>
                    <p>云端储存，自动更新，打开网页就能写<br>随时随地办公</p>
                </li>
                <li>
                    <img v-webp="require(`../../assets/pc/images/index/pd_characteristic_02.png`)"/>
                    <h3>安全专业</h3>
                    <p>多年累积的文件传输和储存技术保障，独立<br>服务器部署，所有文件都加密</p>
                </li>
                <li>
                    <img v-webp="require(`../../assets/pc/images/index/pd_characteristic_03.png`)"/>
                    <h3>简单高效</h3>
                    <p>告别复杂的工具，针对国人习惯打造，职场<br>萌新也能快速上手</p>
                </li>
            </ul>
        </div>

        <!-- 首页模板库 -->
        <div class="index_template_panel">
            <h1 class="panel_title">吾道,&nbsp;&nbsp;已帮助1,032,741&nbsp;位小伙伴创作了<i>3</i>,<i>6</i><i>2</i><i>3</i>,<i>0</i><i>8</i><i>1</i>份文档</h1>
            <p class="panel_describe">每周定期更新，全部支持在线制作</p>
            <ul class="template_list">
                <li class="template_card" v-for="(item, index) in template_list" :key="index" @click="use_template(item)">
                    <img class="card_image" v-lazy="item.image"/>
                    <i :class="{'vip_icon' : item.isVip}"></i>
                </li>
            </ul>
            <a class="to_template_center" href="/template/">查看所有模板</a>
        </div>

        <!-- 首页产品亮点 -->
        <div class="index_pd_highlights">
            <h1 class="panel_title">为什么吾道受到数百万用户喜爱</h1>
            <div class="highlight_list">
                <div class="highlight_item clearfix">
                    <div class="content_left">
                        <h3>极简设计，操作便捷</h3>
                        <p>简洁的界面设计，优秀的用户体验，让你的操作得心<br>应手，小白也能快速制作文档</p>
                        <a href="/edit/">了解更多&nbsp;></a>
                    </div>
                    <div class="content_right">
                        <img v-webp="require(`../../assets/pc/images/index/pd_highlight_01.png`)">
                    </div>
                </div>
                <div class="highlight_item clearfix">
                    <div class="content_left">
                        <h3>多人协作，效率翻倍</h3>
                        <p>在线邀请好友协同编辑，实时沟通让你的办公效率再<br>次提升</p>
                        <a href="/edit/">了解更多&nbsp;></a>
                    </div>
                    <div class="content_right">
                        <img v-webp="require(`../../assets/pc/images/index/pd_highlight_02.png`)">
                    </div>
                </div>
                <div class="highlight_item clearfix">
                    <div class="content_left">
                        <h3>海量素材，一键替换</h3>
                        <p>100,000+精品素材，每周更新，一键替换，再也不用<br>为找素材烦恼</p>
                        <a href="/material/">了解更多&nbsp;></a>
                    </div>
                    <div class="content_right">
                        <img v-webp="require(`../../assets/pc/images/index/pd_highlight_03.png`)">
                    </div>
                </div>
            </div>
        </div>
        
        <!-- 首页用户评价 -->
        <div class="index_users_evaluate">
            <div class="evaluate_contain">
                <button class="pre_btn" @click="list_scroll('pre')"></button>
		        <button class="next_btn" @click="list_scroll('next')"></button>
                <div class="avator_evaluate">
                    <div class="avator_evaluate_list" :style="{right: rolling_length + 'px'}">
                        <div class="evaluate_item" v-for="(item, index) in evaluate_list" :key="index">
                            <div class="avator_info">
                                <img :src="require(`../../assets/pc/images/index/${item.photo}.png`)"/>
                                <span class="avator_name"> {{ item.name }} </span>
                                <span class="avator_job"> {{ item.job }} </span>
                            </div>
                            <p class="avator_evaluate"> {{ item.content }} </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- 首页导出提示-->
        <div class="index_export_tips">
            <h1 class="panel_title">只需3步，即可导出文档</h1>
            <ul class="tips_list">
                <li><img v-webp="require(`../../assets/pc/images/index/export_icon_01.png`)" alt=""/><p>选择你的模板</p></li>
                <li><img v-webp="require(`../../assets/pc/images/index/export_icon_02.png`)" alt=""/><p>自定义模板样式</p></li>
                <li><img v-webp="require(`../../assets/pc/images/index/export_icon_03.png`)" alt=""/><p>导出专属文档</p></li>
            </ul>
            <div class="index_fs_btn login_state" 
                v-if="user.login" 
                @click="to_use"
                @mousemove="fs_btn_animate_in($event)" 
                @mouseout="fs_btn_animate_out($event)">
                <i></i><span>{{user.name}} , 欢迎回来吾道</span>
            </div>
            <div class="index_fs_btn" 
                v-else @click="to_use" 
                @mousemove="fs_btn_animate_in($event)" 
                @mouseout="fs_btn_animate_out($event)">
                <i></i><span v-bdtongji="'首页-首页-首屏-居中-立即免费试用'">立即免费使用</span>
            </div>
        </div>

        <!-- 企业列表 -->
        <div class="index_company_panel">
            <h1 class="panel_title">和这些企业一起使用</h1>
            <img v-lazy="require('../../assets/pc/images/index/index_logos.png')" alt="企业列表" />
        </div>

        <!--底部-->
		<div class="index_footer">
            <div class="index_footer_center">
                <base-logo theme="gray" width="80"></base-logo>
			    <p><a href="https://www.woodo.cn/document/slides/5281674729/">公司介绍&nbsp;&nbsp;</a><a href="/license/">营业执照&nbsp;&nbsp;</a><a href="https://beian.miit.gov.cn">粤ICP备18137964号</a> © 2018-2020 爆裂科技 All rights reserved</p>
            </div>
		</div>
        <!-- 返回顶部 -->
        <backTop ref="backTop"></backTop>
        
	</div>
</template>

<style lang="less" scoped>
	@import url("../../assets/pc/css/common.css");
    @deep: ~'>>>';
    /* 首页容器 */
	.index-contain {
        width:100%;
        min-width: 1260px;
        margin:0 auto;
		text-align: center;
    }
    
	/*头部*/
	@{deep} .common_head_contain{
		position:absolute !important;
		top:0;
        left:0;
        right: 0;
        width:100%;
		z-index:10;
        transition: background 0.25s;
        .head_right .un_login .sign_up{
            font-weight:bold;
        }
        &.fixed{
            .head_right .un_login .sign_up{
                color:#fff;
                background: var(--mainColor);
            }
        }
    }
    
    /* 登录按钮 */
    .index_fs_btn{
        position: relative;
        display:inline-block;
        min-width: 280px;
        height: 60px;
        line-height: 60px;
        padding: 0 53px;
        margin-top: 67px;
        text-align: center;
        font-size: 20px;
        color: #fff;
        font-weight: bold;
        background-image: linear-gradient(#00aeff, #00aeff), linear-gradient(90deg, #1add97 100%), linear-gradient(#00fffc, #00fffc);
        box-shadow: 0px 8px 18px 0px rgba(15, 36, 152, 0.16);
        border-radius: 29px;
        overflow: hidden;
        cursor: pointer;
        user-select: none;
        &::before{
            content: '';
            position: absolute;
            left: 0;
            top: 0;
            right: 0;
            bottom: 0;
            z-index: 3;
        }
        span{
            position: relative;
            display: block;
            width: 100%;
            height: 100%;
            z-index: 2;
            text-align: center;
            &::after{
                content: '';
                display: inline-block;
                width: 20px;
                height: 20px;
                margin:0 0 4px 11px;
                background: url(../../assets/pc/images/index/index_touse_icon.png) no-repeat;
                vertical-align: middle;
            }
        }
        &.login_state{
            span{
                &::after{
                    width: 21px;
                    height: 23px;
                    margin:0 0 5px 9px;
                    background: url(../../assets/pc/images/index/index_click_icon.png) no-repeat;
                }
            }
        }
        @keyframes enter_scale {
            0% { opacity: 0; transform: scale(1); }
            1% { opacity: 1; transform: scale(1); }
            100% { opacity: 1; transform: scale(600); }
        }
        @keyframes out_scale {
            0% { opacity: 1; transform: scale(600); }
            99% { opacity: 1; transform: scale(1); }
            100% { opacity: 0; }
        }
        i{
            position: absolute;
            width: 1px;
            height: 1px;
            z-index: 1;
            opacity: 0;
            border-radius: 50%;
            background-color: rgba(230, 253, 209, 0.3);
            &.enter_scale {
                animation: enter_scale 0.6s forwards;
            }
            &.out_scale {
                animation: out_scale 0.4s forwards;
            }
        }
    }
    .panel_title{
        font-size: 32px;
        color: #333333;
        font-weight: 500;
        user-select: none;
    }
    // 首屏
    .index_fs_panel{
        position: relative;
        width: 100%; 
        height: 840px;
        padding: 172px 0 0;
        text-align: center;
        overflow: hidden;
        &:before{
            content: "";
            position: absolute;
            left: -100vw;
            bottom: 0;
            width: 300vw;
            height: 300vw;
            background: linear-gradient(90deg, #465fe9 0%, #1a3edf 100%), linear-gradient(#0d7bf7, #0d7bf7);
            border-radius: 44%;
        }
        .index_fs_panel_content{
            position: relative;
            width: 100%;
            height: 100%;
            max-width: 1680px;
            margin: 0 auto;
            .index_fs_banner{
                line-height: 1;
                margin-bottom: 30px;
                font-size: 48px;
                color: #fff;
            }
            .index_fs_describe{
                margin-bottom: 12px;
                font-size: 16px;
                color: rgba(255, 255, 255, 0.8);
            }
            .describe_more{
                position: relative;
                width: 90px;
                height: 25px;
                line-height: 23px;
                padding-right: 12px;
                margin: 0 auto;
                font-size: 12px;
                color: rgba(255, 255, 255, 0.4);
                border: solid 1px rgba(255, 255, 255, 0.4);
                border-radius: 12px;
                cursor: pointer;
                &:hover{
                    color: #f5fdfb;
                    border-color: #f5fdfb;
                    i{
                        background-color: #f5fdfb;
                    }
                }
                i{
                    position: absolute;
                    top: 6px;
                    margin-left: 2px;
                    width: 12px;
                    height: 12px;
                    font-size: 12px;
                    text-align: center;
                    line-height: 12px;
                    border-radius: 50%;
                    background: rgba(255, 255, 255, 0.4);
                    color: #3552e5;
                }
            }
        }
    }
    // 首屏背景
    .index_fs_panel_bg{
        position: absolute;
        top: 0;
        left: 0;
        width: 100%; 
        min-width: 1260px;
        height: 840px;
        padding: 172px 0 0;
        text-align: center;
        .index_fs_banner_image{
            display: block;
            max-width:90%;
            margin: 333px auto 0;
            user-select: none;
        }
        .index_pd_characteristic{
            position: absolute;
            top: 1173px;
            right: 0;
            left: 0;
            width: 1225px;
            margin: 0 auto;
            text-align: left;
            li{
                display: inline-block;
                width: 344px;
                height: 170px;
                padding: 28px 0 0 32px;
                margin-right: 64px;
                background: #ffffff;
                transition: transform .3s;
                cursor: default;
                h3{
                    margin: 16px 0;
                    font-size: 16px;
                    color: #333333;
                }
                p{
                    font-size: 14px;
                    color: #999999;
                    letter-spacing: 1px;
                    line-height: 20px;
                }
                &:hover{
                    transform: scale(1.06);
                    box-shadow: 0px 4px 16px 0px rgba(51, 51, 51, 0.16);
                    border-radius: 4px;
                }
            }
        }
        &::before{
            content: "";
            position: absolute;
            left: 0;
            top: 350px;
            width: 218px;
            height: 754px;
            background: url(../../assets/pc/images/index/index_fs_left.png) no-repeat;
        }
        &:after{
            content:"";
            position:absolute;
            right:0;
            top:0;
            width:351px;
            height:593px;
            background: url(../../assets/pc/images/index/index_fs_right.png) no-repeat;
        }
    }

    // 登录查看提示样式
    .tip_login_look{
        display: inline-block;
        width: 165px;
        height: 40px;
        line-height: 40px;
        background-color: #4198fa;
        box-shadow: 0px 9px 13px 0px rgba(13, 123, 247, 0.14);
        border-radius: 19px;
        text-align:center;
        font-size: 16px;
        color: #fff;
    }

    // 模板库
    .index_template_panel{
        padding: 650px 60px 82px;
        background-color: #fff;
        .panel_title{
            margin-bottom: 15px;
            line-height: 50px;
            i{
                display: inline-block;
                width: 30px;
	            line-height: 40px;
                margin-left: 2px;
                color: #ffffff;
                font-size: 28px;
                background-color: #333333;
                border-radius: 4px;
                &:first-child{
                    margin-left: 6px;
                }
                &:last-child{
                    margin-right: 8px;
                }
            }
        }
        .panel_describe{
            font-size: 16px;
            color: #333333;
            letter-spacing: 1px;
        }
        .template_list{
            width: 100%;
            max-width: 2560px;
            margin: 37px auto 15px;
            padding: 10px;
            overflow: hidden;
            .template_card{
                display: inline-block;
                position: relative;
                width: calc(25% - 15px);
                margin: 0 20px 23px 0;
                transition: transform .3s;
                cursor: pointer;
                img{
                    position: absolute;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    border-radius: 4px;
                }
                &:nth-child(4n){
                    margin-right: 0;
                }
                &:hover{
                    transform: scale(1.06);
                    box-shadow: 0px 4px 8px 0px rgba(51, 51, 51, 0.32);
                }
                &::before{
                    content: "";
                    display: block;
                    padding-top: 56%;
                }
            }
            i.vip_icon{
                position: absolute;
                top:20px;
                right: 20px;
                width:36px;
                height:36px;
                border-radius: 5px;
                background: #f7b500 url(../../assets/pc/images/common/vip.png) no-repeat center center;
            }
        }
        .to_template_center{
            display: inline-block;
            line-height: 44px;
            width: 160px;
            font-size: 14px;
            color: #ffffff;
            background-color: var(--mainColor);
            border-radius: 22px;
            &:hover{
                opacity: .8;
            }
        }
    }

    // 产品亮点
    .index_pd_highlights{
        background-color: #ffffff;
        .panel_title{
            margin-bottom: 128px;
        }
        .highlight_list{
            .highlight_item{
                padding-left: 121px;
                margin: 0 auto 128px;
                max-width: 1400px;
                .content_left{
                    float: left;
                    margin-top: 175px;
                    text-align: left;
                }
                .content_right{
                    float: right;
                    text-align: right;
                }
                h3{
                    margin-bottom: 23px;
                    color: #333333;
                    font-size: 32px;
                    font-weight: 500;
                }
                p{
                    margin-bottom: 24px;
                    line-height: 24px;
                    font-size: 16px;
                    letter-spacing: 1px;
                    color: #666666;
                }
                a{
                    font-size: 14px;
                    color: var(--mainColor);
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
                       margin-right: 188px;
                   }
                   .content_right{
                       float: left;
                   }
                }
            }
        }
    }

    // 用户评价
    .index_users_evaluate{
        position: relative;
        width: 100%;
        height: 400px;
        margin: 32px 0 160px;
        background: #3253e3 url(../../assets/pc/images/index/index_users_evaluate.png) no-repeat center center;
        user-select: none;
        .evaluate_contain{
            position: absolute;
            top: 0;
            right: 0;
            bottom: 0;
            left: 0;
            margin: auto;
            max-width: 1400px;
            height: 200px;
            padding: 0 60px;
            .pre_btn, .next_btn{
                position: absolute;
                top: 0;
                width: 60px;
                height: 100%;
                &::after{
                    content: "";
                    position: absolute;
                    top: 90px;
                    width: 11px;
                    height: 11px;
                    border: 2px solid #8ea0ef;
                    border-left: transparent;
                    border-top: transparent;
                }
                &:hover{
                    &::after{
                        border-color: #ffffff;
                    }
                }
            }
            .pre_btn{
                left: 0px;
                &::after{
                    left: 10px;
                    transform: rotate(135deg);
                }
            }
            .next_btn{
                right: 0;
                &::after{
                    right: 10px;
                    transform: rotate(-45deg);
                }
            }
            .avator_evaluate{
                position: relative;
                height: 100%;
                width: 100%;
                overflow: hidden;
            }
            .avator_evaluate_list{
                display: flex;
                justify-content: space-between;
                position: relative;
                height: 100%;
				transition: all .3s;
                text-align: left;
                .evaluate_item{
                    display: inline-block;
                    width: 400px;
                    height: 200px;
                    padding: 24px 30px;
                    background: #ffffff;
                    box-shadow: 0px 0px 16px 0px rgba(51, 51, 51, 0.16);
                    border-radius: 8px;
                    .avator_info{
                        position: relative;
                        margin-bottom: 21px;
                        text-align: left;
                        img{
                            display: inline-block;
                            width: 64px;
                            height: 64px;
                            border-radius: 50%;
                            background-color: #ebf0f9;
                        }
                        span{
                            position: absolute;
                            top: 0;
                            left: 88px;
                            display: block;
                        }
                        .avator_name{
                            font-size: 16px;
                            color: #333333;
                        }
                        .avator_job{
                            top: 40px;
                            font-size: 12px;
                            color: #666666;
                        }
                    }
                    .avator_evaluate{
                        height: 66px;
                        line-height: 22px;
                        font-size: 13px;
                        letter-spacing: 1px;
                        color: #999999;
                        text-align: left;
                        overflow: hidden;
                    }
                }
            }
        }
    }

    // 导出提示
    .index_export_tips{
        width: 885px;
        margin: 0 auto;
        text-align: center;
        .panel_title{
            margin-bottom: 83px;
        }
        .tips_list{
            display: flex;
            justify-content: space-between;
            margin-bottom: 89px;
            user-select: none;
            p{
                margin-top: 26px;
                font-size: 14px;
                color: #999999;
            }
        }
        .index_fs_btn{
            margin: 0 0 157px;
        }
    }

    // 企业列表
    .index_company_panel{
        width: 100%;
        padding-top: 98px;
        height: 470px;
        background: #141414 url(../../assets/pc/images/index/index_banner02.png) no-repeat center -140px;
        overflow: hidden;
        .panel_title{
            margin-bottom: 80px;
            color: #ffffff;
            opacity: .8;
        }
        img{
            display:block;
            max-width:95%;
            margin:0 auto;
        }
    }

	/*底部*/
	.index_footer{
        width:100%;
        height:60px;
        background:#050505;
        color:#7f818e;
        font-size:12px;
        text-align:center;
        .index_footer_center{
            display:flex;
            width: 1300px;
            max-width:95%;
            height:100%;
            margin: 0 auto;
            padding: 19px 0;
            justify-content:space-between;
            p{
                display:inline-block;
                height:22px;
                line-height:22px;
                a {
                    color:#7f818e;
                }
            }
        }
    }
    
    @media screen and (max-width : 1370px) {
        .evaluate_item{
            width: 370px !important;
            .avator_evaluate{
                font-size: 12px !important;
            }
        }
    }

</style>

<script>
    import CommonHead from '@/components/nav/CommonHead.vue';
    import backTop from '@/components/BackTop.vue';
	export default {
		metaInfo: {
			title: '吾道幻灯片-官方网站-专业的PPT在线协作工具，提供海量精美模板素材',
			meta: [
			    {
                    property: 'og:title',
                    content: '吾道幻灯片-官方网站-专业的PPT在线协作工具，提供海量精美模板素材'
                },
                {
                    property: 'og:url',
                    content: 'https://www.woodo.cn/'
                },
			]
		},
        components:{CommonHead, backTop},
		data() {
			return {
                head_options: {theme:'transparent'},
			    user: {
			        login: false,
			        name:'',
                    photo:'',
                    email:'',
                },
                screen_h:null,
                template_list: [], // 模板列表
                evaluate_list:[
                    {
                        name: '刘*松',
                        job: '产品经理',
                        photo: 'user_head_01',
                        content: '在学校很少做PPT，工作后却基本每个月都得做2、3个。多亏了吾道的模板商城，买了会员就可以随意下载模板了，省时省力，工作效率明显提高，舒服！'
                    },
                    {
                        name: '李*',
                        job: '公司行政',
                        photo: 'user_head_02',
                        content: '大力推广！在我的努力下，现在我们整个部门都在用吾道了！小编看我这么勤奋，能不能送我点福利呀哈哈哈，铁粉了！'
                    },
                    {
                        name: '黄*露',
                        job: '资深HR',
                        photo: 'user_head_03',
                        content: '一直苦恼该怎么做PPT，吾道的案例跟贴士一下让我的PPT高大尚起来，效率和效果都让我非常满意，希望付出的能得到回报，祝我升职顺利！'
                    },
                    {
                        name: '于*',
                        job: '资深HR',
                        photo: 'user_head_04',
                        content: '无意中发现的宝藏网站，有各种各样的模板可以直接使用，最让我意外的是编辑时还提供内容案例，再根据自己情况改改就可以了！'
                    },
                    {
                        name: '邹*阳',
                        job: '运营总监',
                        photo: 'user_head_05',
                        content: '工作中总是有开不完的会，写不完的的报告，助理向我推荐了这个网站，只使用一次就毫不犹豫开通了会员，所有模板任意使用！'
                    },
                    {
                        name: 'Bre*t',
                        job: '外企负责人',
                        photo: 'user_head_06',
                        content: '刚来中国不久，中文还不太熟练。惊奇地发现吾道居然有英文模板，省去了自己翻译模板的麻烦，工作汇报更轻松！'
                    },
                ],  // 评价列表
                list_width: 0,
                rolling_length: 0,
			}
        },
        watch:{
            template_list(value){
                $(this.$refs.templateSkeleton).removeClass('skeleton');
            },
        },
        mounted(){
            let that = this;
            that.screen_h = window.innerHeight;
            // 绑定返回头部组件
            that.$refs.backTop.show($(window));
            // 登录状态
            that.user = that.$common.get_login_state();
            if(that.user.login && document.referrer.indexOf(window.location.host) < 0) {
                return window.location.href = '/home/';
            }
            if (that.user.name && that.user.name.length > 6) {
                that.user.name = that.user.name.substring(0,6) + '...';
            }
            // get 模板
            that.get_template_list();
            // 滚动事件bind
            that.scroll_event();
            window.addEventListener('scroll', that.scroll_event);
            that.change_evaluate_width();
            // 窗口size重调 适应
            window.addEventListener('resize', function(){
                that.change_evaluate_width();
            });
        },
		methods: {
            to_use() {
                this.$router.push('/home/');
            },
            // 首屏按钮动画 (移入)
            fs_btn_animate_in(e) {
                let $el = $(e.target),
                    mouse_x = e.offsetX,
                    mouse_y = e.offsetY,
                    $i = $el.children('i');
                $i.css({
                    'top': mouse_y + 'px',
                    'left': mouse_x + 'px',
                }).addClass('enter_scale').removeClass('out_scale');
            },
            // 首屏按钮动画 (移出)
            fs_btn_animate_out(e) {
                let $el = $(e.target),
                    mouse_x = e.offsetX,
                    mouse_y = e.offsetY,
                    $i = $el.children('i');
                $i.css({
                    'top': mouse_y + 'px',
                    'left': mouse_x + 'px',
                }).addClass('out_scale').removeClass('enter_scale');
            },
			// 页面滚动事件
			scroll_event() {
				let that = this,
                    scroll_top = window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop;
                if(scroll_top > 0){
                    that.head_options = {theme:'white',fixed:true};
                }else{
                    that.head_options = {theme:'transparent',fixed:false};
                }
            },
            // 模板库列表
            get_template_list() {
                let that = this;
                that.$axios.get('/api/template/list/',{params:{
                    pageSize: 12,
                    pageNumber: 1,
                    cid: '',
                    type: 'slides',
                    sort: 'hot',
                }}).then(data => {
                    let res_data = data.data;
                    if (res_data.code !== '2') return that.$toast(res_data.content);
                    that.template_list = res_data.data.dataList.splice(0, 12);
                }).catch(err => {
                    that.$toast('获取模板列表错误');
                });
            },
            // 使用模版
            use_template(item) {
                let that  = this;
                if (!item) {
                    return;
                }
                if(item.isVip && !that.user.is_vip){
                    that.$modal({templateType:'memberGrade'});
                    return;
                }
                // 跳转到编辑页
                let value = window.localStorage.getItem('woodoExportGuide');
                if (!value) window.localStorage.setItem('woodoExportGuide', 'show');
                window.location.href = '/edit/?modalId=' + item.documentId;
            },
            // 评价列表左右滚动方法
			list_scroll(type) {
				let that = this;
				let list = document.querySelector('.avator_evaluate_list');
				let clientWidth = document.querySelector('.avator_evaluate_list').offsetWidth;
				let width = list.offsetWidth;
				// 如果是向左滚动且存在滚动距离的话
				if(type === 'pre' && that.rolling_length){
					that.rolling_length = that.rolling_length - that.list_width;
					if (that.rolling_length < 0) {
                        that.rolling_length = 0;
                    }
				}
				if(type === 'next' && that.rolling_length <= (width - clientWidth)){
					that.rolling_length = that.rolling_length + that.list_width;
				}
			},
            change_evaluate_width() {
                let that = this;
                let contain_width = $('.evaluate_contain .avator_evaluate').width() * Math.ceil(that.evaluate_list.length / 3) ;
                $('.avator_evaluate_list').css('width', contain_width);
                that.list_width = $('.evaluate_contain .avator_evaluate').width();
                that.rolling_length = 0;
            },
            // 返回顶部
            return_top() {
                $('html,body').animate({scrollTop:0}, 900);
            },
		},
	}
</script>