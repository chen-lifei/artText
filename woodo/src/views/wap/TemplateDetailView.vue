<template>
    <div class="template_detail_contain">
        <div class="template_content skeleton" ref="skeleton">
            <div class="template_banner" ref="template_banner">
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
            <div class="template_name">{{template_detail.name}}</div>
            <div>
                <div class="author_avatar">
                    <img :src="author_info.headUrl" v-show="author_info.headUrl">
                </div>
                <div class="author_info">
                    <p>贡献者：<i class="author_name">{{author_info.name}}</i></p>
                    <p>作品：<i class="template_count">{{author_info.count}}</i></p>
                </div>
            </div>
            <div class="template_info">
                <span>{{page_list.length ? '文件格式：PPTX':''}}</span>
                <span>{{page_list.length ? '文件页数：'+page_list.length:''}}</span>
                <span>{{template_detail.usenum ? '使用次数：'+template_detail.usenum:''}}</span>
                <span>{{category ? '文档分类：'+category:''}}</span>
            </div>
        </div>
        <div class="btn">
            <a class="collect_btn" @click="favorite_document" :class="{favorite:is_favorite}">{{collect_num}}人收藏</a>
            <a class="to_show_btn" @click="to_template_slide">预览</a>
        </div>
        <div class="footer">模板在手机端暂不支持编辑，请收藏后使用电脑编辑</div>
    </div>
</template>
<style lang="less" scoped>
    @import url("../../assets/wap/css/common.css");
    @loading_img: url("/public/images/common/logo-text-gray.png") center center no-repeat;

    .template_detail_contain{
        position: fixed;
        padding: 0.75rem;
        width:100%;
        top:0;
        bottom:0;
        .template_content{
            padding-bottom: 0.9rem;
            border-bottom:1px solid #e6e7e9;
            p{
                color:#333;
                font-size:0.6rem;
                line-height:0.9rem;
            }
        }
        .template_banner{
            position:relative;
            width:100%;
            margin-bottom: 1rem;
            border:1px solid rgba(107, 35, 35, 0.2);
            overflow: hidden;
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
            }
            img{
                display:inline-block;
                width:100%;
            }
        }
        .template_name{
            position:relative;
            color:#282828;
            font-size:0.75rem;
            padding-right: 2rem;
            margin-bottom:0.55rem;
            font-weight:600;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
        }
        .author_avatar{
            display:inline-block;
            vertical-align: top;
            width:1.5rem;
            height:1.5rem;
            border-radius:50%;
            overflow: hidden;
            img{
                width:100%;
                height:100%;
            }
        }
        .author_info{
            display:inline-block;
            width: calc(100% - 2rem);
            margin-left: 0.5rem;
            height: 1.5rem;
            vertical-align: top;
            font-size:0.6rem;
            color:#282828;
            margin-bottom:0.65rem;
            overflow: hidden;
            p{
                float: left;
                width: 50%;
                padding-left: 0.5rem;
                line-height: 1.5rem;
                overflow: hidden;
                text-overflow: ellipsis;
                white-space: nowrap;
                &:first-child{
                    padding-left: 0;
                }
            }
            .author_name{
                font-style:normal;
                font-weight:600;
            }
            .template_count{
                font-style:normal;
                color:var(--mainColor);
            }
        }
        .template_info{
            font-size:0.6rem;
            color:#282828;
            margin-left:2.05rem;
            span{
                display:inline-block;
                margin-bottom:0.4rem;
                width:50%;
                &:nth-of-type(2n) {
                    padding-left: 0.5rem;
                }
            }
        }
        .btn{
            a{
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
                margin-top:1.125rem;
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
                margin-top:0.425rem;
                background:var(--mainColor);
                color:#fff;
            }
        }
        .footer{
            position:absolute;
            bottom:0.325rem;
            right:0;
            left:0;
            text-align:center;
            font-size:0.6rem;
            color:#b0b5c2;
        }
        .skeleton{
            .template_name,
            .template_info,
            .author_info p,
            .author_avatar{
                background-color:#efefef;
            }
            .template_name{
                height: 1rem;
            }
            .author_info p{
                font-size: 0;
            }
            .template_info{
                height: 2.4rem;
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
            title:this.title,
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
            title:'吾道-模板中心',
            template_id:null,
            template_detail:{},
            vertical_page:{},
            is_favorite:false,
            user:{},
            is_login:false,
            page_list:[],
            doc_info:{},
            carousel_key:0,
            author_info:{},
            category:'',
            collect_num:0,
            change_count:true,
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
        that.user = that.$common.get_login_state();
        that.is_login = that.user.login;
        that.template_id = that.$route.query.id;
        that.get_template_detail();
        that.banner_play();
    },
    watch:{
        template_detail(){
            $(this.$refs.skeleton).removeClass('skeleton');
        },
    },
    methods:{
        // 自动轮播
        banner_play:function(){
            let that=this;
            setInterval(function(){
                that.carousel_key++;
                if(that.carousel_key===that.page_list.length){
                    that.carousel_key=0;
                }
            },3000)
        },
        // 请求文档详情
        get_template_detail: function(){
            let that = this;
            that.$axios.get('/api/template/detail/'+that.template_id)
                .then(function(data){
                    if(data.data.code === '2'){
                        let document_info = that.$common.document_dataparse(data.data.data.document);
                        let document_pages = that.$common.document_pages_dataparse(data.data.data.documentPages);
                        that.reset_page_content(document_info, document_pages);
                        that.doc_info = document_info;
                        that.page_list = document_pages;
                        that.category = data.data.data.category;
                        that.author_info = data.data.data.author;
                        that.template_detail = data.data.data.template;
                        that.title = '吾道-模板中心-' + that.template_detail.name;
                        that.collect_num = that.template_detail.collectCount ? that.template_detail.collectCount:0;
                        that.is_favorite = data.data.data.collect;
                    }else if(data.data.code === '3'){
                        that.$toast(data.data.content,1000,'wap');
                    }
                });
        },
        // 重置文档页
        reset_page_content:function(document_info, list, type){
            let that = this, 
                pages = list,
                page_list = JSON.parse(JSON.stringify(pages)),
                ratio = document_info.width / document_info.height,
                svg_w = document_info.width,
                svg_h = document_info.height,
                vertical_page_w = that.$refs.template_banner.clientWidth,
                vertical_page_h = vertical_page_w / ratio;
            // 保存竖屏内容
            that.vertical_pages_template.w = vertical_page_w;
            that.vertical_pages_template.h = vertical_page_h;
            that.vertical_pages_template.view[2] = document_info.width;
            that.vertical_pages_template.view[3] = document_info.height;
            that.$refs.template_banner.style.height = vertical_page_h + 'px';
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
                    type: 'template'
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
        // 跳转演示页
        to_template_slide: function(){
            if(!this.template_id) return;
            window.location.href = `/mobile/template/slides/${this.template_id}/`;
        }
    },
}
</script>
