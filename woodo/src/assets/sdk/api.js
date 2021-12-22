import CD from  '@/assets/sdk/crossdomain.js';
import page_opt from  '@/assets/pc/js/opt/page_opt.js';
import document_save from  '@/assets/pc/js/document_save.js';

let info = {
	//vue实例
	editor:null,
	//平台操作记录
	platformRecords:{
		tmp:[],
		undo:{},
		redo:{}
	},
	//发送类型
	SENDTYPE:{
		SAVE_DOC:"saveDoc",
		UNDO:"undo",
        REDO:"redo",
        RECORD_STATE:"recordState",
		ADD_PAGE:"addPage",
		COPY_PAGE:"copyPage",
		DEL_PAGE:"delPage",
		REPLACE_PAGE:"replacePage",
		ORDER_PAGE:"orderPage",
		ORDER_PAGE_CHECK:"orderPageCheck",
		SELECT_PAGE:"selectPage",
	},
	URL_MAP:{
		"^/api/member/document/detail/(\\d*)/$":"/api/platform/document/detail/{0}/"
	}
}

let method = {
	overwriteMethod:function(){
		method.overwriteSavePlatformRecord();
		method.overwriteSaveLocalPlatformRecord();
		method.overwriteRecoveryPlatformRecord();
		method.overwriteUndoRedoPlatformRecord();
        method.overwriteAxios();
		method.overwriteAddPage();
		method.overwriteCopyPage();
		method.overwriteDelPage();
		method.overwriteSortPage();
		method.overwriteLoadingLogo();
		method.overwriteSaveModel();
		method.overwriteDocumentError();
		method.overwritePageMaxCount();
		method.overwriteSaveDocument();
		method.overwriteUndoRedoStatus();
	},
	//重写保存平台操作记录
	overwriteSavePlatformRecord:function(){
		document_save.method.save_command_history = function(base){
			return function(){
				let overstep = base.apply(this, arguments);
				let index = document_save.info.command_history_index;
				//保存平台操作记录
				let tmpPlatformRecord = info.platformRecords.tmp.shift();
				if(method.isNull(overstep)){
					return;
				}
				if(!overstep){
					//撤回后操作，删除撤回步骤
					$.each(Object.keys(info.platformRecords.undo),function(i,item){
						item = parseInt(item);
			            if(item >= index){
			                delete info.platformRecords.undo[item];
			            }
			        });
			        $.each(Object.keys(info.platformRecords.redo),function(i,item){
			        	item = parseInt(item);
			            if(item >= index){
			                delete info.platformRecords.redo[item];
			            }
			        });
				}else{
					//撤回重做步骤超出限制
					let newUndoPlatformRecords = {};
					$.each(Object.keys(info.platformRecords.undo),function(i,item){
			            if(item != 0){
			                newUndoPlatformRecords[item-1]=info.platformRecords.undo[item];
			            }
			        });
			        info.platformRecords.undo = newUndoPlatformRecords;
			        let newRedoPlatformRecords = {};
			        $.each(Object.keys(info.platformRecords.redo),function(i,item){
			            if(item != 0){
			                newRedoPlatformRecords[item-1]=info.platformRecords.redo[item];
			            }
			        });
			        info.platformRecords.redo = newRedoPlatformRecords;
				}
				if(!method.isNull(tmpPlatformRecord)){
					info.platformRecords.undo[index] = tmpPlatformRecord.undo;
					info.platformRecords.redo[index] = tmpPlatformRecord.redo;
				}
			}
		}(document_save.method.save_command_history);
	},
	//重写保存本地操作记录
	overwriteSaveLocalPlatformRecord:function(){
		document_save.method.save_local_command_history_ext = function(base){
			return function(){
                base.apply(this, arguments);
                method.saveLocalPlatformRecord();
            }
		}(document_save.method.save_local_command_history);
		document_save.method.save_local_command_history = function(){};
	},
	//重写恢复平台操作记录
	overwriteRecoveryPlatformRecord:function(){
		document_save.method.recovery_local_command_history = function(base){
			return function(){
				let isNew = base.apply(this, arguments);
				if(method.isNull(isNew)){
					return;
				}
				try{
					if(window && window.sessionStorage){
						let platformRecords = JSON.parse(sessionStorage.getItem('platformRecords'));
				        if(!isNew && !method.isNull(platformRecords)){
				            info.platformRecords = platformRecords;
				        }
					}
				}catch(e){}
			}
		}(document_save.method.recovery_local_command_history);
	},
	//重写撤回重做平台操作记录
	overwriteUndoRedoPlatformRecord:function(){
		document_save.method.undo_redo = function(base){
			return function(){
				let index = document_save.info.command_history_index;
				let length = ((document_save.info.command_undo_history.length + document_save.info.command_redo_history.length) / 2) - 1;
				base.apply(this, arguments);
				let type = arguments ? arguments[1] : null;
				if(method.isNull(type)){
					return;
				}
				let record;
				if(type === 'undo'){
					if(index < 0){
					}else{
						type = info.SENDTYPE.UNDO;
						record = info.platformRecords.undo[index--];
					}
				}else{
					if(index >= length){
			        }else{
			        	type = info.SENDTYPE.REDO;
						record = info.platformRecords.redo[++index];
			        }
				}
				let data = {};
				if(!method.isNull(record)){
					data.record = record
				}			
				woodoapi.send(type, apiMessage.success("操作成功", data));
			}
		}(document_save.method.undo_redo);
	},
	//重写http请求客户端
	overwriteAxios:function(){
		if(!info.editor.$axios){
			return;
		}
		info.editor.$axios.interceptors.request.use(function(config){
			// 替换参数
			$.each(info.URL_MAP,function(key1,value1){
					let reg = new RegExp(key1);
	        		let _pathname = config.url;
	        		if(reg.test(_pathname)){
	        			let _params = _pathname.match(reg);
	        			if(_params != null && _params.length > 0){
	        				_params.splice(0,1);//去除素组第一个元素
	        				let _url = value1;
	        				//restful风格参数替换
	        				$.each(_params,function(i,param){
	        					_url = _url.replace("{"+i+"}", param);
	        				});
	        				config.url= _url;
	        			}

	        		}
	        });
	        if(config.url==""){
	        	return;
	        }
	        if(config.url.indexOf("/api/platform/")>=0){
	        	let query = info.editor.$route.query;
	        	config.params.appId = config.params.appId || query.appId;
				config.params.token = config.params.token || query.token;
				config.params.time = config.params.time || query.time;
				config.params.userUuid = config.params.userUuid || query.userUuid;
	        }
		   return config;
		},function(error){});
	},
    //重写新增文档页
    overwriteAddPage:function(){
        page_opt.add_ext = function(base){
            return function(){
                return base.apply(this, arguments);
            }
        }(page_opt.add);
        page_opt.add = function(base){
            return function(){
                let result = base.apply(this, arguments);
                //发送平台消息
                if(method.isNull(result)){
                    return woodoapi.send(info.SENDTYPE.ADD_PAGE, apiMessage.error("新增失败"));
                }
                let data = {
                	targetPageUuid : result.pre_page_info_uuid,
                	pageInfos : result.add_page_info_uuids,
                	type : result.type
                };
                woodoapi.send(info.SENDTYPE.ADD_PAGE, apiMessage.success("操作成功", data), woodoapi.bindRecord);
            }
        }(page_opt.add);
    },
    //重写复制文档页
    overwriteCopyPage:function(){
        page_opt.copy = function(base){
            return function(){
                let result =  base.apply(this, arguments);
                //发送平台消息
                if(method.isNull(result)){
                    return woodoapi.send(info.SENDTYPE.COPY_PAGE,apiMessage.error("复制失败"));
                }
                let data = {
                	prePageUuid : result.pre_page_info_uuid,
                	insertPageUuids : result.add_page_info_uuids
                };
                woodoapi.send(info.SENDTYPE.COPY_PAGE, apiMessage.success("操作成功", data), woodoapi.bindRecord);
            }
        }(page_opt.copy);
    },
    //重写删除文档页
    overwriteDelPage:function(){
        page_opt.delete_ext = function(base){
            return function(){
                return base.apply(this, arguments);
            }
        }(page_opt.delete);
        page_opt.delete = function(base){
            return function(){
                let result = base.apply(this, arguments);
                //发送平台消息
                if(method.isNull(result)){
                    return woodoapi.send(apiMessage.error("新增失败"));
                }
               	let data = {
               		deletePageUuids : result.delete_page_info_uuids
               	};
                woodoapi.send(info.SENDTYPE.DEL_PAGE, apiMessage.success("操作成功", data), woodoapi.bindRecord);
            }
        }(page_opt.delete);
    },
    //重写排序文档页
    overwriteSortPage:function(){
    	page_opt.set_sort_ext = function(base){
            return function(){
                return base.apply(this, arguments);
            }
        }(page_opt.set_sort);
        page_opt.set_sort = function(base){
            return function(){
            	let data = arguments[1];
            	woodoapi.send(info.SENDTYPE.ORDER_PAGE_CHECK, apiMessage.success("操作成功", data), function(_data){//检查是否可排序
            		if(method.isNull(_data) || method.isNull(_data.orderPageCheck) || !_data.orderPageCheck){
                		info.editor.$refs.sort_page_modal.reset_sort();
                		return;
                	}
                	let result = page_opt.set_sort_ext(info.editor,data);
                	 if(method.isNull(result)){
	                    return woodoapi.send(apiMessage.error("排序失败"));
	                }
	                data = {
	                	orderPageUuids : result.order_uuids,
	                	targetPageUuid : result.after_uuid
	                };
                	woodoapi.send(info.SENDTYPE.ORDER_PAGE, apiMessage.success("操作成功", data), woodoapi.bindRecord);
            	});
            }
        }(page_opt.set_sort);
    },
    //重写加载logo
    overwriteLoadingLogo:function(){
    	info.editor.loading_animation_type = "";
    	let time;
    	let fn = function(){
    		woodoapi.loadingEnd();
    	};
    	info.editor.start_loading_masking = function(base){
    		return function(){
                time = base.apply(this, arguments);
            }
    	}(info.editor.start_loading_masking);
    	info.editor.end_loading_masking = function(base){
    		return function(){
                base.apply(this,[time,fn]);
            }
    	}(info.editor.end_loading_masking);
    },
    //重写保存模式(默认手动保存)
    overwriteSaveModel:function(){
    	document_save.info.auto_save_flage = false;//默认关闭自动保存
    	//操作提示弹框
    	info.editor.init_reload_interval = function(base){
			return function(){
				if(!document_save.info.auto_save_flage){
					return;
				}
				base.apply(this, arguments);
			}
		}(info.editor.init_reload_interval);
    },
    //重写文档错误
    overwriteDocumentError:function(){
    	info.editor.init_document_data_error = function(base){
    		return function(){
	    		let data = arguments[0];
	    		let content = data.data.content;
	            info.editor.$toast('你没有该文档的编辑权限', 2000, function () {
	                if (content === 'documentAccessDenied' || content === '没有文档的相关权限'){
	                    window.location.href = '/no_power/?type=edit';
	                    return;
	                }
	                window.location.href = '/no_power/?type=nonexistent';
	            });
        	}
    	}(info.editor.init_document_data_error);
    },
    //重写文档页上限
    overwritePageMaxCount:function(){
    	page_opt.document_page_list_max_length = 999;
    },
    //重写保存文档
    overwriteSaveDocument:function(){
    	//快捷键保存
    	info.editor.save_document = function(base){
    		return function(){
	    		woodoapi.send(info.SENDTYPE.SAVE_DOC, apiMessage.success("操作成功"));
        	}
    	}(info.editor.save_document);
    },
    //重写撤回重做状态
    overwriteUndoRedoStatus:function(){
		document_save.method.set_undo_redo_status = function(base){
    		return function(){
    			base.apply(this, arguments);
    			let data = {
	    			canUndo:!info.editor.cannot_undo,
	        		canRedo:!info.editor.cannot_redo
    			};
    			woodoapi.send(info.SENDTYPE.RECORD_STATE, apiMessage.success("操作成功",data));
        	}
    	}(document_save.method.set_undo_redo_status);
    },
	//设置css
	setCss:function(css){
		if(method.isNull(css)){
			return;
		}
		let link = document.createElement('link'),
	        head = document.getElementsByTagName('head')[0];
		link.type = 'text/css';
		link.charset = 'UTF-8';
		link.href = css;
		link.rel="stylesheet";
	  	head.appendChild(link);
	},
    //设置保存文档模式
    setSaveModel:function(autoSave){
    	if(method.isNull(autoSave)){
    		autoSave = false;
    	}
    	document_save.info.auto_save_flage = autoSave;//true:自动保存,false:手动保存(默认)
    	document_save.method.ready(info.editor);
    	info.editor.init_reload_interval();
    },
    //设置文本字体
    setTextDefaultFontFamily:function(fontFamily){
    	if(method.isNull(fontFamily)){
    		return;
    	}
    	info.editor.$nextTick(() => {
			$.map(info.editor.$refs.create_tool.text_style_list,function(value,key){
    			$.each(value,function(i,item){
    				item.family = fontFamily;
    			});
    		});
		});
    },
    //设置文本字体排序
    setTextFontFamilyOrder:function(fontFamilyOrder){
    	if(method.isNull(fontFamilyOrder) || !method.isArray(fontFamilyOrder)){
    		return;
    	}
    	let map = {};
    	$.each(fontFamilyOrder.reverse(),function(i,item){
    		map[item] = 999 - (i + 1)
    	});
    	$.each(info.editor.$refs.format_panel.filter_family_list[0].item,function(i,item){
			item.order = 999;
			if(map[item.data]){
				item.order = map[item.data];
			}
		});
		info.editor.$refs.format_panel.filter_family_list[0].item.sort(function(a,b){
			if(a.order === b.order){
				return 0;
			}
            return a.order > b.order ? 1 : -1;
        });
    },
    //重写素材库
    setMaterialLibraryFastEnter:function(){
        info.editor.$nextTick(() => {
            let materialLibrary = info.editor.$refs.material_library;
            //快捷入口处理
            materialLibrary.images_menu = materialLibrary.images_menu.slice(0,1);
            info.editor.$axios.get(`/api/material/category/fast_enter/`, {params: {categoryId:materialLibrary.IMAGE_ID, type:'material'}}).then(function(data){
                data = data.data;
                if(data.code !== '2'){
                    console.error(data.content);
                    return;
                }
                data = data.data
                $.each(data,function(i,item){
                    materialLibrary.images_menu.push(item);
                });
            });
        });
    },
    //保存本地平台操作记录
    saveLocalPlatformRecord:function(){
    	try{
			//本地存储
			if(window && window.sessionStorage){
		    	try{
		            sessionStorage.setItem('platformRecords', JSON.stringify(info.platformRecords));
		        }catch(e){
		            sessionStorage.removeItem('platformRecords');
		        }
		    }
		}catch(e){}
    },
    isNull:function(data){
        if(typeof(data) === 'undefined' || data === ''){
            return true;
        }
        if($.isArray(data) && data.length === 0){
        	return true;
        }
        return false;
    },
    isArray:function(data){
    	return $.isArray(data);
    },
    isString:function(data){
    	return typeof(data) === 'string';
    }
};
let apiMessage= {
	code:2,
	data:'返回数据',
	msg:'返回提示',
	init:function(code,msg,data){
		this.code=code;
	    this.msg=msg;
        this.data=data;
	    return this.toString();
	},
	success:function(msg,data){
		return this.init(2,msg,data);
	},
	error:function(msg,data){
		return this.init(1,msg,data);
	},
	toString:function(){
		return {"code":this.code,"msg":this.msg,"data":this.data};
	}
}
let woodoapi = {
	page:{
		//新增文档页
		add:function(data){
			//参数获取、校验
			if(method.isNull(data)){
				return apiMessage.error("参数不允许为空");
			}
			let pageInfos = data.pageInfos;
			let targetPageUuid = data.targetPageUuid;
			let type = data.type;
			if(method.isNull(pageInfos)){
				return apiMessage.error("参数pageInfos不允许为空");
			}
			if(!method.isArray(pageInfos)){
				return apiMessage.error("参数pageInfos数据类型错误,应是array");
			}
			if(method.isNull(targetPageUuid) || !method.isString(targetPageUuid)){
				targetPageUuid = null;
			}
			let result = page_opt.add_ext(info.editor,{add_page_infos:pageInfos,target_page_info_uuid:targetPageUuid,type:type});
			if(method.isNull(result) || method.isNull(result.add_page_info_uuids)){
				return apiMessage.error("新增文档页失败");
			}
			woodoapi.addRecord(data,info.SENDTYPE.ADD_PAGE);//平台操作记录保存
			return apiMessage.success("操作成功", {targetPageUuid : result.pre_page_info_uuid,pageInfos : result.add_page_info_uuids,type : result.type});
		},
		//删除文档页
		del:function(data){
			if(method.isNull(data)){
				return apiMessage.error("参数不允许为空");
			}
			//参数获取
			let pageUuids = data.pageUuids;
			if(method.isNull(pageUuids)){
				return apiMessage.error("参数pageUuids不允许为空");
			}
			if(!method.isArray(pageUuids)){
				return apiMessage.error("参数pageUuids数据类型错误,应是array");
			}
			let result = page_opt.delete_ext(info.editor,pageUuids);
			if(method.isNull(result) || method.isNull(result.delete_page_info_uuids)){
				return apiMessage.error("删除文档页失败");
			}
			woodoapi.addRecord(data,info.SENDTYPE.DEL_PAGE);//平台操作记录保存
			return apiMessage.success("操作成功", result);
		},
		//替换文档页
		replace:function(data){
			if(method.isNull(data)){
				return apiMessage.error("参数不允许为空");
			}
			let pages = data.pages;
			if(method.isNull(pages)){
				return apiMessage.error("参数pages不允许为空");
			}
			if(!method.isArray(pages)){
				return apiMessage.error("参数pages数据类型错误,应是array");
			}
			//参数处理[{"srcUuid":xxx, "pageInfo":{}},...]
			let newPages = {};
			$.each(pages, function(i,item){
				newPages[item.srcUuid] = item.pageInfo;
			});
			let result = page_opt.replace(info.editor,newPages);
			if(method.isNull(result) || method.isNull(result.replace_page_info_uuids)){
				return apiMessage.error("替换文档页失败");
			}
			woodoapi.addRecord(data,info.SENDTYPE.REPLACE_PAGE);//平台操作记录保存
			return apiMessage.success("操作成功", result);
		},
		//排序文档页
		order:function(data){
			if(method.isNull(data)){
				return apiMessage.error("参数不允许为空");
			}
			let orderPageUuids = data.orderPageUuids;
			let targetPageUuid = data.targetPageUuid;
			if(method.isNull(orderPageUuids)){
				return apiMessage.error("参数orderPageUuids不允许为空");
			}
			if(!method.isArray(orderPageUuids)){
				return apiMessage.error("参数orderPageUuids数据类型错误,应是array");
			}
			if(method.isNull(targetPageUuid) || !method.isString(targetPageUuid)){
				targetPageUuid = null;
			}
			let result = page_opt.set_sort_ext(info.editor,{after_uuid:targetPageUuid,order_uuids:orderPageUuids});
			if(method.isNull(result) ||  method.isNull(result.after_uuid) || method.isNull(result.order_uuids)){
				return apiMessage.error("排序文档页失败");
			}
			woodoapi.addRecord(data,info.SENDTYPE.ORDER_PAGE);//平台操作记录保存
	        return apiMessage.success("操作成功", result);
		},
		//选择文档页
		select:function(data){
			if(method.isNull(data)){
				return apiMessage.error("参数不允许为空");
			}
			let pageUuid = data.pageUuid;
			if(method.isNull(pageUuid)){
				return apiMessage.error("参数pageUuid不允许为空");
			}
			if(!method.isString(pageUuid)){
				return apiMessage.error("参数pageUuid数据类型错误,应是string");
			}
			page_opt.render(info.editor, pageUuid);
			return apiMessage.success("操作成功");
		}
	},
	//根据
	addPagesByDocIds:function(data){
		if(method.isNull(data)){
			return apiMessage.error("参数不允许为空");
		}
		let docIds = data.docIds;
		let targetPageUuid = data.targetPageUuid;
		let delPageUuids = data.delPageUuids;
		let appId = data.appId;
		let token = data.token;
		let time = data.time;
		if(!method.isArray(docIds)){
			return apiMessage.error("参数docId数据类型错误,应是array");
		}
		if(docIds.length === 0){
			return apiMessage.error("参数docId不允许为空");
		}
		if(method.isNull(targetPageUuid) || !method.isString(targetPageUuid)){
			targetPageUuid = null;
		}
		let addPages = [];
		let addPagesSize = [];
		let error;
		$.ajax({
            type: 'GET',
            url: '/api/platform/document/multiple_detail/',
            cache:false, 
       		async:false, 
            data: {
                appId : appId,
                token : token,
                time : time,
                docIds : docIds.toString()
            },
            success: function (result) {
            	if(result.type === 'success'){
            		result = result.data;
            		for(let i = 0; i < result.length; i++){
            			addPages = addPages.concat(result[i].documentPages);
            			addPagesSize.push(result[i].documentPages.length);
            		}
            	}else{
            		error = apiMessage.error(result.content);
            	}
            }
        });
        if(error){//ajax请求失败
        	return error;
        }
		let addPagesResult = woodoapi.page.add({pageInfos:addPages,targetPageUuid:targetPageUuid,record:data.record});
		if(method.isArray(delPageUuids)){//先新增再删除文档页
			page_opt.delete_ext(info.editor,delPageUuids);
		}
		if(addPagesResult.code === 1){//添加页失败
			return addPagesResult;
		}
		let pageInfos = addPagesResult.data.pageInfos;
		let result = [];
		for(let i = 0; i < addPagesSize.length; i++){
			let size = addPagesSize[i];
			result.push({
				docId : docIds[i],
				pageUuids : pageInfos.splice(0,size)
			});
		}
        return apiMessage.success("操作成功", result);
	},
	//导出
	export:function(data){
		let docId=data.docId,
			type=data.type,
			token=data.token,
			appId=data.appId,
			time=data.time,
			password=data.password,
			title=data.title;
            let downData = {
                url:'/api/platform/document/get_task_msg/',
                type: type,
                title : title,
                params :{
                	time : time,
                    docId : docId,
                    token : token,
                    appId : appId,
                    password : password,
                    host:location.origin
                },
            };
			info.editor.$refs.down_modal.down(downData);
	},
	//添加操作记录(type:操作类型)
	addRecord:function(data, type){
		if(method.isNull(data) || method.isNull(data.record) || method.isNull(data.record.master)){
			return apiMessage.error("参数不允许为空");
		}
		info.platformRecords.tmp.push(data.record.master);
		if(method.isNull(type)){
			document_save.method.save_command_history(info.editor);
		}
		return apiMessage.success("操作成功");
	},
	//绑定操作记录
	bindRecord:function(data){
		if(method.isNull(data) || method.isNull(data.master)){
			return apiMessage.error("参数不允许为空");
		}
		let index = document_save.info.command_history_index;
		info.platformRecords.undo[index] = data.master.undo;
		info.platformRecords.redo[index] = data.master.redo;
	},
	//获取保存指令
	getSaveCommand:function(){
		return apiMessage.success("操作成功",document_save.method.get_mt_save_data(info.editor));
	},
	//设置保存指令结果
	setSaveCommandResult:function(data){
		if(method.isNull(data)){
			return apiMessage.error("参数不允许为空");
		}
		if(data.type !== 'success'){
			return apiMessage.error(data.content);
		}
		data = data.data;
		//文档
		let isNewDocument = info.editor.document_info.id === null ? true : false;
		if(isNewDocument){
			info.editor.document_info.id = data.docId;
            info.editor.document_info.title = data.docTitle;
            info.editor.document_info.url = data.docUrl;
		}
		info.editor.document_info.editCount = data.docEditCount;
		//文档页
		info.editor.document_page_list.forEach(function(currentValue,index){
			let pageId = data.pageUuidMappingId[currentValue.uuid];
            if(typeof(pageId) === 'undefined'){
            	return true;
            }
            currentValue.id = pageId;
		});
		info.editor.modal_id = null;
		document_save.info.document_uuid_mapping_id = data.docUuidMappingId;
		info.editor.init_document_other_data();
		document_save.method.save_local_document_uuid_mapping_id();
		document_save.method.save_local_command_history_ext();
		document_save.method.mt_save_success(info.editor)
		return apiMessage.success("操作成功");
	},
	//撤回
	undo:function(){
		info.editor.undo_redo_document("undo");
	},
	//重做
	redo:function(){
		info.editor.undo_redo_document("redo");
	},
	init_config:function(config){
		var base_config = {};
        Object.assign(base_config,config);
        //css处理
        method.setCss(base_config.css);
        //保存模式
        method.setSaveModel(config.autoSave);
        //字体处理
        method.setTextDefaultFontFamily(base_config.fontFamily);
        //字体排序处理
        method.setTextFontFamilyOrder(base_config.fontFamilyOrder);
        //设置素材库快捷入口数据
        method.setMaterialLibraryFastEnter();
	},
	init:function(defaultEditor){
		info.editor = defaultEditor;
		let appId=info.editor.$route.query.appId;
		let token=info.editor.$route.query.token;
		let time=info.editor.$route.query.time;
		let docId=info.editor.$route.query.docId;
		let userUuid=info.editor.$route.query.userUuid;
		//1token和appId不存在时不初始化api
		if(!token||!appId){
			return;
		}
		console.log("woodo api init .....",{"appId":appId,"token":token,"time":time,"docId":docId,"userUuid":userUuid});
		CD.ready();
		CD.extends("addPage",woodoapi.page.add);
		CD.extends("delPage",woodoapi.page.del);
		CD.extends("replacePage",woodoapi.page.replace);
		CD.extends("orderPage",woodoapi.page.order);
		CD.extends("selectPage",woodoapi.page.select);
		CD.extends("addPagesByDocIds",woodoapi.addPagesByDocIds);
		CD.extends("export",woodoapi.export);
		CD.extends("addRecord",woodoapi.addRecord);
		CD.extends("getSaveCommand",woodoapi.getSaveCommand);
		CD.extends("setSaveCommandResult",woodoapi.setSaveCommandResult);
		CD.extends("undo",woodoapi.undo);
		CD.extends("redo",woodoapi.redo);

		CD.extends("init_config",woodoapi.init_config);
		method.overwriteMethod();
		console.log("woodo api init success.....");
	},
	//加载结束
	loadingEnd:function(){
		CD.send("MASTER","loadingEnd", null, null, null);
	},
	send:function (opt, data, callback) {
		CD.send("MASTER","listenMessage", {"opt":opt,"data":data}, callback, null);
	}
}
export default woodoapi;