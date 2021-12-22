<template>
    <div class="grade_container">
        <div class="grade_content">
            <p class="content_title">升级会员</p>
            <ul class="grade_cards" ref="grade_container">
                <li class="card free" :class="{'checked': ready_upgrade_type === 'free'}" @click="selected_grade('free')">
                    <div class="name">免费版</div>
                    <div class="subname">仅适用于个人体验</div>
                    <div class="price">
                        <span>0</span>元
                    </div>
                </li>
                <li class="card personal" :class="{'checked': ready_upgrade_type === 'personal'}" @click="selected_grade('personal')">
                    <div class="name">{{ personal.rankTypeDesc }}</div>
                    <div class="subname">仅适用于个人使用</div>
                    <div class="price">
                        低至<span>{{ personal.minUnitPirce }}</span>元/月
                    </div>
                </li>
                <li class="card enterprise" :class="{'checked': ready_upgrade_type === 'enterprise'}" @click="selected_grade('enterprise')">
                    <div class="name">{{ enterprise.rankTypeDesc }}</div>
                    <div class="subname">适用于任何规模的企业、团队或组织</div>
                    <div class="price">
                        低至<span>{{ Math.ceil(enterprise.minUnitPirce / 12) }}</span>元/人/月
                    </div>
                </li>
                <li class="card custom" :class="{'checked': ready_upgrade_type === 'custom'}" @click="selected_grade('custom')">
                    <div class="name">定制版</div>
                    <div class="subname">适用于有特定需求的企业客户</div>
                    <div class="price">咨询顾问</div>
                </li>
            </ul>
        </div>
        <div class="power_content">
            <p class="content_title">会员权益</p>
            <ul class="power_list free" v-if="ready_upgrade_type === 'free'">
                <li><span>创建文档数量</span><span>10份</span></li>
                <li><span>文档页面数量</span><span>20页</span></li>
                <li><span>模板库</span><span>部分模板</span></li>
                <li><span>单文档协作成员</span><span>5人</span></li>
                <li><span>单图片上传体积</span><span>2MB</span></li>
                <li><span>图片储存空间</span><span>100MB</span></li>
                <li><span>团队成员</span><span>10人</span></li>
            </ul>
            <ul class="power_list personal" v-else-if="ready_upgrade_type === 'personal'">
                <li><span>创建文档数量</span><span>不限</span></li>
                <li><span>文档页面数量</span><span>100页</span></li>
                <li><span>文档下载量</span><span>不限</span></li>
                <li><span>素材下载量</span><span>不限</span></li>
                <li><span>模板库</span><span>所有模板</span></li>
                <li><span>图视库</span><span class="checklist"></span></li>
                <li><span>案例库</span><span class="checklist"></span></li>
                <li><span>单文档协作成员</span><span>不限</span></li>
                <li><span>单图片上传体积</span><span>50MB</span></li>
                <li><span>图片储存空间</span><span>10GB</span></li>
            </ul>
            <ul class="power_list enterprise" v-else-if="ready_upgrade_type === 'enterprise'">
                <li><span>使用人数</span><span>不限</span></li>
                <li><span>创建文档数量</span><span>不限</span></li>
                <li><span>文档页面数量</span><span>200页</span></li>
                <li><span>单文档协作成员</span><span>不限</span></li>
                <li><span>单图片上传体积</span><span>100MB</span></li>
                <li><span>图片储存空间</span><span>20GB</span></li>
                <li><span>文档下载量</span><span>不限</span></li>
                <li><span>文件下载格式</span><span>PPTX / PNG / PDF</span></li>
                <li><span>团队成员</span><span>不限</span></li>
                <li><span>团队项目空间</span><span class="checklist"></span></li>
                <li><span>团队成员管理</span><span class="checklist"></span></li>
                <li><span>专属客服顾问</span><span class="checklist"></span></li>
                <li><span>去除广告</span><span class="checklist"></span></li>
            </ul>
            <ul class="power_list custom" v-else-if="ready_upgrade_type === 'custom'">
                <li><span>支持私有化部署</span></li>
                <li><span>支持SDK接入</span></li>
                <li><span>支持行业解决方案</span></li>
            </ul>
        </div>
        <a href="javascript:;" class="upgrade_btn" v-if="ready_upgrade_type === 'personal' && personal.isUpVip" @click="to_submit">立即升级</a>
        <a href="javascript:;" class="upgrade_btn" v-else-if="ready_upgrade_type === 'enterprise'" @click="to_submit">立即升级</a>
        <a href="javascript:;" class="upgrade_btn" v-else-if="ready_upgrade_type === 'custom'" @click="consultant">立即咨询</a>
    </div>
</template>

<script>
export default {
    name: 'MemberGrade',
    metaInfo: {
        title: '吾道-会员升级',
        meta: [
            {
                name: 'viewport',
                content: "width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0"
            },
            {
                property: 'og:title',
                content: '吾道-会员升级'
            },
            {
                property: 'og:url',
                content: 'https://www.woodo.cn/mobile/member/upgrade/'
            },
        ]
    },
    data () {
        return {
            user: {},
            ready_upgrade_type: 'free',             // 准备升级的类型
            // 个人版会员
            personal: {
                isUpVip: true,
                rankType: 'personal',
                rankTypeDesc: '个人版',
                minUnitPirce: 129,
                list: [
                    {
                        id: 1,
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
                        id: 2,
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
                        id: 3,
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
                minUnitPirce: 149,
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
        }
    },
    mounted () {
        let that = this;
        that.user = that.$common.get_login_state();
        that.get_grade_info();
    },
    methods: {
        // 获取会员等级信息
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
                // 团队信息数据处理
                that.team_format(data);
                // 个人版会员数据处理
                that.personal_format(data.personal);
                // 企业版会员数据处理
                that.enterprise_format(data.enterprise);
            }).catch(err => {
                console.error(err);
                return that.$toast('获取会员信息失败！');
            });
        },
        // 会员商品日期处理
        product_dateformat(unit, value) {
            let unit_map = {
                'year': '年',
                'month': '个月',
                'day': '天',
            };
            return `${value}${unit_map[unit] || ''}`;
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
            var everyMonthPrices = [];
            personal_list.forEach(item => {
                item.timeTypeDesc = that.product_dateformat(item.timeUnit, item.timeValue);
                var everyMonthPrice;
                if(item.timeUnit === 'month'){
                    everyMonthPrice = Math.ceil(item.discountPrice / item.timeValue)
                }else if(item.timeUnit === 'year'){
                    everyMonthPrice = Math.ceil(item.discountPrice / (item.timeValue * 12))
                }
                if(everyMonthPrice){
                    everyMonthPrices.push(everyMonthPrice)
                }
            });
            if (personal_list.length) {
                that.personal.list = personal_list;
                that.personal.minUnitPirce = Math.min.apply(null, everyMonthPrices);
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
                that.enterprise.minUnitPirce = enterprise_list[0].discountPrice;
                that.enterprise.rankType = enterprise_list[0].rankType;
                that.enterprise.rankTypeDesc = enterprise_list[0].rankTypeDesc;
                that.enterprise.isUpVip = enterprise_list[0].isUpVip;
            }
        },
        // 选中会员等级
        selected_grade(type) {
            let that = this;
            that.ready_upgrade_type = type;
            // 卡片居中显示
            that.$nextTick(() => {
                let el = that.$refs.grade_container;
                let $check = el.querySelector('.card.checked');
                let el_width = el.clientWidth;
                let item_width = $check.clientWidth;
                let left = $check.offsetLeft - (el_width - item_width) / 2;
                $(el).animate({
                    'scrollLeft': left
                }, 200);
            });
        },
        // 跳转到订单支付页
        to_submit() {
            let that = this;
            if (!that.user.login) {
                return window.location.href = '/mobile/login/';
            }
            let type = that[that.ready_upgrade_type];
            if (!type) {
                return;
            }
            // 不可升级
            if (!type.isUpVip) {
                // 非团队管理员升级企业版
                if (that.ready_upgrade_type === 'enterprise' && !that.team.owner) {
                    that.enterprise_upgrade_warning();
                }
                return;
            }
            that.$router.push({
                path: '/mobile/member/order/submit/',
                query: {
                    'type': 'memberVip',
                    'memberVip': that.ready_upgrade_type,
                },
            });
        },
        // 非团队管理员升级企业版
        enterprise_upgrade_warning() {
            this.$modal({
                modalClass: 'admin_operate',
                modalTitle: '',
                modalContent: `<div><img src="${require(`@/assets/wap/images/common/warning_icon01.png`)}" alt="" /><p>只有团队管理员才能升级企业版会员哦！</p></div>`,
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
                modalContent: `<div><h2>咨询顾问</h2><p>企业客户咨询请微信扫码加关注</p><img src="${require(`@/assets/pc/images/common/service_code2.jpg`)}" alt="" /></div>`,
                showCancel: false,
                showClose: false,
                buttonSubmitTxt: '知道了',
                submitCallback: function(modal){
                    modal.close();
                },
            });
        },
    },
}
</script>

<style lang="less" scoped>
@import url("~@/assets/wap/css/common.css");
.grade_container {
    width: 100%;
    padding: 6rem 0 2.5rem;
    background: url("~@/assets/wap/images/member/grade_head_bg.png") no-repeat top center;
    background-size: contain;
}

.content_title {
    position: relative;
    font-size: 0.8rem;
    font-weight: bold;
    text-align: center;
    &::before,
    &::after {
        content: "";
        position: absolute;
        top: 50%;
        left: 50%;
        width: 0.8rem;
        height: 0.8rem;
        margin-top: -0.4rem;
        background-repeat: no-repeat;
        background-position: center center;
        background-size: 80%;
    }
    &::before {
        margin-left: -3.5em;
    }
    &::after {
        margin-left: calc(3em - 0.3rem);
        transform: rotateY(180deg);
    }
}

.grade_content {
    margin: 0 0.85rem;
    height: 7rem;
    margin-bottom: 1.2rem;
	background-image: linear-gradient(45deg, #3695ff 0%, #449cff 100%);
    border-radius: 0.43rem;
    box-shadow: 0 0.4rem 0.8rem -0.4rem #449cff;
    overflow: hidden;
    .content_title {
        line-height: 2.5rem;
        color: #ffffff;
        &::before,
        &::after {
            margin-top: -0.5rem;
            background-image: url(~@/assets/wap/images/member/title_decorate_1.png);
        }
    }
    .grade_cards {
        width: 100%;
        height: 5rem;
        padding-left: 0.5rem;
        text-align: center;
        font-size: 0;
        white-space: nowrap;
        overflow-y: hidden;
        overflow-x: auto;
        .card {
            display: inline-block;
            vertical-align: top;
            position: relative;
            width: 4.5rem;
            height: 3.8rem;
            padding: 0.25rem 0.4rem;
            margin-right: 0.5rem;
            background-color: #fff;
            border-radius: 0.2rem;
            text-align: center;
            font-size: 0.7rem;
            box-shadow: 0 0 0 rgba(0, 0, 0, 0.3);
            white-space: normal;
            transition: all .3s;
            &.checked::after {
                content: "";
                position: absolute;
                left: 0;
                bottom: -0.7rem;
                width: 100%;
                height: .2rem;
                background-color: #fff;
                border-radius: .1rem;
                opacity: 1;
                transition: all .3s;
            }
            &.free {
                .name,
                .subname,
                .price {
                    color: #76889d;
                }
                .price span {
                    color: #343d47;
                }
            }
            &.personal {
                .name,
                .subname {
                    color: #825624;
                }
                .price {
                    color: #ff5630;
                }
            }
            &.enterprise {
                .name {
                    color: #535d97;
                }
                .subname {
                    color: #825624;
                }
                .price {
                    color: #ff5630;
                }
            }
            &.custom {
                .name,
                .subname {
                    color: #6070d4;
                }
                .price {
                    color: #202020;
                }
            }
            .name {
                margin-bottom: 0.15rem;
                font-size: 0.8rem;
                font-weight: bold;
            }
            .subname {
                font-size: 0.35rem;
            }
            .price {
                position: absolute;
                left: 0;
                bottom: 0.25rem;
                width: 100%;
                font-size: 0.5rem;
                span {
                    font-size: 0.75rem;
                    font-weight: bold;
                }
            }
        }
        .card.enterprise {
            display: none;
        }
    }
}

.power_content {
    margin: 0 0.85rem;
    padding-bottom: 0.5rem;
    background-color: #ffffff;
    border-radius: 0.5rem;
    .content_title {
        line-height: 2.2rem;
        color: #525151;
        &::before,
        &::after {
            margin-top: -0.45rem;
            background-image: url(~@/assets/wap/images/member/title_decorate_2.png);
        }
    }
    .power_list {
        padding: 0 1rem;
        &.personal,
        &.enterprise {
            span + span {
                color: #b58346;
            }
        }
        &.custom {
            text-align: center;
        }
        li {
            height: 1.8rem;
            line-height: 1.8rem;
            font-size: 0.65rem;
            color: #393939;
            span + span {
                float: right;
            }
            span.checklist::before {
                content: "";
                display: inline-block;
                vertical-align: middle;
                width: 1rem;
                height: 1rem;
                background: url("~@/assets/wap/images/member/checked_icon.png") no-repeat;
                background-size: contain;
            }
        }
    }
}

.upgrade_btn {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    z-index: 2;
    height: 2.4rem;
    line-height: 2.4rem;
    font-size: 0.8rem;
    font-weight: bold;
    color: #ffffff;
    text-align: center;
    background-color: #0d7bf8;
    transition: all 0.2s;
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
// 管理员升级提示弹窗
.modal.admin_operate {
    .modal-body {
        height: auto;
        text-align: center;
        p {
            margin-bottom: 2rem;
            font-size: 0.69rem;
            color: #41464c;
        }
        img {
            display: block;
            width: 2.5rem;
            height: 2.5rem;
            margin: 0 auto 1.5rem;
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
</style>
