<template>
    <div class="project-card design-card">
        <div class="skeleton-loading"  v-if="!project || !project.id"></div>
        <div class="card-wrapper" @mouseenter="playPause('play')" @mouseleave="playPause('pause')">
            <!-- 封面图 -->
            <div class="cover-box" @click="preview()">
                <img :src="project.image" :alt="project.name"/>
                <img v-if="videoBuffer" class="loading" src="@/assets/images/loading/loading-3.gif" />
                <video class="video-preview" v-if="isPlaying" ref="videoPlay" :src="project.playUrl" muted autoplay loop></video>
            </div>
            <!-- 应用 -->
            <div class="use-box" v-tooltip.bottom="`创建`" @click="use()">
                <base-icon class="iconbianji" size="18"></base-icon>
            </div>
            <!-- 时长 -->
            <div class="duration-box"><span>{{ project.duration }}</span></div>
            <!-- 收藏标识 -->
            <div class="favorite-box" v-tooltip="`${favoriteInfo ? '取消收藏' : '收藏'}`" :class="{favorite: favoriteInfo}">
                <base-icon class="iconshoucang" size="20"></base-icon>
            </div>
            <!-- 静音 -->
            <div class="muted-box" @click="muted()" v-tooltip.bottom="videoMuted ? `取消静音` : `静音`">
                <base-icon :class="videoMuted ? `iconguanbishengyin` : `icondakaishengyin`" size="13"></base-icon>
            </div>
            <!-- 播放进度 -->
            <div class="process-box" v-if="isPlaying">
                <div class="process" :style="`width: ${currentProcess}%`"></div>
            </div>
            <!-- 标题 -->
            <div class="info-box">
                <span class="tag new">新</span>
                <!-- <span class="tag free">免费</span> -->
                <span class="title text-ellipsis">{{ project.name }}</span>
            </div>
        </div>
        <!-- <preview-modal ref="preview"></preview-modal> -->
    </div>
</template>
<script>
/**
 * 模板卡片组件
 * @prop cardInfo{Object}          模板卡片信息对象
 * @prop favorite{Boolean}         收藏id，没有即为未收藏
 * @prop type{String}              展示形式，grid: 网格 list: 列表
 */
// import previewModal from '@/views/Design/components/PreviewModal.vue';
export default {
    name: "TemplateCard",
    // components: { previewModal },
    props: {
        cardInfo: Object,
        favoriteId: [String, Number],
        type: {
            type: String,
            default: 'grid'
        },
        customClick: Boolean
    },
    watch: {
        cardInfo() {
            this.project = utils.deepClone(this.cardInfo);
            if (this.project.id) {
                this.favoriteInfo = this.favoriteId;
                this.project.duration = utils.timeStampTransform(this.project.duration);
            }
            this.project.createDate = utils.timeStampDetail(this.project.createDate / 1000);
        }
    },
    data() {
        return {
            project: {},
            favoriteInfo: '',
            isPlaying: false,
            currentProcess: 0,
            videoBuffer: false,
            videoMuted: true
        }
    },
    mounted() {
        if (!this.cardInfo.id) {
            return;
        }
        this.project = utils.deepClone(this.cardInfo);
        this.favoriteInfo = this.favoriteId;
        this.project.duration = utils.timeStampTransform(this.project.duration);
        if(this.project.createDate) this.project.createDate = utils.timeStampDetail(this.project.createDate / 1000);
    },
    methods:{
        // 播放暂停视频
        playPause(state) {
            if (!this.project.playUrl) return;
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
                this.currentProcess = 0;
                this.videoBuffer = false;
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
                this.$refs.preview.open('project', id || this.project.id);
            }
        },
        // （取消）收藏
        favorite() {
            let isRemove = this.favoriteInfo;
            this.designMixinFavorite('project', isRemove || this.project.id, isRemove).then(id => {
                if (isRemove) {
                    this.$emit('cancel', this.project.id);
                    this.favoriteInfo = '';
                } else {
                    this.favoriteInfo = id;
                }
            });
        },
        // 应用
        use() {
            this.playPause('pause');
            this.designMixinUse('project', this.project.id);
        },
    }
};
</script>

<style lang="less" scoped>
.project-card {
    position: relative;
    width: 100%;
    height: 100%;
    cursor: pointer;
    transition: all .3s ease;
    .card-wrapper {
        width: 100%;
        height: 100%;
        transition: transform .3s ease;
    }
    &:hover {
        z-index: 100000;
        & > .card-wrapper {
            box-shadow: 0 0 15px 0 rgba(201,202,203,0.50);
            transform: scale(1.06) translateZ(0) translate3d(0,0,0);
            .cover-box {
                border-bottom-left-radius: 0;
                border-bottom-right-radius: 0;
            }
            .muted-box,
            .favorite-box,
            .use-box {
                opacity: 1 !important;
            }
            .info-box {
                height: 53px;
                line-height: 53px;
                padding: 0 20px;
                border-bottom-left-radius: 5px;
                border-bottom-right-radius: 5px;
                background: #ffffff;
                box-shadow: 0 13px 15px -4px rgba(201,202,203,0.50);
            }
            .duration-box {
                display: none;
            }
        }
    }
    .cover-box{
        display: flex;
        width: 100%;
        height: 100%;
        border-radius: 5px;
        overflow: hidden;
        background: var(--upperColor);
        img{
            transition: transform .3s;
        }
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
    .use-box,
    .favorite-box {
        position: absolute;
        top: 10px;
        opacity: 0;
        width: 36px;
        height: 36px;
        line-height: 36px;
        background-color: rgba(0, 0, 0, .4);
        border-radius: 8px;
        text-align: center;
        transition: opacity .3s;
        color: #ffffff;
    }
    .use-box {
        left: 10px;
    }
    .favorite-box {
        right: 10px;
        &.favorite {
            opacity: 1 !important;
            color: #f7b500;
        }
    }
    .duration-box {
        position: absolute;
        bottom: 10px;
        left: 10px;
        height: 28px;
        line-height: 28px;
        padding: 0 6px;
        border-radius: 8px;
        background-color: rgba(0, 0, 0, .3);
        span {
            font-size: 12px;
            color: #ffffff;
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
    .info-box {
        position: absolute;
        top: 100%;
        left: 0;
        width: 100%;
        padding-top: 7px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        font-size: 14px;
        color: var(--textColor);
        .new {
            width: 32px;
            height: 22px;
            line-height: 22px;
            margin-right: 10px;
            padding: 0 6px;
            border-radius: 5px;
            font-size: 12px;
            color: #ffffff;
            &.free {
                background: #242529;
            }
            &.new {
                background: #f7335f;
            }
        }
        .title {
            max-width: calc(100% - 120px);
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