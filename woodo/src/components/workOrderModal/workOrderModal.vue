<template>
    <div class="work-order-modal">
        <div class="work-order-wraper">
            <button class="close-button" @click="close()">
                <base-icon class="icona-guanbi"></base-icon>
            </button>
            <!-- 工单记录 列表页 -->
            <div class="work-order-record" v-if="orderShowType === 'record'">
                <div class="title">工单记录</div>
                <div class="table-wraper">
                    <!-- 列表标题 -->
                    <div class="table-header">
                        <div class="table-row">
                            <div class="table-item time">
                                <span>提交时间</span>
                            </div>
                            <div class="table-item description">
                                <span>工单内容</span>
                            </div>
                            <div class="table-item number">
                                <span>工单编号</span>
                            </div>
                            <div class="table-item state">
                                <span>状态</span>
                            </div>
                            <div class="table-item operation">
                                <span>操作</span>
                            </div>
                        </div>
                    </div>
                    <div class="table-content" v-if="workOrderList.length">
                        <!-- 列表行 -->
                        <div class="table-row" v-for="item in workOrderList" :key="item.id">
                            <div class="table-item time">
                                <span>{{item.createDate | timestampFormat}}</span>
                            </div>
                            <div class="table-item description">
                                <span>{{item.description}}</span>
                            </div>
                            <div class="table-item number">
                                <span>{{item.sn}}</span>
                            </div>
                            <div class="table-item state">
                                <span :style="{color: workOrderState[item.state].color}">{{workOrderState[item.state].value}}</span>
                            </div>
                            <div class="table-item operation">
                                <button @click="toDetail(item.sn)">查看</button>
                            </div>
                        </div>
                    </div>
                    <div class="table-empty" v-else>
                        <div class="empty-content">
                            <img :src="require('@/assets/pc/images/common/word_order_empty.png')" alt="">
                            <span>目前工单没有记录哟～</span>
                        </div>
                    </div>

                    <!-- 页码 -->
                    <page-number v-if="totalPages > 1" :total-pages="totalPages" :page-number="pageNumber" @select="selectPage"></page-number>
                </div>
            </div>
            <!-- 工单详情 -->
            <div class="work-order-detail" v-else-if="orderShowType === 'detail'" @click="closeRichTextEditor()">
                <div class="back-record">
                    <button @click="backRecord()">
                        <base-icon class="iconfanhuijiantou"></base-icon>
                        <span>返回列表</span>
                    </button>
                </div>
                <div class="title">工单详情</div>
                <div class="work-order-info">
                    <div class="create-time">提交时间：{{workOrderDetailInfo.createDate | timestampFormat}}</div>
                    <div class="order-sn">订单编号：{{workOrderDetailInfo.sn}}</div>
                </div>
                <!-- 聊天记录 -->
                <div class="chat-content" ref="chatContent">
                    <div class="chat-item">
                        <div class="chat-item-header">
                            <div class="user-info">
                                <img :src="memberInfo.head" alt="">
                                <div class="nick-name">{{memberInfo.nickName}}</div>
                            </div>
                            <div class="create-time">{{workOrderDetailInfo.createDate | timestampFormat}}</div>
                        </div>
                        <div class="chat-item-content" v-html="workOrderDetailInfo.description"></div>
                    </div>
                    <div class="chat-item" v-for="item in chatContentList" :key="item.id">
                        <div class="chat-item-header">
                            <div class="user-info">
                                <template v-if="item.type === 'user'">
                                    <img :src="memberInfo.head" alt="">
                                    <div class="nick-name">{{memberInfo.nickName}}</div>
                                </template>
                                <template v-else-if="item.type === 'admin'">
                                    <base-logo type="code"></base-logo>
                                    <div class="nick-name">客服</div>
                                </template>
                            </div>
                            <div class="create-time">{{item.createDate | timestampFormat}}</div>
                        </div>
                        <div class="chat-item-content" v-html="item.content"></div>
                    </div>
                </div>

                <!-- 回复框 -->
                <div class="reply-input" @click.stop>
                    <input v-show="false" ref="uploader" type="file" accept="*" multiple title="" @change="uploadFeedbackFiles" />
                    <div class="reply-input-button" :class="{disabled: !allowReply}" v-if="!richTextEditorShow" @click="createRichTextEditor()">
                        <span class="placeholder">* 回复</span>
                        <base-icon class="iconfujian"></base-icon>
                    </div>
                    <div v-show="richTextEditorShow" class="rich-text-editor" ref="richTextEditor"></div>
                    <div class="file-list" v-if="feedbackFilesList.length || uploadFeedbackFilesLoading">
                        <div class="file-item" v-for="(item, index) in feedbackFilesList" :key="index">
                            <div class="file-name">{{item.name}}</div>
                            <button class="del" @click="delFeedbackFiles(index)">删除</button>
                        </div>
                        <!-- 加载状态 -->
                        <div class="file-loading" v-show="uploadFeedbackFilesLoading">
                            <img :src="require('@/assets/common/images/image_load.gif')" />
                        </div>
                    </div>
                </div>
                <!-- 底部按钮 -->
                <div class="footer-button">
                    <button class="update-state" @click="updateState({sn: workOrderDetailInfo.sn, state: `solved`})" v-if="allowReply">问题已解决</button>
                    <button class="update-state" @click="updateState({sn: workOrderDetailInfo.sn, state: `handling`})" v-else>重新开启问题</button>
                    <button class="reply" :class="{disabled: !allowReply}" @click.stop="reply()">回复</button>
                </div>
            </div>
            <!-- 加载状态 -->
            <div class="work-order-loading" v-else-if="orderShowType === 'loading'">
                <img :src="require('@/assets/common/images/loading4.gif')" alt="">
            </div>
        </div>
    </div>
</template>

<script>
import pageNumber from '@/components/pageNumber.vue';
import alioss from '@/assets/pc/js/ali_oss.js';

export default {
    name: 'workOrderModal',
    components: {
        pageNumber
    },
    data() {
        return {
            // 订单显示类型 record => 工单记录  detail => 工单详情 loading => 进入加载状态
            orderShowType: 'loading',
            // 工单列表数据
            workOrderList: [],
            // 工单处理状态
            workOrderState: {
                'tbc': {
                    value: `有新回复`,
                    color: `#089D1F`,
                },
                'handling': {
                    value: `正在处理`,
                    color: `#ff9700`,
                },
                'solved': {
                    value: `已解决`,
                    color: `#333333`,
                },
                'closed': {
                    value: `已关闭`,
                    color: `#333333`,
                },
                'expired': {
                    value: `已过期`,
                    color: `#ff0000`,
                }
            },
            // 总页数
            totalPages: 0,
            // 当前页数
            pageNumber: 1,
            // 工单详情信息
            workOrderDetailInfo: {
                id: 0,
                state: '',
                createDate: 0,
                sn: '',
                description: '',
            },
            // 用户信息
            memberInfo: {
                id: 0,
                head: '',
                nickName: '',
            },
            // 工单详情回复内容列表
            chatContentList: [],
            // 富文本编辑输入框显示
            richTextEditorShow: false,
            // 富文本编辑对象实例
            richTextEditor: null,
            // 反馈文件列表
            feedbackFilesList: [],
            // 反馈文件上传状态
            uploadFeedbackFilesLoading: false,
        }
    },
    computed: {
        // 是否允许回复 
        allowReply() {
            let { state } = this.workOrderDetailInfo;
            return [`tbc`, `handling`].includes(state);
        }
    },
    mounted() {
        this.getWorkOrderList();
    },
    methods: {
        close() {
            this.$emit('close');
        },
        // 获取工单列表
        getWorkOrderList(option = {}) {
            this.orderShowType = 'loading';
            let { pageNumber = 1, pageSize = 10 } = option;
            this.$axios({
                url: '/api/member/work_order/list/',
                method: 'get',
                params: { pageNumber, pageSize },
            }).then(res => {
                let { data } = res.data;
                let { totalPages, content: list } = data;
                this.workOrderList = list;
                this.pageNumber = pageNumber;
                this.totalPages = totalPages;
                this.backRecord();
            });
        },
        // 选择页码
        selectPage(number) {
            this.getWorkOrderList({ pageNumber: number });
        },
        // 返回工单记录
        backRecord() {
            this.orderShowType = 'record';
            this.destroyRichTextEditor();
        },
        // 打开详情页
        toDetail(sn) {
            this.orderShowType = 'loading';
            this.$axios({
                url: '/api/member/work_order/detail/',
                method: 'get',
                params: { sn },
            }).then(res => {
                let { code, data } = res.data;
                if (code === '2') {
                    let { member, workOrder, workOrderReplies } = data;
                    this.memberInfo = member;
                    this.workOrderDetailInfo = workOrder;
                    this.chatContentList = workOrderReplies;
                    if (this.workOrderDetailInfo.state === `tbc`) {
                        this.updateState({ sn, state: `handling` });
                    }
                    this.orderShowType = 'detail';
                    this.$nextTick(() => {
                        this.$refs.chatContent.scrollTop = this.$refs.chatContent.scrollHeight;
                    });
                } else {
                    this.backRecord();
                    this.$toast('获取详情失败！');
                }
            });
        },
        // 调起上传窗口
        uploadFilesMenuClickHandler() {
            if (this.uploadFeedbackFilesLoading) return;
            this.$refs.uploader.click();
        },
        // 创建富文本编辑器
        createRichTextEditor() {
            if (!this.allowReply) return;
            // 编辑器已经存在 则 直接显示
            if (!this.richTextEditor) {
                // 获取 调起上传窗口 事件
                let uploadFilesMenuClickHandler = this.uploadFilesMenuClickHandler;
                this.richTextEditor = new WangEditor(this.$refs.richTextEditor);
                let { $, BtnMenu } = WangEditor;
                // 创建菜单类
                class uploadFiles extends BtnMenu {
                    constructor(editor) {
                        // data-title属性表示当鼠标悬停在该按钮上时提示该按钮的功能简述
                        const $elem = $(`
                    <div class="w-e-menu"  data-title="上传文件">
                        <i class="base-icon iconfont iconfujian" style="font-size: 16px;">
                    </div>`);
                        super($elem, editor);
                    }
                    // 菜单点击事件
                    clickHandler() {
                        uploadFilesMenuClickHandler();
                    }
                    tryChangeActive() { } // 不加tryChangeActive会报错
                }
                // 注册菜单
                this.richTextEditor.menus.extend('uploadFiles', uploadFiles);
                let config = {
                    // 设置编辑区域高度
                    height: 130,
                    // 配置菜单栏
                    menus: ['image', 'uploadFiles'],
                    // 全屏按钮是否显示
                    showFullScreen: false,
                    // base64 保存图片
                    uploadImgShowBase64: true,
                    // 默认显示内容
                    placeholder: `* 回复`
                }
                Object.assign(this.richTextEditor.config, config);
                this.richTextEditor.create();
            }
            this.richTextEditorShow = true;
        },
        // 关闭编辑器
        closeRichTextEditor() {
            this.richTextEditorShow = false;
        },
        // 销毁编辑器
        destroyRichTextEditor() {
            if (!this.richTextEditor) return;
            this.richTextEditor.destroy();
            this.richTextEditor = null;
            this.richTextEditorShow = false;
        },
        // 上传反馈文件
        uploadFeedbackFiles(e) {
            let maxFilesLength = 3;
            let files = e.target.files;
            if (files.length + this.feedbackFilesList.length > maxFilesLength) {
                return this.$toast(`最多上传${maxFilesLength}个文件哦！还可再上传${maxFilesLength - this.feedbackFilesList.length}个`, 2000);
            }
            if (!files || files.length <= 0) {
                return this.$toast("上传文件失败，请重试", 2000);
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
                if (file.size / 1024 / 1024 > 3) {
                    this.$toast(`${file.name}上传失败, 大小不得超过3M`, 2000);
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
                    fail: () => {
                        this.$toast(`${file.name}上传失败`, 2000);
                    },
                    complete
                });
            }
            e.target.value = '';
        },
        // 删除反馈文件
        delFeedbackFiles(index) {
            this.feedbackFilesList.splice(index, 1);
        },
        // 更改问题状态
        updateState({ sn, state }) {
            this.$axios({
                url: '/api/member/work_order/update_state/',
                method: 'post',
                data: { sn, state },
            }).then(res => {
                let { code } = res.data;
                if (code === '2') {
                    this.destroyRichTextEditor();
                    this.workOrderDetailInfo.state = state;
                    this.workOrderList.some(item => {
                        let flag = item.sn === sn;
                        if (flag) item.state = state;
                        return flag;
                    });
                }
            });
        },
        // 回复
        reply() {
            if (!this.allowReply) return;
            let { sn } = this.workOrderDetailInfo;
            let attachment = JSON.stringify(this.feedbackFilesList.map(v => Object.values(v))); // 转格式为二维数组
            let content = this.richTextEditor && this.richTextEditor.txt.html();
            if (!content) {
                return this.$toast('请输入回复内容');
            }
            this.$axios({
                url: '/api/member/work_order/reply/',
                method: 'post',
                data: { sn, attachment, content },
            }).then(res => {
                let { code, data } = res.data;
                if (code === '2') {
                    this.richTextEditor.txt.clear();
                    this.chatContentList.push(data);
                    this.feedbackFilesList = [];
                    this.$toast('回复成功', 2000);
                    this.$nextTick(() => {
                        this.$refs.chatContent.scrollTop = this.$refs.chatContent.scrollHeight;
                    });
                } else {
                    this.$toast('回复失败', 2000)
                }
            });
        }
    },
    filters: {
        // 时间戳格式化
        timestampFormat(timestamp) {
            let timeTowLength = (num) => num >= 10 ? num : `0${num}`; // 时间保留两位的长度
            let date = new Date(timestamp);
            let year = date.getFullYear(); // 年
            let mouth = timeTowLength(date.getMonth() + 1); // 月（01-12）
            let day = timeTowLength(date.getDate()); // 天（1-31）
            let hours = timeTowLength(date.getHours()); // 小时（00-23）
            let minutes = timeTowLength(date.getMinutes()); // 分钟（00-59）
            let dateFormat = `${year}/${mouth}/${day} ${hours}:${minutes}`; // 处理的格式
            return dateFormat;
        }
    },
    beforeDestroy() {
        this.destroyRichTextEditor();
    }
}
</script>

<style lang="less" scoped>
::-webkit-scrollbar {
    width: 0;
}
::-webkit-scrollbar-thumb {
    background: #dddddd;
}
.work-order-modal {
    position: fixed;
    left: 0;
    top: 0;
    z-index: 999;
    display: flex;
    width: 100vw;
    height: 100vh;
    background-color: rgba(0, 0, 0, 0.8);
    backdrop-filter: blur(10px);

    .work-order-wraper {
        position: relative;
        margin: auto;
        width: calc((1000 / 1920) * 100%);
        height: calc(100% - (120 / 1080 * 100%));
        background: #ffffff;
        border-radius: 10px;

        .close-button {
            position: absolute;
            top: 0;
            left: calc(100% + 10px);
            display: flex;
            width: 24px;
            height: 24px;
            background: rgba(255, 255, 255, 0.7);
            border-radius: 50%;
            .base-icon {
                margin: auto;
                font-size: 12px;
            }
        }

        .work-order-record {
            display: flex;
            flex-direction: column;
            width: 100%;
            height: 100%;

            .title {
                margin: 60px auto 35px auto;
                font-size: 32px;
                font-weight: 600;
                color: #333333;
            }

            .table-wraper {
                margin: 0 auto;
                width: 80%;
                height: 70%;

                .table-header {
                    width: 100%;
                    height: 40px;
                    border-bottom: 1px solid #eeeeee;
                    .table-row {
                        padding: 10px 0;
                    }
                }

                .table-content {
                    width: 100%;
                    height: calc(100% - 40px);
                    overflow-y: auto;
                    .table-row {
                        padding-top: 30px;
                    }
                    &:hover::-webkit-scrollbar {
                        width: 6px;
                    }
                }

                .table-row {
                    display: flex;
                    width: 100%;
                    .table-item {
                        span,
                        button {
                            font-size: 14px;
                            font-weight: 400;
                            color: #333333;
                        }
                        &.time {
                            flex: 3;
                        }
                        &.description {
                            flex: 3;
                            overflow: hidden;
                            text-overflow: ellipsis;
                            white-space: nowrap;
                        }
                        &.number {
                            flex: 3;
                        }
                        &.state {
                            flex: 2;
                        }
                        &.operation {
                            flex: 1;
                            button {
                                color: var(--mainColor);
                                &:hover {
                                    color: var(--mainHoverColor);
                                }
                            }
                        }
                    }
                }

                .table-empty {
                    display: flex;
                    width: 100%;
                    height: calc(100% - 40px);
                    .empty-content {
                        margin: auto;
                        display: flex;
                        flex-direction: column;
                        align-items: center;
                        img {
                            margin-bottom: 20px;
                        }
                        span {
                            font-size: 13px;
                            font-weight: 400;
                            color: #5f6063;
                            user-select: none;
                        }
                    }
                }
            }
        }

        .work-order-detail {
            display: flex;
            flex-direction: column;
            width: 100%;
            height: 100%;

            .back-record {
                margin-top: 20px;
                margin-left: 24px;
                .base-icon {
                    margin-right: 10px;
                    font-size: 12px;
                }
                span {
                    font-size: 12px;
                    font-weight: 400;
                    color: #747477;
                }
            }

            .title {
                margin: 23px auto 40px auto;
                font-size: 32px;
                font-weight: 600;
                color: #333333;
            }

            .work-order-info {
                margin: 0 auto;
                display: flex;
                width: 80%;
                font-size: 14px;
                font-weight: 400;
                color: #999999;
                .order-sn {
                    margin-left: 100px;
                }
            }

            .chat-content {
                margin: 10px auto;
                width: 80%;
                height: 40%;
                background: #fafafa;
                border-radius: 10px;
                overflow-y: auto;
                &:hover::-webkit-scrollbar {
                    width: 6px;
                }

                .chat-item {
                    margin-bottom: 20px;
                    width: 100%;
                    border-bottom: 1px solid #eeeeee;
                    .chat-item-header {
                        padding: 10px;
                        display: flex;
                        justify-content: space-between;
                        align-items: center;
                        width: 100%;
                        .user-info {
                            display: flex;
                            align-items: center;
                            img,
                            .base-logo {
                                width: 30px;
                                height: 30px;
                                border-radius: 50%;
                            }

                            .nick-name {
                                margin-left: 10px;
                            }
                        }

                        .create-time {
                            user-select: none;
                        }
                    }
                    .chat-item-content {
                        padding: 10px;
                    }
                }
            }

            .reply-input {
                margin: 0 auto;
                width: 80%;
                height: 242px;

                .reply-input-button {
                    display: flex;
                    align-items: center;
                    width: 100%;
                    height: 48px;
                    background: #fafafa;
                    border-radius: 10px;
                    cursor: pointer;

                    &.disabled {
                        cursor: no-drop;
                    }

                    .placeholder {
                        flex: 1;
                        padding-left: 22px;
                        font-size: 14px;
                        font-weight: 400;
                        color: #949496;
                    }

                    .base-icon {
                        margin-right: 12px;
                        font-size: 26px;
                    }
                }
                .rich-text-editor {
                    width: 100%;
                }

                .file-list {
                    position: relative;
                    display: flex;
                    align-items: center;
                    min-width: 160px;
                    height: 50px;
                    .file-item {
                        margin-right: 20px;
                        position: relative;
                        display: flex;

                        .file-name {
                            max-width: 160px;
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
                            width: 20px;
                            height: auto;
                        }
                    }
                }
            }
            .footer-button {
                margin: 0 auto;
                display: flex;
                justify-content: center;
                button {
                    margin: 0 10px;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    height: 44px;
                    font-size: 12px;
                    font-weight: 600;
                    border-radius: 22px;

                    &.update-state {
                        width: 140px;
                        color: #747477;
                        background: #ffffff;
                        border: 1px solid #949496;
                        &:hover {
                            background: #fafafa;
                        }
                    }

                    &.reply {
                        width: 126px;
                        color: #ffffff;
                        background: var(--mainColor);
                        &:hover {
                            background: var(--mainHoverColor);
                        }
                        &.disabled {
                            cursor: no-drop;
                        }
                    }
                }
            }
        }

        .work-order-loading {
            display: flex;
            width: 100%;
            height: 100%;

            img {
                margin: auto;
                width: 100px;
            }
        }
    }
}
</style>