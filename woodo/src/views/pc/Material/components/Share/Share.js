import Vue from "vue";
import share from './Share.vue';
let shareConstructor = Vue.extend(share);
export default function(options = {}) {
    let { content = null, type = '', close = null } = options;
    let instance = new shareConstructor({
        data() {
            return {
                type: type,
                shareInfo: content,
            }
        }
     });
    let destroy = () => {
        instance.$destroy();
    }

    // 关闭
    instance.$once(`close`, () => {
        if (this.$el.className.indexOf('base-modal') >= 0) {
            this.$el.style.overflow = '';
        }
        destroy();
        utils.isFunctionCall(close);
    });

    instance.$mount();
    if (this.$el.className.indexOf('base-modal') >= 0) {
        this.$el.scrollTop = 0;
        this.$el.style.overflow = 'hidden';
    }
    this.$el.appendChild(instance.$el);
}