<template>
    <div class="nav-message-modal" v-if="show">
        <div class="message-head flex flex-between">
            <span>消息通知</span>
            <span v-if="message_unread_count > 0" @click="readAllMessage">全部标记为已读</span>
        </div>
        <ul> 
            <li class="message-list" v-for="item in message_list" :key="item.id" :class="item.senderRead ? 'read' : ''" @click="readMessage($event, item)">
                <p v-html="item.content"></p>
                <span>{{ item.createDate }}</span>
            </li>
        </ul>
        <div class="more-message">
            <router-link to="/notification">查看全部消息</router-link>
        </div>
    </div>
</template>

<script>
    /**
     *  导航消息中心弹框
     */
    export default{
        name: "NavMessageModal",
        props:{
            show : {
                type: Boolean,
                default: false,
            },
        },
        data(){
            return{
                message_list: [],
                message_unread_count: 0,
            }
		},
        watch: {
            // 更新父组件未读信息个数
            message_unread_count(count) {
                this.$emit('unread', count);
            }
        },
        mounted () {
            this.getMessage();
        },
        methods:{
            // 获取消息列表
            getMessage() {
                let that = this;
                that.$axios.get('/api/member/get_message_notification/').then(res =>{
                    let {code, data} = res.data;
                    if (code == 2) {
                        let list = data.dataList.slice(0,5);
                        list.forEach(function(item){
                            item.createDate = utils.relativeTime({time: item.createDate, date_connector: '-'}).date;
                        });
                        that.message_list = list;
                        that.message_unread_count = data.dataList.filter(item => !item.senderRead).length;
                    }else{
                        that.$toast(data.content, 1000);
                    }
                })
            },
            // 已读消息
            readMessage(message) {
                if (message.senderRead && message.type !== 'order') {
                    return;
                }
                let that = this;
                that.$axios.post('/api/member/read_message_notification/',{
                    messageId: message.id
                }).then(data =>{
                    if(data.data.code === '2'){
                        message.senderRead = true;
                        that.message_unread_count--;
                    }else{
                        that.$toast(data.data.content,1000);
                    }
                    if (message.type === 'order' && ($(e.target)[0].tagName !== 'A' || $(e.target).attr('href').indexOf('javascript') >= 0)) {
                        that.$router.push('/member/order');
                    }
                })
            },
            // 已读全部消息
            readAllMessage() {
                let that = this;
                that.$axios.post('/api/member/all_read/').then(data =>{
                    if(data.data.code === '2'){
                        that.message_list.forEach(item => {
                            item.senderRead = true;
                        });
                        that.message_unread_count = 0;
                    }else{
                        that.$toast(data.data.content,1000);
                    }
                })
            },
        }
    }
</script>

<style lang="less" scoped>
    .nav-message-modal{
        position: absolute;
        top: 66px;
        right: 0;
        width: 480px;
        height: 436px;
        background-color: #fff;
        border-radius: 6px;
        box-shadow: 0 6px 8px 0 rgba(0, 0, 0, 0.18);
        line-height: 1.4;
        text-align: left;
        z-index: 999;
        overflow: hidden;
        cursor: default;
        .message-head{
            height: 53px;
            line-height: 53px;
            padding: 0 27px;
            border-bottom: 1px solid #efefef;
            span{
                font-size: 12px;
                &:first-child{
                    font-size: 16px;
                    color: #1e1e1e;
                    font-weight: bold;
                }
                &:nth-child(2){
                    color: var(--mainColor);
                    cursor: pointer;
                    &:before{
                        content: "";
                        position: relative;
                        top: 2px;
                        left: -4px;
                        display: inline-block;
                        width: 14px;
                        height: 14px;
                        background: url("../../assets/pc/images/common/had_unread.png");
                    }
                    &:hover{
                        opacity: .7;
                    }
                }
                &:nth-child(3){
                    color: #9e9ea8;
                    cursor: pointer;
                    &:before{
                        content: "";
                        position: relative;
                        top: 2px;
                        left: -4px;
                        display: inline-block;
                        width: 14px;
                        height: 14px;
                        background: url("../../assets/pc/images/common/all_read.png");
                    }
                    &:hover{
                        opacity: .7;
                    }
                }
                
            }
        }
        ul{
            padding: 9px 0;
        }
        .message-list{
            position: relative;
            min-height: 62px;
            padding: 12px 27px 0;
            border-bottom: 1px solid #efefef;
            font-size: 14px;
            color: #595959;
            cursor: pointer;
            p{
                display: inline-block;
                vertical-align: top;
                width: 280px;
                line-height: 20px;
                &/deep/ a{
                    color: var(--mainColor);
                }
            }
            span{
                position:absolute;
                top:50%;
                right:27px;
                height:20px;
                line-height:20px;
                margin-top:-18px;
                color:#bcbcbc;
            }
            a{
                color: var(--mainColor);
            }
            &:before{
                content:"";
                position:relative;
                display:inline-block;
                width:22px;
                height:18px;
                margin-right:13px;
                background:url(../../assets/pc/images/common/new_unread.png);
                vertical-align:middle;
            }
            &:hover{
                background:#f9fbff;
            }
            &.read{
                color:#a3a3a3;
                cursor:pointer;
                &:before{
                    height:18px;
                    background:url(../../assets/pc/images/common/new_read.png);
                }
            }
        }
        .more-message{
            position: absolute;
            bottom: 0;
            width: 100%;
            border-top: 1px solid #efefef;
            font-size: 14px;
            height: 42px;
            line-height: 42px;
            text-align: center;
            background-color: #f9fbff;
            a{
                color: #595d63;
                text-decoration: underline;
            }
        }
        li:last-child{
            border-bottom: none;
        }
    }
</style>