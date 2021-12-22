<template>
    <div class='square_container'>
        
        <!-- 一级分类-->
        <div class="change_list">
            <span :class="{checked:current_page === 'work_share'}" @click="change_page_type('work_share')">共享作品</span>
            <span :class="{checked:current_page === 'template'}" @click="change_page_type('template')">模板中心</span>
            <span class="more" v-if="current_page === 'work_share'" @click="toggle_pull_modal"></span>
        </div>
        <!--作品下拉弹框-->
        <transition name="work_pull_modal">
            <div class="modal-backdrop bg-transparent zindex-2"  
                v-if="current_page === 'work_share' && work_pull_modal_show" 
                @click.stop="toggle_pull_modal">
                <div class="work_pull_modal" v-if="current_page === 'work_share' && work_pull_modal_show">
                    <ul>
                        <li>
                            <a href="/mobile/uploadwork/">提交作品</a>
                        </li>
                        <li>
                            <a href="/mobile/mywork/">我的作品</a>
                        </li>
                    </ul>
                </div>
            </div>
        </transition>

        <keep-alive>
            <!-- 共享作品 -->
            <share_doc ref="work_share" v-if="current_page === 'work_share'"></share_doc>
            <!-- 模板中心 -->
            <template_center ref="template" v-if="current_page === 'template'"></template_center>
        </keep-alive>
        <!-- 回到顶部按钮 -->
        <to_top></to_top>

        <!-- 底部固定栏 -->
        <bottom_bar ref="bottom_bar"></bottom_bar>
    </div>
</template>

<style lang="less" scoped>
    @import url("../../assets/wap/css/common.css");

    .square_container{
        position:relative;
        height: 100vh;
        .change_list{
            position: relative;
            width: 100%;
            background-color: var(--mainColor);
            span{
                position: relative;
                display: inline-block;
                line-height: 2.93rem;
                font-size: 0.8rem;
                color: #ffffff;
                &:first-child{
                    margin:0 1.3rem 0 0.88rem;
                }
                &.checked{
                    font-size: 0.83rem;
                    font-weight: 600;
                    border-bottom: solid 0.2rem #fff;     
                }
            }
            .more{
                position: absolute;
                height: 1.2rem;
                width: 1.2rem;
                top: 0;
                right: 0;
                bottom: 0;
                margin: auto 0.88rem;
                border: solid 0.07rem #ffffff;
                border-radius: 0.14rem;
                &:before,&:after{
                    content: '';
                    position: absolute;
                    top: 0;
                    right: 0;
                    left: 0;
                    bottom: 0;
                    margin: auto;
                    width: 0.125rem;
                    height: 0.525rem;
                    background: #fff;
                }
                &:before{
                    transform:rotate(90deg)
                }
            }
        }
        .modal-backdrop{
            position: absolute;
            .work_pull_modal{
                position: absolute;
                top: 2.53rem;
                right: 0.88rem;
                width: 4.88rem;
                height: 5.05rem;
                background-color: #ffffff;
                box-shadow: 0rem 0.15rem 0.38rem 0rem rgba(80, 85, 94, 0.08);
                border-radius: 0.17rem;
                border: solid 0.03rem rgba(0, 0, 0, 0.05);
                z-index: 12;
                ul{
                    height: 100%;
                    li{
                        height: 2.52rem;
                        text-align: center;
                        line-height: 2.52rem;
                        &:first-child{
                            border-bottom: solid 0.03rem #f2f2f2;
                        }
                    }
                }
            }
        }
    }
</style>

<script>
    import top_banner from "@/views/wap/TopBanner.vue"
    import bottom_bar from '@/components/WapBottomBar.vue';
    import to_top from '@/components/WapToTop.vue';
    import share_doc from "@/views/wap/WorksShareView.vue"
    import template_center from "@/views/wap/TemplateCenterView.vue"
    import news_index from "@/views/wap/NewsIndexView.vue"
    export default {
        components:{
            top_banner,
            bottom_bar,
            to_top,
            share_doc,
            template_center,
            news_index,
        },
        data() {
            return {
                current_page: "",  // 一级分类 共享作品||模板中心
                work_pull_modal_show: false, // 共享作品下拉弹框标识
                show_second_list:false,
            }
        },
        mounted() {
            const that = this; 
            that.user = that.$common.get_login_state();
            // 获取路由参数判断
            let type = window.location.hash.substring(1);
            that.current_page = type || 'work_share';
            window.onhashchange = function () {
                if (location.hash === '#template') {
                    that.current_page = "template"
                }else if (location.hash === '#work_share'){
                    that.current_page = "work_share"
                }
            }
        },
        methods:{
            // 切换分类 - 共享作品 || 模板中心
            change_page_type: function(type){
                let that = this;
                that.current_page = type;
                that.page_number = 1;
                that.work_pull_modal_show = false;               
                //浏览器返回监听跳转
                window.location.hash = type;                
                if (type === 'work_share') {
                    that.$refs.template.show_second_list = false
                }
            },
            // 作品下拉弹框控制方法
            toggle_pull_modal: function(){
                let that = this;
                if(that.user.login){
                    that.work_pull_modal_show = !that.work_pull_modal_show;
                }else{
                    that.$toast('请登录后再进行此操作', 2000 , 'wap');
                }
            },
        },
    }
</script>