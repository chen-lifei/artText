<template>
    <div class="create_tool_contain">
        <!-- 文本绘制工具 -->
        <div class="child_panel text_panel">
            <button class="create_tool_btn" @click="toggle_tool_status('text')" v-bdtongji="`编辑器-功能区-编辑功能-顶部-文本`">
                <base-icon class="iconwenben"></base-icon>
                <span>文本</span>
            </button>
            <transition name="modal-fade">
                <div class="panel_modal" v-if="create_tool_type === 'text'">
                    <div class="panel_modal_wrapper">
                        <!-- 文本样式 -->
                        <div class="text_style_contain" v-if="text_tool_type === 'style'">
                            <ul class="text_style_list normal">
                                <li v-for="item in text_style_list.normal" :key="item.name" @click="set_draw_text(item)" v-bdtongji="`PC-统计-功能区-文本-文本样式-插入`">
                                    <base-icon class="iconchangguiwenben"></base-icon>
                                    {{item.name}}
                                </li>
                            </ul>
                        </div>
                        <!-- 艺术字 -->
                        <div class="art_word_btn" @click="show_art_list = !show_art_list">
                            <base-icon svg-id="iconyishuzi1" class="iconyishuzi1"></base-icon>
                            艺术字
                            <div class="text_art_contain" v-show="show_art_list" @click.stop>
                                <ul class="text_art_list" @click="show_art_list = false">
                                    <li v-for="(item, index) in text_art_list"
                                        :key="index"
                                        @click="use_art_material(item)"
                                        v-bdtongji="`PC-统计-功能区-文本-艺术字-插入`"
                                    >
                                        <img v-show="item.image" :src="item.image" alt="" />
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </transition>
        </div>
        <!-- 形状绘制工具 -->
        <div class="child_panel shape_panel">
            <button class="create_tool_btn" @click="toggle_tool_status('shape')" v-bdtongji="`编辑器-功能区-编辑功能-顶部-形状`">
                <base-icon class="iconjuxing"></base-icon>
                <span>形状</span>
            </button>
            <transition name="modal-fade">
                <div class="panel-modal" v-if="create_tool_type === 'shape'">
                    <div class="panel-modal-wrapper">
                        <div class="panel_content">
                            <ul>
                                <li v-for="(item, index) in common_element_list" :key="index" @click="setDraw(item)" :data_id="item.id">
                                    <div class="icon">
                                        <base-icon :class="item.icon || 'iconbianjiye-23'"></base-icon>
                                    </div>
                                    <span>{{item.name}}</span>
                                </li>
                                <li class="more" @click="openInsert()">
                                    <div class="icon">
                                        <base-icon class="icongengduoanniu"></base-icon>
                                    </div>
                                    <span>更多</span>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </transition>
        </div>
        <!-- 表格绘制工具 -->
        <div class="child_panel table_panel">
            <button class="create_tool_btn" @click="toggle_tool_status('table')" v-bdtongji="`编辑器-功能区-编辑功能-顶部-表格`">
                <base-icon class="iconbiaoge"></base-icon>
                <span>表格</span>
            </button>
            <transition name="modal-fade">
                <div class="panel_modal"  v-if="create_tool_type === 'table'">
                    <div class="panel_modal_wrapper">
                        <div class="panel_head">
                            <span :class="{check:table_tool_type === 'draw'}" @click="change_table_tool('draw')">插入表格&nbsp;&nbsp;{{table_draw_num.column || table_draw_num.row ? `${table_draw_num.column} × ${table_draw_num.row}` : ''}}</span>
                            <span :class="{check:table_tool_type === 'customize'}" @click="change_table_tool('customize')" v-bdtongji="`编辑器-功能区-编辑功能-顶部-表格-自定义`">自定义</span>
                        </div>
                        <div class="panel_content">
                            <!-- 绘制表格 -->
                            <div class="draw_table_contain" v-bdtongji="`PC-统计-功能区-表格-自定义`">
                                <table @mouseleave="remove_draw_table">
                                    <tbody>
                                        <tr v-for="tr_index in table_draw_dom.tr" :key="tr_index">
                                            <td v-for="td_index in table_draw_dom.td"
                                                :key="td_index"
                                                :data-row="tr_index"
                                                :data-column="td_index"
                                                :class="{'selected': table_draw_num.column >= td_index && table_draw_num.row >= tr_index}"
                                                @mouseenter="draw_table(td_index, tr_index)"
                                                @click="build_table"
                                            >
                                                <div></div>
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                            <!-- 预设版式 -->
                            <div class="preset_table_contain">
                                <p>表格样式</p>
                                <ul>
                                    <li v-for="(item,index) in table_preset_list" :key="index" @click="preset_table_style(item.table)" v-bdtongji="`编辑器-功能区-编辑功能-顶部-表格-样式|PC-统计-功能区-表格-样式`">
                                        <img :src="item.image">
                                    </li>
                                </ul>
                            </div>
                            <!-- 自定义生成表格 -->
                            <div class="customize_table_contain" v-if="table_tool_type === 'customize'">
                                <div class="customize_modal">
                                    <div class="header">
                                        <span class="title">自定义表格</span>
                                    </div>
                                    <div class="body">
                                        <div class="label">
                                            <base-icon class="iconhangshu"></base-icon>
                                            <span>行数</span>
                                        </div>
                                        <div class="row_edit input_edit">
                                            <input type="number" id="table_td" ref="table_row" class="row_edit input_table_row" maxlength="2" value="3" @change="check_table_customize_value($event,'row')">
                                            <div class="gradation_arrow">
                                                <button class="add_btn" @mousedown="change_table_value('add','row')"></button>
                                                <button class="reduce_btn" @mousedown="change_table_value('reduce','row')"></button>
                                            </div>
                                        </div>
                                        <div class="label">
                                            <base-icon class="iconlieshu"></base-icon>
                                            <span>列数</span>
                                        </div>
                                        <div class="column_edit input_edit">
                                            <input type="size" id="table_tl" ref="table_column" class="input_table_column" maxlength="2" value="3" @change="check_table_customize_value($event,'column')">
                                            <div class="gradation_arrow">
                                                <button class="add_btn" @mousedown="change_table_value('add','column')"></button>
                                                <button class="reduce_btn" @mousedown="change_table_value('reduce','column')"></button>
                                            </div>
                                        </div>
                                        <p class="value_error_tip">{{table_customize_error_tip}}</p>
                                    </div>
                                    <div class="footer">
                                        <button class="cancel_button" @click="change_table_tool('draw')">取消</button>
                                        <button class="sure_button" type="button" @click="build_table" :disabled="table_customize_disabled" v-bdtongji="`PC-统计-功能区-表格-自定义`">生成表格</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </transition>
        </div>
        <!-- 图表绘制工具 -->
        <div class="child_panel chart_panel">
            <button class="create_tool_btn" @click="toggle_tool_status('chart')" v-bdtongji="`编辑器-功能区-编辑功能-顶部-图表`">
                <base-icon class="icontubiao"></base-icon>
                <span>图表</span>
            </button>
            <transition name="modal-fade">
                <div class="panel-modal" v-if="create_tool_type === 'chart'">
                    <div class="panel-modal-wrapper">
                        <div class="panel-header">
                            <span>图表样式</span>
                        </div>
                        <div class="panel-content">
                            <div class="chart-item" v-for="(value, key) in chart_class" :key="key"  @click="build_chart(key)"  v-bdtongji="`编辑器-功能区-编辑功能-顶部-图表-${value.name}|PC-统计-功能区-图表-${value.name}-插入`">
                                <base-icon :class="value.icon"></base-icon>
                                <span>{{value.name}}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </transition>
        </div>
        <!-- 形状颜色滤镜 -->
        <svg style="visibility: hidden" width="0" height="0" xmlns="http://www.w3.org/2000/svg"><defs><filter id="filter_c1c9d7"><feColorMatrix type="matrix" values="0 0 0 0 0.7568627450980392 0 0 0 0 0.788235294117647 0 0 0 0 0.8431372549019608 0 0 0 1 0"/></filter></defs></svg>
        <svg style="visibility: hidden" width="0" height="0" xmlns="http://www.w3.org/2000/svg"><defs><filter id="filter_97a1b1"><feColorMatrix type="matrix" values="0 0 0 0 0.592156862745098 0 0 0 0 0.6313725490196078 0 0 0 0 0.6941176470588235 0 0 0 1 0"/></filter></defs></svg>
    </div>
</template>

<script>
    import table_preset from '@/assets/pc/json/TablePreset.json';
    import font_family_array from '@/assets/font/fontFamily.js';
    import opt_factory from '@/assets/pc/js/opt/opt_factory.js';
    import {edit_shape_json, common_use_list} from '@/assets/pc/js/opt/shape_edit_opt.js';
    import {line_element_list} from '@/assets/pc/js/opt/line_edit_opt.js';

    export default{
        props:[
        ],
        inject: ['EditView'],
        data(){
            return {
                create_tool_type: null,     // 绘制工具类型
                /* 素材通用相关 start */
                material_page_number: 1,        // 当前素材列表页码
                material_total_pages: 1,        // 素材列表总页数
                material_can_insert: true,      // 插入素材标识
                image_position_obj:{
                    height:0,
                    left:0,
                    right:0,
                },                             //瀑布流图片位置信息
                /* 素材通用相关 end */
        
                /* 文本绘制工具相关 start */
                text_tool_type:'style',                  // 当前文本绘制类型
                text_style_list:{
                    'normal':[
                        {name:'普通文本', content:'', key:'body', size:32, weight:'normal', color:'#505050', use_theme_color: true}
                    ],
                },                                       // 文字预设版式列表
                show_art_list: false,                    // 艺术字列表显示
                text_art_list: font_family_array.art,    // 艺术字列表
                /* 文本绘制工具相关 end */

                /* 形状绘制工具相关 start */
                shape_recommend_type: null,        // 推荐形状类型
                shape_recommend_list: {},          // 推荐形状列表对象
                common_element_list: common_use_list,                    // 常用绘制形状列表
                shape_other_list:[],               // 其他形状列表
                /** 线条内置样式列表 */
                line_element_list: line_element_list,
                shape_line_list: [
                    {id:15935},
                    {id:15934},
                    {id:15933},
                    {id:15947},
                    {id:15946},
                    {id:15945},
                    {id:15921},
                    {id:15932},
                    {id:15941},
                    {id:15954},
                    {id:15951},
                    {id:15930},
                ],                                 // 线条素材分类id
                // shape_type_list: replace_shape_json,
                /* 形状绘制工具相关 end */

                /* 表格绘制工具相关 start */
                table_tool_type: 'draw',                // 当前表格绘制类型
                table_draw_dom: {
                    tr:[1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
                    td:[1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
                },                                      //绘制表格画板节点 10*10
                table_draw_num:{row:0,column:0},        //当前绘制表格行列数
                table_preset_list: table_preset.table_preset_list,   //表格预设版式列表
                table_customize_disabled: false,         // 自定义添加表格标识
                table_customize_error_tip: '',          // 自定义表格错误提示
                /* 表格绘制工具相关 end */

                /* 图表绘制工具相关 start */
                chart_class: {
                    'pie': {
                        class: 'edit-ico-pie_2',
                        icon: 'iconbingzhuangtu',
                        name: '饼状图',
                    },
                    'line': {
                        class: 'edit-ico-line_2',
                        icon: 'iconquxiantu',
                        name: '曲线图',
                    },
                    'bar': {
                        class: 'edit-ico-bar_V_2',
                        icon: 'icontiaoxingtu',
                        name: '条形图',
                    },
                    
                    'funnel': {
                        class: 'edit-ico-funnel_2',
                        icon: 'iconloudoutu',
                        name: '漏斗图',
                    },
                },                                  // 图表类
                /* 图表绘制工具相关 end */

                
            }
        },
        created () {
            let that = this;
            // 整理内置形状列表
            let resource_recommend_shape = edit_shape_json || {};
            let shape_recommend_list = {};
            for (let item in resource_recommend_shape) {
                let material = resource_recommend_shape[item].material;
                let shape = resource_recommend_shape[item].shape;
                // 类型分类，有则直接push
                if (shape_recommend_list[material]) {
                    shape_recommend_list[material].push(shape);
                } else {
                    let material_arr = [];
                    material_arr.push(shape);
                    shape_recommend_list[material] = material_arr;
                }
            }
            that.shape_recommend_list = shape_recommend_list;
        },
        methods:{
            /**
             * 通用方法
             */
            // 工具面板类型切换
            toggle_tool_status: function(type){
                if(type === 'text' ) this.show_art_list = false;
                this.create_tool_type = (type && type === this.create_tool_type) ? null : type;
            },
            // 清空工具面板状态
            clear_tool_status: function(){
                // 绘制工具类型
                this.create_tool_type = null;

                /* 素材通用相关 */
                this.material_page_number = 1;       // 当前素材列表页码
                this.material_can_insert = true;     // 插入素材标识

                // 当前文本绘制类型
                this.text_tool_type = 'style';
                this.image_position_obj = {height:0,left:0,right:0,};

                /* 形状绘制工具相关 */
                this.shape_recommend_type = null;        // 推荐形状类型

                /* 表格绘制工具相关 */
                this.table_tool_type = 'draw';              // 当前表格绘制类型
                this.table_customize_disabled = false;      // 自定义添加表格标识
                this.table_customize_error_tip = '';        // 自定义表格错误提示
            },

            /**
             * 素材相关通用方法
             */
            // 插入素材
            insert_material:function(id){
                let that = this,option,$page = $('.page_contain .edit_page'); //系统素材
                if(!id){
                    return that.$toast("插入失败",1000);
                }
                // 未保存文档时插入模板
                if(that.$parent.modal_id || that.$parent.document_info.id === '' || that.$parent.page_info.uuid == null){
                    that.$parent.show_save_tips = true;
                    return;
                }
                if(that.material_can_insert) {
                    that.material_can_insert = false;
                    that.$axios.get('/api/material/detail/',{params:{mid:id}})
                        .then(function(data){
                            let code = data.data.code,
                                message = data.data.content,
                                html = data.data.data.html,
                                type = data.data.data.type,
                                image = data.data.data.image;
                            if(code === "2"){
                                that.$parent.ele_cancel_checked();
                                that.create_tool_type = null;
                                if (type === 'svg') {
                                    let params = JSON.parse(html);
                                    if (params.length === 1) {
                                        let param = params[0];
                                        let ratio = Number(param.height) / Number(param.width);
                                        param.width = 112;
                                        param.height = param.width * ratio;
                                    }
                                    that.$parent.element_preinsert_ready(params);
                                }
                            }else{
                                console.error(message);
                                that.$toast("插入失败",1000);
                            }
                            // 防止鼠标连续点击，接口请求完素材库还没关闭的情况下
                            setTimeout(function(){
                                that.material_can_insert = true;
                            }, 500);
                        })
                        .catch(function(info){
                            console.error(info);
                            that.$toast("插入失败",1000);
                            setTimeout(function(){
                                that.material_can_insert = true;
                            }, 500);
                        });
                } else {
                    that.$toast("正在插入素材",1000);
                }
            },
            // 图片瀑布流位置计算
            image_position_calc: function(list){
                let that = this,
                    width = $('.panel_content').width() / 2,
                    list_left_height = 0,
                    list_right_height = 0;
                list.forEach(function(item,index){
                    let item_attr_width = 0, item_attr_height = 0;
                    let row = Math.ceil((index+1)/2),
                        image_w = item.imageWidth,
                        image_h = item.imageHeight;
                    if(parseInt((index+1)/2) == row){
                        item.right = 0;
                        item.left = 'auto';
                    }else{
                        item.left = 0;
                        item.right = 'auto';
                    }
                    let ratio = Number(image_w) / Number(image_h),
                        height = width / ratio;
                    if(index > 1){
                        item.height = height;
                        item.top = list[index-2].top + list[index-2].height + 12;
                    }else if(index === 0){
                        item.top = that.image_position_obj.left;
                        item.height = height;
                    }else{
                        item.top = that.image_position_obj.right;
                        item.height = height;
                    }
                    // 计算容器最大高度
                    if(index === 0 || index % 2 === 0){
                        list_left_height = list_left_height + height
                    }else{
                        list_right_height = list_right_height + height;
                    }
                    // 计算左右两侧最后的top值
                    if(index === list.length - 2){
                        that.image_position_obj.left = Number(item.top) + height + 12;
                    }else if(index === list.length - 1){
                        that.image_position_obj.right = Number(item.top) + height + 12;
                    }
                })
                if(list_left_height > list_right_height){
                    that.image_position_obj.height = Number(that.image_position_obj.height) + list_left_height;
                }else{
                    that.image_position_obj.height = Number(that.image_position_obj.height) + list_right_height;
                }
                return list;
            },
            // webp图片处理
            preview_towebp: function(imglist){
                //  将canvas转换成base64图片码来检测是否支持webp，不支持的返回的是png
                let check_webp = document.createElement('canvas').toDataURL('image/webp').indexOf('data:image/webp') >= 0;
                // x-oss-process参数阿里云存储图片处理 webp 格式
                let oss_process = check_webp ? ['image', 'resize,m_lfit,w_600', 'format,webp'] : ['image', 'resize,m_lfit,w_600', 'format,png'];
                let url_params = '?x-oss-process=';
                for(let item in imglist) {
                    let url = imglist[item].image;
                    if (!url) continue;
                    if (url.indexOf(url_params) >= 0) {
                        imglist[item].image = url.substring(0, url.indexOf(url_params)) + url_params + oss_process.join('/');
                    } else {
                        imglist[item].image = url + url_params + oss_process.join('/');
                    }
                }
                return imglist;
            },

            /**
             * 文本工具通用方法
             */
            // 文本预设版式参数设置
            set_draw_text: function(item){
                let that = this,
                    option = opt_factory.init_opt('text'),
                    obj = utils.deepClone(item);
                // 应用主题字体色
                if(obj.use_theme_color){
                    obj.color = option.using_data.color;
                }
                // 背景数据处理
                if (obj.background) {
                    obj.background = {
                        type: 'color',
                        color: obj.background,
                        image: null,
                    };
                }
                let base_opt =  opt_factory.init_opt('group').init();
                obj.size = option.using_data.size || Math.round(base_opt.getPageShortSide() / base_opt.page_font_size_scale); // 画布短边除以默认比例
                obj.family = option.using_data.family || '';
                option.using_data.text_obj = obj;
                that.$parent.page_state = 'create_text';
                // 清空工具面板状态
                that.clear_tool_status();
            },
            // 插入艺术字
            use_art_material: function (item) {
                let that = this;
                // 取消选中
                that.$parent.ele_cancel_checked();
                // 清空工具面板状态
                that.clear_tool_status();
                // 生成元素
                let option = opt_factory.init_opt('text');
                let template = option.fn.clone_object(option.template);
                template.id = option.fn.uuid();
                template.width = option.fn.unit_2_px($(item.content).css('font-size')) * 1.2 * 5;
                template.height = 228;
                template.content = item.content;
                template.text_align = 'center';
                template = that.$parent.ele_build_before_format(template);
                let $ele = option.ele_2_dom(template);
                // 插入元素
                $ele.appendTo(option.get_canvas_page());
                // 居中元素
                option.fit_dom_offset($ele);
                that.$parent.set_ele_checked($ele);
            },
            

            /**
             * 形状工具通用方法
             */
            get_shape_other_list: function() {
                let that = this;
                if(that.shape_other_list.length !== 0) return;
                that.$axios.get('/api/material/list/',{params:{cid:22,searchValue:'',pageNumber:that.material_page_number,pageSize:100}})
                .then(function(data){
                    if(data.data.code === '2'){
                        that.shape_other_list = data.data.data.dataList;
                        that.material_page_number = data.data.data.pageNumber;
                        that.material_total_pages = data.data.data.totalPages;
                    }
                })
            },
            // 打开插入面板
            openInsert(){
                this.create_tool_type = null;
                this.EditView.openMaterialModal('insert');
            },
            // 绘制方法
            setDraw(item){
                item.type === 'line' ? this.set_draw_line(item) : this.set_draw_shape(item);
            },
            // 设置形状绘制参数
            set_draw_shape: function(item){
                // 错误状态判断
                if(!item || item.type !== 'shape' || !item.d) return false;
                let that = this,
                    option = opt_factory.init_opt('shape'),
                    data = option.fn.clone_object(option.using_data);
                data.d = typeof item.d === 'string' ? [item.d] : item.d;
                data.width = item.width;
                data.height = item.height;
                data.shape_editor = item.shape_editor;
                data.border_w = item.border_w;
                data.border_c = item.border_c;
                data.border_s = item.border_c;
                data.background = item.background;
                option.using_data = data;
                that.$parent.page_state = 'create_shape';
                // 清空工具面板状态
                that.clear_tool_status();
            },
            
            /**
             * 线条工具通用方法
             */
            // 插入线条
            set_draw_line: function(item){
                let that = this;
                let option = opt_factory.init_opt('line');
                option.using_data = {
                    border_c: that.$parent.document_info.shapeColor ? that.$parent.document_info.shapeColor : '#000000',
                    border_s: item.border_s,
                    path_l: item.path_l,
                    path_r: item.path_r,
                    line_class: item.line_class,
                }
                that.$parent.page_state = 'create_line';
                // 清空工具面板状态
                that.clear_tool_status();
            },

            /**
             * 表格工具通用方法
             */
            // 表格绘制类型切换
            change_table_tool: function(type){
                this.table_tool_type = type;
                this.table_customize_disabled = false;
                this.table_customize_error_tip = '';
            },
            // 绘制表格
            draw_table: function(column = 0, row = 0){
                let that = this;
                this.table_draw_num.column = Number(column);
                this.table_draw_num.row = Number(row);
            },
            remove_draw_table: function () {
                this.table_draw_num = {
                    column: 0,
                    row: 0,
                };
            },
            // 表格自定义参数校验
            check_table_customize_value: function(e,type){
                let that = this,
                    value = e.target.value,
                    reg = /^\d+$/;
                that.table_customize_disabled = true;
                if (!reg.test(value) || value <= 0) {
                    return that.table_customize_error_tip = '*请输入正确的行列数噢!';
                }
                if (type === 'row' && value > 30){
                    return that.table_customize_error_tip = '*表格行数值不超过30,列数值不超过20';
                }
                if (type === 'column' && value > 20){
                    return that.table_customize_error_tip = '*表格行数值不超过30,列数值不超过20';
                }
                that.table_customize_error_tip = '';
                that.table_customize_disabled = false;
            },
            // 增/减自定义表格行列数
            change_table_value: function(data,type){
                let that = this,
                    reg = /^\d+$/,
                    _ref = type === 'row' ? 'table_row' : 'table_column',
                    value = +that.$refs[_ref].value;
                if (!reg.test(value) || value < 0) that.table_customize_error_tip = '*请输入正确的行列数噢!';
                if(data === 'reduce'){
                    if(value <= 1){
                        that.table_customize_error_tip = '*表格行数值不低于1,列数值不低于1';
                        that.$refs[_ref].value = 1;
                    }else{
                        that.table_customize_error_tip = '';
                        +that.$refs[_ref].value--;
                    }
                }
                if(data === 'add'){
                    if(value === 30){
                        that.table_customize_error_tip = '*表格行数值不超过30,列数值不超过20';
                    }else{
                        that.table_customize_error_tip = '';
                        +that.$refs[_ref].value++;
                        that.$refs[_ref].value === 30;
                    }
                }
            },
            // 生成表格
            build_table:function(){
                let that = this;
                if (that.table_customize_disabled) return;
                // 清空工具面板状态
                that.clear_tool_status();
                let data = {
                    type: 'table',
                    x: that.table_draw_num.row || that.$refs.table_row.value,
                    y: that.table_draw_num.column || that.$refs.table_column.value,
                };
                let init_size = opt_factory.init_opt('table').get_init_size(data.x, data.y);
                data.width = init_size.table[0] / 2;
                data.height = init_size.table[1] / 2;
                that.$parent.element_preinsert_ready([data]);
                that.remove_draw_table();
            },
            // 插入预设表格
            preset_table_style: function(param){
                let that = this;
                // 清空工具面板状态
                that.clear_tool_status();
                that.$parent.element_preinsert_ready([param]);
            },

            /**
             * 图表工具通用方法
             */
            // 生成图表
            build_chart: function (type) {
                let that = this;
                // 清空工具面板状态
                that.clear_tool_status();
                // 进入预插入状态
                that.$parent.element_preinsert_ready([{
                    type: 'chart',
                    width: 336,
                    height: 224,
                    chart_style: type,
                    chart_data: opt_factory.init_opt('chart').format_data(type),
                }]);
            },
        }
    }
</script>

<style lang="less" scoped>
    .create_tool_contain{
        display: flex;
        align-items: center;
        height:100%;
    }
    // 通用样式
    .child_panel{
        position:relative;
        margin-right: 30px;
        .create_tool_btn{
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            .base-icon{
                font-size: 14px;
                color: #aaaaaa;
            }
            span{
                margin-top: 5px;
                font-size: 12px;
                color: #aaaaaa;
            }
            &:hover{
               .base-icon{
                    color: #ffffff;
                }
                span{
                    color: #ffffff;
                }
            }
        }
        .panel_modal{
            position:absolute;
            top:42px;
            left:-10px;
            width:406px;
            z-index:100;
            .panel_modal_wrapper{
                width:100%;
                padding:10px 25px 25px;
                background-color: #ffffff;
                border-radius:6px;
                box-shadow: 0px 15px 18px 0px rgba(0, 0, 0, 0.08);
                border: solid 1px #e5e5e7;
                &:before{
                    content:"";
                    position:absolute;
                    top:-9px;
                    left:20px;
                    width:0;
                    height:0;
                    border-width:5px;
                    border-style:solid;
                    border-color:transparent transparent #ffffff transparent;
                }
            }
            .panel_head{
                margin-bottom:20px;
                border-bottom:1px solid #eeeeee;
                span{
                    padding: 10px 0;
                    display:inline-block;
                    vertical-align:middle;
                    height:100%;
                    margin-right:25px;
                    color:#444444;
                    font-size:12px;
                    cursor:pointer;
                    &.check,
                    &:hover{
                        color: var(--mainColor);
                    }
                }
            }
            .panel_content{
                width:calc(100% + 25px);
                max-height:430px;
                padding-right:25px;
                overflow-x:hidden;
                overflow-y:auto;
            }
            li{
                cursor:pointer;
            }
        }

        // 滚动条样式
        ::-webkit-scrollbar-track{
            background-color:#fff;
        }
        ::-webkit-scrollbar-thumb{
            background-color:#d4ddee;
            border-radius:3px;
            cursor:pointer;
            &:hover{
                opacity:.8;
            }
        }
        ::-webkit-scrollbar-thumb:active{
            background-color:#d4ddee;
        }
    }
    // 文本绘制工具
    .text_panel{
        .panel_modal{
            width: 160px;
            .panel_modal_wrapper{
                padding: 5px 0;
            }
        }       
        .text_style_contain{
            .text_style_list{
                width: 100%;
                li{
                    padding-left: 15px;
                    display: flex;
                    align-items: center;
                    width: 100%;
                    height: 45px;
                    font-size: 12px;
                    color: #333333;
                    user-select: none;
                    cursor: pointer;
                    &:hover{
                        background: #f4f4f4;
                    }
                    .base-icon{
                        margin-right: 10px;
                        font-size: 20px;
                    }
                }
            }
        }
        .art_word_btn,.transshape_word_btn{
            padding-left: 15px;
            position: relative;
            width: 100%;
            height: 45px;           
            line-height: 45px;
            font-size: 12px;
            color: #333333;
            i{
                margin-right: 10px;
            }
            &::after{
                content: "";
                position: absolute;
                top: 50%;
                right: 8px;
                transform: translateY(-50%);
                width: 0;
                height: 0;
                border-width: 4px;
                border-style: solid;
                border-color: transparent transparent transparent #7c88a1;
            }
        }
        .art_word_btn{
            display: flex;
            align-items: center;
            cursor: pointer;
            .base-icon{
                margin-right: 10px;
                font-size: 20px;
            }
            &:hover{
                background-color: #f4f4f4;
            }
            .text_art_contain{
                position: absolute;
                top: -100px;
                left: 100%;
                padding:18px 11px 18px 7px;
                width: 320px;
                height: 478px;
                background-color: #ffffff;
                box-shadow: 0px 4px 9px 0px rgba(203, 205, 210, 0.34);
                border-radius: 4px;
                border: solid 1px #dbdbdb;
                overflow-x: hidden;
                overflow-y: scroll;
                li {
                    display: inline-block;
                    vertical-align:top;
                    width:91px;
                    height:56px;
                    margin: 0 10px 10px 0;
                    padding:12px 0 10px;
                    background:#eaedf4;
                    text-align:center;
                    cursor: pointer;
                    &:hover{
                        transform: scale(1.05);
                    }
                    &:nth-child(3n) {
                        margin-right:0;
                    }
                    img {
                        display:inline-block;
                        vertical-align:top;
                    }
                }
                &::after{
                    content: '';
                    position: absolute;
                    bottom:0;
                    left:0;
                    width: 320px;
                    height: 18px;
                    background-image: linear-gradient(180deg, transparent 0%, #ffffff 100%), linear-gradient(transparent, transparent);
                    background-blend-mode: normal, normal;
                }
            }
        }
        .transshape_word_btn{
            &:hover{
                background-color: #e6e9f0;
            }
        }
        .text_group_contain{
            width:calc(100% + 10px);
            height:100%;
            padding-top:10px;
            .group_wrapper{
                position:relative;
                width:100%;
            }
            .text_group_item{
                position: absolute;
                width: calc(50% - 5px);
                margin: 0 0 10px;
                padding:3px;
                border: 1px solid #e6e9f0;
                cursor:pointer;
                &:hover{
                    border-color:var(--mainColor);
                }
                img{
                    width:100%;
                    height:100%;
                }
            }
        }
    }
    // 形状绘制工具
    .shape_panel{
        .panel-modal{
            position: absolute;
            top: calc(100% + 10px);
            left: 50%;
            transform: translateX(-50%);
            z-index: 100;
            .panel-modal-wrapper{
                padding: 5px;
                width: 140px;
                background: #ffffff;
                border: 1px solid #eeeeee;
                border-radius: 3px;
                box-shadow: 0px 2px 20px 0px rgba(180,187,199,0.20);
                .panel_content{
                    width: 100%;
                    ul{
                        display: flex;
                        flex-direction: column;
                        width: 100%;
                        li{
                            margin-top: 5px;
                            display: flex;
                            align-items: center;
                            width: 100%;
                            height: 28px;
                            color: #444444;
                            cursor: pointer;
                            &:hover{
                                background: #f4f4f4;
                            }
                            .icon{
                                margin-left: 15px;
                                display: flex;
                                width: 20px;
                                height: 20px;
                                .base-icon{
                                    margin: auto;
                                }
                            }
                            
                            span{
                                margin-left: 15px;
                                font-size: 12px;
                            }

                            &.more .icon .base-icon{
                                font-size: 12px;
                            }
                        }
                    }
                }
            }
        }
    }
    // 表格绘制工具
    .table_panel{
        .panel_modal{
            width: 310px;
            .panel_modal_wrapper{
                width: 100%;
                padding: 10px 0;
                .panel_head{
                    margin-left: 20px;
                    margin-bottom: 0;
                    display: flex;
                    justify-content: space-between;
                    width: 268px;
                    span{
                        margin: 0;
                        &.check{
                            color:var(--mainColor);
                            border:none;
                            &:hover{
                                opacity:1;
                            }
                        }
                    }
                }
                // 绘制表格
                .panel_content{
                    padding: 10px 0;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    width: 100%;
        
                    .draw_table_contain{
                        margin-left: 5px;
                        width: 278px;
                        display: flex;
                        justify-content: center;
                        table{
                            width: 100%;
                            border-spacing: 5px 5px;
                            td{
                                width: 23px;
                                height: 23px;
                                line-height: 23px;
                                background-color: #f7f7f7;
                                cursor: pointer;
                            }
                            div{
                                width:100%;
                                height:100%;
                                border: 1px solid #dddddd;
                                border-radius: 6px; 
                            }
                            .selected div{
                                background: rgba(0,92,255,0.50);
                                border: 1px solid #005cff;
                            }
                        }
                    }
                    // 表格预设版式
                    .preset_table_contain{
                        margin-left: 10px;
                        width: 268px;
                        p{
                            margin-bottom:10px;
                            padding: 10px 0;
                            color:#707b8e;
                            font-size:12px;
                            border-bottom:1px solid #eeeeee;
                        }
                        span{
                            display:inline-block;
                            vertical-align:middle;
                            height:100%;
                            margin-right:15px;
                            color:#707b8e;
                            font-size:12px;
                        }
                        li{
                            display:inline-block;
                            vertical-align:middle;
                            width:calc(100%/3 - 4px);
                            margin:0 6px 5px 0;
                            &:nth-child(3n){
                                margin-right:0;
                            }
                            &:hover{
                                opacity:.7;
                            }
                        }
                        img{
                            width:100%;
                        }
                    }
                }
            }
        }
        
        // 自定义弹窗
        .customize_table_contain{
            position: fixed;
            top: 0;
            left: 0;
            z-index:999;
            width: 100%;
            height: 100%;
            background-color: rgba(0, 0, 0, 0.502);
            font-size: 0;
            color: #666666;
            text-align: center;
            &:after{
                content: "";
                display: inline-block;
                width: 0;
                height: 100%;
                vertical-align: middle;
            }
            .customize_modal{
                position:relative;
                display:inline-block;
                width: 420px;
                height: 240px;
                background:#ffffff;
                border-radius:6px;
                vertical-align:middle;
                overflow: hidden;
            }
            .header{
                padding-left: 20px;
                width: 100%;
                height: 40px;
                line-height: 40px;
                text-align: left;
                font-size: 12px;
                color: #444444;
                background: #f4f4f4;
            }
            .body{
                position: relative;
                padding-top: 50px;
                display: flex;
                justify-content: center;
                font-size: 0;
                .label{
                    margin-left: 20px;
                    margin-right: 20px;
                    display: flex;
                    align-items: center;
                    color: #444444;
                    .base-icon{
                        font-size: 24px;
                    }
                    span{
                        margin-left: 8px;
                        font-size: 12px;
                    }
                }
                .input_edit{
                    margin-right: 20px;
                    position:relative;
                    display:inline-block;
                    vertical-align:middle;
                    width: 80px;
                    height: 30px;
                    line-height: 30px;
                    border:1px solid #dddddd;
                    border-radius: 6px;
                    background:#ffffff;
                    &.column_edit{
                        margin-right:0;
                    }
                    input{
                        padding-left: 20px;
                        display:block;
                        width:calc(100% - 20px);
                        height:100%;
                        line-height:34px;
                        color:#797979;
                        font-size:14px;
                    }
                    // 箭头增减
                    .gradation_arrow{
                        position:absolute;
                        right:0;
                        top:0;
                        width:20px;
                        height:100%;
                        text-align:center;
                        button{
                            content: "";
                            display: block;
                            width: 0;
                            height: 0;
                            margin:0 auto;
                            border-width: 4px;
                            border-style: solid;
                            cursor: pointer;
                            &.add_btn{
                                border-color:transparent transparent #999999 transparent;
                                &:hover{
                                    border-color:transparent transparent var(--mainColor) transparent;
                                }
                            }
                            &.reduce_btn{
                                margin-top:12px;
                                border-color:#999999 transparent transparent transparent;
                                &:hover{
                                    border-color:var(--mainColor) transparent transparent transparent;
                                }
                            }
                        }
                    }
                }
                .value_error_tip{
                    position: absolute;
                    top: calc(100% + 5px);
                    left: 50%;
                    transform: translateX(-50%);
                    font-size: 12px;
                    color:#ff7a7a;
                }
            }
            .footer{
                margin-top: 55px;
                display: flex;
                justify-content: center;
                width: 100%;
                font-size:0;
                button{
                    margin: 0 5px;
                    padding: 8px 20px;
                    font-size: 12px;
                    border-radius: 5px;
                    text-align: center;
                    &:hover{
                        opacity: .8;
                    }
                }
                .cancel_button{
                    color: #999999;
                    background: #eeeeee;
                }
                .sure_button{
                    color: #ffffff;
                    background:var(--mainColor);
                }
            }
        }
    }
    // 图表绘制工具
    .chart_panel {
        .panel-modal{
            position: absolute;
            top: calc(100% + 10px);
            left: 50%;
            transform: translateX(-50%);
            z-index: 100;
            .panel-modal-wrapper{
                padding: 0 20px;
                height: 285px;
                background: #ffffff;
                border: 1px solid #eeeeee;
                border-radius: 6px;
                box-shadow: 0px 2px 20px 0px rgba(180,187,199,0.20);
                .panel-header{
                    width: 180px;
                    height: 40px;
                    line-height: 40px;
                }
                .panel-content {
                    font-size: 0;
                    .chart-item{
                        margin-bottom: 10px;
                        display: flex;
                        align-items: center;
                        width: 180px;
                        height: 48px;
                        background: #ffffff;
                        border: 1px solid #dddddd;
                        border-radius: 6px;
                        cursor: pointer;
                        &:hover{
                            background: #f4f4f4;
                        }
                        .base-icon{
                            margin-left: 25px;
                            color: #666666;
                        }
                        span{
                            margin-left: 15px;
                            font-size: 12px;
                            color: #444444;
                        }
                    }
                }
            }
        }
    }
</style>