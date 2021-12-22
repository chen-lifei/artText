<template>
    <div class="doc-recommend-panel" v-if="show">
        <div class="panel-wrap">
            <!-- 最近设计模块 -->
            <div class="panel-region lately-region" v-if="latyely_list.length">
                <h1>最近的设计</h1>
                <a @click="toProduction">查看全部</a>
                <doc-list-main :latest_list="latyely_list" @update_latyely_list="getLately"></doc-list-main>
            </div>
            <!-- 模板导航 -->
            <div class="panel-region">
                <h1>海量模板 · 满足不同场景使用</h1>
                <nav-cards-group></nav-cards-group>
            </div>
            <!-- 专题推荐 -->
            <div class="panel-region topic-region">
                <div class="region-head flex flex-between">
                    <h1>热门专题推荐</h1>
                    <router-link class="all" to="/template/topic_center/" v-show="show_topic_more">查看全部</router-link>
                </div>
                <card-swiper @seeMore="seeTopic" @showNextBtn="showTopicMore">
                    <template slot="cards" v-if="topic_data&&topic_data.length">
                        <template-topic-card card-class="skeleton" v-for="item in topic_data" :key="item.name" :item="item"></template-topic-card>
                    </template>
                    <template slot="cards" v-else>
                        <template-topic-card card-class="skeleton" v-for="item in 6" :key="item.name"></template-topic-card>
                    </template>
                </card-swiper>
            </div>
            <!-- 模板广告位 -->
            <div class="panel-region template-region">
                <div class="region-item" v-for="(category, index) in template_list_data" :key="index">
                    <div class="region-head flex flex-between">
                        <h1>{{ templateCategoryTitle(category[0]) }}</h1>
                        <router-link class="all" :to="{ path: '/template/', query: { id: category[1].id }}">查看全部</router-link>
                    </div>
                    <div class="template-adver-list">
                        <template-card class="template-card" v-for="item in category[1].dataList" :key="item.id" :favorite-map.sync="favorite_map" :template-info="item" card-class="skeleton" @preview="previewTemplate"></template-card>
                    </div>
                </div>
                <router-link class="to-template" to="/template/">查看更多模板 >></router-link>
            </div>
        </div>
    </div>
</template>

<script>
    /**
     *  文档中心 - 为你推荐
     */
    import CardSwiper from '@/components/CardSwiper.vue';
    import DocTileCard from '@/views/pc/DocCenter/DocTileCard.vue';
    import NavCardsGroup from '@/components/NavCardsGroup.vue';
    import TemplateCard from '@/views/pc/Template/TemplateCard.vue';
    import TemplateTopicCard from '@/views/pc/Template/TemplateTopicCard.vue';
    import DocListMain from './DocListMain.vue';
    export default {
        name: "DocRecommend",
        components:{ DocTileCard, CardSwiper, NavCardsGroup, TemplateTopicCard, TemplateCard, DocListMain },
        props: {
            show: {
                type: Boolean,
                default: false
            }
        },
        inject: ['center'],
        provide() {
            return {
                main: this,
                parent: this,
                center: this.center,
            }
        },
        watch: {
            show(v){
                if (v) {
                    this.open();
                }
            },
        },
        computed: {
            // 模板一级分类标题
            templateCategoryTitle() {
                return (category) => {
                    let title = '';
                    switch (category) {
                        case '工作汇报':
                            title = 'Q2来临，工作汇报不用愁';
                            break;
                        case '市场营销':
                            title = '分分钟搞定客户的营销方案';
                            break;
                        case '企业宣传':
                            title = '高端企业介绍，走心品牌宣传';
                            break;
                        case '主题风格':
                            title = '告别乏味平庸，超有风格态度';
                            break;
                        case '毕业答辩':
                            title = '答辩模板，学霸必备';
                            break;
                        case '教学培训':
                            title = '高效课堂，轻松教学';
                            break;
                        case '党政军警':
                            title = '百年党史，奋进新征程';
                            break;
                        case '生活节日':
                            title = '五一劳动节，加油打工人';
                            break;
                        case '求职招聘':
                            title = '金三银四，助你升职加薪';
                            break;
                        case '疫情防控':
                            title = '全民免费疫苗，打赢疫情攻坚战';
                            break;
                        case '其他文档':
                            title = '高效图表，任务管理更轻松';
                            break;
                        default:
                            title = '海量模板 · 满足不同场景使用';
                            break;
                    }
                    return title;
                }
            },
        },
        data(){
            return {
                latyely_list: [0,0,0,0,0,0],
                topic_data: [],
                template_list_data: [],
                favorite_map: {}, // 收藏数据
                show_topic_more: true, // 是否显示 热门专题推荐处的 查看全部
            }
		},
        methods:{
            open() {
                if (this.$common.get_login_state().login) {
                    this.getLately();
                } else {
                    this.latyely_list = [];
                }
                this.getTopicData();
                this.getTemplateListData();
            },
            // 获取最近设计文档
            getLately() {
                const that = this;
                that.$axios.get('/api/member/document/lately_used/list/', {params: { count: 15 } }).then(res => {
                    let {code, data} = res.data;
                    if (code == 2) {
                        data.map(item => {
                            item['page'] = that.$common.document_pages_dataparse([item.documentPage])[0];
                        });
                        that.latyely_list = data;
                    }
                })
            },
            // 获取专题数据
            getTopicData() {
                this.$axios.get('/api/common/topic_recommend/', {params: { id: 25 } }).then(res => {
                    let { code, data } = res.data;
                    if (code !== '2') return;
                    this.topic_data = data.slice(0, 15); // 限制15个
                });
            },
            // 获取模板列表数据
            getTemplateListData() {
                this.$axios.get('/api/template/template_first_group/').then(res => {
                    let { code, data } = res.data;
                    if (code !== '2') return;
                    this.favorite_map = data.favoriteMap;
                    this.template_list_data = Object.entries(data.dataList);
                    this.template_list_data.forEach(item => {
                        item[1].dataList.length = 8
                    });
                });
            },
            // 跳转至我的创作
            toProduction() {
                this.center.changePanel('production');
            },
            // 文档卡片事件分发
            docCardEventDistribute(type, doc) {
                switch (type) {
                    case 'edit':
                        this.editDoc(doc);
                        break;
                    case 'preview':
                        this.center.previewDoc(doc);
                        break;
                }
            },
            // 文档跳转编辑
            editDoc(doc) {
                if (doc.collaborateRoleType === 'onlyView') {
                    // 跳转演示页
                    location.href = `/document/slides/${doc.url}/`;
                } else {
                    // 跳转编辑页
                    location.href = `/edit/?docId=${doc.id}`;
                    // 存入最近打开文档数组
                    let recent = JSON.parse(localStorage.getItem('open_recent_doc')) || [];
                    recent.unshift(doc.id);
                    localStorage.setItem("open_recent_doc", JSON.stringify(recent));
                }
			},
            // 预览模板
            previewTemplate(template = {}) {
                template.type = 'template';
                this.center.previewDoc(template);
            },
            seeTopic() {
                this.$router.push({ path: '/template/topic_center/' });
            },
            showTopicMore(value) {
                this.show_topic_more = value;
            }
        }
    }
</script>
<style lang="less" scoped>
    .panel-wrap{
        padding: 10px 36px 15px;
        .panel-region{
            margin-top: 50px;
            h1{
                margin-bottom: 20px;
                font-size: 22px;
                color: #000000;
            }
        }
        .lately-region{
            position: relative;
            margin-bottom: -20px;
            h1{
                margin-bottom: 0;
            }
            & > a{
                position: absolute;
                top: 18px;
                right: 0;
                font-size: 12px;
                color: var(--dimTextColor);
            }
            /deep/ .doc-tile-card{
                margin: 20px 0;
                &:nth-of-type(n+2){
                    margin-left: 30px;
                }
                /deep/ .setting-btn{
                    display: none;
                }
            }
        }
        .topic-region{
            padding-bottom: 30px;
            border-bottom: 1px solid #e5e5e5;
            h1{
                margin-bottom: 0;
            }
            .all {
                font-size: 12px;
                color: var(--dimTextColor);
            }
            .card-swiper {
                .topic-card {
                    margin-top: 20px;
                    &:nth-of-type(n + 2){
                        margin-left: 30px;
                    }
                    
                }
                .skeleton {
                    margin-top: 20px;
                    min-width: 308px;
                    height: 200px;
                    border-radius: 3px;
                    &:nth-of-type(n + 2) {
                        margin-left: 30px;
                    }
                }
            }
        }
        .template-region{
            text-align: center;
            .all {
                font-size: 12px;
                color: var(--dimTextColor);
            }
            .region-item{
                margin-bottom: 20px;
                text-align: left;
            }
            .template-adver-list{
                width: 100%;
                .template-card {
                    width: 23%;
                    margin-right: 2.5%;
                    margin-bottom: 30px;
                    &:nth-child(4n) {
                        margin-right: 0;
                    }
                }
                .skeleton {
                    cursor: pointer;
                    &::before {
                        content: '';
                        display: block;
                        padding-top: 56%;
                    }
                }
            }
            .to-template{
                display: inline-block;
                margin: 0 auto 20px;
                height: 40px;
                line-height: 40px;
                font-size: 14px;
                color: var(--dimTextColor);
            }
        }
    }
</style>