import Vue from 'vue'
import App from './App.vue'
import { createStore } from './store'
import { createRouter } from './router'
import { sync } from 'vuex-router-sync'
import titleMixin from './util/title'
import * as filters from './util/filters'

// 全局注册组件（无需import）
const components = [
    require('@/components/base/base-icon.vue').default,
    require('@/components/base/base-button.vue').default,
    require('@/components/base/base-logo.vue').default,
    require('@/components/base/base-effect-button.vue').default,
    require('@/components/base/base-list.vue').default,
];
components.forEach(component => {
    Vue.component(component.name, component);
});

Vue.mixin(titleMixin)

Object.keys(filters).forEach(key => {
  Vue.filter(key, filters[key])
})

export function createApp () {
  const store = createStore()
  const router = createRouter()
  
  sync(store, router)
  
  const app = new Vue({
    router,
    store,
    render: h => h(App)
  })
  return { app, router, store }
}
