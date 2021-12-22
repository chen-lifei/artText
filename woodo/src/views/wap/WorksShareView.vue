<template>
    <!-- 共享作品-->
    <div class="shareworks_contain">
        <!-- 搜索面板 -->
        <div class="search_work_panel">
            <input  placeholder="搜索作品" 
                    maxlength="20" 
                    v-model="search_keyword" 
                    @keyup.13="get_search_works($event);"
                    ref="work_search"/>
            <img class="clear_btn" src="../../assets/wap/images/shareworks/clear_btn.png"  v-if="search_keyword" @click="clean_search_keyword()" />
        </div>
        <div class="works_type">
            <!-- 作品分类列表 -->
            <ul class="works_tag" v-if="!is_search">
                <li :class="{checked:!current_cid}"  
                    @click="get_works_list()" 
                    v-show="style_list.length > 0">全部</li>
                <li  
                    v-for="(item,index) in style_list" 
                    :key="index" :class="{checked:current_cid==item.id}" 
                    @click="get_works_list({cId:item.id})">{{item.name}}</li>
            </ul>
            <!-- 搜索结果数量 -->
            <p class="works_count" v-if="is_search && search_list_count > 0">共找到&nbsp;<span>{{search_list_count}}</span>&nbsp;个相关的作品：</p>
        </div>
        <!-- 作品列表 -->
        <div class="works_list skeleton" ref="doc_height" v-show="!empty_result">
            <div class="works_item " v-for="(item,index) in share_list" :key="item.id" @click="to_detail(item)">
                <div class="work_img">
                    <img class="image" :src="item.image" v-show="item.image">
                    <img class="collect" @click.stop="collect_works(index,item.documentId,'add')" v-if="!favorite_list[item.documentId]" src="../../assets/wap/images/shareworks/collect.png">
                    <img class="collect" @click.stop="collect_works(index,item.documentId,'remove')" v-if="favorite_list[item.documentId]" src="../../assets/wap/images/shareworks/collected.png">
                </div>
                <div class="work_detail">
                    <div class="work_title">
                        <h3>{{ item.name }}</h3>
                        <span :class="get_color(item.category)">{{item.category}}</span>
                    </div>
                    <p>{{ item.introduce }}</p>
                </div>
                <div class="work_info">
                    <div class="author_name">
                        <img :src="item.authorImg" v-show="item.authorImg"/>
                        <span> {{item.authorName}} </span>
                    </div>
                    <p>
                        <span>{{ item.collectNum }}人收藏</span>
                        <span class="date">{{ item.date }}</span>
                    </p>
                </div>
            </div>
        </div>

        <!-- 空状态 -->
        <div class="doc_empty" v-if="empty_result">
            <img src="../../assets/common/images/empty_1.png"/>
            <p>抱歉~没有找到你要的作品<br>换个关键词试试吧</p>
            <button @click="clean_search_keyword()">返回</button>
        </div>
        <div class="loading" v-show="share_list.length === 0"><img src="../../assets/wap/images/news/loading.gif"></div>
        <div class="load_tips" v-if="!empty_result && total_pages > 1 && share_list.length !== 0" :class="{loading:!work_nomore}"></div>
    </div>
</template>

<style lang="less" scoped>
    @import url("../../assets/wap/css/common.css");
    @loading_img:url("/public/images/common/logo-text-gray.png") center center no-repeat;
    
    .shareworks_contain{
        width:100%;
        .search_work_panel{
            position: relative;
            width:100%;
            height: 1.63rem;
            line-height: 1.63rem;
            padding: 0 0.88rem;
            margin: 0.6rem 0 0.48rem;
            input{
                display: inline-block;
                height: 100%;
                background-color: #eff4fa;
                width: 100%;
                border-radius: 0.8rem;
                padding: 0 0.85rem;
                font-size: 0.62rem;
                color: #3c3c3c;
                &::-webkit-input-placeholder{
                    font-size: 0.62rem;
                    color: #bac4d4 !important;
                    text-align: center;
                }
            }
            .clear_btn{
                position: absolute;
                top: 0.28rem;
                right: 1.16rem;
                width: 1.02rem;
                height: 1.05rem;
            }
        }
        .works_type{
            background:#fff;
            padding-left:0.88rem;
            overflow-x:scroll;
            z-index:2;
            opacity:1;
            &::-webkit-scrollbar{
                display: none;
            }
            &.list_topfixed{
                padding-top: 2rem;
                .works_tag {
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100%;
                    line-height: 2.65rem;
                    padding-left:0.88rem;
                    border-bottom: 1px solid #dedede;
                    z-index: 10;
                }
            }
            .works_tag{
                overflow-x:scroll;
                line-height:2rem;
                width:auto;
                white-space:nowrap;
                background-color: #ffffff;
                &::-webkit-scrollbar{
                    display: none;
                }
                li{
                    display:inline-block;
                    vertical-align:middle;
                    font-size:0.62rem;
                    white-space:nowrap;
                    border-radius:1.15rem;
                    text-align:center;
                    padding-right: 1rem;
                    color: #576070;
                    &.checked{
                        color:var(--mainColor);
                    }
                }
            }
            .works_count{
                line-height: 2rem;
                font-size: 0.62rem;
                color: #576070;
                span{
                    color: var(--mainColor);
                    font-weight: 600;
                }
            }
        }

        .works_list{
            margin-bottom: 2.625rem;
            padding: 0 0.88rem;
            .works_item{
                width: 100%;
                height: auto;
                margin: 0.4rem 0 1rem;
                border: solid 0.03rem #e5e5e5;
                background-color: #ffffff;
                border-radius: 0.14rem;
                box-shadow: 0rem 0.15rem 0.18rem 0rem rgba(0, 0, 0, 0.05);
                .work_img{
                    position:relative;
                    width:100%;
                    height:9.73rem;
                    border-radius: 0.2rem;
                    .image{
                        border-top-right-radius: .2rem;
                        border-top-left-radius: .2rem;
                        width:100%;
                        height:100%;    
                        background: @loading_img;
                    }
                    .collect{
                        position: absolute;
                        right: .35rem;
                        top: .33rem;
                        width: 1.23rem;
                        height: 1.25rem;
                    }
                }
                .work_detail{
                    padding-left: 0.7rem;
                    padding-right: 0.5rem;
                    .work_title{
                        display: flex;
                        justify-content: space-between;
                        line-height: 2.17rem;   
                        h3{
                            display: inline-block;
                            width: calc(100% - 3rem);
                            font-size: 0.76rem;
                            color: #656574; 
                            font-weight: 600;       
                            text-overflow: ellipsis;
                            white-space: nowrap;
                            overflow: hidden;
                        }
                        span{
                            display: inline-block;
                            position: relative;
                            top: 0.63rem;
                            height: 0.85rem;
                            line-height: 0.85rem;
                            padding: 0 0.3rem;
                            color: #ffffff;
                            border-radius: 0.42rem;
                            font-size: 0.42rem;
                            text-align: center;
                            padding: 0.1rem 0.55rem 0;
                            &.currency{
                                background:#7fc2a0;
                            }
                            &.business{
                                background:#303030
                            }
                            &.graduation{
                                background:#90a0dc;
                            }
                            &.government{
                                background:#dd6b6b;
                            }
                            &.festival{
                                background:#d685d1;
                            }
                            &.job{
                                background:#eba066;
                            }
                            &.wedding{
                                background:#e4729b;
                            }
                            &.propaganda{
                                background:#7ad4dc;
                            }
                            &.other{
                                background:#b4b0af;
                            }
                            &.education{
                                background:#7aa9ce;
                            }
                        }
                    }
                    p{
                        display: -webkit-box;
                        -webkit-box-orient: vertical;
                        -webkit-line-clamp: 2;
                        overflow: hidden;
                        font-size: 0.52rem;
                        line-height: 1.4;
                        color: #b0b0c0;
                    }
                }
                .work_info{
                    display: flex;
                    justify-content: space-between;
                    padding-left: 0.7rem;
                    padding-right: 0.5rem;
                    line-height: 2.03rem;
                    width: 100%;
                    .author_name{
                        display: inline-block;
                        max-width: 50%;
                        text-overflow: ellipsis;
                        white-space: nowrap;
                        overflow: hidden;
                        span{
                            color: #656574;
                            font-size: 0.62rem;
                        }
                        img{
                            display: inline-block;
                            width: 0.83rem;
                            height: 0.83rem;
                            margin-right: .2rem;
                            border-radius: 1rem;
                            vertical-align: middle;
                        }
                    }
                    p{
                        display: flex;
                        justify-content: space-around;
                        font-size: 0.52rem;
                        color: #b0b0c0;
                        max-width: 50%;
                        span{
                            text-overflow: ellipsis;
                            white-space: nowrap;
                            overflow: hidden;
                        }
                        .date{
                                margin-left: 1.25rem;  
                        }
                    }
                }
            }
            &.skeleton{
                .work_img{
                    background: @loading_img;
                    margin-bottom:0.65rem;
                }
                .work_detail{
                    margin-bottom: 0.63rem;
                    h3{
                        height: 0.78rem;
                        background: #efefef;
                        margin-top: 0.65rem;
                    }
                    p{
                        height: 1.18rem;
                        background: #efefef;
                        margin-top: 0.75rem;
                    }
                }
                .work_info{
                    .author_name{
                        width: 4rem;
                        height: .83rem;
                        background: #efefef;
                        margin-bottom: 0.55rem;
                    }
                    p{
                        span{
                            display: inline-block;
                            line-height: .83rem;
                            margin-bottom: 0.55rem;
                            background: #efefef;
                            text-align: center;
                            &:first-child{
                                width:2.73rem;
                            }
                            &:last-child{
                                height:.83rem;
                                width: 1rem;
                            }
                        }
                    }
                }
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
                margin:1rem auto 4rem;
            }
        }
        
        .doc_empty{
            position: absolute;
            top: 0;
            right: 0;
            left: 0;
            bottom: 0;
            width: 7.53rem;
            height: 12.81rem;
            margin: auto;
            background: #ffffff;
            img{
                width: 7.53rem;
                height: 7.38rem;
            }
            p{
                text-align: center;
                font-size: 0.62rem;
                line-height: 1.44rem;
                color: #3c3c3c;
            }
            button{
                position: absolute;
                bottom: 0;
                left: 0;
                right: 0;
                margin: auto;
                width: 3.5rem;
                line-height: 1.6rem;
                background-color: #ffffff;
                border-radius: 0.78rem;
                border: solid 0.03rem var(--mainColor);
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
    name: "ShareDoc",
    metaInfo () {
        return {
            title: '吾道-共享作品',
            meta: [
                {
                    name: 'viewport',
                    content: "width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0"
                },
                {
                    property: 'og:title',
                    content: '吾道-共享作品'
                },
                {
                    property: 'og:url',
                    content: 'https://www.woodo.cn/mobile/square/'
                },
            ]
        }
    },

    data(){
        return{
            user:[],
            share_list:[
                    {"date":"","image":"","useNum":0,"authorName":"","name":"","collectNum":0,"documentId":0,"id":0,"authorImg":"","category":""},
                    {"date":"","image":"","useNum":0,"authorName":"","name":"","collectNum":0,"documentId":0,"id":0,"authorImg":"","category":""},
                    {"date":"","image":"","useNum":0,"authorName":"","name":"","collectNum":0,"documentId":0,"id":0,"authorImg":"","category":""},
                    {"date":"","image":"","useNum":0,"authorName":"","name":"","collectNum":0,"documentId":0,"id":0,"authorImg":"","category":""},
                    {"date":"","image":"","useNum":0,"authorName":"","name":"","collectNum":0,"documentId":0,"id":0,"authorImg":"","category":""},
                    {"date":"","image":"","useNum":0,"authorName":"","name":"","collectNum":0,"documentId":0,"id":0,"authorImg":"","category":""},
                    {"date":"","image":"","useNum":0,"authorName":"","name":"","collectNum":0,"documentId":0,"id":0,"authorImg":"","category":""},
                    {"date":"","image":"","useNum":0,"authorName":"","name":"","collectNum":0,"documentId":0,"id":0,"authorImg":"","category":""},
            ],                           //共享作品
            total_pages: 1,
            style_list:[],               //标签列表
            favorite_list:[],            //收藏作品
            current_cid:"",              //当前分类id
            work_nomore:false,           //判断是否还有作品
            empty_result: false,         // 空列表状态标识
            search_keyword: '',          // 搜索关键词
            is_search: false,            // 判断是否进行了搜索
            search_list_count: null,     // 搜索结果数量
        }
    },
    mounted(){
        const that = this;
        that.user = that.$common.get_login_state();
        that.get_works_list();
        // 搜索框聚焦时，隐藏空状态
        that.$common.resize_hidden_element('.doc_empty');
        // 滚动监听，将作品类型置顶
        let tag_top = $('.works_tag').offset().top;
        document.addEventListener('scroll',() => {
            if($(document).scrollTop() > tag_top && !that.is_search) {
                $('.works_type').addClass('list_topfixed');
            }else {
                $('.works_type').removeClass('list_topfixed');    
            }
        })
    },
    watch:{
        // 加载完成后去除骨架图
        share_list(){
            $(this.$refs.doc_height).removeClass('skeleton');
        },
    },
    methods:{
        // 跳转到详情页面
        to_detail:function(item){
            location.href = "/mobile/work_share/detail/?id="+item.id;
        },
        // 获取共享作品列表
        get_works_list(obj){
            let that = this;
            let $params = {
                cId: '',
                searchValue: '',
                pageNumber: 1,
            };
            // 合并接口参数
            $params = Object.assign($params, obj);
            that.current_cid = $params.cId;
            that.is_search = $params.searchValue ? true : false;
            if (+$params.pageNumber === 1) {
                // 切换分类或搜索时清空列表并触发加载状态
                that.share_list = [];
                that.empty_result = false;
            }
            that.$axios.get('/api/works_share/list/',{params:{
                sort: 'newUpload',
                cId: $params.cId,
                searchValue: $params.searchValue,
                pageNumber: $params.pageNumber,
                pageSize: 10,
            }}).then(function(data){
                if(data.data.code !== '2') {
                    that.$toast(data.data.content, 2000, 'wap');
                    return;
                }
                let res_data = data.data.data;
                that.share_list = that.share_list.concat(res_data.resultList);
                that.style_list = res_data.categoryList;
                that.favorite_list = res_data.favoriteMap;
                that.search_list_count = res_data.total;
                that.empty_result = that.share_list.length === 0;
                that.total_pages = res_data.totalPages;
                // 绑定滚动加载
                that.share_load_more({
                    pageNumber: $params.pageNumber,
                    totalPages: res_data.totalPages
                });
            })
        },
        // 搜索作品
        get_search_works:function(e){
            let that = this,
                search_keyword = that.search_keyword,
                space_str = /^\s+$/;
            // 关键词内容校验
            if(search_keyword.length > 20) return that.$toast('关键词不能超过20个字符噢！', 2000, 'wap');
            if($validate(search_keyword).special()) return that.$toast('不能包含特殊字符', 2000, 'wap');
            if(space_str.test(that.search_keyword) || search_keyword === '') return that.$toast('关键词不能为空字符串', 2000, 'wap');
            // 搜索框失焦
            $(e.target).blur();
            that.is_search = true;
            that.get_works_list({
                searchValue: search_keyword,
            });
        },
        // 清空搜索关键词
        clean_search_keyword: function(){
            let that = this;
            that.search_keyword = '';
            // 已经进行了搜索时，清空搜索框且返回全部分类列表
            if(that.is_search){
                that.get_works_list();
            }
        },
        // 滚动加载作品方法
        share_load_more: function(obj) {
            let that = this;
            utils.onReachBottom({
                $scroll: window,
                // 阻止触发
                factor: function() {
                    if(that.$parent.current_page !== 'work_share') return true;
                },
                // 触底时触发
                onReach: function() {
                    let _pageNumber = obj.pageNumber,  // 当前页码
                        _totalPages = obj.totalPages;  // 总页码
                    _pageNumber++;
                    if(_pageNumber <= _totalPages){
                        // 进行了搜索时
                        if(that.is_search){
                            that.get_works_list({cId:that.current_cid, searchValue:that.search_keyword, pageNumber:_pageNumber})
                        }else{
                            that.get_works_list({cId:that.current_cid, pageNumber:_pageNumber})
                        }
                    }else{
                        that.work_nomore = true;
                        that.$toast('没有更多了~', 1000, 'wap');
                    }
                }
            })
        },
        // 分类底色
        get_color:function(type){
            // 默认颜色
            let color = 'currency';
            // 颜色分类
            let search = [{
                'color': 'business',
                'text': ['创业', '融资', '商业', '计划', '名人堂']
            }, {
                'color': 'graduation',
                'text': ['教育', '课件', '培训']
            }, {
                'color': 'government',
                'text': ['党政', '建设', '政治', '政府']
            }, {
                'color': 'festival',
                'text': ['节日', '假日', '休闲', '婚庆', '生活']
            }, {
                'color': 'job',
                'text': ['工作', '汇报', '求职', '报告', '总结', '晋升', '运营']
            }, {
                'color': 'wedding',
                'text': ['庆典', '纪念']
            }, {
                'color': 'propaganda',
                'text': ['企业', '介绍', '行业', '宣传', '商务']
            }, {
                'color': 'education',
                'text': ['毕业', '答辩', '读书', '笔记']
            }, {
                'color': 'other',
                'text': ['其他']
            }];
            // 遍历查询颜色
            parent:for (let i in search) {
                let search_text = search[i]['text'],
                    search_color = search[i]['color'];
                for (let j in search_text) {
                    if (type.indexOf(search_text[j]) >= 0) {
                        color = search_color;
                        break parent;
                    }
                }
            }
            return color;
        },
        // 收藏作品
        collect_works:function(index,id,type){
            let that=this;
            if(type=='add'){
                that.$axios.post('/api/member/collection/',{
                    documentId:id,
                    type:'works',
                }).then(function(data){
                    that.favorite_list[id]=true;
                    that.share_list[index].collectNum++;
                    that.$toast(data.data.content,2000,'wap');
                })
            }else{
                that.$axios.post('/api/member/delete_collect/',{
                    documentId:id,
                    type:'works',
                }).then(function(data){
                    that.favorite_list[id]=false;
                    that.share_list[index].collectNum--;
                    that.$toast(data.data.content,2000,'wap');
                })
            }
        },
    }
}
</script>