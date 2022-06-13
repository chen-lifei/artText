<template>
    <div class="edit-footer-panel flex">
        <!-- 快捷键 -->
        <div :class="['keyboard-bar', {'active': EditView.right_panel_status('keyboard') > -1}]" v-tooltip="`Ctrl + /`" @click="toggleKeyboard()">
            <base-icon class="iconjianpan1" size="16"></base-icon>
            <span>快捷键</span>
        </div>
        <div class="find-bar" @click="findEle">
            <base-icon class="iconsousuo"></base-icon>
            <span>查找</span>
        </div>
        <div class="find-bar" @click="replaceEle">
            <base-icon class="icontihuan2line"></base-icon>
            <span>替换</span>
        </div>
        <!-- 备注 -->
        <div :class="['note-bar', {'active': hasNote}]"  @click="toggleNote()">
            <base-icon class="iconbianji" size="12"></base-icon>
            <span>备注</span>
        </div>
        <!-- 备注面板 -->
        <transition name="modal-fade">
            <div class="note-panel" v-if="showNoteEditable">
                <textarea ref="note" maxlength="1000" placeholder="单击此处添加备注" :value="noteContent" @input="editNote($event)" @focus="EditView.ele_cancel_checked"></textarea>
                <div class="close" @click="toggleNote()">
                    <base-icon class="iconguanbi"></base-icon>
                </div>
                <span :class="['str-length', {tips: noteContent.length === 1000}]">{{noteContent.length}}/1000</span>
            </div>
        </transition>
        <!-- 缩放 -->
        <div class="scale-bar">
            <base-icon class="iconsuoxiao" size=18 v-tooltip.top="`缩小画布 -`" @click="applyScale(pageScale.user_set - 0.1)"></base-icon>
            <span title="缩放画布" @click.stop="toggleViews">{{pageScale.percent_text}}%</span>
            <base-icon class="iconfangda" size=18 v-tooltip.top="`放大画布 +`" @click="applyScale(pageScale.user_set + 0.1)"></base-icon>
            <!--视图弹框-->
            <base-dropdown class="views-panel" :open="showViewsList" arrow arrow-direction="bottom" @close="toggleViews">
                <template>
                    <!-- 缩放值 -->
                    <ul class="scale-list">
                        <li v-for="(item, index) in scaleList" :key="index" :class="{'checked': item.checked}" @click="checkedScale(item)">
                            <span>{{item.name}}</span>
                            <i>{{ item.keyboard }}</i>
                        </li>
                    </ul>
                    <!-- 网格 -->
                    <div class="grid-panel">
                        <div class="grid-switch">
                            <span >显示网格</span>
                            <base-switch v-model="EditView.grid_using" @switch="toggleGrid"></base-switch>
                        </div>
                        <ul class="grid-list" v-if="gridOpen">
                            <li v-for="item in gridList" :key="item.key" @click="setGridModel(item.key)"><base-icon v-if="EditView.grid_using === item.key" class="icondagou" size="12"></base-icon>{{ item.name }}</li>
                        </ul>
                    </div>
                    <!-- 沉浸模式 -->
                    <div class="immersive-mode" @click="setImmersiveMode()">
                        <div>
                            <base-icon v-if="immersiveMode" class="icondagou" size="12"></base-icon>
                            <span>沉浸模式</span>
                            <i>Ctrl + \</i>
                        </div>
                    </div>
                </template>
            </base-dropdown>
        </div>
        <!-- 帮助中心 -->
        <feedback-button ref="feedback" @submit="submitErrorToAliyun">
            <template slot="custom" slot-scope="{ active }">
                <div class="help-bar" :class="{active: active}">
                    <base-icon class="iconbangzhuzhongxin" size="20" color="#242529" @click="$refs.feedback.closePanel()"></base-icon>
                </div>
            </template>
        </feedback-button>
    </div>
</template>

<script>
import baseSwitch from '@/components/base/base-switch.vue';
import FeedbackButton from '@/components/FeedbackButton.vue';
import opt_factory from '@/assets/pc/js/opt/opt_factory.js';
import page_opt from '@/assets/pc/js/opt/page_opt.js';
export default {
    components: { baseSwitch, FeedbackButton },
    props: ['pageScale'],
    inject: ['EditView'],
    data() {
        return {
            // 文档所有页备注列表
            noteList: [],
            // 备注输入框显示
            showNoteEditable: false,
            // 备注集合
            noteCollect: {
                // 当前编辑文档页id
                id: null,
                // 定时器
                timer: null
            },

            // 画布缩放下拉标识
            showViewsList: false,
            // 画布缩放列表数据
            scaleList: [
                { name: '50%', scale: 0.5, keyboard: '' ,checked: false },
                { name: '80%', scale: 0.8, keyboard: '' ,checked: false },
                { name: '100%', scale: 1, keyboard: 'Ctrl 0' ,checked: false },
                { name: '200%', scale: 2, keyboard: '' ,checked: false },
                { name: '400%', scale: 4, keyboard: '' ,checked: false },
                { name: '适配屏幕', scale: null, keyboard: 'Ctrl 1' }
            ],
            gridList: [
                {name: '紧凑', key: 'small', check: false},
                {name: '舒适', key: 'middle', check: true},
                {name: '宽松', key: 'large', check: false},
            ],
            // 沉浸模式标识
            immersiveMode: false,
        }
    },
    computed: {
        // 判断当前页是否有备注
        hasNote(){
            let item = this.noteList.find(v => v.documentPage === this.EditView.page_info.id);
            return item && item.content;
        },
        // 备注内容
        noteContent(){
            let noteItem = this.noteList.find(v => v.documentPage === this.EditView.page_info.id);
            return noteItem ? noteItem.content : '';
        },
        // 是否开启网格
        gridOpen() {
            return this.EditView.grid_using;
        },
    },
    methods: {
        // 快捷键
        toggleKeyboard() {
            let index = this.EditView.right_panel_status('keyboard');
            if (index > -1) {
                this.EditView.current_right_panel = index > 0 ? this.EditView.right_panel_nav[index - 1].key : '';
                this.EditView.right_panel_nav.splice(index, 1);
            } else {
                this.EditView.right_panel_nav.push({key: 'keyboard', name: '快捷键'})
                this.EditView.current_right_panel = 'keyboard';
            }
        },

        /* 备注方法 start */
        // 获取文档备注
        getDocumentNote(docId) {
            this.$axios.get(`/api/member/document_remark/get_remarks/`, { params: { docId } }).then(res => {
                let { code, data } = res.data;
                if (!(code == 2 || data.length)) return;
                this.noteList = data;
            });
        },
        // 文档备注显示和切换
        toggleNote() {
            let { id } = this.EditView.document_info;
            if (this.EditView.modal_id || $validate(id).empty()) {
                return this.$toast("编辑幻灯片后才可以编辑备注哦");
            }
            this.showNoteEditable = !this.showNoteEditable;
            this.$nextTick(() => {
                if (!this.hasNote && this.$refs.note) {
                    this.$refs.note.focus();
                }
            })
        },
        // 编辑备注
        editNote(e) {
            let docId = this.EditView.document_info.id;
            let pId = this.EditView.page_info.id;
            let content = e.target.value;
            let {id: noteId , timer} = this.noteCollect;
            // 文档页为空 则不保存
            if (!pId) return;
            // 文档页跟上次编辑同一页时 且 有定时器
            if (noteId && noteId === pId && timer) clearTimeout(timer);
            this.noteCollect.id = pId;
            this.noteCollect.timer = setTimeout(()=>{
                this.noteCollect.timer = null;
                this.saveNote(docId, pId, content);
            }, 1000);
        },
        // 保存文档备注
        saveNote(docId, pId, content) {
            if (this.noteList.length > 0) {
                let note_item = this.noteList.find(v => v.documentPage === pId);
                // 如果内容跟上次没有变化 || 上次没有内容且备注为空
                if ((note_item && note_item.content === content) || (!note_item && !content)) return;
            } else {
                // 如果所有页都没有备注且备注框内容为空
                if (!content) return;
            }
            let data = {documentPage: pId, content};
            this.$axios({
                url: '/api/member/document_remark/save/',
                method: 'post',
                data: { docId, pId, content }
            }).then(res => {
                let {code} = res.data;
                if (code !== '2') return this.$toast('保存备注出错！', 2000);
                let note_index = this.noteList.findIndex(v => v.documentPage === pId);
                if (note_index !== -1) {
                    this.noteList[note_index].content = content;
                } else {
                    this.noteList.push(data);
                }
            }).catch(err => {
                this.$toast('保存备注出错！', 2000);
                console.error(err);
            });
        },
        /* 备注方法 end */

        /* 视图相关 start */
        // 显示/隐藏视图列表
        toggleViews() {
            this.showViewsList = !this.showViewsList;
        },
        // 选择缩放
        checkedScale(scale) {
            let list = this.scaleList;
            list.forEach(function (item) {
                item.checked = false;
            });
            scale.checked = true;
            this.showViewsList = false;
            this.applyScale(scale.scale);
        },
        // 应用页面缩放 (data:缩放值,clear:是否关闭缩放列表标识)
        applyScale(data, stay) {
            let EditView = this.EditView;
            let arr = this.scaleList.filter(item => item.scale === data);
            if (arr.length <= 0 || arr[0].name === '适配屏幕') {
                this.scaleList.forEach(item => {
                    item.checked = false;
                });
            } else {
                arr[0].checked = true;
                this.scaleList[5].checked = false;
            }
            if (data > 10) {
                this.$toast('不能大于1000%哦', 800);
                data = 10;
            }
            if (data < 0.2) {
                this.$toast('不能小于20%哦', 800);
                data = 0.2;
            }
            // 设置当前缩放
            this.pageScale.user_set = data;
            // 设置当前缩放比例文本
            this.pageScale.percent_text = Math.round(data * 100);
            // 设置当前可拖动标识
            this.pageScale.less = data < this.pageScale.suitable;
            // 设置 base_opt 比例
            opt_factory.init_opt('group').set_base_scale(data);
            // 设置画布缩放
            page_opt.set_page_scale(EditView);
            if (data > this.pageScale.suitable) {
                this.$toast('按住鼠标右键可以拖动画布', 1000);
            }
            // 清除画布状态
            if (!stay) EditView.clear_page_status();
            // 清除选中状态
            EditView.ele_cancel_checked();
        },
        // 开关网格
        toggleGrid(value) {
            this.setGridModel(value ? 'middle' : false);
        },
        // 设置网格
        setGridModel(value = false) {
            const that = this;
            let EditView = that.EditView;
            EditView.grid_using = value;
            EditView.grid_using_render();
            that.$nextTick(() => {
                EditView.toggle_grid_display(true);
                setTimeout(() => {
                    EditView.toggle_grid_display(false);
                }, 300);
            });
            let config = EditView.user_personal_config;
            let content = {'grid': value}
            content = Object.assign(config, content);
            that.$axios.post('/api/member/personal_conf/save/', {
                content: JSON.stringify(content)
            })
        },
        /* 视图相关 end */

        // 进入沉浸模式
        setImmersiveMode() {
            if (this.immersiveMode) {
                utils.outFullScreen(() => {
                    this.immersiveMode = false;
                    this.EditView.put_left_modal_away(true);
                });
            } else {
                utils.inFullScreen(() => {
                    this.immersiveMode = true;
                    this.EditView.put_left_modal_away(false);
                    this.EditView.right_panel_nav = [];
                });
            }
            this.showViewsList = false;
        },
        // 提交报错反馈到阿里云日志
        submitErrorToAliyun(id) {
            this.EditView.submit_error_to_aliyun(id);
        },
        findEle() {
            let searchRes = page_opt.searchEle(this.EditView, '品牌');

            page_opt.setEleHighlight(searchRes);
        },
        replaceEle() {
            let allSearch = $('.search-highlight');
            allSearch.each((index, item) => {
                console.log(item);
                item.innerText = '我的品牌';
            });
            setTimeout(() => {
                this.clearSearchRes();
            }, 2000);
        },
        clearSearchRes() {
            let allSearch = $('.search-highlight');
            allSearch.each((index, item) => {
                item.outerHTML = item.outerText;
            });
        },
    }
}
</script>

<style lang="less" scoped>
.edit-footer-panel {
    justify-content: flex-end;
    align-items: center;
    height: 100%;
    padding: 0 10px;
    font-size: 12px;
    color: #242529;
}
.keyboard-bar,
.find-bar,
.note-bar {
    display: flex;
    justify-content: center;
    width: 60px;
    height: 24px;
    line-height: 24px;
    margin-right: 15px;
    text-align: center;
    border-radius: 4px;
    cursor: pointer;
    > .base-icon {
        margin-right: 6px;
    }
    &:hover,
    &.current {
        background-color: #f6f6f9;
    }
}
.keyboard-bar {
    width: 70px;
    > .base-icon {
        transform: translateY(-1px);
    }
    &.active{
        background-color: #f6f6f9;
    }
}
.note-bar.active{
    color: var(--mainColor);
    background: rgba(0,91,255,.1);
}
.scale-bar {
    position: relative;
    padding: 0 20px;
    &::before,
    &::after {
        content: "";
        position: absolute;
        right: 0;
        top: calc(50% - 5px);
        height: 12px;
        width: 1px;
        background-color: #d6d8dd;
    }
    &::before {
        left: 0;
        right: auto;
    }
    > span {
        vertical-align: middle;
        margin: 0 10px;
        cursor: pointer;
        &:hover {
            color: var(--mainColor);
        }
    }
    > .base-icon {
        vertical-align: middle;
        cursor: pointer;
        &:hover {
            color: var(--mainColor);
        }
    }
    /*比例列表*/
    .views-panel {
        left: -20px;
        bottom: 37px;
        z-index: 20;
        width: 160px;
        li {
            height: 40px;
            line-height: 40px;
            padding: 0 20px 0 40px;
            cursor: pointer;
            i {
                float: right;
            }
            &:hover {
                background: rgba(241, 241, 242, 0.5);
            }
        }
        .scale-list {
            &::after {
                content: "";
                display: inline-block;
                width: calc(100% - 40px);
                height: 1px;
                margin: 8px 0;
                transform: translateX(20px);
                background-color: #e6e9ee;
            }
            li.checked span{
                color: var(--mainColor);
            }
        }
        .grid-panel {
            .grid-switch {
                position: relative;
                height: 40px;
                line-height: 40px;
                padding: 0 20px 0 40px;
            }
            .base-switch {
                position: absolute;
                right: 20px;
                top: 13px;
            }
            .grid-list {
                li {
                    position: relative;
                }
                .base-icon {
                    position: absolute;
                    top: 10px;
                    left: 15px;
                    width: 16px;
                    height: 16px;
                    line-height: 16px;
                    text-align: center;
                }
            }
        }
        .immersive-mode {
            div {
                position: relative;
                height: 40px;
                line-height: 40px;
                padding: 0 20px 0 40px;
                cursor: pointer;
            }
            i {
                float: right;
            }
            .base-icon {
                position: absolute;
                top: 12px;
                left: 15px;
                width: 16px;
                height: 16px;
                line-height: 16px;
                text-align: center;
            }
            &::before {
                content: "";
                display: inline-block;
                width: calc(100% - 40px);
                height: 1px;
                margin: 8px 0;
                transform: translateX(20px);
                background-color: #e6e9ee;
            }
        }
    }
}
.full-screen-bar {
    padding: 0 10px 0 20px;
    cursor: pointer;
    .base-icon {
        transform: translateY(1px);
    }
    &:hover {
        color: var(--mainColor);
    }
}
.feedback-wrapper {
    width: 28px;
    height: 28px;
    line-height: 28px;
    margin: 0 6px 0 12px;
    &:hover {
        background: #f6f6f9;
    }
    .help-bar {
        height: 100%;
        border-radius: 6px;
        text-align: center;
        &.active {
            background: #f6f6f9;
        }
        cursor: pointer;
    }
    /deep/ .select-list {
        bottom: calc(100% + 16px) !important;
    }
    /deep/ .invite-panel {
        box-shadow: 0 5px 15px 0 rgba(104,111,126,0.10) !important;
    }
}

// 备注面板
.note-panel {
    position: absolute;
    right: 0;
    bottom: 100%;
    z-index: 2;
    width: 100%;
    height: 80px;
    background-color: #ffffff;
    border: 1px solid #eeeeee;
    box-shadow: 0 -20px 20px 0 rgba(223, 225, 231, 0.2);
    textarea {
        padding: 20px 5px 20px 20px;
        width: calc(100% - 80px);
        height: 100%;
        resize: none;
        font-size: 12px;
        line-height: 16px;
        color: #444444;
    }
    .close {
        position: absolute;
        top: 10px;
        right: 10px;
        cursor: pointer;
        .base-icon {
            font-size: 24px;
            color: #444444;
        }
    }
    .str-length {
        position: absolute;
        bottom: 10px;
        right: 10px;
        font-size: 12px;
        color: #cccccc;
        &.tips {
            color: #ff0000;
        }
    }
}
</style>