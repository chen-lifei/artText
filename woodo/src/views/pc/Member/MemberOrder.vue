<template>
    <div class="order_container">
        <CommonHead ref="CommonHead"></CommonHead>
        <div class="order_main skeleton" ref="orderSkeleton">
            <!-- 订单列表 -->
            <!-- 1.未支付未过期   2.未支付已过期  3.已完成-->
            <ul class="order_list" v-if="orderlist.length">
                <p class="title">我的订单</p>
                <li v-for="(item, index) in orderlist"
                    v-if="item.orderType !== 'download' || item.memo.downloadType !== 'document'"
                    :key="index" 
                    :class="{'un_payment': item.orderStatus === 'unpaid' && !item.isExpired, 'expired': item.isExpired}"
                >
                    <div class="list_head">
                        <span class="left sn">订单编号：{{ item.sn }}</span>
                        <span class="right time">{{ item.createDate }}</span>
                    </div>
                    <!-- 会员订单 -->
                    <div class="list_body memberVip" v-if="item.orderType === 'memberVip'">
                        <!-- 订单商品列表（可多个） -->
                        <div class="product" v-for="(product, index) in item.orderItems" :key="index">
                            <div class="avatar memberVip">
                                <img :src="product.image"  alt=""/>
                            </div>
                            <div class="info">
                                <span class="name">{{ product.name }}</span>
                                <div class="remarks">
                                    <p>{{ item.productInformation }}</p>
                                    <p>{{ item.expireDate }}</p>
                                </div>
                            </div>
                        </div>
                        <!-- 总价 -->
                        <div class="price">
                            <span>
                                ￥<strong>{{ item.orderAmount }}</strong>
                            </span>
                        </div>
                        <!-- 订单操作 -->
                        <div class="opeartion">
                            <!-- 发票按钮 -->
                            <template v-if="item.orderStatus == 'completed'">
                                <a v-if="item.orderInvoice && item.orderInvoice.status=='waiting'" href="javascript:void(0);" class="btn waiting">等待开票</a>
                                <a v-else-if="item.orderInvoice && item.orderInvoice.status=='processing'" href="javascript:void(0);" class="btn waiting">开票中...</a>
                                <a v-else-if="item.orderInvoice && item.orderInvoice.status=='finish'" :href="item.orderInvoice.file" target="_blank" class="btn download_invoice" >下载发票</a>
                                <a v-else-if="item.orderInvoice && item.orderInvoice.status=='fail'" class="btn apply" v-tooltip="`请重新提交开票信息`" @click="toggle_order_invoice_modal(item)">开票失败</a>
                                <a v-else class="btn apply" @click="toggle_order_invoice_modal(item)">申请发票</a>
                            </template>
                            <!-- 支付按钮 -->
                            <a class="btn payment" v-if="item.orderStatus === 'unpaid' && !item.isExpired" @click="toggle_order_repay_modal(item)">付款</a>
                            <a href="javascript:void(0);" class="btn disable" v-else-if="item.isExpired">未支付</a>
                            <a href="javascript:void(0);" class="btn complete" v-else>已完成</a>
                            <!-- 删除订单 -->
                            <a href="javascript:void(0);" class="btn delete" v-if="item.orderStatus === 'unpaid'" @click="delete_order(item.sn)">&emsp;</a>
                        </div>
                    </div>
                    <!-- 幻币充值订单-->
                    <div class="list_body hcoinRecharge" v-else-if="item.orderType === 'memberHcoinRecharge'">
                        <!-- 订单商品列表（可多个） -->
                        <div class="product" v-for="(product, index) in item.orderItems" :key="index">
                            <div class="avatar">
                                <img :src="product.image"  alt=""/>
                            </div>
                            <div class="info">
                                <span class="name">{{ product.name }}</span>
                                <div class="remarks" v-if="item.memo">
                                    <p v-if="item.memo.hcoinRecharge >= 0">充值数量：{{ item.memo.hcoinRecharge }}幻币</p>
                                </div>
                            </div>
                        </div>
                        <!-- 总价 -->
                        <div class="price">
                            <span>
                                ￥<strong>{{ item.orderAmount }}</strong>
                            </span>
                        </div>
                        <!-- 订单操作 -->
                        <div class="opeartion">
                            <!-- 发票按钮 -->
                            <template v-if="item.orderStatus == 'completed'">
                                <a v-if="item.orderInvoice && item.orderInvoice.status=='waiting'" href="javascript:void(0);" class="btn waiting">等待开票</a>
                                <a v-else-if="item.orderInvoice && item.orderInvoice.status=='processing'" href="javascript:void(0);" class="btn waiting">开票中...</a>
                                <a v-else-if="item.orderInvoice && item.orderInvoice.status=='finish'" :href="item.orderInvoice.file" target="_blank" class="btn download_invoice" >下载发票</a>
                                <a v-else class="btn apply" @click="toggle_order_invoice_modal(item)">申请发票</a>
                            </template>
                            <!-- 支付按钮 -->
                            <a class="btn payment" v-if="item.orderStatus === 'unpaid' && !item.isExpired" @click="toggle_order_repay_modal(item)">付款</a>
                            <a href="javascript:void(0);" class="btn disable" v-else-if="item.isExpired">未支付</a>
                            <a href="javascript:void(0);" class="btn complete" v-else>已完成</a>
                            <a href="javascript:void(0);" class="btn delete" v-if="item.orderStatus === 'unpaid'" @click="delete_order(item.sn)">&emsp;</a>
                        </div>
                    </div>
                    <!-- 下载订单 -->
                    <template v-if="item.orderType === 'download'">
                        <!-- 模板、作品-->
                        <div class="list_body document" v-if="['template','worksShare'].indexOf(item.memo.downloadType) >= 0">
                            <!-- 订单商品列表（可多个） -->
                            <div class="product" v-for="(product, index) in item.orderItems" :key="index">
                                <div class="avatar">
                                    <img :src="product.image"  alt=""/>
                                </div>
                                <div class="info">
                                    <span class="name">{{ product.name }}</span>
                                    <div class="remarks" v-if="item.memo">
                                        <p v-if="item.memo.format">文件格式：{{ item.memo.format }}</p>
                                        <p v-if="item.memo.pageCount">文件页数：{{ item.memo.pageCount }}</p>
                                    </div>
                                </div>
                            </div>
                            <!-- 总价 -->
                            <div class="price">
                                <span>
                                    <strong>{{ item.orderAmount }}</strong>幻币
                                </span>
                            </div>
                            <!-- 订单操作 -->
                            <div class="opeartion">
                                <a href="javascript:void(0);" class="btn download" @click="download(item)">下载模板</a>
                            </div>
                        </div>
                        <!-- 素材 -->
                        <div class="list_body material" v-if="item.memo.downloadType === 'material'">
                            <!-- 订单商品列表（可多个） -->
                            <div class="product" v-for="(product, index) in item.orderItems" :key="index">
                                <div class="avatar material">
                                    <img :src="product.image" alt=""/>
                                </div>
                                <div class="info">
                                    <span class="name">{{ product.name }}</span>
                                    <div class="remarks" v-if="item.memo">
                                        <p v-if="item.memo.format">文件格式：{{ item.memo.format }}</p>
                                    </div>
                                </div>
                            </div>
                            <!-- 总价 -->
                            <div class="price">
                                <span>
                                    <strong>{{ item.orderAmount }}</strong>幻币
                                </span>
                            </div>
                            <!-- 订单操作 -->
                            <div class="opeartion">
                                <a href="javascript:void(0);" class="btn download"  @click="download(item,'material')">下载素材</a>
                            </div>
                        </div>
                    </template>
                </li>
            </ul>
            <div class="empty_list" v-else>
                <p>还没有创建订单哦~</p>
            </div>
        </div>
        <CommonFoot></CommonFoot>
        <!-- 申请发票弹窗 -->
        <div class="modal-backdrop apply_invoice" v-if="order_invoice_modal_show">
            <div class="modal">
                <div class="header">
                    <p class="title">填写发票信息</p><button class="modal-close" @click="toggle_order_invoice_modal"></button>
                </div>
                <div class="content">
                    <ul>
                        <li><label>发票类型</label><p>电子发票</p></li>
                        <li>
                            <label>发票选项</label>
                            <p>
                                <span :class="{'active':order_invoice_type=='personal'}" @click="toggle_order_invoice_type('personal')">
                                    <i></i>个人
                                </span>
                                <span :class="{'active':order_invoice_type=='enterprise'}" @click="toggle_order_invoice_type('enterprise')">
                                    <i></i>企业
                                </span>
                            </p>
                        </li>
                        <li v-show="order_invoice_type=='enterprise'">
                            <label>发票抬头</label><input type="text" placeholder="请输入发票抬头" v-model="order_invoice.title">
                        </li>
                        <li v-show="order_invoice_type=='enterprise'">
                            <label>纳税人识别号</label><input type="text" placeholder="请输入纳税人识别号" v-model="order_invoice.taxNumber">
                        </li>
                        <li>
                            <label>收票邮箱</label><input type="text" placeholder="请输入邮箱账号" v-model="order_invoice.email">
                        </li>
                        <li>
                            <label>发票金额</label><p>{{current_order.orderAmount}}元</p>
                        </li>
                        <li>
                            <label>发票内容</label><p>{{current_order.orderItems[0].name}}</p>
                        </li>
                    </ul>
                    <button class="submit" :class="{'disable':!check_order_invoice || order_invoice_submitting}" @click="order_invoice_submit">提交</button>
                </div>
                <div class="apply_invoice_footer">
                    <div class="tips">
                        <span style="color:#999999">*提交成功后，会发送至您的邮箱</span>
                    </div>
                </div>
            </div>
        </div>
        <!-- 重新支付弹窗 -->
        <transition name="modal-fade">
            <div class="modal-backdrop repay_modal" v-if="order_repay_modal_show">
                <div class="modal repay">
                    <a class="modal-back" @click="toggle_order_repay_modal"></a>
                    <div class="body">
                        <span class="tip">订单详情：{{current_order.orderItems[0].name}}</span>
                        <div class="qrcode">
                            <canvas id="qrcode_canvas"></canvas>
                        </div>
                        <div class="info">
                            <div class="icon">
                                <img src="~@/assets/common/images/ali_pay_icon.png" alt="">
                                <img src="~@/assets/common/images/wechat.png" alt="">
                            </div>
                            <span class="tip">使用支付宝/微信扫码付款</span>
                            <div class="price">支付金额：<span><i>￥{{Number(current_order.orderAmount).toFixed(2)}}</i></span></div>
                        </div>
                    </div>
                </div>
            </div>
        </transition>
    </div>
</template>

<script>
import CommonHead from '@/components/nav/CommonHead.vue';
import CommonFoot from '@/components/nav/CommonFoot.vue';
import Vue from 'vue';
import QRCode from 'qrcode';
Vue.use(QRCode);
export default {
    name: 'MemberOrder',
    components: { CommonHead, CommonFoot },
    metaInfo: {
        title: '吾道-我的订单',
        meta:[
            {
                property: 'og:title',
                content: '吾道-我的订单'
            },
            {
                property: 'og:url',
                content: 'https://www.woodo.cn/member/order/'
            },
        ]
    },
    data () {
        return {
            user: {},
            orderlist: [{}, {}],
            current_order: {},
            order_invoice:{},
            order_invoice_type:'personal',
            order_repay_modal_show : false,
            order_invoice_modal_show : false,
            order_invoice_submitting:false,
        }
    },
    watch: {
        orderlist () {
            $(this.$refs.orderSkeleton).removeClass('skeleton');
        }
    },
    mounted () {
        this.user = this.$common.get_login_state();
        this.get_orderlist();
    },
    computed:{
        check_order_invoice:function(){
            let that = this;
            let result = true;
            if(!that.order_invoice.email){
                result = false;
            }
            if(that.order_invoice_type === 'enterprise'){
                if(!that.order_invoice.title || !that.order_invoice.taxNumber){
                    result = false;
                }
            }
            return result;
        }
    },
    methods: {
        // 获取订单列表
        get_orderlist () {
            let that = this;
            that.$axios.get('/api/member/my_order/').then((result)=>{
                let data = result.data;
                if (data.type === 'success') {
                    data = data.data;
                    let index_arr = [];
                    // 数据处理
                    data.forEach((item, index) => {
                        item.paymentUrl = `/payment/${item.sn}`;
                        item.createDate = utils.dateFormat(new Date(item.createDate), 'yyyy-MM-dd');
                        item.expireDate = item.memo || '';
                        item.productInformation = '';
                        if (item.memo) {
                            try {
                                item.memo = JSON.parse(item.memo);
                                // 新版会员信息处理
                                if (item.orderType === 'memberVip' && item.memo.memberRank) {
                                    item.productInformation = `${item.memo.memberRankTime}`;
                                    if (item.memo.quantity > 1) {
                                        item.productInformation += `    ${item.memo.quantity}个席位`;
                                    }
                                    item.expireDate = `到期：${utils.dateFormat(new Date(item.memo.memberRankExpire), 'yyyy-MM-dd')}`;
                                }
                            } catch (error) {
                                item.memo = {};
                            }
                        }
                    });
                    // 删除文档下载的记录，避免影响空状态的判断
                    data = data.filter(item => {
                        if (item.orderType !== 'download' || item.memo.downloadType !== 'document')
                            return item;
                    })
                    that.orderlist = data;
                } else {
                    that.$toast('获取订单列表失败', 800);
                }
            }).catch((err)=>{
                console.log(err);
                that.$toast('获取订单列表失败', 800);
            });
        },
        // 删除订单
        delete_order (order_sn) {
            let that = this;
            if (!order_sn) return;
            that.$axios.post('/api/member/order/delete/', {
                sn: order_sn
            }).then((result)=>{
                let data = result.data;
                that.$toast(data.content, 1500, ()=>{
                    if (data.type === 'success') {
                        that.get_orderlist();
                    }
                });
            }).catch((err)=>{
                console.log(err);
                that.$toast('删除订单失败', 800);
            });
        },
        // 下载模板
        download (item,type) {
            let that = this;
            let progress = {};
            if (type === 'material') {
                progress = null;
            } else {
                progress = {
                    modalClass: 'export-progress template',
                    modalTitle: '下载文件',
                    modalContent: '文件正在下载中，请耐心等待'
                };
            }
            that.$export.start({
                fileType: 'ppt',
                title: item.orderItems[0].name,
                cover: item.memo.iconUrl,
                param: {
                    opt: `${item.memo.downloadType}Download`,
                    id: item.memo.id,
                },
                progress: progress,
                error: function(){
                    that.$toast("下载失败，请稍后重试！",1000);
                }
            });
        },
        // 隐藏或显示订单支付弹框
        toggle_order_repay_modal:function(order){
            let that = this;
            that.order_repay_modal_show = !that.order_repay_modal_show;
            if(that.order_repay_modal_show){
                //订单支付
                that.order_repay(order);
            }
        },
        // 订单支付
        order_repay:function(order){
            let that = this;
            if(!order){
                return;
            }
            that.current_order = order;
            that.$nextTick(function(){
                var sn = that.current_order.sn;
                QRCode.toCanvas($('#qrcode_canvas')[0],`${window.location.origin}/mobile/payment/transfer/?sn=${sn}`, {
                    width: 183,
                    errorCorrectionLevel: 'Q',
                }).catch((err) => {
                    console.error(err);
                });
                that.order_status(sn);
            });
        },
        // 订单状态检测
        order_status:function(sn){
            let that = this;
            that.$pay.new.order_status(sn, {
                success (data) {
                    that.toggle_order_repay_modal();
                    that.get_orderlist();  
                },
                complete () {
                    if(!that.order_repay_modal_show){
                        return;
                    }
                    setTimeout(function(){
                        that.order_status(sn);
                    },2000);
                },
            });
        },
        // 隐藏或显示订单发票弹框
        toggle_order_invoice_modal:function(order){
            let that = this;
            that.order_invoice_modal_show = !that.order_invoice_modal_show;
            that.order_invoice = {};
            if(that.order_invoice_modal_show){
                that.current_order = order;
            }
        },
        // 切换发票选项
        toggle_order_invoice_type:function(order_invoice_type){
            let that = this;
            that.order_invoice_type = order_invoice_type;
        },
        // 发票表单提交
        order_invoice_submit:function(){
            let that = this;
            if(that.order_invoice_submitting){
                return;
            }
            if(!$validate(that.order_invoice.email).email()){
                return that.$toast('收票邮箱格式不正确',800);
            }
            that.order_invoice_submitting = true;
            that.$axios.post('/api/member/order/invoice/',{
                sn: that.current_order.sn,
                type: that.order_invoice_type,
                taxNumber: that.order_invoice.taxNumber || null,
                title: that.order_invoice.title || null,
                email: that.order_invoice.email,
            }).then(function(result){
                if(result.data.type == 'success'){
                    that.$toast('申请发票成功', 2000);
                    that.toggle_order_invoice_modal();
                    that.get_orderlist();
                }
                that.order_invoice_submitting = false;
            }).catch((err)=>{
                console.log(err);
                that.$toast('申请发票失败', 2000);
                that.order_invoice_submitting = false;
            });
        },
    },
}
</script>

<style lang="less" scoped>
@import url("~@/assets/pc/css/common.css");
@member_sp: url('~@/assets/pc/images/member/member_sp.png') no-repeat;
@skeleton: #f1f1f1;

.order_container {
    width: 100%;
    height: 100%;
}

.footer {
    background-color: transparent;
}

.order_main {
    position: relative;
    width: 1250px;
    padding: 20px 32px;
    margin: 28px auto 0;
    min-height: calc(100% - 144px);
    background-color: #ffffff;
    border-radius: 2px;
    &.skeleton {
        .order_list > li {
            position: relative;
            height: 167px;
            border: none;
            .list_head {
                background-color: @skeleton;
                span {
                    display: none;
                }
            }
            .list_body {
                display: none;
            }
            &::before, &::after {
                content: "";
                position: absolute;
                top: 47px;
                left: 0;
                height: 120px;
                background-color: @skeleton;
            }
            &::before {
                width: 160px;
            }
            &::after {
                left: 167px;
                right: 0;
            }
        }
    }
    .title {
        margin-bottom: 16px;
        font-size: 18px;
        color: #272727;
    }
    .empty_list {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        width: 300px;
        height: 350px;
        margin: auto;
        &::before {
            content: "";
            display: block;
            margin: 0 auto 5px;
            width: 300px;
            height: 300px;
            background: url(~@/assets/common/images/empty.png) no-repeat center center;
            background-size: contain;
        }
        p {
            line-height: 24px;
            color: #aaa;
            font-size: 14px;
            text-align: center;
        }
    }
}
.order_list > li {
	border: solid 1px #e5e5e5;
    background-color: #ffffff;
    &+li {
        margin-top: 25px;
    }
    &.un_payment {
        border-color: #fbf0d9;
        .list_head::before {
            background-color: #fdf8ee;
        }
        .list_body .opeartion,
        .list_body .price {
            border-color: #fdf8ee;
        }
    }
    &.expired {
        border-color: #f2f2f2;
        .list_head{
            background-color: #f2f2f2;
        }
        .list_body .opeartion,
        .list_body .price {
            border-color: #f2f2f2;
        }
    }
    .list_head {
        height: 40px;
        line-height: 40px;
        padding: 0 18px 0 15px;
        background-color: #f1f8ff;
        color: #565656;
        font-size: 12px;
    }
    .list_body {
        position: relative;
        .product {
            padding: 0 410px 0 15px;
            height: 125px;
            line-height: 125px;
        }
        .avatar {
            display: inline-block;
            vertical-align: middle;
            position: relative;
            width: 180px;
            height: 100px;
            line-height: 96px;
            user-select: none;
            overflow: hidden;
            text-align: center;
            img{
                width: 100%;
                height: 100%;
            }
            &.memberVip{
                background-color: #edf9ff;
                img {
                    width: auto;
                    height: auto;
                }
            }
            &.material{
                border: solid 1px #e6e6e6;
                img{
                    display: inline-block;
                    vertical-align: middle;
                    width: auto;
                    height: auto;
                    max-width: 100%;
                    max-height: 100%;
                }
            }
        }
        .info {
            position: relative;
            display: inline-block;
            vertical-align: middle;
            width: calc(100% - 210px);
            height: 100px;
            line-height: 1.4;
            margin-left: 30px;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
        }
        .name {
            font-size: 16px;
            color: #373838;
            &.professional {
                color: var(--mainColor);
            }
            &.premium {
                color: #eeb361;
            }
        }
        .remarks {
            position: absolute;
            bottom: 0;
            left: 0;
            font-size: 12px;
            color: #717171;
            * {
                white-space: nowrap;
            }
        }
        .price {
            position: absolute;
            right: 270px;
            top: 0;
            bottom: 0;
            width: 125px;
            border-left: 1px solid #e1effd;
            text-align: center;
            color: #ff0000;
            font-size: 14px;
            font-family: 'Arial';
            white-space: nowrap;
            span {
                display: inline-block;
                vertical-align: middle;
            }
            strong {
                font-size: 28px;
            }
        }
        .opeartion {
            position: absolute;
            width: 270px;
            right: 0;
            top: 0;
            bottom: 0;
            padding-right: 18px;
            border-left: 1px solid #e1effd;
            text-align: right;
            &::after {
                content: "";
                display: inline-block;
                vertical-align: middle;
                width: 0;
                height: 0;
                font-size: 0;
            }
            .btn {
                display: inline-block;
                vertical-align: middle;
                width: 74px;
                height: 30px;
                line-height: 30px;
                border-radius: 15px;
                background-color: #bfddfe;
                font-size: 14px;
                color: #ffffff;
                text-align: center;
                & + .btn {
                    margin-left: 15px;
                }
                &.disable {
                    background-color: #dadada;
                    cursor: no-drop;
                }
                &.complete{
                    cursor: no-drop;
                }
                &.payment {
                    background-color: #ff0000;
                }
                &.download{
                    background-color: var(--mainColor);
                }
                &.delete {
                    width: 30px;
                    border-radius: 0;
                    background: url(~@/assets/common/images/delete.png) no-repeat center center;
                }
                &.apply,&.download_invoice{
                    width: 110px;
                    height: 32px;
                    line-height: 32px;
                    border-radius: 21px;
                    border: solid 1px #cccccc;
                    color: #666666;
                    background-color: #ffffff;
                }
                &.waiting{
                    width: 110px;
                    height: 32px;
                    background-color: #ffffff;
                    color: #666666;
                }
            }
        }
        .price::after,
        .opeartion::after {
            content: "";
            display: inline-block;
            vertical-align: middle;
            width: 0;
            height: 100%;
        }
    }
}

// 申请发票弹窗
.apply_invoice .modal{
    width: 500px;
	height: 700px;
    padding: 40px 50px;
    border-radius: 10px;
    background-color: #ffffff;
    color: #666666;
    .header{
        .title{
            font-size: 28px;
            margin-bottom: 20px;
            color: #333333;
            font-weight: bold;
        }
        .modal-close{
            top: 52px;
            right: 42px;
        }
    }
    .content{
        position: relative;
        height: 520px;
        padding: 30px 0 10px 0;
        border-top: 1px solid #eeeeee;
        border-bottom: 1px solid #eeeeee;
        ul li{
            display: flex;
            align-items: center;
            width: 400px;
            height: 38px;
            margin-bottom: 20px;
            label{
                display: inline-block;
                width: 116px;
            }
            p{
            display: flex;
            width: 284px;
            span{
                display: flex;
                align-items: center;
                margin-right: 28px;
                cursor: pointer;
                &.active i{
                    border: 5px solid #0b7bf7;
                }
            }
            i{
                display: inline-block;
                width: 16px;
                height: 16px;
                margin-right: 8px;
                border-radius: 50%;
                border: 1px solid #999999;
                box-sizing: border-box;
            }
            }
            input{
                width: 284px;
                height: 38px;
                padding: 9px 10px;
                outline: 1px solid #cccccc;
            }
        }
        .submit{
            position: absolute;
            right: 0;
            bottom: 20px;
            width: 168px;
            height: 56px;
            border-radius: 10px;
            font-size: 16px;
            color: #ffffff;
            background-color: #0b7bf7;
            &.disable{
                background-color: #dadada;
                pointer-events:none;
            }
        }
    }
    .apply_invoice_footer{
        position: absolute;
        left: 0;
        bottom: 0;
        width: 100%;
        padding: 20px 50px;
        .tips{
            display: flex;
            justify-content: space-between;
            align-items: center;
            height: 17px;
            font-size: 13px;
        }
    }
}
// 重新支付弹窗
.repay{
    width: 100%;
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    background-color: #ffffff;
    .modal-back{
        position: fixed;
        top: 30px;
        left: 26px;
        display: inline-block;
        width: 16px;
        height: 28px;
        background: #ffffff url('~@/assets/common/images/back.png') center center;
        background-size: cover;
    }
    .body{
        width: 394px;
        height: 643px;
        display: flex;
        justify-content: center;
        align-items: center;
        flex-direction: column;
        .tip{
            height: 30px;
            margin-bottom: 18px;
            font-size: 28px;
        }
        .qrcode{
            display: flex;
            justify-content: center;
            align-items: center;
            width: 224px;
            height: 224px;
            margin-top: 20px;
            margin-bottom: 60px;
            background: #ffffff url('~@/assets/common/images/qrcode_bg.png');
            background-size: cover;
            #qrcode_canvas{
                width: 183px;
                height: 185px;
            }
        }
        .info{
            width: 100%;
            display: flex;
            justify-content: center;
            flex-direction: column;
            .icon{ 
                height: 48px;
                display: flex;
                justify-content: center;
                margin-bottom: 19px;
                font-size: 16px;
                color: #999999;
                img{
                    display: inline-block;
                    width: 48px;
                    height: 48px;
                    margin-right: 10px;
                    border-radius: 50%;
                }
            }
            .tip{
                width: 100%;
                font-size: 16px;
                font-weight: normal;
                color: #999999;
                text-align: center;
            }
            .price{
                height: 83px;
                line-height: 83px;
                margin-top: 28px;
                font-size: 20px;
                font-weight: normal;
                text-align: center;
                color: #999999;
                i{
                    font-size: 60px;
                    color: #0b7bf7;
                    text-indent: 20px;
                }
            }
        }
    }
}
</style>
<style>
/* 本页需单独背景*/
body {
    background-color: #f4f7fa;
}
</style>