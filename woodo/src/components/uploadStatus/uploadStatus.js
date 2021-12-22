import Vue from 'vue';
import UploadStatus from './UploadStatus.vue';     //引入组件
let UploadStatusConstructor  = Vue.extend(UploadStatus);

// 本地上传视频和音频文件的上传进度
let myUploadStatus = (params) => {
    $('.upload-media-status').remove();

    let uploadStatusDom = new UploadStatusConstructor({
        el:document.createElement('div')    // 将组件挂载到新创建的div上
    });
    
    uploadStatusDom.upload_status = params.status;
    uploadStatusDom.upload_type = params.type;
    uploadStatusDom.media_file_info = params.info;
    
    let el = document.body;
    el.appendChild(uploadStatusDom.$el); // 把组件的dom添加到节点里

    if(params.status === 'done') {
        setTimeout(function () {
            uploadStatusDom.isShow = false;
        }, 2000);
    }
}  
export default myUploadStatus;