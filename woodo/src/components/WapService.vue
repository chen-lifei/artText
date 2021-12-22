<template>
    <div class="service_contain">
        <div class="service_icon" @click="toggle_service_modal">
            <img src="../assets/wap/images/common/service_menu.png" alt=""/>
        </div>
        <!-- 操作菜单 -->
        <transition name="modal-fade">
            <div class="service_modal" v-show="show_service_modal" @click="toggle_service_modal">
                <ul class="service_menu" @click.stop>
                    <li @click="toggle_service_group">加入吾道交流群</li>
                    <li @click="toggle_share_invite">邀请好友拿幻币</li>
                    <li @click="to_help">帮助中心&emsp;&emsp;&emsp;</li>
                </ul>
            </div>
        </transition>
        <!-- 分享吾道 -->
		<transition name="modal-fade">
			<div class="share_woodo_modal" v-show="show_share_woodo" @click="toggle_share_invite">
				<div class="share_woodo_contain" @click.stop>
					<div class="link">
						<p class="title">邀请好友注册拿幻币</p>
						<p class="sub_title">分享给身边的好友成功注册可获得幻币</p>
						<p class="share_way">复制链接</p>
						<input class="share_url" type="text" readonly="readonly" disabled="disabled" :value="origin" />
						<button class="share_copy" v-clipboard:copy="'我正在吾道制作幻灯片，快来注册帮我赚取一波幻币：' + origin + (user.memberInviteCode ? '/?ic=' + user.memberInviteCode : '')" v-clipboard:success="onCopy" v-clipboard:error="onError">复制</button>
					</div>
					<div class="explain">
						<h5>说明：</h5>
						<p>1、通过指定链接邀请好友注册成功+3幻币/人</p>
						<p>2、邀请好友成功加入协作文档+2幻币/人，单个文档计数上限为5人</p>
					</div>
				</div>
			</div>
		</transition>
        <!-- 交流群二维码 -->
        <transition name="modal-fade">
            <div class="service_group_modal" v-show="show_service_group" @click="toggle_service_group">
                <div class="service_group_contain" @click.stop>
                    <img src="../assets/wap/images/common/custom_service_bg.png" alt=""/>
                    <img class="qrcode" :src="service_qrcode" alt=""/>
                    <base-logo type="code"></base-logo>
                </div>
            </div>
        </transition>
    </div>
</template>

<script>
export default {
    name: 'WapService',
    data () {
        return {
            user: {},
            debounce: false,                // 事件防抖
            origin: '',                     // 分享域名
            show_service_modal: false,      // 显示菜单
            show_share_woodo: false,        // 显示分享弹窗
            show_service_group: false,      // 显示交流群二维码弹窗
            service_qrcode: '',             // 交流群二维码
        };
    },
    mounted () {
        const that = this;
        that.user = that.$common.get_login_state();
        that.origin = window.location.origin;
        that.service_qrcode = `https://file.woodo.cn/upload/foreverImage/kefu_qrcode.png?v=${new Date().getTime()}`;
    },
    methods: {
        // 复制链接成功
        onCopy () {
            this.$toast("复制成功", 2000, 'wap');
        },
        // 复制链接失败
        onError () {
            this.$toast("复制失败", 2000, 'wap');
        },
        toggle_service_modal () {
            let that = this;
            if (that.debounce) return;
            that.debounce = true;
            that.show_service_modal = !that.show_service_modal;
            setTimeout(() => {
                that.debounce = false;
            }, 400);
        },
        toggle_share_invite () {
            let that = this;
            if (that.debounce) return;
            that.debounce = true;
            that.show_share_woodo = !that.show_share_woodo;
            that.show_service_modal = false;
            setTimeout(() => {
                that.debounce = false;
            }, 400);
        },
        toggle_service_group () {
            let that = this;
            if (that.debounce) return;
            that.debounce = true;
            that.show_service_group = !that.show_service_group;
            that.show_service_modal = false;
            setTimeout(() => {
                that.debounce = false;
            }, 400);
        },
        to_help() {
            window.location.href = `/help/`;
        }
    },
}
</script>

<style lang="less" scoped>
.service_contain {
    position: fixed;
    bottom: 3.7rem;
    right: 0.87rem;
    width: 2.33rem;
	height: 2.33rem;
    z-index: 10;
}
.service_icon {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
	height: 100%;
	background-color: #ffffff;
	box-shadow: 0rem 0.15rem 0.35rem 0rem rgba(80, 85, 94, 0.08);
	border: solid 0.02rem rgba(0, 0, 0, 0.05);
    border-radius: 50%;
    text-align: center;
    user-select: none;
    img {
        position: absolute;
        top: 0;
        right: 0;
        bottom: 0;
        left: 0;
        width: 0.98rem;
        height: 0.98rem;
        margin: auto;
    }
}
// 菜单
.service_modal {
    position: fixed;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    .service_menu {
        position: absolute;
        right: 0.87rem;
        bottom: calc(4rem + 2.33rem);
        width: 6.5rem;
        height: auto;
        background-color: #ffffff;
        box-shadow: 0rem 0.15rem 0.35rem 0rem rgba(80, 85, 94, 0.08);
        border-radius: 0.17rem;
        border: solid 0.02rem rgba(0, 0, 0, 0.05);
        li {
            width: 100%;
            height: 2.4rem;
            line-height: 2.47rem;
            border-bottom: 0.02rem solid #f2f2f2;
            font-size: 0.6rem;
            color: #50555e;
            text-align: center;
            &:last-child {
                border-bottom: none;
            }
            &:active {
                background-color: #fcfcfc;
            }
        }
    }
}
// 分享弹窗
.share_woodo_modal {
    position: fixed;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    background-color: rgba(0, 0, 0, 0.6);
    .share_woodo_contain {
        position: absolute;
        top: 0;
        right: 0;
        bottom: 0;
        left: 0;
        margin: auto;
        width: 16rem;
        height: 19rem;
        background-color: #ffffff;
        box-shadow: 0rem 0.05rem 0.18rem 0rem rgba(67, 67, 67, 0.15);
        border-radius: 0.35rem;
        overflow: hidden;
        .link {
            width: 100%;
            height: 11.5rem;
            padding: 1.35rem 1.2rem 0;
            background-image: linear-gradient(-23deg, #1b7cf3 32%, #5fa7ff 100%), linear-gradient(#ffffff, #ffffff);
            background-blend-mode: normal, normal;
            font-size: 0;
            .title {
                font-size: 1.11rem;
                color: #ffffff;
                text-align: center;
            }
            .sub_title {
                margin-bottom: 1.5rem;
                line-height: 1.75rem;
                text-align: center;
                font-size: 0.62rem;
                letter-spacing: 0.13rem;
                color: #ffffff;
	            opacity: 0.8;
            }
            .share_way {
                font-size: 0.62rem;
                line-height: 1.75rem;
                color: #ffffff;
	            opacity: 0.8;
            }
            .share_url {
				display: inline-block;
				vertical-align: top;
				width: 9.5rem;
				height: 2.1rem;
				line-height: 2.1rem;
				padding: 0.5rem;
				background-color: rgba(255,255,255,0.2);
				text-align: left;
				border-radius: 0.35rem;
				font-size: 0.62rem;
				color: #ffffff;
			}
			.share_copy {
				display: inline-block;
				vertical-align: top;
				width: 3.6rem;
	            height: 2.1rem;
				line-height: 2.1rem;
				margin-left: 0.5rem;
				background-color: #ffffff;
				border-radius: 0.35rem;
				font-size: 0.83rem;
				color: var(--mainColor);
			}
        }
        .explain {
            width: 100%;
            height: 7.5rem;
            padding: 0.75rem 1.2rem 0;
            h5 {
                line-height: 1.84rem;
                font-size: 0.73rem;
                color: #4a4a52;
            }
            p {
                line-height: 1.75;
				margin-bottom: 1.5em;
				font-size: 0.62rem;
				color: #97979e;
				& + p {
					margin-bottom: 0;
				}
			}
        }
    }
}
// 交流群二维码
.service_group_modal {
    position: fixed;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    background-color: rgba(0, 0, 0, 0.6);
    .service_group_contain {
        position: absolute;
        top: 0;
        right: 0;
        bottom: 0;
        left: 0;
        margin: auto;
        width: 16rem;
        height: 22.85rem;
        img {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            &.qrcode {
                top: 10.1rem;
                left: 50%;
                margin-left: -3.3rem;
                width: 6.6rem;
                height: 6.6rem;
            }
            &.base-logo {
                top: 12.4rem;
                left: 50%;
                z-index: 1;
                margin-left: -1rem;
                width: 2rem;
                height: 2rem;
				border-radius: 0.06rem;
            }
        }
    }
}
</style>