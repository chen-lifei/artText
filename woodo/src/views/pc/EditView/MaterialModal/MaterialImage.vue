<!-- 素材库弹框 -->
<template>
    <div class="image-material">
        <div class="material-header">
            <div class="material-back" @click="back">
                <base-icon class="iconfanhuizhuomian"></base-icon>
                <span>返回桌面</span>
            </div>
            <image-search v-model="keyword" @search="search()" @clear="images_search_back()"></image-search>
        </div>
        <div class="material-body">
            <div class="images_contain_left">
                <div class="material-group">
                    <span class="title">{{title || '素材图片'}}</span>
                    <ul>
                        <li :class="{'current': images_current_menu === item.id}" v-for="item in images_fast_class" :key="item.id" @click="images_menu_checked(item.id)">
                            <div class="icon">
                                <base-icon :class="item.icon || 'iconsucai'"></base-icon>
                            </div>
                            <span>{{item.name}}</span>
                            <base-icon class="iconxiala"></base-icon>
                        </li>
                    </ul>
                </div>
            </div>
            <div class="images_contain_right">
                <!-- 图片库 图片列表，二级分类数据列表  images_data_list -->
                <div class="images_section_content" v-if="!isNaN(images_current_menu) && images_current_menu > 0 && images_current_menu !== ICONS_ID">
                    <div class="scroll_window" ref="images_contain_dom">
                        <ul class="scroll_container" v-show="images_data_list.length > 0 && !search_empty">
                            <li v-for="item in images_data_list" :key="item.id" :data-id="item.id" :data-place="item._place_type" :class="{'gif_tag': item.gif_img, 'svg_tag': item.svg_img, 'skeleton-loading': true}" :style="{'top': `${item._top}px`, 'left': `${item._left}px`, 'width': `${item._width}px`, 'height': `${item._height}px`}" v-show="item._top <= visible_area_max && (item._top + item._height) >= visible_area_min" @mouseenter="static2dynamic($event, item)" @mouseleave="dynamic2static($event, item)">
                                <img @load="img_load_done($event)" v-lazy="item.image" :data-sn="item.sn" @click="images_material_append(item)" alt="图片库素材预览图" v-bdtongji="`PC-统计-站内素材库-${item.categoryFullName ? item.categoryFullName.replace(/,/g,'-') : ''}-应用素材`" />
                                <div class="append_layer" v-show="item.insertion">
                                    <div class="lds-spinner">
                                        <div></div>
                                        <div></div>
                                        <div></div>
                                        <div></div>
                                        <div></div>
                                        <div></div>
                                        <div></div>
                                        <div></div>
                                        <div></div>
                                        <div></div>
                                        <div></div>
                                        <div></div>
                                    </div>
                                </div>
                                <!-- 收藏 -->
                                <div :class="['favorite-btn', {'has-collect': favorite_map[item.id]}]" v-if="!images_is_icon" :title="favorite_map[item.id] ? '取消收藏' : '加入收藏'" @click="common_material_favorite(item.id)">
                                    <base-icon class="iconshoucang"></base-icon>
                                </div>
                                <!-- 放大镜 -->
                                <div class="preview-btn" v-if="images_is_preview" @mouseenter="images_enlarge($event, item)" @mouseleave="images_enlarge_restore">
                                    <base-icon class="iconsousuo"></base-icon>
                                </div>
                            </li>
                        </ul>
                        <div class="search_empty" v-show="search_empty">
                            <div class="search_empty_bykeyword">
                                <img src="../../../../assets/pc/images/edit/empty_bg.png" />
                                <p>抱歉~没有找到你要的素材!</p>
                                <button @click.stop="images_search_back()">返回</button>
                            </div>
                        </div>
                        <!-- 空状态 -->
                        <div class="material_empty" v-show="images_data_list.length === 0 && !loading">
                            <div class="empty_contain">
                                <img src="../../../../assets/pc/images/edit/material_empty_bg.png" alt="" />
                                <span>没有素材哦</span>
                            </div>
                        </div>
                        <!-- 第一页加载效果 -->
                        <div class="first_loading" v-show="images_data_list.length === 0 && loading">
                            <img src="../../../../assets/pc/images/edit/category_loading.gif" alt="数据加载中" />
                        </div>
                        <!-- 滚动加载下一页效果 -->
                        <div class="scroll_loading" v-show="images_data_list.length > 0 && loading">
                            <img src="../../../../assets/pc/images/edit/scroll_loading.gif" alt="数据加载中" />
                        </div>
                        <!-- 无更多效果 -->
                        <div class="no_more" v-show="images_data_list.length > 0 && !loading &&　!search_empty">
                            <i class="edit-ico edit-ico-material_no_more"></i>
                            <p>没有更多了</p>
                        </div>
                        <!-- 加载错误效果 -->
                        <div class="load_error" v-show="loaderror">
                            <img src="../../../../assets/pc/images/common/loaderror.png" alt="加载失败" />
                            <p>哇哦，网络好像不给力，重新加载试试看</p>
                            <a class="reload_btn" @click="images_menu_checked(images_current_menu, true)">重新加载</a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import ImageSearch from '@/views/pc/EditView/MaterialModal/ImageSearch.vue';
import material from '@/assets/pc/js/material.js';
export default {
    props: [],
    components: { ImageSearch },
    data() {
        return {
            cancel_axios: function () { },
            visible_area_max: 0,
            visible_area_min: 0,
            loading: false,
            loaderror: false,
            search_empty: false,
            show_to_top: false,
            /**
                图片类
             */
            IMAGE_ID: 7,                        // 图片分类id
            images_fast_class: [],              // 图片库一级分类
            IMAGES_IMAGE_ID: -1,                // 图片二级菜单 除以下几类外的图片类，固定id = -1
            IMAGES_GIF_ID: 268,                 // 图片二级菜单 gif类 id
            IMAGES_EXPRESSION_ID: 265,          // 图片二级菜单 表情类 id
            IMAGES_ILLUSTRATION_ID: 164,        // 图片二级菜单 插图类 id
            IMAGES_SILHOUETTE_ID: 128,          // 图片二级菜单 剪影类 id
            IMAGES_VECTOR_ID: 502,              // 图片二级菜单 矢量类 id
            IMAGES_TREND_ID: 966,               // 图片二级菜单 动态元素类 id
            images_data_list: [],               // 图片通用数据列表，切换分类时重新赋值
            /**
             * images_operation_state = 图片素材操作的状态，由 images_operation_state_open() 方法调用修改，关闭当前库时初始化
             * 用于标识当前图片插入执行 创建图片元素、修改图片元素链接、修改背景图片链接、全局背景图片链接
             * 可能的值 '' = 创建元素、element_src = 元素、background_src = 背景图、all_background_src = 全局背景图
             */
            images_operation_state: '',
            /**
             * images_my_material_status = 图片素材的所属状态，切换分类时改变值（不控制面板显示，只表示当前面板素材的所属状态，不同的库需单独再次设置）
             * 可能的值：lately(最近使用)、myupload(我的上传)、favorite(我的收藏)
             */
            images_my_material_status: '',
            /**
             * images_current_menu = 图片库当前选中的二级菜单，值 = 任意字符串 || 图片分类id
             * 控制 站内素材列表、素材广场、我的 面板显示
             */
            images_current_menu: null,
            images_menu_referrer: null,         // 图片库当前面板的来源面板，值为上一个 images_current_menu
            images_filter_menu: [],             // 图片二级类别过滤，站内图片 图片分类（IMAGES_IMAGE_ID） 中过滤掉在菜单栏显示的二级分类
            images_current_tags: '',            // 当前选中的标签
            images_show_keyword: '',            // 显示搜索的关键词
            images_search_count: null,          // 搜到的图片数量
            images_is_icon: false,              // 图片是否为图标
            images_is_preview: false,           // 图片是否可以预览
            // 二级菜单 图片分类（IMAGES_IMAGE_ID）
            images_show_back_menu: false,       // 返回上一级菜单按钮
            images_current_categoryname: '',    // 当前分类的名称

            // 图片广场
            images_square_list: [],             // 图片广场列表，图片二级分类前15个
            outside_site: 'unsplash',           // 图片广场搜索 站点
            outside_search_text: '',            // 图片广场搜索 输入框内容
            show_outside_search_slide: false,   // 图片广场搜索 下拉状态

            /**
                图标类
             */
            // 图标分类
            ICONS_ID: 21,                        // 图标库接口id
            icons_group_list: [],                // 图标分类列表
            icons_first_group_list: [],          // 图标一级显示分类列表
            icons_second_group_list: [],         // 图标二级显示分类列表
            icons_data_list: [],                 // 图标库数据列表
            icons_key_word: '',                  // 图标库搜索关键词，搜索成功改变值
            icons_search_value: '',              // 确认进行搜索的关键词
            show_all_icons_group: false,         // 是否展示全部分类弹框
            current_icons_list_id: null,         // 选择加载更多图标的列表的id   
            favorite_map: {},

            keyword:'',                         // 搜索关键词
            title: '',                          // 面板标题

        }
    },
    inject: ['MaterialLibrary'],
    mounted() {
        $(window).on('resize', this.re_adapt);
    },
    watch: {
        images_current_menu(val) {
            material.images_current_menu = val;
        }
    },
    methods: {
        /** ------------ 通用方法 -------------------*/

        init(id) {
            this.images_is_preview = id === this.IMAGE_ID;
            this.images_is_icon = id === this.ICONS_ID;
            material.api.commmon_get_category_by_id({ id }, (data) => {
                this.title = data[0].name;
                this.images_fast_class = data[0].childrenList;
                // 默认选中第一个
                this.images_menu_checked(this.images_fast_class[0].id);
                // 初始化图片数据
                this.images_init(this.IMAGE_ID);
            });
        },
        // 返回
        back() {
            this.images_current_menu = null;
            this.images_fast_class = [];
            this.images_data_list = [];
            this.$emit('back');
        },
        // 关闭弹框
        close_modal() {
            material.images_operation_state = '';
            this.$emit('close_modal');
        },
        // 刷新自适应
        re_adapt() {
            let that = this;
            that.icons_group_slice();
            that.$emit('re_adapt', that.current_open_modal());
        },
        // 面板数据，数据列表、标签列表、滚动dom容器、素材自适应基础尺寸、间距
        current_open_modal() {
            let obj = {};
            let that = this;
            obj = {
                key: 'imagesStore',
                data: that.images_data_list,
                menu: that.images_fast_class,

                base_conf: {
                    el: that.$refs.images_contain_dom,
                    width: 100,
                    height: 9 / 16 * 100,
                    offset: 15,
                    type: 'waterfall',
                },
            }
            if (that.images_is_icon) {
                obj['base_conf'].width = 60;
                obj['base_conf'].height = 60;
                obj['base_conf'].type = 'fixed';
            } else if (!isNaN(that.images_current_menu) && that.images_current_menu > 0) {
                let currentItem = that.images_fast_class.find(item => item.id == that.images_current_menu);
                let show_type = currentItem ? currentItem.showType : 'fixed';
                if (show_type === 'fixed') {
                    obj['base_conf'].width = 100;
                    obj['base_conf'].height = 100;
                    obj['base_conf'].offset = 30;
                    obj['base_conf'].type = 'fixed';
                }
            }
            return obj;
        },
        // 设置 素材 加入收藏 & 取消收藏
        common_material_favorite(id) {
            let that = this;
            material.api.common_material_favorite(id, (state, data) => {
                if (state === 'delete') {
                    that.$set(that.favorite_map, id, false);
                } else {
                    that.$set(that.favorite_map, id, data);
                }
            }
            )
        },
        // 搜索
        search(){
            let is_icon = this.images_is_icon;
            this.images_get_data({
                // 图标则直接搜索全部
                'cid': is_icon ? this.ICONS_ID : this.images_current_menu,
                'tagName': this.keyword || '',
            });
        },
        // 搜索空状态返回
        images_search_back(){
            this.keyword = '';
            this.search();
        },

        /** ------------ 图标类 --------------------*/

        // 获取图标数据列表
        icons_get_data() {
            let that = this;
            let $params = {
                count: 30,
            }
            that.search_empty = false;
            that.loaderror = false;
            that.loading = true;
            material.api.common_get_material({
                params: $params,
                current_modal: that.current_open_modal(),
                url: '/api/material/icon_list/',
                success: (data) => {
                    let data_list = data;
                    that.search_empty = material.states.search_empty;
                    that.loading = false;
                    for (let i in data_list) {
                        data_list[i].show = true;
                        if (data_list[i].list.length < data_list[i].listTotal) {
                            data_list[i].more = true;
                        } else {
                            data_list[i].more = false;
                        }
                    }
                    that.icons_data_list = data_list;
                    let conf = that.current_open_modal().base_conf;
                    conf.el.onscroll = null;
                },
                error: () => {
                    that.loaderror = material.states.loaderror;
                    that.$toast('数据获取失败');
                },
            });
        },
        // 获取图标分类列表
        icons_get_group() {
            let that = this;
            let $params = {
                id: that.ICONS_ID,
            }
            material.api.commmon_get_category_by_id($params, (data) => {
                data = data && data.length > 0 ? data[0].childrenList : [];
                that.icons_group_list = data;
                that.icons_first_group_list = data;
                that.icons_group_slice();
            });
        },
        // 图标分类列表切割
        icons_group_slice() {
            let that = this;
            let list = that.icons_group_list;
            that.icons_first_group_list = list;
            that.$nextTick(function () {
                let $group = $('.group_btn').find('a');
                let top = '';
                let splice_index = 0;
                if ($group.length === 0) return false;
                $group.each(function (index) {
                    if (index !== 0 && top !== $(this).offset().top) {
                        that.icons_first_group_list = list.slice(0, index);
                        that.icons_second_group_list = list.slice(index);
                        return false;
                    } else {
                        top = $(this).offset().top;
                    }
                });
            })
        },
        // 图标搜索方法
        icons_search(clear_keyword) {
            let that = this;
            if (clear_keyword) that.icons_key_word = '';
            let content = that.icons_key_word;
            that.icons_search_value = that.icons_key_word;
            that.images_current_tags = '';
            // 非法字符校验
            if ($validate(content).illegal() || $validate(content).emoji()) {
                return that.$toast('您输入的关键词存在非法字符，请重新输入！');
            }
            if (content.length > 0) {
                let $params = {
                    cid: that.images_current_menu,
                    pageNumber: 1,
                    searchValue: content,
                }
                that.search_empty = false;
                that.loaderror = false;
                that.loading = true;
                material.api.common_get_material({
                    params: $params,
                    current_modal: that.current_open_modal(),
                    success: (data) => {
                        that.loading = false;
                        that.search_empty = material.states.search_empty;
                        that.images_data_list = that.search_empty ? data.recommendList : data.dataList;
                    },
                    error() {
                        that.loaderror = true;
                    }
                })
            } else {
                that.search_empty = false;
                that.images_data_list = [];
            }
        },

        /** ---------------- 图片类 ------------------*/
        // 图片库打开初始化
        images_init(id) {
            let that = this;
            material.api.commmon_get_category(id, (data) => {
                that.loaderror = material.states.loaderror;
                // 网络错误情况下、空列表状态情况下、数据列表0情况下，重新加载
                if (that.loaderror || that.search_empty || that.images_data_list.length === 0) {
                    // 需要过滤的分类id
                    that.images_filter_menu = [
                        that.IMAGES_EXPRESSION_ID, // 图片二级菜单 表情类 id
                        that.IMAGES_ILLUSTRATION_ID, // 图片二级菜单 插图类 id
                    ];
                } else {
                    if (that.images_current_menu !== that.ICONS_ID) that.re_adapt();
                }
            });
            // 延时等待dom动画效果消失，更新可视区域数值
            setTimeout(() => {
                if (that.images_current_menu && that.images_current_menu !== -1) {
                    let limit = material.method.update_visible_area(that.current_open_modal());
                    that.visible_area_min = limit.min;
                    that.visible_area_max = limit.max;
                }
            }, 500)
        },
        // 二级菜单切换，站内素材、素材广场、我的，force_update = 当前id与参数id相等时，是否强制更新，默认false
        images_menu_checked(menu_key, force_update) {
            let that = this;
            if (that.images_current_menu === menu_key && !force_update) {
                return false;
            }
            that.keyword = '';
            that.images_show_keyword = '';
            that.images_searching = false;
            that.images_menu_referrer = that.images_current_menu;
            that.images_current_menu = menu_key;
            // 初始化二级菜单下的操作状态
            that.images_show_back_menu = false;
            that.images_current_categoryname = '';
            that.images_my_material_status = '';
            // 根据不同的二级菜单进行数据初始化
            switch (true) {
                // menu_key = id时，接口获取内容
                case (!isNaN(menu_key) && Number(menu_key) > 0 && menu_key !== that.ICONS_ID):
                    that.images_get_data({
                        'cid': menu_key,
                    });
                    break;
                // 图标素材
                case menu_key === that.ICONS_ID:
                    that.images_data_list = [];
                    that.icons_key_word = '';
                    that.icons_get_group();
                    that.icons_get_data();
                    break;
            }
        },
        // 获取图片素材
        images_get_data(param) {
            let that = this;
            that.$nextTick(() => {
                let conf = that.current_open_modal().base_conf;
                // 计算 pageSize
                let page_size = material.method.compute_page_size({
                    el: conf.el,
                    width: conf.width,
                    height: conf.height,
                });
                // 合并接口参数
                let $params = {
                    'cid': null,
                    'pageNumber': 1,
                    'pageSize': page_size,
                    'tagName': '',
                };
                $params = Object.assign($params, param);
                if (!param['cid']) return false;
                that.search_empty = false;
                that.loading = true;
                that.loaderror = false;
                that.$nextTick(() => {
                    material.api.common_get_material({
                        params: $params,
                        current_modal: that.current_open_modal(),
                        beforeSend: () => {
                            // 更新节点信息
                            conf = that.current_open_modal().base_conf;
                            // 页码 = 1 时，重新从第一页获取，则清除之前的列表
                            if ($params['pageNumber'] === 1) {
                                that.images_data_list = [];
                                $(conf.el).scrollTop(0);
                            }
                            // 当前 id 不是菜单中的分类，显示返回上一级分类按钮
                            let not_menu = that.images_filter_menu.every((item) => item != $params['cid']);
                            that.images_show_back_menu = not_menu;
                            that.search_empty = false;
                            that.loaderror = false;
                            that.loading = true;
                        },
                        success: (data) => {
                            that.search_empty = material.states.search_empty;
                            that.loading = false;
                            that.favorite_map = material.favorite_map;
                            // 当前图片分类名称
                            that.images_current_categoryname = data.categoryName;
                            that.images_search_count = data.total;
                            let data_list = that.images_data_list.concat(data.dataList);
                            if (that.search_empty) {
                                // 更新节点信息
                                conf = that.current_open_modal().base_conf;
                                that.images_data_list = material.method.material_adapt(data.recommendList, {
                                    el: conf.el,
                                    type: conf.type,
                                    width: conf.width,
                                    height: conf.height,
                                });
                            } else {
                                // 计算列表自适应布局
                                that.images_data_list = material.method.material_adapt(data_list, {
                                    el: conf.el,
                                    type: conf.type,
                                    width: conf.width,
                                    height: conf.height,
                                });
                                // 分页信息
                                let pagination = {
                                    pageNumber: data.pageNumber,
                                    pageSize: data.pageSize,
                                    totalPages: data.totalPages,
                                };
                                // 绑定滚动加载方法
                                material.method.common_scroll_load(that.current_open_modal(), pagination, (pagedata) => {
                                    that.show_to_top = material.states.show_to_top;
                                    // 加载下一页
                                    that.images_get_data({
                                        'cid': $params['cid'],
                                        'pageNumber': pagedata.pageNumber,
                                        'pageSize': pagedata.pageSize,
                                        'tagName': $params['tagName'],
                                    });
                                }, (limit) => {
                                    that.visible_area_min = limit.min;
                                    that.visible_area_max = limit.max;
                                });
                            }
                        },
                        error: () => {
                            that.loaderror = true;
                            that.$toast('数据获取失败');
                            if ($params['pageNumber'] === 1) {
                                that.images_data_list = [];
                            }
                        },
                    });
                })
            });
        },
        /** ------------------ 图片广场---------------*/

        // 图片相关操作-------------------------------------------
        // 图片素材插入
        images_material_append(item) {
            let that = this;
            if (!item) return false;
            if(that.images_is_icon){
                that.icons_material_append(item);
                return false;
            }
            let lately_origin = item.type;
            let my_material_status = that.images_my_material_status;
            let material_status = my_material_status;
            // 我的图片-最近使用 图片来源类型处理
            if (lately_origin === 'myUpload') {
                material_status = 'myupload';
            }
            material.api.common_material_append(item, material_status, (data) => {
                // 最近使用列表的图片插入后调整顺序
                if (my_material_status === 'lately') {
                    let item_index = that.images_data_list.findIndex(f_item => f_item.id === item.id);
                    that.images_data_list.splice(item_index, 1);
                    that.images_data_list.unshift(item);
                    that.re_adapt();
                }
                try {
                    // 在替换图片操作下插入站内图片
                    switch (material.images_operation_state) {
                        // 替换图片
                        case 'element_src':
                            that.MaterialLibrary.images_change_element_src(data.html);
                            break;
                        // 修改背景图链接
                        case 'background_src':
                            that.MaterialLibrary.images_change_background_src(data.largeImage || data.image);
                            break;
                        // 插入图片元素
                        default:
                            material.images_operation_state = '';
                            let append_type = 'img';
                            that.MaterialLibrary.common_material_type_append({
                                type: append_type,
                                html: data.html,
                            });
                            break;
                    }
                } catch (error) {
                    console.error(error);
                    that.$toast('插入素材失败！');
                }
                that.close_modal();
            });
        },
        // 图标库素材插入
        icons_material_append(item) {
            let that = this;
            material.api.common_material_append(item, null, (data) => {
                that.MaterialLibrary.common_material_type_append({
                    type: 'shape',
                    html: data.html,
                });
                that.close_modal();
            });
        },
        // 图片放大预览
        images_enlarge(event, item) {
            material.method.images_enlarge(event, item);
        },
        // 关闭放大预览
        images_enlarge_restore() {
            material.method.images_enlarge_restore();
        },
        // 图片加载完毕
        img_load_done(event) {
            // 图片库png图片加载完毕后清除背景图，防止背景图溢出
            if (event.target.getAttribute('lazy') === 'loaded') {
                $(event.target).parents('li').css({ 'background-color': '#ffffff', 'background-image': `none` });
            }
        },
        // 图片静转动
        static2dynamic(event, item) {
            material.method.static2dynamic(event, item);
        },
        // 图片动转静
        dynamic2static(event, item) {
            material.method.dynamic2static(event, item);
        },
    },
    destroyed() {
        $(window).off('resize', this.re_adapt);
    }
}
</script>

<style lang="less" scoped>
.image-material {
    width: calc(5 / 12 * 100vw);
    height: calc(55 / 192 * 100vw);
    min-width: 800px;
    min-height: 550px;
    background: #ffffff;
    border: 1px solid #eeeeee;
    border-radius: 11px;
    box-shadow: 0px 2px 50px 0px rgba(180, 187, 199, 0.4);
    .material-header {
        display: flex;
        align-items: center;
        width: 100%;
        height: 50px;
        .material-back {
            width: 194px;
            padding-left: 20px;
            display: flex;
            align-items: center;
            color: #666666;
            cursor: pointer;
            &:hover {
                color: #333333;
            }
            span {
                margin-left: 10px;
                font-size: 12px;
                font-weight: 400;
            }
        }
    }
    .material-body {
        display: flex;
        width: 100%;
        height: calc(100% - 50px);
        border-top: 1px solid #eeeeee;
        box-sizing: border-box;

        .images_contain_left {
            width: 194px;
            height: 100%;
            border-right: 1px solid #eeeeee;
            overflow: auto;

            .material-group {
                padding-top: 20px;
                width: 100%;
                .title {
                    margin-left: 20px;
                    font-size: 12px;
                    font-weight: 300;
                    color: #aaaaaa;
                }
                ul {
                    padding-top: 5px;
                    width: 100%;
                    li {
                        margin: 1px auto;
                        display: flex;
                        align-items: center;
                        width: 176px;
                        height: 38px;
                        border-radius: 5px;
                        cursor: pointer;

                        &:hover {
                            background: #fafafa;
                        }

                        &.current {
                            background: var(--mainColor);
                            .icon{
                                background: #227bff;
                            }
                            span {
                                color: #ffffff;
                            }
                            > .base-icon {
                                color: #ffffff;
                            }
                        }

                        .icon {
                            margin: 0 11px;
                            width: 24px;
                            height: 24px;
                            line-height: 24px;
                            text-align: center;
                            border-radius: 5px;
                            color: #ffffff;
                            background: #0067ff;
                            > .base-icon {
                                font-size: 12px;
                            }
                        }

                        span {
                            font-size: 12px;
                            font-weight: 400;
                            color: #111111;
                        }

                        > .base-icon {
                            margin-left: auto;
                            margin-right: 10px;
                            font-size: 12px;
                            color: #999999;
                        }
                    }
                }
            }
        }
        .images_contain_right {
            flex: 1;
            .images_section_content{
                width: 100%;
                height: 100%;
                .scroll_window{
                    padding: 20px 20px 20px 30px;
                    .scroll_container {
                        & > li[data-place='fixed'] {
                            padding: 10px;
                        }
                        & > li.gif_tag::after {
                            content: 'GIF';
                            position: absolute;
                            bottom: 8px;
                            left: 8px;
                            width: 36px;
                            height: 22px;
                            line-height: 20px;
                            border: 1px solid #a8b1ba;
                            border-radius: 22px;
                            font-size: 12px;
                            color: #a8b1ba;
                            text-align: center;
                        }
                        & > li.svg_tag::after {
                            content: 'SVG';
                            position: absolute;
                            bottom: 8px;
                            left: 8px;
                            width: 36px;
                            height: 22px;
                            line-height: 20px;
                            border: 1px solid #a8b1ba;
                            border-radius: 22px;
                            font-size: 12px;
                            color: #a8b1ba;
                            text-align: center;
                        }

                        > li {
                            .favorite-btn,
                            .preview-btn{
                                display: none;
                                position: absolute;
                                top: 5px;
                                width: 20px;
                                height: 20px;
                                text-align: center;
                                line-height: 20px;
                                background: rgba(0, 0, 0, 0.5);
                                color: #ffffff;
                                border-radius: 5px;
                                &:hover{
                                    background: rgba(0, 0, 0, 0.8);
                                }
                            }
                            .favorite-btn {
                                right: 5px;
                                &.has-collect {
                                    color: #f7b500;
                                }
                            }
                            .preview-btn{
                                right: 30px;
                            }
                            &:hover {
                                .favorite-btn,
                                .preview-btn{
                                    display: block;
                                }
                            }
                        }
                    }
                    .search_empty {
                        .search_empty_bykeyword {
                            height: 300px;
                            width: 205px;
                            margin: 116px auto 50px;
                            background: transparent;
                            text-align: center;
                            font-size: 14px;
                            img {
                                width: 189px;
                                height: 205px;
                            }
                            p {
                                line-height: 20px;
                                margin-bottom: 18px;
                                color: #7e8696;
                            }
                            button {
                                width: 50px;
                                height: 50px;
                                color: #414858;
                                &:hover {
                                    color: var(--mainColor);
                                }
                            }
                        }
                    }
                }
            }
        }
    }
}
</style>