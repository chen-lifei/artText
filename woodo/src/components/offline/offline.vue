<template>
    <div :class="['offline-tips', state]">
        <i class="offline-animation"></i>
        <p class="offline-text" v-text="second"></p>
    </div>
</template>

<style lang="less" scoped>
@keyframes rotate{
    from { transform: rotate(0); }
    to { transform: rotate(360deg); }
}
@keyframes fadein{
    from { opacity: 0; }
    to { opacity: 1; }
}
@keyframes fadeout{
    from { opacity: 1; }
    to { opacity: 0; }
}
.offline-tips{
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    z-index: 99999;
    height: 40px;
    line-height: 36px;
    text-align: center;
    font-size: 14px;
    color: #505050;
    opacity: 1;
    background-color: #fff295;
    box-shadow: 0px 5px 5px 0px rgba(0, 0, 0, 0.15);
    transition: all 0.3s;
    animation: fadein 0.2s ease;
    &.hidden {
        display: none !important;
        animation: fadeout 0.2s ease;
    }
    &.success {
        background-color: rgb(111,214,77);
        .offline-animation {
            display: none;
        }
        .offline-text{
            color: #fff;
        }
    }
    &.error {
        background-color: rgb(255,117,115);
        .offline-animation {
            display: none;
        }
        .offline-text{
            color: #fff;
        }
    }
    .offline-animation{
        display: inline-block;
        vertical-align: middle;
        width: 20px;
        height: 20px;
        margin-right: 15px;
        border: 3px solid #e9b253;
        border-right-color: transparent;
        border-radius: 50%;
        animation: rotate 1s ease infinite;
    }
    .offline-text{
        display: inline-block;
        vertical-align: middle;
    }
}
</style>

<script>
export default {
    data(){
        return {
            online: true,
            state: 'hidden',                        // 可能的值  hidden  success  error   connection
            second: '失去网络连接，1秒后重新连接...', // 网络状态提示语
            timeout: null,                          // 全局延时定时器
            reline_interval: null,                  // 重连定时器
            reline_time: 5,                         // 重连倒计时初始时间
        }
    },
    watch: {
        online: function(n, o){
            let that = this;
            if(!utils.deviceENV().mobile){
                if (n) {
                    that.state = 'success';
                    that.second = '重新连接成功。';
                    clearTimeout(that.timeout);
                    clearInterval(that.reline_interval);
                    that.timeout = setTimeout(()=>{
                        that.state = 'hidden';
                        window.location.reload();
                    }, 1000);
                } else {
                    that.state = 'error';
                    that.second = '失去网络连接。';
                    clearTimeout(that.timeout);
                    that.timeout = setTimeout(()=>{
                        that.state = 'connection';
                        that.reline();
                    }, 1000);
                }
            }
        }
    },
    methods: {
        // 重连
        reline(){
            let that = this;
            let timer = that.reline_time;
            that.second = '失去网络连接，' + timer + '秒后重新连接...';
            that.reline_interval = setInterval(()=>{
                that.state = 'connection';
                timer--;
                that.second = '失去网络连接，' + timer + '秒后重新连接...';
                if (timer === 0) {
                    if (!that.online) {
                        that.state = 'error';
                        that.second = '重新连接失败。';
                    }
                }
                if (timer < 0) {
                    clearInterval(that.reline_interval);
                    that.reline_timer();
                }
            }, 1000);
        },
        reline_timer(){
            let that = this;
            that.reline_time += 5;
            that.reline();
        },
    },

    mounted(){
        let that = this;
        window.onoffline = e => {
            that.online = typeof navigator.onLine === 'undefined' ? false : navigator.onLine;
        }
        window.ononline = e => {
            that.online = typeof navigator.onLine === 'undefined' ? true : navigator.onLine;
        }
    },
}
</script>
