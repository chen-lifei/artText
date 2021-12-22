import axios from 'axios';
import res_complete from '../assets/common/js/response_complete.js';
import res_error from '../assets/common/js/response_error.js';
import qs from 'qs';
let Axios = axios.create({
	baseURL: "",
	timeout: 20000,
	headers: {'X-Requested-With': 'XMLHttpRequest'},
	cache: false,
	params: { v: new Date().getTime(), },
	customConfig: {}
});

// 请求拦截器
Axios.interceptors.request.use(function(config){
	// 刷新参数，防止缓存
	config.params.v = new Date().getTime();
	if(config.method === 'post' && !config.dataType) config.data = qs.stringify(config.data);
    return config;
},function(error){});
// 响应拦截器
Axios.interceptors.response.use(function (response) {
	res_complete(response);
	return response;
}, function (error) {
	console.error(error);
	if(!axios.isCancel(error)){
		res_error(error);
	}
	return Promise.reject(error);
});
export default Axios
