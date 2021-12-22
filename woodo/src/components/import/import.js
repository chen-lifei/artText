/**
 * 通用导入组件
 */

 import Vue from 'vue';
 import Import from '@/components/import/import.vue';
 
 let ImportConstructor = '';
 
 let _import = (options = {}) => {
    ImportConstructor = Vue.extend(Import);
    let instance = new ImportConstructor();
    if (window && window.document) {
        instance.source = options.source || 'local';
        instance.file = options.file;
        instance.online = options.online;
        instance.progress = 0;
        let flag = true;
        // 导入成功
        instance.$on("success", event => {
            flag = false;
            instance.$el.remove();
            instance.$destroy();
            if (typeof(options.success) === 'function') options.success(event);
        });

        // 导入失败 
        instance.$on("fail", event => {
            flag = false;
            instance.$el.remove();
            instance.$destroy();
            if (typeof(options.fail) === 'function') options.fail(event);
        });

        instance.$mount();
        if(flag){
            document.body.appendChild(instance.$el);
        }
    }
 }
 
 export default _import;