import Vue from 'vue';
import DocumentCreate from './DocumentCreate.vue';

let documentCreateConstructor = Vue.extend(DocumentCreate);
let isOpen = false;

export default function(options = {}) {
    if (isOpen) return;
    isOpen = true;
    let { close = null } = options;
    let instance = new documentCreateConstructor();
    let destroy = function() {
        document.body.removeChild(instance.$el);
        instance.$destroy();
        isOpen = false;
    }
    instance.$once(`close`, () => {
        utils.isFunctionCall(close);
        destroy();
    });
    instance.$mount();
    document.body.appendChild(instance.$el);
}