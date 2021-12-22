<template>
	<div class="index-contain">
		<CommonHead :options="{theme:'dark'}"></CommonHead>
		<div class="body_404">
			<h1>{{error_message}}</h1>
			<img src="../../assets/pc/images/404/404.png"/>
			<div class="btn-group">
				<div class="btn btn-left" @click="back">刷新</div>
				<a href="/" class="btn btn-right">返回首页</a>
			</div>
		</div>
		<CommonFoot></CommonFoot>
	</div>
</template>

<script>
	import CommonHead from '@/components/nav/CommonHead.vue';
	import CommonFoot from '@/components/nav/CommonFoot.vue';
    export default {
		components: {CommonHead, CommonFoot},
		data(){
			return{
				error_message:""
			}
		},
		created(){
			let that = this;
			if(that.$route.query.type === 'expired'){
				that.error_message = '链接已失效';
			}else if(that.$route.query.type === 'unregistered'){
				that.error_message = '用户未注册';
			}
		},
		methods: {
			back: function() {
				window.history.back();
			}
		}
	}
</script>

<style scoped>
	@import url("../../assets/pc/css/common.css");
	
	.body_404 {
		position: fixed;
		left: 0;
		right: 0;
		top: 50%;
		height: 480px;
		margin-top: -240px;
	}
	.body_404 img {
		display: block;
		margin: 50px auto;
	}
	.body_404 .btn-group {
		width: 200px;
		margin: 0 auto;
		overflow: hidden;
	}
	.body_404 .btn-group .btn {
		display: block;
		width: 50px;
		height: 100px;
		background: url(../../assets/pc/images/404/icon.png) no-repeat;
		color: #333;
		text-align: center;
		line-height: 150px;
		cursor: pointer;
	}
	.body_404 .btn-group .btn-left {
		float: left;
		background-position: left top;
	}
	.body_404 .btn-group .btn-right {
		float: right;
		background-position: right top;
	}
		/*底部*/
	
	.footer {
		position: fixed;
		bottom: 0;
		left: 0;
		right: 0;
		border-top: 1px solid #efefef;
	}
</style>