<template>
    <div class="doc-tile-card doc-card" ref="card"
        :class="{'batch': main.isBatching, 'multiple': main.isBatching && main.checked_list && main.checked_list.length > 1, current: main.show_options_box && main.current_doc_info.id == docInfo.id}"
        :key="docInfo.id"
        :data-id="docInfo.id"
        :data-type="docIcon"
        :data-count="main.checked_list && main.checked_list.length"
        @mouseenter="distribute($event, 'mouseenter')"
        @mouseleave="distribute($event, 'mouseleave')"
        @mousedown="distribute($event, 'mousedown')"
    >
        <!-- 骨架卡片 -->
        <template v-if="!docInfo || !isReady">
            <div class="card-wrap skeleton">
                <div class="card-top skeleton-loading"></div>
                <div class="card-bottom"></div>
            </div>
        </template>

        <!-- 占位卡片 -->
        <template v-else-if="placeholder"><div class="card-wrap placeholder"></div></template>

        <!-- 文档卡片 -->
        <template v-else>
            <div class="card-wrap" :style="{height: `${isFit ?  height + 100 : ''}px`}">
                <div :class="['card-top', {'folder': docInfo.grade}]" :style="{width: `${width}px`, height: `${height}px`}" @click="distribute($event, main.isBatching ? 'batch' : (docInfo.grade ? 'edit' : 'preview'))">
                    <!-- 文件夹 -->
                    <template v-if="docInfo.grade">
                        <img class="folder" src="~@/assets/pc/images/doc/folder-tile-icon.png" :alt="docInfo.name">
                    </template>
                    <!-- 文档svg模板 -->
                    <template v-else-if="!!docInfo.page">
                        <div class="svg-wrap" :style="{width: `${svgSize.width}px`, height: `${svgSize.height}px`}" v-if="isReady && (!type && docType === 'myDesktop' ? docInfo.isRender : true)">
                            <svg-modal
                                mode="mini"
                                :svg_w="svgSize.width"
                                :svg_h="svgSize.height"
                                :svg_view="[0, 0, docInfo.width || 910, docInfo.height || 512]"
                                :page_info="docInfo.page"
                            ></svg-modal>
                        </div>
                    </template>
                    <!-- 模板封面图 -->
                    <template v-else>
                        <img :src="docInfo.image" :alt="docInfo.name">
                    </template>
                    <div class="top-operate" v-if="!docInfo.grade">
                        <!-- 预览 -->
                        <base-icon class="preview-btn iconyulan" size="20" color="#ffffff" v-tooltip="`预览`" v-if="!docInfo.is_welcome_document" @click.stop="distribute($event, 'preview')"></base-icon>

                        <!-- 应用 -->
                        <base-button class="use-btn primary" height="40" width="110" v-if="docType === 'myRelease' || docType === 'myCollect' || docInfo.is_welcome_document" v-bdtongji="`文档中心-首页-文档设置-居中-应用`" @click.stop="docInfo.templateIsVip && !$common.get_login_state().memberVipExpire ? distribute($event, 'preview') : distribute($event, 'edit')"><base-icon class="iconbianji" size="16" color="#ffffff"></base-icon>{{ docInfo.templateIsVip && !$common.get_login_state().memberVipExpire ? '会员专享' : '应用' }}</base-button>

                        <!-- 编辑/查看按钮 -->
                        <base-button class="edit-btn primary" height="40" width="110" v-else-if="docType !== 'dustbin'" v-bdtongji="`文档中心-首页-文档设置-居中-编辑`" @click.stop="docInfo.collaborateRoleType === 'onlyView' ? distribute($event, 'preview') : distribute($event, 'edit')"><base-icon class="iconbianji" size="16" color="#ffffff"></base-icon>{{ docInfo.collaborateRoleType === 'onlyView' ? '立即查看' : '立即编辑'}}</base-button>

                    </div>
                </div>

                <div class="card-bottom flex" @click="distribute($event, 'batch')">
                    <div class="name-edit">
                        <input class="card-name text-ellipsis" :value="document_info_title" disabled ref="editName" @input="input_title()" @blur="setTitle" @keyup.enter="setTitle" />
                        <base-icon class="iconbianji" size="16" color="#666666" @click="editName" v-if="docInfo.documentType && docInfo.collaborateRoleType !== 'onlyView' && docInfo.collaborateRoleType !== 'onlyReview'"></base-icon>
                    </div>

                    <p v-if="!docInfo.grade && (docType === 'myDesktop' || docType === 'myTeam')">最近编辑：{{ date }}</p>

                    <!-- 批量选中icon -->
                    <base-icon v-if="main.isBatching" :class="['batch-check-icon', 'icondagou', docBatch]" color="#666666" size="14" @click.stop="distribute($event, 'batch')"></base-icon>

                    <!-- 设置按钮 -->
                    <base-icon v-else-if="needSetting" class="iconshezhi setting-btn" size="20" color="#666666" @click.stop="distribute($event, 'setting')"></base-icon>
                </div>
            </div>
        </template>
    </div>
</template>

<script>
    /**
     *  文档中心 - 文档平铺卡片
     */
    import svgModal from '@/components/SvgPageModal.vue';
    export default {
        name: "DocTileCard",
        components: { svgModal },
        inject: ["main"],
        props: {
            docInfo: [Object, Number],
            docIndex: Number,
            type: String,
            isFit: Boolean,
            placeholder: Boolean,
            needSetting: {
                type: Boolean,
                default: true
            }
        },
        data(){
            return{
                isReady: false,
                docType: '',
                width: '',
                height: '',
                document_info_title: null,  // 标题
            }
		},
        mounted () {
            this.docType = this.type || this.main.current_doc_list_type;
            if (this.isFit && !this.main.doc_loading && this.main.doc_display_type === 'tile') {
                this.$nextTick(() => {
                    this.width = this.$refs.card.clientWidth;
                    this.height = (9 * this.width) / 16;
                    this.isReady = true;
                })
            } else {
                this.isReady = true;
            }
            this.document_info_title = this.docInfo.name;
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
            // 日期
            date() {
                let result = this.docInfo.modifyDate || this.docInfo.createDate;
                if (!isNaN(Number(result))) {
                    result = this.$common.timeStampDetail(result / 1000);
                }
                return result;
            },
            // svg尺寸
            svgSize() {
                const CARD_WIDTH = this.width || 320;
                const CARD_HEIGHT = this.height || 180;
                let width = this.docInfo.width || 910;
                let height = this.docInfo.height || 512;
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
                switch (this.docInfo.collaborateRoleType) {
                    case 'owner':
                    case 'onlyView':
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
                return status;
            }
        },
        methods:{
            distribute(ev, type) {
                this.$emit('distribute', type, this.docInfo, {e: ev, index: this.docIndex});
            },
            // 编辑标题
            editName() {
                this.$refs.editName.removeAttribute('disabled');
                this.$refs.editName.focus();
            },
            // 设置标题
            setTitle() {
                let that = this;
                that.$refs.editName.setAttribute('disabled', true);
                this.$refs.editName.blur();

                // 名称没有修改，不请求接口
                if(that.document_info_title === that.docInfo.name) {
                    return false;
                }
                // 错误拦截
				if($validate(that.document_info_title).special()) return that.$toast('不能包含特殊字符', 2000);
                if($validate(that.document_info_title).null()) {
                    that.document_info_title = that.docInfo.name;
					that.$toast('输入不能为空', 2000);
				} else {
                    that.document_info_title = that.document_info_title.slice(0, 50);   // 字数限制为50个，超出无效
                    that.$axios.post('/api/member/document/rename/', {
                        docId: that.docInfo.id,
                        title: that.document_info_title
                    }).then((data) => {
                        if(data.data.code !== '2') return that.$toast(data.data.content, 2000);
                        that.docInfo.name = that.document_info_title;
                        that.$toast('修改成功', 1500);
                    })
                };
            },
            // 标题输入框进行输入时触发
            input_title() {
                this.document_info_title = this.$refs.editName.value;
            }
        }
    }
</script>

<style lang="less" scoped>
.doc-tile-card {
    position: relative;
    display: inline-block;
    vertical-align: top;
    width: 320px;
    font-size: 0;
    cursor: pointer;
    &[data-type=folder]{
        &:hover,
        &.current{
            box-shadow: none !important;
            .card-bottom{
                box-shadow: 0 6px 10px 0 rgba(82, 99, 125, .2);
            }
        }
    }
    .card-wrap .skeleton .card-top {
        background-color: #e2e2e6;
    }
    .card-wrap.placeholder{
        width: 300px;
    }
    .card-top{
        position: relative;
        width: 320px;
        height: 180px;
        overflow: hidden;
        background-color: #e2e2e6;
        text-align: center;
        transition: 0.3s;
        border-bottom: 1px solid #edeff3;
        border-top-left-radius: 6px;
        border-top-right-radius: 6px;
        .svg-wrap{
            display: inline-block;
            vertical-align: middle;
            margin: 0 auto;
        }
        img {
            display: inline-block;
            vertical-align: middle;
            width: 100%;
            margin: 0 auto;
        }
        &.folder{
            height: 210px;
            background: transparent;
        }
        .top-operate{
            display: none;
            position: absolute;
            top: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, .3);
        }
        &:hover{
            .top-operate{
                display: block;
            }
        }
        .use-btn,
        .edit-btn{
            position: absolute;
            top: calc(50% - 20px);
            left: calc(50% - 55px);
            line-height: 39px;
            font-size: 12px;
            .base-icon{
                display: inline-block;
                vertical-align: middle;
                margin-right: 6px;
            }
        }
        .preview-btn{
            position: absolute;
            right: 10px;
            top: 10px;
            width: 36px;
            height: 36px;
            line-height: 36px;
            background: rgba(0, 0, 0, .4);
            border-radius: 5px;
            box-shadow: 0px 8px 20px 0px rgba(82,99,125,0.20); 
            text-align: center;
        }
        &::after{
            content: "";
            display: inline-block;
            vertical-align: middle;
            width: 0;
            height: 100%;
        }
    }
    .card-bottom{
        flex-direction: column;
        height: 100px;
        padding: 0 32px;
        background-color: #ffffff;
        border-bottom-left-radius: 6px;
        border-bottom-right-radius: 6px;
        h2{
            width: 100%;
            align-self: start;
            font-size: 18px;
            font-weight: normal;
            color: #333333;
        }
        p{
            align-self: start;
            margin-top: 10px;
            font-size: 12px;
            color: #999999;
        }
        .name-edit {
            display: flex;
            justify-content: space-between;
            align-items: center;
            width: 100%;
            .card-name {
                width: 100%;
                align-self: start;
                font-size: 18px;
                font-weight: normal;
                color: #333333;
            }
            .iconbianji {
                opacity: 0;
            }
            &:hover {
                .iconbianji {
                    opacity: 1;
                }
            }
        }
        .setting-btn{
            display: none;
        }
        &:hover{
            .setting-btn{
                display: block;
            }
        }
    }
    .batch-check-icon,
    .setting-btn{
        position: absolute;
        bottom: 20px;
        right: 30px;
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
    &:hover,
    &.current{
        box-shadow: 0 6px 10px 0 rgba(82, 99, 125, .2);
    }
    &.batch{
        .top-operate,
        .setting-btn{
            display: none !important;
        }
    }
}
// 文档拖拽
.draggingStyle{
    position: relative;
    .card-top{
        transform: scale(.5);
        border: 2px dashed var(--mainColor);
    }
    .card-top ~ *{
        display: none;
    }
    &.multiple{
        &::before{
            content: "";
            position: absolute;
            top: 15px;
            right: -15px;
            width: 100%;
            height: calc(100% - 100px);
            transform: scale(0.5);
            background: #edeff3;
            border: 2px dashed var(--mainColor);
            border-radius: 6px;
        }
        &::after{
            content: attr(data-count);
            position: absolute;
            top: 36%;
            right: 10%;
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
</style>