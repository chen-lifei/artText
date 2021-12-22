<template>
    <div class="work_modal">
        <!-- 我的作品弹框 -->
        <transition name="modal-fade">
            <div class="my_works_modal" v-if="my_works_show">
                <div class="my_works_contain">
                    <div class="header">
                        <span class="title">我的作品</span>
                        <button class="modal-close" @click.once="my_works_modal_toggle()"></button>
                    </div>
                    <div class="header_second">
                        <span>标题</span>
                        <span>发布时间</span>
                        <span>状态</span>
                        <span>幻币</span>
                        <span>操作</span>
                    </div>
                    <div class="body" v-if="my_works_list.length > 0">
                        <div class="my_works_list">
                            <div class="work_information" 
                                v-for="(item, index) in my_works_list"
                                :key="index">
                                <!-- 作品名称 -->
                                <p class="work_title"><span @click="to_work_detail(item.document)">{{item.name}}</span></p>
                                <!-- 发布时间 -->
                                <span class="time">{{item.time}}</span>
                                <!-- 发布状态 -->
                                <span class="status examining" v-if="item.status === 'examining'">审核中...</span>
                                <span class="status faild" v-if="item.status === 'failed'">未通过</span>
                                <span class="status pass"  v-if="item.status === 'pass'">已发布</span>
                                <span class="status deleted" v-if="item.status === 'deleted'">已删除</span>
                                <!-- 幻币数量 -->
                                <span class="hcoin" v-if="item.status === 'examining' || item.status === 'failed'">\</span>
                                <span class="hcoin had" v-else>+5</span>
                                <!-- 操作 -->
                                <button class="edit" v-if="item.status === 'examining'|| item.status === 'failed'" @click="description_modal_toggle(item)">编辑</button>
                                <button class="delete" v-if="item.status === 'examining'" @click="delete_upload_work(item, index)">撤销</button>
                                <button class="delete" v-if="item.status === 'failed'"  @click="delete_upload_work(item, index)">删除</button>
                                <span class="passed" v-if="item.status === 'pass'" @mouseenter="get_mouse_pos($event, true)" @mouseleave="get_mouse_pos($event, false)"/>
                            </div>
                        </div>
                    </div>
                    <div class="no_work" v-else>
                        <div class="content">
                        <img src="~@/assets/common/images/empty_1.png"/>
                        <p>你还没提交任何作品</p>
                        <button @click="upload_work_modal_toggle()">立即提交</button>
                    </div>
                    </div>
                </div>
                <div class="service_contain">
                    <div class="service_panel">
                        <img class="service_qrcode" :src="service_qrcode" alt=""/>
                        <base-logo type="code" width="35" height="35"></base-logo>
                    </div>
                    <p>如需删除已发布的作品，请扫码联系管理员</p>
                </div>
                <!-- 修改作品介绍弹框 -->
                <div class="description_modal" v-if="work_description_show">
                    <div class="description_contain">
                        <p class="description_title">标题</p>
                        <input maxlength="50" v-model="new_work_information.name" ref="work_name">
                        <p class="content_title">介绍说明</p>
                        <div class="description_content">
                            <textarea
                                type="text"
                                placeholder="请对您要上传的作品进行描述..."
                                maxlength="200"
                                v-model="new_work_information.description"
                            ></textarea>
                            <span>{{new_work_information.description.length}}/200</span>
                        </div>
                        <div class="description_operate">
                            <button class="cancel" @click="description_modal_toggle()">取消</button>
                            <button class="submit" 
                                    :class="{disabled:work_information.name === new_work_information.name && work_information.description === new_work_information.description}" 
                                    @click="save_work_description()">发布</button>
                        </div>
                    </div>
                </div>
            </div>
        </transition>
        <!-- 上传作品弹框 -->
        <transition name="modal-fade">
            <div class="upload_work_modal" v-if="upload_work_show">
                <div class="upload_work_contain">
                    <p class="title">提交作品</p>
                    <!-- 选择上传方式 -->
                    <div class="choose_upload_type">
                        <div class="online_doc" 
                            :class="{checked: upload_work_type === 'online_doc'}"
                            @click="choose_upload_type('online_doc')"><i></i><span>在线文档</span></div>
                        <div class="local_upload" 
                            :class="{checked: upload_work_type === 'local_upload'}"
                            @click="choose_upload_type('local_upload')"><i></i><span>本地上传</span></div>
                    </div>
                    <!-- 选择上传的文件 -->
                    <div class="choose_upload_work">
                        <!-- 本地文档 -->
                        <div class="add_local_work" v-if="upload_work_type === 'local_upload'">
                            <template v-if="!importing_ppt">
                                <input id="upload_ppt" type="file" accept=".ppt,.pptx" @change="import_ppt()">
                                <p class="no_doc">添加作品</p>
                                <p class="tips">上传作品仅支持ppt、pptx格式，文件大小不超过100MB</p>
                            </template>
                            <div class="add" v-else @click="choose_online_doc()">
                                <p class="doc_name">
                                    <span>{{current_local_doc_name}}</span> 
                                    <span class="count">{{import_ppt_progress}}%</span>
                                </p>
                                <div class='progress_bar'>
                                    <span class="progress" :style="{width:import_ppt_progress+'%'}"></span>
                                </div>
                                <p class="result" v-if="import_ppt_progress === 100">
                                    <span class="success">文件上传完成</span>
                                    <span class="again">重新上传</span>
                                    <input id="upload_ppt" type="file" accept=".ppt,.pptx" @change="import_ppt()"/>
                                </p>
                            </div>
                        </div>
                        <!-- 在线文档 -->
                        <div class="add_online_work" v-if="upload_work_type === 'online_doc'">
                            <p class="no_doc" v-if="my_online_doc_list.length === 0">你未创建任何文档</p>
                            <p class="add" 
                                :class="{checked:online_doc_show}" 
                                @click="choose_online_doc()"
                                v-else>
                                {{current_online_doc.name}}</p>
                            <ul class="my_online_doc" :class="{show:online_doc_show}">
                                <li v-for="item in my_online_doc_list"
                                    :class="{checked:item.id === current_online_doc.id}"
                                    :key="item.id"
                                    @click="choose_online_doc(item)"> 
                                {{item.name}}</li>
                            </ul>
                        </div>
                    </div>
                    <!-- 作品介绍 -->
                    <div class="work_description">
                        <p class="title">作品介绍</p>
                        <textarea
                            type="text"
                            placeholder="请描述你的作品..."
                            maxlength="200"
                            v-model="work_introduce"
                        ></textarea>
                        <span>{{work_introduce.length}}/200</span>
                    </div>
                    <p class="tips">
                        1、您上传提交的作品经过我们后台审核通过之后，将在共享作品页面展示，请务必确认作品文件的隐私权限；<br/>
                        2、上传提交审核通过的作品将获得 <span>5幻币</span>；
                    </p>
                    <div class="opearte">
                        <button class="cancel" @click.once="upload_work_modal_toggle()">取消</button>
                        <!-- 在线文档-提交 -->
                        <button class="submit online"
                                v-if="upload_work_type === 'online_doc'"
                                :class="{unable:work_introduce.length === 0 || !current_online_doc}"
                                :disable="work_introduce.length === 0 || !current_online_doc"
                                @click="upload_online_work()"
                                >提交</button>
                        <!-- 本地文档-提交 -->
                        <button class="submit"
                                v-else
                                :class="{unable:work_introduce.length === 0 || !current_local_doc_name}"
                                :disable="work_introduce.length === 0 || !current_local_doc_name"
                                @click="upload_local_work()"
                                v-bdtongji="`PC-统计-共享作品-作品上传-提交作品-提交`"
                                >提交</button>
                    </div>
                </div>
            </div>
        </transition>
    </div>
</template>

<style lang="less" scoped>
    @import url("~@/assets/pc/css/common.css");
    .my_works_modal{
        position: fixed;
        top: 0;
        left:0;
        z-index: 999;
        height: 100%;
        width: 100%;
        background-color: rgba(0, 0, 0, 0.502);
        overflow-y: auto;
        .my_works_contain{
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            max-width: 1130px;
            min-width: 860px;
            max-height: 690px;
            margin: 161px auto 30px;
            padding: 10px 32px;
            background: #fff;
            border-radius: 4px;
            overflow: hidden;
            overflow-y: scroll;
            cursor: default;
            .header{
                position: relative;
                display: flex;
                justify-content: space-between;
                padding: 15px 0;
                .title{
                    font-size: 18px;
                    font-weight: bold;
                    color: #3c3c3c;
                }
                .modal-close{
                    position: absolute;
                    right: -24px;
                    top:0px;
                }
            }
            .header_second{
                width: 100%;
                border-bottom: 1px solid #d0d0d0;
                white-space:nowrap;
                margin-bottom: 5px;
                span{
                    display: inline-block;
                    font-size: 14px;
                    height: 30px;
                    line-height: 30px;
                    color:#7b7b7b;
                    font-weight: bold;
                    text-align: left;
                    &:first-child{
                        width: 54%;
                    }
                    &:nth-child(2){
                        width: 17%;
                    }
                    &:nth-child(3){
                        width: 12%;
                    }
                    &:nth-child(4){
                        width: 11%;
                    }
                    
                }
            }
            .body{
                overflow-x: hidden;
                overflow-y: auto;
                overflow: hidden;
                .work_information{
                    height: 48px;
                    line-height: 48px;
                    border-bottom: 1px dotted #d3d9e3;
                    &:hover{
                        background:#f5f8fd;
                        .work_title span{
                            color: var(--mainColor);
                        }
                    }
                    .work_title{
                        display: inline-block;
                        width: 54%;
                        overflow: hidden;
                        span{
                                display: inline-block;
                                max-width: 95%;
                                bottom: 0;
                                vertical-align: top;
                                overflow: hidden;
                                font-size: 14px;
                                font-weight: bold;
                                color: #31363d;
                                text-overflow: ellipsis;
                                white-space: nowrap;
                                cursor: pointer;
                        }
                    }
                    span{
                        position: relative;
                        bottom: 20px;
                        display: inline-block;
                        font-size: 12px;
                    }
                    .time{
                        width: 17%;
                        color:#868d97
                    }
                    .status{
                        width: 13.2%;
                    }
                    .examining{
                        color: #ff5656;
                    }
                    .failed{
                        color: #585858;
                    }
                    .pass{
                        color: #09c361;
                        width: 12%;
                    }
                    .deleted{
                        color: #575757;
                        width: 12%;
                    }
                    .hcoin{
                        width:6.5%;
                        color: #686868;
                    }
                    .had{
                        color: var(--mainColor);
                        width: 10%;
                    }
                    button{
                        position: relative;
                        bottom: 20px;
                        border: solid 1px #d3d9e3;
                        border-radius: 11px;
                        font-size: 12px;
                        color: #8c94a0;
                        height: 24px;
                        width: 4%;
                        background:transparent;
                        transition:all .3s;
                        &.edit:hover{
                            background:var(--mainColor);
                            border-color:var(--mainColor);
                            color:#fff;
                        }
                        &.delete:hover{
                            background:#ff5656;
                            border-color:#ff5656;
                            color:#fff;
                        }
                    }
                    .edit{
                        margin-right: 10px;
                    }
                    .passed{
                        position: relative;
                        top: -15px;
                        left: 1.6%;
                        width:18px;
                        height:18px;
                        cursor:pointer;
                        background:url('~@/assets/pc/images/share/delete.png') center no-repeat;
                        &:hover{
                            background:url('~@/assets/pc/images/share/delete_hover.png') center no-repeat;
                        }
                    }
                }
            }
            .no_work{
                display: flex;
                justify-content: center;
                align-items: center;
                height: calc(100% - 100px);
                .modal-close{
                    position: absolute;
                    top: 10px;
                    right: 10px;
                }
                .content{
                    position: relative;
                    text-align: center;
                    img{
                        width: 187px;
                        height: 170px;
                    }
                    p{
                        text-align: center;
                        text-align: center;
                        font-size: 14px;
                        color: #656574;
                        margin:13px 0 43px;
                    }
                    button{
                        position: relative;
                        left: 3px;
                        width: 140px;
                        height: 42px;
                        background-color: #0064fa;
                        border-radius: 4px;
                        color: #fff;
                        font-size: 14px;
                        &:hover{
                            opacity: .8;
                        }
                    }
                }
            }
            &::-webkit-scrollbar{
                display: none;
            }
        }
        .service_contain{
            display: none;
            position: fixed;
            width: 290px;
            height: 196px;
            background-color: #ffffff;
            box-shadow: 0px 3px 7px 0px rgba(0, 0, 0, 0.08);
            border: solid 1px #e9e9e9;
            border-radius: 4px;
            .service_panel{
                position: relative;
                margin: 15px auto 0;
                width: 128px;
                height: 128px;
                img:not(.base-logo) {
                    height:100%;
                }
                .base-logo {
                    position: absolute;
                    top: 0;
                    right: 0;
                    margin: auto;
                    z-index: 1;
                }
            }
            p{
                margin-top: 15px;
                text-align: center;
                font-size: 12px;
                color: #686f79;
            }
            &:after{
                content: "";
                position: absolute;
                right: 23px;
                bottom: -6px;
                width: 0;
                height: 0;
                border-left: 6px solid transparent;
                border-right: 6px solid transparent;
                border-bottom: 6px solid #fff;
                transform: rotate(180deg);
            }
        }
        .description_modal{
            position:relative;
            top: 0;
            left:0;
            right:0;
            bottom:0;
            height: 100%;
            max-width: 1130px;
            max-height: 690px;
            margin: 161px auto 30px;
            padding:10px 32px;
            background:#fff;
            border-radius:4px;
            z-index: 10;
            background-color: rgba(246, 246, 246, 0.7);
            .description_contain{
                position: absolute;
                top: 0;
                bottom: 0;
                left: 0;
                right: 0;
                max-width: 530px;
                max-height: 370px;
                margin:auto;
                padding:27px 35px;
                background:#fff;
                border-radius:4px;
                box-shadow: 0px 6px 13px 0px rgba(89, 96, 117, 0.1);
                .description_title{
                    font-size: 14px;
                    color: #828282;
                    height: 22px;
                    line-height: 18px;
                    font-weight: bold;
                }
                input{
                    width: 100%;
                    border-radius: 4px;
                    border: solid 1px #e3e8f0;
                    height: 38px;
                    line-height: 38px;
                    color:#626a75;
                    font-size: 14px;
                    padding-left: 10px;
                }
                .content_title{
                    font-size: 14px;
                    font-weight: bold;
                    color: #828282;
                    height: 50px;
                    line-height: 60px;
                }
                .description_content{
                    position:relative;
                    width:100%;
                    height:140px;
                    textarea{
                        width:100%;
                        height:140px;
                        resize: none;
                        padding:11px;
                        border-radius: 4px;
                        border: solid 1px #e3e8f0;
                        line-height: 18px;
                        letter-spacing: 0px;
                        color: #626a75;
                        &::-webkit-input-placeholder {
                            color: #bbbbbb;
                        }
                        &:-moz-placeholder {
                            color: #bbbbbb;
                        }
                        &::-moz-placeholder {
                            color: #bbbbbb;
                        }
                        &:-ms-input-placeholder {
                            color: #bbbbbb;
                        }
                    }
                    span{
                        position: absolute;
                        display: inline-block;
                        right: 11px;
                        bottom: 9px;
                        color: #c6c6c6;
                    }
                }
                .description_operate{
                    position: relative;
                    display: flex;
                    justify-content: center;
                    margin-top: 35px;
                    button{
                        height: 40px;
                        width: 100px;
                        background-color: var(--mainColor);
                        border-radius: 4px;
                        font-size: 14px;
                        color: #ffffff;
                        &:first-child{
                            margin-right: 18px;
                            background-color: #e9eef2;
                            color: #6c6c6c;
                            &:hover{
                                background: #ff5656;
                                border-color: #ff5656;
                                color: #fff;
                            }
                        }
                        &.disabled{
                            background-color: #e9eef2;
                            color: #6c6c6c;
                        }
                        &:hover{
                            opacity: .7;
                        }
                    }
                }
            }
        }
    }
    .upload_work_modal{
        position: fixed;
        top: 0;
        left:0;
        z-index: 999;
        height: 100%;
        width: 100%;
        background-color: rgba(0, 0, 0, 0.502);
        overflow-y: auto;
        .upload_work_contain{
            position: absolute;
            top: 33%;
            left: 0;
            right: 0;
            bottom: 0;
            width: 570px;
            max-height: 493px;
            margin: -152px auto;
            padding: 16px 28px;
            background: #fff;
            border-radius: 4px;
            overflow: hidden;
            .title{
                font-size: 18px;
                font-weight: bold;
                color: #3c3c3c;
                cursor: default;
            }
            .choose_upload_type{
                width: 100%;
                margin-top:27px;
                margin-bottom: 10px;
                user-select: none;
                i{
                    position: relative;
                    bottom: -3px;
                    background: #fff;
                    border: 1px solid #C6C6C6;
                    border-radius: 4px;
                    width: 16px;
                    height: 16px;
                    display: inline-block;
                    margin-right: 8px;
                }
                span{
                    font-size: 14px;
                    font-weight: bold;
                    color: #3c3c3c;
                }
                .local_upload{
                    display: inline-block;
                    cursor: pointer;
                    &:hover i{
                        border: solid 1px var(--mainColor);
                    }
                    &.checked i{
                        background:url(~@/assets/pc/images/share/icon_checked.png) no-repeat;	
                        border:none; 
                    }
                }
                .online_doc{
                    display: inline-block;
                    margin-right: 57px;
                    cursor: pointer;
                    &:hover i{
                        border: solid 1px var(--mainColor);
                    }
                    &.checked i{
                        background:url(~@/assets/pc/images/share/icon_checked.png) no-repeat;	
                        border:none;
                    }
                }
            }
            .choose_upload_work{
                position: relative;
                width: 100%;
                .add_local_work{
                    width: 100%;
                    border-radius: 4px;
                    .no_doc{
                        position: relative;
                        width: 100%;
                        height: 45px;
                        line-height: 45px;
                        font-size: 14px;
                        color:var(--mainColor);
                        text-align: center;
                        margin-bottom: 9px;
                        background-color: #eef1f4;
                        cursor: pointer;
                        &:before{
                            content: '';
                            position: absolute;
                            top: 21px;
                            right: 293px;
                            border-top:3px solid var(--mainColor);
                            width:13px;
                        }
                        &:after{
                            content: '';
                            position: absolute;
                            top: 17px;
                            right: 298px;
                            border-right:3px solid var(--mainColor);
                            height:12px;
                        }
                    }
                    .add{
                        position: relative;
                        width: 100%;
                        height: 45px;
                        font-size: 14px;
                        color:#3c3c3c;
                        text-align: left;
                        margin-bottom: 52px;
                        p{
                            display: flex;
                            justify-content: space-between;
                            font-size: 12px;
                        }
                        .progress_bar{
                            position:relative;
                            width:100%;
                            height:6px;
                            border-radius: 3px;
                            background:#ececec;
                            .progress{
                                position:absolute;
                                top: 0;
                                display: inline-block;
                                width: 100%;
                                height: 6px;
                                border-radius: 3px;
                                background: var(--mainColor);
                                z-index:1;
                            }
                        }
                        .doc_name{
                            margin-bottom: 5px;
                            color: #3c3c3c;
                            span{
                                color: #3c3c3c;
                            }
                            .count{
                                color:var(--mainColor);
                                font-weight: normal;
                            }
                        }
                        .result{
                            position: relative;
                            margin-top:12px;
                            .success{
                                color: #34d6ae;
                                &:before{
                                    content: '';
                                    padding-left: 16px;
                                    margin-right: 4px;
                                    background: url('~@/assets/pc/images/share/succes_icon.png') no-repeat;
                                }
                            }
                            .again{
                                position: relative;
                                text-decoration: underline;
                            }
                            input{
                                position: absolute;
                                right:0;
                                height: 16px;
                                width: 50px;
                                cursor: pointer;
                            }
                        }
                    }
                    .tips{
                        font-size: 12px;
                        color: #8e8e8e;
                        margin-bottom: 30px;
                        cursor:default;
                    }
                    input{
                        position:absolute;
                        top:0;
                        right:0;
                        width:100%;
                        height:45px;
                        font-size:0;
                        opacity:0;
                        z-index:2;
                        cursor:pointer;
                        &:hover +.no_doc{
                            opacity: .8;
                        }
                    }
                }
                .add_online_work{
                    width: 100%;
                    border-radius: 4px;
                    .no_doc{
                        position: relative;
                        width: 100%;
                        height: 45px;
                        line-height: 45px;
                        font-size: 14px;
                        color: #b1b1b1;
                        text-align: left;
                        margin-bottom: 52px;
                        background-color: #eef1f4;
                        padding-left: 17px;
                    }
                    .add{
                        position: relative;
                        width: 100%;
                        height: 45px;
                        line-height: 45px;
                        font-size: 14px;
                        color:#3c3c3c;
                        text-align: left;
                        margin-bottom: 52px;
                        background-color: #eef1f4;
                        padding-left: 17px;
                        border-radius: 4px;
                        border: solid 1px transparent;
                        user-select: none;
                        cursor: pointer;
                        &:hover{
                            border-color: var(--mainColor);
                        }
                        &:after{
                            content: "";
                            position: absolute;
                            right: 3%;
                            top:33%;
                            width: 8px;
                            height: 8px;
                            border: 2px solid #a3a3a3;
                            border-top-color: transparent;
                            border-left-color: transparent;
                            transition: all .2s;
                            transform: rotate(45deg);
                        }
                        &.checked{
                            &:after{
                                top:46%;
                                transform: rotate(225deg);
                            }
                        }
                    }
                    .my_online_doc{
                        display: none;
                        position: absolute;
                        top: 45px;
                        width: 100%;
                        background-color: #fff;
                        z-index: 10;
                        padding: 17px;
                        border-radius: 4px;
                        border: solid 1px #e4e8ed;
                        overflow-x: hidden;
                        overflow-y: auto;
                        max-height: 252px;
                        li{
                            font-size: 12px;
                            line-height: 36px;
                            text-align: left;
                            color: #3c3c3c;
                            cursor: pointer;
                            &:hover,&.checked{
                                color:var(--mainColor);
                            }
                        }
                        &.show{
                            display: block;
                            transition:all .5s;
			                transform:translate3d(0,0,0);
                        }
                        &::-webkit-scrollbar-track {
                            background: transparent;
                        }
                    }
                }
            }
            .work_description{
                position:relative;
                width: 100%;
                margin-bottom: 16px;
                .title{
                    font-size: 14px;
                    color: #353535;
                    font-weight: bold;
                    margin-bottom:8px;
                }
                textarea{
                    width:100%;
                    height:120px;
                    resize: none;
                    padding:11px;
                    border-radius: 4px;
                    border: solid 1px #e3e8f0;
                    line-height: 18px;
                    letter-spacing: 0px;
                    color: #626a75;
                    &::-webkit-input-placeholder {
                        color: #bbbbbb;
                    }
                    &:-moz-placeholder {
                        color: #bbbbbb;
                    }
                    &::-moz-placeholder {
                        color: #bbbbbb;
                    }
                    &:-ms-input-placeholder {
                        color: #bbbbbb;
                    }
                }
                span{
                    position: absolute;
                    display: inline-block;
                    right: 11px;
                    bottom: 9px;
                    color: #c6c6c6;
                }
            }
            .tips{
                display: inline-block;
                font-size:12px;
                color:#3c3c3c;
                line-height: 18px;
                cursor: default;
                span{
                    color: var(--mainColor);
                }
            }
            .opearte{
                position: relative;
                display: flex;
                justify-content: center;
                margin-top: 16px;
                button{
                    height: 42px;
                    width: 100px;
                    background-color: var(--mainColor);
                    border-radius: 4px;
                    font-size: 14px;
                    color: #ffffff;
                    border: solid 1px #cad0d9;
                    &:hover{
                        border-color:var(--mainColor);
                    }
                    &:first-child{
                        margin-right: 24px;
                        background-color: #ffffff;
                        color: #6c6c6c;
                    }
                    &.unable{
                        border-color:#cad0d9;
                        background:#d2dbe6;
					    cursor: default;
                    }
                }
            }
        }
    }
</style>

<script>
    export default {
        name: "WorksShareManagement",
        data(){
            return{
                my_works_show: false,                 // 我的作品弹框展示标识
                upload_works_show: false,             // 提交作品弹框展示标识
                my_works_list:[],                     // 我的作品列表
                work_description_show: false,         // 作品描述弹框展示标识
                work_information:{},                  // 要修改的作品的信息   
                new_work_information: '',             // 修改后的作品的信息
                upload_work_show:false,               // 上传作品展示标识
                upload_work_type: 'online_doc',       // 上传作品方式（默认为本地上传）     
                online_doc_show: false,               // 在线文档下拉框展示标识 
                my_online_doc_list: [],               // 我的文档列表    
                current_online_doc: {},               // 选择的在线文档
                document_page_list: [],               // 选中的在线文档的文档页列表    
                work_introduce: '',                   // 作品介绍
                current_local_doc_name: '',           // 选择的本地文档名称
                local_work_url: [],                   // 本地文档链接
                import_ppt_progress: 0,               // 导入ppt进度
                importing_ppt: false,                 // 展示导入ppt蒙层
                service_qrcode: '',				      // 交流群二维码链接
            }
        },
        methods:{
            // 我的作品弹框控制方法
            my_works_modal_toggle: function() {
                let that = this;
                if(that.my_works_show) {
                    that.my_works_show = false;
                }else{
                        that.service_qrcode = `https://file.woodo.cn/upload/foreverImage/kefu_qrcode.png?v=${new Date().getTime()}`;
                        that.my_works_show = true;
                        that.$axios.get('/api/member/apply_document/works_share/list/')
                        .then(function(data){
                            if(data.data.code === '2'){
                                let list = data.data.data;
                                for(let i = 0; i < list.length; i++) {
                                    list[i].time = utils.dateFormat(new Date(list[i].createDate), 'yyyy-MM-dd');
                                }
                                that.my_works_list = list;
                            }else{
                                that.$toast(data.data.content, 1000);
                            }
                        })
                    }
            },
            // 提交作品弹框控制方法
            upload_work_modal_toggle: function() {
                let that = this;
                that.my_works_show = false;
                that.upload_work_show = ! that.upload_work_show;
                that.online_doc_show = false;
                that.work_introduce = '';
                that.current_local_doc_name = '';
                that.import_ppt_progress = 0;
                that.importing_ppt = false;
                that.choose_upload_type('online_doc');
                $('.online').text('提交');
            },
            // 修改作品信息弹框控制方法
            description_modal_toggle: function(item) {
                let that = this;
                if(that.work_description_show) {
                    that.work_description_show = false;
                }
                else{
                    that.new_work_information = utils.deepClone(item);
                    that.work_information = item;
                    that.work_description_show = true;
                }
            },
            // 撤销上传作品方法
            delete_upload_work: function(item, index){
                let that = this;
                that.$axios.post('/api/member/apply_document/works_share/delete/',{
                    id: item.id,
                })
                .then(function(data){
                    if(data.data.code === '2'){
                        that.my_works_list.splice(index,1);
                        that.$toast('撤销成功', 1000);
                    }else{
                        that.$toast(data.data.content, 1000)
                    }
                })
            },
            // 保存修改的作品介绍
            save_work_description: function(){
                let that = this,
                    value = that.new_work_information.description,
                    work_title = that.new_work_information.name;
                // 判断为空
                if (value.length === 0) {
                    return that.$toast("作品介绍不能为空噢！");
                }
                if (work_title.length === 0) {
                    return that.$toast("标题不能为空噢！");
                }
                // 判断超出大小限制
                if (work_title.length > 50) {
                    return that.$toast("标题不能超过50个字噢！");
                }
                if (value.length > 200) {
                    return that.$toast("介绍说明不能超过200个字噢！");
                }
                // 非常规字符拦截
                if ($validate(work_title).special()) {
                    return that.$toast("标题不能包含特殊字符！");
                }
                if ($validate(value).special()) {
                    return that.$toast("内容不能包含特殊字符！");
                }
                // 信息未更改时，不请求接口
                if (that.work_information.name === that.new_work_information.name && that.work_information.description === that.new_work_information.description){
                    return that.$toast('当前尚未更改任何信息，请更改后发布!')
                }
                that.$axios.post('/api/member/apply_document/works_share/update/',{
                        name: that.new_work_information.name,
                        description: that.new_work_information.description,
                        id: that.new_work_information.id,
                })
                .then(function(data){
                    if(data.data.code === '2'){
                        that.$toast('发布成功', 2000);
                        that.work_description_show = false;
                        that.work_information.name = that.new_work_information.name;
                        that.work_information.description = that.new_work_information.description;
                    }else{
                        that.$toast(data.data.content, 2000);
                    }
                })
            },
            // 提交作品弹框中切换作品上传方式
            choose_upload_type: function(type){
                let that = this;
                that.upload_work_type = type;
                if(type === 'local_upload'){
                    that.online_doc_show = false;
                    $('.online').text('提交');
                }else{
                    // 接口控制
                    if(that.my_online_doc_list.length !== 0 && !that.current_online_doc.name){ 
                        // 获取到的文档列表
                        that.current_online_doc = that.my_online_doc_list[0];
                    }else if(that.current_online_doc.name){
                        return false;
                    }else {
                        that.$axios.get('/api/member/document/list/')  
                        .then(function(data){
                            if(data.data.code === '2'){
                                that.my_online_doc_list = data.data.data;
                                that.current_online_doc = that.my_online_doc_list[0];
                            }else{
                                that.$toast(data.data.content, 1000)
                            }
                        })
                    }
                }
            },
            // 导入本地ppt/pptx
            import_ppt: function(){
                let that = this,
                    files = $('#upload_ppt')[0].files,
                    file, file_name,_progresscount_timer;
                that.import_ppt_progress = 0;
                that.current_local_doc_name = '';
                if(!files || files.length <= 0) return that.$toast('未获取到文件,请重试',800);
                file = files[0];
                file_name = file.name.toLowerCase();
                if(!/(pptx|ppt)$/.test(file_name)) return that.$toast('限定只有.pptx/.ppt 为后缀的文件才能上传',2000);
                if(file.size/1024/1024 > 100) return that.$toast('只能上传100M以下的文件哦~',2000);
                let formData = new FormData();
                formData.append('file', file);
                formData.append('fileType', 'applyDocument');
                that.importing_ppt = true;
                if(/(pptx|ppt)$/.test(file_name)){
	                that.$axios({
	                    url: '/api/file/upload/',
	                    headers: { 'Content-Type': 'multipart/form-data' },
	                    method: 'post',
                        data:formData,
                        dataType: 'file'
                    })
                    .then(function(data){
						if(data.data.code === '2'){
                            var uploadFile = [];
                            uploadFile.push(data.data.data);
                            // 去除文件名后缀
                            uploadFile.push(file.name.slice(0,file.name.lastIndexOf('.')));
                            that.local_work_url.push(uploadFile);   
                            that.current_local_doc_name = file_name;
                            that.import_ppt_progress = 100;
							that.$toast('导入成功',800);
						}else{
                            that.importing_ppt = false;
                            that.$toast('导入失败', 2000);
                        }
                        clearInterval(_progresscount_timer);
					}).catch(function(info){
                        that.importing_ppt = false;
                        that.$toast('导入失败',800);
					});
                }
                _progresscount_timer = setInterval(function(){   	
                    if(that.import_ppt_progress >= 95){
                        clearInterval(_progresscount_timer);
                    }else{
                        that.import_ppt_progress += 5;
                    }
                },500);
                if(that.upload_work_type === 'online_doc' || !that.upload_work_show){
                    clearInterval(_progresscount_timer);
                }
            },
            // 选择在线作品
            choose_online_doc: function(item) {
                let that = this;
                if(item){
                    that.current_online_doc = item;
                }
                that.online_doc_show = ! that.online_doc_show;
            },
            // 获取在线文档封面
            get_online_doc_detail: function(docId,success){
                let that = this;
                that.$axios.get(`/api/member/document/detail/${docId}/`)
                .then(function(data){
                    if(data.data.code === '2'){
                        if (typeof success === 'function') success(data.data.data);
                    }
                })
            },
            // 提交在线作品方法
            upload_online_work: function(){
                let that = this;
                if(!that.current_online_doc.name){
                    that.$toast('作品不能为空！', 1000);
                    return false;
                }
                if(that.work_introduce.length === 0){
                    that.$toast('作品介绍不能为空！', 1000);
                    return false;
                }
                // 特殊符号判断
                if ($validate(that.current_online_doc.name).special()) {
                    return that.$toast('名称不可带有特殊符号',1000);
                }
                if ($validate(that.work_introduce).special()) {
                    return that.$toast('作品介绍不能带有特殊符号',1000);
                }
                $('.online').text('正在提交中');
                // 生成文档封面
                that.get_online_doc_detail(that.current_online_doc.id, (doc_obj) => {
                    let document_info = that.$common.document_dataparse(doc_obj.document);
                    let document_pages = that.$common.document_pages_dataparse(doc_obj.documentPages);
                    let page_svg = that.$common.obj_2_svg(document_info, document_pages[0]),
                        get_base64 = that.$common.svg_2_base64(page_svg);
                    get_base64.then(function(data){
                        that.$axios.post('/api/member/apply_document/works_share/save/',{
                            name: that.current_online_doc.name,
                            description: that.work_introduce,
                            documentId: that.current_online_doc.id,
                            image:data
                        })
                        .then(function(data){
                            that.$toast(data.data.content, 4000);
                            if(data.data.code === '2'){
                                that.upload_work_show = false;
                            }
                            $('.online').text('提交');
                        })
                    })
                })
            },
            // 提交本地作品方法
            upload_local_work: function() {
                let that = this;
                if(!that.current_local_doc_name){
                    that.$toast('作品不能为空！', 1000);
                    return false;
                }
                if(that.work_introduce.length === 0){
                    that.$toast('作品介绍不能为空！', 1000);
                    return false;
                }
                // 特殊符号判断
                if ($validate(that.current_local_doc_name).special()) {
                    return that.$toast('名称不可带有特殊符号',1000);
                }
                that.$axios.post('/api/member/apply_document/works_share/save/',{
                    name: that.local_work_url[0][1],
                    description: that.work_introduce,
                    file: JSON.stringify(that.local_work_url),
                })
                .then(function(data){
                    if(data.data.code === '2'){
                        that.upload_work_show = false;
                    }
                    that.$toast(data.data.content, 4000);
                })
            },
            // 在线作品前往编辑页
            to_work_detail: function(id) {
                let that = this;
                if(id){
                    utils.windowOpenNewtab(window.location.origin + '/edit/?docId='+id)
                }else{
                    that.$toast('该文档为本地文档，无法查看！')
                }
            },
            // 获取鼠标位置
            get_mouse_pos(e, type){
                let that = this,
                    event = e || window.event,
                    x = event.clientX || event.pageX,
                    y = event.clientY || event.pageY;
                if(type){
                    $('.service_contain').css({"top":y - 218,"left": x - 265,"display":"block"})
                }else{
                    $('.service_contain').css("display","none");
                }
            }
        }
    }
</script>
