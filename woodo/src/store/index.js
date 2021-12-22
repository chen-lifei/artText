import Vue from 'vue'
import Vuex from 'vuex'
import actions from './actions'
import mutations from './mutations'
import getters from './getters'
import theme from './modules/theme'

Vue.use(Vuex)

export function createStore () {
    return new Vuex.Store({
        state: {
            metaInfo: {}
        },

        actions: {
            setMeta({commit},state) {
                return actions.SET_META({commit},state);
            }
        },

        mutations: {
            setMeta(state,data) {
                mutations.SET_META(state, data);
            }
        },
        modules: {
            theme
        },
        getters
    })
}
