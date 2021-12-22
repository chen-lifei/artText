<template>
    <div class="folder-create-modal" v-if="showModal">
        <div class="modal-backdrop"></div>
        <div class="modal-container">
            <div class="create-folder flex">
                <img src="~@/assets/pc/images/doc/create_folder.png" alt="">
                <div class="create-container">
                    <div class="title">创建新的文件夹</div>
                    <div class="name">
                        <div class="item">文件夹名称</div>
                        <input
                            ref="input"
                            placeholder="命名您的文件夹"
                            v-model="folderName"
                            @keydown.enter="createFolder"
                        />
                    </div>
                    <div class="bottom">
                        <base-button
                            class="create primary"
                            :class="{ 'cursor': !folderName || isCreating ? 'no-drop' : 'pointer' }"
                            :round="true"
                            :width="202"
                            :height="44"
                            :disabled="!folderName || isCreating"
                            @click="createFolder">确定
                        </base-button>
                        <base-button
                            class="cancel"
                            :round="true"
                            :width="88"
                            :height="44"
                            @click="cancelCreate">取消
                        </base-button>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
export default {
    name: 'CreateFolder',
    props: {
        parentFolder: {
            type: Object,
            default: () => {}
        }
    },
    data() {
        return {
            showModal: false,           // 是否显示当前弹窗
            isCreating: false,          // 是否正在创建文件夹中
            folderName: '',             // 文件夹名称
        }
    },
    methods: {
        show() {
            this.showModal = true;
            this.$nextTick(() => this.$refs.input.focus());
        },
        createFolder() {
            if (this.isCreating) return;
            this.isCreating = true;
            let spaceReg = /\s+/g;
            let folderId = this.parentFolder.id;
            // let folderId = 897356;
            
            // 判断是否选中特定文件夹
            // if(this.document_list[this.current_doc_index] && this.document_list[this.current_doc_index].open){
            //     create_inside = true;
            //     folder_index = this.current_doc_index;
            // }
            // folder_id = create_inside ? this.document_list[this.current_doc_index].id : this.current_folder_info.id;
            // 错误拦截
            if ($validate(this.folderName).empty()) {
                return this.$toast('请输入文件夹名称');
            }
            if(spaceReg.test(this.folderName)) {
                return this.$toast('文件夹名称不可包含空格');
            }
            if ($validate(this.folderName).illegal() || $validate(this.folderName).special()) {
                return this.$toast('标题存在非法字符，请重新输入');
            }
            if (!$validate(this.folderName).rangelength(60)) {
                return this.$toast('标题最大可输入60字');
            }
            this.$axios.post('/api/member/folder/create/',{
                fid: folderId,
                name: this.folderName,
            }).then(data => {
                console.log(data);
                if(data.data.code == 2) {
                    this.isCreating = false;
                    this.folderName = '';
                    this.$toast('创建文件夹成功');
                    this.$emit('success');
                    // let _data = data.data.data;
                    // if(create_inside){
                    //     _data.child = true;
                    //     _data.level = this.document_list[folder_index].grade + 1;
                    //     _data.parent_id = folder_id;
                    //     // 插入到特定文件夹之后
                    //     this.document_list.splice(folder_index + 1, 0, _data);
                    // }else{
                    //     this.document_list.unshift(_data);
                    // }
                } else {
                    this.isCreating = false;
                    this.$toast(data.data.content, 2000);
                }
            });
        },
        cancelCreate() {
            this.showModal = false;
        },
    }
}
</script>

<style lang="less" scoped>
.folder-create-modal {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    z-index: 999;
    .modal-backdrop {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-color: rgba(36, 46, 76, .65);
        backdrop-filter: blur(5px);
    }
    .modal-container {
        position: relative;
        top: 50%;
        left: 50%;
        width: 700px;
        height: 380px;
        border-radius: 10px;
        padding: 70px;
        transform: translate(-50%, -50%);
        background-color: var(--backColor);
        z-index: 1000;
        .create-folder {
            align-items: flex-start;
            border-radius: 10px;
            img {
                width: 248px;
                height: 248px;
                margin-right: 50px;
            }
            .create-container {
                .title {
                    font-weight: 600;
                    font-size: 18px;
                    color: var(--stressColor);
                }
                .name {
                    font-size: 12px;
                    margin: 50px 0 82px 0;
                    .item {
                        color: var(--stressColor);
                        margin-bottom: 10px;
                    }
                    input {
                        width: 300px;
                        height: 48px;
                        border-radius: 5px;
                        padding-left: 20px;
                        background-color: #EDEFF5;
                        color: var(--stressColor);
                        border: 1px solid var(--borderColor);
                        &:focus {
                            border-color: var(--mainColor);
                        }
                        &:hover {
                            border-color: var(--mainColor);
                        }
                    }
                }
                .bottom {
                    .create {
                        color: #FFFFFF;
                        margin-right: 10px;
                        background-color: var(--mainColor);
                    }
                    .cancel {
                        color: #242529;
                        background-color: #EDEFF5;
                        &:hover {
                            color: var(--mainColor);
                        }
                    }
                }
            }
        }
    }
}
</style>
<style lang="less">
body[data-theme="dark"] {
    .folder-create-modal {
        .modal-container .create-folder input {
            background-color: #303135 !important;
        }
    }
}
</style>