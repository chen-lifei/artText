<template>
    <base-modal ref="moveModal" :show="showModal" :show-close="false">
        <template #custom>
            <div class="move-modal">
                <base-icon class="close iconguanbi" :size="12" @click="showModal = false"></base-icon>
                <div class="title">移动至</div>
                <div class="main-container">
                    <div v-for="(item, index) in folderList" :key="index">
                        <div
                            v-if="item.show"
                            :class="{ 'folder': true, 'check': item.check, 'open': item.open, 'line': item.grade && item.grade === 1 }"
                            :style="{ 'margin-left': item.hasOwnProperty('grade') ? `${(item.grade + 1) * 30}px` : 0 }"
                            @click="selectFolder">
                            <base-icon class="iconfolder"></base-icon>
                            <div class="name text-ellipsis">{{ item.name }}</div>
                            <base-icon v-if="item.hasChild" class="dropdown iconfangxiangjiantou" :size="12"></base-icon>
                        </div>
                    </div>
                </div>
                <div class="bottom flex">
                    <base-button
                        class="create-folder"
                        :round="true"
                        :width="136"
                        :height="44"
                        @click="createFolder">
                        <base-icon :size="12" class="iconpianduantianjia"></base-icon>
                        <span>新建文件夹</span>
                    </base-button>
                    <base-button
                        class="move"
                        :round="true"
                        :width="480"
                        :height="44"
                        @click="move">移动
                    </base-button>
                </div>
            </div>
        </template>
    </base-modal>
</template>

<script>
/**
 * 移动工程文件或文件夹弹框
 * @prop projectInfo[Object]                    工程或文件夹的信息
 */
export default {
    name: 'MoveModal',
    props: {
        projectInfo: {
            type: Object,
            default: () => {}
        }
    },
    data() {
        return {
            showModal: false,
            folderList: [
                { name: '我的工程', show: true, open: '', check: '', hasChild: '' },
            ],
            currentFolder: ''
        }
    },
    mounted() {
        this.currentFolder = this.folderList[0];
    },
    methods: {
        show() {
            this.showModal = true;
            this.getFolderList();
        },
        getFolderList() {
            this.$api.FOLDER_LIST().then(res => {
                let list = res.data;
                list.forEach(item => {
                    // 第一级文件夹默认显示
                    if (item.grade === 0) this.$set(item, 'show', true);
                    // 是否存在子级文件夹
                    if (list.find(folder => folder.treePath.indexOf(`,${item.id},`) > -1)) this.$set(item, 'hasChild', true);
                });
                this.folderList = this.folderList.concat(list);
                // 我的工程层级当有子文件时，默认展开
                if (list.length > 0) {
                    this.folderList[0].open = true;
                    this.folderList[0].check = true;
                    this.folderList[0].hasChild = true;
                };
                console.log(this.folderList);
            });
        },
        selectFolder() {
            this.folderList.forEach(item => {
                if ((item.grade === 1) || (item.grade > 1)) this.$set(item, 'show', true);;
            });
        },
        createFolder() {},
        move() {}
    }
}
</script>

<style lang="less" scoped>
.move-modal {
    position: relative;
    width: 780px;
    height: 520px;
    padding: 40px 20px 40px 40px;
    background-color: #EDEFF5;
    border-radius: 10px;
    box-shadow: 0 2px 10px rgba(201, 202, 203, 0.51);
    .close {
        position: absolute;
        right: -34px;
        top: 0;
        width: 24px;
        height: 24px;
        line-height: 24px;
        padding: 0;
        border-radius: 50%;
        text-align: center;
        cursor: pointer;
        background: rgba(255, 255, 255, 0.7);
    }
    .title {
        font-size: 18px;
        font-weight: 600;
        color: #242529;
    }
    .main-container {
        height: 320px;
        margin: 10px 20px 30px;
        padding-right: 20px;
        overflow-y: auto;
        .folder {
            width: auto;
            height: 68px;
            line-height: 68px;
            cursor: pointer;
            margin-top: 14px;
            border-radius: 10px;
            border: 1px solid #D6D8DD;
            background-color: #E3E6EC;
            .base-icon {
                color: #444444;
                padding: 0 15px 0 30px;
            }
            .name {
                display: inline-block;
                width: calc(100% - 160px);
                color: #242529;
                vertical-align: middle;
            }
            &:hover,
            &.select,
            &.check {
                border-color: rgba(14, 197, 199, 0.1);
                background-color: rgba(14, 197, 199, 0.1);
                .name,
                .base-icon {
                    color: var(--mainColor);
                }
            }
            &.open {
                .dropdown {
                    transform: rotate(180deg);
                    padding: 0 30px 0 15px;
                }
            }
            &.line {
                color: plum;
            }
        }
    }
    .bottom {
        padding: 0 20px;
        justify-content: space-between;
        .create-folder {
            font-size: 12px;
            .base-icon {
                width: 16px;
                height: 16px;
                line-height: 16px;
                margin-right: 10px;
                border: 1px solid var(--textColor);
                border-radius: 50%;
            }
        }
        /deep/ .move {
            color: #FFFFFF;
            background-color: var(--mainColor);
        }
    }
}
</style>