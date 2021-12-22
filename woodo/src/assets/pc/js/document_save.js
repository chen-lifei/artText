import document_backup from '@/assets/pc/js/document_backup.js';
import document_save_error from '@/assets/pc/js/document_save_error.js';
import document_command from '@/assets/pc/js/document_command.js';

//属性声明
let info = {
	//指令队列
	command_queue : [],
	//指令撤回历史
	command_undo_history : [],
	//指令重做历史
	command_redo_history : [],
	//指令历史下标
	command_history_index : -1,
    //指令历史文档uuid
    command_history_document_uuid : null,
    //指令版本（编辑次数去重）
    command_version : null,
	//设置保存提示timeout
	set_save_tips_timeout : '',
	//文档uuid映射id
	document_uuid_mapping_id : {},
    //保存中标识
    saving_flag : false,
	//撤回/重做标识
	undo_redo_flag : false,
	//协作指令标识
	collaborate_commnad_flag : false,
    //获取编辑文档幻币标识
    get_edit_doc_hcoin_flag : false,
	//协作已编辑数据
	collaborate_edited_data : {},
    //旧文档数据（扩展创建流程，撤回/重做场景）
    oldDocumentData : null,
    //自动保存标识
    auto_save_flage : true,
    mt_save:{
        //手动保存上次保存数据
        lastVersionData : null
    },
    //备用保存url
    random_save_url : false
};

//方法声明
let method = {
	//准备
	ready : function(that){
        if(!info.auto_save_flage){
            info.mt_save.lastVersionData = method.get_document_data(that);
            return;
        }
		method.listener_command_queue(that);
        document_backup.method.ready(that);
	},
    //获取将保存文档数据
    get_document_data(that){
        let documentData = {
            modal_id : that.modal_id,
            document_info : that.document_info,
            document_page_list : that.document_page_list,
            page_info_uuid : that.page_info.uuid
        }
        documentData = $.extend(true,{},documentData);
        //排除字段监控
        delete documentData.document_info.url;
        delete documentData.document_info.editCount;
        delete documentData.document_info.modifyDate;
        return documentData;
    },
	//保存
	save : function(that, oldDocumentData, newDocumentData){
		//1、撤回/重做标识
        if(info.undo_redo_flag){
            info.undo_redo_flag = false;
            return;
        }
        //2、协作指令标识
		if(info.collaborate_commnad_flag){
			info.collaborate_commnad_flag = false;
			return;
		}
        //3、保存
        //指令获取(切换页先获取比对数据再进行保存)
        if(info.oldDocumentData !== null){
            oldDocumentData = info.oldDocumentData;
            info.oldDocumentData = null;
        }
        let commands = document_command.method.get(oldDocumentData, newDocumentData, utils.deepClone(that.cursor_position));
        if(typeof(commands) === 'undefined'){
            return;
        }
        //新文档
        if(that.document_info.uuid === null){
            that.document_info.id = null;
            that.document_info.uuid = utils.uuid();
            $.each(that.document_page_list,function(i,item){
                item.id = null;
            });
            //首次创建保存初始数据
            info.oldDocumentData = oldDocumentData;
            info.oldDocumentData.document_info.id = null;
            $.each(info.oldDocumentData.document_page_list,function(i,item){
                item.id = null;
            });
            return;
        }
        $.each(commands,function(i,command){
            //推送指令
            method.command_push(command.redo);
            //保存指令历史
            method.save_command_history(that,command);
            //协作通讯
            that.ws_doc_save_send(command.redo);
        });
	},
    //设置保存提示
	set_save_tips : function(that, status){
		clearTimeout(info.set_save_tips_timeout);
		if(status === 'saving'){
			that.document_info.modifyDate = '正在保存...';
		}else if(status === 'success'){
			info.set_save_tips_timeout = setTimeout(function(){
				that.document_info.modifyDate = '已自动保存到云端';
				info.set_save_tips_timeout = setTimeout(function(){
	                that.document_info.modifyDate = '最近保存' + utils.returnRelativeTime(new Date());
	            },30 * 1000);
			},1.5 * 1000);
			
		}else if(status === 'error'){
			that.document_info.modifyDate = '<span style="color: #ff1313;">自动保存失败</span>';
		}
	},
	//撤回/重做
	undo_redo : function(that, type){
        let index = info.command_history_index;
		let command;
		if(type === 'undo'){
			//撤回
			if(index < 0){
                that.$toast('无法继续撤回', 800);
				return;
			}
			command = info.command_undo_history[index--];
        }else if(type === 'redo'){
        	//重做
        	if(index >= ((info.command_undo_history.length + info.command_redo_history.length) / 2) - 1){
                that.$toast('无法继续还原', 800)
	            return;
	        }
	        command = info.command_redo_history[++index];
        }
        info.command_history_index = index;
        if(command && command.document && command.document.uuid !== null){
            //1、撤回/重做预处理
            method.undo_redo_pretreatment(that,type,command);
            if(!document_command.method.command_isnull(command)){
                //2、推送指令
                method.command_push(command);
                //3、渲染指令
                method.render_command(that, command, false);
                //4、协作通讯
                that.ws_doc_save_undo_redo_send(command);
                //5、设置撤回/重做标识
                info.undo_redo_flag = true;
            }
        }
        //保存本地指令历史
        method.save_local_command_history();
        //其他
        //设置撤回/重做状态
        method.set_undo_redo_status(that);
        return command;
	},
	//撤回/重做预处理
	undo_redo_pretreatment : function(that,type,command){
		//1、协作编辑场景（如：A为主，B为次）
        //获取所有B端编辑对应的A端步骤
		let steps = Object.keys(info.collaborate_edited_data);
		$.each(steps,function(i,item){
			steps[i] = Number(item);
		});
        let h_index = info.command_history_index;
        if(type === 'undo'){
            h_index++;
        }else{}
        //放入A端当前步骤
		if(steps.indexOf(h_index) === -1){
            steps.push(h_index);
        }
        //排序
        steps.sort(function(a,b){
            return a > b ? 1 : -1;
        });
        //获取A端撤回/重做时不能渲染的数据
        steps = steps.slice(steps.indexOf(h_index));
        let all_editedDocument = [];//所有编辑的文档
        let all_editedDocumentPages = {};//所有编辑的文档页
        let all_deletedDocumentPages = [];//所有删除的文档页
        $.each(steps,function(i,item){
        	let data = info.collaborate_edited_data[item];
        	if(typeof(data) === 'undefined'){
                return true;
            }
			let editedDocument = data.editedDocument || [];
            let editedDocumentPages = data.editedDocumentPages || {};
            let deletedDocumentPages = data.deletedDocumentPages || [];
           	//文档 
            all_editedDocument = $.unique(all_editedDocument.concat(editedDocument));
            //文档页
            $.each(Object.keys(editedDocumentPages),function(j,jtem){
                let all_editedDocumentPage = all_editedDocumentPages[jtem];
                if(typeof(all_editedDocumentPage) === 'undefined'){
                    all_editedDocumentPage = [];
                }
                all_editedDocumentPages[jtem] = $.unique(all_editedDocumentPage.concat(editedDocumentPages[jtem]));
            });
            all_deletedDocumentPages = $.unique(all_deletedDocumentPages.concat(deletedDocumentPages));
        });
        //2、处理指令
        if(all_editedDocument.indexOf('title') !== -1){
            delete command.document.title;
        }
        if(all_editedDocument.indexOf('background') !== -1){
            delete command.document.background;
        }
        if(all_editedDocument.indexOf('shapeColor') !== -1){
            delete command.document.shapeColor;
        }
        if(all_editedDocument.indexOf('textColor') !== -1){
            delete command.document.textColor;
        }
        if(all_editedDocument.indexOf('font') !== -1){
            delete command.document.font;
        }
        if(all_editedDocument.indexOf('width') !== -1){
            delete command.document.width;
        }
        if(all_editedDocument.indexOf('height') !== -1){
            delete command.document.height;
        }
        if(all_editedDocument.indexOf('switchType') !== -1){
            delete command.document.switchType;
        }
        if(all_editedDocument.indexOf('attr') !== -1){
            delete command.document.attr;
        }
        $.each(command.documentPages,function(i,item){
            if(item.type == "edit"){
                //是否被删除过
                if(all_deletedDocumentPages.indexOf(item.uuid) != -1){
                    command.documentPages[i] = {};
                    if(command.cursor_position.page_info_uuid !== null && command.cursor_position.page_info_uuid === item.uuid){
                        command.cursor_position.element = null;
                        command.cursor_position.startContainer = null;
                        command.cursor_position.startOffset = 0;
                        command.cursor_position.endContainer = null;
                        command.cursor_position.endOffset = 0;
                    }
                    return true;
                }
                let all_editedDocumentPage = all_editedDocumentPages[item.uuid];
                if(typeof(all_editedDocumentPage) === "undefined"){
                    return true;
                }
                if(all_editedDocumentPage.indexOf("title") != -1){
                    delete item.title;
                }
                if(all_editedDocumentPage.indexOf("background") != -1){
                    delete item.background;
                }
                if(all_editedDocumentPage.indexOf("switchType") != -1){
                    delete item.switchType;
                }
                if(all_editedDocumentPage.indexOf("isLock") != -1){
                    delete item.isLock;
                }
                if(all_editedDocumentPage.indexOf("pageNumber") != -1){
                    delete item.pageNumber;
                }
                if(all_editedDocumentPage.indexOf("attr") != -1){
                    delete item.attr;
                }
                let new_elementList_edit = [];
                //元素-新增(废弃兼容)
                if(typeof(item.elementList.add) !== 'undefined'){
                    $.each(item.elementList.add,function(j,jtem){
                        if(all_editedDocumentPage.indexOf(jtem.id) === -1){
                            new_elementList_edit.push(jtem);
                        }
                    });
                }
                //元素-编辑
                $.each(item.elementList.edit,function(j,jtem){
                    if(all_editedDocumentPage.indexOf(jtem.id) === -1){
                        new_elementList_edit.push(jtem);
                    }
                });
                item.elementList.edit = new_elementList_edit;
                //元素-删除
                let new_elementList_delete = [];
                $.each(item.elementList.delete,function(j,jtem){
                    if(all_editedDocumentPage.indexOf(jtem) === -1){
                        new_elementList_delete.push(jtem);
                    }
                });
                item.elementList.delete = new_elementList_delete;
                //元素-排序
                let new_elementList_order = [];
                if(all_editedDocumentPage.indexOf('order_1') === -1){
                    $.each(item.elementList.order,function(j,jtem){
                        new_elementList_order.push(jtem);
                    });
                }
                item.elementList.order = new_elementList_order;
                if(command.cursor_position.page_info_uuid !== null && command.cursor_position.page_info_uuid === item.uuid){
                    if(command.cursor_position.element !== null && all_editedDocumentPage.indexOf(command.cursor_position.element) !== -1){
                        command.cursor_position.element = null;
                        command.cursor_position.startContainer = null;
                        command.cursor_position.startOffset = 0;
                        command.cursor_position.endContainer = null;
                        command.cursor_position.endOffset = 0;
                    }
                    command.cursor_position.checked_elements = $.grep(command.cursor_position.checked_elements,v => all_editedDocumentPage.indexOf(v) === -1);
                }
            }else if(item.type == "delete"){
                let all_editedDocumentPage = all_editedDocumentPages[item.uuid];
                if(typeof(all_editedDocumentPage) !== 'undefined'){
                    command.documentPages[i]= {};
                    if(command.cursor_position.page_info_uuid !== null && command.cursor_position.page_info_uuid === item.uuid){
                        command.cursor_position.element = null;
                        command.cursor_position.startContainer = null;
                        command.cursor_position.startOffset = 0;
                        command.cursor_position.endContainer = null;
                        command.cursor_position.endOffset = 0;
                        command.cursor_position.checked_elements = $.grep(command.cursor_position.checked_elements,v => all_editedDocumentPage.indexOf(v) === -1);
                    }
                }
            }
        });
	},
	//设置撤回/重做状态
	set_undo_redo_status : function(that){
		that.cannot_undo = info.command_history_index < 0;
        that.cannot_redo = info.command_history_index >= info.command_redo_history.length - 1;
	},
	//指令入列
	command_push:function(command){
		info.command_queue.push(command);
        //备份
        document_backup.method.add_backup_push(command);
	},
	//首个指令
	first_command:function(){
        let command = info.command_queue[0];
		return command;
	},
    //指令出列
	command_shift:function(){
		info.command_queue.shift();
	},
	//指令预处理
	command_pretreatment : function(command){
        if(!command){
            return command;
        }
        let new_command = utils.deepClone(command);
        //1、文档id处理
        try{
            if(info.document_uuid_mapping_id){
                let doc_id = info.document_uuid_mapping_id[new_command.document.uuid];
                if(typeof(doc_id) !== 'undefined'){
                    new_command.document.id = doc_id;
                }
            }
        }catch(e){
            console.error('文档id处理异常', e, JSON.stringify(info.document_uuid_mapping_id), JSON.stringify(command));
        }
        //2、去除无用数据
        try{
        //光标
            delete new_command.cursor_position;
            //文档页定位
            delete new_command.page_info_uuid;
            //旧数据
            delete new_command.uuid;
            delete new_command.source;
        }catch(e){
            console.error('去除无用数据异常', e);
        }
        //3、移除删除页无用数据
        try{
            $.each(new_command.documentPages,function(i,item){
                if(item.type === 'delete'){
                    delete item.elementList;
                }
            });
        }catch(e){
            console.error('移除删除页无用数据', e, JSON.stringify(command));
        }
        //4、编辑次数去重异常
        try{
            let document_edit = [];
            $.map(new_command.document,function(value,key){
                if($.inArray(key, ['background', 'shapeColor', 'textColor', 'font']) === -1){
                    return true;
                }
                document_edit.push(key);
            });
            $.each(new_command.documentPages,function(i,item){
                $.map(item,function(value,key){
                    if($.inArray(key, ['background']) !== -1){
                        return true;
                    }
                    document_edit.push(key);
                });
                if(!item.elementList){
                    return true;
                }
                if(typeof(item.elementList.add) !== 'undefined'){//废弃兼容
                    $.each(item.elementList.add,function(j,jtem){
                        document_edit.push(jtem.id)
                    });
                }
                $.each(item.elementList.edit,function(j,jtem){
                    document_edit.push(jtem.id)
                });
                $.each(item.elementList.delete,function(j,jtem){
                    document_edit.push(jtem)
                });
                $.each(item.elementList.order,function(j,jtem){
                    document_edit.push(jtem)
                });
            });
            if(document_edit.length === 0){
                new_command.document.editCount = false;
            }else{
                document_edit = document_edit.sort();//排序
                let version = $.md5(JSON.stringify(document_edit));
                if(info.command_version !== version){
                    info.command_version = version;
                    new_command.document.editCount = true;
                }else{
                    new_command.document.editCount = false;
                }
            }
        }catch(e){
            console.error('编辑次数去重异常', e);
        }
        return new_command;
	},
	//监听指令队列
	listener_command_queue : function(that){
		//延迟策略:0, 1000, 2000, 3000, 5000, 9000毫秒
        let timeout_seconds = [0, 1000, 2000, 3000, 5000, 9000];
        let timeout_second = 0;
        let error_count = 0;
        let error_event = null;//失败事件
        let run = function(){
            try{
                let command;
                if(that.user.login){//已登陆则出列
                    command = method.first_command();
                }
            	if(command){
                    if(!info.saving_flag){
                        info.saving_flag = true;
                		let new_command = method.command_pretreatment(command);
                        //是否创建文档(true:创建，false:更新)
                        let createDocument = new_command.document.id === null;
                        //请求URL处理
                        let url = method.get_save_url();
                        if(createDocument){
                            url += new_command.templateDocId !== null ? `?templateDocId=${new_command.templateDocId}` : '';
                        }else{
                            url += new_command.document.id !== null ? `?docId=${new_command.document.id}` : '';
                        }
                		$.ajax({
                            type: 'POST',
                            timeout:20*1000,
                            url: url,
                            contentType: 'application/json',
                            data: JSON.stringify(new_command),
                            beforeSend: function(){
                            	method.set_save_tips(that,"saving");
                            },
                            success: function (data) {
                            	let code = data.code;
                                let content = data.content;
                            	if (code === '2') {
                                    //保存成功数据处理
                                    data = data.data;
                                    //文档
                                    if(createDocument){//创建文档
                                        that.document_info.id = data.docId;
                                        that.document_info.url = data.docUrl;
                                        that.document_info.title = data.docTitle;
                                    }
                                    that.document_info.editCount = data.docEditCount;
                                    //文档页
                                    $.each(that.document_page_list,function(i,item){
                                        let pageId = data.pageUuidMappingId[item.uuid];
                                        if(typeof(pageId) === 'undefined'){
                                        	return true;
                                        }
                                        item.id = pageId;
                                    });
                                    //其他业务处理
                                    if(createDocument){//创建文档
                                        //模版id置空
                                        that.modal_id = null;
                                        //保存文档uuid与id映射,处理已入队列的修改文档指令文档id
                                        info.document_uuid_mapping_id = data.docUuidMappingId;
                                        method.save_local_document_uuid_mapping_id();
                                        //更新文档权限
                                        that.get_user_authority();
                                    }else{//更新文档
                                        //更新文档其他数据
                                        that.init_document_other_data();
                                        //更新幻币获取
                                        if(that.document_info.editCount > 100 && !info.get_edit_doc_hcoin_flag){
                                            that.get_edit_doc_hcoin();
                                            info.get_edit_doc_hcoin_flag = true;
                                        }
                                    }
                                    //保存失败数据清除处理
                                    error_count = 0;
                                    document_save_error.method.clear_save_error_data(that);
                                    //保存成功提示
                                    method.set_save_tips(that,"success");
                                    //指令出栈
                                    method.command_shift();                                    
                            	}else{
                                    //保存失败处理
                                    console.error(content, new_command);
                                    error_count++;
                                    method.set_save_tips(that,"error");
                                    document_save_error.method.set_save_error_data(that,info.command_queue);
                            	}
                            },
                            error:function(XMLHttpRequest, textStatus, errorThrown){
                                //保存失败处理
                                console.error('文档保存失败', textStatus, new_command);
                                error_count++;
                                error_event = XMLHttpRequest.getResponseHeader("woodoEvent");
                                method.set_save_tips(that,"error");
                                document_save_error.method.set_save_error_data(that,info.command_queue);
                            },
                            complete: function(xhr,textStatus){
                                info.saving_flag = false;   
                            }
                        });
                    }
            	}
            }catch(e){
                console.error("文档保存异常", e);
            }
        	//延迟策略计算
    		let tmp_timeout_second = timeout_seconds[error_count];
    		if(typeof(tmp_timeout_second) !== 'undefined'){
    			timeout_second = tmp_timeout_second;
                document_save_error.method.hide_save_error_modal(that);
    		}else if(error_event !== 'memberRankAuthorityValid'){//不对会员权限校验提示失败弹框
                document_save_error.method.show_save_error_modal(that);
            }
            setTimeout(function(){
            	run();
            },timeout_second + 500);
        }
        run();
	},
	//渲染指令(is_collaborate:是否协作指令)
	render_command : function(that, command, is_collaborate){
		//文档
        document_command.method.set_document_different(that.document_info,command.document);
		//文档页
        document_command.method.set_documentPage_different(that.document_page_list,command.documentPages);
        //当前文档页
        let page_info;
        if(is_collaborate){
            //协作渲染
            $.each(that.document_page_list,function(i,item){
                if(item.uuid === that.page_info.uuid){
                    page_info = item;
                    return false;
                }
            });
            if(typeof(page_info) === 'undefined'){
                $.each(that.document_page_list,function(i,item){
                    if(item.uuid === command.page_info_uuid){
                        page_info = item;
                        return false;
                    }
                });
            }
        }else{
            //非协作渲染
            $.each(that.document_page_list,function(i,item){
                if(item.uuid === command.page_info_uuid){
                    page_info = item;
                    return false;
                }
            });
        }
        if(typeof(page_info) === 'undefined'){
            page_info = that.document_page_list[0];
        }
        that.page_info = page_info;
        //被编辑数据处理
        info.collaborate_commnad_flag = is_collaborate;
        if(is_collaborate){
        	method.save_collaborate_edited_data(that,command);
        }
	},
	//保存指令历史
	save_command_history:function(that,command){
        let overstep;//超出记录限制标识
		try{
			if(!command){
				command = {undo:{},redo:{}};
			}
			command = utils.deepClone(command);
			info.command_undo_history.splice(info.command_history_index + 1, info.command_undo_history.length,command.undo);
	        info.command_redo_history.splice(info.command_history_index + 1, info.command_redo_history.length,command.redo);
            info.command_history_index = ((info.command_undo_history.length + info.command_redo_history.length) / 2) - 1;
            info.command_history_document_uuid = that.document_info.uuid;
	        if(info.command_undo_history.length !== info.command_redo_history.length){
                info.collaborate_edited_data = {};
	        	info.command_undo_history = [];
	        	info.command_redo_history = [];
	        	info.command_history_index = -1;
	        }
	        if(info.command_history_index < 99){
                //更新被编辑步数
                let length = ((info.command_undo_history.length + info.command_redo_history.length) / 2) - 1;
                $.each(Object.keys(info.collaborate_edited_data),function(i,item){
                    if(item >= length){
                        delete info.collaborate_edited_data[item];
                    }
                });
                overstep = false;
	        }else{
                //最大限制
                info.command_undo_history.splice(0, 1);
                info.command_redo_history.splice(0, 1);
                info.command_history_index = ((info.command_undo_history.length + info.command_redo_history.length) / 2) - 1;
                //更新被编辑步数
                let new_collaborate_edited_data = {};
                $.each(Object.keys(info.collaborate_edited_data),function(i,item){
                    if(item != -1){
                        new_collaborate_edited_data[item-1]=info.collaborate_edited_data[item];
                    }
                });
                info.collaborate_edited_data = new_collaborate_edited_data;
                overstep = true;
            }
	        //本地化
	        method.save_local_command_history();
    	} catch(e){
    		console.error('指令历史记录保存异常', e);
    	}
    	method.set_undo_redo_status(that);
        return overstep;
	},
	//保存本地uuid映射id
    save_local_document_uuid_mapping_id : function(){
        if(window && window.sessionStorage){
            try{
                sessionStorage.setItem('document_uuid_mapping_id', JSON.stringify(info.document_uuid_mapping_id))
            }catch(e){
                sessionStorage.removeItem('document_uuid_mapping_id');
            }
        }
    },
    //保存本地指令历史
	save_local_command_history : function(){
		if(window && window.sessionStorage){
        	try{
	            sessionStorage.setItem('command_undo_history', JSON.stringify(info.command_undo_history));
	            sessionStorage.setItem('command_redo_history', JSON.stringify(info.command_redo_history));
	            sessionStorage.setItem('command_history_index', info.command_history_index);
                sessionStorage.setItem('command_history_document_uuid', info.command_history_document_uuid);
	            sessionStorage.setItem('collaborate_edited_data', JSON.stringify(info.collaborate_edited_data));
	        }catch(e){
	            sessionStorage.removeItem('command_undo_history');
	            sessionStorage.removeItem('command_redo_history');
	           	sessionStorage.removeItem('command_history_index');
                sessionStorage.removeItem('command_history_document_uuid');
	           	sessionStorage.removeItem('collaborate_edited_data');
	        }
        }
	},
	//恢复本地指令历史
	recovery_local_command_history : function(that){
        let is_new;
		try{
			//本地化
			if(window && window.sessionStorage){
                let document_uuid_mapping_id = JSON.parse(sessionStorage.getItem('document_uuid_mapping_id'));
				let command_undo_history = JSON.parse(sessionStorage.getItem('command_undo_history'));
                let command_redo_history = JSON.parse(sessionStorage.getItem('command_redo_history'));
                let command_history_index = sessionStorage.getItem('command_history_index');
                let command_history_document_uuid = sessionStorage.getItem('command_history_document_uuid');
                let collaborate_edited_data = JSON.parse(sessionStorage.getItem('collaborate_edited_data'));
                if(typeof(command_history_document_uuid) !== 'undefined' && that.document_info.uuid !== null && command_history_document_uuid === that.document_info.uuid ){
                    if(command_undo_history !== null && command_redo_history !== null && command_history_index !== null && collaborate_edited_data !== null && command_history_document_uuid !== null){
                        info.document_uuid_mapping_id = document_uuid_mapping_id;
                        info.command_undo_history = command_undo_history;
                        info.command_redo_history = command_redo_history;
                        info.command_history_index = Number(command_history_index);
                        info.command_history_document_uuid = command_history_document_uuid;
                        info.collaborate_edited_data = collaborate_edited_data;
                        is_new = false;
                    }else{
                        is_new = true
                    }
                }else{
                    is_new = true
                }
			}
        }catch(e){
        	console.error('指令历史记录恢复异常', e);
        }
        method.set_undo_redo_status(that);
        return is_new;
	},
	//保存协作已编辑数据
	save_collaborate_edited_data : function(that,command){
		let index = info.command_history_index;
		let length = (info.command_undo_history.length + info.command_redo_history.length) / 2;
		//1、处理操作记录
		info.command_undo_history.splice(info.command_history_index+1,length);
       	info.command_redo_history.splice(info.command_history_index+1,length);
        let result_length = (info.command_undo_history.length + info.command_redo_history.length) / 2;
		//2、处理已编辑数据
		if(result_length === 0){
			info.collaborate_edited_data = {};
		}else{
			for(let i = index;i<length;i++){
                if(typeof(info.collaborate_edited_data[i]) !== 'undefined'){
                    delete info.collaborate_edited_data[i];
                }
            }
		}
		//3、封装被编辑数据
		let data = info.collaborate_edited_data[info.command_history_index] || {};
		//已编辑文档
        let editedDocument = data.editedDocument || [];
        //已编辑文档页
        let editedDocumentPages = data.editedDocumentPages || {};
        //已删除文档页
        let deletedDocumentPages = data.deletedDocumentPages || [];

        let documentKeys = Object.keys(command.document);
        if(documentKeys.indexOf("title") !== -1){
            editedDocument.push("title");
        }
        if(documentKeys.indexOf("background") !== -1){
            editedDocument.push("background");
        }
        if(documentKeys.indexOf("shapeColor") !== -1){
            editedDocument.push("shapeColor");
        }
        if(documentKeys.indexOf("textColor") !== -1){
            editedDocument.push("textColor");
        }
        if(documentKeys.indexOf("font") !== -1){
            editedDocument.push("font");
        }
        if(documentKeys.indexOf("width") !== -1){
            editedDocument.push("width");
        }
        if(documentKeys.indexOf("height") !== -1){
            editedDocument.push("height");
        }
        if(documentKeys.indexOf("switchType") !== -1){
            editedDocument.push("switchType");
        }
        if(documentKeys.indexOf("attr") !== -1){
            editedDocument.push("attr");
        }

        $.each(command.documentPages,function(i,item){
            if(item.type === "edit"){
                let editedDocumentPage = editedDocumentPages[item.uuid] || [];
                //文档页
                let documentPageKeys = Object.keys(item);
                if(documentPageKeys.indexOf("title") !== -1){
                    editedDocumentPage.push("title");
                }
                if(documentPageKeys.indexOf("background") !== -1){
                    editedDocumentPage.push("background");
                }
                if(documentPageKeys.indexOf("switchType") !== -1){
                    editedDocumentPage.push("switchType");
                }
                if(documentPageKeys.indexOf("isLock") !== -1){
                    editedDocumentPage.push("isLock");
                }
                if(documentPageKeys.indexOf("pageNumber") !== -1){
                    editedDocumentPage.push("pageNumber");
                }
                if(documentPageKeys.indexOf("attr") !== -1){
                    editedDocumentPage.push("attr");
                }
                //元素
                let elementList = item.elementList;
                if(typeof(elementList.add) !== 'undefined'){//废弃兼容
                    $.each(elementList.add,function(j,jtem){
                        if(editedDocumentPage.indexOf(jtem.id) === -1){
                            editedDocumentPage.push(jtem.id);
                        }
                    });
                }
                $.each(elementList.edit,function(j,jtem){
                    if(editedDocumentPage.indexOf(jtem.id) === -1){
                        editedDocumentPage.push(jtem.id);
                    }
                });
                $.each(elementList.delete,function(j,jtem){
                    if(editedDocumentPage.indexOf(jtem) === -1){
                        editedDocumentPage.push(jtem);
                    }
                });
                editedDocumentPage.push(elementList.is_order ? 'order_1' : 'order_0');
                editedDocumentPages[item.uuid] = editedDocumentPage;
            }else if(item.type === "delete"){
                if(deletedDocumentPages.indexOf(item.uuid) === -1){
                    deletedDocumentPages.push(item.uuid);
                }
            }
        });

        data.editedDocument = editedDocument;
        data.editedDocumentPages = editedDocumentPages;
        data.deletedDocumentPages = deletedDocumentPages;
       	info.collaborate_edited_data[info.command_history_index] = data
        method.save_local_command_history();
	},
    //获取指令队列长度
    get_command_queue_length : function(){
        return info.command_queue.length;
    },
    //下载指令队列
    download_command_queue : function(){
        try{
            let filename = '指令队列数据.json';
            let command_queue = new Blob([JSON.stringify(info.command_queue)]);
            if (window.navigator.msSaveBlob) {
                window.navigator.msSaveBlob(command_queue, filename);
            }else{
                let urlObject = window.URL || window.webkitURL || window;
                let url = urlObject.createObjectURL(command_queue);
                let el = document.createElement('a');
                el.href = url;
                el.download = filename;
                el.click();
                urlObject.revokeObjectURL(url);
            }
        }catch(e){
            console.error(e);
        }
    },
    //获取手动保存数据
    get_mt_save_data : function(that){
        if(info.auto_save_flage){
            return;
        }
        let newCommands = [];
        let commands = document_command.method.get(info.mt_save.lastVersionData, method.get_document_data(that), utils.deepClone(that.cursor_position));
        if(typeof(commands) !== 'undefined'){
            $.each(commands,function(i,command){
                newCommands.push(method.command_pretreatment(command.redo));
            });
        }
        return newCommands;
    },
    //手动保存成功
    mt_save_success : function(that){
        if(info.auto_save_flage){
            return;
        }
        info.mt_save.lastVersionData = method.get_document_data(that);
        info.command_queue=[];
    },
    //获取保存url
    get_save_url : function(){
        let url = `/api/member/document/save/`;
        try{
            if(info.random_save_url){
                let suffix = Math.floor(Math.random() * (1 - 100) + 100);//1～100随机数
                if(suffix > 1){
                    url = `/api/member/document/${suffix}/save/`;
                }
            }
        }catch(e){}
        return url;
    },
    //设置随机保存url
    set_random_save_url : function(enable){
        info.random_save_url = enable;
    }
};

export default {
    'info' : info,
    'method' : method,
    'backup' : document_backup
};