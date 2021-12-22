
import axios from '@/util/axios.js';
const CancelToken = require('axios').CancelToken;

//阿里OSS前端直传,已挂载到VUE
let alioss = {

	//阿里OSS上传
    upload_file:function(opt){
		let option = {
			file: {},
			fileType: '',
			success: null,
			fail: null,
			progress: null,
			cancel: null,
			complete: null,
		};
		option = Object.assign(option, opt);

    	let salt = 'w9yEJnjKW3krL6PQ';
    	let time = new Date().getTime();
        let memberId = utils.getCookies('woodo_memberId');
    	let key = $.md5(salt + time + memberId);
    	let params = {
    		'time' : time,
    		'key' : key,
    		'fileType' : option.fileType
    	}
    	//请求后端接口，获取临时签名
        axios.get('/api/file/get_policy/',{ params: params }).then((data)=>{
            if(data.data.type === 'success'){
            	let result = JSON.parse(data.data.data);
            	let objName = utils.uuid() + utils.getSuffix(option.file.name);
            	let size = option.file.size ? option.file.size / 1024 / 1024 : 0;

            	//表单参数
            	let formData = new FormData();
            	formData.append('key', result.dir + objName);
            	formData.append('policy', result.policy);
            	formData.append('OSSAccessKeyId', result.accessKeyId);
            	formData.append('success_action_status', '200');
            	formData.append('signature', result.signature);
            	formData.append('file', option.file);

            	//发起上传
                axios({
                    url: result.host,
                    headers: { 'Content-Type': 'multipart/form-data' },
                    method: 'post',
                    timeout: 1000 * 60 * Math.ceil(size),
                    onUploadProgress:function(progressEvent){
                        let progress = (progressEvent.loaded / progressEvent.total * 100 | 0);
						if(typeof option.progress === "function") option.progress(progress);
                    },
                    cancelToken: new CancelToken(c => {
						// 取消上传方法
						if (typeof option.cancel === 'function') {
							option.cancel(c);
						}
					}),
                    data:formData,
                    dataType:'file'
                }).then(function(data){
                	if(data.status == '200'){
                		if(typeof option.success === "function") option.success(result.host + '/' +result.dir + objName);
                	}else{
                		if(typeof option.fail === "function") option.fail(data.status + '-' + data.statusText);
                        console.error("oss直传异常", JSON.stringify(data));
                	}
				}).catch(function(info){
					if(typeof option.fail === "function") option.fail(JSON.stringify(info));
                    console.error("oss直传异常", JSON.stringify(info));
				});
            }else{
				if(typeof option.fail === "function") option.fail(data.data.content);
            }
        }).catch((err)=>{
            if(typeof option.fail === "function") option.fail(JSON.stringify(err));
        }).finally(() => {
			if(typeof option.complete === "function") option.complete();
		});
    },
};
export default alioss;