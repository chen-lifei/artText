import io from "socket.io-client";
const crypto = require('crypto');

let ws_client;
let ws_client_connectErrorMaxCount = 10;

//校验
function isNull(value){
	if(value === null){
		return true;
	}
	return false;
}
function isEmpty(value){
	if(typeof(value) === 'undefined' || value === ''){
		return true;
	}
	return false;
}
function isEmptyArray(value){
	if(typeof(value) === 'undefined' || value.length === 0){
		return true;
	}
	return false;
}
function isFunction(callback){
	if(typeof callback === 'function'){
		return true;
	}
	return false;
}

//生成websocket token
function generatedWsToken(callback){
	if(!isFunction(callback)){
		return;
	}
	let t = new Date().getTime();
	$.ajax({
        type: "GET",
        url: "/member/generatedWsToken/",
        cache:false,
        success: function (data) {
        	callback(data);
        }
    });
}

//获取签名
function getSign(docId){
	if(!docId){
		return;
	}
	return crypto.createHash('md5').update(docId + "HNkXDfiuJ6wdvC6V").digest("hex")
}

//客户端方法封装
let main = {
		//加入文档房间
		doc_join : function(docId, memberId, head, nickName){
			if(isEmpty(docId) && isEmpty(memberId)){
				return;
			}
			ws_client.emit('doc_join', docId, memberId, head, nickName, getSign(docId));
		},
		//获取文档在线人数
		get_doc_online_members : function(docIds){
			if(isEmptyArray(docIds)){
				return;
			}
			ws_client.emit('get_doc_online_members', docIds);
		},
		set_doc_online_members : function(callback){
			ws_client.on('set_doc_online_members', (data) =>{
				if(!isFunction(callback)){
					return; 
				}
				callback(data);
			});
		},
		//文档保存
		doc_save_send : function(docId, command){
			if(isEmpty(docId) || isEmpty(command)){
				return;
			}
			ws_client.emit('doc_save_send', docId, command, getSign(docId));
		},
		doc_save_rcvd : function(callback){
			if(!isFunction(callback)){
				return;
			}
			ws_client.on('doc_save_rcvd', (command) => {
				callback(command);
			});
		},
		//文档删除
		doc_delete_send : function(docId, data){
			if(isEmpty(docId)){
				return;
			}
			ws_client.emit('doc_delete_send', docId, data, getSign(docId));
		},
		doc_delete_rcvd : function(callback){
			if(!isFunction(callback)){
				return;
			}
			ws_client.on('doc_delete_rcvd', (data) => {
				callback(data);
			});
		},
		//文档导入
		doc_import_send : function(docId, data){
			if(isEmpty(docId)){
				return;
			}
			ws_client.emit('doc_import_send', docId, data, getSign(docId));
		},
		doc_import_rcvd : function(callback){
			if(!isFunction(callback)){
				return;
			}
			ws_client.on('doc_import_rcvd', (data) => {
				callback(data);
			});
		},
		//文档版本历史恢复
		doc_history_rollback_send : function(docId, data){
			if(isEmpty(docId)){
				return;
			}
			ws_client.emit('doc_history_rollback_send', docId, data, getSign(docId));
		},
		doc_history_rollback_rcvd : function(callback){
			if(!isFunction(callback)){
				return;
			}
			ws_client.on('doc_history_rollback_rcvd', (data) => {
				callback(data);
			});
		},
		//文档撤回/重做
		doc_save_undo_redo_send : function(docId, command){
			if(isEmpty(docId) || isEmpty(command)){
				return;
			}
			ws_client.emit('doc_save_undo_redo_send', docId, command, getSign(docId));
		},
		doc_save_undo_redo_rcvd : function(callback){
			if(!isFunction(callback)){
				return;
			}
			ws_client.on('doc_save_undo_redo_rcvd', (command, undoRedoIndex) => {
				callback(command, undoRedoIndex);
			});
		},
		//文档元素选中
		doc_elements_checked_send : function(docId, data){
			if(isEmpty(docId) || isEmpty(data)){
				return;
			}
			ws_client.emit('doc_elements_checked_send', docId, data, getSign(docId));
		},
		doc_elements_checked_rcvd : function(callback){
			if(!isFunction(callback)){
				return;
			}
			ws_client.on('doc_elements_checked_rcvd', (data) => {
				let delIndex;
				$.each(data, function(i,item){
					if(item.socketId === ws_client.id){
						delIndex = i;
						return false;
					}
				});
				if(typeof(delIndex) !== "undefined"){
					data.splice(delIndex, 1);
				}
				callback(data);
			});
		},
		//文档评论
		doc_review_send: function(docId, data){
			if(isEmpty(docId) || isEmpty(data)){
				return;
			}
			ws_client.emit('doc_review_send', docId, data, getSign(docId));
		},
		doc_review_rcvd: function(callback){
			if(!isFunction(callback)){
				return;
			}
			ws_client.on('doc_review_rcvd', (data) => {
				callback(data);
			});
		},
		//文档权限
		doc_authority_send: function(docId, data){
			if(isEmpty(data)){
				return;
			}
			ws_client.emit('doc_authority_send', docId, data, getSign(docId));
		},
		doc_authority_rcvd: function(callback){
			if(!isFunction(callback)){
				return;
			}
			ws_client.on('doc_authority_rcvd', (data) => {
				callback(data);
			});
		}
};

export default function(opt){
	try{
		let options = {
	        success : null,
	        error : null
	    };
	    options = Object.assign(options, opt);

	    let ws_host;
	    let ws_token;
	    let ws_connect = function(){
			if(isEmpty(ws_host) || isNull(ws_host)){
				ws_host = "";
			}
			if(isEmpty(ws_token) || isNull(ws_token)){
				if (isFunction(options.error)) {
	                options.error("ws:errorParams");
	            }
				return;
			}
			//连接socket
			ws_client = io.connect(ws_host,{
				query:"token=" + ws_token,
				path:"/ws",
				reconnectionAttempts:10
			});
			//连接成功
			ws_client.on("connect",()=>{
				console.log("ws connect success~");
				if (isFunction(options.success)) {
	                options.success(main);
	            }
			});
			//连接失败
			ws_client.on("error",(msg)=>{
				console.error("ws connect error~(" + msg + ")");
				if(msg !== 'Not authorized'){
					if (isFunction(options.error)) {
		                options.error(msg);
		            }
					return;
				}
				//验证token失败，重新生成、连接
				ws_client.close();
				generatedWsToken(function(data){
					let _data = require('querystring').parse(data);
					ws_host = _data.host;
					ws_token = _data.token;
					if(isEmpty(ws_host) || isNull(ws_host)){
						ws_host = "";
					}
					if(isEmpty(ws_token) || isNull(ws_token)){
						return;
					}
					if(ws_client_connectErrorMaxCount < 0){
						if (isFunction(options.error)) {
			                options.error("ws:overConnectErrorMaxCount");
			            }
			            return;
					}
					let interval = setInterval(()=>{
						if(ws_client.connected){
							return;
						}
						if(sessionStorage){
					    	sessionStorage.setItem("ws_host", ws_host);
							sessionStorage.setItem("ws_token", ws_token);
					    }
						ws_client.io.opts.query = {
							token: ws_token
						}
						ws_client.connect();
						ws_client_connectErrorMaxCount--;
						clearInterval(interval);
					},1000);
				});
			});
		}

	    if(sessionStorage){
	    	ws_host = sessionStorage.getItem("ws_host");
	    	ws_token = sessionStorage.getItem("ws_token");
	    }
		if(isEmpty(ws_token) || isNull(ws_token)){
			generatedWsToken(function(data){
				let _data = require('querystring').parse(data);
				ws_host = _data.host;
				ws_token = _data.token;
				if(sessionStorage){
			    	sessionStorage.setItem("ws_host", ws_host);
					sessionStorage.setItem("ws_token", ws_token);
			    }
				ws_connect();
			});
			return;
		}
		ws_connect();
	}catch(e){
		console.error(e);
	}
}