<template>
    <div class="recharge_contain">
        <div class="contain_header">
            <div class="member_head">
                <img :src="user_info.headUrl"/>
            </div>
            <p class="hcoin_total">幻币余额：<span>{{ user_info.hcoin }}</span>幻币
                <a href="/mobile/hcoin/special/">?</a>
            </p>
        </div>
        <div class="contain_body">
            <div class="price_content">
                <h3>充值金额</h3>
                <div class="price_list">
                    <button class="price_card" 
                        :class="{'checked': item === pay_info.total}"
                        v-for="(item, index) in price_list" 
                        :key="index"
                        @click="select_pay_total(item)">
                        ￥{{item}}元
                    </button>    
                </div>
            </div>
            <div class="pay_content">
                <h3>支付方式</h3>
                <div class="pay_way" 
                    :class="{'checked': item.type === pay_info.type}"
                    v-for="(item, index) in woodo_pay" 
                    v-show="item.isshow"
                    :key="index"
                    @click="select_pay_type(item.type)">
                    <img :src="item.image" alt="" />
                    <span>{{ item.name }}</span>
                    <button class="choose_btn"></button>
                </div>
            </div>
        </div>
        <div class="contain_footer">
            <h3>温馨提示</h3>
            <p class="tip">幻币无使用期限，你可以用于下载模板、素材及导出在线文档；1幻币=1RMB，幻币可充值，不可用于购买会员。</p>
            <div class="opreate">
                <a class="cancel" href="javascript:void(0)" @click="back">取消</a>
                <a class="submit" @click="create_order">立即支付{{ pay_info.total }}元</a>
            </div>
        </div>
    </div>
</template>

<script>
export default {
    name: 'HcoinRecharge',
    metaInfo: {
        title: '吾道-充值幻币',
        meta: [
            {
                name: 'viewport',
                content: "width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0"
            },
            {
                property: 'og:title',
                content: '吾道-充值幻币'
            },
            {
                property: 'og:url',
                content: 'https://www.woodo.cn/mobile/member/recharge/'
            },
        ]
    },
    data(){
        return{
            user_info: {},
            price_list: [10, 30, 50, 100],           // 充值金额列表
            woodo_pay: [
                {
                    type: 'weixinPayPlugin',
                    name: '微信支付',
                    isshow: true,
                    image: require(`../../assets/common/images/wechat_pay_icon.png`),
                },
                {
                    type: 'alipayDirectPlugin',
                    name: '支付宝',
                    isshow: true,
                    image: require(`../../assets/common/images/ali_pay_icon.png`),
                }
            ],
            pay_info: {
                type: '',
                total: 10
            },                                      // 选中充值金额和支付方式
            creating: false,                        // 订单创建中
        }
    },
    mounted() {
        let that = this;
        // 获取用户信息
        that.get_user_info();
        // 获取支付环境
        that.get_payment_evn();
    },
    methods: {
        // 获取用户信息
        get_user_info:function(){
            let that = this;
            that.$axios.get("/api/member/information/").then(function(data){
                if(data.data.code === '2'){
                    that.user_info = $.extend(data.data.data, that.user_info);
                }
            });
        },
        // 获取支付环境  微信浏览器不可使用支付宝支付   支付宝浏览器不可使用微信支付
        get_payment_evn () {
            let that = this;
            let is_wechat_evn = utils.deviceENV().wechat;
            // 非微信环境不支持微信支付，微信环境不支持支付宝支付
            let alipay = that.woodo_pay.find(item => item.type === 'alipayDirectPlugin');
            let wxpay = that.woodo_pay.find(item => item.type === 'weixinPayPlugin');
            if (is_wechat_evn) {
                alipay.isshow = false;
            } else {
                wxpay.isshow = false;
            }
            // 初始化支付方式
            for (let i = 0; i < that.woodo_pay.length; i++) {
                let item = that.woodo_pay[i];
                if (item.isshow) {
                    that.select_pay_type(item.type);
                    break;
                }
            }
        },
        // 选择支付类型
        select_pay_type(type) {
            let that = this;
            if (!type) {
                return;
            }
            that.pay_info.type = type;
        },
        // 选择支付金额
        select_pay_total(total) {
            let that = this;
            if(!total) {
                return;
            }
            that.pay_info.total = total;
        },
        // 创建订单
        create_order () {
            let that = this;
            let param = {
                pluginId: that.pay_info.type,
                productQuantity: that.pay_info.total
            };
            that.creating = true;
            that.$pay.create_hcoin_order({
                param: param,
                success (order_sn) {
                    that.payment(order_sn);
                },
                fail () {
                    that.creating = false;
                    that.$toast('创建订单失败', 1000, 'wap');
                },
                error () {
                    that.creating = false;
                    that.$toast('创建订单异常', 1000, 'wap');
                },
            });
        },
        // 支付提交
        payment (order_sn) {
            window.location.href = `/mobile/payment/transfer/?sn=${order_sn}`;
        },
        back(){
            window.history.length > 1 ? window.history.go(-1) : window.location.herf="/mobile/home/";
        }
    },
}
</script>

<style lang="less" scoped>
    @import url("../../assets/wap/css/common.css");
    .recharge_contain{
        width: 100%;
        height: 100%;
        padding: .7rem .85rem 1.7rem;
        background: #e7edf5;
    }
    .contain_header{
        width: 100%;
        height: 5.25rem;
        padding: .7rem 0;
        margin-bottom: 1.3rem;
        background-color: #ffffff;
        box-shadow: 0rem 0.25rem 0.45rem 0rem rgba(50, 57, 69, 0.07);
        border: solid 0.05rem #e6e6e6;
        border-radius: 0.52rem;
        text-align: center;
        .member_head{
            display: inline-block;
            width: 2.5rem;
	        height: 2.5rem;
            margin-bottom: .4rem;
            border-radius: 50%;
            background-color: #ffffff;
            overflow: hidden;
            img{
                display: block;
                width: 100%;
                object-fit: contain;
            }
        }
        .hcoin_total{
            font-size: 0.52rem;
            color: #3c3c3c;
            span{
                margin-right: .15rem;
                color: #ff3434;
                font-weight: bold;
            }
            a{
                display: inline-block;
                width: 0.6rem;
                height: 0.6rem;
                margin-left: 0.15rem;
                color: #ffffff;
                background-color: #c9c9c9;
                text-align: center;
                border-radius: 50%;
            }
        }
    }
    h3{
        height: 1.25rem;
        line-height: 0.85rem;
        color: #3c3c3c;
        font-size: 0.63rem;
        font-weight: bold;
    }
    .price_content{
        margin-bottom: 1.8rem;
        .price_list{
            display: flex;
            justify-content: space-between;
            flex-wrap: wrap;
            width: 100%;
            .price_card{
                width: calc(25.5% - 0.4rem);
                height: 3rem;
                line-height: 3rem;
                background: #ffffff;
                border: solid 0.1rem #ffffff;
                border-radius: 0.17rem;
                text-align: center;
                color: #171b1f;
                font-size: 0.63rem;
                font-weight: bold;
                transition: all .3s;
                &.checked{
                    border-color: var(--mainColor);
                    color: var(--mainColor);
                }
            }
        }
    }
    .pay_content{
        h3{
            line-height: 1.45rem;
            border-bottom:solid 0.05rem #ccd3dc;
            margin-bottom: 1.1rem;
        }
        .pay_way{
            position: relative;
            height:1.3rem;
            line-height: 1.3rem;
            margin-bottom: 1.05rem;
            transition: all .3s;
            img{
                display: inline-block;
                vertical-align: middle;
                height: 1.3rem;
                width: auto;
                margin-right: 0.5rem;
                border-radius: 50%;
            }
            span{
                color: #393939;
                font-size: 0.8rem;
                font-weight: 500;
            }
            button{
                position: absolute;
                right: 0;
                width: 1.2rem;
                height: 1.2rem;
                background-color: #ffffff;
                border: solid 0.05rem #c9c9c9;
                border-radius: 50%;
            }
            &.checked button{
                background: url('../../assets/wap/images/shareworks/success_icon_02.png') no-repeat;
                background-size: contain;
                border: none;
            }
        }
    }
    .contain_footer{
        position: fixed;
        bottom: 1.7rem;
        left: 0;
        padding: 0 0.85rem;
        h3{
            height: 1.2rem;
            line-height: 1.2rem;
        }
        .tip{
            margin-bottom: 2.05rem;
            color: #626262;
            font-size: 0.63rem;
        }
        .opreate{
            display: flex;
            justify-content: space-between;
            a{
                display: inline-block;
                width: calc(50% - 0.4rem);
                line-height: 2.65rem;
                border-radius: 0.14rem;
                color: #ffffff;
                font-size: 0.73rem;
                font-weight: bold;
                text-align: center;
            }
            .cancel{
                background-color: #ccd6e2;
            }
            .submit{
                background-color: var(--mainColor);
            }
        }
    }
    @media screen and (max-height: 600px) {
        .recharge_contain{
            height: auto;
        }
        .contain_footer{
            position: relative;
            bottom: 0;
            padding: 2rem 0 0;
        }
    }
</style>