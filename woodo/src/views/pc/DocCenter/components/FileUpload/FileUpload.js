import Vue from 'vue';
import FileUpload from './FileUpload.vue';

let fileUploadConstructor = Vue.extend(FileUpload);
let isOpen = false;

export default function(options = {}) {
    if (isOpen) document.body.removeChild(document.querySelector('.local-file-upload'));
    let { close = null } = options;
    let instance  = new fileUploadConstructor();
    let destroy = function() {
        isOpen = false;
        instance.$el.remove();
        instance.$destroy();
    }
    isOpen = true;
    instance.$once(`fail`, () => {
        destroy();
    });
    instance.$once(`close`, () => {
        utils.isFunctionCall(close);
        destroy();
    });
    instance.$mount();
    document.body.appendChild(instance.$el);
}