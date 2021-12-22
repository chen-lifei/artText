<template>
        <div v-if="!isComponent ? true : show_modal" class="member_upgrade_container" :style="{'z-index': zIndex}" :class="{'member_grade_modal':isComponent}">
            <div class="member_upgrade">
                <a class="back" :style="{'top':!isComponent?'90px':'30px'}" @click="close" v-show="(isComponent && current_step=='one') || current_step=='two'"></a>
                <h1 class="headline" v-show="current_step=='one'">选择合适的会员方案</h1>
                <ul class="step">
                    <li>选择会员方案</li>
                    <li>确认并付款</li>
                    <li>付款结果</li>
                </ul>
                <div class="step_line" :class="current_step">
                    <div class="progress"></div><i class="dot"></i>
                </div>
                <div class="step_one" id="step_one" v-show="current_step=='one'">
                    <ul class="options" v-if="personal.list.length>0">
                        <li v-for="(item,index) in personal.list" :key="index" @click="change_product(item)" :class="{'active':(!current_product.id && index == 0) || (item.id==current_product.id)}">
                            <span class="tip" v-if="item.markerDesc">{{item.markerDesc}}</span>
                            <div class="content">
                                <span class="time">{{item.timeTypeDesc}}</span>
                                <span class="discount_price">￥{{item.discountPrice}}</span>
                                <span :style="{visibility: item.discountPrice === item.price ? 'hidden' : 'visible'}" class="original_price">原价{{item.price}}元</span>
                                <span v-if="item.promoteSaleCount" class="promote_sale_count">限量99个/天（剩余<CountDown :maxCount="item.promoteSaleCount" :stepTime="20 * 60 * 1000"></CountDown>个）</span>
                            </div>
                            <div class="bottom" :class="{'promote_sale':item.promoteSaleTime}">
                                <button class="buy_btn" @click="to_buy(item)">立即购买</button>
                                <p v-if="!item.promoteSaleTime" class="info">{{item.subDesc}}</p>
                                <p v-if="item.promoteSaleTime" class="info timedown">距今天活动结束仅剩 <TimeDown :endTime="item.promoteSaleTime"></TimeDown></p>
                            </div>
                        </li>
                    </ul>
                    <div class="power">
                        <div class="top">
                            <p class="title">会员权限<span>/全站资源免费下载</span></p> <a class="more" @click="show_more_power"><span class="show" v-show="!more_power">展示更多 <i></i></span><span v-show="more_power">收起</span></a>
                        </div>
                        <p class="line"></p>
                        <ul class="power_items">
                            <li><span class="left"><i></i>创建文档数量</span><span class="right">不限</span></li>
                            <li><span class="left"><i></i>文档页数</span><span class="right">100页</span></li>
                            <li><span class="left"><i></i>文档下载</span><span class="right">不限</span></li>
                            <li><span class="left"><i></i>素材下载</span><span class="right">不限</span></li>
                            <li><span class="left"><i></i>模板库</span><span class="right">所有模板</span></li>
                            <li><span class="left"><i></i>图示库</span><span class="right"><i class="check"></i></span></li>
                            <li><span class="left"><i></i>案例库</span><span class="right"><i class="check"></i></span></li>
                            <li><span class="left"><i></i>共享作品下载</span><span class="right"><i class="check"></i></span></li>
                        </ul>
                        <ul class="more_power power_items" v-show="more_power">
                            <li><span class="left"><i></i>文件导入功能</span><span class="right"><i class="check"></i></span></li>
                            <li><span class="left"><i></i>单文档协作成员</span><span class="right">不限</span></li>
                            <li><span class="left"><i></i>单文档同时可查看人数</span><span class="right">不限</span></li>
                            <li><span class="left"><i></i>单图片上传体积</span><span class="right">50MB</span></li>
                            <li><span class="left"><i></i>图片存储空间</span><span class="right">10GB</span></li>
                            <li><span class="left"><i></i>评论功能</span><span class="right"><i class="check"></i></span></li>
                            <li><span class="left"><i></i>会员专属标识</span><span class="right"><i class="check"></i></span></li>
                            <li><span class="left"><i></i>回收站保留期</span><span class="right">30天</span></li>
                        </ul>
                    </div>
                    <div class="question">
                        <div class="top">
                            <p class="title">常见问题<span>/更多问题请查看更多 </span></p> <a class="more" href="/help/" target="_blank">查看更多 <i></i></a>
                        </div>
                        <p class="line"></p>
                        <ul class="question_items">
                            <li>
                                <a class="top" @click="toggle_answer($event)">会员时间如何计算？</a>
                                <p class="describe">
                                    会员有效期自付费成功之日起的自然时间段来计算，如购买一个月会员，即付费日期后的一个月内均可享受会员服务
                                </p>
                            </li>
                            <li>
                                <a class="top" @click="toggle_answer($event)">如何查看账号会员类型和到期时间？</a>
                                <p class="describe">
                                    在个人中心的右上角点击头像即可查看会员类型和到期时间 
                                </p>
                            </li>                      
                            <li>
                                <a class="top" @click="toggle_answer($event)">如何开具发票？</a>
                                <p class="describe">
                                    请在个人中心-我的订单提交开票信息
                                </p>
                            </li> 
                        </ul>
                    </div>
                </div>
                <div class="step_two" id="step_two" v-show="current_step=='two'">
                    <div class="options">
                        <p class="title">开通时长</p>
                        <ul v-if="personal.list.length>0">
                            <li v-for="(item,index) in personal.list" :key="index" :class="{'active':item.id==current_product.id,'disable':item.id != current_product.id}">
                                <span class="tip" v-if="item.markerDesc">{{item.markerDesc}}</span>
                                <div class="content">{{item.timeTypeDesc}}</div>
                                <div v-if="!item.promoteSaleTime" class="info">{{item.subDesc}}</div>
                                <div v-if="item.promoteSaleTime" class="info timedown">距今天活动结束仅剩 <TimeDown :endTime="item.promoteSaleTime"></TimeDown></div>
                            </li>
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
                                <div class="price">充值金额：<span><i>￥{{Number(current_product.discountPrice).toFixed(2)}}</i></span></div>
                                <div class="tips">
                                    <img src="../assets/common/images/ali_pay_icon.png" alt="">
                                    <img src="../assets/common/images/wechat.png" alt="">
                                    <span>使用支付宝/微信扫码付款</span>
                                </div>
                            </div>
                        </div>
                    </div>
                    <p class="line"></p>
                    <div class="user">
                        <div class="info">
                            <img :src="user.photo" alt="" />
                            <div>
                                <p class="name">{{user.name}}</p>
                                <p class="id">用户ID: {{user.id}}</p>
                            </div>
                        </div>
                        <span class="protocol">支付即代表你同意<a href="/agreement/" target="_blank">《吾道会员用户协议》</a></span>
                    </div>
                </div>
                <div class="step_three" v-show="pay_success_info.status">
                    <p class="title">恭喜您，订单支付成功！</p>
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
                        <span><CountDown v-if="pay_success_info.status" :maxCount="5" @finish="close"></CountDown>s后自动刷新会员页面</span>
                        <a href="/home/">立即跳转</a>
                    </div>
                    <p class="line"></p>
                    <div class="user">
                        <div class="info">
                            <img :src="user.photo" alt="" />
                            <div>
                                <p class="name">{{user.name}}</p>
                                <p class="id">用户ID: {{user.id}}</p>
                            </div>
                        </div>
                        <p class="link">返回<a href="/member/order/"><span>我的订单</span></a> | <a href="/home/">文档中心</a></p>
                    </div>
                </div>
            </div>
        </div>
</template>

<script>
import Vue from 'vue';
import axios from 'axios';
import QRCode from 'qrcode';
import CountDown from '@/components/CountDown.vue';
import TimeDown from '@/components/TimeDown.vue';
Vue.use(QRCode);

export default {
    name: 'MemberGrade',
    components: {
        CountDown,
        TimeDown,
    },
    data(){
        return {
            modalClass: 'member_upgrade_container',
            zIndex: 900,
            // 是否是以组件载入页面
            isComponent: !this.$parent,
            // 展示弹框
            show_modal: false,
            // 弹框步骤
            current_step: 'one',
            // 会员权限-展示更多
            more_power: false,
            // 登陆用户信息
            user: {},
            // 高频操作节流防抖
            debounce: null,
            // 中断axios请求方法                     
            cancel_axios: function () {},
            // 准备升级的类型     
            ready_upgrade_type: '',             
            // 个人版会员
            personal: {
                isUpVip: false,
                rankType: 'personal',
                rankTypeDesc: '个人版',
                minUnitPirce: 129,
                list: [
                    {
                        id: 14,
                        isUpVip: false,
                        buyMinQuantity: 1,
                        buyMaxQuantity: 1,
                        rankType: 'personal',
                        rankTypeDesc: '个人版',
                        timeUnit: 'year',
                        timeValue: 2,
                        timeTypeDesc: '24+送12个月',
                        discount: 1,
                        price: 920,
                        discountPrice: 249,
                        markerDesc: '限时特惠',
                        subDesc: '距今天活动结束仅剩 00:00:00',
                    },
                    {
                        id: 2,
                        isUpVip: false,
                        buyMinQuantity: 1,
                        buyMaxQuantity: 1,
                        rankType: 'personal',
                        rankTypeDesc: '个人版',
                        timeUnit: 'year',
                        timeValue: 1,
                        timeTypeDesc: '12个月',
                        discount: 1,
                        price: 460,
                        discountPrice: 129,
                        markerDesc: '超值推荐',
                        subDesc: '低至￥10.75/月 仅￥0.35/天',
                    }, {
                        id: 3,
                        isUpVip: false,
                        buyMinQuantity: 1,
                        buyMaxQuantity: 1,
                        rankType: 'personal',
                        rankTypeDesc: '个人版',
                        timeUnit: 'month',
                        timeValue: 6,
                        timeTypeDesc: '6个月',
                        discount: 1,
                        price: 235,
                        discountPrice: 99,
                        markerDesc: '',
                        subDesc: '每月仅需16.5元',
                    }, 
                    {
                        id: 15,
                        isUpVip: false,
                        buyMinQuantity: 1,
                        buyMaxQuantity: 1,
                        rankType: 'personal',
                        rankTypeDesc: '个人版',
                        timeUnit: 'month',
                        timeValue: 3,
                        timeTypeDesc: '3个月',
                        discount: 1,
                        price: 120,
                        discountPrice: 59,
                        markerDesc: '',
                        subDesc: '全站资源免费下载',
                    },
                    {
                        id: 5,
                        isUpVip: false,
                        buyMinQuantity: 1,
                        buyMaxQuantity: 1,
                        rankType: 'personal',
                        rankTypeDesc: '个人版',
                        timeUnit: 'month',
                        timeValue: 1,
                        timeTypeDesc: '1个月',
                        discount: 1,
                        price: 39,
                        discountPrice: 39,
                        markerDesc: '',
                        subDesc: '',
                    }
                ],
            },
            // 当前商品
            current_product: {},
            // 支付成功信息
            pay_success_info:{},
            // 检查订单定时器
            check_order_timer:null
        }
    },
    mounted(){
        let that = this;
        // 用户信息
        that.user = that.$common.get_login_state();
        // 会员等级商品信息
        that.get_grade_info();
    },
    methods:{
        show() {
            let that = this;
            if (!that.user.login) {
                location.href = "/member/upgrade/";
                return;
            }
            if(that.isComponent) {
                $('body').css('overflow','hidden');
            }
            that.show_modal = true;
        },
        close() {
            let that = this;
            if(that.current_step === 'one'  || that.current_step === 'three'){
                if(that.isComponent){
                    $('body').css('overflow','');
                    if (!that.pay_success_info.sn && typeof that.closeCallback === 'function') {
                        that.closeCallback();
                    }
                    that.show_modal = false;
                }else{
                    window.location.href = '/home/';
                }
            }else{
                that.current_step = 'one';
                that.current_product = {};
                that.$nextTick(function(){
                    that.scroll_top();
                });
            }
        },
        // 获取会员等级商品信息
        get_grade_info() {
            let that = this;
            if (!that.user.login) {
                return;
            }
            that.$axios.get('/api/member/up_vip/').then(res => {
                let res_data = res.data;
                if (res_data.type !== 'success') {
                    return that.$toast('获取会员信息失败！');
                }
                let data = res_data.data;
                // 个人版会员数据处理
                that.personal_format(data.personal);
                // 升级个人版
                that.upgrade('personal');
                that.get_create_order_info();
            }).catch(err => {
                console.error(err);
                return that.$toast('获取会员信息失败！');
            });
        },
        // 升级
        upgrade(type) {
            let that = this;
            if (!that.user.login) {
                return;
            }
            let rank = that[type];
            if (!rank || !rank.isUpVip) {
                return;
            }
            that.ready_upgrade_type = rank.rankType;
        },
        // 获取订单价格信息
        get_create_order_info() {
            let that = this;
            that.ordergeting = true;
            clearTimeout(that.debounce);
            // 获取当前商品类所有商品id
            let pids;
            let quantity;
            let upgrade_type = that[that.ready_upgrade_type];
            if (upgrade_type && upgrade_type.list) {
                pids = upgrade_type.list.map(item => item.id).join();
                quantity = upgrade_type.list[0].buyMinQuantity;
            }
            if (!pids || !quantity) {
                return;
            }
            that.debounce = setTimeout(() => {
                // 中断前一次未响应请求
                that.cancel_axios();
                that.cancel_axios = function () {};
                let CancelToken = axios.CancelToken;
                that.$axios.get('/api/member/order/get_create_vip_order_info/', {
                    params: {
                        productIds: pids,
                        productQuantity: quantity,
                    },
                    cancelToken: new CancelToken(c => that.cancel_axios = c),
                }).then(res => {
                    let res_data = res.data;
                    if (res_data.type !== 'success') {
                        return that.$toast('获取商品价格失败！');
                    }
                    that.ordergeting = false;
                    let data = res_data.data;
                    // 更新商品折扣信息
                    that.update_product(data.products);
                }).catch(err => {
                    console.error(err);
                });
            }, 300);
        },
        // 金额计算接口更新商品数据
        update_product(data = []) {
            let that = this;
            let upgrade_type = that[that.ready_upgrade_type];
            if (upgrade_type && upgrade_type.list) {
                let product_list = upgrade_type.list;
                data.forEach(item => {
                    let pid = item.buyVipProduct;
                    // 查找对应的商品，更新折扣数据
                    let product = product_list.find(item => item.id === pid);
                    // 折扣信息
                    let discount = Number((item.buyVipDiscountPrice / item.buyVipPrice).toFixed(2));
                    let price = item.buyVipPrice / item.buyVipQuantity;
                    let discount_price = item.buyVipDiscountPrice / item.buyVipQuantity;
                    product.discount = discount;
                    product.price = Math.ceil(price);
                    product.discountPrice = Math.ceil(discount_price);

                    let relative_month;
                    let relative_day;
                    switch (product.timeUnit) {
                        case 'year':
                            relative_month = product.timeValue * 12;
                            relative_day = product.timeValue * 365;
                            break;
                        case 'month':
                            relative_month = product.timeValue;
                            relative_day = product.timeValue * 30;
                            break;
                        case 'day':
                            relative_month = Math.round(product.timeValue / 30);
                            relative_day = product.timeValue;
                            break;
                    }
                    if(relative_month >= 12){
                        product.markerDesc = '超值推荐';
                        product.subDesc = `低至￥${Number((product.discountPrice / relative_month).toFixed(2))}/月  仅￥${Number((product.discountPrice / relative_day).toFixed(2))}/天`;
                    }else if(relative_month !== 3 && relative_month !== 1){
                        product.markerDesc = '';
                        product.subDesc = `每月仅需${Number((product.discountPrice/relative_month).toFixed(2))}元`;
                    }else if(relative_month === 3){
                        product.markerDesc = '';
                        product.subDesc = '全站资源免费下载';
                    }
                    if(product.promoteSaleTime){
                        product.markerDesc = '限时特惠';
                    }
                });
            }
        },
        // 个人版会员数据处理
        personal_format(data = []) {
            let that = this;
            let personal_list = data.insertSort((a, b) => b.price - a.price);
            personal_list.forEach((item,index) => {
                let default_item = that.personal.list[index];
                if(default_item){
                    item.timeTypeDesc = default_item.timeTypeDesc;
                    item.markerDesc = default_item.markerDesc;
                    item.subDesc = default_item.subDesc;
                }
                // 限时特惠
                if(item.timeTypeDesc === '24+送12个月'){
                    let now = new Date();
                    let start = new Date(new Date().setHours(0,0,0,0));
                    let end = new Date(start.getTime() + 24 * 60 * 60 * 1000 - 1);
                    let diff_time = utils.calculateDiffTime(start, now);
                    item.promoteSaleCount = 99 - parseInt(diff_time / 20);;
                    item.promoteSaleTime = end.getTime();
                }
            });
            if (personal_list.length) {
                that.personal.list = personal_list;
                that.personal.minUnitPirce = personal_list[0].discountPrice;
                that.personal.rankType = personal_list[0].rankType;
                that.personal.rankTypeDesc = personal_list[0].rankTypeDesc;
                that.personal.isUpVip = personal_list[0].isUpVip;
                that.current_product = personal_list[0];
            }
        },
        //会员权限-展示更多
        show_more_power(){
            this.more_power = !this.more_power;
        },
        //常见问题-查看更多
        toggle_answer(event){
            $(event.target).parent('li').find('.describe').toggle();
            $(event.target).parent('li').find('.top').toggleClass('active');
        },
        //切换会员产品
        change_product(item){
            let that = this;
            if (!item || item.id === that.current_product.id) {
                return;
            }
            that.current_product = item;
        },
        //购买会员商品
        to_buy(item){   
            let that = this;
            if(!that.personal.isUpVip){
                that.$toast('您已购买企业会员', 1000);
                return;
            }
            that.current_step = "two";
            that.current_product = item;
            that.create_order();
        },
        //重置滚动条位置
        scroll_top(){
            this.$nextTick(()=>{
                if(this.isComponent){
                    $('.member_upgrade_container').animate({ scrollTop: 0}, 0);
                }else{
                    $('html,body').animate({ scrollTop: 0}, 0);
                }
            });
        },
        // 创建订单
        create_order () {
            let that = this;
            let param = {
                orderType: 'memberVip',
                productId: that.current_product.id,
                productQuantity: that.current_product.buyMinQuantity,
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
        // 检查订单
        check_order (sign) {
            let that = this;         
            that.$pay.new.check_order_qrcode({
                param:{ sign : sign},
                success (data) {
                    data.createDate = utils.dateFormat(new Date(data.createDate), 'yyyy-MM-dd HH:mm:ss')
                    that.pay_success_info = data;
                    that.current_step = 'three';
                    that.scroll_top();
                    if (typeof that.submitCallback === 'function') {
                        that.submitCallback();
                    }
                },
                complete () {
                    if(that.current_step !== 'two'){
                        return;
                    }
                    that.check_order_timer = setTimeout(function(){
                        that.check_order(sign);
                    },2000);
                },
            });
        },
        // 生成二维码
        create_qrcode(data) {
            let that = this;
            that.$nextTick(function(){
                let qrcode_url = window.location.origin+`/mobile/payment/transfer/?${$.param(data)}`
                QRCode.toCanvas($('#qrcode_canvas')[0],qrcode_url, {
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
    .member_upgrade_container{
        position: relative;
        width: 100%;
        height: 100%;
        min-width: 1240px;
        background: #ffffff;
        overflow-y: auto;
        .member_upgrade{
            width: 100%;
            margin: 0 auto;
            padding-top: 80px;
        }
        .back{
            position: absolute;
            left: 26px;
            display: inline-block;
            width: 16px;
            height: 28px;
            background: #ffffff url('../assets/common/images/back.png') center center;
            background-size: cover;
        }
        h1{
            height: 74px;
            font-size: 56px;
            font-weight: normal;
            color: #000000;
            text-align: center;
            user-select:none;
        }
        .step{
            display: flex;
            justify-content: space-between;
            align-items: center;
            width: 700px;
            height: 28px;
            line-height: 28px;
            margin: 42px auto 0;
            font-size: 20px;
            color: #999999;
            li{
                text-align: center;
                user-select:none;
                &.active{
                    color:#333333;
                }
            }
        }
        .step_line{
            position: relative;
            width: 900px;
            height: 6px;
            margin: 25px auto 60px;
            border-radius: 3px;
            background-color: #eeeeee;
            .progress{
                position: absolute;
                left: 0;
                top: 0;
                width: 300px;
                height: 6px;
                border-radius: 3px;
                background-color: var(--mainColor);
            }
            .dot{
                position: absolute;
                top:-7px;
                left: 150px;
                width: 17px;
                height: 17px;
                background-color: #0b7bf7;
                box-shadow: 0 4px 15px 0  rgba(52, 53, 83, 0.4);
                border: solid 3px #ffffff;
                border-radius: 50%;
            }
            &.one{
                .progress{
                    width: 300px;
                }
                .dot{
                    left: 150px;
                }
            }
            &.two{
                .progress{
                    width: 600px;
                }
                .dot{
                    left: 450px;
                }
            }
            &.three{
                .progress{
                    width: 900px;
                }
                .dot{
                    left: 750px;
                }
            }
        }
        .step_one,.step_two,.step_three{
            width: 85%;
            max-width: 1628px;
            margin: 0 auto;
            .options{
                user-select:none;
            }
        }
        .step_one{
            .options{
                width: 100%;
                display: flex;
                justify-content: space-between;
                li{
                    position: relative;
                    width: 310px;
                    height:412px;
                    margin-left: 20px;
                    background-color: #f5f5f5;
                    border-radius: 10px;
                    transition: all 0.3s;
                    &.active{
                        color: #ffffff;
                        background-color: var(--mainColor);
                        .content{
                            .time,.discount_price,.original_price,.promote_sale_count{
                                color: #ffffff;
                            }
                        }
                        .bottom .buy_btn,.tip{
                            background-color: #fe605f;
                        }
                        .bottom .info{
                            color: #ffffff;
                        }
                    }
                    &:first-child{
                        margin-left: 0;
                    }
                    .tip{
                        position: absolute;
                        top: 0;
                        right: 0;
                        width: 128px;
                        height: 44px;
                        line-height: 44px;
                        background-color: var(--mainColor);
                        border-top-right-radius: 10px;
                        border-bottom-left-radius: 10px;
                        color: #ffffff;
                        text-align: center;
                        font-size: 16px;
                        transition: all 0.3s;
                    }
                    .content{
                        display:flex;
                        justify-content:center;
                        align-items: center;
                        flex-direction: column;
                        margin-top: 69px;
                        text-align:center;
                        .time{
                            height: 21px;
                            line-height:21px;
                            font-size: 16px;
                            color: #666666;
                            font-weight: bold;
                        }
                        .discount_price{
                            height:91px;
                            line-height: 91px;
                            margin: 10px 0;
                            font-size: 66px;
                            font-weight: normal;
                            color: #333333;
                        }
                        .original_price{
                            font-size: 14px;
                            font-weight: normal;
                            color: #999999;
                            text-decoration: line-through;
                        }
                        .promote_sale_count{
                            position: relative;
                            top: 6px;
                            font-size: 14px;
                            font-weight: normal;
                            color: #999999;
                        }
                    }
                    .bottom{
                        margin-top: 66px;
                        text-align: center;
                        .buy_btn{
                            width: 180px;
                            height: 56px;
                            margin-bottom: 21px;
                            font-size: 16px;
                            background-color: var(--mainColor);
                            color: #ffffff;
                            border-radius: 10px;
                            transition: all 0.3s;
                        }
                        .info{
                            font-size: 14px;
                            color: #999999;
                        }
                        .timedown{
                            color: #333333;
                        }
                    }
                    .bottom.promote_sale{
                        margin-top: 46px;
                    }
                }
            }
            .power{
                width: 100%;
                margin: 80px 0;
                .top{
                    display: flex;
                    justify-content: space-between;
                    height: 26px;
                    font-size: 14px;
                    color: #999999;
                    .title{
                        height: 26px;
                        font-size: 20px;
                        font-weight: bold;
                        color: #333333;
                        span{
                            margin-left: 10px;
                            font-size: 14px;
                            font-weight: normal;
                            color: #999999;
                        }
                    }
                    .more{
                        display: flex;
                        justify-content: center;
                        align-items: center;
                        font-size: 14px;
                        color: #999999;
                        cursor: pointer;
                        user-select:none;
                        .show{
                            display: flex;
                            justify-content: center;
                            align-items: center;
                            i{
                                display: inline-block;
                                width: 24px;
                                height: 24px;
                                background: #ffffff url('../assets/pc/images/common/more_icon.png');
                            }
                        }
                    }
                }
                .line{
                    width: 100%;
                    height: 1px;
                    margin: 20px 0 40px 0;
                    border: 1px solid #eeeeee;
                }
                .power_items{
                    display: flex;
                    flex-wrap: wrap;
                    width: 100%;
                    li{
                        width: 25%;
                        height: 21px;
                        margin-bottom: 20px;
                        font-size: 14px;
                        color: #666666;
                        .left{
                            display: flex;
                            align-items: center;
                            width: 60%;
                            margin-right: 20px;
                            i{
                                display: inline-block;
                                width: 21px;
                                height: 21px;
                                margin-right: 20px;
                                background: #ffffff url('../assets/pc/images/common/checked_icon.png') no-repeat;
                                background-size: cover;
                            }
                        }
                        .right{
                            float:none;
                            .check{
                                display: inline-block;
                                width: 14px;
                                height: 14px;
                                background: #ffffff url('../assets/pc/images/common/checked_gray.png');
                            }
                        }
                    }
                }
            }
            .question{
                width: 100%;
                margin-bottom: 40px;
                .top{
                    display: flex;
                    justify-content: space-between;
                    height:26px;
                    font-size: 14px;
                    color: #999999;
                    .title{
                        height: 26px;
                        font-size: 20px;
                        font-weight: bold;
                        color: #333333;
                        span{
                            margin-left: 10px;
                            font-size: 14px;
                            color: #999999;
                            font-weight: normal;
                        }
                    }
                    .more{
                        font-size: 14px;
                        color: #999999;
                        display: flex;
                        justify-content: center;
                        align-items: center;
                        cursor: pointer;
                        user-select:none;
                        i{
                            display: inline-block;
                            width: 24px;
                            height: 24px;
                            background: #ffffff url('../assets/pc/images/common/more_icon.png');
                        }
                    }
                }
                .line{
                    width: 100%;
                    height: 1px;
                    margin: 20px 0 40px 0;
                    border: 1px solid #eeeeee;
                }
                .question_items{
                    display: flex;
                    width: 100%;
                    color: #666666;
                    li{
                        position: relative;
                        width: 380px;
                        margin-left: 160px;
                        padding-left: 16px;
                        font-size: 14px;
                        &:first-child{
                            margin-left: 0;
                        }
                        .top{
                            height: 20px;
                            line-height: 20px;
                            margin-bottom: 21px;
                            font-size: 16px;
                            &::before{
                                content: '';
                                position: absolute;
                                left: 0;
                                top: 8px;
                                display: inline-block;
                                width: 6px;
                                height: 6px;
                                background-color: #999999;
                                border-radius: 50%;
                            }
                            &::after{
                                content: '';
                                display: inline-block;
                                width: 20px;
                                height: 20px;
                                background: #ffffff url('../assets/pc/images/common/right_icon.png');
                            }
                            &.active::after{
                                transform: rotate(90deg);
                            }
                        }
                        .describe{
                            display: none;
                            line-height: 22px;
                            height: 60px;
                        }
                    }
                }
            }
        }
        .step_two{
            .options{
                width: 100%;
                .title{
                    font-weight: bold;
                    font-size: 24px;
                    color: #333333;
                    text-align: left;
                }
                ul{
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin: 30px 0 80px;
                    li{
                        position: relative;
                        width: 300px;
                        height: 184px;
                        margin-left: 20px;
                        background-color: #f5f5f5;
                        border-radius: 10px;
                        &.active,&:hover:not(.disable){
                            background-color: var(--mainColor);
                            cursor: pointer;
                            .content{
                                color: #ffffff;
                            }
                            .info{
                                color: #ffffff;
                            }
                            .tip{
                                background-color: #fe605f;
                            }
                        }
                        &.disable{
                            cursor:not-allowed;
                        }
                        &:first-child{
                            margin-left: 20px;
                        }
                        .tip{
                            position: absolute;
                            top: 0;
                            right: 0;
                            display: inline-block;
                            width: 128px;
                            height: 44px;
                            line-height: 44px;
                            font-size: 16px;
                            font-weight: bold;
                            border-bottom-left-radius: 10px;
                            border-top-right-radius: 10px;
                            text-align: center;
                            background-color: var(--mainColor);
                            color: #ffffff;
                        }
                        .content{
                            margin-left: 48px;
                            margin-top: 52px;
                            height: 50px;
                            line-height: 50px;
                            font-size: 28px;
                            font-weight: bold;
                            color: #333333;
                        }
                        .info{
                            margin-left: 48px;
                            margin-top: 7px;
                            height: 25px;
                            line-height: 25px;
                            font-size: 18px;
                            color: #999999;
                        }
                        .timedown{
                            color: #333333;
                        }
                    }
                }
            }
            .recharge_way{
                margin-top: 70px;
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
                        #qrcode_canvas{
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
                            height: 48px;
                            font-size: 16px;
                            color: #999999;
                            display: flex;
                            align-items: center;
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
            }
            .line{
                width: 100%;
                height: 1px;
                margin: 99px 0 29px;
                border: 1px solid #eeeeee;
            }
            .user{
                display: flex;
                justify-content: space-between;
                width: 100%;
                height:58px;
                margin-bottom: 25px;
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
                        height:22px;
                        font-size: 16px;
                        color: #999999;
                    }
                }
                .protocol{
                    height: 58px;
                    line-height: 58px;
                    font-size: 16px;
                    color: #999999;
                    a{
                        color: var(--mainColor);
                    }
                }
            }
        }
        .step_three{
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
                height: 58px;
                margin-bottom: 25px;
                .info{
                    display: flex;
                    img{
                        width: 58px;
                        height: 58px;
                        border-radius: 50%;
                        margin-right: 20px;
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
                .link{
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
    .member_grade_modal{
        position: fixed;
        top: 0;
        left: 0;
        .member_upgrade{
            padding-top:60px !important;
        }
    }
    @media screen and (max-width: 1920px) {
        .member_grade_container .headline{
            margin-top: 30px;
        }
        #step_one{
            width: 90%;
            .options li{
                margin-left: 10px;
            }
        }
        #step_two{
            width: 90%;
            ul li{
                margin-left: 10px;
            }
            .content,.info{
                margin-left: 36px;
            }
        }
        #step_three{
            width: 90%;
        }
    }
</style>