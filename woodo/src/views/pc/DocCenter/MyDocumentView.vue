<template>
    <div class="my-document">
        <div class="my-document-container">
            <div class="document-container" v-if="currentNav === 'document'">
                <div class="document-bread-crumb">
                    <div class="document-title flex">
                        <div
                            class="bread-crumb"
                            v-for="(item, index) in breadCrumbNav"
                            :key="index"
                            :style="{ 'cursor': item === currentFolder ? 'no-drop' : 'pointer' }"
                        >
                            <span class="title text-ellipsis" @click="backToFolder(item)">{{ item.name }}</span>
                            <base-icon v-if="index !== breadCrumbNav.length - 1" class="arrow iconfangxiangjiantou" :size="12" :rotate="270"></base-icon>
                        </div>
                        <div class="document-number">您已创建「{{ documentNumber }}/{{ allDocNumber }}」个文档</div>
                    </div>
                </div>
                <!-- 操作栏 -->
                <div class="document-operation flex" :class="{ 'batch': isBatching }">
                    <!-- 页面切换下拉框 -->
                    <div class="document-change-container">
                        <div class="current-document-nav" @click.stop="isChangePage = !isChangePage">
                            <span>{{ documentNav.name }}</span>
                            <base-icon class="iconxialazhankaijiantou" :size="12"></base-icon>
                        </div>
                        <ul class="document-nav-select" v-if="isChangePage">
                            <li
                                v-for="(item, index) in documentNavList"
                                :key="index"
                                @click="changeDocumentNav(item)"
                                :class="{ 'select': item.value === documentNav.value }">
                                {{ item.name }}
                            </li>
                        </ul>
                    </div>
                    <!-- 批量操作 -->
                    <div class="batch-container flex" v-if="isBatching">
                        <input class="select-all" type="checkbox" :height="16" :value="isSelectAll" @change="selectAll" />
                        <span>全选</span>
                        <div v-if="selectDocumentIds.length || selectFolderIds.length">
                            <span @click="showMoveModal">移动</span>
                            <span @click="batchDelete">删除</span>
                        </div>
                    </div>
                    <!-- 文档的相关操作 -->
                    <div class="operation-container flex">
                        <!-- 搜索 -->
                        <div class="search">
                            <div ref="search" v-if="isSearching" class="search-input">
                                <base-icon class="iconsousuo" @click="search"></base-icon>
                                <input
                                    ref="searchInput"
                                    height="44"
                                    :round="true"
                                    placeholder="请输入搜索的关键词"
                                    v-model="keyword"
                                    @keydown.enter="search"
                                />
                                <base-icon v-if="keyword.length" :size="14" class="close iconguanbi2" @click="clearSearch" v-tooltip.bottom="`清空搜索`"></base-icon>
                            </div>
                            <base-icon v-else class="icon-item iconsousuo" v-tooltip.bottom="`搜索`" @click.stop="showSearchInput"></base-icon>
                        </div>
                        <!-- 平铺和列表切换 -->
                        <base-icon
                            :class="[ documentShowType === 'grid' ? 'iconliebiao' : 'iconpingpu', 'icon-item' ]"
                            v-tooltip.bottom="`以${documentShowType === 'grid' ? '列表' : '平铺'}形式展示`"
                            @click="changeDocumentShow">
                        </base-icon>
                        <!-- 新建文件夹 -->
                        <base-icon class="icon-item icontianjiawenjianjia" @click="createFolder" v-tooltip.bottom="`新建文件夹`"></base-icon>
                        <!-- 批量操作 -->
                        <base-icon
                            :class="[ 'icon-item', 'batch-icon', isBatching ? 'iconunbatch' : 'iconpiliang' ]"
                            v-tooltip.bottom="`${isBatching ? '取消' : ''}批量操作`"></base-icon>
                        <!-- 排序 -->
                        <div ref="sort" class="sort-container" :class="{ 'select': this.isSelecting }" @click.stop="isSelecting = !isSelecting">
                            <span class="sort">按 <span class="sort-item">{{ currentSort.value }}</span> 排序</span>
                            <base-icon class="iconxialazhankaijiantou" :size="12"></base-icon>
                            <ul v-if="isSelecting">
                                <li
                                    v-for="(item, index) in sortOption"
                                    :key="index"
                                    @click="sortDocument(item)"
                                    :class="{ 'select': item.key === currentSort.key }">
                                    {{ item.value }}
                                </li>
                            </ul>
                        </div>
                        <div class="upload-file" @click="fileUpload">
                            <base-icon class="iconupload"></base-icon>
                            <span class="text">导入文件</span>
                        </div>
                    </div>
                </div>
            </div>
            <div class="favorite-container" v-else-if="currentNav === 'favorite'">
                <div class="title">我的收藏</div>
                <div class="document-operation flex">
                    <base-icon
                        :class="[ documentShowType === 'grid' ? 'iconlist' : 'iconzidingyipeise', 'show' ]"
                        v-tooltip.bottom="`以${documentShowType === 'grid' ? '列表' : '平铺'}形式展示`"
                        @click="changeDocumentShow">
                    </base-icon>
                </div>
            </div>
            <div class="dustbin-container" v-else>
                <div class="title">回收站</div>
                <div class="document-operation flex" :class="{ 'batch': isBatching }">
                    <!-- 批量操作 -->
                    <div class="batch-container flex" v-if="isBatching">
                        <input class="select-all" type="checkbox" :height="16" :value="isSelectAll" @change="selectAll" />
                        <span>全选</span>
                        <div v-if="selectDocumentIds.length">
                            <span @click="recoverDocument">恢复</span>
                            <span @click="deleteDocumentConfirm">彻底删除</span>
                        </div>
                    </div>
                    <div class="operation-container">
                        <base-icon
                            :class="[ documentShowType === 'grid' ? 'iconlist' : 'iconzidingyipeise', 'show' ]"
                            v-tooltip.bottom="`以${documentShowType === 'grid' ? '列表' : '平铺'}形式展示`"
                            @click="changeDocumentShow">
                        </base-icon>
                        <base-icon :class="[ 'batch-icon', isBatching ? 'iconunbatch' : 'iconbatch' ]" v-tooltip.bottom="`${isBatching ? '取消' : ''}批量操作`"></base-icon>
                    </div>
                    
                </div>
            </div>
        </div>

        <!-- 文档卡片 -->
        <template v-if="currentNav !== 'favorite'">
            <div class="document-card-container">
                <template v-if="documentLoading">
                    <div class="document-loading" :class="{ 'list': documentShowType === 'list' }">
                        <div class="item skeleton-loading" v-for="item in 5" :key="item"></div>
                    </div>
                </template>
                <template v-else-if="documentList.length === 0">
                    <div class="empty-wrapper" v-if="isSearching">
                        <img src="~@/assets/pc/images/doc/empty.png" alt="">
                        <p>没有找到符合您搜索的文档</p>
                    </div>
                    <div class="empty-wrapper" v-else-if="currentNav === 'document'">
                        <img src="~@/assets/common/images/empty.png" alt="">
                        <p>单击<span @click="documentCreate">“新建文档”</span>按钮，开始创建属于您的项目～</p>
                    </div>
                    <div class="empty-wrapper" v-else>
                        <img src="~@/assets/common/images/empty.png" alt="">
                        <p>没有任何文件</p>
                    </div>
                </template>
                <template v-else>
                    <div class="my-document-card" :class="{ 'card-list': documentShowType === 'list' }">
                        <base-list
                            scroll=".document-card-container"
                            :list="documentList"
                            :type="documentShowType === 'grid' ? 'fixed' : 'common'"
                            :min-row="documentShowType === 'grid' ? 4 : 1"
                            :card-width="documentShowType === 'grid' ? 280 : 1250"
                            :card-height="documentShowType === 'grid' ? 240 : 72"
                            @scrollLoad="loadMore"
                        >
                            <template slot-scope="{ item, index }">
                                <draggable class="scroll-wrapper"
                                    :list="documentList"
                                    :options="{
                                        disabled: currentNav === 'document' ? false : true,
                                        draggable: '.doc-card',
                                        animation: 200,
                                        ghostClass: 'drag-holder',
                                        chosenClass: 'chosen',
                                        dragClass: 'dragging',
                                        sort: false,
                                        forceFallback: true,
                                        fallbackTolerance: 15,
                                        fallbackClass: 'draggingStyle',
                                        filter: '.welcomeDocument'
                                    }"
                                    @start="dragDocMove"
                                    @end="dragDocToFolder($event)"
                                >
                                    <document-card
                                        :key="item.id"
                                        :document-info="item"
                                        :document-index="index"
                                        :show-type="documentShowType"
                                        :collaborate-document="collaborates_document"
                                        @distribute="docCardEventDistribute">
                                    </document-card>
                                </draggable>
                            </template>
                        </base-list>
                    </div>
                </template>
            </div>
        </template>
        <template v-else>
            <div class="favorite-template-container">
                <template v-if="documentLoading">
                    <div class="document-loading" :class="{ 'list': documentShowType === 'list' }">
                        <div class="item skeleton-loading" v-for="item in 4" :key="item"></div>
                    </div>
                </template>
                <template v-else-if="favoriteList.length === 0">
                    <div class="empty-wrapper">
                        <img src="~@/assets/common/images/empty.png" alt="">
                        <p>您暂未收藏任何作品</p>
                    </div>
                </template>
            </div>
        </template>

        <!-- 新建文件夹弹框 -->
        <folder-create ref="createFolder" :parent-folder="currentFolder" @success="getDocumentList"></folder-create>

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
                                    <img class="partner_head" v-if="item.memberHead === '' || !item.memberHead" src="~@/../public/images/common/default_head.png" alt="">
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
        <!-- <transition name="modal-fade">
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
        </transition> -->
        
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
                                <template v-if="partner.collaborateRoleType === 'owner' && !partner.teamowner">
                                    <div class="partner_item"
                                        v-for="(partner, index) in interim_authority.partner"
                                        :key="index"
                                        :class="{checked:editing_partner.owner}"
                                    >
                                        <img class="partner_head" :src="partner.head" alt="">
                                        <span class="partner_name">{{partner.nickName}}</span>
                                        <a class="partner_authority"
                                        :class="{unable:interim_authority.partner.length <= 1}"
                                        @click.stop="interim_authority.partner.length > 1 && toggle_partner_authority($event, {img:partner.head, name:partner.nickName, owner:true, authority:''})"
                                        >所有者</a>
                                    </div>
                                </template>

                                <!-- 管理者（团队专属） -->
                                <div class="partner_item"
                                    v-else-if="partner.teamowner"
                                    :class="{checked:partner.checked}"
                                >
                                    <img class="partner_head" v-if="partner.invitee || partner.head === '' || !partner.head" src="~@/../public/images/common/default_head.png" alt="">
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
                                    <img class="partner_head" v-if="partner.invitee || partner.head === '' || !partner.head" src="~@/../public/images/common/default_head.png" alt="">
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
                            v-for="(item, index) in partner_authority"
                            :key="index"
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
                            v-for="(item, index) in document_authority"
                            :key="index"
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
                            <div class="change_owner_list" v-if="!partner.invitee && partner.collaborateRoleType !== 'owner'">
                                <div
                                    class="owner_item"
                                    v-for="(partner, index) in interim_authority.partner"
                                    :key="index"
                                    >
                                    <img class="partner_head" v-if="partner.invitee" src="~@/../public/images/common/default_head.png" alt="">
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
                            <a @click="toggle_add_partner">&gt;返回</a>添加协作成员
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
                            <template v-if="interim_authority.added_partner.length > 0 && interim_authority.search_keyword === ''">
                                <div class="partner_item"
                                    v-for="(partner, index) in interim_authority.added_partner"
                                    :key="index"
                                >
                                    <img class="partner_head" v-if="partner.invitee || partner.head === '' || !partner.head" src="~@/../public/images/common/default_head.png" alt="">
                                    <img class="partner_head" v-else :src="partner.head" alt="">
                                    <span class="partner_name" v-if="partner.invitee">{{partner.invitee}}</span>
                                    <span class="partner_name" v-else-if="partner.nickName === '' || !partner.nickName">{{partner.memberId}}</span>
                                    <span class="partner_name" v-else>{{partner.nickName}}</span>
                                    <span class="invitee_partner" v-if="partner.invitee">外部</span>
                                    <a class="partner_authority" @click="toggle_partner_authority($event, partner)">{{partner.collaborateRoleName}}</a>
                                </div>
                            </template>

                            <!--列表（最近）-->
                            <template v-if="interim_authority.recommend_partner.length > 0 && interim_authority.search_keyword === ''">
                                <div class="partner_item"
                                    v-for="(partner, index) in interim_authority.recommend_partner"
                                    :key="index"
                                >
                                    <img class="partner_head" v-if="partner.invitee || partner.head === '' || !partner.head" src="~@/../public/images/common/default_head.png" alt="">
                                    <img class="partner_head" v-else :src="partner.head" alt="">
                                    <span class="partner_name" v-if="partner.invitee">{{partner.invitee}}</span>
                                    <span class="partner_name" v-else-if="partner.nickName === '' || !partner.nickName">{{partner.memberId}}</span>
                                    <span class="partner_name" v-else>{{partner.nickName}}</span>
                                    <span class="invitee_partner" v-if="partner.invitee">外部</span>
                                    <a class="add_partner_btn" @click="add_interim_partner(partner)">添加</a>
                                    <a class="remove_partner_btn edit-ico edit-ico-delete_2" @click="remove_interim_partner(partner)" title="移除"></a>
                                </div>
                            </template>
                            
                            <!--列表（搜索）-->
                            <template v-if="interim_authority.search_result.length > 0 && interim_authority.search_keyword !== ''">
                                <div class="partner_item"
                                    v-for="(partner, index) in interim_authority.search_result"
                                    :key="index"
                                >
                                    <img class="partner_head" v-if="partner.invitee || partner.head === '' || !partner.head" src="~@/../public/images/common/default_head.png" alt="">
                                    <img class="partner_head" v-else :src="partner.head" alt="">
                                    <span class="partner_name" v-if="partner.invitee">{{partner.invitee}}</span>
                                    <span class="partner_name" v-else-if="partner.nickName === '' || !partner.nickName">{{partner.memberId}}</span>
                                    <span class="partner_name" v-else>{{partner.nickName}}</span>
                                    <span class="invitee_partner" v-if="partner.invitee">外部</span>
                                    <a class="add_partner_btn" v-if="!partner.documentCollaborateId" @click="add_interim_partner(partner)">添加</a>
                                    <a class="partner_authority" v-if="partner.documentCollaborateId"  @click="toggle_partner_authority($event, partner)">{{partner.collaborateRoleName}}</a>
                                </div>
                            </template>
                            
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
                    <div class="modal_content" v-if="partner.collaborateRoleType !== 'owner'">
                        <div class="partner_item"
                            v-for="(partner, index) in interim_authority.partner"
                            :key="index"
                            :class="{checked:partner.checked}"
                        >
                            <img class="partner_head" v-if="partner.invitee || partner.head === '' || !partner.head" src="~@/../public/images/common/default_head.png" alt="">
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
                            v-for="(item, index) in partner_authority"
                            :key="index"
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
	import h5Preview from '@/components/H5Preview.vue';
    import moveModal from '@/components/MoveModal.vue';
    import shareModal from '@/components/ShareModal.vue';
	import exportModal from '@/components/ExportModal.vue';
    import deleteModal from  '@/components/DeleteModal.vue';
	import docOptions from '@/views/pc/DocCenter/components/DocCenterOptions.vue';

    import fileUpload from '@/views/pc/DocCenter/components/FileUpload/FileUpload.js';
    import documentCreate from '@/views/pc/DocCenter/components/DocumentCreate/DocumentCreate.js';

    import MoveModal from '@/components/MoveModal.vue';
    import DocumentCard from '@/views/pc/DocCenter/components/DocumentCard.vue';
    import FolderCreate from '@/views/pc/DocCenter/components/FolderCreate.vue';
    export default {
        name: "DocListMain",
        components: {
            moveModal,
			draggable,
			shareModal,
            deleteModal,
			docOptions,
			h5Preview,
			exportModal,
            MoveModal,
            DocumentCard,
            FolderCreate,
		},
        provide() {
            return {
                main: this
            }
        },
        data() {
            return {
                breadCrumbNav: [                                // 面包屑导航
                    { grade: -1, name: '我的文档' }
                ],
                sortOption: [                                   // 排序可选的列表
                    { key: 'modify', value: '修改日期' },
                    { key: 'create', value: '创建日期' },
                    { key: 'name', value: '名称' },
                ],
                documentNavList: [
                    { name: '所有设计', value: 'all' },
                    { name: '我创建的', value: 'create' },
                    { name: '共享给我的', value: 'share' },
                    { name: '我发布的', value: 'publish' },
                ],
                currentNav: 'document',                         // 当前选择的导航, document: 我的文档, favorite: 我的收藏, dustbin: 回收站
                documentNav: '',                                // 我的设计的页面选择, all: 所有设计, create: 我创建的, share: 共享给我的, publish: 我发布的
                isChangePage: false,                            // 是否展开页面切换列表
                documentApi: null,
                allDocNumber: 3,                                // 可创建的文档数量
                documentList: [],                               // 我的文档列表
                collaborateDocument: {},                        // 全部文档协作者对象
                welcomeDocument: {},
                selectDocumentIds: [],                          // 当前选择的文件列表的 id
                selectFolderIds: [],                            // 当前选择的文件夹列表的 id
                documentNumber: 0,                              // 文档个数
                documentShowType: '',                           // 显示的方式, list: 列表, grid: 网格
                documentLoading: false,                         // 是否正在加载文档列表
                currentSort: '',                                // 当前的排序
                keyword:'',                                     // 搜索的关键字
                isSelecting: false,                             // 是否展开排序下拉列表
                isSearching: false,                             // 是否正在搜索
                isSelectAll: false,                             // 批量操作是否全选
                isBatching: false,                              // 是否进行批量操作

                currentFolder: null,                            // 当前的文件夹
                folderList: [],                                 // 文件夹列表
                favoriteList: [],                               // 收藏的模板列表

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
				ws_client_method: {},

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
            this.documentNav = this.documentNavList[0];
            this.currentSort = this.sortOption[0];
            this.documentShowType = localStorage.getItem('myDesktop_display_type') || 'grid';
            document.addEventListener('click', this.closeDropdown);
            document.querySelector('main').style.overflow = 'unset';
            this.getDesktopDoc();

            const that = this;

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
        },
        beforeDestroy() {
            sessionStorage.setItem('procut_folder', '');
            if(document.querySelector('main')) document.querySelector('main').style.overflow = 'auto';
            document.removeEventListener('click', this.closeDropdown);
        },
        watch: {
            // "parent.list_type": {
            //     handler(n) {
            //         this.chooseType(n);
            //     }
            // },
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
            changeDocumentNav(item) {
            this.documentNav = item;
        },
        closeDropdown() {
            if (this.isSelecting) this.isSelecting = false;                     // 关闭排序选择
            if (this.isChangePage) this.isChangePage = false;                   // 关闭页面切换下拉框
        },
        documentCreate,
        fileUpload,
        getDesktopDoc() {
            // return;
            let that = this;
            let documentList = [];
            let isOwnerRole;
            let folderId = (this.currentFolder && this.currentFolder.id) || '';
            that.documentLoading = true;
            // that.current_doc_list_type = 'myDesktop';
            // 清空面包屑
            // if (nobread) that.doc_bread_header = false;
            // 保留搜索
            // if (keyword && keyword !== '') that.show_search_list = true;
            if (this.documentNav === 'all') {
                isOwnerRole = '';
            } else if (this.documentNav === 'create') {
                isOwnerRole = true;
            } else if (this.documentNav === 'share') {
                isOwnerRole = false;
            }
            // 获取文件夹层级，且返回时显示所在层级
            /* let has_bread_list = sessionStorage.getItem('previous_grade_path');
            let prev_path = sessionStorage.getItem('previous_list_path');
            if (prev_path === 'myDesktop' && has_bread_list && has_bread_list !== '""') {
                that.doc_bread_header = true;
                that.bread_list = JSON.parse(has_bread_list).bread;
                let lastItem = that.bread_list[that.bread_list.length - 1];
                that.currentFolder = lastItem;
                fId = lastItem.id;
                sessionStorage.setItem('previous_grade_path', '');
            } */
            that.$axios.get('/api/member/my_document/', {
                params: {
                    fId: folderId,
                    isOwnerRole,
                    keyword: this.keyword
                }
            }).then(res => {
                let {data, code} = res.data;
                if (code === '2') {
                    console.log(res);
                    that.documentLoading = false;
                    // this.documentList = data.documentList;

                    // return;
                    let childrenFolders = data.childrenFolders || [];
                    let currentFolder = data.currentFolder || null;
                    
                    documentList = data.documentList;
                    
                    //欢迎文档
                    that.welcomeDocument = data.welcomeDocument;
                    if (that.welcomeDocument !== null) {
                        that.welcomeDocument.is_welcomeDocument = true;
                        documentList.push(data.welcomeDocument);
                    }
                    // 组装文档列表
                    if (documentList.length > 0) {
                        documentList.map(item => {
                            item['page'] = that.$common.document_pages_dataparse([item.documentPage])[0];
                            item.checked = false;
                            if (item.collaborateCreateDate && item.collaborateCreateDate > item.modifyDate) {
                                item.modifyDate = item.collaborateCreateDate;
                            }
                        })
                        // 按时间戳排序 && 排除置顶
                        documentList = documentList.sort((a, b) => {
                            return b.topTime - a.topTime || b.modifyDate - a.modifyDate;
                        });
                    }
                    if (childrenFolders.length > 0) {
                        childrenFolders = childrenFolders.sort((a, b) => {
                            return b.modifyDate - a.modifyDate;
                        });
                    }
                    // 重组文档列表 组合文件夹和文件
                    documentList = childrenFolders.concat(documentList);
                    documentList.map((item, index) => {
                        if(index < that.show_title_num) {
                            item.isRender = true;
                        } else {
                            item.isRender = false;
                        }
                    })
                    that.documentList = documentList;

                    // 保存当前文件信息
                    that.currentFolder = currentFolder;
                    return;
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
        getDocumentList() {
            return;
            if (!this.$common.get_login_state().login) return;
            let folderId = this.currentFolder.id || '';
            let show = this.currentNav === 'dustbin' ? 'false' : true;
            this.documentLoading = true;
            this.documentApi = this.$api.documentList({
                data: {
                    isShow: show,
                    pageSize: 30,
                    folderId: this.isSearching ? '' : folderId,
                    keyword: this.keyword,
                },
                success: res => {
                    let list = res.data.documentList;
                    this.documentLoading = false;
                    list.forEach(item => {
                        item.page.duration = util.timeStampTransform(item.page.duration);
                        this.$set(item, 'checked', false);                                  // 添加是否选中的属性
                    });
                    // 回收站
                    if (show === 'false') {
                        this.documentList = list;
                        // 回收站先把保存时间超过了7天的文档删除掉
                        this.documentList = this.documentList.filter(item => {
                            let restTime = item.modifyDate + (7 * 24 * 3600 * 1000) - Date.now();
                            restTime = parseInt(restTime / (24 * 60 * 60 * 1000));
                            return (restTime > 0) || (restTime === 0 && (1 / restTime > 0));
                        });
                        return;
                    }
                    // 我的文档
                    if (this.documentApi && this.documentApi.params.data.pageNumber > 1) {
                        this.documentList = this.documentList.concat(list);
                    } else {
                        this.documentList = list;
                        this.folderList = res.data.folderList;
                        this.folderList.forEach(item => this.$set(item, 'checked', false));
                        this.documentNumber = res.data.documentTotal;
                        this.getFolderNumber(res.data.folderdocumentCount);
                    }
                    this.sortDocument();
                },
                fail: err => {
                    this.documentLoading = false;
                    return console.error(err);
                }
            });
        },
        getFolderNumber(countObj) {
            this.folderList.forEach(item => {
                Object.keys(countObj).forEach(id => {
                    if (Number(item.id) === Number(id)) this.$set(item, 'documentCount', countObj[id]);
                });
            });
        },
        // 切换排序
        sortDocument(item) {
            if (item && item.key) {
                if (this.currentSort.key === item.key) return;
                this.currentSort = item;
            }
            return;
            let topList = this.documentList.filter(item => item.isTop);
            let otherList = this.documentList.filter(item => !item.isTop);
            switch(this.currentSort.key) {
                case 'create':                                                  // 按创建时间
                    this.folderList = this.folderList.sort((a, b) => b.createDate - a.createDate);
                    topList = topList.sort((a, b) => b.createDate - a.createDate);
                    otherList = otherList.sort((a, b) => b.createDate - a.createDate);
                    break;
                case 'modify':                                                  // 按修改时间
                    this.folderList = this.folderList.sort((a, b) => b.modifyDate - a.modifyDate);
                    topList = topList.sort((a, b) => b.modifyDate - a.modifyDate);
                    otherList = otherList.sort((a, b) => b.modifyDate - a.modifyDate);
                    break;
                case 'name':                                                    // 按名称
                    this.folderList = this.folderList.sort((a, b) => a.name.localeCompare(b.name));
                    topList = topList.sort((a, b) => a.title.localeCompare(b.title));
                    otherList = otherList.sort((a, b) => a.title.localeCompare(b.title));
                    break;
                default:
                    break;
            }
            this.documentList = [...this.folderList, ...topList, ...otherList];
            if (this.isSearching) {
                this.documentList.forEach(item => {
                    let reg = new RegExp(this.keyword, 'g');
                    let searchName;
                    if (item.hasOwnProperty('grade')) {
                        if (item.name.indexOf(this.keyword) > -1) {
                            searchName = item.name.replace(reg, `<span style="background: #0fcdcf;">${this.keyword}</span>`);
                            this.$set(item, 'searchName', searchName);
                        };
                    } else {
                        if (item.title.indexOf(this.keyword) > -1) {
                            searchName = item.title.replace(reg, `<span style="background: #0fcdcf;">${this.keyword}</span>`);
                            this.$set(item, 'searchName', searchName);
                        };
                    }
                });
            }
        },
        // 平铺和列表展示的切换
        changeDocumentShow() {
            let type = this.documentShowType === 'grid' ? 'list' : 'grid';
            this.documentShowType = type;
            localStorage.setItem('myDesktop_display_type', type);
        },
        loadMore(end) {
            if (this.documentApi) this.documentApi.next(end);
        },
        // 显示搜索的输入框
        showSearchInput() {
            this.isSearching = true;
            this.$nextTick(() => this.$refs.searchInput.focus());
        },
        // 搜索
        search() {
            this.keyword = this.$refs.searchInput.val;
            if (!this.keyword) return;
            this.getDocumentList();
        },
        // 清空搜索
        clearSearch() {
            this.isSearching = false;
            this.keyword = '';
            this.getDocumentList();
        },
        // 打开新建文件夹弹框
        createFolder() {
            if (!this.$common.get_login_state().login) return;
            this.$refs.createFolder.show();
        },
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
							that.user.memberRankExpire = utils.dateFormat(new Date(that.user.memberRankExpire), 'yyyy/MM/dd');
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
						// that.parent.team_folder_set_member(doc_info.id);
                        console.log('member');
						break;
					case 'enter_folder':
						that.enter_current_folder(doc_info);
						break;
					case 'preview':
						that.previewDoc(doc_info);
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
                        this.previewDoc(doc);
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
                            utils.windowOpenNewtab(window.location.origin + '/slides/?url='+ item.url);
						}else{
							location.href = `/document/slides/${item.url}/`;
						}
					}
					// 跳转编辑页
					else{
						if(newtab){
                            utils.windowOpenNewtab(window.location.origin + '/edit/?docId=' + id);
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
                    // this.center.changePanel('team');
                    return;
                }
                if (type !== 'myTeam' && this.current_doc_list_type === 'myTeam') {
                    // this.center.changePanel('production');
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
			// createFolder() {
			// 	let that = this,
			// 		folder_id = '',
			// 		folder_index = '',
			// 		folderName = that.$refs.folderName.value,
			// 		create_inside = false,
			// 		rag = /\s+/g;
			// 	// 判断是否选中特定文件夹
			// 	if(that.document_list[that.current_doc_index] && that.document_list[that.current_doc_index].open){
			// 		create_inside = true;
			// 		folder_index = that.current_doc_index;
			// 	}
			// 	folder_id = create_inside ? that.document_list[that.current_doc_index].id : that.current_folder_info.id;
			// 	// 错误拦截
			// 	if($validate(folderName).special()) return that.$toast('不能包含特殊字符', 2000);
            //     if(rag.test(folderName)) return that.$toast('文件夹名称不可包含空格',1000);
			// 	if(folderName === '') {
			// 		that.$toast('输入不能为空', 2000);
			// 	} else {
			// 		this.closeAllBox();
            //         that.$axios.post('/api/member/folder/create/',{
			// 			fid: folder_id,
			// 			name: folderName,
			// 		}).then(function(data) {
			// 			if(data.data.code == 2) {
			// 				that.closeCreateFolderModal();
			// 				that.$toast("创建成功", 2000);
            //                 let _data = data.data.data;
            //                 if(create_inside){
            //                     _data.child = true;
            //                     _data.level = that.document_list[folder_index].grade + 1;
            //                     _data.parent_id = folder_id;
            //                     // 插入到特定文件夹之后
            //                     that.document_list.splice(folder_index + 1, 0, _data);
            //                 }else{
            //                     that.document_list.unshift(_data);
            //                 }
			// 			} else {
			// 				that.$toast(data.data.content, 2000);
			// 			}
			// 		});
			// 	}
			// },
			// // 关闭新建文件夹弹框
			// closeCreateFolderModal() {
			// 	this.$refs['folderName'].value = "";
			// 	this.show_create_folder_modal = false;
			// },
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
						data.data.data.time = utils.timeStampDetail(data.data.data.modifyDate / 1000);
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
                    return;
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
					utils.windowOpenNewtab(window.location.origin + url);
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
            // seeDocMore() {
            //     this.center.changePanel('production');
            // },
            showNextBtn(value) {
                if (value) {
                    $('.panel-region.lately-region > a').show();
                } else {
                    $('.panel-region.lately-region > a').hide();
                }
            },

            // DocCenterView.vue
            // 刷新页面
            reloadPage() {
                this.changePanel('recommend');    
            },
            // 切换面板
            changePanel(type) {
                this.$refs.docCreate.close();
                if ((type === 'production' || type === 'team') && !this.$common.get_login_state().login) {
                    this.$refs.navHead.toLogin('account');
                    this.loginCallback = () => {
                        this.changePanel(type);
                    }
                } else if (this.current_panel === type){
                    this.current_panel = '';
                    setTimeout(() => { this.current_panel = type }, 16);
                } else {
                    this.current_panel = type;
                }
            },
            // 打开创建新文档弹框
            openCreate() {
                this.$refs.docCreate.open();
            },
            // 加入团队
            joinTeam() {
                let that = this;
                let key = that.$route.query.key;
                let ownerName = that.$route.query.ownerName;
                that.$modal({
                    modalClass: 'team-modal',
                    modalTitle: '团队协作邀请',
                    modalContent: `<p>${ownerName}邀请你加入 TA 的团队协作</p>`,
                    buttonSubmitTxt: '拒绝',
                    buttonCancelTxt: '接受',
                    submitCallback (modal) {
                        that.$axios.post('/api/member/team/reject_team_invite/', {inviteKey: key})
                        .then(data => {
                            // 去除参数
                            window.history.pushState(null, null, '/home/');
                            modal.close();
                        });
                    },
                    closeCallback: function(){
                        // 去除参数
                        window.history.pushState(null, null, '/home/');
                    },
                    cancelCallback(modal){
                        that.$axios.post('/api/member/team/accept_invitation/', {inviteKey: key})
                        .then(data => {
                            if(data.data.code === '2'){
                                that.changePanel('team');
                                // 去除参数
                                window.history.pushState(null, null, '/home/');
                            }else{
                                localStorage.setItem("error_tip", data.data.content);
                                window.location.href = '/no_power/?type=team';
                            }
                        });
                    }
                });
            },
            // 预览文档
            previewDoc(doc) {
                let id = '';
                if(typeof doc.type === 'undefined') {
                    doc.type = 'document';
                }
                switch(doc.type) {
                    case 'works':
                        id = doc.workShareId;
                        this.$refs.docPreview.show({type: doc.type, id: id});
                        break;
                    case 'template':
                        id = doc.templateId || doc.id;
                        this.$refs.templatePreview.show(id);
                        break;
                    case 'document':
                        id = doc.documentUrl || doc.url;
                        this.$refs.docPreview.show({type: doc.type, id: id});
                        break;
                }
            },
            /**
             * 团队相关 end
             */

            // 绑定账号相关
            bind(type) {
                this.$refs.navHead.toLogin(type);
            },
        }
    }
</script>

<style lang="less" scoped>
@new_icon: url(~@/assets/pc/images/doc/icon_2.3.0.png) no-repeat;
.my-document {
    height: 100%;
    margin-bottom: 80px;
    .title {
        font-size: 20px;
        font-weight: 600;
        color: var(--stressColor);
    }
    .batch-container {
        .select-all {
            vertical-align: sub;
            span {
                padding-left: 10px;
            }
        }
        span {
            color: var(--stressColor);
            padding-right: 30px;
            cursor: pointer;
            &:hover {
                color: var(--mainColor);
            }
        }
    }
    .empty-wrapper {
        height: 240px;
        border-radius: 5px;
        text-align: center;
        border: 1px dashed var(--borderColor);
        background-color: var(--upperColor);
        img {
            height: 100px;
            object-fit: cover;
            margin: 50px 0 22px 0;
        }
        span {
            cursor: pointer;
            color: var(--mainColor);
        }
    }
    .my-document-container {
        margin: 10px 60px 0;
        .document-container {
            .document-bread-crumb {
                width: 100%;
                height: 28px;
                overflow-x: auto;
                overflow-y: hidden;
                white-space: nowrap;
                .document-title {
                    justify-content: flex-start;
                    .bread-crumb {
                        .title {
                            display: inline-block;
                            max-width: 300px;
                            line-height: 28px;
                            vertical-align: middle;
                            color: var(--dimColor);
                            &:last-child {
                                color: var(--stressColor);
                            }
                        }
                        .arrow {
                            color: var(--dimColor);
                            margin: 0 10px;
                        }
                    }
                    .document-number {
                        margin-left: 10px;
                        font-size: 12px;
                        color: var(--textColor);
                    }
                }
            }
            .document-operation {
                justify-content: space-between;
                margin: 17px 0 30px 0;
                height: 44px;
                color: var(--stressColor);
                .document-change-container {
                    position: relative;
                    width: 136px;
                    height: 44px;
                    line-height: 44px;
                    font-size: 12px;
                    color: var(--stressColor);
                    border-radius: 10px;
                    cursor: pointer;
                    border: 1px solid var(--borderColor);
                    .current-document-nav {
                        padding-left: 20px;
                        .base-icon {
                            position: absolute;
                            top: 16px;
                            right: 20px;
                            line-height: 12px;
                            padding-left: 30px;
                        }
                    }
                    .document-nav-select {
                        position: absolute;
                        top: calc(100% + 5px);
                        left: 0;
                        width: 100%;
                        border-radius: 5px;
                        overflow: hidden;
                        padding: 10px 0;
                        z-index: 99;
                        border: 1px solid var(--borderColor);
                        background-color: var(--upperColor);
                        li {
                            list-style: none;
                            height: 40px;
                            list-style: 40px;
                            padding-left: 19px;
                            &:hover {
                                background-color: #FAFAFA;
                            }
                        }
                    }
                }
                .operation-container {
                    .icon-item {
                        font-size: 20px;
                        cursor: pointer;
                        padding: 5px;
                        margin-right: 20px;
                        &:hover {
                            color: var(--mainColor);
                        }
                    }
                    .search {
                        .search-input {
                            position: relative;
                            width: 320px;
                            height: 44px;
                            margin-right: 20px;
                            input {
                                width: 100%;
                                height: 100%;
                                padding-left: 46px;
                                border-radius: 22px;
                                color: var(--stressColor);
                                background-color: var(--upperColor);
                                border: 1px solid transparent;
                                &:focus {
                                    border-color: var(--mainColor);
                                }
                            }
                            .base-icon {
                                position: absolute;
                                top: 13px;
                                left: 17px;
                                z-index: 2;
                                cursor: pointer;
                                color: #5F6063;
                            }
                            .close {
                                top: 9px;
                                left: calc(100% - 35px);
                                padding: 5px;
                            }
                        }
                    }
                    .sort-container {
                        position: relative;
                        padding: 0 30px;
                        cursor: pointer;
                        border-left: 1px solid var(--borderColor);
                        border-right: 1px solid var(--borderColor);
                        .sort {
                            color: var(--dimColor);
                            .sort-item {
                                color: var(--stressColor);
                            }
                        }
                        .base-icon {
                            padding: 5px;
                        }
                        ul {
                            position: absolute;
                            top: 32px;
                            left: 32px;
                            width: 120px;
                            padding: 10px 0;
                            border-radius: 5px;
                            color: var(--stressColor);
                            box-shadow: 0 2px 10px rgba(201, 202, 203, 0.51);
                            background-color: var(--upperColor);
                            overflow: hidden;
                            z-index: 99;
                            li {
                                height: 40px;
                                line-height: 40px;
                                padding-left: 20px;
                                &:hover {
                                    background-color: #FAFAFA;
                                }
                            }
                        }
                        &.select,
                        &:hover {
                            .sort,
                            .sort-item,
                            .base-icon {
                                color: var(--mainColor);
                            }
                        }
                    }
                    .upload-file {
                        display: flex;
                        align-items: center;
                        border-radius: 22px;
                        height: 44px;
                        margin-left: 30px;
                        padding: 10px 24px;
                        cursor: pointer;
                        color: var(--stressColor);
                        border: 1px solid var(--borderColor);
                        .text {
                            margin-left: 10px;
                        }
                        &:hover {
                            color: var(--mainColor);
                            border-color: var(--mainColor);
                            background-color: rgba(13, 123, 246, 0.1);
                        }
                    }
                }
                &.batch {
                    // justify-content: space-between;
                    .batch-icon {
                        color: var(--mainColor);
                    }
                }
            }
        }
        .favorite-container {
            .document-operation {
                justify-content: flex-end;
                cursor: pointer;
                margin: 17px 0 10px 0;
            }
        }
        .dustbin-container {
            .document-operation {
                justify-content: flex-end;
                margin: 27px 0 40px 0;
                .base-icon {
                    font-size: 18px;
                    cursor: pointer;
                    padding: 5px;
                    &:hover {
                        color: var(--mainColor);
                    }
                }
                .batch-icon {
                    margin-left: 20px;
                }
                &.batch {
                    justify-content: space-between;
                    .batch-icon {
                        color: var(--mainColor);
                    }
                }
            }
        }
    }
    .favorite-template-container,
    .document-card-container {
        width: 100%;
        height: calc(100% - 120px);
        overflow-y: auto;
        padding: 0 60px 30px;
        .document-loading {
            display: flex;
            justify-content: space-between;
            .item {
                border-radius: 5px;
                width: 18%;
                height: 220px;
            }
            &.list {
                display: block;
                .item {
                    width: 100%;
                    height: 62px;
                    margin: 0 0 10px 0;
                }
            }
        }
        .my-document-card {
            /deep/ .base-list-main {
                overflow: visible;
            }
            &.card-list {
                /deep/ .base-list-wrap {
                    height: 100% !important;
                }
            }
        }
    }
    .favorite-template-container {
        height: 100%;
        padding-top: 20px;
        .document-loading {
            .item {
                width: 23%;
                height: 200px;
            }
        }
        /deep/ .base-list-main {
            overflow: visible;
        }
    }
}

// 通用设置弹框
.options_masking{
    position: fixed;
    top: 0;
    left: 0;
    z-index:10;
    width: 100%;
    height: 100%;
    text-align: center;
    background-color: rgba(0, 0, 0, 0.502);
    font-size: 16px;
    color: #666666;
    &:after{
        content: "";
        display: inline-block;
        vertical-align: middle;
        width: 0;
        height: 100%;
    }
    .options_modal{
        display: inline-block;
        vertical-align: middle;
        width: 500px;
        height: 180px;
        margin: 0 auto;
        padding: 25px 30px 28px;
        background-color: #fff;
        border-radius: 4px;
        text-align: left;
        .modal-header{
            margin-bottom: 10px;
        }
        .modal_btn{
            display: block;
            width: 100%;
            text-align: right;
            margin-top: 35px;
            button{
                display: inline-block;
                width: 60px;
                height: 30px;
                border-radius: 4px;
                &.cancel{
                    margin-right: 16px;
                    color: #636363;
                    border: 1px solid #e5e5e5;
                    &:hover{
                        opacity:0.8;
                    }
                }
                &.confirm{
                    color: #fff;
                    border-color: var(--mainColor);
                    background-color: var(--mainColor);
                    &:hover{
                        opacity:0.8;
                    }
                }
            }
        }
    }
}
// 重命名弹框
.options_masking.rename .options_modal{
    width: 410px;
    height: 200px;
    padding:17px 30px 25px;
    border-radius: 6px;
    .modal-header{
        margin-bottom:30px;
    }
    .modal-title{
        font-size:16px;
        color:#3b3f47;
    }
    input{
        appearance: none;
        width: 100%;
        height: 45px;
        line-height: 45px;
        padding-left:12px;
        border: 1px solid #c8d4e1;
        border-radius:4px;
        font-size:12px;
        color:#666;
        &:focus,&:hover{
            border-color:var(--mainColor);
        }
        &.active:focus{
            border-color:red;
        }
    }
    .modal_btn{
        text-align:center;
        margin-top:30px;
        button{
            width: 70px;
            height: 34px;
            line-height: 34px;
            font-size:14px;
        }
        .cancel{
            margin-right: 29px;
            background-color: #b7c1cc;
            color:#fff;
        }
    }
}
// 新建文件夹弹框
.options_masking.create-folder .options_modal{
    input{
        appearance: none;
        width: 100%;
        height: 34px;
        line-height: 34px;
        border: 0;
        border-bottom: 1px solid #dbdbdb;
        color:#666;
        &:focus,&:hover{
            border-bottom: 1px solid var(--mainColor);
        }
    }
}
// 删除弹框
.options_masking.delete .options_modal{
    .modal-header {
        margin-bottom: 0;
    }
    p{
        height: 84px;
        line-height: 84px;
        color: #a1a1a1;
    }
    .modal_btn {
        margin-top: 0;
    }
}
// 移动弹框
.options_masking.move{
    .move_folder_modal{
        position:relative;
        display:inline-block;
        vertical-align:middle;
        width:500px;
        min-height:295px;
        max-height:600px;
        height:auto;
        padding:0 30px;
        overflow:hidden;
        border-radius:4px;
        background:#fff;
        user-select:none;
        .header{
            h1{
                display:block;
                height:70px;
                line-height:70px;
                font-size:20px;
                color:#0d1c2e;
                text-align:left;
            }
            .modal-close{
                position: absolute;
                right: 5px;
                top: 5px;
            }
        }
        .body{
            .folder_list_contain{
                padding-bottom:10px;
                &:first-child{
                    border-bottom:1px solid #e5e5e5;
                    margin-bottom:15px;
                }
                .list_wrapper{
                    max-height:200px;
                    overflow-y:auto;
                    &::-webkit-scrollbar-track{
                        background-color:#ffffff;
                    }
                    &::-webkit-scrollbar-thumb{
                        background-color:#e4e4e4;
                    }
                }
                .document{
                    min-height:145px;
                    margin-bottom:5px;
                }
                .team{
                    min-height:122px;
                }
                .folder_item{
                    position:relative;
                    display:block;
                    width:100%;
                    height:33px;
                    line-height:33px;
                    margin-bottom:4px;
                    color:#505050;
                    font-size:14px;
                    text-align:left;
                    cursor:default;
                    &:hover{
                        opacity:1;
                    }
                    &::before{
                        content: "";
                        position: absolute;
                        top: 15px;
                        left: 0;
                        width: 4px;
                        height: 4px;
                        margin-left:1px;
                        border: 1px solid #a6a6a6;
                        border-left: transparent;
                        border-top: transparent;
                        transform: rotate(-45deg);
                        transition: all 0.2s;
                    }
                    p{
                        display: inline-block;
                        width: calc(100% - 11px);
                        padding: 0 0 0 6px;
                        margin-left: 11px;
                        cursor:pointer;
                        &:hover{
                            background:#e8f3ff;
                        }
                    }
                    span{
                        display: inline-block;
                        vertical-align: middle;
                        width: 100%;
                        padding-right:6px;
                        white-space: nowrap;
                        text-overflow: ellipsis;
                        overflow: hidden;
                        &::before{
                            content:"";
                            display:inline-block;
                            vertical-align:middle;
                            width: 22px;
                            height: 18px;
                            margin:0 10px 3px 0;
                            background: url(~@/assets/pc/images/doc/folder_list_icon.png) no-repeat;
                            background-size:contain;
                        }
                    }
                    &.open::before{
                        transform: rotate(45deg);
                        border-color:#000000;
                    }
                    &.check p{
                        background:#e8f3ff;
                    }
                    &.nochild::before{
                        display:none;
                    }
                    &.parent{
                        p{
                            width:auto;
                            height:25px;
                            line-height:23px;
                        }
                        span::before{
                            display:none;
                        }
                    }
                }
            }
        }
        .footer{
            width:100%;
            height:60px;
            line-height:40px;
            text-align:left;
            p{
                width:55%;
                white-space: nowrap;
                text-overflow: ellipsis;
                overflow: hidden;
                font-size:14px;
                color:#838f9f;
            }
            button{
                position:absolute;
                right:30px;
                bottom:20px;
                height:40px;
                line-height:40px;
                border-radius:5px;
                text-align:center;
                font-size:14px;
                &:hover{
                    opacity:0.7;
                }
                &.cancel_btn{
                    width:60px;
                    right:153px;
                    background:#e9edf4;
                    color:#707b8e;
                }
                &.ok_btn{
                    width:110px;
                    background:var(--mainColor);
                    color:#fff;
                }
            }
        }
    }
}
// 权限设置弹框
.set_privacy{
    .options_modal{
        position:relative;
        width:500px;
        height:auto;
        padding:0;
    }
    .set_authority_panel{
        position:relative;
        min-height:273px;
        padding:28px 0 0;
        .modal-close{
            position:absolute;
            top:17px;
            right:16px;
        }
        .modal-header{
            width:440px;
            height:52px;
            margin:0 auto 25px;
            font-size:0;
            p{
                height:30px;
                line-height:30px;
                font-size: 20px;
                font-weight: bold;
                color: #0d1c2e;
            }
            span{
                display:block;
                height:22px;
                line-height:22px;
                font-size:12px;
                color:#84848f;
            }
        }
    }
    .modal_content{
        width:440px;
        height:80px;
        margin:0 auto 20px;
        font-size:0;
        .privacy_bar{
            position:relative;
            width:444px;
            height:80px;
            margin:0 auto 32px;
            padding:18px 0 0 68px;
            border:1px solid #e0e4ea;
            border-radius:2px;
            cursor:pointer;
            &:hover{
                opacity:0.8;
            }
            .authority_icon{
                position:absolute;
                top:18px;
                left:18px;
                width:40px;
                height:40px;
                line-height:40px;
                border-radius:50%;
                text-align:center;;
                background:var(--mainColor);
                i{
                    display:inline-block;
                    vertical-align:middle;
                    background:@new_icon;
                    &.open{
                        width:20px;
                        height:13px;
                        background-position:-55px -161px;
                    }
                    &.edit{
                        width:18px;
                        height:18px;
                        margin-bottom:2px;
                        background-position:-85px -158px;
                    }
                    &.exclusive{
                        width:21px;
                        height:19px;
                        background-position:0 -158px;
                    }
                    &.privacy{
                        width:14px;
                        height:16px;
                        margin-bottom:2px;
                        background-position:-32px -158px;
                    }
                }
            }
            a{
                display:block;
                height:20px;
                line-height:20px;
                font-size:16px;
                color:var(--mainColor);
            }
            .authority_tip{
                display:block;
                height:20px;
                line-height:20px;
                font-size:12px;
                color:#9198a1;
            }
            &::after{
                content:"";
                position:absolute;
                top:25px;
                right:15px;
                display:block;
                width:0;
                height:0;
                border-top:7px solid #c6cad4;
                border-left:7px solid transparent;
                border-right:7px solid transparent;
            }
        }
        .privacy_message{
            position:absolute;
            top:9px;
            left:21px;
            height:42px;
            padding-left:34px;
            &:before{
                position:absolute;
                top:18px;
                left:18px;
                width:40px;
                height:40px;
                line-height:40px;
                border-radius:50%;
                text-align:center;;
                background:var(--mainColor);
                i{
                    display:inline-block;
                    vertical-align:middle;
                    background:@new_icon;
                    &.open{
                        width:20px;
                        height:13px;
                        margin-bottom:2px;
                        background-position:-55px -161px;
                    }
                    &.edit{
                        width:18px;
                        height:18px;
                        margin-bottom:5px;
                        background-position:-85px -158px;
                    }
                    &.exclusive{
                        width:21px;
                        height:19px;
                        margin-bottom:4px;
                        background-position:0 -158px;
                    }
                    &.privacy{
                        width:14px;
                        height:16px;
                        margin-bottom:4px;
                        background-position:-32px -158px;
                    }
                }
            }
            p{
                height:22px;
                line-height:22px;
                font-size:14px;
                color:var(--mainColor);
            }
            span{
                display:block;
                height:20px;
                line-height:20px;
                font-size:12px;
                color:#9297a6;
            }
        }
    }
    // 私密权限提示
    .privacy_tips{
        width:440px;
        height:200px;
        margin:0 auto;
        padding-top:21px;
        font-size:14px;
        color:#848995;
        text-align:center;
        &:before{
            content:'';
            display:block;
            width:82px;
            height:96px;
            margin:0 auto 12px;
            background:@new_icon -110px -5px;
        }
    }
    // 添加协作者
    .add_partner{
        width:500px;
        height:255px;
        padding-bottom:30px;
        .add_partner_title{
            width:440px;
            height:30px;
            line-height:30px;
            margin:0 auto;
            font-size:12px;
            color:#848995;
        }
        .add_partner_btn{
            display:block;
            width:440px;
            height:40px;
            line-height:40px;
            margin:0 auto 14px;
            border:1px solid #f1fafe;
            background:#e4f1ff;
            font-size:14px;
            color:var(--mainColor);
            text-align:center;
            cursor:pointer;
            &:hover{
                border-color:var(--mainColor);
            }
        }
        .partner_list{
            width:500px;
            height:166px;
            overflow-y:auto;
            &::-webkit-scrollbar-track{
                background-color:#ffffff;
            }
            &::-webkit-scrollbar-thumb{
                background-color:#e4e4e4;
            }
        }
    }
    // 文档权限下拉框
    .document_authority_list{
        top:106px;
        left:30px;
    }
    // 转让所有权弹框
    .change_owner_panel{
        position:absolute;
        top:0;
        left:0;
        z-index:10;
        width:100%;
        height:100%;
        background:rgba(255,255,255,0.6);
        .change_owner_inner{
            position:absolute;
            top:50%;
            lefT:50%;
            width:310px;
            height:350px;
            margin: -175px 0 0 -155px;
            border:1px solid #ccd3db;
            border-radius:2px;
            background:#ffffff;
            font-size:0;
            box-shadow:3px 0 3px 0 rgba(0,0,0,0.08);
            p{
                width:260px;
                height:45px;
                line-height:46px;
                margin:0 auto;
                border-bottom:1px solid #e1e5f0;
                font-size:16px;
                color:#575e61;
            }
            &:after{
                content:'';
                position:absolute;
                bottom:0;
                left:1px;
                display:inline-block;
                width:100%;
                height:25px;
                background: -webkit-linear-gradient(rgba(255,255,255,.1), rgba(255,255,255,.5));
                background: -o-linear-gradient(rgba(255,255,255,.1), rgba(255,255,255,.5));
                background: -moz-linear-gradient(rgba(255,255,255,.1), rgba(255,255,255,.5));
                background: linear-gradient(rgba(255,255,255,.1), rgba(255,255,255,.5));
            }
        }
        .change_owner_list{
            position:relative;
            width:308px;
            height:303px;
            overflow:hidden;
            overflow-y:auto;
            padding:25px 0;
            &::-webkit-scrollbar-track{
                background-color:#ffffff;
            }
            &::-webkit-scrollbar-thumb{
                background-color:#e4e4e4;
            }
        }
        .owner_item{
            position:relative;
            width:310px;
            height:40px;
            line-height:40px;
            padding:0 25px;
            font-size:0;
            &:hover{
                background:#f5f8fe;
            }
            img{
                display:inline-block;
                width:24px;
                height:24px;
                border-radius:24px;
                vertical-align:middle;
            }
            span{
                display:inline-block;
                height:30px;
                line-height:30px;
                padding-left:15px;
                font-size:14px;
                color:#838f9f;
                vertical-align:middle;
            }
            a{
                position:absolute;
                top:8px;
                right:25px;
                display:inline-block;
                width:46px;
                height:24px;
                line-height:22px;
                border:1px solid #c5d0dc;
                border-radius:4px;
                font-size:12px;
                color:#838f9f;
                text-align:center;
                &:hover{
                    border-color:var(--mainColor);
                    background:var(--mainColor);
                    color:#ffffff;
                }
            }
        }
    }
    // 转让所有权确认弹框
    .sure_change_owner_panel{
        position:absolute;
        top:0;
        left:0;
        z-index:10;
        width:100%;
        height:100%;
        background:rgba(255,255,255,0.6);
        .sure_change_owner{
            position:absolute;
            top:50%;
            left:50%;
            width:440px;
            height:200px;
            padding:0 15px;
            margin:-100px 0 0 -220px;
            border:1px solid #ccd3db;
            border-radius:2px;
            background:#ffffff;
            font-size:0;
            text-align:center;
            box-shadow:3px 0 3px 0 rgba(0,0,0,0.08);
            .title{
                height:64px;
                line-height: 64px;
                margin-bottom:4px;
                font-size:16px;
                color:#575e61;
            }
            .tips{
                width:100%;
                height:52px;
                line-height:18px;
                font-size:12px;
                color:#8f96a6;
                span{
                    color:var(--mainColor);
                }
            }
            .button_bar{
                height:78px;
                line-height:78px;
                a{
                    display:inline-block;
                    width:60px;
                    height:30px;
                    line-height:30px;
                    margin:0 5px;
                    border-radius:4px;
                    font-size:12px;
                    &:first-child{
                        background:#f6f6f6;
                        color:#9196a6;
                    }
                    &:last-child{
                        background:var(--mainColor);
                        color:#ffffff;
                    }
                }
            }
        }
    }
}
// 团队权限
.set_privacy.team{
    .modal-header{
        height:auto;
        margin-bottom:33px;
        a{
            font-size:16px;
            color:#aeaeb3;
            &::before{
                content: "";
                display: inline-block;
                vertical-align: middle;
                width: 7px;
                height: 7px;
                margin: 0 3px 0 0;
                border: 2px solid #aeaeb3;
                border-left: transparent;
                border-top: transparent;
                border-radius: 2px;
                transform: rotate(135deg);
                transition: all 0.2s;
            }
        }
    }
    .modal_content{
        position:relative;
        height:auto;
        &>p{
            margin-bottom:8px;
            font-size:12px;
            color:#84848f;
            &.right{
                position: absolute;
                right: 0;
                top: 0;
                text-align: right;
                width: auto;
            }
        }
    }
    .partner_item{
        cursor:pointer;
        a{
            position:absolute;
            right: 30px;
            top: calc(50% - 9px);
            width:18px;
            height:18px;
            border-radius:4px;
            border:1px solid #c3d6ee;
            text-align:center;
            line-height:18px;
        }
        &.check a{
            background:var(--mainColor);
            &::after{
                content: "";
                position: absolute;
                left: 5px;
                top: 3px;
                width: 4px;
                height: 7px;
                border: 2px solid #fff;
                border-left: transparent;
                border-top: transparent;
                border-radius:2px;
                transform: rotate(45deg);
                transition: all 0.3s;
            }
        }
        &.disabled{
            cursor: default;
            opacity: 0.5;
            pointer-events: none;
            &:hover{
                opacity:1;
            }
        }
    }
    .add_partner{
        position:relative;
        height:auto;
        max-height: 255px;
        padding-bottom: 0;
        overflow-y: auto;
        .no_partner{
            height: 80px;
            line-height: 70px;
            font-size: 14px;
            color: #848995;
            text-align: center;
        }
    }
    .add_partner_title.right{
        position: absolute;
        right: 30px;
        top: 0;
        text-align: right;
        width: auto;
    }
    .modal_footer{
        margin:6px 0 12px 0;
        text-align:center;
        .ok_btn{
            display:inline-block;
            width:110px;
            height:40px;
            line-height:40px;
            margin-bottom:10px;
            background:var(--mainColor);
            border-radius:5px;
            font-size:14px;
            color:#fff;
        }
        P{
            width:100%;
            font-size:12px;
            color:#b1b1bb;
        }
    }
}

// 设置私密确认框
.authority_confirm{
    position:absolute;
    top:0;
    left:0;
    z-index:3;
    width:100%;
    height:100%;
    background:rgba(255,255,255,0.6);
    .confirm_inner{
        position:absolute;
        top:50%;
        left:50%;
        width:400px;
        height:200px;
        margin:-100px 0 0 -200px;
        padding-bottom:25px;
        border:1px solid #ccd3db;
        border-radius:2px;
        background:#ffffff;
        font-size:0;
        text-align:center;
        box-shadow:3px 3px 5px 0 rgba(0,0,0,0.1);
    }
    .head{
        height:65px;
        line-height:65px;
        font-size:16px;
        color:#575e61;
    }
    .body{
        margin-bottom:36px;
        p{
            height:22px;
            line-height:22px;
            font-size:12px;
            color:#8f96a6;
        }
    }
    .foot{
        height:30px;
        line-height:30px;
        a{
            display:inline-block;
            width:60px;
            height:30px;
            margin:0 5px;
            border-radius:4px;
            background:#f6f6f6;
            font-size:12px;
            color:#9196a6;
            &:last-child{
                background:var(--mainColor);
                color:#ffffff;
            }
        }
    }
}
// 协作者项
.partner_item{
    position:relative;
    width:100%;
    height:40px;
    line-height:40px;
    padding:0 30px;
    font-size:0;
    &:hover{
        background:#f5f8fe;
    }
    .partner_head{
        display:inline-block;
        width:24px;
        height:24px;
        border-radius:24px;
        vertical-align:middle;
    }
    .partner_name{
        display:inline-block;
        max-width: calc(100% - 150px);
        height:30px;
        line-height:30px;
        padding-left:15px;
        font-size:14px;
        color:#838f9f;
        vertical-align:middle;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
    }
    .invitee_partner{
        display:inline-block;
        width:36px;
        height:20px;
        line-height:18px;
        margin:0 8px;
        border:1px solid var(--mainColor);
        border-radius:4px;
        font-size:12px;
        color:var(--mainColor);
        text-align:center;
        vertical-align:middle;
    }
    .invitee_tips{
        font-size:12px;
        color:#aeb7c3;
        vertical-align:middle;
    }
    .partner_authority{
        position:absolute;
        top:5px;
        right:30px;
        height:30px;
        line-height:30px;
        padding-right:14px;
        font-size:12px;
        color:#838f9f;
        user-select:none;
        &:after{
            content:'';
            position:absolute;
            top:13px;
            right:0;
            display:inline-block;
            width:1px;
            height:4px;
            border-top:4px solid #cfcfcf;
            border-left:4px solid transparent;
            border-right:4px solid transparent;
            transition: transform 0.5s;
            transform-origin: 50% 25%;
        }
        &:hover{
            color:var(--mainColor);
            opacity:1;
            &:after{
                border-top-color:var(--mainColor);
            }
        }
        &.unable{
            opacity:0.5;
            padding-right:0;
            color:#838f9f;
            cursor:default;
            &:hover{
                opacity:0.5;
            }
            &:after{
                display:none;
            }
        }
    }
    .add_partner_btn{
        position:absolute;
        top:8px;
        right:60px;
        display:inline-block;
        width:46px;
        height:24px;
        line-height:22px;
        border:1px solid #c5d0dc;
        border-radius:4px;
        font-size:12px;
        color:#838f9f;
        text-align:center;
        &:hover{
            border-color:var(--mainColor);
            background:var(--mainColor);
            color:#ffffff;
        }
    }
    .remove_partner_btn {
        position:absolute;
        top:11px;
        right:30px;
    }
    &.checked{
        background:#f5f8fe;
        .partner_authority{
            color:var(--mainColor);
            opacity:1;
            &:after{
                border-top-color:var(--mainColor);
                transform:rotate(180deg);
            }
        }
    }
}
// 文档权限下拉框
.document_authority_list{
    position:absolute;
    top:0;
    left:0;
    width:443px;
    height:260px;
    border:1px solid var(--mainColor);
    background:#ffffff;
    .authority_item{
        position:relative;
        width:100%;
        height:60px;
        padding:8px 0 0 55px;
        cursor:pointer;
        p{
            height:22px;
            line-height:22px;
            font-size:14px;
            color:#535865;
        }
        span{
            display:block;
            height:20px;
            line-height:20px;
            font-size:12px;
            color:#9297a6;
        }
        &:hover{
            background:#f9f9f9;
        }
        &.checked{
            background:#f1fafe;
            p{
                color:var(--mainColor);
            }
            &:after{
                content:'';
                position:absolute;
                top:19px;
                right:18px;
                display:inline-block;
                width:24px;
                height:19px;
                background:@new_icon -110px -110px;
            }
        }
        & + .authority_item{
            margin-top:6px;
        }
        &:before{
            content:'';
            position:absolute;
            top:15px;
            left:21px;
            display:inline-block;
            background:@new_icon;
        }
        &[type=open]{
            &:before{
                width:20px;
                height:13px;
                background-position:-55px -72px;
            }
            &.checked:before{
                background-position:-55px -102px;
            }
        }
        &[type=edit]{
            &:before{
                width:18px;
                height:18px;
                background-position:-85px -69px;
            }
            &.checked:before{
                background-position:-85px -100px;
            }
        }
        &[type=exclusive]{
            &:before{
                width:20px;
                height:19px;
                background-position:-1px -69px;
            }
            &.checked:before{
                background-position:-1px -100px;
            }
        }
        &[type=privacy]{
            &:before{
                width:14px;
                height:16px;
                background-position:-32px -69px;
            }
            &.checked:before{
                background-position:-32px -100px;
            }
        }
    }
}
// 协作者权限下拉框
.partner_authority_list{
    position:absolute;
    bottom:34px;
    right:30px;
    z-index:2;
    width:240px;
    height:220px;
    border:1px solid #f0f2f4;
    border-radius:2px;
    background:#ffffff;
    box-shadow:3px 0 3px 0 rgba(0,0,0,0.08);
    &.change_owner{
        height:57px;
    }
    .partner_authority_item{
        width:238px;
        height:55px;
        padding:10px 0 0 30px;
        border-bottom:1px solid #f0f2f4;
        font-size:0;
        cursor:pointer;
        span{
            display:block;
            &:first-child{
                height:18px;
                line-height:18px;
                font-size:14px;
                color:#848995;
            }
            &:last-child{
                height:16px;
                line-height:16px;
                font-size:12px;
                color:#b0b5c2;
            }
        }
        p{
            height:45px;
            line-height:35px;
            font-size:14px;
            color:#fb5959
        }
        &:hover{
            background:#f5f8fe;
        }
        &.checked{
            background:#f1fafe;
            span:first-child{
                color:var(--mainColor);
            }
        }
    }
}
// 添加协作者面板
.add_partner_panel{
    position:absolute;
    top:0;
    left:0;
    width:502px;
    min-height:473px;
    padding-bottom:80px;
    border-radius:2px;
    background:#ffffff;
    .add_partner_head{
        position:relative;
        height:66px;
        line-height:66px;
        font-size:18px;
        color:#353942;
        text-align:center;
        a{
            position:absolute;
            top:50%;
            left:30px;
            display:inline-block;
            height:22px;
            line-height:22px;
            margin-top:-11px;
            font-size:14px;
            color:#353942;
        }
    }
    .search_partner{
        position:relative;
        width:440px;
        height:45px;
        margin:0 auto;
        padding:0 30px 0 35px;
        border:1px solid #ccd3db;
        border-radius:2px;
        font-size:0;
        &:before{
            content:'';
            position:absolute;
            top:14px;
            left:10px;
            display:inline-block;
            width:17px;
            height:16px;
            background:@new_icon -144px -110px;
        }
        input{
            display:inline-block;
            width:100%;
            height:43px;
            line-height:43px;
            font-size:14px;
            color:#353942;
            &::-webkit-input-placeholder{
                color:#a1adbd;
            }
            &:-moz-placeholder{
                color:#a1adbd;
            }
            &::-moz-placeholder{
                color:#a1adbd;
            }
            &:-ms-input-placeholder{
                color:#a1adbd;
            }
        }
        .clear_input{
            position:absolute;
            top:50%;
            right:12px;
            width:18px;
            height:18px;
            margin-top:-9px;
            background:@new_icon -1px -131px;
            cursor:pointer;
        }
    }
    .partner_invite_tips {
        display: block;
        position: relative;
        width: 440px;
        line-height: 30px;
        padding-left: 2em;
        margin: 0 auto;
        font-size: 12px;
        text-align: left;
        color: #7dbaff;
        i{
            position: absolute;
            left: 0;
            top: 10px;
        }
    }
    .search_partner_result{
        width:500px;
        height:auto;
        max-height:268px;
        margin: 14px auto 0;
        overflow-y:auto;
        &::-webkit-scrollbar-track{
            background-color:#ffffff;
        }
        &::-webkit-scrollbar-thumb{
            background-color:#e4e4e4;
        }
        p:first-child{
            width:440px;
            height:26px;
            line-height:26px;
            margin:0 auto 20px;
            border-bottom:1px solid #e6e7e7;
            font-size:14px;
            color:#616a76;
        }
        .empty_partner{
            width:100%;
            padding:28px 0 20px;
            font-size:0;
            text-align:center;
            p{
                height:132px;
                line-height:132px;
                border:none;
                font-size:122px;
                color:#838f9f;
                opacity:0.2;
            }
            span{
                display:inline-block;
                height:28px;
                line-height:28px;
                font-size:14px;
                color:#b0b5c2;
            }
        }
    }
    .add_partner_foot{
        position:absolute;
        bottom:0;
        left:0;
        display:block;
        width:100%;
        height:80px;
        a{
            position:absolute;
            top:50%;
            height:40px;
            line-height:40px;
            margin-top:-20px;
            border-radius:4px;
            font-size:14px;
        }
        .add_from_wechat{
            left:30px;
            width:130px;
            padding-left:36px;
            border:1px solid #d4dbe5;
            color:#535f6e;
            &:before{
                content:'';
                position:absolute;
                top:10px;
                left:7px;
                display:inline-block;
                width:24px;
                height:24px;
                background:url(~@/assets/pc/images/doc/icon_2.3.0.png) no-repeat -171px -110px
            }
            &:hover + .add_partner_ewm{
                display:block;
            }
        }
        .ok_btn{
            right:30px;
            width:120px;
            border-radius:4px;
            background:var(--mainColor);
            font-size:14px;
            color:#ffffff;
            text-align:center;
            &.unable{
                background:#eaeef1;
                color:#adbaca;
            }
        }
        .add_partner_ewm{
            position:absolute;
            bottom:70px;
            left:30px;
            display:none;
            width:146px;
            height:165px;
            border:1px solid #d5dce4;
            border-radius:2px;
            background:#ffffff;
            box-shadow:2px 2px 5px 0 rgba(0, 0, 0, 0.18);
            text-align:center;
            overflow:hidden;
            span{
                position:absolute;
                bottom:0;
                left:0;
                display:block;
                width:100%;
                height:34px;
                line-height:34px;
                font-size:12px;
                color:#71839c;
            }
        }
    }
}
// 添加协作者面板
.all_partners{
    .options_modal{
        position:relative;
        width:500px;
        height:450px;
        padding:0;
    }
    .modal-close{
        position:absolute;
        top:17px;
        right:12px;
    }
    .modal-header{
        height:60px;
        line-height:60px;
        padding-left:30px;
        margin:0 !important;
        font-size:18px;
        color:#353942;
    }
    .modal_content{
        width:100%;
        height:390px;
        padding-bottom:30px;
        overflow-y:auto;
        &::-webkit-scrollbar-track{
            background-color:#ffffff;
        }
        &::-webkit-scrollbar-thumb{
            background-color:#e4e4e4;
        }
    }
}

// 创建团队弹框
.create_team_modal{
    position:fixed;
    top:0;
    left:0;
    z-index:999;
    width:100%;
    height:100%;
    background:rgba(0,0,0,0.5);
    text-align:center;
    user-select:none;
    .create_team_contain{
        position:relative;
        top:50%;
        width:560px;
        height:560px;
        margin:-280px auto 0;
        background:#fff;
        border-radius:6px;
    }
    .close{
        position:absolute;
        top:17px;
        right:20px;
        width:10px;
        height:10px;
        background:url(~@/assets/pc/images/doc/icon_2.4.0.png) no-repeat -166px -52px;
        transition:all .3s;
        &:hover{
            transform:rotate(180deg);
        }
    }
    .header{
        width:100%;
        height:130px;
        background:url(~@/assets/pc/images/doc/create_team_head.png)no-repeat center;
        border-top-left-radius:6px;
        border-top-right-radius:6px;
        text-align:center;
        .team_name{
            display:inline-block;
            position:relative;
            top:50%;
            width:305px;
            height:40px;
            margin:-20px auto 0;
        }
        input{
            width:100%;
            height:100%;
            line-height:40px;
            color:#fff;
            font-size:20px;
            font-weight:bold;
            text-align:center;
            border-bottom:0 solid rgba(255,255,255,0.6);
            transition:all 0.3s;
            animation: input_focus 0s;
            animation-delay:1.1s;
            animation-fill-mode:forwards;
            &:focus{
                border-color:var(--mainColor) !important;
            }
            &:hover{
                border-color:rgba(255,255,255,1);
                &::-webkit-input-placeholder{
                    color:rgba(255,255,255,1) !important;
                }
                &:-moz-placeholder{
                    color:rgba(255,255,255,1) !important;
                }
                &::-moz-placeholder{
                    color:rgba(255,255,255,1) !important;
                }
                &:-ms-input-placeholder{
                    color:rgba(255,255,255,1) !important;
                }
            }
            &::-webkit-input-placeholder{
                transition:all 0.5s;
                color:rgba(255,255,255,.7);
            }
            &:-moz-placeholder{
                transition:all 0.5s;
                color:rgba(255,255,255,.7);
            }
            &::-moz-placeholder{
                transition:all 0.5s;
                color:rgba(255,255,255,.7);
            }
            &:-ms-input-placeholder{
                transition:all 0.5s;
                color:rgba(255,255,255,.7);
            }
        }
        .input_border {
            position: absolute;
            bottom: -1px;
            left: 50%;
            width: 0;
            height: 2px;
            background-color: var(--mainColor);
            animation: input_border_focus 0.7s;
            animation-delay:0.4s;
        }
        @keyframes input_border_focus {
            from{left:50%;width:0;}
            to{left:0;width: 100%;}
        }
        @keyframes input_focus{
            from{border-width:0;}
            to{border-width:2px;}
        }
    }
    .body{
        margin-top:22px;
        text-align:left;
        h1{
            display:none;
        }
        .invite_type_panel{
            margin:0 auto 40px;
            padding:0 40px;
            .invite_type{
                margin-bottom:5px;
                a{
                    color:#838f9f;
                    font-size:13px;
                    &.current{
                        color:#000;
                        font-weight:bold;
                    }
                    &.disabled{
                        pointer-events:none;
                    }
                    &.link::before{
                        content:"";
                        display:inline-block;
                        vertical-align:middle;
                        height:10px;
                        width:1px;
                        background:#838f9f;
                        margin:0 10px;
                    }
                }
            }
        }
        .search_member{
            position:relative;
            width:100%;
            border-radius:2px;
            font-size:0;
            a{
                position: absolute;
                top: 17px;
                right: 15px;
                font-size: 14px;
                color: var(--mainColor);
                &.disabled{
                    opacity:.7;
                    pointer-events:none;
                }
            }
            p{
                position: absolute;
                height:30px;
                line-height:30px;
                color:#838f9f;
                font-size:12px;
            }
            input{
                display:inline-block;
                width:100%;
                height:40px;
                line-height:40px;
                margin-top:6px;
                padding:0 95px 0 10px;
                font-size:14px;
                color:#353942;
                border: solid 1px rgba(172, 172, 186, 0.44);
                border-radius:2px;
                transition:all .2s;
                &.disabled{
                    pointer-events: none;
                }
                &:focus,&:hover{
                    border-color:var(--mainColor);
                }
                &::-webkit-input-placeholder{
                    color:#a7adb5;
                }
                &:-moz-placeholder{
                    color:#a7adb5;
                }
                &::-moz-placeholder{
                    color:#a7adb5;
                }
                &:-ms-input-placeholder{
                    color:#a7adb5;
                }
            }
            .clear_input{
                position:absolute;
                top: 17px;
                right: 25px;
                width:18px;
                height:18px;
                background:@new_icon -1px -131px;
                cursor:pointer;
                &:hover{
                    opacity:.7;
                }
            }
        }
        .search_member_result{
            width:100%;
            height:252px;
            overflow-y:auto;
            &::-webkit-scrollbar-track{
                background-color:#ffffff;
            }
            &::-webkit-scrollbar-thumb{
                background-color:#e4e4e4;
            }
            p:first-child{
                width:calc(100% - 80px);
                height:26px;
                line-height:26px;
                margin:0 auto 20px;
                border-bottom:1px solid #e6e7e7;
                font-size:14px;
                color:#616a76;
            }
            .partner_item{
                padding:0 40px;
                &.checked .partner_invitation::after{
                    transform: rotate(360deg);
                }
                &.disabled{
                    opacity:.8;
                    pointer-events: none;
                }
            }
            .add_partner_btn{
                right:40px;
            }
            .partner_invitation{
                position: absolute;
                top: 0;
                right:40px;
                display: inline-block;
                height:40px;
                line-height: 40px;
                font-size: 12px;
                color: #838f9f;
                &::after{
                    content: "";
                    display:inline-block;
                    vertical-align:middle;
                    margin-left:5px;
                    width: 0;
                    height: 0;
                    border-left: 5px solid transparent;
                    border-right: 5px solid transparent;
                    border-bottom: 5px solid #acb7c5;
                    transform: rotate(180deg);
                    transition: all 0.3s;
                    cursor:pointer;
                }
                ul{
                    position:absolute;
                    top:35px;
                    right:-14px;
                    width:70px;
                    height:40px;
                    z-index:10;
                    background:#fff;
                    padding-left:16px;
                    box-shadow: 0 4px 6px 0px rgba(0, 0, 0, 0.07);
                    border: solid 1px rgba(197, 208, 220, 0.4);
                    border-radius: 4px;
                }
                li{
                    height:40px;
                    line-height:40px;
                    text-align:left;
                    user-select:none;
                    &:last-child{
                        cursor:pointer;
                        &:hover{
                            color:#fb5959;
                        }
                    }
                }
                &.disabled{
                    opacity:.8;
                    pointer-events: none;
                    &::after{
                        display:none;
                    }
                }
            }
            .empty_member{
                width:100%;
                font-size:0;
                text-align:center;
                user-select:none;
                p{
                    height:132px;
                    line-height:132px;
                    border:none;
                    font-size:122px;
                    color:#838f9f;
                    opacity:0.2;
                }
                span{
                    display:inline-block;
                    height:28px;
                    line-height:28px;
                    font-size:14px;
                    color:#b0b5c2;
                }
            }
        }
    }
    .footer{
        display:block;
        position:absolute;
        bottom:21px;
        left:0;
        width:100%;
        height:46px;
        text-align:center;
        button{
            width:160px;
            height:100%;
            line-height:46px;
            border-radius:4px;
            font-size:14px;
            background:var(--mainColor);
            color:#ffffff;
            text-align:center;
            &:hover{
                opacity:.7;
            }
            &.unable{
                background:#d2dbe6;
                cursor: default;
            }
        }
    }
    .invite{
        height:490px;
        .close{
            width: 26px;
            height: 26px;
            background: url('~@/assets/pc/images/common/modal_sp.png') no-repeat 8px 8px;
        }
        .header{
            display:none;
        }
        h1{
            display:block;
            height:70px;
            line-height:70px;
            font-size:24px;
            font-weight:bold;
            color:#3f464f;
            text-align:center;
        }
        .footer{
            .wechat_btn{
                position:relative;
                padding-left:24px;
                margin-right:22px;
                background:#2fc889;
                &:before{
                    content:'';
                    position:absolute;
                    top: 13px;
                    left: 23px;
                    display:inline-block;
                    width:24px;
                    height:19px;
                    background:url(~@/assets/pc/images/doc/icon_2.3.0.png) no-repeat -28px -130px;
                }
                &:hover + .add_member_ewm{
                    display:block;
                }
            }
            .add_member_ewm{
                position: absolute;
                bottom: 52px;
                left: 103px;
                display: none;
                width: 170px;
                height: 170px;
                border: 1px solid #e8ecf1;
                border-radius: 4px;
                background: #ffffff;
                box-shadow: 0px 4px 6px 0px rgba(0, 0, 0, 0.07);
                text-align: center;
                overflow: hidden;
                span{
                    position:absolute;
                    bottom:0;
                    left:0;
                    display:block;
                    width:100%;
                    height:34px;
                    line-height:34px;
                    font-size:12px;
                    color:#71839c;
                }
            }
        }
    }
}
// 团队文件夹成员设置弹框
.folder_member_modal{
    position:fixed;
    top:0;
    left:0;
    z-index:999;
    width:100%;
    height:100%;
    background:rgba(0,0,0,0.5);
    text-align:center;
    user-select:none;
    .folder_member_contain{
        position:relative;
        top:50%;
        width:500px;
        height:385px;
        margin:-250px auto 0;
        padding:20px 30px;
        background:#fff;
        border-radius:4px;
    }
    .header{
        padding-bottom:15px;
        margin-bottom:13px;
        border-bottom:1px solid #d4dae4;
        h1{
            display:block;
            width:100%;
            margin-bottom:20px;
            color:#43434c;
            font-size:18px;
            font-weight:bold;
            text-align:center;
        }
        p{
            height:20px;
            color:#414753;
            font-size:12px;
            text-align:left;
        }
        span{
            display:block;
            margin-bottom:5px;
            text-align:left;
            font-size:12px;
            color:#707b8e;
        }
    }
    .body{
        width:100%;
        height:160px;
        overflow-x: hidden;
        overflow-y:auto;
        text-align:left;
        ul{
            height:100%;
        }
        li{
            position:relative;
            display:inline-block;
            vertical-align:middle;
            width:calc(25% - 10px);
            margin:0 10px 20px 0;
            color:#686877;
            font-size:12px;
            text-align:left;
            user-select:none;
            cursor:pointer;
            &:nth-child(4n){
                margin-right:0;
            }
            i{
                display:inline-block;
                vertical-align:middle;
                width:16px;
                height:16px;
                margin-right:7px;
                border-radius:4px;
                border:1px solid #d3d3dd;
                background:transparent;
            }
            &:hover{
                opacity:.8;
            }
            &.checked::before{
                content: "";
                position: absolute;
                left:3px;
                top:calc(50% - 2px);
                width: 9px;
                height: 7px;
                background:url(~@/assets/pc/images/doc/icon_2.4.0.png) no-repeat -73px -187px;
                transition: all 0.3s;
            }
            &.disabled{
                opacity:.5;
                cursor:default;
                pointer-events:none;
            }
        }
    }
    .footer{
        position:absolute;
        bottom:18px;
        width:calc(100% - 60px);
        height:40px;
        text-align:center;
        button{
            display:inline-block;
            vertical-align:top;
            height:40px;
            line-height:40px;
            text-align:center;
            font-size:14px;
            border-radius:5px;
            &:hover{
                opacity:.7;
            }
        }
        .cancel{
            width:60px;
            margin-right:13px;
            background:#e9edf4;
            color:#707b8e;
        }
        .save{
            width:110px;
            background:var(--mainColor);
            color:#fff;
        }
    }
    // 转让
    .transfer{
        width:620px;
        height:460px;
        margin: -310px auto 0;
        padding: 33px 46px;
        .header{
            border:none;
            h1{
                margin-bottom:10px;
            }
            p{
                color:#8c9299;
                text-align:center;
            }
        }
        .body{
            li{
                width:calc(20% - 10px);
            }
        }
        .footer{
            .cancel{
                width:110px;
                background:#0d7bf8;
                color:#fff;
            }
            .save{
                width:110px;
                margin-right:15px;
                background:#fe9e9e;
                color:#fff;
                &.disabled{
                    background:#d2dbe6;
                    cursor:default;
                    pointer-events:none;
                    &:hover{
                        opacity:1;
                    }
                }
            }
        }
    }
    // 权限设置
    .power{
        width:500px;
        height:440px;
        margin: -250px auto 0;
        padding: 24px 32px;
    }
}
// 团队文件夹新建弹框
.create_team_folder_modal{
    position:fixed;
    top:0;
    left:0;
    z-index:999;
    width:100%;
    height:100%;
    background:rgba(0,0,0,0.5);
    text-align:center;
    user-select:none;
    .create_folder_contain{
        position:relative;
        top:50%;
        width:500px;
        height:540px;
        margin:-250px auto 0;
        background:#fff;
        border-radius:4px;
    }
    .header{
        width:100%;
        height:75px;
        line-height:75px;
        text-align:center;
        p{
            color:#0d1c2e;
            font-size:20px;
            font-weight:bold;
        }
    }
    .body{
        text-align:left;
    }
    .folder_name{
        position:relative;
        width:100%;
        margin:0 auto 26px;
        padding:0 40px;
        border-radius:2px;
        font-size:0;
        p{
            color:#838f9f;
            font-size:12px;
        }
        input{
            display:inline-block;
            width:100%;
            height:40px;
            line-height:40px;
            margin-top:6px;
            padding-left:10px;
            font-size:14px;
            color:#353942;
            border: solid 1px rgba(172, 172, 186, 0.44);
            border-radius:2px;
            &:focus,&:hover{
                border-color:var(--mainColor);
            }
            &::-webkit-input-placeholder{
                color:#a7adb5;
            }
            &:-moz-placeholder{
                color:#a7adb5;
            }
            &::-moz-placeholder{
                color:#a7adb5;
            }
            &:-ms-input-placeholder{
                color:#a7adb5;
            }
        }
        .clear_input{
            position:absolute;
            top:54%;
            right:52px;
            width:18px;
            height:18px;
            background:@new_icon -1px -131px;
            cursor:pointer;
            &:hover{
                opacity:.7;
            }
        }
        .wrong{
            border-color:#fb5959;
        }
    }
    .folder_member_result{
        position:relative;
        width:100%;
        height:252px;
        overflow-y:auto;
        &::-webkit-scrollbar-track{
            background-color:#ffffff;
        }
        &::-webkit-scrollbar-thumb{
            background-color:#e4e4e4;
        }
        p:first-child{
            width:calc(100% - 80px);
            height:26px;
            line-height:26px;
            margin:0 auto 20px;
            font-size:12px;
            font-weight:bold;
            color:#4a5059;
        }
        p.right{
            position: absolute;
            right: 30px;
            top: 0;
            text-align: right;
            width: auto;
        }
        .add_member{
            position:absolute;
            right:40px;
            top:0;
            width:70px;
            height:26px;
            line-height:24px;
            border-radius:13px;
            border:1px solid #c5d0dc;
            text-align:center;
            font-size:12px;
            color:#838f9f;
            &:hover{
                border-color:var(--mainColor);
                color:var(--mainColor);
            }
        }
        .partner_item{
            padding:0 40px;
            cursor:pointer;
            a{
                position:absolute;
                right: 30px;
                top: calc(50% - 9px);
                width:18px;
                height:18px;
                border-radius:4px;
                border:1px solid #c3d6ee;
                text-align:center;
                line-height:18px;
            }
            &.check a{
                background:var(--mainColor);
                &::after{
                    content: "";
                    position: absolute;
                    left: 5px;
                    top: 3px;
                    width: 4px;
                    height: 7px;
                    border: 2px solid #fff;
                    border-left: transparent;
                    border-top: transparent;
                    border-radius:2px;
                    transform: rotate(45deg);
                    transition: all 0.3s;
                }
            }
        }
        .add_partner_btn{
            right:40px;
        }
        .partner_invitation{
            position: absolute;
            top: 0;
            right:52px;
            display: inline-block;
            height:40px;
            line-height: 40px;
            font-size: 12px;
            color: #838f9f;
            .open::after{
                content: "";
                position: absolute;
                top: 18px;
                right: -14px;
                width: 0;
                height: 0;
                border-left: 5px solid transparent;
                border-right: 5px solid transparent;
                border-bottom: 5px solid #acb7c5;
                transform: rotate(180deg);
                transition: all 0.3s;
            }	
            ul{
                position:absolute;
                top:35px;
                right:-14px;
                width:70px;
                height:40px;
                z-index:10;
                background:#fff;
                padding-left:16px;
                box-shadow: 0 4px 6px 0px rgba(0, 0, 0, 0.07);
                border: solid 1px rgba(197, 208, 220, 0.4);
                border-radius: 4px;
            }
            li{
                height:40px;
                line-height:40px;
                text-align:left;
                user-select:none;
                &:last-child{
                    cursor:pointer;
                    &:hover{
                        color:#fb5959;
                    }
                }
            }
        }
        .disabled{
            cursor: default;
            opacity: 0.5;
            pointer-events: none;
            &:hover{
                opacity:1;
            }
        }
    }
    .create_folder_foot{
        display:block;
        position:absolute;
        bottom:21px;
        left:0;
        width:100%;
        height:40px;
        text-align:center;
        button:hover{
            opacity:.7;
        }
        .cancel_btn{
            width:60px;
            height:40px;
            line-height:40px;
            margin-right:13px;
            border-radius:5px;
            font-size:14px;
            color:#707b8e;
            background:#e9edf4;
        }
        .ok_btn{
            width:110px;
            height:100%;
            line-height:40px;
            border-radius:5px;
            font-size:14px;
            background:var(--mainColor);
            color:#ffffff;
            text-align:center;
            &.unable{
                background:#d2dbe6;
                cursor: default;
                &:hover{
                    opacity:1;
                }
            }
        }
    }
}
</style>