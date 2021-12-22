<template>
    <div :class="['doc-list-card doc-card', {checked: docInfo.checked, 'batch': main.isBatching, 'multiple': main.isBatching && main.checked_list && main.checked_list.length > 1, current: main.show_options_box && main.current_doc_info.id == docInfo.id}]"
        :key="docInfo.id"
        :data-id="docInfo.id"
        :data-type="docIcon"
        :data-count="main.checked_list && main.checked_list.length"
        @mousedown="distribute($event, 'mousedown')"
        @mouseenter="distribute($event, 'mouseenter')"
        @mouseleave="distribute($event, 'mouseleave')"
        @click="distribute($event, 'edit')"
    >
        <div class="card-wrap flex flex-between">
            <!-- 卡片左侧 -->
            <div class="card-left flex">
                <!-- 批量选中icon -->
                <base-icon v-if="main.isBatching" :class="['batch-check-icon', 'icondagou', docBatch]" color="#666666" size="14" @click.stop="distribute($event, 'batch')"></base-icon>
                <!-- 文档权限icon -->
                <base-icon v-else-if="docVisit.icon" :class="['authority-icon', docVisit.icon]" v-tooltip.top="docVisit.tip"></base-icon>
                <!-- 文档图标 -->
                <img :src="require(`@/assets/pc/images/doc/${docIcon}_list_icon.png`)">

                <!-- 文档信息 -->
                <div class="card-info">
                    <!-- 文档名称 -->
                    <p class="card-name">{{ docInfo.name }}</p>
                    <!-- 文档编辑日期 -->
                    <span class="date">{{ docDate}}</span>
                    <!-- 文档所有者 -->
                    <span class="owner">{{ docOwner }}</span>
                </div>
                

                <!-- 文档协作 -->
                <div class="card-collaborate flex" v-if="docCollaborate.length">
                    <!-- 协作者权限图标（文档所有者不为自己时展示） -->
                    <base-icon :class="['collaborate-authority-icon', docMyAuthority.icon]" v-if="docInfo.collaborateRoleType && docInfo.collaborateRoleType !== 'owner'" v-tooltip.top="docMyAuthority.tip"></base-icon>
                    <!-- 协作者头像 -->
                    <div :class="['partner-head', {'offline': !partner.online}]" v-for="(partner, index) in docCollaborate" :key="partner.memberId" v-show="index < 4" v-tooltip="partner.invitee || `${partner.nickName}${partner.online || partner.memberId === $common.get_login_state().id ? '' : '（离线）'}`">
                        <img :src="partner.head">
                        <i :style="{ background: (partner.online || partner.memberId === $common.get_login_state().id) ? partner.color : 'rgba(207, 207, 207, 0.7)' }"></i>
                    </div>
                    <div class="more" v-if="docCollaborate.length > 4" @click.stop="distribute($event, 'partner')">●●●</div>
                </div>
            </div>
            <!-- 卡片右侧 -->
            <div class="card-right">
                <!-- 欢迎文档 -->
                <template v-if="docInfo.is_welcome_document">
                    <!-- 应用 -->
                    <base-button class="use-btn primary" v-bdtongji="`文档中心-首页-文档设置-居中-应用`">应用</base-button>
                </template>
                <template v-else-if="!docInfo.grade">
                    <!-- 分享按钮 -->
                    <base-button class="share-btn" v-if="docInfo && main.check_option_disabled('documentAuthorityView', docInfo.collaborateRoleType) || ['myRelease','myCollect'].indexOf(docType) >= 0" @click.stop="distribute($event, 'share')" v-bdtongji="`文档中心-首页-文档设置-居中-分享`">分享</base-button>
                    <!-- 应用 -->
                    <base-button class="use-btn primary" v-if="docType === 'myRelease' || docType === 'myCollect'" v-bdtongji="`文档中心-首页-文档设置-居中-应用`">{{ docInfo.templateIsVip && !$common.get_login_state().memberVipExpire ? '会员专享' : '应用' }}</base-button>
                    <!-- 编辑/查看按钮 -->
                    <base-button class="edit-btn primary" v-else-if="docType !== 'dustbin'" v-bdtongji="`文档中心-首页-文档设置-居中-编辑`">{{ docInfo.collaborateRoleType === 'onlyView' ? '查看' : '编辑'}}</base-button>
                    <!-- 置顶按钮 -->
                    <base-icon :class="['top-btn iconzhiding', {'show': docInfo.topTime}]" :color="docInfo.topTime ? '#f7b500' : '#d2d2d8'" v-tooltip="docInfo.topTime ? '取消置顶' : '置顶'" @click.stop="distribute($event, 'top')" v-if="docType === 'myDesktop'" v-bdtongji="`文档中心-首页-文档设置-左侧-置顶`"></base-icon>
                </template>
                <!-- 设置按钮 -->
                <base-icon class="setting-btn iconshezhi" color="#767684" v-tooltip="`设置`" @click.stop="distribute($event, 'setting')"></base-icon>
            </div>
        </div>
    </div>
</template>

<script>
    /**
     *  文档中心 - 文档列表卡片
     */
        export default {
        name: "DocListCard",
        inject: ["main"],
        props: {
            docInfo: Object,
            docIndex: [Number, String],
            type: String
        },
        data(){
            return{
                docType: '',
            }
		},
        created () {
            this.docType = this.type || this.main.current_doc_list_type;
        },
        computed: {
            // 文档icon
            docIcon() {
                let doc = this.docInfo;
                let type = '';
                switch (true) {
                    case !!doc.grade:
                        type = 'folder';
                        break;
                    case doc.documentType === 'design':
                    case doc.templateType === 'design':
                        type = 'design';
                        break;
                    case !!doc.document:
                        type = 'slide';
                        if (doc.document.documentType === 'design') type = 'design';
                        break;
                    default:
                        type = 'slide';
                        break;
                }
                return type;
            },
            // 文档编辑日期
            docDate() {
                let result = this.docInfo.modifyDate || this.docInfo.createDate;
                if (!isNaN(Number(result))) {
                    result = utils.timeStampDetail(result / 1000);
                }
                return result;
            },
            // 文档所有者
            docOwner() {
                let result = '';
                let type = this.docType;
                let doc = this.docInfo;
                switch (true) {
                    case doc.is_welcome_document:
                        result = '由吾道创建';
                        break;
                    case type === 'dustbin':
                    case type === 'myRelease':
                    case doc.collaborateRoleType === 'owner':
                        result = '由我创建';
                        break;
                    case type === 'myCollect':
                        result = `由${ doc.memberNickName }创建`;
                        break;
                    case !!doc.grade:
                        result = '由我创建';
                        if (type === 'myTeam') {
                            result = `由${ doc.member.id == utils.getCookies('woodo_memberId') ? '我' : (doc.member.nickName || doc.member.id) }创建`;
                        }
                        break;
                    default:
                        result = `由${ doc.member.nickName || doc.member.id }创建`;
                        break;
                }
                return result;
            },
            // 文档访问权限
            docVisit() {
                let icon = '';
                let tip = '';
                switch (this.docInfo.visitType) {
                    case 'open':
                        icon = 'iconbianji';
                        tip = '获得链接的人都可查看';
                        break;
                    case undefined:
                    case 'edit':
                        icon = 'iconbianji';
                        tip = '获得链接的人都可编辑';
                        break;
                    case 'exclusive':
                        icon = 'iconyulan';
                        tip = '仅指定的成员可查看/编辑';
                        break;
                    case 'privacy':
                        icon = 'iconxiaoxitongzhi';
                        tip = '该文档仅自己编辑/查看';
                        break;
                }
                return {icon: icon, tip: tip};
            },
            // 协作文档我的访问权限
            docMyAuthority() {
                let icon = '';
                let tip = '';
                switch (this.docInfo.collaborateRoleType) {
                    case 'edit':
                        icon = 'iconkebianji';
                        tip = '该文档你可以编辑/评论';
                        break;
                    case 'onlyReview':
                        icon = 'iconkepinglun';
                        tip = '该文档你仅支持评论';
                        break;
                    default:
                        icon = 'iconkechakan';
                        tip = '该文档你仅支持查看';
                        break;
                }
                return {icon: icon, tip: tip};
            },
            // 文档协作
            docCollaborate() {
                return this.main.collaborates_document[this.docInfo.id] ? this.main.collaborates_document[this.docInfo.id].filter(item => !item.invitee && item.collaborateRoleType !== 'owner') : [];
            },
            // 文档批量选择状态
            docBatch() {
                let status = '';
                if (this.main.current_doc_list_type === 'dustbin') {
                    if (this.docInfo.checked) {
                        status = 'check';
                    } else {
                        status = 'wait';
                    }
                } else {
                    switch (this.docInfo.collaborateRoleType) {
                        case 'owner':
                            if (this.docInfo.checked) {
                                status = 'check';
                            } else {
                                status = 'wait';
                            }
                            break;
                        default:
                            status = 'no';
                            break;
                    }
                }
                return status;
            }
        },
        watch: {
            docInfo:{
                handler(value) {
                },
                deep: true
            },
        },
        methods:{
            distribute(ev, type) {
                this.$emit('distribute', type, this.docInfo, {e: ev, index: this.docIndex});
            },
        }
    }
</script>

<style lang="less" scoped>
.doc-list-card {
    width: 100%;
    cursor: pointer;
    &.checked,
    &.current{
        background: #edeff3;
    }
    .card-wrap{
        position: relative;
        height: 85px;
        align-content: center;
        padding: 0 20px 0 42px;
        border-bottom: 1px solid #e5e5e5;
        transition: all .3s;
    }
    .card-left{
        .authority-icon,
        .batch-check-icon{
            position: absolute;
            left: 4px;
            top: 34px;
            margin-right: 20px;
            margin-left: 4px;
            color: #bbbbbb;
        }
        & > img{
            width: 60px;
            height: 45px;
            margin-right: 27px;
        }
        .batch-check-icon{
            width: 20px;
            height: 20px;
            line-height: 20px;
            text-align: center;
            border: 1px solid #666666;
            border-radius: 6px;
            &::before{
                display: none;
            }
            &.no{
                border-color: #d2d2d8;
                background: #d2d2d8;
            }
            &.check::before{
                display: inline-block;
            }
        }
        .card-info{
            min-width: 200px;
            p{
                margin-bottom: 5px;
                font-size: 16px;
                color: #2B2A35;
            }
            span{
                font-size: 12px;
                color: #767684;
            }
            .date{
                margin-right: 35px;
            }
        }
        .card-collaborate{
            margin-left: 36px;
            .collaborate-authority-icon{
                margin-right: 20px;
                color: #bbbbbb;
            }
            .partner-head{
                position: relative;
                display: inline-block;
                margin-right: 10px;
                &:last-child{
                    margin-right: 0;
                }
                img{
                    width: 32px;
                    height: 32px;
                    border-radius: 50%;
                }
                i{
                    position: absolute;
                    right: 0;
                    bottom: 0;
                    z-index: 2;
                    width: 8px;
                    height: 8px;
                    border: 2px solid #ffffff;
                    border-radius: 8px;
                }
                &.offline::before{
                    content: "";
                    position: absolute;
                    top: 0;
                    left: 0;
                    width:  32px;
                    height:  32px;
                    border-radius: 50%;
                    background: rgba(207, 207, 207, 0.7);
                }
            }
            .more{
                font-size: 20px;
                color: #767684;
                cursor: pointer;
            }
        }
    }
    .card-right{
        font-size: 14px;
        .base-button{
            height: 40px !important;
            line-height: 40px;
            width: 60px;
        }
        .share-btn,
        .use-btn,
        .edit-btn,
        .top-btn:not(.show){
            display: none;
        }
        .share-btn{
            background: transparent;
            border: 1px solid #767684;
            border-radius: 7px;
            color: #767684;
        }
        .use-btn,
        .edit-btn{
            margin-left: 20px;
        }
        .top-btn{
            margin-left: 40px;
            cursor: pointer;
        }
        .setting-btn{
            margin-left: 32px;
            cursor: pointer;
        }
    }
    &:hover:not(.batch){
        .card-wrap{
            background: #edeff3;
        }
        .card-right{
            .share-btn,
            .use-btn,
            .edit-btn,
            .top-btn{
                display: inline-block;
            }
        }
    }
}
// 文档拖拽
.draggingStyle{
    position: relative;
    width: 60px !important;
    height: 45px !important;
    opacity: .6;
    &[data-type=folder]{
        background: url(~@/assets/pc/images/doc/folder_list_icon.png) no-repeat;
    }
    &[data-type=slide]{
        background: url(~@/assets/pc/images/doc/slide_list_icon.png) no-repeat;
    }
    &[data-type=design]{
        background: url(~@/assets/pc/images/doc/design_list_icon.png) no-repeat;
    }
    .card-wrap{
        display: none;
    }
    &.multiple{
        background: #edeff3;
        border: 2px dashed var(--mainColor);
        border-radius: 6px;
        &::before{
            content: "";
            position: absolute;
            top: -10px;
            right: 8px;
            width: 60px;
            height: 45px;
            border-radius: 6px;
        }
        &[data-type=folder]::before{
            background: url(~@/assets/pc/images/doc/folder_list_icon.png) no-repeat;
        }
        &[data-type=slide]::before{
            background: url(~@/assets/pc/images/doc/slide_list_icon.png) no-repeat;
        }
        &[data-type=design]::before{
            background: url(~@/assets/pc/images/doc/design_list_icon.png) no-repeat;
        }
        &::after{
            content: attr(data-count);
            position: absolute;
            top: calc(50% - 12px);
            right: -34px;
            width: 24px;
            height: 24px;
            line-height: 24px;
            border-radius: 50%;
            text-align: center;
            background-color: var(--mainColor);
            color: #ffffff;
            font-size: 14px;
        }
    }
}
@media screen and (max-width: 1400px) {
    .doc-list-card{
        .card-wrap{
            height: 74px;
        }
        .card-left{
            .authority-icon,
            .batch-check-icon{
                top: 29px;
            }
            & > img{
                width: 52px;
                height: 39px;
            }
            .card-info{
                p{
                    font-size: 15px;
                }
            }
            .batch-check-icon{
                width: 16px;
                height: 16px;
                line-height: 16px;
                border-radius: 5px;
            }
        }
        .card-right{
            .base-button{
                height: 36px !important; 
                line-height: 36px;
            }
        }
    }
}
</style>