<template>
    <div class="shareworks_detail_contain">
        <div class="work_content skeleton" ref="skeleton">
            <div class="work_banner" ref="work_banner">
                <div class="carousel_open">
                    <div>
                        <div class="wap_page"
                         v-for="(item,index) in page_list" :key="index" 
                         v-show="index === carousel_key">
                            <div class="svg_list" :style="{height:`${vertical_pages_template.h}px`,width:`${vertical_pages_template.w}px`}">
                                <svg_modal ref="svg_modal" 
                                    :svg_w="vertical_pages_template.w"
                                    :svg_h="vertical_pages_template.h"
                                    :svg_view="vertical_pages_template.view"
                                    :document="doc_info"
                                    :page_info="item"
                                    :mode="`preload`"
                                    :lazyshow="Math.abs(index - carousel_key) < 3"
                                ></svg_modal>
                            </div>
                        </div>
					</div>
				</div>
            </div>
            <div class="work_name">
                {{work_detail.worksName}}
                <span :class="category_color" :style="{padding:work_detail.category ? '0.1rem 0.2rem':0}">{{work_detail.category}}</span>
            </div>
            <div class="author_info">
                <div class="author_img"><img :src="work_detail.authorImg" v-show="work_detail.authorImg"></div>
                <p>贡献者：<i>{{work_detail.authorName}}</i></p>
                <span>{{work_detail.date}}</span>
            </div>
            <p :class="{text_hidden:text_overflow}">{{work_detail.introduce}}</p>
        </div>
        <div class="btn">
            <a class="collect_btn" @click="favorite_document" :class="{favorite:is_favorite}">{{collect_num}}人收藏</a>
            <a class="to_show_btn" @click="to_work_slide">预览</a>
        </div>
        <div class="footer">手机端暂不支持编辑模板，请收藏后使用电脑编辑</div>
    </div>
</template>
<style lang="less" scoped>
    @import url("../../assets/wap/css/common.css");
    @loading_img: url("/public/images/common/logo-text-gray.png") center center no-repeat;

    .shareworks_detail_contain{
        position: fixed;
        padding: 0.75rem;
        width:100%;
        top:0;
        bottom:0;
        .work_content{
            p{
                color:#333;
                font-size:0.6rem;
                line-height:0.9rem;
            }
        }
        .work_banner{
            position:relative;
            width:100%;
            margin-bottom: 1rem;
            &::before{
                content: "";
                display: block;
                padding-top: 56.25%;
            }
            .carousel_open{
                position:absolute;
                top:0;
                bottom:0;
                left:0;
                right:0;
                overflow:hidden;
                background: @loading_img;
                border:1px solid rgba(185, 185, 185, 0.2);
            }
        }
        .work_name{
            position:relative;
            padding-right: 4rem;
            margin-bottom:0.55rem;
            font-size:0.75rem;
            color:#282828;
            font-weight:600;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
            span{
                position:absolute;
                right:0;
                color:#fff;
                font-size:0.6rem;
                border-radius:2px;
                background:#fff;
                &.currency{
                    background:#7fc2a0;
                }
                &.business{
                    background:#303030;
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
        .author_info{
            position:relative;
            padding-bottom:0.6rem;
            height:2.1rem;
            line-height:1.5rem;
            font-size:0.6rem;
            color:#282828;
            border-bottom:1px solid #e6e7e9;
            margin-bottom:0.6rem;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
            .author_img{
                display:inline-block;
                vertical-align: top;
                width:1.5rem;
                height:1.5rem;
                border-radius:50%;
                img{
                    border-radius:50%;
                    width:100%;
                    height:100%;
                }
            }
            p{
                display:inline-block;
                vertical-align: top;
                margin-left:0.5rem;
                line-height:1.5rem;
                i{
                    font-style:normal;
                    font-weight:500;
                }
            }
            span{
                display:inline-block;
                vertical-align: top;
                line-height:1.5rem;
                float: right;
            }
        }
        .btn{
            a{
                position:absolute;
                display:block;
                text-align:center;
                height:2.5rem;
                right:0.75rem;
                left:0.75rem;
                line-height:2.5rem;
                font-size:0.75rem;
                border-radius:0.1rem;
            }
            .collect_btn{
                bottom:5.5rem;
                background:#eceef3;
                color:#282828;
                display:flex;
                align-items:center;
                justify-content:center;
                &::before{
                    content:'';
                    display:inline-block;
                    margin-right:0.4rem;
                    width:0.875rem;
                    height:0.85rem;
                    background:url("../../assets/wap/images/shareworks/collect_gray.png");
                    background-size:contain;
                }
                &.favorite{
                    &:before{
                        background:url("../../assets/wap/images/shareworks/collect_02.png");
                    }
                }
            }
            .to_show_btn{
                bottom:2.5rem;
                background:var(--mainColor);
                color:#fff;
            }
        }
        .footer{
            position:absolute;
            bottom:0.825rem;
            right:0;
            left:0;
            text-align:center;
            font-size:0.6rem;
            color:#b0b5c2;
        }
        .text_hidden{
            display:-webkit-box;
            overflow:hidden;
            text-overflow:ellipsis;
            -webkit-line-clamp:3;
            word-break:break-all;
            -webkit-box-orient: vertical;
        }
        .skeleton{
            p,
            .work_name,
            .author_img,
            .author_info span{
                background-color:#efefef;
            }
            .work_name{
                height:1rem;
                span {
                    display: none;
                }
            }
            .author_info{
                p {
                    width: 6rem;
                    height: 100%;
                    font-size: 0;
                }
                span {
                    width: 3rem;
                    height: 100%;
                }
            }
            p:last-child {
                height: 5em;
            }
        }
    }
</style>
<script>
import svg_modal from '@/components/SvgPageModal.vue';
export default {
    components: { svg_modal },
    metaInfo () {
        return {
            title: this.title,
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
            title:'吾道-共享作品',
            work_id:0,
            work_detail:{},
            collect_num:0,
            is_favorite:false,
            user:{},
            is_login:false,
            page_list:[],
            doc_info:{},
            page_number:0,
            carousel_key:0,
            change_count:true,
            category_color:'',
            text_overflow:false,
            vertical_pages_template: {    
                w: 910,
                h: 0,
                view:[0,0,0,0]
            },
            get_banner_h:null,
            timer:null,
        }
    },
    mounted(){
        const that = this;
        // 获取当前用户信息
        that.user = that.$common.get_login_state();
        that.is_login = that.user.login;
        that.work_id = that.$route.query.id;
        that.get_work_detail(that.work_id);
        that.banner_play();
        let screen_h = window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight;
        setTimeout(() => {
            let body_h = $('.work_content').height();
            if(body_h + 170 > screen_h){
                that.text_overflow = true;
            }else{
                that.text_overflow = false;
            }
        }, 500);
    },
    watch:{
        work_detail(){
            $(this.$refs.skeleton).removeClass('skeleton');
        },
    },
    methods:{
        // 轮播图
        banner_play:function(){
            let that=this;
            setInterval(function(){
                that.carousel_key++;
                if(that.carousel_key===that.page_list.length){
                    that.carousel_key=0;
                }
            },3000)
        },
        // 获取文档详情
        get_work_detail(work_id){
            let that = this;
            that.$axios.get('/api/works_share/detail/'+work_id)
            .then(function(data){
                if(data.data.code === '2'){
                    let document_info = that.$common.document_dataparse(data.data.data.document);
                    let document_pages = that.$common.document_pages_dataparse(data.data.data.documentPages);
                    let is_favorite = data.data.data.collect;
                    that.reset_page_content(document_info, document_pages);
                    that.work_detail = data.data.data;
                    that.doc_info = document_info;
                    that.is_favorite = is_favorite;
                    that.page_list = document_pages;
                    that.get_color();
                    that.title = '吾道-共享作品-' + that.work_detail.worksName;
                    that.collect_num = that.work_detail.collectNum ? that.work_detail.collectNum:0;
                    $.each(that.page_list,function(i,item){
                        item.elementList = item.elementList ? JSON.parse(item.elementList) : [];
                    });
                }
            })
        },
        // 重置文档页
        reset_page_content:function(document_info, list, type){
            let that = this, 
                pages = list,
                page_list = JSON.parse(JSON.stringify(pages)),
                ratio = document_info.width / document_info.height,
                svg_w = document_info.width,
                svg_h = document_info.height,
                vertical_page_w = that.$refs.work_banner.clientWidth,
                vertical_page_h = vertical_page_w / ratio;
            // 保存竖屏内容
            that.vertical_pages_template.w = vertical_page_w;
            that.vertical_pages_template.h = vertical_page_h;
            that.vertical_pages_template.view[2] = svg_w;
            that.vertical_pages_template.view[3] = svg_h;
            that.$refs.work_banner.style.height = vertical_page_h + 'px';
        },
        // 分类底色
        get_color:function(){
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
            for (let i in search){
                for(let item in search[i].text){
                    if(this.work_detail.category.indexOf(search[i].text[item]) >= 0){
                        color = search[i].color;
                        this.category_color = color;
                        return
                    }
                }
            }
            this.category_color = color;
        },
        // 收藏文档
        favorite_document:function(){
            let that = this,
                id = that.doc_info.id,
                state, toast, url;
            if(!that.is_login){
                that.$toast('请登录后再进行操作',1000,'wap');
                setTimeout(() => {
                    that.to_login();
                }, 1000);
                return;
            }
            if(that.is_favorite && that.change_count){
                url = '/api/member/delete_collect/';
                toast = "取消收藏成功";
                that.collect_num--;
                that.change_count = false;
                state = false;
            }else if(!that.is_favorite && that.change_count){
                url = '/api/member/collection/';
                toast = "收藏成功";
                that.collect_num++;
                that.change_count = false;
                state = true;
            }
            if(!that.change_count){
                that.$axios.post(url,{
                    documentId: id,
                    type: 'works'
                }).then(function(data){
                    if(data.data.code === '2'){
                        that.is_favorite = state;
                        that.$toast(toast,1000,'wap');
                        that.change_count = true;
                    }else{
                        that.$toast(data.data.content,1000,'wap')
                    }
                })
            }
        },
        // 跳转登录
        to_login:function(){
            let redirect_url = encodeURI(window.location.pathname + window.location.search);
            window.location.href = '/mobile/login/?redirectUrl=' + redirect_url;
        },
        // 跳转到演示页
        to_work_slide: function(){
            if(!this.work_id) return;
            window.location.href = `/mobile/works/slides/${this.work_id}/`;
        }
    },
}
</script>
