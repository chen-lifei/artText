<template xmlns:v-clipboard="http://www.w3.org/1999/xhtml">
    <div class="document_share_container" :style="{'background-color': show_authority ? '#f8f8f8' : '#ffffff'}">
        <base-logo class="watermark_logo" type="text" theme="gray"></base-logo>


        <template>
            <!-- 当前用户所属的文档 -->
            <transition name="modal-fade">
                <div class="authority_container" v-if="show_authority" :class="{'h5': is_h5}">
                    <div class="authority_info" @click="show_set_authority">
                        <p class="document_title">{{ document_title }}</p>
                        <p class="authority_describe">{{ document_authority[current_authority].describe }}</p>
                        <div class="expire_tip" v-if="!is_h5">{{document_expire_time === 0 ? '文档链接已过期' : `文档访问${document_expire_time}有效`}}</div>
                    </div>
                </div>
                <img v-else class="share_background" src="../../assets/wap/images/authority/doc_share_bg.png" alt="">
            </transition>
            <!-- 设置有效期 -->
            <a href="javascript:;" v-if="show_authority && !is_h5 && loaddone" class="expire_btn" @click="show_set_expire">设置文档分享有效期</a>
            
            <p style="margin-top: 10px; font-size: 0.6rem;">{{document_id_type}}：{{document_info.id}}</p>

            <div class="share_btn_group" v-show="loaddone">
                <div class="share_button" v-if="is_weixin" @click="toggle_share_tips">
                    <img src="../../assets/wap/images/authority/share_icon-1.png" alt=""/>
                    <span>微信好友</span>
                </div>
                <div class="share_button" @click="create_doc_poster">
                    <img src="../../assets/wap/images/authority/share_icon-2.png" alt=""/>
                    <span>朋友圈</span>
                </div>
                <div class="share_button" v-clipboard:copy="document_share_url" v-clipboard:success="url_copy_success" v-clipboard:error="url_copy_error">
                    <img src="../../assets/wap/images/authority/share_icon-3.png" alt=""/>
                    <span>复制链接</span>
                </div>
                <div class="share_button" v-if="use_send_email && user.login" @click="open_email_modal">
                    <img src="../../assets/wap/images/authority/share_icon-5.png" alt=""/>
                    <span>发送到邮箱</span>
                </div>
            </div>
        </template>

        <share_common_modal ref="share_common_modal"></share_common_modal>

        <!--权限设置-->
        <set_authority ref="set_authority"></set_authority>

        <!-- 有效期设置 -->
        <set_expire ref="set_expire" :document_info="document_info" @update_expire="update_expire"></set_expire>
    </div>
</template>

<script>
    import share_common_modal from '@/components/WapShareModal.vue';
    import set_authority from '@/components/WapSetAuthority.vue';
    import set_expire from '@/components/WapSetExpire.vue';
    import ws_client from '@/assets/common/js/ws_client.js';
    export default {
        name: "DocShareView",
        components: {
            set_authority,
            set_expire,
            share_common_modal
        },
        metaInfo () {
            return {
                title: this.document_title,
                meta: [
                    {
                        name: 'viewport',
                        content: "width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0"
                    },
                ]
            };
        },
        data() {
            return {
                user: {},
                loaddone: false,
                is_weixin: false,
                // 文档类型
                is_document: false,
                is_h5: false,
                is_template: false,
                is_works: false,
                // 文档相关信息
                document_info: {},
                document_pages: [],
                document_title: '',
                document_author: '',
                document_type: '',
                document_authority: {
                    'open': {
                        name: '任何人都可查看',
                        describe: '获得链接的人都可以查看',
                    },
                    'edit': {
                        name: '任何人都可编辑',
                        describe: '获得链接的人都可以编辑',
                    },
                    'exclusive': {
                        name: '指定专属成员',
                        describe: '仅指定的成员可查看/编辑',
                    },
                    'privacy': {
                        name: '私密',
                        describe: '仅自己可查看/编辑',
                    },
                },
                document_share_url: '',
                document_expire_time:'永久',
                // 当前文档的权限
                current_authority: 'open',
                use_send_email: false,          // 是否可以使用发邮件
                show_authority: false,          // 显示权限设置，仅对自己的文档显示
                document_id_type: '',           // 该文档的类型
            }
        },
        mounted() {
            const that = this;
            let param_id = that.$route.query.id;
            let param_url = that.$route.query.url;
            let type = that.$route.query.type;
            // 开启socket
            that.ws_init();
            // 获取用户信息
            that.user = that.$common.get_login_state();
            // 判断终端环境
            that.is_weixin = utils.deviceENV().wechat;
            // 根据文档类型显示对应内容
            that.is_document = type === 'mydoc';
            that.is_h5 = type === 'h5';
            that.is_template = type === 'template';
            that.is_works = type === 'works';
            that.document_type = type;
            switch (true) {
                case that.is_document:
                    that.document_id_type = '文档ID';
                    that.get_user_document_info(param_url);
                    break;
                case that.is_h5:
                    that.get_user_h5_info(param_url);
                    break;
                case that.is_template:
                    that.document_id_type = '模板ID';
                    that.get_template_document_info(param_id);
                    break;
                case that.is_works:
                    that.document_id_type = '共享作品ID';
                    that.get_work_document_info(param_id);
                    break;
            }
        },
        methods: {
            // socket 初始化
            ws_init:function(){
                try{
                    let that = this;
                    ws_client({
                        success : function(method){
                            that.ws_client_method = method;
                        },
                        error : function(msg){
                            console.error(msg);
                        }
                    });
                }catch(e){
                    console.error(e);
                }
            },

            // 获取用户文档信息
            get_user_document_info: function (sign) {
                let that = this;
                if (!sign) {
                    return that.$toast('获取文档信息失败', 2000, 'wap');
                }
                that.$axios.get('/api/document/get_share_doc_info/?url='+sign).then(function(res){
                    let res_data = res.data;
                    if(res_data.type !== 'success') {
                        that.$toast(res_data.content, 2000, 'wap');
                        return false;
                    }else{
                        if(!res_data.data.document.isUrlEffect){
                            that.$refs.share_common_modal.show({
                                is_mine: res_data.data.document.isMine,
                                document: res_data.data.document,
                                is_urlEffect: false,
                                is_popup: false,
                            });
                            return false;
                        }
                    }
                    that.loaddone = true;
                    let document_info = res_data.data.document;
                    let document_pages = res_data.data.documentPages;
                    that.document_info = document_info;
                    that.document_pages = document_pages;
                    that.document_title = document_info.title;
                    // 当前文档是否属于自己
                    that.show_authority = res_data.data.document.isMine;
                    that.current_authority = document_info.visitType || 'open';
                    // 获取文档链接有效期
                    that.document_expire_time = document_info.isUrlEffect ? (document_info.urlExpireDate ? utils.expireTime(document_info.urlExpireDate) : '永久') : 0;
                    // 分享链接
                    that.document_share_url = `${window.location.origin}/mobile/document/slides/${document_info.url}/`;
                    that.use_send_email = true;
                    // 获取文档作者信息
                    that.get_document_author_info(document_info.id, 'slide');
                }).catch((err) => {
                    console.error(err);
                });
            },
            // 获取h5文档信息
            get_user_h5_info: function (sign) {
                let that = this;
                if (!sign) {
                    return that.$toast('获取文档信息失败', 2000, 'wap');
                }
                that.$axios.get('/api/document/get_share_doc_info/?url='+sign).then(function(res){
                    let res_data = res.data;
                    if(res_data.type !== 'success') {
                        that.$toast(res_data.content, 2000, 'wap');
                        return false;
                    }else{
                        if(!res_data.data.document.isUrlEffect){
                            that.$refs.share_common_modal.show({
                                is_mine: res_data.data.document.isMine,
                                document: res_data.data.document,
                                is_urlEffect: false,
                                is_popup: false,
                            });
                            return false;
                        }
                    }

                    that.loaddone = true;
                    let document_info = res_data.data.document;
                    let document_pages = res_data.data.documentPages;
                    that.document_info = document_info;
                    that.document_pages = document_pages;
                    that.document_title = document_info.title;
                    // 当前文档是否属于自己
                    that.show_authority = res_data.data.document.isMine;
                    that.current_authority = document_info.visitType || 'open';
                    // 分享链接
                    that.document_share_url = `${window.location.origin}/mobile/h5/slides/${document_info.url}/`;
                    that.use_send_email = true;
                    // 获取文档作者信息
                    that.get_document_author_info(document_info.id, 'slide');
                }).catch((err) => {
                    console.error(err);
                });
            },
            // 获取模板文档信息
            get_template_document_info: function (sign) {
                let that = this;
                if (!sign) {
                    return that.$toast('获取文档信息失败', 2000, 'wap');
                }
                that.$axios.get(`/api/template/detail/${sign}/`).then(res => {
                    let res_data = res.data;
                    if(res_data.type !== 'success') {
                        return that.$toast(res_data.content, 2000, 'wap');
                    }
                    that.loaddone = true;
                    let document_info = res_data.data.document;
                    let document_pages = res_data.data.documentPages;
                    that.document_info = document_info;
                    that.document_pages = document_pages;
                    that.document_title = res_data.data.template.name;
                    // 分享链接
                    that.document_share_url = `${window.location.origin}/mobile/template/slides/${sign}/`;
                    // 获取文档作者信息
                    that.get_document_author_info(document_info.id, 'template');
                }).catch((err) => {
                    console.error(err);
                });
            },
            // 获取作品文档信息
            get_work_document_info: function (sign) {
                let that = this;
                if (!sign) {
                    return that.$toast('获取文档信息失败', 2000, 'wap');
                }
                that.$axios.get(`/api/works_share/detail/${sign}/`).then((res) => {
                    let res_data = res.data;
                    if(res_data.type !== 'success') {
                        return that.$toast(res_data.content, 2000, 'wap');
                    }
                    that.loaddone = true;
                    let document_info = res_data.data.document;
                    let document_pages = res_data.data.documentPages;
                    that.document_info = document_info;
                    that.document_pages = document_pages;
                    that.document_title = res_data.data.worksName;
                    // 分享链接
                    that.document_share_url = `${window.location.origin}/mobile/works/slides/${res_data.data.worksId}/`;
                    // 获取文档作者信息
                    that.get_document_author_info(document_info.id, 'works');
                }).catch((err) => {
                    console.error(err);
                });
            },
            // 获取文档作者信息
            get_document_author_info: function (id, type) {
                let that = this;
                if (!id || !type) {
                    return;
                }
                that.$axios.get('/api/document/get_doc_author/', {
                    params: {
                        'id': id,
                        'type': type,
                    },
                }).then((res) => {
                    if (res.data.type === 'success') {
                        let data = res.data.data;
                        that.document_author = data.authorName || that.user.name;
                        if (data.image) {
                            that.document_info.image = data.image;
                        }
                        // 获取h5分享信息
                        that.get_h5_share_info(() => {
                            that.render_share_common_modal();
                        });
                    }
                }).catch((err) => {
                    console.error(err);
                });
            },
            // 获取h5分享信息
            get_h5_share_info(callback) {
                let that = this;
                if (!that.is_h5) {
                    if (typeof callback === 'function') callback();
                    return;
                }
                that.$axios.get(`/api/document_share/get_share_content/`, {
                    params: {
                        docId: that.document_info.id,
                    },
                }).then(res => {
                    let res_data = res.data;
                    if (res_data.type === 'success') {
                        that.document_info.image = res_data.data['shareImage'];
                    }
                    if (typeof callback === 'function') callback();
                }).catch(err => {
                    console.error(err);
                });
            },
            // 渲染分享通用弹框
            render_share_common_modal: function(){
                let that = this;
                that.$refs.share_common_modal.show({
                    is_popup: false,
                    is_mine: that.show_authority,
                    is_urlEffect: that.document_info.isUrlEffect === undefined ? true : that.document_info.isUrlEffect,
                    document: that.document_info,
                    document_pages: that.document_pages,
                    type: that.document_type,
                    title: that.document_title,
                    author: that.document_author,
                    share_url: that.document_share_url,
                });
            },

            // 权限设置
            show_set_authority:function(){
                let that = this;
                that.$refs.set_authority.show({ id: that.document_info.id });
            },
            // 有效期设置
            show_set_expire: function(){
                this.$refs.set_expire.show();
            },
            // 有效期更新
            update_expire: function(obj){
                this.document_info.urlExpireType = obj.key;
                this.document_expire_time = obj.time;
            },
            // 分享链接复制成功
            url_copy_success: function(){
                this.$toast("链接已复制", 1000 , 'wap' ,'http://file.woodo.cn/upload/image/201812/11/0b158ed8-82df-4575-a9e7-4f6e0911bfa6.png');
            },
            // 分享链接复制失败
            url_copy_error: function(){
                this.$toast("复制失败", 1000, 'wap');
            },
            toggle_share_tips:function(){
                this.$refs.share_common_modal.toggle_share_tips();
            },
            create_doc_poster:function(){
                this.$refs.share_common_modal.create_doc_poster();
            },
            open_email_modal:function(){
                this.$refs.share_common_modal.open_email_modal();
            },
        },
    }
</script>

<style lang="less" scoped>
    @import url("../../assets/wap/css/common.css");

    .document_share_container{
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        padding-top: 2.25rem;
        background-color: #f8f8f8;
        text-align:center;
        transition: all 0.3s;
        overflow: hidden;
        .watermark_logo {
            position: absolute;
            left: 50%;
            bottom: 1rem;
            width: 4.4rem;
            margin-left: -2.2rem;
            opacity: 0.5;
        }
    }
    .share_background {
        position: absolute;
        left: 5%;
        top: calc(50% - 2.25rem);
        width: 90%;
        transform: translateY(-50%);
        user-select: none;
        pointer-events: none;
    }
    // 权限入口样式
    .authority_container {
        width: 14.75rem;
	    height: 18rem;
        margin: 0 auto;
        padding-top: 12.2rem;
        border-radius: 0.2rem;
        background-image: url('../../assets/wap/images/authority/share_authority_bg.png');
        background-size: 100%;
        text-align:left;
        .authority_info {
            position: relative;
            padding: 1rem 1.5rem;
            .document_title {
                line-height: 1;
                font-size: .73rem;
                color: #000000;
            }
            .authority_describe {
                margin-top: 0.33rem;
                font-size: 0.5rem;
                color: #84898f;
            }
            .expire_tip{
                display: inline-block;
                height: 1rem;
                line-height: 1rem;
                margin-top: .62rem;
                padding: 0 .8rem;
                background-color: #e6f0fd;
                font-size: .5rem;
                color: #666e77;
                text-align:center;
            }
        }
        &.h5 {
            height: 17.68rem;
            padding-top: 13.28rem;
            background-image: url('../../assets/wap/images/authority/h5share_authority_bg.png');
            .authority_info {
                .document_title{
                    font-size: .76rem;
                    color: #ffffff;
                }
                .authority_describe {
                    margin-top: 0.35rem;
                    font-size: 0.52rem;
                    color: #ffffff;
                    opacity:.8;
                }
            }
        }
    }
    // 设置有效期按钮
    .expire_btn{
        position: relative;
        display: inline-block;
        font-size: 0.6rem;
        color: var(--mainColor);
        text-decoration: underline;
    }
    // 分享按钮组
    .share_btn_group {
        position: absolute;
        bottom: 3rem;
        left: 0;
        right: 0;
        display: flex;
        justify-content: space-between;
        &::before,
        &::after {
            content: "";
            display: block;
        }
        .share_button {
            display: inline-block;
            width: 6em;
            text-align: center;
            img {
                display: block;
                width: 2.2rem;
                height: 2.2rem;
                margin: 0 auto 0.2rem;
                border-radius: 50%;
            }
            span {
                display: block;
                font-size: 0.52rem;
                color: #44494f;
                opacity: 0.6;
                white-space: nowrap;
            }
        }
    }
    // 二维码
    .qrcode_modal{
        position: absolute;
        top: 0;
        left: 0;
        z-index: 2;
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
    @media screen and (max-height: 568px) {
        .authority_container{
            transform: scale(.8) translate(0,-2rem);
        }
        .expire_btn{
            top: -2rem;
        }
    }
</style>