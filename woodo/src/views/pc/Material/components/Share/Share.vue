<template>
    <base-modal class="design-share-modal" ref="share" @close="close()">
        <template #custom>
            <div class="share-wrapper">
                <!-- 分享内容主体 -->
                <div class="share-main" v-if="shareInfo">
                    <div class="share-content-back"></div>
                    <div class="share-content">
                        <img v-if="type !== 'audio'" :src="shareInfo.image" :alt="shareInfo.name" />
                        <img v-else src="@/assets/images/audio-share.png" />
                    </div>
                    <div class="share-operation" v-if="!showQrcode">
                        <h1>与您的好友分享此内容</h1>
                        <div class="share-methods">
                            <base-icon class="iconerweima" size="30" color="#242529" v-tooltip="`二维码分享`" @click="openQrcode()"></base-icon>
                            <!-- <base-icon class="iconyoujian" size="30" color="#1a7aff"></base-icon>
                            <base-icon class="iconweixin" size="30" color="#09bb07"></base-icon> -->
                        </div>
                        <div class="share-link">
                            <p>或复制链接</p>
                            <div class="link-content flex flex-between">
                                <a class="text-ellipsis" target="_blank" :href="shareLink">{{ shareLink }}</a>
                                <base-button class="copy-btn primary" :height="40" @click="copy(shareLink)"><base-icon class="icondagou" size="12" v-if="isCopying"></base-icon>{{ isCopying ? `成功复制` : `复制链接`}}</base-button>
                            </div>
                        </div>
                    </div>
                    <div class="share-qrcode" v-else>
                        <p @click="closeQrcode()"><base-icon class="iconfangxiangjiantou" size="12" rotate="90"></base-icon> 返回</p>
                        <img :src="qrcodeImage" />
                        <span>扫码分享给好友</span>
                        <base-button class="qrocde-down-btn primary" :round="true" :height="40" @click="utils.download(qrcodeImage, `${shareInfo.name}-分享二维码-迦剪`)">保存二维码至电脑</base-button>
                    </div>
                </div>
            </div>
        </template>
    </base-modal>
</template>
<script>
import QRCode from 'qrcode';
export default {
    data() {
        return {
            util,
            type: '',
            shareInfo: null,
            isCopying: false,
            showQrcode: false,
            qrcodeImage: ''
        }
    },
    computed: {
        shareLink() {
            return `${location.origin}/design/${this.type}/${this.shareInfo.id}`;
        }
    },
    mounted() {
        this.$refs.share.open();
    },
    methods: {
        open(type, info) {
            this.type = type;
            this.shareInfo = info;
            this.$refs.share.open();
        },
        close() {
            this.isCopying = false;
            setTimeout(() => {this.$emit('close')}, 300);
        },
        // 分享链接复制功能
        copy(content) {
            if (this.isCopying) return;
            utils.copy(content, () => {
                this.isCopying = true;
                // 两秒后才可继续复制
                setTimeout(()=>{
                    this.isCopying = false;
                }, 2000);
            }, () => {
                this.$toast("复制失败",800);
            });
        },
        openQrcode() {
            this.showQrcode = true;
            if (this.qrcodeImage) {
                return;
            }
            QRCode.toDataURL(this.shareLink).then(url => {
                this.qrcodeImage = url;
            })
            .catch(err => {
                console.error(err)
            });
        },
        closeQrcode() {
            this.showQrcode = false;
        }
    }
}
</script>
<style lang="less" scoped>
.design-share-modal {
    /deep/ .modal-custom-close {
        top: 0 !important;
    }
    .share-wrapper {
        position: relative;
        top: calc(50% - 280px);
        width: 480px;
        height: 560px;
        margin: auto;
        padding: 0 50px;
        background: #edeff5;
        border: 1px solid #d6d8dd;
        border-radius: 10px;
        box-shadow: 0 2px 10px 0 rgba(201,202,203,0.51);
    }
    .share-content-back {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 220px;
        background: #e3e6ec;
        border-radius: 10px;
    }
    .share-content {
        width: 100%;
        height: 250px;
        line-height: 246px;
        margin-top: -60px;
        background: rgba(237,239,245,.60);
        border: 1px solid #d6d8dd;
        border-radius: 5px;
        box-shadow: 0 10px 20px 0 rgba(201,202,203,.51);
        backdrop-filter: blur(10px);
        text-align: center;
        img {
            width: 100%;
            height: 100%;
            object-fit: contain;
        }
    }
    .share-operation {
        margin-top: 70px;
        text-align: center;
        h1 {
            margin-bottom: 20px;
            font-size: 26px;
            color: #242529;
        }
    }
    .share-methods {
        .base-icon {
            width: 68px;
            height: 68px;
            line-height: 68px;
            margin-right: 14px;
            background: #e4e8f5;
            border-radius: 50%;
            cursor: pointer;
            &:nth-child(2) {
                background-color: #dae4f6;
            }
            &:nth-child(3) {
                margin-right: 0;
                background-color: #d4ecd4;
            }
        }
    }
    .share-link {
        margin-top: 40px;
        margin-bottom: 10px;
        text-align: left;
        p {
            margin-bottom: 10px;
            font-size: 12px;
            color: #949496;
        }
        .link-content {
            width: 100%;
            height: 48px;
            line-height: 48px;
            padding: 0 4px 0 20px;
            background: #e3e6ec;
            border: 1px solid #d6d8dd;
            border-radius: 5px;
            a {
                max-width: calc(100% - 90px);
                color: #5f6063;
                cursor: pointer;
                &:hover {
                    color: rgb(120, 162, 239);
                    text-decoration: underline;
                }
            }
            .copy-btn {
                width: 88px;
                font-size: 12px;
                .base-icon {
                    width: 16px;
                    height: 16px;
                    line-height: 16px;
                    border-radius: 50%;
                    background: #ffffff;
                    color: var(--mainColor);
                    transform: translateX(-4px);
                }
            }
        }
    }
    .share-qrcode {
        margin-top: 47px;
        text-align: center;
        p {
            display: block;
            margin-left: -27px;
            font-size: 12px;
            color: #747477;
            text-align: left;
            cursor: pointer;
            i {
                color: #5f6063;
            }
            &:hover {
                color: var(--mainColor);
                i {
                    color: var(--mainColor);
                }
            }
        }
        img {
            display: block;
            width: 120px;
            height: 120px;
            margin: 38px auto 18px;
        }
        span {
            font-size: 12px;
            color: #747477;
        }
        .base-button {
            display: block;
            width: 136px;
            margin: auto;
            border-radius: 20px;
            margin-top: 30px;
            font-size: 12px;
        }

    }
}
</style>