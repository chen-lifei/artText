<template>
    <div class="submit_container">
        <h1 class="page_title">确认订单</h1>
        <!-- 会员商品列表 -->
        <div class="membervip_container" v-if="query.type === 'memberVip'">
            <!-- 个人版会员 -->
            <div class="vip_wrapper personal" v-if="query.memberVip === 'personal'">
                <div class="upgrade_title">
                    <div class="title_content">
                        <h2>{{ personal.rankTypeDesc }}</h2>
                        <p>当前账户ID：{{ user.id }}</p>
                    </div>
                </div>
                <!-- 商品列表 -->
                <ul class="product_list">
                    <li class="list" 
                        v-for="(item, index) in personal.list" 
                        :key="index"
                        :class="{'checked': item.id === current_product.id}"
                        @click="select_grade_type(item)"
                    >
                        <span class="marker" v-show="item.discount < 1">{{ item.markerDesc }}</span>
                        <p class="time">{{ item.timeTypeDesc }}</p>
                        <p class="price">
                            ￥<span>{{ item.discountPrice }}</span>
                            <del v-show="item.discount < 1">￥{{ item.price }}</del>
                        </p>
                        <p class="sub" v-if="!item.promoteSaleTime" v-show="item.discount < 1">{{ item.subDesc }}</p>
                        <p class="sub" v-if="item.promoteSaleTime">距今天活动结束仅剩 <TimeDown :endTime="item.promoteSaleTime"></TimeDown></p>
                    </li>
                </ul>
                <!-- 支付方式 -->
                <ul class="pay_list">
                    <li class="list" 
                        v-for="(item, index) in woodoPay" 
                        v-show="item.isshow" 
                        :key="index"
                        :class="{'checked': item.type === pay_info.type}"
                        @click="select_pay_type(item)"
                    >
                        <img :src="item.image" alt="" />
                        <span>{{ item.name }}</span>
                        <i class="radio_icon"></i>
                    </li>
                </ul>
            </div>
            <!-- 企业版会员 -->
            <div class="vip_wrapper enterprise" v-else-if="query.memberVip === 'enterprise'">
                <div class="upgrade_title">
                    <div class="title_content">
                        <h2>{{ enterprise.rankTypeDesc }}</h2>
                        <p>（当前企业：{{ team.name }}）</p>
                    </div>
                </div>
                <!-- 商品列表 -->
                <ul class="product_list">
                    <li class="list" 
                        v-for="(item, index) in enterprise.list" 
                        :key="index"
                        :class="{'checked': item.id === current_product.id}"
                        @click="select_grade_type(item)"
                    >
                        <span class="marker" v-show="item.discount < 1">{{ item.markerDesc }}</span>
                        <p class="time">{{ item.timeTypeDesc }}</p>
                        <p class="price">
                            ￥<span>{{ item.discountPrice }}</span>
                            <del v-show="item.discount < 1">￥{{ item.price }}</del>
                        </p>
                        <p class="sub" v-show="item.discount < 1">{{ item.subDesc }}</p>
                    </li>
                </ul>
                <!-- 选择支付方式、席位 -->
                <ul class="selector_panel">
                    <li class="list" v-show="pay_info.target.type" @click="open_selector_pay">
                        <span class="title">支付：</span>
                        <img :src="pay_info.target.image" alt="" />
                        <span class="name">{{ pay_info.target.name }}</span>
                    </li>
                    <li class="list" @click="open_selector_seat">
                        <span class="title">席位：</span>
                        <span class="name">{{ `${seatSelector.target.min}-${seatSelector.target.max}人` }}</span>
                    </li>
                </ul>
                <a href="javascript:void(0);" class="seat_formula" v-show="user.memberVip === 'enterprise'" @click="open_seat_formula">变更方案价格计算公式</a>
                <!-- 选择支付方式弹窗 -->
                <transition name="modal-fade">
                    <div class="modal-backdrop" v-show="modal_state.selector_pay" @click="close_selector_pay">
                        <div class="pay_fixedpanel" @click.stop>
                            <ul class="pay_list">
                                <li class="list" 
                                    v-for="(item, index) in woodoPay" 
                                    v-show="item.isshow" 
                                    :key="index"
                                    :class="{'checked': item.type === pay_info.type}"
                                    @click="select_pay_type(item)"
                                >
                                    <img :src="item.image" alt="" />
                                    <span>{{ item.name }}</span>
                                    <i class="radio_icon"></i>
                                </li>
                            </ul>
                        </div>
                    </div>
                </transition>
                <!-- 选择席位弹窗 -->
                <transition name="modal-fade">
                    <div class="modal-backdrop" v-if="modal_state.selector_seat" @click="close_selector_seat">
                        <div class="seat_fixedpanel" @click.stop>
                            <p class="title">选择席位数量</p>
                            <div class="seat_list">
                                <div class="list" 
                                    v-for="(item, index) in seatSelector.list" 
                                    :key="index" 
                                    :class="{'checked': item.min === seatSelector.target.min && item.max === seatSelector.target.max}"
                                    v-show="item.isshow"
                                    @click="item.isshow && seatinput(item.max)"
                                >
                                    {{ `${item.min}-${item.max}人` }}
                                </div>
                                <div class="list" @click="consultant">1000人以上找顾问咨询</div>
                            </div>
                        </div>
                    </div>
                </transition>
            </div>
        </div>
        <!-- 结算面板 -->
        <div class="settle_wrapper">
            <div class="valid" v-if="query.memberVip === 'enterprise'">购买后到期时间为{{ enterprise.buyVipExpire }}，企业共{{ enterprise.buySeat }}个席位，剩余可邀请名额{{ enterprise.nullSeat }}人</div>
            <p class="total">
                <span>合计金额：</span>
                ￥<span>{{ pay_info.total }}</span>
            </p>
            <a href="javascript:void(0);" class="invoice" @click="invoice">开票须知</a>
            <a href="javascript:void(0);" class="payment_btn disable" v-if="creating">支付中...</a>
            <a href="javascript:void(0);" class="payment_btn" v-else @click="create_order">立即支付</a>
        </div>

        <!-- 对公账户教程弹窗 -->
        <transition name="modal-fade">
            <div class="modal-backdrop" v-show="modal_state.chinaunion">
                <div class="modal chinaunion">
                    <div class="modal-header">
                        <span class="modal-title">对公账户</span>
                        <button class="modal-close" @click="close_chinaunion"></button>
                    </div>
                    <div class="modal-body">
                        <div class="step_1">
                            <div class="step_title">步骤一：对公汇款</div>
                            <p>账户名称：<span>广州爆裂科技有限公司</span></p>
                            <p>开户银行：<span>中国工商银行广州穗和支行</span></p>
                            <p>账户账号：<span>3602057909200201282</span></p>
                            <p>汇款金额：<span class="price">￥{{ pay_info.total }}</span></p>
                            <p>汇款备注：xxx团队</p>
                        </div>
                        <div class="step_2">
                            <div class="step_title">步骤二：升级账户</div>
                            <p>微信扫码联系工作人员，提供回单截图和团队名称</p>
                            <img src="../../assets/pc/images/common/service_code2.jpg" alt=""/>
                        </div>
				    </div>
                </div>
            </div>
        </transition>
    </div>
</template>

<script>
import axios from 'axios';
import TimeDown from '@/components/TimeDown.vue'

export default {
    components: { TimeDown },
    name: 'OrderSubmit',
    metaInfo: {
        title: '吾道-确认订单',
        meta: [{
            name: 'viewport',
            content: "width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0"
        }],
    },
    data () {
        return {
            query: {},                          // 商品展示参数
            user: {},
            // 弹窗状态
            modal_state: {
                selector_pay: false,        // 显示支付方式弹窗
                selector_seat: false,       // 显示席位选择弹窗
                chinaunion: false,          // 对公账户教程弹窗
            },
            creating: false,                    // 订单创建中
            ordergeting: false,                 // 价格获取中
            debounce: null,                     // 高频操作节流防抖
            cancel_axios: function () {},       // 中断axios请求方法
            // 个人版会员
            personal: {
                isUpVip: false,
                rankType: 'personal',
                rankTypeDesc: '个人版',
                list: [
                    {
                        id: 14,
                        isUpVip: false,
                        buyMinQuantity: 1,
                        buyMaxQuantity: 1,
                        rankType: 'personal',
                        rankTypeDesc: '个人版',
                        timeUnit: 'year',
                        timeValue: 3,
                        timeTypeDesc: '3年',
                        discount: 1,
                        price: 920,
                        discountPrice: 249,
                        markerDesc: '',
                        subDesc: '',
                    }, {
                        id: 2,
                        isUpVip: false,
                        buyMinQuantity: 1,
                        buyMaxQuantity: 1,
                        rankType: 'personal',
                        rankTypeDesc: '个人版',
                        timeUnit: 'year',
                        timeValue: 1,
                        timeTypeDesc: '1年',
                        discount: 1,
                        price: 460,
                        discountPrice: 129,
                        markerDesc: '',
                        subDesc: '',
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
                        subDesc: '',
                    }, {
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
                        subDesc: '',
                    }, {
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
            // 企业版会员
            enterprise: {
                isUpVip: false,
                rankType: 'enterprise',
                rankTypeDesc: '企业版',
                buySeat: 5,
                nullSeat: 0,
                buyVipExpire: '----',
                list: [
                    {
                        id: 1,
                        isUpVip: false,
                        buyMinQuantity: 5,
                        buyMaxQuantity: 1000,
                        rankType: 'enterprise',
                        rankTypeDesc: '企业版',
                        timeUnit: 'year',
                        timeValue: 1,
                        timeTypeDesc: '1年',
                        discount: 1,
                        price: 149,
                        discountPrice: 149,
                        markerDesc: '',
                        subDesc: '',
                    }
                ],
            },
            // 团队信息
            team: {
                id: 0,
                name: '',
                owner: false,
                count: 0,
            },
            // 席位信息
            seatSelector: {
                target: {
                    isshow: true,
                    min: 0,
                    max: 5,
                },
                list: [
                    {
                        isshow: true,
                        min: 0,
                        max: 5,
                    }, {
                        isshow: true,
                        min: 6,
                        max: 20,
                    }, {
                        isshow: true,
                        min: 21,
                        max: 50,
                    }, {
                        isshow: true,
                        min: 51,
                        max: 100,
                    }, {
                        isshow: true,
                        min: 101,
                        max: 200,
                    }, {
                        isshow: true,
                        min: 201,
                        max: 500,
                    }, {
                        isshow: true,
                        min: 501,
                        max: 1000,
                    }
                ]
            },
            // 支付方式
            woodoPay: [
                {
                    type: 'weixinPayPlugin',
                    name: '微信支付',
                    isshow: true,
                    image: require(`../../assets/common/images/wechat_pay_icon.png`),
                }, {
                    type: 'alipayDirectPlugin',
                    name: '支付宝',
                    isshow: true,
                    image: require(`../../assets/common/images/ali_pay_icon.png`),
                }, {
                    type: 'ChinaUnionPlugin',
                    name: '对公账户',
                    isshow: true,
                    image: require(`../../assets/common/images/chinaunion_pay_icon.png`),
                }
            ],
            // 商品数量
            current_quantity: 1,
            // 选中的商品信息
            current_product: {},
            // 支付信息
            pay_info: {
                type: '',
                total: 0,
                target: {},
            },
        }
    },
    watch: {
        current_quantity() {
            this.get_create_order_info();
        },
        current_product: {
            handler() {
                this.get_create_order_info();
            },
            deep: true,
        },
    },
    created() {
        this.query = this.$route.query;
    },
    mounted () {
        let that = this;
        // 用户信息
        that.user = that.$common.get_login_state();
        that.get_payment_evn();
        that.get_grade_info();
    },
    methods: {
        // 获取支付环境  微信浏览器不可使用支付宝支付   支付宝浏览器不可使用微信支付
        get_payment_evn () {
            let that = this;
            let is_wechat_evn = utils.deviceENV().wechat;
            // 非微信环境不支持微信支付，微信环境不支持支付宝支付
            let alipay = that.woodoPay.find(item => item.type === 'alipayDirectPlugin');
            let wxpay = that.woodoPay.find(item => item.type === 'weixinPayPlugin');
            if (is_wechat_evn) {
                alipay.isshow = false;
            } else {
                wxpay.isshow = false;
            }
            // 初始化支付方式
            for (let i = 0; i < that.woodoPay.length; i++) {
                let item = that.woodoPay[i];
                if (item.isshow) {
                    that.select_pay_type(item);
                    break;
                }
            }
        },
        // 获取会员等级信息
        get_grade_info () {
            let that = this;
            if (that.query.type !== 'memberVip') {
                return;
            }
            that.$axios.get('/api/member/up_vip/').then(res => {
                let res_data = res.data;
                if (res_data.type !== 'success') {
                    return that.$toast('获取会员信息失败！');
                }
                let data = res_data.data;
                // 团队信息数据处理
                that.team_format(data);
                // 根据会员类型处理相关操作
                switch (that.query.memberVip) {
                    // 个人版会员数据处理
                    case 'personal':
                        that.woodoPay.find(item => item.type === 'ChinaUnionPlugin').isshow = false;
                        that.personal_format(data.personal);
                        that.select_grade_type(that.personal.list[0]);
                        break;
                    // 企业版会员数据处理
                    case 'enterprise':
                        that.enterprise_format(data.enterprise);
                        that.select_grade_type(that.enterprise.list[0]);
                        break;
                }
            }).catch(err => {
                console.error(err);
                return that.$toast('获取会员信息失败！');
            });
        },
        // 获取订单价格信息
        get_create_order_info() {
            let that = this;
            let pids;
            let quantity = that.current_quantity;
            that.ordergeting = true;
            that.pay_info.total = '...';
            clearTimeout(that.debounce);
            // 获取当前商品类所有商品id
            let upgrade_type = that[that.query.memberVip];
            if (upgrade_type && upgrade_type.list) {
                pids = upgrade_type.list.map(item => item.id).join();
            }
            if (!pids || !quantity) {
                that.pay_info.total = 0;
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
                    // 更新团队信息
                    that.team_format(data);
                    // 更新商品折扣信息
                    that.update_product(data.products);
                }).catch(err => {
                    console.error(err);
                });
            }, 300);
        },
        // 会员商品日期处理
        product_dateformat(unit, value) {
            let unit_map = {
                'year': '年',
                'month': '个月',
                'day': '天',
            };
            if(unit === 'year'){
                unit = 'month';
                value = value * 12;
            }
            return `${value}${unit_map[unit] || ''}`;
        },

        // 金额计算接口更新商品数据
        update_product(data = []) {
            let that = this;
            let upgrade_type = that[that.query.memberVip];
            if (upgrade_type && upgrade_type.list) {
                let product_list = upgrade_type.list;
                data.forEach(item => {
                    let pid = item.buyVipProduct;
                    // 查找对应的商品，更新折扣数据
                    let product = product_list.find(item => item.id === pid);
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
                    // 折扣信息
                    let discount = Number((item.buyVipDiscountPrice / item.buyVipPrice).toFixed(2));
                    let price = item.buyVipPrice / item.buyVipQuantity;
                    let discount_price = item.buyVipDiscountPrice / item.buyVipQuantity;
                    product.discount = discount;
                    product.price = Math.ceil(price);
                    product.discountPrice = Math.ceil(discount_price);
                    if(relative_month >= 12){
                        product.markerDesc = '超值推荐';
                        product.subDesc = `低至￥${Number((product.discountPrice / relative_month).toFixed(2))}/月  仅￥${Number((product.discountPrice / relative_day).toFixed(2))}/天`;
                    }else if(relative_month !== 1){
                        product.markerDesc = '';
                        product.subDesc = `每月仅需${Number((product.discountPrice/relative_month).toFixed(2))}元`;
                    }else{
                        product.markerDesc = '';
                        product.subDesc = '全站资源免费下载';
                    }
                    if(product.promoteSaleTime){
                        product.markerDesc = '限时特惠';
                    }
                    // 更新已选中的商品
                    if (pid === that.current_product.id) {
                        // 企业版席位信息
                        that.enterprise.buySeat = item.vipSeat.buySeat;
                        that.enterprise.nullSeat = item.vipSeat.nullSeat;
                        that.enterprise.buyVipExpire = utils.dateFormat(new Date(item.buyVipExpire), 'yyyy年MM月dd日');
                        // 总价
                        that.pay_info.total = item.buyVipDiscountPrice;
                    }
                });
            }
        },
        // 团队信息、会员等级 数据处理
        team_format(data = {}) {
            this.team.id = data.teamId;
            this.team.name = data.teamName;
            this.team.owner = data.isTeamOwner;
            this.team.count = data.teamMemberCount || 0;
        },
        personal_format(data = []) {
            let that = this;
            let personal_list = data.insertSort((a, b) => b.price - a.price);
            personal_list.forEach(item => {
                item.timeTypeDesc = that.product_dateformat(item.timeUnit, item.timeValue);
                if(item.timeTypeDesc === '36个月'){
                    item.timeTypeDesc = '24+送12个月';
                    let start = new Date(new Date().setHours(0,0,0,0));
                    item.promoteSaleTime = start.getTime() + 24 * 60 * 60 * 1000 - 1;
                }
            });
            if (personal_list.length) {
                that.personal.list = personal_list;
                that.personal.rankType = personal_list[0].rankType;
                that.personal.rankTypeDesc = personal_list[0].rankTypeDesc;
                that.personal.isUpVip = personal_list[0].isUpVip;
            }
        },
        enterprise_format(data = []) {
            let that = this;
            let enterprise_list = data.insertSort((a, b) => b.price - a.price);
            enterprise_list.forEach(item => {
                item.timeTypeDesc = that.product_dateformat(item.timeUnit, item.timeValue);
                item.buyMaxQuantity = 1000;
            });
            if (enterprise_list.length) {
                that.enterprise.list = enterprise_list;
                that.enterprise.rankType = enterprise_list[0].rankType;
                that.enterprise.rankTypeDesc = enterprise_list[0].rankTypeDesc;
                that.enterprise.isUpVip = enterprise_list[0].isUpVip;
            }
        },

        // 选择会员商品类型
        select_grade_type(item) {
            let that = this;
            if (!item || item.id === that.current_product.id) {
                return;
            }
            that.current_quantity = item.buyMinQuantity;
            that.current_product = item;
            // 更新可选商品数量
            that.seatinput();
        },
        // 选择支付方式
        open_selector_pay() {
            this.modal_state.selector_pay = true;
        },
        close_selector_pay() {
            this.modal_state.selector_pay = false;
        },
        select_pay_type(item) {
            if (!item) {
                return;
            }
            if (!item.isshow) {
                return;
            }
            let that = this;
            that.pay_info.type = item.type;
            that.pay_info.target = utils.deepClone(that.woodoPay.find(_item => _item.type === item.type));
            that.modal_state.selector_pay = false;
        },
        // 选择席位
        open_selector_seat() {
            this.modal_state.selector_seat = true;
            this.$nextTick(() => {
                let $list = document.querySelector('.seat_fixedpanel');
                $list.querySelector('.seat_list').scrollTo(0, $list.querySelector('.checked').offsetTop - $list.querySelector('.title').clientHeight);
            });
        },
        close_selector_seat() {
            this.modal_state.selector_seat = false;
        },
        seatinput(n) {
            let that = this;
            let number = that.current_quantity;
            if (!isNaN(n)) {
                number = Number(n);
            }
            // 最小 最大 值校验
            let min = that.current_product.buyMinQuantity || 1;
            let max = that.current_product.buyMaxQuantity || 1;
            if (number < min) {
                number = min;
            } else if (number > max) {
                number = max;
            }
            number = Math.floor(number);
            that.current_quantity = number;
            // 更新席位选择
            let seat_list = that.seatSelector.list;
            // 筛选可选项
            seat_list.forEach(item => {
                item.isshow = min <= item.max;
            });
            // 更新选中项
            that.seatSelector.target = seat_list.find(item => number === item.max) || seat_list.find(item => item.isshow) || { min: 0, max: 0 };
            that.modal_state.selector_seat = false;
        },
        // 开票须知弹窗
        invoice() {
            let that = this;
            let p = '';
            if (that.query.memberVip === 'personal') {
                p = `<p>请使用电脑登录吾道官网<br/>进入个人中心-我的订单提交开票信息</p>`;
            } else if (that.query.memberVip === 'enterprise') {
                p = `<p>企业客户需采用对公账户支付才可开票<br/>详情请扫码联系工作人员</p>`;
            }
            this.$modal({
                modalClass: 'invoice',
                modalTitle: '',
                modalContent: `<div><h2>开票需知</h2>${p}</div>`,
                showCancel: false,
                showClose: false,
                buttonSubmitTxt: '知道了',
                submitCallback: function(modal){
                    modal.close();
                },
            });
        },
        // 咨询顾问
        consultant() {
            this.$modal({
                modalClass: 'consultant',
                modalTitle: '',
                modalContent: `<div><h2>咨询顾问</h2><p>企业客户咨询请微信扫码加关注</p><img src="${require(`../../assets/pc/images/common/service_code2.jpg`)}" alt="" /></div>`,
                showCancel: false,
                showClose: false,
                buttonSubmitTxt: '知道了',
                submitCallback: function(modal){
                    modal.close();
                },
            });
        },
        // 席位公式弹窗
        open_seat_formula() {
            this.$modal({
                modalClass: 'seat_formula',
                modalTitle: '',
                modalContent: `<div><h2>变更方案价格计算公式</h2><p>变更席位数 * 方案剩余时间（以天为单位）* 方案单人价格</p></div>`,
                showCancel: false,
                showClose: false,
                buttonSubmitTxt: '知道了',
                submitCallback: function(modal){
                    modal.close();
                },
            });
        },
        // 打开对公账户支付（银联支付）教程面板
        open_chinaunion() {
            this.modal_state.chinaunion = true;
        },
        close_chinaunion() {
            this.modal_state.chinaunion = false;
        },
        // 创建订单
        create_order () {
            let that = this;
            if (that.ordergeting) {
                return;
            }
            // 对公账户支付显示教程面板
            if (that.pay_info.type === 'ChinaUnionPlugin') {
                that.open_chinaunion();
                return;
            }
            let param = {
                pluginId: that.pay_info.type,
                productId: that.current_product.id,
                productQuantity: that.current_quantity,
            };
            that.creating = true;
            that.$pay.create_vip_order({
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
        }
    },
}
</script>

<style lang="less" scoped>
@import url("../../assets/wap/css/common.css");
.submit_container {
    width: 100%;
    padding-bottom: 8.6rem;
}

.page_title {
    padding-top: 0.2rem;
    line-height: 1.8rem;
    margin-bottom: 0.5rem;
    font-weight: bold;
    font-size: 0.95rem;
    color: #393939;
    text-align: center;
    &::after {
        content: "";
        display: block;
        width: 0.8em;
        height: 0.15rem;
        margin: 0 auto;
        background-color: var(--mainColor);
        border-radius: 0.15rem;
    }
}

.vip_wrapper {
    margin: 0 0.75rem;
    .upgrade_title {
        position: relative;
        margin-bottom: 1.6rem;
        border-radius: 0.33rem;
        background: var(--mainColor) url("../../assets/wap/images/order/submit_member_bg.png") no-repeat center center;
        background-size: contain;
        &::before {
            content: "";
            display: block;
            padding-top: 25.6%;
        }
        .title_content {
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            padding: 0.75rem 0;
            color: #fff;
            text-align: center;
            box-shadow: 0 0.5rem 1rem -0.5rem #449cff;
            h2 {
                margin-bottom: 0.7rem;
                font-size: 1.1rem;
                font-weight: bold;
            }
            p {
                font-size: 0.5rem;
            }
        }
    }
    .product_list {
        width: 100%;
        padding-bottom: 1.2rem;
        border-bottom: 0.1rem solid #ccd3dc;
        font-size: 0;
        .list {
            position: relative;
            display: inline-block;
            vertical-align: top;
            width: 32%;
            height: 4.7rem;
            padding: 0.4rem;
            margin-right: 2%;
            margin-bottom: 0.4rem;
            border: solid 0.05rem #ffffff;
            background-color: #ffffff;
            border-radius: 0.2rem;
            font-size: 0.7rem;
            white-space: nowrap;
            &:nth-child(3n) {
                margin-right: 0;
            }
            &.checked {
                border-color: var(--mainColor);
                &::before {
                    content: "";
                    position: absolute;
                    bottom: -0.05rem;
                    right: -0.05rem;
                    width: 0.8rem;
                    height: 0.8rem;
                    background-color: var(--mainColor);
                    border-radius: 0.2rem 0 0.2rem 0;
                }
                &::after {
                    content: "";
                    position: absolute;
                    bottom: 0.15rem;
                    right: 0.15rem;
                    width: 0.4rem;
                    height: 0.4rem;
                    background: url("../../assets/wap/images/member/checked_icon_2.png") no-repeat;
                    background-size: contain;
                }
                .time {
                    color: var(--mainColor);
                }
            }
            .marker {
                position: absolute;
                top: -0.05rem;
                right: -0.05rem;
                line-height: 0.8rem;
                padding: 0 0.2rem;
                background-color: #fb3131;
                border-radius: 0 0.2rem 0 0.25rem;
                font-size: 0.4rem;
                color: #ffffff;
                font-weight: bold;
            }
            .time {
                margin-bottom: 0.55rem;
                font-size: 0.7rem;
                color: #1e2226;
                font-weight: bold;
            }
            .price {
                margin-bottom: 0.25rem;
                font-size: 0.6rem;
                font-weight: bold;
                color: #fb3131;
                span {
                    font-size: 1rem;
                }
                del {
                    margin-left: 0.2rem;
                    font-weight: normal;
                    color: #3e444b;
                }
            }
            .sub {
                font-size: 0.4rem;
                color: #45484c;
                white-space : normal;
            }
        }
    }
    .pay_list {
        width: 100%;
        padding-top: 0.4rem;
        .list {
            width: 100%;
            height: 2.7rem;
            padding: 0.7rem 0;
            &.checked {
                .radio_icon {
                    position: relative;
                    background-color: var(--mainColor);
                    &::after {
                        content: "";
                        position: absolute;
                        top: 0;
                        left: 0;
                        right: 0;
                        bottom: 0;
                        margin: auto;
                        width: 0.6rem;
                        height: 0.6rem;
                        background: url("../../assets/wap/images/member/checked_icon_2.png") no-repeat;
                        background-size: contain;
                    }
                }
            }
            img {
                display: inline-block;
                vertical-align: middle;
                height: 1.3rem;
                width: auto;
                margin-right: 0.5rem;
            }
            span {
                display: inline-block;
                vertical-align: middle;
                line-height: 1.3rem;
                font-size: 0.8rem;
                color: #393939;
            }
            .radio_icon {
                float: right;
                width: 1.3rem;
                height: 1.3rem;
                border-radius: 50%;
                background-color: #ffffff;
            }
        }
    }
    .selector_panel {
        width: 100%;
        .list {
            position: relative;
            width: 100%;
            height: 3rem;
            padding: 0.85rem 0;
            border-bottom: 0.1rem solid #ccd3dc;
            &::after {
                content: "";
                position: absolute;
                top: 50%;
                right: 0.5rem;
                margin-top: -0.25rem;
                width: 0.5rem;
                height: 0.5rem;
                border: solid 0.15rem #626d79;
                border-left: none;
                border-bottom: none;
                border-radius: 0.1rem;
                transform: rotate(45deg);
            }
            .title {
                display: inline-block;
                vertical-align: middle;
                margin-right: 1rem;
                line-height: 1.3rem;
                font-size: 0.8rem;
                color: #1e2226;
            }
            img {
                display: inline-block;
                vertical-align: middle;
                width: auto;
                height: 1.3rem;
                margin-right: 0.5rem;
            }
            .name {
                display: inline-block;
                vertical-align: middle;
                line-height: 1.3rem;
                font-size: 0.8rem;
                color: #1e2226;
            }
        }
    }
    .seat_formula {
        display: block;
        line-height: 1.6rem;
        text-align: center;
        font-size: 0.6rem;
        color: var(--mainColor);
        text-decoration: underline;
    }
}

.settle_wrapper {
    position: fixed;
    left: 0;
    right: 0;
    bottom: 0;
    text-align: center;
    background-color: #e7edf5;
    .valid {
        padding: 0 2.5rem;
        margin-bottom: 1.2rem;
        text-align: center;
        font-size: 0.6rem;
        color: #6e767f;
    }
    .total {
        font-size: 0.8rem;
        line-height: 1rem;
        margin-bottom: 0.5rem;
        font-weight: bold;
        color: #ff3030;
        span:first-child {
            font-weight: normal;
            color: #292929;
        }
        span:last-child {
            font-size: 1rem;
        }
    }
    .invoice {
        font-size: 0.6rem;
        color: var(--mainColor);
        text-decoration: underline;
    }
    .payment_btn {
        display: block;
        width: 100%;
        line-height: 2.4rem;
        margin-top: 1rem;
        font-size: 0.8rem;
        color: #ffffff;
        background-color: var(--mainColor);
        &.disable {
            pointer-events: none;
        }
    }
}

.pay_fixedpanel {
    position: fixed;
    left: 0;
    right: 0;
    bottom: 0;
    padding: 0 0.75rem;
    background-color: #ffffff;
    overflow: hidden;
    .pay_list .list {
        height: 3.3rem;
        padding: 1rem 0;
    }
}

.seat_fixedpanel {
    position: fixed;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: #ffffff;
    text-align: center;
    overflow: hidden;
    .title {
        width: 100%;
        line-height: 2.6rem;
        border-bottom: 0.05rem solid #c6d1dc;
        font-size: 0.8rem;
        color: #393939;
    }
    .seat_list {
        width: 100%;
        height: auto;
        max-height: 55vh;
        overflow-x: hidden;
        overflow-y: auto;
        .list {
            width: 100%;
            line-height: 2.2rem;
            font-size: 0.8rem;
            color: #565f6a;
            &.checked {
                color: var(--mainColor);
                background-color: #ecf0f3;
            }
        }
    }
}
// 对公账户教程弹窗样式
.modal.chinaunion {
    width: 92%;
    .modal-header {
        height: 2.6rem;
        padding: 0 1.2rem;
        min-height: auto;
        line-height: 2.6rem;
        background-color: var(--mainColor);
        .modal-title {
            font-size: 1.04rem;
            font-weight: bold;
            color: #ffffff;
        }
        .modal-close::before,
        .modal-close::after {
            background-color: #ffffff;
        }
    }
    .modal-body {
        padding: 1rem 1.2rem;
        .step_title {
            line-height: 1.8rem;
            font-size: 0.83rem;
            font-weight: bold;
        }
        .step_1 {
            margin-bottom: 1.5rem;
            .step_title {
                color: #07a24c;
            }
            p {
                line-height: 1.4rem;
                font-size: 0.83rem;
                color: #535b63;
                white-space: nowrap;
                span {
                    color: #252a2f;
                    &.price {
                        color: #ff2727;
                        font-weight: bold;
                    }
                }
            }
        }
        .step_2 {
            .step_title {
                color: var(--mainColor);
            }
            p {
                margin: 0.2rem 0;
                font-size: 0.83rem;
                color: #252a2f;
            }
            img {
                display: block;
                width: 5.5rem;
                height: 5.5rem;
            }
        }
    }
}
</style>
<style lang="less">
body {
    background-color: #e7edf5;
}
// 咨询顾问弹窗
.modal.consultant {
    .modal-body {
        height: auto;
        text-align: center;
        h2 {
            margin-bottom: 1rem;
            font-size: 0.83rem;
            font-weight: bold;
            color: #1a1c1e;
        }
        p {
            margin-bottom: 1.5rem;
            font-size: 0.62rem;
            color: #252a2f;
        }
        img {
            display: block;
            width: 7.5rem;
            height: 7.5rem;
            margin: 0 auto 0.75rem;
        }
    }
    .modal-footer {
        text-align: center;
        .button-submit {
            width: 5.95rem;
            height: 2.2rem;
            margin: auto;
            background-color: #ffffff;
            border-radius: 0.35rem;
            border: solid 0.03rem #dfdfdf;
            font-size: 0.83rem;
            color: #505a65;
        }
    }
}
// 开票须知
.modal.invoice {
    .modal-body {
        height: auto;
        text-align: center;
        h2 {
            margin-bottom: 1rem;
            font-size: 0.83rem;
            font-weight: bold;
            color: #1a1c1e;
        }
        p {
            margin-bottom: 1.5rem;
            font-size: 0.62rem;
            color: #252a2f;
        }
        img {
            display: block;
            width: 7.5rem;
            height: 7.5rem;
            margin: 0 auto 0.75rem;
        }
    }
    .modal-footer {
        text-align: center;
        .button-submit {
            width: 5.95rem;
            height: 2.2rem;
            margin: auto;
            background-color: #ffffff;
            border: solid 0.03rem #dfdfdf;
            color: #505a65;
        }
    }
}
// 席位公式弹窗
.modal.seat_formula {
    .modal-body {
        height: auto;
        text-align: center;
        h2 {
            margin-bottom: 1rem;
            font-size: 0.83rem;
            font-weight: bold;
            color: #1a1c1e;
        }
        p {
            margin-bottom: 1.5rem;
            font-size: 0.62rem;
            color: #252a2f;
        }
    }
    .modal-footer {
        text-align: center;
        .button-submit {
            width: 5.95rem;
            height: 2.2rem;
            margin: auto;
            background-color: var(--mainColor);
        }
    }
}
</style>