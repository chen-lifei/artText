<template>
    <!-- 问题或建议反馈弹框 -->
    <transition name="modal-fade">
        <div class="error_feedback" v-if="show_error_feedback" @keydown.stop>
            <div class="masking_wrapper">
                <!-- 主要内容 -->
                <div class="modal-main">
                    <button class="close-button" @click="close()">
                        <base-icon class="icona-guanbi"></base-icon>
                    </button>
                    <service-panel work-order-type="BCFK" @submit-success="submitSuccess" @open-work-order="close()"></service-panel>
                </div>
            </div>
        </div>
    </transition>
</template>

<script>
import aliyun_log from '@/assets/common/js/aliyun_log.js'
import document_save from '@/assets/pc/js/document_save.js';
import servicePanel from '@/components/servicePanel.vue';

export default {
    components: {
        servicePanel
    },
    data() {
        return {
            user: {},
            // 报错反馈
            show_error_feedback: false,
        };
    },
    props: [
        'document_info',
        'page_info'
    ],
    mounted() {
        this.user = this.$common.get_login_state();
    },
    methods: {
        open(){
            this.show_error_feedback = true;
        },
        close() {
            this.show_error_feedback = false;
        },
        get_is_show() {
            return this.show_error_feedback;
        },
        // 提交报错反馈
        submitSuccess(data) {
            that.close();
            that.submit_error_feedback_for_aliyun_log(data);
        },
        // 提交报错反馈到阿里云日志
        submit_error_feedback_for_aliyun_log: function (work_order_id) {
            try {
                let that = this;
                let log = {
                    work_order_id: JSON.stringify(work_order_id),
                    member: JSON.stringify(that.user.id),
                    current_document_page: JSON.stringify({ document_info: that.document_info, page_info: that.page_info }),
                    current_document_opt_history: JSON.stringify(utils.deepClone(document_save.info.command_redo_history).reverse().slice(0, 10)),
                    console_error_msg: JSON.stringify(that.$error.get())
                };
                aliyun_log.push(log);
                if (typeof work_order_id === "undefined") {
                    that.$toast("报错信息提交成功", 2000);
                }
            } catch (e) {
                console.error(e);
            }
        }
    }
};
</script>

<style lang="less" scoped>
/* 问题或建议反馈弹框 */
.error_feedback {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 22;
    .masking_wrapper {
        position: absolute;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.55);

        .modal-main {
            position: absolute;
            left: 50%;
            top: 50%;
            transform: translate(-50%, -50%);

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
        }
    }
}
</style>