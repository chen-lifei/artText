<template>
    <div class="bottom_bar" ref="bar">
        <div :class="{'check':current_page === 'square'}" @click="page_change('square')">
            <img src="../assets/wap/images/common/square_checked.png" v-if="current_page === 'square'">
            <img src="../assets/wap/images/common/square.png" v-else>
            <a href="javascript:;">广场</a>
        </div>
        <div :class="{'check':current_page === 'home'}"  @click="page_change('home')">
            <img src="../assets/wap/images/common/mydoc_checked.png" v-if="current_page === 'home'">
            <img src="../assets/wap/images/common/mydoc.png" v-else>
            <a href="javascript:;">文档</a>
        </div>
    </div>
</template>
<style lang="less" scoped>
    @import url("../assets/wap/css/common.css");
    .bottom_bar{
        position:fixed;
        bottom:0;
        left:0;
        right:0;
        z-index:2;
        display:flex;
        flex-wrap:wrap;
        font-size:0;
        height:2.45rem;
        border-top: 1px solid #eff2f6;
        justify-content:space-around;
        background:#fff;
        div{
            position: relative;
            width:50%;
            padding-top: 0.4rem;
            text-align:center;
            a{  
                display: block;
                line-height: 2;
                font-size: 0.59rem;
                color: #5a6576;
            }
            img{
                display: inline-block;
                width: 0.95rem;
                height: 0.95rem;
            }
            &.check a{
                color: var(--mainColor);
            }
        }
    }
</style>
<script>
    export default {
        name: "WapBottomBar",
        data () {
            return {
                current_page: '',
            }
        },
        created() {
            let that = this,
                path = that.$route.path;
            switch (true) {
                case path.indexOf('home') >= 0:
                    that.current_page = "home";
                    break;
                case path.indexOf('square') >= 0:
                    that.current_page = "square";
                    break;
            }
        },
        mounted() {
            this.$common.resize_hidden_element('.bottom_bar');
        },
        methods: {
            page_change: function(type){
                if(type === this.current_page) return ;
                location.href=`/mobile/${type}/`;
            }
        },
    }
</script>