<template>
    <div class="doc-team-contain" v-if="show">

        <div class="head" v-if="team_info || doc_loading">
            <base-button :class="['doc-btn', {'check': team_type === 'doc'}]" width="96" height="40" @click="changeType('doc')">文件库</base-button>
            <base-button :class="['member-btn', {'check': team_type === 'member'}]" width="96" height="40" @click="changeType('member')">团队成员</base-button>
        </div>

        <div class="body">
            <!-- 团队空状态 -->
            <div class="no_team" v-if="!team_info && !doc_loading">
                <span>免费创建并邀请好友加入您的团队，可以更方便的共享文档及资料</span>
                <button @click="team_create_modal_toggle(true)" v-bdtongji="`文档中心-我的团队-居中-居中-创建我的团队`">创建我的团队</button>
            </div>

            <template v-if="team_info && !doc_loading">
                <!-- 团队名称修改 -->
                <div :class="['team_name_edit', {'edit': team_info.teamRoleType === 'team_owner'}]">
                    <input type="text"
                        v-tooltip="team_info.teamRoleType === 'team_owner' ? '重命名' : ''"
                        :disabled="team_info.teamRoleType !== 'team_owner'"
                        :style="{width:team_info.nameWidth + 'px'}"
                        :value="team_info.teamName"
                        @focus="team_name_focus($event)"
                        @input="team_name_check($event.target.value)"
                        @keyup.13="team_rename"
                        @blur="team_rename($event)"
                    >
                </div>

                <!-- 团队成员列表 -->
                <div class="team_member_content" v-if="team_type === 'member'">
                    <!-- 导航栏 -->
                    <div class='nav-bar'>
                        <!-- 团队操作栏 -->
                        <div class="team_member_operation">
                            <!-- 团队拥有者 - 团队设置按钮 -->
                            <template v-if="team_info.teamRoleType === 'team_owner'">
                                <p class="dismiss" @click="team_dismiss">解散团队</p>
                                <p class="transfer" @click="team_transfer_modal_toggle" v-bdtongji="`文档中心-我的团队-团队成员-右侧-转让管理员`">转让团队</p>
                                <button class="invite" @click="team_create_modal_toggle(true)">+邀请成员</button>
                            </template>
                            <template v-else>
                                <!-- 团队成员 - 退出团队 -->
                                <button class="quit" @click="team_quit" v-bdtongji="`文档中心-我的团队-团队成员-右上角-退出团队`">退出团队</button>
                            </template>
                        </div>
                    </div>
                    <!-- 列表title栏 -->
                    <div class="team_card title_card">
                        <!-- 列表左侧 -->
                        <div class="card_left_bar">
                            <span class="nickname">姓名</span>
                        </div>
                        <!-- 列表右侧 -->
                        <div class="card_right_bar">
                            <span class="account">账号</span>
                            <span class="time">加入时间</span>
                            <span class="role">角色</span>
                        </div>
                    </div>
                    <div class="scroll_wrapper">
                        <!-- 列表 -->
                        <div class="team_card"
                            v-for='(item,index) in team_all_member_list'
                            :key="index"
                        >
                            <!-- 头像 -->
                            <img class="head" :src="item.memberHead ? item.memberHead : '~@/../public/images/common/default_head.png'" alt="">
                            <!-- 成员昵称 -->
                            <span class="nickname">{{item.memberNickName === '' || !item.memberNickName ? item.memberId: item.memberNickName}}</span>
                            <div class="card_right_bar">
                                <span class="account">{{item.memberUserName}}</span>
                                <span class="time">{{item.time}}</span>
                                <div class="role" v-if="['team_owner'].indexOf(item.memberRoleType) >= 0">
                                    <span class="disabled">管理者</span>
                                </div>
                                <div class="role" v-else
                                    :class="{open:team_info.teamRoleType === 'team_owner', show:team_member_operation_show && team_current_member_index === index}"
                                    @click.stop="team_info.teamRoleType === 'team_owner' && team_member_operation_toggle(index)"
                                >
                                    <span>{{item.memberRole}}</span>
                                    <transition name="modal-fade">
                                        <ul v-if="team_member_operation_show && team_current_member_index === index">
                                            <li v-if="item.memberRoleType === 'wait'" @click.stop="team_wait_member_remove">取消邀请</li>
                                            <li v-else @click.stop="team_member_remove">移除</li>
                                        </ul>
                                    </transition>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- 团队文件库 -->
                <doc-list-main v-else ref="DocListMain"></doc-list-main>
            </template>

            <!-- 加载效果 -->
            <div class="doc-loading" v-show="doc_loading && team_type === 'member'"><img src="~@/assets/pc/images/edit/category_loading.gif"></div>
        </div>

        <!-- 团队 - 创建/邀请成员弹框 -->
		<transition name="modal-fade">
			<div class="create_team_modal" v-if="team_create_modal_show" @click="team_member_invitation_toggle()">
				<div class="create_team_contain" :class="{invite:team_info}">
					<button class="close" @click.stop="team_create_modal_toggle(false)" v-bdtongji="`文档中心-我的团队-居中-居中-创建我的团队-关闭`"></button>
					<div class="header">
						<div class="team_name">
							<input type="text" placeholder="请填写团队名称" ref="create_team_name" @focus="team_name_focus" @input="team_name_check($event.target.value)" v-bdtongji="`文档中心-我的团队-居中-居中-创建我的团队-填写团队名称`">
							<i class="input_border"></i>
						</div>
					</div>
					<div class="body">
						<h1>邀请成员</h1>
						<div class="invite_type_panel">
							<p class="invite_type">
								<a :class="{current:team_invite_type === 'search',disabled:!team_info}" @click="team_change_invite_type('search')">账号邀请成员</a>
								<a v-if="team_info" class="link" :class="{current:team_invite_type === 'link'}" @click="team_change_invite_type('link')">链接邀请</a>
							</p>
							<!-- 账号邀请 -->
							<div class="search_member" v-if="team_invite_type === 'search'">
								<input type="text" placeholder="请输入手机号/邮箱/用户ID邀请成员"
									ref="search_member_input"
									@input="team_search_member($event)"
									v-bdtongji="`文档中心-我的团队-居中-居中-创建我的团队-邀请成员`"
								>
								<i class="clear_input" v-if="team_member_invitation.search_keyword !== ''" @click.stop="team_clear_search_member"></i>
							</div>
							<!-- 链接邀请 -->
							<div class="search_member" v-if="team_invite_type === 'link'">
								<input class="disabled" type="text" :placeholder="team_invite_url">
								<a :class="{disabled:!team_invite_key_limit}" v-clipboard:copy="team_invite_url" v-clipboard:success="refresh_team_invite" v-clipboard:error="onError">{{team_invite_tip}}</a>
								<p>注意: 任何看到邀请链接的人,都可以申请加入团队</p>
							</div>
						</div>
						<div class="search_member_result">
							<p v-if="team_member_invitation.search_keyword === ''">已邀请</p>
							<!--列表（已邀请）-->
							<div class="partner_item"
									v-if="team_member_invitation.added_member.length > 0 && team_member_invitation.search_keyword === ''"
									v-for="(member,index) in team_member_invitation.added_member"
									:class={checked:member.open}
									:key='index'
									@click.stop
							>
								<img class="partner_head" v-if="member.invitee || member.head === '' || !member.head" src="~@/../public/images/common/default_head.png" alt="">
								<img class="partner_head" v-else :src="member.head" alt="">
								<span class="partner_name" v-if="member.invitee">{{member.invitee}}</span>
								<span class="partner_name" v-else-if="member.nickName === '' || !member.nickName">{{member.memberId}}</span>
								<span class="partner_name" v-else>{{member.nickName}}</span>
								<span class="invitee_partner" v-if="member.invitee">外部</span>
								<div class="partner_invitation" @click="team_member_invitation_toggle(index)">
									<a>待接收邀请</a>
									<transition name="modal-fade">
										<ul v-if="team_member_delete_show && member.open">
											<li @click="team_member_delete(index)">移除</li>
										</ul>
									</transition>
								</div>
							</div>
							<!--列表（搜索）-->
							<div class="partner_item"
									v-if="team_member_invitation.search_result.length > 0 && team_member_invitation.search_keyword !== ''"
									v-for="(member,index) in team_member_invitation.search_result"
									:class={checked:member.open}
									:key='index'
									@click.stop
							>
								<img class="partner_head" v-if="member.invitee || member.head === '' || !member.head" src="~@/../public/images/common/default_head.png" alt="">
								<img class="partner_head" v-else :src="member.head" alt="">
								<span class="partner_name" v-if="member.invitee">{{member.invitee}}</span>
								<span class="partner_name" v-else-if="member.nickName === '' || !member.nickName">{{member.memberId}}</span>
								<span class="partner_name" v-else>{{member.nickName}}</span>
								<span class="invitee_partner" v-if="member.invitee">外部</span>
								<div class="partner_invitation disabled" v-if="member.isTeamMember"><a>已加入</a></div>
								<div class="partner_invitation disabled" v-else-if="member.isInvited"><a>待接收邀请</a></div>
								<div class="partner_invitation" v-else-if="member.added" :class="{open:team_member_delete_show && member.open}" @click="team_member_invitation_toggle(index)">
									<a>待接收邀请</a>
									<transition name="modal-fade">
										<ul v-if="team_member_delete_show && member.open">
											<li @click="team_member_delete(member,'search')">移除</li>
										</ul>
									</transition>
								</div>
								<a class="add_partner_btn" v-else @click="team_add_interim_member(member)">邀请</a>
							</div>
							<!--空状态-->
							<div class="empty_member"
									v-if="(team_member_invitation.search_keyword === '' && team_member_invitation.added_member.length <= 0) || (team_member_invitation.search_keyword !== '' && team_member_invitation.search_result.length <= 0)"
							>
								<p>無</p>
								<span v-if="team_member_invitation.search_keyword === ''">暂无成员</span>
								<span v-else>没有搜索结果</span>
							</div>
						</div>
					</div>
					<div class="footer">
						<!-- 邀请成员 -->
						<template v-if="team_info">
							<button class="wechat_btn" @mouseover="team_invite_ewm">微信邀请成员</button>
							<div class="add_member_ewm">
								<div class="code_outer">
									<div id='member_code'></div>
									<canvas id="team_invitation_ewm_canvas"></canvas>
								</div>
								<span>微信扫码邀请好友</span>
							</div>
							<button class="ok_btn"
								:class="{unable:team_member_invitation.added_member.length <= 0 || team_name == ''}"
								@click="team_invite"
							>保存</button>
						</template>
						<!-- 创建团队 -->
						<template v-else>
							<button class="ok_btn"
								:class="{unable:(team_info ? team_member_invitation.added_member.length <= 0 : team_member_invitation.added_member.length < 0) || team_name == ''}"
								@click="team_create"
								v-bdtongji="`文档中心-我的团队-居中-居中-创建我的团队-立即创建`"
							>立即创建</button>
						</template>
					</div>
				</div>
			</div>
		</transition>

		<!-- 团队 - 成员设置弹框(文件夹 权限 转让) -->
		<transition name="modal-fade">
			<div class="folder_member_modal" v-if="team_member_select_show">
				<div class="folder_member_contain" :class="team_member_select_type">
					<div class="header">
						<template v-if="team_member_select_type === 'transfer'">
							<h1>转让团队</h1>
							<p>请选择转让对象</p>
						</template>
						<template v-else-if="team_member_select_type === 'power'">
							<h1>添加成员</h1>
							<p>团队所有成员（{{team_member_select_list.length}}人）</p>
							<span>管理员可以邀请和移除项目成员，只有被邀请的成员才能访问该文档的权限。</span>
						</template>
						<template v-else>
							<h1>成员设置</h1>
							<p>参与者人数（{{team_member_select_list.filter(item => item.check).length}}/{{team_member_select_list.length}}人）</p>
							<span>勾选进行设置</span>
						</template>
					</div>
					<div class="body">
						<ul class="member_list_contain">
							<li v-for="(item,index) in team_member_select_list" :key="index" :class="{disabled:(['team_owner','creator'].indexOf(item.memberRoleType) >= 0 || item.is_mine),checked:item.check == true}" @click="team_check_select_member(index)"><i></i>{{item.memberNickName}}</li>
						</ul>
					</div>
					<div class="footer">
						<template v-if="team_member_select_type === 'transfer'">
							<button class="save" :class="{disabled:team_member_select_list.filter(data => data.check).length !== 1}" @click="team_member_select_save">确认转让</button>
							<button class="cancel" @click="team_member_select_close">取消</button>
						</template>
						<template v-else>
							<button class="cancel" @click="team_member_select_close">{{['power'].indexOf(team_member_select_type) >= 0 ? '返回' : '取消'}}</button>
							<button class="save" @click="team_member_select_save">保存</button>
						</template>
					</div>
				</div>
			</div>
		</transition>

        <!-- 团队 - 新建文件夹弹框 -->
		<transition name="modal-fade">
			<div class="create_team_folder_modal" v-if="team_folder_create_show">
				<div class="create_folder_contain" @click="team_member_invitation_toggle()">
					<div class="header">
						<p>新建文件夹</p>
					</div>
					<div class="body">
						<div class="folder_name">
							<p>文件夹名称</p>
							<input type="text" placeholder="请填写文件夹名称"
								ref="create_folder_name"
								v-model="team_folder_name"
								@input="team_folder_name_check($event)"
							>
							<i class="clear_input" v-if="team_folder_name !== ''" @click.stop="team_clear_search_member"></i>
						</div>
						<div class="folder_member_result">
							<p>添加成员（共{{team_member_select_list.filter(item => item.check).length}}人）</p>
							<p class="right">
								<a @click="team_member_select_toggle('all')">全选 | </a>
								<a @click="team_member_select_toggle('cancel')">取消全选</a>
							</p>
							<!--列表（已邀请）-->
							<div class="partner_list" v-if="team_member_select_list.length > 0">
								<!--团队成员列表-->
								<div class="partner_item"
									 v-for="(item,index) in team_member_select_list"
									 :key="index"
									 :class="{check:item.check,disabled:['team_owner','creator'].indexOf(item.memberRoleType) > -1 || item.isMine}"
									 @click="team_check_select_member(index)"
								>
									<img class="partner_head" v-if="item.memberHead === '' || !item.memberHead" src="~@/../public/images/common/default_head.png" alt="">
									<img class="partner_head" v-else :src="item.memberHead" alt="">
									<span class="partner_name" v-if="item.memberNickName === '' || !item.memberNickName">{{item.memberId}}</span>
									<span class="partner_name" v-else>{{item.memberNickName}}</span>
									<a class="partner_check" :class="{checked:item.check}"></a>
								</div>
							</div>
						</div>
						<div class="create_folder_foot">
							<button class="cancel_btn" @click.stop="team_create_folder_toggle(false)">取消</button>
							<button class="ok_btn"
								:class="{unable:team_member_select_list.length <= 0 || team_folder_name == ''}"
								:disable="team_member_select_list.length <= 0 || team_folder_name == ''"
								@click.stop="team_folder_create"
							>确认</button>
						</div>
					</div>
				</div>
			</div>
		</transition>
    </div>
</template>

<script>
import Vue from 'vue';
import QRCode from 'qrcode';
import DocListMain from '@/views/pc/DocCenter/DocListMain.vue';
Vue.use(QRCode);
export default {
    name: 'docTeam',
    components:{
        DocListMain
    },
    props: {
        show: {
            type: Boolean,
            default: false
        }
    },
    inject: ["center"],
    provide() {
        return {
            center: this.center,
            parent: this,
        };
    },
    watch: {
        show(v){
            if (v) {
                this.open();
            }
        },
    },
    data(){
        return{
            team_type: 'doc',
            doc_loading: true,

            /* 团队相关 */
            team_info: null,                      // 团队信息
            team_name: '',                        // 团队名称
            team_create_modal_show: false,        // 团队创建弹框展示标识
            team_member_delete_show: false,       // 团队成员移除菜单
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
            team_ewm_had_created: false,          // 团队邀请成员二维码是否生成标识
            team_member_select_show: false,       // 团队文件夹成员设置弹框标识
            team_member_select_list: [],          // 团队文件夹成员列表(文件夹成员设置时使用)
            team_member_select_default_list: [],  // 团队文件家成员列表(初始)
            team_folder_create_show: false,       // 团队文件夹新建弹框标识
            team_folder_name: '',                 // 团队新建文件夹名称
            team_member_select_type:'had',        // 团队成员设置面板状态(had:已有文件夹成员设置; power:权限成员设置; transfer:转让)
            team_member_list:[],                  // 团队成员列表(不包括待加入)
            team_all_member_list:[],              // 团队所有成员列表(包括带待加入)
            team_member_operation_show: false,    // 团队成员列表 - 成员下拉菜单标识
            team_current_member_index: '',        // 团队成员列表 - 当前选中成员
            team_invite_type:'search',            // 团队邀请方式（search:账号，link:链接）
            team_invite_url: null,                // 团队邀请链接
            team_invite_tip: "复制",              // 获取邀请key文本
            team_invite_key_limit: true,          // 能否获取邀请key标识
            team_invite_key_countdown:5,          // 获取邀请key倒计时
            team_invite_key_interval: null,       // 获取邀请key倒数计时器
        }
    },
    methods: {
        open() {
            this.get_team_info();
        },
        // 复制链接失败
        onError() {this.$toast("复制失败", 2000);},
        // 切换面板类型
        changeType(type) {
            this.team_type = type;
        },
        // 时间戳转日期
        timestamp_to_time: function(arr) {
            for(let i = 0; i < arr.length; i++) {
                if(arr[i].modifyDate){
                    arr[i].time = this.$common.timeStampDetail(arr[i].modifyDate / 1000);
                }else if(arr[i].createDate){
                    arr[i].time = this.$common.timeStampDetail(arr[i].createDate / 1000);
                }
                arr[i].topTime = arr[i].topTime ? arr[i].topTime : 0;
            }
        },
        // 团队 - 团队信息获取
        get_team_info() {
            let that = this;
            that.doc_loading = true;
            that.$axios.get('/api/member/team/base_msg/').then(result => {
                let data = result.data;
                that.doc_loading = false;
                if (data.code == 2) {
                    that.team_info = data.data;
                    if (data.data) { 
                        that.team_member_render();
                        that.team_name_calculate_width(data.data.teamName);
                    }
                }
            }).catch((err)=>{
                console.log(err);
                that.doc_loading = false;
                that.$toast('获取团队信息失败', 800);
            });
        },
        // 团队 - 获取团队成员列表(不包括待加入)
        get_team_member: function(callback){
            let that = this;
            that.$axios.get('/api/member/team/members/')
            .then(function(data) {
                if(data.data.code == 2) {
                    let member_list = data.data.data;
                    that.doc_loading = false;
                    if(member_list.length === 0) return false;
                    // 时间戳转日期
                    that.timestamp_to_time(member_list);
                    that.team_member_list = member_list;
                    // 标记自己
                    member_list.forEach(function(item,index){
                        if(item.memberId == that.$common.get_cookies('woodo_memberId')){
                            item.is_mine = true;
                        }
                    });
                    if(typeof callback === 'function') callback(member_list);
                } else {
                    that.doc_loading = false;
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
                        $('.team_name input').focus();
                    }, 500);
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
                that.team_ewm_had_created = false;
                that.team_invite_type = 'search';
                that.team_invite_key_limit = true;
                that.team_invite_tip = '复制';
                that.team_invite_key_countdown = 5;
                clearInterval(that.team_invite_key_interval);
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
                        that.$toast(data.data.content, 800);
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
                that.$toast('请填写正确的团队名称！',800);
                $('.team_name input').focus();
                return false;
            }
            that.$axios.post('/api/member/team/create/',{
                name: that.team_name,
                memberJson: JSON.stringify(that.team_member_invitation.added_member),
            }).then(function(data) {
                if(data.data.code == 2) {
                    that.$toast("团队创建成功", 2000);
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
                    // 计算团队名称长度
                    that.team_name_calculate_width(that.team_name);
                } else {
                    that.$toast(data.data.content, 2000);
                }
            });
        },
        // 团队 - 邀请 - 获取邀请key
        team_invite_key: function(type, callback){
            this.$axios.get(`/api/member/team/generate_invite_key/?type=${type}`)
            .then(function(data) {
                if(typeof callback === 'function') callback(data.data);
            })
        },
        // 团队 - 邀请成员 - 方式切换
        team_change_invite_type:function(type){
            let that = this;
            that.team_invite_type = type;
            if (type === 'link') {
                //清除账号邀请成员输入框内容
                that.$refs.search_member_input.value = '';
                //清除搜索列表
                that.team_member_invitation.search_keyword = '';
                //清除搜索结果列表
                that.team_member_invitation.search_result = [];
                if (!that.team_invite_url) {
                    that.team_invite_key('link',function(data){
                        let url =  window.location.protocol +'//'+ window.location.host +'/home/?type=join_team';
                        url += "&key=" +  data.data;
                        url += "&ownerName=" +  that.$common.get_cookies('woodo_memberNickName');
                        that.team_invite_url = url;	
                    });
                }
            }
        },
        // 团队 - 邀请成员 - 链接更新
        refresh_team_invite: function(){
            let that = this;
            if(!that.team_invite_key_limit) return that.$toast('您的请求过于频繁,请稍后再试',1000);
            that.team_invite_key('link',function(data){
                clearInterval(that.team_invite_key_interval);
                if(data.content === '您的请求过于频繁,请稍后再试~'){
                    that.$toast('您的请求过于频繁,请稍后再试',1000);
                    that.team_invite_key_limit = false;
                    that.team_invite_tip = that.team_invite_key_countdown + '秒后重试';
                    that.team_invite_key_interval = setInterval(function(){that.team_invite_key_timeout()},1000);
                }else{
                    that.$toast('复制成功',1000);
                    let url =  window.location.protocol +'//'+ window.location.host +'/home/?type=join_team';
                    url += "&key=" +  data.data;
                    url += "&ownerName=" +  that.$common.get_cookies('woodo_memberNickName');
                    that.team_invite_url = url;
                }
            })
        },
        // 团队 - 邀请成员 - 生成邀请二维码
        team_invite_ewm: function(){
            let that = this;
            // 获取邀请二维码
            if(that.team_ewm_had_created) return;
            let url =  window.location.protocol +'//'+ window.location.host +'/mobile/invite/';
            that.team_invite_key('wechat',function(key){
                url += "?key=" +  key;
                let $canvas = document.getElementById('team_invitation_ewm_canvas');
                QRCode.toCanvas($canvas, url, {width:146}, function(error) {if(error) console.error(error);});
                that.team_ewm_had_created = true;
            })
        },
        // 获取验证码倒计时
        team_invite_key_timeout:function() {
            if(this.team_invite_key_countdown <= 1){
                this.team_invite_key_limit = true;
                this.team_invite_tip = '复制';
                this.team_invite_key_countdown = 5;
                clearInterval(this.team_invite_key_interval);
            }else{
                this.team_invite_key_countdown--;
                this.team_invite_tip = this.team_invite_key_countdown + '秒后重试';
            }
        },
        // 团队 - 成员 - 清除搜索
        team_clear_search_member:function(){
            // 清除输入框
            if(this.$refs.search_member_input) this.$refs.search_member_input.value = '';
            // 清除搜索关键词
            this.team_member_invitation.search_keyword = '';
            this.team_folder_name = '';
            // 清除搜索结果列表
            this.team_member_invitation.search_result = [];
        },
        // 团队 - 成员 - 临时添加
        team_add_interim_member: function(member){
            let that = this;
            let add_list = that.team_member_invitation.added_member;
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
            let that = this;
            let team_obj = that.team_member_invitation;
            let data = false;
            if(typeof index === 'undefined'){
                that.team_member_delete_show = false;
                if(team_obj.search_result.length > 0){
                    team_obj.search_result.forEach(function(item){item.open=false;});
                }else{
                    team_obj.added_member.forEach(function(item){item.open=false;});
                }
            }else{
                that.team_member_delete_show = !that.team_member_delete_show;
                if(that.team_member_delete_show) data = true;
                if(team_obj.search_result.length > 0){
                    team_obj.search_result[index].open = data;
                }else{
                    team_obj.added_member[index].open = data;
                }
            }
        },
        // 团队 - 临时成员 - 移除(创建/新建文件夹通用)
        team_member_delete: function(index,type){
            let that = this,team_obj = that.team_member_invitation;
            // 创建团队移除
            if(type === 'search'){
                team_obj.search_result.forEach(function(search){
                    team_obj.added_member.forEach(function(added,_index){
                        if(search.memberId === added.memberId && search.invitee === added.invitee && search.nickName === search.nickName) index = _index;
                    })
                })
            }
            // 其他
            else{
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
            // 计算标题长度
            if(that.team_info) that.team_name_calculate_width(value);
            // 错误拦截
            if($validate(value).special()){
                that.team_name = '';
                $('.input_border').css('background-color','#fb5959');
                that.$toast('不能包含空格、表情、￥、$、%等特殊字符', 2000);
                return;
            }
            if(value.length > 10){
                $('.input_border').css('background-color','#fb5959');
                value = value.slice(0,10)
                that.$toast('不能超过10个字噢！', 2000);
            }
            $('.input_border').css('background-color','#fff');
            that.team_name = value;
        },
        // 团队 - 名称 - 长度计算
        team_name_calculate_width: function(value){
            let that = this;
            let $sensor = $('<pre style="font-size:20px">'+ value +'</pre>').css({display: 'none'});
            $('body').append($sensor);
            let title_width = $sensor.width();
            $sensor.remove();
            that.team_info.nameWidth = title_width + 10;
            that.team_name = value;
            $('.team_name_edit input').css('width',title_width + 10 + 'px')
        },
        // 团队 - 名称 - 重命名
        team_rename: function(e){
            let that = this;
            $(e.target).parents('.team_name_edit').removeClass('focus');
            if(that.team_name == ''){
                that.$toast('请输入正确的团队名称!',2000);
                $('.team_name_edit input').focus();
                return false;
            }
            // 未更改时不请求接口
            if(that.team_name === that.team_info.teamName) return;
            that.$axios.post('/api/member/team/rename/',{
                name: that.team_name,
            }).then(function(data) {
                if(data.data.code == 2) {
                    that.team_info.teamName = that.team_name;
                    that.$toast("团队重命名成功", 2000);
                } else {
                    that.$toast(data.data.content, 2000);
                }
            });
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
        // 团队 - 成员设置面板 - 通用 - 保存成员(文件夹成员设置 || 权限设置 || 转让)
        team_member_select_save: function(){
            let that = this;
            let member_list = that.team_member_select_list.filter(item => item.check);
            switch (that.team_member_select_type) {
                case 'had':          // 已有文件夹成员设置
                    that.$axios.post('/api/member/team/folder/set_members/',{
                        fId: that.$refs.DocListMain.current_doc_info.id,
                        memberJson: JSON.stringify(member_list)
                    }).then(function(data) {
                        if(data.data.code == 2) {
                            that.team_member_select_close();
                            that.$toast("保存成功", 2000);
                        } else {
                            that.$toast(data.data.content, 2000);
                        }
                    });
                    break;
                case 'power':        // 权限成员设置
                    that.$refs.DocListMain.team_doc_partner_set(member_list, () => {
                        that.team_member_select_show = false;
                    });
                    break;
                case 'transfer':     // 转让成员设置
                    that.$axios.post('/api/member/team/transfer_team/',{
                        memberId: member_list[0].memberId,
                    }).then(function(data) {
                        if(data.data.code == 2) {
                            that.team_member_select_close();
                            that.$toast("转让成功", 2000);
                            that.team_info.teamRoleType = 'member';
                            that.get_team_member();
                            // 视图无法更新,强制更新
                            that.$forceUpdate();
                        } else {
                            that.$toast(data.data.content, 2000);
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
            if(this.team_member_select_type === 'power') this.$refs.DocListMain.show_authority = false;
        },
        // 团队 - 成员列表面板 - 数据渲染
        team_member_render: function(){
            let that = this;
            that.get_team_member(function(list){
                that.$axios.get('/api/member/team/wait_join_members/')
                .then(function(data) {
                    if(data.data.code == 2) {
                        let member_list = data.data.data;
                        if (member_list.length === 0) return that.team_all_member_list = list;
                        // 时间戳转日期
                        that.timestamp_to_time(member_list);
                        that.team_all_member_list = list.concat(member_list);
                    } else {
                        that.$toast(data.data.content, 2000);
                    }
                });
            })
        },
        // 团队 - 成员列表面板 - 成员菜单打开/隐藏
        team_member_operation_toggle: function(index){
            this.team_member_operation_show = !this.team_member_operation_show;
            if(this.team_member_operation_show){
                this.team_current_member_index = index;
            }else{
                this.team_current_member_index = '';
            }
        },
        // 团队 - 成员列表面板 - 已加入成员移除
        team_member_remove: function(){
            let that = this;
            // 提示内容：
            that.$modal({
                modalClass: 'team-modal',
                modalTitle: '移除成员',
                modalContent: `<p>被移除的成员，将不能再访问团队信息，归TA所有的文档将转移给管理员，您还可以重新邀请他加入团队。</p>`,
                buttonSubmitTxt: '移除',
                submitCallback (modal) {
                    that.$axios.post('/api/member/team/remove_member/',{
                        memberId: that.team_all_member_list[that.team_current_member_index].memberId,
                    }).then(function(data) {
                        if(data.data.code == 2) {
                            that.$toast("移除成功", 2000);
                            modal.close();
                            that.team_all_member_list.splice(that.team_current_member_index,1)
                            that.team_current_member_index = '';
                        } else {
                            that.$toast(data.data.content, 2000);
                        }
                    });
                },
            });
        },
        // 团队 - 成员列表面板 - 待加入成员移除
        team_wait_member_remove: function(){
            let that = this;
            // 提示内容：
            that.$modal({
                modalClass: 'team-modal',
                modalTitle: '取消邀请成员',
                modalContent: `<p>被取消邀请的成员，邀请链接将失效，您还可以重新邀请他加入团队。</p>`,
                buttonSubmitTxt: '确定',
                submitCallback (modal) {
                    that.$axios.post('/api/member/team/cancel_invite/',{
                        inviteLogId: that.team_all_member_list[that.team_current_member_index].inviteLogId,
                    }).then(function(data) {
                        if(data.data.code == 2) {
                            that.$toast("取消邀请成功", 2000);
                            modal.close();
                            that.team_all_member_list.splice(that.team_current_member_index,1)
                            that.team_current_member_index = '';
                        } else {
                            that.$toast(data.data.content, 2000);
                        }
                    });
                },
            });
            
        },
        // 团队 - 转让弹框 - 打开/关闭
        team_transfer_modal_toggle: function(){
            let that = this;
            that.team_member_select_show = true;
            that.team_member_select_default_list = that.team_member_list;
            // 管理者和自己默认不选中，且无法更改
            that.team_member_list.forEach(function(item){
                item.check = false;
            })
            that.team_member_select_list = that.team_member_list;
            that.team_member_select_type = 'transfer';
        },
        // 团队 - 邀请
        team_invite: function(){
            let that = this;
            // 错误拦截
            if(that.team_member_invitation.added_member.length === 0){
                that.$toast('请邀请你的团队成员！',800);
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
                    // 重置数据
                    that.team_member_invitation = {
                        member: [],
                        added_member:[],
                        recommend_member:[],
                        search_result:[],
                        search_keyword: '',
                    }
                } else {
                    that.$toast(data.data.content, 2000);
                }
            });
        },
        // 团队 - 解散
        team_dismiss: function(){
            let that = this;
            that.$modal({
                modalClass: 'team-modal team-dismiss-modal',
                modalTitle: '解散团队',
                modalContent: `<p>注意：解散团队后，所有该目录下的文档都将被删除，请谨慎操作！</p>`,
                buttonSubmitTxt: '解散',
                submitCallback (modal) {
                    that.$axios.post('/api/member/team/dissolution_team/')
                    .then(function(data) {
                        if(data.data.code == 2) {
                            that.$toast("团队解散成功", 2000);
                            modal.close();
                            that.team_member_list = [];
                            that.team_all_member_list = [];
                            that.team_info = null;
                            // 跳转到文件库
                            that.teamPanelChange('doc');
                        } else {
                            that.$toast(data.data.content, 2000);
                        }
                    });
                },
            });
        },
        // 团队 - 退出
        team_quit: function(){
            let that = this;
            that.$modal({
                modalClass: 'team-modal',
                modalTitle: '退出团队',
                modalContent: `<p>注意：退出团队后，所有你在该目录下拥有的文档都将转移给管理员，请谨慎操作！</p>`,
                buttonSubmitTxt: '退出',
                submitCallback (modal) {
                    that.$axios.post('/api/member/team/exit_team/')
                    .then(function(data) {
                        if(data.data.code == 2) {
                            that.$toast("退出团队成功", 2000);
                            modal.close();
                            that.team_info = null;
                            // 跳转到文件库
                            that.teamPanelChange('doc');
                        } else {
                            that.$toast(data.data.content, 2000);
                        }
                    });
                },
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
                        if(item.memberId == that.$common.get_cookies('woodo_memberId')){
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
        // 团队文件夹 - 成员设置面板 (子组件调用)
        team_folder_set_member: function(id){
            let that = this;
            that.get_team_folder_member(id,function(list){
                that.show_options_box = false;
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
        // 团队文件夹 - 新建 - 打开/关闭
        team_create_folder_toggle: function(type){
            let that = this;
            that.team_folder_create_show = type;
            if(type){
                that.get_team_folder_member(that.$refs.DocListMain.current_folder_info.id,function(list){
                    that.team_folder_name = '新的文件夹';
                    $(that.$refs.create_folder_name).focus();
                    list = list.filter(item => item.memberRoleType);
                    list.forEach(function(item){
                        item.check = true;
                        if(item.memberId == that.$common.get_cookies('woodo_memberId')) item.isMine = true;
                    })
                    that.team_member_select_list = list;
                    that.$nextTick(function(){
                        document.execCommand('selectAll');
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
                that.$toast('不能包含空格、表情、￥、$、%等特殊字符', 2000);
            }else{
                $input.removeClass('wrong');
            }
        },
        // 团队文件夹 - 新建 - 提交
        team_folder_create: function(){
            let that = this,
                list = that.team_member_select_list.filter(item => item.check);
            // 名称校验
            that.team_folder_name_check();
            // 错误拦截
            if(list.length <= 0) return that.$toast('请添加成员',800);
            that.$axios.post('/api/member/team/folder/create/',{
                fId: that.$refs.DocListMain.current_folder_info.id,
                name: that.team_folder_name,
                memberJson: JSON.stringify(list)
            }).then(function(data) {
                if(data.data.code == 2) {
                    that.team_create_folder_toggle(false);
                    that.$toast("创建成功", 2000);
                    data.data.data.time = that.$common.timestamp(data.data.data.modifyDate / 1000);
                    data.data.data.type = 'creator';
                    that.team_folder_name = '';
                    that.team_member_select_list = [];
                    that.$refs.DocListMain.document_list.unshift(data.data.data);
                } else {
                    that.$toast(data.data.content, 2000);
                }
            });
        },
        // 团队文档 - 权限设置 - 添加成员弹框打开/关闭 (子组件调用)
        team_authority_modal_show: function(){
            let that = this;
            // 获取成员列表（全部）
            that.get_team_member(function(list){
                that.team_member_select_show = true;
                that.team_member_select_default_list = list;
                list.forEach(function(item){
                    if(item.memberRoleType === 'team_owner'){
                        item.check = true;
                        item.order = 0;
                    }else if(item.is_mine){
                        item.check = true;
                        item.order = 1;
                    }else if(that.$refs.DocListMain.interim_authority.partner.filter(added => added.memberId === item.memberId).length > 0){
                        item.check = true;
                        item.order = 2;
                    }else{
                        item.check = false;
                        item.order = null;
                    }
                })
                list = list.sort(function(a,b){
                    return a.order - b.order;
                });
                that.team_member_select_list = list;
                that.team_member_select_type = 'power';
                that.$refs.DocListMain.show_authority = false;
            });
        },
        // 团队文档 - 权限设置 - 成员全选/取消全选
        team_member_select_toggle: function(type){
            let that = this, data = true;
            if(type === 'cancel') data = false;
            that.team_member_select_list.forEach(function(item){
                item.check = data;
                if(['team_owner','creator'].indexOf(item.memberRoleType) > -1 || item.is_mine) item.check = true;
            })
        },
    },

}
</script>

<style lang="less" scoped>
@new_icon: url(~@/assets/pc/images/doc/icon_2.3.0.png) no-repeat;
.doc-team-contain{
    height: 100vh;
    padding: 20px 35px;
    overflow: hidden;
    & > .head{
        margin-bottom: 30px;
        .base-button{
            margin-right: 10px;
            &.check{
                color: var(--mainColor);
                background: rgba(0,95,255,0.10);
            }
        }
    }
    & > .body{
        height: 100%;
        .no_team{
            margin-top: 200px;
            text-align: center;
            span{
                display: block;
                padding: 300px 0 0;
                background: url(~@/assets/pc/images/doc/no_team.png) no-repeat top center;
                font-size:16px;
                color: #686877;
            }
            button{
                width: 220px;
                height: 56px;
                margin-top:30px;
                background-color: #ffffff;
                box-shadow: 0 5px 10px 0 rgba(0, 0, 0, 0.07);
                border-radius: 4px;
                border: solid 1px rgba(172, 172, 186, 0.44);
                text-align:center;
                color:#686877;
                font-size:18px;
                font-weight:bold;
                &:hover{
                    opacity:.7;
                }
            }
        }
        // 列表加载动效
		.doc-loading{
			position: absolute;
			top: 150px;
			left: calc(50% - 25px);
			width: 50px;
			height: 50px;
			text-align: center;
		}
    }
    // 团队名称
    .team_name_edit{
        position: absolute;
        top: 90px;
        height: 40px;
        line-height: 40px;
        &.edit{
            &::after{
                content:"";
                opacity:0;
                position:absolute;
                bottom: 7px;
                right: -14px;
                width:12px;
                height:12px;
                background:url(~@/assets/pc/images/doc/icon_2.4.0.png) no-repeat -97px -151px;
                transition:all .3s;
            }
            &:hover::after{
                opacity:1;
            }
            input{
                border-bottom:1px dashed transparent;
                &:hover{
                    border-bottom:1px dashed #888d95;
                }
                &:focus{
                    border-bottom:1px dashed var(--mainColor);
                }
            }
        }
        &.focus::after{
            opacity:1;
        }
        input{
            display:inline-block;
            vertical-align:middle;
            line-height:30px;
            min-width:80px;
            font-size:20px;
            font-weight:bold;
            color:#41454a;
        }
    }
    // 团队成员列表
    .team_member_content{
        .nav-bar{
            text-align: right;
            height: 40px;
            line-height: 40px;
            // 成员设置栏
			.team_member_operation{
				width: auto;
				user-select:none;
				p{
					display:inline-block;
					vertical-align:middle;
					font-size:12px;
					color:#6d7887;
					cursor:pointer;
					&:hover{
						color:var(--mainColor);
					}
				}
				button{
					width:110px;
					height:36px;
					line-height:34px;
					margin-left:32px;
					color:#626b78;
					text-align:center;
					font-size:14px;
					font-weight:bold;
					background:transparent;
					border-radius:19px;
					border:1px solid #d7dee7;
					transition:all .3s;
					&:hover{
						opacity:.7;
					}
					&.invite:hover{
						background:var(--mainColor);
						border-color:var(--mainColor);
						color:#fff;
						opacity:1;
					}
				}
				.dismiss::after{
					content:"";
					display:inline-block;
					vertical-align:middle;
					height:10px;
					width:1px;
					background:#b8bfc8;
					margin:0 13px;
				}
            }
        }
        .title_card{
            font-weight:bold;
            span{
                color: #3c434d;
            }
            .card_left_bar,.card_right_bar{
                line-height:75px;
            }
        }
        .team_card{
            position:relative;
            display: block;
            padding: 0 4px;
            height: 58px;
            line-height: 58px;
            color: #3c434d;
            border-bottom: 1px solid #eee;
            user-select: none;
            .head{
                position:relative;
                display:inline-block;
                vertical-align:middle;
                width:30px;
                height:30px;
                margin-right:12px;
                border-radius:50%;
            }
            .nickname {
                position:relative;
                display:inline-block;
                vertical-align: middle;
                font-size:12px;
            }
            .card_left_bar{
                display:inline-block;
                vertical-align: middle;
                height:100%;
            }
            .card_right_bar{
                position:absolute;
                right:0;
                top:0;
                display:flex;
                width:450px;
                color:#b0b8c3;
                transition: color .3s;
                height:100%;
                span{
                    display: inline-block;
                    vertical-align: top;
                    text-align: left;
                    white-space: nowrap;
                    text-overflow:ellipsis;
                    overflow:hidden;
                    font-size:12px;
                }
                .account{
                    width: 45%;
                }
                .time{
                    width: 38%;
                }
                .role{
                    width: 17%;
                    font-size:12px;
                    text-align:right;
                }
                .open{
                    color:#838f9f;
                    cursor:pointer;
                    &:hover span{
                        opacity:.7;
                    }
                    &::after{
                        content: "";
                        display: inline-block;
                        vertical-align: middle;
                        width: 4px;
                        height: 4px;
                        margin: 0 0 4px 6px;
                        border: 2px solid #838f9f;
                        border-left: transparent;
                        border-top: transparent;
                        transform: rotate(45deg);
                        transition: all 0.2s;
                    }
                    ul{
                        position:absolute;
                        top:48px;
                        right:-4px;
                        width:100px;
                        height:48px;
                        z-index:10;
                        background:#fff;
                        box-shadow: 0 4px 6px 0px rgba(0, 0, 0, 0.07);
                        border: solid 1px rgba(197, 208, 220, 0.4);
                        border-radius: 4px;
                    }
                    li{
                        height:48px;
                        line-height:48px;
                        text-align:center;
                        user-select:none;
                        &:first-child{
                            color:var(--mainColor);
                        }
                        &:last-child{
                            cursor:pointer;
                            &:hover{
                                color:#fb5959;
                            }
                        }
                    }
                }
                .show::after{
                    margin-bottom:0;
                    transform: rotate(225deg);
                }
                .disabled{
                    cursor:default;
                }
                .curtime:hover{
                    color:var(--mainColor);
                }
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
}
</style>