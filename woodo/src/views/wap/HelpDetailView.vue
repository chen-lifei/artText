<template>
    <div class="help-container">
        <div class="help-detail">
            <div class="title">
                <span>{{ title }}</span>
            </div>
            <div class="content" v-html="content"></div>
        </div>
    </div>
</template>

<script>
export default {
    name: 'HelpDetailView',
    metaInfo() {
        return {
            title: '帮助中心',
            meta: [{
                name: 'keywords',
                content: 'PPT在线制作，协作工具，演示文稿，PPT模板下载'
            }, {
                name: 'description',
                content: '「吾道幻灯片」是一款全新的office生产力工具，支持演示文稿、PPT模板、协同办公，可以帮助用户轻松创建具有视觉吸引力的幻灯片，作为一款办公软件，吾道具备了简洁，易用，功能强大的特点，通过云端技术实现在线编辑设计，让分享过程更加方便、高效。'
            }],
        }
    },
    data() {
        return {
            title: '',
            content: '',
        }
    },
    mounted() {
        this.get_detail(this.$route.query.problemId);
    },
    methods: {
        // 获取详情
        get_detail(id) {
            if (!id) {
                return;
            }
            let that = this;
            that.$axios.get('/api/help/detail/', {
                params:{
                    id: id
                }
            }).then(res => {
                let res_data = res.data;
                if (res_data.type !== 'success') {
                    return that.$toast(res_data.content);
                }
                let data = res_data.data;
                that.title = data.title;
                that.content = data.content;
                that.$nextTick(() => {
                    let imgs = Array.from(document.querySelectorAll('.help-detail .content img'));
                    let srcs = imgs.map(item => item.src).filter(item => /^http/.test(item));
                    that.$common.wxjssdk_ready((wx) => {
                        imgs.forEach(element => {
                            let src = element.src;
                            if (/^http/.test(src)) {
                                element.onclick = event => {
                                    wx.previewImage({
                                        current: src,
                                        urls: srcs,
                                    });
                                }
                            }
                        });
                    });
                })
            }).catch(err => {
                that.$toast('获取问题详情失败~');
            });
        }
    },
}
</script>

<style lang="less" scoped>
@import url('../../assets/wap/css/common.css');
.help-container {
    position: relative;
    width: 100%;
    height: 100%;
    overflow-x: hidden;
    overflow-y: auto;
    background-color: #f8f8f8;
}

.help-detail {
    width: 100%;
    height: auto;
    padding: 0.75rem 0.9rem;
    .title {
        padding: 0.5rem 0;
        border-bottom: 0.05rem solid #e0e0e0;
        margin-bottom: 1.2rem;
        span {
            display: inline-block;
            vertical-align: middle;
            line-height: 1;
            font-size: 0.69rem;
            font-weight: bold;
            color: #3c3c3c;
        }
    }
}
</style>

<style lang="less">
.help-detail .content {
    & > * {
        all: initial;
    }
    img {
        max-width: 100%;
    }
}
</style>