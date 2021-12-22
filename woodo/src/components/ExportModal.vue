<template>
<transition name="modal-fade">
    <div class="modal-backdrop no-inherit" v-if="isshow" @click.stop="modal_event">
        <div class="modal export_container" :class="{'exporting_container':exporting}">
            <div class="modal-header">
                <span class="modal-title"><span>导出</span></span>
                <button class="modal-close" @click="close_modal">
                    <base-icon class="iconchacha"></base-icon>
                </button>
            </div>
            <div class="modal-body">
                <div class="tab_bar">
                    <div class="tab_con" @mouseenter="tabMouseenter(item)" @mouseleave="tabMouseleave(item)" v-for="(item, index) in export_data" :key="index" :class="{'checked': item.type === checked.type}" @click="select_tabbar(item)">
                        <img class="icon" :src="(item.type === checked.type) ? item.white_icon : item.black_icon"/>
                        <h3 class="name">{{ item.name }}</h3>
                        <p class="remarks">{{ item.remark }}</p>
                    </div>
                </div>
                <div class="tab_main">
                    <div class="export_main" v-if="get_export_config" :class="get_export_config.type">
                        <!-- 导出类型选择 -->
                        <div class="modes" v-if="get_export_config.mode">
                            <div class="mode" v-for="(item, index) in get_export_config.mode" :key="index" :class="{'checked': item.type === checked.mode}" @click="select_mode(item)">
                                <img class="cover" :src="item.image" alt="" />
                                <h3 class="name">{{ item.name }}</h3>
                                <p class="remarks">{{ item.remark }}</p>
                            </div>
                        </div>
                        <!-- 导出页码选择 -->
                        <div class="options" v-if="get_export_config.setpage && export_page_list.length">
                            <h3 class="title">导出范围</h3>
                            <div class="select">
                                <div class="selected" @click.stop="select_toggle" :title="selected_export_page">{{ selected_export_page || '请选择' }}</div>
                                <ul class="option">
                                    <li class="check" :class="{'checked': checked.page.length === export_page_list.length}" @click.stop="select_page_number(export_page_list)">所有页面（{{ export_page_list.length }}页）</li>
                                    <li class="check" v-for="item in export_page_list" :key="item" :class="{'checked': checked.page.indexOf(item) > -1}" @click.stop="select_page_number(item)">第 {{ item }} 页</li>
                                </ul>
                            </div>
                        </div>
                        <!-- 文件类  ->  pdf设置 -->
                        <div class="radios" v-if="checked.mode.toUpperCase() === 'PDF' && get_export_config.pdf">
                            <h3 class="title">导出设置</h3>
                            <div class="radio" v-for="(item, index) in get_export_config.pdf" :key="index" :class="{'checked': item.type === checked.pdf}" @click="select_pdf_conf(item)">
                                <span>{{ item.name }}</span>
                                <span class="remarks">{{ item.remark }}</span>
                            </div>
                        </div>
                        <!-- 图片类  ->  格式 | 质量 -->
                        <div class="options_inlineblock" v-if="checked.type === 'image'">
                            <div class="options" v-if="get_export_config.format">
                                <h3 class="title">导出格式</h3>
                                <div class="select">
                                    <div class="selected" @click.stop="select_toggle">{{ selected_export_format || '请选择' }}</div>
                                    <ul class="option">
                                        <li v-for="(item, index) in get_export_config.format" :key="index" :class="{'checked': item.value === checked.format}" @click="select_format(item)">{{ item.name }}</li>
                                    </ul>
                                </div>
                            </div>
                            <div class="options" v-if="get_export_config.quality">
                                <h3 class="title">导出质量</h3>
                                <div class="select">
                                    <div class="selected" @click.stop="select_toggle">{{ selected_export_quality || '请选择' }}</div>
                                    <ul class="option">
                                        <li v-for="(item, index) in get_export_config.quality" :key="index" :class="{'checked': item.value === checked.quality}" @click="select_quality(item)">{{ item.name }}</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                        <!-- 视频类  ->  格式 -->
                        <div class="options" v-if="checked.mode === 'video' && get_export_config.format">
                            <h3 class="title">导出格式</h3>
                            <div class="select">
                                <div class="selected" @click.stop="select_toggle">{{ selected_export_format || '请选择' }}</div>
                                <ul class="option">
                                    <li v-for="(item, index) in get_export_config.format" :key="index" :class="{'checked': item.value === checked.format}" @click="select_format(item)">{{ item.name }}</li>
                                </ul>
                            </div>
                        </div>
                        <!-- H5类  ->  背景音乐 -->
                        <div class="options" v-if="checked.type === 'h5' && get_export_config.format">
                            <h3 class="title">导出格式</h3>
                            <div class="select">
                                <div class="selected" @click.stop="select_toggle">{{ selected_export_format || '请选择' }}</div>
                                <ul class="option">
                                    <li v-for="(item, index) in get_export_config.format" :key="index" :class="{'checked': item.value === checked.format}" @click="select_format(item)">{{ item.name }}</li>
                                </ul>
                            </div>
                        </div>
                        <!-- 开始导出 -->
                        <div class="buttons">
                            <div class="export_btn disable" v-if="checked.type === 'video'">待上线...</div>
                            <div class="export_btn" v-else-if="checked.type === 'h5'" @click="open_preview_h5">立即生成</div>
                            <div class="export_btn" v-else @click="start_export(checked)">开始导出</div>
                        </div>
                    </div>
                </div>

                <!-- 导出中动画 -->
                <transition name="modal-fade">
                    <div class="exporting" v-show="exporting">
                        <h2 class="title">正在导出你的文档</h2>
                        <div class="loading"></div>
                        <p class="remarks">正在导出...</p>
                    </div>
                </transition>
            </div>
        </div>
    </div>
</transition>
</template>

<script>
import qs from 'qs';
import page_opt from '@/assets/pc/js/opt/page_opt.js';

export default {
    name: 'ExportModal',
    props: ['document_id'],
    data() {
        return {
            isshow: false,
            exporting: false,
            // 文档信息
            document_info: {},
            document_page_list: [],
            // 导出页码
            export_page_list: [],
            // 类型数据
            export_data: [{
                type: 'file',
                name: '文件',
                remark: '支持PPTX和PDF格式',
                white_icon: require('../assets/pc/images/export/file_white.png'),
                black_icon: require('../assets/pc/images/export/file_black.png'),
                isHover: false,
                setpage: true,
                mode: [{
                    type: 'ppt',
                    image: require('../assets/pc/images/export/ppt_cover.png'),
                    name: 'PPTX格式',
                    remark: '支持Powerpoint或WPS编辑',
                }, {
                    type: 'pdf',
                    image: require('../assets/pc/images/export/pdf_cover.png'),
                    name: 'PDF格式',
                    remark: '安全方便易于阅览和打印',
                }],
                pdf: [{
                    type: 'editable',
                    name: '普通PDF',
                    remark: '',
                }, {
                    type: 'notEditable',
                    name: '纯图PDF',
                    remark: '文本内容不可编辑和复制',
                }],
            }, {
                type: 'image',
                name: '图片',
                remark: '支持单图片和长图导出',
                white_icon: require('../assets/pc/images/export/picture_white.png'),
                black_icon: require('../assets/pc/images/export/picture_black.png'),
                isHover: false,
                setpage: true,
                mode: [{
                    type: 'apart',
                    image: require('../assets/pc/images/export/imgs_cover.png'),
                    name: '逐页样式',
                    remark: '导出多张单图',
                }, {
                    type: 'longImage',
                    image: require('../assets/pc/images/export/longimg_cover.png'),
                    name: '长图样式',
                    remark: '导出拼接的长图',
                }],
                format: [{
                    name: 'JPG',
                    value: 'jpeg',
                }, {
                    name: 'PNG',
                    value: 'png',
                }],
                quality: [{
                    name: '普通（100%）',
                    value: 1,
                }, {
                    name: '标清（200%）',
                    value: 2,
                }, {
                    name: '高清（300%）',
                    value: 3,
                }, {
                    name: '超清（400%）',
                    value: 4,
                }],
            }, {
                type: 'video',
                name: '视频',
                remark: '支持视频和GIF格式',
                white_icon: require('../assets/pc/images/export/video_white.png'),
                black_icon: require('../assets/pc/images/export/video_black.png'),
                isHover: false,
                setpage: true,
                mode: [{
                    type: 'video',
                    image: require('../assets/pc/images/export/video_cover.png'),
                    name: '视频格式',
                    remark: '可支持MP4/AVI格式导出',
                }, {
                    type: 'gif',
                    image: require('../assets/pc/images/export/gif_cover.png'),
                    name: 'GIF格式',
                    remark: '动画图像可在社交媒体上分享',
                }],
                format: [{
                    name: 'MP4',
                    value: 'MP4',
                }, {
                    name: 'AVI',
                    value: 'AVI',
                }],
            }, {
                type: 'h5',
                name: 'H5页面',
                remark: '自动生成动画，适合手机分享',
                white_icon: require('../assets/pc/images/export/h5_white.png'),
                black_icon: require('../assets/pc/images/export/h5_black.png'),
                isHover: false,
                setpage: false,
                mode: [{
                    type: 'h5',
                    image: require('../assets/pc/images/export/h5_cover.png'),
                    name: 'HTML5',
                    remark: '快速转换H5，真实还原PPT动画',
                }],
                format: [{
                    name: '自动播放',
                    value: 'auto',
                }, {
                    name: '手动播放',
                    value: 'manual',
                }],
            }],

            // 选中的数据（包含所有需要的数据）
            checked: {
                type: '',
                mode: '',
                format: '',
                quality: '',
                pdf: '',
                page: [],
            },
        };
    },
    computed: {
        // 当前选中的设置
        get_export_config() {
            return this.export_data.find(item => item.type === this.checked.type);
        },
        // 选中的列表名称
        selected_export_page() {
            let text;
            if (this.checked.page.length) {
                if (this.checked.page.length === this.export_page_list.length) {
                    text = `所有页面（${this.checked.page.length}页）`;
                } else {
                    text = `第 ${this.checked.page.join('，')} 页`;
                }
            }
            return text;
        },
        // 选中的格式
        selected_export_format() {
            let text;
            let data = this.export_data.find(item => item.type === this.checked.type);
            if (data && data.format) {
                data = data.format.find(item => item.value === this.checked.format);
                if (data) {
                    text = data.name;
                }
            }
            return text;
        },
        // 选中的导出质量
        selected_export_quality() {
            let text;
            let data = this.export_data.find(item => item.type === this.checked.type);
            if (data && data.quality) {
                data = data.quality.find(item => item.value === this.checked.quality);
                if (data) {
                    text = data.name;
                }
            }
            return text;
        },
    },
    methods: {
        /**
         * 弹窗 初始化类
         */
        get_document_detail(success) {
            let that = this;
            that.$axios.get(`/api/member/document/detail/${that.document_id}/`).then(res => {
                let res_data = res.data;
                if (res_data.type === 'success') {
                    res_data = res_data.data;
                    that.document_info = that.$common.document_dataparse(res_data.document);
                    that.document_page_list = that.$common.document_pages_dataparse(res_data.documentPages);
                    if (typeof success === 'function') success();
                } else {
                    that.$toast('获取文档信息失败~');
                    that.close_modal();
                }
            }).catch(err => {
                that.$toast('获取文档信息失败~');
                that.close_modal();
            });
        },
        show_modal() {
            this.isshow = true;
            this.get_document_detail(() => {
                this.update_page_list();
                this.default_config();
            });
        },
        close_modal(type) {
            this.isshow = false;
            this.exporting = false;
            this.init_config();
            if (type !== 'success') this.$export.cancel();
        },
        // 更新页码
        update_page_list() {
            this.export_page_list = this.document_page_list.map((item, index) => index + 1) || [];
        },
        // 初始化设置
        init_config() {
            this.checked = {
                type: '',
                mode: '',
                format: '',
                quality: '',
                pdf: '',
                page: [],
            };
        },
        // 默认设置
        default_config() {
            let type = this.checked.type || 'file';
            let data = this.export_data.find(item => item.type === type);
            if (data) {
                this.checked = {
                    type: type,
                    mode: data.mode ? data.mode[0].type : '',
                    format: data.format ? data.format[0].value : '',
                    quality: data.quality ? data.quality[0].value : '',
                    pdf: data.pdf ? data.pdf[0].type : '',
                    page: utils.deepClone(this.export_page_list),
                };
                // h5类 format设置获取
                if (this.checked.type === 'h5') {
                    let is_autoplay = this.document_info.attr && this.document_info.attr.backgroundMusic && this.document_info.attr.backgroundMusic.autoplay;
                    let index = is_autoplay ? 0 : 1;
                    this.checked.format = data.format[index].value;
                }
            }
        },
        tabMouseenter(item){
            item.isHover = true;
        },
        tabMouseleave(item){
            item.isHover = false;
        },

        /**
         * 操作事件类
         */
        modal_event() {
            this.init_select();
        },
        // 下拉框效果
        init_select() {
            $('.export_container .select').removeClass('open');
        },
        select_toggle(event) {
            let $select = $(event.target).parents('.select');
            if (!$select.hasClass('open')) {
                this.init_select();
            }
            $select.toggleClass('open').removeClass('error');
        },

        /**
         * 设置配置类
         */
        // tabbar 选择 （文件、图片、视频、h5） 导出
        select_tabbar(item) {
            this.checked.type = item.type;
            this.default_config();
        },
        // 选择模式
        select_mode(item) {
            this.checked.mode = item.type;
        },
        // pdf导出设置
        select_pdf_conf(item) {
            this.checked.pdf = item.type;
        },
        // 导出页码选择
        select_page_number(data) {
            if (!Array.isArray(this.checked.page)) {
                return;
            }
            // 选中/取消一组
            if (Array.isArray(data)) {
                if (this.checked.page.length === data.length) {
                    this.checked.page = [];
                } else {
                    this.checked.page = utils.deepClone(data);
                }
                return;
            }
            // 选中/取消单个
            if (!isNaN(data)) {
                if (this.checked.page.includes(data)) {
                    let index = this.checked.page.indexOf(data);
                    if (index === -1) {
                        return;
                    }
                    this.checked.page.splice(index, 1);
                } else {
                    this.checked.page.push(data);
                }
                return;
            }
        },
        // 导出格式设置
        select_format(item) {
            // h5 背景音乐自动播放设置
            if (this.checked.type === 'h5') {
                // 编辑页判断
                if (!$(this.$parent.$el).find('#page_contain').length) {
                    return this.$toast('请在编辑器中设置');
                }
                page_opt.set_document_backgroundMusic(this.$parent, 'autoplay', item.value === 'auto');
            }
            this.checked.format = item.value;
        },
        // 导出质量设置
        select_quality(item) {
            this.checked.quality = item.value;
        },

        // h5生成
        open_preview_h5() {
            this.$parent.open_preview_h5 && this.$parent.open_preview_h5();
            this.close_modal();
        },
        // 开始导出
        start_export(obj) {
            if (!obj.page.length) {
                $('.options .select').addClass('error');
                return;
            }
            let no_next = ['video', 'h5'];
            if (no_next.includes(obj.type)) {
                return;
            }
            this.exporting = true;
            let that = this;
            let document = that.document_info;
            // 生成封面图
            let doc_cover = {
                async: () => {
                    let page_html = that.$common.obj_2_svg(document, that.document_page_list[0]);
                    return that.$common.svg_2_base64(page_html, false);
                },
                complete: () => {
                    that.end_export()
                }
            }
            that.$export.start({
                fileType: that.export_task_type(),
                title: document.title || document.name,
                cover: doc_cover,
                param: {
                    opt: 'documentDownload',
                    id: document.id,
                },
                taskJson: that.export_task_config(),
                complete: function (type) {
                    if (type !== 403) that.end_export(type);
                },
                fail: function () {
                    that.end_export();
                },
                error: function () {
                    // 购买后重新下载
                    that.isshow = true;
                    that.start_export(obj);
                }
            });
        },
        // 结束导出
        end_export(type) {
            this.end_export_animate();
            this.close_modal(type);
        },
        end_export_animate() {
            this.exporting = false;
        },
        // 导出类型配置
        export_task_type() {
            let type;
            let preset = ['ppt', 'pdf', 'image'];
            type = preset.find(item => item === this.checked.type || item === this.checked.mode);
            return type;
        },
        // 导出配置设置
        export_task_config(task = {}) {
            task['pageNum'] = this.checked.page.join();
            task['format'] = this.checked.format;
            task['quality'] = this.checked.quality;
            task['pdfType'] = this.checked.pdf;
            task['longImage'] = this.checked.mode === 'longImage';
            task['createNew'] = this.export_create_new();
            return task;
        },
        // 设置 / 检查参数更新（参数保存在本地）
        export_create_new() {
            if (!window.localStorage) {
                return true;
            }
            let that = this;
            let local = 'woodoExportNewDocument';
            try {
                let value = window.localStorage.getItem(local);
                let current_value = JSON.stringify(that.checked);
                let same = current_value === value;
                if (same) {
                    return false;
                }
                window.localStorage.setItem(local, current_value);
                return true;
            } catch (error) {
                return true;
            }
        },
    },
}
</script>

<style lang="less" scoped>
.modal-backdrop {
    z-index: 22;
    user-select: none;

    img {
        -webkit-user-drag: none;
    }
}

.export_container {
    width: 100%;
    height: 100%;
    background-color: #ffffff;
    .modal-header {
        padding: 12px 30px;
        height: 24px;

        .modal-title {
            &::before {
                content: "";
                display: inline-block;
                vertical-align: middle;
                margin-right: 6px;
                width: 16px;
                height: 16px;
                background: url("../assets/pc/images/export/export_icon.png") no-repeat center center;
            }

            span {
                display: inline-block;
                vertical-align: middle;
            }
        }

        .modal-close {
            top: 10px;
            display: flex;
            justify-content: center;
            align-items: center;
            background: none;
            .base-icon{
                font-size: 22px;
            }
        }
    }

    .modal-body {
        position: relative;
        display: flex;
        justify-content: center;
        padding: 0;
        width: 100%;
        height: calc(100% - 50px);
    }
    .tab_bar {
        float: left;
        width: 280px;
        height: 605px;

        .tab_con {
            position: relative;
            display: flex;
            flex-direction: column;
            justify-content: center;
            width: 100%;
            min-width: 280px;
            height: 150px;
            padding: 40px 44px 48px 75px;
            color: #191b1d;
            cursor: pointer;
            transition: all 0.3s;
            border-radius: 10px;
            background-color: #fff;
            &::before{
                content: '';
                position: absolute;
                left: 0;
                top: 0;
                display: inline-block;
                width: 100%;
                height: 1px;
                background-color: #eeeeee;
            }
            &:last-child::after{
                content: '';
                position: absolute;
                left: 0;
                bottom: 0;
                display: inline-block;
                width: 100%;
                height: 1px;
                background-color: #eeeeee;
            }
            &:hover {
                background-color: #fafafa;
            }

            &.checked {
                color: #ffffff;
                background-color: var(--mainColor);
                .name,.remarks{
                    color: #ffffff;
                }
            }

            .icon{
                position: absolute;
                left: 45px;
                top: 47px;
                display: inline-block;
                width: 20px;
                height: 17px;
                background-size: cover;
            }

            .name {
                height: 26px;
                line-height: 26px;
                margin-bottom: 14px;
                font-weight: bold;
                font-size: 20px;
            }

            .remarks {
                height: 20px;
                line-height: 20px;
                font-size: 14px;
                color: #666666;
            }
        }
    }

    .tab_main {
        float: right;
        width: 800px;
        height: 605px;

        .export_main {
            position: relative;
            display: block;
            width: 700px;
            height: 100%;
            margin-left: 100px;
            text-align: left;

            &.h5 {
                .modes {
                    display: block;
                    text-align: center;
                }
            }

            .modes {
                display: flex;
                flex-direction: row;
                justify-content: space-between;
                margin-bottom: 40px;
            }

            .options {
                margin-bottom: 25px;
                .title{
                    height: 21px;
                    line-height: 21px;
                    margin-bottom: 14px;
                    font-weight: bold;
                    font-size: 16px;
                }
                .select{
                    width: 100%;
                    height: 62px;
                    line-height: 62px;
                    background-color: #ffffff;
                    border-radius: 6px;
                    border: solid 1px #cccccc;
                    .selected{
                        height: 60px;
                        line-height: 60px;
                        font-size: 14px;
                        color: #666666;
                    }
                    .option{
                        top: 59px;
                    }
                }
            }

            .options_inlineblock {
                display: flex;
                flex-direction: row;
                justify-content: space-between;

                .options {
                    display: inline-block;
                    vertical-align: top;
                    width: 200px;
                }
            }

            .radios {
                .radio+.radio {
                    margin-left: 50px;
                }
            }

            .buttons {
                position: absolute;
                left: 240px;
                bottom: 0;
                width: 220px;
                height: 60px;
                line-height: 60px;
                font-size: 16px;
                border-radius: 10px;
            }
            .export_btn{
                background-color: var(--mainColor);
                &.disable{
                    background: #3b4046;
                }
            }
            
        }
    }

    .exporting {
        display: flex;
        flex-direction: column;
        justify-content: center;
        position: absolute;
        top: 0;
        left: 0;
        z-index: 2;
        width: 100%;
        height: 100%;
        background-color: #ffffff;
        text-align: center;

        .title {
            margin-bottom: 50px;
            font-size: 30px;
            color: #242424;
            font-weight: 300;
        }

        .loading {
            margin: 0 auto;
            width: 40px;
            height: 40px;
            margin-bottom: 10px;
            border: 8px solid var(--mainColor);
            border-left-color: transparent;
            border-radius: 50%;
            animation: rotate 0.8s ease infinite;
        }

        .remarks {
            font-size: 14px;
            color: #aaaaaa;
        }

        @keyframes rotate {
            from {
                transform: rotate(0);
            }

            to {
                transform: rotate(360deg);
            }
        }
    }
}

.exporting_container{
    width: 790px;
    height: 530px;
    .modal-body{
       .tab_bar,.tab_main{
           display: none;
       } 
    }
}

.modes {
    width: 100%;

    .mode {
        display: inline-block;
        vertical-align: top;
        width: 320px;
        height: 220px;
        padding-top: 39px;
        background-color: #ffffff;
        border-radius: 10px;
        border: solid 1px #8ebdf8;
        text-align: center;
        cursor: pointer;
        transition: all 0.3s;

        &:hover,
        &.checked {
            background-color: #eff4fb;
            box-shadow: 0px 5px 10px 0px rgba(130, 139, 159, 0.14);
            border: solid 1px rgba(28, 124, 244, 0.46);
        }

        .cover {
            height: 80px;
            margin-bottom: 10px;
        }

        .name {
            margin-bottom: 4px;
            font-size: 20px;
            height: 26px;
            line-height: 26px;
            font-weight: bold;
            color: #333333;
        }

        .remarks {
            font-size: 14px;
            height: 19px;
            line-height: 19px;
            color: #666666;
        }
    }
}

.options {
    width: 100%;

    .title {
        font-size: 14px;
        color: #3f4349;
        line-height: 18px;
    }

    .select {
        display: block;
        position: relative;
        width: 100%;
        height: 40px;
        overflow: hidden;
        cursor: pointer;

        &:hover {

            .selected,
            .option {
                border-color: var(--mainColor);
            }
        }

        &.error {

            .selected,
            .option {
                border-color: red;
            }
        }

        &.open {
            overflow: visible;

            .option {
                opacity: 1;
            }
        }

        .selected {
            width: 100%;
            height: 40px;
            padding: 0 3em 0 1em;
            line-height: 38px;
            background-color: #ffffff;
            border-radius: 4px;
            border: solid 1px #cdd5df;
            font-size: 12px;
            color: #2d3135;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
            transition: all 0.2s;
            &::after {
                content: "";
                position: absolute;
                top: 50%;
                right: 20px;
                margin-top: -3px;
                width: 0;
                height: 0;
                border: 6px solid #c7cfd8;
                border-left-color: transparent;
                border-right-color: transparent;
                border-bottom-color: transparent;
            }
        }

        .option {
            position: absolute;
            top: 39px;
            left: 0;
            z-index: 1;
            width: 100%;
            max-height: 176px;
            background-color: #ffffff;
            box-shadow: 0px 5px 10px 0px rgba(130, 139, 159, 0.14);
            border-radius: 4px;
            border: solid 1px #cdd5df;
            opacity: 0;
            overflow-x: hidden;
            overflow-y: auto;
            transition: all 0.2s;

            li {
                position: relative;
                width: 100%;
                height: 30px;
                padding: 0 1em;
                line-height: 30px;
                font-size: 12px;
                color: #2d3135;
                background-color: transparent;
                transition: all 0.3s;

                &.check {
                    &::after {
                        content: "";
                        position: absolute;
                        right: 20px;
                        top: 50%;
                        margin-top: -7px;
                        width: 12px;
                        height: 12px;
                        border-radius: 4px;
                        border: solid 1px #cdd5df;
                        background-color: #ffffff;
                        background-position: center center;
                        background-repeat: no-repeat;
                    }

                    &.checked::after {
                        border-color: var(--mainColor);
                        background-color: var(--mainColor);
                        background-image: url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAsAAAAICAYAAAAvOAWIAAAAlElEQVQoU4XPMQ5BYRCF0TOJsAJKCZ3YA7VCYSk2IFEqaS1CKZGQWIPV0Iz84r08CiaZZua7d+6EP5WZfQwi4hq/2Mwc44IuhpGZLYwi4tYUNsAejpgXeIU1tlhGlFHtWIGLiLiXzQQndLDDHmd8gOXqK3NmznB4Cx5ov0+/HKt49YNfgpLxA6ydK2VmTlF603Ss9k/E3TcmxvLmswAAAABJRU5ErkJggg==");
                    }
                }

                &:hover,
                &.checked {
                    background-color: #f6f8fb;
                }
            }
        }
    }
}

.radios {
    width: 100%;

    .title {
        font-size: 14px;
        color: #3f4349;
        line-height: 18px;
    }

    .radio {
        display: inline-block;
        vertical-align: top;
        width: auto;
        line-height: 20px;
        cursor: pointer;

        &::before {
            content: "";
            display: inline-block;
            vertical-align: middle;
            margin-right: 4px;
            width: 14px;
            height: 14px;
            background-color: #ffffff;
            background-position: center center;
            background-repeat: no-repeat;
            border-radius: 4px;
            border: solid 1px rgba(98, 102, 107, 0.46);
            transition: border 0.2s;
        }

        &:hover::before {
            border-color: var(--mainColor);
        }

        &.checked::before {
            border-color: var(--mainColor);
            background-color: var(--mainColor);
            background-image: url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAsAAAAICAYAAAAvOAWIAAAAlElEQVQoU4XPMQ5BYRCF0TOJsAJKCZ3YA7VCYSk2IFEqaS1CKZGQWIPV0Iz84r08CiaZZua7d+6EP5WZfQwi4hq/2Mwc44IuhpGZLYwi4tYUNsAejpgXeIU1tlhGlFHtWIGLiLiXzQQndLDDHmd8gOXqK3NmznB4Cx5ov0+/HKt49YNfgpLxA6ydK2VmTlF603Ss9k/E3TcmxvLmswAAAABJRU5ErkJggg==");
        }

        &+.radio {
            margin-left: 2em;
        }

        span {
            font-size: 12px;
            color: #2d3135;
        }

        .remarks {
            margin-left: 1.5em;
            color: #8c929a;
        }
    }
}

.buttons {
    width: 100%;
    text-align: center;

    .export_btn {
        display: inline-block;
        width: 178px;
        height: 50px;
        line-height: 50px;
        background-color: var(--mainColor);
        border-radius: 4px;
        font-size: 16px;
        color: #ffffff;
        text-align: center;
        cursor: pointer;
        transition: all 0.3s;

        &:not(.disable):hover {
            opacity: 0.85;
        }

        &.disable {
            background-color: #3b4046;
            cursor: no-drop;
        }
    }
}
@media screen and (min-width: 1920px) {
    .export_container{
        .modal-body{
            align-items: center;
        }
    }
}
@media screen and (max-width: 1920px) {
    .export_container{
        .modal-body{
            padding: 60px 0;
        }
    }
}
@media screen and (max-height: 770px) {
    .export_container{
        .modal-body{
            overflow-y: visible;
        }
    }
}
</style>
