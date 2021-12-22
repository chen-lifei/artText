<template>
	<div class="page_contain">
		<!-- 通用头部 -->
		<CommonHead :options="head_options"></CommonHead>
        <div class="contain_wrapper">
            <div class="template_head">
                <div class="bread_head">
                    <a href="/template/" v-if="template_info.type === 'slides'">模板中心</a>
                    <a href="/design/" v-else>设计实验室</a>
                    ><a href="#">{{template_info.name}}</a>
                </div>
            </div>
            <!-- 左侧栏预览 -->
            <div class="template_left" :class="{design_left:template_info.type === 'design'}" ref="templateLeft">
                <!-- 模版预览页 -->
                <div class="template_content" v-show="template_info.type === 'slides'">
                    <div class="current_image" ref="height">
                        <button class="previous" @click="change_preview(1)" :disabled='!change_pre_active' :class="{disabled:!change_pre_active}"></button>
                        <button class="next" @click="change_preview(-1)" :disabled='!change_next_active' :class="{disabled:!change_next_active}"></button>
                        <svg_modal ref="svg_modal" 
                            :svg_w="svg_preview_template.w"
                            :svg_h="svg_preview_template.h"
                            :svg_view="svg_preview_template.view"
                            :document="document_info"
                            :page_info="current_page_info"
                        ></svg_modal>
                    </div>
                    <div class="template_thumbnail" ref="thumbnail">
                        <div class="thumbnail_card"
                            v-for="(item,index) in preview_template_list"
                            :key="index"
                            @click="check_thumbnail(item,index)"
                            :class="current_preview_index === index ? 'current' : ''"
                            ref="thumbnail_card"
                        >
                            <div :style="{width:`${thumbnail_pages_template.w + 4}px`, height:`${thumbnail_pages_template.h + 4}px`}">
                                <svg_modal ref="svg_modal" 
                                    :svg_w="thumbnail_pages_template.w"
                                    :svg_h="thumbnail_pages_template.h"
                                    :svg_view="thumbnail_pages_template.view"
                                    :document="document_info"
                                    :page_info="item"
                                    :mode="`thumbnail`"
                                ></svg_modal>
                            </div>
                            <span>{{index +1}}</span>
                        </div>
                    </div>
                </div>
                <!-- 设计预览页 -->
                <div  class="design_content" v-show="template_info.type === 'design'">
                    <div class="current_image" ref="height">
                        <div class="design_image">
                            <span class="amplify">查看大图
                                <span :style="{maxHeight:screen_h-166+'px',minHeight:123}"><img :src="template_info.image" :style="{height:template_detail.document.height ? template_detail.document.height+'px' && template_detail.document.width <= 700:'auto',width:template_detail.document.width && template_detail.document.width <= 700 ? template_detail.document.width+'px':'700px'}"></span>
                            </span>
                            <div style="margin:0 auto;" :style="{width:`${svg_preview_template.view[2] * (svg_preview_template.w / svg_preview_template.view[2])}px`, height:`${svg_preview_template.view[3] * (svg_preview_template.h / svg_preview_template.view[3])}px`}">
                                <svg_modal ref="svg_modal" 
                                    :svg_w="svg_preview_template.w"
                                    :svg_h="svg_preview_template.h"
                                    :svg_view="svg_preview_template.view"
                                    :document="document_info"
                                    :page_info="current_page_info"
                            ></svg_modal>
                            </div>
                        </div>
                    </div>
                </div>
                <!-- 更多模板页 -->
                <div class="template_pannel" v-show="template_info.type === 'design'">
                    <span class="box_shadow"></span>
                    <div class="template_list_contain">
                        <div class="recommend_title">
                            <span>以下是我们为您推荐的模板</span>
                            <a :href="template_info.type === 'slides' ? '/template/' : '/design/'">更多></a>
                        </div>
                        <div class="design_list_wrapper">
                            <div class="template_list">
                                <div class="template_item" v-for="(item,index) in template_recommend_list" :key="index" v-show="index < 3" @click="check_detail(item.id)">
                                    <div class="img_box">
                                        <img :src="item.image">
                                        <div class="hover">
                                            <div class="hover_box">
                                                <img :src="item.image">
                                            </div>
                                            <span class="edit" @click.stop="use_template(item)">立即编辑</span>
                                            <p>{{item.categoryName}}</p>
                                            <p class="template_size">{{item.width}} × {{item.height}}px</p>
                                            <div class="template_info">
                                                <span class="title">{{item.name}}</span>
                                                <span class="use_count">{{item.usenum || 0}}人使用</span>
                                                <span class="collect_count">{{item.collectCount || 0}}人收藏</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <span class="box_shadow"></span>
                </div>
            </div>
            <!-- 右侧栏信息 -->
            <div class="template_right" ref="templateRight">
                <div class="header">
                    <p class="template_title">{{template_info.name == null ? '-': template_info.name}}</p>
                    <div class="template_message">
                        <span>文件格式：{{template_info.type === 'design' ? 'PNG':'PPTX'}}</span>
                        <span>使用次数：{{template_info.usenum == null ? '0': template_info.usenum}}</span>
                        <span v-if="template_info.type !== 'design'">文件页数：{{total_pages}}</span>
                        <span class="size_icon" v-if="template_info.type === 'design'">尺寸：{{template_detail.document.width+' X '+template_detail.document.height}}px</span>
                        <span>文档分类：{{template_detail.category == null ? '-': template_detail.category}}</span>
                    </div>
                    <div class="author_message" v-if="template_type === 'slides'">
                        <div class="author_photo">
                            <img v-if="author_info.headUrl" :src="author_info.headUrl" />
                            <base-logo v-else type="icon" theme="gray" width="42" height="42"></base-logo>
                        </div>
                        <p>贡献者：<span class="author_name">{{author_info.name == null ? '吾道': author_info.name}}</span></p>
                        <p>作品：<span class="author_template">{{author_info.count == null ? '-': author_info.count}}</span></p>
                        <a @click="author_center(author_info.id)" v-bdtongji="'模板中心-模板预览页-右侧-右侧-TA的主页'">[ TA的主页 ]</a>
                    </div>
                    <div class="template_operate">
                        <a :class="{collect:collect}" @click="collect_template(template_info.documentId)" v-bdtongji="'模板中心-模板预览页-右侧-右侧-收藏'"><span>{{template_info.collectCount == null ? '0': template_info.collectCount}}人收藏</span></a>
                        <a @click="open_share" v-bdtongji="'模板中心-模板预览页-右侧-右侧-分享'"><span>分享</span></a>
                        <a :class="{'lock' : template_info.isVip && !user_info.memberVipEffect}" v-tooltip="template_info.isVip && !user_info.memberVipEffect ? '会员专享模板':''" @click="use_template(template_info)" v-bdtongji="`${template_info.type === 'design' ? 'PC-统计-设计实验室-创建' : '模板中心-模板预览页-右侧-右侧-立即制作'}|${template_info.type === 'slides' ? `PC-统计-模板中心-${template_info.name}-${template_info.id}-${template_info.sn}-最新` : ''}`">
                            <span>立即制作<i></i></span>
                        </a>
                    </div>
                </div>
                <div class="body">
                    <div class="related_title">
                        <span>其它相关模板</span>
                        <a :href="template_info.type === 'slides' ? '/template/' : '/design/'" v-bdtongji="'模板中心-模板预览页-推荐模板区-右上角-更多'">更多></a>
                    </div>
                    <ul class="related_template" :class="{related_design:template_info.type === 'design'}">
                        <li v-for="(item,index) in related_template_list" :key="index" @click="check_detail(item.id)" v-bdtongji="'模板中心-模板预览页-推荐模板区-全部-推荐汇总'">
                            <img v-show="item.image !== ''" :src="item.image">
                        </li>
                    </ul>
                </div>
            </div>
        </div>
        <!-- 猜你喜欢 -->
		<div class="template_pannel" v-show="template_info.type !== 'design'">
			<div class="template_list_contain">
				<div class="recommend_title">
					<span>以下是我们为您推荐的模板</span>
					<a href="/template/">更多></a>
				</div>
				<div class="list_wrapper">
					<div class="template_list" v-for="(item,index) in template_recommend_list" :key="index" @mouseover='template_masking_event(index,true)' @mouseout='template_masking_event(index,false)'>
						<div class="list_contain">
                            <img v-if="item.image !== ''" :src="item.image">
                            <transition name="modal-fade">
                                <div class="masking" v-show="template_masking_show && template_index == index">
                                    <div class="wrapper">
                                        <a @click="use_template(item)" class="edit" :class="{'lock' : item.isVip && !user_info.memberVipEffect}" v-tooltip="item.isVip && !user_info.memberVipEffect ? '会员专享模板':''">立即编辑<i></i></a>
                                        <a class="detail" @click="check_detail(item.id)">查看详情</a>
                                    </div>
                                    <button class="collect" :class="{had_collected:favorite_map[item.documentId]}" @click="collect_template(item.documentId)"></button>
                                </div>
                            </transition>
						</div>
						<p class="title">{{item.name}}</p>
					</div>
					<div class="template_list" style="background-color:transparent;height:0;padding:0;"></div>
					<div class="template_list" style="background-color:transparent;height:0;padding:0;"></div>
					<div class="template_list" style="background-color:transparent;height:0;padding:0;"></div>
					<div class="template_list" style="background-color:transparent;height:0;padding:0;"></div>
					<div class="template_list" style="background-color:transparent;height:0;padding:0;"></div>
					<div class="template_list" style="background-color:transparent;height:0;padding:0;"></div>
					<div class="template_list" style="background-color:transparent;height:0;padding:0;"></div>
					<div class="template_list" style="background-color:transparent;height:0;padding:0;"></div>
				</div>
			</div>
		</div>
        <CommonFoot></CommonFoot>
        <Share_modal ref="share_modal"></Share_modal>
	</div>
</template>

<style lang="less" scoped>
	@import url("~@/assets/pc/css/common.css");
    @background_image: url(~@/assets/pc/images/doc/doc_view_icon.png) no-repeat;
	@template_sp: url(~@/assets/pc/images/template/template_sp.png) no-repeat;

    @skeleton_color: #fafafa;
    @image_loading: url(/public/images/common/logo-text-gray.png) center center no-repeat;
	// 主体
	.page_contain{
		min-width:1240px;
        overflow:auto;
        background:#fafafa;
        .contain_wrapper{
            width:1240px;
            margin:0 auto;
        }
    }
    .template_head{
        position: relative;
        text-align:left;
        .bread_head{
            height:60px;
            line-height:60px;
            font-size:12px;
            color:#7b7b7b;
            a{
                display:inline; 
                font-size:12px;
                color:#7b7b7b;
                &:hover{
                    color:var(--mainColor);
                }
            }
        }
    }
    .template_left{
        position: relative;
        display:inline-block;
        vertical-align:top;
        width:828px;
        height:100%;
        padding:6px;
        padding-bottom:61px;
        background-color:#fff;
        box-shadow: 0px 3px 3px -3px  rgba(0, 0, 0, 0.05);
        &.design_left{
            padding-bottom:6px;
        }
        .current_image{
            position:relative;
            display:block;
            width:100%;
            height:100%;
            min-height:462px;
            max-height: 860px;
			background: @image_loading;
        }
        .design_content{
            display:flex;
            align-items:center;
            max-height: 860px;
            min-height:640px;
        }
        .design_content .design_image{
            display:flex;
            height:100%;
            min-height:462px;
            max-height: 860px;
            align-items:center;
            background:#F2F1F6;
            &>img{
                display:inline-block;
                object-fit:contain;
                max-height:740px;
                max-width: 100%;
                margin:0 auto;
            }
            .amplify{
                position:absolute;
                display:flex;
                justify-content:center;
                top:10px;
                right:10px;
                padding:5px 10px;
                font-size:14px;
                color:#fff;
                background:rgba(0, 0, 0, 0.2);
                border-radius:24px;
                cursor:pointer;
                &>span{
                    display:none;
                }
            }
            .amplify:hover>span,.amplify>span:hover{
                position: absolute;
                display:block;
                max-width:1240px;
                min-width:420px;
                top: 0;
                right: 76px;
                padding: 10px;
                background-color: #fff;
                overflow: hidden;
                box-shadow: 17px 19px 73px 0px rgba(0, 0, 0, 0.5);
                border-radius: 4px;
                overflow:auto;
                z-index:1000;
                img{
                    width:100%;
                }
            }
        }
        button{
            position:absolute;
            top:50%;
            margin-top:-20px;
            width:40px;
            height:40px;
            opacity:0.7;
            transition:all 0.3s;
            z-index:1;
            &:hover{
                opacity:1;
                transition:all 0.3s;
            }
            &.previous{
                left:15px;
                background:@template_sp 0 -53px;
            }
            &.next{
                right:15px;
                background:@template_sp -48px -53px;
            }
            &.disabled{
                opacity:0.3;
                cursor: default;
            }
        }
        .template_thumbnail{
            display:block;
            width:100%;
            margin-top:35px;
            text-align:left;
            overflow:hidden;
            overflow-x: auto;
            white-space: nowrap;
            .thumbnail_card{
                display:inline-block;
                vertical-align:middle;
                margin-right: 5px;
                cursor: pointer;
                white-space: normal;
                user-select: none;
                &:last-child{
                    margin-right: 0;
                }
                span{
                    display: block;
                    margin-top:5px;
                    text-align:center;
                    color: #707070;
                    font-size: 14px;
                }
                img{
                    width: 100%;
                    height: auto;
                }
                div{
                    font-size:0;
                    border:2px solid #f2f2f2;
                }
                &.current{
                    div{
                        border: 2px solid var(--mainColor);
                    }
                    span{
                        color: var(--mainColor);
                    }
                }
            }
            /*定义滚动条高宽及背景 高宽分别对应横竖滚动条的尺寸*/
            &::-webkit-scrollbar{
                width:auto;
                height:10px;
                background-color: #f5f5f5;
            }
            /*定义滚动条轨道 内阴影+圆角*/
            &::-webkit-scrollbar-track{
                border-radius: 10px;
                background-color: #f5f5f5;
            }
            /*定义滑块 内阴影+圆角*/
            &::-webkit-scrollbar-thumb{
                border-radius: 10px;
                background-color:#e6e6e6;
            }
        }
        .ost_tag{
            margin-top:55px;
            padding: 20px 5px 20px; 
            text-align: left;
            border-top: 1px solid #f0f0f0;
            p{
                font-size:14px;
                color: #5d5d5d;
            }
            li{
                display:inline-block;
                width:auto;
                height: 26px;
                line-height:26px;
                padding:0 10px;
                margin:8px 8px 8px 0;
                border-radius: 4px;
                border: solid 1px #c4c4c4;
                cursor: pointer;
                &:hover{
                    color: var(--mainColor);
                    border-color: var(--mainColor);
                }
            }
        }
        .template_list_contain{
            padding:0 6px;
        }
	}
    .template_right{
        display:inline-block;
        vertical-align:top;
        margin-left:44px;
        width: 368px;
        min-width:260px;
        padding:20px 30px;
        text-align:left;
        background-color: #ffffff;
        box-shadow: 0px 3px 3px 0px rgba(0, 0, 0, 0.05);
        .header{
            .template_title{
                height:41px;
                line-height:42px;
                border-bottom:1px solid #dfdfdf;
                font-size:18px;
                color:#232323;
                white-space: nowrap;
                text-overflow: ellipsis;
                overflow: hidden;
            }
            .template_message{
                height:96px;
                padding:14px 0;
                border-bottom:1px solid #dfdfdf;
                font-size:0;
                span{
                    position:relative;
                    display:inline-block;
                    width:50%;
                    height:34px;
                    line-height:34px;
                    padding-left:19px;
                    font-size:12px;
                    color:#6a6a6a;
                    vertical-align:top;
                    text-align:left;
                    &:before{
                        content:'';
                        position:absolute;
                        top:50%;
                        left:1px;
                        width:15px;
                        height:16px;
                        display:inline-block;
                        background:@template_sp;
                    }
                    &:nth-child(1):before{
                        margin-top:-7px;
                        background-position:0px -154px;
                    }
                    &:nth-child(2):before{
                        margin-top:-7px;
                        background-position:-51px -154px;
                    }
                    &:nth-child(3):before{
                        margin-top:-8px;
                        background-position:-24px -154px;
                    }
                    &:nth-child(4):before{
                        margin-top:-6px;
                        background-position:-75px -155px;
                    }
                    &.size_icon:before{
                        background-position:-98px -155px;
                    }
                }
            }
            .author_message{
                position:relative;
                height:85px;
                padding:20px 0 20px 52px;
                border-bottom:1px solid #dfdfdf;
                .author_photo{
                    position:absolute;
                    top:21px;
                    left:0;
                    width:42px;
                    height:42px;
                    border-radius:42px;
                    overflow:hidden;
                    img{
                        width:100%;
                        height:100%;
                        min-width:100%;
                        min-height:100%;
                    }
                }
                p{
                    height:22px;
                    line-height:22px;
                    font-size:12px;
                    color:#6a6a6a;
                }
                .author_name{
                    font-size:14px;
                    color:#1f1f1f;
                }
                .author_template{
                    color:var(--mainColor);
                }
                a{
                    position:absolute;
                    bottom:20px;
                    right:4px;
                    height:22px;
                    line-height:22px;
                    font-size:12px;
                    color:#6a6a6a;
                    &:hover{
                        color: var(--mainColor);
                    }
                }
            }
            .template_operate{
                height:178px;
                padding:30px 0;
                border-bottom:1px solid #dfdfdf;
                a{
                    display:inline-block;
                    width:100%;
                    height:50px;
                    line-height:42px;
                    border-radius:4px;
                    text-align:center;
                    &:before{
                        content:'';
                        display:inline-block;
                        margin-right:5px;
                        background:@background_image;
                        vertical-align:middle;
                    }
                    &:nth-child(1){
                        width:calc((100% - 30px)/2);
                        height:43px;
                        margin-right:20px;
                        margin-bottom:10px;
                        border:1px solid #c2c2c2;
                        span{
                            font-size:14px;
                            color:#797979;
                            display:inline-block;
                            vertical-align:middle;
                        }
                        &:before{
                            width:20px;
                            height:18px;
                            background-position:-178px -153px;
                        }
                        &.collect:before{
                            width:20px;
                            height:18px;
                            background-position:-206px -153px;
                        }
                    }
                    &:nth-child(2){
                        width:calc((100% - 10px)/2);
                        height:43px;
                        border:1px solid #c2c2c2;
                        span{
                            font-size:14px;
                            color:#797979;
                            display:inline-block;
                            vertical-align:middle;
                        }
                        &:before{
                            width:20px;
                            height:18px;
                            background-position:-279px -180px;
                        }
                    }
                    &:nth-child(3){
                        background:var(--mainColor);
                        line-height:50px;
                        margin-top:10px;
                        span{
                            font-size:16px;
                            color:#ffffff;
                            vertical-align:top;
                        }
                        &:before{
                            width:15px;
                            height:15px;
                            background-position:-300px -124px;
                        }
                        &.lock{
                            i{
                                width: 14px;
                                height: 14px;
                                margin-left: 10px;
                                vertical-align: middle;
                                display: inline-block;
                                background: url(~@/assets/pc/images/common/lock_white.png) no-repeat;
                                background-size: cover;
                            }
                        }
                    }
                }
            }
        }
        .body{
            position: relative;
            margin-top: 23px;
            .related_title{
                margin-bottom: 10px;
            }
            span{
                font-size: 12px;
                color: #363636;
            }
            a{
                position: absolute;
                right: 0;
                font-size: 12px;                     
                color: var(--mainColor);
                &:hover{
                    opacity: 0.8;
                }
            }
            li{
                position: relative;
                display: inline-block;
                vertical-align: top;
                margin:0 12px 10px 0;
                width:calc((100% - 12px)/2);
                transition:all 0.3s;
                cursor: pointer;
                background: @skeleton_color @image_loading;
                &::before{
                    content: '';
                    display: block;
                    padding-top: 56%;
                }
                &:hover{
                    transform:scale(1.05);
                    transition:all 0.3s;
                }
                &:nth-child(2n){
                    margin-right: 0;
                }
                img{
                    position: absolute;
                    top: 0;
                    left: 0;
                    width:100%;
                    border: 1px solid #e8eef3;
                }
            }
            .related_design{
                width:100%;
                display: block;
                width:100%;
                -moz-column-count: 3;
                -webkit-column-count: 3;
                column-count: 3; 
                column-gap: 10px;
                li{
                    display:block;
                    margin:0;
                    width:auto;
                    -moz-page-break-inside: avoid;
                    -webkit-column-break-inside: avoid;
                    break-inside: avoid;
                    color:#fff;
                    &:before{
                        display:none;
                    }
                }
                img{
                    position:relative;
                    height:auto;
                    width:100%;
                }
            }
        }
    }
	// 列表模块
	.template_pannel{
        position:relative;
        height:100%;
        width: 100%;
        margin: 40px auto 0;
        background: #fff;
        .box_shadow{
            position: absolute;
            background: #fafafa;
            height: 30px;
            top: -30px;
            left: -6px;
            right: -6px;
            box-shadow: inset 0px 10px 10px -10px rgba(0, 0, 0, 0.05), inset 0px -10px 10px -10px rgba(0, 0, 0, 0.05);
            &:last-child{
                bottom:-6px;
                top:auto;
            }
        }
        .recommend_title{
            position: relative;
            height:60px;
            line-height:60px;
            text-align:left;
            color:#585858;
            a{
                position: absolute;
                right:0;
                top:50%;
                height:60px;
                line-height:60px;
                margin-top:-30px;
                &:hover{
                    color:var(--mainColor);
                }
            }
        }
		.template_list_contain{
            width:100%;
            max-width:1240px;
			text-align:center;
			margin:0 auto;
			.list_wrapper{
				position: relative;
				display: flex;
                flex-wrap: wrap;
                width:calc(100% + 20px);
				height: auto;
				overflow: hidden;
                .template_list{
                    position: relative;
                    display: inline-block;
                    flex: 1 1 auto;
                    align-self: flex-start;
                    width: 290px;
                    height: auto;
                    max-width: 100%;
                    max-height: 100%;
                    margin: 0 25px 30px 0;
                    overflow: hidden;
                    font-size: 0;
                    cursor: pointer;
                    background: @image_loading;
                    background-position: center 40%;
                    .list_contain{
                        position:relative;
                        width:100%;
                        border: 1px solid #e8eef3;
                        box-shadow: 0px 3px 3px 0px rgba(0, 0, 0, 0.04);
                        &::before{
                            content: '';
                            display: block;
                            padding-top: 56%;
                        }
                    }
                    img{
                        position: absolute;
                        top: 0;
                        left: 0;
                        width: 100%;
                    }
                    .title{
                        width: 100%;
                        height: 30px;
                        line-height:30px;
                        padding-right:50px;
                        overflow: hidden;
                        text-overflow:ellipsis;
                        white-space: nowrap;
                        text-align:left;
                        font-size:14px;
                        color:#585858;
                    }
                    .masking{
                        position:absolute;
                        top:0;
                        left:0;
                        width:100%;
                        height:100%;
                        background-color:rgba(0,0,0,0.5);
                        &:after{
                            content:"";
                            display:inline-block;
                            vertical-align:middle;
                            width:0;
                            height:100%;
                        }
                        .wrapper{
                            display:inline-block;
                            vertical-align:middle;
                            width:100%;
                        }
                        a{
                            display:block;
                            width: 110px;
                            height: 42px;
                            line-height:42px;
                            margin:0 auto;
                            border-radius: 4px;
                            font-size:14px;
                            color:#fff;
                            text-align:center;
                            &:hover{
                                opacity:0.9;
                            }
                            &.edit{
                                margin-bottom:4%;
                                background-color:var(--mainColor);
                                &.lock{
                                    i{
                                        width: 14px;
                                        height: 14px;
                                        margin-left: 10px;
                                        vertical-align: middle;
                                        display: inline-block;
                                        background: url(~@/assets/pc/images/common/lock_white.png) no-repeat;
                                        background-size: cover;
                                    }
                                }
                            }
                            &.detail{
                                background-color:#2cd597;
                            }
                        }
                        button{
                            position: absolute;
                            right:5px;
                            top:5px;
                            width:30px;
                            height:30px;
                            text-align:center;
                            border-radius:4px;
                            background:rgba(0,0,0,0.6) @template_sp -88px -46px;
                            &.had_collected{
                                background:rgba(0,0,0,0.6) @template_sp -119px -46px;
                            }
                        }
                    }
                }
			}
		}
	}
	/*底部*/
	.footer {
		background-color:#0a0d11;
    }
    .design_list_wrapper{
        position: relative;
        display: flex;
        flex-wrap: wrap;
        width:828px;
        height: auto;
        .template_list{
            -webkit-box-pack: justify;
            display:flex;
            flex-wrap:wrap;
            justify-content:space-between;
            width:100%;
            margin-bottom:10px;
        }
        .template_item{
            position:relative;
            display:inline-block;    
            width: 200px;
            height:auto;    
            margin-right: 22px;
            max-width:100%;
            max-height: 100%;
            -webkit-box-flex: 1;
            -ms-flex: 1 1 auto;
            flex: 1 1 auto;
            -ms-flex-item-align: start;
            align-self: flex-start;
            margin-bottom:80px;
            border-bottom-right-radius:4px;
            border-bottom-left-radius:4px;
            border:1px solid #EEEDF3;
            cursor:pointer;
            .template_info{
                position:absolute;
                display:block;
                bottom:0;
                width:100%;
                text-align: left;
                background:#fff;
            }
            .title{
                display: inline-block;
                width:100%;
                margin-top:9px;
                padding:0 13px;
                font-size:12px;
                color:#a7a7b2;
                overflow: hidden;
                text-align:left;
                text-overflow:ellipsis;
                white-space: nowrap;
            }
            .use_count,.collect_count{
                display: inline-block;
                font-size:12px;
                color:#c9c9d2;
                margin:9px 13px 7px;
                &:before{
                    content:'';
                    position:relative;
                    display:inline-block;
                    width:14px;
                    height:14px;
                    top:2px;
                    margin-right:3px;
                    background:@template_sp;
                }
                &.use_count:before{
                    background-position:-105px -115px;
                }
                &.collect_count:before{
                    background-position:-129px -114px;
                }
            }
        }
        .img_box{
            position:relative;
            width:100%;
            height:auto;
            img{
                display:block;
                width:100%;
            }
            .hover_box{
                position:absolute;
                top:0;
                bottom:60px;
                left:0;
                right:0;
                &:after{
                    content:'';
                    display: block;
                    position:absolute;
                    top:0;
                    right:0;
                    left:0;
                    bottom:0;
                    background:rgba(0,0,0,.7);
                }
            }
            .hover{
                position:absolute;
                opacity:0;
                top:0;
                bottom:-60px;
                left:0;
                right:0;
                z-index:2;
                transition:all .3s;
                box-shadow:0 0 8px #ddd;
                p{
                    position:absolute;
                    left:calc(50% - 50px);
                    top: calc(50% - 15px);
                    width:100px;
                    text-align:center;
                    font-size:14px;
                    color:#ffffff;
                    z-index:10;
                    transform: translate3d(0,0,0) scale(0.9);
                    -webkit-backface-visibility: hidden;
                    -moz-backface-visibility: hidden;
                    -ms-backface-visibility: hidden;
                    backface-visibility: hidden;
                    -webkit-perspective: 1000;
                    -moz-perspective: 1000;
                    -ms-perspective: 1000;
                    perspective: 1000;
                    &.template_size{
                        top: 50%;
                    }
                }
            }
            .edit{
                position: absolute;
                display:block;
                top: calc(50% - 58px);
                left: calc(50% - 55px);
                margin:0 auto;
                width:110px;
                height:40px;
                line-height:40px;
                color:#fff;
                text-align:center;
                background:var(--mainColor);
                border-radius:4px;
            }
        }
        .template_item:hover{
            .hover{
                opacity:1;
                transform:scale(1.1);
            }
        }
    }
</style>

<script>
    import CommonHead from '@/components/nav/CommonHead.vue';
    import CommonFoot from '@/components/nav/CommonFoot.vue';
    import svg_modal from '@/components/SvgPageModal.vue';
    import Share_modal from '@/components/ShareModal.vue';
	export default{
		metaInfo: {
			title: '吾道-模板详情',
			meta: [
			    {
                    property: 'og:title',
                    content: '吾道-模板详情'
                },
                {
                    property: 'og:url',
                    content: 'https://www.woodo.cn/template/detail/'
                },
			]
		},
		components: {
            CommonHead,
            svg_modal,
            CommonFoot,
            Share_modal,
		},
		data(){
			return{
                head_options:null,
                preview_template_list: [],        //模板列表
                template_recommend_list: [
                    {"id":0,"createDate":0,"modifyDate":0,"order":0,"sn":"","name":"","image":"","usenum":4,"documentId":0,"collectCount":null,'width':'','height':''},
                    {"id":0,"createDate":0,"modifyDate":0,"order":0,"sn":"","name":"","image":"","usenum":4,"documentId":0,"collectCount":null,'width':'','height':''},
                    {"id":0,"createDate":0,"modifyDate":0,"order":0,"sn":"","name":"","image":"","usenum":4,"documentId":0,"collectCount":null,'width':'','height':''},
                    {"id":0,"createDate":0,"modifyDate":0,"order":0,"sn":"","name":"","image":"","usenum":4,"documentId":0,"collectCount":null,'width':'','height':''},
                    {"id":0,"createDate":0,"modifyDate":0,"order":0,"sn":"","name":"","image":"","usenum":4,"documentId":0,"collectCount":null,'width':'','height':''},
                    {"id":0,"createDate":0,"modifyDate":0,"order":0,"sn":"","name":"","image":"","usenum":4,"documentId":0,"collectCount":null,'width':'','height':''},
                    {"id":0,"createDate":0,"modifyDate":0,"order":0,"sn":"","name":"","image":"","usenum":4,"documentId":0,"collectCount":null,'width':'','height':''},
                    {"id":0,"createDate":0,"modifyDate":0,"order":0,"sn":"","name":"","image":"","usenum":4,"documentId":0,"collectCount":null,'width':'','height':''},
                ],      //猜你喜欢模板列表
                related_template_list: [
                    {"id":0,"createDate":0,"modifyDate":0,"order":0,"sn":"","name":"","image":"","usenum":4,"documentId":0,"collectCount":null},
                    {"id":0,"createDate":0,"modifyDate":0,"order":0,"sn":"","name":"","image":"","usenum":4,"documentId":0,"collectCount":null},
                    {"id":0,"createDate":0,"modifyDate":0,"order":0,"sn":"","name":"","image":"","usenum":4,"documentId":0,"collectCount":null},
                    {"id":0,"createDate":0,"modifyDate":0,"order":0,"sn":"","name":"","image":"","usenum":4,"documentId":0,"collectCount":null},
                    {"id":0,"createDate":0,"modifyDate":0,"order":0,"sn":"","name":"","image":"","usenum":4,"documentId":0,"collectCount":null},
                    {"id":0,"createDate":0,"modifyDate":0,"order":0,"sn":"","name":"","image":"","usenum":4,"documentId":0,"collectCount":null},
                ],        //相关模板
                favorite_map:[],                  //用户收藏模板id
                template_detail: {
                    'document':{
                        'height':null,
                        'width':null
                    }
                },              //模板详情页信息
                template_id:'',
                template_info: {
                    type:'slides'
                },                //模板基本信息
                screen_h:null,
                user_info:{},
                author_info:{},                   //作者信息
                template_masking_show: false,     //模板遮罩层
                template_index: '',               //当前模板id
                template_type:'slides',           //当前模板类型
                current_page_info: {},            //当前模板展示页内容
                current_preview_index: '',        //当前模板展示页索引
                document_info:{},                 //当前模板page信息
                total_pages:"",                   //模板总页数
                collect:false,                    //模板是否收藏
                change_pre_active: false,         //切换上一页
                change_next_active: true,         //切换下一页
                svg_preview_template: {           //预览内svg大小
                    w: 910,
                    h: 0,
                    view:[0,0,0,0]
                },
                thumbnail_pages_template: {        //缩略图svg大小
                    w: 910,
                    h: 0,
                    view:[0,0,0,0]
                },
			}
		},
		mounted(){
            let that = this,id;
            that.user_info = that.$common.get_login_state();
            id = this.$route.query.templateId ? this.$route.query.templateId : '';
            that.template_id = id;
            that.screen_h = $(window).height();
            that.get_template_detail(id);
            window.addEventListener('scroll',function(){
                let scroll_top = window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop;
                if(scroll_top > 0){
                    that.head_options = {theme:'white',fixed:true};
                    $('.page_contain').css('paddingTop','60px');
                }else{
                    that.head_options = null;
                    $('.page_contain').css('paddingTop','0');
                }
            });
        },
		methods:{
            // 获取模板详情
			get_template_detail: function(id) {
				let that = this,
					templateId = id,
                    window_w = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth,
                    current_w = 816,
                    list_w = 816 * 0.3;
                that.$axios.get('/api/template/detail/' + templateId)
                    .then(function(data) {
				        if(data.data.code === "2"){
                            // 设置导航选中
                            if (data.data.data.template.type === 'design') {
                                $('.common_head_contain').find('.navi_item').removeClass('current');    
                                $('.common_head_contain').find('.navi_item.design').addClass('current');    
                            } 
				            // 格式化文档页内容
                            let document_info = that.$common.document_dataparse(data.data.data.document);
                            let document_pages = that.$common.document_pages_dataparse(data.data.data.documentPages);
                            let doc_ratio = document_info.width / document_info.height;
                            let doc_font = document_info.font && document_info.font !== '' ? document_info.font : false;
                            that.$refs.thumbnail.style.height = list_w / doc_ratio + 50 + 'px';
                            that.document_info = document_info;
                            that.template_detail = data.data.data;
                            that.template_info = data.data.data.template;
                            that.author_info = data.data.data.author;
                            that.total_pages = document_pages.length;
                            that.collect = data.data.data.collect;
                            that.favorite_map = data.data.data.favoriteMap;
                            that.preview_template_list = document_pages;
                            that.current_page_info = document_pages[0];
                            that.current_preview_index = 0;
                            that.template_type = data.data.data.template.type;
                            that.get_hot_template(data.data.data.categoryId);
                            if(document_pages.length < 2){
                                that.change_next_active = false;
                            }
                            if(current_w / doc_ratio <= 848){
                                // 保存预览内容
                                that.svg_preview_template.w = current_w;
                                that.svg_preview_template.h = current_w / doc_ratio;
                            }else{
                                that.svg_preview_template.h = 848;
                                that.svg_preview_template.w = 848 * doc_ratio;
                            }
                            that.svg_preview_template.view[2] = document_info.width;
                            that.svg_preview_template.view[3] = document_info.height;
                            // 保存列表内容
                            that.thumbnail_pages_template.w = list_w;
                            that.thumbnail_pages_template.h = list_w / doc_ratio;
                            that.thumbnail_pages_template.view[2] = document_info.width;
                            that.thumbnail_pages_template.view[3] = document_info.height;
                            that.$nextTick(function(){
                                if(that.template_info.type !== 'design'){
                                    $('.template_right').css('height', that.$refs.templateLeft.offsetHeight + 'px')
                                }
                            })
                            that.get_related_template(data.data.data.categoryId, templateId);
                        }else{
							that.$toast(data.data.content,800);
						}
				});
			},
            //相关模版
            get_related_template:function(cId, templateId){
                let that = this;
                that.$axios.get('/api/template/related_template/',{params: {
                        cId: cId,
                        templateId:templateId
                    }})
                    .then(function(data) {
                        if(data.data.code === "2"){
                            that.related_template_list = data.data.data;
                        }else{
                            that.$toast(data.data.content,800);
                        }
                });
            },
            //热门模版
            get_hot_template:function(cId){
                let that = this;
                that.$axios.get('/api/template/top/list/',{params:{
                    type:that.template_info.type,
                    cId:cId
                }}).then(function(data) {
                        if(data.data.code === "2"){
                            that.template_recommend_list = data.data.data;
                            for(let item in that.template_recommend_list){
                                let _attr = JSON.parse(that.template_recommend_list[item].attr);
                                that.template_recommend_list[item].width = _attr.width;
                                that.template_recommend_list[item].height = _attr.height;
                            }
                        }else{
                            that.$toast(data.data.content,800);
                        }
                });
            },
            // 查看当前缩略图
			check_thumbnail: function(item,index,type) {
				let that = this;
				if(that.current_preview_index !== index){
                    let $outer = document.createElement('div'),
                        window_w = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth,
                        current_w = 816,
                        doc_ratio = that.template_detail.document.width / that.template_detail.document.height;
                    that.current_page_info = that.preview_template_list[index];
                    that.current_preview_index = index;
                        let child_left = $('.thumbnail_card').eq(index)[0].offsetLeft,
                            panel_left = $('.template_thumbnail')[0].offsetLeft,
                            card_width = $('.thumbnail_card').eq(index)[0].clientWidth,
                            _width = $('.template_thumbnail')[0].clientWidth,
                            num = parseInt(Number(_width / card_width));
                            if(type < 0){
                                if(child_left-card_width > _width && Number(index / 3) % 1 === 0){
                                    that.$refs.thumbnail.scrollLeft = child_left - panel_left;
                                }
                            }else if(type > 0){
                                that.$refs.thumbnail.scrollLeft = child_left - panel_left;
                            }
                    if(that.current_preview_index >= that.preview_template_list.length -1){
                        that.change_next_active = false;
                    }else{
                        that.change_next_active = true;
                    }
                    if(that.current_preview_index < 1){
                        that.change_pre_active = false;
                    }else{
                        that.change_pre_active = true;
                    }
                }
            },
            // 按钮切换查看缩略图
            change_preview: function(type){
                let that = this,item,
                    _index = that.current_preview_index,
                    list = that.preview_template_list;
                if(type < 0){
                    _index++;
                    item = list[_index]
                }else{
                    _index--;
                    item = list[_index];
                }
                that.check_thumbnail(item,_index,type);
            },
            // 模板遮罩层事件
			template_masking_event: function(index,type){
				this.template_masking_show = type;
				this.template_index = index;
            },
            // 模板收藏功能
			collect_template:function(id){
				let that = this,_url,_state,_toast,_list = that.favorite_map;
				if(_list[id]){
					_url = '/api/member/delete_collect/';
					_state = false;
					_toast = "取消收藏成功";
				}else{
					_url = '/api/member/collection/';
					_state = true;
					_toast = "收藏成功";
				}
                that.$axios.post(_url,{
					documentId: id,
					type: 'template'
				}).then(function(data){
					if(data.data.code == 2){
                        that.$set(that.favorite_map, id, _state);
                        that.collect = _state;
                        if(_state){
                            that.template_info.collectCount++;
                        }else{
                            that.template_info.collectCount--;
                        }
						that.$toast(_toast,1000);
					}else{
						that.$toast(data.data.content,1000)
					}
				})
            },
            // 打开分享弹框
            open_share:function(){
                let that = this;
                that.$refs.share_modal.show({
                    type: 'template',
                    urlid: that.template_id,
                });
            },
            // 其他相关模板
            get_relatedtemplate_detail:function (id) {
                if (!id) return;
                window.location.href = '/template/detail/?templateId=' + id;
            },
			// 使用模版点击事件
			use_template: function(item){
                if(!item.documentId) return;
                if(item.isVip && !this.user_info.memberVipEffect){
                    this.$modal({templateType:'memberGrade'});
                    return;
                }
                this.$router.push({path:'/edit/',query:{modalId:item.documentId}});
			},
			// 查看详情事件
			check_detail: function(id){
                if(!id) return;
                utils.windowOpenNewtab('/template/detail/?templateId='+ id);
            },
            // 个人主页跳转
            author_center: function(id){
				if(!id) return;
				this.$router.push({path:'/template/member/',query:{memberId:id}});
            },
		}
	}
</script>