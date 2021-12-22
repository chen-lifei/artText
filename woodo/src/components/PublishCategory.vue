<!--设计师发布作品分类部分的递归组件-->
<template>
    <p
        class="publish_category"
        :class="{ hasChild: item.childrenList && item.childrenList.length }"
        :style="{ display: g === 1 ? 'block' : 'none' }"
    >
        <span
            :class="{ current: item.id === id }"
            :style="{ paddingLeft: 10 + (g - 1) * 20 + 'px' }"
            @click.stop="toggleCategoryNew(item, $event)"
            @dblclick.self="$emit('chooseCate', item)"
            @mouseover.self="categoryEnter"
            @mouseleave.self="categoryLeave"
        >
            {{ item.name }}
            <i
                class="arrow"
                v-if="item.childrenList && item.childrenList.length"
                @click.stop="toggleCategory"
            ></i>
        </span>
        <template v-if="item.childrenList && item.childrenList.length">
            <publish-category
                :item="child"
                :id="id"
                v-for="(child, _index) in item.childrenList"
                :key="_index"
                :grade="g"
                @chooseCate="$emit('chooseCate', $event)"
            />
        </template>
    </p>
</template>

<script>
export default {
    name: "PublishCategory",
    props: ["item", "grade", "id"],
    data() {
        return {
            g: 1, // 分类的层级
        };
    },
    created() {
        this.g = this.grade || 0;
        this.g += 1
    },
    methods: {
        // 设计师发布作品鼠标移入分类hover
        categoryEnter: function (e) {
            if ($(e.target).hasClass("current")) {
                return;
            }
            $(e.target).addClass("active");
        },
        // 设计师发布作品鼠标移入分类hover
        categoryLeave: function (e) {
            if ($(e.target).hasClass("current")) {
                return;
            }
            $(e.target).removeClass("active");
        },
        // 单击标签展开
        toggleCategoryNew: function (child, e) {
            if (!(child.childrenList && child.childrenList.length)) {
                this.$emit("chooseCate", child);
                return;
            }
            let $current = $(e.target);
            $current.toggleClass("show");
            $current.nextAll().toggle();
        },
        // 单击icon展开
        toggleCategory: function (e) {
            let $current = $(e.target).parent();
            $current.toggleClass("show");
            $current.nextAll().toggle();
        },
    },
};
</script>

<style lang="less" scoped>
.publish_category {
    position: relative;
    .arrow::after {
        content: "";
        position: absolute;
        top: 9px;
        right: 8px;
        width: 8px;
        height: 8px;
        border: 1px solid #7b7b7b;
        border-left-color: transparent !important;
        border-top-color: transparent !important;
        transform: rotate(45deg);
        transition: all 0.3s;
    }

    .arrow {
        position: absolute;
        top: 0;
        right: 0;
        width: 30px;
        height: 100%;
        transition: all 0.3s;
    }

    .show .arrow::after {
        top: 13px;
        transform: rotate(-135deg);
    }

    span {
        display: block;
        position: relative;
        line-height: 30px;
        cursor: pointer;
        &.current {
            background-color: #0d7bf7;
            color: #ffffff;
            .arrow::after {
                border-color: #ffffff;
            }
        }
    }
    
    .active {
        background-color: #0d7bf7;
        color: #ffffff;
    }
}
</style>