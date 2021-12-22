import Vue from 'vue';
import OffLine from '@/components/offline/offline.vue';
let OfflineListenter = Vue.extend(OffLine);

function Offlinefn(){
    let offlineEl = new OfflineListenter({
        el: document.createElement('div'),
    });
    document.body.appendChild(offlineEl.$el);
}

export default Offlinefn;