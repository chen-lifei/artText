<template>
    <div class="upload-media-status" v-if="isShow && (upload_status === 'loading' || upload_status === 'done') && (upload_type === 'video' || upload_type === 'audio')">
        <!-- 上传中 -->
        <transition name="modal-fade">
            <div class="upload-loading" v-if="upload_status === 'loading'">
                <div class="icon">
                    <base-icon class="iconmeitiku"></base-icon>
                </div>
                <span class="name">{{ media_file_info.name }}</span>
                <span class="progress-text">{{ media_file_info.progress }}%</span>
            </div>
        </transition>
        <!-- 上传成功 -->
        <transition name="modal-fade">
            <div class="upload-done" v-if="upload_status === 'done'">
                <div class="icon">
                    <base-icon class="icondagou"></base-icon>
                </div>
                <span>上传成功</span>
            </div>
        </transition>
    </div>
</template>

<script>
export default {
    data() {
        return {
            media_file_info: {},
            upload_status: 'init',
            upload_type: '',
            isShow: true
        }
    }
}
</script>

<style lang="less" scoped>
.upload-media-status {
    position: fixed;
    left: 50%;
    bottom: 100px;
    transform: translateX(-50%);
    z-index: 9999;
    .upload-loading {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        display: flex;
        justify-content: center;
        align-items: center;
        width: 184px;
        height: 44px;
        background: #444444;
        border-radius: 22px;
        box-shadow: 0px 2px 50px 0px rgba(180, 187, 199, 0.4);
        .icon {
            display: flex;
            width: 20px;
            height: 20px;
            color: #ffffff;
            border-radius: 50%;
            .base-icon {
                margin: auto;
                font-size: 18px;
            }
        }
        span {
            margin-left: 10px;
            font-size: 12px;
            color: #ffffff;
            &.name {
                display: inline-block;
                width: 74px;
                overflow: hidden;
                text-overflow: ellipsis;
                white-space: nowrap;
            }
        }
    }
    .upload-done {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        display: flex;
        justify-content: center;
        align-items: center;
        width: 122px;
        height: 44px;
        background: #444444;
        border-radius: 22px;
        box-shadow: 0px 2px 50px 0px rgba(180, 187, 199, 0.4);
        .icon {
            display: flex;
            width: 20px;
            height: 20px;
            background: #ffffff;
            color: #444444;
            border-radius: 50%;
            .base-icon {
                margin: auto;
            }
        }
        span {
            margin-left: 10px;
            font-size: 12px;
            color: #ffffff;
        }
    }
}
</style>