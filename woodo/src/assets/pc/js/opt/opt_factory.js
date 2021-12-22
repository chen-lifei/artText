import text_opt from '@/assets/pc/js/opt/text_opt.js';
import line_opt from '@/assets/pc/js/opt/line_opt.js';
import shape_opt from '@/assets/pc/js/opt/shape_opt.js';
import image_opt from '@/assets/pc/js/opt/image_opt.js';
import table_opt from '@/assets/pc/js/opt/table_opt.js';
import group_opt from '@/assets/pc/js/opt/group_opt.js';
import chart_opt from '@/assets/pc/js/opt/chart_opt.js';
import video_opt from '@/assets/pc/js/opt/video_opt.js';
import audio_opt from '@/assets/pc/js/opt/audio_opt.js';
let text = text_opt.init(),
	line = line_opt.init(),
	img = image_opt.init(),
	shape = shape_opt.init(),
	table = table_opt.init(),
	group = group_opt.init(),
	chart = chart_opt.init(),
	video = video_opt.init(),
	audio = audio_opt.init(),
	opt_factory = {
		init_opt:function(type){
			let result;
			switch(type){
				case 'text':
					result = text;
					break;
				case 'line':
					result = line;
					break;
				case 'shape':
					result = shape;
					break;
				case 'img':
					result = img;
					break;
				case 'table':
					result = table;
					break;
				case 'group':
					result = group;
					break;
				case 'chart':
					result = chart;
					break;
				case 'video':
					result = video;
					break;
				case 'audio':
					result = audio;
					break;
				default:
					result = false;
					break;
			}
			return result;
		},
	};
export default opt_factory;

/*
* 	一、性能问题
* 		1. 除编辑页 - 画布区域外，其余部分依旧使用通用渲染组件，编辑页 - 画布区域使用 js 拼接字符串形式生成画布内容。渲染速度相较 vue渲染较慢 - 可忽略不计
* 		2. 选中、双击、拖动三个方法将绑定在同一节点上，会产生事件冲突，只能在 mousedown 方法中判断当前事件类型，为适应双击事件，将会有 300 毫秒的相应时差
* 		3. 保存方法使用监听 dom 树改变响应保存，与文档协作同步冲突，导致重复触发保存 - 保存方法使用数据比对，数据一致情况将不进行保存
* 	二、方案问题
* 		1. 缺少 operate_opt.js
* 		2. 缺少通用方法集（无法直接使用 base_opt 内方法），如 层级设置，节点转化对象，对象转化节点，锁定，层级设置等
* 		3. opt_factory 内各 opt 对象定义移出 init 方法，否则每次应用会初始化各 opt 对象内置常量
* 		4. 非元素操作，如文档设置，文档页设置等，是否同步到文档数据
* 	三、修改范围
* 		1. 保存方法修改：2d
* 			1. 保存方法 与 本地历史记录方法解耦，需查看具体代码实现
* 			2. 去除保存埋点
* 			3. 新增 dom树 监听方法
* 		2. 渲染方法修改：0.5d
* 			1. 修改 编辑页 - 画布区域 渲染
* 		3. 选中方法修改：0.5d
* 			1. 修改单选元素获取信息方法 -> 改为获取节点信息
* 			2. 修改多线元素获取信息方法 -> 去除元素对象相关
* 		4. 虚线框操作方法修改：2d
* 			1. 新增 operate_opt.js 文件
* 			2. 重设 operate_opt.js 内置 rect 数据方法
* 			3. 计算虚线框数据方法
* 			4. 虚线框响应操作重绘方法
* 		5. 复制、剪切功能方法集修改：0.5d
* 			1. 元素数据进入剪贴板前需更新
* 		6. 粘贴功能方法集修改：0.5
* 			1. 生成元素对象统一修改为生成元素节点
* 		7. 元素移动、旋转、缩放方法(虚线框操作，左侧栏操作)修改：2d
* 			1. get 方法修改
* 			2. set 方法修改
* 		8. 生成元素方法修改：3d
* 			1. 素材生成元素方法
* 			2. 文本元素绘制方法
* 			3. 形状元素绘制方法
* 			4. 形状元素生成方法
* 			5. 线条元素绘制方法
* 			6. 图片元素生成方法
* 			7. 表格元素生成方法
* 			8. 粘贴元素生成方法
* 		9. 文本元素操作方法修改：2d
* 			1. 去除编辑同步操作
* 			2. 去除元素对象操作
* 			3. 元素左侧栏面板获取方法修改
* 			4. 操作方法抽取
* 		10.形状元素操作方法修改：2d
* 			1. 元素对象操作修改为元素节点操作
* 			2. 元素左侧栏面板获取方法修改
* 			3. 操作方法抽取
* 		11.线条元素操作方法修改：1d
* 			1. 元素对象操作修改为元素节点操作
* 			2. 元素左侧栏面板获取方法修改
* 			3. 操作方法抽取
* 		12.图片元素操作方法修改：2d
* 			1. 裁剪位置计算方法修改
* 			2. 元素对象操作修改为元素节点操作
* 			3. 元素左侧栏面板获取方法修改
* 			4. 操作方法抽取
* 		13.表格元素操作方法修改：2.5d
* 			1. 元素对象操作修改为元素节点操作
* 			2. 去除编辑同步操作
* 			3. 去除元素对象操作
* 			4. 元素左侧栏面板获取方法修改
* 		14.元素组合拆分方法修改	|
* 		15.锁定方法修改			|
* 		16.元素删除方法修改		|-- 1d
* 		17.层级设置方法修改：1d
* 			1. 数据操作修改为节点操作
* 		18.对齐方法修改：1d
* 		19.切换页方法修改：		|
* 			1. 增加手动画布渲染	|
* 		20.新增页方法修改：		|
* 			1. 增加手动画布渲染	|
* 		21.画布缩放方法修改：		|-- 1d
* 		22.撤回重做方法修改：1d
* 		23.文档设置方法修改：		|
* 		24.文档页设置方法修改：	|-- 1d
* 		25.渲染组件修改						|
* 		26.common.js - obj_2_svg 方法修改	|-- 1d
*	四、实现难点
*		1. 文本元素 - 去除虚线框后选中状态与编辑状态区分（字体设置功能）
*		2. 表格元素 - 功能实现代码 - 需要熟悉
*		3. 保存方法、本地历史记录方法、撤回重做方法 - 需要熟悉
*		4. operate_opt - 移动方法修改
*		5. mousedown click dbleclick 事件判断
*		6. 整体流程设计
*	五、实现流程
*		1. 画布渲染
*			|-- 编辑页 - 画布区域
*			|-- 通用文档页渲染组件
*			|-- common.js - obj_2_svg
*		2. 元素操作
*			|-- 基本元素操作（锁定，复制，删除）
*			|-- 通用元素操作（移动，旋转，所犯）
*			|-- 元素特性操作
*		3. 非元素操作
*			|-- 文档页设置
*			|-- 文档页切换
*			|-- 文档页新增
*			|-- 文档页删除
*			|-- 文档设置
*			|-- 画布比例设置
*		4. 协作同步
*			|-- obj_2_dom -> return dom
*		5. 保存本地历史记录
*		|-- dom_2_obj -> return obj
*		|-- undo_redo_doc_opt_command_local_storage
*		6. 保存文档数据
*		|-- dom_2_obj -> return obj
*		|-- save_doc
* */




