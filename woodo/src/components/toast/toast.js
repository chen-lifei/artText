import Vue from 'vue';
import Toast from '@/components/toast/toast.vue';     //引入组件
let ToastConstructor  = Vue.extend(Toast) // 返回一个“扩展实例构造器”  
  
let myToast = (param,duration,callback,imgUrl,type)=>{
    if (!param) return false;
    // 清理多余toast
    if (type === 'clear') $('.toast').remove();

    let toastDom = new ToastConstructor({  
        el:document.createElement('div')    //将toast组件挂载到新创建的div上  
    });
    
    toastDom.text = param.text || param;
    toastDom.duration = duration || 1000;
    if (typeof callback === 'string'){
        toastDom.type = callback;
        if (typeof imgUrl !== 'undefined'){
            toastDom.had_img = true;
            toastDom.img_url = imgUrl;  
        }
    }

    let el = param.el || document.body;
    el.appendChild(toastDom.$el); //把toast组件的dom添加到节点 里  

    if (type === 'clear') {
        setTimeout(function () {
            toastDom.isShow = false;
            if (callback && typeof callback === 'function') callback();
        }, 2000);
    } else {
        setTimeout(function () {
            toastDom.isShow = false;
            if (callback && typeof callback === 'function') callback();
        }, toastDom.duration);
    }
}  
export default myToast;  
// tost调用方法
/* 
    1、page页引用
       import toast from '@/components/toast/toast.js';
       Vue.prototype.$toast = toast;
    2、方法调用
       this.$toast('内容','停留时间')
*/