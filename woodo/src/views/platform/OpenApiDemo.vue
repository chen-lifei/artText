<template>
	<div class="contain">
		<div class="opt_area">
			<button @click="addPage('up')">向上添加页</button>
			<button @click="addPage('down')">向下添加页</button>
			<button @click="delPage">删除页</button>
			<button @click="replacePage">替换页</button>
			<button @click="orderPage">排序页</button>
			<button @click="selectPage">选择文档页</button>
			<button @click="getSaveCommand">获取保存指令</button>
			<button @click="setSaveCommandResult">设置保存指令结果</button>
			<button @click="addRecord">接收平台操作记录</button>
			<select v-model="typeSelected">                                        
    			<option :value="type.name" v-for="type in typeList" :key="type.name">{{type.name}}</option>                                    
			</select>
			<button @click="exportDoc">导出</button>
			<button @click="addPagesByDocIds">根据文档id添加文档</button>
			<button @click="undo">平台撤回</button>
			<button @click="redo">平台重做</button>
		</div>
		<div class="woodo_area"></div>
	</div>
</template>

<script>
    export default {
		data(){
			return{	
            	typeList:[
                    {
                        name: 'ppt'
                    },
                    {
                        name: 'pdf'
                    },
                    {
                        name: 'image'
                    },
                    {
                        name: 'long_image'
                    }
                ],
                typeSelected: 'ppt',
			}
		},
		created(){
			let that = this;
		},
		mounted(){
			let that = this;
			let host = (window.location.protocol+"//"+window.location.host);
			function loadScript(src, callback) {
				  var script = document.createElement('script'),
				       head = document.getElementsByTagName('head')[0];
				  script.type = 'text/javascript';
				  script.charset = 'UTF-8';
				  script.src = src;
				  if (script.addEventListener) {
				    script.addEventListener('load', function () {
				      callback();
				    }, false);
				  } else if (script.attachEvent) {
				      script.attachEvent('onreadystatechange', function () {
				      var target = window.event.srcElement;
				      if (target.readyState == 'loaded') {
				        callback();
				      }
				    });
				  }
				  head.appendChild(script);
				}
				loadScript("/public/sdk/api-sdk.js",function(){
					woodoJs.init({
            				appId:that.$route.query.appId,
            				token:that.$route.query.token,
            				time:that.$route.query.time,
            				domain:that.$route.query.domain?that.$route.query.domain:host,
            				userUuid:that.$route.query.userUuid,
            				docId:that.$route.query.docId,
            				css:host+"/public/sdk/style.css",
            				ele:".woodo_area",
            				fontFamily:"woodo-SourceHanSansCN-ExtraLight",
            				fontFamilyOrder:["woodo-SourceHanSansCN-ExtraLight"],
            				autoSave:false,
            				loadingStart:function(){console.log("开始")},
            				loadingEnd:function(){console.log("结束")},
            				listenMessage:function(data){
            					console.log(data);
            					if(data.opt === 'addPage'){
            						//处理返回数据，返回平台操作记录
            						return {master:{undo:'撤回添加文档页操作'+new Date().getTime(),redo:'重做添加文档页操作'+new Date().getTime()}}
            					}else if(data.opt === 'copyPage'){
            						//处理返回数据，返回平台操作记录
            						return {master:{undo:'撤回复制文档页操作'+new Date().getTime(),redo:'重做复制文档页操作'+new Date().getTime()}}
            					}else if(data.opt === 'delPage'){
            						//处理返回数据，返回平台操作记录
            						return {master:{undo:'撤回删除文档页操作'+new Date().getTime(),redo:'重做删除文档页操作'+new Date().getTime()}}
            					}else if(data.opt === 'orderPage'){
            						//处理返回数据，返回平台操作记录
            						return {master:{undo:'撤回排序文档页操作'+new Date().getTime(),redo:'重做排序文档页操作'+new Date().getTime()}}
            					}else if(data.opt === 'replacePage'){
            						
            					}else if(data.opt === 'undo'){
            						//恢复平台数据
            					}else if(data.opt === 'redo'){
            						//恢复平台数据
            					}else if(data.opt === 'orderPageCheck'){
            						return {orderPageCheck:false};
            					}
            				}
            		});
				});
		},
		methods: {
			addPage:function(type){
				let pageInfo={
							"id": 6593132,
							"createDate": 1575869951000,
							"modifyDate": 1576824070000,
							"uuid": "uuid15a9a50c11f6b2cba25a9b540642",
							"elementList": [{"id":"uuidb9a87d898b123153ed997db5e644","type":"img","group":"","lock":false,"link":null,"opacity":"1","translate":"227.5,128.76","rotate":"0,227.5,127.2371364653244","scale":"0.91,0.91","border_w":"0","image_w":"500","image_h":"279.6420581655481","url":"http://file.woodo.cn/upload/image/201812/06/e6e4e943-b5df-426c-9210-d5af0bd71e17.jpg","clip":{"id":"uuida1baa238dc296063857e814e18a6","type":"RECT","scale":"1.25,0.6991051454138703","x":"0","y":"0","w":"500","h":"279.6420581655481","d":"M-0.5,-0.994 L401.000,-0.994 L401.000,400.994 L-0.5,400.994 L-0.5,-0.994 L-0.5,-0.994 Z"},"shadow":{"color":"transparent","blur":"0","x":"0","y":"0","rotate":"0","offset_x":"0%","offset_y":"0%","dx":"0","dy":"0","w":"100%","h":"100%"},"reversal":{"translate":"0,0","matrix":"1,0,0,1,0,0"}}],
							"image": null,
							"pageNumber": 1,
							"background": "#ffffff",
							"backgroundImage": null,
							"backgroundImageWidth": null,
							"backgroundImageHeight": null,
							"title": null,
							"switchType": "fadeInAndOut",
							"isLock": false
						}
				let pageArray=new Array();
				pageArray.push(pageInfo);
				pageArray.push(pageInfo);
				var prom=prompt("输入uuid",""); 
			    woodoJs.addPage(pageArray,prom,type,{master:{undo:'撤回添加文档页操作'+new Date().getTime(),redo:'重做添加文档页操作'+new Date().getTime()}},function(data){
					console.log(data);
				});
			},
			delPage:function(){
			    var prom=prompt("输入uuid",""); 
			    if (prom!=null && prom!=""){
			    	let uuids = prom.split(',');
			    	woodoJs.delPage(uuids,{master:{undo:'撤回删除文档页操作'+new Date().getTime(),redo:'重做删除文档页操作'+new Date().getTime()}},function(data){
						console.log(data);
					});
			    } 
			},
			replacePage:function(){
				let pageInfo={
					"id": 6593132,
					"uuid": "uuid1f06497107c43dd866c49c8e7575",
					"createDate": 1575869951000,
					"modifyDate": 1576824070000,
					"uuid": "uuid15a9a50c11f6b2cba25a9b540642",
					"elementList": [{"id":"uuidb9a87d898b123153ed997db5e644","type":"img","group":"","lock":false,"link":null,"opacity":"1","translate":"227.5,128.76","rotate":"0,227.5,127.2371364653244","scale":"0.91,0.91","border_w":"0","image_w":"500","image_h":"279.6420581655481","url":"http://file.woodo.cn/upload/image/201812/06/e6e4e943-b5df-426c-9210-d5af0bd71e17.jpg","clip":{"id":"uuida1baa238dc296063857e814e18a6","type":"RECT","scale":"1.25,0.6991051454138703","x":"0","y":"0","w":"500","h":"279.6420581655481","d":"M-0.5,-0.994 L401.000,-0.994 L401.000,400.994 L-0.5,400.994 L-0.5,-0.994 L-0.5,-0.994 Z"},"shadow":{"color":"transparent","blur":"0","x":"0","y":"0","rotate":"0","offset_x":"0%","offset_y":"0%","dx":"0","dy":"0","w":"100%","h":"100%"},"reversal":{"translate":"0,0","matrix":"1,0,0,1,0,0"}}],
					"image": null,
					"pageNumber": 1,
					"background": "#ffffff",
					"backgroundImage": null,
					"backgroundImageWidth": null,
					"backgroundImageHeight": null,
					"title": null,
					"switchType": "fadeInAndOut",
					"isLock": false
				}
				var prom=prompt("输入uuid",""); 
			    if (prom!=null && prom!=""){ 
			    	 woodoJs.replacePage([{srcUuid:prom,pageInfo:pageInfo}], {master:{undo:'撤回替换文档页操作'+new Date().getTime(),redo:'重做替换文档页操作'+new Date().getTime()}});
			    }
				
			},
			orderPage:function(){
				var orderPageUUid="";
				var targetPageUUid="";
				var prom=prompt("输入需要排序uuid",""); 
			    if (prom!=null && prom!=""){ 
			    	orderPageUUid=prom.split(",");
			    }
			    var prom=prompt("输入排序到目标页的uuid",""); 
			    if (prom!=null && prom!=""){ 
			    	targetPageUUid=prom;
			    }
				woodoJs.orderPage(orderPageUUid, targetPageUUid,{master:{undo:'撤回排序文档页操作',redo:'重做添排序文档页操作'}},function(data){
					console.log(data);
				})
			},
			selectPage:function(){
				var prom=prompt("输入uuid",""); 
			    if (prom!=null && prom!=""){ 
			    	woodoJs.selectPage(prom);
			    }
				
			},
			getSaveCommand:function(){
				woodoJs.getSaveCommand(function(result){
					console.log(JSON.stringify(result.data));
				});
			},
			setSaveCommandResult:function(){
				var prom=prompt("输入保存结果数据",""); 
				let data = JSON.parse(prom);
				woodoJs.setSaveCommandResult(data,function(data){
					console.log(data);
				});
			},
			addRecord:function(){
				woodoJs.addRecord({master:{undo:'撤回文档页操作',redo:'重做文档页操作'}},function(data){
					console.log(data);
				});
			},
			exportDoc:function(){
				let docId=516697;
				let type = 'uuidf0ddb25767d5e2820c75eb2001a2'
				let appId='wd5f983248169a4fdf';
				let token='eyJhbGciOiJIUzM4NCJ9.eyJpYXQiOjE1NzcxMDA2MzN9.QMuMg5im1T4NqEbnVX1i5QPeDzY66pjKcG66slvNoRbPAG5D6wFIIrMmaQqYhfGa';
				let time='1577082911535';
				var prom=prompt("输入DocId",""); 
			    if (prom!=null && prom!=""){ 
			    	docId=prom;
			    }
			    var prom=prompt("导出类型(ppt/image/pdf)",""); 
			    if (prom!=null && prom!=""){ 
			    	type=prom;
			    }
			    var password = "";
			    if(type == 'pdf'){
			    	var pdf_password=prompt("输入pdf password","")
			    	if (pdf_password!=null && pdf_password!=""){ 
			    		password=pdf_password;
			    	}
			    }
			    var prom=prompt("输入appId",""); 
			    if (prom!=null && prom!=""){ 
			    	appId=prom;
			    }
			    var prom=prompt("输入token",""); 
			    if (prom!=null && prom!=""){ 
			    	token=prom;
			    }
			    var prom=prompt("输入time",""); 
			    if (prom!=null && prom!=""){ 
			    	time=prom;
			    }
				woodoJs.export(docId,type,appId,token,time,password);
			},
			addPagesByDocIds:function(){
				let docIds=[390743,390744];
				let targetPageUuid = 'uuidfa7c7dea11053abee2580d7059c4'
				let appId='wd5f983248169a4fdf';
				let token='eyJhbGciOiJIUzM4NCJ9.eyJpYXQiOjE1NzcxMDA2MzN9.QMuMg5im1T4NqEbnVX1i5QPeDzY66pjKcG66slvNoRbPAG5D6wFIIrMmaQqYhfGa';
				let time='1577082911535';
				let delPageUuids;
				var prom=prompt("输入DocId,逗号分隔",""); 
			    if (prom!=null && prom!=""){ 
			    	docIds=prom;
			    	docIds = docIds.split(',');
			    }
			    var prom=prompt("输入目标页的uuid",""); 
			    if (prom!=null && prom!=""){ 
			    	targetPageUuid=prom;
			    }
			    var prom=prompt("输入删除页的uuid",""); 
			    if (prom!=null && prom!=""){ 
			    	delPageUuids=prom;
			    	delPageUuids = delPageUuids.split(',');
			    }
			    var prom=prompt("输入appId",""); 
			    if (prom!=null && prom!=""){ 
			    	appId=prom;
			    }
			    var prom=prompt("输入token",""); 
			    if (prom!=null && prom!=""){ 
			    	token=prom;
			    }
			    var prom=prompt("输入time",""); 
			    if (prom!=null && prom!=""){ 
			    	time=prom;
			    }
				woodoJs.addPagesByDocIds(docIds,targetPageUuid,appId,token,time,{master:{undo:'平台撤回',redo:'平台重做'}},function(data){
					console.log(data)
				},delPageUuids);
			},
			undo:function(){
				woodoJs.undo();
			},
			redo:function(){
				woodoJs.redo();
			}
		}
	}
</script>

<style scoped>
	.opt_area{
		height: 90px;
	}
	.woodo_area{
		text-align:center;
	}
	.woodo_area >>> iframe{
		width: 1200px;
    	height: 800px;
	}
</style>