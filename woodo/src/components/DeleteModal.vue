<template>
    <transition name="modal-fade">
        <div class="delete_masking" v-show="show_delete_modal">
            <div class="delete_modal">
                <div class="header">
                    <span class="title">{{modal_title}}</span>
                    <button class="close" v-if="!not_close" @click="cancel_click"></button>
                </div>
                <div class="body">
                    <span>{{modal_content}}</span>
                </div>
                <div class="footer">
                    <a class="sure_button" v-if="!not_sure" @click="sure_click(sure_callback)">{{modal_sure_text}}</a>
                    <a class="cancel_button" @click="cancel_click(cancel_callback)">{{modal_cancel_text}}</a>
                </div>
            </div>
        </div>
    </transition>
</template>

<script>
    export default {
        name: "DeleteModal",
        data(){
            return {
                show_delete_modal: false,
                modal_title: '移至回收站',
                modal_content: '文档移入回收站，保留30天后将自动彻底删除',
                modal_sure_text: '确定',
                modal_cancel_text: '取消',
                not_sure: false,
                not_close: false
            }
        },
        methods:{
            sure_callback:'',
            cancel_callback:'',
            show_modal:function(obj){
                let that = this,
                    user = that.$common.get_login_state(),
                    modal_title = obj && obj.title ? obj.title : '移至回收站',
                    modal_content = obj && obj.content ? obj.content : `文档移入回收站，保留${user.memberVipEffect ? 30 : 7}天后将自动彻底删除`,
                    sure_text = obj && obj.sure_text ? obj.sure_text : '确定',
                    cancel_text = obj && obj.cancel_text ? obj.cancel_text : '取消',
                    sure_fn = obj && typeof obj.sure_fn === 'function' ? obj.sure_fn : '',
                    cancel_fn = obj && typeof obj.cancel_fn === 'function' ? obj.cancel_fn : '',
                    not_sure = obj && obj.not_sure,
                    not_close = obj && obj.not_close;
                that.modal_title = modal_title;
                that.modal_content = modal_content;
                that.modal_sure_text = sure_text;
                that.modal_cancel_text = cancel_text;
                that.sure_callback = sure_fn;
                that.cancel_callback = cancel_fn;
                that.show_delete_modal = true;
                that.not_sure = not_sure;
                that.not_close = not_close;
            },
            sure_click:function(callback){
                let that = this;
                that.show_delete_modal = false;
                if(typeof callback === 'function'){callback()}
            },
            cancel_click:function(callback){
                let that = this;
                that.show_delete_modal = false;
                if(typeof callback === 'function'){callback()}
            }
        }
    }
</script>

<style lang="less" scoped>
    .delete_masking{
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
        .delete_modal{
            position:relative;
            display:inline-block;
            width:480px;
            height:240px;
            padding:40px 30px 28px;
            background:#ffffff;
            border-radius:4px;
            text-align:left;
            vertical-align:middle;
        }
        .header{
            height:26px;
            line-height:26px;
            font-size:18px;
            text-align:center;
            color:#333333;
        }
        .close{
            position:absolute;
            top:11px;
            right:12px;
            display:inline-block;
            width:26px;
            height:26px;
            background:url(../assets/pc/images/common/modal_sp.png) 8px 8px;
            transition:all .4s;
            &:hover{transform:rotate(180deg);}
        }
        .body{
            height:50px;
            line-height:50px;
            font-size:14px;
            text-align:center;
            color:#525151;
            span{
                display:inline-block;
                vertical-align:middle;
                line-height:initial;
            }
        }
        .footer{
            margin-top:50px;
            font-size:0;
            text-align:center;
            a{
                display: inline-block;
                width: 90px;
                height: 40px;
                line-height: 40px;
                margin:0 14px;
                border-radius: 4px;
                font-size: 14px;
                color: #838f9f;
                text-align: center;
                font-weight:bold;
                background-color: #e0e5ec;
                transition:background .3s;
            }
            .sure_button:hover{
                border-color:#ff5a5a;
                background:#ff5a5a;
                color:#ffffff;
            }
        }
    }
</style>