//文档旧数据处理器

let method = {
	//更新文档
	updateDocument:function(document_info,document_page_list){
		let documentBackground = method.getDocumentBackground(document_info.background, document_info.backgroundImage);
		if(documentBackground){
			document_info.background = documentBackground;
		}
        $.each(document_page_list,function(i,item){
        	let documentPageBackground = method.getDocumentPageBackground(item.background, item.backgroundImage, item.backgroundImageWidth, item.backgroundImageHeight);
        	if(documentPageBackground){
        		item.background = documentPageBackground;
        	}
        });
        return {
        	document_info : document_info,
        	document_page_list : document_page_list
        }
	},
	//更新指令
	updateCommand:function(command){
		let documentBackground = method.getDocumentBackground(command.document.background, command.document.backgroundImage, true);
		if(documentBackground){
			command.document.background = documentBackground;
		}
		$.each(command.documentPages,function(i,item){
			if(item.type !== 'edit'){
				return true;
			}
			let documentPageBackground = method.getDocumentPageBackground(item.background, item.backgroundImage, item.backgroundImageWidth, item.backgroundImageHeight, true);
			if(documentPageBackground){
				item.background = documentPageBackground;
			}
        });
		return command;
	},
	//文档背景
	//2.6.6 : 字符串(纯色) => 对象结构(纯色、图片)
	getDocumentBackground:function(background, backgroundImage, isCommand = false){
		try{
			//判断是否新结构
			if(typeof background === 'object'){
				return background;
			}
			let newBackground = {};
			//背景色
			if(background){
				newBackground.type = 'color';
				newBackground.background = background;
			}
			//背景图
			if(backgroundImage){
				newBackground.type = 'image';
				newBackground.image = {
					type : 'cover',
					src : backgroundImage
				};
			}
			//有值要补全结构
			if(newBackground.type && !isCommand){
				newBackground = $.extend({
					type : 'color',
					background : '#ffffff',
					image : null
				},newBackground);
			}
			if(Object.keys(newBackground).length === 0){
				return;
			}
			return newBackground;
		}catch(e){
			console.error(e);
		}
		return background;
	},
	//文档页背景
	//2.6.6 : 字符串(纯色)或对象结构(渐变色) => 对象结构(纯色、渐变色、图片)
	getDocumentPageBackground:function(background, backgroundImage, backgroundImageWidth, backgroundImageHeight, isCommand = false){
		try{
			//判断是否新结构
			if(typeof background === 'object' && background.type){
				return background;
			}
			let newBackground = {};
			//背景色
			if(background){
				if(typeof background === 'string'){
					//纯色
					newBackground.type = 'color';
					newBackground.color = background;
				}else{
					//渐变色
					let rotate = 90 - Number(background.rotate);
					if(rotate < 0){
						rotate = 360 + rotate;
					}
					newBackground.type = 'gradient';
					newBackground.color = {
						type : 'linear',
						rotate : rotate,
						code : [{
							color : background.left_color,
							opacity : background.left_opacity,
							offset : background.left_x
						},{
							color : background.right_color,
							opacity : background.right_opacity,
							offset : background.right_x
						}]
					};
				}
			}
			//背景图
			if(backgroundImage){
				newBackground.type = 'image';
				newBackground.image = {
					type : 'cover',
					src : backgroundImage
				};
				if(backgroundImageWidth && backgroundImageHeight){
					newBackground.image.width = backgroundImageWidth;
					newBackground.image.height = backgroundImageHeight;
				}
			}
			//有值要补全结构
			if(newBackground.type && !isCommand){
				newBackground = $.extend({
					type : 'color',
					background : '#ffffff',
					image : null
				},newBackground);
			}
			if(Object.keys(newBackground).length === 0){
				return;
			}
			return newBackground;
		}catch(e){
			console.error(e);
		}
		return background;
	}
};

export default method;