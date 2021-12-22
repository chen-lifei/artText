<template>
	<div class="business-license-main">
        <!-- 通用头部 -->
		<CommonHead></CommonHead>
        <!-- 营业执照主体 -->
        <div class="license-wrap">
            <img src="https://woodo.oss-cn-shenzhen.aliyuncs.com/upload/foreverImage/business-license.jpg">
        </div>
        <!-- 通用底部 -->
		<CommonFoot></CommonFoot>
	</div>
</template>

<script>
	import CommonHead from '@/components/nav/CommonHead.vue';
	import CommonFoot from '@/components/nav/CommonFoot.vue';
    export default {
        components: {CommonHead , CommonFoot},
        metaInfo() {
			return {
				title: '吾道-营业执照',
				meta: [{
                    property: 'og:title',
                    content: '吾道-营业执照'
                },
                {
                    property: 'og:url',
                    content: 'https://www.woodo.cn/license/'
                }]
			};
		},
		data(){
			return{
			}
		},
		mounted () {
        },
	}
</script>

<style lang="less" scoped>
.business-license-main {
    width: 100%;
    text-align: center;
    .license-wrap {
        height: calc(100vh - 120px);
        img {
            display: inline-block;
            vertical-align: middle;
            height: 100%;
            max-height: 536px;
        }
        &::after {
            content: "";
            display: inline-block;
            vertical-align: middle;
            width: 0;
            height: 100%;
        }
    }
}
</style>