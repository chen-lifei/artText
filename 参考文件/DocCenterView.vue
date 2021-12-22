<template>
    <div class="document-center-contain">

		<!-- 通用左侧导航 -->
        <nav-left @reload="reloadPage"></nav-left>

        <!-- 主体 -->
        <div class="center-container">
            <div class="center-left">
                <base-button class="primary create-doc-btn" width="190" height="48" @click="openCreate"><base-icon class="icontianjia1" size="16"></base-icon>新建文档</base-button>
                <div class="left-nav">
                    <base-button :class="{check: current_panel === 'recommend'}" @click="changePanel('recommend')"><base-icon class="icontuijian" size="20"></base-icon>为你推荐</base-button>
                </div>
                <div class="left-nav">
                    <p>我的</p>
                    <base-button :class="{check: current_panel === 'production'}" @click="changePanel('production')"><base-icon class="iconwodechuangzuo" size="20"></base-icon>我的创作</base-button>
                </div>
                <div class="left-nav">
                    <p>团队</p>
                    <base-button :class="{check: current_panel === 'team'}" @click="changePanel('team')"><base-icon class="iconwodetuandui" size="20"></base-icon>我的团队</base-button>
                </div>
                <div class="left-nav">
                    <p>拓展功能</p>
                    <base-button :class="{check: current_panel === 'resources'}" @click="changePanel('resources')"><base-icon class="iconziyuandaohang" size="20"></base-icon>资源导航</base-button>
                </div>
            </div>
            <div class="center-right" :class="current_panel">
                <!-- 通用头部导航 -->
                <nav-head-main ref="navHead" :absolute="true" @loginCallback="loginCallback"></nav-head-main>
                <!-- 创建文档 -->
                <doc-create ref="docCreate"></doc-create>
                <!-- 为你推荐 -->
                <doc-recommend ref="docRecommend" :show="current_panel === 'recommend'"></doc-recommend>
                <!-- 我的创作 -->
                <doc-production ref="docProduction" :show="current_panel === 'production'"></doc-production>
                <!-- 我的团队 -->
                <doc-team ref="docTeam" :show="current_panel === 'team'"></doc-team>
                <!-- 资源导航 -->
                <doc-resources ref="docResources" v-if="current_panel === 'resources'"></doc-resources>
            </div>
        </div>
        
        <!-- 文档预览弹框 -->
        <doc-preview-modal ref="docPreview"></doc-preview-modal>
        <!-- 模板预览弹框 -->
        <template-preview-modal ref="templatePreview"></template-preview-modal>


        <!-- 底部固定模块 -->
        <div class="center-fixed-bottom" v-if="user && user.login">
            <!-- 绑定提示 -->
            <div class="bind-tip" v-if="!user.BindWeixin">
                <span>提示：您还未关联微信，关联公众号后即可在微信管理你的订单，并接收消息推送</span>
                <a @click="bind('bind_wechat')">立即关联</a>
            </div>
            <div class="bind-tip" v-if="user.showBindTips">
                <span>提示：您的账号还没有绑定邮箱/手机，这可能会带来一定程度的安全风险</span>
                <a @click="bind('bind_account')">马上绑定</a>
            </div>
        </div>
        <!-- 反馈按钮 分享 邀请 、 交流群二维码 -->
        <feedback-button ref="feedbackButton" :check-reply="true"></feedback-button>
    </div>
</template>

<script>
import NavLeft from '@/components/nav/NavLeft.vue';
import NavHeadMain from '@/components/nav/NavHeadMain.vue';
import DocCreate from '@/views/pc/DocCenter/DocCreate.vue';
import DocRecommend from '@/views/pc/DocCenter/DocRecommend.vue';
import DocProduction from '@/views/pc/DocCenter/DocProduction.vue';
import DocTeam from '@/views/pc/DocCenter/DocTeam.vue';
import DocResources from '@/views/pc/DocCenter/DocResources.vue';
import DocPreviewModal from '@/views/pc/DocCenter/DocPreviewModal.vue';
import TemplatePreviewModal from '@/views/pc/Template/TemplatePreviewModal.vue';
import FeedbackButton from '@/components/FeedbackButton.vue';
export default {
    metaInfo: {
        title: '吾道幻灯片-官方网站-专业的PPT在线协作工具，提供海量精美模板素材',
        meta: [
            {
                property: 'og:title',
                content: '吾道幻灯片-官方网站-专业的PPT在线协作工具，提供海量精美模板素材'
            },
            {
                property: 'og:url',
                content: 'https://www.woodo.cn/home/'
            },
        ]
    },
    components:{
        NavLeft,
        NavHeadMain,
        DocCreate,
        DocRecommend,
        DocProduction,
        DocTeam,
        DocResources,
        DocPreviewModal,
        TemplatePreviewModal,
        FeedbackButton,
    },
    provide() {
        return {
            center: this,
        };
    },
    beforeRouteEnter(to, from, next) {
        next(vm => {
            if (from.path === "/edit/" && vm.$common.get_login_state().login) {
                vm.current_panel = 'production';
            }
        });
    },
    data(){
        return{
            user: {},
            loginCallback: '',
            current_panel: '',
            team: '',
            recommend: '',
            production: '',
        }
    },
    mounted() {
        this.user = this.$common.get_login_state();
        this.team = this.$refs.docTeam;
        this.recommend = this.$refs.docRecommend;
        this.production = this.$refs.docProduction;
        this.loginCallback = () => {
            this.$refs['docRecommend'].getLately();
        }
        switch (this.$route.query.type) {
            case 'join_team':
                this.joinTeam();
                break;
            case 'team':
                this.changePanel('team');
                break;
            default:
                this.current_panel = 'recommend';
                break;
        }
    },
    methods: {
        // 刷新页面
        reloadPage() {
            this.changePanel('recommend');    
        },
        // 切换面板
        changePanel(type) {
            this.$refs.docCreate.close();
            if ((type === 'production' || type === 'team') && !this.$common.get_login_state().login) {
                this.$refs.navHead.toLogin('account');
                this.loginCallback = () => {
                    this.changePanel(type);
                }
            } else if (this.current_panel === type){
                this.current_panel = '';
                setTimeout(() => { this.current_panel = type }, 16);
            } else {
                this.current_panel = type;
            }
        },
        // 打开创建新文档弹框
        openCreate() {
            this.$refs.docCreate.open();
        },
        // 加入团队
        joinTeam() {
            let that = this;
            let key = that.$route.query.key;
			let ownerName = that.$route.query.ownerName;
            that.$modal({
                modalClass: 'team-modal',
                modalTitle: '团队协作邀请',
                modalContent: `<p>${ownerName}邀请你加入 TA 的团队协作</p>`,
                buttonSubmitTxt: '拒绝',
                buttonCancelTxt: '接受',
                submitCallback (modal) {
                    that.$axios.post('/api/member/team/reject_team_invite/', {inviteKey: key})
                    .then(data => {
                        // 去除参数
                        window.history.pushState(null, null, '/home/');
                        modal.close();
                    });
                },
                closeCallback: function(){
                    // 去除参数
                    window.history.pushState(null, null, '/home/');
                },
                cancelCallback(modal){
                    that.$axios.post('/api/member/team/accept_invitation/', {inviteKey: key})
                    .then(data => {
                        if(data.data.code === '2'){
                            that.changePanel('team');
                            // 去除参数
                            window.history.pushState(null, null, '/home/');
                        }else{
                            localStorage.setItem("error_tip", data.data.content);
                            window.location.href = '/no_power/?type=team';
                        }
                    });
                }
            });
        },
        // 预览文档
        previewDoc(doc) {
            let id = '';
            if(typeof doc.type === 'undefined'){
                doc.type = 'document';
            }
            switch(doc.type) {
                case 'works':
                    id = doc.workShareId;
                    this.$refs.docPreview.show({type: doc.type, id: id});
                    break;
                case 'template':
                    id = doc.templateId || doc.id;
                    this.$refs.templatePreview.show(id);
                    break;
                case 'document':
                    id = doc.documentUrl || doc.url;
                    this.$refs.docPreview.show({type: doc.type, id: id});
                    break;
            }
        },
        /**
         * 团队相关 end
         */

        // 绑定账号相关
        bind(type) {
            this.$refs.navHead.toLogin(type);
        },
    },

}
</script>

<style lang="less" scoped>
@import url("~@/assets/pc/css/common.css");
@background_image: url(~@/assets/pc/images/doc/doc_view_icon.png) no-repeat;
.document-center-contain{
    width: 100%;
    height: 100vh;
    min-width: 1240px;
    user-select: none;
}
.center-container{
    height: 100vh;
    background-color: #f6f6f9;
}
.center-left{
    float: left;
    width: 210px;
    height: 100%;
    padding: 60px 10px 0;
    background-color: #fff;
    border-right: 1px solid #e5e5e5;
    border-left: 1px solid #e5e5e5;
    .create-doc-btn{
        margin-bottom: 20px;
        .base-icon{
            margin-right: 10px;
            transform: translateY(2px);
        }
    }
    .left-nav{
        margin-bottom: 20px;
        user-select: none;
        color: var(--naviTextColor);
        p{
            padding-left: 15px;
            margin-bottom: 4px;
            font-size: 12px;
        }
        .base-button{
            width: 190px;
            height: 40px !important;
            line-height: 34px;
            padding-left: 12px;
            text-align: left;
            font-size: 14px;
            .base-icon{
                margin-right: 15px;
                transform: translateY(3px);
            }
            &.check{
                background-color: #f6f6f9;
                border-color: #e5e5e5;
            }
            &:hover{
                color: var(--naviTextColor);
            }
        }
    }
}
.center-right{
    float: right;
    width: calc(100% - 210px);
    height: 100%;
    overflow: auto;
    &.recommend,
    &.resources{
        position: relative;
    }
}
.create-doc-panel{
    width: calc(100% - 300px);
}
// 分享吾道
.share_woodo_modal{
    position: absolute;
    right: 100%;
    bottom: 0;
    opacity: 0;
    transition: opacity 0.3s;
    .share_woodo_contain {
        width: 300px;
        height: 350px;
        background-color: #ffffff;
        box-shadow: 0px 3px 10px 0px rgba(67, 67, 67, 0.15);
        border-radius: 4px;
        text-align: left;
        overflow: hidden;
    }
    .link {
        width: 100%;
        height: 210px;
        background-image: linear-gradient(-23deg, #1b7cf3 32%, #5fa7ff 100%), linear-gradient(#0d7bf7, #0d7bf7);
        background-blend-mode: normal, normal;
        padding: 22px;
        .title {
            margin-top: 5px;
            font-size: 18px;
            color: #ffffff;
            font-weight: bold;
            text-align: center;
        }
        .sub_title {
            line-height: 2;
            font-size: 14px;
            color: #ffffff;
            opacity: 0.8;
            text-align: center;
        }
        hr {
            width: 100%;
            height: 1px;
            margin: 22px auto 26px;
            background-color: #4199fc;
            transform: scaleY(0.4);
            -webkit-transform: scaleY(0.4);
            -moz-transform: scaleY(0.4);
        }
        .share_way {
            margin-bottom: 4px;
            font-size: 12px;
            color: #ffffff;
            opacity: 0.8;
        }
        .share_url {
            display: inline-block;
            vertical-align: top;
            width: 186px;
            height: 34px;
            line-height: 34px;
            padding: 8px;
            background-color: rgba(255,255,255,0.2);
            text-align: left;
            border-radius: 4px;
            font-size: 12px;
            color: rgba(255,255,255,0.8);
        }
        .share_copy {
            display: inline-block;
            vertical-align: top;
            width: 58px;
            height: 34px;
            line-height: 34px;
            margin-left: 10px;
            background-color: #ffffff;
            border-radius: 4px;
            font-size: 14px;
            color: var(--mainColor);
            transition: opacity 0.3s;
            &:hover {
                opacity: 0.85;
            }
        }
    }
    .explain {
        width: 100%;
        height: 140px;
        padding: 22px;
        h5 {
            margin-bottom: 10px;
            font-size: 14px;
            color: #4f535a;
        }
        p {
            margin-bottom: 1em;
            font-size: 12px;
            color: #7b8494;
            & + p {
                margin-bottom: 0;
            }
        }
    }
}
// 交流群
.service_contain{
    position:absolute;
    right: 100%;
    bottom: -90px;
    width: 320px;
    height: 457px;
    text-align:center;
    opacity: 0;
    transition: opacity 0.3s;
    .service_panel {
        width: 320px;
        height: 457px;
        box-shadow: 0px 3px 10px 0px rgba(67, 67, 67, 0.15);
        background: url('~@/assets/pc/images/common/custom_service_bg.png') no-repeat center center;
        img:not(.base-logo) {
            position: absolute;
            top: 200px;
            left: 85px;
            width: 150px;
            height: 150px;
            padding: 8px;
            background-color: #ffffff;
            border-radius: 4px;
        }
        .base-logo {
            position: absolute;
            top: 257px;
            left: 142px;
            z-index: 1;
        }
    }
}

.center-fixed-bottom{
    position: fixed;
    bottom: 0;
    left: 0;
    width: 100%;
    height: auto;
    z-index: 21;
    // 绑定提示
    .bind-tip{
        width: 100%;
        height: 40px;
        line-height: 40px;
        padding-left: 17px;
        border:1px solid #faebcc;
        background: #fcf8e3;
        font-size: 12px;
        color: #9e8558;
        text-align: center;
        &:before{
            content:"";
            display:inline-block;
            vertical-align:middle;
            width:20px;
            height:20px;
            margin:0 6px 6px 0;
            background:@background_image -307px -208px;
        }
        a{
            display:inline-block;
            width: 70px;
            height: 30px;
            line-height: 30px;
            margin-left:64px;
            text-align: center;
            background: var(--mainColor);
            color: #fff;
            border-radius: 14.5px;
        }
    }
}

</style>