<template>
    <transition name="modal-fade">
        <div class="tips_masking" v-show="show"  @click="close">
            <div class="tips_modal" @click.stop>
                <div class="header">
                    <span class="title">{{title}}</span>
                    <button class="close" @click="close"></button>
                </div>
                <div class="body" v-html="content"></div>
                <div class="footer">
                    <a class="cancel" @click="close">{{cancel_text}}</a>
                </div>
            </div>
        </div>
    </transition>
</template>

<script>
    export default {
        name: "TipsModal",
        data() {
            return {
                show: false,
                title: '删除文档',
                content: '<span>该模板不支持删除，联系管理员进行操作</span>',
                cancel_text: '知道了'
            }
        },
        methods: {
            show_modal:function(obj){
                let that = this,
                    title = obj && obj.title ? obj.title : '删除文档',
                    content = obj && obj.content ? obj.content : '<span>该模板不支持删除，联系管理员进行操作</span>',
                    cancel_text = obj && obj.cancel_text ? obj.cancel_text : '知道了';
                that.title = title;
                that.content = content;
                that.cancel_text = cancel_text;
                that.show = true;
            },
            close:function(){
                let that = this;
                that.show_delete_modal = false;
            }
        },
        mounted() {
            this.show_modal()
        }
    }
</script>

<style lang="less" scoped>
    .tips_masking{
        position: fixed;
        top: 0;
        left: 0;
        z-index:999;
        width: 100%;
        height: 100%;
        background-color: rgba(0, 0, 0, 0.502);
        font-size: 0;
        color: #666666;
        text-align: center;
        &:after{
            content: "";
            display: inline-block;
            width: 0;
            height: 100%;
            vertical-align: middle;
        }
        .tips_modal{
            position:relative;
            display:inline-block;
            width:480px;
            height:240px;
            padding:48px 0 34px;
            background:#ffffff;
            border-radius:4px;
            text-align:center;
            vertical-align:middle;
        }
        .header{
            height:36px;
            line-height:36px;
            font-size:18px;
            color:#333333;
        }
        .close{
            position:absolute;
            top:0;
            right:0;
            display:inline-block;
            width:26px;
            height:26px;
            background:url(../assets/pc/images/common/modal_sp.png) no-repeat 8px 8px;
            transition:all .4s;
            &:hover{
                transform:rotate(90deg);
            }
        }
        .body{
            height:82px;
            padding-top:6px;
            font-size:14px;
            font-weight:100;
            color:#525151;
        }
        .footer{
            height:40px;
            font-size:0;
            a{
                display:inline-block;
                width:90px;
                height:40px;
                line-height:40px;
                border-radius:4px;
                background:#0d7bf8;
                font-size:14px;
                color:#ffffff;
            }
        }
    }
</style>