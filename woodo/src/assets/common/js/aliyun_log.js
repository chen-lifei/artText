import axios from "axios";

//api:https://help.aliyun.com/document_detail/120218.html

let aliyun_log_url = "https://{0}.{1}/logstores/{2}/track";
let aliyun_log_project = "woodo";
let aliyun_log_endpoint = "cn-shenzhen.log.aliyuncs.com";
let aliyun_log_logstoreName = "frontend_log";

let aliyun_log_dataTemplate = {
	"__topic__" : 'client',
	"__source__" : "woodo_fronted",
	"__logs__" : [
		{
			"__time__" : 0,//日志服务查询条件中的值
		}
	]
}

let aliyun_log_headers = {
	"Content-Type" : "application/json",
	"x-log-apiversion" : "0.6.0",
	"x-log-bodyrawsize" : 1234
}

let methods = {
	push : function(log){
		try{
			if(!isUploadLog()){
				return;
			}
			let data = getData(log);
			axios({
	            url: str_format(aliyun_log_url,aliyun_log_project,aliyun_log_endpoint,aliyun_log_logstoreName),
	            headers:aliyun_log_headers,
	            method: 'post',	
	            data: data
	        }).then(function(data){
	        });
		}catch(e){
			console.log(e);
		}
	}
};

//是否上报日志数据
function isUploadLog(){
	if(typeof(document) === 'undefined'){
		return true;
	}
	let whiteList = ["www.woodo.cn","gray.woodo.cn"];
	
	if(whiteList.indexOf(document.location.host) !== -1){
		return true;
	}
	return false;
}

//日志数据封装
function getData(log){
    let logs = [];
    log['__time__'] = parseInt(new Date().getTime() / 1000);
    if(typeof(document) !== 'undefined'){
		log.url = document.location.href;
		log.referrer = document.referrer;
	}
	if(typeof(navigator) !== 'undefined'){
		log.ua = navigator.userAgent;
	}
    logs.push(log);
    let data = JSON.parse(JSON.stringify(aliyun_log_dataTemplate));
    data["__logs__"] = logs;
    return data;
}

//字符串格式化
function str_format(str){
	if(arguments.length == 0){
		return str;
	}
	var args = Array.prototype.slice.call(arguments, 1);
	return str.replace(/\{(\d+)\}/g, function(m, i){
		return args[i];
	});
}

export default methods;