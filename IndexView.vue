<template>
	<div class="index-container">
		<!-- 头部 -->
		<CommonHead :options="head_options" ref="CommonHead"></CommonHead>
        <div class="container1">
            <div class="title flex">
                <div class="text">新一代免费</div>
                <div class="line"></div>
                <div class="text">在线演示文档</div>
            </div>
            <div class="desc">专为中文用户打造，三分钟快速上手</div>
            <div class="create-btn" @click="toHome">
                立即免费制作
                <img @click.stop class="index-image" src="~@/assets/pc/images/index/index.svg" alt="">
            </div>
            <div class="use">吾道已被超过 <span class="number">1,508,678</span> 位白领、学生、公务员、高管和教育工作者使用，其中包括：</div>
            <img class="index-image2" src="~@/assets/pc/images/index/cooperate-company.png" alt="">
        </div>
	</div>
</template>

<script>
    import CommonHead from '@/components/nav/CommonHead.vue';

	export default {
		metaInfo: {
			title: '吾道幻灯片-官方网站-专业的PPT在线协作工具，提供海量精美模板素材',
			meta: [
			    {
                    property: 'og:title',
                    content: '吾道幻灯片-官方网站-专业的PPT在线协作工具，提供海量精美模板素材'
                },
                {
                    property: 'og:url',
                    content: 'https://www.woodo.cn/'
                },
			]
		},
        components:{ CommonHead },
		data() {
			return {
                head_options: { theme:'white', border: true, fixed: true },
			    user: {
			        login: false,
			        name:'',
                    photo:'',
                    email:'',
                },
                screen_h:null,
                template_list: [], // 模板列表
                evaluate_list:[
                    {
                        name: '刘*松',
                        job: '产品经理',
                        photo: 'user_head_01',
                        content: '在学校很少做PPT，工作后却基本每个月都得做2、3个。多亏了吾道的模板商城，买了会员就可以随意下载模板了，省时省力，工作效率明显提高，舒服！'
                    },
                    {
                        name: '李*',
                        job: '公司行政',
                        photo: 'user_head_02',
                        content: '大力推广！在我的努力下，现在我们整个部门都在用吾道了！小编看我这么勤奋，能不能送我点福利呀哈哈哈，铁粉了！'
                    },
                    {
                        name: '黄*露',
                        job: '资深HR',
                        photo: 'user_head_03',
                        content: '一直苦恼该怎么做PPT，吾道的案例跟贴士一下让我的PPT高大尚起来，效率和效果都让我非常满意，希望付出的能得到回报，祝我升职顺利！'
                    },
                    {
                        name: '于*',
                        job: '资深HR',
                        photo: 'user_head_04',
                        content: '无意中发现的宝藏网站，有各种各样的模板可以直接使用，最让我意外的是编辑时还提供内容案例，再根据自己情况改改就可以了！'
                    },
                    {
                        name: '邹*阳',
                        job: '运营总监',
                        photo: 'user_head_05',
                        content: '工作中总是有开不完的会，写不完的的报告，助理向我推荐了这个网站，只使用一次就毫不犹豫开通了会员，所有模板任意使用！'
                    },
                    {
                        name: 'Bre*t',
                        job: '外企负责人',
                        photo: 'user_head_06',
                        content: '刚来中国不久，中文还不太熟练。惊奇地发现吾道居然有英文模板，省去了自己翻译模板的麻烦，工作汇报更轻松！'
                    },
                ],  // 评价列表
                list_width: 0,
                rolling_length: 0,
			}
        },
        watch:{
            template_list(value){
                $(this.$refs.templateSkeleton).removeClass('skeleton');
            },
        },
        mounted(){
            let that = this;
            that.screen_h = window.innerHeight;
            // 登录状态
            that.user = that.$common.get_login_state();
            if(that.user.login && document.referrer.indexOf(window.location.host) < 0) {
                return window.location.href = '/home/';
            }
            if (that.user.name && that.user.name.length > 6) {
                that.user.name = that.user.name.substring(0,6) + '...';
            }
            // get 模板
            that.get_template_list();
            that.change_evaluate_width();
            // 窗口size重调 适应
            window.addEventListener('resize', function(){
                that.change_evaluate_width();
            });
        },
		methods: {
            toHome() {
                this.$router.push('/home/');
            },
            // 首屏按钮动画 (移入)
            fs_btn_animate_in(e) {
                let $el = $(e.target),
                    mouse_x = e.offsetX,
                    mouse_y = e.offsetY,
                    $i = $el.children('i');
                $i.css({
                    'top': mouse_y + 'px',
                    'left': mouse_x + 'px',
                }).addClass('enter_scale').removeClass('out_scale');
            },
            // 首屏按钮动画 (移出)
            fs_btn_animate_out(e) {
                let $el = $(e.target),
                    mouse_x = e.offsetX,
                    mouse_y = e.offsetY,
                    $i = $el.children('i');
                $i.css({
                    'top': mouse_y + 'px',
                    'left': mouse_x + 'px',
                }).addClass('out_scale').removeClass('enter_scale');
            },
            // 模板库列表
            get_template_list() {
                let that = this;
                that.$axios.get('/api/template/list/',{params:{
                    pageSize: 12,
                    pageNumber: 1,
                    cid: '',
                    type: 'slides',
                    sort: 'hot',
                }}).then(data => {
                    let res_data = data.data;
                    if (res_data.code !== '2') return that.$toast(res_data.content);
                    that.template_list = res_data.data.dataList.splice(0, 12);
                }).catch(err => {
                    that.$toast('获取模板列表错误');
                });
            },
            // 使用模版
            use_template(item) {
                let that  = this;
                if (!item) {
                    return;
                }
                if(item.isVip && !that.user.is_vip){
                    that.$modal({templateType:'memberGrade'});
                    return;
                }
                // 跳转到编辑页
                let value = window.localStorage.getItem('woodoExportGuide');
                if (!value) window.localStorage.setItem('woodoExportGuide', 'show');
                window.location.href = '/edit/?modalId=' + item.documentId;
            },
            // 评价列表左右滚动方法
			list_scroll(type) {
				let that = this;
				let list = document.querySelector('.avator_evaluate_list');
				let clientWidth = document.querySelector('.avator_evaluate_list').offsetWidth;
				let width = list.offsetWidth;
				// 如果是向左滚动且存在滚动距离的话
				if(type === 'pre' && that.rolling_length){
					that.rolling_length = that.rolling_length - that.list_width;
					if (that.rolling_length < 0) {
                        that.rolling_length = 0;
                    }
				}
				if(type === 'next' && that.rolling_length <= (width - clientWidth)){
					that.rolling_length = that.rolling_length + that.list_width;
				}
			},
            change_evaluate_width() {
                let that = this;
                let contain_width = $('.evaluate_contain .avator_evaluate').width() * Math.ceil(that.evaluate_list.length / 3) ;
                $('.avator_evaluate_list').css('width', contain_width);
                that.list_width = $('.evaluate_contain .avator_evaluate').width();
                that.rolling_length = 0;
            },
            // 返回顶部
            return_top() {
                $('html,body').animate({scrollTop:0}, 900);
            },
		},
	}
</script>

<style lang="less" scoped>
	.index-container {
        width: 100%;
        min-width: 1240px;
        background-color: #F6F6F9;

        .container1 {
            position: relative;
            padding-top: 310px;
            text-align: center;
            overflow: hidden;
            .title {
                .text {
                    font-weight: bold;
                    font-size: 60px;
                    color: #000000;
                }
                .line {
                    display: inline-block;
                    width: 2px;
                    height: 75px;
                    margin: 0 5px;
                    background-color: #000000;
                }
            }
            .desc {
                font-size: 28px;
                color: #242529;
                margin: 45px 0 90px;
            }
            .create-btn {
                position: relative;
                width: 220px;
                height: 80px;
                line-height: 80px;
                font-size: 20px;
                color: #FFFFFF;
                text-align: center;
                border-radius: 60px;
                margin: 0 auto 320px;
                cursor: pointer;
                background-color: var(--mainColor);
                box-shadow: 0 10px 25px rgba(11,123,246,0.4);
                .index-image {
                    position: absolute;
                    top: 100%;
                    left: calc(100% + 140px);
                }
            }
            .use {
                font-size: 18px;
                color: #949496;
                margin-bottom: 40px;
                .number {
                    font-size: 24px;
                }
            }
            .index-image2 {

            }
        }
    }
</style>