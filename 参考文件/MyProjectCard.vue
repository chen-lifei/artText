<template>
    <div class="projects-card">
        <div class="card-options">
            <div class="card-cover-loading"  v-if="!coverLoadState">
                <img src="@/assets/images/loading/loading-2.gif">
            </div>
            <img class="card-cover" @load="coverLoad" v-show="coverLoadState" :src="cover" alt="">
            <div class="card-project-duration">{{ myProjectCardInfo.page.duration }}</div>
            <div class="card-mask" :style="{ opacity: moreOpreate ? 1 : `` }">
                <template v-if="type === 'projects'">
                    <div class="card-mask-operate">
                        <base-icon class="iconbofang" @click="play"></base-icon>
                        <base-icon class="iconxiugai" @click="edit"></base-icon>
                    </div>
                    <div class="card-mask-option">
                        <base-icon class="iconfenxiang" v-if="myProjectCardInfo.projectShare" v-tooltip.top="`分享`" @click="share"></base-icon>
                        <base-icon class="iconxiazai" v-tooltip.top="`导出`" @click="download"></base-icon>
                        <base-icon class="icongengduocaozuo" v-tooltip.top="`更多`" @click="more(true)"></base-icon>
                    </div>
                </template>
                <template v-else>
                    <div class="card-mask-option flex flex-between">
                        <base-icon class="iconhuifuyuanwei" v-tooltip.top="`恢复`" @click="recoverProject"></base-icon>
                        <base-icon class="iconshanchu" v-tooltip.top="`彻底删除`" @click="deleteProject"></base-icon>
                    </div>
                </template>
            </div>
        </div>
        <div class="card-desc flex flex-between">
            <span class="card-desc-title text-ellipsis">{{ myProjectCardInfo.title }}</span>
            <div class="card-desc-right" v-if="type === 'projects'">
                <base-icon class="iconbofangcishu" size="18" v-tooltip.top="`播放次数`"></base-icon>
                <span>{{ myProjectCardInfo.attr.playCount }}</span>
                <base-icon class="iconshijian" size="17" v-tooltip.top="`更新时间`"></base-icon>
                <span>{{ modifyDate }}</span>
            </div>
        </div>
        
        <!-- 更多模块 -->
        <base-dropdown class="card-more" @close="more(false)" :show="myProjectCardInfo.check">
            <ul class="more-wrap">
                <li class="flex flex-between" :class="{'active': moreOpreate === 'rename'}" @click="renameProject">
                    <span>重命名</span>
                    <base-icon class="iconzhengquedagou" v-show="moreOpreate === 'rename'"></base-icon>
                </li>
                <li class="flex flex-between" :class="{'active': moreOpreate === 'cover'}" @click="changeCover">
                    <span>更换封面</span>
                    <base-icon class="iconzhengquedagou" v-show="moreOpreate === 'cover'"></base-icon>
                </li>
                <li class="flex flex-between" :class="{'active': moreOpreate === 'copy'}" @click="copyProject">
                    <span>复制</span>
                    <base-icon class="iconzhengquedagou" v-show="moreOpreate === 'copy'"></base-icon>
                </li>
                <li class="flex flex-between" :class="{'active': moreOpreate === 'move'}" @click="moveProject">
                    <span>移至回收站</span>
                    <base-icon class="iconzhengquedagou" v-show="moreOpreate === 'move'"></base-icon>
                </li>
            </ul>
        </base-dropdown>
        
        <!-- 重命名弹窗 -->
        <base-dropdown class="project-rename-dropdown" ref="renameDropdown" @close="moreOpreate = ``">
            <div class="rename-wrap">
                <base-input class="rename-input" 
                    ref="inputTitle" 
                    placeholder="请输入名称" 
                    :value="myProjectCardInfo.title" 
                    @keydown.enter="saveProjectTitle"
                >
                </base-input>
                <base-button class="UI-active-primary" deep :height="32" @click="canleProjectRename">取消</base-button>
                <base-button class="UI-active-primary" deep :height="32" @click="saveProjectTitle">确认</base-button>
            </div>
        </base-dropdown>    
    </div>
</template>

<script>
/**
 * 我的视频卡片组件
 * @prop myProjectCardInfo{}          视频卡片信息
 * @prop type[String]                 我的工程/回收站
 */
export default {
    name: "myProjectCard",
    props:{
        myProjectCardInfo: Object,
        type: {
            type: String,
            default: 'projects'
        },
    },
    data(){
        return {
            moreOpreate: '',    // 更多操作名称
            coverLoadState: false, // 封面加载状态
        }
    },
    computed:{
        modifyDate(){
            let date = util.timeStampDetail(this.myProjectCardInfo.modifyDate / 1000);
            return date;
        },
        cover() {
            let image = this.myProjectCardInfo.attr.image;
            /*if (!image) { this.coverReload() };*/
            return image;
        },
    },
    mounted(){},
    methods:{
        coverReload() {
            this.commonMixinGetProjectCover(this.myProjectCardInfo.id, (cover) => {
                this.myProjectCardInfo.attr.image = cover;
            });
        },
        // 打开分享弹窗
        share(){
            let project = this.myProjectCardInfo;
            if (!project.projectShare) {
                return;
            } else if (!project.projectShare.isNew) {
                this.$modal({
                    modalId: 'updateExportModal',
                    title: '',
                    confirmText: `是的`,
                    cancelText: `不需要`,
                    content: `<img class="cancel-img" src="${require('@/assets/images/alert.png')}"><p>视频工程已更新，是否同步</p>`,
                    cancel: () => {
                        close();
                        this.$emit("shareProject",project);
                    },
                    confirm: (data, close) => {
                        close();
                        this.$emit("downloadProject",this.myProjectCardInfo);
                    },
                })
            } else {
                this.$emit("shareProject",project);
            }
        },

        // 打开下载弹窗
        download(){
            this.$emit("downloadProject",this.myProjectCardInfo);
        },

        // 更多模块
        more(bool){
            this.$set(this.myProjectCardInfo, 'check', bool);
            this.moreOpreate = bool ? `more` : '';
        },

        // 重命名 - 点击
        renameProject(){
            this.moreOpreate = "rename";
            this.$refs.renameDropdown.open();
            this.$nextTick(() => {
                this.$refs.inputTitle.focus();
            });
            this.$set(this.myProjectCardInfo, 'check', false);
        },
        // 取消修改标题
        canleProjectRename(){
            this.$refs.renameDropdown.close();
        },
        // 修改标题
        saveProjectTitle(){
            let that = this;
            let title = that.$refs.inputTitle.getValue();
            if (validate(title).empty()) {
                return that.$toast(`标题不能为空`);
            }
            if (validate(title).illegal() || validate(title).special()) {
                return that.$toast(`标题存在非法字符，请重新输入`);
            }
            if (!validate(title).rangelength(60)) {
                return that.$toast(`标题最大可输入60字`);
            }
            this.moreOpreate = "";
            this.$emit("saveProjectTitle",that.myProjectCardInfo.id,title);
            this.$refs.renameDropdown.close();
        },
        // 封面加载
        coverLoad(image){
            this.coverLoadState = true;
        },
        // 更换封面 - 点击
        changeCover(){
            this.moreOpreate = "cover";
            this.$set(this.myProjectCardInfo, 'check', false);
            this.$emit("changeCover",this.myProjectCardInfo);
        },

        // 复制工程 - 点击
        copyProject(){
            this.moreOpreate = "copy";
            this.$set(this.myProjectCardInfo, 'check', false);
            this.$emit("copyProject",this.myProjectCardInfo);
        },

        // 移至回收站 - 点击
        moveProject(){
            this.moreOpreate = "move";
            this.$emit("moveProject",this.myProjectCardInfo.id);
        },

        // 预览工程
        play(){
            this.$emit("playProject",this.myProjectCardInfo);
        },

        // 编辑工程
        edit(){
            this.$emit("editProject",this.myProjectCardInfo.id);
        },

        // 恢复工程
        recoverProject(){
            this.$emit("recoverProject",this.myProjectCardInfo.id);
        },
        // 彻底删除工程
        deleteProject(){
            let that = this;
            that.$modal({
                modalId: 'deleteProjectModal',
                title: '',
                showClose: false,
                content: `删除工程文件后，将无法恢复，确定删除？</p>`,
                confirm: (data, close) => {
                    that.$emit("deleteProject",this.myProjectCardInfo.id);
                    close();
                }
            })
        }
    }
};
</script>
<style lang="less">
#deleteProjectModal{
    .modal-content{
        text-align: center;
        opacity: 0.98;
        .modal-footer{
            .base-button{
                width: 80px;
                height: 32px!important;
                border-radius: 18px!important;
                font-size: 12px;
                padding: 0;
            }
            .base-button:first-child{
                background-color: var(--upperColor);
            }
        }
    }
}
</style>
<style lang="less" scoped>
.projects-card{
    position: relative;
    width: 100%;
    height: 100%;
    background-color: var(--upperColor);
    border-radius: 10px;
    overflow: hidden;
    .card-options {
        display: block;
        position: relative;
        height: calc(100% - 54px);
        color: #ffffff;
        .card-cover-loading{
            position: absolute;
            top: 5px;
            left: 5px;
            display: flex;
            flex-direction: column;
            align-items: center;
            img {
                margin-bottom: 10px;
                width: 50px;
                height: auto;
            }
        }
        .card-cover {
            display: block;
            width: 100%;
            height: 100%;
            object-fit: cover;
            &[src=""] {
                display: none;
            }
        }
        .card-project-duration {
            position: absolute;
            bottom: 10px;
            right: 10px;
            height: 25px;
            line-height: 25px;
            padding: 0 10px;
            z-index: 1;
            background-color: rgba(0, 0, 0, 0.4);
            border-radius: 5px;
            text-align: center;
        }
        .card-mask {
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background-color: rgba(0, 0, 0, 0.4);
            opacity: 0;
            transition: all 0.3s;
            &:hover {
                opacity: 1;
            }
            .card-mask-operate {
                position: absolute;
                top: 50%;
                left: 0;
                margin-top: -26px;
                width: 100%;
                height: 52px;
                text-align: center;
                .base-icon {
                    vertical-align: top;
                    width: 52px;
                    line-height: 52px;
                    background-color: var(--mainColor);
                    border-radius: 50%;
                    font-size: 24px;
                    cursor: pointer;
                    & + .base-icon {
                        margin-left: 30px;
                    }
                }
            }
            .card-mask-option {
                position: absolute;
                top: 10px;
                left: 10px;
                right: 10px;
                text-align: right;
                .base-icon {
                    vertical-align: top;
                    width: 30px;
                    height: 30px;
                    line-height: 30px;
                    background: rgba(0, 0, 0, 0.4);
                    border-radius: 6px;
                    text-align: center;
                    font-size: 18px;
                    cursor: pointer;
                    & + .base-icon {
                        margin-left: 10px;
                    }
                }
            }
        }
    }
    .card-desc {
        height: 54px;
        padding: 0 20px;
        .card-desc-title {
            max-width: 50%;
        }
        .card-desc-right {
            opacity: 0.5;
            font-size: 12px;
            span,
            .base-icon {
                display: inline-block;
                vertical-align: middle;
            }
            .base-icon + span {
                margin-left: 6px;
            }
            span + .base-icon {
                margin-left: 20px;
            }
        }
    }
}


.card-more {
    top: 46px;
    left: auto;
    right: 10px;
    width: 184px;
    max-height: 200px;
    background-color: var(--upperColor);
    border-radius: 5px;
    .more-wrap{
        padding: 6px 10px 20px 24px;
        opacity: 0.98;
        li{
            padding-top: 14px;
            cursor: pointer;
            &:hover{
                color: var(--mainColor);
            }
        }
        .active{
            color: var(--mainColor);
        }
    }
}
.project-rename-dropdown{
    top: 46px;
    left: auto;
    right: 10px;
    width: 240px;
    height: 128px;
    background-color: var(--upperColor);
    border-radius: 5px;
    .rename-wrap{
        padding: 20px;
        font-size: 12px;
        opacity: 0.98;
        .rename-input{
            width: 100%;
            margin-bottom: 20px;
            & /deep/ input{
               background-color: var(--upperColor); 
            }
        }
        .base-button{
            width: 80px;
            border-radius: 18px;
            margin-right: 20px;
            background-color: var(--upperColor);
            &:last-child{
                margin-right: 0;
            }
        }
    }
}
</style>
<style lang="less">
#updateExportModal{
    .modal-backdrop {
        background: rgba(0,0,0,0.60);
        backdrop-filter: blur(10px);
    }
    .modal-content{
        width: 320px;
        height: 180px;
        opacity: 1;
        background: #000000;
        border-radius: 10px;
        .modal-header {
            display: none;
        }
        .modal-body {
            padding: 40px 40px 38px 40px;
        }
        .modal-close {
            position: absolute;
            right: -34px;
            top: 0;
            width: 24px;
            height: 24px;
            line-height: 24px;
            padding: 0;
            border-radius: 50%;
            background: rgba(255,255,255,0.70);
            text-align: center;
            color: #5f6063;
            cursor: pointer;
        }
        img {
            width: 28px;
            height: 28px;
        }
        p {
            display: inline-block;
            vertical-align: middle;
            margin-left: 14px;
        }
        .base-button:first-child {
            width: 88px;
            height: 44px;
            padding: 0;
            background: #303135;
            border-radius: 22px;
            color: var(--dimColor);
            box-shadow: none;
            border: none;
        }
        .base-button:last-child {
            background: var(--mainColor);
        }
    }
}
</style>