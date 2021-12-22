<template>
    <div class="recruit_tips" id="recruitTip" v-if="show">
        <div class="inner">
            <div class="right_panel">
                <span @click="close">不再提示</span>
                <button class="close" @click="hide"></button>
            </div>
        </div>
        <div class="bottom">
            <a class="to_template" href="https://www.500d.me/?f=2940132" target="_blank">立即体验</a>
            <p class="desc">五百丁团队招人ing，如果您正在寻找工作岗位，<br>不妨点开看看，希望有机会一起共事！</p>
            <p class="detail">了解详情&nbsp;&nbsp;<a href="https://docs.qq.com/doc/DV0l1TFRqY3BwdE51" target="_blank">点击这里</a></p>
        </div>
    </div>
</template>

<script>
    export default {
        data() {
            return {
                show: false,
            }
        },
        mounted() {
            this.show = !localStorage.getItem("WoodoHideRecruit");
        },
        methods: {
            /**
             * 招聘相关
             */
            // 关闭
            hide() {
                if ($('.recruit_tips .inner .right_panel span').hasClass('check')) {
                    localStorage.setItem("WoodoHideRecruit", true);
                }
                this.show = false;
            },
            // 不再提示
            close() {
                $('.recruit_tips .inner .right_panel span').toggleClass('check');
            }
        }
    }
</script>

<style lang="less" scoped>
    // 招聘广告
	.recruit_tips{
		position: fixed;
		right: 20px;
		bottom: 30px;
		width: 300px;
        height: 407px;
        border: 1px solid #cccccc;
		background-color: #ffffff;
		user-select: none;
		z-index: 10;
		.inner{
			height: 300px;
			background: #ffffff url(../assets/pc/images/common/recruit_bg.png) 100%/cover no-repeat;
			.right_panel{
                position: absolute;
                top: 15px;
                right: 15px;
                line-height: 0;
                span{
                    margin-right: 10px;
                    font-size: 12px;
                    color: #ffffff;
                    transition: all .3s;
                    cursor: pointer;
                    &::before{
                        content: "";
                        display: inline-block;
                        vertical-align: middle;
                        width: 12px;
                        height: 12px;
                        margin: -3px 8px 0 0;
                        border-radius: 2px;
                        border: 1px solid #fff;
                    }
                    &:hover{
                        opacity: .7;
                    }
                    &.check{
                        &::before{
                            background: url(../assets/pc/images/edit/icons/check_white.png) no-repeat center;
                        }
                    }
                }
                .close{
                    display: inline-block;
                    vertical-align: middle;
                    width: 10px;
                    height: 10px;
                    margin-top: -4px;
                    background: url(../assets/pc/images/common/modal_sp.png) no-repeat -189px 0;
                    &:hover{
                        opacity: .7;
                    }
                }
            }
		}
		.bottom{
			height: 107px;
			text-align: center;
			.to_template{
				display: inline-block;
				width: 100px;
				height: 31px;
				line-height: 31px;
				margin-top: 4px;
				background-color: #00C091;
				font-size: 12px;
				color: #ffffff;
				border-radius: 3px;
			}
			.desc{
				margin-top: 8px;
				font-size: 12px;
				color: #111111;
			}
			.detail{
				line-height: 20px;
				margin-top: 4px;
				font-size: 12px;
				color: #111111;
				a{
					color: #00C091;
					font-weight: bold;
					border-bottom: 1px solid #00C091;
				}
			}
		}
	}
</style>