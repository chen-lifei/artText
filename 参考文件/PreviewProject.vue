<template>
    <base-modal class="preview-modal" ref="previewModal" :useFixed="false">
        <template v-slot:custom>
            <div class="preview-body flex flex-between">
                <div class="preview-left Soft-UI concave">
                    <!-- 播放器 -->
                    <projectplayer class="player-view" :project="projectInfo.content" :cover="projectInfo.attr.image" :paused="false" v-if="projectInfo"></projectplayer>
                </div>
                <div class="preview-right" >
                    <div class="title-wrap" v-if="projectInfo">
                        <span class="title text-ellipsis" v-if="!titleEdit">{{projectInfo.title}}</span>
                        <base-input v-show="titleEdit" class="input-title" height="40"
                            ref="inputTitle"
                            :showConfirm="true"
                            :value="projectInfo.title"
                            @keyup.enter="$event.target.blur()"
                            @blur="saveProjectTitle"
                            @confirm="saveProjectTitle"
                        ></base-input>
                        <base-icon class="iconwenbenbianjixiugai" :size="24" v-show="!titleEdit" @click="editProjectTitle"></base-icon>
                    </div>
                    <div class="about">
                        <span v-if="projectInfo"><base-icon class="iconbofangcishu" :size="18" v-tooltip.bottom="`播放次数`"></base-icon>{{projectInfo.attr.playCount}}</span>
                        <span v-if="projectInfo"><base-icon class="iconshijian" :size="18" v-tooltip.bottom="`更新时间`"></base-icon>{{modifyDate}}</span>
                    </div>
                    <div>
                        <base-button deep height="48" :round="true" class="primary btn-edit" @click="editProject">编辑视频</base-button>
                        <base-button deep height="48" :round="true" class="primary btn-download" @click="download" v-tooltip.top="`导出`">
                            <base-icon class="iconxiazai" :size="22"></base-icon>
                        </base-button>
                        <base-button deep height="48" :round="true" class="primary btn-download" @click="share" v-tooltip.top="`分享`">
                            <base-icon class="iconfenxiang" :size="22"></base-icon>
                        </base-button>
                    </div>
                </div>
            </div>
        </template>
    </base-modal>
</template> 

<script>
import projectplayer from '@/components/Player.vue'; 
export default {
    name: "previewProject",
    components:{
        projectplayer
    },
    data() {
        return {
            projectInfo: null,
            titleEdit: false, // 编辑标题标识
            blurTitleTimeOut: null,
        };
    },
    computed:{
        modifyDate(){
            let date = util.timeStampDetail(this.projectInfo.modifyDate / 1000);
            return date;
        }
    },
    methods: {
        // 打开预览弹窗
        open(id) {
            this.$refs.previewModal.open();
            this.getProjectDetail(id);
        },

        // 获取模板详情
        getProjectDetail(id){
            let that = this;
            if(!validate(id).int()){
                return console.error('获取工程详情id错误');;
            }
            that.projectInfo = null;
            that.$api.PROJECT_DETAIL({
                data:{
                    id: id
                }
            }).then( res => {
                let project = res.data.content;
                for (let key in project) {
                    try {
                        project[key] = JSON.parse(project[key]);
                    } catch (error) {}
                }
                res.data.content = project;
                that.projectInfo = res.data;
            }).catch( err => {
                return console.error("获取工程详情错误");
            })
        },
        // 点击编辑标题
        editProjectTitle(){
            this.titleEdit = true;
            this.$refs.inputTitle.focus();
        },
        // 提交保存标题
        saveProjectTitle(){
            const that = this;
            let title = that.$refs.inputTitle.getValue();
            if (!title) {
                title = that.projectInfo.title;
            }
            that.$emit("saveProjectTitle", that.projectInfo.id, title);
            that.projectInfo.title = title;
            clearTimeout(that.blurTitleTimeOut);
            that.titleEdit = false;
        },

        // 工程编辑
        editProject(){
            let id = this.projectInfo.id;
            this.commonMixinToEditor({query:{id}});
        },

        // 分享
        share(){
            this.$emit("shareProject",this.projectInfo);
        },

        // 下载
        download(){
            this.$emit("downloadProject",this.projectInfo);
        },
    },
};
</script>

<style lang="less" scoped>
.preview-body {
    width: 90vw;
    height: 646px;
    max-width: 1680px;
    min-width: 1366px;
    padding: 43px 86px 43px 40px;
    background-color: var(--upperColor);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 10px;
    .preview-left {
        width: 67%;
        height: 560px;
        padding: 10px;
        background-color: var(--darkColor);
        border: 1px solid #50566a;
        border-radius: 10px;
        & /deep/ .player-wrap{
            border-radius: 11px;
        }
    }
    .preview-right {
        width: 28%;
        align-self: flex-start;
        .title-wrap {
            position: relative;
            line-height: 44px;
            font-size: 24px;
            .base-icon {
                margin-left: 10px;
                cursor: pointer;
            }
            .title{
                display: inline-block;
                max-width: 60%;
                vertical-align: top;
                white-space: nowrap;
            }
        }
        .input-title {
            & /deep/ input {
                font-size: 14px;
                padding-right: 3.2em!important;
                background-color: var(--upperColor);
            }
            & /deep/ .right-icon{
                font-size: 18px;
                line-height: 48px!important;
            }
        }
        .about {
            margin-top: 17px;
            margin-bottom: 46px;
            font-size: 12px;
            span {
                display: inline-flex;
                align-items: center;
                opacity: 0.5;
            }
            span:nth-child(2) {
                margin-left: 28px;
            }
            .base-icon {
                margin-right: 7px;
            }
        }
        .btn-edit {
            width: 180px;
            margin-right: 20px;
        }
        .btn-download {
            width: 48px;
            padding: 0;
            margin-left: 20px;
        }
    }
}
</style>