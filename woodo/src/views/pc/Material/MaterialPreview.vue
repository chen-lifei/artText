<template>
    <div class="design-preview-view" :showClose="false">
        <!-- 面包屑 -->
        <div class="bread-bar" v-if="previewInfo">
            <router-link tag="span" to="/design">素材库</router-link>
            <base-icon class="iconfangxiangjiantou" size="12"></base-icon>
            <router-link tag="span" :to="`/design/${previewType}`">{{ previewInfo.context }}</router-link>
            <base-icon class="iconfangxiangjiantou" size="12"></base-icon>
            {{ previewInfo.name }}
        </div>
        <div class="preview-wrapper">
            <!-- 预览内容主体 -->
            <div class="preview-main">
                <template v-if="!previewInfo">
                    <div class="head-bar flex flex-between"></div>
                    <div class="play-box"></div>
                </template>
                <template v-else>
                    <!-- 头部 -->
                    <div class="head-bar flex flex-between">
                        <div class="left">
                            <!-- 来源信息 -->
                            <div class="source-item">
                                <a :href="commonMixinGetChannelInfo(previewInfo).link" :target="commonMixinGetChannelInfo(previewInfo).link === 'javascript:;' ? '' : '_blank'">
                                    <img class="Soft-UI" :src="commonMixinGetChannelInfo(previewInfo).head" />
                                </a>
                                <div>
                                    <p>{{ previewInfo.context }}来源：</p>
                                    <span>{{ commonMixinGetChannelInfo(previewInfo).author }}</span>
                                </div>
                            </div>
                        </div>
                        <div class="right">
                            <!-- 下载 -->
                            <base-button class="download-btn UI-active-primary" v-if="previewType !== 'template'" :height="48" @click="download()"><base-icon class="icondownload" size="16"></base-icon>下载</base-button>
                            <!-- 应用 -->
                            <base-button class="use-btn primary" :height="48" @click="use()">应用该{{ previewInfo.context }}</base-button>
                        </div>
                    </div>
                    <!-- 内容模块 -->
                    <div class="play-box" :class="previewType">
                        <!-- <p>{{ previewType === 'template' ? previewInfo.name : previewInfo.resolution }}</p> -->
                        <media-player v-if="previewType === 'video' || previewType === 'template'" :player-info="previewInfo"></media-player>
                        <audio-card v-else-if="previewType === 'audio'" :card-info="previewInfo"></audio-card>
                        <img v-else :src="previewInfo.previewContent || previewInfo.cover" :alt="previewInfo.name" />
                    </div>
                    <!-- 操作模块 -->
                    <div class="operate-box">
                        <base-button class="share-btn flat UI-active-primary" @click="share()"><base-icon class="iconshare"></base-icon>分享</base-button>
                        <base-button v-if="!previewInfo.favoriteId" class="collect-btn flat UI-active-primary" @click="favorite()"><base-icon class="iconshoucang"></base-icon>收藏到空间</base-button>
                        <base-button v-else class="collect-btn flat UI-active-primary" @click="favorite()"><base-icon class="iconshoucangtianchong"></base-icon>取消收藏</base-button>
                    </div>
                    <div class="info-box" v-if="previewType !== 'audio'">
                        <p v-if="previewType !== 'vectors'">
                            <template v-if="previewType === `video` || previewType === `template`">
                                <span>{{ previewInfo.context }}时长：</span>
                                <span>{{ utils.timeStampTransform(previewInfo.duration) }}</span>
                            </template>
                            <template v-else>
                                <span>{{ previewInfo.context }}分辨率：</span>
                                <span>{{ previewInfo.width }}*{{ previewInfo.height }}</span>
                            </template>
                        </p>
                        <p>
                            <span>使用次数：</span>
                            <span>{{ previewInfo.useNum || 0 }}</span>
                        </p>
                        <p v-if="previewType !== 'template'">
                            <span>文件大小：</span>
                            <span>{{ utils.bytesFormat(previewInfo.size, 'KB') }}</span>
                        </p>
                    </div>
                </template>
            </div>
            <!-- 相似推荐 -->
            <div class="recommend-main">
                <h2>相似推荐</h2>
                <router-link class="more" :to="`/design/${previewType}`"><span>查看全部</span></router-link>
                <design-list v-if="previewInfo" customClick s :design-type="previewType" :category="previewInfo.category.code" @click="changePreview"></design-list>
            </div>
        </div>
    </div>
</template>
<script>
import designList from '@/views/Design/components/DesignList.vue';
export default {
    components: { designList },
    data() {
        return {
            util,
            previewId: '',
            previewType: '',
            previewInfo: null,
        }
    },
    created() {
        let {id, type} = this.$route.params;
        this.previewId = id;
        this.previewType= type;
        if (type === 'audio') {
            this.$options.components.audioCard = () => import('@/views/Design/components/AudioCard.vue');
        } else if (type === 'template' || type === 'video') {
            this.$options.components.mediaPlayer = () => import('@/components/MediaPlayer.vue');
        }
        if (this.previewType === 'template') {
            this.getTemplateDetail();
        } else {
            this.getMaterialDetail();
        }
    },
    methods: {
        // 获取模板详情
        getTemplateDetail() {
            this.designMixinGetDetail(this.previewType, this.previewId).then(info => {
                this.previewInfo = info;
                document.title = `${info.name}-工程模板-免版权素材库-迦剪`;
            });
        },
        // 获取素材详情
        getMaterialDetail() {
            this.designMixinGetDetail(this.previewType, this.previewId).then(info => {
                this.previewInfo = info;
                document.title = `${info.name}-${this.commonMixinGetDesignSign(this.previewType).name}-免版权素材库-迦剪`;
            });
        },
        // 预览
        changePreview(data) {
            this.previewInfo = null;
            this.previewId = data.id;
            if (this.previewType === 'template') {
                this.getTemplateDetail();
            } else {
                this.getMaterialDetail();
            }
            document.querySelector('main').scrollTop = 0;
        },
        // （取消）收藏
        favorite() {
            let favoriteId = this.previewInfo.favoriteId;
            this.designMixinFavorite(this.previewType, favoriteId || this.previewId, favoriteId).then(id => {
                if (favoriteId) {
                    this.previewInfo.favoriteId = '';
                } else {
                    this.previewInfo.favoriteId = id;
                }
            });
        },
        // 分享
        share() {
            this.designMixinShare(this.previewType, this.previewInfo);
        },
        // 下载
        download() {
            this.designMixinDownload(this.previewType, this.previewInfo);
        },
        // 应用
        use() {
            this.designMixinUse(this.previewType, this.previewId);
        },
    }
}
</script>
<style lang="less" scoped>
.design-preview-view {
    padding: 4px 60px;
    .bread-bar {
        margin-bottom: 48px;
        font-size: 20px;
        color: var(--stressColor);
        font-weight: 600;
        span {
            color: var(--dimColor);
            cursor: pointer;
            &:hover {
                color: var(--mainColor);
            }
        }
        .base-icon {
            margin: 0 10px;
            transform: rotate(-90deg) scale(0.9) translateX(2px);
            color: var(--dimColor);
        }
    }
    .preview-wrapper {
        max-width: 1550px;
        padding: 0 100px;
        margin: 0 auto;
    }
    .head-bar {
        width: 100%;
        height: 48px;
        & > div {
            width: 50%;
        }
        .right {
            text-align: right;
        }
        .download-btn {
            width: 100px;
            margin-right: 10px;
            border-radius: 10px;
            .base-icon {
                margin-right: 5px;
                transform: translateY(2px);
            }
        }
        .use-btn {
            padding: 0 50px;
            border-radius: 10px;
        }
        .source-item {
            img {
                width: 52px;
                height: 52px;
                border-radius: 50%;
            }
            & > div {
                display: inline-block;
                vertical-align: middle;
                margin-left: 20px;
                p {
                    margin-bottom: 5px;
                    color: var(--dimColor);
                    font-size: 12px;
                }
                span {
                    font-size: 18px;
                    color: var(--stressColor);
                }
            }
        }
    }
    .play-box {
        position: relative;
        display: flex;
        align-items: center;
        justify-content: center;
        width: 100%;
        height: 759px;
        margin-top: 26px;
        background: rgba(255,255,255,0.80);
        backdrop-filter: blur(8px);
        text-align: center;
        &::before {
            content: "";
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            pointer-events: none;
            background: transparent url("~@/assets/images/watermark.png") repeat;
        }
        img {
            display: inline-block;
            vertical-align: middle;
            width: 100%;
            max-height: 100%;
            object-fit: contain;
        }
        &.audio {
            height: 220px;
            background: transparent;
            backdrop-filter: blur(0);
            text-align: left;
        }
        .audio-card {
            padding: 40px 60px;
            /deep/ .wave-box {
                margin-left: 80px;
                width: calc(100% - 180px);
            }
            /deep/ .info-box {
                bottom: 23px;
                left: 240px;
            }
            /deep/ .category-box {
                bottom: 20px;
                left: 20px;
            }
        }
    }
    .operate-box {
        margin: 40px 0 22px;
        text-align: center;
        .base-button {
            height: 40px;
            padding: 0 20px;
            border: 1px solid #d4d4d5;
            border-radius: 21px;
            font-size: 12px;
        }
        .base-icon {
            margin-right: 8px;
            transform: translateY(1px);
        }
        .share-btn {
            margin-right: 17px;
        }
    }
    .info-box {
        text-align: center;
        p {
            display: inline;
            vertical-align: middle;
            margin-right: 20px;
            span:first-child {
                font-size: 12px;
                color: var(--dimColor);
            }
        }
    }
    .recommend-main {
        margin-top: 40px;
        h2 {
            display: inline-block;
            margin-bottom: 20px;
            font-size: 20px;
            color: var(--stressColor);
            font-weight: 600;
        }
        .more {
            float: right;
            font-size: 12px;
            transform: translateY(10px);
            color: var(--textColor);
            cursor: pointer;
            &:hover {
                color: var(--mainColor);
            }
        }
    }
}
</style>