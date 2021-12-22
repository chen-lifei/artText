<template>
    <div class="design-list-main">
        <!-- 空状态 -->
        <div class="empty" v-if="!designList.length && !isLoading">
            <img src="@/assets/images/empty-2.png" alt="" />
            <p>没有找到符合您筛选条件的视频</p>
        </div>
        <!-- 页面主体 -->
        <template v-else-if="designList.length">
            <base-list
                ref="baseList"
                :scroll="scrollElement"
                :loadType="scrollElement ? 'scroll' : 'false'"
                :list="designList"
                :type="listConfig.type || 'fixed'"
                :max-line="isRecommend ? 2 : ''"
                :min-row="listConfig.minRow"
                :card-width="listConfig.width"
                :card-height="listConfig.height"
                :card-offset-x="listConfig.offsetX"
                :card-offset-y="listConfig.offsetY"
                :heightFix="listConfig.heightFix"
                @scrollLoad="loadMore"
            >
                <template #default="{ item }">
                    <component :is="components" :card-info="item" :favorite-id="favoriteList[item.id]" :customClick="customClick" @click="preview" ref="childList"></component>
                </template>
            </base-list>
        </template>
    </div>
</template>

<script>
export default {
    name: "DesignList",
    props: {
        designType: String,
        keyword: String,
        category: String,
        scrollElement: String,
        customClick: Boolean,
        isRecommend: Boolean
    },
    data() {
        return {
            components: '',
            isLoading: false,
            listConfig: {
                type: 'fixed',
                minRow: 3,
                width: 330,
                height: 150,
                offsetX: 20,
                offsetY: 20,
                heightFix: false
            },
            designList: [],
            favoriteList: {},
            designApi: null,
        }
    },
    watch: {
        designType() {
            this.isLoading = true;
            this.designList = new Array(40).fill(1).map((item,index)=> index);
            this.int();
        },
    },
    created() {
        this.int();
    },
    methods: {
        // 初始化
        int() {
            // 获取对应卡片组件
            let type = this.designType.toLowerCase().replace(/( |^)[a-z]/g, (L) => L.toUpperCase());
            this.components = () => import(`@/views/Design/components/${type}Card.vue`);
            if (this.category === 'first' || this.category === 'second') {
                this.isLoading = true;
                return;
            };
            // 获取素材列表
            if (this.designType === 'template') {
                this.getTemplateList();
            } else {
                this.getDesignList();
            }
        },
        getListConfig() {
            // 重置列表配置
            let listConfig = {
                type: 'contourWaterfall',
                minRow: 4,
                width: 400,
                height: 400,
                offsetX: 20,
                offsetY: 20,
                heightFix: false
            }
            switch (this.designType) {
                case 'template':
                    listConfig = Object.assign(listConfig, {
                        offsetX: 24,
                        offsetY: 52,
                        width: 330,
                        height: 180
                    })
                    break;
                case 'video':
                case 'photo':
                    if (!this.scrollElement) {
                        listConfig = Object.assign(listConfig, {
                            type: 'contourWaterfall',
                            offsetX: 24,
                            offsetY: 52,
                            width: 330,
                            height: 180
                        })
                    } else {
                        listConfig = Object.assign(listConfig, {
                            type: 'waterfall',
                            width: 200,
                        })
                    }
                    break;
                case 'audio':
                    listConfig = Object.assign(listConfig, {
                        type: 'fixed',
                        minRow: 2,
                        offsetX: 30,
                        offsetY: 30,
                        width: 330,
                        height: 150,
                        heightFix: true
                    })
                    break;
                case 'vectors':
                    listConfig = Object.assign(listConfig, {
                        type: 'fixed',
                        width: 180,
                        height: 180
                    })
                    break;
            }
            this.listConfig = listConfig;
        },
        // 获取模板列表
        getTemplateList(option) {
            const that = this;
            that.isLoading = true;
            that.designList = new Array(40).fill(1).map((item,index)=> index);
            let params = {
                "pageNumber": 1,
                "pageSize": this.scrollElement ? 30 : 10,
                "searchValue": this.keyword,
                "categoryCode": this.category || "muban",
                "tags": "",
                "sort": "common",
                "ratio": "",
                "durationBegin": "",
                "durationEnd": ""
            }
            params = Object.assign(params, option);
            if (!params.categoryCode) params.categoryCode = 'muban';
            that.designApi = that.$api.TEMPLATE_LIST({
                data: params,
                success: res => {
                    that.isLoading = false;
                    that.getListConfig();
                    let { favorites, content } = res.data;
                    content = that.imageMixinToWebp(content);
                    if (that.designApi && that.designApi.params.data.pageNumber > 1) {
                        that.designList = that.designList.concat(content);
                    } else {
                        if (content.lenght === 0) {
                            that.designList = [];
                        } else {
                            that.favoriteList = Object.assign(that.favoriteList, favorites);
                            that.designList = content;
                        }
                    }
                },
                fail: err => {
                    return console.error("素材库-模板-请求模板列表数据失败");
                }
            });
        },
        // 获取素材列表
        getDesignList(option) {
            const that = this;
            that.isLoading = true;
            that.designList = new Array(40).fill(1).map((item,index)=> index);
            let params = {
                "pageNumber": 1,
                "pageSize": this.scrollElement ? 50 : 10,
                "searchValue": this.keyword,
                "categoryCode": this.category,
                "tags": "",
                "sort": "common",
                "ratio": "",
                "resolution": "",
                "durationBegin": "",
                "durationEnd": "",
                "isFindTop": false,
            }
            params = Object.assign(params, option);
            if (!params.categoryCode) params.categoryCode = this.commonMixinGetDesignSign(this.designType).code;
            that.designApi = that.$api.MATERIAL_LIST({
                data: params,
                success: res => {
                    that.isLoading = false;
                    that.getListConfig();
                    let { favorites, content } = res.data;
                    content = that.imageMixinToWebp(content);
                    if (that.designApi && that.designApi.params.data.pageNumber > 1) {
                        that.designList = that.designList.concat(content);
                    } else {
                        if (content.length === 0) {
                            that.designList = [];
                        } else {
                            that.favoriteList = Object.assign(that.favoriteList, favorites);
                            that.designList = content;
                        }
                    }
                },
                fail: err => {
                    return console.error("素材库-模板-请求模板列表数据失败");
                }
            });
        },
        // 获取筛选列表
        getFilterList(data) {
            if (this.designType === 'template') {
                this.getTemplateList(data);
            } else {
                this.getDesignList(data);
            }
        },
        // 获取搜索列表
        getSearchList(data) {
            let {value: searchValue, sort} = data;
            if (this.designType === 'template') {
                this.getTemplateList({searchValue, sort: sort.key});
            } else {
                this.getDesignList({searchValue, sort: sort.key});
            }
        },
        // 滚动加载更多
        loadMore(end) {
            this.designApi.next(end);
        },
        // 预览
        preview(data) {
            this.$emit('click', data, this.designType);
        },
    },
}
</script>

<style lang="less" scoped>
.design-list-main {
    width: calc(100% + 40px);
    height: 100%;
    margin-left: -20px;
    /deep/ .base-list-main {
        padding: 20px;
    }
    .empty {
        width: 100%;
        height: 100%;
        margin-top: 200px;
        text-align: center;
        p {
            margin-top: 30px;
            font-size: 18px;
        }
    }
}
</style>