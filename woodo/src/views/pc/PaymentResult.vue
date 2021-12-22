<template>
    <div class="result_container">
        <CommonHead :options="{theme:'white',shadow:true}"></CommonHead>
        <img src="../../assets/common/images/image_load.gif" class="loading" v-show="!page_status" alt="" />
        <div class="result_success" v-if="page_status === 'success'">
            <div class="title">
                <h1>恭喜您的订单支付成功！</h1>
                <p>吾道提醒您：<span>如果遇到支付及文档问题，请您联系吾道客服解决</span></p>
            </div>
            <ul class="result_list">
                <li>
                    <span>支付金额：</span>
                    <span><strong>￥{{data.amount}}</strong>元</span>
                </li>
                <li>
                    <span>支付平台：</span>
                    <span>{{data.paymentMethodName}}</span>
                </li>
                <li>
                    <span>订单编号：</span>
                    <span>{{data.orderSn}}</span>
                </li>
                <li>
                    <span>商品名称：</span>
                    <span>{{data.orderSnName}}</span>
                </li>
                <li>
                    <span>下单时间：</span>
                    <span>{{data.orderCreateDate}}</span>
                </li>
                <li></li>
            </ul>
            <div class="opeartion">
                <span>返回</span>
                <a href="/member/order/">我的订单</a> |
                <a href="/">吾道首页</a> |
                <a href="/home/">个人中心</a>
            </div>
            <p class="back_tips">请回到支付前页面，点击支付完成</p>
        </div>
        <div class="result_error" v-else-if="page_status === 'error'">
            <div class="title">
                <h1>对不起，您的订单支付失败！</h1>
                <p>吾道提醒您：<span>如果遇到支付及文档问题，请您联系吾道客服解决</span></p>
            </div>
            <div class="opeartion">
                <span>返回</span>
                <a href="/member/order/">我的订单</a> |
                <a href="/">吾道首页</a> |
                <a href="/home/">个人中心</a>
            </div>
        </div>
    </div>
</template>

<script>
import CommonHead from '@/components/nav/CommonHead.vue';
export default {
    name: 'PaymentResult',
    components: { CommonHead },
    metaInfo () {
        return {
            title: '吾道' + this.title,
        }
    },
    data () {
        return {
            title: '',                      // 页面title
            page_status: '',                // 支付单页面状态
            data: {},                       // 支付单数据
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
            that.$pay.payment_result(payment_sn, {
                complete (result) {
                    that.page_status = result.type;
                    if (that.page_status === 'success') {
                        let data = result.data;
                        that.data = data;
                        that.data.orderCreateDate = utils.dateFormat(new Date(that.data.orderCreateDate), 'yyyy-MM-dd HH:mm:ss');
                        that.title = '-支付成功';
                    } else {
                        that.title = '-支付失败';
                    }
                },
                error () {
                    that.title = '-信息错误';
                    that.$toast('获取信息错误，请稍后到订单页查看结果', 1000, ()=>{
                        window.location.href = '/member/order/';
                    });
                },
            });
        },
    },
}
</script>

<style lang="less" scoped>
@import url("../../assets/pc/css/common.css");
.result_container {
    position: relative;
    width: 100%;
    height: 100%;
}
.loading {
    position: fixed;
    top: 50%;
    left: 50%;
    margin: -35px 0 0 -35px;
}
.result_success,
.result_error {
    position: absolute;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    width: 1080px;
    height: 560px;
    padding: 100px 440px 60px 100px;
    margin: auto;
    background: url(../../assets/common/images/bg_1.png) no-repeat center center;
    .title {
        padding-bottom: 15px;
        margin-bottom: 30px;
        border-bottom: 1px solid #ececec;
        white-space: nowrap;
        h1 {
            line-height: 1.5;
            font-size: 30px;
            color: #252525;
        }
        p {
            font-size: 12px;
            color: #252525;
            span {
                color: #9b9b9b;
            }
        }
    }
    .result_list {
        margin-bottom: 50px;
        &::after {
            content: "";
            display: block;
            height: 0;
            width: 0;
            clear: both;
        }
        li {
            float: left;
            width: 50%;
            height: 38px;
            line-height: 44px;
            border-bottom: 1px solid #ececec;
            font-size: 14px;
            white-space: nowrap;
        }
        strong {
            font-size: 16px;
            font-family: 'Arial';
            color: #ff4343;
        }
    }
    .opeartion {
        font-size: 14px;
        color: #848484;
        a {
            color: #0d7bf8;
            &:hover {
                text-decoration: underline;
            }
        }
    }
}
.result_success{
    .title {
        padding-left: 60px;
        padding-bottom: 15px;
        margin-bottom: 30px;
        border-bottom: 1px solid #ececec;
        background: url(../../assets/common/images/success.png) no-repeat left 8px;
        h1 {
            color: #1ec163;
        }
    }
    .opeartion{
        margin-bottom:20px;
    }
}
</style>

