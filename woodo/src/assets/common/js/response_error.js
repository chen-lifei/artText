import toast from '@/components/toast/toast.js';
import pay from './pay';
import common from '../../pc/js/common';
import member_rankauthorities from '@/assets/common/js/member_rankauthorities.js';


//ajax、axios
//处理请求错误响应，提供统一方法获取相关信息
function handle_error_response(error_response,is_ajax){
    return {
        //获取响应头值方法
        getHeader : function(key){
            if(is_ajax){
                return error_response.getResponseHeader(key);
            }else{
                if(error_response.response && error_response.response.headers){
                    return error_response.response.headers[key.toLowerCase()];
                }
            }
            return "";
        },
        //获取请求数据(ajax未处理)
        getParams : function(){
            if(is_ajax){
                return {};
            }else{
                if(error_response.response && error_response.response.config){
                    return (error_response.response.config.method === 'get' ? error_response.response.config.params : error_response.response.config.data);
                }
            }
            return {};
        },
        //获取响应数据
        getData : function(){
            return is_ajax ? error_response.responseJSON : error_response.response.data;
        },
        //获取响应回调(ajax未处理)
        getCallback : function(){
            return is_ajax ? (function fn(){})() : error_response.response.callback();
        },
        // 判断是否是编辑页发起的请求
        getPagesource : function(){
            return is_ajax ? error_response.customConfig : error_response.config.customConfig;
        },
    }
}

export default (error_response,is_ajax)=>{
    let new_error_response = handle_error_response(error_response,is_ajax);
    // 未登录状态拦截
    let loginStatus = new_error_response.getHeader('loginStatus');
    if (loginStatus === "accessDenied") {
        // 在编辑页时不弹强制跳转登录页弹框，为做免编辑登录
        if(new_error_response.getPagesource().pageSource === 'edit'){
            return;
        }else{
            return toast("请登录后再进行操作",1000, function(){
                if(window){//window对象判断，防止ssr调用了axios
                    let redirect_url =window.location.pathname;
                    if(window.location.search){//参数
                        redirect_url=redirect_url+window.location.search;
                    }
                    redirect_url=encodeURIComponent(redirect_url);
                    if (utils.deviceENV().wechat) {
                        window.location.href = '/api/login/weixin_login_redirect/?redirectUrl=' + redirect_url;
                    }else{
                        window.location.href = '/api/login/redirect/?redirectUrl=' + redirect_url;
                    }
                }
            });
        }
    } else {
        // 会员权限拦截
        let memberPower = new_error_response.getHeader('woodoEvent');
        if (memberPower === 'memberRankAuthorityValid') {
            // 按需显示弹窗内容
            let params = new_error_response.getParams();
            let data = new_error_response.getData();
            let opt = data.opt;
            let opt_member = data.member || {};
            switch (opt) {
                // 文档页面数量，校验最高权限
                case 'documentPageAdd':
                    member_rankauthorities.modal.documentPageAdd();
                    break;
                // 上传单张图片限制，校验最高权限
                case 'imageUpload':
                    member_rankauthorities.modal.imageUpload();
                    break;
                // 储存空间限制，校验最高权限
                case 'myuploadAdd':
                    member_rankauthorities.modal.myuploadAdd();
                    break;
                // 新建文档
                case 'documentCreate':
                    let modal_opt = {};
                    if (window.location.pathname === '/edit/') {
                        modal_opt.addClass = 'back_home';
                        modal_opt.showCancel = true;
                        modal_opt.buttonCancelTxt = '返回工作台';
                        modal_opt.cancelCallback = ()=>{
                            window.location.href = '/home/';
                        };
                    }
                    modal_opt.$parent = document.querySelector('#app > div');
                    member_rankauthorities.modal.documentCreateAndRecovery(modal_opt);
                    break;
                // 恢复文档
                case 'documentRecovery':
                    member_rankauthorities.modal.documentCreateAndRecovery({
                        $parent: document.querySelector('#app > div'),
                    });
                    break;
                // 邀请协作成员限制
                case 'documentCollaborateAdd':
                    member_rankauthorities.modal.documentCollaborateAdd();
                    break;
                // 团队成员添加
                case 'teamMemberAdd':
                    member_rankauthorities.modal.teamMemberAdd();
                    break;
                /**
                 * 模板、作品、文档下载 1.幻币不足  2.幻币购买
                 */
                case 'templateDownload':
                case 'materialDownload':
                case 'documentDownload':
                case 'worksShareDownload':
                    let is_mobile = utils.deviceENV().mobile;
                    let hcoin_number = opt_member.hcoin;
                    let hcoin_use_number = data.optPrice;
                    let hcoin_enough = (hcoin_number - hcoin_use_number) >= 0;
                    // 点击会员下载按钮
                    if (new_error_response.getPagesource().triggerSource === 'vip') {
                        if(is_mobile){
                            window.open(window.location.origin + '/member/upgrade/');
                        }else{
                            member_rankauthorities.modal.documentDownload({templateType: 'memberGrade'});
                        }
                        return;
                    }
                    let orderData = new_error_response.getPagesource().orderData;
                    //定义支付方法
                    let pay_function = function () {
                        let options = {};
                        let doc_id = params.id;
                        let downloadType = '';
                        ['document', 'template', 'worksShare', 'material'].forEach(item => {
                            if (opt.match(item)) downloadType = opt.match(item)[0];
                        })
                        options.param = {};
                        options.param['id'] = doc_id;
                        options.param['iconUrl'] = orderData.cover;
                        options.param['downloadType'] = downloadType;
                        options.success = function () {
                            error_response.response.callback();
                            toast(`支付成功！本次下载已扣除<span style=color:#ff2f2f;font-weight:bold;>${hcoin_use_number}</span>幻币`, 2000, is_mobile ? 'wap' : 'pc');
                        }
                        if (!doc_id) {
                            toast('下载失败，请稍后重试', 1500, is_mobile ? 'wap' : 'pc');
                            return;
                        }
                        if (opt === 'documentDownload' && is_mobile) {
                                member_rankauthorities.modal.documentDownload({
                                    modalContent: `<p>本文档下载需消耗${hcoin_use_number}幻币，是否继续？</p>
                                                    <span>账户余额：<strong>${hcoin_number}幻币</strong></span>
                                                    <a href="/member/upgrade/" target="_blank">升级吾道会员，文档任意下载</a>`,
                                    submitCallback: ($modal) => {
                                        pay.create_download_order(options);
                                        $modal.close();
                                    }
                                });
                        } else {
                            pay.create_download_order(options);
                        }
                    }
                    //场景：
                    //1、pc、幻币充裕
                    //2、pc、幻币非充裕
                    //3、wap、幻币充裕
                    //4、wap、幻币非充裕
                    if(!is_mobile){
                        const orderCover = 'https://file.woodo.cn/upload/image/202008/26/ee32c5ac-afd2-428e-b9f9-edda00f90c78.png';
                        let confirm_function = (cover = orderCover) => {
                            member_rankauthorities.modal.documentDownload({
                                modalClass: 'confirm-order-modal',
                                modalTitle: '',
                                modalContent: `<div class="order_info">
                                                    <p>确认订单</p>
                                                    <div class="order_cover">
                                                    <img src="${cover}"></div>
                                                </div>
                                                <div class="order_hcoin" id="order_hcoin">
                                                    <p>${orderData.name}</p>
                                                    <p class="line"></p>
                                                    <span class="price">应付：<i>${hcoin_use_number}</i>幻币</span>
                                                    <div class="info">
                                                        <span class="balance">当前余额：<i>${hcoin_number}</i>幻币</span>
                                                        <span>会员期限内无限下载</span>
                                                    </div>
                                                </div>`,
                                showCancel: true,
                                buttonCancelTxt: '会员免费下载',
                                buttonSubmitTxt: '幻币支付',
                                zIndex: 1002,
                                openCallback: function(){
                                    let user = common.get_login_state();
                                    if(user.memberVipEffect){
                                        $('.button-cancel').hide();
                                    }
                                },
                                submitCallback: function ($modal) {
                                    if(hcoin_enough){
                                        member_rankauthorities.modal.documentDownload({
                                            modalClass: `hcoin-confirm-modal`,
                                            modalContent: `<p>确认使用幻币购买当前模板吗?</p>`,
                                            buttonCancelTxt: '考虑一下',
                                            buttonSubmitTxt: '确认购买',
                                            showCancel: true,
                                            submitCallback: function ($hcoin_confirm_modal) {
                                                $modal.close();
                                                $hcoin_confirm_modal.close();
                                                pay_function();
                                            },
                                            cancelCallback: function ($hcoin_confirm_modal) {
                                                $hcoin_confirm_modal.close();
                                            },
                                            closeCallback: function ($hcoin_confirm_modal) {
                                                $hcoin_confirm_modal.close();
                                            },
                                        });
                                    }else{
                                        $modal.close();
                                        member_rankauthorities.modal.documentDownload({
                                            templateType: 'hcoinRecharge',
                                            hcoin: hcoin_number,
                                            hcoin_use : hcoin_use_number
                                        })
                                    }
                                },
                                cancelCallback: function ($modal) {
                                    member_rankauthorities.modal.documentDownload({templateType: 'memberGrade',closeCallback: function(){
                                        $modal.$data.animation = '';
                                        $modal.show();
                                    }});
                                },
                                closeCallback: function ($modal) {
                                    $modal.close();
                                },
                            })
                        }
                        if (typeof orderData.cover === 'object') {
                            orderData.cover.async().then((data) => {
                                orderData.cover.complete();
                                confirm_function(data)
                            }).catch((err) => {
                                orderData.cover.complete();
                                confirm_function(orderCover);
                            })
                        } else {
                            confirm_function(orderData.cover);
                        }
                    }else{
                        if(hcoin_enough){
                            pay_function();
                        }else{
                            member_rankauthorities.modal.documentDownload({
                                modalClass: `hcoin-lack-modal mobile`,
                                modalTitle: '支付提示',
                                modalContent: `<p>你的余额不足，下载当前文档还需<i>${(hcoin_use_number*10-hcoin_number*10)/10}</i>个幻币，<br>请充值或升级会员后继续</p><p>幻币余额：<i>${hcoin_number}</i>幻币</p>`,
                                buttonCancelTxt: '立即充值',
                                buttonSubmitTxt: '会员免费下载',
                                showCancel: true,
                                submitCallback: function () {
                                    window.location = window.location.origin + '/mobile/member/upgrade/'
                                },
                                cancelCallback: function ($modal) {
                                    $modal.close();
                                    window.location = window.location.origin + '/mobile/member/recharge/';
                                },
                                closeCallback: function ($modal) {
                                    $modal.close();
                                },
                            });
                            
                        }
                    }
                    break;
            }
        }
        return;
    }
    return toast('请求失败', 1000);
}
