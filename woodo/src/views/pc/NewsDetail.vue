<template>
    <div class="news">
        <CommonHead :options="{theme:'transparent'}"></CommonHead>
        <div class="body">
            <div class="detail skeleton" ref="detailSkeleton">
                <!--封面-->
                <div class="news_banner">
                    <img v-if="detail.image" :src="detail.image" alt="">
                </div>
                <!--标题栏-->
                <div class="news_head">
                    <p>{{detail.title}}</p>
                    <div class="author_message">
                        <img v-if="detail.authorHead" :src="detail.authorHead" alt="">
                        <span>来源于： </span>
                        <span>{{detail.author}}</span>
                        <span>{{detail.createDate}}</span>
                        <span :class="{checked: detail.had_like}" @click="like_news">{{detail.likes}}</span>
                        <i class="share_wechat" @mouseover="show_wechat_code" @mouseout="hide_wechat_code"></i>
                        <i class="share_sina" @click="share_sina"></i>
                    </div>
                    <transition name="model-fade">
                        <div class="qr_code" v-show="show_code">
                            <canvas id="wechat_code"></canvas>
                            <span>使用微信扫码分享</span>
                        </div>
                    </transition>
                </div>
                <div class="news_body">
                    <div v-html="detail.content"></div>
                    <p class="content_tips">资讯来源说明：本文章来自网络收集，如侵犯了你的权益，请联系QQ：850873385进行删除。</p>
                </div>
                <div class="news_foot" v-if="similar.length > 0">
                    <p>相关文章</p>
                    <div class="similar_news"
                         v-for="item in similar"
                         @click="to_similar(item.similarId)"
                    >
                        <img :src="item.similarImage" alt="">
                        <span>{{item.similarTitle}}</span>
                    </div>
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
                    <span v-for="item in tag" @click="checked_tag(item)">{{item}}</span>
                </div>
            </div>
        </div>
        <CommonFoot></CommonFoot>
    </div>
</template>

<script>
    import CommonHead from '@/components/nav/CommonHead.vue';
    import CommonFoot from '@/components/nav/CommonFoot.vue';
    import Vue from 'vue';
    import QRCode from 'qrcode';
    Vue.use(QRCode);
    export default {
        metaInfo: {
            title: '吾道-资讯详情',
            meta: [
                {
                    property: 'og:title',
                    content: '吾道-资讯详情'
                },
                {
                    property: 'og:url',
                    content: 'https://www.woodo.cn/news/detail/'
                },
            ]
        },
        components:{CommonHead, CommonFoot},
        name: "NewsDetail",
        data() {
            return {
                detail: {},
                similar: [],
                template: [
                    {"templateImage":"","templateName":"","templateId":0},
                    {"templateImage":"","templateName":"","templateId":0},
                    {"templateImage":"","templateName":"","templateId":0},
                    {"templateImage":"","templateName":"","templateId":0},
                ],
                tag: [],
                show_code: false,
            }
        },
        watch:{
            detail(){
                $(this.$refs.detailSkeleton).removeClass('skeleton');
            },
            template(){
                $(this.$refs.templateSkeleton).removeClass('skeleton');
            }
        },
        methods: {
            get_detail:function(id){
                let that = this,
                    obj = {};
                if(!id) that.$toast('参数错误',1000);
                that.$axios.get('/api/article/content',{params:{id:id}})
                    .then(function(data){
                        if(data.data.code === '2'){
                            let result = data.data.data;
                            // 抽取详情数据
                            obj.id = result.id;
                            obj.image = result.image;
                            obj.title = result.title;
                            obj.content = result.content;
                            obj.author = result.author;
                            obj.authorHead = result.authorHead;
                            obj.createDate = result.createDate.split(' ')[0];
                            obj.likes = result.likes;
                            obj.had_like = false;
                            that.detail = obj;
                            that.$nextTick(function(){
                                $(".news_body").find("img").each(function(i,item){
                                    $(item).css("max-width",'660px');
                                });
                            })
                            
                        }else{
                            that.$toast('获取详情失败，请刷新重试',800);
                        }
                    })
                that.$axios.get('/api/article/tags/')
                    .then(function(data){
                        if(data.data.code === '2'){
                            let result = data.data.data;
                            // 抽取标签列表
                            that.tag = result.tagList;                            
                        }else{
                            that.$toast('获取标签失败',800);
                        }
                    })
                that.$axios.get('/api/article/similar/',{params:{id:id}})
                    .then(function(data){
                        if(data.data.code === '2'){
                            let result = data.data.data;
                            // 抽取相关文章列表
                            that.similar = result.similarList;
                        }else{
                            that.$toast('获取相关文章失败',800);
                        }
                    })
                that.$axios.get('/api/article/templates/')
                    .then(function(data){
                        if(data.data.code === '2'){
                            let result = data.data.data;
                            // 抽取推荐列表
                            that.template = result.templateList;
                        }else{
                            that.$toast('获取热门模板失败',800);
                        }
                    })
                
            },
            share_sina:function(){
                let that = this,
                    title = that.detail.title,
                    url = window.location.href,
                    sharesinastring = 'http://v.t.sina.com.cn/share/share.php?title='+
                        title +'&url='+ url +'&content=utf-8&sourceUrl='+ url;
                window.open(sharesinastring,'newwindow','height=400,width=400,top=100,left=100');
            },
            to_similar:function(id){
                let that = this;
                if($validate(id).empty()) return false;
                window.location.href = '/news/detail/?article=' + id;
            },
            to_template:function(id){
                window.location.href = '/template/detail/?templateId='+id;
            },
            like_news:function(){
                let that = this;
                if(that.detail.had_like) return false;
                that.$axios.post('/api/article/likes/',{id: that.detail.id})
                    .then(function(data){
                        that.detail.had_like = true;
                        that.detail.likes = data.data;
                    })
            },
            checked_tag:function(name){
                let that = this;
                if($validate(name).empty()) return false;
                // 使用 name 传递参数，目标页面使用 params 接受参数，刷新失效（需要在route/index.js 中提前设置）
                that.$router.push({name: 'news', params:{tag:name}});
            },
            show_wechat_code:function(){
                this.show_code = true;
            },
            hide_wechat_code:function(){
              this.show_code = false;
            },
        },
        mounted() {
            const that = this;
            let id = that.$route.query.article;
            that.get_detail(id);
            // 分享二维码
            let _url = window.location.href,
                canvas = document.getElementById('wechat_code');
            QRCode.toCanvas(canvas, _url, {width:132}, function(error) {
                if(error) console.error(error);
            });

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
        min-width:1240px;
        width:100%;
        height:100%;
        background:#fff;
        overflow-y:auto;
        .body{
            width:1104px;
            padding:45px 56px 0;
            margin:0 auto;
            &:before{
                content:'';
                position:absolute;
                background:var(--mainColor);
                width:100%;
                height:60px;
                top:0;
                left:0;
                z-index:-1;
            }
            .detail{
                display:inline-block;
                width:660px;
                margin-bottom:100px;
                font-size:0;
                &.skeleton{
                    .news_head p,
                    .news_head .author_message{
                        background-color: @skeleton_color;
                    }
                    .news_head .author_message{
                        width: 50%;
                        span, i, img{
                            display: none;
                        }
                    }
                    .news_body>div{
                        height: 720px;
                    }
                }
            }
            .recommend_bar{
                display:inline-block;
                width:266px;
                margin-left:65px;
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
        }
        .footer {
            background-color:#030711;
        }
        .detail{
            .news_banner{
                width:100%;
                height:290px;
                line-height:290px;
                margin-bottom:30px;
                overflow:hidden;
                background: @skeleton_color @image_loading;
                img{
                    display:inline-block;
                    width:100%;
                    vertical-align:middle;
                }
            }
            .news_head{
                position:relative;
                height:110px;
                border-bottom:1px solid #ededed;
                p{
                    height: 30px;
                    line-height:30px;
                    font-size:24px;
                    color:#3b3b3b;
                    white-space:nowrap;
                    overflow:hidden;
                    text-overflow:ellipsis;
                }
                .author_message{
                    position:relative;
                    height:26px;
                    line-height:26px;
                    margin-top:30px;
                    img{
                        display:inline-block;
                        width:24px;
                        height:24px;
                        margin-right:15px;
                        border-radius:24px;
                        vertical-align:middle;
                    }
                    span{
                        display:inline-block;
                        height:26px;
                        font-size:12px;
                        vertical-align:middle;
                    }
                    span:nth-child(2){
                        color:#999999;
                    }
                    span:nth-child(3){
                        margin-right:32px;
                        color:#ae8330;
                    }
                    span:nth-child(4){
                        margin-right:80px;
                        color:#aeaeae;
                    }
                    span:nth-child(5){
                        position:relative;
                        height:20px;
                        line-height:20px;
                        padding-left:22px;
                        color:#525151;
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
                    .share_wechat{
                        position:absolute;
                        top:0;
                        right:38px;
                        display:inline-block;
                        width:24px;
                        height:24px;
                        border:1px solid #d8d8d8;
                        border-radius:24px;
                        background:@background_image 4px -20px;
                        cursor:pointer;
                        &:hover{
                            background-position:-19px -19px;
                        }
                    }
                    .share_sina{
                        position:absolute;
                        top:0;
                        right:2px;
                        width:24px;
                        height:24px;
                        border:1px solid #d8d8d8;
                        border-radius:24px;
                        background:@background_image -44px -20px;
                        cursor:pointer;
                        &:hover{
                            background-position:-69px -20px;
                        }
                    }
                }
                .qr_code{
                    position:absolute;
                    top:110px;
                    right:-27px;
                    width:152px;
                    height:157px;
                    border:1px solid #dcdcdc;
                    border-radius:2px;
                    background:#ffffff;
                    font-size:0;
                    box-shadow:0 7px 10px 0 rgba(0,0,0,0.14);
                    &:before{
                        content:'';
                        position:absolute;
                        top:-8px;
                        left:50%;
                        display:inline-block;
                        width:17px;
                        height:9px;
                        margin-left:-9px;
                        background:@background_image -74px 0;
                    }
                    canvas{
                        display:block;
                        width:132px;
                        height:132px;
                        margin:0 auto;
                    }
                    span{
                        position:relative;
                        top:-8px;
                        display:block;
                        height:20px;
                        line-height:20px;
                        font-size:12px;
                        color:#8d8787;
                        text-align:center;
                    }
                }
            }
            .news_body{
                padding:30px 0;
                margin-bottom:28px;
                border-bottom:1px solid #ededed;
                font-size:14px;
                color:#4d4d4d;
                .content_tips{
                    height:34px;
                    line-height:34px;
                    font-size:12px;
                    color:#919191;
                    span{
                        color:var(--mainColor);
                    }
                }
                // img{
                //     max-width:660px !important;
                // }
            }
            .news_foot{
                p{
                    height:50px;
                    line-height:50px;
                    font-size:18px;
                    color:#636363;
                }
                .similar_news{
                    display:inline-block;
                    width:200px;
                    height:144px;
                    margin:0 30px 26px 0;
                    cursor:pointer;
                    vertical-align:top;
                    img{
                        display:block;
                        width:200px;
                        height:120px;
                    }
                    span{
                        display:block;
                        width:100%;
                        height:24px;
                        line-height:24px;
                        font-size:12px;
                        color:#636363;
                    }
                    &:nth-child(3n+1){
                        margin-right:0;
                    }
                }
            }
        }
    }
</style>