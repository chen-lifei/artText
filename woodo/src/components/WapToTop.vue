<template>        
    <div class="to_top" @click="to_top" v-show="show_to_top">
        <img src="../assets/wap/images/news/to_top.png">
    </div>
</template>

<style lang="less" scoped>
    @import url("../assets/wap/css/common.css");
    .to_top{
        position:fixed;
        bottom:2.75rem;
        right:0.6rem;
        width:1.3rem;
        height:1.3rem;
        img{
            display:block;
            position:relative;
            z-index:-2;
            width:100%;
            height:100%;
        }
    }
</style>

<script>
export default {
    name: 'to_top',
    data(){
        return{
            show_to_top:false,      // 是否显示返回顶部
        }
    },
    methods: {
        // 回到顶部
        to_top:function(){
            let scroll_top = window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop,
                doc = this.$route.path.indexOf('home');
            $('html,body').animate({scrollTop:0}, 900);
            if(doc >= 0){
                $('.doc_contain').animate({scrollTop:0}, 900);
            }
        },
    },
    mounted(){
        let that=this;
        window.addEventListener('scroll',function(){
            let scroll_top = window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop,
                screen_h = window.screen.height;
            if(scroll_top > screen_h - 200){
                that.show_to_top = true;
            }else{
                that.show_to_top = false;
            }
        });
    }
}
</script>
