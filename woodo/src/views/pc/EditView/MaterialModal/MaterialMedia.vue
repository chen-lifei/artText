<template>
    <!-- 媒体库 -->
    <div class="media-material">
        <div class="material-header">
            <div class="material-back" @click="back">
                <base-icon class="iconfanhuizhuomian"></base-icon>
                <span>返回桌面</span>
            </div>
        </div>
        <div class="material-body">
            <div class="media_contain_left">
                <div class="material-group">
                    <span class="title">媒体库</span>
                    <ul>
                        <li :class="{current: open_media_status === 'video'}" @click="open_media_panel('video')">
                            <div class="icon">
                                <base-icon class="iconshipin"></base-icon>
                            </div>
                            <span>插入视频</span>
                            <base-icon class="iconxiala"></base-icon>
                        </li>
                        <li :class="{current: open_media_status === 'audio'}" @click="open_media_panel('audio')">
                            <div class="icon">
                                <base-icon class="iconyinpin"></base-icon>
                            </div>
                            <span>插入音频</span>
                            <base-icon class="iconxiala"></base-icon>
                        </li>
                    </ul>
                </div>
                <local-upload-button @uploadOver="close_modal()" :setBackground="set_background"></local-upload-button>
            </div>
            <div class="media_contain_right">
                <div class="video-panel" v-show="open_media_status === 'video'">
                    <div class="tabbar-panel">
                        <div class="exp-head">
                            <span class="title">粘贴视频网址代码</span>
                            <div class="course" @mouseenter="show_video_guide" @mouseleave="hide_video_guide">
                                <base-icon class="iconwenhao"></base-icon>
                                <span>教程参考</span>
                            </div>
                        </div>
                        <div class="link-group">
                            <input type="text" class="link-input" placeholder="在此粘贴视频地址或链接" v-model="video_link" @input="input_video_link">
                            <input type="button" class="add-video-btn" :class="{'disable': !insert_video_link}" @click="insert_video()" value="插入视频">
                        </div>
                        <div class="exp-bottom">
                            <p>1、抖音、快手等APP需保存视频到本地后再上传；</p>
                            <p>2、支持大部分PC端视频网站的链接引用；</p>
                            <span>* 请注意：未经许可在网上使用他人的视频可能会冒犯他人，甚至导致侵权。（<a href="https://www.woodo.cn/slides/?url=6564086780" target="_blank">免责声明</a>）</span>
                        </div>
                    </div>
                    <!-- 视频链接指引 -->
                    <div class="video_outside_guide" ref="video_outside_guide">
                        <img src="../../../../assets/pc/images/common/video_outside_guide.png" alt="">
                    </div>
                </div>
                <div class="audio-panel" v-show="open_media_status === 'audio'">
                    <!-- 热门推荐列表 -->
                    <div class="tabbar-panel" v-if="!media_category_id">
                        <ul class="recommend-list">
                            <li v-for="item in media_data" :key="item.id" @click="get_media_category_list(item.id)">
                                <img :src="item.image" class="background" />
                                <div class="name">{{ item.name }}</div>
                            </li>
                            <!-- 占位 -->
                            <li class="seat" v-for="i in 6" :key="i"></li>
                        </ul>
                    </div>

                    <!-- 热门推荐列表详情 -->
                    <div class="recommend-detail-panel" v-if="media_category_id">
                        <div class="recommend-detail-head">
                            <div class="back-first" @click="back_media_category">
                                <base-icon class="iconjiantou"></base-icon>
                                <span class="name">{{ media_category_title.name }}</span>
                            </div>
                        </div>
                        <ul class="music_list" ref="recommend_list">
                            <li v-for="(item, index) in media_category_data" :key="index" @click="audio_material_insert(item)">
                                <!-- 收藏 -->
                                <div :class="['collection', {current: media_favorite_map[item.id]}]" :title="media_favorite_map[item.id] ? '取消收藏' : '加入收藏'" @click.stop="set_media_favorite(item.id, !media_favorite_map[item.id])">
                                    <base-icon class="iconshoucang"></base-icon>
                                </div>

                                <div class="info-group">
                                    <span class="name">{{ item.name }}</span>
                                    <!-- 版权说明 -->
                                    <a href="javascript:;" class="copyright" @mouseenter="show_copyright" @mouseleave="hide_copyright">
                                        <base-icon class="iconbanquantishi"></base-icon>
                                    </a>
                                </div>

                                <div class="play-group">
                                    <!-- 暂停按钮 -->
                                    <div class="paused-btn" title="暂停" v-if="try_media_data.id === item.id && try_media_data.play" @click.stop="try_paused">
                                        <base-icon class="iconzanting1"></base-icon>
                                    </div>
                                    <!-- 播放按钮 -->
                                    <div class="play-btn" title="播放" v-else @click.stop="category_audio_try(item)">
                                        <base-icon class="iconbofang1"></base-icon>
                                    </div>
                                    <span class="current-time">{{ try_media_data.id === item.id ? update_current_time : '00:00' }}</span>
                                    <div class="progress">
                                        <i :style="{'width': `${ try_media_data.id === item.id ? update_time_progress : 0 }%`}"></i>
                                    </div>
                                    <span class="total-time">{{ try_media_data.id === item.id ? minute_format(try_media_data.duration) : minute_format(item.duration) }}</span>
                                </div>
                            </li>
                            <!-- 占位 -->
                            <li class="seat" v-for="i in 6" :key="i"></li>
                        </ul>
                    </div>

                    <!-- 媒体版权信息弹窗（因为侧边栏弹窗 overflow：hidden） -->
                    <div class="copyright_modal" ref="copyright_modal">
                        <h1>版权声明</h1>
                        <p>吾道幻灯片推荐的音频文件来源于第三方分享者，其版权归原创作者拥有。若作为商业用途，请获取模板原作者授权或替换相应素材，请谨慎使用，吾道幻灯片不承担由此引发的一切版权纠纷。</p>
                        <p>对于用户在使用吾道幻灯片平台服务过程中自行上传的素材和作品，吾道幻灯片不具备审查其内容是否存在侵权等情节的能力。用户自行上传和使用素材等内容应遵守相关法律、法规，不得侵犯本网站及权利人的合法权利，情节严重者将依法追究其法律责任，吾道幻灯片不承担出现权利纠纷时的任何责任。</p>
                        <p>吾道幻灯片尊重知识产权，如知识产权权利人认为平台内容（包括但不限于用户自行上传分享的内容）涉嫌侵权，可通过邮件：bd@500d.me提出书面通知，我们将及时处理。</p>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import opt_factory from '@/assets/pc/js/opt/opt_factory.js';
import page_opt from '@/assets/pc/js/opt/page_opt.js';
import LocalUploadButton from '@/views/pc/EditView/MaterialModal/LocalUploadButton.vue';

export default {
    name: 'MediaPanel',
    inject: ['EditView'],
    components:{
        LocalUploadButton
    },
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

            // 音频类
            audio_tabbar: 'recommend',          // 音频面板显示类型  recommend = 热门推荐  collection = 我的收藏  upload = 上传
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
            if(obj) opt = Object.assign(opt, obj);
            let that = this;
            that.video_tabbar = 'link';
            that.audio_tabbar = 'recommend';
            // 音频加载推荐音乐
            if (status === 'audio') {
                that.get_media_category();
            }
            that.open_media_status = status;
            // 重置背景
            that.set_background = opt.setBGM;
            // 重置面板设置
            that.init_panel();
        },
        close_media_panel(callback) {
            this.set_background = false;
            this.init_try_media_data();
            this.close_modal();
            this.$nextTick(() => {
                setTimeout(() => {
                    if (typeof callback === 'function') callback();
                }, 300);
            });
        },
        // 返回
        back() {
            this.$emit('back');
        },
        close_modal() {
            this.$emit('close_modal');
        },
        // 初始化面板
        init_panel() {
            // 视频
            this.video_link = '';
            this.insert_video_link = false;
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
        // 链接输入
        input_video_link() {
            let that = this;
            let value = that.video_link;
            that.insert_video_link = !$validate(value).null();
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
            } else if (that.video_tabbar === 'upload') {// 上传视频插入校验
                // 上传进度
                if (that.video_upload_status !== 'done' || !src) return;
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
            // 关闭弹窗
            that.close_media_panel();
        },
        // 显示复制视频链接指引
        show_video_guide(event) {
            let el = $(event.target);
            let offset = el.offset();
            offset.top += el.height() + 10;
            offset.left -= $(this.$refs.video_outside_guide).width() - el.width();
            $(this.$refs.video_outside_guide).css(offset);
        },
        hide_video_guide() {
            $(this.$refs.video_outside_guide).removeAttr('style');
        },


        /* -------------------------------------音频----------------------------------------- */
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
        // 音频素材插入
        audio_material_insert(item) {
            let that = this;
            if (!item || !item.id || !item.src) {
                return;
            }
            that.insert_audio(item.src, that.close_modal);
            // 素材增加使用次数
            that.add_media_use(item.id);
        },
        // 插入音频 创建音频元素
        insert_audio(src, callback) {
            let that = this;
            if (src) {
                // 设置背景音乐
                if (that.set_background) {
                    page_opt.set_document_backgroundMusic(that.EditView, {
                        'src': src,
                        'fadeIn': '00:00',
                        'fadeOut': '00:00',
                        'autoplay': true,
                        'loop': false,
                        'hideOnShow': false,
                    });
                    that.$toast('添加背景音乐成功~');
                    // 打开全局设置面板
                    that.EditView.open_theme_modal();
                    // 关闭弹窗
                    that.close_media_panel();
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
                // 关闭弹窗
                that.close_media_panel();
                if (typeof callback === 'function') callback(option.dom_2_ele($ele));
            }
        },
    },
}
</script>

<style lang="less" scoped>
.media-material {
    width: calc(5 / 12 * 100vw);
    height: calc(55 / 192 * 100vw);
    min-width: 800px;
    min-height: 550px;
    background: #ffffff;
    border: 1px solid #eeeeee;
    border-radius: 11px;
    box-shadow: 0px 2px 50px 0px rgba(180, 187, 199, 0.4);
    .material-header {
        display: flex;
        align-items: center;
        width: 100%;
        height: 50px;
        .material-back {
            margin-left: 20px;
            display: flex;
            align-items: center;
            color: #666666;
            cursor: pointer;
            &:hover {
                color: #333333;
            }
            span {
                margin-left: 10px;
                font-size: 12px;
                font-weight: 400;
            }
        }
    }
    .material-body {
        display: flex;
        width: 100%;
        height: calc(100% - 50px);
        border-top: 1px solid #eeeeee;
        box-sizing: border-box;

        .media_contain_left {
            display: flex;
            flex-direction: column;
            align-items: center;
            width: 194px;
            height: 100%;
            border-right: 1px solid #eeeeee;

            .material-group {
                padding-top: 20px;
                width: 100%;
                .title {
                    margin-left: 20px;
                    font-size: 12px;
                    font-weight: 300;
                    color: #aaaaaa;
                }
                ul {
                    padding-top: 5px;
                    width: 100%;
                    li {
                        margin: 1px auto;
                        display: flex;
                        align-items: center;
                        width: 176px;
                        height: 38px;
                        border-radius: 5px;
                        cursor: pointer;

                        &:hover {
                            background: #fafafa;
                        }

                        &.current {
                            background: var(--mainColor);
                            .icon{
                                background: #227bff;
                            }
                            span {
                                color: #ffffff;
                            }
                            > .base-icon {
                                color: #ffffff;
                            }
                        }

                        .icon {
                            margin: 0 11px;
                            width: 24px;
                            height: 24px;
                            line-height: 24px;
                            text-align: center;
                            border-radius: 5px;
                            color: #ffffff;
                            background: #0699ff;
                            > .base-icon {
                                font-size: 12px;
                            }
                        }

                        span {
                            font-size: 12px;
                            font-weight: 400;
                            color: #111111;
                        }

                        > .base-icon {
                            margin-left: auto;
                            margin-right: 10px;
                            font-size: 12px;
                            color: #999999;
                        }
                    }
                }
            }
            .local-upload-button {
                margin-top: auto;
                margin-bottom: 20px;
            }
        }
        .media_contain_right {
            flex: 1;

            // 音频
            .audio-panel {
                width: 100%;
                height: 100%;
                .tabbar-panel {
                    height: 100%;
                    overflow: auto;
                    .recommend-list {
                        padding: 15px;
                        display: flex;
                        justify-content: space-around;
                        flex-wrap: wrap;
                        > li {
                            margin: 5px;
                            position: relative;
                            display: flex;
                            align-items: center;
                            flex: 1;
                            min-width: 272px;
                            max-width: 400px;
                            height: 90px;
                            border-radius: 4px;
                            overflow: hidden;
                            cursor: pointer;

                            img {
                                width: 100%;
                                height: 100%;
                                object-fit: cover;
                            }
                            .name {
                                position: absolute;
                                top: 0;
                                left: 0;
                                z-index: 2;
                                display: flex;
                                align-items: center;
                                justify-content: center;
                                width: 100%;
                                height: 100%;
                                font-size: 18px;
                                color: #ffffff;
                                overflow: hidden;
                                text-overflow: ellipsis;
                                white-space: nowrap;
                            }
                            &::after {
                                content: '';
                                position: absolute;
                                top: 0;
                                left: 0;
                                right: 0;
                                bottom: 0;
                                z-index: 1;
                                background-color: rgba(0, 0, 0, 0.5);
                                transition: 0.2s;
                            }
                            &:hover {
                                &::after {
                                    background-color: rgba(0, 0, 0, 0);
                                }
                            }

                            // 占位
                            &.seat {
                                margin-top: 0;
                                margin-bottom: 0;
                                height: 0;
                            }
                        }
                    }
                }
                .recommend-detail-panel {
                    width: 100%;
                    height: 100%;

                    .recommend-detail-head {
                        display: flex;
                        align-items: center;
                        width: 100%;
                        height: 46px;
                        .back-first {
                            margin-left: 30px;
                            display: flex;
                            align-items: center;
                            color: #666666;
                            cursor: pointer;
                            &:hover {
                                color: #333333;
                            }
                            span {
                                margin-left: 10px;
                                font-size: 12px;
                            }
                        }
                    }
                    .music_list {
                        padding: 0 18px;
                        display: flex;
                        flex-wrap: wrap;
                        justify-content: space-between;
                        width: 100%;
                        height: calc(100% - 46px);
                        overflow: auto;
                        li {
                            margin: 10px;
                            position: relative;
                            flex: 1;
                            max-width: 400px;
                            min-width: 260px;
                            height: 90px;
                            background: #fafafa;
                            transition: 0.2s;
                            cursor: pointer;
                            &:hover {
                                background: #f4f4f4;
                                .collection {
                                    visibility: visible;
                                }
                            }
                            .collection {
                                position: absolute;
                                top: 5px;
                                right: 5px;
                                display: flex;
                                width: 20px;
                                height: 20px;
                                background: rgba(0, 0, 0, 0.5);
                                border-radius: 5px;
                                visibility: hidden;
                                &:hover {
                                    background: rgba(0, 0, 0, 0.8);
                                }

                                .base-icon {
                                    margin: auto;
                                    color: #ffffff;
                                }
                                &.current .base-icon {
                                    color: #f7b500;
                                }
                            }
                            .info-group {
                                padding: 20px;
                                display: flex;
                                width: 100%;
                                font-size: 12px;
                                color: #333333;
                                .copyright {
                                    margin-left: 5px;
                                    display: flex;
                                    color: #666666;
                                    .base-icon {
                                        margin: auto;
                                    }
                                }
                            }
                            .play-group {
                                padding: 0 20px;
                                display: flex;
                                align-items: center;

                                .paused-btn,
                                .play-btn {
                                    display: flex;
                                    margin-right: 5px;
                                    width: 20px;
                                    height: 20px;
                                    border-radius: 50%;
                                    color: #ffffff;
                                    background: #444444;
                                    &:hover {
                                        background: var(--mainColor);
                                    }
                                    .base-icon {
                                        margin: auto;
                                        font-size: 12px;
                                        transform: scale(0.8);
                                    }
                                }
                                .play-btn .base-icon {
                                    transform: scale(0.8) translate(1px, 1px);
                                }

                                .current-time,
                                .total-time {
                                    font-size: 12px;
                                    color: #444444;
                                }
                                .progress {
                                    margin: 0 10px;
                                    width: 120px;
                                    height: 2px;
                                    background: #cccccc;
                                    i {
                                        display: block;
                                        width: 0;
                                        height: 100%;
                                        background: var(--mainColor);
                                    }
                                }
                            }
                            // 占位
                            &.seat {
                                margin-top: 0;
                                margin-bottom: 0;
                                height: 0;
                            }
                        }
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
            }

            // 视频
            .video-panel {
                width: 100%;
                height: 100%;
                .tabbar-panel {
                    padding: 40px 60px;
                    .exp-head {
                        display: flex;
                        justify-content: space-between;
                        width: 100%;
                        .title {
                            font-size: 12px;
                            color: #333333;
                        }
                        .course {
                            display: flex;
                            align-items: center;
                            color: #999999;
                            cursor: pointer;
                            &:hover {
                                color: #333333;
                            }
                            span {
                                margin-left: 5px;
                                font-size: 12px;
                            }
                        }
                    }
                    .link-group {
                        margin-top: 10px;
                        display: flex;
                        width: 100%;
                        height: 48px;
                        background: #ffffff;
                        border: 1px solid #eeeeee;
                        border-radius: 6px;

                        .link-input {
                            flex: 1;
                            padding: 15px 20px;
                            font-size: 12px;
                            color: #999999;
                        }

                        .add-video-btn {
                            width: 100px;
                            height: 48px;
                            font-size: 14px;
                            color: #ffffff;
                            background: var(--mainColor);
                            border-radius: 5px;
                            cursor: pointer;
                            &:hover {
                                background: #004dd0;
                            }
                            &.disable {
                                color: #666666;
                                background: #eeeeee;
                                cursor: no-drop;
                            }
                        }
                    }
                    .exp-bottom {
                        margin-top: 20px;
                        p {
                            font-size: 14px;
                            color: #666666;
                            margin-bottom: 5px;
                        }
                        span {
                            margin-top: 15px;
                            display: block;
                            font-size: 12px;
                            color: #999999;
                            a {
                                font-size: 12px;
                                color: #999999;
                            }
                        }
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
                }
            }
        }
    }

    .upload-media-status {
        position: fixed;
        left: 50%;
        bottom: 100px;
        transform: translateX(-50%);

        .upload-loading {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            display: flex;
            justify-content: center;
            align-items: center;
            width: 184px;
            height: 44px;
            background: #444444;
            border-radius: 22px;
            box-shadow: 0px 2px 50px 0px rgba(180, 187, 199, 0.4);
            .icon {
                display: flex;
                width: 20px;
                height: 20px;
                color: #ffffff;
                border-radius: 50%;
                .base-icon {
                    margin: auto;
                    font-size: 18px;
                }
            }
            span {
                margin-left: 10px;
                font-size: 12px;
                color: #ffffff;
                &.name {
                    display: inline-block;
                    width: 74px;
                    overflow: hidden;
                    text-overflow: ellipsis;
                    white-space: nowrap;
                }
            }
        }
        .upload-done {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            display: flex;
            justify-content: center;
            align-items: center;
            width: 122px;
            height: 44px;
            background: #444444;
            border-radius: 22px;
            box-shadow: 0px 2px 50px 0px rgba(180, 187, 199, 0.4);
            .icon {
                display: flex;
                width: 20px;
                height: 20px;
                background: #ffffff;
                color: #444444;
                border-radius: 50%;
                .base-icon {
                    margin: auto;
                }
            }
            span {
                margin-left: 10px;
                font-size: 12px;
                color: #ffffff;
            }
        }
    }
}
</style>