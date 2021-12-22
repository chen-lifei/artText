import Vue from 'vue'
import Router from 'vue-router'
import MetaInfo from 'vue-meta-info'

Vue.use(Router)
Vue.use(MetaInfo)
// pc端
const IndexView = () => import('@/views/pc/IndexView.vue');
const EditView = () => import('@/views/pc/EditView.vue');                           // 编辑页
const WorkspaceView = () => import('@/views/pc/WorkspaceView.vue');                 // 工作台页
const MyDocument = () => import('@/views/pc/DocCenter/MyDocumentView.vue');         // 我的设计页
const MyTeam = () => import('@/views/pc/DocCenter/MyTeamView.vue');                 // 我的团队页
const SlidesDocument = () => import('@/views/pc/Slides/SlidesDocument.vue');               // 普通文档演示页
const SlidesTemplate = () => import('@/views/pc/Slides/SlidesTemplate.vue');               // 模板演示页
const SlidesWorks = () => import('@/views/pc/Slides/SlidesWorks.vue');                     // 作品演示页
const SlidesH5 = () => import('@/views/pc/Slides/SlidesH5.vue');                           // H5演示页
const NotPage = () => import('@/views/pc/404.vue');                                 // 404
const LoginView = () => import('@/views/pc/LoginView.vue');                         // 登录注册页
const UserAgreement = () => import('@/views/pc/UserAgreementView.vue');             // 用户协议页
const MessageNotification = () => import('@/views/pc/MessageNotification.vue');     // 用户协议页
const NoPower = () => import('@/views/pc/NoPower.vue');                             // 无权限
const News = () => import('@/views/pc/NewsIndex.vue');                              // 资讯
const NewsDetail = () => import('@/views/pc/NewsDetail.vue');                       // 资讯详情
const MemberView = () => import('@/views/pc/Member/MemberView.vue');                // 个人中心页
const MemberGrade = () => import('@/views/pc/Member/MemberGrade.vue');              // 会员升级页
const MemberOrder = () => import('@/views/pc/Member/MemberOrder.vue');              // 用户订单页
const PaymentResult = () => import('@/views/pc/PaymentResult.vue');                 // 支付结果页
const WechatPayment = () => import('@/views/pc/WechatPayment.vue');                 // 微信支付页
const DocumentExport = () => import('@/views/pc/DocumentExport.vue');               // 文档导出页
const DocumentRecoveryPreview = () => import('@/views/pc/DocumentRecoveryPreview.vue'); // 文档恢复预览页
const UpdatingView = () => import('@/views/pc/updating.vue');                       // 文档恢复预览页
const APIDocument = () => import('@/views/pc/APIAccessDocument.vue');               // API接入说明文档
const HelpCenterView = () => import('@/views/pc/HelpCenterView.vue');               // 帮助中心页
const HelpDetailView = () => import('@/views/pc/HelpDetailView.vue');               // 帮助中心页
const SvgParse = () => import('@/views/pc/SvgParse.vue');                           // svg解析方法
const BusinessLicenseView = () => import('@/views/pc/BusinessLicenseView.vue');     // 营业执照页
const MaterialView = () => import('@/views/pc/Material/MaterialView.vue');                 // 素材中心页
const WorksShareView = () => import('@/views/pc/Material/WorksShareView.vue');                 // 素材中心页
const TemplateDetailView = () => import('@/views/pc/Material/TemplateDetailView.vue');       // 模板中心详情页
const TemplateMemberView = () => import('@/views/pc/Material/TemplateMemberView.vue');       // 模板中心个人主页

// wap端
const WapIndexView = () => import('@/views/wap/IndexView.vue');                     // 首页
const SquareView = () => import('@/views/wap/SquareView.vue');                      // 广场页
const WapMemberView = () => import('@/views/wap/MemberView.vue');                   // 账户设置页
const WapLoginView = () => import('@/views/wap/LoginView.vue');                     // 登录注册页
const WapDocView = () => import('@/views/wap/DocView.vue');                         // 登录注册页
const WapAgreementView = () => import('@/views/wap/AgreementView.vue');             // 用户协议页
const WapSlidesDocument = () => import('@/views/wap/SlidesDocument.vue');           // 普通文档演示页
const WapSlidesTemplate = () => import('@/views/wap/SlidesTemplate.vue');           // 模板演示页
const WapMyWorkView = () => import('@/views/wap/MyWorkView.vue');                   // 我的作品页
const WapUploadWorkView = () => import('@/views/wap/WorksUploadView.vue');          // 提交作品页
const WapSlidesWorks = () => import('@/views/wap/SlidesWorks.vue');                 // 作品演示页
const WapSlidesH5 = () => import('@/views/wap/SlidesH5.vue');                       // 作品演示页
const WapNewsDetailView = () => import('@/views/wap/NewsDetailView.vue');           // 文章详情页
const WapWorksShareDetail = () => import('@/views/wap/WorksShareDetailView.vue');   // 作品详情页
const WapTemplateDetailView = () => import('@/views/wap/TemplateDetailView.vue');   // 模板详情页
const WapTopicView = () => import('@/views/wap/TopicView.vue');                     // 专集列表页
const WapMessageNotification = () => import('@/views/wap/MessageNotification.vue'); // 用户消息页
const Invite = () => import('@/views/wap/WechatInvite.vue');                        // 微信邀请落地页
const DocShare = () => import('@/views/wap/DocShareView.vue');                      // 文档中心分享页
const HcoinSpecial = () => import('@/views/wap/HcoinSpecial.vue');                  // 幻币专题页
const WapMemberGrade = () => import('@/views/wap/MemberGrade.vue');                 // 会员升级页
const WapOrderView = () => import('@/views/wap/OrderView.vue');                     // 订单列表页
const WapOrderSubmit = () => import('@/views/wap/OrderSubmit.vue');                 // 订单提交&唤醒支付页
const WapPaymentResult = () => import('@/views/wap/PaymentResult.vue');             // 支付结果页
const WapPaymentTransfer = () => import('@/views/wap/PaymentTransfer.vue');             // 支付结果页
const WapEditView = () => import('@/views/wap/EditView.vue');                       // 编辑页
const WapHelpCenterView = () => import('@/views/wap/HelpCenterView.vue');           // 帮助中心页
const WapHelpDetailView = () => import('@/views/wap/HelpDetailView.vue');           // 问题详情页
const WapHcoinRecharge = () => import('@/views/wap/HcoinRecharge.vue');             // 幻币充值页
//平台
const OpenApiDemoview = () => import('@/views/platform/OpenApiDemo.vue');           // apidemo演示页
const PlatformSlides = () => import('@/views/platform/SlidesDocument.vue');         // 平台演示页
const PlatformWapSlides = () => import('@/views/platform/WapSlidesDocument.vue');   // 平台手机演示页

// 命名路由需要配置name
export function createRouter () {
  return new Router({
    mode: 'history',
    fallback: false,
    scrollBehavior: () => ({ y: 0 }),
    routes: [
        // pc端
        { path: '/', component:IndexView, meta:{hideFeedback: true}},
        { path: '/member', component:MemberView},
        { path: '/upgrade', component:MemberGrade},
        { path: '/member/upgrade', component:MemberGrade, meta:{hideFeedback: true}},
        { path: '/member/order', component:MemberOrder},
        { path: '/edit', component:EditView, meta:{hideFeedback: true}},
        { path: '/home', component:WorkspaceView, meta:{showNav: true, theme: true}},
        { path: '/document', component:MyDocument, meta:{showNav: true, theme: true}},
        { path: '/team', component:MyTeam, meta:{showNav: true, theme: true}},
        { path: '/document/slides/:id', component: SlidesDocument, meta:{hideFeedback: true}},
        { path: '/template/slides/:id', component: SlidesTemplate, meta:{hideFeedback: true}},
        { path: '/works/slides/:id', component: SlidesWorks, meta:{hideFeedback: true}},
        { path: '/h5/slides/:id', component: SlidesH5, meta:{hideFeedback: true}},
        { path: '/template/detail', component: TemplateDetailView },
        { path: '/template/member', component: TemplateMemberView },
        { path: '/material/', component: MaterialView, meta:{showNav: true, theme: true} },
        { path: '/worksShare/', component: WorksShareView, meta:{showNav: true, theme: true} },
        { path: '/news', component: News, name: "news"},
        { path: '/news/detail', component: NewsDetail},
        { path: '/404', component:NotPage},
        { path: '/no_power', component:NoPower},
        { path: '/login', component:LoginView, name: 'Login'},
        { path: '/agreement', component:UserAgreement},
        { path: '/notification', component:MessageNotification},
        { path: '/help/', component:HelpCenterView},
        { path: '/help/detail', component:HelpDetailView},
        { path: '/payment/result', component:PaymentResult},
        { path: '/payment/:id', component:WechatPayment},
        { path: '/document_export/:id', component:DocumentExport},
        { path: '/document_recovery_preview/:id', component:DocumentRecoveryPreview},
        { path: '/updating/', component: UpdatingView },
        { path: '/open_api/', component: APIDocument },
        { path: '/svg_parse/', component: SvgParse},
        { path: '/license/', component: BusinessLicenseView},

        // wap端
        { path: '/mobile', component: WapIndexView },
        { path: '/mobile/member', component: WapMemberView },
        { path: '/mobile/upgrade', component: WapMemberGrade },
        { path: '/mobile/member/upgrade', component: WapMemberGrade },
        { path: '/mobile/login', component: WapLoginView},
        { path: '/mobile/square', component: SquareView},
        { path: '/mobile/home', component: WapDocView },
        { path: '/mobile/agreement', component: WapAgreementView },
        { path: '/mobile/document/slides/:id', component: WapSlidesDocument},
        { path: '/mobile/template/slides/:id', component: WapSlidesTemplate},
        { path: '/mobile/works/slides/:id', component: WapSlidesWorks},
        { path: '/mobile/h5/slides/:id', component: WapSlidesH5},
        { path: '/mobile/news/detail', component: WapNewsDetailView },
        { path: '/mobile/work_share/detail', component: WapWorksShareDetail},
        { path: '/mobile/work_share/topic', component: WapTopicView },
        { path: '/mobile/mywork', component: WapMyWorkView},
        { path: '/mobile/uploadwork', component: WapUploadWorkView},
        { path: '/mobile/template/detail', component: WapTemplateDetailView },
        { path: '/mobile/notification', component:WapMessageNotification},
        { path: '/mobile/invite', component:Invite},
        { path: '/mobile/doc_share', component:DocShare},
        { path: '/mobile/hcoin/special', component:HcoinSpecial},
        { path: '/mobile/member/order', component:WapOrderView},
        { path: '/mobile/member/order/submit', component:WapOrderSubmit},
        { path: '/mobile/payment/result', component:WapPaymentResult},
        { path: '/mobile/payment/transfer/', component:WapPaymentTransfer},
        { path: '/mobile/edit', component:WapEditView},
        { path: '/mobile/help/', component: WapHelpCenterView},
        { path: '/mobile/help/detail', component: WapHelpDetailView},
        { path: '/mobile/member/recharge', component: WapHcoinRecharge},
        // 平台
        { path: '/open_api_demo/', component:OpenApiDemoview},
        { path: '/platform/slides', component:PlatformSlides},
        { path: '/mobile/platform/slides', component:PlatformWapSlides},
    ]
  })
}