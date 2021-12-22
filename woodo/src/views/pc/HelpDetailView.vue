<template>
    <div class="help_list_contain">
        <!-- 通用头部 -->
        <CommonHead></CommonHead>
        <div class="help_list_main">
            <!-- 面包屑 -->
            <div class="main_bread_panel">
                <router-link to="/help/" class="bread_item">帮助中心&nbsp;&gt;</router-link>
                <a href="javascript:;" class="bread_item" @click="back_problem_list">列表&nbsp;</a>
                <a href="javascript:void(0)" class="bread_item disable" v-show="problemId">&gt;&nbsp;详情</a>
            </div>
            <div class="main_body clearfix">
                <!-- 左侧分类列表 -->
                <div class="category_list_coantin">
                    <ul class="category_list">
                        <li class="list_item"
                            v-for="(item, index) in category_list" 
                            :key="index"
                            :class="{'current': item.id === Number(categoryId)}" 
                            @click="click_get_problem_list(item.id)"
                        >{{ item.name }}</li>
                    </ul>
                </div>
                <!-- 问题列表 -->
                <div class="problem_list" v-if="!problemId">
                    <a  class="problem_item"
                        href="javascript:;"
                        v-for="(item, index) in problem_list" 
                        :key="index"
                        @click="click_get_problem_detail(item.id)"
                    >
                        <i></i>{{ item.title }}
                    </a>
                </div>
                <!-- 问题详情 -->
                <div class="problem_deatil" v-else>
                    <h3 class="problem_title" @click="back_problem_list">{{ problem_detail.title }}</h3>
                    <div class="problem_content">
                        <div class="no-inherit" v-html="problem_detail.content"></div>
                    </div>
                </div>
            </div>
        </div>
        <!-- 图片浏览弹框 -->
        <transition name="modal-fade">
            <div class="check_image_contain">
                <img :src="current_image.src"/>
                <!-- 关闭按钮 -->
                <a class="close_btn" href="javascript:void(0)"></a>
                <!-- 上一张 -->
                <div class="pre_wrap">
                    <a class="pre_btn" href="javascript:void(0)" @click="change_image('pre')"></a>
                </div>
                <!-- 下一张 -->
                <div class="next_wrap">
                    <a class="next_btn" href="javascript:void(0)" @click="change_image('next')"></a>
                </div>
            </div>
        </transition>
        <!-- 通用底部 -->
        <CommonFoot></CommonFoot>
    </div>
</template>

<style lang="less">
    .no-inherit{
        position: relative;
        padding: 27px 2px;
        img{
            max-width: 100%;
            cursor: pointer;
            opacity: 1;
            &:hover{
                opacity: .9;
            }
        }
    }
</style>

<style lang="less" scoped>
    @import url("../../assets/pc/css/common.css");
    @background_image: url('../../assets/pc/images/help/preview_sp.png') center no-repeat #222;
    .help_list_contain{
        position: relative;
        width: 100%;
        min-width: 1240px;
        height: 100%;
        text-align: center;
        background-color: #f4f7fa;
        overflow: auto;
        .help_list_main{
            position: relative;
            width: 1073px;
            margin: 31px auto 36px;
            background: transparent;
            // 面包屑
            .main_bread_panel{
                width:100%;
                margin-bottom: 12px;
                text-align: left;
                .bread_item{
                    margin-right: 5px;
                    font-size: 12px;
                    color: #5a6068;
                    &.disable{
                        cursor: default;
                        &:hover{
                            color: #5a6068;
                        }
                    }
                    &:hover{
                        color: var(--mainColor);
                    }
                }
            }
            // 页面主体
            .main_body{
                width: 100%;
                text-align: left;
                &.clearfix{
                    zoom: 1;
                }
                &.clearfix::after{
                    content: "";
                    display: block;
                    height: 0;
                    clear:both;
                    visibility: hidden;
                }
                // 左侧分类列表
                .category_list_coantin{
                    float: left;
                    height: 735px;
                    width: 190px;
                    margin-right: 12px;
                    background-color: #282f38;
                    box-shadow: 0px 9px 9px 0px rgba(0, 0, 0, 0.04);
                    user-select: none;
                    .category_list{
                        height:100%;
                        .list_item{
                            position: relative;
                            line-height: 50px;
                            padding-left: 36px;
                            color:#ffffff;
                            font-size: 16px;
                            font-family: MicrosoftYaHei-Bold;
                            text-align: left;
                            cursor: pointer;
                            &.current, &:hover{
                                background-color: #39404c;
                                &::before{
                                    content: '';
                                    position: absolute;
                                    top: 0;
                                    left: 0;
                                    height: 100%;
                                    width: 6px;
                                    background: var(--mainColor);
                                }
                            }
                        }
                    }
                }
                // 右侧问题列表面板
                .problem_list{
                    float: right;
                    position: relative;
                    width: calc(100% - 202px);
                    height: 100%;
                    min-height: 735px;
                    padding: 20px 60px 30px;
                    background-color: #ffffff;
                    box-shadow: 0px 9px 9px 0px rgba(0, 0, 0, 0.04);
                    border-radius: 4px;
                    .problem_item{
                        display: block;
                        width: 90%;
                        line-height: 48px;
                        font-size: 14px;
                        color: #4b545f;
                        text-overflow: ellipsis;
                        white-space: nowrap;
                        overflow: hidden;
                        cursor: pointer;
                        i{
                            display: inline-block;
                            width: 7px;
                            height: 7px;
                            margin-right: 8px;
                            border-radius: 50%;
                            background: #4b545f;
                        }
                        &:hover{
                            color: var(--mainColor);
                        }
                    }
                }
                // 右侧问题详情面板
                .problem_deatil{
                    float: right;
                    position: relative;
                    width: calc(100% - 202px);
                    height: 100%;
                    min-height: 735px;
                    padding: 0 32px 32px;
                    background-color: #ffffff;
                    box-shadow: 0px 9px 9px 0px rgba(0, 0, 0, 0.04);
                    border-radius: 4px;
                    .problem_title{
                        width: 100%;
                        height: 55px;
                        line-height: 55px;
                        padding-left: 23px;
                        border-bottom: solid 1px #d4ddea;
                        color: #3a4049;
                        font-size: 18px;
                        font-weight: bold;
                        font-family: MicrosoftYaHei-Bold;
                        text-overflow: ellipsis;
                        white-space: nowrap;
                        overflow: hidden;
                        cursor: pointer;
                        &::before{
                            content: '';
                            display: inline-block;
                            position: absolute;
                            left: 32px;
                            top: 20px;
                            width: 11px;
                            height: 12px;
                            border-width: 0 0 3px 3px;
                            border-color: #626a75;
                            border-style: solid;
                            transform: rotate(45deg);
                        }
                        &:hover{
                            opacity: .7;
                        }
                    }
                }
            }
        }
        .footer{
            background-color: #f4f7fa;
        }
        .check_image_contain {
            display: none;
            position: fixed;
            top: 0;
            left: 0;
            width: 100vw;
            height: 100vh;
            background: #000;
            z-index: 1000;
            padding: 100px 0;
            img{
                display: inline-block;
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                margin: auto;
                max-height: 80%;
            }
            .close_btn{
                position: absolute;
                top: 20px;
                right: 40px;
                width: 40px;
                height: 40px;
                border-radius: 50%;
                background: @background_image;
                background-position: 16px 16px;
                z-index: 10;
                &:hover{
                    background-position: -13px 16px;
                }
            }
            .pre_wrap,.next_wrap{
                position: absolute;
                top: 0;
                width: 300px;
                height: 100%;
                background-color: transparent;
                a{
                    display: none;
                    position: absolute;
                    top: 50%;
                    width: 50px;
                    height: 50px;
                    line-height: 47px;
                    font-size: 21px;
                    background: #767070;
                    border-radius: 50%;
                    margin-top: -16px;
                    color: #ffffff;
                    background: @background_image;
                }
                .pre_btn{
                    left: 40px;
                    background-position: -45px 13px;
                    &:hover{
                        background-position: -82px 13px;
                    }
                }
                .next_btn{
                    right: 40px;
                    background-position: 21px -10px;
                    &:hover{
                        background-position: -15px -10px;
                    }
                }
            }
            .pre_wrap{
                left: 0;
                &:hover .pre_btn{
                    display: block;
                }
            }
            .next_wrap{
                right: 0;
                &:hover .next_btn{
                    display: block;
                }
            }
        }
    }
</style>

<script>
    import CommonHead from '@/components/nav/CommonHead.vue';
    import CommonFoot from '@/components/nav/CommonFoot.vue';
    export default {
        metaInfo: {
			title: '吾道-帮助中心',
			meta: [
                {
                    property: 'og:title',
                    content: '吾道-帮助中心'
                },
                {
                    property: 'og:url',
                    content: 'https://www.woodo.cn/help/list/'
                },
			]
        },
        components:{
            CommonHead,
            CommonFoot,
        },
        data(){
            return{
                categoryId: null,
                problemId: null,
                category_list: [],                  // 分类列表  
                problem_list: [],                   // 选中的分类列表
                problem_detail: {},                 // 问题详情

                current_image: {},                          // 选中的图片
                image_preview_arr: [],                      // 问题详情中的图片列表
            }
        },
        watch: {
            categoryId(n) {
                if (n) {
                    this.get_problem_list(n);
                }
            },
            problemId(n) {
                if (n) {
                    this.get_problem_detail(n);
                }
            },
            $route(t, f) {
                this.categoryId = t.query.categoryId;
                this.problemId = t.query.problemId;
            },
        },
        created() {
            this.categoryId = this.$route.query.categoryId;
            this.problemId = this.$route.query.problemId;
        },
        mounted() {
            let that = this;
            that.get_category_all();
        },
        methods: {
            // 文档详情页跳转
            to_help_list: function (q = {}) {
                /**
                 * query: { categoryId, problemId }
                 */
                this.$router.push({
                    path: '/help/detail/',
                    query: q,
                });
            },
            // 获取全部分类
            get_category_all: function() {
                let that = this;
                that.$axios.get('/api/help/category/').then(data => {
                    if(data.data.code !== '2') {
                        return that.$toast(data.data.content);
                    }
                    that.category_list = data.data.data;
                }).catch(err => {
                    that.$toast('获取问题分类失败~');
                });
            },
            // 获取指定分类
            get_problem_list: function (id){
                let that = this;
                if (!id) {
                    return;
                }
                that.$axios.get('/api/help/list/', {
                    params: {
                        helpCategoryId: id
                    },
                }).then(data => {
                    if (data.data.code !== '2') {
                        return that.$toast(data.data.content);
                    }
                    that.problem_list = data.data.data;
                }).catch(err => {
                    that.$toast('获取问题详情列表失败~');
                });
            },
            // 获取问题详情
            get_problem_detail: function (id) {
                let that = this;
                if (!id) {
                    return;
                }
                that.problem_detail = {};
                that.$axios.get('/api/help/detail/', {
                    params:{
                        id: id
                    }
                }).then(data => {
                    if (data.data.code !== '2') {
                        return that.$toast(data.data.content);
                    }
                    that.problem_detail = data.data.data;
                    that.categoryId = that.problem_detail.helpCategoryId;
                    that.$nextTick(() => {
                        that.get_image_src();
                    });
                }).catch(err => {
                    that.$toast('获取问题详情失败~');
                });
            },
            // 问题详情页回到列表页
            back_problem_list: function () {
                this.problemId = null;
                this.to_help_list({ categoryId: this.categoryId });
            },
            
            click_get_problem_list: function (id) {
                if (!id) {
                    return;
                }
                this.categoryId = id;
                this.to_help_list({ categoryId: id });
            },
            click_get_problem_detail: function (id) {
                if (!id) {
                    return;
                }
                this.problemId = id;
                this.to_help_list({ categoryId: this.categoryId, problemId: id });
            },
            
            // 获取详情中的图片并绑定点击事件
            get_image_src: function(){
                let that = this;
                let $imgs = $('.no-inherit img');
                that.image_preview_arr = $imgs.toArray().map(item => item.src);
                $imgs.on('click', e => {
                    // 获取所点击的图片的src和索引
                    let current_image={src:'', index:''};
                    current_image.src = $(e.currentTarget).attr('src');
                    current_image.index = that.image_preview_arr.findIndex(item => item ===current_image.src);
                    that.current_image = current_image;
                    that.check_image();
                });
            },
            // 查看图片 || 关闭图片
            check_image: function() {
                let that = this;
                $('.check_image_contain').css('display','block');
                $('.close_btn').on('click',function(){
                    $('.check_image_contain').css('display','none');
                })
            },
            // 展示前一张||下一张图片
            change_image: function(type) {
                let that = this,
                    index = that.current_image.index;
                // 点击前一张图片
                if(type === 'pre') {
                    if(index === 0) return that.$toast('已经是第一张了', 1500);
                    that.current_image.src = that.image_preview_arr[--index];
                    that.current_image.index = index--;
                }else{
                    // 点击下一张图片
                    if(index === that.image_preview_arr.length - 1) return that.$toast('已经是最后一张了', 1500);
                    that.current_image.src = that.image_preview_arr[++index];
                    that.current_image.index = index++;
                }
            }
        },

    }
</script>