<template>  
    <div class="toast" v-if="isShow" :class="[{deeper:had_img},type === 'wap'?'wap':'pc']">
        <img :src="img_url" v-if="had_img">
        <div class="toast-div" v-html="text"></div>  
    </div>  
</template>  
  
<script>  
export default{  
    data(){  
        return {  
            text:'内容',  
            isShow:true,  
            duration:1500,
            type:'pc',
            had_img: false,  // 是否有图片
            img_url:""       // 图片链接
        }  
    }  
}  
</script>  
  
<style lang="less" scoped>
.pc{
    &.toast{  
        position:fixed;
        left:calc(50%);
        top:40px;
        max-width:80%;
        padding:20px 37px;
        text-align:center;
        z-index:9999;
        font-size:14px;
        color:var(--stressColor);
        border-radius:8px;
        border:1px solid var(--borderColor);
        background:var(--upperColor);
        transform:translate(-50%, 0);
        animation:show-toast .5s;
    }
    .toast.deeper{
        background:rgba(0, 0, 0, 0.8);
    }
    .toast img{
        width:50%;
        height:50%;
        margin:10px auto 10px;
    }
    @keyframes show-toast {
    from {
        opacity: 0;
        transform: translate(-50%, -10px);
    }
    to {
        opacity: 1;
        transform: translate(-50%, 0);
    }
    }
}
.wap{
    &.toast{  
        position:fixed;
        bottom:100px;
        left:50%;
        top:calc(50% - 20px);
        bottom:inherit;
        max-width:80%;
        padding:10px 20px;
        text-align:center;
        z-index:9999;
        font-size:14px;
        color:#fff;
        border-radius:4px;
        background:rgba(0, 0, 0, 0.8);
        transform:translate(-50%, 0);
        animation:show-toast .5s;
    }
    .toast.deeper{
        background:rgba(0, 0, 0, 0.8);
    }
    .toast img{
        width:50%;
        height:50%;
        margin:10px auto 10px;
    }
    @keyframes show-toast {
    from {
        opacity: 0;
        margin-top: -10px;
    }
    to {
        opacity: 1;
        margin-top: 0;
    }
    }
}
</style> 