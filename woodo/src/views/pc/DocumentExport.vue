<template>
    <div class="page_container" id="quality">
        <div class="page_break" 
            :class="{'page': longImage}" 
            v-for="(item, index) in document_page_list"
            :key="index"
        >
            <svg_modal ref="svg_modal" 
                :svg_w="document_info.width"
                :svg_h="document_info.height"
                :svg_view="[0,0,document_info.width,document_info.height]"
                :document="document_info"
                :page_info="item"
            ></svg_modal>
        </div>
    </div>
</template>
<style>
    @import url("../../assets/pc/css/common.css");
    @import url("../../assets/pc/css/edit.css");
    .page_container {
        transform-origin: 0 0;
        transform: scale(1, 1);
    }
    .page:not(:first-child){
        margin-top: 1px;
    }
    .page_break{
        page-break-after: always
    }
</style>

<script>
    import svg_modal from '@/components/SvgPageModal.vue';
    export default {
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
        components: {
            svg_modal
        },
        data(){
            return{
                longImage : false,
                nativeUrl:"",
                siteUrl:"",
                document_info : {
                    id : null,
                    uuid : null,
                    background : {},
                    shapeColor : '#42464b',
                    textColor : '#42464b',
                    font : null,
                    width : 910,
                    height : 512,
                },
                //文档页列表
                document_page_list : [],
                //当前文档页
                page_info : {
                    id : null,
                    uuid : null,
                    title : null,
                    background : {},
                    switchType : 'fadeInAndOut',
                    elementList : [],
                    pageNumber : 1,
                }
            }
        },
        methods:{
        },
        mounted:function(){
            let that = this;
            let id = that.$route.params.id;
            let memberId = that.$route.query.memberId;
            let longImage = that.$route.query.longImage;
            let thumbnail = that.$route.query.thumbnail;
            let pageNum = that.$route.query.pageNum;
            let quality = that.$route.query.quality;
            that.internalHost = that.$route.query.internalHost ? that.$route.query.internalHost : '';
            that.imageHost = that.$route.query.imageHost ? that.$route.query.imageHost : '';
            that.longImage = longImage === 'true';
            let params = {};
            if(memberId){
                params['memberId'] = memberId;
            }
            if(thumbnail){
                params['thumbnail'] = thumbnail;
            }
            $.ajax({
                type: "GET",
                url: `/api/document/export_ext/${id}/`,
                data:params,
                cache:false,
                async: false,
                success: function (data) {
                    if(data.code === '2'){
                        //替换内网地址
                        if(!$validate(that.internalHost).empty() && !$validate(that.imageHost).empty()){
                            let docStr = JSON.stringify(data.data.documentPages);
                            docStr = docStr.replace(new RegExp(that.imageHost,"gm"),that.internalHost);
                            data.data.documentPages = JSON.parse(docStr);
                        }
                        that.document_info = that.$common.document_dataparse(data.data.document);
                        let page_list = that.$common.document_pages_dataparse(data.data.documentPages);
                        page_list.sort(function(a,b){
                            return a.pageNumber > b.pageNumber ? 1 : -1;
                        });
                        //指定页码下载
                        if(pageNum){
                            let pageNums = pageNum.split(",");
                            let _list = [];
                            pageNums.forEach((item,index)=>{
                                _list.push(page_list[item - 1]);
                            });
                            page_list = _list;
                        }
                        that.document_page_list = page_list;
                        //改变画布尺寸
                        if(quality){
                            $('.page_container').css('transform', `scale(${quality}, ${quality})`);
                        }
                    }
                }
            });
            window['svg_2_base64'] = (svg_str) => {
                return that.$common.svg_2_base64(svg_str,false);
            }
            window['svg_2_canvas'] = (svg_str) => {
                return that.$common.svg_2_canvas(svg_str,false);
            }
        },
    }
</script>