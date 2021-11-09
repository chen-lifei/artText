<template>
    <div class="projects-view">
        <!-- 公共头部 -->
        <common-head :isSearch="true" @loginSuccess="changePanel('workbench')"></common-head>
        <div class="projects-container flex flex-between">
            <div class="projects-left">
                <base-button class="primary" width="260" height="60" :round="true" @click="createProjectModal">新建工程</base-button> 
                <ul class="projects-list">
                    <li class="Soft-UI" :class="currentPanel === 'workbench' ? 'concave': 'flat'"  @click="changePanel('workbench')">
                        <base-icon class="icongongzuo" :size="20"></base-icon>
                        <span class="gzt">工作台</span>
                    </li>
                    <li class="Soft-UI" :class="currentPanel === 'favorite' ? 'concave': 'flat'"  @click="changePanel('favorite')" >
                        <base-icon class="iconshoucangtianchong" :size="20"></base-icon>
                        <span>我的收藏</span>
                    </li>
                    <li class="Soft-UI" :class="currentPanel === 'recyclebin' ? 'concave': 'flat'"  @click="changePanel('recyclebin')" >
                        <base-icon class="icondelete" :size="20"></base-icon>
                        <span class="gzt">回收站</span>
                    </li>
                </ul>
                <!-- 用户信息 -->
                <div class="projects-user" v-show="false">
                    <div class="flex flex-between user-item">
                        <div class="item-left flex"><base-icon class="iconputonghuiyuan2" :size="18"></base-icon><span>基础用户</span></div>
                        <base-button height="24" class="concave">去升级</base-button>
                    </div>
                    <base-slider :showDot="false" :enableDrag="false" :progress="[50]" class="user-progress"></base-slider>
                    <div class="flex flex-between user-space">
                        <span>存储空间</span>
                        <span>736M/5G</span>
                    </div>
                    <div class="flex flex-between user-space">
                        <span>视频数量</span>
                        <span>3/5</span>
                    </div>
                </div>
            </div>
            <div class="projects-right Soft-UI concave" deep ref="projectRight" @scroll="listenProjectScroll">
                <template v-if="currentPanel === 'workbench'">
                    <div class="projects-template Soft-line line-row">
                        <div class="flex flex-between">
                            <div class="label-wrap">
                                <base-button height="32" :round="true" 
                                    :plain="categoryCode !== 'all'" 
                                    :class="{'primary': categoryCode === 'all','btn-dark': pageTheme === 'dark' }"
                                    @click="selectAll"
                                >为你推荐
                                </base-button>
                                <base-button v-for="(item,index) in categoryList" :key="index" height="32" :round="true" 
                                    :plain="item.code !== categoryCode" :class="{'primary': categoryCode === item.code,'btn-dark': pageTheme === 'dark'}"
                                    @click="selectCategory(item)"
                                >{{item.name}}
                                </base-button>
                            </div>
                            <p class="all Soft-UI flat" @click="toTemplate">
                                <span>全部</span><base-icon class="iconfangxiangjiantou" :size="12"></base-icon>
                            </p>
                        </div>
                        <!-- 模板 -->
                        <card-swiper class="template-box" ref="template_swiper" shadow>
                            <template v-slot:cards>
                                <template-card v-for="(item,index) in templateList" :key="index" 
                                    :templateCardInfo="item" 
                                    :favoriteList="favoriteList"
                                    @previewTemplate="previewTemplate"
                                    @favoriteAdd="favoriteAdd"
                                    @favoriteRemove="favoriteRemove"
                                ></template-card>
                            </template>
                        </card-swiper>
                        <!-- <div class="template-wrap">
                            <div class="template-box flex" :style="{right:rollingLength+'px',width:426*templateList.length+'px'}" :class="{'title-dark': pageTheme === 'dark'}" >
                            </div>
                        </div>
                        <template v-if="templateList.length > 3">
                            <base-icon class="iconfangxiangjiantou arrow left" :size="20" v-show="rollingLength !== 0" @click="templateScroll('prev')"></base-icon>
                            <base-icon class="iconfangxiangjiantou arrow right" :size="20" @click="templateScroll('next')"></base-icon>
                        </template> -->
                    </div>
                    <div class="my-projects" :class="{fixed: scrollToProject}">
                        <div class="nav-box flex flex-between" :deep="scrollToProject" :class="{'Soft-UI': scrollToProject, 'concave': scrollToProject}">
                            <div class="tab-box">
                                <base-button height="32" :round="true" 
                                    :plain="tab !== 'myProjects'" 
                                    :class="{'primary': tab === 'myProjects'}"
                                    @click="toMyprojects"
                                >我的视频
                                </base-button>
                            </div>
                            <base-select :option="optionSorts" :selected="optionSorts[0].name" @select="sortProject" deep></base-select>
                        </div>
                        <!-- 我的视频 -->
                        <div class="my-projects-wrap">
                            <!-- 空工程 -->
                            <template v-if="myProjectsList.length === 0">
                                <div class="empty-wraper">
                                    <div class="empty-box flex">
                                        <base-icon class="iconpianduantianjia" :size="18" @click="createProjectModal()"></base-icon>
                                        <span>创建我的空白视频</span>
                                    </div>
                                </div>
                            </template>
                            <template v-else>
                                <base-list :list="myProjectsList" type="fixed" scroll=".projects-right"
                                    :cardWidth="350"
                                    :cardHeight="250"
                                    cardOffsetX="30"
                                    cardOffsetY="30"
                                    :hideScrollbar="true"
                                >
                                    <template v-slot="myProject">
                                        <my-project-card :myProjectCardInfo="myProject.item"
                                            @downloadProject="downloadProject"
                                            @shareProject="shareProject"
                                            @changeCover="changeCover"
                                            @saveProjectTitle="saveProjectTitle"
                                            @copyProject="copyProject"
                                            @moveProject="moveProject"
                                            @playProject="playProject"
                                            @editProject="editProject"
                                        >
                                        </my-project-card>
                                    </template>
                                </base-list>
                            </template>
                        </div>
                    </div>
                </template>
                <template v-else-if="currentPanel === 'favorite'">
                    <div class="favorite-wrap">
                        <h4 class="favorite-txt">我的收藏</h4>
                        <div class="img-box" v-if="isLoading">
                            <img src="@/assets/images/loading/loading-2.gif" alt="">
                        </div>
                        <template v-else-if="favoriteIdsList.length === 0">
                            <div class="favorite-empty">
                                <img src="@/assets/images/empty-1.png" alt="">
                                <p class="empty-l">你的收藏夹空空哟，可以到模板中心逛逛</p>
                                <base-button class="btn-tem primary" :round="true" @click="toTemplate">到模板中心逛逛</base-button>
                            </div>
                        </template>
                        <template v-else>
                            <div class="favorite-list">
                                <base-list v-if="currentPanel === 'favorite'" type="contourWaterfall" scroll=".favorite-list"
                                    cardOffsetY="46"
                                    cardOffsetX="20"
                                    :cardHeight="260"
                                    :list="favoriteIdsList"
                                    :hideScrollbar="true" 
                                >
                                    <template v-slot="favorite">
                                        <template-card 
                                            :templateCardInfo="favorite.item" 
                                            :favoriteList="favoriteList"
                                            @favoriteAdd="favoriteAdd"
                                            @favoriteRemove="favoriteRemove"
                                            @previewTemplate="previewTemplate"
                                        >
                                        </template-card>
                                    </template>
                                </base-list>
                            </div>
                        </template>
                    </div>
                </template>
                <template v-else-if="currentPanel === 'recyclebin'">
                    <div class="favorite-wrap recycle-wrap">
                        <div class="flex flex-between rec-top">
                            <h4 class="favorite-txt">回收站</h4>
                        </div>
                        <div class="img-box" v-if="isLoading">
                            <img src="@/assets/images/loading/loading-2.gif" alt="">
                        </div>
                        <template v-else-if="recyclebinList.length === 0">
                            <div class="favorite-empty">
                                <img src="@/assets/images/empty-1.png" alt="">
                                <p class="empty-s">您的回收站为空噢～</p>
                                <p class="empty-l">回收站为你保存10天内删除的文件</p>
                                <!-- <base-button class="btn-tem primary" :round="true">升级会员</base-button> -->
                            </div>
                        </template>
                        <template v-else>
                            <div class="recyclebin-list">
                                <base-list v-if="currentPanel === 'recyclebin'" :list="recyclebinList" type="fixed" scroll=".recyclebin-list"
                                    :cardWidth="350" :cardHeight="250"
                                    cardOffsetX="30" cardOffsetY="30"
                                    :hideScrollbar="true"
                                >
                                    <template v-slot="recyclebin">
                                        <my-project-card :myProjectCardInfo="recyclebin.item" type="recyclebin"
                                            @recoverProject="recoverProject"
                                            @deleteProject="deleteProject"
                                        >
                                        </my-project-card>
                                    </template>
                                </base-list>
                            </div>
                        </template>
                    </div>
                </template>
            </div>
        </div>

        <!-- 工程预览弹窗 -->
        <preview-project ref="previewProjectModal"
            @saveProjectTitle="saveProjectTitle"
            @shareProject="shareProject"
            @downloadProject="downloadProject"
        ></preview-project>

        <!-- 模板预览弹窗 -->
        <preview-template ref="previewTemplateModal"
            :favoriteList="favoriteList"
            @shareProject="shareProject"
            @favoriteAdd="favoriteAdd"
            @favoriteRemove="favoriteRemove"
        ></preview-template>

        <!-- 分享弹框 -->
        <base-modal class="share-modal" ref="shareModal" :showClose="false">
            <template v-slot:custom>
                <share-card ref="shareCard" :modal="true" :shareType="shareType" @success="saveShareInfo" @close="$refs.shareModal.close"></share-card>
            </template>
        </base-modal>

        <!-- 下载弹窗 -->
        <export ref="exportModal" :projectInfo="currentProjectInfo" ></export>

        <!-- 更换工程视频封面弹窗 -->
        <updatecover ref="updateCover" @success="changeCoverSuccess"></updatecover>

        <!-- 右下角交流反馈和邀请好友 -->
        <feedback-invite ref="feedback" :getWorkorderUnread="true"></feedback-invite>
    </div>
</template>

<script>
/**
 * 创作者中心页面组件
 */
import commonHead from "@/components/CommonHead.vue";
import createProjectModal from "@/components/createProject/createProject.js";
import templateCard from "@/views/TemplateView/TemplateCard.vue";
import previewTemplate from '@/views/TemplateView/PreviewTemplate.vue';
import myProjectCard from '@/views/ProjectsView/MyProjectCard.vue';
import previewProject from '@/views/ProjectsView/PreviewProject.vue';
import shareCard from '@/components/ShareCard.vue';
import Export from '@/components/Export.vue';
import updatecover from '@/components/updateCover.vue';
import CardSwiper from '../components/CardSwiper.vue';
import feedbackInvite from '@/components/FeedbackInvite.vue';
import projectMixin from '@/assets/js/project/project.js';

export default {
    name: "Projects",
    mixins: [projectMixin],
    components:{
        commonHead,
        templateCard,
        previewTemplate,
        myProjectCard,
        previewProject,
        shareCard,
        Export,
        updatecover,
        CardSwiper,
        feedbackInvite,
    },
    data(){
        return {
            optionSorts:[
                {name:"按修改时间",value:"modifyDate"},
                {name:"按创建时间",value:"createDate"},
                {name:"按首字母",value:"firstNitial"},
            ],
            currentPanel:"workbench",       // 当前显示面板，工作台，收藏，回收站
            scrollToProject: false,         // 滚动到工程区域
            myProjectsList:[],              // 我的视频列表
            currentProjectInfo: {
                "visitPwd": null,
                "modifyDate": null,
                "id": null,
                "page": {
                    "width": null,
                    "height": null,
                    "duration": null,
                    "bg": null,
                    "border": null,
                    "watermark": null,
                    "speed": null,
                    "volume": null,
                    "muted": null
                },
                "title": null,
                "attr": {
                    "image": null,
                    "urlExpireDate": null,
                    "urlExpireType": null,
                    "urlPlayTime": null,
                    "editCount": null
                },
                "url": 'null',
                "visitType": null,
                "createDate": null
            },                              // 当前选中的视频信息
            tab: 'myProjects',              // 我的视频，数据统计

            categoryList: [],               // 分类列表
            categoryCode: 'all',            // 分类编码
            templateList: [],               // 模板列表
            currentTemplate:{},             // 选中的模板
            favoriteList: {},               // 收藏模板列表
            favoriteIdsList: [],            // 模板收藏列表模板id
            recyclebinList: [],             // 回收站列表
            shareType:'',                   // 分享面板类型，template-模板，project-工程

            isLoading: true,
        }
    },
    mounted(){
        let that = this;
        let user = that.userInfo;
        if(user.login){
            that.getProjectList('true');
        }else{
            that.$login({
                success: ()=>{
                    that.getProjectList('true');
                }
            });
        }
        that.getTemplateList();
        that.getCategoryList(1);
    },
    methods:{
        createProjectModal,
        // 切换工作台，收藏，回收站
        changePanel(type){
            switch (type) {
                case "workbench":
                    this.currentPanel = "workbench";
                    this.getProjectList('true');
                    break;
                case "favorite":
                    this.currentPanel = "favorite";
                    this.getFavoriteList();
                    break;
                case "recyclebin":
                    this.currentPanel = "recyclebin";
                    this.getProjectList('false');
                    break;
                default:
                    break;
            }
        },
        /**
         * 模板列表相关
        */
        // 获取模板列表 - 通过分类名称
        getTemplateList(category){
            let that = this;
            let categoryCode = category ? category : "";
            // 请求接口
            that.$api.TEMPLATE_LIST({ 
                data:{ 
                    categoryCode: categoryCode,
                },
                success : data => {
                    let res = data.data.content;
                    that.favoriteList = data.data.favorites;
                    if(res.length === 0){
                        that.templateList = [];
                    }else{
                        res.forEach(item => {
                            let duration = util.timeStampTransform(item.duration);
                            item.duration = duration;
                        });
                        that.templateList = res;
                    }
                },
                fail: err => {
                    return console.error("创作者中心-请求模板列表数据失败");
                }
            });
        },
        // 获取分类列表
        getCategoryList(opt){
            let that = this;
            if(!validate(opt).int()){
                return console.error("获取分类列表参数grade错误");
            }
            that.$api.CATEGORY_LIST({ 
                data: {
                    type: 'template',
                    grade: opt,
                }
            }).then( res => {
                let data = res.data[0].childrenList;
                that.categoryList = data;
            }).catch( err => {
                return console.error("创作者中心-获取分类列表失败");
            })
        },

        // 获取收藏的模板列表
        getFavoriteList(){
            let that = this;
            that.isLoading = true;
            that.$api.FAVORITE_LIST({
                data: {
                    favoriteTypes: 'template',
                }
            }).then( res => {
                res.data.forEach(item => {
                    let duration = util.timeStampTransform(item.duration);
                    item.duration = duration;
                });
                setTimeout(()=>{
                    that.isLoading = false;
                },200);
                that.favoriteIdsList = res.data;
            }).catch( err => {
                return console.error("创作者中心-获取收藏列表失败");
            })
        },

        // 选择分类 
        selectCategory(item){
            let that = this;
            that.categoryCode = item.code;
            // 获取分类列表
            that.getTemplateList(that.categoryCode);
        },

        // 点击分类 - 为你推荐
        selectAll(){
            let that = this;
            that.categoryCode = "all";
            that.getTemplateList();
        },

        // 添加收藏
        favoriteAdd(id){
            let that = this;
            if(!id){
                that.$toast("添加收藏失败",800);
                return console.error("创作者中心-模板列表-添加收藏id错误");
            }
            that.$api.FAVORITE_ADD({
                data: {
                    type: "template",
                    relationId: id
                }
            }).then(res => {
                that.$toast('添加收藏成功', 800);
                that.$set(that.favoriteList, id, res.data.favoriteId);
            }).catch(err => {
                that.$toast('添加收藏失败', 800);
            })
        },
        // 移除收藏
        favoriteRemove(id){
            let that = this;
            if(!id){
                that.$toast("移除收藏失败",800);
                return console.error("创作者中心-模板列表-移除收藏id错误");
            }
            that.$api.FAVORITE_REMOVE({
                data: {
                    ids: that.favoriteList[id]
                }
            }).then(res => {
                that.$toast('取消收藏成功', 800);
                that.favoriteIdsList = that.favoriteIdsList.filter(item => {
                    return item.favoriteId !== that.favoriteList[id];
                });
                that.$set(that.favoriteList, id, false);
            }).catch(err => {
                that.$toast('取消收藏失败', 800);
            })
        },

        // 模板预览
        previewTemplate(id){
            this.$refs.previewTemplateModal.open(id);
        },

        /**
         * 我的视频（工程）相关
        */
        // 获取工程列表 - isShow - false回收站
        getProjectList(show){
            let that = this;
            that.isLoading = true;
            that.$api.PROJECT_LIST({
                data:{
                    isShow: show
                }
            }).then( res => {
                let data =  res.data;
                data = data.sort(function(a,b){
                    return b.modifyDate - a.modifyDate;
                });
                data.forEach((item,index) => {
                    let duration = util.timeStampTransform(item.page.duration);
                    item.check = false;
                    item.page.duration = duration;
                });
                if(show === 'true'){
                    that.myProjectsList = data;
                }else{
                    setTimeout(()=>{
                        that.isLoading = false;
                    },200)
                    that.recyclebinList = data;
                }

            }).catch( err => {
                return console.error(err);
            })
        },

        // 筛选我的视频列表
        sortProject(e){
            let that = this,
                sort = e.value,
                data = that.myProjectsList;
            switch (sort) {
                case "modifyDate":
                    data = data.sort(function(a,b){
                        return b.modifyDate - a.modifyDate;
                    });
                    break;
                case "createDate":
                    data = data.sort(function(a,b){
                        return b.createDate - a.createDate;
                    });
                    break;
                case "firstNitial":
                    data = data.sort(function(a,b){
                        return a.title.localeCompare(b.title);
                    });
                    break;
                default:
                    break;
            }
            that.myProjectsList = data;
            $('.my-projects-wrap').stop().animate({ scrollTop: 0}, 0);
        },

        // 分享工程 - 工程/模板分享
        shareProject(item) {
            this.shareType = item.visitType ? `project` : `template`;
            this.$refs.shareModal.open();
            this.$nextTick(() => {
                this.$refs.shareCard.setProject(item);
            })
        },
        // 保存设置的分享信息
        saveShareInfo(data){
            if (this.shareType !== `project`) return;
            this.myProjectsList.forEach(item => {
                if (item.id === data.id) {
                    if (data.visitType) item.visitType = data.visitType;
                    if (data.visitPwd) item.visitPwd = data.visitPwd;
                    if (data.attr && data.attr.urlExpireDate) item.attr.urlExpireDate = data.attr.urlExpireDate;
                }
            })
        },

        // 下载工程
        downloadProject(item){
            let that = this;
            that.currentProjectInfo = item;
            that.$nextTick( ()=>{
                that.$refs.exportModal.open();
            });
        },

        // 修改工程标题
        saveProjectTitle(id,title){
            let that = this;
            that.$api.PROJECT_RENAME({
                data:{
                    id: id,
                    title: title
                }
            }).then( res => {
                that.myProjectsList.forEach(item => {
                    if(item.id === id){
                        item.title = title;
                    }
                });
            }).catch( err => {
                return console.error("修改工程标题错误");
            })
        },
        // 更换工程封面
        changeCover(item){
            let that = this;
            that.currentProjectInfo = item;
            that.$refs.updateCover.open(item.id, item.attr.image);
        },
        changeCoverSuccess(src) {
            this.currentProjectInfo.attr.image = src;
        },

        // 复制工程
        copyProject(item){
            let that = this,
                id = item.id,
                title = item.title;
            if(!validate(id).int()){
                return console.error("复制工程标题参数id错误");
            }
            that.$api.PROJECT_COPY({
                data:{
                    id: id,
                    title: `${title}[副本]`
                }
            }).then( res => {
                that.$toast("复制成功",800);
                res.data.check = false;
                res.data.page = item.page;
                that.myProjectsList.unshift(res.data);
            }).catch( err => {
                that.$toast("复制失败",800);
                return console.error("工程复制错误");
            })
        },

        // 工程移至回收站
        moveProject(id){
            let that = this;
            if(!validate(id).int()){
                return console.error("移至回收站工程标题参数id错误");
            }
            that.$api.PROJECT_TEM_DEL({
                data:{
                    "ids": id
                }
            }).then( res => {
                that.$toast("工程已移至回收站",800);
                that.myProjectsList = that.myProjectsList.filter( item => !item.check);
            }).catch( err => {
                return console.error("工程移至回收站错误");
            })
        },

        // 工程预览
        playProject(item){
            let that = this;
            that.$refs.previewProjectModal.open(item.id);
        },

        // 工程编辑
        editProject(id){
            this.commonMixinToEditor({query: {id}});
        },

        // 跳转我的视频
        toMyprojects(){
            this.tab = "myProjects";
        },

        // 数据统计跳转
        toStatistics(){
            this.tab = "Statistics";
        },

        // 模板列表 - 点击全部 - 跳转模板中心
        toTemplate(){
            this.commonMixinToTemplate();
        },


        /**
         * 回收站相关
        */
        // 恢复工程
        recoverProject(id){
            let that = this;
            that.$api.PROJECT_RECOVER({ 
                data: {
                    ids: id
                }
            }).then( res => {
                that.$toast("恢复成功",800);
                that.recyclebinList = that.recyclebinList.filter( item => item.id !== id);
            }).catch( err => {
                that.$toast("恢复失败",800);
            })
        },
        // 删除工程
        deleteProject(id){
            let that = this;
            that.$api.PROJECT_DELETE({ 
                data: {
                    ids: id
                }
            }).then( res => {
                that.$toast("删除成功",800);
                that.recyclebinList = that.recyclebinList.filter( item => item.id !== id);
            }).catch( err => {
                that.$toast("删除失败",800);
            })
        },

        listenProjectScroll(e) {
            this.scrollToProject = this.$refs.projectRight.scrollTop >= 400;
        }
        
    }
};
</script>

<style lang="less" scoped>
.projects-view{
    position: relative;
    width: 100%;
    height: 100%;
    overflow: hidden;
    background-color: var(--backColor);
}
.projects-container{
    width: 100%;
    height: calc(100% - 70px);
}
.projects-left{
    position: relative;
    width: 320px;
    height: 100%;
    padding: 40px 30px 27px;
    .left-select{
        width: 260px;
        & /deep/ .toggle-btn{
            width: 48px!important;
            height: 48px!important;
            border-radius: 48px!important;
            top: 5px;
            right: 6px;
            .base-icon{
                font-size: 18px;
            }
        }
    }
    .projects-list{
        margin-top: 30px;
        li{
            width: 260px;
            height: 48px;
            line-height: 48px;
            margin-top: 10px;
            border-radius: 24px;
            cursor: pointer;
            .base-icon{
                margin-left: 20px;
            }
            span{
                margin-left: 10px;
            }
            .gzt{
                vertical-align: top;
                line-height: 51px;
            }
        }
        li.concave{
            color: var(--mainColor);
        }
    }
    .projects-user{
        position: absolute;
        bottom: 27px;
        font-size: 12px;
        .user-item{
            .item-left{
                span{
                    margin-left: 4px;
                }
            }
            .base-button{
                width: 56px;
                font-size: 12px;
                border-radius: 16px;
            }
        }
        .user-progress{
            width: 260px;
            padding: 0;
            margin: 15px 0;
        }
        .user-space{
            margin-top: 6px;
            color: var(--dimColor);
        }
    }
}
.projects-right{
    width: calc(100% - 320px);
    height: 100%;
    padding: 40px 50px 0 60px;
    border-top-left-radius: 20px;
    overflow-y: auto;
    .projects-template{
        font-size: 14px;
        .label-wrap{
            .base-button{
                width: 80px;
                margin-right: 14px;
                padding: 0;
            }
            .base-button.plain{
                color: var(--textColor);
                border: none;
                &:hover{
                    color: var(--mainColor);
                }
                &.btn-dark{
                    color: var(--dimColor);
                    &:hover{
                        color: var(--mainColor);
                    }
                }
            }
        }
        .all{
            padding: 5px 18px;
            height: 32px;
            border-radius: 32px;
            color: var(--dimColor);
            background-color: transparent;
            cursor: pointer;
            .base-icon{
                margin-left: 6px;
                transform: rotate(270deg);
            }
        }
        .template-box{
            position: relative;
            justify-content: flex-start;
            width: 100%;
            height: 320px;
            padding: 20px 0;
            transition: all .3s;
            & /deep/ .template-card{
                width: calc(250px * 16 / 9);
                height: 280px;
                margin-right: 14px;
                flex-shrink: 0;
                max-width: 426px;
                .image-wrap{
                    display: flex;
                    height: calc(100% - 30px);
                    background: #000000;
                    img{
                        margin: auto;
                        width: auto;
                        height: 100%;
                        object-fit: cover;
                    }
                }
                .title{
                    width: 60%;
                    margin-left: 0px;
                    font-size: 14px;
                    color: var(--textColor);
                    overflow: hidden;
                    text-overflow: ellipsis;
                    white-space: nowrap;
                }
                .time{
                    bottom: 50px;
                }
            }
        }
    }
    .split-line{
        margin: 60px 0;
    }
    .my-projects{
        margin-top: 40px;
        .nav-box{
            .tab-box{
                .base-button{
                    width: 80px;
                    font-size: 14px;
                    padding: 0;
                    &.plain{
                        color: var(--dimColor);
                        border: none;
                    }
                }
            }
            .base-select{
                width: 140px;
                font-size: 12px;
                & /deep/ .selected{
                    color: var(--dimColor);
                }
            }
        }
        &.fixed{
            margin-top: 100px;
            .nav-box{
                position: fixed;
                top: 71px;
                left: 320px;
                width: calc(100% - 326px);
                height: 100px;
                padding: 0 58px 0 60px;
                line-height: 100px;
                background: #323746;
                border-top-left-radius: 20px;
                box-shadow: 1px 1px 2px 0px rgba(0,0,0,0.3) inset, -1px -1px 2px -2px #575e75 inset;
                transition: all 0s;
                z-index: 10;
            }
        }
        .projects-wrap{
            margin-top: 20px;
        }
    }
}
.my-projects-wrap{
    width: 100%;
    height: calc(100% - 230px);
    margin-top: 20px;
    overflow-x: hidden;
    overflow-y: auto;

    .empty-wraper{
        width: 400px;
        margin: 100px auto 0;
        .empty-box{
            width: 100%;
            height: 110px;
            border: 2px dashed var(--dimColor);
            border-radius: 5px;
            .base-icon{
                width: 40px;
                height: 40px;
                text-align: center;
                line-height: 40px;
                border: 1px solid var(--textColor);
                border-radius: 50%;
                cursor: pointer;
            }
            span{
                margin-left: 30px;
                font-size: 16px;
            }
        }
    }
}

.favorite-wrap{
    height: 100%;
    .img-box{
        width: 70px;
        margin: 180px auto 0;
        text-align: center;
        img{
            width: 60px;
            height: 60px; 
        }
    }
    .favorite-txt{
        font-size: 18px;
    }
    .favorite-empty{
        width: 400px;
        font-size: 12px;
        text-align: center;
        margin: 118px auto 0;
        img{
            width: 200px;
            height: 134px;
            margin-bottom: 29px;
        }
        .empty-l{
            color: var(--dimColor);
        }
        .btn-tem{
            width: 140px;
            margin-top: 20px;
        }
    }
    .favorite-list{
        margin-top: 30px;
        width: 100%;
        height: calc(100% - 65px);
        overflow-x: hidden;
        overflow-y: auto;
        justify-content: start;
        flex-wrap: wrap;
        & /deep/ .template-card{
            .title{
                width: 60%;
                margin-left: 0px;
                font-size: 14px;
                color: var(--dimColor);
                overflow: hidden;
                text-overflow: ellipsis;
                white-space: nowrap;
            }
        }
    }
}
.recycle-wrap{
    .rec-top{
        align-items: end;
    }
    .favorite-empty{
        .empty-s{
            margin-bottom: 10px;
            font-size: 15px;
            font-weight: bold;
        }
        .btn-tem{
            width: 120px;
        }
    }
    .btn-pl{
        width: 88px;
        font-size: 12px;
        background-color: #323746;
        border-radius: 30px;
    }
    .recyclebin-list{
        height: calc(100% - 65px);
        margin-top: 30px;
        overflow-y: auto;
        .template-card{
            display: inline-block;
            position: relative;
            width: auto;
            min-width: 135px;
            height: 280px;
            margin-right: 15px;
            cursor: pointer;
            .image-wrap{
                width: 100%;
                height: calc(100% - 40px);
                border-radius: 5px;
                overflow: hidden;
            }
            img{
                width: 100%;
                height: 100%;
            }
            .operate-box{
                position: absolute;
                top: 10px;
                display: none;
                width: 100%;
                padding: 0 10px;
                .base-icon{
                    width: 24px;
                    height: 24px; 
                    text-align: center;
                    line-height: 22px;
                    background: rgba(0,0,0,0.4);
                    border: 1px solid #ffffff;
                    border-radius: 5px;  
                    cursor: pointer;
                }
            }
            .time{
                position: absolute;
                right: 10px;
                bottom: 50px;
                height: 25px;
                padding: 0 9px;
                text-align: center;
                line-height: 25px;  
                background: rgba(0,0,0,0.4);
                border-radius: 5px;
                font-size: 14px;
                color: #ffffff;
            }
            .title{
                margin-top: 10px;
                padding-left: 10px;
            }
            &:hover{
                .operate-box{
                    display: flex;
                }
            }
        }
    }
}
.share-modal {
    .modal-container {
        width: 340px;
    }
}
</style>