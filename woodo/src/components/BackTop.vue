<template>
    <!-- 返回顶部 -->
    <div class="to_top" @click="return_top" v-if="return_show"></div>
</template>
<script>
    export default{
        data(){
            return{
                return_show: false,
            }
		},
        methods:{
            show: function($el){
                let that = this;
                that.scroll_element = $el;
                $el.scroll(function(){
                    that.return_show = $el.scrollTop() > $el.height();
                });
            },
            return_top: function(){
                $('html,body').animate({ scrollTop: 0}, 600);
                this.scroll_element.animate({scrollTop:0}, 600);
            }
        }
    }
</script>
<style lang="less" scoped>
    .to_top{
        position:fixed;
        bottom:90px;
        right:16px;
        width:40px;
        height:40px;
        cursor:pointer;
        z-index:10;
        border-radius:4px;
        background:#dcdcdc;
        overflow:hidden;
        &::before{
            content:'';
            position:absolute;
            background:url('../assets/pc/images/common/to_top.png');
            background-size:cover;
            top:0;
            bottom:0;
            right:0;
            left:0;
            animation: top_bg .3s ease;
        }
        &:hover{
            background: #00aeff;
            overflow:hidden;
            padding: 0 4px;
            &::before{
                content:'返回顶部';
                position:relative;
                top:4px;
                font-size: 12px;
                color:#fff;
                animation: top_button .3s ease alternate;
                background:none;
            }
        }
        @keyframes top_button{
            0%{
                top:100%;
            }
            100%{
                top:4px;
            }
        }
        @keyframes top_bg{
            0%{
                top:-100%;
                bottom:100%;
            }
            100%{
                top:0;
                bottom:0;
            }
        }
    }
</style>