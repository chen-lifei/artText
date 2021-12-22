<template>
    <div class="print_modal">
        <!--startprint1-->
        <div class="print_page"
             v-for="item in print_page"
             v-html="item.content"
        ></div>
        <!--endprint1-->
    </div>
</template>

<script>
    export default {
        name: "PrintModal",
        props:['document_info', 'page_info', 'document_page_list'],
        data(){
            return {
                show_print: false,  // 显示打印界面标识
                print_page:[],      // 打印界面显示的文档页
            }
        },
        methods:{
            // 格式化文档页打印
            page_to_print:function(){
                let that = this,
                    document_info = that.document_info,
                    page_info = that.page_info,
                    page_list = that.document_page_list,
                    ratio = document_info.width / document_info.height,
                    doc_bg = document_info.background.split(','),
                    doc_font = document_info.font,
                    had_use_background = document_info.unuseBackgroundStyle ? document_info.unuseBackgroundStyle.split(',') : [],
                    had_use_font = document_info.unuseFontStyle ? document_info.unuseFontStyle.split(',') : [],
                    page_bg = page_info.background,
                    $page = document.createElement('DIV'),
                    $svg, $svg_bg, $svg_bg_rect, $svg_bg_image;
                page_list.forEach(function(item){
                    $page.innerHTML = item.content;
                    $svg = $page.querySelector('#editPage');
                    $svg_bg = $page.querySelector('#ele_background svg');
                    $svg_bg_rect = $page.querySelector('#ele_background svg rect');
                    // 设置文档页大小
                    $svg.setAttribute('width', '1040');
                    $svg.setAttribute('height', 1040 / ratio);
                    $svg.setAttribute('viewBox', '0 0 910 ' + 910 / ratio);
                    // 设置文档页背景
                    $svg_bg.setAttribute('width', '910');
                    $svg_bg.setAttribute('height', 910 / ratio);
                    $svg_bg_rect.setAttribute('height', 910 / ratio);
                    // 判断背景图
                    if(item.backgroundImage && item.backgroundImage !== ''){
                        $svg_bg_image = $page.querySelector('#ele_background svg image');
                        let image_ratio = $svg_bg_image.getAttribute('width') / $svg_bg_image.getAttribute('height'),
                            image_w, image_h;
                        if(910/image_ratio > 910/ratio){
                            // 等宽情况下，图片高于画布
                            image_w = 910;
                            image_h = 910 / image_ratio;
                        }else{
                            // 等宽情况下，图片高度小于画布
                            image_h = 910 / ratio;
                            image_w = image_h * image_ratio;
                        }
                        $svg_bg_image.setAttribute('x','-' + (image_w - 910)/2);
                        $svg_bg_image.setAttribute('y','-' + (image_h - 910/ratio)/2);
                    }
                    // 判断主题
                    if(doc_bg.length > 1 && had_use_background.indexOf(page_info.id.toString()) < 0){
                        $svg_bg_rect.setAttribute('fill', doc_bg[0]);
                        $($svg).find('.tab_cel rect.tab_cel_background').attr('fill', doc_bg[0]);
                        $($svg).find('g[data-type=line] g>path, g[data-type=line] .color_rect').attr('fill', doc_bg[1]);
                        $($svg).find('g[data-type=shape]').css('fill', doc_bg[1]);
                        $($svg).find('.show_text span').css('color', doc_bg[2]);
                    }else{
                        $svg_bg_rect.setAttribute('fill', page_bg ? page_bg : doc_bg[0]);
                    }
                    // 判断字体
                    if(doc_font && doc_font !== '' && had_use_font.indexOf(page_info.id.toString()) < 0){
                        let $text = $svg.querySelectorAll('.show_text span');
                        for(let i in $text){$text[i].style.fontFamily = doc_font;}
                    }
                    item.content = $page.innerHTML;
                });
                that.print_page = page_list;
            },
        },
        mounted(){
            this.page_to_print();
        }
    }
</script>

<style lang="less" scoped>
    .print_modal{
        display:none;
    }
    @media print{
        .print_modal{
            position:relative;
            z-index:9999;
            display:block;
            width:100%;
            min-width:970px;
            line-height:unset;
            background:#ffffff;
            font-size:0;
            .print_page{
                width:1040px;
                padding:65px 2px 0;
                page-break-after:always;
                &:first-child{padding-top:50px;}
            }
        }
    }
</style>