<template>
    <div class="loading_animation_content">
        <div class="loading_animation_center">
            <img src="../assets/common/images/loading1.gif">
            <p>一个极其简单的办公设计工具</p>
        </div>
    </div>
</template>

<style lang="less" scoped>
    .loading_animation_content {
        display: flex;
        justify-content: center;
        align-items: center;
        position: fixed;
        top: 0;
        left: 0;
        z-index: 999999;
        width: 100%;
        height: 100%;
        background: #ffffff;
        user-select: none;
        .loading_animation_center {
            img {
                display: block;
                margin: 0 auto;
                width: 250px;
            }
            p {
                margin-top: 18px;
                font-size: 18px;
                color: #777777;
                text-align:center;
            }
        }
    }
</style>