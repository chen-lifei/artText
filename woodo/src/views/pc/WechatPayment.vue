<template>
    <div class="wechat_payment">
        <CommonHead :options="{theme:'white',shadow:true}"></CommonHead>
        <img src="../../assets/common/images/image_load.gif" class="loading" v-show="!data.type" alt="" />
        <div class="payment_container" v-if="data.type === 'weixin'">
            <div class="order_info">
                <p class="title">订单详情</p>
                <p class="product">{{data.orderName}}</p>
                <p class="payee">收款方：爆裂科技</p>
            </div>
            <div class="payment_info">
                <img src="../../assets/common/images/wechat_pay.png" width="342" height="76" alt="" />
                <p class="money" v-show="data.paymentAmount">应付金额： ￥<span>{{data.paymentAmount}}</span></p>
                <div class="payment_qrcode">
                    <canvas id="payment_qrcode"></canvas>
                </div>
                <p class="tip_scan">打开微信扫一扫付款</p>
            </div>
        </div>
        <transition name="fade">
            <div class="modal-backdrop" v-if="success_show">
                <div class="modal success">
                    <div class="modal-body">
                        <h2>支付成功，您支付的金额为{{data.paymentAmount}}元！</h2>
                        <p>商&emsp;&emsp;家：广州爆裂科技有限公司</p>
                        <p>订单编号：{{data.orderSn}}</p>
                        <p>{{success_location_time}}秒后跳转到订单页面</p>
                    </div>
                    <div class="modal-footer">
                        <a href="javascript:void(0);" class="button button-submit" @click="to_result">立即跳转</a>
                    </div>
                </div>
            </div>
        </transition>
    </div>
</template>

<script>
import Vue from 'vue'
import QRCode from 'qrcode';
import CommonHead from '@/components/nav/CommonHead.vue';
Vue.use(QRCode);
export default {
    name: 'WechatPayment',
    components: {
        CommonHead,
    },
    metaInfo: {
        title: '吾道-订单支付',
    },
    data () {
        return {
            data: {},                       // 订单数据
            success_show: false,            // 支付成功弹窗
            success_location_time: 3,       // 支付成功弹窗倒计时
        }
    },
    mounted () {
        let that = this;
        let order_sn = that.$route.params.id;
        if (!order_sn) {
            that.$toast('数据错误', 1000, function(){
                window.location.href = '/';
            });
            return;
        }
        that.create_payment(order_sn);
    },
    methods: {
        create_payment (order_sn) {
            let that = this;
            that.$pay.payment(order_sn, {
                success (data) {
                    that.data = data;
                    setTimeout(() => {
                        let $canvas = document.getElementById('payment_qrcode');
                        QRCode.toCanvas($canvas, data.code, { width: 214 });
                    }, 10);
                    that.payment_status(order_sn);
                },
                fail (data) {
                    that.$toast(data.content || '支付失败', 1000, ()=>{
                        that.to_result();
                    });
                },
                error () {
                    that.$toast('订单异常，请联系客服处理', 1000);
                },
            });
        },
        // 支付状态定时器检测
        payment_status (order_sn) {
            let that = this;
            that.$pay.order_status(order_sn, {
                success () {
                    that.payment_success();
                },
                complete () {
                    setTimeout(() => {
                        that.payment_status(order_sn);
                    }, 2000);
                },
            });
        },
        // 支付完成弹窗按钮立即跳转
        to_result () {
            if (this.data.paymentSn) {
                window.location.href = '/payment/result/?sn=' + this.data.paymentSn;
            } else {
                window.location.href = '/member/order/';
            }
        },
        // 付款成功弹窗
        payment_success () {
            let that = this;
            that.success_show = true;
            setInterval(() => {
                that.success_location_time--;
                if (that.success_location_time <= 0) {
                    that.to_result();
                }
            }, 1000);
        },
    },
}
</script>

<style lang="less" scoped>
@import url("../../assets/pc/css/common.css");
.payment_container {
    width: 1240px;
    padding-top: 40px;
    margin: 0 auto;
}
.loading {
    position: fixed;
    top: 50%;
    left: 50%;
    margin: -35px 0 0 -35px;
}
.order_info {
    line-height: 1;
    margin-bottom: 8px;
    font-size: 14px;
    &>p {
        display: inline-block;
        vertical-align: middle;
    }
    .title {
        color: #4b4b52;
        font-weight: bold;
        &::after{
            content: "";
            display: inline-block;
            vertical-align: top;
            width: 1px;
            height: 14px;
            margin: 0 30px;
            background-color: #c2cad0;
        }
    }
    .product {
        color: #61616a;
    }
    .payee {
        float: right;
        color: #a8a8af;
    }
}
.payment_info {
    position: relative;
    width: 1240px;
    height: 720px;
    padding-top: 32px;
	background-color: #ffffff;
    border-radius: 4px;
    &::before {
        content: "";
        position: absolute;
        top: 50%;
        left: 0;
        right: 0;
        bottom: 0;
        background-color: #1ec163;
    }
    &::after {
        content: "";
        position: absolute;
        bottom: 40px;
        left: 50%;
        margin-left: -350px;
        width: 700px;
        height: 160px;
        background: url(../../assets/common/images/wechat_payment_path.png) no-repeat center center;
    }
    &>img {
        display: block;
        margin: 0 auto 60px;
        user-select: none;
    }
    .money {
        line-height: 1.1;
        font-family: 'Arial';
        text-align: center;
        font-size: 16px;
        color: #81818e;
        span {
            font-size: 34px;
            color: #ff4343;
            font-weight: bold;
        }
    }
    .payment_qrcode {
        position: absolute;
        top: 50%;
        left: 50%;
        z-index: 1;
        margin: -110px 0 0 -110px;
        width: 220px;
        height: 220px;
        background-color: #ffffff;
        border-radius: 4px;
        border: solid 3px #1ec163;
    }
    .tip_scan {
        position: absolute;
        top: 50%;
        left: 0;
        right: 0;
        margin-top: 116px;
        text-align: center;
        font-size: 14px;
        color: #ffffff;
    }
}
</style>

<style lang="less">
/* 本页需单独背景*/
body {
    background-color: rgb(244,248,251);
}
/* 支付弹窗 - 以组件形式引入 */
.modal.success{
    width: 500px;
	height: 290px;
	background-color: #ffffff;
    border-radius: 4px;
    .modal-body {
        height: auto;
        padding: 50px 50px 0 120px;
        margin-bottom: 30px;
        background: url(../../assets/common/images/success.png) no-repeat 50px 50px;
        white-space: nowrap;
        h2 {
            line-height: 1.5;
            color: #1ec163;
        }
        p:last-of-type {
            margin-top: 20px;
            padding-top: 20px;
            border-top: 1px solid #ccc;
        }
    }
    .modal-footer {
        text-align: center;
        .button-submit {
            padding: 10px 32px;
            background-color: var(--mainColor);
        }
    }
}
</style>