<template>
    <!-- 轮播图 -->
    <div class="topic_banner">
        <div class="banner" ref="banner">
            <div class="frame" v-show="banner_list.length < 1"></div> 
            <div class="topic_img" v-for="(item,index) in banner_list" :key="index"  @click="to_topic(item)">
                <img :src="item.image">
            </div>
        </div>
    </div>
</template>
<style lang="less" scoped>
    @import url("../../assets/wap/css/common.css");

    @loading_img:url("/public/images/common/logo-text-gray.png") center center no-repeat;
    .topic_banner{
        position:relative;
        width:100%;
        overflow: hidden;
        &::before{
            content:"";
            background: @loading_img;
            display: block;
            padding-top: 42%;
        }
        .frame{
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: @loading_img;
        }
        .banner{
            position:absolute;
            top:0;
            left: 0;
            width: 300%;
        }
        .topic_img{
            display:block;
            float: left;
            width: 33.33%;
            height: 100%;
            overflow: hidden;
            img{
                width: 100%;
                height:9rem;
            }
        }
    }
</style>
<script>
export default {
    name: "TopBanner",
    data(){
        return{
            banner_list:[],              //专题列表
        }
    },
    mounted (){
        const that = this
        that.get_banner_list();
        that.banner_touch();
    },
    methods:{
        // 获取专题列表
        get_banner_list: function (){
            let that = this;
            that.$axios.get('/api/works_share/list/')
                .then(function(data){
                    if(data.data.code === '2'){
                        that.banner_list=data.data.data.topic;
                    }else{
                        that.$toast(data.data.content,1000,'wap');
                    }
                })
        },
        // 滑动轮播图
        banner_touch:function(){
            let that = this,
                startPos = {},//开始位置
                endPos = {},//结束位置
                scrollDirection,//滚动方向
                timer,//定时器，后面控制速度会使用
                touch,//记录触碰节点
                index = 0,//记录滑动到第几张图片
                oImg = that.$refs.banner,
                ImgWidth,//图片宽度
                speed, //滑动速度
                target;//目标

            oImg.ontouchstart = function(event){
                touch = event.targetTouches[0];//取得第一个touch的坐标值
                startPos = {x:touch.pageX,y:touch.pageY}
                scrollDirection = 0;
            }
            oImg.ontouchmove = function(event){
                // 如果有多个地方滑动，我们就不发生这个事件
                if(event.targetTouches.length > 1){
                    return
                }
                touch = event.targetTouches[0];
                endPos = {x:touch.pageX,y:touch.pageY}
                // 判断出滑动方向，向右为1，向左为-1
                scrollDirection = touch.pageX-startPos.x > 0 ? 1 : -1;
            }
            oImg.ontouchend = function(){
                if(scrollDirection == 1){
                    if(index >= 1 && index<=2){
                        index--;
                        ImgWidth = parseInt(oImg.offsetWidth/3);
                        target = -ImgWidth * index;
                        timer = setInterval(function(){
                            speed = parseInt((target-oImg.offsetLeft) / 4);
                            if(speed == 0){
                                speed = 3;
                            }
                            if(target == oImg.offsetLeft){
                                clearInterval(timer);
                            }else{
                                oImg.style.left = oImg.offsetLeft + speed +'px';
                            }
                        },50);
                    }else{
                        return
                    }
                }else if(scrollDirection == -1){
                    if(index >=0 && index <=1){
                        index++;
                        ImgWidth = parseInt(oImg.offsetWidth/3);
                        target = -ImgWidth * index;
                        timer = setInterval(function(){
                            speed = parseInt((oImg.offsetLeft-target) / 4);
                            if(speed == 0){
                                speed = 3;
                            }
                            if(target == oImg.offsetLeft){
                                clearInterval(timer);
                            }else{
                                oImg.style.left = oImg.offsetLeft - speed +'px';
                            }
                        },100);
                    }else{
                        return
                    }
                }
            }
        },
        // 跳转轮播图详情页面
        to_topic:function(item){
            location.href = "/mobile/work_share/topic/?id="+item.id;
        },
    }
}
</script>