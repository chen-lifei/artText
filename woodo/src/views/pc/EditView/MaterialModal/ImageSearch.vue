<template>
    <div class="image-search">
        <div class="search-wraper" :class="{'search-focus': is_focus}">
            <div class="icon-btn" @click.stop="search()">
                <base-icon class="iconsousuo"></base-icon>
            </div>
            <div class="input-wrap">
                <input type="text" placeholder="搜索历史、最新的素材" :value="keyword" @input="input($event)" @focus="is_focus = true" @blur="is_focus = false" @keydown.enter="search()">

                <div class="clear-btn" v-show="is_focus&&keyword.length" @click="clear">
                    <base-icon class="iconchacha"></base-icon>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
export default {
    model: {
        prop: 'keyword',
        event: 'input'
    },
    props:{
        // 搜索关键词
        keyword: {
            type: String,
            default: ''
        },
    },
    data(){
        return{
            /* 状态 */
            is_focus: false, // 搜索框是否聚焦
        }
    },
    methods:{
        search(){
            if(this.keyword.length) this.$emit('search');
        },
        input(e){
            if(!e.target.value) this.$emit('clear');
            this.$emit('input', e.target.value);
        },
        clear(e){
            this.$emit('clear');
        }
    }
}
</script>

<style lang="less" scoped>
.image-search {
    width: 180px;
    height: 30px;
    .search-wraper {
        padding: 0 5px;
        display: flex;
        align-items: center;
        width: 100%;
        height: 100%;
        border-radius: 15px;
        cursor: pointer;

        &.search-focus{
            border: 1px solid #eeeeee;
            cursor: default;
        }
        .icon-btn {
            display: flex;
            cursor: pointer;
            .base-icon {
                margin: auto;
            }
        }
        .input-wrap {
            flex: 1;
            display: flex;
            align-items: center;
            height: 100%;

            input {
                padding-left: 5px;
                flex: 1;
                width: 100%;
                height: 100%;
                font-size: 12px;
                font-weight: 400;
                color: #333333;

                &::placeholder {
                    color: #999999;
                }
            }

            .clear-btn{
                display: flex;
                cursor: pointer;
                .base-icon{
                    margin: auto;
                }
            }
        }
    }
}
</style>