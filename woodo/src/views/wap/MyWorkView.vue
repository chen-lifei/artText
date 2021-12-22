<!-- 共享作品-我的作品页面 -->
<template>
    <div class="my_work_contain">
        <div class="contain_head">
            <h3>标题</h3>
            <h3>操作</h3>
        </div>
        <div class="contain_body">
            <!-- 我的作品列表 -->
            <div class="my_works_list" v-if="my_works_list.length !== 0">
                <div class="my_work" v-for="(item, index) in my_works_list" @click="to_work_detail(item)">
                    <div class="work_title"> 
                        <p class="work_name">{{ item.name }}</p>
                        <p class="work_operate">
                            <span class="edit" v-if="['failed','examining'].indexOf(item.status) > -1" @click.stop="operate_my_work('edit',item, index)">编辑</span>
                            <span v-if="['failed','examining'].indexOf(item.status) > -1" @click.stop="operate_my_work('cancel', item, index)">撤销</span>
                            <span v-if="item.status === 'pass'" @click.stop="operate_my_work('delete', item, index)">删除</span>
                        </p>
                    </div>
                    <div class="work_info">
                        <span class="status pass" v-if="item.status === 'pass'">已发布</span>
                        <span class="status examining" v-if="item.status === 'examining'">审核中...</span>
                        <span class="status" v-if="item.status === 'failed'">未通过</span>
                        <span class="status" v-if="item.status === 'deleted'">已删除</span>
                        <span class="hcoin" v-if="item.hcoin > 0">+10幻币</span>
                        <span class="create_date">{{ item.time }}</span>
                    </div>
                </div>
            </div>
            <!-- 空状态 -->
            <div class="doc_empty" v-if="doc_empty">
                <img src="../../assets/common/images/empty_1.png"/>
                <p>你还没有提交任何作品</p>
                <a href="/mobile/uploadwork/">立即提交</a>
            </div>
        </div>
        <!--  编辑弹框 -->
        <transition>
            <div class="work_edit_modal" v-if="edit_modal_show">
                <div class="work_edit_contain">
                    <div class="edit_contain_header">
                        <h3>标题</h3>
                        <input maxlength='20' v-model="new_work_info.name"/>
                    </div>
                    <div class="edit_contain_body">
                        <h3>作品介绍</h3>
                        <span>{{ new_work_info.description.length }}/200</span>
                        <textarea maxlength="200" v-model="new_work_info.description" placeholder="请描述你的作品...">
                        </textarea>
                    </div>
                    <div class="edit_contain_footer">
                        <button class="cancel" @click="operate_my_work('close_edit')">取消</button>
                        <button class="submit" 
                            :class="{'disable':current_work_info.name === new_work_info.name && current_work_info.description === new_work_info.description }" @click="edit_my_work">确定</button>
                    </div>
                </div>
            </div>
        </transition>
    </div>
</template>

<style lang="less">
    .modal{
        width: 92% !important;
        &.cancel-modal{
            .modal-header{
                padding: 2.4rem 1rem 0.5rem;
                .modal-title{
                    font-size: 1.04rem;
                    font-weight: 500;
                    color: #3c3c3c;
                    text-align: center;
                }
            }
            .modal-body{
                min-height: 4.35rem;
                text-align: center;
                font-size: 0.62rem;
                font-weight: 500;
                color: #3c3c3c;
            }
            .modal-footer{
                padding-bottom: 1.18rem;
                clear: both;
                .button{
                    padding: 0.81rem 2.68rem;
                    font-size: 0.73rem;
                    color: #3c3c3c;
                    font-weight: bold;
                    margin: 0;
                    border-radius: 0.14rem;
                    &.button-cancel{
                        float: left;
                        border: solid 0.03rem #b6becf;
                    }
                    &.button-submit{
                        background-color: var(--mainColor);
                        color: #ffffff;
                    }
                }
            }
        }
        &.delete-modal{
            .modal-header{
                display:none;
            }
            .modal-body{
                padding-bottom: 2.73rem;
                margin-top: 1.38rem;    
                .service_panel{
                    position:relative;
                    margin: 0 auto 0.78rem;
                    width: 7.43rem;
	                height: 7.38rem;
                    img:not(.base-logo) {
                        width: 100%;
                        height: 100%;
                    }
                    .base-logo {
                        position: absolute;
                        top: 0;
                        right: 0;
                        margin: auto;
                        z-index: 1;
                        width: 2rem;
                        height: 2rem;
                    }
                }
                p{
                    text-align: center;
                    font-size: 0.62rem;
                    color: #3c3c3c;
                    font-weight: 500;
                }
            }
            .modal-footer{
                padding-bottom: 1.55rem;
                .button{
                    padding: 0.81rem 2.68rem;
                    font-size: 0.73rem;
                    color: #3c3c3c;
                    font-weight: bold;
                    margin: 0;
                    border-radius: 0.14rem;
                    &.button-cancel{
                        float: left;
                        border: solid 0.03rem #b6becf;
                    }
                    &.button-submit{
                        background-color: var(--mainColor);
                        color: #ffffff;
                    }
                }
            }
        }

    }
</style>

<style lang="less" scoped>
    @import url("../../assets/wap/css/common.css");

    .my_work_contain {
        position: fixed;
        top: 0;
        left: 0;
        height: 100%;
        width: 100%;
        padding: 0 0.88rem;
        background: #ffffff;
        overflow-y: auto;
        .contain_head{
            display: flex;
            justify-content: space-between;
            width:100%;
            height:2.15rem;
            line-height: 3rem;
            border-bottom: solid 0.08rem #3c3c3c;
            h3{
                font-size: 0.83rem;
                color: #3c3c3c;
                font-weight: bold;
            }
        }
        .contain_body{
            position: relative;
            width:100%;
            padding:0.42rem 0 1rem;
            .my_works_list{
                .my_work{
                    position: relative;
                    width: 100%;
                    padding: 0.85rem 0 0.55rem;
                    border-bottom: 0.05rem solid #cecece;
                    .work_title{    
                        display: flex;
                        justify-content: space-between;                  
                        height: 1.15rem;
                        line-height: 1rem;
                        p{
                            display: inline-block;
                            text-overflow: ellipsis;
                            white-space: nowrap;
                            overflow: hidden;
                        }
                        .work_name{
                            width: 10.4rem;
                            font-size: 0.69rem;
                            color: #3c3c3c;
                        }
                        .work_operate{
                            position: relative;
                            bottom: 0.1rem;
                            line-height: 1.2rem;
                            span{
                                width: 1.95rem;
	                            line-height: 0.98rem;
                                font-size: 0.52rem;
                                color: #3e3e3e;
                                padding: 0.13rem 0.36rem;
                                border-radius: 1rem;
                                background-color: #f0f0f0;
                            }
                            .edit{
                                padding: 0.1rem 0.36rem;
                                border: solid 0.03rem #b6becf;
                                margin-right: 0.45rem;
                                background-color: #ffffff;
                            }
                        }
                    }
                    .work_info{
                        span{
                            display: inline-block;
                            font-size: 0.52rem;
                            text-align: left;
                            color: #969ea8;
                        }
                        .status{
                            font-weight: bold;
                            color: #969ea8;
                            width: 3rem;
                            &.pass{
                                color: #00d45f;
                            }
                            &.examining{
                                color: #ff6b6b;
                            }
                        }
                        .hcoin{
                            color: var(--mainColor);
                            width: 4.7rem;
                        }
                    }
                }
            }
            .doc_empty{
                position: relative;
                top: 6.31rem;
                width: 7.53rem;
                height: 12.85rem;
                margin: auto;
                img{
                    width: 100%;
                    height: 7.35rem;
                }
                p{
                    margin-bottom: 2.38rem;
                    text-align: center;
                    font-size: 0.69rem;
                    color: #3c3c3c;
                }
                a{
                    position: absolute;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    margin: auto;
                    display: inline-block;
                    width: 6.95rem;
                    line-height: 2.1rem;
                    background-color: var(--mainColor);
                    border-radius: 0.17rem;
                    color: #ffffff;
                    font-size: 0.69rem;
                    font-weight: bold;
                    text-align: center;
                }
            }
        }
        .work_edit_modal{
            position: fixed;
            top: 0;
            left: 0;
            height: 100%;
            width: 100%;
            z-index: 999;
            background: rgba(0,0,0,0.5);
            .work_edit_contain{
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                margin: auto;
                width: 92%;
                height: 23rem;
                padding: 0 0.95rem;
                background-color: #ffffff;
                border-radius: 0.17rem;
                .edit_contain_header{
                    padding:1.11rem 0 1.14rem;
                    h3{
                        font-weight: bold;
                        font-size: 0.69rem;
                        color: #3c3c3c;
                        line-height: 1.24rem;
                    }
                    input{
                        width: 100%;
                        height: 2.55rem;
                        padding: 0 0.63rem;
                        border: solid 0.03rem #b6becf;
                        border-radius: 0.1rem;
                        color: #3c3c3c;
                        font-size: 0.62rem;
                    }
                }
                .edit_contain_body{
                    position: relative;
                    width: 100%;
                    h3{
                        font-weight: bold;
                        font-size: 0.69rem;
                        color: #3c3c3c;
                        line-height: 1.36rem;
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
                        resize: none;
                        &::-webkit-input-placeholder {
                            color: #c3cad2;
                        }
                    }
                    span{
                        position:absolute;
                        bottom: 0.33rem;
                        right: 0.5rem;
                        font-size: 0.52rem;
                        color: #c3cad2;
                    }
                }
                .edit_contain_footer{
                    width: 100%;
                    padding-top: 3rem;
                    clear: both;
                    button{
                        width: 6.8rem;
                        font-family: MicrosoftYaHei-Bold;
                        font-size: 0.73rem;
                        color: #3c3c3c;
                        font-weight: bold;
                        margin: 0;
                        border-radius: 0.14rem;
                    }
                    .cancel{
                        line-height: 2.57rem;
                        background-color: #ffffff;
                        border: solid 0.03rem #b6becf;
                    }
                    .submit{
                        float:right;
                        line-height: 2.63rem;
                        background-color: var(--mainColor);
                        color: #ffffff;
                        &.disable{
                            background-color: #eaeaea;
                            color: #3c3c3c;
                        }
                    }
                }
            }
        }
    }
</style>

<script>
    export default {
        name: 'MyWorkView',
        metaInfo() {
            return {
                title: '吾道-我的作品',
                meta: [{
                    property: 'og:title',
                    content: '吾道-我的作品'
                },
                {
                    property: 'og:url',
                    content: 'https://www.woodo.cn/mobile/mywork/'
                }],
            }
        },
        data(){
            return {
                my_works_list: [],          // 我的作品列表
                current_work_info: {},      // 选中的作品信息
                current_work_index: null,   // 选中的作品索引    
                new_work_info:{},           // 更改后的作品信息    
                service_qrcode: '',			// 交流群二维码链接
                edit_modal_show: false,     // 控制编辑弹框展示标识
                doc_empty: false,           // 空状态标识
            }
        },
        mounted() {
            let that = this;
            // 获取我的作品列表
            that.get_work_list();
        },
        methods: {
            // 获取我的作品列表
            get_work_list: function() {
                let that = this;
                that.$axios.get('/api/member/apply_document/works_share/list/')
                .then(function(data){
                    data = data.data;
                    if(data.code === '2') {
                        let list = data.data;
                        list.forEach((item) => {
                            item.time = utils.dateFormat(new Date(item.createDate), 'yyyy-MM-dd');
                        })
                        that.my_works_list = list;
                        that.doc_empty = that.my_works_list.length === 0 ? true : false;
                    }else {
                        that.$toast('数据获取失败', '2000', 'wap');
                    }
                })
            },
            // 我的作品操作
            operate_my_work: function(type, item, index) {
                let that = this;
                switch(type){
                    case 'edit':
                        // 唤起编辑弹框
                        that.edit_modal_show = true;
                        if(that.edit_modal_show){
                            // 保存当前要编辑的作品的索引
                            that.current_work_index = index;
                            that.current_work_info = utils.deepClone(item);
                            that.new_work_info = utils.deepClone(item);
                        }
                        break;
                    case 'close_edit':
                        // 关闭编辑弹框
                        that.edit_modal_show = false;
                        break;
                    // 撤销弹框
                    case 'cancel':
                        that.$modal({
                            modalClass: 'cancel-modal',
                            showClose: false,
                            modalTitle: '确定撤销？',
                            modalContent: '撤销后作品将不在此处展示',
                            buttonSubmitTxt: '确定',
                            zIndex: 999,
                            submitCallback: (modal) => {
                                modal.close();
                                that.delete_my_work(item, index);
                            },
                        });
                        break;
                    // 删除弹框
                    case 'delete':
                        // 获取交流群二维码地址
                        that.service_qrcode = `https://file.woodo.cn/upload/foreverImage/kefu_qrcode.image/png?v=${new Date().getTime()}`;
                        that.$modal({
                                modalClass: 'delete-modal',
                                showClose: false,
                                modalTitle: '',
                                modalContent: `<div class="service_panel"><img src="${that.service_qrcode}}"/><img class="base-logo" src="/public/images/common/logo-code.png"/></div>
                                                <p>如需删除已发布的作品<br>请保存二维码后识别添加管理员微信</p>`,
                                buttonSubmitTxt: '保存',
                                zIndex: 999,
                                submitCallback: (modal) => {
                                    modal.close();
                                },
                            });
                        break;
                    default: 
                        break;
                }
            },
            // 撤销作品
            delete_my_work: function(item, index) {
                let that = this;
                that.$axios.post('/api/member/apply_document/works_share/delete/',{
                    id: item.id,
                })
                .then(function(data){
                    if(data.data.code === '2'){
                        that.my_works_list.splice(index,1);
                        that.$toast('撤销成功', 2000, 'wap');
                    }else{
                        that.$toast('撤销失败', 2000, 'wap')
                    }
                })
            },
            // 编辑作品信息
            edit_my_work: function() {
                let that = this;    
                let value = that.new_work_info.description,
                    work_title = that.new_work_info.name;
                if (value.length === 0) {
                    return that.$toast("作品介绍不能为空噢！",2000, 'wap');
                }
                if (work_title.length === 0) {
                    return that.$toast("标题不能为空噢！");
                }
                // 判断超出大小限制
                if (work_title.length > 50) {
                    return that.$toast("标题不能超过50个字噢！",2000, 'wap');
                }
                if (value.length > 200) {
                    return that.$toast("介绍说明不能超过200个字噢！",2000, 'wap');
                }
                // 非常规字符拦截
                if ($validate(work_title).special()) {
                    return that.$toast("标题不能包含特殊字符！",2000, 'wap');
                }
                if ($validate(value).special()) {
                    return that.$toast("内容不能包含特殊字符！",2000, 'wap');
                }
                // 信息未更改时，不请求接口
                if (that.new_work_info.name === that.current_work_info.name && that.new_work_info.description === that.current_work_info.description){
                    return that.$toast('当前尚未更改任何信息，请更改后发布!')
                }
                that.$axios.post('/api/member/apply_document/works_share/update/',{
                        name: that.new_work_info.name,
                        description: that.new_work_info.description,
                        id: that.new_work_info.id,
                })
                .then(function(data){
                    if(data.data.code === '2'){
                        // 更新作品列表
                        that.my_works_list[that.current_work_index] = that.new_work_info;
                        that.$toast('发布成功', 2000, 'wap');
                        that.operate_my_work('close_edit');
                    }else{
                        that.$toast(data.data.content, 2000, 'wap');
                    }
                })
            },
            // 跳转到作品演示页面
            to_work_detail: function(item) {
                let that = this;
                if(!item.file){
                    window.location = `/mobile/document/slides/${item.documentUrl}/`;
                }else{
                    that.$toast('该文档为本地文档，无法查看！', 2000, 'wap')
                }
            }
        },
    }
</script>