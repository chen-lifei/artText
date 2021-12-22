<template>
    <transition name="modal-fade">
        <div class="create-doc-panel" v-if="isShow" @click="custom_unit_show = false">
            <div class="panel-wrap">
                <base-icon class="panel-close" size="16" @click="close">×</base-icon>
                <div class="panel-head">
                    <base-button :class="{current: current_type === 'size'}" height="40" @click="current_type = 'size'">创建作品尺寸</base-button>
                    <base-button :type="isLogin ? 'file' : 'button'" accept="application" :class="{current: current_type === 'import'}" height="40" @mousedown="importInterceptor($event)" @change="importFile">导入文件</base-button>
                </div>
                <div class="panel-contain">
                    <!-- 创建尺寸 -->
                    <template v-if="current_type === 'size'">
                        <div class="default-size">
                            <h1>常用尺寸:</h1>
                            <!-- 预设尺寸列表 -->
                            <ul ref="scroll" @scroll="custom_unit_show = false">
                                <!-- 预设尺寸列表 -->
                                <li class="flex flex-between" v-for="item in size_default_list" :key="item.name" @click="setSize(item)" :class="{check: size_current_check === item}">
                                    <span>{{ item.name }}</span>
                                    <base-icon class="icondagou"></base-icon>
                                </li>
                                <!-- 自定义编辑模块 -->
                                <li class="custom flex flex-between" @click="setSize('custom')" :class="{check: size_current_check === 'custom'}">
                                    <span>自定义</span>
                                    <base-icon class="icondagou"></base-icon>
                                    <div class="custom-size-edit flex" v-if="size_current_check === 'custom'" @click.stop>
                                        <!-- 宽度输入框 -->
                                        <input type="number" placeholder="宽" ref="customWidth" v-model="custom_data.width" :class="{'error': custom_error('width')}" @foucs="customFocus" @input="customFocus">
                                        <i>{{ custom_unit === 'px' ? '×' : ':' }}</i>
                                        <!-- 高度输入框 -->
                                        <input type="number" placeholder="高" ref="customHeight" v-model="custom_data.height" :class="{'error': custom_error('height')}" @focus="customFocus" @input="customFocus">
                                        <!-- 单位选择框 -->
                                        <base-button :class="['custom-unit', {'show': custom_unit_show}]" width="200" height="48" @click.stop="custom_unit_show = !custom_unit_show">{{ custom_unit === 'px' ?  'PX（像素）' : '比例尺寸'}}</base-button>
                                        <!-- 自定义值错误提示 -->
                                        <p class="wrong-tip" v-if="custom_error('width') || custom_error('height')">{{ custom_unit === 'px' ? '画布长宽的取值范围为 40px*40px 至 10000px*10000px' : '请输入正确的尺寸'}}</p>
                                    </div>
                                </li>
                                <!-- 为了不撑开列表的滚动条，故放在列表外层 -->
                                <ul class="custom-unit-list" v-if="custom_unit_show">
                                    <li @click.stop="setCustomUnit('px')">PX（像素）</li>
                                    <li @click.stop="setCustomUnit('ratio')">比例尺寸</li>
                                </ul>
                            </ul>
                        </div>
                        <!-- 创作按钮 -->
                        <base-button class="create-btn" :class="{primary: can_create}" :disabled="!can_create" width="120" height="48" @click="createDoc">开始创作</base-button>
                        <div class="size-panel">
                        </div>
                    </template>
                    <!-- 导入 -->
                    <template v-else>
                        <base-button :type="isLogin ? 'file' : 'button'" accept="application" :class="['import-btn', {current: current_type === 'import'}]" height="88" @mousedown="importInterceptor($event)" @change="importFile"><base-icon class="icontianjia1" size="18"></base-icon>上传我的文件</base-button>
                        <p class="import-tip">仅支持PPTX、PDF两种格式</p>
                    </template>
                </div>
            </div>
        </div>
    </transition>
</template>

<script>
    /**
     *  文档中心 - 新建文档
     */
    export default{
        name: "DocCreate",
        props: {
            show: {
                type: Boolean,
                default: false
            }
        },
        data(){
            return{
                isShow: false,
                isLogin: true,
                current_type: 'size',
                folder_id: '',

                // 文档尺寸相关
                size_default_list: [
                    {
                        name: '宽屏幻灯片 16:9',
                        width: 910,
                        height: 512,
                        type: 'slide'
                    }, {
                        name: '标准幻灯片 4:3',
                        width: 910,
                        height: 683,
                        type: 'slide'
                    }, {
                        name: 'A4封面 1240 x 1754 像素',
                        width: 1240,
                        height: 1754,
                        type: 'design'
                    }, {
                        name: '公众号配图 900 x 383 像素',
                        width: 900,
                        height: 383,
                        type: 'design'
                    }, {
                        name: '手机海报 640 x 1008 像素',
                        width: 640,
                        height: 1008,
                        type: 'design'
                    }, {
                        name: '邀请函 720 x 1280 像素',
                        width: 720,
                        height: 1280,
                        type: 'design'
                    }, {
                        name: '画册 1191 x 731 像素',
                        width: 1191,
                        height: 731,
                        type: 'design'
                    }, {
                        name: '微信朋友圈 1280 x 1184 像素',
                        width: 1280,
                        height: 1184,
                        type: 'design'
                    }, {
                        name: '宣传单 595 x 808 像素',
                        width: 595,
                        height: 808,
                        type: 'design'
                    }, {
                        name: '主图直通车 800 x 800 像素',
                        width: 800,
                        height: 800,
                        type: 'design'
                    }
                ],
                size_current_check: '',
                // 自定义相关
                custom_data: {
                    width: '',
                    height: ''
                },
                custom_unit: 'px',
                custom_unit_show: false,
            }
		},
        watch: {
            show(val) {
                this.isShow = val;
            }
        },
        mounted () {
            this.isShow = this.show;
            this.isLogin = this.$common.get_login_state().login;
            this.size_current_check = this.size_default_list[0];
            window.addEventListener('scroll', () => {
                this.custom_unit_show = false;
            });
            
        },
        computed: {
            // 可创建标识
            can_create() {
                let status = false;
                if (this.size_current_check) {
                    if (this.size_current_check === 'custom') {
                        if (this.custom_data.width && this.custom_data.height && !this.custom_error('width') && !this.custom_error('height')) {
                            status = true
                        }
                    } else {
                        status = true;
                    }
                }
                return status;
            },
            // 自定义尺寸值状态
            custom_error() {
                return (type) =>{
                    let is_error = false;
                    // 为了用户交互体验,空值不进行校验
                    if (this.custom_data[type] === '') {
                        return false;
                    }
                    let value =  +this.custom_data[type];
                    switch (this.custom_unit) {
                        case 'px':
                            const MIN_SIZE = 40;
                            const MAX_WIDTH = 10000;
                            const MAX_HEIGHT = 25000;
                            let max_size = MAX_WIDTH;
                            if (type === 'height') max_size = MAX_HEIGHT;
                            if (isNaN(value)) is_error = true;
                            if (value < MIN_SIZE) is_error = true;
                            if (value >  max_size) is_error = true;
                            break;
                        case 'ratio':
                            if (isNaN(value)) is_error = true;
                            if (value <= 0) is_error = true;
                            break;
                    }
                    return is_error;
                }
            }
        },
        methods:{
            open() {
                this.isShow = true;
                let Parent = this.$parent;
                let currentPanel = Parent.current_panel;
                if (currentPanel === 'production' || currentPanel === 'team') {
                    let mainDom = Parent[currentPanel].$refs.DocListMain;
                    this.folder_id = mainDom && mainDom.current_folder_info ? mainDom.current_folder_info.id : '';
                }
            },
            close() {
                this.isShow = false;
                this.folder_id = '';
                this.$emit('close');
            },
            changePanel(type) {
                this.current_type = type;
            },
            setSize(item) {
                this.size_current_check = item;
                if (item === 'custom') {
                    this.$nextTick(() => {
                        this.$refs.customWidth.focus();
                    })
                }
            },
            customFocus() {
                this.$refs['scroll'].scroll({top: this.$refs['scroll'].clientHeight});
            },
            // 设置单位
            setCustomUnit(type) {
                this.custom_unit = type;
                this.custom_unit_show = false;
            },
            // 导入拦截器
            importInterceptor(e) {
                this.current_type = 'import';
                this.isLogin = this.$common.get_login_state().login;
                if (!this.isLogin) {
                    if (this.$parent.$refs.navHead) {
                        this.$parent.$refs.navHead.toLogin('account');
                    } else if (this.$parent.$refs.commonHead) {
                        this.$parent.$refs.commonHead.toLogin('account');
                    } else {
                        let redirect_url = encodeURI(window.location.pathname + window.location.search);
                        window.location.href = '/login/?redirectUrl=' + redirect_url;
                    }
                }
            },
            // 导入文件
            importFile(event) {
                let that = this;
                that.$import({
                    file: event.target.files[0],
                    success: data => {
                        that.$toast('导入成功', 1000);
                        setTimeout(() => {
                            that.$router.push(`/edit?docId=${data.docId}&fId=${that.folder_id}`);
                        }, 1000);
                    },
                })
                
            },
            // 创建文档
            createDoc() {
                if (this.size_current_check === 'custom') {
                    if (this.custom_unit === 'ratio') {
                        this.$router.push({path: '/edit/', query: {ratio: this.custom_data.width /  this.custom_data.height, fId: this.folder_id}});
                    } else {
                        this.$router.push({path: '/edit/', query: {docWidth: this.custom_data.width, docHeight: this.custom_data.height, fId: this.folder_id}});
                    }
                } else {
                    if (this.$parent.current_panel === `team`) {
                        this.$router.push({path: '/edit/', query: {docSizeIndex: this.size_default_list.findIndex(item => item === this.size_current_check), teamfId: this.folder_id}});
                    } else {
                        this.$router.push({path: '/edit/', query: {docSizeIndex: this.size_default_list.findIndex(item => item === this.size_current_check), fId: this.folder_id}});
                    }
                }
            },
        }
    }
</script>

<style lang="less" scoped>
    .create-doc-panel{
        position: fixed;
        top: 0;
        right: 0;
        z-index: 9;
        background: #f6f6f9;
    }
    .panel-wrap{
        padding-left: 35px;
    }
    .panel-close{
        position: absolute;
        right: 20px;
        top: 20px;
        width: 32px;;
        height: 32px;
        line-height: 32px;
        border-radius: 50%;
        background: #d2d2d8;
        text-align: center;
        color: #000000;
        cursor: pointer;
        transition: all .2s;
        &:hover{
            background: var(--mainColor);
            color: #ffffff;
        }
    }
    .panel-head{
        height: 120px;
        line-height: 120px;
        .base-button{
            margin-right: 10px;
            background-color: #ffffff;
            font-size: 14px;
            &.current{
                background-color: rgba(0,95,255,0.10);
                color: var(--mainColor);
            }
        }
    }
    .panel-contain{
        position: relative;
        width: 100%;
        height: calc(100vh - 120px);
        padding-right: 35px;
        overflow: hidden;
        text-align: center;
        color: #2b2a35;
        h1{
            margin-bottom: 10px;
            text-align: left;
            font-size: 14px;
        }
        .default-size{
            height: 100%;
            & > ul{
                width: calc(100% + 35px);
                height: calc(100% - 200px);
                padding-right: 35px;
                overflow: auto;
                & > li{
                    flex-wrap: wrap;
                    align-content: center;
                    height: 84px;
                    padding-right: 20px;
                    border-bottom: 1px solid #e5e5e5; 
                    font-size: 14px;
                    cursor: pointer;
                    .base-icon{
                        width: 24px;
                        height: 24px;
                        line-height: 24px;
                        border-radius: 50%;
                        border: 1px solid #cccccc;
                        background: transparent;
                        color: transparent;
                        text-align: center;
                    }
                    &:first-child{
                        border-top: 1px solid #e5e5e5;
                    }
                    &:hover:not(.custom.check){
                        background-color: #edeff3;
                    }
                    &.check{
                        & > span{
                            color: var(--mainColor);
                        }
                        .base-icon{
                            background-color: var(--mainColor);
                            border-color: transparent;
                            color: #ffffff;
                        }
                        &.custom{
                            height: 174px;
                            cursor: default;
                        }
                    }
                }
            }
            // 自定义编辑模块
            .custom-size-edit{
                position: relative;
                justify-content: flex-start;
                width: 100%;
                margin-top: 30px;
                input{
                    width: 128px;
                    height: 48px;
                    line-height: 48px;
                    text-align: center;
                    border: 4px solid transparent;
                    border-radius: 10px;
                    background-color: #ffffff;
                    font-size: 18px;
                    color: #2B2A35;
                    -moz-appearance: textfield;    // 火狐去除number控件
                    &:focus{
                        border-color: rgba(0,95,255,0.50);
                        &::-webkit-input-placeholder{
                            color:transparent;
                        }
                        &:-moz-placeholder{
                            color:transparent;
                        }
                        &::-moz-placeholder{
                            color:transparent;
                        }
                        &:-ms-input-placeholder{
                            color:transparent;
                        }
                    }
                    &.error{
                        border-color: var(--errorColor);
                    }
                    &::-webkit-input-placeholder{
                        font-size: 14px;
                        color:#bbbbbb;
                    }
                    &:-moz-placeholder{
                        font-size: 14px;
                        color:#bbbbbb;
                    }
                    &::-moz-placeholder{
                        font-size: 14px;
                        color:#bbbbbb;
                    }
                    &:-ms-input-placeholder{
                        font-size: 14px;
                        color:#bbbbbb;
                    }
                }
                i{
                    width: 15px;
                    color: #767684;
                    font-size: 20px;
                    margin: 0 14px;
                }
                .custom-unit{
                    margin-left: 20px;
                    padding-left: 20px !important;
                    text-align: left;
                    &::after{
                        content: "";
                        float: right;
                        width: 7px;
                        height: 7px;
                        margin-right: 24px;
                        border-top: 2px solid #767684;
                        border-left: 2px solid #767684;
                        transform: rotate(-135deg);
                        transition: all .3s;
                    }
                    &.show::after{
                        transform: translateY(4px) rotate(45deg);
                    }
                }
                .wrong-tip{
                    position:absolute;
                    bottom: -24px;
                    margin-top: 10px;
                    color: var(--errorColor);
                    font-size: 12px;
                }
            }
            // 自定义单位下拉框
            .custom-unit-list{
                position: absolute;
                bottom: 105px;
                left: 320px;
                width: 200px;
                height: auto;
                padding: 10px 0;
                border-radius: 6px;
                background-color: #fff;
                box-shadow: 0px 0px 2px 0px #d2d2d8;
                li{
                    width: 100%;
                    height: 40px;
                    line-height: 40px;
                    text-align: center;
                    font-size: 14px;
                    color: #2B2A35;
                    cursor: pointer;
                    transition: background .2s;
                    &:hover{
                        background-color: #edeff3;
                    }
                }
                
            }
        }
        .create-btn{
            position: absolute;
            bottom: 100px;
            left: 0;
        }
        .import-btn{
            width: 100%;
            background: transparent;
            border: 1px dashed #aaaaaa;
            border-radius: 11px;
            color: #333333;
            font-size: 16px;
            transition: background .1s;
            &:hover{
                background: #edeff3;
            }
            .base-icon{
                margin-right: 8px;
                transform: translateY(1px);
            }
        }
        .import-tip{
            margin: 20px;
            font-size: 14px;
            color: #767684;
        }
    }
</style>