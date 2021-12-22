/**
 *  文档、模板、素材、作品的下载方法统一在这里封装
 * 
 *  下载流程:
 *  1、文档、作品、模板
 *  获取导出信息 success -> 成功回调(options.success),展示进度条,创建下载任务 -> 查询下载状态 -> 下载成功 -> 完成回调(options.complete),执行下载委托
 *              error  -> 失败回调(options.error), 进入403处理流程（模板在403中要回到自己vue文件处理后续流程）
 * 
 *  2、素材
 *  获取导出信息 success -> 成功回调(options.success),展示进度条,执行前端下载方法 -> 下载成功 -> 完成回调(options.complete)
 *              error  -> 失败回调(options.error), 进入403处理流程
 * 
 *  参数信息：
 * $export.start(options)
 * @param param {
 *    opt: 下载类型 documentDownload、 templateDownload、 worksShareDownload、 materialDownload
 *    id:  文件id （全部用文档id）
 * }
 * @param fileType       文件类型 ppt || pdf || img || long_image
 * @param title          文件名称
 * @param emailAddress   邮件地址 null时为正常文件下载
 * @param triggerSource  触发来源  vip：会员免费下载按钮(403后直接跳转会员充值页面) 
 * @param progress       进度条参数
 * @param success        可以下载回调
 * @param error          不可下载回调
 * @param fail           下载失败回调
 * @param complete       完成下载 || 邮件发送成功回调
 *  *
 */
import qs from 'qs';
import axios from '@/util/axios';
import toast from '@/components/toast/toast';
import modal from '@/components/modal/modal';

let progressDom = null;               // 进度条控制器
let progressCount = 0;                // 进度条数值
let progressCount_timer = '';         // 进度条定时器
let cancel_download = false;          // 中止下载状态
let export_fail = Function;           // 下载失败回调
let export_error = Function;          // 不允许下载回调（403）
let export_success = Function;        // 允许下载回调
let export_complete = Function;       // 下载完成回调
let terminal = utils.deviceENV().mobile ? 'wap' : 'pc'; // 用户终端类型

// 开始下载流程
function start(opt) {
    if (!opt.param || !opt.param.opt || !opt.param.id) {
        return toast('导出失败，请稍后再试', 1500, terminal);
    }
    if (typeof opt.error === 'function') {
        export_error = opt.error;
    }
    if (typeof opt.success === 'function') {
        export_success = opt.success;
    }
    if (typeof opt.complete === 'function') {
        export_complete = opt.complete;
    }
    export_fail = () => {
        if (typeof opt.fail === 'function') {
            opt.fail();
        }
        cancel();
        close_progress('fail');
        toast('导出失败，请稍后再试', 1500, terminal);
    };

    // 保存触发来源
    axios.defaults.customConfig['triggerSource'] = opt.triggerSource;
    axios.defaults.customConfig['orderData'] = {
        name: opt.title,
        cover: opt.cover,
    };
    cancel_download = false;
    // 获取导出任务信息
    opt.param.exportType = opt.fileType;
    if(opt.param.opt === 'documentDownload' && opt.taskJson && opt.taskJson.longImage){
        opt.param.exportType = 'long_image'
    }
    axios.get('/api/member/get_export_task_msg/', {
        params: opt.param
    })
    .then((result) => {
        let res_data = result.data;
        if (res_data.type === 'success') {
            res_data.data.emailAddress = opt.emailAddress || null;
            res_data.data.fileType = opt.fileType || 'ppt';
            res_data.data.fileTitle = $validate(opt.title).empty() ? data.data.title : opt.title;
            res_data.data.taskJson = Object.assign(opt.taskJson || {}, res_data.data.taskJson);
            export_success();
            if (cancel_download) {
                return;
            }
            // 素材下载
            if (opt.param.opt === 'materialDownload') {
                let options = Object.assign(opt, res_data.data.material);
                download_material(options);
            } else {
                // 创建下载任务
                create_task(res_data.data);
                // 展示进度条
                show_progress(opt.progress);
            }
            cancel_download = false;
        } else {
            // 用户未绑定手机号和邮箱情况
            if (res_data.data === 'bind') {
                cancel();
                export_complete('cancel');
                modal({
                    modalClass: 'bind-modal',
                    modalTitle: '下载提示',
                    modalContent: `<p>${res_data.content}</p>`,
                    showCancel: false,
                    buttonSubmitTxt: '立刻绑定',
                    submitCallback() {
                        window.open(window.location.origin + '/member/');
                    },
                });
            } else {
                export_fail()
            }
        }
    }).catch(err => {
        if (err.response.status !== 403) {
            return export_fail();
        }
        cancel();
        export_complete(403);
        // 403情况（非会员）
        err.response.callback = export_error;
    });
};

// 创建下载任务
function create_task(opt) {
    if (!opt.fileType || !opt.downloadHost || !opt.uuid || !opt.uuidSign || !opt.taskJson) {
        return toast('导出缺少必要参数', 1500, terminal);
    }
    let task_json = opt.taskJson;
    // 判断当前系统支持的默认字体
    let defaultFont = utils.getSystemDefaultFont();
    task_json["defaultFont"] = defaultFont;
    // 设置终端类型
    task_json['terminal'] = terminal.toUpperCase();

    axios.post(`${opt.downloadHost}/api/task/create_export_task/`, {
        type: opt.fileType,
        taskJson: JSON.stringify(task_json),
        uuid: opt.uuid,
        uuidSign: opt.uuidSign
    }).then(result => {
        let res_data = result.data;
        if (res_data.type === 'success') {
            if (cancel_download) {
                return;
            }
            // 查询下载状态
            check_task_status(opt);
        } else {
            export_fail();
        }
    }).catch(err => {
        export_fail();
    });
};

// 查询下载状态
function check_task_status(opt) {
    axios.get(`${opt.downloadHost}/api/task/check_task_status/?uuid=${opt.uuid}`)
        .then(res => {
            let res_data = res.data;
            if (res_data.type === 'success') {
                try {
                    let result = JSON.parse(res_data.content);
                    if (cancel_download) {
                        return;
                    }
                    if (result.status === 'fail') {
                        return export_fail();
                    }
                    if (result.status === 'complete') {
                        let options = Object.assign(opt, result);
                        // 发送邮件
                        if (options.emailAddress) {
                            send_email(options);
                        } else {
                            // 进度条完成
                            progressCount = 100;
                            $('#export_progress').css('width', `100%`);
                            setTimeout(function () {
                                let file_info = {
                                    downMsg: options.downMsg,
                                    fileName: options.fileName,
                                    title: options.fileTitle,
                                };
                                let download_src = `${options.downloadHost}/api/task/download_doc/?${qs.stringify(file_info)}`;
                                // 关闭进度条
                                close_progress();
                                // 下载委托
                                entrust_download(download_src);
                            }, 1000);
                        }
                    } else {
                        setTimeout(() => {
                            check_task_status(opt);
                        }, 800);
                    }
                } catch (error) {
                    export_fail();
                }
            } else {
                export_fail();
            }
        }).catch((err) => {
            export_fail();
        });
};

// 下载委托
function entrust_download(src) {
    if ($validate(src).empty()) {
        return toast('错误的下载链接', 1500, terminal);
    }
    if (cancel_download) {
        return;
    }
    $('.entrust_download').remove();
    let $iframe = $('<iframe>').hide().prop('src', src).appendTo('body');
    $iframe.addClass('entrust_download');

    let checked_interval_timer = setInterval(function () {
        //频率控制
        let isLimit = $iframe.contents().find("body").text();
        let success = utils.getCookies('downloadSuccess');
        if (!$validate(success).empty() || isLimit == "limit") {
            clearInterval(checked_interval_timer);
            utils.deleteCookies('downloadSuccess');
            if (isLimit == "limit") {
                toast("您的请求过于频繁,请稍后再试~", 1500, terminal);
            }
        }
    }, 300);
};

// 发送邮件
function send_email (opt) {
    if (!$validate(opt.emailAddress).email()) {
        return toast('邮箱地址错误，请重新填写', 1500, terminal);
    }
    axios.post(`${opt.downloadHost}/api/task/send_email/`, {
        downMsg: opt.downMsg,
        fileName: opt.fileName,
        title: opt.fileTitle,
        email: opt.emailAddress
    }).then(function (data) {
        // 进度条完成
        progressCount = 100;
        setTimeout(() => {
            // 发送完成
            close_progress();
            if (data.data.type === 'success') {
                if (terminal === 'pc') {
                    toast('邮件发送成功', 2000, 'pc', undefined, 'clear');
                } else {
                    that.$modal({
                        modalClass: 'send_success_modal',
                        modalTitle: '',
                        modalContent: `<div class="success_icon"></div><p>发送成功</p>`,
                        showSubmit: false,
                        showCancel: false,
                    });
                }
            } else {
                toast(data.data.content, 5000, terminal, undefined, 'clear');
            }
            export_complete(data.data.type === 'success' ? 'success' : 'fail');
        }, 1000);
    }).catch(function (data) {
        export_fail();
    })
};

// 下载素材 type => 素材类型 svg、png
function download_material(opt) {
    let file_type = 'png';
    let largeImage = opt.isIcon ? (opt.cover || opt.largeImage) : opt.largeImage;
    let name = opt.name || 'woodo';
    if (name.lastIndexOf('.') >= 0) {
        name = name.slice(0, name.lastIndexOf('.'));
    }
    // 渲染原图
    if (largeImage.indexOf('?') > 0) {
        largeImage = largeImage.slice(0, largeImage.indexOf('?'));
    }
    file_type = ['jpg', 'svg', 'gif'].lastIndexOf(largeImage.slice(-3)) >= 0 ? largeImage.slice(-3) : 'png';
    // 获取图片代理 (base64格式的图片不用)
    if (largeImage.indexOf('http') >= 0 ){
        largeImage = utils.getImageProxyUrl(largeImage);
    }
    if ($validate(largeImage).empty()) {
        return toast('错误的下载链接', 1500, terminal);
    }
    if (largeImage) {
        let a = document.createElement('a');
        a.href = largeImage;
        a.download = `${name}.${file_type}`;
        document.body.appendChild(a);
        a.click();
        a.remove(); 
    } else {
        console.error('图片下载错误');
    }
    export_complete();
};

// 展示进度条
function show_progress(opt) {
    if (!opt) {
        return;
    }
    modal({
        modalClass: opt.modalClass,
        modalTitle: opt.modalTitle,
        modalContent: `<div class="progress_bar"><div id="export_progress" class="progress" style="width:${progressCount}%"></div></div><p>${opt.modalContent}</p>`,
        showClose: false,
        showSubmit: false,
        buttonCancelTxt: '取消',
        openCallback($modal) {
            progressDom = $modal;
            // 进度条定时器
            progressCount_timer = setInterval(function () {
                if (progressCount >= 95) {
                    clearInterval(progressCount_timer);
                } else {
                    progressCount += 5;
                }
                $('#export_progress').css('width', `${progressCount}%`);
            }, 500);
        },
        cancelCallback() {
            cancel();
            close_progress();
        },
    });
};

// 关闭进度条
function close_progress(type = 'success') {
    clearInterval(progressCount_timer);
    if (progressDom) progressDom.close();
    export_complete(type);
};

// 取消导出
function cancel() {
    cancel_download = true;
};

export default {
    start,
    cancel,
    entrust_download,
    download_material,
}