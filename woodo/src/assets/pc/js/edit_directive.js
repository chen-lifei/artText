import Vue from 'vue'
const in_page = Vue.directive('in_page', {
    inserted: function (el, binding) {
        let allIds = binding.value.allIds,
            elementIds = binding.value.elementIds,
            no_in_page = true;
        // 判断是否存在 页面节点id 或 评论元素id
        if(!allIds || !elementIds || elementIds.length <= 0) return false;
        if(allIds.length <= 0 && elementIds.length > 0) return el.parentNode.removeChild(el);
        for(let i in elementIds){
            let comment_element = elementIds[i];
            if(allIds.indexOf(comment_element) >= 0){
                no_in_page = false;
                return false;
            }
        }
        if(no_in_page) el.parentNode.removeChild(el);
    }
});
const authority = Vue.directive('authority', {
    inserted: function (el, binding, vnode) {
        let item_authority = binding.value.item_authority,
            all_authority = binding.value.all_authority,
            no_authority = false;
        if(all_authority.indexOf(item_authority) < 0) no_authority = true;
        if(no_authority){
            let old_class = el.getAttribute('class') ? el.getAttribute('class') : '';
            el.setAttribute('class', old_class + ' disable');
            el.setAttribute('style', 'cursor:not-allowed;');
        }
    }
});
const focus = Vue.directive('focus', {
    inserted: function (el) {
        el.focus();
    }
});
export {in_page, authority, focus}
