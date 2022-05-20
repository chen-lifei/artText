<template>
    <div class="works_detail_contain" :class="{'skeleton-wrapper': !renderready}" @click="number_list_show = false">
        <div class="contain_wrapper" ref="scroll_contain" :style="{'overflow-y': fullScreen ? 'hidden' : 'auto'}">
            <!-- 演示主体 -->
            <div class="slides_container">
                <top_progress ref="top_progress" v-if="!isComponent" :renderdone="renderdone"></top_progress>

                <!-- 非全屏下组件状态关闭按钮 -->
                <a href="javascript:;" class="outer_page" v-if="isComponent" v-show="!fullScreen" @click="sendCloseEvent" v-bdtongji="'演示页面-预览状态-右上角-右上角-关闭'"></a>

                <div class="slides_wrapper">
                    <!-- 跳转上一页 -->
                    <div class="pre_page_area" 
                        :style="{'width':`calc(50% - ${svg_w /2 }px)`}"
                        v-show="page_number > 0"
                        @click="set_page_switch('prev')">
                    </div>
                    <!-- 跳转下一页 -->
                    <div class="next_page_area" 
                        :style="{'width':`calc(50% - ${svg_w /2 }px)`}"
                        v-show="page_number < (document_pages.length - 1)"
                        @click="set_page_switch('next')">
                    </div>
                    <!-- 骨架预览图 -->
                    <div class="slides_skeleton" v-if="!renderready">
                        <img src="~@/assets/pc/images/display/slides-skeleton.png" alt="" />
                    </div>

                    <!-- logo 全屏需隐藏 -->
                    <base-logo v-show="!fullScreen" theme="gray" link="/"  v-bdtongji="'演示页面-预览状态-左上角-左上角-返回首页'"></base-logo>

                    <!-- 右上角退出全屏按钮 -->
                    <div class="full_screen_out" v-show="fullScreen">
                        <div class="wrapper">
                            <a href="javascript:;" class="out_full" @click="outFullScreen" v-bdtongji="'演示页面-全屏状态-右上角-右上角-取消全屏'"></a>
                            <a href="javascript:;" class="out_page" v-if="isComponent" @click="sendCloseEvent" v-bdtongji="'演示页面-全屏状态-右上角-右上角-关闭全屏'">退出</a>
                        </div>
                    </div>
                    <!-- 演示区域 -->
                    <div class="slides_middle" :style="{'height': fullScreen ? '100%' : 'auto','marginTop': fullScreen ? 0 : '-47px'}">
                        <!-- 演示区域主体 -->
                        <slides_main ref="slides_main"
                            :svg_w="svg_w"
                            :svg_h="svg_h"
                            :svg_view="svg_view"
                            :document_info="document_info"
                            :document_pages="document_pages"
                            :fullScreen="fullScreen"
                            :flip_btn_hide="flip_btn_hide"
                            :enable_deferrender="!isComponent"
                            :enable_animation="enable_animation"
                            :auto_play_media="auto_play_media"
                            @sendPageNumber="async_page_number"
                            @sendOutFull="async_out_full"
                            @renderFirst="render_first"
                            @renderDone="render_done"
                        ></slides_main>

                        <!-- 演示区域尾部 全屏需隐藏 -->
                        <div class="slide_footer" v-show="!fullScreen" :style="{'width': `${svg_w}px`,'left':`calc(50% - ${svg_w /2 }px)`}">
                            <div class="page_number_panel">
                                <span v-tooltip.top="`切换页面`" 
                                      @click.stop="number_list_show = !number_list_show" 
                                      :class="{show:number_list_show}"
                                      v-bdtongji="`共享作品-首页-作品预览区-底部-切换页面`">第 {{ page_number + 1 }} 张幻灯片</span>
                                <!--底部页码选择栏-->
                                <transition name="modal-fade">
                                    <div class="page_number_list" v-show="document_pages.length > 0 && number_list_show">
                                        <span v-for="(item,index) in document_pages"
                                            :key="index"
                                            :class="{current:page_number == index}"
                                            @click.stop="to_page_number(index)"
                                        >第 {{index + 1}} 张幻灯片:  {{item.title ? item.title : "未命名"}}</span>
                                    </div>
                                </transition>
                            </div>
                            <div class="footer_right">
                                <button class="pre_btn" 
                                        :class="{disabled:page_number === 0}" 
                                        @click="set_page_switch('prev')" 
                                        v-tooltip="page_number !== 0 ? '上一页' : ''"
                                        v-bdtongji="`共享作品-首页-作品预览区-底部-上一页`"></button>
                                <button class="next_btn" 
                                        :class="{disabled:page_number === document_pages.length}" 
                                        @click="set_page_switch('next')" 
                                        v-tooltip="page_number !== document_pages.length ? '下一页' : ''"
                                        v-bdtongji="`共享作品-首页-作品预览区-底部-下一页`"></button>
                                <button class="preview_btn" v-tooltip="`全屏演示`" @click="inFullScreen" v-bdtongji="`共享作品-首页-作品预览区-底部-全屏演示`"></button>
                            </div>
                        </div>
                    </div>

                    <!-- 作品信息 全屏需隐藏 -->
                    <div class="work_info_panel" ref="workInfoPanel" v-show="!fullScreen">
                        <div class="wrapper" :style="{'width': `${svg_w}px`}">
                            <p class="title">
                                <span class="title_text">{{ work_info.worksName || '' }}</span>
                                <span class="category" :class="get_color(work_info.category)">{{ work_info.category }}</span>
                            </p>
                            <span style="color: #ffffff; margin-left: 20px; vertical-align: middle;">共享作品ID：{{work_info.worksId}}</span>
                            <div class="panel_right">
                                <div class="share_code">
                                    <button class="code_btn"></button>
                                    <div class="qrcode_container">
                                        <base-logo class="qrcode_logo" type="code" width="25" height="25"></base-logo>
                                        <img class="qrcode" :src="qrcode_dataurl" alt="">
                                        <p>手机上也可以扫码查看</p>
                                    </div>
                                </div>
                                <button class="collect_btn" v-if="favoriteType" v-tooltip.top="favoriteId ? '取消收藏' : '收藏'" :class="{'collected': favoriteId}" @click.stop="cardToggleFavorite($event, work_info.worksId, favoriteType)" v-bdtongji="`共享作品-预览页-作品预览区-中部-收藏`"></button>
                                <button class="share_btn" v-tooltip.top="`分享`" @click="open_share" v-bdtongji="`共享作品-预览页-作品预览区-中部-分享`"></button>
                                <i class="_split"></i>
                                <button class="use_template_btn" v-if="work_info.isEdit" @click="use_template" v-bdtongji="`PC-统计-共享作品-全部作品-查看-立即编辑`">编辑</button>
                                <span class="down_tip" v-else>本作品仅供参考，不支持编辑与下载</span>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- 未登录 -->
                <div class="un_login_tip" v-if="!user.login" v-show="!fullScreen && loaddone">
                    <span>温馨提醒：您现在处于游客状态，部分功能不支持使用，请登录后继续操作</span>
                    <a @click="to_login">登录</a>
                    <i class="close_tip" @click="hide_login_tip"></i>
                </div>
            </div>
            <!-- 作品相关模块 -->
            <div class="work_related_panel">
                <div class="wrapper">
                    <div class="work_author_panel">
                        <img :src="document_author.authorImg">
                        <div>
                            <span>{{document_author.authorName}}</span>
                            <span>{{work_info.date}}</span>
                        </div>
                        <p class="introduce">{{work_info.introduce}}</p>
                    </div>
                    <div class="related_works_panel">
                        <div class="header">
                            <p class="title">相关作品</p>
                            <a class="more" href="/design/works_share/">更多></a>
                        </div>
                        <div class="works_list">
                            <template v-if="hot_works_list.length">
                                <works_card v-for="(item,index) in hot_works_list" :key="index" :card-info="item"></works_card>
                            </template>
                            <!-- 占位 -->
                            <works_card v-else v-for="s_item in 4" :key="s_item"></works_card>
                        </div>
                    </div>
                </div>
            </div>
            <!-- 分享弹窗 -->
            <share_modal ref="share_modal"></share_modal>
            <!-- 通用底部 -->
            <CommonFoot :theme="'dark'" v-if="!isComponent" v-show="!fullScreen"></CommonFoot>
        </div>
    </div>
</template>

<script>
import Vue from 'vue';
import QRCode from 'qrcode';
import CommonFoot from '@/components/nav/CommonFoot.vue';
import share_modal from '@/components/ShareModal.vue';
import slides_main from '@/views/pc/Slides/components/Slides.vue';
import works_card from '@/views/pc/Design/components/Card/WorksShareCard.vue';
import top_progress from '@/components/TopProgress.vue';

Vue.use(QRCode);

export default {
    name: "SlidesWorks",
    components: {
        CommonFoot,
        slides_main,
        share_modal,
        works_card,
        top_progress,
    },
    data() {
        return {
            user: {},
            isComponent: this.$parent.$el !== this.$root.$el,                   // 是否是以组件载入页面
            fullScreen: false,                                                  // 是否全屏
            flip_btn_hide: true,                                                // 是否显示左右切换按钮
            loaddone: false,                                                    // 数据是否加载完成
            renderready: false,                                                 // 渲染文档准备完成，已完成第一页渲染
            renderdone: false,                                                  // 幻灯片是否渲染完成
            throttle: false,                                                    // 节流阀
            number_list_show: false,

            // 文档数据相关
            document_info: {},                      // 文档数据
            document_pages: [],                     // 文档页数据
            document_author: {},                    // 文档作者信息
            work_info: {},                          // 作品信息
            favoriteType: '',                       // 收藏类型
            page_number: 0,                         // 页码
            page_title: '未命名',                   // 页标题
            qrcode_dataurl: '',                     // 二维码 base64

            // 作品推荐相关
            card_num:0,
            all_hot_works_list:[],
            hot_works_list:[],
            favorite_map_arr:{},

            // 渲染相关
            svg_w: 910,
            svg_h: 512,
            svg_view: [0, 0, 0, 0],
            enable_animation: true,                 // 启用动画
            auto_play_media: [],                    // 禁用动画时，需自动播放的媒体
        };
    },
    computed: {
        // 收藏id
        favoriteId() {
            const correlationId = this.work_info.worksId;
            const favoriteType = this.favoriteType;
            const favoriteTypeInfo = this.$store.getters.favoriteInfo[favoriteType];
            return favoriteTypeInfo ? favoriteTypeInfo.favoriteMap[correlationId] : null;
        }
    },
    metaInfo() {
        return {
            title: !this.isComponent ? `${this.$store.state.metaInfo.title ? `${this.$store.state.metaInfo.title}-` : ''}吾道幻灯片` : document.title,
            meta: [
                {
                    name: 'robots',
                    content: 'noindex,nofollow,noarchive'
                },
                {
                    property: 'og:title',
                    content: `${this.$store.state.metaInfo.title ? `${this.$store.state.metaInfo.title}-` : ''}吾道幻灯片`
                },
                {
                    property: 'og:url',
                    content: `https://www.woodo.cn/works/slides/${this.$store.state.metaInfo.query}/`
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
        };
    },
    asyncData({store,host,route}) {
        return store.dispatch('setMeta',{url:`${host}/api/common/worksshare/url_info/`, params:{id:route.params.id}});
    },
    mounted() {
        let that = this;
        that.user = that.$common.get_login_state();
        that.get_hot_list();
        if (!that.isComponent) {
            that.get_document_info(that.$route.params.id);
            return;
        }
    },
    methods: {
        // 在组件状态下，调用此方法可加载演示层
        show(opt) {
            let that = this;
            let option = {
                id: '',                 // document_info.url
                begin: 0,               // 起始演示页面下标
                inFullScreen: true,     // 进入全屏
                enableAnimation: true,  // 启用动画
                autoPlayMedia: [],      // 自动播放一组媒体
            };
            option = Object.assign(option, opt);
            that.auto_play_media = option.autoPlayMedia;
            that.enable_animation = option.enableAnimation;
            that.$refs.slides_main.set_page_number(option.begin);
            if (option.inFullScreen) {
                that.inFullScreen();
            }
            that.get_document_info(option.id);
        },
        /**
         * 初始化方法
         */
        // 幻灯片渲染完成第一页
        render_first() {
            this.renderready = true;
        },
        render_done() {
            this.renderdone = true;
        },
        // 获取文档信息
        get_document_info(id, callback) {
            let that = this;
            if (!id) {
                return;
            }
            // 作品分享统计
            let act = that.$route.query.act;
            let worksShareShare = false;
            if (typeof act !== 'undefined' && act === 'share') {
                worksShareShare = true;
            }
            that.$router.push({
                path: that.$route.fullPath.replace('&act=share', ''),
            });
            that.$axios.get(`/api/works_share/detail/${id}/`, {
                headers: {
                    worksShareShare: worksShareShare,
                },
            }).then(res => {
                let res_data = res.data;
                that.loaddone = true;
                // 访问错误  无权限处理
                if (res_data.type === 'error') {
                    window.location.href = '/no_power/?type=nonexistent';
                    return;
                }
                let document_info = that.$common.document_dataparse(res_data.data.document);
                let document_pages = that.$common.document_pages_dataparse(res_data.data.documentPages, (item) => {
                    // 默认淡入淡出
                    item.switchType = 'fadeInAndOut';
                });
                that.document_info = document_info;
                that.document_pages = document_pages;
                that.favoriteType = 'workShare';
                // 作者信息
                let author = {
                    authorId: res_data.data.authorId,
                    authorImg: res_data.data.authorImg,
                    authorName: res_data.data.authorName,
                };
                that.document_author = author;
                // 作品信息
                let work_info = {
                    worksId: res_data.data.worksId,
                    worksName: res_data.data.worksName,
                    introduce: res_data.data.introduce,
                    category: res_data.data.category,
                    date: res_data.data.date,
                    collectNum: res_data.data.collectNum,
                    useNum: res_data.data.useNum,
                    isEdit: res_data.data.isEdit,
                };
                that.work_info = work_info;
                // 初始化渲染
                that.svg_render();
                that.$nextTick(() => {
                    that.init_function();
                    if (typeof callback === 'function') callback();
                });
            }).catch(err => {
                console.error(err);
            });
        },
        // 获取 大家都在用 列表
        get_hot_list: function(){
            let that = this;
            that.$axios.get('/api/works_share/hot/list/').then(function(data){
                if(data.data.code === '2'){
                    that.all_hot_works_list = data.data.data.dataList;
                    that.favorite_map_arr = data.data.data.favoriteMap;
                    that.calculate_card_num(() => that.refresh_floor_render())
                }
            });
        },
        // 初始化渲染模板
        svg_render() {
            let that = this;
            let document_info = that.document_info;
            if (!document.querySelector('.slides_wrapper') || !document_info.width || !document_info.height) {
                return;
            }
            let ratio = document_info.width / document_info.height;
            let width = 0;
            let height = 0;
            // 全屏状态下
            if (that.fullScreen) {
                let window_width = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
                let window_height = window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight;
                // 计算全屏时的尺寸
                if (window_width / ratio > window_height) {
                    width = window_height * ratio;
                    height = window_height;
                } else {
                    width = window_width;
                    height = window_width / ratio;
                }
                that.svg_w = width;
                that.svg_h = height;
                that.svg_view = [((window_width - width) / 2), ((window_height - height) / 2), document_info.width, document_info.height];
            } else {
                let contain_width = document.querySelector('.slides_wrapper').clientWidth - 200;
                let contain_height = document.querySelector('.slides_wrapper').clientHeight - 141;
                if (contain_height * ratio > contain_width) {
                    width = contain_width;
                    height = contain_width / ratio;
                } else {
                    width = contain_height * ratio;
                    height = contain_height;
                }
                that.svg_w = width;
                that.svg_h = height;
                that.svg_view = [0, 0, document_info.width, document_info.height];
            }
        },
        // 接口数据获取完成，进行页面渲染
        init_function() {
            let that = this;
            // 窗口size改变同步样式
            window.removeEventListener("onorientationchange" in window ? "orientationchange" : "resize", that.window_resize_event);
            window.addEventListener("onorientationchange" in window ? "orientationchange" : "resize", that.window_resize_event);
            // 鼠标滚动事件 绑定翻页
            if (utils.deviceENV().firefox) {
                document.querySelector('.slides_body').addEventListener("DOMMouseScroll", that.wheel_listener);
            } else {
                document.querySelector('.slides_body').addEventListener("mousewheel", that.wheel_listener);
            }
            // 鼠标经过画布区域时,禁止页面滚动
            if(!that.fullScreen){
                document.querySelector('.slides_body').addEventListener("mouseover",function(){
                    $('.contain_wrapper').css('overflow','hidden');
                });
                document.querySelector('.slides_body').addEventListener("mouseout", function(){
                    $('.contain_wrapper').css('overflow-y','auto');
                });
            }
            // 按键事件绑定
            that.key_listener();
            // 更新页码 页标题
            that.async_page_number(0);
            // 生成二维码
            that.create_qrcode();
        },
        window_resize_event() {
            let that = this;
            if (that.loaddone) {
                // 判断是否退出预览
                let isFull = (document.fullScreenElement && document.fullScreenElement !== null) || document.mozFullScreen || document.webkitIsFullScreen;
                if (!isFull && that.fullScreen) {
                    that.fullScreen = false;
                    // 组件情况直接关闭
                    that.sendCloseEvent();
                }
                that.$nextTick(() => {
                    that.svg_render();
                });
            }
            that.calculate_card_num(() => that.refresh_floor_render());
        },
        // 计算一行展示卡片数量
        calculate_card_num: function(callback){
            if($('.works-card').length == 0) return false;
            let that = this;
            let window_width = window.innerWidth || document.documentElement.clientwidinnerWidth || document.body.clientwidinnerWidth;
            let card_width = $('.works-card')[0].clientWidth;
            let list_offset = window_width <= 1400 ? 0.8 : 0.75;
            let list_width = window_width * list_offset + 28;
            let card_num = parseInt(list_width / card_width);
            if(card_num < 2) card_num = 2;
            that.card_num = card_num * 2;
            if (typeof callback === 'function') callback();
        },
        // 更新作品楼层渲染
        refresh_floor_render: function(){
            let that = this;
            let new_list = that.all_hot_works_list;
            new_list = new_list.slice(0,that.card_num);
            that.hot_works_list = new_list;
        },
        // 以组件形式进入时，向父组件传递的事件
        sendCloseEvent() {
            let that = this;
            that.outFullScreen();
            if (!that.isComponent) {
                return;
            }
            that.$nextTick(() => {
                that.$emit('close');
            });
        },

        /**
         * 操作类方法
         */
        // 登录跳转
        to_login(callback) {
            let that = this;
            if (that.user.login) {
                if (typeof callback === 'function') callback();
                return;
            }
            let redirect_url = encodeURI(window.location.pathname + window.location.search);
            window.location.href = '/login/?redirectUrl=' + redirect_url;
        },
        // 公共 收藏 or 取消收藏
        cardToggleFavorite(e, correlationId, favoriteType) {
            if (this.favoriteId) {
                this.delFavorite(correlationId, favoriteType);
            } else {
                this.toggleFavoriteModal(e.target, correlationId, favoriteType);
            }
        },
        // 收藏弹窗切换显示
        toggleFavoriteModal(target, correlationId, type) {
            const that = this;
            if (that.favoritePanelShow) {
                that.$favoritePanel.destroy();
            } else {
                that.$favoritePanel.create({
                    parent: that,
                    currentElement: target,
                    favoriteParams: {type, correlationId},
                    beforeCreate () {
                        that.favoritePanelShow = true;
                    },
                    beforeDestroy() {
                        that.favoritePanelShow = false;
                    }
                });
            }
        },
        // 取消收藏
        delFavorite(correlationId, type) {
            this.$store.dispatch('favorite/delFavorite', {type, correlationId}).then(res => {
                this.$toast('取消收藏成功!');
            }).catch(err => {
                this.$toast('取消收藏失败~');
                console.error(err);
            });
        },
        // 生成二维码
        create_qrcode() {
            let that = this;
            let url = `${window.location.origin}/mobile/works/slides/${that.work_info.worksId}/`;
            QRCode.toCanvas(url, {
                width: 124,
                errorCorrectionLevel: 'Q',
            }).then((canvas) => {
                let ctx = canvas.getContext('2d');
                that.qrcode_dataurl = canvas.toDataURL('image/png', 1);
            }).catch((err) => {
                console.error(err);
            });
        },
        // 打开分享弹窗
        open_share() {
            let that = this;
            that.$refs.share_modal.show({
                type: 'works',
                urlid: that.work_info.worksId,
            });
        },
        // 关闭未登录提示
        hide_login_tip(event) {
            $(event.target).parents('.un_login_tip').remove();
        },
        // 使用为模板
        use_template() {
            let that = this;
            if(!that.work_info.isEdit){
                return;
            }
            that.to_login(() => {
                window.location.href = `/edit/?modalId=${that.document_info.id}`;
            });
        },

        /**
         * 全屏演示方法
         */
        inFullScreen() {
            let that = this;
            that.$refs.scroll_contain.scrollTop = 0;
            utils.inFullScreen(() => {
                that.fullScreen = true;
                that.$nextTick(() => {
                    that.svg_render();
                });
            })
        },
        outFullScreen() {
            utils.outFullScreen(() => {
                this.fullScreen = false;
            })
        },
        /**
         * 控制子组件方法 & 子组件事件传递方法
         */

        // 切换页面 action: 'next' || 'prev' || number
        set_page_switch(action) {
            this.$refs.slides_main.page_switch_control(action)
        },
        // 鼠标滚动事件
        wheel_listener(event) {
            let that = this;
            if (that.throttle) {
                return;
            }
            let e = event || window.event;
            if (e.ctrlKey || e.shiftKey || e.altKey || e.metaKey) {
                return;
            }
            let action;
            if (e.wheelDelta) {
                if (e.wheelDelta > 0) {
                    action = 'prev';
                } else {
                    action = 'next';
                }
            } else if (e.detail) {
                if (e.detail > 0) {
                    action = 'next';
                } else {
                    action = 'prev';
                }
            } else {
                return;
            }
            // 节流处理，测试到滚动事件会影响到动画的性能问题
            that.set_page_switch(action);
            that.throttle = true;
            setTimeout(() => {
                that.throttle = false;
            }, 300);
        },
        // 按键事件
        key_listener() {
            let that = this;
            document.onkeydown = e => {
                if (!document.querySelector('.slides_container .slides_wrapper')) {
                    return;
                }
                let event = e || window.event;
                let key = e.keyCode;
                let action;
                switch (true) {
                    case key === 37 || key === 38:
                        action = 'prev';
                        break;
                    case key === 39 || key === 40:
                        action = 'next';
                        break;
                    // f11 全屏监控
                    case key === 122:
                        event.preventDefault();
                        if(that.fullScreen) {
                            that.outFullScreen();
                        } else {
                            that.inFullScreen();
                        }
                        break;
                }
                that.set_page_switch(action);
            }
        },
        // 页码列表点击更新页码
        to_page_number(number) {
            if (isNaN(number)) {
                return;
            }
            this.set_page_switch(number);
        },
        // 子组件 pagenumber 更新同步
        async_page_number(number) {
            this.page_number = number;
            this.page_title = this.document_pages[number] && this.document_pages[number].title ? this.document_pages[number].title : '未命名';
        },
        // 子组件全屏演示结束
        async_out_full() {
            let that = this;
            // 在组件状态下，给父组件提供退出事件
            if (that.isComponent) {
                that.sendCloseEvent();
            } else {
                that.outFullScreen();
            }
        },

        // 分类底色
        get_color(type) {
            if(!type){
                return false
            }
            // 默认颜色
            let color = 'currency';
            // 颜色分类
            let search = [{
                'color': 'business',
                'text': ['创业', '融资', '商业', '计划', '名人堂']
            }, {
                'color': 'graduation',
                'text': ['教育', '课件', '培训']
            }, {
                'color': 'government',
                'text': ['党政', '建设', '政治', '政府']
            }, {
                'color': 'festival',
                'text': ['节日', '假日', '休闲', '婚庆', '生活']
            }, {
                'color': 'job',
                'text': ['工作', '汇报', '求职', '报告', '总结', '晋升', '运营']
            }, {
                'color': 'wedding',
                'text': ['庆典', '纪念']
            }, {
                'color': 'propaganda',
                'text': ['企业', '介绍', '行业', '宣传', '商务']
            }, {
                'color': 'education',
                'text': ['毕业', '答辩', '读书', '笔记']
            }, {
                'color': 'other',
                'text': ['其他']
            }];
            // 遍历查询颜色
            parent:for (let i in search) {
                let search_text = search[i]['text'],
                    search_color = search[i]['color'];
                for (let j in search_text) {
                    if (type.indexOf(search_text[j]) >= 0) {
                        color = search_color;
                        break parent;
                    }
                }
            }
            return color;
        },
    }
};
</script>

<style lang="less" scoped>
@import url("~@/assets/pc/css/common.css");
@skeleton_color: #fafafa;
@perview_sp: url("~@/assets/pc/images/common/preview_sp.png") no-repeat;
@display_sp: url("~@/assets/pc/images/display/display_sp.png") no-repeat;

.works_detail_contain{
    position: fixed;
    top: 0;
    left: 0;
    bottom: 0;
    right: 0;
    z-index: 1000;
    width:100%;
    height:100%;
    overflow:hidden;
    .contain_wrapper{
        width:100%;
        height:100%;
        overflow-x:hidden;
        overflow-y:auto;
        &::-webkit-scrollbar{display:none}
    }
}

.skeleton-wrapper {
    .slide_footer,
    .work_info_panel *,
    .work_author_panel *{
        display: none !important;
    }
    .slides_skeleton {
        position: absolute;
        top: 0;
        left: 0;
        z-index: 9999;
        width: 100%;
        height: 100%;
        padding: 35px 100px 96px;
        text-align: center;
        font-size: 0;
        img {
            display: block;
            margin: auto;
            width: auto;
            height: auto;
            max-width: 100%;
            max-height: 100%;
            min-width: 100%;
            min-height: 100%;
            object-fit: contain;
        }
    }
}

.slides_body {
    margin: auto;
}

.slides_container {
    width: 100%;
    height: 100vh;
    z-index: 1000;
    background: #1d1d1d url("~@/assets/common/images/logo_watermark.png") repeat;
    text-align: left;
    .outer_page {
        position: absolute;
        top: -50px;
        right: -50px;
        z-index: 2;
        width: 100px;
        height: 100px;
        border-radius: 50%;
        background-color: rgba(255, 255, 255, 0.5);
        &:hover::before {
            transform: rotate(90deg);
        }
        &::before {
            content: "";
            position: absolute;
            top: 60px;
            left: 22px;
            width: 16px;
            height: 16px;
            background: @perview_sp -45px -1px;
            opacity: 0.2;
            transition: transform 0.3s;
        }
    }
}

.slides_wrapper {
    position: relative;
    width: 100%;
    height: 100%;
    &::after {
        content: "";
        display: inline-block;
        vertical-align: middle;
        width: 0;
        height: 100%;
    }
    .base-logo {
        position: absolute;
        top: 18px;
        left: 49px;
        z-index: 3;
    } 
    .full_screen_out {
        position: absolute;
        top: 0;
        right: 0;
        z-index: 30;
        width: 100%;
        height: 40px;
        line-height: 40px;
        text-align:right;
        font-size: 0;
        opacity: 0;
        transition: opacity 0.2s;
        .wrapper{
            float:right;
            width:auto;
            height:100%;
            padding: 0 10px;
            background-color: rgba(37, 37, 37, 0.8);
            border-radius: 0 0 0 4px;
        }
        &:hover {
            opacity: 1;
        }
        &::after {
            content: "";
            display: inline-block;
            vertical-align: middle;
            width: 0;
            height: 100%;
        }
        .out_full {
            display: inline-block;
            vertical-align: middle;
            width: 20px;
            height: 20px;
            background: @perview_sp -21px -30px;
        }
        .out_page {
            display: inline-block;
            vertical-align: middle;
            margin-left: 10px;
            font-size: 12px;
            color: #c1c1c1;
            &::before {
                content: "";
                display: inline-block;
                vertical-align: middle;
                width: 1px;
                height: 12px;
                background-color: #ffffff;
                opacity: 0.2;
                margin-right: 10px;
            }
            &::after {
                content: "";
                display: inline-block;
                vertical-align: middle;
                width: 0;
                height: 100%;
            }
        }
    }
    .pre_page_area, .next_page_area{
        position: absolute;
        top: 0;
        width: 50%;
        height: 100%;
        opacity: 0;
        z-index: 1;
        cursor: pointer;
    }
    .pre_page_area{
        left: 0;
    }
    .next_page_area{
        right: 0;
    }
    .slides_middle {
        position: relative;
        display: inline-block;
        vertical-align:middle;
        width: 100%;
    }
    .slide_footer{
        position: absolute;
        left:0;
        bottom:0;
        width: 100%;
        height: 45px;
        line-height: 45px;
        padding:0 40px 0 44px; 
        background:#000000cc;
        span {
            font-size:12px;
            color: #fff;
            user-select: none;
        }
        .page_number_panel{
            position: relative;
            display:inline-block;
            vertical-align:top;
            height:100%;
            line-height:45px;
            margin-right: 44px;
            span {
                position:relative;
                cursor: pointer;
                transition:all .3s;
                &:hover{
                    opacity:.8;
                }
                &:after{
                    content:'';
                    position: absolute;
                    top: 50%;
                    right: -16px;
                    margin-top: -1px;
                    width:0;
                    height:0;
                    border: 4px solid #95959c;
                    border-left-color: transparent;
                    border-bottom-color: transparent;
                    border-right-color: transparent;
                    transform: rotate(0);
                    transition: all 0.2s;
                }
                &.show:after{
                    margin-top: -5px;
                    transform: rotate(180deg);
                }
            }
            .page_number_list{
                position: absolute;
                left: -14px;
                bottom: 40px;
                width: 250px;
                height: auto;
                max-height: 270px;
                padding-top: 10px;
                border: 1px solid #f4f4f4;
                border-radius: 4px;
                background: #ffffff;
                box-shadow: 0 0 5px 0 rgba(0, 0, 0, 0.1);
                overflow-x: hidden;
                overflow-y: auto;
                font-size: 0;
                span{
                    position:relative;
                    display:block;
                    height:42px;
                    line-height:42px;
                    padding-left:13px;
                    font-size:12px;
                    color:#666673;
                    text-align:left;
                    cursor:pointer;
                    &:hover{
                        background:#f7f7f7;
                    }
                    &.current{
                        background:#f3fbfe;
                        color:var(--mainColor);
                    }
                }
            }
        }
        .footer_right{
            float:right;
            button{
                display: inline-block;
                vertical-align:middle;
            }
            .pre_btn,.next_btn {
                width: 8px;
                height: 14px;
                opacity:.5;
                background:@display_sp -56px -24px;
                transition:opacity .3s;
                &:hover{
                    opacity:1;
                }
                &.disabled{
                    pointer-events:none;
                    cursor:default;
                    &:hover{
                        opacity:.5;
                    }
                }
            }
            .next_btn{
                transform:rotate(180deg);
                margin:0 48px 0 32px;
            }
            .preview_btn {
                width: 16px;
                height: 16px;
                background:@display_sp 0px -50px;
                &:hover{
                    background-position-x:-26px;
                }
            }
        }
    }
    .work_info_panel{
        position:absolute;
        left:0;
        bottom:0;
        width:100%;
        height:78px;
        line-height:78px; 
        background:#0b0b0b;
        .wrapper{
            min-width:850px;
            height:100%;
            margin:0 auto;
        }
        .title{
            float:left;
            font-size:18px;
            font-weight:bold;
            color:#fff;
            cursor: default;
            .category {
                display: inline-block;
                vertical-align: middle;
                height: 24px;
                line-height: 24px;
                padding: 0 8px;
                margin-left: 11px;
                font-size: 12px;
                color: #ffffff;
                &.currency{
                    background:#7fc2a0;
                }
                &.business{
                    background:#303030
                }
                &.graduation{
                    background:#90a0dc;
                }
                &.government{
                    background:#dd6b6b;
                }
                &.festival{
                    background:#d685d1;
                }
                &.job{
                    background:#eba066;
                }
                &.wedding{
                    background:#e4729b;
                }
                &.propaganda{
                    background:#7ad4dc;
                }
                &.other{
                    background:#b4b0af;
                }
                &.education{
                    background:#7aa9ce;
                }
            }
            &::after{
                content:"";
                display:inline-block;
                vertical-align:middle;
                margin-left:33px;
                width: 1px;
                height: 20px;
                background-color: #3c3c3c;
            }
        }
        .panel_right{
            float:right;
            button{
                display: inline-block;
                vertical-align:middle;
            }
            ._split {
                display: inline-block;
                vertical-align:middle;
                width: 1px;
                height: 20px;
                background-color: #3c3c3c;
            }
            .share_code{
                position:relative;
                width: 18px;
                height: 18px;
                display: inline-block;
                vertical-align:middle;
                .code_btn{
                    vertical-align: top;
                    width: 18px;
                    height: 18px;
                    opacity: 0.6;
                    background:@display_sp -28px -24px;
                    transition:opacity .3s;
                    &:hover{ 
                        opacity: 1;
                    }
                }
                &:hover{ 
                    overflow: visible;
                    .qrcode_container {
                        opacity: 1;
                    }
                }
                .qrcode_container {
                    position: absolute;
                    bottom: 38px;
                    right: -13px;
                    width: 140px;
                    height: 140px;
                    background-color: #ffffff;
                    border-radius: 4px;
                    text-align: center;
                    z-index:100;
                    opacity: 0;
                    transition: opacity 0.3s;
                    &::after{
                        content:"";
                        position:absolute;
                        bottom:-6px;
                        right:16px;
                        width: 0;
                        height: 0;
                        border-top: 6px solid #fff;
                        border-left: 6px solid transparent;
                        border-right: 6px solid transparent;
                    }
                    .qrcode_logo {
                        position: absolute;
                        top: 0;
                        left: 0;
                        bottom: 0;
                        right: 0;
                        z-index: 1;
                        margin: auto;
                    }
                    .qrcode {
                        width: 124px;
                        height: 124px;
                    }
                    p{
                        margin-top: -42px;
                        line-height: 20px;
                        font-size:12px;
                        color:#777777;
                    }
                }
            }
            .collect_btn{
                width: 20px;
                height: 19px;
                margin-left:25px;
                opacity:.5;
                background:@display_sp -52px 0px;
                transition:opacity .3s;
                &:hover{
                    opacity:1;
                }
                &.collected{
                    opacity:1;
                    background-position:-77px 0px;
                }
            }
            .share_btn{
                width: 18px;
                height: 20px;
                margin:0 20px 0 25px;
                opacity:.5;
                background:@display_sp 0px -24px;
                transition:opacity .3s;
                &:hover{
                    opacity:1;
                }
            }
            .use_template_btn {
                width: 70px;
                height: 30px;
                margin-left: 25px;
                border-radius: 4px;
                background-color: var(--mainColor);
                color: #ffffff;
                font-size: 14px;
                &:hover {
                    opacity: 0.8;
                }
            }
            .down_tip{
                display:inline-block;
                vertical-align:middle;
                height:100%;
                margin-left: 25px;
                line-height:78px;
                font-size:14px;
                color:#f1bd1f;
                user-select: none;
            }
        }
    }
}

.work_related_panel{
    min-height:100vh;
    padding-top:22px;
    background:#f4f7fa;
    text-align:left;
    .wrapper{
        position:relative;
        width:75%;
        margin:0 auto;
        transition:transform 0.3s;
    }
    .work_author_panel{
        width:100%;
        height:auto;
        min-height: 138px;
        padding:10px 40px 28px;
        background-color: #ffffff;
        border-radius: 8px;
        text-align:left;
        img{
            display:inline-block;
            vertical-align:middle;
            width: 42px;
            height: 42px;
            margin-right:13px;
            border-radius:50%;
        }
        &>div{
            display:inline-block;
            vertical-align:middle;
            margin-bottom:-5px;
            span{
                display:block;
                height:20px;
                line-height:20px;
            }
            span:first-child{
                color:#2e353c;
                font-size:16px;
            }
            span:last-child{
                opacity:.6;
                color:#717e8b;
                font-size:12px;
            }
        }
        p{
            margin-top:27px;
            font-size:14px;
            color:#777777;
        }
    }
    .related_works_panel{
        margin-top:26px;
        .header{
            width:100%;
            height:54px;
            line-height:54px;
            .title{
                display: inline-block;
                font-size:18px;
                font-weight: bold;
                color:#3c3c3c;
            }
            .more{
                float:right;
                font-size:14px;
                color:#3c3c3c;
            }
        }
        .works_list{
            position: relative;
            display: flex;
            flex-wrap: wrap;
            justify-content: space-between;
            margin: 0 auto;
            padding:0 0 0 20px;
            margin-left:-20px;
            width:calc(100% + 48px);
            height: auto;
            overflow: hidden;
        }
    }
    @media screen and (max-width:1400px){
        .wrapper{
            width:85%;
        }
    }
}

.un_login_tip{
    position:absolute;
    left: 0;
    bottom: 0;
    width: 100%;
    height: 90px;
    line-height: 90px;
    background-color: rgba(0,0,0,0.8);
    font-size: 0;
    color: #ffe981;
    text-align: center;
    z-index: 9;
    span {
        font-size: 16px;
        vertical-align: middle;
    }
    a {
        display: inline-block;
        width: 90px;
        height: 40px;
        line-height: 40px;
        margin-left: 16px;
        border-radius: 4px;
        background-color: var(--mainColor);
        font-size: 16px;
        color: #ffffff;
        vertical-align: middle;
    }
    i {
        position: absolute;
        top: 50%;
        right: 26px;
        width: 20px;
        height: 20px;
        margin-top: -10px;
        background: @perview_sp -48px -30px;
        transition: transform 0.3s;
        opacity: 0.2;
        cursor: pointer;
        &:hover {
            transform: rotate(90deg);
        }
    }
}
</style>