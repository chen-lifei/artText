<template>
	<div class="index-container">
		<!-- 头部 -->
		<CommonHead :options="headOption"></CommonHead>
        <div class="container1">
            <div class="title flex">
                <div class="text">新一代免费</div>
                <div class="line"></div>
                <div class="text">在线演示文档</div>
            </div>
            <div class="desc">专为中文用户打造，三分钟快速上手</div>
            <div class="create-btn" @click="toHome">
                立即免费制作 
                <img @click.stop class="index-image" src="~@/assets/pc/images/index/index.svg" alt="">
            </div>
            <div class="use">吾道已被超过 <span class="number">1,508,678</span> 位白领、学生、公务员、高管和教育工作者使用，其中包括：</div>
            <img class="index-image2" src="~@/assets/pc/images/index/cooperate-company.png" alt="">
        </div>
        <div class="container2">
            <div class="image-container">
                <img class="editor" src="~@/assets/pc/images/index/editor.png" alt="">
                <img class="left-animation" src="~@/assets/pc/images/index/left.png" alt="">
                <img class="right-animation" src="~@/assets/pc/images/index/right.png" alt="">
            </div>
            <div class="text-container">
                <div class="main">快速上手，简单易用</div>
                <div class="desc">可能是国内最简单的演示文档产品，相比以PowerPoint为代表的传统软件，我们只保留和强化最多人使用的高频功能，砍掉了剩余繁杂部分，极大降低用户使用成本</div>
            </div>
        </div>
        <div class="top-curve"></div>
        <div class="container3">
            <div class="text-container">
                <div class="main-title">核心功能完善</div>
                <div class="main-desc">持续打磨优化核心功能，敏捷迭代，快速进化</div>
                <div class="top-container flex">
                    <div class="left-container">
                        <!-- <img src="~@/assets/pc/images/index/multiple-cooperate.svg" alt=""> -->
                        <div class="info">多人协作，实时共享</div>
                        <div class="desc">仅一条链接即可随时邀请好友加入协作，实时编辑、评论互动，也可创建团队共享资料库，体验全新的工作方式</div>
                    </div>
                    <div class="right-container flex" @mouseenter="enterEvent" @mouseleave="leaveEvent">
                        <div class="text-container">
                            <div class="info">功能强大，应有尽有</div>
                            <div class="desc">布尔运算、自动对齐排列、个性图表、动画特效、在线演示互动、导出文件，该有的功能应有尽有</div>
                        </div>
                        <transition-group name="fade">
                            <img class="right-image" v-bind:key="toolIndex" :src="require(`@/assets/pc/images/index/tool-${toolIndex + 1}.png`)" alt="">
                        </transition-group>
                        <div class="dot-panel">
                            <div class="dot"
                                :class="{ 'active': index === toolIndex }"
                                v-for="(item, index) in toolNumber"
                                :key="index"
                                @click="changeToolPanel(index)"></div>
                        </div>
                    </div>
                </div>
                <div class="bottom-container flex">
                    <img src="~@/assets/pc/images/index/autosave.png" alt="">
                    <div class="text-container">
                        <div class="info">无需下载，自动保存</div>
                        <div class="desc">无需下载安装，打开网页就能开始工作或学习，每一次编辑节点都会自动上传至云端记录，不怕丢失，任意恢复</div>
                        <div class="feature-container flex">
                            <div class="feature flex">
                                <div class="check-icon">
                                    <base-icon class="icondagou"></base-icon>
                                </div>
                                <span>自动保存</span>
                            </div>
                            <div class="feature flex">
                                <div class="check-icon">
                                    <base-icon class="icondagou"></base-icon>
                                </div>
                                <span>离线文件</span>
                            </div>
                            <div class="feature flex">
                                <div class="check-icon">
                                    <base-icon class="icondagou"></base-icon>
                                </div>
                                <span>操作记录</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <div class="container4 dark-area">
            <div class="top-container flex">
                <div class="title">
                    <div class="main-title">资源丰富</div>
                    <div class="main-title">全站即拿即用</div>
                    <div class="more-template" @click="toMore">更多{{ searchType === 'template' ? '模板' : '素材' }}</div>
                </div>
                <div class="number-search">
                    <div class="number-container">
                        <div class="number">5,000+</div>
                        <div class="name">模板</div>
                    </div>
                    <div class="number-container">
                        <div class="number">10万+</div>
                        <div class="name">素材</div>
                    </div>
                    <div class="search-container flex">
                        <base-icon class="iconsousuo search" :size="18" color="#949496" @click="search"></base-icon>
                        <input v-model="searchKeyword" type="text" placeholder="试试看，输入你想要的资源关键词" @keydown.enter="search">
                        <div class="button-group flex">
                            <div class="button template" :class="{ active: searchType === 'template' }" @click="searchType = 'template'">模板中心</div>
                            <div class="button material" :class="{ active: searchType === 'material' }" @click="searchType = 'material'">素材中心</div>
                        </div>
                    </div>
                </div>
            </div>
            <div class="list-container">
                <div class="top-list flex">
                    <div class="template-item"
                        v-for="(item, index) in templateList.slice(0, 10)"
                        :key="index">
                        <img class="cover" :src="item.image" alt="">
                    </div>
                </div>
                <div class="bottom-list"></div>
            </div>
        </div>
	</div>
</template>

<script>
    import CommonHead from '@/components/nav/CommonHead.vue';

	export default {
		metaInfo: {
			title: '吾道幻灯片-官方网站-专业的PPT在线协作工具，提供海量精美模板素材',
			meta: [
			    {
                    property: 'og:title',
                    content: '吾道幻灯片-官方网站-专业的PPT在线协作工具，提供海量精美模板素材'
                },
                {
                    property: 'og:url',
                    content: 'https://www.woodo.cn/'
                },
			]
		},
        components:{ CommonHead },
		data() {
			return {
                headOption: { theme:'white', fixed: true },
			    user: {},
                templateList: [],
                toolIndex: 0,
                interval: null,
                toolNumber: 3,
                searchType: 'template',
                searchKeyword: '',
			}
        },
        mounted() {
            this.startInterval();
            this.observeDarkArea();
            let that = this;
            // that.screen_h = window.innerHeight;
            // 登录状态
            that.user = that.$common.get_login_state();
            if(that.user.login && document.referrer.indexOf(window.location.host) < 0) {
                return window.location.href = '/home/';
            }
            // get 模板
            that.getTemplateList();
        },
		methods: {
            scroll() {
                let darkArea = document.querySelector('.dark-area');
                let top = darkArea.offsetTop - document.documentElement.scrollTop;
                if (top < 100) {
                    this.headOption = { theme:'dark', fixed: true };
                } else {
                    this.headOption = { theme:'white', fixed: true };
                }
            },
            observeDarkArea() {
                let observer = new IntersectionObserver(entries => {
                    if (entries[0].isIntersecting || entries[0].intersectionRatio > 0) {
                        document.addEventListener('scroll', this.scroll);
                    } else {
                        document.removeEventListener('scroll', this.scroll);
                        this.headOption = { theme:'white', fixed: true };
                    }
                });
                let darkArea = document.querySelector('.dark-area');
                observer.observe(darkArea);
            },
            toHome() {
                this.$router.push('/home/');
            },
            toMore() {
                if (this.searchType === 'template') {
                    this.$router.push({ path: '/design/template/' });
                } else {
                    this.$router.push({ path: '/design/photo/' });
                }
            },
            // 模板库列表
            getTemplateList() {
                this.$axios.get('/api/template/list/', {
                    params: {
                        pageSize: 20,
                        pageNumber: 1,
                        type: 'slides',
                        sort: 'hot'
                    }
                }).then(data => {
                    this.templateList = data.data.data.dataList;
                }).catch(err => {
                    this.$toast('获取模板列表错误');
                });
            },
            // 使用模版
            useTemplate(item) {
                let that  = this;
                if (!item) {
                    return;
                }
                if(item.isVip && !that.user.is_vip){
                    that.$modal({templateType:'memberGrade'});
                    return;
                }
                // 跳转到编辑页
                let value = window.localStorage.getItem('woodoExportGuide');
                if (!value) window.localStorage.setItem('woodoExportGuide', 'show');
                window.location.href = '/edit/?modalId=' + item.documentId;
            },
            // 返回顶部
            returnTop() {
                $('html, body').animate({ scrollTop: 0 }, 900);
            },
            changeToolPanel(index) {
                this.toolIndex = index;
            },
            startInterval() {
                this.interval = setInterval(() => {
                    if (this.toolIndex === this.toolNumber - 1) {
                        this.toolIndex = 0;
                    } else {
                        this.toolIndex++;
                    }
                }, 3000);
            },
            enterEvent() {
                clearInterval(this.interval);
            },
            leaveEvent() {
                this.startInterval();
            },
            search() {
            },
		},
	}
</script>

<style lang="less" scoped>
	.index-container {
        width: 100%;
        min-width: 1240px;
        overflow: hidden;
        background-color: #F6F6F9;

        .main-title {
            font-size: 72px;
            font-weight: bold;
            color: #000000;
            line-height: 80px;
        }

        .main-desc {
            font-size: 18px;
            color: #5F6063;
            margin-top: 15px;
        }

        .container1 {
            position: relative;
            padding-top: 310px;
            text-align: center;
            overflow: hidden;
            .title {
                .text {
                    font-weight: bold;
                    font-size: 60px;
                    color: #000000;
                }
                .line {
                    display: inline-block;
                    width: 2px;
                    height: 75px;
                    margin: 0 5px;
                    background-color: #000000;
                }
            }
            .desc {
                font-size: 28px;
                color: #242529;
                margin: 45px 0 90px;
            }
            .create-btn {
                position: relative;
                width: 220px;
                height: 80px;
                line-height: 80px;
                font-size: 20px;
                color: #FFFFFF;
                text-align: center;
                border-radius: 60px;
                margin: 0 auto 320px;
                cursor: pointer;
                background-color: var(--mainColor);
                box-shadow: 0 10px 25px rgba(11,123,246,0.4);
                .index-image {
                    position: absolute;
                    top: 100%;
                    left: calc(100% + 140px);
                }
            }
            .use {
                font-size: 18px;
                color: #949496;
                margin-bottom: 40px;
                .number {
                    font-size: 24px;
                }
            }
            .index-image2 {
                width: 65%;
                object-fit: cover;
            }
        }

        .container2 {
            padding-top: 190px;
            background: linear-gradient(#F6F6F9 0%, #F8F8FB 90%, #FFFFFF 100%);
            .image-container {
                position: relative;
                width: 100%;
                .editor {
                    width: 60%;
                    margin-left: 50%;
                    object-fit: cover;
                    transform: translateX(-50%);
                }
                .left-animation,
                .right-animation {
                    position: absolute;
                    width: 15%;
                    object-fit: cover;
                }
                .left-animation {
                    top: 38%;
                    left: 14%;
                    animation: left-animation 6s ease infinite;
                }
                .right-animation {
                    top: 11%;
                    right: 13%;
                    animation: right-animation 8s ease infinite;
                }
            }
            .text-container {
                padding: 80px 0 100px;
                text-align: center;
                .main {
                    margin-bottom: 20px;
                    color: #000000;
                    font-weight: bold;
                    font-size: 36px;
                }
                .desc {
                    width: 50%;
                    color: #242529;
                    font-size: 18px;
                    line-height: 36px;
                    margin-left: 50%;
                    transform: translateX(-50%);
                }
            }
        }

        .top-curve {
            position: relative;
            width: 100%;
            height: 80px;
            overflow: hidden;
            background: #F6F6F9;
            &::after {
                content: '';
                position: absolute;
                width: 106%;
                height: 200%;
                top: -100%;
                left: -3%;
                border-radius: 0 0 80% 80%;
                background: #FFFFFF;
            }
        }

        .container3 {
            margin: 200px 15%;
            .info {
                font-size: 24px;
                font-weight: bold;
            }
            .desc {
                font-size: 14px;
                line-height: 26px;
            }
            .top-container {
                margin: 60px 0 30px;
                .left-container {
                    padding: 50px 60px;
                    width: 30%;
                    height: 500px;
                    color: #FFFFFF;
                    margin-right: 30px;
                    border-radius: 20px;
                    background-color: #0B7BF6;
                    img {
                        width: 100%;
                        object-fit: cover;
                    }
                    .info {
                        margin: 50px 0 20px;
                    }
                }
                .right-container {
                    position: relative;
                    justify-content: space-between;
                    align-items: flex-start;
                    padding: 60px;
                    width: 70%;
                    height: 500px;
                    color: #000000;
                    border-radius: 20px;
                    background-color: #FFD02E;
                    .text-container {
                        .info {
                            margin: 60px 0 20px;
                        }
                        .desc {
                            width: 230px;
                        }
                    }
                    .right-image {
                        height: 100%;
                        object-fit: cover;
                    }
                    .dot-panel {
                        position: absolute;
                        left: 60px;
                        bottom: 80px;
                        .dot {
                            position: relative;
                            display: inline-block;
                            width: 16px;
                            height: 16px;
                            margin-right: 10px;
                            cursor: pointer;
                            border: 1px solid rgba(0, 0, 0, .4);
                            border-radius: 50%;
                            &:hover {
                                border-color: #000000;
                            }
                            &.active {
                                border-color: #000000;
                                &::before {
                                    content: '';
                                    position: absolute;
                                    width: 10px;
                                    height: 10px;
                                    top: 2px;
                                    left: 2px;
                                    border-radius: 50%;
                                    background-color: #000000;
                                }
                            }
                        }
                    }
                }
            }
            .bottom-container {
                width: 100%;
                height: 290px;
                border-radius: 20px;
                padding: 20px 0;
                background-color: #FFFFFF;
                .text-container {
                    margin-left: 10%;
                    .desc {
                        margin: 20px 0 40px;
                        width: 400px;
                        color: #242529;
                    }
                    .feature-container  {
                        justify-content: flex-start;
                        .feature {
                            justify-content: flex-start;
                            margin-right: 40px;
                            color: #949496;
                            .check-icon {
                                position: relative;
                                margin-right: 8px;
                                width: 16px;
                                height: 16px;
                                border-radius: 50%;
                                border: 1px solid #949496;
                                .base-icon {
                                    position: absolute;
                                    top: -2px;
                                    right: -3px;
                                }
                                &::before {
                                    content: '';
                                    position: absolute;
                                    width: 5px;
                                    height: 5px;
                                    background: #ffffff;
                                    border-radius: 50%;
                                    right: -2px;
                                    top: 1px;
                                }
                            }
                        }
                    }
                }
            }
        }

        .container4 {
            width: 100%;
            padding: 100px 0;
            color: #FFFFFF;
            background-color: #242529;
            .top-container {
                align-items: flex-end;
                justify-content: space-between;
                padding: 0 16%;
                .title {
                    .main-title {
                        color: #FFFFFF;
                    }
                    .more-template {
                        width: 180px;
                        height: 56px;
                        margin-top: 30px;
                        text-align: center;
                        line-height: 56px;
                        cursor: pointer;
                        border-radius: 10px;
                        background-color: var(--mainColor);
                    }
                }
                .number-search {
                    text-align: right;
                    .number-container {
                        display: inline-block;
                        margin-left: 40px;
                        text-align: right;
                        padding: 5px 0;
                        .number {
                            font-size: 24px;
                            color: #FFFFFF;
                        }
                        .name {
                            color: #949496;
                        }
                        &:first-child {
                            margin-left: 0;
                            padding: 5px 40px 5px 0;
                            border-right: 1px solid #3C3D41;
                        }
                    }
                    .search-container {
                        justify-content: flex-start;
                        width: 600px;
                        height: 56px;
                        margin-top: 40px;
                        border-radius: 28px;
                        background-color: #303135;
                        .search {
                            margin: 0 20px;
                            cursor: pointer;
                        }
                        input {
                            width: 280px;
                            margin-right: 20px;
                            color: #FFFFFF;
                        }
                        .button-group {
                            width: 236px;
                            height: 48px;
                            border-radius: 24px;
                            background-color: #242529;
                            .button {
                                width: calc(50% - 2px);
                                height: 44px;
                                border-radius: 22px;
                                text-align: center;
                                line-height: 44px;
                                color: #949496;
                                cursor: pointer;
                                background-color: transparent;
                                &.active {
                                    color: #FFFFFF;
                                    background-color: #303135;
                                }
                            }
                        }
                    }
                }
            }
            .list-container {
                width: 100%;
                margin-top: 120px;
                .top-list {
                    margin-bottom: 40px;
                }
                .template-item {
                    display: inline-block;
                    height: 225px;
                    margin-right: 30px;
                    cursor: pointer;
                    .cover {
                        height: 100%;
                        object-fit: cover;
                        border-radius: 20px;
                    }
                }
            }
        }

        // 浮动动画
        @keyframes left-animation {
            0% {
                transform: translate(0, 0);
            }
            50% {
                transform: translate(8px, 4px);
            }
            100% {
                transform: translate(0, 0);
            }
        }
        @keyframes right-animation {
            0% {
                transform: translate(0, 0);
            }
            50% {
                transform: translate(8px, -4px);
            }
            100% {
                transform: translate(0, 0);
            }
        }

        // 渐显动画
        .fade-enter-active, .fade-leave-active {
            transition: all 2s;
        }
        .fade-enter {
            opacity: 0;
        }
        .fade-enter-to {
            opacity: 1;
        }
        .fade-leave-active {
            display: none;
        }
    }
</style>