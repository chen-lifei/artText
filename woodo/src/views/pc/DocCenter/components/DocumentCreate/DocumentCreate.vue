<template>
    <div class="document-create-modal">
        <div class="modal-backdrop"></div>
        <div class="modal-container" @click="closeDropdown">
            <div class="close" @click.stop="closeModal">
                <base-icon class="iconguanbi2" :size="12" color="#5F6063"></base-icon>
            </div>
            <div class="default-size" @click.stop>
                <div class="name">常用尺寸</div>
                <card-swiper :shadow="false" :show-more="false">
                    <template slot="cards">
                        <div class="size-item"
                            v-for="(item, index) in sizeList"
                            :key="index"
                            :class="[item.type, { 'select': item === currentSelect }]"
                            @click.stop="selectSize(item)">
                            <div class="size-wrapper">
                                <img src="~@/assets/pc/images/doc/size_bg.png" alt="">
                                <div
                                    class="inner"
                                    :style="{ height: item.heightFix ? '20px' : '28px',
                                        width: `${Math.ceil(item.width / item.height * (item.heightFix ? 20 : 28))}px`,
                                        marginTop: item.heightFix ? '19px' : '15px'}"></div>
                            </div>
                            <div class="size-name">{{ item.name }}</div>
                            <div class="size-info">{{ item.desc ? item.desc : `${item.width} * ${item.height}像素` }}</div>
                        </div>
                    </template>
                </card-swiper>
            </div>
            <div class="custom-size">
                <div class="name">自定义尺寸</div>
                <div class="custom-size-edit flex">
                    <!-- 宽度输入框 -->
                    <input
                        type="number"
                        placeholder="宽"
                        v-model="customData.width"
                        :class="{ 'error': customError('width') }"
                        @click.stop="selectSize('custom')">
                    <span class="sign">{{ customUnit === 'px' ? '×' : ':' }}</span>
                    <!-- 高度输入框 -->
                    <input
                        type="number"
                        placeholder="高"
                        v-model="customData.height"
                        :class="{ 'error': customError('height') }"
                        @click.stop="selectSize('custom')">
                    <!-- 单位选择框 -->
                    <div :class="['custom-unit', { 'show': showUnit }]" @click.stop="showCustomUnit">
                        <span>{{ customUnit === 'px' ?  '像素(px)' : '比例尺寸' }}</span>
                        <base-icon class="iconxialazhankaijiantou"></base-icon>
                        <ul class="custom-unit-list" v-if="showUnit">
                            <li @click="setCustomUnit('px')">像素(px)</li>
                            <li @click="setCustomUnit('ratio')">比例尺寸</li>
                        </ul>
                    </div>
                    <!-- 自定义值错误提示 -->
                    <p class="wrong-tip" v-if="customError('width') || customError('height')">{{ customUnit === 'px' ? '画布长宽的取值范围为 40px*40px 至 10000px*10000px' : '请输入正确的尺寸'}}</p>
                    <!-- 创作按钮 -->
                    <base-button
                        class="create-btn"
                        :class="{ primary: canCreate }"
                        :disabled="!canCreate"
                        width="120"
                        height="48"
                        @click.stop="createDoc">创建作品</base-button>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
    import CardSwiper from '@/components/CardSwiper.vue';

    export default {
        name: 'DocumentCreate',
        components: {
            CardSwiper
        },
        computed: {
            canCreate() {
                let status = false;
                if (this.currentSelect) {
                    if (this.currentSelect === 'custom') {
                        if (this.customData.width && this.customData.height && !this.customError('width') && !this.customError('height')) {
                            status = true;
                        }
                    } else {
                        status = true;
                    }
                }
                return status;
            },
            // 自定义尺寸值状态
            customError() {
                return (type) =>{
                    let isError = false;
                    // 为了用户交互体验,空值不进行校验
                    if (this.customData[type] === '') {
                        return false;
                    }
                    let value =  +this.customData[type];
                    switch (this.customUnit) {
                        case 'px':
                            const MIN_SIZE = 40;
                            const MAX_WIDTH = 10000;
                            const MAX_HEIGHT = 25000;
                            let maxSize = MAX_WIDTH;
                            if (type === 'height') maxSize = MAX_HEIGHT;
                            if (isNaN(value)) isError = true;
                            if (value < MIN_SIZE) isError = true;
                            if (value >  maxSize) isError = true;
                            break;
                        case 'ratio':
                            if (isNaN(value)) isError = true;
                            if (value <= 0) isError = true;
                            break;
                    }
                    return isError;
                }
            }
        },
        data() {
            return {
                sizeList: [
                    {
                        name: '16:9',
                        desc: '宽屏幻灯片',
                        width: 910,
                        height: 512,
                        type: 'slide'
                    }, {
                        name: '4:3',
                        desc: '标准幻灯片',
                        width: 910,
                        height: 683,
                        type: 'slide'
                    }, {
                        name: 'A4封面',
                        width: 1240,
                        height: 1754,
                        type: 'design'
                    }, {
                        name: '公众号配图',
                        width: 900,
                        height: 383,
                        type: 'design',
                        heightFix: true,
                    }, {
                        name: '手机海报',
                        width: 640,
                        height: 1008,
                        type: 'design'
                    }, {
                        name: '邀请函',
                        width: 720,
                        height: 1280,
                        type: 'design'
                    }, {
                        name: '画册',
                        width: 1191,
                        height: 731,
                        type: 'design'
                    }, {
                        name: '微信朋友圈',
                        width: 1280,
                        height: 1184,
                        type: 'design'
                    }, {
                        name: '宣传单',
                        width: 595,
                        height: 808,
                        type: 'design'
                    }, {
                        name: '主图直通车',
                        width: 800,
                        height: 800,
                        type: 'design'
                    }
                ],
                // 自定义相关
                customData: {
                    width: '',
                    height: ''
                },
                showUnit: false,
                customUnit: 'px',
                currentSelect: '',
                folderId: '',
                isTeam: false,
            }
        },
        mounted() {
            // 是否为团队文件夹
        },
        methods: {
            closeModal() {
                this.$emit('close');
            },
            setCustomUnit(value) {
                this.customUnit = value;
            },
            createDoc() {
                if (this.currentSelect === 'custom') {
                    if (this.customUnit === 'ratio') {
                        this.$router.push({path: '/edit/', query: {ratio: this.customData.width /  this.customData.height, fId: this.folderId}});
                    } else {
                        this.$router.push({path: '/edit/', query: {docWidth: this.customData.width, docHeight: this.customData.height, fId: this.folderId}});
                    }
                } else {
                    if (this.isTeam) {
                        this.$router.push({path: '/edit/', query: {docSizeIndex: this.sizeList.findIndex(item => item === this.currentSelect), teamfId: this.folderId}});
                    } else {
                        this.$router.push({path: '/edit/', query: {docSizeIndex: this.sizeList.findIndex(item => item === this.currentSelect), fId: this.folderId}});
                    }
                }
            },
            selectSize(item) {
                if (!item && this.currentSelect === 'custom') return;
                this.currentSelect = item;
            },
            showCustomUnit() {
                this.showUnit = !this.showUnit;
                this.selectSize('custom');
            },
            closeDropdown() {
                if (this.currentSelect) this.selectSize(false);
                if (this.showUnit) this.showUnit = false;
            }
        }
    }
</script>

<style lang="less" scoped>
.document-create-modal {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    z-index: 999;
    .modal-backdrop {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-color: rgba(36, 46, 76, .65);
        backdrop-filter: blur(5px);
    }
    .modal-container {
        position: relative;
        top: 50%;
        left: 50%;
        width: 920px;
        height: 480px;
        border-radius: 10px;
        padding: 30px;
        transform: translate(-50%, -50%);
        background-color: #FFFFFF;
        z-index: 1000;
        .close {
            position: absolute;
            top: 0;
            left: calc(100% + 10px);
            width: 24px;
            height: 24px;
            cursor: pointer;
            color: var(--textColor);
            text-align: center;
            border-radius: 50%;
            background-color: var(--backColor);
            .base-icon {
                position: absolute;
                left: 6px;
                top: 5px;
            }
        }
        .name {
            display: inline-block;
            color: var(--stressColor);
            font-size: 20px;
            font-weight: 600;
        }
        .default-size {
            width: 100%;
            .size-item {
                width: 160px;
                min-width: 160px;
                height: 160px;
                margin-right: 20px;
                border-radius: 5px;
                text-align: center;
                cursor: pointer;
                background-color: var(--backColor);
                border: 1px dashed var(--borderColor);
                .size-wrapper {
                    position: relative;
                    display: inline-block;
                    width: 68px;
                    height: 50px;
                    margin: 30px 0 20px 0;
                    text-align: center;
                    img {
                        position: absolute;
                        top: 0;
                        left: 0;
                    }
                    .inner {
                        display: inline-block;
                        background-color: #CDCFD2;
                    }
                }
                .size-name {
                    color: var(--stressColor);
                    font-weight: 600;
                }
                .size-info {
                    color: var(--dimColor);
                    margin-top: 2px;
                    font-size: 12px;
                }
                &:hover,
                &.select {
                    background-color: rgba(13, 123, 246, 0.1);
                    border: 1px solid var(--mainColor);
                    .size-name,
                    .size-info {
                        color: var(--mainColor);
                    }
                }
            }
            /deep/ .more-btn {
                height: 160px;
            }
        }
        .custom-size {
            .name {
                margin: 20px 0 14px 0;
            }
            .custom-size-edit {
                position: relative;
                justify-content: flex-start;
                input {
                    width: 126px;
                    height: 48px;
                    line-height: 48px;
                    border: 1px solid var(--borderColor);
                    border-radius: 10px;
                    color: var(--stressColor);
                    outline: none;
                    text-align: center;
                    background-color: var(--upperColor);
                    // 去除number控件
                    &::-webkit-outer-spin-button,
                    &::-webkit-inner-spin-button {
                        -webkit-appearance: none;
                        appearance: none;
                    }
                    -moz-appearance:textfield;
                    &:focus {
                        border-color: var(--mainColor);
                        &::-webkit-input-placeholder {
                            color:transparent;
                        }
                        &:-moz-placeholder {
                            color:transparent;
                        }
                        &::-moz-placeholder {
                            color:transparent;
                        }
                        &:-ms-input-placeholder {
                            color:transparent;
                        }
                    }
                    &.error {
                        border-color: var(--errorColor);
                    }
                    &::-webkit-input-placeholder {
                        font-size: 14px;
                        color:var(--dimColor);
                    }
                    &:-moz-placeholder {
                        font-size: 14px;
                        color:var(--dimColor);
                    }
                    &::-moz-placeholder {
                        font-size: 14px;
                        color:var(--dimColor);
                    }
                    &::-ms-input-placeholder {
                        font-size: 14px;
                        color:var(--dimColor);
                    }
                }
                .sign {
                    text-align: center;
                    width: 12px;
                    margin: 0 15px;
                    color: var(--stressColor);
                }
                .custom-unit {
                    position: relative;
                    width: 110px;
                    height: 48px;
                    line-height: 48px;
                    margin-left: 10px;
                    padding-left: 14px;
                    border-radius: 10px;
                    font-size: 12px;
                    cursor: pointer;
                    color: var(--stressColor);
                    border: 1px solid var(--borderColor);
                    span {
                        padding-right: 17px;
                    }
                    .custom-unit-list {
                        position: absolute;
                        top: calc(100% + 4px);
                        left: 0;
                        width: 100%;
                        color: var(--stressColor);
                        text-align: center;
                        border-radius: 5px;
                        overflow: hidden;
                        background-color: var(--backColor);
                        box-shadow: 0 0 2px 0 #d2d2d8;
                        li {
                            list-style: none;
                            height: 48px;
                            &:hover {
                                background-color: var(--upperColor);
                            }
                        }
                    }
                    &.show {
                        border-color: var(--mainColor);
                        .base-icon {
                            transform: rotate(180deg);
                        }
                    }
                }
                .create-btn {
                    position: absolute;
                    top: 0;
                    right: 0;
                    font-size: 12px;
                    border-radius: 24px;
                    &.disabled {
                        color: #FFFFFF;
                        background-color: #949496;
                    }
                }
                .wrong-tip {
                    position:absolute;
                    top: 100%;
                    left: 0;
                    font-size: 12px;
                    margin-top: 10px;
                    color: var(--errorColor);
                }
            }
        }
    }
}
</style>
<style lang='less'>
    body[data-theme="dark"] {
        .document-create-modal {
            .modal-container {
                background-color: #242529;
                .default-size .size-item {
                    background-color: #303135;
                    .size-wrapper .inner {
                        background-color: #5F6063;
                    }
                }
                .custom-size {
                    .custom-size-edit {
                        input {
                            background-color: #242529;
                        }
                        .custom-unit .custom-unit-list {
                            background-color: #242529;
                        }
                    }
                }
            }
        }
    }
</style>