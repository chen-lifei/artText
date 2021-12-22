<template>
    <div>
        <!-- 未选订阅作品领域时展示订阅作品按钮 -->
        <div class="subscription_works_btn" v-if="subscribed_works_list.length === 0">
            <span class="subscribe_btn" @click="subscribe_works_toggle()" v-bdtongji="`文档中心-首页-右侧-右侧-订阅作品`">+订阅作品</span>
        </div>
        <!-- 已选订阅作品领域时展示订阅作品列表 -->
        <div class="subcription_works_list" v-else>
            <div class="head">
                <p>订阅作品</p><span @click="subscribe_works_toggle()">+</span>
            </div>
            <div class="body">
                <p v-for="(item,index) in subscribed_works_list" @click="check_detail(item.id)" :key="index">
                    <span class="work_name" v-tooltip="item.name">{{item.name}}</span>
                    <span class="work_createdate">{{item.createDate}}</span>
                </p>
            </div>
            <div class="foot">
                <a href="/work_share/">更多></a>
            </div>
        </div>
        <!-- 订阅作品弹框 -->
        <transition name="modal-fade">
            <div class="subscribe_works_modal" v-if="subscribe_works_show">
                <div class="subscribe_works_contain">
                    <div class="header">
                        <span class="title">订阅作品</span>
                        <span class="tip">添加你感兴趣的分类</span>
                    </div>
                    <div class="body">
                        <ul>
                            <li class="work_content"
                                v-for="item in subscription_works_type_list"
                                :key="item.id"
                                :class="{current:current_subscription_type_list.indexOf(item.id) >= 0 }"
                                @click="choose_subscribe_works(item)">
                                <span class="type_name">+{{item.name}}</span>
                                <span class="remove" v-if="current_subscription_type_list.indexOf(item.id) >= 0"></span>
                            </li>
                        </ul>
                    </div>
                    <div class="footer">
                        <button class="cancel" @click="subscribe_works_toggle()">取消</button>
                        <button class="submit" :class="{disabled:subscribed_works_type_list.length === 0 && current_subscription_type_list.length === 0}" @click="subscribe_works_save()">保存</button>
                    </div>
                </div>
            </div>
        </transition>
    </div>
</template>

<style lang="less" scoped>

    .subscription_works_btn{
        position:relative;
        margin-top: 22px;
        cursor: pointer;
        span{
            display: block;
            height:48px;
            line-height: 48px;
            color: #fff;
            font-size: 18px;
            text-align: center;
            background:url("../../../assets/pc/images/doc/subscribe_btn_bg.png")			
        }
        &:hover{
            opacity: .8;
        }
    }
    .subcription_works_list{
        position: relative;
        margin-top: 22px;
        width: 191px;
        height: 230px;
        background-color: #fff;
        border: solid 1px #e3e5eb;
        border-radius: 1px;
        overflow: hidden;
        .head{
            display: flex;
            justify-content: space-between;
            height: 40px;
            line-height: 40px;
            background-color: #f7f8fa;
            user-select:  none;
            p{
                font-size: 14px;
                color: #6c737b;
                margin-left: 18px;
            }
            span{
                margin-right: 8px;
                font-size: 25px;
                font-weight: bold;
                color: #4b8ff8;
                cursor: pointer;
                &:hover{
                    opacity:.8;
                }
            }
        }
        .body{
            height: 162px;
            padding-top:5px;
            p{
                display: flex;
                justify-content: space-between;
                height: 30px;
                line-height: 30px;
                overflow: hidden;
                cursor: pointer;
                &:hover{
                    background-color: #f1f8ff;
                }
            }
            span{
                position: relative;
                display: inline-block;
                width:auto;
                font-size:12px;
                overflow: hidden;
                text-overflow:ellipsis;
                white-space: nowrap;
            }
            .work_name{
                width: 140px;
                padding-left: 17px;
                color:#7b838d;
            }
            .work_createdate{
                margin-right: 6px;
                color:#a8b3bf;
            }
        }
        .foot{
            height:26px;
            line-height: 26px;
            background-color: #eef5ff;
            text-align: center;
            cursor:pointer;
            a{
                font-size: 12px;
                color: #0d7bf8;
                text-align: center;
                cursor:pointer;
            }
        }
    }
    //订阅作品弹框
	.subscribe_works_modal{
		position: fixed;
		top: 0;
		left: 0;
        z-index:999;
		width: 100%;
		height: 100%;
		text-align: center;
		background-color: rgba(0, 0, 0, 0.502);
		font-size: 16px;
        color: #666666;
        &:after{
            content:"";
            display:inline-block;
            vertical-align:middle;
            width:0;
            height:100%;
        }
		.subscribe_works_contain{
            position: relative;;
            display:inline-block;
            vertical-align:middle;
			width:510px;
			height:410px;
			margin:0 auto;
			padding:10px 27px;
			background:#fff;
			border-radius:4px;
			.header{
				position: relative;
				display: flex;
                justify-content: space-between;
                height:44px;
                line-height:44px;
				margin-bottom: 14px;
                border-bottom: solid 1px #ced2d8;
                user-select:none;
				.title{
					font-size: 16px;
					font-weight: bold;
					color: #181818;
				}
				.tip{
					font-size: 14px;
					color:#75818e;
				}
			}
			.body{
                width: 100%;
                height: 240px;
                overflow: hidden;
                padding-top:7px;
                &::-webkit-scrollbar-track{
                    background-color:#ffffff;
                }
                &::-webkit-scrollbar-thumb{
                    background-color:#eff0f4;
                }
                ul{
                    text-align: left;
                }
                .work_content{
                    display: inline-block;
                    position: relative;
                    width: 68px;
                    height: 30px;
                    line-height: 28px;
                    margin-right: 8px;
                    margin-bottom: 10px;
                    background-color: #ffffff;
                    border-radius: 4px;
                    border: solid 1px #c3ceda;
                    text-align: center;
                    cursor:pointer;
                    .type_name{
                        font-size: 12px;
                        color: #75818e;
                    }
                    .remove{
                        position: absolute;
                        right: -6px;
                        top: -7px;
                        width: 14px;
                        height: 14px;
                        border-radius: 50%;
                        background: #ff5353;
                        cursor:pointer;
                        &:before{
                            content: '';
                            position: absolute;
                            top: 6px;
                            left: 4px;
                            width:6px;
                            border-bottom:solid 2px #fff;
                        }
                    }
                    &.current,&:hover{
                        background-color: var(--mainColor);
                        border-color: transparent;
                        .type_name{
                            color: #fff;
                        }
                    }
                }
			}
			.footer{
				position: absolute;
                left:0;
                bottom: 30px;
				display: flex;
				justify-content: center;
                width:100%;
                text-align:center;
				button{
					display: inline-block;
					width:100px;
					height: 40px;
					line-height: 40px;
					text-align: center;
					background-color: #e9eef3;
					border-radius: 4px;
					color: #6c6c6c;
					font-size: 14px;
                    &:hover{
                        opacity: .8;
                        &:first-child{
                            background-color: #ff5656;
                            color: #fff;
                        }
                    }
					&:last-child {
						margin-left: 18px;
						background-color: var(--mainColor);
						color: #fff;
                    }
                    &.disabled{
                        background-color: #e9eef3;
                        cursor: default;
                    }
                }
			}
		}
	}
</style>

<script>
export default {
    name:'subscribe_works',
    data(){
        return{
            subscribe_works_show: false,		  // 订阅作品弹框标识
            subscription_works_type_list:[],	  // 全部订阅作品领域列表
            subscribed_works_type_list: [],       // 已订阅的订阅作品类型      
            current_subscription_type_list: [],   // 选中的订阅作品类型
            subscribed_works_list: [],            // 已订阅的作品列表  
        }
    },
    mounted(){
        this.get_subscribed_works();
    },
    methods:{
        // 订阅作品-打开/关闭
        subscribe_works_toggle:function(){
            let that = this;
            that.subscribe_works_show = !that.subscribe_works_show;
            // 订阅作品领域弹框打开状态下获取订阅作品类型列表
            if(that.subscribe_works_show){
                that.$axios.get(`/api/member/subscription/works/category/list/`)
                .then(function(data){
                    that.subscribed_works_type_list = data.data.data.subscribed // 获取已订阅作品类型列表
                    that.subscription_works_type_list = data.data.data.list;  //  获取全部订阅作品领域列表
                    that.current_subscription_type_list = that.$common.clone_object(that.subscribed_works_type_list);
                })
            }
        },
        // 选择订阅作品类型
        choose_subscribe_works:function(item){
            let that = this;
            //  该作品领域尚未选中时，push进选择列表
            if(that.current_subscription_type_list.indexOf(item.id) < 0 ){
                that.current_subscription_type_list.push(item.id);
            }else{
                // 该作品领域已选中时，将其删除
                that.current_subscription_type_list.splice(that.current_subscription_type_list.indexOf(item.id),1);
            }
        },
        // 订阅作品类型-保存
        subscribe_works_save:function(){
            let that = this;
            if(that.subscribed_works_type_list.length === 0 && that.current_subscription_type_list.length === 0) return that.$toast('请选择行业领域后再进行保存', 2000);
            that.$axios.post('/api/member/subscription/works/category/save/',{
                categoryIds : that.current_subscription_type_list.join(','),
            }).then(function(data){
                if(data.data.code === '2'){
                    that.get_subscribed_works();
                    that.subscribe_works_show = false;
                }else{
                    that.subscribe_works_show = false;
                    that.$toast(data.data.content,1000);
                }
            })
        },
        // 获取订阅作品
        get_subscribed_works:function(){
            let that =  this;
            that.$axios.get('/api/member/subscription/works/list/')
            .then(function(data){
                if(data.data.code === '2'){
                    let data_list = data.data.data.splice(0,5);
                    // 时间戳转换
                    for(let i = 0; i < data_list.length; i++) {
                        data_list[i].createDate = that.$common.date_format(new Date(data_list[i].createDate), 'MM-dd');
                    }
                    that.subscribed_works_list = data_list;
                }else{
                    that.$toast(data.data.content,1000);
                }
            })
        },
        // 跳转到作品演示页
        check_detail: function(id){
            if(!id) return false;
            this.$common.window_open_newtab(`/works/slides/${id}/`);
        },
    }
}
</script>