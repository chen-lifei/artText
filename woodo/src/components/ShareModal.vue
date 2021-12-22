<template xmlns:v-clipboard="http://www.w3.org/1999/xhtml">
	<transition name="modal-fade">
        <div class="modal-backdrop" v-show="isShow">
            <template v-if="can_share">
                <div class="share_modal_contain" :class="{'no_authority': !have_authority && share_step === 'share'}">
                    <!-- 分享面板 -->
                    <div class="share_panel" v-if="share_step === 'share'" @click.stop>
                        <div class="header">
                            <div class="panel_tab">
                                <a class="current">分享</a>
                                <a @click="change_share_step('set_authority')" v-if="have_authority">协作</a>
                            </div>
                            <button class="close" @click="close"></button>
                        </div>
                        <div class="body">
                            <!--权限模块-->
                            <div class="authority_message" v-if="have_authority">
                                <!-- 权限图标 -->
                                <div class="authority_icon"><i :class="current_authority"></i></div>
                                <!-- 修改文档名称提示 -->
                                <p class="change_name_tip">分享前请为文档设置一个正式标题</p>
                                <!--文档名称-->
                                <div class="file_name_item">
                                    <span>{{document_info.title}}</span>
                                    <input ref="rename"
                                        maxlength="40"
                                        v-model="document_title"
                                        @click.stop
                                        @focus="rename_focus($event)"
                                        @blur="submit_rename($event)"
                                        @keyup.13="rename_blur($event)"
                                    />
                                </div>
                                <!-- 权限设置 -->
                                <div class="authority_item">
                                    <a @click="toggle_authority_list" :class="{'rotate': show_authority_list}">{{document_authority[current_authority].name}}</a>
                                </div>
                                <!-- 链接有效期 -->
                                <div class="expire_item">
                                    <span class="expire_tip">{{document_expire_time === 0 ? '文档链接已过期' : `文档访问${document_expire_time}有效`}}</span>
                                    <button class="expire_btn" @click="toggle_link_expire">+设置链接有效期</button>
                                </div>
                                <!--文档权限设置面板-->
                                <div class="document_authority_list" v-if="show_authority_list">
                                    <div class="authority_item"
                                        v-for="(item, name) in document_authority"
                                        :key="name"
                                        :type="name"
                                        :class="{'checked': name === current_authority}"
                                        @click="checked_document_authority(name, item)"
                                    >
                                        <p>{{item.name}}</p>
                                        <span>{{item.describe}}</span>
                                    </div>
                                </div>
                                <!-- 分享链接时间模块 -->
                                <div class="link_expire_panel" v-if="link_expire_show">
                                    <ul>
                                        <li v-for="(item,index) in link_expire_arr" :key="index" :class="{checked:item.key === document_expire_type}" @click="change_link_expire(item)">
                                            <p class="name">{{item.name}}</p>
                                            <p class="content">{{item.content}}</p>
                                        </li>
                                    </ul>
                                </div>
                            </div>
                            <!-- 指定成员 -->
                            <div class="partner_panel" v-if="current_authority === 'exclusive' && have_authority">
                                <span class="add_partner_title">指定成员：</span>
                                <a @click="change_share_step('set_authority')">去添加></a>
                                <div class="partner_list">
                                    <img v-for="partner in interim_authority.partner" class="partner_head" :src="partner.head" alt="">
                                </div>
                            </div>
                            <!-- 分享方式 -->
                            <div class="share_way_panel">
                                <p class="title" v-if="have_authority">分享至</p>
                                <div class="way_list">
                                    <!-- 微信分享 -->
                                    <div class="way_item wechat" @click="change_share_step('wechat')">
                                        <button></button>
                                        <p>微信好友</p>
                                    </div>
                                    <!-- 链接分享 -->
                                    <div class="way_item link">
                                        <button type="button" v-clipboard:copy="copy_url" v-clipboard:success="onCopy" v-clipboard:error="onError" v-bdtongji="'文档中心-首页-文件管理-全部-分享弹窗-复制'"></button>
                                        <p>复制链接</p>
                                    </div>
                                    <!-- 邮箱分享 -->
                                    <div v-if="have_authority" class="way_item email" @click="change_share_step('send_email')">
                                        <button></button>
                                        <p>发送邮箱</p>
                                    </div>
                                    <!-- 生成二维码 -->
                                    <div class="way_item qrcode" @click="change_share_step('qrcode')">
                                        <button v-bdtongji="'文档中心-首页-文件管理-全部-分享弹窗-生成二维码'"></button>
                                        <p>生成二维码</p>
                                    </div>
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
                    <!--协作面板-->
                    <div class="set_authority" v-if="share_step === 'set_authority'" @click.stop>
                        <div class="header">
                            <div class="panel_tab">
                                <a @click="change_share_step('share')">分享</a>
                                <a class="current">协作</a>
                            </div>
                            <button class="close" @click="close"></button>
                        </div>
                        <template v-if="current_authority !== 'privacy'">
                            <div class="search_partner">
                                <input type="text" placeholder="输入手机、邮箱、昵称或用户ID添加协作成员"
                                    ref="search_partner_input"
                                    @focus="$event.target.parentNode.style.borderColor = '#0d7bf7'"
                                    @input="search_partner($event)"
                                    @blur="$event.target.parentNode.style.borderColor = '#ccd3db'"
                                >
                                <i class="clear_input" v-if="interim_authority.search_keyword !== ''" @click="clear_search_partner"></i>
                            </div>
                            <a href="https://www.woodo.cn/document/slides/1553258579/" class="partner_invite_tips" target="_blank"><i class="edit-ico edit-ico-horn"></i>快去邀请好友协作文档赢幻币吧~</a>
                        </template>
                        <!--权限设置面板-->
                        <div class="set_authority_panel" @click="authority_selector_close" v-show="!show_add_partner">
                            <div class="privacy_tips" v-if="current_authority === 'privacy'">设置私密后，获得链接及协作的人都将无法再查看编辑文档</div>
                            <div class="add_partner" v-else>
                                <!--所有者-->
                                <div class="partner_list">
                                    <div class="partner_item"
                                        v-for="partner in interim_authority.partner"
                                        v-if="partner.collaborateRoleType === 'owner'"
                                    >
                                        <img class="partner_head" :src="partner.head" alt="">
                                        <span class="partner_name">{{partner.nickName}}</span>
                                        <a class="partner_authority"
                                            :class="{'unable': interim_authority.partner.length <= 1}"
                                            @click.stop="interim_authority.partner.length > 1 && toggle_partner_authority($event, {img:partner.head, name:partner.nickName, owner:true, authority:''})"
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
                                        <a class="partner_authority" @click.stop="toggle_partner_authority($event, partner)">{{partner.collaborateRoleName}}</a>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <!--添加协作者面板-->
                        <div class="add_partner_panel" v-show="show_add_partner" @click.stop>
                            <div class="member_type_panel" v-if="interim_authority.search_keyword === ''">
                                <span class="lately" :class="{'check': current_member_type === 'lately'}" @click="change_member_type('lately')">最近</span>
                                <span class="team" :class="{'check': current_member_type === 'team'}" @click="change_member_type('team')">企业成员</span>
                            </div>
                            <div class="search_partner_result">
                                <div class="partner_list">
                                    <!--列表（已添加）-->
                                    <div class="partner_item"
                                        v-if="interim_authority.added_partner.length > 0 && interim_authority.search_keyword === ''"
                                        v-for="partner in interim_authority.added_partner">
                                        <img class="partner_head" v-if="partner.invitee || partner.head === '' || !partner.head" src="../../public/images/common/default_head.png" alt="">
                                        <img class="partner_head" v-else :src="partner.head" alt="">
                                        <span class="partner_name" v-if="partner.invitee">{{partner.invitee}}</span>
                                        <span class="partner_name" v-else-if="partner.nickName === '' || !partner.nickName">{{partner.memberId}}</span>
                                        <span class="partner_name" v-else>{{partner.nickName}}</span>
                                        <span class="invitee_partner" v-if="partner.invitee">外部</span>
                                        <a class="partner_authority" @click="toggle_partner_authority($event, partner)">{{partner.collaborateRoleName}}</a>
                                    </div>
                                    <!--列表（最近）-->
                                    <div class="partner_item"
                                        v-if="interim_authority.recommend_partner.length > 0 && interim_authority.search_keyword === '' && current_member_type === 'lately'" 
                                        v-for="partner in interim_authority.recommend_partner"
                                    >
                                        <img class="partner_head" v-if="partner.invitee || partner.head === '' || !partner.head" src="../../public/images/common/default_head.png" alt="">
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
                                        v-if="interim_authority.search_result.length > 0 && interim_authority.search_keyword !== ''"
                                        v-for="partner in interim_authority.search_result"
                                    >
                                        <img class="partner_head" v-if="partner.invitee || partner.head === '' || !partner.head" src="../../public/images/common/default_head.png" alt="">
                                        <img class="partner_head" v-else :src="partner.head" alt="">
                                        <span class="partner_name" v-if="partner.invitee">{{partner.invitee}}</span>
                                        <span class="partner_name" v-else-if="partner.nickName === '' || !partner.nickName">{{partner.memberId}}</span>
                                        <span class="partner_name" v-else>{{partner.nickName}}</span>
                                        <span class="invitee_partner" v-if="partner.invitee">外部</span>
                                        <a class="add_partner_btn" v-if="!partner.documentCollaborateId" @click="add_interim_partner(partner)">添加</a>
                                        <a class="partner_authority" v-if="partner.documentCollaborateId"  @click="toggle_partner_authority($event, partner)">{{partner.collaborateRoleName}}</a>
                                    </div>
                                    <!--列表 (企业成员)-->
                                    <div class="partner_item"
                                        v-if="interim_authority.team_partner.length > 0 && interim_authority.search_keyword === '' && current_member_type === 'team'"
                                        v-for="partner in interim_authority.team_partner"
                                    >
                                        <img class="partner_head" v-if="partner.memberHead === '' || !partner.memberHead" src="../../public/images/common/default_head.png" alt="">
                                        <img class="partner_head" v-else :src="partner.memberHead" alt="">
                                        <span class="partner_name" v-if="partner.memberNickName === '' || !partner.memberNickName">{{partner.memberId}}</span>
                                        <span class="partner_name" v-else>{{partner.memberNickName}}</span>
                                        <a class="add_partner_btn" v-if="!partner.documentCollaborateId" @click="add_interim_partner(partner)">添加</a>
                                        <a class="partner_authority" v-if="partner.documentCollaborateId"  @click="toggle_partner_authority($event, partner)">{{partner.collaborateRoleName}}</a>
                                    </div>
                                </div>
                                <!--空状态-->
                                <div class="empty_partner"
                                    v-if="(interim_authority.search_keyword === '' && interim_authority.recommend_partner.length <= 0 && interim_authority.added_partner.length <= 0) && current_member_type === 'lately'|| (interim_authority.search_keyword !== '' && interim_authority.search_result.length <= 0)"
                                >
                                    <p>無</p>
                                    <span v-if="interim_authority.search_keyword === ''">暂无成员</span>
                                    <span v-else>没有搜索结果</span>
                                </div>
                            </div>
                        </div>
                        <!--通用底部按钮组-->
                        <div class="partner_foot" v-if="current_authority !== 'privacy'">
                            <a class="add_from_wechat" :class="{'left': show_add_partner}">添加微信好友</a>
                            <div class="add_partner_ewm">
                                <div class="code_outer">
                                    <div id='partner_code'></div>
                                    <canvas id="partner_ewm_canvas"></canvas>
                                </div>
                                <span>微信扫码邀请好友</span>
                            </div>
                            <a class="to_add_partner" @click="toggle_add_partner" v-if="!show_add_partner">添加协作成员</a>
                            <template v-if="show_add_partner">
                                <a class="cancel_btn"
                                @click="toggle_add_partner"
                                >取消</a>
                                <a class="ok_btn"
                                :class="{unable:interim_authority.added_partner.length <= 0}"
                                :disable="interim_authority.added_partner.length <= 0"
                                @click="sure_add_partner"
                                >确定</a>
                            </template>
                        </div>
                        <!--所有者权限下拉框-->
                        <div class="partner_authority_list change_owner"
                            v-if="editing_partner.owner"
                            v-show="show_partner_authority"
                            :style="{top:partner_authority_top+'px'}"
                        >
                            <div class="partner_authority_item" @click.stop="change_document_owner">
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
                        <!--选择转让者面板-->
                        <div class="change_owner_panel"
                            v-if="change_owner_step === 'chose_owner'"
                            @click.stop="cancel_change_owner"
                        >
                            <div class="change_owner_inner">
                                <p>选择转让对象</p>
                                <div class="change_owner_list">
                                    <div class="owner_item" v-for="partner in interim_authority.partner" v-if="!partner.invitee && partner.collaborateRoleType !== 'owner'">
                                        <img class="partner_head" v-if="partner.invitee" src="../../public/images/common/default_head.png" alt="">
                                        <img class="partner_head" v-else :src="partner.head" alt="">
                                        <span class="partner_name" v-if="partner.invitee">{{partner.invitee}}</span>
                                        <span class="partner_name" v-else>{{partner.nickName}}</span>
                                        <a @click.stop="show_sure_change(partner)">转让</a>
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
                    </div>
                    <!-- 发送邮件面板 -->
                    <div class="panel send_email" v-if="share_step === 'send_email'" @click.stop>
                        <div class="header">
                            <a class="back" @click="change_share_step('share')"></a>
                            <button class="close" @click="close"></button>
                        </div>
                        <div class="body">
                            <p>邮件分享</p>
                            <input type="email" ref="send_email" placeholder="输入收件人邮箱地址" 
                                @focus="$event.target.style.borderColor = '#0d7bf7'"
                                @blur="$event.target.style.borderColor = 'rgba(194, 194, 194, 0.58)'"/>
                            <button type="button" @click="send_doc_email" :disabled="email_sending" v-bdtongji="'文档中心-首页-文件管理-全部-分享弹窗-邮件发送'">发送</button>
                            <p class="wrong_email_tip" v-if="wrong_email">请输入正确的邮箱！</p>
                        </div>
                    </div>
                    <!-- 分享微信好友面板 -->
                    <div class="panel wechat_share" v-if="share_step === 'wechat'" @click.stop>
                        <div class="header">
                            <a class="back" @click="change_share_step('share')"></a>
                            <button class="close" @click="close"></button>
                        </div>
                        <div class="body">
                            <p>小程序分享</p>
                            <img id="wechat_share_qrcode" :src="wechat_img"></img>
                            <p>微信扫一扫，文档分享给好友</p>
                        </div>
                    </div>
                    <!-- 生成二维码面板 -->
                    <div class="panel create_qrcode" v-if="share_step === 'qrcode'" @click.stop>
                        <div class="header">
                            <a class="back" @click="change_share_step('share')"></a>
                            <button class="close" @click="close"></button>
                        </div>
                        <div class="body">
                            <p>扫码分享</p>
                            <canvas id="doc_share_qrcode"></canvas>
                            <p>微信、手机浏览器扫码分享给好友</p>
                        </div>
                    </div>
                </div>
            </template>
            <!-- 文档链接过期提示弹框 -->
            <doc_expire_modal ref="doc_expire_modal" v-show="!can_share" @close="close"></doc_expire_modal>
        </div>
	</transition>
</template>

<script>
    /*
    * 分享弹框流程
    * 作品分享 -> 非作者样式
    * 文档分享 -> 所有者 -> 作者样式
    *            协作者 -> 非作者样式
    * */
    import QRCode from 'qrcode';
    import collaborate from '@/assets/common/js/collaborate.js';
    import doc_expire_modal from '@/components/DocExpireModal.vue';
    export default {
        name: 'shareModal',
        components: {
            doc_expire_modal,
        },
        data() {
            return {
                isShow: false,
                // 是否可以分享
                can_share:true,
                user: {},           // 用户信息
                // 分享弹框步骤标识: share = 分享弹窗 set_authority = 权限设置面板
                share_step: 'share',
                
                message: "",    //复制展示链接
                copy_url:"",    //复制实际链接
                // 发送邮件状态
                wrong_email:false, //错误邮箱标识
                send_email_address:"", //发送邮箱地址
                email_sending:false,  //邮件正在发送状态标识

                // 有编辑访问权限
                have_authority: false,
                // 当前文档的权限
                current_authority: 'open',
                link_expire_arr:[
                    {key:'forever',name:'永久有效',countdown:'永久',content:'适用于个人主页，公开资料'},
                    {key:'sevenDay',name:'7天',countdown:'7天',content:'适用于小组或部门内分享，7天后失效，他人将无法访问文档'},
                    {key:'oneDay',name:'1天',countdown:'1天',content:'适用隐私性较强的内部文档'},
                ],
                document_expire_type:'',
                document_expire_time:'永久',
                link_expire_show:false,
                // 文档权限列表
                document_authority: {
                    'open': {
                        name: '任何人都可查看',
                        describe: '获得链接的人都可以查看',
                    },
                    'edit': {
                        name: '任何人都可编辑',
                        describe: '获得链接的人都可以编辑',
                    },
                    'exclusive': {
                        name: '指定专属成员',
                        describe: '仅指定的成员可查看/编辑',
                    },
                    'privacy': {
                        name: '私密',
                        describe: '仅自己可查看/编辑',
                    },
                },
                // 移除成员协作提示内容优化
                delete_authority_text_map: {
                    'onlyView': '查看',
                    'onlyReview': '评论',
                    'edit': '编辑'
                },
                // 协作权限列表
                partner_authority:[],
                // 分享 - 全部协作者标识
                show_all_partners: false,
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
                // 权限设置 - 文档权限列表标识
                show_authority_list: false,
                // 权限设置 - 私密确认框标识
                show_privacy_confirm: false,
                // 权限设置 - 转让所有权步骤 => null -> chose_owner -> sure_change
                change_owner_step: null,
                // 权限设置 - 转让所有权 - 选中转让人
                chose_owner_partner:false,
                // 添加协作者 - 面板标识
                show_add_partner: false,
                // 添加协作者 - 正在添加标识
                adding_partner: false,
                // 通用 - 正在编辑协作者
                editing_partner: {
                    img:'',
                    name: '',
                    authority: '',
                    owner: false,
                },
                // 通用 - 协作者权限编辑框
                show_partner_authority: false,
                // 通用 - 协作者权限编辑框定位
                partner_authority_top: 0,
                // 通用 - 移除协作确认框标识
                show_remove_confirm: false,

                //websocket
                ws_client_method:{},

                // 文档、作者 信息
                document_type: '',
                document_info: {},
                document_pages: [],
                document_title: '',
                document_author: '',
                doc_old_name: '',                   //  未修改时的文档名称
                current_member_type: 'lately',      // 选中的成员类型最近 || 企业，默认最近
                wechat_img: '',
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
                    if(that.$parent.ws_client_method) utils.isFunctionCall(that.$parent.ws_client_method.doc_authority_send, id, data);
                }catch(e){
                    console.error(e);
                }
            },

            // 显示分享框
            show: function(obj) {
                let that = this;
                let opt = {
                    type: 'slides',         // 文档类型  slides = 普通文档  design = 设计文档  works = 作品  template = 模板
                    urlid: null,            // 文档 url 或 id
                    share_step: 'share'     // 面板类型 share => 分享面板 set_authority => 协作面板 send_email => 发送邮件面板 wechat => 分享微信好友面板 qrcode => 生成二维码面板
                };
                opt = Object.assign(opt, obj);
                if (!opt.urlid) {
                    return;
                }
                that.share_step = opt.share_step;
                that.user = that.$common.get_login_state();
                // 获取协作者权限列表
                let authority = Object.values(collaborate.authority_map);
                authority.shift();
                that.partner_authority = authority;
                // 根据类型获取文档信息
                that.document_type = opt.type;
                switch(opt.type) {
                    case 'template':
                        that.get_template_document_info(opt.urlid);
                        break;
                    case 'works':
                        that.get_work_document_info(opt.urlid);
                        break;
                    default:
                        that.get_document_info(opt.urlid);
                        break;
                }
            },
            // 获取文档数据
            get_document_info: function (url) {
                let that = this;
                that.$axios.get('/api/document/get_share_doc_info/?url=' + url).then(res => {
                    let res_data = res.data;
                    if (res_data.type !== 'success') {
                        that.$toast(res_data.content);
                        that.can_share = false;
                    }else{
                        if(!res_data.data.document.isUrlEffect){
                            that.$refs.doc_expire_modal.show(res_data.data.document);    
                            that.can_share = false;
                        }else{
                            let document_info = that.$common.document_dataparse(res_data.data.document);
                            let document_pages = that.$common.document_pages_dataparse(res_data.data.documentPages);
                            that.document_info = document_info;
                            that.document_pages = document_pages;
                            that.document_title = document_info.title;
                            that.have_authority = res_data.data.collaborateRoleType === 'owner';
                            // 获取设置权限
                            that.get_document_authority(document_info.id);
                            that.can_share = true;
                            that.copy_url = `${location.origin}/document/slides/${document_info.url}/`;
                        }
                    }
                    that.isShow = true;
                }).catch((err) => {
                    console.error(err);
                });
            },
            // 获取权限设置
            get_document_authority: function (id) {
                let that = this;
                // 没权限修改
                if (!that.have_authority) {
                    return;
                }
                that.$axios.get('/api/member/document/authority/', {
                    params: {
                        docId: id,
                    },
                }).then(res => {
                    let res_data = res.data;
                    if (res_data.type !== 'success') {
                        return that.$toast(data.data.content);
                    }
                    let document_authority = that.document_authority;
                    // 当前文档访问权限
                    that.current_authority = res_data.data.visitType;
                    // 作者名称
                    that.document_author = res_data.data.documentCollaborates.filter(item => item.collaborateRoleType === 'owner')[0].nickName;
                    // 权限信息
                    that.interim_authority.document.id = res_data.data.id;
                    that.interim_authority.partner = res_data.data.documentCollaborates;
                    that.interim_authority.document.doc_type = res_data.data.documentType;
                    // 获取文档链接有效期
                    that.document_expire_type = res_data.data.urlExpireType;
                    that.document_expire_time = res_data.data.isUrlEffect ? (res_data.data.urlExpireDate ? utils.expireTime(res_data.data.urlExpireDate) : '永久') : 0;
                });
            },
            // 获取模板数据
            get_template_document_info: function (id) {
                let that = this;
                that.$axios.get(`/api/template/detail/${id}/`).then(res => {
                    let res_data = res.data;
                    if (res_data.type !== 'success') {
                        return that.$toast(res_data.content);
                    }
                    let document_info = that.$common.document_dataparse(res_data.data.document);
                    let document_pages = that.$common.document_pages_dataparse(res_data.data.documentPages);
                    that.document_info = document_info;
                    that.document_pages = document_pages;
                    let template_info = res_data.data.template;
                    let author = res_data.data.author;
                    that.document_title = template_info.name;
                    that.document_author = author.name;
                    that.have_authority = false;
                    that.isShow = true;

                    if(that.$route.path.includes("/template/detail")){
                        that.copy_url = window.location.href;
                    }else{
                        that.copy_url = `${location.origin}/template/slides/${template_info.id}/`;
                    }
                }).catch(err => {
                    console.error(err);
                });
            },
            // 获取作品作者信息
            get_work_document_info: function (id) {
                let that = this;
                that.$axios.get(`/api/works_share/detail/${id}/`).then(res => {
                    let res_data = res.data;
                    if (res_data.type !== 'success') {
                        return that.$toast(data.data.content);
                    }
                    let document_info = that.$common.document_dataparse(res_data.data.document);
                    let document_pages = that.$common.document_pages_dataparse(res_data.data.documentPages);
                    that.document_info = document_info;
                    that.document_pages = document_pages;
                    that.document_title = res_data.data.worksName;
                    that.document_author = res_data.data.authorName;
                    that.have_authority = false;
                    that.isShow = true;
                    that.copy_url = `${location.origin}/works/slides/${res_data.data.worksId}/`;
                }).catch(err => {
                    console.error(err);
                });
            },
            
            
            // 隐藏分享框
            close: function() {
                if(this.email_sending) return;
                this.isShow = false;
                setTimeout(() => {
                    this.share_step = '';
                }, 500)
            },
            // 复制链接成功
            onCopy: function() {
                let that = this;
                that.$toast("复制成功", 2000);
            },
            // 复制链接失败
            onError: function() {this.$toast("复制失败", 2000);},
            // 邮箱校验
            validate_email:function(){
                let email = this.$refs.send_email.value;
                this.wrong_email = !$validate(email).email();
                this.send_email_address = email;
                return this.wrong_email;
            },
            // 发送邮件
            send_doc_email: function(type){
                let that = this;
                if (that.validate_email()) {
                    return;
                } 
                that.$export.start({
                    fileType: that.interim_authority.document.doc_type === 'slides' ? 'ppt' : 'image',
                    title: that.document_title,
                    emailAddress: that.send_email_address,
                    param: {
                        opt: 'documentDownload',
                        id: that.interim_authority.document.id,
                    },
                    success: function() {
                        that.email_sending = true;
                        that.$toast('邮件正在发送中...', 180000, 'pc', undefined);
                    },
                    complete: function(type){
                        that.email_sending = false;
                    },
                    error: function(){
                        toast('邮件发送失败', 2000, 'pc', undefined, 'clear');
                        that.send_doc_email(type);                                
                    }
                });
            },
            // 权限设置 - 打开链接有效期下拉框
            toggle_link_expire: function(){
                let that = this;
                that.link_expire_show = !that.link_expire_show;
            },
            // 权限设置 - 设置分享链接有效期
            change_link_expire: function(item){
                let that = this;
                that.link_expire_show = false;
                that.$axios.post('/api/member/document/set_url_expire/', {
                    docId: that.document_info.id,
                    type:item.key
                })
                .then(function(data){
                    if(data.data.code == 2){
                        that.document_expire_type = item.key;
                        that.document_expire_time = item.countdown;
                        that.$toast("设置成功",1000);
                    }else{
                        that.$toast(data.data.content,1000);
                    }
                })
            },

            // 获取当前文档全部协作者
            get_all_partner:function(socket_send){
                let that = this;
                let authority_id = that.interim_authority.document.id;
                collaborate.specific(that, {
                    id: authority_id,
                    success: function(data){
                        if(data.data.code === '2'){
                            let partner = Object.values(data.data.data)[0];
                            if(typeof(partner) === 'undefined') partner = [];
                            that.interim_authority.partner = partner;
                            // 判断发送通讯
                            if(socket_send) that.ws_doc_authority_send();
                            // 判断同步协作者状态到文档中心
                            if(that.$parent.document_list && socket_send){
                                let collaborates_document = JSON.parse(JSON.stringify(that.$parent.collaborates_document));
                                if(collaborates_document[authority_id]){
                                    collaborates_document[authority_id] = partner;
                                    that.$parent.collaborates_document = collaborates_document;
                                }
                            }
                            // 判断同步协作者状态到编辑页
                            if(that.$parent.document_info && that.$parent.document_info.id === that.interim_authority.document.id) that.$parent.get_all_partner();
                        }
                    }
                });
            },
            // 调整分享弹框步骤
            change_share_step:function(data){
                let that = this;
                // 隐藏文档权限下拉
                that.show_authority_list = false;
                that.wrong_email = false;
                let name = that.document_info.documentType === 'slides' ? '幻灯片作品' : '设计作品';
                // 未修改过名称时激活文档标题高亮
                if(that.have_authority && that.document_title === name && ['set_authority','share'].indexOf(data) < 0){
                    $('.file_name_item input').focus();
                    $('.change_name_tip').addClass('show')
                    setTimeout(() => {
                        $('.change_name_tip').removeClass('show');
                    }, 1500)
                    return false;
                }
                // 判断为进入权限设置面板 => 初始化临时设置对象
                if(data === 'set_authority'){
                    that.share_step = data;
                    // 获取文档协作者列表
                    that.get_all_partner();
                    // 获取团队成员列表
                    that.$axios.get('/api/member/team/base_msg/')
                    .then((data) => {
                        that.user.have_team = data.data.code === '2' ? true : false;
                    })
                    // 生成分享协作二维码
                    that.$nextTick(()=>{
                        that.get_invitee_code();
                    })
                }else if(data === 'qrcode'){
                    that.share_step = data;
                    // 生成分享文档演示页二维码
                    that.$nextTick(()=>{
                        that.create_doc_qrcode();
                    })
                }else if(data === 'wechat'){
                    // 生成小程序码
                    that.$nextTick(() => {
                        that.create_wechat_code();
                    })
                }else{
                    that.share_step = data;
                }
            },
            // 分享 - 显示/隐藏全部协作者弹框
            toggle_all_partners:function(){
                this.show_all_partners = !this.show_all_partners;
            },
            // 权限设置 - 面板点击关闭下拉
            authority_selector_close:function(){
                let that = this;
                // 关闭文档权限下拉
                that.show_authority_list = false;
                // 关闭协作者权限
                that.interim_authority.partner.forEach(function(item){item.checked = false;});
                that.show_partner_authority = false;
                that.editing_partner = false;
            },
            // 权限设置 - 显示/隐藏文档权限列表
            toggle_authority_list:function(){
                let that = this;
                that.show_authority_list = !that.show_authority_list;
                // 关闭协作者权限
                that.interim_authority.partner.forEach(function(item){item.checked = false;});
                that.show_partner_authority = false;
                that.editing_partner = false;
            },
            // 权限设置 - 选择文档权限
            checked_document_authority:function(key, item){
                let that = this,
                    document = that.interim_authority.document;
                if(key === 'privacy'){
                    that.show_privacy_confirm = true;
                    that.show_authority_list = false;
                    return false;
                }
                that.$axios.post('/api/member/document/authority/save/', {
                    docId: document.id,
                    visitType: key,
                }).then(function(data){
                    if(data.data.code === '2'){
                        that.current_authority = key;
                        that.interim_authority.document.name = item.name;
                        that.interim_authority.document.describe = item.describe;
                        that.show_authority_list = false;
                        // 同步到文档中心
                        if (that.$parent.document_list) {
                            let document_list = JSON.parse(JSON.stringify(that.$parent.document_list)),
                                current_doc = document_list.filter(item => item.id === document.id)[0];
                            if(current_doc){
                                current_doc.visitType = key;
                                that.$parent.document_list = document_list;
                            }
                        }
                    }else{
                        that.$toast(data.data.content);
                    }
                });
            },
            // 权限设置 - 私密确认 - 确认
            privacy_confirm_sure:function(){
                let that = this,
                    document = that.interim_authority.document;
                that.show_privacy_confirm = false;
                that.$axios.post('/api/member/document/authority/save/', {
                    docId: document.id,
                    visitType: 'privacy'
                })
                    .then(function(data){
                        if(data.data.code === '2'){
                            that.current_authority = 'privacy';
                            that.interim_authority.document.name = '私密';
                            that.interim_authority.document.describe = '仅自己可查看/编辑';
                            that.interim_authority.partner = that.interim_authority.partner.filter(item => item.collaborateRoleType === 'owner');
                            that.show_authority_list = false;
                            // 同步到文档中心
                            if (that.$parent.document_list) {
                                let document_list = JSON.parse(JSON.stringify(that.$parent.document_list)),
                                    current_doc = document_list.filter(item => item.id === document.id)[0];
                                if(current_doc){
                                    current_doc.visitType = 'privacy';
                                    that.$parent.document_list = document_list;
                                    that.$parent.get_document_collaborates();
                                }
                            }
                            // 判断同步协作者状态到编辑页
                            if(that.$parent.document_info && that.$parent.document_info.id === that.interim_authority.document.id){
                                that.$parent.interim_authority.partner = [];
                                // 获取协作者列表，触发通讯
                                that.get_all_partner(true);
                            }
                        }else{
                            that.$toast(data.data.content);
                        }
                    });
            },
            // 权限设置 - 私密确认 - 取消
            privacy_confirm_cancel:function(){
                this.show_privacy_confirm = false;
            },
            // 权限设置 - 转让所有权 - 显示协作者面板
            change_document_owner:function(){
                this.show_partner_authority = false;
                this.change_owner_step = 'chose_owner';
            },
            // 权限设置 - 转让所有权 - 确认弹框
            show_sure_change:function(partner){
                this.chose_owner_partner = partner;
                this.change_owner_step = 'sure_change';
            },
            // 权限设置 - 转让所有权 - 取消
            cancel_change_owner:function(){
                this.change_owner_step = null;
                this.show_partner_authority = false;
                this.editing_partner.owner = false;
                this.chose_owner_partner = false;
            },
            // 权限设置 - 转让所有权 - 确定
            sure_change_owner:function(){
                let that = this;
                that.$axios.post('/api/member/document/transfer/',{
                    docId: that.interim_authority.document.id,
                    memberId: that.chose_owner_partner.memberId
                }).then(function(data){
                    if(data.data.code === '2'){
                        location.reload();
                    }else{
                        that.$toast(data.data.content, 1000);
                    }
                });
            },
            // 添加协作 - 显示/隐藏
            toggle_add_partner:function(){
                let that = this;
                that.show_add_partner = !that.show_add_partner;
                if(that.show_add_partner){
                    that.current_member_type = 'lately';
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
                    that.clear_search_partner();
                    // 生成二维码
                    that.$nextTick(function(){
                        // 清除搜索
                        that.get_invitee_code();
                    })
                }
                that.show_partner_authority = false;
            },
            // 添加协作 - 邀请码
            get_invitee_code:function(){
                let that = this;
                let url = `${location.origin}/mobile/invite/?docId=${that.interim_authority.document.id}`;
                let $canvas = document.getElementById('partner_ewm_canvas');
                QRCode.toCanvas($canvas, url, {width:146}, function(error) {if(error) console.error(error);});
            },
            // 添加协作 - 搜索协作者
            search_partner:function(){
                let that = this,
                    keyword = that.$refs.search_partner_input.value;
                that.interim_authority.search_keyword = keyword;
                that.show_add_partner = true;
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
            // 添加协作 - 清除搜索
            clear_search_partner:function(){
                let that = this;
                // 清除输入框
                if(that.$refs.search_partner_input) that.$refs.search_partner_input.value = '';
                // 清除搜索关键词
                that.interim_authority.search_keyword = '';
                // 清除搜索结果列表
                that.interim_authority.search_result = [];
            },
            // 添加协作 - 临时添加
            add_interim_partner:function(partner){
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
                that.current_member_type = 'lately';
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
                        that.get_all_partner(true);
                    },
                    fail: function(){
                        that.show_add_partner = false;
                        that.adding_partner = false;
                        that.get_all_partner(true);
                    }
                });
            },
            // 显示/隐藏协作者权限下拉
            toggle_partner_authority:function(e, partner){
                let that = this,
                    $item = $(e.target).parents('.partner_item'),
                    list_top = 0,
                    $scroll;
                that.show_authority_list = false;
                // 错误状态判断
                if(!partner || $item.length <= 0) return false;
                let action_list;	// 正在操作的协作者列表
                switch (true) {
                    // 判断当前操作为 权限设置 - 文档权限面板
                    case that.share_step === 'set_authority':
                        action_list = that.interim_authority.partner;
                        $scroll = $('.set_authority .add_partner .partner_list');
                        break;
                    // 判断当前操作为 权限设置 - 添加协作者面板（推荐协作者）
                    case that.share_step === 'set_authority' && that.show_add_partner && that.interim_authority.search_keyword === '':
                        action_list = that.interim_authority.recommend_partner;
                        $scroll = $('.add_partner_panel .search_partner_result');
                        break;
                    // 判断当前操作为 权限设置 - 添加协作者面板（搜索结果）
                    case that.share_step === 'set_authority' && that.show_add_partner && that.interim_authority.search_keyword !== '':
                        action_list = that.interim_authority.search_result;
                        $scroll = $('.add_partner_panel .search_partner_result');
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
            checked_partner_authority:function(item){
                let that = this,
                    action_list,
                    partner;
                switch (true) {
                    // 判断当前操作为 权限设置 - 文档权限面板 || 全部协作者弹框
                    case that.share_step === 'set_authority' && !that.show_add_partner:
                        action_list = that.interim_authority.partner;
                        break;
                    // 判断当前操作为 权限设置 - 添加协作者面板（推荐协作者）
                    case that.share_step === 'set_authority' && that.show_add_partner && that.interim_authority.search_keyword === '' && that.current_member_type === 'lately':
                        action_list = that.interim_authority.added_partner;
                        break;
                    // 判断当前操作为 权限设置 - 添加协作者面板（团队成员）
                    case that.share_step === 'set_authority' && that.show_add_partner && that.interim_authority.search_keyword === '' && that.current_member_type === 'team':
                        action_list = that.interim_authority.team_partner;
                        break;
                    // 判断当前操作为 权限设置 - 添加协作者面板（搜索结果）
                    case that.share_step === 'set_authority' && that.show_add_partner && that.interim_authority.search_keyword !== '':
                        action_list = that.interim_authority.search_result;
                        break;
                }
                partner = action_list.filter(item => item.checked)[0];
                // 判断当前协作者为已添加
                if(partner.documentCollaborateId){
                    if(item.type === 'remove'){
                        // 搜索结果为已添加协作者情况兼容
                        that.interim_authority.partner.forEach(function(item){
                            item.checked = item.documentCollaborateId === partner.documentCollaborateId;
                        });
                        that.show_partner_authority = false;
                        return that.show_remove_confirm = true;
                    }
                    collaborate.change(that, {
                        id: that.interim_authority.document.id,
                        role: item.type,
                        collaborateId: partner.documentCollaborateId,
                        success: function(data){
                            if(data.data.code === '2'){
                                // 判断当前为添加协作者面板
                                if(that.show_add_partner) that.toggle_add_partner();
                                that.get_all_partner(true);
                            }
                        }
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
                action_list.forEach(function(item){item.checked = false;});
                that.show_partner_authority = false;
            },
            // 协作者权限 - 移除确认 - 取消
            remove_confirm_cancel:function(){
                this.show_remove_confirm = false;
            },
            // 协作者权限 - 移除确认 - 确认
            remove_confirm_sure:function(){
                let that = this,
                    action_list = that.interim_authority.partner,
                    partner;
                partner = action_list.filter(item => item.checked)[0];
                collaborate.delete(that, {
                    id: that.interim_authority.document.id,
                    partner: partner,
                    success: function(data){
                        if(data.data.code !== '2') that.$toast(data.data.content, 800);
                        that.get_all_partner(true);
                        that.show_remove_confirm = false;
                        that.show_partner_authority = false;
                        if(that.show_add_partner) that.toggle_add_partner();
                    }
                });
            },

            // 切换成员类型
            change_member_type: function(type){
                this.current_member_type = type;
                if(this.current_member_type === 'team') {
                    // 获取团队成员
                    this.get_team_member();
                }
            },
            // 获取团队成员
            get_team_member: function() {
                let that = this;
                that.$axios.get('/api/member/team/members/')
                .then(data => {
                    if (data.data.code == 2 && data.data.data.length > 0) {
                        let partner = that.interim_authority.partner;
                        // 过滤当前用户
                        let team_partner = data.data.data.filter(item => {
                            return item.memberId !== that.user.id;
                        })
                        // 查询团队成员是否是该文档的协作成员
                        team_partner.forEach((item, index) => {
                            item.head = item.memberHead;
                            item.nickName = item.memberNickName; 
                            partner.forEach((info) => {
                                if(info.memberId === item.memberId){
                                    // 合并对象
                                    team_partner[index] = Object.assign(item, info);
                                }
                            })
                        })
                        that.interim_authority.team_partner = team_partner;
                    } else {
                        that.interim_authority.team_partner = [];
                    }
                    // 视图无法更新，强制更新
                    that.$forceUpdate();
                })
            },
            // 生成文档二维码
            create_doc_qrcode: function() {
                let that = this;
                let $canvas = document.getElementById('doc_share_qrcode');
                QRCode.toCanvas($canvas, that.copy_url, {width:165}, function(error) {if(error) console.error(error);});
            },
            // 生成小程序码
            create_wechat_code: function() {
                let that = this;
                let share_qrcode_url;
                switch(that.document_type){
                    case 'works':
                        share_qrcode_url = `works_${that.document_info.url}`;
                        break;
                    case 'template':
                        share_qrcode_url = `template_${that.document_info.url}`;
                        break;
                   default:
                        share_qrcode_url = `document_${that.document_info.url}`;
                        break;
                }
                that.$axios.get('/api/weixin/app/create_app_code/',{params:{
                    sceneType: 'share',
                    param: share_qrcode_url,
                }}).then( (data) => {
                    that.wechat_img = "data:image/png;base64,"+data.data.data.image;
                    that.share_step = 'wechat';
                })
            },
            // 重命名聚焦事件
            rename_focus: function(e){
                this.doc_old_name = e.target.value;
                $(e.target).parents('.file_name_item').addClass('focus');
            },
            // 重命名失焦
			rename_blur: function(e){
				$(e.target).blur();
			},
            // 重命名
            submit_rename: function(e){
                let that = this,
                    rename = that.$refs.rename.value;
                // 未做修改，不请求接口
                if(rename === that.doc_old_name ){
                    $(e.target).parents('.file_name_item').removeClass('focus');
                    return false;
                } 
                // 错误拦截
				if($validate(rename).special()) return that.$toast('不能包含特殊字符', 2000);
                if($validate(rename).null()) {
                    that.document_title = that.document_info.title;
					that.$toast('输入不能为空', 2000);
				}else{
                    that.$axios.post('/api/member/document/rename/', {
                        docId: that.document_info.id,
                        title: rename
                    }).then((data) => {
                        if(data.data.code !== '2') return that.$toast(data.data.content, 2000);
                        that.document_info.title = rename;
                        // 向父组件传值，设置标题回显
                        let obj ={
                            id: that.document_info.id,
                            name: rename
                        }
                        that.copy_url = `${location.origin}/document/slides/${that.document_info.url}/`;
                        that.$emit('fresh_doc_name', obj)
                        that.$toast('修改成功', 1500);
                    })
                }
                $(e.target).parents('.file_name_item').removeClass('focus');
            }
        },
    }
</script>

<style lang="less" scoped>
    @modal_sp:url(../assets/pc/images/common/modal_sp.png) no-repeat;
    @new_icon: url(../assets/pc/images/doc/icon_2.3.0.png) no-repeat;
    @newer_icon: url(../assets/pc/images/doc/icon_2.3.1.png) no-repeat;

    .modal-backdrop{
        text-align:center;
        overflow:hidden;
        &:after{
            content:"";
            display:inline-block;
            width:0;
            height:100%;
            vertical-align:middle;
        }
        &>div{
            display:inline-block;
        }
    }
    .share_modal_contain{
        position: absolute;
        top: 50%;
        left: 50%;
        bottom: auto;
        right: auto;
        width: 480px;
        height: auto;
        padding:20px 30px 30px 30px;
        margin: 0;
        border-radius: 4px;
        background-color: #ffffff;
        text-align: left;
        transform: translate(-50%, -50%);
        .header{
            position:relative;
            margin-bottom:30px;
            .panel_tab{
                display:inline-block;
                vertical-align:top;
                width:50%;
                a{
                    display:inline-block;
                    height:30px;
                    line-height:30px;
                    font-size:16px;
                    color:#282c30;
                    cursor:pointer;
                    &.current{
                        color:var(--mainColor);
                        border-bottom:2px solid var(--mainColor);
                    }
                    &:first-child{
                        margin-right:25px;
                    }
                    &:hover{
                        color:var(--mainColor);
                    }
                }
                
            }
            .back{
                display:inline-block;
                vertical-align:middle;
                width:27px;
                height:27px;
                background:@newer_icon -178px -3px;
                &:hover{
                    opacity:0.7;
                }
            }
            .title{
                display:inline-block;
                vertical-align:middle;
                margin-left:14px;
                font-size:16px;
                color:#282c30;
            }
        }
        .close{
            position:absolute;
            top: 0;
            right: -12px;
            display:inline-block;
            width:18px;
            height:18px;
            background:@modal_sp 7px 5px;
            transition:all .3s;
            &:hover{
                opacity:.7;
            }
        }
        &.no_authority{
            padding-bottom: 40px;
            .share_way_panel{
                margin-top: 30px;
            }
        }
    }
    /* 分享面板 */
    .share_panel{
        width:100%;
        height:auto;
        // 权限模块
        .authority_message{
            position:relative;
            width:100%;
            height:144px;
            padding:23px 24px 20px 19px;
            border-radius:2px;
            border: solid 1px rgba(221, 221, 221, 0.58);
            .authority_icon{
                display:inline-block;
                vertical-align:top;
                width:80px;
                height:112px;
                line-height:100px;
                margin-right:38px;
                text-align:center;;
                background:@newer_icon;
                background-position: 0 -48px;
                i{
                    display:inline-block;
                    vertical-align:middle;
                    width:40px;
                    height:40px;
                    border-radius:50%;
                    background:#ffffff @newer_icon;
                    box-shadow: 0px 5px 5px 0px rgba(0, 0, 0, 0.06);
                    &.open{
                        background-position: -70px 13px;
                    }
                    &.edit{
                        background-position: -105px 10px
                    }
                    &.exclusive{
                        background-position: 10px 10px;
                    }
                    &.privacy{
                        background-position: -28px 10px;
                    }
                }
            }
            .change_name_tip{
                position: absolute;
                top: -16px;
                left: 30%;
                padding: 6px 14px;
                border-radius: 4px;
                background: #fff6b2;
                color: #1f1f1f;
                font-size: 14px;
                opacity: 0;
                transform: opacity .3s;
                &.show{
                    opacity : 1;
                }
            }
            // 文档名称
            .file_name_item{
                position: absolute;
                top: 23px;
                left: 137px;
                max-width: calc(100% - 161px);
	            height: 23px;
                padding: 0 2px;
                overflow: hidden;
                text-overflow:ellipsis;
                white-space: nowrap;
                span{
                    display:inline-block;
                    max-width: 100%;
                    line-height: 23px;
                    color: #26282b;;
                    font-size: 16px;
                    overflow: hidden;
                    text-overflow: ellipsis;
                    white-space: nowrap;
                }
                input{
                    position:absolute;
                    top:0;
                    left:0;
                    opacity:0;
                    z-index:-1;
                    line-height: 23px;
                    width: 170px;
                    overflow:hidden;
                    color: #26282b;
                    font-size: 16px;
                }
                &:hover{
                    background:#3e8aff;
                    cursor:text;
                    span{
                        color:#fff;
                        z-index:-1;
                    }
                    input{
                        z-index:2;
                    }
                }
                &.focus{
                    border-bottom:1px solid var(--mainColor);
                    background:transparent !important;
                    span{
                        width:150px;
                        opacity:0 !important;
                        z-index:-1 !important;
                    }
                    input{
                        opacity:1 !important;
                        z-index:2 !important;
                        color:#686877 !important;
                    }
                }
            }
            // 权限相关
            .authority_item{
                display:inline-block;
                margin-top: 23px;
                vertical-align:top;
                a{
                    display:block;
                    height:20px;
                    line-height:20px;
                    font-size: 12px;
                    color:var(--mainColor);
                    &::after{
                        content:"";
                        display:inline-block;
                        vertical-align:middle;
                        width:0;
                        height:0;
                        margin:5px 0 4px 8px;
                        border-left: 5px solid transparent;
                        border-right: 5px solid transparent;
                        border-top: 6px solid var(--mainColor);
                        border-radius: 2px;
                        transition:transform .3s;
                    }
                }
                span{
                    display:block;
                    height:25px;
                    line-height:25px;
                    font-size:12px;
                    color:#80858b;
                    user-select:none;
                }
            }
            // 有效期相关
            .expire_item{
                position: absolute;
                bottom: 20px;
                right: 28px;
                .expire_tip{
                    position: relative;
                    display:inline-block;
                    width:auto;
                    height:24px;
                    line-height:24px;
                    padding:0 15px;
                    background:#f1f5f9;
                    text-align:center;
                    font-size:12px;
                    color:#747a81;
                    user-select:none;
                }
                .expire_btn{
                    width: 118px;
                    height: 24px;
                    height:24px;
                    margin-left:11px;
                    background-color: #ffffff;
                    border: solid 1px #dfdfdf;
                    text-align:center;
                    font-size:12px;
                    color:#80868d;
                    transition:all .3s;
                    &:hover{
                        background-color: var(--mainColor);
                        border-color:var(--mainColor);
                        color:#fff;
                    }
                }
            }
        }
        &.hide_authority{
            .authority_message{
                display:none;
            }
        }
        /*文档权限下拉框*/
        .document_authority_list{
            position:absolute;
            top: 72px;
            left: 110px;
            width: 250px;
            z-index:10;
            background-color: #ffffff;
            box-shadow: 0px 6px 8px 0px rgba(0, 0, 0, 0.06);
            border-radius: 4px;
            border: solid 1px #eaedf1;
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
                    color:#5e656c;
                }
                span{
                    display:block;
                    height:20px;
                    line-height:20px;
                    font-size:12px;
                    color:#acb5c0;
                }
                &:hover{
                    background:#f1f7fe;
                }
                &.checked{
                    background:#f1f7fe;
                    p{
                        color:var(--mainColor);
                    }
                    &:after{
                        content:'';
                        position:absolute;
                        top:22px;
                        right:21px;
                        width:21px;
                        height:16px;
                        background:@new_icon -110px -110px;
                    }
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
                    display: block;
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
                    display: block;
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
                    display: block;
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
                    display: block;
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
        // 链接有效期下拉框
        .link_expire_panel{
            position:absolute;
            top: 124px;
            right: -20px;
            width: 250px;
            height: 220px;
            z-index:10;
            background-color: #ffffff;
            box-shadow: 0px 6px 8px 0px rgba(0, 0, 0, 0.06);
            border-radius: 4px;
            border: solid 1px #eaedf1;
            ul{
                width:100%;
                height:100%;
                padding:20px 28px 20px 23px;
            }
            li{
                position:relative;
                margin-bottom:30px;
                white-space:normal;
                cursor:pointer;
                &:hover{
                    .name{
                        color:var(--mainColor);
                    }
                }
                &:last-child{
                    margin-bottom:0;
                }
                &::before{
                    content:"";
                    position:absolute;
                    left:0;
                    top:2px;
                    width:18px;
                    height:18px;
                    border-radius:50%;
                    background:#fff;
                    border:1px solid #ced2d8;
                }
                &.checked::before{
                    border:0;
                    background:url(../assets/pc/images/common/had_unread.png) no-repeat;
                    background-size:contain;
                }
                .name{
                    padding-left:32px;
                    font-size:14px;
                    font-weight:bold;
                    color:#3c3f43;
                }
                .content{
                    padding-left:32px;
                    font-size:12px;
                    color:#acb5c0;
                }
            }
        }
        // 指定成员列表面板
        .partner_panel{
            margin-top:18px;
            span{
                font-size:12px;
                font-weight:bold;
                color:#585f66;
            }
            a{
                font-size:12px;
                color:var(--mainColor);
            }
            .partner_list{
                width:100%;
                height:40px;
                overflow:hidden;
                margin-top:10px;
            }
            img{
                display:inline-block;
                vertical-align:middle;
                width:24px;
                height:24px;
                margin-right:15px;
                border-radius:50%;
            }
        }
        // 分享方式
        .share_way_panel{
            margin-top:40px;
            .title{
                color:#787d82;
                font-size:12px;
                margin-bottom:30px;
                &::before,&::after{
                    content:"";
                    display:inline-block;
                    vertical-align:middle;
                    height:1px;
                    width:40%;
                    background:#e5e5e5;
                }
                &::before{
                    margin-right: 20px;
                }
                &::after{
                    margin-left: 20px;
                }
            }
            .way_list{
                width:100%;
                text-align:center;
            }
            // 分享
            .way_item{
                display:inline-block;
                vertical-align:top;
                margin-right:55px;
                &:last-child{
                    margin-right:0;
                }
                &:hover button{
                    opacity:0.7;
                }
                button{
                    width:60px;
                    height:60px;
                    line-height:60px;
                    border-radius:50%;
                    background:#ffffff @newer_icon;
                }
                p{
                    margin-top:8px;
                    text-align:center;
                    font-size:12px;
                    color:#666f79;
                }
            }
            .wechat button{
                background-position: 12px -178px;
                background-color: #00c785;
            }
            .link button{
                background-position: -55px -176px;
                background-color: #ffd481;
            }
            .email button{
                background-position: -130px -176px;
                background-color: #77b9f6;
            }
            .qrcode button{
                background-position: -208px -179px;
                background-color: #696969;
            }
            &.short{
                margin-top: 30px;
            }
        }
    }
    /*权限设置面板样式*/
    .set_authority{
        height:auto;
        text-align:left;
        .modal_content{
            width:100%;
            height:104px;
            margin:0 auto 12px;
            font-size:0;
            .content_title{
                display:block;
                height:30px;
                line-height:30px;
                font-size:12px;
                color:#848995;
            }
            .privacy_bar{
                position:relative;
                width:100%;
                height:74px;
                border:1px solid #ccd3db;
                border-radius:2px;
                cursor:pointer;
                &:hover{
                    opacity:0.8;
                }
                i{
                    position:absolute;
                    top:20px;
                    right:15px;
                    display:block;
                    width:11px;
                    height:6px;
                    border-top:6px solid #c6cad4;
                    border-left:6px solid transparent;
                    border-right:6px solid transparent;
                }
            }
            .privacy_message{
                position:absolute;
                top:15px;
                left:21px;
                height:42px;
                padding-left:34px;
                &:before{
                    content:'';
                    position:absolute;
                    top:3px;
                    left:0;
                    display:inline-block;
                    width:20px;
                    height:20px;
                    background:@new_icon;
                }
                &[type=open]:before{
                    background-position:-55px -99px;
                }
                &[type=edit]:before{
                    background-position:-82px -98px;
                }
                &[type=exclusive]:before{
                    background-position:0 -99px;
                }
                &[type=privacy]:before{
                    background-position:-29px -98px;
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
        .modal_btn{
            width:100%;
            height:80px;
            line-height:80px;
            margin:0 auto;
            text-align:center;
            a{
                display:inline-block;
                width:90px;
                height:40px;
                line-height:40px;
                border-radius:4px;
                font-size:14px;
                vertical-align:middle;
                &:first-child{
                    margin-right:25px;
                    background:#f6f6f6;
                    color:#7d7d7d;
                    border:0;
                }
                &:last-child{
                    background: var(--mainColor);
                    color:#fff;
                }
            }
        }
        /*私密权限提示*/
        .privacy_tips{
            width:100%;
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
        /*添加协作者模块*/
        .set_authority_panel{
            height:242px;
            overflow:hidden;
        }
        .add_partner{
            width:100%;
            height:200px;
            overflow-y:auto;
            .add_partner_title{
                width:100%;
                height:30px;
                line-height:30px;
                margin:0 auto;
                font-size:12px;
                color:#848995;
            }
            .add_partner_btn{
                display:block;
                width:100%;
                height:40px;
                line-height:40px;
                margin:0 auto 14px;
                border:1px solid #f1fafe;
                background:#f1fafe;
                font-size:14px;
                color:var(--mainColor);
                text-align:center;
                cursor:pointer;
                &:hover{
                    border-color:var(--mainColor);
                }
            }
            .partner_list{
                width:100%;
                height: 100%;
                &::-webkit-scrollbar-track{
                    background-color:#ffffff;
                }
                &::-webkit-scrollbar-thumb{
                    background-color:#e4e4e4;
                }
            }
        }
        /* 搜索框 */
        .search_partner{
            position:relative;
            width:100%;
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
			width: 100%;
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
        .partner_foot{
            position:absolute;
            bottom: 17px;
            left:30px;
            display:block;
            width:calc(100% - 60px);
            height:40px;
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
                left: 224px;
                width:130px;
                padding-left:36px;
                border:1px solid #d4dbe5;
                color:#535f6e;
                &.left{
                    left:0;
                    + .add_partner_ewm{
                        left: 0;
                    }
                }
                &:before{
                    content:'';
                    position:absolute;
                    top:10px;
                    left:7px;
                    display:inline-block;
                    width:24px;
                    height:24px;
                    background:url(../assets/pc/images/doc/icon_2.3.0.png) no-repeat -171px -110px
                }
                &:hover + .add_partner_ewm{
                    display:block;
                }
            }
            .to_add_partner{
                position: absolute;
                left: 80px;
                display: inline-block;
                width: 130px;
                height: 40px;
                line-height: 40px;
                padding-left: 34px;
                border-radius: 4px;
                background: var(--mainColor);
                font-size: 14px;
                color: #fff;
                cursor: pointer;
                vertical-align: middle;
                &::before, &::after{
                    content: "";
                    position: absolute;
                    display: inline-block;
                    background: #fff;
                }
                &::before{
                    top: 12px;
                    left: 21px;
                    width: 3px;
                    height: 15px;
                }
                &::after{
                    top: 18px;
                    left: 15px;
                    width: 15px;
                    height: 3px;
                }
            }
            .cancel_btn{
                right: 100px;
                width: 90px;
                border-radius:4px;
                background:#dde3ea;
                font-size:14px;
                color: #242c36;
                text-align:center;
            }
            .ok_btn{
                right:0;
                width:90px;
                border-radius:4px;
                background:var(--mainColor);
                font-size:14px;
                color:#ffffff;
                text-align:center;
                &.unable{
                    background:#dde3ea;
                    color:#adbaca;
                }
            }
            .add_partner_ewm{
                position:absolute;
                bottom:44px;
                left:224px;
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
    /*添加协作者面板*/
    .add_partner_panel{
        width:100%;
        min-height:333px;
        padding-bottom:80px;
        border-radius:4px;
        background:#ffffff;
        text-align:left;
        vertical-align:middle;
        .member_type_panel{
            width:100%;
            height:26px;
            line-height:26px;
            margin:0 auto 20px;
            border-bottom:1px solid #e6e7e7;
            font-size:14px;
            color:#616a76;
            text-align: left;
            span{
                display: inline-block;
                margin-right:10px;
                cursor: pointer;
                &.check, &:hover{
                    color: var(--mainColor);
                }
            }
            .lately::after{
                display: inline-block;
                content: '';
                width: 1px;
                height: 10px;
                margin-left: 10px;
                background-color: #c5cad0;
            }
            .enterprise{
                position: relative;
                padding-left: 10px;
                &::before{
                    content: '';
                    position: absolute;
                    top: 34%;
                    left: 0;
                    width: 1px;
                    height: 10px;
                    background-color: #c5cad0;
                }
            }
        }
        .search_partner_result{
            width:calc(100% + 8px);
            height:auto;
            max-height:205px;
            margin-top:14px;
            padding-right:8px;
            overflow-y:auto;
            &::-webkit-scrollbar-track{
                background-color:#ffffff;
            }
            &::-webkit-scrollbar-thumb{
                background-color:#e4e4e4;
            }
            .empty_partner{
                width:100%;
                padding:28px 0 20px;
                font-size:0;
                text-align:center;
                p{
                    height:110px;
                    line-height:100px;
                    border:none;
                    font-size:100px;
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
    /*通用 - 协作者项*/
    .partner_item{
        position:relative;
        width:100%;
        height:40px;
        line-height:40px;
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
            right:0;
            height:30px;
            line-height:30px;
            padding-right:14px;
            font-size:12px;
            color:#838f9f;
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
                color:#838f9f;
                cursor:default;
                opacity:0.5;
                user-select: none;
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
            right:30px;
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
            right:0;
        }
    }
    /*通用 - 协作者下拉*/
    .partner_authority_list{
        position:absolute;
        bottom:34px;
        right:0;
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
    /*转让所有权弹框*/
    .change_owner_panel{
        position:absolute;
        top: -20px;
        left: -30px;
        z-index:10;
        width: 480px;
        height: 427px;
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
    /*转让所有权确认弹框*/
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
            width:100%;
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
    /*设置私密确认框*/
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
    // 发送邮件面板
    .panel{
        height:377px;
        .body{
            margin-top:20%;
            text-align:center;
            p{
                font-size:24px;
                color:#282c30;
                margin-bottom:28px;
            }
            input{
                width: 342px;
                height: 40px;
                line-height: 38px;
                padding: 0 10px;
                background-color: #ffffff;
                border-radius: 2px;
                border: solid 1px rgba(194, 194, 194, 0.58);
                font-size: 12px;
                color: #848995;
                &:-moz-placeholder{color:#98a3af;}
                &::-moz-placeholder{color:#98a3af;}
                &:-ms-input-placeholder{color:#98a3af;}
                &::-webkit-input-placeholder{color:#98a3af;}
            }
            button{
                width: 64px;
                height: 40px;
                line-height: 40px;
                margin-left:13px;
                background: var(--mainColor);
                border-radius: 2px;
                text-align: center;
                font-size: 14px;
                color: #fff;
                &:hover{
                    opacity:.7;
                }
            }
            .wrong_email_tip{
                display:block;
                margin-top: 5px;
                text-align:left;
                font-size:12px;
                color:#ff7575;
            }
            &.disabled{
                opacity:0.5;
                pointer-events:none;
            }
        }
        &.create_qrcode, &.wechat_share{
            .body{
                margin-top: 0;
                p{
                    margin-bottom: 25px;
                    &:last-child{
                        font-size: 14px;
                        color: #98a3af;
                    }
                }
            }
        }
        &.wechat_share{
            img{
                width: 165px;
            }
            p{
                margin-top: 20px;
            }
        }
    }
</style>
