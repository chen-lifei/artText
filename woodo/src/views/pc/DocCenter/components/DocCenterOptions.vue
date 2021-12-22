<template>
    <transition name="modal-fade">
        <template v-if="!doc_info.is_welcome_document">
            <!-- 普通文档 -->
            <div class="file_options_bar desktop" v-if="!doc_info.grade && doc_info.collaborateRoleType === 'owner' && (list_type === 'myDesktop' || list_type === 'myTeam')">
                <div>
                    <p class="share" @click="events_distribute('share')" v-if="$parent.doc_display_type === 'tile'"><base-icon class="iconfenxiang"></base-icon>分享</p>
                    <p class="blank" @click="events_distribute('edit')" v-bdtongji="`文档中心-首页-文件管理-更多-新标签页打开`"><base-icon class="iconbiaoqianyemian"></base-icon>新标签页打开</p>
                    <p class="h5" @click="events_distribute('h5')" v-bdtongji="`文档中心-首页-文件管理-全部-选项-生成H5页面|PC-统计-编辑器-下载弹出-生成-生成H5数`"><base-icon class="iconH5yemian"></base-icon>生成H5页面</p>
                    <p class="desktop" @click="create_desktop_shortcut" v-bdtongji="`文档中心-首页-文件管理-更多-保存桌面快捷方式`"><base-icon class="iconzhuomiankuaijie"></base-icon>保存桌面快捷方式</p>
                </div>
                <div>
                    <p class="move" @click="events_distribute('move',{type:'doc'})" v-bdtongji="`文档中心-首页-文件管理-全部-选项-移动`"><base-icon class="iconyidong"></base-icon>移动</p>
                    <p class="rename" @click="events_distribute('rename',{type:'doc'})" v-bdtongji="`文档中心-首页-文件管理-全部-选项-重命名`"><base-icon class="iconzhongmingming"></base-icon>重命名</p>
                    <p class="power" @click="events_distribute('privacy')" v-bdtongji="`文档中心-首页-文件管理-全部-选项-权限设置`"><base-icon class="iconquanxianshezhi"></base-icon>权限设置</p>
                </div>
                <div>
                    <p class="copy" @click="events_distribute('copy')" v-bdtongji="`文档中心-首页-文件管理-全部-选项-复制`"><base-icon class="iconfuzhi"></base-icon>复制</p>
                    <p class="download" @click="events_distribute('export')" v-bdtongji="`文档中心-首页-文件管理-全部-选项-下载`"><base-icon class="iconxiazai"></base-icon>下载</p>
                </div>
                <div>
                    <p class="delete" @click="events_distribute('delete',{type:'doc'})" v-bdtongji="`文档中心-首页-文件管理-全部-选项-删除`"><base-icon class="iconyizhihuishouzhan"></base-icon>移动至回收站</p>
                </div>
            </div>
            <!-- 协作文档 -->
            <div class="file_options_bar desktop" v-if="!doc_info.grade && doc_info.collaborateRoleType !== 'owner' && (list_type === 'myDesktop' || list_type === 'myTeam')">
                <div>
                    <p class="share" @click="events_distribute('share')" v-if="$parent.doc_display_type === 'tile' && check_option_disabled('documentAuthorityView')"><base-icon class="iconfenxiang"></base-icon>分享</p>
                    <p class="blank" @click="events_distribute('edit')" v-bdtongji="`文档中心-首页-文件管理-更多-新标签页打开`"><base-icon class="iconbiaoqianyemian"></base-icon>新标签页打开</p>
                    <p class="h5" v-if="check_option_disabled('documentAuthorityView')" @click="$parent.open_preview_h5(doc_info)" v-bdtongji="`文档中心-首页-文件管理-全部-选项-生成H5页面|PC-统计-编辑器-下载弹出-生成-生成H5数`"><base-icon class="iconH5yemian"></base-icon>生成H5页面</p>
                    <p class="desktop" @click="create_desktop_shortcut" v-bdtongji="`文档中心-首页-文件管理-更多-保存桌面快捷方式`"><base-icon class="iconzhuomiankuaijie"></base-icon>保存桌面快捷方式</p>
                </div>
                <div v-if="(list_type === 'myDesktop') && (check_option_disabled('documentMove') || check_option_disabled('documentRename'))">
                    <p class="move" v-if="check_option_disabled('documentMove')"  @click="events_distribute('move',{type:'doc',authority:'other'})" v-bdtongji="`文档中心-首页-文件管理-全部-选项-移动`"><base-icon class="iconyidong"></base-icon>移动</p>
                    <p class="rename" v-if="check_option_disabled('documentRename')" @click="events_distribute('rename',{type:'doc'})" v-bdtongji="`文档中心-首页-文件管理-全部-选项-重命名`"><base-icon class="iconzhongmingming"></base-icon>重命名</p>
                </div>
                <div v-if="(list_type === 'myTeam') && ($parent.team_info.teamRoleType === 'team_owner' || check_option_disabled('documentAuthorityView'))">
                    <p class="move" v-if="$parent.team_info.teamRoleType === 'team_owner'"
                    @click="events_distribute('move',{type:'doc',authority:'other'})" v-bdtongji="`文档中心-首页-文件管理-全部-选项-移动`"><base-icon class="iconyidong"></base-icon>移动</p>
                    <p class="rename" v-if="check_option_disabled('documentRename')"
                        @click="events_distribute('rename',{type:'doc'})" v-bdtongji="`文档中心-首页-文件管理-全部-选项-重命名`"
                    ><base-icon class="iconzhongmingming"></base-icon>重命名</p>
                </div>
                <div v-if="check_option_disabled('documentCopy') || check_option_disabled('documentExport')">
                    <p class="copy" v-if="check_option_disabled('documentCopy')"
                        @click="events_distribute('copy')" v-bdtongji="`文档中心-首页-文件管理-全部-选项-复制`"
                    ><base-icon class="iconfuzhi"></base-icon>复制</p>
                    <p class="download" v-if="check_option_disabled('documentExport')" @click="events_distribute('export')" v-bdtongji="`文档中心-首页-文件管理-全部-选项-下载`"><base-icon class="iconxiazai"></base-icon>下载</p>
                </div>
                <div>
                    <p class="quit" @click="events_distribute('quit_cooperation')" v-bdtongji="`文档中心-首页-文件管理-全部-选项-退出协作`"><base-icon class="iconyizhihuishouzhan"></base-icon>退出协作</p>
                </div>
            </div>
            <!-- 普通文件夹 -->
            <div class="file_options_bar folder" v-if="doc_info.grade && list_type === 'myDesktop'">
                <div>
                    <p class="move" @click="events_distribute('move',{type:'folder'})"><base-icon class="iconyidong"></base-icon>移动</p>
                    <p class="rename" @click="events_distribute('rename',{type:'folder'})"><base-icon class="iconzhongmingming"></base-icon>重命名</p>
                </div>
                <div>
                    <p class="delete" @click="events_distribute('delete',{type:'folder'})"><base-icon class="iconyizhihuishouzhan"></base-icon>删除</p>
                </div>
            </div>
            <!-- 团队文件夹 -->
            <div class="file_options_bar team" v-if="doc_info.grade && list_type === 'myTeam'">
                <div v-if="['team_owner','creator'].indexOf(doc_info.type) >= 0">
                    <p class="rename" @click="events_distribute('rename',{type:'team'})"><base-icon class="iconzhongmingming"></base-icon>重命名</p>
                    <p class="member" @click="events_distribute('member')"><base-icon class="iconqiyeyonghu"></base-icon>成员设置</p>
                    <p class="delete" @click="events_distribute('delete',{type:'team'})"><base-icon class="iconyizhihuishouzhan"></base-icon>删除</p>
                </div>
                <div v-else>
                    <p class="default1" @click="events_distribute('enter_folder')" v-bdtongji="`文档中心-我的团队-文件库-右下角-查看`"><base-icon class="iconyulan"></base-icon>查看</p>
                </div>
            </div>
            <!-- 我的发布 -->
            <div class="file_options_bar release" v-if="list_type === 'myRelease'">
                <div>
                    <p class="display" @click="events_distribute('preview')"><base-icon class="iconyulan"></base-icon>演示</p>
                    <p class="delete" v-if="doc_info.authority === 'privacy'" @click="events_distribute('delete',{type:'template'})"><base-icon class="iconyizhihuishouzhan"></base-icon>删除模板</p>
                </div>
            </div>
            <!--我的收藏-->
            <div class="file_options_bar collect" v-if="list_type === 'myCollect'">
                <div>
                    <p class="display" @click="events_distribute('preview')"><base-icon class="iconyulan"></base-icon>演示</p>
                    <p class="delete" @click="events_distribute('uncollect')"><base-icon class="iconyizhihuishouzhan"></base-icon>取消收藏</p>
                </div>
            </div>
            <!-- 回收站 -->
            <div class="file_options_bar dustbin" v-if="list_type === 'dustbin'">
                <div>
                    <p class="recovery" @click="events_distribute('recover')"><base-icon class="iconyidong"></base-icon>恢复文档</p>
                    <p class="dustbin_delete" @click="events_distribute('dustbin_delete')"><base-icon class="iconyizhihuishouzhan"></base-icon>彻底删除</p>
                </div>
            </div>
        </template>
        <template v-else>
            <!-- 欢迎文档 -->
            <div class="file_options_bar desktop" v-if="doc_info.is_welcome_document">
                <div>
                    <p class="blank" @click="events_distribute('open_welcome_document')"><base-icon class="iconbiaoqianyemian"></base-icon>新标签页打开</p>
                    <p class="delete" @click="events_distribute('delete_welcome_document')"><base-icon class="iconyizhihuishouzhan"></base-icon>删除</p>
                </div>
            </div>
        </template>
    </transition>
</template>
<script>
    export default {
        name: 'doc_options',
        props:['doc_info','list_type','role_authorities_arr'],
        // inject: ["center", "parent", "main"],
        data () {
            return {}
        },
        methods: {
            // 创建桌面快捷方式
            create_desktop_shortcut: function(){
                let that = this;
                let url = ';'
                // 跳转演示页
                if(that.doc_info.collaborateRoleType === 'onlyView'){
                    url = `${location.origin}/document/slides/${that.doc_info.url}/`;
                }
                // 跳转编辑页
                else{
                    url = `${location.origin}/edit/?docId=${that.doc_info.id}`;
                }
                let name = that.doc_info.name;
                utils.downloadDesktopShortcut(name,url);
            },
            // 比对操作权限
			check_option_disabled:function(data, role){
                let that = this;
				if(!data) return false;
				let option_authority = that.role_authorities_arr[that.doc_info.collaborateRoleType].authorityTypes;
				if(option_authority.length <= 0) return false;
				if(option_authority.indexOf(data) < 0) return false;
				return true;
			},
            // 事件分发
            events_distribute: function(type,params){
                this.$emit('doc_events_distribute',type,params);
            }
        },
    }
</script>
<style lang="less" scoped>
    // 通用文件设置弹框
    .file_options_bar{
        position: absolute;
        top: 0;
        left: 0;
        width: 200px;
        height: auto;
        padding-bottom: 15px;
        z-index: 100;
        border-radius: 6px;
        background: #fff;
        text-align: left;
        overflow: visible;
        box-shadow: 0 1px 3px 0 rgba(82,99,125,0.20);
        cursor: pointer;
        div{
            position: relative;
            padding: 15px 0 0;
            &::after{
                content: "";
                display: block;
                height: 1px;
                width: calc(100% - 50px);
                margin-top: 10px;
                transform: translateX(25px);
                background: #e5e5e5;
            }
            &:last-child::after{
                display: none;
            }
            p{
                height: 40px;
                line-height: 40px;
                padding: 0 5px 0 22px;
                color: #2B2A35;
                font-size: 14px;
                transition: all .3s;
                .base-icon{
                    margin-right: 18px;
                    color: #2b2a35;
                }
                &:hover{
                    background-color:#eef0f4;
                }
                &.disable{
                    opacity: .5;
                    cursor: not-allowed;
                    &:hover{
                        background: transparent;
                    }
                }
            }
            div{
                position: absolute;
                top: 16px;
                right: 95%;
                z-index: 2;
                width: 200px;
                height: auto;
                padding: 15px 0;
                border-radius: 6px;
                text-align: left;
                box-shadow: 0 1px 3px 0 rgba(82,99,125,0.20);
                overflow: visible;
                opacity: 1;
                p.empty {
                    height: 0 !important;
                    opacity: 0;
                }
            }
            
        }
    }
</style>
