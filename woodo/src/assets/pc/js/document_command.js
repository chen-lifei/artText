//属性声明
let info = {
};

//方法声明
let method = {
	//获取指令
	get:function(oldDocumentData, newDocumentData, cursor_position){
        let modal_id = newDocumentData.modal_id;
		let old_document_info = oldDocumentData.document_info;
		let new_document_info = newDocumentData.document_info;
		let old_document_page_list = oldDocumentData.document_page_list;
		let new_document_page_list = newDocumentData.document_page_list;
        let old_page_info_uuid = oldDocumentData.page_info_uuid;
        let new_page_info_uuid = newDocumentData.page_info_uuid;
        let commands = [];
        let command;
        let document_different;
        let documentPage_different;
        let isnew = method.document_isnew(old_document_info,new_document_info);
        if(isnew){
            document_different = method.get_new_document_different(old_document_info,new_document_info,modal_id);
            documentPage_different = method.get_new_documentPage_different(old_document_page_list,new_document_page_list,modal_id);
            command = {
                undo : {
                    uuid:0,
                    source:0,
                    templateDocId:modal_id,
                    document:document_different.undo,
                    documentPages:documentPage_different.undo,
                    page_info_uuid:old_page_info_uuid,
                    cursor_position:cursor_position ? cursor_position.prev_range : null
                },
                redo : {
                    uuid:0,
                    source:0,
                    templateDocId:modal_id,
                    document:document_different.redo,
                    documentPages:documentPage_different.redo,
                    page_info_uuid:new_page_info_uuid,
                    cursor_position:cursor_position ? cursor_position.next_range : null
                }
            }
            commands.push(command);
        }
        document_different = method.get_document_different(old_document_info,new_document_info);
        documentPage_different = method.get_documentPage_different(old_document_page_list,new_document_page_list);
        command = {
            undo : {
                uuid:0,
                source:0,
                templateDocId:null,
                document:document_different.undo,
                documentPages:documentPage_different.undo,
                page_info_uuid:old_page_info_uuid,
                cursor_position:cursor_position ? cursor_position.prev_range : null
            },
            redo : {
                uuid:0,
                source:0,
                templateDocId:null,
                document:document_different.redo,
                documentPages:documentPage_different.redo,
                page_info_uuid:new_page_info_uuid,
                cursor_position:cursor_position ? cursor_position.next_range : null
            }
        }
        commands.push(command);
        //非空判断
        let isnull = true;
        $.each(commands,function(i,command){
            if(!method.command_isnull(command.redo)){
                isnull = false;
                return false;
            }
        });
        if(!isnull){
            return commands;
        }
	},
    //是否为空指令
    command_isnull:function(command){
        let isnull = true;
        if(typeof(command) === 'undefined' || typeof(command.document) === 'undefined' || typeof(command.documentPages) === 'undefined'){
            return isnull;
        }
        //文档
        $.map(command.document,function(value,key){
            if(key === 'id' || key === 'uuid'){
                return true;
            }
            isnull = false;
            return false;
        });
        if(!isnull){
            return isnull;
        }
        //文档页
        $.each(command.documentPages, function(i,item){
            $.map(item,function(value,key){
                if(key === 'type' && value === 'edit'){
                    return true;
                }
                if(key === 'id' || key === 'uuid'){
                    return true;
                }
                if(key === 'elementList'){
                    if((typeof(value.add) !== 'undefined' && value.add.length === 0) && value.edit.length === 0 && value.delete.length === 0 && value.order.length === 0){
                        return true;
                    }
                }
                isnull = false;
                return false;
            });
        });
        return isnull;
    },
    //是否为新文档
    document_isnew : function(old_document_info,new_document_info){
        return old_document_info.uuid === null && new_document_info.uuid !== null;
    },
    //获取新文档差异
    get_new_document_different:function(old_document_info,new_document_info,modal_id){
        let undo = {};
        let redo = {};
        undo.id = null;
        redo.id = null;
        undo.uuid = null;
        redo.uuid = new_document_info.uuid;
        redo.fId = old_document_info.fId;
        redo.teamfId = old_document_info.teamfId;
        redo.documentType = old_document_info.documentType;
        if(modal_id === null){//空白模版创建文档动态默认值
            redo.title = new_document_info.title;
            redo.background = old_document_info.background;
            redo.shapeColor = old_document_info.shapeColor;
            redo.textColor = old_document_info.textColor;
            redo.font = old_document_info.font;
            redo.width = old_document_info.width;
            redo.height = old_document_info.height;
        }
        redo.switchType = old_document_info.switchType;
        redo.attr = old_document_info.attr;
        return {
            undo:undo,
            redo:redo
        };
    },
    //获取新文档页差异
    get_new_documentPage_different:function(old_document_page_list, new_document_page_list,modal_id){
        let undos = [];
        let redos = [];
        $.each(old_document_page_list,function(i,item){
            let undo = {};
            let redo = {};
            undo.type = 'edit'; 
            redo.type = 'edit';
            undo.id = null;
            redo.id = null;
            undo.uuid = item.uuid;
            redo.uuid = item.uuid;
            if(modal_id === null){//空白模版创建文档动态默认值
                redo.title = item.title;
                redo.background = item.background;
                redo.switchType = item.switchType;
                redo.isLock = item.isLock;
                redo.pageNumber = item.pageNumber;
                redo.attr = item.attr;
                let elementList = item.elementList === null || item.elementList === '' ? [] : item.elementList;
                undo.elementList = {
                    edit : [],
                    delete : [],
                    order : []
                };
                redo.elementList = {
                    edit : elementList,
                    delete : [],
                    order : []
                };
            }
            undos.push(undo);
            redos.push(redo);
        });
        return {
            undo:undos,
            redo:redos
        };
    },
	//获取文档差异
	get_document_different:function(old_document_info,new_document_info){
		let undo = {};
		let redo = {};
        //编辑
        undo.id = new_document_info.id;
        redo.id = new_document_info.id;
        undo.uuid = new_document_info.uuid;
        redo.uuid = new_document_info.uuid;
        if(old_document_info.sign !== new_document_info.sign){
            undo.sign = old_document_info.sign;
            redo.sign = new_document_info.sign;
        }
        if(old_document_info.uuid === null || (old_document_info.title !== null && old_document_info.title !== new_document_info.title)){
            if(old_document_info.title !== null){
                undo.title = old_document_info.title;
            }
            if(new_document_info.title !== null){
                redo.title = new_document_info.title;
            }
        }
        if(JSON.stringify(old_document_info.background) !== JSON.stringify(new_document_info.background)){
            undo.background = old_document_info.background;
            redo.background = new_document_info.background;
        }
        if(old_document_info.shapeColor !== new_document_info.shapeColor){
            undo.shapeColor = old_document_info.shapeColor;
            redo.shapeColor = new_document_info.shapeColor;
        }
        if(old_document_info.textColor !== new_document_info.textColor){
            undo.textColor = old_document_info.textColor;
            redo.textColor = new_document_info.textColor;
        }
        if(old_document_info.font !== new_document_info.font){
            undo.font = old_document_info.font;
            redo.font = new_document_info.font;
        }
        if(old_document_info.width !== new_document_info.width){
            undo.width = old_document_info.width;
            redo.width = new_document_info.width;
        }
        if(old_document_info.height !== new_document_info.height){
            undo.height = old_document_info.height;
            redo.height = new_document_info.height;
        }
        if(old_document_info.switchType !== new_document_info.switchType){
            undo.switchType = old_document_info.switchType;
            redo.switchType = new_document_info.switchType;
        }
        if(JSON.stringify(old_document_info.attr) !== JSON.stringify(new_document_info.attr)){
            undo.attr = old_document_info.attr;
            redo.attr = new_document_info.attr;
        }
		return {
			undo:undo,
			redo:redo
		};
	},
	//获取文档页差异
	get_documentPage_different:function(old_document_page_list, new_document_page_list){
        let undos = [];
        let redos = [];
        let old_document_page_list_uuids = [];
		let old_document_page_list_uuid_mapping_index = {};
		let old_document_page_list_signs = [];
		let old_document_page_list_sign_mapping_index = {};
		let new_document_page_list_uuids = [];
		let new_document_page_list_uuid_mapping_index = {};
		let	new_document_page_list_signs = [];
        let new_document_page_list_sign_mapping_index = {};
        $.each(old_document_page_list,function(i,item){
            if(item.uuid !== null){
            	old_document_page_list_uuids.push(item.uuid);
                old_document_page_list_uuid_mapping_index[item.uuid] = i;
            }
            if(item.sign !== null){
            	old_document_page_list_signs.push(item.sign);
                old_document_page_list_sign_mapping_index[item.sign] = i;
            }
        });
        $.each(new_document_page_list,function(i,item){
            if(item.uuid !== null){
            	new_document_page_list_uuids.push(item.uuid);
                new_document_page_list_uuid_mapping_index[item.uuid] = i;
            }
            if(item.sign !== null){
            	new_document_page_list_signs.push(item.sign);
                new_document_page_list_sign_mapping_index[item.sign] = i;
            }
        });
        //新增(uuid)
        let add_documentPages = $.grep(old_document_page_list_uuids.concat(new_document_page_list_uuids),v=>old_document_page_list_uuids.indexOf(v) !== -1 ^ new_document_page_list_uuids.indexOf(v) !== -1 && new_document_page_list_uuids.indexOf(v) !== -1);
        //编辑(sign)
        let edit_documentPages = $.grep(old_document_page_list_signs.concat(new_document_page_list_signs),v => old_document_page_list_signs.indexOf(v) !== -1 ^ new_document_page_list_signs.indexOf(v) !== -1 && new_document_page_list_signs.indexOf(v) !== -1);
        //删除(uuid)
        let delete_documentPages = $.grep(old_document_page_list_uuids.concat(new_document_page_list_uuids),v => old_document_page_list_uuids.indexOf(v) !== -1 ^ new_document_page_list_uuids.indexOf(v) !== -1 && old_document_page_list_uuids.indexOf(v) !== -1);

        $.each(add_documentPages,function(i,item){
            let new_index;
            let new_document_page;
            new_index = new_document_page_list_uuid_mapping_index[item];
            if(typeof(new_index) !== 'undefined'){
                new_document_page = new_document_page_list[new_index];
            }
            if(typeof(new_document_page) === 'undefined'){
                return true;
            }
            let undo = {};
            let redo = {};
            undo.type = 'delete'; 
            redo.type = 'edit';
            undo.id = null;
            redo.id = null;
            undo.uuid = new_document_page.uuid;
            redo.uuid = new_document_page.uuid;
            undo.title = new_document_page.title;
            redo.title = new_document_page.title;
            undo.background = new_document_page.background;
            redo.background = new_document_page.background;
            undo.switchType = new_document_page.switchType;
            redo.switchType = new_document_page.switchType;
            undo.isLock = new_document_page.isLock;
            redo.isLock = new_document_page.isLock;
            undo.pageNumber = new_document_page.pageNumber;
            redo.pageNumber = new_document_page.pageNumber;
            undo.attr = new_document_page.attr;
            redo.attr = new_document_page.attr;
            let element_different = method.get_element_different([],new_document_page.elementList);
            undo.elementList = element_different.undo;
            redo.elementList = element_different.redo;
            undos.push(undo);
            redos.push(redo);
        });

        $.each(edit_documentPages,function(i,item){
            let index = new_document_page_list_sign_mapping_index[item];
            if(typeof(index) === "undefined"){
                return true;
            }
            let new_document_page = new_document_page_list[index];
            index = old_document_page_list_uuid_mapping_index[new_document_page.uuid];
            if(typeof(index) == "undefined"){
                return true;
            }
            let old_document_page = old_document_page_list[index];
            if(typeof(new_document_page) == "undefined" || typeof(old_document_page) === "undefined"){
                return true;
            }
            let undo = {};
            let redo = {};
            undo.type = 'edit';
            redo.type = 'edit';
            undo.id = new_document_page.id;
            redo.id = new_document_page.id;
            undo.uuid = new_document_page.uuid;
            redo.uuid = new_document_page.uuid;
            if(old_document_page.title !== new_document_page.title){
                undo.title = old_document_page.title;
                redo.title = new_document_page.title;
            }
            if(JSON.stringify(old_document_page.background) !== JSON.stringify(new_document_page.background)){
                undo.background = old_document_page.background;
                redo.background = new_document_page.background;
            }
            if(old_document_page.switchType !== new_document_page.switchType){
                undo.switchType = old_document_page.switchType;
                redo.switchType = new_document_page.switchType;
            }
            if(old_document_page.isLock !== new_document_page.isLock){
                undo.isLock = old_document_page.isLock;
                redo.isLock = new_document_page.isLock;
            }
            if(old_document_page.pageNumber !== new_document_page.pageNumber){
                undo.pageNumber = old_document_page.pageNumber;
                redo.pageNumber = new_document_page.pageNumber;
            }
            if(JSON.stringify(old_document_page.attr) !== JSON.stringify(new_document_page.attr)){
                undo.attr = old_document_page.attr;
                redo.attr = new_document_page.attr;
            }
            //元素
            let element_different = method.get_element_different(old_document_page.elementList,new_document_page.elementList);
            undo.elementList = element_different.undo;
            redo.elementList = element_different.redo;
            undos.push(undo);
            redos.push(redo);
        });

        $.each(delete_documentPages,function(i,item){
            let index = old_document_page_list_uuid_mapping_index[item];
            if(typeof(index) === "undefined"){
                return true;
            }
            let old_document_page = old_document_page_list[index];
            if(typeof(old_document_page) === "undefined"){
                return true;
            }
            let undo = {};
            let redo = {};
            undo.type = 'edit';
            redo.type = 'delete';
            undo.id = null;
            redo.id = null;
            undo.uuid = old_document_page.uuid;
            redo.uuid = old_document_page.uuid;
            undo.title = old_document_page.title;
            redo.title = old_document_page.title;
            undo.background = old_document_page.background;
            redo.background = old_document_page.background;
            undo.switchType = old_document_page.switchType;
            redo.switchType = old_document_page.switchType;
            undo.isLock = old_document_page.isLock;
            redo.isLock = old_document_page.isLock;
            undo.pageNumber = old_document_page.pageNumber;
            redo.pageNumber = old_document_page.pageNumber;
            undo.attr = old_document_page.attr;
            redo.attr = old_document_page.attr;
            let element_different = method.get_element_different(old_document_page.elementList,[]);
            undo.elementList = element_different.undo;
            redo.elementList = element_different.redo;
            undos.push(undo);
            redos.push(redo);
        });

        return {
        	undo:undos,
        	redo:redos
        };
	},
	//获取元素差异
	get_element_different:function(old_elementList,new_elementList){
        let undo_edit = [];
        let redo_edit = [];
        let undo_delete = [];
        let redo_delete = [];
        let undo_order = [];
        let redo_order = [];

        let old_elementList_ids = [];
        let old_elementList_id_mapping_element = {};
        let new_elementList_ids = [];
        let new_elementList_id_mapping_element = {};
        $.each(old_elementList, function(i,item){
            old_elementList_ids.push(item.id);
            old_elementList_id_mapping_element[item.id] = item;
        });
        $.each(new_elementList, function(i,item){
            new_elementList_ids.push(item.id);
            new_elementList_id_mapping_element[item.id] = item;
        });
        //新增
        let add_elementList = $.grep(old_elementList_ids.concat(new_elementList_ids),v => old_elementList_ids.indexOf(v) !== -1 ^ new_elementList_ids.indexOf(v) !== -1 && new_elementList_ids.indexOf(v) !== -1);
        //编辑
        let edit_elementList = $.grep(old_elementList_ids,v => new_elementList_ids.indexOf(v) !== -1);
        //删除
        let delete_elementList = $.grep(old_elementList_ids.concat(new_elementList_ids),v => old_elementList_ids.indexOf(v) !== -1 ^ new_elementList_ids.indexOf(v) !== -1 && old_elementList_ids.indexOf(v) !== -1);
        
        $.each(add_elementList,function(i,item){
            let element = new_elementList_id_mapping_element[item];
            if(element){
                undo_delete.push(element.id);
                redo_edit.push(element);
            }
        });

        $.each(edit_elementList,function(i,item){
            if(JSON.stringify(old_elementList_id_mapping_element[item]) == JSON.stringify(new_elementList_id_mapping_element[item])){
                return true;
            }
            let old_element = old_elementList_id_mapping_element[item];
            let new_element = new_elementList_id_mapping_element[item];
            if(old_element){
                undo_edit.push(old_element);
            }
            if(new_element){
                redo_edit.push(new_element);
            }
        });
        
        $.each(delete_elementList,function(i,item){
            let element = old_elementList_id_mapping_element[item];
            if(element){
                undo_edit.push(element);
                redo_delete.push(element.id);
            }
        });

        //排序
        if(JSON.stringify(old_elementList_ids) !== JSON.stringify(new_elementList_ids)){
            undo_order = old_elementList_ids;
            redo_order = new_elementList_ids;
        }
        //是否真的排序
        let is_order = false;
        old_elementList_ids = $.grep(old_elementList_ids,v=>redo_delete.indexOf(v) === -1);
        new_elementList_ids = $.grep(new_elementList_ids,v=>undo_delete.indexOf(v) === -1);
        if(JSON.stringify(old_elementList_ids) !== JSON.stringify(new_elementList_ids)){
            is_order = true;
        }
        return {
            undo:{
                edit : undo_edit,
                delete : undo_delete,
                order : undo_order,
                is_order : is_order
            },
            redo:{
                edit : redo_edit,
                delete : redo_delete,
                order : redo_order,
                is_order : is_order
            },
        };
	},
    //设置文档差异
    set_document_different : function(document_info, different){
        if(typeof(document_info) === 'undefined' || typeof(different) === 'undefined'){
            return document_info;
        }
        if(typeof(different.title) !== 'undefined'){
            document_info.title = different.title;
        }
        if(typeof(different.background) !== 'undefined'){
            document_info.background = $.extend(true, document_info.background, different.background);
        }
        if(typeof(different.shapeColor) !== 'undefined'){
            document_info.shapeColor = different.shapeColor;
        }
        if(typeof(different.textColor) !== 'undefined'){
            document_info.textColor = different.textColor;
        }
        if(typeof(different.font) !== 'undefined'){
            document_info.font = different.font;
        }
        if(typeof(different.width) !== 'undefined'){
            document_info.width = different.width;
        }
        if(typeof(different.height) !== 'undefined'){
            document_info.height = different.height;
        }
        if(typeof(different.switchType) !== 'undefined'){
            document_info.switchType = different.switchType;
        }
        if(typeof(different.attr) !== 'undefined'){
            document_info.attr = different.attr;
        }
        return document_info;
    },
    //设置文档页差异
    set_documentPage_different : function(document_page_list, different){
        if(typeof(document_page_list) === 'undefined' || typeof(different) === 'undefined'){
            return document_page_list;
        }
        //uuid映射文档页
        let uuid_mapping_documentPage = {};
        function get_uuid_mapping_documentPage(){
            $.each(document_page_list,function(i, item){
                uuid_mapping_documentPage[item.uuid] = {
                    index : i,
                    item : item
                };
            });
        }
        get_uuid_mapping_documentPage();
        $.each(different,function(i,item){
            if(item.type === 'edit'){
                let documentPage;
                if(typeof(uuid_mapping_documentPage[item.uuid]) !== 'undefined'){
                    documentPage = uuid_mapping_documentPage[item.uuid].item;
                }
                if(typeof(documentPage) === 'undefined'){
                    //新增
                    let new_page_info = {
                        id : null,
                        uuid : item.uuid,
                        sign : utils.uuid(),
                        title : null,
                        background : {
                            type: 'color',
                            color: '#ffffff',
                            image: null
                        },
                        elementList : [],
                        pageNumber : document_page_list.length,
                        attr : null
                    }
                    if(typeof(item.title) !== 'undefined'){
                        new_page_info.title = item.title;
                    }
                    if(typeof(item.background) !== 'undefined'){
                        new_page_info.background = $.extend(true, new_page_info.background, item.background);
                    }
                    if(typeof(item.switchType) !== 'undefined'){
                        new_page_info.switchType = item.switchType;
                    }
                    if(typeof(item.isLock) !== 'undefined'){
                        new_page_info.isLock = item.isLock;
                    }
                    if(typeof(item.pageNumber) !== 'undefined'){
                        new_page_info.pageNumber = item.pageNumber;
                    }
                    if(typeof(item.attr) !== 'undefined'){
                        new_page_info.attr = item.attr;
                    }
                    new_page_info.elementList = method.set_element_different(new_page_info.elementList,item.elementList);
                    document_page_list.splice(new_page_info.pageNumber -1, 0, new_page_info);
                    get_uuid_mapping_documentPage();
                }else{
                    //编辑
                    if(typeof(item.title) !== 'undefined'){
                        documentPage.title = item.title;
                    }
                    if(typeof(item.background) !== 'undefined'){
                        documentPage.background = $.extend(true, documentPage.background, item.background);
                    }
                    if(typeof(item.switchType) !== 'undefined'){
                        documentPage.switchType = item.switchType;
                    }
                    if(typeof(item.isLock) !== 'undefined'){
                        documentPage.isLock = item.isLock;
                    }
                    if(typeof(item.pageNumber) !== 'undefined'){
                        documentPage.pageNumber = item.pageNumber;
                    }
                    if(typeof(item.attr) !== 'undefined'){
                        documentPage.attr = item.attr;
                    }
                    documentPage.elementList = method.set_element_different(documentPage.elementList,item.elementList);
                }
            }else if(item.type === 'delete'){
                //删除
                let document_page_index;
                if(typeof(uuid_mapping_documentPage[item.uuid]) !== 'undefined'){
                    document_page_index = uuid_mapping_documentPage[item.uuid].index;
                }
                if(typeof(document_page_index) === 'undefined'){
                    return true;
                }
                document_page_list.splice(document_page_index,1);
                get_uuid_mapping_documentPage();
            }
        });
        document_page_list.sort(function(a,b){
            if(typeof(a.pageNumber) === 'undefined' || typeof(b.pageNumber) === 'undefined' ||
                a.pageNumber === null || b.pageNumber === null ||
                a.pageNumber === b.pageNumber){
                return 0;
            }
            return a.pageNumber > b.pageNumber ? 1 : -1;
        });
        return document_page_list;
    },
    //设置元素差异
    set_element_different : function(elementList, different){
        if(typeof(elementList) === 'undefined' || typeof(different) === 'undefined'){
            return elementList;
        }
        if(elementList === null){
            elementList = [];
        }
        //元素-添加(废弃兼容)
        if(typeof(different.add) !== 'undefined'){
            $.each(different.add,function(i,item){
                elementList.push(item);
            });
        }
        //元素-编辑
        if(typeof(different.edit) !== 'undefined'){
            let elementIds = [];
            $.each(elementList,function(i,item){
                elementIds.push(item.id);
            });
            $.each(different.edit,function(i,item){
                let index = $.inArray(item.id, elementIds);
                if(index === -1){
                    elementIds.push(item.id);
                    elementList.push(item);
                    return true;
                }
                elementList.splice(index,1,item);
            });
        }
        //元素-删除
        if(typeof(different.delete) !== 'undefined'){
            let elementIds = [];
            $.each(elementList,function(i,item){
                elementIds.push(item.id);
            });
            $.each(different.delete,function(i,item){
                let index = $.inArray(item, elementIds);
                if(index === -1){
                    return true;
                }
                elementIds.splice(index,1);
                elementList.splice(index,1);
            });
        }
        //元素-排序
        if(typeof(different.order) !== 'undefined' && different.order.length > 0){
            elementList.sort(function(e1,e2){
                if(typeof(e1.id) === 'undefined' || e1.id === '' || typeof(e2.id) === 'undefined' || e2.id === ''){
                    return 0;
                }
                let e1_index = different.order.indexOf(e1.id);
                let e2_index = different.order.indexOf(e2.id);
                if(e1_index <0 || e2_index < 0 || e1_index === e2_index){
                    return 0;
                }
                return e1_index > e2_index ? 1 : -1;
            });
        }
        return elementList;
    }
};
export default {
    'info' : info,
    'method' : method
};