<!-- 我的收藏弹框 -->
<template>
    <div class="my-space-material">
        <div class="material-header">
            <div class="material-back" @click="back">
                <base-icon class="iconfanhuizhuomian"></base-icon>
                <span>返回桌面</span>
            </div>
        </div>
        <div class="material-body">
            <!-- 分类列表 -->
            <div class="collect_contain_left">
                <div class="material-group">
                    <span class="title">我的空间</span>
                    <ul class="bar_menu">
                        <!-- 最近使用 -->
                        <li class="used_recently" :class="{'current': collection_current_menu === 'used_recently'}" @click="collection_menu_checked('used_recently')">
                            <div class="icon">
                                <base-icon class="iconzuijinshiyong"></base-icon>
                            </div>
                            <span>最近使用</span>
                            <base-icon class="iconxiala"></base-icon>
                        </li>
                        <!-- 我的上传 -->
                        <li class="my_upload" :class="{'current': collection_current_menu === 'my_upload'}" @click="collection_menu_checked('my_upload')">
                            <div class="icon">
                                <base-icon class="iconwodeshangchuan"></base-icon>
                            </div>
                            <span>我的上传</span>
                            <base-icon class="iconxiala"></base-icon>
                        </li>
                        <!-- 收藏的素材 -->
                        <li class="materials_collection" :class="{'current': collection_current_menu === 'materials_collection'}" @click="collection_menu_checked('materials_collection')">
                            <div class="icon">
                                <base-icon class="iconwodeshoucang"></base-icon>
                            </div>
                            <span>素材收藏</span>
                            <base-icon class="iconxiala"></base-icon>
                        </li>
                        <!-- 收藏的音频 -->
                        <li class="media_collection" :class="{'current': collection_current_menu === 'media_collection'}" @click="collection_menu_checked('media_collection')">
                            <div class="icon">
                                <base-icon class="iconyinpinshoucang"></base-icon>
                            </div>
                            <span>音频收藏</span>
                            <base-icon class="iconxiala"></base-icon>
                        </li>
                    </ul>
                </div>
                <div class="storage-info" v-show="collection_current_menu === 'my_upload'">
                    <div class="progress">
                        <i :style="{width: progress}"></i>
                    </div>
                    <div class="text-info">
                        <span>存储空间</span>
                        <span>{{storage_content}}</span>
                        <div class="icon" @click="$modal({templateType:'memberGrade'})" v-tooltip="{content: '点击了解会员权限', placements: 'right', theme: 'white'}">
                            <base-icon class="iconquanxianshuoming"></base-icon>
                        </div>
                    </div>
                </div>
                <local-upload-button @uploadOver="close_modal()"></local-upload-button>
            </div>
            <!-- 数据列表 -->
            <div class="collect_contain_right">
                <div class="material_empty" v-if="search_empty">
                    <div class="empty_contain">
                        <img src="../../../../assets/pc/images/edit/material_empty_bg.png" alt="" />
                        <span v-show="collection_current_menu === 'used_recently'">你最近没有使用图片哦~</span>
                        <span v-show="collection_current_menu === 'materials_collection'">你没有任何收藏的素材哦~</span>
                        <span v-show="collection_current_menu === 'media_collection'">你没有任何收藏的音频哦~</span>
                        <span v-show="collection_current_menu === 'my_upload'">你没有上传图片哦~</span>
                    </div>
                </div>
                <div class="scroll_window" ref="collect_contain_dom" v-else>
                    <!-- 素材或单页列表 -->
                    <ul class="scroll_container">
                        <li v-for="item in collection_data_list" :key="item.id" :data-id="item.id" :data-place="item._place_type" :class="{'gif_tag': item.gif_img, 'svg_tag': item.svg_img, 'skeleton-loading': true}" :style="{'top': `${item._top}px`, 'left': `${item._left}px`, 'width': `${item._width}px`, 'height': `${item._height}px`}" v-show="item._top <= visible_area_max && (item._top + item._height) >= visible_area_min" @mouseenter="static2dynamic($event, item)" @mouseleave="dynamic2static($event, item)">
                            <img @load="img_load_done($event)" v-lazy="item.image" :data-sn="item.sn" :data-id="item.id" @click="collection_material_append(item)" alt="图片库素材预览图" v-bdtongji="`PC-统计-我的收藏-${item.categoryFullName ? item.categoryFullName.replace(/,/g,'-') : ''}-应用素材`" />
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
                            <!-- 我的上传分类、最近使用中上传的图片不显示收藏按钮，我的收藏分类取消收藏删除更新数据 -->
                            <!-- 收藏 -->
                            <div :class="['favorite-btn', {'has-collect': favorite_map[item.id] || collection_current_menu === 'media_collection'}]" :title="favorite_map[item.id] || collection_current_menu === 'media_collection' ? '取消收藏' : '加入收藏'" v-if="collection_current_menu !== 'my_upload' && item.type !== 'myUpload'" @click="material_favorite(item.id)">
                                <base-icon class="iconshoucang"></base-icon>
                            </div>
                            <!-- 我的上传分类显示删除按钮 -->
                            <div class="delete-btn" title="删除" v-if="collection_current_menu === 'my_upload'" @click="images_delete_upload(item.id)">
                                <base-icon class="iconshanchutianchong"></base-icon>
                            </div>
                            <!-- 放大镜 -->
                            <div :class="['preview-btn', {'has-collect': item.type !== 'myUpload'}]" @mouseenter="images_enter($event, item)" @mouseleave="images_leave(item)">
                                <base-icon class="iconsousuo"></base-icon>
                            </div>
                        </li>
                    </ul>
                    <!-- 第一页加载效果 -->
                    <div class="first_loading" v-show="collection_data_list.length === 0 && loading">
                        <img src="../../../../assets/pc/images/edit/category_loading.gif" alt="数据加载中" />
                    </div>
                    <!-- 滚动加载下一页效果 -->
                    <div class="scroll_loading" v-show="collection_data_list.length > 0 && loading">
                        <img src="../../../../assets/pc/images/edit/scroll_loading.gif" alt="数据加载中" />
                    </div>
                    <!-- 无更多效果 -->
                    <div class="no_more" v-show="collection_data_list.length > 0 && !loading">
                        <i class="edit-ico edit-ico-material_no_more"></i>
                        <p>没有更多了</p>
                    </div>
                    <!-- 加载错误效果 -->
                    <div class="load_error" v-show="loaderror">
                        <img src="../../../../assets/pc/images/common/loaderror.png" alt="加载失败" />
                        <p>哇哦，网络好像不给力，重新加载试试看</p>
                        <a class="reload_btn" @click="collection_menu_checked(collection_current_menu)">重新加载</a>
                    </div>
                </div>
            </div>
        </div>
        <div class="media-info" ref="media_info" v-show="media_info_show">
            <span>编号：{{media_info.id}}</span>
            <span v-show="media_info.size">大小：{{media_info.size}}</span>
            <span>类型：{{media_info.type}}</span>
            <span v-show="media_info.time">时间：{{media_info.time}}</span>
        </div>
        <div class="image-preview-wrap" ref="my_upload_image_info" v-show="my_upload_image_preview">
            <img src="" alt="">
            <div class="info">
                <span>编号：{{my_upload_image_info.id}}</span>
                <span>大小：{{my_upload_image_info.size}}</span>
                <span>类型：{{my_upload_image_info.type}}</span>
            </div>
        </div>
    </div>
</template>

<script>
import opt_factory from '@/assets/pc/js/opt/opt_factory.js';
import material from '@/assets/pc/js/material.js';
import member_rankauthorities from '@/assets/common/js/member_rankauthorities.js';
import video_cover from '@/assets/pc/images/material/video.png';
import audio_cover from '@/assets/pc/images/material/audio.png';
import LocalUploadButton from '@/views/pc/EditView/MaterialModal/LocalUploadButton.vue';

export default {
    props: {
        template_classify: {
            type: String,
            default: 'template'
        }
    },
    inject: ['EditView', 'MaterialLibrary'],
    components:{
        LocalUploadButton
    },
    data() {
        return {
            /** ------------- 常量和状态 ---------------*/
            IMAGE_ID: 7,                                    // 图片类id
            ICONS_ID: 21,                                   // 图标类id
            loading: false,                                 // 加载中标识
            loaderror: false,                               // 加载失败标识
            search_empty: false,                            // 空状态标识
            favorite_map: {},                               // 收藏数据
            collection_current_menu: null,                  // 选中的一级分类
            /** ------------ 数据列表 --------------*/
            collection_data_list: [],                       // 我的收藏数据列表

            visible_area_min: 0,                            // 可视区的上边框top 
            visible_area_max: 0,                             // 可视区的下边框top

            storage_now: 0,                                // 当前已使用内存
            storage_total: 100,                             // 总内存

            // 我的上传图片预览
            my_upload_image_preview: false,
            // 我的上传图片信息
            my_upload_image_info: {
                id: null,
                size: '',
                type: null
            },
            // 是否显示媒体信息
            media_info_show: false,
            // 媒体信息
            media_info: {
                id: null,
                size: '',
                type: null,
                time: null
            }
        }
    },
    mounted() { },
    computed: {
        // 存储信息内容
        storage_content() {
            let total = this.storage_total;
            let now = this.storage_now;
            let account = 'KB';
            if (total > 1024) {
                total /= 1024;
                now /= 1024;
                account = 'M';
            }

            if (total > 1024) {
                total /= 1024;
                now /= 1024;
                account = 'G';
            }
            now = now.toFixed(2);
            return `${now}/${total}${account}`;

        },
        // 已使用存储空间百分比
        progress() {
            let num = this.storage_now / this.storage_total * 100;
            num = num > 100 ? 100 : num;
            return num.toFixed(2) + '%';
        }
    },
    methods: {
        // 返回
        back() {
            this.$emit('back');
        },
        //  关闭弹框
        close_modal() {
            let that = this;
            that.$emit('close_modal');
        },
        // 返回当前正在访问的面板数据，数据列表、标签列表、滚动dom容器、素材自适应基础尺寸、间距
        current_open_modal() {
            let obj = {};
            let that = this;
            obj = {
                key: 'collectStore',
                classify: that.template_classify,
                base_conf: {
                    el: that.$refs.collect_contain_dom,
                    width: 100,
                    height: 9 / 16 * 100,
                    offset: 15,
                    type: 'waterfall',
                },
                data: that.collection_data_list,
            }
            return obj;
        },
        // 刷新自适应
        re_adapt() {
            this.$emit('re_adapt', this.current_open_modal());
        },
        // 我的收藏弹框打开初始化
        collect_open_init(callback) {
            this.collection_menu_checked(this.collection_current_menu || 'used_recently')
            if (typeof callback === 'function') callback();
        },
        // 切换我的...内一级分类
        collection_menu_checked(menu_key) {
            let that = this;
            that.collection_current_menu = menu_key;
            that.get_mydata();
        },
        // 根据collection_current_menu获取数据
        get_mydata(param) {
            let that = this;
            that.$nextTick(() => {
                // 计算 pageSize
                let conf = that.current_open_modal().base_conf;
                let page_size = material.method.compute_page_size({
                    el: conf.el,
                    width: conf.width,
                    height: conf.height,
                    type: conf.type
                });
                // 合并接口参数
                let api_url = '';
                let $params = {
                    'pageNumber': 1,
                    'pageSize': page_size,
                };
                switch (that.collection_current_menu) {
                    // 最近使用
                    case 'used_recently':
                        api_url = '/api/member/lately_used/list/';
                        break;
                    // 我的上传
                    case 'my_upload':
                        api_url = '/api/member/myupload/list/';
                        break;
                    // 收藏的素材
                    case 'materials_collection':
                        api_url = '/api/member/favorite/list/';
                        $params['cid'] = [that.IMAGE_ID, that.ICONS_ID].join(',');
                        break;
                    case 'media_collection':
                        api_url = '/api/member/favorite_media/list/';
                        break;
                }
                if (!api_url) return false;
                $params = Object.assign($params, param);
                material.api.common_get_material({
                    url: api_url,
                    params: $params,
                    current_modal: that.current_open_modal(),
                    beforeSend: () => {
                        that.search_empty = false;
                        that.loading = true;
                        that.loaderror = false;
                        // 更新节点信息
                        conf = that.current_open_modal().base_conf;
                        // 页码 = 1 时，重新从第一页获取，则清除之前的列表
                        if ($params['pageNumber'] === 1) {
                            that.collection_data_list = [];
                            $(conf.el).scrollTop(0);
                        }
                    },
                    success: (data) => {
                        that.favorite_map = material.favorite_map;
                        that.search_empty = material.states.search_empty;
                        that.loading = false;
                        // 数据处理
                        data.dataList.forEach((item) => {
                            if (!item['largeImage']) item['largeImage'] = item['image'];
                        });
                        let data_list = that.collection_data_list.concat(data.dataList);
                        if (that.search_empty) return false;
                        // 更新节点信息
                        conf = that.current_open_modal().base_conf;
                        // 最近使用和我的上传 有 音频 和 视频
                        if (that.collection_current_menu === 'my_upload' || that.collection_current_menu === 'used_recently') {
                            data_list = data_list.map(v => {
                                let type = v.type;
                                if (type === 'myUpload') {
                                    type = v.myUploadType;
                                }
                                switch (type) {
                                    case 'video':
                                        v.image = video_cover;
                                        v.imageWidth = 100;
                                        v.imageHeight = 100;
                                        break;
                                    case 'audio':
                                        v.image = audio_cover;
                                        v.imageWidth = 100;
                                        v.imageHeight = 100;
                                        break;
                                }
                                return v;
                            });
                        } else if (that.collection_current_menu === 'media_collection') {
                            // 音频收藏
                            data_list = data_list.map(v => {
                                v.image = audio_cover;
                                v.imageWidth = 100;
                                v.imageHeight = 100;
                                return v;
                            });
                        }

                        // 计算列表自适应布局
                        that.collection_data_list = material.method.material_adapt(data_list, {
                            el: conf.el,
                            width: conf.width,
                            height: conf.height,
                            type: conf.type,
                            offset: conf.offset,
                        });
                        if (data.favorite_map) {
                            that.favorite_map = material.favorite_map;
                        }
                        if (data_list.length === 0) {
                            that.search_empty = true;
                        }
                        // 分页信息
                        let pagination = {
                            pageNumber: data.pageNumber,
                            pageSize: data.pageSize,
                            totalPages: data.totalPages,
                        };
                        // 最近使用素材 最多加载10页
                        if (that.collection_current_menu === 'used_recently' && pagination.pageNumber >= 10) {
                            return false;
                        }
                        // 我的上传素材类型改为myUpload
                        if (that.collection_current_menu === 'my_upload') {
                            let user = that.$common.get_login_state();
                            that.storage_total = member_rankauthorities.getrank(user.memberVip).myuploadAdd; // 获取总空间大小
                            that.storage_now = data.size; // 获取已使用的空间大小
                        }
                        // 绑定滚动加载方法
                        material.method.common_scroll_load(that.current_open_modal(), pagination, (pagedata) => {
                            // 加载下一页
                            that.get_mydata({
                                'pageNumber': pagedata.pageNumber,
                                'pageSize': pagedata.pageSize,
                            });
                        }, (limit) => {
                            that.visible_area_min = limit.min;
                            that.visible_area_max = limit.max;
                        });
                    },
                    error: () => {
                        that.loaderror = true;
                        that.$toast('数据获取失败');
                        if ($params['pageNumber'] === 1) {
                            that.collection_data_list = [];
                        }
                    },
                });

            });
        },
        // 插入元素
        collection_material_append(item) {
            // 音频收藏
            if(this.collection_current_menu === 'media_collection'){
                this.audio_material_insert(item);
                return;
            }
            let type = item.type === 'myUpload' ? item.myUploadType : item.type;
            switch (type) {
                case 'image':
                case 'material':
                    this.images_material_append(item);
                    break;
                case 'video':
                    this.insert_video(item);
                    break;
                case 'audio':
                    this.insert_audio(item);
                    break;
                default:
                    this.images_material_append(item);
            }
        },
        // 图片鼠标移入
        images_enter(e, item) {
            if (this.collection_current_menu === 'my_upload' && item.type === 'image') {
                this.myUploadImagePreview(e, item);
                return;
            }

            let type = item.type === 'myUpload' ? item.myUploadType : item.type;
            switch (type) {
                case 'image':
                case 'material':
                    this.images_enlarge(e, item);
                    break;
                case 'video':
                case 'audio':
                    this.mediaInfoShow(e, item);
                    break;
                default:
                    this.images_enlarge(e, item);
                    break;
            }
        },
        // 图片鼠标离开
        images_leave(item) {
            if (this.collection_current_menu === 'my_upload' && item.type === 'image') {
                this.myUploadImagePreviewHide();
                return;
            }
            let type = item.type === 'myUpload' ? item.myUploadType : item.type;
            switch (type) {
                case 'image':
                case 'material':
                    this.images_enlarge_restore();
                    break;
                case 'video':
                case 'audio':
                    this.mediaInfoHide();
                    break;
                default:
                    this.images_enlarge_restore();
                    break;
            }
        },

        /** */
        // 图片放大预览
        images_enlarge(event, item) {
            material.method.images_enlarge(event, item);
        },
        // 关闭放大预览
        images_enlarge_restore() {
            material.method.images_enlarge_restore();
        },
        // 我的上传图片预览
        myUploadImagePreview(e, item) {
            let that = this;
            let target = e.target;
            let $img = that.$refs.my_upload_image_info.querySelector('img');
            that.my_upload_image_preview = true;
            $img.onload = function () {
                let el = that.$refs.my_upload_image_info;
                let el_w = el.scrollWidth;
                let el_h = el.scrollHeight;
                let target_w = target.offsetWidth;
                let target_h = target.offsetHeight;
                let window_width = window.innerWidth;
                let window_height = window.innerHeight;
                let space = 10; // 间距
                let offset = $(target).offset();
                let left = offset.left + target_w + space;
                let top = offset.top;
                if (left + el_w > window_width) {
                    left = offset.left - el_w - space;
                    if (left < 0) {
                        left = 0;
                        $(el).css({ width: offset.left + 'px', });
                    }
                }
                if (top + el_h > window_height) {
                    top = top + target_h - el_h;
                    if(top < 0) top = offset.top - el_h / 2 + target_h / 2;
                }
                left += 'px';
                top += 'px';
                $(el).css({ top, left });
                $img.onload = null;
            }

            // 图片渲染
            $img.src = item.largeImage || item.image;
            // 渲染原图
            if ($img.src.indexOf('?') > 0) {
                $img.src = $img.src.slice(0, $img.src.indexOf('?'));
            }

            that.my_upload_image_info.id = item.id;
            if (item.imageSize) {
                that.my_upload_image_info.size = item.imageSize > 1024 ? `${(item.imageSize / 1024).toFixed(2)}MB` : `${item.imageSize}KB`;
            } else {
                that.my_upload_image_info.size = '';
            }
            let type = item.type === 'myUpload' ? item.myUploadType : item.type;
            that.my_upload_image_info.type = type.toUpperCase();
        },
        // 我的上传图片预览关闭
        myUploadImagePreviewHide() {
            this.my_upload_image_preview = false;
        },
        // 图片加载完毕
        img_load_done(event) {
            // 图片库png图片加载完毕后清除背景图，防止背景图溢出
            if (event.target.getAttribute('lazy') === 'loaded') {
                $(event.target).parents('li').css('background', '#ffffff');
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
        // 图片插入
        images_material_append(item) {
            let that = this;
            if (!item) return false;
            let material_status = null;
            switch (that.collection_current_menu) {
                case 'my_upload': // 我的上传
                    material_status = 'myupload';
                    break;
                case 'materials_collection':
                    material_status = 'favorite';
                    break;
                case 'used_recently': // 最近设计
                    material_status = typeof (item.type) === 'string' ? item.type.toLowerCase() : item.type;
                    break;
            }
            material.api.common_material_append(item, material_status, (data) => {
                try {
                    let append_type = data.type;
                    append_type = 'img';
                    that.MaterialLibrary.common_material_type_append({
                        type: append_type,
                        html: data.html,
                    });
                } catch (error) {
                    console.error(error);
                    that.$toast('插入素材失败！');
                }
                that.close_modal();
            });
        },

        /** 媒体方法 */
        // 展示媒体信息
        mediaInfoShow(e, item) {
            let el = this.$refs.media_info;
            let target = e.target;
            let el_w = el.offsetWidth;
            let el_h = el.offsetHeight;
            let target_w = target.offsetWidth;
            let target_h = target.offsetHeight;
            let window_width = window.innerWidth;
            let window_height = window.innerHeight;
            let space = 10; // 间距
            let offset = $(e.target).offset();
            let left = offset.left + target_w + space;
            let top = offset.top;
            if (left + el_w > window_width) {
                left = offset.left - el_w - space;
            }
            if (top + el_h > window_height) {
                top = top + target_h - el_h;
            }
            left += 'px';
            top += 'px';
            $(el).css({ top, left });
            this.media_info.id = item.id;
            if (item.imageSize) {
                this.media_info.size = item.imageSize > 1024 ? `${(item.imageSize / 1024).toFixed(2)}MB` : `${item.imageSize}KB`;
            } else {
                this.media_info.size = '';
            }
            if(item.duration){
                let m = parseInt(item.duration / 60);
                let s = parseInt(item.duration % 60);
                m = m.toString().length >　1 ? m : `0${m}`;
                s = s.toString().length >　1 ? s : `0${s}`;
                this.media_info.time = `${m}:${s}`;
            }else{
                this.media_info.time = '';
            }
            let type = item.type === 'myUpload' ? item.myUploadType : item.type;
            this.media_info.type = type.toUpperCase();
            this.media_info_show = true;
        },
        // 隐藏媒体信息
        mediaInfoHide() {
            this.media_info_show = false;
        },
        // 插入视频 创建视频元素
        insert_video(item, callback) {
            let that = this;
            let option = opt_factory.init_opt('video');
            let param = {
                id: option.fn.uuid(),
                width: 16,
                height: 9,
            }
            let material_status = 'myupload';
            material.api.common_material_append(item, material_status, (data) => {
                // 生成元素
                param = that.EditView.ele_build_before_format(param);
                param['src'] = data.videoSrc;
                // 阿里云 oss 视频截帧
                param['cover'] = `${data.videoSrc}?x-oss-process=video/snapshot,t_1000,m_fast`;
                param['outside'] = false;
                // 获取视频元数据
                let $video = document.createElement('video');
                $video.src = param.src;
                $video.onloadedmetadata = function () {
                    param['width'] = $video.videoWidth;
                    param['height'] = $video.videoHeight;
                    that.build_video_element(param);
                    if (typeof callback === 'function') callback(option.dom_2_ele($(`.page_contain .edit_page #${param.id}.ele_item`)));
                }
            });
        },
        // 生成视频元素插入到画布
        build_video_element(param) {
            let that = this;
            let $page = $('.page_contain .edit_page');
            let option = opt_factory.init_opt('video');
            let $ele;
            // 清除其他元素选中
            that.EditView.ele_cancel_checked();
            let ele_html = option.build(param);
            $ele = $(ele_html);
            $page.append($ele);
            // 初始化大小
            option.fit_dom_size($ele);
            // 初始化位置
            option.fit_dom_offset($ele);
            // 选中元素
            that.EditView.set_ele_checked($ele);
            // 关闭弹窗
            that.close_modal();
        },
        // 插入音频 创建音频元素
        insert_audio(item, callback) {
            let that = this;
            let option = opt_factory.init_opt('audio');
            // 元素创建
            let param = {
                id: option.fn.uuid(),
                width: 50,
                height: 50,
            };
            let material_status = 'myupload';
            material.api.common_material_append(item, material_status, (data) => {
                // 插入元素
                let $page = $('.page_contain .edit_page');
                let $ele;
                // 清除其他元素选中
                that.EditView.ele_cancel_checked();
                // 获取音频链接
                param['src'] = data.audioSrc;
                // 生成图表元素
                param = that.EditView.ele_build_before_format(param);
                let ele_html = option.build(param);
                $ele = $(ele_html);
                $page.append($ele);
                // 初始化位置
                option.fit_dom_offset($ele);
                // 选中元素
                that.EditView.set_ele_checked($ele);
                // 关闭弹窗
                that.close_modal();
                if (typeof callback === 'function') callback(option.dom_2_ele($ele));
            });
        },
        // 音频素材插入
        audio_material_insert(item) {
            let that = this;
            if (!item || !item.id || !item.src) {
                return;
            }
            that.insert_audio(item.src);
            // 素材增加使用次数
            that.add_media_use(item.id);
        },
        // 插入音频 创建音频元素
        insert_audio(src, callback) {
            let that = this;
            if (src) {
                // 插入元素
                let $page = $('.page_contain .edit_page');
                let option = opt_factory.init_opt('audio');
                let $ele;
                // 清除其他元素选中
                that.EditView.ele_cancel_checked();
                // 元素创建
                let param = {
                    id: option.fn.uuid(),
                    src: src,
                    width: 50,
                    height: 50,
                };
                // 生成图表元素
                param = that.EditView.ele_build_before_format(param);
                let ele_html = option.build(param);
                $ele = $(ele_html);
                $page.append($ele);
                // 初始化位置
                option.fit_dom_offset($ele);
                // 选中元素
                that.EditView.set_ele_checked($ele);
                // 关闭弹窗
                that.close_modal();
                if (typeof callback === 'function') callback(option.dom_2_ele($ele));
            }
        },
        // 增加音乐使用次数
        add_media_use(mid) {
            let that = this;
            that.$axios.post('/api/media/use/', { mid: mid, });
        },

        /** ----------------------- 收藏或取消收藏 ------------------ */
        material_favorite(id) {
            let menu_key = this.collection_current_menu;
            switch (menu_key) {
                case 'materials_collection':
                    this.image_material_favorite(id);
                    break;
                case 'media_collection':
                    this.set_media_favorite(id);
                    break;
                default:
                    this.common_material_favorite(id);
                    break;
            }
        },
        // 设置 素材 加入收藏 & 取消收藏
        common_material_favorite(id) {
            let that = this;
            material.api.common_material_favorite(id, (state, data) => {
                if (state === 'delete') {
                    let index = that.collection_data_list.findIndex(item => item.documentId === id);
                    if (index >= 0) {
                        that.collection_data_list.splice(index, 1);
                    }
                    that.$set(that.favorite_map, id, false);
                    that.re_adapt();
                } else {
                    that.$set(that.favorite_map, id, data);
                }
            }
            )
        },
        // 我的上传 删除
        images_delete_upload(id) {
            let that = this;
            if (!id) return false;
            material.api.common_myupload_material_delete(id, () => {
                // 删除对应数据，更新视图
                let index = that.collection_data_list.findIndex(item => item.id === id);
                if (index >= 0) {
                    that.collection_data_list.splice(index, 1);
                }
                that.get_mydata();
                that.re_adapt();
            });
        },
        // 我的收藏的素材 取消收藏删除dom
        image_material_favorite(id) {
            let that = this;
            if (!id) return false;
            material.api.common_material_favorite(id, (state) => {
                if (state === 'delete') {
                    // 删除对应数据，更新视图
                    let index = that.collection_data_list.findIndex(item => item.id === id);
                    if (index >= 0) {
                        that.collection_data_list.splice(index, 1);
                        that.search_empty = that.collection_data_list.length === 0;
                    }
                    that.re_adapt();
                }
            });
        },
        // 媒体收藏  isfavorite = 是否收藏
        set_media_favorite(id, isfavorite) {
            let that = this;
            if (!id) {
                return that.$toast('操作失败');
            }
            let api, tip;
            if (isfavorite) {
                api = `/api/member/favorite_media/collect/`;
                tip = '收藏成功';
            } else {
                api = `/api/member/favorite_media/cancel_collect/`;
                tip = '取消成功';
            }
            that.$axios.post(api, {
                mid: id,
            }).then(res => {
                let res_data = res.data;
                if (res_data.type === 'success') {
                    let data = res_data.data;
                    if (isfavorite) {
                        that.$set(that.favorite_map, id, data);
                    } else {
                        that.$set(that.favorite_map, id, false);
                        // 收藏列表删除数据
                        let index = that.collection_data_list.findIndex(item => item.id === id);
                        that.collection_data_list.splice(index, 1);
                    }
                    that.$toast(tip);
                    that.re_adapt();
                } else {
                    that.$toast('操作失败');
                }
            }).catch(err => {
                console.error(err);
                that.$toast('操作失败');
            });
        },
    },
}
</script>

<style lang="less" scoped>
.my-space-material {
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
            margin-left: 20px;
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

        .collect_contain_left {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: space-between;
            width: 194px;
            height: 100%;
            border-right: 1px solid #eeeeee;

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
                            background: #0ebbff;
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
            .storage-info {
                margin-top: auto;
                margin-bottom: 10px;
                width: 158px;
                .progress {
                    width: 100%;
                    height: 4px;
                    background: #eeeeee;
                    border-radius: 2px;
                    i {
                        display: block;
                        height: 100%;
                        background: var(--mainColor);
                    }
                }
                .text-info {
                    margin-top: 5px;
                    display: flex;
                    align-items: center;
                    color: #666666;
                    span {
                        font-size: 12px;
                        font-weight: 400;
                        &:first-of-type {
                            margin-right: auto;
                        }
                    }
                    .icon {
                        display: flex;
                        justify-content: center;
                        align-items: center;
                        margin-left: 5px;
                        cursor: pointer;
                    }
                }
            }
            .local-upload-button {
                margin-bottom: 20px;
            }
        }
        .collect_contain_right {
            flex: 1;
            .scroll_container {
                > li {
                    
                    
                    .favorite-btn,
                    .delete-btn,
                    .preview-btn {
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
                        &:hover {
                            background: rgba(0, 0, 0, 0.8);
                        }
                    }

                    .favorite-btn {
                        &.has-collect {
                            color: #f7b500;
                        }
                    }

                    .preview-btn{
                        &.has-collect{
                            right: 30px;
                        }
                    }

                    &:hover {
                        .favorite-btn,
                        .delete-btn,
                        .preview-btn {
                            display: block;
                        }
                    }
                }
                & > li {
                    min-height: 34px;
                    overflow: hidden;
                    &:hover .bottom_bar {
                        bottom: 0;
                    }
                }
                & > li[data-place='fixed'] {
                    img {
                        width: 100%;
                        height: 100%;
                    }
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
            }
        }
    }
    .media-info {
        padding: 10px 0;
        position: fixed;
        display: flex;
        flex-direction: column;
        width: 140px;
        height: 168px;
        text-align: left;
        background: #ffffff;
        border: 1px solid #eeeeee;
        box-shadow: 0px 0px 10px 0px #dfe1e7;
        span {
            padding: 0 20px;
            flex: 1;
            display: flex;
            align-items: center;
            font-size: 12px;
            font-weight: 400;
            color: #666666;
        }
    }
    .image-preview-wrap {
        position: fixed;
        display: flex;
        flex-direction: column;
        align-items: center;
        background: #ffffff;
        border: 1px solid #eeeeee;
        box-shadow: 0px 0px 10px 0px #dfe1e7;
        img {
            max-width: 500px;
            max-height: 500px;
        }
        .info {
            display: flex;
            align-items: center;
            width: 100%;
            min-width: 500px;
            height: 60px;
            border-top: 1px solid #eeeeee;

            span {
                margin: 0 30px;
                font-size: 12px;
                font-weight: 400;
                text-align: left;
                color: #666666;
            }
        }
    }
}
</style>