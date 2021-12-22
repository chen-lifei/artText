<template>
    <!-- 交流反馈 -->
    <div class="service-panel">
        <!-- 切换 -->
        <div class="service-toggle">
            <button @click="serviceToggle = 'workOrder'" v-show="serviceToggle !== 'workOrder'">提交工单</button>
            <button @click="serviceToggle = 'wechatQrcode'" v-show="serviceToggle !== 'wechatQrcode'">找人工</button>
        </div>
        <div class="transition-wraper">
            <!-- 工单 -->
            <transition name="left-slide">
                <div class="work-order" v-if="serviceToggle === 'workOrder'">
                    <div class="title">
                        <base-icon class="icontijiaogongdan"></base-icon>
                        <span>工单反馈</span>
                    </div>
                    <div class="work-order-content">
                        <div class="problem-label">我们会尽快回复你的问题</div>
                        <div class="content">
                            <input v-show="false" ref="uploader" type="file" accept="*" :disabled="submitFeedbackStatus" multiple title="" @change="uploadFeedbackFiles" />
                            <base-icon class="iconfujian" v-tooltip="`上传文件`" @click="openUploader()"></base-icon>
                            <textarea class="feedback-value" placeholder="在这里进行描述" :disabled="submitFeedbackStatus" type="text" maxlength="500" :rows="3" v-model="feedbackValue"></textarea>
                        </div>
                        <div class="file-list" v-if="feedbackFilesList.length || uploadFeedbackFilesLoading">
                            <div class="file-item" v-for="(item, index) in feedbackFilesList" :key="index">
                                <div class="file-name">{{item.name}}</div>
                                <button class="del" :disabled="submitFeedbackStatus" @click="delFeedbackFiles(index)">删除</button>
                            </div>
                            <!-- 加载状态 -->
                            <div class="file-loading" v-show="uploadFeedbackFilesLoading">
                                <img :src="require('@/assets/common/images/image_load.gif')" />
                            </div>
                        </div>
                        <div class="contact-label">留下联系方式，便于我们进一步接触</div>
                        <input class="contact-input" placeholder="手机/微信/QQ/邮箱均可" :disabled="submitFeedbackStatus" type="text" v-model="feedbackContactValue">
                    </div>

                    <button class="submit-button" :class="{hasContent: feedbackValue}" :disabled="submitFeedbackStatus" @click="submitFeedback()">提交</button>
                    <button class="work-order-record" @click="openWorkOrderModal()">工单记录</button>
                </div>
            </transition>
            <!-- 微信群 -->
            <transition name="right-slide">
                <div class="wechat-group" v-if="serviceToggle === 'wechatQrcode'">
                    <div class="title">
                        <base-icon class="iconsaomafankui"></base-icon>
                        <span>扫码反馈</span>
                    </div>
                    <div class="tip">
                        HI，这里是吾道团队，你的反馈对我们非常重要，遇到任何问题或是建议，欢迎随时和我们联系，我们会尽力帮助解决。
                    </div>
                    <div class="wechat-qrcode">
                        <img :src="serviceQrcode" />
                        <base-logo type="code" width="35" height="35"></base-logo>
                    </div>
                    <span class="qrcode-tip">请使用微信扫码</span>
                </div>
            </transition>
        </div>
    </div>
</template>

<script>
import workOrderModal from '@/components/workOrderModal/workOrderModal.js';
import alioss from '@/assets/pc/js/ali_oss.js';
export default {
    props: {
        workOrderType: {
            type: String,
            default: 'WTFK'
        }
    },
    data() {
        return {
            // 切换反馈服务  wechatQrcode => 人工  workOrder => 工单
            serviceToggle: 'workOrder',
            // 二维码链接
            serviceQrcode: '',
            // 反馈内容
            feedbackValue: '',
            // 反馈文件列表
            feedbackFilesList: [],
            // 反馈文件上传状态
            uploadFeedbackFilesLoading: false,
            // 反馈用户的联系方式
            feedbackContactValue: '',
            // 提交反馈状态
            submitFeedbackStatus: false,
        }
    },
    created() {
        // 获取交流群二维码
        this.serviceQrcode = `https://file.woodo.cn/upload/foreverImage/kefu_qrcode.png?v=${new Date().getTime()}`;
    },
    methods: {
        // 打开上传窗口
        openUploader() {
            if (!this.$common.get_login_state().login) {
                return this.$toast('请先登录！', 2000);
            }
            this.$refs.uploader.click();
        },
        // 上传反馈文件
        uploadFeedbackFiles(e) {
            let maxFilesLength = 3;
            let files = e.target.files;
            if (files.length + this.feedbackFilesList.length > maxFilesLength) {
                return this.$toast(`最多上传${maxFilesLength}个文件哦！还可再上传${maxFilesLength - this.feedbackFilesList.length}个`, 2000);
            }
            if (!files || files.length <= 0) {
                return this.$toast("上传文件失败，请重试", 800);
            }
            // 打开加载状态
            this.uploadFeedbackFilesLoading = true;
            // 正在上传的文件数量
            let uploadFilesLength = files.length;

            let complete = () => {
                uploadFilesLength--;
                if (uploadFilesLength <= 0) {
                    // 关闭加载状态
                    this.uploadFeedbackFilesLoading = false;
                }
            }
            for (let i = 0; i < files.length; i++) {
                let file = files[i];
                if (file.size / 1024 / 1024 > 5) {
                    this.$toast(`${file.name}上传失败, 大小不得超过5M`, 2000);
                    complete();
                    continue;
                }
                //阿里OSS直传
                alioss.upload_file({
                    file: file,
                    fileType: 'workOrderFile',
                    success: url => {
                        this.feedbackFilesList.push({ src: url, name: file.name });

                    },
                    fail: err => {
                        this.$toast(`${file.name}上传失败`, 2000);
                    },
                    complete,
                });
            }
            e.target.value = '';
        },
        // 删除反馈文件
        delFeedbackFiles(index) {
            this.feedbackFilesList.splice(index, 1);
        },
        // 提交反馈工单
        submitFeedback() {
            if (!this.$common.get_login_state().login) {
                return this.$toast('请先登录！', 2000);
            }
            let value = this.feedbackValue;
            let contact = this.feedbackContactValue;
            let fileList = this.feedbackFilesList;
            // 判断为空
            if (value.length === 0) {
                return this.$toast("反馈内容不能为空噢！");
            }
            // 判断超出大小限制
            if (value.length > 500) {
                return this.$toast("反馈内容不能超过500个字！");
            }
            // 非常规字符拦截
            if ($validate(value).special()) {
                return this.$toast("内容不能包含特殊字符！");
            }
            // 文件上传
            if (this.uploadFeedbackFilesLoading) {
                return this.$toast("请等待文件上传完成后提交");
            }
            // 进入加载状态 禁用内容输入 or 重复提交
            this.submitFeedbackStatus = true;
            // 工单类型
            let type = this.workOrderType;
            this.$axios({
                url: '/api/member/work_order/create/',
                method: 'post',
                data: {
                    type,
                    description: value,
                    weixin: contact,
                    attachment: JSON.stringify(fileList.map(v => Object.values(v))), // 转格式为二维数组
                },
            }).then(res => {
                let { code, content, data } = res.data;
                if (code === "2") {
                    // 清除信息以防用户重复提交相同的内容
                    this.feedbackValue = '';
                    this.feedbackContactValue = '';
                    this.feedbackFilesList = [];
                    this.$toast("提交成功, 我们会尽快回复您的问题！", 5000);
                    this.$emit('submit-success', data);
                } else if (code === "3") {
                    this.$toast(content, 2000);
                }
            }).finally(() => {
                this.submitFeedbackStatus = false;
            });
        },
        // 打开工单记录
        openWorkOrderModal(option = {}) {
            if (!this.$common.get_login_state().login) {
                return this.$toast('请先登录！', 2000);
            }
            workOrderModal(option);
            this.$emit('open-work-order');
        },
    }
}
</script>

<style lang="less" scoped>
.left-slide-enter-active,
.left-slide-leave-active {
    transition: all 0.3s;
}
.left-slide-enter,
.left-slide-leave-to {
    opacity: 0;
    transform: translateX(-150%);
}
.right-slide-enter-active,
.right-slide-leave-active {
    transition: all 0.3s;
}
.right-slide-enter,
.right-slide-leave-to {
    opacity: 0;
    transform: translateX(150%);
}
::-webkit-scrollbar-thumb {
    background: #dddddd;
}
.service-panel {
    width: 414px;
    height: 630px;
    background: #ffffff;
    border-radius: 10px;
    box-shadow: 0px 0px 20px 0px rgba(0, 0, 0, 0.05);
    overflow: hidden;

    .service-toggle {
        padding: 22px;
        display: flex;
        align-items: center;
        justify-content: flex-end;

        button {
            font-size: 14px;
            font-weight: 400;
            color: #333333;
            cursor: pointer;
            &:hover {
                color: var(--mainColor);
            }
        }
    }
    .transition-wraper {
        position: relative;
        width: 100%;
    }
    .work-order {
        position: absolute;
        top: 0;
        left: 0;
        display: flex;
        flex-direction: column;
        align-items: center;
        width: 100%;

        .title {
            padding: 10px 30px;
            align-self: flex-start;
            display: flex;
            align-items: center;
            color: #111111;

            .base-icon {
                font-size: 26px;
                margin-right: 13px;
            }

            span {
                font-size: 20px;
                font-weight: 600;
            }
        }

        .work-order-content {
            padding: 10px 30px;
            margin-top: 10px;
            width: 100%;
            height: 360px;
            overflow-y: auto;

            .problem-label {
                font-size: 14px;
                font-weight: 400;
                color: #333333;
            }

            .content {
                position: relative;
                padding-bottom: 5px;
                margin-top: 20px;
                width: 100%;
                height: 160px;
                background: #f8f8f8;
                border-radius: 5px;
                .base-icon {
                    position: absolute;
                    top: 8px;
                    right: 8px;
                    font-size: 16px;
                    cursor: pointer;
                }
                .feedback-value {
                    padding: 15px 30px 15px 15px;
                    width: 100%;
                    height: 100%;
                    font-size: 12px;
                    font-weight: 300;
                    resize: none;
                    &::placeholder {
                        color: #999999;
                    }
                }
            }

            .file-list {
                margin-top: 20px;
                position: relative;
                width: 180px;

                .file-item {
                    margin-top: 20px;
                    position: relative;
                    display: flex;

                    .file-name {
                        width: 80px;
                        overflow: hidden;
                        text-overflow: ellipsis;
                        white-space: nowrap;
                    }

                    .del {
                        margin-left: 10px;
                        color: var(--mainColor);
                        &:hover {
                            color: var(--mainHoverColor);
                        }
                    }
                }

                .img-loading {
                    position: absolute;
                    top: 0;
                    left: 0;
                    display: flex;
                    width: 100%;
                    height: 100%;
                    background: rgba(255, 255, 255, 0.3);

                    img {
                        margin: auto;
                        width: 36px;
                        height: auto;
                    }
                }
            }

            .contact-label {
                margin-top: 40px;
                font-size: 14px;
                font-weight: 400;
                color: #333333;
            }

            .contact-input {
                padding: 14px;
                margin-top: 20px;
                width: 100%;
                height: 40px;
                font-size: 12px;
                font-weight: 300;
                background: #f8f8f8;
                border-radius: 5px;
                &::placeholder {
                    color: #999999;
                }
            }
        }

        .submit-button {
            margin-top: 54px;
            width: 126px;
            height: 44px;
            font-size: 12px;
            font-weight: 600;
            color: #ffffff;
            background: #eeeeee;
            border-radius: 22px;
            &.hasContent {
                background: var(--mainColor);
                &:hover {
                    background: var(--mainHoverColor);
                }
            }
        }

        .work-order-record {
            margin-top: 12px;
            font-size: 12px;
            font-weight: 300;
            color: #999999;
            &:hover {
                color: var(--mainColor);
            }
        }
    }

    .wechat-group {
        position: absolute;
        top: 0;
        left: 0;
        display: flex;
        flex-direction: column;
        align-items: center;
        width: 100%;
        .title {
            padding: 10px 30px;
            align-self: flex-start;
            display: flex;
            align-items: center;
            color: #111111;

            .base-icon {
                font-size: 26px;
                margin-right: 13px;
            }

            span {
                font-size: 20px;
                font-weight: 600;
            }
        }

        .tip {
            margin-top: 40px;
            padding: 10px 0;
            display: flex;
            width: 288px;
            font-size: 14px;
            font-weight: 400;
            color: #333333;
        }

        .wechat-qrcode {
            margin: 20px auto;
            padding: 15px;
            position: relative;
            display: flex;
            justify-content: center;
            align-items: center;
            width: 288px;
            height: 288px;
            border: 1px solid #eeeeee;
            border-radius: 10px;

            img {
                width: 100%;
                height: 100%;
            }

            .base-logo {
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
            }
        }

        .qrcode-tip {
            font-size: 14px;
            font-weight: 400;
            color: #777777;
        }
    }
}
</style>