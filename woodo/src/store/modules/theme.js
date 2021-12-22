// 状态数据
const state = {
    pageTheme: {}
}

// 更改状态的方法
const mutations = {
    // 设置 pageTheme 在状态里
    SET_THEME: (state, theme) => {
        if (theme === 'none') {
            if (window && document)  document.body.setAttribute(`data-theme`, '');
            return;
        }
        if (!theme && !localStorage.getItem(`woodo_theme`)) {
            let currentTime = new Date().getHours();
            // 7:00 ~ 19:00 为白天模式，19：00 ~ 7:00 为夜间模式
            if (7 <= currentTime && currentTime < 19) {
                theme = `light`;
            } else {
                theme = `dark`;
            }
        } else {
            theme = theme || localStorage.getItem(`woodo_theme`);
        }
        state.pageTheme = theme;
        localStorage.setItem("woodo_theme", theme);
        if (window && document)  document.body.setAttribute(`data-theme`, theme);
    },
}

// actions 异步操作模块
const actions = {
    // 获取用户信息
    getTheme({ commit, state }) {
        return new Promise((resolve, reject) => {
            let result = "";
            if (window && document)  {
                result = document.body.getAttribute(`data-theme`);
            }
            commit('SET_THEME', result);
            resolve(result);
        });
    }
}

export default {
    namespaced: true,
    state,
    mutations,
    actions
}