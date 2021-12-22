import Vue from 'vue'

//启动标示
const enabled_flag = true;

//webp指令
const webp = Vue.directive('webp', (el, binding) => {
    if(el.getAttribute('lazy')){//有懒加载就不用当前指令功能
        return;
    }
    if(!binding.value || el.dataset.src === binding.value){
        return;
    }
    el.dataset.src = binding.value;
    el.setAttribute('src', get_webp(binding.value));
});

// 预先加载模糊图后加载webp格式原图
const dim2webp = Vue.directive('dim2webp', (el, binding) => {
    let bindvalue = binding.value;
    let option = {
        url: '',
        disableDim: false,      // 禁用预加载模糊图
        simple: false,          // 简单模式（缩略模式）
    };
    let opturl = '';
    // 参数为字符串，默认模式
    if (typeof bindvalue === 'string') {
        opturl = bindvalue;
    }
    // 参数为对象，可使用其他模式
    if (Object.prototype.toString(bindvalue) === '[object Object]') {
        option = Object.assign(option, bindvalue);
        opturl = option.url;
    }
    if (!opturl) return;
    let tag = el.tagName;
    let src = '';
    let low = `quality,q_70/blur,r_5,s_50`;
    let resize = `resize,w_300,limit_0`;
    let thumbnail = `quality,q_30`;
    switch (tag) {
        // html img 标签
        case 'IMG':
            src = el.src;
            if (src === opturl) return;
            el.onerror = event => {
                if (el.src === opturl) return;
                el.src = opturl
            };
            if (option.simple) {
                el.src = get_webp(opturl, resize, thumbnail);
                return;
            }
            // 仅首次进行模糊图加载
            if (!option.disableDim && !src && opturl.indexOf(low) < 0) {
                // 加载原图
                el.onload = event => {
                    el.onload = null;
                    el.src = get_webp(opturl);
                }
                // 加载模糊图
                el.src = get_webp(opturl, low);
                return;
            }
            el.src = get_webp(opturl);
            break;
        // svg image 标签
        case 'image':
            src = el.getAttribute('href');
            if (src === opturl) return;
            el.onerror = event => {
                if (el.getAttribute(`href`) === opturl || el.getAttribute('xlink:href') === opturl) return;
                el.setAttribute('href', opturl);
                el.setAttribute('xlink:href', opturl);
            }
            if (option.simple) {
                el.setAttribute('href', get_webp(opturl, resize, thumbnail));
                el.setAttribute('xlink:href', get_webp(opturl, resize, thumbnail));
                return;
            }
            // 仅首次进行模糊图加载
            if (!option.disableDim && !src && opturl.indexOf(low) < 0) {
                // 加载原图
                el.onload = event => {
                    el.onload = null;
                    el.setAttribute('href', get_webp(opturl));
                    el.setAttribute('xlink:href', get_webp(opturl));
                }
                // 加载模糊图
                el.setAttribute('href', get_webp(opturl, low));
                el.setAttribute('xlink:href', get_webp(opturl, low));
                return;
            }
            el.setAttribute('href', get_webp(opturl));
            el.setAttribute('xlink:href', get_webp(opturl));
            break;
        // 其他标签背景图片
        default:
            src = getComputedStyle(el)['backgroundImage'];
            if (option.simple) {
                el.style.backgroundImage = `url(${get_webp(opturl, thumbnail)})`;
                return;
            }
            // 仅首次进行模糊图加载
            if (!option.disableDim && !src || src === 'none') {
                // 加载模糊图
                el.style.backgroundImage = `url(${get_webp(opturl, low)})`;
                // 加载原图
                let img = new Image();
                img.onload = event => {
                    el.style.backgroundImage = `url(${img.src})`;
                }
                img.src = get_webp(opturl);
                return;
            }
            el.style.backgroundImage = `url(${get_webp(opturl)})`;
            break;
    }
});

//获取webp
const get_webp = function(src){
    if(!enabled_flag|| typeof(window) === 'undefined'){
        return src;
    }
    if(!src){
        return src;
    }
    //是否支持webp
    let support_webp = window.support_webp;
    if(typeof(support_webp) === 'undefined'){
        support_webp = get_support_webp();
    }
    //不支持，则不处理
    if(!support_webp){
        return src;
    }
    //是否是base64
    if(src.indexOf('data:image') !== -1){
        return src;
    }
    //是否是oss图片
    if (src.indexOf('oss-cn-shenzhen.aliyuncs.com') !== -1 || src.indexOf('file.woodo.cn') !== -1) {
        // 处理.jpg|jpeg|png(目前oss上传图片返回有点问题需要处理.image/jpeg|jpg|png后缀)
        if (src.match(/\.(jpe?g|png|gif)/) || src.match(/\.image\/(jpe?g|png|gif)/)) {
            let oss_process = '?x-oss-process=';
            // 已存在oss配置无需重新配置
            if (src.indexOf(oss_process) >= 0) {
                return src;
            }
            let oss_process_params = ['image'];
            // 支持webp
            if (support_webp) {
                oss_process_params.push('format,webp');
            }
            // 自定义参数
            let params = Array.from(arguments).slice(1);
            if (params.length) {
                params.forEach(item => {
                    if (item && typeof item === 'string') {
                        oss_process_params.push(item);
                    }
                });
            }
            if (oss_process_params.length > 1) {
                src = src + oss_process + oss_process_params.join('/');
            }
            return src;
        }
    }
    //是否是本地图片
    //if(src.indexOf('/dist/') !== -1){
    //    if(support_webp && src.match(/\.(jpe?g|png)/) !== null){//处理.jpg|jpeg|png
    //        return  src + '.webp';
    //    }
    //}
    return src;
}

//获取是否支持webp
const get_support_webp = function(){
    if(typeof(window) === 'undefined'){
        return false;
    }
    return document.createElement('canvas').toDataURL('image/webp').indexOf('data:image/webp') >= 0;
}

//一般获取一次，降低成本
if(typeof(window) !== 'undefined'){
    window['support_webp'] = get_support_webp();
}
export default {webp, dim2webp, get_webp}