<template>
    <div class="bytedance-icon">
        <component :is="componentType" :size="size" theme="outline" :fill="color"></component>
        <!-- <component :is="componentType" :size="size" theme="filled" :fill="color"></component> -->
    </div>
</template>

<script>
import { install } from '@icon-park/vue/lib/all';
import Vue from 'vue';
install(Vue);

export default {
    name: "BytedanceIcon",
    data() {
        return {
            componentType: '',
            size: '',
            color: ''
        }
    }
};
</script>

<style scoped>
.bytedance-icon {
    /* display: none; */
    position: fixed;
    bottom: 0;
    left: 0;
}
</style>
