<template xmlns:v-clipboard="http://www.w3.org/1999/xhtml">
    <div class="share_common_modal">
        <!--微信分享提示-->
        <transition name="modal_fade">
            <div class="wechat_share_friend_tips" v-show="show_wechat_share_tip">
                <div class="inner">
                    <img src="../assets/wap/images/display/close_icon.png" @click="toggle_share_tips" />
                </div>
            </div>
        </transition>

        <!-- 分享海报展示 -->
        <poster_modal ref="poster_modal"
            :poster_type="`wap`"
            :document_type="share_options.type"
            :document_info="share_options.document"
            :document_pages="share_options.document_pages"
            :qrcode_url="qrcode_dataurl"
            :author="share_options.author"
        ></poster_modal>

        <!-- 发送邮箱弹窗 -->
        <transition name="modal-fade">
            <div class="modal-backdrop" v-show="send_email_modal">
                <div class="modal send_email_modal">
                    <div class="modal-header">
                        <div class="modal-title">分享到邮箱</div>
                    </div>
                    <div class="modal-body">
                        <input type="email" name="email" v-model="email" placeholder="输入邮箱地址" />
                    </div>
                    <div class="modal-footer">
                        <button class="button" @click="close_email_modal">取消</button>
                        <button class="button" v-if="sending">发送中...</button>
                        <button class="button" v-else @click="send_email">发送</button>
                    </div>
                </div>
            </div>
        </transition>

        <!--二维码-->
        <div class="qrcode_modal" v-show="show_qrcode_modal" @click="toggle_qrcode_modal">
            <div class="code_contain" @click.stop>
                <img v-show="qrcode_dataurl" :src="qrcode_dataurl" alt=""/>
                <base-logo v-show="false" type="code" id="canvas_logo" width="40" height="40"></base-logo>
                <p class="save_tip">长按二维码图片保存</p>
            </div>
        </div>

        <!-- 下载文档 只用到发送邮件 -->
        <export_modal ref="export_modal" v-show="false"></export_modal>

        <!-- 链接过期弹框 -->
        <div class="doc_expire_modal" v-if="show_expire_modal">
            <div class="modal_header" v-if="share_options.is_popup"><p @click="close_expire_modal">返回</p></div>
            <div class="modal_contain">
                <div class="expire_tip">
                    <img src="../assets/wap/images/common/expire_tip.png">
                    <p>文档访问链接已过期，他人无法访问<br>{{share_options.is_mine ? '请先修改有效期' : '请联系所有者修改'}}</p>
                    <button v-if="share_options.is_mine" @click="show_set_expire">修改链接有效期</button>
                </div>
                <!-- 有效期设置 -->
                <set_expire ref="set_expire" :document_info="share_options.document" @update_expire="update_expire"></set_expire>
            </div>
        </div>
    </div>
</template>

<script>
	import Vue from 'vue'
    import QRCode from 'qrcode';
    import poster_modal from '@/components/PosterModal.vue';
    import export_modal from '@/components/WapExportModal.vue';
    import set_expire from '@/components/WapSetExpire.vue';
    Vue.use(QRCode);
    export default {
        name: "DocShareView",
        components: {
            export_modal,
            poster_modal,
            set_expire,
        },
		data() {
			return {
                user: {},
                share_options: {},
                // 是否可分享标识
                can_share: true,
                // 微信分享提示相关
                show_wechat_share_tip: false,
                // 邮箱发送功能类
                email: '',                      // 邮箱号
                send_email_modal: false,        // 是否显示发送邮箱弹窗
                sending: false,                 // 邮件发送中
                // 二维码标识
                show_qrcode_modal: false,
                qrcode_dataurl: '',
                // 链接过期弹框
                show_expire_modal: false,
			}
		},
		methods: {
            show: function(obj){
                let that = this;
                let share_options = {
                    is_popup: true,
                    is_mine: true,
                    is_urlEffect: true,
                    document: {},
                    document_pages: [],
                    type: '',
                    title: '',
                    author: '',
                    share_url: '',
                };
                that.share_options = Object.assign(share_options, obj);
                that.user = that.$common.get_login_state();
                // jsonstring 序列化
                that.share_options.document = that.$common.document_dataparse(that.share_options.document);
                that.share_options.document_pages = that.$common.document_pages_dataparse(that.share_options.document_pages);
                // 链接过期拦截
                if (!that.share_options.is_urlEffect) {
                    that.can_share = false;
                    if(!that.share_options.is_popup) that.show_expire_modal = true;
                }else{
                    that.can_share = true;
                }
                that.init_wx_share();
            },
            // 微信分享提示
            toggle_share_tips:function(){
                let that = this;
                // 过期拦截
                if(!that.can_share) return that.show_expire_modal = true;
                that.show_wechat_share_tip = !that.show_wechat_share_tip;
            },
            init_wx_share: function () {
                let that = this;
                // 微信端 调用微信分享接口
                if (utils.deviceENV().wechat) {
                    let title = that.share_options.title + '-吾道',
                        desc = (that.user.name || '您的好友') + '向您分享了一份幻灯片文档，请点击查阅';
                    that.$common.get_wexin_sdk(title, desc, that.share_options.share_url);
                }
                // 绘制二维码
                that.create_doc_code();
            },
            // 生成分享二维码
            create_doc_code: function () {
                let that = this;
                let size = 150;
                let logo = document.getElementById('canvas_logo');
                QRCode.toCanvas(that.share_options.share_url, {
                    width: size,
                    errorCorrectionLevel: 'Q',
                }).then((canvas) => {
                    let ctx = canvas.getContext('2d');
                    // 绘制logo
                    ctx.drawImage(logo, size / 2 - 20, size / 2 - 20, 40, 40);
                    let data_url = canvas.toDataURL('image/png', 1);
                    that.qrcode_dataurl = data_url;
                }).catch((err) => {
                    console.error(err);
                });
            },

            // 生成海报相关
            create_doc_poster:function(){
                let that = this;
                // 过期拦截
                if(!that.can_share) return that.show_expire_modal = true;
                if (that.share_options.document_pages && that.share_options.document_pages.length === 0) {
                    return that.$toast('数据正在加载', 1000, 'wap');
                }
                that.$refs.poster_modal.show();
            },

            // 打开发送邮箱弹窗
            open_email_modal: function () {
                let that = this;
                // 过期拦截
                if(!that.can_share) return that.show_expire_modal = true;
                if (!that.share_options.document.id) {
                    return that.$toast('数据正在加载', 800, 'wap');
                }
                that.send_email_modal = true;
            },
            close_email_modal: function () {
                this.send_email_modal = false;
                this.sending = false;
                this.email = '';
            },
            send_email: function () {
                let that = this;
                if (!$validate(that.email).email()) {
                    return that.$toast('邮箱号码无效！', 800, 'wap');
                }
                that.$refs.export_modal.show(that.share_options.document.id, that.share_options.title);
                that.$refs.export_modal.email = that.email;
                that.$refs.export_modal.download('email');
                var timer = setInterval(() => {
                    that.sending = that.$refs.export_modal.sending;
                    if (!that.$refs.export_modal.sending) {
                        clearInterval(timer);
                        that.close_email_modal();
                    }
                }, 200);
            },
            // 关闭二维码
            toggle_qrcode_modal:function(){
                let that = this;
                if (!that.share_options.document.id) {
                    return that.$toast('数据正在加载', 800, 'wap');
                }
                that.show_qrcode_modal = !that.show_qrcode_modal;
            },

            // 有效期设置
            show_set_expire: function(){
                this.$refs.set_expire.show({uneffect:true});
            },
            // 有效期更新
            update_expire: function(obj){
                let that = this;
                that.can_share = true;
                that.share_options.is_urlEffect = true;
                that.share_options.document.isUrlEffect = true;
                that.share_options.document.urlExpireType = obj.key;
                that.share_options.document.urlExpireDate = new Date().getTime();
                that.close_expire_modal();
            },
            // 关闭过期弹框
            close_expire_modal: function(){
                let that = this;
                that.show_expire_modal = false;
                if(!that.share_options.is_popup){
                    setTimeout(() => {
                        history.back(-1);
                    }, 300);
                }
            },
        },
	}
</script>

<style lang="less" scoped>
    @import url("../assets/wap/css/common.css");

    // 二维码
    .qrcode_modal{
        position: absolute;
        top: 0;
        left: 0;
        z-index: 12;
        width: 100%;
        height: 100%;
        background:rgba(0,0,0,0.5);
        text-align: center;
        font-size: 0;
        &::after{
            content: "";
            display:inline-block;
            width:0;
            height:100%;
            vertical-align:middle;
        }
        .code_contain{
            display: inline-block;
            vertical-align: middle;
            width: 85%;
            height: auto;
            padding: 0.75rem;
            border-radius:0.2rem;
            background-color: #ffffff;
            img {
                display: block;
                margin: 0 auto;
            }
        }
        .save_tip{
            line-height: 2.2rem;
            font-size: 0.7rem;
            color:#6f6f6f;
        }
    }
    // 微信分享提示
    .wechat_share_friend_tips{
        position: fixed;
        top: 0;
        left: 0;
        z-index: 12;
        width: 100vw;
        height: 100vh;
        background-color: rgba(0,0,0,0.6);
        .inner{
            width:100%;
            height:100%;
            background:url(../assets/wap/images/doc/share_tips.png) no-repeat center 1rem;
            background-size:90%;
            img{
                width: 1rem;
                height: 1rem;
                position: absolute;
                left: 50%;
                top: 75%;
                margin-left: -0.5rem;
            }
        }
    }
    .send_email_modal {
        .modal-title {
            text-align: center;
            font-size: 0.9rem;
            color: #313131;
        }
        .modal-body {
            padding-top: 1rem;
            input {
                display: block;
                width: 100%;
                height: 2.2rem;
                line-height: 2.2rem;
                padding: 0.5rem;
                background-color: #ffffff;
                border-radius: 0.1rem;
                border: solid 1px rgba(0, 0, 0, 0.21);
                transition: all 0.3s;
                &:focus {
                    border-color: var(--mainColor);
                }
            }
        }
        .modal-footer {
            padding: 0;
            margin-top: 1rem;
            border-top: 1px solid #d6dbe6;
            font-size: 0;
            .button {
                width: 50%;
                height: 2.8rem;
                margin: 0 auto;
                color: #626262;
                font-size: 0.65rem;
                border-radius: 0;
                background-color: transparent;
                &:last-child {
                    border-left: 1px solid #d6dbe6;
                    color: var(--mainColor);
                }
            }
        }
    }
    .doc_expire_modal{
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-color: #fff;
        text-align:center;
        transition: all 0.3s;
        overflow: hidden;
        z-index:12;
        &::after{
            content:'';
            position:relative;
            display:inline-block;
            width:0;
            height:100%;
            vertical-align:middle;
        }
        .modal_header{
            width:100%;
            height:2.37rem;
            line-height:2.37rem;
            text-align:left;
            p{
                display:inline-block;
                vertical-align:top;
                margin-left:0.85rem;
                font-size:0.8rem;
                color:#202329;
                &::before{
                    content:"";
                    display:inline-block;
                    vertical-align:middle;
                    width: 0.53rem;
                    height: 0.88rem;
                    margin:0 0.6rem 0.2rem 0;
                    background:url(../assets/wap/images/common/back.png) no-repeat center/contain;
                }
            }
        }
        .modal_contain{
            display: inline-block;
            vertical-align: middle;
            width: 100%;
            margin-top: -4.74rem;
        }
        .expire_tip{
            text-align: center;
            img{
                width: 8.67rem;
            }
            p{
                margin-top: 1.3rem;
                font-size: 0.73rem;
                color: #000;
            }
            button{
                width: 90%;
                height: 2.5rem;
                line-height: 2.5rem;
                margin-top: 3.23rem;
                background-color: #1c7cf4;
                border-radius: 0.13rem;
                font-size: .73rem;
                font-weight: bold;
                color: #fff;
            }
        }
    }
</style>
