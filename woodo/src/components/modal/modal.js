import Vue from 'vue';
import Modal from '@/components/modal/modal.vue';
import HcoinRechargeModal from '@/components/HcoinRechargeModal.vue';
import MemberGradeModal from '@/components/MemberGradeModal.vue';

let ModalConstructor = '';

let modal = (opt = {}) => {
    switch (opt.templateType) {
        case 'hcoinRecharge':
            ModalConstructor = Vue.extend(HcoinRechargeModal);
            break;
        case 'memberGrade':
            ModalConstructor = Vue.extend(MemberGradeModal);
            break;  
        default:
            ModalConstructor = Vue.extend(Modal);
            break;
    }
    let modalDom = new ModalConstructor({
        el: document.createElement('div'),
    });
    let options = Object.assign(modalDom.$data, opt);
    // 相同class过滤
    let cls = options.modalClass ? `.${options.modalClass.split(' ').filter(item=>item).join('.')}` : '';
    if (document.querySelector(`.modal${cls}`)) {
        return;
    }
    // 数据渲染
    modalDom.modalClass = options.modalClass;                   // string           向弹窗新增class
    modalDom.modalTitle = options.modalTitle;                   // string           标题
    modalDom.modalContent = options.modalContent;               // htmlstring       内容html
    modalDom.zIndex = options.zIndex;                           // number           弹窗层级            默认：900
    modalDom.buttonSubmitTxt = options.buttonSubmitTxt;         // string           确定按钮文本        默认：确定
    modalDom.buttonCancelTxt = options.buttonCancelTxt;         // string           取消按钮文本        默认：取消
    modalDom.showSubmit = options.showSubmit;                   // boolean          是否显示确定按钮    默认：显示
    modalDom.showCancel = options.showCancel;                   // boolean          是否显示取消按钮    默认：显示
    modalDom.showClose = options.showClose;                     // boolean          是否显示右上角关闭按钮   默认：显示
    modalDom.maskCancal = options.maskCancal;                   // boolean          是否可点击遮罩层关闭     默认：否
    modalDom.submitCallback = options.submitCallback;           // function         确定按钮事件
    modalDom.cancelCallback = options.cancelCallback;           // function         取消按钮事件
    modalDom.closeCallback = options.closeCallback;             // function         关闭按钮事件
    modalDom.openCallback = options.openCallback;               // function         打开弹窗后回调
    // 在template中append modal  防止部分页面定位层级覆盖
    let $body = (options.$parent && options.$parent.nodeType === 1) ? options.$parent : document.body;      // document         弹窗父级元素        默认：body
    $body.appendChild(modalDom.$el);
    // 显示弹窗
    modalDom.show();
}

export default modal;
/**
 * 一次只能存在一个modal
 * 使用方法：
 * vue.$modal({
 *      opt,
 * })
 */