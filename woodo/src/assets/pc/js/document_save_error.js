import document_command from '@/assets/pc/js/document_command.js';
import aliyun_log from '@/assets/common/js/aliyun_log.js';
import document_save from '@/assets/pc/js/document_save.js';

//属性声明
let info = {
	//保存失败数据
	save_error : null,
	//保存失败弹框实例
	save_error_modal : null,
    //联系我弹框
    contact_modal : null,
    //保存失败反馈标示
    save_error_feedback_flage : false
}

//方法声明
let method = {
	//初始化(is_preview 是否预览页)
    init : function(that, is_preview){
        try{
        	if(that.document_info.uuid === null){
	            return;
	        }
            if(window && window.localStorage){
                info.save_error = JSON.parse(localStorage.getItem('save_error'));
                if(typeof(info.save_error) === 'undefined' || info.save_error === null){
                    return;
                }
                if(typeof(is_preview) === 'undefined'){
                	method.clear_expire_data(that)
                }
            }
            if(typeof(is_preview) === 'undefined'){
                method.show_recovery_modal(that);
            }
        }catch(e){
            console.error(e);
        }
    },
    //清除过期数据
   	clear_expire_data : function(that){
   		try{
	   		if(typeof(info.save_error) === 'undefined' || info.save_error === null){
	            return;
	        }
	   		$.map(info.save_error,function(value,key){
	   			//当前文档先不进行清除
	            if(key === that.document_info.uuid){
	                return true;
	            }
	            if(typeof(value.expire) === 'undefined' || value.expire < new Date().getTime()){
	                delete info.save_error[key];
	            }
	        });
	        localStorage.setItem('save_error', JSON.stringify(info.save_error));
    	}catch(e){
    		console.error(e);
    	}
    },
    //设置保存失败数据
    set_save_error_data:function(that,command_queue){
        try{
            if(!window || !window.localStorage){
                return;
            }
            if(that.document_info.id === null || that.document_info.uuid === null){
                return;
            }
            if(typeof(info.save_error) === 'undefined' || info.save_error === null){
                info.save_error = {};
            }
            info.save_error[that.document_info.uuid] = {
               data:JSON.stringify(command_queue),
               expire:new Date().getTime() + (2* 24 * 60 * 60 * 1000)//二天有效期
            }
            localStorage.setItem('save_error', JSON.stringify(info.save_error));
        }catch(e){
            console.error(e);
        }
    },
    //清除保存失败数据
    clear_save_error_data:function(that){
        try{
            if(!window || !window.localStorage){
                return;
            }
            if(that.document_info.uuid === null){
                return;
            }
            if(typeof(info.save_error) === 'undefined' || info.save_error === null){
                info.save_error = {};
            }
            if(info.save_error[that.document_info.uuid]){
                delete info.save_error[that.document_info.uuid];
                localStorage.setItem('save_error', JSON.stringify(info.save_error));
            }
        }catch(e){
            console.error(e);
        }
    },
    //展示恢复弹框
    show_recovery_modal : function(that){
        try{
        	if(that.document_info.id === null || that.document_info.uuid === null){
	            return;
	        }
            if(typeof(info.save_error) === 'undefined' || info.save_error === null){
                return;
            }
            let value = info.save_error[that.document_info.uuid];
            if(typeof(value) === 'undefined'){
                return;
            }
            that.$modal({
                modalClass: 'save_error_recovery',
                modalTitle: '还原提示',
                modalContent: `你上次对该文档的修改还没有保存，是否要恢复这些未保存的内容？<a target='_blank' href='/document_recovery_preview/${that.document_info.id}/?mode=local'>预览</a>`,
                buttonSubmitTxt:'恢复',
                buttonCancelTxt:'放弃',
                showClose: false,
                submitCallback(modal){
                	method.recovery(that);
                	modal.close();
                },
                cancelCallback(modal){
					method.give_up_recovery(that)
					modal.close();
                }
            });
        }catch(e){
            console.error(e);
        }
    },
    //恢复
    recovery : function(that, callback){
        try{
        	if(that.document_info.uuid === null){
	            return;
	        }
            if(typeof(info.save_error) === 'undefined' || info.save_error === null){
                return;
            }
            let value = info.save_error[that.document_info.uuid];
            if(typeof(value) === 'undefined' || typeof(value.data) === 'undefined'){
                return;
            }
            //恢复数据
            let page_info;
            $.each(JSON.parse(value.data),function(i,item){
                document_command.method.set_document_different(that.document_info,item.document);
                document_command.method.set_documentPage_different(that.document_page_list,item.documentPages);
            });
            $.each(that.document_page_list,function(i,item){
                if(item.uuid === that.page_info.uuid){
                    page_info = item;
                    return false;
                }
            });
            if(typeof(page_info) === 'undefined'){
                page_info = that.document_page_list[0];
            }
            that.page_info = page_info;
            if(typeof(that.recovery_document) !== 'undefined'){
            	that.recovery_document();
            	delete info.save_error[that.document_info.uuid];
            	if(window && window.localStorage){
					localStorage.setItem('save_error', JSON.stringify(info.save_error));
            	}
            }
            if(callback && typeof callback === 'function'){
                callback();
            }
        }catch(e){
            console.error(e);
            alert('恢复失败');
        }
    },
    //放弃恢复
    give_up_recovery : function(that){
        try{
        	if(that.document_info.uuid === null){
	            return;
	        }
            if(typeof(info.save_error) === 'undefined' || info.save_error === null){
                return;
            }
            delete info.save_error[that.document_info.uuid];
            if(window && window.localStorage){
                localStorage.setItem('save_error', JSON.stringify(info.save_error));
            }
        }catch(e){
            console.error(e);
        }
    },
    //展示保存失败弹框
    show_save_error_modal : function(that){
        try{
        	if(info.save_error_modal !== null || info.contact_modal !== null){
	            return;
	        }
            that.$modal({
                modalClass: 'save_error',
                modalTitle: '',
                modalContent: `
                    <div class="save_error_tips">
                        <button class="error_tip_contact" id="error_tip_contact">马上和我们联系</button>
                    </div>
                `,
                showCancel: false,
                showSubmit: false,
                showClose: true,
                openCallback:function(modal){
                    info.save_error_modal = modal;
                    info.save_error_modal.$el.querySelector('#error_tip_contact').onclick = () => {
                        info.save_error_modal.close();
                        info.save_error_modal = null;
                        method.show_contact_modal(that);
                    }
                },
                closeCallback: ()=>{
                    info.save_error_modal = null;
                }
            });
        }catch(e){
            console.error(e);
        }   
    },
    //隐藏保存失败弹窗（与显示保存失败弹窗配合使用）
    hide_save_error_modal : function(that){
        try{
            if(info.save_error_modal === null){
            	return;    
            }
            info.save_error_modal.close();
            info.save_error_modal = null;
            if(typeof(info.save_error) === 'undefined' || info.save_error === null){
            	return;
            }
            delete info.save_error[that.document_info.uuid];
            if(window && window.localStorage){
            	localStorage.setItem('save_error', JSON.stringify(info.save_error));
        	}
        }catch(e){
            console.error(e);
        }
    },
    download_document_data : function(that){
        try{
            let filename = '文档数据.json';
            let document_data = {
                document : that.document_info,
                documentPages : that.document_page_list
            };
            document_data = new Blob([JSON.stringify(document_data)]);
            if (window.navigator.msSaveBlob) {
                window.navigator.msSaveBlob(document_data, filename);
            }else{
                let urlObject = window.URL || window.webkitURL || window;
                let url = urlObject.createObjectURL(document_data);
                let el = document.createElement('a');
                el.href = url;
                el.download = filename;
                el.click();
                urlObject.revokeObjectURL(url);
            }
        }catch(e){
            console.error(e);
            alert('保存失败，请微信扫码加群反馈')
        }
    },
    // 联系我们 弹框
    show_contact_modal : function (that) {
        try {
            if(!that.save_error_feedback_flage){
                that.save_error_feedback_flage = true;
                let description = `用户：${that.$common.get_login_state().id}<br>文档：${that.document_info.id}<br>ua：${window.navigator.userAgent}`;
                that.$axios.post("/api/member/work_order/create/", {
                    type:'BCSB',
                    title: '文档保存失败',
                    description: description
                }).then(function(data) {
                    if (data.data.code === "2") {
                        let log = {
                            work_order_id:                  JSON.stringify(data.data.data),
                            member:                         JSON.stringify(that.$common.get_login_state().id),
                            current_document_page:          JSON.stringify({ document_info: that.document_info, page_info: that.page_info }),
                            current_document_opt_history:   JSON.stringify(utils.deepClone(document_save.info.command_redo_history).reverse().slice(0, 10)),
                            console_error_msg:              JSON.stringify(that.$error.get())
                        };
                        aliyun_log.push(log); 
                    }
                })
            }
        } catch (error) {
            console.error(error);
        }
        that.$modal({
            modalClass: 'wechat_service_group_modal',
            modalTitle: '',
            modalContent: `
                <div class="contact_group">
                    <div class="code">
                        <img src="https://file.woodo.cn/upload/foreverImage/kefu_qrcode.png?v=${new Date().getTime()}" />
                        <i></i>
                    </div>
                    <p>微信扫码加群反馈</p>
                    <div class="suggestion">建议您同时将文件<i id="download_document_data">保存</i>到本地</div>
                </div>
            `,
            showCancel: false,
            showSubmit: false,
            showClose: true,
            openCallback:function(modal){
                info.contact_modal = modal;
                modal.$el.querySelector('#download_document_data').onclick = () => {
                    method.download_document_data(that);
                };
            },
            closeCallback: ()=>{
                info.contact_modal = null;
            }
        });
    },
}

export default {
    'info' : info,
    'method' : method
};