<template>
    <transition name="modal-fade">
        <div class="import_doc_modal" v-if="show_modal">
            <div class="masking_wrapper">
                <div class="modal_main">
                    <h1>导入在线文档</h1>
                    <button class="close_btn" @click="close"></button>
                    <div class="import_contain">
                        <div class="import_source_bar">
                            <p class="title">请选择文档来源</p>
                            <div class="online_doc" :class="{checked:import_source === 'online'}" @click="change_import_source('online')"><span>在线文档</span></div>
                            <div class="local_doc" :class="{checked:import_source === 'local'}" @click="change_import_source('local')"><span>本地文档</span></div>
                        </div>
                        <div class="import_doc_choose_bar">
                            <div class="online_doc" v-if="import_source === 'online'">
                                <p class="title">请选择文档</p>
                                <div class="online_doc_content">
                                    <input type="text" class="current_doc" @click="toggle_online_doc_list" placeholder="请选择您要导入的文档" readonly="readonly" :value="import_docinfo.name">
                                    <div class="online_doc_list" v-if="show_online_doc_list">
                                        <ul class="my_doc">
                                            <p class="doc_type">我的文档</p>
                                            <li v-for="(item,index) in import_doc_list" :key="item.name" :class="{folder:item.grade, disabled:item.collaborateRoleType && item.collaborateRoleType !== 'edit' && item.collaborateRoleType !== 'owner'}" @click="item.grade ? enter_child_list('doc',item,index) : check_current_doc(item)" :style="{paddingLeft:item.grade > 1 ? item.grade * 24 + 'px' : 24 + 'px'}">{{item.name}}</li>
                                            <p class="doc_type">我的团队</p>
                                            <li v-for="(item,index) in import_team_list" :key="item.name" :class="{folder:item.grade, disabled:item.collaborateRoleType && item.collaborateRoleType !== 'edit' && item.collaborateRoleType !== 'owner'}" @click="item.grade ? enter_child_list('team',item,index) : check_current_doc(item)" :style="{paddingLeft:item.grade > 1 ? item.grade * 24 + 'px' : 24 + 'px'}">{{item.name}}</li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                            <div class="local_doc" v-if="import_source === 'local'">
                                <p class="title">本地文件上传，仅支持PPTX、PDF格式</p>
                                <div class="local_doc_content">
                                    <span>上传文档：</span>
                                    <input id="upload_ppt" type="file" accept=".pptx,.pdf" @change="import_local_doc">
                                    <button :class="{checked:import_docinfo.name !== ''}">{{import_docinfo.name === '' ? '上传文档' : import_docinfo.name}}</button>
                                </div>
                            </div>
                        </div>
                        <button class="import_btn" @click="import_ppt">导入文档</button>
                    </div>
                </div>
            </div>
            <!-- 导入蒙层 -->
            <transition name="modal-fade">
                <div class="import_ppt_masking" v-if="importing_ppt">
                    <div class="import_ppt_loading"></div>
                    <span>{{import_ppt_progress}}%</span>
                    <span>正在导入文件，请稍后</span>
                </div>
            </transition>
        </div>
    </transition>
</template>

<style lang="less" scoped>
    @background_image: url(../assets/pc/images/edit/edit_sp_2.0.1.png) no-repeat;
    .import_doc_modal{
        position:fixed;
        top:0;
        left:0;
        width:100%;
        height:100%;
        z-index:22;
        text-align:center;
        .masking_wrapper{
            position:absolute;
            width:100%;
            height:100%;
            background:rgba(0,0,0,0.5);
            &:after{
                content:"";
                display:inline-block;
                vertical-align:middle;
                width:0;
                height:100%;
            }
        }
        .modal_main{
            position:relative;
            display:inline-block;
            vertical-align:middle;
            z-index:21;
            width:542px;
            height:410px;
            margin:0 auto;
            background-color:#fff;
            -webkit-box-shadow:4px 3px 5px 0 rgba(0, 0, 0, 0.08);
            box-shadow:4px 3px 5px 0 rgba(0, 0, 0, 0.08);
            border-radius:6px;
            h1{
                display:block;
                height:46px;
                line-height:46px;
                padding:0 22px;
                margin:0;
                font-size:14px;
                color:#fff;
                text-align:left;
                border-top-left-radius:6px;
                border-top-right-radius:6px;
                background:var(--mainColor);
                font-weight:bold;
            }
            .close_btn{
                position:absolute;
                right:20px;
                top:15px;
                width:20px;
                height:20px;
                &:before{
                    content:"";
                    display:inline-block;
                    width:12px;
                    height:12px;
                    background:@background_image -480px -5px;
                    transition:all 0.3s;
                }
                &:hover:before{
                    transform:rotate(180deg);
                    transition:all 0.3s;
                }
            }
            .import_contain{
                padding:24px 22px;
                .title{
                    height:25px;
                    text-align:left;
                    color:#525151;
                    font-size:14px;
                }
                .import_source_bar{
                    margin-bottom:24px;
                    div{
                        display:inline-block;
                        vertical-align:middle;
                        width:230px;
                        height:130px;
                        border-radius:4px;
                        background:#f6f6f7;
                        text-align:center;
                        cursor:pointer;
                        span{
                            position:relative;
                            top:50%;
                            display:block;
                            font-size:14px;
                            color:#515151;
                            &:before{
                                content:"";
                                display:block;
                                margin:0 auto 10px;
                            }
                        }
                        &.checked{
                            background:#e6f2fe;
                            span{
                                color:var(--mainColor);
                            }
                        }
                        &.online_doc{
                            margin-right:35px;
                            span{
                                margin-top:-34px;
                            }
                            span:before{
                                width:103px;
                                height:48px;
                                background:@background_image -4px -843px;
                            }
                            &.checked span:before{
                                background:@background_image -4px -785px;
                            }
                        }
                        &.local_doc{
                            span{
                                margin-top:-36px;
                            }
                            span:before{
                                width:94px;
                                height:52px;
                                background:@background_image -396px -819px;
                            }
                            &.checked span:before{
                                background:@background_image -396px -749px;
                            }
                        }
                    }
                }
                .online_doc_content{
                    position:relative;
                    width:100%;
                    height:42px;
                    border:1px solid #d5d5d5;
                    border-radius:4px;
                    input{
                        width:100%;
                        height:42px;
                        line-height:42px;
                        padding-left:14px;
                        text-align:left;
                        font-size:12px;
                        cursor:pointer;
                        &::-webkit-input-placeholder{
                            color:#d2d3d6;
                        }
                        &:-moz-placeholder{
                            color:#d2d3d6;
                        }
                        &::-moz-placeholder{
                            color:#d2d3d6;
                        }
                        &:-ms-input-placeholder{
                            color:#d2d3d6;
                        }
                    }
                    &:after{
                        content: "";
                        position: absolute;
                        right: 10px;
                        top: 50%;
                        width: 8px;
                        height: 5px;
                        margin-top: -2.5px;
                        background: @background_image no-repeat -114px -207px;
                        transition: transform 0.3s ease-in-out;
                    }
                    .online_doc_list{
                        position:absolute;
                        top:42px;
                        left:0;
                        width:100%;
                        height:auto;
                        max-height:260px;
                        overflow-y:scroll;
                        padding:15px 20px 0;
                        border:1px solid #d5d5d5;
                        border-top:none;
                        background:#fff;
                        font-size:12px;
                        color:#525151;
                        text-align:left;
                        z-index:100;
                        p{
                            height:25px;
                            line-height:25px;
                            font-weight:bold;
                            font-size:14px;
                        }
                        ul{
                            margin-bottom:15px; 
                        }
                        li{
                            display:block;
                            height:25px;
                            line-height:25px;
                            padding-left:24px;
                            text-align:left;
                            cursor:pointer;
                            &:hover{
                                color:var(--mainColor); 
                            }
                            &.folder:before{
                                content:"";
                                display:inline-block;
                                width: 20px;
                                height: 16px;
                                margin: 0 5px -2px -25px;
                                background:url(../assets/pc/images/doc/folder_list_icon.png) no-repeat;
                                background-size:contain;
                            }
                            &.disabled{
                                color:#bbbbbb;
                                cursor:default;
                                pointer-events:none;
                                &:hover{
                                    color:#bbbbbb
                                }
                            }
                        }
                    }
                }
                .local_doc_content{
                    position:relative;
                    width:100%;
                    height:46px;
                    line-height:46px;
                    padding-left:14px;
                    background:#f5f5f5;
                    font-size:12px;
                    color:#525151;
                    text-align:left;
                    button{
                        height:28px;
                        line-height:28px;
                        padding:0 18px;
                        margin-left:10px;
                        background:#ffffff;
                        border-radius:14px;
                        text-align:center;
                        &.checked{
                            background:#dde9f5;
                            color:var(--mainColor);
                        }
                    }
                    input{
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
            }
            .import_btn{
                position:absolute;
                bottom:25px;
                left:50%;
                width:112px;
                height:40px;
                line-height:40px;
                margin-left:-56px;
                border-radius:19.5px;
                background:var(--mainColor);
                text-align:center;
                color:#fff;
                font-size:14px;
                font-weight:bold;
                &:hover{
                    opacity:0.8;
                }
            }
        }
    }
    /* 上传ppt蒙层 */
    .import_ppt_masking{
        position:fixed;
        top:0;
        left:0;
        z-index:999;
        width:100%;
        height:100%;
        background:rgba(0,0,0,0.5);
        text-align:center;
        .import_ppt_loading{
            position:absolute;
            top:50%;
            left:50%;
            width: 4em;
            height: 4em;
            margin: -2em;
            background-color: var(--mainColor);
            -webkit-animation: import_ppt_loading 1.2s infinite ease-in-out;
            animation: import_ppt_loading 1.2s infinite ease-in-out;
        }
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

<script>
    export default{
        props: [
            'document_info'
        ],
        data(){
            return{
                show_modal: false,
                import_doc_list:[],
                import_team_list:[],
                importing_ppt: false,            // 上传ppt蒙层标识
                import_ppt_progress: 0,          // 上传进度标识
                import_source: 'online',         //当前导入文档来源
                show_online_doc_list:false,      //展开在线文档列表标识
                import_docinfo: {                //导入文档信息
                    docId: '',
                    targetDocId: '',
                    name: ''
                },

            }
        },
        methods: {
            open() {
                this.show_modal = true;
            },
            close() {
                this.show_modal = false;
                this.import_source = 'online';
                this.import_docinfo = {docId:'',targetDocId:"",name:"",file:""};
                this.show_online_doc_list = false;
                if($('#upload_ppt').length > 0) $('#upload_ppt')[0].value = '';
            },
            // 改变当前导入文档来源
            change_import_source(type) {
                this.import_source = type;
                this.import_docinfo = {docId:'',targetDocId:"",name:"",file:""};
                this.show_online_doc_list = false;
                if($('#upload_ppt').length > 0) $('#upload_ppt')[0].value = '';
            },
            // 展示文档列表
            toggle_online_doc_list() {
                let that = this;
                that.show_online_doc_list = !that.show_online_doc_list;
                if(that.show_online_doc_list && that.import_doc_list.length === 0){
                    that.get_user_doc();
                    that.get_team_doc();
                }
            },
            // 获取文档列表
            get_user_doc(item,index) {
                let that = this;
                that.$axios.get('/api/member/my_document/', {
                    params: {
                        fId: item ? item.id : '',
                        isOwnerRole:'',
                        keyword:''
                    }
                })
                .then(function(data) {
                    if(data.data.code === '2'){
                        that.package_document_list(data.data.data, function(list){
                            if(item && !item.documentPage){
                                that.import_doc_list[index].show_child = true
                                list.forEach(function(child,child_index){
                                    if(child.documentPage){
                                        child.grade = item.grade + 1;
                                    }
                                    if(item.parent){
                                        child.parent = item.parent + '_' + item.id
                                    }else{
                                        child.parent = item.id
                                    }
                                    that.import_doc_list.splice(index + child_index + 1, 0, child);
                                })
                            }else{
                                that.import_doc_list = list;
                            }
                        });
                    }
                });
            },
            // 获取团队文档列表
            get_team_doc(item,index) {
                let that = this;
                that.$axios.get('/api/member/my_team/', {params: {
					fid: item ? item.id : '',
				}})
                .then(function(data) {
                    if(data.data.code === '2'){
                       that.package_document_list(data.data.data, function(list){
                            if(item && !item.documentPage){
                                that.import_team_list[index].show_child = true
                                list.forEach(function(child,child_index){
                                    if(child.documentPage){
                                        child.grade = item.grade + 1;
                                    }
                                    if(item.parent){
                                        child.parent = item.parent + '_' + item.id
                                    }else{
                                        child.parent = item.id
                                    }
                                    that.import_team_list.splice(index + child_index + 1, 0, child);
                                })
                            }else{
                                that.import_team_list = list;
                            }
                        });
                    }
                });
            },
            // 文档列表组装
            package_document_list(value, callback) {
                let that = this;
                let document_list = [];
                if (!value || value.documentList <= 0) {
                    return;
                }
                let children_folders = value.childrenFolders || [];
                document_list = value.documentList;
                // 组装文档列表
                if(document_list.length > 0 || children_folders.length > 0){
                    // 重组文档列表 组合文件夹和文件
                    document_list = document_list.concat(children_folders);
                    document_list = document_list.sort(function(a,b){return b.topTime - a.topTime});
                    // 按时间戳排序
                    document_list = document_list.sort(function(a,b){return b.modifyDate - a.modifyDate});
                }
                if (typeof callback === 'function') callback(document_list);
            },
            // 进入文件夹
            enter_child_list(type,item,index) {
                let that = this,
                    data = type === 'team' ? 'import_team_list' : 'import_doc_list',
                    fuc = type === 'team' ? 'get_team_doc' : 'get_user_doc',
                    list = that[data];
                if(item.show_child){
                    item.show_child = false;
                    for (let len = list.length, i = len - 1; i >= 0; i--) {
                        if(list[i].parent && list[i].parent.toString().indexOf(item.id) >= 0){
                            list.splice(i,1);
                        }
                    }
                    that[data] = list;
                }else{
                    that[fuc](item,index);
                }
            },
            // 选中当前上传文档
            check_current_doc(item) {
                this.import_docinfo.docId = this.document_info.id;
                this.import_docinfo.targetDocId = item.id;
                this.import_docinfo.name = item.name;
                this.show_online_doc_list = false;
            },
            // 上传本地文档
            import_local_doc() {
                let that = this;
                let id = that.document_info.id;
                let files = $('#upload_ppt')[0].files;
                let file = '';
                let file_name = '';
                let can_import = true;
                if($validate(that.document_info.id).empty()){
                    that.$toast("保存之后才能操作哦",1000);
                    return;
                }
                if(!files || files.length <= 0) return that.$toast('未获取到文件,请重试',800);
                file = files[0];
                file_name = file.name.toLowerCase();
                if(!/(pptx|pdf)$/.test(file_name)){
                    can_import = false;
                    that.$toast('限定只有.ppt/.pdf 为后缀的文件才能上传',800);
                } 
                if(file.size/1024/1024 > 100){
                    can_import = false;
                    that.$toast('只能上传100M以下的文件哦~',800);
                } 
                if(!can_import){
                    //未通过校验，清空input的文件，并终止程序
                    $('#upload_ppt').val("");
                    that.import_docinfo.name = '';
                    that.import_docinfo.file = null;
                    that.import_ppt_progress = 0;
                    return;
                }
                let formData = new FormData();
                formData.append('file', file);
                formData.append('docId', id);
                that.import_docinfo.name = file_name;
                that.import_docinfo.file = formData;
            },
            // 导入文档
            import_ppt() {
                let that = this;
                let source = that.import_source;
                if (source === 'online' && that.import_docinfo.docId === '') {
                    that.$toast('请选择要导入的文档',800);
                    return;
                }
                if (source === 'local' && $('#upload_ppt').length > 0 && $('#upload_ppt')[0].value === '') {
                    that.$toast('请选择要导入的文档',800);
                    return;
                }
                that.importing_ppt = true;
                let callback = function(data){
                    that.importing_ppt = false;
                    if(data.data.code === '2'){
                        if($('#upload_ppt').length > 0) $('#upload_ppt')[0].value = '';
                        that.$parent.ws_doc_import_send(that.document_info.id);
                        that.$toast('导入成功,将自动刷新页面', 1500);
                        setTimeout(() => { 
                            window.location.reload();
                        }, 1500)
                    }else{
                        that.$toast(data.data.content, 1500);
                    }
                };
                let fail = () => {
                    that.import_ppt_progress = 0;
                    that.importing_ppt = false;
                }
                switch (true) {
                    case source === 'local' && /(pptx)$/.test(that.import_docinfo.name):
                        let import_progress_timer;
                        that.$axios({
                            url: '/api/member/document/import_doc/',
                            headers: { 'Content-Type': 'multipart/form-data' },
                            method: 'post',
                            data:that.import_docinfo.file,
                            dataType:'file',
                            timeout: 60000
                        })
                        .then(function(data){
                            if(data.data.code === '2') {
                                that.import_ppt_progress = 100;
                                clearInterval(import_progress_timer);
                                callback(data); 
                            }else{
                                clearInterval(import_progress_timer);
                                that.importing_ppt = false;
                                that.$toast(data.data.content, 2000);
                            }
                        })
                        .catch(function(info){
                            clearInterval(import_progress_timer);
                            that.importing_ppt = false;
                            that.$toast('导入失败',800);
                        });
                        import_progress_timer = setInterval(function(){
                            if(that.import_ppt_progress >= 95){
                                clearInterval(import_progress_timer);
                                that.import_ppt_progress = 0;
                            }else{
                                that.import_ppt_progress += 5;
                            }
                        }, 1000);                        
                        break;
                    case source === 'local' && /(pdf)$/.test(that.import_docinfo.name):
                        that.$common.import_pdf(that,that.import_docinfo.file,callback, fail);
                        break;
                    case source === 'online':
                        that.$axios.post('/api/member/document/import_online_doc/',
                            {
                                docId: that.document_info.id,
                                targetDocId: that.import_docinfo.targetDocId
                            }
                        )
                        .then(function(data){
                            callback(data);
                        })
                        .catch(function(info){
                            that.importing_ppt = false;
                            that.$toast('导入失败',800);
                        });
                        break;
                };
                $('#upload_ppt').val('');
            },
        }
    }
</script>