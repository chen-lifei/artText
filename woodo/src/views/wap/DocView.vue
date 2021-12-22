<template>
    <div class="doc_contain" ref="list_height" :style="{overflow:(no_scroll && show_doc_menu) ? 'hidden' : ''}">
        <div class="contain_wrapper" ref="doc_height">
            <!-- 头部 -->
            <div class="head_panel" :class="{show: doctype_box,white: current_folder_info.grade}">
                <div class="head_left">
                    <!-- 文档分类筛选面板 -->
                    <div class="doc_type_panel" v-if="!current_folder_info.grade">
                        <a class="user_head" href="/mobile/member/">
                            <img v-if="user.photo" :src="user.photo">
                        </a>
                        <!--当前文档类型-->
                        <p class="current_doc_type desktop" @click="show_doctype_box" :class="{open: doctype_box,current:current_list_type_obj.type !== 'myTeam'}">{{current_list_type_obj.type !== 'myTeam' ? current_list_type_obj.name : '所有文档'}}</p>
                        <p class="current_doc_type team" @click="change_doc_type(doc_type_arr[0])" :class="{current:current_list_type_obj.type === 'myTeam'}">{{doc_type_arr[0].name}}</p>
                        <!--文档类型下拉框-->
                        <transition name="modal_fade">
                            <ul class="type_box" v-if="doctype_box">
                                <li v-for='(item,index) in doc_type_arr'
                                    v-if='index !== 0'
                                    :key="item.name"
                                    @click="change_doc_type(item) && get_doc_list({info:item, fid:'', grad:0, pageNumber:1})"
                                    :class="{check:item.name === current_list_type_obj.name}"
                                >
                                    {{item.name}}
                                </li>
                            </ul>
                        </transition>
                        <!-- 绑定提示 -->
                        <div class="bind_tip" v-if="user.showBindTips">
                            <span>您的账号还未绑定手机和邮箱，存在安全风险</span>
                            <a href="/mobile/member/">绑定</a>
                        </div>
                    </div>
                    <!-- 文件夹面包屑 -->
                    <div class="current_folder_panel" v-if="current_folder_info.grade">
                        <p @click="back_pre_folder">{{current_folder_info.name}}</p>
                    </div>
                </div>
                <div class="head_right">
                    <!-- 我的桌面新建文件夹按钮 -->
                    <a class="create_folder_btn" v-if="current_list_type_obj.type === 'myDesktop'" @click="open_doc_menu('create_folder')"></a>
                    <!-- 我的团队新建文件夹按钮 -->
                    <a class="create_folder_btn" v-if="current_list_type_obj.type === 'myTeam' && team_info" @click="team_create_folder_toggle(true)"></a>
                    <!-- 团队设置按钮 -->
                    <a class="team_folder_btn" v-if="current_list_type_obj.type === 'myTeam' && team_info && current_folder_info.grade === 0" @click="open_team_setting"></a>
                    <!--清空回收站按钮-->
                    <a class="all_clean" v-if="current_list_type_obj.type === 'dustbin' && doc_list.length > 0" @click="open_doc_menu('all_clean')"></a>
                </div>
            </div>
            <!-- 团队名称模块 -->
            <div class="team_name_panel" v-if="team_info && current_list_type_obj.type === 'myTeam' && current_folder_info.grade == 0">
                <!-- 团队名称修改 -->
                <img src="../../assets/wap/images/doc/team_name_icon.png" alt="">
                <p @click="team_info.teamRoleType !== 'team_owner' || open_team_rename()">{{team_info.teamName}}</p>
            </div>
            <!-- 列表主体 -->
            <div class="doc_content">
                <div class="doc_list skeleton" ref="skeleton">
                    <!--进入文件夹前加载效果 -->
                    <div class="loading_tips" v-show="page_loading">
                        <div class="loading_progress">
                            <div class="center_logo">
                                <base-logo type="icon" theme="white"></base-logo>
                            </div>
                        </div>
                    </div>
                    <!--列表状态-->
                    <ul v-if="doc_list.length !== 0 || welcome_document !== null">
                        <!-- 文档卡片 -->
                        <li class="doc_card" v-for="(item,index) in doc_list" :key="item.id" :data-id="item.id">
                            <!-- 文档图标 -->
                            <div class="doc_type_icon">
                                <img v-if="item.grade" src="../../assets/wap/images/doc/folder.png" alt="">
                                <img v-else-if="item.documentType === 'design' || item.templateType === 'design'" src="../../assets/wap/images/doc/design_file.png" alt="">
                                <img v-else src="../../assets/wap/images/doc/slides_file.png" alt="">
                            </div>
                            <div class="doc_main" @click="item.grade ? enter_doc_grade(item) : enter_doc_show(item)">
                                <!-- 文档名 -->
                                <p class="doc_title">{{item.name}}</p>
                                <!-- 文档置顶图标 -->
                                <div class="doc_top" v-if="!item.grade && current_list_type_obj.type === 'myDesktop'" @click.stop="top_doc(item,index)">
                                    <img v-if="!item.topTime" src="../../assets/wap/images/doc/no_top_icon.png">
                                    <img v-else src="../../assets/wap/images/doc/top_icon.png">
                                </div>
                                <div class="doc_info">
                                    <template v-if="!item.grade">
                                        <!-- 权限图标 -->
                                        <img class="lock" v-if="item.visitType === 'privacy'" src="../../assets/wap/images/doc/lock_icon.png" alt="">
                                        <img class="public" v-else src="../../assets/wap/images/doc/public_icon.png" alt="">
                                        <!-- 拥有者 -->
                                        <span class="owner" v-if="current_list_type_obj.type !== 'dustbin'">由{{item.collaborateRoleType !== 'owner' ? (item.member ? item.member.nickName : item.memberNickName) : '我'}}创建</span>
                                    </template>
                                    <!-- 时间 -->
                                    <span class="time">{{item.time}}</span>
                                </div>
                                <!-- 操作按钮 -->
                                <!-- 批量 -->
                                <div class="doc_menu">
                                    <i class="choose_box" v-if="clean_all" :class="{choose_checked:item.checked}" @click.stop="get_checked_list(item,index)"></i>
                                    <i v-else-if="current_list_type_obj.type !== 'myRelease' && (current_list_type_obj.type !== 'myTeam' || !item.grade || ['team_owner','creator'].indexOf(item.type) >= 0)" @click.stop="open_doc_options_modal(item,index)"></i>

                                </div>
                            </div>
                        </li>
                        <!-- 欢迎文档 -->
                        <li class="doc_card" v-if="welcome_document !== null && current_list_type_obj.type === 'myDesktop'" :key="welcome_document.id" :data-id="welcome_document.id">
                            <div class="doc_type_icon">
                                <img src="../../assets/wap/images/doc/slides_file.png" alt="">
                            </div>
                            <div class="doc_main" @click="enter_doc_show(welcome_document)">
                                <p class="doc_title">{{welcome_document.name}}</p>
                                <div class="doc_info">
                                    <template>
                                        <img class="public" src="../../assets/wap/images/doc/public_icon.png" alt="">
                                        <span class="owner">由吾道创建</span>
                                    </template>
                                    <span class="time">{{welcome_document.time}}</span>
                                </div>
                                <div class="doc_menu">
                                    <i @click.stop="open_doc_options_modal(welcome_document,doc_list.length)"></i>
                                </div>
                            </div>
                        </li>
                    </ul>
                    <!-- 空状态 -->
                    <template v-if="show_empty && doc_list.length === 0 && welcome_document === null">
                        <!-- 无团队提示 -->
                        <div class="doc_empty team" v-if="current_list_type_obj.type === 'myTeam' && team_info === null">
                            <img src="../../assets/wap/images/doc/no_team.png" alt="">
                            <p>免费创建并邀请好友<br>加入您的团队，可以更方便的共享文档资料</p>
                            <button @click="team_create_modal_toggle(true)">创建我的团队</button>
                        </div>
                        <!-- 我的团队空状态 -->
                        <div class="doc_empty" v-else-if="team_info && doc_list.length ===0">
                            <img src="../../assets/common/images/empty_1.png" alt="">
                            <p>这里空空如也~</p>
                            <p v-if="current_list_type_obj.type === 'myTeam'" class="tip">创建或移动文档过来与团队分享</p>
                        </div>
                        <!-- 文档列表空状态 -->
                        <div class="doc_empty" v-else>
                            <img src="../../assets/common/images/empty_1.png" alt="">
                            <p>这里空空如也~</p>
                        </div>
                    </template>
                    <!-- 回收站批量操作底栏 -->
                    <div class="all_choose_ops" v-if="current_list_type_obj.type === 'dustbin' && clean_all">
                        <span @click="doc_batch_operation('delete')">彻底删除</span>
                        <span @click="doc_batch_operation('recover')">恢复</span>
                    </div>
                </div>
            </div>
            <!-- 通用遮罩层 -->
            <transition name="modal_fade">
                <div class="common_doc_modal doc_masking" v-if="page_masking"  @click="close_all_menu"></div>
            </transition>
            <!-- 文档操作相关弹框 -->
            <transition name="modal_fade">
                <div class="common_doc_modal doc_menu_modal" v-if="show_doc_menu" @click="close_all_menu">
                    <div class="modal_contain menu_contain" @click.stop>
                        <!-- 删除文档 -->
                        <div class="delete_doc" v-if="doc_menu_type === 'hidden' && delete_doc_obj.type === 'confirm'">
                            <h1>删除{{current_doc_info.grade ? '文件夹':'文档'}}</h1>
                            <span v-if="delete_doc_obj.content">{{delete_doc_obj.content}}</span>
                            <span v-else>确认删除该{{current_doc_info.grade ? '文件夹':'文档'}}吗？</span>
                            <div class="modal_btn">
                                <button class="confirm blue" @click="delete_confirm">确认</button>
                                <button class="cancel gray" @click="close_all_menu">取消</button>
                            </div>
                        </div>
                        <!-- 删除文档 -->
                        <div class="delete_doc" v-if="doc_menu_type === 'hidden' && delete_doc_obj.type === 'tip'">
                            <h1>删除提示</h1>
                            <span>{{delete_doc_obj.content}}</span>
                            <div class="modal_btn">
                                <button class="cancel coloured" @click="close_all_menu">知道了</button>
                            </div>
                        </div>
                        <!-- 新建文件夹弹框 -->
                        <div class="create_folder" v-if="doc_menu_type==='create_folder'">
                            <h1>新建文件夹</h1>
                            <input maxlength="40" type="text" ref="new_folder_name" placeholder="请输入文件夹名称">
                            <div class="modal_btn">
                                <button class="cancel gray" @click="close_all_menu">取消</button>
                                <button class="confirm blue" @click="created_folder_doc">确认</button>
                            </div>
                        </div>
                        <!-- 退出协作 -->
                        <div class="delete_doc" v-if="doc_menu_type === 'quit'">
                            <h1>退出协作</h1>
                            <span>退出后将不可再继续进入此文档</span>
                            <div class="modal_btn">
                                <button class="confirm blue" @click="quit_cooperation">确认</button>
                                <button class="cancel gray" @click="close_all_menu">取消</button>
                            </div>
                        </div>
                    </div>
                </div>
            </transition>
            <!-- 重命名弹框 -->
            <rename ref="rename" @set_success="rename_upgrade"></rename>
            <!-- 移动弹框 -->
            <div class="move_doc_modal" v-if="show_move_modal">
                <div class="modal_contain_wrapper">
                    <div class="head">
                        <h1>移动至</h1>
                        <!-- <a>新建文件夹</a> -->
                    </div>
                    <div class="body">
                        <!-- 我的文档 -->
						<div class="folder_list_contain" v-if="move_folder_list.length > 0">
							<p class="folder_item desktop"
                                @click="check_move_folder(move_folder_list[0],0,'myDesktop')" 
                                :class="{check:move_folder_list[0] === target_folder_info,open:move_folder_list[0].open && move_folder_list.length > 1}"
							>我的文档</p>
                            <p v-for='(item,index) in move_folder_list' class="folder_item"
                                v-if="item.show && index > 0"
                                :key="index"
                                @click="check_move_folder(item,index,'myDesktop')"
                                :class="{check:item === target_folder_info,open:item.open,nochild:item.nochild}"
                                :style="{marginLeft: item.grade > 1 ? item.grade + 2 + 'rem' : '2rem'}">
                                {{item.name}}
                            </p>
						</div>
						<!-- 我的团队 -->
						<div class="folder_list_contain" v-if="move_team_folder_list.length > 0">
							<p class="folder_item team" 
								@click="check_move_folder(move_team_folder_list[0],0,'myTeam')" 
								:class="{check:move_team_folder_list[0] === target_folder_info,open:move_team_folder_list[0].open && move_team_folder_list.length > 1}"
							>我的团队</p>
                            <p v-for='(item,index) in move_team_folder_list' class="folder_item" 
                                v-if="item.show && index > 0" 
                                :key="index"
                                @click="check_move_folder(item,index,'myTeam')" 
                                :class="{check:item === target_folder_info,open:item.open,nochild:item.nochild}"
                                :style="{marginLeft: item.grade > 1 ? item.grade + 2 + 'rem' : '2rem'}">
                                {{item.name}}
                            </p>
						</div>
						<!-- 空状态 -->
						<div class="no_folder" v-if="move_folder_list.length === 0 && move_team_folder_list.length === 0">
							<p>你还没有子文件夹噢~</p>
						</div>
                    </div>
                    <div class="foot">
                        <button class="cancel" @click="move_doc_modal_toggle(false)">取消</button>
                        <button class="sure" v-if="move_folder_list.filter(item => item.check).length > 0 || current_list_type_obj.type === 'myTeam'" @click="move_cur_folder">确认移动</button>
						<button class="sure" v-else @click="team_move_authority_toggle">下一步</button>
                    </div>
                </div>
            </div>
            <!-- 团队 - 创建/邀请成员弹框 -->
            <div class="create_team_modal" v-if="team_create_modal_show" :class="{invite:team_info}">
                <div class="modal_contain_wrapper">
                    <div class="head">
                        <input type="text" placeholder="请输入团队名称" ref="create_team_name" @focus="team_name_focus" @input="team_name_check($event.target.value)">
                        <h1 v-if="team_info">邀请成员</h1>
                    </div>
                    <div class="body">
						<div class="search_member">
							<p>邀请团队成员</p>
							<input type="text" placeholder="请输入手机号/邮箱/用户ID邀请成员"
								ref="search_member_input"
								@input="team_search_member($event)"
							>
						</div>
                        <div class="member_list_contain">
                            <!-- 搜索结果 -->
                            <div class="search_member_result" :class="{noborder:team_member_invitation.added_member.length == 0}" v-if="team_member_invitation.search_result.length > 0 && team_member_invitation.search_keyword !== ''">
                                <div class="partner_item"
                                        v-for="(member,index) in team_member_invitation.search_result"
                                        :class={checked:member.open}
                                        :key='index'
                                        @click.stop
                                >
                                    <img class="partner_head" v-if="member.invitee || member.head === '' || !member.head" src="../../../public/images/common/default_head.png" alt="">
                                    <img class="partner_head" v-else :src="member.head" alt="">
                                    <span class="partner_name" v-if="member.invitee">{{member.invitee}}</span>
                                    <span class="partner_name" v-else-if="member.nickName === '' || !member.nickName">{{member.memberId}}</span>
                                    <span class="partner_name" v-else>{{member.nickName}}</span>
                                    <span class="invitee_partner" v-if="member.invitee">外部</span>
                                    <div class="partner_invitation disabled" v-if="member.isTeamMember"><a>已加入</a></div>
                                    <div class="partner_invitation disabled" v-else-if="member.isInvited || member.added"><a>待接收邀请</a></div>
                                    <a class="add_partner_btn" v-else @click="team_add_interim_member(member)">邀请</a>
                                </div>
                            </div>
                            <!-- 已邀请 -->
                            <div class="added_member" v-if="team_member_invitation.added_member.length > 0">
                                <div class="partner_item"
                                        v-for="(member,index) in team_member_invitation.added_member"
                                        :class={checked:member.open}
                                        :key='index'
                                        @click.stop
                                >
                                    <img class="partner_head" v-if="member.invitee || member.head === '' || !member.head" src="../../../public/images/common/default_head.png" alt="">
                                    <img class="partner_head" v-else :src="member.head" alt="">
                                    <span class="partner_name" v-if="member.invitee">{{member.invitee}}</span>
                                    <span class="partner_name" v-else-if="member.nickName === '' || !member.nickName">{{member.memberId}}</span>
                                    <span class="partner_name" v-else>{{member.nickName}}</span>
                                    <span class="invitee_partner" v-if="member.invitee">外部</span>
                                    <div class="partner_invitation" @click="team_member_invitation_toggle(index)" :class="{open:team_member_delete_show && member.open}">
                                        <a>待接收邀请</a>
                                        <transition name="modal-fade">
                                            <ul v-if="team_member_delete_show && member.open">
                                                <li @click.stop="team_member_delete(index)">移除</li>
                                            </ul>
                                        </transition>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="foot">
                        <a class="invite_wechat" id="to_wechat" v-if="team_info">邀请微信成员</a>
                        <button class="cancel" @click="team_create_modal_toggle(false)">取消</button>
                        <button class="sure" v-if="!team_info" :class="{disabled:team_member_invitation.added_member.length < 0 || team_name == ''}" @click="team_create">创建</button>
                        <button class="sure" v-else :class="{disabled:team_member_invitation.added_member.length <= 0}" @click="team_invite">保存</button>
                    </div>
                </div>
            </div>
            <!-- 团队成员通用弹框（文件夹成员设置 || 新建文件夹 || 转让团队) -->
            <transition name="modal_fade">
                <div class="common_doc_modal team_member_select_modal" v-if="team_member_select_show" :class="team_member_select_type">
                    <div class="modal_contain">
                        <div class="head">
                            <h1 v-if="team_member_select_type === 'had'">成员设置</h1>
                            <h1 v-if="team_member_select_type === 'transfer'">转让团队</h1>
                            <p v-if="team_member_select_type === 'transfer'">请选择转让对象</p>
                            <template v-if="team_member_select_type === 'new_folder'">
                                <h1>新建文件夹</h1>
                                <input type="text" placeholder="请填写文件夹名称"
                                    ref="create_folder_name"
                                    v-model="team_folder_name"
                                    @input="team_folder_name_check($event)"
                                >
                            </template>
                        </div>
                        <div class="body">
                            <p v-if="team_member_select_type === 'new_folder'">成员（共{{team_member_select_list.filter(item => item.check).length}}人）</p>
                            <p v-if="team_member_select_type === 'had'">参与者人数（{{team_member_select_list.filter(item => item.check).length}}/{{team_member_select_list.length}}人）</p>
                            <p class="right" v-if="team_member_select_type === 'new_folder'">
								<a @click="team_member_select_toggle('all')">全选 | </a>
								<a @click="team_member_select_toggle('cancel')">取消全选</a>
							</p>
                            <div class="member_list_contain">
                                <div class="member_item"
                                    v-for="(item,index) in team_member_select_list"
                                    @click="team_check_select_member(index)"
                                    :key='index'
                                    :class="{check:item.check,disabled:(['team_owner','creator'].indexOf(item.memberRoleType) >= 0 || item.is_mine)}"
                                >
                                    <img class="member_head" :src="item.memberHead === '' || !item.memberHead ? '../../../public/images/common/default_head.png' : item.memberHead" alt="">
                                    <span class="member_name">{{item.memberNickName}}</span>
                                    <a class="member_check"></a>
                                </div>
                            </div>
                        </div>
                        <div class="foot">
							<button class="cancel" @click="team_member_select_close">取消</button>
                            <button class="sure" @click="team_member_select_save">确定</button>
                        </div>
                    </div>
                </div>
            </transition>
            <!-- 团队设置页面弹框 -->
            <team_setting ref="team_setting" :team_info="team_info" :team_all_member_list="team_all_member_list"></team_setting>
            <to_top ref="to_top"></to_top>
        </div>
        <!-- 分享弹框 -->
        <share_common_modal ref="share_common_modal"></share_common_modal>
        <!-- 权限弹框 -->
        <wap_set_authority ref="wap_set_authority"></wap_set_authority>
        <!-- 下载弹框 -->
        <export_modal ref="export_modal" :doc_name="current_doc_info.name"></export_modal>
        <!-- 客服 -->
        <service ref="service"></service>
        <!-- 通用底部 -->
        <bottom_bar></bottom_bar>
        <!-- 文档底部操作框 -->
        <ActionSheet ref="ActionSheet"
            :value="operate_list"
            :sheetClass="'action-sheet'"
            :showCancel="false"
        >
            <template slot="footer">
                <div class='share_item' v-if="['myDesktop','myCollect','myTeam'].indexOf(current_list_type_obj.type) > -1 && !current_doc_info.grade && !current_doc_info.is_welcome_document">
                    <div v-if="is_weixin" @click="toggle_share_tips">
                        <button class="share_button">
                            <img src="../../assets/wap/images/authority/share_icon-1.png" alt=""/>
                        </button>
                        <span>分享给好友</span>
                    </div>
                    <div  @click="create_doc_poster">
                        <button class="share_button">
                            <img src="../../assets/wap/images/authority/share_icon-2.png" alt=""/>
                        </button>
                        <span>分享到朋友圈</span>
                    </div>
                    <div @click="open_email_modal" v-show="current_list_type_obj.type !== 'myCollect'">
                        <button class="share_button">
                            <img src="../../assets/wap/images/authority/share_icon-5.png" alt=""/>
                        </button>
                        <span>发送到邮箱</span>
                    </div>
                </div>
            </template>
        </ActionSheet>
    </div>
</template>

<style lang="less" scoped>
    @import url("../../assets/wap/css/common.css");
    @deep: ~'>>>';
    .doc_contain{
        position:fixed;
        top:0;
        left:0;
        height:100%;
        width:100%;
        overflow-y:auto;
    }
    .contain_wrapper{
        position:relative;
        min-height:100vh;
        padding-bottom:2.5rem ;
    }
    // 头部
    .head_panel{
        position:relative;
        width:100%;
        height:2.82rem;
        line-height:2.82rem;
        padding:0 .85rem;
        background:var(--mainColor);
        color:#fff;
        &.white{
            background:#fff;
            border-bottom:1px solid #f1f1f1;
            .create_folder_btn{
                background-image:url("../../assets/wap/images/doc/create_folder_dark.png");
            }
            .team_folder_btn{
                background-image:url("../../assets/wap/images/doc/setting_dark.png");
            }
        }
        .head_left{
            display:inline-block;
            vertical-align:top;
            width:80%;
            height:100%;
            overflow:hidden;
        }
        .head_right{
            position:absolute;
            right:0.85rem;
            top:0;
            height:100%;
            text-align:right;
        }
        .doc_type_panel{
            width:100%;
            height:100%;
        }
        // 用户头像
        .user_head{
            display:inline-block;
            vertical-align:middle;
            width: 1.27rem;
            height: 1.27rem;
            line-height:1.27rem;
            margin-right:0.37rem;
            border-radius:50%;
            overflow:hidden;
            img{
                width:100%;
                height:100%;
            }
        }
        .current_doc_type{
            display:inline-block;
            vertical-align:middle;
            height:100%;
            line-height:3rem;
            font-size:0.77rem;
            opacity:.5;
            &.current{
                opacity:1;
            }
            &.open::after{
                transform:rotate(180deg);
                margin-bottom: 0.4rem !important;
            }
            &.desktop::after{
                content: "";
                display: inline-block;
                vertical-align: middle;
                width: 0;
                height: 0;
                margin: 0 0 -0.15rem 0.3rem;
                border-width: 0.25rem;
                border-style: solid;
                border-color: #fff transparent transparent;
                transition:all 0.3s;
            }
            &.team{
                margin-left:1.08rem;
            }
        }
        .type_box{
            position:absolute;
            top:2.5rem;
            left:.85rem;
            width: 6.83rem;
            height: 10.6rem;
            z-index:10; 
            background-color: #ffffff;
            box-shadow: 0rem 0.05rem 0.25rem 0rem rgba(112, 123, 142, 0.26);
            border-radius: 0.5rem;
            li{
                position:relative;
                width:100%;
                height:1.5rem;
                line-height:1.5rem;
                padding-left:2.13rem;
                text-align:left;
                font-size:0.6rem;
                color:#5f6979; 
                &:first-child{
                    height:2.03rem;
                    line-height:2.1rem;
                    border-bottom:1px solid #e8e9ea;
                    margin-bottom:0.27rem;
                }
                &:last-child{
                    height:2.03rem;
                    line-height:2.1rem;
                    border-top:1px solid #e8e9ea;
                    margin-top:0.27rem;
                }
                &:first-child.check::before,&:last-child.check::before{
                    top:0.65rem;
                }
                &.check{
                    font-weight:bold;
                    color:#22252c;
                    &::before{
                        content:"";
                        position:absolute;
                        left:0.8rem;
                        top:0.5rem;
                        width:0.7rem;
                        height:0.55rem;
                        background:url(../../assets/wap/images/doc/black_check.png) center no-repeat;
                        background-size:contain;
                    }
                }
            }
        }
        // 面包屑
        .current_folder_panel{
            p{
                position: relative;
                padding-left:1rem;
                color:#202329;
                font-size:0.8rem;
                &::before{
                    content: "";
                    position: absolute;
                    left:0.2rem;
                    top:1.2rem;
                    width: .4rem;
                    height: .4rem;
                    border: 2px solid #343941;
                    border-left: transparent;
                    border-top: transparent;
                    transform: rotate(135deg);
                    transition: transform .3s;
                }
            }
        }
        .create_folder_btn{
            display:inline-block;
            vertical-align:middle;
            width:1.02rem;
            height:0.88rem;
            background:url("../../assets/wap/images/doc/create_folder.png") center no-repeat;
            background-size:contain;
        }
        .team_folder_btn{
            display:inline-block;
            vertical-align:middle;
            width:1rem;
            height:1rem;
            margin-left:1rem;
            background:url("../../assets/wap/images/doc/setting.png") center no-repeat;
            background-size:contain;
        }
        .all_clean{
            display:inline-block;
            vertical-align:middle;
            width:0.9rem;
            height:0.97rem;
            background:url("../../assets/wap/images/doc/dustbin.png") center no-repeat;
            background-size:contain;
        }
    }
    // 团队名称模块
    .team_name_panel{
        height:2.7rem;
        line-height:2.7rem;
        padding:0 .83rem;
        border-bottom:1px solid #f1f1f1;
        img{
            display:inline-block;
            vertical-align:middle;
            width:1.15rem;
            height:1.15rem;
            margin-right:0.78rem;
        }
        p{
            display:inline-block;
            vertical-align:middle;
            font-size:0.8rem;
            color:#656574;
        }
    }
    // 文档列表
    .doc_content{
        padding:0 0.85rem;
        .loading_tips{
            position: fixed;
            top: 0;
            right: 0;
            bottom: 0;
            left: 0;
            z-index: 25;
            background-color: #f8f8f8;
            text-align: center;
            // 进入文件夹时加载动画
            .loading_progress {
                position: absolute;
                top: 50%;
                left: 50%;
                width: 3.4rem;
                margin: -4rem 0 0 -1.7rem;
                .center_logo {
                    position: relative;
                    width: 3.4rem;
                    height: 3.4rem;
                    padding: 0.1rem;
                    margin-bottom: 0.3rem;
                    border: 0.1rem solid #ffffff;
                    border-radius: 50%;
                    overflow: hidden;
                    background-image: linear-gradient(180deg, #5ca5ff 0%, #1b7cf3 100%), linear-gradient(#1b7cf3, #1b7cf3);
                    background-blend-mode: normal, normal;
                    img {
                        position: absolute;
                        top: 0;
                        right: 0;
                        bottom: 0;
                        left: 0;
                        width: 2rem;
                        height: 2rem;
                        margin: auto;
                    }
                }
            }
        }
        .doc_card{
            position:relative;
            width:100%;
            padding:0.75rem 0 0;
            border-bottom: 1px solid #f1f1f1;
            .doc_type_icon{
                display:inline-block;
                vertical-align:top;
                width:1.5rem;
                height:1.1rem;
                margin:0.1rem 0.6rem 0 0;
                img{
                    width:100%;
                    height:100%;
                }
            }
            .doc_main{
                display:inline-block;
                vertical-align:top;
                width:calc(100% - 2.1rem);
                padding-bottom:0.58rem;
                p{
                    display:block;
                    max-width:85%;
                    margin-bottom:0.1rem;
                    overflow:hidden;
                    text-overflow:ellipsis;
                    white-space:nowrap;
                    color:#4a4a52;
                    font-size:0.7rem;
                }
                span{
                    margin-right:0.4rem;
                    font-size:0.5rem;
                    color:#b0b0c0;
                }
                img{
                    margin:0 0.275rem -1px 0;
                    &.public{
                        width:0.63rem;
                        height:0.47rem;
                    }
                    &.lock{
                        width:0.47em;
                        height:0.55rem;
                    }
                }
                .doc_top{
                    position:absolute;
                    right: 1.8rem;
                    top: 0.75rem;
                    width:0.8rem;
                    height:0.8rem;
                    img{
                        width:100%;
                        height:100%;
                        margin:0;
                    }
                }
                .doc_menu{
                    position: absolute;
                    right: 0;
                    top: 0;
                    width: 1.5rem;
                    height: 100%;
                    text-align: right;
                    i{
                        display: inline-block;
                        width:0.83rem;
                        height:0.58rem;
                        margin-top: 0.8rem;
                        background:url(../../assets/wap/images/doc/doc_options.png) center no-repeat;
                        background-size:contain;
                        &.choose_box{
                            height:0.95rem;
                            background:none;
                            border:1px solid #cecece;
                            border-radius:0.1rem;
                        }
                        &.choose_checked{
                            height:0.95rem;
                            background:url(../../assets/wap/images/doc/choose_check.png) center no-repeat;
                            background-size:cover;
                        }

                    }
                }
            }
            &.hide{
                opacity:0;
                padding:0;
                height:0 !important;
                transition:height 0.3s;
            }
        }
        .doc_empty{
            margin-top:40%;
            text-align:center;
            img{
                width: 9.75rem;
                height: 8rem;
            }
            p{
                display:block;
                height:1.3rem;
                line-height:1.3rem;
                font-size:0.75rem;
                font-weight:bold;
            }
            p.tip{
                font-weight:normal;
                font-size:0.6rem;
                color:#a5a4a4;
            }
            &.team{
                img{
                    width: 11rem;
                    height: 7rem;
                }
                p{
                    width:80%;
                    margin:0 auto;
                    line-height:1rem;
                    font-size:0.67rem;
                    font-weight:normal;
                    color:#656574;
                }
                button{
                    display:block;
                    width: 12.5rem;
                    height: 2.6rem;
                    line-height:2.6rem;
                    margin:2.05rem auto 0;
                    background-color: var(--mainColor);
                    box-shadow: 0rem 0.25rem 0.13rem 0rem rgba(60, 62, 69, 0.1);
                    border-radius: 0.13rem;
                    color:#fff;
                    font-size:0.8rem;
                    text-align:center;
                }
            }
        }
        .dustbin_bar{
            position: relative;
            display: block;
            width:calc(100% + 1.725rem);
            left: -0.85rem;
            height: 3.4rem;
            &+li.doc_card{
                padding-top:0 !important;
            }
            &:before{
                content:'';
                display:block;
                position:absolute;
                left:0;
                right:0;
                top:0;
                bottom:0;
                background:url(../../assets/wap/images/doc/top_bg.png) no-repeat;
                background-size:contain;
            }
            span{
                position:relative;
                display:inline-block;
                width:50%;
                height:3.4rem;
                text-align:center;
                color:#797979;
                font-size:0.8rem;
                line-height:2.6rem;
                &:nth-child(1){
                    color:#333333;
                }
            }
        }
        .all_choose_ops{
            position:fixed;
            left:0;
            right:0;
            bottom:2.33rem;
            font-size:0.8rem;
            height:3.3rem;
            z-index:12;
            background-color: #ffffff;
            box-shadow: 0rem -0.05rem 0.25rem 0rem rgba(112, 123, 142, 0.26);
            span{
                display:inline-block;
                height:100%;
                line-height:3.3rem;
                color:#fff;
                text-align:center;
                width:50%;
                &:nth-child(1){
                    background:#ff3131;
                    padding-right:0.4rem;
                    background-clip: content-box;
                }
                &:nth-child(2){
                    background:var(--mainColor);
                    padding-left:0.4rem;
                    background-clip:content-box;
                }
            }
        }
    }
    // 绑定提示
    .bind_tip{
        position:relative;
        width:100%;
        height:2.5rem;
        line-height:2.5rem;
        padding-left:0.775rem;
        background:#fcf8e3;
        font-size:0;
        text-align:left;
        span{
            color:#927748;
            font-size:0.65rem;
            &:before{
                content:"";
                display:inline-block;
                width:0.75rem;
                height:0.75rem;
                margin:0 0.275rem -2px 0;
                background:url(../../assets/wap/images/doc/bind_tip.png)top center no-repeat;
                background-size:contain;
            }
        }
        a{
            position:absolute;
            right:0.775rem;
            top:50%;
            display:inline-block;
            width:2.5rem;
            height:1.25rem;
            line-height:1.25rem;
            margin-top:-0.625rem;
            background-color:var(--mainColor);
            border-radius:0.613rem;
            text-align:center;
            color:#fff;
            font-size:0.65rem;
        }
    }
    .common_doc_modal{
        input:focus{box-shadow:none;}
    }
    // 操作相关弹框通用样式
    .doc_menu_modal{
        &:after{
            content:"";
            display:inline-block;
            vertical-align:middle;
            height:100%;
            width:0;
        }
        .menu_contain{
            position:relative;
            display:inline-block;
            vertical-align:middle;
            width:90%;
            height:auto;
            .modal_btn{
                position:absolute;
                bottom:0;
                left:0;
                width:100%;
                height:2.8rem;
                border-top:1px solid #e2e6ec;
                button{
                    width:50%;
                    height:100%;
                    line-height:2.73rem;
                    border-radius:0;
                    background:transparent;
                    text-align:center;
                    font-size:0.8rem;
                    &:first-child{
                        border-right:1px solid #e2e6ec;
                    }
                    &.gray{
                        color:#707b8e;
                    }
                    &.blue{
                        color:var(--mainColor);
                    }
                    &.coloured{
                        color: #707b8e;
                        border-right: none;
                    }
                }
            }
        }
    }
    // 移动弹框
    .move_doc_modal{
        position:fixed;
        top:0;
        left:0;
        width:100%;
        height:100vh;
        z-index:11;
        text-align:center;
        background:#fff;
        .modal_contain_wrapper{
            width:100%;
            height:100%;
            margin:0 auto;
        }
        .head{
            position:relative;
            width:100%;
            height:2.37rem;
            line-height:2.37rem;
            border-bottom:1px solid #e2e6ed;
            h1{
                color:#202329;
                font-size:0.8rem;
                font-weight:bold;
            }
            a{
                position:absolute;
                right:0.85rem;
                top:0;
            }
        }
        .body{
            width:100%;
            text-align:left;
            .folder_list_contain{
                padding:0.05rem 0.85rem 1.05rem;
                &:first-child{
                    border-bottom:0.4rem solid #e9ecf3;
                }
            }
            .folder_item{
                position:relative;
                height:2.9rem;
                padding:1.18rem 0 0.58rem;
                margin-left:2.12rem;
                border-bottom:1px solid #f1f1f1;
                &::before{
                    content:"";
                    position:absolute;
                    top:1rem;
                    left:-2rem;
                    width:1.5rem;
                    height:1.13rem;
                    background:url(../../assets/wap/images/doc/folder.png) no-repeat center/contain;
                }
                &.desktop::before{
                    background-image:url(../../assets/wap/images/doc/desktop_folder.png);
                }
                &.team::before{
                    background-image:url(../../assets/wap/images/doc/team_folder.png);
                }
                &.check::after{
                    content:"";
                    position:absolute;
                    right:0;
                    top:1.3rem;
                    width:0.9rem;
                    height:0.68rem;
                    background:url(../../assets/wap/images/doc/blue_check.png) no-repeat center/contain;
                }
            }
        }
        .foot{
            position:absolute;
            bottom:0;
            left:0;
            width:100%;
            height:2.67rem;
            border-top:1px solid rgba(197, 205, 217, 0.3);
            button{
                width:50%;
                height:100%;
                line-height:2.67rem;
                border-radius:0;
                text-align:center;
                font-size:0.73rem;
                &.cancel{
                    background:#fff;
                    color:#707b8e;
                }
                &.sure{
                    background:var(--mainColor);
                    color:#fff;
                }
                &.disabled{
                    background:#e6eaf1;
                    color:#fff;
                }
            }
        }
    }
    // 删除弹框
    .delete_doc{
        display:flex;
        justify-content:center;
        flex-direction:column;
        width:100%;
        padding-bottom:2.8rem;
        align-items:center;
        text-align:center;
        color:#2d2d2d;
        h1{
            font-size: 0.7rem;
            font-weight:400;
            padding-top:1rem
        }
        span{
            line-height: 5;
            font-size:0.6rem;
        }
    }
    // 新建文件夹弹框
    .create_folder{
        width:100%;
        height:100%;
        padding:1.22rem 1.15rem 5.8rem;
        h1{
            margin-bottom:2.48rem;
            font-size: 0.8rem;
            color: #4b525f;
        }
        input{
            display:block;
            width: 100%;
            height: 2.33rem;
            line-height: 2.33rem;
            padding-left:0.77rem;
            background-color: #f0f3f8;
            border-radius: 0.13rem;
            color:#707b8e;
            font-size:0.6rem;
            &::-webkit-input-placeholder{
                color:#aab5ca;
            }
            &:-moz-placeholder{
                color:#aab5ca;
            }
            &::-moz-placeholder{
                color:#aab5ca;
            }
            &:-ms-input-placeholder{
                color:#aab5ca;
            }
        }
    }
    // 创建团队弹框
    .create_team_modal{
        position:fixed;
        top:0;
        left:0;
        width:100%;
        height:100vh;
        z-index:12;
        text-align:center;
        background:#fff url(../../assets/wap/images/doc/create_team_bg.png) top no-repeat;
        background-size:contain;
        .modal_contain_wrapper{
            width:90%;
            height:100%;
            margin:0 auto;
        }
        .head{
            input{
                width: 100%;
                height: 2.33rem;
                line-height:2.33rem;
                margin-top:2.68rem;
                padding:0 0.5rem;
                background-color: #ffffff;
                border-radius: 0.13rem;
                text-align:center;
                color:#101113;
                font-size:0.6rem;
                &::-webkit-input-placeholder{
                    color:#a0adbc;
                }
                &:-moz-placeholder{
                    color:#a0adbc;
                }
                &::-moz-placeholder{
                    color:#a0adbc;
                }
                &:-ms-input-placeholder{
                    color:#a0adbc;
                }
            }
        }
        .body{
            margin-top:8rem;
            text-align:left;
            p{
                color:#232529;
                font-size:0.6rem;
                font-weight:bold;
            }
            input{
                width: 100%;
                height: 2.33rem;
                line-height:2.33rem;
                margin-top:0.37rem;
                padding:0 0.5rem;
                background-color: #ffffff;
                border-radius: 0.13rem;
                border:1px solid rgba(144, 155, 173, 0.15);
                color:#3c4147;
                font-size:0.6rem;
                &::-webkit-input-placeholder{
                    color:#aab5ca ;
                }
                &:-moz-placeholder{
                    color:#aab5ca ;
                }
                &::-moz-placeholder{
                    color:#aab5ca ;
                }
                &:-ms-input-placeholder{
                    color:#aab5ca ;
                }
            }
            .member_list_contain{
                margin-top:1.1rem;
            }
            .partner_item{
                position:relative;
                height:1.5rem;
                line-height:1.5rem;
                .partner_head{
                    display:inline-block;
                    vertical-align:middle;
                    width: 1.5rem;
                    height: 1.5rem;
                    border-radius:50%;
                    margin-right:0.33rem;
                    overflow:hidden;
                }
                .partner_name{
                    display:inline-block;
                    vertical-align:middle;
                    max-width:70%; 
                    overflow:hidden;
                    text-overflow:ellipsis;
                    white-space:nowrap; 
                    font-size:0.67rem;
                    color:#21252b; 
                }
                .invitee_partner{}
                .partner_invitation{
                    position: absolute;
                    right:0;
                    top:0;
                    color:#707b8e;
                    font-size:0.6rem;
                    &:after{
                        content: "";
                        display: inline-block;
                        vertical-align: middle;
                        width: 0;
                        height: 0;
                        margin: 0 0 0 0.3rem;
                        border-width: 0.2rem;
                        border-style: solid;
                        border-color: #b7c0d0 transparent transparent;
                        transition:transform 0.3s;
                    }
                    &.disabled{
                        opacity:0.5;
                        pointer-events:none;
                        &::after{
                            display:none;
                        }
                    }
                    &.open::after{
                        transform:rotate(180deg);
                        margin-bottom:0.4rem;
                    }
                    ul{
                        position: absolute;
                        right: 0;
                        width: 3rem;
                        height: 2.5rem;
                        line-height: 2.5rem;
                        border: 1px solid #f2f9fe;
                        border-radius: 0.1rem;
                        box-shadow:0rem 0.04rem 0.1rem 0rem rgba(176, 177, 180, 0.16);
                        text-align: center;
                    }
                }
                .add_partner_btn{
                    position:absolute;
                    right:0;
                    top:0.1rem;
                    width: 2.25rem;
                    height: 1.3rem;
                    line-height:1.3rem;
                    background-color: var(--mainColor);
                    border-radius: 0.57rem;
                    text-align:center;
                    font-size:0.5rem;
                    color:#fff;
                }
            }
            .search_member_result{
                max-height:6rem;
                overflow: auto;
                padding-bottom:1.27rem;
                margin-bottom: 1.1rem;
                border-bottom:0.4rem solid #e9ecf3;
                &.noborder{
                    border:none;
                }
            }
        }
        .foot{
            position:absolute;
            bottom:0;
            left:0;
            width:100%;
            height:2.67rem;
            border-top:1px solid rgba(197, 205, 217, 0.3);
            .invite_wechat{
                position: absolute;
                bottom: 3.84rem;
                width: 100%;
                font-size: 0.6rem;
                color: #14b379;
                &::before{
                    content:"";
                    display:inline-block;
                    vertical-align:middle;
                    width:0.8rem;
                    height:0.67rem;
                    margin-right:0.22rem;
                    background:url(../../assets/wap/images/doc/wechat_invite.png) no-repeat center/contain;
                }
            }
            button{
                width:50%;
                height:100%;
                line-height:2.67rem;
                border-radius:0;
                text-align:center;
                font-size:0.73rem;
                &.cancel{
                    background:#fff;
                    color:#707b8e;
                }
                &.sure{
                    background:var(--mainColor);
                    color:#fff;
                }
                &.disabled{
                    background:#e6eaf1;
                    color:#fff;
                }
            }
        }
        &.invite{
            background:#fafafa;
            .head{
                position:absolute;
                top:0;
                left:0;
                width:100%;
                height:2.37rem;
                line-height:2.37rem;
                background:#fff;
                input{display:none;}
                h1{
                    color:#202329;
                    font-size:0.8rem;
                    font-weight:bold;
                }
            }
            .body{
                margin-top:3.28rem;
                p{display:none;}
            }
        }
    }
    // 团队成员设置弹框
    .team_member_select_modal{
        &:after{
            content:"";
            display:inline-block;
            vertical-align:middle;
            height:100%;
            width:0;
        }
        .modal_contain{
            position:relative;
            display:inline-block;
            vertical-align:middle;
            width:90%;
            height:auto;
            background:#fff;
            border-radius:0.5rem;
        }
        .head{
            margin:1.22rem 0 0.55rem;
            h1{
                width:100%;
                margin-bottom:0.47rem;
                font-size:0.8rem;
                font-weight:bold;
                color:#4b525f;
            }
            p{
                width:100%;
                text-align:center;
                font-size:0.6rem;
                color:#aab5ca;
            }
            input{
                display:block;
                width:calc(100% - 1.72rem);
                height: 2.33rem;
                line-height: 2.33rem;
                margin:0.8rem auto 0;
                padding-left:0.77rem;
                background-color: #f0f3f8;
                border-radius: 0.13rem;
                color:#707b8e;
                font-size:0.6rem;
                &::-webkit-input-placeholder{
                    color:#aab5ca;
                }
                &:-moz-placeholder{
                    color:#aab5ca;
                }
                &::-moz-placeholder{
                    color:#aab5ca;
                }
                &:-ms-input-placeholder{
                    color:#aab5ca;
                }
            }
        }
        .body{
            padding:0.63rem 0.86rem 4rem; 
            text-align:left;
            border-top:1px solid #e2e6ec;
            p{
                display:inline-block;
                height:1.77rem;
                line-height:1.77rem;
                color:#4b525f;
                font-size:0.6rem;
            }
            .member_item{
                position:relative;
                height:2.2rem;
                line-height:2.2rem;
                .member_head{
                    display:inline-block;
                    vertical-align:middle;
                    width: 1.5rem;
                    height: 1.5rem;
                    border-radius:50%;
                    margin-right:0.33rem;
                    overflow:hidden;
                }
                .member_name{
                    display:inline-block;
                    vertical-align:middle;
                    max-width:70%; 
                    overflow:hidden;
                    text-overflow:ellipsis;
                    white-space:nowrap; 
                    font-size:0.67rem;
                    color:#21252b; 
                }
                .member_check{
                    position:absolute;
                    right:0;
                    top:0.5rem;
                    width: 0.9rem;
                    height: 0.9rem;
                    line-height:0.9rem;
                    text-align:center;
                    background-color: #e9ecf1;
                    border-radius: 0.17rem;
                }
                &.check .member_check{
                    background-color:var(--mainColor);
                    &::after{
                        content:"";
                        display:inline-block;
                        vertical-align:middle;
                        width:0.48rem;
                        height:0.38rem;
                        margin:0 auto 0.1rem;
                        background:url(../../assets/wap/images/doc/white_check.png) center no-repeat;
                        background-size:contain;
                    }
                }
                &.disabled{
                    opacity:0.5;
                    pointer-events:none;
                }
            }
        }
        .foot{
            position:absolute;
            bottom:0;
            left:0;
            width:100%;
            height:2.73rem;
            border-top:1px solid #e2e6ec;
            button{
                width:50%;
                height:100%;
                line-height:2.73rem;
                border-radius:0;
                background:transparent;
                text-align:center;
                font-size:0.8rem;
                &:first-child{
                    border-right:1px solid #e2e6ec;
                }
                &.cancel{
                    color:#707b8e;
                }
                &.sure{
                    color:var(--mainColor);
                }
            }
        }
        &.new_folder,&.had{
            .body{
                border:none;
            }
            .member_list_contain{
                height:10rem;
                overflow-y:scroll;
            }
        }
    }
    // 下拉菜单遮罩层
    .doc_masking{
        z-index:8;
    }
    // 骨架图
    .skeleton{
        .doc_menu,
        img{
            display: none;
        }
        .doc_title,
        .doc_info span,
        .doc_type_icon{
            background-color: #efefef;
            font-size: 0 !important;
        }
        .doc_title{
            height:1.2rem;
            margin-top:0;
        }
        .doc_info {
            height:0.85rem;
            span{
                display:inline-block;
                height:0.7rem;
                width:41%;
                vertical-align: bottom;
            }
        }
    }
    @{deep} .action-sheet{
        .action-sheet-container{
            padding-top: .5rem;
        }
        .action-sheet-list {
            height: 2.5rem;
            line-height: 2.5rem;
            border-bottom: .02rem solid #d6dbe6;
            &.recover{
                color: #737373;
            }
            &.delete{
                border: none;
                margin: 0 0 .5rem;
                color: #737373;
            }
            &.f_delete{
                border: none;
            }
        }
        // 分享
        .share_item{
            margin:1.9rem 0 2.52rem;
            text-align:center;
            div{
                display: inline-block;
                vertical-align: top;
                margin-right: 1.6rem;
                text-align:center;
                border:none;
                &::before{display:none;}
                &:last-child{margin-right:0;}
            }
            button {
                width: 2.47rem;
                height: 2.47rem;
                padding:0.5rem;
                border-radius: 0.33rem;
                box-shadow: 0rem 0.08rem 0.08rem 0rem rgba(0, 0, 0, 0.05);
                background-color: #ffffff;
                border: .02rem solid #d6dbe6;
                img {
                    width: 100%;
                    height: 100%;
                }
                img.loading {
                    margin:0.67rem auto;
                    width: 2.67rem;
                    height: 2.67rem;
                }
            }
            span {
                display: block;
                margin-top:0.2rem;
                color: #2d2d2d;
                font-size: 0.6rem;
            }
        }
    }
</style>

<script>
    import wap_set_authority from '@/components/WapSetAuthority.vue';
    import rename from '@/components/WapReName.vue';
    import team_setting from '@/components/WapTeamSetting.vue';
    import to_top from '@/components/WapToTop.vue';
    import export_modal from '@/components/WapExportModal.vue';
    import service from '@/components/WapService.vue';
    import bottom_bar from '@/components/WapBottomBar.vue';
    import share_common_modal from '@/components/WapShareModal.vue';
    import ws_client from '@/assets/common/js/ws_client.js';
    import collaborate from '@/assets/common/js/collaborate.js';
    import ActionSheet from '@/components/CommonActionSheet.vue';
	export default{
		components: {
            rename,
            wap_set_authority,
            team_setting,
            to_top,
            export_modal,
            service,
            bottom_bar,
            share_common_modal,
            ActionSheet
		},
        metaInfo () {
            return {
                title: '吾道-Woodo',
                meta: [
                    {
                        name: 'viewport',
                        content: "width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0"
                    },
                    {
                        property: 'og:title',
                        content: '吾道-文档中心'
                    },
                    {
                        property: 'og:url',
                        content: 'https://www.woodo.cn/mobile/home/'
                    },
                ]
            }
        },
        data () {
            return {
                operate_list:[],
                user: "",                         // 用户信息
                no_scroll: false,                 // 是否允许页面滚动
                doc_list: [
                    {id:'',name:'',modifyDate:'',url:'',visitType:'',documentType:''},
                    {id:'',name:'',modifyDate:'',url:'',visitType:'',documentType:''},
                    {id:'',name:'',modifyDate:'',url:'',visitType:'',documentType:''},
                    {id:'',name:'',modifyDate:'',url:'',visitType:'',documentType:''},
                ],                                // 文档列表
                page_loading: false,              // 是否展示进入文件夹加载页面
                page_masking: false,
                doc_options_show: false,
                current_doc_index:'',
                current_doc_info: {},             // 文档信息
                doc_menu_type: "document",        // 文档菜单类型
                parent_folder_id: "",             // 最底层父级文件夹id
                current_folder_info:{},           // 当前所在文件夹信息
                pre_folder_arr:[],                // 上一级文件夹信息
                doctype_box: false,               // 展示文档分类下拉框
                show_doc_menu: false,             // 展示文档菜单弹框
                clean_all:false,                  // 回收站弹框
                show_empty: false,                // 展示空状态
                checked_list:[],                  // 当前选中列表
                all_choose:false,                 // 是否全部选中

                // 文档类型数组
                doc_type_arr: [
                    {type:"myTeam", name:"我的团队"},
                    {type:"myDesktop", isOwnerRole:'',name:"所有文档"},
                    {type:"myDesktop", isOwnerRole:true, name:"我创建的"},
                    {type:"myDesktop", isOwnerRole:false, name:"共享给我的"},
                    {type:"myRelease", name:"我发布的"},
                    {type:"myCollect", name:"我收藏的"},
                    {type:"dustbin", name:"回收站"}
                ],
                // 当前文档类型信息
                current_list_type_obj:{
                    name:"所有文档",
                    type:"myDesktop"
                },
                // 删除弹框信息
                delete_doc_obj:{
                    type:'confirm',      // 'confirm'二次确认弹框 'tip'提示弹框
                    content:null,        // 文案
                    doc_type: '',        // 文档类型
                },
                // 当前用户文档权限列表
                document_option_authority:[],

                // 移动文件夹相关
                show_move_modal: false,                 // 展示移动弹框展示标识
				target_folder_info:{},                  // 移动目标文件夹信息
				move_folder_list:[],                    // 移动文件夹列表(普通文档)
                move_team_folder_list:[],               // 移动文件夹列表(团队) 
                current_move_folder_info:{
                    type:'myDesktop',
                    myDocuemnt:{},
                    myTeam:{}
                },                                      // 移动目标文件夹类型(myDesktop:我的文档,myTeam:我的团队)
                is_weixin:false,

				team_info: null,                      // 团队信息
				team_name: '',                        // 团队名称
                team_create_modal_show: false,        // 团队创建弹框展示标识
				team_member_delete_show: false,       // 团队成员移除菜单
				team_folder_delete_tip_show: false,   // 团队文件夹删除提示
                team_member_invitation:{              // 团队邀请成员相关
					// 当前文档已添加的团队成员
					member: [
						{
							memberId: '',
						}
					],
					// 新添加团队成员列表
					added_member:[],
					// 最近团队成员列表
					recommend_member:[],
					// 搜索结果
					search_result:[],
					// 搜索关键词
					search_keyword: '',
                },
                team_member_select_show: false,        // 团队文件夹成员设置弹框标识
				team_member_select_list: [],          // 团队文件夹成员列表(文件夹成员设置时使用)
				team_member_select_default_list: [],  // 团队文件家成员列表(初始)
				team_folder_name: '',                 // 团队新建文件夹名称
				team_member_select_type:'',            // 团队成员设置面板状态(had:已有文件夹成员设置; new_folder:新建文件夹; transfer:转让)
				team_member_list:[],                  // 团队成员列表(不包括待加入)
                team_all_member_list:[],              // 团队所有成员列表(包括带待加入)
                team_member_list_show: false,         // 团队成员列表弹框显示标识
                show_team_move_authority:false,       // 团队移动文件夹权限设置
                team_dissolution_modal_show: false,   // 解散团队弹框标识

                welcome_document: null,//欢迎文档
            }
        },
        mounted(){
            const that = this;
            // 拦截团队邀请信息
            let type = that.$route.query.type || false;
			let key = that.$route.query.key;
            let ownerName = that.$route.query.ownerName;
            // 跳转加入团队落地页
			if(type === 'join_team'){
                let url =  window.location.protocol +'//'+ window.location.host +'/mobile/invite?use_invite_link=true&key=' + encodeURIComponent(key);
                window.location.href = url;
                return;
            }
            that.ws_init();
            that.user = that.$common.get_login_state();
            // 判断终端环境
            that.is_weixin = utils.deviceENV().wechat;
            that.get_team_info();
            that.get_doc_list({
                info: that.current_list_type_obj,
                fid:'',
                grade:0,
                pageNumber:1,
                first_load:true
            });
            that.$axios.get('/api/member/get_message_notification_count/')
                .then(function(data){
                    that.user.news = data.data.data;
                });
        },
        watch:{
            doc_list(){
                $(this.$refs.skeleton).removeClass('skeleton');
            }
        },
        methods: {
            // socket 初始化
            ws_init:function(){
                try{
                    let that = this;
                    ws_client({
                        success : function(method){
                            that.ws_client_method = method;
                        },
                        error : function(msg){
                           console.error(msg); 
                        }
                    });
                }catch(e){
                    console.error(e);
                }
            },

            // 文档删除
            ws_doc_delete_send:function(){
                try{
                    let that = this,
                        id = that.current_doc_info.id;
                    if(that.ws_client_method.doc_delete_send) that.ws_client_method.doc_delete_send(id);
                }catch(e){
                    console.error(e);
                }
            },
            // 时间戳转日期
            timestamp_to_time: function(arr) {
                for(let i = 0; i < arr.length; i++) {
                    if(arr[i].modifyDate) arr[i].time = utils.timeStampDetail(arr[i].modifyDate / 1000);
					if(arr[i].createDate) arr[i].time = utils.timeStampDetail(arr[i].createDate / 1000);
					arr[i].topTime = arr[i].topTime ? arr[i].topTime : 0;
                }
            },

            // 切换文档列表分类
            change_doc_type: function(item){
                this.doctype_box = false;
                this.clean_all = false;
                this.checked_list = [];
                this.doc_list = [];
                this.doc_menu_type = '';
                this.show_empty = false;
                this.current_list_type_obj = item;
                if(item.type === 'myTeam' && !this.team_info) return this.show_empty = true;
                this.get_doc_list(item);
                this.welcome_document = null;
            },
            // 清空文档页所有菜单
            close_all_menu: function(){
                // 状态重置
                this.page_masking = false;
                this.show_doc_menu = false;
                this.no_scroll = false;
                this.doc_options_show = false;
            },
            
            // 获取我的桌面列表
            get_doc_list: function(obj){
                /*
                    info: 当前文件列表类型(type, name)
                    fid： 当前文件夹id
                    grade: 当前文件夹层级
                    pageNumber: 需要获取的列表页码
                    change_page: 是否切换页（1000为单位）
                */
                let that = this,
                    params = {
                        info: that.current_list_type_obj,
                        fid: '',
                        pageNumber: 1,
                        change_page: false,
                        first_load: false,
                    };
                params = Object.assign(params, obj);
                // 根据文档类型写入对应链接和参数
                let get_params = {}, url;
                switch (params.info.type) {
                    case 'myDesktop':
                        url = '/api/member/my_document/';
                        get_params = {
                            fId: params.fid,
                            isOwnerRole: params.info.isOwnerRole
                        };
                        break;
                    case 'myTeam':
                        url = '/api/member/my_team/';
                        get_params = {
                            fid:params.fid
                        }
                        break;
                    case 'myCollect':
                        url = '/api/member/my_collect/';
                        get_params = {
                            params: 'document,template,works'
                        };                        
                        break;
                    case 'myRelease':
                        url = '/api/member/my_release/';
                        break;
                    case 'dustbin':
                        url = '/api/member/dustbin/';
                        break;
                }
                // 获取对应文档数据
                that.$axios.get(url, {params: get_params})
                .then(function(data){
                    if(data.data.code !== '2') return that.$toast(data.data.content, 1000, 'wap');
                    let document_list = data.data.data.documentList ? data.data.data.documentList : data.data.data,
                        children_folders = data.data.data.childrenFolders || [],
                        current_folder_info = data.data.data.currentFolder || {},
                        welcome_document = data.data.data.welcomeDocument || null;
                    // 当前为 我的文档 或 协作文档 时，文档列表添加文件夹
                    if(['myDesktop','myTeam'].indexOf(params.info.type) > -1) document_list = document_list.concat(children_folders);
                    // 保存当前文件夹名称
                    that.current_folder_info = current_folder_info;
                    // 存储当前父级文件夹信息
                    if(current_folder_info.grade == 0) that.parent_folder_id = current_folder_info.id;
                    // 判断文档类型，做相应操作
                    if(document_list.length > 0){
                        switch (true) {
                            // 回收站
                            case params.info.type === 'dustbin':
                                // 时间戳转日期
                                document_list.forEach(function(item){item.time = item.modifyDate;item.checked = false;});
                                that.doc_list= document_list;
                                break;
                            // 其他文档类型
                            default:
                                for(let item in document_list){
                                    if(document_list[item].collaborateCreateDate && document_list[item].collaborateCreateDate > document_list[item].modifyDate){
                                        document_list[item].modifyDate = document_list[item].collaborateCreateDate;
                                    }
                                }
                                // 按时间戳排序 && 排除置顶
    							document_list = document_list.sort(function(a,b){
    								return b.topTime - a.topTime || b.modifyDate - a.modifyDate;
    							});
                                // 时间戳转日期
                                that.timestamp_to_time(document_list);
                                let folder_list = [],doc_list = [],flag = 0;
                                // 筛选文件夹
                                document_list.forEach(function(item,index){
                                    if(typeof(item.grade) === 'number'){
                                        folder_list.push(item);
                                    }else{
                                        doc_list.push(item);
                                    }
                                })
                                that.doc_list = folder_list.concat(doc_list);
                                // 存储当前父级文件夹信息
                                if(current_folder_info.grade == 0) that.parent_folder_id = current_folder_info.id;
                                break;
                        }
                    }
                    // 欢迎文档
                    if(welcome_document !== null){
                        that.welcome_document = welcome_document;
                        that.timestamp_to_time([that.welcome_document]);
                        that.welcome_document.is_welcome_document = true;
                        that.welcome_document.type = 'template';
                    }
                    // 判断是否空状态
                    if(document_list.length <= 0){
                        that.doc_list = [];
                        if(welcome_document === null){
                            that.show_empty = true;
                        }
                    }
                });
            },
            // 进入文件夹
            enter_doc_grade:function(item){
                let that = this,
                    obj = {
                        info:that.current_list_type_obj,
                        fid:item.id,
                        pageNumber:1,
                    };
                that.get_doc_list(obj);
                that.page_loading = true;
                that.pre_folder_arr.unshift(that.current_folder_info);
                that.current_folder_info = item;
                setTimeout(function(){
                    that.page_loading = false;
                },200)           
            },
            // 返回上级文件夹
            back_pre_folder: function(){
                let that = this,
                    obj = {
                        info:that.current_list_type_obj,
                        fid:that.pre_folder_arr[0].id,
                        pageNumber:1,
                    };
                that.doc_list = [];
                that.get_doc_list(obj);
                that.current_folder_info = that.pre_folder_arr[0];
                that.pre_folder_arr.shift();
            },
            // 进入文档演示页
            enter_doc_show: function(item){
                let that = this,
                    _collect_type = item.document ? item.document.documentType:false;
                if(!item.type){
					item.type = 'document';
				}
				let value;
				switch(item.type) {
					case 'works':
						value = item.workShareId;
                        location.href = `/mobile/works/slides/${value}/`;
						break;
					case 'template':
						value = item.templateId || item.id;
                        location.href = `/mobile/template/slides/${value}/`;
						break;
					case 'document':
						value = item.documentUrl || item.url;
                        location.href = `/mobile/document/slides/${value}/`;
						break;
				}
            },
            // 打开/关闭移动弹框
            move_doc_modal_toggle: function(type,authority){
                let that = this;
                that.show_doc_menu = false;
                if(type){
                    // 获取文件夹列表
                    that.get_folder_list(authority,function(){
                        // 设置初始选中文件夹
                        if(that.current_list_type_obj.type === 'myTeam'){
                            that.target_folder_info = that.move_team_folder_list[0];
                            that.move_team_folder_list[0].check = true;
                        }else{
                            that.target_folder_info = that.move_folder_list[0];
                            that.move_folder_list[0].check = true;
                        }
                        that.show_move_modal = true;
                        that.pre_folder_arr = [];
                    });
                }else{
                    that.show_move_modal = false;
                }
            },
			// 获取文件夹列表(移动弹框 文档权限authority: other => 协作者 不可移动到团队)
            get_folder_list: function(authority,callback){
				let that = this;
				// 获取我的文档文件夹列表
				let get_desktop = function(){
					that.$axios.get("/api/member/folder/list/")
					.then(function(data){
						if(data.data.code == 2){
                            that.current_move_folder_info.myDocuemnt = data.data.data[0];
							success_callback(data.data.data,'move_folder_list');
						}else{
							that.$toast(data.data.content,1000,'wap');
						}
					})
				}
				// 获取我的团队文件夹列表
				let get_team = function(){
					that.$axios.get("/api/member/team/folder/list/")
					.then(function(data){
						if(data.data.code == 2){
                            that.current_move_folder_info.myTeam = data.data.data[0];
							success_callback(data.data.data,'move_team_folder_list');
						}else{
							that.$toast(data.data.content,1000,'wap');
						}
					})
				}
				// 成功回调
				let success_callback = function(list,result){
					$.each(list,function(index,item){
						// 第0级文件夹默认展示
						if(item.grade === 0){
							item.show = true;
							item.open = true;
						}
						// 第1级文件夹默认展示
						if(item.grade === 1){
							item.show = true;
						}
						// 判断是否还有子级文件夹
						if(list.filter(data => data.treePath.indexOf("," + item.id + ",") != -1 ).length === 0){
							item.nochild = true;
						}
					})
                    that[result] = list;
					setTimeout(() => {
						if(typeof callback === 'function') callback();
					}, 300);
				}
				switch (that.current_list_type_obj.type) {
					case 'myTeam':
						get_team();
						if(authority !== 'other'){
							get_desktop();
						}else{
							that.move_folder_list = [];
						}
						break;
					default:
						get_desktop();
						if(authority !== 'other' && that.team_info && !that.current_doc_info.grade){
							get_team();
						}else{
							that.move_team_folder_list = [];
						}
						break;
				}
			},
			// 选中移动目标文件夹&打开文件夹
            check_move_folder: function(p_item,p_index,type){
				let that = this,
					cur_result = type === 'myTeam' ? 'move_team_folder_list' : 'move_folder_list',
					oth_result = type === 'myTeam' ? 'move_folder_list' : 'move_team_folder_list',
					cur_list = that[cur_result],
					oth_list = that[oth_result],
					open = !cur_list[p_index].open;
				that.current_move_folder_info.type = type;
                that.target_folder_info = p_item;
                that.pre_folder_arr.unshift(that.target_folder_info);
				// 其余列表清除选中状态
                $.each(oth_list,function(o_index,o_item){
					o_item.check = false;
				})
				// 首级 / 无子文件夹拦截
				if(p_item.nochild || p_index === 0){
					$.each(cur_list,function(c_index,c_item){
						c_item.check = false;
						if(c_index == p_index) c_item.check = true;
					})
					that[cur_result] = cur_list;
					return false;
				}
				// 文件夹打开/关闭
                cur_list[p_index].open = open;
                $.each(cur_list,function(c_index,c_item){
					c_item.check = false;
					if(c_index === p_index) c_item.check = true;
                    // 打开
                    if(open){   
                        //当前文件夹的下一层显示
                        if(c_item.treePath.indexOf("," + p_item.id + ",") != -1 && c_item.grade === p_item.grade + 1){
							c_item.show = true;
						}
                    }
                    // 关闭
                    else{
                        //当前文件夹的子级全部隐藏
                        if(c_item.treePath.indexOf("," + p_item.id + ",") != -1){
							c_item.show = false;
							c_item.open = false;
						}
                    }
				});
				that[cur_result] = cur_list;
				that[oth_result] = oth_list;
                // 强制刷新
				that.$forceUpdate();
			},
			// 打开团队文件夹移动权限设置弹框
			team_move_authority_toggle: function(){
                let that = this;
                // 获取团队成员列表
                that.get_team_folder_member(that.target_folder_info.id,function(list){
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
                    that.$refs.wap_set_authority.show({
                        id:that.current_doc_info.id,
                        type:'team_move',
                        team_member_select_list:list_head.concat(list_foot)
                    });
                });
			},
			// 移动文件夹确定事件
			move_cur_folder: function() {
				let that = this;
				let success_callback = function(){
					let nobread = false;
					that.$toast("移动成功",2000,'wap');
					// 关闭移动弹框
                    that.move_doc_modal_toggle(false);
                    that.$refs.wap_set_authority.close();
                    // 跨分类进入文件夹
                    that.current_list_type_obj = that.doc_type_arr.filter(item => item.type === that.current_move_folder_info.type)[0];
                    let obj = {
                        info:that.current_list_type_obj,
                        fid:that.target_folder_info.id,
                        pageNumber:1,
                    };
                    that.get_doc_list(obj);
                    that.pre_folder_arr.push(that.move_folder_list[0])
                    that.pre_folder_arr.splice(0,1);
                    that.current_folder_info = that.target_folder_info;
					that.show_team_move_authority = false;
                    that.doc_list.splice(that.current_doc_index, 1);
				}
				// 移动到我的文档
				if(that.current_move_folder_info.type === 'myDesktop'){
                    if(that.current_doc_info.grade){
                        //文件夹移动
                        if(that.current_doc_info.id == that.target_folder_info.id) {
                            that.$toast("无法移动相同文件夹", 2000,'wap');
                        }else if(that.current_folder_info.id === that.target_folder_info.id){
                            that.pre_folder_arr.splice(0,1);
                            that.$toast("已在当前文件夹，无需移动", 2000,'wap');
                        } else {
                            that.$axios.post('/api/member/folder/move/', {
                                targetFid: that.target_folder_info.id,
                                fid: that.current_doc_info.id
                            }).then(function(data) {
                                if(data.data.code == 2) {
                                    success_callback();
                                } else {
                                    that.$toast(data.data.content, 2000,'wap');
                                }
                            });
                        }
                    }else{
                        //文档移动
                        if(that.current_folder_info.id === that.target_folder_info.id){
                            that.$toast("已在当前文件夹，无需移动", 2000,'wap');
                        }else{
                            let _url = '/api/member/document/move/';
                            // 团队文档移出到我的文档
                            if(that.current_list_type_obj.type === 'myTeam') _url = '/api/member/team/folder/move_out/';
                            that.$axios.post(_url, {
                                docId: that.current_doc_info.id,
                                fId: that.target_folder_info.id
                            }).then(function(data) {
                                if(data.data.code == 2) {
                                    success_callback();
                                } else {
                                    that.$toast(data.data.content, 2000,'wap');
                                }
                            });
                        }
                    }
				}
				// 移动到我的团队
				else{
					if(that.current_folder_info.id === that.target_folder_info.id){
						that.$toast("已在当前文件夹，无需移动", 2000,'wap');
					}else{
						that.$axios.post('/api/member/team/folder/move_in/', {
							docId: that.current_doc_info.id,
							fId: that.target_folder_info.id,
							memberJson:JSON.stringify(that.team_member_select_list.filter(item => item.check))
						}).then(function(data) {
							if(data.data.code == 2) {
								success_callback();
							} else {
								that.$toast(data.data.content, 2000,'wap');
							}
						});
					}
				}
			},
            // 展示/隐藏文档筛选框
            show_doctype_box: function(){
                let that = this;
                if(that.current_list_type_obj.type === 'myTeam') return that.change_doc_type({type:"myDesktop", isOwnerRole:'',name:"所有文档"})
                that.doctype_box = ! that.doctype_box;
            },
            // 唤起文档菜单下拉框
            open_doc_options_modal: function(item,index){
                let that = this;
                that.current_doc_info = item;
                that.current_doc_index = index;
                //欢迎文档
                if(item.is_welcome_document){
                    that.operate_list = [{
                        text: '移除',
                        onClick: () => {
                            that.delete_welcome_document();
                        }
                    }];
                    that.$refs.ActionSheet.open();
                    return;
                }
                if(!item.grade){
                    that.get_user_document_info();
                }
                // 所有文档页面 || 我的团队页面
                if(['myDesktop','myTeam'].indexOf(that.current_list_type_obj.type) > -1){
                    if(!item.grade){
                        // 文档菜单
                        if (that.current_doc_info.collaborateRoleType === 'owner') {
                            // 我的文档菜单
                            that.operate_list = [{
                                text: '下载',
                                onClick: () => {
                                    that.download_doc()
                                }
                            }, {
                                text: '生成H5页面',
                                onClick: () => {
                                    that.create_h5()
                                }
                            }, {
                                text: '重命名',
                                onClick: () => {
                                    that.open_doc_menu('rename')
                                }
                            }, {
                                text: '权限设置',
                                onClick: () => {
                                    that.open_set_authority()
                                }
                            }, {
                                text: '复制',
                                onClick: () => {
                                    that.copy_doc();
                                }
                            }, {
                                text: '移动',
                                onClick: () => {
                                    that.move_doc_modal_toggle(true)
                                }
                            }, {
                                text: '移动至回收站',
                                onClick: () => {
                                    that.open_doc_menu('hidden');
                                }
                            }];
                            that.$refs.ActionSheet.open();
                        } else {
                            let operate_list = [];
                            // 协作文档菜单
                            operate_list = [{
                                    text: '下载',
                                    onClick: () => {
                                        that.download_doc()
                                    }
                                }, {
                                    text: '生成H5页面',
                                    onClick: () => {
                                        that.create_h5()
                                    }
                                }, {
                                    text: '重命名',
                                    onClick: () => {
                                        that.open_doc_menu('rename')
                                    }
                                }, {
                                    text: '复制',
                                    onClick: () => {
                                        that.copy_doc();
                                    }
                                }, {
                                    text: '移动',
                                    onClick: () => {
                                        that.move_doc_modal_toggle(true)
                                    }
                                }, {
                                    text: '退出协作',
                                    onClick: () => {
                                        that.open_doc_menu('quit')
                                    }
                            }];
                            // 协作文档获取当前用户权限
                            if(item.collaborateRoleType && item.collaborateRoleType !== 'owner'){
                                that.$axios.get('/api/member/document_collaborate/get_authorities/', {
                                    params:{ docId:item.id },
                                }).then(function(data){
                                    if(data.data.code !== '2') return that.$toast(data.data.content, 800,'wap');
                                    that.document_option_authority = data.data.data.authorityTypes;
                                    // 是否显示h5
                                    if (['edit', 'onlyReview'].indexOf(that.current_doc_info.collaborateRoleType) < 0) {
                                        operate_list.splice(operate_list.findIndex(item => item.text ==='生成H5页面'), 1);
                                    }
                                    if(that.check_option_disabled('documentRename', that.document_option_authority)){
                                        // 是否能重命名
                                        operate_list.splice(operate_list.findIndex(item => item.text ==='重命名'), 1);
                                    }
                                    if(that.check_option_disabled('documentCopy', that.document_option_authority)){
                                        // 是否能复制
                                        operate_list.splice(operate_list.findIndex(item => item.text ==='复制'), 1);
                                    }
                                    that.operate_list = operate_list;
                                    that.$refs.ActionSheet.open();
                                });
                            }
                        }
                    }else{
                        // 文件夹菜单
                        let operate_list = [];
                        operate_list = [{
                                text: '重命名',
                                onClick: () => {
                                    that.open_doc_menu('rename')
                                }
                            }, {
                                text: '移动',
                                onClick: () => {
                                    that.move_doc_modal_toggle(true)
                                }
                            }, {
                                text: '删除',
                                onClick: () => {
                                    that.open_doc_menu('hidden')
                                },
                                class: 'f_delete'
                        }]
                        // 团队文件夹菜单
                        if(that.current_list_type_obj.type === 'myTeam'){
                            operate_list[1] = {
                                text: '成员设置',
                                onClick: () => {
                                    that.team_folder_set_member()
                                }
                            };
                        }
                        that.operate_list = operate_list;
                        that.$refs.ActionSheet.open();
                    }
                }
                // 我的收藏菜单
                if(that.current_list_type_obj.type === 'myCollect'){
                    that.operate_list = [{
                            text: '演示',
                            onClick: () => {
                                that.enter_doc_show(that.current_doc_info)
                            }
                        }, {
                            text: '取消收藏',
                            onClick: () => {
                                that.delete_collect()
                            }
                    }];
                    that.$refs.ActionSheet.open();
                }
                // 回收站菜单
                if(that.current_list_type_obj.type === 'dustbin' && !that.clean_all){
                    that.operate_list = [{
                            text: '恢复',
                            onClick: () => {
                                that.recovery_doc()
                            },
                            class: 'recover'
                        }, {
                            text: '彻底删除',
                            onClick: () => {
                                that.delete_doc()
                            },
                            class: 'delete'
                    }]
                    that.$refs.ActionSheet.open();
                }
            },
            // 打开文档相关操作弹框
            open_doc_menu: function(type,item,index){
                let that = this;
                that.show_doc_menu = true;
                that.page_masking = false;
                that.doc_options_show = false;
                that.no_scroll = true;
                that.doc_menu_type = type;
                switch (type) {
                    case 'share':
                        // 我的文档跳转文档分享页有空白弹框兼容
                        if(that.current_doc_info.url){
                            return location.href = '/mobile/doc_share/?url='+ that.current_doc_info.url;
                        }else{
                            return location.href = '/mobile/doc_share/?url='+ that.current_doc_info.documentUrl;
                        }
                        break;
                    case 'all_clean':
                        that.clean_all = !that.clean_all;
                        that.show_doc_menu = false;
                        break;
                    case 'rename':
                        let rename_type = 'document';
                        if(that.current_doc_info.grade){
                            rename_type = 'folder';
                            if(that.current_list_type_obj.type === 'myTeam') rename_type = 'team_folder';
                        }
                        that.$refs.rename.show(that.current_doc_info,that.current_doc_info.name,rename_type);
                        that.show_doc_menu = false;
                        break;
                    case 'hidden':
                        that.doc_hidden_judge();
                        break;
                    default:
                        break;
                }
            },
            // 置顶/取消置顶功能
			top_doc: function(item,index){
				let that = this;
				that.$axios.post('/api/member/document/set_top/',{
					documentCollaborateId: item.documentCollaborateId
				})
				.then(function(data){
					that.$toast(data.data.content, 2000, 'wap');
					if (data.data.code === '2') {
						if(item.topTime == 0){
							let	list = that.doc_list;
							list.splice(index, 1);
                            item.topTime = new Date().getTime();
                            let first_index = list.findIndex(data => !data.grade);
							list.splice(first_index,0,item);
							that.doc_list = list;
						}else{
							that.doc_list[index].topTime = 0;
                            that.doc_list[index].modifyDate = new Date().getTime();
                            // 文档排序
                            that.doc_list = that.doc_list.sort(function(a,b){
								return b.topTime - a.topTime || b.modifyDate - a.modifyDate;
							});
                            let folder_list = [], doc_list = [], flag = 0;
                            // 筛选文件夹
                            that.doc_list.forEach(function(item,index){
                                if(typeof(item.grade) === 'number'){
                                    folder_list.push(item);
                                }else{
                                    doc_list.push(item);
                                }
                            })
                            that.doc_list = folder_list.concat(doc_list);
						}
						that.show_options_box = false;
					}
				})
			},
            // 文档/文件夹删除判断
            doc_hidden_judge: function(){
                let that = this;
                // 文件夹删除
                if(that.current_doc_info.grade){
                    // 团队文件夹删除
                    if(that.current_list_type_obj.type === 'myTeam'){
                        // 查询是否可以删除
                        that.$axios.get('/api/member/team/folder/check_folder/', {params: {
                            fId: that.current_doc_info.id,
                            checkType:'content'
                        }})
                        .then(function(data){
                            if(data.data.code == 2){
                                that.delete_doc_obj = {
                                    type:'confirm',
                                    doc_type: 'teamfolder'
                                }
                            }else{
                                that.delete_doc_obj = {
                                    type:'tip',
                                    content:'本文件夹内含有文件，请联系所有者将其删除或移除后继续'
                                }
                            }
                        })
                    }
                    // 普通文件夹删除
                    else{
                        that.delete_doc_obj = {
                            type:'confirm',
                            content:'删除后将无法恢复，确定要删除此文件夹吗？',
                            doc_type: 'folder'
                        }
                    }
                }
                // 文档删除
                else{
                    that.delete_doc_obj = {
                        type:'confirm',
                        doc_type: 'document'
                    }
                };
            },
            // 确认删除
            delete_confirm: function () {
                var that = this;
                var type = that.delete_doc_obj.doc_type;
                switch(type){
                    case 'document': 
                        that.$axios.post('/api/member/document/tmp_delete/',{
                            docId: that.current_doc_info.id
                        })
                        .then(function(data){
                            if(data.data.code === '2'){
                                that.doc_list.splice(that.current_doc_index, 1);
                                that.$toast('删除成功', 2000,'wap');
                                // 删除文档发送通讯
                                that.ws_doc_delete_send();
                                that.close_all_menu();
                            }else{
                                that.$toast(data.data.content, 2000,'wap');
                            }
                        })
                        break;
                    case 'folder': 
                        case 'document': 
                            that.$axios.post('/api/member/folder/delete/',{
                                fid: that.current_doc_info.id
                            })
                            .then(function(data){
                                if(data.data.code === '2'){
                                    that.doc_list.splice(that.current_doc_index, 1);
                                    that.$toast('删除成功', 2000,'wap');
                                    // 删除文档发送通讯
                                    that.ws_doc_delete_send();
                                    that.close_all_menu();
                                }else{
                                    that.$toast(data.data.content, 2000,'wap');
                                }
                            })
                            break;
                    default: 
                            that.$axios.post('/api/member/team/folder/delete/',{
                                fId: that.current_doc_info.id
                            })
                            .then(function(data){
                                if(data.data.code === '2'){
                                    that.doc_list.splice(that.current_doc_index, 1);
                                    that.$toast('删除成功', 2000,'wap');
                                    // 删除文档发送通讯
                                    that.ws_doc_delete_send();
                                    that.close_all_menu();
                                }else{
                                    that.$toast(data.data.content, 2000,'wap');
                                }
                            })
                            break;
                }
            },
            // 复制文档
            copy_doc: function(){
                let that = this;
                that.$axios.post("/api/member/document/copy/",{
                    docId:that.current_doc_info.id,
                    title:that.current_doc_info.name
                })
                .then(function(data){
                    // 重置菜单数据
                    that.close_all_menu();
                    if(data.data.code === '2'){
                        let new_doc = data.data.data;
						data.data.data.topTime = 0;
                        that.doc_list.unshift(new_doc);
                        // 文档排序
                        that.doc_list = that.doc_list.sort(function(a,b){
                            return b.topTime - a.topTime || b.modifyDate - a.modifyDate;
                        });
                        // 时间戳转日期
                        that.timestamp_to_time(that.doc_list);
                        let folder_list = [],doc_list = [],flag = 0;
                        // 筛选文件夹
                        that.doc_list.forEach(function(item,index){
                            if(typeof(item.grade) === 'number'){
                                folder_list.push(item);
                            }else{
                                doc_list.push(item);
                            }
                        })
                        that.doc_list = folder_list.concat(doc_list);
                        that.$toast("复制成功",1000,'wap');
                    }else{
                        that.$toast(data.data.content,1000,'wap')
                    }
                });
            },
            // 下载文档
            download_doc: function(){
                let that = this;
                if(that.current_list_type_obj.type === 'myCollect'){
                    that.$refs.export_modal.show(that.current_doc_info.documentId, that.current_doc_info.name);
                }else{
                    that.$refs.export_modal.show(that.current_doc_info.id, that.current_doc_info.name);
                }
                // 重置菜单数据
                that.close_all_menu();
            },
            // 彻底删除文档
            delete_doc: function(){
                let that = this;
                that.$axios.post("/api/member/document/delete/",{
                    docId:that.current_doc_info.id
                })
                .then(function(data){
                    // 重置菜单数据
                    that.close_all_menu();
                    if(data.data.code === '2'){
                        that.doc_list.splice(that.current_doc_index, 1);
                        if(that.doc_list.length === 0) that.show_empty = true;
                        // 删除文档发送通讯
                        that.ws_doc_delete_send();
                        that.$toast("删除成功",1000,'wap');
                    }else{
                        that.$toast(data.data.content,1000,'wap')
                    }
                });
            },
            // 恢复文档
            recovery_doc: function(){
                let that = this;
                that.show_doc_menu = false;  
                that.$axios.post("/api/member/document/recovery/",{
                    docId:that.current_doc_info.id
                })
                .then(function(data){
                    // 重置菜单数据
                    that.close_all_menu();
                    if(data.data.code === '2'){
                        that.doc_list.splice(that.current_doc_index, 1);
                        if(that.doc_list.length === 0) that.show_empty = true;
                        that.$toast("恢复成功",1000,'wap');
                    }else{
                        that.$toast(data.data.content,1000,'wap')
                    }
                });
            },
            // 删除欢迎文档
            delete_welcome_document:function(){
                let that = this;
                if(!that.current_doc_info.is_welcome_document){
                    return;
                }
                that.$axios.post('/api/member/delete_welcome_document/').then(function(data) {
                    //重置菜单数据
                    that.close_all_menu();
                    data = data.data;
                    if(data.code != 2){
                        that.$toast('移除失败', 800);
                        return;
                    }
                    that.welcome_document = null;
                }).catch(function(err){
                    console.log(err);
                    that.$toast('移除失败', 800);
                });
            },
            // 跳转到 h5 演示页
            create_h5: function () {
                let that = this;
                let url = that.current_doc_info.documentUrl || that.current_doc_info.url;
                if (url) {
                    window.location = `/mobile/h5/slides/${url}/`;
                }
            },
            // 文档&文件夹&团队重命名
            rename_upgrade:function(obj){
                let that = this;
                if(obj.type === 'team'){
                    that.team_name = obj.value;
                    that.team_info.teamName = obj.value;
                }else{
                    that.$set(that.doc_list[that.current_doc_index],'name',obj.value);
                    that.show_doc_menu = false;
                }
                that.$toast("重命名成功",1000,'wap');
            },
            // 清空回收站
            all_clean_doc:function(confirm){
                let that=this;
                    that.show_doc_menu = false;
                if(confirm){
                    that.$axios.post("/api/member/clear_dustbin/")
                        .then(function(data){
                            if(data.data.code === '2'){
                                that.doc_list=[];
                                that.$toast("清空成功",1000,'wap');
                                that.show_doc_menu = "";
                                that.show_empty = true;
                                that.clean_all=false;
                            }
                        })
                }else{
                    that.close_all_menu();
                }
                setTimeout(()=>{
                    that.clean_all=false;
                },500)
                    
            },
            // 取消收藏
            delete_collect: function(){
                let that = this;
                that.$axios.post("/api/member/delete_collect/",{
                    documentId:that.current_doc_info.documentId
                })
                .then(function(data){
                    // 重置菜单数据
                    that.close_all_menu();
                    if(data.data.code === '2'){
                        that.doc_list.splice(that.current_doc_index, 1);
                        that.$toast("取消收藏成功",1000,'wap');
                    }else{
                        that.$toast(data.data.content,1000,'wap')
                    }
                });
            },
            // 按钮权限判断
            check_option_disabled:function(data, arr){
                let option_authority = arr;
                if(!data) return true;
                if(option_authority.length <= 0) return true;
                if(option_authority.indexOf(data) < 0) return true;
                return false;
            },
            // 协作者 - 退出协作
            quit_cooperation:function(){
                let that = this,
                    id = that.current_doc_info.id;
                collaborate.quit(that, {
                    id:  id,
                    success: function(data){
                        if(data.data.code !== '2') return that.$toast(data.data.content, 1000, 'wap');
                        location.href = '/mobile/home/';
                    }
                });
            },
			// 文档批量操作
			doc_batch_operation:function(ops){
				let that = this,
					_list = JSON.parse(JSON.stringify(that.doc_list)),
                    _str = that.checked_list.join(',');
				switch(ops){
					case 'delete':
						that.$axios.post('/api/member/document/delete/', {
							docId: _str
						})
						.then(function(data){
							if(data.data.code == 2) {
								that.$toast('删除成功', 2000,'wap');
								let key = 0;
								for(let index in that.doc_list){
									if(that.doc_list[index].checked){
										_list.splice(key,1);
									}else{
										key++;
									}
								}
                                that.doc_list = _list;
                                if(that.doc_list.length === 0){
                                    that.clean_all=false;
                                }
								that.checked_list = [];
							} else {
								that.$toast(data.data.content, 2000,'wap');
							}
						})
						break;
					case 'recover':
						that.$axios.post('/api/member/document/recovery/', {
							docId: _str
						})
						.then(function(data){
							if(data.data.code == 2) {
								that.$toast('恢复成功', 2000,'wap');
								let key = 0;
								for(let index in that.doc_list){
									if(that.doc_list[index].checked){
										_list.splice(key,1);
									}else{
										key++;
									}
								}
                                that.doc_list = _list;
                                if(that.doc_list.length === 0){
                                    that.clean_all=false;
                                }
								that.checked_list = [];
							} else {
								that.$toast(data.data.content, 2000,'wap');
							}
						})
						break;
				}
				
			},
			// 获取选中批量操作文档
			get_checked_list:function(item,index){
				let that = this,
					add_item = true,
					_list = that.doc_list;
				if(item === 'all'){
					for(let _item in _list){
						if(!_list[_item].checked){
							_list[_item].checked = true;
							add_item = false;
							that.all_choose = true;
							that.checked_list.push(_list[_item].id);
						}
					}
					if(add_item){
						let obj=JSON.parse(JSON.stringify(_list,function(key,value){
							if(key=='checked'){
							return false;
							}else{
							return value;
							}
                        }))
                        that.doc_list = obj;
						that.checked_list = [];
						that.all_choose = false;
					}
				}else{
					item.checked = !item.checked;
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
						if(!_list[_item].checked){
								add_item = false;
							}
						}
						if(add_item){
							that.all_choose = true;
						}
					}
				}
            },
            // 新建文件夹事件
            created_folder_doc:function(){
                let that = this;
                let name = that.$refs.new_folder_name.value;
                if($validate(name).special()) return that.$toast('不能包含特殊字符', 2000);
                that.$axios.post('/api/member/folder/create/',{
                    fid: that.current_folder_info.id,
                    name: name
                })
                    .then(function(data){
                        if(data.data.code == 2){
                            that.$toast("文件夹创建成功",1000,'wap');
                            setTimeout(function(){
                                location.href="/mobile/home/"
                            },1000)
                        }else{
                            that.$toast(data.data.content,1000,'wap');
                        }
                    })
            },
            // 显示权限设置
            open_set_authority:function(){
                let that = this;
                if(that.current_list_type_obj.type === 'myTeam'){
                    // 获取成员列表（全部）
                    that.get_team_member(function(list){
                        that.$refs.wap_set_authority.show({
                            id: that.current_doc_info.id,
                            type: 'team_doc',
                            team_member_select_list: list
                        });
                        that.close_all_menu();
                    });
                }else{
                    that.$refs.wap_set_authority.show({
                        id:that.current_doc_info.id,
                        type:'document'
                    });
                    that.close_all_menu();
                }
            },

            // 获取用户文档信息
            get_user_document_info: function () {
                let that = this;
                let url = that.current_doc_info.url || that.current_doc_info.documentUrl;
                if(!url) return;
                that.$axios.get('/api/document/get_share_doc_info/?url='+url).then(function(res){
                    let res_data = res.data;
                    if(res_data.type !== 'success') {
                        that.$toast(res_data.content, 2000, 'wap');
                        return false;
                    }else{
                        if(!res_data.data.document.isUrlEffect){
                            that.$refs.share_common_modal.show({
                                is_mine: res_data.data.document.isMine,
                                document: res_data.data.document,
                                is_urlEffect: false
                            });
                            return false;
                        }
                    }

                    let doc_data = res_data.data;
                    let doc = doc_data.document;
                    that.$axios.get('/api/document/get_doc_author/', {
                        params: {
                            'id': doc.id,
                            'type': 'slide',
                        },
                    }).then((data) => {
                        if (data.data.type === 'success') {
                            let author_data = data.data.data;
                            doc.image = author_data.image;
                            that.$refs.share_common_modal.show({
                                is_mine: doc_data.isMine,
                                is_urlEffect: doc.isUrlEffect,
                                document: doc,
                                document_pages: doc_data.documentPages,
                                type: 'mydoc',
                                title: doc.title,
                                author: author_data.authorName || that.user.name,
                                share_url: `${window.location.origin}/mobile/document/slides/${doc.url}/`,
                            });
                        }
                    }).catch((err) => {
                        console.error(err);
                    });
                }).catch((err) => {
                    console.error(err);
                });
            },
            toggle_share_tips:function(){
                this.$refs.share_common_modal.toggle_share_tips();
                this.$refs.ActionSheet.close();
            },
            create_doc_poster:function(){
                this.$refs.share_common_modal.create_doc_poster();
                this.$refs.ActionSheet.close();
            },
            open_email_modal:function(){
                this.$refs.share_common_modal.open_email_modal();
                this.$refs.ActionSheet.close();
            },



            // 团队 - 团队信息获取
			get_team_info: function(){
				let that = this;
				that.$axios.get('/api/member/team/base_msg/').then((result)=>{
					let data = result.data;
					if (data.code == 2) {
						that.team_info = data.data;
					}
				}).catch((err)=>{
					console.log(err);
					that.$toast('获取团队信息失败',1000,'wap');
				});
            },
            // 团队 - 获取团队成员列表(不包括待加入)
			get_team_member: function(callback){
				let that = this;
				that.$axios.get('/api/member/team/members/')
				.then(function(data) {
					if(data.data.code == 2) {
						let member_list = data.data.data;
						if(member_list.length === 0) return false;
						// 时间戳转日期
                        that.timestamp_to_time(member_list);
						that.team_member_list = member_list;
						// 标记自己
						member_list.forEach(function(item,index){
							if(item.memberId == utils.getCookies('woodo_memberId')){
								item.is_mine = true;
							}
						});
						if(typeof callback === 'function') callback(member_list);
					} else {
						that.$toast(data.data.content, 2000, 'wap');
					}
				});
            },
            // 团队 - 获取文件夹成员列表
			get_team_folder_member: function(id,callback){
				let that = this;
				that.$axios.get('/api/member/team/folder/members/', {params: {
					fId: id
				}})
				.then(function(data) {
					if(data.data.code == 2) {
						// 标记自己
						data.data.data.forEach(function(item,index){
							if(item.memberId == utils.getCookies('woodo_memberId')){
								item.is_mine = true;
							}
						});
						if(typeof callback === 'function') callback(data.data.data);
						that.team_member_select_default_list = data.data.data;
					} else {
						that.$toast(data.data.content, 2000);
					}
				});
			},
            // 团队 - 创建/邀请成员 - 打开/关闭
			team_create_modal_toggle: function(type){
				let that = this;
				that.team_create_modal_show = type;
				if(type){
					// 创建团队
					if(!that.team_info){
						setTimeout(() => {
							$(that.$refs.create_team_name).focus();
						}, 500);
					}else{
                        that.team_invite_ewm();
                    }
				}else{
					// 重置数据
					that.team_member_invitation = {
						member: [],
						added_member:[],
						recommend_member:[],
						search_result:[],
						search_keyword: '',
					}
				}
			},
			// 团队 - 创建 - 搜索(全站)
			team_search_member: function(){
				let that = this,
					keyword = that.$refs.search_member_input.value;
				that.team_member_invitation.search_keyword = keyword;
				// 存在关键词 => 显示搜索结果
				if(keyword !== ''){
					that.$axios.get('/api/member/team/search/', {params: {
						keyword: keyword,
						teamId: that.team_info ? that.team_info.teamId : ''
					}})
					.then(function(data) {
						if(data.data.code === '2'){
							let result = data.data.data;
							// 当前搜索无结果 => 判断是否为 手机||邮箱
							if(result.length <= 0){
								let obj = {head: '/public/images/default_head.png'};
								// 判断当前输入为外部邮箱
								if($validate(keyword).email() || $validate(keyword).phone()){
									obj.nickName = keyword;
									obj.invitee = keyword;
									that.team_member_invitation.search_result = [obj];
								}else{
									that.team_member_invitation.search_result = [];
								}
							}
							// 当前搜索有结果 => 显示搜索结果
							else{
								// 过滤我自己
								result.forEach(function(item,index){
									if(item.isMine) result.splice(index,1);
								})
								that.team_member_invitation.search_result = result;
							}
							// 判断是否已邀请
							that.team_member_invitation.search_result.forEach(function(search){
								that.team_member_invitation.added_member.forEach(function(added){
									if(search.memberId === added.memberId && search.invitee === added.invitee && search.nickName === search.nickName) search.added = true;
								})
							})
                            // 判断是否已加入
                            that.team_member_invitation.search_result.forEach(function(search){
                                that.team_member_list.forEach(function(member){
                                    if(search.memberId === member.memberId) search.joined = true;
                                })
                            })
						}else{
							that.$toast(data.data.content, 800, 'wap');
						}
					})
				}
				// 关键词为空 => 显示已添加
				else{
					that.team_member_invitation.search_result = [];
				}
			},
			// 团队 - 创建 - 提交
			team_create: function(){
				let that = this;
				// 错误拦截
				if(that.team_name == ''){
					that.$toast('请填写正确的团队名称！',800, 'wap');
					$('.team_name input').focus();
					return false;
                }
                if(that.team_name.length > 10){
					that.$toast('不能超过10个字噢！', 2000, 'wap');
					$('.team_name input').focus();
					return false;
				}
				that.$axios.post('/api/member/team/create/',{
					name: that.team_name,
					memberJson: JSON.stringify(that.team_member_invitation.added_member),
				}).then(function(data) {
					if(data.data.code == 2) {
						that.$toast("团队创建成功", 2000, 'wap');
						that.team_create_modal_show = false;
						that.team_info = {
							teamName: that.team_name,
							teamId:data.data.data.teamId,
							teamRoleName: "管理员",
							teamRoleType: "team_owner",
							teamAuthority:[
								{
									"name":"解散团队",
									"type":"dissolutionTeam",
									"uri":"/api/member/team/dissolution_team/"
								},
								{
									"name":"生成邀请链接",
									"type":"generateInviteIKey",
									"uri":"/api/member/team/generate_invite_key/"
								},
								{
									"name":"修改团队名称",
									"type":"renameTeam",
									"uri":"/api/member/team/rename/"
								},
								{
									"name":"邀请成员",
									"type":"inviteMember",
									"uri":"/api/member/team/invite_member/"
								},
								{
									"name":"移除成员",
									"type":"removeMember",
									"uri":"/api/member/team/remove_member/"
								},
								{
									"name":"转让团队",
									"type":"transferTeam",
									"uri":"/api/member/team/transfer_team/"
								}
							]
						}
						// 获取团队文档列表
						that.get_doc_list(that.doc_type_arr[0]);
					} else {
						that.$toast(data.data.content, 2000, 'wap');
					}
				});
			},
			// 团队 - 成员 - 清除搜索
			team_clear_search_member:function(){
				let that = this;
				// 清除输入框
				if(that.$refs.search_member_input) that.$refs.search_member_input.value = '';
				// 清除搜索关键词
				that.team_member_invitation.search_keyword = '';
				that.team_folder_name = '';
				// 清除搜索结果列表
				that.team_member_invitation.search_result = [];
			},
			// 团队 - 成员 - 临时添加
			team_add_interim_member: function(member){
				let that = this,
					add_list = that.team_member_invitation.added_member;
				// 错误状态判断
				if(!member) return false;
				member.add = true;
				member.username = that.team_member_invitation.search_keyword;
				// 判断是否已添加
				let had_invitee = member.invitee && add_list.filter(item => item.invitee === member.invitee).length <= 0,
					had_add = add_list.filter(item => item.memberId === member.memberId).length <= 0;
				if(had_invitee || had_add) that.team_member_invitation.added_member.push(member);
				// 清除搜索
				that.team_clear_search_member();
			},
			// 团队 - 临时成员 - 下拉设置打开/关闭
			team_member_invitation_toggle: function(index){
				let that = this,team_obj = that.team_member_invitation,data = false;
				if(typeof index === 'undefined'){
					that.team_member_delete_show = false;
                    team_obj.added_member.forEach(function(item){item.open=false;});
				}else{
					that.team_member_delete_show = !that.team_member_delete_show;
					if(that.team_member_delete_show) data = true;
                    team_obj.added_member[index].open = data;
				}
			},
			// 团队 - 临时成员 - 移除(创建/新建文件夹通用)
			team_member_delete: function(index,type){
				let that = this,team_obj = that.team_member_invitation;
				if(type !== 'search'){
					that.team_member_list = that.team_member_list.filter(item =>{
						if(item.memberId === team_obj.added_member[index].memberId) item.check = false;
						return item;
					})
				}
				team_obj.added_member.splice(index,1)
				// 清除搜索
				that.team_clear_search_member();
            },
            // 团队 - 名称 - 聚焦
			team_name_focus: function(e){
				setTimeout(() => {
					document.execCommand('selectAll');
                }, 0);
                if(e) $(e.target).parents('.team_name_edit').addClass('focus');
			},
			// 团队 - 名称 - 校验
			team_name_check: function(value){
				let that = this;
				// 错误拦截
				if($validate(value).special()){
					that.team_name = '';
					that.$toast('不能包含空格、表情、￥、$、%等特殊字符', 2000, 'wap');
					return;
                }
				that.team_name = value;
            },
            // 团队 - 邀请成员 - 生成邀请二维码
			team_invite_ewm: function(){
				let that = this;
				// 获取邀请二维码
				that.$axios.get('/api/member/team/generate_invite_key/')
				.then(function(data) {
					let url =  window.location.protocol +'//'+ window.location.host +'/mobile/invite/';
                    url += "?key=" +  data.data.data;
                    document.getElementById('to_wechat').setAttribute('href', url);
				})
			},
            // 团队 - 成员设置面板 - 通用 - 复选设置
			team_check_select_member: function(index){
                let that = this;
				// 单选处理(转让)
				if(that.team_member_select_type === 'transfer'){
					that.team_member_select_list.forEach(function(item){
						if(item.memberRoleType !== 'team_owner') item.check = false;
					})
				}
				that.$set(that.team_member_select_list[index], 'check', !that.team_member_select_list[index].check);
				// 视图无法更新,强制更新
				that.$forceUpdate();
			},
			// 团队 - 成员设置面板 - 通用 - 保存成员
			team_member_select_save: function(){
				let that = this;
				let list = that.team_member_select_list.filter(item => item.check);
				switch (that.team_member_select_type) {
					case 'had':          // 已有文件夹成员设置
						that.$axios.post('/api/member/team/folder/set_members/',{
							fId: that.current_doc_info.id,
							memberJson: JSON.stringify(list)
						}).then(function(data) {
							if(data.data.code == 2) {
								that.team_member_select_close();
								that.$toast("保存成功", 2000,'wap');
							} else {
								that.$toast(data.data.content, 2000,'wap');
							}
						});
						break;
                    case 'new_folder':        // 新建文件夹设置
                        // 名称校验
                        that.team_folder_name_check();
                        // 错误拦截
                        if(list.length <= 0) return that.$toast('请添加成员',800);
                        that.$axios.post('/api/member/team/folder/create/',{
                            fId: that.current_folder_info.id,
                            name: that.team_folder_name,
                            memberJson: JSON.stringify(list)
                        }).then(function(data) {
                            if(data.data.code == 2) {
                                that.team_create_folder_toggle(false);
                                that.$toast("创建成功", 2000,'wap');
                                data.data.data.time = utils.timeStampDetail(data.data.data.modifyDate / 1000);
                                data.data.data.type = 'creator';
                                that.team_folder_name = '';
                                that.team_member_select_list = [];
                                that.team_member_select_show = false;
                                that.doc_list.unshift(data.data.data);
                            } else {
                                that.$toast(data.data.content, 2000,'wap');
                            }
                        });
                        break;
					case 'transfer':     // 转让成员设置
						that.$axios.post('/api/member/team/transfer_team/',{
							memberId: list[0].memberId,
						}).then(function(data) {
							if(data.data.code == 2) {
								that.team_member_select_close();
								that.$toast("转让成功", 2000,'wap');
								that.team_info.teamRoleType = 'member';
								// 视图无法更新,强制更新
								that.$forceUpdate();
							} else {
								that.$toast(data.data.content, 2000,'wap');
							}
						});
						break;
					default:
						break;
				}
			},
			// 团队 - 成员设置面板 - 通用 - 关闭
			team_member_select_close: function(){
				this.team_member_select_show = false;
				this.team_member_select_list = this.team_member_select_default_list;
            },
            //团队 - 设置弹框 -打开/关闭
            open_team_setting: function(){
                this.$refs.team_setting.show();
            },
            team_info_clear: function(){
                let that = this;
                that.doc_list = [];
                that.team_info = null;
                that.team_all_member_list = [];
                that.current_list_type_obj = {type:"myTeam", name:"我的团队"};
            },
            // 团队文件夹 - 新建 - 打开/关闭
            team_create_folder_toggle: function(type){
                let that = this;
				if(type){
					that.get_team_folder_member(that.current_folder_info.id,function(list){
                        that.team_member_select_show = true;
                        that.team_member_select_type = 'new_folder';
						that.team_folder_name = '新的文件夹';
						$(that.$refs.create_folder_name).focus();
						list = list.filter(item => item.memberRoleType);
						list.forEach(function(item){
							item.check = true;
							if(item.memberId == utils.getCookies('woodo_memberId')) item.isMine = true;
						})
						that.team_member_select_list = list;
						that.$nextTick(function(){
							// document.execCommand('selectAll');
						})
					});
				}else{
					that.team_folder_name = '';
					that.team_member_select_list = [];
				}
            },
            // 团队文件夹 - 新建 - 名称检验
			team_folder_name_check: function(){
				let that = this,
					$input = $(that.$refs.create_folder_name),
					rename = that.team_folder_name;
				if($validate(rename).special()) {
					$input.addClass('wrong');
					$input.focus();
					that.$toast('不能包含空格、表情、￥、$、%等特殊字符', 2000,'wap');
				}else{
					$input.removeClass('wrong');
				}
            },
            // 团队文档 - 成员全选/取消全选
			team_member_select_toggle: function(type){
				let that = this, data = true;
                if(type === 'cancel') data = false;
				that.team_member_select_list.forEach(function(item){
					item.check = data;
					if(['team_owner','creator'].indexOf(item.memberRoleType) > -1 || item.is_mine) item.check = true;
				})
				that.$forceUpdate();
            },
            // 团队文件夹 - 成员设置面板
			team_folder_set_member: function(){
				let that = this;
				that.get_team_folder_member(that.current_doc_info.id,function(list){
                    that.close_all_menu();
					that.team_member_select_show = true;
					that.team_member_select_type = 'had';
					that.team_member_select_list = list;
					that.team_member_select_list.forEach(function(item){
						// 文件夹权限 => 团队所有者 && 文件夹所有者 && 文件夹有权限者
						if(!item.memberRoleType){
							item.check = false;
							item.memberRoleType = 'other';
						}else{
							item.check = true;
						}
					})
				})
            },
            // 团队 - 邀请
			team_invite: function(){
				let that = this;
				// 错误拦截
				if(that.team_member_invitation.added_member.length === 0){
					that.$toast('请邀请你的团队成员！',800,'wap');
					$('.search_member input').focus();
					return;
				}
				that.$axios.post('/api/member/team/invite_member/',{
					memberJson: JSON.stringify(that.team_member_invitation.added_member),
				}).then(function(data) {
					if(data.data.code == 2) {
						let list = data.data.data;
						// 时间戳转日期
						that.timestamp_to_time(list);
						that.team_all_member_list = that.team_all_member_list.concat(list);
						that.team_create_modal_show = false;
						that.$toast('邀请成功', 2000,'wap');
						// 重置数据
						that.team_member_invitation = {
							member: [],
							added_member:[],
							recommend_member:[],
							search_result:[],
							search_keyword: '',
						}
					} else {
						that.$toast(data.data.content, 2000,'wap');
					}
				});
            },
            // 团队 - 转让弹框 - 打开/关闭
			team_transfer_modal_toggle: function(){
                let that = this;
                that.get_team_member(function(list){
                    var member_list = list,
                        team_member_select_default_list =list;
                    // 管理者和自己默认不选中，且无法更改
                    member_list.forEach(function(item){
                        item.check = false;
                    })
                    that.team_member_select_type = 'transfer';
                    that.team_member_select_show = true;
                    that.team_member_select_list = member_list;
                });
                that.$forceUpdate();
            },
            // 团队 — 重命名弹框 - 打开/关闭
            open_team_rename: function(){
                let that =this;
                that.$refs.rename.show({id:null},that.team_info.teamName,'team')
            },
        },
    }
</script>