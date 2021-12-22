<template>
    <div :class="modalClass">
            <div class="modal_container" id="modal_container" :style="{'z-index': zIndex}" v-if="show_modal">
                <a class="modal-back" @click="close()"></a>
                <div class="recharge" :class="modalClass" v-show="!pay_success_info.status">
                    <div class="header">
                        <span class="title">充值幻币</span>
                        <!-- 幻币余额 -->
                        <div class="hcoin_account">
                            <img v-if="user.photo" v-lazy="user.photo" />
                            <base-logo v-else type="icon" theme="gray"></base-logo>
                            <span class="hcoin_info">幻币余额：<i>{{hcoin}}</i>幻币 <a href="https://www.woodo.cn/document/slides/1553258579/" target="_blank">?</a><i class="tips" v-show="Number(hcoin_use) > Number(hcoin)">你的余额不足，下载当前文档还需{{(Number(hcoin_use)*10-Number(hcoin)*10)/10}}个幻币，请充值或升级会员后继续</i></span>
                        </div>
                    </div>
                    <div class="body">
                        <!-- 充值金额 -->
                        <div class="recharge_amount">
                            <p>充值金额</p>
                            <ul>
                                <li v-for="item in amount_list" :key="item" :class="{check:pay_info.productQuantity == item}" @click="change_amount(item)"><i style="font-size:24px">￥</i>{{item}}元</li>
                            </ul>
                        </div>
                        <!-- 支付订单 -->
                        <div class="recharge_way">
                            <p>支付订单</p>
                            <div class="pay">
                                <div class="qrcode">
                                    <canvas id="qrcode_canvas"></canvas>
                                </div>
                                <div class="info">
                                    <div class="price">充值金额：<span><i>￥{{(pay_info.productQuantity).toFixed(2)}}</i></span></div>
                                    <div class="tips">
                                        <img src="../assets/common/images/ali_pay_icon.png" alt="">
                                        <img src="../assets/common/images/wechat.png" alt="">
                                        <span>使用支付宝/微信扫码付款</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <p class="line"></p>
                    <div class="footer">
                        <div class="tips">
                            <span>温馨提示: 幻币无使用期限，你可以用于下载模板、素材及导出在线文档；1幻币=1RMB，幻币可充值，不可用于购买会员。</span>
                        </div>
                    </div>
                </div>
                <div class="pay_success" v-show="pay_success_info.status">
                    <p class="title">恭喜您，充值幻币成功！</p>
                    <table class="pay_info">
                        <tbody>
                            <tr>
                                <td>商&nbsp;&nbsp;家：广州爆裂科技有限公司</td>
                                <td>订单编号：{{pay_success_info.sn}}</td>
                            </tr>
                            <tr>
                                <td>支付金额：￥{{Number(pay_success_info.amount).toFixed(2)}}元</td>
                                <td>支付平台：{{pay_success_info.paymentMethodName}}</td>
                            </tr>
                            <tr>
                                <td>下单时间：{{pay_success_info.createDate}}</td>
                                <td>商品名称：{{pay_success_info.name}}</td>
                            </tr>
                        </tbody>
                    </table>
                    <div class="go">
                        <span><CountDown v-if="pay_success_info.status" :maxCount="5" :stepTime="1000" @finish="close"></CountDown>s后自动关闭页面</span>
                        <a @click="close">立即关闭</a>
                    </div>
                    <p class="line"></p>
                    <div class="user">
                        <div class="info">
                            <img v-if="user.photo" v-lazy="user.photo" />
                            <base-logo v-else type="icon" theme="gray"></base-logo>
                            <div>
                                <p class="name">{{user.name}}</p>
                                <p class="id">用户ID: {{user.id}}</p>
                            </div>
                        </div>
                        <p class="back">返回<a href="/member/order/"><span>我的订单</span></a> | <a href="/home/">文档中心</a></p>
                    </div>
                </div>
            </div>
    </div>
</template>

<script>
    import Vue from 'vue';
    import QRCode from 'qrcode';
    import CountDown from '@/components/CountDown.vue'
    Vue.use(QRCode);
    export default {
        name: "HcoinRechargeModal",
        components: {
            CountDown
        },
        data(){
            return {
                show_modal: false,
                modalClass: 'hcoin_recharge_modal',
				zIndex: 900,
				closeCallback: null,
				openCallback: null,
                user: {},
                hcoin: '',
                hcoin_use:'',
                amount_list: [10, 20, 30, 50, 100],
                pay_info: {
                    productQuantity: 20,
                },
                pay_success_info: {},
                check_order_timer: null
            }
        },
        methods:{
            show () {
                this.show_modal = true;
                this.user = Object.assign(this.user, this.$common.get_login_state());
                this.create_order();
            },
            close () {
                this.show_modal = false;
            },
            change_amount (item) {
                if (!item) {
                    return;
                }
                this.pay_info.productQuantity = item;
                this.create_order();
            },
            // 创建订单
            create_order () {
                let that = this;
                let param = {
                    orderType: 'memberHcoinRecharge',
                    productQuantity: that.pay_info.productQuantity || 20,
                };
                // 订单创建
                that.$pay.new.get_order_qrcode({
                    param: param,
                    success (data) {
                        clearTimeout(that.check_order_timer);
                        that.create_qrcode(data);
                        that.check_order(data.sign);
                    },
                    fail () {
                        that.$toast('创建订单失败', 800);
                    },
                    error () {
                        that.$toast('创建订单异常', 800);
                    },
                });
            },
            // 检查二维码
            check_order (sign) {
                let that = this;            
                that.$pay.new.check_order_qrcode({
                    param:{ sign : sign},
                    success (data) {
                        data.createDate = utils.dateFormat(new Date(data.createDate), 'yyyy-MM-dd HH:mm:ss');
                        that.pay_success_info = data;
                        if (typeof that.submitCallback === 'function') {
                            that.submitCallback(that);
                        }
                    },
                    complete () {
                        if(!that.show_modal || that.pay_success_info.status){
                            return;
                        }
                        that.check_order_timer = setTimeout(function(){
                            that.check_order(sign);
                        },1000)
                    },
                });
            },
            // 生成二维码
            create_qrcode(data) {
                this.$nextTick(function(){
                    let qrcode_url = `${window.location.origin}/mobile/payment/transfer/?${$.param(data)}`
                    QRCode.toCanvas($('#qrcode_canvas')[0], qrcode_url, {
                        width: 183,
                        errorCorrectionLevel: 'Q',
                    }).catch((err) => {
                        console.error(err);
                    });
                });
            }
        }
    }
</script>

<style lang="less" scoped>
    @member_sp: url("../assets/pc/images/member/member_sp.png") no-repeat;
    .modal_container{
        z-index: 999;
        position:fixed;
        top:0;
        left:0;
        display: flex;
        justify-content: center;
        width:100%;
        height: 100%;
        min-width: 1240px;
        overflow-y: auto;
        text-align:center;
        background:#ffffff;
        .modal-back{
			position: absolute;
			top: 30px;
			left: 26px;
			display: inline-block;
			width: 16px;
			height: 28px;
			background: #ffffff url('../assets/common/images/back.png') center center;
			background-size: cover;
        }
        .recharge{
            display: flex;
            flex-direction:column;
            width: 85%;
            max-width: 1628px;
            padding: 30px 0;
            background-color: #ffffff;
            text-align: left;
        }
        .header{
            width: 100%;
            height: 124px;
            margin-bottom: 60px;
            .title{
                height: 32px;
                line-height: 32px;
                font-size: 24px;
                font-weight: bold;
                color: #333333;
            }
            .hcoin_account{
                display: flex;
                align-items: center;
                height: 70px;
                margin-top: 30px;
                img{
                    height: 58px;
                    width: 58px;
                    margin-right: 20px; 
                    border-radius: 50%;
                    overflow: hidden;
                }
                .hcoin_info{
                    position: relative;
                    display:inline-block;
                    height: 26px;
                    vertical-align: top;
                    font-weight: bold;
                    font-size: 20px;
                    color: #333333;
                    i{
                        color: #ff7272;
                    }
                    a{
                        display: inline-block;
                        width: 20px;
                        height: 20px;
                        line-height: 18px;
                        margin: -3px 0 0 4px;
                        vertical-align: middle;
                        font-size: 16px;
                        color: #0b7bf7;
                        text-align: center;
                        background-position: -26px -182px;
                        border-radius: 50%;
                        border: 1px  solid #0b7bf7;
                        &:hover{
                            opacity: .8;
                        }
                    }
                    .tips{
                        position: absolute;
                        top: -18px;
                        left: 256px;
                        width: 526px;
                        height: 70px;
                        line-height: 70px;
                        display: inline-block;
                        color: #333333;
                        background-color: #f5f5f5;
                        font-weight: normal;
                        border-radius: 10px;
                        font-size: 14px;
                        text-align: center;
                        &::before{
                            content: '';
                            position: absolute;
                            left: -26px;
                            top: 20px;
                            display: inline-block;
                            width: 0;
                            height: 0;
                            border: 13px solid transparent;
                            border-right-color: #f5f5f5;
                        }
                    }
                }
            }
        }
        .body{
            width: 100%;
            height: 586px;
            .recharge_amount{
                p{
                    height: 32px;
                    line-height: 32px;
                    margin-bottom: 30px;
                    font-size: 24px;
                    font-weight: bold;
                    color: #333333;
                }
                ul{
                    display: flex;
                    justify-content: space-between;
                }
                li{
                    display: inline-block;
                    width: 300px;
                    height: 160px;
                    line-height: 160px;
                    margin-left: 32px;
                    vertical-align: top;
                    background-color: #f5f5f5;
                    border-radius: 10px;
                    text-align: center;
                    font-size: 48px;
                    color: #333333;
                    cursor: pointer;
                    &:hover{
                        background-color: #0b7bf7;
                        color: #ffffff;
                    }
                    &.check{
                        background-color: #0b7bf7;
                        color: #ffffff;
                    }
                    &:first-child{
                        margin-left: 0;
                    }
                }
            }
            .recharge_way{
                margin-top: 60px;
                p{
                    height: 32px;
                    line-height: 32px;
                    margin-bottom: 30px;
                    font-size: 24px;
                    font-weight: bold;
                    color: #333333;
                }
                .pay{
                    display: flex;
                    align-items: center;
                    .qrcode{
                        display: flex;
                        justify-content: center;
                        align-items: center;
                        width: 224px;
                        height: 224px;
                        background: #ffffff url('../assets/common/images/qrcode_bg.png');
                        background-size: cover;
                        .qrcode_canvas{
                            width: 183px;
                            height: 185px;
                        }
                    }
                    .info{
                        height: 185px;
                        margin-left: 54px;
                        .price{
                            height: 83px;
                            line-height: 83px;
                            margin-bottom: 17px;
                            font-size: 28px;
                            font-weight: normal;
                            color: #000000;
                            i{
                                font-size: 60px;
                                color: #0b7bf7;
                                text-indent: 20px;
                            }
                        }
                        .tips{
                            display: flex;
                            align-items: center;
                            height: 48px;
                            line-height: 48px;
                            font-size: 16px;
                            color: #999999;
                            img{
                                display: inline-block;
                                width: 48px;
                                height: 48px;
                                margin-right: 10px;
                                border-radius: 50%;
                            }
                            span{
                                margin-left: 30px;
                                font-size: 16px;
                                font-weight: normal;
                                color: #999999;
                            }
                        }
                        p{
                            height: 32px;
                            line-height: 32px;
                            margin: 75px 0 0 30px;
                            font-size: 24px;
                            font-weight: bold;
                            color: #333333;
                        }
                    }
                }
                li {
                    position: relative;
                    display: inline-block;
                    width: auto;
                    height: 60px;
                    padding: 15px 20px 15px 12px;
                    margin-right: 30px;
                    vertical-align: top;
                    border-radius: 4px;
                    border: solid 1px #dcdcdc;
                    font-size: 12px;
                    cursor: pointer;
                    &::after {
                        content: "";
                        z-index: 1;
                        position: absolute;
                        top: 0;
                        left: 0;
                        right: 0;
                        bottom: 0;
                        opacity: 0;
                    }
                    &::before {
                        content: "";
                        display: inline-block;
                        vertical-align: middle;
                        width: 0;
                        height: 100%;
                    }
                    &:last-child {
                        margin-right: 0;
                    }
                    &:hover{
                        border-color: var(--mainColor);
                    }
                    &.check {
                        border-color: var(--mainColor);
                        transition: all 0.2s;
                        .radio_icon {
                            background: @member_sp -375px -6px;
                        }
                    }
                    .radio_icon {
                        display: inline-block;
                        vertical-align: middle;
                        width: 18px;
                        height: 18px;
                        margin-right: 15px;
                        background-color: #f0f0f0;
                        border-radius: 50%;
                    }
                    img {
                        display: inline-block;
                        vertical-align: middle;
                        width: auto;
                        height: 30px;
                    }
                }
            }
        }
        .line{
            width: 100%;
            height: 1px;
            margin: 60px 0 10px;
            border: 1px solid #eeeeee;
        }
        .footer{
            width: 100%;
            height: 60px;
            line-height: 60px;
            .tips{
                display: inline-block;
                vertical-align: top;
                width: 100%;
                p{
                    margin-bottom: 6px;
                    font-size: 34px;
                    color: #333333;
                }
                span{
                    font-size: 12px;
                    color: #868b95;
                }
            }
        }
        .pay_success{
            width: 85%;
            max-width: 1628px;
            padding: 85px 0 26px;
            text-align: left;
            .title{
                padding: 0 calc(11% + 140px);
                font-size: 44px;
                color: #333333;
                font-weight: bold;
            }
            .pay_info{
                width: 100%;
                height: 264px;
                margin: 60px 0 146px;
                padding: 0 11%;
                font-size: 16px;
                text-indent: 140px;
                tr{
                    height: 88px;
                }
                tr:nth-child(odd){
                    background-color: #fafafa;
                }
                tr:nth-child(even){
                    background-color: #ffffff;
                }
            }
            .go{
                display: flex;
                justify-content: space-between;
                height: 60px;
                line-height: 60px;
                padding: 0 calc(11% + 140px);
                font-size: 16px;
                span{
                    color: #666666;
                }
                a{
                    width: 200px;
                    height: 60px;
                    font-size: 16px;
                    color: #ffffff;
                    background-color: #0b7bf7;
                    border-radius: 10px;
                    text-align: center;
                }
            }
            .line{
                width: 100%;
                height: 1px;
                margin: 80px 0 28px;
                border: 1px solid #eeeeee;
            }
            .user{
                display: flex;
                justify-content: space-between;
                align-items: center;
                width: 100%;
                height:58px;
                .info{
                    display: flex;
                    img{
                        width: 58px;
                        height: 58px;
                        margin-right: 20px;
                        border-radius: 50%;
                    }
                    .name{
                        height: 28px;
                        margin-bottom: 2px;
                        font-size: 20px;
                        color: #333333;
                    }
                    .id{
                        height: 22px;
                        font-size: 16px;
                        color: #999999;
                    }
                }
                .back{
                    height: 21px;
                    font-size: 16px;
                    color: #999999;
                    a{
                        margin: 0 17px;
                        color: var(--mainColor);
                    }
                    & a:first-child{
                        margin-left: 0;
                    }
                }
            }
        }
    }
    @media screen and (max-width: 1920px) {
        .recharge,.pay_success{
            width: 90%;
        }
    }
</style>