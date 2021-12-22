<template>
    <div class="footer" :class="theme">
    	<a href="https://www.woodo.cn/document/slides/5281674729/">公司简介  </a>
    	<a href="/license/">营业执照  </a>
        <a href="https://beian.miit.gov.cn">粤ICP备18137964号</a>
        <pre>  © 2018-2020 爆裂科技  All rights reserved</pre>
    </div>
</template>

<script>
export default {
	name: 'footer',
	props:['theme']
}
</script>

<style lang="less">
.footer {
	width: 100%;
    height: 60px;
	padding: 20px 0;
	line-height: 20px;
	background-color: #fff;
    font-size: 12px;
    color: #aaa;
	text-align: center;
	font-family: inherit;
	a {
		color: inherit;
		font-family: inherit;
	}
	pre {
		display: inline;
		font-family: inherit;
	}
	&.dark{
		background:#1f1f1f;
		a,pre{
			opacity:.6;
		}
	}
}
</style>