<template>
    <!-- 重命名弹窗 -->
    <transition name="modal-fade">
        <div class="rename_modal" v-show="show_rename_modal">
            <div class="rename_container">
                <div class="madal_content">
                    <h1>重命名{{document_info.grade ? '文件夹':'文档'}}</h1>
                    <input type="text" maxlength="20" v-model="rename_value">
                    <div class="modal_btn">
                        <button class="cancel gray" @click="hide">取消</button>
                        <button class="confirm blue" @click="confirm_rename">确认</button>
                    </div>
                </div>
            </div>
        </div>
    </transition>
</template>

<script>
    export default {
        name: 'rename',
        data () {
            return {
                document_info:{},
                document_id: null,
                rename_type:'document',
                rename_value: '',
                show_rename_modal: false,
            }
        },
        methods: {
            show (info,name,type) {
                this.document_info = info;
                this.rename_value = name;
                this.document_id = info.id;
                this.show_rename_modal = true;
                this.rename_type = type || 'document';
            },
            hide () {
                this.show_rename_modal = false;
            },
            confirm_rename () {
                let that = this;
                let id = that.document_id;
                let value = that.rename_value;
                let url = '';
                let params = {};
                if (!id && that.rename_type !== 'team') {
                    return false;
                }
                if (!value) {
                    return that.$toast('文档名不能为空~', 1000,'wap');
                }
                if ($validate(value).special()) {
                    return that.$toast('不能包含特殊字符', 1000,'wap');
                }
                switch (that.rename_type) {
                    case 'document':
                        url = '/api/member/document/rename/';
                        params = {
                            docId: id,
                            title: value
                        }
                        break;
                    case 'folder':
                        url = '/api/member/folder/rename/';
                        params = {
                            fid:id,
                            name:value
                        }
                        break;
                    case 'team_folder':
                        url = '/api/member/team/folder/rename/';
                        params = {
                            fId:id,
                            name:value
                        }
                        break;
                    case 'team':
                        url = '/api/member/team/rename/';
                        params = {
                            name: value
                        }
                        break;
                    default:
                        break;
                }
                that.$axios.post(url, params).then((res) => {
                    if(res.data.type !== 'success') {
                        return that.$toast(data.data.content, 1000, 'wap');
                    }
                    that.hide();
                    let obj = {value:value,type:that.rename_type}
                    that.$emit('set_success', obj);
                }).catch((err) => {
                    console.error(err);
                    that.$toast('重命名失败', 1000, 'wap');
                    that.hide();
                });
            },
        },
    }
</script>

<style lang="less" scoped>
    // 重命名弹窗
    .rename_modal {
        position: fixed;
        top: 0;
        left: 0;
        z-index: 111;
        width: 100%;
        height: 100%;
        text-align: center;
        background: rgba(0,0,0,.5);
        .rename_container {
            position: relative;
            display: inline-block;
            vertical-align: middle;
            width: 90%;
            height: auto;
            margin: 0 auto;
            background: #fff;
            border-radius: .5rem;
        }
        .madal_content{
            width:100%;
            height:100%;
            padding:1.22rem 1.15rem 5.8rem;
            h1{
                margin-bottom:2.48rem;
                font-size: 0.8rem;
                color: #4b525f;
            }
            input{
                display:block;
                width: 100%;
                height: 2.33rem;
                line-height: 2.33rem;
                padding-left:0.77rem;
                background-color: #f0f3f8;
                border-radius: 0.13rem;
                color:#707b8e;
                font-size:0.6rem;
                &:focus{box-shadow:none;}
                &::-webkit-input-placeholder{
                    color:#aab5ca;
                }
                &:-moz-placeholder{
                    color:#aab5ca;
                }
                &::-moz-placeholder{
                    color:#aab5ca;
                }
                &:-ms-input-placeholder{
                    color:#aab5ca;
                }
            }
            .modal_btn{
                position:absolute;
                bottom:0;
                left:0;
                width:100%;
                height:2.8rem;
                border-top:1px solid #e2e6ec;
                button{
                    width:50%;
                    height:100%;
                    line-height:2.73rem;
                    border-radius:0;
                    background:transparent;
                    text-align:center;
                    font-size:0.8rem;
                    &:first-child{
                        border-right:1px solid #e2e6ec;
                    }
                    &.gray{
                        color:#707b8e;
                    }
                    &.blue{
                        color:var(--mainColor);
                    }
                }
            }
        }
        &::after {
            content: "";
            display: inline-block;
            vertical-align: middle;
            height: 100%;
            width: 0;
        }
    }
</style>