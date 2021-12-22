<template>
    <div class="design-view">

        <div class="centent-wraper" @scroll="wrapRoll($event)">

            <!-- 主体内容 -->
            <div class="design-centent">
                <!-- banner区域 -->
                <div class="banner">
                    <div class="main">
                        <h1>吾道设计实验室</h1>
                        <!-- 搜索 -->
                        <template-search class="template-search" v-model="keyword" @search="searchDesign()" @input="getKeywordList()" save-key="wodoo_design_lately_list" :keyword-list="keyword_list" :recommend-list="search_recommend"></template-search>
                        <!-- 大家都在搜 -->
                        <div class="recommend-keyword">
                            <span>人人都在搜：</span>
                            <ul>
                                <li v-for="item in recommendKeyword" :key="item" @click="selectRecommend(item)">{{item}}</li>
                            </ul>
                        </div>
                    </div>
                </div>
                <!-- banner区域 end-->

                <!-- 渲染数据区域 -->
                <div class="design-main">
                    <!-- 有搜索时显示 -->
                    <div ref="search_content" class="search-content" v-if="is_search">
                        <template v-if="template_list_data && template_list_data.length">
                            <design-card :absolute="true" v-for="item in template_list_data" :key="item.id" :template-info="item" :favorite-map.sync="favorite_map" @preview="preview(item)"></design-card>
                        </template>
                        <!-- 空状态 -->
                        <template v-else>
                            <div class="empty">
                                <div class="bg"></div>
                                <p>抱歉~没有找到你要的模板!</p>
                                <div class="other-btn">
                                    <a href="/template/demand/" class="command">提交需求</a>
                                    <a class="feedback" @click="toggleServiceQrcode()">加群反馈</a>
                                </div>
                                <transition name="modal-fade">
                                    <div class="service-contain" v-show="show_service_code" @click.stop="toggleServiceQrcode()">
                                        <div class="service-panel">
                                            <img class="service-qrcode" :src="service_qrcode" alt="" />
                                            <base-logo type="code" width="35" height="35"></base-logo>
                                        </div>
                                    </div>
                                </transition>

                                <!-- 大家都在用 模板列表 -->
                                <div class="search-result-title">
                                    <p class="hot-title">大家都在用</p>
                                </div>
                                <div ref="hot_list" class="template-hot-list">
                                    <design-card v-for="item in hot_template_list" :key="item.id" :template-info="item" :favorite-map.sync="favorite_map" @preview="preview(item)"></design-card>
                                </div>
                            </div>
                        </template>
                    </div>

                    <!-- 无搜索时显示 -->
                    <div class="centent-mian" v-else>
                        <div class="centent-head">
                            <nav-cards-group></nav-cards-group>
                        </div>

                        <!-- 二级分类内容 -->
                        <div class="centent-center" v-if="design_list_data.length">
                            <div class="second-group" v-for="item in design_list_data" :key="item.id">
                                <div class="header">
                                    <div class="title">{{item.name}}</div>
                                    <router-link class="all" :to="{ path: '/design/detail/', query:{second_cid: item.id} }" v-show="item.show">查看全部</router-link>
                                </div>
                                <div class="list">
                                    <card-swiper @seeMore="seeMoreDesign(item.id)" @showNextBtn="showNextBtn(arguments, item.id)">
                                        <template slot="cards">
                                            <design-card v-for="v in item.dataList" :key="v.id" :template-info="v" :favorite-map.sync="favorite_map" @preview="preview(v)"></design-card>
                                        </template>
                                    </card-swiper>
                                </div>
                            </div>
                        </div>
                        <!-- 骨架图 -->
                        <div class="centent-center" v-else>
                            <div class="second-group" v-for="item in 6" :key="item">
                                <div class="header">
                                    <div class="title">&nbsp;</div>
                                    <router-link class="all" :to="{ path: '/design/'}">&nbsp;</router-link>
                                </div>
                                <div class="list">
                                    <card-swiper>
                                        <template slot="cards">
                                            <design-card v-for="v in 8" :key="v" card-class="skeleton"></design-card>
                                        </template>
                                    </card-swiper>
                                </div>
                            </div>
                        </div>
                        <!-- 二级分类内容 end -->

                    </div>

                </div>
                <!-- 渲染数据区域 end-->

                <div class="design-bottom" @click="seeMoreTemplate">查看更多模板 &gt;</div>
            </div>

            <design-preview-modal ref="design_preview_modal"></design-preview-modal>
        </div>
    </div>
</template>


<script>
import TemplateSearch from '@/components/TemplateSearch.vue';
import CardSwiper from '@/components/CardSwiper.vue';
import NavCardsGroup from '@/components/NavCardsGroup.vue';
import DesignCard from '@/views/pc/Design/DesignCard.vue';
import DesignPreviewModal from '@/views/pc/Design/DesignPreviewModal.vue';

export default {
    components: {
        TemplateSearch,
        CardSwiper,
        NavCardsGroup,
        DesignCard,
        DesignPreviewModal,
    },
    data() {
        return {
            is_search: false, // 是否在搜索

            keyword: '', // 搜索框内容
            keyword_list: [], // 关键词匹配列表
            search_recommend: ['年终总结', '日报', '演讲', '计划书', '产品', '宣传'], // 搜索框的热门搜索

            favorite_map: {}, // 收藏数据
            design_list_data: [], // 设计实验室分类列表数据

            now_keyword: '', // 当前列表数据关键字 滚轮滚到底部的时候使用此关键字来搜索 拿到数据的第二页
            template_list_data: [], // 列表数据
            page_number: 1, // 当前页码
            total_pages: null, // 总页数

            service_qrcode: '', // 吾道交流群二维码
            show_service_code: false, // 吾道交流群二维码模态框显示

            hot_template_list: [], // 大家都在用 模板数据
        }
    },
    mounted() {
        this.getRecommendList(6);
        this.getDesignData();

    },
    computed: {
        // 大家都在搜列表
        recommendKeyword() {
            return this.search_recommend.slice(0, 5);
        }
    },
    watch: {
        template_list_data(newVal) {
            if (Array.isArray(newVal) && !newVal.length) {
                this.getHotTemplate();
                window.addEventListener('resize', () => {
                    if(this.template_list_data.length) return;
                    this.getHotTemplate();
                });
            }
        }
    },
    methods: {
        // 获取关键词列表
        getKeywordList() {
            if (!this.keyword) {
                this.is_search = false;
                return false;
            }
            this.$axios({ url: '/api/template/associated_word/', params: { type: 'design', word: this.keyword } }).then(res => {
                let { code, data } = res.data;
                if (code !== '2') return;
                this.keyword_list = data;
            });
        },
        // 获取热门搜索关键词列表
        getRecommendList(count) {
            // count: 返回数量
            this.$axios({ url: '/api/common/hot_search/', params: { id: 27, count } }).then(res => {
                let { code, data } = res.data;
                if (code !== '2' || !data.length) return;
                this.search_recommend.splice(-data.length);
                this.search_recommend.push(...data)
            });
        },
        // 选择热门关键字
        selectRecommend(word) {
            if (this.keyword === word) return false;
            this.keyword = word;
            // 搜索
            this.searchDesign();
        },
        // 获取设计实验室分类列表数据
        getDesignData() {
            this.$axios({ url: '/api/template/design_second_template/' }).then(res => {
                let { code, data } = res.data;
                if (code !== '2') return;
                this.favorite_map = data.favoriteMap
                let data_obj = data.dataList;
                let data_arr = [];
                for (let k in data_obj) {
                    data_obj[k].name = k;
                    data_arr.push(data_obj[k]);
                }
                data_arr = data_arr.filter(v => v.dataList && v.dataList.length);
                data_arr = data_arr.map(v => {
                    v.dataList = this.computedLazy(v.dataList, 292);
                    v.show = true; // 控制每种分类的【查看全部】是否显示
                    return v;
                });
                this.design_list_data = data_arr;
            });
        },
        // 预览
        preview(item) {
            let { id } = item;
            this.$refs.design_preview_modal.show(id);
        },
        // 搜索
        searchDesign() {
            if (!this.keyword) return false;
            this.page_number = 1;
            this.total_pages = null;
            this.now_keyword = this.keyword;
            this.getTemplateList();
            this.is_search = true;
        },
        // 获取模板数据
        getTemplateList(obj) {
            // 总页数存在 且 当前页数 > 总页数
            if (this.total_pages !== null && this.page_number > this.total_pages) return false;

            // 默认参数
            let default_params = {
                pageSize: 20, // 每页的数据量
                pageNumber: this.page_number, // 当前页码
                type: 'design',// 模板类型(slides、design)
                searchValue: this.now_keyword // 关键字（会模糊查询模版名称和标签）
            }
            let params = Object.assign(default_params, obj || {});

            this.$axios({ url: '/api/template/list/', params }).then(res => {
                let { code, data } = res.data;
                if (code !== '2') return;
                this.total_pages = data.totalPages;
                this.favorite_map = data.favoriteMap
                let el = this.$refs['search_content'];
                // 大于一页 === 滚动到底部
                if (this.page_number > 1) {
                    this.template_list_data.push(...data.dataList);
                } else {
                    this.template_list_data = data.dataList;
                }
                this.template_list_data = this.flowLayout(this.template_list_data, el, el);
                window.addEventListener('resize', () => {
                    this.template_list_data = this.flowLayout(this.template_list_data, el, el);
                });
            });
        },
        // 滚动
        wrapRoll(e) {
            // 滚动到底部获取更多模板列表数据
            if (e.target.scrollHeight - e.target.scrollTop <= e.target.clientHeight) {
                this.page_number++;
                this.getTemplateList();
            }
        },
        // 流式布局
        flowLayout(list, el, roll_cont) {
            let obj = {
                el: $(el),
                width: 240,
                height: 9 / 16 * 240,
                offset: 10, // 卡片上间距
                offset_left: 5, // 整体横向偏移
                offset_top: 0, // 整体纵向偏移
                other_height: 30, // 其他内容的高度
            };
            let array = [];
            if (!obj.el) return array;
            if (!Array.isArray(list)) return array;
            let contain_width = obj.el.width();
            let $scroll_contain = $(roll_cont);
            // 计算一行可放的个数，多出的空间再平分加上， ~~向下取整
            let row_number = ~~((contain_width + obj.offset) / (obj.width + obj.offset));
            if (row_number === 0) return array;
            // 更新 width height
            let item_width = ~~((contain_width - row_number * (obj.width + obj.offset)) / row_number + obj.width);
            let item_height = ~~(obj.height / obj.width * item_width);
            let max_value = [];
            // 过滤没有宽高的模板
            list = list.filter(item => {
                try {
                    let attr = JSON.parse(item.attr);
                    return !!(attr && attr.width && attr.height);
                } catch (error) { }
            });
            // 瀑布流显示
            array = list.map((item, index, self) => {
                let attr = JSON.parse(item.attr);
                item.width = attr.width;
                item.height = attr.height;
                let ratio = item.width / item.height;
                item['_width'] = item_width;
                item_height = item_width / ratio;
                item['_height'] = item_height + obj.other_height;
                if (item_height < 120) item['direction'] = 'horizontal';
                /**
                 * 瀑布流实现
                 */
                // 当前所在列
                let current_col = index % row_number;
                // 获取当前元素之前的5行
                let before_item = [];
                for (let i = row_number * 5; i > 0; i--) {
                    let before_i = self[index - i];
                    if (before_i) before_item.push(before_i);
                };
                before_item = utils.deepClone(before_item);

                // 第一行元素正常排序
                if (index < row_number) {
                    item['_top'] = obj.offset_top;
                    item['_left'] = (item_width + obj.offset) * current_col + obj.offset_left;
                } else {
                    /**
                     * 从第二行起，获取到之前的10个元素数组（js对10以内的数组使用插入排序）；
                     * 根据 top + height 从小到大排序，然后截取最后一行的个数，拿到第一个；
                     * 获取到的第一个为前面5行元素的最短列，根据这个元素的 top & left 计算当前元素的 top & left
                     */
                    before_item.insertSort((a, b) => {
                        let result = 0;
                        let aHeight = a['_top'] + a['_height'];
                        let bHeight = b['_top'] + b['_height'];
                        if (aHeight - bHeight > 5) {
                            result = 1;
                        } else if (aHeight - bHeight < -5) {
                            result = -1;
                        }
                        return result;
                    });
                    before_item = before_item.slice(-row_number);
                    item['_top'] = before_item[0]['_top'] + before_item[0]['_height'] + obj.offset;
                    item['_left'] = before_item[0]['_left'];
                }
                /**
                 * 瀑布流实现 end
                 */
                // 计算最高数值
                max_value.push(item['_top'] + item['_height']);
                return item;
            });
            // 容器高度设置
            $scroll_contain.css({
                height: `${Math.max.apply(null, max_value) + 100}px`
            })
            return JSON.parse(JSON.stringify(array));
        },
        // 分类列表懒加载图片的高度
        computedLazy(listArr, w) {
            let list = listArr.filter(v => v.attr);
            return list.map(item => {
                let attr = JSON.parse(item.attr);
                item.lazy_h = w / (attr.width / attr.height);
                return item;
            });
        },
        // 加群反馈
        toggleServiceQrcode() {
            this.service_qrcode = `https://file.woodo.cn/upload/foreverImage/kefu_qrcode.png?v=${new Date().getTime()}`;
            this.show_service_code = !this.show_service_code;
            if (this.show_service_code) {
                $('body').css('overflow', 'hidden');
            } else {
                $('body').css('overflow', '');
            }
        },
        // 获取最热模板
        getHotTemplate() {
            let params = {
                type: 'design',
                sort: 'hot'
            }
            this.$axios({ url: '/api/template/list/', params }).then(res => {
                let { code, data } = res.data;
                if (code !== '2') return;
                this.hot_template_list = data.dataList;
                this.$nextTick(() => {
                    let hot_el = this.$refs['hot_list'];
                    let hot_item_w = hot_el.children[0].offsetWidth;
                    let row_num = ~~(hot_el.offsetWidth / hot_item_w);
                    this.hot_template_list = data.dataList.slice(0, row_num * 2);
                });
            });

        },
        // 查看更多模板跳转
        seeMoreTemplate() {
            this.$router.push({ path: '/design/detail/' });
        },
        seeMoreDesign(id) {
            this.$router.push({ path: '/design/detail/', query:{ second_cid: id } });
        },
        showNextBtn(value, id) {
            this.design_list_data.forEach(item => {
                if (item.id === id) item.show = value[0];
            });
        }
    },
    metaInfo() {
        return {
            title: '吾道-设计实验室',
            meta: [
                {
                    property: 'og:title',
                    content: '吾道-设计实验室'
                },
                {
                    property: 'og:url',
                    content: 'https://www.woodo.cn/template/'
                },
            ]
        };
    }
}
</script>

<style lang="less" scoped>
.design-view {
    width: 100%;
    min-width: 1240px;
    height: 100%;
    background: #f6f6f9;

    .centent-wraper {
        padding: 0 35px;
        overflow: auto;
        height: 100%;

        .design-centent {
            width: 100%;

            .banner {
                display: flex;
                justify-content: center;
                align-items: center;
                margin: 0 auto;
                width: 100%;
                height: 300px;
                background-image: url('~@/assets/pc/images/template/design_banner.png');
                background-repeat: no-repeat;
                background-size: 100% 100%;
                border-radius: 4px;

                .main {
                    width: 540px;
                    h1 {
                        font-size: 36px;
                        font-weight: 700;
                        text-align: center;
                        color: #ffffff;
                    }
                    .template-search {
                        margin-top: 20px;
                    }
                    .recommend-keyword {
                        display: flex;
                        justify-content: center;
                        margin: 0 auto;
                        margin-top: 18px;
                        font-size: 14px;
                        span {
                            color: #ffffff;
                        }
                        ul {
                            display: flex;
                            li {
                                margin-left: 10px;
                                max-width: 100px;
                                color: #c5c5c5;
                                overflow: hidden;
                                text-overflow: ellipsis;
                                white-space: nowrap;
                                cursor: pointer;
                                &:hover {
                                    color: #ffffff;
                                }
                            }
                        }
                    }
                }
            }

            .design-main {
                .search-content {
                    position: relative;
                    display: flex;
                    justify-content: space-between;
                    flex-wrap: wrap;
                    margin-top: 30px;
                    width: 100%;

                    .empty {
                        width: 100%;
                        height: 100% !important;
                        padding: 65px 0;
                        .bg {
                            width: 200px;
                            height: 200px;
                            margin: 0 auto;
                            border-radius: 50%;
                            background: #fff
                                url('~@/assets/common/images/empty_1.png')
                                center no-repeat;
                            background-size: contain;
                            background-position-y: -3px;
                        }
                        > p {
                            margin-top: 12px;
                            text-align: center;
                            font-size: 14px;
                            color: #3c3c3c;
                        }
                        .other-btn {
                            width: 100%;
                            height: 40px;
                            margin-top: 30px;
                            text-align: center;
                            a {
                                margin-top: 0;
                                display: inline-block;
                                vertical-align: top;
                                width: 120px;
                                height: 40px;
                                line-height: 40px;
                                text-align: center;
                                font-size: 14px;
                                color: #333333;
                                border-radius: 20px;
                                background: #fff;
                                &:hover {
                                    color: #ffffff;
                                    background: #005fff;
                                }
                            }
                            .command {
                                margin-right: 19px;
                            }
                        }
                        .service-contain {
                            position: fixed;
                            top: 0;
                            left: 0;
                            width: 100%;
                            height: 100%;
                            line-height: 100%;
                            background: rgba(0, 0, 0, 0.55);
                            text-align: center;
                            z-index: 20;
                            .service-panel {
                                position: absolute;
                                top: 0;
                                right: 0;
                                bottom: 0;
                                left: 0;
                                margin: auto;
                                width: 320px;
                                height: 457px;
                                box-shadow: 0px 3px 10px 0px
                                    rgba(67, 67, 67, 0.15);
                                background: url('~@/assets/pc/images/common/custom_service_bg.png')
                                    no-repeat center center;
                                img:not(.base-logo) {
                                    position: absolute;
                                    top: 200px;
                                    left: 85px;
                                    width: 150px;
                                    height: 150px;
                                    padding: 8px;
                                    background-color: #ffffff;
                                    border-radius: 4px;
                                }
                                .base-logo {
                                    position: absolute;
                                    top: 257px;
                                    left: 142px;
                                    z-index: 1;
                                }
                            }
                        }
                        .search-result-title {
                            margin-top: 80px;
                            width: 100%;
                            height: 22px;
                            line-height: 22px;
                            .hot-title {
                                font-size: 22px;
                                font-weight: 700;
                                color: #000000;
                            }
                        }
                        .template-hot-list {
                            padding-bottom: 50px;
                            display: flex;
                            justify-content: space-between;
                            flex-wrap: wrap;
                            width: calc(100% + 30px);
                            min-height: auto;
                            .template-card {
                                margin-top: 30px;
                                margin-right: 30px;
                                min-width: 300px;
                                max-width: 418px;
                                flex: 1;
                                align-self: flex-start;
                            }
                        }
                    }
                }

                .centent-mian {
                    .centent-head {
                        padding: 30px 0;
                        border-bottom: 1px solid #e5e5e5;
                        .main {
                            display: flex;
                            height: 231px;
                        }
                    }
                    .centent-center {
                        padding-top: 30px;
                        .second-group {
                            margin-bottom: 50px;
                            .header {
                                display: flex;
                                justify-content: space-between;
                                align-items: center;
                                .title {
                                    font-size: 22px;
                                    font-weight: 700;
                                    color: #000000;
                                }
                                .all {
                                    font-size: 12px;
                                    color: #999999;
                                    &:hover {
                                        opacity: 0.8;
                                    }
                                }
                            }
                            .list {
                                .card-swiper {
                                    /deep/ button {
                                        top: 47%;
                                    }
                                }
                                .design-card {
                                    padding-top: 20px;
                                    min-width: 292px;
                                    max-width: 220px;
                                    &:nth-of-type(n + 2) {
                                        margin-left: 30px;
                                    }
                                }
                                .skeleton {
                                    width: 250px;
                                    &::before {
                                        content: '';
                                        display: block;
                                        padding-top: 50%;
                                    }
                                }
                            }
                        }
                    }
                }
            }

            .design-bottom {
                width: 190px;
                height: 50px;
                margin: 0 auto 30px;
                background-color: #ffffff;
                cursor: pointer;
                text-align: center;
                line-height: 50px;
                color: #999999;
                &:hover {
                    background-color: var(--mainColor);
                    color: #ffffff;
                }
            }
        }
    }
}
</style>