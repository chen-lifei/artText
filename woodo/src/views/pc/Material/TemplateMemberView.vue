<template>
	<div class="template_contain" ref="list_height">
		<div class="contain_wrapper">
			<!-- 通用头部 -->
			<CommonHead :options="head_options"></CommonHead>
			<div class="member_head">
				<img :src="author_head">
				<p class="name">{{author_name}}</p>
				<div>
					<span>{{total_template}} 作品</span>
					<span>{{author_num}} 人气</span>
				</div>
			</div>
			<div class="template_pannel">
				<div class="template_list_contain">
					<div class="recommend_title">
						<a href="/template/" v-bdtongji="'模板中心-TA的主页-所有模板-全部-全部汇总'">所有模板</a>
						<a href="javascript:;" @click="get_member_info('hot',false)" v-bdtongji="'模板中心-TA的主页-右上角-右上角-使用最多'">使用最多</a>
						<a href="javascript:;" @click="get_member_info('newUpload',false)" v-bdtongji="'模板中心-TA的主页-右上角-右上角-最新上传'">最新上传</a>
					</div>
					<div class="list_wrapper" ref="doc_height">
						<div class="template_list" :style="{'min-height': template_height + 'px'}" ref="card_height" v-for="(item,index) in template_list" @mouseover='template_masking_event(index,true)' @mouseout='template_masking_event(index,false)'>
							<div class="list_contain" :style="{'min-height': template_height - 30 + 'px'}">
								<img :src="item.image">
								<transition name="modal-fade">
									<div class="masking" v-show="template_masking_show && template_index == index">
										<div class="wrapper">
											<a @click="use_template(item)" class="edit" :class="{'lock' : item.isVip && !user_info.memberVipEffect}" v-tooltip="item.isVip && !user_info.memberVipEffect ? '会员专享模板':''">立即编辑<i></i></a>
											<a class="detail" @click="check_detail(item.id)">查看详情</a>
										</div>
										<button class="collect" :class="{had_collected:favorite_map[item.documentId]}" @click="collect_template(item.documentId)"></button>
									</div>
								</transition>
							</div>
							<p class="title">{{item.name}}</p>
						</div>
						<div class="template_list" style="background-color:transparent;height:0;padding:0;"></div>
						<div class="template_list" style="background-color:transparent;height:0;padding:0;"></div>
						<div class="template_list" style="background-color:transparent;height:0;padding:0;"></div>
						<div class="template_list" style="background-color:transparent;height:0;padding:0;"></div>
						<div class="template_list" style="background-color:transparent;height:0;padding:0;"></div>
						<div class="template_list" style="background-color:transparent;height:0;padding:0;"></div>
						<div class="template_list" style="background-color:transparent;height:0;padding:0;"></div>
						<div class="template_list" style="background-color:transparent;height:0;padding:0;"></div>
					</div>
					<div class="no_more" v-if='template_nomore && template_list.length !== 0'><span>没有更多了</span></div>
				</div>
			</div>
			<backTop ref="backTop"></backTop>
			<CommonFoot></CommonFoot>
		</div>
	</div>
</template>

<style lang="less" scoped>
	@import url("~@/assets/pc/css/common.css");
	@background_image:url(~@/assets/pc/images/template/template_sp.png) no-repeat;
	// 主体
	.template_contain{
		position:fixed;
		top:0;
		left:0;
		height:100%;
		min-width:1240px;
        overflow-y:auto;
        background:#fafafa;
	}
	.contain_wrapper{
		position:relative;
		min-height:100vh;
	}
	.member_head{
		width:100%;
		height:310px;
		background: url(~@/assets/pc/images/template/member_bg.jpg) bottom center no-repeat;
		background-size:cover;
		text-align:center;
		img{
			width: 80px;
			height: 80px;
			margin-top:97px;
			border-radius: 50%;
		}
		p{
			margin-top: 8px;
			font-size:18px;
			color: #fff;
		}
		div{
			margin-top:37px;
			width: 100%;
			text-align: center;
			span{
				font-size: 14px;
				color: #fff;
				&:first-child{
					margin-right: 80px;
				}
			}
		}
	}
	// 列表模块
	.template_pannel{
		padding: 35px 27px 90px;
		.template_list_contain{
			width: 100%;
			text-align:center;
			margin:0 auto;
			.list_wrapper{
				position: relative;
				display: flex;
				flex-wrap: wrap;
				width: calc(100% + 20px);
				height: auto;
				overflow: hidden;
			}
		}
		.template_list{
			position: relative;
			display: inline-block;
			flex: 1 1 auto;
			align-self: flex-start;
			width: 290px;
			height: auto;
			max-width: 100%;
			max-height: 100%;
			margin: 0 20px 30px 0;
			overflow: hidden;
			font-size: 0;
			background:url(/public/images/common/logo-text-gray.png) no-repeat center 40%;
			cursor: pointer;
			.list_contain{
				position:relative;
				width:100%;
				height:100%;
				border: 1px solid #e8eef3;
				box-shadow: 0px 3px 3px 0px rgba(0, 0, 0, 0.04);
			}
			img{
				max-width: 100%;
				max-height: 100%;
			}
			.title{
				width: 100%;
				height: 30px;
				line-height:30px;
				padding-right:50px;
				overflow: hidden;
				text-overflow:ellipsis;
				white-space: nowrap;
				text-align:left;
				font-size:14px;
				color:#585858;
			}
			.masking{
				position:absolute;
				top:0;
				left:0;
				width:100%;
				height:100%;
				background-color:rgba(0,0,0,0.5);
				&:after{
					content:"";
					display:inline-block;
					vertical-align:middle;
					width:0;
					height:100%;
				}
				.wrapper{
					display:inline-block;
					vertical-align:middle;
					width:100%;
				}
				a{
					display:block;
					width: 110px;
					height: 42px;
					line-height:42px;
					margin:0 auto;
					border-radius: 4px;
					font-size:14px;
					color:#fff;
					text-align:center;
					&:hover{
						opacity:0.9;
					}
					&.edit{
						margin-bottom:14px;
						background-color:var(--mainColor);
					}
					&.edit.lock{
						i{
							width: 14px;
							height: 14px;
							margin-left: 10px;
							vertical-align: middle;
							display: inline-block;
							background: url(~@/assets/pc/images/common/lock_white.png) no-repeat;
							background-size: cover;
						}
					}
					&.detail{
						background-color:#2cd597;
					}
				}
				button{
					position: absolute;
					right:5px;
					top:5px;
					width:30px;
					height:30px;
					text-align:center;
					border-radius:4px;
					background:rgba(0,0,0,0.6) @background_image -88px -46px;
					&.had_collected{
						background:rgba(0,0,0,0.6) @background_image -119px -46px;
					}
				}
			}
		}
		.recommend_title{
			position: relative;
			height:60px;
			line-height:60px;
			text-align:left;
			color:var(--mainColor);
			a{
				position: absolute;
				top:50%;
				height:60px;
				line-height:60px;
				margin-top:-30px;
				color: #8a8a8a;
				&:nth-child(2){
					right:0;
				}
				&:nth-child(3){
					right:75px;
				}
				&:hover{
					color:var(--mainColor);
				}
			}
		}
		.no_more{
			position: relative;
			width: 100%;
			height: 58px;
			padding: 31px 0 0;
			margin-top:-30px;
			line-height: 0;
			text-align: center;
			span{
				display: inline-block;
				height: 26px;
				line-height: 26px;
				font-size: 14px;
				color: #969fac;
				vertical-align: top;
			}
			&:after {
				content: "";
				position: absolute;
				top: 0;
				left: 50%;
				width: 54px;
				height: 32px;
				margin-left: -27px;
				background:url(~@/assets/pc/images/common/common_sp.png) 9px -21px;
			}
		}
	}
	/*底部*/
	.footer {
		position: absolute;
		bottom:0;
		left: 0;
		right: 0;
		background-color:#0a0d11;
	}
</style>

<script>
	import CommonHead from '@/components/nav/CommonHead.vue';
	import CommonFoot from '@/components/nav/CommonFoot.vue';
	import backTop from '@/components/BackTop.vue';
	export default{
		metaInfo: {
			title: '吾道-模板中心',
			meta: [
			    {
                    property: 'og:title',
                    content: '吾道-模板中心'
                },
                {
                    property: 'og:url',
                    content: 'https://www.woodo.cn/template/member/'
                },
			]
		},
		components: {
			CommonHead,
			CommonFoot,
			backTop,
		},
		data(){
			return{
				user_info:{},
                head_options:null,
				template_list: [
					{'collectCount':'','createDate':'','documentId': '','id': 0,'image': "",'modifyDate': '','name': "",'sn': "",'type': "slides",'usenum': ''},
					{'collectCount':'','createDate':'','documentId': '','id': 0,'image': "",'modifyDate': '','name': "",'sn': "",'type': "slides",'usenum': ''},
					{'collectCount':'','createDate':'','documentId': '','id': 0,'image': "",'modifyDate': '','name': "",'sn': "",'type': "slides",'usenum': ''},
					{'collectCount':'','createDate':'','documentId': '','id': 0,'image': "",'modifyDate': '','name': "",'sn': "",'type': "slides",'usenum': ''},
					{'collectCount':'','createDate':'','documentId': '','id': 0,'image': "",'modifyDate': '','name': "",'sn': "",'type': "slides",'usenum': ''},
					{'collectCount':'','createDate':'','documentId': '','id': 0,'image': "",'modifyDate': '','name': "",'sn': "",'type': "slides",'usenum': ''},
					{'collectCount':'','createDate':'','documentId': '','id': 0,'image': "",'modifyDate': '','name': "",'sn': "",'type': "slides",'usenum': ''},					
					{'collectCount':'','createDate':'','documentId': '','id': 0,'image': "",'modifyDate': '','name': "",'sn': "",'type': "slides",'usenum': ''}
				],
				favorite_map:[],
				page_number: 1,
				total_template: '',
				total_pages: 1,
				template_masking_show: false,
				template_scroll: true,          // 模板是否还需滚动加载
				scroll_loading: false,          // 滚动加载标识
				template_nomore: false,        // 没有更多模板
				template_index: "",
				template_height:150,            // 模板最小高度
				author_name: "",
				author_head: "",
				author_num: "",
				author_id:'',
				template_sort: "newUpload"
			}
		},
		mounted(){
			this.user_info = this.$common.get_login_state();
			this.author_id = this.$route.query.memberId ? this.$route.query.memberId : '';
			this.get_member_info('newUpload');
			this.template_scroll_event();
			// 绑定返回头部组件
            this.$refs.backTop.show($('.template_contain'));
		},
		methods:{
			// 获取模版列表
			get_member_info: function(sort,scroll){
				let that = this;
                that.$axios.get('/api/template/author/' + that.author_id, {
					params: {
						pageSize: 30,
						pageNumber: that.page_number,
						sort: sort
					}
				})
					.then(function(data){
						if(data.data.code === '2'){
							if(scroll){
								that.template_list = that.template_list.concat(data.data.data.dataList);
								that.template_scroll = true;
							}else{
								that.template_list = data.data.data.dataList;
								that.favorite_map = data.data.data.favoriteMap;
								that.total_template = data.data.data.total;
								that.author_name = data.data.data.nickName;
								that.author_head = data.data.data.head;
								that.author_num = data.data.data.usenum;
								that.template_sort = sort;
							}
							that.page_number = data.data.data.pageNumber;
							that.total_pages = data.data.data.totalPages;
							if(that.total_pages === 1){
								that.template_nomore = false;
							}
							that.$nextTick(function(){
								that.template_height = that.$refs.card_height && that.$refs.card_height[0] ? that.$refs.card_height[0].offsetHeight : '';
							});
						}
					});
			},
			// 模板遮罩事件
			template_masking_event: function(index,type){
				let that = this;
				that.template_masking_show = type;
				that.template_index = index;
			},
			// 滚动加载
            template_scroll_event: function(){
                let that = this,
					window_height = window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight;
                that.$refs.list_height.addEventListener('scroll', () => {
					let template_scroll = that.template_scroll,
						scroll_top = that.$refs.list_height.scrollTop;
					// 头部样式更改
					if(scroll_top > 0){
						that.head_options = {theme:'white',fixed:true};
					}else{
						that.head_options = null;
					}
                    if(that.$refs.list_height.scrollTop + window_height - 465 >= that.$refs.doc_height.clientHeight && template_scroll){
                        let _pageNumber = that.page_number,  // 当前页码
							_totalPages = that.total_pages;  // 总页码
						_pageNumber++;
                        if(_pageNumber <= _totalPages){
							that.scroll_loading = true;
							that.page_number = _pageNumber;
							that.template_scroll = false;
							that.get_member_info(that.template_sort,true);
                        }else if(_totalPages !== 1){
							that.template_nomore = true;
							that.template_scroll = false;
                        }
                    }
                }, false);
			},
			 // 模板收藏功能
			collect_template:function(id){
				let that = this,_url,_state,_toast,_list = that.favorite_map;
				if(_list[id]){
					_url = '/api/member/delete_collect/';
					_state = false;
					_toast = "取消收藏成功";
				}else{
					_url = '/api/member/collection/';
					_state = true;
					_toast = "收藏成功";
				}
                that.$axios.post(_url,{
					documentId: id,
					type: 'template'
				}).then(function(data){
					if(data.data.code == 2){
						if(_state){
							that.$set(that.favorite_map, id, true);
						}else{
							that.$set(that.favorite_map, id, false);
						}
						that.$toast(_toast,1000);
					}else{
						that.$toast(data.data.content,1000)
					}
				})
            },
			// 使用模版点击事件
			use_template: function(item){
				if(!item.documentId) return;
				if(item.isVip && !this.user_info.memberVipEffect){
					this.$modal({templateType:'memberGrade'});
					return;
				}
				this.$router.push({path:'/edit/',query:{modalId:item.documentId}});
			},
			// 查看详情事件
			check_detail: function(id){
				if(!id) return;
				this.$router.push({path:'/template/detail/',query:{templateId:id}});
            },
		}
	}
</script>