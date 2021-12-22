<template></template>
<script>
    import opt_factory from '@/assets/pc/js/opt/opt_factory.js';
    import page_opt from '@/assets/pc/js/opt/page_opt.js';
    export default {
        mounted:function(){
            let that = this;
            let shape_opt = opt_factory.init_opt('shape');
            window['svg_parse'] = (params) => {
                params = Object.assign({
                    type : null,
                    str : null,
                    callback : null,
                    mergePath : true
                }, params);
                //解析图片
                if(params.type === 'image'){
                    let image = new Image();
                    image.onload = function (){
                        let element = {
                            id: '',
                            type: 'img',
                            group: false,
                            lock: false,
                            opacity: 1,
                            translate: '0,0',
                            rotate: '0,'+ image.width / 2 + ',' + image.height / 2,
                            scale: '1,1',
                            url: params.str,
                            image_w: image.width,
                            image_h: image.height,
                            clip_x: 0,
                            clip_y: 0,
                            clip_w: image.width,
                            clip_h: image.height,
                            circle_clip: false,
                            clip_id: '',
                            clip_dom:'',
                        };
                        if(typeof params.callback === 'function'){
                            params.callback("["+JSON.stringify(element)+"]");
                            return;
                        }
                    }
                    image.src = params.str;
                    return;
                }
                //解析svg
                if(params.type === 'svg'){
                    let data = shape_opt.format_paste_shape(params.str);
                    if(typeof params.callback === 'function'){
                        if(params.mergePath){
                            params.callback("["+JSON.stringify(data.element)+"]");
                        }else{
                            params.callback(JSON.stringify(data.element_list));
                        }
                        return;
                    }
                }
            }
            window['get_page_dom'] = (width, height, elementList) => {
                let document_info = {
                    id : null,
                    uuid : null,
                    sign : null,
                    fId : null,
                    teamfId: null,
                    documentType : "slides",
                    title : null,
                    url : null,
                    background : {
                        type: 'color',
                        color: '#ffffff',
                        image: null
                    },
                    shapeColor : '#42464b',
                    textColor : '#42464b',
                    font : null,
                    width : width,
                    height : height,
                    modifyDate : '未保存',
                    editCount : null,
                    switchType : null,
                    attr: null
                };
                //当前文档页
                let page_info =  {
                    id : null,
                    uuid : null,
                    sign : null,
                    title : null,
                    background : {
                        type: 'color',
                        color: '#ffffff',
                        image: null
                    },
                    switchType : 'fadeInAndOut',
                    isLock : false,
                    elementList : elementList,
                    pageNumber : 1,
                    attr: null,
                };
                return that.$common.svg_2_base64(page_opt.get_dom(document_info, page_info), false);
            }
        }
    }
</script>