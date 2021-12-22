<!-- 共享作品-提交作品页面 -->

<template>
    <div class="upload_work_contain">
        <!-- 上传方式切换 -->
        <div class="contain_head">
            <span>在线文档</span>
        </div>
        <div class="contain_body">
            <!-- 选择在线文档-->
            <div class="choose_online_work">
                <!-- 我的文档列表为空时 -->
                <p class="no_work" v-if="my_online_doc_list.length === 0">你未创建任何文档</p>
                <p class="work_title"  @click="toggle_online_doc_list()" v-else>{{ current_online_doc.name }}</p>
                <!-- 我的文档列表-->
                <ul class="my_doc_list">
                    <li :class="{'current': item.id === current_online_doc.id}"
                        v-for="item in my_online_doc_list" 
                        @click="toggle_online_doc_list(item)"> {{item.name}}
                    </li>
                </ul>
            </div>
            <!-- 作品介绍 -->
            <div class="work_description">
                <p>作品介绍</p>
                <span>{{ work_description.length }}/200</span>
                <textarea placeholder="请描述你的作品..." maxlength="200" v-model="work_description">
                </textarea>
            </div>
            <!-- 提示 -->
            <div class="tips">
                <p>1、您上传提交的作品经过我们后台审核通过之后，将在共享作品页面展示，请务必确认作品文件的隐私权限；</p>
                <p>2、上传提交审核通过的作品将获得<span>10</span>幻币;</p>
            </div>
        </div>
        <div class="contain_footer">
            <!-- 在线文档 -->
            <button :class="{'disabled':!current_online_doc || work_description.length === 0}" 
                    @click="upload_online_work">提交
            </button>
        </div>
        <!-- 状态弹框 -->
        <transition name="modal-fade">
            <div class="commit_success_modal" v-if="commit_success_show || uploading">
                <!-- 在线作品上传中状态 -->
                <div class="loading" v-if="uploading">
                        <img src="../../assets/wap/images/news/loading.gif"/>
                        <p>作品上传中，请稍等~</p>
                </div>
                <!-- 提交成功弹框  -->
                <div class="commit_success_contain" v-else>
                    <img src="../../assets/wap/images/shareworks/success_icon_02.png"/>
                    <p class="title">提交成功</p>
                    <p class="tip">后台审核通过后将会已站内信通知，感谢您的分享</p>
                    <a href="/mobile/mywork/" @click="close">知道了</a>
                </div>
            </div>
        </transition>
    </div>
</template>

<style lang="less" scoped>
    @import url("../../assets/wap/css/common.css");

    // 页面主体样式
    .upload_work_contain {
        position: fixed;
        top: 0;
        left: 0;
        height: 100vh;
        width: 100%;
        background: #ffffff;
        overflow-y: auto;
        .contain_head {
            width: 100%;
            padding: 1.05rem 0 0 0.88rem;
            span{
                display: block;
                font-family: MicrosoftYaHei-Bold;
                font-size: 0.7rem;
                line-height: 1.35rem;
                color: #3c3c3c;
                font-weight: bold;
            }
        }
        .contain_body {
            position: relative;
            width: 100%;
            padding: 0 0.88rem;
            background: #ffffff;
            .choose_online_work{
                position: relative;
                margin-bottom: 2.35rem;
                border-radius: 0.1rem;
                p{
                    padding: 0 0.5rem;
                    line-height: 2.05rem;
                    font-size: 0.7rem;
                    &:after{
                        content: '';
                        position: absolute;
                        top: 0.9rem;
                        right: 0.68rem;
                        width: 0;
                        height: 0;
                        border-left: 0.33rem solid transparent;
                        border-right: 0.33rem solid transparent;
                        border-bottom: 0.35rem solid #9da3a9;
                        border-radius: 0.25rem;
                        transform: rotate(180deg);
                        transition: all .3s;
                    }
                }
                .no_work {
                    color: #3c3c3c;
                    opacity: 0.2;
                    border: solid 0.03rem #b6becf;
                }
                .work_title {
                    height: 2.05rem;
                    line-height: 2.05rem;
                    padding-right: 5rem;
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                    color: #3c3c3c;
                    border: solid 0.03rem #b6becf;
                    &:after{
                        opacity: 1;
                    }
                    &.show{
                        &:after{
                            transform: rotate(360deg);
                            transition: all .3s;
                        }
                        &+.my_doc_list{
                            display: block;
                        }
                    }
                }
                .my_doc_list{
                    display: none;
                    position: absolute;
                    top: 2rem;
                    width: 100%;
                    height: auto;
                    max-height: 10rem;
                    padding: 0.6rem 0.5rem;
                    background-color: #ffffff;
                    box-shadow: 0rem 0.23rem 0.28rem 0rem rgba(0, 0, 0, 0.1);
                    border: solid 0.03rem #b6becf;
                    border-radius: 0.15rem;
                    overflow-x: hidden;
                    overflow-y: auto;
                    z-index: 10;
                    li{
                        line-height: 1.85rem;
                        font-size: 0.62rem;
                        font-weight:500;
                        color: #3c3c3c;
                        max-width: 100%;
                        white-space: nowrap;
                        overflow: hidden;
                        text-overflow: ellipsis;
                        &.current{
                            color: var(--mainColor);
                        }
                    }
                }
            }
            .work_description{
                position: relative;
                margin-bottom: 1.4rem;
                p{
                    font-family: MicrosoftYaHei-Bold;
	                font-size: 0.69rem;
                    line-height:1.36rem;
                    color: #3c3c3c;
                    font-weight: bold;
                }
                span{
                    position: absolute;
                    right: 0.33rem;
                    bottom: 0.28rem;
                    font-size: 0.52rem;
                    color: #c3cad2;
                }
                textarea{
                    width: 100%;
                    height: 8.7rem;
                    padding: 0.55rem 0.63rem;
                    font-size: 0.52rem;
                    line-height: 0.6rem; 
                    background-color: #ffffff;
                    border-radius: 0.1rem;
                    border: solid 0.03rem #b6becf;
                    color: #3c3c3c;
                    resize: none;
                    &::-webkit-input-placeholder {
                        color: #c3cad2 !important;
                    }
                }
            }
            .tips{
                p{
                    display: inline-block;
                    line-height: 0.95rem;
                    font-size: 0.62rem;
                    color: #3c3c3c;
                    &:first-child{
                        margin-bottom: 0.8rem;
                    }
                }
                span{
                    font-weight: bold;
                    font-size: 0.69rem;
                    color: var(--mainColor);
                }
            }
        }
        .contain_footer{
            position:absolute;
            bottom: 0;
            width: 100%;
            padding: 0 0.88rem 2.42rem;
            button{
                width: 100%;
                line-height: 2.63rem;
                background-color: var(--mainColor);
                border-radius: 0.14rem;
                text-align: center;
                font-size: 0.73rem;
                font-weight: bold;
                font-family: MicrosoftYaHei-Bold;
                color: #fff;
                &.disabled{
                    background-color: #d5dee9;
                }
            }
        }
    }
    // 上传成功弹框及上传中蒙层
    .commit_success_modal {
        position: fixed;
        top: 0;
        left: 0;
        height: 100%;
        width: 100%;
        z-index: 999;
        background: rgba(0,0,0,0.5);
        .commit_success_contain {
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            margin: auto;
            width: 92%;
            height: 13.58rem;
            padding: 2.25rem 0.95rem 1.75rem;
            background-color: #ffffff;
            border-radius: 0.17rem;
            text-align: center;
            .title{
                 line-height: 1.85rem;
                 color: #3c3c3c;
                font-size: 0.83rem;
                font-family: MicrosoftYaHei-Bold;
                font-weight: bold;
            }
            .tip{
                margin-bottom: 1.7rem;
                line-height: 1.5rem;
                color: #3c3c3c;
                font-size: 0.62rem;
            }
            a{
                display: inline-block;
                width: 5.93rem;
                line-height: 1.95rem;
                font-size: 0.69rem;
                color: #3c3c3c;
                background-color: #ffffff;
                border-radius: 0.17rem;
                border: solid 0.03rem #b6becf;
            }
        }
        .loading{
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            width:10rem;
            height: 4rem;
            margin: auto;
            text-align: center;
            img{
                width: 1.25rem;
                height: 1.25rem;
                margin-bottom: 1rem;
            }
            p{
                color: #ffffff;
                margin-bottom: 1rem;
            }
        }
    }
</style>

<script>
    export default {
        name: 'UpladWorkView',
        metaInfo() {
            return {
                title: '吾道-提交作品',
                meta: [
                    {
                        property: 'og:title',
                        content: '吾道-提交作品'
                    },
                    {
                        property: 'og:url',
                        content: 'https://www.woodo.cn/mobile/uploadwork/'
                    },
                ],
            }
        },
        data(){
            return {
                my_online_doc_list: [],                   // 在线作品列表
                current_online_doc: {},                   // 当前选中的共享作品
                work_description: '',                     // 作品介绍
                commit_success_show: false,               // 提交成功弹框展示标识
                uploading: false,                         // 在线作品上传中标识
            }
        },
        mounted() {
            const that = this;
            // 获取在线文档
            that.get_online_doc();
            // 输入作品介绍时，隐藏底部按钮
            that.$common.resize_hidden_element('.contain_footer');
            // 关闭在线文档列表
            $(document).on('click', e => {
                if(e.target === $('.work_title')[0]){
                    return;
                }
                that.hide_online_doc_list();
            })
        },
        methods: {
            // 关闭上传成功提示弹框
            close: function() {
                let that = this;
                that.commit_success_show = false;
            },
            // 获取在线文档列表
            get_online_doc: function() {
                let that = this;
                that.$axios.get('/api/member/document/list/')  
                .then(function(data){
                    if(data.data.code === '2'){
                        that.my_online_doc_list = data.data.data;
                        that.current_online_doc = that.my_online_doc_list[0];
                    }else{
                        that.$toast(data.data.content, 1000, 'wap')
                    }
                })
            },
            // 收起在线文档列表
            hide_online_doc_list: function() {
                $('.work_title').removeClass('show');
                $('.my_doc_list').fadeOut();
            },
            // 控制在线文档列表展示
            toggle_online_doc_list: function(item){
                let that = this;
                if($('.work_title').hasClass('show')){
                    if (item) that.current_online_doc = item;
                    that.hide_online_doc_list();
                    return;
                }
                $('.work_title').addClass('show');
                $('.my_doc_list').fadeIn();
            },
            // 获取在线文档封面
            get_online_doc_detail: function(docId,success){
                let that = this;
                that.$axios.get(`/api/member/document/detail/${docId}/`)
                .then(function(data){
                    if(data.data.code === '2'){
                        if (typeof success === 'function') success(data.data.data);
                    }
                })
            },
            // 上传在线文档方法
            upload_online_work: function() {
                let that = this;
                if(!that.current_online_doc.name){
                    that.$toast('作品不能为空！', 1000, 'wap');
                    return false;
                }
                if(that.work_description.length === 0){
                    that.$toast('作品介绍不能为空！', 1000, 'wap');
                    return false;
                }
                // 特殊符号判断
                if ($validate(that.current_online_doc.name).special()) {
                    return that.$toast('名称不能带有特殊符号',1000, 'wap');
                }
                if ($validate(that.work_description).special()) {
                    return that.$toast('作品介绍不能带有特殊符号',1000, 'wap');
                }
                that.uploading = true;
                // 生成文档封面
                that.get_online_doc_detail(that.current_online_doc.id, (doc_obj) => {
                    let document_info = that.$common.document_dataparse(doc_obj.document);
                    let document_pages = that.$common.document_pages_dataparse(doc_obj.documentPages);
                    let page_svg = that.$common.obj_2_svg(document_info, document_pages[0]),
                        get_base64 = that.$common.svg_2_base64(page_svg);
                    get_base64.then(function(data){
                        that.$axios.post('/api/member/apply_document/works_share/save/',{
                            name: that.current_online_doc.name,
                            description: that.work_description,
                            documentId: that.current_online_doc.id,
                            image:data
                        })
                        .then(function(data){
                            if(data.data.code === '2'){
                                that.commit_success_show = true;
                            }else{
                                that.$toast(data.data.content, '2000', 'wap');
                            }
                        })
                        that.uploading = false;
                    })
                })
            },
        },
    }
</script>