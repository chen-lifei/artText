<template>
    <div class="order_container">
        <h1 class="page_title">
            <a class="back" @click="back_prev"></a>
            订单记录
        </h1>
        <!-- 订单列表 -->
        <!-- 1.未支付未过期   2.未支付已过期  3.已完成-->
        <ul class="order_main skeleton" ref="orderSkeleton" v-if="orderlist.length">
            <li class="order_list" 
                v-for="(item, index) in orderlist" 
                v-if="item.orderType !== 'download' || item.memo.downloadType !== 'document'"
                :key="index"
                :class="{'un_payment': item.orderStatus === 'unpaid' && !item.isExpired, 'expired': item.isExpired}"
            >
                <div class="list_head">
                    <span class="time">{{ item.createDate }}</span>
                    <span class="sn">订单编号：{{ item.sn }}</span>
                </div>
                <!-- 会员订单 -->
                <div class="list_body" v-if="item.orderType === 'memberVip'">
                    <!-- 订单商品列表（可多个） -->
                    <div class="product_body" 
                        v-for="(product, index) in item.orderItems"
                        :key="index"
                    >
                        <div class="avatar">
                            <img :src="product.image"  alt=""/>
                        </div>
                        <p class="name">{{ product.name }}</p>
                        <p class="price">
                            ￥{{ item.orderAmount }}
                        </p>
                        <p class="endtime">{{ item.expireDate }}</p>
                    </div>
                </div>
                <!-- 幻币订单 -->
                <div class="list body" v-else-if="item.orderType === 'memberHcoinRecharge'">
                    <!-- 订单商品列表（可多个） -->
                    <div class="product_body hcoin" 
                        v-for="(product, index) in item.orderItems"
                        :key="index"
                    >
                        <div class="avatar">
                            <img src="../../assets/wap/images/order/hcoin.png"  alt=""/>
                        </div>
                        <p class="name">{{ product.name }}</p>
                        <p class="price">
                            ￥{{ item.orderAmount }}
                        </p>
                        <p class="recharge_number" v-if="item.memo">充值数量：{{ item.memo.hcoinRecharge }}幻币</p>
                    </div>
                </div>
                <!-- 模板、 作品订单 -->
                <div class="list body" v-else-if="item.orderType === 'download' && ['template','worksShare'].indexOf(item.memo.downloadType) >= 0">
                    <!-- 订单商品列表（可多个） -->
                    <div class="product_body document" 
                        v-for="(product, index) in item.orderItems"
                        :key="index"
                    >
                        <div class="avatar">
                            <img :src="product.image"  alt=""/>
                        </div>
                        <p class="name">{{ product.name }}</p>
                        <p class="price">
                            {{ item.orderAmount }}<span>幻币</span>
                        </p>
                        <p class="doc_type"> 文件格式：{{ item.memo['format'] }} </p>
                        <p class="page_count"> 文件页数：{{ item.memo['pageCount'] }} </p>
                    </div>
                </div>
                <!-- 素材订单 -->
                <div class="list body" v-else-if="item.orderType === 'download' && item.memo.downloadType === 'material'">
                    <!-- 订单商品列表（可多个） -->
                    <div class="product_body material" 
                        v-for="(product, index) in item.orderItems"
                        :key="index"
                    >
                        <div class="avatar">
                            <img :src="product.image" alt="" />
                        </div>
                        <p class="name">{{ product.name }}</p>
                        <p class="price">
                            {{ item.orderAmount }}<span>幻币</span>
                        </p>
                        <p class="doc_type"> 文件格式：{{ item.memo['format'] }} </p>
                    </div>
                </div>
                <!-- 订单操作 -->
                <div class="list_opeartion">
                    <template v-if="item.orderType === 'download'">
                        <a href="javascript:void(0);" class="btn download" @click="download(item)">下载</a>
                    </template>
                    <template v-else>
                        <a href="javascript:void(0);" class="btn delete" v-if="item.orderStatus === 'unpaid'" @click="delete_order(item.sn)">&emsp;</a>
                        <!-- 支付按钮 -->
                        <a href="javascript:void(0);" class="btn payment" v-if="item.orderStatus === 'unpaid' && !item.isExpired" @click="payment(item.sn)">去付款</a>
                        <a href="javascript:void(0);" class="btn disable" v-else-if="item.isExpired">未支付</a>
                        <a href="javascript:void(0);" class="btn" v-else>已完成</a>
                    </template>
                </div>
            </li>
        </ul>
        <div class="empty_list" v-else>
            <p>还没有创建订单哦~</p>
        </div>
    </div>
</template>

<script>
export default {
    name: 'OrderView',
    metaInfo: {
        title: '吾道-我的订单',
        meta: [{
            name: 'viewport',
            content: "width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0"
        }],
    },
    data () {
        return {
            orderlist: [{} ,{}],            // 列表  数据模拟
        }
    },
    watch: {
        orderlist () {
            $(this.$refs.orderSkeleton).removeClass('skeleton');
        }
    },
    mounted () {
        this.get_orderlist();
    },
    methods: {
        // 获取订单列表
        get_orderlist () {
            let that = this;
            that.$axios.get('/api/member/my_order/').then((result)=>{
                let data = result.data;
                if (data.type === 'success') {
                    data = data.data;
                    // 数据处理
                    data.forEach((item) => {
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
                    that.orderlist = data;
                } else {
                    that.$toast('获取订单列表失败', 1000, 'wap');
                }
            }).catch((err)=>{
                console.log(err);
                that.$toast('获取订单列表失败', 1000, 'wap');
            });
        },
        // 唤起支付
        payment (order_sn) {
            window.location.href = `/mobile/payment/transfer/?sn=${order_sn}`;
        },
        // 下载模板
        download (item) {
            let that = this;
            if(utils.deviceENV().ios){
                that.$toast('IOS用户暂不支持下载文件', 1000, 'wap');
                return;
            }
            if (item.memo.downloadType === 'material') {
                that.$toast('素材暂不支持手机端下载，请在电脑端进行下载', 1000, 'wap');
                return;
            }
            that.$export.start({
                fileType: 'ppt',
                title: item.orderItems[0].name,
                param: {
                    opt: `${item.memo.downloadType}Download`,
                    id: item.memo.id,
                },
                progress: {
                    modalClass: 'export-progress mobile-document',
                    modalTitle: '正在导出你的文件......',
                    modalContent: '由于跨平台技术，导出PPTX/PDF等格式文件时可能会出现样式偏差，请调整后使用'
                },
                error: function(){
                    that.$toast("下载失败，请稍后重试！",1000,'wap');
                }
            });
        },
        // 下载素材
        download_material (item) {
            let that = this;
            if(utils.deviceENV().ios){
                that.$toast('IOS用户暂不支持下载文件', 1000, 'wap');
                return;
            }
            that.$export.start({
                title: item.orderItems[0].name,
                param: {
                    opt: 'materialDownload',
                    id: item.memo.id,
                },
                error: function(){
                    that.$toast("下载失败，请稍后重试！",1000,'wap');
                }
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
                that.$toast(data.content, 1000, 'wap');
                if (data.type === 'success') {
                    that.get_orderlist();
                }
            }).catch((err)=>{
                console.log(err);
                that.$toast('删除订单失败', 1000, 'wap');
            });
        },
        // 回上一页  如果上一页是账号设置页 则调用 back()
        back_prev () {
            if (!!document.referrer && /\/?$/.test(document.referrer.replace(/^http(s)?:\/\/(.*?)\//, ""))) {
                window.history.back();
            } else {
                window.location.href = '/mobile/member/';
            }
        },
    },
}
</script>

<style lang="less" scoped>
@import url("../../assets/wap/css/common.css");
@skeleton: #f1f1f1;

.order_container {
    position: relative;
    width: 100%;
    min-height: 100%;
    padding: 0 0.85rem 0.85rem;
    background-color: #f8fbff;
}

.page_title {
    position: relative;
    padding-top: 0.2rem;
    line-height: 1.8rem;
    margin-bottom: 0.85rem;
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
    a.back {
        position: absolute;
        left: 0.2rem;
        top: 50%;
        margin-top: -0.25rem;
        width: 0.7rem;
        height: 0.7rem;
        border: solid 0.1rem #afb5bc;
        border-right: transparent;
        border-top: transparent;
        transform: rotate(45deg);
    }
}

.order_main.skeleton {
    .order_list::before,
    .order_list::after {
        content: "";
        position: absolute;
        background-color: @skeleton;
    }
    .order_list::before {
        top: 1rem;
        left: 1rem;
        width: 3.6rem;
        height: 3.6rem;
    }
    .order_list::after {
        left: 5.1rem;
        top: 1rem;
        right: 1rem;
        height: 1rem;
        box-shadow: 0 1.8rem @skeleton;
    }
    .list_head {
        font-size: 0;
        border: none;
    }
    .list_opeartion {
        display: none;
    }
}

.order_list {
    position: relative;
    width: 100%;
    min-height: 5.6rem;
    padding: 0 0.5rem 0.5rem;
    background-color: #ffffff;
	border-radius: 0.17rem;
    box-shadow: 0rem 0.05rem 0.13rem 0rem rgba(0, 0, 0, 0.05);
    &+.order_list {
        margin-top: 0.8rem;
    }
    .list_head {
        display: flex;
        justify-content: space-between;
        height: 1.4rem;
        line-height: 1.4rem;
        border-bottom: 0.02rem solid rgba(232, 232, 232, 0.8);
        font-size: 0.5rem;
        color: #999999;
        font-family: Arial;
    }
    .product_body {
        position: relative;
        margin-top: 0.4rem;
        height: 3.4rem;
        padding-left: 3.9rem;
        .avatar {
            position: absolute;
            top: 0;
            left: 0;
            width: 3.4rem;
            height: 3.4rem;
            background-color: #f9f9f9;
            border-radius: 0.17rem;
            overflow: hidden;
        }
        img {
            width: 100%;
            height: 100%;
        }
        .name {
            padding-right: 3rem;
            margin-bottom: 0.7rem;
            font-size: 0.8rem;
            color: #393939;
            font-weight: bold;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
        }
        .price {
            position: absolute;
            right: 0;
            top: 0;
            font-size: 0.6rem;
            color: #ff0000;
            font-weight: bold;
            span {
                font-size: 0.88rem;
                font-family: Arial;
            }
        }
        .more_info {
            padding-right: 3rem;
            font-size: 0.55rem;
            color: #393939;
            white-space: pre-wrap;
        }
        .endtime {
            padding-right: 3rem;
            font-size: 0.55rem;
            color: #999999;
            white-space: pre-wrap;
        }
        .recharge_number{
            position: absolute;
            bottom: 0.15rem;
            left: 3.9rem;
            font-size: 0.56rem;
            color: #696969;
        }
        .doc_type, .page_count{
            color: #646464;
            font-size: 0.52rem;
            line-height: 1;
        }
        &.hcoin{
            .avatar img{
                width: 100%;
                height: 100%;
                margin: auto;
            }
            .name{
                font-weight: normal;
                font-size: 0.73rem; 
            }
            .price{
                font-size: 0.83rem;
                span{
                    font-size: 0.56rem;
                }
            }
        }
        &.document{
            padding-left: 6.15rem;
            .avatar{
                width: 5.7rem;
            }
            .name{
                margin-bottom: 1rem;
                font-weight: normal;
                font-size: 0.73rem; 
            }
            .price{
                font-size: 0.83rem;
                span{
                    font-size: 0.56rem;
                }
            }
            .doc_type{
                margin-bottom: .25rem;
            }
        }
        &.material{
            padding-left: 6.15rem;
            .avatar{
                width: 5.7rem;
                text-align: center;
                img{
                    width: auto;
                    height: auto;
                    max-width: 100%;
                    max-height: 100%;
                }
                .icon{
                    position: absolute;
                    top: 0;
                    right: 0;
                    bottom: 0;
                    left: 0;
                    margin: auto;
                }
            }
            .name{
                margin-bottom: 1.85rem;
                font-weight: normal;
                font-size: 0.73rem; 
            }
            .price{
                font-size: 0.83rem;
                span{
                    font-size: 0.56rem;
                }
            }
        }
    }
    .list_opeartion {
        position: absolute;
        bottom: 0.5rem;
        right: 0.5rem;
        .btn {
            display: inline-block;
            padding: 0 0.55rem;
            height: 1.4rem;
            line-height: 1.4rem;
            font-size: 0.6rem;
            color: #ffffff;
            background-color: #bfddfe;
            border-radius: 1rem;
            & + .btn {
                margin-left: 0.4rem;
            }
            &.disable {
                background-color: #dadada;
            }
            &.payment {
                background-color: #fc5e5e;
            }
            &.delete {
                width: 1.4rem;
                height: 1.4rem;
                border-radius: 0;
                background: url(../../assets/common/images/delete.png) no-repeat center center;
            }
            &.download {
                width: 3.1rem;
                text-align: center;
                background: var(--mainColor);
            }
        }
    }
}

.empty_list {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    width: 8rem;
    height: 10rem;
    margin: auto;
    &::before {
        content: "";
        display: block;
        margin: 0 auto 0.6rem;
        width: 8rem;
        height: 8rem;
        background: url(../../assets/common/images/empty.png) no-repeat center center;
        background-size: contain;
    }
    p {
        font-size: 0.6rem;
        color: #aaa;
        text-align: center;
    }
}

</style>