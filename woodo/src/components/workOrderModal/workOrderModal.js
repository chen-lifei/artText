import Vue from "vue";
import workOrderModal from './workOrderModal.vue';
let workOrderModalConstructor = Vue.extend(workOrderModal);
// 是否打开了工单模态框
let isOpen = false;
export default function(options = {}) {
    if(isOpen) return;
    isOpen = true;
    let { close = null } = options;
    let instance = new workOrderModalConstructor();
    let destroy = function() {
        document.body.removeChild(instance.$el);
        instance.$destroy();
        isOpen = false;
    }
    // 关闭
    instance.$once(`close`, () => {
        utils.isFunctionCall(close);
        destroy();
    });
    instance.$mount();
    document.body.appendChild(instance.$el);
}