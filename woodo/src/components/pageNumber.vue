<template>
    <div class="page-number-wraper">
        <template v-for="number in pageList">
            <div class="page-item" :class="{current: number === pageNumber}" :key="number" @click="selectPageNumber(number)">
                {{number}}
            </div>
        </template>
    </div>
</template>

<script>
export default {
    props: {
        // 当前页数
        pageNumber: {
            type: [String, Number],
            default: 1,
        },
        // 总页数
        totalPages: {
            type: [String, Number],
            default: 0,
        },
        // 最多展示几个页数
        minShowNumber: {
            type: [String, Number],
            default: 5
        },
    },
    data() {
        return {}
    },
    computed: {
        pageList(){
            let pageNumber = this.pageNumber;
            let minShowNumber = this.minShowNumber;
            let totalPages = this.totalPages;
            let pageList = [];
            // 总页数 小于 最小展示页数
            if (totalPages <= minShowNumber) {
                for (let i = 1; i <= totalPages; i++) {
                    pageList.push(i);
                }
            } else {
                let startIndex = pageNumber - 1 > 1 ? pageNumber - 1 : 1;
                let endIndex = startIndex + minShowNumber - 1;

                if (endIndex > totalPages) {
                    startIndex = totalPages - (minShowNumber - 1);
                    endIndex = totalPages;
                }
                for (let i = startIndex; i <= endIndex; i++) {
                    pageList.push(i);
                }
            }
            return pageList;
        }
    },
    methods: {
        // 选择页码
        selectPageNumber(pageNumber){
            this.$emit('select', pageNumber);
        },
    }
}
</script>

<style lang="less" scoped>
.page-number-wraper {
    display: flex;
    .page-item {
        margin-right: 10px;
        display: flex;
        justify-content: center;
        align-items: center;
        width: 32px;
        height: 32px;
        color: #666666;
        background: #f4f4f4;
        border-radius: 8px;
        cursor: pointer;
        user-select: none;
        &:hover {
            background: #d4d4d5;
        }
        &.current {
            background: var(--mainColor);
            color: #ffffff;
            pointer-events: none;
        }
    }
}
</style>