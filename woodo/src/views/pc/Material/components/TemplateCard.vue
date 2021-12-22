<template>
    <div class="template-card material-card">
        <div class="skeleton-loading"  v-if="!template || !template.id"></div>
        <div class="card-wrapper">
            <!-- 封面图 -->
            <div class="cover-box" @click="preview()">
                <img :src="template.image" :alt="template.name"/>
            </div>
            <!-- 应用 -->
            <div class="use-box" v-tooltip="`点击编辑`" @click="use()">
                <base-icon class="iconbianji" size="18"></base-icon>
            </div>
            <!-- 收藏标识 -->
            <div class="favorite-box" v-tooltip="`${favoriteInfo ? '取消收藏' : '收藏'}`" :class="{favorite: favoriteInfo}">
                <base-icon class="iconshoucang" size="20"></base-icon>
            </div>
            <!-- 标题 -->
            <div class="info-box flex flex-between">
                <span class="title text-ellipsis">{{ template.name }}</span>
                <p class="count">
                    <base-icon class="iconshiyongshuliang" size="18"></base-icon>
                        <span>{{ usenum }}</span>
                    <base-icon class="iconshoucangshuliang" size="18"></base-icon>
                    <span>{{ collectCount }}</span>
                </p>
            </div>
        </div>
        <!-- <preview-modal ref="preview"></preview-modal> -->
    </div>
</template>
<script>
/**
 * ppt模板卡片组件
 * @prop cardInfo{Object}          ppt模板卡片信息对象
 * @prop favorite{Boolean}         收藏id，没有即为未收藏
 * @prop type{String}              展示形式，grid: 网格 list: 列表
 */
// import previewModal from '@/views/Design/components/PreviewModal.vue';
export default {
    name: "TemplateCard",
    // components: { previewModal },
    props: {
        cardInfo: Object,
        favoriteId: [String, Number],
        type: {
            type: String,
            default: 'grid'
        },
        customClick: Boolean
    },
    computed: {
        // 使用数量
        usenum() {
            if (!this.template.usenum) return 10;
            return parseFloat(this.template.usenum) >= 1000 ? `${(parseFloat(this.template.usenum) / 1000).toFixed(1)}k` : this.template.usenum;
        },
        // 收藏数量
        collectCount() {
            if (!this.template.collectCount) return 10;
            return parseFloat(this.template.collectCount) >= 1000 ? `${(parseFloat(this.template.collectCount) / 1000).toFixed(1)}k` : this.template.collectCount;
        },
        // 模板是否为最近一个月内创建
        newCreate() {
            if (this.template.createDate) {
                let nowDate = new Date;
                let beforeOneMonth = new Date(nowDate.getFullYear(), nowDate.getMonth() - 1, nowDate.getDate()); // 一个月前的时间
                let createDate = this.template.createDate; // 模板的创建时间
                return createDate > beforeOneMonth.getTime();
            }
        }
    },
    watch: {
        cardInfo() {
            this.template = utils.deepClone(this.cardInfo);
            if (this.template.id) this.favoriteInfo = this.favoriteId;
        }
    },
    data() {
        return {
            template: {},
            favoriteInfo: '',
        }
    },
    mounted() {
        if (!this.cardInfo.id) {
            return;
        }
        this.template = utils.deepClone(this.cardInfo);
        this.favoriteInfo = this.favoriteId;
    },
    methods:{
        // 预览
        preview(id) {
            if (this.customClick) {
                this.$emit('click', this.cardInfo);
            } else {
                this.$refs.preview.open('template', id || this.template.id);
            }
        },
        // （取消）收藏
        favorite() {
            let { documentId } = this.template;
            let isRemove = this.favoriteInfo;

            let url = '/api/member/collection/';
            let _toast = "收藏成功";
            if (isRemove) {
                url = '/api/member/delete_collect/';
                _toast = "取消收藏成功";
            }
            this.$axios({ method: 'post', url, data: { documentId, type: 'template' } }).then(({ data }) => {
                if (data.code !== '2') return this.$toast(_toast, 1000);
                this.favoriteInfo = data.data;
                if (!isRemove) {
                    item.collectCount++;
                } else {
                    item.collectCount--;
                }
            });
        },
        // 应用
        use() {
            let { isVip, documentId } = this.template;
            let user = this.$common.get_login_state();

            if (isVip) {
                if (!user.login) {
                    this.$toast('请先登录');
                    this.$router.push({ name: 'Login', query: { redirectUrl: this.$route.path } });
                    return false
                };

                if (!user.memberVipEffect) return this.$modal({ templateType: 'memberGrade' });
            }
            this.$router.push({ path: '/edit/', query: { modalId: documentId } });
            // this.designMixinUse('template', this.template.id);
        },
    }
};
</script>

<style lang="less" scoped>
.template-card {
    position: relative;
    width: 100%;
    height: 100%;
    cursor: pointer;
    transition: all .3s ease;
    .card-wrapper {
        width: 100%;
        height: 100%;
        transition: transform .3s ease;
    }
    &:hover {
        z-index: 100000;
        & > .card-wrapper {
            box-shadow: 0 0 15px 0 rgba(201,202,203,0.50);
            transform: scale(1.06) translateZ(0) translate3d(0,0,0);
            .cover-box {
                border-bottom-left-radius: 0;
                border-bottom-right-radius: 0;
            }
            .favorite-box,
            .use-box {
                opacity: 1 !important;
            }
            .info-box {
                height: 53px;
                line-height: 53px;
                padding: 0 20px;
                border-bottom-left-radius: 5px;
                border-bottom-right-radius: 5px;
                background: #ffffff;
                box-shadow: 0 13px 15px -4px rgba(201,202,203,0.50);
            }
        }
    }
    .cover-box{
        display: flex;
        width: 100%;
        height: 100%;
        border-radius: 5px;
        overflow: hidden;
        background: var(--upperColor);
        img{
            transition: transform .3s;
        }
        video {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            border-radius: 5px;
        }
        .loading {
            position: absolute;
            top: calc(50% - 12px);
            left: calc(50% - 12px);
            width: 24px;
            height: 24px;
            z-index: 2;
            text-align: center;
        }
    }
    .use-box,
    .favorite-box {
        position: absolute;
        top: 10px;
        opacity: 0;
        width: 36px;
        height: 36px;
        line-height: 36px;
        background-color: rgba(0, 0, 0, .4);
        border-radius: 8px;
        text-align: center;
        transition: opacity .3s;
        color: #ffffff;
    }
    .use-box {
        left: 10px;
    }
    .favorite-box {
        right: 10px;
        &.favorite {
            opacity: 1 !important;
            color: #f7b500;
        }
    }
    .info-box {
        position: absolute;
        top: 100%;
        left: 0;
        width: 100%;
        padding-top: 7px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        font-size: 14px;
        color: var(--textColor);
        .title {
            max-width: calc(100% - 120px);
        }
        .count {
            color: var(--dimColor);
            .base-icon {
                margin-right: 6px;
                transform: translateY(2px);
            }
            span {
                font-size: 12px;
                &:first-of-type {
                    margin-right: 13px;
                }
            }
        }
    }
}
.skeleton-loading {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 10;
}
</style>