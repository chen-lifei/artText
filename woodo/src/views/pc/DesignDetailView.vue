<template>
    <div class="design-detail">
        <div class="centent-wraper" @scroll="wrapRoll($event)">

            <!-- 主体内容 -->
            <div class="detail-centent">

                <div class="detail-top">
                    <router-link tag="div" class="back-nav" to="/design/">
                        <base-icon class="iconfanhuishangye"></base-icon><span>返回设计实验室</span>
                    </router-link>
                </div>

                <div class="detail-header">
                    <div class="select-list">
                        <span>全部：</span>
                        <ul>
                            <li :class="{ current: !first_cid }" @click="selectFirstCategory()">全部</li>
                            <li :class="{ current: first_cid === item.id }" v-for="item in first_select_list" :key="item.id" @click="selectFirstCategory(item)">{{item.name}}</li>
                        </ul>
                    </div>
                    <div class="select-list" v-if="second_select_list.length">
                        <span>分类：</span>
                        <ul>
                            <li :class="{ current: second_cid === item.id }" v-for="item in second_select_list" :key="item.id" @click="selectSecondCategory(item)">{{item.name}}</li>
                        </ul>
                    </div>
                </div>

                <!-- 渲染数据区域 -->
                <div ref="detail_main" class="detail-main">
                    <template v-if="template_list && template_list.length > 0">
                        <design-card :absolute="true" v-for="item in template_list" :key="item.id" :template-info="item" :favorite-map.sync="favorite_map" @preview="preview(item)"></design-card>
                    </template>
                    <!-- 空状态 -->
                    <div class="empty" v-else>
                        <div class="empty-img"></div>
                        <span>没有任何模板</span>
                    </div>
                </div>
                <!-- 渲染数据区域 end-->
            </div>
        </div>
        <design-preview-modal ref="design_preview_modal"></design-preview-modal>
    </div>
</template>

<script>
import DesignCard from '@/views/pc/Design/DesignCard.vue';
import DesignPreviewModal from '@/views/pc/Design/DesignPreviewModal.vue';
export default {
    components: {
        DesignCard,
        DesignPreviewModal
    },
    data() {
        return {
            isLoading: false,
            first_cid: null,// 一级id
            first_select_list: [], // 一级分类数据
            second_cid: null,// 二级id
            second_select_list: [],// 二级分类数据

            template_list: [], // 模板数据
            favorite_map: {}, // 收藏id数据
            page_number: 1, // 当前页
            total_pages: 0 // 模板列表总页数
        }
    },
    created() {
        this.init();
    },
    mounted() {
        this.getDesignCategory();
    },
    methods: {
        // 初始化
        init() {
            let { first_cid, second_cid } = this.$route.query;
            if (first_cid) this.first_cid = parseFloat(first_cid);
            if (second_cid) this.second_cid = parseFloat(second_cid);
        },
        // 获取分类
        getDesignCategory() {
            this.$axios({ url: '/api/template/category/', params: { type: 'design' } }).then(res => {
                let { code, data } = res.data;
                if (code !== '2') return;
                this.first_select_list = data;

                if (this.first_cid) {
                    this.second_select_list = this.first_select_list.find(v => v.id == this.first_cid).childrenList;
                }

                if (this.second_cid) {
                    this.first_select_list.find(item => {
                        if (!item.childrenList) return false;
                        let result = item.childrenList.find(v => v.id == this.second_cid);
                        if (!result) return false;
                        this.first_cid = item.id;
                        this.second_select_list = item.childrenList;
                        return true;
                    });
                }
                this.getTemplateList();
            });
        },
        // 选择一级分类
        selectFirstCategory(item) {
            if (!item) {
                // 选择全部
                this.first_cid = null;
                this.second_select_list = []
            } else {
                // 选择一级分类
                this.first_cid = item.id;
                this.$route.query.first_cid = item.id;
                this.second_select_list = item.childrenList || [];
            }
            // 改变地址栏参数不刷新页面
            let newUrl = this.$route.path + (this.first_cid ? `?first_cid=${this.first_cid}` : '');
            window.history.replaceState('', '', newUrl);

            this.second_cid = null;
            this.page_number = 1;
            this.getTemplateList();
        },
        // 选择二级分类
        selectSecondCategory(item) {
            this.second_cid = item.id;
            // 改变地址栏参数不刷新页面
            let newUrl = this.$route.path + `?second_cid=${this.second_cid}`;
            window.history.replaceState('', '', newUrl);

            this.page_number = 1;
            this.getTemplateList();
        },
        // 获取模板数据
        getTemplateList(scroll) {
            // 总页数 > 1 且 当前页数 >= 总页数
            if (scroll && (this.total_pages === 1 || this.page_number >= this.total_pages)) return;
            if (scroll) this.page_number++;

            let params = {
                type: 'design',
                pageNumber: this.page_number
            };

            let cid = this.second_cid || this.first_cid;
            if (cid) params.cid = cid;

            this.isLoading = true;
            this.$axios({ url: '/api/template/list/', params }).then(res => {
                let { code, data } = res.data;
                if (code !== '2') return;
                this.total_pages = data.totalPages;
                this.favorite_map = data.favoriteMap;
                this.isLoading = false;
                let el = this.$refs['detail_main'];
                let roll_cont = this.$refs['detail_main'];

                // 大于一页 === 滚动到底部
                if (this.page_number > 1) {
                    this.template_list.push(...data.dataList);
                } else {
                    this.template_list = data.dataList;
                }
                this.template_list = this.flowLayout(this.template_list, el, roll_cont);
                this.$nextTick(() => {
                    if ($(`.detail-centent`).height() + $(`.nav-head-main-contain`).height() < $(`.centent-wraper`).height() + 30 && data.totalPages > 1) {
                        this.getTemplateList(true);
                    }
                })
                window.addEventListener('resize', () => {
                    this.template_list = this.flowLayout(this.template_list, el, roll_cont);
                });
            });
        },
        // 预览
        preview(item) {
            let { id } = item;
            this.$refs.design_preview_modal.show(id);
        },
        // 滚动
        wrapRoll(e) {
            // 滚动到底部获取更多模板列表数据
            if (e.target.scrollHeight - e.target.scrollTop <= e.target.clientHeight + 100 && !this.isLoading) {
                this.getTemplateList(true);
            }
        },
        // 流式布局
        flowLayout(list, el, roll_cont) {
            let obj = {
                el: $(el),
                width: 240,
                height: 9 / 16 * 240,
                offset: 25, // 卡片上间距
                offset_left: 0, // 整体横向偏移
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
                    if (before_i) {
                        before_item.push(before_i);
                    }
                };
                before_item = utils.deepClone(before_item);
                // 第一行元素正常排序
                if (before_item.length < row_number) {
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
            });
            if (!array.length) $scroll_contain.removeAttr('style');
            return JSON.parse(JSON.stringify(array));
        }
    }
}
</script>

<style lang="less" scoped>
.design-detail {
    width: 100%;
    min-width: 1240px;
    height: 100%;
    background: #f6f6f9;

    .centent-wraper {
        padding: 0 35px;
        overflow: auto;
        height: 100%;

        .detail-centent {
            width: 100%;

            .detail-top {
                display: flex;
                align-items: center;
                .back-nav {
                    display: inline-block;
                    height: 20px;
                    line-height: 20px;
                    font-size: 14px;
                    color: #767684;
                    cursor: pointer;
                    span {
                        padding-left: 12px;
                    }
                }
            }

            .detail-header {
                padding: 20px 30px;
                margin-top: 10px;
                background: #ffffff;
                .select-list {
                    display: flex;
                    align-items: center;
                    height: 60px;
                    font-size: 14px;

                    ul {
                        display: flex;
                        li {
                            padding: 10px 20px;
                            color: #333333;
                            border-radius: 5px;
                            cursor: pointer;
                            &.current {
                                color: var(--mainColor);
                                background: rgba(0, 95, 255, 0.1);
                            }
                            &:hover {
                                color: var(--mainColor);
                            }
                        }
                    }
                }
            }

            .detail-main {
                position: relative;
                display: flex;
                justify-content: space-between;
                flex-wrap: wrap;
                margin-top: 30px;
                width: 100%;
                .empty {
                    padding: 40px 0;
                    width: 100%;
                    text-align: center;
                    .empty-img {
                        display: block;
                        width: 100%;
                        height: 300px;
                        margin-bottom: 10px;
                        background: url(~@/assets/common/images/empty.png)
                            no-repeat top center;
                        background-size: contain;
                    }
                    span {
                        font-size: 14px;
                        color: #838f9f;
                    }
                }
            }
        }
    }
}
</style>