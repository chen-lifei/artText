const config = require('../conf/config');

let login_filter = function(req,res) {
  try{
  	  if(req==undefined){
		return new Promise(function(resolve,reject){reject("req is null")})
	  }
	  let login_url_arrays=config.login_url;
	  let req_url=req.url;
	  let is_need_login=false;
	  for (var i=0;i<login_url_arrays.length;i++){
	  	let url_reg = login_url_arrays[i];
	  	let reg = new RegExp(url_reg);
	  	if(reg.test(req_url)){
	  		is_need_login=true;
	  		break;
	  	}
	  }
	  //获取sessionid
	  let sid=req.cookies.SESSION;
	  if(is_need_login){
		if(req.cookies==undefined||req.cookies==null){
			return new Promise(function(resolve,reject){reject("cookies is null")})
		}
		if(sid==undefined||sid==null){
			return new Promise(function(resolve,reject){reject("session is null")})
		}
		let memberId = req.cookies.woodo_memberId;
		let memberSign = req.cookies.woodo_memberSign;
		if(!memberId || !memberSign){
			res.clearCookie("SESSION");
			return new Promise(function(resolve,reject){reject("is not login")});
		}else{
			return new Promise(function(resolve,reject){resolve("is login")});
		}
	  }
  }catch(err){
  	new Promise(function(resolve,reject){reject("excetion:"+err)})
  }
  return new Promise(function(resolve,reject){resolve("is not login")})
};
module.exports=login_filter