import opt_factory from '@/assets/pc/js/opt/opt_factory.js';
import axios from '@/util/axios';
import axios_2 from 'axios';
import toast from '@/components/toast/toast';

let material = {
    images_current_menu: null,          // 当前选中的图片类型id
    images_operation_state: '',         // 图片素材操作的状态,  '' = 创建元素、element_src = 元素、background_src = 背景图、all_background_src = 全局背景图
    category_array: [],                 // 分类数组
    images_fast_class: [],              // 快捷入口分类 
    favorite_map: {},                   // 收藏列表
    cancel_axios: function(){},         // 中断接口请求
    states:{
        loaderror: false,               // 加载失败
        loading: false,                 // 加载中
        appending: false,               // 插入中
        search_empty: false,            // 列表空状态
        show_to_top: false,             // 是否展示返回顶部
    },
    method:{
        // 获取元素内容尺寸
        get_element_content_size: function (el) {
            let w = 0, h = 0;
            if (el.nodeType === 1) {
                // 获取容器内容width height
                let padding_top = +getComputedStyle(el)['paddingTop'].slice(0, -2),
                    padding_right = +getComputedStyle(el)['paddingRight'].slice(0, -2),
                    padding_bottom = +getComputedStyle(el)['paddingBottom'].slice(0, -2),
                    padding_left = +getComputedStyle(el)['paddingLeft'].slice(0, -2),
                    border_top = +getComputedStyle(el)['borderTopWidth'].slice(0, -2),
                    border_right = +getComputedStyle(el)['borderRightWidth'].slice(0, -2),
                    border_bottom = +getComputedStyle(el)['borderBottomWidth'].slice(0, -2),
                    border_left = +getComputedStyle(el)['borderLeftWidth'].slice(0, -2);
                w = el.offsetWidth - (padding_left + padding_right + border_left + border_right);
                h = el.offsetHeight - (padding_top + padding_bottom + border_top + border_bottom);
            }
            return {
                width: w,
                height: h,
            }
        },
        // 计算一屏可展示数量
        compute_page_size:function(opt){
            let obj = {
                el: null,
                width: 0,
                height: 0,
            };
            obj = Object.assign(obj, opt);
            if (!obj.el) return 0;
            let content_size = this.get_element_content_size(obj.el);
            let contain_width = content_size.width;
            let contain_height = content_size.height;
            // 计算行列可放的个数
            let row_number = Math.floor(contain_width / obj.width);
            let col_number = Math.ceil(contain_height / obj.height) + 4;
            return row_number * col_number;
        },
        // 计算列表自适应， list = 数据列表 ， opt = 设置参数
        material_adapt: function(list, opt){
            let obj = {
                el: null,
                type: 'fixed',           // 可能的值： fixed = 固定网格式显示，waterfall = 瀑布流显示
                width: 0,
                height: 0,
                offset: 15,
                row_number: null,
            };
            obj = Object.assign(obj, opt);
            let array = [];
            if (!obj.el) return array;
            if (!Array.isArray(list)) return array;
            let contain_width = this.get_element_content_size(obj.el).width;
            let $scroll_contain = obj.el.querySelector('.scroll_container');
            // 计算一行可放的个数，多出的空间再平分加上， ~~向下取整
            let row_number = ~~(contain_width / (obj.width + obj.offset));
            if (obj.row_number && row_number > 3) {
                row_number = obj.row_number;
            } 
            if (row_number === 0) return array;
            // 更新 width height
            let item_width = ~~((contain_width - row_number * (obj.width + obj.offset)) / row_number + obj.width);
            let item_height = ~~(obj.height / obj.width * item_width);
            let max_value = [];
            // 瀑布流显示
            if (obj.type === 'waterfall') {
                // 过滤掉没有宽高的元素
                array = list.filter(v => v.imageWidth && v.imageHeight);
                array = array.map((item, index, self) => {
                    let ratio = item.imageWidth / item.imageHeight;
                    item['_width'] = item_width;
                    item_height = item_width / ratio;
                    item['_height'] = item_height;
                    /**
                     * 瀑布流实现
                     */
                    // 当前所在列
                    let current_col = index % row_number;
                    // 获取当前元素之前的5行
                    let before_item = [];
                    for (let i = row_number * 5; i > 0; i--) {
                        let before_i = self[index - i];
                        if (before_i) {
                            before_item.push(before_i);
                        }
                    }
                    before_item = utils.deepClone(before_item);
                    // 第一行元素正常排序
                    if (before_item.length < row_number) {
                        item['_top'] = 0;
                        item['_left'] = (item_width + obj.offset) * current_col;
                    } else {
                        /**
                         * 从第二行起，获取到之前的10个元素数组（js对10以内的数组使用插入排序）；
                         * 根据 top + height 从小到大排序，然后截取最后一行的个数，拿到第一个；
                         * 获取到的第一个为前面5行元素的最短列，根据这个元素的 top & left 计算当前元素的 top & left
                         */
                        before_item.insertSort((a, b) => {
                            return (a['_top'] + a['_height']) - (b['_top'] + b['_height']);
                        });
                        before_item = before_item.slice(-row_number);
                        item['_top'] = before_item[0]['_top'] + before_item[0]['_height'] + obj.offset;
                        item['_left'] = before_item[0]['_left'];
                    }
                    /**
                     * 瀑布流实现 end
                     */
                    item['_place_type'] = obj.type;
                    // 计算最高数值
                    max_value.push(item['_top'] + item['_height']);
                    return item;
                });
            } else 
            // 网格式显示
            if (obj.type === 'fixed') {
                array = list.map((item, index) => {
                    item['_width'] = item_width;
                    item['_height'] = item_height;
                    // 计算当前行的top偏移量
                    let current_row = Math.ceil((index + 1) / row_number) - 1;
                    let item_top = (item_height + obj.offset) * current_row;
                    item['_top'] = item_top;
                    // 计算当前列的left偏移量
                    let current_col = index % row_number;
                    let item_left = (item_width + obj.offset) * current_col;
                    item['_left'] = item_left;
                    // 排列类型
                    item['_place_type'] = obj.type;
                    // 计算最高数值
                    max_value.push(item['_top'] + item['_height']);
                    return item;
                });
            }
            // 容器高度设置
            if ($scroll_contain) {
                $scroll_contain.style.height = `${Math.max.apply(null, max_value)}px`;
            }
            return array;
        },
        // 更新滚动可视区域数值
        update_visible_area: function (current_modal) {
            let conf = current_modal.base_conf;
            let result = {};
            if (conf && conf.el) {
                let $el = conf.el;
                result.min = $el.scrollTop;
                result.max = $el.scrollTop + $el.clientHeight;
                return result;
            }
        },
        // 通用滚动加载
        common_scroll_load: function (current_modal, pagination, callback, _callback) {
            let is_scroll = false;
            let conf = current_modal.base_conf;
            let $el = conf.el;
            // 使用 onscroll 的原因：onscroll方式绑定事件只能存在一个，所以不会重复绑定
            if (pagination && typeof pagination.pageNumber !== 'undefined') {
                pagination.pageNumber++;
            }
            // 隐藏滚动区域外的列表 
            let limit = material.method.update_visible_area(current_modal);
            if (typeof _callback === 'function') _callback(limit);
            $el.onscroll = function (event) {
                let $this = event.target;
                let client_height = $this.clientHeight,
                    scroll_height = $this.scrollHeight,
                    scroll_top = $this.scrollTop;
                // 隐藏滚动区域外的列表
                let limit = material.method.update_visible_area(current_modal);
                if (typeof _callback === 'function') _callback(limit);
                // 显示回到顶部按钮
                material.states.show_to_top = scroll_top >= client_height * 0.8;
                /**
                 * 滚动触底计算
                 * 滚动偏移量大于0 并且 滚动距离 大于 dom高度 75% 触发加载下一页
                 */
                let scroll_scale = (scroll_top + client_height) / scroll_height;
                if (scroll_top > 0 && scroll_scale > 0.75) {
                    // 列表正在加载中，停止触发
                    if (is_scroll) return false;
                    // 当前页 >= 总页数，停止触发回调
                    if (pagination) {
                        if ((pagination.pageNumber - 1) >= pagination.totalPages) {
                            return false;
                        }
                        is_scroll = true;
                        if (typeof callback === 'function') callback(pagination);
                    } else {
                        is_scroll = true;
                    }
                }
            };
        },
        /**
         *  图片相关处理
         */
        // 图片转 webp 处理  && gif图处理
        preview_towebp: function(imglist, conf_width){
            let gif = /.*\.gif/;
            let svg = /.*\.svg/;
            let check_webp = !!window.support_webp;
            let width = (conf_width || 400) + 100;
            // x-oss-process参数阿里云存储图片处理 webp 格式
            let url_params = '?x-oss-process=';
            let format_webp = ['image', `resize,m_lfit,w_${Math.floor(width + width * 0.4)}`, 'format,webp'];
            let format_png = ['image', `resize,m_lfit,w_${Math.floor(width + width * 0.4)}`, 'format,png'];
            let format_gif = ['image', `resize,m_lfit,w_${Math.floor(width + width * 0.4)}`, 'format,gif'];
            let oss_process = check_webp ? format_webp : format_png;
            for(let item in imglist) {
                let url = imglist[item].image;
                let largeImage = imglist[item].largeImage;
                if (!url) continue;
                switch (true) {
                    // gif
                    case gif.test(url):
                        oss_process = check_webp ? format_webp : format_gif;
                        // 源地址 webp处理
                        if (url.indexOf(url_params) >= 0) {
                            imglist[item].gif_img = url.substring(0, url.indexOf(url_params)) + url_params + oss_process.join('/');
                            imglist[item].image = url.substring(0, url.indexOf(url_params)) + url_params + format_png.join('/');
                        } else {
                            imglist[item].gif_img = url + url_params + oss_process.join('/');
                            imglist[item].image = url + url_params + format_png.join('/');
                        }
                        break;
                    // svg
                    case svg.test(largeImage):
                        imglist[item].svg_img = largeImage;
                        break;
                    // webp
                    default:
                        if (url.indexOf(url_params) >= 0) {
                            imglist[item].image = url.substring(0, url.indexOf(url_params)) + url_params + oss_process.join('/');
                        } else {
                            imglist[item].image = url + url_params + oss_process.join('/');
                        }
                        break;
                }
            }
            return imglist;
        },
        // 图片静转动
        static2dynamic: function(event, item) {
            if (item.gif_img) {
                // 触发方法时加载img，防止pending时触发dynamic2static方法中断请求，如果直接切换img.src 会取消请求
                let $img = new Image();
                $img.src = item.gif_img;
                $img.onload = function () {};
                $(event.target).find('img').attr('src', item.gif_img);
            }
            if (item.svg_img) {
                let $img = new Image();
                $img.src = item.svg_img;
                $img.onload = function () {};
                $(event.target).find('img').attr('src', item.svg_img);
            }
        },
        // 图片动转静
        dynamic2static: function(event, item) {
            if (item.gif_img) {
                $(event.target).find('img').attr('src', item.image);
            }
            if (item.svg_img) {
                $(event.target).find('img').attr('src', item.image);
            }
        },
        // 图片放大预览
        images_enlarge(event, item){
            // 最大尺寸
            let max_size = 600;

            // 原图宽高
            let img_w = item.imageWidth;
            let img_h = item.imageHeight;

            // 宽高比例
            let ratio = img_w / img_h;

            // 是否为竖版图片
            let is_col = img_w <= img_h;

            // 计算图片预览宽高
            img_w = is_col ? max_size * ratio : max_size;
            img_h = is_col ? max_size : max_size / ratio;

            // 如果没预览过图片  则创建预览html
            if(!$('div#enlarge_container').length){
                let div = $('<div id="enlarge_container"></div>');
                let img = $('<img src=""/>');
                div.addClass('enlarge_container'); 
                div.append(img);
                $(document.body).append(div);
            }

            // 获取预览元素
            let $div = $('div#enlarge_container');
            // 获取图片
            let $img = $div.find('img');
            // 设置图片宽高
            $img.css({
                width: img_w + 'px',
                height: img_h + 'px',
            });
            $img.addClass('image-loading');
            $img.on('load', function(){
                $(this).removeClass('image-loading');
            });

            $div.show();

            // 浏览器窗口宽高
            let window_width = window.innerWidth;
            let window_height = window.innerHeight;

            let offset = event.target.getBoundingClientRect();
            let space = 20; // 间距
            let preview_left = offset.left + offset.width + space;
            let preview_top = offset.top;

            // 计算定位
            if(preview_left + img_w > window_width) {
                preview_left = offset.left - space - img_w;
            }

            if(preview_top + img_h > window_height) {
                preview_top = offset.bottom - img_h;
                if(window_height - offset.bottom + img_h > window_height) preview_top += img_h / 2;
            }

            $div.css({
                top: preview_top,
                left: preview_left,
            });
            
            // 图片链接
            let img_src = item.largeImage || item.image;

            // 图片渲染
            $img.attr('src', img_src);

            // 渲染原图
            let img_src_link = $img.attr('src');
            if (img_src_link && img_src_link.indexOf('?') > 0) {
                img_src_link = img_src_link.slice(0, img_src_link.indexOf('?'));
                $img.attr('src', img_src_link);
            }
        },
        // 关闭放大预览
        images_enlarge_restore(){
            let $div = $('div#enlarge_container');
            $div.hide();
            $div.find('img').removeAttr('src');
        },
        // 替换图片、背景图操作，打开图片库，值为that.images_current_menu的格式
        images_operation_state_open(type){
            material.images_operation_state = type || '';
        }
    },
    api:{
        /**
         * 获取分类或标签相关方法
         */
        // 通用获取素材库一级类别，统一处理数据列表加载失败
        commmon_get_category: function (category_id, success_callback) {
            if (!category_id) return false;
            if (material.category_array.length === 0) {
                let material_loaddone = false;
                let design_loaddone = false;
                let images_fast_loaddone = false;
                material.states.loaderror = false;
                // 素材库一级类别
                axios.get('/api/material/category/').then((res) => {
                    let res_data = res.data;
                    material_loaddone = true;
                    if (res_data.type === 'success') {
                        // 添加到一级类别数组
                        material.category_array = material.category_array.concat(res_data.data);
                    } else {
                        // 错误处理
                        material.states.loaderror = true;
                    }
                }).catch((err) => {
                    material.states.loaderror = true;
                    console.error(err);
                });
                axios.get('/api/material/category/fast_enter/',{
                    params: {
                        categoryId: category_id,
                        type: 'material'
                    }
                }).then(function(data){
                    images_fast_loaddone = true;
                    if(data.data.code === '2'){
                        material.images_fast_class = data.data.data;
                    }
                }).catch(err => {
                    images_fast_loaddone = true;
                    console.log(err);
                })
                // 设计实验室一级类别
                axios.get('/api/template/category/', {
                    params: {
                        type: 'design',
                    },
                }).then((res) => {
                    let res_data = res.data;
                    design_loaddone = true;
                    if (res_data.type === 'success') {
                        // 整理数据结构，添加到一级类别数组
                        let category = {
                            id: 'design',
                            image: null,
                            name: '设计实验室',
                            showType: 'fixed',
                            childrenList: res_data.data,
                        };
                        material.category_array.push(category);
                    } else {
                        // 错误处理
                        material.states.loaderror = true;
                    }
                });
                let timer = setInterval(() => {
                    if (material_loaddone && design_loaddone && images_fast_loaddone) {
                        clearInterval(timer);
                        // 过滤id
                        let category = material.category_array.find(item => item.id === category_id);
                        if (typeof success_callback === 'function') success_callback(category);
                    }
                }, 100);
            } else {
                let category = material.category_array.find(item => item.id === category_id);
                if (typeof success_callback === 'function') success_callback(category);
            }
        },
        // 通用根据id获取分类
        commmon_get_category_by_id: function (obj, callback) {
            axios.get('/api/material/category/',{params: {id: obj.id, grade: obj.grade}}).then((res) => {
                let data = res.data;
                if(data.type === 'success'){
                    data = data.data;
                }
                if (typeof callback === 'function') callback(data);
            }).catch((err) => {
                console.error(err);
            });
        },
        // 通用获取标签接口
        common_get_tags: function (id, callback) {
            let tags_arr = []
            axios.get('/api/material/get_hot_tag/', {
                params: {
                    'cId': id,
                    'size': 500,
                },
            }).then((res) => {
                let res_data = res.data;
                if (res_data.type === 'success') {
                    tags_arr = res_data.data;
                } else {
                    // 错误处理
                    toast('标签获取失败！');
                }
                if (typeof callback === 'function') callback(tags_arr);
            }).catch((err) => {
                console.error(err);
            });
        },
        /**
         * 获取数据列表相关方法
         */
        // 通用获取数据列表接口，统一处理数据列表加载中、空列表、加载失败, basic => 图片是否需要转webp
        common_get_material: function (obj, basic) {
            let opt = {
                url: null,
                params: {},
                current_modal: {},
                beforeSend: null,
                success: null,
                error: null,
                complate: null,
            };
            opt = Object.assign(opt, obj);
            //中断前一次未响应请求
            material.cancel_axios();
            material.cancel_axios = function(){};
            // 状态更新
            material.states.search_empty = false;
            material.states.loaderror = false;
            material.states.loading = true;
            if (typeof opt.beforeSend === 'function') opt.beforeSend();
            let url = opt.url || '/api/material/list/';
            const CancelToken = axios_2.CancelToken;
            axios.get(url, {
                params: opt.params,
                cancelToken:new CancelToken(function executor(c){
                    material.cancel_axios = c;
                })
            }).then((res) => {
                // 状态更新
                material.states.loading = false;
                let res_data = res.data;
                if (res_data.type === 'success') {
                    // 合并收藏map对象
                    if (res_data.data.favoriteMap) {
                        material.favorite_map = Object.assign(material.favorite_map, res_data.data.favoriteMap);
                    }
                    if (res_data.data.dataList) {
                        if(!basic){
                            res_data.data.dataList = material.method.preview_towebp(res_data.data.dataList, opt.current_modal.base_conf.width);
                        }
                        res_data.data.dataList.forEach((item) => {
                            item['insertion'] = false;
                        });
                    }
                    if (res_data.data.recommendList && opt.params.tagName) {
                        material.states.search_empty = true;
                        res_data.data.recommendList.forEach((item) => {
                            item['insertion'] = false;
                        });
                    }
                    if (typeof opt.success === 'function') opt.success(res_data.data);
                } else {
                    // 错误处理
                    if(!opt.params.pageNumber || opt.params.pageNumber === 1) material.states.loaderror = true;//第一页错误才显示
                    if (typeof opt.error === 'function') opt.error();
                }
                if (typeof opt.complate === 'function') opt.complate();
            }).catch((err) => {
                if(axios_2.isCancel(err)){
                    return;
                }
                material.states.loading = false;
                if(!opt.params.pageNumber || opt.params.pageNumber === 1) material.states.loaderror = true;//第一页错误才显示
                if (typeof opt.error === 'function') opt.error();
                console.error(err);
            });
        },
        // 通用获取相关推荐列表
        common_get_recommend_list: function(id, callback) {
            axios.get('/api/material/recommend_list/',{
                params:{
                    'cid': id
                }
            }).then((res) => {
                let data = res.data;
                if(data.type === 'success') {
                    data = data.data;
                }
                if (typeof callback === 'function') callback(data);
            }).catch((err) => {
                console.log(err)
            })
        },
        // 通用获取我收藏的全套模板列表
        common_get_my_template: function (obj) {
            let opt = {
                url: null,
                params: {},
                current_modal: {},
                beforeSend: null,
                success: null,
                error: null,
                complate: null,
            };
            opt = Object.assign(opt, obj);
            //中断前一次未响应请求
            material.cancel_axios();
            material.cancel_axios = function(){};
            // 状态更新
            material.states.search_empty = false;
            material.states.loaderror = false;
            material.states.loading = true;
            if (typeof opt.beforeSend === 'function') opt.beforeSend();
            let url = opt.url || '/api/member/my_collect/';
            const CancelToken = axios_2.CancelToken;
            axios.get(url, {
                params: opt.params,
                cancelToken:new CancelToken(function executor(c){
                    material.cancel_axios = c;
                })
            }).then((res) => {
                // 状态更新
                material.states.loading = false;
                let res_data = res.data;
                if (res_data.type === 'success') {
                    if (res_data.data.length === 0) {
                        material.states.search_empty = true;
                    }
                    if (typeof opt.success === 'function') opt.success(res_data.data);
                } else {
                    // 错误处理
                    if (typeof opt.error === 'function') opt.error();
                }
                if (typeof opt.complate === 'function') opt.complate();
            }).catch((err) => {
                if(axios_2.isCancel(err)){
                    return;
                }
                material.states.loading = false;
                if (typeof opt.error === 'function') opt.error();
                console.error(err);
            });
        },
        /**
         * 素材相关操作
         */
        // 通用获取素材详情
        common_get_detail: function(id, callback) {
            axios.get('/api/material/detail/',{
                params:{
                    'mid': id
                }
            }).then((res) => {
                let data = res.data;
                if(data.type === 'success') {
                    data = data.data;
                }
                if (typeof callback === 'function') callback(data);
            }).catch((err) => {
                console.log(err)
            })
        },
        // 设置 素材 加入收藏 & 取消收藏
        common_material_favorite: function (id, callback) {
            let favorite_id = material.favorite_map[id];
            // 已收藏的素材，执行解除收藏
            let state = favorite_id ? 'delete' : 'save';
            axios.post(`/api/member/favorite/${state}/`, {
                'mid': id,
            }).then((res) => {
                let res_data = res.data;
                toast(res.data.content);
                if (res_data.type === 'success') {
                    if (typeof callback === 'function') callback(state, res_data.data);
                } else {
                    // 错误处理
                    if (state === 'delete') {
                        toast('取消收藏失败！');
                    } else {
                        toast('加入收藏失败！');
                    }
                }
            }).catch((err) => {
                console.error(err);
                toast('操作失败！');
            });
        },
        // 设置 模板 加入收藏 & 取消收藏
        common_template_favorite: function (id, callback) {
            let favorite_id = material.favorite_map[id];
            // 已收藏的模板，执行解除收藏
            let api_url = favorite_id ? '/api/member/delete_collect' : '/api/member/collection/';
            let state = favorite_id ? 'delete' : 'save';
            axios.post(api_url, {
                'documentId': id,
                'type': 'template',
            }).then((res) => {
                let res_data = res.data;
                toast(res.data.content);
                if (res_data.type === 'success') {
                    if (typeof callback === 'function') callback(state);
                } else {
                    // 错误处理
                    if (state === 'delete') {
                        toast('取消收藏失败！');
                    } else {
                        toast('加入收藏失败！');
                    }
                }
            }).catch((err) => {
                console.error(err);
                toast('操作失败！');
            });
        },
        // 通用素材插入获取数据接口
        common_material_append: function (item, material_status, success_callback) {
            if (!item) return false;
            if (!item.id) return false;
            if (material.states.appending) return toast('正在插入素材！');
            material.states.appending = true;
            item.insertion = true;
            // 处理最近使用、我的收藏、我的上传
            let url = '/api/material/detail/';
            let lately_used = 'material';
            switch (material_status) {
                case 'favorite':
                    url = '/api/member/favorite/detail/';
                    break;
                case 'myupload':
                    url = '/api/member/myupload/detail/';
                    lately_used = 'myUpload';
                    break;
            }
            axios.get(url, {
                params: {
                    'mid': item.id,
                },
            }).then((res) => {
                let res_data = res.data;
                let _data = res_data.data;
                item.insertion = false;
                if (res_data.type === 'success') {
                    let _html = null;
                    if (!_data['largeImage']) _data['largeImage'] = _data['image'];
                    // 最近使用 or 其他情况
                    if(lately_used === 'material'){
                        if(_data.type === 'image'){
                            // 图片格式为svg时，存储一张静态图
                            _html = JSON.parse(_data.html);
                            if (_html[0].url.slice(-3) === 'svg') {
                                _html[0].staticImage = _data.image;
                                _data.html = JSON.stringify(_html);
                            }
                        }
                    }else
                    // 我的上传区分 图片 视频 音频
                    if(lately_used === 'myUpload'){
                        _html = JSON.parse(_data.html);
                        switch(_data.type){
                            case 'image':
                                // 图片格式为svg时，存储一张静态图
                                if (_html[0].url.slice(-3) === 'svg') {
                                    _html[0].staticImage = _data.image;
                                    _data.html = JSON.stringify(_html);
                                }
                                break;
                            case 'video':
                                _data.videoSrc = _html[0].src;
                                break;
                            case 'audio':
                                _data.audioSrc = _html[0].src;
                                break;
                        }
                    }
                    if (typeof success_callback === 'function') success_callback(_data);
                    this.common_lately_used(_data, lately_used);
                } else {
                    // 错误处理
                    toast('图片插入失败！');
                }
                setTimeout(() => {
                    material.states.appending = false;
                }, 500);
            }).catch((err) => {
                item.insertion = false;
                toast('图片插入失败！');
                console.error(err);
                setTimeout(() => {
                    material.states.appending = false;
                }, 500);
            });
        },
        // 通用模板插入获取数据接口
        common_template_append: function (item, success_callback) {
            if (!item) return false;
            if (!item.id) return false;
            if (material.states.appending) return toast('正在插入素材！');
            material.states.appending = true;
            item.insertion = true;
            axios.get(`/api/template/detail/${item.templateId?item.templateId:item.id}/`).then((res) => {
                let res_data = res.data;
                item.insertion = false;
                if (res_data.type === 'success') {
                    if (typeof success_callback === 'function') success_callback(res_data.data);
                } else {
                    // 错误处理
                    toast('图片插入失败！');
                }
                setTimeout(() => {
                    material.states.appending = false;
                }, 500);
            }).catch((err) => {
                item.insertion = false;
                toast('图片插入失败！');
                console.error(err);
                setTimeout(() => {
                    material.states.appending = false;
                }, 500);
            });
        },
        // 通用站外素材插入
        common_outside_material_append: function (item, success_callback) {
            // 获取图片文件流
            if (!item) return false;
            if (!item.images) return false;
            // original = 原图  large = 大图  small = 小图  tiny = 最小图
            let src = item.images.large || '';
            if (!src) return false;
            if (material.states.appending) return toast('正在插入素材！');
            material.states.appending = true;
            // 正在插入图片 蒙层状态，response success 后需在回调中解除
            item.insertion = true;
            axios({
                method: 'get',
                url: src,
                responseType: 'blob',
                timeout: 100000,
            }).then((res) => {
            let res_data = res.data;
            // res_data = blob 文件格式
            if (res_data) {
                if (typeof success_callback === 'function') success_callback(res_data);
            } else {
                // 错误处理
                toast('图片插入失败！');
                item.insertion = false;
            }
            material.states.appending = false;
        }).catch((err) => {
            material.states.appending = false;
            item.insertion = false;
            toast('图片插入失败！');
            console.error(err);
        });
        },
        // 通用 我的上传图片删除
        common_myupload_material_delete: function (id, callback) {
            if (!id) return false;
            axios.post('/api/member/myupload/delete/', {
                'mid': id,
            }).then((res) => {
                let res_data = res.data;
                if (res_data.type === 'success') {
                    toast("删除成功~");
                    if (typeof callback === 'function') callback();
                } else {
                    // 错误处理
                    toast("删除失败！");
                }
            }).catch((err) => {
                toast("删除失败！");
                console.error(err);
            });
        },
        // 图片上传到服务器 -> 生成图片数据对象 -> 插入节点到画布 -> 添加到我的上传
        common_image_upload: function (that, opt) {
            let params = {
                file: null,
                name: null,
                loaddone: null,
                builddone: null,
                addmydone: null,
                error: null,
            };
            params = Object.assign(params, opt);
            if (!params.file) return false;
            // 1.上传图片到阿里云
            let option = opt_factory.init_opt('img');
            option.image_upload(params.file, params.name).then((data) => {
                if(data && data.indexOf("?") >= 0){
                    let index = data.indexOf("?");
                    index = index == -1 ? data.length : index;
                    data = data.substring(0,index);
                }
                if (typeof params.loaddone === 'function') params.loaddone(data);
                // 2.生成图片对象
                option.build_obj(data).then((template) => {
                    // 3.生成dom
                    template = that.EditView.ele_build_before_format(template);
                    // 获取节点 html
                    let ele_html = option.build(template);
                    let $ele = $(ele_html);
                    if (typeof params.builddone === 'function') params.builddone($ele, template, option);
                    // 4.添加到用户上传
                    option.add_myupload(template, params.file).then((img) => {
                        if (typeof params.addmydone === 'function') params.addmydone(img);
                        // 添加到最近使用
                        let add_myupload_data = img.data;
                        if (add_myupload_data.type === 'success') {
                            this.common_lately_used(add_myupload_data.data, 'myUpload');
                        }
                    }).catch(err => {
                        if (typeof params.error === 'function') params.error();
                        console.error(err);
                    });
                }).catch(err => {
                    if (typeof params.error === 'function') params.error();
                    console.error(err);
                });
            }).catch(err => {
                if (typeof params.error === 'function') params.error();
                console.error(err);
            });
        },
        // 通用素材添加到最近使用列表，type = material || myUpload
        common_lately_used: function (data, type, callback) {
            if (!data) return false;
            if (!data.id) return false;
            // 过滤非image元素不添加到最近使用，myUpload无需校验元素类型
            if (type !== 'myUpload') {
                if (data.type && data.type !== 'image') return false;
            }
            axios.post('/api/member/lately_used/save/', {
                correlationId: data.id,
                type: type || 'material',
            }).then((res) => {
                let res_data = res.data;
                if (typeof callback === 'function') callback(res_data);
            }).catch((err) => {
                console.error(err);
            });
        },
    }
}
export default material;
