<template>
    <div class="commonly_used_modal">
        <div class="header">
            <p>常用文档</p>
        </div>
        <div class="body">
            <ul class="document_list" v-if="doc_list.length > 0">
                <li class="list_item" v-for="(item,index) in doc_list" :key="index" @click="$parent.edit_doc(item)" v-bdtongji="`文档中心-首页-右侧-右侧-常用文档`">
                    <img v-if="item.documentType === 'slides'" src="~@/assets/pc/images/doc/slides_icon.png">
                    <img v-else src="~@/assets/pc/images/doc/design_icon.png">
                    <span>{{item.name}}</span>
                    <p class="delete_commonly" v-tooltip="`取消常用`" @click.stop="delete_doc(item.id,index)"></p>
                </li>
            </ul>
            <!-- 空状态 -->
            <div class="no_doc" v-else>
                <p>常用文档可以拖动到这里~</p>
            </div>
            <div class="commonly_active" v-show="active_line_show" :class="{top:doc_list.length === 0}">
                <div class="active_line"></div>
                <div class="active_left"></div>
                <div class="active_right"></div>
            </div>
        </div>
    </div>
</template>
<script>
    export default {
        name: 'commonly_used',
        props:[],
        data () {
            return {
                doc_list:[],       //常用文档列表
                active_line_show: false
            }
        },
        mounted() {
            let that = this;
            that.get_doc_list();
        },
        methods: {
            // 获取常用列表
            get_doc_list: function(){
                let that = this;
				that.$axios.get('/api/member/often_use_document/list/').then((data)=>{
                    if(data.data.code == 2){
                        that.doc_list = data.data.data;
                    }
                })
            },
            // 添加常用文档
            add_doc: function(obj){
                let that = this;
                that.$axios.post('/api/member/often_use_document/add/', {
                    docId: obj.id
                }).then(function(data) {
                    if(data.data.code == 2){
                        that.$toast("添加成功",1000)
                        obj.title = obj.name;
                        that.doc_list.unshift(obj);
                    }else{
                        that.$toast(data.data.content,1000)
                    }
                })
            },
            // 删除当前常用文档
            delete_doc: function(id,index){
                let that = this;
                that.$axios.post('/api/member/often_use_document/delete/', {
                    docId: id
                }).then(function(data) {
                    if(data.data.code == 2){
                        that.$toast("取消成功",1000)
                        that.doc_list.splice(index,1);
                    }else{
                        that.$toast(data.data.content,1000)
                    }
                })
            },
        },
    }
</script>
<style lang="less" scoped>
    @background_image:url(~@/assets/pc/images/doc/doc_view_icon.png) no-repeat;
    .commonly_used_modal{
        width:190px;
        height: 270px;
        overflow:auto;
        background-color: #ffffff;
        border-radius: 1px;
        border: solid 1px #e3e5eb;
        user-select:none;
        .header{
            width: 100%;
            height: 40px;
            line-height:40px;
            padding-left:18px;
            background-color: #f7f8fa;
            p{
                font-size:14px;
                color:#6c737b;
            }
        }
        .body{
            position:relative;
            padding-top:10px;
            .document_list{
                li{
                    position: relative;
                    height:30px;
                    line-height:29px;
                    padding:0 5px 0 15px;
                    user-select:none;
                    cursor:pointer;
                    &.checked,&:hover{
                        background:#f1f8ff;
                    }
                    &:hover p{display:block;}
                }
                img{
                    display:inline-block;
                    vertical-align:middle;
                    width:17px;
                    height:12px;
                    margin-right:7px;
                }
                span{
                    display:inline-block;
                    vertical-align:middle;
                    max-width: 73%;
                    overflow: hidden;
                    white-space: nowrap;
                    text-overflow: ellipsis;
                    font-size:12px;
                    color:#7b838d;
                }
                p{
                    display: none;
                    position: absolute;
                    right: 10px;
                    top: 8px;
                    width: 14px;
                    height: 14px;
                    border-radius: 50%;
                    background: #ff5353;
                    cursor: pointer;
                    &::before{
                        content: '';
                        position: absolute;
                        top: 6px;
                        left: 4px;
                        width: 6px;
                        border-bottom: solid 2px #fff;
                    }
                }
            }
            .no_doc{
                width:100%;
                height:100%;
                margin-top:70px;
                text-align:center;
                &::before{
                    content:"";
                    display:block;
                    width:32px;
                    height:38px;
                    margin:0 auto 8px;
                    background:url(~@/assets/pc/images/doc/commonly_used_empty.png) no-repeat;
                    background-size:contain;
                }
                p{
                    font-size:12px;
                    color:#c7cbcf;
                }
            }
            .commonly_active{
                position: absolute;
                left: 0;
                bottom: -12px;
                width: 100%;
                height: 6px;
                &.top{
                    top:6px;
                }
                .active_line{
                    background: #389def;
                    height: 1px;
                }
                .active_left, .active_right{
                    content: "";
                    display: block;
                    width: 0;
                    height: 0;
                    top: -2px;
                    position: absolute;
                    border-top: 3px solid transparent;
                    border-bottom: 3px solid transparent;
                }
                .active_left{
                    left: 0;
                    border-left: 6px solid var(--mainColor);
                }
                .active_right{
                    right: 0;
                    border-right: 6px solid var(--mainColor);
                }
            }
        }
    }
</style>
