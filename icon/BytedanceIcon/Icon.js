import Vue from 'vue';
import BytedanceIcon from './Icon.vue';
let IconConstructor = Vue.extend(BytedanceIcon);

export default function(options = {}) {
    let { icon, size, color, build = null } = options;
    let instance = new IconConstructor({
        data() {
            return {
                size: size,
                color: color,
                componentType: `icon-${icon.name}`
            }
        }
    });

    instance.$mount();
    document.body.appendChild(instance.$el);

    let svg = document.querySelector('.bytedance-icon span').innerHTML;
    utils.isFunctionCall(build, svg);

    document.body.removeChild(instance.$el);
    instance.$destroy();
}
