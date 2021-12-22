import document_command from '@/assets/pc/js/document_command.js';
import document_old_data_handler from '@/assets/common/js/document_old_data_handler.js';

//属性声明
let info = {
	//editVue实例
	that : null,
	//启用标识
    enabled : true,
    //文档版本
    document_version : 1,
    //新增备份队列
    add_backup_queue : [],
    //文档完整备份
    document_full_backup : null
};

//方法声明
let method = {
	//准备
	ready : function(that){
        info.that = that;
        if(!info.enabled){
            return;
        }
        method.set_document_full_backup();
        method.listener_add_backup_queue();
	},
	//监听新增备份队列
	listener_add_backup_queue : function(){
        //延迟策略:0, 1000, 2000, 3000, 5000, 9000毫秒
        let saving_flag = false;
        let timeout_seconds = [0, 1000, 2000, 3000, 5000, 9000];
        let timeout_second = 0;
        let error_count = 0;
        let success_function = function(){
        	saving_flag = false;
			error_count = 0;
        }
        let error_function = function(error){
        	saving_flag = false;
			error_count++;
			console.error(error);
        }
        let run = function(){
            try{
            	let add_backup = method.first_add_backup();
            	if(add_backup){
                    if(!saving_flag){
                        saving_flag = true;
                        let document_id = add_backup.command.document.id;
                        let document_version = add_backup.document_version;
                        //文档新增备份保存
                        let command = method.command_pretreatment(add_backup.command);
                        mapi.document_backup_add_save({
                            documentId : document_id,
                            documentVersion : document_version,
                            data : JSON.stringify(command)
                        }).then(res => {
                            if(res.data.documentFullBackupId === null){
                                //完整备份开始保存
                                method.set_document_full_backup();
                                mapi.document_backup_full_save({
                                    documentId : document_id,
                                    data : JSON.stringify(info.document_full_backup)
                                }).then(res => {
                                    method.clear_add_backup_queue();
                                    success_function();
                                },error => {
                                    error_function(error);
                                });
                            }else{
                                //新增备份保存成功
                                method.add_backup_shift();
                                success_function();
                            }
                        },error => {
                            error_function(error);
                        });
                    }
            	}
            }catch(e){
                console.error("文档备份保存异常", e);
            }
        	//延迟策略计算
    		let tmp_timeout_second = timeout_seconds[error_count];
    		if(typeof(tmp_timeout_second) !== 'undefined'){
    			timeout_second = tmp_timeout_second;
    		}
            setTimeout(function(){
            	run();
            },timeout_second + 500);
        }
        run();
	},
	//新增备份入列
	add_backup_push : function(command){
		if(!info.enabled){
            return;
        }
        info.document_version++;
        if(command.document.id === null){
        	return;
        }
        let add_backup = {
        	document_version : info.document_version,
        	command : command
        }
        info.add_backup_queue.push(add_backup);
	},
	//首个新增备份
	first_add_backup:function(){
		return info.add_backup_queue[0];
	},
	//新增备份出列
	add_backup_shift:function(){
		info.add_backup_queue.shift();
	},
	//清空新增备份队列
    clear_add_backup_queue : function(){
        info.add_backup_queue = [];
    },
    //指令处理
    command_pretreatment : function(command){
    	if(!command){
    		return command;
    	}
    	delete command.uuid;
    	delete command.source;
    	delete command.templateDocId;
    	delete command.page_info_uuid;
    	delete command.cursor_position;
    	return command;
    },
	//获取指令队列长度
    get_add_backup_queue_length : function(){
        return info.add_backup_queue.length;
    },
    //设置文档版本
    set_document_version : function(document_version){
        if(!document_version){
            return;
        }
    	info.document_version = document_version
    },
	//设置文档完整备份
	set_document_full_backup : function(){
		info.document_full_backup = method.get_document_data();
	},
	//获取文档数据
	get_document_data : function(){
		let documentData = {
            document_info : info.that.document_info,
            document_page_list : info.that.document_page_list
        }
        if(documentData.document_info.uuid === null){
        	return null;
        }
        documentData = $.extend(true,{},documentData);
        delete documentData.document_info.url;
        delete documentData.document_info.editCount;
        delete documentData.document_info.modifyDate;
        return documentData;
	},
    //展示备份恢复弹框
    show_recovery_modal : function(that){
        try{
            if(that.document_info.id === null || that.document_info.uuid === null){
                return;
            }
            that.$modal({
                modalClass : 'save_error_recovery',
                modalTitle : '还原提示',
                modalContent : `通过远程备份数据恢复,恢复到
                    <input type="text" id="recovery_datetime" placeholder="${new Date(new Date().getTime() + 24 * 60 * 60 * 1000).toLocaleDateString()}" />前
                    <br />
                    <a id="recovery_preview" href="javascript:void(0);">预览</a>
                `,
                buttonSubmitTxt : '恢复',
                showClose : false,
                openCallback(modal){
                    // 打开预览页
                    $('#recovery_preview').on('click', function () {
                        let versionDate = $('#recovery_datetime').val();
                        if(!versionDate || isNaN(new Date(versionDate).getTime())){
                            return alert('日期格式错误,请重新输入');
                        }
                        utils.windowOpenNewtab(`/document_recovery_preview/${that.document_info.id}/?mode=remote&versionDate=${versionDate}`);
                    });
                },
                submitCallback(modal){
                    let versionDate = $('#recovery_datetime').val();
                    if(!versionDate || isNaN(new Date(versionDate).getTime())){
                        return alert('日期格式错误,请重新输入');
                    }
                    modal.close();
                    that.backup_recovery = true;
                    method.recovery(that, that.document_info.id, null, versionDate).then(res => {
                        method.recovery_submit({document:res.document_info,documentPages:res.document_page_list}).then(res => {
                            if(res.data.type !== 'success'){
                                that.backup_recovery = false;
                                that.$toast("备份恢复失败",2000);
                                return;
                            }
                            that.$toast("备份恢复成功,正在跳转页面",2000,function(){
                                window.location.reload();
                            });
                        },error => {
                            that.backup_recovery = false;
                            that.$toast("备份恢复失败",2000);
                        });
                    },error => {
                        that.backup_recovery = false;
                        that.$toast("备份恢复失败",2000);
                    });
                },
                cancelCallback(modal){
                    modal.close();
                }
            });
        }catch(e){
            console.error(e);
        }
    },
    //备份恢复
    recovery : function(that, document_id, document_add_backup_id, document_add_backup_createdate, interval_time){
        if(info.that === null && that){
            info.that = that;
        }
        if(info.that === null){
            return new Promise(function(resolve,reject){resolve("实例不能为NULL")});
        }
        if(!document_add_backup_id){
            document_add_backup_id = null;
        }
        if(!document_add_backup_createdate){
            document_add_backup_createdate = null;
        }
        //获取备份数据
        let p = new Promise((resolve, reject) => {
            let document_full_backup = null;
            let document_add_backup = [];
            mapi.document_backup_full_get({
                documentId : document_id,
                documentAddBackup : document_add_backup_id,
                documentAddBackupCreateDate : document_add_backup_createdate
            }).then(res => {
                document_full_backup = res.data;
                let page_number = 1;//页码
                let loading = false;//加载标识
                let interval = setInterval(function(){
                    if(loading){
                        return;
                    }
                    loading = true;
                    mapi.document_backup_add_list({
                        documentId : document_id,
                        documentFullBackup : res.data.documentFullBackup,
                        documentAddBackup : document_add_backup_id,
                        documentAddBackupCreateDate : document_add_backup_createdate,
                        pageNumber : page_number
                    }).then(res => {
                        loading = false;
                        if(res.data.length === 0){
                            clearInterval(interval);
                            resolve({
                                document_full_backup : document_full_backup,
                                document_add_backup : document_add_backup
                            });
                            return;
                        }
                        document_add_backup = document_add_backup.concat(res.data);
                        page_number++;
                    },error => {
                        clearInterval(interval);
                        reject(error);
                    });
                },interval_time || 1000)
            },error => {
                reject(error);
            });
        });
        return new Promise((resolve, reject) => {
            p.then(res => {
                let document_full_backup = JSON.parse(res.document_full_backup.data);
                let document_info = document_full_backup.document_info;                
                let document_page_list = document_full_backup.document_page_list;
                let data = document_old_data_handler.updateDocument(document_info, document_page_list);//数据兼容处理
                document_info = data.document_info;
                document_page_list = data.document_page_list;
                $.each(res.document_add_backup,function(i,item){
                    let command = JSON.parse(item.data);
                    command = document_old_data_handler.updateCommand(command);//数据兼容处理
                    document_command.method.set_document_different(document_info,command.document);
                    document_command.method.set_documentPage_different(document_page_list,command.documentPages);
                });
                resolve({
                    document_info : document_info,
                    document_page_list : document_page_list
                });
            },error => {
                console.error(error);
                reject(error);
            });
        });
    },
    //备份恢复提交
    //data:{document:{},documentPages:[]}
    recovery_submit : function(data){
        return new Promise((resolve, reject) => {
            if(info.that === null){
                reject("实例不能为NULL");
            }
            if(info.that.document_info.id === null || !data){
                reject("参数错误");
            }
            info.that.$axios({
                url : `/api/member/document/remote_backup_recovery/?docId=${info.that.document_info.id}`,
                method : 'POST',
                data : data,
                dataType:'json'
            }).then(function(data){
                if(data.data.type === 'success'){
                    //恢复成功清空本地历史
                    if(window && window.sessionStorage){
                        try{
                            sessionStorage.removeItem('command_history_document_uuid');
                        }catch(e){
                            console.error(e);
                        }
                    }
                }
                resolve(data);
            }).catch(data => {
                reject(data);
            });
        });
    }
}

//备份服务相关接口
let mapi = {
    service_auth_sign : null,
    //获取服务签名
    get_service_auth_sign : function(params){
        return new Promise((resolve, reject) => {
            let user = info.that.$common.get_login_state();
            let type = 'backup',
                documentId = params.documentId,
                memberId = user.id;
            let headers = {
                'service-auth-type' : type,
                'service-auth-documentId' : documentId,
                'service-auth-memberId' : memberId
            }
            if(mapi.service_auth_sign !== null){
                headers['service-auth-sign'] = mapi.service_auth_sign;
                resolve(headers);
                return;
            }
            info.that.$axios.get('/document_backup/service_auth_sign/', {params: {
                type : type,
                documentId : documentId,
                memberId : memberId
            }}).then(function(data){
                mapi.service_auth_sign = data.data.service_auth_sign;
                headers['service-auth-sign'] = mapi.service_auth_sign;
                resolve(headers);
            }).catch(error => {
                mapi.service_auth_sign = null;
                reject("获取文档备份服务签名失败");
            });
        });
    },
	//文档备份检查
	document_backup_check : function(params){
        return new Promise((resolve, reject) => {
            mapi.get_service_auth_sign(params).then(function(headers){
                info.that.$axios.get('/mapi/document_backup/check/', {params: params, headers : headers}).then(function(data){
                    resolve(data);
                }).catch(error => {
                    reject(error);
                });
            }).catch(error =>{
                reject(error);
            });
        });
	},
    //查询文档完整备份
    document_backup_full_get : function(params){
        return new Promise((resolve, reject) => {
            mapi.get_service_auth_sign(params).then(function(headers){
                info.that.$axios.get('/mapi/document_backup/full/get/', {params: params, headers : headers}).then(function(data){
                    resolve(data);
                }).catch(data => {
                    reject(data);
                });
            }).catch(error =>{
                reject(error);
            });
        });
    },
	//文档完整备份保存
	document_backup_full_save : function(params){
        return new Promise((resolve, reject) => {
            mapi.get_service_auth_sign(params).then(function(headers){
            	info.that.$axios.post('/mapi/document_backup/full/save/', params, {headers : headers}).then(function(data){
    	        	resolve(data);
    	        }).catch(data => {
    	        	reject(data);
    	        });
            }).catch(error =>{
                reject(error);
            });
        });
	},
    //查询文档新增备份
    document_backup_add_list : function(params){
        return new Promise((resolve, reject) => {
            mapi.get_service_auth_sign(params).then(function(headers){
                info.that.$axios.get('/mapi/document_backup/add/list/', {params: params, headers : headers}).then(function(data){
                    resolve(data);
                }).catch(data => {
                    reject(data);
                });
            }).catch(error =>{
                reject(error);
            });
        });
    },
	//文档新增备份保存
	document_backup_add_save : function(params){
        let user = info.that.$common.get_login_state();
        params = Object.assign({
            memberId : user.id,
            memberNickName : user.name,
            memberHead : user.photo
        }, params);
        return new Promise((resolve, reject) => {
            mapi.get_service_auth_sign(params).then(function(headers){
            	info.that.$axios.post('/mapi/document_backup/add/save/', params, {headers : headers}).then(function(data){
    	        	resolve(data);
    	        }).catch(data => {
    	        	reject(data);
    	        });
            }).catch(error =>{
                reject(error);
            });
        });
	},
    //文档操作记录列表
    document_opt_log_list : function(params){
        return new Promise((resolve, reject) => {
            mapi.get_service_auth_sign(params).then(function(headers){
                info.that.$axios.get('/mapi/document_opt_log/list/', {params: params, headers : headers}).then(function(data){
                    resolve(data);
                }).catch(data => {
                    reject(data);
                });
            }).catch(error =>{
                reject(error);
            });
        });
    },
    //文档操作记录数量
    document_opt_log_count : function(params){
        return new Promise((resolve, reject) => {
            mapi.get_service_auth_sign(params).then(function(headers){
                info.that.$axios.get('/mapi/document_opt_log/count/', {params: params, headers : headers}).then(function(data){
                    resolve(data);
                }).catch(data => {
                    reject(data);
                });
            }).catch(error =>{
                reject(error);
            });
        });
    }
}

export default {
    'info' : info,
    'method' : method,
    'mapi' : mapi
};