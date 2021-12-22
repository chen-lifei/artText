<template>
    <div class="share_expire">
        <action_sheet ref="ActionSheet"
            :sheetClass="'expire_setting_modal'"
            :value="link_expire_arr"
            :showCancel="false">
        </action_sheet>
    </div>
</template>

<script>
import action_sheet from '@/components/CommonActionSheet.vue';
export default {
    components:{
        action_sheet,
    },
    props: ['document_info'],
    data () {
        return {
            uneffect: false,
            link_expire_arr: [
                {   
                    key:'forever',
                    text:'永久有效',
                    countdown:'永久',
                    after:`<span>适用于个人主页，公开资料</span>`,
                    onClick: ()=>{this.change_link_expire(this.link_expire_arr[0])}
                },
                {
                    key:'sevenDay',
                    text:'7天',
                    countdown:'7天',
                    after:`<span>适用于小组或部门内分享，7天后失效，他人将无法访问文档</span>`,
                    onClick: ()=>{this.change_link_expire(this.link_expire_arr[1])}
                },
                {
                    key:'oneDay',
                    text:'1天',
                    countdown:'1天',
                    after:`<span>适用隐私性较强的内部文档</span>`,
                    onClick: ()=>{this.change_link_expire(this.link_expire_arr[2])}
                },
            ],
        };
    },
    methods: {
        show: function(obj){
            let that = this,
                index = that.link_expire_arr.findIndex(item => item.key === that.document_info.urlExpireType);
            // 增加选中状态
            that.link_expire_arr[index].class = 'check';
            that.$refs.ActionSheet.open();
            that.uneffect = obj ? obj.uneffect : false;
        },
        // 权限设置 - 设置分享链接有效期
        change_link_expire: function(item){
            let that = this;
            that.$axios.post('/api/member/document/set_url_expire/', {
                docId: that.document_info.id,
                type: item.key
            })
            .then(function(data){
                if(data.data.code == 2){
                    that.parent_data_update({key:item.key,time:item.countdown})
                    that.$toast("设置成功",1000,'wap');
                }else{
                    that.$toast(data.data.content,1000,'wap');
                }
                // 清除选中状态
                that.link_expire_arr.forEach(item => {
                    item.class = '';
                })
            })
        },
        // 父组件过期时间更新
        parent_data_update: function(obj){
            this.$emit('update_expire',obj);
        },
    },
}
</script>

<style lang="less" scoped>
    @deep: ~'>>>';
    @{deep} .expire_setting_modal{
        .action-sheet-backdrop{
            background-color: rgba(0, 0, 0, .5);
        }
        .action-sheet-container{
            padding: .63rem .7rem;
            .action-sheet-list{
                position: relative;
                width: 100%;
                height: auto;
                line-height: 0;
                padding: 1.05rem 0 1.13rem;
                border-bottom: .02rem solid #d6dbe6;
                text-align: left;
                span{
                    display: block;
                    height: 1.15rem;
                    line-height: 1.15rem;
                    font-size: .87rem;
                    color: #2d2d2d;
                }
                .list-after{
                    display: block;
                    width: 62%;
                    height: .8rem;
                    line-height: .8rem;
                    margin-top: .5rem;
                    span{
                        margin-top: .5rem;
                        font-size: .6rem;
                        color: #676e77;
                    }
                }
                &:nth-child(2) .list-after{
                    margin-bottom:.83rem;
                    span{
                        height: 1.6rem;
                        line-height: 0.8rem;
                    }
                }
                &:last-child{
                    border: none;
                }
                &.check::after{
                    content:"";
                    position:absolute;
                    right:0;
                    top: 1.4rem;
                    width:1rem;
                    height:0.87rem;
                    background:url(../assets/wap/images/authority/authority_checked.png) center no-repeat;
                    background-size: contain;
                }
            }
        }
    }
</style>