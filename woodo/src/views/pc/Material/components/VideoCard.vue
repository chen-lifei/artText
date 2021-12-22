<template>
    <div class="video-card material-card" ref="card">
        <div class="skeleton-loading" v-if="!video || !video.id"></div>
        <div class="card-wrapper" v-else @mouseenter="playPause('play')" @mouseleave="playPause('pause')">
            <!-- 封面图 -->
            <div class="cover-box" @click="preview()">
                <img v-lazy="video.image" :alt="video.name" />
                <img v-if="videoBuffer" class="loading" src="@/assets/images/loading/loading-3.gif" />
                <video class="video-preview" v-if="isPlaying" ref="videoPlay" :src="video.properties.previewContent" muted autoplay loop></video>
            </div>
            <!-- 时长 -->
            <div class="duration-box"><span v-if="video.properties.resolution && resolution(video.properties.resolution)">{{ resolution(video.properties.resolution) }} </span><span>{{ video.properties.duration }}</span></div>
            <!-- 收藏标识 -->
            <div class="favorite-box" v-tooltip="`${favoriteInfo ? '取消收藏' : '收藏'}`" :class="{favorite: favoriteInfo}">
                <base-icon class="iconshoucang" size="20"></base-icon>
            </div>
            <!-- 静音 -->
            <div class="muted-box" @click="muted()" v-tooltip.bottom="videoMuted ? `取消静音` : `静音`">
                <base-icon :class="videoMuted ? `iconguanbishengyin` : `icondakaishengyin`" size="13"></base-icon>
            </div>
            <!-- 应用 -->
            <div class="use-box" v-tooltip.bottom="`应用`" @click="use()">
                <base-icon class="iconcharu1" size="14"></base-icon>
            </div>
            <!-- 播放进度 -->
            <div class="process-box" v-if="isPlaying">
                <div class="process" :style="`width: ${currentProcess}%`"></div>
            </div>
        </div>
        <!-- <preview-modal ref="preview"></preview-modal> -->
    </div>
</template>

<script>
/**
 * 视频卡片组件
 * @prop video{Object}             视频卡片信息对象
 * @prop favorite{Boolean}         是否已收藏标识
 */
// import previewModal from '@/views/Design/components/PreviewModal.vue';
export default {
    name: "VideoCard",
    // components: { previewModal },
    props:{
        cardInfo: Object,
        favoriteId: [String, Number],
        customClick: Boolean
    },
    data(){
        return {
            video: null,
            favoriteInfo: '',
            isPlaying: false,
            currentProcess: 0,
            playTimer: '',
            videoBuffer: false,
            videoMuted: true,
        }
    },
    watch: {
        cardInfo() {
            this.video = utils.deepClone(this.cardInfo);
            if (this.video.id) {
                this.favoriteInfo = this.favoriteId;
                this.video.properties = {};
                this.video.properties.duration = utils.timeStampTransform(this.video.properties.duration);
            }
        }
    },
    created() {
        if (!this.cardInfo.id) {
            return;
        }
        this.video = utils.deepClone(this.cardInfo);
        this.favoriteInfo = this.favoriteId;
        this.video.properties = {};
        this.video.properties.duration = utils.timeStampTransform(this.video.properties.duration);
    },
    computed: {
        resolution() {
            return data => {
                switch (data) {
                    case '1080P':
                        return 'HD'
                    case '2K':
                        return '2K';
                    case '4K':
                        return '4K';
                    default:
                        return false;
                        break;
                }
            }
        }
    },
    methods:{
        // 播放暂停视频
        playPause(state) {
            if (state === `play`) {
                this.playTimer = setTimeout(() => {
                    this.isPlaying = true;
                    this.videoBuffer = true;
                    this.$nextTick(() => {
                        let $video = this.$refs.videoPlay;
                        $video.oncanplay = () => {
                            this.videoBuffer = false;
                        }
                        $video.ontimeupdate = () => {
                            this.videoBuffer = false;
                            this.currentProcess = ($video.currentTime / $video.duration) * 100;
                        }
                    })
                }, 300);
            } else {
                clearTimeout(this.playTimer);
                this.isPlaying = false;
                this.videoBuffer = false;
                this.currentProcess = 0;
                let $video = this.$refs.videoPlay;
                if ($video) {
                    $video.currentTime = 0;
                    $video.removeAttribute('autoplay');
                    let src = $video.src;
                    $video.src = ''; // 删除src中断加载   因为删除节点是不会中断加载的
                    $video.src = src;
                }
            }
        },
        // （取消）静音
        muted() {
            let $video = this.$refs.videoPlay;
            if ($video) {
                $video.muted = !this.videoMuted;
                this.videoMuted = !this.videoMuted;
            }
        },
        // 预览
        preview(id) {
            this.playPause('pause');
            if (this.customClick) {
                this.$emit('click', this.cardInfo);
            } else {
                this.$refs.preview.open('video', id || this.video.id);
            }
        },
        // （取消）收藏
        favorite() {
            let isRemove = this.favoriteInfo;
            this.designMixinFavorite('video', isRemove || this.video.id, isRemove).then(id => {
                if (isRemove) {
                    this.favoriteInfo = '';
                } else {
                    this.favoriteInfo = id;
                }
            });
        },
        // 应用
        use() {
            this.playPause('pause');
            this.designMixinUse('video', this.video.id);
        },
    }
};
</script>

<style lang="less" scoped>
.video-card {
    position: relative;
    width: 100%;
    height: 100%;
    cursor: pointer;
    .card-wrapper {
        width: 100%;
        height: 100%;
        transition: transform .3s ease;
    }
    &:hover {
        & > .card-wrapper {
            transform: scale(1.06) translateZ(0) translate3d(0,0,0);
            .cover-box {
                box-shadow: 0 5px 15px 0 rgba(201,202,203,0.50);
            }
            .menu-btn,
            .muted-box,
            .favorite-box,
            .use-box {
                opacity: 1 !important;
            }
            .duration-box{
                display: none;
            }
        }
    }
    .cover-box{
        display: flex;
        width: 100%;
        height: 100%;
        border-radius: 5px;
        background: var(--upperColor);
        overflow: hidden;
        video {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            border-radius: 5px;
        }
        .loading {
            position: absolute;
            top: calc(50% - 12px);
            left: calc(50% - 12px);
            width: 24px;
            height: 24px;
            z-index: 2;
            text-align: center;
        }
    }
    .duration-box {
        position: absolute;
        top: 10px;
        left: 10px;
        min-height: 28px;
        line-height: 28px;
        padding: 0 6px;
        border-radius: 8px;
        background-color: rgba(0, 0, 0, .3);
        span {
            font-size: 12px;
            color: #ffffff;
        }
    }
    .favorite-box {
        position: absolute;
        top: 10px;
        right: 10px;
        opacity: 0;
        width: 36px;
        height: 36px;
        line-height: 36px;
        border-radius: 8px;
        background-color: rgba(0, 0, 0, .4);
        color: #ffffff;
        text-align: center;
        transition: opacity .3s;
        &.favorite {
            opacity: 1 !important;
            color: #f7b500;
        }
    }
    .muted-box {
        position: absolute;
        left: 6px;
        bottom: 6px;
        opacity: 0;
        transition: opacity .3s;
        color: #fff;
    }
    .use-box{
        position: absolute;
        right: 10px;
        bottom: 10px;
        opacity: 0;
        width: 32px;
        height: 32px;
        line-height: 32px;
        background: var(--mainColor);
        border-radius: 8px;
        text-align: center;
        transition: opacity .3s;
        color: #fff;
    }
    .process-box {
        position: absolute;
        bottom: 0;
        left: 0;
        width: 100%;
        height: 4px;
        background: rgba(36,37,41,0.50);
        box-shadow: 0px 5px 15px 0px rgba(95,96,99,0.30);
        border-radius: 5px;
        .process {
            width: 0;
            height: 100%;
            background-color: var(--mainColor);
        }
    }
}
.skeleton-loading {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 10;
}
</style>