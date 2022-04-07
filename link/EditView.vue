<!--html模板-->
<template xmlns:v-clipboard="http://www.w3.org/1999/xhtml">
    <div class="edit_content" @mouseover="init_reload_interval" :class="edit_mode">
        <!-- 加载动画弹框 -->
        <loading_masking ref="loadingMasking" v-show="!document_loaddone"></loading_masking>
        <!-- 导出指引 -->
        <div class="export_guide" v-if="show_export_guide" @click="close_export_guide">
            <img src="../../assets/pc/images/edit/export_guide.png" />
        </div>
        <!-- 编辑器 || 自定义版式 头部 -->
        <edit-head class="edit_head" ref="editHead" :document_info="document_info" :page_info="page_info" @updateDocTitle="update_doc_title"></edit-head>
        <!-- 编辑器主体 -->
        <div class="edit_body_wrapper" :class="{'left-hide': !show_left_modal,}">
            <!-- 编辑器左侧栏 序列表 -->
            <div class="edit_left" :class="{close: !show_left_modal}">
                <base-handle ref="leftHandle" @handle="put_left_modal_away"></base-handle>
                <!-- 幻灯片列表 -->
                <sort_page_modal ref="sort_page_modal" :document_loaddone="document_loaddone" :document_info="document_info" :page_info="page_info" :document_page_list="document_page_list" :comment_map="comment_map"></sort_page_modal>
            </div>
            <!-- 画布主体 -->
            <div class="edit_body" ref="drag_page" :class="{
                    'box_select':  page_state === 'box_select',
                    'format_text': had_format_painter,
                    'draw': ['create_text', 'create_line', 'create_shape'].indexOf(page_state) >= 0
                }" :style="{'overflow': page_scale.user_set <= page_scale.suitable ? '' : 'auto'}">
                <div class="cancel_element" @click="ele_cancel_checked"></div>
                <div id="page" class="page">
                    <!-- 画布区域阴影 -->
                    <div class="page_shadow"></div>
                    <!-- 画布框选荧光框 -->
                    <div class="operate_mouse_select"></div>
                    <!-- 画布载体 -->
                    <div class="page-box">
                        <!-- 元素预插入层（与画布同尺寸同缩放比） -->
                        <div id="preinsert_mouse_icon" v-if="page_state === 'preinsert_layer'">
                            <div class="table-icon">
                                <base-icon class="iconbiaoge1"></base-icon>
                            </div>
                            <div class="chart-icon">
                                <base-icon class="iconquxiantu"></base-icon>
                            </div>
                        </div>
                        <div id="preinsert_layer" class="preinsert-layer" v-if="page_state === 'preinsert_layer'" :style="{'width': `${document_info.width}px`, 'height': `${document_info.height}px`, 'transform': `scale(${page_scale.user_set})`}">
                            <div class="preinsert_rect"></div>
                        </div>
                        <!-- 网格实体 -->
                        <svg id="grid-template-loader" class="grid-template-loader" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1">
                            <path :d="grid_path_value" fill="none" stroke="rgba(173, 173, 173, 0.31)" stroke-width="0.4" :shape-rendering="!low_browser_version ? 'crispEdges' : 'auto'" :style="{'transform': `scale(${page_scale.user_set})`}"></path>
                        </svg>
                        <!-- 画布 -->
                        <div id="page_contain" class="page_contain" :style="{cursor: (page_state === 'create_text' || page_state === 'create_line') ? 'crosshair' : ''}"></div>
                    </div>
                    <!-- 参考线 -->
                    <div class="reference_line vertical" v-for="item in reference_line_point.x" :key="item" :style="{'left': `${item}px`}"></div>
                    <div class="reference_line horizontal" v-for="item in reference_line_point.y" :key="item" :style="{'top': `${item}px`}"></div>
                </div>
                <!-- 模拟图片加载框(相对于 edit_body 居中) -->
                <div class="image_loading" v-show="show_image_loading">
                    <a href="javascript:;" @click="close_img_load"></a>
                    <img src="../../assets/pc/images/edit/image_load_bg.png" alt="">
                </div>
            </div>
            <!-- 编辑器底栏 -->
            <div class="edit_footer">
                <edit-footer ref="EditFooter" :page-scale="page_scale"></edit-footer>
            </div>
            <!-- 编辑器右侧栏 -->
            <div class="edit_right">
                <div class="edit_right_panel" v-show="right_panel_nav.length > 0">
                    <div class="edit_right_header flex flex-between">
                        <div class="panel_nav">
                            <span v-for="item in right_panel_nav" :key="item.key" :class="{'current': item.key === current_right_panel}" @click="change_right_panel(item)">{{ item.name }}</span>
                        </div>
                        <button class="close" @click="right_panel_nav = []">
                            <base-icon class="iconguanbi1" color="#999999" size="14"></base-icon>
                        </button>
                    </div>
                    <!-- 快捷键面板 -->
                    <template v-if="right_panel_status('keyboard') > -1" >
                        <keyboard-shortcuts v-show="current_right_panel === 'keyboard'"></keyboard-shortcuts>
                    </template>
                </div>
                <!-- 格式面板 -->
                <format-panel ref="FormatPanel" :edit_mode="edit_mode" :element_type="element_type" :is_group="is_group" :element_message="element_message" :user_disable="user_disable_edit" :hide_right="current_right_panel !== 'format'"></format-panel>
            </div>
            <!-- 全局设置弹框 -->
            <theme_modal ref="theme_modal" :document_info="document_info" :document_page_list="document_page_list" :doc_theme_list="doc_theme_list" :doc_font_list="doc_font_list" :doc_size_list="doc_size_list" :theme_checked="theme_checked"></theme_modal>
            <!-- 动效设置弹框 -->
            <animation_modal ref="animation_modal" :doc_info="document_info" :page_info="page_info" :document_page_list="document_page_list" @animationMarkEvent="get_animation_mark"></animation_modal>
            <!-- 切换页动画效果蒙层 -->
            <div class="switch_page_animation_container">
                <div class="switch_page_content">
                    <div class="switch_page_inner"></div>
                    <div class="switch_page_inner"></div>
                </div>
            </div>
            <!-- 背景色设置 -->
            <BackgroundSetting ref="background_setting" :page_info="page_info"></BackgroundSetting>
            <!-- 我的颜色弹框 -->
            <MyColor ref="my_color" @update_mycolor="update_mycolor_list"></MyColor>
        </div>
        <!-- 画布相关操作工具 -->
        <div class="edit_operation">
            <!-- 元素选中虚线框 -->
            <div id="operate" class="operate" :data-theme="border_style">
                <div class="operate_border t"></div>
                <div class="operate_border r"></div>
                <div class="operate_border b"></div>
                <div class="operate_border l"></div>
                <div class="group_child"></div>
                <div class="rotate">
                    <div class="show_degree" onselect="return false;">0°</div>
                    <img src="../../assets/pc/images/edit/rotate_handle.png">
                </div>
                <div class="resizable">
                    <span class="resize_handle tl" draggable="true" style="cursor: nwse-resize;"></span>
                    <span class="resize_handle t" draggable="true" style="cursor: ns-resize;"></span>
                    <span class="resize_handle tr" draggable="true" style="cursor: nesw-resize;"></span>
                    <span class="resize_handle r" draggable="true" style="cursor: ew-resize;"></span>
                    <span class="resize_handle br" draggable="true" style="cursor: nwse-resize;"></span>
                    <span class="resize_handle b" draggable="true" style="cursor: ns-resize;"></span>
                    <span class="resize_handle bl" draggable="true" style="cursor: nesw-resize;"></span>
                    <span class="resize_handle l" draggable="true" style="cursor: ew-resize;"></span>
                </div>
                <div class="resize_line">
                    <span class="point_left" @mousedown="line_change_point($event, 'left')"></span>
                    <span class="point_right" @mousedown="line_change_point($event, 'right')"></span>
                </div>
                <div class="cropper">
                    <!--svg 裁剪模板-->
                    <svg width="0" height="0">
                        <defs>
                            <clipPath id="operate_clip_path">
                                <path fill="transparent"></path>
                            </clipPath>
                        </defs>
                    </svg>
                    <!--动态设置图片宽高，与虚线框保持一致-->
                    <img src="" width="" height="" alt="裁剪图片" style="position: absolute; opacity: 0.3;">
                    <img src="" width="" height="" alt="裁剪图片" style="position: absolute; clip: rect(31.2199px, 228.02px, 143.883px, 85.4943px);">
                    <div class="cropper_hor_line"></div>
                    <div class="cropper_ver_line"></div>
                    <div id="clip_wrap" class="clip-wrap pos-ab" style="left:0; top: 0; width: 200px; height: 100px;">
                        <div data-direction="nw" class="clip-left-top-btn clip-btn ui-resizable-handle ui-resizable-nw"></div>
                        <div data-direction="ne" class="clip-right-top-btn clip-btn ui-resizable-handle ui-resizable-ne"></div>
                        <div data-direction="sw" class="clip-left-bottom-btn clip-btn ui-resizable-handle ui-resizable-sw"></div>
                        <div data-direction="se" class="clip-right-bottom-btn clip-btn ui-resizable-handle ui-resizable-se"></div>
                    </div>
                </div>
                <div class="operate_path_point"></div>
                <div class="unlock_icon" v-tooltip="`点击解锁<br/><p style='margin-top:2px; color:#949496; letter-spacing:.6px;'>Ctrl+Shift+L</p>`" v-if="element_lock" @click.stop="set_ele_lock" @mouseover="show_unlock = true" @mouseout="show_unlock = false">
                    <base-icon v-if="!show_unlock" class="iconsuotou" size="14" color="#ffffff"></base-icon>
                    <base-icon v-else class="iconjiesuo" size="14" color="#ffffff"></base-icon>
                </div>
            </div>
            <!-- 缩放数值 -->
            <div class="resize_number" v-if="['group','audio','line'].indexOf('element_type') < 0">
                {{ element_message.w }}x{{ element_message.h }}
            </div>
            <!-- 线条长度 -->
            <div class="line_length" v-if="line_length">
                {{ line_length}}
            </div>
            <!-- 组合元素选中模拟框 -->
            <div class="group_operate" :class="border_style"></div>
            <!-- 协作者编辑元素遮罩 -->
            <div class="editing_element_masking">
                <div class="item template"></div>
            </div>
            <!-- 协作者编辑提示框 -->
            <div class="element_tips"><span></span> 正在编辑</div>

            <!-- 右键菜单栏 -->
            <right-menu ref="RightMenu" :config.sync="right_menu_config"></right-menu>

            <!-- 元素超链接编辑栏 -->
            <!-- <div class="ele_link_tool" v-if="show_link_tool" ref="link_modal" :style="{top:ele_link_info.top + 'px', left: ele_link_info.left + 'px'}">
                <div class="link_default_panel" v-show="!show_link_change_modal">
                    <a :href="ele_link_info.href" target="_blank" rel="noreferrer noopener">{{ele_link_info.href}}</a>
                    <button class="change" @click="edit_link_panel">更改</button>
                    <button class="remove" @click="remove_ele_link">移除</button>
                </div>
            </div> -->
            <!-- 去除粘贴问题格式编辑栏 -->
            <div class="paste_clean_menu" v-if="show_paste_clean" :style="{top:text_clean_info.top + 'px', left: text_clean_info.left + 'px'}">
                <button @click="toggle_paste_clean_list" :class="{check: show_paste_clean_list}"><base-icon class="iconfuzhiwenben" size="18"></base-icon></button>
                <transition name="modal-fade">
                    <ul class="menu_list" v-show="show_paste_clean_list">
                        <li @click="text_format_operation('save')">保留源格式</li>
                        <li @click="text_format_operation('clean')">仅文本</li>
                    </ul>
                </transition>
            </div>
            <!-- 媒体控件 -->
            <div class="operate_media_container"></div>
            <!-- 动画元素标记点 -->
            <div class="animation-mark" v-for="(item, index) in animation_mark_list" :key="index" :data-id="item.uuid" :style="{ 'top': `${item.top}px`, 'left': `${item.left}px`, }">{{ item.index }}</div>
        </div>
        <!-- 超链接弹框 -->
        <!-- <transition name="modal-fade">
            <div class="ele_link_modal" v-if="show_ele_link_modal">
                <div class="modal_masking" @click="close_ele_link_modal"></div>
                <div class="modal_content" :class="{'center': ['text', 'cel_edit'].indexOf(element_type) < 0 || !can_change_text}">
                    <div class="modal_head" v-if="['text', 'cel_edit'].indexOf(element_type) >= 0 && can_change_text">
                        <span>文本</span>
                        <input type="text" class="ele_link_text" v-model="ele_link_info.text">
                    </div>
                    <div class="modal_body">
                        <span>链接</span>
                        <input type="text" class="ele_link_str" v-model="ele_link_info.href" placeholder="请输入网页链接地址">
                    </div>
                    <div class="modal_foot">
                        <button class="cancel" @click="close_ele_link_modal">取消</button>
                        <button class="submit" :class="{ 'disabled': !ele_link_info.text || !link_validate}" @click="set_ele_link">确定</button>
                    </div>
                </div>
            </div>
        </transition> -->
        <!-- 保存为模板弹框 -->
        <transition name="modal-fade">
            <div class="modal-backdrop" @click="toggle_save_template" v-if="save_template">
                <div class="save_as_template" @click.stop>
                    <div class="header">
                        <span>发布作品</span>
                        <a class="close" @click.stop="toggle_save_template"></a>
                    </div>
                    <div class="body">
                        <div class="block name">
                            <span class="title">名称</span>
                            <input type="text" ref="name" maxlength="20" placeholder="请输入模板名称" v-model="template_title">
                        </div>
                        <div class="block type">
                            <span class="title">类型</span>
                            <div class="type">
                                <span :class="{'active':current_template_type=='slides'}" @click="toggle_change_template_type('slides')">
                                    <i></i>模板中心
                                </span>
                                <span :class="{'active':current_template_type=='design'}" @click="toggle_change_template_type('design')">
                                    <i></i>设计实验室
                                </span>
                            </div>
                        </div>
                        <div class="block category">
                            <span class="title">分类</span>
                            <div class="category">
                                <p class="current_category" @click="toggleCategoryList">{{ current_template_category.name || '请选择分类'}}</p>
                                <div class="category_list">
                                    <publish-category :item="item" :id="current_template_category.id" v-for="(item, index) in template_category_list" :key="index" @chooseCate="chooseCategory($event)" />
                                </div>
                            </div>
                        </div>
                        <div class="block tag">
                            <span class="title">标签</span>
                            <div class="inner">
                                <span class="tag" v-for="(item, index) in current_tag_list" :key="index">
                                    {{ item }}
                                    <i @click="deleteTag(index)"></i>
                                </span>
                                <div class="custom_tag">
                                    <i></i>
                                    <input type="text" placeholder="自定义添加" @keyup.enter="addCustomTag($event)" @blur="addCustomTag($event)" />
                                </div>
                            </div>
                            <span class="add_btn" @click="toggleTagModal">标签库</span>
                        </div>
                    </div>
                    <div class="footer">
                        <button @click="toggle_save_template">取消</button>
                        <button id="template_save" v-if="!btn_confirm_disabled" @click="publish_works">提交审核</button>
                        <button id="template_save" v-else :disabled="btn_confirm_disabled">正在提交...</button>
                    </div>
                </div>
            </div>
        </transition>
        <!-- 标签库弹框 -->
        <transition name="modal-fade">
            <div class="add_tag_modal">
                <a href="javascript:void(0)" class="close" @click="toggleTagModal"></a>
                <div class="main">
                    <button class="submit" @click="confirmAddTag">保存</button>
                    <div class="wrap">
                        <p class="title">风格</p>
                        <div class="block">
                            <span class="tag" v-for="(item, index) in tag_list.style" :key="index" @click="chooseTag">{{ item.name }}</span>
                        </div>
                    </div>
                    <div class="wrap">
                        <p class="title">用途</p>
                        <div class="block">
                            <span class="tag" v-for="(item, index) in tag_list.use" :key="index" @click="chooseTag">{{ item.name }}</span>
                        </div>
                    </div>
                    <div class="wrap">
                        <p class="title">行业</p>
                        <div class="block">
                            <span class="tag" v-for="(item, index) in tag_list.industry" :key="index" @click="chooseTag">{{ item.name }}</span>
                        </div>
                    </div>
                    <div class="wrap">
                        <p class="title">颜色</p>
                        <div class="block">
                            <span class="tag" v-for="(item, index) in tag_list.color" :key="index" @click="chooseTag">{{ item.name }}</span>
                        </div>
                    </div>
                </div>
            </div>
        </transition>
        <!-- 恢复蒙层 -->
        <transition name="modal-fade">
            <div class="backup_recovery_masking" v-if="backup_recovery.show">
                <div class="backup_recovery_loading"></div>
                <span>{{backup_recovery.msg}}</span>
            </div>
        </transition>
        <!-- 免登陆编辑提示 -->
        <div class="unlogin_fixed_bottom" v-if="!user.login && user.login !== null">
            <p>HI~您当前处于游客状态，文档数据不会被保存，请登录后继续</p>
            <a href="javascript:void(0)" @click="login">登录</a>
        </div>
        <!-- 长时间未操作提示 -->
        <transition name="modal-fade">
            <div class="refresh" v-show="show_reload_tips">
                <p>您长时间未操作页面，为了保护您的数据安全，请刷新后继续。</p>
                <a href="javascript:window.location.reload();" class="btn">刷新</a>
            </div>
        </transition>
        <!-- 操作保存提示 -->
        <transition name="modal-fade">
            <div class="modal-backdrop" v-show="show_save_tips">
                <div class="save_doc_tip">
                    <h2 class="set_title">文档未保存</h2>
                    <div class="save_top"></div>
                    <p>当前文档未保存不可操作，请使用快捷键 <s>Ctrl+S</s> 保存后继续</p>
                    <a href="javascript:;" class="btn" @click="hide_save_tips">知道了</a>
                </div>
            </div>
        </transition>
        <!-- 拾色器 -->
        <CommonColor ref="common_color" @show_mycolor="show_mycolor_modal"></CommonColor>
        <!-- 渐变色设置面板 -->
        <GradientColor ref="gradient_color"></GradientColor>
        <!-- 删除弹框 -->
        <delete_modal ref="delete_modal"></delete_modal>
        <!-- h5 预览 弹窗 -->
        <h5_preview ref="h5_preview"></h5_preview>
        <!-- 文档演示页组件 -->
        <slides_document ref="slides_document" v-if="show_slides_preview" @close="out_slides_preview"></slides_document>
        <!-- 操作记录页面 -->
        <iframe name="history_iframe" :src="history_iframe_src" v-if="show_history_iframe"></iframe>
        <!-- 自由版式编辑页面 -->
        <iframe name="custom_preset_iframe" :src="custom_iframe_src" v-if="show_custom_iframe"></iframe>
        <!-- 虚拟复制节点，用于覆盖终端复制功能，不可见 -->
        <button id="fictitious_copy" type="button" v-clipboard:copy="fictitious_copy_text" v-clipboard:error="copy_error"></button>
        <!-- svg 复用模板，只提供内容引用，不可见 -->
        <svg width="0" height="0" style="display: none;" id="svg-element-template" class="svg-element-template">
            <!-- 颜色滤镜渲染 -->
            <defs>
                <filter id="filter_1b7cf3">
                    <feColorMatrix type="matrix" values="0 0 0 0 0.10588235294117647 0 0 0 0 0.48627450980392156 0 0 0 0 0.9529411764705882 0 0 0 1 0" />
                </filter>
            </defs>
        </svg>
        <!-- 登录弹框 -->
        <loginModal ref="loginModal" @success_callback="login_success"></loginModal>
        <!-- 我的空间 -->
        <my-space-modal ref="mySpaceModal" v-if="space_modal_show"></my-space-modal>
        <!-- 预设弹窗 -->
        <preset-modal ref="presetModal" v-if="preset_modal_show"></preset-modal>
        <!-- 媒体库 -->
        <media-modal ref="MediaModal" v-if="media_modal_show"></media-modal>
        <!-- 素材库 -->
        <material-modal ref="MaterialModal" v-if="material_modal_show"></material-modal>
    </div>
</template>

<!--css-->
<style lang="less" scoped>
@import url('~@/assets/pc/css/common.css');
@import url('~@/assets/pc/css/edit.css');
@import url('~@/assets/pc/images/edit/sprite/sprites.css');

@background_image: url('~@/assets/pc/images/edit/edit_sp_2.0.1.png');

@dark_operate: #cdcdcd;
@light_operate: #777777;
@lock_border: #0063fa;

@deep: ~'>>>';
.animation(@n:fly,@t:0.5s,@fn:ease-in-out,@i:1,@dur:normal) {
    animation: @n @t @fn @i @dur;
    -webkit-animation: @n @t @fn @i @dur;
    -o-animation: @n @t @fn @i @dur;
    -moz-animation: @n @t @fn @i @dur;
}
.edit_content {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: #f6f6f9;
    &.resizing {
        .show_text {
            cursor: move !important;
        }
    }
    // 编辑器 顶栏
    .edit_head {
        height: 48px;
    }

    .edit_body_wrapper {
        position: relative;
        display: inline-block;
        height: 100%;
        width: 100%;
        .edit_body {
            position: relative;
            display: inline-block;
            left: 172px;
            width: 100%;
            height: calc(100% - 48px);
            font-size: 0;
            .page {
                position: absolute;
                top: 50%;
                #preinsert_mouse_icon {
                    display: none;
                    position: fixed;
                    top: 0;
                    left: 0;
                    z-index: 7;
                    box-shadow: 0px 1.5px 2.5px 0px rgba(32, 75, 118, 0.43);
                    pointer-events: none;

                    .table-icon,
                    .chart-icon,
                    .base-icon{
                        display: none;
                    }

                    &.table{
                        width: 36px;
                        height: 36px;
                        opacity: 1;
                        background: #ffffff;
                        border-radius: 5px;
                        box-shadow: 0px 5px 15px 0px #c9d1df;
                        .table-icon{
                            display: flex;
                            width: 100%;
                            height: 100%;
                            .base-icon{
                                margin: auto;
                                display: block;
                                font-size: 26px;
                            } 
                        }
                    }

                    &.chart{
                        width: 36px;
                        height: 36px;
                        background: #ffffff;
                        border-radius: 5px;
                        box-shadow: 0px 5px 15px 0px #c9d1df;
                        .chart-icon{
                            display: flex;
                            width: 100%;
                            height: 100%;
                            .base-icon{
                                margin: auto;
                                display: block;
                                font-size: 24px;
                            } 
                        }
                    }
                }
                .preinsert-layer {
                    position: absolute;
                    top: 0;
                    left: 0;
                    z-index: 6;
                    width: 910px;
                    height: 512px;
                    transform-origin: 0 0;
                    transform: scale(1);
                    .preinsert_rect {
                        display: none;
                        position: absolute;
                        top: 0;
                        left: 0;
                        width: 0;
                        left: 0;
                        z-index: 7;
                        background-color: #b6d7fd;
                        opacity: 0.4;
                        pointer-events: none;
                    }
                }
                .grid-template-loader {
                    position: absolute;
                    top: 0;
                    left: 0;
                    z-index: 5;
                    width: 100%;
                    height: 100%;
                    pointer-events: none;
                    path {
                        opacity: 0;
                        transform-origin: 0 0;
                        transition: opacity 0.5s;
                    }
                }
                .reference_line {
                    position: absolute;
                    right: 0;
                    top: 50%;
                    transform: translateY(-50%);
                    width: 22px;
                    height: 22px;
                    img {
                        width: 100%;
                        height: 100%;
                        border-radius: 50%;
                    }
                }
                .partner-btn {
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    width: 22px;
                    height: 22px;
                    z-index: 4;
                    background: #ffffff;
                    border: 1px solid #eeeeee;
                    border-radius: 50%;
                    .base-icon {
                        font-size: 12px;
                        color: #999999;
                    }
                }
            }
        }
    }
    .edit_body_wrapper {
        position: relative;
        display: inline-block;
        height: 100%;
        width: 100%;
        &.left-hide {
            .edit_body {
                left: 0;
            }
            .edit_footer {
                width: 100%;
            }
        }
    }
    // 画布主体
    .edit_body {
        position: relative;
        display: inline-block;
        left: 172px;
        width: 100%;
        height: 100%;
        font-size: 0;
        transition: left .2s ease;
        .page {
            position: absolute;
            top: 50%;
            #preinsert_mouse_icon {
                display: none;
                position: fixed;
                top: 0;
                left: 0;
                z-index: 7;
                box-shadow: 0px 1.5px 2.5px 0px rgba(32, 75, 118, 0.43);
                pointer-events: none;

                .table-icon,
                .chart-icon,
                .base-icon{
                    display: none;
                }

                &.table{
                    width: 36px;
                    height: 36px;
                    opacity: 1;
                    background: #ffffff;
                    border-radius: 5px;
                    box-shadow: 0px 5px 15px 0px #c9d1df;
                    .table-icon{
                        display: flex;
                        width: 100%;
                        height: 100%;
                        .base-icon{
                            margin: auto;
                            display: block;
                            font-size: 26px;
                        } 
                    }
                }

                &.chart{
                    width: 36px;
                    height: 36px;
                    background: #ffffff;
                    border-radius: 5px;
                    box-shadow: 0px 5px 15px 0px #c9d1df;
                    .chart-icon{
                        display: flex;
                        width: 100%;
                        height: 100%;
                        .base-icon{
                            margin: auto;
                            display: block;
                            font-size: 24px;
                        } 
                    }
                }
            }
            .preinsert-layer {
                position: absolute;
                top: 0;
                left: 0;
                z-index: 6;
                width: 910px;
                height: 512px;
                transform-origin: 0 0;
                transform: scale(1);
                .preinsert_rect {
                    display: none;
                    position: absolute;
                    top: 0;
                    left: 0;
                    width: 0;
                    left: 0;
                    z-index: 7;
                    background-color: #b6d7fd;
                    opacity: 0.4;
                    pointer-events: none;
                }
            }
            .grid-template-loader {
                position: absolute;
                top: 0;
                left: 0;
                z-index: 5;
                width: 100%;
                height: 100%;
                pointer-events: none;
                path {
                    opacity: 0;
                    transform-origin: 0 0;
                    transition: opacity 0.5s;
                }
            }
            .reference_line {
                position: absolute;
                top: 0;
                left: 0;
                z-index: 2;
                &.vertical {
                    width: 0;
                    height: 100%;
                    border-left: 1px dashed var(--mainColor);
                }
                &.horizontal {
                    width: 100%;
                    height: 0;
                    border-top: 1px dashed var(--mainColor);
                }
            }
        }
        /*画布阴影*/
        .page_shadow {
            position: absolute;
            top: 0;
            left: 0;
            z-index: 1;
            box-shadow: 0 0 20px 0 rgba(0, 0, 0, 0.1);
        }
        /*画布主体*/
        .page_contain {
            position: relative;
            z-index: 2;
            user-select: none;
            * {
                user-select: none;
            }
        }
        /*图片加载蒙层*/
        .image_loading {
            position: absolute;
            top: 50%;
            left: 50%;
            z-index: 2;
            display: block;
            border: 1px dashed var(--mainColor);
            a {
                display: inline-block;
                position: absolute;
                right: 12px;
                top: 12px;
                width: 16px;
                height: 15px;
                opacity: 0.5;
                background: @background_image
                    no-repeat -348px -4px;
            }
            img {
                width: 100%;
            }
            &:after {
                content: '';
                position: absolute;
                top: 50%;
                left: 50%;
                display: inline-block;
                width: 50px;
                height: 50px;
                margin: -25px 0 0 -25px;
                background: url(../../assets/common/images/image_load.gif)
                    center no-repeat;
                background-size: 100%;
            }
        }
    }
    // 左侧栏
    .edit_left {
        position: absolute;
        left: 0;
        top: 0;
        width: 172px;
        height: 100%;
        text-align: center;
        transition: left 0.2s ease;
        &.close {
            left: -170px;
        }
    }
    // 右侧格式面板
    .edit_right {
        position: absolute;
        top: 0;
        right: 0;
        width: 300px;
        height: calc(100% - 40px);
        .edit_right_panel {
            position: absolute;
            top: 0;
            right: 0;
            width: 100%;
            height: 100%;
            background: #ffffff;
            z-index: 2;
        }
        .edit_right_header {
            padding-left: 20px;
            width: 100%;
            height: 48px;
            line-height: 48px;
            border-bottom: 1px solid #f6f6f9;
            .panel_nav {
                height: 100%;
                span{
                    margin-right: 30px;
                    font-size: 12px;
                    color: #5F6063;
                    cursor: pointer;
                    &:hover {
                        color: var(--mainColor);
                    }
                }
                .current {
                    color: #242429;
                    font-weight: 600;
                    cursor: default;
                    &:hover {
                        color: #242429;
                    }
                }
            }
            .close{
                width: 44px;
                height: 100%;
                line-height: 48px;
                text-align: center;
                border-left: 1px solid #f6f6f9;
                cursor: pointer;
                .base-icon {
                    transition: all .3s;
                }
                &:hover .base-icon {
                    transform: rotate(180deg);
                }
            }
        }
    }
    .edit_footer {
        position: absolute;
        right: 0;
        bottom: 0;
        z-index: 11;
        width: calc(100% - 172px);
        height: 40px;
        background-color: #ffffff;
        border-top: 1px solid #eeeeee;
    }
}

.cancel_element {
    width: 100%;
    height: 100%;
}
/* 元素选中虚线框 */
.operate {
    position: fixed;
    z-index: 9;
    display: none;
    user-select: none;
    pointer-events: none;
    outline: 1px dashed @light_operate;
    & > * {
        pointer-events: auto;
    }
    .operate_border {
        position: absolute;
        opacity: 0;
        cursor: move;
        &.t {
            top: -1px;
            left: 0;
            width: 100%;
            height: 1px;
        }
        &.r {
            right: -1px;
            top: 0;
            width: 1px;
            height: 100%;
        }
        &.b {
            bottom: -1px;
            left: 0;
            width: 100%;
            height: 1px;
        }
        &.l {
            left: -1px;
            top: 0;
            width: 1px;
            height: 100%;
        }
    }
    .group_child {
        position: absolute;
        top: 0;
        left: 0;
        width: 0;
        height: 0;
        &/deep/ .child {
            position: absolute;
            width: 0;
            height: 0;
            outline: 1px dashed @light_operate;
            cursor: move;
        }
    }
    .rotate {
        position: absolute;
        width: 20px;
        height: 20px;
        margin: -15px 0 0 0;
        cursor: url(../../assets/pc/images/edit/mouserotate.png) 8 8, default;
        .show_degree {
            position: absolute;
            left: 16px;
            top: calc(50% - 20px);
            display: none;
            font-size: 12px;
            text-align: center;
        }
        img {
            width: 100%;
            height: 100%;
        }
    }
    .resizable {
        span {
            position: absolute;
            z-index: 2;
            width: 10px;
            height: 10px;
            margin: -5px 0 0 -5px;
            border: 1px solid #a1a4ad;
            background: #fff;
            cursor: pointer;
            border-radius: 50%;
        }
    }
    .resize_line {
        display: none;
        span {
            position: absolute;
            display: inline-block;
            width: 14px;
            height: 14px;
            border: 3px solid #ffffff;
            border-radius: 10px;
            background: var(--mainColor);
            box-shadow: 0 2px 2px 0 rgba(0, 0, 0, 0.25);
            cursor: pointer;
        }
    }
    .cropper {
        position: absolute;
        top: 0;
        left: 0;
        bottom: 0;
        right: 0;
        display: none;
        .clip-wrap {
            position: absolute;
            cursor: move;
        }
        .clip-btn {
            position: absolute;
            width: 20px;
            height: 20px;
            &:before,
            &:after {
                content: '';
                position: absolute;
                display: block;
                border: 1px solid rgba(0, 0, 0, 0.67);
                background-color: #fff;
                box-shadow: 2px 2px 3px rgba(0, 0, 0, 0.25);
            }
        }
        .clip-left-top-btn {
            top: -8px;
            left: -8px;
            cursor: nw-resize;
            &:before {
                top: 2px;
                left: 2px;
                width: 3px;
                height: 13px;
            }
            &:after {
                top: 2px;
                left: 6px;
                width: 10px;
                height: 3px;
                border-left: none;
            }
        }
        .clip-right-top-btn {
            top: -8px;
            right: -8px;
            cursor: ne-resize;
            &:before {
                top: 2px;
                right: 3px;
                width: 3px;
                height: 13px;
                box-shadow: -2px 2px 3px rgba(0, 0, 0, 0.25);
            }
            &:after {
                right: 7px;
                bottom: 13px;
                width: 10px;
                height: 3px;
                border-right: none;
                box-shadow: -2px 2px 3px rgba(0, 0, 0, 0.25);
            }
        }
        .clip-left-bottom-btn {
            bottom: -8px;
            left: -8px;
            cursor: sw-resize;
            &:before {
                top: 2px;
                left: 2px;
                width: 3px;
                height: 13px;
            }
            &:after {
                top: 12px;
                left: 6px;
                width: 10px;
                height: 3px;
                border-left: none;
            }
        }
        .clip-right-bottom-btn {
            bottom: -8px;
            right: -8px;
            cursor: se-resize;
            &:before {
                right: 3px;
                bottom: 3px;
                width: 3px;
                height: 13px;
                box-shadow: -5px -2px 3px rgba(0, 0, 0, 0.25);
            }
            &:after {
                right: 7px;
                top: 12px;
                width: 10px;
                height: 3px;
                border-right: none;
                box-shadow: -2px -2px 3px rgba(0, 0, 0, 0.25);
            }
        }

        .cropper_hor_line {
            &:before,
            &:after {
                content: '';
                position: absolute;
                border: 0 dashed #a1a4ad;
            }
            &:before {
                left: 0;
                top: 0;
                width: 100%;
                border-top-width: 1px;
            }
            &:after {
                left: 0;
                bottom: 0;
                width: 100%;
                border-bottom-width: 1px;
            }
        }
        .cropper_ver_line {
            &:before,
            &:after {
                content: '';
                position: absolute;
                border: 0 dashed #a1a4ad;
            }
            &:before {
                left: 0;
                top: 0;
                height: 100%;
                border-left-width: 1px;
            }
            &:after {
                right: 0;
                top: 0;
                height: 100%;
                border-right-width: 1px;
            }
        }
    }
    @{deep} .path_point {
        position: absolute;
        top: 0;
        left: 0;
        width: 16px;
        height: 16px;
        margin: -8px 0 0 -8px;
        z-index: 2;
        cursor: nw-resize;
        &::before {
            content: '';
            position: absolute;
            top: 4px;
            left: 4px;
            width: 6px;
            height: 6px;
            border: 1px solid rgb(122, 90, 0);
            background-color: rgb(244, 180, 0);
            transform: rotate(45deg);
        }
        .linkline {
            position: absolute;
            top: 8px;
            left: 8px;
            z-index: -1;
            width: 0;
            height: 0;
            border: 1px dashed var(--mainColor);
            transform-origin: 0 0;
            opacity: 0.5;
            cursor: default;
        }
        &.radius {
            display: none;
            width: 10px;
            height: 10px;
            border-radius: 50%;
            margin: 10px 0;
            border: 1px solid var(--mainColor);
            background: #ffffff;
            cursor: default;
            &::before {
                top: 2px;
                left: 2px;
                width: 4px;
                height: 4px;
                transform: rotate(0deg);
                border: none;
                border-radius: 50%;
                background: var(--mainColor);
            }
            &#path_point_1 {
                margin-left: -10px;
            }
            &#path_point_2 {
                margin-top: -20px;
                margin-left: -10px;
            }
            &#path_point_3 {
                margin-top: -20px;
            }
        }
    }
    /* 多选元素中存在 文本、线条、表格时，禁止缩放 */
    &.disable_scale {
        .resizable,
        .resizable span {
            display: none !important;
        }
    }
    &.disable_scale_y {
        .resizable .resize_handle.t,
        .resizable .resize_handle.b {
            display: none !important;
        }
    }
    /* 多选元素中存在 表格、线条时，禁止旋转 */
    &.disable_rotate {
        .rotate {
            display: none !important;
        }
    }
    /* select_line 线条元素选中（只显示左右缩放按钮） */
    &.select_line {
        outline: none;
        .operate_border,
        .resize_handle {
            display: none;
        }
        .resize_line {
            display: block;
        }
    }
    /* select_text  文字元素选中（不显示垂直缩放按钮）*/
    &.select_text {
        .resizable .resize_handle.t,
        .resizable .resize_handle.b {
            display: none;
        }
        .operate_border {
            &.t {
                top: -5px;
                height: 15px;
            }
            &.r {
                right: -5px;
                width: 15px;
            }
            &.b {
                bottom: -5px;
                height: 15px;
            }
            &.l {
                left: -5px;
                width: 15px;
            }
        }
    }
    /* select_image  图片元素选中（不显示垂直、水平缩放按钮）*/
    &.select_img {
        outline-color: @light_operate;
        .resizable {
            span {
                position: absolute;
                width: 10px;
                height: 10px;
                border-radius: 50%;
                border: 0;
                cursor: pointer;
            }
            .tl {
                top: -7px;
                left: -7px;
                &:before {
                    content: '';
                    position: absolute;
                    width: 8px;
                    height: 8px;
                    left: 0;
                    top: 0;
                    border-radius: 50%;
                    border: 1px solid rgba(0, 0, 0, 0.5);
                }
            }
            .t {
                top: -7px;
                left: 50%;
                margin-left: -7px;
                &:before {
                    content: '';
                    position: absolute;
                    width: 14px;
                    height: 6px;
                    left: 0;
                    top: 0;
                    border-radius: 5px;
                    border: 1px solid rgba(0, 0, 0, 0.5);
                }
            }
            .tr {
                top: -7px;
                right: -7px;
                &:before {
                    content: '';
                    position: absolute;
                    width: 8px;
                    height: 8px;
                    left: 0;
                    top: 0;
                    border-radius: 50%;
                    border: 1px solid rgba(0, 0, 0, 0.5);
                }
            }
            .r {
                top: 50%;
                right: -7px;
                margin-top: -7px;
                &:before {
                    content: '';
                    position: absolute;
                    width: 6px;
                    height: 14px;
                    left: 0;
                    top: 0;
                    border-radius: 5px;
                    border: 1px solid rgba(0, 0, 0, 0.5);
                }
            }
            .br {
                bottom: -7px;
                right: -7px;
                &:before {
                    content: '';
                    position: absolute;
                    width: 8px;
                    height: 8px;
                    left: 0;
                    top: 0;
                    border-radius: 50%;
                    border: 1px solid rgba(0, 0, 0, 0.5);
                }
            }
            .b {
                bottom: -7px;
                left: 50%;
                margin-left: -7px;
                &:before {
                    content: '';
                    position: absolute;
                    width: 14px;
                    height: 6px;
                    left: 0;
                    top: 0;
                    border-radius: 5px;
                    border: 1px solid rgba(0, 0, 0, 0.5);
                }
            }
            .bl {
                bottom: -7px;
                left: -7px;
                &:before {
                    content: '';
                    position: absolute;
                    width: 8px;
                    height: 8px;
                    left: 0;
                    top: 0;
                    border-radius: 50%;
                    border: 1px solid rgba(0, 0, 0, 0.5);
                }
            }
            .l {
                left: -7px;
                top: 50%;
                margin-top: -7px;
                &:before {
                    content: '';
                    position: absolute;
                    width: 6px;
                    height: 14px;
                    left: 0;
                    top: 0;
                    border-radius: 5px;
                    border: 1px solid rgba(0, 0, 0, 0.5);
                }
            }
        }
        .cropper {
            position: absolute;
            top: 0;
            left: 0;
            bottom: 0;
            right: 0;
            display: none;
            .operate_hor_line,
            .operate_ver_line {
                display: none;
            }
            .clip-wrap {
                position: absolute;
                cursor: move;
            }
            .clip-btn {
                position: absolute;
                width: 20px;
                height: 20px;
                &:before,
                &:after {
                    content: '';
                    position: absolute;
                    display: block;
                    border: 1px solid rgba(0, 0, 0, 0.67);
                    background-color: #fff;
                    box-shadow: 2px 2px 3px rgba(0, 0, 0, 0.25);
                }
            }
            .clip-left-top-btn {
                top: -8px;
                left: -8px;
                cursor: nw-resize;
                &:before {
                    top: 2px;
                    left: 2px;
                    width: 3px;
                    height: 13px;
                }
                &:after {
                    top: 2px;
                    left: 6px;
                    width: 10px;
                    height: 3px;
                    border-left: none;
                }
            }
            .clip-right-top-btn {
                top: -8px;
                right: -8px;
                cursor: ne-resize;
                &:before {
                    top: 2px;
                    right: 3px;
                    width: 3px;
                    height: 13px;
                    box-shadow: -2px 2px 3px rgba(0, 0, 0, 0.25);
                }
                &:after {
                    right: 7px;
                    bottom: 13px;
                    width: 10px;
                    height: 3px;
                    border-right: none;
                    box-shadow: -2px 2px 3px rgba(0, 0, 0, 0.25);
                }
            }
            .clip-left-bottom-btn {
                bottom: -8px;
                left: -8px;
                cursor: sw-resize;
                &:before {
                    top: 2px;
                    left: 2px;
                    width: 3px;
                    height: 13px;
                }
                &:after {
                    top: 12px;
                    left: 6px;
                    width: 10px;
                    height: 3px;
                    border-left: none;
                }
            }
            .clip-right-bottom-btn {
                bottom: -8px;
                right: -8px;
                cursor: se-resize;
                &:before {
                    right: 3px;
                    bottom: 3px;
                    width: 3px;
                    height: 13px;
                    box-shadow: -5px -2px 3px rgba(0, 0, 0, 0.25);
                }
                &:after {
                    right: 7px;
                    top: 12px;
                    width: 10px;
                    height: 3px;
                    border-right: none;
                    box-shadow: -2px -2px 3px rgba(0, 0, 0, 0.25);
                }
            }
        }
    }
    /* clip_image  图片元素裁剪状态（禁止元素移动、缩放、旋转）*/
    &.clip_image {
        outline: none;
        .operate_border {
            display: none;
        }
        .cropper {
            display: block;
            .operate_hor_line,
            .operate_ver_line {
                display: block;
            }
        }
        & > .resizable {
            display: none;
        }
        .rotate {
            display: none;
        }
    }
    /* select_table 表格元素选中（不显示缩放按钮, 旋转按钮） */
    &.select_table:not(.lock) {
        outline-width: 8px;
        outline-style: solid;
        .operate_border {
            &.t {
                top: -8px;
                height: 8px;
            }
            &.r {
                right: -8px;
                width: 8px;
            }
            &.b {
                bottom: -8px;
                height: 8px;
            }
            &.l {
                left: -8px;
                width: 8px;
            }
        }
        .resize_handle.br {
            display: block;
            width: 9px;
            height: 9px;
            margin: -1px 0 0 -1px;
            border: 1px solid #a6a6a6;
        }
    }
    /* lock 锁定状态（禁止元素移动、缩放、旋转） */
    &.lock {
        outline-color: @lock_border;
        .group_child {
            &/deep/ .child {
                outline-color: @lock_border;
            }
        }
        .unlock_icon {
            position: absolute;
            right: -12px;
            top: -12px;
            width: 24px;
            height: 24px;
            background-color: @lock_border;
            border: 1px solid rgba(0, 0, 0, 0.2);
            border-radius: 50%;
            cursor: pointer;
            .base-icon {
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
            }
        }
        .resizable,
        .rotate,
        .operate_path_point,
        .resize_line {
            display: none !important;
        }
    }
    // 多选矩形外边框设置为实线
    &.multi_select {
        outline-style: solid;
    }
    &[data-theme='dark']:not(.lock):not(.select_table) {
        outline-color: @dark_operate;
        .group_child {
            &/deep/ .child {
                outline-color: @dark_operate;
            }
        }
    }
    &[data-theme='light']:not(.lock):not(.select_table) {
        outline-color: @light_operate;
        .group_child {
            &/deep/ .child {
                outline-color: @light_operate;
            }
        }
    }
}
/* 缩放数值 */
.resize_number,
.line_length {
    position: fixed;
    right: 0;
    top: 0;
    z-index: 9;
    display: none;
    width: 60px;
    width: min-content;
    height: 22px;
    line-height: 22px;
    padding: 0 5px;
    background-color: #202735;
    border-radius: 4px;
    opacity: 0.3;
    text-align: center;
    font-size: 10px;
    color: #ffffff;
}
/* 组合元素子元素选中模拟框 */
.group_operate {
    position: fixed;
    z-index: 9;
    display: none;
    user-select: none;
    pointer-events: none;
    outline: 1px dashed @light_operate;
    &.dark {
        outline-color: @dark_operate;
    }
    &.light {
        outline-color: @light_operate;
    }
}
/* 图片裁剪框 */
.cropper {
    .clip-wrap {
        position: absolute;
        cursor: move;
        .clip-btn {
            position: absolute;
            width: 20px;
            height: 20px;
            &:before,
            &:after {
                content: '';
                position: absolute;
                display: block;
                border: 1px solid rgba(0, 0, 0, 0.67);
                background-color: #fff;
                box-shadow: 2px 2px 3px rgba(0, 0, 0, 0.25);
            }
        }
        .clip-left-top-btn {
            top: -8px;
            left: -8px;
            cursor: nw-resize;
            &:before {
                top: 2px;
                left: 2px;
                width: 3px;
                height: 13px;
            }
            &:after {
                top: 2px;
                left: 6px;
                width: 10px;
                height: 3px;
                border-left: none;
            }
        }
        .clip-right-top-btn {
            top: -8px;
            right: -8px;
            cursor: ne-resize;
            &:before {
                top: 2px;
                right: 3px;
                width: 3px;
                height: 13px;
                box-shadow: -2px 2px 3px rgba(0, 0, 0, 0.25);
            }
            &:after {
                right: 7px;
                bottom: 13px;
                width: 10px;
                height: 3px;
                border-right: none;
                box-shadow: -2px 2px 3px rgba(0, 0, 0, 0.25);
            }
        }
        .clip-left-bottom-btn {
            bottom: -8px;
            left: -8px;
            cursor: sw-resize;
            &:before {
                top: 2px;
                left: 2px;
                width: 3px;
                height: 13px;
            }
            &:after {
                top: 12px;
                left: 6px;
                width: 10px;
                height: 3px;
                border-left: none;
            }
        }
        .clip-right-bottom-btn {
            bottom: -8px;
            right: -8px;
            cursor: se-resize;
            &:before {
                right: 3px;
                bottom: 3px;
                width: 3px;
                height: 13px;
                box-shadow: -5px -2px 3px rgba(0, 0, 0, 0.25);
            }
            &:after {
                right: 7px;
                top: 12px;
                width: 10px;
                height: 3px;
                border-right: none;
                box-shadow: -2px -2px 3px rgba(0, 0, 0, 0.25);
            }
        }
    }
}
/* 画布框选荧光框 */
.operate_mouse_select {
    position: absolute;
    top: 0;
    left: 0;
    z-index: 999;
    display: none;
    width: 0;
    height: 0;
    border: 1px solid rgba(54, 148, 206, 0.6);
}
/* 不可用按钮样式 */
.disable {
    cursor: not-allowed !important;
    /*协作管理按钮*/
    &.partner_button {
        background: #747d90;
        opacity: 0.8;
    }
    /*切换效果按钮*/
    &.doc_animation_list {
        opacity: 0.6 !important;
        &:not(.checked):hover {
            border-color: #bcc4d2 !important;
            background: #ffffff !important;
            color: #707b8e !important;
        }
    }
    /*更多下拉*/
    &.export,
    &.save_template,
    &.copy,
    &.action_list,
    &.import_ppt,
    &.delete {
        color: #ccc8c8 !important;
        &:hover {
            background: transparent !important;
            color: #ccc8c8 !important;
            span {
                color: #ccc8c8 !important;
            }
        }
        span {
            color: #ccc8c8 !important;
        }
    }
    /*左侧按钮*/
    &.left_button {
        opacity: 0.5 !important;
        &:hover {
            opacity: 0.5 !important;
        }
    }
    /*画布背景设置*/
    &.page_color:hover {
        background: transparent !important;
        &:before {
            background: @background_image
                no-repeat -61px -423px !important;
        }
    }
    /*画布背景设置*/
    &.copy_page:hover {
        background: transparent !important;
        &:before {
            background: @background_image
                no-repeat -93px -421px !important;
        }
    }
    /*画布背景设置*/
    &.delete_page:hover {
        background: transparent !important;
        &:before {
            background: @background_image
                no-repeat -121px -422px !important;
        }
    }
}
/*拖动手势*/
.grabbing {
    cursor: -webkit-grabbing !important;
}

/* 超链接修改工具栏 */
.ele_link_tool {
    position: absolute;
    width: 310px;
    height: auto;
    min-height: 40px;
    z-index: 9;
    border-radius: 4px;
    background: #fff;
    .link_default_panel {
        position: relative;
        padding: 14px;
        box-shadow: 0px 4px 10px 0 rgba(0, 0, 0, 0.1);
        border-radius: 4px;
        border: solid 1px rgba(229, 229, 229, 0.52);
        color: var(--mainColor);
        a {
            display: inline-block;
            max-width: 210px;
            color: var(--mainColor);
            font-size: 12px;
            overflow: hidden;
            white-space: nowrap;
            text-overflow: ellipsis;
        }
        button {
            position: absolute;
            top: 50%;
            width: 40px;
            height: 14px;
            line-height: 14px;
            margin-top: -7px;
            text-align: center;
            font-size: 12px;
            color: var(--mainColor);
            &:hover {
                opacity: 0.8;
            }
            &.change {
                right: 40px;
            }
            &.remove {
                right: 0;
                border-left: 1px solid var(--mainColor);
            }
        }
    }
    .link_change_panel {
        height: 150px;
        padding: 14px 23px 19px 20px;
        border-radius: 4px;
        box-shadow: 0px 4px 10px 0 rgba(0, 0, 0, 0.1);
        border: solid 1px rgba(229, 229, 229, 0.52);
        span {
            display: block;
            font-size: 12px;
            color: #a8a8a8;
        }
        input {
            width: 100%;
            height: 40px;
            line-height: 40px;
            padding-left: 10px;
            margin-top: 10px;
            font-size: 12px;
            color: #a8a8a8;
            background-color: #ffffff;
            border-radius: 4px;
            border: 1px solid #ddd;
            &:focus {
                border: 1px solid var(--mainColor);
            }
        }
        button {
            position: absolute;
            right: 23px;
            bottom: 19px;
            width: 75px;
            height: 34px;
            background: var(--mainColor);
            color: #fff;
            border-radius: 4px;
            font-size: 14px;
            text-align: center;
            transition: opacity 0.3s;
            &:hover {
                opacity: 0.8;
            }
        }
    }
}
/* 元素超链弹框 */
.ele_link_modal {
    position: fixed;
    top: 0;
    left: 0;
    z-index: 20;
    width: 100%;
    height: 100%;
    .modal_masking {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.6);
    }
    .modal_content {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        margin: auto;
        width: 380px;
        height: 206px;
        padding: 17px 29px;
        box-shadow: 0px 4px 9px 0px rgba(203, 205, 210, 0.34);
        border-radius: 4px;
        border: solid 1px #e5e8ee;
        overflow: hidden;
        background: #fff;
        &.center {
            height: 140px;
            .modal_body {
                margin: 20px 0 0;
            }
            .modal_foot {
                margin-top: 16px;
            }
        }
    }
    .modal_head,
    .modal_body {
        display: flex;
        justify-content: space-between;
        width: 100%;
        height: 36px;
        line-height: 36px;
        span {
            font-size: 14px;
            color: #3f4954;
        }
        input {
            display: inline-block;
            width: 274px;
            padding: 0 5px;
            border: solid 1px #dce1ec;
            border-radius: 2px;
            font-size: 12px;
            color: #5b5b5b;
            &::-webkit-input-placeholder {
                color: #ccd4dc;
                font-size: 14px;
            }
            &:focus {
                border-color: #0d7bf8;
            }
        }
    }
    .modal_head {
        margin: 7px 0 23px;
    }
    .modal_body {
        margin-bottom: 36px;
    }
    .modal_foot {
        height: 32px;
        margin-top: 36px;
        text-align: right;
        button {
            width: 66px;
            height: 32px;
            border: solid 1px #d6dfea;
            border-radius: 4px;
            background-color: var(--mainColor);
            color: #ffffff;
            font-size: 14px;
            text-align: center;
            &:hover {
                opacity: 0.8;
            }
            &.disabled {
                opacity: .6;
                cursor: no-drop;
            }
        }
        .cancel {
            height: 31px;
            color: #323c48;
            background-color: #ffffff;
            margin-right: 9px;
        }
    }
}
// 文本清除格式工具
.paste_clean_menu {
    position: absolute;
    z-index: 10;
    button {
        width: 36px;
        height: 36px;
        background-color: #f6f6f9;
        border: 1px solid #cdcfd2;
        border-radius: 10px;
        &:hover,
        &.check {
            color: var(--mainColor);
            border-color: var(--mainColor);
            background-color: #e6f1fe;
        }
    }
    .menu_list {
        position: absolute;
        top: 50px;
        width: 160px;
        height: 88px;
        padding: 8px 0;
        background-color: #ffffff;
        border: 1px solid #cdcfd2;
        border-radius: 8px;
    }
    li {
        width: 100%;
        height: 36px;
        line-height: 36px;
        padding: 0 20px;
        font-size: 12px;
        color: #242529;
        cursor: pointer;
        &:hover {
            background-color: #f6f6f9;
        }
    }
}
// 媒体控件样式
.operate_media_container {
    display: none;
    position: fixed;
    z-index: 9;
    width: 295px;
    top: -999px;
    left: -999px;
}
// 动画元素标记
.animation-mark {
    position: fixed;
    top: -999px;
    left: -999px;
    z-index: 9;
    width: 22px;
    height: 22px;
    line-height: 20px;
    margin: -22px 0 0 -22px;
    border: solid 1px #000000;
    border-radius: 50%;
    text-align: center;
    font-size: 12px;
    color: #000000;
    white-space: nowrap;
    &.checked {
        border-color: #757575;
        background-color: #757575;
        color: #ffffff;
    }
}

/* 协作者编辑元素遮罩 */
.editing_element_masking {
    width: 0;
    height: 0;
    .item {
        position: fixed;
        top: 0;
        left: 0;
        z-index: 8;
        width: 0;
        height: 0;
        border-radius: 0;
        &.checked {
            border: 1px dashed #a1a4ad;
        }
        &.show {
            animation: masking_show 0.4s;
        }
        @keyframes masking_show {
            0% {
                opacity: 1;
            }
            25% {
                opacity: 0;
            }
            50% {
                opacity: 1;
            }
            75% {
                opacity: 0;
            }
            100% {
                opacity: 1;
            }
        }
    }
}
/* 协作者编辑提示框 */
.element_tips {
    position: fixed;
    z-index: 9;
    display: none;
    height: 24px;
    line-height: 24px;
    padding: 0 10px;
    border-radius: 2px;
    font-size: 12px;
    color: #ffffff;
    text-align: center;
    &:before {
        content: '';
        position: absolute;
        left: 8px;
        width: 1px;
        height: 0;
        border-left: 4px solid transparent;
        border-right: 4px solid transparent;
    }
    &.top {
        &:before {
            bottom: -4px;
            border-top: 4px solid transparent;
            border-top-color: inherit;
        }
    }
    &.bottom {
        &:before {
            top: -4px;
            border-bottom: 4px solid transparent;
            border-bottom-color: inherit;
        }
    }
    span {
        font-weight: bold;
    }
}

/* 文档页背景设置弹框 */
.page_background_modal {
    position: absolute;
    top: -10px;
    right: 34px;
    width: 247px;
    text-align: left;
    border-radius: 4px;
    background: #ffffff;
    box-shadow: -2px 3px 8px 0px rgba(0, 0, 0, 0.08);
    &:hover {
        opacity: 1;
    }
    &:after {
        content: '';
        position: absolute;
        top: 12px;
        right: -7px;
        width: 8px;
        height: 20px;
        transform: rotate(0deg);
        background: @background_image no-repeat -275px -133px;
    }
    & > div {
        padding: 0 24px;
    }
    .set_title {
        position: relative;
        width: 100%;
        height: 52px;
        line-height: 52px;
        padding-left: 40px;
        cursor: pointer;
        span {
            font-size: 14px;
            color: #7d7d8b;
        }
        &:before {
            content: '';
            position: absolute;
            top: 50%;
            left: 0;
            background: @background_image
                no-repeat;
        }
        i {
            position: absolute;
            top: 50%;
            right: 0;
            display: inline-block;
            width: 15px;
            height: 15px;
            margin-top: -9px;
            border: 1px solid #dfdfdf;
            border-radius: 2px;
            font-size: 0;
        }
        &:hover {
            span {
                color: #000;
            }
            i {
                border-color: #111;
            }
        }
    }
    .set_page_color {
        position: relative;
        width: 100%;
        height: 53px;
        overflow: hidden;
        .set_title:before {
            width: 16px;
            height: 15px;
            margin-top: -8px;
            background-position: -208px -133px;
        }
        &:hover :before {
            background-position: -306px -133px;
        }
    }
    .background_unable {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 63px;
        background: rgba(0, 0, 0, 0.1);
    }
    .set_page_image {
        position: relative;
        width: 100%;
        border-top: 1px solid #dddddd;
        overflow: hidden;
        transition: height 0.5s;
        .set_title:before {
            width: 16px;
            height: 14px;
            margin-top: -7px;
            background-position: -239px -133px;
        }
        &:hover :before {
            background-position: -335px -133px;
        }
        &.checked {
            .set_title {
                i {
                    top: 20px;
                    width: 10px;
                    height: 10px;
                    margin-top: 0;
                    border: none;
                    background: @background_image
                        no-repeat -413px -5px;
                }
                i:hover {
                    top: 13px;
                    right: 0;
                    width: 40px;
                    height: 24px;
                    line-height: 24px;
                    border-radius: 24px;
                    background: #ff5f5f;
                    font-size: 12px;
                    font-style: initial;
                    color: #ffffff;
                    text-align: center;
                    cursor: pointer;
                }
            }
        }
        .show_page_image {
            width: 199px;
            height: auto;
            font-size: 0;
            text-align: center;
            &:hover button {
                opacity: 1;
            }
            button {
                position: absolute;
                left: calc(50% - 25px);
                top: calc(50% - 10px);
                opacity: 0;
                width: 50px;
                height: 28px;
                background: rgba(0, 0, 0, 0.5);
                border-radius: 3px;
                color: white;
                transition: opacity 0.3s;
                &:hover {
                    background: rgba(0, 0, 0, 0.7);
                }
            }
            img {
                display: inline-block;
                max-width: 100%;
                max-height: 100%;
                vertical-align: middle;
            }
            .set_page_image_type {
                margin: 15px 0;
                span {
                    position: relative;
                    font-size: 14px;
                    cursor: pointer;
                    &:hover {
                        opacity: 0.8;
                    }
                    &:first-child {
                        margin-right: 26px;
                    }
                    &::before {
                        content: '';
                        display: inline-block;
                        vertical-align: top;
                        width: 16px;
                        height: 16px;
                        margin-right: 9px;
                        border: 1px solid #e8e8e8;
                        border-radius: 4px;
                        background: #fff;
                        text-align: center;
                    }
                    i {
                        position: absolute;
                        left: 6px;
                        bottom: 6px;
                        color: var(--mainColor);
                    }
                }
            }
        }
    }
}
/*保存为模板*/
.save_as_template {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 480px;
    min-height: 200px;
    margin: auto;
    padding: 10px 35px 18px;
    border-radius: 2px;
    background: #ffffff;
    font-size: 0;
    .header {
        height: 48px;
        line-height: 48px;
        font-size: 16px;
        color: #333333;
        text-align: center;
        a {
            position: absolute;
            top: 12px;
            right: 12px;
            display: inline-block;
            width: 10px;
            height: 10px;
            background: @background_image
                no-repeat -480px -35px;
            transition: transform 0.3s;
            &:hover {
                transform: rotate(90deg);
            }
        }
    }
    .body {
        margin-top: 20px;
        padding-bottom: 35px;
        padding-left: 5px;
        font-size: 14px;
        text-align: center;
        .title {
            display: inline-block;
            line-height: 40px;
            margin-right: 41px;
            font-size: 14px;
            color: #333;
        }
        .block {
            margin-bottom: 10px;
            text-align: left;
            &:last-child {
                margin-bottom: 0;
            }
            * {
                vertical-align: middle;
            }
        }
        .block.name {
            input {
                display: inline-block;
                width: 270px;
                height: 40px;
                line-height: 40px;
                padding-left: 10px;
                border: 1px solid #dddddd;
                border-radius: 4px;
                font-size: 14px;
                color: #525151;
            }
        }
        .block.type {
            .type {
                display: inline-block;
                span {
                    margin-right: 10px;
                    &.active i {
                        border: 5px solid #0b7bf7;
                    }
                    i {
                        display: inline-block;
                        width: 16px;
                        height: 16px;
                        margin-right: 8px;
                        border-radius: 50%;
                        border: 1px solid #999;
                        -webkit-box-sizing: border-box;
                        box-sizing: border-box;
                    }
                }
            }
        }
        .block.category {
            .category {
                display: inline-block;
                position: relative;
                .current_category {
                    position: relative;
                    width: 270px;
                    line-height: 30px;
                    border: 1px solid #dddddd;
                    border-radius: 4px;
                    padding-left: 10px;
                    color: #525151;
                    cursor: pointer;
                    &::after {
                        width: 5px;
                        height: 5px;
                    }
                }
                .current_category::after {
                    content: '';
                    position: absolute;
                    top: 9px;
                    right: 8px;
                    width: 8px;
                    height: 8px;
                    border: 1px solid #7b7b7b;
                    border-left-color: transparent !important;
                    border-top-color: transparent !important;
                    transform: rotate(45deg);
                    transition: all 0.3s;
                }
                .category_list {
                    display: none;
                    position: absolute;
                    top: 30px;
                    left: 0;
                    width: 100%;
                    height: 200px;
                    border: 1px solid #dddddd;
                    border-radius: 5px;
                    background: #ffffff;
                    overflow: hidden auto;
                    z-index: 1;
                    span {
                        display: block;
                        position: relative;
                        line-height: 30px;
                        cursor: pointer;
                        &.current,
                        &:hover {
                            background-color: var(--mainColor);
                            color: #ffffff;
                            .arrow::after {
                                border-color: #ffffff;
                            }
                        }
                    }
                }
            }
        }
        .block.tag {
            .inner {
                display: inline-block;
                width: 270px;
                min-height: 100px;
                max-height: 160px;
                padding: 10px;
                border: 1px solid #dddddd;
                border-radius: 4px;
                cursor: text;
                overflow: hidden auto;
                .custom_tag {
                    display: inline-block;
                    width: 94px;
                    line-height: 26px;
                    height: 26px;
                    vertical-align: top;
                    * {
                        vertical-align: middle;
                    }
                    i {
                        display: inline-block;
                        width: 16px;
                        height: 16px;
                        margin-right: 5px;
                        vertical-align: middle;
                        background: url(../../assets/pc/images/edit/icons/add_3.png)
                            no-repeat;
                    }
                    input {
                        width: calc(100% - 30px);
                        height: 20px;
                        line-height: 20px;
                        &::placeholder {
                            color: #333;
                        }
                        &:focus {
                            border-bottom: 1px solid #333;
                        }
                    }
                }
                .tag {
                    display: inline-block;
                    position: relative;
                    padding: 0 15px;
                    line-height: 26px;
                    margin: 0 5px 10px 0;
                    background: var(--mainColor);
                    color: #ffffff;
                    border-radius: 20px;
                    cursor: default;
                    i {
                        position: absolute;
                        top: -7px;
                        right: -3px;
                        width: 16px;
                        height: 16px;
                        background: #d1d1d1
                            url(../../assets/pc/images/edit/icons/close_2.png)
                            no-repeat center;
                        border-radius: 50%;
                        cursor: pointer;
                        &:hover {
                            opacity: 0.85;
                        }
                    }
                }
            }
            .add_btn {
                position: relative;
                margin-left: 3px;
                cursor: pointer;
                &::before {
                    content: '';
                    display: inline-block;
                    width: 16px;
                    height: 16px;
                    margin-right: 5px;
                    vertical-align: middle;
                    background: url(../../assets/pc/images/edit/icons/add_3.png)
                        no-repeat;
                }
                &:hover {
                    opacity: 0.7;
                }
            }
        }
    }
    .footer {
        height: 40px;
        font-size: 0;
        text-align: center;
        button {
            display: inline-block;
            width: 90px;
            height: 40px;
            line-height: 40px;
            border-radius: 4px;
            background: #f6f6f6;
            font-size: 14px;
            color: #7d7d7d;
            &:last-child {
                margin-left: 28px;
                background: var(--mainColor);
                color: #ffffff;
            }
            &:hover {
                opacity: 0.8;
            }
        }
    }
}
/* 添加标签弹框 */
.add_tag_modal {
    display: none;
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    padding-top: 70px;
    background: #e7eff4;
    z-index: 100;
    text-align: center;
    overflow: hidden auto;
    z-index: 999;
    .close {
        position: absolute;
        right: 20px;
        top: 20px;
        width: 30px;
        height: 30px;
        background: url(../../assets/pc/images/edit/icons/close_3.png) no-repeat
            center;
        transition: all 0.3s;
        &:hover {
            transform: rotate(90deg);
        }
    }
    .main {
        display: inline-block;
        position: relative;
        width: 1060px;
        height: auto;
        margin: 0 auto 50px;
        background: transparent;
        text-align: left;
        .submit {
            position: absolute;
            right: 0;
            top: 0;
            width: 200px;
            line-height: 39px;
            background: var(--mainColor);
            color: #ffffff;
            border-radius: 4px;
            &:hover {
                opacity: 0.7;
            }
        }
        .wrap {
            margin-bottom: 20px;
            .title {
                line-height: 35px;
                margin-bottom: 10px;
                font-size: 16px;
                font-weight: bold;
            }
            .block {
                height: 200px;
                padding: 15px 15px 0;
                background: #ffffff;
                overflow: hidden auto;
                border-radius: 10px;
                .tag {
                    position: relative;
                    display: inline-block;
                    padding: 0 35px;
                    height: 35px;
                    line-height: 35px;
                    margin: 0 10px 10px 0;
                    background: #f5f4f9;
                    color: var(--mainColor);
                    font-size: 14px;
                    text-align: center;
                    border-radius: 50px;
                    text-overflow: ellipsis;
                    white-space: nowrap;
                    overflow: hidden;
                    cursor: pointer;
                    &.current,
                    &:hover {
                        background: var(--mainColor);
                        color: #ffffff;
                    }
                }
            }
        }
    }
}
/* 帮助资讯 */
.question_group {
    position: fixed;
    bottom: 40px;
    right: 20px;
    z-index: 12;
    width: 36px;
    height: 36px;
    overflow: hidden;
    &:hover {
        width: 135px;
        height: 50px;
        padding: 14px 0 0 99px;
        overflow: visible;
        .question_icon {
            background: url(../../assets/pc/images/edit/_pcsp_2.png) 0 0
                no-repeat;
        }
        .question_list {
            transition: opacity 0.3s;
            opacity: 1;
        }
    }
    .question_icon {
        display: block;
        width: 36px;
        height: 36px;
        cursor: pointer;
        background: url(../../assets/pc/images/edit/_pcsp_1.png) 0 0 no-repeat;
    }
    .question_list {
        position: absolute;
        bottom: 46px;
        right: 0;
        width: 135px;
        height: auto;
        border: 1px solid #f3f2f2;
        background-color: #fff;
        border-radius: 4px;
        opacity: 0;
        &:after {
            content: '';
            display: inline-block;
            position: absolute;
            bottom: -8px;
            right: 10px;
            border-top: 8px solid #fff;
            border-left: 8px solid transparent;
            border-right: 8px solid transparent;
        }
        li {
            position: relative;
            height: 48px;
            line-height: 48px;
            color: #797d88;
            font-size: 12px;
            cursor: pointer;
            &:hover {
                color: var(--mainColor);
            }
            &::before {
                content: '';
                display: inline-block;
                vertical-align: middle;
                margin: 0 15px 1px;
            }
            &.question {
                &::before {
                    width: 16px;
                    height: 16px;
                    background: @background_image
                        no-repeat -322px -544px;
                }
                &:hover::before {
                    background: @background_image
                        no-repeat -358px -544px;
                }
                & /deep/ .custom_service {
                    position: absolute;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    .service_icon {
                        position: static;
                        width: 100%;
                        height: 100%;
                        opacity: 0;
                    }
                    .service_contain {
                        cursor: default;
                    }
                }
            }
            &.errors {
                &::before {
                    width: 16px;
                    height: 15px;
                    background: @background_image
                        no-repeat -203px -584px;
                }
                &:hover::before {
                    background: @background_image
                        no-repeat -172px -584px;
                }
            }
            &.keyboard {
                &::before {
                    width: 16px;
                    height: 12px;
                    background: @background_image
                        no-repeat -394px -544px;
                }
                &:hover::before {
                    background: @background_image
                        no-repeat -430px -544px;
                }
            }
        }
    }
}
/* 未登录提示 */
.unlogin_fixed_bottom {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    z-index: 9999;
    height: 56px;
    text-align: center;
    color: #fff;
    font-size: 16px;
    background-color: #3970fb;
    p {
        display: inline-block;
        line-height: 56px;
    }
    a {
        display: inline-block;
        width: 70px;
        height: 32px;
        line-height: 32px;
        margin-left: 9px;
        color: #000000;
        font-family: MicrosoftYaHei-Bold;
        font-weight: bold;
        background-color: #ffde00;
        border-radius: 16px;
        &:hover {
            opacity: 0.9;
        }
    }
}
/* 长时间未操作提醒 */
.refresh {
    position: absolute;
    top: 13px;
    left: calc(50% - 200px);
    width: 400px;
    height: 30px;
    line-height: 30px;
    background-color: #fdf7d6;
    border-radius: 2px;
    text-align: center;
    p {
        display: inline;
        font-size: 12px;
        color: #9b783c;
    }
    a {
        margin-left: 10px;
        text-decoration: underline;
        font-size: 12px;
        color: #ed3b3c;
    }
}
/* 操作保存提示 */
.save_doc_tip {
    width: 510px;
    height: 400px;
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    margin: auto;
    background: #fff;
    border-radius: 6px;
    .save_title {
        position: absolute;
        top: 30px;
        width: 100%;
        font-size: 24px;
        color: #4c4b4b;
    }
    .save_top {
        width: 320px;
        height: 241px;
        background: url('../../assets/common/images/no_power_1.jpg') no-repeat
            center;
        margin: 0 auto;
    }
    h2 {
        margin-top: 20px;
        text-align: center;
    }
    p {
        text-align: center;
        font-size: 14px;
        color: #9aa0a4;
        s {
            font-weight: bold;
            text-decoration: none;
        }
    }
    .btn {
        width: 110px;
        height: 40px;
        display: block;
        margin: 34px auto 0 auto;
        line-height: 40px;
        background: var(--mainColor);
        color: #fff;
        border-radius: 19.5px;
        font-size: 14px;
        text-align: center;
        &:hover {
            opacity: 0.8;
        }
    }
}

/* 操作历史 */
iframe {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 9998;
}

// 自由版式
.custom.edit_content {
    .loading_animation_content,
    .sort_modal_contain {
        display: none;
    }
    .edit_left {
        background: #FFFFFF;
        &.close {
            width: 0;
        }
    }

    .left-hide .edit_body {
        left: 30px;
    }
    .right_menu {
        .menu_theme,
        .menu_switch,
        .menu_comment,
        .menu_animation {
            opacity: 0.3;
            pointer-events: none;
        }
    }
    @{deep} .template_panel,
    @{deep} .case_panel,
    @{deep} .design_collection,
    @{deep} .cases_collection {
        opacity: 0.3;
        pointer-events: none;
    }
}

// 导出指引
.export_guide {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 999;
    background: rgba(0, 0, 0, 0.6);
    img {
        position: absolute;
        right: 12px;
        top: 4px;
        cursor: pointer;
    }
}

.backup_recovery_masking {
    position: fixed;
    top: 0;
    left: 0;
    z-index: 999;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.5);
    text-align: center;
    .backup_recovery_loading {
        position: absolute;
        top: 50%;
        left: 50%;
        width: 4em;
        height: 4em;
        margin: -2em;
        background-color: var(--mainColor);
        -webkit-animation: backup_recovery_loading 1.2s infinite ease-in-out;
        animation: backup_recovery_loading 1.2s infinite ease-in-out;
    }
    span {
        position: absolute;
        top: 50%;
        left: 50%;
        display: inline-block;
        width: 80px;
        height: 20px;
        margin: 30px 0 0 -40px;
        font-size: 16px;
        color: #ffffff;
        &:last-child {
            width: 230px;
            margin: 60px 0 0 -115px;
        }
    }
}
@-webkit-keyframes backup_recovery_loading {
    0% {
        -webkit-transform: perspective(120px) rotateX(0deg) rotateY(0deg);
        transform: perspective(120px) rotateX(0deg) rotateY(0deg);
    }
    50% {
        -webkit-transform: perspective(120px) rotateX(-180.1deg) rotateY(0deg);
        transform: perspective(120px) rotateX(-180.1deg) rotateY(0deg);
    }
    100% {
        -webkit-transform: perspective(120px) rotateX(-180deg)
            rotateY(-179.9deg);
        transform: perspective(120px) rotateX(-180deg) rotateY(-179.9deg);
    }
}
@keyframes backup_recovery_loading {
    0% {
        -webkit-transform: perspective(120px) rotateX(0deg) rotateY(0deg);
        transform: perspective(120px) rotateX(0deg) rotateY(0deg);
    }
    50% {
        -webkit-transform: perspective(120px) rotateX(-180.1deg) rotateY(0deg);
        transform: perspective(120px) rotateX(-180.1deg) rotateY(0deg);
    }
    100% {
        -webkit-transform: perspective(120px) rotateX(-180deg)
            rotateY(-179.9deg);
        transform: perspective(120px) rotateX(-180deg) rotateY(-179.9deg);
    }
}

/* 打印状态 */
@media print {
    .edit_content {
        position: relative;
        height: auto;
        padding: 0;
    }
    .edit_head,
    .edit_left,
    .edit_body,
    .custom_service {
        display: none;
    }
}
</style>

<!--js-->
<script>
import Vue from 'vue';
import qs from 'qs';
import QRCode from 'qrcode';
import { parseSVG, makeAbsolute } from 'svg-path-parser';
import baseHandle from '@/components/base/base-handle.vue';
import loginModal from '@/components/LoginModal.vue';
import EditFooter from '@/views/pc/EditView/EditFooter.vue';
import FormatPanel from '@/views/pc/EditView/FormatPanel.vue';
import KeyboardShortcuts from '@/views/pc/EditView/KeyboardShortcuts.vue';
import animation_modal from '@/views/pc/EditView/AnimationPanel.vue';
import sort_page_modal from '@/views/pc/EditView/SortPageModal.vue';
import delete_modal from '@/components/DeleteModal.vue';
import loading_masking from '@/components/LoadingMasking.vue';
import MyColor from '@/views/pc/EditView/MyColorModal.vue';
import CommonColor from '@/views/pc/EditView/CommonColor.vue';
import GradientColor from '@/views/pc/EditView/GradientColor.vue';
import BackgroundSetting from '@/views/pc/EditView/BackgroundSettingPanel.vue';
import theme_modal from '@/views/pc/EditView/ThemeModal.vue';
import h5_preview from '@/components/H5Preview.vue';
import PublishCategory from '@/components/PublishCategory.vue';
import slides_document from './Slides/SlidesDocument.vue';
import EditHead from '@/views/pc/EditView/EditHead.vue';
import MySpaceModal from '@/views/pc/MySpace/MySpaceModal.vue';
import PresetModal from '@/views/pc/EditView/PresetModal/PresetModal.vue';
import MediaModal from '@/views/pc/EditView/Media/MediaModal.vue';
import MaterialModal from '@/views/pc/EditView/Material/MaterialModal.vue';
import RightMenu from '@/views/pc/EditView/RightMenu.vue';
import opt_factory from '@/assets/pc/js/opt/opt_factory.js';
import operate_opt from '@/assets/pc/js/opt/operate_opt.js';
import page_opt from '@/assets/pc/js/opt/page_opt.js';
import editor_opt from '@/assets/pc/js/opt/editor.js';
import document_save from '@/assets/pc/js/document_save.js';
import document_save_error from '@/assets/pc/js/document_save_error.js';
import document_command from '@/assets/pc/js/document_command.js';
import ws_client from '@/assets/common/js/ws_client.js'
import collaborate from '@/assets/common/js/collaborate.js'
import font_family_array from '@/assets/font/fontFamily.js';
import { edit_shape_point } from '@/assets/pc/js/opt/shape_edit_opt.js';
import { edit_line_point, draw_line_path } from '@/assets/pc/js/opt/line_edit_opt.js';
import sdk_api from '@/assets/sdk/api.js';
import member_rankauthorities from '@/assets/common/js/member_rankauthorities.js';
import document_old_data_handler from '@/assets/common/js/document_old_data_handler.js';
import aliyun_log from '@/assets/common/js/aliyun_log.js'
import linkPanel from '@/components/LinkPanel/LinkPanel.js';
Vue.use(QRCode);

export default {
    name: 'edit',
    provide() {
        return {
            EditView: this,
        }
    },
    metaInfo() {
        return {
            title: `${this.$store.state.metaInfo.title ? `${this.$store.state.metaInfo.title}-` : '未命名的文档-'}吾道幻灯片`,
            meta: [
                {
                    name: 'robots',
                    content: 'noindex,nofollow,noarchive'
                },
                {
                    property: 'og:title',
                    content: `${this.$store.state.metaInfo.title ? `${this.$store.state.metaInfo.title}-` : '未命名的文档-'}吾道幻灯片`
                },
                {
                    property: 'og:url',
                    content: this.$store.state.metaInfo.query ? `https://www.woodo.cn/edit/?docId=${this.$store.state.metaInfo.query}` : 'https://www.woodo.cn/edit/'
                },
            ]
        }
    },
    asyncData({ store, host, route }) {
        return store.dispatch('setMeta', { url: `${host}/api/common/document/url_info/`, params: { id: route.query.docId } });
    },
    components: {
        baseHandle,
        MyColor,             // 我的颜色
        CommonColor,         // 拾色器
        GradientColor,       // 渐变色设置
        loading_masking,     // 入场动画
        EditFooter,          // 编辑器底栏
        FormatPanel,        // 格式面板
        KeyboardShortcuts,   // 键盘快捷键
        sort_page_modal,     // 序列表
        theme_modal,         // 主题弹框
        animation_modal,     // 动画弹框
        BackgroundSetting,   // 背景色设置
        delete_modal,        // 删除弹框
        h5_preview,
        slides_document,     // 文档演示
        loginModal,          // 登录弹框
        PublishCategory,     // 设计师发布作品分类的递归组件
        EditHead,            // 顶栏
        PresetModal,        // 预设弹窗
        MySpaceModal,       // 我的空间
        MediaModal,         // 媒体库
        MaterialModal,      // 素材库
        RightMenu,          // 右键菜单面板
    },
    data() {
        return {
            // api标识（用于灰度更新提示）
            api_sign: null,
            // 低版本浏览器标识
            low_browser_version: false,
            // 登录标识
            user: {
                login: null,
                role: collaborate.authority_map.owner.id
            },
            mousewheel_throttle: false,
            // 展示导出指引
            show_export_guide: false,
            // 定时器id队列
            timer_id_stack: {},
            // 加载状态
            document_loaddone: false,
            // 文档观察者
            document_observer: null,
            //文档信息
            document_info: {
                id: null,
                uuid: null,
                sign: null,
                fId: null,
                teamfId: null,
                documentType: "slides",
                title: null,
                url: null,
                background: {
                    type: 'color',
                    color: '#ffffff',
                    image: null
                },
                shapeColor: '#42464b',
                textColor: '#42464b',
                font: null,
                width: 910,
                height: 512,
                modifyDate: '未保存',
                editCount: null,
                switchType: null,
                attr: null
            },
            //当前文档页
            page_info: {
                id: null,
                uuid: null,
                sign: null,
                title: null,
                background: {
                    type: 'color',
                    color: '#ffffff',
                    image: null
                },
                switchType: 'fadeInAndOut',
                isLock: false,
                elementList: [],
                pageNumber: 1,
                attr: null,
            },
            //文档页列表
            document_page_list: [],
            // 当前模板信息
            modal_id: null,
            // 是否使用主题颜色标识
            use_theme: false,
            // 副本保存位置
            target_folder_info: {},
            // 编辑器模式 （自由编辑）
            edit_mode: '',
            preset_id: null,
            // 长时间未操作相关
            show_reload_tips: false,
            // 操作为保存相关
            show_save_tips: false,

            // 艺术字观察者
            art_text_observer: null,

            /** 画布网格数据 && 参考线数据 */
            // 网格线坐标
            grid_size: {
                s: 14,
                m: 28,
                l: 56,
            },
            grid_model: {
                small: {
                    x: [],
                    y: [],
                },
                middle: {
                    x: [],
                    y: [],
                },
                large: {
                    x: [],
                    y: [],
                },
            },
            // (small || middle || large) = 开启
            grid_using: false,
            grid_path_value: '',
            // 自动吸附坐标
            autofit_point: {
                x: [],
                y: [],
            },
            // 参考线渲染坐标
            reference_line_point: {
                x: [],
                y: [],
            },

            /**
            *   画布状态标识 page_state
            *   正常状态 => common
            *   编辑元素 => edit_element
            *   框选画布 => box_select
            *   创建文本 => create_text
            *   创建线条 => create_line
            *   创建形状 => create_shape
            *   预插入状态 => preinsert_layer
            **/
            page_state: 'common',
            // 鼠标悬浮画布标识
            page_hover: false,
            // 画布缩放相关
            page_scale: {
                // 当前屏幕下适配的比例
                suitable: null,
                // 用户设置的比例
                user_set: null,
                // 设置的比例是否小于合适比例标识
                less: true,
                // 百分比数值
                percent_text: null,
            },

            // 左侧工具栏
            show_left_modal: true,

            // 右键菜单，右键类型： false(关闭) | page(画布) | element(元素),
            right_menu_config: null,

            /* 元素相关信息 */
            // 元素格式信息
            element_message: {},
            // 当前元素类型
            element_type: '',
            // 组合标识
            is_group: false,
            select_group_child: false,
            // 元素锁定标识
            element_lock: false,
            // 锁定元素双击
            dblclick_flag: false,

            /** 复制粘贴相关 */
            // 剪切板相关
            clipboard_api_support: false,
            fictitious_copy_text: '',    // 隐藏剪贴按钮文案
            // 剪贴板粘贴数量限制
            clipboard_paste_action: 0,
            clipboard_paste_count: 0,
            clipboard_paste_max_count: 20, //连续粘贴元素最大次数

            // 粘贴文本去除格式工具标识
            paste_textformat_map: {},
            show_paste_clean: false,
            show_paste_clean_list: false,
            before_clean_html: [],
            text_clean_info: {
                top: "",
                left: ""
            },
            // 复制样式存储
            copy_format_storage: null,

            // 光标定位
            cursor_position: {
                prev_range: {
                    page_info_uuid: null,
                    element: null,
                    startOffset: 0,
                    startContainer: null,
                    endOffset: 0,
                    endContainer: null,
                    checked_elements: []
                },
                next_range: {
                    page_info_uuid: null,
                    element: null,
                    startOffset: 0,
                    startContainer: null,
                    endOffset: 0,
                    endContainer: null,
                    checked_elements: []
                }
            },
            // 输入中文标识
            is_composition: false,

            // 图片上传相关
            show_image_loading: false,
            stop_build_image: false,
            image_batch_onload: [],

            // 格式刷标识
            had_format_painter: false,
            stay_format_painter: false,
            format_painter_style: null,
            formatPainterIsArt: null,  // 格式刷样式是否为艺术字

            // 主题弹框相关
            show_custom_scale: false,
            theme_checked: {
                width: "",
                height: ""
            },
            doc_font_list: font_family_array.family_theme,
            doc_theme_list: [
                {
                    name: '默认',
                    background: { color: '#ffffff', image: null, type: 'color' },
                    font: '#42464b',
                    shape: '#42464b',
                    shape_text: '#ffffff',
                    checked: false
                },
                {
                    name: '雪白',
                    background: { color: '#fefefe', image: null, type: 'color' },
                    font: '#222222',
                    shape: '#000000',
                    shape_text: '#ffffff',
                    checked: false
                },
                {
                    name: '黛蓝',
                    background: { color: '#415065', image: null, type: 'color' },
                    font: '#ffffff',
                    shape: '#000000',
                    shape_text: '#ffffff',
                    checked: false
                },
                {
                    name: '天蓝',
                    background: { color: '#35a2cd', image: null, type: 'color' },
                    font: '#ffffff',
                    shape: '#0c5999',
                    shape_text: '#ffffff',
                    checked: false
                },
                {
                    name: '月白',
                    background: { color: '#fefefe', image: null, type: 'color' },
                    font: '#222222',
                    shape: '#5d82ba',
                    shape_text: '#ffffff',
                    checked: false
                },
                {
                    name: '鹅黄',
                    background: { color: '#fff244', image: null, type: 'color' },
                    font: '#222222',
                    shape: '#232d05',
                    shape_text: '#ffffff',
                    checked: false
                },
                {
                    name: '绛紫',
                    background: { color: '#8c4357', image: null, type: 'color' },
                    font: '#ffffff',
                    shape: '#c49a41',
                    shape_text: '#ffffff',
                    checked: false
                },
                {
                    name: '黎色',
                    background: { color: '#6f5e42', image: null, type: 'color' },
                    font: '#ffffff',
                    shape: '#53432c',
                    shape_text: '#ffffff',
                    checked: false
                },
                {
                    name: '沙青',
                    background: { color: '#1e4c6f', image: null, type: 'color' },
                    font: '#ffffff',
                    shape: '#ffcfb6',
                    shape_text: '#ffffff',
                    checked: false
                },
                {
                    name: '墨灰',
                    background: { color: '#657984', image: null, type: 'color' },
                    font: '#ffffff',
                    shape: '#464d52',
                    shape_text: '#ffffff',
                    checked: false
                },
                {
                    name: '酡颜',
                    background: { color: '#f99070', image: null, type: 'color' },
                    font: '#ffffff',
                    shape: '#d1ad88',
                    shape_text: '#ffffff',
                    checked: false
                },
                {
                    name: '藏青',
                    background: { color: '#2e4e7d', image: null, type: 'color' },
                    font: '#ffffff',
                    shape: '#dfaa00',
                    shape_text: '#ffffff',
                    checked: false
                },
                {
                    name: '牙色',
                    background: { color: '#d5c4a4', image: null, type: 'color' },
                    font: '#222222',
                    shape: '#697586',
                    shape_text: '#ffffff',
                    checked: false
                },
                {
                    name: '乌黑',
                    background: { color: '#211c23', image: null, type: 'color' },
                    font: '#ffffff',
                    shape: '#c0b9a2',
                    shape_text: '#ffffff',
                    checked: false
                },
                {
                    name: '朱红',
                    background: { color: '#ff4c02', image: null, type: 'color' },
                    font: '#ffffff',
                    shape: '#000000',
                    shape_text: '#ffffff',
                    checked: false
                },
                {
                    name: '缁色',
                    background: { color: '#43292a', image: null, type: 'color' },
                    font: '#ffffff',
                    shape: '#c3a043',
                    shape_text: '#ffffff',
                    checked: false
                },
                {
                    name: '石青',
                    background: { color: '#7acfa6', image: null, type: 'color' },
                    font: '#222222',
                    shape: '#333333',
                    shape_text: '#ffffff',
                    checked: false
                },
                {
                    name: '钴色',
                    background: { color: '#5b89a0', image: null, type: 'color' },
                    font: '#ffffff',
                    shape: '#df9636',
                    shape_text: '#ffffff',
                    checked: false
                },
                {
                    name: '漆黑',
                    background: { color: '#171925', image: null, type: 'color' },
                    font: '#ffffff',
                    shape: '#ffffff',
                    shape_text: '#171925',
                    checked: false
                },
                {
                    name: '精白',
                    background: { color: '#ffffff', image: null, type: 'color' },
                    font: '#222222',
                    shape: '#005a6f',
                    shape_text: '#ffffff',
                    checked: false
                },
                {
                    name: '竹青',
                    background: { color: '#759564', image: null, type: 'color' },
                    font: '#ffffff',
                    shape: '#333333',
                    shape_text: '#ffffff',
                    checked: false
                },
                {
                    name: '靛青',
                    background: { color: '#187db1', image: null, type: 'color' },
                    font: '#ffffff',
                    shape: '#c47a11',
                    shape_text: '#ffffff',
                    checked: false
                },
                {
                    name: '赤金',
                    background: { color: '#dfb044', image: null, type: 'color' },
                    font: '#222222',
                    shape: '#d0614c',
                    shape_text: '#ffffff',
                    checked: false
                },
                {
                    name: '绾色',
                    background: { color: '#93716b', image: null, type: 'color' },
                    font: '#ffffff',
                    shape: '#b898a4',
                    shape_text: '#ffffff',
                    checked: false
                },
                {
                    name: '墨色',
                    background: { color: '#3b434d', image: null, type: 'color' },
                    font: '#ffffff',
                    shape: '#00cfdf',
                    shape_text: '#ffffff',
                    checked: false
                },
                {
                    name: '胭脂',
                    background: { color: '#942a32', image: null, type: 'color' },
                    font: '#ffffff',
                    shape: '#d29090',
                    shape_text: '#ffffff',
                    checked: false
                },
                {
                    name: '象牙白',
                    background: { color: '#dfdbd4', image: null, type: 'color' },
                    font: '#222222',
                    shape: '#86a1ad',
                    shape_text: '#ffffff',
                    checked: false
                },
                {
                    name: '鸦青',
                    background: { color: '#424b50', image: null, type: 'color' },
                    font: '#ffffff',
                    shape: '#355b5e',
                    shape_text: '#ffffff',
                    checked: false
                },
                {
                    name: '铜绿',
                    background: { color: '#549688', image: null, type: 'color' },
                    font: '#ffffff',
                    shape: '#333333',
                    shape_text: '#ffffff',
                    checked: false
                },
                {
                    name: '蓝灰',
                    background: { color: '#8f98aa', image: null, type: 'color' },
                    font: '#ffffff',
                    shape: '#11bfce',
                    shape_text: '#ffffff',
                    checked: false
                },
                {
                    name: '茶色',
                    background: { color: '#b35d44', image: null, type: 'color' },
                    font: '#ffffff',
                    shape: '#2e4155',
                    shape_text: '#ffffff',
                    checked: false
                },
                {
                    name: '品红',
                    background: { color: '#c70042', image: null, type: 'color' },
                    font: '#ffffff',
                    shape: '#424246',
                    shape_text: '#ffffff',
                    checked: false
                },
            ],
            doc_size_list: [
                { name: '宽屏幻灯片', width: 910, height: 512, ratio_w: 16, ratio_h: 9, checked: false },
                { name: '标准幻灯片', width: 910, height: 693, ratio_w: 4, ratio_h: 3, checked: false },
                { name: 'A4封面', width: 1240, height: 1754, ratio_w: false, ratio_h: false, checked: false },
                { name: '公众号封面首图', width: 900, height: 383, ratio_w: false, ratio_h: false, checked: false },
                { name: '手机海报', width: 640, height: 1008, ratio_w: false, ratio_h: false, checked: false },
                { name: '邀请函', width: 720, height: 1280, ratio_w: false, ratio_h: false, checked: false },
                { name: '画册', width: 1191, height: 731, ratio_w: false, ratio_h: false, checked: false },
                { name: '微信朋友圈', width: 1280, height: 1184, ratio_w: false, ratio_h: false, checked: false },
                { name: '宣传单', width: 595, height: 808, ratio_w: false, ratio_h: false, checked: false },
                { name: '主图直通车', width: 800, height: 800, ratio_w: false, ratio_h: false, checked: false },
                { name: '自定义', width: false, height: false, ratio_w: false, ratio_h: false, checked: false, hide: true },
            ],

            // 保存为模板相关
            save_template: false,
            btn_confirm_disabled: false,     //按钮状态
            template_title: '',
            template_limit: [
                { name: '仅支持自己使用', authority: 'privacy', checked: true },
                { name: '支持网友使用', authority: 'open', checked: false }
            ],

            // 元素超链接相关
            show_ele_link_modal: false,         // 显示超链接工具栏标识
            show_link_tool: false,              // 显示超链接工具栏标识
            show_link_change_modal: false,
            can_change_link: false,
            can_change_text: true,
            alreadyHasLink: false,
            current_link_dom: "",
            ele_link_info: {                    // 当前超链接信息
                text: "",
                link: "",
                page: ""
            },

            // 操作历史
            history_iframe_src: '',
            show_history_iframe: false,

            // 自由版式
            custom_iframe_src: '',
            show_custom_iframe: false,
            custom_preset_saving: false,

            // 撤回/重做相关标识
            cannot_undo: false,
            cannot_redo: false,
            // 幻币
            doc_hcoin: 0,

            // 协作者相关
            partner_action: [],                           // 协作者正在操作 - 枚举
            checked_id_arr: {},                           // 已被其他人选中的元素id，已文档页id为标识
            partner_authority: [],                        // 协作权限列表
            interim_authority: {
                // 当前文档已添加的协作成员
                partner: [],
                // 新添加协作者列表
                added_partner: [],
                // 最近协作者列表
                recommend_partner: [],
                // 搜索结果
                search_result: [],
                // 搜索关键词
                search_keyword: '',
            },                                            // 添加协作者对象
            document_option_authority: [],                // 当前用户操作权限
            partnerList: [],
            page_authority: {
                edit: 'documentEdit',
                rename: 'documentRename',
                comment: 'documentReviewEdit',
                set_authority: 'documentCollaborateEdit',
                share: 'documentAuthorityView',
                export: 'documentExport',
                save_template: 'templateSave',
                copy: 'documentCopy',
                import: 'documentImport',
                delete: 'documentTmpDelete',
                give_hcoin: 'hcoinLog',
            },
            user_disable_edit: false,
            user_authority_type: 'owner',

            // 评论相关
            comment_map: {},            // 对应文档页的评论数

            // 动画元素标记列表
            animation_mark_list: [],

            // 演示预览
            show_slides_preview: false,

            // 右侧面板相关
            right_panel_nav: [],
            current_right_panel: null,
            keyboard_shortcut_history: [],
            group_align_history: '',

            // 备份恢复
            backup_recovery: {
                show: false,
                msg: '正在恢复备份',
                timer: null,
            },

            //websocket
            ws_client_method: {},
            ws_tmp_commands: [],
            save_document_flag: false,     // 快捷键保存标示（控制高频触发）
            copy_element_flag: 0,         // 快捷键复制标示（控制高频触发）
            line_length: null,           // 线条两个端点之间的距离

            current_template_type: null,
            template_category_list: [],   // 模板分类列表
            current_template_category: { name: null, id: null }, // 选中的模板分类
            current_tag_list: [],  // 选中的标签
            tag_list: {},           // 全部标签列表
            show_unlock: false,    // 是否显示解锁图标

            // 我的空间
            space_modal_show: false,
            // 预设弹窗
            preset_modal_show: false,
            material_modal_show: false,
            media_modal_show: false,
            user_personal_config: null,
            media_play_memory: {}
        }
    },
    watch: {
        clipboard_paste_action: {
            handler(value) {
                let that = this;
                that.clipboard_paste_count++;
                if (that.clipboard_paste_count > that.clipboard_paste_max_count) {
                    that.clipboard_paste_count = 0;
                    that.clear_ele_paste();
                }
            }
        },
        select_group_child: function () {
            if (this.select_group_child) {
                $(".group_operate").show()
            } else {
                $(".group_child_operate").hide()
            }
        },
        // 用户编辑权限监听
        user_disable_edit: function () {
            let that = this;
            if (that.user_disable_edit) {
                // 设置画布缩放
                page_opt.set_page_scale(that);
            }
        },
        page_state(n, o) {
            // 从元素预插入定位状态退出清除网格线
            if (o === 'preinsert_layer') {
                this.toggle_grid_display();
            }
        },
        new_right_panel_nav(n, o) {
            if ((o.length === 0 && n.length > 0) || (o.length > 0 && n.length === 0)) {
                let $ele = $('.page_contain .ele_item.checked');
                // 重新计算画布缩放
                page_opt.save_page_offset(this);
                // 更新屏幕最佳比例
                this.compute_suitable_scale();
                // 重新选中
                this.set_ele_checked($ele);
            }
            if (this.$refs.FormatPanel.show_format_panel && this.right_panel_status('format') < 0) {
                this.$refs.FormatPanel.show_format_panel = false;
                this.current_right_panel = '';
            }
        }
    },
    computed: {
        page_gradientStr: function () {
            if (this.page_info.background.type === 'gradient') {
                return opt_factory.init_opt('group').gradient_obj_2_style(this.page_info.background.color);
            }
        },
        document_gradientStr: function () {
            if (this.document_info.background.type === 'gradient') {
                return opt_factory.init_opt('group').gradient_obj_2_style(this.document_info.background.color);
            }
        },
        // 判断背景颜色是深色系还是浅色系调整矩形边框颜色
        border_style: function () {
            let color = this.page_info.background.color;
            if (typeof color !== 'string') return;
            color = opt_factory.init_opt('group').fn.color_exchange_function('hex', color);
            color = opt_factory.init_opt('group').fn.parse_rgba(color);
            if (Number(color.r) * 0.299 + Number(color.g) * 0.578 + Number(color.b) * 0.114 >= 192) { // 浅色系
                return 'light';
            } else { // 深色系
                return 'dark';
            }
        },
        new_right_panel_nav() {
            return JSON.parse(JSON.stringify(this.right_panel_nav));
        },
        right_panel_status() {
            return function(type) {
                let index = this.right_panel_nav.findIndex(i => i.key === type);
                return index;
            }
        }
    },
    created() {
        sdk_api.init(this);
    },
    mounted() {
        const that = this;
        // 检查api标识
        that.check_api_sign();
        // 免登陆编辑
        let docId = that.$route.query.docId;
        if (!docId) {
            that.$axios.defaults.customConfig['pageSource'] = 'edit';
            $(document).ajaxSend((evt, request, settings) => {
                if (request.customConfig) {
                    request.customConfig['pageSource'] = 'edit';
                } else {
                    request.customConfig = {};
                    request.customConfig['pageSource'] = 'edit';
                }
            });
        }
        // 展示导出指引
        if (window.localStorage.getItem('woodoExportGuide') === 'show') that.show_export_guide = true;
        // 获取登录信息
        that.update_login_state();
        // 协作初始化
        that.ws_init();
        // 初始化文档数据
        that.init_document_data();
        // 页面初始化(只执行一次)
        that.page_initial();
        // 判断浏览器信息
        that.judge_browser();
        // 长时间未操作提示
        that.init_reload_interval();
        // 获取协作者权限列表
        let authority = Object.values(collaborate.authority_map);
        authority.shift();
        that.partner_authority = authority;
        // 获取剪贴板Api支持状态
        that.clipboard_update_support();
        // 设置富文本功能使用css
        document.execCommand("styleWithCSS", false, true);
        window.onbeforeunload = function (e) {
            e = e || window.event;
            let micro = utils.getCookies('cookie_micro');
            let msg = '检测到部分操作未保存，确定要离开吗？';
            if (!micro && document_save.method.get_command_queue_length() > 0) {
                Object.assign(e, { msg });
                return msg;
            }
        };
        // 需要在节点渲染完之后再绑定事件，否则有些组件不会被获取到
        that.$nextTick(() => {
            // 绑定事件初始化
            that.page_event_initial();
        })
    },
    methods: {
        check_api_sign: function () {
            let that = this;
            let i = setInterval(function () {
                let old_api_sign = that.api_sign;
                let new_api_sign = sessionStorage.getItem('api_sign');
                // 初始化
                if (old_api_sign === null) {
                    that.api_sign = new_api_sign;
                    return;
                }
                // 相等
                if (old_api_sign === new_api_sign) {
                    return;
                }
                // 检查文档指令是否发送完毕
                let len = document_save.method.get_command_queue_length();
                if (len > 0) {
                    return;
                }
                // 显示引导刷新提示弹框
                that.$modal({
                    modalClass: 'api_sign',
                    modalTitle: '提示',
                    modalContent: '系统已发布新版本，请刷新后继续',
                    showCancel: false,
                    showSubmit: true,
                    showClose: false,
                    buttonSubmitTxt: '立刻体验',
                    submitCallback: () => {
                        location.reload(true);
                    },
                });
                that.api_sign = new_api_sign;
                clearInterval(i);
            }, 5 * 1000);
        },
        /*全局方法 start*/
        //复制失败
        copy_error: function (e) {
            let that = this;
            that.$nextTick(function () {
                if (!that.$copyText) {
                    return;
                }
                that.$copyText(e.text).then((suc) => {
                }, (err) => {
                    if (err && typeof err === 'object' && err.hasOwnProperty('action') && err.hasOwnProperty('text')) {
                    } else {
                        that.$toast('复制失败', 800);
                    }
                });
            })
        },
        // 粘贴监听 (isSimulation 是否为拷贝操作)
        paste_listener: function (event, isSimulation) {
            let that = this;
            let $target = $(event.target);
            let $ele = $('.page_contain .ele_item.checked');
            let $focus = $(":focus");
            let option = opt_factory.init_opt('group');
            let is_editable = $target && ($target.hasClass('show_text') || $target.parents('.show_text').length > 0);
            let is_table = $ele.attr('data-type') === 'table' && ($ele.find('.cel_selected').length > 0 || $ele.find('.cel_edit').length > 0);
            let is_other_input = $focus.length > 0 && ['INPUT', 'TEXTAREA', 'DIV'].indexOf($focus[0].tagName) >= 0 && $focus.parents('.ele_item').length === 0;
            let paste_obj = {};
            // 无关粘贴
            if (is_other_input) {
                return;
            }
            // 剪切板数据类型判断&抽取
            paste_obj = that.clipboard_data_handle(event, isSimulation);
            if (!paste_obj) return;
            // 拷贝忽略富文本
            if (isSimulation && paste_obj.type === 'text') return;
            // 表格内粘贴
            if (is_table) {
                switch (paste_obj.type) {
                    //富文本粘贴
                    case 'text':
                        // 框选单元格粘贴
                        if ($ele.find('.cel_selected').length > 0 && $ele.find('.cel_edit').length <= 0) {
                            option = opt_factory.init_opt('table');
                            option.paste_text_to_cel($ele, paste_obj.value);
                        } else {
                            // 粘贴纯文本
                            document.execCommand('insertHTML', false, paste_obj.value);
                        }
                        break;
                    // 单元格粘贴
                    case 'element':
                        option = opt_factory.init_opt('table');
                        option.paste_cel_content($ele, paste_obj.value);
                        break;
                }
                // 阻止浏览器黏贴事件
                event.preventDefault();
            }
            // 可编辑输入框
            else if (is_editable && paste_obj.type === 'text') {
                let focusElem = $(":focus")[0];
                if (focusElem && window.getComputedStyle(focusElem).fontSize === '0px') {
                    let $wrap = $('<div>/<div>');
                    $wrap.html(paste_obj.value);
                    $wrap.children().css('font-size', '14px');
                    paste_obj.value = $wrap[0].innerHTML;
                }
                // 粘贴富文本
                document.execCommand('insertHTML', false, paste_obj.value);
                // 阻止浏览器黏贴事件
                event.preventDefault();
                // 触发富文本输入监听
                that.input_listener();
            }
            // 画布粘贴
            else {
                // 粘贴次数限制
                that.clipboard_paste_action++;
                // 选中画布情况下粘贴内容时重置画布状态
                that.page_state = 'common';
                // 取消元素选中
                that.ele_cancel_checked();
                switch (paste_obj.type) {
                    // 生成图片元素
                    case 'file':
                        // 上传图片
                        that.upload_img(paste_obj.value);
                        break;
                    // 生成文本元素
                    case 'text':
                        let text_opt = opt_factory.init_opt('text'),
                            text_obj = option.fn.clone_object(text_opt.template),
                            $content = $(text_obj.content),
                            text_wdith;
                        $content.html(paste_obj.value);
                        // 设置主题色/字体
                        if (paste_obj.value.indexOf('style') < 0) {
                            if (text_opt.using_data.family) $content.css('fontFamily', text_opt.using_data.family);
                            if (text_opt.using_data.color) $content.css('color', text_opt.using_data.color);
                        }
                        // 计算文本长度
                        $('body').append($content);
                        text_wdith = $content.width();
                        $content.remove();
                        text_obj.width = text_wdith > 900 ? 900 : text_wdith;
                        text_obj.content = $content.prop('outerHTML');
                        text_obj = that.ele_build_before_format(text_obj);
                        that.ele_paste({ list: [text_obj], outside: true }, { center: true }, paste_obj);
                        break;
                    // 生成svg元素
                    case 'svg':
                        let shape_opt = opt_factory.init_opt('shape'),
                            shape_obj = shape_opt.format_paste_shape(paste_obj.text).element_list;
                        shape_obj.forEach(item => {
                            item = that.ele_build_before_format(item);
                        });
                        that.ele_paste({ list: shape_obj }, { center: true, resize: true }, paste_obj);
                        break;
                    // 生成表格元素
                    case 'table':
                        let table_opt = opt_factory.init_opt('table'),
                            table_obj = table_opt.format_paste_table(paste_obj.text, paste_obj.value);
                        table_obj = that.ele_build_before_format(table_obj);
                        // 生成表格对象
                        let table = table_opt.build_obj(table_obj, that);
                        that.ele_paste({ list: [table] }, { center: true }, paste_obj);
                        break;
                    // 生成站内元素
                    default:
                        let deviation = false;
                        let ele_opt = paste_obj.value;
                        if (typeof ele_opt.list === 'string') ele_opt.list = JSON.parse(ele_opt.list);
                        // 判断是否在当前页（当前页需设置偏移）
                        if (ele_opt.pageUuid == that.page_info.uuid) deviation = true;
                        that.ele_paste(ele_opt, { deviation: deviation }, paste_obj);
                        break;
                }
                event.preventDefault();
            }
            //粘贴元素次数定时器
            setInterval(function () {
                that.clipboard_paste_count = 0;
            }, 5 * 1000);
        },
        // 按键监听
        keydown_listener: function (event) {
            let that = this;
            let e = event || window.event;
            let target = event.target;
            // 演示弹框显示状态下，快捷键失效
            if (that.show_slides_preview) return;

            let code = e.keyCode;
            let ctrl = e.ctrlKey || (e.metaKey && utils.deviceENV().mac);
            let shift = e.shiftKey;
            let alt = e.altKey;
            // 禁止浏览器缩放快捷键，火狐上61是- 173是+
            if (ctrl && [189, 187, 109, 107, 61, 173].indexOf(code) >= 0) {
                e.preventDefault();
            }
            let group_opt = opt_factory.init_opt('group');
            let get_checked_ele = group_opt.get_checked_element();
            let $checked = get_checked_ele.element;
            let $focus = $('[contenteditable="true"]:focus');
            let has_focus = !!$focus.length;
            let option = opt_factory.init_opt(get_checked_ele.type);
            let $child = $('.operate .child');
            let Format = that.$refs.FormatPanel;
            let Tool = that.$refs.editHead;
            let message = that.element_message;
            // Esc退出格式刷
            if (code === 27) {
                e.preventDefault();
                that.had_format_painter = false;
                that.format_painter_style = null;
                // 退出吸色
                that.$refs.common_color && that.$refs.common_color.remove_color_picker();
                // 画布退出绘制状态
                that.page_state = '';
                return;
            }
            // 编辑文本时禁止ctrl+s
            if (code === 83 && ctrl) {
                e.preventDefault();
            }
            // input 元素使用系统默认按键操作
            if (target.nodeName === 'INPUT' || target.nodeName === 'TEXTAREA') {
                return;
            }
            // 吸色状态下，无法使用其他快捷键
            if ($('#color-picker-canvas').length) {
                return;
            }
            /**
             * ctrl + code --------------------------------------------------
             */
            if (ctrl && !shift && !alt) {
                /**
                 * 始终触发的快捷键 --------------------------------------------------
                 */
                switch (code) {
                    // Ctrl + B 加粗
                    case 66:
                        Format.set_font_weight();
                        e.preventDefault();
                        break;
                    // Ctrl + I 斜体
                    case 73:
                        Format.set_font_italic();
                        e.preventDefault();
                        break;
                    // Ctrl + U 下划线
                    case 85:
                        Format.set_font_underline();
                        e.preventDefault();
                        break;
                    // Ctrl + Enter 删除线
                    case 13:
                        Format.set_font_linethrough();
                        e.preventDefault();
                        break;
                    // Ctrl + ↑ 增大行高
                    case 38:
                        let changePrevPage = () => {
                            let prevIndex = that.document_page_list.findIndex(i => i.uuid === that.page_info.uuid);
                            page_opt.set_sort(that, { after_uuid: prevIndex < 2 ? null : that.document_page_list[prevIndex - 2].uuid, order_uuids: [that.page_info.uuid] });
                        }
                        if ($checked.length) {
                            let isText = true;
                            $checked.each((i ,item) => {
                                if (item.getAttribute('data-type') !== 'text') {
                                    isText = false;
                                    return false;
                                }
                            })
                            if (isText) {
                                Format.set_font_lineHeight(+message.line_height + 0.1);
                            } else {
                                changePrevPage();
                            }
                        } else {
                            changePrevPage();
                        }
                        e.preventDefault();
                        break;
                    // Ctrl + ↓ 缩小行高
                    case 40:
                        let changeNextPage = () => {
                            let nextIndex = that.document_page_list.findIndex(i => i.uuid === that.page_info.uuid);
                            if (nextIndex < that.document_page_list.length - 1) page_opt.set_sort(that, { after_uuid: that.document_page_list[nextIndex + 1].uuid, order_uuids: [that.page_info.uuid] });
                        }
                        if ($checked.length) {
                            let isText = true;
                            $checked.each((i ,item) => {
                                if (item.getAttribute('data-type') !== 'text') {
                                    isText = false;
                                    return false;
                                }
                            })
                            if (isText) {
                                Format.set_font_lineHeight(+message.line_height - 0.1);
                            } else {
                                changeNextPage();
                            }
                        } else {
                            changeNextPage();
                        }
                        e.preventDefault();
                        break;
                    // Ctrl + ←/↑ 向上移动幻灯片
                    case 37:
                        let prevIndex = that.document_page_list.findIndex(i => i.uuid === that.page_info.uuid);
                        page_opt.set_sort(that, { after_uuid: prevIndex < 2 ? null : that.document_page_list[prevIndex - 2].uuid, order_uuids: [that.page_info.uuid] });
                        e.preventDefault();
                        break;
                    // Ctrl + →/↓ 向下移动幻灯片
                    case 39:
                        let nextIndex = that.document_page_list.findIndex(i => i.uuid === that.page_info.uuid);
                        if (nextIndex < that.document_page_list.length - 1) page_opt.set_sort(that, { after_uuid: that.document_page_list[nextIndex + 1].uuid, order_uuids: [that.page_info.uuid] });
                        e.preventDefault();
                        break;
                    // Ctrl + < 缩小字间距
                    case 188:
                        Format.set_font_spacing(+message.letter_spacing - 0.1);
                        e.preventDefault();
                        break;
                    // Ctrl + > 增大字间距
                    case 190:
                        Format.set_font_spacing(+message.letter_spacing + 0.1);
                        e.preventDefault();
                        break;
                    // 清除格式
                    case 32:
                        that.text_format_operation('clean');
                        e.preventDefault();
                        break;
                    // ctrl + z 撤销
                    case 90:
                        that.undo_redo_document('undo');
                        e.preventDefault();
                        break;
                    // ctrl + y 重做
                    case 89:
                        that.undo_redo_document('redo');
                        e.preventDefault();
                        break;
                    // ctrl + d 创建副本  & 复制幻灯片
                    case 68:
                        if ($checked.length) {
                            that.ele_copy(e, true);
                        } else {
                            page_opt.copy(that, that.page_info.uuid);
                        }
                        e.preventDefault();
                        break;
                    // ctrl + 0  缩放到100%
                    case 96:
                    case 48:
                        that.$refs.EditFooter.applyScale(1);
                        e.preventDefault();
                        break;
                    // ctrl + 1  缩放到适应画布
                    case 97:
                    case 49:
                        that.$refs.EditFooter.applyScale(that.page_scale.suitable);
                        e.preventDefault();
                        break;
                    // ctrl + f 从当前页开始演示
                    case 70:
                        that.show_doc_display();
                        e.preventDefault();
                        break;
                    // ctrl + m 新建文档页
                    case 77:
                        that.add_page(false, true);
                        e.preventDefault();
                        break;
                    // ctrl + s 保存
                    case 83:
                        that.save_document();
                        break;
                    // Ctrl + / 快捷键面板
                    case 191:
                        that.$refs.EditFooter.toggleKeyboard();
                        break;
                    // Ctrl + ' 显示像素网格
                    case 222:
                        that.$refs.EditFooter.toggleGrid(!that.grid_using);
                        break;
                    // ctrl + / 沉浸模式
                    case 220:
                        that.$refs.EditFooter.setImmersiveMode();
                        break;
                    // Ctrl + ] 上移一层
                    case 221:
                        that.set_ele_level('up');
                        e.preventDefault();
                        break;
                    // Ctrl + [ 下移一层
                    case 219:
                        that.set_ele_level('down');
                        e.preventDefault();
                        break;
                    // Ctrl + K 超链接
                    case 75:
                        if (has_focus) {
                            that.add_ele_link();
                        } else {
                            Tool.setDrawText('link');
                        }
                        e.preventDefault();
                        break;
                }
                /**
                 * 富文本内快捷键--------------------------------------------------
                 */
                if (has_focus) {
                    return;
                }
                /**
                 * 元素操作--------------------------------------------------
                 */
                if ($checked.length) {
                    if (get_checked_ele.lock) {
                        return;
                    }
                    switch (code) {
                        // ctrl + g 组合
                        case 71:
                            that.set_ele_group();
                            e.preventDefault();
                            break;
                    }
                }
                /**
                 * 全局操作--------------------------------------------------
                 */
                switch (code) {
                    // ctrl + a 全选
                    case 65:
                        that.ele_selectAll();
                        e.preventDefault();
                        break;
                }
            }
            /**
             * ctrl + shift + code --------------------------------------------------
             */
            if (ctrl && shift && !alt) {
                /**
                 * 始终触发的快捷键 --------------------------------------------------
                 */
                switch (code) {
                    // Ctrl + Shift + ; 打开模板库
                    case 186:
                        if (that.preset_modal_show && that.$refs.presetModal.isShow) {
                            that.$refs.presetModal.close();
                        } else if (that.preset_modal_show) {
                            that.close_all_modal('preset');
                            that.$refs.presetModal.show();
                        } else {
                            that.close_all_modal('preset');
                            that.preset_modal_show = true;
                        }
                        e.preventDefault();
                        break;
                    // Ctrl + Shift + " 打开素材库
                    case 222:
                        that.open_material_modal();
                        e.preventDefault();
                        break;
                    // Ctrl + Shift + M 打开媒体库
                    case 77:
                        that.open_media_modal();
                        e.preventDefault();
                        break;
                    // Ctrl + Shift + K 打开空间
                    case 75:
                        if (that.space_modal_show && this.$refs.mySpaceModal.isShow) {
                            that.$refs.mySpaceModal.close();
                        } else if (that.space_modal_show) {
                            that.close_all_modal('space');
                            that.$refs.mySpaceModal.show();
                        } else {
                            that.close_all_modal('space');
                            that.space_modal_show = true;
                        }
                        e.preventDefault();
                        break;
                    // Ctrl + Shift + Y 快捷颜色
                    case 89:
                        break;
                    // Ctrl + Shift + F 从首页开始演示
                    case 70:
                        that.show_doc_display(true);
                        e.preventDefault();
                        break;
                    // Ctrl + Shift + ↑ 字号调大
                    case 38:
                        Format.set_font_unit_size('add');
                        e.preventDefault();
                        break;
                    // Ctrl + Shift + ↓ 字号调小
                    case 40:
                        Format.set_font_unit_size('reduce');
                        e.preventDefault();
                        break;
                    // Ctrl + Shift + L 锁定/解锁
                    case 76:
                        that.set_ele_lock();
                        e.preventDefault();
                        break;
                    // Ctrl + Shift + ] 移至顶层
                    case 221:
                        that.set_ele_level('top');
                        e.preventDefault();
                        break;
                    // Ctrl + Shift + [ 移至底层
                    case 219:
                        that.set_ele_level('bottom');
                        e.preventDefault();
                        break;
                    // ctrl + shift + G 取消组合
                    case 71:
                        if (get_checked_ele.group) {
                            that.set_ele_group();
                            that.ele_cancel_checked();
                        }
                        e.preventDefault();
                        break;
                    // Ctrl + shift + | 管理员恢复备份数据
                    case 220:
                        document_save.backup.method.show_recovery_modal(that);
                        e.preventDefault();
                        break;
                    // Ctrl + shift + - 下载队列数据
                    case 189:
                        document_save.method.download_command_queue();
                        e.preventDefault();
                        break;
                    // Ctrl + shift + + 下载文档数据
                    case 187:
                        document_save_error.method.download_document_data(that);
                        e.preventDefault();
                        break;
                    // Ctrl + shift + 1 使用文档保存主url
                    case 49:
                        document_save.method.set_random_save_url(false);
                        e.preventDefault();
                        break;
                    // Ctrl + shift + 2 使用文档保存备url
                    case 50:
                        document_save.method.set_random_save_url(true);
                        e.preventDefault();
                        break;
                }
                /**
                 * 富文本内快捷键--------------------------------------------------
                 */
                if (has_focus) {
                    return;
                }
                /**
                 * 元素操作--------------------------------------------------
                 */
                if ($checked.length) {
                    if (get_checked_ele.lock) {
                        return;
                    }
                    let common_message;
                    switch (code) {
                        // Ctrl + shift + C 获取元素对象
                        case 67:
                            that.ele_get_material();
                            e.preventDefault();
                            break;
                    }
                    return;
                }
                /**
                 * 全局操作--------------------------------------------------
                 */
                switch (code) {
                    // Ctrl + Shift + ←/↑ 将幻灯片移到开头
                    case 37:
                    case 38:
                        page_opt.set_sort(that, { order_uuids: [that.page_info.uuid] });
                        e.preventDefault();
                        break;
                    // Ctrl + Shift + →/↓ 将幻灯片移至结尾
                    case 39:
                    case 40:
                        page_opt.set_sort(that, { after_uuid: that.document_page_list[that.document_page_list.length - 1].uuid, order_uuids: [that.page_info.uuid] });
                        e.preventDefault();
                        break;
                }
            }
            /**
             * ctrl + alt + code --------------------------------------------------
             */
            if (ctrl && !shift && alt) {
                /**
                 * 始终触发的快捷键 --------------------------------------------------
                 */
                switch (code) {
                    // 复制样式 Ctrl+Alt+C
                    case 67:
                        that.ele_copy_format();
                        e.preventDefault();
                        break;
                    // 粘贴样式 Ctrl+Alt+V
                    case 86:
                        that.ele_paste_format();
                        e.preventDefault();
                        break;
                    // Ctrl + Alt + L 文本左对齐
                    case 76:
                        that.set_text_align($checked, 'left')
                        e.preventDefault();
                        break;
                    // Ctrl + Alt + T 文本居中对齐
                    case 84:
                        that.set_text_align($checked, 'center')
                        break;
                    // Ctrl + Alt + R 文本右对齐
                    case 82:
                        that.set_text_align($checked, 'right')
                        break;
                    // Ctrl + Alt + J 文本右对齐
                    case 74:
                        that.set_text_align($checked, 'justify')
                        break;
                    // Ctrl + Alt + E  页面报错反馈
                    case 69:
                        that.submit_error_to_aliyun();
                        break;
                }
                // 表格按键操作
                if (get_checked_ele.type === 'table') {
                    switch (code) {
                        // Ctrl + Alt + ↑ 表格上方加一行
                        case 38:
                            that.set_row_column('add_top');
                            e.preventDefault();
                            break;
                        // Ctrl + Alt + ↓ 表格下方加一行
                        case 40:
                            that.set_row_column('add_bottom');
                            e.preventDefault();
                            break;
                        // Ctrl + Alt + ← 表格左侧加一列
                        case 37:
                            that.set_row_column('add_left');
                            e.preventDefault();
                            break;
                        // Ctrl + Alt + → 表格右方加一列
                        case 39:
                            that.set_row_column('add_right');
                            e.preventDefault();
                            break;
                    }
                }
                /**
                 * 富文本内快捷键--------------------------------------------------
                 */
                if (has_focus) {
                    return;
                }
                /**
                 * 元素操作--------------------------------------------------
                 */
                if ($checked.length) {
                    if (get_checked_ele.lock) {
                        return;
                    }
                    return;
                }
                /**
                 * 全局操作--------------------------------------------------
                 */
                switch (code) {
                    default:
                }
            }
            /**
             * shift + alt + code --------------------------------------------------
             */
            if (!ctrl && shift && alt) {
                /**
                 * 始终触发的快捷键 --------------------------------------------------
                 */
                switch (code) {
                    // shift + alt + V 垂直等距分布
                    case 86:
                        Format.set_ele_align({ data: 'deuce', key: 'vertical'}, localStorage.getItem('woodo_page_align_type') !== 'page' && that.group_align_history.indexOf('deuce_vertical') > -1? 'page' : false);
                        if (localStorage.getItem('woodo_page_align_type') !== 'page') that.group_align_history.push('deuce_vertical');
                        break;
                    // shift + alt + V 水平等距分布
                    case 72:
                        Format.set_ele_align({ data: 'deuce', key: 'horizontal'}, localStorage.getItem('woodo_page_align_type') !== 'page' && that.group_align_history.indexOf('deuce_horizontal') > -1? 'page' : false);
                        if (localStorage.getItem('woodo_page_align_type') !== 'page') that.group_align_history.push('deuce_horizontal');
                        break;
                }
            }
            /**
             * shift + code --------------------------------------------------
             */
            if (!ctrl && shift && !alt) {
                /**
                 * 始终触发的快捷键 --------------------------------------------------
                 */
                switch (code) {
                    // shift + L 绘制箭头
                    case 76:
                        if ($checked.length) that.ele_cancel_checked();
                        Tool.setDraw({ shortcut: 'Shift+L' });
                        break;
                }
                /**
                 * 富文本内快捷键--------------------------------------------------
                 */
                if (has_focus) {
                    switch (code) {
                        // shift + Tab 减少缩进
                        case 9:
                            editor_opt.set_outdent();
                            e.preventDefault();
                            break;
                    }
                    return;
                }
                switch (code) {
                    // shift + Tab 选中上一个元素
                    case 9:
                        let previousPage = () => {
                            let nextIndex = that.document_page_list.findIndex(i => i.uuid === that.page_info.uuid);
                            if (nextIndex > 0) {
                                page_opt.change(that, nextIndex - 1, 'previous', () => {
                                    let $last = $('.page_contain .edit_page .ele_item:last');
                                    if ($last.attr('data-group')) $last =$('.page_contain').find(`.ele_item[data-group=${$last.attr('data-group')}]`)
                                    that.set_ele_checked($last);
                                });
                            } else {
                                that.$toast("前面没有元素可被选中", 1000);
                            }
                        }
                        if ($checked.length) {
                            let $prevElement = opt_factory.init_opt('group').set_level.change($checked, 'down', true);
                            if ($prevElement.length > 0) {
                                that.ele_cancel_checked();
                                that.set_ele_checked($prevElement);
                            } else {
                                previousPage();
                            }
                            } else {
                                previousPage();
                            }
                            break;
                }
                /**
                 * 元素操作--------------------------------------------------
                 */
                if ($checked.length) {
                    if (get_checked_ele.lock) {
                        return;
                    }
                    switch (code) {
                        // ← 移动元素10像素
                        case 37:
                            that.ele_key_translate($checked, 'x', -10);
                            e.preventDefault();
                            break;
                        // ↑ 移动元素10像素
                        case 38:
                            that.ele_key_translate($checked, 'y', -10);
                            e.preventDefault();
                            break;
                        // → 移动元素10像素
                        case 39:
                            that.ele_key_translate($checked, 'x', 10);
                            e.preventDefault();
                            break;
                        // ↓ 移动元素10像素
                        case 40:
                            that.ele_key_translate($checked, 'y', 10);
                            e.preventDefault();
                            break;
                        // shift + V 垂直翻转
                        case 86:
                            Format.set_ele_reversal('vertical');
                            break;
                        // shift + H 水平翻转
                        case 72:
                            Format.set_ele_reversal('horizontal');
                            break;
                    }
                    return;
                }
            }
            /**
             * alt + code --------------------------------------------------
             */
            if (!ctrl && !shift && alt) {
                /**
                 * 始终触发的快捷键 --------------------------------------------------
                 */
                switch (code) {
                    // Alt + 1 大标题
                    case 97:
                    case 49:
                        if ($checked.length || has_focus) {
                            let isText = true;
                            $checked.each((i ,item) => {
                                if (item.getAttribute('data-type') !== 'text') {
                                    isText = false;
                                    return false;
                                }
                            })
                            if (isText) {
                                let textOption = opt_factory.init_opt('text');
                                $checked.each((i, item) => {
                                    let $text = $(item);
                                    Tool.setDrawText('title', $text);
                                    textOption.set_ele_sync_content($text);
                                })
                                operate_opt.reset_rect($checked);
                                that.element_message = Object.assign(that.element_message, option.get_edit_message($checked));
                            } else {
                                that.ele_cancel_checked();
                                Tool.setDrawText('title');
                            }
                        } else {
                            Tool.setDrawText('title');
                        }
                        break;
                    // Alt + 2 小标题
                    case 98:
                    case 50:
                        if ($checked.length || has_focus) {
                            let isText = true;
                            $checked.each((i ,item) => {
                                if (item.getAttribute('data-type') !== 'text') {
                                    isText = false;
                                    return false;
                                }
                            })
                            if (isText) {
                                let textOption = opt_factory.init_opt('text');
                                $checked.each((i, item) => {
                                    let $text = $(item);
                                    Tool.setDrawText('smallTitle', $text);
                                    textOption.set_ele_sync_content($text);
                                    that.element_message = Object.assign(that.element_message, option.get_edit_message($checked));
                                })
                                operate_opt.reset_rect($checked);
                            } else {
                                that.ele_cancel_checked();
                                Tool.setDrawText('smallTitle');
                            }
                        } else {
                            Tool.setDrawText('smallTitle');
                        }
                        break;
                    // Alt + 3 正文（大）
                    case 99:
                    case 51:
                        if ($checked.length || has_focus) {
                            let isText = true;
                            $checked.each((i ,item) => {
                                if (item.getAttribute('data-type') !== 'text') {
                                    isText = false;
                                    return false;
                                }
                            })
                            if (isText) {
                                let textOption = opt_factory.init_opt('text');
                                $checked.each((i, item) => {
                                    let $text = $(item);
                                    Tool.setDrawText('text', $text);
                                    textOption.set_ele_sync_content($text);
                                    that.element_message = Object.assign(that.element_message, option.get_edit_message($checked));
                                })
                                operate_opt.reset_rect($checked);
                            } else {
                                that.ele_cancel_checked();
                                Tool.setDrawText('text');
                            }
                        } else {
                            Tool.setDrawText('text');
                        }
                        break;
                    // Alt + 4 正文
                    case 100:
                    case 52:
                        if ($checked.length || has_focus) {
                            let isText = true;
                            $checked.each((i ,item) => {
                                if (item.getAttribute('data-type') !== 'text') {
                                    isText = false;
                                    return false;
                                }
                            })
                            if (isText) {
                                let textOption = opt_factory.init_opt('text');
                                $checked.each((i, item) => {
                                    let $text = $(item);
                                    Tool.setDrawText('smallText', $text);
                                    textOption.set_ele_sync_content($text);
                                    that.element_message = Object.assign(that.element_message, option.get_edit_message($checked));
                                })
                                operate_opt.reset_rect($checked);
                            } else {
                                that.ele_cancel_checked();
                                Tool.setDrawText('smallText');
                            }
                        } else {
                            Tool.setDrawText('smallText');
                        }
                        break;
                    // Alt + A 左对齐
                    case 65:
                        Format.set_ele_align({ data: 'left', key: 'horizontal'}, localStorage.getItem('woodo_page_align_type') !== 'page' && that.group_align_history.indexOf('left') > -1 ? 'page' : false);
                        if (localStorage.getItem('woodo_page_align_type') !== 'page') that.group_align_history.push('left');
                        e.preventDefault();
                        break;
                    // Alt + D 右对齐
                    case 68:
                        Format.set_ele_align({ data: 'right', key: 'horizontal'}, localStorage.getItem('woodo_page_align_type') !== 'page' && that.group_align_history.indexOf('right') > -1 ? 'page' : false);
                        if (localStorage.getItem('woodo_page_align_type') !== 'page') that.group_align_history.push('right');
                        e.preventDefault();
                        break;
                    // Alt + W 顶对齐
                    case 87:
                        Format.set_ele_align({ data: 'top', key: 'vertical'}, localStorage.getItem('woodo_page_align_type') !== 'page' && that.group_align_history.indexOf('top') > -1 ? 'page' : false);
                        if (localStorage.getItem('woodo_page_align_type') !== 'page') that.group_align_history.push('top');
                        e.preventDefault();
                        break;
                    // Alt + S 底对齐
                    case 83:
                        Format.set_ele_align({ data: 'bottom', key: 'vertical'}, localStorage.getItem('woodo_page_align_type') !== 'page' && that.group_align_history.indexOf('bottom') > -1 ? 'page' : false);
                        if (localStorage.getItem('woodo_page_align_type') !== 'page') that.group_align_history.push('bottom');
                        e.preventDefault();
                        break;
                    // Alt + V 垂直居中对齐
                    case 86:
                        Format.set_ele_align({ data: 'middle', key: 'vertical'}, localStorage.getItem('woodo_page_align_type') !== 'page' && that.group_align_history.indexOf('middle') > -1 ? 'page' : false);
                        if (localStorage.getItem('woodo_page_align_type') !== 'page') that.group_align_history.push('middle');
                        e.preventDefault();
                        break;
                    // Alt + H 左右居中对齐
                    case 72:
                        Format.set_ele_align({ data: 'center', key: 'horizontal'}, localStorage.getItem('woodo_page_align_type') !== 'page' && that.group_align_history.indexOf('center') > -1 ? 'page' : false);
                        if (localStorage.getItem('woodo_page_align_type') !== 'page') that.group_align_history.push('center');
                        e.preventDefault();
                        break;
                    // Alt + F 格式刷
                    case 70:
                        Format.set_format_painter(false);
                        e.preventDefault();
                        break;
                }
            }
            /**
             * code --------------------------------------------------
             */
            if (!ctrl && !shift && !alt) {
                /**
                 * 始终触发的快捷键 --------------------------------------------------
                 */
                switch (code) {
                }
                /**
                 * 富文本内快捷键--------------------------------------------------
                 */
                if (has_focus) {
                    // 表格按键操作
                    if (get_checked_ele.type === 'table') {
                        switch (code) {
                            // 单元格跳动
                            case 9:
                                option.direction($checked, 'right', true);
                                break;
                            case 37:
                                option.direction($checked, 'left');
                                break;
                            case 38:
                                option.direction($checked, 'top');
                                break;
                            case 39:
                                option.direction($checked, 'right');
                                break;
                            case 40:
                                option.direction($checked, 'bottom');
                                break;
                        }
                    }
                    switch (code) {
                        // Ctrl + → 文本缩进 (改tab)
                        case 9:
                            editor_opt.set_indent();
                            e.preventDefault();
                            break;
                    }
                    return;
                }
                switch (code) {
                    // 画布拖动
                    case 32:
                        if(that.page_hover) {
                            e.preventDefault();
                            that.page_state = 'drag_page';
                            document.addEventListener('mousedown', that.drag_page_listener);
                        }
                        break;
                    // T 创建文本
                    case 84:
                        that.ele_cancel_checked();
                        Tool.setDrawText('smallText');
                        break;
                    // L 形状工具 - 矩形
                    case 76:
                        that.ele_cancel_checked();
                        Tool.setDraw({ shortcut: 'L' });
                        break;
                    // O 形状工具 - 圆形
                    case 79:
                        that.ele_cancel_checked();
                        Tool.setDraw({ shortcut: 'O' });
                        break;
                    // R 形状工具 - 直线
                    case 82:
                        that.ele_cancel_checked();
                        Tool.setDraw({ shortcut: 'R' });
                        break;
                    // C 评论工具
                    case 67:
                        Tool.eventDistribute('comment');
                        break;
                    // + 放大画布
                    case 187:
                        !has_focus && that.$refs.EditFooter.applyScale(that.page_scale.user_set + 0.1);
                        break;
                    // - 缩小画布
                    case 189:
                        !has_focus && that.$refs.EditFooter.applyScale(that.page_scale.user_set - 0.1);
                        break;
                    // Page Up 上一页
                    case 33:
                        let nextIndex = that.document_page_list.findIndex(i => i.uuid === that.page_info.uuid);
                        if (nextIndex > 0) page_opt.change(that, nextIndex - 1, 'previous');
                        e.preventDefault();
                        break;
                    // Page Down 下一页
                    case 34:
                        let prevIndex = that.document_page_list.findIndex(i => i.uuid === that.page_info.uuid);
                        if (prevIndex < that.document_page_list.length - 1) page_opt.change(that, prevIndex + 1, 'next');
                        e.preventDefault();
                        break;
                    // End 最后一张幻灯片
                    case 35:
                        page_opt.change(that, that.document_page_list.length - 1, 'next');
                        e.preventDefault();
                        break;
                    // Home 第一张幻灯片
                    case 36:
                        page_opt.change(that, 0, 'previous');
                        e.preventDefault();
                        break;
                    // Tab 选中下一个元素
                    case 9:
                        let nextPage = () => {
                            let prevIndex = that.document_page_list.findIndex(i => i.uuid === that.page_info.uuid);
                            if (prevIndex < that.document_page_list.length - 1) {
                                page_opt.change(that, prevIndex + 1, 'next', () => {
                                    let $first = $('.page_contain .edit_page .ele_item:first');
                                    if ($first.attr('data-group')) $first = $('.page_contain').find(`.ele_item[data-group=${$first.attr('data-group')}]`);
                                    that.set_ele_checked($first);
                                });
                            } else {
                                that.$toast("后面没有元素可被选中", 1000);
                            }
                        }
                        if ($checked.length) {
                            let $nextElement = opt_factory.init_opt('group').set_level.change($checked, 'up', true);
                            if ($nextElement.length > 0) {
                                that.ele_cancel_checked();
                                that.set_ele_checked($nextElement);
                            } else {
                                nextPage();
                            }
                        } else {
                            nextPage();
                        }
                        e.preventDefault();
                        break;
                }
                /**
                 * 元素操作--------------------------------------------------
                 */
                if ($checked.length) {
                    if (get_checked_ele.lock) {
                        return;
                    }
                    switch (code) {
                        // ← 移动元素
                        case 37:
                            that.ele_key_translate($checked, 'x', -1);
                            e.preventDefault();
                            break;
                        // ↑ 移动元素
                        case 38:
                            that.ele_key_translate($checked, 'y', -1);
                            e.preventDefault();
                            break;
                        // → 移动元素
                        case 39:
                            that.ele_key_translate($checked, 'x', 1);
                            e.preventDefault();
                            break;
                        // ↓ 移动元素
                        case 40:
                            that.ele_key_translate($checked, 'y', 1);
                            e.preventDefault();
                            break;
                        // 退格 删除选中
                        case 8:
                            // 过滤评论框内的操作
                            if (e.target.className === 'draft_content') return;
                            if ($('.cel_selected').length) {
                                option.judge_cel_delete($checked);
                            } else {
                                that.ele_delete();
                            }
                            e.preventDefault();
                            break;
                        // delete 删除选中
                        case 46:
                            if ($('.cel_selected').length) {
                                option.judge_cel_delete($checked);
                            } else {
                                that.ele_delete();
                            }
                            e.preventDefault();
                            break;
                    }
                    return;
                }
                /**
                 * 全局操作--------------------------------------------------
                 */
                // 按键翻页
                if ([37, 38, 39, 40].indexOf(code) >= 0) {
                    let action = 'next';
                    if (e.keyCode === 37 || e.keyCode === 38) {
                        action = 'previous'
                    }
                    let min_index = 0;
                    let max_index = that.document_page_list.length - 1;
                    let current_index = min_index;
                    let target_index = min_index;
                    $.each(that.document_page_list, function (i, item) {
                        if (item.uuid === that.page_info.uuid) {
                            current_index = i;
                            return false;
                        }
                    });
                    if (action === 'previous') {
                        target_index = current_index - 1;
                    } else {
                        target_index = current_index + 1;
                    }
                    if (target_index < min_index) {
                        target_index = min_index;
                    }
                    if (target_index > max_index) {
                        target_index = max_index;
                    }
                    if (current_index === target_index) {
                        return;
                    }
                    page_opt.change(that, target_index, action);
                    e.preventDefault();
                }
            }
        },
        drag_page_listener: function(event) {
            event.preventDefault();
            $('body').addClass('grabbing');
            this.grid_using = false;        // 取消网格
            this.ele_cancel_checked();      // 取消元素选中
            return this.drag_page(event);
        },
        // 元素输入监听
        input_listener: function (ele) {
            let that = this;
            let $checked = utils.isNode(ele) ? ele : $('.page_contain .ele_item.checked');
            $checked.each(function () {
                let $ele = $(this);
                let type = $ele.attr('data-type');
                let option = opt_factory.init_opt(type);
                // 判断元素类别
                switch (type) {
                    // 文本元素输入 -> 虚线框同步文本大小
                    case 'text':
                        let $text = $ele.find('.show_text');
                        if ($text.hasClass('example_text')) $text.removeClass('example_text');
                        that.before_clean_html.forEach(function (item, index) {
                            if (item.id === $ele.attr('id')) that.before_clean_html.splice(index, 1);
                        });
                        that.clean_text_format($ele.attr('id'));// 删除粘贴格式设置
                        that.element_message.h = option.set_ele_sync_content($ele);
                        operate_opt.reset_rect($ele);
                        break;
                    // 表格元素输入 -> 表格大小重计算
                    case 'table':
                        option.table_edit_listener($ele);
                        break;
                }
            })
        },
        // 浏览器窗口监听
        resize_listener: function (event) {
            // 裁剪时不触发
            if (!this.$refs.FormatPanel.begin_clip) {
                // 取消选中
                this.ele_cancel_checked();
                // 重新计算画布缩放
                page_opt.save_page_offset(this);
                // 更新屏幕最佳比例
                this.compute_suitable_scale();
                // 更新全屏编辑状态
                let isFull = utils.checkIsFull();
                if (!isFull) {
                    this.$refs.EditFooter.immersiveMode = false;
                    this.put_left_modal_away(true);
                }
            }
        },
        // 鼠标滚轮监听
        mousewheel_listener: function (event) {
            let that = this,
                e = event || window.event;
            // 禁止浏览器缩放快捷键
            if (e.ctrlKey || (e.metaKey && utils.deviceENV().mac)) {
                e.preventDefault();
            }
            // 事件节流
            if (that.mousewheel_throttle) {
                return;
            }
            that.mousewheel_throttle = true;
            setTimeout(() => {
                that.mousewheel_throttle = false;
            }, 300);
            // 演示页滚动
            if (that.show_slides_preview) {
                return;
            }
            // 画布滚动
            // 操作过程中阻止滚动
            if (operate_opt.can_drag || operate_opt.can_rotate || operate_opt.can_resize) {
                return;
            }
            let edit_body = document.querySelector('.edit_body');
            let edit_operation = document.querySelector('.edit_operation');
            let can_change = false, action;
            // 判断是否是画布翻页操作
            if (!e.path || e.path.length === 0) {
                if ($(e.target).parents('.edit_body').length > 0) can_change = true;
            } else {
                for (let index = 0; index < e.path.length; index++) {
                    let item = e.path[index];
                    if (item === edit_body || item === edit_operation || $(item).parents('.switch_page_animation_container').length > 0) can_change = true;
                }
            }
            if (can_change) {
                if (e.wheelDelta) {
                    if (e.wheelDelta > 0) {
                        action = 'previous'
                    } else {
                        action = 'next'
                    }
                } else if (e.detail) {
                    if (e.detail > 0) {
                        action = 'next'
                    } else {
                        action = 'previous'
                    }
                } else {
                    return;
                }
                let min_index = 0;
                let max_index = that.document_page_list.length - 1;
                let current_index = min_index;
                let target_index = min_index;
                $.each(that.document_page_list, function (i, item) {
                    if (item.uuid === that.page_info.uuid) {
                        current_index = i;
                        return false;
                    }
                });
                if (action === 'previous') {
                    target_index = current_index - 1;
                } else {
                    target_index = current_index + 1;
                }
                if (target_index < min_index) {
                    target_index = min_index;
                }
                if (target_index > max_index) {
                    target_index = max_index;
                }
                if (current_index === target_index) {
                    return;
                }
                page_opt.change(that, target_index, action);
            }
        },
        // 鼠标按下监听
        mousedown_listener: function (event) {
            let that = this;
            if (event.button === 2 && that.page_hover) {
                event.preventDefault();
                $('body').addClass('grabbing');
                return that.drag_page(event);
            }
        },
        // 鼠标点击监听
        click_listener: function (event) {
            let that = this,
                $target = $(event.target);
            // 判断隐藏页面设置框
            if (that.$refs.sort_page_modal.show_page_background) {
                // 判断点击的地方是否是画布背景设置dom内或者调色板dom内
                let no_page_set = $target.hasClass('page_background_modal') || $target.parents('.page_background_modal').length > 0 || $target.parents('.color_picker.head_center').length > 0;
                if (!no_page_set) {
                    that.$refs.sort_page_modal.show_page_background = false;
                }
            }

            // 点击的不是序列表内容 则取消序列表选中状态
            if($target.hasClass('svg_list') || $target.parents('.svg_list')){
                that.$refs.sort_page_modal.is_select = false;
                that.$refs.sort_page_modal.clear_selected_page_list();
            }
            // 判断去除格式刷状态
            if (that.had_format_painter) {
                let in_page = $target.parents('.page').length > 0 || $target.hasClass('page');
                let in_btn = $target.hasClass('text_format_btn') || $target.parents('.text_format_btn').length > 0;
                let in_element = ($target.parents('.ele_item').length > 0 || $target.hasClass('ele_item'));
                if ((!in_page && !in_btn) || (in_page && !in_element)) {
                    that.had_format_painter = false;
                    that.format_painter_style = null;
                }
            }
            // 保存光标定位
            page_opt.save_cursor_position(that, false);
        },
        // 鼠标双击监听
        dblclick_listener: function (event) {
            let that = this,
                $target = $(event.currentTarget),
                $ele = $('.page_contain .ele_item.checked');
            if (that.user_disable_edit) return false;
            let dbclick_point = [event.clientX, event.clientY].join();
            // 清除双击计时器
            clearTimeout(that.timer_id_stack['dblclick']);
            // 与上次点击位置相同，触发双击
            if (that.dblclick_flag === dbclick_point) {
                that.dblclick_flag = false;
                // 锁定元素双击提醒
                if ($target.hasClass('lock')) {
                    return that.$toast('元素已锁定，请右键解锁后操作', 1500);
                }
                if ($ele.length === 1) {
                    switch (that.element_type) {
                        // 图片元素双击切换链接 -> 打开素材库
                        case 'img':
                            that.image_dblclick();
                            break;
                        // 形状元素双击进入文本编辑
                        case 'shape':
                            $ele.find('.show_text').focus();
                            document.execCommand('selectAll');
                            break;
                        case 'text':
                            $ele.find('.show_text').focus();
                            document.execCommand('selectAll');
                            if (event.target.className !== 'show_text' && $(event.target).closest(".show_text").length <= 0) {
                                let range = window.getSelection().getRangeAt(0);
                                range.setStart(range.endContainer, range.endOffset)
                            }
                            break;
                    }
                }
            } else {
                that.dblclick_flag = dbclick_point;
                that.timer_id_stack['dblclick'] = setTimeout(function () {
                    that.dblclick_flag = false;
                }, 300);
            }
        },
        // 右键菜单监听
        mousemenu_listener: function (event) {
            let that = this;
            let e = event || window.event;
            // 初始化
            e.preventDefault();
            // 更新剪切板状态
            that.clipboard_update_support();
            // 恢复元素绘制状态
            if (['create_text', 'create_line', 'create_shape'].indexOf(that.page_state) >= 0) {
                that.page_state = 'common';
            }
            let $target = $(e.target);
            // 序列表右键点击
            let isSortList = $target.hasClass('svg_content') || $target.parents('.svg_content').length;
            if (isSortList) {
                return that.$refs.sort_page_modal.showRightMenu(e);
            }
            // 画布操作 & 元素操作
            if (!$target.parents('#page.page').length && !$target.parents('#operate.operate').length) {
                return;
            }
            // 重置状态
            that.had_format_painter = false;
            that.format_painter_style = null;
            that.$refs.FormatPanel.hide_all_list();
            that.$refs.editHead.clearToolStatus();
            // 当前页无操作权限
            if (that.user_disable_edit) {
                return;
            }
            let is_element = !!($target.parents('#edit_page').length && $target.parents('.ele_item').length);
            let is_child = !!($target.parents('.group_child').length && $target.hasClass('child'));
            let is_operate = $target.hasClass('operate_border');
            let right_menu_config = {};
            // 右键点击元素
            if (is_element || is_child || is_operate) {
                let option = opt_factory.init_opt('group');
                let get_element = option.get_checked_element();
                let $checked = get_element.element;
                let $ele = $target.parents('.ele_item');
                if (get_element.group) {
                    $checked = get_element.group;
                }
                if (is_child || is_operate) {
                    $ele = $checked;
                }
                // 未选中的元素触发选中
                if (!$ele.hasClass('checked')) {
                    // 清除元素选中状态
                    that.ele_cancel_checked();
                    // 选中元素 || 组合元素
                    $ele.addClass('checked');
                    get_element = option.get_checked_element();
                    $checked = get_element.element;
                    if (get_element.group) {
                        $checked = get_element.group;
                    }
                    that.set_ele_checked($checked);
                }
                // 右键点击元素
                right_menu_config['type'] = 'element';
                // 表格元素点击非元素节点单元格失焦
                if (that.element_type === 'table' && !is_element) {
                    $ele.find('[contenteditable="true"]:focus').blur();
                }
                let selection = window.getSelection ? window.getSelection() : document.selection.createRange().text;
                // 判断选择的文字是否已存在超链接
                that.judgeHasLink();
                right_menu_config['isRange'] = !!($ele.find('[contenteditable="true"]').length && selection && selection.type === 'Range' && !selection.isCollapsed);
                right_menu_config['isEditor'] = !!($ele.find(':focus').length && selection && selection.isCollapsed);
                // 表格菜单单独处理
                if (that.element_type === 'table') {
                    // 合并拆分按钮状态
                    let option_table = opt_factory.init_opt('table');
                    let $edit_cel = option_table.get_edit_cel($ele);
                    let merge_cel = 0;
                    $edit_cel.each((i, item) => {
                        option_table.get_merge_cel($(item), $ele, () => {
                            merge_cel++;
                        });
                    });
                    let merge_disable = false;
                    let split_disable = false;
                    switch (true) {
                        // 选中单个单元格  -->  不可合并，不可拆分
                        case $edit_cel.length === 1:
                            merge_disable = true;
                            split_disable = true;
                            break;
                        // 所选单元格不存在合并单元格  -->  可合并，不可拆分
                        case merge_cel === 0:
                            split_disable = true;
                            break;
                        // 所选单元格已全部合并  -->  不可合并，可拆分
                        case merge_cel + 1 === $edit_cel.length:
                            merge_disable = true;
                            break;
                    }
                    right_menu_config['tableMergeDisable'] = merge_disable
                    right_menu_config['tableSplitDisable'] = split_disable
                    // 选中单元格右键
                    if ($ele.find('td.cel_selected').length) {
                        right_menu_config['isRange'] = false;
                        right_menu_config['isEditor'] = true;
                    }
                }
                that.right_menu_config = right_menu_config;
            } else {
                // 清除元素选中状态
                that.ele_cancel_checked();
                // 清除背景设置弹窗
                that.show_page_set = false;
                that.right_menu_config = Object.assign({}, that.right_menu_config, {type: 'page'});
            }
            // 设置菜单定位位置
            that.$nextTick(() => {
                let top = e.clientY + 10;
                let left = e.clientX + 20;
                let window_w = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
                let window_h = window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight;
                let $menu = $('.edit_operation .right-menu-panel');
                let menu_left = left;
                let width = $menu.width();
                if (menu_left + width + 140 > window_w) {
                    menu_left = window_w - width - 140;
                }
                if (menu_left < 0) {
                    menu_left = 0;
                }
                let menu_top = top;
                let height = $menu.height();
                if (menu_top + height + 102 > window_h) {
                    menu_top = window_h - height - 132;
                }
                if (menu_top < 0) {
                    menu_top = 0;
                }
                that.right_menu_config.x = menu_left;
                that.right_menu_config.y = menu_top;
            });
        },
        /*全局方法 end*/

        /*websocket start*/
        // 初始化
        ws_init: function () {
            try {
                let that = this;
                //是否开启协作
                if (that.$route.query.ws != undefined && that.$route.query.ws == "false") {
                    return;
                }
                ws_client({
                    success: function (method) {
                        that.ws_client_method = method;
                        //加入文档房间
                        that.ws_doc_join();
                        //监听事件
                        //文档保存
                        that.ws_client_method.doc_save_rcvd(that.ws_doc_save_rcvd);
                        //文档撤回重做
                        that.ws_client_method.doc_save_undo_redo_rcvd(that.ws_doc_save_undo_redo_rcvd);
                        //文档元素选中
                        that.ws_client_method.doc_elements_checked_rcvd(that.ws_doc_elements_checked_rcvd);
                        //文档评论
                        that.ws_client_method.doc_review_rcvd(that.ws_doc_review_rcvd);
                        //文档在线用户
                        that.ws_client_method.set_doc_online_members(that.ws_set_doc_online_members);
                        //文档权限
                        that.ws_client_method.doc_authority_rcvd(that.ws_doc_authority_rcvd);
                        //文档删除
                        that.ws_client_method.doc_delete_rcvd(that.ws_doc_delete_rcvd);
                        //文档导入
                        that.ws_client_method.doc_import_rcvd(that.ws_doc_import_rcvd);
                        //操作记录恢复
                        that.ws_client_method.doc_history_rollback_rcvd(that.ws_doc_history_rollback_rcvd);
                    },
                    error: function (msg) {
                        console.error(msg);
                    }
                });
            } catch (e) {
                console.error(e);
            }
        },
        //协作-加入文档房间
        ws_doc_join: function () {
            let that = this;
            let interval;
            try {
                function join() {
                    let docId = that.$route.query.docId;//文档id
                    let modalId = that.$route.query.modalId;//模版文档id
                    //1、登陆校验
                    if (!that.user.login) {
                        return false;
                    }
                    //2、文档校验
                    if (!docId || modalId) {
                        return false;
                    }
                    //3、加入文档房间
                    let memberId = that.user.id;
                    let head = that.user.photo;
                    let nickName = that.user.name;
                    that.ws_client_method.doc_join(docId, memberId, head, nickName);
                    return true;
                }
                if (!join()) {
                    interval = setInterval(function () {
                        if (join()) {
                            clearInterval(interval);
                        }
                    }, 1000);
                }
            } catch (e) {
                if (typeof (interval) !== 'undefined') {
                    clearInterval(interval);
                }
                console.error(e);
            }
        },
        //协作-文档保存
        ws_doc_save_send: function (command) {
            try {
                let that = this;
                let docId = that.document_info.id;
                let docUuid = that.document_info.uuid;
                if (docId === null || docUuid === null) {
                    return;
                }
                if (that.ws_client_method.doc_save_send) {
                    that.ws_client_method.doc_save_send(docId, { command: command, document_version: document_save.backup.info.document_version });
                }
            } catch (e) {
                console.error(e);
            }
        },
        ws_doc_save_rcvd: function (data) {
            try {
                let that = this;
                let command = data.command;
                let document_version = data.document_version;
                if (!command) {
                    return;
                }
                command = document_old_data_handler.updateCommand(command);//数据兼容处理
                if (that.document_info.uuid === null) {
                    that.ws_tmp_commands.push(command);
                    return;
                }
                if (command.documentPages[0] && typeof (command.documentPages[0].isLock) !== 'undefined') that.ws_page_lock_rcvd(command);
                document_save.method.render_command(that, command, true);
                page_opt.render_collaborate(that, command);
                that.$refs.sort_page_modal.initial_list_data();
                //文档备份版本号
                document_save.backup.method.set_document_version(document_version);
            } catch (e) {
                console.error(e);
            }
        },
        //协作-文档撤回/重做
        ws_doc_save_undo_redo_send: function (command) {
            try {
                let that = this;
                let docId = that.document_info.id;
                let docUuid = that.document_info.uuid;
                if (docId === null || docUuid === null) {
                    return;
                }
                if (that.ws_client_method.doc_save_undo_redo_send) {
                    that.ws_client_method.doc_save_undo_redo_send(docId, { command: command, document_version: document_save.backup.info.document_version });
                }
            } catch (e) {
                console.error(e);
            }
        },
        ws_doc_save_undo_redo_rcvd: function (data) {
            try {
                let that = this;
                let command = data.command;
                let document_version = data.document_version;
                if (!command) {
                    return;
                }
                document_save.method.render_command(that, command, true);
                page_opt.render_collaborate(that, command);
                //文档备份版本号
                document_save.backup.method.set_document_version(document_version);
            } catch (e) {
                console.error(e);
            }
        },
        // 文档元素选中
        ws_doc_elements_checked_send: function (data) {
            try {
                let that = this;
                if (typeof (data) == 'undefined') return;
                // 没有编辑权限协作者不发送元素选中
                if (that.user_disable_edit) return;
                if (that.ws_client_method.doc_elements_checked_send) that.ws_client_method.doc_elements_checked_send(that.document_info.id, data);
            } catch (e) {
                console.error(e);
            }
        },
        ws_doc_elements_checked_rcvd: function (data) {
            try {
                let that = this;
                that.partner_action = data;
                that.build_ele_masking();
            } catch (e) {
                console.error(e);
            }
        },
        get_ws_checked_message: function () {
            let that = this,
                $ele = $('.page_contain .ele_item.checked'),
                data = {
                    page_id: that.page_info.id,
                    page_uuid: that.page_info.uuid,
                    element_id: []
                },
                handled_group = [];
            // 遍历元素
            $ele.each(function () {
                let id = $(this).attr('id'),
                    group = $(this).attr('data-group');
                if (group && typeof group !== 'undefined') {
                    if (handled_group.indexOf(group) !== -1) {
                        return true;
                    }
                    let $group = $('.page_contain div[data-group=' + group + ']');
                    $group.each(function (index, element) {
                        let $element = $(element);
                        if (data.element_id.indexOf($element.attr('id')) < 0) {
                            data.element_id.push($element.attr('id'));
                        }
                    });
                    handled_group.push(group)
                } else {
                    data.element_id.push(id);
                }
            });
            // 推送元素选中
            that.ws_doc_elements_checked_send(data);
        },
        build_ele_masking: function () {
            let that = this,
                editing_element = that.partner_action.filter(item => item.page_uuid === that.page_info.uuid),
                checked_id_arr = [];
            // 移除旧遮罩
            $('.editing_element_masking .item:not(.template)').remove();
            that.checked_id_arr[that.page_info.uuid] = [];
            // 移除旧遮罩提示
            $('.element_tips').hide();
            // 错误情况判断
            if (editing_element.length <= 0) return false;
            // 遍历符合当前页选中项
            editing_element.forEach(function (item) {
                let name = item.nickName,
                    color = item.color,
                    element_arr = item.element_id;
                // 遍历已选中元素id
                element_arr.forEach(function (el_id) {
                    let $ele = $('.page_contain').find('#' + el_id);
                    if ($ele.length > 0) {
                        let $item = $('.editing_element_masking .item.template').clone(),
                            type = $ele.attr('data-type'),
                            option = opt_factory.init_opt(type),
                            element_offset = option.compute_ele_offset($ele).window_scaled;
                        if (element_offset) {
                            checked_id_arr.push(el_id);
                            $item.attr({
                                'data-id': el_id,
                                'data-nickName': name,
                                'data-color': color,
                                'data-element_type': type,
                            }).css({
                                'top': element_offset.y,
                                'left': element_offset.x,
                                'width': element_offset.w,
                                'height': element_offset.h,
                                'transform': 'rotate(' + element_offset.rotate + 'deg)',
                                'box-shadow': '0 0 0 2px ' + color,
                            }).removeClass('template');
                            $item.appendTo($('.editing_element_masking'));
                            $ele.removeClass('checked');
                        } else {
                            console.error('获取到的节点信息为：', element_offset);
                        }
                    }
                });
            });
            that.checked_id_arr[that.page_info.uuid] = checked_id_arr;
        },
        // 文档评论
        ws_doc_review_send: function (data) {
            try {
                let that = this;
                if (typeof (data) == 'undefined') return;
                if (that.ws_client_method.doc_review_send) that.ws_client_method.doc_review_send(that.document_info.id, data);
            } catch (e) {
                console.error(e);
            }
        },
        ws_doc_review_rcvd: function (data) {
            try {
                let that = this,
                    type = data.type,
                    content = data.data,
                    top_comment_list = that.$refs.editHead.comment_list,
                    right_comment_list = that.$refs.editHead.right_comment_list;
                switch (type) {
                    case 'add':
                        top_comment_list.unshift(content);
                        right_comment_list.unshift(content);
                        that.$refs.editHead.un_read_comment = true;
                        break;
                    case 'modify':
                        // 修改头部评论列表
                        top_comment_list = page_opt.fn.clone_object(top_comment_list);
                        let top_comment = top_comment_list.filter(item => item.id === content.id)[0];
                        top_comment = Object.assign(top_comment, content);
                        that.$refs.editHead.comment_list = top_comment_list;
                        // 修改右侧评论列表
                        right_comment_list = page_opt.fn.clone_object(right_comment_list);
                        let right_comment = right_comment_list.filter(item => item.id === content.id);
                        if (content.isSolve) {
                            that.$refs.editHead.right_comment_list = right_comment_list.filter(item => item.id !== content.id);
                        } else {
                            if (right_comment.length <= 0) {
                                right_comment_list.push(content);
                                right_comment_list.sort(function (a, b) {
                                    return b.createDate - a.createDate
                                });
                            } else {
                                right_comment = Object.assign(right_comment[0], content);
                            }
                            that.$refs.editHead.right_comment_list = right_comment_list;
                        }
                        that.$refs.editHead.un_read_comment = true;
                        break;
                    case 'delete':
                        that.$refs.editHead.comment_list = top_comment_list.filter(item => item.id !== content);
                        that.$refs.editHead.right_comment_list = right_comment_list.filter(item => item.id !== content);
                        break;
                }
            } catch (e) {
                console.error(e);
            }
        },
        // 协作者在线
        ws_set_doc_online_members: function(data) {
            try {
                let onlineInfo = Object.values(data)[0];
                let partnerList = this.interim_authority.partner;
                partnerList.forEach(partner => {
                    if (onlineInfo[partner.memberId]) {
                        this.$set(partner, 'online', true);
                    } else {
                        this.$set(partner, 'online', false);
                    }
                });
                this.interim_authority.partner = partnerList;
            } catch(e) {
                console.error(e);
            }
        },
        // 协作权限
        ws_doc_authority_send: function () {
            try {
                let that = this,
                    id = that.document_info.id,
                    data = {
                        document: that.document_info,
                        partner: that.interim_authority.partner
                    };
                if (that.ws_client_method.doc_authority_send) that.ws_client_method.doc_authority_send(id, data);
            } catch (e) {
                console.error(e);
            }
        },
        ws_doc_authority_rcvd: function (data) {
            try {
                let that = this;
                // 判断文档权限设置为隐私
                if (data.document.type && data.document.type === 'privacy') return that.$refs.delete_modal.show_modal({
                    title: '权限变更提示',
                    content: '文档所有者修改了权限为隐私,点击确定返回工作台',
                    cancel_text: '确定',
                    not_sure: true,
                    not_close: true,
                    cancel_fn: function () {
                        that.$router.push({ path: '/home/' });
                    },
                });
                if (data.partner) {
                    // 获取当前协作者状态
                    let new_partner_list = data.partner.filter(item => item.memberId === that.user.id);
                    // 判断当前用户移除
                    if (new_partner_list.length <= 0) return that.$refs.delete_modal.show_modal({
                        title: '权限变更提示',
                        content: '文档所有者 ' + data.partner.filter(item => item.collaborateRoleType === 'owner')[0].nickName + ' 把你移出了该文档协作',
                        cancel_text: '确定',
                        not_sure: true,
                        not_close: true,
                        cancel_fn: function () {
                            window.location.href = '/home/';
                        },
                    });
                    let new_partner = new_partner_list[0];
                    new_partner.role = collaborate.authority_map[new_partner.collaborateRoleType].id;
                    // 判断当前用户权限变更
                    if (new_partner.role !== that.user.role) {
                        switch (true) {
                            // 判断当前用户转化为所有者
                            case new_partner.role === 1:
                                that.$refs.delete_modal.show_modal({
                                    title: '权限变更提示',
                                    content: '文档所有者将文档转让给了您,点击确定刷新页面',
                                    cancel_text: '确定',
                                    not_sure: true,
                                    not_close: true,
                                    cancel_fn: function () {
                                        window.location.reload();
                                    },
                                });
                                break;
                            // 判断当前用户权限降级
                            case new_partner.role > that.user.role:
                                that.$refs.delete_modal.show_modal({
                                    title: '权限变更提示',
                                    content: '文档所有者修改了你的权限为“' + new_partner.collaborateRoleName + '”，请刷新后继续',
                                    cancel_text: '刷新',
                                    not_sure: true,
                                    not_close: true,
                                    cancel_fn: function () {
                                        if (new_partner.role === 4) {
                                            location.href = '/slides/?url=' + that.document_info.url;
                                        } else {
                                            window.location.reload();
                                        }
                                    },
                                });
                                break;
                            // 判断当前用户权限升级
                            case new_partner.role < that.user.role:
                                that.$toast('文档所有者修改了你的权限为“' + new_partner.collaborateRoleName + '”', 2000);
                                that.user.role = new_partner.role;
                                break;
                        }
                    }
                }
                // 更新当前用户权限
                that.get_user_authority();
            } catch (e) {
                console.error(e);
            }
        },
        // 文档删除
        ws_doc_delete_send: function () {
            try {
                let that = this;
                if (that.ws_client_method.doc_delete_send) that.ws_client_method.doc_delete_send(that.document_info.id);
            } catch (e) {
                console.error(e);
            }
        },
        ws_doc_delete_rcvd: function () {
            try {
                let that = this;
                that.$refs.delete_modal.show_modal({
                    title: '文档删除提示',
                    content: '文档所有者删除了此文档,点击确定返回工作台',
                    cancel_text: '确定',
                    not_sure: true,
                    not_close: true,
                    cancel_fn: function () {
                        window.location.href = '/home/';
                    },
                });
            } catch (e) {
                console.error(e);
            }
        },
        // 文档导入
        ws_doc_import_send: function () {
            try {
                let that = this;
                if (that.ws_client_method.doc_import_send) that.ws_client_method.doc_import_send(that.document_info.id);
            } catch (e) {
                console.error(e);
            }
        },
        ws_doc_import_rcvd: function () {
            try {
                let that = this;
                that.$refs.delete_modal.show_modal({
                    title: '文档导入提示',
                    content: '有协作者进行文档导入，请刷新后继续',
                    cancel_text: '确定',
                    not_sure: true,
                    not_close: true,
                    cancel_fn: function () {
                        window.location.reload();
                    },
                });
            } catch (e) {
                console.error(e);
            }
        },
        // 文档版本历史恢复
        ws_doc_history_rollback_send: function (data) {
            try {
                let that = this;
                if (that.ws_client_method.doc_history_rollback_send) that.ws_client_method.doc_history_rollback_send(that.document_info.id, data);
            } catch (e) {
                console.error(e);
            }
        },
        ws_doc_history_rollback_rcvd: function (data) {
            try {
                let that = this;
                that.$refs.delete_modal.show_modal({
                    title: '文档历史版本恢复提示',
                    content: '有协作者进行文档历史版本恢复，请刷新后继续',
                    cancel_text: '确定',
                    not_sure: true,
                    not_close: true,
                    cancel_fn: function () {
                        location.href = data;
                    },
                });
            } catch (e) {
                console.error(e);
            }
        },
        // 文档页锁定
        ws_page_lock_rcvd: function (command) {
            try {
                let that = this, data = command.documentPages[0];
                if (data.id === that.page_info.id && data.isLock) {
                    that.$refs.delete_modal.show_modal({
                        title: '文档页锁定提示',
                        content: '文档所有者锁定了此文档页,请选择其他页进行编辑！',
                        cancel_text: '确定',
                        not_sure: true,
                        not_close: true,
                        cancel_fn: function () {
                            that.user_disable_edit = true;
                            // 清除画布状态
                            that.clear_page_status();
                            // 清除元素选中状态
                            that.ele_cancel_checked();
                        },
                    });
                } else if (data.id === that.page_info.id && !data.isLock) {
                    that.$refs.delete_modal.show_modal({
                        title: '文档页解锁提示',
                        content: '文档所有者解锁了此文档页,你可以正常进行编辑啦！',
                        cancel_text: '确定',
                        not_sure: true,
                        not_close: true,
                        cancel_fn: function () {
                            that.user_disable_edit = false;
                        },
                    });
                }
            } catch (e) {
                console.error(e);
            }
        },
        /*websocket end*/

        /*文档相关方法 start*/
        //初始化文档数据（空白、模版、文档）
        init_document_data: function () {
            let that = this;
            let docId = that.$route.query.docId;//文档id
            let pId = that.$route.query.pId;//文档页id
            let modalId = that.$route.query.modalId;//模版文档id
            let presetId = that.$route.query.presetId;//模版文档id
            let fId = that.$route.query.fId;//文件夹id
            let teamfId = that.$route.query.teamfId;//团队文件夹id
            let docWidth = that.$route.query.docWidth ? that.$route.query.docWidth : 910;    //文档宽
            let docHeight = that.$route.query.docHeight ? that.$route.query.docHeight : 512;  //文档高
            let docSizeIndex = that.$route.query.docSizeIndex;     //文档尺寸类型
            let docRatio = that.$route.query.ratio;     //文档尺寸比例
            let mode = that.$route.query.mode; //文档编辑模式（自由版式）
            let docType = docSizeIndex == 0 || docSizeIndex == 1 || docSizeIndex == undefined ? 'slides' : 'design';
            //设置数据方法
            let success_callback = function (document_info, document_page_list, isTemplate) {
                //文档
                $.map(that.document_info, function (value, key) {
                    let newValue = document_info[key];
                    try {
                        if (key === 'attr' || key === 'background') {
                            if (typeof (newValue) === 'string') {
                                newValue = JSON.parse(newValue);
                            }
                        }
                    } catch (e) { }
                    that.document_info[key] = typeof (document_info[key]) !== 'undefined' ? newValue : null;
                });
                that.document_info.sign = utils.uuid();
                that.document_info.fId = fId;
                that.document_info.teamfId = teamfId;
                if (!$validate(docId).empty()) {
                    that.document_info.modifyDate = '已自动保存到云端';
                }
                if (isTemplate) {
                    that.document_info.uuid = null;
                    that.document_info.title = null;
                    that.document_info.modifyDate = '未保存';
                }
                //文档页
                let page_info_index = 0;
                $.each(document_page_list, function (i, item) {
                    let document_page = {};
                    $.map(that.page_info, function (value, key) {
                        let newValue = item[key];
                        if (key === 'elementList') {
                            try {
                                newValue = JSON.parse(item[key]);
                            } catch (e) {
                                newValue = [];
                            }
                        }
                        else if (key === 'background') {
                            try {
                                newValue = JSON.parse(item[key]);
                            } catch (e) {
                                newValue = item[key];
                            }
                        } else if (key === 'attr') {
                            try {
                                newValue = JSON.parse(item[key]);
                            } catch (e) {
                                newValue = item[key];
                            }
                        }
                        document_page[key] = typeof (newValue) !== 'undefined' ? newValue : null;
                    });
                    document_page.sign = utils.uuid();
                    if (isTemplate) {
                        document_page.uuid = utils.uuid();
                        document_page.title = null;
                    }
                    that.document_page_list.push(document_page);
                    //定位需渲染页面
                    if (pId !== '' && document_page.id === Number(pId)) {
                        page_info_index = i;
                    }

                });
                that.document_page_list.sort(function (a, b) {
                    return a.pageNumber > b.pageNumber ? 1 : -1;
                });
                //当前文档页
                that.page_info = that.document_page_list[page_info_index];
                //协作初始化数据一致性问题处理
                $.each(that.ws_tmp_commands, function (i, command) {
                    if (command.document_info.uuid !== that.document_info.uuid) {
                        return true;
                    }
                    command.page_info_uuid = that.page_info.uuid;
                    document_save.method.render_command(that, command, false);
                });
                that.ws_tmp_commands = [];
                //文档版本号
                document_save.backup.method.set_document_version(document_info.version);
            };
            let complete_callback = function () {
                that.edit_mode = mode;
                // 文档主题数据同步到元素预设数据
                opt_factory.init_opt('group').ele_sync_theme(that.document_info);
                //数据渲染
                page_opt.render(that);
                // 获取全部评论列表
                new Promise(function (resolve, reject) {
                    that.get_all_comment(resolve);
                }).then(function () {
                    // 获取右侧评论列表
                    that.get_right_comment();
                });
                // 文档数据观察
                if (mode !== 'custom') {
                    that.start_document_watcher();
                }
                // 关闭加载状态，加载动画进度条拉满且延迟 document_loaddone 变化
                if(that.$refs.loadingMasking) that.$refs.loadingMasking.progress = 100;
                setTimeout(() => {
                    that.document_loaddone = true;
                }, 50);
                // 画布渲染完成
                that.$nextTick(() => {
                    // 计算页面比例
                    that.compute_suitable_scale();
                    // 初始化文档其他数据
                    that.init_document_other_data();
                    // 文档保存流程开始
                    document_save.method.ready(that);
                    // 获取用户私人配置
                    that.get_personal_config().then(() => {
                        // 初始化网格功能
                        that.init_canvas_grid();
                    });
                });
            };
            if (modalId) {
                //模版
                that.modal_id = Number(modalId);
                that.$axios.get(`/api/document/template_detail/`, { params: { docId: modalId } }).then(function (data) {
                    if (data.data.code === '2') {
                        success_callback(data.data.data.document, data.data.data.documentPages, true);
                    } else {
                        window.location.href = '/no_power/?type=edit';
                    }
                    complete_callback();
                });
            } else if (docId) {
                //文档
                that.$axios.get(`/api/member/document/detail/${docId}/`).then(function (data) {
                    if (data.data.code === '2') {
                        success_callback(data.data.data.document, data.data.data.documentPages, false);
                        // 获取文档全部协作者
                        that.get_all_partner();
                        //获取当前用户权限
                        that.get_user_authority();
                        //获取幻币信息
                        that.get_edit_doc_hcoin();
                        // 获取评论数
                        that.get_comment_count(data.data.data.document.id);
                        // 获取文档备注
                        that.$refs.EditFooter.getDocumentNote(that.document_info.id);
                        setInterval(() => {
                            that.get_edit_doc_hcoin();
                        }, 1000 * 120);
                        //恢复文档操作记录
                        document_save.method.recovery_local_command_history(that);
                        document_save_error.method.init(that);
                    } else {
                        that.init_document_data_error(data);
                    }
                    complete_callback();
                });
            } else if (presetId || presetId == '') {
                // 预设版式
                let preset_success = function (page) {
                    let document_info = utils.deepClone(that.document_info);
                    let page_info = utils.deepClone(that.page_info);
                    if (page) {
                        page_info = page;
                    };
                    document_info['documentType'] = 'slides';
                    if (!page) {
                        page_info.title = `自定义版式${new Date().getTime()}`;
                    }
                    that.page_info = page_info;
                    that.document_page_list[0] = page_info;
                    that.change_doc_size(0, true);
                    complete_callback();
                };
                if (presetId == '') {
                    // 新建
                    preset_success();
                } else {
                    // 编辑
                    that.preset_id = Number(presetId);
                    that.$axios.get(`/api/member/mylayout/detail/`, { params: { id: presetId } }).then(function (data) {
                        if (data.data.code === '2') {
                            let page = JSON.parse(data.data.data.content)
                            page.title = data.data.data.name;
                            preset_success(page);
                        } else {
                            window.parent.show_custom_iframe = false;
                        }
                    });
                }
            } else {
                //空白
                let document_info = utils.deepClone(that.document_info);
                let document_page_list = utils.deepClone(that.document_page_list);
                let page_info = utils.deepClone(that.page_info);
                document_info['documentType'] = docType;
                document_page_list.push(page_info);
                success_callback(document_info, document_page_list, true);
                // 自定义尺寸处理
                if (!docSizeIndex) {
                    docSizeIndex = 10;
                    if (docRatio) {
                        that.doc_size_list[10].width = 1920;
                        that.doc_size_list[10].height = 1920 / docRatio;
                    } else {
                        that.doc_size_list[10].width = JSON.parse(docWidth);
                        that.doc_size_list[10].height = JSON.parse(docHeight);
                    }
                }
                that.change_doc_size(docSizeIndex, true);
                complete_callback();
            }
        },
        //初始化文档数据错误
        init_document_data_error: function (res) {
            let that = this;
            let content = res.data.content;
            let data = {};
            try {
                data = JSON.parse(res.data.data);
            } catch (error) { }
            if (content === 'documentAccessDenied' || content === '没有文档的相关权限') {
                // 不是文档协作者
                if (!data.collaborateRoleType && ['open', 'edit'].includes(data.visitType) && data.url) {
                    return window.location.href = `/document/slides/${data.url}/`;
                }
                if (data.collaborateRoleType === 'onlyView' && data.url) {
                    return window.location.href = `/document/slides/${data.url}/`;
                }
                return window.location.href = '/no_power/?type=edit';
            }
            window.location.href = '/edit/?docId=&pId=';
        },
        init_document_other_data: function () {
            this.$refs.editHead.initDocumentTitle();
        },
        //开始文档观察者
        start_document_watcher: function () {
            let that = this;
            //1、文档数据映射处理
            let document_data_mapping = function () {
                //1、浏览器URL
                let docId = that.document_info.id !== null ? that.document_info.id : '';
                let pId = that.page_info.id !== null ? that.page_info.id : '';
                let path;
                if (that.modal_id) {
                    path = '/edit/?modalId=' + that.modal_id + '&docId=' + docId + "&pId=" + pId;
                } else {
                    path = '/edit/?docId=' + docId + "&pId=" + pId;
                }
                that.$router.push({
                    path: path
                });
                //2、更新主题设置选中项
                let documentBackground = that.document_info.background,
                    documentShapeColor = that.document_info.shapeColor,
                    documentTextColor = that.document_info.textColor,
                    documentFont = that.document_info.font,
                    documentWidth = that.document_info.width,
                    documentHeight = that.document_info.height,
                    doc_theme_list = that.doc_theme_list,
                    doc_font_list = that.doc_font_list,
                    doc_size_list = that.doc_size_list;
                //主题
                let doc_theme_checked_index;
                $.each(doc_theme_list, function (i, item) {
                    if (item.background === documentBackground && item.shape === documentShapeColor && item.font === documentTextColor) {
                        doc_theme_checked_index = i;
                    } else {
                        if (typeof (doc_theme_checked_index) === 'undefined' && item.shape === documentShapeColor && item.font === documentTextColor) {
                            doc_theme_checked_index = i;
                        }
                    }
                    item.checked = false;
                });
                if (typeof (doc_theme_checked_index) === 'undefined') {
                    if (!documentBackground || documentBackground === null || documentBackground === "" ||
                        !documentShapeColor || documentShapeColor === null || documentShapeColor === "" ||
                        !documentTextColor || documentTextColor === null || documentTextColor === "") {
                        doc_theme_list[0].checked = true;
                    }
                } else {
                    doc_theme_list[doc_theme_checked_index].checked = true;
                }
                //字体
                $.each(doc_font_list, function (i, item) {
                    item.checked = item.data === documentFont ? true : false;
                });
                if (!documentFont || documentFont === null || documentFont === '') {
                    doc_font_list[0].checked = true;
                }
                //尺寸
                let doc_size = $.grep(doc_size_list, v => {
                    v.checked = false;
                    return v.width === documentWidth && v.height === documentHeight;
                })[0];
                if (doc_size && !that.show_custom_scale) {
                    doc_size.checked = true;
                    that.theme_checked.page_size_type = doc_size.name
                } else {
                    doc_size_list[10].checked = true;
                    that.theme_checked.page_size_type = '自定义'
                }
                that.theme_checked.width = documentWidth;
                that.theme_checked.height = documentHeight;
                //3、权限
                if (that.user_authority_type !== 'owner' && that.page_info.isLock) {
                    that.user_disable_edit = true;
                } else {
                    that.user_disable_edit = that.check_option_disable(that.page_authority.edit, that.document_option_authority);
                }
            };
            document_data_mapping();
            //2、文档观察者
            that.$watch(
                function () {
                    let that = this;
                    return document_save.method.get_document_data(that);;
                },
                function (newDocumentData, oldDocumentData) {
                    let that = this;
                    document_data_mapping();
                    document_save.method.save(that, oldDocumentData, newDocumentData);
                },
                {
                    deep: true
                }
            );
            that.start_document_observer();
        },
        //开始文档观察者(html)
        start_document_observer: function () {
            //一些业务方法(start_document_observer方法调用、html监听调用)
            let service = function () {
                //更新动画列表
                that.$refs.animation_modal && that.$refs.animation_modal.observer_update();
            }
            //过滤
            let observer_filter = function (mutations) {
                let pass = true;
                for (let i of mutations) {
                    //1、元素选中
                    if (i.attributeName === 'class' && i.target.className.indexOf('ele_item') >= 0) {
                        if ((i.oldValue.indexOf('lock') === -1 && i.target.className.indexOf('lock') === -1) ||
                            (i.oldValue.indexOf('lock') !== -1 && i.target.className.indexOf('lock') !== -1)) {
                            continue;
                        }
                    }
                    //2、图表聚焦
                    if ($(i.target).parents('.chart_content').get(0) < i.target) {
                        continue;
                    }
                    //3、画布容器修改
                    if ($(i.target).hasClass('page_contain')) {
                        continue;
                    }
                    pass = false;
                    break;
                }
                if (!pass) {
                    // 文本元素粘贴格式设置去除
                    for (let key in that.paste_textformat_map) {
                        let value = that.paste_textformat_map[key];
                        if (value > 3) {
                            that.clean_text_format(key);
                        } else {
                            that.paste_textformat_map[key]++;
                        }
                    }
                }
                return pass;
            }
            let that = this;
            let $page_contain = $('.page_contain');
            if (that.document_observer === null) {
                let timeout;
                that.document_observer = new MutationObserver(function (mutations, observe) {
                    service();
                    if (observer_filter(mutations)) {// 过滤不监听的节点修改
                        return;
                    }
                    let page_info = utils.deepClone(that.page_info);
                    let new_page_info = page_opt.get_page($page_contain.find('.edit_page'));
                    clearTimeout(timeout);
                    timeout = setTimeout(function () {
                        //输入法过滤
                        if (that.is_composition) {
                            return;
                        }
                        if (page_info.uuid !== new_page_info.uuid) {//校验修改数据
                            return;
                        }
                        $.map(page_info, function (value, key) {
                            if (typeof (new_page_info[key]) === 'undefined' || JSON.stringify(page_info[key]) === JSON.stringify(new_page_info[key])) {
                                return true;
                            }
                            if (key === 'elementList') {
                                let diff = document_command.method.get_element_different(value, new_page_info[key]);
                                page_info[key] = diff.redo;
                            } else {
                                page_info[key] = new_page_info[key];
                            }
                        });
                        let save_flag = false;
                        $.each(that.document_page_list, function (i, item) {
                            if (item.uuid === page_info.uuid) {
                                $.map(item, function (value, key) {
                                    if (typeof (page_info[key]) === 'undefined' || JSON.stringify(item[key]) === JSON.stringify(page_info[key])) {
                                        return true;
                                    }
                                    if (key === 'elementList') {
                                        item[key] = document_command.method.set_element_different(item[key], page_info[key]);
                                    } else {
                                        item[key] = page_info[key];
                                    }
                                    save_flag = true;
                                });
                                if (save_flag) {
                                    item.sign = utils.uuid();
                                    page_opt.save_cursor_position(that, true);
                                }
                                return false;
                            }
                        });
                    }, 200);
                });
            }
            let options = { childList: true, attributes: true, characterData: true, subtree: true, attributeOldValue: true };
            that.document_observer.observe($page_contain[0], options);
            service();
        },
        //停止文档观察者(html)
        stop_document_observer: function () {
            let that = this;
            if (that.document_observer === null) {
                return;
            }
            that.document_observer.disconnect();
        },
        // 开始艺术字观察者
        start_art_text_observer: function () {
            let that = this;
            // 观察者已存在时不重新赋值
            if (that.art_text_observer) return;
            let option = opt_factory.init_opt('group');
            let option_t = opt_factory.init_opt('text');
            let $page_contain = option.get_canvas_page();
            let shadow_class = ['art_douyin', 'art_neon', 'art_style_2', 'art_embed', 'art_color', 'art_style_3'];
            let id_arr = [];
            let observer_filter = function (mutations) {
                let pass = true;
                for (let i of mutations) {
                    // 非艺术字
                    if (!$(i.target).parents('.art').length && !$(i.target).hasClass('art')) {
                        continue;
                    }
                    // 非指定艺术字
                    let $art = $(i.target).hasClass('art') ? $(i.target) : $(i.target).parents('.art');
                    if (!utils.arrayCompareSameValue($art.attr('class').split(' '), shadow_class)) {
                        continue;
                    }
                    // 非修改艺术字内容
                    if (i.type !== 'characterData' && i.attributeName !== 'style') {
                        continue;
                    }
                    pass = false;
                    let id = $art.parents('.ele_item').attr('id');
                    // 数组中没有此元素id
                    if (!id_arr.includes(id)) {
                        id_arr.push(id);
                    }
                }
                return pass;
            }
            if (that.art_text_observer === null) {
                let timeout;
                that.art_text_observer = new MutationObserver((mutations) => {
                    if (observer_filter(mutations)) return;  //过滤不监听的节点修改
                    clearTimeout(timeout);
                    timeout = setTimeout(() => {
                        //输入法过滤
                        if (that.is_composition) {
                            return;
                        }
                        id_arr.forEach(item => {
                            let $ele = option.get_element(item);
                            option_t.art_upload_image($ele);
                        });
                        id_arr = [];
                    }, 1000)
                })
                let options = { childList: false, attributes: true, characterData: true, subtree: true };
                that.art_text_observer.observe($page_contain[0], options);
            }
        },
        // 停止艺术字观察者
        stop_art_text_observer: function () {
            let that = this;
            if (that.art_text_observer === null) {
                return;
            }
            that.art_text_observer.disconnect();
            that.art_text_observer = null;
        },
        //恢复文档
        recovery_document: function () {
            let that = this;
            //更新标识触发保存
            that.document_info.sign = utils.uuid();
            $.each(that.document_page_list, function (i, item) {
                item.sign = utils.uuid();
            });
            page_opt.render(that);
            that.init_document_other_data();
        },
        //保存文档
        save_document: function () {
            let that = this;
            if (that.save_document_flag) {
                return;
            }
            that.save_document_flag = true;
            if (that.document_info.uuid === null) {
                that.document_info.sign = utils.uuid();
            }
            that.$toast(`${that.document_info.modifyDate.indexOf('失败') > -1 ? '保存失败' : '不要担心，我们会为你自动保存文件'}`, 1000, function () {
                that.save_document_flag = false;
            });
        },
        //撤回/重做文档
        undo_redo_document: function (type) {
            let that = this;
            let command = document_save.method.undo_redo(that, type);
            let cursor_position;
            if (typeof (command) !== 'undefined') {
                cursor_position = command.cursor_position
            }
            page_opt.render(that, null, cursor_position);
            that.init_document_other_data();
        },
        //添加文档页(add_page_info:新增文档页,use_theme:是否使用主题)
        add_page: function (add_page_info, use_theme) {
            let that = this;
            page_opt.add(that, { target_page_info_uuid: that.page_info.uuid, add_page_infos: add_page_info, use_theme: use_theme });
        },
        //删除文档页(uuid:文档页uuid)
        delete_page: function (uuid) {
            let that = this;
            page_opt.delete(that, uuid);
        },
        //复制文档页(uuid:文档页uuid)
        copy_page: function (uuid) {
            let that = this;
            page_opt.copy(that, uuid);
        },
        //锁定文档页(uuid:文档页uuid)
        lock_page: function (uuid) {
            let that = this;
            page_opt.lock(that, uuid);
        },
        // 清除画布状态
        clear_page_status: function () {
            // 左侧栏输入框失焦
            $(".edit_left input").blur();
            // 文档、文档页标题失焦
            this.$refs.editHead.blurTitle();

            /* 组件状态栏重置 */
            // 关闭主题弹框
            this.$refs.theme_modal && this.$refs.theme_modal.close();
            // 清空绘制工具栏状态
            this.$refs.editHead && this.$refs.editHead.clearToolStatus();
            // 关闭背景设置面板
            this.$refs.background_setting && this.$refs.background_setting.close();
            // 清空序列表状态
            this.$refs.sort_page_modal && this.$refs.sort_page_modal.clear_modal();
        },
        // 计算适配屏幕缩放（最佳比例）
        compute_suitable_scale: function () {
            /*
            *   触发节点：1. 空文档进入编辑；2. 非空文档获取文档详情后；3. 文档比例设置发生改变；4. 浏览器宽高发生改变
            * */
            let that = this,
                ratio = that.document_info.width / that.document_info.height,
                body_width = $('.edit_content').width(),
                body_height = $('.edit_content').height(),
                max_w = body_width - (page_opt.page_size.left_panel + page_opt.page_size.left_offset + page_opt.page_size.right_panel + page_opt.page_size.right_offset),
                max_h = body_height - (page_opt.page_size.top_panel + page_opt.page_size.top_offset + page_opt.page_size.bottom_panel),
                page_w, page_h;
            // 按比例计算当前页面是否适配
            if (max_w / ratio > max_h) {
                page_w = max_h * ratio;
                page_h = max_h;
            } else {
                page_w = max_w;
                page_h = max_w / ratio;
            }
            // 计算当前最佳比例，画布缩放最多应用小数点后2位
            let suitable = Number(page_w / that.document_info.width);
            suitable = Math.floor(suitable * 100) / 100;
            that.page_scale.suitable = suitable;
            // 设置列表 - 适配屏幕比例值
            that.$refs.EditFooter.scaleList[5].scale = that.page_scale.suitable;
            // 应用比例
            that.$refs.EditFooter.applyScale(suitable);
        },
        // 画布框选方法
        page_box_select: function (event) {
            let that = this;
            let option = opt_factory.init_opt('group');
            let $select_box = $(".operate_mouse_select");
            let page_rect = option.fn.get_client_rect(option.get_canvas_page());
            let down_x = event.clientX - page_rect.left;
            let down_y = event.clientY - page_rect.top;
            event.preventDefault();
            $(document).on('mousemove', function (ev) {
                let move_x = ev.clientX - down_x - page_rect.left;
                let move_y = ev.clientY - down_y - page_rect.top;
                if (move_x && move_y) {
                    $select_box.show();
                }
                // x 正负数判断
                if (move_x > 0) {
                    $select_box.css({
                        "left": down_x,
                        "width": move_x
                    });
                } else if (move_x < 0) {
                    $select_box.css({
                        "left": down_x - Math.abs(move_x),
                        "width": Math.abs(move_x)
                    });
                }
                // y 正负数判断
                if (move_y > 0) {
                    $select_box.css({
                        "top": down_y,
                        "height": move_y
                    });
                } else if (move_y < 0) {
                    $select_box.css({
                        "top": down_y - Math.abs(move_y),
                        "height": Math.abs(move_y)
                    });
                }
            });
            $(document).on('mouseup', function (ev) {
                // 框选范围大于1时判断选中
                if ($select_box.width() > 1 && $select_box.height() > 1) {
                    let select_t = $select_box.position().top;
                    let select_l = $select_box.position().left;
                    let select_r = $select_box.width() + select_l;
                    let select_b = $select_box.height() + select_t;
                    let $eles = option.get_filter_element('lock');
                    // 判断选中范围
                    $eles.each((i, el) => {
                        let $ele = $(el);
                        let id = $ele.attr('id');
                        if (id) {
                            let ele_rect = option.compute_ele_seat($ele).page_scaled;
                            /*判断  &&
                                左上角碰撞检测
                                    元素左偏移量 <= 拉选框的宽 + 左偏移量
                                    元素上偏移量 <= 拉选框的高 + 上偏移量
                                右下角碰撞检测
                                    元素的宽 + 左偏移量 >= 拉选框左偏移量
                                    元素的高 + 上偏移量 >= 拉选框上偏移量
                            */
                            if ((ele_rect.x <= select_r && ele_rect.y <= select_b) && ((ele_rect.x + ele_rect.w) >= select_l && (ele_rect.y + ele_rect.h) >= select_t)) {
                                // 去除已被其他协作者选中的元素
                                if (!that.checked_id_arr[that.page_info.uuid] || that.checked_id_arr[that.page_info.uuid].indexOf(id) < 0) {
                                    option.get_group_element($ele).addClass("checked");
                                }
                            }
                        }
                    });
                    // 获取选中元素
                    let $checked = option.get_checked_element().element;
                    // 选中元素
                    that.set_ele_checked($checked);
                }
                // 还原拉框选节点
                $select_box.attr("style", "").hide();
                that.page_state = 'common';
                $(document).unbind('mousemove');
                $(document).unbind('mouseup');
            });
        },
        // 右键画布拖动
        drag_page: function (e) {
            let that = this,
                move = { x: 0, y: 0 },
                scroll = {
                    x: that.$refs.drag_page.scrollLeft,
                    y: that.$refs.drag_page.scrollTop
                },
                had_move = false;
            if (that.page_scale.less) return $('body').removeClass('grabbing');
            $(document).on('mousemove', function (e) {
                e.preventDefault();
                move.x += e.originalEvent.movementX;
                move.y += e.originalEvent.movementY;
                if (Math.abs(move.x) <= 1 || Math.abs(move.y) <= 1) return false;
                that.$refs.drag_page.scrollTop = scroll.y - move.y;
                that.$refs.drag_page.scrollLeft = scroll.x - move.x;
                had_move = true;
                that.build_ele_masking();
                that.ele_cancel_checked();
            });
            $(document).on('mouseup', function (e) {
                $('body').removeClass('grabbing');
                $(document).unbind('mousemove');
                $(document).unbind('mouseup');
                // 拖动画布不触发画布右键菜单
                if (had_move) {
                    document.oncontextmenu = function (e) {
                        e.preventDefault()
                    };
                } else {
                    document.oncontextmenu = that.mousemenu_listener;
                }
            });
        },
        // 画布绘制事件
        page_create_event: function(e, lock) {
            const that = this;
            // 判断是否为锁定元素
            if (lock) {
                let {pageX: oldX, pageY: oldY,} = e;
                let mousemoveCancelChecked = function (mousemoveCancelCheckedEvent) {
                    let {pageX: moveX, pageY: moveY} = mousemoveCancelCheckedEvent;
                    let distanceX = Math.abs(moveX - oldX);
                    let distanceY = Math.abs(moveY - oldY);
                    // 移动容错 3px
                    if(distanceX > 3 || distanceY > 3){
                        that.ele_cancel_checked();
                        $(document).off('mousemove', mousemoveCancelChecked);
                    }
                }
                $(document).on('mousemove', mousemoveCancelChecked);
                $(document).one('mouseup', () => $(document).off('mousemove', mousemoveCancelChecked));
            } else {
                // 清除元素选中状态
                that.ele_cancel_checked();
            }
            switch (that.page_state) {
                // 判断当前为生成文本元素状态
                case 'create_text':
                    that.text_draw(e);
                    break;
                // 判断当前为生成线条元素状态
                case 'create_line':
                    that.line_draw(e);
                    break;
                // 判断当前为生成形状元素状态
                case 'create_shape':
                    that.shape_draw(e);
                    break;
                // 拖动画布时，不触发画布框选
                case 'drag_page':
                    break;
                // 其他情况下，触发画布框选
                default:
                    that.page_state = 'box_select';
                    that.page_box_select(e);
                    break;
            }
            e.stopPropagation();
        },
        // 打开背景设置弹框
        open_background_setting: function (type) {
            let bg_opt = page_opt.fn.clone_object(this.page_info).background;
            if (!type || typeof (type) !== 'string') type = bg_opt.type;
            this.$refs.animation_modal && this.$refs.animation_modal.hide();
            this.$refs.background_setting && this.$refs.background_setting.open('page', bg_opt, type);
        },
        // 去除文档页背景图
        remove_background_image: function () {
            let that = this;
            let $page = $('.page_contain .edit_page');
            page_opt.set_page_background($page, {
                type: 'color',
                color: that.page_info.background.color || "#ffffff",
                image: null
            });
        },
        // 更换文档页背景图类型
        change_background_type: function (type) {
            let that = this;
            let $page = $('.page_contain .edit_page');
            let bg_opt = page_opt.fn.clone_object(that.page_info).background;
            bg_opt.image.type = type;
            page_opt.set_page_background($page, bg_opt);
            if (that.$refs.background_setting) that.$refs.background_setting.current_fill_type = type;
        },
        // 初始化网格
        init_canvas_grid: function () {
            let that = this;
            let { width, height } = that.document_info;
            let size = 'middle';
            if (that.user_personal_config && that.user_personal_config['grid']) {
                size = that.user_personal_config['grid'];
            }
            that.grid_using = false;
            if (!width || !height) {
                return console.error('get canvas size error! build grid is error');
            }
            // 生成网格坐标方法
            let create = size => {
                let obj = { x: [], y: [], };
                let w = Math.ceil(width / size);
                let h = Math.ceil(height / size);
                let x = (width - size * (w - 1)) / 2;
                let y = (height - size * (h - 1)) / 2;
                for (let i = 0; i < w; i++) {
                    obj.x.push(i * size + x);
                }
                for (let i = 0; i < h; i++) {
                    obj.y.push(i * size + y);
                }
                return obj;
            }
            that.grid_model = {
                'small': create(that.grid_size.s),
                'middle': create(that.grid_size.m),
                'large': create(that.grid_size.l),
            };
            // 网格默认显示状态：中号
            if (that.user_personal_config && that.user_personal_config['grid'] == false) return;
            that.grid_using = size;
            that.grid_using_render();
        },
        // 渲染网格
        grid_using_render: function () {
            let result = '';
            let model = this.grid_model[this.grid_using];
            if (model) {
                let x = model.x[0];
                let y = model.y[0];
                let width = model.x[model.x.length - 1];
                let height = model.y[model.y.length - 1];
                // 生成 竖线
                result += model.x.map(i => {
                    return `M${i},${y}L${i},${height}`;
                }).join('');
                // 生成 横线
                result += model.y.map(i => {
                    return `M${x},${i}L${width},${i}`;
                }).join('');
            }
            this.grid_path_value = result;
        },
        // 显示/隐藏网格线
        toggle_grid_display: function (b) {
            if (this.grid_using) {
                $('#grid-template-loader path').css('opacity', Number(!!b));
            }
        },
        // 下载背景图或图片
        download_image: function(type) {
            let that = this;
            // 更新会员权限
            that.update_login_state();
            // 不是会员时，弹框提示充值
            if (that.user.memberVip === 'free') {
                that.$modal({
                    modalTitle: '提示',
                    modalContent: '下载此素材需升级会员权限',
                    showSubmit: true,
                    showCancel: true,
                    buttonSubmitTxt: '升级会员',
                    modalClass: 'upgrade_tip',
                    submitCallback: function (modal) {
                        that.$modal({ templateType: 'memberGrade' });
                        modal.close();
                    }
                });
                return;
            }
            // 是会员则直接进行下载
            let image_src;
            if (type === 'background') {
                image_src = that.page_info.background.image.src;
            } else {
                image_src = that.element_message.image_src;
            }
            // 下载素材
            that.$export.download_material({ largeImage: image_src });
        },
        /*文档相关方法 end*/

        /** 元素吸附 & 参考线设置 */
        // 设置元素吸附坐标
        set_autofit: function () {
            let that = this;
            let { width, height } = that.document_info;
            let option = opt_factory.init_opt('group');
            // 生成相对于画布的自动贴合点
            let autofit_x = [0, width / 2, width];
            let autofit_y = [0, height / 2, height];
            // 生成相对于其他元素的自动贴合点
            option.get_filter_element('checked').each((i, ele) => {
                let rect = option.compute_ele_seat($(ele)).page;
                autofit_x.push(rect.x, rect.x + rect.w / 2, rect.x + rect.w);
                autofit_y.push(rect.y, rect.y + rect.h / 2, rect.y + rect.h);
            });
            // 从小到大重新排序并去重
            autofit_x = [...new Set(autofit_x.insertSort((a, b) => a - b))];
            autofit_y = [...new Set(autofit_y.insertSort((a, b) => a - b))];
            // 合并网格线自动贴合点并去重
            if (that.grid_using) {
                let grid_model = that.grid_model[that.grid_using];
                if (grid_model) {
                    autofit_x = [...new Set(autofit_x.concat(grid_model.x).insertSort((a, b) => a - b))];
                    autofit_y = [...new Set(autofit_y.concat(grid_model.y).insertSort((a, b) => a - b))];
                }
            }
            that.autofit_point = {
                x: autofit_x,
                y: autofit_y,
            }
        },
        // 更新参考线
        update_reference_line: function (xarr = [], yarr = []) {
            this.reference_line_point = {
                x: xarr,
                y: yarr,
            };
        },
        /** 元素吸附 & 参考线设置 end */

        /*通用元素方法 start*/
        // 设置元素选中
        set_ele_checked: function (ele, obj = {}) {
            if (!ele.length) return false;
            // 默认参数
            let params = {
                wireframe: true // 是否更新虚线框
            }
            Object.assign(params, obj);
            let that = this;
            let sole = ele.length === 1;
            let type = sole ? ele.attr('data-type') : 'group';
            let option = opt_factory.init_opt(type);
            let result = option.select(ele);
            that.element_message = result;
            // 开启艺术字观察者
            that.start_art_text_observer();
            // 清除可编辑操作点
            operate_opt.buildPoint();
            if (type === 'shape') {
                // 形状元素编辑
                edit_shape_point(ele, (fillet, fillet_max) => {
                    that.element_message.rect_fillet = fillet;
                    that.element_message.rect_fillet_max = fillet_max;
                });
            } else if (type === 'line') {
                // 线条元素编辑
                edit_line_point(ele);
            }
            // 获取元素超链接信息
            if (sole && ele.find('.ele_rotate').attr('title')) {
                that.get_ele_link_info(ele);
            }
            // 获取粘贴元素信息
            if (sole && that.paste_textformat_map[ele.attr('id')]) {
                that.text_format_show(ele);
            }
            // 计算选中元素属性
            that.element_type_change();
            // 通讯推送元素选中
            that.get_ws_checked_message();
            // 更新元素动画选中
            that.$refs.animation_modal && that.$refs.animation_modal.animation_list_select();
            // 更新动画元素标记选中
            that.animation_mark_checked();
            operate_opt.reset_rect(ele, params); // 更新虚线框
            that.$nextTick(()=>{
                operate_opt.set_format_position(ele);
            });
            // 失焦
            $('input, textarea').blur();
        },
        // 元素层级设置方法
        set_ele_level: function (type) {
            let that = this,
                $checked = $('.page_contain .ele_item.checked'),
                option = opt_factory.init_opt('group');
            switch (type) {
                case 'top':
                    option.set_level.top($checked);
                    break;
                case 'bottom':
                    option.set_level.bottom($checked);
                    break;
                default:
                    option.set_level.change($checked, type);
                    break;
            }
        },
        // 元素组合设置方法
        set_ele_group: function () {
            let that = this,
                $checked = $('.page_contain .ele_item.checked'),
                option = opt_factory.init_opt('group');
            if (that.is_group) {
                that.ele_cancel_checked();
                that.$toast('拆分成功', 800);
            } else if (that.select_group_child) {
                let group_id = $checked.attr('data-group');
                if (group_id) {
                    $checked = $(`.page_contain .ele_item[data-group='${group_id}']`)
                }
            } else {
                that.$toast('组合成功', 800);
            }
            that.element_message.is_group = !that.is_group;
            option.toggle_group($checked);
            that.element_type_change();
            // 更新虚线框
            operate_opt.reset_rect($checked);
        },
        // 元素锁定设置方法
        set_ele_lock: function () {
            let that = this,
                $checked = $('.page_contain .ele_item.checked'),
                option = opt_factory.init_opt('group');
            that.show_unlock = false;
            // 多选锁定先组合(锁定同进同出)，组合解锁拆分
            if ($checked.length > 1 && that.is_group && $checked.hasClass('lock')) {
                // 组合元素且锁定状态需要解锁拆分
                that.set_ele_group();
            } else if ($checked.length > 1 && !that.is_group && !$checked.hasClass('lock')) {
                // 非组合元素且非锁定需要先组合在锁定
                that.set_ele_group();
            } else if (that.select_group_child) {
                // 组合内选中元素锁定隐藏外框且解开组合
                $('.group_operate').hide();
                that.set_ele_group();
            }
            // 执行锁定 || 解锁
            option.toggle_locked($checked);
            // 更新虚线框
            operate_opt.reset_rect($checked);
            // 更新元素信息
            that.element_type_change();
        },
        // 设置文本对齐
        set_text_align: function(ele, data) {
            opt_factory.init_opt('group').ele_set_align(ele, data);
            this.element_message.text_align = data;
        },
        // 站内富文本复制处理
        inside_text_copy: function (type) {
            let that = this;
            let node_obj = editor_opt.range_node_handle();
            let text_range = node_obj.range;
            let textArea = document.createElement("div");
            // 剪切去除选取部分
            if (type === 'cut') document.execCommand('delete');
            // 生成虚拟编辑区域
            textArea.style.position = 'fixed';
            textArea.style.top = 0;
            textArea.style.left = 0;
            textArea.style.width = '2em';
            textArea.style.height = '2em';
            textArea.className = 'InsideCopyEdit';
            textArea.setAttribute('contenteditable', true);
            // 添加站内标识
            textArea.innerHTML = node_obj.value.innerHTML;
            document.body.appendChild(textArea);
            // 选中文本
            editor_opt.set_selection(textArea)
            try {
                document.execCommand('copy');
            } catch (err) {
                console.error('copy unsuccessful');
            }
            // 移除节点
            document.body.removeChild(textArea);
            // 恢复选区
            setTimeout(() => {
                if (document.selection) {
                    text_range.select();
                } else if (window.getSelection) {
                    window.getSelection().removeAllRanges();
                    window.getSelection().addRange(text_range);
                }
            }, 0);
        },
        // 剪切板数据类型判断&抽取 (isSimulation 是否为拷贝操作)
        clipboard_data_handle: function (event, isSimulation) {
            let that = this;
            let clipboard_text = '';
            let clipboard_html = '';
            let start_str_window = '<!--StartFragment-->';
            let start_str_os = '<meta';
            let option = opt_factory.init_opt('group');
            let paste_content = '';
            let has_file = false;
            let from_inside = false;
            let result = {};

            if (isSimulation) {
                clipboard_text = that.fictitious_copy_text;
            } else {
                clipboard_text = (!!window.ActiveXObject || "ActiveXObject" in window) ? window.clipboardData.getData("text") : event.clipboardData.getData("text");
                clipboard_html = (!!window.ActiveXObject || "ActiveXObject" in window) ? window.clipboardData.getData("text/html") : event.clipboardData.getData("text/html");
            };
            result = {
                type: '',
                text: option.fn.unicodehandle(clipboard_text),
                value: option.fn.unicodehandle(clipboard_text),
            };
            let file_item = '';
            let file_items = '';
            if (!isSimulation) {
                // 判断是否存在图片文件
                // 部分浏览器不支持获取files,用items可兼容更多浏览器
                file_item = '';
                file_items = event.clipboardData.items;
                if (file_items && file_items.length && event.clipboardData.types.includes(`Files`)) {
                    for (var i = 0; i < file_items.length; i++) {
                        let {kind, type} = file_items[i];
                        if (kind === 'file') {
                            if (type.match(/^image\//i)) {
                                file_item = file_items[i];
                                break;
                            } else {
                                return that.$toast('不支持粘贴该文件类型');
                            }
                        }
                    }
                    if (file_item) {
                        has_file = true;
                    }
                }
            }
            // 判断&去除站内文本标识
            if (clipboard_html.indexOf('text-indent: -999px') >= 0) {
                from_inside = true;
                clipboard_html = clipboard_html.replace('text-indent: -999px; ', '')
            }
            switch (true) {
                // 文件（图片）
                case has_file && clipboard_text === '':
                    result.type = 'file';
                    result.value = []
                    result.value.push(file_item.getAsFile());
                    break;
                // 站内元素
                case clipboard_text.indexOf('{&copy;}') === 0 && clipboard_text.indexOf('<html>') < 0:
                    result.type = 'element';
                    result.value = JSON.parse(clipboard_text.slice(8));
                    break;
                // 站外svg
                case clipboard_text.indexOf('<svg') >= 0:
                    result.type = 'svg';
                    break;
                // 站外表格
                case /\r\n/.test(clipboard_text) && event.clipboardData.getData('text/html').indexOf('</table>') > -1:
                    result.type = 'table';
                    if (clipboard_html.indexOf(start_str_window) >= 0) {
                        let start = clipboard_html.indexOf(start_str_window) + start_str_window.length,
                            end = clipboard_html.indexOf('<!--EndFragment-->');
                        clipboard_html = clipboard_html.slice(start, end);
                    } else if (clipboard_html.indexOf(start_str_os) >= 0) {
                        // 苹果系统剪贴板前缀：<meta charset='utf-8'>
                        clipboard_html = clipboard_html.slice(22);
                    }
                    result.value = option.fn.unicodehandle(clipboard_html);
                    break;
                // 文本
                default:
                    result.type = 'text';
                    // 链接自动识别
                    let url_reg = /(http(s?):\/\/|www)((\w|=|\?|\.|\/|&|-)+)/g;
                    // 粘贴的文本带着链接 且 不是富文本  判断条件待优化
                    if (clipboard_text.match(url_reg) && clipboard_html.indexOf('</a>') < 0) {
                        let url_arr = clipboard_text.match(url_reg);
                        if (clipboard_html === '') {
                            let new_html = clipboard_text;
                            $.each(url_arr, function (i, item) {
                                new_html = new_html.replace(item, `<span style="color: rgb(0, 0, 238);text-decoration: underline;"><a href="${item}">${item}</a></span>`);
                            })
                            clipboard_html = new_html;
                        } else {
                            $.each(url_arr, function (i, item) {
                                clipboard_html = clipboard_html.replace(item, `<a href="${item}">${item}</a>`)
                            })
                        }
                    }
                    // 站外文本
                    if (!from_inside) {
                        if (clipboard_html === '') {
                            // 标签转义
                            clipboard_text = clipboard_text.replace(/</g, "&lt;");
                            clipboard_text = clipboard_text.replace(/>/g, "&gt;");
                            result.value = `<span>${clipboard_text}</span>`;
                            return result;
                        }
                    }
                    // 站内文本
                    else {
                        if (clipboard_html === '') {
                            clipboard_html = clipboard_text
                        }
                    }
                    // 提取富文本内容
                    if (clipboard_html.indexOf(start_str_window) >= 0) {
                        let start = clipboard_html.indexOf(start_str_window) + start_str_window.length,
                            end = clipboard_html.indexOf('<!--EndFragment-->');
                        clipboard_html = clipboard_html.slice(start, end);
                    } else if (clipboard_html.indexOf(start_str_os) >= 0) {
                        // 苹果系统剪贴板前缀：<meta charset='utf-8'>
                        clipboard_html = clipboard_html.slice(22);
                    }
                    // 处理剪贴板内容
                    let $outer = $('<div></div>').html(clipboard_html).css('display', 'none'),
                        $child = $outer.children();
                    $outer.appendTo($('body'));
                    // 格式化处理
                    $child.each(function () {
                        editor_opt.format_paste_text($outer, $(this), from_inside)
                    });
                    paste_content = $outer[0].innerHTML;
                    // 特殊字符处理
                    result.value = option.fn.unicodehandle(paste_content);
                    // 站内复制纯文本覆盖
                    if (from_inside) result.text = $outer[0].innerText;
                    // 移除容器节点
                    $outer.remove();
                    break;
            }
            return result;
        },
        // 更新 Clipboard API 的支持情况
        clipboard_update_support: function() {
            let that = this;
            // 判断是否有权限
            if ('clipboard' in navigator) {
                navigator.clipboard.readText().then(() => {
                    that.clipboard_api_support = true;
                }).catch(err => {
                    that.clipboard_api_support = false;
                });
            } else {
                that.clipboard_api_support = false;
            }
        },
        // 创建一个带剪贴板数据的 ClipboardEvent
        clipboard_create_event: function(type) {
            return new Promise((resolve, reject) => {
                if ('clipboard' in navigator) {
                    navigator.clipboard.read().then(clipboardItems => {
                        let clipboardItem = clipboardItems[0];
                        let clipboardItemTypes = clipboardItem.types;

                        // 模拟 粘贴事件对象
                        let clipboardData = new DataTransfer();
                        clipboardData.effectAllowed = `uninitialized`;

                        // 已添加数据 DataTransfer.item 的个数
                        let clipboardDataItemsLength = 0;
                        let addClipboardDataLength = () => {
                            clipboardDataItemsLength++;
                            if(clipboardDataItemsLength === clipboardItemTypes.length) {
                                let clipboardEvent = new ClipboardEvent(type, { clipboardData });
                                resolve(clipboardEvent);
                            }
                        }
                        // 遍历剪贴板的所有类型数据
                        clipboardItemTypes.forEach(clipType => {
                            clipboardItem.getType(clipType).then(clipboardBlob => {
                                switch (clipType) {
                                    case 'text/plain':
                                    case 'text/html':
                                        clipboardBlob.text().then(clipboardStrData => {
                                            clipboardData.setData(clipType, clipboardStrData);
                                            addClipboardDataLength();
                                        });
                                        break;
                                    case 'image/png':
                                        let pngFile = new File([clipboardBlob], `${new Date().getTime()}.png`, { type: clipType });
                                        clipboardData.items.add(pngFile);
                                        addClipboardDataLength();
                                        break;
                                    default:
                                        addClipboardDataLength();
                                        break;
                                }
                            });
                        });
                    }).catch(reject);
                } else {
                    reject('clipboard not in navigator!');
                }
            });
        },
        // 模拟粘贴操作
        simulatedPaste: function () {
            this.clipboard_create_event('paste').then(e => {
                let {type, focusNode} = window.getSelection();
                switch(type) {
                    case `None`:
                        document.dispatchEvent(e);
                        break;
                    case `Caret`:
                    case `Range`:
                        let targetElement = focusNode;
                        // 文本节点绑定不了事件
                        if(focusNode.nodeType === 3) {
                            targetElement = focusNode.parentElement;
                        }
                        targetElement.addEventListener('paste', this.paste_listener);
                        targetElement.dispatchEvent(e);
                        targetElement.removeEventListener('paste', this.paste_listener);
                        break;
                }
            }).catch(err => {
                this.$toast(`粘贴失败，请使用${ utils.deviceENV().mac ? 'Command' : 'Ctrl'}+V粘贴`, 1000);
                console.warn(err);
            });
        },
        // 元素粘贴方法 obj:{list: array, group: array, outside:ture|false}, setting:{center: 是否居中, resize: 是否重置大小,deviation: 是否设置偏差}
        ele_paste: function (obj, setting, paste) {
            let that = this;
            // 参数处理
            if (!setting) setting = {};
            // 错误状态判断
            if (!obj || !obj.list || typeof obj.list !== 'object' || obj.list.length <= 0) {
                console.error('params type error');
                return false;
            }
            let $copy_btn = $('#fictitious_copy'),
                option = opt_factory.init_opt('group'),
                result = option.ele_paste(that, obj, setting.deviation);
            // 清除元素选中
            that.ele_cancel_checked();
            // 选中元素
            if (result.list.length === 1) {
                let ele = result.list[0],
                    $ele = $('.page_contain').find('#' + ele.id);
                // 重置形状大小
                if (setting.resize) opt_factory.init_opt('shape').fit_dom_size($ele);
                // 设置居中
                if (setting.center) option.fit_dom_offset($ele);
                if ($ele.attr('data-type') === 'table') {
                    opt_factory.init_opt('table').table_edit_listener($ele);
                } else if ($ele.attr('data-type') === 'text') {
                    that.element_message.h = opt_factory.init_opt('text').set_ele_sync_content($ele);
                    if (paste && paste.type === 'text') {
                        that.set_paste_textformat($ele.attr('id'));
                        that.text_format_show($ele);
                    }
                }
                // 选中元素
                that.set_ele_checked($ele);
                if ($ele.hasClass('lock')) {
                    that.set_ele_lock();
                }
            } else if (result.list.length > 1) {
                result.list.forEach(function (item) {
                    let ele = item,
                        $ele = $('.page_contain').find('#' + ele.id);
                    $ele.addClass('checked');
                });
                let $checked = $('.page_contain .ele_item.checked');
                // 自适应size
                if (setting.resize) {
                    let group_offset = option.compute_ele_seat($checked).page;
                    let group_scale_x = document.querySelector('#page_contain #edit_page').offsetWidth / 5 / group_offset.w,
                        group_scale_y = group_scale_x * group_offset.h / group_offset.h;
                    $checked.each(function () {
                        let $ele = $(this),
                            type = $ele.attr('data-type'),
                            option = opt_factory.init_opt(type),
                            ele_offset = option.compute_ele_offset($ele).page,
                            n_w = ele_offset.w * group_scale_x,
                            n_h = ele_offset.h * group_scale_y,
                            n_x = group_offset.x + (ele_offset.x - group_offset.x) * group_scale_x,
                            n_y = group_offset.y + (ele_offset.y - group_offset.y) * group_scale_y;
                        // 设置尺寸
                        option.set_size($ele, { w: n_w, h: n_h });
                        // 设置坐标
                        option.set_translate($ele, n_x, n_y);
                    });
                }
                // 设置居中
                if (setting.center) option.fit_dom_offset($checked);
                // 选中元素
                that.set_ele_checked($checked);
                if ($checked.hasClass('lock')) {
                    that.set_ele_lock();
                }
            }
            // 站外复制重新赋值会导致无法文本框内二次粘贴
            if (obj.outside) return false;
            // 更新剪贴板内容
            let clipboard = { pageUuid: that.page_info.uuid, list: result.list, group: result.group };
            that.fictitious_copy_text = '{&copy;}' + JSON.stringify(clipboard);
            that.$nextTick(function () { $copy_btn.click(); });
        },
        // 清除元素粘贴方法
        clear_ele_paste: function () {
            let that = this;
            let $copy_btn = $('#fictitious_copy');
            // 同步到剪贴板
            that.fictitious_copy_text = '{&copy;}{}';
            that.$nextTick(function () { $copy_btn.click(); });
        },
        // 元素复制方法（needPaste 是否需要直接粘贴）
        ele_copy: function (e, needPaste) {
            let that = this,
                $ele = $('.page_contain .ele_item.checked'),
                $copy_btn = $('#fictitious_copy'),
                select_text = window.getSelection ? window.getSelection() : document.selection.createRange().text,
                is_other = $ele.length === 0,
                is_lock = $ele.hasClass('lock'),
                is_text = !!(select_text && select_text.type === 'Range' && !select_text.isCollapsed && $(select_text.focusNode).parents('[contenteditable="true"]').length),
                is_table = !select_text.focusNode && $ele.length && $ele.attr('data-type') === 'table' && !!($ele.find('.cel_selected').length || $ele.find('.cel_edit').length),
                is_fakeEditor = e.target && (e.target.className === 'InsideCopyEdit' || $(e.target).parents('.InsideCopyEdit').length > 0),
                option = opt_factory.init_opt('group'),
                result = '',
                text_range = '';
            that.copy_element_flag = that.copy_element_flag + 1;
            // 重复触发拦截
            if (e && (e.target.type === 'textarea' || is_fakeEditor)) return false;
            switch (true) {
                // 单元格复制
                case is_table:
                    option = opt_factory.init_opt('table');
                    result = JSON.stringify(option.copy_cel_content($ele));
                    break;
                // 富文本复制
                case is_text:
                    // 站内富文本复制处理
                    that.inside_text_copy('copy');
                    return false;
                    break;
                // 画布外其他文本复制
                case is_other:
                    return false;
                    break;
                // 其他元素复制
                default:
                    result = JSON.stringify(option.ele_copy($ele, that.page_info));
                    break;
            }
            // 频率控制
            if (result === '') return false;
            // 添加站内标识
            that.fictitious_copy_text = '{&copy;}' + result;
            // 覆盖剪贴板
            that.$nextTick(function () { $copy_btn.click(); });
            // 直接粘贴
            if (needPaste) {
                that.paste_listener(e, true);
            } else {
                that.copy_element_flag % 20 === 1 && that.$toast(`复制成功，请使用${utils.deviceENV().mac ? 'Command+' : 'Ctrl+'}V粘贴`, 1000);
            }
        },
        // 元素剪切方法
        ele_cut: function (e) {
            let that = this,
                $ele = $('.page_contain .ele_item.checked'),
                $copy_btn = $('#fictitious_copy'),
                select_text = window.getSelection ? window.getSelection() : document.selection.createRange().text,
                is_lock = $ele.hasClass('lock'),
                is_text = !!(select_text && select_text.type === 'Range' && !select_text.isCollapsed && $(select_text.focusNode).parents('[contenteditable="true"]').length),
                option = opt_factory.init_opt('group'),
                result = '';
            // 重复触发拦截
            if (e && e.target.type === 'textarea') return false;
            switch (true) {
                // 富文本复制
                case is_text:
                    // 站内富文本复制处理
                    that.inside_text_copy('cut');
                    break;
                // 锁定元素复制
                case is_lock:
                    that.$toast('此元素已被锁定，请解锁后操作', 800);
                    return false;
                // 其他元素复制
                default:
                    result = JSON.stringify(option.ele_cut($ele, that.page_info));
                    break;
            }
            // 频率控制
            if (result === '') return false;
            // 添加站内标识
            that.fictitious_copy_text = '{&copy;}' + result;
            // 覆盖剪贴板
            that.$nextTick(function () { $copy_btn.click(); });
            // 去除元素选中
            that.ele_cancel_checked();
            that.$toast(`剪切成功，请使用${utils.deviceENV().mac ? 'Command+' : 'Ctrl+'}V粘贴`, 1000);
        },
        // 元素删除方法
        ele_delete: function () {
            let that = this,
                $ele = $('.page_contain .ele_item.checked'),
                option = opt_factory.init_opt('group');
            // 删除元素
            option.ele_delete($ele);
            // 去除元素选中
            that.ele_cancel_checked();
        },
        // 元素全选方法
        ele_selectAll: function () {
            let that = this;
            // 取消全部选中
            that.ele_cancel_checked();
            // 获取全部元素
            let $ele = $('.page_contain .ele_item:not(.lock)');
            if ($ele.length > 0) {
                $ele.each(function () {
                    $(this).addClass('checked');
                });
                // 去除已被其他协作者选中的元素
                $.each($ele, function (i, item) {
                    let id = $(item).attr('id');
                    if (that.checked_id_arr[that.page_info.uuid] && that.checked_id_arr[that.page_info.uuid].indexOf(id) >= 0) {
                        $(item).removeClass('checked');
                    }
                });
                // 获取选中元素
                $ele = $('.page_contain .ele_item.checked');
                // 选中元素
                that.set_ele_checked($ele);
            } else {
                that.$toast('没有选择到元素', 800);
            }
        },
        // 取消选中
        ele_cancel_checked: function () {
            let that = this,
                $operate = $('#operate'),
                operate_class = 'operate',
                $group_operate = $('.group_operate'),
                $element = $('.page_contain .ele_item'),
                $element_masking = $('.editing_element_masking .item');
            // 停止艺术字观察者
            that.art_text_observer && that.stop_art_text_observer();
            // 置空组合对齐历史
            that.group_align_history =  [];
            // 结束图片元素裁剪
            if (that.$refs.FormatPanel && that.$refs.FormatPanel.begin_clip) {
                that.$refs.FormatPanel.sure_image_clip();
            }
            let $checked = $('.page_contain .ele_item.checked');
            // 去除视频
            $element.find('.video_play').show();
            let currentTime = $checked.find('.video_player')[0] && $checked.find('.video_player')[0].currentTime;
            $checked.find('.video_player:visible').attr({'src':''}).hide();
            if (currentTime) {
                that.media_play_memory = Object.assign(that.media_play_memory || {}, {[$checked.attr('id')]: currentTime})
            }
            // 媒体控件隐藏
            opt_factory.init_opt('audio').audio_control_remove(that, $checked.attr('id'));
            // 过滤无文本文本框
            $('.page_contain .ele_item.checked[data-type="text"]').each(function () {
                // 去除文本虚拟选区
                editor_opt.recover_text_selection($(this));
                // 文本框没有文本内容的就删除掉
                if (!$(this).text().replace(/\s+/g, "")) opt_factory.init_opt('group').ele_delete($(this));
            });
            // 只去除画布内文本选区
            let seletion = window.getSelection();
            if ($(seletion.anchorNode).parents('.page_contain').length > 0) {
                seletion.removeAllRanges();
            }
            // 显示元素, 去除选中标识
            $element.show().removeClass('checked edit_text');
            // 富文本失焦
            $element.find('[contenteditable]').blur();
            // 去除选中其他协作者操作元素标识
            $element_masking.removeClass('checked');
            // 表格状态清除
            $(".cel_selected").removeClass('cel_selected');
            $(".cel_edit").removeClass('cel_edit');
            // 虚线框样式重置
            $operate.attr('class', operate_class).removeAttr('style').hide();
            // 清除可编辑操作点
            operate_opt.buildPoint();
            // 去除子虚线框
            $operate.find('.child').remove();
            // 隐藏组合元素单选大虚线框样式重置
            $group_operate.removeAttr('style').hide();
            // 隐藏文本去除格式相关
            that.show_paste_clean = false;
            that.text_clean_info = {}
            that.show_paste_clean_list = false;
            // 重置选中元素标识
            that.element_type = '';
            that.is_group = false;
            that.element_lock = false;
            that.select_group_child = false;
            // 隐藏超链接弹框
            that.show_link_tool = false;
            // 右侧评论列表更新
            that.$refs.editHead.refresh_comment_id();
            // 通讯联系 - 元素选中
            that.get_ws_checked_message();
            // 更新元素动画选中
            that.$refs.animation_modal && that.$refs.animation_modal.animation_list_select();
            // 更新动画元素标记选中
            that.animation_mark_checked();
        },
        // 快捷键获取素材数据 - 运营需求
        ele_get_material: function () {
            let that = this,
                page_info = page_opt.fn.clone_object(that.page_info),
                $ele = $('.page_contain .ele_item.checked'),
                $copy_btn = $('#fictitious_copy'),
                group_opt = opt_factory.init_opt('group'),
                result;
            // 存在选中元素情况 - 获取元素信息
            if ($ele.length > 0) {
                result = group_opt.dom_2_ele_list($ele);
                result = JSON.stringify(result);
            }
            // 不存在选中元素 - 获取文档页信息
            else {
                page_info.id = '';
                page_info.uuid = '';
                page_info.sign = null;
                page_info.pageNumber = null;
                result = JSON.stringify(page_info);
            }
            // 赋值复制信息
            that.fictitious_copy_text = result;
            // 触发复制
            that.$nextTick(function () { $copy_btn.click(); });
        },
        // 元素按键移动
        ele_key_translate: function (ele, type, data) {
            let that = this;
            // 错误状态判断
            if (!ele || !type || typeof data === 'undefined' || isNaN(data)) {
                console.error('params type error');
                return false;
            }
            clearTimeout(that.timer_id_stack['grid_display']);
            that.toggle_grid_display(true);
            // 遍历元素
            ele.each(function () {
                let $ele = $(this),
                    ele_type = $ele.attr('data-type'),
                    option = opt_factory.init_opt(ele_type),
                    translate = option.get_transform($ele, 'translate');
                // 修改 x
                if (type === 'x') {
                    translate[0] = translate[0] + Number(data);
                }
                // 修改 y
                else if (type === 'y') {
                    translate[1] = translate[1] + Number(data);
                }
                // 应用定位
                option.set_translate($ele, translate[0], translate[1]);
            });
            // 更新虚线框
            operate_opt.reset_rect(ele);
            that.timer_id_stack['grid_display'] = setTimeout(() => {
                that.toggle_grid_display();
            }, 300);
        },
        // 元素复制样式
        ele_copy_format: function() {
            let $checked = $('.page_contain .ele_item.checked');
            if ($checked.length > 1) return;
            // 获取边框 阴影 透明度 填充
            let type = $checked.attr('data-type');
            let text_style = '';
            let option = opt_factory.init_opt(type);
            if (type === 'text') {
                text_style = editor_opt.get_font_format($checked.find('.show_text'));
            }
            let { background, border_c, border_o, border_s, border_w, opacity, shadow, text_align } = option.dom_2_ele($checked);
            this.copy_format_storage = { background, border_c, border_o, border_s, border_w, opacity, shadow, text_align, text: text_style };
        },
        // 元素粘贴样式
        ele_paste_format: function() {
            if (!this.copy_format_storage) return;
            let that = this;
            let $checked = $('.page_contain .ele_item.checked');
            let group_opt = opt_factory.init_opt('group');
            let ele_list = group_opt.dom_2_ele_list($checked);
            let { background, border_c, border_o, border_s, border_w, opacity, shadow, text_align } = that.copy_format_storage;
            ele_list.forEach(function(item){
                if (item.type === 'img') {
                    item = Object.assign(item, that.copy_format_storage, {border_w: border_w / 2});
                } else if (item.type === 'text') {
                    item = Object.assign(item, that.copy_format_storage, {border_s: border_s || 'solid'});
                    if (that.copy_format_storage.text) {
                        let content = `<span>${$(item.content).text()}</span>`;
                        content = $(content).attr('style',that.copy_format_storage.text).prop('outerHTML');
                        item.content = $(item.content).html(content).prop('outerHTML');
                    }
                } else {
                    item = Object.assign(item, that.copy_format_storage);
                }
                let new_ele_html = group_opt.ele_list_2_dom([item]);
                new_ele_html = $(new_ele_html).addClass('checked').prop('outerHTML');
                let old_ele = $(`.page_contain .ele_item[id="${item.id}"]`)[0];
                old_ele.parentNode.replaceChild($(new_ele_html)[0], old_ele);
            });
            that.input_listener();
            that.set_ele_checked($(`.page_contain .ele_item.checked`));
        },

        /* 超链接相关 start*/
        judgeHasLink() {
            if (this.element_type === 'text') {
                let selection = window.getSelection ? window.getSelection() : document.selection.createRange().text;
                let range = selection.getRangeAt(0);
                let newDom = document.createElement('div');
                newDom = newDom.appendChild(range.cloneContents());
                if (newDom.querySelectorAll('a').length) {
                    this.alreadyHasLink = true;
                }
            }
        },
        // 添加链接
        add_ele_link() {
            this.ele_link_info = { text: '', link: '', page: '' };
            if (this.element_type === 'text' || that.element_type === 'table') {
                let selection = window.getSelection ? window.getSelection() : document.selection.createRange().text;
                let $ele = $('.page_contain .ele_item.checked');
                let isRange = !!($ele.find('[contenteditable="true"]').length && selection && selection.type === 'Range' && !selection.isCollapsed);
                this.right_menu_config['isRange'] = isRange;
                if (isRange) {
                    this.$nextTick(() => {
                        this.ele_link_info.text = window.getSelection ? selection.toString() : selection;
                        this.show_link_modal();
                    });
                }
            }
        },
        // 关闭超链接弹框
        closeLinkPanel() {
            linkPanel.destroy();
            this.current_link_dom = null;
        },
        // 打开元素超链设置弹框
        show_link_modal() {
            let that = this;
            if (that.element_type === 'text' || that.element_type === 'table') {
                let $ele = $('.page_contain .ele_item.checked');
                editor_opt.save_text_selection($ele);
                let $selector = $ele.find('.customize_selection');
                if ($selector.length <= 0) return that.$toast('请选中文本后操作', 2000);
                linkPanel.create({
                    target: $ele.find('.text_content .show_text')[0],
                    documentInfo: this.document_info,
                    pageList: this.document_page_list,
                    linkParams: this.ele_link_info,
                    edit: (data) => {
                        this.set_ele_link(data);
                    },
                    destroy: () => {
                        this.current_link_dom = null;
                    }
                });
                that.show_ele_link_modal = true;
            }
        },
        // 关闭超链接弹窗
        // close_ele_link_modal: function () {
        //     let $ele = $('.page_contain .ele_item.checked');
        //     this.show_ele_link_modal = false;
        //     this.show_link_change_modal = false;
        //     this.can_change_link = false;
        //     // 回选文本
        //     editor_opt.recover_text_selection($ele);
        // },
        // 显示/隐藏超链接信息弹框
        // edit_link_panel: function () {
        //     this.show_ele_link_modal = true;
        //     this.ele_link_info.text = this.current_link_dom.innerText;
        //     this.$nextTick(() => {
        //         $('.ele_link_text').focus() || $('.ele_link_str').focus()
        //     })
        // },
        // 获取元素超链接信息
        get_ele_link_info: function (ele) {
            let offset = opt_factory.init_opt('group').compute_ele_offset(ele).window_scaled;
            this.show_link_tool = true;
            this.ele_link_info.link = ele.find('.ele_rotate').attr('title');
            // this.ele_link_info.left = offset.x + offset.w / 3;
            // this.ele_link_info.top = offset.y + offset.h + 10;
        },
        // 添加元素超链接
        set_ele_link(data) {
            console.log(data);
            let $ele = $('.page_contain .ele_item.checked');
            let { text, page, link } = data;
            let option = opt_factory.init_opt('group');
            if (this.current_link_dom) $ele = $(this.current_link_dom);
            console.log($ele);
            if ($ele.attr('data-type') === 'text' || $ele.find('.cel_edit').length > 0) {
                let $selector = $ele.find('.customize_selection');
                let option_t = opt_factory.init_opt('text');
                // 工具栏新增超链接文本
                // if (option_t.using_data !== undefined && $ele.find('.show_text a').length > 0) {
                if (this.alreadyHasLink) {
                    console.log(option_t.using_data);
                    this.ele_link_info = data;
                    console.log($ele);
                } else {
                    let aEle = `<a href=${link} style='text-decoration: underline'>${text}</a>`;
                    if (option_t.using_data.text_obj && option_t.using_data.text_obj.type === 'link') {
                        let textStyle = option_t.using_data.text_obj.style;
                        aEle = `<a href=${link} style='font-size: ${textStyle.fontSize * 2}px; color: ${textStyle.color}; background-color: ${textStyle.backgroundColor}; font-weight: ${textStyle.fontWeight}; font-family: ${textStyle.fontFamily}; font-style: ${textStyle.fontStyle}; text-decoration: ${textStyle.underline} ${textStyle.lineThrough};'>${text}</a>`;
                    }
                    $ele.find('.show_text.example_text').append(aEle);
                }
                // 修改链接
                option.ele_link_add($ele, link);
            } else {
                option.ele_link_add($ele, link);
                // this.get_ele_link_info($ele);
            }
            // this.show_ele_link_modal = false;
            // this.can_change_link = false;
        },
        // 删除超链接
        remove_ele_link: function () {
            let $ele = $('.page_contain .ele_item.checked'),
                option = opt_factory.init_opt('group'),
                dom;
            if ($ele.attr('data-type') === 'text' || $ele.find('.cel_edit').length > 0) dom = $(this.current_link_dom);
            option.ele_link_remove($ele, dom);
            this.ele_link_info = {};
            this.show_link_tool = false;
        },
        /* 超链接相关 end*/

        /* 文本去除格式相关 */
        // 粘贴格式
        set_paste_textformat: function (ele_id) {
            if (ele_id) {
                this.paste_textformat_map[ele_id] = 1;
            }
        },
        // 显示粘贴格式设置
        text_format_show: function (ele) {
            if (ele && ele.hasClass('ele_item')) {
                this.show_paste_clean = true;
                this.paste_textformat_map[ele.attr('id')]++;
                let offset = opt_factory.init_opt('group').compute_ele_offset(ele).window_scaled;
                // 判断列表是否超出屏幕
                let windowW = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
                let windowH = window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight;
                if (offset.y + offset.h + 180 > windowH) {
                    this.text_clean_info.top = offset.y - 50;
                    this.$nextTick(() => {
                        let $list = $('.paste_clean_menu .menu_list')[0];
                        $list.style.top = '-90px';
                        $list.style.right = '0';
                    })
                } else {
                    this.text_clean_info.top = offset.y + offset.h + 14;
                    this.$nextTick(() => {
                        let $list = $('.paste_clean_menu .menu_list')[0];
                        $list.style.top = '50px';
                        $list.style.right = 'auto';
                    })
                }
                if (offset.w + offset.x + 60 > windowW) {
                    this.text_clean_info.left = offset.x - 36;
                } else {
                    this.text_clean_info.left = offset.x + offset.w - 18;
                }
            }
        },
        // 打开/关闭格式清除下拉选项
        toggle_paste_clean_list: function () {
            this.show_paste_clean_list = !this.show_paste_clean_list;
        },
        // 文本格式设置
        text_format_operation: function (type) {
            let $ele = $('.page_contain .ele_item.checked');
            if ($ele.length === 0) return;
            let id = $ele.attr('id');
            let $text = $ele.find('.show_text');
            try {
                switch (type) {
                    case 'save':
                        return this.show_paste_clean_list = false;
                        // if (this.before_clean_html.filter(item => item.id === id).length === 0) return;
                        // $text.html(this.before_clean_html.filter(item => item.id === id)[0].html);
                        break;
                    case 'clean':
                        if (this.before_clean_html.filter(item => item.id === id).length === 0) this.before_clean_html.push({ id: id, html: $text.html() });
                        $text.attr('style', `font-size:32px; font-family:woodo-SourceHanSansCN-Light; color:${this.theme_checked.textColor};`).find('*').not('br').attr('style', '');
                        break;
                }
                // 重置文本框大小
                let option = opt_factory.init_opt('text');
                this.element_message.h = option.set_ele_sync_content($ele);
                this.element_message = Object.assign(this.element_message, option.get_edit_message($ele));
                operate_opt.reset_rect($ele);
            } catch (error) {
                console.error(error);
            }
            this.input_listener();
        },
        // 删除粘贴格式设置（文档页切换、元素编辑触发）
        clean_text_format: function (ele_id) {
            // 清除指定元素
            if (this.paste_textformat_map[ele_id]) {
                delete this.paste_textformat_map[ele_id];
            } else {
                // 清除全部
                this.paste_textformat_map = {};
            }
            this.show_paste_clean = false;
        },
        // build 元素前数据处理
        ele_build_before_format: function (param) {
            let that = this;
            // 已设置关闭默认动画  true = 关闭默认动画  false = 开启默认动画 则创建元素新增动画数据
            let doc_attr = that.document_info.attr;
            let page_attr = that.page_info.attr;
            if ((doc_attr && doc_attr['defaultAnimation']) || (page_attr && page_attr['defaultAnimation'])) {
                param['animation'] = [];
            } else {
                // 默认动画名称获取
                let name = page_opt.get_default_animation_name(that);
                // 新增默认动画 group默认 0  item默认在 0 组最后一个
                let item_index = 0;
                if (that.$refs.animation_modal && that.$refs.animation_modal.get_animation_group(0).length > 0) {
                    item_index = that.$refs.animation_modal.get_animation_group(0).length;
                }
                param['animation'] = [{
                    name: name,
                    default: true,      // 默认动画标识
                    start: 'same',		// same = 与上一项相同  after = 上一项之后  click = 单击时
                    duration: 1,		// 动画时间 单位 秒
                    delay: 0,			// 动画延时时间， start = auto 时生效
                    index: [0, item_index],		// 动画顺序 [0] = 动画组下标  [1] = 组内顺序下标
                }];
            }
            return param;
        },
        // 自定义事件获取动画元素标记信息
        get_animation_mark: function (list) {
            let that = this;
            let $page = $('#page_contain #edit_page');
            let option = opt_factory.init_opt('group');
            that.animation_mark_list = list.map(item => {
                let rect = {};
                if (item.group) {
                    rect = option.compute_ele_seat($page.find(`.ele_item[data-group=${item.uuid}]`)).window_scaled;
                } else {
                    rect = option.compute_ele_offset($page.find(`#${item.uuid}.ele_item`)).window_scaled;
                }
                item.top = rect.y;
                item.left = rect.x;
                return item;
            });
            that.animation_mark_checked();
        },
        // 动画元素标记选中 选中元素触发
        animation_mark_checked: function () {
            let that = this;
            if (that.animation_mark_list.length === 0) {
                return;
            }
            $('.animation-mark.checked').removeClass('checked');
            $('#page_contain #edit_page .ele_item.checked').each((index, el) => {
                let id = el.getAttribute('data-group') || el.id;
                $(`.animation-mark[data-id=${id}]`).addClass('checked');
            });
        },
        // 动画元素标记 移动前隐藏 移动后显示
        animation_mark_hide: function (ishide) {
            let that = this;
            if (that.animation_mark_list.length === 0) {
                return;
            }
            let mark = $('.animation-mark');
            if (ishide) {
                mark.hide();
            } else {
                let option = opt_factory.init_opt('group');
                let $page = $('#page_contain #edit_page');
                that.animation_mark_list.forEach(item => {
                    let rect = {};
                    if (item.group) {
                        rect = option.compute_ele_seat($page.find(`.ele_item[data-group=${item.uuid}]`)).window_scaled;
                    } else {
                        rect = option.compute_ele_offset($page.find(`#${item.uuid}.ele_item`)).window_scaled;
                    }
                    item.top = rect.y;
                    item.left = rect.x;
                });
                mark.show();
            }
        },
        /*通用元素设置方法 end*/

        /**
         * 元素插入使用预插入绘制层，适用所有元素
         */
        // 元素插入前生成元素预览图、预插入绘制层
        element_preinsert_ready: function (element_list = []) {
            let that = this;
            let datalist = element_list;
            if (!Array.isArray(datalist) || !datalist.length) {
                return;
            }
            let isgroup = datalist.length > 1;
            // 设置状态为元素预插入
            that.page_state = 'preinsert_layer';
            that.toggle_grid_display(true);
            that.ele_cancel_checked();
            that.$nextTick(() => {
                let $layer = $('#preinsert_layer');
                if (!$layer.length) {
                    return;
                }
                let layer_rect = $layer[0].getBoundingClientRect();
                let $icon = $('#preinsert_mouse_icon');
                let $rect = $layer.find('.preinsert_rect');
                let page_scale = that.page_scale.user_set;
                let translate = [0, 0];     // [0]: x , [1]: y
                let rect_size = [0, 0];     // [0]: width , [1]: height
                // 元素数据整理 & 预插入样式设置
                if (!isgroup) {
                    // 单元素处理
                    let ele_data = datalist[0];
                    rect_size = [ele_data.width, ele_data.height];
                    switch (ele_data.type) {
                        case 'shape':
                            $icon.attr('class', 'edit-ico edit-ico-preinsert_shape');
                            break;
                        case 'img':
                            $icon.attr('class', 'edit-ico edit-ico-preinsert_image');
                            break;
                        case 'table':
                            $icon.attr('class', 'table');
                            // 预设表格处理（表格缩放 0.5）
                            if (ele_data.preset) {
                                rect_size = [ele_data.width / 2, ele_data.height / 2];
                            }
                            break;
                        case 'chart':
                            $icon.attr('class', 'chart');
                            break;
                    }
                } else {
                    // 组合元素
                    $icon.attr('class', 'edit-ico edit-ico-preinsert_group');
                    let group_rect_left = Math.min.apply(null, datalist.map(item => +item.translate.split(',')[0]));
                    let group_rect_top = Math.min.apply(null, datalist.map(item => +item.translate.split(',')[1]));
                    let group_rect_width = Math.max.apply(null, datalist.map(item => Number(item.width) + Number(item.translate.split(',')[0])));
                    let group_rect_height = Math.max.apply(null, datalist.map(item => Number(item.height) + Number(item.translate.split(',')[1])));
                    let group_rect_ratio = (group_rect_height - group_rect_top) / (group_rect_width - group_rect_left);
                    rect_size = [this.$refs.MaterialModal.userSize * 5, this.$refs.MaterialModal.userSize * 5 * group_rect_ratio];
                }
                $rect.css({
                    'width': rect_size[0],
                    'height': rect_size[1],
                });
                /**
                 * 操作事件、元素定位、插入操作
                 */
                that.set_autofit();
                // 吸附效果吸附范围适应网格尺寸
                let fitrange = 4;
                let model = this.grid_model[this.grid_using];
                if (model) {
                    fitrange = model.x[1] - model.x[0];
                }
                $layer.off('mouseenter mousemove mouseleave mousedown');
                $layer.on('mouseenter mousemove', event => {
                    let x = event.clientX;
                    let y = event.clientY;
                    $icon.css({
                        'left': x,
                        'top': y,
                    }).show();
                    /**
                     * 自动贴合 && 参考线 处理 start
                     */
                    let rect = {
                        x: (x - layer_rect.left) / page_scale,
                        y: (y - layer_rect.top) / page_scale,
                        w: rect_size[0],
                        h: rect_size[1],
                    };
                    let fit_left = rect.x;
                    let fit_top = rect.y;
                    let point = {
                        x: rect.x,
                        y: rect.y,
                    };
                    let reference_line_x = [];
                    let reference_line_y = [];
                    // 基于当前元素的 左 中 右 上 中 下 6个点对齐
                    let element_fit_x = {
                        'left': rect.x,
                        'right': rect.x + rect.w,
                    };
                    let element_fit_y = {
                        'top': rect.y,
                        'bottom': rect.y + rect.h,
                    };
                    // x轴方向自动贴合检索
                    let xfit_arr = [];
                    for (let key in element_fit_x) {
                        let value = element_fit_x[key];
                        let fit = that.autofit_point.x.find(item => Math.abs(value - item) <= fitrange);
                        if (!isNaN(fit)) {
                            xfit_arr.push({
                                key: key,
                                value: fit,
                                diff: Math.abs(value - fit),
                            });
                        }
                    }
                    // 筛选契合度最高的坐标
                    if (xfit_arr.length) {
                        let xfit_min = Math.min.apply(null, xfit_arr.map(item => item.diff));
                        let xfit_min_obj = xfit_arr.find(item => item.diff === xfit_min);
                        let fit = xfit_min_obj.value;
                        // 匹配 左 中 右 对齐点
                        switch (xfit_min_obj.key) {
                            case 'left':
                                point.x = fit;
                                break;
                            case 'right':
                                point.x = fit - rect.w;
                                break;
                        }
                        reference_line_x.push(fit * page_scale);
                    }
                    // y轴方向自动贴合检索
                    let yfit_arr = [];
                    for (let key in element_fit_y) {
                        let value = element_fit_y[key];
                        let fit = that.autofit_point.y.find(item => Math.abs(value - item) <= fitrange);
                        if (!isNaN(fit)) {
                            yfit_arr.push({
                                key: key,
                                value: fit,
                                diff: Math.abs(value - fit),
                            });
                        }
                    }
                    // 筛选契合度最高的坐标
                    if (yfit_arr.length) {
                        let yfit_min = Math.min.apply(null, yfit_arr.map(item => item.diff));
                        let yfit_min_obj = yfit_arr.find(item => item.diff === yfit_min);
                        let fit = yfit_min_obj.value;
                        // 匹配 左 中 右 对齐点
                        switch (yfit_min_obj.key) {
                            case 'top':
                                point.y = fit;
                                break;
                            case 'bottom':
                                point.y = fit - rect.h;
                                break;
                        }
                        reference_line_y.push(fit * page_scale);
                    }
                    // 更新参考线
                    that.update_reference_line(reference_line_x, reference_line_y);
                    // 检测到贴合点
                    if (xfit_arr.length || yfit_arr.length) {
                        fit_left = point.x;
                        fit_top = point.y;
                    }
                    /**
                     * 自动贴合 && 参考线 处理 end
                     */
                    // 元素预览节点定位
                    translate = [fit_left, fit_top];
                    $rect.css({
                        'left': fit_left,
                        'top': fit_top,
                    }).show();
                }).on('mouseleave', event => {
                    $icon.hide();
                    $rect.hide();
                    that.update_reference_line();
                }).on('mousedown', event => {
                    event.stopPropagation();
                    // 元素插入
                    that.ele_cancel_checked();
                    let option = opt_factory.init_opt('group');
                    let $page = option.get_canvas_page();
                    // 单元素插入
                    if (!isgroup) {
                        let ele_data = datalist[0];
                        option = opt_factory.init_opt(ele_data.type);
                        ele_data = that.ele_build_before_format(ele_data);
                        ele_data.id = option.fn.uuid();
                        ele_data.translate = translate.join();
                        // 预设表格处理（因预设表格是直接由数据转节点，无优化方案）
                        let $ele = (ele_data.type === 'table' && ele_data.preset) ? option.ele_2_dom(ele_data) : $(option.build(ele_data));
                        // 处理插入svg素材的时候，将静态图存在节点上以抽取数据供导出使用
                        if (ele_data.type === 'img' && ele_data.staticImage) {
                            $ele.attr('data-static-image', ele_data.staticImage);
                        }
                        $page.append($ele);
                        switch (ele_data.type) {
                            case 'shape':
                                option.set_size($ele, { w: ele_data.width, h: ele_data.height, });
                                break;
                            case 'img':
                                option.set_size($ele, { w: ele_data.width, h: ele_data.height, });
                                break;
                            case 'table':
                                option.table_edit_listener($ele);
                                break;
                            case 'chart':
                                option.set_size($ele, { w: ele_data.width, h: ele_data.height, });
                                option.init_instance($ele);
                                break;
                        }
                        // 初始化选中元素
                        that.set_ele_checked($ele);
                        operate_opt.reset_rect($ele);
                    } else {
                        // 组合元素插入
                        let group_uuid = option.fn.uuid();
                        for (let i = 0; i < datalist.length; i++) {
                            let item = datalist[i];
                            item = that.ele_build_before_format(item);
                            item.id = option.fn.uuid();
                            item.group = group_uuid;
                        }
                        let $temp_group = $('<div></div>');
                        let group_html = option.ele_list_2_dom(datalist);
                        $temp_group.html(group_html);
                        $temp_group.children().addClass('checked');
                        $page.append($temp_group.children());
                        let $ele = option.get_checked_element().element;
                        // 设置位置、尺寸
                        option.set_group_translate($ele, translate[0], translate[1]);
                        let group_rect = option.compute_ele_seat($ele).page;
                        let group_rect_ratio = group_rect.h / group_rect.w;
                        option.set_group_size($ele, { w: this.$refs.MaterialModal.userSize * 5, h: this.$refs.MaterialModal.userSize * 5 * group_rect_ratio, });
                        // 初始化选中元素
                        that.set_ele_checked($ele);
                    }
                    // 退出状态
                    that.page_state = 'common';
                    that.toggle_grid_display();
                    that.update_reference_line();
                });
            });
        },

        /*文本元素特性方法 start*/
        // 文本绘制
        text_draw: function (e) {
            // 防止浏览器默认行为(W3C)
            if (e && e.preventDefault) {
                e.preventDefault();
            } else {
                window.event.returnValue = false;
            }
            let that = this,
                option = opt_factory.init_opt('text'),
                $mouse_select = $(".operate_mouse_select"),
                $page = option.get_canvas_page(),
                page_rect = option.fn.get_client_rect($page),
                page_x = Math.floor(page_rect.left),
                page_y = Math.floor(page_rect.top),
                // 获取初始位置
                down_x = e.clientX - page_x,
                down_y = e.clientY - page_y,
                t, l, w, h;
            // 设置绘制框颜色
            $mouse_select.css({ 'border': '1px solid rgba(0,0,0,0.2)' });
            $(document).on('mousemove', function (ev) {
                let move_x = ev.clientX - down_x - page_x;
                let move_y = ev.clientY - down_y - page_y;
                if (move_x && move_y) {
                    $mouse_select.show();
                }
                // x 正负数判断
                if (move_x > 0) {
                    l = down_x;
                    w = move_x;
                } else if (move_x < 0) {
                    l = down_x - Math.abs(move_x);
                    w = Math.abs(move_x);
                }
                // y 正负数判断
                if (move_y > 0) {
                    t = down_y;
                    h = move_y;
                } else {
                    h = Math.abs(move_y);
                    t = down_y - h;
                }
                $mouse_select.css({
                    "top": t,
                    "left": l,
                    "width": w,
                    "height": h,
                });
            });
            $(document).on('mouseup', function () {
                let page_scale = that.page_scale.user_set,
                    ele_scale = option.template.scale.split(',')[0],
                    ele_w = Math.round(w / page_scale < 100 ? 100 : w / page_scale),
                    ele_h = Math.round(h / page_scale < 30 ? 30 : h / page_scale),
                    ele_x = Math.floor(l / page_scale),
                    ele_y = Math.floor(t / page_scale),
                    wordBreak = 'break-word',
                    whiteSpace = 'normal';
                // 隐藏绘制框
                $mouse_select.attr("style", "").hide();
                // 绘制超链接
                if (option.using_data.text_obj.type === 'link') {
                    that.show_ele_link_modal = true;
                    that.ele_link_info = {};
                    that.$nextTick(() => {
                        $('.ele_link_text').focus();
                    });
                }
                // 判断是否点击 (点击：is_click === true  拖动：is_click === false)
                let is_click = isNaN(ele_w) || isNaN(ele_h) || isNaN(ele_x) || isNaN(ele_y);

                if (is_click) {
                    ele_w = 100;
                    ele_h = 30;
                    ele_x = Math.floor(down_x / page_scale);
                    ele_y = Math.floor(down_y / page_scale);
                    wordBreak = 'normal';
                    whiteSpace = 'nowrap';
                }

                let param = {
                    id: option.fn.uuid(),
                    translate: `${ele_x},${ele_y}`,
                    rotate: `0,${ele_w / 2},${ele_h / 2}`,
                    width: Math.round(ele_w / ele_scale),
                    height: Math.round(ele_h / ele_scale),
                    wordBreak,
                    whiteSpace
                };

                param = that.ele_build_before_format(param);

                // 获取生成节点字符串
                let $ele = $(option.build(param));
                // 插入节点
                $ele.appendTo($page);
                // 选中元素
                that.set_ele_checked($ele, { wireframe: !is_click }); // 点击不创建文本虚线框
                // 聚焦
                editor_opt.set_selection($ele.find('.show_text'));
                // 修改画布状态
                that.page_state = 'edit_element';

                $(document).unbind('mousemove');
                $(document).unbind('mouseup');
            });
        },
        /*文本元素特性方法 end*/

        /* 形状元素特性方法 start */
        // 形状绘制
        shape_draw: function (e) {
            // 防止浏览器默认行为(W3C)
            if (e && e.preventDefault) {
                e.preventDefault();
            } else {
                window.event.returnValue = false;
            }
            let that = this,
                option = opt_factory.init_opt('shape'),
                $page = option.get_canvas_page(),
                page_rect = option.fn.get_client_rect($page),
                page_x = Math.floor(page_rect.left),
                page_y = Math.floor(page_rect.top),
                page_scale = that.page_scale.user_set,
                // 获取初始数据
                shift_key = e.shiftKey,
                down_x = e.clientX - page_x,
                down_y = e.clientY - page_y,
                t, l, w, h,
                // 初始化形状数据
                param = {
                    id: option.fn.uuid(),
                    scale: '1,1',
                    rotate: '0,0,0',
                    opacity: 0.3,
                    background: that.document_info.shapeColor ? that.document_info.shapeColor : '#000000'
                },
                ele_x, ele_y;
            param = that.ele_build_before_format(param);
            // 生成形状元素节点
            let $ele = $(option.build(param));
            $ele.appendTo($page);
            $ele.hide();
            $(document).on('mousemove', function (ev) {
                // 获取形状比例
                let shape_ratio = option.using_data.width / option.using_data.height;
                // 更新 shift 状态
                shift_key = ev.shiftKey;
                let move_x = ev.clientX - down_x - page_x;
                let move_y = ev.clientY - down_y - page_y;
                // x 正负数判断
                if (move_x > 0) {
                    l = down_x;
                    w = Math.floor(move_x / page_scale);
                } else {
                    l = down_x - Math.abs(move_x);
                    w = Math.floor(Math.abs(move_x) / page_scale);
                }
                // y 正负数判断
                if (move_y > 0) {
                    h = Math.floor(move_y / page_scale);
                    t = down_y;
                } else {
                    h = Math.floor(Math.abs(move_y) / page_scale);
                    t = down_y - h;
                }
                // 计算元素定位
                ele_x = Math.round(l / page_scale);
                ele_y = Math.round(t / page_scale);
                option.set_translate($ele, ele_x, ele_y);
                // 等比绘制 - 计算宽高
                if (shift_key) {
                    if (Math.abs(move_x) - Math.abs(move_y) > 0) {
                        h = w / shape_ratio;
                    } else {
                        w = h * shape_ratio;
                    }
                }
                if (move_x && move_y && w && h) $ele.show();
                // 应用尺寸
                option.set_size($ele, { w: w, h: h });
            });
            $(document).on('mouseup', function () {
                $ele.show();
                // 判断鼠标未拖动
                if (!w || !h) {
                    // 清除插入形状节点
                    $ele.remove();
                    // 修改画布状态
                    that.page_state = 'common';
                    that.$toast('请按住鼠标拖动', 800);
                } else {
                    $ele.find('.ele_rotate').css('opacity', 1);
                    // 选中元素
                    that.set_ele_checked($ele);
                    // 修改画布状态
                    that.page_state = 'edit_element';
                }
                // 清除生成数据
                option.using_data = {
                    d: null,
                    width: null,
                    height: null,
                };
                $(document).unbind('mousemove');
                $(document).unbind('mouseup');
            });
        },
        /* 形状元素特性方法 end*/

        /* 线条元素特性方法 start */
        // 线条绘制
        line_draw: function (e) {
            // 防止浏览器默认行为(W3C)
            if (e && e.preventDefault) {
                e.preventDefault();
            } else {
                window.event.returnValue = false;
            }
            let that = this;
            let option = opt_factory.init_opt('line');
            let $page = option.get_canvas_page();
            let page_rect = option.fn.get_client_rect($page);
            let page_x = Math.floor(page_rect.left);
            let page_y = Math.floor(page_rect.top);
            let page_scale = that.page_scale.user_set;
            let begin_x = (e.clientX - page_x) / page_scale;
            let begin_y = (e.clientY - page_y) / page_scale;
            let move_x = 0;
            let move_y = 0;
            let param = {
                id: option.fn.uuid(),
                translate: `${begin_x},${begin_y}`,
            };
            param = that.ele_build_before_format(param);
            // 生成线条元素节点
            let $ele = $(option.build(param));
            $ele.appendTo($page);
            // 线条坐标
            let left = begin_x;
            let top = begin_y;
            let line_point = {
                x1: 0,
                y1: 0,
                x2: 0,
                y2: 0,
            };
            // 绘制线条，更新属性
            $(document).on('mousemove', ev => {
                move_x = Math.floor((ev.clientX - page_x) / page_scale);
                move_y = Math.floor((ev.clientY - page_y) / page_scale);
                // x反向绘制
                if (begin_x > move_x) {
                    // 垂直停顿
                    if (Math.abs(begin_x - move_x) <= 5 * page_scale) {
                        move_x = begin_x;
                    }
                    left = move_x;
                    line_point.x1 = begin_x - move_x;
                    line_point.x2 = 0;
                } else {
                    // 垂直停顿
                    if (Math.abs(begin_x - move_x) <= 5 * page_scale) {
                        move_x = begin_x;
                    }
                    line_point.x2 = move_x - begin_x;
                }
                // y反向绘制
                if (begin_y > move_y) {
                    // 水平停顿
                    if (Math.abs(begin_y - move_y) <= 5 * page_scale) {
                        move_y = begin_y;
                    }
                    top = move_y;
                    line_point.y1 = begin_y - move_y;
                    line_point.y2 = 0;
                } else {
                    // 水平停顿
                    if (Math.abs(begin_y - move_y) <= 5 * page_scale) {
                        move_y = begin_y;
                    }
                    line_point.y2 = move_y - begin_y;
                }
                // top left 设置
                $ele.css({
                    'left': `${left}px`,
                    'top': `${top}px`,
                });
                // 生成线条path
                let $line = $ele.find('.line, .outline');
                let line_class = $line.attr('data-line_class');
                let path_d = draw_line_path(line_class, line_point);
                $line.attr('d', path_d);
                // 展示线条长度
                that.line_length = Math.round(Math.sqrt(Math.pow(Math.abs(line_point.x1 - line_point.x2), 2) + Math.pow(Math.abs(line_point.y1 - line_point.y2), 2)));
                $('.line_length').css({
                    'top': ev.clientY + 20,
                    'left': ev.clientX + 20,
                });
                $('.line_length').show();
            }).on('mouseup', () => {
                let x_diff = Math.abs(begin_x - move_x) > 1;
                let y_diff = Math.abs(begin_y - move_y) > 1;
                if (x_diff || y_diff) {
                    // 重新设置svg width height
                    $ele.find('svg').attr({
                        'width': $ele.find('svg').attr('width'),
                        'height': $ele.find('svg').attr('height'),
                    });
                    // 选中元素
                    that.set_ele_checked($ele);
                    // 修改画布状态
                    that.page_state = 'edit_element';
                } else {
                    // 清除插入形状节点
                    $ele.remove();
                    // 修改画布状态
                    that.page_state = 'common';
                    that.$toast('请按住鼠标拖动', 800);
                }
                // 清除生成数据
                option.using_data = {
                    border_c: null,
                    border_s: null,
                    path_l: null,
                    path_r: null,
                    line_class: '',
                };
                $(document).unbind('mousemove');
                $(document).unbind('mouseup');
                $('.line_length').hide();
                that.line_length = 0;
                // 移除参考线
                that.update_reference_line();
            });
        },
        // 线条拖动
        line_change_point: function (e, type) {
            // 防止浏览器默认行为(W3C)
            if (e && e.preventDefault) {
                e.preventDefault();
            } else {
                window.event.returnValue = false;
            }
            let that = this;
            let $ele = $('.page_contain .ele_item.checked');
            // 错误选中
            if ($ele.length !== 1 || $ele.attr('data-type') !== 'line') {
                return;
            }
            // 锁定状态
            if ($ele.hasClass('lock')) {
                return that.$toast("此元素已被锁定，请解锁后操作", 800);
            }
            let page_scale = that.page_scale.user_set;
            let option = opt_factory.init_opt($ele.attr('data-type'));
            let $page = option.get_canvas_page(),
                page_rect = option.fn.get_client_rect($page);
            let $line = $ele.find('.line');
            let $outline = $ele.find('.outline');
            let checked_msg = option.compute_ele_offset($ele).page;
            let translate = [checked_msg.x, checked_msg.y];
            let down_x = e.clientX;
            let down_y = e.clientY;
            let move_x = 0;
            let move_y = 0;
            let commands, first_point, last_point;
            let x1, y1, x2, y2;
            // 获取两个点的x,y值
            let get_position_key = 0;
            let get_position = function () {
                // 获取线条位置
                commands = parseSVG($line.attr('d'));
                // 绝对坐标转换
                makeAbsolute(commands);
                first_point = commands[0];
                last_point = commands[commands.length - 1];
                x1 = first_point.x;
                y1 = first_point.y;
                x2 = last_point.x;
                y2 = last_point.y;
            };
            get_position();
            // 设置元素吸附坐标
            that.set_autofit();
            that.toggle_grid_display(true);
            $(document).on('mousemove', ev => {
                let __move_x = ev.clientX - down_x;
                let __move_y = ev.clientY - down_y;
                down_x = ev.clientX;
                down_y = ev.clientY;
                // 追加鼠标移动值
                move_x += __move_x;
                move_y += __move_y;
                let top;
                let left;
                let nx1;
                let ny1;
                let nx2;
                let ny2;
                let keep_line_angle = (ev.shiftKey && $line.attr('data-line_class') === 'straight'); // 保持原先角度延伸标识
                let point_x;         // 当前操作点相对画布左上角的坐标x
                let point_y;         // 当前操作点相对画布左上角的坐标y
                let distance;        // 贴合点的坐标
                let $marker1 = $ele.find('marker').eq(0);
                let $marker2 = $ele.find('marker').eq(1);
                let arrow_width = 0;
                // 按shift键时保持原角度进行延伸，重新获取当前两个点的x，y值，根据比例调整movex或movey
                if (keep_line_angle) {
                    get_position_key++;
                    if (get_position_key === 1) {
                        get_position();
                    }
                    let ratio = (x2 - x1) / (y2 - y1);
                    if (y2 - y1) {
                        move_x = move_y * ratio;
                    } else {
                        move_y = 0;
                    }
                    // 移除参考线
                    that.update_reference_line();
                } else {
                    get_position_key = 0;
                }
                // 设置操作点自动贴合
                let set_point_fit = function (x, y) {
                    // 获取与贴合点坐标的差值
                    distance = that.line_point_fit(x, y);
                    if (type === 'left') {
                        // 如果有贴合点，将线条端点设置到贴合点上
                        if (distance.x) {
                            nx1 += distance.x;
                        }
                        if (distance.y) {
                            ny1 += distance.y;
                        }
                    } else {
                        // 如果有贴合点，将线条端点设置到贴合点上
                        if (distance.x) {
                            nx2 += distance.x;
                        }
                        if (distance.y) {
                            ny2 += distance.y;
                        }
                    }
                };
                // 获取当前操作点相对画布左上角的top,left值
                let get_point_position = function (x, y, width) {
                    switch (true) {
                        case y === 0:
                            if (x) {
                                point_x = left + x + width;
                                point_y = top - width;
                            } else {
                                point_x = left - width;
                                point_y = top - width;
                            }
                            break;
                        case y !== 0:
                            if (x) {
                                point_x = left + x + width;
                                point_y = top + y + width;
                            } else {
                                point_x = left - width;
                                point_y = top + y + width;
                            }
                            break;
                    }
                }
                // 判断 type 类型 - x2,y2（拖动情况复杂，需要做多重判断，暂无优化方案）
                if (type === 'right') {
                    nx2 = x2 + move_x / page_scale;
                    ny2 = y2 + move_y / page_scale;
                    nx1 = x1;
                    ny1 = y1;
                    // 获取箭头样式的箭头尖点距操作点的距离
                    if ($marker2.find('path').attr('d')) {
                        arrow_width = $marker2[0].getAttribute('refX') / page_scale;
                    }
                    // 判断新 x轴 偏移量
                    switch (true) {
                        // 情况一 left 与 x1 重合, 拖动 x2
                        case x1 <= x2:
                            if (nx1 <= nx2) left = translate[0];
                            if (nx2 < nx1) {
                                left = translate[0] - Math.abs(move_x) / page_scale + x2;
                                nx1 = Math.abs(move_x) / page_scale - x2;
                                nx2 = 0;
                            }
                            break;
                        // 情况二 left 与 x2 重合, 拖动 x2
                        case x2 < x1:
                            if (nx2 <= nx1) {
                                left = translate[0] + move_x / page_scale;
                                nx2 = 0;
                                nx1 = x1 - move_x / page_scale;
                            }
                            if (nx1 < nx2) {
                                left = translate[0] + x1;
                                nx1 = 0;
                                nx2 = move_x / page_scale - x1;
                            }
                            break;
                    }
                    // 判断新 y轴 偏移量
                    switch (true) {
                        // 情况一 top 与 y1 重合, 拖动 y2
                        case y1 <= y2:
                            if (ny1 <= ny2) top = translate[1];
                            if (ny2 < ny1) {
                                top = translate[1] - Math.abs(move_y) / page_scale + y2;
                                ny1 = Math.abs(move_y) / page_scale - y2;
                                ny2 = 0;
                            }
                            break;
                        // 情况二 top 与 y2 重合, 拖动 y2
                        case y2 < y1:
                            if (ny2 <= ny1) {
                                top = translate[1] + move_y / page_scale;
                                ny2 = 0;
                                ny1 = y1 - move_y / page_scale;
                            }
                            if (ny1 < ny2) {
                                top = translate[1] + y1;
                                ny1 = 0;
                                ny2 = move_y / page_scale - y1;
                            }
                            break;
                    }
                    // 获取当前操作点的坐标
                    get_point_position(nx2, ny2, arrow_width);
                }
                // 判断 type 类型 - x1,y1（拖动情况复杂，需要做多重判断，暂无优化方案）
                if (type === 'left') {
                    nx1 = x1 + move_x / page_scale;
                    ny1 = y1 + move_y / page_scale;
                    nx2 = x2;
                    ny2 = y2;
                    if ($marker1.find('path').attr('d')) {
                        arrow_width = $marker1[0].getAttribute('refX') / page_scale;
                    }
                    // 判断新 x轴 偏移量
                    switch (true) {
                        // 情况一 left 与 x1 重合, 拖动 x1
                        case x1 <= x2:
                            if (nx1 <= nx2) {
                                left = translate[0] + move_x / page_scale;
                                nx1 = 0;
                                nx2 = x2 - move_x / page_scale;
                            }
                            if (nx2 < nx1) {
                                left = translate[0] + x2;
                                nx2 = 0;
                                nx1 = move_x / page_scale - x2;
                            }
                            break;
                        // 情况二 left 与 x2 重合, 拖动 x1
                        case x2 < x1:
                            if (nx2 <= nx1) left = translate[0];
                            if (nx1 < nx2) {
                                left = translate[0] - Math.abs(move_x) / page_scale + x1;
                                nx1 = 0;
                                nx2 = Math.abs(move_x) / page_scale - x1;
                            }
                            break;
                    }
                    // 判断新 y轴 偏移量
                    switch (true) {
                        // 情况一 top 与 y1 重合, 拖动 y1
                        case y1 <= y2:
                            if (ny1 <= ny2) {
                                top = translate[1] + move_y / page_scale;
                                ny1 = 0;
                                ny2 = y2 - move_y / page_scale;
                            }
                            if (ny2 < ny1) {
                                top = translate[1] + y2;
                                ny2 = 0;
                                ny1 = move_y / page_scale - y2;
                            }
                            break;
                        // 情况二 top 与 y2 重合, 拖动 y1
                        case y2 < y1:
                            if (ny2 <= ny1) top = translate[1];
                            if (ny1 < ny2) {
                                top = translate[1] - Math.abs(move_y) / page_scale + y1;
                                ny1 = 0;
                                ny2 = Math.abs(move_y) / page_scale - y1;
                            }
                            break;
                    }
                    // 获取当前操作点的坐标
                    get_point_position(nx1, ny1, arrow_width);
                }
                // 设置贴合
                if (!keep_line_angle) {
                    set_point_fit(point_x, point_y);
                }
                // 计算 x1y1,x2y2连线与水平线的夹角
                let deg = Math.atan(Math.abs(ny2 - ny1) / Math.abs(nx2 - nx1)) * 180 / Math.PI;
                // 设置垂直或水平角度停顿
                switch (true) {
                    case 90 - deg <= 1:
                        nx1 = 0;
                        nx2 = 0;
                        if (type === 'right') {
                            if (x1 < x2) left = translate[0];
                            if (x2 <= x1) left = translate[0] + (x1 - x2);
                        }
                        if (type === 'left') {
                            if (x1 <= x2) left = translate[0] + (x2 - x1);
                            if (x2 <= x1) left = translate[0];
                        }
                        break;
                    case deg <= 1:
                        ny1 = 0;
                        ny2 = 0;
                        if (type === 'right') {
                            if (y1 <= y2) top = translate[1];
                            if (y2 <= y1) top = translate[1] + (y1 - y2);
                        }
                        if (type === 'left') {
                            if (y1 <= y2) top = translate[1] + (y2 - y1);
                            if (y2 <= y1) {
                                top = translate[1];
                            }
                        }
                        break;
                }
                // top left 设置
                $ele.css({
                    'left': `${left}px`,
                    'top': `${top}px`,
                });
                // 展示线条长度
                that.line_length = Math.round(Math.sqrt(Math.pow(Math.abs(nx1 - nx2), 2) + Math.pow(Math.abs(ny1 - ny2), 2)));
                $('.line_length').css({
                    'top': ev.clientY + 20,
                    'left': ev.clientX + 20,
                });
                $('.line_length').show();
                // 生成线条path
                let line_class = $line.attr('data-line_class');
                let path_d = draw_line_path(line_class, {
                    x1: nx1,
                    y1: ny1,
                    x2: nx2,
                    y2: ny2,
                });
                $line.attr('d', path_d);
                $outline.attr('d', path_d);
                // 更新虚线框
                operate_opt.reset_rect($ele);
            }).on('mouseup', () => {
                // 重新设置svg width height
                $ele.find('svg').attr({
                    'width': $ele.find('svg').attr('width'),
                    'height': $ele.find('svg').attr('height'),
                });
                // 更新画布状态
                that.page_state = 'edit_element';
                $(document).unbind('mousemove');
                $(document).unbind('mouseup');
                that.toggle_grid_display();
                // 移除参考线
                that.update_reference_line();
                $('.line_length').hide();
                that.line_length = 0;
            });
        },
        // 返回贴合点的坐标及显示参考线
        line_point_fit: function (x = 0, y = 0) {
            let that = this;
            let page_scale = that.page_scale.user_set;
            let fitrange = 5;
            let reference_line_x = [];
            let reference_line_y = [];
            let diff = {};
            // x轴方向自动贴合检索
            let xfit = that.autofit_point.x.find(item => Math.abs(x - item) <= fitrange);
            if (!isNaN(xfit)) {
                diff.x = xfit - x;
                reference_line_x.push(xfit * page_scale);
            }
            // y轴方向自动贴合检索
            let yfit = that.autofit_point.y.find(item => Math.abs(y - item) <= fitrange);
            if (!isNaN(yfit)) {
                diff.y = yfit - y;
                reference_line_y.push(yfit * page_scale);
            }
            // 更新参考线
            that.update_reference_line(reference_line_x, reference_line_y);
            return diff;
        },
        /*线条元素特性方法 end*/

        /* 图片元素特性方法 start */
        // 上传图片
        upload_img: function (files, type) {
            let that = this;
            if (!files || !files.length) {
                return false;
            }
            let file_length = files.length;
            let length = file_length > 9 ? 9 : file_length;
            // 超出提示
            if (file_length > 9) {
                that.$toast("最多上传9张哦！");
            }
            // 上传图片至阿里云 --> 生成图片对象 --> 上传至我的上传
            let image_index;
            let option = opt_factory.init_opt('img');
            for (let i = 0; i < length; i++) {
                let file = files[i];
                // 非图片格式
                if (file.type.indexOf('image') < 0) {
                    that.$toast(`不支持${file.name}该文件上传`);
                    continue;
                }
                // 非指定格式
                if (!/(jpg|jpeg|png|JPG|PNG|gif|GIF|(svg\+xml))$/.test(file.type)) {
                    that.$toast(`不支持${file.name}该格式图片上传`);
                    continue;
                }
                // 超出size
                if ((file.size / 1024 / 1024) > 100) {
                    that.$toast(`${file.name}上传失败，只能上传100M以下的图片哦~`);
                    continue;
                }
                if (type !== 'change_ele_background') that.show_image_load_masking();
                if (length > 1) {
                    image_index = i;
                    that.image_batch_onload.push(true);
                } else {
                    image_index = false;
                }
                // 1.上传图片至阿里云
                (function (image_index) {
                    option.image_upload(file).then(data => {
                        if (data && data.indexOf("?") >= 0) {
                            let index = data.indexOf("?");
                            index = index < 0 ? data.length : index;
                            data = data.substring(0, index);
                        }
                        // 2.生成图片对象
                        option.build_obj(data).then(template => {
                            if (that.stop_build_image) {
                                return;
                            }
                            // 3. 改变图片链接
                            switch (type) {
                                // 改变图片路径
                                case 'change_img':
                                    // 添加用户上传
                                    option.add_myupload(template, file).then(function (img) {
                                        let img_id = img.data.data.id;
                                        that.$axios.get('/api/member/myupload/detail/', { params: { mid: img_id } }).then(function (data) {
                                            if (data.data.code === "2") {
                                                let $ele = $('.ele_item.checked');
                                                // 2. 更新节点
                                                that.change_image_src(data.data.data.html);
                                                // 更新虚线框
                                                operate_opt.reset_rect($ele);
                                                $ele.show();
                                                that.show_image_loading = false;
                                                that.$nextTick(() => {
                                                    // 更新快捷操作栏
                                                    operate_opt.set_format_position();
                                                });
                                                that.update_space_modal();
                                            } else {
                                                that.close_img_load();
                                                that.$toast("上传图片失败，请重试");
                                            }
                                        });
                                    }).catch(data => {
                                        that.close_img_load();
                                        that.$toast("上传图片失败，请重试");
                                    });
                                    break;
                                // 改变元素背景图
                                case 'change_ele_background':
                                    let $checked = $('.page_contain .ele_item.checked');
                                    // 遍历选中元素
                                    $checked.each(function () {
                                        let $ele = $(this);
                                        let ele_type = $ele.attr('data-type');
                                        let option = opt_factory.init_opt(ele_type);
                                        let background = {
                                            type: 'image',
                                            color: '#000000',
                                            image: { src: template.url }
                                        };
                                        option.set_background($ele, background);
                                    });
                                    // 元素选中
                                    that.set_ele_checked($checked);
                                    // 添加用户上传
                                    option.add_myupload(template, file);
                                    that.update_space_modal();
                                    break;
                                // 新增图片
                                default:
                                    template = that.ele_build_before_format(template);
                                    // 获取节点 html
                                    let $page = $('.page_contain .edit_page'),
                                        ele_html = option.build(template),
                                        $ele = $(ele_html);
                                    // svg文件异步生成封面图
                                    if (file.type.indexOf(`svg`) > -1) {
                                        that.$common.getSvgFileThumbnail(file).then(url => {
                                            $ele.attr(`data-static-image`, url);
                                        })
                                    }
                                    that.image_batch_onload[image_index] = false;
                                    $ele.appendTo($page);
                                    // 初始化图片大小
                                    option.fit_dom_size($ele);
                                    // 初始化图片定位
                                    option.fit_dom_offset($ele, { length: length, index: image_index });
                                    // 3.添加用户上传
                                    option.add_myupload(template, file);
                                    that.update_space_modal();
                                    if (length > 1 || !that.image_batch_onload.includes(true)) {
                                        that.image_batch_onload = [];
                                        that.show_image_loading = false;
                                        // 选中元素
                                        that.set_ele_checked($ele);
                                    }
                                    break;
                            }
                        });
                    }).catch(err => {
                        that.close_img_load();
                        if (image_index >= 0) that.image_batch_onload[image_index] = false;
                        that.$toast("上传图片失败，请重试");
                    });
                })(image_index);
            }
        },
        // 显示图片加载蒙层
        show_image_load_masking: function () {
            let that = this,
                $loading = $('.image_loading'),
                contain_w = $('.edit_body').width();
            $loading.css({
                'width': contain_w / 2,
                'height': (contain_w / 2) * (520 / 800),
                'margin': '-' + (contain_w / 2) * (520 / 800) / 2 + 'px 0 0 -' + contain_w / 4 + 'px'
            });
            that.show_image_loading = true;
            that.stop_build_image = false;
        },
        // 取消生成图片
        close_img_load: function () {
            let that = this;
            that.show_image_loading = false;
            that.element_message.image_src = '';
            that.element_type = '';
            that.stop_build_image = true;
            that.image_batch_onload = [];
        },
        // 本地图片替换
        change_local_image: function (ele) {
            let that = this,
                $operate = $('.operate'),
                option = opt_factory.init_opt('img'),
                $ele = $('.page_contain .edit_page .ele_item.checked');
            $ele.hide();
            $operate.hide();
            that.upload_img(ele.files, 'change_img');
            ele.value = '';
        },
        // 切换图片链接
        change_image_src: function (str) {
            let that = this,
                $ele = $('.page_contain .ele_item.checked'),
                option = opt_factory.init_opt('img');
            // 切换图片
            option.change_url($ele, str);
            // 选中元素
            that.set_ele_checked($ele);
        },
        // 图片元素双击打开图片库替换链接
        image_dblclick: function () {
            this.open_media_modal('photo', 'element_src');
        },
        // 将图片设置为背景
        set_bgimg: function () {
            let that = this;
            let $page = $('.page_contain .edit_page');
            page_opt.set_page_background($page, {
                type: 'image',
                color: that.page_info.background.color || "#ffffff",
                image: {
                    src: $('.ele_item.checked').find('image').attr('href'),
                    type: 'cover',
                }
            });
            that.ele_delete();
        },
        /* 图片元素特性方法 end */

        /* 表格元素特性方法 start */
        // 设置表格行列数
        set_row_column: function (data) {
            let that = this,
                option = opt_factory.init_opt('table'),
                $checked = $('.page_contain .ele_item.checked');
            option.set_row_column($checked, data, function () {
                // 若直接删除文档，回调取消元素选中状态(暂无其他方案)
                that.ele_cancel_checked();
            });
            // 同步左侧栏
            if (data === 'add_top' || data === 'add_bottom') {
                that.element_message.row++;
            } else {
                that.element_message.line++;
            }
        },
        // 表格右键菜单菜单事件
        select_table_row: function (data) {
            let that = this,
                option = opt_factory.init_opt('table'),
                $checked = $('.page_contain .ele_item.checked');
            if (data === 'merge_cel' || data === 'split_cel') {
                // 合并/拆分单元格
                option.toggle_merge($checked, data);
            } else {
                // 设置表格行列数
                that.set_row_column(data);
            }
        },
        set_table_merge: function(data) {
            let option = opt_factory.init_opt('table');
            let $checked = $('.page_contain .ele_item.checked');
            switch (data) {
                case 'merge':
                    option.toggle_merge($checked, 'merge_cel');
                    break;
                case 'mergeTop':
                    break;
                case 'mergeBottom':
                    break;
                case 'mergeLeft':
                    break;
                case 'mergeRight':
                    break;
                case 'split':
                    option.toggle_merge($checked, 'split_cel');
                    break;
            }
        },
        /* 表格元素特性方法 end */

        // 元素类型判断
        element_type_change: function () {
            let that = this,
                $checked = $(".page_contain .ele_item.checked"),
                $operate = $('.edit_operation .operate');
            // 初始化
            that.element_type = '';
            that.is_group = false;
            that.element_lock = false;
            // 判断选中状态
            if ($checked.length === 1) {
                if ($checked.hasClass('lock')) {
                    that.element_lock = true;
                } else {
                    that.element_type = $checked.attr("data-type");
                }
            } else if ($checked.length > 1) {
                that.element_type = 'group';
                let group_arr = [],
                    type_list = ['text', 'table', 'line'];
                // 获取组合列表
                $checked.each(function () {
                    let group_id = $(this).attr("data-group") || `undefined${$(this).index()}`,
                        type = $(this).attr('data-type');
                    if (group_arr.indexOf(group_id) < 0) group_arr.push(group_id);
                });
                // 判断是否为组合元素
                that.is_group = group_arr.length === 1;
                // 判断是否已锁定
                if ([...$checked].every(item => $(item).hasClass('lock'))) {
                    that.element_lock = true;
                    that.element_type = '';
                }
            }
            // 关闭背景设置面板
            if (that.$refs.background_setting && that.element_type !== '') that.$refs.background_setting.close();
        },

        /* 更改画布尺寸相关方法 start*/
        // 收回左侧栏
        put_left_modal_away: function (value) {
            let that = this;
            that.show_left_modal = value;
            that.$refs.leftHandle.isOpen = value;
            if (!that.show_left_modal) {
                that.$refs.background_setting && that.$refs.background_setting.close();
            }
            // 清除画布状态
            that.clear_page_status();
            // 清除元素选中状态
            that.ele_cancel_checked();
            // 重新计算左侧序列表内容大小
            that.$nextTick(() => {
                that.$refs.sort_page_modal.initial_list_data();
                // 重新计算画布缩放
                page_opt.save_page_offset(that);
                that.compute_suitable_scale();
            })
        },
        /* 更改画布尺寸相关方法 end*/

        // 右侧栏相关
        change_right_panel: function(item) {
            this.current_right_panel = item.key;
        },

        /* 我的颜色面板相关 */
        // 打开我的颜色弹框
        show_mycolor_modal: function () {
            this.$refs.my_color.open();
        },
        // 更新我的颜色列表
        update_mycolor_list: function (data) {
            this.$refs.common_color.my_color_list = data;
        },
        /* 通用颜色面板相关 end*/

        /* 设置弹框相关方法 */
        // 打开主题弹框
        open_theme_modal: function () {
            let that = this;
            // 清除画布状态
            that.clear_page_status();
            // 清除元素选中状态
            that.ele_cancel_checked();
            // 关闭其他设置面板设置面板
            that.$refs.animation_modal && that.$refs.animation_modal.hide();
            // 同步文档信息
            that.theme_checked = {
                font: that.document_info.font,
                background: that.document_info.background,
                shapeColor: that.document_info.shapeColor,
                textColor: that.document_info.textColor,
                width: that.document_info.width,
                height: that.document_info.height,
                page_size_type: "",
                had_change: false,
                theme_color_had_change: false,
                theme_family_had_change: false,
                doc_size_had_change: false
            };
            // 更新比例
            let item = that.doc_size_list.filter(function (item, index, arr) {
                item.checked = false;
                if (item.width === that.document_info.width && item.height === that.document_info.height) {
                    return item;
                }
            })[0];
            if (item) {
                item.checked = true;
                that.theme_checked.page_size_type = item.name
            } else {
                that.show_custom_scale = true;
                that.doc_size_list[that.doc_size_list.length - 1].checked = true;
                that.theme_checked.page_size_type = '自定义'
            }
            that.$refs.theme_modal && that.$refs.theme_modal.open();
        },
        // 选择文档比例
        change_doc_size: function (index, new_doc) {
            if (!index && index !== 0) return;
            let that = this,
                size_info = that.doc_size_list[index];
            that.doc_size_list.forEach(function (item) { item.checked = false });
            size_info.checked = true;
            if (!size_info.width || !size_info.height) {
                that.show_custom_scale = true;
                that.$nextTick(function () {
                    $('.custom_size input').eq(0).focus();
                });
                that.theme_checked.page_size_type = '自定义';
                that.theme_checked.width = that.document_info.width;
                that.theme_checked.height = that.document_info.height;
            } else {
                let had_change = that.document_info.width !== size_info.width || that.document_info.height !== size_info.height;
                that.show_custom_scale = false;
                that.theme_checked.width = size_info.width;
                that.theme_checked.height = size_info.height;
                if (had_change) {
                    that.theme_checked.had_change = true;
                    that.theme_checked.doc_size_had_change = true;
                }
            }
            if (new_doc) {
                page_opt.set_document_size(that.document_info, that.theme_checked.width, that.theme_checked.height)
                return;
            }
            that.sure_change_theme(new_doc);
        },
        // 确认修改主题
        sure_change_theme: function (new_doc) {
            let that = this;
            if (!that.theme_checked.had_change) return;
            let background = null;
            let shapeColor = null;
            let textColor = null;
            let font = null;
            let width = null;
            let height = null;
            //文档数据渲染
            if (that.theme_checked.theme_color_had_change) {
                background = that.theme_checked.background;
                shapeColor = that.theme_checked.shapeColor;
                textColor = that.theme_checked.textColor;
            }
            if (that.theme_checked.theme_family_had_change) {
                font = that.theme_checked.font;
            }
            if (that.theme_checked.doc_size_had_change) {
                if (!that.theme_checked.width || !that.theme_checked.height) {
                    return that.$toast('请设置画布尺寸', 800);
                }
                width = that.theme_checked.width;
                height = that.theme_checked.height;
            }
            // 切换画布比例差距较大时提示，目前还没确认下这个需求，可注释掉
            if (Math.abs(width / height - that.document_info.width / that.document_info.height) > 0.5 && !new_doc) {
                let confirm = window.confirm('画布尺寸比例改动较大，请注意页面元素是否能正常在画布显示');
                if (!confirm) {
                    return;
                }
            }
            //文档数据渲染
            if (background != null) { that.document_info.background = background; }
            if (shapeColor != null) { that.document_info.shapeColor = shapeColor; }
            if (textColor != null) { that.document_info.textColor = textColor; }
            if (font != null) { that.document_info.font = font; }
            if (width != null) { that.document_info.width = width; }
            if (height != null) { that.document_info.height = height; }
            that.document_info.modifyDate = '未保存';

            //文档页列表元素渲染
            if (that.theme_checked.theme_color_had_change || that.theme_checked.theme_family_had_change) {
                that.document_page_list.forEach(function (item, index) {
                    item.sign = page_opt.fn.uuid();
                    that.page_info_use_theme_style(item, background, shapeColor, textColor, font);
                });
            }
            //当前文档页
            let new_page_info;
            $.each(that.document_page_list, function (i, item) {
                if (item.uuid === that.page_info.uuid) {
                    new_page_info = page_opt.fn.clone_object(item);
                    return false;
                }
            });
            if (typeof (new_page_info) !== "undefined") {
                that.page_info = new_page_info;
            } else {
                if (that.theme_checked.theme_color_had_change || that.theme_checked.theme_family_had_change) {
                    that.page_info_use_theme_style(that.page_info, background, shapeColor, textColor, font);
                }
            }
            that.theme_checked.width = that.document_info.width;
            that.theme_checked.height = that.document_info.height;
            //内容比例
            that.compute_suitable_scale();
            //触发保存
            that.save_doc_page();
        },
        // 文档页应用样式
        page_info_use_theme_style: function (page_info, background, shapeColor, textColor, font) {
            if (background != null) {
                page_info.background = background;
            }
            //元素列表
            let element_arr = page_info.elementList;
            if (element_arr[0] == null) return;
            element_arr.forEach(function (el) {
                switch (el.type) {
                    case 'text':
                        let $element = $(el.content);
                        if (textColor != null) {
                            $element.css('color', textColor).find('*').css('color', textColor);
                        }
                        if (font != null) {
                            $element.css('fontFamily', font).find('*').css('fontFamily', font);
                        }
                        el.content = $element[0].outerHTML;
                        break;
                    case 'line':
                        if (shapeColor != null) {
                            el.border_c = shapeColor;
                        }
                        break;
                    case 'shape':
                        if (el.text) {
                            let $element = $(el.text.content);
                            if (textColor != null) {
                                $element.css('color', textColor !== shapeColor ? textColor : '#ffffff').find('*').css('color', textColor !== shapeColor ? textColor : '#ffffff');
                            }
                            if (font != null) {
                                $element.css('fontFamily', font).find('*').css('fontFamily', font);
                            }
                            el.text.content = $element[0].outerHTML;
                        }
                        if (shapeColor != null) {
                            el.background = shapeColor;
                        }
                        break;
                    case 'table':
                        el.tr_list.forEach(function (tr) {
                            tr.forEach(function (cel) {
                                if (background != null) {
                                    cel.background = background;
                                }
                                if (cel.content) {
                                    let $cel = $(cel.content);
                                    if (textColor != null) {
                                        $cel.css('color', textColor).find('*').css('color', textColor);
                                    }
                                    if (font != null) {
                                        $cel.css('fontFamily', font).find('*').css('fontFamily', font);
                                    }
                                    cel.content = $cel[0].outerHTML;
                                }
                            })
                        });
                        break;
                }
            });
        },
        // 打开过渡效果弹框
        open_transition_modal: function (type) {
            this.$refs.theme_modal && this.$refs.theme_modal.close();
            this.$refs.background_setting && this.$refs.background_setting.close();
            this.$refs.animation_modal && this.$refs.animation_modal.toggle(null, type);
        },
        // 隐藏未保存提示
        hide_save_tips: function () {
            this.show_save_tips = false;
        },

        /* 顶栏功能 */
        // 演示功能
        show_doc_display: function (display_start_status) {
            let that = this,
                doc_id = that.document_info.id,
                page_id = that.page_info.id,
                begin_index = 0;
            // 从当前页开始播放
            if (!display_start_status) {
                begin_index = that.document_page_list.findIndex(item => item.uuid === that.page_info.uuid);
            }
            if (begin_index < 0) {
                begin_index = 0;
            }
            if (doc_id === '' || page_id === '') {
                that.$toast('请保存后操作', 800)
            } else {
                // 打开预览层
                that.show_slides_preview = true;
                setTimeout(() => {
                    that.$refs.slides_document.show({
                        url: that.document_info.url,
                        begin: begin_index,
                    });
                }, 16);
            }
        },
        // 退出演示
        out_slides_preview: function () {
            this.show_slides_preview = false;
        },
        update_doc_title: function(title) {
            this.document_info.title = title;
        },
        open_material_modal: function(insert = 'insert', option) {
            if (this.material_modal_show && this.$refs.MaterialModal.isShow) {
                this.$refs.MaterialModal.close();
                return;
            } else if (!this.material_modal_show) {
                this.close_all_modal('material');
                this.material_modal_show = true;
            } else {
                this.close_all_modal('material');
                this.$refs.MaterialModal.show();
            }
            this.$nextTick(() => {
                this.$refs.MaterialModal.insertType = insert;
                this.$refs.MaterialModal.insertOption = option;
            })
        },
        open_media_modal: function(type = 'photo', insert = 'insert', option) {
            if (this.media_modal_show && this.$refs.MediaModal.isShow) {
                this.$refs.MediaModal.close();
                return;
            } else if (!this.media_modal_show) {
                this.close_all_modal('media');
                this.media_modal_show = true;
            } else {
                this.close_all_modal('media');
                this.$refs.MediaModal.show();
            }
            this.$nextTick(() => {
                this.$refs.MediaModal.category = type;
                this.$refs.MediaModal.insertType = insert;
                this.$refs.MediaModal.insertOption = option;
            })
        },
        // 更新我的空间弹框
        update_space_modal: function() {
            if (this.$refs.mySpaceModal) {
                this.$refs.mySpaceModal.needUpdate = true;
            }
        },
        // 关闭所有弹框面板
        close_all_modal: function(type) {
            this.$refs.FormatPanel && this.$refs.FormatPanel.hide_all_list();
            this.$refs.animation_modal && this.$refs.animation_modal.hide();
            this.$refs.background_setting && this.$refs.background_setting.close();
            this.$refs.theme_modal && this.$refs.theme_modal.close();
            type !== 'material' && this.$refs.MaterialModal && this.$refs.MaterialModal.close();
            type !== 'media' && this.$refs.MediaModal && this.$refs.MediaModal.close();
            type !== 'preset' && this.$refs.presetModal && this.$refs.presetModal.close();
            type !== 'space' && this.$refs.mySpaceModal && this.$refs.mySpaceModal.close();
        },

        /* 操作记录相关 */
        // 打开/关闭操作记录iframe
        toggle_action_history: function () {
            let that = this;
            if (!that.user.login) return that.$toast('登录后才可以执行该操作', 1500);
            // 未编辑的文档拦截查看操作记录
            if (that.modal_id || $validate(that.document_info.id).empty()) return that.$toast("编辑幻灯片后才可以查看操作记录哦", 800);
            document_save.backup.mapi.document_opt_log_count({ documentId: that.document_info.id }).then(res => {
                let data = res.data;
                if (data > 0) {
                    that.history_iframe_src = `/document_recovery_preview/${that.document_info.id}/?mode=remote`
                    that.show_history_iframe = true;
                    window.recoveryObject = {
                        close: that.close_history_iframe,
                        recovery: that.recovery_action_history,
                        hcoin: that.doc_hcoin,
                        editCount: that.document_info.editCount,
                    }
                    return;
                }
                that.$toast('暂无操作记录', 1500);
            }).catch(error => {
                console.error(error);
                that.$toast('获取操作记录异常', 1500);
            });
        },
        // 关闭操作记录iframe
        close_history_iframe: function () {
            this.show_history_iframe = false;
            delete window.recoveryObject;
        },
        // 恢复操作记录
        recovery_action_history: function (version) {
            let that = this;
            //恢复成功
            let recovery_success = function () {
                clearTimeout(that.backup_recovery.timer);
                that.backup_recovery.msg = '备份恢复成功,正在跳转页面';
                that.backup_recovery.timer = setTimeout(function () {
                    that.backup_recovery.show = false;
                    window.location.reload(true);
                }, 2 * 1000);
            }
            //恢复失败
            let recovery_error = function () {
                clearTimeout(that.backup_recovery.timer);
                that.backup_recovery.msg = '备份恢复失败';
                that.backup_recovery.timer = setTimeout(function () {
                    that.backup_recovery.show = false;
                }, 3 * 1000);
            }
            that.$modal({
                modalClass: 'backup_recovery_confirm',
                modalTitle: '备份恢复',
                modalContent: '恢复后，当前文档会被备份数据覆盖',
                showSubmit: true,
                showCancel: true,
                submitCallback: function (modal) {
                    that.close_history_iframe();
                    that.backup_recovery.show = true;
                    document_save.backup.method.recovery(that, that.document_info.id, version, null, 100).then(res => {
                        document_save.backup.method.recovery_submit({ document: res.document_info, documentPages: res.document_page_list }).then(res => {
                            if (res.data.type !== 'success') {
                                recovery_error();
                                return;
                            }
                            that.ws_doc_history_rollback_send(`/edit/?docId=${that.document_info.id}`);//提示协作
                            recovery_success();
                        }, error => {
                            recovery_error();
                        });
                    }, error => {
                        recovery_error();
                    });
                    modal.close();
                }
            });
        },

        /* 自由版式相关 */
        // 打开关闭自由版式编辑iframe
        toggle_action_custom: function (id, callback) {
            let that = this;
            if (!that.user.login) return that.$toast('登录后才可以执行该操作', 1500);
            that.custom_iframe_src = `/edit/?mode=custom&presetId=${id || ''}&ws=false`;
            that.show_custom_iframe = true;
            window.close_custom_iframe = () => {
                that.close_custom_iframe();
                callback&&callback();
            };
        },
        // iframe内部关闭
        iframe_close_custom: function () {
            window.parent.close_custom_iframe();
        },
        // 关闭自由版式iframe
        close_custom_iframe: function () {
            this.show_custom_iframe = false;
            this.custom_iframe_src = '';
        },
        // 保存自由版式
        save_custom_preset: function () {
            let that = this;
            let page_info = page_opt.get_page(opt_factory.init_opt('group').get_canvas_page());
            let page_svg = that.$common.obj_2_svg(that.document_info, page_info);
            let get_base64 = that.$common.svg_2_base64(page_svg);
            that.custom_preset_saving = true;
            get_base64.then(function (data) {
                that.$axios.post('/api/member/mylayout/save/', {
                    id: that.preset_id || '',
                    name: that.$refs.editHead.page_info_title,
                    image: data,
                    content: JSON.stringify(page_info)
                })
                    .then(function (data) {
                        if (data.data.code === '2') {
                            that.$toast(data.data.content, 1500);
                            that.custom_preset_saving = false;
                            window.parent.close_custom_iframe();
                        } else {
                            that.custom_preset_saving = false;
                            that.$toast(data.data.content, 1500);
                        }
                    })
            })
        },

        // 关闭指引
        close_export_guide: function () {
            this.show_export_guide = false;
            window.localStorage.setItem('woodoExportGuide', 'showed');
        },
        // 打开保存为模板弹框
        toggle_save_template: function () {
            let that = this,
                id = that.document_info.id;
            if (!that.user.login) return that.$toast('登录后才可以执行该操作', 1500);
            if ($validate(id).empty() || that.modal_id) return that.$toast('请保存后操作', 800);
            that.save_template = !that.save_template;
            if (that.save_template) {
                that.template_title = that.document_info.title;
                // 获取模板分类列表
                if (!that.template_category_list.length) {
                    that.toggle_change_template_type('slides');
                }
            }
        },
        // 触发修改模板类型
        toggle_change_template_type: function (type) {
            let that = this;
            if (that.current_template_type == type) {
                return;
            }
            //切换类型初始化数据
            that.current_template_type = type;
            that.current_template_category = { name: null, id: null };
            that.current_tag_list = [];
            that.template_category_list = [];
            that.$axios.get('/api/category/list/', {
                params: {
                    type: type,
                    grade: 3
                }
            }).then(function (data) {
                if (data.data.code === '2') {
                    that.template_category_list = data.data.data;
                } else {
                    console.log(data.data.content);
                }
            });
            $('.category_list').hide();
        },
        // 控制分类下拉列表
        toggleCategoryList() {
            $('.category_list').toggle();
        },
        // 选择分类
        chooseCategory(item) {
            if (!item.id) return;
            this.current_template_category = item;
            $('.category_list').hide();
        },
        // 控制标签弹框
        toggleTagModal() {
            let that = this;
            let $modal = $('.add_tag_modal');
            if ($modal.is(':hidden')) {
                if (!this.current_template_category.id) {
                    that.$toast('请先选择分类~', 1500);
                    return;
                } else {
                    that.getTagList();
                }
            } else {
                $('.add_tag_modal').find('span.tag').removeClass('current');
            }
            $('.add_tag_modal').fadeToggle();
        },
        chooseTag(e) {
            $(e.target).toggleClass('current');
        },
        confirmAddTag() {
            let that = this;
            let $list = $('.add_tag_modal').find('.tag.current');
            if (!$list.length) {
                return that.$toast('请选择标签后再进行保存~', 1500);
            }
            $list.each(function () {
                that.current_tag_list.unshift($(this).text());
            });
            $('.add_tag_modal').fadeOut();
        },
        // 获取标签列表
        getTagList() {
            let that = this;
            if (!that.current_template_category.id) {
                that.$toast('暂未选中分类~', 1500);
                return;
            }
            that.$axios(`/api/tag/classify/?cid=${that.current_template_category.id}`).then((data) => {
                that.tag_list = data.data.data;
            })
        },
        // 添加自定义标签
        addCustomTag(e) {
            let that = this;
            if (!that.current_template_category.id) {
                $(e.target).val('');
                return that.$toast('请先选择分类后再添加标签~');
            }
            let content = $(e.target).val();
            if (typeof content !== 'string') return;
            if (!content.trim()) return;
            let tagArr = content.split(/[ ,，]/);
            if (tagArr.length) {
                tagArr.forEach(item => {
                    if (item) {
                        if (that.current_tag_list.includes(item)) {
                            return false;
                        }
                        that.current_tag_list.unshift(item);
                    }
                });
                $(e.target).val('');
            }
        },
        // 删除标签
        deleteTag(index) {
            this.current_tag_list.splice(index, 1);
        },
        // 发布作品
        publish_works: function () {
            let that = this,
                id = that.document_info.id,
                name = that.template_title,
                type = that.current_template_type ? that.current_template_type : "slides";
            if ($validate(id).empty()) return that.$toast('请保存后操作', 800);
            // 判断为空
            if (name.length === 0) return that.$toast("名称不能为空", 800);
            if (!that.current_template_category.id) return that.$toast("分类不能为空", 800);
            if (!that.current_tag_list.length) return that.$toast("请填写或选择标签", 800);
            // 判断超出大小限制
            if (name.length > 20) return that.$toast("作品名称不能超过20个字！", 800);
            // 特殊符号判断
            if ($validate(name).special()) {
                return that.$toast('作品名称不可带有特殊符号');
            }
            that.btn_confirm_disabled = true;
            setTimeout(() => {
                let page_svg = that.$common.obj_2_svg(that.document_info, that.document_page_list[0]),
                    get_base64 = that.$common.svg_2_base64(page_svg);
                get_base64.then(function (data) {
                    that.$axios.post('/api/member/designer/publish_works/', {
                        type: type,
                        documentId: id,
                        name: name,
                        cid: that.current_template_category.id,
                        tagName: that.current_tag_list.join(','),
                        image: data
                    }).then(function (data) {
                        if (data.data.code === '2') {
                            that.btn_confirm_disabled = false;
                            that.toggle_save_template();
                            that.$toast(data.data.content, 2000);
                        } else {
                            that.btn_confirm_disabled = false;
                            that.$toast(data.data.content, 2000);
                        }
                    })
                })
            }, 500);
        },
        // 打开生成 h5预览 弹窗
        open_preview_h5: function () {
            if (!this.user.login) return this.$toast('登录后才可以执行该操作', 1500);
            this.$refs.h5_preview.show(this.document_info.url);
        },

        /*协作者相关 start*/
        get_all_partner: function (socket_send) {
            let that = this;
            collaborate.specific(that, {
                id: that.document_info.id,
                success: function (data) {
                    if (data.data.code !== '2') return that.$toast(data.data.content, 800);
                    let partner = Object.values(data.data.data)[0];
                    if (typeof (partner) === 'undefined') partner = [];
                    that.$axios.get('/api/member/document/team_detail/' + that.document_info.id + '/')
                        .then(function (res) {
                            if (res.data.code == 2) {
                                partner.forEach(function (item) {
                                    if (item.memberId === res.data.data.teamOwnerId) item.teamowner = true;
                                })
                            }
                            that.interim_authority.partner = partner;
                            if (socket_send) that.ws_doc_authority_send();
                        })
                }
            });
        },
        // 获取当前用户权限
        get_user_authority: function () {
            let that = this,
                id = that.document_info.id;
            if (id !== '') {
                that.$axios.get('/api/member/document_collaborate/get_authorities/', { params: { docId: id } })
                    .then(function (data) {
                        if (data.data.code !== '2') return that.$toast(data.data.content, 800);
                        that.document_option_authority = data.data.data.authorityTypes;
                        that.user_disable_edit = that.check_option_disable(that.page_authority.edit, that.document_option_authority);
                        that.user_authority_type = data.data.data.collaborateRoleType;
                        that.user.role = collaborate.authority_map[data.data.data.collaborateRoleType].id;
                    });
            } else {
                that.document_option_authority = [];
            }
        },
        // 检查当前功能是否禁用
        check_option_disable: function (data, arr) {
            let that = this,
                modal_id = that.$route.query.modalId;
            //无数据默认权限放行
            if (typeof (data) === 'undefined' || data === '' ||
                typeof (arr) === 'undefined' || arr.length === 0) {
                return false;
            }
            // 判断当前是否为模板进入
            if (modal_id) return false;
            // 判断当前是否存在文档
            if (that.document_info.id === null) return false;
            // 判断当前用户权限
            if (arr.length <= 0) return true;
            // 判断是否存在权限限制
            if (!data) return true;
            // 判断功能是否禁用
            if (arr.indexOf(data) < 0) return true;
            return false;
        },
        /*协作者相关 end*/

        /*评论相关 start*/
        // 顶部评论 - 获取全部评论
        get_comment_count: function (id) {
            let that = this;
            that.$axios.get(`/api/member/document_review/count/${id}/`).then(data => {
                if (data.data.code !== '2') {
                    return console.error('获取评论数失败')
                }
                that.comment_map = data.data.data;
            }).catch(data => {
                console.error('获取评论数失败')
            });
        },
        get_all_comment: function (resolve) {
            let that = this;
            if (that.modal_id !== null || that.document_info.id == null || that.page_info.id == null) return false;
            that.$axios.get('/api/member/document_review/list/', {
                params: {
                    docId: that.document_info.id,
                }, paramsSerializer: params => {
                    return qs.stringify(params, { indices: false })
                }
            })
                .then(function (data) {
                    if (data.data.code !== '2') return that.$toast(data.data.content, 800);
                    let list = data.data.data.documentReviews;
                    if (list.length <= 0) return false;
                    if (!data.data.data.isRead) that.$refs.editHead.un_read_comment = true;
                    list.forEach(function (item) {
                        // 展开回复标记
                        item.open_reply = false;
                        // 展开更多操作标记
                        item.show_more = false;
                        // 展开删除确认标记
                        item.show_delete = false;
                        // 重编辑标记
                        item.reedit = false;
                        // 计算评论相对时间
                        item.date = page_opt.fn.return_fixed_time(item.modifyDate);
                        // 计算回复相对时间
                        if (item.documentReviewReplies.length > 0) {
                            item.documentReviewReplies.forEach(function (reply) {
                                reply.date = page_opt.fn.return_fixed_time(item.modifyDate);
                            })
                        }
                    });
                    that.$refs.editHead.comment_list = list;
                    if (resolve && typeof resolve === 'function') resolve();
                })
        },
        get_right_comment: function () {
            let that = this,
                $target = $('.page_contain .ele_item.checked'),
                params = {
                    docId: that.document_info.id,
                    pId: that.page_info.id,
                    isSolve: false,   //只获取未解决的评论
                };
            if (that.modal_id !== null || that.document_info.id == null || that.page_info.id == null) return false;
            // 右侧弹框被手动关闭 或 全部评论为空 时，不获取
            if (that.$refs.editHead.right_comment_close) return false;
            that.$axios.get('/api/member/document_review/list/', {
                params: params,
                paramsSerializer: params => {
                    return qs.stringify(params, { indices: false })
                }
            })
                .then(function (data) {
                    if (data.data.code !== '2') return that.$toast(data.data.content, 800);
                    let list = data.data.data.documentReviews;
                    if (list.length > 0) {
                        list.forEach(function (item) {
                            // 展开回复标记
                            item.open_reply = false;
                            // 展开更多操作标记
                            item.show_more = false;
                            // 展开删除确认标记
                            item.show_delete = false;
                            // 重编辑标记
                            item.reedit = false;
                            // 计算评论相对时间
                            item.date = page_opt.fn.return_fixed_time(item.modifyDate);
                            // 计算回复相对时间
                            if (item.documentReviewReplies.length > 0) {
                                item.documentReviewReplies.forEach(function (reply) {
                                    reply.date = page_opt.fn.return_fixed_time(item.modifyDate);
                                })
                            }
                        });
                        that.$refs.editHead.show_right_comment = true;
                    }
                    that.$refs.editHead.right_all_comment_list = list;
                    // 存储当前选中/全部元素id
                    that.$refs.editHead.refresh_comment_id();
                });
        },
        /*评论相关 end*/

        // 获取用户私人配置
        get_personal_config: function() {
            return new Promise((resolve, reject) => {
                this.$axios.get('/api/member/personal_conf/').then(data => {
                    this.user_personal_config = data.data.data ? JSON.parse(data.data.data.content) : {};
                    resolve();
                }).catch(err => {
                    reject(err);
                })
            })
        },
        // 判断浏览器
        judge_browser: function () {
            let that = this;
            let is_tips = false;
            let is_low = false;
            let device = utils.deviceENV();
            let browser_name = '';      // 浏览器名称
            let mode = '';              // 双核模式
            let reason = '';            // 浏览器不正常原因
            let abnormal = [];          // 可能出现问题的数组
            try {
                // 浏览器名称判断
                switch (true) {
                    case device.edge:
                        browser_name = 'Edge';
                        break;
                    case device.liebao:
                        browser_name = '猎豹';
                        break;
                    case device.sougou:
                        browser_name = '搜狗';
                        break;
                    case device.baidu:
                        browser_name = '百度';
                        break;
                    case device.wechatPC:
                        browser_name = 'PC版微信';
                        break;
                    case device.QQBrowserLite:
                        browser_name = 'QQ Lite';
                        break;
                    case device.QQBrowser:
                        browser_name = 'QQ';
                        break;
                    case device.Maxthon:
                        browser_name = '遨游';
                        break;
                    case device.ie:
                        browser_name = 'Internet Explorer';
                        break;
                    case device.chrome:
                        browser_name = '谷歌';
                        break;
                    case device.safari:
                        browser_name = 'Safari';
                        break;
                    case device.firefox:
                        browser_name = '火狐';
                        break;
                }
                // ie浏览器显示不同内容
                if (device.ie) {
                    is_tips = true;
                    is_low = true;
                    reason = '运行速度较慢';
                    abnormal = [
                        '文本编辑异常', '快捷键无法使用',
                        '表格无法编辑', '操作异常',
                        '无法自动保存', '动画效果不支持',
                    ];
                    if (browser_name !== 'Internet Explorer') {
                        mode = '兼容模式';
                    }
                } else {
                    reason = '版本过低';
                    abnormal = [
                        '操作异常', '',
                        '动画效果不支持', '',
                        '无法自动保存', '',
                    ];
                    // 浏览器内核低版本判断
                    let ua_match;
                    switch (true) {
                        case device.QQBrowserLite:
                            // QQ lite 直接提示
                            is_tips = true;
                            is_low = true;
                            break;
                        // ---- chrome内核
                        case device.chrome:
                            ua_match = device.userAgent.match(/Chrome\/[\d\.]+/);
                            if (!ua_match) {
                                break;
                            }
                            let chrome_version = ua_match[0].replace('Chrome/', '');
                            chrome_version = +chrome_version.slice(0, chrome_version.indexOf('.'));
                            if (chrome_version <= 50) {
                                is_tips = true;
                            }
                            if (chrome_version <= 63) {
                                is_low = true;
                            }
                            break;
                        // ---- 火狐内核
                        case device.firefox:
                            is_tips = true;
                            is_low = true;
                            reason = '';
                            break;
                        // ----  safari版本
                        case device.safari:
                            ua_match = device.userAgent.match(/Version\/[\d\.]+/);
                            if (!ua_match) {
                                break;
                            }
                            let safari_version = ua_match[0].replace('Version/', '');
                            safari_version = +safari_version.slice(0, safari_version.indexOf('.'));
                            if (safari_version < 9) {
                                is_tips = true;
                            }
                            if (safari_version < 11) {
                                is_low = true;
                            }
                            break;
                    }
                }
                if (is_tips) {
                    // 浏览器异常列表
                    let $li = abnormal.map(item => {
                        return `<li>${item}</li>`;
                    }).join('');
                    let content_html = `
                            <div class="tips_content">
                                <p class="title"><i></i>系统检测到你使用的 <span class="underline">${browser_name}浏览器${mode}</span> <span class="red">${reason}</span>，建议升级或使用以下浏览器：</p>
                                <ul class="recommend_browser">
                                    <li class="chrome"><i></i><p>Chrome</p><a href="https://www.google.cn/intl/zh-CN/chrome/" target="_blank" rel="noreferrer noopener">下载</a></li>
                                    <li class="_360"><i></i><p>360极速浏览器</p><a href="https://browser.360.cn/ee/" target="_blank" rel="noreferrer noopener">下载</a></li>
                                    <li class="sougou"><i></i><p>搜狗浏览器</p><a href="https://ie.sogou.com/" target="_blank" rel="noreferrer noopener">下载</a></li>
                                    <li class="qq"><i></i><p>QQ浏览器</p><a href="https://browser.qq.com/" target="_blank" rel="noreferrer noopener">下载</a></li>
                                </ul>
                            </div>
                            <div class="tips_footer">
                                <p class="disabled_tips">如继续使用当前浏览器可能会导致以下问题：</p>
                                <ul>${$li}</ul>
                                <div class="wechat_service_group">
                                    <div class="code"><i></i><img src="https://file.woodo.cn/upload/foreverImage/kefu_qrcode.png?v=${new Date().getTime()}"/></div>
                                    <p>【微信扫码加群反馈】</p>
                                </div>
                            </div>
                        `;
                    that.$modal({
                        modalClass: 'browser_tips_modal',
                        modalTitle: '',
                        modalContent: content_html,
                        showSubmit: false,
                        showCancel: false,
                        closeCallback() {
                            // 隐藏浏览器提示弹框，间隔5分钟提醒一次
                            setTimeout(() => {
                                that.judge_browser();
                            }, 1000 * 60 * 5);
                        },
                    });
                }
            } catch (err) {
                console.error('浏览器识别失败', err);
            }
            that.low_browser_version = is_low;
        },
        // 未操作刷新提示
        init_reload_interval: function () {
            let that = this;
            clearInterval(that.timer_id_stack['reload']);
            clearInterval(that.timer_id_stack['cancel_checked']);
            if (!that.show_slides_preview) {
                that.timer_id_stack['reload'] = setInterval(function () {
                    that.show_reload_tips = true;
                }, 1000 * 60 * 60);
                //取消选中
                that.timer_id_stack['cancel_checked'] = setInterval(function () {
                    that.ele_cancel_checked();
                }, 1000 * 60 * 5);
            }
        },
        // 幻币获取 - 有效文档获取幻币数获取
        get_edit_doc_hcoin: function () {
            /**
             * 进入文档时获取一次
             * 进入后首次保存获取一次
             * 编辑次数达到100获取一次
             * 添加一名协作者后获取一次
             * 定时器每2分钟获取一次
             */
            let that = this;
            that.$axios.get('/api/member/hcoin_log/hcoin_total/', {
                params: {
                    'docId': that.$route.query.docId,
                    'opts': ['documentEdit', 'documentCollaborateAdd'],
                },
                paramsSerializer: (params) => {
                    return qs.stringify(params, { arrayFormat: 'repeat' });
                },
            }).then((result) => {
                let data = result.data;
                if (data.type === 'success') {
                    data = data.data;
                    that.doc_hcoin = Number(data);
                }
            }).catch((err) => {
                console.error(err);
            });
        },
        // 页面初始化(只执行一次)
        page_initial: function () {
            //画布位置
            page_opt.save_page_offset(this);
        },
        // 通用事件绑定
        page_event_initial: function () {
            let that = this;
            let closure = {};
            // mousewheel 事件监听 - 用于监听画布切换
            if (utils.deviceENV().firefox) {
                // 获取浏览器兼容
                document.addEventListener("DOMMouseScroll", that.mousewheel_listener);
            } else {
                // 正常事件绑定
                window.onmousewheel = document.onmousewheel = that.mousewheel_listener;
            }
            // resize 事件监听
            window.onresize = that.resize_listener;
            // click 事件监听 - 用于监听下拉框隐藏
            document.onclick = that.click_listener;
            // mousedown 事件监听 - 用于监听右键画布拖动
            document.onmousedown = that.mousedown_listener;
            // mousemenu 事件监听 - 用于元素右键菜单
            document.oncontextmenu = that.mousemenu_listener;
            // 全局复制方法
            document.addEventListener('copy', that.ele_copy);
            // 全局剪切事件
            document.addEventListener('cut', that.ele_cut);
            // 全局黏贴方法
            document.addEventListener("paste", that.paste_listener);
            // 全局按钮事件
            $(document).on("keydown", function (e) {
                that.init_reload_interval();
                if (!that.user_disable_edit) that.keydown_listener(e);
            });
            $(document).on("keyup", function (e) {
                if (e.keyCode === 32) {
                    that.page_state = 'common';
                    document.removeEventListener('mousedown', that.drag_page_listener);
                };
            });
            // 全局中文输入法监听
            $(document).on('compositionstart', function () {
                that.is_composition = true
            });
            $(document).on('compositionend', function () {
                that.is_composition = false
            });
            // 全局拖拽监听 - 1. 阻止 document.ondrop的默认行为
            $(document).on({
                dragenter: function (e) {
                    e.preventDefault();
                },
                dragover: function (e) {
                    e.preventDefault();
                },
                dragleave: function (e) {
                    e.preventDefault();
                },
                drop: function (e) {
                    e.preventDefault();
                    // 拖拽图片上传
                    if ($(e.target).parents('#page_contain').length > 0) {
                        that.upload_img(e.originalEvent.dataTransfer.files);
                    }
                }
            });
            $(document).on('input', '.page_contain .edit_page .show_text', that.input_listener);
            // 元素 mousedown 事件绑定（合并元素移动）
            operate_opt.bind_move_event({
                handle: '.page_contain .edit_page .ele_item, .operate .operate_border, .operate .child',
                before_down: function (event) {
                    let $crttarget = $(event.currentTarget);
                    let $target = $(event.target);
                    let option = opt_factory.init_opt('group');
                    let get_element = option.get_checked_element();
                    let $checked = get_element.element;
                    closure['event'] = event;
                    /**
                     * 已选中状态下点击目标指向元素处理
                     */
                    // 虚线框边框
                    if ($crttarget.hasClass('operate_border')) {
                        $crttarget = $checked;
                        // 清空选区
                        window.getSelection().removeAllRanges();
                    }
                    // 多选子元素
                    if ($crttarget.hasClass('child')) {
                        $crttarget = $checked;
                    }
                    /** 已选中状态下点击目标指向元素处理 end */
                    let is_lock = get_element.lock;
                    let is_ctrl = event.ctrlKey || (event.metaKey && utils.deviceENV().mac);
                    let is_shift = event.shiftKey;
                    let is_alt = event.altKey;
                    let is_editing = $target.attr('contenteditable') === 'true' || $target.parents('[contenteditable=true]').length > 0;
                    let is_table = $target.hasClass('table_resizer') || $target[0].nodeName === 'TD' || $target.parents('td').length > 0;
                    // 形状元素内置文本编辑时
                    if ($target.parents('[data-type="shape"]').length) {
                        is_editing = is_editing && $(":focus").length;
                    }
                    // 隐藏快捷操作栏下拉列表
                    that.$refs.FormatPanel.hide_all_list();
                    // 隐藏文本保留格式下拉框
                    that.show_paste_clean_list = false;
                    // 取消禁止组合子元素选中
                    operate_opt.can_check_child = true;
                    // 更新元素锁定状态
                    is_lock = $crttarget.hasClass('lock');
                    // 不进行拖动情况
                    if (is_lock || is_editing || is_ctrl || is_table) {
                        operate_opt.can_drag = false;
                    }
                    // 判断元素锁定
                    if (is_lock) {
                        that.page_create_event(event, true);
                    }
                    // 判断元素绘制
                    if (['create_text', 'create_line', 'create_shape'].indexOf(that.page_state) >= 0) {
                        operate_opt.can_drag = false;
                        return;
                    }
                    event.stopPropagation();
                    // 点击表格单元格之外的 -> 去除单元格编辑标识
                    if (!$target.parents('td').length || $target[0].tagName !== 'TD') {
                        $('.cel_edit').removeClass('cel_edit');
                    }
                    /**
                     * 元素 选中/取消选中 设置checked 、更新选中状态 虚线框
                     * ctrl 多选 / 取消单个选中 操作
                     */
                    if (is_ctrl || is_shift) {
                        // 点击未选中的元素添加选中，否则去除选中
                        let $ctrltarget = option.get_group_element($crttarget);
                        if ($ctrltarget.hasClass('checked') && is_ctrl) {
                            if ($target.hasClass('child')) {
                                $ctrltarget = option.get_group_element(option.get_element($target.attr('data-id')));
                            }
                            $ctrltarget.removeClass('checked');
                            // 阻止默认行为（阻止文本元素进入编辑）
                            event.preventDefault();
                        } else {
                            $ctrltarget.addClass('checked');
                        }
                        // 当一个被锁定状态，一个未锁定状态，则无法同时框选。同时框选时，默认选择未锁定状态
                        if (!that.element_lock) {
                            if ($ctrltarget.hasClass('lock')) {
                                $ctrltarget.removeClass('checked');
                            }
                        } else {
                            if (!$ctrltarget.hasClass('lock')) {
                                get_element = option.get_checked_element();
                                [...get_element.element].forEach(el => {
                                    if ($(el).hasClass('lock')) {
                                        $(el).removeClass('checked');
                                    }
                                })
                            }
                        }
                        get_element = option.get_checked_element();
                        $checked = get_element.element;
                    } else if (is_alt) {
                        // 如果当前元素未选中
                        if (!$crttarget.hasClass('checked')) {
                            // 清除元素选中状态
                            that.ele_cancel_checked();
                            // 选中当前点击
                            $crttarget.addClass('checked');
                        }
                        return;
                    } else {
                        /*
                        * 点击已选中状态的元素不处理
                        * 组合元素内的元素选中在 before_up 事件
                        * */
                        if ($crttarget.hasClass('checked')) {
                            return;
                        }
                        // 清除元素选中状态
                        that.ele_cancel_checked();
                        // 选中当前点击
                        $crttarget.addClass('checked');
                        get_element = option.get_checked_element();
                        if (get_element.group) {
                            $checked = get_element.group;
                        } else {
                            $checked = get_element.element;
                        }
                    }
                    if ($checked.length) {
                        // 选中元素
                        that.set_ele_checked($checked);
                        // 首次选中组合,禁止选中子元素
                        if ($checked.length > 1) {
                            operate_opt.can_check_child = false;
                        }
                    }
                    // 更新右侧评论
                    that.$refs.editHead && that.$refs.editHead.refresh_comment_id();
                },
                down: function (data) {
                    that.set_autofit();
                },
                before_move: function (event) {
                    // 移动状态下隐藏子虚线框
                    $('.operate .child').remove();
                    // 移动状态下隐藏组合单选虚线框
                    $('.group_operate').hide();
                    // 移动状态下隐藏形状编辑点
                    $('.operate_path_point .path_point.radius').hide();
                    // 隐藏音频控件
                    opt_factory.init_opt('audio').audio_control_hide();
                    // 移动状态下隐藏动画元素标记
                    that.animation_mark_hide(true);
                    // 显示网格线
                    that.toggle_grid_display(true);
                    // 拷贝
                    if (closure.event && closure.event.altKey) {
                        that.ele_copy(closure.event, true);
                        closure.event = null;
                    }
                },
                move: function (data, diff_x, diff_y) {
                    let page_scale = that.page_scale.user_set;
                    let option = opt_factory.init_opt('group');
                    let get_element = option.get_checked_element();
                    if (!get_element.element.length || get_element.lock) {
                        return;
                    }
                    let rect = option.window_2_page_offset(data, true).normal;
                    let ele_rect = option.compute_ele_seat(get_element.element).page;
                    let slow = Math.abs(diff_x) <= 3 || Math.abs(diff_y) <= 3;
                    // 获取旋转后实际 top left 与 元素坐标 top left 差值
                    let x_diff = Number((rect.w - ele_rect.w).toFixed(1)) / 2;
                    let y_diff = Number((rect.h - ele_rect.h).toFixed(1)) / 2;
                    /**
                     * 元素移动 && 自动贴合 && 参考线 处理 start
                     */
                    let fitrange = 3;
                    let point = {
                        x: rect.x,
                        y: rect.y,
                    };
                    let group_ele_offset = {
                        x: [],
                        y: [],
                    };
                    let reference_line_x = [];
                    let reference_line_y = [];
                    // 基于当前元素的 左 中 右 上 中 下 6个点对齐
                    let element_fit_x = {
                        'left': rect.x + x_diff,
                        'center': rect.x + rect.w / 2,
                        'right': rect.x + rect.w - x_diff,
                    };
                    let element_fit_y = {
                        'top': rect.y + y_diff,
                        'center': rect.y + rect.h / 2,
                        'bottom': rect.y + rect.h - y_diff,
                    };
                    // 保存组合元素相对于组合区域的坐标
                    if (get_element.type === 'group') {
                        get_element.element.each((i, ele) => {
                            let p = option.get_transform($(ele), 'translate');
                            group_ele_offset.x.push(Math.floor(p[0]) + x_diff - ele_rect.x);
                            group_ele_offset.y.push(Math.floor(p[1]) + y_diff - ele_rect.y);
                        });
                    }
                    // x轴方向自动贴合检索
                    let xfit_arr = [];
                    for (let key in element_fit_x) {
                        let value = element_fit_x[key];
                        let fit = that.autofit_point.x.find(item => Math.abs(value - item) <= fitrange);
                        if (!isNaN(fit)) {
                            xfit_arr.push({
                                key: key,
                                value: fit,
                                diff: Math.abs(value - fit),
                            });
                        }
                    }
                    // 筛选契合度最高的坐标
                    if (xfit_arr.length) {
                        let xfit_min = Math.min.apply(null, xfit_arr.map(item => item.diff));
                        let xfit_min_obj = xfit_arr.find(item => item.diff === xfit_min);
                        let fit = xfit_min_obj.value;
                        // 匹配 左 中 右 对齐点
                        switch (xfit_min_obj.key) {
                            case 'left':
                                point.x = fit - x_diff;
                                break;
                            case 'center':
                                point.x = fit - rect.w / 2;
                                break;
                            case 'right':
                                point.x = fit - rect.w + x_diff;
                                break;
                        }
                        reference_line_x.push(fit * page_scale);
                    }
                    // y轴方向自动贴合检索
                    let yfit_arr = [];
                    for (let key in element_fit_y) {
                        let value = element_fit_y[key];
                        let fit = that.autofit_point.y.find(item => Math.abs(value - item) <= fitrange);
                        if (!isNaN(fit)) {
                            yfit_arr.push({
                                key: key,
                                value: fit,
                                diff: Math.abs(value - fit),
                            });
                        }
                    }
                    // 筛选契合度最高的坐标
                    if (yfit_arr.length) {
                        let yfit_min = Math.min.apply(null, yfit_arr.map(item => item.diff));
                        let yfit_min_obj = yfit_arr.find(item => item.diff === yfit_min);
                        let fit = yfit_min_obj.value;
                        // 匹配 左 中 右 对齐点
                        switch (yfit_min_obj.key) {
                            case 'top':
                                point.y = fit - y_diff;
                                break;
                            case 'center':
                                point.y = fit - rect.h / 2;
                                break;
                            case 'bottom':
                                point.y = fit - rect.h + y_diff;
                                break;
                        }
                        reference_line_y.push(fit * page_scale);
                    }
                    // 更新参考线
                    that.update_reference_line(reference_line_x, reference_line_y);
                    // 检测到贴合点
                    if (slow && (xfit_arr.length || yfit_arr.length)) {
                        // 自动贴合
                        if (get_element.type === 'group') {
                            // 组合元素由于坐标计算问题，拖动起来有些抖动，暂无法处理
                            get_element.element.each((i, ele) => {
                                option.set_translate($(ele), group_ele_offset.x[i] + point.x, group_ele_offset.y[i] + point.y);
                            });
                        } else {
                            option.set_translate(get_element.element, point.x, point.y);
                        }
                    } else {
                        // 元素正常移动
                        get_element.element.each((i, ele) => {
                            let $ele = $(ele);
                            let p = option.get_transform($ele, 'translate');
                            let x = p[0] + (diff_x / page_scale);
                            let y = p[1] + (diff_y / page_scale);
                            option.set_translate($ele, x, y);
                        });
                    }
                    /**
                     * 元素移动 && 自动贴合 && 参考线 处理 end
                     */
                    // 更新左侧栏数据
                    that.element_message.x = Math.floor(point.x);
                    that.element_message.y = Math.floor(point.y);
                    // 更新虚线框定位
                    operate_opt.reset_rect(get_element.element);
                },
                before_up: function (event) {
                    // 判断是否为多选元素单选情况
                    if ($(event.target).hasClass('child') && !operate_opt.dragged && operate_opt.can_check_child) {
                        let option = opt_factory.init_opt('group');
                        let get_element = option.get_checked_element();
                        let $checked = get_element.element;
                        if (!$checked.length) {
                            return;
                        }
                        let $child = $(event.target);
                        let $operate = $('.operate');
                        let ele_id = $child.attr('data-id');
                        let ele_group = $child.attr('data-group');
                        // 判断当前为 组合元素 - 单选
                        if (that.element_message.is_group && !ele_group) {
                            let $ele = option.get_element(ele_id);
                            let ele_type = $ele.attr('data-type');
                            // 生成组合单选大虚线框
                            operate_opt.set_group_operate($checked);
                            // 保留组合选中状态
                            that.select_group_child = true;
                            // 更新选中状态
                            $checked.removeClass('checked');
                            $ele.addClass('checked');
                            // 更新虚线框 class
                            $operate.attr('class', `operate select_${ele_type}`);
                            // 更新虚线框
                            operate_opt.reset_rect($ele);
                            // 选中元素
                            that.set_ele_checked($ele);
                        } else {
                            // 判断当前为 临时多选 - 单选
                            let $ele = option.get_group_element(option.get_element(ele_id));
                            $checked.removeClass('checked');
                            $ele.addClass('checked');
                            // 选中元素
                            that.set_ele_checked($ele);
                        }
                        operate.can_drag = false;
                    }
                },
                up: function (data) {
                    let option = opt_factory.init_opt('group');
                    let get_element = option.get_checked_element();
                    let $ele = get_element.element;
                    if (!$ele.length) {
                        return;
                    }
                    $('.operate_path_point .path_point.radius').show();
                    // 结束移动更新组合单选虚线框
                    if (that.select_group_child && $ele.length === 1 && get_element.group) {
                        let $group = get_element.group;
                        operate_opt.set_group_operate($group);
                    }
                    // 结束移动更新临时组合子虚线框
                    operate_opt.build_group_child($ele);
                    // 移除参考线
                    that.update_reference_line();
                    // 隐藏网格线
                    that.toggle_grid_display();
                    // 更新音频控件位置
                    opt_factory.init_opt('audio').audio_control_position($ele);
                    // 结束移动显示动画元素标记
                    that.animation_mark_hide(false);
                }
            });
            // 元素旋转事件绑定
            operate_opt.bind_rotate_event({
                handle: '.operate .rotate',
                before_down: function (event) {
                },
                down: function (data) {
                    let $checked = $('.page_contain .ele_item.checked'),
                        operate = operate_opt.get_inside_rect(),
                        option = opt_factory.init_opt('group');
                    if ($checked.length > 1 && operate.rotate === 0) {
                        $checked.each(function () {
                            let rotate = option.get_transform($(this), 'rotate');
                            $(this).attr('data-old_rotate', rotate[0]);
                        });
                    }
                },
                before_move: function (event) {
                    // 音频控件隐藏
                    opt_factory.init_opt('audio').audio_control_hide();
                    // 显示网格线
                    that.toggle_grid_display(true);
                    // 隐藏快捷操作栏
                    $('.convformat_contain').hide();
                },
                move: function (data) {
                    let $checked = $('.page_contain .ele_item.checked'),
                        $show_degree = $(".show_degree"),
                        option = opt_factory.init_opt('group');
                    if ($checked.length === 1) {
                        option.set_rotate($checked, data.rotate);
                    }
                    else if ($checked.length > 1) {
                        // 获取虚线框相对画布中心点
                        let operate_normal = option.window_2_page_offset(data, true).normal,
                            operate_middle = {};
                        operate_middle.x = operate_normal.x + Number(operate_normal.w / 2);
                        operate_middle.y = operate_normal.y + Number(operate_normal.h / 2);
                        $checked.each(function () {
                            let $ele = $(this),
                                ele_msg = option.compute_ele_offset($ele),
                                old_rotate = Number($ele.attr('data-old_rotate')),
                                ele_middle = {
                                    x: Number(ele_msg.page.x) + Number(ele_msg.page.w / 2),
                                    y: Number(ele_msg.page.y) + Number(ele_msg.page.h / 2),
                                },
                                _degree = Number(data.rotate) + old_rotate - Number(ele_msg.page.rotate),
                                middle = option.fn.after_rotate_point(ele_middle, operate_middle, _degree),
                                x = middle.x - Number(ele_msg.page.w / 2),
                                y = middle.y - Number(ele_msg.page.h / 2),
                                deg = (old_rotate + Number(data.rotate)) % 360;
                            option.set_translate($ele, x, y);
                            option.set_rotate($ele, deg);
                        });
                    }
                    // 更新操作框旋转度数
                    $show_degree.html(data.rotate + "°").css("transform", "rotate(" + -data.rotate + "deg)").show();
                    // 更新左侧栏数据
                    that.element_message.rotate = data.rotate;
                },
                before_up: function (event) { },
                up: function (data) {
                    let option = opt_factory.init_opt('group');
                    let get_element = option.get_checked_element();
                    let $ele = get_element.element;
                    // 隐藏操作框旋转度数提示
                    $('.show_degree').hide();
                    // 更新音频控件位置
                    opt_factory.init_opt('audio').audio_control_position($ele);
                    // 隐藏网格线
                    that.toggle_grid_display();
                    // 隐藏快捷操作栏
                    $('.convformat_contain').show();
                    // 更新虚线框
                    operate_opt.reset_rect($ele);
                }
            });
            // 元素缩放事件绑定
            operate_opt.bind_resize_events({
                handle: '.operate .resize_handle',
                before_down: function (event) {
                    // 展示缩放数值
                    $('.resize_number').show();
                },
                down: function (o, n) {
                    // 缩放状态下隐藏子虚线框
                    $('.operate .child').remove();
                },
                before_move: function (event) {
                    // 移动状态下隐藏组合单选虚线框
                    $('.group_operate').hide();
                    // 隐藏音频控件
                    opt_factory.init_opt('audio').audio_control_hide();
                    // 显示网格线
                    that.toggle_grid_display(true);
                },
                move: function (o, n, handle_el) {
                    let $checked = $('.page_contain .ele_item.checked'),
                        is_bevel = $(handle_el).hasClass('tl') || $(handle_el).hasClass('tr') || $(handle_el).hasClass('br') || $(handle_el).hasClass('bl'),
                        option = opt_factory.init_opt('group'),
                        normal = option.window_2_page_offset(n, true).normal;
                    let scale_x = n.width / o.width,
                        scale_y = n.height / o.height;
                    if ($checked.length > 1) {
                        let option = opt_factory.init_opt('group'),
                            op_msg = option.window_2_page_offset(o, true).normal,
                            // 获取缩放后虚线框中心点
                            n_middle = {
                                x: normal.x + normal.w / 2,
                                y: normal.y + normal.h / 2
                            },
                            // 获取缩放前虚线框中心点
                            o_middle = {
                                x: op_msg.x + op_msg.w / 2,
                                y: op_msg.y + op_msg.h / 2
                            };
                        $checked.each(function () {
                            let $ele = $(this),
                                ele_type = $ele.attr('data-type'),
                                option = opt_factory.init_opt(ele_type);
                            // 获取元素缩放前数据
                            let ele_msg = option.compute_ele_offset($ele).page;
                            // 获取元素缩放前中心点
                            let ele_o_middle = {
                                x: ele_msg.x + ele_msg.w / 2,
                                y: ele_msg.y + ele_msg.h / 2,
                            };
                            // 计算元素缩放后宽高
                            let ele_w = ele_msg.w * scale_x;
                            let ele_h = ele_msg.h * scale_y;
                            // 计算元素缩放前中心点 X Y 轴差量
                            let middle_diff_x = ele_o_middle.x - o_middle.x;
                            let middle_diff_y = ele_o_middle.y - o_middle.y;
                            // 计算元素缩放后中心点
                            let ele_n_middle = {
                                x: n_middle.x + middle_diff_x * scale_x,
                                y: n_middle.y + middle_diff_y * scale_y,
                            };
                            // 计算元素缩放后 X Y 轴坐标
                            let ele_x = ele_n_middle.x - ele_w / 2;
                            let ele_y = ele_n_middle.y - ele_h / 2;
                            // 更新元素定位
                            option.set_translate($ele, ele_x, ele_y);
                            // 更新元素大小
                            if (ele_type === 'line') {
                                option.set_size($ele, { scale_x, scale_y });
                            } else {
                                option.set_size($ele, { w: ele_w, h: ele_h });
                            }
                            // 文本元素尺寸同步字号 对角方向缩放时
                            if (ele_type === 'text' && is_bevel) {
                                that.element_message.size = option.set_size_sync_fontsize($ele, scale_x);
                            }
                        });
                    } else {
                        let type = $checked.attr('data-type');
                        option = opt_factory.init_opt(type);
                        switch (type) {
                            case 'text':
                                let old_text_height = $checked.find('.ele_rotate').height();
                                // 如果是左右的点 && 文本不会换行
                                if (!is_bevel && $checked.find('.show_text').css('white-space') === 'nowrap') {
                                    // 文本设置为会换行
                                    $checked.find('.show_text').css({
                                        'white-space': 'normal',
                                        'word-break': 'break-word'
                                    });
                                }
                                // 设置尺寸
                                option.set_size($checked, normal);
                                // 对角方向缩放时
                                if (is_bevel) {
                                    that.element_message.size = option.set_size_sync_fontsize($checked, scale_x);
                                }
                                // 元素尺寸同步内容
                                that.element_message.h = option.set_ele_sync_content($checked);
                                break;
                            case 'shape':
                                // 设置尺寸
                                option.set_size($checked, normal);
                                // 更新 圆角值
                                if ($checked.attr('shape-editor') === 'shape_rect_round_1') {
                                    try {
                                        let points = JSON.parse($checked.find('.shape_path').attr('data-points'));
                                        that.element_message.rect_fillet_max = Math.floor(points[0].x);
                                    } catch (error) { }
                                }
                                break;
                            case 'img':
                                // 设置尺寸
                                option.set_size($checked, normal);
                                break;
                            case 'chart':
                                option.set_size($checked, normal);
                                break;
                            case 'table':
                                // 设置尺寸
                                option.set_size($checked, normal);
                                break;
                            case 'video':
                                option.set_size($checked, normal);
                                break;
                            case 'audio':
                                option.set_size($checked, normal);
                                break;
                        }
                        // 设置坐标
                        option.set_translate($checked, normal.x, normal.y);
                    }
                    // 更新左侧栏数据
                    that.element_message.w = Math.round(normal.w);
                    that.element_message.h = Math.round(normal.h);
                    operate_opt.reset_rect($checked);
                },
                before_up: function (event) {
                    // 组合状态下缩放不实时更新文本框高度
                    let option = opt_factory.init_opt('text');
                    let get_element = option.get_checked_element();
                    if (get_element.element.length) {
                        get_element.element.each((i, ele) => {
                            if ($(ele).attr('data-type') === 'text') {
                                option.set_ele_sync_content($(ele));
                            }
                        });
                    }
                    operate_opt.reset_rect(get_element.element);
                },
                up: function (o, n) {
                    let $ele = $('.page_contain .ele_item.checked');
                    // 结束移动更新组合单选虚线框
                    if (that.select_group_child && $ele.length === 1 && $ele.attr('data-group')) {
                        let ele_group = $ele.attr('data-group'),
                            $group = $(`.page_contain .ele_item[data-group=${ele_group}]`);
                        operate_opt.set_group_operate($group);
                    }
                    // 结束移动更新临时组合子虚线框
                    operate_opt.build_group_child($ele);
                    // 更新音频控件位置
                    opt_factory.init_opt('audio').audio_control_position($ele);
                    // 隐藏网格线
                    that.toggle_grid_display();
                    // 隐藏缩放数值
                    $('.resize_number').hide();
                }
            });
            $(document).on('mousedown', '.edit_content', (e) => {
                if (['edit_body_wrapper', 'head_left'].indexOf(e.target.className) >= 0) {
                    // 清除元素选中状态
                    that.ele_cancel_checked();
                }
            });
            // 画布 && 锁定元素点击事件绑定
            $(document).on('mousedown', '.edit_body', function (e) {
                // 长时间为操作刷新页面
                if (that.show_reload_tips) return window.location.reload();
                // 右键拦截
                if (e.button !== 0) return false;
                // 清除画布状态
                that.clear_page_status();
                that.page_create_event(e);
            });
            // 画布操作标识判断
            $(document).on('mouseenter', '.page_contain .edit_page', function () {
                that.page_hover = true;
            }).on('mouseout', '.page_contain .edit_page', function (e) {
                // 处理画布内部元素触发mouseout事件
                if ($(e.relatedTarget).hasClass('page') || $(e.relatedTarget).parents().hasClass('page') || $(e.relatedTarget).parents().hasClass('edit_operation')) return that.page_hover = true;
                that.page_hover = false;
            });
            // 进入其他面板阻止滚轮判断
            $(document).on('mouseenter', '.edit_content .edit_left,.theme_modal_contain,.modal', function () {
                that.page_hover = false;
            }).on('mouseleave', '.edit_content .edit_left,.theme_modal_contai,.modal', function (e) {
                that.page_hover = true;
            });
            // 雪碧图鼠标经过事件
            $(document).on('mouseenter', '.sp_ico_hover', function () {
                let $icon = $(this).find('i').length > 0 ? $(this).find('i').eq(0) : $(this),
                    _class = $($icon)[0].classList[1];
                if ($icon.attr('data-hover')) {
                    $icon.removeClass(_class).addClass($icon.attr('data-hover')).attr('data-hover', _class);
                } else {
                    $icon.removeClass(_class).addClass(_class + '_hover');
                }
            }).on('mouseleave', '.sp_ico_hover', function () {
                let $icon = $(this).find('i').length > 0 ? $(this).find('i').eq(0) : $(this),
                    _class = $($icon)[0].classList[1],
                    reg = new RegExp("_hover", "g");
                if ($icon.attr('data-hover')) {
                    $icon.removeClass(_class).addClass($icon.attr('data-hover')).attr('data-hover', _class);
                } else {
                    $icon.removeClass(_class).addClass(_class.replace(reg, ""));
                }
            })
            // 鼠标经过超链接
            $(document).on('mouseover', '.edit_body .edit_page a', (event) => {
                if (document.querySelector('.link-panel .link-edit')) return;
                let target = $(event.target);
                let aEle;
                if (event.target.nodeName === 'A') {
                    aEle = target;
                } else {
                    aEle = target.parents('a').length ? target.parents('a') : target.children('a');
                }
                if (aEle[0] == this.current_link_dom) return;
                let linkInfo = {
                    text: aEle[0].text,
                    link: aEle.attr('href'),
                }
                this.current_link_dom = aEle[0];
                linkPanel.create({
                    target: event.target,
                    documentInfo: this.document_info,
                    pageList: this.document_page_list,
                    linkParams: linkInfo,
                    edit: (data) => {
                        this.set_ele_link(data);
                    },
                    destroy: () => {
                        this.current_link_dom = null;
                    }
                });
            }).on('mouseout', '.edit_body .edit_page a', (event) => {
                if (document.querySelector('.link-panel .link-edit')) return;
                if (!$(event.toElement).parents('.link-panel').length) {
                    this.closeLinkPanel();
                };
            });
            // 元素悬浮方法
            $(document).on('mouseover', '.editing_element_masking .item', function () {
                let $page = $('.page_contain'),
                    ele_id = $(this).attr('data-id'),
                    $ele = $page.find('.edit_page').find(`#${ele_id}`),
                    $tips = $('.element_tips'),
                    option = opt_factory.init_opt('group'),
                    ele_offset = option.compute_ele_seat($ele).window_scaled;
                $tips.css({
                    'left': ele_offset.x,
                    'background': $(this).attr('data-color'),
                    'borderColor': $(this).attr('data-color')
                }).find('span').text($(this).attr('data-nickName'));
                if ((ele_offset.y - 38) < 0) $tips.css({ 'top': (ele_offset.y + ele_offset.h + 10) }).removeClass('top').addClass('bottom');
                else $tips.css({ 'top': (ele_offset.y - 38) }).removeClass('bottom').addClass('top');
                $tips.show();
            }).on('mousedown', '.editing_element_masking .item', function (e) {
                let $target = $(e.target);
                // 取消元素选中
                that.ele_cancel_checked();
                // 遮罩选中
                $target.addClass('checked');
                // 获取右侧评论列表
                that.$refs.editHead.get_right_comment();
            }).on('mouseout', '.editing_element_masking .item', function () {
                $('.element_tips').hide();
            });
            // 双击元素 -> 双击事件被画布 mousedown 事件阻断，自定义双击事件
            $(document).on('click', '.page_contain .edit_page .ele_item', that.dblclick_listener);
            $(document).on('mouseover', '.page_contain .edit_page .ele_item.checked[shape-editor], .operate_path_point', function(e) {
                $('.operate_path_point .path_point.radius').show();
            }).on('mouseout', function() {
                $('.operate_path_point .path_point.radius').hide();
            })
            // 虚拟 operate 点击恢复组合元素选中
            $(document).on('click', '.group_operate', function () {
                if (that.select_group_child) {
                    let $ele = $('.page_contain .ele_item.checked'),
                        ele_group = $ele.attr('data-group'),
                        $group = $(`.page_contain .ele_item[data-group=${ele_group}]`),
                        $operate = $("#operate");
                    // 退出裁剪
                    if ($operate.hasClass("clip_image")) {
                        let image_opt = opt_factory.init_opt('img');
                        image_opt.clip.sure();
                        that.$refs.FormatPanel.begin_clip = false;
                        that.element_message.not_w = false;
                        that.element_message.not_h = false;
                        that.element_message.not_x = false;
                        that.element_message.not_y = false;
                        that.element_message.not_rotate = false;
                        if (utils.deviceENV().firefox) {
                            document.removeEventListener("DOMMouseScroll", that.mousewheel_listener);
                            document.addEventListener("DOMMouseScroll", that.mousewheel_listener);
                        } else {
                            window.onmousewheel = document.onmousewheel = that.mousewheel_listener;
                        }
                    }
                    // 取消选中
                    that.ele_cancel_checked();
                    // 选中元素
                    that.set_ele_checked($group);
                    // 更新组合单选状态
                    that.select_group_child = false;
                }
            });

            // 富文本元素鼠标按下处理
            $(document).on('mousedown', '#page_contain .ele_item .show_text[contenteditable="true"]', function (e) {
                let $ele = $(e.currentTarget).parents('.ele_item');
                let type = $ele.attr('data-type');
                switch (type) {
                    // 形状内文本单击禁止进入编辑
                    case 'shape':
                        if (!$(':focus').length) {
                            e.preventDefault();
                        }
                        break;
                    // 组合未选中时内部文本元素禁止进入编辑
                    case 'text':
                        let is_ctrl = e.ctrlKey || (e.metaKey && utils.deviceENV().mac);
                        let is_group = $ele.attr('data-group') && ($('.group_child').find('.child').length === 0 && !$ele.hasClass('checked'));
                        if (is_ctrl || is_group) {
                            e.preventDefault();
                        }
                        break;
                }
                $(document).on('mouseup', function (e) {
                    $(document).unbind('mouseup');
                    // 应用格式刷
                    if (that.had_format_painter) {
                        let option = opt_factory.init_opt(type);
                        let $text = $ele.find('.show_text');
                        // 艺术字的格式只能直接修改整个文本框的格式 不支持选区应用
                        if(that.formatPainterIsArt) {
                            (!$text.hasClass('art')) && $text.addClass('art');
                            editor_opt.set_format_painter($ele, that.format_painter_style);
                            that.element_message = option.get_edit_message($ele);
                        } else {
                            let sel = window.getSelection();
                            let is_selection = !!(sel && sel.type === 'Range' && !sel.isCollapsed && $(sel.anchorNode).parents('.ele_item').length);
                            // 选区部分应用格式刷 且 非艺术字
                            if (is_selection && !$text.hasClass('art')) {
                                let $wrap = editor_opt.editor_buildwrap();
                                editor_opt.set_format_painter($wrap, that.format_painter_style);
                            } else {
                                editor_opt.set_format_painter($ele, that.format_painter_style);
                            }
                        }
                        that.element_message.text_preset_key = 'none';
                        if (!that.stay_format_painter) {
                            that.had_format_painter = false;
                            that.format_painter_style = null;
                        }
                        // 元素尺寸同步内容
                        if (type === 'text') that.element_message.h = option.set_ele_sync_content($ele);
                        if (type === 'table') option.table_edit_listener($ele);
                        // 更新虚线框尺寸
                        operate_opt.reset_rect($ele);
                    }
                });
            });

            // 富文本元素点击按键事件更新 element_type ，a标签链接处理
            $(document).on('click', '#page_contain .ele_item .show_text', function (e) {
                let $target = $(e.target);
                let $ele = $(e.currentTarget).parents('.ele_item');
                let type = $ele.attr('data-type');
                let nodename = e.target.nodeName;
                // 清除虚拟选区
                editor_opt.recover_text_selection($target);
                // element_type 更新
                let option = opt_factory.init_opt('group');
                if (nodename === 'DIV' && $target.find('span').length) {
                    let sel = window.getSelection();
                    // 在判断focusNode.nodeName时，像这种情况下一定要判断在判断focusNode这个对象下是否是null或undefined 否则抛异常
                    if (sel.focusNode && sel.focusNode.nodeName !== 'DIV') {
                        $target = $(sel.focusNode.parentNode);
                    } else {
                        // 点击文本空白处的情况下，因无法判断具体点击节点，默认最后一个节点样式
                        $target = $target.find('span:last-child');
                    }
                }
                let text_scale = 0.5;
                if (type === 'text') {
                    text_scale = +option.get_transform($ele, 'scale')[0];
                }
                // 获取节点渲染样式
                let computed_style = window.getComputedStyle($target[0]);
                // 回显文本字号
                let font_size = option.fn.unit_2_px(computed_style.fontSize);
                that.element_message.size = Math.floor((font_size - font_size % 2) * text_scale);
                // 回显文本颜色
                that.element_message.color = option.fn.color_exchange_function('rgb', computed_style.color);
                // 回显文本对齐
                that.element_message.text_align = computed_style.textAlign;
                // 回显文本斜体
                that.element_message.font_style = computed_style.fontStyle;
                // 回显文本字体
                let get_font_family = font_family_array.search_exact($target.css('fontFamily'));
                that.element_message.font_family = get_font_family ? get_font_family.name : '微软雅黑';
                // 回显文本粗体
                that.element_message.font_weight = +computed_style.fontWeight === 400 ? 'normal' : 'bold';
                // 回显文本间距
                that.element_message.letter_spacing = computed_style.letterSpacing === 'normal' ? 0 : option.fn.unit_2_px(computed_style.letterSpacing);
                // 回显文本投影
                that.element_message.text_shadow = computed_style.textShadow !== 'none' ? 'shdow' : 'none';
                // 回显文本下划线
                that.element_message.text_underline = computed_style.textDecoration.indexOf('underline') < 0 ? 'none' : 'underline';
                // 回显文本中划线
                that.element_message.text_linethrough = computed_style.textDecoration.indexOf('line-through') < 0 ? 'none' : 'linethrough';
                // 回显文本有序无序列表
                let ol = 'none',
                    ul = 'none';
                if ($target.parents('ol').length > 0) {
                    ol = $target.parents('ol').attr('class') || $target.parents('ol').css('listStyleType');
                } else if ($target[0].tagName === 'OL') {
                    ol = $target.attr('class') || $target.css('listStyleType');
                }
                if ($target.parents('ul').length > 0) {
                    ul = $target.parents('ul').attr('class') || $target.parents('ul').css('listStyleType');
                } else if ($target[0].tagName === 'UL') {
                    ul = $target.attr('class') || $target.css('listStyleType');
                }
                that.element_message.ol = ol;
                that.element_message.ul = ul;
            });

            // 表格元素 - 单元格事件绑定(多个单元格框选 || 单元格进入编辑)
            $(document).on('mousedown', '.page_contain .edit_page .ele_item[data-type="table"] td', function (e) {
                // 画布绘制拦截
                if (that.page_state !== 'common') return;
                let $ele = $(e.target).parents('.ele_item'),
                    $edit = $(this),
                    move_x = 0,
                    move_y = 0,
                    down_x = e.clientX,
                    down_y = e.clientY,
                    $tr = $ele.find('tr'),
                    $td = $ele.find('td'),
                    start_row = Number($edit.attr('data-row')),             //初始单元格
                    start_column = Number($edit.attr('data-column')),
                    option = opt_factory.init_opt('table');
                // 锁定拦截
                if ($ele.hasClass('lock')) {
                    return;
                }
                // 右键不清除单元格选中
                if (e.button === 2) {
                    return;
                }
                // 清除单元格所有状态
                $('.cel_selected').removeClass('cel_selected');
                $('.cel_edit').removeClass('cel_edit');
                // 单元格编辑标识
                $edit.addClass('cel_edit');
                // 单元格拖拽框选
                $(document).on('mousemove', function (e) {
                    move_x = e.clientX - down_x;
                    move_y = e.clientY - down_y;
                    $td.on('mouseover', function (e) {
                        let $this = $(this);
                        // 结束值
                        let end_row = Number($this.attr('data-row'));
                        let end_column = Number($this.attr('data-column'));
                        // 若结束单元格存在合并，要加上合并数量
                        if ($this.hasClass('standard_merge')) {
                            let $rowspan = Number($this.attr('rowspan'));
                            let $colspan = Number($this.attr('colspan'));
                            end_row = end_row + Number($this.attr('rowspan')) - 1;
                            end_column = end_column + Number($this.attr('colspan')) - 1;
                        }
                        // 差值
                        let diff_row = Math.abs(end_row - start_row);
                        let diff_column = Math.abs(end_column - start_column);
                        // 最小值
                        let min_row = start_row < end_row ? start_row : end_row;
                        let min_column = start_column < end_column ? start_column : end_column;
                        $tr.each(function (row) {
                            let $th = $(this);
                            $th.find('td').each(function (column) {
                                let $cur_td = $(this);
                                if (row >= min_row && row <= diff_row + min_row && column >= min_column && column <= diff_column + min_column) {
                                    $(this).addClass('cel_selected');
                                    option.get_merge_cel($(this), $ele, function ($merge) {
                                        $merge.addClass('cel_selected');
                                    });
                                } else {
                                    if (!$(this).hasClass('merge_hide')) {
                                        $(this).removeClass('cel_selected');
                                    }
                                    option.get_merge_cel($(this), $ele, function ($merge) {
                                        $merge.removeClass('cel_selected');
                                    });
                                }
                            });
                        });
                    });
                    let merge_arr = [];
                    $ele.find('.cel_selected').each(function () {
                        merge_arr.push($(this).attr('data-merge'));
                    })
                    let new_merge_arr = Array.from(new Set(merge_arr));
                    if ($ele.find('.cel_selected').length > 1 && (new_merge_arr.length !== 1 || new_merge_arr[0] == undefined || new_merge_arr[0] == '')) {
                        // 单元格失焦
                        $('.show_text').blur();
                        // 清空文字选区
                        window.getSelection().removeAllRanges();
                    } else {
                        // 一个单元格不做框选状态
                        $edit.removeClass('cel_selected');
                    }
                });
                $(document).on('mouseup', function () {
                    if ($ele.find('.cel_selected').length > 1) {
                        $('.cel_edit').removeClass('cel_edit');
                    } else {
                        $edit.find('.show_text').focus();
                        // 防止点击单元格选中表格时，会清除单元格编辑标识
                        if (!$edit.hasClass('cel_edit')) $edit.addClass('cel_edit');
                    }
                    // 合并单元格判断
                    option.get_merge_cel($edit, $ele, function ($merge) {
                        $merge.addClass('cel_edit');
                    });
                    if ($ele.length !== 0) that.element_message = opt_factory.init_opt('table').select($ele);
                    let $edit_cel = option.get_edit_cel($ele);
                    let merge_cel = 0;
                    $edit_cel.each((i, item) => {
                        option.get_merge_cel($(item), $ele, () => {
                            merge_cel++;
                        });
                    });
                    // 判断是否可以合并或拆分
                    switch (true) {
                        // 选中单个单元格  -->  不可合并，不可拆分
                        case $edit_cel.length === 1:
                            that.element_message.cel_option = false;
                            break;
                        // 所选单元格不存在合并单元格  -->  可合并，不可拆分
                        case merge_cel === 0:
                            that.element_message.cel_option = 'merge_cel';
                            break;
                        // 所选单元格已全部合并  -->  不可合并，可拆分
                        case merge_cel + 1 === $edit_cel.length:
                            that.element_message.cel_option = 'split_cel';
                            break;
                        default:
                            that.element_message.cel_option = 'merge_cel';
                            break;
                    }
                    if ($('.cel_edit').hasClass('standard_merge')) that.element_message.cel_option = 'split_cel';
                    // 获取左侧栏数据
                    $td.unbind('mouseover');
                    $(document).unbind('mousemove');
                    $(document).unbind('mouseup');
                });
            });
            // 表格元素 - 行列边框拖动事件绑定
            $(document).on('mousedown', '.page_contain .edit_page .ele_item[data-type="table"] .table_resizer', function (e) {
                let $checked_border = $(this);
                let $ele = $('.page_contain .ele_item.checked');
                let $td = $ele.find('td');
                let $tr = $ele.find('tr');
                let $scale = $ele.find('.ele_scale');
                let option = opt_factory.init_opt('table');
                let row_index = $checked_border.attr('data-row');
                let column_index = $checked_border.attr('data-column');
                let border_type = $checked_border.hasClass('table_column_resizer') ? 'column' : 'row';
                let begin_offset = border_type === 'column' ? e.clientX : e.clientY;
                let begin_left = Number($checked_border.css('left').slice(0, -2));
                let begin_top = Number($checked_border.css('top').slice(0, -2));
                let new_offset = begin_offset;
                let total_offset = 0;
                // 编辑失焦 & 状态清除
                $('.cel_edit').removeClass('cel_edit');
                $('.cel_selected').removeClass('cel_selected');
                $('.show_text').blur();
                $ele.find('.table_resizer').addClass('resizing');
                $checked_border.addClass('checked');
                // 开始拖动
                $(document).on('mousemove', function (e) {
                    let can_change = true;
                    e.preventDefault();
                    // 列边框拖动
                    if (border_type === 'column') {
                        $ele.addClass('col_resizing');
                        let move_x = e.clientX - new_offset;
                        let offset = move_x / (that.page_scale.user_set * 0.5);
                        total_offset = (e.clientX - begin_offset) / (that.page_scale.user_set * 0.5);
                        new_offset = e.clientX;
                        switch (column_index) {
                            case 'left':
                                $td.each(function () {
                                    if (Number($(this).attr('data-column')) === 0) {
                                        if ($(this)[0].clientWidth - total_offset < 40) {
                                            can_change = false;
                                        }
                                    }
                                });
                                break;
                            case 'right':
                                $td.each(function () {
                                    if ($(this).attr('data-column') === $ele.find('td:last-child').attr('data-column')) {
                                        if ($(this)[0].offsetWidth + total_offset < 40) {
                                            can_change = false;
                                        }
                                    }
                                });
                                break;
                            default:
                                $td.each(function () {
                                    if ((Number($(this).attr('data-column')) === Number(column_index)) && !$(this).hasClass('merge_hide')) {
                                        if ($(this)[0].offsetWidth + total_offset < 40) {
                                            can_change = false;
                                        }
                                    };
                                    if ((Number($(this).attr('data-column')) === Number(column_index) + 1) && !$(this).hasClass('merge_hide')) {
                                        if ($(this)[0].offsetWidth - total_offset < 40) {
                                            can_change = false;
                                        }
                                    };
                                });
                                break;
                        }
                        if (can_change) {
                            $checked_border.css({
                                'left': Number($checked_border.css('left').slice(0, -2)) + offset + 'px'
                            })
                        };
                    }
                    // 行边框拖动
                    else {
                        $ele.addClass('row_resizing');
                        let move_y = e.clientY - new_offset;
                        let offset = move_y / (that.page_scale.user_set * 0.5);
                        total_offset = (e.clientY - begin_offset) * 2 / that.page_scale.user_set;
                        new_offset = e.clientY;
                        switch (row_index) {
                            case 'top':
                                $tr.each(function () {
                                    if (Number($(this).attr('data-row')) === 0) {
                                        if ($(this)[0].clientHeight - total_offset < $(this).find('.show_text')[0].clientHeight + 10) {
                                            can_change = false;
                                        }
                                    }
                                });
                                break;
                            case 'bottom':
                                $tr.each(function () {
                                    if ($(this).attr('data-row') === $ele.find('tr:last-child').attr('data-row')) {
                                        if ($(this)[0].clientHeight + total_offset < $(this).find('.show_text')[0].clientHeight + 10) {
                                            can_change = false;
                                        }
                                    }
                                });
                                break;
                            default:
                                $tr.each(function () {
                                    if ($(this).attr('data-row') === row_index) {
                                        if ($(this)[0].clientHeight + total_offset < $(this).find('.show_text')[0].clientHeight + 10) {
                                            can_change = false;
                                        }
                                    }
                                });
                                break;
                        }
                        if (can_change) {
                            $checked_border.css({
                                'top': Number($checked_border.css('top').slice(0, -2)) + offset + 'px'
                            })
                        };
                    };
                });
                $(document).on('mouseup', function () {
                    $(document).unbind('mousemove');
                    $(document).unbind('mouseup');
                    $ele.removeClass('col_resizing row_resizing');
                    $ele.find('.table_resizer').removeClass('resizing checked');
                    if (row_index) {
                        total_offset = Number($checked_border.css('top').slice(0, -2)) - begin_top;
                    } else {
                        total_offset = Number($checked_border.css('left').slice(0, -2)) - begin_left;
                    }
                    // 列边框拖动
                    if (border_type === 'column') {
                        switch (column_index) {
                            case 'left':
                                $td.each(function () {
                                    if (Number($(this).attr('data-column')) === 0) {
                                        $(this).attr('width', Number($(this).attr('width')) - total_offset);
                                    }
                                });
                                $scale.css('width', $scale.width() - total_offset);
                                $ele.find('.ele_rotate').css('width', $scale.width() / 2);
                                $ele.css('left', Number($ele.css('left').slice(0, -2)) + total_offset / 2 + 'px');
                                break;
                            case 'right':
                                $td.each(function () {
                                    if ($(this).attr('data-column') === $ele.find('td:last-child').attr('data-column')) {
                                        $(this).attr('width', Number($(this).attr('width')) + total_offset);
                                    }
                                });
                                $scale.css('width', $scale.width() + total_offset);
                                $ele.find('.ele_rotate').css('width', $scale.width() / 2);
                                break;
                            default:
                                $td.each(function () {
                                    if (Number($(this).attr('data-column')) === Number(column_index)) {
                                        $(this).attr('width', Number($(this).attr('width')) + total_offset);
                                    }
                                    if (Number($(this).attr('data-column')) === Number(column_index) + 1) {
                                        $(this).attr('width', Number($(this).attr('width')) - total_offset);
                                    }
                                });
                                break;
                        }
                    }
                    // 行边框拖动
                    else {
                        switch (row_index) {
                            case 'top':
                                $tr.each(function () {
                                    if ($(this).attr('data-row') == 0) {
                                        $(this).attr('height', Number($(this).attr('height')) - total_offset);
                                    }
                                });
                                $ele.css('top', Number($ele.css('top').slice(0, -2)) + total_offset / 2 + 'px');
                                break;
                            case 'bottom':
                                $tr.each(function () {
                                    if ($(this).attr('data-row') === $ele.find('tr:last-child').attr('data-row')) {
                                        $(this).attr('height', Number($(this).attr('height')) + total_offset);
                                    }
                                });
                                break;
                            default:
                                $tr.each(function () {
                                    if ($(this).attr('data-row') === row_index) {
                                        $(this).attr('height', Number($(this).attr('height')) + total_offset);
                                    }
                                });
                                break;
                        }
                        $scale.css('height', $scale.height() + total_offset);
                        $ele.find('.ele_rotate').css('height', $scale.height() / 2);
                    };
                    // 相关数据同步
                    option.table_edit_listener($ele);
                });
            });
            // 视频元素 - 点击播放按钮
            $(document).on('click', '.page_contain .edit_page .ele_item .video_play', e => {
                if (e.altKey || e.ctrlKey || e.shiftKey) {
                    return;
                }
                let $ele = $(e.target).parents('.ele_item');
                let $video = $ele.find('.video_player');
                $video[0].currentTime = (this.media_play_memory && this.media_play_memory[$ele.attr('id')]) || 0;
                $video.attr('src', $video.attr('data-src')).show();
                $ele.find('.video_play').hide();
            });
        },
        // 更新登录状态
        update_login_state: function () {
            let that = this;
            let timer = setInterval(() => {
                that.user = Object.assign(that.user, that.$common.get_login_state());
                if (that.user.login) {
                    // 刷新会员权限map
                    member_rankauthorities.initialize();
                    clearInterval(timer);
                }
            }, 1000);
        },
        // 登录事件
        login: function () {
            this.$refs.loginModal.open({ type: 'account' });
        },
        // 登录成功后更新用户信息
        login_success: function () {
            this.update_login_state();
        },
        // 提交报错反馈到阿里云日志
        submit_error_to_aliyun: function(work_order_id) {
            try {
                let that = this;
                let log = {
                    work_order_id: JSON.stringify(work_order_id),
                    member: JSON.stringify(that.user.id),
                    current_document_page: JSON.stringify({ document_info: that.document_info, page_info: that.page_info }),
                    current_document_opt_history: JSON.stringify(utils.deepClone(document_save.info.command_redo_history).reverse().slice(0, 10)),
                    console_error_msg: JSON.stringify(that.$error.get())
                };
                aliyun_log.push(log);
                if (typeof work_order_id === "undefined") {
                    that.$toast("报错信息提交成功", 2000);
                }
            } catch (e) {
                console.error(e);
            }
        },
    },
    destroyed() {
        for(let key in document){
            let index = key.indexOf('on');
            if(index === 0){
                document[key] = null;
            }
        }
        document.removeEventListener('copy', this.ele_copy);
        document.removeEventListener('cut', this.ele_cut);
        document.removeEventListener("paste", this.paste_listener);
        $(document).unbind();
    }
}
</script>