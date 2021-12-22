const isDev = process.env.NODE_ENV !== 'production';
const axios = require('axios');

const logger = {
    debug: (msg) => {push(msg)},
    info: (msg) => {push(msg)},
    log: (msg) => {push(msg)},
    error: (msg) => {push(msg)},
    warn: (msg) => {push(msg)}
}

//api:https://help.aliyun.com/document_detail/120218.html

let aliyun_log_url = "https://{0}.{1}/logstores/{2}/track";
let aliyun_log_project = "woodo";
let aliyun_log_endpoint = "cn-shenzhen.log.aliyuncs.com";
let aliyun_log_logstoreName = "frontend_log";

let aliyun_log_dataTemplate = {
    "__topic__" : 'server',
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

//日志数据上报
let push = function(msg){
    try{
        //开发环境不上报异常
        if(isDev){
            return;
        }
        if(msg.length === 0){
            return;
        }
        let log = {
            console_error_msg : JSON.stringify(msg)
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

module.exports = logger;