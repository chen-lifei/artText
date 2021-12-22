import Vue from 'vue';
import 'es6-promise/auto';
import '@/assets/pc/js/jquery-ui.min.js';
import '@/assets/common/js/utils.js';
import '@/assets/common/js/validate.js';
import '@/assets/pc/js/md5.js';
import '@/assets/common/js/script_object_compatible.js';
import '@/assets/iconfont/iconfont.js';
import 'intersection-observer';
import { createApp } from '@/app';
import lazyload from 'vue-lazyload';
import wxjssdk from 'weixin-js-sdk';
import clipboard from 'vue-clipboard2';
import WangEditor from 'wangeditor';
import axios from '@/util/axios.js';
import rsa from '@/assets/pc/js/rsa.js';
import common from '@/assets/pc/js/common.js';
import toast from '@/components/toast/toast.js';
import modal from '@/components/modal/modal.js';
import offline from '@/components/offline/offline.js';
import Import from '@/components/import/import.js';
import tooltip from '@/components/tooltip/tooltip.js';
import pay from '@/assets/common/js/pay.js';
import base64 from '@/assets/pc/js/base64.js';
import Export from '@/assets/common/js/export.js';
import script_error from '@/assets/common/js/script_error.js';
import res_error from '@/assets/common/js/response_error.js';
import res_complete from '@/assets/common/js/response_complete.js';
import img_format from '@/assets/common/js/directive/img_format.js';
import analytics from '@/assets/common/js/directive/analytics.js';
import member_rankauthorities from '@/assets/common/js/member_rankauthorities.js';
import upload_status from '@/components/uploadStatus/uploadStatus.js';


Vue.use(tooltip);
Vue.use(clipboard);
Vue.use(lazyload, {
    filter: {
        webp(listener, options) {
            if (!options.supportWebp) return;
            if (!listener.src) return;
            listener.src = img_format.get_webp(listener.src);
        }
    }
});
Vue.prototype.$toast = toast;
Vue.prototype.$upload_status = upload_status;
Vue.prototype.$modal = modal;
Vue.prototype.$axios = axios;
Vue.prototype.$common = common;
Vue.prototype.$pay = pay;
Vue.prototype.$rsa = rsa;
Vue.prototype.$base64 = base64;
Vue.prototype.$error = script_error;
Vue.prototype.$export = Export;
Vue.prototype.$import = Import;
Vue.prototype.$bdtongji = analytics.bdtongji;
Vue.prototype.$check_rankauth = member_rankauthorities.check;

// 断网检测  自执行
offline();

// script报错监测
script_error.ready();

// 挂载构造方法
window.wxjssdk = wxjssdk;
window.WangEditor = WangEditor;

// 定义全局的一个 Ajax 错误方法
$(document).ajaxError(function(event,xhr,options,exc) {
  if(!xhr.setRequestHeader) return;
  res_error(xhr,true);
});
// 定义全局的一个 Ajax 完成方法
$(document).ajaxComplete(function(event,xhr,options) {
  if(!xhr.setRequestHeader) return;
  if(!xhr.customConfig) xhr.customConfig = {};
  xhr.customConfig.url = options.url;
  res_complete(xhr,true);
});
// 微信返回阻止
common.hold_back();
// 小程序访问web页面，返回小程序对应页面
common.page_from_miniprogram();
// 获取会员权限map
member_rankauthorities.initialize();
// 手机端触发编辑底部按钮隐藏方法初始化
common.resize_hidden_element_init();

const { app, router, store } = createApp();

// 接管 node 传输的初始化状态
if (window.__INITIAL_STATE__) store.replaceState(window.__INITIAL_STATE__);



router.onReady(() => {
  router.beforeResolve((to, from, next) => {
    const matched = router.getMatchedComponents(to)
    const prevMatched = router.getMatchedComponents(from)
    let diffed = false
    const activated = matched.filter((c, i) => {
      return diffed || (diffed = (prevMatched[i] !== c))
    })
    const asyncDataHooks = activated.map(c => c.asyncData).filter(_ => _)
    if (!asyncDataHooks.length) {
      return next()
    }

    Promise.all(asyncDataHooks.map(hook => hook({ store, route: to })))
      .then(() => {
        next()
      })
      .catch(next)
  });

  // actually mount to DOM
  app.$mount('#app')
});


