<template>
    <div class="photo-card material-card" ref="card">
        <div class="skeleton-loading" v-if="!photo || !photo.id"></div>
        <div class="card-wrapper" v-else>
            <!-- 封面图 -->
            <div class="cover-box" @click="preview()">
                <img v-lazy="photo.image" :alt="photo.name" />
            </div>
            <!-- 分辨率 -->
            <div class="resolution-box" v-if="photo.properties.resolution && resolution(photo.properties.resolution)"><span>{{ resolution(photo.properties.resolution) }}</span></div>
            <!-- 收藏标识 -->
            <div class="favorite-box" v-tooltip="`${favoriteInfo ? '取消收藏' : '收藏'}`" :class="{favorite: favoriteInfo}">
                <base-icon class="iconshoucang" size="20"></base-icon>
            </div>
            <!-- 预览 -->
            <div class="preview-box" v-tooltip="`预览`" @click="preview()">
                <base-icon class="iconyulan" size="20"></base-icon>
            </div>
        </div>
        <!-- <preview-modal ref="preview"></preview-modal> -->
    </div>
</template>

<script>
/**
 * 模板卡片组件
 * @prop cardInfo{Object}             图片卡片信息对象
 * @prop favoriteId{Boolean}           收藏id，没有即为未收藏
 */
// import previewModal from '@/views/Design/components/PreviewModal.vue';
export default {
    name: "PhotoCard",
    // components: { previewModal },
    props:{
        cardInfo: Object,
        favoriteId: [String, Number],
        customClick: Boolean
    },
    data(){
        return {
            photo: null,
            favoriteInfo: '',
        }
    },
    watch: {
        cardInfo() {
            this.photo = utils.deepClone(this.cardInfo);
            this.favoriteInfo = this.favoriteId;
            this.photo.properties = {};
        }
    },
    created() {
        if (!this.cardInfo.id) {
            return;
        }
        this.photo = utils.deepClone(this.cardInfo);
        this.photo.properties = {};
        this.favoriteInfo = this.favoriteId;
    },
    computed: {
        resolution() {
            return data => {
                switch (data) {
                    case '1080P':
                        return 'HD'
                    case '2K':
                        return '2K';
                    case '4K':
                        return '4K';
                    default:
                        return false;
                        break;
                }
            }
        }
    },
    methods:{
        // 预览
        preview(id) {
            if (this.customClick) {
                this.$emit('click', this.cardInfo);
            } else {
                this.$refs.preview.open('photo', id || this.photo.id);
            }
        },
        // （取消）收藏
        favorite() {
            let isRemove = this.favoriteInfo;
            this.designMixinFavorite('photo', isRemove || this.photo.id, isRemove).then(id => {
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
.photo-card {
    position: relative;
    width: 100%;
    height: 100%;
    cursor: pointer;
    .card-wrapper {
        width: 100%;
        height: 100%;
        transition: transform .3s ease;
    }
    &:hover {
        & > .card-wrapper {
            transform: scale(1.06) translateZ(0) translate3d(0,0,0);
            box-shadow: 0 6px 10px 0 rgba(66,98,113,.50);
            .preview-box,
            .favorite-box {
                opacity: 1 !important;
            }
            .resolution-box {
                display: none;
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
    }
    .resolution-box {
        position: absolute;
        top: 10px;
        left: 10px;
        height: 28px;
        line-height: 28px;
        padding: 0 12px;
        border-radius: 8px;
        background-color: rgba(0, 0, 0, .3);
        span {
            font-size: 12px;
            color: #ffffff;
        }
    }
    .preview-box,
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
    .preview-box {
        right: 50px;
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