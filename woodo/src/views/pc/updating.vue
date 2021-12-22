<template>
	<div class="index-contain">
		<CommonHead :options="{theme:'dark'}"></CommonHead>
		<div class="body_404">
			<div class="tips"> 
				为了能让您访问更快更稳定，同时为您提供更高品质的服务，我们将于11.07 02:00 - 11.07 07:00对系统进行升级。
				<br/>因此目前网站的部分功能不能使用，给您造成了不便，请谅解。
			</div>
			<img src="../../assets/pc/images/404/404.png"/>
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
	.tips{
		margin: 50px auto;
	    text-align: left;
	    font-size: 16px;
	    color: red;
	    width: 523px;
	}
</style>