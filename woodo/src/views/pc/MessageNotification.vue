<template>
    <div class="notification_contain">
        <CommonHead ref="CommonHead"></CommonHead>
        <div class="contain_body">
            <div class="head">
                <div class="news_title">
                    <div class="news_sort_select" :class="{show:sort_list_show}" @click="toggle_sort_list()">
                        <p>{{news_sort_type === 'unread'? '未读消息在前':'默认时间在前'}}</p>
                        <transition name="mode-fade">
                            <ul v-if="sort_list_show">
                                <li @click="change_sort_type('unread')">未读消息在前</li>
                                <li @click="change_sort_type('time')">默认时间在前</li>
                            </ul>
                        </transition>
                    </div>
                    <h2>消息通知</h2>
                    <a  :class="{gray: news_count === 0}" @click="read_all_message">全部标记已读</a>
                </div>
            </div>
            <div class="body">
                <!--列表状态-->
                <ul v-if="message_list.length > 0">
                    <li class="news_list"
                        v-for="item in message_list"
                        :key="item.id"
                        :class="{read: item.senderRead}"
                        @click="read_message($event,item)"
                    >
                        <p v-html="item.content"></p><span>{{item.createDate}}</span>
                    </li>
                </ul>
                <!-- 空白状态 -->
                <div class="no_news" v-else>
                    <span>没有任何消息</span>
                </div>
                <span class="load_more" v-if="message_list.length > 0 && page_number < total_number" @click="get_message">点击加载更多</span>
                <span class="load_more no_more" v-if="message_list.length > 0 && page_number >= total_number">没有更多了</span>               
            </div>
        </div>
        <!-- 客服弹框 -->
        <transition name="modal-fade">
            <div class="service_contain" v-if="show_service_code" @click="toggle_service_code">
                <div class="service_panel">
                    <img class="service_qrcode" :src="service_qrcode" alt=""/>
                    <base-logo type="code" width="35" height="35"></base-logo>
                </div>
            </div>
        </transition>
        <CommonFoot></CommonFoot>
    </div>
</template>

<script>
    import CommonHead from '@/components/nav/CommonHead.vue';
    import CommonFoot from '@/components/nav/CommonFoot.vue';
    export default {
        name: "MessageNotification",
        components:{CommonHead, CommonFoot},
        data() {
            return {
                page_size: 20,
                page_number: 0,
                total_number: 1,
                message_list: [],
                news_count: 0,
                news_sort_type: "unread",
                sort_list_show: false,
                show_service_code: false,                // 展示吾道二维码
                service_qrcode: '',                      // 吾道交流二维码
            }
        },
        methods: {
            // 获取消息列表
            get_message: function(){
                let that = this,
                    page_number = that.page_number;
                if(that.page_number >= that.total_number) return that.$toast('没有下一页了',1000);
                page_number++;
                that.$axios.get('/api/member/get_message_notification/',{params:{
                        pageSize: that.page_size,
                        pageNumber: page_number
                    }})
                    .then(function(data){
                        if(data.data.code === '2'){
                            let list = data.data.data.dataList,
                                un_read = list.filter(item => !item.senderRead);
                            list.forEach(function(item){
                                let date = utils.relativeTime({time:item.createDate,date_connector:'-'});
                                item.createDate = date.date;
                            });
                            that.message_list = that.message_list.concat(list);
                            that.news_count += un_read.length;
                            that.total_number = data.data.data.totalPages;
                            that.page_number = page_number;
                            // 计算底部样式
                            that.$nextTick(function(){
                                let contain_h = document.querySelector('.contain_body').clientHeight,
                                    window_h = window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight;
                                if(contain_h + 240 > window_h) document.querySelector('.footer').style.position = 'unset';
                            });
                        }else{
                            that.$toast(data.data.content, 1000);
                        }
                    })
            },
            // 消息已读
            read_message: function(e,item){
                if (item.senderRead && item.type !== 'order') {
                    return;
                };
                let that = this;
                let id = item.id;
                that.$axios.post('/api/member/read_message_notification/',{
                    messageId: id
                }).then(function(data){
                    if(data.data.code === '2'){
                        item.senderRead = true;
                        that.news_count--;
                        if (that.news_count <= 0) {
                            that.$refs.CommonHead.user.news = 0;
                        }
                    }else{
                        that.$toast(data.data.content,1000);
                    }
                    if (item.type === 'order' && ($(e.target)[0].tagName !== 'A' || $(e.target).attr('href').indexOf('javascript') >= 0)) {
                        window.location.href = '/member/order/';
                    }
                })
            },
            // 全部已读
            read_all_message: function(){
                let that = this,
                    list = that.message_list;
                if(that.news_count <= 0) return that.$toast('没有未读消息哦~',1000);
                that.$axios.post('/api/member/all_read/')
                    .then(function(data){
                        if(data.data.code === '2'){
                            list.forEach(function(item){item.senderRead = true;});
                            that.news_count = 0;
                            that.$refs.CommonHead.user.news = 0;
                        }else{
                            that.$toast(data.data.content,1000);
                        }
                    })
            },     
            toggle_sort_list: function(){
                let that = this;
                that.sort_list_show = !that.sort_list_show;
            },
            change_sort_type: function(type){
                let that = this;
                that.news_sort_type = type;
                that.message_list.insertSort(function(a,b){
                    return (type === 'unread' ?  a.senderRead - b.senderRead :  b.modifyDate - a.modifyDate);
                })
            },
            // 打开/关闭交流群二维码
			toggle_service_code: function(){
				let that = this;
				that.service_qrcode = `https://file.woodo.cn/upload/foreverImage/kefu_qrcode.png?v=${new Date().getTime()}`;
				that.show_service_code = !that.show_service_code;
                if(that.show_service_code){
                    $('body').css('overflow','hidden');
                }else{
                    $('body').css('overflow','');
                }
            }
        },
        mounted() {
            const that = this;
            // 获取全部消息
            that.get_message();
            // 绑定客服弹框
            $('.code').delegate(null, 'click', that.toggle_service_code);
        }
    }
</script>

<style lang="less" scoped>
    @import "~@/assets/pc/css/common.css";
    @background_image:url(~@/assets/pc/images/member/member_sp.png) no-repeat;

    .notification_contain{
        position:fixed;
        top:0;
        left:0;
        width:100%;
        height:100%;
        background:#f2f5f9;
        overflow-y:auto;
        .contain_body{
            position:relative;
            width:980px;
            min-height:75%;
            background:#ffffff;
            margin:27px auto 63px;
            padding:0 0 28px;
            box-shadow: 0px 6px 8px 0px rgba(0, 0, 0, 0.06);
            .head{
                border-bottom: solid 1px #e7e7e7;
            }
            .body{
                padding:0 40px 0;
                /*列表状态*/
                ul{
                    padding-bottom:20px;
                }
                /*空白状态*/
                .no_news{
                    width:100%;
                    margin-top:166px;
                    color:#969fac;
                    text-align:center;
                    span{
                        display:block;
                        padding-top:235px;
                        background:url(~@/assets/pc/images/doc/no_doc.png) no-repeat center;
                        font-size:14px;
                        color:#969fac;
                    }
                }
                /*加载更多*/
                .load_more{
                    position:absolute;
                    bottom:-40px;
                    left:50%;
                    width:160px;
                    height:40px;
                    line-height:40px;
                    margin:-20px 0 0 -80px;
                    font-size:14px;
                    color:#6d6d6d;
                    text-align:center;
                    cursor:pointer;
                    &.no_more{
                        cursor:default;
                    }
                    &:before, &:after{
                        content:'';
                        position:relative;
                        top:-2px;
                        display:inline-block;
                        width:24px;
                        height:1px;
                        margin:0 7px;
                        background:#cbcbcb;
                        vertical-align:middle;
                    }
                    &:hover{
                        opacity:0.8;
                    }
                }
            }
        }
        .footer{
            position:absolute;
            bottom:0;
            left:0;
            right: 0;
            background:#030711;
        }
    }
    .news_title{
        position:relative;
        height: 83px;
        line-height: 83px;
        padding:0 20px;
        font-size:12px;
        color:#222222;
        span{
            color:var(--mainColor);
        }
        a{
            position:absolute;
            top:50%;
            right:40px;
            display:inline-block;
            height:20px;
            line-height:20px;
            margin-top:-10px;
            color:var(--mainColor);
            &:hover{
                color:var(--mainColor);
                opacity: .8;
            }
            &.gray{
                color:#a3a3a3;
                cursor: default;
            }
        }
        h2{
            display: inline-block;
            width: calc(100% - 222px);
            text-align: center;
            color: #40464d;
        }
        .news_sort_select{
				position:relative;
                float: left;
                margin-top: 28px;
                margin-left: 20px;
				vertical-align:middle;
                width:110px;
				background-color: #ffffff;
				border-radius: 4px;
				border: solid 1px #caced3;
				cursor:pointer;
				p{
					height:30px;
					line-height:30px;
					width:90px;
					font-size:12px;
					color: #595d63;
					text-align:center;
					&:hover{
						color:var(--mainColor);
					}
				}
				ul{
					position:absolute;
					left:0;
					z-index:10;
					width:100%;
					height:auto;
					background-color: #ffffff;
					box-shadow: 2px 4px 5px 0px rgba(0, 0, 0, 0.07);
					border-radius: 4px;
					border: solid 1px #caced3;
				}
				li{
					width:100%;
					height:36px;
					line-height:36px;
					text-align:left;
                    color: #595d63;
                    padding-left: 8px;
					&:hover{
                        color: var(--mainColor);
						background:#f2f8ff;
					}
					&.checked{
						position:relative;
						color:var(--mainColor);
						&:before{
							content:"";
							position:absolute;
							left:9px;
							top:14px;
							width:12px;
							height:8px;
							background:url(~@/assets/pc/images/doc/icon_2.4.0.png) no-repeat -47px -91px;
						}
					}
				}
				&:after{
					content:"";
					position:absolute;
					right:8px;
					top:12px;
					width: 0;
					height: 0;
					border-left: 5px solid transparent;
					border-right: 5px solid transparent;
					border-bottom: 5px solid #adb5c2;
					transform: rotate(180deg);
					transition: all .3s;
				}
				&.show:after{
					transform:rotate(360deg);
				}
			}
    }
    .news_list{
        position:relative;
        height: 62px;
        line-height: 62px;
        border-bottom:1px solid #efefef;
        font-size:12px;
        color:#595959;
        cursor:pointer;
        p{
            display:inline-block;
            height:54px;
            vertical-align:top;
            cursor: pointer;
            &/deep/ a{
                color: #0d7bf8;
                text-decoration: none;
            }
        }
        span{
            position:absolute;
            top:50%;
            right:0;
            height:20px;
            line-height:20px;
            margin-top:-10px;
            color:#bcbcbc;
            cursor: pointer;
        }
        &:before{
            content:"";
            position:relative;
            top:-2px;
            display:inline-block;
            width:22px;
            height:18px;
            margin-right:13px;
            background:url(~@/assets/pc/images/common/new_unread.png);
            vertical-align:middle;
        }
        &:hover{
            background:#eef5ff;
        }
        &.read{
            color:#a3a3a3;
            cursor:default;
            &:before{
                background:url(~@/assets/pc/images/common/new_read.png);
            }
            &:hover{
                background:none;
            }
        }
    }
    .service_contain{
        position:fixed;
        top:0;
        left:0;
        width:100%;
        height:100%;
        line-height:100%;
        background:rgba(0, 0, 0, 0.55);
        text-align:center;
        z-index:20;
        .service_panel {
            position: absolute;
            top: 0;
            right: 0;
            bottom: 0;
            left: 0;
            margin: auto;
            width: 320px;
            height: 457px;
            box-shadow: 0px 3px 10px 0px rgba(67, 67, 67, 0.15);
            background: url('~@/assets/pc/images/common/custom_service_bg.png') no-repeat center center;
            img:not(.base-logo) {
                position: absolute;
                top: 200px;
                left: 85px;
                width: 150px;
                height: 150px;
                padding: 8px;
                background-color: #ffffff;
                border-radius: 4px;
            }
            .base-logo {
                position: absolute;
                top: 257px;
                left: 142px;
                z-index: 1;
            }
        }
    }
</style>

<style lang="less">
.notification_contain .news_list p a{color:var(--mainColor); text-decoration:underline;}
</style>