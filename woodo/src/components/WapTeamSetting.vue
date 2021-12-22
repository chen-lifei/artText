<template>
    <div class="team_setting_contain">
        <!-- 团队设置页面弹框 -->
        <div class="setup_modal_contain" v-if="team_setting_show">
            <div class="head">
                <p @click="close">团队设置</p>
            </div>
            <div class="body">
                <p @click="team_memeber_modal_toggle(true)">团队成员</p>
                <p @click="$parent.team_transfer_modal_toggle()" v-if="team_info.teamRoleType === 'team_owner'">转让团队</p>
                <p @click="team_dissolution_modal_toggle(true)" v-if="team_info.teamRoleType === 'team_owner'">解散团队</p>
                <p v-if="team_info.teamRoleType === 'team_owner'" @click="$parent.open_team_rename">团队重命名</p>
                <p v-if="team_info.teamRoleType !== 'team_owner'" @click="team_quit">退出团队</p>
            </div>
            <div class="foot">
                <base-logo></base-logo >
            </div>
        </div>
        <!-- 团队成员列表弹框 -->
        <div class="team_member_modal" v-if="team_member_list_show">
            <div class="modal_contain_wrapper">
                <div class="head">
                    <p @click="team_memeber_modal_toggle(false)">团队成员</p>
                    <button v-if="team_info.teamRoleType === 'team_owner'" @click="$parent.team_create_modal_toggle(true)"><i>+</i>邀请成员</button>
                </div>
                <div class="body">
                    <ul class="team_member_list_contain">
                        <li v-for="(member,index) in team_all_member_list" :key="index">
                            <img :src="member.memberHead ? member.memberHead : '../../../public/images/common/default_head.png'" alt="">
                            <p class="nickname">{{member.memberNickName === '' || !member.memberNickName ? member.memberId: member.memberNickName}}</p>
                            <div class="right">
                                <span class="time" v-if="['team_owner'].indexOf(member.memberRoleType) < 0">{{member.time}}</span>
                                <span class="disabled" v-if="['team_owner'].indexOf(member.memberRoleType) >= 0">管理者</span>
                                <span class="role" v-if="member.memberRoleType === 'wait'" @click.stop="team_wait_member_remove(index)">取消邀请</span>
                                <span class="role" v-if="['team_owner'].indexOf(member.memberRoleType) < 0 && team_info.teamRoleType === 'team_owner' && member.memberRoleType !== 'wait'" @click.stop="team_member_remove(index)">移除</span>
                                <span class="member" v-if="['team_owner'].indexOf(member.memberRoleType) < 0 && team_info.teamRoleType === 'member' ">成员</span>
                            </div>
                        </li>
                    </ul>
                </div>
            </div>
        </div>
        <!-- 解散团队弹框-->
        <transition name="dissolution_modal">
            <div class="dissolution_team_modal" v-if="team_dissolution_modal_show">
                <div class="dissolution_team_modal_contain">
                    <h3 class="head">解散团队</h3>
                    <p class="body">解散后所有团队文档都将删除，并且无法恢复<br>请确认重要文档已处理妥当</p>
                    <p class="foot">
                        <span @click="team_dissolution_modal_toggle(false)">取消</span>
                        <span @click="team_dismiss">确认解散</span>
                    </p>
                </div>
            </div>
        </transition>
    </div>
</template>
<style lang="less" scoped>
    .setup_modal_contain {
        position: absolute;
        width: 100%;
        top: 0;
        background: white;
        height: 100%;
        z-index: 10;
        .head{
            position:relative;
            width: 100%;
            height: 2.37rem;
            line-height: 2.37rem;
            padding: 0 0.85rem;
            border-bottom: 1px solid #e2e6ec;
            p{
                position: relative;
                padding-left: 1rem;
                color: #202329;
                font-size: 0.8rem;
                &:before {
                    content: "";
                    position: absolute;
                    left: 0.2rem;
                    top: 0.95rem;
                    width: 0.4rem;
                    height: 0.4rem;
                    border: 2px solid #343941;
                    border-left: transparent;
                    border-top: transparent;
                    transform: rotate(135deg);
                }
            }
        }
        .body{
            p{
                    position: relative;
                    height: 2.84rem;
                    line-height: 2.84rem;
                    margin:0 0.83rem;
                    font-size:0.7rem;
                    color: #000;
                    border-bottom: 1px solid #e2e6ec;
                    &:after{
                        content:'';
                        position: absolute;
                        right: 0;
                        top: 1.06rem;
                        height: 0.75rem;
                        padding-left: 1rem;
                        background:url(../assets/wap/images/doc/go.png) center no-repeat;
                        background-size:contain;
                        
                    }
            }
        }
        .foot{
                display: flex;
                position: absolute;
                width: 100%;
                height: 4.6rem;
                bottom: 0;
                justify-content: center;
                align-items: center;  
                .base-logo{
                    width:3.06rem;
                }
        }
    }
    // 团队成员列表弹框
    .team_member_modal{
        position:fixed;
        top:0;
        left:0;
        width:100%;
        height:100vh;
        z-index:11;
        text-align:left;
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
            padding:0 0.85rem;
            border-bottom:1px solid #f1f1f1;
            p{
                position: relative;
                padding-left:1rem;
                color:#202329;
                font-size:0.8rem;
                &::before{
                    content: "";
                    position: absolute;
                    left:0.2rem;
                    top:0.95rem;
                    width: .4rem;
                    height: .4rem;
                    border: 2px solid #343941;
                    border-left: transparent;
                    border-top: transparent;
                    transform: rotate(135deg);
                    transition: transform .3s;
                }
            }
            button{
                position:absolute;
                top:0.5rem;
                right:0.85rem;
                width: 3.67rem;
                height: 1.3rem;
                background-color: var(--mainColor);
                border-radius: 0.65rem;
                text-align:center;
                font-size:0.6rem;
                color:#fff;
                i{
                    display:inline-block;
                    vertical-align:middle;
                    margin-right:3px;
                    font-size:0.67rem;
                    font-weight:bold;
                    font-style:normal;
                }
            }
        }
        .body{
            height:100%;
            width:100%;
            padding:0.54rem 0.85rem 3rem;
            overflow-y: auto;
            li{
                position:relative;
                height:2.42rem;
                line-height:2.42rem;
                img{
                    display:inline-block;
                    vertical-align:middle;
                    width:1.5rem;
                    height:1.5rem;
                    margin-right:0.35rem;
                    overflow:hidden;
                    border-radius:50%;
                }
                p{
                    display:inline-block;
                    vertical-align:middle;
                    width:40%;
                    overflow:hidden;
                    text-overflow:ellipsis;
                    white-space: nowrap;
                    font-size:0.67rem;
                    color: #21252b;
                }
                .right{
                    position:absolute;
                    right:0;
                    top:0;
                    width:50%;
                    height:100%;
                    text-align:left;
                }
                span{
                    font-size:0.6rem; 
                }
                .time,.disabled{
                    margin-left:1.2rem;
                    opacity:.5;
                    color:#707b8e;
                }
                .disabled{
                    position: absolute;
                    right: 0;
                }
                .role{
                    position:absolute;
                    right: 0;
                    color:#f74747;
                }
                .member{
                    margin-left: 1.78rem;
                    opacity:.5;
                    color:#707b8e;
                }
            }
        }
    }
    // 解散团队弹框
    .dissolution_team_modal{
            position: fixed;
            top: 0;
            left: 0;
            z-index: 11;
            width: 100%;
            height: 100%;
            text-align: center;
            background: rgba(0, 0, 0, .5);
        .dissolution_team_modal_contain{
                position: relative;
                top: 30%;
                display: inline-block;
                vertical-align: middle;
                width: 90%;
                height: 11.24rem;
                background: #fff;
                border-radius: 0.5rem;
                .head{  
                    color: #4b525f;
                    margin-top: 1.45rem; 
                    line-height:1.38rem;
                    font-weight: bold;
                }
                .body{
                    font-size: 0.59rem;
                    line-height: 1.2rem;
                    color: #707b8e;
                    margin: 1.5rem 0;
                }
                .foot{
                    position: absolute;
                    display:inline-block;
                    bottom: 0;
                    display: flex;
                    width:100%;
                    height:2.7rem;
                    border-top:1px solid #e2e6ec;
                    line-height: 2.7rem;
                    font-size:0.78rem;
                    justify-content: space-around;
                    color: #707b8e;
                    span{
                        width: 50%;
                         &:last-child{
                            border-left:1px solid #e2e6ec;
                            color:#ff5a5a;
                        }
                    }
                }
        }
    }
</style>
<script>
    export default {
        name: 'team_setting',
        props:['team_info','team_all_member_list'],
        data(){
            return{
                team_setting_show:false,                // 团队设置弹框标识
                team_member_list_show: false,           // 团队成员列表弹框显示标识
                team_dissolution_modal_show: false,     // 解散团队弹框标识
            }
        },
        methods: {
            // 打开团队设置弹框
            show: function(){
                let that = this;
                that.team_setting_show = true;
            },
            close: function(){
                let that = this;
                that.team_setting_show = false;
            },
            // 团队 - 成员列表弹框 - 打开/关闭
            team_memeber_modal_toggle:function(type){
                let that = this;
                if(type){
                    that.team_member_render();
                }
                that.team_member_list_show = type;
            },
            // 团队 - 成员列表面板 - 数据渲染
			team_member_render: function(){
				let that = this;
				that.$parent.get_team_member(function(list){
					that.$axios.get('/api/member/team/wait_join_members/')
					.then(function(data) {
						if(data.data.code == 2) {
							let member_list = data.data.data;
							if(member_list.length === 0) return that.$parent.team_all_member_list = list;
							// 时间戳转日期
                            for(let i = 0; i < member_list.length; i++) {
                                if(member_list[i].modifyDate) member_list[i].time = utils.timeStampDetail(member_list[i].modifyDate / 1000);
                                if(member_list[i].createDate) member_list[i].time = utils.timeStampDetail(member_list[i].createDate / 1000);
                            }
                            that.$parent.team_all_member_list = list.concat(member_list);
						} else {
							that.$toast(data.data.content, 2000,'wap');
                        }
					});
				})
            },
            // 团队 - 成员列表面板 - 已加入成员移除
			team_member_remove: function(index){
				let that = this;
				// 提示内容：
				that.$modal({
					modalClass: 'mobile-team-modal',
					modalTitle: '移除成员',
					modalContent: `<p>被移除的成员，将不能再访问团队信息，归TA所有的文档将转移给管理员，您还可以重新邀请他加入团队。</p>`,
					buttonSubmitTxt: '移除',
					submitCallback (modal) {
						that.$axios.post('/api/member/team/remove_member/',{
							memberId: that.team_all_member_list[index].memberId,
						}).then(function(data) {
							if(data.data.code == 2) {
								that.$toast("移除成功", 2000,'wap');
								modal.close();
								that.$parent.team_all_member_list.splice(index,1)
							} else {
								that.$toast(data.data.content, 2000,'wap');
							}
						});
					},
				});
			},
			// 团队 - 成员列表面板 - 待加入成员移除
			team_wait_member_remove: function(index){
				let that = this;
				// 提示内容：
				that.$modal({
					modalClass: 'mobile-team-modal',
					modalTitle: '取消邀请成员',
					modalContent: `<p>被取消邀请的成员，邀请链接将失效，您还可以重新邀请他加入团队。</p>`,
					buttonSubmitTxt: '确定',
					submitCallback (modal) {
						that.$axios.post('/api/member/team/cancel_invite/',{
							inviteLogId: that.team_all_member_list[index].inviteLogId,
						}).then(function(data) {
							if(data.data.code == 2) {
								that.$toast("取消邀请成功", 2000,'wap');
								modal.close();
								that.$parent.team_all_member_list.splice(index,1)
							} else {
								that.$toast(data.data.content, 2000,'wap');
							}
						});
					},
				});
				
            },
            // 团队 - 解散弹框 - 打开/关闭
            team_dissolution_modal_toggle: function(type){
                let that = this;
                that.team_dissolution_modal_show = type;
            },
            // 团队 - 解散
            team_dismiss: function(){
                let that = this;
                that.team_dissolution_modal_show = false;
                that.$axios.post('/api/member/team/dissolution_team/')
                .then(function(data) {
                    if(data.data.code == 2) {
                        that.$toast("团队解散成功", 2000, 'wap');
                        that.team_setting_show = false;
                        that.$parent.team_info_clear();
                    } else {
                        that.$toast(data.data.content, 2000,'wap');
                    }
                });
            },
            // 团队 - 退出
			team_quit: function(){
				let that = this;
				that.$modal({
					modalClass: 'mobile-team-modal',
					modalTitle: '退出团队',
					modalContent: `<p>注意：退出团队后，所有你在该目录下拥有的文档都将转移给管理员，请谨慎操作！</p>`,
					buttonSubmitTxt: '退出',
					submitCallback (modal) {
						that.$axios.post('/api/member/team/exit_team/')
						.then(function(data) {
							if(data.data.code == 2) {
								that.$toast("退出团队成功", 2000,'wap');
								modal.close();
								that.team_setting_show = false;
                                that.$parent.team_info_clear();
							} else {
								that.$toast(data.data.content, 2000,'wap');
							}
						});
					},
				});
            },
        },
        mounted(){
        }
    }
</script>