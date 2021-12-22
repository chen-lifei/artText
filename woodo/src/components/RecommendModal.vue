<template>
    <div class="recommend_template_container">
        <div class="wrapper">
            <div class="inner">
                <div class="list_title">
                    <h2>本周TOP·口碑好模板</h2>
                    <a href="/template/">查看更多</a>
                </div>
                <a href="javascript:void(0)" class="btn prev" @click="slide($event, 'prev')"></a>
                <a href="javascript:void(0)" class="btn next" @click="slide($event, 'next')"></a>
                <div class="center">
                    <ul class="list top" data-page="0" :data-maxpage="Math.ceil(topList.length/3)">
                        <li v-for="(item, index) in topList" :key="index" @click="preview_template(item.id)">
                            <div class="preview_image">
                                <i class="icon">Top{{ index + 1 }}</i>
                                <img v-lazy="item.image"/>
                            </div>
                            <div class="info">
                                <span class="title" v-tooltip.bottom="item.name">{{ item.name }}</span>
                                <span class="collect_num" v-tooltip.bottom="`${item.collectCount}人收藏`">{{ item.collectCount }}收藏</span>
                                <span class="use_num" v-tooltip.bottom="`${item.usenum}人使用`">{{ item.usenum }}使用</span>
                            </div>
                        </li>
                    </ul>
                </div>
            </div>
        </div>
        <div class="wrapper">
            <div class="inner">
                <div class="list_title">
                    <h2>精选推荐·职场升职加薪必备</h2>
                    <a href="/template/">查看更多</a>
                </div>
                <a href="javascript:void(0)" class="btn prev" @click="slide($event, 'prev')"></a>
                <a href="javascript:void(0)" class="btn next" @click="slide($event, 'next')"></a>
                <div class="center">
                    <ul class="list recommend" data-page="0" :data-maxpage="Math.ceil(recommendList.length / 3)">
                        <li v-for="(item, index) in recommendList" :key="index" @click="preview_template(item.id)">
                            <div class="preview_image">
                                <i class="icon">Top{{ index + 1 }}</i>
                                <img v-lazy="item.image"/>
                            </div>
                            <div class="info">
                                <span class="title" v-tooltip.bottom="item.name">{{ item.name }}</span>
                                <span class="collect_num" v-tooltip.bottom="`${item.collectCount}人收藏`">{{ item.collectCount }}收藏</span>
                                <span class="use_num" v-tooltip.bottom="`${item.usenum}人使用`">{{ item.usenum }}使用</span>
                            </div>
                        </li>
                    </ul>
                </div>
            </div>
        </div>
    </div>
</template>
<script>
    const topId = 23;
    const recommendId = 24;
    export default {
        name: "RecommendModal",
        components: {},
        props: {
            user: {
                type: Object,
                default: {}
            },
            fullScreen: {
                type: Boolean,
                default: false,
            }
        },
        data() {
            return {
                topList: [],
                recommendList: [],
                scrollWidth: 0,
            }
        },
        mounted() {
            let top = this.getList(topId);
            let recommend = this.getList(recommendId);
            Promise.all([top, recommend]).then(() => {
                this.scrollWidth = $('.wrapper .center').width() - 32;
                $('.wrapper .list.top').width(this.scrollWidth * Math.ceil(this.topList.length / 3));
                $('.wrapper .list.recommend').width(this.scrollWidth * Math.ceil(this.recommendList.length / 3));
                window.removeEventListener("onorientationchange" in window ? "orientationchange" : "resize", this.resize);
                window.addEventListener("onorientationchange" in window ? "orientationchange" : "resize", this.resize);
            });
        },
        watch: {
            fullScreen (n, o) {
                this.resize();
            }
        },
        methods: {
            // 获取列表 23为口碑， 24为推荐
            getList(id) {
                return new Promise((resolve, reject) => {
                    this.$axios.get('/api/common/visit_template/', {params:{id}}).then(data => {
                        let list = data.data.data;
                        if (id === topId) {
                            // 口碑
                            this.topList = list;
                        } else {
                            // 推荐
                            this.recommendList = list;
                        }
                        resolve();
                    })
                })
            },
            // 切换方法
            slide(e, type) {
                let $list = $(e.target).parent().find('.list');
                let currentPage = Number($list.attr('data-page'));
                let maxPage = Number($list.attr('data-maxpage'));
                // 下一页
                if (type === 'next') {  
                    $list.parents('.inner').find('.prev').show();
                    let nextPage = currentPage + 1;
                    if (nextPage === maxPage - 1) $list.parents('.inner').find('.next').hide();
                    // 可继续滚动
                    if (nextPage <= maxPage - 1) {
                        $list.attr('data-page', nextPage);
                        $list.css('left', -this.scrollWidth * nextPage);
                    }
                } else {
                    $list.parents('.inner').find('.next').show();
                    let prePage = currentPage - 1;
                    if (prePage === 0 ) $list.parents('.inner').find('.prev').hide();
                    if (prePage >= 0) {
                        $list.attr('data-page', prePage);
                        $list.css('left', -this.scrollWidth * prePage);
                    }
                }
            },
            // 监听页面缩放
            resize() {
                let that = this;
                let $top = $('.wrapper .list.top');
                let $recommend = $('.wrapper .list.recommend');
                // 重新赋值
                that.scrollWidth = $('.wrapper .center').width() - 32;
                $top.width(that.scrollWidth * Math.ceil(that.topList.length / 3)).css('left', -$top.attr('data-page') * that.scrollWidth);
                $recommend.width(that.scrollWidth * Math.ceil(that.recommendList.length / 3)).css('left', -$recommend.attr('data-page') * that.scrollWidth);
            },
            // 使用模版点击事件
			preview_template (id){
                this.$refs.template_preview_modal.show(id);
			},
        },
    }
</script>
<style lang="less" scoped>
    .recommend_template_container{
        width: 100%;
        background-color: #ffffff;
        user-select: none;
    }
    .wrapper{
        &:last-child .inner{
            padding-top: 15px;
        }
        .inner{
            position: relative;
            padding: 28px 148px 0;
            text-align: center;
            overflow: hidden;
            &:hover .btn{
                opacity: 1;
            }
            .list_title{
                display: flex;
                justify-content: space-between;
                padding: 0 40px 0 38px;
                line-height: 20px;
                h2{
                    font-size: 16px;
                    color: #0b0b0b;
                    text-align: left;
                }
                a{
                    font-size: 12px;
                    color: #999;
                    &:hover{
                        color: #0b7bf7;
                    }
                }
            }
            .btn{
                position: absolute;
                top: calc(50% - 24px);
                width: 48px;
                height: 48px;
                background: #e5e5e5;
                border-radius: 50%;
                opacity: 0;
                &:hover{
                    background-color: #0b7bf7;
                    &::after{
                        border-left-color: #fff;
                        border-bottom-color: #fff;
                    }
                }
                &::after{
                    content: '';
                    position: absolute;
                    top: 19px;
                    width: 8px;
                    height: 8px;
                    border: 1px solid transparent;
                    border-left-color: #999;
                    border-bottom-color: #999;
                    transform: rotate(45deg);
                }
                &.prev{
                    display: none;
                    left: 74px;
                    &::after{
                        left: 23px;
                    }
                }
                &.next{
                    right: 74px;
                    &::after{
                        left: 17px;
                        transform: rotate(-135deg);
                    }
                }
            }
            .center{
                position: relative;
                width:100%;
                overflow: hidden;
            }
            .list{
                display: inline-block;
                position: relative;
                left: 0;
                width: 100%;
                padding: 15px 35px;
                padding-right: 0;
                height: calc(((100vw - 80px) / 3) * 0.63);
                font-size: 0;
                text-align: left;
                transition: all .3s;
                overflow: hidden;
                white-space: nowrap;
                li{
                    display: inline-block;
                    position: relative;
                    width: calc((100vw - 354px) / 3);
                    padding: 10px;
                    transition: transform .3s;
                    transform: translateZ(0);
                    cursor: pointer;
                    &::before{
                        content: '';
                        display: block;
                        padding-top: 63%;
                    }
                    &:hover{
                        border-radius: 5px;
                        box-shadow: 0px 8px 25px 0px rgba(81,89,104,.3 );
                    }
                    .preview_image{
                        position: absolute;
                        top: 9px;
                        width: calc(100% - 20px);
                        border-radius: 5px;
                        overflow: hidden;
                        img{
                            position: absolute;
                            top: 0;
                            width: 100%;
                            height: 100%;
                        }
                        .icon{
                            position:absolute;
                            top: 0;
                            left: 20px;
                            width: 40px;
                            height: 50px;
                            line-height: 40px;
                            text-align: center;
                            font-size: 12px;
                            color: #fff;
                            background: url('../assets/pc/images/slides/top.png') no-repeat top;
                            z-index: 1;
                        }
                        &::before{
                            content: '';
                            display: block;
                            padding-top: 56%;
                        }
                    }
                    .info{
                        position: absolute;
                        bottom: 12px;
                        left: 10px;
                        width: calc(100% - 20px);
                        span{
                            display: inline-block;
                            line-height: 1.2;
                            font-size: 12px;
                            color: #666666;
                        }
                        *{
                            text-overflow: ellipsis;
                            white-space: nowrap;
                            word-break: break-all;
                            overflow: hidden;
                        }
                        .title{
                            width: 33%;
                        }
                        .collect_num, .use_num{
                            float: right;
                            width: 18.7%;
                            min-width: 60px;
                            max-width: 80px;
                            text-align: right;
                            &::before{
                                content: '';
                                display: inline-block;
                                width: 14px;
                                height: 14px;
                                margin-right: 5px;
                                background-position: center;
                                background-repeat: no-repeat;
                                vertical-align: bottom;
                            }
                        }
                        .collect_num::before{
                            background-image: url('../assets/pc/images/slides/collect_gray.png');
                        }
                        .use_num{
                            margin-right: 10px;
                            &::before{
                                background-image: url('../assets/pc/images/slides/user.png');
                            }
                        }
                    }
                    &:nth-child(3n) {
                        margin-right: 26px;
                    }
                }
            }
        }
    }
</style>