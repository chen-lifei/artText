<template>
    <!-- 模板中心 -->
    <div class="template_list_contain">
        <!-- 一级分类 -->
        <div class="template_type_contain">
            <div class="template_type">
                <span class="all" @click="choose_all_type" :class="{all_choose:current_cid === null}">全部</span>
                <span class="hot_type" v-for="(item,id) in template_list_type" :key="id"  @click="change_template_type(item.key)" :class="{open:template_type === item.key && show_second_list}">{{item.name}}</span>  
            </div>
            <!-- 二级分类 -->
            <div class="type_list" v-if="show_second_list">
                <div class="category">
                    <span class="type_item" :class="{current:current_cid == item.id}" v-for="item in second_list_type[template_type]" :key="item.id" v-show="template_type  && show_second_list" @click="click_second_list(item)">{{item.name}}</span>
                </div>
            </div>
        </div>
        <!-- 模板卡片 -->
        <div class="template_list skeleton" ref="doc_height">
            <div class="template_item" :class="{template_vip : item.isVip}"v-for="item in template_list" :key="item.id" @click="to_detail(item)">
                <img :src="item.image"/>
                <div class="title_contain">
                    <p class="title">{{item.name}}</p>
                    <div class="member">
                        <span class="use">{{item.usenum}}人使用</span>
                        <span class="hit">{{item.collectCount}}人收藏</span>
                    </div>
                </div>
                <i></i>
            </div>
        </div>
        <!-- 空状态 -->
        <div class="doc_empty" v-if="empty">
            <img src="../../assets/common/images/empty_1.png" />
            <p>暂时没有相关数据！</p>
        </div>
        <!-- 加载中 -->
        <div class="loading" v-show="!empty && template_list.length === 0">
            <img src="../../assets/wap/images/news/loading.gif" />
        </div>
        
        <div class="load_tips" v-if="!empty && total_pages > 1 && template_list.length !== 0" :class="{loading:!template_nomore}"></div>
    </div>
</template>
<style lang="less" scoped>
    @import url("../../assets/wap/css/common.css");
    @loading_img: url("/public/images/common/logo-text-gray.png") center center
    no-repeat;
    .template_list_contain {
        position: relative;
        background: #ffffff;
    }
    .template_type_contain {
        position: relative;
        width: 100%;
        background-color: #ffffff;
        padding:0.8rem 0;
        .template_type {
            display: flex;
            justify-content: space-between;
            align-items: center;
            height: 1.23rem;
            padding:0 0.55rem;
            vertical-align: middle;
            background: #ffffff;
            span{
                position: relative;
                font-size: 0.6rem;
                height: 1.23rem;
                line-height: 0.58rem;
                color: #576070;
                border-radius: 0.17rem;
                border: solid 0.03rem #b6becf;
                padding: 0.3rem 0.5rem 0.3rem 0.53rem;
            }
            .hot_type{
                position: relative;
                padding: 0.3rem 0.8rem 0.3rem 0.33rem;
                &:after {
                    content: "";
                    position: absolute;
                    left: 2.9rem;
                    top: 0.42rem;
                    width: 0;
                    height: 0;
                    border-left: 0.2rem solid transparent;
                    border-right: 0.2rem solid transparent;
                    border-bottom: 0.25rem solid #949ca6;
                    border-radius: 0.1rem;
                    transform: rotate(180deg);
                    transition:transform .3s;
                }
            }
            .open {
                &::after {
                    top: 0.42rem;
                    transform: rotate(0deg);
                }
            }
            .all_choose{
                background:var(--mainColor);
                color: #fff;
                border: none;
            }
        }
        &.list_topfixed{
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            border-bottom: 1px solid #dedede;
            z-index: 10;
            .template_list{
                padding-top: 2.83rem;
            }
        }
    }
    .type_list {
        position: absolute;
        top: 2.5rem;
        left: 0;
        z-index: 9;
        padding: 0.3rem 0.6rem;
        line-height: 1.3rem;
        background: #fff;
        width: 100%;
        color: #373737;
        transition: top 0.5s;
        box-shadow: 0rem 0rem 1rem 0rem rgba(51, 51, 51, 0.11);
    
        span {
            display: inline-block;
            margin-right: 0.7rem;
            font-size: 0.55rem;
            color: #64696f;
            border: none;
            white-space: nowrap;
            &.current {
                color: var(--mainColor);
                border-bottom: none;
            }
        }
        &.open_list {
            top: 0;
            opacity: 1;
            box-shadow: 0 0.1rem 0.1rem #ddd;
        }
    }
    .template_list {
        margin: 0 0.5rem 3.5rem;
        height: auto;
        background: #fff;
        .template_item {
            position: relative;
            display: inline-block;
            margin-bottom: 0.65rem;
            margin-right: 5%;
            width: 47.5%;
            border: solid 0.03rem #e5e5e5;
            border-radius: 0.2rem;
            box-shadow: 0rem 0.15rem 0.2rem 0rem rgba(51, 51, 51, 0.05);
            overflow: hidden;

            &:nth-child(2n){
                margin-right: 0;
            }
            
            img{
                position: absolute;
                top: 0;
                left: 0;
                z-index: 0;
                width: 100%;
            }
            &::before {
                content: "";
                display: block;
                width: 100%;
                height: 4.58rem;
                top: 0;
                left: 0;
                background:#fff @loading_img;
            }
            .title_contain {
                position: relative;
                width: 100%;
                height: 2.1rem;
                background-color: #ffffff;
            }
            .title {
                padding-left: 0.325rem;
                overflow: hidden;
                text-overflow: ellipsis;
                white-space: nowrap;
                color: #3c3c3c;
                font-size: 0.52rem;
                font-weight: bolder;
                line-height: 1.3rem;
            }
            .member {
                position: absolute;
                top: 1rem;
                padding-left: 0.325rem;
                overflow: hidden;
                text-overflow: ellipsis;
                white-space: nowrap;

                .use {
                    margin-right: 1rem;
                    width: 100%;
                    font-size: 0.5rem;
                    color: #b0b5c2;  
                }
                .hit {
                    width: 100%;
                    font-size: 0.5rem;
                    color: #b0b5c2;
                }
            }
            &.template_vip{
                i{
                    position: absolute;
                    top:5px;
                    right:5px;
                    width:20px;
                    height:20px;
                    border-radius: 5px;
                    background: #f7b500 url(../../assets/wap/images/common/vip.png) no-repeat center center;
                    background-size: 15px 15px;
                }
            }
        }
    }
    &.skeleton {
        .template_item {
            width: calc((100% - 5%) / 2);
            margin-bottom: 0.65rem;
            border: 0.03rem solid #efefef;
            
            &::before {
                content: "";
                width: 100%;
                height: 4.58rem;
                top: 0;
                left: 0;
                background:#fff @loading_img;
            }
        }
    }
    .load_tips {
        text-align: center;
        margin: 0.4rem 0;
        &.loading {
            content: "";
            display: block;
            background: url("../../assets/wap/images/news/loading.gif");
            width: 1rem;
            height: 1rem;
            background-size: contain;
            margin: 1rem auto 4rem;
        }
    }
    .doc_empty {
        position: absolute;
        display: inline-block;
        text-align: center;
        width: 100%;
        background: #fff;

        img {
            width: 11rem;
            height: 10rem;
        }
        p {
            display: block;
            height: 3rem;
            line-height: 3rem;
            font-size: 0.7rem;
            color: #333;
            padding-left: 0.5rem;
        }
    }
    .loading {
        margin:7rem auto;
        width: 2rem;
        height:2rem;
        img {
            width: 100%;
            height: 100%;
        }
    }
</style>
<script>
import bottom_bar from '@/components/WapBottomBar.vue';
export default {
    name: "TemplateCenter",
    metaInfo () {
        return {
            title: '吾道-模板中心',
            meta: [
                {
                    name: 'viewport',
                    content: "width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0"
                },
                {
                    property: 'og:title',
                    content: '吾道-模板中心'
                },
                {
                    property: 'og:url',
                    content: 'https://www.woodo.cn/mobile/square/#template'
                },
            ]
        }
    },
    data() {
        return {
            template_list:[
                {"id":0,"createDate":0,"modifyDate":0,"order":0,"sn":"","name":"","image":"","usenum":0,"documentId":0,"collectCount":0},
                {"id":0,"createDate":0,"modifyDate":0,"order":0,"sn":"","name":"","image":"","usenum":0,"documentId":0,"collectCount":0},
                {"id":0,"createDate":0,"modifyDate":0,"order":0,"sn":"","name":"","image":"","usenum":0,"documentId":0,"collectCount":0},
                {"id":0,"createDate":0,"modifyDate":0,"order":0,"sn":"","name":"","image":"","usenum":0,"documentId":0,"collectCount":0},
                {"id":0,"createDate":0,"modifyDate":0,"order":0,"sn":"","name":"","image":"","usenum":0,"documentId":0,"collectCount":0},
                {"id":0,"createDate":0,"modifyDate":0,"order":0,"sn":"","name":"","image":"","usenum":0,"documentId":0,"collectCount":0},
                {"id":0,"createDate":0,"modifyDate":0,"order":0,"sn":"","name":"","image":"","usenum":0,"documentId":0,"collectCount":0},
                {"id":0,"createDate":0,"modifyDate":0,"order":0,"sn":"","name":"","image":"","usenum":0,"documentId":0,"collectCount":0},
                {"id":0,"createDate":0,"modifyDate":0,"order":0,"sn":"","name":"","image":"","usenum":0,"documentId":0,"collectCount":0},
                {"id":0,"createDate":0,"modifyDate":0,"order":0,"sn":"","name":"","image":"","usenum":0,"documentId":0,"collectCount":0},
                {"id":0,"createDate":0,"modifyDate":0,"order":0,"sn":"","name":"","image":"","usenum":0,"documentId":0,"collectCount":0},
                {"id":0,"createDate":0,"modifyDate":0,"order":0,"sn":"","name":"","image":"","usenum":0,"documentId":0,"collectCount":0},
            ],                                          //骨架图
            page_number: 1,                             //页数
            current_cid: null,                          //类型id
            empty: false,                               //空状态隐藏
            useTagList: [],                             //热门用途
            categoryList: [],                           //热门行业
            styleTagList: [],                           //热门风格
            template_type: "all",                       //开始显示全部
            show_second_list: false,                    //二级分类菜单隐藏
            template_nomore: false,                     //判断是否还有作品
            total_pages: null,                          //总的页数
            template_list_type:[
                {name:'热门用途',key:'categoryList'},
                {name:'热门行业',key:'useTagList'},
                {name:'热门风格',key:'styleTagList'}
            ],                                          //一级列表
            second_list_type:{}                         //二级列表
        };
    },
    mounted() {
        const that = this;
        // 获取模板列表
        that.get_template_list({
            id: that.current_cid,
        });
        // 滚动监听，将模板类型置顶
        let tag_top = $('.template_type_contain').offset().top;
        document.addEventListener('scroll',() => {
            if($(document).scrollTop() > tag_top && !that.is_search) {
                $('.template_type_contain').addClass('list_topfixed');
            }else {
                $('.template_type_contain').removeClass('list_topfixed'); 
            }
        })
    },
    watch:{
        // 加载完成后去除骨架图
        template_list(){
            $(this.$refs.doc_height).removeClass('skeleton');
        },
    },
    methods: {
        //获取模板列表
        get_template_list: function(obj) {            
            let that = this,
                type_item_id = null,
                template_id = null;
            let $params = {
                pageSize: 20,
                pageNumber: 1,
                cId: '',
                tId: '',
                id: '',
            }
            // 合并接口参数
            $params = Object.assign($params, obj);
            if (that.template_type === "categoryList") {
                $params.cId = $params.id;
            } else {
                $params.tId = $params.id;
            }
            if (+$params.pageNumber === 1) {
                // 首次加载或切换分类时清空列表并触发加载状态
                that.template_list = [];
                that.empty = false;
            }
            that.$axios.get("/api/template/search/", {params:{
                pageSize: $params.pageSize,
                pageNumber: $params.pageNumber,
                cId: $params.cId,
                tId: $params.tId,
                sort: 'hot'
            }}).then(function(data) {
                if(data.data.code !== '2'){
                    that.$toast(data.data.content, 2000, 'wap');
                    return;
                }
                let res_data = data.data.data;
                that.template_list = that.template_list.concat(res_data.dataList);
                that.second_list_type.categoryList = res_data.categoryList;
                that.second_list_type.useTagList = res_data.useTagList;
                that.second_list_type.styleTagList = res_data.styleTagList;
                that.empty = that.template_list.length === 0;
                that.total_pages = res_data.totalPages;
                // 绑定滚动加载
                that.template_load_more({
                    pageNumber: $params.pageNumber,
                    totalPages: res_data.totalPages
                })
            });
        },
        // 滚动加载方法
        template_load_more: function(obj) {
            let that = this;
            utils.onReachBottom({
                $scroll: window,
                // 阻止触发
                factor: function() {
                    if(that.$parent.current_page !== 'template') return true;
                },
                // 触底时触发
                onReach: function() {
                    let _pageNumber = obj.pageNumber,  // 当前页码
                        _totalPages = obj.totalPages;  // 总页码
                    _pageNumber++;
                    if(_pageNumber <= _totalPages){
                        that.get_template_list({
                            id: that.current_cid,
                            pageNumber: _pageNumber
                        })
                    }else{
                        that.template_nomore = true;
                        that.$toast('没有更多了~', 1000, 'wap');
                    }
                }
            })
        },

        //点击一级分类列表
        change_template_type: function(item) {
            let that = this;           
            if (item !== 'all') {
                if (that.template_type === item) {
                    that.show_second_list = !that.show_second_list;  
                }else{
                    that.template_type = item;
                    that.show_second_list = true; 
                }
            }           
        },
        
        //点击全部选项
        choose_all_type:function () {
            let that = this;
            that.show_second_list = false;
            if (that.template_type !== 'all') {
                that.page_number = 1;
                that.template_type = 'all';
            }
            if (that.current_cid !== null) {
                that.current_cid = null;
                that.page_number = 1;
                that.get_template_list();
                that.template_type = 'all'
            }
        },

        //点击二级分类菜单种类
        click_second_list: function(item) {
            let that = this;
            that.page_number = 1;   
            that.show_second_list = false;      
            if (that.current_cid !== item.id) {
                that.current_cid = item.id
               that.get_template_list({
                   id: item.id
               })
            }
        },
        //跳转到详情页
        to_detail:function (item) {
            location.href = "/mobile/template/detail/?id=" + item.id
        }
    }
};
</script>