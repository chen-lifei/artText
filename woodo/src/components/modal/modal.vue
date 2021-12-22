<template>
	<transition :name="animation">
		<div class="modal-backdrop" :style="{'z-index': zIndex}" v-if="isShow" @click="maskHandle">
			<div class="modal" :class="modalClass" @click.stop>
				<div class="modal-header">
					<span class="modal-title">{{modalTitle}}</span>
					<button class="modal-close" v-if="showClose" @click="closeHandle"></button>
				</div>
				<div class="modal-body" v-html="modalContent">
				</div>
				<div class="modal-footer">
					<button type="button" class="button button-submit" v-if="showSubmit" @click="okHandle">{{buttonSubmitTxt}}</button>
					<button type="button" class="button button-cancel" v-if="showCancel" @click="cancelHandle">{{buttonCancelTxt}}</button>
				</div>
			</div>
		</div>
	</transition>
</template>

<script>
	export default{
		name:'Modal',
		data(){
			return{
				isShow: false,
				modalClass: '',
				modalTitle: '标题',
				modalContent: '内容',
				showSubmit: true,
				buttonSubmitTxt: '确定',
				showCancel: true,
				buttonCancelTxt: '取消',
				showClose: true,
				maskCancal: false,
				submitCallback: null,
				cancelCallback: null,
				closeCallback: null,
				openCallback: null,
				zIndex: 900,
				animation:'modal-fade',
			}
		},
		methods:{
	        close: function () {
				this.isShow = false;
			},
			closeHandle: function () {
				let that = this;
				if (typeof that.closeCallback === 'function') {
					that.closeCallback(that);
				}
				that.close();
			},
	        show:function(){
				let that = this;
				that.isShow = true;
				that.$nextTick(()=>{
					if (typeof that.openCallback === 'function') {
						that.openCallback(that);
					}
				});
	        },
	        okHandle: function () {
				let that = this;
				if(!that.isShow) return;
	        	if (typeof that.submitCallback === 'function') {
					that.submitCallback(that);
				} else {
					that.close();
				}
	        },
	        cancelHandle: function () {
				let that = this;
				if(!that.isShow) return;
	        	if (typeof that.cancelCallback === 'function') {
					that.cancelCallback(that);
				}
	        	that.close();
			},
			maskHandle: function () {
				if (this.maskCancal) {
					this.cancelHandle();
				}
			},
		}
	}
</script>

<style lang="less">
// pc 内置 1.升级会员样式
.modal.upgrade-modal {
    top: 50%;
    left: 50%;
    right: auto;
    bottom: auto;
    margin: 0;
	width: 500px;
    height: auto;
    background-color: #ffffff;
    border-radius: 4px;
    transform: translate(-50%, -50%);
	.modal-header .modal-title {
		text-align: center;
		font-size: 24px;
		color: #55555f;
	}
	.modal-body {
		height: auto;
		text-align: center;
		&>p {
			margin-bottom: 25px;
			font-size: 14px;
			color: #90909d;
			&::before {
				content: "";
				display: block;
				margin: 20px auto -10px;
				width: 228px;
				height: 130px;
				background: url(~@/assets/pc/images/common/tips_bg_1.png) no-repeat center center;
			}
		}
	}
	.modal-footer {
		padding-bottom: 25px;
		text-align: center;
		.button-submit {
			padding: 13px 37px;
			background-color: var(--mainColor);
			border-radius: 4px;
		}
	}
	&.back_home {
		.modal-footer {
			overflow: hidden;
			.button-cancel {
				float: left;
				padding: 13px 37px;
				margin-left: 55px;
				border-radius: 4px;
			}
		}
	}
}
// mobile
.modal.mobile-upgrade-modal {
	.modal-header .modal-title {
		line-height: 1.6;
		text-align: center;
		font-size: 0.9rem;
		color: #313131;
	}
	.modal-body {
		text-align: center;
		&>p {
			margin-top: 1rem;
			color: #5a5a5a;
		}
	}
	.modal-footer {
		text-align: center;
		.button-submit {
			padding: 0.4rem 1rem;
			background-color: var(--mainColor);
		}
	}
}


// pc 2.幻币下载样式
.modal.hcoin-download-modal {
	width: 542px;
	height: 340px;
	border-radius: 6px;
	.modal-header .modal-title {
		text-align: center;
		font-size: 24px;
		color: #525252;
	}
	.modal-body {
		height: auto;
		padding-bottom: 70px;
		text-align: center;
		&>p {
			margin: 10px auto 30px;
			font-size: 16px;
			color: #5d5d5d;
		}
		&>span {
			display: block;
			margin-bottom: 10px;
			font-size: 14px;
			color: #939393;
			strong {
				color: #f78c0d;
				font-size: 110%;
				font-family: 'Arial';
			}
		}
		&>a {
			display: block;
			text-decoration: underline;
			font-size: 12px;
			color: var(--mainColor);
		}
	}
	.modal-footer {
		text-align: center;
		.button-submit {
			padding: 12px 35px;
			font-size: 18px;
			background-color: var(--mainColor);
			border-radius: 4px;
		}
	}
}
// mobile
.modal.mobile-hcoin-download-modal {
	.modal-header .modal-title {
		line-height: 1.6;
		text-align: center;
		font-size: 0.9rem;
		color: #313131;
	}
	.modal-body {
		text-align: center;
		&>p {
			margin: 10px auto 30px;
			font-size: 16px;
			color: #5d5d5d;
		}
		&>span {
			display: block;
			margin-bottom: 10px;
			font-size: 14px;
			color: #939393;
			strong {
				color: #f78c0d;
				font-size: 110%;
				font-family: 'Arial';
			}
		}
		&>a {
			display: block;
			margin-bottom: 1rem;
			text-decoration: underline;
			font-size: 12px;
			color: var(--mainColor);
		}
	}
	.modal-footer {
		text-align: center;
		.button-submit {
			padding: 0.4rem 1rem;
			background-color: var(--mainColor);
		}
	}
}


// 3.  绑定微信手机号弹窗
.modal.bind-modal {
	width: 500px;
	height: 340px;
	background-color: #ffffff;
	border-radius: 4px;
	.modal-header .modal-title {
		text-align: center;
		font-size: 24px;
		color: #55555f;
	}
	.modal-body {
		height: auto;
		text-align: center;
		&>p {
			margin-bottom: 25px;
			font-size: 14px;
			color: #90909d;
			&::before {
				content: "";
				display: block;
				margin: 20px auto -10px;
				width: 228px;
				height: 130px;
				background: url(~@/assets/pc/images/common/tips_bg_1.png) no-repeat center center;
			}
		}
	}
	.modal-footer {
		text-align: center;
		.button-submit {
			padding: 13px 37px;
			background-color: var(--mainColor);
			border-radius: 4px;
		}
	}
	&.back_home {
		.modal-footer {
			overflow: hidden;
			.button-cancel {
				float: left;
				padding: 13px 37px;
				margin-left: 55px;
				border-radius: 4px;
			}
		}
	}
}
// mobile
.modal.mobile-bind-modal {
	.modal-header .modal-title {
		line-height: 1.6;
		text-align: center;
		font-size: 0.9rem;
		color: #313131;
	}
	.modal-body {
		text-align: center;
		&>p {
			margin-top: 1rem;
			color: #5a5a5a;
		}
	}
	.modal-footer {
		text-align: center;
		.button-submit {
			padding: 0.4rem 1rem;
			background-color: var(--mainColor);
		}
	}
}

// pc 保存失败弹窗 & 恢复提示弹窗
.modal.save_error {
	width: 810px;
	height: 490px;
	background: url('~@/assets/pc/images/common/error_tip.png') center no-repeat;
	.modal-body {
		height: auto;
		overflow: visible;
	}
	.modal-close {
		position: fixed;
		top: 90px;
		right: 40px;
		border-radius: 50%;
		width: 25px;
		height: 25px;
		background-color: rgba(0, 0, 0, .3);
	}
	.save_error_tips {
		.error_tip_contact {
			position: absolute;
			width: 160px;
			height: 40px;
			left: 150px;
			top: 300px;
			border-radius: 6px;
			color: #ffffff;
			background-color: var(--mainColor);
		}
	}
}
.modal.wechat_service_group_modal {
	width: 810px;
	height: 490px;
	border-radius: 16px;
	.modal-body {
		height: auto;
		overflow: visible;
	}
	.modal-close {
		position: fixed;
		top: 90px;
		right: 40px;
		border-radius: 50%;
		width: 25px;
		height: 25px;
		background-color: rgba(0, 0, 0, .3);
	}
	.contact_group {
		.code {
			position: relative;
			width: 200px;
			height: 200px;
			margin: 50px auto 10px auto;
			img {
				width: 100%;
				height: 100%;
				padding: 5px;
    			border: 1px solid rgba(218, 219, 219, .4);
			}
			i {
				position: absolute;
				top: 0;
				right: 0;
				bottom: 0;
				left: 0;
				z-index: 1;
				margin: auto;
				width: 50px;
				height: 50px;
				background: url('/public/images/common/logo-code.png') no-repeat center center;
				background-size: 50px;
				border-radius: 4px;
			}
		}
		p {
			line-height: 18px;
			font-size: 14px;
			color: #aebac5;
			text-align: center;
		}
		.suggestion {
			color: #231815;
			text-align: center;
			margin-top: 80px;
			font-size: 18px;
			letter-spacing: 1px;
			i {
				color: var(--mainColor);
				padding: 0 5px;
				cursor: pointer;
			}
		}
	}
}
.modal.save_error_recovery {
	width: 400px;
	height: 250px;
	.modal-header .modal-title {
		text-align: center;
		font-size: 18px;
		color: #333;
	}
	.modal-body {
		height: 130px;
		padding: 10px 30px 10px;
		line-height: 1.6;
		text-align: center;
		input {
			display: inline-block;
			width: 120px;
			height: 34px;
			line-height: 1.4;
			padding: 4px 8px;
			margin: 0 4px;
			border: 1px solid #ccc;
			font-size: 14px;
			background-color: #fff;
			border-radius: 4px;
			box-shadow: inset 0 1px 1px rgba(0,0,0,0.075);
		}
		a {
			color: var(--mainColor);
			text-decoration: underline;
		}
	}
	.modal-footer {
		display: flex;
		justify-content: center;
		text-align: center;
		.button {
			padding: 8px 25px;
			margin: 0 10px;
			&.button-cancel {
				order: 0;
				border-color: #d7dce3;
				background-color: #d7dce3;
			}
			&.button-submit {
				order: 1;
			}
		}
	}
}
.modal.api_sign {
	width: 400px;
	height: 200px;
	.modal-header .modal-title {
		text-align: center;
		font-size: 18px;
		color: #333;
	}
	.modal-body {
		height: 80px;
		padding: 10px 30px 10px;
		line-height: 1.6;
		text-align: center;
		input {
			display: inline-block;
			width: 120px;
			height: 34px;
			line-height: 1.4;
			padding: 4px 8px;
			margin: 0 4px;
			border: 1px solid #ccc;
			font-size: 14px;
			background-color: #fff;
			border-radius: 4px;
			box-shadow: inset 0 1px 1px rgba(0,0,0,0.075);
		}
		a {
			color: var(--mainColor);
			text-decoration: underline;
		}
	}
	.modal-footer {
		display: flex;
		justify-content: center;
		text-align: center;
		.button {
			padding: 8px 25px;
			margin: 0 10px;
			&.button-cancel {
				order: 0;
				border-color: #d7dce3;
				background-color: #d7dce3;
			}
			&.button-submit {
				order: 1;
			}
		}
	}
}

// 浏览器提示样式 
@browser_sp: url('~@/assets/pc/images/common/browser_tips_sp.png') no-repeat;
.modal.browser_tips_modal {
	width: 570px;
	height: 400px;
	.modal-body {
		height: auto;
		padding: 0 45px;
	}
	.tips_content {
		padding: 5px 0 25px;
		border-bottom: 1px solid #e4e7ee;
		.title {
			position: relative;
			padding-left: 38px;
			line-height: 28px;
			margin-bottom: 30px;
			font-size: 18px;
			color: #393c44;
			.underline {
				text-decoration: underline;
				color: var(--mainColor);
			}
			.red {
				color: #ed7575;
			}
			i {
				position: absolute;
				top: 0;
				left: 0;
				width: 28px;
				height: 28px;
				background: @browser_sp -35px -35px;
			}
		}
		.recommend_browser {
			font-size: 0;
			& > li {
				display: inline-block;
				width: 25%;
				font-size: 12px;
				i {
					display: block;
					width: 32px;
					height: 32px;
					margin: auto;
				}
				p {
					line-height: 30px;
					text-align: center;
					color: #949db0;
				}
				a {
					display: block;
					width: 44px;
					height: 24px;
					line-height: 22px;
					margin: auto;
					text-align: center;
					border-radius: 4px;
					color: #8f95a1;
					border: solid 1px #bec7d6;
				}
			}
			.chrome i {
				background: @browser_sp 0 0;
			}
			._360 i {
				background: @browser_sp -66px 0;
			}
			.sougou i {
				background: @browser_sp 0 -33px;
			}
			.qq i {
				background: @browser_sp -33px 0;
			}
		}
	}
	.tips_footer {
		position: relative;
		padding-top: 22px;
		.disabled_tips {
			line-height: 1;
			margin-bottom: 15px;
			font-size: 14px;
			color: #565d64;
		}
		ul {
			width: 350px;
			padding-left: 20px;
			font-size: 0;
			list-style-type: disc;
			overflow: hidden;
			li {
				float: left;
				width: 160px;
				line-height: 28px;
				list-style-type: disc;
				font-size: 12px;
				color: #727783;
				&:empty {
					visibility: hidden;
				}
			}
		}
		.wechat_service_group {
			position: absolute;
			top: 20px;
			right: 0;
			.code {
				position: relative;
				width: 96px;
				height: 96px;
				margin: 0 auto;
				img {
					width: 100%;
					height: 100%;
				}
				i {
					position: absolute;
					top: 0;
					right: 0;
					bottom: 0;
					left: 0;
					z-index: 1;
					margin: auto;
					width: 26px;
					height: 26px;
					background: url('/public/images/common/logo-code.png') no-repeat center center;
					background-size: 26px;
					border-radius: 4px;
				}
			}
			p {
				line-height: 18px;
				font-size: 12px;
				color: #737983;
			}
		}
	}
}

// 文档中心 - 团队
.modal.team-modal{
	width:450px;
	height:260px;
	text-align:center;
	.modal-header{
		padding-top: 33px;
	}
	.modal-title{
		color:#43434c;
		font-size:18px;
		font-weight:bold;
	}
	.modal-body, .modal-footer{
		padding:0 70px 30px;
	}
	.modal-body{
		height:113px;
		color:#8c9299;
	}
	.modal-footer{
		text-align:center;
		button{
			width:110px;
			height:40px;
			color:#fff;
			font-size:14px;
			font-weight:bold;
		}
		.button-submit{
			background:#fe9e9e;
		}
		.button-cancel{
			background:#0d7bf8;
		}
	}
}
.modal.team-dismiss-modal{
	.modal-footer .button-submit{
		background:#ff0000;
	}
}
// mobile
.modal.mobile-team-modal{
	width:90%;
	height:11rem;
	text-align:center;
	.modal-header{
		padding:1.3rem 1.2rem;
	}
	.modal-title{
		color:#43434c;
		font-size:0.9rem;
		font-weight:bold;
	}
	.modal-close{
		width:0.8rem;
		height:0.8rem;
	}
	.modal-body, .modal-footer{
		padding:0 2rem 1.5rem;
	}
	.modal-body{
		height:4rem;
		color:#8c9299;
		p{
			font-size:0.7rem;
		}
	}
	.modal-footer{
		text-align:center;
		button{
			width:5.5rem;
			height:2rem;
			color:#fff;
			font-size:0.7rem;
			font-weight:bold;
		}
		.button-submit{
			background:#fe9e9e;
		}
		.button-cancel{
			background:#0d7bf8;
		}
	}
}
.modal.mobile-team-dismiss-modal{
	.modal-footer .button-submit{
		background:#ff0000;
	}
}

// 幻币余额不足提示弹框
.modal.hcoin-lack-modal{
    width: 420px;
	height: 260px;
	background-color: #ffffff;
    border-radius: 6px;
    .modal-header {
        padding: 30px 30px 28px;
    }
    .modal-title {
        text-align: center;
        font-size: 18px;
        font-weight: bold;
        color: #494d54;
    }
    .modal-body {
        height: auto;
        margin-bottom: 24px;
        text-align: center;
        font-size: 14px;
        color: #55595e;
        p:first-child{
            line-height: 22px;
            margin-bottom: 20px;
        }
        i{
            color: #f14e43;
            font-weight: bold;
        }
    }
    .modal-footer {
        text-align: center;
        button{
            height: 40px;
        }
        .button-cancel {
            background-color: var(--mainColor);
            border: 1px solid transparent;
            color: #fff;
            &:hover{
                opacity: .7;
            }
        }
        .button-submit{
            background: transparent;
            border: 1px solid var(--mainColor);
            color: var(--mainColor);
            &:hover{
                background: var(--mainColor);
                color: #fff;
            }
        }
    }
	&.mobile {
		width: 90%;
		.modal-body {
			margin-bottom: 1.1rem;
		}
	}
}
// 确认订单全屏弹窗
.modal.confirm-order-modal{
	position: relative;
	width: 100%;
    height: 100%;
	background-color: #ffffff;
	display: flex;
	justify-content: center;
    .modal-header{
		z-index: 2;
		position: fixed;
		top: 30px;
		left: 0;
		width: 100%;
		height: 28px;
		min-height: 28px;
		padding: 0;
        .modal-close{
			top: 0;
			left: 26px;
			width: 16px;
			height: 28px;
			background: #ffffff url('~@/assets/common/images/back.png') center center;
			background-size: cover;
			cursor: pointer;
			&:hover{
				transform: none;
			}
        }
    }
    .modal-body{
		position: fixed;
		top: 0;
		bottom: 0;
		width: 100%;
		min-width: 1240px;
		max-width: 1920px;
		height: auto;
		display: flex;
		justify-content: center;
		align-items: center;
		margin: 0 6%;
        .order_info{
            width: 44.8%;
			display: flex;
			flex-direction: column;
			p{
				height: 31px;
				line-height: 31px;
				font-size: 24px;
				font-weight: bold;
				color: #333333;
				margin-bottom: 25px;
			}
			.order_cover{
				width: 100%;
				height: 489px;
				display: flex;
				justify-content: center;
				align-items: center;
				background-color: #f1f3f7;
				img{
                max-width: calc(100%);
                max-height: calc(100%);
            }
			}
        }
        .order_hcoin{
			width: 650px;
			height: 545px;
			margin-left: 116px;
			padding-top: 56px;
			display: flex;
			flex-direction: column;
			p{
				height: 31px;
				line-height: 31px;
				font-size: 24px;
				color: #333333;
			}
			.line{
				height: 1px;
				width: 100%;
				background-color: #dddddd;
				margin: 20px 0 100px;
			}
            .price{
                font-size: 18px;
				color: #666666;
				margin-bottom: 37px;
				i{
					font-size: 72px;
					color: #0b7bf7;
				}	
			}
			.info{
				display: flex;
				padding-top: 75px;
				span{
					display: inline-block;
					width: 230px;
					text-align: center;
					color: #999999;
					font-size: 14px;
				}
				.balance{
					margin-right: 84px;
					i{
						color: #ff7272;
					}
				}
			}
        }
    }
    .modal-footer{
		position: fixed;
		top: 0;
		bottom: 0;
		width: 100%;
		min-width: 1240px;
		max-width: 1920px;
		height: auto;
		display: flex;
		align-items: center;
		margin: 0 6%;
		padding-top: 205px;
        button{
            width: 230px;
			height: 60px;
			border-radius: 10px;
			color: #ffffff;
			border: solid 1px #0b7bf7;
			font-size: 16px;
			margin-bottom: 10px;
			transition: all 0.3s;
		}
		.button-submit{
			margin-left: calc(100% - 44.8% + 56px);
			background: #ffffff;
            color: #0b7bf7;
			&:hover{
				color: #ffffff;
				background-color:  #0b7bf7;
			}
        }
        .button-cancel{
            position: relative;
			margin-left: 77px;
			background-color: #0b7bf7;
			color: #ffffff;
			&::before{
				content: '超划算';
				display: inline-block;
				position: absolute;
				top: -15px;
				right: -28px;
				width: 76px;
				height: 28px;
				line-height: 28px;
				z-index: 2;
				background-color: #ff7272;
				border-top-left-radius: 14px;
				border-bottom-right-radius: 14px;
				color: #ffffff;
				text-align: center;
			}
			&:hover{
				opacity: 0.7;
			}
        }
    }
}
@media screen and (max-width: 1920px) {
	.modal-backdrop .confirm-order-modal{
		.modal-body{
			margin: 0 4%;
			#order_hcoin{
				margin-left: 80px;
			}
		}
		.modal-footer{
			margin: 0 4%;
			.button-submit{
				margin-left: calc((100% - 650px - 80px) / 2 + 22.4% + 80px);
			}
		}
	}
}

/* 支付弹窗 - 以组件形式引入 */
.modal.payment-modal {
    width: 500px;
	height: 290px;
	background-color: #ffffff;
    border-radius: 4px;
    .modal-body {
        height: auto;
        padding: 0 80px;
        margin-bottom: 60px;
    }
    .modal-footer {
        text-align: center;
        .button-submit {
            padding: 10px 32px;
            background-color: var(--mainColor);
        }
    }
    .payment-title {
        margin-bottom: 45px;
        text-align: center;
        font-size: 24px;
        color: #55555f;
    }
    .payment-tips {
        text-align: center;
        font-size: 14px;
        color: #90909d;
        a {
            color: var(--mainColor);
        }
    }
}

// 下载素材提示弹框
.modal.upgrade_tip {
	width: 420px;
	height: 225px;
	user-select: none;
	.modal-header{
		.modal-title{
			color: #161718;
			font-size: 18px;
			font-weight: 600;
			text-align: left;
		}
		.modal-close{
			top: 5px;
			right: 5px;
		}
	}
	.modal-body{
		padding-top: 10px;
		font-size: 15px;
		color: #000;
	}
	.modal-footer{
		text-align: center;
		.button{
			width: 96px;
			line-height: 40px;
			padding: 0;
			margin: 0 13px;
			border: none;
			&.button-cancel{
				background: #f6f6f6;
				color: #7d7d7d;
			}
		}
	}
}

// 购买幻币支付提示弹框
.modal.hcoin-confirm-modal{
	width: 540px;
	height: 280px;
	border-radius: 10px;
	.modal-header{
		.modal-title{
			display: none;
		}
	}
	.modal-body{
		p{
			text-align: center;
			color: #333333;
			font-size: 24px;
			margin-top: 38px;
		}
	}
	.modal-footer{
		display: flex;
		justify-content: center;
		margin-top: 34px;
		.button{
			font-size: 16px;
			width: 180px;
			height: 60px;
			border-radius: 10px;
			border: solid 1px #999999;
		}
		.button-submit{
			margin-right: 40px;
		}
		.button-cancel{
			&:hover{
				background-color: #0b7bf7;
				color: #ffffff;
			}
		}
	}
}

// 导出进度弹框
.modal.export-progress{
    .modal-title {
        text-align: center;
    }
    .modal-body {
        p {
            color: #303030;
            font-size: 14px;
            text-align: center;
        }
    }
    .progress_bar {
        width: 100%;
        background-color: #eaeaea;
        overflow: hidden;
        .progress {
            height: 100%;
            background-image: linear-gradient(90deg, rgb(0,99,250) 0%, rgb(0,238,185) 100%);
            transition: all 0.2s;
        }
    }
    .modal-footer {
        text-align: center;
        .button {
            margin: 0;
        }
    }
    &.template{
        width: 540px;
        height: 250px;
        .modal-title{
            font-size: 30px;
            color: #303030;
        }
        .progress_bar {
            height: 10px;
            margin: 20px auto 16px;
            border-radius: 5px;
        }
        .modal-body{
            margin-bottom: 10px;
        }
        .modal-footer{
            button{
                width: 98px;
                height: 40px;
                color: #303030;
                background: #e5e5e5;
            }
        }
    }
    &.mobile-document{
        .modal-body {
            padding-bottom: 2rem;
            p {
                font-size: 0.5rem;
            }
            .progress_bar {
                height: 0.75rem;
                margin: 1rem auto;
                border-radius: 0.75rem;
            }
        }
    }
}
// 模板专享会员弹框
.modal.template-vip-modal{
    width: 420px;
	height: 200px;
	background-color: #ffffff;
    border-radius: 6px;
    .modal-header {
        padding: 30px 30px 28px;
    }
    .modal-title {
        text-align: center;
        font-size: 18px;
        font-weight: bold;
        color: #494d54;
    }
    .modal-body {
    	min-height:2rem;
        height: auto;
        text-align: center;
        font-size: 14px;
        color: #55595e;
        p:first-child{
            line-height: 22px;
            margin-bottom: 20px;
        }
        i{
            color: #f14e43;
            font-weight: bold;
        }
    }
    .modal-footer {
        text-align: center;
        button{
            height: 40px;
        }
        .button-cancel {
            background-color: var(--mainColor);
            border: 1px solid transparent;
            color: #fff;
            &:hover{
                opacity: .7;
            }
        }
        .button-submit{
            background: transparent;
            border: 1px solid var(--mainColor);
            color: var(--mainColor);
            &:hover{
                background: var(--mainColor);
                color: #fff;
            }
        }
    }
	&.mobile {
		width: 90%;
	}
}
</style>