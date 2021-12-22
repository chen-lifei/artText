<template>
    <div class="display_contain"
        @scroll="page_mouse_wheel">
        <!--演示主体-->
        <div class="preview_panel">
            <!-- 头部 -->
            <div class="history_head">
                <span>操作记录</span>
                <button @click="close" v-if="show_opt_list">退出</button>
            </div>
            <!--非全屏 - 内容面板-->
            <div class="preview_inner" :style="{width: content_w +'px',height:content_h + 'px'}">
                <div class="body">
                    <!-- （通用渲染） -->
                    <div class="page_list">
                        <div class="doc_page"
                            v-for="(item, index) in document_page_list"
                            :key="index"
                            :style="{background:item.background}">
                            <svg_modal ref="svg_modal"
                                :svg_w="svg_preview_template.w"
                                :svg_h="svg_preview_template.h"
                                :svg_view="svg_preview_template.view"
                                :document="document_info"
                                :page_info="item"
                                :lazyshow="Math.abs(index - page_number) < 3"
                            ></svg_modal>
                        </div>
                    </div>
                </div>
            </div>
            <div class="all_page" ref="out_full_bottom" @mousewheel.stop>
                <div class="bottom_list"
                    v-for="(item, index) in document_page_list"
                    :key="index"
                    :class="{checked: index === page_number}"
                    @click="set_page(index)"
                >
                    <div class="wrapper">
                        <span class="masking" :style="{height:preview_pages_template.h + 42 +'px'}"></span>
                        <span>{{index + 1}}</span>
                        <div class="list_inner" :style="{height:`${preview_pages_template.view[3] * (preview_pages_template.h / preview_pages_template.view[3]) + 4}px`}">
                            <svg_modal ref="svg_modal"
                                    :svg_w="preview_pages_template.w"
                                    :svg_h="preview_pages_template.h"
                                    :svg_view="preview_pages_template.view"
                                    :document="document_info"
                                    :page_info="item"
                                    :mode="`thumbnail`"
                            ></svg_modal>
                        </div>
                    </div>
                    <div class="title">{{item.title === null ? '未添加标题' : item.title}}</div>
                </div>
            </div>
            <!-- 操作记录 -->
            <div v-if="show_opt_list" class="history_modal">
                <div class="history_list">
                    <!-- 今日 -->
                    <div class="today_list" v-if="today_action_list.length > 0">
                        <span class="today_text">今天（当前）</span>
                        <div class="list" 
                            :class="{'current': item.documentAddBackup === current_version}"
                            v-for="(item, index) in today_action_list" 
                            :key="index"
                            @click.stop="remote_recovery_preview(item.documentAddBackup)">
                            <span class="time">{{item.createDate}}</span>
                            <div class="action_content" v-html="item.optDesc"></div>
                            <div v-if="item.documentAddBackup" class="history_back" @click.stop="remote_recovery_submit(item.documentAddBackup)">
                                <i class="back_history"></i>
                                <span>还原</span>
                            </div>
                        </div>
                    </div>
                    <!-- 月份 -->
                    <div class="month_list time_list" 
                        v-for="(value, key) in this_year_action_list" 
                        :key="key"
                        :class="{'show':key}"
                    >
                        <span class="month" @click="open_time_list($event)">{{key}}</span>
                        <div class="list" 
                            :class="{'current': item.documentAddBackup === current_version}"
                            v-for="(item, index) in value" 
                            :key="index"
                            @click.stop="remote_recovery_preview(item.documentAddBackup)">
                            <span class="time">{{item.createDate}}</span>
                            <div class="action_content" v-html="item.optDesc"></div>
                            <div v-if="item.documentAddBackup" class="history_back" @click.stop="remote_recovery_submit(item.documentAddBackup)">
                                <i class="back_history"></i>
                                <span>还原</span>
                            </div>
                        </div>
                    </div>
                    <!-- 今年之前 -->
                    <div class="last_year time_list"
                        v-for="(value, key) in last_year_list"
                        :key="key"
                        :class="{'show':key}"
                        >
                        <span class="year" @click="open_time_list($event)">{{key}}</span>
                        <div class="list" 
                            :class="{'current': item.documentAddBackup === current_version}"
                            v-for="(item,index) in value" :key="index" 
                            @click.stop="remote_recovery_preview(item.documentAddBackup)">
                            <span class="time">{{item.createDate}}</span>
                            <div class="action_content" v-html="item.optDesc"></div>
                            <div v-if="item.documentAddBackup" class="history_back" @click.stop="remote_recovery_submit(item.documentAddBackup)">
                                <i class="back_history"></i>
                                <span>还原</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<style lang="less" scoped>
    @import url("../../assets/pc/css/common.css");
    @import url('../../assets/pc/css/edit.css');
    @background_image:url(../../assets/pc/images/display/display_sp.png) no-repeat;

    .display_contain{
        min-width:1240px;
    }
    .history_head{
        width: 100%;
        height: 40px;
        line-height: 40px;
        text-align: left;
        padding: 0 13px;
        background-color: #262728;
        span{
            font-size: 14px;
            color: #8e969f;
            font-weight: bold;
            cursor: default;
            &::after{
                display: inline-block;
                content: '';
                width: 1px;
                height: 13px;
                margin:15px 0 0 13px;
                background: #464f5b;
                vertical-align: top;
            }
        }
        button{
            float: right;
            width: 48px;
            height: 24px;
            margin-top: 8px;
            color: #ffffff;
            font-size: 14px;
            background-color: var(--mainColor);
            border-radius: 4px;
            &:hover{
                opacity: .8;
            }
        }
    }
    .preview_panel{
        position:fixed;
        top:0;
        left:0;
        z-index:900;
        width:100%;
        height:100%;
        line-height:initial;
        background:#e9e9e9 url(../../assets/common/images/logo_watermark.png) repeat;
        overflow:hidden;
        text-align:center;
        &:after{
            content:'';
            position:relative;
            display:inline-block;
            width:0;
            height:100%;
            vertical-align:middle;
        }
        .close{
            position:absolute;
            top:-58px;
            right:-51px;
            display:inline-block;
            width:102px;
            height:102px;
            border-radius:102px;
            background:rgba(255,255,255,0.5);
            &:before{
                content:'';
                position:absolute;
                bottom:19px;
                left:25px;
                display:inline-block;
                width:16px;
                height:16px;
                background:url(../../assets/pc/images/common/preview_sp.png) -45px -1px;
                opacity:0.2;
                transition:transform 0.3s;
            }
            &:hover{
                opacity:1;
                &:before{
                    transform:rotate(90deg);
                }
            }
        }
        .preview_inner{
            position:relative;
            display:inline-block;
            line-height:initial;
            vertical-align: middle;
            margin-left: 30px;
        }
        .body{
            position:relative;
            width:100%;
            height: 100%;
            .page_list{
                position:relative;
                width:100%;
                height:100%;
                overflow:hidden;
                perspective:2000;
            }
        }
    }
    .all_page{
        position:absolute;
        left: 0;
        top: 0;
        bottom: 0;
        width:295px;
        height: calc(100% - 40px);
        margin-top: 40px;
        padding: 14px 15px 14px 24px;
        overflow-x: hidden;
        overflow-y: auto;
        flex-direction: column;
        font-size:0;
        display:flex;
        justify-content:flex-start;
        white-space:initial;
        user-select:none;
        background:#f6f6f6;
        touch-action: none;
        z-index:11;
        &::-webkit-scrollbar-thumb{background-color:#dce7ff; border-radius:6px; cursor:pointer;}
        .bottom_list{
            position:relative;
            display:inline-block;
            width: 240px;
            margin: 10px 10px 28px 10px;
            text-align:left;
            .title{
                position: absolute;
                width: 100%;    
                height: 20px;        
                font-size: 14px;
                line-height: 20px;
                overflow: hidden;
                text-overflow: ellipsis;
                white-space: nowrap;
                color: #929db7;
            }
            .list_inner{
                border:2px solid transparent;
                overflow: hidden;
            }
            .wrapper{
                position: relative;
                display:inline-block;
                vertical-align:middle;
                width:100%;
                height:100%;
                &>span:nth-child(2){
                    display:block;
                    width:100%;
                    height:20px;
                    line-height:20px;
                    font-size:14px;
                    margin-left: -9px;
                    color:#a3a3a3;
                }
                span+span{
                    position:absolute;
                    left:-17px;
                    top:0;
                }
            }
            &:after{
                content:"";
                display:inline-block;
                vertical-align:middle;
                width:0;
                height:100%;
            }
            &:before{
                content:'';
                display:block;
                position:absolute;
                top:20px;
                bottom:0;
                left:0;
                right:0;
                z-index:2;
                cursor:pointer;
            }
            &.checked{
                opacity:1;
                .wrapper>span{
                    color:var(--mainColor);
                }
                .wrapper>span:nth-child(1){
                    position: absolute;
                    right: -21px;
                    top: -10px;
                    width: 348px;
                    height: 178px;
                    background: #e3e7ee;
                    cursor: pointer;
                }
                .list_inner{
                    position:relative;
                    border:2px solid var(--mainColor);
                }
            }
            &:last-child{
                &>span{
                    width:calc(100% + 40px);
                }
            }
        }
    }
    .history_modal{
        position: absolute;
        top: 0;
        right: 0;
        width:270px;
        height: calc(100% - 40px);
        margin-top: 40px;
        padding: 23px 0;
        overflow-x: hidden;
        overflow-y:auto;
        background: #ffffff;        
        &::-webkit-scrollbar-thumb{background-color:#dce7ff; border-radius:6px; cursor:pointer;}
        // 今日
        .today_list{
            height: auto;
            margin-bottom: 20px;
            font-size:12px;
            .today_text{
                display: block;
                text-align: left;
                margin-bottom: 16px;
                margin-left: 35px;
                font-weight: 600;
                color: #667280;
            }
            .list{
                position: relative;
                height: 100%;
                padding: 11px 0;
                cursor: pointer;
                &.current{
                    background: #f0f4f8;
                }
                &:hover{
                    background: #f0f4f8;
                    .history_back{
                        display: block;
                    }
                }
                .time{
                    display: block;
                    text-align: left;
                    margin-bottom: 7px;
                    margin-left: 35px;
                    color:#959ea7;
                }
                .action_content{
                    position: relative;
                    padding-left: 10px;
                    margin-left: 35px;
                    text-align: left;
                    &::before{
                        content: '';
                        position: absolute;
                        top: 5px;
                        left: 0px;
                        width: 6px;
                        height: 6px;
                        background-color: var(--mainColor);
                        border-radius: 50px;
                    }
                }
                .history_back{
                    position: absolute;
                    display: none;
                    top: 9px;
                    right: 0;
                    width: 42px;
                    height: 11px;
                    margin-right: 11px;
                    cursor: pointer;
                    i{
                        display: inline-block;
                        margin-right: 6px;
                        width: 12px;
                        height: 10px;
                        opacity: 0.5;
                        background:url(../../assets/pc/images/common/back_history.png)
                    }
                    span{
                        font-size: 12px;
                        color: #38424d;
	                    opacity: 0.5;
                    }
                }
            }           
        }
        // 月份
        .month_list{
            position:relative;
            height: 30px;           
            margin-bottom: 20px;
            font-size:12px;
            overflow: hidden;
            transition: height .3s;
            &:before{
                position:absolute;
                content:'';
                left: 17px;
                top: 2px;
                width: 0;
                height: 0;
                border-left: 6px solid #8d94a0;
                border-bottom: 6px solid transparent;
                border-top: 6px solid transparent;
                
                transform: rotate(0deg);
                transition:transform .3s;
            }
            &.show{
                height:auto;
                &:before{
                    transform: rotate(90deg)
                }
            }
            .month{
                display: block;
                text-align: left;
                margin-left: 35px;
                margin-bottom: 16px;
                font-size:12px;
                font-weight: 600;
                color: #667280;
                cursor: pointer;
            }           
            .list{
                position: relative;
                height: 100%;
                overflow: hidden;
                padding: 11px 0;
                cursor: pointer;
                &.current{
                    background: #f0f4f8;
                }
                &:hover{
                    background: #f0f4f8;
                    .history_back{
                        display: block;
                    }
                }
                .time{
                    display: block;
                    text-align: left;
                    margin-bottom: 7px;
                    margin-left: 35px;
                    color:#959ea7;
                }
                .action_content{
                    position: relative;
                    padding-left: 10px;
                    margin-left: 35px;
                    text-align: left;
                    &::before{
                        content: '';
                        position: absolute;
                        top: 5px;
                        left: 0px;
                        width: 6px;
                        height: 6px;
                        background-color: var(--mainColor);
                        border-radius: 50px;
                    }
                }
                .history_back{
                    position: absolute;
                    display: none;
                    top: 9px;
                    right: 0;
                    width: 42px;
                    height: 11px;
                    margin-right: 11px;
                    cursor: pointer;
                    i{
                        display: inline-block;
                        margin-right: 6px;
                        width: 12px;
                        height: 10px;
                        opacity: 0.5;
                        background:url(../../assets/pc/images/common/back_history.png)
                    }
                    span{
                        font-size: 12px;
                        color: #38424d;
	                    opacity: 0.5;
                    }
                }
                
            }
            
        }
        // 今年之前
        .last_year{
            position:relative;
            height: 30px;           
            margin-bottom: 20px;
            font-size:12px;
            overflow: hidden;
            transition: height .3s;
            &:before{
                position:absolute;
                content:'';
                left: 17px;
                top: 2px;
                width: 0;
                height: 0;
                border-left: 6px solid #8d94a0;
                border-bottom: 6px solid transparent;
                border-top: 6px solid transparent;               
                transform: rotate(0deg);
                transition:transform .3s;
            }
            &.show{
                height:auto;
                &:before{
                    transform: rotate(90deg)
                }
            }
            .year{
                display: block;
                text-align: left;
                margin-left: 35px;
                margin-bottom: 16px;
                font-size:12px;
                font-weight: 600;
                color: #667280;
                cursor:pointer;
            }
            .list{
                position: relative;
                height: 100%;
                padding: 11px 0;
                cursor: pointer;
                &.current{
                    background: #f0f4f8;
                }
                &:hover{
                    background: #f0f4f8;
                    .history_back{
                        display: block;
                    }
                }
                .time{
                    display: block;
                    text-align: left;
                    margin-bottom: 7px;
                    margin-left: 35px;
                    color:#959ea7;
                }
                .action_content{
                    position: relative;
                    padding-left: 10px;
                    margin-left: 35px;
                    text-align: left;
                    &::before{
                        content: '';
                        position: absolute;
                        top: 5px;
                        left: 0px;
                        width: 6px;
                        height: 6px;
                        background-color: var(--mainColor);
                        border-radius: 50px;
                    }
                }
                .history_back{
                    position: absolute;
                    display: none;
                    top: 9px;
                    right: 0;
                    width: 42px;
                    height: 11px;
                    margin-right: 11px;
                    cursor: pointer;
                    i{
                        display: inline-block;
                        margin-right: 6px;
                        width: 12px;
                        height: 10px;
                        opacity: 0.5;
                        background:url(../../assets/pc/images/common/back_history.png)
                    }
                    span{
                        font-size: 12px;
                        color: #38424d;
	                    opacity: 0.5;
                    }
                }
            }
        }
    }
    .doc_page{
        position:absolute;
        top:0;
        left:0;
        width:100%;
        font-size:0;
        transform:translate3d(0,0,0) scaleZ(1);
        will-change:transform;
        word-break:break-all;
        &.show{
            z-index:2;
            opacity: 1;
        }
    }
</style>

<script>
    import svg_modal from '../../components/SvgPageModal.vue'
    import document_backup from '@/assets/pc/js/document_backup.js';
    import document_save_error from '@/assets/pc/js/document_save_error.js';
    export default{
        metaInfo() {
            return {
                meta: [
                    {
                        name: 'robots',
                        content: 'noindex,nofollow,noarchive'
                    }
                ]
            }
        },
        components: {svg_modal},
        data(){
            return{
                query_id : null,                            // 文档id
                query_mode : null,                          // 恢复模式
                show_opt_list : false,                      // 显示操作记录
                changing_page: false,                       // 正在切换页面标识
                page_number: 0,                             // 当前页下标
                content_w: 1215,                            // 文档宽度
                content_h: 766,                             // 文档高度
                document_info:{
                    id : null,
                    uuid : null,
                    background : {
                        type: 'color',
                        color: '#ffffff',
                        image: null
                    },
                    shapeColor : '#42464b',
                    textColor : '#42464b',
                    font : null,
                    width : 1215,
                    height : 766,
                },
                document_page_list: [],      
                page_info:{
                    id : null,
                    uuid : null,
                    title : null,
                    background : {
                        type: 'color',
                        color: '#ffffff',
                        image: null
                    },
                    switchType : 'fadeInAndOut',
                    elementList : [],
                    pageNumber : 1,
                },
                list_center:true,                       // 列表是否居中
                svg_preview_template: {                 // 预览内svg大小
                    w: 910,
                    h: 0,
                    view:[0,0,0,0]
                },
                preview_pages_template: {               // 列表svg大小
                    w: 240,
                    h: 0,
                    view:[0,0,0,0]
                },
                today_action_list:[],                   // 今天操作列表
                this_year_action_list:{},               // 今年的操作列表
                last_year_list:{},                      // 今年之前的操作列表
                current_version: "",                    // 当前预览的documentAddBackup
            }
        },
        methods:{
            close: function(){
                window.parent.close_history_iframe();
            },
            is_list_center:function(){
                let that = this,
                    index = that.page_number;
                // 设置竖向滚动条
                if($('.bottom_list').eq(index)[0] && $('.preview_inner')[0]){
                    let full_l = $('.bottom_list').eq(index)[0].offsetTop,
                        full_w = $('.bottom_list').eq(index)[0].offsetHeight,
                        panel_scroll = $('.all_page')[0].scrollTop,
                        panel_width = $('.all_page')[0].scrollHeight,
                        panel_w = $('.preview_inner')[0].offsetHeight,
                        panel_l = $('.preview_inner')[0].offsetTop,
                        middle_index = parseInt((document.body.clientHeight / 2) / full_w);
                    if(panel_width > document.body.clientHeight){
                        that.list_center = false;
                    }else{
                        that.list_center = true;
                    }
                    if(index + 1 > middle_index){
                        that.$refs.out_full_bottom.scrollTop = (index + 1 - middle_index) * (full_w + 40);
                    }else{
                        that.$refs.out_full_bottom.scrollTop = 0;
                    }
                    if($('.all_page').width() < 0){
                        that.is_list_center()
                    }
                }
            },
            init_data:function(document_info, document_page_list){
                let that = this;
                that.document_info = that.$common.document_dataparse(document_info);
                that.document_page_list = that.$common.document_pages_dataparse(document_page_list);
                that.document_page_list.sort(function(a,b){
                    return a.pageNumber > b.pageNumber ? 1 : -1;
                });
            },
            // 重置文档页
            reset_page_content:function(document_info, list){
                /*
                *   param: 文档参数{document_info, page_list}
                * */
                let that = this,
                    pages = list,
                    ratio = document_info.width / document_info.height,
                    window_w = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth,
                    window_h = window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight,
                    svg_w = document_info.width,
                    svg_h = document_info.height,
                    page_scale = Number(that.document_info.width) / Number(that.document_info.height),
                    list_h = that.preview_pages_template.w / page_scale,
                    content_w,
                    content_h;                    
                // 计算宽高
                let contain_width = window_w - 700;
                let contain_height = window_h - 40;
                if (contain_height * ratio > contain_width) {
                    content_w = contain_width;
                    content_h = contain_width / ratio;
                } else {
                    content_w = contain_height * ratio;
                    content_h = contain_height;
                }
                that.content_w = content_w;
                that.content_h = content_h;
                that.svg_preview_template.w = content_w;
                that.svg_preview_template.h = content_h;
                that.svg_preview_template.view[0] = 0;
                that.svg_preview_template.view[1] = 0;
                that.svg_preview_template.view[2] = document_info.width;
                that.svg_preview_template.view[3] = document_info.height;
                // 遍历文档页
                for(let i in pages){
                    // 保存列表内容
                    that.preview_pages_template.h = list_h;      
                    that.preview_pages_template.view[2] = svg_w;
                    that.preview_pages_template.view[3] = svg_h;
                }
            },
            // 设置页码 | 上一页 | 下一页
            set_page: function(index){
                let that = this;
                if(that.changing_page) return;
                if(index === that.page_number) return that.$toast('已在当前页',800);
                if(index < that.document_page_list.length && index >= 0){
                    that.changing_page = true;
                    that.page_number = index;
                    that.change_page();
                }
            },
            // 切换页面
            change_page:function(){
                let that = this,
                    index = that.page_number,
                    $doc_page = $('.display_contain .page_list .doc_page');
                $doc_page.each(function(i){
                    if(i === index){
                        $(this).addClass('show');
                    }else{
                        $(this).removeClass('show');
                    }
                });
                setTimeout(function(){
                    that.changing_page = false;
                },300);
                that.is_list_center();
            },
            // 滚动切换页
            page_mouse_wheel:function(event){
                let that = this,
                    e = event || window.event,
                    index = that.page_number,
                    action;
                if(e.wheelDelta){
                    if(e.wheelDelta > 0){
                        action = 'previous'
                    }else{
                        action = 'next'
                    }
                }else if(e.detail){
                    if(e.detail > 0){
                        action = 'next'
                    }else{
                        action = 'previous'
                    }
                }else{
                    return
                }
                if(action === 'previous'){index--}else{index++}
                if(!that.changing_page){
                    that.set_page(index);
                }
            },
            // 打开/关闭时间列表
            open_time_list: function(ev){
                $(ev.target).parents('.time_list').toggleClass('show');
            },
            // 本地恢复
            local_recovery:function(){
                let that = this;
                that.$toast('恢复备份数据中', 99999);
                that.$axios.get(`/api/member/document/detail/${that.query_id}/`).then(function(data){
                    if(data.data.code === '2'){
                        that.init_data(data.data.data.document, data.data.data.documentPages);
                        document_save_error.method.init(that,true);
                        document_save_error.method.recovery(that, function(){
                            that.reset_page_content(that.document_info,that.document_page_list);
                            that.$nextTick(function(){
                                that.page_number = 0;
                                that.is_list_center();
                                that.change_page();
                            });
                            that.$toast('恢复备份数据成功', 2000, null, null, 'clear');
                        });
                    }
                });
            },
            // 远程恢复
            remote_recovery:function(version, versionDate){
                let that = this;
                if(version || versionDate){
                    // 通过链接访问
                    that.remote_recovery_preview(version, versionDate);
                }else{
                    // 通过操作记录访问
                    let params = {
                        documentId:that.query_id,
                        pageSize:200
                    },
                    today_date = utils.dateFormat(new Date(),'yyyy/MM/dd HH:mm:ss').substring(0,10),
                    this_year_action_list = {},
                    last_year_action_list = {};
                    document_backup.mapi.document_opt_log_list(params).then(res => {
                        let data = res.data;
                        if(data.length === 0){
                            return;
                        }
                        let documentAddBackup;
                        data.forEach(item => {
                            //获取首个操作记录
                            if(!documentAddBackup && item.documentAddBackup){
                                documentAddBackup = item.documentAddBackup;
                            }
                            item.createDate = utils.dateFormat(new Date(item.createDate),'yyyy/MM/dd HH:mm:ss');
                            if (item.createDate.substring(0,10) === today_date) {
                                // 获取今日操作记录
                                that.today_action_list.push(item);
                            }else if(item.createDate.substring(0,4) === today_date.substring(0,4)){
                                // 获取今年操作记录
                                let month = item.createDate.substring(5,7);
                                let array = this_year_action_list[month];
                                if(!array){
                                    array = [];
                                }
                                array.push(item);
                                this_year_action_list[month] = array;
                            }else if(item.createDate.substring(0,4) !== today_date.substring(0,4)){
                                // 获取今年之前操作记录
                                let year = item.createDate.substring(0,4);
                                let array = last_year_action_list[year];
                                if(!array){
                                    array = [];
                                }
                                array.push(item);
                                last_year_action_list[year] = array;
                            }
                        });
                        // 今年操作记录排序
                        Object.keys(this_year_action_list).sort(function(a,b){return Number(b) - Number(a)}).forEach(function(key){
                            that.this_year_action_list[Number(key) + "月"] = this_year_action_list[key];
                        });
                        // 今年之前操作记录排序
                        Object.keys(last_year_action_list).sort(function(a,b){return Number(b) - Number(a)}).forEach(function(key){
                            that.last_year_list[Number(key) + "年"] = last_year_action_list[key];
                        });
                        that.remote_recovery_preview(documentAddBackup);
                    });
                    that.show_opt_list = true;
                }
            },
            remote_recovery_preview:function(version, versionDate){
                if(!version && !versionDate){
                    return;
                }
                let that = this;
                that.current_version = version;
                document_backup.method.recovery(that, that.query_id, version, versionDate, 100).then(res => {
                    that.init_data(res.document_info, res.document_page_list);
                    that.reset_page_content(that.document_info,that.document_page_list);
                    that.$nextTick(function(){
                        that.page_number = 0;
                        that.is_list_center();
                        that.change_page();
                    });
                },error => {
                    that.$toast('数据异常', 2000, null, null, 'clear');
                });
            },
            remote_recovery_submit:function(version){
                if(!version){
                    return;
                }
                if(window.parent && window.parent.recovery_action_history){
                    window.parent.recovery_action_history(version);
                }
            }
        },
        mounted(){
            const that = this;
            document_backup.info.enabled = false;
            document_backup.method.ready(that);
            // 全局快捷键设置
            document.onkeydown = function(e){
                let event = e || window.event,
                    key = e.keyCode;
                switch (key) {
                    case 37:
                        that.set_page(that.page_number-1);
                        break;
                    case 38:
                        that.set_page(that.page_number-1);
                        break;
                    case 39:
                        that.set_page(that.page_number+1);
                        break;
                    case 40:
                        that.set_page(that.page_number+1);
                        break;
                }
            };
            if (utils.deviceENV().firefox) {
                document.addEventListener("DOMMouseScroll", that.page_mouse_wheel);
            } else {
                window.onmousewheel = document.onmousewheel = that.page_mouse_wheel;
            }

            let id = that.$route.params.id,
                mode = that.$route.query.mode,//(local:本地,remote:远程)
                version = that.$route.query.version,
                versionDate = that.$route.query.versionDate;
            if(!id){
                return that.$toast('参数错误', 2000);
            }
            that.query_id = id;
            that.query_mode = mode;
            if(that.query_mode !== 'remote'){
                //本地恢复
                that.local_recovery();
            }else{
                //远程恢复
                that.remote_recovery(version, versionDate);
            }
        }
    }
</script>