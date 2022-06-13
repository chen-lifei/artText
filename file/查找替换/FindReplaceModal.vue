<template>
    <!-- 查找与替换弹框 -->
    <transition name="modal-fade">
        <div class="find_replace_modal_contain" v-show="show_find_replace_modal">
            <div class="modal_wrapper">
                <div class="modal_main">
                    <div class="header">
                        <h1>查找和替换</h1>
                        <button class="modal-close" @click="close"></button>
                    </div>
                    <div class="body">
                        <div class="operate_panel find_panel">
                            <span>查找</span>
                            <input type="text" placeholder="输入查找内容" ref="matching_keyword" @input="find_match_str($event)"/>
                            <i class="find_count" v-if="total_num > 0 && current_index > 0">{{current_index}}/{{total_num}}</i>
                        </div>
                        <div class="operate_panel find_panel">
                            <span>替换为</span>
                            <input type="text" placeholder="输入替换内容"/>
                        </div>
                        <button @click="toggle_match_upper_lower" :class="{checked:match_upper_lower}"><span><i class="edit-ico edit-ico-check_white" v-if="match_upper_lower"></i></span>匹配大小写</button>
                    </div>
                    <div class="footer">
                        <div class="replace_panel">
                            <button>替换</button>
                            <button>全部替换</button>
                        </div>
                        <div class="find_panel">
                            <button>上一条</button>
                            <button @click="next_matching">下一条</button>
                        </div>
                    </div>
                </div>
            </div>
            <div id="btn" style="position:absolute;background:#efcd29;opacity:0.5;top:0;left:0;"></div>
        </div>
    </transition>
</template>

<script>
    // 测试文档：http://192.168.3.35/edit/?docId=391205&pId=4719672
    // 测试时把 show_find_replace_modal 改为true 即可
    // 直接在关键词处粘贴：查找
    import page_opt from '@/assets/pc/js/opt/page_opt.js';
    export default {
        data() {
            return {
                show_find_replace_modal: false,     // 弹框展示标识  
                match_upper_lower: false,           // 匹配大小写标识
                matching_keyword:'',                // 匹配关键字
                current_index:null,
                find_replace_arr:[],
                total_num:0,
            };
        },
        props: [
            'document_page_list',
            'page_info'
        ],
        mounted() {
        },
        methods: {
            open: function(){
                let that = this;
                that.show_find_replace_modal = true;
            },
            close: function(){
                let that = this;
                that.show_find_replace_modal = false;
            },
            toggle_match_upper_lower: function(){
                let that = this;
                that.match_upper_lower = !that.match_upper_lower;
            },
            find_match_str: function(e){
                let that = this;
                let page_list = that.document_page_list;
                let keyword = that.$refs.matching_keyword.value;
                if (keyword === that.matching_keyword) return;
                that.matching_keyword = keyword;
                if (keyword === ''){
                    that.clear_match_str();
                    return false;
                }
                // 停止文档观察者
                that.$parent.stop_document_observer();
                // 标识匹配
                that.mark_match_str(true);
                $.each(page_list,function(page_index,page_info){
                    let text = '';
                    let ele_list = page_info.elementList;
                    $.each(ele_list,function(ele_index,ele){
                        switch (ele.type) {
                            case 'text':
                                text = $(ele.content).text();
                                break;
                            case 'shape':
                                text = $(ele.text.content).text();
                                break;
                            case 'table':
                                $.each(ele.tr_list,function(tr_index,tr){
                                    $.each(tr,function(td_index,td){
                                        text = $(td.content).text();
                                    })
                                });
                                break;
                            default:
                                break;
                        }
                        that.common_exec_str(page_info.uuid,ele.id,text);
                    })
                })
                that.total_num = that.find_replace_arr.length;
            },
            // 暂时废弃
            common_exec_str: function(page_id,id,str){
                let that = this;
                let keyword = that.matching_keyword;
                let reg = new RegExp(keyword, "g");
                let obj = {}, arr =[];
                let result = that.find_replace_arr;
                while ( arr = reg.exec(str)){
                    console.log(arr)
                    obj.page = page_id;
                    obj.id = id;
                    obj.index = arr.index;
                    obj.input = arr.input;
                    result.push(obj);
                }
                that.find_replace_arr = result;
            },
            // ***匹配方法
            mark_match_str: function(clear){
                let that = this;
                let keyword = that.matching_keyword;
                let reg = new RegExp(keyword, "ig");
                let $page = $('.page_contain .edit_page');
                let srting_arr = keyword.split('');
                let $ele = $page.find('.ele_item');
                let find_result = [];
                // 1、遍历当前页元素
                $ele.each(function(){
                    let $this = $(this);
                    let id = $this.attr('id');
                    let $parent = $(this).find('.ele_scale>div');
                    let $text = $(this).find('.show_text');
                    let $break = $parent.find('div,ul,ol');
                    // 2、遍历所有的换行节点(div ul ol)
                    console.log($break);
                    $break.each(function(){
                        let $pr = $(this)[0];
                        let reg = '';
                        let break_result = [];
                        console.log($pr)
                        // 3、拆分查找字符并遍历匹配
                        $.each(srting_arr,function(i,item){
                            let result = [];
                            reg = new RegExp(item, "g");
                            // 4、遍历当前换行节点的子节点
                            for(let i = 0; i < $pr.childNodes.length; i++){
                                let arr = [];
                                let $dom = $pr.childNodes[i];
                                console.log($dom)
                                let obj = {};
                                let _obj = {};
                                // 若当前节点为换行节点,结束当前循环
                                if($dom.tagName === 'DIV' || $dom.tagName === 'ul' || $dom.tagName === 'OL') continue;
                                // 当前子节点为纯文本#text
                                if($dom.nodeType == 3){
                                    // 问题点：纯文本节点无法设置选区，若获取父级节点进行匹配，则又回到最初的问题，无法匹配到准确位置
                                    // $dom = $dom.parentNode;
                                    while ( arr = reg.exec($dom.textContent)){
                                        _obj = JSON.parse(JSON.stringify(obj));
                                        _obj.index = arr.index;
                                        _obj.node = $dom;
                                        result.push(_obj);
                                    }
                                }else{
                                    while ( arr = reg.exec($dom.innerText)){
                                        _obj = JSON.parse(JSON.stringify(obj));
                                        _obj.index = arr.index;
                                        _obj.node = $dom;
                                        result.push(_obj);
                                    }
                                }
                            }
                            break_result.push(result);
                        })
                        console.log(break_result)
                        // 5、遍历关键词拆分匹配后的结果（当前只处理了两个字的情况，多字时需要递归）
                        $.each(break_result[0],function(i,i_item){
                            $.each(break_result[1],function(j,j_item){
                                $text.focus();
                                document.execCommand('selectAll')
                                let sel = window.getSelection();
                                let range;
                                if (sel.getRangeAt && sel.rangeCount) {
                                    range = sel.getRangeAt(0);
                                }
                                console.log(i_item)
                                console.log(j_item)
                                //问题点：纯文本无法设置选区
                                if(i_item.node.nodeType === 3){
                                    range.setStartBefore(i_item.node);
                                }else{
                                    range.setStart(i_item.node.firstChild, i_item.index);
                                }
                                range.setEnd(j_item.node.firstChild, j_item.index);
                                let _obj = range.getBoundingClientRect();
                                if(_obj.width <= 0) return true;
                                $('#btn').css({
                                    width:_obj.width,
                                    height:_obj.height,
                                    left:_obj.x +'px',
                                    top:_obj.y +'px',
                                })
                                window.getSelection().removeAllRanges();
                                $text.blur();
                            })
                        })
                        find_result.push(break_result);
                    })
                    console.log(find_result)
                });
            },
            // 暂时废弃
            clear_match_str: function(){
                let that = this;
                let $page = $('.page_contain .edit_page');
                let $ele = $page.find('.ele_item');
                $ele.each(function(){
                    let $this = $(this);
                    let $text = $this.find('.search_result');
                    console.log($text)
                    $text.each(function(){
                        $(this)[0].outerHTML = $(this)[0].innerHTML;
                    })
                })
            },
            // 暂时废弃
            next_matching: function(){
                let that = this;
                let index = that.current_index;
                let current_page = that.page_info.uuid;
                let result_arr = that.find_replace_arr;
                if(index == null) {
                    index = result_arr.findIndex((value) => value.page === current_page);
                    console.log(index)
                }
                // if(index > $('.page_contain .edit_page').find('.search_result').length){
                //     // 按键切换页
                //     let action = 'next';
                //     let min_index = 0;
                //     let max_index = that.document_page_list.length - 1;
                //     let current_index = min_index;
                //     let target_index = min_index;
                //     $.each(that.document_page_list,function(i,item){
                //         if(item.uuid === that.$parent.page_info.uuid){
                //             current_index = i;
                //             return false;
                //         }
                //     });
                //     if(action === 'previous'){
                //         target_index = current_index - 1;
                //     }else{
                //         target_index = current_index + 1;
                //     }
                //     if(target_index < min_index){
                //         target_index = min_index;
                //     }
                //     if(target_index > max_index){
                //         target_index = max_index;
                //     }
                //     if(current_index === target_index){
                //         return;
                //     }
                //     page_opt.change(that.$parent,target_index,action);
                //     that.$nextTick(function(){
                //         let keyword = that.matching_keyword;
                //         let reg = new RegExp(keyword, "g");
                //         let $ele = $('.page_contain .edit_page').find('.ele_item');
                //         $ele.each(function(){
                //             let $old = $(this).find('.search_result');
                //             $old.each(function(){
                //                 $(this)[0].outerHTML = $(this)[0].innerHTML;
                //             })
                //             let arr = $(this).find('.show_text')[0].innerHTML.split(keyword);
                //             $(this).find('.show_text')[0].innerHTML = arr.join("<span class='search_result'>" + keyword + "</span>");
                //         });
                //     })
                // }else{
                //     $($('.page_contain .edit_page').find('.search_result')[index]).addClass('search_result_highlight');
                // }
            }
        }
    };
</script>

<style lang="less" scoped>
    @main_color: #0d7bf7;
    .find_replace_modal_contain{
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        z-index: 22;
        text-align: center;
        .modal_wrapper{
            position: absolute;
            width: 100%;
            height: 100%;
            &::after {
                content: "";
                display: inline-block;
                vertical-align: middle;
                width: 0;
                height: 100%;
            }
        }
        .modal_main{
            display:inline-block;
            vertical-align:middle;
            width: 470px;
            height: 290px;
            padding:0 30px;
            text-align:left;
            background-color: #ffffff;
            box-shadow: 0px 6px 9px 0px rgba(89, 96, 117, 0.15);
            border-radius: 6px;
        }
        .header{
            height:58px;
            line-height:58px;
            margin-bottom:17px;
            user-select:none;
            h1{
                display:inline-block;
                font-size:18px;
                font-weight:normal;
                color:#333540; 
            }
            button{
                margin:18px 0 0 0;
                opacity:.6;
            }
        }
        .body{
            .operate_panel{
                position:relative;
                width:100%;
                height:40px;
                margin-bottom:14px;
                span{
                    display:inline-block;
                    vertical-align:middle;
                    width:66px;
                    text-align:left;
                    font-size:14px;
                    color:#333540;
                }
                input{
                    display:inline-block;
                    vertical-align:middle;
                    width: 340px;
                    height: 40px;
                    padding-left:13px;
                    background-color: #ffffff;
                    border-radius: 2px;
                    border: solid 1px #e9eaec;
                    transition:all .3s;
                    &:focus,&:hover{
                        border-color:#0063fa;
                    }
                    &::-webkit-input-placeholder{
                        color:#bbb;
                    }
                }
                .find_count{
                    position:absolute;
                    right:20px;
                    height:40px;
                    line-height:40px;
                    color:#bbb;
                }
            }
            button{
                margin-left:66px;
                font-size:12px;
                color:#333540;
                span{
                    display:inline-block;
                    vertical-align:middle;
                    width: 14px;
                    height: 14px;
                    line-height:11px;
                    margin-right:6px;
                    text-align:center;
                    background-color: #ffffff;
                    border-radius: 2px;
                    border: solid 1px #707682;
                }
                &:hover{
                    color:@main_color;
                }
                &.checked span{
                    background-color:#0d7bf7;
                    border:none;
                }
            }
        }
        .footer{
            margin-top:42px;
            .replace_panel{
                display:inline-block;
                button{
                    width: 80px;
                    height: 30px;
                    line-height:30px;
                    margin-right:16px;
                    background-color: #ffffff;
                    border-radius: 2px;
                    border: solid 1px #b3bac7;
                    font-size: 14px;
                    color: #333540;
                    transition:all .3s;
                    &.disabled{
                        pointer-events:none;
                        opacity:.7;
                    }
                    &:last-child{
                        margin-right:54px;
                    }
                    &:hover{
                        background:@main_color;
                        color:#fff;
                        border:none;
                    }
                }
            }
            .find_panel{
                display:inline-block;
                button{
                    width: 80px;
                    height: 30px;
                    line-height: 30px; 
                    opacity: 0.8;
                    margin-right:16px;
                    background-color: #0063fa;
                    border-radius: 2px;
                    font-size: 14px;
                    color: #fff;
                    transition:all .3s;
                    &.disabled{
                        pointer-events:none;
                        background-color: #d8dde6;
                        color:#333540;
                    }
                    &:last-child{
                        margin-right:0;
                    }
                    &:hover{
                        opacity:1;
                    }
                }
            }
        }
    }
</style>