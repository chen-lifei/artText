<template>
    <div class="vectors-card material-card">
        <div class="skeleton-loading"  v-if="!vectors || !vectors.id"></div>
        <div class="card-wrap" v-else>
            <!-- 封面图 -->
            <div class="cover-box" @click="preview()">
                <img v-lazy="vectors.image" :alt="vectors.name"/>
            </div>
            <!-- 收藏标识 -->
            <div class="favorite-box" v-tooltip="`${favoriteInfo ? '取消收藏' : '收藏'}`" :class="{favorite: favoriteInfo}">
                <base-icon class="iconshoucang" size="20"></base-icon>
            </div>
        </div>
        <!-- <preview-modal ref="preview"></preview-modal> -->
    </div>
</template>

<script>
/**
 * 模板卡片组件
 * @prop vectors{Object}             素材卡片信息对象
 * @prop favorite{Boolean}          收藏id，没有即为未收藏
 */
// import previewModal from '@/views/Design/components/PreviewModal.vue';
export default {
    name: "VectorsCard",
    // components: { previewModal },
    props:{
        cardInfo: Object,
        favoriteId: [String, Number],
        customClick: Boolean
    },
    data() {
        return {
            vectors: null,
            favoriteInfo: '',
        }
    },
    watch: {
        cardInfo() {
            this.vectors = utils.deepClone(this.cardInfo);
            if (this.vectors.id) {
                this.favoriteInfo = this.favoriteId;
                this.vectors.duration = utils.timeStampTransform(this.vectors.duration);
            }
        }
    },
    created() {
        if (!this.cardInfo.id) {
            return;
        }
        this.vectors = utils.deepClone(this.cardInfo);
        this.favoriteInfo = this.favoriteId;
    },
    methods:{
        // 预览
        preview(id) {
            if (this.customClick) {
                this.$emit('click', this.cardInfo);
            } else {
                this.$refs.preview.open('vectors', id || this.vectors.id);
            }
        },
        // （取消）收藏
        favorite() {
            let isRemove = this.favoriteInfo;
            this.designMixinFavorite('vectors', isRemove || this.vectors.id, isRemove).then(id => {
                if (isRemove) {
                    this.favoriteInfo = '';
                } else {
                    this.favoriteInfo = id;
                }
            });
        },
    }
};
</script>

<style lang="less" scoped>
.vectors-card {
    position: relative;
    width: 100%;
    height: 100%;
    cursor: pointer;
    text-align: center;
    background-image: linear-gradient(rgba(233, 237, 240, .2), rgba(233, 237, 240, .2)), url('~@/assets/pc/images/material/transparent-bg.png');
    &:hover > .card-wrap {
        box-shadow: 0 5px 15px 0 rgba(95, 96, 99, .30);
        .cover-box img {
            transform: scale(1.1);
        }
        .favorite-box {
            opacity: 1 !important;
        }
    }
    .card-wrap {
        width: 100%;
        height: 100%;
    }
    .cover-box{
        display: inline-block;
        vertical-align: middle;
        width: 100%;
        height: 100%;
        img{
            display: inline-block;
            vertical-align: middle;
            object-fit: contain;
            transition: transform .3s;
        }
        &::after {
            content: "";
            display: inline-block;
            vertical-align: middle;
            width: 0;
            height: 100%;
        }
    }
    .favorite-box {
        position: absolute;
        top: 10px;
        right: 10px;
        opacity: 0;
        width: 36px;
        height: 36px;
        line-height: 36px;
        border-radius: 8px;
        background-color: rgba(0, 0, 0, .4);
        color: #ffffff;
        text-align: center;
        transition: opacity .3s;
        &.favorite {
            opacity: 1 !important;
            color: #f7b500;
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