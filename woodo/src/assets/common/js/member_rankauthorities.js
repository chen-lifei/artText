/**
 * 会员等级权限获取
 * get() 获取对应会员等级权限
 */
import axios from '@/util/axios';
import common from '@/assets/pc/js/common';
import modal from '@/components/modal/modal';

let isupadte = false;
let rank_authorities_map = {
    enterprise: {},
    personal: {},
    premium: {},
    professional: {},
    free: {},
};
let member_map = {};
let team_map = {};

// 权限拦截升级弹窗数据
let get_modal_upgrade_opt = (opt = {}) => {
    let is_mobile = utils.deviceENV().mobile;
    let option = {
        $parent: null,
        zIndex: 1011,
        modalClass: is_mobile ? 'mobile-upgrade-modal' : 'upgrade-modal',
        modalContent: '',
        modalTitle: '升级提示',
        buttonSubmitTxt: '立即升级',
        showCancel: false,
        buttonCancelTxt: '',
        openCallback: () => {
            window.onbeforeunload = null;
        },
        submitCallback: ($modal)=>{
            $modal.close();
            if(is_mobile){
                window.open('/member/upgrade');
            }else{
                modal({templateType:'memberGrade'});
            }
        },
        cancelCallback: null,
    };
    option = Object.assign(option, opt);
    if (opt.addClass) {
        option.modalClass = `${option.modalClass} ${opt.addClass}`;
    }
    return option;
}
// 权限拦截幻币下载弹窗数据
let get_modal_hcoin_opt = (opt = {}) => {
    let is_mobile = utils.deviceENV().mobile;
    let option = {
        modalClass: is_mobile ? 'mobile-hcoin-download-modal' : 'hcoin-download-modal',
        zIndex: 1011,
        modalContent: '',
        modalTitle: '下载提示',
        buttonSubmitTxt: '确认',
        showCancel: false,
        submitCallback: null,
    };
    option = Object.assign(option, opt);
    return option;
}
// 升级提示文案场景
let get_uprank_scene = (opt = {}) => {
    let option = {
        normal: '',
        personal: '',
        team_admin: '',
        team_member: '',
    };
    option = Object.assign(option, opt);
    let result;
    let isUp = true;
    // 个人会员最高级
    if (member_map.isTopVip) {
        // 有团队
        if (team_map.id) {
            // 团队会员最高级
            if (team_map.isTopVip) {
                result = option.normal;
                isUp = false;
            } else {
                // 非最高级会员，当前用户管理员身份
                if (team_map.isTeamOwner) {
                    result = option.team_admin;
                } else {
                    result = option.team_member;
                }
            }
        } else {
            // 无团队
            result = option.normal;
            isUp = false;
        }
    } else {
        // 有团队
        if (team_map.id) {
            // 团队会员最高级
            if (team_map.isTopVip) {
                result = option.normal;
                isUp = false;
            } else {
                // 非最高级会员，当前用户管理员身份
                if (team_map.isTeamOwner) {
                    result = option.team_admin;
                } else {
                    result = option.team_member;
                }
            }
        } else {
            // 非个人会员最高级，升级个人会员
            result = option.personal;
        }
    }
    if (!result) {
        result = option.normal;
        isUp = false;
    }
    return {
        result: result,
        isUp: isUp,
    }
};

let method = {
    // 初始化，建议只在前端入口文件调用
    initialize() {
        if (!common.get_login_state().login) {
            return;
        }
        return new Promise((resolve, reject) => {
            axios.get('/api/member/rank_authorities/').then(res => {
                let res_data = res.data;
                if (res_data.type !== 'success') {
                    reject();
                    return console.error('获取权限失败');
                }
                let data = res_data.data;
                rank_authorities_map = data.authorities || {};
                member_map = data.member || {};
                team_map = data.team || {};
                isupadte = true;
                resolve();
            }).catch(err => {
                console.error('获取权限失败', err);
            });
        });
    },
    // 检测是否更新权限map
    isUpdate() {
        return isupadte;
    },
    // 获取对应会员权限属性
    getrank(ranktype) {
        let type = common.get_login_state().memberVip;
        if (ranktype) {
            type = ranktype;
        }
        return rank_authorities_map[type] || {};
    },
    // 检查权限
    check:{
        documentCreateAndRecovery:function(){
            return this.fn({opt:'documentCreate'});
        },
        fn(params={}){
            return new Promise((resolve, reject) => {
                axios.get('/api/member/check_rank_authority/',{params: params}).then(res => {
                    resolve()
                });
            });
        }
    },
    // 对应权限弹窗
    modal: {
        // 文档页添加
        documentPageAdd(option = {}) {
            let opt = get_modal_upgrade_opt(option);
            let vipcn = common.get_login_state().memberVipCn;
            let effective = method.getrank().documentPageAdd;
            let effective_msg = vipcn ? `${vipcn}用户每份文档最多可创建 ${effective} 页幻灯片，当前已达到上限` : `当前文档页已达到上限`;
            let scene = get_uprank_scene({
                normal: `<p>${effective_msg}，请删除部分后继续</p>`,
                personal: `<p>${effective_msg}，请删除部分或升级会员后继续</p>`,
                team_admin: `<p>${effective_msg}，请删除部分或升级企业会员后继续</p>`,
                team_member: `<p>${effective_msg}，请删除部分或联系团队管理员升级企业会员后继续</p>`,
            });
            let fixed_obj = {
                modalContent: scene.result,
                showSubmit: scene.isUp,
            };
            if (!scene.isUp) {
                fixed_obj.modalTitle = '提示';
            }
            opt = Object.assign(opt, fixed_obj);
            modal(opt);
        },
        // 图片上传
        imageUpload(option = {}) {
            let opt = get_modal_upgrade_opt(option);
            let vipcn = common.get_login_state().memberVipCn;
            let effective = method.getrank().imageUpload;
            let effective_msg = vipcn ? `${vipcn}用户单图片上传体积不能超过 ${~~(effective / 1024)} MB` : `单图片上传体积已达到上限`;
            let scene = get_uprank_scene({
                normal: `${effective_msg}，请压缩图片后继续</p>`,
                personal: `<p>${effective_msg}，请压缩图片或升级会员后继续</p>`,
                team_admin: `<p>${effective_msg}，请压缩图片或升级企业会员后继续</p>`,
                team_member: `<p>${effective_msg}，请压缩图片或联系团队管理员升级企业会员后继续</p>`,
            });
            let fixed_obj = {
                modalContent: scene.result,
                showSubmit: scene.isUp,
            };
            if (!scene.isUp) {
                fixed_obj.modalTitle = '提示';
            }
            opt = Object.assign(opt, fixed_obj);
            modal(opt);
        },
        // 储存空间限制
        myuploadAdd(option = {}) {
            let opt = get_modal_upgrade_opt(option);
            let vipcn = common.get_login_state().memberVipCn;
            let effective = method.getrank().myuploadAdd;
            let effective_msg = vipcn ? `${vipcn}用户文件储存总量不能超过 ${~~(effective / 1024)} MB` : `用户文件储存总量已达到上限`;
            let scene = get_uprank_scene({
                normal: `<p>${effective_msg}，请删除部分文件后继续</p>`,
                personal: `<p>${effective_msg}，请删除部分文件或升级会员后继续</p>`,
                team_admin: `<p>${effective_msg}，请删除部分文件或升级企业会员后继续</p>`,
                team_member: `<p>${effective_msg}，请删除部分文件或联系团队管理员升级企业会员后继续</p>`,
            });
            let fixed_obj = {
                modalContent: scene.result,
                showSubmit: scene.isUp,
            };
            if (!scene.isUp) {
                fixed_obj.modalTitle = '提示';
            }
            opt = Object.assign(opt, fixed_obj);
            modal(opt);
        },
        // 新建文档&恢复
        documentCreateAndRecovery(option = {}) {
            let opt = get_modal_upgrade_opt(option);
            let vipcn = common.get_login_state().memberVipCn;
            let effective = method.getrank().documentCreate;
            let effective_msg = vipcn ? `${vipcn}用户最多可创建 ${effective} 份文档` : `用户最多可创建文档已达到上限`;
            let scene = get_uprank_scene({
                normal: `<p>${effective_msg}，请删除部分后继续</p>`,
                personal: `<p>${effective_msg}，请删除部分或升级会员后继续</p>`,
                team_admin: `<p>${effective_msg}，请删除部分或升级企业会员后继续</p>`,
                team_member: `<p>${effective_msg}，请删除部分或联系团队管理员升级企业会员后继续</p>`,
            });
            let fixed_obj = {
                modalContent: scene.result,
                showSubmit: scene.isUp,
            };
            if (!scene.isUp) {
                fixed_obj.modalTitle = '提示';
            }
            opt = Object.assign(opt, fixed_obj);
            modal(opt);
        },
        // 新增协作成员
        documentCollaborateAdd(option = {}) {
            let opt = get_modal_upgrade_opt(option);
            let vipcn = common.get_login_state().memberVipCn;
            let effective = method.getrank().documentCollaborateAdd;
            let effective_msg = vipcn ? `${vipcn}用户每份文档最多可邀请 ${effective} 人协作` : `用户每份文档最多可邀请协作已达到上限`;
            let scene = get_uprank_scene({
                normal: `<p>${effective_msg}</p>`,
                personal: `<p>${effective_msg}，如需更多请升级会员后继续</p>`,
                // team_admin: `<p>${vipcn}用户每份文档最多可邀请 ${effective} 人协作，如需更多请升级企业会员后继续</p>`,
                // team_member: `<p>${vipcn}用户每份文档最多可邀请 ${effective} 人协作，如需更多请联系团队管理员升级企业会员后继续</p>`,
            });
            let fixed_obj = {
                modalContent: scene.result,
                showSubmit: scene.isUp,
            };
            if (!scene.isUp) {
                fixed_obj.modalTitle = '提示';
            }
            opt = Object.assign(opt, fixed_obj);
            modal(opt);
        },
        // 团队成员添加
        teamMemberAdd(option = {}) {
            let opt = get_modal_upgrade_opt(option);
            let vipcn = common.get_login_state().memberVipCn;
            let effective = method.getrank().teamMemberAdd;
            let effective_msg = vipcn ? `${vipcn}团队最多支持邀请 ${effective} 位成员` : `团队最多支持邀请成员已达到上限`;
            let scene = get_uprank_scene({
                normal: `<p>${effective_msg}</p>`,
                // personal: `<p>${vipcn}团队最多支持邀请 ${effective} 位成员，如需更多请升级会员后继续</p>`,
                team_admin: `<p>${effective_msg}，如需更多请升级企业会员后继续</p>`,
                // team_member: `<p>${vipcn}团队最多支持邀请 ${effective} 位成员，如需更多请联系团队管理员升级企业会员后继续</p>`,
            });
            let fixed_obj = {
                modalContent: scene.result,
                showSubmit: scene.isUp,
            };
            if (!scene.isUp) {
                fixed_obj.modalTitle = '提示';
            }
            opt = Object.assign(opt, fixed_obj);
            modal(opt);
        },
        // 文档下载
        documentDownload(option = {}) {
            let opt = get_modal_hcoin_opt(option);
            modal(opt);
        },
    },
};

export default method;