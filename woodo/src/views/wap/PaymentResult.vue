<template>
    <div class="result_container">
        <img src="../../assets/common/images/image_load.gif" class="loading" v-show="!page_status" alt="" />
        <div class="result_success" v-if="page_status === 'success'">
            <div class="background"></div>
            <h1>恭喜您！支付成功！</h1>
            <a href="/mobile/home/" class="btn to_doc">返回文档中心</a>
        </div>
        <div class="result_error" v-else-if="page_status === 'error'">
            <div class="background"></div>
            <h1>抱歉~支付失败！</h1>
        </div>
    </div>
</template>

<script>
export default {
    name: 'WapPaymentResult',
    metaInfo () {
        return {
            title: '吾道' + this.title,
            meta: [{
                name: 'viewport',
                content: "width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0"
            }],
        }
    },
    data () {
        return {
            title: '',                      // 页面title
            page_status: '',                // 支付单页面状态
        }
    },
    mounted () {
        let that = this;
        let payment_sn = that.$route.query.sn;
        that.get_payment_status(payment_sn);
    },
    methods: {
        // 获取支付单状态
        get_payment_status (payment_sn) {
            let that = this;
            that.$pay.new.payment_result(payment_sn, {
                complete (result) {
                    that.page_status = result.type;
                    if (that.page_status === 'success') {
                        that.title = '-支付成功';
                    } else {
                        that.title = '-支付失败';
                    }
                },
                error () {
                    that.title = '-信息错误';
                    that.$toast('获取信息错误', 1000, 'wap');
                },
            });
        },
    },
}
</script>

<style lang="less" scoped>
@import url("../../assets/wap/css/common.css");
.result_container {
    position: relative;
    width: 100%;
    height: 100%;
    background-color: #f8fbff;
    .loading {
        position: absolute;
        top: 0;
        right: 0;
        bottom: 0;
        left: 0;
        margin: auto;
    }
    .background {
        position: absolute;
        top: 50%;
        left: 50%;
        margin: -10rem 0 0 -5rem;
        width: 10rem;
        height: 10rem;
        background-repeat: no-repeat;
        background-size: contain;
    }
    h1 {
        position: absolute;
        left: 0;
        right: 0;
        top: 50%;
        margin-top: 1rem;
        text-align: center;
        font-size: 0.9rem;
        color: #393939;
        font-weight: bold;
    }
    .btn {
        position: absolute;
        left: 0.85rem;
        right: 0.85rem;
        height: 2.4rem;
        line-height: 2.4rem;
        text-align: center;
        color: #fff;
        font-size: 0.75rem;
        border-radius: 0.07rem;
    }
    .to_doc {
        bottom: 4.1rem;
        background-color: #0d7bf8;
    }
}

.result_success {
    width: 100%;
    height: 100%;
    .background {
        background-image: url(../../assets/wap/images/order/payment_status_success.png);
    }
}

.result_error {
    width: 100%;
    height: 100%;
    .background {
        background-image: url(../../assets/wap/images/order/payment_status_error.png);
    }
}
</style>

