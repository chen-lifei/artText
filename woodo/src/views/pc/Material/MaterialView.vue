<template>
    <div class="design-main" v-if="templateList.length > 0">
        <base-list
            :list="templateList"
            :type="listConfig.type || 'fixed'"
            :min-row="listConfig.minRow"
            :card-width="listConfig.width"
            :card-height="listConfig.height"
            :card-offset-x="listConfig.offsetX"
            :card-offset-y="listConfig.offsetY"
            :heightFix="listConfig.heightFix"
        >
            <template slot-scope="{ item }">
                <!-- <template-card :card-info="item" :key="item.id"></template-card> -->
                <works-share-card :card-info="item" :key="item.id"></works-share-card>
            </template>
        </base-list>
    </div>
</template>

<script>
// import cardSwiper from '@/components/CardSwiper.vue';
import projectCard from '@/views/pc/Material/components/projectCard.vue';
import videoCard from '@/views/pc/Material/components/VideoCard.vue';
// import audioCard from '@/views/pc/Material/components/AudioCard.vue';
import photoCard from '@/views/pc/Material/components/PhotoCard.vue';
import vectorsCard from '@/views/pc/Material/components/VectorsCard.vue';
import templateCard from '@/views/pc/Material/components/TemplateCard.vue';
import worksShareCard from '@/views/pc/Material/components/WorksShareCard.vue';
// import designSearch from '@/views/Design/components/DesignSearch.vue';

export default {
    name: "Index",
    components: { templateCard, projectCard, videoCard, photoCard, vectorsCard, worksShareCard },
    data() {
        return {
            templateList: [],
            listConfig: {
                type: 'fixed',
                minRow: 3,
                width: 286,
                height: 326,
                offsetX: 25,
                offsetY: 35,
                heightFix: false
            },
            advantageList: [
                {title: "原创模板", desc: "设计师独家作品供应",},
                {title: "免费素材", desc: "视频、音频、图片免费下载"},
                {title: "可商用", desc: "基于CC0协议，版权无忧"},
                {title: "每日更新", desc: "实时热点资源，每日更新"},
            ],                       // 优势列表
            groupList: [
                {key: 'template', code: 'muban', name: "工程模板", content: [1,2,3,4,5]},
                {key: 'video', code: 'shipin', name: "视频", content: [1,2,3,4,5]},
                {key: 'audio', code: 'YinLe', name: "音乐", content: [1,2,3,4,5]},
                {key: 'audio', code: 'YinXiao', name: "音效", content: [1,2,3,4,5]},
                {key: 'photo', code: 'TuPian1', name: "图片", content: [1,2,3,4,5]},
                {key: 'vectors', code: 'sucaiku', name: "图形", content: [1,2,3,4,5]},
            ],                       // 分组列表
            favoriteList: {},        // 收藏列表
            countList: null,
        }
    },
    mounted() {
        // this.getGroupList();
        this.getTemplateList();
        // this.getVectorsCategory();
    },
    methods: {
        // 获取模板列表
        getTemplateList() {
            const that = this;
            that.$axios.get('/api/works_share/list/',{params: {
                pageSize: 20,
                pageNumber: 1,
                cid: 276,
            }}).then(res => {
                // let { favorites, content } = res.data;
                // that.favoriteList = Object.assign(that.favoriteList, favorites);
                // content = that.imageMixinToWebp(content);
                // that.groupList[0].content = content;
                that.templateList = res.data.data.resultList;
                console.log(that.templateList)
            }).catch(err => {
                that.$toast('素材广场 - 获取模板列表错误');
            });
        },
        // 获取分组列表
        getGroupList() {
            this.$api.MATERIAL_CATEGORY_GROUP_LIST({
                data: {
                    count: document.body.clientWidth < 1350 ? 10 : 20,
                    categoryCodes: 'shipin, YinLe, YinXiao, TuPian1'
                }
            }).then(res => {
                let { favorites, content } = res.data;
                this.favoriteList = Object.assign(this.favoriteList, favorites);
                content.forEach(item => {
                    item.content = this.imageMixinToWebp(item.content);
                    let defaultItem = this.groupList.find(i => i.code === item.code);
                    defaultItem = Object.assign(defaultItem, item);
                    this.$forceUpdate();
                });
            })
        },
        // 获取素材分类
        getVectorsCategory() {
            this.$api.CATEGORY_LIST({
                data: {
                    type: 'material',
                    code: 'sucaiku',
                    grade: 3,
                }
            }).then(res => {
                this.groupList.forEach(i => {
                    if (i.key === 'vectors') {
                        i.content = res.data;
                    }
                });
                let codeArr = [];
                res.data.forEach(i => {
                    codeArr.push(i.code);
                })
                this.getCount(codeArr.toString());
            })
        },
        // 获取数量
        getCount(data) {
            this.$api.CATEGORY_GROUP_COUNT({
                data: {
                    categoryCodes: 'muban, shipin, YinLe, YinXiao, TuPian1, sucaiku,' + data
                }
            }).then(res => {
                this.countList = res.data;
            })
        },
        // 切换路由
        changeRouter(key) {
            this.$router.push({path: `/design/${key}`});
        },
        // 轮播切换到底事件
        swiperEnd(data, index) {
            this.$set(this.groupList[index], 'showMore', data);
        },
        // 跳转图形页面
        toVectors(code) {
            this.$router.push({name: 'DesignLibrary', params: {type: 'vectors', category: code}});
        },
        // 搜索
        search(data) {
            this.$router.push({name: 'DesignLibrary', params: {type: data.type, keyword: data.value, sort: data.sort}});
        }
    },
}
</script>

<style lang="less" scoped>
.design-main {
    position: relative;
    right: 0;
    width: 100%;
    height: calc(100vh - 76px);
    padding: 0 60px;
    overflow: auto;
}
.design-search-box {
    position: relative;
    width: 100%;
    height: 220px;
    padding-top: 50px;
    border-radius: 15px;
    text-align: center;
    background: linear-gradient(270deg, #fe6995, #bf88ff);
    &::before,
    &::after {
        content: "";
        position: absolute;
        top: 0;
        height: 220px;
        z-index: 0;
        pointer-events: none;
    }
    &::before {
        left: 0;
        width: 246px;
        background-image: url('~@/assets/pc/images/material/banner-f-1.png');
    }
    &::after {
        right: 52px;
        width: 340px;
        background-image: url('~@/assets/pc/images/material/banner-f-2.png');
    }
    h1 {
        margin-bottom: 20px;
        font-size: 26px;
        color: #ffffff;
    }
}
.design-group-container {
    padding-bottom: 80px;
}
.advantage-box {
    margin: 40px 0 50px;
    .advantage-item {
        width: calc(25% - 15px);
        height: 100px;
        line-height: 100px;
        padding: 0 10px;
        background: var(--upperColor);
        border-radius: 5px;
        text-align: center;
        white-space: nowrap;
        .base-icon {
            display: inline-block;
            vertical-align: middle;
            margin-right: 20px;
        }
        & > div {
            display: inline-block;
            vertical-align: middle;
            max-width: calc(100% - 90px);
            text-align: left;
            line-height: 1.7;
        }
        p {
            font-size: 20px;
            color: var(--stressColor);
        }
        span {
            display: inline-block;
            width: 100%;
            font-size: 12px;
        }
    }
}
.group-item-box {
    margin-bottom: 24px;
    &.template,
    &.video,
    &.photo {
        margin-bottom: 40px;
    }
    .item-title {
        p {
            display: inline-block;
            margin-right: 4px;
            font-size: 20px;
            font-weight: 600;
            color: var(--stressColor);
        }
        span {
            font-size: 12px;
            color: var(--dimColor);
        }
        .more {
            float: right;
            font-size: 12px;
            transform: translateY(10px);
            cursor: pointer;
            &:hover span{
                color: var(--mainColor);
            }
        }
    }
    .item-swiper {
        .skeleton-loading {
            width: 350px;
            height: 200px;
            margin-right: 30px;
            flex-shrink: 0;
            border-radius: 8px;
        }
        &.video /deep/ .more-btn,
        &.template /deep/ .more-btn{
            height: 228px;
        }
        &.audio /deep/ .more-btn{
            height: 150px;
        }
        &.photo /deep/ .more-btn{
            height: 198px;
        }
        .design-card {
            width: auto;
            max-width: 430px;
            margin-right: 30px;
            flex-shrink: 0;
            margin-bottom: 16px;
        }
        .video-card {
            height: 228px;
        }
        .template-card {
            min-width: 100px;
            height: 228px;
            margin-bottom: 30px;
        }
        .photo-card {
            height: 198px;
        }
        .audio-card {
            width: 430px;
            height: 150px;
        }
        .vectors-category-card {
            width: 220px;
            height: 260px;
            flex-shrink: 0;
            margin-right: 30px;
            background: #ffffff;
            border: 1px solid #cdcfd2;
            border-radius: 10px;
            text-align: center;
            transition: all .3s;
            cursor: pointer;
            &.newdark {
                background-color: #000000;
                border-color: #000000;
            }
            &:hover {
                border-color: var(--mainColor);
                box-shadow: 0 5px 15px 0 rgba(95,96,99,0.30);
            }
            img {
                width: 154px;
                height: 154px;
                object-fit: none;
                margin-top: 22px;
            }
            p {
                color: var(--stressColor);
                font-weight: 600;
                margin: 20px 0 6px;
            }
            span {
                font-size: 12px;
                color: var(--dimColor);
            }
        }
        &.vectors /deep/ .more-btn{
            height: 260px;
        }
    }
}
</style>