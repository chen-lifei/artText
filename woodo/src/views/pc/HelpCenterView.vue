<template>
    <div class="help_center_contain">
        <!-- 通用头部 -->
        <CommonHead></CommonHead>
        <div class="help_contain">
            <!-- 页面顶部背景图 -->
            <div class="contain_head">
                <p>您好！欢迎使用吾道帮助中心</p>
            </div>
            <!-- 页面主体内容 -->
            <div class="contain_body">
                <!-- 分类分组列表 -->
                <div class="question_list" v-for="item in question_list" :key="item.helpCategoryId">
                    <!-- 分类标题 -->
                    <p class="list_header">
                        <span class="title">{{item.helpCategoryName}}</span>
                        <span class="more" @click="to_help_list({ categoryId: item.helpCategoryId })">更多&gt;</span>
                    </p>
                    <!-- 问题列表（只展示五条） -->
                    <ul>
                        <li v-for="child in item.helps" 
                            @click="to_help_list({ categoryId: item.helpCategoryId, problemId: child.id })"
                            :key="child.id"
                        >
                            <i></i>{{ child.title }}
                        </li>
                    </ul>
                </div>
            </div>
            <!-- 页面底部 -->
            <div class="contain_footer">
                <div class="footer_header">
                    <p class="title">常见问题</p>
                    <span></span>
                </div>
                <!-- 常见问题列表 -->
                <div class="common_question_list">
                    <p v-for="item in common_question_list" :key="item.id" @click="to_help_list({ problemId: item.id })">{{ item.title }}</p>
                </div>
                <!-- 通用底部 -->
                <CommonFoot></CommonFoot>
            </div>
        </div>
    </div>
</template>

<style lang="less" scoped>
    @import url("../../assets/pc/css/common.css");
    .help_center_contain{
        width: 100%;
        height: 100%;
        min-width: 1295px;
        text-align: center;
        background-color: #f4f7fa;
        overflow-y: auto;
        overflow-x: hidden;
        .help_contain{
            width: 100%;
            .contain_head{
                position: relative;
                width: 100%;
                height: 262px;
                line-height: 262px;
                text-align: center;
                background: url('../../assets/pc/images/help/banner_bg.png') no-repeat center center;
                background-size: cover;
                p{
                    color: #ffffff;
                    font-size: 48px;
                    letter-spacing: 5px;
                    user-select: none;
                }
            }
            .contain_body{
                position: relative;
                width: 1295px;
                min-height: 640px;
                padding: 57px 0 35px;
                margin: 0 auto;
                text-align: left;
                .question_list{
                    display: inline-block;
                    width: 300px;
                    height: 240px;
                    margin: 0 31px 34px 0;
                    padding: 0 24px 26px;
                    background-color: #ffffff;
                    box-shadow: 0px 9px 13px 0px rgba(0, 0, 0, 0.04);
                    border-radius: 8px;
                    border: solid 1px #e7ecf2;
                    text-align: left;
                    overflow: hidden;
                    &:hover{
                        box-shadow: 0px 4px 12px 0px rgba(0,0,0,0.1);
                    }
                    &:nth-child(4),&:nth-child(8),&:nth-child(12){
                        margin-right: 0;
                    }
                    .list_header{
                        display: flex;
                        justify-content: space-between;
                        margin-bottom: 21px;
                        line-height: 50px;
                        border-bottom:solid 1px #dde5ec;
                        user-select: none;
                        .title{
                            font-size: 18px;
                            font-weight: 600;
                            color: var(--mainColor);
                        }
                        .more{
                            font-size: 12px;
                            color: #7a8591;
                            letter-spacing: 1px;
                            cursor: pointer;
                            &:hover{
                                color: var(--mainColor);
                                font-weight: bold;
                            }
                        }
                    }
                    ul{
                        li{
                            width:100%;
                            line-height: 28px;
                            text-overflow: ellipsis;
                            white-space: nowrap;
                            overflow: hidden;
                            font-size: 14px;
                            color:#424a52;
                            cursor: pointer;
                            i{
                                display: inline-block;
                                position: relative;
                                top: -3px;
                                width: 5px;
                                height: 5px;
                                margin-right: 7px;
                                border-radius: 50%;
                                background: #424a52;
                            }
                            &:hover{
                                color: var(--mainColor);
                                text-decoration: underline;
                            }
                        }
                    }
                }
            }
            .contain_footer{
                position: relative;
                width: 100%;
                height: 384px;
                background: url('../../assets/pc/images/help/bottom_bg.png') no-repeat center center;
                background-size: cover;
                .footer_header{
                    position: relative;
                    line-height: 144px;
                    user-select: none;
                    p{
                        font-size: 29px;
                        font-weight: bold;
                        letter-spacing: 3px;
                        color: #1f2123;
                    }
                    span{
                        display: inline-block;
                        position: absolute;
                        top: 22px;
                        right: 0;
                        left: 0;
                        bottom: 0;
                        margin: auto;
                        width: 104px;
                        height: 18px;
                        background-color: var(--mainColor);
                        opacity: 0.7;
                    }
                }
                .common_question_list{
                    position: relative;
                    width: 1295px;
                    margin: 0 auto;
                    text-align: left;
                    p{
                        display: inline-block;
                        width: 275px;
                        margin-right: 56px;
                        line-height: 36px;
                        font-size: 14px;
                        color: #42474d;
                        text-align: left;
                        text-overflow: ellipsis;
                        white-space: nowrap;
                        overflow: hidden;
                        cursor: pointer;
                        &:hover{
                            color: var(--mainColor);
                            font-weight: bold;
                        }
                        &:nth-child(4),&:nth-child(8),&:nth-child(12),&:nth-child(16){
                            margin-right: 0;
                        }
                    }
                }
            }
        }
        .footer{
            position: absolute;
            bottom:0;
            left: 0;
            background-color: transparent;
        }
    }
</style>

<script>
    import CommonHead from '@/components/nav/CommonHead.vue';
    import CommonFoot from '@/components/nav/CommonFoot.vue';
    export default {
        metaInfo: {
			title: '吾道-帮助中心',
			meta: [
                {
                    property: 'og:title',
                    content: '吾道-帮助中心'
                },
                {
                    property: 'og:url',
                    content: 'https://www.woodo.cn/help/'
                },
                
			]
        },
        components:{
            CommonHead,
            CommonFoot,
        },
        data(){
            return{
                question_list:[],                        // 问题列表
                common_question_list:[]                  // 常见问题列表
            }
        },
        mounted() {
            let that = this;
            that.get_question_list();
            that.get_common_question_list();
        },
        methods: {
            // 文档详情页跳转
            to_help_list: function (q = {}) {
                /**
                 * query: { categoryId, problemId }
                 */
                this.$router.push({
                    path: '/help/detail/',
                    query: q,
                });
            },
            // 获取分类分组列表
            get_question_list: function () {
                let that = this;
                that.$axios.get('/api/help/list/group_by_category/').then(data => {
                    if(data.data.code !== '2') return that.$toast(data.data.content);
                    that.question_list = data.data.data;
                }).catch(err => {
                    that.$toast('获取问题列表错误');
                });
            },
            // 获取常见问题列表
            get_common_question_list: function() {
                let that = this;
                that.$axios.get('/api/help/common_questions/').then(data => {
                    if(data.data.code !== '2') return that.$toast(data.data.content);
                    // 最多只显示16条
                    that.common_question_list = data.data.data.slice(0,17);
                }).catch(err => {
                    that.$toast('获取常见问题列表失败~');
                });
            },
        },
    }
</script>