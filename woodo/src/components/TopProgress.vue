<template>
    <!-- 加载进度条 -->
    <div class="slides_progress" :class="{'hide': hide}" :style="{'width': `${progress}%`}"></div>
</template>

<script>
export default {
    name: 'TopProgress',
    props: ['renderdone'],
    data() {
        return {
            hide: false,
            progress: 0,
            progress_timer: null,
        }
    },
    watch: {
        renderdone(n) {
            if (n) {
                this.done();
            }
        },
    },
    beforeMount() {
        this.start_progress();
    },
    methods: {
        // 开始加载进度条
        start_progress() {
            const STOP = 95;
            const TOTAL = 100;
            let that = this;
            let i = 0;
            that.progress_timer = setInterval(() => {
                // 进度到达 STOP值 时，未渲染完成
                if (i >= STOP && !that.renderdone) {
                    return;
                }
                i += 3;
                that.progress = Math.floor(that.speed_rate(i / TOTAL) * TOTAL);
                if (that.progress >= STOP) {
                    clearInterval(that.progress_timer);
                }
            }, 80);
        },
        // 速率
        speed_rate(k) {
            return 1 - (--k * k * k * k);
        },
        // 进度完成
        done() {
            let that = this;
            clearInterval(that.progress_timer);
            that.progress = 100;
            setTimeout(() => {
                that.hide = true;
            }, 400);
        },
    },
}
</script>

<style lang="less" scoped>
.slides_progress {
    position: fixed;
    z-index: 99999;
    top: 0;
    left: 0;
    width: 0;
    height: 4px;
    border-radius: 2px;
    background-image: linear-gradient(90deg, #0d7bf7 0%, #00ffa8 100%, #80ffd4 100%, #ffffff 100%, #82edaa 100%, #04db55 100%);
    transform: translateY(0);
    transition: width 0.6s, transform 1s;
    overflow: hidden;
    &.hide {
        transform: translateY(-100%);
    }
}
</style>