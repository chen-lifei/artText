<template>
    <div class="workspace-view">
        <!-- 问候语 -->
        <div class="greeting-wrapper" v-show="userName">
            <canvas id="canvas" class="canvas"></canvas>
            <div class="greeting-info">
                <base-icon svg-id="icondazhaohu" :size="24"></base-icon>
                <span>Hi，<span class="name text-ellipsis">{{userName}}</span>，{{ greetingInfo }}</span>
            </div>
        </div>

        <!-- 模板列表 -->
        <div class="workspace-template-container">
            <div class="template-top flex">
                <div class="title">从模板创建</div>
                <!-- 模板筛选按钮 -->
                <div class="template-select flex">
                    <div class="template-select-item"
                        v-for="(item, index) in templateSelectList"
                        :key="index"
                        :class="{ 'select': item.value === categorySelect, 'color-select': item.value === 'color' }"
                        @click="openDropdown($event, item.value)">
                        <template v-if="item.value === 'color'">
                            <base-icon v-if="currentSelect[item.value]['value'] === 'all'" svg-id="iconyanse" class="icon-color" :size="16"></base-icon>
                            <span v-else class="color" :style="{ backgroundColor: currentSelect[item.value]['value'] }"></span>
                        </template>
                        <span>{{ currentSelect[item.value]['name'] }}</span>
                        <base-icon class="arrow iconxialazhankaijiantou" :size="12"></base-icon>
                        <ul class="template-dropdown">
                            <li
                                class="select-item"
                                v-for="(selectItem, selectIndex) in templateSelectList[index]['list']"
                                :key="selectIndex"
                                @click="selectCategory(item.value, selectItem)"
                                :class="{ 'active': (categorySelect !== 'color') && (selectItem.value === currentSelect[item.value]['value']), 'color-item': categorySelect === 'color' }">
                                <template v-if="categorySelect === 'color'">
                                    <base-icon v-if="selectItem.value === 'all'" svg-id="iconyanse" class="icon-color" :size="20"></base-icon>
                                    <span v-else class="color" :style="{ backgroundColor: selectItem.value }"></span>
                                </template>
                                {{ selectItem.name }}
                                <base-icon class="icon-select icondagou" v-if="(categorySelect === 'color') && (selectItem.value === currentSelect[item.value]['value'])"></base-icon>
                            </li>
                        </ul>
                    </div>
                </div>
                <div class="all" @click="toTemplate">查看全部</div>
            </div>
            <div class="workspace-template">
                <template v-if="templateLoading">
                    <div class="flex skeleton-wrapper">
                        <div class="skeleton-box" v-for="item in 4" :key="item">
                            <div class="skeleton-main skeleton-loading" ></div>
                            <div class="skeleton-name skeleton-loading"></div>
                        </div>
                    </div>
                </template>
                <template v-else-if="!templateList.length">
                    <div class="empty-wrapper flex">
                        <img src="~@/assets/pc/images/doc/empty.png" alt="">
                        <p>抱歉，没有找到你要的模板~</p>
                    </div>
                </template>
                <template v-else>
                    <card-swiper class="template-box" @toMore="toTemplate" @end="templateEnd">
                        <template #cards>
                        </template>
                    </card-swiper>
                </template>
            </div>
        </div>

        <!-- 快捷创建入口 -->
        <div class="workspace-entrance-container">
            <div class="title">快捷创建入口</div>
            <div class="entrance-wrapper flex">
                <div class="wrapper" v-for="(item, index) in createEntrance" :key="index" @click="clickEntrance(item.value)">
                    <div class="inner" :style="{ width: item.equal ? '88px': '' }">
                        <base-icon :class="item.icon" :size="30"></base-icon>
                    </div>
                    <div class="name">{{ item.name }}</div>
                </div>
            </div>
        </div>

        <!-- 最近的设计 -->
        <div class="workspace-latest-document">
            <div class="latest-document-top">
                <div class="title">最近的设计</div>
                <div class="document-number">您已创建「{{ docNumber }}/{{ allDocNumber }}」个文档</div>
                <div class="all" v-if="latestDocList.length">查看全部</div>
            </div>
            <div class="latest-document">
                <template v-if="projectLoading">
                    <div class="skeleton-box skeleton-loading" v-for="item in 5" :key="item"></div>
                </template>
                <template v-else-if="latestDocList.length === 0">
                    <div class="empty-wrapper">
                        <img src="~@/assets/common/images/empty.png" alt="">
                        <div class="desc">单击<span @click="createDocument()">“新建文档”</span>按钮，开始创建属于您的项目～</div>
                    </div>
                </template>
                <template v-else>
                    <div class="document-wrapper"></div>
                </template>
            </div>
        </div>
    </div>
</template>

<script>
    import CardSwiper from '@/components/CardSwiper.vue';
    import fileUpload from '@/views/pc/DocCenter/components/FileUpload/FileUpload.js';
    import documentCreate from '@/views/pc/DocCenter/components/DocumentCreate/DocumentCreate.js';

    export default {
        name: 'Workspace',
        metaInfo: {
            title: '吾道-工作台',
            meta: [
                {
                    property: 'og:title',
                    content: '吾道-工作台'
                },
                {
                    property: 'og:url',
                    content: 'https://www.woodo.cn/home/'
                }
            ]
        },
        components: {
            CardSwiper,
        },
        data() {
            return {
                templateList: [],
                templateLoading: false,
                projectLoading: false,
                latestDocList: [],
                docNumber: 0,
                allDocNumber: 3,
                templateSelectList: [
                    { value: 'category', list: [
                        { name: '全部', value: 'all' },
                        { name: '最新发布', value: 'new' },
                        { name: '免费模板', value: 'free' },
                        { name: '我用过的', value: 'used' },
                    ] },
                    { value: 'type', list: [
                        { name: '精选推荐', value: 'recommend' },
                        { name: '最新发布', value: 'new' },
                        { name: '免费模板', value: 'free' },
                        { name: '我用过的', value: 'used' },
                    ] },
                    { value: 'color', list: [
                        { name: '颜色', value: 'all' },
                        { name: '蓝色', value:  'blue' },
                        { name: '黄色', value:  'yellow' },
                        { name: '粉色', value:  'pink' },
                        { name: '紫色', value:  'purple' },
                    ] },
                ],
                categorySelect: '',
                currentSelect: {
                    category: { name: '全部', value: 'all' },
                    type: { name: '精选推荐', value: 'recommend' },
                    color: { name: '颜色', value: 'all' }
                },
                createEntrance: [
                    { name: '创建空白文档', icon: 'iconblank', value: 'blank' },
                    { name: '制作视频', icon: 'iconvideo1', value: 'video' },
                    { name: '本地导入文件', icon: 'iconupload', value: 'local'},
                    { name: '视频模板', icon: 'iconvideo', value: 'videoTemplate', equal: true },
                    { name: 'PPT模板', icon: 'iconppt', value: 'ppt', equal: true },
                    { name: '营销设计模板', icon: 'iconsheji1', value: 'design', equal: true },
                    { name: '简历模板', icon: 'iconresume', value: 'resume', equal: true },
                    { name: '自定义尺寸', icon: 'icontianjia', value: 'customize', equal: true },
                ],
                greetingInfo: '',
                userName: '',
                currentPanel: '',
            }
        },
        mounted () {
            this.getGreetingInfo();
            document.addEventListener('click', this.closeDropdown);
        },
        beforeDestroy() {
            document.removeEventListener('click', this.closeDropdown);
        },
        watch: {
            '$store.getters.pageTheme'(theme) {
                this.drawCanvas(theme);
            }
        },
        methods: {
            openDropdown(event, value) {
                if (event.target.classList.contains('select-item') || event.target.parentNode.classList.contains('select-item')) return;
                if (this.categorySelect === value) {
                    this.categorySelect = '';
                } else {
                    this.categorySelect = value;
                }
            },
            closeDropdown(event) {
                if (this.categorySelect) {
                    this.$nextTick(() => {
                        let dropdown = document.querySelector('.template-select-item.select');
                        if (!event || !dropdown.contains(event.target)) {
                            this.categorySelect = '';
                        }
                    });
                };
            },
            selectCategory(type, value) {
                this.currentSelect[type] = value;
                this.categorySelect = '';
            },
            toTemplate() {},
            templateEnd() {},
            getGreetingInfo() {
                this.userName = this.$common.get_login_state().name;
                let hour = new Date().getHours();
                if (hour > 7 && hour < 9) {
                    this.greetingInfo = '早上好';
                } else if (hour >= 9 && hour < 11) {
                    this.greetingInfo = '上午好';
                } else if (hour >= 11 && hour < 13) {
                    this.greetingInfo = '中午好';
                } else if( hour >= 13 && hour < 18) {
                    this.greetingInfo = '下午好';
                } else {
                    this.greetingInfo = '晚上好';
                }
                this.drawCanvas(this.$store.getters.pageTheme);
            },
            // 点击快捷创建入口的选项
            clickEntrance(value) {
                switch(value) {
                    case 'blank':
                        this.$router.push({ path: '/edit' });
                        break;
                    case 'video':
                        window.open('https://www.procut.cc/');
                        break;
                    case 'local':
                        fileUpload();
                        break;
                    case 'videoTemplate':
                        break;
                    case 'ppt':
                        break;
                    case 'design':
                        break;
                    case 'resume':
                        window.open('https://www.500d.me/');
                        break;
                    case 'customize':
                        this.createDocument();
                        break;
                }
            },
            createDocument() {
                documentCreate();
            },
            drawCanvas(theme) {
                let canvas = document.getElementById('canvas');
                let ctx = canvas.getContext('2d');
                canvas.width = 260;
                canvas.height = 40;
                ctx.beginPath();
                ctx.fillStyle = theme === 'light' ? '#FFFFFF' : '#303135';
                ctx.moveTo(0, 0);
                ctx.bezierCurveTo(25, 10, 10, 35, 50, 40);
                ctx.moveTo(50, 40);
                ctx.lineTo(210, 40);
                ctx.lineTo(260, 0);
                ctx.lineTo(0, 0);
                ctx.moveTo(210, 40);
                ctx.bezierCurveTo(240, 35, 225, 10, 260, 0);
                ctx.moveTo(260, 0);
                ctx.lineTo(0, 0);
                ctx.fill();
            }
        }
    }
</script>

<style lang="less" scoped>
.workspace-view {
    padding: 0 40px 0 60px;
    .title {
        display: inline-block;
        font-size: 20px;
        font-weight: 600;
        color: var(--stressColor);
    }
    .all {
        float: right;
        font-size: 12px;
        cursor: pointer;
        line-height: 36px;
        color: var(--dimColor);
        &:hover {
            color: var(--mainColor);
        }
    }
    .greeting-wrapper {
        position: fixed;
        top: 0;
        left: 273px;
        width: 260px;
        height: 40px;
        cursor: default;
        .greeting-info {
            position: absolute;
            top: 5px;
            left: 0;
            font-size: 14px;
            color: var(--stressColor);
            .base-icon {
                margin: 0 10px 0 30px;
            }
            .name {
                display: inline-block;
                vertical-align: sub;
                max-width: 70px;
            }
        }
    }
    .workspace-template-container {
        .template-top {
            position: relative;
            justify-content: flex-start;
            width: 100%;
            margin-bottom: 20px;
            .title {
                margin-right: 40px;
            }
            .template-select {
                .template-select-item {
                    position: relative;
                    width: 110px;
                    height: 36px;
                    border-radius: 5px;
                    margin-right: 10px;
                    font-size: 12px;
                    cursor: pointer;
                    padding-left: 14px;
                    color: var(--stressColor);
                    border: 1px solid var(--borderColor);
                    background-color: var(--upperColor);
                    span {
                        line-height: 36px;
                    }
                    .arrow {
                        position: absolute;
                        top: 12px;
                        right: 14px;
                    }
                    .template-dropdown {
                        display: none;
                        position: absolute;
                        top: calc(100% + 6px);
                        left: 0;
                        width: 140px;
                        border-radius: 5px;
                        overflow: hidden;
                        border: 1px solid var(--borderColor);
                        background-color: var(--upperColor);
                        .select-item {
                            height: 40px;
                            line-height: 40px;
                            list-style: none;
                            padding-left: 20px;
                            &:hover {
                                background-color: #FAFAFA;
                            }
                            &.active {
                                color: var(--mainColor);
                            }
                        }
                        .color-item {
                            display: flex;
                            align-items: center;
                            padding-left: 0;
                            .icon-color {
                                margin: 0 7px 0 20px;
                                border: 1px solid transparent;                                                                                          
                            }
                            .color {
                                display: inline-block;
                                width: 20px;
                                height: 20px;
                                vertical-align: middle;
                                border-radius: 50%;
                                margin: 0 7px 0 20px;
                                border: 1px solid #242529;
                            }
                            .icon-select {
                                position: absolute;
                                right: 14px;
                                color: var(--mainColor);
                            }
                        }
                    }
                    &.select,
                    &:hover {
                        border-color: var(--mainColor);
                        background-color: rgba(13, 123, 246, 0.1);
                    }
                    &.select {
                        .arrow {
                            transform: rotate(180deg);
                        }
                        .template-dropdown {
                            display: inline-block;
                        }
                    }
                    &.color-select {
                        display: flex;
                        align-items: center;
                        .icon-color {
                            margin-right: 6px;
                            border: 1px solid transparent;
                        }
                        .color {
                            display: inline-block;
                            width: 16px;
                            height: 16px;
                            vertical-align: middle;
                            border-radius: 50%;
                            margin-right: 6px;
                            border: 1px solid #242529;
                        }
                    }
                }
            }
            .all {
                position: absolute;
                right: 0;
            }
        }
        .skeleton-wrapper {
            width: 100%;
            overflow: hidden;
            .skeleton-box {
                width: 25%;
                margin-right: 14px;
                .skeleton-main {
                    height: 184px;
                    border-radius: 5px;
                }
                .skeleton-name {
                    margin-top: 10px;
                    height: 20px;
                    border-radius: 2px;
                }
            }
        }
        .empty-wrapper {
            flex-direction: column;
            align-items: center;
            width: 100%;
            height: 219px;
            border-radius: 5px;
            color: var(--dimColor);
            border: 1px dashed var(--borderColor);
            background-color: #EDEFF5;
            img {
                width: 150px;
                height: 100px;
            }
            p {
                font-size: 12px;
            }
        }
    }
    .workspace-entrance-container {
        margin: 50px 0 50px 0;
        .title {
            margin-bottom: 20px;
        }
        .entrance-wrapper {
            width: 100%;
            justify-content: flex-start;
            .wrapper {
                text-align: center;
                cursor: pointer;
                margin-right: 30px;
                .inner {
                    position: relative;
                    width: 140px;
                    height: 88px;
                    border-radius: 5px;
                    border: 1px solid transparent;
                    background-color: #FFFFFF;
                    .base-icon {
                        color: var(--textColor);
                        line-height: 88px;
                    }
                }
                .name {
                    color: var(--dimColor);
                    padding-top: 10px;
                    font-size: 12px;
                }
                &:hover {
                    .inner {
                        border-color: var(--mainColor);
                        background-color: rgba(13, 123, 246, 0.1) !important;
                    }
                    .base-icon,
                    .name {
                        color: var(--mainColor);
                    }
                }
            }
        }
    }
    .workspace-latest-document {
        .latest-document-top {
            line-height: 24px;
            margin-bottom: 20px;
            .document-number {
                display: inline-block;
                font-size: 12px;
                margin-left: 10px;
                color: var(--dimColor);
            }
        }
        .latest-document {
            width: 100%;
            .empty-wrapper {
                width: 100%;
                height: 240px;
                text-align: center;
                border-radius: 5px;
                color: var(--dimColor);
                border: 1px dashed var(--borderColor);
                background-color: #EDEFF5;
                img {
                    width: 146px;
                    height: 120px;
                    object-fit: cover;
                    margin: 50px 0 10px 0;
                }
                .desc {
                    font-size: 12px;
                }
                span {
                    cursor: pointer;
                    color: var(--mainColor);
                }
            }
            .skeleton-box {
                display: inline-block;
                margin: 0 20px 20px 0;
                border-radius: 5px;
                width: 270px;
                height: 240px;
            }
            .document-wrapper {
                box-sizing: border-box;
                width: 100%;
                padding: 40px;
                border-radius: 5px;
                background-color: var(--upperColor);
            }
        }
    }
}
@media screen and (max-width: 1400px) {
    .workspace-view {
        .workspace-entrance-container {
            .entrance-wrapper {
                justify-content: space-between;
                .wrapper {
                    margin-right: 0;
                }
            }
        }
    }
}
</style>
<style lang="less">
body[data-theme="dark"] {
    .workspace-view {
        .workspace-template-container {
            .template-dropdown .select-item:hover {
                background-color: #292A2E !important;
            }
        }
        .workspace-entrance-container {
            .inner {
                background-color: #303135 !important;
            }
        }
        .empty-wrapper {
            background-color: #303135 !important;
        }
    }
}
</style>