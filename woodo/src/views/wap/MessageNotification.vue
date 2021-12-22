<template>
    <div class="setting_contain">
        <div class="message_tabbar">
            <p class="message_sort_type" :class="{open:sort_list_show}" @click="switch_sort_type">{{sort_type === 'unread' ? '未读消息在前' : '默认时间排序'}}</p>
            <ul class="sort_item" v-if="sort_list_show">
                <li @click="change_sort('ontime')" :class="{now_choose:sort_type == 'ontime'}">默认时间排序</li>
                <li @click="change_sort('unread')" :class="{now_choose:sort_type == 'unread'}">未读消息在前</li>
            </ul>
            <p class="sign_read" @click="all_message_read">全部标记已读</p>
        </div>
        <div class="message_list" ref="message_height">
            <div class="message_item" v-for="(item,index) in message_list" :key="item.id" @click="read_message(item,index)" :class="{message_detail:read_all_message === index,image_read:item.senderRead}">
                <div class="message_image"></div>
                <div class="message">
                    <p v-html="item.content"></p>
                    <p class="message_time">{{item.createDate}}</p>
                </div>
            </div>
        </div>
        <!-- 空消息状态 -->
        <div class="no_list" v-if="show_empty">
            <img src="../../assets/common/images/empty_1.png">
            <p>您还没有消息哦~</p>
        </div>
        <!-- 加载中 -->
        <div class="loading" v-show="!show_empty && message_list.length === 0">
            <img src="../../assets/wap/images/news/loading.gif" />
        </div>
        <!-- 加载更多 -->
        <div class="load_tips" v-if="!show_empty && total_pages > 1 && message_list.length !== 0" :class="{loading:!message_nomore}"></div>
        <base-logo v-show="message_nomore" class="bottom_img"></base-logo>
    </div>
</template>
<style lang="less" scoped>
@import url("../../assets/wap/css/common.css");
.setting_contain {
    width: 100%;
    height: 100%;
    overflow-y: auto;
    .bottom_img{
        display: block;
        margin: 0 auto 0.75rem;
        height: 1.1rem;
    }
    .message_tabbar {
        padding: 1.08rem 0.88rem 0.6rem 0.88rem; 
        border-bottom: 0.01rem solid #dcdcdc;
        height: 2.93rem;
        .message_sort_type {
            position: relative;
            display: inline-block;
            line-height: 1.04rem;
            font-size: 0.69rem;
            color: #3c3c3c;
            font-weight: 600;
            margin: 0;

            &::after {
                content: "";
                position: absolute;
                left: 4.8rem;
                top: 0.4rem;
                width: 0;
                height: 0;
                border-left: 0.25rem solid transparent;
                border-right: 0.25rem solid transparent;
                border-bottom: 0.3rem solid #3c3c3c;
                border-radius: 0.1rem;
                transform: rotate(180deg);
                transition: all 0.3s;
            }
      
        }
        .open {
            &::after {
                top: 0.4rem;
                transform: rotate(0deg);
            }
        }
    .sort_item {
        position: absolute;
        z-index: 3;
        display: block;
        padding: 0.8rem 0.57rem 0.68rem 0.57rem;
        margin-top: 0.25rem;
        width: 4.88rem;
	    height: 4.18rem;
        background-color: #ffffff;
        box-shadow: 0rem 0.15rem 0.15rem 0rem rgba(51, 51, 51, 0.22);
      	border-radius: 0.14rem;
      	border: solid 0.03rem #eceef0;

        >li{
            font-size: 0.6rem;
            line-height: 1.04rem;

            &:nth-child(1){
                margin-bottom: 0.5rem;
            }
        }         
    }
    .now_choose{
        color: var(--mainColor);
    }
    .sign_read {
        float: right;
        font-size: 0.6rem;
        color: var(--mainColor);
    }
  }
    .message_list{
        padding-left: 0.88rem;
        padding-right: 1rem;
        .message_item{
            position: relative;
            display: inline-block;
            margin-top: 0.5rem;
            padding-bottom: 0.3rem;
            width: 100%;
            height: auto;
            border-bottom: 0.01rem solid #eee;
           
            &:first-child{
                margin-top: 1rem;
            }
    
            >.message_image{
                position: absolute;
                top: 0.2rem;
                display: inline-block;      
                width: 1.13rem;
	            height: 0.83rem;
                background-image: url('../../assets/common/images/message_unread.png');
                background-size: cover;
            }
            >.message{        
                float: right;
                width: calc(100% - 1.6rem);

                >p{
                    display: inline-block;
                    width: 100%;
                    overflow: hidden;
                    text-overflow: ellipsis;
                    white-space: nowrap;
                    -webkit-line-clamp:1;
                    font-size: 0.6rem;
                    
                    &:nth-child(1){
                        color: #3c3c3c;
                         &/deep/ a{
                            color: #0d7bf8;
                            text-decoration: none;
                            margin-left: 0.2rem;
                            margin-right: 0.2rem;
                        }
                    }
                    &:nth-child(2){
                        color: #c8cdd3;
                    }
                }     
            }

            // 点击阅读全文
            &.message_detail{
                height: auto;
                display: inline-block;
                
                >.message>p{
                    display: inline-block;
                    width: 100%;
                    font-size: 0.6rem;
                    overflow: auto;
                    white-space: inherit;
                }
                                
            }
            // 消息未读图片
            &.image_read{
                >.message_image{
                    background-image: url('../../assets/common/images/message_read.png');
                    background-size: cover;
                }
                >.message>p{
                    color: #c8cdd3;
                }         
            }
       
        }
    }
    .no_list{
        margin-top:40%;
        text-align:center;
        img{
            width:8.125rem;
            height:5.8rem;
        }
        p{
            display:block;
            height:2rem;
            line-height:2rem;
            font-size:0.75rem;
            color:#a5a4a4;
        }
    }
    .loading {
        margin:12rem auto;       
        width: 2rem;
        height: 2rem;
        img {
            width: 100%;
            height: 100%;
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
        margin: 1rem auto;
    }
}

}
</style>
<script>
export default {
    metaInfo() {
        return {
            title: "吾道-消息中心",
            meta: [
                {
                    name: "viewport",
                    content:"width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0"
                },
                {
                    property: 'og:title',
                    content: '吾道-消息中心'
                },
                {
                    property: 'og:url',
                    content: 'https://www.woodo.cn/mobile/notification/'
                },
            ]
        };
    },
    data() {
        return {
            sort_type: "unread",                    //默认未读消息在前
            sort_list_show: false,                  //下拉菜单隐藏
            message_list:[],                        //所有消息列表
            read_all_message:null,                  //当前消息     
            show_empty:false,                       //消息为空
            total_pages:null,                       //总页数
            page_number:1,                          //当前页
            message_nomore:false,                   //判断是否还有消息
            message_scroll:true,                    //判断滚动加载
        };
    },
    mounted() {
        const that = this;
        //获取所有消息列表数据
        that.get_message();
    },
    methods: {
        //获取消息列表、滚动加载
        get_message:function (obj) {
            let that = this;
            let params = {
                number:1,
                scroll:false
            };
            params = Object.assign(params, obj);
            that.show_empty = false;
            that.$axios.get('/api/member/get_message_notification/',{
                params:{
                    pageSize:20,
                    pageNumber:params.number
                }
            }).then(function (data) {
                if (data.data.code === '2') {
                    let message = data.data.data.dataList;
                    //消息日期时间
                    message.forEach(item => {
                        let message_date = utils.relativeTime({time:item.createDate,date_connector:'-'});
                        item.createDate = message_date.date;
                    });
                    that.message_nomore = false;
                    that.message_list = that.message_list.concat(message);
                    that.total_pages = data.data.data.totalPages;
                    if(that.message_list.length === 0) that.show_empty = true;
                    //滚动加载
                    let pagination = {
                        pageNumber:params.number,
                        totalPages:data.data.data.totalPages
                    }
                    that.message_load_more(pagination);
                }
            })
        },
        // 滚动加载方法
        message_load_more: function(pagination){
            let that = this;
            utils.onReachBottom({
                $scroll: $('.setting_contain')[0],
                factor: function() {
                    if ((pagination.pageNumber - 1) >= pagination.totalPages) {
                        that.message_nomore = true;
                        return true;   
                    }
                },
                onScroll: function() {
                    that.sort_list_show = false;
                },
                onReach: function() {
                    if (pagination && typeof pagination.pageNumber !== 'undefined') {
                        pagination.pageNumber++;
                    }
                    that.get_message({
                        number: pagination.pageNumber,
                        scroll: true
                    })
                }
            });
        },
        //点击下拉排序菜单
        switch_sort_type: function() {
            let that = this;
            that.sort_list_show = !that.sort_list_show;
        },
        //选择排序方式
        change_sort:function (type) {
            let that = this;
            that.sort_type = type;
            //选择完成后隐藏下拉菜单
            that.sort_list_show = false;
            //消息列表排序
            that.message_list.insertSort(function(a,b){
                return (type === 'unread' ?  a.senderRead - b.senderRead :  b.modifyDate - a.modifyDate);
            })
        },
        //点击消息
        read_message:function(item,index){
            let that = this,
                id = item.id;
                //阅读消息全文
                if (that.read_all_message === index) {
                    that.read_all_message = null;
                }else{
                    that.read_all_message = index;
                };
                //判断消息状态
                if (item.senderRead) return false;
                //获取消息操作列表
                that.$axios.post('/api/member/read_message_notification/',
                    {messageId:id}
                ).then(function(data){
                    if (data.data.code === '2') {
                        item.senderRead = true;
                    }else{
                        that.$toast(data.data.content,1000,'wap');
                    }       
                })
        },
        //全部标记已读
        all_message_read:function(){
            let that = this,
            list = that.message_list,
            un_read = list.filter(item => !item.senderRead);
            if(un_read.length <= 0) return;
            that.$axios.post('/api/member/all_read/').then(function(data){
                if (data.data.code === '2') {
                    list.forEach(function(item){
                        item.senderRead = true;  
                    })
                }else{
                    that.$toast(data.data.content,1000, 'wap');
                }
            })  
        },       
    }
};
</script>
