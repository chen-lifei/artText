<template>
    <div class="media_container">
        <!-- 视频 侧边栏面板 -->
        <transition name="modal-slide">
            <div class="side_panel_contain media_modal_contain" v-if="open_media_status === 'video'">
                <div class="side_panel_head">
                    <p class="title">
                        <i class="edit-ico edit-ico-video_gray"></i>插入视频
                    </p>
                    <button class="close" @click="close_media_panel" v-bdtongji="'编辑器-功能区-插入视频-右上角-关闭'">
                        <i class="edit-ico edit-ico-close_1"></i>
                    </button>
                </div>
                <div class="side_panel_body">
                    <div class="media_tabbar">
                        <a href="javascript:;" class="item" :class="{'checked': video_tabbar === 'link'}" @click="video_tabbar_switch('link')" v-bdtongji="'编辑器-功能区-插入视频-顶部-视频链接'">视频链接</a>
                        <a href="javascript:;" class="item" :class="{'checked': video_tabbar === 'upload'}" @click="video_tabbar_switch('upload')" v-bdtongji="'编辑器-功能区-插入视频-顶部-本地视频'">本地上传</a>
                    </div>
                    <!-- 视频链接面板 -->
                    <div class="tabbar_panel" v-if="video_tabbar === 'link'">
                        <div class="video_ornament">
                            <div class="video_ornament_preview"></div>
                        </div>
                        <div class="media_link_wrapper">
                            <div class="media_link_guide">
                                <span>粘贴网址/代码</span>
                                <div class="guide" @mouseenter="show_video_guide" @mouseleave="hide_video_guide" v-bdtongji="'编辑器-功能区-插入视频-居中-教程参考'">
                                    <span>教程参考</span>
                                    <i class="edit-ico edit-ico-question_gray"></i>
                                </div>
                            </div>
                            <input type="text" class="media_link_input" v-model="video_link" @input="input_video_link" placeholder="在此粘贴视频地址" v-bdtongji="'编辑器-功能区-插入视频-居中-粘贴视频地址'"/>
                            <p class="media_link_tips">
                                <span>1. 抖音、快手等APP需保存视频到本地后再上传；</span>
                                <br>
                                <span>2. 支持大部分PC端视频网站的链接引用；</span>
                                <br>
                                <span>请注意：未经许可在网上使用他人的视频可能会冒犯他人，甚至导致侵权。</span>
                                <br>
                                <a href="https://www.woodo.cn/slides/?url=6564086780" target="_blank" v-bdtongji="'编辑器-功能区-插入视频-居中-免责声明'">免责声明</a>
                            </p>
                        </div>
                        <a href="javascript:;" class="bottom_btn insert_btn" :class="{'disable': !insert_video_link}" @click="insert_video" v-bdtongji="`编辑器-功能区-插入视频-底部-插入视频|PC-统计-功能区-媒体-视频连接-插入视频`">插入视频</a>
                    </div>
                    <!-- 视频上传面板 -->
                    <div class="tabbar_panel" v-else-if="video_tabbar === 'upload'">
                        <div class="media_upload_wrapper">
                            <div class="media_upload_container">
                                <input type="file" id="upload_video" accept="video/mp4," @change="input_upload_video" v-bdtongji="`PC-统计-功能区-媒体-本地上传-添加本地上传`"/>
                                <!-- 上传初始样式 -->
                                <label v-if="video_upload_status === 'init'" for="upload_video" class="upload_init" v-bdtongji="'编辑器-功能区-插入视频-顶部-本地视频-添加本地视频'">
                                    <i class="edit-ico edit-ico-upload_bigfile_blue"></i>
                                    <p class="icon_text">+添加本地视频</p>
                                    <p class="upload_tips" :class="{'alert': video_check_tip}">支持格式MP4，文件大小不超过50MB</p>
                                </label>
                                <!-- 上传中 -->
                                <div class="uploading" v-else>
                                    <div class="item">
                                        <p class="name">{{ video_fileinfo.name }}</p>
                                        <p class="progress_text">{{ video_fileinfo.progress }}%</p>
                                    </div>
                                    <div class="progress">
                                        <i :style="{'width': `${video_fileinfo.progress}%`}"></i>
                                    </div>
                                    <div class="item" v-if="video_upload_status === 'loading'">
                                        <p class="state">上传中...</p>
                                        <a href="javascript:;" class="cancel" @click="cancel_upload_media">取消</a>
                                        <p class="size">文件大小：{{ video_fileinfo.size }}MB</p>
                                    </div>
                                    <div class="item" v-else-if="video_upload_status === 'done'">
                                        <p class="state">
                                            <i class="edit-ico edit-ico-success_icon_green"></i>
                                            <span>视频上传完成</span>
                                        </p>
                                        <a href="javascript:;" class="re">
                                            <label for="upload_video">重新上传</label>
                                        </a>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </transition>
        <!-- 音频 侧边栏面板 -->
        <transition name="modal-slide">
            <div class="side_panel_contain media_modal_contain" v-if="open_media_status === 'audio'">
                <div class="side_panel_head">
                    <p class="title">
                        <i class="edit-ico edit-ico-audio_gray"></i>插入音频
                    </p>
                    <button class="close" @click="close_media_panel">
                        <i class="edit-ico edit-ico-close_1"></i>
                    </button>
                </div>
                <div class="side_panel_body">
                    <div class="media_tabbar">
                        <a href="javascript:;" class="item" :class="{'checked': audio_tabbar === 'recommend'}" @click="audio_tabbar_switch('recommend')">热门推荐</a>
                        <a href="javascript:;" class="item" :class="{'checked': audio_tabbar === 'collection'}" @click="audio_tabbar_switch('collection')">我的收藏</a>
                        <a href="javascript:;" class="item" :class="{'checked': audio_tabbar === 'upload'}" @click="audio_tabbar_switch('upload')">本地上传</a>
                    </div>
                    <!-- 热门推荐 -->
                    <div class="tabbar_panel" v-if="audio_tabbar === 'recommend'">
                        <ul class="recommend_list">
                            <li v-for="(item, index) in media_data" :key="index" @click="get_media_category_list(item.id)">
                                <!-- <i class="vip"></i> -->
                                <img :src="item.image" class="background" />
                                <p class="name">{{ item.name }}</p>
                                <!-- <p class="total">共50首</p> -->
                            </li>
                        </ul>
                    </div>
                    <!-- 我的收藏 -->
                    <div class="tabbar_panel" v-if="audio_tabbar === 'collection'">
                        <ul class="music_list" ref="collection_list" v-if="media_favorite_data.length">
                            <li v-for="(item, index) in media_favorite_data" :key="index" @click="selected_try">
                                <a href="javascript:;" class="play_icon" title="暂停" v-if="try_media_data.id === item.id && try_media_data.play" @click="try_paused"></a>
                                <a href="javascript:;" class="paused_icon" title="播放" v-else @click="category_audio_try(item)"></a>
                                <p class="name">{{ item.name }}</p>
                                <p class="total_time">{{ try_media_data.id === item.id ? minute_format(try_media_data.duration) : minute_format(item.duration) }}</p>
                                <p class="current_time">{{ try_media_data.id === item.id ? update_current_time : '00:00' }}</p>
                                <a href="javascript:;" class="copyright" @mouseenter="show_copyright" @mouseleave="hide_copyright">
                                    <i class="edit-ico edit-ico-note_i"></i>
                                </a>
                                <a href="javascript:;" class="collection">
                                    <i class="edit-ico edit-ico-like_red" title="取消收藏" @click="set_media_favorite(item.id, false)"></i>
                                </a>
                                <div class="progress">
                                    <i :style="{'width': `${ try_media_data.id === item.id ? update_time_progress : 0 }%`}"></i>
                                </div>
                                <a href="javascript:;" class="insert" @click="audio_material_insert(item)" v-bdtongji="`PC-统计-功能区-媒体-插入音频-我的收藏`">+插入该音乐</a>
                            </li>
                        </ul>
                        <div v-else class="list_empty">
                            <img v-webp="require('../../../assets/common/images/empty_1.png')" alt=""/>
                            <p>没有收藏音乐哦~</p>
                        </div>
                    </div>
                    <!-- 音频上传 -->
                    <div class="tabbar_panel" v-if="audio_tabbar === 'upload'">
                        <div class="media_upload_wrapper">
                            <div class="media_upload_container">
                                <input type="file" id="upload_audio" accept="audio/mp3," @change="input_upload_audio" v-bdtongji="`PC-统计-功能区-媒体-插入音频-本地上传`"/>
                                <!-- 上传初始样式 -->
                                <label v-if="audio_upload_status === 'init'" for="upload_audio" class="upload_init">
                                    <i class="edit-ico edit-ico-upload_bigfile_blue"></i>
                                    <p class="icon_text">+添加本地音频</p>
                                    <p class="upload_tips" :class="{'alert': audio_check_tip}">支持格式MP3，文件大小不超过100MB</p>
                                </label>
                                <!-- 上传中 -->
                                <div class="uploading" v-else>
                                    <div class="item">
                                        <p class="name">{{ audio_fileinfo.name }}</p>
                                        <p class="progress_text">{{ audio_fileinfo.progress }}%</p>
                                    </div>
                                    <div class="progress">
                                        <i :style="{'width': `${audio_fileinfo.progress}%`}"></i>
                                    </div>
                                    <div class="item" v-if="audio_upload_status === 'loading'">
                                        <p class="state">上传中...</p>
                                        <a href="javascript:;" class="cancel" @click="cancel_upload_media">取消</a>
                                        <p class="size">文件大小：{{ audio_fileinfo.size }}MB</p>
                                    </div>
                                    <div class="item" v-else-if="audio_upload_status === 'done'">
                                        <p class="state">
                                            <i class="edit-ico edit-ico-success_icon_green"></i>
                                            <span>音频上传完成</span>
                                        </p>
                                        <a href="javascript:;" class="re">
                                            <label for="upload_audio">重新上传</label>
                                        </a>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <!-- 热门推荐列表详情 -->
                <div class="recommend_detail_panel" v-if="media_category_id">
                    <div class="head">
                        <a href="javascript:;" class="back" @click="back_media_category">返回</a>
                        <span class="name" v-if="media_category_title.total">
                            <span>{{ media_category_title.total }}</span>首{{ media_category_title.name }}
                        </span>
                        <span class="name" v-else>{{ media_category_title.name }}</span>
                    </div>
                    <ul class="music_list" ref="recommend_list">
                        <li v-for="(item, index) in media_category_data" :key="index" @click="selected_try">
                            <a href="javascript:;" class="play_icon" title="暂停" v-if="try_media_data.id === item.id && try_media_data.play" @click="try_paused"></a>
                            <a href="javascript:;" class="paused_icon" title="播放" v-else @click="category_audio_try(item)"></a>
                            <p class="name">{{ item.name }}</p>
                            <p class="total_time">{{ try_media_data.id === item.id ? minute_format(try_media_data.duration) : minute_format(item.duration) }}</p>
                            <p class="current_time">{{ try_media_data.id === item.id ? update_current_time : '00:00' }}</p>
                            <a href="javascript:;" class="copyright" @mouseenter="show_copyright" @mouseleave="hide_copyright">
                                <i class="edit-ico edit-ico-note_i"></i>
                            </a>
                            <a href="javascript:;" class="collection">
                                <i class="edit-ico edit-ico-like_red" title="取消收藏" v-if="media_favorite_map[item.id]" @click="set_media_favorite(item.id, false)"></i>
                                <i class="edit-ico edit-ico-like_outer_gray" title="加入收藏" v-else @click="set_media_favorite(item.id, true)"></i>
                            </a>
                            <div class="progress">
                                <i :style="{'width': `${ try_media_data.id === item.id ? update_time_progress : 0 }%`}"></i>
                            </div>
                            <a href="javascript:;" class="insert" @click="audio_material_insert(item)" v-bdtongji="`PC-统计-功能区-媒体-插入音频-热门推荐`">+插入该音乐</a>
                        </li>
                    </ul>
                </div>
            </div>
        </transition>
        <!-- 媒体版权信息弹窗（因为侧边栏弹窗 overflow：hidden） -->
        <div class="copyright_modal" ref="copyright_modal">
            <h1>版权声明</h1>
            <p>吾道幻灯片推荐的音频文件来源于第三方分享者，其版权归原创作者拥有。若作为商业用途，请获取模板原作者授权或替换相应素材，请谨慎使用，吾道幻灯片不承担由此引发的一切版权纠纷。</p>
            <p>对于用户在使用吾道幻灯片平台服务过程中自行上传的素材和作品，吾道幻灯片不具备审查其内容是否存在侵权等情节的能力。用户自行上传和使用素材等内容应遵守相关法律、法规，不得侵犯本网站及权利人的合法权利，情节严重者将依法追究其法律责任，吾道幻灯片不承担出现权利纠纷时的任何责任。</p>
            <p>吾道幻灯片尊重知识产权，如知识产权权利人认为平台内容（包括但不限于用户自行上传分享的内容）涉嫌侵权，可通过邮件：bd@500d.me提出书面通知，我们将及时处理。</p>
        </div>
        <!-- 视频链接指引 -->
        <div class="video_outside_guide" ref="video_outside_guide">
            <img src="../../../assets/pc/images/common/video_outside_guide.png" alt="">
        </div>
    </div>
</template>

<script>
import opt_factory from '@/assets/pc/js/opt/opt_factory.js';
import operate_opt from '@/assets/pc/js/opt/operate_opt.js';
import page_opt from '@/assets/pc/js/opt/page_opt.js';
import video_opt from '@/assets/pc/js/opt/video_opt.js';
import audio_opt from '@/assets/pc/js/opt/audio_opt.js';

export default {
    name: 'MediaPanel',
    props: [
        'document_info',
    ],
    data() {
        return {
            open_media_status: '',              // 面板类型 vlaue = video || audio
            upload_cancel_fn: null,             // 取消上传方法
            set_background: false,              // 重置背景音乐

            // 数据类
            media_data: [],                     // 一级分类列表
            media_category_data: [],            // 分类数据列表
            media_favorite_data: [],            // 收藏列表
            media_favorite_map: {},             // 收藏列表map
            media_category_id: null,            // 分类id
            media_category_title: { name: '', total: 0 },            // 分类名称 总数
            try_media_data: {},                 // 列表中正在试听的媒体数据

            // 视频类
            video_tabbar: 'link',               // 视频面板显示类型  link = 视频链接  upload = 上传
            // 视频链接
            video_link: '',                     // 视频链接地址
            insert_video_link: false,           // 插入视频链接状态
            // 视频上传
            video_upload_status: 'init',        // 上传面板状态  init = 上传前初始状态  loading = 上传中  done = 上传完成
            video_check_tip: false,             // 校验提示
            // 视频文件对象
            video_fileinfo: {
                name: '',
                size: 0,
                progress: 0,
            },

            // 音频类
            audio_tabbar: 'recommend',          // 音频面板显示类型  recommend = 热门推荐  collection = 我的收藏  upload = 上传
            audio_upload_status: 'init',        // 上传面板状态  init = 上传前初始状态  loading = 上传中  done = 上传完成
            audio_check_tip: false,             // 校验提示
            // 视频文件对象
            audio_fileinfo: {
                name: '',
                size: 0,
                progress: 0,
            },

        }
    },
    computed: {
        update_current_time() {
            return this.minute_format(this.try_media_data.currentTime);
        },
        update_time_progress() {
            return Math.floor(this.try_media_data.currentTime / this.try_media_data.duration * 100);
        },
    },
    methods: {
        /**
         * 媒体侧边栏面板通用方法  status = 'video' || 'audio'， obj：扩展参数
         */
        open_media_panel(status, obj) {
            let opt = {
                setBGM: false,
            };
            opt = Object.assign(opt, obj);
            let that = this;
            // 打开状态下重新触发，面板先收回再重新打开恢复初始
            if (that.open_media_status) {
                that.close_media_panel(() => {
                    that.video_tabbar = 'link';
                    that.audio_tabbar = 'recommend';
                    that.open_media_panel(status, opt);
                });
            } else {
                // 音频加载推荐音乐
                if (status === 'audio') {
                    that.get_media_category();
                }
                that.open_media_status = status;
                // 重置背景
                that.set_background = opt.setBGM;
                // 重置面板设置
                that.init_panel();
            }
        },
        close_media_panel(callback) {
            this.open_media_status = '';
            this.set_background = false;
            this.init_try_media_data();
            this.$nextTick(() => {
                setTimeout(() => {
                    if (typeof callback === 'function') callback();
                }, 300);
            });
        },
        // 初始化面板
        init_panel() {
            // 视频
            this.video_link = '';
            this.insert_video_link = false;
            this.video_upload_status = 'init';
            this.video_check_tip = false;
            // 音频
            this.audio_upload_status = 'init';
            this.audio_check_tip = false;
            this.init_try_media_data();
            this.media_category_id = null;
        },
        // 初始化试听播放数据
        init_try_media_data() {
            this.try_media_data = {
                id: null,
                src: '',
                play: false,
                currentTime: 0,
                duration: 0,
            };
            let audio = document.querySelector('audio#try_music');
            if (audio) {
                document.body.removeChild(audio);
            }
        },
        // 取消上传
        cancel_upload_media() {
            if (typeof this.upload_cancel_fn === 'function') {
                this.upload_cancel_fn('cancel');
            } else {
                this.video_upload_status = 'init';
                this.audio_upload_status = 'init';
            }
        },
        // 数字 转 时间格式（00:00）
        minute_format(num) {
            return utils.numberToMinuteFormat(num);
        },
        // 版权弹窗显示隐藏
        show_copyright(event) {
            let el = $(event.target);
            $(this.$refs.copyright_modal).css(el.offset());
        },
        hide_copyright() {
            $(this.$refs.copyright_modal).removeAttr('style');
        },


        /* -------------------------------------视频----------------------------------------- */
        // 切换 链接、上传 面板
        video_tabbar_switch(type) {
            if (this.video_tabbar === type) {
                return;
            }
            this.video_tabbar = type;
        },
        // 链接输入
        input_video_link() {
            let that = this;
            let value = that.video_link;
            that.insert_video_link = !$validate(value).null();
        },
        // 视频上传
        input_upload_video(event) {
            let that = this;
            let $this = event.target;
            that.video_check_tip = false;
            if ($this.files.length === 0) {
                return that.$toast('请选择视频文件~', 2000);
            }
            let file = $this.files[0];
            that.video_upload_status = 'loading';
            that.video_fileinfo.name = file.name;
            that.video_fileinfo.size = Number(file.size / 1024 / 1024).toFixed(2);
            video_opt.video_upload({
                file: file,
                cancel: c => { that.upload_cancel_fn = c; },
                progress: p => { that.video_fileinfo.progress = p; },
                success: data => {
                    that.video_upload_status = 'done';
                    that.insert_video(data, elementlist => {
                        // 保存到我的媒体
                        video_opt.save_member_media({
                            elementList: elementlist,
                            size: file.size / 1024,
                        });
                    });
                },
                error: err => {
                    that.video_upload_status = 'init';
                    if (err) {
                        switch (err.message) {
                            case 'cancel':
                                that.$toast('已取消上传~', 2000);
                                break;
                            case 'size':
                                that.$toast('文件大小超出限制~', 2000);
                                that.video_check_tip = true;
                                break;
                            case 'type':
                                that.$toast('请选择正确视频文件~', 2000);
                                that.video_check_tip = true;
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
            param = that.$parent.ele_build_before_format(param);
            // 外站视频插入校验
            if (that.video_tabbar === 'link') {
                if (!that.insert_video_link) {
                    return;
                }
                let format_src = option.video_src_format(that.video_link);
                if (!format_src) {
                    return that.$toast('请检查链接是否有效或是否支持此视频类型！', 3000);
                }
                param['src'] = format_src;
                param['outside'] = true;
            } else 
            // 上传视频插入校验
            if (that.video_tabbar === 'upload') {
                // 上传进度
                if (that.video_upload_status !== 'done' || !src) {
                    return;
                }
                param['src'] = src;
                // 阿里云 oss 视频截帧
                param['cover'] = `${src}?x-oss-process=video/snapshot,t_1000,m_fast`;
                param['outside'] = false;
            }
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
            that.$parent.ele_cancel_checked();
            let ele_html = option.build(param);
            $ele = $(ele_html);
            $page.append($ele);
            // 初始化大小
            option.fit_dom_size($ele);
            // 初始化位置
            option.fit_dom_offset($ele);
            // 选中元素
            that.$parent.set_ele_checked($ele);
            // 关闭弹窗
            that.close_media_panel();
        },
        // 显示复制视频链接指引
        show_video_guide() {
            $(this.$refs.video_outside_guide).addClass('show');
        },
        hide_video_guide() {
            $(this.$refs.video_outside_guide).removeClass('show');
        },
        

        /* -------------------------------------音频----------------------------------------- */
        // 切换 推荐、收藏、上传 面板
        audio_tabbar_switch(type) {
            if (this.audio_tabbar === type) {
                return;
            }
            this.audio_tabbar = type;
            if (type === 'collection') {
                this.get_media_favorite_list();
            }
        },
        // 获取热门推荐分类列表
        get_media_category() {
            let that = this;
            if (that.media_data.length > 0) return;
            that.$axios.get('/api/media/category_list/').then(res => {
                let res_data = res.data;
                if (res_data.type === 'success') {
                    let data = res_data.data;
                    that.media_data = data;
                }
            }).catch(err => {
                console.error(err);
            });
        },
        // 获取分类数据列表
        get_media_category_list(id, pageNumber = 1) {
            let that = this;
            if (!id) {
                return;
            }
            if (pageNumber === 1) {
                that.media_category_id = id;
                that.media_category_title.name = that.media_data.find(item => item.id === id).name;
                that.media_category_data = [];
            }
            that.$nextTick(() => {
                let $list = that.$refs.recommend_list;
                $list.onscroll = null;
                that.$axios.get('/api/media/list/', {
                    params: {
                        cid: id,
                        pageSize: 50,
                        pageNumber: pageNumber,
                    },
                }).then(res => {
                    let res_data = res.data;
                    if (res_data.type !== 'success') {
                        return;
                    }
                    let data = res_data.data;
                    that.media_category_data = that.media_category_data.concat(data.dataList);
                    that.media_category_title.total = data.total;
                    that.media_favorite_map = data.favoriteMap;
                    // 滚动加载
                    if (data.pageNumber < data.totalPages) {
                        $list.onscroll = () => {
                            if ($list.scrollHeight - ($list.clientHeight + $list.scrollTop) < 100) {
                                $list.onscroll = null;
                                that.get_media_category_list(id, pageNumber + 1);
                            }
                        }
                    }
                }).catch(err => {
                    console.error(err);
                });
            });
        },
        // 媒体收藏列表
        get_media_favorite_list(pageNumber = 1) {
            let that = this;
            that.$nextTick(() => {
                let $list = that.$refs.collection_list;
                if ($list) {
                    $list.onscroll = null;
                }
                if (pageNumber === 1) {
                    that.media_favorite_data = [];
                }
                that.$axios.get('/api/member/favorite_media/list/', {
                    params: {
                        pageSize: 100,
                        pageNumber: pageNumber,
                    }
                }).then(res => {
                    let res_data = res.data;
                    if (res_data.type !== 'success') {
                        return;
                    }
                    let data = res_data.data;
                    that.media_favorite_data = that.media_favorite_data.concat(data.dataList);
                    // 滚动加载
                    if ($list && data.pageNumber < data.totalPages) {
                        $list.onscroll = () => {
                            if ($list.scrollHeight - ($list.clientHeight + $list.scrollTop) < 100) {
                                $list.onscroll = null;
                                that.get_media_favorite_list(pageNumber + 1);
                            }
                        }
                    }
                }).catch(err => {
                    console.error(err);
                });
            });
        },
        // 媒体收藏  isfavorite = 是否收藏
        set_media_favorite(id, isfavorite) {
            let that = this;
            if (!id) {
                return that.$toast('操作失败');
            }
            let api, tip;
            if (isfavorite) {
                api = `/api/member/favorite_media/collect/`;
                tip = '收藏成功';
            } else {
                api = `/api/member/favorite_media/cancel_collect/`;
                tip = '取消成功';
            }
            that.$axios.post(api, {
                mid: id,
            }).then(res => {
                let res_data = res.data;
                if (res_data.type === 'success') {
                    let data = res_data.data;
                    if (isfavorite) {
                        that.$set(that.media_favorite_map, id, data);
                    } else {
                        that.$set(that.media_favorite_map, id, false);
                        // 收藏列表删除数据
                        let index = that.media_favorite_data.findIndex(item => item.id === id);
                        that.media_favorite_data.splice(index, 1);
                    }
                    that.$toast(tip);
                } else {
                    that.$toast('操作失败');
                }
            }).catch(err => {
                console.error(err);
                that.$toast('操作失败');
            });
        },
        // 增加音乐使用次数
        add_media_use(mid) {
            let that = this;
            that.$axios.post('/api/media/use/', { mid: mid, });
        },
        // 点击列表 展开
        selected_try(event) {
            let el = $(event.target);
            if (el.parent('ul.music_list').length === 0) {
                el = el.parents('li');
            }
            el.addClass('play');
            el.siblings().removeClass('play');
        },
        // 分类列表音乐试听
        category_audio_try(item) {
            let that = this;
            if (!item) {
                return;
            }
            let audio = document.querySelector('audio#try_music');
            // 正在试听中
            if (that.try_media_data.id && audio) {
                // 切换音乐
                if (item.id !== that.try_media_data.id) {
                    that.try_media_data.id = item.id;
                    that.try_media_data.src = item.src;
                    audio.src = item.src;
                } else {
                    that.try_media_data.play = true;
                    audio.play();
                }
                return;
            }
            // 创建音频
            audio = new Audio();
            audio.autoplay = true;
            audio.controls = false;
            audio.id = 'try_music';
            audio.style.display = 'none';
            audio.src = item.src;
            document.body.append(audio);
            // 设置播放属性
            that.try_media_data.play = true;
            that.try_media_data.id = item.id;
            that.try_media_data.src = item.src;
            // 音频绑定事件同步数据
            audio.onloadedmetadata = () => {
                that.try_media_data.duration = audio.duration;
            }
            audio.onplay = that.media_play_update;
            audio.onpause = that.media_play_update;
            audio.ontimeupdate = that.media_play_update;
            audio.onended = function () {
                that.init_try_media_data();
            }
        },
        // 试听暂停
        try_paused() {
            let audio = document.querySelector('audio#try_music');
            if (audio) {
                audio.pause();
                this.try_media_data.play = false;
            }
        },
        // 音乐播放时更新
        media_play_update(event) {
            let audio = event.target;
            if (audio) {
                this.try_media_data.currentTime = audio.currentTime;
                this.try_media_data.play = !audio.paused;
            }
        },
        // 分类数据列表返回
        back_media_category() {
            this.media_category_id = null;
            this.init_try_media_data();
        },
        // 音频上传
        input_upload_audio(event) {
            let that = this;
            let $this = event.target;
            that.audio_check_tip = false;
            if ($this.files.length === 0) {
                return that.$toast('请选择音频文件~', 2000);
            }
            let file = $this.files[0];
            that.audio_upload_status = 'loading';
            that.audio_fileinfo.name = file.name;
            that.audio_fileinfo.size = Number(file.size / 1024 / 1024).toFixed(2);
            audio_opt.audio_upload({
                file: file,
                cancel: c => { that.upload_cancel_fn = c; },
                progress: p => { that.audio_fileinfo.progress = p; },
                success: data => {
                    that.audio_upload_status = 'done';
                    that.insert_audio(data, elementlist => {
                        // 保存到我的媒体
                        audio_opt.save_member_media({
                            elementList: elementlist,
                            size: file.size / 1024,
                        });
                    });
                },
                error: err => {
                    that.audio_upload_status = 'init';
                    if (err) {
                        switch (err.message) {
                            case 'cancel':
                                that.$toast('已取消上传~', 2000);
                                break;
                            case 'size':
                                that.$toast('文件大小超出限制~', 2000);
                                that.audio_check_tip = true;
                                break;
                            case 'type':
                                that.$toast('请选择正确音频文件~', 2000);
                                that.audio_check_tip = true;
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
        // 音频素材插入
        audio_material_insert(item) {
            let that = this;
            if (!item || !item.id || !item.src) {
                return;
            }
            that.insert_audio(item.src);
            // 素材增加使用次数
            that.add_media_use(item.id);
        },
        // 插入音频 创建音频元素
        insert_audio(src, callback) {
            let that = this;
            if (src) {
                // 设置背景音乐
                if (that.set_background) {
                    page_opt.set_document_backgroundMusic(that.$parent, {
                        'src': src,
                        'fadeIn': '00:00',
                        'fadeOut': '00:00',
                        'autoplay': true,
                        'loop': false,
                        'hideOnShow': false,
                    });
                    that.$toast('添加背景音乐成功~');
                    // 打开全局设置面板
                    that.$parent.open_theme_modal();
                    return;
                }
                // 插入元素
                let $page = $('.page_contain .edit_page');
                let option = opt_factory.init_opt('audio');
                let $ele;
                // 清除其他元素选中
                that.$parent.ele_cancel_checked();
                // 元素创建
                let param = {
                    id: option.fn.uuid(),
                    src: src,
                    width: 50,
                    height: 50,
                };
                // 生成图表元素
                param = that.$parent.ele_build_before_format(param);
                let ele_html = option.build(param);
                $ele = $(ele_html);
                $page.append($ele);
                // 初始化位置
                option.fit_dom_offset($ele);
                // 选中元素
                that.$parent.set_ele_checked($ele);
                // 关闭弹窗
                that.close_media_panel();
                if (typeof callback === 'function') callback(option.dom_2_ele($ele));
            }
        },
    },
}
</script>

<style lang="less" scoped>
.media_container {
    position: absolute;
    top: 0;
    left: 0;
    width: 0;
    height: 100%;
    z-index: 20;
}

.list_empty {
    position: absolute;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    width: 150px;
    height: 150px;
    margin: auto;
    user-select: none;
    text-align: center;
    img {
        display: block;
        width: 100%;
    }
    p {
        line-height: 20px;
        color: #c9c9c9;
        font-size: 14px;
    }
}

.copyright_modal {
    position: fixed;
    top: -9999px;
    left: -9999px;
    z-index: 21;
    margin: 20px 0 0 20px;
    width: 370px;
    height: 328px;
    padding: 20px;
	background-color: #ffffff;
	box-shadow: 4px 7px 8px 0px rgba(0, 0, 0, 0.11);
	border-radius: 4px;
    border: solid 1px rgba(30, 30, 30, 0.07);
    h1 {
        margin-bottom: 12px;
        text-align: center;
        font-size: 16px;
        font-weight: bold;
        color: #a37f54;
    }
    p {
        line-height: 18px;
        font-size: 12px;
        color: #a37f54;
        text-indent: 2em;
    }
}

.video_outside_guide {
    position: fixed;
    top: -9999px;
    left: -9999px;
    z-index: 21;
    padding: 10px;
    border: solid 1px rgba(0, 0, 0, 0.07);
    border-radius: 4px;
    background-color: #ffffff;
    box-shadow: 6px 6px 7px 0px rgba(0, 0, 0, 0.11);
    &.show {
        top: 170px;
        left: 300px;
    }
    &::before {
        content: "";
        position: absolute;
        top: 205px;
        left: -6px;
        width: 10px;
        height: 10px;
        border: 1px solid rgba(0, 0, 0, 0.07);
        border-top: none;
        border-right: none;
        background-color: #ffffff;
        transform: rotate(45deg);
    }
}

.media_modal_contain {
    position: absolute;
    padding: 12px 0 0 0;
    .paused_icon {
        position: relative;
        display: inline-block;
        width: 20px;
        height: 20px;
        border: solid 1px #818895;
        border-radius: 50%;
        &::before {
            content: "";
            position: absolute;
            top: 4px;
            left: 6px;
            width: 0;
            height: 0;
            border-left: 7px solid #8dbefb;
            border-top: 5px solid transparent;
            border-right: 7px solid transparent;
            border-bottom: 5px solid transparent;
        }
    }
    .play_icon {
        position: relative;
        display: inline-block;
        width: 20px;
        height: 20px;
        border-radius: 50%;
        background-color: var(--mainColor);
        &::before {
            content: "";
            position: absolute;
            top: 6px;
            left: 6px;
            width: 2px;
            height: 8px;
            border: 3px solid #ffffff;
            border-top-width: 0;
            border-bottom-width: 0;
        }
    }
}

.side_panel_head {
    margin: 0 12px;
    .title {
        height: 35px;
        line-height: 30px;
        color: #3c4252;
        font-size: 12px;
        i {
            margin: 0 10px 1px 0;
        }
    }
    .close {
        position: absolute;
        right: 12px;
        width: 30px;
        height: 30px;
        top: 14px;
        text-align: center;
        transform: scale(0.8);
        transition: all 0.3s;
        &:hover {
            transform: rotate(180deg) scale(0.8);
        }
    }
}

.side_panel_body {
    width: 100%;
    height: calc(~"100% - 35px");
    padding: 8px 12px 12px;
    overflow-y: auto;
    .media_tabbar {
        width: 100%;
        height: 26px;
        line-height: 24px;
        text-align: center;
        border-bottom: 1px solid #d8deea;
        font-size: 0;
        .item {
            display: inline-block;
            vertical-align: middle;
            padding: 0 3px;
            margin-right: 30px;
            border-bottom: 2px solid transparent;
            color: #545f72;
            font-size: 12px;
            &:last-child {
                margin-right: 0;
            }
            &.checked {
                color: var(--mainColor);
                border-bottom-color: var(--mainColor);
                &:hover {
                    opacity: 1;
                }
            }
        }
    }
}
.tabbar_panel {
    position: relative;
    height: calc(~"100% - 26px");
    .video_ornament {
        width: 100%;
        height: 220px;
        padding: 63px 50px 52px 50px;
        background: url('../../../assets/pc/images/common/video_bg.png') no-repeat center bottom;
        .video_ornament_preview {
            width: 100%;
            height: 100%;
            &:empty {
                background-image: url('../../../assets/pc/images/common/video_preview_bg.png');
            }
        }
    }
    .media_link_wrapper {
        margin-top: 10px;
        .media_link_guide {
            height: 20px;
            margin-bottom: 8px;
            font-size: 12px;
            color: #5e6368;
            span {
                display: inline-block;
                vertical-align: middle;
                line-height: 20px;
            }
            .guide {
                float: right;
                height: 20px;
                color: #aad2ff;
                cursor: pointer;
                span {
                    margin-right: 2px;
                }
                &:hover {
                    color: var(--mainColor);
                }
            }
        }
        .media_link_input {
            display: block;
            width: 100%;
            height: 36px;
            padding: 4px 8px;
            border: solid 1px #e0e2e5;
            font-size: 12px;
            border-radius: 2px;
            background-color: #ffffff;
            box-shadow: 0px 3px 3px 0px rgba(67, 67, 67, 0.07);
            transition: all 0.2s;
            &:focus {
                border-color: var(--mainColor);
            }
            &::-webkit-input-placeholder {
                color: #b9c1c9;
            }
            &::-moz-placeholder {
                color: #b9c1c9;
            }
            &::-ms-input-placeholder {
                color: #b9c1c9;
            }
        }
        .media_link_tips {
            margin-top: 5px;
            line-height: 18px;
            font-size: 12px;
            color: #9ca6b2;
            text-align: left;
            a {
                color: var(--mainColor);
            }
        }
    }
    .media_upload_wrapper {
        padding-top: 20px;
        .media_upload_container {
            width: 100%;
            height: 170px;
            background-color: #f4f6f9;
        }
        input[type="file"] {
            display: none;
        }
        .upload_init {
            display: block;
            width: 100%;
            height: 100%;
            padding: 28px 28px 12px;
            text-align: center;
            cursor: pointer;
            &:hover {
                .edit-ico,
                .icon_text {
                    opacity: 0.8;
                }
            }
            .icon_text {
                margin-bottom: 45px;
                color: var(--mainColor);
                font-size: 14px;
            }
            .upload_tips {
                line-height: 18px;
                font-size: 12px;
                color: #abb0ba;
                &.alert {
                    color: #fb3838;
                }
            }
        }
        .uploading {
            width: 100%;
            height: 100%;
            padding: 28px 12px 12px;
            font-size: 12px;
            .item {
                width: 100%;
                line-height: 18px;
                overflow: hidden;
                margin-bottom: 15px;
                &:last-child {
                    margin-bottom: 0;
                }
            }
            .name {
                float: left;
                width: calc(~"100% - 3em");
                overflow: hidden;
                text-overflow: ellipsis;
                white-space: nowrap;
                color: #50555e;
                text-align: left;
            }
            .progress_text {
                float: right;
                width: 3em;
                color: var(--mainColor);
                text-align: right;
            }
            .progress {
                width: 100%;
                height: 6px;
                margin-bottom: 72px;
                background-color: #ffffff;
                border-radius: 3px;
                i {
                    display: block;
                    width: 0;
                    height: 100%;
                    background-color: var(--mainColor);
	                border-radius: 3px;
                }
            }
            .state {
                float: left;
                margin-right: 5px;
                color: #929ba9;
                line-height: 16px;
                i.edit-ico,
                span {
                    display: inline-block;
                    vertical-align: middle;
                }
                i.edit-ico {
                    margin-right: 4px;
                }
            }
            .cancel {
                float: left;
                color: var(--mainColor);
            }
            .size {
                float: right;
                color: #929ba9;
            }
            .re {
                float: right;
                color: #646c7a;
                text-decoration: underline;
                label {
                    cursor: pointer;
                }
            }
        }
    }
    .recommend_list {
        padding-top: 15px;
        li {
            position: relative;
            width: 100%;
            height: 90px;
            border-radius: 4px;
            overflow: hidden;
            cursor: pointer;
            &::after {
                content: "";
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                z-index: 1;
                background-color: rgba(0, 0, 0, 0.5);
                transition: background 0.2s;
            }
            &:hover {
                &::after {
                    background-color: rgba(0, 0, 0, 0);
                }
            }
            & + li {
                margin: 10px 0;
            }
            .background {
                width: 100%;
                height: 100%;
                object-fit: cover;
            }
            i {
                position: absolute;
                top: 0;
                left: 0;
                z-index: 2;
                width: 26px;
                height: 26px;
                background: #1a1c1f url('../../../assets/pc/images/common/user_info_bg.png') no-repeat -72px -72px;
                border-radius: 4px;
            }
            .name {
                position: absolute;
                top: 50%;
                left: 0;
                z-index: 2;
                width: 100%;
                line-height: 36px;
                margin-top: -18px;
                font-size: 18px;
                color: #ffffff;
                text-align: center;
                overflow: hidden;
                text-overflow: ellipsis;
                white-space: nowrap;
            }
            .total {
                position: absolute;
                bottom: 10px;
                right: 10px;
                z-index: 2;
                font-size: 12px;
                color: #ffffff;
                opacity: 0.5;
            }
        }
    }
    .music_list {
        margin: 0 -12px -12px;
        height: calc(~"100% + 12px");
        overflow-y: auto;
    }
}
.bottom_btn {
    display: block;
    width: 100%;
    height: 45px;
    margin-top: 15px;
    line-height: 43px;
    border-radius: 4px;
    font-size: 14px;
    text-align: center;
    border: 1px solid transparent;
    &:first-of-type {
        margin-top: 50px;
    }
    &.disable {
        background-color: #e4e5ea !important;
        border-color: #e4e5ea !important;
        color: #969daf !important;
        cursor: no-drop !important;
        &:hover {
            opacity: 1 !important;
        }
    }
    &.insert_btn {
        background-color: var(--mainColor);
        border: solid 1px var(--mainColor);
        color: #ffffff;
    }
}

.recommend_detail_panel {
    position: absolute;
    top: 47px;
    left: 0;
    z-index: 3;
    width: 100%;
    height: calc(~"100% - 35px");
    padding-top: 8px;
    overflow: hidden;
    background-color: #ffffff;
    .head {
        margin: 0 12px;
        padding-bottom: 5px;
        line-height: 18px;
        border-bottom: 1px solid #d8deea;
        font-size: 12px;
        .back {
            display: inline-block;
            vertical-align: middle;
            width: 3em;
            color: #50555e;
        }
        .name {
            display: inline-block;
            vertical-align: middle;
            width: calc(~"100% - 3em");
            text-align: right;
            color: #8f97a4;
            span {
                color: #222222;
            }
        }
    }
    .music_list {
        width: 100%;
        height: calc(~"100% - 38px");
        overflow-y: auto;
    }
}
.music_list {
    padding-top: 10px;
    li {
        position: relative;
        width: 100%;
        height: 52px;
        padding: 8px 12px 0;
        background-color: transparent;
        transition: all 0.2s;
        &:last-child {
            margin-bottom: 8px;
        }
        &:hover {
            background-color: #f3f5f7;
            .paused_icon {
                border-color: var(--mainColor);
                background-color: var(--mainColor);
                &::before {
                    border-left-color: #ffffff;
                }
            }
            .copyright {
                display: block;
            }
        }
        &.play {
            height: 90px;
            background-color: #f3f5f7;
            .copyright,
            .progress,
            .current_time,
            .insert {
                display: block;
            }
            .total_time {
                left: 245px;
            }
        }
        .copyright,
        .progress,
        .current_time,
        .insert {
            display: none;
        }
        .paused_icon,
        .play_icon {
            position: absolute;
            top: 8px;
            left: 12px;
        }
        .name {
            position: absolute;
            top: 8px;
            left: 48px;
            right: 60px;
            line-height: 14px;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
            font-size: 12px;
            color: #50555e;
        }
        .total_time,
        .current_time {
            position: absolute;
            top: 30px;
            left: 48px;
            line-height: 14px;
            font-size: 12px;
            color: #a6b1c4;
        }
        .progress {
            position: absolute;
            top: 36px;
            left: 90px;
            right: 60px;
            height: 4px;
            background-color: #d5dbe1;
            border-radius: 2px;
            i {
                display: block;
                width: 0;
                height: 100%;
                border-radius: 2px;
                background-color: var(--mainColor);
            }
        }
        .copyright,
        .collection {
            position: absolute;
            top: 4px;
            right: 42px;
            width: 20px;
            height: 20px;
            line-height: 20px;
            text-align: center;
            cursor: pointer;
            &::before {
                content: "";
                display: inline-block;
                vertical-align: middle;
                width: 0;
                height: 100%;
            }
            .edit-ico {
                display: inline-block;
                vertical-align: middle;
            }
        }
        .collection {
            right: 10px;
        }
        .insert {
            position: absolute;
            bottom: 10px;
            left: 48px;
            right: 12px;
            height: 24px;
            line-height: 24px;
            background-color: #ffffff;
            border-radius: 2px;
            font-size: 12px;
            color: var(--mainColor);
            text-align: center;
        }
    }
}
</style>