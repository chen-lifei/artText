<template>
        <div>
            <CommonHead :options="{theme:'white', fixed:true}"></CommonHead>
            <MemberGradeModal></MemberGradeModal>
        </div>
</template>

<script>
import MemberGradeModal from '@/components/MemberGradeModal.vue';
import CommonHead from '@/components/nav/CommonHead.vue'

export default {
    components: {
        MemberGradeModal,
        CommonHead,
    },
    metaInfo:{
        title: '吾道-会员升级',
        meta: [
            {
                property: 'og:title',
                content: '吾道-会员升级'
            },
            {
                property: 'og:url',
                content: 'https://www.woodo.cn/member/upgrade/'
            },
        ]
    },
    data(){
        return {
        }
    },
    mounted(){
        
    },
    methods:{

    }
}
</script>
<style lang="less" scoped>
    @import url("~@/assets/pc/css/common.css");
    .member_upgrade_container{
        .member_upgrade{
            padding-top:70px !important;
        }
    }
</style>