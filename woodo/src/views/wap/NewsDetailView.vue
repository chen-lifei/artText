<template>
    <div class="news_detail_contain" :class="tips ? 'check':''">
        <div class="article_info skeleton" ref="info">
            <div class="news_header">
                <p class="title">{{title}}</p>
            </div>
            <div class="author_info">
                <img :src="news_content.authorHead" v-show="news_content.image">
                <div>
                    <span>来源于: <b>{{news_content.author}}</b></span>
                    <p>{{news_content.createDate}}</p>
                </div>
                <i :class="{like:like}" @click="add_like"> {{like_count}}</i>
                <img src="../../assets/wap/images/news/share_icon.png" @click="show_tips">
            </div>
        </div>
        <div class="news_content skeleton" ref="content"></div>
        <p class="content_tips">资讯来源说明：本文章来自网络收集，如侵犯了你的权益，请联系QQ：850873385进行删除。</p>
        <div class="recommend" v-show="news.length>0">
            <p>为你推荐</p>
            <div class="news_contain skeleton" ref="doc_height">
                <div class="news_list" v-for="(item,index) in news" :key="index" @click="to_news_detail(item)">
                    <div class="news_img">
                        <img :src="item.similarImage" v-show="item.similarImage">
                    </div>
                    <div class="news_detail">
                        <h5 class="news_title">{{item.similarTitle}}</h5>
                        <span class="news_detail">{{item.content_text}}</span>
                        <div class="news_info">
                            <img :src="item.similarAuthorHead" v-if="item.similarAuthorHead">
                            <span class="news_author">{{item.similarAuthorName}}</span>
                            <p class="news_time">{{item.createDate}}</p>
                            <i class="agree_count">{{item.similarLikes !== '' ? '赞'+item.similarLikes:''}}</i>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <transition name="modal_fade">
            <div class="show_tips" v-show="tips" @click="show_tips">
                <img src="../../assets/wap/images/doc/share_tips.png">
            </div>
        </transition>
        <to_top></to_top>
    </div>
</template>
<style lang="less" scoped>
    @import url("../../assets/wap/css/common.css");
    @loading_img: url("/public/images/common/logo-text-gray.png") center center no-repeat;
    .news_detail_contain{
        font-family:"microsoft yahei";
        &.check{
            position:fixed;
            bottom: 0;
            top: 0;
            left: 0;
            right: 0;
            overflow: hidden;
        }
        padding:0.75rem 0.7rem;
        .article_info{
            img{
                width:100%;
            }
        }
        .news_header{
            font-size:0.825rem;
            color:#000;
        }
        .author_info{
            position:relative;
            margin:0.85rem 0;
            width:100%;
            display:flex;
            align-items:center;
            text-align: right;
            img{
                width: 1.5rem;
                height: 1.5rem;
                border-radius:50%;
            }
            img:last-child{
                position: absolute;
                width:0.725rem;
                height:0.725rem;
                right:0;
                border-radius:0;
            }
            span{
                margin:0 1.3rem 0 0;
                color: #282828; 
                font-size:0.6rem;
                max-width:6.4rem;
                overflow:hidden;
                text-overflow:ellipsis;
                white-space: nowrap;
            }
            p{
                position:relative;
                color: #9398a4;
                font-size:0.6rem;
            }
            i{
                position:absolute;
                right:0;
                margin-right:2.9rem;
                display:inline-block;
                font-size:0.6rem;
                color:#282828;
                font-style:normal;
                &:before{
                    content:'';
                    position:relative;
                    top:1px;
                    display:inline-block;
                    background:url("../../assets/wap/images/news/like_icon01.png") center no-repeat;
                    background-size:contain;
                    width: 0.8rem;
                    height:0.7rem;
                }
                &.like{
                    &:before{
                        background:url("../../assets/wap/images/news/like_icon02.png") center no-repeat;
                        background-size:contain;
                    }
                }
            }
            div{
                text-align:left;
                margin-left:0.55rem;
            }
        }
        .news_content{
            border-top:1px solid #e6e7e9;
            padding:1.15rem 0;
            color:#535761;
            font-size:0.6rem;
        }
        .content_tips{
            margin-top:0.8rem;
            padding-bottom:0.65rem;
            font-size:0.4rem;
            color:#c3c9d6;
            border-bottom:1px solid #e6e7e9;
        }
        .frame{
            height:10rem;
            width:100%;
            &:after{
                content:'';
                display:block;
                width:50%;
                height:50%;
                margin:2rem auto;
                background: @loading_img;
                background-size:contain;
            }
        }
        .recommend{
            p:first-child{
                margin-top:1.1rem;
                font-size:0.625rem;
                color:#464951;
            }
        }
        .news_list{
            display:flex;
            justify-content:space-between;
            margin-top:0.9rem;
            padding-bottom: 0.95rem;
            border-bottom:1px dashed #eee;
            .news_img{
                width:32%;
                height:4.25rem;
                border-radius: 0.15rem;
                overflow:hidden;
                background: @loading_img;
                background-size:65% 25%;
                border:1px solid #efefef;
                img{
                    width:100%;
                    height:100%;
                }
            }
            .news_detail{
                width:62%;
                display:flex;
                flex-direction:column;
                justify-content:space-between;
                .news_title{
                    width:90%;
                    color:#333333;
                    font-size:0.6rem;
                    font-weight:800;
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
                    font-size:0.55rem;
                    overflow:hidden;
                    text-overflow:ellipsis;
                    white-space:normal;
                    display:-webkit-box;
                    -webkit-line-clamp:3;
                    -webkit-box-orient:vertical;
                }
            }
            &:last-child{
                border-bottom:none;
            }
        }
        .news_info{
            position:relative;
            font-size:0.55rem;
            img{
                position:relative;
                display:inline-block;
                vertical-align: middle;
                margin-right:0.225rem;
                width:0.75rem;
                height:0.75rem;
                border-radius:50%;
                object-fit: contain;
            }
            span{
                display:inline-block;
                vertical-align: middle;
                color:#333;
                font-weight:600;
                margin-right:0.7rem;
                max-width:3.6rem;
                overflow:hidden;
                text-overflow:ellipsis;
                white-space: nowrap;
            }
            p{
                display:inline-block;
                vertical-align: middle;
                color:#b0b5c2;
            }
            i{
                position: absolute;
                display: inline-block;
                vertical-align: middle;
                font-style: normal;
                right: 0;
                top: 50%;
                color: #b0b5c2;
                margin-top: -0.275rem;
            }
        }
        .skeleton{
            &.news_content,
            .news_header,
            .author_info{
                background-color:#efefef;
            }
            .news_header{
                height:1.2rem;
            }
            .author_info{
                width: 60%;
                height: 1.5rem;
                *{
                    display: none;
                }
            }
            &.news_content{
                height: 60vh;
                background-clip: content-box;
            }
        }
        .show_tips{
            position:fixed;
            top:0;
            bottom:0;
            left:0;
            right:0;
            z-index:2;
            background:rgba(0,0,0,.4);
            img{
                position:absolute;
                width:100%;
                top:0;
            }
        }
    }
</style>
<script>
import to_top from '@/components/WapToTop.vue';
export default {
    components: {
        to_top,
    },
    metaInfo () {
        return {
            title:'吾道-' + this.title,
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
            title:'',
            id:'',
            news_content:[],
            like_count:0,
            like:false,
            news:[],
            tips:false,
        }
    },
    mounted(){
        const that = this;
        that.id = that.$route.query.article;
        that.get_news_detail();
    },
    watch:{
        news_content(){
            $(this.$refs.content).removeClass('skeleton');
            $(this.$refs.info).removeClass('skeleton');
        },
    },
    methods:{
        get_news_detail:function(){
            let that = this;
            if(!that.id) that.$toast('参数错误',1000,'wap');
            that.$axios.get('/api/article/content',{params:{id:that.id}})
            .then(function(data){
                if(data.data.code === '2'){
                    that.news_content = data.data.data;
                    that.title = that.news_content.title;
                    that.like_count = Number(that.news_content.likes);
                    // 小程序过滤iframe非业务域名
                    utils.isMiniProgramENV().then(res =>{
                        if(res.miniprogram){
                            let $dom = $('<div></div>');
                            $dom.html(that.news_content.content);
                            $dom.find('iframe').each(function(){
                                if($(this)[0].src.indexOf('woodo.cn') < 0) $(this).remove();
                            })
                            that.news_content.content = $dom.html();
                            $('.news_content').html(that.news_content.content);
                            $('.news_content img').css('max-width','100%');
                        }else{
                            $('.news_content').html(that.news_content.content);
                            $('.news_content img').css('max-width','100%');
                        }
                    }).catch((res) =>{
                        console.error("error " + res);
                    });
                }else{
                    that.$toast(data.data.content,2000,'wap');
                }
            })
            
            that.$axios.get('/api/article/similar/',{params:{id:that.id,count:5}})
            .then(function(data){
                if(data.data.code === '2'){
                    that.news = that.format_news(data.data.data.similarList);
                }else{
                    that.$toast(data.data.content,2000,'wap');
                }
            })
        },
        add_like:function(){
            let that = this;
            if(!that.like){
                that.$axios.post('/api/article/likes/',{
                    id:that.id
                }).then(function(data){
                    that.like_count++;
                    that.like = true;
                })
            }
        },
        to_news_detail:function(item){
            location.href = '/mobile/news/detail/?article='+item.similarId;
        },
        show_tips:function(){
            let that = this;
            utils.isMiniProgramENV().then(res =>{
                if(res.miniprogram){
                    res.wx.miniProgram.redirectTo({url:'/pages/share/share?type=news'+'&id='+that.id+'&url='+that.id+'&image='+that.news_content.image+'&title='+that.news_content.title});
                }else{
                    that.tips = !that.tips;
                }
            }).catch((res) =>{
                console.error("error " + res);
            });
        },
        // 格式化数据
        format_news:function(arr){
            let format_arr = [];
            if(arr.length <= 0) return false;
            arr.forEach(function(item){
                let $div = document.createElement('div');
                $div.innerHTML = item.similarContent;
                item.content_text = $div.innerText.length > 42 ? $div.innerText.slice(0,42) + '...' : $div.innerText + '...';
                format_arr.push(item);
            });
            return format_arr;
        },
    },
}
</script>
