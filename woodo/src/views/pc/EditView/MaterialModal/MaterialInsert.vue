<template>
    <!-- 插入弹窗 -->
    <div class="material-insert">
        <!-- 一级 -->
        <div class="insesrt-first" v-show="!insert_type">
            <div class="insert-left">
                <div class="material-group">
                    <span class="title">素材资源</span>
                    <ul>
                        <li @click="eleMenuChecked()" :class="{current: right_type === 'element'}">
                            <div class="icon">
                                <base-icon class="iconchangyongyuansu"></base-icon>
                            </div>
                            <span>元素</span>
                            <base-icon class="iconxiala"></base-icon>
                        </li>
                        <li @click="imgMenuChecked(IMAGE_ID)">
                            <div class="icon">
                                <base-icon class="icontupian1"></base-icon>
                            </div>
                            <span>图片</span>
                            <base-icon class="iconxiala"></base-icon>
                        </li>
                        <li v-for="item in images_fast_class" :key="item.id" @click="imgMenuChecked(item.id)" :class="{current: right_type === 'img' && images_current_menu === item.id}">
                            <div class="icon">
                                <base-icon :class="item.icon || 'iconsucai'"></base-icon>
                            </div>
                            <span>{{item.name}}</span>
                            <base-icon class="iconxiala"></base-icon>
                        </li>
                        <li @click="imgMenuChecked(ICONS_ID)">
                            <div class="icon">
                                <base-icon class="icontubiao1"></base-icon>
                            </div>
                            <span>图标</span>
                            <base-icon class="iconxiala"></base-icon>
                        </li>
                    </ul>
                </div>
                <div class="media-group">
                    <span class="title">多媒体</span>
                    <ul>
                        <li @click="mediaChecked()">
                            <div class="icon">
                                <base-icon class="iconmeitiku"></base-icon>
                            </div>
                            <span>媒体库</span>
                            <base-icon class="iconxiala"></base-icon>
                        </li>
                    </ul>
                </div>
                <div class="my-group">
                    <span class="title">我的</span>
                    <ul>
                        <li @click="mySpaceChecked()">
                            <div class="icon">
                                <base-icon class="iconwodekongjian"></base-icon>
                            </div>
                            <span>我的空间</span>
                            <base-icon class="iconxiala"></base-icon>
                        </li>
                    </ul>
                </div>
                <div class="resource-group">
                    <span class="title">资源广场</span>
                    <ul>
                        <li @click="resourceChecked()">
                            <div class="icon">
                                <base-icon class="icongengduoziyuan"></base-icon>
                            </div>
                            <span>更多资源</span>
                            <base-icon class="iconxiala"></base-icon>
                        </li>
                    </ul>
                </div>
                <local-upload-button @uploadOver="closeModal()"></local-upload-button>
            </div>
            <div class="insert-right">
                <!-- 常用元素 -->
                <div class="common-element" v-if="right_type === 'element'">
                    <div class="element-panel">
                        <div class="element-group">
                            <div class="title">线条</div>
                            <div class="element-content">
                                <div class="element-item" v-for="item in line_element_list" :key="item.id" @click="set_draw_line(item)" :data_id="item.id">
                                    <base-icon :class="item.icon || 'iconcharu'"></base-icon>
                                </div>
                            </div>
                        </div>
                        <div class="element-group">
                            <div class="title">矩形</div>
                            <div class="element-content">
                                <div class="element-item" v-for="item in shape_recommend_list.rectangle" :key="item.id" @click="set_draw_shape(item)" :data_id="item.id">
                                    <base-icon :class="item.icon || 'iconcharu'"></base-icon>
                                </div>
                            </div>
                        </div>
                        <div class="element-group">
                            <div class="title">基本形状</div>
                            <div class="element-content">
                                <div class="element-item" v-for="(item, index) in shape_recommend_list.basic" :key="item.id" v-show="show_all_basic || index <= 15" @click="set_draw_shape(item)" :data_id="item.id">
                                    <base-icon :class="item.icon || 'iconcharu'"></base-icon>
                                </div>
                                <div class="element-item more-btn" @click="show_all_basic = !show_all_basic">
                                    <span v-if="show_all_basic">收起</span>
                                    <base-icon class="icongengduoanniu" v-else></base-icon>
                                </div>
                            </div>
                        </div>
                        <div class="element-group">
                            <div class="title">箭头</div>
                            <div class="element-content">
                                <div class="element-item" v-for="(item, index) in shape_recommend_list.arrow" :key="item.id" v-show="show_all_arrow || index <= 15" @click="set_draw_shape(item)" :data_id="item.id">
                                    <base-icon :class="item.icon || 'iconcharu'"></base-icon>
                                </div>
                                <div class="element-item more-btn" @click="show_all_arrow = !show_all_arrow">
                                    <span v-if="show_all_arrow">收起</span>
                                    <base-icon class="icongengduoanniu" v-else></base-icon>
                                </div>
                            </div>
                        </div>
                        <div class="element-group">
                            <div class="title">其它</div>
                            <div class="element-content">
                                <div class="element-item" v-for="(item, index) in shape_recommend_list.other" :key="item.id" v-show="show_all_other || index <= 15" @click="set_draw_shape(item)" :data_id="item.id">
                                    <base-icon :class="item.icon || 'iconcharu'"></base-icon>
                                </div>
                                <div class="element-item more-btn" @click="show_all_other = !show_all_other">
                                    <span v-if="show_all_other">收起</span>
                                    <base-icon class="icongengduoanniu" v-else></base-icon>
                                </div>
                            </div>
                        </div>
                        <div class="element-group">
                            <div class="title">形状</div>
                            <div class="element-content">
                                <div class="element-item shape-other" v-for="(item, index) in shape_other_list" :key="item.id" v-show="show_all_shape || index <= 15" @click="insert_material(item.id)" :data_id="item.id">
                                    <img :src="item.image" :alt="item.name">
                                </div>
                                <div class="element-item more-btn" @click="show_all_shape = !show_all_shape">
                                    <span v-if="show_all_shape">收起</span>
                                    <base-icon class="icongengduoanniu" v-else></base-icon>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <!-- 素材元素 -->
                <div class="img-element" v-else-if="right_type === 'img'">
                    <div class="element-header">
                        <image-search v-model="keyword" @search="search()" @clear="images_search_back()"></image-search>
                    </div>
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
                                <div :class="['favorite-btn', {'has-collect': favorite_map[item.id]}]" :title="favorite_map[item.id] ? '取消收藏' : '加入收藏'" @click="common_material_favorite(item.id)">
                                    <base-icon class="iconshoucang"></base-icon>
                                </div>
                            </li>
                        </ul>
                        <!-- 搜索空状态 -->
                        <div class="search_empty" v-show="search_empty">
                            <div class="search_empty_bykeyword">
                                <img src="../../../../assets/pc/images/edit/empty_bg.png" />
                                <p>抱歉~没有找到你要的素材!</p>
                                <button @click.stop="images_search_back()">返回</button>
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
                        <div class="no_more" v-show="images_data_list.length > 0 && !loading && !search_empty">
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

        <!-- 素材资源二级 -->
        <material-image ref="material_image" v-show="insert_type === 'img'" @back="back()" @re_adapt="reAdapt" @close_modal="closeModal"></material-image>
        <!-- 我的空间 -->
        <material-my-space ref="material_my_space" v-show="insert_type === 'my_space'" @back="back()" @re_adapt="reAdapt" @close_modal="closeModal"></material-my-space>
        <!-- 媒体库 -->
        <material-media ref="material_media" v-show="insert_type === 'media'" @back="back()" @close_modal="closeModal"></material-media>
        <!-- 更多资源 -->
        <material-resource ref="material_resource" v-show="insert_type === 'resource'" @back="back()" @re_adapt="reAdapt" @close_modal="closeModal"></material-resource>
    </div>
</template>

<script>
import material from '@/assets/pc/js/material.js';
import LocalUploadButton from '@/views/pc/EditView/MaterialModal/LocalUploadButton.vue';
import ImageSearch from '@/views/pc/EditView/MaterialModal/ImageSearch.vue';
import MaterialImage from '@/views/pc/EditView/MaterialModal/MaterialImage.vue';
import MaterialMySpace from '@/views/pc/EditView/MaterialModal/MaterialMySpace.vue';
import MaterialMedia from '@/views/pc/EditView/MaterialModal/MaterialMedia.vue';
import MaterialResource from '@/views/pc/EditView/MaterialModal/MaterialResource.vue';
import { line_element_list } from '@/assets/pc/js/opt/line_edit_opt.js';
import { edit_shape_json } from '@/assets/pc/js/opt/shape_edit_opt.js';
import opt_factory from '@/assets/pc/js/opt/opt_factory.js';

export default {
    components: {
        LocalUploadButton,
        ImageSearch,
        MaterialImage,
        MaterialMySpace,
        MaterialMedia,
        MaterialResource
    },
    inject: ['MaterialLibrary', 'EditView'],
    data() {
        // 常量 不加入响应式
        const _data = {
            IMAGE_ID: 7,                        // 图片库 id
            IMAGES_GIF_ID: 268,                 // 图片二级菜单 gif类 id
            IMAGES_EXPRESSION_ID: 265,          // 图片二级菜单 表情类 id
            IMAGES_ILLUSTRATION_ID: 164,        // 图片二级菜单 插图类 id
            IMAGES_SILHOUETTE_ID: 128,          // 图片二级菜单 剪影类 id
            IMAGES_VECTOR_ID: 502,              // 图片二级菜单 矢量类 id
            IMAGES_TREND_ID: 966,               // 图片二级菜单 动态元素类 id                        
            ICONS_ID: 21,                       // 图标库接口id
        }
        for (let k in _data) this[k] = _data[k];

        // 点击后不进入子级分类列表的菜单
        this.not_in_second = [
            this.IMAGE_ID,                        // 图片库 id
            this.ICONS_ID,                         // 图标库接口id
            this.IMAGES_ILLUSTRATION_ID           // 图片二级菜单 插图类 id
        ];

        /* 响应式数据 */
        return {
            // 右侧的类型 img => 素材图片 element => 常用元素  my_space => 我的空间  media => 媒体库
            right_type: 'element',
            // 打开的子级组件类型
            insert_type: null,

            // 常用元素数据
            line_element_list, /** 线条内置样式列表 */
            shape_recommend_list: {}, // 绘制元素数据对象
            shape_other_list: [], // 插入元素数据 => 形状
            show_all_shape: false, // 是否展示所有形状
            show_all_basic: false, // 是否展示所有基本形状
            show_all_arrow: false, // 是否展示所有箭头
            show_all_other: false, // 是否展示所有其它


            /* 素材资源 数据 */
            images_fast_class: [], // 图片库-分类的快捷入口列表
            images_current_menu: null, // 选中的id
            images_data_list: [], // 图片数据
            keyword: '', // 搜索关键词

            // 存储变量  状态   ...
            throttle_timer: null, // 节流定时器
            visible_area_max: 0,
            visible_area_min: 0,
            loading: false,
            loaderror: false,
            search_empty: false,
            show_to_top: false,
            favorite_map: {}
        }
    },
    created() {
        this.getDrawElement();
    },
    mounted() {
        this.init();
        // 获取常用元素 - 形状
        this.getInsertShape();
    },
    methods: {
        init() {
            // 获取素材资源列表
            material.api.commmon_get_category(this.IMAGE_ID, (data) => {
                this.images_fast_class = material.images_fast_class;
            });
        },
        back() {
            this.eleMenuChecked();
        },
        // 关闭整个模态框
        closeModal() {
            this.$emit('close_modal');
        },
        // 常用元素切换
        eleMenuChecked() {
            this.insert_type = null;
            this.right_type = 'element';
            this.images_current_menu = null;
        },
        // 素材菜单切换
        imgMenuChecked(id) {
            this.keyword = '';
            if (this.not_in_second.indexOf(id) !== -1) {
                this.insert_type = 'img';
                this.$refs['material_image'].init(id);
                return;
            };
            this.right_type = 'img';
            this.images_current_menu = id;
            this.images_get_data({ cid: id });
        },
        // 我的空间切换
        mySpaceChecked() {
            this.insert_type = 'my_space';
            this.images_current_menu = null;
            this.$refs['material_my_space'].collect_open_init();
        },
        // 媒体库切换
        mediaChecked(type, opt) {
            this.insert_type = 'media';
            this.$refs['material_media'].open_media_panel(type || 'video', opt);
        },
        // 资源切换
        resourceChecked() {
            this.insert_type = 'resource';
            this.$refs['material_resource'].imagesMenuChecked('Unsplash');
        },
        /* 常用元素 */
        // 获取绘制元素数据
        getDrawElement() {
            let that = this;
            // 整理内置形状列表
            let resource_recommend_shape = edit_shape_json || {};
            let shape_recommend_list = {};
            for (let item in resource_recommend_shape) {
                let material = resource_recommend_shape[item].material;
                let shape = resource_recommend_shape[item].shape;
                // 类型分类，有则直接push
                if (shape_recommend_list[material]) {
                    shape_recommend_list[material].push(shape);
                } else {
                    let material_arr = [];
                    material_arr.push(shape);
                    shape_recommend_list[material] = material_arr;
                }
            }
            that.shape_recommend_list = shape_recommend_list;
        },
        // 获取插入形状数据
        getInsertShape() {
            this.$axios.get('/api/material/list/', { params: { cid: 22, pageSize: 100 } }).then((res) => {
                let { code, data } = res.data;
                if (code !== '2') return;
                this.shape_other_list = data.dataList;
            });
        },
        // 插入线条
        set_draw_line(item) {
            let that = this;
            let option = opt_factory.init_opt('line');
            option.using_data = {
                border_c: that.EditView.document_info.shapeColor ? that.EditView.document_info.shapeColor : '#000000',
                border_s: item.border_s,
                path_l: item.path_l,
                path_r: item.path_r,
                line_class: item.line_class,
            }
            that.EditView.page_state = 'create_line';
            that.closeModal()
        },
        // 设置形状绘制参数
        set_draw_shape(item) {
            // 错误状态判断
            if (!item || item.type !== 'shape' || !item.d) return false;
            let that = this,
                option = opt_factory.init_opt('shape'),
                data = option.fn.clone_object(option.using_data);
            data.d = typeof item.d === 'string' ? [item.d] : item.d;
            data.width = item.width;
            data.height = item.height;
            data.shape_editor = item.shape_editor;
            data.border_w = item.border_w;
            data.border_c = item.border_c;
            data.border_s = item.border_c;
            data.background = item.background;
            option.using_data = data;
            that.EditView.page_state = 'create_shape';
            // 清空工具面板状态
            // that.clear_tool_status();
            that.closeModal()
        },
        /* 常用元素 end */

        /* 图片方法 */
        // 插入素材
        insert_material(id) {
            let that = this;
            if (!id) {
                return that.$toast("插入失败", 1000);
            }
            // 未保存文档时插入模板
            if (that.EditView.modal_id || that.EditView.document_info.id === '' || that.EditView.page_info.uuid == null) {
                that.EditView.show_save_tips = true;
                return;
            }
            that.$axios.get('/api/material/detail/', { params: { mid: id } }).then(function (data) {
                let code = data.data.code,
                    message = data.data.content,
                    html = data.data.data.html,
                    type = data.data.data.type,
                    image = data.data.data.image;
                if (code === "2") {
                    that.EditView.ele_cancel_checked();
                    if (type === 'svg') {
                        let params = JSON.parse(html);
                        if (params.length === 1) {
                            let param = params[0];
                            let ratio = Number(param.height) / Number(param.width);
                            param.width = 112;
                            param.height = param.width * ratio;
                        }
                        that.EditView.element_preinsert_ready(params);
                    }
                    that.closeModal();
                } else {
                    console.error(message);
                    that.$toast("插入失败", 1000);
                }
            }).catch(function (info) {
                console.error(info);
                that.$toast("插入失败", 1000);
            });
        },
        // 搜索
        search() {
            this.images_get_data({
                'cid': this.images_current_menu,
                'tagName': this.keyword || '',
            });
        },
        // 搜索空状态返回
        images_search_back() {
            this.keyword = '';
            this.search();
        },
        // 面板数据，数据列表、标签列表、滚动dom容器、素材自适应基础尺寸、间距
        current_open_modal() {
            let obj = {};
            let that = this;
            obj = {
                key: 'imagesStore',
                data: that.images_data_list,
                base_conf: {
                    el: that.$refs.images_contain_dom,
                    width: 100,
                    height: 100,
                    offset: 30,
                    type: 'fixed',
                },
            }
            return obj;
        },
        // 获取图片素材
        images_get_data(param) {
            let that = this;
            if (that.right_type === 'element') return;
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

                            that.search_empty = false;
                            that.loaderror = false;
                            that.loading = true;
                        },
                        success: (data) => {
                            that.search_empty = material.states.search_empty;
                            that.loading = false;
                            that.favorite_map = material.favorite_map;
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
        // 刷新自适应
        reAdapt(current_modal) {
            let that = this;
            if (!current_modal.key) return false;
            clearTimeout(that.throttle_timer);
            that.throttle_timer = setTimeout(() => {
                let data = current_modal.data;
                let conf = current_modal.base_conf;
                if (!conf.el || data.length === 0) return false;
                data = material.method.material_adapt(data, conf);
            }, 1000 / 30);
        },
        // 图片加载完毕
        img_load_done(event) {
            // 图片库png图片加载完毕后清除背景图，防止背景图溢出
            if (event.target.getAttribute('lazy') === 'loaded') {
                $(event.target).parents('li').css({ 'background-color': '#ffffff', 'background-image': `none` });
            }
        },
        // 图片素材插入
        images_material_append(item) {
            let that = this;
            if (!item) return false;
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
                that.closeModal();
            });
        },
        // 图片静转动
        static2dynamic(event, item) {
            material.method.static2dynamic(event, item);
        },
        // 图片动转静
        dynamic2static(event, item) {
            material.method.dynamic2static(event, item);
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
        /* 图片方法end */

        // 本地上传
        localUpload(e){
            let files = e.target.files;
            let type = files[0].type;
            // image  上传图片
            if(type.indexOf('image') !== -1){
                this.MaterialLibrary.images_upload(e);
                return;
            }

            // video/mp4 上传视频
            if(type.indexOf('video') !== -1){
                this.mediaChecked('video');
                this.$refs['material_media'].input_upload_video(e);
                return;
            }

            // audio/mpeg 上传音频
            if(type.indexOf('audio') !== -1){
                this.mediaChecked('audio');
                this.$refs['material_media'].input_upload_audio(e);
                return;
            }
        }
    }
}
</script>

<style lang="less" scoped>
.material-insert {
    width: calc(5 / 12 * 100vw);
    height: calc(55 / 192 * 100vw);
    min-width: 800px;
    min-height: 550px;
    background: #ffffff;
    border: 1px solid #eeeeee;
    border-radius: 11px;
    box-shadow: 0px 2px 50px 0px rgba(180, 187, 199, 0.4);
    overflow: hidden;

    // 一级
    .insesrt-first {
        display: flex;
        width: 100%;
        height: 100%;
        .insert-left {
            width: 194px;
            height: 100%;
            border-right: 1px solid #eeeeee;
            overflow: auto;

            .material-group,
            .media-group,
            .my-group,
            .resource-group {
                padding-top: 15px;
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

            .material-group .icon {
                background: #0067ff;
            }
            .media-group .icon {
                background: #0699ff;
            }
            .my-group .icon {
                background: #0ebbff;
            }
            .resource-group .icon {
                background: #4ad9f2;
            }

            .local-upload-button {
                margin: 25px auto;
            }
        }
        .insert-right {
            flex: 1;

            .common-element {
                width: 100%;
                height: 100%;
                .element-panel {
                    padding-bottom: 20px;
                    display: flex;
                    flex-direction: column;
                    height: 100%;
                    overflow: auto;
                    .element-group {
                        margin-top: 30px;
                        padding: 0 20px 0 30px;
                        .title {
                            font-size: 12px;
                            color: #666666;
                        }
                        .element-content {
                            display: flex;
                            flex-wrap: wrap;
                            .element-item {
                                margin-top: 10px;
                                margin-right: 10px;
                                display: flex;
                                justify-content: center;
                                align-items: center;
                                width: 50px;
                                height: 50px;
                                background: #fafafa;
                                border-radius: 5px;
                                box-shadow: 0px 2px 4px 0px
                                    rgba(27, 102, 247, 0.02);
                                cursor: pointer;
                                &:hover {
                                    background: #f4f4f4;
                                }
                                .base-icon {
                                    font-size: 24px;
                                }
                                img {
                                    display: block;
                                    width: 50%;
                                    height: auto;
                                }
                                // 形状
                                &.shape-other{
                                    img{
                                        filter: contrast(0.25);
                                    }
                                }

                                &.more-btn .base-icon{
                                    transform: scale(.6);
                                }
                            }
                        }
                    }
                }
            }
            .img-element {
                width: 100%;
                height: 100%;
                .element-header {
                    padding-left: 20px;
                    display: flex;
                    align-items: center;
                    width: 100%;
                    height: 50px;
                    border-bottom: 1px solid #eeeeee;
                }
                .scroll_window {
                    padding: 20px 10px 20px 25px;
                    height: calc(100% - 50px);
                    .scroll_container {
                        li {
                            padding: 10px;
                            .favorite-btn {
                                display: none;
                                position: absolute;
                                top: 5px;
                                right: 5px;
                                width: 20px;
                                height: 20px;
                                text-align: center;
                                line-height: 20px;
                                background: rgba(0, 0, 0, 0.5);
                                color: #ffffff;
                                border-radius: 5px;
                                &.has-collect {
                                    color: #f7b500;
                                }
                            }
                            &:hover {
                                .favorite-btn {
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
                        .scroll_window {
                            height: calc(100% - 520px);
                        }
                    }
                }
            }
        }
    }
}
</style>