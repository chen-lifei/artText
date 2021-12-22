/** cross-domain部分*/
(function (window) {
    try{
        if(!window || window==undefined||window.location==undefined){
           return;
        }
    }catch(e){
        return;
    }
    var CD = function () {
    };
    CD.prototype = {
        DEFAULT_NAME_MASTER: "MASTER",
        DEFAULT_NAME_SLAVE: "woodoJs",
        version: "0.0.1",
        component: {},
        components: {},
        interfaces: {},
        /**
         * 初使化
         */
        init: function () {
            this.component = {
                type: this.isMaster() ? this.DEFAULT_NAME_MASTER : this.DEFAULT_NAME_SLAVE,
                name: this.isMaster() ? this.DEFAULT_NAME_MASTER : window.name,
                host: window.location.host,
                port: window.location.port || 80
            };
            if (!this.component.name) {
                throw new Error("Error iframe must has a name");
            }
            this.components[this.component.name] = this.component;
            this.register(this.component);
            this.extends("register", function (data) {
                this.components[data.component.name] = data.component;
            });
        },
        /**
         * 是否是Master
         * 如果窗口为顶层窗口则认为是Master
         */
        isMaster: function () {
            return window === window.top;
        },
        /**
         * Salve将自身组件注册到MASTER端
         */
        register: function () {
            this.send(this.DEFAULT_NAME_MASTER, "register", {info: "i'm coming register!", component: this.component});
        },
        /**
         * 扩展接口方法
         * @param {String} name接口名称
         * @param {Function} fun 接口方法
         */
        extends: function (name, fun) {
            this.interfaces[name] = fun;
        },
        /**
         * 打印跨域日志的方法
         *
         * @param {Object} mesg 要打印跨域消息的内容
         */
        log: function (mesg) {
            if (!window.console || typeof window.console === 'undefined')
                return;
            window.console.log("[" + new Date() + "][" + this.version + "][" + this.component.type + "][" + this.component.name + "][" + mesg.type + "][" + window.JSON.stringify(mesg) + "]");
        },
        /**
         * 发送信息到其它组件 - html5原生态方法包装
         *
         * @param {Window} targetWindow目标系统window对象
         * @param {String} targetUrl目标系统 URL
         * @param {Object} mesg 对象
         */
        postMessage: function (targetWindow, targetUrl, mesg) {
            this.log(mesg);
            targetWindow.postMessage(JSON.stringify(mesg), targetUrl);
        },
        /**
         * 发送消息方法
         * @param {String} componentName组件名称
         * @param {String} method接口名称
         * @param {Object} data数据
         * @param {Function} callback回调
         */
        send: function (componentName, method, data, callback, type) {
            if (this.isMaster() && componentName === this.DEFAULT_NAME_MASTER)
                return;
            var source = this.component.name;
            var mesg = {
                source: source,
                target: componentName,
                method: method,
                data: data,
                type: type || "REQUEST"
            };
            if (callback)
                this.extends(method + "Callback", callback);

            var w;
            if(this.isMaster()){
                var content_window = window.document[componentName];
                w = content_window?content_window:window.document.getElementsByName(componentName)[0].contentWindow;
            }else{
                w = window.top;
            }
            this.postMessage(w, "*", mesg);
        },
        /**
         * 处理接收到的其它系统的请求跨域请求
         *
         * @param {Event} event事件对象
         */
        process: function (event) {
        	if(event.data==undefined||event.data==""){
        		return;
        	}
            var mesg;
            if(typeof(event.data)=="object"){
                mesg = event.data;
            }else{
                mesg = JSON.parse(event.data);
            }
            if(mesg && mesg.status=="__Messenger__hmLoaded"){
                return;
            }
            //console.log(event);
            this.log(mesg);
            var interfaceMethd = this.interfaces[mesg.method];
            var result;
            if (interfaceMethd) {
                result = interfaceMethd.call(this, mesg.data);
            } else {
                throw new Error("[" + this.component.name + "] not have interface:[" + mesg.method + "]");
            }
            if (result) {
                this.send(mesg.source, mesg.method + "Callback", result, null, "RETURN");
            }
        },
        /**
         * 绑定窗口事件，用于监听跨域事件
         */
        listen: function () {
            if (window.addEventListener) {// 非IE
                window.addEventListener("message", function (event) {
                    window.CD.process(event);
                }, false);
            } else {// IE
                window.attachEvent("onmessage", function (event) {
                    window.CD.process(event);
                });
            }
        }
    };
    window.CD = new CD();
    window.CD.init();
    window.CD.listen();
})(this);

/** 客户端jssdk部分*/
(function () {
    try{
        if(!window || window==undefined||window.CD==undefined){
           return;
        }
    }catch(e){
        return;
    }
    var woodoJs = function () {
    };
    woodoJs.prototype = {
        version: "1.0.0",
        name:"woodoJs",
        url:"/api/platform/redirect/",
        domain:"https://www.woodo.cn",
        redirectUrl:"/edit/",
        /**
         * 初使化
         */
        init: function (config) {
            console.log("woodoJs initing",config);
            //参数校验
            if(config==undefined){
                console.error("初始参数不能为空",config);
                return;
            }
            if(config.appId==undefined||config.appId==""){
                console.error("appId不能为空",config);
                return;
            }
            if(config.token==undefined||config.token==""){
                console.error("token不能为空",config);
                return;
            }
            if(config.ele==undefined||config.ele==""){
                console.error("ele不能为空",config);
                return;
            }
            if(config.domain&&config.domain!=""){
                this.domain=config.domain;
            }
            if(typeof(config.listenMessage) === 'function'){
                this.listenMessage = config.listenMessage;
            }
            //初始化页面框架
            var targetEle= document.querySelector(config.ele);
            if(targetEle==undefined||!targetEle){
                console.error("初始化页面框架失败,请检查配置节点ele:["+config.ele+"]是否存在于页面中");
                return;
            }
            //url拼接
            var queryParam=new Array();
            if(config.docId&&config.docId!=""){
                queryParam.push("docId="+config.docId);
            }
            if(config.userUuid&&config.userUuid!=""){
                 queryParam.push("userUuid="+config.userUuid);
            }
            if(config.token&&config.token!=""){
                queryParam.push("token="+config.token);
            }
            if(config.appId&&config.appId!=""){
                queryParam.push("appId="+config.appId);
            }
            if(config.time&&config.time!=""){
                queryParam.push("time="+config.time);
            }
            //是否需要协作功能
            if(config.ws&&config.ws!=""){
                queryParam.push("ws="+ws);
            }else{
                queryParam.push("ws=false");
            }
            queryParam.push("redirectUrl="+encodeURIComponent(this.redirectUrl));
            if(queryParam.length>0){
                this.url=this.url+"?"+queryParam.join("&");
            }
            if(typeof(config.loadingStart) === 'function'){
                config.loadingStart();//加载开始
            }
            //ifram追加
            var iframe = document.createElement('iframe');
            iframe.id="woodoJs";
            iframe.src=this.domain+this.url;
            iframe.name="woodoJs";
            var th=this;
            if (iframe.attachEvent) {    
                iframe.attachEvent("onload", function() {    
                    //发送参数
                    th.send("init_config",config);  
                });
                iframe.attachEvent("onmouseenter", function() {    
                    iframe.focus();
                });    
            } else {    
                iframe.onload = function() {    
                    //发送参数
                    th.send("init_config",config);
                };
                iframe.onmouseenter = function() {    
                    iframe.focus();
                };  
            } 
            targetEle.appendChild(iframe);
            //监听消息
            if(typeof(config.loadingEnd) === 'function'){
                CD.extends("loadingEnd",config.loadingEnd);//加载结束
            }
            CD.extends("listenMessage",this.listenMessage);
            console.log("woodoJs init success");
        },
        //方法合集
        //删除页
        delPage:function(pageUuids,record,callback){
            this.send("delPage", {"pageUuids":pageUuids,"record":record}, callback, null);
        },
        //替换页
        replacePage:function(pages,record,callback){
            this.send("replacePage", {"pages":pages,"record":record}, callback, null);
        },
        //排序页
        orderPage:function(orderPageUuids,targetPageUuid,record,callback){
            this.send("orderPage", {"orderPageUuids":orderPageUuids,"targetPageUuid":targetPageUuid,"record":record}, callback, null);
        },
        //选中页
        selectPage:function(pageUuid,record,callback){
            this.send("selectPage", {"pageUuid":pageUuid,"record":record}, callback, null);
        },
        //添加页
        addPage:function(pageInfos,targetPageUuid,type,record,callback){
            this.send("addPage", {"pageInfos":pageInfos,"targetPageUuid":targetPageUuid,"type":type,"record":record}, callback, null);
        },
        //根据文档id添加页
        addPagesByDocIds:function(docIds,targetPageUuid,appId,token,time,record,callback,delPageUuids){
            this.send("addPagesByDocIds", {"docIds":docIds,"targetPageUuid":targetPageUuid,"delPageUuids":delPageUuids,"appId":appId,"token":token,"time":time,"record":record}, callback, null);
        },
        //导出文档
        export:function(docId,type,appId,token,time,password,title,callback){
            this.send("export", {"docId":docId,"type":type,"appId":appId,"token":token,"time":time,"password":password,"title":title}, callback, null);
        },
        //添加操作记录
        addRecord:function(record,callback){
            this.send("addRecord", {"record":record}, callback, null);
        },
        //获取保存指令
        getSaveCommand:function(callback){
            this.send("getSaveCommand", {}, callback, null);
        },
        //获取保存指令
        setSaveCommandResult:function(data,callback){
            this.send("setSaveCommandResult", data, callback, null);
        },
        //撤回
        undo:function(callback){
            this.send("undo", {}, callback, null);
        },
        //重做
        redo:function(callback){
            this.send("redo", {}, callback, null);
        },
        /**
         * 发送消息方法
         * @param {String} componentName组件名称
         * @param {String} method接口名称
         * @param {Object} data数据
         * @param {Function} callback回调
         */
        send: function (method, data, callback, type) {
        	CD.send(this.name, method, data, callback, type);
        },
        listenMessage:function(data){
            console.log("接收消息：",data);
            return data;
        }

    };
    window.woodoJs = new woodoJs();
})();
