<template>
    <div class="topic_contain">
        <div class="works_list skeleton" ref="doc_height">
            <div class="works_item" v-for="(item,index) in topic_list" :key="index" @click="to_detail(item)">
                <!-- <div class="work_detail"> -->
                <div class="work_img">
                    <img :src="item.image" v-show="item.image">
                </div>
                <div class="work_info">
                    <div class="work_title">
                        <h5>{{item.name}}</h5>
                    </div>
                    <p class="work_content">{{item.introduce}}</p>
                </div>
                <!-- </div> -->
                <div class="author_info">
                    <img :src="item.authorImg" v-show="item.authorImg">
                    <span class="author_name">{{item.authorName}}</span>
                    <p>
                        <span class="create_time">{{item.date}}</span>
                        <span class="work_hits">{{item.useNum}}人气</span>
                    </p>
                </div>
            </div>
        </div>
    </div>
</template>
<style lang="less" scoped>
    @import url("../../assets/wap/css/common.css");
    @loading_img: url("/public/images/common/logo-text-gray.png") center center no-repeat;
    .topic_contain{
        padding: 0.4rem 0.65rem;
        background:#f7f7f7;
        .works_item{
            width:100%;
            border-bottom:0.25rem solid #f2f2f2;
            padding-bottom:0.4rem;
            margin-bottom: 0.4rem;
            font-family: MicrosoftYaHei;
            .work_detail{
                position:relative;
                width:100%;
                height:4rem;
            }
            .work_img{
                display:inline-block;
                vertical-align:top;
                height:9rem;
                width:100%;  
                border-radius:4px;
                background: @loading_img;
                background-size:60% 25%;
                border:1px solid rgba(185, 185, 185, 0.2);
                img{
                    height:9rem;
                    width:100%;     
                }
            }
            .work_info{
                // display:inline-block;
                position: relative;
                // vertical-align:top;
                // width:calc(100% - 6.95rem);
                // height:100%;
            }
            .work_title{
                display:block;
                font-size:0.65rem;
                width: 16.8rem;
                margin: 0.2rem;
                span{
                    font-size: 0.75rem !important;
                }
                h5{
                    display: inline-block;
                    color:#1e1e1e;
                    font-size: 0.75rem;
                    margin-left: 0.1rem;
                    line-height: 1rem;
                }
                .work_type{
                    display:inline-block;
                    height:100%;
                    line-height:0.65rem;
                    padding:0.1rem 0.2rem;
                    font-weight:400;
                    font-size:0.45rem;
                    color:#fff;
                    border-radius:2px;
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
            .work_content{
                display:block;
                margin-left: 0.2rem;
                font-size: 0.6rem;
                line-height: 0.8rem;
                color:#8e9098;
            }
            .author_info{
                position:relative;
                display:flex;
                align-items:center;
                width:16.8rem;
                color:#565656;
                font-size:0.55rem;
                height:1rem;
                line-height:1rem;
                margin-top:0.2rem;
                overflow-y:auto;
                img{
                    position:relative;
                    display:inline-block;
                    vertical-align:middle;
                    width:0.85rem;
                    height:0.85rem;
                    border-radius:50%;
                    top:-0.05rem;
                }
                .author_name{
                    color:#000;
                    margin-left:0.35rem;
                    margin-right:1.6rem;
                }
                .create_time{
                    position: absolute;
                    left: -3.5rem;
                    color: #000;
                    top:0;
                }
                p{  
                    display:inline-block;
                    position:absolute;
                    right:0;
                    top:0;
                }
            }
            .work_hits{
                display:inline-block;
                &:before{
                    content:'';
                    display:inline-block;
                    position:relative;
                    width:0.8rem;
                    height:0.8rem;
                    background:url("../../assets/wap/images/shareworks/hit.png") center no-repeat;
                    background-size:contain;
                    left:-0.25rem;
                    top: 0.1rem;
                }
            }
            &:last-child{
                border-bottom:none;
            }
        }
        .skeleton{
            .works_item .work_title span{
                display: none;
            }
            .work_title, 
            .work_content{
                background-color: #efefef;
            }
            .work_title{
                width: 100%;
                height:0.8rem;
            }
            .work_content{
                height:2.4rem;
            }
            .author_info{
                img, span, p {
                    display: none;
                }
                &::before,
                &::after{
                    content: "";
                    position: absolute;
                    top: 0;
                    height: 100%;
                    width: 30%;
                    background-color: #efefef;
                }
                &::before{
                    left: 0;
                }
                &::after{
                    right: 0;
                }
            }
        }
    }
</style>
<script>
export default {
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
            topic_id:null,
            title:'共享作品',
            topic_list:[
                    {"date":"","image":"","useNum":0,"authorName":"","name":"","collectNum":0,"documentId":0,"id":0,"authorImg":"","category":""},
                    {"date":"","image":"","useNum":0,"authorName":"","name":"","collectNum":0,"documentId":0,"id":0,"authorImg":"","category":""},
                    {"date":"","image":"","useNum":0,"authorName":"","name":"","collectNum":0,"documentId":0,"id":0,"authorImg":"","category":""},
                    {"date":"","image":"","useNum":0,"authorName":"","name":"","collectNum":0,"documentId":0,"id":0,"authorImg":"","category":""},
                    {"date":"","image":"","useNum":0,"authorName":"","name":"","collectNum":0,"documentId":0,"id":0,"authorImg":"","category":""},
                    {"date":"","image":"","useNum":0,"authorName":"","name":"","collectNum":0,"documentId":0,"id":0,"authorImg":"","category":""},
                    {"date":"","image":"","useNum":0,"authorName":"","name":"","collectNum":0,"documentId":0,"id":0,"authorImg":"","category":""},
                    {"date":"","image":"","useNum":0,"authorName":"","name":"","collectNum":0,"documentId":0,"id":0,"authorImg":"","category":""},
            ],
            topic_pic:'',
            page_number:1,
            total_number:1,
            no_more:false,
            template_nomore:false,
            template_scroll: true,  
        }
    },
    mounted(){
        const that = this;
        that.topic_id = that.$route.query.id;
        that.get_topic_list();
    },
    watch:{
        topic_list(){
            $(this.$refs.doc_height).removeClass('skeleton');
        },
    },
    methods:{
        // 获取分享作品，专集
        get_topic_list:function(scroll){
            let that = this,
                id = that.topic_id,
                page_number = that.page_number;
            if(!id) return location.href = '/404/';
            that.$axios.get('/api/works_share/topic_works/',{params:{tId:id,pageNumber:that.page_number}})
            .then(function(data){
                if(data.data.code === '2'){
                    if(scroll){
                        that.topic_list = that.topic_list.concat(data.data.data.dataList);
                    }else{
                        that.topic_pic = data.data.data.topicImage;
                        that.topic_name = data.data.data.topicName;
                        that.topic_list = data.data.data.dataList;
                        that.title = '共享作品-' + that.topic_name;
                        that.page_number = 1;
                        that.total_number = data.data.data.totalPage;
                        if(that.total_number === 1) that.no_more = true;
                        // 更新列表状态
                        if(that.topic_list.length < 1){that.empty_result = true;}
                        else{that.empty_result = false;}
                        that.topic_list.forEach(function(item){
                            item.introduce = item.introduce.length > 50 ? item.introduce.slice(0,50) + '...' : item.introduce + '...';
                        });
                        if(that.total_pages <= 1) { that.no_more = true; that.template_nomore = true;}
                        else{ that.share_load_more(); }
                    }
                }
            });
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
        to_detail:function(item){
            location.href = "/mobile/work_share/detail/?id="+item.id;
        },
        // 加载更多
        share_load_more: function(){
            let that = this,
                window_height = window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight;
            document.addEventListener('scroll', () => {
                let scroll_top = window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop,
                    template_scroll = that.template_scroll;
                if(that.total_pages <= 1) return;
                // 滚动加载
                if(scroll_top + window_height - 100 >= that.$refs.doc_height.clientHeight && template_scroll){
                    let _pageNumber = that.page_number,  // 当前页码
                        _totalPages = that.total_pages;  // 总页码
                    _pageNumber++;
                    if(_pageNumber <= _totalPages){
                        that.page_number = _pageNumber;
                        that.template_scroll = false;
                        that.get_works_list(that.current_cid,that.current_sort,true);
                    }else{
                        that.page_number = 1;
                        that.template_nomore = true;
                        that.template_scroll = false;
                        that.$toast('没有更多了',2000,'wap');
                    }
                }
            }, false);
        },
    },
}
</script>