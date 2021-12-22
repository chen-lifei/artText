<template>
    <transition name="modal-fade">
        <div class="doc_expire_modal" v-if="show_expire_modal">
            <div class="doc_expire_main">
                <div class="header">
                    <h1>文档分享</h1>
                    <button class="modal-close" @click="close"></button>
                </div>
                <div class="body">
                    <!-- 文档链接到期提示 -->
                    <div class="doc_expire_tip" v-if="!expire_setting_show">
                        <img src="../assets/pc/images/common/expire_tip.png">
                        <p v-if="!is_collaborator">文档访问链接已过期，他人无法访问，请先修改有效期。</p>
                        <p v-else>文档访问链接已过期，他人无法访问，请联系所有者修改。</p>
                        <button v-if="!is_collaborator" @click.stop="show_expire_setting">修改链接有效期</button>
                    </div>
                    <!-- 文档链接有效期设置 -->
                    <div class="doc_expire_setting" v-else>
                        <p class="tip">文档访问链接已过期，请重新选择有效期。</p>
                        <span>设置链接有效期</span>
                        <ul>
                            <li v-for="(item,index) in link_expire_arr" :key="index" :class="{checked:item.key === document_expire_type}" @click.stop="change_link_expire(item)">
                                <p class="name">{{item.name}}</p>
                                <p class="content">{{item.content}}</p>
                            </li>
                        </ul>
                        <div class="footer">
                            <button class="cancel" @click.stop="close">取消</button>
                            <button class="submit" @click.stop="submit_link_expire">确定</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </transition>
</template>

<script>
    export default {
        name: "DocExpireModal",
        data(){
            return {
                is_collaborator: false,        // 是否为协作者
                show_expire_modal:false,       // 文档有效期提示弹框展示标识
                expire_setting_show:false,     // 文档有效期设置面板展示标识
                doc_info:{},                   // 文档信息
                document_expire_type:'',       // 当前有效期
                link_expire_arr:[              // 有效期相关
                    {key:'forever',name:'永久有效',countdown:'永久',content:'适用于个人主页，公开资料'},
                    {key:'sevenDay',name:'7天',countdown:'7天',content:'适用于小组或部门内分享，7天后失效，他人将无法访问文档'},
                    {key:'oneDay',name:'1天',countdown:'1天',content:'适用隐私性较强的内部文档'},
                ],
            }
        },
        methods:{
            show: function(doc_info){
                if(!doc_info.isMine) {
                    this.is_collaborator = true;
                }else{
                    this.is_collaborator = false;
                    this.doc_info = doc_info;
                    this.document_expire_type = doc_info.urlExpireType;
                }
                this.show_expire_modal = true;
            },
            close: function(){
                this.show_expire_modal = false;
                this.expire_setting_show = false;
                this.$emit('close');
            },
            // 展示有效期修改面板
            show_expire_setting: function(){
                this.expire_setting_show = true;
            },
            // 修改连接有效期
            change_link_expire: function(item){
                let that = this;
                that.document_expire_type = item.key;
            },
            // 提交链接有效期设置
            submit_link_expire: function(){
                let that = this;
                that.$axios.post('/api/member/document/set_url_expire/', {
                    docId: that.doc_info.id,
                    type: that.document_expire_type
                })
                .then(function(data){
                    if(data.data.code == 2){
                        that.$toast("设置成功",1000);
                        that.close();
                    }else{
                        that.$toast(data.data.content,1000);
                    }
                })
            },
            
        }
    }
</script>

<style lang="less" scoped>
    .doc_expire_modal{
        position: fixed;
        top: 0;
        left: 0;
        z-index:999;
        width: 100%;
        height: 100%;
        background-color: rgba(0, 0, 0, 0.502);
        font-size: 0;
        text-align: center;
        &:after{
            content: "";
            display: inline-block;
            vertical-align: middle;
            width: 0;
            height: 100%;
        }
    }
    .doc_expire_main{
        position:relative;
        display:inline-block;
        vertical-align: middle;
        width: 510px;
        height: auto;
        min-height: 346px;
        padding:20px 30px;
        background-color: #ffffff;
        border-radius: 4px;
        user-select:none;
    }
    .header{
        width:100%;
        text-align:left;
        h1{
            display:inline-block;
            font-size:16px;
            font-weight:bold;
            color:#181818;
        }
        .modal-close{
            margin:-5px -10px 0 0;
        }
    }
    .body{
        .doc_expire_tip{
            margin-top:54px;
            text-align:center;
            img{
                width:152px;
                height:96px;
            }
            p{
                margin-top:20px;
                font-size:14px;
                color:#2e343f;
            }
            button{
                width: 130px;
                height: 34px;
                line-height:34px;
                margin:55px auto 0;
                background-color: var(--mainColor);
                border-radius: 4px;
                font-size:14px;
                color:#fff;
                text-align:center;
                transition:all .3s;
                &:hover{
                    opacity:.7;;
                }
            }
        }
        .doc_expire_setting{
            margin-top:20px;
            text-align:left;
            p.tip{
                width:100%;
                height: 40px;
                line-height:40px;
                padding-left:12px;
                margin-bottom:20px;
                background-color: #fff6e0;
                border: solid 1px #f8e8c0;
                font-size:12px;
                color:#3b414e;
                &::before{
                    content:"!";
                    display:inline-block;
                    vertical-align: middle;
                    width: 18px;
                    height: 18px;
                    line-height:18px;
                    margin-right:7px;
                    border-radius:50%;;
                    background-color: #eac468;
                    text-align:center;
                    font-size:12px;
                    color:#fff;
                }
            }
            span{
                display:block;
                margin-bottom:18px;
                font-size:14px;
                color:#646b7a;
            }
            ul{
                width:100%;
                height:100%;
            }
            li{
                position:relative;
                margin-bottom:23px;
                cursor:pointer;
                &:hover{
                    .name{
                        color:var(--mainColor);
                    }
                }
                &:last-child{
                    margin-bottom:0;
                }
                &::before{
                    content:"";
                    position:absolute;
                    left:0;
                    top:4px;
                    width:18px;
                    height:18px;
                    border-radius:50%;
                    background:#fff;
                    border:1px solid #ced2d8;
                }
                &.checked::before{
                    border:0;
                    background:url(../assets/pc/images/common/had_unread.png) no-repeat;
                    background-size:contain;
                }
                .name{
                    padding-left:32px;
                    margin-bottom:3px;
                    font-size:14px;
                    font-weight:bold;
                    color:#3c3f43;
                }
                .content{
                    padding-left:32px;
                    font-size:12px;
                    color:#acb5c0;
                }
            }
            .footer{
                width:100%;
                height: 40px;
                margin:46px 0 0;
                text-align:center;
            }
            button{
                display: inline-block;
                vertical-align:middle;
                width: 100px;
                height:100%;
                line-height: 40px;
                border-radius: 4px;
                text-align: center;
                font-size: 14px;
                cursor: pointer;
                &.cancel{
                    margin-right:18px;
                    background-color:#e9eef3;
                    color: #6c6c6c;
                }
                &.submit{
                    background-color:var(--mainColor);
                    color:#fff;
                }
            }
        }
    }
</style>