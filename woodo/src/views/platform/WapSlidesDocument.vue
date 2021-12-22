<template>
    <div class="slides_contain">
        <!-- 演示区域 -->
        <div class="slides_wrapper">
            <!-- 加载动画 -->
            <div class="loading_progress" v-show="!loaddone">
                <div class="center_logo"></div>
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
            </slides_main>

            <!-- 横屏状态 顶部操作栏 -->
            <div class="toolbar horizontal" :class="{'show': show_tool}" v-if="screenType === 'horizontal'">
                <div class="opeartion_bar">
                    <!-- 回到竖屏 -->
                    <div class="opeartion_btn opeartion_play_btn" @click="rotate_screen('vertical')">退出播放</div>
                </div>
            </div>
            <!-- 竖屏状态 顶部显示操作栏 :class=top  -->
            <div class="toolbar vertical" :class="{'top': share_referrer, 'show': show_tool}" v-else>
                <!-- 从其他用户分享来的链接打开 -->
                <div class="opeartion_bar" v-if="share_referrer">
                    <!-- 横屏播放 -->
                    <div class="opeartion_btn opeartion_play_btn" @click="rotate_screen('horizontal')">
                        <img src="../../assets/wap/images/display/play_b.png" alt=""/>
                    </div>
                </div>
                <!-- 竖屏状态 操作栏 -->
                <div class="opeartion_bar" v-else>
                    <!-- 横屏播放 -->
                    <div class="opeartion_btn opeartion_play_btn" @click="rotate_screen('horizontal')">
                        <img src="../../assets/wap/images/display/play_w.png" alt=""/>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import slides_main from '@/views/wap/Slides/Slides.vue';

export default {
    name: "SlidesDocument",
    components: {
        slides_main,
    },
    data() {
        return {
            loaddone: false,
            document_access: '',                    // 文档访问权限
            share_referrer: false,                  // 页面访问来源，为空值时是收到分享链接打开的状态
            screenType: 'vertical',                 // 横竖屏标识 vertical = 竖屏   horizontal = 横屏
            show_tool: true,                        // 显示工具栏 初始 true
            is_miniprogram: false,                  // 当前环境是否为小程序
            wx_miniprogram: {},                     // 小程序环境下私有对象

            document_info: {},
            document_pages: [],
        };
    },
    metaInfo() {
        return {
            title: this.document_info.title || '吾道幻灯片',
        }
    },
    mounted() {
        let that = this;
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
        let appId = that.$route.query.appId;
        let token = that.$route.query.token;
        let time = that.$route.query.time;
        let docId = that.$route.query.docId;
        if (!appId) {
            return that.$toast('appId不允许为空', 9999);
        }
        if (!token) {
            return that.$toast('token不允许为空', 9999);
        }
        if (!time) {
            return that.$toast('time不允许为空', 9999);
        }
        if (!docId) {
            return that.$toast('docId不允许为空', 9999);
        }
        let params = {
            appId: appId,
            token: token,
            time: time,
        };
        that.get_document_info(docId, params);
    },
    methods: {
        // 获取文档信息
        get_document_info(docId, params) {
            let that = this;
            that.$axios.get(`/api/platform/document/detail/${docId}/`, {
                params: params
            }).then(res => {
                let res_data = res.data;
                // 访问错误  无权限处理
                if (res_data.type === 'error') {
                    return that.$toast(res_data.content, 9999);
                }
                that.loaddone = true;
                let document_info = that.$common.document_dataparse(res_data.data.document);
                let document_pages = that.$common.document_pages_dataparse(res_data.data.documentPages);
                that.document_info = document_info;
                that.document_pages = document_pages;
            }).catch(err => {
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
</style>