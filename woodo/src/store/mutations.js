import Vue from 'vue'

export default {
    SET_AYSCN_DATA: (state,resData) => {
        state.resData = resData;
    },
    SET_META: (state, resData) => {
        state.metaInfo = resData;
    }
}
