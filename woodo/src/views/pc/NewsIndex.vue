<template>
    <div class="news">
        <div class="head">
            <CommonHead :options="{theme:'transparent'}"></CommonHead>
            <div class="head_inner skeleton" ref="headerSkeleton">
                <div class="image_slider">
                    <img v-if="slider.imgUrl" :src="slider.imgUrl" @click="click_banner(slider.url)"/>
                    <div class="slider_bottom">
                        <span>{{slider.title}}</span>
                    </div>
                </div>
                <div class="right_banner" v-for="(item,index) in banner_bg" @click="click_banner(item.url)">
                    <img class="inner_image" v-if="item.imgUrl !== ''" :src="item.imgUrl" />
                    <div class="slider_bottom">
                        <span>{{item.title}}</span>
                    </div>
                </div>
            </div>
        </div>
        <div class="body">
            <div class="filter_bar">
                <span class="category" v-for="item in category"
                      :class="{checked: item.checked}"
                      @click="change_category(item)"
                >{{item.categoryName}}</span>
                <div class="search">
                    <input type="text" placeholder="找一找"
                           ref="key_word"
                           v-model="key_word"
                           @keyup.13="change_key_word"
                    />
                    <a class="search_icon" @click="change_key_word"></a>
                </div>
            </div>
            <p class="checked_tag" v-if="checked_tag !== ''">
                <span>{{checked_tag}}<i @click="cancel_tag"></i></span>
                <span>{{news.length}}篇相关文章</span>
            </p>
            <div class="news_bar skeleton" ref="newsSkeleton">
                <div class="news_list" v-for="item in news" @click="to_detail(item.articleId)">
                    <div class="news_image">
                        <img v-if="item.image !== ''" :src="item.image" />
                    </div>
                    <p class="title">{{item.title}}</p>
                    <span class="content">{{item.content_text}}</span>
                    <p class="news_message">
                        <img class="author_head" :src="item.authorHead" />
                        <span class="author_name">{{item.author}}</span>
                        <span class="date">{{item.createDate}}</span>
                        <span class="like" :class="{checked:item.had_like}" @click.stop="like_news(item)">{{item.likes}}</span>
                    </p>
                </div>
                <a class="load_more" v-if="page_number >= total_number && !empty_result" @click="load_more">加载更多></a>
                <div class="empty_banner" v-if="empty_result">
                    <span>抱歉 Sorry！~没有找到相关的资讯</span>
                </div>
            </div>
            <div class="recommend_bar">
                <div class="code">
                    <img src="../../assets/pc/images/common/service_code.jpg" width="180" height="180">
                    <span>扫码手机上也可以管理文档</span>
                </div>
                <div class="template skeleton" ref="templateSkeleton">
                    <p>推荐模板 <a href="/template/">更多></a></p>
                    <div class="list" v-for="item in template" @click="to_template(item.templateId)">
                        <img v-if="item.templateImage !== ''" :src="item.templateImage">
                        <span>{{item.templateName}}</span>
                    </div>
                </div>
                <div class="tag">
                    <p>热门标签</p>
                    <span v-for="item in tag" @click="change_tag(item)">{{item}}</span>
                </div>
            </div>
        </div>
        <CommonFoot></CommonFoot>
    </div>
</template>

<script>
    import CommonHead from '@/components/nav/CommonHead.vue';
    import CommonFoot from '@/components/nav/CommonFoot.vue';
    export default {
        metaInfo: {
            title: '吾道-资讯',
            meta: [
                {
                    property: 'og:title',
                    content: '吾道-资讯'
                },
                {
                    property: 'og:url',
                    content: 'https://www.woodo.cn/news/'
                },
            ]
        },
        components:{CommonHead, CommonFoot},
        name: "NewsIndex",
        data() {
            return {
                slider: [],             // 头部轮播列表
                banner_bg: [
                    {imgUrl:'',title:'',url:''},
                    {imgUrl:'',title:'',url:''},
                ],          // 头部广告位
                category: [
                    {categoryId:0,categoryName:'',checked:''},
                ],           // 文章分类列表
                checked_category:'',    // 选中的文章分类
                key_word: '',           // 搜索关键字
                news: [
                    {articleId:0,title:'',content:'',createDate:'',likes:'',image:'',authorHead:''},
                    {articleId:0,title:'',content:'',createDate:'',likes:'',image:'',authorHead:''},
                    {articleId:0,title:'',content:'',createDate:'',likes:'',image:'',authorHead:''},
                    {articleId:0,title:'',content:'',createDate:'',likes:'',image:'',authorHead:''},
                ],               // 资讯列表
                page_size: 20,          // 加载条数
                page_number: 1,         // 资讯列表页码
                total_number: 1,        // 最大页码数
                tag: [],                // 热门标签列表
                checked_tag: '',        // 选中标签
                template: [
                    {"templateImage":"","templateName":"","templateId":0},
                    {"templateImage":"","templateName":"","templateId":0},
                    {"templateImage":"","templateName":"","templateId":0},
                ],           // 推荐模板列表
                had_change: false,      // 改变获取数据条件标识(除页码外)
                empty_result: false,    // 空列表状态标识
            }
        },
        watch:{
            banner_bg(){
                $(this.$refs.headerSkeleton).removeClass('skeleton');
            },
            news(){
                $(this.$refs.newsSkeleton).removeClass('skeleton');
            },
            template(){
                $(this.$refs.templateSkeleton).removeClass('skeleton');
            },
        },
        methods: {
            // 获取数据
            get_data:function(agument){
                let that = this,
                    first_data = false,
                    params = {};
                // 判断是否首次获取数据
                if(agument && agument.initial) first_data = true;
                // 抽取参数
                params.pageSize = that.page_size;
                params.pageNumber = that.page_number;
                if(that.key_word !== '') params.searchValue = that.key_word;
                if(that.checked_category !== '') params.articleCategoryId = that.checked_category;
                if(that.checked_tag !== '') params.tag = that.checked_tag;
                // 获取数据
                that.$axios.get('/api/article/list/',{params:params})
                    .then(function(data){
                        if(data.data.code === '2'){
                            let result = data.data.data,
                                news = that.format_news(result.articleList);
                            if(first_data){
                                // 获取轮播数据
                                that.slider = result.banners[0];
                                // 获取广告位数据
                                that.banner_bg = result.banners.slice(1, result.banners.length);
                                // 获取热门模板
                                that.template = result.templateList;
                                // 获取热门标签
                                that.tag = result.tagList;
                                // 提取筛选条件
                                that.category = [{categoryId:'', categoryName:'最新发布', checked: true}];
                                result.categoryList.forEach(function(item){
                                    item.checked = false;
                                    that.category.push(item);
                                });
                            }
                            // 获取资讯列表
                            if (agument && agument.initial) {
                                that.news = [];
                            }
                            that.news = that.had_change ? news : that.news.concat(news);
                            // 更新列表状态
                            that.empty_result = !that.news;
                            // 更新页码
                            that.page_number = params.page_number++;
                            // 获取最大页数
                            that.total_number = result.totalPages;
                            // 重置获取状态
                            that.had_change = false;
                        }else{
                            that.$toast('获取资讯失败，请刷新重试',800);
                        }
                    })
            },
            // 加载更多
            load_more:function(){
                let that = this,
                    number = that.page_number;
                number++;
                that.page_number = number;
                that.get_data();
            },
            // 格式化数据
            format_news:function(arr){
                let format_arr = [];
                if(arr.length <= 0) return false;
                arr.forEach(function(item){
                    let $div = document.createElement('div');
                    $div.innerHTML = item.content;
                    item.content_text = $div.innerText.length > 62 ? $div.innerText.slice(0,62) + '...' : $div.innerText + '...';
                    item.createDate = item.createDate.split(' ')[0];
                    format_arr.push(item);
                });
                return format_arr;
            },
            // 轮播点击事件
            click_banner:function(url){
                window.location.href = url;
            },
            // 跳转模板
            to_template:function(id){
                window.location.href = '/template/detail/?templateId='+id;
            },
            // 切换筛选条件
            change_category:function(item){
                let that = this;
                that.category.forEach(function(cate){cate.checked = false;});
                item.checked = true;
                that.checked_category = item.categoryId;
                that.had_change = true;
                that.page_number = 1;
                that.get_data();
            },
            // 修改搜索条件
            change_key_word:function(){
                let that = this;
                that.$refs.key_word.blur();
                that.had_change = true;
                that.page_number = 1;
                that.get_data();
            },
            // 选中标签
            change_tag:function(data){
                let that = this;
                that.checked_tag = data;
                that.had_change = true;
                that.page_number = 1;
                that.get_data();
				$('.news').animate({scrollTop: 300}, 500);
            },
            // 取消标签
            cancel_tag:function(){
                let that = this;
                that.checked_tag = '';
                that.had_change = true;
                that.page_number = 1;
                that.get_data();
            },
            // 跳转详情
            to_detail:function(id){
                if($validate(id).empty()) return false;
                window.open('/news/detail/?article='+ id);
            },
            // 点赞
            like_news:function(item){
                let that = this;
                if(item.had_like) return false;
                that.$axios.post('/api/article/likes/',{id: item.articleId})
                    .then(function(data){
                        item.had_like = true;
                        item.likes = data.data;
                    })
            },
        },
        mounted() {
            const that = this;
            // 判断是否为详情页返回
            if(that.$route.params.tag) {
                that.change_tag(that.$route.params.tag);
            } else {
                // 获取资讯数据 清除骨架图数据
                that.get_data({initial: true});
            }
        }
    }
</script>

<style lang="less" scoped>
    @import url("../../assets/pc/css/common.css");
    @background_image:url(../../assets/pc/images/news/news_sp.png) no-repeat;

    @skeleton_color: #f2f2f2;
    @image_loading: url(/public/images/common/logo-text-gray.png) center center no-repeat;
    .news{
        position:fixed;
        top:0;
        left:0;
        width:100%;
        height:100%;
        padding-top:646px;
        background:#fafafa;
        overflow-y:auto;
        .head{
            position:absolute;
            top:0;
            left:0;
            width:100%;
            height:467px;
            background: #2660e6 url(../../assets/pc/images/news/banner_01.jpg) top center no-repeat;
            background-size:cover;
        }
        .body{
            width:1240px;
            margin:0 auto 118px;
            padding:0 30px;
            background:#ffffff;
            box-shadow:0 0 29px 0 rgba(0,0,0,0.05);
            .filter_bar{
                position:relative;
                width:100%;
                line-height: 36px;
                padding: 18px 300px 18px 0;
                border-bottom:1px solid #e7e7e7;
                .category{
                    display:inline-block;
                    margin-right:30px;
                    font-size:18px;
                    color:#464646;
                    cursor:pointer;
                    vertical-align:middle;
                    user-select: none;
                    &.checked{
                        color:var(--mainColor);
                    }
                    &:hover{
                        opacity:0.8;
                    }
                }
                .search{
                    position:absolute;
                    top:16px;
                    right:0;
                    width:266px;
                    height:42px;
                    border:1px solid #e2e2e2;
                    border-radius:4px;
                    input{
                        display:block;
                        width:230px;
                        height:40px;
                        padding-left:10px;
                        font-size:14px;
                        color:#333333;
                        &::-webkit-input-placeholder{color:#d0d0d0;}
                        &:-moz-placeholder{color:#d0d0d0;}
                        &::-moz-placeholder{color:#d0d0d0;}
                        &:-ms-input-placeholder{color:#d0d0d0;}
                    }
                    .search_icon{
                        position:absolute;
                        top:12px;
                        right:14px;
                        display:inline-block;
                        width:19px;
                        height:19px;
                        background:@background_image -48px 0;
                    }
                }
            }
            .checked_tag{
                height:30px;
                line-height:30px;
                margin:10px 0 0;
                span:first-child{
                    position:relative;
                    display:inline-block;
                    height:30px;
                    line-height:30px;
                    padding:0 8px;
                    margin-right:20px;
                    background:#f5f5f5;
                    font-size:14px;
                    color:#505050;
                    vertical-align:middle;
                    i{
                        position:absolute;
                        top:-6px;
                        right:-6px;
                        display:inline-block;
                        width:12px;
                        height:12px;
                        border-radius:16px;
                        background:#f4696a;
                        cursor:pointer;
                        &:before{
                            content:'';
                            position:absolute;
                            top:5px;
                            left:4px;
                            display:inline-block;
                            width:4px;
                            height:1px;
                            background:#ffffff;
                        }
                    }
                }
                span:last-child{
                    font-size:14px;
                    color:#505050;
                    vertical-align:middle;
                }
                & + .news_bar{
                    padding-top:0;
                }
            }
            .news_bar{
                display:inline-block;
                width:848px;
                padding:10px 0 33px;
                vertical-align:top;
                &.skeleton{
                    .news_list{
                        .news_image{
                            background: @skeleton_color @image_loading;
                        }
                        .title,
                        .content{
                            height: 18px;
                            background-color: @skeleton_color;
                        }
                        .content{
                            height: 36px;
                        }
                        .news_message{
                            display: none;
                        }
                    }
                }
            }
            .recommend_bar{
                display:inline-block;
                width:266px;
                margin-left:65px;
                padding-top:28px;
                text-align:center;
                vertical-align:top;
                .code{
                    width:264px;
                    height:257px;
                    padding:27px 42px 0;
                    margin-bottom:34px;
                    background:#f7f7f7;
                    img{
                        margin-bottom:15px;
                    }
                    span{
                        font-size:12px;
                        color:#686868;
                    }
                }
            }
        }
        .footer {
            background-color:#030711;
        }
    }
    .head_inner{
        position:relative;
        top:86px;
        width:1240px;
        height:480px;
        padding:15px 15px 15px 855px;
        margin:0 auto;
        border-radius:4px;
        background:#ffffff;
        &.skeleton{
            .image_slider,
            .right_banner{
                background: @skeleton_color @image_loading;
                &:hover{
                    .slider_bottom{
                        opacity: 0;
                    }
                }
            }
        }
        &:after{
            content:'';
            position:absolute;
            bottom:-20px;
            left:0;
            width:100%;
            height:20px;
            background:#f4f4f4;
        }
        .image_slider{
            position:absolute;
            top:15px;
            left:15px;
            width:820px;
            height:450px;
            overflow:hidden;
			background:url(/public/images/common/logo-text-gray.png) no-repeat center center;
            img{
                display:block;
                width:100%;
                height:100%;
                cursor:pointer;
            }
            &:hover{
                opacity:0.95;
                .slider_bottom{
                    opacity:1;
                    transition:all 0.3s;
                }
            }
            .slider_bottom{
                position:absolute;
                bottom:0;
                left:0;
                width:100%;
                height:42px;
                line-height:42px;
                opacity:0;
                padding-right:5px;
                background:rgba(0,0,0,0.3);
                font-size:0;
                text-align:right;
                transition:all 0.3s;
                span{
                    display:block;
                    width:100%;
                    height:42px;
                    line-height:42px;
                    margin-left:15px;
                    font-size:14px;
                    color:rgba(255,255,255,0.9);
                    text-align:left;
                    cursor:pointer;
                }
            }
        }
        .right_banner{
            display:block;
            position: relative;
            width:372px;
            height:220px;
            margin-bottom:10px;
            border-radius:2px;
            cursor:pointer;
            &:hover{
                opacity:0.95;
                .slider_bottom{
                    opacity:1;
                    transition:all 0.3s;
                }
            }
            img{
                width:100%;
                height:100%;
            }
            .slider_bottom{
                position:absolute;
                bottom:0;
                left:0;
                width:100%;
                height:42px;
                line-height:42px;
                opacity:0;
                padding-right:5px;
                background:rgba(0,0,0,0.3);
                font-size:0;
                text-align:right;
                transition:all 0.3s;
                span{
                    display:block;
                    width:100%;
                    height:42px;
                    line-height:42px;
                    margin-left:15px;
                    font-size:14px;
                    color:rgba(255,255,255,0.9);
                    text-align:left;
                    cursor:pointer;
                }
            }
        }
    }
    .news_list{
        position:relative;
        width:812px;
        height:230px;
        padding:20px 0 20px 302px;
        border-bottom:1px dashed #e0e0e0;
        cursor:pointer;
        &:hover{
            .title{
                color:var(--mainColor);
            }
        }
        .news_image{
            position:absolute;
            top:50%;
            left:0;
            width:280px;
            height:190px;
            margin-top:-95px;
            border-radius:4px;
            overflow: hidden;
            img{
                width: 100%;
                height: 100%;
            }
        }
        .title{
            height:18px;
            line-height:18px;
            margin-bottom:20px;
            font-size:18px;
            color:#434343;
            cursor:pointer;
            &:hover{
                color:var(--mainColor);
            }
        }
        .content{
            display: -webkit-box;
            line-height:18px;
            font-size:14px;
            color:#918f8f;
            overflow : hidden;
            text-overflow: ellipsis;
            -webkit-line-clamp: 2;
            -webkit-box-orient: vertical;
        }
        .news_message{
            position:absolute;
            bottom:20px;
            left:302px;
            width:508px;
            height:20px;
            line-height:20px;
            font-size:0;
            img{
                display:inline-block;
                width:20px;
                height:20px;
                margin-right:16px;
                border-radius:20px;
                background:gray;
                vertical-align:middle;
            }
            span{
                display:inline-block;
                font-size:14px;
                color:#918f8f;
                vertical-align:middle;
            }
            .author_name{
                width:auto;
                margin-right:40px;
            }
            .like{
                position:absolute;
                top:0;
                right:8px;
                height:20px;
                padding-left:22px;
                cursor:pointer;
                &:before{
                    content:'';
                    position:absolute;
                    top:2px;
                    left:0;
                    display:inline-block;
                    width:14px;
                    height:14px;
                    background:@background_image;
                }
                &.checked:before{
                    background-position:-24px 0;
                }
                &:hover{
                    background:#fefefe;
                }
            }
        }
    }
    .load_more{
        display:block;
        width:82px;
        height:28px;
        line-height:28px;
        margin:33px auto 0;
        border-radius:2px;
        background:#f6f6f6;
        font-size:14px;
        color:#8f8f8f;
        text-align:center;
        cursor:pointer;
    }
    .empty_banner{
        width:100%;
        margin-top:30px;
        padding-top:302px;
        background:url(../../assets/common/images/empty_1.png) top center no-repeat;
        span{
            display:block;
            height:20px;
            line-height:20px;
            font-size:14px;
            color:#515151;
            text-align:center;
        }
    }
    .template{
        padding-bottom:33px;
        text-align:left;
        &.skeleton{
            .list{
                background: @skeleton_color @image_loading;
            }
        }
        p{
            position:relative;
            height:36px;
            line-height:36px;
            border-bottom:1px solid #eaeaea;
            font-size:14px;
            color:#404040;
            a{
                position:absolute;
                right:0;
                top:50%;
                display:inline-block;
                height:20px;
                line-height:20px;
                margin-top:-10px;
                font-size:12px;
                color:#9e9e9e;
                &:hover{
                    color: var(--mainColor);
                }
            }
        }
        .list{
            position:relative;
            width:264px;
            height:148px;
            margin-top:18px;
            overflow:hidden;
            cursor:pointer;
            img{
                display:inline-block;
                width:100%;
                height:100%;
            }
            span{
                position:absolute;
                bottom:-30px;
                left:0;
                display:block;
                width:100%;
                height:30px;
                line-height:30px;
                padding-left:10px;
                background:rgba(0,0,0,0.3);
                font-size:12px;
                color:#ffffff;
                transition:bottom 0.3s;
            }
            &:hover{
                span{
                    bottom:0;
                }
            }
        }
    }
    .tag{
        text-align:left;
        padding-bottom:33px;
        p{
            position:relative;
            height:36px;
            line-height:36px;
            margin-bottom:14px;
            border-bottom:1px solid #eaeaea;
            font-size:14px;
            color:#404040;
        }
        span{
            display:inline-block;
            height:25px;
            line-height:25px;
            padding:0 8px;
            margin:0 10px 8px 0;
            background:#f5f5f5;
            cursor:pointer;
            &:hover{
                opacity:0.8;
            }
        }

    }
</style>