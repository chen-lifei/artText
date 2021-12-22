<template>
    <div class="index_contain">
		<div class="index_header">
            <base-logo theme="white"></base-logo>
			<img src="../../assets/wap/images/index/banner_logo.png">
			<div class="user_res_log">
				<a v-on:click="jump" v-if="user.login">进入吾道</a>
				<a v-on:click="jump" v-else>登录/注册</a>
			</div>
			<p>轻松创建具有视觉吸引力的演示文稿</p>
			<p>强大的PPT幻灯片协作工具</p>
			<span></span>
		</div>
		<div class="index_pic">
			<img src="../../assets/wap/images/index/index_show_banner.png" alt=""/>
			<img class="logo_other" src="../../assets/wap/images/index/logos.png" alt=""/>
		</div>
		<div class="index_platform">
			<div class="index_slide">
				<div class="index_slideshow">
					<ul>
						<li v-show="0===mark" :key="0">
							<span>随时随地办公</span>
							<p>云端储存，自动更新，打开网页就能写</p>
							<img src="../../assets/wap/images/index/characteristic_01.png">
						</li>
						<li v-show="1===mark" :key="1">
							<span>专业安全技术保障</span>
							<p>拥有多年积累的文件传输和存储专业技术保障， 独立服务器部署，所有文件安全加密</p>
							<img src="../../assets/wap/images/index/characteristic_03.png">
						</li>
						<li v-show="2===mark" :key="2">
							<span>告别复杂的设计工具</span>
							<p>针对国人使用习惯悉心打是造的办公利器，职场萌新也能轻松上手</p>
							<img src="../../assets/wap/images/index/characteristic_02.png">
						</li>
					</ul>
				</div>
			</div>
		</div>
		
        <!--素材展示轮播-->
        <div class="edit_message_banner">
            <p class="message_title">100,000+精品素材库</p>
            <p class="title_tips">海量资源持续更新中，一键替换，再也不用为找素材烦恼</p>
            <img src="../../assets/wap/images/index/more_source.png">
            <div class="edit_message">
                <span class="left" :class='editAnimation ? "active" : ""' >
                    <img src="../../assets/wap/images/index/source_05.png">
                </span>
                <span class="right" :class='editAnimation ? "active" : ""' >
                    <img src="../../assets/wap/images/index/source_04.png">
                </span>
                <span class="left" :class='editAnimation ? "active" : ""' >
                    <img src="../../assets/wap/images/index/source_03.png">
                </span>
                <span class="right" :class='editAnimation ? "active" : ""' >
                    <img src="../../assets/wap/images/index/source_02.png">
                </span>
                <span class="middle" :class='editAnimation ? "active" : ""'>
                    <img src="../../assets/wap/images/index/source_01.png">
                </span>       
            </div>
        </div>

		
        <!-- 特性介绍 -->
        <div class="edit_tips_bar">
            <div class="edit_tips">
                <p>个性化演示</p>
                <span>内置多种文稿切换效果，让你的演示变得更引人注目</span>
            </div>
            <div class="edit_tips">
                <p>文件导入</p>
                <span>支持PPTX/PDF格式的本地文件导入，自动识别转换</span>
            </div>
            <div class="edit_tips">
                <p>快捷操作</p>
                <span>提供各种常用快捷键和操作功能，方便快捷</span>
            </div>
        </div>


		<div class="index_footer">
			<img src="../../assets/wap/images/index/footer.png">
            <base-logo type="text"></base-logo>
			<p>为追求极致的办公室工作者而生</p>
		</div>
		<div class="index_copyright">
			<p> <a href="https://beian.miit.gov.cn">粤ICP备18137964号</a>  &copy; 2018-2020 爆裂科技  All rights reserved</p>
		</div>
	</div>
</template>
<style lang="less" scoped>
	@import url("../../assets/wap/css/common.css");
    @background_image:url(../../assets/wap/images/index/index_sp.png) no-repeat;
	.index_contain{
		background:#3088f4;
		.index_header{
			position:relative;
			width:100%;
			background:#46564e;
			padding-top:5rem;
			padding-bottom:10.8rem;
			overflow:hidden;
			clip-path: polygon(0 0,0 95%,50% 100%,100% 95%,100% 0);
			img{
				position:relative;
				z-index:1;
				&:first-child{
					position:absolute;
					left:0.8rem;
					top:0.8rem;
					width:3.5rem;
				}
				&:nth-child(2){
					position:relative;
					display:block;
					height:1.445rem;
					width:8.425rem;
					margin:0 auto;
				}
			}
			.user_res_log{
				position:absolute;
				display:flex;
				top:0.8rem;
				right:0.47rem;
				margin:0.3rem 0.45rem;
				padding: 0.15rem;
				width:3.5rem;
				height:1.25rem;
				justify-content:center;
				align-items:center;
				border-radius:0.2rem;
				background:#0b7bf7;
				z-index:1;
			}
			a,span,p{
				position:relative;
				display:block;
				font-size:0.6rem;
				color:#ffffff;
				z-index:1;
			}
			p{
				position:relative;
				width:100%;
				text-align:center;
				font-weight:100;
				&:nth-child(4){
					margin-top:1.05rem;
					font-size:1rem;
				}
				&:nth-child(5){
					margin-top:0.525rem;
					font-size:0.6rem;
				}
			}
			&:after{
				content:'';
				position:absolute;
				top:0;
				left:0;
				right:0;
				bottom:0;
				background: rgba(1,4,21,.75);
			}
			&:before{
				content:'';
				background:url("../../assets/wap/images/index/index_banner.png") bottom no-repeat;
				background-size:contain;
				position:absolute;
				top:0;
				left:0;
				right:0;
				bottom:0;
				width:100%;
			}
		}
		.index_pic{
			position: relative;
			width:100%;
			margin-top: -2.5rem;
			img {
				display:block;
				width: 100%;
			}
			.logo_other{
				display:block;
				width:90%;
				margin:0.4rem auto 0;
			}
		}
		.index_platform{
			position:relative;
			padding-top:1rem;
			padding-bottom:1.5rem;
			text-align:center;
			background:#3088f4;
			color:#393939;
			p{
				font-size:0.9rem;
				margin:0;
			} 
			span{
				margin:0 0.21rem;
				font-size:0.6rem;
			}
			&:after{
				content:'';
				display:inline-block;
				vertical-align:middle;
				width:0;
				height:100%;
			}
		}
		.index_slideshow{
			display:inline-block;
			width:90%;
			margin-top:1.05rem;
			ul,li,img{
				margin:0;
				padding:0;
				display:block;
				width:100%;
				height:10.75rem;
				span,p{
					display:block;
					color:#fff;
					margin:0 auto;
				}
				span{
					font-size:1rem;
					margin-bottom:0.4rem;
				}
				p{
					font-size:0.4rem;
				}
			}
			img{
				width:100%;
				height:9rem;
				margin-top:0.8rem;
				animation:banner 1s linear;
			}
		}
		.edit_message_banner{
			position:relative;
			width:100%;
			padding-top:2.8825rem;
			background:#0E0F22;
			font-size:0;
			text-align:center;
			overflow:hidden;
			height:18.5rem;
			.message_title{
				font-size:1rem;
				color:#fff;
			}
			.title_tips{
				font-size:0.45rem;
				color:#fff;
				margin-bottom:1.5rem;
				margin-top:0.5rem;
			}
			img{
				width:2.825rem;
				height:1.925rem;
			}
			.edit_message{
				position:absolute;
				width:100%;
				height:45%;
				margin:1.6rem auto 0;
            	bottom:0;
				span{
					position:absolute;
					display:inline-block;
					height:100%;
					img{
						position:relative;
						width:100%;
						height:100%;
					}
					&::after{
						content:'';
						position:absolute;
						top:0;
						bottom:0;
						left: 0;
						right: 0;
						background: linear-gradient(to bottom, rgba(0,0, 0, 0) , rgba(0,0,0,.2));
					}
					&.active{
						&:hover:after{
							background:rgba(0,0,0,0);
						}
					}
					&.left{
						&:nth-child(3){
							top:18%;
							width:17%;
							left:27.5%;
							height:85%;
							transition:left 1.5s,width 1.5s,height 1.5s,top 1.5s;
							&.active {
								left:18.5%;
							}
						}
						&:nth-child(1){
							top:28%;
							left:20%;
							height:75%;
							width:14%;
							transition:left 1.5s,width 1.5s,height 1.5s,top 1.5s;
							&.active {
								left:4.5%;
							}
						}
					}
					&.right {
						&:nth-child(4){
							top:18%;
							width:17%;
							right:27.5%;
							height:85%;
							transition:right 1.5s,width 1.5s,height 1.5s,top 1.5s;
							&.active {
								right:18.5%;   
							}
						}
						&:nth-child(2){
							top:28%;
							height:75%;
							width:14%;
							right:20%;
							transition:right 1.5s,width 1.5s,height 1.5s,top 1.5s;
							&.active {
								right:4.5%;
							}
						}
						}
					&.middle {
						position:relative;
						width:30%;
						height:95%;
						bottom:-7%;
							&.active {
								transition:width 1.5s,height 1.5s,bottom 1.5s;
							}
					}
				}
			}
			@keyframes bigger {
				0%{
					width:500px;
					height:500px;
				}
				100%{
					width:600px;
					height:600px;
				}
			}
		}
		.index_footer{
			position:relative;
			height:8.35rem;
			width:100%;
			overflow:hidden;
			background:#fff;
			img,p{
				position:absolute;
			}
			img{
				&:first-child{
					bottom:0;
					width:100%;
				}
				&:nth-child(2){
					width:3.85rem;
					height:0.9rem;
					top:37%;
					left:50%;
					margin-left:-1.925rem;
					z-index:2;
				}
			}
			p{
				display:block;
				width:100%;
				top:53%;
				font-size: 0.9rem;
				color:#fff;
				text-align:center;
				z-index:2;
			}
			&:after{
				content:"";
				position:absolute;
				display:block;
				width:100%;
				height:100%;
				background:#111824;
				opacity:0.7;
			}
		}
		.index_copyright{
			font-weight:100;
			color:#a4a4a4;
			text-align:center;
			background:#fff;
			p{
				color:#a4a4a4;
				font-size:0.6rem;
				&:first-child{
					padding-top:0.6rem;
					margin-bottom:0.2rem;
				}
				&:last-child{
					margin-bottom:0.4rem;
				}
				a{
					font-weight:100;
					color:#a4a4a4;
					font-size:0.6rem;
				}
			}
			
		}
		.edit_tips_bar{
			position:relative;
			display:flex;
			justify-content:center;
			width:100%;
			height:9.2rem;
			z-index:1;
			background:#fff;
			opacity:1;
			padding:1.125rem 0 2.56rem;
			.edit_tips{
				position:relative;
				display:flex;
				justify-content:center;
				flex-direction:column;
				margin:0 10px;
				width:33%;
				cursor:default;
				user-select:none;
				text-align:center;
				&:before{
					content:"";
					position:relative;
					display:inline-block;
					margin:0 auto;
					background:@background_image;
				}
				&:nth-child(1):before{
					width:2.2rem;
					height:1.9rem;
					left:69%;
					margin-left: -43px;
					background-position: 102% 101%;
					background-size:220%;
				}
				&:nth-child(2):before{
					width:1.6rem;
					height:1.85rem;
					left:60%;
					margin-left:-25px;
					background-position: 96% -10%;
					background-size: 276%;
				}
				&:nth-child(3):before{
					width:2.2rem;
					height:1.85rem;
					left:56%;
					margin-left: -24px;
					background-position: -5% 0%;
					background-size: 216%;
				}
				p{
					display:inline-block;
					margin-bottom:5px;
					margin-top:0.5rem;
					font-size:0.5rem;
					color:#545968;
				}
				span{
					display:inline-block;
					font-size:0.35rem;
					color:#545968;
				}
			}
			&:after{
				content:'';
				position:absolute;
				top:0;
				left:0;
				right:0;
				bottom:0;
				background:url("../../assets/pc/images/index/index_banner02.png") center bottom no-repeat;
				background-size:cover;
			}
		}
	}
	@keyframes banner {
		0%{
			opacity:0;
		}
		50%{
			opacity:0.5;
		}
		100%{
			opacity:1;
		}
	}
</style>
<script>
export default {
	metaInfo () {
		return {
			title: '吾道幻灯片-专业演示文档制作工具，PPT模板，协同办公',
			meta: [
				{
					name: 'viewport',
					content: "width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0"
				},
				{
                    property: 'og:title',
                    content: '吾道幻灯片-专业演示文档制作工具，PPT模板，协同办公'
                },
                {
                    property: 'og:url',
                    content: 'https://www.woodo.cn/mobile/'
                },
			]
		}
	},
	data () {
		return {
			user: {
				login: false,
				name:'',
				photo:'',
				email:'',
			},
			nickName:'',
			timer:null,
			mark:1,
			state:0,
			imgArray: [
				0,
				1,
				2       
			],
			state: 0,
			editAnimation: false,
		}
	},
	methods: {
		// 登录
		jump:function(){
			let that=this;
			if(that.user.login==false){
				location.href = '/mobile/login/';
			}else{
				location.href = '/mobile/home/';
			}
		},
		// 轮播图
		autoPlay () {
			this.mark++;
			if (this.mark === 3) {
				this.mark = 0
			}
		},
		play () {
			this.timer = setInterval(this.autoPlay, 3000)
		},
		change (i) {
			this.mark = i
		},
		stop () {
			clearInterval(this.timer)
		},
		move () {
			this.timer = setInterval(this.autoPlay, 3000)
		},
		// 滚动条事件
		scroll_event:function(){
			let that = this,
				scroll_top = window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop, //兼容
				banner_top = document.querySelector('.edit_message_banner').offsetTop, //兼容
				footer_top = document.querySelector('.index_footer').offsetTop;
			// 展示页展开收起
			if(scroll_top >= 300 && scroll_top <= 800){
				that.editAnimation = true;
			}else{
				that.editAnimation = false;
			}
		},
	},
	created () {
		let that=this;
		that.play();
	},
	mounted () {
		let that=this;
		that.user=that.$common.get_login_state();
        window.addEventListener('scroll',that.scroll_event);
	}
}
</script>