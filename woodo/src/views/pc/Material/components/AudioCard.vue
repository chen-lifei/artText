<template>
    <div class="audio-card material-card" :class="{'playing': isPlaying}" :style="`background-color: ${pageTheme === `newlight` ? 'rgba(255,255,255,.5)' : ''}`">
        <div class="skeleton-loading" v-if="!audio || !audio.id"></div>
        <template v-else>
            <!-- 封面图 -->
            <div class="cover-box">
                <img src="@/assets/pc/images/material/music.png" :alt="audio.name" />
                <!-- 播放按钮 -->
                <div class="operate-btn" ref="audioBtn" @click="playPause()">
                    <template v-if="audioBuffer">
                        <img class="loading" src="@/assets/common/images/loading.gif" />
                    </template>
                    <template v-else>
                        <base-icon class="play iconbofang" size="22" color="#ffffff"></base-icon>
                        <base-icon class="pause iconzanting" size="22" color="#ffffff"></base-icon>
                    </template>
                </div>
            </div>
            <!-- 波形图 -->
            <div class="wave-box">
                <!-- 波形图容器 -->
                <div class="wave-cover" ref="waveCover"></div>
                <div class="duration"><base-icon class="iconshijian" size="16"></base-icon><span>{{ audio.properties.duration }}</span></div>
                <div class="current-time" v-if="isPlaying && currentTime" :style="`left: ${waveOffset - 50}px`">{{ currentTime }}</div>
            </div>
            <!-- 分类 -->
            <div class="category-box">
                <span>{{ audio.category.fullName.indexOf(`音乐`) > -1 ? '音乐' : '音效' }}</span>
            </div>
            <!-- 收藏标识 -->
            <div class="favorite-box" v-tooltip="`${favoriteInfo ? '取消收藏' : '收藏'}`" :class="{favorite: favoriteInfo}">
                <base-icon class="iconshoucang" size="20"></base-icon>
            </div>
            <!-- 标题 -->
            <div class="info-box">
                <div class="title"><span>{{ audio.name }}</span></div>
                <div class="source" v-if="audio.properties.author || audio.properties.from"><span>来源：{{ audio.properties.author || audio.properties.from }}</span></div>
            </div>
        </template>
    </div>
</template>

<script>
/**
 * 视频卡片组件
 * @prop audio{Object}             音频卡片信息对象
 * @prop favorite{Boolean}         是否已收藏标识
 */
import WaveSurfer from 'wavesurfer.js';
export default {
    name: "AudioCard",
    props:{
        cardInfo: Object,
        favoriteId: [String, Number]
    },
    data(){
        return {
            audio: null,
            audioWave: null,
            favoriteInfo: '',
            currentTime: '',
            waveOffset: 0,
            hadPlayed: false,
            audioBuffer: false
        }
    },
    watch: {
        cardInfo() {
            if (this.audio?.id === this.cardInfo.id) return;
            this.audio = utils.deepClone(this.cardInfo);
            if (this.audio.id) {
                this.favoriteInfo = this.favoriteId;
                this.audio.properties.duration = utils.timeStampTransform(this.audio.properties.duration);
                this.$nextTick(() => { this.trackWaveform() })
            }
        }
    },
    computed: {
        isPlaying() {
            return this.audioWave?.waveSurfer.isPlaying();
        }
    },
    created() {
        if (!this.cardInfo.id) {
            return;
        }
        this.audio = utils.deepClone(this.cardInfo);
        this.favoriteInfo = this.favoriteId;
        this.audio.properties = {};
        this.audio.properties.duration = utils.timeStampTransform(this.audio.properties.duration);
        // 绘制帧图
        this.$nextTick(() => { this.trackWaveform() })
    },
    beforeDestroy() {
        this.audioWave?.waveSurfer.destroy();
        window.playingAudio = null;
    },
    methods:{
        // 生成波形图
        trackWaveform(){
            // 获取音频封面节点
            let coverElem = this.$refs.waveCover;
            let $wave = '';
            if (!coverElem) {
                return;
            }
            let options = {
                container: coverElem, // 容器
                waveColor: this.pageTheme === `newdark` ? 'rgba(201, 202, 203, 1)' : 'rgba(214, 216, 221, 1)',
                progressColor: 'rgba(14, 197, 199, 1)',
                height: 80, // 音频波形高度 默认值128
                cursorWidth: 2,
                cursorColor: 'rgba(36,37,41,1)',
                barGap: 1,
                barWidth: 2,
                barMinHeight: 5, // 音频波形最小高度
                loopSelection: false, // 关闭所选区域的循环
                hideScrollbar: true, // 隐藏X轴滚动条
                partialRender: true, // 自适应宽度
            }
            let waveItem = {
                waveSurfer: null,
                peaks: []    // 峰值数组
            }
            if (!this.audio.properties.previewContent) {
                return;
            }
            let id = utils.uuid();
            let draw = data => {
                if (!this.$refs.waveCover) {
                    return;
                }
                waveItem.waveSurfer = WaveSurfer.create(options);
                waveItem.waveSurfer.load(this.audio.properties.previewContent, data, 'auto');
                $wave = this.$refs.waveCover.firstChild.firstChild;
                $wave.style.display = `none`;
                this.audioWave = waveItem;
                waveItem.waveSurfer.on('loading', time => {
                    this.audioBuffer = true;
                });
                waveItem.waveSurfer.on('ready', time => {
                    this.audioBuffer = false;
                    window.playingAudio = this.audioWave;
                    window.playingAudio.id = id;
                });
                waveItem.waveSurfer.on('play', time => {
                    if (!this.$refs.waveCover) {
                        return;
                    }
                    if (window.playingAudio && window.playingAudio.id !== id) {
                        waveItem.waveSurfer.pause();
                        return;
                    }
                    let peaks = waveItem.waveSurfer.exportPCM(1024, 10000, true, 0);
                    waveItem.peaks = peaks;
                    $wave.style.display = `block`;
                    $wave.style.borderWidth = '2px';
                });
                waveItem.waveSurfer.on('pause', time => {
                    window.playingAudio = null;
                    $wave.style.borderWidth = 0;
                })
                waveItem.waveSurfer.on('audioprocess', time => {
                    if (window.playingAudio && window.playingAudio.id !== id) {
                        waveItem.waveSurfer.pause();
                        return;
                    }
                    this.currentTime = utils.timeStampTransform(time * 1000);
                    this.waveOffset = utils.fix($wave.style.width);
                });
                waveItem.waveSurfer.on('seek', time => {
                    this.currentTime = utils.timeStampTransform(time * 100000);
                    this.waveOffset = utils.fix($wave.style.width);
                    if (!this.isPlaying) this.playPause();
                });
            }
            if (!this.audio.properties.waveform) {
                draw([]);
            } else {
                $.get(this.audio.properties.waveform, {}, res => {
                    draw(res.data);
                });
            }
        },
        // 开始/暂停播放
        playPause() {
            // 先暂停其它正在播放的音频
            if (window.playingAudio && !this.isPlaying) {
                window.playingAudio.waveSurfer.cancelAjax();
                window.playingAudio.waveSurfer.pause();
            }
            if (this.isPlaying) {
                this.audioWave?.waveSurfer.pause();
            } else {
                this.audioWave?.waveSurfer.play();
            }
        },
        // （取消）收藏
        favorite() {
            let isRemove = this.favoriteInfo;
            this.designMixinFavorite('audio', isRemove || this.audio.id, isRemove).then(id => {
                if (isRemove) {
                    this.favoriteInfo = '';
                } else {
                    this.favoriteInfo = id;
                }
            });
        },
    }
};
</script>

<style lang="less" scoped>
.audio-card {
    position: relative;
    width: 100%;
    height: 100%;
    padding: 20px;
    background: var(--upperColor);
    border-radius: 5px;
    &.playing,
    &:hover {
        box-shadow: 0 5px 15px 0 rgba(95, 96, 99, .30);
        & > .favorite-box {
            opacity: 1 !important;
        }
        & > .category-box {
            display: none;
        }
    }
    &:hover {
        & > .cover-box {
            .operate-btn {
                border-radius: 50%;
                background-color: rgba(0,0,0,0.5);
                .play {
                    display: block;
                }
            }
        }
    }
    &.playing {
        & > .cover-box {
            img {
                transition: 0.4s;
                transform-origin: 50px 50px;
                animation: rotate 10s linear infinite;
                @keyframes rotate{
                    0%{
                        transform: rotate(0);
                    }
                    100%{
                        transform:rotate(360deg);
                    }
                }
            }
            .operate-btn {
                border-radius: 50%;
                background-color: rgba(0,0,0,0.5);
            }
            .play {
                display: none !important;
            }
            .pause {
                display: block !important;
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
    .cover-box {
        position: relative;
        display: inline-block;
        vertical-align: middle;
        img {
            width: 100px;
            height: 100px;
        }
        .operate-btn {
            position: absolute;
            top: 16px;
            left: 16px;
            width: 68px;
            height: 68px;
            line-height: 68px;
            text-align: center;
            cursor: pointer;
            .play,
            .pause {
                display: none;
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
    }
    .wave-box {
        position: relative;
        display: inline-block;
        vertical-align: middle;
        margin-left: 20px;
        width: calc(100% - 120px);
        cursor: pointer;
        .wave-cover {
            display: inline-block;
            vertical-align: middle;
        }
        .duration {
            display: inline-block;
            vertical-align: middle;
            margin-right: 20px;
            color: var(--stressColor);
            .base-icon {
                vertical-align: middle;
            }
            span {
                display: inline-block;
                vertical-align: middle;
                margin-left: 9px;
            }
        }
        .current-time {
            position: absolute;
            top: 0;
            width: 48px;
            height: 50px;
            line-height: 50px;
            z-index: 3;
            background: rgba(36,37,41,0.60);
            backdrop-filter: blur(1px);
            text-align: center;
            color: #ffffff;
            pointer-events: none;
        }
    }
    .category-box {
        position: absolute;
        bottom: 10px;
        left: 10px;
        width: 32px;
        height: 20px;
        line-height: 20px;
        border-radius: 5px;
        background-color: rgba(0, 0, 0, .4);
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
    .info-box {
        position: absolute;
        bottom: 19px;
        left: 140px;
        max-width: calc(100% - 160px);
        overflow: hidden;
        white-space: nowrap;
        & > div {
            display: inline-block;
            vertical-align: middle;
        }
        .title {
            margin-right: 10px;
            color: var(--dimColor);
        }
        .source {
            font-size: 12px;
            color: var(--dimColor);
        }
    }
}
</style>