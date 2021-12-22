<template>
    <button class="scale-effect" @mouseenter="scaleEffectIn($event)" @mouseleave="scaleEffectOut($event)">
        <span><slot></slot></span>
        <i class="effect"></i>
    </button>
</template>

<script>
    export default {
        name: 'BaseEffectButton',
        methods:{
            scaleEffectIn(e){
                let el = e.target;
                let mouse_x = e.offsetX;
                let mouse_y = e.offsetY;
                let el_i = el.querySelector('i.effect');
                $(el_i).css({
                    top: `${mouse_y}px`,
                    left: `${mouse_x}px`
                }).addClass('scale-in').removeClass('scale-out');
            },
            scaleEffectOut(e){
                let el = e.target,
                    mouse_x = e.offsetX,
                    mouse_y = e.offsetY,
                    el_i = el.querySelector('i.effect');
                $(el_i).css({
                    top: `${mouse_y}px`,
                    left: `${mouse_x}px`
                }).addClass('scale-out').removeClass('scale-in');
            }
        }
    }
</script>

<style lang="less">
button{
    cursor: pointer;
}

.scale-effect{
    position: relative;
    overflow: hidden;
    span{
        position: inherit;
        z-index: 2;
    }
    i.effect{
        position: absolute;
        width: 1px;
        height: 1px;
        z-index: 1;
        opacity: 0;
        border-radius: 50%;
        background-color: rgba(255, 255, 255, .3);
        
        &.scale-in{
            animation: enter-scale 0.3s forwards;
        }
        &.scale-out{
            animation: out-scale 0.4s forwards;
        }
    }
}

@keyframes enter-scale {
    0% { opacity: 0; transform: scale(0); }
    100% { opacity: 1; transform: scale(200); }
}
@keyframes out-scale {
    0% { opacity: 1; transform: scale(200); }
    100% { opacity: 0; transform: scale(0); }
}

</style>