/**
 * 关于校验相关的接口方法统一在这个js文件封装处理
 */
import axios from '@/util/axios.js';

export default {
    // 修改手机号-提交
    change_mobile_submit_post(opt) {
        let option = {
            mid: '',
            phone: '',
            code: '',
            type: '',
            success: null,
            fail: null
        };
        option = Object.assign(option, opt);
        axios.post('/api/member/change_mobile_submit/', {
            mid: option.mid,
            mobile: option.phone,
            code: option.code,
            type: option.type
        }).then(data => {
            if (data.data.code === '2') {
                if (typeof option.success === "function") option.success(data);
            } else {
                if (typeof option.fail === "function") option.fail(data);
            }
        }).catch(err => {
            if (typeof option.fail === "function") option.fail(err);
        });
    },
    // 修改邮箱账号 - 验证新邮箱 - 提交
    change_email_submit_post(opt) {
        let option = {
            mid: '',
            email: '',
            code: '',
            type: '',
            success: null,
            fail: null
        };
        option = Object.assign(option, opt);
        axios.post('/api/member/email_confr/', {
            mid: option.mid,
            email: option.email,
            code: option.code,
            type: option.type
        }).then(data => {
            if (data.data.code === '2') {
                if (typeof option.success === "function") option.success(data);
            } else {
                if (typeof option.fail === "function") option.fail(data);
            }
        }).catch(err => {
            if (typeof option.fail === "function") option.fail(err);
        });
    },
}