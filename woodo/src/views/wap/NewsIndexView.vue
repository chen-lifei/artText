<template>
    <!-- 精选文章 -->
    <div class="news_list_contain">
        <div class="news_type">
            <ul>
                <li  v-for="(item,index) in category" :key="index" :class="{checked:item.checked}" @click="change_category(item)">{{item.categoryName}}</li>
            </ul>
        </div>
        <div class="news_contain skeleton" ref="work_share">
            <div class="news_list" v-for="(item,index) in news" :key="index" @click="to_news_detail(item)">
                <div class="news_img">
                    <img :src="item.image" v-show="item.image">
                </div>
                <div class="news_content">
                    <h5 class="news_title">{{item.title}}</h5>
                    <span class="news_detail">{{item.content_text}}</span>
                    <div class="news_info">
                        <img :src="item.authorHead" v-if="item.authorHead">
                        <p class="news_time">
                            {{item.createDate}}
                        </p>
                        <i class="agree_count" @click="add_like(item)">{{item.likes}}</i>
                    </div>
                </div>
            </div>
        </div>

        <!-- 空状态 -->
        <div class="doc_empty" v-if="empty_result">
            <p>暂时没有相关数据！</p>
        </div>
        <div class="loading" v-show="news.length === 0 && !empty_result"><img src="../../assets/wap/images/news/loading.gif"></div>
        <div class="load_tips" v-if="news.length !== 0 && !empty_result && total_number > 1" :class="{loading:!list_nomore}"></div>
    </div>
</template>

<style lang="less" scoped>
    @import url("../../assets/wap/css/common.css");

    @loading_img:url(/public/images/common/logo-text-gray.png) center center no-repeat;
    .news_list_contain{
        .news_type{
            position: relative;
            height:2.5rem;
            width:100%;
            padding-left: 0.65rem;
            border-bottom: 0.025px solid #eeeded;
            z-index:2;
            opacity:1;
            overflow-x:scroll;
            &::-webkit-scrollbar{
                display: none;
            }
            ul{
                overflow-x:scroll;
                height:2.5rem;
                line-height:2.5rem;
                width:100%;
                white-space:nowrap;
                vertical-align:middle;
                text-align:center;
                &::-webkit-scrollbar{
                    display: none;
                }
            }
            li{
                display:inline-block;
                vertical-align:middle;
                height:1.15rem;
                line-height:1.15rem;
                font-size:0.625rem;
                white-space:nowrap;
                margin-right:1.25rem;
                text-align:center;
                color:#373737;
                &.checked{
                    color:var(--mainColor);
                }
            }

        }
        .news_contain{
            padding: 0 0.975rem;
            margin-bottom: 2.625rem;
            .news_list{
                display:flex;
                flex-wrap: nowrap;
                // margin:0.9rem 0.45rem 0;
                padding: 0.925rem 0;
                border-bottom: 0.0325rem dashed hsl(225, 6%, 87%);
                .news_img{
                    width:40%;
                    height:5rem;
                    margin-right: 0.725rem;
                    border-radius:0.1rem;
                    overflow:hidden;
                    background: @loading_img;
                    img{
                        width:100%;
                        height:100%;
                    }
                }
                .news_content{
                    position: relative;
                    width:55%;
                    display:flex;
                    flex-direction:column;
                    .news_title{
                        color:#1e1e1e;
                        font-size:0.6rem;
                        margin-bottom:0.25rem;
                        overflow:hidden;
                        text-overflow: ellipsis;
                        -webkit-line-clamp:1;
                        text-align:justify;
                        white-space:nowrap;
                    }
                    .news_detail{
                        color:#333;
                        display:inline-block;
                        width:100%;
                        font-size:0.425rem;
                        color: gray;
                        overflow:hidden;
                        text-overflow:ellipsis;
                        white-space:normal;
                        word-break: break-all;
                        display:-webkit-box;
                        -webkit-line-clamp:3;
                        -webkit-box-orient:vertical;
                    }
                    .news_info{
                        position: absolute;
                        width: 100%;
                        bottom: 0;
                        clear:both;
                        font-size:0.6rem;
                        img{
                            position:relative;
                            display:inline-block;
                            vertical-align: middle;
                            margin-right:0.225rem;
                            width:1rem;
                            height:1rem;
                            border-radius:50%;
                            object-fit: contain;
                        }
                        p{
                            display:inline-block;
                            vertical-align: middle;
                            color:#b0b5c2;
                        }
                        .agree_count{  
                            position:relative;
                            top:-0.1rem;
                            left: 1.5rem;
                            display: inline-block;
                            vertical-align: middle;
                            font-style: normal;
                            color: #b0b5c2;
                            margin-bottom:0.05rem;
                            &:before{
                                content:'';
                                position:relative;
                                top:0.1rem;
                                margin-right:0.1rem;
                                display:inline-block;
                                width: 0.775rem;
                                height:0.775rem;
                                background:url("../../assets/wap/images/news/agree_icon.png") center no-repeat;
                                background-size:contain;
                            }                
                        }
                    }
                }
                &:last-child{
                    border-bottom:none;
                }
            }
        }
        &.skeleton{
            .news_title,
            span.news_detail{
                background-color:#efefef;
            }
            .news_list .news_detail .news_title{
                width: 100%;
                height:1rem;
            }
            span.news_detail{
                height:2.4rem;
            }
            .news_info{
                display: none;
            }
        }
        .load_tips{
            text-align:center;
            margin:0.4rem 0;
            &.loading{
                content:'';
                display:block;
                background:url("../../assets/wap/images/news/loading.gif");
                width:1rem;
                height:1rem;
                background-size:contain;
                margin:1rem auto;
            }
        }
        .doc_empty{
            position:relative;
            width:11rem;
            height:13rem;
            margin:30% auto;
            text-align:center;
            background:url("../../assets/common/images/empty_1.png") top no-repeat;
            background-size:11rem 10rem;
            z-index:-1;
            p{
                position:absolute;
                bottom:0;
                display:block;
                height:3rem;
                line-height:3rem;
                font-size:0.7rem;
                color:#333;
                padding-left: 0.5rem;
                text-align:center;
                width:100%;
            }
        }
        .loading{
            margin:7rem auto;
            width:2rem;
            height:2rem;
            img{
                width:100%;
                height:100%;
            }
        }
    }
</style>
    
<script>
    export default {
        name: "NewsIndex",
        metaInfo () {
            return {
                title: '吾道-精选文章',
                meta: [
                    {
                        name: 'viewport',
                        content: "width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0"
                    },
                    {
                        name: 'keywords',
                        content: 'PPT在线制作，协作工具，演示文稿，PPT模板下载'
                    },
                    {
                        name: 'description',
                        content: '「吾道幻灯片」是一款全新的office生产力工具，支持演示文稿、PPT模板、协同办公，可以帮助用户轻松创建具有视觉吸引力的幻灯片，作为一款办公软件，吾道具备了简洁，易用，功能强大的特点，通过云端技术实现在线编辑设计，让分享过程更加方便、高效。'
                    }
                ]
            }
        },
        data(){
            return{
                category: [],           // 文章分类列表
                checked_category:'',    // 选中的文章分类
                key_word: '',           // 搜索关键字
                news: [
                    {articleId:0,title:'',content:'',createDate:'',likes:'',image:'',authorHead:''},
                    {articleId:0,title:'',content:'',createDate:'',likes:'',image:'',authorHead:''},
                    {articleId:0,title:'',content:'',createDate:'',likes:'',image:'',authorHead:''},
                    {articleId:0,title:'',content:'',createDate:'',likes:'',image:'',authorHead:''},
                    {articleId:0,title:'',content:'',createDate:'',likes:'',image:'',authorHead:''},
                    {articleId:0,title:'',content:'',createDate:'',likes:'',image:'',authorHead:''},
                    {articleId:0,title:'',content:'',createDate:'',likes:'',image:'',authorHead:''},
                    {articleId:0,title:'',content:'',createDate:'',likes:'',image:'',authorHead:''},
                ],                      // 资讯列表
                page_size: 15,          // 加载条数
                page_number: 1,         // 资讯列表页码
                total_number: 1,        // 最大页码数
                tag: [],                // 热门标签列表
                checked_tag: '',        // 选中标签
                had_change: false,      // 改变获取数据条件标识(除页码外)
                empty_result: false,    // 空列表状态标识
                list_scroll: true,      // 是否允许滚动加载
                list_nomore:false,      // 列表是否还有内容
            }
        },
        mounted(){
            const that = this;
            that.get_data(false,true);
        },
        watch:{
            // 加载完成后去除骨架图
            news(){
                $(this.$refs.doc_height).removeClass('skeleton');
            },
        },
        methods:{
            // 获取文章列表
            get_data:function(scroll,is_first){
                let that = this,
                    first_data = false,
                    params = {};
                // 判断是否首次获取数据
                if(is_first) first_data = true;
                // 抽取参数
                params.pageSize = that.page_size;
                params.pageNumber = that.page_number;
                if(that.key_word !== '') params.searchValue = that.key_word;
                if(that.checked_category !== '') params.articleCategoryId = that.checked_category;
                if(that.checked_tag !== '') params.tag = that.checked_tag;
                // 获取数据
                if(that.had_change){
                    that.news = [];
                    that.list_nomore = false;
                }
                that.$axios.get('/api/article/list/',{params:params})
                    .then(function(data){
                        if(data.data.code === '2'){
                            if(!scroll){
                                let result = data.data.data,
                                    news = that.format_news(result.articleList);
                                if(first_data){
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
                                that.news = that.had_change||is_first ? news : that.news.concat(news);
                                // 更新列表状态
                                that.empty_result = !that.news;
                                // 更新页码
                                that.page_number = params.pageNumber++;
                                // 获取最大页数
                                that.total_number = result.totalPages;
                                if(that.total_pages <= 1) {that.list_nomore = true;}
                                else{ that.load_more(); that.list_scroll = true;}
                                // 重置获取状态
                                that.had_change = false;
                            }else{
                                let news = that.format_news(data.data.data.articleList);
                                that.news = that.news.concat(news);
                                that.list_scroll = true;
                            }
                            
                        }else{
                            that.$toast('获取资讯失败，请刷新重试',800,'wap');
                        }
                    })
            },
            // 格式化数据
            format_news:function(arr){
                let format_arr = [];
                if(arr.length <= 0) return false;
                arr.forEach(function(item){
                    let $div = document.createElement('div');
                    $div.innerHTML = item.content;
                    item.content_text = $div.innerText.length > 42 ? $div.innerText.slice(0,42) + '...' : $div.innerText + '...';
                    item.createDate = item.createDate.split(' ')[0];
                    format_arr.push(item);
                });
                return format_arr;
            },
            // 加载更多
            load_more:function(){
                let that = this,
                    window_height = window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight;
                document.addEventListener('scroll', () => {
                    let scroll_top = window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop,
                        list_scroll = that.list_scroll;
                    if(that.total_pages <= 1) return;
                    // 滚动加载
                    if(scroll_top + window_height - 100 >= that.$refs.doc_height.clientHeight && list_scroll){
                        let that = this,
                        number = that.page_number;
                        number++;
                        if(number <= that.total_number){
                            that.page_number = number;
                            that.list_scroll = false;
                            that.get_data(true);
                        }else{
                            that.page_number = 1;
                            that.list_nomore = true;
                            that.list_scroll = false;
                            if(that.total_number > 1){
                                that.$toast('没有更多了',2000,'wap');
                            }
                        }
                    }
                }, false);
            },
            // 切换筛选条件
            change_category:function(item){
                let that = this;
                that.category.forEach(function(cate){cate.checked = false;});
                that.list_scroll = false;
                item.checked = true;
                that.checked_category = item.categoryId;
                that.had_change = true;
                that.page_number = 1;
                that.get_data();
            },
            // 获取搜索关键词
            search_article:function(){
                let that = this;
                that.list_scroll = true;
                that.$refs.key_word.blur();
                that.had_change = true;
                that.page_number = 1;
                that.get_data();
            },
            // 跳转到文章详情页面
            to_news_detail:function(item){
                location.href = '/mobile/news/detail/?article='+item.articleId;
            },
        },
    }
</script>