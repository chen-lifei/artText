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

.drag-image {
    position: absolute;
    width: 150px;
    height: 100px;
    object-fit: cover;
    z-index: 10;
}
/deep/ .multiple_drag_start {
    &::before {
        content: '';
        z-index: 0;
        position: absolute;
        top: 10px;
        left: 10px;
        width: 150px;
        height: 100px;
        border: 1px dashed var(--mainColor);
    }
}
/deep/ .drag {
    .project-grid-container {
        &::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            border-radius: 5px;
            background-color: #E3E6EC;
            border: 1px dashed #D6D8DD;
            z-index: 10;
        }
    }
}
/deep/ .enter-folder {
    padding: 10px 0;
    border: 1px dashed #0EC5C7;
    background-color: rgba(14, 197, 199, 0.1);
    img {
        display: block;
        width: 90% !important;
        height: 159px !important;
        margin: auto;
    }
    .folder-bottom {
        width: 90% !important;
        height: 78px !important;
        margin: auto;
    }
}

// let dragged = null;
        // let folderNode;

        /* 拖动目标元素时触发drag事件 */
        /* document.addEventListener('drag', (event) => {
        }, false); */

        /* document.addEventListener('dragstart', (event) => {
            // event.preventDefault();
            console.log(event);
            console.log('start');
            dragged = event.target;
            $(dragged).css({
                position: 'relative',
                left: event.offsetX - 30,
                top: event.offsetY - 50
            });
            event.target.classList.add('drag_start');
            if (this.isBatching) {
                event.target.classList.add('multiple_drag_start');
                setTimeout(() => {
                    this.selectListId.forEach(item => {
                        $(`.project-card[data-id=${item}] .project-grid-container`).addClass('drag');
                    });
                }, 0);
                
            }
            setTimeout(() => {
                event.target.classList.add('drag');
            }, 0)
        }, false);

        document.addEventListener('dragend', (event) => {
            console.log('end');
            setTimeout(() => {
                event.target.classList.remove('drag_start');
                event.target.classList.remove('drag');
                $(dragged).css({
                    position: 'relative',
                    left: 0,
                    top: 0
                });
                if (this.isBatching) {
                    event.target.classList.remove('multiple_drag_start');
                    this.selectListId.forEach(item => {
                        $(`.project-card[data-id=${item}] .project-grid-container`).removeClass('drag');
                    });
                }
                if(folderNode && folderNode.length) folderNode.get(0).classList.remove('enter-folder');
            }, 20);
        }, false);

        document.addEventListener('dragover', (event) => {
            // 阻止默认动作以启用drop
            event.preventDefault();
            dragged.classList.add('drag');
        }, false);

        document.addEventListener('dragenter', (event) => {
            let parent = $(event.target).parents('.folder');
            // 可拖动的元素进入了可放置的目标
            if (parent.length) {
                parent.get(0).classList.add('enter-folder');
            }
        }, false);

        document.addEventListener('dragleave', (event) => {
            // 拖动元素离开可放置目标节点，清除样式
            let parent = $(event.target).parents('.folder');
            if (parent.length) {
                parent.get(0).classList.remove('enter-folder');
            }
        }, false);

        document.addEventListener('drop', (event) => {
            console.log('drop');
            event.preventDefault();
            // 将拖动的元素放到所选择的可放置目标节点中
            folderNode = $(event.target).parents('.folder');
            
            if (folderNode.length) {
                let data;
                let targetCardNode = folderNode.parents('.project-card').get(0);
                let dragCardNode = $(dragged).parents('.project-card').get(0);

                data = {
                    targetId: targetCardNode.getAttribute('data-id'),
                    dragId: dragCardNode.getAttribute('data-id'),
                    isFolder: dragCardNode.getAttribute('data-folder')
                };
                this.move(data);
            }
        }, false); */
    
        let dragging;
        let draggingEle;
        let dragId, isFolder;
        document.addEventListener('mousedown', (event) => {
            let parent = $(event.target).parents('.project-card');
            
            if (parent.length) {
                dragging = event.target;
                dragId = parent.attr('data-id');
                isFolder = parent.attr('data-folder');
                console.log(dragId, isFolder);
                setTimeout(() => {
                    console.log(dragging);
                }, 200);
                return;
                let img;
                if (parent.get(0).hasAttribute('data-folder')) {
                    img = parent.find('.folder img').clone();
                } else {
                    img = parent.find('.cover-wrapper img').clone();
                }
                parent.addClass('drag');
                draggingEle = img.get(0);
                
                document.body.appendChild(draggingEle);
                draggingEle.style.position = 'absolute';
                draggingEle.style.width = '150px';
                draggingEle.style.height = '100px';
                draggingEle.style.objectFit = 'cover';
                draggingEle.style.zIndex = '99';
                draggingEle.style.borderRadius = '5px';
                draggingEle.style.border = '1px dashed #0fcdcf';
                
                if (this.isBatching) {
                    event.target.classList.add('multiple_drag_start');
                    this.selectListId.forEach(item => {
                        $(`.project-card[data-id=${item}] .project-grid-container`).addClass('drag');
                    });
                }
            }
        }, false);

        document.addEventListener('mouseup', (event) => {
            dragging = null;
            if(draggingEle) {
                document.body.removeChild(draggingEle);
                draggingEle = null;
                $(`.project-card[data-id=${dragId}]`).removeClass('drag');
            };
            setTimeout(() => {
                if (this.isBatching) {
                    event.target.classList.remove('multiple_drag_start');
                    this.selectListId.forEach(item => {
                        $(`.project-card[data-id=${item}] .project-grid-container`).removeClass('drag');
                    });
                }
                // if (folderNode && folderNode.length) folderNode.get(0).classList.remove('enter-folder');
            }, 20);
        }, false);

        document.addEventListener('mousemove', (event) => {
            event.preventDefault();
            if (dragging && draggingEle) {
                draggingEle.style.left = event.x + 'px';
                draggingEle.style.top = event.y + 'px';
            }
        }, false);

        document.addEventListener('mouseenter', (event) => {
            event.preventDefault();
        }, false);

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