<template>
    <div class="special_container">
        <div class="special-content">
            <h1 class="title">幻币使用说明</h1>
            <section>
                <p class="section_title">什么是幻币？</p>
                <div class="section_content">幻币是吾道推出的虚拟货币，主要用于购买站内模板/素材下载权限，幻币可以通过做任务获取，也可以直接付费充值，<span>1幻币=1元RMB</span>，幻币不能兑换现金，不能转赠，不能购买除下载外的其它付费服务。</div>
            </section>
            <section>
                <p class="section_title">如何使用幻币？</p>
                <div class="section_content">非VIP会员用户可使用幻币购买单个模板/素材的永久下载权，计费方式按详情页所示；<span>VIP会员用户可直接下载所有模板/素材，无需使用幻币。</span></div>
            </section>
            <section>
                <p class="section_title">幻币获取方式</p>
                <div class="section_content">
                    <p>[  01  ]</p>
                    <p>可直接<span>使用<strong>RMB</strong>付费充值</span></p>
                    <br>
                    <p>[  02  ]</p>
                    <p>用户首次注册成功即<span>送<strong>5</strong>幻币</span></p>
                    <br>
                    <p>[  03  ]</p>
                    <p>每天登录<span>赠送<strong>2</strong>幻币</span></p>
                    <br>
                    <p>[  04  ]</p>
                    <p>在PC端文档中心右下角通过指定链接邀请好友注册成功<span>+<strong>3</strong>幻币</span>/人，同一个IP段地址重复注册视为无效邀请。</p>
                    <img src="../../assets/wap/images/hcoin_special/1.png" alt=""/>
                    <p>[  05  ]</p>
                    <p>每创建一份有效文档<span>+<strong>5</strong>幻币</span>，有效文档定义为编辑次数>500次，用户可通过PC端编辑界面底栏提醒查看当前操作次数；</p>
                    <img src="../../assets/wap/images/hcoin_special/2.png" alt=""/>
                    <p>[  06  ]</p>
                    <p>邀请好友成功加入协作文档<span>+<strong>2</strong>幻币/人</span>，单个文档计数上限为5人；<small class="right">位置：文档中心--权限设置</small></p>
                    <img src="../../assets/wap/images/hcoin_special/3.png" alt=""/>
                    <p>[  07  ]</p>
                    <p>提交共享作品，每审核通过一份赠送<span>+<strong>5</strong>幻币</span></p>
                </div>
            </section>
        </div>
        <a href="/mobile/home/" class="back_home" v-if="!miniprogram">返回文档中心</a>
    </div>
</template>

<script>
export default {
    name: 'HcoinSpecial',
    metaInfo: {
        title: '吾道-幻币专题',
        meta: [
            {
                name: 'viewport',
                content: "width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0"
            },
            {
                property: 'og:title',
                content: '吾道-幻币专题'
            },
            {
                property: 'og:url',
                content: 'https://www.woodo.cn/mobile/hcoin/special/'
            },
        ]
    },
    data () {
        return {
            miniprogram: false,
        }
    },
    mounted () {
        let that = this;
        utils.isMiniProgramENV().then((res)=>{
            if (res.miniprogram) that.miniprogram = res.miniprogram;
        });
    },
}
</script>

<style lang="less" scoped>
@import url("../../assets/wap/css/common.css");
.special_container {
    width: 100%;
    height: 100%;
    padding-top: 13.8rem;
    background: var(--mainColor) url(../../assets/wap/images/hcoin_special/banner.png) no-repeat top center;
    background-size: contain;
}
.special-content {
    position: relative;
    margin: 0 0.7rem 0.5rem;
    padding: 0.7rem;
    line-height: 1.6;
    border-radius: 0.5rem;
    background-color: #2031af;
    &::before {
        content: "";
        position: absolute;
        top: -1.4rem;
        right: 0;
        width: 2.8rem;
        height: 2.8rem;
        background: url(../../assets/wap/images/hcoin_special/decorate_1.png) no-repeat center center;
        background-size: contain;
    }
    img {
        display: block;
        width: 100%;
    }
    .title {
        position: relative;
        margin-bottom: 1.5rem;
        font-size: 1.05rem;
        color: #fff;
        font-weight: bold;
        text-align: center;
        &::before,
        &::after {
            content: "";
            position: absolute;
            top: 50%;
            left: 50%;
            margin-top: -0.25rem;
            width: 0.5rem;
            height: 0.5rem;
            background: url(../../assets/wap/images/hcoin_special/decorate_2.png) no-repeat center center;
            background-size: contain;
        }
        &::before {
            margin-left: -4em;
        }
        &::after {
            margin-left: calc(4em - 0.5rem);
            transform: rotateY(180deg);
        }
    }
    section {
        position: relative;
        margin-bottom: 2rem;
        &::after {
            content: "";
            position: absolute;
            right: 0;
            bottom: -0.5rem;
            width: 1rem;
            height: 1rem;
            background: url(../../assets/wap/images/hcoin_special/decorate_3.png) no-repeat center center;
            background-size: contain;
        }
        &:last-child {
            margin-bottom: 0;
        }
        &:last-child::after {
            display: none;
        }
        .section_title {
            position: relative;
            display: inline-block;
            padding: 0.2rem 0.4rem;
            margin-bottom: 0.8rem;
            color: #fff;
            font-weight: bold;
            border-radius: 0.2rem;
            background-color: #fbb82b;
            &::before {
                content: "";
                position: absolute;
                left: 0;
                bottom: -0.3rem;
                width: 0.6rem;
                height: 0.6rem;
                background: url(../../assets/wap/images/hcoin_special/decorate_4.png) no-repeat center center;
                background-size: contain;
            }
        }
        .section_content {
            font-size: 0.73rem;
            color: #fff;
            img + p {
                margin-top: 1rem;
            }
            img {
                margin: 1rem auto 0;
            }
            span {
                color: #fbb82b;
            }
            small {
                color: #ffffff;
                opacity: 0.6;
                font-size: 0.6rem;
            }
        }
    }
}
.back_home {
    display: block;
    line-height: 2rem;
    margin-bottom: 0.5rem;
    font-size: 0.8rem;
    color: #fff;
    text-align: center;
}
</style>
<style>
body {
    background-color: #0d7bf8;
}
</style>

