<template>
    <div class="slides_contain">
        <!-- 文档被删除 -->
        <div class="refuse_contain" v-if="document_access === 'delete'">
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
                <!-- 子组件插槽内容 文档底部显示作者信息、推荐模板 -->
                <template slot="verticalheader">
                    <!-- 作品 文档简介 -->
                    <div class="vertical_header" v-show="work_info.introduce">
                        <p class="content" 
                            :class="{'slice': introduce_slice}" 
                            @click="toggle_introduce_slice" 
                        >{{ work_info.introduce }}</p>
                    </div>
                </template>
                <template slot="verticalfooter">
                    <div class="vertical_footer">
                        <div class="info_contaner">
                            <div class="author_info">
                                <img v-show="author_info.authorImg" :src="author_info.authorImg" alt=""/>
                                <span>{{ author_info.authorName }}</span>
                                <span>{{ author_info.time }}</span>
                            </div>
                            <div class="works_info">
                                <span>作品：{{ +author_info.total }}</span>
                                <span>文件格式：PPTX</span>
                                <span>收藏：{{ +author_info.collect }}</span>
                                <span>使用次数：{{ +author_info.usenum }}</span>
                            </div>
                        </div>
                        <div class="relevant_container" v-show="relevant_list.length > 0">
                            <div class="relevant_title">
                                <p>相关作品</p>
                                <a href="/mobile/square/">更多></a>
                            </div>
                            <ul class="relevant_list">
                                <li v-for="item in relevant_list" 
                                    :key="item.id" 
                                    @click="relevant_document_open(item)"
                                >
                                    <img v-show="item.image" :src="item.image" alt="" />
                                    <p>{{ item.name }}</p>
                                </li>
                            </ul>
                        </div>
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
                    <!-- 收藏 -->
                    <div class="opeartion_btn opeartion_favorite_btn" @click="favorite_document">
                        <img v-show="is_favorite" src="../../assets/wap/images/display/like_on.png" alt=""/>
                        <img v-show="!is_favorite" src="../../assets/wap/images/display/like_w.png" alt=""/>
                        <span>收藏</span>
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
                    <!-- 下载 -->
                    <div class="opeartion_btn opeartion_share_btn" @click="work_download" v-if="work_info.isEdit">
                        <img src="../../assets/wap/images/display/menu_icon_4.png" alt=""/>
                    </div>
                    <!-- 分享 -->
                    <div class="opeartion_btn opeartion_share_btn" @click="share_document">
                        <img src="../../assets/wap/images/display/share_b.png" alt=""/>
                    </div>
                    <!-- 收藏 -->
                    <div class="opeartion_btn opeartion_favorite_btn" @click="favorite_document">
                        <img v-show="is_favorite" src="../../assets/wap/images/display/like_on.png" alt=""/>
                        <img v-show="!is_favorite" src="../../assets/wap/images/display/like_b.png" alt=""/>
                    </div>
                </div>
                <!-- 竖屏状态 操作栏 -->
                <div class="opeartion_bar" v-else>
                    <!-- 横屏播放 -->
                    <div class="opeartion_btn opeartion_play_btn" @click="rotate_screen('horizontal')">
                        <img src="../../assets/wap/images/display/play_w.png" alt=""/>
                    </div>
                    <!-- 分享 -->
                    <div class="opeartion_btn opeartion_share_btn" @click="share_document" v-if="!work_info.isEdit">
                        <img src="../../assets/wap/images/display/share_w.png" alt=""/>
                        <span>分享</span>
                    </div>
                    <!-- 下载 -->
                    <div class="opeartion_btn opeartion_download_btn" v-else @click="work_download">
                        <img src="../../assets/wap/images/display/download.png" alt=""/>
                        <span>下载</span>
                    </div>
                    <!-- 收藏和分享 -->
                    <div class="opeartes_btn">
                        <!-- 分享 -->
                        <div class="opeartion_btn share_btn" @click="share_document" v-if="work_info.isEdit">
                            <img src="../../assets/wap/images/display/share_w.png" alt=""/>
                        </div>
                        <!-- 收藏 -->
                        <div class="opeartion_btn opeartion_favorite_btn" @click="favorite_document">
                            <img v-show="is_favorite" src="../../assets/wap/images/display/like_on.png" alt=""/>
                            <img v-show="!is_favorite" src="../../assets/wap/images/display/like_w.png" alt=""/>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- 下载弹窗 -->
        <export_modal ref="export_modal" :doc_name="work_info.worksName"></export_modal>
    </div>
</template>

<script>
import slides_main from '@/views/wap/Slides/Slides.vue';
import export_modal from '@/components/WapExportModal.vue';

export default {
    name: "SlidesWorks",
    components: {
        slides_main,
        export_modal
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

            document_info: {},
            document_pages: [],
            work_info: {                            // 作品信息  introduce: 作品简介
                introduce: '',
            },
            author_info: {},                        // 作者信息
            relevant_list: [],                      // 相关模板
            is_favorite: false,                     // 是否收藏
            introduce_slice: true,                  // 作品简介 显示部分内容
        };
    },
    metaInfo() {
        return {
            title: this.$store.state.metaInfo.title || '吾道幻灯片',
            meta: [
                {
                    property: 'og:title',
                    content: this.$store.state.metaInfo.title || '吾道幻灯片'
                },
                {
                    property: 'og:url',
                    content: `https://www.woodo.cn/mobile/works/slides/${this.$store.state.metaInfo.query}/`
                },
                {
                    name: 'description',
                    content: this.$store.state.metaInfo.description || '「吾道幻灯片」是一款全新的office生产力工具，支持演示文稿、PPT模板、协同办公，可以帮助用户轻松创建具有视觉吸引力的幻灯片，作为一款办公软件，吾道具备了简洁，易用，功能强大的特点，通过云端技术实现在线编辑设计，让分享过程更加方便、高效。'
                },
                {
                    property: 'og:description',
                    content: this.$store.state.metaInfo.description || '「吾道幻灯片」是一款全新的office生产力工具，支持演示文稿、PPT模板、协同办公，可以帮助用户轻松创建具有视觉吸引力的幻灯片，作为一款办公软件，吾道具备了简洁，易用，功能强大的特点，通过云端技术实现在线编辑设计，让分享过程更加方便、高效。'
                },
            ],
        }
    },
    asyncData({store,host,route}) {
        return store.dispatch('setMeta',{url:`${host}/api/common/worksshare/url_info/`, params:{id:route.params.id}});
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
    },
    methods: {
        // 获取文档信息
        get_document_info(id) {
            let that = this;
            if (!id) {
                return;
            }
            // 作品 统计埋点
            let headers = {};
            let act = that.$route.query.act;
            if(typeof(act) !== 'undefined' && act === 'share'){
                headers = {
                    worksShareShare : true
                }
            }
            that.$router.push({
                path: that.$route.fullPath.replace('&act=share', '')
            });
            that.$axios.get(`/api/works_share/detail/${id}/`, {
                headers: headers,
            }).then(res => {
                let res_data = res.data;
                that.loaddone = true;
                if (res_data.type !== "success") {
                    that.document_access = "delete";
                    return;
                }
                // 作品人气增加接口
                that.$axios.get('/api/works_share/addHits/', {
                    params: { id: id },
                });
                let document_info = that.$common.document_dataparse(res_data.data.document);
                let document_pages = that.$common.document_pages_dataparse(res_data.data.documentPages);
                that.document_info = document_info;
                that.document_pages = document_pages;
                that.is_favorite = res_data.data.collect;
                // 作品信息
                that.work_info = {
                    worksId: res_data.data.worksId,
                    worksName: res_data.data.worksName,
                    introduce: res_data.data.introduce,
                    date: res_data.data.date,
                    category: res_data.data.category,
                    isEdit: res_data.data.isEdit
                };
                // 获取文档作者信息
                that.author_info['usenum'] = res_data.data.useNum;
                that.get_document_author_info(document_info.id);
                // 微信端 调用微信分享接口
                if (utils.deviceENV().wechat) {
                    let title = `${that.work_info.worksName}-吾道`,
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
            if (!id) {
                return;
            }
            that.$axios.get('/api/document/get_doc_author/', {
                params: {
                    'id': id,
                    'type': 'works',
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
                    that.author_info = Object.assign(that.author_info, data);
                    // 获取相关列表信息
                    that.get_relevant_data();
                }
            }).catch((err) => {
                console.error(err);
            });
        },
        // 获取相关作品
        get_relevant_data() {
            let that = this;
            let cid = that.author_info.categoryId;
            if (!cid) {
                return;
            }
            that.$axios.get('/api/works_share/related_works/', {
                params: {
                    'cId': cid,
                    'count': 4,
                },
            }).then((res) => {
                if (res.data.type === 'success') {
                    that.relevant_list = res.data.data;
                }
            }).catch((err) => {
                console.error(err);
            });
        },
        // 相关作品跳转
        relevant_document_open(item) {
            let that = this;
            if (!item.id) {
                return;
            }
            window.location.href = `/mobile/works/slides/${item.id}/`;
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
            var that = this;
            // 小程序环境
            if (that.is_miniprogram) {
                that.wx_miniprogram.navigateTo({
                    'url': `/pages/share/share?type=works&id=${that.work_info.worksId}`,
                });
            } else {
                window.location.href = `/mobile/doc_share/?type=works&id=${that.work_info.worksId}`;
            }
        },
        // 收藏文档
        favorite_document() {
            let that = this;
            that.user_login_redirect(() => {
                let api, toast;
                if (that.is_favorite) {
                    api = `/api/member/delete_collect/`;
                    toast = `取消收藏成功`;
                } else {
                    api = `/api/member/collection/`;
                    toast = `收藏成功`;
                }
                that.$axios.post(api, {
                    documentId: that.document_info.id,
                    type: `works`,
                }).then(res => {
                    let res_data = res.data;
                    if (res_data.type === 'success') {
                        that.is_favorite = !that.is_favorite;
                    }
                    that.$toast(toast, 2000, 'wap');
                }).catch(err => {
                    console.error(err);
                    that.$toast('操作失败!', 2000, 'wap');
                });
            });
        },
        // 作品简介 开关简介截取
        toggle_introduce_slice () {
            this.introduce_slice = !this.introduce_slice;
        },
        // 下载作品
        work_download () {
            let that = this,
                id = that.work_info.worksId;
            // 小程序环境下无法直接在web-view下载
            if (that.is_miniprogram) {
                that.wx_miniprogram.navigateTo({
                    'url': `/pages/download/download?id=${id}&title=${encodeURI(that.work_info.worksName)}&type=works`,
                });
            } else {
                that.$refs.export_modal.show(id, that.work_info.worksName, 'worksShare');
            }
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
    .vertical_header{
        width: 100%;
        padding: 0.7rem 0.85rem;
        background-color: #ffffff;
        .content {
            position: relative;
            padding-right: 1.5em;
            font-size: 0.69rem;
            color: #5f656d;
            &.slice {
                display: -webkit-box;
                -webkit-box-orient: vertical;
                -webkit-line-clamp: 2;
                overflow: hidden;
                text-overflow: ellipsis;
                &::after {
                    bottom: 0.25rem;
                    transform: rotate(45deg);
                }
            }
            &::after {
                content: "";
                position: absolute;
                right: 0.2rem;
                bottom: 0.05rem;
                width: 0.4rem;
                height: 0.4rem;
                border: 0.15rem solid #86909c;
                border-left: none;
                border-top: none;
                border-radius: 0.15rem;
                transform: rotate(-135deg);
                transition: all 0.2s;
            }
        }
    }
    .vertical_footer{
        width: 100%;
        background-color: #f8f8f8;
        .info_contaner {
            padding: 1.6rem 0.85rem 1.25rem;
            border-bottom: 0.23rem solid rgba(216, 216, 216, 0.5);
            .author_info {
                height: 2.4rem;
                padding-bottom: 0.45rem;
                border-bottom: 0.03rem solid rgba(200, 212, 226, 0.5);
                overflow: hidden;
                img {
                    display: inline-block;
                    vertical-align: middle;
                    width: 1.75rem;
                    height: 1.75rem;
                    margin-right: 0.5rem;
                    background-color: #5f656d;
                    border-radius: 50%;
                }
                span {
                    display: inline-block;
                    vertical-align: middle;
                    line-height: 1.75rem;
                    font-size: 0.69rem;
                    color: #161719;
                    &:last-child {
                        float: right;
                        font-size: 0.52rem;
                        color: #9ba5b1;
                    }
                }
            }
            .works_info {
                padding-top: 1rem;
                font-size: 0;
                span {
                    display: inline-block;
                    line-height: 1rem;
                    min-width: 7.5rem;
                    font-size: 0.62rem;
                    color: #010101;
                    white-space: normal;
                }
            }
        }
        .relevant_container {
            padding: 1rem 0.8rem;
            .relevant_title {
                margin-bottom: 0.5rem;
                height: 1rem;
                line-height: 1rem;
                overflow: hidden;
                p {
                    float: left;
                    color: #000000;
                    font-size: 0.62rem;
                    font-weight: bold;
                }
                a {
                    float: right;
                    color: var(--mainColor);
                }
            }
            .relevant_list {
                font-size: 0;
                li {
                    position: relative;
                    display: inline-block;
                    width: calc(50% - 0.65rem / 2);
                    margin-right: 0.65rem;
                    margin-bottom: 0.5rem;
                    font-size: 0.62rem;
                    color: #000000;
                    &::before {
                        content: "";
                        display: block;
                        padding-top: calc(56.25% + 1rem);
                    }
                    &:nth-child(2n) {
                        margin-right: 0;
                    }
                    img {
                        position: absolute;
                        top: 0;
                        left: 0;
                        width: 100%;
                    }
                    p {
                        position: absolute;
                        left: 0;
                        bottom: 0;
                        right: 0;
                        line-height: 1rem;
                        font-size: 0.62rem;
                        color: #000000;
                        overflow: hidden;
                        text-overflow: ellipsis;
                        white-space: nowrap;
                    }
                }
            }
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
            .opeartion_download_btn {
                position: relative;
                right: -1rem;
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
            .opeartes_btn{
                position: relative;
                right: -1rem;
                height: 1.3rem;
                line-height: 1.3rem;
            }
            .share_btn {
                position: relative;
                left: -0.5rem;
                width: 1.3rem;
                height: 1.3rem;
                margin-right: 1rem;
            }
        }
    }
}
</style>