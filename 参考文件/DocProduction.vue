<template>
    <div class="doc-production-contain" v-if="show">
        <div class="head">
            <base-button :class="['mine-btn', {'check': list_type === 'myDesktop'}]" width="96" height="40" @click="changeType('myDesktop')">我的作品</base-button>
            <base-button :class="['collect-btn', {'check': list_type === 'myCollect'}]" width="96" height="40" @click="changeType('myCollect')">收藏夹</base-button>
            <base-button :class="['dustbin-btn', {'check': list_type === 'dustbin'}]" width="96" height="40" @click="changeType('dustbin')">回收站</base-button>
        </div>
        <div class="body">
            <doc-list-main ref="DocListMain"></doc-list-main>
        </div>
    </div>
</template>

<script>
import DocListMain from '@/views/pc/DocCenter/DocListMain.vue';
export default {
    name: 'docProduction',
    components:{
        DocListMain
    },
    props: {
        show: {
            type: Boolean,
            default: false
        }
    },
    inject: ["center"],
    provide() {
        return {
            parent: this,
            center: this.center,
        };
    },
    watch: {
        show(v){
            if (v) {
                this.open();
            }
        },
    },
    data(){
        return{
            list_type: ''
        }
    },
    methods: {
        open() {
            this.list_type = 'myDesktop';
        },
        close() {
            this.list_type = '';
            this.show = false;
        },
        changeType(type) {
            this.list_type = type;
        }
    },

}
</script>

<style lang="less" scoped>
.doc-production-contain{
    height: 100vh;
    padding: 20px 35px;
    overflow: hidden;
    .head{
        margin-bottom: 30px;
        .base-button{
            margin-right: 10px;
            &.check{
                color: var(--mainColor);
                background: rgba(0,95,255,0.10);
            }
        }
    }
    .body{
        height: 100%;
    }
}
</style>