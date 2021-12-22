<template>
    <div class="local-file-upload" :class="{ 'file-upload-modal': uploadStatus }">
        <!-- <base-button
            ref="uploadBtn"
            class="upload-btn"
            type="file"
            accept="application"
            height="20"
            width="20"
            :multiple="true"
            @change="uploadDoc"></base-button> -->
        <input
            v-if="!uploadStatus"
            ref="uploadBtn"
            class="uploadBtn"
            type="file"
            multiple="true"
            accept="application/pdf, application/vnd.ms-powerpoint, application/vnd.openxmlformats-officedocument.presentationml.presentation, .pptx"
            @change="getFiles" />
        <template v-else>
            <div class="modal-backdrop"></div>
            <div class="modal-container">
                <div class="close" @click="$emit('close')" v-if="showClose">
                    <base-icon class="iconguanbi2" :size="12" color="#5F6063"></base-icon>
                </div>
                <div class="status-info">{{ uploadStatusInfo }}</div>
                <div class="upload-wrapper">
                    <div
                        class="upload-item flex"
                        v-for="(item, index) in uploadList"
                        :key="index">
                        <img src="~@/assets/pc/images/doc/slide_list_icon.png" alt="">
                        <p class="name text-ellipsis">{{ item.name }}</p>
                        <p v-if="item.status === 'uploading'" class="progress">正在导入文档 {{ item.progress }}%</p>
                        <div v-else-if="item.status === 'success'" class="success">
                            <base-icon class="icondagou" :size="12" color="#FFFFFF"></base-icon>
                        </div>
                        <p v-else class="error">导入失败</p>
                        <div class="progress-wrapper" :class="{ 'error': item.status === 'fail' }" :style="{ width: `${item.progress}%` }"></div>
                    </div>
                    <base-button
                        v-if="!showClose"
                        class="plain"
                        :round="true"
                        width="100"
                        height="40"
                        @click="clickUploadBtn">{{ uploadStatus === 'uploading' ? '取消导入' : '导入完成' }}</base-button>
                </div>
            </div>
        </template>
    </div>
</template>

<script>
    export default {
        name: 'FileImport',
        data() {
            return {
                uploadStatus: '',
                showClose: false,
                uploadFileNumber: 0,
                successFileNumber: 0,
                uploadList: [],
                currentFile: -1,
                uploadLoading: false,
            }
        },
        mounted() {
            this.$refs.uploadBtn.click();
            // this.$refs.uploadBtn.eventClick();
        },
        computed: {
            uploadStatusInfo() {
                if (this.uploadStatus === 'uploading') {
                    return `导入文件中 ${this.successFileNumber}/${this.uploadFileNumber}`;
                } else {
                    if (this.successFileNumber === this.uploadFileNumber) {
                        return `成功导入${this.successFileNumber}个文件`;
                    } else if (this.successFileNumber === 0) {
                        this.showClose = true;
                        return `导入失败 ${this.successFileNumber}/${this.uploadFileNumber}`;
                    } else {
                        this.showClose = true;
                        return `导入文件中 ${this.successFileNumber}/${this.uploadFileNumber}`;
                    }
                }
            }
        },
        methods: {
            getFiles(event) {
                this.uploadList = event.target.files;
                this.uploadStatus = 'uploading';
                this.uploadFileNumber = this.uploadList.length;
                if (!this.uploadFileNumber) {
                    this.$toast('未获取到文件，请重试', 1500);
                    this.$emit('fail');
                    return;
                }
                if (this.uploadFileNumber > 3) {
                    this.$toast('最多上传三个文件，请重试', 1500);
                    this.$emit('fail');
                    return;
                }
                // 判断文件的类型和大小
                for(let i = 0; i < this.uploadFileNumber; i++) {
                    let file = this.uploadList[i];
                    if (!/(pptx|pdf)$/.test(file.name)) {
                        this.$toast('只有后缀为 .pptx/.pdf 的文件才能上传，请重试', 1500);
                        this.$emit('fail');
                        return;
                    }
                    if (file.size / 1024 / 1024 > 100) {
                        this.$toast('只能上传100M以下的文件，请重试', 1500);
                        this.$emit('fail');
                        return;
                    }
                }

                for(let i = 0; i < this.uploadFileNumber; i++) {
                    this.uploadList[i]['progress'] = 0;
                    this.uploadList[i]['status'] = 'uploading';
                }

                let timer = setInterval(() => {
                    if (!this.uploadLoading) {
                        this.currentFile++;
                        if (this.currentFile === this.uploadFileNumber - 1) clearInterval(timer);
                        this.uploadFiles(this.uploadList[this.currentFile]);
                    }
                }, 200);
            },
            uploadFiles(file) {
                let timer;
                let formData = new FormData();
                formData.append('file', file);
                this.uploadLoading = true;

                if (/(pptx)$/.test(file.name)) {
                    this.$axios({
                        url: '/api/member/document/import_doc/',
                        headers: { 'Content-Type': 'multipart/form-data' },
                        method: 'post',
                        dataType: 'file',
                        data: formData,
                        timeout: 60000
                    }).then(res => {
                        this.uploadLoading = false;
                        clearInterval(timer);
                        let {data, code} = res.data;
                        if (code == 2) {
                            file.progress = 100;
                            file.status = 'success';
                            this.successFileNumber++;
                            this.$forceUpdate();
                        } else {
                            file.status = 'fail';
                            this.$toast(data.content, 1500);
                        }
                        if (this.currentFile === this.uploadFileNumber - 1) this.uploadStatus = 'done';
                    }).catch(error => {
                        clearInterval(timer);
                        file.status = 'fail';
                        this.$toast('导入失败，请刷新页面重试', 1500);
                    });
                    timer = setInterval(() => {
                        if (file.progress >= 95) {
                            clearInterval(timer);
                            this.$forceUpdate();
                        } else {
                            file.progress = file.progress + 5;
                            this.$forceUpdate();
                        }
                    }, 500);
                } else if (/(pdf)$/.test(file.name)) {
                    this.$common.import_pdf(this, formData, data => {
                        clearInterval(timer);
                        file.progress = 100;
                        file.status = 'success';
                        this.successFileNumber++;
                        this.$forceUpdate();
                        if (this.currentFile === this.uploadFileNumber - 1) this.uploadStatus = 'done';
                    }, error => {
                        clearInterval(timer);
                        file.status = 'fail';
                        if (error && error.data.content) {
                            this.$toast(error.data.content, 1500);
                        } else {
                            this.$toast('导入失败', 1500);
                        }
                    });
                    timer = setInterval(() => {
                        if (file.progress >= 95) {
                            clearInterval(timer);
                            this.$forceUpdate();
                        } else {
                            file.progress = file.progress + 5;
                            this.$forceUpdate();
                        }
                    }, 500);
                }
			},
            clickUploadBtn() {
                this.$emit('close');
                if (this.uploadStatus === 'uploading') {
                    // 取消导入操作
                }
            }
        }
    }
</script>

<style lang="less" scoped>
.local-file-upload {
    width: 0;
    height: 0;
    .uploadBtn {
        width: 0;
        height: 0;
    }
}
.file-upload-modal {
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
        width: 450px;
        height: auto;
        border-radius: 5px;
        transform: translate(-50%, -50%);
        background-color: #FFFFFF;
        z-index: 1000;
        .close {
            position: absolute;
            top: 0;
            left: calc(100% + 10px);
            width: 24px;
            height: 24px;
            cursor: pointer;
            text-align: center;
            border-radius: 50%;
            background-color: var(--backColor);
            .base-icon {
                position: absolute;
                left: 6px;
                top: 5px;
                color: var(--textColor);
            }
        }
        .status-info {
            font-size: 16px;
            padding: 20px 0 20px 30px;
            color: var(--stressColor);
            border-bottom: 1px solid var(--borderColor);
        }
        .upload-wrapper {
            padding: 20px 30px 30px 30px;
            min-height: 72px;
            .upload-item {
                position: relative;
                justify-content: space-between;
                box-sizing: border-box;
                align-items: center;
                width: 100%;
                height: 52px;
                font-size: 12px;
                padding: 0 20px;
                margin-bottom: 20px;
                border-radius: 5px;
                overflow: hidden;
                background-color: #F6F6F9;
                img {
                    width: 32px;
                    height: 24px;
                    margin-right: 10px;
                }
                .name {
                    width: 230px;
                    color: var(--stressColor);
                    margin-right: 10px;
                }
                .success {
                    width: 18px;
                    height: 18px;
                    text-align: center;
                    line-height: 18px;
                    border-radius: 50%;
                    background-color: var(--mainColor);
                }
                .error {
                    color: var(--errorColor);
                    &.progress-wrapper {
                        background-color: var(--errorColor);
                    }
                }
                .progress {
                    min-width: 110px;
                    color: var(--dimColor);
                }
                .progress-wrapper {
                    position: absolute;
                    left: 0;
                    bottom: 0;
                    height: 1px;
                    background-color: var(--mainColor);
                }
                &:last-child {
                    margin-bottom: 0;
                }
            }
            .base-button {
                color: var(--dimColor);
                border-color: #F6F6F9;
                background-color: #F6F6F9;
                margin-left: 100%;
                transform: translateX(-100%);
                &:hover {
                    color: #FFFFFF;
                    border-color: var(--mainHoverColor);
                    background-color: var(--mainHoverColor);
                }
            }
        }
    }
}
</style>
<style lang='less'>
    body[data-theme="dark"] {
        .file-upload-modal {
            .modal-container {
                background-color: #242529;
                .upload-wrapper {
                    .upload-item,
                    .base-button {
                        border-color: #303135;
                        background-color: #303135;
                    }
                }
            }
        }
    }
</style>