<template>
    <base-dropdown class="right-menu-panel" :open="show" :arrow="false" transition="''" :customStyle="panelStyle" :customCloseListener="['mousedown', 'mousewheel']" @close="close">
        <ul class="menu-list">
            <li v-for="item in menuList[menuType]" :key="item.key" v-show="menuShow(item.key)" :disabled="menuDisabled(item.key)">
                <template v-if="item.type === 'split'">
                    <div class="line"></div>
                </template>
                <template v-else>
                    <div class="list-item flex flex-between" @click="menuEvent($event, item.key)">
                        <p>{{ typeof item.name === 'function' ? item.name() : item.name }}</p>
                        <span v-if="item.shortcut">
                            <i v-for="i in shortcuts(item.shortcut)" :key="i">{{ i }}</i>
                        </span>
                        <base-icon v-if="item.list" class="iconjiantou" rotate="180" size="14"></base-icon>
                    </div>
                </template>
                <!-- 子列表 -->
                <ul class="child-list" v-if="item.list">
                    <li v-for="(cItem, cIndex) in item.list" :key="cIndex" :disabled="menuDisabled(item.key, cItem.key)">
                        <template v-if="cItem.type === 'split'">
                            <div class="line"></div>
                        </template>
                        <template v-else>
                            <div class="list-item flex" @click="childMenuEvent($event, item.key, cItem)">
                                <base-icon v-if="cItem.icon" :class="cItem.icon" size="14"></base-icon>
                                <button class="radio" v-if="cItem.type === 'radio'" :class="{check: page_align_type === cItem.key}"></button>
                                <p>{{ cItem.name }}</p>
                                <input v-if="cItem.key === 'local'" @click.stop ref="uploader" type="file" accept="image/*" @change="childMenuEvent($event, item.key, cItem)">
                            </div>
                        </template>
                    </li>
                </ul>
            </li>
        </ul>
    </base-dropdown>
</template>
<script>
// 层级菜单
let levelMenu = [
    {name: '上移一层', key: 'up', icon: 'iconshangyi1'},
    {name: '下移一层', key: 'down', icon: 'iconxiayi1'},
    {name: '移至顶层', key: 'top', icon: 'iconyizuishangding'},
    {name: '移至底层', key: 'bottom', icon: 'iconyixiazuidi'},
];
// 画布对齐菜单
let pageAlignMenu = [
    {name: '左对齐', key: { data: 'left', key: 'horizontal'}, icon: 'iconzuoduiqi1'},
    {name: '左右居中', key: { data: 'center', key: 'horizontal'}, icon: 'iconchuizhijuzhong'},
    {name: '右对齐', key: { data: 'right', key: 'horizontal'}, icon: 'iconyouduiqi'},
    {type: 'split'},
    {name: '顶对齐', key: { data: 'top', key: 'vertical'}, icon: 'icondingduiqi'},
    {name: '垂直居中', key: { data: 'middle', key: 'vertical'}, icon: 'iconshuipingjuzhong'},
    {name: '底对齐', key: { data: 'bottom', key: 'vertical'}, icon: 'icondiduiqi'},
    {type: 'split'},
    {name: '垂直等间距', key: { data: 'deuce', key: 'vertical'}, icon: 'iconchuizhidengjianju'},
    {name: '水平等间距', key: { data: 'deuce', key: 'horizontal'}, icon: 'iconshuipingdengjianju'},
    {type: 'split'},
    {name: '相对画布', type:'radio', key: 'page'},
    {name: '相对元素', type:'radio', key: 'element'}
];
// 文本对齐菜单
let textALignMenu = [
    {name: '左对齐', key: 'left', icon: 'iconwenbenzuoduiqi1'},
    {name: '居中对齐', key: 'center', icon: 'iconwenbenjuzhong'},
    {name: '右对齐', key: 'right', icon: 'iconwenbenyouduiqi'},
    {name: '分散对齐', key: 'justify', icon: 'iconwenbenliangduanduiqi'}
]; // 图片菜单
let imageMenu = [
    {name: '从本地更换', key: 'local'},
    {name: '从媒体库更换', key: 'media'},
    {name: '设置为背景', key: 'background'},
    {name: '下载图片', key: 'download'},
];
// 插入表格菜单
let tableInsertMenu = [
    { name: '左侧插入列', key: 'add_left'},
    { name: '右侧插入列', key: 'add_right'},
    { name: '在上方插入行', key: 'add_top'},
    { name: '在下方插入行', key: 'add_bottom'},
];
// 删除表格菜单
let tableDeleteMenu = [
    { name: '删除整行', key: 'delete_row'},
    { name: '删除整列', key: 'delete_line'},
    { name: '删除表格', key: 'delete_table'},
];
// 合并单元格菜单
let tableMergeMenu = [
    { name: '合并单元格', key: 'merge'},
    { name: '拆分单元格', key: 'split'},
];
let rotateMenu = [
    { name: '顺时针旋转90°', key: 'cw'},
    { name: '逆时针旋转90°', key: 'ccw'},
    { name: '水平翻转', key: 'horizontal'},
    { name: '垂直翻转', key: 'vertical'},
]
export default {
    name: '',
    inject: ['EditView'],
    props: ['config'],
    data() {
        return {
            // 是否展示菜单
            show: false,
            // 菜单样式（定位）
            panelStyle: null,
            // 右键菜单
            menuList: {
                page: [
                    {name: '粘贴', key: 'paste', shortcut: "Ctrl + V"},
                    {name: '全选', key: 'selectAll', shortcut: "Ctrl + A"},
                    {name: '更换背景', key: 'changeBackground'},
                    {name: '更换主题', key: 'changeTheme'},
                    {name: '切换效果', key: 'switchType'},
                    {name: '下载背景', key: 'downloadBackground'},
                    {type: 'split'},
                    {name: '评论', key: 'comment', shortcut: "C"},
                ],
                element: [
                    {name: '复制', key: 'copy', shortcut: "Ctrl + C"},
                    {name: '粘贴', key: 'paste', shortcut: "Ctrl + V"},
                    {name: '剪切', key: 'cut', shortcut: "Ctrl + X"},
                    {name: '全选', key: 'selectAll', shortcut: "Ctrl + A"},
                    {name: '复制样式', key: 'copyStyle', shortcut: "Ctrl + Alt + C"},
                    {name: '粘贴样式', key: 'pasteStyle', shortcut: "Ctrl + Alt + V"},
                    {type: 'split'},
                    {name: '组合', key: 'group', shortcut: "Ctrl + G"},
                    {name: '取消组合', key: 'groupSlip', shortcut: "Ctrl + Shift + G"},
                    {name: '层级', key: 'level', list: levelMenu},
                    {name: this.getAlignName, key: 'pageAlign', list: pageAlignMenu},
                    {name: '文本对齐', key: 'textAlign', list: textALignMenu},
                    {name: '旋转', key: 'rotate', list: rotateMenu},
                    {type: 'split', key: 'textAlign'},
                    {name: '插入表格', key: 'insertTable', list: tableInsertMenu},
                    {name: '删除表格', key: 'deleteTable', list: tableDeleteMenu},
                    {name: '合并单元格', key: 'mergeTable', list: tableMergeMenu},
                    {type: 'split', key: 'table'},
                    {name: this.getLinkName, key: 'link', shortcut: "Ctrl + K"},
                    {name: '添加动画', key: 'animate'},
                    {name: '编辑图片', key: 'image', list: imageMenu},
                    {type: 'split'},
                    {name: '评论', key: 'comment', shortcut: "C"},
                    {name: '锁定', key: 'lock', shortcut: "Ctrl + Shift + L"},
                    {name: '删除', key: 'delete', shortcut: "Del"},
                ],
                lock: [
                    {name: '解锁', key: 'unlock', shortcut: "Ctrl + Shift + L"},
                    {name: '复制', key: 'copy', shortcut: "Ctrl + C"},
                    {name: '粘贴', key: 'paste', shortcut: "Ctrl + V"},
                ],
            },
            page_align_type: 'element'
        }
    },
    watch: {
        config: {
            handler(n, o) {
                this.show = !!n;
                this.$nextTick(() => {
                    this.panelStyle = n ? `top:${n.y}px; left:${n.x}px` : '';
                })
            },
            deep: true
        }
    },
    computed: {
        // 菜单类型
        menuType() {
            let type = this.config && this.config.type;
            if (this.EditView.element_lock) type = 'lock';
            return type;
        },
        // 菜单是否展示
        menuShow() {
            return (key) => {
                if (!this.show) return false;
                let editor = this.EditView;
                let { element_type: type } = editor;
                switch (key) {
                    // 组合
                    case 'group':
                        return !editor.is_group && (type !== 'table' || !this.config.editor);
                    // 解除组合
                    case 'groupSlip':
                        return editor.is_group && (type !== 'table' || !this.config.editor);
                    case 'rotate':
                        return ['line', 'table', 'chart'].indexOf(type) === -1 && !editor.element_message.not_rotate
                    // 编辑图片
                    case 'image':
                        return type === 'img';
                    // 设置超链接
                    case 'link':
                        return type === 'text' || type === 'table';
                    // 下载画布背景
                    case 'downloadBackground':
                        return editor.page_info.background && editor.page_info.background.image && editor.page_info.background.image.src;
                    case 'level':
                    case 'pageAlign':
                        return type !== 'table' || !this.config.editor;
                    // 表格相关
                    case 'insertTable':
                    case 'deleteTable':
                    case 'mergeTable':
                    case 'table':
                        return type === 'table' && this.config.isEditor;
                    default:
                        return true;
                }
            }
        },
        // 菜单是否激活
        menuDisabled() {
            return (key, child) => {
                if (!this.show) return false;
                let editor = this.EditView;
                let { element_type: type } = editor;
                switch (key) {
                    // 粘贴
                    case 'paste':
                        return !editor.clipboard_api_support;
                    // 组合
                    case 'group':
                        return type !== 'group';
                    // 复制样式
                    case 'copyStyle':
                        return type === 'group';
                    // 粘贴样式
                    case 'pasteStyle':
                        return !editor.copy_format_storage;
                    // 文本对齐
                    case 'textAlign':
                        return ['text', 'shape', 'table'].indexOf(type) < 0;
                    case 'rotate':
                        if (child === 'vertical' || child === 'horizontal') {
                            return type === 'text';
                        } else {
                            return false;
                        }
                    case 'link':
                        return type === 'group';
                    case 'mergeTable':
                        let { tableMergeDisable: merge, tableSplitDisable: split } = this.config
                        if (child === 'merge') {
                            return merge;
                        } else if (child === 'split') {
                            return split;
                        } else {
                            return merge && split;
                        }
                    default:
                        return false;
                }
            }
        },
        // 快捷键
        shortcuts() {
            return (str) => {
                let keyArr = str.split(' + ');
                return keyArr;
            }
        }
    },
    mounted() {
        this.page_align_type = localStorage.getItem('woodo_page_align_type') || 'element';
    },
    methods: {
        close() {
            this.$emit('update:config', null);
        },
        // 菜单事件分发
        menuEvent(e, key) {
            let editor = this.EditView;
            let { isRange, isEditor } = this.config;
            switch (key) {
                // 更换背景
                case 'changeBackground':
                    editor.open_background_setting();
                    break;
                // 更换主题
                case 'changeTheme':
                    editor.open_theme_modal();
                    break;
                // 切换效果
                case 'switchType':
                    editor.open_transition_modal('page');
                    break;
                // 下载背景
                case 'downloadBackground':
                    editor.download_image();
                    break;
                // 评论
                case 'comment':
                    editor.$refs.editHead.add_comment();
                    break;
                // 复制
                case 'copy':
                    editor.ele_copy(e);
                    break;
                // 粘贴
                case 'paste':
                    editor.simulatedPaste();
                    break;
                // 剪切
                case 'cut':
                    editor.ele_cut(e);
                    break;
                // 全选
                case 'selectAll':
                    if (isRange || isEditor) {
                        document.execCommand('selectAll');
                    } else {
                        editor.ele_selectAll();
                    }
                    break;
                // 复制样式
                case 'copyStyle':
                    editor.ele_copy_format();
                    break;
                // 粘贴样式
                case 'pasteStyle':
                    editor.ele_paste_format();
                    break;
                // 组合/取消组合
                case 'group':
                case 'groupSlip':
                    editor.set_ele_group();
                    break;
                // 编辑链接
                case 'link':
                    editor.add_ele_link();
                    break;
                // 添加动画
                case 'animate':
                    let animation = editor.$refs.animation_modal;
                    animation && animation.show(() => {
                        let $ele = $('#page_contain #edit_page .ele_item.checked');
                        let uuid = $ele.attr('data-group') || $ele.attr('id');
                        let is_set = animation.get_element_is_animation(uuid);
                        if (is_set) {
                            animation.set_edit_animation(null, uuid);
                        } else {
                            animation.create_animation_open();
                        }
                    });
                    break;
                // 锁定/解锁
                case 'lock':
                case 'unlock':
                    editor.set_ele_lock();
                    break;
                // 删除
                case 'delete':
                    if (isRange) {
                        document.execCommand('delete');
                    } else {
                        editor.ele_delete();
                    }
                    break;
            }
            this.show = false;
        },
        // 子菜单事件分发
        childMenuEvent(e, parent, item) {
            let editor = this.EditView;
            let { key, type } = item;
            let $checked = '';
            switch (parent) {
                // 元素层级
                case 'level':
                    editor.set_ele_level(key);
                    break;
                // 画布对齐
                case 'pageAlign':
                    if (type === 'radio') {
                        this.page_align_type = key;
                        localStorage.setItem('woodo_page_align_type', key);
                    } else {
                        editor.$refs.FormatPanel.set_ele_align(key);
                    }
                    break;
                // 文本对齐
                case 'textAlign':
                    $checked = $('.page_contain .ele_item.checked');
                    editor.set_text_align($checked, key);
                    break;
                case 'rotate':
                    if (key === 'cw' || key === 'ccw') {
                        editor.$refs.FormatPanel.set_ele_rotate(key === 'cw' ? 90 : -90);
                    } else {
                        editor.$refs.FormatPanel.set_ele_reversal(key);
                    }
                    break;
                // 插入表格
                case 'insertTable':
                    editor.set_row_column(key);
                    break;
                // 删除表格
                case 'deleteTable':
                    editor.set_row_column(key);
                    break;
                // 合并表格
                case 'mergeTable':
                    editor.set_table_merge(key);
                    break;
                // 编辑图片
                case 'image':
                    this.imageEvent(e, key);
                    break;
            }
            this.show = false;
        },
        // 图片事件
        imageEvent(e, key) {
            let editor = this.EditView;
            switch (key) {
                case 'local':
                    editor.change_local_image(e.target, 'change');
                    break;
                case 'media':
                    editor.image_dblclick();
                    break;
                case 'background':
                    editor.set_bgimg();
                    break;
                case 'download':
                    editor.download_image('material');
                    break;
            }
        },
        // 获取对齐文案
        getAlignName() {
            return this.page_align_type === 'element' ? '元素对齐' : '画布对齐';
        },
        // 获取超链接文案
        getLinkName() {
            return this.EditView.alreadyHasLink ? '编辑链接' : '添加链接';
        }
    },
}
</script>
<style lang="less" scoped>
.right-menu-panel {
    width: 210px;
    padding: 8px 0;
    li {
        position: relative;
        white-space: nowrap;
        &:hover:not([disabled]) {
            > .list-item {
                background: #f6f6f9;
                > span i {
                    background: #ffffff;
                }
            }
            .child-list {
                display: block;
            }
        }
        &[disabled] {
            pointer-events: none;
            .list-item,
            i {
                color: #949496 !important;
            }
        }
    }
    .line {
        width: calc(100% - 60px);
        height: 1px;
        margin: 6px auto;
        background: #f6f6f9;
    }
    .list-item {
        height: 32px;
        line-height: 32px;
        padding: 0 30px;
        font-size: 12px;
        color: #242529;
        cursor: pointer;
        > span i {
            display: inline-block;
            width: auto;
            height: 20px;
            line-height: 20px;
            padding: 0 4px;
            margin-left: 4px;
            background: #f6f6f9;
            border-radius: 5px;
            text-align: center;
            color: #5f6063;
            font-size: 12px;
        }
    }
    .child-list {
        display: none;
        position: absolute;
        left: calc(100% + 4px);
        top: 0;
        width: 130px;
        padding: 8px 0;
        background: #ffffff;
        border: 1px solid #e3e6ec;
        border-radius: 5px;
        box-shadow: 0 5px 15px 0 rgba(214,216,221,0.30);
        &::before {
            content: "";
            position: absolute;
            left: -4px;
            top: 0;
            width: 4px;
            height: 100%;
        }
        .line {
            width: calc(100% - 40px);
            margin: 4px auto;
        }
        .list-item {
            padding: 0 20px;
            justify-content: flex-start;
        }
        .base-icon {
            margin-right: 10px;
            vertical-align: middle;
        }
        .radio {
            position: relative;
            display: inline-block;
            vertical-align: middle;
            width: 14px;
            height: 14px;
            border-radius: 50%;
            margin-right: 12px;
            border: 1px solid #949496;
            cursor: pointer;
            &.check {
                border-color: var(--mainColor);
                &::after {
                    content: "";
                    position: absolute;
                    top: calc(50% - 4px);
                    left: calc(50% - 4px);
                    width: 8px;
                    height: 8px;
                    background: var(--mainColor);
                    border-radius: 50%;
                }
            }
        }
        input {
            position: absolute;
            left: 0;
            width: 100%;
            height: 100%;
            opacity: 0;
            font-size: 0;
            cursor: pointer;
        }
    }
}
</style>