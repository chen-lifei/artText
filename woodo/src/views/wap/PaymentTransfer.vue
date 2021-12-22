<template>
    <div class="payment_transfer">
        <base-logo></base-logo>
        <div v-show="status === ''" class="loading">
            <img src="../../assets/wap/images/common/pay_loading.gif" alt=""/>
            <p>订单获取中...</p>
        </div>
        <div v-show="status !== ''" class="content">
            <p class="status">{{status_map[status] || '正在支付中'}}</p>
            <p class="order_sn">订单号：{{order_sn}}</p>
            <button v-show="status === 'error'" class="repay_btn" @click="create_payment(order_sn)">重新支付</button>
            <p class="tip">交易完成后将自动返回</p>
        </div>
    </div>      
</template>

<script>
export default {
    name: 'WapPaymentTransfer',
    metaInfo () {
        return {
            title: '支付中心-吾道',
            meta: [{
                name: 'viewport',
                content: "width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0"
            }],
        }
    },
    data () {
        return {
            //页面标题
            title: '支付中心-吾道',
            //订单编号
            order_sn : '',
            status_map : {
                'loading' : '正在支付中',
                'success' : '支付成功',
                'error' : '支付失败',
                'error_again' : '支付失败，请重新扫码',
            },
            //加载状态
            status : '',
            //订单状态
            order_status_flag : false,
            order_status_timer : null,
            //微信openid
            openid : null,
        }
    },
    mounted () {
        let that = this;
        that.wechat_empower().then(() => {
            let query = that.$route.query;
            //是否是订单支付
            if(query.sn){
                that.order_sn = query.sn;
                that.create_payment(query.sn);
                return;
            }
            that.create_order();
        });
    },
    methods: {
        create_order () {
            let that = this;
            let query = that.$route.query;
            let param = {
                orderType : query.orderType,
                memberId : query.memberId,
                productId : query.productId,
                productQuantity : query.productQuantity,
                time : query.time,
                sign : query.sign,
                deviceType : query.deviceType
            };
            that.$pay.new.create_order({
                param: param,
                success (order_sn) {
                    that.order_sn = order_sn;
                    that.create_payment(order_sn);
                },
                fail () {
                    that.$toast('创建订单失败', 800, "wap");
                },
                error () {
                    that.$toast('创建订单异常', 800, "wap");
                },
            });
        },
        create_payment(order_sn){
            let that = this;
            let param = { openid : that.openid };
            let dev = utils.deviceENV();
            if (dev.mobile && dev.wechat) {
                param['code'] = utils.getUrlQuery('code',window.location.href);
            }
            that.order_status(order_sn);
            that.$pay.new.payment(order_sn, {
                param : param,
                success (data) {
                    that.status = 'loading';
                },
                WXPaySuccess(data){
                    that.status = 'loading';
                    window.location.href = `/mobile/payment/result/?sn=${data.sn}`;
                },
                WXPayCancel(data){
                    that.status = 'error';
                    that.openid = data.openid;
                },
                fail (data) {
                    that.status = 'error_again';
                    that.$toast(data.flagMessage || data.content || '支付失败', 1000, 'wap');
                },
                error () {
                    that.status = 'error_again';
                    that.$toast('订单异常，请联系客服处理', 1000, 'wap');
                },
            });
        },
        order_status(order_sn){
            let that = this;
            that.order_status_flag = false;
            clearInterval(that.order_status_timer);
            that.order_status_timer = setInterval(function(){
                if(that.order_status_flag){
                    return;
                }
                that.order_status_flag = true;
                that.$pay.new.order_status(order_sn, {
                    success (data) {
                        that.status = 'success';
                        clearInterval(that.order_status_timer);
                    },
                    complete(){
                        that.order_status_flag = false;
                    }
                });
            },2000);
        },
        wechat_empower() {
            let that = this;
            return new Promise((resolve, reject) => {
                let dev = utils.deviceENV();
                if (dev.mobile && dev.wechat) {
                    let code = utils.getUrlQuery('code', window.location.href);
                    if (code) return resolve();//微信静默授权
                    this.$axios.get('/api/weixin/empower/', {
                        params: {
                            redirect_uri: window.location.pathname + window.location.search
                        }
                    }).then((result) => {
                        window.location.replace(result.data.data);
                    }).catch((err) => {
                        console.error(err);
                        that.$toast('授权失败，请扫码重试', 800);
                    });
                } else {
                    resolve();
                }
            });
        }
    },
}
</script>

<style lang="less" scoped>
@import url("../../assets/wap/css/common.css");
.payment_transfer{
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: column;
    .base-logo{
        width: 4rem;
        margin-top: 3.5rem;
    }
    .loading{
        width: 13.85rem;
        margin-top: 2.65rem;
        position: relative;
        img{
            width: 13.85rem;
            height: 7.8rem;
        }
        p{
            position: absolute;
            left: 5rem;
            top: 5.08rem;
            width: 3.8rem;
            height: 0.83rem;
            font-size: 0.6rem;
            color: #999999;
        }
    }
    .content{
        display: flex;
        justify-content: center;
        align-items: center;
        flex-direction: column;
        .status{
            height: 1.25rem;
            line-height: 1.25rem;
            margin: 1.15rem 0 0.25rem;
            text-align: center;
            font-size: 0.9rem;
            color: #333333;
        }
        .order_sn{
            height: 0.83rem;
            line-height: 0.83rem;
            font-size: 0.6rem;
            text-align: center;
            color: #999999;
        }
        .repay_btn{
            width: 6.5rem;
            height: 2.2rem;
            color: #ffffff;
	        font-size: 0.65rem;
            background-color: #0b7bf7;
            border-radius: 0.25rem;
            margin: 3.33rem 0 0;
        }
        .tip{
            height: 0.83rem;
            line-height: 0.83rem;
            text-align: center;
            font-size: 0.6rem;
            color: #cccccc;
            margin-top:0.68rem;
        }
    }
}
</style>

