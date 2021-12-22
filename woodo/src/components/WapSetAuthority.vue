<template>
    <div class="authority_contain" v-if="show_authority" @mousedown.stop @click.stop>
        <!--关闭按钮-->
        <div class="head">
            <p @click="close">权限设置</p>
        </div>
        <!--文档权限-->
        <div class="document_authority">
            <p>设置文档权限</p>
            <a class="expire_setting" v-if="show_authority" @click="show_set_expire">设置文档分享有效期</a>
            <div class="authority_content" @click="toggle_document_authority('list')">
                <img src="../assets/wap/images/authority/open.png" alt="" v-if="interim_authority.document.type === 'open'">
                <img src="../assets/wap/images/authority/edit.png" alt="" v-if="interim_authority.document.type === 'edit'">
                <img src="../assets/wap/images/authority/exclusive.png" alt="" v-if="interim_authority.document.type === 'exclusive'">
                <img src="../assets/wap/images/authority/privacy.png" alt="" v-if="interim_authority.document.type === 'privacy'">
                <div class="info">
                    <p>{{interim_authority.document.name}}</p>
                    <span>{{interim_authority.document.describe}}</span>
                    <div class="expire_tip">{{document_expire_time === 0 ? '文档链接已过期' : `文档访问${document_expire_time}有效`}}</div>
                </div>
            </div>
        </div>
        <!--所有人可编辑提示-->
        <div class="edit_tips" v-if="interim_authority.document.type !== 'privacy' && interim_authority.partner.length <= 1">
            <div class="tips_inner">
                <img src="../assets/wap/images/authority/edit_bg.png" alt="">
                <span>协作编辑功能目前仅支持PC端</span>
            </div>
        </div>
        <!--私密提示-->
        <div class="privacy_tips" v-if="interim_authority.document.type === 'privacy'">
            <div class="tips_inner">
                <img src="../assets/common/images/no_power_2.jpg" alt="">
                <p>当前为私密状态</p>
                <p>获得链接及协作的人将无法再查看编辑该文档</p>
            </div>
        </div>
        <!--协作者列表-->
        <div class="partner_bar" v-else>
            <template v-if="authority_obj.type === 'team_move'">
                <p class="title">选择文档成员：{{team_member_select_list.filter(data => data.check).length - 1}}
                    <span class="check_right">
                        <span @click="team_member_select_toggle('all')">全选 | </span>
                        <span @click="team_member_select_toggle('cancel')">取消全选</span>
                    </span>
                </p>
            </template>
            <template v-else>
                <p class="title">
                    指定成员权限：{{interim_authority.partner.length}}
                    <a href="/mobile/hcoin/special/">邀请好友协作文档赢幻币！</a>
                </p>
                <div class="add_partner">
                    <a class="add_partner_btn" v-if="authority_obj.type === 'team_doc'" @click="toggle_add_team_member">+添加指定成员</a>
                    <a class="add_partner_btn" v-else @click="toggle_add_partner">+添加协作成员</a>
                </div>
            </template>
            <div class="partner_list">
                <template v-if="authority_obj.type === 'team_move'">
                    <!--团队成员列表(不渲染自己)-->
                    <div class="partner_item team"
                            v-for="(item,index) in team_member_select_list"
                            v-if="!item.is_mine"
                            :key="index"
                            :class="{check:item.check,disabled:(['team_owner','creator'].indexOf(item.memberRoleType) >= 0 || item.is_mine)}"
                            @click="team_check_select_member(index)"
                    >
                        <img class="partner_head" v-if="item.memberHead === '' || !item.memberHead" src="../../public/images/common/default_head.png" alt="">
                        <img class="partner_head" v-else :src="item.memberHead" alt="">
                        <span class="partner_name" v-if="item.memberNickName === '' || !item.memberNickName">{{item.memberId}}</span>
                        <span class="partner_name" v-else>{{item.memberNickName}}</span>
                        <a class="partner_check" :class="{checked:item.check}"></a>
                    </div>
                    <!-- 不存在其他团员(只存在自己) -->
                    <div class="no_partner" v-if="team_member_select_list.length === 1">
                        <p>你还没有其他成员哦!</p>
                    </div>
                </template>
                <template v-else>
                    <!--所有者-->
                    <div class="partner_item"
                        v-for="partner in interim_authority.partner"
                        v-if="partner.collaborateRoleType === 'owner'"
                        :class="{checked:partner.checked}"
                    >
                        <img class="partner_head" :src="partner.head" alt="">
                        <span class="partner_name">{{partner.nickName}}</span>
                        <a class="partner_authority"
                        :class="{unable: interim_authority.partner.length <= 1}"
                        @click="interim_authority.partner.length > 1 && change_owner('list')"
                        >所有者</a>
                    </div>
                    <!--协作者列表-->
                    <div class="partner_item"
                        v-else
                        :class="{checked:partner.checked}"
                    >
                        <img class="partner_head" v-if="partner.invitee || partner.head === '' || !partner.head" src="../../public/images/common/default_head.png" alt="">
                        <img class="partner_head" v-else :src="partner.head" alt="">
                        <span class="partner_name" v-if="partner.invitee">{{partner.invitee}}</span>
                        <span class="partner_name" v-else-if="partner.nickName === '' || !partner.nickName">{{partner.memberId}}</span>
                        <span class="partner_name" v-else>{{partner.nickName}}</span>
                        <span class="invitee_partner" v-if="partner.invitee">外部</span>
                        <a class="partner_authority" @click="toggle_partner_authority('list', partner)">{{partner.collaborateRoleName}}</a>
                    </div>
                </template>
            </div>
        </div>
        <!--私密确认面板-->
        <transition name="modal-fade">
            <div class="common_modal" v-if="show_document_authority === 'confirm'">
                <div class="confirm_modal" @click.stop>
                    <p class="title">设置私密</p>
                    <div class="content">
                        设置私密仅自己查看编辑后，获得链接及协作的人都将无法再编辑查看该文档。
                    </div>
                    <div class="btn_bar">
                        <a @click="toggle_document_authority">取消</a>
                        <a @click="sure_document_privacy">确认</a>
                    </div>
                </div>
            </div>
        </transition>
        <!--所有者下拉-->
        <div class="change_owner_panel">
            <transition name="modal-slide-down">
                <div class="authority_modal" v-if="change_owner_step === 'list'" @click="change_owner">
                    <!--下拉面板-->
                    <div class="authority_list" @click.stop>
                        <ul>
                            <li>
                                <p class="change_owner" @click.stop="change_owner('panel')">转让所有权</p>
                            </li>
                        </ul>
                        <div class="cancel" @click="change_owner">取消</div>
                    </div>
                </div>
            </transition>
            <!--选择转让人面板-->
            <transition name="modal-fade">
                <div class="common_modal" v-if="change_owner_step === 'panel'">
                    <div class="list_inner" @click.stop>
                        <p class="title">选择转让对象</p>
                        <ul>
                            <li v-for="partner in interim_authority.partner" v-if="partner.collaborateRoleType !== 'owner' && !partner.invitee"
                                @click="chose_assignor(partner)"
                                :class="{checked: partner.assignor}"
                            >
                                <img class="partner_head" :src="partner.head" alt="">
                                <span class="partner_name">{{partner.nickName}}</span>
                                <div class="chose_box"></div>
                            </li>
                        </ul>
                        <div class="btn_bar">
                            <a @click="change_owner('list')">取消</a>
                            <a @click="change_owner('confirm')">转让</a>
                        </div>
                    </div>
                </div>
            </transition>
            <!--确认面板-->
            <transition name="modal-fade">
                <div class="common_modal" v-if="change_owner_step === 'confirm'">
                    <div class="confirm_modal" @click.stop>
                        <p class="title">确认转让所有权</p>
                        <div class="content">
                            <p>确定要将文档所有者权限转让给</p>
                            <span>{{document_assignor.nickName}}</span>
                            <p>转让后，新的所有者可以管理、移动、编辑文档，也可以删除您的访问权。</p>
                        </div>
                        <div class="btn_bar">
                            <a @click="change_owner">取消</a>
                            <a @click="sure_change_owner">确认</a>
                        </div>
                    </div>
                </div>
            </transition>
        </div>
        <!--协作者权限下拉-->
        <div class="partner_authority_panel">
            <transition name="modal-slide-down">
                <div class="authority_modal" v-if="show_authority_list === 'list'" @click="toggle_partner_authority">
                    <!--权限列表-->
                    <div class="authority_list" @click.stop>
                        <ul>
                            <li v-for="item in partner_authority" :class="{checked:item.type === editing_partner.authority}" @click="checked_partner_authority(item)">
                                <p :class="{remove:item.type === 'remove'}">{{item.name}}</p>
                                <span v-if="item.describe">{{item.describe}}</span>
                                <img v-if="item.type === editing_partner.authority" src="../assets/wap/images/authority/authority_checked.png" alt="">
                            </li>
                        </ul>
                        <div class="cancel" @click="toggle_partner_authority">取消</div>
                    </div>
                </div>
            </transition>
            <!--移除确认面板-->
            <transition name="modal-fade">
                <div class="common_modal" v-if="show_authority_list === 'confirm'">
                    <div class="confirm_modal" @click.stop>
                        <p class="title">确认移除</p>
                        <div class="content">
                            移除后，{{editing_partner.nickName}}将无法访问该演示文档
                        </div>
                        <div class="btn_bar">
                            <a @click="toggle_partner_authority">取消</a>
                            <a @click="sure_remove_partner">确认</a>
                        </div>
                    </div>
                </div>
            </transition>
        </div>
        <!--添加协作者-->
        <div class="add_partner_panel" v-if="add_partner">
            <div class="header">
                <a class="back" @click="toggle_add_partner"></a>
                <div class="search_input">
                    <input type="text" placeholder="输入手机、邮箱昵称添加协作成员" ref="search_partner_input" @input="search_partner">
                </div>
                <a id="to_wechat" class="to_wechat"><span>选择微信好友</span></a>
            </div>
            <div class="add_panel" :style="{height: interim_authority.search_result.length > 0 || interim_authority.search_keyword !== '' ? 'calc(100% - 8rem)' : ''}">
                <div class="recommend_partner" v-if="!(interim_authority.search_result.length > 0 && interim_authority.search_keyword !== '')">最近协作的好友</div>
                <!--列表（已添加）-->
                <div class="partner_item checked"
                     v-if="interim_authority.added_partner.length > 0 && interim_authority.search_keyword === ''"
                     v-for="partner in interim_authority.added_partner"
                     @click="add_interim_partner(partner)"
                >
                    <img class="partner_head" v-if="partner.invitee || partner.head === '' || !partner.head" src="../../public/images/common/default_head.png" alt="">
                    <img class="partner_head" v-else :src="partner.head" alt="">
                    <span class="partner_name" v-if="partner.invitee">{{partner.invitee}}</span>
                    <span class="partner_name" v-else-if="partner.nickName === '' || !partner.nickName">{{partner.memberId}}</span>
                    <span class="partner_name" v-else>{{partner.nickName}}</span>
                    <span class="invitee_partner" v-if="partner.invitee">外部</span>
                    <a class="chose_box"></a>
                </div>
                <!--列表（最近）-->
                <div class="partner_item recent"
                     v-if="interim_authority.recommend_partner.length > 0 && interim_authority.search_keyword === ''"
                     v-for="partner in interim_authority.recommend_partner"
                     @click="add_interim_partner(partner)"
                >
                    <img class="partner_head" v-if="partner.invitee || partner.head === '' || !partner.head" src="../../public/images/common/default_head.png" alt="">
                    <img class="partner_head" v-else :src="partner.head" alt="">
                    <span class="partner_name" v-if="partner.invitee">{{partner.invitee}}</span>
                    <span class="partner_name" v-else-if="partner.nickName === '' || !partner.nickName">{{partner.memberId}}</span>
                    <span class="partner_name" v-else>{{partner.nickName}}</span>
                    <span class="invitee_partner" v-if="partner.invitee">外部</span>
                    <a class="chose_box"></a>
                    <a class="remove_partner_btn" @click.stop="remove_interim_partner(partner)">移除</a>
                </div>
                <!--列表（搜索）-->
                <div class="partner_item"
                     v-if="interim_authority.search_result.length > 0 && interim_authority.search_keyword !== ''"
                     v-for="partner in interim_authority.search_result"
                     :class="{unable:partner.documentCollaborateId}"
                     @click="add_interim_partner(partner)"
                     :disabled="partner.documentCollaborateId"
                >
                    <img class="partner_head" v-if="partner.invitee || partner.head === '' || !partner.head" src="../../public/images/common/default_head.png" alt="">
                    <img class="partner_head" v-else :src="partner.head" alt="">
                    <span class="partner_name" v-if="partner.invitee">{{partner.invitee}}</span>
                    <span class="partner_name" v-else-if="partner.nickName === '' || !partner.nickName">{{partner.memberId}}</span>
                    <span class="partner_name" v-else>{{partner.nickName}}</span>
                    <span class="invitee_partner" v-if="partner.invitee">外部</span>
                    <a class="chose_box" v-if="partner.memberId || partner.documentCollaborateId"></a>
                    <a class="invite_btn" v-if="partner.invitee && !partner.documentCollaborateId">邀请</a>
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
            <div class="foot"
                 v-if="!(interim_authority.search_result.length > 0 || interim_authority.search_keyword !== '')"
                 :class="{unable:interim_authority.added_partner.length <= 0}"
            >
                <a :disabled="interim_authority.added_partner.length <= 0" @click="sure_add_partner">添加</a>
            </div>
        </div>
        <!-- 添加团队成员 -->
        <div class="add_team_member_panel" v-if="add_member">
            <div class="header">
                <a class="back" @click="toggle_add_team_member"></a>
                <span class="check_right">
                    <span @click="team_member_select_toggle('all')">全选 | </span>
                    <span @click="team_member_select_toggle('cancel')">取消全选</span>
                </span>
            </div>
            <div class="add_panel">
                <p>团队所有成员（{{team_member_select_list.length}}人）</p>
                <!--团队成员列表(不渲染自己)-->
                <div class="partner_item team"
                        v-for="(item,index) in team_member_select_list"
                        :key="index"
                        :class="{check:item.check,disabled:(['team_owner','creator'].indexOf(item.memberRoleType) >= 0 || item.is_mine)}"
                        @click="team_check_select_member(index)"
                >
                    <img class="partner_head" v-if="item.memberHead === '' || !item.memberHead" src="../../public/images/common/default_head.png" alt="">
                    <img class="partner_head" v-else :src="item.memberHead" alt="">
                    <span class="partner_name" v-if="item.memberNickName === '' || !item.memberNickName">{{item.memberId}}</span>
                    <span class="partner_name" v-else>{{item.memberNickName}}</span>
                    <a class="partner_check" :class="{checked:item.check}"></a>
                </div>
            </div>
            <div class="foot" v-if="team_member_select_list.length > 1">
                <p>管理员可以邀请和移除项目成员，<br>只有被邀请的成员才能访问该文档的权限</p>
                <a @click="sure_add_team_member">保存</a>
            </div>
        </div>
        <div class="footer" v-if="authority_obj.type === 'team_move'">
            <p>注：移动后会清除该文档之前已有的协作成员</p>
            <div class="footer_btn">
                <button class="cancel" @click="close">取消</button>
                <button class="sure" @click="move_cur_folder">移动</button>
            </div>
        </div>
        <!-- 遮罩层 -->
        <transition name="modal_fade">
            <div class="common_doc_modal doc_masking" v-if="show_document_authority === 'confirm' || show_authority_list || change_owner_step"></div>
        </transition>
        <!-- 有效期设置 -->
        <set_expire ref="set_expire" :document_info="interim_authority.document" @update_expire="update_expire"></set_expire>
        <!-- 文档权限下拉 -->
        <action_sheet ref="ActionSheet"
            :sheetClass="'authority_modal'"
            :value="document_authority">
        </action_sheet>
    </div>
</template>

<script>
    import collaborate from '@/assets/common/js/collaborate.js'
    import set_expire from '@/components/WapSetExpire.vue';
    import action_sheet from '@/components/CommonActionSheet.vue';
    export default {
        name: "SetAuthority",
        components: {
            set_expire,
            action_sheet
        },
        data() {
            return {
                // 显示标识
                show_authority: false,
                // 权限设置弹框相关
                authority_obj:{},
                // 文档权限列表
                document_authority:[
                    {
                        type:'open',
                        name: '任何人都可查看',
                        describe: '获得链接的人都可以查看',
                        text: '任何人都可查看',
                        icon:  require(`../assets/wap/images/authority/open.png`),
                        after: `<span>获得链接的人都可以查看</span>`,
                        onClick: () => {
                            this.checked_document_authority(this.document_authority[0])
                        }
                    },
                    {
                        type:'edit',
                        name: '任何人都可编辑',
                        describe: '获得链接的人都可以编辑',
                        text: '任何人都可编辑',
                        icon: require(`../assets/wap/images/authority/edit.png`),
                        after: `<span>获得链接的人都可以编辑</span>`,
                        onClick: () => {
                            this.checked_document_authority(this.document_authority[1])
                        }
                    },
                    {
                        type:'exclusive',
                        name: '仅指定的成员可查看/编辑',
                        describe: '仅指定的成员可查看/编辑',
                        text: '指定专属成员',
                        icon: require(`../assets/wap/images/authority/exclusive.png`),
                        after: `<span>仅指定的成员可查看/编辑</span>`,
                        onClick: () => {
                            this.checked_document_authority(this.document_authority[2])
                        }
                    },
                    {
                        type:'privacy',
                        name: '仅自己可查看/编辑',
                        describe: '仅自己可查看/编辑',
                        text: '私密',
                        icon: require(`../assets/wap/images/authority/privacy.png`),
                        after: `<span>仅自己可查看/编辑</span>`,
                        onClick: () => {
                            this.checked_document_authority(this.document_authority[3])
                        }
                    },
                ],
                // 协作权限列表
                partner_authority:[],
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
                document_expire_time:'永久',
                // 文档权限下拉 list -> confirm
                show_document_authority: false,
                // 所有者下拉 list -> panel -> confirm
                change_owner_step: false,
                // 转让文档所有者选中人
                document_assignor:{},
                // 协作者下拉 list -> confirm
                show_authority_list: false,
                // 正在编辑协作者
                editing_partner: {},
                // 添加协作者
                add_partner: false,
                // 添加团队成员
                add_member: false,
                // 团队成员列表
                team_member_select_list:[],
                //websocket
                ws_client_method:{}
            }
        },
        methods: {
            //文档权限
            ws_doc_authority_send:function(){
                try{
                    let that = this,
                        id = that.interim_authority.document.id,
                        data = {
                            document: that.interim_authority.document,
                            partner: that.interim_authority.partner
                        };
                    if(that.$parent.ws_client_method) that.$parent.ws_client_method.doc_authority_send(id, data);

                }catch(e){
                    console.error(e);
                }
            },

            // 显示权限设置弹框
            show: function(obj){
                let that = this;
                if(!obj.id) return false;
                // 获取文档相关信息
                that.$axios.get('/api/member/document/authority/',{params:{docId: obj.id}})
                    .then(function(data){
                        if(data.data.code !== '2') return that.$toast(data.data.content, 1000, 'wap');
                        let document_authority = that.document_authority;
                        that.interim_authority.document.id = obj.id;
                        that.interim_authority.document.type = data.data.data.visitType;
                        that.interim_authority.partner = data.data.data.documentCollaborates;
                        // 获取文档链接有效期
                        that.interim_authority.document.urlExpireType = data.data.data.urlExpireType;
                        that.document_expire_time = data.data.data.isUrlEffect ? (data.data.data.urlExpireDate ? utils.expireTime(data.data.data.urlExpireDate) : '永久') : 0;
                        // 判断文档权限
                        switch (data.data.data.visitType) {
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
                        // 显示弹框
                        that.show_authority = true;
                    });
                // 获取协作者权限列表
                let authority = Object.values(collaborate.authority_map);
                authority.shift();
                that.partner_authority = authority;
                that.authority_obj = obj;
                that.team_member_select_list = obj.team_member_select_list;
            },
            // 关闭权限设置弹框
            close: function(){
                this.show_authority = false;
            },
            // 获取当前文档协作者列表: socket_send => 是否推送通讯标识
            get_document_partner:function(socket_send){
                let that = this,
                    doc_id = that.interim_authority.document.id;
                collaborate.specific(that, {
                    id: doc_id,
                    success: function(data){
                        if(data.data.code !== '2') return that.$toast(data.data.content, 1000, 'wap');
                        // 同步文档全部协作者
                        let partner = Object.values(data.data.data)[0];
                        if(typeof(partner) === 'undefined'){
                            partner = [];
                        }
                        that.interim_authority.partner = partner;
                        // 判断发送通讯
                        if(socket_send) that.ws_doc_authority_send();
                    }
                });
            },
            // 文档权限
            toggle_document_authority:function(data){
                let that = this;
                switch (true) {
                    case data === 'list':
                        let index = that.document_authority.findIndex(item => item.type === that.interim_authority.document.type);
                        that.document_authority[index].class = 'check';
                        that.$refs.ActionSheet.open();
                        break;
                    case data === 'confirm':
                        that.document_authority.forEach(item => {
                                item.class = '';
                        })
                        that.show_document_authority = 'confirm';
                        break;
                    default:
                        that.show_document_authority = false;
                        break;
                }
            },
            // 文档权限 - 选择
            checked_document_authority:function(item){
                let that = this,
                    document = that.interim_authority.document;
                if(item.type === 'privacy') return that.toggle_document_authority('confirm');
                that.$axios.post('/api/member/document/authority/save/', {
                    docId: document.id,
                    visitType: item.type
                })
                    .then(function(data){
                        if(data.data.code !== '2') that.$toast(data.data.content, 1000, 'wap');
                        that.interim_authority.document.type = item.type;
                        that.interim_authority.document.name = item.name;
                        that.interim_authority.document.describe = item.describe;
                        that.show_document_authority = false;
                        // 同步到文档中心
                        if (that.$parent.doc_list) {
                            let document_list = JSON.parse(JSON.stringify(that.$parent.doc_list)),
                                current_doc = document_list.filter(item => item.id === document.id)[0];
                            if(current_doc){
                                current_doc.visitType = item.type;
                                that.$parent.doc_list = document_list;
                            }
                        }
                        // 发送通讯
                        that.ws_doc_authority_send();
                        // 同步到文档分享页
                        if(that.$parent.document_share){
                            let document = JSON.parse(JSON.stringify(that.$parent.document));
                            document.name = item.name;
                            document.describe = item.describe;
                            that.$parent.document = document;
                        }
                        // 清除选中状态
                        that.document_authority.forEach(item => {
                            item.class = '';
                        })
                    });
            },
            // 文档权限 - 确认私密
            sure_document_privacy:function(){
                let that = this;
                that.$axios.post('/api/member/document/authority/save/', {
                    docId: that.interim_authority.document.id,
                    visitType: 'privacy'
                })
                    .then(function(data){
                        if(data.data.code !== '2') return that.$toast(data.data.content);
                        that.interim_authority.document.type = 'privacy';
                        that.interim_authority.document.name = '私密';
                        that.interim_authority.document.describe = '仅自己可查看/编辑';
                        that.show_document_authority = false;
                        // 重新获取协作列表
                        that.get_document_partner(true);
                        // 同步到文档中心
                        if (that.$parent.doc_list) {
                            let document_list = JSON.parse(JSON.stringify(that.$parent.doc_list)),
                                current_doc = document_list.filter(item => item.id === document.id)[0];
                            if(current_doc){
                                current_doc.visitType = item.type;
                                that.$parent.doc_list = document_list;
                            }
                        }
                        // 同步到文档分享页
                        if(that.$parent.document_share){
                            let document = JSON.parse(JSON.stringify(that.$parent.document));
                            document.name = item.name;
                            document.describe = item.describe;
                            that.$parent.document = document;
                        }
                    });
            },
            // 文档有效期 - 打开设置框
            show_set_expire: function(){
                this.$refs.set_expire.show();
            },
            // 文档有效期 - 数据更新
            update_expire: function(obj){
                this.interim_authority.document.urlExpireType = obj.key;
                this.document_expire_time = obj.time;
            },
            // 转让所有权
            change_owner:function(data){
                let that = this;
                switch (data) {
                    case 'list':
                        if(that.interim_authority.partner.length <= 0){
                            that.change_owner_step = false;
                        }else{
                            that.change_owner_step = data;
                        }
                        break;
                    case 'panel':
                        that.change_owner_step = data;
                        break;
                    case 'confirm':
                        let document_assignor = that.interim_authority.partner.filter(item => item.assignor);
                        if(document_assignor.length !== 1) return that.$toast('请选中转让人后操作', 1000, 'wap');
                        that.document_assignor = document_assignor[0];
                        that.change_owner_step = data;
                        break;
                    default:
                        that.change_owner_step = false;
                        break;
                }
            },
            // 转让所有权 - 选中转让人
            chose_assignor:function(item){
                let that = this,
                    partner_list = JSON.parse(JSON.stringify(that.interim_authority.partner));
                if(item.assignor){
                    item.assignor = false;
                }else{
                    item.assignor = true;
                }
                partner_list.forEach(function(partner){
                    partner.assignor = false;
                    if(partner.memberId === item.memberId) partner.assignor = item.assignor;
                });
                that.interim_authority.partner = partner_list;
            },
            // 转让所有权 - 确认转让
            sure_change_owner:function(){
                let that = this,
                    document_assignor = that.document_assignor;
                that.$axios.post('/api/member/document/transfer/',{
                    docId: that.interim_authority.document.id,
                    memberId: document_assignor.memberId
                })
                    .then(function(data){
                        if(data.data.code !== '2') return that.$toast(data.data.content, 1000, 'wap');
                        location.href = '/mobile/home/';
                    });
            },
            // 协作者权限
            toggle_partner_authority:function(data ,partner){
                let that = this;
                switch (data) {
                    case 'list':
                        if(!partner) break;
                        that.show_authority_list = data;
                        that.editing_partner = partner;
                        break;
                    case 'confirm':
                        that.show_authority_list = data;
                        break;
                    default:
                        that.show_authority_list = false;
                        break;
                }
            },
            // 协作者权限 - 选择权限
            checked_partner_authority:function(item){
                let that = this,
                    partner = that.editing_partner;
                if(item.type === 'remove') return that.toggle_partner_authority('confirm');
                collaborate.change(that, {
                    id: that.interim_authority.document.id,
                    role: item.type,
                    collaborateId: partner.documentCollaborateId,
                    success: function(data){
                        if(data.data.code !== '2') return that.$toast(data.data.content, 1000, 'wap');
                        that.get_document_partner(true);
                        that.show_authority_list = false;
                    },
                });
            },
            // 协作者权限 - 确认移除
            sure_remove_partner:function(){
                let that = this,
                    partner = that.editing_partner;
                collaborate.delete(that, {
                    id: that.interim_authority.document.id,
                    partner: partner,
                    success: function(data){
                        if(data.data.code !== '2') return that.$toast(data.data.content, 1000, 'wap');
                        that.get_document_partner(true);
                        that.show_authority_list = false;
                    },
                });
            },
            // 添加协作者
            toggle_add_partner:function(){
                let that = this;
                that.add_partner = !that.add_partner;
                if(that.add_partner){
                    // 获取最近协作者
                    collaborate.search_recent(that, {
                        id: that.interim_authority.document.id,
                        success: function(data){
                            if(data.data.code !== '2') return that.$toast(data.data.content, 1000, 'wap');
                            that.interim_authority.recommend_partner = data.data.data.filter(item => !item.documentCollaborateId);
                        }
                    });
                    // 更新新添加协作者列表
                    that.interim_authority.added_partner = [];
                    // 更新搜索结果列表
                    that.interim_authority.search_result = [];
                    // 更新搜索关键词
                    that.interim_authority.search_keyword = '';
                    that.$nextTick(function(){
                        that.$refs.search_partner_input.value = '';
                        that.get_invitee_code();
                    });
                }
            },
            // 添加协作 - 搜索协作者
            search_partner:function(){
                let that = this,
                    keyword = that.$refs.search_partner_input.value;
                that.interim_authority.search_keyword = keyword;
                // 存在关键词 => 显示搜索结果
                if(keyword !== ''){
                    collaborate.search(that, {
                        id: that.interim_authority.document.id,
                        keyword: keyword,
                        success: function(data){
                            if(data.data.code !== '2') return that.$toast(data.data.content, 1000, 'wap');
                            let result = data.data.data;
                            // 当前搜索无结果 => 判断是否为 手机||邮箱
                            if(result.length <= 0){
                                let mail_reg = /^\w+([-+.]\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/,
                                    phone_reg = /^1\d{10}$/,
                                    obj = {
                                        head: '/public/images/default_head.png'
                                    };
                                // 判断当前输入为外部邮箱
                                if(mail_reg.test(keyword) || phone_reg.test(keyword)){
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
            // 添加协作 - 临时添加
            add_interim_partner:function(partner){
                let that = this,
                    recommend_list = that.interim_authority.recommend_partner,
                    add_list = that.interim_authority.added_partner;
                // 错误状态判断
                if(!partner) return false;
                if(partner.documentCollaborateId) return false;
                // 判断当前已添加
                if(partner.add){
                    partner.add = false;
                    if(partner.invitee) add_list = add_list.filter(item => item.invitee !== partner.invitee);
                    if(partner.memberId) add_list = add_list.filter(item => item.memberId !== partner.memberId);
                    recommend_list.push(partner);
                    that.interim_authority.added_partner = add_list;
                    that.interim_authority.recommend_partner = recommend_list;
                }
                // 判断当前未添加
                else{
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
                    that.interim_authority.search_result = [];
                    that.interim_authority.search_keyword = '';
                    that.$refs.search_partner_input.value = '';
                    if(recommend_list.length > 0){
                        if(partner.invitee) recommend_list = recommend_list.filter(item => item.invitee !== partner.invitee);
                        if(partner.memberId) recommend_list = recommend_list.filter(item => item.memberId !== partner.memberId);
                        that.interim_authority.recommend_partner = recommend_list;
                    }
                }

            },
            // 移除最近列表协作者
            remove_interim_partner: function (partner) {
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
            sure_add_partner:function(){
                let that = this,
                    added_partner = that.interim_authority.added_partner,
                    add_document_collaborates = [];
                // 错误状态判断
                if(added_partner.length <= 0) return false;
                added_partner.forEach(function(item){
                    let obj = {
                        collaborateRoleType: item.collaborateRoleType,
                        username: item.invitee ? item.invitee : item.memberId
                    };
                    add_document_collaborates.push(obj);
                });
                collaborate.add(that, {
                    id: that.interim_authority.document.id,
                    arr: add_document_collaborates,
                    success: function(data){
                        that.$toast(data.data.content, 1000, 'wap');
                        if(data.data.code !== '2') return;
                        that.add_partner = false;
                        that.add_member = false;
                        that.get_document_partner(true);
                    },
                    fail: function(){
                        that.$toast(data.data.content, 1000, 'wap');
                        that.add_partner = false;
                        that.add_member = false;
                        that.get_document_partner(true);
                    },
                });
            },
            // 获取协作邀请码
            get_invitee_code:function(){
                let that = this;
                let doc_id = that.interim_authority.document.id;
                let url =  window.location.protocol +'//'+ window.location.host +'/mobile/invite/';
                url += "?docId=" + doc_id;
                document.getElementById('to_wechat').setAttribute('href', url);
            },
            
            // 团队相关
            // 团队 - 移动到团队文件夹
            move_cur_folder: function(){
                this.$parent.team_member_select_list = this.team_member_select_list;
                this.$parent.move_cur_folder();
            },
            // 团队文档 - 权限设置 - 成员全选/取消全选
			team_member_select_toggle: function(type){
				let that = this, data = true;
                if(type === 'cancel') data = false;
				that.team_member_select_list.forEach(function(item){
					item.check = data;
					if(['team_owner','creator'].indexOf(item.memberRoleType) > -1 || item.is_mine) item.check = true;
				})
				that.$forceUpdate();
            },
            // 团队 - 权限设置 - 添加成员弹框打开/关闭
			toggle_add_team_member: function(){
                let that = this,list = that.team_member_select_list;
                that.add_member = !that.add_member;
                if(that.add_member){
                    list.forEach(function(item){
                        if(item.memberId == utils.getCookies('woodo_memberId')){
                            item.is_mine = true;
                        }
                        if(item.memberRoleType === 'team_owner'){
                            item.check = true;
                            item.order = 0;
                        }else if(item.is_mine){
                            item.check = true;
                            item.order = 1;
                        }else if(that.interim_authority.partner.filter(added => added.memberId === item.memberId).length > 0){
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
                }else{
                    that.team_member_select_list = that.authority_obj.team_member_select_list;
                }
            },
            // 团队 - 权限设置 - 复选设置
			team_check_select_member: function(index){
				let that = this;
				that.$set(that.team_member_select_list[index], 'check', !that.team_member_select_list[index].check);
				// 视图无法更新,强制更新
				that.$forceUpdate();
            },
            // 团队 - 添加协作 - 确认添加
            sure_add_team_member: function(){
                let that = this;
				let member_list = that.team_member_select_list.filter(item => item.check);
                // 过滤已加入协作的成员
                member_list = member_list.filter(item => !that.interim_authority.partner.some(ele=>ele.memberId===item.memberId));
                if(member_list.length == 0) return that.toggle_add_team_member();
                // 属性改为和协作数据相同
                member_list.forEach(function(item,index){
                    item.collaborateRoleType = item.memberRoleType === 'team_owner' ? 'owner' : 'edit';
                })
                that.interim_authority.added_partner = member_list;
                // 调用添加协作方法
                that.sure_add_partner();
            }
        },
    }
</script>

<style lang="less" scoped>
    @import url("../assets/wap/css/common.css");

    @deep: ~'>>>';
    .authority_contain{
        position:fixed;
        top:0;
        left:0;
        z-index:112;
        width:100%;
        height:100%;
        background:#ffffff;
        text-align:left;
    }
    /*返回按钮*/
    .head{
        width:100%;
        height:2.37rem;
        line-height:2.37rem;
        border-bottom:1px solid #e2e6ed;
        p{
            display:inline-block;
            vertical-align:top;
            margin-left:0.85rem;
            font-size:0.8rem;
            color:#202329;
            &::before{
                content:"";
                display:inline-block;
                vertical-align:middle;
                width: 0.53rem;
                height: 0.88rem;
                margin:0 0.6rem 0.2rem 0;
                background:url(../assets/wap/images/common/back.png) no-repeat center/contain;
            }
        }
    }
    .body{
        padding:0.95rem 0.85rem 0;
        width:100%;
        height:auto;
        &>p{
            margin-bottom:0.28rem;
            color:#353b44;
            font-size:0.8rem;
            font-weight:bold;
        }
    }
    /*文档权限*/
    .document_authority{
        padding:1rem 0.8rem 0;
        &>p{
            display:inline-block;
            margin-bottom: 0.28rem;
            color:#353b44;
            font-size:0.8rem;
            font-weight:bold;
        }
        .expire_setting{
            float:right;
            margin-top:.2rem;
            color:var(--mainColor);
            font-size:0.6rem;
        }
        .authority_content{
            position:relative;
            width:100%;
            height: 5.53rem;
            padding: 1.18rem 1.17rem 1.05rem;
            background-color: #ffffff;
            border-radius: 0.13rem;
            border:1px solid #dde1e7;
            &:after{
                content:'';
                position:absolute;
                top: 1.5rem; 
                right: 0.8rem;
                width:0;
                height:0;
                border: 0.35rem solid #b7c0d0;
                border-left-color: transparent;
                border-right-color: transparent; 
                border-bottom-color: transparent;
            }
        }
        img{
            display:inline-block;
            width:1.37rem;
            margin:0.3rem 0.9rem 0 0;
        }
        .info{
            display:inline-block;
            vertical-align:top;
            width:80%;
        }
        p{
            font-size:0.8rem;
            font-weight: bold;
            color:#353b44;
        }
        span{
            font-size:0.6rem;
            color:#707b8e;
        }
        .expire_tip{
            display: inline-block;
            height: 1rem;
            line-height: 1rem;
            margin-top: .58rem;
            padding: 0 .8rem;
            background-color: #e6f0fd;
            font-size: .5rem;
            color: #666e77;
            text-align:center;
        }
    }
    /*所有人可编辑提示*/
    .edit_tips{
        position:fixed;
        bottom:5rem;
        left:0;
        z-index: -1;
        width:100%;
        font-size:0;
        text-align:center;
        &:before{
            content:'';
            display:inline-block;
            width:0;
            height:100%;
            vertical-align:middle;
        }
        .tips_inner{
            display:inline-block;
            vertical-align:middle;
            img{
                display:block;
                width:95%;
                height:auto;
                margin:0 auto;
            }
            span{
                position: relative;
                top: -1.5rem;
                font-size:0.75rem;
                color:#b0b5c2;
            }
        }
    }
    /*私密提示*/
    .privacy_tips{
        width:100%;
        margin-top:2rem;
        font-size:0;
        text-align:center;
        .tips_inner{
            img{
                display:inline-block;
                width:60%;
                height:auto;
                margin-bottom:1rem;
            }
            p{
                height:1.25rem;
                line-height:1.25rem;
                font-size:0.75rem;
                color:#8b8f98;
            }
        }
    }
    /*协作者列表*/
    .partner_bar{
        height:calc(100% - 5.4rem);
        padding:1.23rem 0.8rem 0;
        overflow-y:auto;
        .title{
            margin-bottom: 0.45rem;
            font-size:0.6rem;
            color:#363636;
            a{
                float: right;
                color: var(--mainColor);
            }
            .add_partner_btn{
                float: right;
                color: var(--mainColor);
            }
            .check_right{
                float: right;
            }
        }
        .add_partner{
            height:2.75rem;
            margin-bottom:0.6rem;
            a{
                display:block;
                width:100%;
                height:2.75rem;
                line-height:2.75rem;
                border-radius:4px;
                background:var(--mainColor);
                font-size:0.75rem;
                color:#ffffff;
                text-align:center;
            }
        }
        .partner_item{
            position:relative;
            width:100%;
            height:2.6rem;
            line-height:2.6rem;
            img{
                display:inline-block;
                vertical-align:middle;
                width:1.5rem;
                height:1.5rem;
                margin:0 0.33rem 0.2rem 0;
                border-radius:1.5rem;
            }
            .name{
                vertical-align:middle;
                font-size:0.67rem;
                color:#21252b;
            }
            .invitee_partner{
                display:inline-block;
                width:1.4rem;
                height:1rem;
                line-height:calc(1rem - 2px);
                margin-left:1rem;
                border:1px solid var(--mainColor);
                border-radius:4px;
                font-size:0.45rem;
                color:var(--mainColor);
                vertical-align:middle;
            }
            .partner_authority{
                position:absolute;
                top:0;
                right:0.5rem;
                display:block;
                height:2.6rem;
                line-height:2.6rem;
                padding:0 0.25rem;
                font-size:0.6rem;
                color:#797a7d;
                cursor:pointer;
                &.unable{
                    color:#838fa080;
                }
            }
            &:after{
                content:'';
                position:absolute;
                right:0;
                top:50%;
                display:inline-block;
                width:0.3rem;
                height:0.3rem;
                margin-top:-0.2rem;
                border-top:1px solid #363b43;
                border-right:1px solid #363b43;
                transform:rotate(45deg);
            }
            .partner_check{
                position:absolute;
                right:0;
                top:1rem;
                width: 0.9rem;
                height: 0.9rem;
                line-height:0.9rem;
                text-align:center;
                background-color: #e9ecf1;
                border-radius: 0.17rem;
            }
            &.check .partner_check{
                background-color:var(--mainColor);
                &::after{
                    content:"";
                    display:inline-block;
                    vertical-align:middle;
                    width:0.48rem;
                    height:0.38rem;
                    margin:0 auto 0.1rem;
                    background:url(../assets/wap/images/doc/white_check.png) center no-repeat;
                    background-size:contain;
                }
            }
            &.disabled{
                opacity:0.5;
                pointer-events:none;
            }
            &.team:after{display:none;}
        }
        .no_partner{
            margin-top: 5rem;
            font-size: 0.8rem;
            text-align: center;
        }
    }
    /*所有者下拉*/
    .change_owner_panel{
        /*权限列表*/
        .authority_modal .authority_list{
            li p{
                height:2rem;
                line-height:2rem;
                padding:0;
            }
        }
        /*选择转让人面板*/
        .list_inner{
            position:relative;
            display:inline-block;
            vertical-align:middle;
            width:80%;
            height:90%;
            line-height:initial;
            padding:3.1rem 0 2.5rem;
            border-radius:4px;
            background:#ffffff;
            vertical-align:middle;
            .title{
                position:absolute;
                top:0;
                left:0;
                width:100%;
                height:3.1rem;
                line-height:3.1rem;
                padding-left:1rem;
                border-bottom:1px solid #e5e7eb;
                font-size:0.9rem;
                color:#2c2c2c;
            }
            .btn_bar{
                position:absolute;
                bottom:0;
                left:0;
                width:100%;
                height:2.5rem;
                line-height:2.5rem;
                border-top:1px solid #e5e7eb;
                font-size:0;
                color:#5d5d5d;
                text-align:center;
                &:before{
                    content:'';
                    position:absolute;
                    left:50%;
                    top:0;
                    width:1px;
                    height:2.5rem;
                    background:#e5e7eb;
                }
                a{
                    display:inline-block;
                    width:50%;
                    height:2.5rem;
                    font-size:0.75rem;

                }
            }
            ul{
                position:relative;
                width:100%;
                height:100%;
                padding:0.5rem 1rem;
                overflow:hidden;
                overflow-y:auto;
            }
            li{
                position:relative;
                width:100%;
                height:2.65rem;
                line-height:2.65rem;
                font-size:0;
                color:#353536;
                text-align:left;
                cursor:pointer;
                img{
                    display:inline-block;
                    vertical-align:middle;
                    width:1.25rem;
                    height:1.25rem;
                    border-radius:50%;
                    margin-right:0.3rem;
                }
                span{
                    font-size:0.6rem;
                    vertical-align:middle;
                }
                .chose_box{
                    position:absolute;
                    top:50%;
                    right:0;
                    width:1rem;
                    height:1rem;
                    margin-top:-0.5rem;
                    border:1px solid #b6bbc8;
                    border-radius:1rem;
                    cursor:pointer;
                }
                &.checked{
                    .chose_box{
                        border-color:var(--mainColor);
                        background:var(--mainColor);
                        &:after{
                            content:'';
                            position:absolute;
                            top:50%;
                            left:50%;
                            display:block;
                            width:0.6rem;
                            height:0.5rem;
                            margin:-0.25rem 0 0 -0.3rem;
                            background:url(../assets/wap/images/authority/chose_owner_icon.png) no-repeat 0 0;
                            background-size:100%;
                        }
                    }
                }
            }
        }
    }
    /*协作者权限下拉*/
    .partner_authority_panel{
        .authority_modal .authority_list li{
            line-height: 2rem;
            padding: 0.6rem 0;
            p{
                padding-left:0;
            }
            span{
                padding-left:0;
            }
            &:last-child{
                height:3rem;
            }
        }
    }

    /*通用 - 弹框容器*/
    .common_modal{
        position:fixed;
        top:0;
        left:0;
        width:100%;
        height:100%;
        z-index:12;
        text-align:center;
        &::after{
            content:'';
            position:relative;
            display:inline-block;
            width:0;
            height:100%;
            vertical-align:middle;
        }
    }
    /*通用 - 权限列表*/
    .authority_modal{
        position:fixed;
        top:0;
        left:0;
        width:100%;
        height:100%;
        z-index:12;
        .authority_list{
            position:absolute;
            bottom:0;
            left:0;
            width:100%;
            background:#fff;
            text-align:left;
            ul{
                padding:0 1rem;
                background:#ffffff;
                text-align:left;
            }
            li{
                position:relative;
                width:100%;
                height:4rem;
                line-height:1rem;
                padding:1rem 0;
                border-bottom:1px solid #ccd0dd;
                p{
                    height:1rem;
                    padding-left:2rem;
                    font-size:0.75rem;
                    color:#131314;
                }
                span{
                    display:inline-block;
                    height:1rem;
                    padding-left:2rem;
                    font-size:0.4rem;
                    color:#6e717a;
                }
                img:first-child{
                    position:absolute;
                    top:1.3rem;
                    width:1.4rem;
                }
                img:last-child{
                    position:absolute;
                    top:1.3rem;
                    right:0.6rem;
                    width:0.87rem;
                    height:auto;
                }
                img.privacy{
                    top: 0.8rem;
                    transform: scale(0.8);
                }
                &.checked{
                    p{
                        color:var(--mainColor);
                    }
                }
            }
            .cancel{
                width:100%;
                height:3rem;
                line-height:3rem;
                margin-top:0.15rem;
                background:#ffffff;
                font-size:0.75rem;
                color:#131314;
                text-align:center;
            }
        }
    }
    /*通用 - 权限列表*/
    @{deep} .authority_modal{
        .action-sheet-backdrop{
            background-color: rgba(0, 0, 0, .5);
        }
        .action-sheet-container{
            padding-top: 0;
            padding: 0 1rem;
            .action-sheet-list{
                position: relative;
                width: 100%;
                height: 4rem;
                line-height: 1rem;
                padding: 1rem 0;
                border-bottom: 1px solid #ccd0dd;
                text-align: left;
                img.icon{
                    position: absolute;
                    top: 1.3rem;
                    width: 1.4rem;
                    height: auto;
                }
                span.text{
                        display: block;
                        height: 1rem;
                        padding-left: 2rem;
                        font-size: .75rem;
                        color: #131314;
                }
                .list-after{
                    display: inline-block;
                    height: 1rem;
                    padding-left: 2rem;
                    font-size: .4rem;
                    color: #6e717a;
                }
                &:nth-child(4) .icon{
                    top: .8rem;
                    transform: scale(0.8);
                }
                &.check{
                    .text{
                        color: var(--mainColor);
                    }
                    &::after{
                        content:"";
                        position: absolute;
                        top: 1.3rem;
                        right: .6rem;
                        width: .87rem;
                        height: .75rem;
                        background:url(../assets/wap/images/authority/authority_checked.png) center no-repeat;
                        background-size: contain;
                    }
                }
            }
            .action-sheet-cancel{
                width: 100%;
                height: 3rem;
                line-height: 3rem;
                margin-top: .15rem;
                background: #fff;
                color: #131314;
            }
        }
    }
    /*通用 - 确认弹框*/
    .confirm_modal{
        position:relative;
        display:inline-block;
        vertical-align:middle;
        width:80%;
        height:auto;
        line-height:initial;
        padding:1.25rem 1.5rem 4rem;
        border-radius:4px;
        background:#ffffff;
        font-size:0;
        .title{
            height:2.2rem;
            line-height:2.2rem;
            font-size:0.9rem;
            color:#2c2c2c;
        }
        .content{
            line-height:1rem;
            font-size:0.75rem;
            color:#393939;
            p:first-child{
                height:1rem;
                font-size:0.75rem;
                color:#393939;
            }
            p:last-child{
                font-size:0.6rem;
                color:#393939;
            }
            span{
                display:block;
                height:1rem;
                font-size:0.75rem;
                color:var(--mainColor);
            }
        }
        .btn_bar{
            position:absolute;
            bottom:0;
            left:0;
            width:100%;
            height:2.5rem;
            line-height:2.5rem;
            border-top:1px solid #d3d5dd;
            border-bottom-left-radius:4px;
            border-bottom-right-radius:4px;
            font-size:0;
            color:#5d5d5d;
            &:after{
                content:'';
                position:absolute;
                top:0;
                left:50%;
                width:1px;
                height:2.5rem;
                background:#d3d5dd;
            }
            a{
                display:inline-block;
                width:50%;
                height:100%;
                font-size:0.75rem;
                color:#5d5d5d;
                vertical-align:top;
                cursor:pointer;
            }
        }
    }
    /*添加协作者*/
    .add_partner_panel{
        position:fixed;
        top:0;
        left:0;
        z-index:3;
        width:100%;
        height:100%;
        background:#ffffff;
        .header{
            position:relative;
            width:100%;
            padding:2rem 0.85rem 0;
            .search_input{
                position:relative;
                width:100%;
                height:2.5rem;
                line-height:2.5rem;
                margin-bottom:1rem;
                padding-left:2rem;
                border:1px solid #d4d4d4;
                border-radius:4px;
                font-size:0;
                overflow:hidden;
                &:before{
                    content:'';
                    position:absolute;
                    top:50%;
                    left:0.65rem;
                    width:0.925rem;
                    height:0.875rem;
                    margin-top:-0.4375rem;
                    background:url(../assets/wap/images/authority/search_icon.png) center no-repeat;
                    background-size:contain;
                }
                input{
                    display:block;
                    width:100%;
                    height:100%;
                    font-size:0.75rem;
                    color:#373737;
                    &::-webkit-input-placeholder{color:#b0b5c2;}
                    &:-moz-placeholder{color:#b0b5c2;}
                    &::-moz-placeholder{color:#b0b5c2;}
                    &:-ms-input-placeholder{color:#b0b5c2;}
                }
            }
            .back{
                position:absolute;
                top:0.5rem;
                left:0.7rem;
                width:1rem;
                height:1rem;
                &:after{
                    content:'';
                    position:absolute;
                    top:50%;
                    left:50%;
                    width:0.5rem;
                    height:0.5rem;
                    margin:-0.25rem 0 0 -0.25rem;
                    border-top:0.1rem solid #c6c9d1;
                    border-left:0.1rem solid #c6c9d1;
                    transform:rotate(-45deg);
                }
            }
            .to_wechat{
                position:relative;
                display:block;
                width:100%;
                height:3rem;
                line-height:3rem;
                font-size:0;
                &:before{
                    content:'';
                    display:inline-block;
                    width:1.2rem;
                    height:1.2rem;
                    margin-right:0.5rem;
                    background:url('../assets/wap/images/authority/share_icon-1.png') center no-repeat;
                    background-size:contain;
                    vertical-align:middle;
                }
                span{
                    font-size:0.9rem;
                    color:#373737;
                    vertical-align:middle;
                }
                &:after{
                    content:'';
                    position:absolute;
                    right:0;
                    top:50%;
                    display:inline-block;
                    width:0.3rem;
                    height:0.3rem;
                    margin-top:-0.15rem;
                    border-top:1px solid #c6c9d1;
                    border-right:1px solid #c6c9d1;
                    transform:rotate(45deg);
                }
            }
        }
        .add_panel{
            position:relative;
            width:100%;
            height:calc(100% - 12rem);
            overflow:hidden;
            overflow-y:auto;
        }
        .recommend_partner{
            width:100%;
            height:1.25rem;
            line-height:1.25rem;
            padding:0 0.75rem;
            background:#f1f2f5;
            font-size:0.6rem;
            color:#373737;
        }
        .partner_item{
            position:relative;
            width:calc(100% - 1.5rem);
            height:2.65rem;
            line-height:2.65rem;
            margin:0 auto;
            border-bottom:1px solid #ededed;
            .partner_head{
                display:inline-block;
                width:1.25rem;
                height:1.25rem;
                margin-right:0.25rem;
                border-radius:1.25rem;
                vertical-align:middle;
            }
            .partner_name{
                font-size:0.6rem;
                color:#353536;
                vertical-align:middle;
            }
            .invitee_partner{
                display:inline-block;
                width:1.4rem;
                height:1rem;
                line-height:calc(1rem - 2px);
                margin-left:1rem;
                border:1px solid var(--mainColor);
                border-radius:4px;
                font-size:0.45rem;
                color:var(--mainColor);
                /*text-align:center;*/
                vertical-align:middle;
            }
            .chose_box{
                position:absolute;
                top:50%;
                right:0;
                display:inline-block;
                width:1.1rem;
                height:1.1rem;
                margin-top:-0.505rem;
                border:1px solid #b6bbc8;
                border-radius:1.1rem;
                &:after{
                    content:'';
                    position:absolute;
                    top:50%;
                    left:50%;
                    display:none;
                    width:0.65rem;
                    height:0.5rem;
                    margin:-0.25rem 0 0 -0.325rem;
                    background:url(../assets/wap/images/authority/chose_owner_icon.png) center no-repeat;
                    background-size:contain;
                }
            }
            .invite_btn{
                position:absolute;
                top:50%;
                right:0;
                display:block;
                width:2.75rem;
                height:1.5rem;
                line-height:1.5rem;
                margin-top:-0.75rem;
                border-radius:1.5rem;
                background:var(--mainColor);
                font-size:0.6rem;
                color:#ffffff;
                text-align:center;
                cursor:pointer;
            }
            &.unable{
                .chose_box{
                    border-color:#efefef;
                    background:#efefef;
                    &:after{
                        display:block;
                    }
                }
            }
            &.checked{
                .chose_box{
                    border-color:var(--mainColor);
                    background:var(--mainColor);
                    &:after{
                        display:block;
                    }
                }
            }
            &.recent {
                .chose_box {
                    right: 3rem;
                }
                .remove_partner_btn {
                    position: absolute;
                    top: 50%;
                    right: 0;
                    padding: 0 0.4rem;
                    height: 1.1rem;
                    line-height: 1.1rem;
                    margin-top: -0.505rem;
                    border: 1px solid #c5d0dc;
                    color: #838f9f;
                    font-size: 0.65rem;
                    border-radius: 3px;
                    background-color: #fff;
                }
            }
        }
        .empty_partner{
            position:absolute;
            top:50%;
            left:0;
            width:100%;
            height:9.25rem;
            margin-top:-4.625rem;
            font-size:0;
            text-align:center;
            p{
                height:7.5rem;
                line-height:7.5rem;
                font-size:6.75rem;
                color:#e1e5ef;
            }
            span{
                display:block;
                height:1.75rem;
                line-height:1.75rem;
                font-size:0.75rem;
                color:#e1e5ef;
            }
        }
        .foot{
            position:absolute;
            bottom:0;
            left:0;
            width:100%;
            height:4rem;
            padding:0.75rem;
            a{
                display:block;
                width:100%;
                height:100%;
                line-height:2.5rem;
                border-radius:4px;
                background:var(--mainColor);
                font-size:0.9rem;
                color:#ffffff;
                text-align:center;
            }
            &.unable{
                a{
                    background:#d3d5dd;
                }
            }
        }
    }
    /*添加团队协作者*/
    .add_team_member_panel{
        position:fixed;
        top:0;
        left:0;
        z-index:3;
        width:100%;
        height:100%;
        background:#ffffff;
        .header{
            position:relative;
            width:100%;
            height:3rem;
            line-height:3rem;
            padding:0 0.85rem;
            .back{
                position:absolute;
                top:1rem;
                left:0.7rem;
                width:1rem;
                height:1rem;
                &:after{
                    content:'';
                    position:absolute;
                    top:50%;
                    left:50%;
                    width:0.5rem;
                    height:0.5rem;
                    margin:-0.25rem 0 0 -0.25rem;
                    border-top:0.1rem solid #363b43;
                    border-left:0.1rem solid #363b43;
                    transform:rotate(-45deg);
                }
            }
            .check_right{
                float: right;
            }
        }
        .add_panel{
            position:relative;
            width:100%;
            height:calc(100% - 11rem);
            padding:0 1rem;
            overflow:hidden;
            overflow-y:auto;
            &>p{
                height:2rem;
                line-height:2rem;
                font-size: 0.6rem;
                color: #363636;
            }
        }
        .partner_item{
            position:relative;
            width:100%;
            height:2.6rem;
            line-height:2.6rem;
            img{
                display:inline-block;
                vertical-align:middle;
                width:1.5rem;
                height:1.5rem;
                margin:0 0.33rem 0.2rem 0;
                border-radius:1.5rem;
            }
            .name{
                vertical-align:middle;
                font-size:0.67rem;
                color:#21252b;
            }
            .invitee_partner{
                display:inline-block;
                width:1.4rem;
                height:1rem;
                line-height:calc(1rem - 2px);
                margin-left:1rem;
                border:1px solid var(--mainColor);
                border-radius:4px;
                font-size:0.45rem;
                color:var(--mainColor);
                vertical-align:middle;
            }
            .partner_authority{
                position:absolute;
                top:0;
                right:0.5rem;
                display:block;
                height:2.6rem;
                line-height:2.6rem;
                padding:0 0.25rem;
                font-size:0.6rem;
                color:#797a7d;
                cursor:pointer;
                &.unable{
                    color:#838fa080;
                }
            }
            .partner_check{
                position:absolute;
                right:0;
                top:1rem;
                width: 0.9rem;
                height: 0.9rem;
                line-height:0.9rem;
                text-align:center;
                background-color: #e9ecf1;
                border-radius: 0.17rem;
            }
            &.check .partner_check{
                background-color:var(--mainColor);
                &::after{
                    content:"";
                    display:inline-block;
                    vertical-align:middle;
                    width:0.48rem;
                    height:0.38rem;
                    margin:0 auto 0.1rem;
                    background:url(../assets/wap/images/doc/white_check.png) center no-repeat;
                    background-size:contain;
                }
            }
            &.disabled{
                opacity:0.5;
                pointer-events:none;
            }
        }
        .foot{
            position:absolute;
            bottom:0;
            left:0;
            width:100%;
            height:6rem;
            padding:0.75rem;
            p{
                margin-bottom: 0.5rem;
                text-align: center;
                font-size: 0.6rem;
                color: #363636;
            }
            a{
                display:block;
                width:100%;
                height:2.5rem;
                line-height:2.5rem;
                border-radius:4px;
                background:var(--mainColor);
                font-size:0.9rem;
                color:#ffffff;
                text-align:center;
            }
            &.unable{
                a{
                    background:#d3d5dd;
                }
            }
        }
    }
    .footer{
        position:absolute;
        bottom:0;
        left:0;
        width:100%;
        p{
            opacity:0.5;
            margin-bottom: 0.55rem;
            text-align:center;
            font-size:0.5rem;
            color:#656574;
        }
        div{
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
    @media screen and (max-width: 400px) {
        .edit_tips{
            bottom: 0;
        }
    }
</style>