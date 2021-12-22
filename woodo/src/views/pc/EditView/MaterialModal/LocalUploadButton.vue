<template>
    <div class="local-upload-button">
        <input type="file" accept="image/gif, image/jpeg, image/png, image/bmp, image/webp, image/svg+xml,audio/mp3,video/mp4," multiple @change="upload($event)" :disabled="upload_status === 'loading'" />
        <span>本地上传</span>
    </div>
</template>

<script>
import opt_factory from '@/assets/pc/js/opt/opt_factory.js';
import material from '@/assets/pc/js/material.js';
import page_opt from '@/assets/pc/js/opt/page_opt.js';
import operate_opt from '@/assets/pc/js/opt/operate_opt.js';
export default {
    inject: ['EditView'],
    props: {
        // 是否设置背景音乐
        setBackground: {
            type: Boolean,
            default: false
        },
    },
    data() {
        return {
            // 媒体文件信息
            media_file_info: {
                name: '',
                size: 0,
                progress: 0,
            },
            // 上传状态
            upload_status: 'init', // (init || loading || done) => (初始状态 || 上传中 || 上传完成)
            // 取消上传方法
            upload_cancel_fn: null,
            // 上传类型  
            upload_type: '' // (image || video || audio) => (图片 || 视频 || 音频)
        }
    },
    methods: {
        upload(e) {
            let files = e.target.files;
            if (!files.length) return that.$toast('请选择文件~', 2000);
            let type = files[0].type;
            let size = files[0].size / 1024 / 1024; // 单位为 M
            // 多选文件情况
            if(files.length > 1){
                let has_image = false;
                let has_video = false;
                let has_audio = false;
                for(let i = 0; i < files.length; i++){
                    if(!has_image){
                        has_image = files[i].type.indexOf('image') !== -1;
                    }

                    if(!has_video){
                        has_video = files[i].type.indexOf('video') !== -1;
                    }

                    if(!has_audio){
                        has_audio = files[i].type.indexOf('audio') !== -1;
                    }
                }

                if(!has_image) {
                    return this.$toast('视频或音频文件只能上传一个', 2000);
                }else{
                    type = 'image';
                }
            }

            // image/*  上传图片
            if (type.indexOf('image') !== -1) {
                this.upload_type = 'image';
                this.imagesUpload(e);
                return;
            }

            // video/mp4 上传视频
            if (type.indexOf('video') !== -1) {
                this.upload_type = 'video';
                this.input_upload_video(e);
                return;
            }

            // audio/mpeg 上传音频
            if (type.indexOf('audio') !== -1) {
                this.upload_type = 'audio';
                this.input_upload_audio(e);
                return;
            }
        },
        // 上传结束
        uploadOver() {
            this.upload_status = 'init';
            this.media_file_info.name = '';
            this.media_file_info.size = 0;
            this.media_file_info.progress = 0;
            this.$emit('uploadOver');
        },
        // 取消上传
        cancel_upload_media() {
            if (typeof this.upload_cancel_fn === 'function') {
                this.upload_cancel_fn('cancel');
                this.upload_cancel_fn = null;
                this.upload_status = 'init';
            } else {
                this.upload_status = 'init';
            }
        },

        /* 图片方法 */
        // 背景图链接替换
        images_change_background_src: function (str) {
            let that = this;
            let url = str.indexOf('?') > 1 ? str.slice(0, str.indexOf('?')) : str;
            let $ele = $('.page_contain .ele_item.checked');
            $ele.each(function () {
                let $ele = $(this);
                let ele_type = $ele.attr('data-type');
                let option = opt_factory.init_opt(ele_type);
                option.set_background($(this), {
                    type: 'image',
                    color: 'transparent',
                    image: { src: url }
                });
            })
            // 选中元素
            that.EditView.set_ele_checked($ele);
        },
        // 替换图片链接
        images_change_element_src: function (str) {
            let that = this,
                $ele = $('.page_contain .ele_item.checked'),
                option = opt_factory.init_opt('img');
            // 切换图片
            option.change_url($ele, str);
            // 选中元素
            that.EditView.set_ele_checked($ele);
        },
        // 图片上传
        imagesUpload(event) {
            let that = this;
            let $this = event.target;
            let files = $this.files;
            if (!files || !files.length) {
                return that.$toast("上传图片失败，请重试！");
            }
            if (files.length > 9) {
                return that.$toast("最多上传9张哦！", 1500);
            }
            let last_file = files[files.length - 1];
            // 在替换图片、设置背景图操作下上传图片
            that.EditView.ele_cancel_checked();
            let $page = $('.page_contain .edit_page');
            for (let i = 0; i < files.length; i++) {
                let file = files[i];
                // 图片类型校验
                if (file.type.indexOf('image') < 0) {
                    that.$toast(`不支持${file.name}该文件上传`, 2000);
                    continue;
                }
                // 非指定格式
                if (!/(jpg|jpeg|png|JPG|PNG|gif|GIF|(svg\+xml))$/.test(file.type)) {
                    that.$toast(`不支持${file.name}该格式图片上传`, 2000);
                    continue;
                }
                // 图片size校验
                if (file.size / 1024 / 1024 > 100) {
                    that.$toast(`${file.name}上传失败，只能上传100M以下的图片哦~`, 2000);
                    continue;
                }
                // 上传图片加载弹窗
                that.EditView.show_image_load_masking();
                ((index) => {
                    let $el;
                    material.api.common_image_upload(that, {
                        file: file,
                        builddone: ($ele, template, option) => {
                            $el = $ele;
                            // svg文件异步生成封面图
                            if (file.type.indexOf(`svg`) > -1) {
                                that.$common.getSvgFileThumbnail(file).then(url => {
                                    $el.attr(`data-static-image`, url);
                                })
                            }
                            // 插入节点
                            $ele.appendTo($page);
                            // 初始化元素大小
                            option.fit_dom_size($ele);
                            // 初始化元素定位
                            option.fit_dom_offset($ele);
                            // 初始化操作框
                            setTimeout(() => {
                                operate_opt.reset_rect($ele);
                            }, 16)
                        },
                        addmydone: () => {
                            that.EditView.show_image_loading = false;
                            // 最后一张上传完成
                            if (i === 0) {
                                // 选中元素
                                that.EditView.set_ele_checked($el);
                            }
                        },
                        error: () => {
                            // 关闭图片上传的状态
                            that.EditView.close_img_load();
                            that.$toast(`第${index + 1}张上传图片失败，请重试！`);
                        },
                    });
                })(i);
            }
            $this.value = '';
            // 
            that.uploadOver();
        },
        /* 图片方法 end */

        /* 音频方法 */
        // 音频上传
        input_upload_audio(event) {
            let that = this;
            let $this = event.target;
            let file = $this.files[0];
            that.upload_status = 'loading';
            that.media_file_info.name = file.name;
            that.media_file_info.size = Number(file.size / 1024 / 1024).toFixed(2);
            let audio_opt = opt_factory.init_opt('audio');
            audio_opt.audio_upload({
                file: file,
                cancel: c => { that.upload_cancel_fn = c; },
                progress: p => { that.media_file_info.progress = p; },
                success: data => {
                    that.upload_status = 'done';
                    that.insert_audio(data, elementlist => {
                        that.uploadOver();
                        // 保存到我的媒体
                        audio_opt.save_member_media({
                            elementList: elementlist,
                            size: file.size / 1024,
                        });
                    });
                },
                error: err => {
                    that.uploadOver();
                    if (err) {
                        switch (err.message) {
                            case 'cancel':
                                that.$toast('已取消上传~', 2000);
                                break;
                            case 'size':
                                that.$toast(`抱歉，上传的文件最大不能超过${err.maxSize || 100}M~`, 2000);
                                break;
                            case 'type':
                                that.$toast('请选择正确音频文件~', 2000);
                                break;
                            default:
                                that.$toast('上传音频失败~', 2000);
                                break;
                        }
                    } else {
                        that.$toast('上传音频失败~', 2000);
                    }
                },
            });
            // 清除 input 选中文件，防止二次选中无效果
            $this.value = '';
        },
        // 插入音频 创建音频元素
        insert_audio(src, callback) {
            let that = this;
            if (src) {
                // 设置背景音乐
                if (that.setBackground) {
                    page_opt.set_document_backgroundMusic(that.EditView, {
                        'src': src,
                        'fadeIn': '00:00',
                        'fadeOut': '00:00',
                        'autoplay': true,
                        'loop': false,
                        'hideOnShow': false,
                    });
                    that.$toast('添加背景音乐成功~');
                    // 关闭插入弹框
                    that.uploadOver();
                    // 打开全局设置面板
                    that.EditView.open_theme_modal();
                    return;
                }
                // 插入元素
                let $page = $('.page_contain .edit_page');
                let option = opt_factory.init_opt('audio');
                let $ele;
                // 清除其他元素选中
                that.EditView.ele_cancel_checked();
                // 元素创建
                let param = {
                    id: option.fn.uuid(),
                    src: src,
                    width: 50,
                    height: 50,
                };
                // 生成图表元素
                param = that.EditView.ele_build_before_format(param);
                let ele_html = option.build(param);
                $ele = $(ele_html);
                $page.append($ele);
                // 初始化位置
                option.fit_dom_offset($ele);
                // 选中元素
                that.EditView.set_ele_checked($ele);
                if (typeof callback === 'function') callback(option.dom_2_ele($ele));
            }
        },
        /* 音频方法 end */

        /* 视频方法 */
        // 视频上传
        input_upload_video(event) {
            let that = this;
            let $this = event.target;
            let file = $this.files[0];
            that.upload_status = 'loading';
            that.media_file_info.name = file.name;
            that.media_file_info.size = Number(file.size / 1024 / 1024).toFixed(2);
            let video_opt = opt_factory.init_opt('video');
            video_opt.video_upload({
                file: file,
                cancel: c => { that.upload_cancel_fn = c; },
                progress: p => { that.media_file_info.progress = p; },
                success: data => {
                    // 修改上传状态
                    that.upload_status = 'done';
                    that.insert_video(data, elementlist => {
                        that.uploadOver();
                        // 保存媒体到我的上传
                        video_opt.save_member_media({
                            elementList: elementlist,
                            size: file.size / 1024,
                        });
                    });
                },
                error: err => {
                    that.upload_status = 'init';
                    if (err) {
                        switch (err.message) {
                            case 'cancel':
                                that.$toast('已取消上传~', 2000);
                                break;
                            case 'size':
                                that.$toast(`抱歉，上传的文件最大不能超过${err.maxSize || 100}M~`, 2000);
                                break;
                            case 'type':
                                that.$toast('请选择正确视频文件~', 2000);
                                break;
                            default:
                                that.$toast('上传视频失败~', 2000);
                                break;
                        }
                    } else {
                        that.$toast('上传视频失败~', 2000);
                    }
                },
            });
            // 清除 input 选中文件，防止二次选中无效果
            $this.value = '';
        },
        // 插入视频 创建视频元素
        insert_video(src, callback) {
            let that = this;
            let option = opt_factory.init_opt('video');
            let param = {
                id: option.fn.uuid(),
                width: 16,
                height: 9,
            };
            // 生成元素
            param = that.EditView.ele_build_before_format(param);
            // 上传进度
            if (that.upload_status !== 'done' || !src) return;
            param['src'] = src;
            // 阿里云 oss 视频截帧
            param['cover'] = `${src}?x-oss-process=video/snapshot,t_1000,m_fast`;
            param['outside'] = false;
            // 开始生成元素
            if (param['src']) {
                // 站内上传视频 获取 width height
                if (!param['outside']) {
                    // 获取视频元数据
                    let $video = document.createElement('video');
                    $video.src = param.src;
                    $video.onloadedmetadata = function () {
                        param['width'] = $video.videoWidth;
                        param['height'] = $video.videoHeight;
                        that.build_video_element(param);
                        if (typeof callback === 'function') callback(option.dom_2_ele($(`.page_contain .edit_page #${param.id}.ele_item`)));
                    }
                } else {
                    that.build_video_element(param);
                    if (typeof callback === 'function') callback(option.dom_2_ele($(`.page_contain .edit_page #${param.id}.ele_item`)));
                }
            }
        },
        // 生成视频元素插入到画布
        build_video_element(param) {
            let that = this;
            let $page = $('.page_contain .edit_page');
            let option = opt_factory.init_opt('video');
            let $ele;
            // 清除其他元素选中
            that.EditView.ele_cancel_checked();
            let ele_html = option.build(param);
            $ele = $(ele_html);
            $page.append($ele);
            // 初始化大小
            option.fit_dom_size($ele);
            // 初始化位置
            option.fit_dom_offset($ele);
            // 选中元素
            that.EditView.set_ele_checked($ele);
        },
        /* 视频方法 end */

        // 上传进度的显示
        getUploadStatus() {
            this.$upload_status({
                status: this.upload_status,
                type: this.upload_type,
                info: this.media_file_info
            });
        }
    },
    watch: {
        upload_status: function(value) {
            this.getUploadStatus();

            // 上传过程中，禁掉上传按钮
            if (value === 'loading') {
                $('.local-upload-button').css('background-color', '#ccc');
                $('.local-upload-button > input').css('cursor', 'not-allowed');
            } else {
                $('.local-upload-button').css('background-color', '');
                $('.local-upload-button > input').css('cursor', 'pointer');
            }
        }
    }
}
</script>

<style lang="less" scoped>
.local-upload-button {
    position: relative;
    display: flex;
    justify-content: center;
    align-items: center;
    width: 158px;
    height: 36px;
    background: var(--mainColor);
    border-radius: 5px;
    &:hover {
        background: #004dd0;
    }
    input {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        opacity: 0;
        cursor: pointer;
    }
    span {
        font-size: 12px;
        font-weight: 400;
        color: #ffffff;
    }
}
</style>