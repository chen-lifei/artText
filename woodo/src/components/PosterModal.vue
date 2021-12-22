<template>
	<transition name="modal-fade">
        <div class="modal-backdrop" v-if="isshow" @click="close">
            <div class="poster_modal" :class="poster_type" @click.stop>
                <div class="poster_content">
                    <div class="in_create">正在生成图片</div>
                    <img class="poster_booth" :src="poster_src" />
                </div>
                <p class="poster_tips" v-if="poster_type === 'wap'"># 长按图片保存至手机后发朋友圈分享给好友 #</p>
                <p class="poster_tips" v-else>您的文档海报已生成，请保存至本地后分享到朋友圈</p>
                <a href="javascript:void(0);" class="download_button" @click="download_poster">点击下载</a>
                <div v-show="false">
                    <div v-if="poster_type === 'wap'">
                        <img ref="poster_backimg" src="../assets/wap/images/common/poster.png" width="680" height="903" alt="海报背景" />
                        <img ref="poster_cover" alt="海报封面" />
                        <img ref="poster_userphoto" :src="user.photo" width="64" height="64" alt="海报用户头像" />
                        <img ref="poster_qrcode" :src="qrcode_url" width="200" height="200" alt="海报二维码" />
                    </div>
                    <div v-else>
                        <img ref="poster_backimg" src="../assets/pc/images/common/poster.png" width="410" height="610" alt="海报背景" />
                        <img ref="poster_cover" alt="海报封面" />
                        <img ref="poster_userphoto" :src="user.photo" width="50" height="50" alt="海报用户头像" />
                        <img ref="poster_qrcode" :src="qrcode_url" width="180" height="180" alt="海报二维码" />
                    </div>
                </div>
            </div>
        </div>
    </transition>
</template>

<script>
export default {
    name: "PosterModal",
    props: {
        poster_type: String,
        document_type: {
            type: String,
            default: 'slides',
        },
        document_info: Object,
        document_pages: {
            type: Array,
            default() {
                return [];
            },
        },
        qrcode_url: String,
        author: String,
    },
    data() {
        return {
            user: {},
            isshow: false,
            poster_src: '',
        }
    },
    methods: {
        show() {
            let that = this;
            that.isshow = true;
            that.user = that.$common.get_login_state();
            that.$nextTick(() => {
                that.create_poster();
            });
        },
        // 关闭海报弹窗，恢复到分享弹窗
        close() {
            this.poster_src = '';
            this.isshow = false;
            this.$emit('close');
        },
        // 生成海报
        create_poster() {
            let that = this;
            // 加载头像
            that.user_head_change(() => {
                let $cover = that.$refs.poster_cover;
                // 作品 模板 有封面则用封面渲染
                if (['template', 'works', 'h5'].indexOf(that.document_type) >= 0) {
                    that.build_image_cover(() => {
                        that.build_document_cover(() => {
                            that.draw_poster();
                        });
                    });
                    return;
                }
                // 文档生成封面图
                that.build_document_cover(() => {
                    that.draw_poster();
                });
            });
        },
        // 封面图生成海报
        build_image_cover: function (err, success) {
            let that = this;
            if (!that.document_info.image) {
                if (typeof err === 'function') err();
                return;
            }
            let $cover = that.$refs.poster_cover;
            let img = new Image();
            // 加载封面图并开始绘制海报
            img.src = utils.getImageProxyUrl(that.document_info.image);
            img.onload = () => {
                $cover.src = img.src;
                $cover.onload = () => {
                    that.draw_poster();
                    if (typeof success === 'function') success();
                }
                $cover.onerror = () => {
                    if (typeof err === 'function') err();
                }
            };
            img.onerror = (err) => {
                if (typeof err === 'function') err();
            };
        },
        // 前端方法生成封面
        build_document_cover: function (err, success) {
            let that = this;
            let $cover = that.$refs.poster_cover;
            let page_html = that.$common.obj_2_svg(that.document_info, that.document_pages[0]);
            let to_base64 = that.$common.svg_2_base64(page_html, false);
            to_base64.then((res) => {
                $cover.src = res;
                $cover.onload = () => {
                    that.draw_poster();
                    if (typeof success === 'function') success();
                };
                $cover.onerror = () => {
                    if (typeof err === 'function') err();
                }
            }).catch((err) => {
                if (typeof err === 'function') err();
            });
        },
        // 绘制海报，需保证所有资源加载的资源在页面打开时已加载完
        draw_poster() {
            let that = this;
            let iswap = that.poster_type === 'wap';
            that.$common.custom_create_poster({
                posterBackground: that.$refs.poster_backimg,
                draw: (ctx, canvas) => {
                    if (iswap) {
                        // 保存画布默认绘制设置
                        ctx.save();
                        // 绘制头像
                        let $photo = that.$refs.poster_userphoto;
                        ctx.beginPath();
                        ctx.strokeStyle = '#ffffff';
                        ctx.arc(55 + $photo.width / 2, 38 + $photo.height / 2, 32, 0, Math.PI * 2);
                        ctx.stroke();
                        ctx.clip();
                        ctx.drawImage($photo, 55, 38, $photo.width, $photo.height);
                        ctx.restore();
                        // 绘制名称
                        let name = that.user.name || `吾道幻灯片用户`;
                        ctx.font = 'normal normal bold 25px normal';
                        ctx.textAlign = 'left';
                        ctx.fillStyle = '#000000';
                        ctx.textBaseline = 'top';
                        ctx.fillText(name, 135, 42);
                        // 标题
                        let title = `  向你推荐了一个幻灯片`;
                        ctx.font = 'normal normal normal 25px normal';
                        ctx.textAlign = 'left';
                        ctx.fillStyle = '#000000';
                        ctx.textBaseline = 'top';
                        ctx.fillText(title, 135 + Math.ceil(ctx.measureText(name).width), 42);
                        // 描述信息
                        let info = `由${that.author}创建 / 共${that.document_pages.length}页`;
                        ctx.font = 'normal normal normal 17px microsoft yahei';
                        ctx.textAlign = 'left';
                        ctx.fillStyle = '#5f656d';
                        ctx.textBaseline = 'top';
                        ctx.fillText(info, 135, 80);
                        // 绘制封面
                        let $cover = that.$refs.poster_cover;
                        let w = $cover.width;
                        let h = $cover.height;
                        let common_ratio = 16 / 9;
                        let cover_size_ratio = w / h;
                        let cover_init_h = 360;
                        let cover_init_w = common_ratio * cover_init_h;
                        if (cover_size_ratio > common_ratio) {
                            cover_init_w = 640;
                            cover_init_h = cover_init_w / cover_size_ratio;
                        } else if (cover_size_ratio < common_ratio) {
                            cover_init_w = cover_size_ratio * cover_init_h;
                        }
                        ctx.drawImage($cover, (canvas.width - cover_init_w) / 2, 506 - cover_init_h, cover_init_w, cover_init_h);
                        let $qrcode = that.$refs.poster_qrcode;
                        // 绘制二维码
                        ctx.drawImage($qrcode, canvas.width / 2 - $qrcode.width / 2, 585, $qrcode.width, $qrcode.height);
                    } else {
                        // 先保存画布绘制设置
                        ctx.save();
                        // 绘制头像
                        let $photo = that.$refs.poster_userphoto;
                        ctx.beginPath();
                        ctx.strokeStyle = '#ffffff';
                        ctx.arc(49, 49, $photo.width / 2, 0, Math.PI * 2);
                        ctx.stroke();
                        ctx.clip();
                        ctx.drawImage($photo, 24, 24, $photo.width, $photo.height);
                        ctx.restore();
                        // 绘制用户名称
                        let name = that.user.name;
                        ctx.font = 'normal normal bold 16px normal';
                        ctx.textAlign = 'left';
                        ctx.fillStyle = '#000000';
                        ctx.textBaseline = 'top';
                        ctx.fillText(name, 88, 30);
                        // 标题
                        let title = `  向你推荐了一个幻灯片`;
                        ctx.font = 'normal normal normal 16px normal';
                        ctx.fillText(title, 88 + Math.ceil(ctx.measureText(name).width), 30);
                        // 副标题
                        let info = `由${that.author || name}创建 / 共${that.document_pages.length}页`;
                        ctx.font = 'normal normal normal 12px normal';
                        ctx.fillStyle = '#5f656d';
                        ctx.fillText(info, 88, 55);
                        // 绘制二维码
                        let $qrcode = that.$refs.poster_qrcode;
                        ctx.drawImage($qrcode, canvas.width / 2 - $qrcode.width / 2, 330, $qrcode.width, $qrcode.height);
                        // 绘制封面
                        let $cover = that.$refs.poster_cover;
                        if ($cover) {
                            let w = $cover.width;
                            let h = $cover.height;
                            let common_ratio = 16 / 9;
                            let cover_size_ratio = w / h;
                            let cover_init_h = 205;
                            let cover_init_w = common_ratio * cover_init_h;
                            if (cover_size_ratio > common_ratio) {
                                cover_init_w = 364;
                                cover_init_h = cover_init_w / cover_size_ratio;
                            } else if (cover_size_ratio < common_ratio) {
                                cover_init_w = cover_size_ratio * cover_init_h;
                            }
                            ctx.drawImage($cover, (canvas.width - cover_init_w) / 2, 304 - cover_init_h, cover_init_w, cover_init_h);
                        }
                    }
                    return ctx;
                },
                success: (canvas) => {
                    that.poster_src = canvas.toDataURL();
                },
                error: (err) => {
                    that.close();
                    if (iswap) {
                        that.$toast('生成海报失败！', 1000, 'wap');
                    } else {
                        that.$toast('生成海报失败！');
                    }
                }
            });
        },
        // 下载图片
        download_poster(event) {
            let that = this,
                poster = that.poster_src;
            if (!poster) {
                return that.$toast('图片正在生成中', 1000);
            }
            // ie 下载文件
            if (window.navigator.msSaveBlob) {
                try {
                    var blobObject = new Blob([poster]);
                    window.navigator.msSaveBlob(blobObject, 'woodo');
                } catch (error) {
                    console.error(error);
                }
            } else {
                // 支持 a标签download
                event.target.download = 'woodo';
                event.target.href = poster;
            }
        },
        // 修改头像链接，防止绘制时出现跨域问题
        user_head_change(callback) {
            let that = this;
            let photo = that.user.photo;
            let $photo = that.$refs.poster_userphoto;
            let fn = () => {
                if (typeof callback === 'function') callback();
            }
            $photo.onload = fn;
            $photo.onerror = fn;
            that.user.photo = utils.getImageProxyUrl(that.user.photo) || `/public/images/common/default_head.png`;
        },
    },
};
</script>

<style lang="less" scoped>
@keyframes rotate {
    from {
        transform: rotate(0);
    }
    to {
        transform: rotate(360deg);
    }
}

.modal-backdrop {
    text-align:center;
}

.modal-backdrop::after {
    content: "";
    display: inline-block;
    vertical-align: middle;
    width: 0;
    height: 100%;
    opacity: 0;
}

.poster_modal {
    position: relative;
    display: inline-block;
    vertical-align: middle;
    width: 410px;
    border-radius: 6px;
    &.wap {
        width: 75%;
        min-width: 13.5rem;
        .poster_content::before {
            padding-top: 132.79%;
        }
        .poster_tips {
            font-size: 0.6rem;
        }
        .download_button {
            display: none;
        }
    }
    .poster_content {
        position: relative;
        width: 100%;
        height: auto;
        margin-bottom: 20px;
        background-color: #ffffff;
        border-radius: 6px;
        user-select: none;
        &::before {
            content: "";
            display: block;
            padding-top: 148.78%;
        }
        .in_create {
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            width: 100%;
            height: 30px;
            margin: auto;
            font-size: 14px;
            color: #888;
            &::before {
                content: "";
                display: inline-block;
                vertical-align: middle;
                width: 30px;
                height: 30px;
                margin-right: 10px;
                border: 4px solid #444;
                border-right-color: transparent;
                border-radius: 50%;
                animation: rotate 1s ease infinite;
            }
        }
        .poster_booth {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            border-radius: 6px;
            &[src=""] {
                opacity: 0;
            }
        }
    }
    .poster_tips {
        margin-bottom: 8px;
        line-height: 1;
        font-size: 16px;
        color: #ffffff;
        opacity: 0.8;
    }
    .download_button {
        display: block;
        width: 250px;
        height: 50px;
        line-height: 50px;
        margin: 0 auto;
        background-color: var(--mainColor);
        border-radius: 6px;
        font-size: 16px;
        color: #ffffff;
        text-align: center;
    }
}
</style>