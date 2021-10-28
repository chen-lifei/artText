<template>
    <div class="doc-list-main">
        <template v-if="!latest_list">
            <!-- 列表一级头部 -->
            <div class="main-sup-head flex flex-between">
                <!-- 列表类型导航 -->
                <div class="nav-bar" :class="{hide: current_doc_list_type !== 'myDesktop' && current_doc_list_type !== 'myRelease'}">
                    <!-- 我的作品分类 (创建 + 共享 + 发布) -->
                    <span v-for="item in desktop_type_list" :key="item.key" :class="{'check': desktop_current_type === item.key}" @click="changeDesktopType(item)">{{ item.name }}</span>
                </div>
                <!-- 操作栏 -->
                <div class="operate-bar">
                    <!-- 我的团队特有操作栏 -->
                    <template v-if="current_doc_list_type === 'myTeam'">
                        <!-- 列表搜索 -->
                        <div :class="['search-btn', {show: show_search_doc}]">
                            <base-icon class="iconsousuo" size="24" v-tooltip="`搜索文档`"
                                @click.stop="show_search_doc && search_doc_keyword !== '' ? teamDocRender(current_folder_info.id, search_doc_keyword) : toggleSearchDoc(true)"
                            ></base-icon>
                            <input placeholder="搜索文档"
                                v-model="search_doc_keyword"
                                @keyup.13="teamDocRender(current_folder_info.id,search_doc_keyword)"
                                @click.stop
                            >
                            <i class="clear_btn" v-tooltip="`清空搜索`" v-if="search_doc_keyword !== ''" @click.stop="clearSearchKeyword">×</i>
                        </div>
                        <!-- 文件夹设置按钮 -->
                        <base-icon class="iconshezhi" size="24" v-tooltip="`文件夹设置`"
                            v-if="grade > 0 && ['team_owner','creator'].indexOf(current_folder_info.type) > -1"
                            @click.stop="team_folder_operation_toggle()"
                        ></base-icon>
                        <!-- 文件夹设置下拉框 -->
                        <transition name="modal-fade">
                            <div class="team-setting-dropdown" v-if="team_folder_operation_show">
                                <p @click.stop="rename_doc('team')">重命名</p>
                                <p @click.stop="parent.team_folder_set_member(current_folder_info.id)">成员设置</p>
                                <p @click.stop="deleteDoc('team_inside')">删除</p>
                            </div>
                        </transition>
                        <!-- 列表新建文件夹 -->
                        <base-icon class="icontianjiawenjianjia" size="24" v-tooltip="`新建文件夹`"
                            v-bdtongji="`文档中心-我的团队-文件库-右上角-新建文件夹`"
                            @click="parent.team_create_folder_toggle(true, current_folder_info.id)"
                        ></base-icon>
                    </template>
                    <!-- 我的桌面操作栏 -->
                    <template v-else>
                        <!-- 列表搜索 -->
                        <div :class="['search-btn', {show: show_search_doc}]" v-if="current_doc_list_type === 'myDesktop'">
                            <base-icon class="iconsousuo" size="24" v-tooltip="`搜索文档`" 
                                @click.stop="show_search_doc && search_doc_keyword !== '' ? getDesktopDoc(current_folder_info.id, desktop_current_type, search_doc_keyword) : toggleSearchDoc(true)"
                            ></base-icon>
                            <input placeholder="搜索文档"
                                v-model="search_doc_keyword"
                                @keyup.13="getDesktopDoc(current_folder_info.id,desktop_current_type,search_doc_keyword)"
                                @click.stop
                            >
                            <i class="clear_btn" v-tooltip="`清空搜索`" v-if="search_doc_keyword !== ''" @click.stop="clearSearchKeyword">×</i>
                        </div>
                        <!-- 列表新建文件夹 -->
                        <base-icon class="icontianjiawenjianjia" size="24" v-tooltip="`新建文件夹`"
                            v-if="current_doc_list_type === 'myDesktop' && !show_search_list"
                            v-bdtongji="`文档中心-首页-文件管理-右上角-新建文件夹`"
                            @click="show_create_folder_modal = true"
                        ></base-icon>
                    </template>
                    <!-- 列表批量 -->
                    <base-icon :class="['batch-btn', 'iconpiliang', {'checked': isBatching}]" size="24" v-tooltip="isBatching ? '退出批量' : '批量操作'"
                        v-if="(current_doc_list_type === 'myDesktop' && document_list.length > 0 && !show_search_list) || (current_doc_list_type ==='dustbin' && dustbin_list.length > 0)"
                        v-bdtongji="`文档中心-首页-文件管理-右上角-批量操作`"
                        @click="chooseDocs"
                    ></base-icon>
                    <!-- 列表展示方式 -->
                    <template v-if="current_doc_list_type !=='dustbin' && document_list.length > 0">
                        <base-icon v-if="doc_display_type === 'list'" class="iconpingpu" size="24" v-tooltip="`平埔展示`" @click="changeDisplayType"></base-icon>
                        <base-icon v-else class="iconliebiao" size="24" v-tooltip="`列表展示`" @click="changeDisplayType"></base-icon>
                    </template>
                    <!-- 导入文档 -->
                    <base-button class="import-btn" type="file" accept="application" v-if="current_doc_list_type !== 'dustbin' && current_doc_list_type !== 'myCollect'" height="40" width="128" @change="importDoc"><base-icon class="icondaoruwenjian" size="18"></base-icon>导入</base-button>
                </div>
            </div>
            <!-- 列表二级头部 -->
            <div class="main-sub-head flex flex-between" v-if="doc_display_type === 'list' || isBatching || (doc_bread_header && bread_list.length > 0)">
                <div class="left-bar">
                    <template v-if="doc_display_type === 'list' || bread_list.length > 0">
                        <span :class="['title', {'bread': doc_bread_header}]"
                            v-if="current_doc_list_type !== 'myTeam'"
                            @click="changeDesktopType(desktop_type_list.filter(item => item.key === desktop_current_type)[0])"
                        >
                            {{ doc_bread_header ? desktop_type_list.filter(item => item.key === desktop_current_type)[0].name : '文件名' }}
                        </span>
                        <span :class="['title', {'bread': doc_bread_header}]" v-else @click="teamDocRender('','',true)">我的团队</span>
                    </template>
                    <!-- 面包屑面板 -->
                    <div class="bread-bar" v-if="doc_bread_header && bread_list.length > 0">
                        <span v-for='(item,index) in bread_list'
                            :key="index"
                            @click="back_pre_folder(index)"
                            :class="{noclick: item.id === current_folder_info.id}"
                        ><base-icon class="iconjiantou" size="14" color="#767684"></base-icon>{{item.name}}</span>
                    </div>
                    <!-- 批量操作 -->
                    <div class="batch-bar" v-if="isBatching">
                        <base-icon></base-icon>
                        <p :class="['all', {'check': all_choose}]" @click="getCheckedList('all')"><base-icon class="icondagou" color="#666666" size="14"></base-icon>全选</p>
                        <template v-if="checked_list.length > 0 && current_doc_list_type !== 'dustbin'">
                            <p class="move" @click="moveDoc('doc')">移动</p>
                            <p class="delete" v-if="!batch_forbid_delete" @click="deleteDoc('batch')">删除</p>
                        </template>
                        <template v-else-if="checked_list.length > 0 && current_doc_list_type === 'dustbin'">
                            <p class="recover" @click="doc_batch_operation('recover')">恢复</p>
                            <p class="delete" @click="deleteDoc('dustbin')">彻底删除</p>
                        </template>
                    </div>
                </div>
                <!-- 列表右侧 -->
                <div class="right-bar" v-if="doc_display_type === 'list'">
                    <div class="sort-bar" :class="{'show': show_sort_box}" v-if="current_doc_list_type === 'myDesktop'" @click.stop="show_sort_box = !show_sort_box">
                        <span class="sort-display">{{ doc_sort_type_arr.filter(item => item.key === current_doc_sort_type)[0].display }}</span>
                        <!-- 下拉筛选框 -->
                        <transition name="modal-fade">
                            <ul class="sort-dropdown" v-if="show_sort_box">
                                <li :class="{'checked': item.key === current_doc_sort_type}" v-for="item in doc_sort_type_arr" :key="item.key" @click="changeListSort(item.key)" v-bdtongji="`文档中心-首页-文件管理-右上角-更新时间-${item.name}`">{{ item.name }}</li>
                            </ul>
                        </transition>
                    </div>
                    <span class="options">选项</span>
                </div>
            </div>
            <!-- 列表主体 -->
            <div class="main-body" @scroll="doc_display_type === 'tile' && wrapRoll($event)">
                <!-- 空白状态 -->
                <div class="doc-empty" v-if="document_list.length === 0 && dustbin_list.length === 0 && welcome_document === null && !doc_loading">
                    <template v-if="current_doc_list_type === 'myTeam'">
                        <p>这里空空如也~</p>
                        <span>创建或移动文档过来与团队分享</span>
                    </template>
                    <span v-else-if="!show_search_list">没有任何文档</span>
                    <div v-else>
                        <span>抱歉 Sorry！~没有找到相关的文档</span>
                        <a @click="search_back">返回</a>
                    </div>
                </div>
                <!-- 文档列表 -->
                <draggable v-else class="scroll-wrapper"
                    :list="document_list"
                    :options="{
                        disabled: stop_draggable || show_options_box || (current_doc_list_type !== 'myDesktop' && current_doc_list_type !== 'myTeam') ? true : false,
                        draggable: '.doc-card',
                        animation: 200,
                        ghostClass: 'drag-holder',
                        chosenClass: 'chosen',
                        dragClass: 'dragging',
                        sort: false,
                        forceFallback: true,
                        fallbackTolerance: 15,
                        fallbackClass: 'draggingStyle',
                        filter: '.welcome_document'
                    }"
                    @start="dragDocMove"
                    @end="dragDocToFolder($event)"
                >
                    <transition-group>
                        <!-- 回收站列表 -->
                        <template v-if="dustbin_list.length !== 0 && current_doc_list_type === 'dustbin'">
                            <doc-list-card class="dustbin-card" v-for="(item, index) in dustbin_list" :key="item.id" :docInfo="item" :docIndex="index" @distribute="docCardEventDistribute"></doc-list-card>
                        </template>
                        <!-- 文档列表 -->
                        <template v-for="(item, index) in document_list" v-else>
                            <doc-list-card v-if="doc_display_type === 'list'" :key="item.id" :docInfo="item" :docIndex="index" @distribute="docCardEventDistribute"></doc-list-card>
                            <doc-tile-card v-else :key="item.id || item" :docInfo="item" :docIndex="index" :isFit="true" @distribute="docCardEventDistribute"></doc-tile-card>
                        </template>
                        <!-- 占位列表 -->
                        <template v-if="doc_display_type === 'tile'">
                            <doc-tile-card v-for="item in [1,1,1]" :key="item" :docInfo="item" :isFit="true" :placeholder="true"></doc-tile-card>
                        </template>
                    </transition-group>
                </draggable>
                <!--加载动效-->
                <div class="doc-loading" v-show="doc_loading"><img src="~@/assets/pc/images/edit/category_loading.gif"></div>
            </div>
        </template>
        <card-swiper v-else @seeMore="seeDocMore" @showNextBtn="showNextBtn">
            <template slot="cards">
                <doc-tile-card type="myDesktop" v-for="(item, index) in document_list" :key="item.id" :docInfo="item" :docIndex="index" @distribute="docCardEventDistribute"></doc-tile-card>
            </template>
        </card-swiper>

        <!-- 文档更多操作下拉框 -->
		<doc-options
			v-if="show_options_box"
			:doc_info="current_doc_info"
			:list_type="current_doc_list_type"
			:role_authorities_arr="role_authorities_arr"
			@doc_events_distribute="doc_events_distribute"
		></doc-options>

        <!-- 导出弹窗 -->
        <export-modal ref="exportModal" :document_id="current_doc_info.id"></export-modal>

        <!-- 分享弹框 -->
        <share-modal ref="shareModal" :document-id="current_doc_info.id" @fresh_doc_name="fresh_doc_name"></share-modal>

        <!-- 重命名弹框 -->
        <transition name="modal-fade">
            <div class="options_masking rename" v-if="show_rename_modal">
                <div class="options_modal">
                    <div class="modal-header">
                        <span class="modal-title">重命名</span>
                    </div>
                    <input type="text" v-if="show_rename_modal" maxlength="40" v-focus ref="rename" @keyup.13="submit_rename" @input="rename_tips"/>
                    <div class="modal_btn">
                        <button class="cancel" @click="close_rename">取消</button>
                        <button class="confirm" @click="submit_rename">确定</button>
                    </div>
                </div>
            </div>
        </transition>

        <!-- 移动弹框 -->
        <move-modal ref="moveModal" @confirm_location='get_doc_location'></move-modal>

        <!-- 移动团队文件夹权限弹框 -->
        <transition name="modal-fade">
            <div class="options_masking set_privacy team" v-if="show_team_move_authority" @click.stop>
                <div class="options_modal" v-if="team_member_select_list.length > 0">
                    <!--权限设置面板-->
                    <div class="set_authority_panel" @click="authority_selector_close">
                        <button class="modal-close" @click="team_move_authority_toggle(false)"></button>
                        <div class="modal-header">
                            <a @click="team_move_authority_toggle(false)">返回</a>
                        </div>
                        <div class="modal_content">
                            <p>设置文档权限</p>
                            <p class="right">文档所有者：{{team_member_select_list.filter(data => data.is_mine)[0].memberNickName}}</p>
                            <div class="privacy_bar" @click.stop="toggle_authority_list">
                                <div class="authority_icon"><i :class="interim_authority.document.type"></i></div>
                                <a>{{interim_authority.document.name}}</a>
                                <span class="authority_tip">{{interim_authority.document.describe}}</span>
                            </div>
                        </div>
                        <div class="privacy_tips" v-if="interim_authority.document.type === 'privacy'">设置私密后，获得链接及协作的人都将无法再查看编辑文档</div>
                        <div class="add_partner" v-else>
                            <p class="add_partner_title">选择文档成员：{{team_member_select_list.filter(data => data.check).length - 1}}</p>
                            <p class="add_partner_title right">
                                <a @click="team_member_select_toggle('all')">全选 | </a>
                                <a @click="team_member_select_toggle('cancel')">取消全选</a>
                            </p>
                            <div class="partner_list" v-if="team_member_select_list.length > 1">
                                <!--团队成员列表(不渲染自己)-->
                                <div class="partner_item"
                                    v-for="(item,index) in team_member_select_list"
                                    v-show="!item.is_mine"
                                    :key="index"
                                    :class="{check:item.check,disabled:(['team_owner','creator'].indexOf(item.memberRoleType) >= 0 || item.is_mine)}"
                                    @click="team_check_select_member(index)"
                                >
                                    <img class="partner_head" v-if="item.memberHead === '' || !item.memberHead" src="../../../../public/images/common/default_head.png" alt="">
                                    <img class="partner_head" v-else :src="item.memberHead" alt="">
                                    <span class="partner_name" v-if="item.memberNickName === '' || !item.memberNickName">{{item.memberId}}</span>
                                    <span class="partner_name" v-else>{{item.memberNickName}}</span>
                                    <a class="partner_check" :class="{checked:item.check}"></a>
                                </div>
                            </div>
                            <!-- 不存在其他团员(只存在自己) -->
                            <div class="no_partner" v-if="team_member_select_list.length === 1">
                                <p>你还没有其他成员哦!</p>
                            </div>
                        </div>
                        <div class="modal_footer">
                            <a class="ok_btn" @click="move_cur_folder">确认移动</a>
                            <p>注：移动后会清除该文档之前已有的协作成员</p>
                        </div>
                    </div>
                    <!--文档权限设置面板-->
                    <div class="document_authority_list" v-if="show_authority_list">
                        <div class="authority_item"
                            v-for="(item,index) in document_authority"
                            :key="index"
                            :type="item.type"
                            :class="{checked: item.type === interim_authority.document.type}"
                            @click="checked_document_authority(item)"
                        >
                            <p>{{item.name}}</p>
                            <span>{{item.describe}}</span>
                        </div>
                    </div>
                    <!--权限私密确认框-->
                    <div class="authority_confirm" v-if="show_privacy_confirm" @click.stop>
                        <div class="confirm_inner">
                            <p class="head">设置私密</p>
                            <div class="body">
                                <p>设置私密仅自己查看后，</p>
                                <p>获得链接及协作的人都将无法再编辑查看文档。</p>
                            </div>
                            <div class="foot">
                                <a @click="privacy_confirm_cancel">取消</a>
                                <a @click="privacy_confirm_sure">确定</a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </transition>

        <!-- 新建文件夹 -->
        <transition name="modal-fade">
            <div class="options_masking create-folder" v-if="show_create_folder_modal">
                <div class="options_modal">
                    <div class="modal-header">
                        <span class="modal-title">新建文件夹</span>
                        <button class="modal-close" @click="closeCreateFolderModal"></button>
                    </div>
                    <input maxlength="40" type="text" name="" placeholder="请输入文件夹名称" ref="folderName" @keyup.13="createFolder" v-focus />
                    <div class="modal_btn">
                        <button class="cancel" @click="closeCreateFolderModal">取消</button>
                        <button class="confirm" @click="createFolder">确定</button>
                    </div>
                </div>
            </div>
        </transition>
        
        <!-- h5预览弹框 -->
        <h5-preview ref="h5Preview"></h5-preview>

        <!-- 通用删除弹框 -->
        <delete-modal ref="deleteModal"></delete-modal>

        <!-- 权限弹框 -->
        <transition name="modal-fade">
            <div class="options_masking set_privacy" v-if="show_authority" @click.stop>
                <div class="options_modal">
                    <!--权限设置面板-->
                    <div class="set_authority_panel" @click="authority_selector_close">
                        <button class="modal-close" @click="close_privacy" v-bdtongji="`文档中心-首页-文件管理-全部-权限设置弹窗-关闭`"></button>
                        <div class="modal-header">
                            <p>权限设置</p>
                            <span>文档所有者：{{user.name}}</span>
                        </div>
                        <div class="modal_content">
                            <div class="privacy_bar" @click.stop="toggle_authority_list">
                                <div class="authority_icon"><i :class="interim_authority.document.type"></i></div>
                                <a>{{interim_authority.document.name}}</a>
                                <span class="authority_tip">{{interim_authority.document.describe}}</span>
                            </div>
                        </div>
                        <div class="privacy_tips" v-if="interim_authority.document.type === 'privacy'">设置私密后，获得链接及协作的人都将无法再查看编辑文档</div>
                        <div class="add_partner" v-else>
                            <p class="add_partner_title">指定权限的成员：{{interim_authority.partner.length}}</p>
                            <span class="add_partner_btn" v-if="current_doc_list_type === 'myTeam'" @click="parent.team_authority_modal_show">+添加指定成员</span>
                            <span class="add_partner_btn" v-else @click="toggle_add_partner" v-bdtongji="'文档中心-首页-文件管理-全部-权限设置弹窗-添加协作成员'">+添加协作成员</span>
                            <div class="partner_list">
                                <!--所有者-->
                                <div class="partner_item"
                                    v-for="partner in interim_authority.partner"
                                    v-if="partner.collaborateRoleType === 'owner' && !partner.teamowner"
                                    :class="{checked:editing_partner.owner}"
                                >
                                    <img class="partner_head" :src="partner.head" alt="">
                                    <span class="partner_name">{{partner.nickName}}</span>
                                    <a class="partner_authority"
                                    :class="{unable:interim_authority.partner.length <= 1}"
                                    @click.stop="interim_authority.partner.length > 1 && toggle_partner_authority($event, {img:partner.head, name:partner.nickName, owner:true, authority:''})"
                                    >所有者</a>
                                </div>
                                <!-- 管理者（团队专属） -->
                                <div class="partner_item"
                                    v-else-if="partner.teamowner"
                                    :class="{checked:partner.checked}"
                                >
                                    <img class="partner_head" v-if="partner.invitee || partner.head === '' || !partner.head" src="../../../../public/images/common/default_head.png" alt="">
                                    <img class="partner_head" v-else :src="partner.head" alt="">
                                    <span class="partner_name" v-if="partner.nickName === '' || !partner.nickName">{{partner.memberId}}</span>
                                    <span class="partner_name" v-else>{{partner.nickName}}</span>
                                    <a class="partner_authority unable">团队管理者</a>
                                </div>
                                <!--协作者列表-->
                                <div class="partner_item"
                                    v-else
                                    :class="{checked:partner.checked}"
                                >
                                    <img class="partner_head" v-if="partner.invitee || partner.head === '' || !partner.head" src="../../../../public/images/common/default_head.png" alt="">
                                    <img class="partner_head" v-else :src="partner.head" alt="">
                                    <span class="partner_name" v-if="partner.invitee">{{partner.invitee}}</span>
                                    <span class="partner_name" v-else-if="partner.nickName === '' || !partner.nickName">{{partner.memberId}}</span>
                                    <span class="partner_name" v-else>{{partner.nickName}}</span>
                                    <span class="invitee_partner" v-if="partner.invitee">外部</span>
                                    <a class="partner_authority" @click.stop="toggle_partner_authority($event, partner)">{{partner.collaborateRoleName}}</a>
                                </div>
                            </div>
                        </div>
                    </div>
                    <!--所有者权限下拉框-->
                    <div class="partner_authority_list change_owner"
                        v-if="editing_partner.owner"
                        v-show="show_partner_authority"
                        :style="{top:partner_authority_top+'px'}"
                    >
                        <div class="partner_authority_item" @click="change_document_owner">
                            <p>转让所有权</p>
                        </div>
                    </div>
                    <!--协作者权限下拉框-->
                    <div class="partner_authority_list"
                        v-if="!editing_partner.owner"
                        v-show="show_partner_authority"
                        :style="{top:partner_authority_top+'px'}"
                    >
                        <div class="partner_authority_item"
                            v-for="item in partner_authority"
                            :class="{checked:item.type === editing_partner.authority}"
                            @click="checked_partner_authority(item)"
                        >
                            <span v-if="item.describe">{{item.name}}</span>
                            <span v-if="item.describe">{{item.describe}}</span>
                            <p v-else>{{item.name}}</p>
                        </div>
                    </div>
                    <!--文档权限设置面板-->
                    <div class="document_authority_list" v-if="show_authority_list">
                        <div class="authority_item"
                            v-for="item in document_authority"
                            :type="item.type"
                            :class="{checked: item.type === interim_authority.document.type}"
                            @click="checked_document_authority(item)"
                            v-bdtongji="'文档中心-首页-文件管理-全部-权限设置弹窗-'+item.name"
                        >
                            <p>{{item.name}}</p>
                            <span>{{item.describe}}</span>
                        </div>
                    </div>
                    <!--权限私密确认框-->
                    <div class="authority_confirm" v-if="show_privacy_confirm" @click.stop>
                        <div class="confirm_inner">
                            <p class="head">设置私密</p>
                            <div class="body">
                                <p>设置私密仅自己查看后，</p>
                                <p>获得链接及协作的人都将无法再编辑查看文档。</p>
                            </div>
                            <div class="foot">
                                <a @click="privacy_confirm_cancel">取消</a>
                                <a @click="privacy_confirm_sure">确定</a>
                            </div>
                        </div>
                    </div>
                    <!--选择转让者面板-->
                    <div class="change_owner_panel" v-if="change_owner_step === 'chose_owner'" @click="cancel_change_owner">
                        <div class="change_owner_inner" @click.stop>
                            <p>选择转让对象</p>
                            <div class="change_owner_list">
                                <div class="owner_item" v-for="partner in interim_authority.partner" v-if="!partner.invitee && partner.collaborateRoleType !== 'owner'">
                                    <img class="partner_head" v-if="partner.invitee" src="../../../../public/images/common/default_head.png" alt="">
                                    <img class="partner_head" v-else :src="partner.head" alt="">
                                    <span class="partner_name" v-if="partner.invitee">{{partner.invitee}}</span>
                                    <span class="partner_name" v-else>{{partner.nickName}}</span>
                                    <a @click="show_sure_change(partner)">转让</a>
                                </div>
                            </div>
                        </div>
                    </div>
                    <!--选择转让确认弹框-->
                    <div class="sure_change_owner_panel" v-if="change_owner_step === 'sure_change'">
                        <div class="sure_change_owner">
                            <p class="title">确认转让所有权？</p>
                            <div class="tips">
                                <p>确定要将文档所有者权限转让给 <span>{{chose_owner_partner.nickName}}</span> ?</p>
                                <p>转让后，新的所有者可以管理、移动、编辑文件，也可以删除您的访问权限。</p>
                            </div>
                            <div class="button_bar">
                                <a @click="cancel_change_owner">取消</a>
                                <a @click="sure_change_owner">确认</a>
                            </div>
                        </div>
                    </div>
                    <!--移除协作确认框-->
                    <div class="authority_confirm" v-if="show_remove_confirm" @click.stop>
                        <div class="confirm_inner">
                            <p class="head">确认移除</p>
                            <div class="body">
                                <p>移除后，{{editing_partner.nickName}}将无法{{delete_authority_text_map[editing_partner.collaborateRoleType]}}该演示文档</p>
                            </div>
                            <div class="foot">
                                <a @click="remove_confirm_cancel">取消</a>
                                <a @click="remove_confirm_sure">确定</a>
                            </div>
                        </div>
                    </div>
                    <!--添加协作者面板-->
                    <div class="add_partner_panel" v-if="show_add_partner">
                        <div class="add_partner_head">
                            <a @click="toggle_add_partner"><返回</a>添加协作成员
                        </div>
                        <div class="search_partner">
                            <input type="text" placeholder="输入手机、邮箱、昵称或用户ID添加协作成员"
                                ref="search_partner_input"
                                @focus="$event.target.parentNode.style.borderColor = '#0d7bf7'"
                                @input="search_partner($event)"
                                @blur="$event.target.parentNode.style.borderColor = '#ccd3db'"
                            >
                            <i class="clear_input" v-if="interim_authority.search_keyword !== ''" @click="clear_search_partner"></i>
                        </div>
                        <a href="https://www.woodo.cn/slides/?url=1553258579" target="_blank" class="partner_invite_tips"><i class="edit-ico edit-ico-horn"></i>快去邀请好友协作文档赢幻币吧~</a>
                        <div class="search_partner_result">
                            <p v-if="interim_authority.search_keyword === ''">最近</p>
                            <!--列表（已添加）-->
                            <div class="partner_item"
                                v-if="interim_authority.added_partner.length > 0 && interim_authority.search_keyword === ''"
                                v-for="partner in interim_authority.added_partner"
                            >
                                <img class="partner_head" v-if="partner.invitee || partner.head === '' || !partner.head" src="../../../../public/images/common/default_head.png" alt="">
                                <img class="partner_head" v-else :src="partner.head" alt="">
                                <span class="partner_name" v-if="partner.invitee">{{partner.invitee}}</span>
                                <span class="partner_name" v-else-if="partner.nickName === '' || !partner.nickName">{{partner.memberId}}</span>
                                <span class="partner_name" v-else>{{partner.nickName}}</span>
                                <span class="invitee_partner" v-if="partner.invitee">外部</span>
                                <a class="partner_authority" @click="toggle_partner_authority($event, partner)">{{partner.collaborateRoleName}}</a>
                            </div>
                            <!--列表（最近）-->
                            <div class="partner_item"
                                v-if="interim_authority.recommend_partner.length > 0 && interim_authority.search_keyword === ''"
                                v-for="partner in interim_authority.recommend_partner"
                            >
                                <img class="partner_head" v-if="partner.invitee || partner.head === '' || !partner.head" src="../../../../public/images/common/default_head.png" alt="">
                                <img class="partner_head" v-else :src="partner.head" alt="">
                                <span class="partner_name" v-if="partner.invitee">{{partner.invitee}}</span>
                                <span class="partner_name" v-else-if="partner.nickName === '' || !partner.nickName">{{partner.memberId}}</span>
                                <span class="partner_name" v-else>{{partner.nickName}}</span>
                                <span class="invitee_partner" v-if="partner.invitee">外部</span>
                                <a class="add_partner_btn" @click="add_interim_partner(partner)">添加</a>
                                <a class="remove_partner_btn edit-ico edit-ico-delete_2" @click="remove_interim_partner(partner)" title="移除"></a>
                            </div>
                            <!--列表（搜索）-->
                            <div class="partner_item"
                                v-for="partner in interim_authority.search_result"
                                v-if="interim_authority.search_result.length > 0 && interim_authority.search_keyword !== ''"
                            >
                                <img class="partner_head" v-if="partner.invitee || partner.head === '' || !partner.head" src="../../../../public/images/common/default_head.png" alt="">
                                <img class="partner_head" v-else :src="partner.head" alt="">
                                <span class="partner_name" v-if="partner.invitee">{{partner.invitee}}</span>
                                <span class="partner_name" v-else-if="partner.nickName === '' || !partner.nickName">{{partner.memberId}}</span>
                                <span class="partner_name" v-else>{{partner.nickName}}</span>
                                <span class="invitee_partner" v-if="partner.invitee">外部</span>
                                <a class="add_partner_btn" v-if="!partner.documentCollaborateId" @click="add_interim_partner(partner)">添加</a>
                                <a class="partner_authority" v-if="partner.documentCollaborateId"  @click="toggle_partner_authority($event, partner)">{{partner.collaborateRoleName}}</a>
                            </div>
                            <!--空状态-->
                            <div class="empty_partner"
                                v-if="(interim_authority.search_keyword === '' && interim_authority.recommend_partner.length <= 0 && interim_authority.added_partner.length <= 0) || (interim_authority.search_keyword !== '' && interim_authority.search_result.length <= 0)"
                            >
                                <p>無</p>
                                <span v-if="interim_authority.search_keyword === ''">暂无成员</span>
                                <span v-else>没有搜索结果</span>
                            </div>
                        </div>
                        <div class="add_partner_foot">
                            <a class="add_from_wechat">添加微信好友</a>
                            <div class="add_partner_ewm">
                                <div class="code_outer">
                                    <div id='partner_code'></div>
                                    <canvas id="document_collaborate_ewm_canvas"></canvas>
                                </div>
                                <span>微信扫码邀请好友</span>
                            </div>
                            <a class="ok_btn"
                            :class="{unable:interim_authority.added_partner.length <= 0}"
                            :disable="interim_authority.added_partner.length <= 0"
                            @click="sure_add_partner"
                            >确定</a>
                        </div>
                    </div>
                </div>
            </div>
        </transition>

        <!--更多协作者弹框-->
        <transition name="modal-fade">
            <div class="options_masking all_partners" v-if="show_all_partners" @click.stop="toggleAllPartners">
                <div class="options_modal" @click.stop>
                    <button class="modal-close" @click="toggleAllPartners"></button>
                    <div class="modal-header">
                        <p>{{interim_authority.partner.length - 1}}人协作者</p>
                    </div>
                    <div class="modal_content">
                        <div class="partner_item"
                            v-for="partner in interim_authority.partner"
                            v-if="partner.collaborateRoleType !== 'owner'"
                            :class="{checked:partner.checked}"
                        >
                            <img class="partner_head" v-if="partner.invitee || partner.head === '' || !partner.head" src="../../../../public/images/common/default_head.png" alt="">
                            <img class="partner_head" v-else :src="partner.head" alt="">
                            <span class="partner_name" v-if="partner.invitee">{{partner.invitee}}</span>
                            <span class="partner_name" v-else-if="partner.nickName === '' || !partner.nickName">{{partner.memberId}}</span>
                            <span class="partner_name" v-else>{{partner.nickName}}</span>
                            <a class="partner_authority"
                            v-if="interim_authority.partner.filter(item => item.collaborateRoleType === 'owner').length && interim_authority.partner.filter(item => item.collaborateRoleType === 'owner')[0].memberId === user.id"
                            @click="toggle_partner_authority($event, partner)"
                            >{{partner.collaborateRoleName}}</a>
                            <a class="partner_authority unable" v-else>{{partner.collaborateRoleName}}</a>
                        </div>
                    </div>
                    <!--协作者权限下拉框-->
                    <div class="partner_authority_list" v-show="show_partner_authority" :style="{top:partner_authority_top+'px'}">
                        <div class="partner_authority_item"
                            v-for="item in partner_authority"
                            :class="{checked:item.type === editing_partner.authority}"
                            @click="checked_partner_authority(item)"
                        >
                            <span v-if="item.describe">{{item.name}}</span>
                            <span v-if="item.describe">{{item.describe}}</span>
                            <p v-else>{{item.name}}</p>
                        </div>
                    </div>
                </div>
            </div>
        </transition>
    </div> 
</template>

<script>
    /**
     *  文档中心 - 文档列表主体
     */
    import QRCode from 'qrcode';
	import draggable from 'vuedraggable';
	import ws_client from '@/assets/common/js/ws_client.js';
	import collaborate from '@/assets/common/js/collaborate.js';
	import edit_directive from '@/assets/pc/js/edit_directive.js';
	import h5Preview from '@/components/H5Preview.vue';
    import moveModal from '@/components/MoveModal.vue';
    import shareModal from '@/components/ShareModal.vue';
	import exportModal from '@/components/ExportModal.vue';
    import deleteModal from  '@/components/DeleteModal.vue'
    import DocListCard from '@/views/pc/DocCenter/DocListCard.vue';
    import DocTileCard from '@/views/pc/DocCenter/DocTileCard.vue';
	import docOptions from '@/views/pc/DocCenter/DocCenterOptions.vue';
    import CardSwiper from '@/components/CardSwiper.vue';
    export default {
        name: "DocListMain",
        components: {
            DocListCard,
            DocTileCard,
            moveModal,
			draggable,
			shareModal,
            deleteModal,
			docOptions,
			h5Preview,
			exportModal,
            CardSwiper
		},
        props: ["latest_list"],
        inject: ["center", "parent"],
        provide() {
            return {
                main: this
            }
        },
        data(){
            return{
				/* 文档相关 */
				user: {             					//用户信息   默认值显示
					hcoin: 0,
					memberInviteCode: '',
				},
				role_authorities_arr:[],                //文档角色权限

				// 通用相关
				doc_loading: true,                      //文档列表初始加载动效
				doc_display_type: 'tile',               //文档展示方式（列表list,平铺tile）
				show_sort_box: false,                   //展示文档时间筛选项
				show_search_doc: false,                 //展示搜索文档输入框
				show_rename_modal: false,               //展示重命名弹框
				show_create_folder_modal: false,        //展示新建文件夹弹框
				stop_draggable: false,                  //停止文档拖动
				grade: 0,                               //当前文件夹层级
				doc_type: "",                           //当前操作文档类型（文档/文件夹）
				current_doc_list_type: 'myDesktop',     //当前文档列表类型key
				current_doc_info:{},                    //当前文档信息
				current_doc_index: "",                  //当前文档索引
				current_folder_info: null,              //当前父级文件夹信息
				current_doc_sort_type:'update_recent',  //文档时间排序类型
				document_list: [0,0,0,0,0,0],           //文档列表
				dustbin_list: [],                       //垃圾箱列表
				bread_list: [],                         //面包屑列表（文件夹层级数组）
				open_recent_doc: [],                    //最近打开的文档Id数组
				doc_sort_type_arr:[
					{display:"最近打开",name:"按最近打开",key:"open_recent"},
                    {display:"最近更新",name:"按最近更新",key:"update_recent"},
					{display:"字母排序",name:"按文档首字母",key:"acronym_sort"}
				],
				previous_list_path:"myDesktop",         //上次所在文档分类/文件夹
				previous_grade_path:'',
				doc_bread_header: false,                //展示文档列表面包屑
				doc_old_name: '',                       //当前文档未修改前名称

				// 我的桌面相关
				desktop_current_type: 'myAll',       //当前文档列表类型key
				search_doc_keyword:'',
				show_search_list: false,            // 搜索列表展示标识
				desktop_type_list:[
					{key:'myAll',name:'所有设计', owner:''},
					{key:'myBuild',name:'我创建的', owner:true},
					{key:'myShare',name:'共享给我的', owner:false},
					{key:'myRelease',name:'我的发布', owner:'release'},
				],
                welcome_document: null,             // 欢迎文档

				// 文档菜单相关
				show_options_box: false,                //展示文档菜单栏

				// 移动文件夹相关
				target_folder_info: {},                  // 移动目标文件夹信息
				current_move_folder_type: 'myDesktop',   // 移动目标文件夹类型(myDesktop:我的文档,myTeam:我的团队)
				
				// 文档拖动相关
				doc_dragging: false,
				drag_doc_offset:'',
				current_drag_folder_info:{},

				// 批量操作相关
				checked_list:[],						//选中批量操作列表
				isBatching:false,			         	//是否锁定批量操作
				all_choose:false,
				batch_forbid_delete: false,             // 禁止批量删除标识（存在选择文档）

				//websocket
				ws_client_method:{},

				/* 权限设置相关 */
				// 全部文档协作者对象
				collaborates_document:{},
				// 修改权限时，临时权限对象
				interim_authority:{
					// 文档权限
					document: {
						type:'open',
						name: '任何人都可查看',
						describe: '获得链接的人都可以查看'
					},
					// 当前文档已添加的协作成员
					partner: [
						{
							memberId: '',
							authority: '',
						}
					],
					// 新添加协作者列表
					added_partner:[],
					// 最近协作者列表
					recommend_partner:[],
					// 搜索结果
					search_result:[],
					// 搜索关键词
					search_keyword: '',
				},
				// 文档权限列表
				document_authority:[
					{
						type:'open',
						name: '任何人都可查看',
						describe: '获得链接的人都可以查看'
					},
					{
						type:'edit',
						name: '任何人都可编辑',
						describe: '获得链接的人都可以编辑'
					},
					{
						type:'exclusive',
						name: '指定专属成员',
						describe: '仅指定的成员可查看/编辑'
					},
					{
						type:'privacy',
						name: '私密',
						describe: '仅自己可查看/编辑'
					},
				],
				// 协作权限列表(数组)
				partner_authority:[],
				// 权限设置 - 显示隐藏
				show_authority: false,
				// 权限设置 - 文档权限列表标识
				show_authority_list: false,
				// 权限设置 - 私密确认框标识
				show_privacy_confirm: false,
				// 转让所有 - 转让所有权步骤 => null -> chose_owner -> sure_change
				change_owner_step: null,
				// 转让所有 - 选中转让人
				chose_owner_partner: false,
				// 添加协作者 - 面板标识
				show_add_partner: false,
				// 添加协作者 - 正在添加标识
				adding_partner: false,
				// 通用 - 协作者权限编辑框
				show_partner_authority: false,
				// 通用 - 正在编辑协作者
				editing_partner: {
					img:'',
					name: '',
					authority: '',
					owner: false,
				},
				// 通用 - 协作者权限编辑框定位
				partner_authority_top: 0,
				// 通用 - 移除协作确认框标识
				show_remove_confirm: false,
				// 全部协作者弹框标识
				show_all_partners: false,
				// 文档下拉权限
				document_option_authority:[],
				// 移除成员协作提示内容优化
				delete_authority_text_map: {
					'onlyView': '查看',
					'onlyReview': '评论',
					'edit': '编辑'
                },

                // 团队相关
                team_member_select_list: [],
                show_team_move_authority: false,
				team_folder_operation_show: false,    // 团队文件夹设置下拉框标识(头部)

                show_title_num: 0, // 可视窗口展示的title个数
                mousewheel_throttle: false,
            }
		},
        mounted () {
            const that = this;
			// 获取会员信息
			that.get_member_info();
			// 获取用户信息
			that.user = that.$common.get_login_state();
			// 下载弹窗更新幻币数量， 使用mouseup事件的原因：modal中阻止了click事件传递
			$(document).on('mouseup', '.hcoin-download-modal button', function(){
				setTimeout(() => {
					that.get_member_info();
				}, 500);
			});
			// 最近打开文档
			if(!localStorage.getItem("open_recent_doc")) {
				localStorage.setItem("open_recent_doc", JSON.stringify(that.open_recent_doc));
			}else{
				that.open_recent_doc = JSON.parse(localStorage.getItem('open_recent_doc'));
			}

            // 获取协作列表
            that.get_document_collaborates();
            // 获取文档角色权限
            that.get_role_authorities();
            that.ws_init();
            setInterval(function(){that.get_document_collaborates();}, 60000);
            // 获取协作者权限列表
            let authority = Object.values(collaborate.authority_map);
            authority.shift();
            that.partner_authority = authority;

            $(document).on('click', () => { that.closeAllBox() })

            if (that.parent.$options.name === 'DocRecommend') {
                that.current_doc_list_type = 'myDesktop';
                return;
            } else if (that.parent.$options.name === 'docTeam') {
                that.chooseType('myTeam');
            } else {
                that.chooseType('myDesktop');
            }

            if(localStorage.getItem(`${that.current_doc_list_type}_display_type`)) {
                that.doc_display_type = localStorage.getItem(`${that.current_doc_list_type}_display_type`);
            }
            if(that.doc_display_type === 'tile') {
                that.cal_show_title_num();
            }
        },
        watch: {
            "parent.list_type": {
                handler(n) {
                    this.chooseType(n);
                }
            },
            current_doc_info: {
                handler(n) {
                    if(this.latest_list) {
                        this.current_folder_info = {id: n.documentCollaborateFolder};
                    }
                },
                deep: true
            },
            latest_list: {
                handler(n) {
                    if(n) {
                        this.document_list = n;
                    }
                },
                immediate: true
            },
        },
        computed: {
        },
        methods:{
            //websocket
			ws_init() {
				try{
					let that = this;
					ws_client({
						success : function(method){
							that.ws_client_method = method;
		                    //文档在线用户
							that.ws_client_method.set_doc_online_members(that.ws_set_doc_online_members);
						},
						error : function(msg){
							console.error(msg);
						}
					});
            	}catch(e){
            		console.error(e);
            	}
			},
			//文档在线人数
			ws_get_doc_online_members(docIds) {
				try{
					let that = this;
					if(that.ws_client_method.get_doc_online_members) that.ws_client_method.get_doc_online_members(docIds);
				}catch(e){
					console.error(e);
				}
			},
			ws_set_doc_online_members(data) {
				try{
					let that = this,
						collaborates_document = JSON.parse(JSON.stringify(that.collaborates_document));
					// 错误情况判断
					if(collaborates_document.length < 0) return false;
					// 遍历全部文档协作者 判断在线
					let collaborates_document_keys = Object.keys(collaborates_document);
					for(let key in collaborates_document_keys){
						let document_online = data[collaborates_document_keys[key]] || false;
						if(document_online){
							let document_partner = collaborates_document[collaborates_document_keys[key]];
							document_partner.forEach(function(partner){
								// 判断是否在线
								partner.online = partner.memberId && Object.keys(document_online).indexOf(partner.memberId.toString()) >= 0;
								// 获取在线颜色
								partner.color = document_online[partner.memberId] && document_online[partner.memberId].color;
							});
						}
					}
					// 遍历全部文档协作者 在线置顶
					for(let key in collaborates_document){
						let list = collaborates_document[key],
							list_online = list.filter(list => list.online),
							list_offline = list.filter(list => !list.online);
						if(list_online.length > 0) collaborates_document[key] = list_online.concat(list_offline);
					}
					that.collaborates_document = collaborates_document;
				}catch(e){
					console.error(e);
				}
			},
			// 文档权限
			ws_doc_authority_send() {
				try{
					let that = this,
						id = that.interim_authority.document.id,
						data = {
							document: that.interim_authority.document,
							partner: that.interim_authority.partner
						};
					if(that.ws_client_method.doc_authority_send) that.ws_client_method.doc_authority_send(id, data);
				}catch(e){
					console.error(e);
				}
			},
			// 文档删除
			ws_doc_delete_send() {
				try{
					let that = this;
					if(that.ws_client_method.doc_delete_send) that.ws_client_method.doc_delete_send(that.current_doc_info.id);
				}catch(e){
					console.error(e);
				}
			},
			
			/* 文档相关事件 */
			// 通用方法
			// 获取用户信息
			get_member_info() {
				let that = this;
				that.$axios.get('/api/member/information/').then((result)=>{
					let data = result.data;
					if (data.type === 'success') {
						that.user = $.extend(that.user, data.data);
						if (that.user.memberRankExpire) {
							that.user.memberRankExpire = that.$common.date_format(new Date(that.user.memberRankExpire), 'yyyy/MM/dd');
						}
					} else {
						that.$toast('获取用户信息失败', 800);
					}
				}).catch((err)=>{
					console.log(err);
					that.$toast('获取用户信息失败', 800);
				});
			},
			// 获取文档角色权限
			get_role_authorities() {
				let that = this;
				that.$axios.get('/api/member/document_collaborate/role_authorities/').then((data)=>{
					if (data.data.code == 2) {
						that.role_authorities_arr = data.data.data;
					}
				})
			},
			// 比对操作权限
			check_option_disabled(data, role) {
				if (!role) return false;
				if (!data) return false;
				let option_authority = this.role_authorities_arr[role].authorityTypes;
				if (option_authority.length <= 0) return false;
				if (option_authority.indexOf(data) < 0) return false;
				return true;
			},
			// 文档下拉组件事件分发
			doc_events_distribute(type,params) {
				let that = this;
				let doc_info = that.current_doc_info;
				switch (type) {
					case 'share':
						that.shareDoc(doc_info);
						break;
					case 'edit':
                        that.edit_doc(doc_info, this.current_doc_index, true);
						break;
					case 'h5':
						that.open_preview_h5(doc_info);
						break;
					case 'move':
                        that.moveDoc(params.type,params.authority); 
						break;
					case 'rename':
						that.rename_doc(params.type,doc_info.name);
						break;
					case 'privacy':
						that.set_doc_privacy(doc_info);
						break;
					case 'copy':
						that.$check_rankauth.documentCreateAndRecovery().then(function(){
							that.copy_doc(doc_info);
						});
						break;
					case 'export':
						that.$refs.exportModal.show_modal();
						that.closeAllBox();
						break;
					case 'delete':
						that.deleteDoc(params.type);
						break;
					case 'quit_cooperation':
						that.quit_Cooperation(doc_info);
						break;
					case 'member':
						that.parent.team_folder_set_member(doc_info.id);
						break;
					case 'enter_folder':
						that.enter_current_folder(doc_info);
						break;
					case 'preview':
						that.center.previewDoc(doc_info);
						break;
					case 'uncollect':
						that.template_delete_collect(doc_info);
						break;
					case 'recover':
						that.recovery_doc();
						break;
					case 'dustbin_delete':
						that.dustbin_delete_modal();
						break;
					case 'open_welcome_document':
						that.use_template(doc_info,true);
						break;
					case 'delete_welcome_document':
						that.delete_welcome_document();
						break;
					default:
						break;
				}
			},
			// 文档卡片事件分发
            docCardEventDistribute(type, doc, params) {
                switch (type) {
                    case 'edit':
                        if (this.current_doc_list_type === 'myRelease' || this.current_doc_list_type === 'myCollect'){
                            this.use_template(doc);
                        } else {
                            this.edit_doc(doc, params.index);
                        }
                        break;
                    case 'mousedown':
                        this.startDragDoc(params.e, doc);
                        break;
                    case 'mouseenter':
                        this.dragIntoFolder(doc, true);
                        break;
                    case 'mouseleave':
                        this.dragIntoFolder(doc, false);
                        break;
                    case 'setting':
                        this.openOptionsDropdown(params.e, doc, params.index);
                        break;
                    case 'share':
                        this.shareDoc(doc);
                        break;
                    case 'top':
                        this.topDoc(doc, params.index);
                        break;
                    case 'batch':
                        this.getCheckedList(doc, params.index);
                        break;
                    case 'partner':
                        this.toggleAllPartners(doc);
                        break;
                    case 'preview':
                        this.center.previewDoc(doc);
                        break;
                    default:
                        break;
                }
            },
			// 切换我的桌面文档类型
			changeDesktopType(item) {
				let that = this;
				that.desktop_current_type = item.key;
				// 初始化列表状态
				that.int_document_list();
				that.doc_bread_header = false;
				// 重置搜索框
				that.search_doc_keyword = '';
				that.show_search_doc = false;
				// 列表置顶
				$('.main-body').animate({scrollTop: 0}, 500);
				if(item.owner === 'release'){
					// 获取我的发布
					that.get_release_doc();
					that.current_doc_list_type = item.key;
				}else{
					// 获取我的文档
					that.getDesktopDoc('',item.key);
				}
			},
			// 初始化列表状态
			int_document_list() {
				let that = this;
				// 清空文件选中
				that.all_choose = false;
				that.isBatching = false;
				that.show_search_list = false;
				that.current_doc_index = '';
				that.document_list = [];
				that.checked_list = [];
				that.dustbin_list = [];
				// 重置团队面板
				that.team_panel_type = 'doc';
				// 欢迎文档
				that.welcome_document = null;
			},
			// 关闭文档相关弹框
			closeAllBox(e) {
				// 关闭文档设置框
				this.show_options_box = false;
				// 关闭文档排序下拉框
				this.show_sort_box = false;
				// 关闭文件夹设置弹框
				this.team_folder_operation_show = false;
				// 关闭文档搜索框
				if(this.search_doc_keyword === '') this.toggleSearchDoc(false);
			},
			// 文档列表类型切换
			chooseType(type) {
				let	that = this;
                that.current_doc_list_type = type;
				// 重置列表状态
				that.int_document_list();
				// 重置搜索框
				that.search_doc_keyword = '';
				that.show_search_doc = false;
				// 重置面包屑
				that.doc_bread_header = false;
				// 清除url参数
				window.history.pushState(null, null, '/home/');
				$('.main-body').animate({scrollTop: 0}, 500);
				switch (type) {
					case 'dustbin':      // 回收站
						that.getDustbin();
						break;
					case 'myCollect':    // 我的收藏
						that.getCollect();
						break;
					case 'myTeam':       // 我的团队
                        that.teamDocRender('', '');
						break;
					case 'myDesktop':     // 我的桌面
						// 不存在文件夹路径
                        that.getDesktopDoc('','myAll');
						break;
					case 'myRelease':      // 我的发布
						that.changeDesktopType(that.desktop_type_list.filter(item => item.key === type)[0]);
						break;
					default:
						break;
				}
			},
			/**
			 * 获取我的桌面文档列表
			 * @param fId 文件夹ID
			 * @param isOwnerRole 是否所有者角色，myAll：所有，myBuild：所有者，myShare：非所有者
			 * @param keyword 关键字，根据文档、文件夹标题筛选	
			 * @param nobread 是否展示面包屑标识
			 */
			getDesktopDoc(fId,isOwnerRole,keyword,nobread) {
				let that = this;
				let document_list = [];
				that.doc_loading = true;
				that.int_document_list();
				that.current_doc_list_type = 'myDesktop';
				// 清空面包屑
				if (nobread) that.doc_bread_header = false;
				// 保留搜索
				if (keyword && keyword !== '') that.show_search_list = true;
				if (isOwnerRole === 'myAll') {
					isOwnerRole = '';
				} else if (isOwnerRole === 'myBuild') {
					isOwnerRole = true;
				} else if (isOwnerRole === 'myShare') {
					isOwnerRole = false;
				}
                // 获取文件夹层级，且返回时显示所在层级
                let has_bread_list = sessionStorage.getItem('previous_grade_path');
                let prev_path = sessionStorage.getItem('previous_list_path');
                if (prev_path === 'myDesktop' && has_bread_list && has_bread_list !== '""') {
                    that.doc_bread_header = true;
                    that.bread_list = JSON.parse(has_bread_list).bread;
                    let lastItem = that.bread_list[that.bread_list.length - 1];
                    that.current_folder_info = lastItem;
                    fId = lastItem.id;
                    sessionStorage.setItem('previous_grade_path', '');
                }
				that.$axios.get('/api/member/my_document/', {params: {
					fId: fId,
					isOwnerRole: isOwnerRole,
					keyword: keyword
				}}).then(res => {
                    let {data, code} = res.data;
					if (code === '2') {
						// 隐藏加载框
						that.doc_loading = false;
						let children_folders = data.childrenFolders || [];
						let current_folder_info = data.currentFolder || null;
                        
						document_list = data.documentList;
                        
                        //欢迎文档
						that.welcome_document = data.welcomeDocument;
						if (that.welcome_document !== null) {
							that.welcome_document.is_welcome_document = true;
                            document_list.push(data.welcomeDocument);
						}
						// 组装文档列表
						if (document_list.length > 0) {
                            document_list.map(item => {
                                item['page'] = that.$common.document_pages_dataparse([item.documentPage])[0];
                                item.checked = false;
								if (item.collaborateCreateDate && item.collaborateCreateDate > item.modifyDate) {
									item.modifyDate = item.collaborateCreateDate;
								}
                            })
							// 按时间戳排序 && 排除置顶
							document_list = document_list.sort((a, b) => {
								return b.topTime - a.topTime || b.modifyDate - a.modifyDate;
							});
						}
                        if (children_folders.length > 0) {
                            children_folders = children_folders.sort((a, b) => {
								return b.modifyDate - a.modifyDate;
							});
                        }
                        // 重组文档列表 组合文件夹和文件
                        document_list = children_folders.concat(document_list);
                        document_list.map((item, index) => {
                            if(index < that.show_title_num) {
                                item.isRender = true;
                            } else {
                                item.isRender = false;
                            }
                        })
						that.document_list = document_list;

						// 保存当前文件信息
						that.current_folder_info = current_folder_info;
						// 最底层文件夹时，重置面包屑&父级文件夹信息
						if (fId === "") {
							that.previous_grade_path = '';
							that.doc_bread_header = false;
							that.bread_list = [];
							that.grade = 0;
						}
						// 设置列表关键词高亮
						that.$nextTick(() => {
							if(keyword !== '') that.hightlight_doc_keyword(keyword);
						})
					}
				}).catch(err => {
					console.error(err);
				});
			},
			// 获取我的发布文档
			get_release_doc() {
				let that = this,
					document_list = [];
				that.doc_loading = true;
				// 重置列表状态
				that.int_document_list();
				that.$axios.get('/api/member/my_release/')
				.then(function(data) {
					if(data.data.code === '2'){
						// 隐藏加载框
						that.doc_loading = false;
						document_list = data.data.data;
						// 按时间戳排序
						document_list = document_list.sort(function(a,b){return b.modifyDate - a.modifyDate});
						that.document_list = document_list;
					}
				})
				.catch((err) => {
					console.error(err);
				});
			},
			// 获取我的收藏列表
			getCollect() {
				let that = this;
				that.doc_loading = true;
				// 重置列表状态
				that.int_document_list();
				that.$axios.get('/api/member/my_collect/',{params:{params: 'document,template,works'}})
				.then(data => {
					if(data.data.code === '2'){
                        let document_list = [];
						// 隐藏加载框
						that.doc_loading = false;
						document_list = data.data.data;
                        document_list.map(item => {
                            if (item.type === 'document') {
                                item['page'] = that.$common.document_pages_dataparse([item.documentPage])[0];
                            }
                        })
						// 按时间戳排序
						document_list = document_list.sort(function(a,b){return b.modifyDate - a.modifyDate});
						that.document_list = document_list;
					}
				}).catch(err => {
					console.error(err);
				});
			},
            // 获取回收站列表
            getDustbin() {
                let that = this;
				that.doc_loading = true;
				// 重置列表状态
				that.int_document_list();
                that.$axios.get('/api/member/dustbin/').then(data => {
					that.doc_loading = false;
                    let list = data.data.data;
                    list.map(item => { item.checked = false });
                    that.dustbin_list = list;
                });
            },
            // 清空搜索
            clearSearchKeyword() {
                this.search_doc_keyword = '';
                this.show_search_list = false;
                if (this.current_doc_list_type === 'myDesktop') {
                    this.getDesktopDoc('', this.desktop_current_type);
                } else {
                    this.teamDocRender('', '', true);
                }
            },
			// 获取全部协作列表
			get_document_collaborates() {
				let that = this;
				collaborate.all(that, {
					success:function(data){
						if(data.data.code !== '2') return that.$toast(data.data.content, 800);
						that.collaborates_document = data.data.data;
						// 获取全部协作文档id
						let id_arr = [];
						if(typeof data.data.data === 'object') id_arr = Object.keys(data.data.data);
						if(id_arr.length > 0) that.ws_get_doc_online_members(id_arr);
					}
				});
			},
			// 切换列表时间排序
			changeListSort(type) {
				this.current_doc_sort_type = type;
				if(type === 'open_recent'){
					let folder_list = [];
                    let doc_list = [];
					let list = this.document_list;
					let arr = this.open_recent_doc;
					// 数组去重
					let arr_result = []
					for (let i of arr) {
						!arr_result.includes(i) && arr_result.push(i);
					}
					arr = arr_result;
					list.forEach(i => {
						i.recent = 1001;
						arr.forEach((j, order) => {
							if(i.id == j){
								i.recent = order;
							}
						});
					});
					// 筛选文件夹
					list.forEach(item => {
						if(typeof(item.grade) === 'number'){
							folder_list.push(item);
						}else{
							doc_list.push(item);
						}
					})
					list = doc_list;
					// 时间戳排序
					list = list.sort((a, b) => {
						if (!b.topTime) {
							b.topTime = 0;
						}
						if (!a.topTime) {
							a.topTime = 0;
						}
						return b.topTime - a.topTime || a.recent - b.recent;
					});
					list = list.sort((a,b) => {
						return b.topTime - a.topTime
					});
					folder_list = folder_list.sort((a, b) => {
						return b.modifyDate - a.modifyDate;
					});
					this.document_list = folder_list.concat(list);
				} else if (type === 'update_recent') {
					this.getDesktopDoc(this.current_folder_info.id, this.desktop_current_type, this.search_doc_keyword);
				} else {
					let folder_list = [];
                    let doc_list = [];
					let list = this.document_list;
					// 筛选文件夹
					list.forEach(function(item,index){
						if(typeof(item.grade) === 'number'){
							folder_list.push(item);
						}else{
							doc_list.push(item);
						}
					})
					list = doc_list;
					list = list.sort (function(a,b){
						return a.name.localeCompare(b.name)
					});
					folder_list = folder_list.sort (function(a,b){
						return a.name.localeCompare(b.name)
					});
					list = list.sort(function(a,b){
						return b.topTime - a.topTime
					});
					this.document_list = folder_list.concat(list);
				}
			},
			// 打开文档设置框
			openOptionsDropdown(e, item, index) {
				e.stopPropagation();
				if (this.current_doc_info !== item || !this.show_options_box) {
					this.show_options_box = true
				} else {
					this.show_options_box = false;
				}
				if (!this.show_options_box) return;
                this.current_doc_info = item;
                this.current_doc_index = index;
                // 计算设置框位置
                this.$nextTick(() => {
                    let windowHeight = window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight;
                    let	scrollHeight = $(document).scrollTop();
                    let	$target = $(e.target)[0].className.indexOf('setting-btn') > -1 ? $(e.target) : $(e.target).parents('.setting-btn');
                    let	$option_box = $(".file_options_bar");
                    let	optionHeight = $option_box.height();
                    let	optionTop = $target.offset().top;
                    let offset_y = optionTop - 50;
                    let offset_x = $target.offset().left - $option_box.width();
                    if (windowHeight - (optionTop - scrollHeight) < optionHeight) {
                        offset_y = optionTop - optionHeight;
                    }
                    if (offset_y < 0) offset_y = 0;
                    if(this.latest_list){
                        offset_y -= $(".lately-region").offset().top;
                        offset_x -= $(".lately-region").offset().left;
                        if($option_box.width() > ($target.offset().left - $(".lately-region").offset().left)) {
                            offset_x = $target.offset().left + $target.width() - $(".lately-region").offset().left;;
                        }
                    }
                    $option_box.css({
                        top: offset_y,
                        left: offset_x
                    })
                })
			},
			// 打开/关闭搜索框
			toggleSearchDoc(type) {
				this.show_search_doc = type;
            },
            // 文档搜索 - 空白状态 - 返回
            search_back() {
                this.getDesktopDoc();
                this.search_doc_keyword = '';
				this.show_search_doc = false;
            },
			// 设置列表关键词高亮
			hightlight_doc_keyword(key) {
				$('.doc-card .card-name').each((index, item) => {
					item.innerHTML = item.innerText.replace(key, '<span style="background:rgb(255, 255, 0)">' + key + '</span>');
				})
			},
			// 更换浏览方式
			changeDisplayType() {
				let that = this;
				that.doc_display_type = that.doc_display_type === 'list' ? 'tile' : 'list';
                localStorage.setItem(`${that.current_doc_list_type}_display_type`, that.doc_display_type);
                if(that.doc_display_type === 'tile') {
                    that.wrapRoll();
                }
                // 设置关键字高亮
				that.$nextTick(() => {
					if (that.search_doc_keyword !== '') {
						// 设置列表关键词高亮
						that.hightlight_doc_keyword(that.search_doc_keyword);
					}
				})
			},
			// 文档卡片点击事件(进入文件夹/跳转编辑)
            edit_doc(item,index,newtab) {
				let that = this;
                let id = item.id;
				// 拖拽||重命名链接
				if ((that.show_options_box && !newtab) || that.stop_draggable || that.doc_dragging) return;
				// 批量操作拦截
				if (that.isBatching){
                    if(item.collaborateRoleType === 'owner' || that.current_doc_list_type === 'dustbin'){
                        that.getCheckedList(item, index);
                    }
                    return;
                }
                // 回收站文档拦截
				if (that.current_doc_list_type === 'dustbin') return;
				// 进入下级文件夹
				if (item.grade) {
					// 进入文件夹前处理
					that.enter_current_folder(item);
				}
				// 底层文件夹
				else if (item.grade === 0) {
					that.changeDesktopType(that.desktop_type_list.filter(item => item.key === that.desktop_current_type)[0])
				}
				// 普通文档
				else {
					// 存入最近打开文档数组
					that.open_recent_doc.unshift(item.id);
					// 跳转演示页
					if(item.collaborateRoleType === 'onlyView'){
						if(newtab){
                            that.$common.window_open_newtab(window.location.origin + '/slides/?url='+ item.url);
						}else{
							location.href = `/document/slides/${item.url}/`;
						}
					}
					// 跳转编辑页
					else{
						if(newtab){
                            that.$common.window_open_newtab(window.location.origin + '/edit/?docId=' + id);
						}else{
							location.href = `/edit/?docId=${id}`;
						}
					}
					localStorage.setItem("open_recent_doc", JSON.stringify(that.open_recent_doc));
					sessionStorage.setItem("previous_list_path", that.current_doc_list_type);
					sessionStorage.setItem("previous_grade_path", JSON.stringify(that.previous_grade_path));
				}
			},
			// 进入下级文件夹目录
			enter_current_folder(item) {
				let that = this,
					id = item.id;
				if(item.bread){   // sessionStorage内已存在文件夹路径
					that.bread_list = item.bread;
				}else{            // 不存在文件夹路径
					let _string = {
						name: item.name,
						id: item.id
					};
					that.bread_list.push(_string);
				}
				// 当前文件夹拦截
				if(that.current_folder_info && that.current_folder_info.id === id) return false;
				// 面包屑处理
				if(item.grade === 0){
					// 首级文件夹清空面包屑
					that.doc_bread_header = false;
					that.previous_grade_path = '';
				}else{
					that.doc_bread_header = true;
					// 存储文件夹路径（用于存储进sessionStorage内，编辑页返回时跳转作用）
					item.bread = that.bread_list;
					that.previous_grade_path = item;
					that.grade++;
				}
				if(that.current_doc_list_type === 'myTeam'){
					that.teamDocRender(id,'',false)
				}else{
					that.getDesktopDoc(id,that.desktop_current_type,'',false);
				}
				that.current_folder_info = item;
			},
			// 跨分类/层级进入文件夹
			step_enter_folder(type,item) {
				// 当前文件夹拦截
				if(this.current_folder_info && this.current_folder_info.id === item.id) return false;
                if (type === 'myTeam' && this.current_doc_list_type !== 'myTeam') {
                    this.center.changePanel('team');
                    return;
                }
                if (type !== 'myTeam' && this.current_doc_list_type === 'myTeam') {
                    this.center.changePanel('production');
                    return;
                }
				this.current_doc_list_type = type;
				$('.main-body').animate({scrollTop: 0}, 500);
				this.previous_grade_path = '';
				this.bread_list = [];
				item.bread = null;
				this.enter_current_folder(item);
			},
			// 返回上级文件夹
			back_pre_folder(index) {
				let gradelist = this.bread_list;
				let _index = +index;
				this.document_list = [];
				if (this.current_doc_list_type === 'myTeam') {
					this.teamDocRender(gradelist[_index].id, '');
				} else {
					this.getDesktopDoc(gradelist[_index].id, this.desktop_current_type);
				}
				gradelist.splice(_index + 1, gradelist.length - _index - 1);
				this.current_folder_info.id = gradelist[_index].id;
			},
			// 置顶/取消置顶功能
			topDoc(item, index) {
				let that = this;
				that.$axios.post('/api/member/document/set_top/',{
					documentCollaborateId: item.documentCollaborateId
				})
				.then(data => {
					that.$toast(data.data.content, 2000);
					if (data.data.code === '2') {
						if(item.topTime == 0){
							let	list = that.document_list;
							let first_index = 0;
							list.splice(index, 1);
							item.topTime = new Date().getTime();
							if(item.child){
								first_index = list.findIndex(data => !data.grade && data.parent_id === item.parent_id);
								first_index = first_index < 0 ? list.findIndex(data => data.grade && data.id === item.parent_id) + 1: first_index;
							}else{
								first_index = list.findIndex(data => !data.grade && !data.child);
							}
							list.splice(first_index,0,item);
							that.document_list = list;
						}else{
							that.document_list[index].topTime = 0;
							that.document_list[index].modifyDate = new Date().getTime();
							that.changeListSort(that.current_doc_sort_type);
						}
						that.show_options_box = false;
					}
				})
			},
			// 新建文件夹提交事件
			createFolder() {
				let that = this,
					folder_id = '',
					folder_index = '',
					folderName = that.$refs.folderName.value,
					create_inside = false,
					rag = /\s+/g;
				// 判断是否选中特定文件夹
				if(that.document_list[that.current_doc_index] && that.document_list[that.current_doc_index].open){
					create_inside = true;
					folder_index = that.current_doc_index;
				}
				folder_id = create_inside ? that.document_list[that.current_doc_index].id : that.current_folder_info.id;
				// 错误拦截
				if($validate(folderName).special()) return that.$toast('不能包含特殊字符', 2000);
                if(rag.test(folderName)) return that.$toast('文件夹名称不可包含空格',1000);
				if(folderName === '') {
					that.$toast('输入不能为空', 2000);
				} else {
					this.closeAllBox();
                    that.$axios.post('/api/member/folder/create/',{
						fid: folder_id,
						name: folderName,
					}).then(function(data) {
						if(data.data.code == 2) {
							that.closeCreateFolderModal();
							that.$toast("创建成功", 2000);
                            let _data = data.data.data;
                            if(create_inside){
                                _data.child = true;
                                _data.level = that.document_list[folder_index].grade + 1;
                                _data.parent_id = folder_id;
                                // 插入到特定文件夹之后
                                that.document_list.splice(folder_index + 1, 0, _data);
                            }else{
                                that.document_list.unshift(_data);
                            }
						} else {
							that.$toast(data.data.content, 2000);
						}
					});
				}
			},
			// 关闭新建文件夹弹框
			closeCreateFolderModal() {
				this.$refs['folderName'].value = "";
				this.show_create_folder_modal = false;
			},
			// 分享功能
			shareDoc(item) {
				this.closeAllBox();
				let type = '';
				let id = '';
				if (item.documentType) {
					type = item.documentType;
					id = item.url;
				} else {
					type = item.type;
					switch(type) {
						case 'template':
							id = item.templateId;
							break;
						case 'works':
							id = item.workShareId;
							break;
						case 'document':
							id = item.documentUrl;
							break;
					}
				}
				this.$refs.shareModal.show({
					type: type,
					urlid: id,
				});
			},
			// h5演示弹窗
			open_preview_h5() {
				this.$refs.h5Preview.show(this.current_doc_info.url);
			},
			// 列表重命名聚焦事件
			doc_list_rename_focus(e) {
				$(e.target).parents('.file_name_item').addClass('focus');
				this.stop_draggable = true;
				this.doc_old_name = e.target.value;
			},
			// 重命名弹框
			rename_doc(type,name) {
				let that = this;
				this.closeAllBox();
				this.show_rename_modal = true;
				this.doc_type = type;
				this.$nextTick(function(){
					if(type === 'team' && that.current_folder_info.id === that.current_doc_info.id){
						that.$refs.rename.value = that.current_folder_info.name;
					}else if(name){
						that.$refs.rename.value = name;
					}else{
						that.$refs.rename.value = that.document_list[that.current_doc_index].name;
					}
					that.$refs.rename.select();
					that.doc_old_name = that.$refs.rename.value;
				});
			},
			// 重命名字数限制
			rename_tips(e) {
				let that = this;
				if(that.$refs.rename.value.length > 40){
					let str = that.$refs.rename.value.substring(0,40);
					that.$refs.rename.value = str;
					$(e.currentTarget).addClass("active");
					that.$toast("文件名应小于40个字符！",1000);
				}else{
                	$(e.currentTarget).removeClass("active");
				}
			},
			// 重命名失焦
			rename_blur(e) {
				$(e.target).blur();
			},
			// 重命名提交事件
			submit_rename(e,item,index) {
				let that = this,
					reg = /^\s*$/g,
					type = item ? 'list' : 'modal',    //list：列表处更改 modal:弹框更改
					doc_type = that.doc_type,
					rename = item ? item.name : that.$refs.rename.value,
					doc_info = item ? item : JSON.parse(JSON.stringify(that.current_doc_info)),
					doc_index = item ? index : that.current_doc_index;
				if(item && item.grade){
					if(that.current_doc_list_type === 'myDesktop'){
						doc_type = 'folder'
					}else{
						doc_type = 'team'
					}
				}
				// 列表处更改
				if(type === 'list'){
					// 停止拖动
					that.stop_draggable = false;
					$(e.target).parents('.file_name_item').removeClass('focus');
					doc_type = item.grade ? (that.current_doc_list_type === 'myTeam' ? 'team' : 'folder') : 'doc';
				}
				// 无修改拦截
				if(rename === that.doc_old_name && !that.doc_copying) return false;
				// 错误拦截
				if($validate(rename).special()) return that.$toast('不能包含特殊字符', 2000);
				if(reg.test(rename) || rename == null || rename == "") {
					if(item) item.name = that.doc_old_name;
					that.$toast('输入不能为空', 2000);
				} else {
					let url = '',
						params = {},
						rename_fn = function(callback){
							that.$axios.post(url,params).then(function(data) {
								that.$toast(data.data.content, 2000);
								if(data.data.code == 2) {
									that.close_rename();
									if (typeof callback === 'function') callback();
								}
							});
						}
					switch (true) {
						case doc_type == 'folder':
							url = '/api/member/folder/rename/';	
							params = {
								fid: doc_info.id,
								name: rename
							};
							rename_fn(() =>{
								// 更改data视图不更新，暂未找到原因
								$('.doc-list-main').find('.doc-card').eq(doc_index).find('.card-name').text(rename);
								that.$set(that.document_list[doc_index], 'name', rename);
								that.$set(that.document_list[doc_index], 'modifyDate', new Date().getTime());
							});
							break;
						case doc_type === 'team':
							url = '/api/member/team/folder/rename/';
							params = {
								fId: doc_info.id,
								name: rename
							};
							rename_fn(() =>{
								if(that.doc_bread_header && that.bread_list[that.bread_list.length - 1].id === that.current_doc_info.id){
									that.bread_list[that.bread_list.length - 1].name = rename;
								}else{
									// 更改data视图不更新，暂未找到原因
                                    $('.doc-list-main').find('.doc-card').eq(doc_index).find('.card-name').text(rename);
									that.$set(that.document_list[doc_index], 'name', rename);
								}
								// 同步左侧文件夹列表
								if(that.current_doc_info.grade == 1){
									that.team_folder_list.forEach(function(item){
										if(item.id == that.current_doc_info.id) item.name = rename;
									})
								}
								that.$forceUpdate();
							});
							break;
						case that.doc_copying:
							doc_info.name = rename;
							that.copy_doc_submit(doc_info);
							break;
						default:
							url = '/api/member/document/rename/';
							params = {
								docId: doc_info.id,
								title: rename
							};
							rename_fn(() =>{
								// 更改data视图不更新，暂未找到原因
                                $('.doc-list-main').find('.doc-card').eq(doc_index).find('.card-name').text(rename);
                                that.$set(that.document_list[doc_index], 'name', rename);
							})
							break;
					};
				}
			},
			// 关闭重命名弹框
			close_rename() {
				this.show_rename_modal = false;
			},
			// 分享弹框中更改文档名称后在文档中心回显
			fresh_doc_name(obj) {
				let that = this,
					index = that.document_list.findIndex(item => item.id === obj.id);
				that.$set(that.document_list[index], 'name', obj.name)
			},
			// 删除弹框
			deleteDoc(type) {
				let that = this;
                that.closeAllBox();
				that.doc_type = type;
				switch (type) {
					// 文件夹
					case 'folder':
						that.$refs.deleteModal.show_modal({
                            title: '彻底删除',
							content: '删除后将无法恢复，确定要删除此文件夹吗？',
							sure_fn: () => {
								that.$axios.post('/api/member/folder/delete/', {
									fid: that.current_doc_info.id
								})
                                .then(function (data) {
									if (data.data.code === '2') {
										that.$toast('删除成功', 2000);
										let list = that.document_list;
										let deleteNumber = 1;
										let key = that.current_doc_index + 1;
										if (list[key]) {
											// 检测删除的文件夹下是否还有子文件夹
											for (key; key < list.length; key++) {
												if (!list[key].grade || list[key].grade === list[that.current_doc_index].grade) {
													break;
												}
												if (list[key].child && list[key].grade > list[that.current_doc_index].grade) {
													deleteNumber++;
												}
											}
										}
										list.splice(that.current_doc_index, deleteNumber);
									} else {
										that.$toast(data.data.content, 2000);
									}
								});
							}
						})
						break;
					// 模板
					case 'template':
						that.$refs.deleteModal.show_modal({
							content: '删除后将无法恢复，确定要删除此模板吗？',
							sure_fn: () => {
								that.$axios.post('/api/member/template/delete/', {
									templateId: that.current_doc_info.id
								}).then(function (data) {
									if (data.data.code === '2') {
										that.$toast('删除成功', 2000);
										that.document_list.splice(that.current_doc_index, 1);
									} else {
										that.$toast(data.data.content, 2000);
									}
								});
							}
						})
						break;
					// 团队文档
					case 'team':
						// 查询是否可以删除
						that.$axios.get('/api/member/team/folder/check_folder/', {params: {
							fId: that.current_doc_info.id,
							checkType:'content'
						}})
						.then(data => {
							if(data.data.code == 2){
								that.$axios.post('/api/member/team/folder/delete/', {
									fId: that.current_doc_info.id
								}).then(data => {
									if (data.data.code === '2') {
										that.$toast('删除成功', 2000);
										that.document_list.splice(that.current_doc_index, 1);
										if(that.current_doc_info.grade === 1) that.team_folder_list.splice(that.current_doc_index,1);
									} else {
										that.$toast(data.data.content, 2000);
									}
								});
							} else {
								that.$modal({
									modalClass: 'team-modal team-dismiss-modal',
									modalTitle: '删除提示',
									modalContent: `<p>本文件夹内含有文件，请联系所有者将其删除或移除后继续</p>`,
									showSubmit: false,
									buttonCancelTxt: '知道了'
								});
							}
						})
						break;
					// 团队文件夹内部删除按钮
					case 'team_inside':
						// 查询是否可以删除
						that.$axios.get('/api/member/team/folder/check_folder/', {params: {
							fId: that.current_doc_info.id,
							checkType:'allMine'
						}})
						.then(data => {
							if (data.data.code == 2) {
								that.$refs.deleteModal.show_modal({
									title: '确定删除文件夹?',
									content: '文件夹和此文件夹下的所有内容将一同被删除，请谨慎操作！',
									sure_text: '删除',
									sure_fn: () => {
										that.$axios.post('/api/member/team/folder/delete/', {
											fId: that.current_doc_info.id
										}).then(function (data) {
											if (data.data.code === '2') {
												that.$toast('删除成功', 2000);
												if (that.current_folder_info.id == that.current_doc_info.id) {
													if (that.bread_list.length - 2 < 0) {
														that.teamDocRender('','',true)
													} else {
														that.back_pre_folder(that.bread_list.length - 2);
													}
												} else {
													that.document_list.splice(that.current_doc_index, 1);
												}
											} else {
												that.$toast(data.data.content, 2000);
											}
										});
									}
								})
							}else{
								that.$modal({
									modalClass: 'team-modal team-dismiss-modal',
									modalTitle: '删除提示',
									modalContent: `<p>本文件夹内含有他人文件，请联系所有者将其删除或移除后继续</p>`,
									showSubmit: false,
									buttonCancelTxt: '知道了'
								});
							}
						})
						break;
					// 批量删除
					case 'batch':
						that.$refs.deleteModal.show_modal({
							content: '删除后所有人将无法访问当前选中文档',
							sure_fn: () => {
								that.doc_batch_operation('delete');
							}
						})
						break;
					// 回收站删除
					case 'dustbin':
						that.$refs.deleteModal.show_modal({
                            title: '彻底删除',
							content: '彻底删除文档，删除后将无法恢复，请谨慎操作！',
							sure_fn: () => {
								that.doc_batch_operation('dusbin_del');
							}
						})
						break;
					// 普通文档
					default:
						that.$refs.deleteModal.show_modal({
							sure_fn: () => {
								that.$axios.post('/api/member/document/tmp_delete/', {
									docId: that.current_doc_info.id
								}).then( data => {
									if(data.data.code === '2'){
										that.$toast('删除成功', 2000);
										// 删除文档发送通讯
										that.ws_doc_delete_send();
                                        that.document_list.splice(that.current_doc_index, 1);
									} else {
										that.$toast(data.data.content, 2000);
									}
								});
							}
						});
						break;
				}
			},
			// 彻底删除弹框
			dustbin_delete_modal() {
				let that = this;
                that.closeAllBox();
                that.$refs.deleteModal.show_modal({
                    title: '彻底删除',
                    content:'彻底删除文档，删除后将无法恢复，请谨慎操作！',
                    sure_fn:function(){
                        that.$axios.post('/api/member/document/delete/', {
                            docId: that.current_doc_info.id
                        }).then(function(data) {
                            if(data.data.code === '2') {
                                that.$toast('删除成功', 2000);
                                that.dustbin_list.splice(that.current_doc_index, 1);
                            } else {
                                that.$toast(data.data.content, 2000);
                            }
                        });item
                    }
                })
			},
			// 复制功能
			copy_doc(doc_info) {
				let that = this;
				this.closeAllBox();
				// 先调用重命名弹框
				this.rename_doc('doc',`${doc_info.name}[副本]`);
				this.doc_copying = true;
			},
			// 复制提交
			copy_doc_submit(doc_info,callback) {
				let that = this;
				that.$axios.post('/api/member/document/copy/', {
					docId: doc_info.id,
					name: doc_info.name
				}).then(function(data) {
					if(data.data.code == 2) {
						that.$toast('复制成功', 2000);
						data.data.data.time = that.$common.timestamp(data.data.data.modifyDate / 1000);
						data.data.data.topTime = 0;
						let list = that.document_list;
						// 子文档
						if(doc_info.child){
							data.data.data.child = true;
							data.data.data.level = doc_info.level;
							data.data.data.parent_id = doc_info.parent_id;
							// 查找同个父级文件夹下的第一个非置顶文档
							let index = list.findIndex(data => !data.grade && data.child && !data.topTime && data.parent_id == doc_info.parent_id);
							if (index < 0) index = list.findIndex(data => data.id == doc_info.parent_id) + list.filter(data => data.parent_id === doc_info.parent_id).length + 1;
                            that.document_list.splice(index,0,data.data.data);
						}
						// 非子文档
						else{
							let index = list.findIndex(data => !data.grade && !data.child && !data.topTime);
                            that.document_list.splice(index,0,data.data.data);
						}
						if (typeof callback === 'function') callback(data.data.data);
					} else {
						that.$toast('复制失败', 2000);
					}
					that.doc_copying = false;
					that.close_rename();
				});
			},
			// 打开移动弹框
            moveDoc(type, authority) {
                let that = this;
                let show_desktop = true;
                let show_team = true;
                that.closeAllBox();
                that.doc_type = type;
                // 判断桌面/团队列表是否显示
                switch (that.current_doc_list_type) {
					case 'myTeam':
                        show_team = true;
						if(authority !== 'other'){
                            show_desktop = true;
						}else{
                            show_desktop = false;
						}
						break;
					default:
                        show_desktop = true;
						if(authority !== 'other' && !that.current_doc_info.grade){
                            show_team = true;
						}else{
                            show_team = false;
                        }
						break;
                };
                // 打开移动弹框
                that.$refs.moveModal.open({
                    modal_title: '移动至',
                    show_team: show_team,                 
                    show_desktop: show_desktop,
                    cur_listType: that.current_doc_list_type,
                })
            },
            // 移动组件获取文档位置
            get_doc_location(obj) {
                this.target_folder_info = obj.folder;
                this.current_move_folder_type = obj.folder_type;
                // 判断是否需要下一步操作
                if(!obj.has_next){
                    // 直接移动文档
                    this.move_cur_folder();
                }else{
                    // 隐藏移动弹框
                    this.$refs.moveModal.hide_modal = true;
                    // 打开团队权限设置弹框
                    this.team_move_authority_toggle(true,obj.folder.id);
                }
            },
			// 打开团队文件夹移动权限设置弹框
            team_move_authority_toggle(type, folder) {
                let that = this;                
                that.show_team_move_authority = type;
				if(type){
					// 文档权限数据
					let that = this,
						doc_info = that.current_doc_info,
						document_authority = that.document_authority;
					that.interim_authority.document.id = doc_info.id;
                    that.interim_authority.document.type = doc_info.visitType;
                    
					// 判断文档权限
					switch (doc_info.visitType) {
						case 'open':
							that.interim_authority.document.name = document_authority[0].name;
							that.interim_authority.document.describe = document_authority[0].describe;
							break;
						case 'edit':
							that.interim_authority.document.name = document_authority[1].name;
							that.interim_authority.document.describe = document_authority[1].describe;
							break;
						case 'exclusive':
							that.interim_authority.document.name = document_authority[2].name;
							that.interim_authority.document.describe = document_authority[2].describe;
							break;
						case 'privacy':
							that.interim_authority.document.name = document_authority[3].name;
							that.interim_authority.document.describe = document_authority[3].describe;
							break;
                    }
                    // 获取团队成员列表
					that.center.team.get_team_folder_member(folder, list => {
						let list_head = [], list_foot = [];
                        // 团队管理者默认拥有权限
						list.forEach(function(item){
							item.check = true;
							if(item.memberRoleType === 'team_owner'){
								list_head.push(item)
							}else if(item.memberRoleType){
								list_foot.push(item)
							}
                        })
						that.team_member_select_list = list_head.concat(list_foot);
						that.show_team_move_authority = true;
					});
				}else{
                    // 展示移动弹框
                    that.$refs.moveModal.hide_modal = false;
				}
            },
            // 移动文件夹确定事件
            move_cur_folder() {
                let that = this;
                let folder_type = that.current_move_folder_type;
                let target_folder = that.target_folder_info;
                let parent_folder_id = that.current_doc_info.parent_id || that.current_folder_info.id;
                //执行下一步操作               
				let success_callback = function(){
                    // 关闭弹框
                    that.$refs.moveModal.close();
					that.$toast("移动成功",2000);
					// 跨分类进入文件夹
					if(that.current_doc_list_type !== folder_type) that.step_enter_folder(folder_type,target_folder);
					// 关闭团队移动权限设置弹框
					that.show_team_move_authority = false;
					// 关闭批量选择
					if(that.isBatching){
						that.isBatching = false;
						// 批量移动后涉及到的层级过于复杂,直接重新获取列表
						that.getDesktopDoc(that.current_folder_info.id,that.desktop_current_type,that.search_doc_keyword);
					}else{
						let list = that.document_list;
						// 删除当前移动文件夹
						if(!that.latest_list) {
                            list.splice(that.current_doc_index, 1);
						    that.document_list = list;
                        } else {
                            that.$emit('update_latyely_list');
                        }
						// 删除视图中对应文档的协作者列表
						if(that.collaborates_document[that.current_doc_info.id]){
							delete that.collaborates_document[that.current_doc_info.id];
						}
					}
                }
				// 移动到我的文档
				if(folder_type === 'myDesktop'){
					switch (that.doc_type) {
						case 'doc':    //文档移动
							if(!that.isBatching && parent_folder_id === target_folder.id) return that.$toast("已在当前文件夹，无需移动", 2000);
							let _str = '',
								_url = '/api/member/document/move/';
							if(that.isBatching){    // 批量操作
								_str = that.checked_list.join(',');
							}else{                          // 单个文档操作
								_str = that.current_doc_info.id;
							}
							// 团队文档移出到我的文档
							if(that.current_doc_list_type === 'myTeam') _url = '/api/member/team/folder/move_out/';
							that.$axios.post(_url, {
								docId: _str,
								fId: target_folder.id
							}).then(function(data) {
								if(data.data.code == 2) {
									success_callback();
								} else {
									that.$toast(data.data.content, 2000);
								}
							});
							break;
						case 'folder':   //文件夹移动
							if(that.current_doc_info.id == target_folder.id) {
								that.$toast("无法移动相同文件夹", 2000);
							}else if(parent_folder_id === target_folder.id){
								that.$toast("已在当前文件夹，无需移动", 2000);
							} else {
								that.$axios.post('/api/member/folder/move/', {
									targetFid: target_folder.id,
									fid: that.current_doc_info.id
								}).then(function(data) {
									if(data.data.code == 2) {
										success_callback();
									} else {
										that.$toast(data.data.content, 2000);
									}
								});
							}
							break;
						default:
							break;
                    }                   
				}
				// 移动到我的团队
				else{
					if(parent_folder_id === target_folder.id){
						that.$toast("已在当前文件夹，无需移动", 2000);
					}else{
						let _str = '';
						if(that.isBatching){    // 批量操作
							_str = that.checked_list.join(',');
						}else{                          // 单个文档操作
							_str = that.current_doc_info.id;
						}
						that.$axios.post('/api/member/team/folder/move_in/', {
							docId: _str,
							fId: target_folder.id,
							memberJson:JSON.stringify(that.team_member_select_list.filter(item => item.check))
						}).then(function(data) {
							if(data.data.code == 2) {
								success_callback();
								that.get_document_collaborates();
							} else {
								that.$toast(data.data.content, 2000);
							}
						});
					}
                }
            },
			// 恢复文档
			recovery_doc() {
				let that = this;
                that.$axios.post('/api/member/document/recovery/', {
					docId: that.current_doc_info.id
				}).then(function(data) {
					if(data.data.code == 2) {
						that.$toast('恢复成功', 2000);
						that.dustbin_list.splice(that.current_doc_index, 1);
					} else {
						that.$toast('恢复失败', 2000);
					}
				});
				that.closeAllBox();
			},
			// 使用模版点击事件
			use_template(item,newtab) {
				if(!item) return;
				let that = this,
					type = that.current_doc_list_type;
				if(item.templateIsVip && !that.user.memberVipExpire){//会员专享
					that.$modal({templateType:'memberGrade'});
					return;
				}
				sessionStorage.setItem("previous_list_path", type);
				sessionStorage.setItem("previous_grade_path", '');
				let url = '/edit/?modalId=' + item.documentId;
				if(newtab){
					that.$common.window_open_newtab(window.location.origin + url);
				}else{
					location.href = url;
				}
			},
			// 模板取消收藏功能
			template_delete_collect(item) {
				let that = this;
                that.$axios.post('/api/member/delete_collect/',{
					documentId: item.documentId
				}).then(function(data){
					if(data.data.code == 2){
						that.closeAllBox();
						that.$toast('取消收藏成功',1000);
						that.document_list.splice(that.current_doc_index, 1);
					}else{
						that.$toast(data.data.content,1000)
					}
				})
			},
			// 拖动目标文件夹
			dragIntoFolder(item, isEnter) {
				if (!item) return;
				if (!!item.grade && isEnter) {
					this.current_drag_folder_info = item;
				} else {
					this.current_drag_folder_info = null;
				}
			},
			// 开始拖动文档操作
			startDragDoc(event, item) {
				this.drag_doc_offset = event || window.event;
			},
			// 虚拟文档开始移动
			dragDocMove(ev) {
                let scale = 1;
				this.doc_dragging = true;
                if (this.doc_display_type === 'tile') scale = 1.2;
                if (this.isBatching) {
                    this.checked_list.forEach(item => {
                        $(`.doc-card[data-id=${item}]:not(.chosen)`).addClass('drag-holder');
                    })
                }
				$('.draggingStyle').css({
					'left': (this.drag_doc_offset.clientX - 32) / scale +'px',
					'top': (this.drag_doc_offset.clientY - 62) / scale +'px'
				});
			},
			// 拖动文件进入文件夹结束
			dragDocToFolder(evt) {
				let that = this;
				let list = that.document_list;
				let target_folder = that.current_drag_folder_info;
                $(`.doc-card`).removeClass('drag-holder');
                if(target_folder) {
                    let move_folder_url = "";
                    let move_slide_url = "";
                    if(that.current_doc_list_type !== 'myTeam'){
                        move_folder_url = "/api/member/folder/move/";
                        move_slide_url = "/api/member/document/move/";
                    }else{
                        move_slide_url = "/api/member/team/folder/move_in/";
                    }
                    let next = (index, last) => {
                        let doc = that.document_list[index];
                        if (doc.id === target_folder.id) return;
                        if(evt.item.attributes[3].value === 'folder' && that.current_doc_list_type !== 'myTeam'){
                            that.$axios.post(move_folder_url, {
                                targetFid: target_folder.id,
                                fid: doc.id
                            }).then(function(data) {
                                if(data.data.code == 2) {
                                    // 删除当前移动文件夹
                                    list.splice(index,1);
                                    if (last) {
                                        that.$toast('移动成功', 2000);
                                        that.document_list = list;
                                        that.isBatching = false;
                                        that.checked_list = [];
                                    }
                                } else {
                                    that.$toast(data.data.content, 2000);
                                }
                            });
                        }else{
                            if(evt.item.attributes[3].value === 'folder' && that.current_doc_list_type === 'myTeam') return;
                            that.$axios.post(move_slide_url, {
                                docId: doc.id,
                                fId: target_folder.id,
							    memberJson:JSON.stringify(that.team_member_select_list.filter(item => item.check))
                            }).then(function(data) {
                                if(data.data.code == 2) {
                                    // 删除当前移动文件夹
                                    list.splice(index,1);
                                    if (last) {
                                        that.$toast('移动成功', 2000);
                                        that.document_list = list;
                                        that.isBatching = false;
                                        that.checked_list = [];
                                    }
                                } else {
                                    that.$toast(data.data.content, 2000);
                                }
                            });
                        }
                    }
                    if (this.isBatching) {
                        let batch_list = that.checked_list;
                        batch_list.forEach((id, index) => {
                            next(that.document_list.findIndex(item => item.id == id), index === batch_list.length - 1);
                        })
                    } else {
                        next(that.document_list.findIndex(item => item.id == evt.item.attributes[2].value), true);
                    }
                }
                setTimeout(() => { this.doc_dragging = false }, 100);
            },
			// 文档批量操作
			doc_batch_operation(ops) {
				let that = this,
					_str = that.checked_list.join(',');
				switch(ops){
					case 'delete':
						that.$axios.post('/api/member/document/tmp_delete/', {
							docId: _str
						})
						.then(function(data){
							that.isBatching = false;
							if(data.data.code == 2) {
								that.$toast('删除成功', 2000);
								// 删除文档发送通讯
								that.ws_doc_delete_send();
								let _list = JSON.parse(JSON.stringify(that.document_list)),
									key = 0;
								for(let index in that.document_list){
									if(that.document_list[index].checked){
										_list.splice(key,1);
									}else{
										key++;
									}
								}
								that.document_list = _list;
								that.checked_list = [];
							} else {
								that.$toast(data.data.content, 2000);
							}
						})
						break;
					case 'dusbin_del':
						that.$axios.post('/api/member/document/delete/', {
							docId: _str
						})
						.then(function(data){
							that.isBatching = false;
							if(data.data.code == 2) {
								that.$toast('删除成功', 2000);
								let _list = JSON.parse(JSON.stringify(that.dustbin_list)),
									key = 0;
								for (let index in that.dustbin_list) {
									if (that.dustbin_list[index].checked) {
										_list.splice(key, 1);
									}else{
										key++;
									}
								}
								that.dustbin_list = _list;
								that.checked_list = [];
							} else {
								that.$toast(data.data.content, 2000);
							}
						})
						break;
					case 'recover':
						that.$axios.post('/api/member/document/recovery/', {
							docId: _str
						})
						.then(function(data){
							that.isBatching = false;
							if(data.data.code == 2) {
								that.$toast('恢复成功', 2000);
								let _list = JSON.parse(JSON.stringify(that.dustbin_list)),
									key = 0;
								for(let index in that.dustbin_list){
									if(that.dustbin_list[index].checked){
										_list.splice(key,1);
									}else{
										key++;
									}
								}
								that.dustbin_list = _list;
								that.checked_list = [];
							} else {
								that.$toast(data.data.content, 2000);
							}
						})
						break;
				}
			},
			// 打开批量操作
			chooseDocs() {
				let _list = this.current_doc_list_type === "dustbin" ? this.dustbin_list:this.document_list;
				this.isBatching = !this.isBatching;
				this.checked_list = [];
				this.all_choose = false;
				let obj = JSON.parse(JSON.stringify(_list, (key, value) => {
					if (key == 'checked') {
                        return false;
					}else{
                        return value;
					}
				}))
				if (this.current_doc_list_type === "dustbin") {
					this.dustbin_list = obj;
				} else {
					this.document_list = obj;
				}
			},
			// 获取选中批量操作文档
			getCheckedList(item, index) {
                let that = this;
                if (!that.isBatching) return;
				let add_item = true;
				let _list = that.current_doc_list_type === "dustbin" ? that.dustbin_list : that.document_list;
				that.batch_forbid_delete = false;
				if (item === 'all') {
					for(let _item in _list){
						if(!_list[_item].checked && (_list[_item].collaborateRoleType || that.current_doc_list_type === "dustbin") && _list[_item].grade === undefined){
							_list[_item].checked = true;
							add_item = false;
							that.all_choose = true;
							that.checked_list.push(_list[_item].id);
						}
					}
					if(add_item){
						_list = JSON.parse(JSON.stringify(_list, function(key,value){
							if (key == 'checked') {
								return false;
							}else{
								return value;
							}
						}))
						that.checked_list = [];
						that.all_choose = false;
					}
                    if(that.current_doc_list_type === "dustbin"){
                        that.dustbin_list = _list;
                    }else{
                        that.document_list = _list;
                    }
				}else if(item.grade !== undefined && that.current_doc_list_type !== "dustbin"){
                    return item.checked = false;
                }else{
                    that.$set(that[`${that.current_doc_list_type === "dustbin" ? 'dustbin' : 'document'}_list`][index], 'checked', !item.checked);
					for(let _index in that.checked_list){
						if(item.id === that.checked_list[_index]){
							that.checked_list.splice(_index,1);
							add_item = false;
							that.all_choose = false;
						}
					}
					if(add_item){
						that.checked_list.push(item.id);
						for(let _item in _list){
							if(!_list[_item].checked && (_list[_item].collaborateRoleType || that.current_doc_list_type === "dustbin")){
								add_item = false;
							}
						}
						if(add_item){
							that.all_choose = true;
						}
					}
				}
				// 判断是否存在协作文档，存在时禁止删除
				for(let _index in _list){
					if(_list[_index].checked && _list[_index].collaborateRoleType !== 'owner') that.batch_forbid_delete = true;
				}
			},
            // 导入文件
            importDoc(event) {
                let that = this;
                that.$import({
                    file: event.target.files[0],
                    success: data => {
                        that.$toast('导入成功', 1000);
                        setTimeout(() => {
                            that.$router.push(`/edit?docId=${data.docId}&fId=${that.current_folder_info ? that.current_folder_info.id : ''}`);
                        }, 1000);
                    },
                })
            },

			/*2.3.0权限设置相关*/
			// 获取当前文档全部协作者
			get_all_partner(id, socket_send,callback) {
				let that = this;
				collaborate.specific(that, {
					id: id,
					success: function(data){
						if(data.data.code !== '2') return that.$toast(data.data.content, 800);
						let partner = Object.values(data.data.data)[0];
						if(typeof(partner) === 'undefined') partner = [];
						that.interim_authority.partner = partner;
						that.$axios.get('/api/member/document/team_detail/' + id + '/')
                        .then(function (res) {
                            if(res.data.code == 2){
                                partner.forEach(function(item){
                                    if(item.memberId === res.data.data.teamOwnerId) item.teamowner = true;
								})
								that.interim_authority.partner = partner;
								if(socket_send) that.ws_doc_authority_send();
                            }
							if(typeof callback === 'function') callback();
                        })
					}
				});
			},
			// 权限设置 - 打开
			set_doc_privacy(item) {
				// 对接接口时，协作者列表从 item 中获取
				let that = this,
					document_authority = that.document_authority;
				that.interim_authority.document.id = item.id;
				that.interim_authority.document.type = item.visitType;
				// 判断文档权限
				switch (item.visitType) {
					case 'open':
						that.interim_authority.document.name = document_authority[0].name;
						that.interim_authority.document.describe = document_authority[0].describe;
						break;
					case 'edit':
						that.interim_authority.document.name = document_authority[1].name;
						that.interim_authority.document.describe = document_authority[1].describe;
						break;
					case 'exclusive':
						that.interim_authority.document.name = document_authority[2].name;
						that.interim_authority.document.describe = document_authority[2].describe;
						break;
					case 'privacy':
						that.interim_authority.document.name = document_authority[3].name;
						that.interim_authority.document.describe = document_authority[3].describe;
						break;
				}
				// 获取文档协作者
				that.get_all_partner(item.id,null,function(){
					// 显示权限设置
					that.show_authority = true;
					// 关闭协作者权限
					that.interim_authority.partner.forEach(function(item){item.checked = false;});
				});
				that.show_partner_authority = false;
				that.editing_partner = false;
				// 关闭更多下拉
				that.closeAllBox();
			},
			// 权限设置 - 关闭
			close_privacy() {
				this.show_authority = false;
				this.show_authority_list = false;
				this.show_partner_authority = false;
			},
			// 权限设置 - 面板点击关闭下拉
			authority_selector_close() {
				let that = this;
				// 关闭文档权限下拉
				that.show_authority_list = false;
				// 关闭协作者权限
				that.interim_authority.partner.forEach(function(item){item.checked = false;});
				that.show_partner_authority = false;
				that.editing_partner = false;
			},
			// 权限设置 - 显示/隐藏文档权限列表
			toggle_authority_list() {
				let that = this;
				// 关闭协作者权限
				that.interim_authority.partner.forEach(function(item){item.checked = false;});
				that.show_partner_authority = false;
				that.editing_partner = false;
				// 改变文档列表显示隐藏
				that.show_authority_list = !that.show_authority_list;
			},
			// 权限设置 - 选择文档权限
			checked_document_authority(item) {
				let that = this,
					document = that.interim_authority.document;
				if(item.type === 'privacy'){
					that.show_privacy_confirm = true;
					that.show_authority_list = false;
					return false;
				}
				that.$axios.post('/api/member/document/authority/save/', {
					docId: document.id,
					visitType: item.type
				})
					.then(function(data){
						if(data.data.code === '2'){
							let document_list = JSON.parse(JSON.stringify(that.document_list)),
								current_doc = document_list.filter(item => item.id === document.id)[0];
							if(current_doc){
								current_doc.visitType = item.type;
								that.document_list = document_list;
								that.interim_authority.document.type = item.type;
								that.interim_authority.document.name = item.name;
								that.interim_authority.document.describe = item.describe;
								that.show_authority_list = false;
								// 发送文档权限修改
								that.ws_doc_authority_send();
							}else{
								that.$toast('没有找到选择文档，请刷新后重试',2000);
							}
						}else{
							that.$toast(data.data.content);
						}
					});
			},
			// 权限设置 - 私密确认 - 确认
			privacy_confirm_sure() {
				let that = this,
					document = that.interim_authority.document;
				that.show_privacy_confirm = false;
				that.$axios.post('/api/member/document/authority/save/', {
					docId: document.id,
					visitType: 'privacy'
				})
					.then(function(data){
						if(data.data.code === '2'){
							let document_list = JSON.parse(JSON.stringify(that.document_list)),
								current_doc = document_list.filter(item => item.id === document.id)[0];
							if(current_doc){
								current_doc.visitType = 'privacy';
								that.document_list = document_list;
								that.interim_authority.document.type = 'privacy';
								that.interim_authority.document.name = '私密';
								that.interim_authority.document.describe = '仅自己可查看/编辑';
								that.interim_authority.partner = that.interim_authority.partner.filter(item => item.collaborateRoleType === 'owner');
								that.show_authority_list = false;
								that.get_document_collaborates();
								// 发送文档权限修改
								that.ws_doc_authority_send();
							}else{
								that.$toast('没有找到选择文档，请刷新后重试',2000);
							}
						}else{
							that.$toast(data.data.content);
						}
					});
			},
			// 权限设置 - 私密确认 - 取消
			privacy_confirm_cancel() {
				this.show_privacy_confirm = false;
			},
			// 权限设置 - 转让所有权 - 显示协作者面板
			change_document_owner() {
				this.change_owner_step = 'chose_owner';
			},
			// 权限设置 - 转让所有权 - 确认弹框
			show_sure_change(partner) {
				this.chose_owner_partner = partner;
				this.change_owner_step = 'sure_change';
			},
			// 权限设置 - 转让所有权 - 取消
			cancel_change_owner() {
				this.change_owner_step = null;
				this.show_partner_authority = false;
				this.editing_partner.owner = false;
				this.chose_owner_partner = false;
			},
			// 权限设置 - 转让所有权 - 确定
			sure_change_owner() {
				let that = this;
				that.$axios.post('/api/member/document/transfer/',{
					docId: that.interim_authority.document.id,
					memberId: that.chose_owner_partner.memberId
				}).then(function(data){
					if(data.data.code === '2'){
						location.reload()
					}else{
						that.$toast(data.data.content, 1000);
					}
				});
			},
			// 添加协作 - 显示/隐藏
			toggle_add_partner() {
				let that = this;
				that.show_add_partner = !that.show_add_partner;
				that.show_partner_authority = false;
				if(that.show_add_partner){
					// 获取最近协作者
					collaborate.search_recent(that, {
						id: that.interim_authority.document.id,
						success: function(data){
							if(data.data.code !== '2') return that.$toast(data.data.content, 800);
							that.interim_authority.recommend_partner = data.data.data.filter(item => !item.documentCollaborateId);
						}
					});
					// 更新新添加协作者列表
					that.interim_authority.added_partner = [];
					// 生成二维码
					that.$nextTick(function(){
						// 清除搜索
						that.clear_search_partner();
						that.get_invitee_code();
					})
				}
			},
			// 添加协作 - 搜索协作者
			search_partner() {
				let that = this,
					keyword = that.$refs.search_partner_input.value;
				that.interim_authority.search_keyword = keyword;
				// 存在关键词 => 显示搜索结果
				if(keyword !== ''){
					collaborate.search(that, {
						id: that.interim_authority.document.id,
						keyword: keyword,
						success: function(data){
							if(data.data.code !== '2') return that.$toast(data.data.content, 800);
							let result = data.data.data;
							// 当前搜索无结果 => 判断是否为 手机||邮箱
							if(result.length <= 0){
								let obj = {head: '/public/images/default_head.png'};
								// 判断当前输入为外部邮箱
								if($validate(keyword).email() || $validate(keyword).phone()){
									obj.nickName = keyword;
									obj.invitee = keyword;
									that.interim_authority.search_result = [obj];
								}else{
									that.interim_authority.search_result = [];
								}
							}
							// 当前搜索有结果 => 显示搜索结果
							else{
								that.interim_authority.search_result = result.filter(item => item.collaborateRoleType !== 'owner');
							}
						}
					});
				}
				// 关键词为空 => 显示已添加、最近
				else{
					that.interim_authority.search_result = [];
				}
			},
			// 添加协作 - 清除搜索
			clear_search_partner() {
				let that = this;
				// 清除输入框
				if(that.$refs.search_partner_input) that.$refs.search_partner_input.value = '';
				// 清除搜索关键词
				that.interim_authority.search_keyword = '';
				// 清除搜索结果列表
				that.interim_authority.search_result = [];
			},
			// 添加协作 - 临时添加
			add_interim_partner(partner) {
				let that = this,
					recommend_list = that.interim_authority.recommend_partner,
					add_list = that.interim_authority.added_partner;
				// 错误状态判断
				if(!partner) return false;
				partner.add = true;
				// 判断是否已添加
				let had_invitee = partner.invitee && add_list.filter(item => item.invitee === partner.invitee).length <= 0,
					had_add = add_list.filter(item => item.memberId === partner.memberId).length <= 0;
				if(had_invitee || had_add){
					if(!partner.collaborateRoleType){
						partner.collaborateRoleType = that.partner_authority[0].type;
						partner.collaborateRoleName = that.partner_authority[0].name;
					}
					that.interim_authority.added_partner.push(partner);
				}
				// 清除搜索
				that.clear_search_partner();
				// 推荐列表去重
				if(recommend_list.length > 0){
					if(partner.invitee) recommend_list = recommend_list.filter(item => item.invitee !== partner.invitee);
					if(partner.memberId) recommend_list = recommend_list.filter(item => item.memberId !== partner.memberId);
					that.interim_authority.recommend_partner = recommend_list;
				}
			},
			// 移除最近列表协作者
            remove_interim_partner(partner) {
                let that = this;
                if (!partner) return false;
                collaborate.remove_recent(that, {
                    data: partner,
                    success: () => {
                        that.interim_authority.recommend_partner = that.interim_authority.recommend_partner.filter(item => item.memberId !== partner.memberId);
                    },
                    fail: () => {
                        that.$toast('删除失败！');
                    },
                });
            },
			// 添加协作 - 确认添加
			sure_add_partner(callback) {
				let that = this,
					added_partner = that.interim_authority.added_partner,
					add_document_collaborates = [];
				// 错误状态判断
				if(added_partner.length <= 0 || that.adding_partner) return false;
				added_partner.forEach(function(item){
					let obj = {
						collaborateRoleType: item.collaborateRoleType,
						username: item.invitee ? item.invitee : item.memberId
					};
					add_document_collaborates.push(obj);
				});
				that.adding_partner = true;
				collaborate.add(that, {
					id: that.interim_authority.document.id,
					arr: add_document_collaborates,
					success: function(data){
						if(data.data.code !== '2') return that.$toast(data.data.content, 800);
						that.show_add_partner = false;
						that.adding_partner = false;
						that.get_all_partner(that.interim_authority.document.id,false,callback);
						that.get_document_collaborates();
					},
					fail: function(){
						that.show_add_partner = false;
						that.adding_partner = false;
						that.get_all_partner(that.interim_authority.document.id,false,callback);
					},
				});
			},
            // 全部协作者弹框 - 显示/隐藏
            toggleAllPartners(item) {
				let document_authority = this.document_authority;
                let document = this.interim_authority.document;
				this.show_all_partners = !this.show_all_partners;
				if(this.show_all_partners){
					document.id = item.id;
					document.type = item.visitType;
					// 判断文档权限
					switch (item.visitType) {
						case 'open':
							document.name = document_authority[0].name;
							document.describe = document_authority[0].describe;
							break;
						case 'edit':
							document.name = document_authority[1].name;
							document.describe = document_authority[1].describe;
							break;
						case 'exclusive':
							document.name = document_authority[2].name;
							document.describe = document_authority[2].describe;
							break;
						case 'privacy':
							document.name = document_authority[3].name;
							document.describe = document_authority[3].describe;
							break;
					}
                    this.interim_authority.document = document;
					// 获取文档协作者
					this.get_all_partner(item.id);
				}
            },
			// 显示/隐藏协作者权限下拉
			toggle_partner_authority(e, partner) {
                let that = this,
                    $item = $(e.target).parents('.partner_item'),
                    list_top = 0,
					$scroll;
				that.show_authority_list = false;
                // 错误状态判断
                if(!partner || $item.length <= 0) return false;
                let action_list;	// 正在操作的协作者列表
                switch (true) {
                    // 判断当前操作为 全部协作者弹框
                    case that.show_all_partners:
                        action_list = that.interim_authority.partner;
                        $scroll = $('.all_partners .modal_content');
                        break;
                    // 判断当前操作为 权限设置 - 文档权限面板
                    case that.show_authority && !that.show_add_partner:
                        action_list = that.interim_authority.partner;
						$scroll = $('.set_privacy .add_partner .partner_list');
                        break;
                    // 判断当前操作为 权限设置 - 添加协作者面板（推荐协作者）
                    case that.show_authority && that.show_add_partner && that.interim_authority.search_keyword === '':
                        action_list = that.interim_authority.recommend_partner;
						$scroll = $('.set_privacy .add_partner_panel .search_partner_result');
                        break;
                    // 判断当前操作为 权限设置 - 添加协作者面板（搜索结果）
					case that.show_authority && that.show_add_partner && that.interim_authority.search_keyword !== '':
						action_list = that.interim_authority.search_result;
						$scroll = $('.set_privacy .add_partner_panel .search_partner_result');
                        break;
                }
                // 判断关闭所有者下拉框
				if(partner.owner && action_list.filter(item => item.checked).length <= 0 && that.show_partner_authority){
					that.show_partner_authority = false;
					that.editing_partner = false;
					return false;
				}
				that.show_partner_authority = false;
				if(partner.checked){
					partner.checked = false;
				}
				else{
					action_list.forEach(function(item){item.checked = false;});
					partner.checked = true;
					that.show_partner_authority = true;
					let scroll_y = $scroll[0].scrollTop,
						offset_y = $item[0].offsetTop,
						list_h = partner.owner ? 57 : 220,
						item_h = 40;
					if(offset_y - scroll_y < list_h){
						list_top = (offset_y - scroll_y) + item_h - 4;
					}else{
						list_top = (offset_y - scroll_y) - list_h + 4;
					}
					that.partner_authority_top = list_top;
					that.editing_partner = partner;
				}
			},
            // 选择协作者权限
            checked_partner_authority(item) {
				let that = this,
					action_list,
					partner;
				switch (true) {
						// 判断当前操作为 权限设置 - 文档权限面板 || 全部协作者弹框
					case that.show_authority && !that.show_add_partner || that.show_all_partners:
						action_list = that.interim_authority.partner;
						break;
						// 判断当前操作为 权限设置 - 添加协作者面板（推荐协作者）
					case that.show_authority && that.show_add_partner && that.interim_authority.search_keyword === '':
						action_list = that.interim_authority.added_partner;
						break;
						// 判断当前操作为 权限设置 - 添加协作者面板（搜索结果）
					case that.show_authority && that.show_add_partner && that.interim_authority.search_keyword !== '':
						action_list = that.interim_authority.search_result;
						break;
				}
				partner = action_list.filter(item => item.checked)[0];
				if(that.show_all_partners){
					if(item.type === 'remove'){
						that.show_all_partners = false;
						that.$refs.deleteModal.show_modal({
							title: '确认移除',
							content:'移除后，'+ that.editing_partner.nickName +'将无法访问该演示文档',
							sure_text: '确定',
							cancel_text: '取消',
							sure_fn:function(){
								collaborate.delete(that, {
									id: that.interim_authority.document.id,
									partner: partner,
									success: function(data){
										that.show_all_partners = true;
										if(data.data.code !== '2') return that.$toast(data.data.content, 800);
										that.get_all_partner(that.interim_authority.document.id, true);
										that.get_document_collaborates();
									},
								});
							},
							cancel_fn:function(){
								that.show_all_partners = true;
							},
						});
						that.show_partner_authority = false;
						return false;
					}
					// 触发保存
					collaborate.change(that, {
						id: that.interim_authority.document.id,
						role: item.type,
						collaborateId: partner.documentCollaborateId,
						success: function(data){
							if(data.data.code === '2'){
								partner.collaborateRoleType = item.type;
								partner.collaborateRoleName = item.name;
								// 发送文档权限修改
								that.ws_doc_authority_send();
							}
						},
					});
				}else{
					// 判断当前协作者为已添加
					if(partner.documentCollaborateId){
						if(item.type === 'remove') return that.show_remove_confirm = true;
						collaborate.change(that, {
							id: that.interim_authority.document.id,
							role: item.type,
							collaborateId: partner.documentCollaborateId,
							success: function(data){
								if(data.data.code === '2'){
									// 判断当前为添加协作者面板
									if(that.show_add_partner){
										that.toggle_add_partner();
										that.get_all_partner(that.interim_authority.document.id);
									}
									// 判断当前为权限设置面板
									else{
										partner.collaborateRoleType = item.type;
										partner.collaborateRoleName = item.name
									}
									// 发送文档权限修改
									that.ws_doc_authority_send();
								}
							},
						});
					}
					// 判断当前协作者为临时添加
					else{
						if(item.type === 'remove'){
							action_list = action_list.filter(item => !item.checked);
							that.interim_authority.added_partner = action_list;
							that.show_partner_authority = false;
							return false;
						}
						partner.collaborateRoleType = item.type;
						partner.collaborateRoleName = item.name;
					}
				}
				action_list.forEach(function(item){item.checked = false;});
				that.show_partner_authority = false;
            },
			// 协作者权限 - 移除确认 - 取消
			remove_confirm_cancel() {
				this.show_remove_confirm = false;
			},
			// 协作者权限 - 移除确认 - 确认
			remove_confirm_sure() {
				let that = this,
					action_list,
					partner;
				switch (true) {
						// 判断当前操作为 权限设置 - 文档权限面板 ||  全部协作者弹框
					case that.show_authority && !that.show_add_partner || that.show_all_partners:
						action_list = that.interim_authority.partner;
						break;
						// 判断当前操作为 权限设置 - 添加协作者面板（搜索结果）
					case that.show_authority && that.show_add_partner && that.interim_authority.search_keyword !== '':
						action_list = that.interim_authority.search_result;
						break;
				}
				partner = action_list.filter(item => item.checked)[0];
				collaborate.delete(that, {
					id: that.interim_authority.document.id,
					partner: partner,
					success: function(data){
						if(data.data.code !== '2') that.$toast(data.data.content, 800);
						that.show_remove_confirm = false;
						that.show_partner_authority = false;
						// 判断当前为添加协作者面板
						if(that.show_add_partner) that.toggle_add_partner();
						// 更新我的文档协作
						that.get_all_partner(that.interim_authority.document.id, true);
					},
				});
			},
			// 协作者 - 退出协作
			quit_Cooperation(item) {
				let that = this,
					document_list = that.document_list;
				that.closeAllBox();
				that.$refs.deleteModal.show_modal({
					title: '退出协作',
					content:'退出协作后，将无法获得本文档的相应权限。',
					sure_fn:function(){
						collaborate.quit(that, {
							id:  item.id,
							success: function(data){
								if(data.data.code !== '2') return that.$toast(data.data.content, 800);
								that.document_list = document_list.filter(doc => doc.id !== item.id);
							}
						});
					}
				});
			},
			// 获取协作邀请码
			get_invitee_code() {
				let that = this;
                let doc_id = that.interim_authority.document.id;
                let url =  window.location.protocol +'//'+ window.location.host +'/mobile/invite/';
                url += "?docId=" +  doc_id;
                let $canvas = document.getElementById('document_collaborate_ewm_canvas');
                QRCode.toCanvas($canvas, url, {width:146}, function(error) {if(error) console.error(error);});
			},
			// 删除欢迎文档
			delete_welcome_document() {
				let that = this;
				that.$axios.post('/api/member/delete_welcome_document/').then(function(data) {
					data = data.data;
					if(data.code != 2){
						that.$toast('删除失败', 800);
						return;
					}
					that.welcome_document = null;
				}).catch(function(err){
					console.log(err);
					that.$toast('删除失败', 800);
				});
			},

			/**
			 * 团队相关 start
			 */
			// 团队 - 文档列表 - 获取
			get_team_doc(fid,keyword,callback) {
				let that = this;
				that.$axios.get('/api/member/my_team/', {params: {
                    fid: fid,
					keyword: keyword
				}})
				.then(function(data) {
					if(data.data.code === '2'){
						if(typeof callback === 'function') callback(data.data.data);
					}
				})
				.catch((data) => {
					that.doc_loading = false;
					console.error(data.data);
				});
			},
            // 团队 - 文件库列表渲染
			teamDocRender(fid,keyword,nobread) {
				let that = this;
                let document_list = [];
                that.doc_loading = true;
				that.int_document_list();
				that.current_doc_list_type = 'myTeam';
				// 清空面包屑
                if(nobread) that.doc_bread_header = false;
                // 保留搜索
				if(keyword && keyword !== ''){
                    fid = '';
                    that.doc_bread_header = false;
                    that.show_search_list = true;
                }else{
                    that.search_doc_keyword = '';
                    that.show_search_list = false;
                }
				// 获取文档列表
				that.get_team_doc(fid, keyword, function(data){
					// 隐藏加载框
					that.doc_loading = false;
					let children_folders = data.childrenFolders || [];
					let current_folder_info = data.currentFolder || null;
					document_list = data.documentList;
					// 组装文档列表
					if(document_list.length > 0 || children_folders.length > 0){
                        document_list.map(item => {
                            item['page'] = that.$common.document_pages_dataparse([item.documentPage])[0];
                            item.checked = false;
                            if(item.collaborateCreateDate && item.collaborateCreateDate > item.modifyDate){
								item.modifyDate = item.collaborateCreateDate;
							}
                        })
						// 按时间戳排序 && 排除置顶
						document_list = document_list.sort(function(a,b){
							return b.topTime - a.topTime || b.modifyDate - a.modifyDate;
						});
						children_folders = children_folders.sort(function(a,b){
							return b.modifyDate - a.modifyDate;
						});
						// 重组文档列表 组合文件夹和文件
						document_list = children_folders.concat(document_list);
                        document_list.map((item, index) => {
                            if(index < that.show_title_num) {
                                item.isRender = true;
                            } else {
                                item.isRender = false;
                            }
                        })
					}
					// 保存当前文件夹名称
					that.current_folder_info = current_folder_info;
					// 重置面包屑&父级文件夹信息
					if(fid === "") {
						that.previous_grade_path = '';
						that.doc_bread_header = false;
						that.bread_list = [];
						that.grade = 0;
					}
                    that.document_list = document_list;
                    // 设置列表关键词高亮
                    that.$nextTick(function(){
                        if(keyword !== '') that.hightlight_doc_keyword(keyword);
                    })
					// 重置左侧栏信息
					if(current_folder_info.grade == 0 && keyword === '') that.team_folder_list = children_folders;
				})
			},
            // 团队 - 成员设置面板 - 通用 - 复选设置
            team_check_select_member(index) {
                this.$set(this.team_member_select_list[index], 'check', !this.team_member_select_list[index].check);
                // 视图无法更新,强制更新
                this.$forceUpdate();
            },
			// 团队文档 - 权限设置 - 成员全选/取消全选
			team_member_select_toggle(type) {
				let that = this, data = true;
				if(type === 'cancel') data = false;
				that.team_member_select_list.forEach(function(item){
					item.check = data;
					if(['team_owner','creator'].indexOf(item.memberRoleType) > -1 || item.is_mine) item.check = true;
				})
			},
            // 团队文档协作设置
            team_doc_partner_set(list, fn) {
                let that = this;
                // 过滤已加入协作的成员
                list = list.filter(item => !that.interim_authority.partner.some(ele=>ele.memberId===item.memberId));
                if(list.length == 0){
                    that.show_authority = true;
                    if (typeof fn === 'function') fn();
                    return;
                }
                // 属性改为和协作数据相同
                list.forEach(function(item,index){
                    item.collaborateRoleType = item.memberRoleType === 'team_owner' ? 'owner' : 'edit';
                })
                that.interim_authority.added_partner = list;
                // 调用添加协作方法
                that.sure_add_partner(function(){
                    that.show_authority = true;
                    if (typeof fn === 'function') fn();
                });
            },
            // 团队文件夹 - 设置下拉框 - 打开/关闭
			team_folder_operation_toggle() {
				this.team_folder_operation_show = !this.team_folder_operation_show
				this.current_doc_info = this.current_folder_info;
			},
            wrapRoll() {
                if (this.mousewheel_throttle) {
                    return;
                }
                this.mousewheel_throttle = true;
                setTimeout(()=>{
                    let h = document.querySelector('.doc-list-main .main-body').clientHeight;
                    let s = document.querySelector('.doc-list-main .main-body').scrollTop;
                    [...document.querySelectorAll('.doc-list-main .doc-tile-card[data-id]')].map((item, index) => {
                        if((h + s) > (item.offsetTop - 190) && !this.document_list[index].isRender){
                            this.document_list[index].isRender = true;
                        }
                    })
                    this.mousewheel_throttle = false;
                },300)
            },
            // 计算可视窗口展示的title数量和总title数量
            cal_show_title_num() {
                let mainClientWidth = document.querySelector('.doc-list-main .main-body').clientWidth;
                let mainClientHeight = document.querySelector('.doc-list-main .main-body').clientHeight;
                let titleClientWidth = document.querySelector('.doc-list-main .doc-tile-card').clientWidth;
                let titleClientHeight = document.querySelector('.doc-list-main .doc-tile-card').clientHeight;
                this.show_title_num = Math.floor(mainClientWidth / titleClientWidth) * Math.ceil(mainClientHeight / titleClientHeight);
            },
            seeDocMore() {
                this.center.changePanel('production');
            },
            showNextBtn(value) {
                if (value) {
                    $('.panel-region.lately-region > a').show();
                } else {
                    $('.panel-region.lately-region > a').hide();
                }
            }
        }
    }
</script>