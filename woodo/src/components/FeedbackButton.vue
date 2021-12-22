<template>
    <!-- 反馈按钮 -->
    <div class="feedback-wraper">
        <div class="feedback-button-wraper">
            <!-- 选项列表 -->
            <ul class="select-list" v-if="!currentCardKey">
                <li class="select-item" v-for="item in selectList" :key="item.cardKey" @click="select(item.cardKey)">
                    <base-icon :class="item.iconClass"></base-icon>
                    <span>{{item.title}}</span>
                </li>
            </ul>
            <!-- 反馈按钮 -->
            <button class="feedback-button" @click="colsePanel()">
                <base-icon class="iconfankuiguanbi" v-if="currentCardKey"></base-icon>
                <base-icon class="iconfankuiqipao" v-else></base-icon>
            </button>
        </div>

        <!-- 邀请好友 -->
        <div class="card-modal-invite" v-if="currentCardKey === `invite`">
            <div class="share-woodo-contain" @click.stop>
                <div class="link">
                    <p class="title">邀请好友注册拿幻币</p>
                    <p class="sub-title">分享给身边的好友成功注册可获得幻币</p>
                    <hr />
                    <p class="share-way">复制链接</p>
                    <input class="share-url" type="text" readonly="readonly" disabled="disabled" :value="locationOrigin" />
                    <button class="share-copy" v-clipboard:copy="copyText" v-clipboard:success="copySuccess" v-clipboard:error="copyError" v-bdtongji="`文档中心-首页-文件管理-右下弹窗-邀请拿幻币-复制`">复制</button>
                </div>
                <div class="explain">
                    <h5>说明：</h5>
                    <p>1、通过指定链接邀请好友注册成功+3幻币/人</p>
                    <p>2、邀请好友成功加入协作文档+2幻币/人，单个文档计数上限为5人</p>
                </div>
            </div>
        </div>

        <!-- 交流反馈 -->
        <service-panel class="card-modal-service" v-else-if="currentCardKey === `service`" @open-work-order="colsePanel()"></service-panel>

        <!-- 提示文本 -->
        <div class="tooltip" v-if="tooltipShow">
            <span>吾道还不够好，我们渴望您的反馈</span>
            <base-icon class="icona-guanbi" @click="closeTooltip()"></base-icon>
        </div>
    </div>
</template>

<script>
import servicePanel from '@/components/servicePanel.vue';
import workOrderModal from '@/components/workOrderModal/workOrderModal.js';
export default {
    props: {
        // 是否打开检测工单回复
        checkReply: {
            type: Boolean,
            default: false
        }
    },
    components: {
        servicePanel
    },
    data() {
        return {
            // 选项列表
            selectList: [
                { iconClass: 'iconyaoqinghaoyou', title: '邀请好友', cardKey: 'invite' },
                { iconClass: 'iconjiaoliufankui', title: '交流反馈', cardKey: 'service' },
            ],
            // 当前选择卡片
            currentCardKey: '',
            // 当前域名
            locationOrigin: '',
            // 提示文本 显示状态
            tooltipShow: false,
        }
    },
    mounted() {
        this.tooltipShow = !localStorage.getItem('woodo_feedback_tip_show');
        this.locationOrigin = window.location.origin;
        this.checkReply && this.checkWorkOrderReply();
    },
    computed: {
        copyText() {
            let memberInviteCode = this.$common.get_login_state().memberInviteCode;
            let query = memberInviteCode ? `/?ic=${memberInviteCode}` : ``;
            return `我正在吾道制作幻灯片，快来注册帮我赚取一波幻币：${this.locationOrigin}${query}`;
        },
    },
    methods: {
        // 选项展示卡片
        select(key) {
            this.closeTooltip();
            this.currentCardKey = key;
        },
        // 复制事件回调
        copySuccess() {
            this.$toast(`复制成功`, 2000)
        },
        copyError() {
            this.$toast(`复制失败`, 2000)
        },
        // 关闭面板
        colsePanel() {
            if (!this.currentCardKey) return;
            this.currentCardKey = '';
        },
        // 关闭提示文本
        closeTooltip() {
            this.tooltipShow = false;
            localStorage.setItem('woodo_feedback_tip_show', 'true');
        },
        // 检测是否有工单回复
        checkWorkOrderReply() {
            let checkReplyTimer = null;
            // 一分钟一次
            let rapTime = 60000;
            let checkCallback = () => {
                clearTimeout(checkReplyTimer);
                checkReplyTimer = null;
                // 检测是否登录
                if (!this.$common.get_login_state().login) {
                    checkReplyTimer = setTimeout(checkCallback, rapTime);
                }else{
                    // 获取回复信息条数
                    this.$axios({
                        url: '/api/member/work_order/count_not_read/',
                        method: 'get',
                    }).then(res => {
                        let { code, data } = res.data;
                        // _isDestroyed是组件的私有属性 用于判断组件是否销毁
                        if (code !== "2" || this._isDestroyed) return;
                        if (data > 0) {
                            workOrderModal({
                                close: () => {
                                    checkReplyTimer = setTimeout(checkCallback, rapTime);
                                }
                            });
                            this.$toast('您的工单有新回复！', 2000);
                        } else {
                            checkReplyTimer = setTimeout(checkCallback, rapTime);
                        }
                    });
                }
            }
            checkCallback();
        },
    },
}
</script>

<style lang="less" scoped>
.feedback-wraper {
    position: fixed;
    z-index: 999;
    right: 20px;
    bottom: 50px;
    width: 60px;
    height: 60px;

    .feedback-button-wraper {
        position: absolute;
        left: 0;
        top: 0;
        width: 100%;
        height: 100%;
        .feedback-button {
            width: 100%;
            height: 100%;
            border-radius: 50%;
            background-color: var(--mainColor);
            &:hover {
                background-color: var(--mainHoverColor);
                cursor: pointer;
            }

            .base-icon {
                color: #ffffff;
                font-size: 26px;
            }
            &.active .base-icon {
                color: #111111;
            }
        }
        &:hover .select-list {
            display: block;
        }
        .select-list {
            padding-bottom: 5px;
            display: none;
            position: absolute;
            right: 0;
            bottom: 100%;

            .select-item {
                margin: 10px 0;
                display: flex;
                align-items: center;
                width: 136px;
                height: 44px;
                background: #ffffff;
                border-radius: 5px;
                box-shadow: 0px 0px 20px 0px rgba(0, 0, 0, 0.05);

                &:hover {
                    background: #fafafa;
                    cursor: pointer;
                }

                .base-icon {
                    margin-left: 17px;
                    margin-right: 13px;
                    font-size: 24px;
                }

                span {
                    font-size: 12px;
                    font-weight: 400;
                    color: #111111;
                }
            }
        }
    }

    .card-modal-invite {
        position: absolute;
        right: 0;
        bottom: calc(100% + 5px);
        .share-woodo-contain {
            width: 300px;
            height: 350px;
            background-color: #ffffff;
            box-shadow: 0px 3px 10px 0px rgba(67, 67, 67, 0.15);
            border-radius: 4px;
            text-align: left;
            overflow: hidden;
            .link {
                width: 100%;
                height: 210px;
                background-image: linear-gradient(
                        -23deg,
                        #1b7cf3 32%,
                        #5fa7ff 100%
                    ),
                    linear-gradient(#0d7bf7, #0d7bf7);
                background-blend-mode: normal, normal;
                padding: 22px;
                .title {
                    margin-top: 5px;
                    font-size: 18px;
                    color: #ffffff;
                    font-weight: bold;
                    text-align: center;
                }
                .sub-title {
                    line-height: 2;
                    font-size: 14px;
                    color: #ffffff;
                    opacity: 0.8;
                    text-align: center;
                }
                hr {
                    width: 100%;
                    height: 1px;
                    margin: 22px auto 26px;
                    background-color: #4199fc;
                    transform: scaleY(0.4);
                    -webkit-transform: scaleY(0.4);
                    -moz-transform: scaleY(0.4);
                }
                .share-way {
                    margin-bottom: 4px;
                    font-size: 12px;
                    color: #ffffff;
                    opacity: 0.8;
                }
                .share-url {
                    display: inline-block;
                    vertical-align: top;
                    width: 186px;
                    height: 34px;
                    line-height: 34px;
                    padding: 8px;
                    background-color: rgba(255, 255, 255, 0.2);
                    text-align: left;
                    border-radius: 4px;
                    font-size: 12px;
                    color: rgba(255, 255, 255, 0.8);
                }
                .share-copy {
                    display: inline-block;
                    vertical-align: top;
                    width: 58px;
                    height: 34px;
                    line-height: 34px;
                    margin-left: 10px;
                    background-color: #ffffff;
                    border-radius: 4px;
                    font-size: 14px;
                    color: var(--mainColor);
                    transition: opacity 0.3s;
                    &:hover {
                        opacity: 0.85;
                    }
                }
            }
            .explain {
                width: 100%;
                height: 140px;
                padding: 22px;
                h5 {
                    margin-bottom: 10px;
                    font-size: 14px;
                    color: #4f535a;
                }
                p {
                    margin-bottom: 1em;
                    font-size: 12px;
                    color: #7b8494;
                    & + p {
                        margin-bottom: 0;
                    }
                }
            }
        }
    }

    .card-modal-service {
        position: absolute;
        right: 0;
        bottom: calc(100% + 5px);
    }

    .tooltip {
        padding-left: 24px;
        position: absolute;
        top: 50%;
        right: calc(100% + 16px);
        transform: translateY(-50%);
        display: flex;
        align-items: center;
        width: 324px;
        height: 56px;
        background: #ffffff;
        border-radius: 5px;
        box-shadow: 0px 0px 20px 0px rgba(0, 0, 0, 0.05);
        span {
            font-size: 16px;
            font-weight: 600;
            color: #111111;
        }

        .base-icon {
            margin-left: 32px;
            cursor: pointer;
        }
    }
}
</style>