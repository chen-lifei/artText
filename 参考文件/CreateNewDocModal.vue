<template>
    <div class="create_doc_modal" v-if="show_create_doc_modal">
        <div class="modal_item options" v-show="!customize_modal_show && showCreatModal">
            <div class="header">
                <h1>选择一种创建方式</h1>
                <button class="modal-close" @click="close" v-bdtongji="`文档中心-首页-文件管理-新建弹窗-关闭`"></button>
            </div>
            <div class="body">
                <div class="options_box new_doc" :class="{checked:doc_size_list_show}">
					<h2>空白文稿</h2>
					<div class="pull_modal choose_size" @click.stop="toggle_doc_size()" :class="{checked:doc_size_list_show}">
						<button class="current">{{current_doc_size.text}}</button>
						<div class="list_contain size_list" :class="{show:doc_size_list_show}">
							<button class="list_item size_item"
								:class="{checked:current_doc_size === item}"
								v-for="(item,index) in doc_size_list"
								:key="index"
								@click.stop="choose_doc_size(item)"
								v-bdtongji="`文档中心-首页-文件管理-新建弹窗-空位文稿-创建-${item.text}`"
							>{{item.text}}</button>
						</div>
					</div>
					<button class="create_doc_btn" @click="create_new_doc" v-bdtongji="`文档中心-首页-文件管理-新建弹窗-空位文稿-创建 | ${current_doc_size.type === 'slide' ? 'PC-统计-幻灯片-创建' : 'PC-统计-设计实验室-创建'}`">创建</button>
                </div>
                <div class="options_box use_template" @click="open_template_modal" v-bdtongji="`文档中心-首页-文件管理-新建弹窗-使用模板`">
					<!--选择模板类型- 内置模板|我的模板 -->
					<h2 class="choose_template" :class="{checked:open_template_list}" @click.stop="choose_template_type()">{{current_template_type}}</h2>
					<transition name="modal-fade">
						<div class="template_type_list" v-if="open_template_list">
							<button class="list_item" :class="{checked:current_template_type === '内置模板'}" @click.stop="choose_template_type('inside')">内置模板</button>
							<button class="list_item" :class="{checked:current_template_type === '我的模板'}" @click.stop="choose_template_type('myself')">我的模板</button>
						</div>
					</transition>
					<p class="tip" v-if="current_template_type ==='内置模板'">我们提供丰富多样的模板供您使用</p>
					<!--选择我的模板中的模板-->
					<div class="my_template" v-else>
						<div class="pull_modal choose_my_template" @click.stop="choose_template()" :class="{checked:open_my_template_list}" v-if="current_template_type ==='我的模板' && my_template_list.length">
							<button class="current">{{current_template.name}}</button>
							<div class="list_contain template_list" :class="{show:open_my_template_list}">
								<button class="list_item" :class="{checked:current_template_name === item.name}" v-for="item in my_template_list" :key="item.name" @click.stop="choose_template(item)">{{item.name}}</button>
							</div>
						</div>
						<p class="tip" v-if="!my_template_list.length">你还没有模板，请<br>在文档编辑页右上角<br>【保存为模板】</p>
						<button v-else class="create_doc_btn" @click.stop="use_template(current_template)">创建</button>
					</div>
                </div>
                <div class="options_box upload_file">
					<h2>上传文件</h2>
					<p class="tip">仅支持PPTX、PDF两种格式</p>
					<input id="upload_ppt" type="file" accept=".pptx,.pdf"  v-bdtongji="`文档中心-首页-文件管理-新建弹窗-上传文件`" @change="import_ppt">
                </div>
            </div>
        </div>
		<!-- 自定义尺寸弹框 -->
        <div class="modal_item customize" v-if="customize_modal_show">
            <div class="header">
                <h1>创建自定义文稿</h1>
                <span class="modal_tips">根据你需要制作的文稿预设尺寸</span>
                <button class="modal-close" @click="close"></button>
            </div>
            <div class="body">
				<div class="input_size_panel" @click.stop>
					<div class="size_item width_size">
						<input type="number"
							:class="{wrong:show_custom_size_wrong}"
							@input="check_custom_size($event)"
							v-model="customize_info.width"
						>
						<p class="unit">像素</p>
					</div>
					<i>×</i>
					<div class="size_item height_size">
						<input type="number"
							:class="{wrong:show_custom_size_wrong}"
							@input="check_custom_size($event)"
							v-model="customize_info.height"
						>
						<p class="unit">像素</p>
					</div>
					<p class="wrong_tip" v-if="show_custom_size_wrong">画布长宽的取值范围为 40px*40px 至 10000px*10000px</p>
				</div>
            </div>
			<div class="footer">
				<button class="back" @click="close_customize_modal">返回上一级</button>
				<button class="sure" @click="create_new_doc" :class="{disabled:show_custom_size_wrong || !customize_info.width || !customize_info.height}">创建文稿</button>
			</div>
        </div>
		<!-- 模板列表弹框 -->
		<template_modal
            v-if="template_modal_show"
            is_docCenter=true
            :template_type="template_list_type"
            @close="close_template_modal"
            @change_template_type="change_template_type"
        ></template_modal>
		<!-- 上传ppt蒙层 -->
        <transition name="modal-fade">
            <div class="import_ppt_masking" v-if="importing_ppt">
				<div class="import_ppt_loading"></div>
                <span>{{import_ppt_progress}}%</span>
				<span>正在导入文件，请稍后</span>
            </div>
        </transition>
    </div>
</template>

<script>
    import template_modal from '../Template/TemplateListMain.vue';
    export default {
        name: "CreateNewDocModal",
		components:{template_modal},
        data(){
            return {
                // 新建弹框文档相关
				showCreatModal: true,
				show_create_doc_modal: false,       // 新建空白文档弹框标识
				current_doc_size: {},               // 当前文档尺寸
				doc_size_list:[
					{
						width:'910',
						height:'512',
                        text:'宽屏幻灯片 16 : 9',
                        type:'slide'
					},
					{
						width:'910',
						height:'567',
                        text:'宽屏幻灯片2 16 : 10',
                        type:'slide'
					},
					{
						width:'910',
						height:'683',
                        text:'标准幻灯片 4 : 3',
                        type:'slide'
					},
					{
						width:'1240',
						height:'1754',
                        text:'A4封面 1240 x 1754像素',
                        type:'design'
					},
					{
						width:'900',
						height:'383',
                        text:'公众号配图 900 x 383像素',
                        type:'design'
					},
					{
						width:'640',
						height:'1008',
                        text:'手机海报 640 x 1008像素',
                        type:'design'
					},
					{
						width:'720',
						height:'1280',
                        text:' 邀请函 720 x 1280像素',
                        type:'design'
					},
					{
						width:'1191',
						height:'731',
                        text:'画册 1191 x 731像素',
                        type:'design'
					},
					{
						width:'1280',
						height:'1184',
                        text:'微信朋友圈 1280 x 1184像素',
                        type:'design'
					},
					{
						width:'595',
						height:'808',
                        text:'宣传单 595 x 808像素',
                        type:'design'
					},
					{
						width:'800',
						height:'800',
                        text:'主图直通车 800 x 800像素',
                        type:'design'
					},
					{
						width:'',
						height:'',
                        text:'自定义',
                        type:'self'
					}
				],
				doc_size_list_show:false,          // 文档尺寸下拉列表标识

				// 自定义尺寸相关
				customize_modal_show:false,        // 文档自定义尺寸弹框标识
				customize_info:{                   // 文档自定义尺寸信息
					width:null,
					height:null
				},
				show_custom_size_wrong: false,     // 自定义尺寸错误标识

				// 选择模板相关
				current_template_type: '内置模板',	     //当前模板类型 内置||我的
				current_template_name: '',
				current_template: [],					//选择的模板
				my_template_list: [],					//我的模板列表				
				open_template_list: false,
				open_my_template_list: false,
                template_modal_show: false,
                template_list_type: 'slides',
				importing_ppt: false,                   //展示导入ppt蒙层
				import_ppt_progress: 0,                 //导入ppt进度
            }
		},
		props:['current_folder_info', 'document_list', 'current_doc_index', 'current_doc_list_type','previous_grade_path'],
        mounted () {
        },
        methods:{
            show: function(){
                let that = this;
                that.show_create_doc_modal = true;
				that.showCreatModal = true;
				// 设置默认文档尺寸
				that.current_doc_size = that.doc_size_list[0];
			},
			close: function() {
				let that = this;
				$('body').css('overflow','');
				// 关闭新建弹框
				that.show_create_doc_modal = false;
				// 关闭自定义弹框
				that.close_customize_modal();
			},
			// 文档尺寸下拉列表展示/隐藏
			toggle_doc_size: function(){
				let that = this;
				that.doc_size_list_show = !that.doc_size_list_show;
			},
			// 选择创建文档尺寸
			choose_doc_size: function(item){
				let that = this;
				that.doc_size_list_show = false;
				if(item.width == ''){
					// 自定义
					that.customize_modal_show = true;
				}else{
					// 其他尺寸
					that.current_doc_size = item;
				}
			},
			// 关闭自定义尺寸弹框
			close_customize_modal: function(){
				let that = this;
				that.customize_modal_show = false;
				// 数据重置
				that.customize_info = {width:null,height:null};
				that.show_custom_size_wrong = false;
			},
			// 检查自定义比例值
            check_custom_size: function(e){
				let that = this,
					width = that.customize_info.width,
					height = that.customize_info.height,
					min = 40,
					max = 10000;
				// 错误拦截
                if(width !== null && (isNaN(width) || width < min || width > max)) return that.show_custom_size_wrong = true;
                if(height !== null && (isNaN(height) || height < min || height > max)) return that.show_custom_size_wrong = true;
                that.show_custom_size_wrong = false;
            },
			// 创建新文档弹框
			create_new_doc: function(){
				let that = this,
					fId,
					width,
					height,
					size_index,
					size_list = that.doc_size_list,
					params = '',
					path = '';
				if(that.current_folder_info) fId = that.current_folder_info.id;
				if (that.customize_modal_show) {
					width = +that.customize_info.width;
					height = +that.customize_info.height;
				} else {
					size_index = size_list.findIndex(item => that.current_doc_size === item)
				}
				// 有指定文件夹
				if (fId) {
					that.$check_rankauth.documentCreateAndRecovery().then(function(){
						// 判断是否选中特定文件夹
						let list = that.document_list;
						let doc_index = that.current_doc_index;
						if(list[doc_index] && list[doc_index].open) fId = list[doc_index].id;
						// 判断当前文档列表分类(我的桌面/我的团队)
						if(that.current_doc_list_type === 'myTeam'){
							params = 'teamfId';
							path = 'myTeam';
						}else{
							params = 'fId';
							path = 'myDesktop';
						}
						if(that.customize_modal_show){
							that.$router.push('/edit/?' + params + '=' + fId + '&docWidth=' + width +'&docHeight=' + height);
						}else{
							that.$router.push('/edit/?' + params + '=' + fId + '&docSizeIndex=' + size_index);
						}
						//判断类别0、1为普通幻灯片
						sessionStorage.setItem("previous_list_path",path);
						// 存储文件夹路径
						sessionStorage.setItem("previous_grade_path", JSON.stringify(that.previous_grade_path));
					});
				} else {
					sessionStorage.setItem("previous_list_path", 'myDesktop');
					if(that.customize_modal_show){
						that.$router.push('/edit/?&docWidth=' + width +'&docHeight=' + height);
					}else{
						that.$router.push('/edit/?&docSizeIndex=' + size_index);
					}
				}
			},
			// 打开模板弹框
			open_template_modal: function(){
				this.open_template_list = false;
				this.template_modal_show = true;
			},
			// 关闭模板弹框
			close_template_modal: function(){
				this.template_modal_show = false;
				this.show_create_doc_modal = false;
            },
            change_template_type: function(type){
                this.template_list_type = type;
            },
			// 获取我的模板列表
			get_my_template:function(callback){
				let that = this;
				that.$axios.get('/api/member/my_release/')
				.then(function(data) {
					if(data.data.code === '2'){
						that.my_template_list = data.data.data;
						typeof callback === 'function' && callback();
					}
				})
			},
			// 切换模板类型
			choose_template_type:function(type){
				let that = this;
				if(!type){
					that.open_template_list = ! that.open_template_list;
				}else{
					if(type==='inside'){
						that.current_template_type = '内置模板';
					}else{
						that.current_template_type = '我的模板';
						// 获取我的模板信息
						that.get_my_template(() => {
							if(that.my_template_list.length>0){
								that.current_template = that.my_template_list[0];
							}
						});
					}
					that.open_template_list = false;
				}
			},
			// 选择我的模板中的模板
			choose_template:function(item){
				let that = this;
				if(!item){
					that.open_my_template_list = !that.open_my_template_list;
				}else{
					that.current_template = item;
					that.open_my_template_list = false;
				}
            },
			// 使用模版点击事件
			use_template: function(item,newtab){
				if(!item) return;
				let that = this,
					type = that.$parent.current_doc_list_type || 'myDesktop';
				if(item.templateIsVip && !that.user.memberVipExpire){//会员专享
					that.$modal({templateType:'memberGrade'});
					return;
				}
				sessionStorage.setItem("previous_list_path", type);
				sessionStorage.setItem("previous_grade_path", '');
				let url = '/edit/?modalId=' + item.documentId;
				if(newtab){
					that.$common.window_open_newtab(window.location.origin + url);
				}else{
					location.href = url;
				}
			},
			// 导入ppt
            import_ppt:function(){
                let that = this,
                    files = $('#upload_ppt')[0].files,
                    file, file_name;
                if(!files || files.length <= 0) return that.$toast('未获取到文件,请重试',800);
                file = files[0];
                file_name = file.name.toLowerCase();
                if(!/(pptx|pdf)$/.test(file_name)) return that.$toast('限定只有.pptx/.pdf 为后缀的文件才能上传',2000);
                if(file.size/1024/1024 > 100) return that.$toast('只能上传100M以下的文件哦~',2000);

                let import_progress_timer;
                let formData = new FormData();
	            formData.append('file', file);
				that.showCreatModal = false;
	            that.importing_ppt = true;
                if(/(pptx)$/.test(file_name)){
	                that.$axios({
	                    url: '/api/member/document/import_doc/',
	                    headers: { 'Content-Type': 'multipart/form-data' },
	                    method: 'post',
	                    data:formData,
	                    dataType:'file',
                        timeout: 60000
	                }).then(function(data){
						that.importing_ppt = false;
						if(data.data.code === '2'){
							that.import_ppt_progress = 100;
							clearInterval(import_progress_timer);
							let doc_id = data.data.data.docId;
							that.$toast('导入成功',800);
							location.href = '/edit/?docId=' + doc_id;

						}else{
							clearInterval(import_progress_timer);
							that.$toast(data.data.content, 5000);
						}
						that.show_create_doc_modal = false;
					}).catch(function(info){
						clearInterval(import_progress_timer);
						that.importing_ppt = false;
						that.show_create_doc_modal = false;
						that.$toast('导入失败,请刷新页面重试',800);
					});

                    import_progress_timer = setInterval(function(){
	                    if(that.import_ppt_progress >= 95){
	                        clearInterval(import_progress_timer);
	                    }else{
	                        that.import_ppt_progress += 5;
	                    }
                    }, 1000);

                }else if(/(pdf)$/.test(file_name)){
					that.$common.import_pdf(that,formData,function(data){
						that.$toast('导入成功',800);
						that.importing_ppt = false;
                    	setTimeout(function(){
                    		location.href = '/edit/?docId=' + data.data.data.docId;	
                    	},500);
						that.show_create_doc_modal = false;
                	}, (err)=>{
						that.importing_ppt = false;
						if(err){
							that.$toast(err.data.content, 2000);
						}else{
							that.$toast('导入失败',800);
						}
						that.show_create_doc_modal = false;
					});
                }
				$('#upload_ppt').val('');
			},
        },
    }
</script>

<style lang="less" scoped>

    // 通用设置弹框
	.create_doc_modal{
		position: fixed;
		top: 0;
		left: 0;
        z-index:10;
		width: 100%;
		height: 100%;
		text-align: center;
		background-color: rgba(0, 0, 0, 0.502);
		&:after{
			content: "";
			display: inline-block;
			vertical-align: middle;
			width: 0;
			height: 100%;
		}
		.modal_item{
			position:relative;
			display: inline-block;
			vertical-align: middle;
			width: 770px;
			height: 460px;
			padding:47px 42px 50px;
			margin: 0 auto;
			background-color: #f7f7f7;
			border-radius: 4px;
			text-align: center;
			.header{
				margin-bottom:42px;
			}
			.modal-close{
				position: absolute;
				right: 23px;
				top: 19px;
				opacity: 0.8;
			}
			h1{
				display:block;
				text-align:center;
				font-weight:600;
			}
		}
	}
	.modal_item.options{
		h1{
			font-size:24px;
			color:#2c2c2c;
			&:after{
				content:"";
				display:block;
				width: 60px;
				height: 5px;
				margin:10px auto 0;
				background-image: linear-gradient(90deg,#2d70f6 0%,#13a7ed 100%),linear-gradient(#ffffff,#ffffff);
				background-blend-mode: normal,normal;
				border-radius: 3px;
			}
		}
		h2{
			display:block;
			margin:14px 0 33px;
			font-size:18px;
			color:#2c2c2c;
			text-align:center;
			font-weight:500;
		}
		.options_box{
			position:relative;
			display:inline-block;
			vertical-align:top;
			width: 210px;
			height: 282px;
			padding:37px 9px 20px;
			margin-right:28px;
			background-color: #ffffff;
			border-radius: 4px;
			cursor:pointer;
			&:last-child{
				margin-right:0;
			}
			&::before{
				content:"";
				display:block;
				width:64px;
				height:64px;
				margin:0 auto;
			}
			&.new_doc::before{
				background:url(../../../assets/pc/images/doc/new_doc.png) top center no-repeat;
				background-size:contain;
			}
			&.use_template::before{
				background:url(../../../assets/pc/images/doc/use_template.png) top center no-repeat;
				background-size:contain;
			}
			&.upload_file::before{
				background:url(../../../assets/pc/images/doc/upload_file.png) top center no-repeat;
				background-size:contain;
			}
			&:hover,&.checked{
				box-shadow:0px 6px 5px 0px rgba(0, 0, 0, 0.05);;
				transform:scale(1.05);
				transition: all 0.4s;
			}
		}
		.pull_modal{
			position:relative;
			width:100%;
			height:32px;
			line-height:30px;
			padding:0 10px;
			border:1px solid rgba(86, 79, 79, 0.16);
			border-radius:2px;
			text-align:left;
			&:after{
				content:'';
				position: absolute;
				top: 14px;
				right: 8px;
				border:4px solid transparent;
				border-top:4px solid #757d8b;
				transform:rotate(0deg);
				transition:all 0.3s;
			}
			&.checked:after{
				transform:rotate(180deg);	
				top:10px;			
			}
			.current{
				font-size:12px;
				color:#7e8795;
			}
		}
		.list_contain{
			position:absolute;    
			top: 30px;
			left: -1px;
			right:-1px;
			font-size:12px;
			height:0;
			overflow:hidden;
			text-align:left;
			background:#fff;
			transition:all .5s;
			transform:translate3d(0,0,0);
			&.show{
				border:1px solid #dfdfdf;
				height:150px;
				overflow-y:auto;
			}
		}
		.list_item{
			width:100%;
			height:25px;
			line-height:25px;
			padding-left: 10px;
			text-align:left;
			font-size:12px;
			color:#9e9e9e;
			&.checked,&:hover{
				color:var(--mainColor);
				background:#f3f6fa;
			}
		}
		p.tip{
			width:80%;
			margin:25px auto 0;
			font-size:14px;
			color:#a1aab5;
		}
		.create_doc_btn{
			width: 80px;
			height: 35px;
			line-height: 35px;
			margin:28px auto 0;
			background-color: var(--mainColor);
			border-radius: 18px;
			color:#fff;
			font-size:14px;
		}
		// 模板
		.use_template{
			.choose_template{
				position:relative;
				&:after{
					content:'';
					position: absolute;
					top: 11px;
					right: 43px;
					border:4px solid transparent;
					border-top:4px solid #525151;
					transform:rotate(0deg);
					transition:all 0.3s;
				}
				&.checked:after{
					transform:rotate(180deg);	
					top:7px;			
				}
			}
			.choose_my_template{
				position:relative;
				&:after{
					content:'';
					position: absolute;
					top: 13px;
					right: 8px;
					margin-left:10px;
					border:4px solid transparent;
					border-top:4px solid #525151;
					transform:rotate(0deg);
					transition:all 0.3s;
				}
				&.checked:after{
					transform:rotate(180deg);	
					top:10px;			
				}
			}
			.template_type_list{
				position: absolute;
				top: 146px;
				left: 50%;
				width: 120px;
				height:auto;
				margin-left: -60px;
				padding-bottom:20px;
				font-size:12px;
				background: #fff;
				border:1px solid #dfdfdf;
				z-index:2;
				.list_item{
					text-align:center;
					padding-left:0;
				}
			}
		}
		// 上传
		.upload_file input{
			position:absolute;
			top:0;
			left:0;
			width:100%;
			height:100%;
			font-size:0;
			opacity:0;
			cursor:pointer;
		}
	}
	// 自定义弹框
	.modal_item.customize{
		padding:0;
		.header{
			margin-top:56px;
			h1{
				font-size: 36px;
				color: #2c2c2c;
				&:after{
					display:none;
				}
			}
			.modal_tips{
				display:block;
				margin:16px auto 0;
				font-size:14px;
				color:#586575;
				text-align:center;
			}
		}
		.body{
			margin-top:69px;
			padding:0 152px;
			text-align:left;
		}
		.input_size_panel{
			.size_item{
				position: relative;
				display:inline-block;
				vertical-align:middle;
				width:180px;
				background-color: #ffffff;
			}
			input{
				width:100%;
				height: 40px;
				line-height:40px;
				padding-left:10px;
				font-size:12px;
				border:1px solid rgba(0, 0, 0, 0.17);
				border-radius: 4px;
				&.wrong{
					border-color:#ff7575;
                }
                
                &::-webkit-inner-spin-button,&::-webkit-outer-spin-button{
                    -webkit-appearance:none;
                }  
			}
			.unit{
				position: absolute;
				right:0;
				top:0;
				width:50px;
				height:100%;
				line-height:40px;
				border-left:1px solid #cdcdcd;
				text-align:center;
				font-size:12px;
				color:#a3acb7;
			}
			i{
				display:inline-block;
				vertical-align: middle;
				margin:0 14px;
				font-size:22px;
				font-weight:bold;
				color:#ccd0d5;
			}
			.wrong_tip{
				position:absolute;
				margin-top:10px;
				color:#ff7575;
				font-size:12px;
			}
		}
		.footer{
			width:100%;
			margin-top:114px;
			text-align:center;
			button{
				width: 120px;
				height: 42px;
				line-height:42px;
				border-radius: 4px;
				font-size:14px;
				text-align:center;
				transition:all .3s;
				&:hover{
					opacity:0.7;
				}
				&.back{
					margin-right:17px;
					color:#404b58;
					background-color: #e5e5e5;
				}
				&.sure{
					color:#fff;
					background:var(--mainColor);
				}
				&.disabled{
					opacity: .5;
					pointer-events:none;
				}
			}
		}
	}
	// 上传ppt蒙层
    .import_ppt_masking{
        position:fixed;
        top:0;
        left:0;
        z-index:999;
        width:100%;
        height:100%;
        background:rgba(0,0,0,0.5);
		text-align:center;
		span{
			position:absolute;
			top:50%;
			left:50%;
			display:inline-block;
			width:80px;
			height:20px;
			margin:30px 0 0 -40px;
			font-size:16px;
			color:#ffffff;
			&:last-child{
				width: 230px;
				margin:60px 0 0 -115px;
			}
		}
	}
	.import_ppt_loading{
		position:absolute;
		top:50%;
		left:50%;
		width: 4em;
		height: 4em;
		margin: -2em;
		background-color: var(--mainColor);
				animation: import_ppt_loading 1.2s infinite ease-in-out;
		}
		@-webkit-keyframes import_ppt_loading {
		0% {
			-webkit-transform: perspective(120px) rotateX(0deg) rotateY(0deg);
					transform: perspective(120px) rotateX(0deg) rotateY(0deg);
		}
		50% {
			-webkit-transform: perspective(120px) rotateX(-180.1deg) rotateY(0deg);
					transform: perspective(120px) rotateX(-180.1deg) rotateY(0deg);
		}
		100% {
			-webkit-transform: perspective(120px) rotateX(-180deg) rotateY(-179.9deg);
					transform: perspective(120px) rotateX(-180deg) rotateY(-179.9deg);
		}
		}
		@keyframes import_ppt_loading {
		0% {
			-webkit-transform: perspective(120px) rotateX(0deg) rotateY(0deg);
					transform: perspective(120px) rotateX(0deg) rotateY(0deg);
		}
		50% {
			-webkit-transform: perspective(120px) rotateX(-180.1deg) rotateY(0deg);
					transform: perspective(120px) rotateX(-180.1deg) rotateY(0deg);
		}
		100% {
			-webkit-transform: perspective(120px) rotateX(-180deg) rotateY(-179.9deg);
					transform: perspective(120px) rotateX(-180deg) rotateY(-179.9deg);
		}
	}
</style>