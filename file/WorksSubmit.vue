<template>
    <div v-show="isShow" @click="showCategory = false">
        <base-modal ref="worksSubmit" class="works-submit" modalHide @hide="isShow = false">
            <template slot="custom">
                <div v-show="showNotice" class="notice-contain">
                    <div class="top-title notice-title">
                        <base-icon class="iconxialazhankaijiantou" rotate="90" @click="showNotice = false"></base-icon>
                        <span class="title">分享须知</span>
                    </div>
                    <share-notice></share-notice>
                </div>
                <div v-show="!showNotice" class="works-submit-contain">
                    <div class="bread-crumb flex">
                        <div class="title-item"
                            v-for="(item, index) in breadList"
                            :key="index"
                            :style="{ 'cursor': item.id !== currentFolder.id ? 'pointer' : 'no-drop' }">
                            <span class="title text-ellipsis" @click="backToPrevious(item, index)">{{ item.name }}</span>
                            <base-icon v-if="index !== breadList.length - 1" class="arrow iconxialazhankaijiantou" :rotate="270"></base-icon>
                        </div>
                        <div class="desc">（ <span class="tip" @click="showNotice = true">分享须知</span> / <span class="tip" @click="openOtherModal('coin')">幻币规则</span> ）</div>
                    </div>
                    <div class="nav-wrapper">
                        <div class="nav">
                            <div class="nav-item" :class="{ 'active': isOnline }" @click="isOnline = true">在线作品</div>
                            <div class="nav-item" :class="{ 'active': !isOnline }" @click="isOnline = false">本地上传</div>
                        </div>
                        <search-button
                            v-if="isOnline"
                            class="search-input"
                            v-model="searchKeyword"
                            :inputHeight="36"
                            @search="search"
                            @clear="clearSearch"></search-button>
                    </div>
                    <div class="page-wrapper" v-show="!isDetails">
                        <!-- 在线文档 -->
                        <online-project ref="onlineProject" :is-show="isShow && isOnline" emptyTip="您未创建作品，目前文档空空喔～" :currentDocument="currentDocument" @next="setWorksDetail" @getFolder="getFolder" @selectDocument="selectDocument"></online-project>
                        <!-- 本地上传 -->
                        <import-progress v-show="!isOnline" :import-progress="importProgress" :import-status="importStatus" @import="importFile" @reImport="reImport"></import-progress>
                    </div>
                    <!-- 文档信息 -->
                    <div v-show="isDetails" class="works-details">
                        <div class="title">文档信息</div>
                        <div class="detail-item name flex">
                            <div class="label">名称</div>
                            <input type="text" v-model="worksDetails.name" />
                        </div>
                        <div class="detail-item category flex">
                            <div class="label">分类</div>
                            <div class="dropdown-box" @click.stop="showCategory = !showCategory" :class="{ 'open': showCategory }">
                                <div class="select">{{ worksDetails.category['name'] }}</div>
                                <base-icon class="iconxialazhankaijiantou dropdown-icon" :class="{ 'open': showCategory }"></base-icon>
                                <div class="dropdown-list" v-if="showCategory" @click.stop>
                                    <div v-for="(cItem, cIndex) in categoryList" :key="cIndex">
                                        <div class="category" @click="toggleChildCategory(cIndex)">
                                            <div class="name">{{ cItem.name }}</div>
                                            <base-icon class="iconxialazhankaijiantou dropdown-icon" :class="{ 'open': cItem.showChild }"></base-icon>
                                        </div>
                                        <div class="secondary-category" v-if="cItem.showChild">
                                            <div class="item" @click="selectCategory(item)" v-for="(item, index) in cItem.childrenList" :key="index">{{ item.name }}</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="tag-store">
                            <base-icon class="icontianjia1" size="12"></base-icon>
                            <span>标签库添加</span>
                        </div>
                        <div class="detail-item tag flex">
                            <div class="label">标签</div>
                            <input type="text" v-if="!worksDetails.tag.length" v-model="newTag" placeholder="输入关键词按回车键添加标签" maxlength="6" @keydown.enter="addTag" />
                            <div v-else class="tag-wrapper" :class="{ 'has-tag': worksDetails.tag.length }">
                                <textarea type="text" v-model="newTag" placeholder="输入关键词按回车键添加标签" maxlength="6" @keydown.enter="addTag"></textarea>
                                <div class="tag-list">
                                    <div class="tag" v-for="(item, index) in worksDetails.tag" :key="index">
                                        <span>{{ item }}</span>
                                        <div class="delete-icon" @click="deleteTag(index)"></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="detail-item desc flex">
                            <div class="label">描述</div>
                            <textarea v-model="worksDetails.desc" type="text" placeholder="在这里描述你的作品（可选填）..."></textarea>
                        </div>
                    </div>
                    <div v-if="showBottom" class="bottom-wrapper flex flex-between">
                        <div class="tip">* 审核通过后，根据审核标准ABCD可分获30、20、10、5幻币；</div>
                        <div class="flex">
                            <div class="prev" v-if="isDetails" @click="isDetails = false">上一步</div>
                            <div class="next-button" @click="setWorksDetail" :class="{ 'active': currentDocument }">下一步</div>
                        </div>
                    </div>
                </div>
            </template>
        </base-modal>
    </div>
</template>

<script>
    /**
     * 提交作品弹框
     */
    import SearchButton from '@/components/SearchButton.vue';
    import OnlineProject from '@/components/OnlineProject.vue';
    import ImportProgress from '@/components/ImportProgress.vue';
    import ShareNotice from '@/views/pc/Design/components/WorkShare/ShareNotice.vue';

    export default {
        name: 'WorksSubmit',
        components: {
            SearchButton,
            OnlineProject,
            ImportProgress,
            ShareNotice,
        },
        data() {
            return {
                isShow: false,
                isOnline: true,
                showNotice: false,

                breadList: [],                                  // 面包屑列表
                currentFolder: null,                            // 当前文件夹
                currentDocument: null,                          // 选择的在线文档
                searchKeyword: '',                              // 搜索的关键字

                importProgress: 0,                              // 本地上传进度
                importStatus: '',                               // 本地上传标识
                fileUrl: null,

                isDetails: false,                               // 是否为完善信息页面
                worksDetails: {
                    name: '',
                    category: {},
                    tag: ['商业计划', '商业计划', '商业计划', '商业计划', '商业计划', '商业计划', '商业计划'],
                    desc: ''
                },
                categoryList: [],
                showCategory: false,
                newTag: '',
            }
        },
        mounted() {
            this.$refs.worksSubmit.open();
            this.getCategory();
        },
        computed: {
            showBottom() {
                return this.isOnline;
            }
        },
        methods: {
            open() {
                this.isShow = true;
                this.$refs.worksSubmit.display();
            },
            openOtherModal(type) {
                if (type === 'coin') {
                    this.$hcoinExplainModal({ parent: this.$children[0] });
                }
            },
            
            /**
             * 在线文档相关
             */
            // 获取当前文件夹
            getFolder(folder) {
                this.currentFolder = folder;
                if (!this.breadList.length) {
                    this.breadList = [{ name: '提交作品', id: folder.id }];
                }
            },
            // 进入文件夹和选择文档
            selectDocument(data) {
                let { isFolder, item } = data;
                if (isFolder) {                               // 进入文件夹
                    this.breadList.push({
                        name: item.name,
                        id: item.id
                    });
                    // 当前文件夹拦截
                    if (this.currentFolder && this.currentFolder.id === item.id) return false;
                    // 面包屑处理
                    this.$refs.onlineProject.getDocumentList(item.id);
                    this.currentFolder = item;
                } else {                                        // 选择在线文档
                    this.currentDocument = item;
                }
            },
            // 返回文件夹和底部返回上一步按钮
            backToPrevious(folder, index) {
                if (folder && folder.id) {
                    if (this.currentFolder && (this.currentFolder.id === folder.id)) return;
                    this.$refs.onlineProject.getDocumentList(folder.id);
                    this.breadList.splice(index + 1, this.breadList.length - index - 1);
                    this.currentFolder = folder;
                } else {
                    if (this.isOnline) {
                        // this.clearOnlineData();
                        this.$refs.onlineProject.getDocumentList();
                    } else {
                        // this.clearImportData();
                    }
                }
            },
            // 搜索文档
            search() {
                if (!this.searchKeyword) return;
                this.$refs.onlineProject.getDocumentList('', this.searchKeyword);
            },
            // 清空搜索
            clearSearch() {
                this.searchKeyword = '';
                this.breadList = this.breadList.slice(0, 1);
                this.$refs.onlineProject.getDocumentList();
            },

            /**
             * 本地上传相关
             */
            importFile(fileData) {
                let formData = new FormData();
                formData.append('file', fileData.file);
                formData.append('fileType', 'applyDocument');
                this.importStatus = 'uploading';

                this.$axios({
                    url: '/api/file/upload/',
                    headers: { 'Content-Type': 'multipart/form-data' },
                    method: 'post',
                    dataType: 'file',
                    data: formData,
                    timeout: 120000,
                    onUploadProgress: (progress) => {
                        this.importProgress = parseInt((progress.loaded / progress.total) * 100);
                    },
                }).then(res => {
                    console.log('上传成功', res);
                    let { code, data } = res.data;
                    if (code === '2') {
                        this.fileUrl = data;
                        this.importStatus = 'success';
                    } else {
                        this.importStatus = 'fail';
                        this.$toast('上传失败，请重试', 1500);
                    }
                }).catch(error => {
                    this.importStatus = 'fail';
                    this.$toast('上传失败，请重试', 1500);
                });
            },
            reImport() {},

            /**
             * 完善文档信息相关
             */
            setWorksDetail() {
                this.isDetails = true;
                this.worksDetails.name = this.currentDocument.name;
            },
            getCategory() {
                this.$axios.get('/api/category/list/', {
                    params: {
                        type: 'works',
                    }
                }).then(res => {
                    let { code, data } = res.data;
                    if (code === '2') {
                        this.categoryList = data;
                        this.worksDetails.category = {
                            id: data[0].childrenList[0].id,
                            name: data[0].childrenList[0].name
                        }
                    }
                });
            },
            toggleChildCategory(index) {
                let show = this.categoryList[index].showChild;
                this.$set(this.categoryList[index], 'showChild', !show);
            },
            selectCategory(item) {
                this.worksDetails.category = {
                    id: item.id,
                    name: item.name
                };
                this.showCategory = false;
            },
            addTag(event) {
                event.preventDefault();
                this.worksDetails.tag.unshift(this.newTag);
                this.newTag = '';
            },
            deleteTag(index) {
                this.worksDetails.tag.splice(index, 1);
            }
        },
    }
</script>

<style lang="less" scoped>
    .works-submit {
        /deep/ .modal-content {
            background-color: var(--backColor);
        }
        .notice-contain,
        .works-submit-contain {
            width: 70vw;
            height: 80vh;
            min-width: 1240px;
        }

        .notice-contain {
            .notice-title {
                border-bottom: 1px solid var(--borderColor);
                .base-icon {
                    cursor: pointer;
                    margin-right: 8px;
                    &:hover {
                        color: var(--mainColor);
                    }
                }
            }
            .top-title {
                height: 80px;
                line-height: 80px;
                margin: 0 60px;
                .title {
                    font-size: 18px;
                    font-weight: bold;
                    margin-right: 24px;
                    color: var(--stressColor);
                }
            }
        }

        .works-submit-contain {
            .bread-crumb {
                height: 80px;
                margin: 0 60px;
                justify-content: flex-start;
                overflow-x: scroll;
                .desc {
                    margin-left: 24px;
                    min-width: 140px;
                    color: #949496;
                    cursor: pointer;
                    .tip:hover {
                        color: var(--mainColor);
                    }
                }
            }
            .title-item {
                display: flex;
                .title {
                    display: inline-block;
                    max-width: 300px;
                    line-height: 28px;
                    font-size: 18px;
                    font-weight: bold;
                    vertical-align: middle;
                    color: #949496;
                    &:hover {
                        color: var(--mainColor);
                    }
                    &:last-child {
                        color: var(--stressColor);;
                    }
                }
                .arrow {
                    margin: 0 10px;
                    color: var(--dimColor);
                    vertical-align: middle;
                }
            }

            .nav-wrapper {
                display: flex;
                height: 36px;
                margin: 0 60px;
                align-items: center;
                justify-content: space-between;
                border-bottom: 1px solid var(--borderColor);
            }
            .nav {
                line-height: 36px;
                .nav-item {
                    display: inline-block;
                    color: var(--stressColor);
                    font-size: 14px;
                    margin-right: 40px;
                    cursor: pointer;
                    &:hover {
                        color: var(--mainColor);
                    }
                    &.active {
                        position: relative;
                        font-weight: bold;
                        color: var(--mainColor);
                        &::before {
                            content: '';
                            position: absolute;
                            bottom: 0;
                            left: 0;
                            width: 100%;
                            height: 2px;
                            background: var(--mainColor);
                        }
                    }
                }
            }

            .page-wrapper {
                height: 100%;
                /deep/ .online-project-wrapper {
                    height: calc(100% - 186px);
                    padding-top: 30px;
                }
                /deep/ .local-import-container {
                    height: calc(100% - 116px);
                }
            }

            .works-details {
                width: 50%;
                max-height: calc(100% - 226px);
                padding: 0 40px 20px;
                margin: 20px auto 0;
                border-radius: 10px;
                overflow-y: scroll;
                background-color: var(--upperColor);
                .title {
                    padding: 30px 0;
                    font-size: 16px;
                    font-weight: bold;
                    color: var(--stressColor);
                }
                .tag-store {
                    margin-bottom: 10px;
                    padding: 0 10px;
                    border-radius: 10px;
                    height: 24px;
                    line-height: 24px;
                    float: right;
                    color: var(--textColor);
                    background-color: #F6F6F9;
                    cursor: pointer;
                    span {
                        margin-left: 5px;
                    }
                    &:hover {
                        background-color: rgba(11, 123, 246, 0.1);
                    }
                }
                .detail-item {
                    width: 100%;
                    margin-bottom: 20px;
                    .label {
                        width: 24px;
                        color: var(--dimColor);
                        margin-right: 36px;
                    }
                    input,
                    textarea,
                    .dropdown-box {
                        height: 48px;
                        width: calc(100% - 60px);
                        color: var(--stressColor);
                        border-radius: 10px;
                        padding-left: 20px;
                        border: 1px solid var(--borderColor);
                        &::-webkit-input-placeholder {
                            color: var(--dimColor); 
                        }
                        &:hover {
                            border-color: var(--dimColor);
                        }
                        &.open,
                        &:focus {
                            border-color: var(--mainColor);
                        }
                    }
                    textarea {
                        height: 100px;
                        padding: 10px 20px;
                        line-height: 18px;
                        resize: none;
                    }
                }
                .tag-wrapper {
                    width: calc(100% - 60px);
                    height: 48px;
                    textarea {
                        width: 100%;
                        height: 100%;
                    }
                    &.has-tag {
                        position: relative;
                        height: 125px;
                        .tag-list {
                            position: absolute;
                            left: 20px;
                            top: 45px;
                            .tag {
                                position: relative;
                                display: inline-block;
                                height: 24px;
                                line-height: 24px;
                                padding: 0 14px;
                                color: #FFFFFF;
                                border-radius: 12px;
                                margin: 0 10px 10px 0;
                                cursor: pointer;
                                background-color: var(--mainColor);
                                &:hover {
                                    .delete-icon {
                                        display: inline-block;
                                    }
                                }
                            }
                            .delete-icon {
                                display: none;
                                position: absolute;
                                top: -6px;
                                right: -4px;
                                width: 15px;
                                height: 15px;
                                vertical-align: bottom;
                                border-radius: 50%;
                                border: 1px solid var(--borderColor);
                                background-color: #FFFFFF;
                                transform: rotate(45deg);
                                &::before {
                                    content: '';
                                    position: absolute;
                                    left: 4px;
                                    top: 6px;
                                    width: 5px;
                                    border-top: 1px solid #242429;
                                }
                                &::after {
                                    content: '';
                                    position: absolute;
                                    left: 6px;
                                    top: 4px;
                                    height: 5px;
                                    border-left: 1px solid #242429;
                                }
                            }
                        }
                        &:hover {
                            textarea {
                                border-color: var(--dimColor);
                            }
                        }
                    }
                }
                .detail-item.category {
                    .dropdown-box {
                        color: var(--textColor);
                        position: relative;
                        cursor: pointer;
                        padding: 0 20px;
                        .select {
                            display: inline-block;
                            line-height: 48px;
                            color: var(--stressColor);
                        }
                        .dropdown-icon {
                            float: right;
                            line-height: 48px;
                            color: var(--dimColor);
                            &.open {
                                transform: rotate(180deg);
                            }
                        }
                    }
                    .dropdown-list {
                        position: absolute;
                        top: calc(100% + 1px);
                        left: 0;
                        height: 300px;
                        overflow-y: scroll;
                        padding: 5px 0;
                        border-radius: 5px;
                        z-index: 1;
                        border: 1px solid var(--borderColor);
                        background-color: var(--upperColor);
                    }
                    .category {
                        padding: 0 20px;
                        .name {
                            display: inline-block;
                            width: 140px;
                            height: 28px;
                            line-height: 28px;
                        }
                        .dropdown-icon {
                            float: none;
                            line-height: 28px;
                        }
                        &:hover {
                            color: #FFFFFF;
                            background-color: var(--mainColor);
                            .dropdown-icon {
                                color: #FFFFFF;
                            }
                        }
                    }
                    .secondary-category {
                        .item {
                            height: 28px;
                            line-height: 28px;
                            padding-left: 40px;
                            &:hover {
                                color: #FFFFFF;
                                background-color: var(--mainColor);
                            }
                        }
                    }
                }
            }

            .bottom-wrapper {
                position: absolute;
                bottom: 0;
                left: 0;
                width: 100%;
                height: 70px;
                padding: 0 60px;
                border-radius: 0 0 10px 10px;
                background-color: var(--upperColor);
                .prev {
                    color: var(--dimColor);
                    margin-right: 40px;
                    cursor: pointer;
                    &:hover {
                        color: var(--mainColor);
                    }
                }
                .next-button {
                    width: 120px;
                    height: 40px;
                    line-height: 40px;
                    text-align: center;
                    border-radius: 20px;
                    color: var(--dimColor);
                    cursor: no-drop;
                    background-color: #F6F6F9;
                    &.active {
                        cursor: pointer;
                        color: #FFFFFF;
                        background-color: var(--mainColor);
                        &:hover {
                            background-color: var(--mainHoverColor);
                        }
                    }
                }
            }
        }
    }
</style>