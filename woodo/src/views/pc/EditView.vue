<!--html模板-->
<template xmlns:v-clipboard="http://www.w3.org/1999/xhtml">
    <div class="edit_content" @mouseover="init_reload_interval" :class="edit_mode">
        <!-- 加载动画弹框 -->
        <loading_masking ref="loading_masking" v-show="!document_loaddone"></loading_masking>
        <!-- 导出指引 -->
        <div class="export_guide" v-if="show_export_guide" @click="close_export_guide">
            <img src="../../assets/pc/images/edit/export_guide.png" />
        </div>
        <!-- 编辑器 || 自定义版式 头部 -->
        <div class="edit_head">
            <div class="head_left">
                <template v-if="edit_mode !== 'custom'">
                    <div class="head-logo" @click="right_menu_show = !right_menu_show">
                        <base-icon :class="['icongengduo', {current: right_menu_show}]"></base-icon>
                        <transition name='modal-fade'>
                            <div class="menu-list" v-if="right_menu_show">
                                <ul>
                                    <router-link tag="li" class="" to="/home/" v-bdtongji="'编辑器-功能区-功能选项-顶部-返回文档中心'">
                                        <base-icon class="iconwodechuangzuo"></base-icon>
                                        <span>返回工作台</span>
                                    </router-link>
                                </ul>
                                <ul>
                                    <li @click="open_import_doc">
                                        <base-icon class="icondaoru"></base-icon>
                                        <span>导入</span>
                                    </li>
                                    <li @click="open_theme_modal">
                                        <base-icon class="iconshezhi1"></base-icon>
                                        <span>设置</span>
                                    </li>
                                    <li class="view" @click.stop="change_view_option('view')">
                                        <base-icon class="iconshitu"></base-icon>
                                        <span>视图</span>
                                        <transition name='modal-fade'>
                                            <div class="view-panel" v-if="current_view_option === 'view'" @click.stop>
                                                <ul class="view-setting-list">
                                                    <li :class="{'check': show_right_comment}" @click.stop="set_comment">
                                                        显示评论
                                                    </li>
                                                    <li :class="{'check': full_screen_edit}" @click.stop="set_full_screen_edit">
                                                        全屏编辑
                                                    </li>
                                                </ul>
                                                <!-- 网格设置 -->
                                                <ul class="grid_setting_list">
                                                    <li class="grid_control">网格设置：
                                                        <span class="control_btn" @click="set_grid_model(grid_using ? false : 'middle')" :class="{'close': !grid_using}">
                                                            <i></i>
                                                        </span>
                                                    </li>
                                                    <template v-if="grid_using">
                                                        <li :class="{'check': grid_using === 'small'}" @click="set_grid_model('small')">小号</li>
                                                        <li :class="{'check': grid_using === 'middle'}" @click="set_grid_model('middle')">中号</li>
                                                        <li :class="{'check': grid_using === 'large'}" @click="set_grid_model('large')">大号</li>
                                                    </template>
                                                </ul>
                                            </div>
                                        </transition>
                                    </li>
                                </ul>
                                <ul>
                                    <li>
                                        <span>文档ID：{{document_info.id}}</span>
                                    </li>
                                    <li @click="save_copy_doc">
                                        <span>生成副本</span>
                                    </li>
                                    <li v-if="is_designer" @click="!check_option_disable(page_authority.save_template, document_option_authority) && toggle_save_template()">
                                        <span>发布作品</span>
                                    </li>
                                    <li @click="!user_disable_edit && toggle_action_history()">
                                        <span>查看操作记录</span>
                                    </li>
                                    <li class="help">
                                        <span>帮助中心</span>
                                        <base-icon class="iconxiala"></base-icon>
                                        <ul>
                                            <li @click="show_error_feedback">
                                                <base-icon class="iconwentijianyi"></base-icon>
                                                <span>问题或建议</span>
                                            </li>
                                            <li @click="toggle_keyboards_shortcuts(true)">
                                                <base-icon class="iconjianpan"></base-icon>
                                                <span>键盘快捷键</span>
                                            </li>
                                        </ul>
                                    </li>
                                </ul>
                                <ul>
                                    <li class="recycle" v-if="!check_option_disable(page_authority.delete, document_option_authority)" @click="delete_doc_modal" v-bdtongji="'编辑器-功能区-功能选项-顶部-选项-删除'">
                                        <base-icon class="iconhuishouzhan"></base-icon>
                                        <span>移入回收站</span>
                                    </li>
                                    <li v-if="check_option_disable(page_authority.delete, document_option_authority)" @click="quit_cooperation">
                                        <base-icon class="icontuichuxiezuo"></base-icon>
                                        <span>退出协作</span>
                                    </li>
                                </ul>
                            </div>
                        </transition>
                    </div>
                    <input type="text" id="doc_name" class="doc_name" maxlength="40" placeholder="未命名的文档" v-tooltip="`重命名`" :style="{'max-width': title_width + 'px'}" :value="document_info_title" :class="{disable:check_option_disable(page_authority.rename, document_option_authority)}" :disabled="check_option_disable(page_authority.rename, document_option_authority)" @input="input_title($event,false)" @focus="focus_title()" @keyup.enter="blur_title" @blur="set_title(false)" v-bdtongji="'编辑器-功能区-功能选项-顶部-文档名称'">
                    <div class="doc-down" @click="change_view_option('file')">
                        <base-icon class="iconxialaxuanxiangtianchong"></base-icon>
                        <!--文件弹框-->
                        <transition name='modal-fade'>
                            <div class="file-panel" v-if="current_view_option === 'file'" @click.stop>
                                <template v-if="pre_folder_list.length === 0">
                                    <div class="my-desktop">
                                        <span>桌面</span>
                                    </div>
                                    <div class="doc-empty" v-if="doc_empty">
                                        暂无可用文档
                                    </div>
                                    <ul class="doc-list" v-else>
                                        <li v-for='(item, index) in document_list' :class="{'folder': item.grade, current: item.id == document_info.id}" :key="index" @click="item.grade ? enter_next_folder({fId: item.id}, item) : edit_view(item)">
                                            <base-icon class="iconwenjianjia" v-if="item.grade"></base-icon>
                                            <span>{{item.name}}</span>
                                            <base-icon class="iconxiala grade" v-if="item.grade"></base-icon>
                                            <base-icon class="iconxuanzhong" v-if="item.id == document_info.id"></base-icon>
                                        </li>
                                    </ul>
                                    <!-- 最近使用 -->
                                    <template v-if="recently_used_folder_list.length > 0">
                                        <div class="my-lately">
                                            <span>最近使用</span>
                                        </div>
                                        <ul class="lately-list">
                                            <li v-for='(item,index) in recently_used_folder_list' :class="{'design': item.documentType === 'design'}" :key="index" @click="edit_view(item)">
                                                <span>{{item.name}}</span>
                                            </li>
                                        </ul>
                                    </template>
                                </template>
                                <template v-else>
                                    <div class="pre-folder" @click="back_pre_folder">
                                        <base-icon class="iconjiantou"></base-icon>
                                        <span>{{(current_folder_info && current_folder_info.name) ? current_folder_info.name : ''}}</span>
                                    </div>
                                    <div class="doc-empty" v-if="doc_empty">
                                        暂无可用文档
                                    </div>
                                    <ul class="doc-list" v-else>
                                        <li v-for='(item, index) in document_list' :class="{'folder': item.grade}" :style="{'paddingLeft': item.level * 21 + 14 + 'px'}" :key="index" @click="item.grade ? enter_next_folder({fId: item.id}, item) : edit_view(item)">
                                            <base-icon class="iconwenjianjia" v-if="item.grade"></base-icon>
                                            <span>{{item.name}}</span>
                                            <base-icon class="iconxiala grade" v-if="item.grade"></base-icon>
                                        </li>
                                    </ul>
                                </template>
                            </div>
                        </transition>
                    </div>
                    <div class="head_time">
                        <p class="update_time" :class="{'wait_icon':document_info.modifyDate === '正在保存...'}" @click="!user_disable_edit && toggle_action_history()">
                            <base-icon class="iconshijian" v-show="document_info.modifyDate.indexOf('最近保存') !== -1"></base-icon>
                            <base-icon class="iconxuanzhong" v-show="document_info.modifyDate.indexOf('已自动保存到云端') !== -1"></base-icon>
                            <span v-html="document_info.modifyDate"></span>
                        </p>
                        <div class="undo_icon" v-tooltip="`撤销（Ctrl+Z）`" :class="{disabled:cannot_undo || user_disable_edit}" @click="!user_disable_edit && undo_history($event)" v-bdtongji="'编辑器-功能区-功能选项-顶部-撤销'">
                            <base-icon class="iconchehui">
                            </base-icon>
                        </div>
                        <div class="redo_icon" v-tooltip="`恢复（Ctrl+Y）`" :class="{disabled:cannot_redo || user_disable_edit}" @click="!user_disable_edit && redo_history($event)" v-bdtongji="'编辑器-功能区-功能选项-顶部-恢复'">
                            <base-icon class="iconhuifu"></base-icon>
                        </div>
                    </div>
                </template>
                <template v-else>
                    <input type="text" id="page_name" class="page_name" maxlength="20" placeholder="自定义版式" v-tooltip="`重命名`" :style="{'max-width': title_width + 'px'}" autocomplete="off" :value="page_info_title" @input="input_title($event,true)" @focus="focus_title()" @keyup.enter="blur_title" @blur="set_title(true)">
                </template>
            </div>
            <div class="head_center">
                <!--插入按钮-->
                <button class="insert-button" @click="openMaterialModal('insert')">
                    <base-icon class="iconcharu1"></base-icon>
                    <span>插入</span>
                </button>
                <!--模板按钮-->
                <button class="template-button" @click="openMaterialModal('template')">
                    <base-icon class="iconmoban2"></base-icon>
                    <span>模板</span>
                </button>
                <!-- 绘制工具栏 -->
                <create-tool ref="create_tool"></create-tool>            
                <!--动画按钮-->
                <button class="transition-effect-button" v-bdtongji="'编辑器-功能区-编辑功能-顶部-动效设置'" @click="open_transition_modal('insert')" v-if="edit_mode !== 'custom'">
                    <base-icon class="icondonghua"></base-icon>
                    <span>动画</span>
                </button>
            </div>
            <div class="head_right">
                <template v-if="edit_mode !== 'custom'">
                    <div class="demo-icon" @click="toggle_demo_options" v-bdtongji="'编辑器-功能区-功能选项-顶部-演示'">
                        <!-- <div class="demo-btn">演示</div> -->
                        <base-effect-button class="demo-btn">演示</base-effect-button>
                        <!--演示设置弹框-->
                        <transition name="modal-fade">
                            <div class="demo-options-bar" v-show="demo_options_show">
                                <div class="start_display">
                                    <p @click="show_doc_display(true)"><i class="edit-ico edit-ico-display_head" v-bdtongji="'编辑器-功能区-功能选项-顶部-演示-从头开始'"></i>从头开始</p>
                                    <p @click="show_doc_display(false)"><i class="edit-ico edit-ico-display_cur" v-bdtongji="'编辑器-功能区-功能选项-顶部-演示-从当前开始'"></i>从当前开始</p>
                                </div>
                            </div>
                        </transition>
                    </div>
                    <div class="share-icon" :class="{disable: check_option_disable(page_authority.share, document_option_authority)}" @click="!check_option_disable(page_authority.share, document_option_authority) && show_share_modal()" v-bdtongji="'编辑器-功能区-功能选项-顶部-分享'">
                        <base-effect-button class="share-btn">共享</base-effect-button>
                    </div>
                    <!--更多按钮-->
                    <div class="export-icon" :class="{disable: check_option_disable(page_authority.export, document_option_authority)} || !user.login" v-bdtongji="'编辑器-功能区-功能选项-顶部-选项-导出'" @click="export_modal_open">
                        <base-icon class="icondaochu"></base-icon>
                        <span>导出</span>
                    </div>
                </template>
                <template v-else>
                    <button class="save" :class="{saving:custom_preset_saving}" @click="save_custom_preset">{{custom_preset_saving ? '保存中...' : '保存'}}</button>
                    <button class="close" @click="iframe_close_custom">退出</button>
                </template>
            </div>
        </div>
        <!-- 编辑器主体 -->
        <div class="edit_body_wrapper">
            <!-- 编辑器左侧栏 序列表 -->
            <div class="edit_left">
                <!-- 幻灯片列表 -->
                <sort_page_modal ref="sort_page_modal" :document_loaddone="document_loaddone" :document_info="document_info" :page_info="page_info" :document_page_list="document_page_list" :comment_map="comment_map"></sort_page_modal>
            </div>
            <!-- 画布主体 -->
            <div class="edit_body" ref="drag_page" :class="{
                    'left_close': !show_left_modal,
                    'box_select':  page_state === 'box_select',
                    'format_text': had_format_painter,
                    'draw': ['create_text', 'create_line', 'create_shape'].indexOf(page_state) >= 0
                }" :style="{'overflow': page_scale.user_set <= page_scale.suitable ? '' : 'auto'}" @click="close_demo_options">
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
            <div class="edit-footer">
                <div class="footer-left" v-if="edit_mode !== 'custom'">
                    <div class="tile" @click="$refs.sort_page_modal.change_sort_modal_type('full')" v-tooltip.top="`平铺展示`">
                        <base-icon class="iconpingpushitu"></base-icon>
                    </div>
                    <div class="page-number" @click.stop="toggle_page_number_list">
                        <span>幻灯片{{page_info.uuid | get_page_number(document_page_list)}}/{{ document_page_list.length }}</span>
                        <transition name="modal-fade">
                            <ul v-if="document_page_list.length > 0 && show_page_number_list" @click.stop>
                                <li :class="{current: item.id === page_info.id}" @click.stop="check_page_number(index)" v-for="(item, index) in document_page_list" :key="item.id">第{{index + 1}}页</li>
                            </ul>
                        </transition>
                    </div>
                </div>
                <div class="footer-right">
                    <template v-if="edit_mode !== 'custom'">
                        <div class="partner">
                            <div class="partner-list" @click="showCollaboratorsModal()">
                                <div class="partner-head partner-btn" v-if="user_authority_type === 'owner'">
                                    <base-icon class="iconcharu"></base-icon>
                                </div>
                                <div class="partner-head" v-for="(item, index) in partner_online_list.slice(0, 3)" :key="index" :style="{right: `${(index + 1) * 20}px`,zIndex: `${index * -1 + 3}`}">
                                    <img v-if="item.head === '' || !item.head" src="../../../public/images/common/default_head.png" :alt="item.nickName || ''">
                                    <img v-else :src="item.head" :alt="item.nickName || ''">
                                </div>
                            </div>
                        </div>
                        <div class="comment">
                            <div :class="['comment-btn', {'comment-has': comment_map[page_info.id]}]" v-tooltip="`评论`" @click.stop="!check_option_disable(page_authority.comment, document_option_authority) && toggle_top_comment()">
                                <base-icon class="iconpinglun"></base-icon>
                            </div>
                            <!--评论面板-->
                            <transition name="modal-fade">
                                <div class="top_commend_panel" v-if="show_comment_panel" @click.stop>
                                    <div class="head">
                                        <span><i class="edit-ico edit-ico-text_unordered"></i>评论列表（{{comment_list.length}}）</span>
                                        <a @click="add_comment"><i class="edit-ico edit-ico-comment_1"></i>添加评论</a>
                                    </div>
                                    <div class="body" v-if="comment_list.length > 0">
                                        <div class="comment_item" v-for="comment in comment_list" :key="comment.id" :class="{solve:comment.isSolve}" @click="comment.show_more = false">
                                            <img class="commenter_img" :src="comment.member.head" alt="">
                                            <div class="comment_head">
                                                <span>{{comment.member.nickName}}</span>
                                                <span class="date">{{comment.date}}</span>
                                                <a class="more_action" v-if="comment.member.id === user.id" @click.stop="show_more_action(comment)"></a>
                                            </div>
                                            <div class="text_message" v-if="comment.title">选择的文本：<span>{{comment.title}}</span></div>
                                            <div class="comment_content" v-if="!comment.reedit" v-html="comment.content"></div>
                                            <!--重编辑框-->
                                            <div class="reedit_commend_bar" v-if="comment.reedit">
                                                <textarea maxlength="500" v-focus v-model="comment_draft" @input="compute_area_size($event.target, $event.target.value)"></textarea>
                                                <div class="reedit_commend_btn">
                                                    <a :disable="comment_draft.length <= 0" :class="{unable: comment_draft.length <= 0}" @click="save_comment_reedit(comment)">保存</a>
                                                    <a @click="cancel_comment_reedit(comment)">取消</a>
                                                </div>
                                            </div>
                                            <div class="comment_foot">
                                                <a @click="toggle_comment_reply(comment)">回复</a>
                                                <a @click="solve_comment(comment)">{{comment.isSolve ? '重新打开' : '标记已解决'}}</a>
                                            </div>
                                            <div class="reply_list" v-for="reply in comment.documentReviewReplies" :key="reply.id">
                                                <img :src="reply.member.head" alt="">
                                                <p class="reply_name">{{reply.member.nickName}}</p>
                                                <p class="reply_content" v-if="reply.type === 'reply'" v-html="reply.content"></p>
                                                <p class="reply_solve" v-else v-html="reply.content"></p>
                                                <p class="reply_date">{{reply.date}}</p>
                                            </div>
                                            <div class="reply_draft" v-if="comment.open_reply">
                                                <img :src="user.photo" alt="">
                                                <textarea :placeholder="comment.isSolve ? '添加评论会重新打开评论' : '回复...'" v-focus v-model="reply_draft" @input="compute_area_size($event.target, $event.target.value)"></textarea>
                                                <div class="draft_btn">
                                                    <a :disable="reply_draft.length <= 0" :class="{unable: reply_draft.length <= 0}" @click.stop="send_reply(comment)">回复</a>
                                                    <a @click.stop.stop="toggle_comment_reply(comment)">取消</a>
                                                </div>
                                            </div>
                                            <!--更多操作-->
                                            <div class="comment_more_action" v-if="comment.show_more" @click.stop>
                                                <div @click="reedit_comment($event, comment)">编辑</div>
                                                <div @click="toggle_delete_comment(comment)">删除</div>
                                            </div>
                                            <!--删除确认-->
                                            <div class="sure_delete_comment" v-if="comment.show_delete" @click.stop>
                                                <div class="delete_comment_inner">
                                                    <p>是否删除此评论会话</p>
                                                    <a @click="sure_delete_comment(comment)">删除</a>
                                                    <a @click="toggle_delete_comment(comment)">取消</a>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </transition>
                        </div>
                        <div class="edit-count" :class="{current: show_eidt_number,'edit-has': doc_hcoin}" @click.stop="show_eidt_number = !show_eidt_number">
                            <span>编辑次数</span>
                            <base-icon class="iconwancheng" v-if="doc_hcoin"></base-icon>
                            <base-icon class="iconxiala" v-else></base-icon>
                            <transition name="modal-fade">
                                <div class="edit-count-panel" v-if="show_eidt_number">
                                    <span>有效编辑次数: {{document_info.editCount > 1000 ? '>1000' : (document_info.editCount || 0)}}次</span>
                                    <span v-if="!check_option_disable(page_authority.give_hcoin, document_option_authority)">/</span>
                                    <span v-if="!check_option_disable(page_authority.give_hcoin, document_option_authority)"><a href="https://www.woodo.cn/slides/?url=1553258579" target="_blank">该文档已获赠{{doc_hcoin}}幻币<base-icon class="iconwenhao" v-tooltip="`了解详情`"></base-icon></a></span>
                                </div>
                            </transition>
                        </div>
                        <div :class="['note', {'note-has': is_has_note}]"  @click="toggleDocumentNote()">
                            <span>备注</span>
                            <base-icon class="iconbeizhu"></base-icon>
                        </div>
                    </template>

                    <div class="scale">
                        <base-icon class="iconsuoxiao" v-tooltip.top="`缩小画布`" @click="apply_scale(page_scale.user_set - 0.1)" v-bdtongji="'编辑器-画布-底部-左侧-缩放画布'"></base-icon>
                        <span title="缩放画布" @click.stop="toggle_scale">{{page_scale.percent_text}}%</span>
                        <base-icon class="iconfangda" v-tooltip.top="`放大画布`" @click="apply_scale(page_scale.user_set + 0.1)" v-bdtongji="'编辑器-画布-底部-左侧-放大画布'"></base-icon>
                        <!--底部比例选择栏-->
                        <transition name="modal-fade">
                            <div class="scale_list" v-if="show_scale_list" @click.stop>
                                <ul>
                                    <li v-for="(item, index) in scale_list" :key="index" :class="{'checked': item.checked}" @click="checked_scale(item)">{{item.name}}</li>
                                    <li class="input_scale">
                                        <input oninput="value = value.replace(/[^\d]{0,4}/g,'').slice(0,4)" v-model="page_scale.percent_text" @change="input_scale" />%
                                        <i @click.stop="apply_scale(page_scale.user_set + 0.01,true)" v-bdtongji="'编辑器-画布-底部-左侧-调整百分百'"></i>
                                        <i @click.stop="apply_scale(page_scale.user_set - 0.01,true)" v-bdtongji="'编辑器-画布-底部-左侧-调整百分百'"></i>
                                    </li>
                                </ul>
                            </div>
                        </transition>
                    </div>
                    <div class="set-full-screen" @click="set_full_screen_edit" v-tooltip="full_screen_edit ? '退出全屏编辑' : '全屏编辑'">
                        <base-icon class="icontuichuquanping" v-show="full_screen_edit"></base-icon>
                        <base-icon class="iconquanping" v-show="!full_screen_edit"></base-icon>
                    </div>
                </div>
                <transition name="modal-fade">
                    <div class="note-panel" v-if="show_page_note">
                        <textarea name="note" maxlength="1000" placeholder="在这里输入幻灯片演讲备注 …" :value="page_info_note" @input="editDocumentNote($event)" @focus="ele_cancel_checked"></textarea>
                        <div class="close" @click="toggleDocumentNote()">
                            <base-icon class="iconguanbi"></base-icon>
                        </div>
                        <span :class="['str-length', {tips: page_info_note.length === 1000}]">{{page_info_note.length}}/1000</span>
                    </div>
                </transition>
            </div>
            <!-- 编辑器右侧栏 格式面板 -->
            <div class="edit-right">
                <format_panel ref="format_panel" :edit_mode="edit_mode" :element_type="element_type" :is_group="is_group" :element_message="element_message" :user_disable="user_disable_edit" :show_format_panel="show_format_panel"></format_panel>
            </div>
            <!-- 全局设置弹框 -->
            <theme_modal ref="theme_modal" :document_info="document_info" :document_page_list="document_page_list" :doc_theme_list="doc_theme_list" :doc_font_list="doc_font_list" :doc_size_list="doc_size_list" :theme_checked="theme_checked"></theme_modal>
            <!-- 动效设置弹框 -->
            <animation_modal ref="animation_modal" :doc_info="document_info" :page_info="page_info" :document_page_list="document_page_list" @animationMarkEvent="get_animation_mark"></animation_modal>
            <!-- 媒体设置侧边栏 -->
            <media_panel ref="media_panel" :document_info="document_info"></media_panel>
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
                <div class="unlock_icon" v-tooltip="`点击解锁`" v-if="element_lock" @click.stop="set_ele_lock" @mouseover="show_unlock = true" @mouseout="show_unlock = false">
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
            <div class="right_menu" v-if="show_right_menu" :style="{'top': `${right_menu_top}px`, 'left': `${right_menu_left}px`}">
                <!-- 画布右键 -->
                <template v-if="show_right_menu === 'page'">
                    <div class="menu_item_bar">
                        <div class="menu_item menu_paste useless" title="右键暂时不支持粘贴，请使用Ctrl+V粘贴" @click="ele_paste_tips">粘贴<span>Ctrl + V</span></div>
                        <div class="menu_item menu_select" @click="ele_selectAll">全选<span>Ctrl + A</span></div>
                        <div class="menu_item menu_background none_icon" @click="open_background_setting">更改背景</div>
                        <div class="menu_item menu_theme none_icon" @click="open_theme_modal">更改主题</div>
                        <div class="menu_item menu_switch none_icon" @click="open_transition_modal">切换效果</div>
                        <div class="menu_item menu_switch none_icon" v-if="page_info.background && page_info.background.image && page_info.background.image.src" @click="download_image('background')">下载背景</div>
                    </div>
                    <div class="menu_item_bar">
                        <div class="menu_item menu_comment" @click="add_comment">评论</div>
                    </div>
                </template>
                <!-- 元素右键 -->
                <template v-else-if="show_right_menu === 'element' && element_type && !element_lock">
                    <!-- 表格元素菜单，表格场景复杂 -->
                    <template v-if="element_type === 'table'">
                        <div class="menu_item_bar">
                            <div class="menu_item menu_cut" @click="ele_cut">剪切<span>Ctrl + X</span></div>
                            <div class="menu_item menu_copy" @click="ele_copy">复制<span>Ctrl + C</span></div>
                            <div class="menu_item menu_paste useless" title="右键暂时不支持粘贴，请使用Ctrl+V粘贴" @click="ele_paste_tips">粘贴<span>Ctrl + V</span></div>
                            <div class="menu_item menu_select" @click="right_menu_selectall">全选<span>Ctrl + A</span></div>
                        </div>
                        <div class="menu_item_bar" v-if="!contenteditable_focus_menu">
                            <div class="menu_item level_top" @click="set_ele_level('top')">置于顶层</div>
                            <div class="menu_item level_bottom" @click="set_ele_level('bottom')">置于底层</div>
                            <div class="menu_item level_up" @click="set_ele_level('up')">上移一层</div>
                            <div class="menu_item level_down" @click="set_ele_level('down')">下移一层</div>
                        </div>
                        <div class="menu_item_bar" v-if="contenteditable_focus_menu">
                            <div class="menu_item" v-for="(item, index) in table_row_list" :key="index" :class="[item.data, (item.disable ? 'disabled' : '')]" @click="select_table_row(item.data)">
                                {{ item.name }}
                                <span v-if="item.key_code">{{ item.key_code }}</span>
                            </div>
                        </div>
                        <div class="menu_item_bar">
                            <div class="menu_item menu_link" v-if="selection_text_menu" @click="right_menu_link">添加链接</div>
                            <div class="menu_item menu_animation none_icon" @click="ele_create_animation">添加动画</div>
                        </div>
                        <div class="menu_item_bar" v-if="!contenteditable_focus_menu">
                            <div class="menu_item menu_comment" @click="add_comment">评论</div>
                            <div class="menu_item menu_lock" @click="set_ele_lock">锁定</div>
                            <div class="menu_item menu_delete" @click="ele_delete">删除</div>
                        </div>
                    </template>
                    <!-- 其他元素 -->
                    <template v-else>
                        <div class="menu_item_bar">
                            <div class="menu_item group_up" v-if="element_type === 'group' && !is_group" @click="set_ele_group">组合</div>
                            <div class="menu_item group_out" v-if="is_group" @click="set_ele_group">取消组合</div>
                            <div class="menu_item menu_cut" @click="ele_cut">剪切<span>Ctrl + X</span></div>
                            <div class="menu_item menu_copy" @click="ele_copy">复制<span>Ctrl + C</span></div>
                            <div class="menu_item menu_paste useless" title="右键暂时不支持粘贴，请使用Ctrl+V粘贴" @click="ele_paste_tips">粘贴<span>Ctrl + V</span></div>
                            <div class="menu_item menu_select" @click="right_menu_selectall">全选<span>Ctrl + A</span></div>
                        </div>
                        <div class="menu_item_bar">
                            <div class="menu_item level_top" @click="set_ele_level('top')">置于顶层</div>
                            <div class="menu_item level_bottom" @click="set_ele_level('bottom')">置于底层</div>
                            <div class="menu_item level_up" @click="set_ele_level('up')">上移一层</div>
                            <div class="menu_item level_down" @click="set_ele_level('down')">下移一层</div>
                        </div>
                        <!-- 图片元素专属菜单 -->
                        <div class="menu_item_bar" v-if="element_type === 'img'">
                            <div class="menu_item change_localimg">
                                <span>更换本地图片</span>
                                <input ref="uploader" type="file" accept="image/*" @change="change_local_image($event.target,'change')">
                            </div>
                            <div class="menu_item change_netimg" @click="image_dblclick">更换网络图片</div>
                            <div class="menu_item set_bgimg" @click="set_bgimg">设置为背景</div>
                            <div class="menu_item download_img" @click="download_image('material')">下载图片</div>
                        </div>
                        <div class="menu_item_bar">
                            <div class="menu_item menu_link" v-if="element_type !== 'group'" @click="right_menu_link">添加链接</div>
                            <div class="menu_item menu_animation none_icon" @click="ele_create_animation">添加动画</div>
                        </div>
                        <div class="menu_item_bar">
                            <div class="menu_item menu_comment" @click="add_comment">评论</div>
                            <div class="menu_item menu_lock" @click="set_ele_lock">锁定</div>
                            <div class="menu_item menu_delete" @click="right_menu_delete">删除</div>
                        </div>
                    </template>
                </template>
                <!-- 锁定元素 -->
                <template v-else-if="show_right_menu === 'element' && element_lock">
                    <div class="menu_item_bar">
                        <div class="menu_item menu_unlock" @click="set_ele_lock">解锁</div>
                        <div class="menu_item menu_copy" @click="ele_copy">复制<span>Ctrl + C</span></div>
                        <div class="menu_item menu_paste useless" title="右键暂时不支持粘贴，请使用Ctrl+V粘贴" @click="ele_paste_tips">粘贴<span>Ctrl + V</span></div>
                    </div>
                </template>
            </div>

            <!-- 元素超链接编辑栏 -->
            <div class="ele_link_tool" v-if="show_link_tool" ref="link_modal" :style="{top:ele_link_info.top + 'px', left: ele_link_info.left + 'px'}">
                <div class="link_default_panel" v-show="!show_link_change_modal">
                    <a :href="ele_link_info.href" target="_blank" rel="noreferrer noopener">{{ele_link_info.href}}</a>
                    <button class="change" @click="edit_link_panel">更改</button>
                    <button class="remove" @click="remove_ele_link">移除</button>
                </div>
            </div>
            <!-- 去除粘贴问题格式编辑栏 -->
            <div class="paste_clean_menu" v-if="show_paste_clean" :style="{top:text_clean_info.top + 'px', left: text_clean_info.left + 'px'}">
                <button @click="toggle_paste_clean_list"><i class="edit-ico edit-ico-paste_format"></i></button>
                <transition name="modal-fade">
                    <div class="menu_list" v-if="show_paste_clean_list" @mouseleave="text_format_operation('save')">
                        <ul>
                            <li @click="input_listener" @mouseover="text_format_operation('save')"><i class="edit-ico edit-ico-paste_save"></i>保留原格式</li>
                            <li @click="input_listener" @mouseover="text_format_operation('clean')"><i class="edit-ico edit-ico-paste_clean"></i>只保留文本</li>
                        </ul>
                    </div>
                </transition>
            </div>
            <!-- 媒体控件 -->
            <div class="operate_media_container"></div>
            <!-- 动画元素标记点 -->
            <div class="animation-mark" v-for="(item, index) in animation_mark_list" :key="index" :data-id="item.uuid" :style="{ 'top': `${item.top}px`, 'left': `${item.left}px`, }">{{ item.index }}</div>
        </div>
        <!-- 超链接弹框 -->
        <transition name="modal-fade">
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
                        <button class="submit" @click="set_ele_link">确定</button>
                    </div>
                </div>
            </div>
        </transition>
        <!-- 插入面板 or 模板面板 -->
        <material-library ref="material_library"></material-library>
        <!--右侧评论弹框-->
        <div class="commend_modal" :class="{show:show_right_comment && (right_comment_list.length > 0 || show_add_comment)}">
            <div class="comment_head">
                <button class="close" @click="toggle_comment_modal(false)"><i class="edit-ico edit-ico-close_1"></i></button>
            </div>
            <!-- 评论列表 -->
            <div class="comment_list">
                <div class="commend_draft" v-if="show_add_comment">
                    <img :src="user.photo" alt="">
                    <div class="draft_owner">{{user.name}}</div>
                    <textarea maxlength="500" class="draft_content" style="height:40px;" v-focus v-model="comment_draft" @input="compute_area_size($event.target, $event.target.value)"></textarea>
                    <div class="draft_btn">
                        <a :disable="comment_draft.length <= 0" :class="{unable: comment_draft.length <= 0}" @click="send_comment">评论</a>
                        <a @click="cancel_add_comment">取消</a>
                    </div>
                </div>
                <div class="comment_item" v-for="comment in right_comment_list" :key="comment.id" :class="{check:(comment.open_reply || comment.check)}" @click="select_comment_item(comment)">
                    <img :src="comment.member.head" alt="">
                    <div class="list_head">
                        <p>{{comment.member.nickName}}</p>
                        <span>{{comment.date}}</span>
                        <a class="solve_commend" @click.stop="solve_comment(comment)">解决</a>
                        <a class="more_action sp_ico_hover" v-if="comment.member.id === user.id" @click.stop="show_more_action(comment)"><i class="edit-ico edit-ico-more_gray" data-hover="edit-ico-more_blue"></i></a>
                    </div>
                    <div class="list_body" v-if="!comment.reedit">{{comment.content}}</div>
                    <div class="reply_list" v-for="reply in comment.documentReviewReplies" :key="reply.id">
                        <img :src="reply.member.head" alt="">
                        <p>{{reply.member.nickName}}</p>
                        <span>{{reply.date}}</span>
                        <div v-if="reply.type === 'reply'">{{reply.content}}</div>
                        <i v-else>{{reply.content}}</i>
                    </div>
                    <!--回复框-->
                    <div class="reply_draft" v-if="comment.open_reply" @click.stop>
                        <textarea class="draft_content" maxlength="500" placeholder="回复..." v-focus v-model="reply_draft" @input="compute_area_size($event.target, $event.target.value)"></textarea>
                        <div class="draft_btn">
                            <a :disable="reply_draft.length <= 0" :class="{unable: reply_draft.length <= 0}" @click.stop="send_reply(comment)">回复</a>
                            <a @click.stop.stop="toggle_comment_reply(comment)">取消</a>
                        </div>
                    </div>
                    <!--重编辑框-->
                    <div class="reedit_commend_bar" v-if="comment.reedit" @click.stop>
                        <textarea maxlength="500" v-focus v-model="comment_draft" @input="compute_area_size($event.target, $event.target.value)"></textarea>
                        <div class="reedit_commend_btn">
                            <a :disable="comment_draft.length <= 0" :class="{unable: comment_draft.length <= 0}" @click="save_comment_reedit(comment)">保存</a>
                            <a @click="cancel_comment_reedit(comment)">取消</a>
                        </div>
                    </div>
                    <!--更多操作-->
                    <div class="comment_more_action" v-if="comment.show_more" @click.stop>
                        <div @click="reedit_comment($event, comment)">编辑</div>
                        <div @click="toggle_delete_comment(comment)">删除</div>
                    </div>
                    <!--删除确认-->
                    <div class="sure_delete_comment" v-if="comment.show_delete" @click.stop>
                        <div class="delete_comment_inner">
                            <p>是否删除此评论会话</p>
                            <a @click="sure_delete_comment(comment)">删除</a>
                            <a @click="toggle_delete_comment(comment)">取消</a>
                        </div>
                    </div>
                </div>
            </div>
            <!-- 评论底部 -->
            <div class="comment_foot" @click="toggle_comment_modal(false)">
                <div class="hide_comment">
                    <i></i>
                    <span>隐藏评论,下次编辑再打开</span>
                </div>
            </div>
        </div>
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
        <!-- 快捷键弹框 -->
        <transition name="modal-fade">
            <div class="keyboard_shortcuts_modal" v-show="show_keyboards_shortcuts">
                <div class="masking_wrapper">
                    <div class="modal_main">
                        <h1>键盘快捷键</h1>
                        <button class="close_btn" @click="toggle_keyboards_shortcuts(false)"></button>
                        <div class="modal_left">
                            <p class="key_type" v-for="(item,index) in keyboards" :key="index" :class="{current:keyboards_index == index}" @click="change_keyboards_list(index)">{{item.title}}</p>
                        </div>
                        <div class="keyboard_contain">
                            <ul class="key_type" v-show="keyboards_index == index" v-for="(item,index) in keyboards" :key="index">
                                <li class="list" v-for="list in item.keys" :key="list.name" :class="{bold:list.class === 'bold', italic: list.class === 'italic', line: list.class === 'line'}">
                                    <span>{{list.name}}</span>
                                    <span>{{list.key}}</span>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
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
        <!-- 分享弹框 -->
        <share_modal ref="share_modal" @fresh_doc_name="fresh_doc_name"></share_modal>
        <!-- 保存副本 || 保存模板命名弹框 -->
        <name_modal ref="name_modal" :document_info="document_info"></name_modal>
        <!-- 导入弹框 -->
        <import_modal ref="import_modal" :document_info="document_info"></import_modal>
        <!-- 导出弹窗 -->
        <export_modal ref="export_modal" :document_id="document_info.id"></export_modal>
        <!-- 报错反馈弹框 -->
        <error_feedback ref="error_feedback" :document_info="document_info" :page_info="page_info"></error_feedback>
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
    </div>
</template>

<!--css-->
<style lang="less" scoped>
@import url('~@/assets/pc/css/common.css');
@import url('~@/assets/pc/css/edit.css');
@import url('~@/assets/pc/images/edit/sprite/sprites.css');

@background_image: url('~@/assets/pc/images/edit/edit_sp_2.0.1.png');

@dark_operate: #ffffff;
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
    background-color: #e9e9e9;
    &.resizing {
        .show_text {
            cursor: move !important;
        }
    }

    // 编辑器 顶栏
    .edit_head {
        position: relative;
        background: #111111;
        display: flex;
        align-items: center;
        width: 100%;
        height: 60px;
        .head_left {
            position: absolute;
            top: 0;
            left: 0;
            display: flex;
            align-items: center;
            height: 100%;
            text-align: left;
            user-select: none;
            .head-logo {
                position: relative;
                padding: 10px;
                > .base-icon {
                    font-size: 24px;
                    color: #aaaaaa;
                    cursor: pointer;
                    &:hover {
                        color: #ffffff;
                    }
                    &.current {
                        color: #ffffff;
                    }
                }
                .menu-list {
                    position: absolute;
                    left: 15px;
                    top: 100%;
                    z-index: 21;
                    border: 1px solid #eeeeee;
                    border-radius: 6px;
                    box-shadow: 0px 2px 20px 0px rgba(180, 187, 199, 0.2);
                    > ul {
                        padding: 5px 0;
                        position: relative;
                        width: 250px;
                        background: #ffffff;

                        &:nth-of-type(n-1) {
                            &::after {
                                content: '';
                                position: absolute;
                                left: 50%;
                                bottom: 0;
                                transform: translateX(-50%);
                                display: block;
                                width: 190px;
                                height: 1px;
                                background: #eeeeee;
                            }
                        }

                        > li {
                            display: flex;
                            align-items: center;
                            padding: 0 30px;
                            width: 100%;
                            height: 44px;
                            cursor: pointer;
                            &:hover {
                                background: #f4f4f4;
                            }
                            > .base-icon {
                                margin-right: 15px;
                            }
                        }

                        > li.view {
                            position: relative;
                            .view-panel {
                                position: absolute;
                                top: 0;
                                left: 100%;
                                width: 160px;
                                background: #ffffff;
                                border: 1px solid #eeeeee;
                                border-radius: 6px;
                                box-shadow: 0px 2px 20px 0px
                                    rgba(180, 187, 199, 0.2);
                                > ul {
                                    width: 100%;
                                    border-bottom: solid 1px #e0e2e4;
                                    li {
                                        display: flex;
                                        justify-content: space-between;
                                        align-items: center;
                                        padding: 0 20px;
                                        width: 100%;
                                        height: 44px;
                                        padding: 0 20px;
                                        &:hover,
                                        &.check {
                                            color: #117df7;
                                        }
                                        &.check::after {
                                            content: '';
                                            width: 9px;
                                            height: 5px;
                                            border: 2px solid var(--mainColor);
                                            border-top: none;
                                            border-right: none;
                                            transform: rotate(-45deg);
                                        }
                                    }
                                }
                                .grid_setting_list {
                                    .grid_control {
                                        margin-top: 10px;
                                        display: flex;
                                        justify-content: space-between;
                                        align-items: center;
                                        color: #9ea2a6;
                                        font-weight: bold;
                                        .control_btn {
                                            display: block;
                                            position: relative;
                                            width: 30px;
                                            height: 16px;
                                            background-color: var(--mainColor);
                                            border-radius: 8px;
                                            cursor: pointer;
                                            &:hover {
                                                opacity: 0.8;
                                            }
                                            i {
                                                display: inline-block;
                                                position: absolute;
                                                right: 0;
                                                top: 1px;
                                                width: 14px;
                                                height: 14px;
                                                background-color: #ffffff;
                                                border-radius: 50%;
                                            }
                                            &.close {
                                                background-color: #d0d9e2;
                                                i {
                                                    left: 0;
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }

                        > li.help {
                            position: relative;
                            &:hover {
                                ul {
                                    display: block;
                                }
                            }
                            > .base-icon {
                                margin-right: 0;
                                margin-left: auto;
                                font-size: 12px;
                            }
                            ul {
                                display: none;
                                position: absolute;
                                top: 0;
                                left: 100%;
                                padding: 5px 0;
                                width: 160px;
                                background: #ffffff;
                                border: 1px solid #eeeeee;
                                border-radius: 6px;
                                box-shadow: 0px 2px 20px 0px
                                    rgba(180, 187, 199, 0.2);
                                > li {
                                    padding: 0 20px;
                                    display: flex;
                                    align-items: center;
                                    width: 100%;
                                    height: 44px;
                                    cursor: pointer;
                                    &:hover {
                                        background: #f4f4f4;
                                    }
                                    > .base-icon {
                                        margin-right: 15px;
                                    }
                                }
                            }
                        }

                        > li.recycle {
                            &:hover {
                                .base-icon,
                                span {
                                    color: #ff0000;
                                }
                            }
                        }
                    }
                }
            }
            .doc_name {
                display: inline-block;
                vertical-align: middle;
                text-align: center;
                width: 126px;
                height: 30px;
                line-height: 30px;
                margin: 0;
                padding: 0 10px;
                background-color: transparent;
                border: 1px solid transparent;
                border-radius: 4px;
                font-size: 14px;
                color: #747d92;
                transition: all 0.3s;
                &:focus {
                    background: #f3f3f3;
                    transition: all 0.3s;
                    &:hover {
                        background: #f3f3f3;
                    }
                }
                &:hover {
                    background: #1a1a1b;
                }
            }
            .doc-down {
                position: relative;
                display: flex;
                justify-content: center;
                align-items: center;
                width: 25px;
                height: 40px;
                cursor: pointer;
                &:hover{
                    > .base-icon {
                        color: #ffffff;
                    }
                }
                > .base-icon {
                    font-size: 5px;
                    color: #666666;
                    transform: scale(0.7);
                }
                .file-panel {
                    position: absolute;
                    left: 50%;
                    top: calc(100% + 17px);
                    transform: translateX(-50%);
                    z-index: 21;
                    width: 250px;
                    height: 500px;
                    background: #ffffff;
                    border: 1px solid #eeeeee;
                    border-radius: 6px;
                    box-shadow: 0px 2px 20px 0px rgba(180, 187, 199, 0.2);
                    overflow-y: auto;
                    cursor: default;

                    &::-webkit-scrollbar-thumb {
                        background-color: #e8eaf0;
                    }

                    .my-desktop,
                    .my-lately{
                        display: flex;
                        padding: 0 30px;
                        span{
                            padding-top: 20px;
                            display: block;
                            width: 100%;
                            font-size: 12px;
                            color: #999999;
                        }
                    }
                    .my-lately{
                        span{
                            border-top: 1px solid #eeeeee;
                        }
                    }

                    .pre-folder {
                        display: flex;
                        align-items: center;
                        padding: 0 25px;
                        width: 100%;
                        height: 44px;
                        border-bottom: 1px solid #eeeeee;
                        .base-icon {
                            color: #666666;
                        }
                        span {
                            margin-left: 15px;
                            font-size: 14px;
                            color: #444444;
                        }
                    }
                    .pre-folder {
                        cursor: pointer;
                        &:hover {
                            background: #f4f4f4;
                        }
                    }

                    .doc-empty {
                        display: flex;
                        justify-content: center;
                        align-items: center;
                        width: 100%;
                        height: 300px;
                    }

                    ul {
                        padding: 5px 0 10px 0;
                        li {
                            display: flex;
                            align-items: center;
                            padding: 0 30px;
                            width: 100%;
                            height: 44px;
                            font-size: 14px;
                            color: #444444;
                            cursor: pointer;

                            &:hover {
                                background: #f4f4f4;
                            }

                            span {
                                overflow: hidden;
                                text-overflow: ellipsis;
                                white-space: nowrap;
                            }

                            

                            &.folder {
                                .base-icon{
                                    font-size: 20px;
                                }
                                span {
                                    margin-left: 15px;
                                    margin-right: auto;
                                }
                                .grade {
                                    font-size: 12px;
                                }
                            }

                            &.current {
                                color: #005cff;
                                span {
                                    margin-right: auto;
                                }
                                .base-icon {
                                    color: #005cff;
                                }
                            }
                        }
                    }
                }
            }
            .head_time {
                display: flex;
                align-items: center;
                .update_time {
                    padding: 0 20px;
                    margin-left: 20px;
                    display: flex;
                    align-items: center;
                    width: 165px;
                    height: 16px;
                    background: transparent;
                    vertical-align: middle;
                    border-left: 1px solid #414141;
                    transition: all 0.3s;
                    cursor: pointer;
                    &:hover span {
                        color: #ffffff;
                    }
                    span {
                        margin-left: 5px;
                        font-size: 12px;
                        color: #aaaaaa;
                    }
                    &.wait_icon {
                        .base-icon {
                            display: none;
                        }
                        &::before {
                            content: '';
                            display: inline-block;
                            vertical-align: middle;
                            width: 15px;
                            height: 15px;
                            background: url('../../assets/pc/images/edit/wait_icon.gif')
                                no-repeat;
                            background-size: contain;
                        }
                    }
                }
                .undo_icon,
                .redo_icon {
                    display: inline-block;
                    width: 32px;
                    height: 32px;
                    line-height: 32px;
                    text-align: center;
                    background: #292929;
                    border-radius: 5px;
                    cursor: pointer;

                    &:hover {
                        background: #ffffff;
                    }
                    &.disabled {
                        cursor: no-drop;
                        background: none;

                        .base-icon {
                            opacity: 0.5;
                        }
                        &:hover {
                            background-color: transparent;
                        }
                    }
                    .base-icon {
                        color: #666666;
                    }
                }
                .redo_icon {
                    margin-left: 10px;
                }
            }

            // 自定义预设的输入框
            .page_name {
                display: inline-block;
                vertical-align: middle;
                text-align: center;
                width: 126px;
                height: 30px;
                line-height: 30px;
                margin-left: 20px;
                padding: 0 10px;
                background-color: transparent;
                border: 1px solid transparent;
                border-radius: 4px;
                font-size: 14px;
                color: #747d92;
                transition: all 0.3s;
                &:focus {
                    background: #f3f3f3;
                    transition: all 0.3s;
                    &:hover {
                        background: #f3f3f3;
                    }
                }
                &:hover {
                    background: #1a1a1b;
                }
            }
        }
        .head_center {
            flex: 1;
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100%;

            .insert-button {
                position: relative;
                margin-right: 30px;
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                .base-icon {
                    font-size: 14px;
                    color: #aaaaaa;
                }
                span {
                    margin-top: 5px;
                    font-size: 12px;
                    color: #aaaaaa;
                }
                &:hover {
                    .base-icon {
                        color: #ffffff;
                    }
                    span {
                        color: #ffffff;
                    }
                }
            }

            .template-button{
                position: relative;
                margin-right: 30px;
                padding-right: 30px;
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                .base-icon {
                    font-size: 14px;
                    color: #aaaaaa;
                }
                span {
                    margin-top: 5px;
                    font-size: 12px;
                    color: #aaaaaa;
                }
                &:hover {
                    .base-icon {
                        color: #ffffff;
                    }
                    span {
                        color: #ffffff;
                    }
                }
                &::after{
                    content: '';
                    position: absolute;
                    top: 50%;
                    right: 0;
                    transform: translateY(-50%);
                    display: inline-block;
                    width: 1px;
                    height: 30px;
                    background: #444444;
                }
            }

            
            .transition-effect-button {
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                .base-icon {
                    font-size: 14px;
                    color: #aaaaaa;
                }
                span {
                    margin-top: 5px;
                    font-size: 12px;
                    color: #aaaaaa;
                }
                &:hover {
                    .base-icon {
                        color: #ffffff;
                    }
                    span {
                        color: #ffffff;
                    }
                }
            }
        }
        .head_right {
            position: absolute;
            top: 0;
            right: 0;
            display: flex;
            align-items: center;
            height: 100%;
            // 演示按钮
            .demo-icon {
                position: relative;
                margin-right: 10px;
                font-size: 12px;
                .demo-btn{
                    position: relative;
                    padding: 8px 14px;
                    color: #aaaaaa;
                    background: #292929;
                    border-radius: 5px;
                    &:hover{
                        color: #444444;
                    }
                    /deep/i.effect{
                        background: #ffffff;
                    }
                }
                
                // 演示下拉框
                .demo-options-bar {
                    position: absolute;
                    top: calc(100% + 10px);
                    left: 50%;
                    transform: translateX(-50%);
                    width: 160px;
                    height: 90px;
                    padding: 9px 0;
                    background: #fff;
                    border-radius: 4px;
                    border: 1px solid #f3f2f2;
                    box-shadow: -2px 4px 5px 0 rgba(0, 0, 0, 0.06);
                    text-align: left;
                    z-index: 30;
                    p {
                        width: 100%;
                        height: 38px;
                        line-height: 38px;
                        padding-left: 20px;
                        font-size: 12px;
                        color: #696969;
                        cursor: pointer;
                        &:first-child i {
                            margin: 0 13px 1px 0;
                        }
                        &:last-child i {
                            margin: 0 13px 1px 0;
                        }
                        &:hover {
                            background: #f5f7f9;
                        }
                    }
                }
            }

            // 分享按钮
            .share-icon {
                margin-right: 10px;
                .share-btn{
                    padding: 8px 14px;
                    font-size: 12px;
                    color: #aaaaaa;
                    background: #292929;
                    border-radius: 5px;
                    cursor: pointer;
                    &:hover {
                        color: #444444;
                    }
                    /deep/i.effect{
                        background: #ffffff;
                    }
                }
                
            }

            // 导出按钮
            .export-icon {
                margin-right: 10px;
                padding: 8px 14px;
                font-size: 12px;
                color: #ffffff;
                background: var(--mainColor);
                border-radius: 5px;
                cursor: pointer;
                &:hover {
                    background: #004dd0;
                }
                .base-icon {
                    font-size: 10px;
                }
                span {
                    margin-left: 8px;
                }
            }

            // 自定义版式 样式
            .close,
            .save {
                margin-right: 10px;
                padding: 8px 14px;
                font-size: 12px;
                color: #ffffff;
                border-radius: 5px;
                cursor: pointer;
            }
            .save {
                background: var(--mainColor);
                &:hover {
                    background: #004dd0;
                }
            }
            .close {
                background: #292929;
                &:hover {
                    background: #ffffff;
                    color: #444444;
                }
            }
        }
    }

    .edit_body_wrapper {
        position: relative;
        display: inline-block;
        height: 100%;
        width: 100%;
        .edit_body {
            position: relative;
            display: inline-block;
            left: 164px;
            width: 100%;
            height: calc(100% - 40px);
            font-size: 0;
            &.left_close {
                left: 118px;
            }
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
        }
        // 画布主体
        .edit_body {
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
            top: 0;
            width: 164px;
            height: calc(100% - 40px);
            text-align: center;
            background: #f6f6f6;
            box-shadow: 1px 0 3px 0 rgba(0, 0, 0, 0.08);
            font-size: 0;
            border-right: 1px solid #eeeeee;
            transition: left 0.4s;
            // 滚动条样式
            ::-webkit-scrollbar-track {
                background-color: #f6f6f6;
            }
            ::-webkit-scrollbar-thumb {
                background-color: #dce7ff;
                border-radius: 3px;
                cursor: pointer;
            }
        }

        // 底栏
        .edit-footer {
            position: absolute;
            left: 0;
            bottom: 0;
            z-index: 11;
            display: flex;
            width: 100%;
            height: 40px;
            background: #ffffff;
            border-top: 1px solid #eeeeee;
            .footer-left {
                display: flex;
                align-items: center;
                height: 100%;
                .tile {
                    margin-left: 22px;
                    width: 28px;
                    height: 28px;
                    line-height: 28px;
                    text-align: center;
                    cursor: pointer;
                    .base-icon {
                        font-size: 20px;
                        color: #444444;
                    }
                    &:hover {
                        background: #eeeeee;
                    }
                }

                .page-number {
                    position: relative;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    width: 90px;
                    height: 32px;
                    border-radius: 5px;
                    cursor: pointer;
                    &:hover {
                        background: #eeeeee;
                    }
                    span {
                        font-size: 12px;
                        color: #444444;
                    }
                    ul {
                        position: absolute;
                        left: 50%;
                        bottom: calc(100% + 10px);
                        transform: translateX(-50%);
                        z-index: 21;
                        padding: 10px 0;
                        width: 100%;
                        max-height: 340px;
                        background: #ffffff;
                        border: 1px solid #eeeeee;
                        border-radius: 6px;
                        box-shadow: 0px -2px 20px 0px rgba(180, 187, 199, 0.2);
                        overflow-y: auto;
                        &::-webkit-scrollbar-thumb {
                            background: #dddddd;
                        }
                        li {
                            width: 100%;
                            height: 40px;
                            line-height: 40px;
                            font-size: 14px;
                            text-align: center;
                            color: #444444;
                            cursor: pointer;
                            &:hover {
                                background: #f4f4f4;
                            }
                            &.current {
                                color: var(--mainColor);
                            }
                        }
                    }
                }
            }
            .footer-right {
                flex: 1;
                display: flex;
                justify-content: flex-end;
                align-items: center;
                height: 100%;
                .partner {
                    display: flex;
                    align-items: center;
                    height: 100%;
                    cursor: pointer;
                    .partner-list {
                        position: relative;
                        height: 100%;
                        .partner-head {
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
                .comment {
                    margin-left: 10px;
                    position: relative;
                    width: 20px;
                    height: 20px;
                    cursor: pointer;

                    .bubble{
                        position: absolute;
                    }

                    .comment-btn {
                        display: flex;
                        justify-content: center;
                        align-items: center;
                        width: 100%;
                        height: 100%;
                        &:hover {
                            background: #eeeeee;
                        }
                        &.comment-has{
                            color: var(--mainColor);
                        }
                        .iconpinglun {
                            font-size: 18px;
                        }
                    }
                    /* 评论面板 */
                    .top_commend_panel {
                        position: absolute;
                        bottom: calc(100% + 10px);
                        left: 50%;
                        transform: translateX(-50%);
                        z-index: 20;
                        width: 370px;
                        height: auto;
                        border: 1px solid #ebebeb;
                        border-radius: 2px;
                        background: #ffffff;
                        text-align: left;
                        box-shadow: 0 8px 12px 0 rgba(0, 0, 0, 0.12);
                        .head {
                            position: relative;
                            height: 50px;
                            line-height: 50px;
                            padding: 0 30px;
                            font-size: 0;
                            span {
                                display: inline-block;
                                height: 50px;
                                padding-left: 23px;
                                font-size: 14px;
                                color: #5e636e;
                                &:before {
                                    position: absolute;
                                    top: 18px;
                                    left: 30px;
                                }
                                i {
                                    margin-right: 8px;
                                }
                            }
                            a {
                                position: absolute;
                                top: 7px;
                                right: 14px;
                                width: 104px;
                                height: 36px;
                                line-height: 36px;
                                padding-left: 36px;
                                border-radius: 2px;
                                font-size: 14px;
                                color: #5e636e;
                                &:hover {
                                    background: #e6f7ff;
                                    opacity: 1;
                                }
                                i {
                                    position: absolute;
                                    top: 12px;
                                    left: 14px;
                                }
                            }
                        }
                        .body {
                            width: 368px;
                            height: 400px;
                            padding: 15px 20px;
                            border-top: 1px solid #e8e8e8;
                            overflow: hidden;
                            overflow-y: auto;
                            &::-webkit-scrollbar-track {
                                background-color: #ffffff;
                            }
                            &::-webkit-scrollbar-thumb {
                                background-color: #e4e4e4;
                            }
                            .sure_delete_comment {
                                position: absolute;
                                top: 0;
                                left: 0;
                                width: 100%;
                                height: 100%;
                                line-height: 100%;
                                border-radius: 4px;
                                background: rgba(0, 0, 0, 0.5);
                                text-align: center;
                                .delete_comment_inner {
                                    display: inline-block;
                                    width: 100%;
                                    height: 64px;
                                    line-height: initial;
                                    vertical-align: middle;
                                    p {
                                        margin-bottom: 20px;
                                        font-size: 14px;
                                        color: #ffffff;
                                    }
                                    a {
                                        display: inline-block;
                                        width: 54px;
                                        height: 24px;
                                        line-height: 24px;
                                        margin: 0 7px;
                                        border-radius: 4px;
                                        background: #ffffff;
                                        font-size: 12px;
                                        color: #b0b5c2;
                                        &:nth-child(3) {
                                            background: var(--mainColor);
                                            color: #ffffff;
                                        }
                                    }
                                }
                                &:after {
                                    content: '';
                                    position: relative;
                                    display: inline-block;
                                    width: 0;
                                    height: 100%;
                                    vertical-align: middle;
                                }
                            }
                            .comment_more_action {
                                position: absolute;
                                top: 40px;
                                right: 11px;
                                z-index: 2;
                                width: 80px;
                                height: auto;
                                padding: 10px 5px;
                                border: 1px solid #ebebeb;
                                border-radius: 2px;
                                background: #ffffff;
                                box-shadow: 2px 2px 3px 0 rgba(0, 0, 0, 0.2);
                                div {
                                    height: 30px;
                                    line-height: 30px;
                                    font-size: 12px;
                                    color: #686b74;
                                    text-align: center;
                                    cursor: pointer;
                                    &:hover {
                                        background: #f5f8fe;
                                    }
                                    &:first-child {
                                        border-bottom: 1px solid #ebebeb;
                                    }
                                }
                            }
                            .reedit_commend_bar {
                                width: 100%;
                                height: auto;
                                margin-top: 10px;
                                textarea {
                                    display: block;
                                    width: 100%;
                                    min-height: 40px;
                                    line-height: 20px;
                                    border: 1px solid #dadce0;
                                    border-radius: 4px;
                                    padding: 4px 8px;
                                    font-size: 12px;
                                    color: #3c4043;
                                    font-family: 'Microsoft YaHei', 'PingFang SC', 'sans-serif';
                                    word-break: break-all;
                                    resize: none;
                                    overflow: hidden;
                                    &:focus {
                                        border-color: var(--mainColor);
                                        outline: 1px solid var(--mainColor);
                                    }
                                }
                                .reedit_commend_btn {
                                    height: 40px;
                                    line-height: 40px;
                                    text-align: right;
                                    a {
                                        display: inline-block;
                                        width: 46px;
                                        height: 25px;
                                        line-height: 23px;
                                        border: 1px solid #e7e7e7;
                                        border-radius: 4px;
                                        font-size: 12px;
                                        color: #b0b5c2;
                                        text-align: center;
                                        &:first-child {
                                            margin-right: 10px;
                                            border-color: var(--mainColor);
                                            background: var(--mainColor);
                                            color: #ffffff;
                                        }
                                        &.unable {
                                            border-color: #f4f4f5;
                                            background: #f4f4f5;
                                            color: #c0c1c5;
                                            cursor: default;
                                        }
                                    }
                                }
                            }
                            .reply_draft textarea {
                                display: block;
                                width: 100%;
                                min-height: 40px;
                                line-height: 20px;
                                border: 1px solid #dadce0;
                                border-radius: 4px;
                                padding: 0 8px;
                                font-size: 12px;
                                color: #3c4043;
                                font-family: 'Microsoft YaHei', 'PingFang SC', 'sans-serif';
                                word-break: break-all;
                                resize: none;
                                overflow: hidden;
                                &:focus {
                                    border-color: var(--mainColor);
                                    outline: 1px solid var(--mainColor);
                                }
                            }
                            .draft_btn {
                                height: 40px;
                                line-height: 40px;
                                text-align: right;
                                a {
                                    display: inline-block;
                                    width: 46px;
                                    height: 25px;
                                    line-height: 23px;
                                    border: 1px solid #e7e7e7;
                                    border-radius: 4px;
                                    font-size: 12px;
                                    color: #b0b5c2;
                                    text-align: center;
                                    &:first-child {
                                        margin-right: 10px;
                                        border-color: var(--mainColor);
                                        background: var(--mainColor);
                                        color: #ffffff;
                                    }
                                    &.unable {
                                        border-color: #f4f4f5;
                                        background: #f4f4f5;
                                        color: #c0c1c5;
                                        cursor: default;
                                    }
                                }
                            }
                        }
                        .comment_item {
                            position: relative;
                            width: 328px;
                            height: auto;
                            padding: 15px 12px 15px 53px;
                            margin-bottom: 12px;
                            border: 1px solid #eeeeee;
                            border-radius: 4px;
                            &.solve {
                                background: #f6f6f6;
                            }
                            &.relative {
                                background: #fffbe1;
                            }
                        }
                        .commenter_img {
                            position: absolute;
                            top: 14px;
                            left: 16px;
                            display: inline-block;
                            width: 30px;
                            height: 30px;
                            border-radius: 30px;
                        }
                        .comment_head {
                            position: relative;
                            height: 22px;
                            line-height: 22px;
                            font-size: 0;
                            span {
                                font-size: 12px;
                                color: #848995;
                            }
                            .date {
                                position: absolute;
                                top: 0;
                                right: 18px;
                                height: 22px;
                                color: #bcc1ce;
                            }
                            .more_action {
                                position: absolute;
                                top: 4px;
                                right: 0;
                                width: 14px;
                                height: 14px;
                                border: 1px solid #eeeeee;
                                border-radius: 2px;
                                &:before {
                                    content: '';
                                    position: absolute;
                                    top: 50%;
                                    left: 50%;
                                    width: 1px;
                                    height: 1px;
                                    margin: -2px 0 0 -3px;
                                    border-top: 3px solid #bfc4cd;
                                    border-left: 3px solid transparent;
                                    border-right: 3px solid transparent;
                                }
                            }
                        }
                        .text_message {
                            width: 100%;
                            height: 22px;
                            line-height: 22px;
                            font-size: 12px;
                            color: #a4aab8;
                            overflow: hidden;
                            text-overflow: ellipsis;
                            white-space: nowrap;
                            span {
                                color: #daa71d;
                            }
                        }
                        .comment_content {
                            width: 100%;
                            height: auto;
                            line-height: 20px;
                            margin-top: 5px;
                            font-size: 12px;
                            color: #848995;
                            white-space: pre-line;
                            word-break: break-all;
                        }
                        .comment_foot {
                            height: 18px;
                            line-height: 18px;
                            margin: 5px 0;
                            a {
                                display: inline-block;
                                height: 18px;
                                font-size: 12px;
                                color: #c6cad5;
                                &:hover {
                                    color: var(--mainColor);
                                }
                                &:first-child {
                                    margin-right: 18px;
                                    &:hover {
                                        text-decoration: underline;
                                    }
                                }
                            }
                        }
                        .reply_list {
                            position: relative;
                            width: 262px;
                            min-height: 74px;
                            padding: 12px 12px 5px 46px;
                            margin-bottom: 10px;
                            border: 1px solid #eeeeee;
                            border-radius: 4px;
                            img {
                                position: absolute;
                                top: 7px;
                                left: 10px;
                                width: 30px;
                                height: 30px;
                                border-radius: 30px;
                            }
                            .reply_name {
                                height: 20px;
                                line-height: 20px;
                                font-size: 12px;
                                color: #848995;
                                font-weight: bold;
                            }
                            .reply_content {
                                line-height: 20px;
                                font-size: 12px;
                                color: #848995;
                                white-space: pre-line;
                                word-break: break-all;
                            }
                            .reply_date {
                                height: 20px;
                                line-height: 20px;
                                font-size: 12px;
                                color: #bcc1ce;
                            }
                            .reply_solve {
                                position: absolute;
                                top: 16px;
                                right: 10px;
                                height: 20px;
                                line-height: 20px;
                                font-size: 14px;
                                color: #686b74;
                                font-style: italic;
                                opacity: 0.5;
                                user-select: none;
                            }
                        }
                        .reply_draft {
                            position: relative;
                            width: 262px;
                            min-height: 74px;
                            padding: 9px 12px 5px 46px;
                            margin-bottom: 10px;
                            border: 1px solid #eeeeee;
                            border-radius: 4px;
                            background: #ffffff;
                            img {
                                position: absolute;
                                top: 13px;
                                left: 10px;
                                width: 30px;
                                height: 30px;
                                border-radius: 30px;
                            }               
                        }
                    }
                }
                .edit-count {
                    margin-left: 10px;
                    position: relative;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    width: 84px;
                    height: 24px;
                    color: #444444;
                    background: #f4f4f4;
                    border-radius: 5px;
                    cursor: pointer;
                    
                    span {
                        font-size: 12px;
                    }
                    > .base-icon {
                        margin-left: 5px;
                        font-size: 12px;
                        transform: rotate(-90deg);
                        transition: 0.3s;
                    }
                    &:hover {
                        background: var(--mainColor);
                        > span {
                            color: #ffffff;
                        }
                        > .base-icon {
                            color: #ffffff;
                        }
                    }
                    &.edit-has{
                        color: #51b52f;
                        background: rgba(81, 181, 47, .1);
                        .base-icon {
                            font-size: 16px;
                            transform: none;
                        }
                        &:hover {
                            background: var(--mainColor);
                        }
                        &.current{
                            .base-icon {
                                transform: none;
                            }
                        }
                    }
                    &.current {
                        background: var(--mainColor);
                        > span {
                            color: #ffffff;
                        }
                        > .base-icon {
                            color: #ffffff;
                            transform: rotate(90deg);
                        }
                    }

                    .edit-count-panel {
                        position: absolute;
                        bottom: calc(100% + 8px);
                        left: 50%;
                        transform: translateX(-50%);
                        z-index: 20;
                        width: 290px;
                        height: 40px;
                        line-height: 40px;
                        text-align: center;
                        background: #ffffff;
                        border: 1px solid #eeeeee;
                        box-shadow: 0px -2px 20px 0px rgba(180, 187, 199, 0.2);
                        span {
                            padding: 0 2px;
                            font-size: 12px;
                            color: #666666;
                            a {
                                color: #666666;
                                &:hover {
                                    color: var(--mainColor);
                                }
                                .base-icon {
                                    margin-left: 5px;
                                    font-size: 20px;
                                    color: #666666;
                                    vertical-align: sub;
                                }
                            }
                        }
                    }
                }
                .note {
                    margin-left: 10px;
                    width: 60px;
                    height: 24px;
                    line-height: 24px;
                    text-align: center;
                    color: #444444;
                    background: #f4f4f4;
                    border-radius: 5px;
                    cursor: pointer;
                    &.note-has{
                        color: var(--mainColor);
                        background: rgba(0, 91, 255, .1);
                    }
                    > span {
                        font-size: 12px;
                    }
                    > .base-icon {
                        font-size: 12px;
                    }

                    &:hover,
                    &.current {
                        background: var(--mainColor);
                        > span {
                            color: #ffffff;
                        }
                        > .base-icon {
                            color: #ffffff;
                        }
                    }
                }

                .scale {
                    padding: 0 10px;
                    margin-left: 10px;
                    position: relative;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    border-left: 1px solid #dddddd;
                    > span {
                        margin: 0 10px;
                        font-size: 12px;
                        color: #444444;
                        cursor: pointer;
                        &:hover {
                            background: #eeeeee;
                        }
                    }
                    > .base-icon {
                        font-size: 12px;
                        color: #444444;
                        cursor: pointer;
                        &:hover {
                            color: var(--mainColor);
                        }
                    }

                    /*比例列表*/
                    .scale_list {
                        position: absolute;
                        left: 50%;
                        bottom: calc(100% + 10px);
                        z-index: 20;
                        transform: translateX(-50%);
                        width: 120px;
                        height: 300px;
                        padding-top: 12px;
                        border: 1px solid #f4f4f4;
                        border-radius: 4px;
                        background: #ffffff;
                        overflow: hidden;
                        box-shadow: 0 0 5px 0 rgba(0, 0, 0, 0.1);
                        li:not(.input_scale) {
                            position: relative;
                            height: 30px;
                            line-height: 30px;
                            margin-bottom: 10px;
                            padding-left: 40px;
                            font-size: 12px;
                            color: #606060;
                            text-align: left;
                            cursor: pointer;
                            &:before {
                                content: '';
                                position: absolute;
                                top: 8px;
                                left: 14px;
                                display: inline-block;
                                width: 14px;
                                height: 14px;
                                border: 1px solid #9f9f9f;
                                border-radius: 14px;
                                background: #ffffff;
                            }
                            &:hover {
                                background: rgba(241, 241, 242, 0.5);
                            }
                            &.checked {
                                &:after {
                                    content: '';
                                    position: absolute;
                                    top: 13px;
                                    left: 19px;
                                    display: inline-block;
                                    width: 6px;
                                    height: 6px;
                                    border-radius: 6px;
                                    background: var(--mainColor);
                                }
                            }
                        }
                        .input_scale {
                            position: absolute;
                            height: 30px;
                            line-height: 30px;
                            padding-left: 16px;
                            margin-top: 5px;
                            text-align: left;
                            font-size: 12px;
                            color: #585858;
                            input {
                                display: inline-block;
                                width: 62px;
                                height: 24px;
                                margin-right: 6px;
                                padding-left: 6px;
                                border: 1px solid #d4d4d4;
                                border-radius: 4px;
                            }
                            i {
                                position: absolute;
                                left: 62px;
                                width: 0;
                                height: 0;
                                border-width: 4px;
                                border-style: solid;
                                border-color: #a0a0a0 transparent transparent
                                    transparent;
                                cursor: pointer;
                            }
                            i:nth-child(2) {
                                top: 4px;
                                transform: rotate(180deg);
                            }
                            i:nth-child(3) {
                                bottom: 3px;
                            }
                        }
                    }
                }
                .set-full-screen {
                    margin-right: 20px;
                    margin-left: 10px;
                    padding: 5px;
                    cursor: pointer;
                    &:hover {
                        background: #eeeeee;
                    }
                }
            }
            // 备注面板
            .note-panel {
                position: absolute;
                right: 0;
                bottom: 100%;
                z-index: 2;
                width: calc(100% - 164px);
                height: 110px;
                background: #ffffff;
                border: 1px solid #eeeeee;
                box-shadow: 0px -20px 20px 0px rgba(223, 225, 231, 0.2);
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
        }

        // 右侧格式面板
        .edit-right{
            position: absolute;
            top: 0;
            right: 0;
            height: calc(100% - 40px);
        }
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
    /*命名框*/
    &#doc_name:hover {
        color: #acb2c0;
        border: 1px solid transparent;
        border-radius: 2px;
    }
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
    /*文档页命名*/
    &.page_name:hover {
        border: 1px solid transparent !important;
    }
}
/*拖动手势*/
.grabbing {
    cursor: -webkit-grabbing !important;
}
/* 右键菜单 */
.right_menu {
    position: fixed;
    z-index: 10;
    width: 180px;
    border: 1px solid rgba(0, 0, 0, 0.08);
    border-radius: 4px;
    background: #ffffff;
    box-shadow: 5px 5px 5px 0 rgba(0, 0, 0, 0.08);
    user-select: none;
    .menu_item_bar {
        width: 100%;
        height: auto;
        padding: 5px 0;
        border-bottom: 1px solid #efefef;
        &:last-child {
            border: none;
        }
        .menu_item {
            position: relative;
            width: 100%;
            height: 34px;
            line-height: 34px;
            padding: 0 20px 0 54px;
            font-size: 14px;
            color: #5f6368;
            cursor: pointer;
            &:hover {
                background-color: #eef7fe;
            }
            &:before {
                content: '';
                position: absolute;
                top: 1px;
                left: 20px;
                display: inline-block;
                width: 30px;
                height: 32px;
                background: @background_image
                    no-repeat;
            }
            span {
                position: absolute;
                top: 0;
                right: 20px;
                display: inline-block;
                width: auto;
                height: 34px;
                line-height: 34px;
                font-size: 12px;
                &:hover {
                    background: transparent;
                }
            }
            /*通用右键菜单*/
            &.none_icon {
                &:before {
                    display: none;
                }
            }
            &.group_up {
                &:before {
                    background-position: -272px -236px;
                }
            }
            &.group_out {
                &:before {
                    background-position: -300px -236px;
                }
            }
            &.menu_cut {
                &:before {
                    background-position: -218px -236px;
                }
                &.useless {
                    color: #b5b9bd;
                    &:before {
                        background-position: -244px -236px;
                    }
                    &:hover {
                        background: transparent;
                    }
                }
            }
            &.menu_copy {
                &:before {
                    background-position: -218px -262px;
                }
                &.useless {
                    color: #b5b9bd;
                    &:before {
                        background-position: -244px -262px;
                    }
                    &:hover {
                        background: transparent;
                    }
                }
            }
            &.menu_paste {
                &:before {
                    background-position: -218px -288px;
                }
                &.useless {
                    color: #b5b9bd;
                    &:before {
                        background-position: -244px -262px;
                    }
                    &:hover {
                        background: transparent;
                    }
                }
            }
            &.menu_select {
                &:before {
                    display: none;
                }
            }
            &.menu_link {
                &:before {
                    display: none;
                }
            }
            &.menu_comment {
                &:before {
                    background-position: -270px -287px;
                }
            }
            &.menu_lock {
                &:before {
                    background-position: -270px -261px;
                }
            }
            &.menu_unlock {
                &:before {
                    background-position: -297px -261px;
                }
            }
            &.menu_delete {
                &:before {
                    background-position: -299px -290px;
                }
            }
            &.level_top {
                &:before {
                    display: none;
                }
            }
            &.level_bottom {
                &:before {
                    display: none;
                }
            }
            &.level_up {
                &:before {
                    display: none;
                }
            }
            &.level_down {
                &:before {
                    display: none;
                }
            }
            &.change_localimg {
                &:before {
                    display: none;
                }
                span {
                    position: initial;
                    width: 100%;
                    height: 34px;
                    line-height: 34px;
                    padding: 0;
                    font-size: 14px;
                    color: #5f6368;
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
            &.change_netimg,
            &.set_bgimg,
            &.download_img {
                &:before {
                    display: none;
                }
            }
            /*表格右键菜单*/
            &.add_left {
                height: 50px;
                span {
                    top: 18px;
                    left: 20px;
                    right: unset;
                }
                &:before {
                    background-position: -137px -45px;
                }
            }
            &.add_right {
                height: 50px;
                span {
                    top: 18px;
                    left: 20px;
                    right: unset;
                }
                &:before {
                    background-position: -175px -45px;
                }
            }
            &.add_top {
                height: 50px;
                span {
                    top: 18px;
                    left: 20px;
                    right: unset;
                }
                &:before {
                    background-position: -208px -46px;
                }
            }
            &.add_bottom {
                height: 50px;
                margin-bottom: 10px;
                span {
                    top: 18px;
                    left: 20px;
                    right: unset;
                }
                &:before {
                    background-position: -241px -48px;
                }
            }
            &.delete_row {
                &:before {
                    background-position: -274px -45px;
                }
            }
            &.delete_line {
                &:before {
                    background-position: -307px -46px;
                }
            }
            &.delete_table {
                &:before {
                    background-position: -340px -45px;
                }
            }
            &.merge_cel {
                &.disabled {
                    opacity: 0.5;
                    pointer-events: none;
                    cursor: default;
                }
                &:before {
                    background-position: -363px -69px;
                }
            }
            &.split_cel {
                &.disabled {
                    opacity: 0.5;
                    pointer-events: none;
                    cursor: default;
                }
                &:before {
                    background-position: -340px -69px;
                }
            }
        }
    }
    &.rich {
        width: 220px;
    }
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
    background: #ffffff;
    button {
        width: 44px;
        height: 36px;
        background-color: #ffffff;
        box-shadow: 0px 2px 5px 0px rgba(0, 0, 0, 0.07);
        border-radius: 2px;
        border: solid 1px rgba(186, 193, 206, 0.19);
        i:after {
            content: '';
            position: absolute;
            right: 6px;
            top: 17px;
            width: 0;
            height: 0;
            margin: 0 0 -2px 4px;
            border-width: 4px;
            border-style: solid;
            border-color: #999999 transparent transparent transparent;
        }
    }
    .menu_list {
        position: absolute;
        width: 110px;
        height: 90px;
        background-color: #ffffff;
        box-shadow: 0px 2px 5px 0px rgba(0, 0, 0, 0.07);
        border-radius: 2px;
        border: solid 1px rgba(186, 193, 206, 0.19);
    }
    ul {
        padding-top: 10px;
    }
    li {
        width: 100%;
        height: 34px;
        line-height: 34px;
        padding: 0 15px;
        font-size: 12px;
        color: #707b8e;
        cursor: pointer;
        &:hover {
            background-color: #eef7fe;
        }
    }
    i {
        margin-right: 6px;
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

/* 快捷键弹框 */
.keyboard_shortcuts_modal {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 22;
    text-align: center;
    .masking_wrapper {
        position: absolute;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.55);
        &:after {
            content: '';
            display: inline-block;
            vertical-align: middle;
            width: 0;
            height: 100%;
        }
    }
    .modal_main {
        position: relative;
        display: inline-block;
        vertical-align: middle;
        z-index: 21;
        width: 660px;
        height: 449px;
        margin: 0 auto;
        background-color: #fff;
        -webkit-box-shadow: 4px 3px 5px 0 rgba(0, 0, 0, 0.08);
        box-shadow: 4px 3px 5px 0 rgba(0, 0, 0, 0.08);
        border-radius: 2px;
        overflow: hidden;
        h1 {
            display: block;
            height: 56px;
            line-height: 56px;
            padding: 0 30px;
            margin: 0;
            font-size: 18px;
            color: #fff;
            text-align: left;
            background: var(--mainColor);
            font-weight: 500;
        }
        .close_btn {
            position: absolute;
            right: 15px;
            top: 20px;
            width: 20px;
            height: 20px;
            &:before {
                content: '';
                display: inline-block;
                width: 12px;
                height: 12px;
                background: @background_image
                    no-repeat -480px -5px;
                transition: all 0.3s;
            }
            &:hover:before {
                transform: rotate(180deg);
                transition: all 0.3s;
            }
        }
        .modal_left {
            display: inline-block;
            vertical-align: top;
            width: 135px;
            height: 100%;
            padding: 10px 0 0 30px;
            border-right: 1px solid #dadce0;
            p {
                width: 100%;
                height: 45px;
                line-height: 45px;
                text-align: left;
                font-size: 14px;
                color: #747985;
                cursor: pointer;
                &.current {
                    color: var(--mainColor);
                }
                &:hover {
                    color: var(--mainColor);
                }
            }
        }
        .keyboard_contain {
            display: inline-block;
            vertical-align: top;
            height: calc(100% - 56px);
            width: calc(100% - 135px);
            font-size: 0;
            overflow: hidden;
            ul {
                height: 100%;
                margin: 0;
                padding: 0 43px 20px 25px;
                overflow-y: scroll;
                &::-webkit-scrollbar {
                    width: 8px;
                    height: 8px;
                }
                &::-webkit-scrollbar:hover {
                    width: 10px;
                    height: 10px;
                }
                &::-webkit-scrollbar-track {
                    background: #fff;
                    cursor: pointer;
                }
                &::-webkit-scrollbar-thumb {
                    border-radius: 4px;
                    background: rgba(176, 181, 194, 0.5);
                }
                &::-webkit-scrollbar-thumb:hover {
                    background: rgba(176, 181, 194, 0.8);
                }
                &::-webkit-scrollbar-button {
                    background: #fff;
                    border-radius: 4px;
                }
                &::-webkit-scrollbar-corner {
                    background: #fff;
                }
            }
            li {
                display: block;
                width: 100%;
                font-size: 12px;
                color: #888d9b;
                border-bottom: 1px solid #dadce0;
                text-align: left;
                span {
                    display: inline-block;
                    height: 40px;
                    line-height: 50px;
                    &:nth-child(1) {
                        width: 40%;
                    }
                    &:nth-child(2) {
                        width: 60%;
                    }
                }
                &.bold span:nth-child(1) {
                    font-weight: bold;
                }
                &.italic span:nth-child(1) {
                    font-style: italic;
                }
                &.line span:nth-child(1) {
                    text-decoration: underline;
                }
            }
        }
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

/* 右侧评论面板 */
.commend_modal {
    position: fixed;
    top: 0;
    right: -270px;
    z-index: 10;
    width: 270px;
    height: 100%;
    background-color: rgba(250, 250, 250, 0.9);
    transition: right 0.3s;
    &.show {
        right: 0;
    }
    .comment_head {
        position: relative;
        width: 100%;
        height: 30px;
        .close {
            position: absolute;
            top: 0;
            right: 0;
            width: 30px;
            height: 30px;
            text-align: center;
            transform: scale(0.8);
            transition: all 0.3s;
            &:hover {
                transform: rotate(180deg) scale(0.8);
            }
        }
    }
    .comment_list {
        position: relative;
        width: 100%;
        height: calc(100% - 93px);
        padding: 10px 20px 20px 20px;
        overflow: hidden;
        overflow-y: auto;
        .commend_draft {
            position: relative;
            width: 250px;
            height: auto;
            padding: 12px 12px 4px;
            border: 1px solid #e8e8e8;
            border-radius: 4px;
            background: #ffffff;
            img {
                display: inline-block;
                width: 30px;
                height: 30px;
                margin-right: 10px;
                border-radius: 30px;
                vertical-align: top;
            }
            .draft_owner {
                display: inline-block;
                height: 30px;
                line-height: 30px;
                font-size: 12px;
                color: #767c8b;
                font-weight: bold;
            }
            .draft_content {
                display: block;
                width: 100%;
                line-height: 20px;
                margin-top: 30px;
                padding: 8px;
                border: 1px solid #dadce0;
                border-radius: 4px;
                font-size: 12px;
                color: #3c4043;
                font-family: 'Microsoft YaHei', 'PingFang SC', 'sans-serif';
                word-break: break-all;
                resize: none;
                overflow: hidden;
                &:focus {
                    border-color: var(--mainColor);
                }
            }
        }
        .comment_item {
            position: relative;
            top: 0;
            left: 0;
            width: 100%;
            height: auto;
            padding: 12px;
            background-color: #ffffff;
            border-radius: 4px;
            border: solid 1px #eaeef1;
            box-shadow: 0 0 0 0 transparent;
            transition: all 0.3s;
            cursor: pointer;
            & + .comment_item {
                margin-top: 18px;
            }
            &.check {
                left: -15px;
                box-shadow: -3px 4px 4px 0px rgba(0, 0, 0, 0.05);
            }
            img {
                position: absolute;
                top: 12px;
                left: 12px;
                width: 30px;
                height: 30px;
                border-radius: 30px;
            }
            .list_head {
                height: 36px;
                padding-left: 35px;
                p {
                    height: 20px;
                    line-height: 20px;
                    font-size: 12px;
                    color: #7f8593;
                    font-weight: bold;
                }
                span {
                    display: block;
                    height: 16px;
                    line-height: 16px;
                    font-size: 12px;
                    color: #bfc2c9;
                }
                .solve_commend {
                    position: absolute;
                    top: 13px;
                    right: 16px;
                    width: 33px;
                    height: 24px;
                    line-height: 24px;
                    border-radius: 4px;
                    background: #f3f3f3;
                    font-size: 12px;
                    color: #c0c1c5;
                    text-align: center;
                    &:hover {
                        background: var(--mainColor);
                        color: #ffffff;
                    }
                }
                .more_action {
                    position: absolute;
                    top: 15px;
                    right: 7px;
                }
            }
            .list_body {
                width: 100%;
                line-height: 20px;
                margin-top: 5px;
                padding-bottom: 16px;
                font-size: 12px;
                color: #686b74;
                white-space: pre-line;
                word-break: break-all;
            }
            .reply_list {
                position: relative;
                width: 100%;
                padding: 16px 0;
                border-top: 1px solid #ecedee;
                img {
                    top: 18px;
                    left: 0;
                }
                p,
                span {
                    padding-left: 35px;
                }
                span {
                    color: #bfc2c9;
                }
                div {
                    width: 100%;
                    line-height: 20px;
                    margin-top: 5px;
                    font-size: 12px;
                    color: #686b74;
                    white-space: pre-line;
                    word-break: break-all;
                }
                i {
                    position: absolute;
                    top: 16px;
                    right: 0;
                    height: 20px;
                    line-height: 20px;
                    font-size: 14px;
                    color: #686b74;
                    font-style: italic;
                    opacity: 0.5;
                    user-select: none;
                }
            }
        }
    }
    .comment_foot {
        height: 52px;
        line-height: 52px;
        margin-top: 10px;
        border-top: 1px solid #e6e6e6;
        text-align: center;
        cursor: pointer;
        &:hover {
            span {
                color: var(--mainColor);
            }
        }
        i {
            display: inline-block;
            vertical-align: middle;
            margin: 0 8px 3px 0;
            width: 16px;
            height: 16px;
            border-radius: 4px;
            border: 1px solid #e3e3e3;
            background: #fff;
        }
        span {
            color: #848383;
        }
    }
    &::-webkit-scrollbar-track {
        background-color: transparent;
    }
    &::-webkit-scrollbar-thumb {
        background-color: #464a55;
    }
}

.commend_modal {
    .sure_delete_comment {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        line-height: 100%;
        border-radius: 4px;
        background: rgba(0, 0, 0, 0.5);
        text-align: center;
        .delete_comment_inner {
            display: inline-block;
            width: 100%;
            height: 64px;
            line-height: initial;
            vertical-align: middle;
            p {
                margin-bottom: 20px;
                font-size: 14px;
                color: #ffffff;
            }
            a {
                display: inline-block;
                width: 54px;
                height: 24px;
                line-height: 24px;
                margin: 0 7px;
                border-radius: 4px;
                background: #ffffff;
                font-size: 12px;
                color: #b0b5c2;
                &:nth-child(3) {
                    background: var(--mainColor);
                    color: #ffffff;
                }
            }
        }
        &:after {
            content: '';
            position: relative;
            display: inline-block;
            width: 0;
            height: 100%;
            vertical-align: middle;
        }
    }
    .comment_more_action {
        position: absolute;
        top: 40px;
        right: 11px;
        z-index: 2;
        width: 80px;
        height: auto;
        padding: 10px 5px;
        border: 1px solid #ebebeb;
        border-radius: 2px;
        background: #ffffff;
        box-shadow: 2px 2px 3px 0 rgba(0, 0, 0, 0.2);
        div {
            height: 30px;
            line-height: 30px;
            font-size: 12px;
            color: #686b74;
            text-align: center;
            cursor: pointer;
            &:hover {
                background: #f5f8fe;
            }
            &:first-child {
                border-bottom: 1px solid #ebebeb;
            }
        }
    }
    .reedit_commend_bar {
        width: 100%;
        height: auto;
        margin-top: 10px;
        textarea {
            display: block;
            width: 100%;
            min-height: 40px;
            line-height: 20px;
            border: 1px solid #dadce0;
            border-radius: 4px;
            padding: 4px 8px;
            font-size: 12px;
            color: #3c4043;
            font-family: 'Microsoft YaHei', 'PingFang SC', 'sans-serif';
            word-break: break-all;
            resize: none;
            overflow: hidden;
            &:focus {
                border-color: var(--mainColor);
                outline: 1px solid var(--mainColor);
            }
        }
        .reedit_commend_btn {
            height: 40px;
            line-height: 40px;
            text-align: right;
            a {
                display: inline-block;
                width: 46px;
                height: 25px;
                line-height: 23px;
                border: 1px solid #e7e7e7;
                border-radius: 4px;
                font-size: 12px;
                color: #b0b5c2;
                text-align: center;
                &:first-child {
                    margin-right: 10px;
                    border-color: var(--mainColor);
                    background: var(--mainColor);
                    color: #ffffff;
                }
                &.unable {
                    border-color: #f4f4f5;
                    background: #f4f4f5;
                    color: #c0c1c5;
                    cursor: default;
                }
            }
        }
    }
    .reply_draft textarea {
        display: block;
        width: 100%;
        min-height: 40px;
        line-height: 20px;
        border: 1px solid #dadce0;
        border-radius: 4px;
        padding: 0 8px;
        font-size: 12px;
        color: #3c4043;
        font-family: 'Microsoft YaHei', 'PingFang SC', 'sans-serif';
        word-break: break-all;
        resize: none;
        overflow: hidden;
        &:focus {
            border-color: var(--mainColor);
            outline: 1px solid var(--mainColor);
        }
    }
    .draft_btn {
        height: 40px;
        line-height: 40px;
        text-align: right;
        a {
            display: inline-block;
            width: 46px;
            height: 25px;
            line-height: 23px;
            border: 1px solid #e7e7e7;
            border-radius: 4px;
            font-size: 12px;
            color: #b0b5c2;
            text-align: center;
            &:first-child {
                margin-right: 10px;
                border-color: var(--mainColor);
                background: var(--mainColor);
                color: #ffffff;
            }
            &.unable {
                border-color: #f4f4f5;
                background: #f4f4f5;
                color: #c0c1c5;
                cursor: default;
            }
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
        &.close {
            width: 0;
        }
    }

    .edit_body.left_close {
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
import loginModal from '@/components/LoginModal.vue';
import format_panel from '@/views/pc/EditView/FormatPanel.vue';
import MaterialLibrary from '@/views/pc/EditView/MaterialLibrary.vue';
import media_panel from '@/views/pc/EditView/MediaPanel.vue';
import CreateTool from '@/views/pc/EditView/CreateToolPanel.vue';
import animation_modal from '@/views/pc/EditView/AnimationPanel.vue';
import sort_page_modal from '@/views/pc/EditView/SortPageModal.vue';
import name_modal from '@/components/NameModal.vue';
import share_modal from '@/components/ShareModal.vue';
import delete_modal from '@/components/DeleteModal.vue';
import loading_masking from '@/components/LoadingMasking.vue';
import MyColor from '@/views/pc/EditView/MyColorModal.vue';
import CommonColor from '@/views/pc/EditView/CommonColor.vue';
import GradientColor from '@/views/pc/EditView/GradientColor.vue';
import BackgroundSetting from '@/views/pc/EditView/BackgroundSettingPanel.vue';
import theme_modal from '@/views/pc/EditView/ThemeModal.vue';
import error_feedback from '@/components/ErrorFeedback.vue';
import h5_preview from '@/components/H5Preview.vue';
import import_modal from '@/components/ImportModal.vue';
import export_modal from '@/components/ExportModal.vue';
import PublishCategory from '@/components/PublishCategory.vue';
import slides_document from './Slides/SlidesDocument.vue';
import opt_factory from '@/assets/pc/js/opt/opt_factory.js';
import operate_opt from '@/assets/pc/js/opt/operate_opt.js';
import page_opt from '@/assets/pc/js/opt/page_opt.js';
import editor_opt from '@/assets/pc/js/opt/editor.js';
import document_save from '@/assets/pc/js/document_save.js';
import document_save_error from '@/assets/pc/js/document_save_error.js';
import document_command from '@/assets/pc/js/document_command.js';
import edit_directive from '@/assets/pc/js/edit_directive.js'
import ws_client from '@/assets/common/js/ws_client.js'
import collaborate from '@/assets/common/js/collaborate.js'
import font_family_array from '@/assets/font/fontFamily.js';
import { edit_shape_point } from '@/assets/pc/js/opt/shape_edit_opt.js';
import { edit_line_point, draw_line_path } from '@/assets/pc/js/opt/line_edit_opt.js';
import sdk_api from '@/assets/sdk/api.js';
import member_rankauthorities from '@/assets/common/js/member_rankauthorities.js';
import document_old_data_handler from '@/assets/common/js/document_old_data_handler.js';
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
        MyColor,             // 我的颜色
        CommonColor,         // 拾色器
        GradientColor,       // 渐变色设置
        loading_masking,     // 入场动画
        CreateTool,         // 元素工具面板
        format_panel,        // 格式面板
        sort_page_modal,     // 序列表
        theme_modal,         // 主题弹框
        media_panel,         // 媒体面板
        animation_modal,     // 动画弹框
        BackgroundSetting,   // 背景色设置
        MaterialLibrary,    // 素材库
        name_modal,          // 创建副本
        share_modal,         // 共享弹框
        delete_modal,        // 删除弹框
        error_feedback,      // 报错反馈
        import_modal,        // 导入弹框
        export_modal,        // 导出弹窗
        h5_preview,          // h5样式
        slides_document,     // 文档演示
        loginModal,          // 登录弹框
        PublishCategory,     // 设计师发布作品分类的递归组件
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
            // 加载状态
            document_loadready: false,
            document_loaddone: false,
            // 左上角列表展示状态
            right_menu_show: false,
            // 定时器id队列
            timer_id_stack: {},
            // 文档观察者
            document_observer: null,
            // 艺术字观察者 
            art_text_observer: null,
            // 文档列表
            document_list: [],
            // 当前文件夹id
            current_folder_info: {},
            // 空文件夹标识
            doc_empty: false,
            // 文件夹列表
            pre_folder_list: [],
            //最近使用文档
            recently_used_folder_list: [],
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
            // 文档所有页备注列表
            document_note_list: [],
            // 文档标题
            document_info_title: null,
            // 当前文档页标题
            page_info_title: null,
            // 备注集合
            note_collect: {
                // 当前编辑文档页id
                id: null,
                // 定时器
                timer: null
            },
            // 备注输入框显示
            show_page_note: false,
            // 命名框长度
            title_width: 200,
            // 当前模板信息
            modal_id: null,
            // 是否使用主题颜色标识
            use_theme: false,
            // 副本保存位置
            target_folder_info: {},
            edit_mode: '',
            preset_id: null,

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

            /*
            *   画布状态标识 page_state
            *   正常状态 => common
            *   编辑元素 => edit_element
            *   框选画布 => box_select
            *   创建文本 => create_text
            *   创建线条 => create_line
            *   创建形状 => create_shape
            *   预插入状态 => preinsert_layer
            * */
            page_state: 'common',
            // 鼠标悬浮画布标识
            page_hover: false,

            // 顶部操作栏
            // 演示设置
            demo_options_show: false,

            // 底部工具栏相关
            // 画布缩放下拉标识
            show_scale_list: false,
            // 页码列表标识
            show_page_number_list: false,
            // 画布缩放列表数据
            scale_list: [
                { name: '400%', scale: 4, checked: false },
                { name: '200%', scale: 2, checked: false },
                { name: '100%', scale: 1, checked: false },
                { name: '80%', scale: 0.8, checked: false },
                { name: '50%', scale: 0.5, checked: false },
                { name: '适配屏幕', scale: null, checked: true }
            ],
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

            // 文档页设置相关
            show_page_background: false,

            // 右键编辑栏，右键类型： false(关闭) | page(画布) | element(元素),
            show_right_menu: false,
            right_menu_top: 0,
            right_menu_left: 0,
            selection_text_menu: false,
            contenteditable_focus_menu: false,
            // 表格专属菜单
            table_row_list: [
                { name: '在左侧插入列', data: 'add_left', key_code: 'Ctrl + Alt + ←' },
                { name: '在右侧插入列', data: 'add_right', key_code: 'Ctrl + Alt + →' },
                { name: '在上方插入行', data: 'add_top', key_code: 'Ctrl + Alt + ↑' },
                { name: '在下方插入行', data: 'add_bottom', key_code: 'Ctrl + Alt + ↓' },
                { name: '合并单元格', data: 'merge_cel', disable: false },
                { name: '取消合并单元格', data: 'split_cel', disable: false },
                { name: '删除行', data: 'delete_row' },
                { name: '删除列', data: 'delete_line' },
                { name: '删除表格', data: 'delete_table' }
            ],

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
            // 粘贴文本去除格式工具标识
            paste_textformat_map: {},
            show_paste_clean: false,
            show_paste_clean_list: false,
            before_clean_html: [],
            text_clean_info: {
                top: "",
                left: ""
            },

            // 锁定元素双击
            dblclick_flag: false,
            //光标定位
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

            // 剪切板相关
            clipboard_paste: false,
            fictitious_copy_text: '',    // 隐藏剪贴按钮文案
            // 剪贴板粘贴数量限制
            clipboard_paste_action: 0,
            clipboard_paste_count: 0,
            clipboard_paste_max_count: 20,//连续粘贴元素最大次数

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

            // 快捷键列表
            keyboards: [
                {
                    title: '文字格式',
                    keys: [
                        { name: "加粗", key: "Ctrl + B", class: 'bold' },
                        { name: "斜体", key: "Ctrl + I", class: 'italic' },
                        { name: "下划线", key: "Ctrl + U", class: 'line' },
                        // {name:"字号", key:"Ctrl + Shift + ↑/↓"},
                        { name: "行高", key: "Ctrl + ↑/↓" },
                        { name: "超链接", key: "Ctrl + K" },
                        { name: "居左", key: "Ctrl + Shift + ←" },
                        { name: "居中", key: "Ctrl + Shift + /" },
                        { name: "居右", key: "Ctrl + Shift + →" },
                    ]
                },
                {
                    title: '编辑',
                    keys: [
                        { name: "撤销", key: "Ctrl + Z" },
                        { name: "恢复", key: "Ctrl + Y" },
                        { name: "剪切", key: "Ctrl + X" },
                        { name: "复制", key: "Ctrl + C" },
                        { name: "粘贴", key: "Ctrl + V" },
                        { name: "复制并粘贴", key: "Ctrl + D" },
                        { name: "快速复制", key: "Alt + 鼠标拖拽" },
                        { name: "组合", key: "Ctrl + G" },
                        { name: "拆分", key: "Ctrl + Shift + G" },
                        { name: "左移", key: "←" },
                        { name: "右移", key: "→" },
                        { name: "上移", key: "↑" },
                        { name: "下移", key: "↓" },
                        { name: "快捷左移", key: "Shift + ←" },
                        { name: "快捷右移", key: "Shift + →" },
                        { name: "快捷上移", key: "Shift + ↑" },
                        { name: "快捷下移", key: "Shift + ↓" },
                        { name: "左对齐", key: "Ctrl + Alt + 1" },
                        { name: "水平居中", key: "Ctrl + Alt + 2" },
                        { name: "右对齐", key: "Ctrl + Alt + 3" },
                        { name: "顶对齐", key: "Ctrl + Shift + U" },
                        { name: "垂直居中", key: "Ctrl + Shift + I" },
                        { name: "底对齐", key: "Ctrl + Shift + O" },
                        { name: "表格左侧插入列", key: "Ctrl + Alt + ←" },
                        { name: "表格右侧插入列", key: "Ctrl + Alt + →" },
                        { name: "表格上方插入行", key: "Ctrl + Alt + ↑" },
                        { name: "表格下方插入行", key: "Ctrl + Alt + ↓" },
                        // {name:"水平等间距", key:"Ctrl + Shift + R"},
                        // {name:"垂直等间距", key:"Ctrl + Shift + T"},
                    ]
                },
                {
                    title: '操作',
                    keys: [
                        { name: "全选", key: "Ctrl + A" },
                        { name: "保存", key: "Ctrl + S" },
                        { name: "演示", key: "Ctrl + F" },
                        // {name:"打印", key:"Ctrl + P"},
                        { name: "保存历史版本", key: "Ctrl + Alt + S" },
                    ]
                }
            ],
            show_keyboards_shortcuts: false,
            keyboards_index: 0,

            // 保存为模板相关
            save_template: false,
            btn_confirm_disabled: false,     //按钮状态
            template_title: '',
            template_limit: [
                { name: '仅支持自己使用', authority: 'privacy', checked: true },
                { name: '支持网友使用', authority: 'open', checked: false }
            ],

            // 元素超链接相关
            show_ele_link_modal: false,  //显示超链接工具栏标识
            show_link_tool: false,      //显示超链接工具栏标识
            show_link_change_modal: false,
            can_change_link: false,
            can_change_text: true,
            current_link_dom: "",
            ele_link_info: {
                text: "",
                href: "",
                top: "",
                left: ""
            },    //当前超链接信息


            // 长时间未操作相关
            show_reload_tips: false,
            // 操作为保存相关
            show_save_tips: false,
            reload_interval: null,

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
            partner_online: {},                           // 在线协作者map
            partner_online_list: [],                      // 在线协作者list
            show_more_online: false,                      // 显示更多在线协作者标识
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
            sending_comment: false,     // 正在发布评论标识
            comment_draft: '',          // 发布评论草稿
            sending_reply: false,       // 正在发布回复标识
            reply_draft: '',            // 评论回复草稿
            show_comment_panel: false,  // 评论弹框标识
            show_eidt_number: false,  // 编辑次数的弹框
            un_read_comment: false,     // 顶栏评论未读标识
            right_comment_close: false,  // 右侧评论面板是否被手动关闭
            show_right_comment: false,  // 右侧讨论弹框标识
            show_add_comment: false,    // 右侧添加新评论编辑框标识
            comment_list: [],           // 全部评论列表
            right_comment_list: [],     // 右侧评论列表
            right_all_comment_list: [],  // 右侧全部评论列表
            comment_element_id: [],     // 右侧评论列表对应元素id

            // 媒体
            show_media_toolbar: false,
            // 动画元素标记列表
            animation_mark_list: [],

            // 演示预览
            show_slides_preview: false,

            // 顶部视图相关
            full_screen_edit: false,         // 全屏编辑标识
            show_format_panel: true,        // 格式面板展示标识
            current_view_option: null,

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

            //是否为设计师，控制是否能发布作品
            is_designer: false,
            current_template_type: null,
            template_category_list: [],   // 模板分类列表 
            current_template_category: { name: null, id: null }, // 选中的模板分类
            current_tag_list: [],  // 选中的标签
            tag_list: {},           // 全部标签列表 
            show_unlock: false,    // 是否显示解锁图标
        }
    },
    filters: {
        get_page_number: function (uuid, document_page_list) {
            let pageNumber = 1;
            if (uuid === null || document_page_list === null || document_page_list.length === 0) {
                return pageNumber;
            }
            for (let i = 0; i < document_page_list.length; i++) {
                if (uuid === document_page_list[i].uuid) {
                    pageNumber = i + 1;
                    break;
                }
            }
            return pageNumber;
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
        // 右键菜单定位
        show_right_menu(n, o) {
            // 菜单隐藏状态重置其他状态
            if (o) {
                this.right_menu_top = -9999;
                this.right_menu_left = -9999;
                this.selection_text_menu = false;
                this.contenteditable_focus_menu = false;
            }
        },
        page_state(n, o) {
            // 从元素预插入定位状态退出清除网格线
            if (o === 'preinsert_layer') {
                this.toggle_grid_display();
            }
        },
        'page_info.id'(n, o){
            if(!n) return;
            this.updateNote();
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
        // 判断当前页是否有备注
        is_has_note(){
            let item = this.document_note_list.find(v => v.documentPage === this.page_info.id);
            return item && item.content;
        },
        // 备注内容
        page_info_note(){
            let note_item = this.document_note_list.find(v => v.documentPage === this.page_info.id);
            return note_item ? note_item.content : '';
        }
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
        // 粘贴监听 (isSimulation 是否为模拟操作)
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
            // 模拟粘贴忽略富文本
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
            else if (is_editable) {
                switch (paste_obj.type) {
                    case 'text':
                        if (window.getComputedStyle($(":focus")[0]).fontSize === '0px') {
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
                        break;
                    default:
                        event.preventDefault();
                        break;
                }
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
                        that.ele_paste({ list: [text_obj], outside: true }, { center: true });
                        break;
                    // 生成svg元素
                    case 'svg':
                        let shape_opt = opt_factory.init_opt('shape'),
                            shape_obj = shape_opt.format_paste_shape(paste_obj.text).element_list;
                        shape_obj.forEach(item => {
                            item = that.ele_build_before_format(item);
                        });
                        that.ele_paste({ list: shape_obj }, { center: true, resize: true });
                        break;
                    // 生成表格元素
                    case 'table':
                        let table_opt = opt_factory.init_opt('table'),
                            table_obj = table_opt.format_paste_table(paste_obj.text, paste_obj.value);
                        table_obj = that.ele_build_before_format(table_obj);
                        // 生成表格对象
                        let table = table_opt.build_obj(table_obj, that);
                        that.ele_paste({ list: [table] }, { center: true });
                        break;
                    // 生成站内元素
                    default:
                        let deviation = false;
                        let ele_opt = paste_obj.value;
                        if (typeof ele_opt.list === 'string') ele_opt.list = JSON.parse(ele_opt.list);
                        // 判断是否在当前页（当前页需设置偏移）
                        if (ele_opt.pageUuid == that.page_info.uuid) deviation = true;
                        that.ele_paste(ele_opt, { deviation: deviation });
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
            // h5弹窗演示
            if (that.$refs.h5_preview && that.$refs.h5_preview.get_show()) return;
            // 错误反馈弹窗
            if (that.$refs.error_feedback && that.$refs.error_feedback.get_is_show()) return;

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
                        group_opt.ele_set_weight($checked);
                        operate_opt.reset_rect($checked);
                        that.element_message.font_weight = group_opt.get_edit_message($checked).font_weight;
                        e.preventDefault();
                        break;
                    // ctrl + f 演示 默认从头开始
                    case 70:
                        that.show_doc_display(true);
                        e.preventDefault();
                        break;
                    // Ctrl + I 斜体
                    case 73:
                        group_opt.ele_set_italic($checked);
                        operate_opt.reset_rect($checked);
                        that.element_message.font_style = group_opt.get_edit_message($checked).font_style;
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
                    // Ctrl + U 下划线
                    case 85:
                        group_opt.ele_set_underline($checked);
                        operate_opt.reset_rect($checked);
                        that.element_message.text_decoration = group_opt.get_edit_message($checked).text_decoration;
                        e.preventDefault();
                        break;
                    // Ctrl + → 文本缩进
                    case 39:
                        editor_opt.set_indent();
                        e.preventDefault();
                        break;
                    // Ctrl + ↑ 增大行高
                    case 38:
                        group_opt.ele_set_lineHeight($checked, 'up');
                        operate_opt.reset_rect($checked);
                        that.element_message.line_height = $checked.find('.show_text').eq(0)[0].style.lineHeight;
                        e.preventDefault();
                        break;
                    // Ctrl + ↓ 缩小行高
                    case 40:
                        group_opt.ele_set_lineHeight($checked, 'down');
                        operate_opt.reset_rect($checked);
                        that.element_message.line_height = $checked.find('.show_text').eq(0)[0].style.lineHeight;
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
                    // ctrl + d 复制粘贴
                    case 68:
                        that.ele_copy(e, true);
                        e.preventDefault();
                        break;
                }
                /**
                 * 富文本内快捷键--------------------------------------------------
                 */
                if (has_focus) {
                    switch (code) {
                        // Ctrl + K 超链接
                        case 75:
                            that.right_menu_link();
                            e.preventDefault();
                            break;
                    }
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
                    // Ctrl + Shift + ← 文本左对齐
                    case 37:
                        group_opt.ele_set_align($checked, 'left');
                        e.preventDefault();
                        break;
                    // Ctrl + Shift + / 文本居中对齐
                    case 191:
                        group_opt.ele_set_align($checked, 'center');
                        e.preventDefault();
                        break;
                    // Ctrl + Shift + → 文本右对齐
                    case 39:
                        group_opt.ele_set_align($checked, 'right');
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
                        // ctrl + shift + G 拆分
                        case 71:
                            if (get_checked_ele.group) {
                                that.set_ele_group();
                                that.ele_cancel_checked();
                            }
                            e.preventDefault();
                            break;
                        // Ctrl + shift + U 顶对齐
                        case 85:
                            group_opt.ver_align('top');
                            // 更新虚线框
                            operate_opt.reset_rect($checked);
                            // 更新message位置
                            common_message = option.get_common_message($checked);
                            that.element_message.x = common_message.x;
                            that.element_message.y = common_message.y;
                            e.preventDefault();
                            break;
                        // Ctrl + shift + I 垂直居中
                        case 73:
                            group_opt.ver_align('middle');
                            // 更新虚线框
                            operate_opt.reset_rect($checked);
                            // 更新message位置
                            common_message = option.get_common_message($checked);
                            that.element_message.x = common_message.x;
                            that.element_message.y = common_message.y;
                            e.preventDefault();
                            break;
                        // Ctrl + shift + O 底对齐
                        case 79:
                            group_opt.ver_align('bottom');
                            // 更新虚线框
                            operate_opt.reset_rect($checked);
                            // 更新message位置
                            common_message = option.get_common_message($checked);
                            that.element_message.x = common_message.x;
                            that.element_message.y = common_message.y;
                            e.preventDefault();
                            break;
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
            }
            /**
             * ctrl + alt + code --------------------------------------------------
             */
            if (ctrl && !shift && alt) {
                /**
                 * 始终触发的快捷键 --------------------------------------------------
                 */
                switch (code) {
                    // Ctrl + Alt + E  页面报错反馈
                    case 69:
                        that.$refs.error_feedback && that.$refs.error_feedback.submit_error_feedback_for_aliyun_log();
                        e.preventDefault();
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
                    let common_message;
                    switch (code) {
                        // Ctrl + Alt + 1 左对齐
                        case 97:
                        case 49:
                            group_opt.hor_align('left');
                            // 更新虚线框
                            operate_opt.reset_rect($checked);
                            // 更新message位置
                            common_message = option.get_common_message($checked);
                            that.element_message.x = common_message.x;
                            that.element_message.y = common_message.y;
                            e.preventDefault();
                            break;
                        // Ctrl + Alt + 2 水平居中
                        case 98:
                        case 50:
                            group_opt.hor_align('center');
                            // 更新虚线框
                            operate_opt.reset_rect($checked);
                            // 更新message位置
                            common_message = option.get_common_message($checked);
                            that.element_message.x = common_message.x;
                            that.element_message.y = common_message.y;
                            e.preventDefault();
                            break;
                        // Ctrl + Alt + 3 右对齐
                        case 99:
                        case 51:
                            group_opt.hor_align('right');
                            // 更新虚线框
                            operate_opt.reset_rect($checked);
                            // 更新message位置
                            common_message = option.get_common_message($checked);
                            that.element_message.x = common_message.x;
                            that.element_message.y = common_message.y;
                            e.preventDefault();
                            break;
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
             * shift + code --------------------------------------------------
             */
            if (!ctrl && shift && !alt) {
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
                    }
                    return;
                }
            }
            /**
             * code --------------------------------------------------
             */
            if (!ctrl && !shift && !alt) {
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
                if (code === 32 && that.page_hover) {
                    e.preventDefault();
                    this.page_state = 'drag_page';
                    document.addEventListener('mousedown', that.drag_page_listener);
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
        input_listener: function () {
            let that = this,
                $ele = $('.page_contain .ele_item.checked'),
                type = $ele.attr('data-type'),
                option = opt_factory.init_opt(type);
            // 错误状态判断
            if ($ele.length > 1) return false;
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
        },
        // 浏览器窗口监听
        resize_listener: function (event) {
            let that = this;
            // 裁剪时不触发
            if (!that.$refs.format_panel.begin_clip) {
                // 更新主题弹框
                let window_w = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
                // 取消选中
                that.ele_cancel_checked();
                // 重新计算画布缩放
                page_opt.save_page_offset();
                // 更新屏幕最佳比例
                that.compute_suitable_scale();
                // 更新全屏编辑状态
                let is_full = (document.fullScreenElement && document.fullScreenElement !== null) || document.mozFullScreen || document.webkitIsFullScreen;
                if (!is_full) that.full_screen_edit = false;
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
            // 右键菜单关闭
            that.show_right_menu = false;
            // 隐藏页码列表
            that.show_page_number_list = false;
            // 隐藏比例列表
            that.show_scale_list = false;
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
            // 点击范围不是左上角按钮且不是左上角下拉面板时清除状态
            if (!$(event.target).parents('.head-logo').length && !$(event.target).parents('.menu-list').length) {
                that.right_menu_show = false;
            }
            // 点击范围不是文件面板且不是视图面板时清除状态
            if (!($(event.target).hasClass('doc-down')||$(event.target).parents('.doc-down').length) && !$(event.target).parents('.view-panel').length) {
                that.current_view_option = null;
            }
            // 点击范围不是编辑次数面板时清除状态
            if (!($(event.target).hasClass('.edit-count-panel') || $(event.target).parents('.edit-count-panel').length)) {
                that.show_eidt_number = false;
            }
            // 隐藏头部评论弹框
            that.show_comment_panel = false;
            // 隐藏更多在线协作者面板
            that.show_more_online = false;
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
            let window_w = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
            let window_h = window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight;
            let top = e.clientY + 10;
            let left = e.clientX + 20;
            let $target = $(e.target);
            // 初始化
            e.preventDefault();
            that.show_right_menu = false;
            // 恢复元素绘制状态
            if (['create_text', 'create_line', 'create_shape'].indexOf(that.page_state) >= 0) {
                that.page_state = 'common';
            }
            // 序列表右键点击
            let is_sortlist = $target.hasClass('svg_content') || $target.parents('.svg_content').length;
            if (is_sortlist) {
                that.$refs.sort_page_modal.showRightMenu(e);
                return;
            }
            // 画布操作 & 元素操作
            if (!$target.parents('#page.page').length && !$target.parents('#operate.operate').length) {
                return;
            }
            // 重置状态
            that.had_format_painter = false;
            that.format_painter_style = null;
            that.$refs.format_panel.hide_all_list();
            that.$refs.create_tool.clear_tool_status();
            that.$refs.sort_page_modal.preset_modal_show = false;
            that.current_view_option = null;
            that.demo_options_show = false;
            that.show_comment_panel = false;
            // 当前页无操作权限
            if (that.user_disable_edit) {
                return;
            }
            let is_element = !!($target.parents('#edit_page').length && $target.parents('.ele_item').length);
            let is_child = !!($target.parents('.group_child').length && $target.hasClass('child'));
            let is_operate = $target.hasClass('operate_border');
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
                that.show_right_menu = 'element';
                // 表格元素点击非元素节点单元格失焦
                if (that.element_type === 'table' && !is_element) {
                    $ele.find('[contenteditable="true"]:focus').blur();
                }
                let selection = window.getSelection ? window.getSelection() : document.selection.createRange().text;
                that.selection_text_menu = !!($ele.find('[contenteditable="true"]').length && selection && selection.type === 'Range' && !selection.isCollapsed);
                that.contenteditable_focus_menu = !!($ele.find(':focus').length && selection && selection.isCollapsed);
                // 表格菜单单独处理
                if (that.element_type === 'table') {
                    // 合并拆分按钮状态
                    let option_table = opt_factory.init_opt('table');
                    let $cel_selectlist = option_table.get_edit_cel($ele);
                    let merge_cel = 0;
                    $cel_selectlist.each((i, item) => {
                        option_table.get_merge_cel($(item), $ele, () => {
                            merge_cel++;
                        });
                    });
                    let merge = that.table_row_list.find(item => item.data === 'merge_cel');
                    let split = that.table_row_list.find(item => item.data === 'split_cel');
                    merge.disable = false;
                    split.disable = false;
                    switch (true) {
                        // 选中单个单元格  -->  不可合并，不可拆分
                        case $cel_selectlist.length === 1:
                            merge.disable = true;
                            split.disable = true;
                            break;
                        // 所选单元格不存在合并单元格  -->  可合并，不可拆分
                        case merge_cel === 0:
                            split.disable = true;
                            break;
                        // 所选单元格已全部合并  -->  不可合并，可拆分
                        case merge_cel + 1 === $cel_selectlist.length:
                            merge.disable = true;
                            break;
                    }
                    // 选中单元格右键
                    if ($ele.find('td.cel_selected').length) {
                        that.contenteditable_focus_menu = true;
                        that.selection_text_menu = false;
                    }
                }
            } else {
                // 清除元素选中状态
                that.ele_cancel_checked();
                // 清除背景设置弹窗
                that.show_page_set = false;
                that.show_right_menu = 'page';
            }
            // 设置菜单定位位置
            that.$nextTick(() => {
                let $menu = $('.edit_operation .right_menu');
                let menu_left = left;
                let width = $menu.width();
                if (menu_left + width > window_w) {
                    menu_left = window_w - width;
                }
                if (menu_left < 0) {
                    menu_left = 0;
                }
                let menu_top = top;
                let height = $menu.height();
                if (menu_top + height > window_h) {
                    menu_top = window_h - height;
                }
                if (menu_top < 0) {
                    menu_top = 0;
                }
                that.right_menu_top = menu_top;
                that.right_menu_left = menu_left;
            });
        },
        /*全局方法 end*/

        /** 右键菜单相关方法 */
        // 添加链接
        right_menu_link: function () {
            let that = this;
            let $ele = $('.page_contain .ele_item.checked');
            let range;
            let selection = window.getSelection ? window.getSelection() : document.selection.createRange().text;
            that.ele_link_info = {};
            if (that.element_type === 'text') {
                that.selection_text_menu = !!($ele.find('[contenteditable="true"]').length && selection && selection.type === 'Range' && !selection.isCollapsed);
                if (that.selection_text_menu) {
                    that.$nextTick(() => {
                        that.ele_link_info.text = window.getSelection().getRangeAt(0);
                    })
                }
            }
            that.show_link_modal();
        },
        // 删除
        right_menu_delete: function () {
            let that = this;
            if (that.selection_text_menu) {
                document.execCommand('delete');
                return;
            }
            that.ele_delete();
        },
        // 全选
        right_menu_selectall: function () {
            let that = this;
            if (that.contenteditable_focus_menu || that.selection_text_menu) {
                document.execCommand('selectAll');
                return;
            }
            that.ele_selectAll();
        },

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
                    top_comment_list = that.comment_list,
                    right_comment_list = that.right_comment_list;
                switch (type) {
                    case 'add':
                        top_comment_list.unshift(content);
                        right_comment_list.unshift(content);
                        that.un_read_comment = true;
                        break;
                    case 'modify':
                        // 修改头部评论列表
                        top_comment_list = page_opt.fn.clone_object(top_comment_list);
                        let top_comment = top_comment_list.filter(item => item.id === content.id)[0];
                        top_comment = Object.assign(top_comment, content);
                        that.comment_list = top_comment_list;
                        // 修改右侧评论列表
                        right_comment_list = page_opt.fn.clone_object(right_comment_list);
                        let right_comment = right_comment_list.filter(item => item.id === content.id);
                        if (content.isSolve) {
                            that.right_comment_list = right_comment_list.filter(item => item.id !== content.id);
                        } else {
                            if (right_comment.length <= 0) {
                                right_comment_list.push(content);
                                right_comment_list.sort(function (a, b) {
                                    return b.createDate - a.createDate
                                });
                            } else {
                                right_comment = Object.assign(right_comment[0], content);
                            }
                            that.right_comment_list = right_comment_list;
                        }
                        that.un_read_comment = true;
                        break;
                    case 'delete':
                        that.comment_list = top_comment_list.filter(item => item.id !== content);
                        that.right_comment_list = right_comment_list.filter(item => item.id !== content);
                        break;
                }
            } catch (e) {
                console.error(e);
            }
        },
        // 协作者在线
        ws_set_doc_online_members: function (data) {
            try {
                let that = this;
                if (that.document_info.id === '') return false;
                if (!data[that.document_info.id]) return false;
                that.partner_online = data[that.document_info.id];
                that.partner_online_list = Object.values(that.partner_online);
            } catch (e) {
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
                that.document_loadready = true;
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
                    that.document_info.modifyDate = '最近保存' + utils.returnRelativeTime(that.document_info.modifyDate);
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
                // 关闭加载状态
                that.document_loaddone = true;
                // 画布渲染完成
                that.$nextTick(() => {
                    // 计算页面比例
                    that.compute_suitable_scale();
                    // 初始化文档其他数据
                    that.init_document_other_data();
                    // 文档保存流程开始
                    document_save.method.ready(that);
                    // 初始化网格功能
                    that.init_canvas_grid();
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
                        //获取全部协作者个数
                        that.get_partner_count();
                        //获取当前用户权限
                        that.get_user_authority();
                        //获取幻币信息
                        that.get_edit_doc_hcoin();
                        // 获取评论数
                        that.get_comment_count(data.data.data.document.id);
                        // 获取文档备注
                        that.getDocumentNote();
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
                    that.document_loadready = true;
                    if (!page) {
                        page_info.title = `自定义版式${window.parent.custom_preset_list.length + 1}`;
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
            let that = this;
            //文档标题
            that.document_info_title = that.document_info.title;
            //文档页标题
            that.page_info_title = that.page_info.title;
            that.$nextTick(function () {
                //文档标题长度计算
                that.calculate_title_width();
            });
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
                        if (value > 2) {
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
            that.$toast("保存成功", 1000, function () {
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
        //文档、文档页标题聚焦
        focus_title: function () {
            let that = this;
            that.document_info_title = $('#doc_name').val();
            that.page_info_title = $('#page_name').val();
        },
        //文档、文档页标题输入监听
        input_title: function (event, is_page) {
            let that = this,
                e = event || window.event;
            that.document_info_title = $('#doc_name').val();
            that.page_info_title = $('#page_name').val();
            if (that.is_composition) {
                return;
            }
            if (is_page) {
                return;
            }
            that.calculate_title_width();

        },
        //文档、文档页标题输入失焦
        blur_title: function () {
            $('#doc_name').blur();
            $('#page_name').blur();
        },
        //设置文档、文档页标题
        set_title: function (is_page) {
            let that = this;
            if (!that.user.login) return that.$toast('请登录后再进行此操作~', 1500);
            if (!is_page) {
                page_opt.set_document_title(that);
            } else {
                page_opt.set_title(that, that.page_info.uuid, that.page_info_title);
            }
        },
        // 文档备注显示和切换
        toggleDocumentNote() {
            let { id } = this.document_info;
            if (this.modal_id || $validate(id).empty()) {
                return this.$toast("编辑幻灯片后才可以编辑备注哦");
            }
            this.show_page_note = !this.show_page_note;
        },
        // 获取文档备注
        getDocumentNote() {
            let docId = this.document_info.id;
            this.$axios.get(`/api/member/document_remark/get_remarks/`, { params: { docId } }).then(res => {
                let { code, data } = res.data;
                if (!(code == 2 || data.length)) return;
                this.document_note_list = data;
                this.updateNote();
            });
        },
        // 保存文档备注
        saveDocumentNote(docId, pId, content) {
            if (this.document_note_list.length > 0) {
                let note_item = this.document_note_list.find(v => v.documentPage === pId);
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
                if(code !== '2') return this.$toast('保存备注出错！', 2000);
                let note_index = this.document_note_list.findIndex(v => v.documentPage === pId);
                if(note_index !== -1){
                    this.document_note_list[note_index].content = content;
                }else{
                    this.document_note_list.push(data);
                }
                // 还在当前页 且 没有定时器 更新备注
                if(this.page_info.id === pId && !this.note_collect.timer) this.updateNote();
                
            }).catch(err => {
                this.$toast('保存备注出错！', 2000);
                console.error(err);
            });
        },
        // 编辑备注
        editDocumentNote(e){
            let docId = this.document_info.id;
            let pId = this.page_info.id;
            let content = e.target.value;
            // 文档页为空 则不保存
            if(!pId) return;
            // return;
            // 文档页跟上次编辑同一页时 且 有定时器
            if(this.note_collect.id && this.note_collect.id === this.page_info.id && this.note_collect.timer) clearTimeout(this.note_collect.timer);
            this.note_collect.id = this.page_info.id;
            this.note_collect.timer = setTimeout(()=>{
                this.note_collect.timer = null;
                this.saveDocumentNote(docId, pId, content);
            }, 1000);
        },
        // 更新备注
        updateNote(){
            return;
            let note_item = this.document_note_list.find(v => v.documentPage === this.page_info.id);
            this.page_info_note = note_item ? note_item.content : '';
        },
        //计算文档标题长度
        calculate_title_width: function () {
            let that = this;
            let $sensor = $('<pre>' + that.document_info_title + '</pre>').css({ display: 'none' });
            $('body').append($sensor);
            let title_width = $sensor.width() + 60;
            title_width = title_width > 164 ? title_width : 164;
            $sensor.remove();
            that.title_width = title_width;
        },
        //显示/隐藏页码列表
        toggle_page_number_list: function () {
            let that = this;
            that.show_scale_list = false;
            that.show_page_number_list = !that.show_page_number_list;
            that.page_hover = !that.show_page_number_list;
        },
        //选择页码切换文档页(target_index:目标文档页下标)
        check_page_number: function (target_index) {
            let that = this;
            that.toggle_page_number_list();
            let min_index = 0;
            let max_index = that.document_page_list.length - 1;
            let current_index = min_index;
            if (typeof (target_index) === 'undefined' || target_index === null) {
                target_index = min_index;
            }
            $.each(that.document_page_list, function (i, item) {
                if (item.uuid === that.page_info.uuid) {
                    current_index = i;
                    return false;
                }
            });
            if (current_index === target_index) {
                return;
            }
            let action = 'next';
            if (target_index < current_index) {
                action = 'previous';
            }
            page_opt.change(that, target_index, action);
        },
        // 清除画布状态
        clear_page_status: function () {
            // 左侧栏输入框失焦
            $(".edit_left input").blur();
            // 文档、文档页标题失焦
            this.blur_title();
            // 重置底部功能栏状态
            this.show_page_number_list = false;
            this.show_scale_list = false;
            // 重置画布背景
            this.show_page_background = false;
            this.show_media_toolbar = false;

            /* 组件状态栏重置 */
            // 关闭主题弹框
            this.$refs.theme_modal && this.$refs.theme_modal.close();
            // 清空绘制工具栏状态
            this.$refs.create_tool && this.$refs.create_tool.clear_tool_status();
            // 关闭媒体面板
            this.$refs.media_panel && this.$refs.media_panel.close_media_panel();
            // 关闭背景设置面板
            this.$refs.background_setting && this.$refs.background_setting.close();
            // 清空序列表状态
            this.$refs.sort_page_modal && this.$refs.sort_page_modal.clear_modal();
        },
        // 显示/隐藏缩放列表
        toggle_scale: function () {
            this.show_page_number_list = false;
            this.show_scale_list = !this.show_scale_list;
        },
        // 选择缩放
        checked_scale: function (scale) {
            let that = this,
                list = that.scale_list;
            list.forEach(function (item) {
                item.checked = false;
            });
            scale.checked = true;
            that.show_scale_list = false;
            that.apply_scale(scale.scale);
        },
        // 输入缩放
        input_scale: function () {
            let that = this,
                data = that.page_scale.percent_text === '' ? 0.5 : that.page_scale.percent_text / 100;
            that.apply_scale(data);
            that.toggle_scale();
        },
        // 应用页面缩放 (data:缩放值,clear:是否关闭缩放列表标识)
        apply_scale: function (data, stay) {
            let that = this,
                arr = that.scale_list.filter(item => item.scale === data);
            if (arr.length <= 0 || arr[0].name === '适配屏幕') {
                that.scale_list.forEach(function (item) {
                    item.checked = false;
                });
                that.scale_list[5].checked = true;
            } else {
                arr[0].checked = true;
                that.scale_list[5].checked = false;
            }
            if (data > 10) {
                that.$toast('不能大于1000%哦', 800);
                data = 10;
            }
            if (data < 0.2) {
                that.$toast('不能小于20%哦', 800);
                data = 0.2;
            }
            // 设置当前缩放
            that.page_scale.user_set = data;
            // 设置当前缩放比例文本
            that.page_scale.percent_text = Math.round(data * 100);
            // 设置当前可拖动标识
            that.page_scale.less = data < that.page_scale.suitable;
            // 设置 base_opt 比例
            opt_factory.init_opt('group').set_base_scale(data);
            // 设置画布缩放
            page_opt.set_page_scale(that);
            if (data > that.page_scale.suitable) {
                that.$toast('按住鼠标右键可以拖动画布', 1000);
            }
            // 清除画布状态
            if (!stay) that.clear_page_status();
            // 清除选中状态
            that.ele_cancel_checked();
        },
        // 计算适配屏幕缩放（最佳比例）
        compute_suitable_scale: function () {
            /*
            *   触发节点：1. 空文档进入编辑；2. 非空文档获取文档详情后；3. 文档比例设置发生改变；4. 浏览器宽高发生改变
            * */
            let that = this,
                window_w = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth,
                window_h = window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight,
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
            that.scale_list[5].scale = that.page_scale.suitable;
            // 应用比例
            that.apply_scale(suitable);
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
        // 显示/隐藏文档页设置下拉
        toggle_page_background: function (e) {
            let that = this;
            that.show_page_background = !that.show_page_background;
            if (that.show_page_background) {
                $('.page_background_modal .set_title i').css({
                    background: opt_factory.init_opt('group').gradient_obj_2_style(that.page_info.background.color)
                })
            }
            // 取消选中
            that.ele_cancel_checked();
            // 阻止事件冒泡
            e.stopPropagation()
        },
        // 打开背景设置弹框
        open_background_setting: function (type) {
            let that = this;
            if (!type || typeof (type) !== 'string') type = that.page_info.background.type;
            that.show_page_background = false;
            that.$refs.animation_modal && that.$refs.animation_modal.hide();
            that.$refs.media_panel && that.$refs.media_panel.close_media_panel();
            that.$refs.background_setting && that.$refs.background_setting.open('page', that.page_info.background, type);
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
            that.grid_using = 'middle';
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
        // 设置网格
        set_grid_model: function (value = false) {
            let that = this;
            that.show_grid_toolbar = false;
            if (value === that.grid_using) {
                that.grid_using = false;
            } else {
                that.grid_using = value;
            }
            that.grid_using_render();
            that.$nextTick(() => {
                that.toggle_grid_display(true);
                setTimeout(() => {
                    that.toggle_grid_display(false);
                }, 300);
            });
        },
        // 显示/隐藏网格线
        toggle_grid_display: function (b) {
            if (this.grid_using) {
                $('#grid-template-loader path').css('opacity', Number(!!b));
            }
        },
        // 下载背景图或图片
        download_image(type) {
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
                edit_shape_point(that, ele);
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
        // 剪切板数据类型判断&抽取 (isSimulation 是否为模拟操作)
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
                if (file_items && file_items.length) {
                    for (var i = 0; i < event.clipboardData.types.length; i++) {
                        if (event.clipboardData.types[i] === 'Files') {
                            file_item = file_items[i];
                            break;
                        }
                    }
                    if (file_item && file_item.kind === 'file' && file_item.type.match(/^image\//i)) {
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
        // 元素粘贴提示（右键粘贴）
        ele_paste_tips: function () {
            let that = this;
            that.$toast(`右键暂时不支持粘贴，请使用${utils.deviceENV().mac ? 'Command+' : 'Ctrl+'}V粘贴`, 1000);
        },
        // 元素粘贴方法 obj:{list: array, group: array, outside:ture|false}, setting:{center: 是否居中, resize: 是否重置大小,deviation: 是否设置偏差}
        ele_paste: function (obj, setting) {
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
                result = option.ele_paste(obj, setting.deviation);
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
                    that.set_paste_textformat($ele.attr('id'));
                    that.text_format_show($ele);
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
            // 结束图片元素裁剪
            if (that.$refs.format_panel && that.$refs.format_panel.begin_clip) {
                that.$refs.format_panel.sure_image_clip();
            }
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
            that.refresh_comment_id();
            // 通讯联系 - 元素选中
            that.get_ws_checked_message();
            // 更新元素动画选中
            that.$refs.animation_modal && that.$refs.animation_modal.animation_list_select();
            // 更新动画元素标记选中
            that.animation_mark_checked();
            // 媒体控件隐藏
            opt_factory.init_opt('audio').audio_control_remove();
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

        /* 超链接相关 start*/
        // 打开元素超链设置弹框
        show_link_modal: function () {
            let that = this;
            if (that.element_type === 'text' || that.element_type === 'table') {
                let $ele = $('.page_contain .ele_item.checked');
                editor_opt.save_text_selection($ele);
                let $selector = $ele.find('.customize_selection');
                if ($selector.length <= 0) return that.$toast('请选中文本后操作', 800);
                that.can_change_text = $selector.length === 1;
            }
            that.show_ele_link_modal = true;
            that.$nextTick(() => {
                $('.ele_link_text').focus() || $('.ele_link_str').focus();
                that.can_change_link = true;
            })
        },
        // 关闭超链接弹窗
        close_ele_link_modal: function () {
            let $ele = $('.page_contain .ele_item.checked');
            this.show_ele_link_modal = false;
            this.show_link_change_modal = false;
            this.can_change_link = false;
            // 回选文本
            editor_opt.recover_text_selection($ele);
        },
        // 显示/隐藏超链接信息弹框
        edit_link_panel: function () {
            this.show_ele_link_modal = true;
            this.ele_link_info.text = this.current_link_dom.innerText;
            this.$nextTick(() => {
                $('.ele_link_text').focus() || $('.ele_link_str').focus()
            })
        },
        // 获取元素超链接信息
        get_ele_link_info: function (ele) {
            let offset = opt_factory.init_opt('group').compute_ele_offset(ele).window_scaled;
            this.show_link_tool = true;
            this.ele_link_info.href = ele.find('.ele_rotate').attr('title');
            this.ele_link_info.left = offset.x + offset.w / 3;
            this.ele_link_info.top = offset.y + offset.h + 10;
        },
        // 添加元素超链接
        set_ele_link: function () {
            let that = this;
            let $ele = $('.page_contain .ele_item.checked');
            let _link = that.ele_link_info.href;
            let option = opt_factory.init_opt('group');
            let is_link = /^http(s?):\/\//.test(_link); // 判断是否添加http或者https协议开头
            if (!is_link) {
                _link = 'http://' + _link;
            }
            if ($ele.attr('data-type') === 'text' || $ele.find('.cel_edit').length > 0) {
                if (_link === '') {
                    that.$toast('未检测到链接', 800);
                    return;
                }
                let $selector = $ele.find('.customize_selection');
                let option_t = opt_factory.init_opt('text');
                // 工具栏打开超链接则无需选中文本操作
                if (_link === '' && $selector.length <= 0 && option_t.using_data.text_obj.type === undefined) {
                    that.$toast('请选中文本后操作', 800);
                    return;
                }
                let _text = $('.ele_link_text').val();
                // 工具栏新增超链接文本                        
                if (option_t.using_data !== undefined && $ele.find('.show_text a').length > 0) {
                    that.ele_link_info.text = _text;
                    that.ele_link_info.href = _link;
                } else {
                    $ele.find('.show_text.example_text').append(`<a href=${_link} style='text-decoration: underline'>${_text}</a>`);
                }
                // 修改链接
                option.ele_link_add($ele, _link);
            } else {
                option.ele_link_add($ele, _link);
                that.get_ele_link_info($ele);
            }
            that.show_ele_link_modal = false;
            that.can_change_link = false;
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
            let that = this;
            if (ele && ele.hasClass('ele_item')) {
                let offset = opt_factory.init_opt('group').compute_ele_offset(ele).window_scaled;
                that.show_paste_clean = true;
                that.text_clean_info.left = offset.x + offset.w + 10;
                that.text_clean_info.top = offset.y;
                this.paste_textformat_map[ele.attr('id')]++;
            }
        },
        // 打开/关闭格式清除下拉选项
        toggle_paste_clean_list: function () {
            this.show_paste_clean_list = !this.show_paste_clean_list;
        },
        // 文本格式设置
        text_format_operation: function (type) {
            let that = this,
                $ele = $('.page_contain .ele_item.checked'),
                id = $ele.attr('id'),
                $text = $ele.find('.show_text'),
                paste_content;
            if (!that.show_paste_clean_list) return;
            that.stop_document_observer();
            try {
                switch (type) {
                    case 'save':
                        if (that.before_clean_html.filter(item => item.id === id).length === 0) return;
                        $text.html(that.before_clean_html.filter(item => item.id === id)[0].html);
                        break;
                    case 'clean':
                        if (that.before_clean_html.filter(item => item.id === id).length === 0) that.before_clean_html.push({ id: id, html: $text.html() });
                        $text.attr('style', `font-size:28px; color:${that.theme_checked.textColor};`).find('*').not('br').attr('style', '');
                        break;
                }
                // 重置文本框大小
                that.element_message.h = opt_factory.init_opt('text').set_ele_sync_content($ele);
                operate_opt.reset_rect($ele);
            } catch (error) {
                console.error(error);
            }
            that.start_document_observer();
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
        // 右键添加元素动画
        ele_create_animation: function () {
            let that = this;
            that.$refs.animation_modal && that.$refs.animation_modal.show(() => {
                let $ele = $('#page_contain #edit_page .ele_item.checked');
                let uuid = $ele.attr('data-group') || $ele.attr('id');
                let is_set = that.$refs.animation_modal.get_element_is_animation(uuid);
                if (is_set) {
                    that.$refs.animation_modal.set_edit_animation(null, uuid);
                } else {
                    that.$refs.animation_modal.create_animation_open();
                }
            });
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
                    rect_size = [224, 224 * group_rect_ratio];
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
                        option.set_group_size($ele, { w: 224, h: 224 * group_rect_ratio, });
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
                                                })
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
            this.$refs.material_library.images_operation_state_open('element_src');
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
            // 触发格式面板打开方法
            if (that.element_type && that.show_left_modal) {
                if (that.$refs.format_panel) that.$refs.format_panel.show_up();
            }
            // 关闭背景设置面板
            if (that.$refs.background_setting && that.element_type !== '') that.$refs.background_setting.close();
        },

        /* 更改画布尺寸相关方法 start*/
        // 收回左侧栏 （*删除）
        put_left_modal_away: function () {
            let that = this;
            that.show_left_modal = !that.show_left_modal;
            that.current_view_option = null;
            if (!that.show_left_modal) {
                that.$refs.media_panel && that.$refs.media_panel.close_media_panel();
                that.$refs.background_setting && that.$refs.background_setting.close();
                that.$refs.media_panel && that.$refs.media_panel.close_media_panel();
            }
            // 清除画布状态
            that.clear_page_status();
            // 清除元素选中状态
            that.ele_cancel_checked();
            // 重新计算左侧序列表内容大小
            that.$nextTick(() => {
                that.$refs.sort_page_modal.initial_list_data();
                // 重新计算画布缩放
                page_opt.save_page_offset();
                that.compute_suitable_scale();
            })
            // 在序列表折叠且格兰面板隐藏状态下，恢复格式栏状态
            if (!that.show_format_panel && that.show_left_modal) {
                that.toggle_format_panel()
            }
        },
        // 全屏编辑
        set_full_screen_edit: function () {
            let that = this;
            that.current_view_option = null;
            if (that.full_screen_edit) {
                that.outFullScreen();
            } else {
                that.inFullScreen();
            }
            that.$nextTick(() => {
                // 重新计算序列表尺寸
                that.$refs.sort_page_modal.initial_list_data();
            })
        },
        // 进入全屏
        inFullScreen: function () {
            let that = this;
            let el = document.documentElement;
            let is_ie = utils.deviceENV().ie;
            if (is_ie) {
                that.iefull();
            } else {
                let rfs = el.requestFullScreen || el.webkitRequestFullScreen || el.mozRequestFullScreen || el.msRequestFullscreen;
                if (typeof rfs !== "undefined" && rfs) {
                    rfs.call(el);
                }
            }
            that.full_screen_edit = true;
        },
        // 退出全屏
        outFullScreen: function () {
            let that = this;
            let is_ie = utils.deviceENV().ie;
            if (is_ie) {
                that.iefull();
            } else {
                let is_full = (document.fullScreenElement && document.fullScreenElement !== null) || document.mozFullScreen || document.webkitIsFullScreen;
                if (is_full) {
                    if (document.exitFullscreen && document.exitFullscreen !== null) document.exitFullscreen();
                    if (document.mozCancelFullScreen) document.mozCancelFullScreen();
                    if (document.webkitCancelFullScreen) document.webkitCancelFullScreen();
                    if (document.msExitFullscreen) document.msExitFullscreen();
                }
            }
            that.full_screen_edit = false;
            that.show_format_panel = true;
            $('.collect_panel').removeClass('right');
        },
        // ie浏览器下
        iefull: function () {
            let el = document.documentElement;
            let rfs = el.msRequestFullScreen;
            if (typeof window.ActiveXObject == "undefined") {
                //这的方法 模拟f11键，使浏览器全屏
                let wscript = new ActiveXObject("WScript.Shell");
                if (wscript != null) {
                    wscript.SendKeys("{F11}");
                }
            }	//ie调用ActiveX控件，需要在ie浏览器安全设置里面把 ‘未标记为可安全执行脚本的ActiveX控件初始化并执行脚本’ 设置为启用
        },
        /* 更改画布尺寸相关方法 end*/

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
            that.$refs.media_panel && that.$refs.media_panel.close_media_panel();
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
        open_transition_modal: function () {
            this.$refs.theme_modal && this.$refs.theme_modal.close();
            this.$refs.animation_modal && this.$refs.animation_modal.toggle();
            this.$refs.media_panel && this.$refs.media_panel.close_media_panel();
            this.$refs.background_setting && this.$refs.background_setting.close();
        },
        // 打开插入 or 模板 弹窗
        openMaterialModal(type){
            this.$refs['material_library'].show(type)
            // 清空状态
            this.clear_page_status();
        },
        // 关闭演示选项弹框
        close_demo_options: function () {
            this.demo_options_show = false;
        },
        // 打开/关闭演示选项弹框
        toggle_demo_options: function () {
            let that = this;
            that.demo_options_show = !that.demo_options_show;
            that.current_view_option = null;
            that.show_right_menu = false;
        },
        // 打开快捷键弹框
        toggle_keyboards_shortcuts: function (type) {
            this.show_keyboards_shortcuts = type;
            this.keyboards_index = 0;
        },
        // 改变快捷键展示列表
        change_keyboards_list: function (index) {
            this.keyboards_index = index;
        },
        // 打开报错反馈弹框
        show_error_feedback: function () {
            this.$refs.error_feedback && this.$refs.error_feedback.open();
        },
        // 隐藏未保存提示
        hide_save_tips: function () {
            this.show_save_tips = false;
        },
        // 打开/关闭 媒体工具栏
        toggle_media_toolbar: function () {
            this.show_media_toolbar = !this.show_media_toolbar;
        },
        // 打开媒体设置面板
        open_media_panel: function (media, opt) {
            this.show_media_toolbar = false;
            this.$refs.material_library && this.$refs.material_library.show('insert', {type: media, media_opt: opt});
            this.$refs.animation_modal && this.$refs.animation_modal.hide();
            this.$refs.background_setting && this.$refs.background_setting.close();
            this.$refs.theme_modal && this.$refs.theme_modal.close();
        },

        /* 顶栏功能 */
        // 撤回按钮点击
        undo_history: function (event) {
            let that = this,
                e = event || window.event;
            if (e.target.className.indexOf('disabled') < 0) {
                that.undo_redo_document('undo');
            }
        },
        // 重做按钮点击
        redo_history: function (event) {
            let that = this,
                e = event || window.event;
            if (e.target.className.indexOf('disabled') < 0) {
                that.undo_redo_document('redo');
            }
        },
        // 唤醒分享弹框
        show_share_modal: function () {
            let that = this;
            that.demo_options_show = false;
            if (!that.user.login) return that.$toast('登录后才可以执行该操作', 1500);
            if (that.modal_id || !that.document_info.id) return that.show_save_tips = true;
            that.$refs.share_modal.show({
                type: that.document_info.documentType,
                urlid: that.document_info.url,
            });
        },
        // 协作弹框
        showCollaboratorsModal() {
            if (this.user_authority_type !== 'owner') return;
            if (!this.user.login) return this.$toast('登录后才可以执行该操作', 1500);
            if (this.modal_id || !this.document_info.id) return this.show_save_tips = true;
            this.$refs.share_modal.show({
                type: this.document_info.documentType,
                urlid: this.document_info.url,
                share_step: 'set_authority'
            });
        },
        // 导出（下载）弹窗打开
        export_modal_open: function () {
            let id = this.document_info.id;
            if (!this.user.login) {
                return this.$toast('登录后才可以执行该操作');
            }
            if (this.modal_id || $validate(id).empty()) {
                return this.$toast("编辑幻灯片后才可以下载哦");
            }
            this.$refs.export_modal && this.$refs.export_modal.show_modal();
        },
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
                that.demo_options_show = false;
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
        // 顶部-评论
        set_comment: function () {
            let that = this;
            that.current_view_option = null;
            that.initial_comment_list();
            that.toggle_comment_modal(!that.show_right_comment);
        },
        // 删除文档弹框
        delete_doc_modal: function () {
            let that = this;
            if (!that.user.login) return that.$toast('登录后才可以执行该操作', 1500);
            if (that.modal_id || that.document_info.id === '') return that.$toast("不可删除", 800);
            that.$refs.delete_modal.show_modal({
                sure_fn: function () {
                    that.$axios.post('/api/member/document/tmp_delete/', {
                        docId: that.document_info.id
                    }).then(function (data) {
                        if (data.data.code === '2') {
                            that.$toast('删除成功', 2000);
                            that.ws_doc_delete_send();
                            location.href = '/home/';
                        } else {
                            that.$toast(data.data.content, 2000);
                        }
                    });
                }
            });
        },
        // 打印功能
        before_print: function () {
            this.$refs.print_modal.page_to_print();
            this.$nextTick(function () {
                document.execCommand('print');
            })
        },
        // 保存副本
        save_copy_doc: function () {
            let that = this;
            if (!that.user.login) return that.$toast('登录后才可以执行该操作', 1500);
            if (that.modal_id || that.document_info.id === '') return that.$toast('保存之后才能操作哦', 800);
            that.$check_rankauth.documentCreateAndRecovery().then(function () {
                let is_team = false;
                let success_callback = function () {
                    // 打开重命名弹框name_modal
                    that.$refs.name_modal.open({
                        title: "创建为副本",
                        content: that.document_info.title + "[副本]",
                        is_team: is_team,
                        sure_fn: function (obj) {
                            let copy_url = '',
                                params = {};
                            if (obj.is_team_doc) {
                                params = {
                                    name: obj.name,
                                    docId: that.document_info.id,
                                    fid: obj.target_folder_info.id,
                                    folderType: obj.target_folder_type,
                                };
                                copy_url = '/api/member/document/create_copy/';
                            } else {
                                params = {
                                    name: obj.name,
                                    docId: that.document_info.id,
                                };
                                copy_url = '/api/member/document/copy/';
                            }
                            that.$axios.post(copy_url, params)
                                .then(function (data) {
                                    if (data.data.code === '2') {
                                        that.$toast('创建成功', 800);
                                        location.href = obj.is_team_doc ? `/edit/?docId=${data.data.data}` : `/edit/?docId=${data.data.data.id}`;
                                    } else {
                                        that.$toast('创建失败', 800);
                                    }
                                    that.$refs.name_modal.close();
                                });
                        }
                    });
                }
                // 1、判断是否为团队文档
                that.$axios.get('/api/member/document/team_detail/' + that.document_info.id + '/')
                    .then(function (data) {
                        if (data.data.data.teamId) {
                            is_team = true;
                        }
                        success_callback();
                    })
                    .catch(error => {
                        success_callback();
                    })
            });
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
                    window.close_history_iframe = that.close_history_iframe;
                    window.recovery_action_history = that.recovery_action_history;
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
            let that = this;
            that.show_history_iframe = false;
            delete window.close_history_iframe;
            delete window.recovery_action_history;
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
        toggle_action_custom: function (id) {
            let that = this;
            if (!that.user.login) return that.$toast('登录后才可以执行该操作', 1500);
            that.custom_iframe_src = `/edit/?mode=custom&presetId=${id}&ws=false`;
            that.show_custom_iframe = true;
            window.close_custom_iframe = that.close_custom_iframe;
            window.custom_preset_list = that.$refs.sort_page_modal.custom_preset_list;
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
                    name: that.page_info_title,
                    image: data,
                    content: JSON.stringify(page_info)
                })
                    .then(function (data) {
                        if (data.data.code === '2') {
                            that.$toast(data.data.content, 1500);
                            that.custom_preset_saving = false;
                            let list = window.parent.custom_preset_list;
                            if (!that.preset_id) {
                                list.unshift(data.data.data);
                            } else {
                                let index = list.findIndex(item => item.id == data.data.data.id);
                                list[index].name = data.data.data.name;
                                list[index].image = data.data.data.image;
                            }
                            window.parent.custom_preset_list = list;
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
        // 打开导入弹框
        open_import_doc: function () {
            if (!this.user.login) {
                this.$toast('登录后才可以执行该操作', 1500);
                return;
            }
            this.$refs.import_modal && this.$refs.import_modal.open();
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
        // 获取用户是否为设计师
        check_designer: function () {
            let that = this;
            that.$axios.get('/api/member/designer/check/').then(function (data) {
                that.is_designer = data.data.data;
            })
        },
        // 打开生成 h5预览 弹窗
        open_preview_h5: function () {
            if (!this.user.login) return this.$toast('登录后才可以执行该操作', 1500);
            this.$refs.h5_preview.show(this.document_info.url);
        },
        // 控制格式面板显示或隐藏
        toggle_format_panel: function () {
            this.show_format_panel = !this.show_format_panel;
            // $('.material_library_btn.my_collect').toggleClass('right');
        },
        // 分享弹框中更改文档名称后回显
        fresh_doc_name: function (obj) {
            this.document_info_title = obj.name;
            this.document_info.title = obj.name;
        },

        /*协作者相关 start*/
        // 获取全部协作者个数
        get_partner_count: function () {
            let that = this;
            if (!that.document_info.id || that.document_info.id === '') return false;
            that.$axios.get('/api/member/document_collaborate/count/', { params: { docId: that.document_info.id } })
                .then(function (data) {
                    if (data.data.code !== '2') return that.$toast(data.data.content, 800);
                });
        },
        // 获取当前文档全部协作者
        get_all_partner: function (socket_send) {
            let that = this;
            collaborate.specific(that, {
                id: that.document_info.id,
                success: function (data) {
                    if (data.data.code !== '2') return that.$toast(data.data.content, 800);
                    let partner = Object.values(data.data.data)[0];
                    if (typeof (partner) === 'undefined') {
                        partner = [];
                    }
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
        // 顶部栏在线协作者面板
        toggle_more_online: function () {
            let that = this;
            that.show_more_online = !that.show_more_online;
            if (that.show_more_online) {
                that.show_comment_panel = false;
            }
        },
        // 协作者 - 退出协作
        quit_cooperation: function () {
            let that = this,
                id = that.document_info.id;
            if (!that.user.login) return that.$toast('登录后才可以执行该操作', 1500);
            that.$refs.delete_modal.show_modal({
                title: '退出协作',
                content: '退出后将不可再继续进入此文档',
                sure_fn: function () {
                    collaborate.quit(that, {
                        id: id,
                        success: function (data) {
                            if (data.data.code !== '2') return that.$toast(data.data.content, 800);
                            that.$toast('已退出', 2000);
                            location.href = '/home/';
                        }
                    });
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
                    if (!data.data.data.isRead) that.un_read_comment = true;
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
                    that.comment_list = list;
                    if (resolve && typeof resolve === 'function') resolve();
                })
        },
        // 评论状态初始化
        initial_comment_list: function () {
            let that = this;
            // 初始化顶部栏评论列表
            that.comment_list.forEach(function (comment) {
                comment.show_more = false;
                comment.show_delete = false;
                comment.open_reply = false;
                comment.reedit = false;
            });
            // 初始化右侧评论列表
            that.right_comment_list.forEach(function (comment) {
                comment.show_more = false;
                comment.show_delete = false;
                comment.open_reply = false;
                comment.reedit = false;
            });
        },
        // 顶部评论 - 显示隐藏
        toggle_top_comment: function () {
            let that = this;
            if (!that.user.login) return that.$toast('登录后才可以执行该操作', 1500);
            if (!that.document_info.id || that.document_info.id === '') return that.show_save_tips = true;
            that.current_view_option = null;
            that.demo_options_show = false;
            that.show_comment_panel = !that.show_comment_panel;
            that.show_more_online = false;
            that.show_right_comment = false;
            that.show_right_menu = false;
            if (that.show_comment_panel) {
                if (that.comment_list.length <= 0) that.get_all_comment();
                if (that.un_read_comment) that.$axios.post('/api/member/document_review/read/', { docId: that.document_info.id })
                    .then(function (data) {
                        if (data.data.code !== '2') return false;
                        that.un_read_comment = false;
                    });
                that.initial_comment_list();
            }
        },
        // 顶部评论 - 添加评论
        add_comment: function () {
            let that = this;
            that.toggle_top_comment();
            that.comment_draft = '';
            that.show_add_comment = true;
            that.show_right_comment = true;
            that.initial_comment_list();
            that.toggle_comment_modal(true);
        },
        // 删除评论 - 显示隐藏
        toggle_delete_comment: function (item) {
            if (typeof item.show_delete === 'undefined') return item.show_delete = true;
            item.show_delete = !item.show_delete;
            item.show_more = false;
        },
        // 删除评论 - 确认删除
        sure_delete_comment: function (item) {
            let that = this;
            // 隐藏弹框
            item.show_delete = !item.show_delete;
            that.$axios.post('/api/member/document_review/delete/', {
                docId: that.document_info.id,
                documentReviewId: item.id
            })
                .then(function (data) {
                    if (data.data.code !== '2') return that.$toast(data.data.content, 800);
                    $.each(that.comment_list, function (j, jtem) {
                        if (jtem.id === item.id) {
                            that.comment_list.splice(j, 1);
                            return false;
                        }
                    });
                    $.each(that.right_comment_list, function (j, jtem) {
                        if (jtem.id === item.id) {
                            that.right_comment_list.splice(j, 1);
                            return false;
                        }
                    });
                    // 通讯推送
                    that.ws_doc_review_send({ type: 'delete', data: item.id });
                    that.comment_map[that.page_info.id] = that.comment_map[that.page_info.id] - 1;
                })
        },
        // 右侧评论 - 获取展示评论
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
            if (that.right_comment_close) return false;
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
                        that.show_right_comment = true;
                    }
                    that.right_all_comment_list = list;
                    // 存储当前选中/全部元素id
                    that.refresh_comment_id();
                });
        },
        // 修改右侧评论定位
        toggle_comment_modal: function (type) {
            let that = this;
            that.initial_comment_list();
            that.show_right_comment = false;
            that.right_comment_close = !type;
            if (type) {
                that.show_comment_panel = false;
                that.show_right_comment = true;
                that.get_right_comment();
            }
        },
        // 更新当前元素id列表
        refresh_comment_id: function () {
            let that = this,
                id_arr = [],
                all_id_arr = [],
                count = 0,
                comment_list = [],
                $element = $('.page_contain .ele_item');
            comment_list = that.right_all_comment_list;
            for (let i = 0; i < comment_list.length; i++) {
                for (let j = 0; i < that.right_comment_list.length; i++) {
                    if (comment_list[i].id === that.right_comment_list[j].id) {
                        comment_list[i] = that.right_comment_list[j];
                    }
                }
            }
            $element.each(function () {
                all_id_arr.push($(this).attr('id'));
                if ($(this).hasClass('checked')) {
                    id_arr.push($(this).attr('id'))
                }
            });
            comment_list.forEach(function (item, index) {
                if (id_arr.length === 0) return item.check = false;
                // 筛选选中元素评论
                id_arr.forEach(function (comment) {
                    if (item.elementIds.includes(comment)) {
                        // 只选中第一个评论
                        if (count >= 1) return item.check = false;
                        count++;
                        item.check = true;
                    } else {
                        item.check = false;
                    }
                })
                // 若画布上不存在评论中的元素，则删除评论
                item.elementIds.forEach(function (id, _index) {
                    if (!all_id_arr.includes(id)) comment_list.splice(_index, 1);
                })
            });
            that.right_comment_list = comment_list;
            that.comment_element_id = id_arr;
        },
        // 右侧评论 - 发表评论
        send_comment: function () {
            let that = this,
                $target = $('.page_contain .ele_item.checked'),
                $target_masking = $('.editing_element_masking .item.checked'),
                draft = that.comment_draft,
                params = {
                    docId: that.document_info.id,
                    pId: that.page_info.id,
                    type: '',
                    elementIds: [],
                    title: '',
                    content: ''
                };
            // 错误状态判断
            if (that.sending_comment) return false;
            // 校验评论草稿(长度)
            if (draft.replace(/^\s*|\s*$/g, "").length === 0) {
                that.$toast('评论不可为空', 1000);
                that.comment_draft = '';
                return false;
            }
            // 校验评论草稿(特殊字符)
            if ($validate(draft).special()) return that.$toast('评论不可带有特殊符号', 1000);
            params.content = draft;
            // 判断 元素 || 画布评论
            if ($target.length > 0) {
                let id_arr = [];
                $target.each(function () {
                    if ($(this).attr('id')) id_arr.push($(this).attr('id'));
                    if ($(this).attr('data-type') === 'text' && params.title === '') params.title = $(this).find('.show_text').text().slice(0, 50);
                });
                params.elementIds = id_arr;
                params.type = 'element';
            } else if ($target_masking.length > 0) {
                let id_arr = [];
                $target_masking.each(function () {
                    if ($(this).attr('data-id')) id_arr.push($(this).attr('data-id'));
                    if ($(this).attr('data-element_type') === 'text' && params.title === '') {
                        params.title = $('.page_contain').find('#' + $(this).attr('data-id')).find('.show_text').text().slice(0, 50);
                    }
                });
                params.elementIds = id_arr;
                params.type = 'element';
            } else {
                params.type = 'page';
                params.elementIds = [];
            }
            // 更新发布状态
            that.sending_comment = true;
            // 发布评论
            that.$axios.post('/api/member/document_review/save/', params)
                .then(function (data) {
                    if (data.data.code !== '2') return that.$toast(data.data.content, 800);
                    let comment = data.data.data;
                    // 隐藏添加编辑框
                    that.show_add_comment = false;
                    // 更新发布状态
                    that.sending_comment = false;
                    // 展开回复标记
                    comment.open_reply = false;
                    // 展开更多操作标记
                    comment.show_more = false;
                    // 展开删除确认标记
                    comment.show_delete = false;
                    // 重编辑标记
                    comment.reedit = false;
                    // 计算评论相对时间
                    comment.date = page_opt.fn.return_fixed_time(comment.modifyDate);
                    // 更新评论列表
                    that.comment_list.unshift(comment);
                    that.comment_map[that.page_info.id] = that.comment_map[that.page_info.id] ? that.comment_map[that.page_info.id] + 1 : 1;
                    that.right_comment_list.unshift(comment);
                    // 更新当前元素id列表
                    that.comment_element_id = comment.elementIds;
                    // 清空评论草稿
                    that.comment_draft = '';
                    // 通讯推送
                    that.ws_doc_review_send({ type: 'add', data: comment });
                })
        },
        // 右侧评论 - 取消发表
        cancel_add_comment: function () {
            let that = this;
            that.show_add_comment = false;
            // 清空评论草稿
            that.comment_draft = '';
        },
        // 评论 - 选中评论
        select_comment_item: function (item) {
            let that = this;
            that.initial_comment_list();
            that.reply_draft = '';
            item.open_reply = true;
            // 判断评论类型选中对应元素
            if (item.elementIds && item.elementIds.length > 0) {
                let element_arr = item.elementIds;
                $('.page_contain .ele_item.checked').removeClass('checked');
                $('.editing_element_masking .item').removeClass('checked');
                element_arr.forEach(function (id) {
                    if ($('.editing_element_masking .item[data-id=' + id + ']').length > 0) {
                        $('.editing_element_masking .item[data-id=' + id + ']').addClass('show checked');
                        setTimeout(function () {
                            $('.editing_element_masking .item[data-id=' + id + ']').removeClass('show');
                        }, 400);
                    } else if ($('.page_contain').find('#' + id).length > 0) {
                        $('.page_contain').find('#' + id).addClass('checked');
                    }
                });
                // 选中元素
                let $ele = $('.page_contain .ele_item.checked');
                that.set_ele_checked($ele);
            }
        },
        // 评论 - 解决/打开
        solve_comment: function (item) {
            let that = this,
                type = item.isSolve ? 'reopen' : 'solve';
            that.$axios.get('/api/member/document_review/' + that.document_info.id + '/' + item.id + '/' + type + '/')
                .then(function (data) {
                    if (data.data.code !== '2') return that.$toast(data.data.content, 800);
                    let top_comment_list = page_opt.fn.clone_object(that.comment_list),
                        right_comment_list = page_opt.fn.clone_object(that.right_comment_list),
                        top_item = top_comment_list.filter(comment => comment.id === item.id)[0];
                    // 更新顶部评论列表
                    top_item.documentReviewReplies.push(data.data.data);
                    top_item.isSolve = !top_item.isSolve;
                    that.comment_list = top_comment_list;
                    // 更新右侧评论列表
                    if (!item.isSolve) {
                        // 评论变更为已解决
                        that.right_comment_list = right_comment_list.filter(comment => comment.id !== item.id);
                        that.show_right_comment = false;
                    } else {
                        // 评论变更为未解决
                        right_comment_list.push(top_item);
                        right_comment_list.sort(function (a, b) {
                            return b.createDate - a.createDate
                        });
                        that.right_comment_list = right_comment_list;
                    }
                    // 通讯推送
                    that.ws_doc_review_send({ type: 'modify', data: top_item });
                })
        },
        // 评论 - 显示更多操作
        show_more_action: function (item) {
            let that = this;
            that.initial_comment_list();
            item.show_more = !item.show_more;
        },
        // 评论 - 重编辑评论
        reedit_comment: function (e, item) {
            let that = this,
                el = $(e.target).parents('.comment_item');
            that.initial_comment_list();
            // 打开重编辑
            item.reedit = true;
            that.comment_draft = item.content;
            // 计算编辑框大小
            that.$nextTick(function () {
                el = el.find('.reedit_commend_bar textarea').eq(0)[0];
                that.compute_area_size(el, item.content);
            })
        },
        // 评论 - 保存重编辑
        save_comment_reedit: function (item) {
            let that = this,
                draft = that.comment_draft,
                params = {
                    docId: that.document_info.id,
                    documentReviewId: item.id,
                    content: ''
                };
            // 错误状态判断
            if (that.sending_comment) return false;
            // 校验评论草稿(长度)
            if (draft.replace(/^\s*|\s*$/g, "").length === 0) {
                that.$toast('评论不可为空', 1000);
                that.comment_draft = '';
                return false;
            }
            // 校验评论草稿(特殊字符)
            if ($validate(draft).special()) return that.$toast('评论不可带有特殊符号', 1000);
            params.content = draft;
            // 更新发布状态
            that.sending_comment = true;
            // 发布评论
            that.$axios.post('/api/member/document_review/update/', params)
                .then(function (data) {
                    if (data.data.code !== '2') return that.$toast(data.data.content, 800);
                    // 更新发布状态
                    that.sending_comment = false;
                    // 收起重编辑框
                    item.reedit = false;
                    // 更新评论列表
                    item.content = draft;
                    item.modifyDate = new Date().getTime();
                    item.date = page_opt.fn.return_fixed_time(item.modifyDate);
                })
        },
        // 评论 - 取消重编辑
        cancel_comment_reedit: function (item) {
            let that = this;
            that.initial_comment_list();
            that.comment_draft = '';
        },
        // 评论 - 打开回复
        toggle_comment_reply: function (item) {
            item.open_reply = !item.open_reply;
            item.reedit = false;
            if (!item.open_reply) this.reply_draft = '';
        },
        // 评论 - 发表回复
        send_reply: function (item) {
            let that = this,
                draft = that.reply_draft,
                params = {
                    docId: that.document_info.id,
                    documentReviewId: item.id,
                    content: ''
                };
            // 错误状态判断
            if (that.sending_reply) return false;
            // 校验评论草稿(长度)
            if (draft.replace(/^\s*|\s*$/g, "").length === 0) {
                that.$toast('评论不可为空', 1000);
                that.reply_draft = '';
                return false;
            }
            // 校验评论草稿(特殊字符)
            if ($validate(draft).special()) return that.$toast('评论不可带有特殊符号', 1000);
            params.content = draft;
            // 更新发布状态
            that.sending_reply = true;
            that.reply_draft = '';
            item.open_reply = false;
            // 发布评论
            that.$axios.post('/api/member/document_review/reply/save/', params)
                .then(function (data) {
                    if (data.data.code !== '2') return that.$toast(data.data.content, 800);
                    let reply = data.data.data,
                        top_comment_list = page_opt.fn.clone_object(that.comment_list),
                        right_comment_list = page_opt.fn.clone_object(that.right_comment_list),
                        top_item = top_comment_list.filter(comment => comment.id === item.id)[0],
                        right_item = right_comment_list.filter(comment => comment.id === item.id)[0];
                    // 更新发布状态
                    that.sending_reply = false;
                    // 修改回复时间
                    reply.date = page_opt.fn.return_fixed_time(reply.modifyDate);
                    // 更新评论列表
                    top_item.documentReviewReplies.push(reply);
                    top_item.isSolve = false;
                    that.comment_list = top_comment_list;
                    if (right_item) {
                        right_item.documentReviewReplies.push(reply);
                        right_item.isSolve = false;
                        that.right_comment_list = right_comment_list;
                    }
                    // 通讯推送
                    that.ws_doc_review_send({ type: 'modify', data: top_item });
                })
        },
        // 同步评论输入框大小
        compute_area_size: function (el, content) {
            let draft = content;
            draft = draft.replace(/<\/?.+?>/g, "<br>");
            draft = draft.replace(/[\r\n]/g, "<br>");
            let $content = document.createElement('DIV'),
                content_h;
            $content.style.width = el.offsetWidth + 'px';
            $content.style.minHeight = '42px';
            $content.style.lineHeight = '20px';
            $content.style.padding = '0 8px';
            $content.style.border = '1px solid #dadce0';
            $content.style.fontSize = '12px';
            $content.style.whiteSpace = 'pre-line';
            $content.style.wordBreak = 'break-all';
            $content.innerHTML = draft;
            document.body.append($content);
            content_h = $content.offsetHeight;
            document.body.removeChild($content);
            if (draft.slice(-3) === 'br>' && content_h > 42) content_h += 20;
            el.style.height = content_h + 'px';
        },
        /*评论相关 end*/

        /* 文件相关 start */
        change_view_option: function (type) {
            let that = this;
            if (!that.user.login) {
                return that.$toast('请登录后再进行此操作~', 1500);
            }
            // 关闭评论或演示弹框
            that.show_comment_panel = false;
            that.demo_options_show = false;
            that.current_view_option = that.current_view_option === type ? null : type;
            that.show_right_menu = false;
            // 获取桌面文档
            that.current_view_option === 'file' && that.document_list.length === 0 && that.pre_folder_list.length === 0 && that.get_desktop_doc();
            // 获取最近使用文档
            if (that.recently_used_folder_list.length === 0) {
                that.get_recently_folder();
            }

        },
        // 获取最近使用文档
        get_recently_folder: function () {
            let that = this;
            that.$axios.get('/api/member/document/lately_used/list/')
                .then((data) => {
                    if (data.data.code !== '2') return console.error('获取最近使用文档失败')
                    that.recently_used_folder_list = data.data.data;
                })
        },
        // 获取我的桌面文档
        get_desktop_doc: function (obj, item) {
            let that = this;
            let $params = {
                fId: '',
                isOwnerRole: '',
                keyword: ''
            }
            that.document_list = [];
            that.current_folder_info = item;
            $params = Object.assign($params, obj)
            that.$axios.get('/api/member/my_document/', {
                params: $params,
            }).then((data) => {
                let res_data = data.data.data;
                if (data.data.code === '2') {
                    if (!item) that.current_folder_info = res_data.currentFolder;
                    let folder_list = res_data.childrenFolders;
                    let document_list = res_data.documentList;
                    folder_list = folder_list.sort(function (a, b) {
                        return b.modifyDate - a.modifyDate;
                    });
                    // 过滤只能查看或评论的文档
                    document_list = document_list.filter(item => {
                        if (['owner', 'edit'].indexOf(item.collaborateRoleType) >= 0) return item;
                    });
                    document_list = document_list.sort(function (a, b) {
                        return b.topTime - a.topTime || b.modifyDate - a.modifyDate;
                    });
                    that.document_list = folder_list.concat(document_list);
                    that.doc_empty = that.document_list.length <= 0;
                }
            })
        },
        // 进入文件夹
        enter_next_folder: function (obj, item) {
            let that = this;
            that.pre_folder_list.push(that.current_folder_info)
            that.get_desktop_doc(obj, item);
        },
        // 返回上一级文件夹
        back_pre_folder: function () {
            let that = this;
            let index = that.pre_folder_list.length - 1;
            that.current_folder_info = that.pre_folder_list[index];
            that.get_desktop_doc({ fId: that.pre_folder_list[index].id });
            that.pre_folder_list.splice(index, 1)
        },
        // 跳转文档
        edit_view: function (item) {
            let url = item.collaborateRoleType === 'onlyView' ? `/document/slides/${item.url}` : `/edit/?docId=${item.id}`;
            utils.windowOpenNewtab(window.location.origin + url)
            this.current_view_option = null;
        },
        /* 文件相关 end */

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
            page_opt.save_page_offset();
        },
        // 通用事件绑定
        page_event_initial: function () {
            let that = this;
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
                    that.grid_using = 'middle';
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
                    /**
                     * 已选中状态下点击目标指向元素处理
                     */
                    // 虚线框边框
                    if ($crttarget.hasClass('operate_border')) {
                        $crttarget = $checked;
                    }
                    // 多选子元素
                    if ($crttarget.hasClass('child')) {
                        $crttarget = $checked;
                    }
                    /** 已选中状态下点击目标指向元素处理 end */
                    let is_lock = get_element.lock;
                    let is_ctrl = event.ctrlKey || (event.metaKey && utils.deviceENV().mac);
                    let is_alt = event.altKey;
                    let is_editing = $target.attr('contenteditable') === 'true' || $target.parents('[contenteditable=true]').length > 0;
                    let is_table = $target.hasClass('table_resizer') || $target[0].nodeName === 'TD' || $target.parents('td').length > 0;
                    // 形状元素内置文本编辑时
                    if ($target.parents('[data-type="shape"]').length) {
                        is_editing = is_editing && $(":focus").length;
                    }
                    // 隐藏快捷操作栏下拉列表
                    that.$refs.format_panel.hide_all_list();
                    // 隐藏右键菜单
                    that.show_right_menu = false;
                    // 隐藏文本保留格式下拉框
                    that.show_paste_clean_list = false;
                    // 取消禁止组合子元素选中
                    operate_opt.can_check_child = true;
                    // 优先判断元素绘制
                    if (['create_text', 'create_line', 'create_shape'].indexOf(that.page_state) >= 0) {
                        operate_opt.can_drag = false;
                        return;
                    }
                    // 更新元素锁定状态
                    is_lock = $crttarget.hasClass('lock');
                    // 不进行拖动情况
                    if (is_lock || is_editing || is_ctrl || is_table) {
                        operate_opt.can_drag = false;
                    }
                    if(!is_lock) event.stopPropagation();
                    // 点击表格单元格之外的 -> 去除单元格编辑标识
                    if (!$target.parents('td').length || $target[0].tagName !== 'TD') {
                        $('.cel_edit').removeClass('cel_edit');
                    }
                    /**
                     * 元素 选中/取消选中 设置checked 、更新选中状态 虚线框
                     * ctrl 多选 / 取消单个选中 操作
                     */
                    if (is_ctrl) {
                        // 点击未选中的元素添加选中，否则去除选中
                        let $ctrltarget = option.get_group_element($crttarget);
                        if ($ctrltarget.hasClass('checked')) {
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
                        that.ele_copy(event, true);
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
                    that.refresh_comment_id();
                },
                down: function (data) {
                    that.set_autofit();
                },
                before_move: function (event) {
                    // 移动状态下隐藏子虚线框
                    $('.operate .child').remove();
                    // 移动状态下隐藏组合单选虚线框
                    $('.group_operate').hide();
                    // 隐藏音频控件
                    opt_factory.init_opt('audio').audio_control_hide();
                    // 移动状态下隐藏动画元素标记
                    that.animation_mark_hide(true);
                    // 显示网格线
                    that.toggle_grid_display(true);
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
                        // 隐藏右键菜单
                        that.show_right_menu = false;
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
                    // 隐藏右键菜单
                    that.show_right_menu = false;
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
                    // 隐藏右键菜单
                    that.show_right_menu = false;
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
                // 获取鼠标下的选中元素
                let $currentElemItem = $(e.target).hasClass('ele_item') ? $(e.target) : $(e.target).parents('.ele_item');
                // 判断是否为锁定元素
                if($currentElemItem.hasClass('lock')) {
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
                }else {
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
                that.get_right_comment();
            }).on('mouseout', '.editing_element_masking .item', function () {
                $('.element_tips').hide();
            });
            // 双击元素 -> 双击事件被画布 mousedown 事件阻断，自定义双击事件
            $(document).on('click', '.page_contain .edit_page .ele_item', that.dblclick_listener);
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
                        that.$refs.format_panel.begin_clip = false;
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
                        let sel = window.getSelection();
                        let is_selection = !!(sel && sel.type === 'Range' && !sel.isCollapsed && $(sel.anchorNode).parents('.ele_item').length);
                        // 选区部分应用格式刷
                        if (is_selection) {
                            let $wrap = editor_opt.editor_buildwrap();
                            editor_opt.set_format_painter($wrap, that.format_painter_style);
                        } else {
                            editor_opt.set_format_painter($ele, that.format_painter_style);
                        }
                        that.element_message.text_preset_key = 'none';
                        if (!that.stay_format_painter) {
                            that.had_format_painter = false;
                            that.format_painter_style = null;
                        }
                        let option = opt_factory.init_opt(type);
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
                // a标签链接处理
                if (nodename === 'A' || $target.parents('a').length) {
                    let $a = $();
                    if (nodename === 'A') {
                        $a = $(e.target);
                    } else {
                        $a = $target.parents('a');
                    }
                    if (that.show_link_tool && $a[0] == that.current_link_dom) return;
                    that.show_link_tool = true;
                    that.current_link_dom = $a[0];
                    that.ele_link_info.href = $a.attr('href');
                    that.ele_link_info.text = $a[0].text;
                    // 超链接工具栏显示后再根据宽高计算位置
                    that.$nextTick(() => {
                        that.ele_link_info.top = e.clientY + 20;
                        let tool_width = page_opt.fn.get_client_rect($('.ele_link_tool')).width;
                        if (e.clientX > document.body.offsetWidth - tool_width) {
                            that.ele_link_info.left = document.body.offsetWidth - tool_width;
                        } else {
                            that.ele_link_info.left = e.clientX;
                        }
                    })
                } else {
                    that.show_link_tool = false;
                    that.ele_link_info = {};
                }
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
                    let $cel_selectlist = option.get_edit_cel($ele);
                    let merge_cel = 0;
                    $cel_selectlist.each((i, item) => {
                        option.get_merge_cel($(item), $ele, () => {
                            merge_cel++;
                        });
                    });
                    // 判断是否可以合并或拆分
                    switch (true) {
                        // 选中单个单元格  -->  不可合并，不可拆分
                        case $cel_selectlist.length === 1:
                            that.element_message.cel_option = false;
                            break;
                        // 所选单元格不存在合并单元格  -->  可合并，不可拆分
                        case merge_cel === 0:
                            that.element_message.cel_option = 'merge_cel';
                            break;
                        // 所选单元格已全部合并  -->  不可合并，可拆分
                        case merge_cel + 1 === $cel_selectlist.length:
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
            // 视频元素 - 点击播放按钮进入演示页播放事件
            $(document).on('mousedown', '.page_contain .edit_page .ele_item .video_play', e => {
                if (e.altKey || e.ctrlKey || e.shiftKey) {
                    return;
                }
                let $ele = $(e.target).parents('.ele_item');
                let uuid = $ele.attr('id');
                let down_point = [e.clientX, e.clientY].join();
                $(document).on('mouseup', ev => {
                    $(document).unbind('mouseup');
                    let up_point = [ev.clientX, ev.clientY].join();
                    if (down_point !== up_point) return;
                    // 打开预览层
                    that.show_slides_preview = true;
                    setTimeout(() => {
                        that.$refs.slides_document.show({
                            url: that.document_info.url,
                            begin: that.document_page_list.findIndex(item => item.uuid === that.page_info.uuid),
                            enableAnimation: false,
                            autoPlayMedia: [uuid],
                        });
                    }, 16);
                });
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
    },
    created: function () {
        const that = this;
        sdk_api.init(that);
    },
    mounted: function () {
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
        // 获取用户是否为设计师
        that.check_designer();
        // 设置富文本功能使用css
        document.execCommand("styleWithCSS", false, true);
        window.onbeforeunload = function (e) {
            e = e || window.event;
            let msg = '检测到部分操作未保存，确定要离开吗？';
            if (document_save.method.get_command_queue_length() > 0) {
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
    destroyed(){
        for(let key in document){
            let index = key.indexOf('on');
            if(index === 0){
                document[key] = null;
            }
        }
        $(document).unbind();
    }
}
</script>