<template>
    <router-link tag="div" :to="{ name: 'templateTopicDetail', params: { id: item.id } }" class="topic-card" v-if="item">
        <img v-lazy="item.image" :alt="item.name" />
        <div class="card-exp">{{item.name}}</div>
    </router-link>
    <div :class="[cardClass, cardClass === 'skeleton' ? 'skeleton-loading' : '']" v-else></div>
</template>

<script>
export default {
    props: {
        item: Object,
        cardClass: String
    }
}
</script>

<style lang="less">
.topic-card {
    position: relative;
    min-width: 308px;
    cursor: pointer;
    overflow: hidden;
    &::before{
        content: "";
        display: block;
        padding-top: 56%;
    }
    img {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        border-radius: 3px;
        &:hover {
            transition: 0.3s;
            box-shadow: 0px 6px 16px 3px #d2d2d8;
        }
    }

    .card-exp {
        margin-top: 11px;
        font-size: 14px;
        color: #333333;
    }
}
</style>