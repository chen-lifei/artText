import * as axios from 'axios';

export default {
    FETCH_DATA: ({ commit, dispatch, state },resData) => {
        return commit('SET_AYSCN_DATA',resData);
    },
    SET_META: ({commit}, state) => {
        let url = state.url;
        let params = state.params;
        if (url && params) {
            function fetchApi() {
                return new Promise(function (resolve, reject) {
                    try {
                        axios.get(url, {params:params})
                        .then((data) => {
                            let info = {};
                            if(data.data.code == 2){
                                info = data.data.data || {};
                                info.query = params.id || params.url || '';
                            }
                            resolve(info);
                        })
                        .catch((e) => {
                            resolve()
                        })
                    } catch (e) { 
                        resolve()
                    }
                })
            }
            return fetchApi().then(item => {
                commit('setMeta', item || {});
            })
        }
    }
}
