<template>
    <div ref="card"
        class="document-card" 
        :class="{ 'batch': main.isBatching,
            'multiple': main.isBatching && main.checked_list && main.checked_list.length > 1,
            current: main.show_options_box && main.current_doc_info.id == documentInfo.id,
            'card-list': showType === 'list' }"
        :key="documentInfo.id"
        :data-id="documentInfo.id"
        :data-type="docIcon"
        @mouseenter="distribute($event, 'mouseenter')"
        @mouseleave="distribute($event, 'mouseleave')"
        @mousedown="distribute($event, 'mousedown')"
    >
        <!-- 网格形式 -->
        <div class="document-grid-container"
            v-if="showType === 'grid'"
            @click="distribute($event, main.isBatching ? 'batch' : (documentInfo.grade ? 'edit' : 'preview'))">
            <!-- 卡片主体 -->
            <template v-if="documentInfo.grade || documentInfo.page">
                <div class="cover-container"
                    :class="{ 'folder-cover': documentInfo.grade }"
                    :style="{ width: `${width}px`, height: `${height}px` }">
                    <!-- 文件夹 -->
                    <template v-if="documentInfo.grade">
                        <img class="folder" src="~@/assets/pc/images/doc/folder_tile_icon.png" :alt="documentInfo.name">
                    </template>

                    <!-- 文档 -->
                    <template v-else-if="documentInfo.page">
                        <div class="svg-wrap"
                            :style="{ width: `${svgSize.width}px`, height: `${svgSize.height}px` }">
                            <svg-modal
                                mode="mini"
                                :svg_w="svgSize.width"
                                :svg_h="svgSize.height"
                                :svg_view="[0, 0, documentInfo.width || 910, documentInfo.height || 512]"
                                :page_info="documentInfo.page"
                            ></svg-modal>
                        </div>
                        <!-- 分享按钮 -->
                        <div class="share-button">
                            <base-icon class="iconshare" size="20" color="#ffffff" v-tooltip="`预览`" v-if="!documentInfo.is_welcome_document" @click.stop="distribute($event, 'preview')"></base-icon>
                        </div>
                    </template>
                    
                    <!-- 应用 -->
                    <!-- <base-button class="use-btn primary" height="40" width="110" v-if="docType === 'myRelease' || docType === 'myCollect' || documentInfo.is_welcome_document" v-bdtongji="`文档中心-首页-文档设置-居中-应用`" @click.stop="documentInfo.templateIsVip && !$common.get_login_state().memberVipExpire ? distribute($event, 'preview') : distribute($event, 'edit')"><base-icon class="iconbianji" size="16" color="#ffffff"></base-icon>{{ documentInfo.templateIsVip && !$common.get_login_state().memberVipExpire ? '会员专享' : '应用' }}</base-button> -->

                    <!-- 编辑/查看按钮 -->
                    <!-- <base-button class="edit-btn primary" height="40" width="110" v-else-if="docType !== 'dustbin'" v-bdtongji="`文档中心-首页-文档设置-居中-编辑`" @click.stop="documentInfo.collaborateRoleType === 'onlyView' ? distribute($event, 'preview') : distribute($event, 'edit')"><base-icon class="iconbianji" size="16" color="#ffffff"></base-icon>{{ documentInfo.collaborateRoleType === 'onlyView' ? '立即查看' : '立即编辑'}}</base-button> -->
                </div>
                <div class="detail-container" ref="detailContainer" :style="{ width: `${width}px`, height: `calc(100% - ${height}px)` }">
                    <!-- 我的工程显示的信息 -->
                    <div class="document-detail-container" v-if="type === 'document'">
                        <div class="detail-top">
                            <div class="document-title" :class="{ 'editting': isEditTitle  }">
                                <base-icon class="set-top iconbiaoqianyemian" v-if="documentInfo.topTime" v-tooltip.top="`取消置顶`" @click.stop="distribute($event, 'setTop')"></base-icon>
                                <div v-show="!isEditTitle" class="title text-ellipsis text-middle" v-html="documentInfo.searchName || documentInfo.name"></div>
                                <input
                                    :style="{ 'opacity': isEditTitle ? 1 : 0 }"
                                    ref="editTitle"
                                    class="title text-ellipsis text-middle"
                                    :value="documentInfo.name"
                                    @keyup.enter="saveTitle" />
                                <!-- 批量操作按钮 -->
                                <template v-if="isBatching">
                                    <base-input :class="docBatch" class="select-document" ref="selectButton" type="checkbox" :height="16" :value="documentInfo.checked" @change.stop="batchSelectProject"></base-input>
                                </template>
                                <!-- 编辑名称按钮 -->
                                <template v-else>
                                    <base-icon v-if="!isEditTitle" :size="14" @click.stop="editTitle" class="edit-title iconbianji" v-tooltip.top="`重命名`"></base-icon>
                                    <base-icon v-else :size="14" @click.stop="saveTitle" class="edit-title icondagou" v-tooltip.top="`确认`"></base-icon>
                                </template>
                            </div>
                        </div>
                        <div class="detail-bottom">
                            <div class="document-modify-date text-ellipsis text-middle">{{ documentInfo.page ? `最近编辑：${modifyDate}` : '' }}</div>
                            <base-icon class="setting-btn icongengduoanniu1 text-middle" color="#5F6063" @click.stop="distribute($event, 'setting')" :style="{ display: documentInfo.showSetting ? 'inline-block' : '' }"></base-icon>
                        </div>
                    </div>
                    <!-- 回收站显示的信息 -->
                    <div class="recycle-detail-container" v-else>
                    </div>
                </div>
            </template>

            <!-- 模板封面图 -->
            <template v-else>
                <img :src="documentInfo.image" :alt="documentInfo.name">
            </template>
        </div>

        <!-- 列表形式 -->
        <div class="document-list-container flex" v-else>
            <!-- 我的工程 -->
            <template v-if="type === 'document'">
                <!-- 我的文档 -->
                <template>
                    <!-- 批量操作按钮 -->
                    <base-icon v-if="main.isBatching" :class="['batch-check-icon', 'icondagou', docBatch]" color="#666666" size="14" @click.stop="distribute($event, 'batch')"></base-icon>
                    <!-- 文档权限 -->
                    <base-icon v-else-if="docVisit.icon" :class="['authority-icon', docVisit.icon]" v-tooltip.top="docVisit.tip"></base-icon>
                    <div class="document-list flex">
                        <!-- 文档图标 -->
                        <img class="document" :src="require(`@/assets/pc/images/doc/${docIcon}_list_icon.png`)">
                        <!-- 文档名称 -->
                        <div class="document-title flex" @click.stop :class="{ 'editting': isEditTitle  }">
                            <div v-show="!isEditTitle" class="title text-ellipsis text-middle" v-html="documentInfo.searchName || documentInfo.name"></div>
                            <input
                                :style="{ 'opacity': isEditTitle ? 1 : 0 }"
                                ref="editTitle"
                                class="title text-ellipsis text-middle"
                                :value="documentInfo.name"
                                @keyup.enter="saveTitle" />
                        </div>
                        <!-- 文档协作 -->
                        <div class="collaborate-container flex">
                            <template v-if="documentInfo.page && docCollaborate.length">
                                <!-- 协作者权限图标（文档所有者不为自己时展示） -->
                                <base-icon :class="['collaborate-authority-icon', docMyAuthority.icon]" v-if="documentInfo.collaborateRoleType && documentInfo.collaborateRoleType !== 'owner'" v-tooltip.top="docMyAuthority.tip"></base-icon>
                                <!-- 协作者头像 -->
                                <div
                                    class="partner-head"
                                    v-for="(partner, index) in docCollaborate"
                                    :key="partner.memberId"
                                    v-show="index < 4"
                                    v-tooltip="partner.invitee || `${partner.nickName}${partner.online || partner.memberId === $common.get_login_state().id ? '' : '（离线）'}`">
                                    <img :src="partner.head">
                                    <i v-if="partner.online || (partner.memberId === $common.get_login_state().id)"></i>
                                </div>
                                <div class="more" v-if="docCollaborate.length > 4" @click.stop="distribute($event, 'partner')">
                                    <base-icon class="icongengduoanniu1"></base-icon>
                                </div>
                            </template>
                        </div>
                        <!-- 文档所有者 -->
                        <span class="owner text-ellipsis">{{ docOwner }}</span>
                        <!-- 文档编辑日期 -->
                        <div class="modify-date text-ellipsis" v-if="documentInfo.page">
                            <span class="item-name">最近编辑：</span>
                            <span class="item-value">{{ modifyDate }}</span>
                        </div>
                        <!-- 文档个数 -->
                        <div class="document-number" v-else>有0个文档</div>
                        <div class="button-group flex">
                            <template v-if="documentInfo.is_welcome_document">
                                <!-- 应用 -->
                                <base-button class="use-btn primary" v-bdtongji="`文档中心-首页-文档设置-居中-应用`">应用</base-button>
                            </template>
                            <template v-else-if="!documentInfo.grade">
                                <!-- 分享按钮 -->
                                <!-- <base-button class="button-item share-btn" v-if="documentInfo && main.check_option_disabled('documentAuthorityView', documentInfo.collaborateRoleType) || ['myRelease','myCollect'].indexOf(docType) >= 0" @click.stop="distribute($event, 'share')" v-bdtongji="`文档中心-首页-文档设置-居中-分享`">分享</base-button> -->
                                <base-button class="button-item preview-btn">预览</base-button>
                                <!-- 应用 -->
                                <!-- <base-button class="button-item use-btn primary" v-if="docType === 'myRelease' || docType === 'myCollect'" v-bdtongji="`文档中心-首页-文档设置-居中-应用`">{{ documentInfo.templateIsVip && !$common.get_login_state().memberVipExpire ? '会员专享' : '应用' }}</base-button> -->
                                <!-- 编辑/查看按钮 -->
                                <base-button class="button-item edit-btn primary" v-if="docType !== 'dustbin'" v-bdtongji="`文档中心-首页-文档设置-居中-编辑`">{{ documentInfo.collaborateRoleType === 'onlyView' ? '查看' : '编辑'}}</base-button>
                            </template>
                        </div>
                        <!-- 置顶 -->
                        <base-icon v-if="documentInfo.topTime" class="set-top iconbiaoqianyemian" v-tooltip.top="`取消置顶`" @click.stop="distribute($event, 'top')" v-bdtongji="`文档中心-首页-文档设置-左侧-置顶`"></base-icon>
                        <base-icon v-else-if="documentInfo.page" class="set-top untop iconbiaoqianyemian" v-tooltip.top="`置顶`" @click.stop="distribute($event, 'top')" v-bdtongji="`文档中心-首页-文档设置-左侧-置顶`"></base-icon>
                        <base-icon v-else class="set-top"></base-icon>
                        <!-- 更多设置 -->
                        <base-icon class="setting-btn icongengduoanniu1 text-middle" v-tooltip.top="`设置`" @click.stop="distribute($event, 'setting')" :style="{ display: documentInfo.showSetting ? 'inline-block' : '' }"></base-icon>
                    </div>
                </template>
            </template>
            <!-- 回收站 -->
            <!-- <template v-else>
                批量操作按钮
                <base-input v-if="batch" ref="selectButton" class="select-document" type="checkbox" :height="16" :value="documentInfo.checked" @change="batchSelectProject"></base-input>
                <div class="recycle-list flex" @click="batchSelectProject">
                    <img class="video" src="@/assets/images/document.png" alt="">
                    <div class="document-title text-ellipsis">{{ documentInfo.title }}</div>
                    <div class="document-duration text-ellipsis">
                        <span class="item-name">工程时长：</span>
                        <span class="item-value">{{ documentInfo.page.duration }}</span>
                    </div>
                    <div class="remain-time text-ellipsis" :class="{ 'last-day': documentInfo.lastDay }">
                        <base-icon class="icona-daochushichang" v-tooltip.top="`剩余删除时间`"></base-icon>
                        <div class="time">{{ remainDate }}</div>
                    </div>
                    <div class="button-group flex">
                        <div class="button-item delete" v-tooltip.top="`删除`"  @click="deleteProjectConfirm">
                            <base-icon class="icondelete" ></base-icon>
                        </div>
                        <div class="button-item recover" v-tooltip.top="`恢复`"  @click="recoverProject">
                            <base-icon class="iconhuifuyuanwei"></base-icon>
                        </div>
                    </div>
                </div>
            </template> -->
        </div>
    </div>
</template>

<script>
    /**
     *  文档中心 - 文档卡片
     */
    import SvgModal from '@/components/SvgPageModal.vue';
    import DocOptions from '@/views/pc/DocCenter/components/DocCenterOptions.vue';

    export default {
        name: "DocumentCard",
        components: {
            SvgModal,
            DocOptions
        },
        inject: ["main"],
        props: {
            documentInfo: {
                type: [Object, Number],
                default: () => {}
            },
            documentIndex: Number,
            isFit: Boolean,
            placeholder: Boolean,
            needSetting: {
                type: Boolean,
                default: true
            },
            showType: {
                type: String,
                default: 'grid'
            },
            type: {
                type: String,
                default: 'document'
            },
            isBatching: {
                type: Boolean,
                default: false
            },
            parentFolder: {
                type: Object,
                default: () => {}
            },
            collaborateDocument: {
                type: Object,
                default: () => {}
            }
        },
        data(){
            return{
                docType: '',
                width: '',
                height: '',
                document_info_title: null,  // 标题
                isEditTitle: false,
            }
		},
        mounted () {
            // this.docType = this.type || this.main.current_doc_list_type;
            // if (this.isFit && !this.main.doc_loading && this.main.doc_display_type === 'tile') {
            //     this.$nextTick(() => {
            //         this.width = this.$refs.card.clientWidth;
            //         this.height = (9 * this.width) / 16;
            //         this.isReady = true;
            //     });
            // } else {
            //     this.isReady = true;
            // }
            console.log(this.collaborateDocument);
            this.document_info_title = this.documentInfo.name;
            if (this.showType === 'grid') {
                this.setDocHeight();
                window.addEventListener('resize', this.setDocHeight);
            }
            // console.log(this.documentInfo);
        },
        beforeDestroy() {
            window.removeEventListener('resize', this.setDocHeight);
        },
        computed: {
            // 文档icon
            docIcon() {
                let doc = this.documentInfo;
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
            // 最近编辑日期
            modifyDate() {
                let result = this.documentInfo.modifyDate || this.documentInfo.createDate;
                if (!isNaN(Number(result))) {
                    result = utils.timeStampDetail(result / 1000);
                }
                return result;
            },
            // svg尺寸
            svgSize() {
                const CARD_WIDTH = this.width || 320;
                const CARD_HEIGHT = this.height || 180;

                let width = this.documentInfo.width || 910;
                let height = this.documentInfo.height || 512;
                let ratio = width / height;
                let result = {};
                if (ratio <= 1 || (CARD_WIDTH / ratio) > CARD_HEIGHT) {
                    result['height'] = CARD_HEIGHT;
                    result['width'] = CARD_HEIGHT * ratio;
                } else {
                    result['width'] = CARD_WIDTH;
                    result['height'] = CARD_WIDTH / ratio;
                }
                return result;
            },
            // 文档批量选择状态
            docBatch() {
                let status = '';
                switch (this.documentInfo.collaborateRoleType) {
                    case 'owner':
                    case 'onlyView':
                        if (this.documentInfo.checked) {
                            status = 'check';
                        } else {
                            status = 'wait';
                        }
                        break;
                    default:
                        status = 'no';
                        break;
                }
                return status;
            },
            // 文档所有者
            docOwner() {
                let result = '';
                let type = this.docType;
                let doc = this.documentInfo;
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
                switch (this.documentInfo.visitType) {
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
                switch (this.documentInfo.collaborateRoleType) {
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
                return this.main.collaborates_document[this.documentInfo.id] ? this.main.collaborates_document[this.documentInfo.id].filter(item => !item.invitee && item.collaborateRoleType !== 'owner') : [];
            },
            // 文档批量选择状态
            docBatch() {
                let status = '';
                if (this.type === 'dustbin') {
                    if (this.documentInfo.checked) {
                        status = 'check';
                    } else {
                        status = 'wait';
                    }
                } else {
                    switch (this.documentInfo.collaborateRoleType) {
                        case 'owner':
                            if (this.documentInfo.checked) {
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
        methods:{
            setDocHeight() {
                this.$nextTick(() => {
                    this.width = this.$refs.card.clientWidth;
                    this.height = (9 * this.width) / 16;
                });
            },
            distribute(ev, type) {
                if (this.isEditTitle) return;
                this.$emit('distribute', type, this.documentInfo, { e: ev, index: this.documentIndex });
            },
            // 开始修改标题
            editTitle() {
                this.isEditTitle = true;
                this.$refs.editTitle.select();
                $(document).on(`mousedown`, e => {
                    let $target = $(e.target);
                    if (!$target.is(`.document-title`) && $target.parents(`.document-title`).length === 0) {
                        this.isEditTitle = false;
                        $(document).off(`mousedown`);
                    }
                });
            },
            // 保存修改后的标题
            saveTitle() {
                let title = this.$refs.editTitle.value;
                let oldTitle = this.documentInfo.name;
                this.isEditTitle = false;
                this.$refs.editTitle.blur();
                this.$refs.editTitle.value = oldTitle;
                if (title === oldTitle) return;
                if ($validate(title).empty()) {
                    return this.$toast('标题不能为空');
                }
                if ($validate(title).illegal() || $validate(title).special()) {
                    return this.$toast('标题存在非法字符，请重新输入');
                }
                if (!$validate(title).rangelength(60)) {
                    return this.$toast('标题最大可输入60字');
                }
                if (this.documentInfo.grade) {
                    // 文件夹重命名
                    this.documentInfo.name = title;
                    this.$set(this.documentInfo, 'searchName', title);
                    this.$axios.post('/api/member/folder/rename/', {
                        fid: this.documentInfo.id,
                        name: title
                    }).then(data => {
                        if(data.data.code !== '2') return this.$toast(data.data.content, 2000);
                        this.$toast('修改文件夹标题成功');
                    }).catch(err => {
                        this.documentInfo.name = oldTitle;
                        this.$toast('修改文件夹标题失败，请重试');
                    });
                } else {
                    // 文档重命名
                    this.documentInfo.name = title;
                    this.$set(this.documentInfo, 'searchName', title);
                    this.$axios.post('/api/member/document/rename/', {
                        docId: this.documentInfo.id,
                        title
                    }).then(data => {
                        if(data.data.code !== '2') return this.$toast(data.data.content, 2000);
                        this.$toast('修改文档标题成功');
                    }).catch(err => {
                        this.documentInfo.name = oldTitle;
                        this.$toast('修改文档标题失败，请重试');
                    });
                }
            },
        }
    }
</script>

<style lang="less" scoped>
.text-middle {
    vertical-align: middle;
}
.set-top {
    display: inline-block;
    width: 16px;
    height: 16px;
    color: #FECE0A;
    &:hover {
        color: var(--mainColor) !important;
    }
}
.last-day {
    color: #FF9200 !important;
    .base-icon {
        color: #FF9200 !important;
    }
}
.document-title {
    position: relative;
    width: 100%;
    height: 22px;
    .title {
        position: absolute;
        top: 0;
        left: 0;
        height: 22px;
        line-height: 22px;
        padding: 0;
        color: var(--stressColor);
        font-size: 18px;
        opacity: 1;
        border: none;
        padding-right: 10px;
        background-color: transparent;
        pointer-events: none;
    }
    .edit-title {
        position: absolute;
        top: 0;
        right: 0;
        opacity: 0;
        color: #5F6063;
        padding: 4px;
        &:hover {
            opacity: 1;
            color: var(--mainColor);
        }
    }
    .select-document {
        position: absolute;
        top: 2px;
        right: 0;
    }
    &:hover .edit-title {
        opacity: 1;
    }
}
.editting {
    .edit-title {
        opacity: 1;
        color: var(--stressColor);
        border-radius: 4px;
        background-color: var(--backColor);
        &:hover {
            color: var(--mainColor);
            background-color: rgba(13, 123, 246, 0.1);
        }
    }
    .title {
        pointer-events: auto;
    }
}
.document-card {
    width: 100%;
    height: 100%;
    position: relative;
    .document-grid-container {
        width: 100%;
        height: 100%;
        cursor: pointer;
        .folder {
            width: 100%;
            height: 100%;
            img {
                width: 100%;
                height: 65%;
            }
            .folder-bottom {
                position: relative;
                width: 100%;
                height: 35%;
                color: #242529;
                border-radius: 0 0 5px 5px;
                padding: 6% 7% 6% 13%;
                background-color: #FFFFFF;
                .title {
                    display: inline-block;
                    width: calc(100% - 24px);
                }
                .folder-setting {
                    position: relative;
                    font-size: 12px;
                    color: #949496;
                    margin-top: 4%;
                    div {
                        display: inline-block;
                        width: calc(100% - 24px);
                    }
                    .setting-btn {
                        position: absolute;
                        top: 0;
                        right: 0;
                        display: none;
                        color: #000000;
                    }
                }
                &:hover {
                    .setting-btn {
                        display: inline-block;
                    }
                }
            }
        }
        .cover-container {
            position: relative;
            text-align: center;
            overflow: hidden;
            border-radius: 5px 5px 0 0;
            border-bottom: 1px solid var(--borderColor);
            background-color: #D6D8DD;
            .svg-wrap {
                display: inline-block;
                vertical-align: middle;
                margin: 0 auto;
                cursor: pointer;
            }
            .share-button {
                display: none;
                position: absolute;
                top: 10px;
                right: 10px;
                width: 32px;
                height: 32px;
                border-radius: 8px;
                background-color: rgba(0, 0, 0, 0.5);
                .base-icon {
                    color: #FFFFFF;
                    line-height: 32px;
                    margin-left: 50%;
                    transform: translateX(-50%);
                }
            }
            &.folder-cover {
                border-color: transparent;
                background-color: transparent;
            }
            &:hover {
                .share-button {
                    display: inline-block;
                }
            }
        }
        .detail-container {
            border-radius: 0 0 5px 5px;
            padding: 6% 7% 6% 13%;
            background-color: var(--upperColor);
            .document-detail-container {
                .title,
                .document-modify-date {
                    display: inline-block;
                    width: calc(100% - 24px);
                }
                .detail-top {
                    margin-bottom: 4%;
                    .document-title {
                        position: relative;
                        .set-top {
                            position: absolute;
                            top: 3px;
                            left: -24px;
                        }
                    }
                }
                .detail-bottom {
                    position: relative;
                    font-size: 12px;
                    color: var(--dimColor);
                    .setting-btn {
                        position: absolute;
                        top: 0;
                        right: 0;
                        display: none;
                        color: #000000;
                    }
                }
            }
            .recycle-detail-container {
                .document-title {
                    color: #242529;
                    margin-bottom: 10px;
                }
                .remain-time {
                    font-size: 12px;
                    color: #747477;
                    .time {
                        display: inline-block;
                        margin-left: 7px;
                    }
                }
            }
        }
        &:hover {
            .folder .folder-bottom .setting-btn,
            .detail-container .document-detail-container .detail-bottom .setting-btn {
                display: inline-block;
            }
            .recycle-button {
                display: inline-block !important;
            }
        }
    }
    .document-list-container {
        width: 100%;
        cursor: pointer;
        border: 1px solid transparent;
        .authority-icon,
        .batch-check-icon {
            margin-right: 10px;
            color: #CDCFD2;
        }
        .batch-check-icon {
            min-width: 20px;
            min-height: 20px;
            line-height: 20px;
            text-align: center;
            border: 1px solid #666666;
            border-radius: 6px;
            &::before {
                display: none;
            }
            &.no {
                border-color: #d2d2d8;
                background: #d2d2d8;
            }
            &.check::before {
                display: inline-block;
            }
        }
        .document-list {
            justify-content: flex-start;
            align-items: center;
            width: 100%;
            height: 70px;
            padding: 0 20px;
            border-radius: 5px;
            .document {
                width: 60px;
                height: 46px;
            }
            .document-title {
                position: relative;
                width: 200px;
                min-width: 200px;
                margin-left: 20px;
                .title {
                    position: absolute;
                    top: 0;
                    left: 0;
                    width: 200px;
                }
            }
            .collaborate-container {
                flex-grow: 1;
                justify-content: flex-start;
                min-width: 250px;
                margin-left: 30px;
                .collaborate-authority-icon {
                    margin-right: 20px;
                    color: #bbbbbb;
                }
                .partner-head {
                    position: relative;
                    display: inline-block;
                    margin-right: 10px;
                    img {
                        width: 32px;
                        height: 32px;
                        border: 1px solid transparent;
                        border-radius: 50%;
                    }
                    i {
                        position: absolute;
                        right: 0;
                        bottom: 3px;
                        z-index: 2;
                        width: 8px;
                        height: 8px;
                        border-radius: 8px;
                        background-color: #088C1B;
                    }
                    &:last-child {
                        margin-right: 0;
                    }
                }
                .more {
                    width: 32px;
                    height: 32px;
                    text-align: center;
                    line-height: 32px;
                    border-radius: 50%;
                    border: 1px solid transparent;
                    background-color: #FFFFFF;
                    .base-icon {
                        color: #949496;
                    }
                }
            }
            .owner {
                min-width: 100px;
                color: #5F6063;
            }
            .document-number,
            .modify-date {
                width: 200px;
                min-width: 160px;
                margin-left: 50px;
                color: #5F6063;
                .item-name {
                    color: var(--dimColor);
                }
            }
            .set-top {
                margin: 0 30px;
            }
            .untop {
                opacity: 0;
                color: #CDCFD2;
            }
            .button-group {
                justify-content: flex-end;
                opacity: 0;
                width: 150px;
                margin-left: 50px;
                .button-item {
                    width: 60px;
                    font-size: 12px;
                    margin-right: 20px;
                    text-align: center;
                }
                .preview-btn {
                    color: #767684;
                    border: 1px solid var(--borderColor);
                }
                .edit-btn {
                    color: #FFFFFF;
                }
            }
            .setting-btn {
                color: #C9CACB;
            }
            &:hover {
                background-color: var(--upperColor);
                .untop,
                .button-group {
                    opacity: 1;
                }
                .collaborate-container {
                    .partner-head img,
                    .more {
                        border-color: #CDCFD2;
                        box-shadow: 0 2px 10px rgba(201, 202, 203, 0.5);
                    }
                }
                .setting-btn {
                    color: var(--textColor);
                }
            }
        }
    }
    .document-card-setting {
        top: calc(100% - 9px);
        left: calc(100% - 60px);
        width: auto;
        background-color: #FFFFFF;
        border-radius: 5px;
        .setting-container {
            font-size: 12px;
            color: #5F6063;
            border-radius: 5px;
            opacity: 0.99;
            border: 1px solid rgba(201, 202, 203, 0.5);
            li {
                width: 158px;
                height: 40px;
                cursor: pointer;
                .base-icon {
                    margin: 0 14px 0 30px;
                }
                &:first-child {
                    border-radius: 5px 5px 0 0;
                }
                &:last-child {
                    border-radius: 0 0 5px 5px;
                }
                &:hover {
                    background-color: #FAFAFA;
                }
            }
        }
    }
}
.card-list {
    .document-card-setting {
        top: 30px;
        left: calc(100% - 200px);
    }
    .document-title {
        .title {
            font-size: 14px;
            color: var(--stressColor);
        }
    }
}
@media screen and (max-width: 1400px) {
    .document-title {
        .title {
            font-size: 14px;
        }
    }
}
@media screen and (max-width: 1500px) {
    .card-list {
        .document-list-container {
            .document-list {
                .document-number,
                .modify-date {
                    margin-left: 20px;
                }
                .button-group {
                    margin-left: 0;
                }
            }
        }
    }
}
</style>

<style lang="less">
body[data-theme="dark"] {
    .my-document {
        .my-document-container {
            .document-operation {
                .document-change-container .document-nav-select li:hover {
                    background-color: #292A2E !important;
                }
            }
            .sort-container ul {
                box-shadow: 0 5px 10px rgba(23, 24, 27, 0.5) !important;
                li:hover {
                    background-color: #292A2E !important;
                }
            }
        }
    }
}
</style>
