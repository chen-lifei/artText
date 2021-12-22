<template>
	<div class="works-card material-card" v-if="worksShare" @click="preview()" v-bdtongji="`PC-统计-共享作品-全部作品-${worksShare.categoryFullName ? worksShare.categoryFullName.replace(/,/g,'-') : ''}-查看`">
		<div class="works-image">
			<div class="mask">
				<button class="favorite" :class="{ favorite: favoriteInfo }" @click.stop="favorite()" v-bdtongji="`共享作品-首页-全部作品-右上角-收藏`">{{ favoriteInfo ? '取消收藏' : '收藏' }}</button>
			</div>
			<img v-lazy="worksShare.image">
		</div>
		<div class="works-info">
			<h1 :title="worksShare.name" class="works-title text-ellipsis">{{ worksShare.name }}</h1>
			<p class="introduce text-ellipsis">{{ worksShare.introduce }}</p>
			<div class="other">
				<span class="fans"><base-icon class="iconredu" size="16"></base-icon>{{ worksShare.useNum }}人气</span>
				<span class="favorite-num"><base-icon class="iconshoucang" size="16"></base-icon>{{ worksShare.collectNum }}收藏</span>
				<p class="category" :class="getColor()">{{ worksShare.category }}</p>
			</div>
		</div>
		<div class="author-info">
			<img v-lazy="worksShare.authorImg">
			<span class="author-name">{{ worksShare.authorName }}</span>
			<span class="author-date">{{ worksShare.date }}</span>
		</div>
	</div>
	<!-- 骨架卡片 -->
	<div class="works-card skeleton skeleton-loading" :class="cardClass" v-else>
		<div class="works-image"></div>
		<div class="works-info">
			<h1 class="works-title"></h1>
			<p class="introduce"></p>
			<div class="other"><p class="category"></p></div>
		</div>
		<div class="author-info"></div>
	</div>
</template>

<script>
    export default {
		name: "",
		props: {
			worksShare: Object,
			favoriteInfo: [String, Number],
			cardClass: ''
		},
        data(){
            return {
            }
        },
        mounted () {
        },
        methods:{
			// 分类底色
            getColor() {
				let type = this.worksShare.category;
				if (!type) {
					return;
				}
                // 默认颜色
                let color = 'currency';
                // 颜色分类
                let search = [{
                    'color': 'business',
                    'text': ['创业', '融资', '商业', '计划', '名人堂']
                }, {
                    'color': 'graduation',
                    'text': ['教育', '课件', '培训']
                }, {
                    'color': 'government',
                    'text': ['党政', '建设', '政治', '政府']
                }, {
                    'color': 'festival',
                    'text': ['节日', '假日', '休闲', '婚庆', '生活']
                }, {
                    'color': 'job',
                    'text': ['工作', '汇报', '求职', '报告', '总结', '晋升', '运营']
                }, {
                    'color': 'wedding',
                    'text': ['庆典', '纪念']
                }, {
                    'color': 'propaganda',
                    'text': ['企业', '介绍', '行业', '宣传', '商务']
                }, {
                    'color': 'education',
                    'text': ['毕业', '答辩', '读书', '笔记']
                }, {
                    'color': 'other',
                    'text': ['其他']
                }];
                // 遍历查询颜色
                parent:for (let i in search) {
                    let search_text = search[i]['text'],
                        search_color = search[i]['color'];
                    for (let j in search_text) {
                        if (type.indexOf(search_text[j]) >= 0) {
                            color = search_color;
                            break parent;
                        }
                    }
                }
                return color;
            },
			// 作品收藏功能
            favorite() {
				let worksShare = this.worksShare;
                let isRemove = this.favoriteInfo;
                let url = '';
                let toast = '';
                if (isRemove) {
                    url = '/api/member/delete_collect/';
                    toast = "取消收藏成功";
                } else {
                    url = '/api/member/collection/';
                    toast = "收藏成功";
                }
                this.$axios.post(url,{
                    documentId: id,
                    type: 'works'
                }).then(data => {
                    if (data.data.code === '2') {
                        if (!isRemove) {
                            worksShare.collectNum++;
                        }else{
                            worksShare.collectNum--;
                        }
                        this.$toast(toast, 1000);
                    } else {
                        this.$toast(data.data.content, 1000);
                    }
                })
			},
			// 跳转作品详情页
			preview() {
				utils.windowOpenNewtab(`/works/slides/${this.worksShare.id}/`);
			},
        },
    }
</script>

<style lang="less" scoped>
    @skeleton_color: #f2f2f2;
	.works-card{
		position: relative;
		background-color: #ffffff;
		border-radius: 5px;
		transition:all 0.3s;
		cursor:pointer;
		&:hover{
			transform: scale(1.02);
			transition: all 0.3s;
			box-shadow: 0 3px 18px 0 rgba(61, 73, 84, 0.24);
			.works-title{
				color:var(--mainColor);
			}
			.mask{
				display:block;
			}
		}
	}
	.works-image{
		position: relative;
		width: 100%;
		overflow: hidden;
		border-top-left-radius:4px;
		border-top-right-radius:4px;
		&::before{
			content: '';
			display: block;
			padding-top: 56%;       // 511 / 910
		}
		img{
			position: absolute;
			top: 0;
			left: 0;
			width: 100%;
			height: 100%;
			object-fit: cover;
		}
		.mask{
			display:none;
			position: absolute;
			left: 0;
			top: 0;
			z-index: 2;
			width: 100%;
			height: 100%;
			background: rgba(43,42,53,.4);
			.favorite{
				position:absolute;
				top:10px;
				right:20px;
				height:28px;
				line-height:28px;
				width:64px;
				border:1px solid #fff;
				border-radius:14px;
				color:#fff;
				text-align:center;
				font-size:12px;
				transition:all .3s;
				&.favorite{
					color:var(--mainColor);
					border:1px solid var(--mainColor);
					&::before{
						display:none;
					}
				}
				&:before{
					content: '+';
					position: relative;
					display: inline-block;
					vertical-align:top;
					margin-right: 3px;
					font-size: 18px;
					color:#fff;
				}
				&:hover{
					background:var(--mainColor);
					border:1px solid var(--mainColor);
					color:#fff;
					transition:all .3s;
				}
			}
		}
	}
	.works-info{
		padding: 0 20px;
		h1{
			margin-top: 9px;
			height: 44px;
			line-height: 44px;
			width: 100%;
			font-size: 16px;
			font-weight: 600;
			color:#242529;
		}
		.introduce{
			width: 100%;
			color: #5F6063;
			font-size: 12px;
		}
		&>.other{
			width: 100%;
			height: 22px;
			line-height: 22px;
			margin: 24px 0 14px;
		}
		.fans,.favorite-num{
			display: inline-block;
			vertical-align: middle;;
			font-size: 12px;
			color: #949496;
			.base-icon{
				margin-right: 5px;
				transform: translateY(2px);
			}
		}
		.fans{
			margin-right: 26px;
			&::before{
				background-position: -19px 0;
			}
		}
		.favorite-num::before{
			background-position: -37px 0;
		}
		.category{
			float: right;
			height: 24px;
			line-height: 24px;
			width: 64px;
			font-size: 12px;
			color: #fff;
			text-align: center;
			border-radius: 3px;
			&.currency{
				background: #7fc2a0;
			}
			&.business{
				background:#303030
			}
			&.graduation{
				background: #90a0dc;
			}
			&.government{
				background: #dd6b6b;
			}
			&.festival{
				background: #d685d1;
			}
			&.job{
				background: #eba066;
			}
			&.wedding{
				background: #e4729b;
			}
			&.propaganda{
				background: #7ad4dc;
			}
			&.other{
				background: #b4b0af;
			}
			&.education{
				background: #7aa9ce;
			}
		}
	}
	.author-info{
		margin-top: 7px;
		padding: 0 20px;
		height: 53px;
		line-height: 53px;
		border-top: 1px solid #f6f6f9;
		img {
			display: inline-block;
			vertical-align: middle;
			margin-right: 11px;
			height: 20px;
			width: 20px;
			margin-right: 5px;
			border-radius: 50%;
		}
		.author-name{
			color: #242529;
			font-size: 12px;
		}
		.author-date{
			float: right;
			color:#949496;
			font-size: 12px;
		}
	}
	&.skeleton{
		.works-info{
			h1,
			.introduce,
			.category{
				background-color: @skeleton_color !important;
			}
		}
		.fans,
		.favorite,
		.author-info span,
		.author-info img{
			opacity: 0;
		}
	}
	&.placeholder{
		height:0;
		opacity:0;
		z-index:-1;
	}
</style>