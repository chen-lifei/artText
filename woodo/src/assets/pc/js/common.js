import axios from '@/util/axios.js';
import page_opt from '@/assets/pc/js/opt/page_opt.js';
import font_family from '@/assets/font/fontFamily.js';

// 通用数据对象，用于存储一些变量
let dataInfoObject = {};

let common = {
    // 获取用户信息
    get_login_state(){
        let user = {},
            had_login = false,
            news = 0,
            id, name, mobile, email, photo, showBindTips, showValidateTips, BindWeixin, memberVip, memberInviteCode,memberVipExpire, memberHcoin;
        if(utils.getCookies('woodo_memberId')) had_login = true;
        if(had_login){
            id = utils.getCookies('woodo_memberId') ? Number(utils.getCookies('woodo_memberId')) : '';
            photo = utils.getCookies('woodo_memberHead').length > 2 ? unescape(utils.getCookies('woodo_memberHead')) : 'https://file.woodo.cn/upload/image/201901/09/b1e4a122-81dc-48c5-812b-b853c81021b8.png';
            name = utils.getCookies('woodo_memberNickName') ? utils.getCookies('woodo_memberNickName') : '';
            mobile = utils.getCookies('woodo_memberMobile') ? utils.getCookies('woodo_memberMobile') : '';
            email = utils.getCookies('woodo_memberEmail') ? unescape(utils.getCookies('woodo_memberEmail')) : '';
            memberHcoin = utils.getCookies('woodo_memberHcoin');
            showBindTips = !email && !mobile;
            showValidateTips = utils.getCookies('woodo_memberIsVerifyEmail') === 'false';
            BindWeixin = utils.getCookies('woodo_memberIsBindWeixin') === 'true';
            memberVip = utils.getCookies('woodo_memberVip');
            memberInviteCode = utils.getCookies('woodo_memberInviteCode');
            memberVipExpire = utils.getCookies('woodo_memberVipExpire') ? Number(utils.getCookies('woodo_memberVipExpire')) : '';
        }
        let vip_map = {
            'personal': '个人版',
            'enterprise': '企业版',
            'premium': '高级版',
            'professional': '普通版',
            'free': '基础版',
        };
        user.login = had_login;
        user.id = id;
        user.name = name;
        user.photo = photo;
        user.mobile = mobile;
        user.email = email;
        user.hcoin = memberHcoin;
        user.showBindTips = showBindTips;
        user.showValidateTips = showValidateTips;
        user.BindWeixin = BindWeixin;
        user.news = news;
        user.memberVip = memberVip;
        user.memberVipCn = vip_map[String(memberVip).toLocaleLowerCase()];
        user.memberVipList = vip_map;
        user.memberInviteCode = memberInviteCode;
        user.memberVipExpire = memberVipExpire;
        user.memberVipEffect = memberVip !== 'free' && memberVipExpire && memberVipExpire > new Date().getTime();
        return user;
    },
    // 微信登陆
    wechat_login(that) {
        // 微信端判断
        if (utils.deviceENV().wechat && !that.$common.get_login_state().login) {
            that.$axios.get("/api/weixin/mobile_login/").then(function(data){
                if(data.data.type !== 'success'){
                    return that.$toast(data.data.content,1000,'wap');
                }
                location.href = data.data.data;
            });
        }
    },
    // 微信sdk加载准备
    wxjssdk_ready(callback) {
        if (!window || !window.location) {
            return;
        }
        axios.get('/api/common/get_weixin_share/', {
            params: {
                url: window.location.href,
            },
        }).then(res => {
            if (res.data.type === 'success') {
                wxjssdk.config({
                    debug: false,                             // 开启调试模式,
                    appId: res.data.data.appWapId,           // 必填，企业号的唯一标识，此处填写企业号corpid
                    timestamp: res.data.data.timestamp,      // 必填，生成签名的时间戳
                    nonceStr: res.data.data.noncestr,        // 必填，生成签名的随机串
                    signature: res.data.data.sign,           // 必填，签名，见附录1
                    // 必填，需要使用的JS接口列表
                    jsApiList: [
                        'onMenuShareAppMessage',
                        'onMenuShareTimeline',
                        'updateAppMessageShareData',
                        'updateTimelineShareData',
                        'previewImage'
                    ]
                });
                wxjssdk.ready(() => {
                    if (typeof callback === 'function') callback(wxjssdk);
                });
            }
        });
    },
    // 获取微信分享权限
    get_wexin_sdk(_title, _desc, _link) {
        common.wxjssdk_ready(() => {
            let title = _title,
                desc = _desc,
                link = _link,
                imgUrl = 'https://file.woodo.cn/upload/image/202006/18/9ebdc6e5-fa06-4845-b094-94cb1b9996f8.png';
            // 分享至好友
            common.share_to_friends(title, desc, link, imgUrl);
            // 分享至朋友圈
            common.share_to_moments(title, link, imgUrl);
        });
    },
    //分享给朋友
    share_to_friends(title, desc, link, imgUrl) {
        // 分享接口改版兼容
        if (wxjssdk.onMenuShareAppMessage) {
            wxjssdk.onMenuShareAppMessage({
                title: title,     //分享标题
                desc: desc,       //分享描述
                link: link,       //分享链接，该链接域名或路径必须与当前页面对应的公众号JS安全域名一致
                imgUrl: imgUrl,   // 分享图标
            });
        } else {
            wxjssdk.updateAppMessageShareData({
                title: title,     //分享标题
                desc: desc,       //分享描述
                link: link,       //分享链接，该链接域名或路径必须与当前页面对应的公众号JS安全域名一致
                imgUrl: imgUrl,   // 分享图标
            });
        }
    },
    //分享到朋友圈
    share_to_moments(title, link, imgUrl) {
        // 分享接口改版兼容
        if (wxjssdk.onMenuShareTimeline) {
            wxjssdk.onMenuShareTimeline({
                title: title,     // 分享标题
                link: link,       // 分享链接，该链接域名或路径必须与当前页面对应的公众号JS安全域名一致
                imgUrl: imgUrl,   // 分享图标
            });
        } else {
            wxjssdk.updateTimelineShareData({
                title: title,     // 分享标题
                link: link,       // 分享链接，该链接域名或路径必须与当前页面对应的公众号JS安全域名一致
                imgUrl: imgUrl,   // 分享图标
            });
        }
    },

    /**
     * document 数据 json字符串序列化
     */
    document_dataparse(doc) {
        if (!doc.attr) {
            doc.attr = {};
        } else if (typeof doc.attr === 'string') {
            try {
                doc.attr = JSON.parse(doc.attr);
            } catch (error) {
                doc.attr = {};
            }
        }
        if (!doc.background) {
            doc.background = {};
        } else if (typeof doc.background === 'string') {
            try {
                doc.background = JSON.parse(doc.background);
            } catch (error) {
                doc.background = {};
            }
        }
        return doc;
    },
    /**
     * documentPages 数据 json字符串序列化
     */
    document_pages_dataparse(pages, callback) {
        if (Array.isArray(pages)) {
            for (let i = 0, length = pages.length; i < length; i++) {
                let item = pages[i];
                if (!item.elementList) {
                    item.elementList = [];
                } else if (typeof item.elementList === 'string') {
                    try {
                        item.elementList = JSON.parse(item.elementList);
                    } catch (error) {
                        item.elementList = [];
                    }
                }
                if (item.background && typeof item.background === 'string') {
                    try {
                        item.background = JSON.parse(item.background);
                    } catch (error) {
                        item.background = item.background;
                    }
                }
                if (!item.attr) {
                    item.attr = {};
                } else if (typeof item.attr === 'string') {
                    try {
                        item.attr = JSON.parse(item.attr);
                    } catch (error) {
                        item.attr = {};
                    }
                }
                if (typeof callback === 'function') callback(item);
            }
        }
        return pages;
    },

    // object to svg
    obj_2_svg(document, page) {
        let page_html = page_opt.get_dom(document, page);
        return page_html;
    },
    /**
     * svg to html
     * @param svg_str
     */
    svg_2_html(svg_str) {
        let $svg = $(svg_str);
        $svg.css('transform', '');
        // 写入样式，无法引用当前document的样式
        let svg_css = `
            <style type="text/css" id="svg_style">
            * {margin:0; padding:0; border:none; box-sizing:border-box; font-size:12px; color:#505050;}
            html,
            body {width:100%; height:100%; font-family:'Microsoft YaHei','PingFang SC','sans-serif'}
            button,
            input,
            select,
            textarea {background:transparent; outline:none; border:none; font-size:12px;}
            input[type=number]::-webkit-inner-spin-button,
            input[type=number]::-webkit-outer-spin-button {-webkit-appearance:none;} 
            a,
            button{cursor:pointer;}
            ul,
            ol,
            li {list-style:none;}
            a {text-decoration:none;}
            a:hover {opacity:0.8;}
            i {font-style:normal;}
            .edit_page {position:relative; transform-origin:0 0; overflow:hidden;}
            .edit_page .page_bg {width:100%; height:100%; background:transparent;}
            .edit_page .ele_item {position:absolute; width:0; height:0; font-size:0;}
            .edit_page .ele_item div[data-scale] {transform-origin:0 0;}
            .edit_page .ele_item div[data-rotate] {width:100%; height:100%;}

            .edit_page .ele_item.lock [contenteditable=true] {pointer-events:none;}
            .edit_page .ele_item .show_text:focus {border:none; outline:none;}
            .edit_page .ele_item .show_text{line-height:1.4; background-color:transparent; word-break:break-all; text-align: left; cursor:text; -webkit-user-select:text !important;}
            .edit_page .ele_item .show_text *{-webkit-user-select:text!important;font: inherit;color: inherit;}
            .edit_page .ele_item .show_text a{color:inherit; cursor:inherit;}
            .edit_page .ele_item .show_text a:hover{opacity: 1;}
            .edit_page .ele_item .show_text .customize_selection,
            .edit_page .ele_item .show_text .customize_selection *{color: #ffffff !important;}
            .edit_page .ele_item .show_text ul{padding-left: 1em; list-style:initial;}
            .edit_page .ele_item .show_text ol{padding-left: 1.5em; list-style:initial;}
            .edit_page .ele_item .show_text li{list-style:inherit;}
            .edit_page .ele_item .show_text ul.diamond,
            .edit_page .ele_item .show_text ul.square-box,
            .edit_page .ele_item .show_text ul.hook,
            .edit_page .ele_item .show_text ul.arrow,
            .edit_page .ele_item .show_text ul.spot{list-style:none;}
            .edit_page .ele_item .show_text ul.diamond li::before {content:"◆"; display:inline-block; position:relative; width:1em; margin-left:-1em;}
            .edit_page .ele_item .show_text ul.square-box li::before {content:"□"; display:inline-block; position:relative; width:1em; margin-left:-1em;}
            .edit_page .ele_item .show_text ul.hook li::before {content:"✓"; display:inline-block; position:relative; width:1em; margin-left:-1em;}
            .edit_page .ele_item .show_text ul.arrow li::before {content:"➤"; display:inline-block; position:relative; width:1em; margin-left:-1em;}
            .edit_page .ele_item .show_text ul.spot li::before {content:"•"; display:inline-block; position:relative; width:1em; margin-left:-1em;}

            .edit_content .edit_page .ele_item[data-type="text"] .show_text.art:empty::before{content: '请输入内容'; color: inherit;}
            .edit_page .ele_item[data-type="text"] .show_text.art[style*="background-image"],
            .edit_page .ele_item[data-type="text"] .show_text.art[style*="background-image"] a,
            .edit_page .ele_item[data-type="text"] .show_text.art[style*="background-image"] span,
            .edit_page .ele_item[data-type="text"] .show_text.art[style*="background-image"] div{background-repeat:repeat; background-size:100% 100%; -webkit-text-fill-color:transparent; -webkit-background-clip:text; background-clip:text;}

            .edit_page .ele_item[data-type="shape"] .show_text {position: absolute; top: 50%; left: 50%; width: calc(200% - 40px) !important; height: auto !important; min-width: 1em; min-height: 1em; transform: translate(-25%, -25%) scale(0.5, 0.5); transform-origin: 0 0; overflow: visible; cursor: move;}
            .edit_page .ele_item[data-type="shape"] .show_text:focus {cursor: text;}

            .edit_page .ele_item[data-type="table"] table {width:100%; border-collapse:collapse;}
            .edit_page .ele_item[data-type="table"] table td {padding:5px;  border:2px solid currentColor;  vertical-align:middle;  min-width:6px;  outline:none;  word-break:break-word;  cursor:text;}
            .edit_page .ele_item[data-type="table"] table td.merge_hide {display:none;}
            .edit_page .ele_item[data-type="table"] table td .show_text {display:block; outline:none; min-height:5px; font-size:20px;}
            .edit_page .ele_item[data-type="table"] table .cel_selected{background-color:#a2e7ff !important;}
            .edit_page .ele_item[data-type="table"] .table_resizer{display:none;}
            .edit_page .ele_item[data-type="table"].checked .table_resizer{display:block; position:absolute; z-index:10; opacity:0; background-color:rgba(22,155,213,0.4);}
            .edit_page .ele_item[data-type="table"].checked .table_resizer.table_column_resizer{width:12px;height:100%;top:0;margin-left:-5px;cursor:col-resize;}
            .edit_page .ele_item[data-type="table"].checked .table_resizer.table_column_resizer.left{margin-left:0;}
            .edit_page .ele_item[data-type="table"].checked .table_resizer.table_row_resizer{width:100%; height:12px; top:0; margin-top:-5px; cursor:row-resize;}
            .edit_page .ele_item[data-type="table"].checked .table_resizer.table_row_resizer.top{margin-top:0;}
            .edit_page .ele_item[data-type="table"].checked .table_resizer:hover{opacity:1;}
            .edit_page .ele_item[data-type="table"].checked td.standard_merge{position:relative; z-index:11;}

            .edit_page .ele_item[data-type="chart"] .chart_preview {display: none; position: absolute; top: 0; left: 0; pointer-events: none;}
            .edit_page .ele_item[data-type="chart"] .chart_content:empty + .chart_preview {display: block;}

            .edit_page .ele_item video,
            .edit_page .ele_item audio{outline: none;}
            .edit_page .ele_item[data-type="video"] .ele_scale {width: 100%; height: 100%;}
            .edit_page .ele_item[data-type="video"] .video_layer {position: relative; width: 100%; height: 100%; background-color: #333333;}
            .edit_page .ele_item[data-type="video"] .video_layer::after {content: ""; position: absolute; top: 0; left: 0; z-index: 1; width: 100%; height: 100%; background-color: rgba(0,0,0,0.4);}
            .edit_page .ele_item[data-type="video"] .video_layer .video_play_layer {position: absolute; top: 0; left: 0; width: 100%; height: 100%; z-index: 4;}
            .edit_page .ele_item[data-type="video"] .video_layer .video_play {position: absolute; top: 50%; left: 50%; z-index: 2; width: 80px; height: 80px; margin: -40px 0 0 -40px; cursor: pointer; background-color: rgba(0,0,0,0.8); border-radius: 50%;}
            .edit_page .ele_item[data-type="video"] .video_layer .video_play svg {position: absolute; top: 50%; left: 50%; width: 40px; height: 40px; margin: -20px 0 0 -16px; transform: scale(1);}
            .edit_page .ele_item[data-type="video"] .video_layer iframe,
            .edit_page .ele_item[data-type="video"] .video_layer video {position: relative; z-index: 3;}
            .edit_page .ele_item[data-type="video"] .video_layer img {display: none; width: 100%; height: 100%; object-fit: cover;}
            .edit_page .ele_item[data-type="video"] .video_layer img[src^=http] {display: block;}

            .edit_page .ele_item[data-type="audio"] svg.playing path:nth-of-type(2),
            .edit_page .ele_item[data-type="audio"] svg.playing path:nth-of-type(3) {transform-origin: center center; animation: play 1s linear infinite both;}
            @keyframes play {
                0% { opacity: 1; transform: translateX(0) scale(1); }
                100% { opacity: 0; transform: translateX(10%) scale(1.5); }
            }
            </style>
            `;
        $svg.prepend($(svg_css));
        return $svg;
    },
    /**
     * svg to canvas
     * @param svg_str       svg字符串
     */
    svg_2_canvas(svg_str) {
        let that = this;
        return new Promise(function(resolve, reject){
            let $svg = common.svg_2_html(svg_str);
            //处理外链资源图片
            let element_image = $svg.find(`image, img[src], [style*="background-image"]`);
            let image_size = element_image.length;
            element_image.each(function(index, item){
                let canvas = document.createElement('canvas'),
                    cxt = canvas.getContext('2d'),
                    image = new Image(),
                    is_img = $(item).is('img[src]'),
                    is_image = $(item).is('image'),
                    is_background = $(item).is('[style*="background-image"]');
                switch (true) {
                    // svg 图片元素
                    case is_image:
                        let href = item.href.baseVal;
                        if (href) {
                            href = utils.getImageProxyUrl(href);
                            image.src = href;
                            image.onload = function () {
                                let img_ratio = image.height / image.width;
                                canvas.width = $(item).parents('.img_content').attr('width') || item.width.baseVal.value;
                                canvas.height = canvas.width * img_ratio;
                                cxt.drawImage(image, 0, 0, canvas.width, canvas.height);
                                let base64 = canvas.toDataURL("image/png");
                                $(item).attr("href", base64);
                                image_size--;
                            };
                            image.onerror = function(){
                                image_size--;
                            };
                        } else {
                            image_size--;
                        }
                        break;
                    // 处理背景图
                    case is_background:
                        let url = $(item).css('background-image').replace(/(^url\("?'?|"?'?\))/g, '');
                        if (url !== '') {
                            url = utils.getImageProxyUrl(url);
                            image.src = url;
                            image.onload = function () {
                                canvas.width = image.width;
                                canvas.height = image.height;
                                cxt.drawImage(image, 0, 0, canvas.width, canvas.height);
                                let base64 = canvas.toDataURL("image/png");
                                $(item).css('background-image', `url(${base64})`);
                                image_size--;
                            };
                            image.onerror = function(){
                                image_size--;
                            };
                        } else {
                            image_size--;
                        }
                        break;
                    // 处理 img 标签图片
                    case is_img:
                        let src = $(item).attr('src');
                        if (src) {
                            src = utils.getImageProxyUrl(src);
                            canvas.width = $(item).attr("width");
                            canvas.height = $(item).attr("height");
                            image.src = src;
                            image.onload = function () {
                                cxt.drawImage(image, 0, 0, canvas.width, canvas.height);
                                let base64 = canvas.toDataURL("image/png");
                                $(item).attr("src", base64);
                                image_size--;
                            };
                            image.onerror = function(){
                                image_size--;
                            };
                        } else {
                            image_size--;
                        }
                        break;
                    default:
                        image_size--;
                        break;
                }
            });
            /**
             * 处理在线字体包
             * 下面svg转成的dataURL本身无法引用任何外包资源，包括当前document的资源，所有需要把字体包载入进去
             */
            let family_arr = [...new Set(svg_str.match(/font-family:\s?woodo-[a-zA-Z0-9\-]+/g))];    // 获取在线字体名称，去重防重复下载
            let fonts_size = family_arr ? family_arr.length : 0;
            if (fonts_size) {
                family_arr.forEach((item)=>{
                    // 从 head 里获取url
                    let file_name = item.replace(/font-family:\s?/g, '');
                    // 字体包地址
                    let search_fontfamily = font_family.search_exact(file_name);
                    let fonts_href;
                    if (search_fontfamily) {
                        fonts_href = search_fontfamily.url;
                    }
                    if (fonts_href) {
                        // 获取文件后缀 用于转blob
                        let href_split = fonts_href.match(/\.[a-zA-Z0-9]+/g);                       // match 以 .+[a-zA-Z0-9] 分割
                        let file_suffix = href_split[href_split.length - 1].substring(1);           // 最后一个为文件后缀
                        // 下载字体包
                        $.ajax({
                            type: "GET",
                            url: fonts_href,
                            xhr: function () {
                                // 设置返回数据类型为blob
                                let xhr = new XMLHttpRequest();
                                xhr.responseType = 'blob';
                                return xhr;
                            },
                            success: function (blob) {
                                // 读取文件并转换成base64
                                let reader = new FileReader();
                                reader.readAsDataURL(blob);
                                reader.onload = function () {
                                    let font_base64 = reader.result;
                                    // 添加到svgstyle中
                                    let svg_style = $svg.find('#svg_style');
                                    file_suffix = file_suffix === 'otf' ? 'opentype' : file_suffix;
                                    let font_face = `
                                    @font-face {
                                        font-family: '${file_name}';
                                        src: local('${file_name}'),
                                             url('${font_base64}') format('${file_suffix}');
                                        font-display: swap;
                                        font-style: normal;
                                        font-weight: normal;
                                    }
                                    `;
                                    svg_style.text(svg_style.text() + font_face);
                                    fonts_size--;
                                }
                                reader.onerror = function () {
                                    fonts_size--;
                                }
                            },
                            error: function (err) {
                                fonts_size--;
                            },
                        });
                    } else {
                        fonts_size--;
                    }
                });
            }
            //画图区域设置，高度、宽度设置
            let width = $svg.width();
            let height = $svg.height();
            let create = function () {
                let canvas = document.createElement('canvas');
                canvas.width = width;
                canvas.height = height;
                let ctx = canvas.getContext('2d');
                let image = new Image();
                image.onload = function () {
                    ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
                    resolve(canvas);
                };
                image.onerror = function (err) {
                    reject();
                };
                let str = new XMLSerializer().serializeToString($svg[0]),
                    ranges = ['\u000b'],
                    reg = new RegExp(ranges.join('|'), 'g');
                str = str.replace(reg,"");
                image.src = `data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}"><foreignObject width="100%" height="100%">${str}</foreignObject></svg>`)}`;
            }
            // 无图片&字体包，跳过定时器轮询立即执行
            if (image_size <= 0 && fonts_size <= 0) {
                create();
            } else {
                let time = setInterval(() => {
                    if(image_size <= 0 && fonts_size <= 0){
                        clearInterval(time);
                        create();
                    }
                }, 300);
            }
        });
    },
    /**
     * svg to base64-string
     * @param svg_str       svg字符串
     * @param isupload      是否上传图片
     */
    svg_2_base64(svg_str, isupload = true) {
        return new Promise(function(resolve, reject){
            let p = common.svg_2_canvas(svg_str);
            p.then(function(canvas){
                let base64 = canvas.toDataURL("image/jpg");
                if (isupload) {
                    common.upload_image({
                        'base64': base64,
                        'success': (image_url) => {
                            resolve(image_url);
                        },
                        'error': (err) => {
                            console.error(err);
                        },
                    });
                } else {
                    resolve(base64);
                }
            }).catch(err => {
                reject();
            });
        });
    },
    // 上传base64码图片
    upload_image(obj) {
        let opt = {
            base64: '',
            success: null,
            error: null,
        };
        opt = Object.assign(opt, obj);
        if (!opt.base64) {
            return console.error('upload_img file error');
        }
        var params = {};
        params['file'] = opt.base64;
        $.ajax({
            type: "POST",
            url: "/api/file/upload_img/",
            data: params,
            success: function (data) {
                let code = data.code,
                    content = data.content,
                    image = data.data;
                if (code === "2") {
                    if (typeof opt.success === 'function') opt.success(image);
                }else{
                    if (typeof opt.error === 'function') opt.error(content);
                }
            },
            error: function (err) {
                if (typeof opt.error === 'function') opt.error(err);
            },
        });
    },
    // 上传base64码图片，可修改名称
    upload_image_by_name(obj) {
        let opt = {
            base64: '',
            filename: '',
            success: null,
            error: null,
        };
        opt = Object.assign(opt, obj);
        if (!opt.base64) {
            return console.error('upload_img file error');
        }
        var params = {};
        params['file'] = opt.base64;
        params['fileName'] = opt.filename || `${this.uuid()}-${utils.getUrlQuery('docId')}`;

        $.ajax({
            type: "POST",
            url: "/api/file/upload_img_by_name/",
            data: params,
            success: function (data) {
                let code = data.code,
                    content = data.content,
                    image = data.data;
                if (code === "2") {
                    if (typeof opt.success === 'function') opt.success(image);
                }else{
                    if (typeof opt.error === 'function') opt.error(content);
                }
            },
            error: function (err) {
                if (typeof opt.error === 'function') opt.error(err);
            },
        });
    },
    //获取图片信息(阿里云接口,图片地址,是否异步获取)
	get_imageinfo(src,is_async) {
		let info = {
			size : 0,
			ext : null,
			width : 0,
			height : 0
		};
		if(typeof(src) === 'undefined' || src === null){
			return info;
		}
		if(typeof(is_async) === 'undefined'){
			is_async = true;
		}
		if(is_async){
			//异步
			return new Promise(function(resolve, reject){
				return run(resolve,reject);
			});
		}else{
			//同步
			run();
			return info;
		}
		function run(success_callback,error_callback){
			//src处理
            if (src.indexOf(`svg`)) {
				src+='';
            } else if(src.indexOf('?x-oss-process=image')){
				src+='/info';
			}else {
				src+='?x-oss-process=image/info';
			}
			$.ajax({
				type : "GET",
				timeout : 5000,
				async : is_async,
				url : src,
				success : function (data) {
                    if(typeof success_callback === 'function'){success_callback(data);}
				},
				error : function(){
					if(typeof error_callback === 'function'){error_callback();}
				},
			});
		}
	},
    // 获取svg缩略图
    getSvgFileThumbnail(file) {
        return new Promise((resolve, reject) => {
            let url = utils.getFileUrl(file);
            common.get_imageinfo(url).then(svg => {
                let svg_dom = $(svg).find('svg');
                let id = `svg${$('svg').length + 1}`;
                svg_dom.attr('id', id);
                svg_dom.attr('style','');
                svg_dom.css({
                    'display':'none',
                });
                $("body").append(svg_dom.prop('outerHTML'));
                let minLength = 256;
                let scale = 2;
                let width = $(`#${id}`).width();
                let height = $(`#${id}`).height();
                let canvasWidth = width < minLength ? width * scale : width;
                let canvasHeight = height < minLength ? height * scale : height;
                svg_dom.find('animate').remove();
                let canvas = document.createElement('canvas');
                canvas.width = canvasWidth;
                canvas.height = canvasHeight;
                let ctx = canvas.getContext('2d');
                let image = new Image();
                image.src = 'data:image/svg+xml,'+ encodeURIComponent(svg_dom.prop("outerHTML"));
                image.onload = () => {
                    ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
                    let formData = new FormData();
                    formData.append('file',utils.base64ToBlob(canvas.toDataURL("image/png")),new Date().getTime() + ".png");
                    formData.append('fileType',"image");
                    $.ajax({
                        type: "POST",
                        url: "/api/file/upload/",
                        contentType: false,
                        processData: false,
                        data: formData,
                        success: data => {
                            $(`#${id}`).remove();
                            resolve(data.data);
                        }
                    });
                };
            })
        })
    },
    // 移动端返回退出浏览器阻止
    hold_back() {
        let is_mobile = utils.deviceENV().mobile;
        // 判断是否是小程序环境 || 判断是否是最后条 || 上一条不是移动端页面
        utils.isMiniProgramENV().then(res =>{
            if(!res.miniprogram){
                if(is_mobile && (document.referrer === '' || document.referrer.indexOf('/mobile') <= 0)){
                    let uri = location.pathname;
                    let exclude_uri = [
                        `/mobile/payment/transfer?\?`,
                        `/mobile/payment/result?\?`,
                    ];
                    for (let i = 0; i < exclude_uri.length; i++) {
                        if (new RegExp(exclude_uri[i]).test(uri)) {
                            return;
                        }
                    }
                    history.pushState(null, null, '' );
                    window.addEventListener('popstate', function(event) {
                        history.pushState(null, null, '' );
                    });
                    window.history.pushState('forward', null, '#');
                    window.history.forward(1);
                }
            }
        }).catch(res =>{
            console.error("error " + res);
        });
    },
    //判断是否从小程序跳转过来
    page_from_miniprogram() {
        utils.isMiniProgramENV().then(res =>{
            if(res.miniprogram){
                var _curren_url = window.location.pathname,
                    _miniprogram_url = {
                        "/mobile/":"/pages/square/square",
                        "/mobile/home/":"/pages/mydoc/mydoc",
                        "/mobile/member/":"/pages/member/member",
                        "/mobile/notification/":"/pages/message/message",
                        "/mobile/hcoin/special": "pages/upgrade/hcoin_special/hcoin_special",
                    };
                if(typeof _miniprogram_url[_curren_url] !== 'undefined'){
                    res.wx.miniProgram.reLaunch({url:_miniprogram_url[_curren_url]});
                    return;
                }
            }
        }).catch(res =>{
            console.error("error " + res);
        });
    },
    // 自定义 海报
    custom_create_poster(obj) {
        let opt = {
            width: null,
            height: null,
            posterBackground: null,     // 海报背景dom
            draw: null,                 // 绘制方法回调，返回 canvas.getContext('2d')，由调用方法自定义绘制内容，最终return回该方法
            success: null,
            error: null,
        };
        opt = $.extend(opt, obj);
        try {
            let canvas = document.createElement('canvas');
            if (opt.width && opt.height) {
                canvas.width = opt.width;
                canvas.height = opt.height;
            } else {
                canvas.width = opt.posterBackground.width;
                canvas.height = opt.posterBackground.height;
            }
            let ctx = canvas.getContext('2d');
            // 绘制背景
            if (opt.posterBackground) {
                ctx.drawImage(opt.posterBackground, 0, 0, canvas.width, canvas.height);
            }
            // 绘制元素
            if (typeof opt.draw === 'function') {
                let return_ctx = opt.draw(ctx, canvas);
                if (return_ctx) {
                    ctx = return_ctx;
                }
            }
            if (typeof opt.success === 'function') opt.success(canvas);
        } catch (error) {
            console.error(error);
            if (typeof opt.error === 'function') opt.error(error);
        }
    },
    import_pdf(that,formData, success, fail) {
        var _uuid,_uuid_sign,_download_host,_timer,_progress_timer;
        //1.获取导入信息
        var _doc_id = formData.get("docId");
        if($validate(_doc_id).empty()){
            _doc_id = "";
        }
        that.$axios.get('/api/member/document/get_import_task_msg/?docId=' + _doc_id).then((data)=>{
            if(data.data.code === '2') {
                var data = data.data.data;
                _download_host = data.downloadHost;
                _uuid = data.uuid,
                _uuid_sign = data.uuidSign;

                formData.append('uuid', _uuid);
                formData.append('uuidSign', _uuid_sign);
                formData.append('type', "pdf");
                //2.访问导出服务，创建导入任务
                that.$axios({
                    url: _download_host + '/api/task/create_import_task/',
                    headers: { 'Content-Type': 'multipart/form-data' },
                    method: 'post',
                    data:formData,
                    dataType:'file'
                }).then(function(data){
                    if(data.data.type === 'success'){
                        //3.任务创建完毕，开始轮询任务状态
                        _timer = setInterval(function(){
                            that.$axios.get(_download_host + '/api/task/check_task_status/?uuid=' + _uuid).then((data) => {
                                if (data.data.type === 'success') {
                                    var result = JSON.parse(data.data.content);
                                    if (result.status === 'fail') {
                                        clearInterval(_timer);
                                        that.$toast(result.message, 2000);
                                        if (typeof fail === 'function') fail();
                                    } else if (result.status === 'complete') {
                                        clearInterval(_timer);
                                        var _doc_id = formData.get("docId");
                                        that.$axios.post('/api/member/document/import_pdf/', {
                                            fileName: result.fileName,
                                            downMsg: result.downMsg,
                                            docId: _doc_id
                                        }).then(function (data) {
                                            that.importing_ppt = false;
                                            clearInterval(_progress_timer);
                                            if (data.data.code !== "2") {
                                                that.$toast(data.data.content, 2000);
                                            } else {
                                                if (typeof success === 'function') success(data);
                                            }
                                        }).catch(function (data) {
                                            clearInterval(_progress_timer);
                                            that.importing_ppt = false;
                                        });
                                    }
                                } else {
                                    clearInterval(_timer);
                                    that.$toast('操作失败，请稍后再试', 2000);
                                }
                            }).catch((err) => {
                                clearInterval(_timer);
                                that.$toast('操作失败，请稍后再试', 2000);
                            });
                        }, 2000);
                    }else{
                        clearInterval(_progress_timer);
                        that.$toast(data.data.content, 2000);
                        if (typeof fail === 'function') fail(data);
                    }
                }).catch(function(info){
                    clearInterval(_progress_timer);
                    that.importing_ppt = false;
                    that.$toast('导入失败',800);
                });
            } else {
                if (typeof fail === 'function') fail(data);
                that.$toast(data.data.content, 2000);
            }
        }).catch(function(data){
            that.$toast('导入失败', 2000);
            if (typeof fail === 'function') fail();
        });

        _progress_timer = setInterval(function(){
            that.import_ppt_progress;
            if(that.import_ppt_progress >= 95){
                clearInterval(_progress_timer);
            }else{
                that.import_ppt_progress += 5;
            }
        },1000);
    },
    // 手机端触发编辑底部按钮隐藏
    resize_hidden_element_init() {
        if (!utils.deviceENV().mobile) {
            return;
        }
        let body_height = document.body.clientHeight;
        window.addEventListener('resize', e => {
            let tag = document.activeElement;
            let hideElement = dataInfoObject['resize_hidden_element'];
            if (!hideElement) {
                return;
            }
            if (body_height > document.body.clientHeight) {
                let filter_arr = ['INPUT', 'TEXTAREA'];
                if (filter_arr.indexOf(tag.tagName) >= 0 || tag.contentEditable === 'true') {
                    hideElement.forEach(item => {
                        $(item).hide();
                    });
                }
            } else {
                hideElement.forEach(item => {
                    $(item).show();
                });
            }
        });
    },
    // hideElement 需要隐藏的元素
    resize_hidden_element(hideElement) {
        if (!utils.deviceENV().mobile) {
            return;
        }
        if (!hideElement || typeof hideElement !== 'string') {
            return console.log('参数为字符串');
        }
        if (!Array.isArray(dataInfoObject['resize_hidden_element'])) {
            dataInfoObject['resize_hidden_element'] = [];
        }
        dataInfoObject['resize_hidden_element'].push(hideElement);
    },

    /**
     * 统一创作者中心跳转方法
     */
    toIndex() {
        if (login) {
            this.toHome();
        } else {
            this.$router.push({path: '/'});
        }
    },
    /**
     * 统一创作者中心跳转方法
     */
    toHome() {
        this.$router.push({path: '/home/'});
    },
    /**
     * 统一用户中心跳转方法
     */
    toMember() {
        this.$router.push({path: '/member/'});
    },
    // 获取用户头像
    getUserPhoto(size = 50, str) {
        if (str) {
            str = str.toUpperCase().charAt(0);
        } else {
            let { photo, name, weixinNickName } = this.get_login_state();
            if (photo && photo !== '/images/default_head.png') {
                return photo;
            }
            str = (name || weixinNickName).toUpperCase().charAt(0);
        }
        let cvs = document.createElement("canvas");
        cvs.setAttribute('width', size);
        cvs.setAttribute('height', size);
        let ctx = cvs.getContext("2d");
        ctx.fillStyle = '#0fcdcf';
        ctx.fillRect(0, 0, size, size);
        ctx.fillStyle = 'rgb(255,255,255)';
        ctx.font = size * 0.45 + "px 微软雅黑";
        ctx.textBaseline = "middle";
        ctx.textAlign = "center";
        let textMetrics = ctx.measureText(str);
        let actualBoundingBoxAscent = textMetrics.actualBoundingBoxAscent;
        ctx.fillText(str, size / 2, size / 2 + actualBoundingBoxAscent / 4);
        return cvs.toDataURL('image/png', 1);
    },
    // 获取素材来源信息
    getChannelInfo(value) {
        let info = {
            head: '',
            author: '',
            link: ''
        }
        if (value.source) {
            info.author = value.source;
            if (value.sourceHead === '/images/default_head.png') {
                info.head = this.commonMixinGetUserPhoto(50, value.source);
            } else {
                info.head = value.sourceHead || this.commonMixinGetUserPhoto(50, value.source);
            }
            info.link = 'javascript:;';
        } else if (value.properties) {
            let from = value.properties.from ? value.properties.from.toLowerCase() : '';
            switch (true) {
                case from.indexOf('unsplash') > -1:
                    info.author = value.properties.author || value.properties.from;
                    info.head = require('@/assets/pc/images/common/unsplash.png');
                    info.link = 'https://unsplash.com/';
                    break;
                case from.indexOf('pexels') > -1:
                    info.author = value.properties.author || value.properties.from;
                    info.head = require('@/assets/pc/images/common/pexels.png');
                    info.link = 'https://www.pexels.com/zh-cn/';
                    break;
                case from.indexOf('pixabay') > -1:
                    info.author = value.properties.author || value.properties.from;
                    info.head = require('@/assets/pc/images/common/pixabay.png');
                    info.link = 'https://pixabay.com/zh/';
                    break;
                default:
                    info.author = value.properties.author || value.properties.from || '网络';
                    if (info.author === '网络') {
                        info.head = require('@/assets/pc/images/common/network.png');
                    } else {
                        info.head = this.commonMixinGetUserPhoto(50, info.author);
                    }
                    info.link = 'javascript:;';
                    break;
            }
        } else {
            info.author = '网络';
            info.head = require('@/assets/pc/images/common/network.png');
            info.link = 'javascript:;';
        }
        return info;
    },
};
export default common