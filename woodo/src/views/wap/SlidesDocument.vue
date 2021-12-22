<template>
    <div class="slides_contain">
        <!-- 无权限 -->
        <div class="refuse_contain" v-if="document_access === 'no_power'">
            <img src="../../assets/common/images/no_power_1.jpg" />
            <p class="remarks">
                你没有该文档的查看权限
                <br />
                如需查看请联系所有者（{{document_author}}）进行开放
            </p>
            <a href="/mobile/home/">前往吾道</a>
            <span class="footer">—— 本文档编写于吾道 ——</span>
        </div>

        <!-- 链接已过期 -->
        <div class="refuse_contain" v-else-if="document_access === 'url_expired'">
            <img src="../../assets/common/images/no_power_1.jpg" />
            <p class="remarks">
                文档链接已过期
                <br />
                该文档访问链接已过期，请联系所有者修改
            </p>
            <a href="/mobile/home/">前往吾道</a>
            <span class="footer">—— 本文档编写于吾道 ——</span>
        </div>

        <!-- 文档被删除 -->
        <div class="refuse_contain" v-else-if="document_access === 'delete'">
            <img src="../../assets/common/images/no_power_3.jpg" />
            <p class="remarks">
                抱歉！查看失败
                <br />
                该文档已删除，请联系文档所有者
            </p>
            <a href="/mobile/home/">前往吾道</a>
            <span class="footer">—— 本文档编写于吾道 ——</span>
        </div>

        <!-- 演示区域 -->
        <div class="slides_wrapper" v-else>
            <!-- 加载动画 -->
            <div class="loading_progress" v-show="!loaddone">
                <div class="center_logo"></div>
                <p>吾道，强大的PPT幻灯片协作工具</p>
            </div>

            <!-- 文档主体 -->
            <slides_main ref="slides_main"
                :screenType="screenType"
                :tool="show_tool"
                :document_info="document_info"
                :document_pages="document_pages"
                @sendToolbar="tool_show2hide"
                @sendScreen="rotate_screen"
            >
                <!-- 子组件插槽内容 文档底部显示logo -->
                <template slot="verticalfooter">
                    <div class="footer_logo">
                        <base-logo theme="gray"></base-logo>
                        <p class="title">强大的PPT幻灯片协作工具</p>
                        <p class="site">www.woodo.cn</p>
                    </div>
                </template>
            </slides_main>

            <!-- 横屏状态 顶部操作栏 -->
            <div class="toolbar horizontal" :class="{'show': show_tool}" v-if="screenType === 'horizontal'">
                <div class="opeartion_bar">
                    <!-- 回到竖屏 -->
                    <div class="opeartion_btn opeartion_play_btn" @click="rotate_screen('vertical')">退出播放</div>
                    <!-- 分享 -->
                    <div class="opeartion_btn opeartion_share_btn" @click="share_document">
                        <img src="../../assets/wap/images/display/share_w.png" alt=""/>
                        <span>分享</span>
                    </div>
                </div>
            </div>
            <!-- 竖屏状态 顶部显示操作栏 :class=top  -->
            <div class="toolbar vertical" :class="{'top': share_referrer, 'show': show_tool}" v-else>
                <!-- 从其他用户分享来的链接打开 -->
                <div class="opeartion_bar" v-if="share_referrer">
                    <!-- 回到首页 -->
                    <div class="opeartion_btn opeartion_home_btn" @click="goto_home">
                        <img src="../../assets/wap/images/display/home.png" alt=""/>
                    </div>
                    <!-- 横屏播放 -->
                    <div class="opeartion_btn opeartion_play_btn" @click="rotate_screen('horizontal')">
                        <img src="../../assets/wap/images/display/play_b.png" alt=""/>
                    </div>
                    <!-- 分享 -->
                    <div class="opeartion_btn opeartion_share_btn" @click="share_document">
                        <img src="../../assets/wap/images/display/share_b.png" alt=""/>
                    </div>
                    <!-- 更多菜单 -->
                    <div class="opeartion_btn opeartion_menu_btn" @click="toggle_more_menu">
                        <img src="../../assets/wap/images/display/menu_b.png" alt=""/>
                    </div>
                </div>
                <!-- 竖屏状态 操作栏 -->
                <div class="opeartion_bar" v-else>
                    <!-- 横屏播放 -->
                    <div class="opeartion_btn opeartion_play_btn" @click="rotate_screen('horizontal')">
                        <img src="../../assets/wap/images/display/play_w.png" alt=""/>
                    </div>
                    <!-- 分享 -->
                    <div class="opeartion_btn opeartion_share_btn" @click="share_document">
                        <img src="../../assets/wap/images/display/share_w.png" alt=""/>
                        <span>分享</span>
                    </div>
                    <!-- 更多菜单 -->
                    <div class="opeartion_btn opeartion_menu_btn" @click="toggle_more_menu">
                        <img src="../../assets/wap/images/display/menu_w.png" alt=""/>
                    </div>
                </div>
            </div>
            <!-- 工具栏 更多菜单 -->
            <transition name="modal-fade">
                <div class="menu_modal" 
                    v-show="show_more_menu" 
                    @click="toggle_more_menu"
                >
                    <div class="menu_container" @click.stop>
                        <div class="menu_head">
                            <img class="document_icon" src="../../assets/wap/images/display/file_icon.png" alt=""/>
                            <h2 class="title">{{ document_info.title }}</h2>
                            <div class="info">
                                <span>由 {{ author_info.authorName }} 创建 / 共{{ document_pages.length }}页 </span>
                                <span v-show="is_mine">{{ author_info.createDate }}</span>
                            </div>
                        </div>
                        <ul class="menu_body">
                            <li v-if="is_mine" @click="document_copy">
                                <img src="../../assets/wap/images/display/menu_icon_1.png" alt=""/>
                                <span>生成副本</span>
                            </li>
                            <li v-if="is_can_createh5" @click="document_create_h5">
                                <img src="../../assets/wap/images/doc/h5.png" alt=""/>
                               <span>生成H5页面</span> 
                            </li>
                            <li v-if="is_mine" @click="document_set_authority">
                                <img src="../../assets/wap/images/display/menu_icon_2.png" alt=""/>
                                <span>权限设置</span>
                            </li>
                            <li v-if="check_option_disabled('documentExport', collaborateRoleType)" @click="document_download">
                                <img src="../../assets/wap/images/display/menu_icon_4.png" alt=""/>
                                <span>下载</span>
                            </li>
                            <!-- <li @click="document_download_longimage">
                                <img src="../../assets/wap/images/display/menu_icon_3.png" alt=""/>
                                <span>导出长图</span>
                            </li> -->
                            <li v-if="is_mine" @click="document_rename">
                                <img src="../../assets/wap/images/display/menu_icon_5.png" alt=""/>
                                <span>重命名</span>
                            </li>
                        </ul>
                    </div>
                </div>
            </transition>
        </div>

        <!-- 重命名弹窗 -->
        <rename ref="rename" @set_success="name_update"></rename>

        <!-- 下载弹窗 -->
        <export_modal ref="export_modal" :doc_name="document_info.name"></export_modal>

        <!-- 权限设置弹窗 -->
        <wap_set_authority ref="wap_set_authority"></wap_set_authority>
    </div>
</template>

<script>
import slides_main from '@/views/wap/Slides/Slides.vue';
import rename from '@/components/WapReName.vue';
import wap_set_authority from '@/components/WapSetAuthority.vue';
import export_modal from '@/components/WapExportModal.vue';

export default {
    name: "SlidesDocument",
    components: {
        slides_main,
        rename,
        wap_set_authority,
        export_modal,
    },
    data() {
        return {
            user: {},
            loaddone: false,
            document_access: '',                    // 文档访问权限
            share_referrer: false,                  // 页面访问来源，为空值时是收到分享链接打开的状态
            screenType: 'vertical',                 // 横竖屏标识 vertical = 竖屏   horizontal = 横屏
            show_tool: true,                        // 显示工具栏 初始 true
            is_miniprogram: false,                  // 当前环境是否为小程序
            wx_miniprogram: {},                     // 小程序环境下私有对象
            show_more_menu: false,                  // 更多操作弹窗显示

            document_author: '',
            document_info: {},
            document_pages: [],
            author_info: {},
            is_mine: false,                         // 当前文档是否是当前用户的
            is_collaborate: false,                  // 是否是协作成员
            is_can_createh5: false,                 // 是否能生成h5
            collaborateRoleType: null,              // 协作角色
            role_authorities_arr:[],                // 协作角色权限
        };
    },
    metaInfo() {
        return {
            title: this.$store.state.metaInfo.title || '吾道幻灯片',
            meta: [
                {
                    name: 'robots',
                    content: 'noindex,nofollow,noarchive'
                },
                {
                    property: 'og:title',
                    content: this.$store.state.metaInfo.title || '吾道幻灯片'
                },
                {
                    property: 'og:url',
                    content: `https://www.woodo.cn/mobile/document/slides/${this.$store.state.metaInfo.query}/`
                },
            ],
        }
    },
    asyncData({store,host,route}) {
        return store.dispatch('setMeta',{url:`${host}/api/common/document/url_info/`, params:{url:route.params.id}});
    },
    mounted() {
        let that = this;
        that.user = that.$common.get_login_state();
        // 小程序环境判断
        utils.isMiniProgramENV().then(res =>{
            if(res.miniprogram){
                that.is_miniprogram = true;
                that.wx_miniprogram = res.wx.miniProgram;
                that.share_referrer = that.$route.query.detal == '1';
            } else {
                // 判断页面打开来源，如果为空则为分享打开的状态
                that.share_referrer = document.referrer === '';
            }
        }).catch((res) =>{
            console.error("error " + res);
        });
        that.get_document_info(this.$route.params.id);
        that.get_role_authorities();
    },
    methods: {
        // 获取文档信息
        get_document_info(url) {
            let that = this;
            if (!url) {
                return;
            }
            that.$axios.get(`/api/document/${url}/`).then(res => {
                let res_data = res.data;
                that.loaddone = true;
                if (res_data.type !== "success") {
                    // 作者昵称长度处理
                    let name = res_data.data;
                    if (name && name.length > 4){
                        name = `${name.substring(0, 1)}**${name.substring(name.length - 1)}`;
                    }
                    that.document_author = name;
                    switch (res_data.content) {
                        case "documentAccessDenied":
                            that.document_access = "no_power";
                            break;
                        case "哎呀~我家主公的演示文档现在貌似不方便被查看":
                            that.document_access = "no_power";
                            break;
                        case '链接访问已过有效期':
                            that.document_access = "url_expired";
                            break;
                        default:
                            that.document_access = "delete";
                            break;
                    }
                    return;
                }
                let document_info = that.$common.document_dataparse(res_data.data.document);
                let document_pages = that.$common.document_pages_dataparse(res_data.data.documentPages);
                that.document_info = document_info;
                that.document_pages = document_pages;
                that.is_mine = res_data.data.isMine;
                that.collaborateRoleType = res_data.data.collaborateRoleType;
                that.is_can_createh5 = ['owner', 'edit', 'onlyReview'].indexOf(res_data.data.collaborateRoleType) > -1;
                // 获取作者信息
                that.get_document_author_info(document_info.id);
                // 微信端 调用微信分享接口
                if (utils.deviceENV().wechat) {
                    let title = `${that.document_info.title}-吾道`,
                        desc = `${that.user.name || '您的好友'}向您分享了一份幻灯片文档，请点击查阅`;
                    that.$common.get_wexin_sdk(title, desc, window.location.href);
                }
            }).catch(err => {
                console.error(err);
            });
        },
        // 获取作者信息
        get_document_author_info(id) {
            let that = this;
            that.$axios.get('/api/document/get_doc_author/', {
                params: {
                    'id': id,
                    'type': 'slide',
                },
            }).then((res) => {
                if (res.data.type === 'success') {
                    let data = res.data.data;
                    if (data.createDate) {
                        data.createDate = utils.dateFormat(new Date(data.createDate), 'yyyy-MM-dd  HH:mm');
                    }
                    if (data.modifyDate) {
                        data.modifyDate = utils.dateFormat(new Date(data.modifyDate), 'yyyy-MM-dd  HH:mm');
                    }
                    if (data.time) {
                        let relative_time = utils.relativeTime({
                            'time': data.time,
                        });
                        data.time = relative_time.relative;
                    }
                    that.author_info = data;
                }
            }).catch((err) => {
                console.error(err);
            });
        },


        /**
         *  工具栏方法
         */
        // 屏幕旋转
        rotate_screen(type = 'vertical') {
            this.show_tool = false;
            this.screenType = type;
        },
        // 工具栏显示/隐藏
        tool_show2hide(state) {
            this.show_tool = state;
        },
        // 登录拦截方法
        user_login_redirect(callback) {
            let that = this;
            // 登录拦截
            if (!that.user.login) {
                if (that.is_miniprogram) {
                    let redirectUrl = escape('/pages/document_detail/document_detail?redirectUrl='),
                        redirectParam = escape(location.pathname + location.search);
                    that.wx_miniprogram.redirectTo({url:'/pages/login/login?redirectUrl='+redirectUrl + '&redirectParam='+redirectParam});   
                } else {
                    that.$toast('请登录后再进行操作', 2000, 'wap');
                    setTimeout(() => {
                        that.to_login();
                    }, 2000);
                }
                return;
            }
            if (typeof callback === 'function') callback();
        },
        // 跳转登录
        to_login() {
            let redirect_url = encodeURI(window.location.pathname + window.location.search);
            window.location.href = '/mobile/login/?redirectUrl=' + redirect_url;
        },
        // 回首页
        goto_home() {
            let that = this;
            if (that.is_miniprogram) {
                that.wx_miniprogram.switchTab({
                    url:'pages/square/square',
                });
            } else {
                if (that.user.login) {
                    window.location.href = '/mobile/home/';
                } else {
                    window.location.href = '/mobile/';
                }
            }
        },
        // 分享文档
        share_document() {
            let that = this;
            // 小程序环境
            if(that.is_miniprogram){
                that.wx_miniprogram.navigateTo({
                    'url': `/pages/share/share?type=mydoc&url=${that.document_info.url}`,
                });
            } else {
                window.location.href = `/mobile/doc_share/?type=mydoc&url=${that.document_info.url}`;
            }
        },
        // 更多操作
        toggle_more_menu() {
            this.show_more_menu = !this.show_more_menu;
        },
        // 菜单 - 生成副本
        document_copy() {
            let that = this;
            let id = that.document_info.id;
            let title = that.document_info.title;
            that.toggle_more_menu();
            if (!id || !title) {
                return that.$toast('生成副本失败！', 1000, 'wap');
            }
            that.$axios.post("/api/member/document/copy/",{
                docId: id,
                title: title,
            }).then((res) => {
                if (res.data.type === 'success') {
                    that.$toast('生成副本成功！', 1000, 'wap');
                } else {
                    that.$toast('生成副本失败！', 1000, 'wap');
                }
            }).catch((err) => {
                console.error(err);
            });
        },
        // 菜单 - 生成h5
        document_create_h5() {
            let url = this.document_info.url;
            if (!url) {
                return;
            }
            window.location.href = `/mobile/h5/slides/${url}/`;
        },
        // 菜单 - 重命名
        document_rename() {
            let that = this;
            that.$refs.rename.show({
                id: that.document_info.id, 
            }, that.document_info.title);
        },
        // 重命名设置成功 更新名称  由子组件通知
        name_update(param) {
            this.document_info.title = param.value || '';
        },
        // 菜单 - 权限设置
        document_set_authority() {
            let that = this;
            if (that.is_miniprogram) {
                that.wx_miniprogram.navigateTo({
                    'url': `/pages/doc_power/doc_power?id=${that.document_info.id}`,
                });
            } else {
                that.$refs.wap_set_authority.show({
                    id: that.document_info.id,
                });
            }
        },
        // 菜单 - 下载文档
        document_download() {
            let that = this;
            that.user_login_redirect(() => {
                // 用户文档发起加入协作请求
                let id = that.document_info.id;
                that.join_collaborate(id, () => {
                    // 小程序环境下无法直接在web-view下载
                    if (that.is_miniprogram) {
                        that.wx_miniprogram.navigateTo({
                            'url': `/pages/download/download?id=${id}&title=${encodeURI(that.document_info.title)}&type=doc`,
                        });
                    } else {
                        that.$refs.export_modal.show(id, that.document_info.title);
                    }
                }, () => {
                    // 文档非当前用户并且不是协作成员
                    if (!that.is_mine && !that.is_collaborate) {
                        return that.$toast('您不是该文档的协作成员，权限不足，无法下载', 1500, 'wap');
                    }
                });
            });
        },
        // 访问用户文档加入协作
        join_collaborate(id, success, error) {
            let that = this;
            if (!id) {
                return false;
            }
            that.$axios.post(`/api/member/document_collaborate/join/`, {
                docId: id,
            }).then((res) => {
                let res_data = res.data;
                // 加入成功
                if (res_data.type === 'success') {
                    that.is_collaborate = true;
                    if (typeof success === 'function') success();
                } else {
                    if (typeof error === 'function') error();
                }
            }).catch((err) => {
                console.error(err);
                if (typeof error === 'function') error();
            });
        },
        //获取文档协作角色权限
        get_role_authorities: function(){
            let that = this;
            // 未登录不进行校验
            if (!that.user.login) {
                return;
            }
            that.$axios.get('/api/member/document_collaborate/role_authorities/').then((data)=>{
                if (data.data.code == 2) {
                    that.role_authorities_arr = data.data.data;
                }
            })
        },
        // 比对操作权限
        check_option_disabled:function(data, role){
            if(!role) return false;
            if(!data) return false;
            let option_authority = this.role_authorities_arr[role].authorityTypes;
            if(option_authority.length <= 0) return false;
            if(option_authority.indexOf(data) < 0) return false;
            return true;
        },
    }
};
</script>

<style lang="less" scoped>
@import url("../../assets/wap/css/common.css");
.slides_contain {
    width: 100%;
    height: 100%;
}

.slides_wrapper {
    position: relative;
    width: 100%;
    height: 100%;
    background-color: #1c1c1c;
    overflow: hidden;
    .footer_logo {
        position: relative;
        width: 100%;
        height: 2.5rem;
        padding: 0.5rem 0.8rem;
        img {
            position: absolute;
            left: 0.8rem;
            top: 0.7rem;
            width: auto;
            height: 1.1rem;
            opacity: .4;
        }
        .title {
            position: absolute;
            right: 0.8rem;
            top: 0.5rem;
            line-height: 1.2;
            font-size: 0.52rem;
            font-weight: bold;
            letter-spacing: 0.05rem;
            color: #48484c;
        }
        .site {
            position: absolute;
            right: 0.8rem;
            bottom: 0.5rem;
            line-height: 1.1;
            font-size: 0.52rem;
            letter-spacing: 0.05rem;
            color: #48484c;
        }
    }
}

// 无权限 & 文档删除
.refuse_contain {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    text-align: center;
    img {
        display: block;
        width: 50%;
        margin: -3rem 0 1.5rem;
    }
    .remarks {
        max-width: 90%;
        line-height: 1.5rem;
        margin-bottom: 1.5rem;
        font-size: 0.9rem;
        color: #3f3f3f;
    }
    a {
        display: block;
        width: 10rem;
        height: 2rem;
        line-height: 2rem;
        font-size: 0.9rem;
        color: #fff;
        background-color: var(--mainColor);
        border-radius: 4px;
    }
    .footer {
        position: fixed;
        left: 0;
        right: 0;
        bottom: 1.45rem;
        font-size: 0.6rem;
        color: #afafaf;
    }
}

// 加载文档的动画
.loading_progress {
    position: fixed;
    top: 0;
    left: 0;
    z-index: 999;
    width: 100%;
    height: 100%;
    text-align: center;
    background-color: #ffffff;
    .center_logo {
        position: absolute;
        top: 50%;
        left: 50%;
        width: 3rem;
        height: 3rem;
        margin: -4rem 0 0 -1.5rem;
        background-color: #98bff6;
        animation: rotateplane 1.2s infinite ease-in-out;
    }
    p { 
        position: absolute;
        top: 50%;
        left: 0;
        right: 0;
        margin-top: 1rem;
        color: #99999c;
    }
    @keyframes rotateplane {
        0% {
            transform: perspective(120px) rotateX(0deg) rotateY(0deg);
        }
        50% {
            transform: perspective(120px) rotateX(-180.1deg) rotateY(0deg);
        }
        100% {
            transform: perspective(120px) rotateX(-180deg) rotateY(-179.9deg);
        }
    }
}

// 工具栏
.toolbar{
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    height: 2.95rem;
    line-height: 2.95rem;
    background-color: rgba(0,0,0,0.8);
    z-index: 3;
    transform: translateY(100%);
    transition: transform 0.4s;
    .opeartion_btn {
        display: inline-block;
        img {
            display: block;
            width: 100%;
        }
    }
    &.horizontal{
        display: none;
        top: 0;
        bottom: auto;
        height: 2.45rem;
        line-height: 2.45rem;
        transform: none;
        &.show {
            display: block;
        }
        .opeartion_bar {
            width: 100%;
            line-height: 2.45rem;
            padding: 0 1.8rem;
            .opeartion_play_btn {
                float: left;
                font-size: 0.76rem;
                color: #ffffff;
            }
            .opeartion_share_btn {
                float: right;
                span {
                    display: inline-block;
                    vertical-align: middle;
                    font-size: 0.76rem;
                    color: #ffffff;
                }
                img {
                    display: inline-block;
                    vertical-align: middle;
                    width: 0.9rem;
                    margin-right: 0.4rem;
                }
            }
            .opeartion_favorite_btn {
                float: right;
                margin-right: 2rem;
                span {
                    display: inline-block;
                    font-size: 0.76rem;
                    color: #ffffff;
                }
                img {
                    display: inline-block;
                    vertical-align: text-top;
                    width: 1rem;
                    margin-right: 0.4rem;
                }
            }
        }
    }
    &.vertical {
        &.show {
            transform: translateY(0);
        }
        &.top {
            top: 0;
            bottom: auto;
            height: 2.28rem;
            line-height: 2.28rem;
            background-color: #ffffff;
            box-shadow: 0rem 0.1rem 0.35rem 0rem rgba(0, 0, 0, 0.05);
            transform: translateY(-100%);
            &.show {
                transform: translateY(0);
            }
            .opeartion_bar {
                display: block;
                padding: 0.64rem 0.8rem;
                text-align: right;
                .opeartion_btn {
                    width: 1rem;
                    height: 1rem;
                    line-height: 1rem;
                    margin-left: 1.4rem;
                    vertical-align: top;
                    background: none;
                    img {
                        vertical-align: top;
                        margin: 0;
                        width: 1rem;
                    }
                }
                .opeartion_share_btn img {
                    width: 0.95rem;
                }
                .opeartion_home_btn {
                    float: left;
                    margin-left: 0;
                }
            }
        }
        .opeartion_bar {
            display: flex;
            justify-content: space-between;
            box-pack: justify;
            align-items: center;
            width: 100%;
            height: 100%;
            &::before,
            &::after {
                content: "";
                display: block;
            }
            .opeartion_play_btn {
                width: 1.5rem;
                height: 1.5rem;
            }
            .opeartion_share_btn {
                width: 5.25rem;
                height: 1.95rem;
                line-height: 1.95rem;
                background-color: var(--mainColor);
                border-radius: 0.94rem;
                text-align: center;
                span {
                    display: inline-block;
                    vertical-align: middle;
                    line-height: 1.95rem;
                    font-size: 0.85rem;
                    color: #ffffff;
                }
                img {
                    display: inline-block;
                    vertical-align: middle;
                    width: 0.9rem;
                    margin-right: 0.4rem;
                }
            }
            .opeartion_menu_btn {
                width: 1rem;
                height: 1rem;
            }
            .opeartion_favorite_btn {
                width: 1.3rem;
                height: 1.3rem;
            }
        }
    }
}

// 更多菜单
.menu_modal {
    position: fixed;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    z-index: 99;
    background-color: rgba(0, 0, 0, 0.5);
    .menu_container {
        position: absolute;
        bottom: 0;
        left: 0;
        right: 0;
        background-color: #ffffff;
    }
    .menu_head {
        position: relative;
        padding: 1.2rem 0.9rem 1rem 3.28rem;
        border-bottom: 0.5px solid #e8ebf0;
        .document_icon {
            position: absolute;
            top: 1.1rem;
            left: 0.82rem;
            width: 1.75rem;
        }
        .title {
            line-height: 1.1;
            margin-bottom: 0.2rem;
            font-size: 0.82rem;
            font-weight: bold;
            color: #151414;
        }
        .info {
            font-size: 0.55rem;
            color: #303336;
            display: flex;
            justify-content: space-between;
            align-items: flex-end;
        }
    }
    .menu_body {
        padding: 0 0.9rem 0.5rem 3.28rem;
        & > li {
            position: relative;
            border-bottom: 0.5px solid #e8ebf0;
            &:last-child {
                border-bottom: none;
            }
            &:active {
                background-color: #fbfbfb;
            }
            & > span {
                display: inline-block;
                font-size: 0.75rem;
                color: #121212;
                line-height: 3rem;
            }
            & > img {
                position: absolute;
                top: 50%;
                left: -1.6rem;
                width: 0.9rem;
                height: 0.9rem;
                margin-top: -0.45rem;
            }
        }
    }
}
</style>