import aliyun_log from './aliyun_log.js';

let error_msgs = [];

function push(errors){
	try{
		if(typeof(errors) === "undefined"){
			return;
		}
		let stacks = [];
		for(let i = 0; i<errors.length;i++){
			let error = errors[i];
			if(typeof error === 'undefined'){
				continue;
			}
			let stack;
			if(error.message && error.stack){
				stack = error.message + "," + error.stack;
			}else{
				stack = error;
			}
			stacks.push(stack);
		}
		let error_msg = {
			time : new Date().getTime(),
			stacks : stacks
		}
		error_msgs.unshift(error_msg);
		if(error_msgs.length > 100){
			error_msgs.slice(0,100);
		}
		aliyun_log.push({console_error_msg:JSON.stringify(error_msg)});
	}catch(e){
	}
}

export default {
	ready(){
		window.console = (function(origConsole){
			let c = {};
			for (let item in origConsole) {
				c[item] = origConsole[item];
			}
			c['error'] = function () {
				origConsole.error.apply(origConsole, arguments);
				push(arguments);
			};
			return c;
		}(window.console));

	    window.onerror = function (msg, url, line, colno, error) {
	    	push([error]);
	    }
  	},
  	get(){
  		return error_msgs;
  	}
}

