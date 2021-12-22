/**
 * 关于支付相关的方法统一在这个js文件封装处理
 */
import axios from '@/util/axios';
import toast from '@/components/toast/toast';
import common from '@/assets/pc/js/common';

export default {
    // 创建 vip 订单
    create_vip_order (opt) {
        let options = {
            param: {},
            success: null,
            fail: null,
            complete: null,
            error: null,
        };
        options = Object.assign(options, opt);
        // 创建订单
        axios.post('/api/member/order/create_vip_order/', options.param).then((result)=>{
            let data = result.data;
            if (data.type === 'success') {
                if (typeof(options.success) === 'function') {
                    options.success(data.data);  //  订单编号
                }
            } else {
                if (typeof(options.fail) === 'function') {
                    options.fail(data);
                }
            }
            if (typeof(options.complete) === 'function') {
                options.complete(data);
            }
        }).catch((err)=>{
            console.error(err);
            if (typeof(options.error) === 'function') {
                options.error(err);
            }
        });
    },
    // 创建 幻币 订单
    create_hcoin_order (opt) {
        let options = {
            param: {},
            success: null,
            fail: null,
            complete: null,
            error: null,
        };
        options = Object.assign(options, opt);
        // 创建订单
        axios.post('/api/member/order/create_hcoin_recharge_order/', options.param).then((result)=>{
            let data = result.data;
            if (data.type === 'success') {
                if (typeof(options.success) === 'function') {
                    options.success(data.data);  //  订单编号
                }
            } else {
                if (typeof(options.fail) === 'function') {
                    options.fail(data);
                }
            }
            if (typeof(options.complete) === 'function') {
                options.complete(data);
            }
        }).catch((err)=>{
            console.error(err);
            if (typeof(options.error) === 'function') {
                options.error(err);
            }
        });
    },
    // 支付提交方法  微信环境唤起微信支付
    payment (order_sn, opt) {
        if (!order_sn) return console.error('订单单号错误！！！');
        let options = {
            success: null,
            WXPaySuccess: null,
            fail: null,
            complete: null,
            error: null,
        };
        options = Object.assign(options, opt);
        let dev = utils.deviceENV();
        // 微信浏览器支付唤起
        if (dev.mobile && dev.wechat) {
            axios.get(`/api/member/payment/wx/${order_sn}/`).then((result)=>{
                let data = result.data;
                if (data.flag) {
                    WeixinJSBridge.invoke('getBrandWCPayRequest', {
                        'appId': data.app_id,
                        'timeStamp': data.timeStamp,
                        'nonceStr': data.nonceStr,
                        'package': data.packageStr,
                        'signType': data.signType,
                        'paySign': data.paySign,
                    }, (res)=>{
                        /*
                         *  get_brand_wcpay_request:ok = 支付成功
                         *  get_brand_wcpay_request:cancel = 支付取消
                         */
                        if (res.err_msg === 'get_brand_wcpay_request:ok') {
                            if (typeof(options.WXPaySuccess) === 'function') {
                                options.WXPaySuccess(data, res);
                            }
                        }
                    });
                } else {
                    if (typeof(options.fail) === 'function') {
                        options.fail(data);
                    }
                }
                if (typeof(options.complete) === 'function') {
                    options.complete(data);
                }
            }).catch((err)=>{
                console.error(err);
                if (typeof(options.error) === 'function') {
                    options.error(err);
                }
            });
            return;
        }
        axios.get(`/api/member/payment/${order_sn}/`).then((result)=>{
            let data = result.data;
            if (data.type === 'success') {
                data = data.data;
                if (data.type === 'weixin') {
                    if (dev.mobile && !dev.wechat) {
                        toast('请在微信中支付！', 1000);
                    } else {
                        if (typeof(options.success) === 'function') {
                            options.success(data);
                        }
                    }
                } else if (data.type === 'alipay') {
                    // 支付宝支付 自动提交表单
                    let form = document.createElement('form');
                    form.id = 'alipay-form';
                    form.action = data.requestUrl;
                    form.method = data.requestMethod;
                    form.acceptCharset = data.requestCharset;
                    for (let item in data.parameterMap) {
                        let input = document.createElement('input');
                        input.type = 'hidden';
                        input.name = item;
                        input.value = data.parameterMap[item];
                        form.appendChild(input);
                    }
                    document.body.appendChild(form);
                    document.getElementById('alipay-form').submit();
                }
            } else {
                if (typeof(options.fail) === 'function') {
                    options.fail(data);
                }
            }
            if (typeof(options.complete) === 'function') {
                options.complete(data);
            }
        }).catch((err)=>{
            console.error(err);
            if (typeof(options.error) === 'function') {
                options.error(err);
            }
        });
    },
    // 检查订单支付状态
    order_status (order_sn, opt) {
        if (!order_sn) return console.error('订单单号错误！！！');
        let options = {
            success: null,
            complete: null,
            error: null,
        };
        options = Object.assign(options, opt);
        axios.get(`/api/member/order/${order_sn}/status/`).then((result)=>{
            let data = result.data;     // boolean
            if (data) {
                if (typeof(options.success) === 'function') {
                    options.success();
                }
            }
            if (typeof(options.complete) === 'function') {
                options.complete();
            }
        }).catch((err)=>{
            console.error(err);
            if (typeof(options.error) === 'function') {
                options.error(err);
            }
        });
    },
    // 获取支付结果
    payment_result (payment_sn, opt) {
        if (!payment_sn) return console.error('支付单号错误！！！');
        let options = {
            complete: null,
            error: null,
        };
        options = Object.assign(options, opt);
        axios.get(`/api/member/payment/${payment_sn}/result/`).then((result)=>{
            let data = result.data;
            if (typeof(options.complete) === 'function') {
                options.complete(data);
            }
        }).catch((err)=>{
            console.error(err);
            if (typeof(options.error) === 'function') {
                options.error(err);
            }
        });
    },
    // 幻币支付
    create_download_order (opt) {
        if (!opt.param.id) {
            console.error('商品id错误');
            return;
        } 
        if (!opt.param.downloadType) {
            console.error('幻币支付类型错误');
            return;
        }
        let options = {
            param: {},
            complete: null,
            success: () => { 
                toast('购买成功，点击下载按钮下载文档！')
            },
            fail: () => {
                toast('支付失败，请稍后重试!')
            },
            error: () => {
                toast('支付失败，请稍后重试!')
            },
        };
        options = Object.assign(options, opt);

        let param = options.param;
        let success_function = function () {
            axios.post('/api/member/order/create_download_order/', param).then((result) => {
                let data = result.data;
                if (data.type === 'success') {
                    if (typeof (options.success) === 'function') {
                        options.success(data.data);
                    }
                } else {
                    if (typeof (options.fail) === 'function') {
                        options.fail(data);
                    }
                }
                if (typeof (options.complete) === 'function') {
                    options.complete(data);
                }
            }).catch((err) => {
                console.error(err);
                if (typeof (options.error) === 'function') {
                    options.error(err);
                }
            });
        }

        if (param.downloadType === 'material' && param.iconUrl.indexOf(';base64') >= 0) {
            common.upload_image({
                base64: param.iconUrl,
                success: (image) => {
                    param.iconUrl = image;
                    success_function();
                },
                error: ()=>{
                    toast('支付失败，请稍后重试!');
                }
            });
        } else {
            success_function();
        }
    },
    // 2.6.8后新版支付流程（手机扫码支付）
    new:{
        get_order_qrcode(opt){
            let options = {
                param: {},
                success: null,
                fail: null,
                complete: null,
                error: null,
            };
            options = Object.assign(options, opt);
            axios.get('/api/order/get_qrcode/',{params: options.param}).then((result)=>{
                let data = result.data;
                if (data.type === 'success') {
                    if (typeof(options.success) === 'function') {
                        options.success(data.data);  //  订单编号
                    }
                } else {
                    if (typeof(options.fail) === 'function') {
                        options.fail(data);
                    }
                }
                if (typeof(options.complete) === 'function') {
                    options.complete(data);
                }
            }).catch((err)=>{
                console.error(err);
                if (typeof(options.error) === 'function') {
                    options.error(err);
                }
            });
        },
        check_order_qrcode(opt){
            let options = {
                param: {},
                success: null,
                fail: null,
                complete: null,
                error: null,
            };
            options = Object.assign(options, opt);
            axios.get('/api/order/check_qrcode/',{params: options.param}).then((result)=>{
                let data = result.data;
                if (data.status) {
                    if (typeof(options.success) === 'function') {
                        options.success(data);
                    }
                } else {
                    if (typeof(options.fail) === 'function') {
                        options.fail(data);
                    }
                }
                if (typeof(options.complete) === 'function') {
                    options.complete(data);
                }
            }).catch((err)=>{
                console.error(err);
                if (typeof(options.error) === 'function') {
                    options.error(err);
                }
            });
        },
        create_order(opt){
            let options = {
                param: {},
                success: null,
                fail: null,
                complete: null,
                error: null,
            };
            options = Object.assign(options, opt);
            //根据环境确认支付方式
            let dev = utils.deviceENV();
            options.param['pluginId'] = dev.mobile && dev.wechat ? "weixinPayPlugin" : "wapAlipayDirectPlugin";
            axios.post('/api/order/create/', options.param).then((result)=>{
                let data = result.data;
                if (data.type === 'success') {
                    if (typeof(options.success) === 'function') {
                        options.success(data.data);
                    }
                } else {
                    if (typeof(options.fail) === 'function') {
                        options.fail(data);
                    }
                }
                if (typeof(options.complete) === 'function') {
                    options.complete(data);
                }
            }).catch((err)=>{
                console.error(err);
                if (typeof(options.error) === 'function') {
                    options.error(err);
                }
            });
        },
        payment (order_sn, opt) {
            let options = {
                param: {},
                success: null,
                WXPaySuccess: null,
                WXPayCancel: null,
                fail: null,
                complete: null,
                error: null,
            };
            options = Object.assign(options, opt);
            //根据环境确认支付方式
            let dev = utils.deviceENV();
            options.param['pluginId'] = dev.mobile && dev.wechat ? "weixinPayPlugin" : "wapAlipayDirectPlugin";            
            axios.get(`/api/payment/${order_sn}/`,{params: options.param}).then((result)=>{
                let data = result.data;
                if(data.type === 'success'){
                    data = data.data;
                    if(dev.mobile && dev.wechat){
                        //微信支付
                        WeixinJSBridge.invoke('getBrandWCPayRequest', {
                            'appId': data.app_id,
                            'timeStamp': data.timeStamp,
                            'nonceStr': data.nonceStr,
                            'package': data.packageStr,
                            'signType': data.signType,
                            'paySign': data.paySign,
                        }, (res)=>{
                            /*
                             *  get_brand_wcpay_request:ok = 支付成功
                             *  get_brand_wcpay_request:cancel = 支付取消
                             */
                            if (res.err_msg === 'get_brand_wcpay_request:ok') {
                                if (typeof(options.WXPaySuccess) === 'function') {
                                    options.WXPaySuccess(data, res);
                                }
                            }else if(res.err_msg === 'get_brand_wcpay_request:cancel'){
                                if(typeof(options.WXPayCancel) === 'function'){
                                    options.WXPayCancel(data, res);
                                }
                            }
                        });
                    }else{
                        //支付宝支付
                        if (typeof(options.success) === 'function') {
                            options.success(data);
                        }
                        let form = document.createElement('form');
                        form.id = 'alipay-form';
                        form.action = data.requestUrl;
                        form.method = data.requestMethod;
                        form.acceptCharset = data.requestCharset;
                        for (let item in data.parameterMap) {
                            let input = document.createElement('input');
                            input.type = 'hidden';
                            input.name = item;
                            input.value = data.parameterMap[item];
                            form.appendChild(input);
                        }
                        document.body.appendChild(form);
                        document.getElementById('alipay-form').submit();
                    }
                }else{
                    if (typeof(options.fail) === 'function') {
                        options.fail(data);
                    }
                }
                if (typeof(options.complete) === 'function') {
                    options.complete(data);
                }
            }).catch((err)=>{
                console.error(err);
                if (typeof(options.error) === 'function') {
                    options.error(err);
                }
            });
        },
        payment_result (payment_sn, opt) {
            if (!payment_sn) return console.error('支付单号错误！！！');
            let options = {
                complete: null,
                error: null,
            };
            options = Object.assign(options, opt);
            axios.get(`/api/payment/${payment_sn}/result/`).then((result)=>{
                let data = result.data;
                if (typeof(options.complete) === 'function') {
                    options.complete(data);
                }
            }).catch((err)=>{
                console.error(err);
                if (typeof(options.error) === 'function') {
                    options.error(err);
                }
            });
        },
        order_status (order_sn, opt) {
            if (!order_sn) return console.error('订单单号错误！！！');
            let options = {
                success: null,
                complete: null,
                error: null,
            };
            options = Object.assign(options, opt);
            axios.get(`/api/order/${order_sn}/result/`,{params: {
                sn: order_sn
            }}).then((result) => {
                let data = result.data;     // boolean
                if (data.status) {
                    if (typeof(options.success) === 'function') {
                        options.success(data);
                    }
                }
                if (typeof(options.complete) === 'function') {
                    options.complete();
                }
            }).catch((err) => {
                console.error(err);
                if (typeof(options.error) === 'function') {
                    options.error(err);
                }
            })
        },
    }
};