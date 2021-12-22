<template>
    <div class="works-share-main" ref="backtop_scroll">
        <!-- 主体 -->
        <div class="works-main" ref="worksMain" @scroll="scrollFirstCategory($event)">
            <!-- 一级列表头部 -->
            <div class="main-first-head" v-if="['first','search'].indexOf(currentListType) > -1">
                <div class="wrapper">
                    <div class="header-left">
                        <div class="title">分享你的作品</div>
                        <p>你可以在这里上传优秀的幻灯片作品，以供吾道用户学习和参考，<br>分享是一种美好的生活信念，明白了分享的同时，明白了存在的意义。</p>
                        <!-- 搜索模块 -->
                        <div class="search-work-panel" :class="{focus:searchWorksBegin || currentListType === 'search'}">
                            <button class="search-btn" title="搜索作品" @click="getSearchWorks($event)" v-bdtongji="`共享作品-首页-顶部-顶部-搜索`"></button>
                            <input placeholder="搜索您喜欢的作品..." maxlength="200" v-model="searchWorksKeyword" @focus="searchWorksBegin = true" @blur="searchWorksBegin = false" @keyup.13="getSearchWorks($event)">
                            <button class="clear-btn" title="清空搜索" v-if="searchWorksKeyword !== ''" @click="clearSearchKeyword">×</button>
                        </div>
                    </div>
                    <!-- 我的作品模块 -->
                    <div class="header-right">
                        <button v-if="!user.login" @click="toLogin()">登录分享作品</button>
                        <button class="upload-works-btn" @click="openWorksManagementModal('upload')" v-if="user.login" v-bdtongji="`共享作品-首页-顶部-顶部-提交作品`">
                            <base-icon class="icontianjia1"></base-icon>
                            提交作品
                        </button>
                        <button class="my-works-btn"
                                v-if="user.login"
                                @click="openWorksManagementModal('mywork')" v-bdtongji="`共享作品-首页-顶部-顶部-我的作品`">
                            我的作品
                        </button>
                    </div>
                </div>
            </div>
            <div class="main-body">
                <div class="wrapper">
                    <!-- 分类列表 -->
                    <div class="category-list">
                        <p>分类：</p>
                        <ul>
                            <li :class="{current: currentCategoryId === item.categoryId}" :data-id="item.categoryId" @click="toggleCategory(item)" v-for="item in allCategoryList" :key="item.categoryId">
                                {{item.categoryName}}
                            </li>
                        </ul>
                    </div>
                    <!-- 骨架图 -->
                    <div class="works-list works-skeleton" v-if="showSkeleton">
                        <div class="floor-head"></div>
                        <works-share-card v-for="sItem in skeletonList" :key="sItem"></works-share-card>
                    </div>
                    <!-- 二级列表面包屑 -->
                    <div class="bread-panel" v-if="currentListType === 'second'">
                        <a @click="backFirstWorks()">返回</a><span> &lt; {{currentCategory.categoryName}}</span>
                    </div>
                    <!-- 一级列表 -->
                    <template v-if="currentListType === 'first'">
                        <div class="works-list works-first" v-for="cateItem in categoryList" :key="cateItem.categoryId" :data-id="cateItem.categoryId">
                            <div class="floor-head">
                                <h1>{{ cateItem.categoryName }}</h1>
                                <a class="more" @click="getSearchWorks(cateItem)" v-bdtongji="'共享作品-首页-'+cateItem.categoryName+'-右上角-查看全部'">查看全部</a>
                            </div>
                            <works-share-card v-for="item in cateItem.list" :key="item.id" :works-share="item" :favorite-info="favoriteMap[item.documentId]"></works-share-card>
                            <!-- 占位 -->
                            <works-share-card v-for="item in 6" :key="item" card-class="seat"></works-share-card>
                        </div>
                    </template>
                    <!-- 二级 & 搜索列表 & 大家都在看 -->
                    <template v-else>
                        <!-- 空状态 -->
                        <div class="no-works" v-if="worksList.length === 0 && showEmpty">
                            <div class="bg"></div>
                            <p>抱歉~没有找到你要的作品!</p>
                            <a @click="backFirstWorks()">返回</a>
                        </div>
                        <!-- 二级 & 搜索结果列表 -->
                        <div class="works-list" :class="{works_search: currentListType === 'search'}" v-else>
                            <works-share-card v-for="item in worksList" :key="item.id" :works-share="item" :favorite-info="favoriteMap[item.documentId]"></works-share-card>
                            <!-- 占位 -->
                            <works-share-card v-for="sItem in skeletonList" :key="sItem" card-class="placeholder"></works-share-card>
                            <div class="list-loading" v-if="showListLoading">
                                <div class="loading-wrapper">
                                    <img src="~@/assets/pc/images/common/list_loading.gif">
                                    <span>正在加载更多...</span>
                                </div>
                            </div>
                        </div>
                        <!-- 大家都在看 -->
                        <template v-if="currentListType === 'search'">
                            <div class="hot-result-title">
                                <p class="hot-title">大家都在看</p>
                                <a  class="more-template" @click="backFirstWorks">更多></a>
                            </div>
                            <div class="works-list works-hot">
                                <works-share-card v-for="item in hotWorksList" :key="item.id" :works-share="item" :favorite-info="favoriteMap[item.documentId]"></works-share-card>
                            </div>
                        </template>
                    </template>
                </div>
                <works-share-management ref="worksManagement"></works-share-management>
            </div>
        </div>
    </div>
</template>

<script>
    import worksShareCard from '@/views/pc/Material/components/WorksShareCard.vue';
    import worksShareManagement from '@/views/pc/Material/components/WorksShareManagement.vue';
    export default {
        metaInfo: {
            title: '吾道-共享作品',
            meta: [
                {
                    property: 'og:title',
                    content: '吾道-共享作品'
                },
                {
                    property: 'og:url',
                    content: 'https://www.woodo.cn/work_share/'
                },
            ],
        },
        components:{ worksShareCard, worksShareManagement },
        name: "WorksShareView",
        data() {
            return {
                user: {
			        login: false,
			        name:'',
                    photo:'',
                    email:'',
                },
                skeletonList:[1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20],    // 骨架图列表数组
                showEmpty: false,                  // 空状态展示标识
                showListLoading: false,
                showSkeleton: true,                // 展示骨架图标识
                card_num:0,                         // 一行展示卡片数量
                worksList: [],                     // 作品列表
                allCategoryList:[],               // 作品全部分类列表
                allHotWorksList:[],              // 全部热门作品列表
                hotWorksList:[],                  // 热门作品列表（根据屏幕大小切割后）
                categoryList:[],                   // 作品分类列表（根据屏幕大小切割后）
                favoriteMap:[],                // 作品收藏列表
                currentListType:'first',          // 当前列表状态（first:首页 second:二级列表 search:搜索列表）
                currentCategory:{},                // 当前二级分类
                searchWorksKeyword: '',           // 搜索作品关键词
                searchWorksBegin: false,          // 开始搜索作品标识

                currentCategoryId: null,           // 当前分类id
                showMainHead: true,                // 显示头部
                scrollFirstCategoryTimer: null,    // 滚动时的定时器
                isScroll: false,                     // 是否在滚动
                scrollEndTimer: null              // 滚动结束定时器
            }
        },
        mounted() {
            // 获取登陆状态
            this.user = this.$common.get_login_state();
            // 计算一行展示卡片数量
            this.calculateCardNum();
            // 获取作品分类分组列表
            this.getCategoryList();
            // 浏览器窗口变化时更改卡片显示数量
            $(window).on('resize', () => {
                this.calculateCardNum(() => this.refreshFloorRender());
            });
        },
        methods: {
            // 跳转到登录界面
            toLogin() {
                location.href = "/login/?redirectUrl="+location.pathname;
            },
            // 获取作品分类
            getCategoryList() {
                let that = this;
                that.$axios.get('/api/works_share/all_works_share/',{params:{
                    pageSize: 20,
                    pageNumber: 1,
                    sort:'',
                    cId:'',
                }}).then(data => {
                    if (data.data.code === '2') {
                        that.allCategoryList = data.data.data.dataMap;
                        that.favoriteMapArr = data.data.data.favoriteMap;
                        that.refreshFloorRender();
                        that.showSkeleton = false;
                    } else {
                        console.log(data.data.content);
                    }
                });
            },
            // 获取作品列表
            getWorksList(params) {
                let that = this;
                let id = params.id;
                let number = params.number || 1;
                let keyword = params.keyword || '';
                let scroll = params.scroll;
                that.showEmpty = false;
                that.$axios.get('/api/works_share/list/',{params:{
                    pageSize: 30,
                    pageNumber: number,
                    cId: id,
                    sort: 'newUpload',
                    searchValue: keyword
                }}).then(data => {
                    if(data.data.code == 2){
                        that.showListLoading = false;
                        if (scroll) {
                            that.worksList = that.worksList.concat(data.data.data.resultList);
                        } else {
                            that.worksList = data.data.data.resultList;
                            that.favoriteMapArr = data.data.data.favoriteMap;
                            that.showSkeleton = false;
                        }
                        if (that.worksList.length === 0) that.showEmpty = true;
                        // 绑定滚动加载
                        let pagination = {
                            pageNumber: number,
                            totalPages: data.data.data.totalPages
                        }
                        that.listScrollLoad(pagination, pagination => {
                            that.getWorksList({
                                id:id,
                                number:pagination.pageNumber,
                                scroll: true,
                                keyword: that.searchWorksKeyword
                            })
                        })
                    }else{
                        console.log(data.data.content);
                    }
                })
            },
            // 获取 大家都在看 列表
            getHotList() {
                let that = this;
                that.$axios.get('/api/works_share/hot/list/').then(data => {
                    if (data.data.code === '2') {
                        that.allHotWorksList = data.data.data.dataList;
                        that.refreshFloorRender();
                    } else {
                        console.log(data.data.content);
                    }
                });
            },
            // 获取二级列表
            getSecondWorks(item) {
                this.currentListType = 'second';
                this.currentCategory = item;
                this.pageNumber = 1;
                this.currentCategoryId = item.categoryId;
                this.searchWorksKeyword = '';
                this.showMainHead = false;
                // 回到顶部
                $('.works-share-main').animate({scrollTop: 0}, 0);
                this.getWorksList({id: item.categoryId})
            },
            // 获取搜索作品
            getSearchWorks(e) {
                $(e.target).blur();
                if (this.searchWorksKeyword === '') {
                    this.backFirstWorks();
                } else {
                    this.currentListType = 'search';
                    this.showSkeleton = true;
                    this.getWorksList({keyword: this.searchWorksKeyword});
                    this.getHotList();
                }
            },
            // 清空搜索关键词
            clearSearchKeyword() {
                this.searchWorksKeyword = '';
                if (this.currentListType === 'search') this.backFirstWorks();
            },
            // 返回首页列表
            backFirstWorks(){
                this.currentListType = 'first';
                this.worksList = [];
                this.pageNumber = 1;
                this.currentCategory = {};
                this.searchWorksKeyword = '';
                this.showMainHead = true;
            },
            // 计算一行展示卡片数量
            calculateCardNum(fn) {
                let windowWidth = window.innerWidth || document.documentElement.clientwidinnerWidth || document.body.clientwidinnerWidth;
                if (!$('.works_card')[0]) return;
                let cardWidth = $('.works_card')[0].clientWidth;
                let listOffset = windowWidth <= 1400 ? 0.85 : 0.75;
                let listWidth = windowWidth * listOffset + 28;
                let cardNum = parseInt(listWidth / cardWidth);
                if (cardNum < 3) cardNum = 3;
                this.cardNum = cardNum * 2;
                utils.isFunctionCall(fn);
            },
            // 更新作品楼层渲染
            refreshFloorRender() {
                const that = this;
                let listStr = that.currentListType === 'first' ? 'categoryList' : 'hotWorksList';
                let list = [];
                if (listStr === 'categoryList') {
                    list = that.allCategoryList;
                } else {
                    list = that.allHotWorksList;
                }
                let newList = JSON.parse(JSON.stringify(list));
                if (that.currentListType === 'first') {
                    $.each(list,(index, item) => {
                        newList[index].list = item.list.slice(0, that.card_num);
                    });
                } else {
                    newList = list.slice(0,that.card_num);
                }
                that[listStr] = newList;
            },
            // 滚动加载
            listScrollLoad(pagination, callback) {
                const that = this;
                let isScroll = false;
                let $el = $('.works-main')[0];
                if (pagination && typeof pagination.pageNumber !== 'undefined') {
                    pagination.pageNumber++;
                }
                $el.onscroll = event => {
                    let $this = event.target;
                    let clientHeight = $this.clientHeight;
                    let scrollHeight = $this.scrollHeight;
                    let scrollTop = $this.scrollTop;
                    /**
                     * 滚动触底计算
                     * 滚动偏移量大于0 并且 滚动距离 大于 dom高度 90% 触发加载下一页
                     */
                    let scrollScale = (scrollTop + clientHeight) / scrollHeight;
                    if (scrollTop > 0 && scrollScale > 0.9) {
                        // 列表正在加载中，停止触发
                        if (isScroll) return false;
                        // 当前页 >= 总页数，停止触发回调
                        if (pagination) {
                            if ((pagination.pageNumber - 1) >= pagination.totalPages) {
                                return false;
                            }
                            isScroll = true;
                            that.showListLoading = true;
                            if (typeof callback === 'function') callback(pagination);
                        } else {
                            isScroll = true;
                        }
                    }
                };
            },
            // 打开作品管理弹框
            openWorksManagementModal(type) {
                if (type === 'mywork') {
                    this.$refs.worksManagement.my_works_modal_toggle();
                } else {
                    this.$refs.worksManagement.upload_work_modal_toggle();
                }
            },
            // 切换分类
            toggleCategory(item) {
                let {categoryId} = item;
                if (this.currentCategoryId === categoryId) return;
                this.currentCategoryId = categoryId;
                switch (this.currentListType) {
                    case 'first': // 一级列表
                        // 滚动到指定模块
                        let elContent = this.$refs['worksMain'];
                        let elItem = elContent.querySelector(`[data-id="${categoryId}"]`);
                        let elItemAttr = elItem.getBoundingClientRect();
                        elContent.scrollTop += elItemAttr.top;
                        break;
                    case 'second': // 二级列表
                        this.currentCategory = item;
                        this.getWorksList({id: categoryId});
                        break;
                    case 'search': // 搜索列表
                        this.currentCategoryId = null;
                        break;
                }

            },
            // 滚动切换一级分类
            scrollFirstCategory(e) {
                if (this.currentListType !== 'first') return;
                if (this.scrollFirstCategoryTimer) clearTimeout(this.scrollFirstCategoryTimer);
                this.scrollFirstCategoryTimer = setTimeout(() => {
                    let mainHeight = e.target.offsetHeight;
                    let $firstItem = $(e.target).find('.works-first[data-id]');
                    let categoryId = 0;
                    let maxShowHeight = 0;
                    $firstItem.each(function(){
                        let { top , bottom, height } = this.getBoundingClientRect();
                        // 可视区域被当前元素占满
                        if (top <= 0 && bottom >= mainHeight){
                            categoryId = $(this).attr('data-id');
                            return false;
                        }
                        // 所有元素都离顶部很远时
                        // if(top > 50) return true;
                        // 不在显示范围内 跳过
                        if (top > mainHeight || bottom < 0) return true;
                        // 有标题距离顶部很近时
                        if (top >= 0 && top <= 50) {
                            categoryId = $(this).attr('data-id');
                            return false;
                        }
                        // 出现标题所在位置较远时 判断当前所有在显示区域的元素的显示内容谁更多
                        let thisShowHeight = 0; // 当前元素显示的高度
                        /** 求当前元素显示内容的大小 */
                        if (top < 0) thisShowHeight = bottom; // 头部内容有部分不在显示区域
                        if (bottom > mainHeight) thisShowHeight = mainHeight - top; // 底部内容有部分不在显示区域
                        if (top >0 && bottom < mainHeight) thisShowHeight = height; // 全部内容都在显示区域
                        /** 求当前元素显示内容的大小 end */
                        // 是否为显示内容最大的
                        if (thisShowHeight <= maxShowHeight) return true;
                        maxShowHeight = thisShowHeight;
                        categoryId = $(this).attr('data-id');
                    });
                    if (categoryId) this.currentCategoryId = parseFloat(categoryId);
                }, 300);
            },
            // 滚动结束判断
            scrollEnd() {
                if (this.scrollEndTimer) clearTimeout(this.scrollEndTimer);
                this.isScroll = true;
                this.scrollEndTimer = setTimeout(() => {
                    this.isScroll = false;
                }, 300);
            }

        },
    }
</script>

<style lang="less" scoped>
    @import url("~@/assets/pc/css/common.css");
    // @background_image: url(~@/assets/pc/images/share/share_icon.png) center center no-repeat;
    .works-share-main{
        height:100%;
        overflow: hidden;

        // 分类选项
        .category-list{
            margin-top: 30px;
            width: 100%;
            p {
                color: var(--stressColor);
            }
            ul{
            white-space: nowrap;
                li{
                    display: inline-block;
                    margin-right: 10px;
                    width: 76px;
                    height: 36px;
                    line-height: 34px;
                    text-align: center;
                    border-radius: 5px;
                    border: 1px solid transparent;
                    font-size: 14px;
                    color: var(--textColor);
                    cursor: pointer;
                    &.current{
                        color: var(--mainColor);
                        background-color: rgba(13,123,246,0.10);
                        border-color: var(--mainColor);
                    }

                    &:hover{
                        color: var(--mainColor);
                    }
                }
            }
        }

         // 主体列表
        .works-main{
            width: 100%;
            overflow-y: auto;
            .nav-head-main-contain{
                padding-right: 35px;
            }
            .main-first-head{
                margin: 0 35px;
                height: 220px;
                padding-top: 57px;
                background: url(~@/assets/pc/images/share/head_bg.png) center no-repeat;
                background-size: cover;
                border-radius: 20px;
                .wrapper{
                    display: flex;
                    justify-content: center;
                    width: 100%;
                    &::before{
                        content: '';
                        flex: 1 1 auto;
                        max-width: 180px;
                        visibility: hidden;
                    }
                    .header-left{
                        flex: 1 1 auto;
                        margin-right: auto;
                        min-width: 500px;
                        .title{
                            font-size: 26px;
                            font-weight: 600;
                            color: #ffffff;
                        }
                        p{
                            margin-top: 16px;
                            line-height: 2;
                            font-size: 12px;
                            color:#fff;
                        }
                        .search-work-panel{
                            position: relative;
                            width: 500px;
                            height: 40px;
                            line-height:38px;
                            border-radius: 20px;
                            border: solid 1px #ffffff;
                            text-align:left;
                            font-size:0;
                            opacity:.5;
                            transition:all .3s;
                            .search-btn{
                                display:inline-block;
                                vertical-align:middle;
                                width:14px;
                                height:14px;
                                margin:0 7px 0 15px;
                                // background:@background_image;
                                background-position:0px 0px;
                            }
                            .clear-btn{
                                position:absolute;
                                top:0;
                                right:18px;
                                height:100%;
                                line-height:38px;
                                font-size:22px;
                                color:#fff;
                            }
                            input{
                                display:inline-block;
                                vertical-align:middle;
                                width:calc(100% - 53px);
                                line-height:38px;
                                color:#fff;
                                font-size:12px;
                                &::-webkit-input-placeholder{
                                    color:#bababa;
                                }
                            }
                            &:hover{
                                opacity:1;
                            }
                            &.focus{
                                opacity:1 !important;
                            }
                        }
                    }
                    .header-right{
                        flex: 1 1 auto;
                        display: flex;
                        justify-content: space-between;
                        align-items: center;
                        flex-wrap: wrap;
                        min-width: 330px;
                        max-width: 370px;
                        .upload-works-btn{
                            margin-right: 5%;
                            .base-icon{
                                margin-right: 5px;
                                font-size: 16px;
                                transform: translateY(1px);
                            }
                        }

                        .my-works-btn{
                            background:#fff;
                            color: var(--stressColor);
                        }
                        button{
                            flex: 1 1 auto;
                            display: flex;
                            justify-content: center;
                            align-items: center;
                            max-width: 165px;
                            min-width: 130px;
                            height: 50px;
                            opacity:1;
                            background: var(--mainColor);
                            border-radius: 4px;
                            text-align:center;
                            font-size: 14px;
                            color:#fff;
                            &:hover{
                                opacity:.8;
                                transition:opacity .3s;
                            }
                        }
                    }
                    &::after{
                        content: '';
                        flex: 1 1 auto;
                        max-width: 130px;
                        visibility: hidden;
                    }
                }
            }
            .main-body{
                min-height: calc(100vh - 350px);
                .wrapper{
                    position:relative;
                    margin: 0 35px;
                    transition:transform 0.3s;
                    .works-first{
                        .floor-head{
                            position:relative;
                            height:48px;
                            line-height:48px;
                            width:calc(100% - 28px);
                            user-select:none;
                            h1{
                                font-size:20px;
                                color:var(--stressColor);
                            }
                            .more{
                                position:absolute;
                                right:0;
                                top:0;
                                font-size: 12px;
                                font-weight: 400;
                                color: var(--dimColor);
                                transition:all .3s;
                                &:hover{
                                    color:var(--mainColor);
                                }
                            }
                        }

                        .seat{
                            margin-top: 0;
                            margin-bottom: 0;
                            height: 0;
                            visibility: hidden;
                        }
                    }
                }
                .works_search{
                    padding-top:50px;
                    padding-bottom: 28px;
                }
                .bread-panel{
                    margin-top: 30px;
                    user-select:none;
                    a{
                        font-size:14px;
                        color:var(--stressColor);
                        transition:all .3s;
                        &:hover{
                            color:var(--mainColor);
                        }
                    }
                    span{
                        font-size:14px;
                        color:#7b8696;
                        cursor:default;
                    }
                }
                .hot-result-title{
                    display:block;
                    width:100%;
                    height:22px;
                    line-height:22px;
                    border-bottom:1px solid #cfd8e1;
                    p{
                        display:inline-block;
                        font-size:12px;
                        font-weight: bold;
                        color:var(--stressColor);
                    }
                    .more-template{
                        float:right;
                        font-size:12px;
                        color:var(--stressColor);
                    }
                }
                .no-works{
                    padding:65px 0;
                    text-align:center;
                    div{
                        width:200px;
                        height:200px;
                        margin:0 auto;
                        border-radius:50%;
                        background:#fff url(~@/assets/common/images/empty_1.png) center no-repeat;
                        background-size: contain;
                        background-position-y: -3px;
                    }
                    p{
                        margin-top:12px;
                        font-size:14px;
                        color:#3c3c3c;
                    }
                    a{
                        display:inline-block;
                        margin-top:32px;
                        font-size:14px;
                        color:#717a89;
                        &:hover{
                            color:var(--mainColor);
                        }
                    }
                }
            }
        }
    }
    .list-loading{
        width:100%;
        height:30px;
        margin-top:-70px;
        text-align:center;
        .loading-wrapper{
            display:inline-block;
            width:auto;
            height:100%;
            line-height:30px;
            background:#fff;
            border-radius:15px;
            padding:0 15px 0 10px;
            text-align:center;
        }
        img{
            display: inline-block;
            vertical-align: middle;
        }
        span{
            display: inline-block;
            vertical-align: middle;
            color: #70777e;
            font-size: 12px;
        }
    }
    // 通用列表样式
    .works-list{
        position: relative;
        display: flex;
        flex-wrap: wrap;
        justify-content: space-between;
        margin: 0 auto;
        padding:22px 0 0 20px;
        margin-left:-20px;
        width:calc(100% + 48px);
        height: auto;
        overflow: hidden;
    }
    // 骨架图
    .works-skeleton{
        padding-top:70px;
    }
</style>
