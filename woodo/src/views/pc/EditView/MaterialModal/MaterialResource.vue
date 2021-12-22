<template>
    <div class="resource-material">
        <div class="material-header">
            <div class="material-back" @click="back">
                <base-icon class="iconfanhuizhuomian"></base-icon>
                <span>返回桌面</span>
            </div>
            <image-search v-model="outside_search_text" @search="search()" @clear="search_back"></image-search>
        </div>
        <div class="material-body">
            <div class="resource-contain-left">
                <div class="material-group">
                    <span class="title">更多资源</span>
                    <ul>
                        <li :class="{'current': images_current_menu === item.name}" v-for="item in left_class_list" :key="item.id" @click="imagesMenuChecked(item.name)">
                            <div class="icon">
                                <base-icon :class="item.icon"></base-icon>
                            </div>
                            <span>{{item.name}}</span>
                            <base-icon class="iconxiala"></base-icon>
                        </li>
                    </ul>
                </div>
            </div>
            <div class="resource-contain-right">
                <!-- 图片库 图片列表，二级分类数据列表  images_data_list -->
                <div class="resource-section-content">
                    <div class="scroll_window" ref="images_contain_dom">
                        <ul class="scroll_container" v-show="images_data_list.length > 0">
                            <li v-for="item in images_data_list" :key="item.id" :data-id="item.id" :data-place="item._place_type" :class="{'gif_tag': item.gif_img}" :style="{'top': `${item._top}px`, 'left': `${item._left}px`, 'width': `${item._width}px`, 'height': `${item._height}px`}" v-show="item._top <= visible_area_max && (item._top + item._height) >= visible_area_min" @mouseleave="outside_panel_info_hide($event, item)">
                                <img v-if="item.image" v-lazy="item.image" @click="outside_material_append(item)" :data-id="item.id" :data-sn="item.sn" alt="图片库站外素材" />
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
                                <div class="outside_info_btn" title="查看图片来源信息" :class="{'checked': item.show_info}" @click="outside_panel_info_toggle(item)">
                                    <i class="edit-ico edit-ico-more"></i>
                                </div>
                                <transition name="modal-fade">
                                    <!-- item._left > 0 最左边图片的 outside_info_panel 不超出滚动容器 -->
                                    <div class="outside_info_panel" v-show="item.show_info" :class="item._left > 0 ? 'to_right' : 'to_left'">
                                        <div class="outside_info_panel_head">
                                            <h2>{{item.title}}</h2>
                                            <p>{{`由来自 ${images_current_menu} 的 ${item.from} 创建`}}</p>
                                        </div>
                                        <div class="outside_info_panel_body" v-if="item.tags && item.tags.length > 0">
                                            <p class="keys_list">
                                                <strong>关键词：</strong>
                                                <span v-for="tag in item.tags" :key="tag">{{tag}}</span>
                                            </p>
                                            <a class="toggle_all_list">显示所有条目</a>
                                        </div>
                                    </div>
                                </transition>
                            </li>
                        </ul>
                        <!-- 第一页加载效果 -->
                        <div class="first_loading" v-show="images_data_list.length === 0 && loading">
                            <img src="../../../../assets/pc/images/edit/category_loading.gif" alt="数据加载中" />
                        </div>
                        <!-- 滚动加载下一页效果 -->
                        <div class="scroll_loading" v-show="images_data_list.length > 0 && loading">
                            <img src="../../../../assets/pc/images/edit/scroll_loading.gif" alt="数据加载中" />
                        </div>
                        <!-- 无更多效果 -->
                        <div class="no_more" v-show="images_data_list.length > 0 && !loading">
                            <i class="edit-ico edit-ico-material_no_more"></i>
                            <p>没有更多了</p>
                        </div>
                        <!-- 加载错误效果 -->
                        <div class="load_error" v-show="loaderror">
                            <img src="../../../../assets/pc/images/common/loaderror.png" alt="加载失败" />
                            <p>哇哦，网络好像不给力，重新加载试试看</p>
                            <a class="reload_btn" @click="imagesMenuChecked(images_current_menu, true)">重新加载</a>
                        </div>
                        <div class="material_empty" v-show="search_empty">
                            <div class="empty_contain">
                                <img src="../../../../assets/pc/images/edit/material_empty_bg.png" alt="" />
                                <span>没有素材哦</span>
                            </div>
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
import outside_material from '@/assets/pc/js/outside_material.js';
import axios from 'axios';

export default {
    inject: ['MaterialLibrary', 'EditView'],
    components: { ImageSearch },
    data() {
        this.left_class_list = [
            {
                id: 1,
                name: 'Unsplash',
                icon: 'iconunsplash'
            },
            {
                id: 2,
                name: 'Pexels',
                icon: 'iconpexels'
            },
            {
                id: 3,
                name: 'Giphy',
                icon: 'icongiphy'
            }
        ];
        return {
            /* 状态 */
            loading: false, // 是否在加载中
            loaderror: false, // 加载错误
            search_empty: false, // 搜索空状态
            /* 状态end */

            cancel_axios: null,

            images_current_menu: '',
            images_data_list: [],
            outside_search_text: '',                        // 搜索关键词

            // 站外素材库 unsplash || pexels || giphy
            images_unsplash_instance: null,     // unsplash 搜索方法实例，初始时创建
            images_pexels_instance: null,       // pexels 搜索方法实例，初始时创建
            images_giphy_instance: null,        // giphy 搜索方法实例，初始时创建

            images_unsplash_data_cache: {},      // unsplash 数据缓存列表
            images_pexels_data_cache: {},        // pexels 数据缓存列表
            images_giphy_data_cache: {},        // giphy 数据缓存列表

            visible_area_min: 0,                            // 可视区的上边框top 
            visible_area_max: 0                             // 可视区的下边框top
        }
    },
    mounted() {
        // 创建站外素材库 unsplash || pexels || giphy搜索方法实例
        this.images_unsplash_instance = new outside_material('unsplash');
        this.images_pexels_instance = new outside_material('pexels');
        this.images_giphy_instance = new outside_material('giphy');
    },
    methods: {
        back() {
            this.$emit('back');
        },
        close_modal(){
            this.$emit('close_modal');
        },
        // 面板数据，数据列表、标签列表、滚动dom容器、素材自适应基础尺寸、间距
        current_open_modal() {
            let el = this.$refs.images_contain_dom;
            let obj = {
                base_conf: {
                    el,
                    width: 100,
                    height: 9 / 16 * 100,
                    offset: 15,
                    type: 'waterfall',
                }
            }
            return obj;
        },
        // 
        imagesMenuChecked(key) {
            this.outside_search_text = '';
            this.images_current_menu = key;
            this.outside_get_data();
        },
        // 搜索
        search(){
            this.outside_get_data({
                content: this.outside_search_text.trim(),
            });
        },
        // 搜索空状态返回
        search_back(){
            this.outside_search_text = '';
            this.outside_get_data();
        },
        // 通用获取站外素材方法，统一处理数据列表加载中、空列表、加载失败
        common_outside_requset(obj) {
            let that = this;
            let opt = {
                params: {},
                beforeSend: null,
                success: null,
                error: null,
            };
            opt = Object.assign(opt, obj);
            //中断前一次未响应请求
            if (that.cancel_axios && typeof that.cancel_axios === 'function') that.cancel_axios();
            that.cancel_axios = null;
            // 状态更新
            that.search_empty = false;
            that.loaderror = false;
            that.loading = true;
            let content = opt.params['content'] || '';
            let page_size = opt.params['pageSize'];
            let page_number = opt.params['pageNumber'];
            // script 为搜索关键词，无法用于搜索，可用于存储默认搜索的数据
            let cache_key = content || 'script';
            let results;
            that.$nextTick(() => {
                if (typeof opt.beforeSend === 'function') opt.beforeSend();
                switch (that.images_current_menu) {
                    // 从 unsplash 网站获取素材，如果 images_unsplash_data_cache 当前有缓存，则从缓存中获取
                    case 'Unsplash':
                        if (!that.images_unsplash_instance) {
                            return console.error('unsplash api error');
                        }
                        // 当前 搜索结果 在缓存中查询到，则从缓存中获取
                        let unsplash_cache = that.images_unsplash_data_cache;
                        if (cache_key in unsplash_cache) {
                            results = unsplash_cache[cache_key].results;
                            // 当前缓存中有数据
                            if (Array.isArray(results) && results.length > 0) {
                                // 当前请求 页数 <= 缓存的页数 时，返回缓存数据
                                if (page_number <= unsplash_cache[cache_key].pageNumber) {
                                    that.loading = false;
                                    let res_obj = {
                                        data: results,
                                        pageSize: unsplash_cache[cache_key].pageSize,
                                        pageNumber: unsplash_cache[cache_key].pageNumber,
                                    };
                                    if (typeof opt.success === 'function') opt.success(res_obj);
                                    return;
                                }
                            }
                        }
                        // 从接口获取数据
                        that.cancel_axios = that.images_unsplash_instance.search(content, page_size, page_number, (res) => {
                            that.search_empty = true;
                            if (page_number === 1 && res.results.length === 0) {
                                that.search_empty = true;
                            } else {
                                // 信息面板显示状态、下载状态
                                res.results.forEach((item) => {
                                    item['show_info'] = false;
                                    item['insertion'] = false;
                                });
                                // 缓存到内存中
                                let cache_value = {
                                    pageSize: page_size,
                                    pageNumber: page_number,
                                    results: res.results,
                                }
                                if (results) {
                                    cache_value['results'] = results.concat(res.results);
                                } else {
                                    cache_value['results'] = res.results;
                                }
                                unsplash_cache[cache_key] = cache_value;
                            }
                            let res_obj = {
                                data: res.results,
                                pageSize: page_size,
                                pageNumber: page_number,
                            };

                            if (typeof opt.success === 'function') opt.success(res_obj);
                        }, (err) => {
                            // 错误处理
                            that.loading = false;
                            if (page_number === 1) that.loaderror = true;
                            if (typeof opt.error === 'function') opt.error();
                            console.error(err);
                        });
                        break;
                    // 从 pexels 网站获取素材，如果 images_pexels_data_cache 当前有缓存，则从缓存中获取
                    case 'Pexels':
                        if (!that.images_pexels_instance) {
                            return console.error('pexels api error');
                        }
                        // 当前 搜索结果 在缓存中查询到，则从缓存中获取
                        let pexels_cache = that.images_pexels_data_cache;
                        if (cache_key in pexels_cache) {
                            results = pexels_cache[cache_key].results;
                            // 当前缓存中有数据
                            if (Array.isArray(results) && results.length > 0) {
                                // 当前请求 页数 <= 缓存的页数 时，返回缓存数据
                                if (page_number <= pexels_cache[cache_key].pageNumber) {
                                    that.loading = false;
                                    let res_obj = {
                                        data: results,
                                        pageSize: pexels_cache[cache_key].pageSize,
                                        pageNumber: pexels_cache[cache_key].pageNumber,
                                    };
                                    if (typeof opt.success === 'function') opt.success(res_obj);
                                    return;
                                }
                            }
                        }
                        // 从接口获取数据
                        that.cancel_axios = that.images_pexels_instance.search(content, page_size, page_number, (res) => {
                            that.loading = false;

                            // 信息面板显示状态、下载状态
                            res.results.forEach((item) => {
                                item['show_info'] = false;
                                item['insertion'] = false;
                            });
                            // 缓存到内存中
                            let cache_value = {
                                pageSize: page_size,
                                pageNumber: page_number,
                                results: res.results,
                            }
                            if (results) {
                                cache_value['results'] = results.concat(res.results);
                            } else {
                                cache_value['results'] = res.results;
                            }
                            pexels_cache[cache_key] = cache_value;
                            let res_obj = {
                                data: res.results,
                                pageSize: page_size,
                                pageNumber: page_number,
                            };
                            if (typeof opt.success === 'function') opt.success(res_obj);
                        }, (err) => {
                            if (axios.isCancel(err)) {
                                return;
                            }
                            // 错误处理
                            that.loading = false;
                            if (page_number === 1) that.loaderror = true;
                            if (typeof opt.error === 'function') opt.error();
                            console.error(err);
                        });
                        break;
                    case 'Giphy':
                        if (!that.images_giphy_instance) {
                            return console.error('giphy api error');
                        }
                        // 当前 搜索结果 在缓存中查询到，则从缓存中获取
                        let giphy_cache = that.images_giphy_data_cache;
                        if (cache_key in giphy_cache) {
                            results = giphy_cache[cache_key].results;
                            // 当前缓存中有数据
                            if (Array.isArray(results) && results.length > 0) {
                                // 当前请求 页数 <= 缓存的页数 时，返回缓存数据
                                if (page_number <= giphy_cache[cache_key].pageNumber) {
                                    that.loading = false;
                                    let res_obj = {
                                        data: results,
                                        pageSize: giphy_cache[cache_key].pageSize,
                                        pageNumber: giphy_cache[cache_key].pageNumber,
                                    };
                                    if (typeof opt.success === 'function') opt.success(res_obj);
                                    return;
                                }
                            }
                        }
                        // 从接口获取数据
                        that.cancel_axios = that.images_giphy_instance.search(content, page_size, page_number, (res) => {
                            that.loading = false;

                            // 信息面板显示状态、下载状态
                            res.results.forEach((item) => {
                                item['show_info'] = false;
                                item['insertion'] = false;
                            });
                            // 缓存到内存中
                            let cache_value = {
                                pageSize: page_size,
                                pageNumber: page_number,
                                results: res.results,
                            }
                            if (results) {
                                cache_value['results'] = results.concat(res.results);
                            } else {
                                cache_value['results'] = res.results;
                            }
                            giphy_cache[cache_key] = cache_value;
                            let res_obj = {
                                data: res.results,
                                pageSize: page_size,
                                pageNumber: page_number,
                            };
                            if (typeof opt.success === 'function') opt.success(res_obj);
                        }, (err) => {
                            if (axios.isCancel(err)) {
                                return;
                            }
                            // 错误处理
                            that.loading = false;
                            if (page_number === 1) that.loaderror = true;
                            if (typeof opt.error === 'function') opt.error();
                            console.error(err);
                        });
                        break;
                }
            });
        },
        // 获取数据
        outside_get_data(param) {
            let that = this;
            that.$nextTick(() => {
                // 计算 pageSize
                let conf = that.current_open_modal().base_conf;
                let page_size = material.method.compute_page_size({
                    el: conf.el,
                    width: conf.width,
                    height: conf.height,
                });
                // 合并接口参数
                let $params = {
                    'content': '',
                    'pageNumber': 1,
                    'pageSize': page_size,
                };
                $params = Object.assign($params, param);
                that.common_outside_requset({
                    params: $params,
                    beforeSend: () => {
                        // 更新节点信息
                        conf = that.current_open_modal().base_conf;
                        // 页码 = 1 时，重新从第一页获取，则清除之前的列表
                        if ($params['pageNumber'] === 1) {
                            that.images_data_list = [];
                            $(conf.el).scrollTop(0);
                        }
                        that.loading = true;
                    },
                    success: (res) => {
                        let data = res.data;
                        let data_list = that.images_data_list.concat(data);
                        // 更新节点信息
                        conf = that.current_open_modal().base_conf;
                        if (data_list.length === 0) return;
                        // 计算列表自适应布局
                        that.images_data_list = material.method.material_adapt(data_list, {
                            el: conf.el,
                            type: 'waterfall',
                            width: conf.width,
                            height: conf.height,
                        });
                        /**
                         * 如果数据列表数量小于当前屏幕需要加载的数量时，直接触发加载下一页
                         */
                        if (data.length > 0 && data_list.length < page_size) {
                            let limit = material.method.update_visible_area(that.current_open_modal());
                            that.visible_area_min = limit.min;
                            that.visible_area_max = limit.max;
                            let down_page_number = parseInt(res.pageNumber) + 1;
                            that.outside_get_data({
                                'content': $params['content'],
                                'pageNumber': down_page_number,
                            });
                            return;
                        }
                        /**
                         * 滚动加载，获取到的数组长度大于 0 ，绑定滚动事件
                         * 由于数据没有 totalPages 返回，需单独处理
                         */
                        if (data.length > 0) {
                            let $el = conf.el;
                            let is_scroll = false;
                            // 隐藏滚动区域外的列表
                            let limit = material.method.update_visible_area(that.current_open_modal());
                            that.visible_area_min = limit.min;
                            that.visible_area_max = limit.max;
                            $el.onscroll = function (event) {
                                let $this = event.target;
                                let client_height = $this.clientHeight,
                                    scroll_height = $this.scrollHeight,
                                    scroll_top = $this.scrollTop;
                                // 隐藏滚动区域外的列表
                                let _limit = material.method.update_visible_area(that.current_open_modal());
                                that.visible_area_min = _limit.min;
                                that.visible_area_max = _limit.max;
                                // 显示回到顶部按钮
                                that.show_to_top = scroll_top >= client_height * 0.8;
                                /**
                                 * 滚动触底计算
                                 * 滚动偏移量大于0 并且 滚动距离 大于 dom高度 75% 触发加载下一页
                                 */
                                let scroll_scale = (scroll_top + client_height) / scroll_height;
                                if (scroll_top > 0 && scroll_scale > 0.75) {
                                    // 列表正在加载中，停止触发
                                    if (is_scroll) return false;
                                    let down_page_number = parseInt(res.pageNumber) + 1;
                                    is_scroll = true;
                                    that.outside_get_data({
                                        'content': $params['content'],
                                        'pageNumber': down_page_number,
                                    });
                                }
                            };
                        }

                        that.loading = false;
                    },
                    error: () => {
                        that.images_data_list = [];
                        that.loaderror = true;
                        that.loading = false;
                    },
                });
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
        // 站外素材插入
        outside_material_append(item) {
            let that = this;
            if (!item.images || !item.images.original) return false;
            material.api.common_outside_material_append(item, (data) => {
                let filename = `image.${data.type.split('/')[1]}`;
                // 上传到服务器
                material.api.common_image_upload(that.MaterialLibrary, {
                    file: data,
                    name: filename,
                    builddone: ($ele, template, option) => {
                        // 在替换图片、设置背景图操作下插入站外图片
                        switch (material.images_operation_state) {
                            // 替换图片
                            case 'element_src':
                                that.MaterialLibrary.images_change_element_src(template);
                                break;
                            // 修改背景图链接
                            case 'background_src':
                                that.MaterialLibrary.images_change_background_src(template.url);
                                break;
                            // 插入图片元素
                            default:
                                let ratio = template.image_h / template.image_w;
                                template.width = ratio > 1 ? 168 : 280;
                                template.height = template.width * ratio;
                                that.EditView.element_preinsert_ready([template]);
                                break;
                        }
                        that.close_modal();
                        // 解除插入图片 蒙层状态
                        item.insertion = false;
                    },
                    error: () => {
                        // 解除插入图片 蒙层状态
                        item.insertion = false;
                        that.$toast('图片插入失败！');
                    }
                });
            });
        },
        // 站外素材右上角更多点击
        outside_panel_info_toggle(item) {
            item.show_info = !item.show_info;
        },
        // 站外素材信息面板隐藏
        outside_panel_info_hide(item) {
            item.show_info = false;
        },
    },

}
</script>

<style lang="less" scoped>
.resource-material {
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

        .resource-contain-left {
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
                            background: #4ad9f2;
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
        .resource-contain-right {
            flex: 1;
            .resource-section-content {
                width: 100%;
                height: 100%;
            }
        }
    }
}
</style>