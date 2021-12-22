<template>
    <transition name="modal-fade">
        <div class="modal-backdrop" v-if="isShow">
            <div class="close_area" @click="hide"></div>
            <div class="modal export_modal" :class="{'vip': is_vip}" v-show="panel_type === 'init'">
                <h3 class="doc_name" v-if="is_vip">{{doc_name}}</h3>
                <div class="modal-header" v-else>
                    <h3>{{doc_name}}</h3>
                    <div class="hcoin_panel">
                        <span class="use_hcoin"><i>{{ is_bought ? 0 : doc_price }}</i>幻币</span>
                        <span class="hcoin_total">幻币余额：{{ user_hcoin }}幻币<a href="/mobile/hcoin/special/">?</a></span>
                    </div>
                    <div class="cost_panel">
                        <a href="/mobile/member/recharge/" class="get_hcoin">充值幻币</a>
                        <a href="/mobile/member/upgrade/" class="get_vip">开通会员任意下载</a>
                    </div>
                </div>
                <div class="modal-body">
                    <div class="format">
                        <p class="title">选择格式</p>
                        <ul class="format_list">
                            <li v-for="(value, name, index) in export_format" :key="index" :class="[name, {'checked': name === checked_format && value, 'disable': !value}]" @click="select_format(value, name)"></li>
                        </ul>
                    </div>
                    <div class="send_email">
                        <p class="title">发送到邮箱</p>
                        <div class="send">
                            <input type="email" name="email" placeholder="请输入邮箱地址..." v-model="email" />
                            <button v-if="sending">发送中</button>
                            <button @click="download('email')" v-else>发送</button>
                        </div>
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="btn cancel" @click="hide">取消</button>
                    <button class="btn download_phone" v-if="loading">下载中...</button>
                    <button class="btn download_phone" v-else @click="download('file')">下载到手机</button>
                </div>
            </div>

            <div class="modal complete_modal" v-show="panel_type === 'complete'">
                <div class="modal-header">
                    <span class="modal-title">您的文件已成功导出！</span>
                </div>
                <div class="modal-body">
                    <p>文档应该已自动开始导出，如果没有反应，<br>请<a :href="down_src" :download="doc_title" target="_blank">点击下载</a></p>
                </div>
                <div class="modal-footer">
                    <button type="button" class="button button-cancel" @click="hide">&emsp;取消&emsp;</button>
                </div>
            </div>
        </div>
    </transition>
</template>

<script>
export default {
    name: 'WapExportModal',
    props: ['doc_name'],
    data () {
        return {
            // 下载信息
            isShow: false,                                  // 是否显示弹窗   show()   hide() 控制隐藏显示
            panel_type: 'init',                             // 显示面板  init=默认面板   complete=下载完成
            email: '',                                      // 下载邮件的邮箱号
            export_format: {                                // 下载的格式
                'ppt': true,
                'pdf': true,
                'image': true,
            },
            checked_format: 'ppt',                          // 默认选中的格式
            loading: false,                                 // 下载中
            sending: false,                                 // 发送中
            down_src: '',                                   // 文档下载地址
            // 文档信息
            doc_id: null,                                   // 文档id
            doc_title: '',                                  // 文档标题
            doc_price: 0,                                   // 文档价格
            // 幻币信息
            user_hcoin: 0,                                  // 持有幻币量
            is_bought: false,                               // 是否已购买,
            is_vip: false,                                   // 是否会员
            doc_type: 'document',                           // 下载的文档类型  文档 || 模板 || 作品
        }
    },
    mounted () {
    },
    methods: {
        // 显示弹窗  初始化数据
        show (id, title, type) {
            if (!id) {
                return;
            }
            let that = this;
            let is_miniprogram = false;
            let wx_miniprogram = {};
            // 判断小程序环境
            utils.isMiniProgramENV().then(res =>{
                is_miniprogram = true;
                wx_miniprogram = res.wx.miniProgram;
            }).catch((res) =>{
                console.error("error " + res);
            });
            // 未登录拦截
            if (!that.$common.get_login_state().login) {
                if (is_miniprogram) {
                    let redirectUrl = escape('/pages/document_detail/document_detail?redirectUrl=');
                    let redirectParam = escape(location.pathname + location.search);
                    wx_miniprogram.redirectTo({url:'/pages/login/login?redirectUrl='+redirectUrl + '&redirectParam='+redirectParam});   
                } else {
                    that.$toast('请登录后再进行操作', 2000, 'wap');
                    setTimeout(() => {
                        let redirect_url = encodeURI(window.location.pathname + window.location.search);
                        window.location.href = '/mobile/login/?redirectUrl=' + redirect_url;
                    }, 2000);
                }
                return;
            };
            that.doc_id = id;
            that.doc_title = title || '吾道文档';
            that.checked_format = 'ppt';
            that.email = '';
            that.loading = false;
            that.sending = false;
            that.panel_type = 'init';
            that.progresscount = 0;
            that.isShow = true;
            that.$parent.no_scroll = true;
            that.doc_type = type || that.doc_type;
            that.get_download_order_info();
        },
        hide () {
            this.isShow = false;
            this.$parent.no_scroll = false;
        },
        // 获取幻币信息及会员信息
        get_download_order_info () {
            let that = this;
            that.$axios.get('/api/member/order/get_create_download_order_info/', {
                params: {
                    id: that.doc_id,
                    downloadType: that.doc_type,
                }
            }).then((result)=>{
                let data = result.data;
                if (data.type === 'success') {
                    data = data.data;
                    that.is_bought = data.bought;
                    that.user_hcoin = data.memberHcoin;
                    that.doc_price = data.price;
                    // 判断是否是会员
                    that.is_vip = data.memberIsEffectVip;
                } else {
                    that.$toast('获取幻币信息失败', 1000, 'wap');
                }
            }).catch((err)=>{
                that.$toast('获取幻币信息失败', 1000, 'wap');
            });
        },
        // 下载格式选择
        select_format (value, name) {
            if (!value) return;
            this.checked_format = name;
        },
        // 导出文件
        download(down_type){
            let that = this;
            if (down_type === 'email' && !$validate(that.email).email()) {
                that.$toast('邮箱号码无效！', 1000, 'wap');
                return;
            }
            if (down_type === 'file' && utils.deviceENV().ios) {
                that.$toast('IOS用户暂不支持下载文件', 1000, 'wap');
                return;
            }
            // 获取文档下载信息
            that.$export.start({
                title: that.doc_title,
                fileType: that.checked_format,
                emailAddress: down_type === 'email' ? that.email : null,
                param: {
                    opt: `${that.doc_type}Download`,
                    id: that.doc_id,
                },
                progress: {
                    modalClass: 'export-progress mobile-document',
                    modalTitle: down_type === 'email' ? '正在发送至邮箱......' : '正在导出你的文件......',
                    modalContent: '由于跨平台技术，导出PPTX/PDF等格式文件时可能会出现样式偏差，请调整后使用'
                },
                success: function() {
                    if (down_type === 'email') {
                        that.sending = true;
                    } else {
                        that.loading = true;
                    }
                },
                fail: function() {
                    that.sending = false;
                    that.loading = false;
                },
                error: function(){
                    that.sending = false;
                    that.loading = false;
                    that.download(down_type);
                },
                complete: function(type){
                    that.sending = false;
                    that.loading = false;
                    if (type === 'cancel') {
                        return;
                    }
                    if (down_type === 'file') {
                        if (type === 'success') {
                            that.panel_type = 'complete';
                        } else {
                            that.$toast('下载文件失败，请稍后重试', 1000, 'wap');
                        }
                    }
                }
            });
        },
    }
}
</script>

<style lang="less" scoped>
@import url('../assets/wap/css/common.css');
.modal-backdrop {
    z-index: 113;
}
.close_area{
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: transparent;
    z-index: -1;
}
.modal.export_modal {
    bottom: 0;
    top: 100%;
    width: 100%;
    height: 25.8rem;
    padding-top: 7.5rem;
    border-radius: 0;
    overflow: visible;
    .modal-footer {
        padding: 0 0.88rem;
    }
    .modal-header {
        position: absolute;
        top: -0.8rem;
        left: 5%;
        width: 90%;
        height: 6.65rem;
        padding: .8rem .9rem 0 1.05rem;
        background-color: #ffffff;
        box-shadow: 0rem 0.25rem 0.45rem 0rem rgba(50, 57, 69, 0.19);
        border-radius: 0.52rem;
        border: solid 0.05rem #e6e6e6;
        h3{
            position: relative;
            margin-bottom: 1.15rem;
            font-size: 0.83rem;
            font-weight: bold;
            color: #262626;
            &::before{
                content: '';
                position: absolute;
                top: .1rem;
                left: -1.05rem;
                width: .25rem;
                height: .9rem;
                background-color: var(--mainColor);
            }
        }
        .hcoin_panel{
            position: relative;
            display: flex;
            justify-content: space-between;
            align-items: flex-end;
            margin-bottom: .4rem;
            span{
                font-size: 0.52rem;
                color: #3c3c3c;
                font-weight: 500;
            }
            i{
                color: #ff4e4e;
                font-size: 1.04rem;
                font-style: normal;
            }
            .hcoin_total a {
                display: inline-block;
                width: .62rem;
                height: .62rem;
                margin-left: 0.3rem;
                font-size: 0.52rem;
                color: #ffffff;
                background-color: #c9c9c9;
                border-radius: 50%;
                text-align: center;
            }
        }
        .cost_panel{
            display: flex;
            justify-content: space-between;
            align-items: flex-end;
            line-height: 1.1rem;
            .get_hcoin{
                display: inline-block;
                height: 1.1rem;
                padding: 0 .2rem;
                color: #ff4e4e;
                font-size: .52rem;
                border-radius: 0.1rem;
                border: solid 0.05rem #ff4e4e;
                text-align: center;
            }
            .get_vip{
                font-size: 0.63rem;
                color: var(--mainColor);
            }
        }
    }
    .modal-body {
        padding-top: 0;
        .title {
            margin-bottom: 0.4rem;
            font-size: 0.63rem;
            font-weight: bold;
            font-family: MicrosoftYaHei-Bold;
            color: #3c3c3c;
        }
        .format {
            margin-bottom: 1.65rem;
        }
        .format_list {
            display: flex;
            justify-content: space-between;
            li {
                width: 32%;
                height: 4.2rem;
                background-color: #ffffff;
                border: solid 0.08rem #ffffff;
                border-radius: 0.17rem;
                background-repeat: no-repeat;
                background-position: center center;
                background-size: cover;
                transition: all 0.3s;
                &.checked {
                    border-color: #f85207;
                }
                &.disable {
                    opacity: 0.5;
                }
                &.ppt {
                    background-image: url(../assets/wap/images/common/export_ppt.png);
                }
                &.pdf {
                    background-image: url(../assets/wap/images/common/export_pdf.png);
                }
                &.image {
                    background-image: url(../assets/wap/images/common/export_image.png);
                }
            }
        }
        .send_email {
            .title{
                margin-bottom: .75rem;
            }
            .send{
                display: flex;
                justify-content: space-between;
                width: 100%;
                height: 2.1rem;
                border: solid 0.05rem #bfc5ce;
                border-radius: 0.1rem;
                input { 
                    display: inline-block;
                    width: calc(100% - 3.55rem);
                    padding: 0 0.5rem;
                    background-color: #ffffff;
                    font-size: 0.63rem;
                    height: 100%;
                    &:focus {
                        border-color: var(--mainColor);
                    }
                    &::-webkit-input-placeholder {
                        color: #bfbfbf;
                    }
                }
                button{
                    width: 3.55rem;
                    height: 100%;
                    color: #ffffff;
                    background-color: #04c978;
                    font-size: 0.73rem;
                    border-radius: 0;
                }
            }
        }
    }
    .modal-footer {
        position: absolute;
        bottom: 1.7rem;
        left: 0;
        width: 100%;
        .btn {
            display: inline-block;
            width: calc(50% - 0.415rem);
            line-height: 2.65rem;
            border-radius: 0.14rem;
            font-size: 0.73rem;
            font-weight: bold;
            font-family: MicrosoftYaHei-Bold;
            color: #fff;
            &.cancel {
                float: left;
                background-color: #ccd6e2;
            }
            &.download_phone {
                float: right;
                background-color: var(--mainColor);
            }
        }
        &:after{
            content: '';
            display: block;
            height: 0;
            clear: both;
            visibility: hidden;
        }
    }
    &.vip{
        height: 21.3rem;
        padding-top: 0;
        .doc_name{
            position: relative;
            line-height: 3rem;
            color: #262626;
            font-size: .83rem;
            font-weight: bold;
            text-align: center;
        }
    }
}

.modal.complete_modal {
    .modal-header {
        position: relative;
        padding: 0;
        text-align: center;
        background: #202255 url(../assets/pc/images/doc/down_tips.png) no-repeat center top;
        background-size: contain;
        &::before {
            content: "";
            display: block;
            padding-top: 68%;
        }
        .modal-title {
            position: absolute;
            left: 0;
            right: 0;
            color: #fff;
            margin-top: -2rem;
        }
    }
    .modal-body {
        padding-top: 1rem;
        text-align: center;
        p {
            font-size: 0.6rem;
        }
        a {
            text-decoration: underline;
            color: #169bd6;
        }
    }
    .modal-footer {
        text-align: center;
    }
}
@media screen and (max-height : 570px) {
    .modal.export_modal{
        height: 22.8rem;
        padding-top: 6.5rem; 
    }
}
</style>

<style lang="less">
.modal.send_success_modal {
    width: 10rem;
    background: transparent;
    box-shadow: none;
    border-radius: 0;
    .modal-close::before,
    .modal-close::after {
        background-color: #fff;
    }
    .modal-body {
        .success_icon {
            width: 8rem;
            height: 8rem;
            margin: 0 auto;
            background: url(../assets/wap/images/order/payment_status_success.png) no-repeat center center;
            background-size: contain;
        }
        p {
            font-size: 1rem;
            color: #3695ff;
            text-align: center;
        }
    }
}
</style>