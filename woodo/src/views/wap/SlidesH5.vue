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
                :h5_mode="true"
                @sendToolbar="tool_show2hide"
                @sendScreen="rotate_screen"
            ></slides_main>

            <!-- 下一页箭头 -->
            <div class="slides_nextpage" :class="[screenType, (share_referrer ? '' : 'up')]" @click.stop @touchstart.stop="set_slides_page('next')">
                <img src="../../assets/wap/images/display/next_v.png" alt="">
            </div>

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
                </div>
                <!-- 竖屏状态 操作栏 -->
                <div class="opeartion_bar" v-else>
                    <!-- 编辑分享信息 -->
                    <div class="opeartion_btn opeartion_edith5_share_btn" v-if="is_collaborate" @click="edith5_share_open">
                        <img src="../../assets/wap/images/display/edit_info_g.png" alt=""/>
                        <span>修改</span>
                    </div>
                    <!-- 横屏播放 -->
                    <div class="opeartion_btn opeartion_play_btn" @click="rotate_screen('horizontal')">
                        <img src="../../assets/wap/images/display/play_g.png" alt=""/>
                        <span>演示</span>
                    </div>
                    <!-- flex 占位 -->
                    <div class="opeartion_btn seat"></div>
                    <!-- 分享 -->
                    <div class="opeartion_btn opeartion_share_btn" @click="share_document">
                        <img src="../../assets/wap/images/display/share_w.png" alt=""/>
                        <span>分享</span>
                    </div>
                </div>
            </div>

            <!-- 编辑分享信息 弹层 -->
            <transition name="modal-fade">
                <div class="edith5_share_modal" v-if="show_edith5_share" @click="edith5_share_close">
                    <div class="edith5_body" @click.stop>
                        <p class="modal_title">标题封面</p>
                        <p class="title">{{ document_info.title || '' }}</p>
                        <div class="remarks">
                            <textarea maxlength="60" v-model="share_info.remark" @focus="remark_select"></textarea>
                            <div class="maxlength">{{ share_info.remark.length }}/60</div>
                        </div>
                        <div class="cover">
                            <img :src="share_info.share_image" alt="" />
                            <label for="uploadfile">
                                <span>更换封面</span>
                                <input v-show="false" type="file" accept="image/*;capture=camera" id="uploadfile" @change="replace_share_image" />
                            </label>
                        </div>
                        <a href="javascript:;" class="save" v-if="save_ing">保存中...</a>
                        <a href="javascript:;" class="save" v-else @click="edith5_share_save">保存</a>
                        <base-logo class="logomark" type="text" theme="gray"></base-logo>
                    </div>
                </div>
            </transition>
        </div>
    </div>
</template>

<script>
import slides_main from '@/views/wap/Slides/Slides.vue';

export default {
    name: "SlidesH5",
    components: {
        slides_main,
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
            show_edith5_share: false,               // h5分享弹窗显示状态
            save_ing: false,                        // 接口请求状态

            document_author: '',
            document_info: {},
            document_pages: [],
            is_collaborate: false,                  // 协作权限
            is_mine: false,                         // 当前文档是否是当前用户的
            share_info: {
                share_image: '',                        // h5分享封面图片
                remark: '',                             // h5分享描述
                defalut_remark: `我刚刚在吾道幻灯片上做了一个非常有意思的PPT作品，里面有你感兴趣的内容，快来围观我吧~`,
            },
            // 默认背景音乐
            backgroundMusic: {
                fadeOut: "00:00",
                src: "https://file.woodo.cn/upload/media/202002/18/39fdf356-6078-4560-9c95-031c6f5382c6.mp3",
                fadeIn: "00:00",
                loop: true,
                hideOnShow: false,
                autoplay: true,
            },
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
                    content: `https://www.woodo.cn/mobile/h5/slides/${this.$store.state.metaInfo.query}/`
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
            that.get_document_info(that.$route.params.id);
        }).catch((res) =>{
            console.error("error " + res);
            that.get_document_info(that.$route.params.id);
        });
    },
    methods: {
        // 获取文档信息
        get_document_info(url) {
            let that = this;
            if (!url) {
                return;
            }
            let headers = {};
            let deviceType = that.$route.query.deviceType;
            if (deviceType) {
                headers = {
                    deviceType: deviceType
                }
            }
            that.$axios.get(`/api/document/${url}/?createH5=true`, {
                headers: headers
            }).then(res => {
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
                document_info.attr['backgroundMusic'] = Object.assign(that.backgroundMusic, document_info.attr['backgroundMusic'] || {});
                // h5模式 固定自动播放 播放时不隐藏图标
                document_info.attr.backgroundMusic['loop'] = true;
                document_info.attr.backgroundMusic['autoplay'] = true;
                document_info.attr.backgroundMusic['hideOnShow'] = false;
                that.document_info = document_info;
                that.document_pages = document_pages;
                that.is_mine = res_data.data.isMine;
                that.is_collaborate = ['owner', 'edit'].indexOf(res_data.data.collaborateRoleType) >= 0;
                // 当前文档作者打开时默认底部显示
                if (that.is_mine) {
                    that.share_referrer = false;
                }
                // 微信端 调用微信分享接口
                if (utils.deviceENV().wechat) {
                    let title = `${that.document_info.title}-吾道`,
                        desc = `${that.user.name || '您的好友'}向您分享了一份幻灯片文档，请点击查阅`;
                    that.$common.get_wexin_sdk(title, desc, window.location.href);
                }
                // 从分享链接进来直接横屏演示
                that.rotate_screen('horizontal');
                // 获取h5分享信息
                if (that.is_collaborate) {
                    that.get_h5_share_info(document_info.id);
                }
            }).catch(err => {
                console.error(err);
            });
        },
        get_h5_share_info(id) {
            let that = this;
            if (!id) {
                return;
            }
            that.$axios.get(`/api/document_share/get_share_content/`, {
                params: {
                    docId: id,
                },
            }).then(res => {
                let res_data = res.data;
                that.share_info.remark = res_data.data['shareContent'] || that.share_info.defalut_remark;
                let share_img = res_data.data['shareImage'];
                if (share_img) {
                    that.share_info.share_image = share_img;
                } else {
                    // 生成封面图
                    let page_html = that.$common.obj_2_svg(that.document_info, that.document_pages[0]);
                    let to_base64 = that.$common.svg_2_base64(page_html, false);
                    to_base64.then((res) => {
                        that.share_info.share_image = res;
                    }).catch((err) => {
                        console.error(err);
                    });
                }
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
        // 演示页翻页方法
        set_slides_page(action) {
            this.$refs.slides_main.page_switch_control(action);
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
                    'url': `/pages/share/share?type=h5&url=${that.document_info.url}`,
                });
            } else {
                window.location.href = `/mobile/doc_share/?type=h5&url=${that.document_info.url}`;
            }
        },
        // 显示h5分享编辑页面
        edith5_share_open() {
            let that = this;
            that.user_login_redirect(() => {
                that.show_edith5_share = true;
            });
        },
        edith5_share_close() {
            this.show_edith5_share = false;
        },
        // 编辑h5分享描述，全选
        remark_select(event) {
            event.target.select();
        },
        // 上传自定义封面图，转base64
        replace_share_image(event) {
            let that = this;
            let $this = event.target;
            if (!$this) {
                return;
            }
            let file = $this.files.length > 0 ? $this.files[0] : null;
            // file 转 base64
            if (file) {
                let filereader = new FileReader();
                filereader.readAsDataURL(file);
                filereader.onloadend = e => {
                    that.share_info.share_image = filereader.result;
                }
            }
        },
        // 保存上传图片
        upload_share_image(error, callback) {
            let that = this;
            if ($validate(that.share_info.share_image).url()) {
                if (typeof callback === 'function') callback(that.share_info.share_image);
            } else {
                let url = that.document_info.attr['shareImage'] || '';
                url = url.replace(url.substring(url.lastIndexOf('.image')), '');
                let filename = url.substring(url.lastIndexOf('/') + 1);
                that.$common.upload_image({
                    'base64': that.share_info.share_image,
                    success: data => {
                        if (typeof callback === 'function') callback(data);
                    },
                    error: () => {
                        if (typeof error === 'function') error();
                    },
                });
            }
        },
        // h5分享保存
        edith5_share_save() {
            let that = this;
            if (that.save_ing) {
                return that.$toast('请勿重复提交', 1000, 'wap');
            }
            that.save_ing = true;
            that.upload_share_image(() => {
                // 错误处理
                that.save_ing = false;
                that.$toast('上传图片失败', 2000, 'wap');
            }, src => {
                that.$axios.post(`/api/member/document_share/save/`, {
                    docId: that.document_info.id,
                    shareContent: that.share_info.remark || that.share_info.defalut_remark,
                    shareImage: src,
                }).then(res => {
                    that.save_ing = false;
                    that.$toast(res.data.content, 2000, 'wap');
                    // 跳转到分享页
                    setTimeout(() => {
                        that.share_document();
                    }, 2000);
                });
            });
        },
    }
};
</script>

<style lang="less" scoped>
@import url("../../assets/wap/css/common.css");
@keyframes next {
    0% {transform: translateY(0); opacity: 0;}
    50% {transform: translateY(-100%); opacity: 1;}
    100% {transform: translateY(-150%); opacity: 0;}
}

.slides_contain {
    width: 100%;
    height: 100%;
}

.slides_wrapper {
    position: relative;
    width: 100%;
    height: 100%;
    background-color: #242424;
    overflow: hidden;
    .slides_nextpage {
        position: absolute;
        width: 2.4rem;
        height: 2.4rem;
        z-index: 1;
        &.vertical {
            bottom: 0.75rem;
            left: 50%;
            margin-left: -1.2rem;
            &.up {
                bottom: 2.8rem;
            }
        }
        &.horizontal {
            right: 0.75rem;
            top: 50%;
            margin-top: -1.2rem;
            transform: rotate(-90deg);
        }
        img {
            position: absolute;
            left: 50%;
            bottom: 0;
            margin-left: -0.6rem;
            width: 1.2rem;
            animation: next 1.2s 1s infinite;
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
            .seat {
                width: 3.5em;
            }
            .opeartion_edith5_share_btn,
            .opeartion_play_btn {
                width: 3.5em;
                line-height: normal;
                text-align: center;
                font-size: 0.56rem;
                img {
                    display: block;
                    width: 1.5rem;
                    margin: 0 auto;
                }
                span {
                    color: #ffffff;
                    white-space: nowrap;
                    opacity: 0.6;
                }
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

// 编辑分享信息 弹层
.edith5_share_modal {
    position: fixed;
    top: 0;
    left: 0;
    z-index: 999;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.5);
    overflow: hidden;
    .edith5_body {
        position: absolute;
        left: 0;
        bottom: 0;
        width: 100%;
        height: auto;
        max-height: 100vh;
        padding: 0 0.85rem 0.8rem;
        background-color: #f8f8f8;
        overflow-x: hidden;
        overflow-y: auto;
        .modal_title {
            line-height: 2.4rem;
            font-weight: bold;
            font-size: 0.8rem;
            color: #202329;
        }
        .title {
            width: 100%;
            height: 2.45rem;
            line-height: 2.45rem;
            padding-left: 0.8em;
            margin-bottom: 0.5rem;
            background-color: #ffffff;
            border-radius: 0.17rem;
            font-size: 0.73rem;
            color: #3c3c3c;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
        }
        .remarks {
            position: relative;
            width: 100%;
            height: 5.75rem;
            padding: 0.5rem;
            margin-bottom: 0.5rem;
            background-color: #ffffff;
            border-radius: 0.17rem;
            font-size: 0.62rem;
            color: #ababab;
            textarea {
                width: 100%;
                height: 100%;
                resize: none;
                color: #ababab;
            }
            .maxlength {
                position: absolute;
                right: 0.4rem;
                bottom: 0.4rem;
                opacity: 0.5;
            }
        }
        .cover {
            position: relative;
            width: 100%;
            height: 10rem;
            margin-bottom: 0.5rem;
            background-color: #f1f1f1;
            img {
                display: block;
                width: 100%;
                height: 100%;
                object-fit: cover;
                &[src=""] {
                    opacity: 0;
                }
            }
            label {
                position: absolute;
                left: 0;
                right: 0;
                bottom: 0;
                height: 1.55rem;
                line-height: 1.55rem;
                background-color: rgba(60, 60, 60, 0.6);
                text-align: center;
                font-size: 0.62rem;
                color: #ffffff;
            }
        }
        .save {
            display: block;
            width: 100%;
            line-height: 2.6rem;
            margin-bottom: 0.8rem;
            background-color: var(--mainColor);
            border-radius: 0.17rem;
            color: #ffffff;
            font-size: 0.83rem;
            text-align: center;
        }
        .logomark {
            display: block;
            margin: 0 auto;
            width: 4.4rem;
            user-select: none;
            opacity: 0.5;
        }
    }
}
</style>