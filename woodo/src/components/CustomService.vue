<template>
    <div class="custom_service">
        <span class="service_icon" @click="toggle_service_code"></span>
        <transition name="modal-fade">
            <div class="service_contain"
                 v-if="show_service_code"
                 @click.stop="toggle_service_code"
            >
                <div class="service_panel">
                    <img class="service_qrcode" :src="service_qrcode" alt=""/>
                    <base-logo type="code" width="36" height="36"></base-logo>
                </div>
            </div>
        </transition>
    </div>
</template>

<script>
    export default {
        name: "CustomService",
        data(){
            return {
                show_service_code: false,
                service_qrcode: '',
            }
        },
        mounted () {
			this.service_qrcode = `https://file.woodo.cn/upload/foreverImage/kefu_qrcode.png?v=${new Date().getTime()}`;
        },
        methods:{
            toggle_service_code: function(){
                let that = this;
                that.show_service_code = !that.show_service_code;
                if(that.show_service_code){
                    $('body').css('overflow','hidden');
                    $('.wbd_doc_view').css('overflow','hidden');
                }else{
                    $('body').css('overflow','');
                    $('.wbd_doc_view').css('overflow','');
                }
            }
        },
    }
</script>

<style lang="less" scoped>
    .custom_service{
        position:fixed;
        bottom:80px;
        right:32px;
        z-index:9;
        width:40px;
        height:40px;
        overflow:hidden;
        &:hover{
            .service_icon{
                background:url(../assets/pc/images/common/service_icon_color.png) center no-repeat;
            }
        }
        .service_icon{
            display: block;
            position:absolute;
            bottom:0;
            right:0;
            width:40px;
            height:40px;
            cursor:pointer;
            border-radius:40px;
            background:url(../assets/pc/images/common/service_icon.png) center no-repeat;
        }
        .service_contain{
            position:fixed;
            top:0;
            left:0;
            width:100%;
            height:100%;
            line-height:100%;
            background:rgba(0, 0, 0, 0.55);
            text-align:center;
            .service_panel {
                position: absolute;
                top: 0;
                right: 0;
                bottom: 0;
                left: 0;
                margin: auto;
                width: 320px;
                height: 457px;
                box-shadow: 0px 3px 10px 0px rgba(67, 67, 67, 0.15);
                background: url('../assets/pc/images/common/custom_service_bg.png') no-repeat center center;
                img:not(.base-logo) {
                    position: absolute;
                    top: 200px;
                    left: 85px;
                    width: 150px;
                    height: 150px;
                    padding: 8px;
                    background-color: #ffffff;
                    border-radius: 4px;
                }
                .base-logo {
                    position: absolute;
                    top: 257px;
                    left: 142px;
                    z-index: 1;
                }
            }
        }
    }
</style>