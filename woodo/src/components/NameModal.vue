<template>
    <div>
        <transition name="modal-fade">
            <div class="name_masking" v-show="show_modal">
                <div class="name_modal">
                    <div class="header">
                        <span class="title">{{modal_title}}</span>
                        <button class="close" @click="close"></button>
                    </div>
                    <div class="body">
                        <span class="name" v-show="is_team_doc">名称</span>
                        <input type="text" v-model="modal_content" maxlength="20">                    
                    </div>
                    <div class="save_location" v-show="is_team_doc">
                        <span>位置</span>
                        <div class="location" @click="choose_doc_location">
                            <span class="target_folder_name">{{target_folder_info && target_folder_info.name || '我的桌面'}}</span>
                            <i></i>
                        </div>
                    </div>
                    <div class="footer">
                        <button class="cancel_button" @click="close">{{modal_cancel_text}}</button>
                        <button class="sure_button" type="button" @click="sure_click(sure_callback)" :disabled="btn_confirm_disabled">{{modal_sure_text}}</button>
                    </div>
                </div>
            </div>
        </transition>
        <move_modal ref="move_modal" @confirm_location="get_doc_location"></move_modal>
    </div>  
</template>

<script>
    import move_modal from '@/components/MoveModal.vue';
    export default {
        name: "NameModal",
        components:{
            move_modal,
        },
        props:[
            'document_info',           
        ],
        data(){
            return {
                show_modal: false,
                modal_title: '保存为模板',
                modal_content: '',
                modal_sure_text: '保存',
                modal_cancel_text: '取消',
                btn_confirm_disabled: false,

                // 团队文档移动相关
                is_team_doc: false,         // 不是团队文件
                target_folder_info: {},     // 移动到目标文件夹
                target_folder_type: '',     // 移动目标文件夹类型
            }
        },
        methods:{
            sure_callback:'',

            open: function(obj){
                let that = this;
                let document_id = that.document_info.id
                let params = {
                    title: '保存为模板',
                    content: '',
                    sure_text: '保存',
                    cancel_text: '取消',
                    is_team: false,
                    sure_fn: ''
                }
                params = Object.assign(params, obj || {});

                that.modal_title       = params.title;
                that.modal_content     = params.content;
                that.modal_sure_text   = params.sure_text;
                that.modal_cancel_text = params.cancel_text;
                that.sure_callback     = params.sure_fn;
                that.is_team_doc       = params.is_team;
                that.show_modal = true;                         

                if(that.is_team_doc){
                    // 默认存储路径：我的桌面  获取我的桌面id
                    that.$axios.get("/api/member/folder/list/").then(function(data){
                        if(data.data.code == 2){
                            that.target_folder_info = data.data.data[0];
                            that.target_folder_type = 'myDesktop';
                        }
                    });
                }
            },
            close(){
                this.show_modal = false;
            },
            sure_click: function(callback){
                let that = this;
                that.btn_confirm_disabled = true;
                that.show_modal = false;
                if(typeof callback === 'function'){
                    setTimeout(() => {
                        callback({
                            name: that.modal_content,
                            is_team_doc: that.is_team_doc,
                            target_folder_info: that.target_folder_info,
                            target_folder_type: that.target_folder_type
                        })
                    }, 500);             
                }               
            },
            // 选择保存路径
            choose_doc_location: function(){
                this.$refs.move_modal.open({
                    modal_title: '位置'             
                });
            },
            // 获取文档保存路径
            get_doc_location: function(obj){
                this.target_folder_info = obj.folder;
                this.target_folder_type = obj.folder_type;
                this.$refs.move_modal.close();
            }
        },
    }
</script>

<style lang="less" scoped>
    .name_masking{
        position: fixed;
        top: 0;
        left: 0;
        z-index:10;
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
        .name_modal{
            position:relative;
            display:inline-block;
            width:480px;
            padding:0 36px;
            background:#ffffff;
            border-radius:4px;
            vertical-align:middle;


        }
        .header{
            height:60px;
            line-height:60px;
            text-align: left;
            font-weight: 600;
            color: #161718;
            font-size: 18px;
        }
        .close{
            position:absolute;
            top:5px;
            right:5px;
            display:inline-block;
            width:26px;
            height:26px;
            background:url(../assets/pc/images/common/modal_sp.png) 8px 8px;
            transition:all .4s;
            &:hover{transform:rotate(180deg);}
        }
        .body{
            height:80px;
            padding-top:12px;
            font-size:0;
            color:#525151;
            span{
	            font-size: 14px;
	            line-height: 28px;
	            letter-spacing: 0px;
                color: #4e607b;
                float: left;
            }
            input{
                display:block;
                width:100%;
                height:40px;
                line-height:38px;
                padding-left:10px;
                border:1px solid #dddddd;
                border-radius:4px;
                font-size:14px;
            }
        }
        .save_location{
            height:80px;
            padding-top:12px;
            font-size:0;
            color:#525151;
            span{
                font-size: 14px;
	            line-height: 28px;
	            letter-spacing: 0px;
                color: #4e607b;
                float: left;
            }
            .location{
                position: relative;
                display:inline-block;
                width:100%;
                height:40px;
                line-height:38px;
                padding-left:10px;
                border:1px solid #dddddd;
                border-radius:4px;
                font-size:14px;
                cursor: pointer;
                .target_folder_name{
                    display: inline-block;
					vertical-align: middle;
                    height: 100%;
                    line-height: 36px;
					white-space: nowrap;
					text-overflow: ellipsis;
					overflow: hidden;
					&::before{
						content:"";
						float: left;
						vertical-align:middle;
						width: 20px;
						height: 20px;
						margin:10px 10px 3px 0;
						background: url(../assets/pc/images/doc/folder_list_icon.png) no-repeat;
                        background-size:contain;
                        
					}
                }
                i{                  
                    position: absolute;
                    right: 17px;
                    top: 13px;
                    width: 9px;
                    height: 9px;
                    border: 1px solid #697381;
                    border-bottom-color: transparent;
                    border-left-color: transparent;
                    transform: rotate(45deg);
                    transition: all .2s;
                
                }
            }
        }
        .footer{
            height:86px;
            line-height:86px;
            font-size:0;
            text-align:center;
            button{
                display:inline-block;
                width:90px;
                height:40px;
                line-height:40px;
                border-radius:4px;
                background:#f6f6f6;
                font-size:14px;
                color:#7d7d7d;
                text-align:center;
                vertical-align:middle;
            }
            .sure_button{
                margin-left:28px;
                background:#0d7bf8;
                color:#ffffff;
            }
        }
    }
</style>