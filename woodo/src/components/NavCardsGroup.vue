<template>
    <div class="card-group" v-if="categor_list.length">
        <router-link tag="div" to="/edit/" class="item new-word">
            <div class="img-box">
                <div class="centent">
                    <div class="icon">
                        <base-icon class="icontianjiashangchuan"></base-icon>
                    </div>
                    <span>创建空白文档</span>
                </div>
                <img v-webp="ppt_jpg" alt="新建文档">
            </div>
            <!-- <div class="exp">新建文档</div> -->
        </router-link>

        <router-link tag="div" to="/template/" class="item ppt">
            <div class="img-box">
                <img v-webp="ppt_jpg" alt="ppt">
            </div>
            <div class="exp">PPT</div>
        </router-link>

        <router-link tag="div" :to="{ path: '/design/detail/', query:{first_cid: item.id} }" class="item" v-for="item in categor_list" :key="item.id">
            <div class="img-box">
                <img :src="item.image" :alt="item.name">
            </div>
            <div class="exp">{{item.name}}</div>
        </router-link>
    </div>
    <!-- 骨架图 -->
    <div class="card-group" v-else>
        <router-link tag="div" to="/home/" class="item new-word">
            <div class="img-box">
                <div class="centent">
                    <div class="icon">+</div>
                    <span>创建空白文档</span>
                </div>
                <img v-webp="ppt_jpg" alt="新建文档">
            </div>
            <!-- <div class="exp">新建文档</div> -->
        </router-link>

        <div class="item" v-for="item in 6" :key="item">
            <div class="img-box skeleton skeleton-loading"></div>
            <div class="exp">加载中...</div>
        </div>
    </div>
</template>

<script>
import ppt_jpg from "@/assets/pc/images/common/ppt.jpg";
export default {
    data() {
        return {
            categor_list: [],
            ppt_jpg,
        }
    },
    mounted() {
        this.getCategor();
    },
    methods: {
        getCategor() {
            this.$axios({ url: '/api/template/category/', params: { type: 'design' } }).then(res => {
                let { code, data } = res.data;
                if (code !== '2') return;
                this.categor_list = data;
            });
        }
    }
}
</script>

<style lang="less" scoped>
.card-group {
    display: flex;
    align-content: center;
    .item {
        flex: 1;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        cursor: pointer;
        .skeleton {
            width: 250px;
            &::before {
                content: '';
                display: block;
                padding-top: 80%
            }
        }
        .img-box {
            width: 100%;
            height: 80%;
            img {
                width: 100%;
                height: 100%;
                border-radius: 7px;
            }
        }
        &:hover {
            .img-box {
                img {
                    box-shadow: 0px 4px 16px 0px #d2d2d8;
                }
            }
        }
    }
    .item:nth-of-type(n + 2) {
        margin-left: 30px;
    }

    .new-word {
        .img-box {
            position: relative;
            .centent {
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                display: flex;
                flex-direction: column;
                justify-content: center;
                align-items: center;
                background: #ffffff;
                border: 1px dashed #dbdbe1;
                border-radius: 7px;
                box-sizing: border-box;
                .icon {
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    width: 40px;
                    height: 40px;
                    background: #f6f6f9;
                    border-radius: 50%;
                    .base-icon{
                        font-size: 20px;
                    }
                }
                span {
                    margin-top: 10px;
                    font-size: 12px;
                    color: #666666;
                }
            }
        }
    }

    .new-word,
    .ppt {
        max-width: 300px;
    }
}
</style>