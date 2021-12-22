//ajax、axios
//处理请求完成
function handle_response(response,is_ajax){
    return {
        //获取url方法
        getUrl : function(){
            if(is_ajax){
                return response.customConfig.url;
            }else{
                return response.config.url;
            }
        },
        //获取响应头值方法
        getHeader : function(key){
            if(is_ajax){
                return response.getResponseHeader(key);
            }else{
                return response.headers[key.toLowerCase()];
            }
        }
    }
}

export default (response,is_ajax)=>{
    try{
        let new_response = handle_response(response,is_ajax);
        let api_sign = new_response.getHeader('api-sign');
        if(!api_sign){
            return;
        }
        if(window && window.sessionStorage){
            sessionStorage.setItem('api_sign', api_sign);
        }
    }catch(e){
        console.error(e);
    }
}
