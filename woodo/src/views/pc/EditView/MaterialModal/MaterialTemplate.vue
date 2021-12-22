<template>
    <!-- 模板弹窗 -->
    <div class="material-template" :class="{'home': current_selected === 'home'}">
        <!-- 头部导航 -->
        <div class="template-top" v-if="current_selected !== 'home'">
            <div class="back" @click="go_back">
                <div class="icon">
                    <base-icon class="iconfanhuizhuomian"></base-icon>
                </div>
                <div>返回</div>
            </div>
            <!-- 模板 -->
            <ul class="collect-category" v-if="collection_current_menu === 'template_collection'">
                <li v-for="item in template_menu_list"
                    :key="item.id"
                    :class="{'checked': item.id === collection_current_second_menu}"
                    @click.stop="collection_second_menu_checked(item.id)"
                >
                    {{item.name}}
                </li>
            </ul>
            <!-- 图示 -->
            <ul class="collect-category" v-if="collection_current_menu === 'pic_collection'">
                <li v-for="item in picview_menu_list"
                    :key="item.id"
                    :class="{'checked': item.id === collection_current_second_menu}"
                    @click.stop="collection_second_menu_checked(item.id)"
                >
                    {{item.name}}
                </li>
            </ul>
            <!-- 案例 -->
            <ul class="collect-category" v-if="collection_current_menu === 'cases_collection'">
                <li v-for="item in case_menu_list"
                    :key="item.id"
                    :class="{'checked': item.id === collection_current_second_menu}"
                    @click.stop="collection_second_menu_checked(item.id)"
                >
                    {{item.name}}
                </li>
            </ul>
            <div class="filter_btn"
                :class="{'checked': show_filter}"
                @click="show_filter=!show_filter"
                v-if="(EditView.document_info.documentType === 'design' && !picview_current_menu && !case_current_menu && !collection_current_menu) || (template_current_menu === 104 || template_current_menu === 102)"
            >
                <div class="icon">
                    <base-icon class="iconshaixuan"></base-icon>
                </div>
                <div>筛选</div>
            </div>
            <!-- 设计实验室二级分类 -->
            <div class="filter_frame design_filter_group" v-if="show_filter && EditView.document_info.documentType === 'design' && !picview_current_menu">
                <div class="icon" @click="show_filter=false">
                    <base-icon class="iconchacha"></base-icon>
                </div>
                <div class="filter_content">
                    <div class="group_btn">
                        <a class="btn" 
                            v-for="item in template_tags_list" 
                            :key="item.id" 
                            :class="{'checked': template_current_tags === item.id}" 
                            @click="design_tag_checked(item.id)" 
                        >{{item.name}}</a>
                    </div>
                </div>
            </div>
            <div class="filter_frame" v-else-if="show_filter && (template_current_menu === 104 || template_current_menu === 102)">
                <div class="icon" @click="show_filter=false">
                    <base-icon class="iconchacha"></base-icon>
                </div>
                <div class="filter_content">
                    <div class="group_title">全部个数：</div>
                    <div class="group_btn">
                        <a class="btn" v-for="item in number_tags_list" 
                            :key="item.value" 
                            :class="{'checked': template_current_number === item.value}" 
                            @click="template_number_checked(item.value)" 
                            v-bdtongji="'素材库-模板素材-正文-右侧-全部个数-'+item.text">{{item.text}}</a>
                    </div>
                </div>
                <div class="filter_content" v-show="template_current_menu === 104">
                    <div class="group_title">全部关系：</div>
                    <div class="group_btn">
                        <a class="btn" v-for="item in template_child_menu_list" 
                            :key="item.id"
                            :class="{'checked': template_child_current_menu === item.id}"
                            @click="template_child_menu_checked(item.id)"
                            v-bdtongji="'素材库-模板素材-正文-右侧-全部关系-'+item.name"
                        >{{item.name}}</a>
                    </div>
                </div>
            </div>
        </div>
        <div class="template-main" :class="{home: current_selected === 'home'}">
            <div class="template-left" v-if="current_selected === 'home'">
                <div class="template-group">
                    <span class="title">模板推荐</span>
                    <ul>
                        <li @click="template_open_init">
                            <div class="icon">
                                <base-icon class="iconchangyongyuansu"></base-icon>
                            </div>
                            <span>模板</span>
                            <base-icon class="iconxiala"></base-icon>
                        </li>
                        <li @click="picview_open_init">
                            <div class="icon">
                                <base-icon class="iconchatu"></base-icon>
                            </div>
                            <span>图示</span>
                            <base-icon class="iconxiala"></base-icon>
                        </li>
                        <li @click="cases_open_init">
                            <div class="icon">
                                <base-icon class="iconbiaoqing"></base-icon>
                            </div>
                            <span>案例</span>
                            <base-icon class="iconxiala"></base-icon>
                        </li>
                    </ul>
                </div>
                <div class="collect-group">
                    <span class="title">模板收藏</span>
                    <ul>
                        <li @click="collect_open_init">
                            <div class="icon">
                                <base-icon class="iconmeitiku"></base-icon>
                            </div>
                            <span>我的收藏夹</span>
                            <base-icon class="iconxiala"></base-icon>
                        </li>
                    </ul>
                </div>
            </div>
            <div class="template-left" v-else>
                <div class="template-group" v-if="current_selected === 'template'">
                    <span class="title">模板</span>
                    <ul>
                        <li v-for="item in template_menu_list"
                            :key="item.id"
                            @click="template_menu_checked(item.id)"
                            :class="{'checked': item.id === template_current_menu || item.id === template_menu_need_checked_id}"
                            v-bdtongji="'编辑器-功能区-编辑功能-顶部-模版-'+item.name"
                        >
                            <div class="icon">
                                <base-icon :class="item.icon || 'iconchangyongyuansu'"></base-icon>
                            </div>
                            <span>{{item.name}}</span>
                            <base-icon class="iconxiala"></base-icon>
                        </li>
                    </ul>
                </div>
                <div class="template-group" v-else-if="current_selected === 'picview'">
                    <span class="title">图示</span>
                    <ul>
                        <li v-for="item in picview_menu_list"
                            :key="item.id"
                            @click="picview_menu_checked(item.id)"
                            :class="{checked:item.id === picview_current_menu}"
                            v-bdtongji="'编辑器-设计-设计弹窗-图视库分类'+item.name"
                        >
                            <div class="icon">
                                <base-icon :class="item.icon || 'iconbiaoqing'"></base-icon>
                            </div>
                            <span>{{item.name}}</span>
                            <base-icon class="iconxiala"></base-icon>
                        </li>
                    </ul>
                </div>
                <div class="template-group" v-else-if="current_selected === 'case'">
                    <span class="title">案例</span>
                    <ul>
                        <li v-for="item in case_category_list"
                            :key="item.id"
                            @click="case_menu_checked(item.id)"
                            :class="{'checked':case_current_menu === item.id}"
                            v-bdtongji="'编辑器-案例-案例弹窗-左侧-'+item.name"
                        >
                            <div class="icon">
                                <base-icon :class="item.icon || 'iconbiaoqing'"></base-icon>
                            </div>
                            <span>{{item.name}}</span>
                            <base-icon class="iconxiala"></base-icon>
                        </li>
                    </ul>
                </div>
                <div class="template-group" v-else-if="current_selected === 'collection'">
                    <span class="title">我的收藏夹</span>
                    <ul>
                        <li v-for="item in collect_list"
                            :key="item.id"
                            :class="{'checked': item.type === collection_current_menu}"
                            @click="collection_menu_checked(item.type)"
                        >
                            <div class="icon">
                                <base-icon :class="item.icon"></base-icon>
                            </div>
                            <span>{{item.title}}</span>
                            <base-icon class="iconxiala"></base-icon>
                        </li>
                    </ul>
                </div>
            </div>

            <div class="template-right">
                <!-- 搜索空状态 -->
                <div class="search_empty" v-if="search_empty && current_selected === 'template'">
                    <div class="search_empty_tips">
                        <p>抱歉 Sorry！~没有找到相关的素材</p>
                        <p>您可以<span>简化</span>、<span>缩短关键词</span> 或 <span>减少筛选条件</span></p>
                    </div>
                    <p class="search_empty_title">相关推荐</p>
                    <!-- 推荐列表 -->
                    <div class="scroll_window" ref="template_contain_dom">
                        <ul class="scroll_container">
                            <li v-for="item in template_data_list" 
                                :key="item.id" 
                                :data-id="item.id" 
                                :data-place="item._place_type" 
                                :style="{'top': `${item._top}px`, 'left': `${item._left}px`, 'width': `${item._width}px`, 'height': `${item._height}px`}"
                            >
                                <img v-lazy="item.image" :data-sn="item.sn" :data-id="item.id" @click="template_material_append(item)" alt="模板库预览图（推荐幻灯片）" />
                                <div class="append_layer" v-show="item.insertion">
                                    <div class="lds-spinner">
                                        <div></div><div></div><div></div><div></div><div></div><div></div>
                                        <div></div><div></div><div></div><div></div><div></div><div></div>
                                    </div>
                                </div>
                                <div @click="common_material_favorite(item.id)" 
                                    :class="['favorite-btn', {'has-collect': favorite_map[item.id]}]"
                                    v-tooltip="favorite_map[item.id] ? '取消收藏' : '加入收藏'"
                                >
                                    <base-icon class="iconshoucang"></base-icon>
                                </div>
                            </li>
                        </ul>
                    </div>
                </div>
                <!-- 素材空状态 -->
                <div class="material_empty" v-else-if="search_empty && collection_current_menu">
                    <div class="empty_contain">
                        <img src="../../../../assets/pc/images/edit/material_empty_bg.png" alt="" />
                        <span v-show="collection_current_menu === 'template_collection'">该分类没有收藏的模板哦~</span>
                        <span v-show="collection_current_menu === 'pic_collection'">该分类没有收藏的图示哦~</span>
                        <span v-show="collection_current_menu === 'cases_collection'">该分类没有收藏的案例哦~</span>
                    </div>
                </div>
                <div class="scroll_window" v-else ref="template_contain_dom">
                    <!-- 全套模板数据列表  当前分类为全套分类或全套模板页时，使用这个列表渲染 -->
                    <ul class="scroll_container suit_list"
                        v-if="template_current_menu === TEMPLATE_SUIT_ID || template_menu_need_checked_id === TEMPLATE_SUIT_ID" 
                    >
                        <li v-for="(item, index) in template_data_list"
                            :key="item.id"
                            :title="item.name"
                            :data-id="item.id"
                            :data-place="item._place_type"
                            :style="{'top': `${item._top}px`, 'left': `${item._left}px`, 'width': `${item._width}px`, 'height': `${item._height}px`}"
                            v-show="item._top <= visible_area_max && (item._top + item._height) >= visible_area_min"
                            :class="{'lock' : item.isVip && !user.memberVipExpire}"
                        >
                            <img v-if="item.documentId" v-show="item.image" v-lazy="item.image" :data-sn="item.sn" :data-id="item.id" alt="模板库全套预览图（幻灯片）" />
                            <div class="svg_view" v-if="item.document && item.page_info" @click="template_group_append(item)">
                                <svg_modal ref="svg_modal" 
                                    :svg_w="item._width - 2" 
                                    :svg_h="item._height - 2" 
                                    :svg_view="[0, 0, item.svg_width, item.svg_height]" 
                                    :document="item.document" 
                                    :page_info="item.page_info" 
                                    :mode="`thumbnail`"
                                ></svg_modal>
                            </div>
                            <div class="vip_icon" v-if="item.documentId"></div>
                            <span class="lock-ico" v-else v-tooltip="item.isVip && !user.memberVipEffect ? '会员专享素材' : ''">
                                <img src="../../../../assets/pc/images/common/lock_white.png" alt="">
                            </span>
                            <div class="append_layer" v-show="item.insertion">
                                <div class="lds-spinner">
                                    <div></div><div></div><div></div><div></div><div></div><div></div>
                                    <div></div><div></div><div></div><div></div><div></div><div></div>
                                </div>
                            </div>
                            <!-- 全套 -->
                            <div class="look_btn" v-if="item.documentId">
                                <button title="查看模板" @click="template_menu_checked(item.id)" v-bdtongji="'编辑器-设计-设计弹窗-顶部-查看模板'">查看模板</button>
                            </div>
                            <!-- 全套单页 -->
                            <div @click="common_template_favorite(item.documentId)" 
                                :class="['favorite-btn', {'has-collect': favorite_map[item.documentId]}]"
                                v-bdtongji="'编辑器-设计-设计弹窗-模板-'+favorite_map[item.documentId] ? '取消收藏' : '加入收藏'"
                                v-if="item.documentId"
                                v-tooltip="favorite_map[item.documentId] ? '取消收藏' : '加入收藏'"
                            >
                                <base-icon class="iconshoucang"></base-icon>
                            </div>
                            <!-- 预览按钮 -->
                            <div class="preview-icon" @click="suitPreview(item.id, 'template', true)" v-if="item.documentId" v-tooltip="`预览`">
                                <base-icon class="iconyulan"></base-icon>
                            </div>
                            <base-icon class="preview-btn iconyulan is-group" size="16" v-tooltip="`预览`" @click="template_group_preview(index)" v-else></base-icon>
                        </li>
                    </ul>
                    <!-- 单页模板数据列表 -->
                    <ul class="scroll_container"
                        v-if="template_current_menu && template_current_menu !== TEMPLATE_SUIT_ID && !template_show_back_menu" 
                    >
                        <li v-for="(item, index) in template_data_list"
                            :key="item.id"
                            :data-id="item.id"
                            :data-place="item._place_type"
                            :style="{'top': `${item._top}px`, 'left': `${item._left}px`, 'width': `${item._width}px`, 'height': `${item._height}px`}"
                            v-show="item._top <= visible_area_max && (item._top + item._height) >= visible_area_min"
                        >
                            <img v-lazy="item.image" :data-sn="item.sn" :data-id="item.id" @click="template_material_append(item)" alt="模板库预览图（幻灯片）" v-bdtongji="`PC-统计-设计素材库-${item.categoryFullName ? item.categoryFullName.replace(/,/g,'-') : ''}-应用素材`"/>
                            <div class="append_layer" v-show="item.insertion">
                                <div class="lds-spinner">
                                    <div></div><div></div><div></div><div></div><div></div><div></div>
                                    <div></div><div></div><div></div><div></div><div></div><div></div>
                                </div>
                            </div>
                            <div @click="common_template_favorite(item.documentId)" 
                                :class="['favorite-btn', {'has-collect': favorite_map[item.documentId]}]"
                                v-if="item.type === 'design'"
                                v-tooltip="favorite_map[item.documentId] ? '取消收藏' : '加入收藏'"
                            >
                                <base-icon class="iconshoucang"></base-icon>
                            </div>
                            <div @click="common_material_favorite(item.id)" 
                                :class="['favorite-btn', {'has-collect': favorite_map[item.id]}]"
                                v-bdtongji="'编辑器-设计-设计弹窗-模板-'+favorite_map[item.id] ? '取消收藏' : '加入收藏'"
                                v-tooltip="favorite_map[item.id] ? '取消收藏' : '加入收藏'"
                                v-else
                            >
                                <base-icon class="iconshoucang"></base-icon>
                            </div>
                            <!-- 预览按钮 -->
                            <base-icon class="preview-btn iconyulan" size="16" v-tooltip="`预览`" @click="suitPreview(item.id)" v-if="EditView.document_info.documentType === 'design'"></base-icon>
                            <base-icon class="preview-btn iconyulan" size="16" v-tooltip="`预览`" @click="common_material_page_preview(item, index, template_data_list.length)" v-else></base-icon>
                        </li>
                    </ul>
                    <!-- 图视库数据列表 -->
                    <ul class="scroll_container" v-if="current_selected === 'picview' && picview_data_list.length > 0">
                        <li v-for="(item, index) in picview_data_list" 
                            :key="item.id" 
                            :data-id="item.id" 
                            :data-place="item._place_type" 
                            :style="{'top': `${item._top}px`, 'left': `${item._left}px`, 'width': `${item._width}px`, 'height': `${item._height}px`}" 
                            v-show="item._top <= visible_area_max && (item._top + item._height) >= visible_area_min" 
                            :class="{'lock': item.isVip && !user.memberVipEffect}"
                        >
                            <img v-lazy="item.image" :data-id="item.id" :data-sn="item.sn" @click="picview_material_append(item)" alt="图视库预览图（组合形状）" v-bdtongji="`PC-统计-设计素材库-${item.categoryFullName ? item.categoryFullName.replace(/,/g,'-') : ''}-应用素材`"/>
                            <div class="append_layer" v-show="item.insertion">
                                <div class="lds-spinner">
                                    <div></div><div></div><div></div><div></div><div></div><div></div>
                                    <div></div><div></div><div></div><div></div><div></div><div></div>
                                </div>
                            </div>
                            <!-- 图视库会员锁 -->
                            <span class="lock-ico" v-tooltip="item.isVip && !user.memberVipEffect ? '会员专享素材' : ''">
                                <img src="../../../../assets/pc/images/common/lock_white.png" alt="">
                            </span>
                            <!-- 收藏按钮 -->
                            <base-icon class="favorite-btn iconshoucang" size="16" :color="favorite_map[item.id] ? '#f7b500' : '#ffffff'" v-tooltip="favorite_map[item.id] ? '取消收藏' : '加入收藏'" @click="common_material_favorite(item.id)"></base-icon>
                            <!-- 预览按钮 -->
                            <base-icon class="preview-btn iconyulan" size="16" v-tooltip="`预览`" @click="common_material_page_preview(item, index, picview_data_list.length)"></base-icon>
                        </li>
                    </ul>
                    <!-- 案例一级数据列表 -->
                    <div class="case_container" v-if="current_selected === 'case' && case_category_list.length > 0 && !case_current_second_menu">
                        <div class="cases_list" 
                            v-for="item in case_category_list"
                            :key="item.id"
                            :id="item.id"
                            :class="{'hide': case_current_menu !== item.id}"
                        >
                            <div class="case_child_contain">
                                <div class="cases_child_list"
                                    :class="{'checked':case_current_second_menu === child.id}"
                                    v-for="child in item.childrenList"
                                    :key="child.id"
                                    :data-id="child.id"
                                >
                                    <div class="child_info" 
                                        :class="{'checked': case_current_second_menu === child.id}" 
                                        @click="case_template_checked(child)"
                                        v-bdtongji="'编辑器-案例-案例弹窗-左侧-'+item.name+'-'+child.name">
                                        <div class="child_image">
                                            <img :src="child.image || 'https://500dme-test.oss-cn-shenzhen.aliyuncs.com/upload/resource/202003/24/29fe64a1-2114-4a52-ab0f-2b87fc48946a.jpg'"/>
                                        </div>
                                        <span class="child_title">{{child.name}}</span>
                                        <i v-if="case_template_list_show && case_current_second_menu === child.id"></i>
                                    </div>
                                </div>
                                <div class="cases_child_list" style="height:0;margin:0 10px 0 0;opacity:0;z-index:-1;"></div>
                                <div class="cases_child_list" style="height:0;margin:0 10px 0 0;opacity:0;z-index:-1;"></div>
                                <div class="cases_child_list" style="height:0;margin:0 10px 0 0;opacity:0;z-index:-1;"></div>
                                <div class="cases_child_list" style="height:0;margin:0 10px 0 0;opacity:0;z-index:-1;"></div>
                                <div class="cases_child_list" style="height:0;margin:0 10px 0 0;opacity:0;z-index:-1;"></div>
                                <div class="cases_child_list" style="height:0;margin:0 10px 0 0;opacity:0;z-index:-1;"></div>
                                <div class="cases_child_list" style="height:0;margin:0 10px 0 0;opacity:0;z-index:-1;"></div>
                                <div class="cases_child_list" style="height:0;margin:0 10px 0 0;opacity:0;z-index:-1;"></div>
                            </div>
                        </div>
                    </div>
                    <!-- 案例二级数据列表 -->
                    <div class="scroll_container case" 
                        @mouseenter="hover_case_template_list(true)"
                        @mouseleave="hover_case_template_list(false)"
                        v-if="current_selected === 'case' && case_category_list.length > 0 && case_current_second_menu"
                    >
                        <div class="case_title" @click="case_menu_checked(case_current_menu)">
                                <div class="icon">
                                <base-icon class="iconjiantou"></base-icon>
                            </div>
                            {{case_current_second_menu_name}}
                        </div>
                        <div class="template_card"
                            v-for="(item, index) in case_template_list"
                            :key="item.id"
                            :id="item.id"
                            :style="{'top': `${item._top}px`, 'left': `${item._left}px`, 'width': `${item._width}px`, 'height': `${item._height}px`}"
                            :class="{'lock' : item.isVip && !user.memberVipExpire}"
                            @click="template_material_append(item)"
                        >
                            <img v-lazy="item.image" :alt="item.name"/>
                            <div class="look_btn">
                                <!-- 图视库会员锁 -->
                                <span class="lock-ico" v-tooltip="item.isVip && !user.memberVipEffect ? '会员专享素材' : ''">
                                    <img src="../../../../assets/pc/images/common/lock_white.png" alt="">
                                </span>
                                <!-- 收藏按钮 -->
                                <base-icon class="favorite-btn iconshoucang" size="16" :color="favorite_map[item.id] ? '#f7b500' : '#ffffff'" v-tooltip="favorite_map[item.id] ? '取消收藏' : '加入收藏'" @click.stop="common_material_favorite(item.id)"></base-icon>
                                <!-- 预览按钮 -->
                                <base-icon class="preview-btn iconyulan" size="16" v-tooltip="`预览`" @click.stop="common_material_page_preview(item, index, case_template_list.length)"></base-icon>
                            </div>
                        </div>
                        <div class="case_empty" v-if="case_template_list.length === 0">
                            <img src="../../../../assets/pc/images/edit/empty_bg.png">
                            <p>这里空空如也~</p>
                        </div>
                    </div>
                    <!-- 首页数据列表 -->
                    <div class="home_page" v-if="home_data_list.length > 0 && current_selected === 'home' && !loading">
                        <!-- 全套 -->
                        <ul class="scroll_container home_list" v-if="EditView.document_info.documentType !== 'design'">
                            <div class="header">
                                <div class="name">{{home_data_list[0].categoryName}}</div>
                                <div class="more" @click="to_more(home_data_list[0].categoryId)">更多</div>
                            </div>
                            <li v-for="item in home_data_list[0].dataList"
                                :key="item.id"
                                :title="item.name"
                                :data-id="item.id"
                                :data-place="item._place_type"
                                :style="{'width': `${item._width}px`, 'height': `${item._height}px`}"
                                :class="{'lock' : item.isVip && !user.memberVipExpire}"
                            >
                                <img v-if="item.documentId" v-show="item.image" v-lazy="item.image" :data-sn="item.sn" :data-id="item.id" alt="模板库全套预览图（幻灯片）" />
                                <div class="svg_view" v-if="item.document && item.page_info">
                                    <svg_modal ref="svg_modal" 
                                        :svg_w="item._width - 2" 
                                        :svg_h="item._height - 2" 
                                        :svg_view="[0, 0, item.svg_width, item.svg_height]" 
                                        :document="item.document" 
                                        :page_info="item.page_info" 
                                        :mode="`thumbnail`"
                                    ></svg_modal>
                                </div>
                                <div class="vip_icon" v-if="item.documentId"></div>
                                <div class="append_layer" v-show="item.insertion">
                                    <div class="lds-spinner">
                                        <div></div><div></div><div></div><div></div><div></div><div></div>
                                        <div></div><div></div><div></div><div></div><div></div><div></div>
                                    </div>
                                </div>
                                <!-- 全套 -->
                                <div class="look_btn" v-if="item.documentId">
                                    <button title="查看模板" @click="to_more(item.id, true)" v-bdtongji="'编辑器-设计-设计弹窗-顶部-查看模板'">查看模板</button>
                                </div>
                                <div @click="common_template_favorite(item.documentId)" 
                                        :class="['favorite-btn', {'has-collect': favorite_map[item.documentId]}]"
                                        v-tooltip="favorite_map[item.documentId] ? '取消收藏' : '加入收藏'"
                                        v-if="item.documentId"
                                >
                                    <base-icon class="iconshoucang"></base-icon>
                                </div>
                                <!-- 预览按钮 -->
                                <div class="preview-icon" @click="suitPreview(item.id, 'template', true)" v-if="item.id" v-tooltip="`预览`">
                                    <base-icon class="iconyulan"></base-icon>
                                </div>
                            </li>
                        </ul>
                        <!-- 单页和设计实验室 -->
                        <ul class="scroll_container home_list" 
                            v-for="item in (EditView.document_info.documentType === 'design' ? home_data_list : home_data_list.slice(1))"
                            :key="item.categoryId"
                            :data-id="item.categoryId"
                            :data-place="item._place_type"
                        >
                            <div class="header">
                                <div class="name">{{item.categoryName}}</div>
                                <div class="more" @click="to_more(item.categoryId)">更多</div>
                            </div>
                            <li v-for="(_item, index) in item.dataList"
                                :key="_item.id"
                                :data-id="_item.categoryId"
                                :data-place="_item._place_type"
                                :style="{'width': `${_item._width}px`, 'height': EditView.document_info.documentType === 'design' ? '100%' : `${_item._height}px`}"
                            >
                                <img v-lazy="_item.image" :data-sn="_item.sn" :data-id="_item.id" @click="template_material_append(_item)" alt="模板库预览图（幻灯片）" v-bdtongji="`PC-统计-设计素材库-${_item.categoryFullName ? _item.categoryFullName.replace(/,/g,'-') : ''}-应用素材`"/>
                                <div class="append_layer" v-show="_item.insertion">
                                    <div class="lds-spinner">
                                        <div></div><div></div><div></div><div></div><div></div><div></div>
                                        <div></div><div></div><div></div><div></div><div></div><div></div>
                                    </div>
                                </div>
                                <div @click="common_template_favorite(_item.documentId)" 
                                    :class="['favorite-btn', {'has-collect': favorite_map[_item.documentId]}]"
                                    v-if="_item.type === 'design'"
                                    v-tooltip="favorite_map[_item.documentId] ? '取消收藏' : '加入收藏'"
                                >
                                    <base-icon class="iconshoucang"></base-icon>
                                </div>
                                <div @click="common_material_favorite(_item.id)" 
                                    :class="['favorite-btn', {'has-collect': favorite_map[_item.id]}]"
                                    v-bdtongji="'编辑器-设计-设计弹窗-模板-'+favorite_map[_item.id] ? '取消收藏' : '加入收藏'"
                                    v-tooltip="favorite_map[_item.id] ? '取消收藏' : '加入收藏'"
                                    v-else
                                >
                                    <base-icon class="iconshoucang"></base-icon>
                                </div>
                                <!-- 预览按钮 -->
                                <base-icon class="preview-btn iconyulan" size="16" v-tooltip="`预览`" @click="suitPreview(_item.id)" v-if="EditView.document_info.documentType === 'design'"></base-icon>
                                <base-icon class="preview-btn iconyulan" size="16" v-tooltip="`预览`" @click="common_material_page_preview(_item, index, item.dataList.length)" v-else></base-icon>
                            </li>
                        </ul>
                    </div>

                    <!-- 我的收藏-全套模板数据列表 -->
                    <ul class="scroll_container suit_list" v-if="current_selected === 'collection' && collection_current_second_menu === TEMPLATE_SUIT_ID">
                        <li v-for="(item, index) in collection_data_list" 
                            :key="item.id" 
                            :title="item.name" 
                            :data-id="item.id" 
                            :data-place="item._place_type" 
                            :style="{'top': `${item._top}px`, 'left': `${item._left}px`, 'width': `${item._width}px`, 'height': `${item._height}px`}" 
                            v-show="item._top <= visible_area_max && (item._top + item._height) >= visible_area_min" 
                            :class="{'lock' : (item.isVip || item.templateIsVip) && !user.memberVipExpire}"
                        >
                            <img v-if="item.documentId" v-show="item.image" v-lazy="item.image" :data-sn="item.sn" :data-id="item.id" alt="模板库全套预览图（幻灯片）" />
                            <div class="svg_view" v-if="item.document && item.page_info" @click="template_group_append(item)">
                                <svg_modal ref="svg_modal" 
                                    :svg_w="item._width - 2" 
                                    :svg_h="item._height - 2" 
                                    :svg_view="[0, 0, item.svg_width, item.svg_height]" 
                                    :document="item.document" 
                                    :page_info="item.page_info" 
                                ></svg_modal>
                            </div>
                            <div class="vip_icon" v-if="item.documentId"></div>
                            <span class="lock-ico" v-else v-tooltip="item.isVip && !user.memberVipEffect ? '会员专享素材' : ''">
                                <img src="../../../../assets/pc/images/common/lock_white.png" alt="">
                            </span>
                            <div class="append_layer" v-show="item.insertion">
                                <div class="lds-spinner">
                                    <div></div><div></div><div></div><div></div><div></div><div></div>
                                    <div></div><div></div><div></div><div></div><div></div><div></div>
                                </div>
                            </div>
                            <!-- 全套 -->
                            <div class="look_btn" v-if="item.documentId">
                                <button title="查看模板" @click="check_template_detail(item.templateId)" v-bdtongji="'编辑器-我的-我的收藏弹框-顶部-查看模板'">查看模板</button>
                            </div>
                            <div @click="collection_template_favorite(item.documentId)" 
                                    :class="['favorite-btn', {'has-collect': favorite_map[item.documentId]}]" 
                                    v-tooltip="favorite_map[item.documentId] ? '取消收藏' : '加入收藏'"
                                    v-bdtongji="'编辑器-我的-我的收藏弹框-设计-全套-取消收藏'"
                                    v-if="item.documentId"
                            >
                                <base-icon class="iconshoucang"></base-icon>
                            </div>
                            <!-- 预览按钮 -->
                            <div class="preview-icon" @click="suitPreview(item.templateId, 'template', true)" v-if="item.documentId" v-tooltip="`预览`">
                                <base-icon class="iconyulan"></base-icon>
                            </div>
                            <base-icon class="preview-btn iconyulan is-group" size="16" v-tooltip="`预览`" @click="template_group_preview(index)" v-else></base-icon>
                        </li>
                    </ul>
                    <!--  我的收藏-素材或模板单页列表 -->
                    <ul class="scroll_container" v-if="current_selected === 'collection' && collection_current_second_menu !== TEMPLATE_SUIT_ID">
                        <li v-for="(item, index) in collection_data_list" 
                            :key="item.id" 
                            :data-id="item.id"
                            :data-place="item._place_type"
                            :class="{'gif_tag': item.gif_img, 'svg_tag': item.svg_img, 'lock': item.isVip && !user.memberVipExpire}"
                            :style="{'top': `${item._top}px`, 'left': `${item._left}px`, 'width': `${item._width}px`, 'height': `${item._height}px`}"
                            v-show="item._top <= visible_area_max && (item._top + item._height) >= visible_area_min"
                            @mouseenter="static2dynamic($event, item)" 
                            @mouseleave="dynamic2static($event, item)" 
                        >
                            <img @load="img_load_done($event)" 
                                v-lazy="item.image" 
                                :data-sn="item.sn" 
                                :data-id="item.id" 
                                @click="collection_material_append(item)" 
                                alt="图片库素材预览图" 
                                v-bdtongji="`PC-统计-我的收藏-${item.categoryFullName ? item.categoryFullName.replace(/,/g,'-') : ''}-应用素材`"
                            />
                            <div class="append_layer" v-show="item.insertion">
                                <div class="lds-spinner">
                                    <div></div><div></div><div></div><div></div><div></div><div></div>
                                    <div></div><div></div><div></div><div></div><div></div><div></div>
                                </div>
                            </div>
                            <!-- 会员锁 -->
                            <span class="lock-ico" v-tooltip="item.isVip && !user.memberVipEffect ? '会员专享素材' : ''">
                                <img src="../../../../assets/pc/images/common/lock_white.png" alt="">
                            </span>
                            <!-- 我的上传分类、最近使用中上传的图片不显示收藏按钮，我的收藏分类取消收藏删除更新数据 -->
                            <div @click="common_template_favorite(item.documentId)" 
                                    :class="['favorite-btn', {'has-collect': favorite_map[item.documentId]}]" 
                                    v-tooltip="favorite_map[item.documentId] ? '取消收藏' : '加入收藏'"
                                    v-if="item.templateType === 'design'"
                            >
                                <base-icon class="iconshoucang"></base-icon>
                            </div>
                            <div @click="['template_collection', 'pic_collection','cases_collection'].indexOf(collection_current_menu) >=0 
                                        ? image_material_favorite(item.id) : common_material_favorite(item.id)" 
                                    :class="['favorite-btn', {'has-collect': favorite_map[item.id]}]" 
                                    v-tooltip="favorite_map[item.id] ? '取消收藏' : '加入收藏'"
                                    v-else
                            >
                                <base-icon class="iconshoucang"></base-icon>
                            </div>
                            <!-- 预览按钮 -->
                            <base-icon class="preview-btn iconyulan" size="16" v-tooltip="`预览`" @click="suitPreview(item.templateId)" v-if="EditView.document_info.documentType === 'design' && collection_current_menu === 'template_collection'"></base-icon>
                            <base-icon class="preview-btn iconyulan" size="16" v-tooltip="`预览`" @click="common_material_page_preview(item, index, template_data_list.length)" v-else></base-icon>
                        </li>
                    </ul>

                    <div class="collect_empty" v-show="home_data_list.length === 0 && picview_data_list.length === 0 && template_data_list.length === 0 && case_category_list.length === 0 && collection_data_list.length === 0 && !loading">
                        <img src="../../../../assets/pc/images/edit/empty_bg.png">
                        <p>这里空空如也~</p>
                    </div>
                    <!-- 第一页加载效果 -->
                    <div class="first_loading" v-show="(template_data_list.length === 0 || picview_data_list.length === 0) && loading">
                        <img src="../../../../assets/pc/images/edit/category_loading.gif" alt="数据加载中" />
                    </div>
                    <!-- 滚动加载下一页效果 -->
                    <div class="scroll_loading" v-show="(template_data_list.length > 0 || picview_data_list.length > 0) && loading">
                        <img src="../../../../assets/pc/images/edit/scroll_loading.gif" alt="数据加载中" />
                    </div>
                    <!-- 无更多效果 -->                           
                    <div class="no_more" v-show="(template_data_list.length > 0 || picview_data_list.length > 0) && !loading">
                        <i class="edit-ico edit-ico-material_no_more"></i>
                        <p>没有更多了</p>
                    </div>
                    <!-- 加载错误效果 -->
                    <div class="load_error" v-show="loaderror">
                        <img src="../../../../assets/pc/images/common/loaderror.png" alt="加载失败" />
                        <p>哇哦，网络好像不给力，重新加载试试看</p>
                        <a class="reload_btn" @click="template_menu_checked(template_current_menu, true);">重新加载</a>
                    </div>
                </div>
            </div>
        </div>

        <!-- 全套预览弹框 -->
        <whole-preview-modal ref="whole_preview_modal" :type="EditView.document_info.documentType === 'design' ? 'design' : 'template'" @insert="whole_preview_insert"></whole-preview-modal>

        <!-- 素材模板页预览弹框 -->
        <page-preview-modal ref="pagePreviewModal" @change="material_page_preview_change" @insert="material_page_preview_insert"></page-preview-modal>
    </div>
</template>

<script>
    import WholePreviewModal from '@/views/pc/EditView/WholePreviewModal.vue';
    import material from '@/assets/pc/js/material.js';
    import svg_modal from '@/components/SvgPageModal.vue';
    import pagePreviewModal from '@/views/pc/EditView/MaterialModal/MaterialPagePreview.vue';
    export default {
        components: {
            svg_modal,
            WholePreviewModal,
            pagePreviewModal
        },
        inject:['EditView', 'MaterialLibrary'],
        data() {
            return {
                /** ------------ 通用数据 ---------------- */
                current_selected: 'home',                       // 当前选择分类--->首页:home; 模板:template; 图示:picview; 案例:case; 我的收藏夹:collection
                loaderror: false,                               // 加载失败
                loading: false,                                 // 加载中
                search_empty: false,                            // 列表空状态
                favorite_map: {},                               // 收藏列表
                visible_area_max: 0,                            // 可视区域相对滚动区域底部位置
                visible_area_min: 0,                            // 可视区域相对滚动区域顶部位置
                show_to_top: false,                             // 是否显示回顶部按钮
                show_filter: false,                             // 是否显示筛选框
                home_data_list: [],                             // 首页数据列表
                home_data_size: 3,                              // 首页一行展示数量,默认展示3个
                material_pagination: {},                        // 素材列表加载数据

                /** ------------ 模板类相关数据 -----------*/
                // 状态或常量
                TEMPLATE_ID: 8,                                 // 模板库接口id
                TEMPLATE_SUIT_ID: 'template_group',             // 模板库 全套分类 id值
                template_current_menu: null,                    // 当前选中的模板库二级分类，值为字符串或数字
                template_menu_referrer: null,                   // 模板库当前面板的来源面板，值为上一个 template_current_menu
                template_menu_need_checked_id: null,            // 模板一级菜单需要选中的id，一般用于在二级分类时赋值
                template_current_menu_is_onelevel: true,        // 当前选中的菜单是否是一级菜单
                template_current_tags: '',                      // 当前选中的标签，设计实验室二级分类id
                template_show_back_menu: false,                 // 返回上一级菜单按钮
                template_current_number: '',                    // 当前选中的个数标签，值为数字

                // 数据列表
                template_data_list: [],                         // 模板数据列表
                template_menu_list: [],                         // 模板库二级分类列表
                template_menu_id_list: [],                      // 模板库二级分类列表id
                number_tags_list: [{
                        text: "1个",
                        value: 1,
                    }, {
                        text: "2个",
                        value: 2,
                    }, {
                        text: "3个",
                        value: 3,
                    }, {
                        text: "4个",
                        value: 4,
                    }, {
                        text: "5个",
                        value: 5,
                    }, {
                        text: "6个",
                        value: 6,
                    }, {
                        text: "7个",
                        value: 7,
                    }, {
                        text: "8个以上",
                        value: 8,
                }],                                             // 通用个数标签
                template_tags_list: ["并列列表", "流程步骤", "因子结果", "循环重复", "图文混排", "数据图表", "其它图表"],             // 模板库标签列表

                /** ---------------图视类相关数据------------*/
                PICVIEW_ID: 266,                                // 图视库接口id
                picview_data_list: [],                          // 图视库二级分类列表
                picview_menu_list: [],                          // 图视库数据列表
                picview_menu_id_list: [],                       // 图视库二级分类列表id
                picview_current_menu: null,                     // 当前选中的图视库二级分类，值为字符串或数字

                /** ---------------案例类相关数据------------*/
                CASES_ID: 531,                                  // 案例ID
                case_category_list: [],                         // 案例一级分类列表
                case_current_menu: null,                        // 当前选中的案例一级分类
                case_current_second_menu: null,                 // 当前打开的二级列表分类id 
                case_current_second_menu_name: null,            // 当前打开的二级列表分类名称 
                pre_current_second_menu: null,                  // 上一次打开的二级列表分类
                case_template_list_show: false,                 // 案例模板展示标识
                case_template_list: [],                         // 案例二级分类列表数据

                /** ---------------我的收藏相关数据------------*/
                collection_current_menu: null,                  // 选中的一级分类
                collection_current_second_menu: null,           // 选中的二级分类
                collection_data_list: [],                       // 我的收藏数据列表
                collection_show_back_menu: false,               // 点击全套模板的查看按钮后显示
                case_menu_list: [],                             // 案例分类列表
                collect_list: [
                    {
                        id: 1,
                        title: '模板',
                        icon: "iconchangyongyuansu",
                        type: "template_collection"
                    },
                    {
                        id: 2,
                        title: '图示',
                        icon: "iconchatu",
                        type: "pic_collection"
                    },
                    {
                        id: 3,
                        title: '案例',
                        icon: "iconbiaoqing",
                        type: "cases_collection"
                    },
                ],

                user:{}
            }
        },
        mounted() {
            let that = this;
            that.user = Object.assign(that.user, that.$common.get_login_state());
            $(window).on('resize', () => {
                if (that.MaterialLibrary.material_library_type !== 'template') {
                    return;
                }
                let conf = that.current_open_modal().base_conf;
                let old_size = that.home_data_size;
                that.home_data_size = Math.floor($(conf.el).width() / (conf.width + conf.offset));
                if (old_size !== that.home_data_size && that.current_selected === 'home') {
                    this.material_template_init();
                } else if (that.current_selected === 'home') {
                    // 计算列表自适应布局
                    that.home_data_list.forEach(item => {
                        item.dataList = material.method.material_adapt(item.dataList, {
                            el: conf.el,
                            width: conf.width,
                            height: conf.height,
                            offset: 10,
                        });
                    })
                } else {
                    that.re_adapt();
                }
            });
        },
        methods: {
            /** ------------------- 通用方法 ----------------------------*/
            material_template_init() {
                let that = this;
                that.current_selected = 'home';
                that.home_data_list = [];
                that.template_data_list = [];
                that.picview_data_list = [];
                that.template_menu_list = [];
                that.picview_menu_list = [];
                that.case_category_list = [];
                that.case_menu_list = [];
                that.case_template_list = [];
                that.template_menu_id_list = [];
                that.picview_menu_id_list = [];
                that.collection_data_list = [];
                that.template_current_menu = null;
                that.picview_current_menu = null;
                that.case_current_menu = null;
                that.case_current_second_menu = null;
                that.case_current_second_menu_name = null;
                that.pre_current_second_menu = null;
                that.template_menu_referrer = null;
                that.collection_current_menu = null;
                that.collection_current_second_menu = null;
                that.favorite_map = {};
                that.template_show_back_menu = false;
                that.collection_show_back_menu = false;
                that.show_filter = false;
                that.home_enter_group = false;
                that.search_empty = false;
                that.template_menu_need_checked_id = null;
                let template_group = {
                    categoryFullName: "幻灯片,全套",
                    categoryId: "template_group",
                    categoryName: "全套",
                    categoryShowType: "ppt",
                    dataList: [],
                }
                
                that.$nextTick(() => {
                    let conf = that.current_open_modal().base_conf;
                    that.home_data_size = Math.floor($(conf.el).width() / (conf.width + conf.offset));
                    conf.el.onscroll = null; // 取消滚动事件
                    // 合并接口参数
                    let $params = {
                        'cid': that.TEMPLATE_ID,
                        'size': that.home_data_size,
                    };
                    that.search_empty = false;
                    that.loaderror = false;
                    that.loading = true;
                    if (that.EditView.document_info.documentType !== 'design') {
                        material.api.common_get_material({
                            url: '/api/material/category_material/',
                            current_modal: that.current_open_modal(),
                            params: $params,
                            beforeSend: () => {
                                // 更新节点信息
                                conf = that.current_open_modal().base_conf;
                                // 页码 = 1 时，重新从第一页获取，则清除之前的列表
                                that.home_data_list = [];
                                $(conf.el).scrollTop(0);
                            },
                            success: (data) => {
                                that.search_empty = material.states.search_empty;
                                that.favorite_map = material.favorite_map;
                                that.home_data_list = data.list.concat();
                                that.home_data_list.unshift(template_group);

                                material.api.common_get_material({
                                    url: "/api/template/list/",
                                    current_modal: that.current_open_modal(),
                                    params: {
                                        'pageNumber': 1,
                                        'pageSize': that.home_data_size,
                                        'tagName': '',
                                        'textCount': '',
                                    },
                                    beforeSend: () => {
                                        // 更新节点信息
                                        conf = that.current_open_modal().base_conf;
                                        // 页码 = 1 时，重新从第一页获取，则清除之前的列表
                                        if ($params['pageNumber'] === 1) {
                                            that.home_data_list[0].dataList = [];
                                            $(conf.el).scrollTop(0);
                                        }
                                    },
                                    success: (data) => {
                                        that.search_empty = material.states.search_empty;
                                        that.favorite_map = Object.assign(that.favorite_map, material.favorite_map);
                                        that.home_data_list[0].dataList = that.home_data_list[0].dataList.concat(data.dataList);

                                        // 计算列表自适应布局
                                        that.home_data_list.forEach(item => {
                                            item.dataList = material.method.material_adapt(item.dataList, {
                                                el: conf.el,
                                                width: conf.width,
                                                height: conf.height,
                                                offset: 10,
                                            });
                                        })
                                        if (that.$refs.template_contain_dom.querySelector('.scroll_container')) {
                                            that.$refs.template_contain_dom.querySelector('.scroll_container').style.height = 'auto';
                                        }
                                        that.loading = false;
                                    },
                                    error: () => {
                                        that.$toast('数据获取失败');
                                        that.loaderror = true;
                                        that.home_data_list[0].dataList = [];
                                    },
                                });
                            },
                            error: () => {
                                that.$toast('数据获取失败');
                                that.loading = false;
                                if ($params['pageNumber'] === 1) {
                                    that.loaderror = true;
                                    that.home_data_list = [];
                                }
                            },
                        })
                    } else {
                        material.api.common_get_material({
                            url: '/api/template/category_design/',
                            current_modal: that.current_open_modal(),
                            params: {
                                'size': that.home_data_size
                            },
                            beforeSend: () => {
                                // 更新节点信息
                                conf = that.current_open_modal().base_conf;
                                // 页码 = 1 时，重新从第一页获取，则清除之前的列表
                                that.home_data_list = [];
                                $(conf.el).scrollTop(0);
                            },
                            success: (data) => {
                                that.search_empty = material.states.search_empty;
                                that.favorite_map = material.favorite_map;
                                that.home_data_list = data.list.concat();
                                // 计算列表自适应布局
                                that.home_data_list.forEach(item => {
                                    item.dataList = material.method.material_adapt(item.dataList, {
                                        el: conf.el,
                                        width: conf.width,
                                        height: conf.height,
                                        offset: 10,
                                    });
                                })
                                that.loading = false;
                            },
                            error: () => {
                                that.$toast('数据获取失败');
                                that.loading = false;
                                that.loaderror = true;
                                that.home_data_list = [];
                            },
                        })
                    }
                });
            },
            close_modal() {
                let that = this;
                that.$emit('close_modal');
            },
            // 模板库弹窗打开初始化，获取模板库菜单列表
            template_open_init (callback) {
                let that = this;
                that.home_data_list = [];
                that.current_selected = 'template';
                let category_id;
                // 区分设计实验室和幻灯片
                if (that.EditView.document_info.documentType === 'design') {
                    category_id = 'design';
                } else {
                    category_id = that.TEMPLATE_ID;
                }
                if(that.template_menu_list.length === 0) {
                    material.api.commmon_get_category(category_id, (data) => {
                        that.loaderror = material.states.loaderror;
                        // 网络错误情况下、空列表状态情况下、数据列表0情况下，重新加载
                        if (that.loaderror || that.search_empty || that.template_data_list.length === 0) {
                            // 根据 模板 | 设计作品 展示相应菜单和列表
                            if (that.EditView.document_info.documentType !== 'design') {
                                that.template_init_show(data);
                            } else if (that.EditView.document_info.documentType === 'design') {
                                that.design_init_show(data);
                            }
                        } else {
                            that.re_adapt();
                        }
                        if (typeof callback === 'function') callback();
                    });
                }
                // 延时等待dom动画效果消失，更新可视区域数值
                setTimeout(() => {
                    let limit = material.method.update_visible_area(that.current_open_modal());
                    that.visible_area_min  = limit.min;
                    that.visible_area_max  = limit.max;
                }, 500)
            },
            // 返回当前正在访问的面板数据，数据列表、标签列表、滚动dom容器、素材自适应基础尺寸、间距
            current_open_modal() {
                let obj = {};
                let that = this;
                obj = {
                    key: 'designStore',
                    classify: that.EditView.document_info.documentType === 'design' ? 'design' : 'template',
                    data: that.template_data_list,
                    tags: that.template_tags_list,
                    menu: that.template_menu_list,
                    base_conf: {
                        el: that.$refs.template_contain_dom,
                        width: 150,
                        height: 9 / 16 * 150,
                        offset: 10,
                        type: 'fixed',
                    }
                }
                // 设计实验室瀑布流尺寸
                if (that.EditView.document_info.documentType === 'design' && that.picview_current_menu === null && that.case_current_menu === null) {
                    obj['base_conf'].width = 160;
                    obj['base_conf'].height = 200;
                    obj['base_conf'].type = 'waterfall';
                }
                if (that.current_selected === 'picview') {
                    obj['data'] = that.picview_data_list;
                } else if (that.current_selected === 'collection') {
                    obj['data'] = that.collection_data_list;
                } else if (that.current_selected === 'case') {
                    obj['key'] = 'casesStore';
                    obj['data'] = that.case_template_list;
                } else if (that.current_selected === 'home') {
                    obj['data'] = that.home_data_list;
                }
                return obj;
            },
            // 设置 素材 加入收藏 & 取消收藏
            common_material_favorite (id) {
                let that = this;
                material.api.common_material_favorite(id, (state, data) => {
                        if(state === 'delete'){
                            that.$set(that.favorite_map, id, false);
                        }else{
                            that.$set(that.favorite_map, id, data);
                        }
                    }
                )
            },
            // 设置 模板 加入收藏 & 取消收藏
            common_template_favorite (id) {
                let that = this;
                if (!id) return false;
                material.api.common_template_favorite(id, (state) => {
                        if(state === 'delete'){
                            that.$set(that.favorite_map, id, false);
                        }else{
                            that.$set(that.favorite_map, id, true);
                        }
                        if (that.collection_data_list.length) {
                            // 删除对应数据，更新视图
                            let index = that.collection_data_list.findIndex(item => item.documentId === id);
                            if (index >= 0) {
                                that.collection_data_list.splice(index, 1);
                                that.search_empty = that.collection_data_list.length === 0;
                            }
                            that.re_adapt();
                        }
                        // 强制更新视图
                        that.$forceUpdate();
                    }
                )
            },
            // 设置 模板 预览
            common_material_page_preview(item, index, length) {
                let show_btn = {};
                if (this.current_selected === 'home') {
                    show_btn.hide_arrow = true;
                }
                this.$refs.pagePreviewModal.show(item, index, length, show_btn);
            },
            // 设置 模板 预览切换
            material_page_preview_change(option) {
                const that = this;
                let {type, index} = option;
                let templateList = that.template_data_list;
                let caseList = that.case_template_list;
                let picList = that.picview_data_list;
                let isTemp = that.current_selected === 'template';
                let isPic = that.current_selected === 'picview';
                let isCase = that.current_selected === 'case';
                let previewDom = that.$refs.pagePreviewModal;
                let pagination = that.material_pagination;
                if (type === 'previous') {
                    switch (true) {
                        case isTemp:
                            previewDom.change(templateList[index - 1], index - 1);
                            break;
                        case isPic:
                            previewDom.change(picList[index - 1], index - 1);
                            break;
                        case isCase:
                            previewDom.change(caseList[index - 1], index - 1);
                            break;
                    }
                } else {
                    switch (true) {
                        case isTemp:
                            if (index === templateList.length - 3) {
                                that.template_get_data({
                                    cid: pagination['cid'],
                                    pageNumber: pagination.pageNumber,
                                    pageSize: pagination.pageSize,
                                }, length => {
                                    previewDom.changeLength(length);
                                });
                            }
                            previewDom.change(templateList[index + 1], index + 1);
                            break;
                        case isPic:
                            if (index === picList.length - 3) {
                                that.picview_get_data({
                                    cid: pagination['cid'],
                                    pageNumber: pagination.pageNumber,
                                    pageSize: pagination.pageSize,
                                }, length => {
                                    previewDom.changeLength(length);
                                });
                            }
                            previewDom.change(picList[index + 1], index + 1);
                            break;
                        case isCase:
                            if (index === caseList.length - 3) {
                                that.get_case_template_list({
                                    cid: pagination.params.cid,
                                    pageNumber: pagination.pageNumber,
                                }, length => {
                                    previewDom.changeLength(length);
                                })
                            }
                            previewDom.change(caseList[index + 1], index + 1);
                            break;
                    }
                }
            },
            template_group_preview(index) {
                this.$refs.whole_preview_modal.group_show(this.template_group_data, index);
            },
            // 设置 模板 预览插入
            material_page_preview_insert(item) {
                const that = this;
                let picList = that.picview_data_list;
                let isPic = picList.length > 0;
                if (isPic) {
                    that.picview_material_append(item);
                } else if(that.template_current_menu === "template_group") {
                    that.template_group_append(item);
                } else {
                    that.template_material_append(item);
                }
            },
            whole_preview_insert(item) {
                let that = this;
                let picList = that.picview_data_list;
                let isPic = picList.length > 0;
                if (isPic) {
                    that.picview_material_append(item);
                } else if (that.EditView.document_info.documentType === 'design'){
                    that.template_material_append(item);
                } else {
                    that.template_group_append(item);
                }
            },
            // 刷新自适应
            re_adapt () {
                let that = this;
                this.MaterialLibrary.re_adapt(that.current_open_modal());
            },
            // 返回
            go_back() {
                let that = this;
                if (that.template_show_back_menu && !that.home_enter_group) {
                    that.template_menu_checked(that.template_menu_referrer);
                } else if(that.collection_show_back_menu) {
                    that.collection_second_menu_checked(that.TEMPLATE_SUIT_ID)
                } else {
                    that.material_template_init();
                }
            },
            // 进入更多
            to_more(id, is_group) {
                if (is_group) {
                    this.home_enter_group = true;
                }
                this.template_open_init(this.template_menu_checked.bind(this, id));
            },

            /**
                模板库
             */
            // 模板库菜单点击，force_update = 当前id与参数id相等时，是否强制更新，默认false
            template_menu_checked (id, force_update) {
                let that = this;
                if (that.template_current_menu === id && !force_update) return false;
                that.show_filter = false; // 关闭筛选框
                that.template_menu_referrer = that.template_current_menu;
                that.template_current_menu = id;
                that.template_current_tags = '';
                that.template_current_menu_is_onelevel = !!that.template_menu_list.find(item => item.id === id);
                that.template_current_number = null;
                // 初始化二级菜单下的操作状态
                that.template_show_back_menu = false;
                that.template_menu_need_checked_id = null;
                // 区分设计实验室 | 模板
                if (that.EditView.document_info.documentType === 'design') {
                    that.design_get_data({
                        'cid': id,
                    });
                    that.design_get_tag_data(id);
                } else {
                    // 当前分类为全套模板或进入
                    if ((that.template_menu_referrer === that.TEMPLATE_SUIT_ID && !that.template_current_menu_is_onelevel)) {
                        that.template_menu_need_checked_id = that.TEMPLATE_SUIT_ID;
                        that.template_get_group_data(id);
                    } else {
                        that.template_get_data({
                            'cid': id,
                        });
                    }
                }
                
                //三级菜单处理
                that.template_child_current_menu = null;
                that.template_child_menu_list = [];
                if(id === 104){ //正文
                    let $params = {
                        id: id,
                    }
                    material.api.commmon_get_category_by_id($params, (data) => {
                        data = data && data.length > 0 ? data[0].childrenList : [];
                        that.template_child_menu_list = data;
                    });
                }
            },

            /** ----------------- 模板类 template -------------------*/
            // 初始化模板显示
            template_init_show (category_data) {
                let that = this;
                // 获取二级分类，map不改变源数组
                that.template_menu_list = category_data.childrenList;
                that.template_menu_id_list = category_data.childrenList.map(item => item.id).reverse();
                // 添加全套分类
                that.template_push_group();
                if(!that.template_current_menu && !that.picview_current_menu){
                    that.template_menu_checked(that.template_menu_list[0].id);
                }
            },
             // 模板全套分类
            template_push_group () {
                let that = this;
                let id_value = that.TEMPLATE_SUIT_ID;
                if (that.template_menu_list.find(item => item.id === id_value)) return false;
                // 与模板库分类其他二级分类数据结构相同
                that.template_menu_list.unshift({
                    createDate: 0,
                    id: id_value,
                    image: null,
                    modifyDate: 0,
                    name: "全套",
                    order: 0,
                    showType: "ppt",
                });
            },
            // 获取全套模板页列表数据
            template_get_group_data (id) {
                let that = this;
                if (!id) return false;
                that.template_show_back_menu = true;
                // 获取该套模板全部页面
                that.$nextTick(() => {
                    let conf;
                    that.search_empty = false;
                    that.loaderror = false;
                    that.loading = true;
                    material.api.common_get_material({
                        url: `/api/template/detail/${id}/`,
                        current_modal: that.current_open_modal(),
                        beforeSend: () => {
                            // 更新节点信息
                            conf = that.current_open_modal().base_conf;
                            // 清除之前的数据，重置滚动条
                            that.template_data_list = [];
                            $(conf.el).scrollTop(0);
                        },
                        success: (data) => {
                            this.template_group_data = data;
                            that.search_empty = material.states.search_empty;
                            that.loading = material.states.loading;
                            // svgModal 渲染需要的数据
                            let doc = that.$common.document_dataparse(data.document);
                            let doc_pages = that.$common.document_pages_dataparse(data.documentPages);
                            let data_list = doc_pages.map((item) => {
                                let item_info = Object.assign({}, item);
                                item['page_info'] = item_info;
                                item['svg_width'] = doc.width;
                                item['svg_height'] = doc.height;
                                item['document'] = doc;
                                item['isVip'] = data.isVip;
                                return item;
                            });
                            data_list = that.template_data_list.concat(data_list);
                            // 更新节点信息
                            conf = that.current_open_modal().base_conf;
                            // 计算列表自适应布局
                            that.template_data_list = material.method.material_adapt(data_list, {
                                el: conf.el,
                                width: conf.width,
                                height: conf.height,
                                offset: 10,
                            });
                            material.method.common_scroll_load(that.current_open_modal(), null ,false, (limit) => {
                                that.visible_area_min = limit.min;
                                that.visible_area_max = limit.max;
                            });
                        },
                        error: () => {
                            that.loaderror = true;
                            that.$toast('数据获取失败');
                        },
                    });
                });
            },
            // 全套模板预览
            suitPreview(id, type, is_suit){
                this.$refs.whole_preview_modal.show({id, type, is_suit});
            },
            // 模板库个数标签点击事件
            template_number_checked (number) {
                let that = this;
                that.template_current_number = that.template_current_number === number ? '' : number;
                that.template_get_data({
                    'cid': that.template_current_menu,
                    'tagName': that.template_current_tags,
                    'textCount': that.template_current_number,
                });
            },
            // 模板库子菜单点击
            template_child_menu_checked (id) {
                let that = this;
                that.template_child_current_menu = that.template_child_current_menu === id ? null : id;
                that.template_get_data({
                    'cid': that.template_child_current_menu || that.template_current_menu,
                    'tagName': that.template_current_tags,
                    'textCount': that.template_current_number,
                });
            },
            // 获取模板库列表
            template_get_data (param) {
                let that = this;
                let id_value = that.TEMPLATE_SUIT_ID;
                let template_group_api = false;
                if (param['cid'] === id_value) {
                    template_group_api = '/api/template/list/';
                }
                that.$nextTick(() => {
                    let conf = that.current_open_modal().base_conf;
                    // 计算 pageSize
                    let page_size = material.method.compute_page_size({
                        el: conf.el,
                        width: conf.width,
                        height: conf.height,
                    });
                    // 合并接口参数
                    let $params = {
                        'cid': null,
                        'pageNumber': 1,
                        'pageSize': page_size,
                        'tagName': '',
                        'textCount': '',
                    };
                    $params = Object.assign($params, param);
                    if (!$params['cid']) return false;
                    // 全套模板列表接口时，清除cid参数
                    if (template_group_api) {
                        delete $params['cid'];
                    }
                    that.search_empty = false;
                    that.loaderror = false;
                    that.loading = true;
                    material.api.common_get_material({
                        url: template_group_api,
                        current_modal: that.current_open_modal(),
                        params: $params,
                        beforeSend: () => {
                            // 更新节点信息
                            conf = that.current_open_modal().base_conf;
                            // 页码 = 1 时，重新从第一页获取，则清除之前的列表
                            if ($params['pageNumber'] === 1) {
                                that.template_data_list = [];
                                $(conf.el).scrollTop(0);
                            }
                        },
                        success: (data) => {
                            that.search_empty = material.states.search_empty;
                            that.favorite_map = material.favorite_map;
                            that.loading = false;
                            let data_list = that.template_data_list.concat(data.dataList);
                            if (that.search_empty) {
                                // 更新节点信息
                                conf = that.current_open_modal().base_conf;
                                that.template_data_list = material.method.material_adapt(data.recommendList, {
                                    el: conf.el,
                                    width: conf.width,
                                    height: conf.height,
                                    offset: 10,
                                });
                            } else {
                                // 计算列表自适应布局
                                that.template_data_list = material.method.material_adapt(data_list, {
                                    el: conf.el,
                                    width: conf.width,
                                    height: conf.height,
                                    offset: 10,
                                });
                                // 分页信息
                                let pagination = {
                                    pageNumber: data.pageNumber,
                                    pageSize: data.pageSize,
                                    totalPages: data.totalPages,
                                };
                                // 绑定滚动加载方法
                                material.method.common_scroll_load(that.current_open_modal(), pagination, (pagedata) => {
                                    // 加载下一页
                                    that.template_get_data({
                                        'cid': param['cid'],
                                        'pageNumber': pagedata.pageNumber,
                                        'pageSize': pagedata.pageSize,
                                        'tagName': $params['tagName'],
                                        'textCount': $params['textCount'],
                                    });
                                    that.show_to_top = material.states.show_to_top;
                                }, (limit) => {
                                    that.visible_area_min = limit.min;
                                    that.visible_area_max = limit.max;
                                });
                            }
                        },
                        error: () => {
                            that.$toast('数据获取失败');
                            if ($params['pageNumber'] === 1) {
                                that.loaderror = true;
                                that.template_data_list = [];
                            }
                        },
                    });
                });
            },

            /** ---------------- 图视分类 -------------------------*/
            // 图示库弹窗打开初始化，获取图示库菜单列表
            picview_open_init () {
                let that = this;
                that.home_data_list = [];
                that.current_selected = 'picview';
                if(that.picview_menu_list.length === 0) {
                    // 获取图视分类列表
                    that.picview_get_category();
                    // 获取图视库数据
                    that.picview_menu_checked(that.PICVIEW_ID);
                }
                // 延时等待dom动画效果消失，更新可视区域数值
                setTimeout(() => {
                    let limit = material.method.update_visible_area(that.current_open_modal());
                    that.visible_area_min  = limit.min;
                    that.visible_area_max  = limit.max;
                }, 500)
            },
            // 获取图视库分类列表
            picview_get_category (){
                let that = this;
                let $params = {
                    id: that.PICVIEW_ID,
                    grade: '2',
                }
                material.api.commmon_get_category_by_id($params, (data) => {
                    data = data && data.length > 0 ? data[0].childrenList : [];
                    that.picview_menu_list = data;
                    that.picview_menu_list.forEach(item => {
                        that.picview_menu_id_list.push(item.id);
                    })
                });
            },
            // 切换图视分类
            picview_menu_checked (id){
                let that =this;
                that.show_filter = false; // 关闭筛选框
                if (that.picview_current_menu === id) return false;
                that.picview_current_menu = id;
                that.picview_get_data({
                    'cid': id,
                });
            },
            // 获取图视数据列表
            picview_get_data (param, fn) {
                let that = this;
                that.search_empty = false;
                that.template_current_menu = null ;
                that.$nextTick(() => {
                    let conf = that.current_open_modal().base_conf;
                    // 计算 pageSize
                    let page_size = material.method.compute_page_size({
                        el: conf.el,
                        width: conf.width,
                        height: conf.height,
                    });
                    // 合并接口参数
                    let $params = {
                        'cid': null,
                        'pageNumber': 1,
                        'pageSize': page_size,
                    };
                    $params = Object.assign($params, param);
                    that.search_empty = false;
                    that.loaderror = false;
                    that.loading = true;
                    // 获取数据列表
                    material.api.common_get_material({
                        params: $params,
                        current_modal: that.current_open_modal(),
                        beforeSend: () => {
                            // 更新节点信息
                            conf = that.current_open_modal().base_conf;
                            // 页码 = 1 时，重新从第一页获取，则清除之前的列表
                            if ($params['pageNumber'] === 1) {
                                that.picview_data_list = [];
                                $(conf.el).scrollTop(0);
                            }
                        },
                        success: (data) => {
                            that.search_empty = material.states.search_empty;
                            that.favorite_map = material.favorite_map;
                            let data_list = that.picview_data_list.concat(data.dataList);
                            if (typeof fn === 'function') fn(data_list.length);
                            // 更新节点信息
                            conf = that.current_open_modal().base_conf;
                            // 计算列表自适应布局
                            that.picview_data_list = material.method.material_adapt(data_list, {
                                el: conf.el,
                                width: conf.width,
                                height: conf.height,
                                offset: 10,
                            });
                            that.$nextTick(that.re_adapt)
                            that.loading = false;
                            // 分页信息
                            let pagination = {
                                params: $params,
                                pageNumber: data.pageNumber,
                                pageSize: data.pageSize,
                                totalPages: data.totalPages,
                            };
                            that.material_pagination = pagination;
                            // 绑定滚动加载方法
                            material.method.common_scroll_load(that.current_open_modal(), pagination, (pagedata) => {
                                that.show_to_top = material.states.show_to_top;
                                // 加载下一页
                                that.picview_get_data({
                                    'cid': $params['cid'],
                                    'pageNumber': pagedata.pageNumber,
                                    'pageSize': pagedata.pageSize,
                                });
                            }, (limit) => {
                                that.visible_area_min = limit.min;
                                that.visible_area_max = limit.max;
                            });
                        },
                        error: () => {
                            that.loaderror = true;
                            that.$toast('数据获取失败');
                            if ($params['pageNumber'] === 1) {
                                that.picview_data_list = [];
                            }
                        },
                    });
                });
            },

            /** ----------------- 设计类 design -------------------*/
            // 初始化设计作品显示
            design_init_show (category_data) {
                let that = this;
                that.template_menu_list = category_data.childrenList;
                that.template_menu_checked(that.template_menu_list[0].id);
            },
            // 获取设计作品列表
            design_get_data (param) {
                let that = this;
                that.$nextTick(() => {
                    let conf = that.current_open_modal().base_conf;
                    // 计算 pageSize
                    let page_size = material.method.compute_page_size({
                        el: conf.el,
                        width: conf.width,
                        height: conf.height,
                    });
                    // 合并接口参数
                    let $params = {
                        'cid': null,
                        'pageNumber': 1,
                        'pageSize': page_size,
                        'type': 'design',
                    };
                    $params = Object.assign($params, param);
                    that.search_empty = false;
                    that.loaderror = false;
                    that.loading = true;
                    material.api.common_get_material({
                        url: '/api/template/list/',
                        current_modal: that.current_open_modal(),
                        params: $params,
                        beforeSend: () => {
                            // 更新节点信息
                            conf = that.current_open_modal().base_conf;
                            // 页码 = 1 时，重新从第一页获取，则清除之前的列表
                            if ($params['pageNumber'] === 1) {
                                that.template_data_list = [];
                                $(conf.el).scrollTop(0);
                            }
                        },
                        success: (data) => {
                            that.search_empty = material.states.search_empty;
                            that.favorite_map = material.favorite_map;
                            that.loading = false;
                            // 解析 attr 设置 imageWidth imageHeight
                            let format_list = data.dataList.map((item) => {
                                let attr = {};
                                try {
                                    attr = JSON.parse(item.attr);
                                } catch (error) {
                                    attr = {
                                        'width': 200,
                                        'height': 200,
                                    };
                                }
                                item['imageWidth'] = attr.width;
                                item['imageHeight'] = attr.height;
                                return item;
                            });
                            let data_list = that.template_data_list.concat(format_list);
                            if (that.search_empty) {
                                // 更新节点信息
                                conf = that.current_open_modal().base_conf;
                                that.template_data_list = that.material_adapt(data.recommendList, {
                                    el: conf.el,
                                    width: conf.width,
                                    height: conf.height,
                                    offset: 10,
                                });
                            } else {
                                // 计算列表自适应布局
                                that.template_data_list = material.method.material_adapt(data_list, {
                                    el: conf.el,
                                    type: conf.type,
                                    width: conf.width,
                                    height: conf.height,
                                    offset: 10,
                                });
                                // 分页信息
                                let pagination = {
                                    pageNumber: data.pageNumber,
                                    pageSize: data.pageSize,
                                    totalPages: data.totalPages,
                                };
                                // 绑定滚动加载方法
                                material.method.common_scroll_load(that.current_open_modal(),pagination, (pagedata) => {
                                    // 加载下一页
                                    that.design_get_data({
                                        'cid': param['cid'],
                                        'pageNumber': pagedata.pageNumber,
                                        'pageSize': pagedata.pageSize,
                                    });
                                    that.show_to_top = material.states.show_to_top;
                                }, (limit) => {
                                    that.visible_area_min = limit.min;
                                    that.visible_area_max = limit.max;
                                });
                            }
                        },
                        error: () => {
                            that.$toast('数据获取失败');
                            that.loading = false;
                            if ($params['pageNumber'] === 1) {
                                that.loaderror = true;
                                that.template_data_list = [];
                            }
                        },
                    });
                });
            },
            // 设计作品 二级分类整理
            design_get_tag_data (id) {
                let that = this;
                let menu_list = that.template_menu_list;
                that.template_tags_list = [];
                for (let i = 0; i < menu_list.length; i++) {
                    if (menu_list[i].id === id) {
                        that.template_tags_list = menu_list[i].childrenList;
                        break;
                    }
                }
            },
            // 设计作品二级分类点击，标签选择的操作方式
            design_tag_checked (id) {
                let that = this;
                that.template_current_tags = that.template_current_tags === id ? null : id;
                // 在二级分类下，非一级目录时选中的菜单为当前上一级
                if (!that.template_current_menu_is_onelevel) {
                    that.template_menu_need_checked_id = that.template_menu_referrer;
                }
                if (that.template_current_tags === null && that.template_current_menu) {
                    that.design_get_data({
                        'cid': that.template_current_menu,
                    });
                } else {
                    that.design_get_data({
                        'cid': id,
                    });
                }
            },

            // 全套模板单页插入
            template_group_append(item){
                let that = this;
                // 会员模板不能插入
                if (item.isVip && !that.user.memberVipExpire) {
                    that.$modal({templateType:'memberGrade'});
                    that.close_modal();
                    return;
                }
                this.MaterialLibrary.template_group_append(item);
            },
            // 模板素材插入
            template_material_append(item){
                this.MaterialLibrary.template_material_append(item);
            },
            // 图视素材插入
            picview_material_append(item){
                this.MaterialLibrary.picview_material_append(item);
            },

            /** ---------------- 案例库 -------------------------*/
            // 案例库打开初始化
            cases_open_init (callback) {
                let that = this;
                that.home_data_list = [];
                that.current_selected = 'case';
                // 网络错误情况下、空列表状态情况下、数据列表0情况下，重新加载
                if (that.loaderror || that.case_category_list.length === 0) {
                    that.cases_get_category();
                } else {
                    that.re_adapt();
                }
                if (typeof callback === 'function') callback();
            },
            // 获取一级分类
            cases_get_category() {
                let that = this;
                that.loading = true;
                let $params = {
                    id: that.CASES_ID,
                    grade: '2',
                }
                material.api.commmon_get_category_by_id($params, (data) => {
                    data = data && data.length > 0 ? data[0].childrenList : [];
                    that.case_category_list = data;
                    if (!that.case_current_menu) {
                        that.case_menu_checked(that.case_category_list[0].id);
                    }
                    that.loading = false;
                });
            },
            // 切换一级分类
            case_menu_checked (menu_key){
                let that = this;
                that.case_template_list = [];
                that.case_current_second_menu = null;
                that.case_current_second_menu_name = null;
                that.case_current_menu = menu_key;
                if (that.$refs.template_contain_dom.querySelector('.scroll_container')) {
                    that.$refs.template_contain_dom.querySelector('.scroll_container').style.height = 'auto';
                }
            },
            // 切换二级分类
            case_template_checked (item) {
                let that = this;
                that.pre_current_second_menu = that.case_current_second_menu;
                that.case_current_second_menu = item.id;
                that.case_current_second_menu_name = item.name;
                that.case_template_list = []; //清空二级分类下的案例模板列表数据
                that.get_case_template_list({id:item.id,pageNumber:1});
            },
            // 获取二级分类下的案例模板方法
            get_case_template_list (obj, fn){
                let that = this;
                that.$nextTick(()=>{
                    let conf = that.current_open_modal().base_conf;
                    // 计算 pageSize
                    let page_size = material.method.compute_page_size({
                        el: conf.el,
                        width: conf.width,
                        height: conf.height,
                    });
                    let $params = {
                        cid: that.case_current_second_menu,
                        pageNumber: 1,
                        pageSize: page_size,
                    };
                    $params = Object.assign($params, obj);
                    that.search_empty = false;
                    that.loaderror = false;
                    material.api.common_get_material({
                        params:{
                            cid: $params.cid,
                            pageNumber: $params.pageNumber,
                            pageSize: $params.pageSize,
                        },
                        current_modal: that.current_open_modal(),
                        success: (data)=>{
                            let data_list = that.case_template_list.concat(data.dataList);
                            if (typeof fn === 'function') fn(data_list.length);
                            that.case_template_list = material.method.material_adapt(data_list, {
                                el: conf.el,
                                width: conf.width,
                                height: conf.height,
                            });
                            that.favorite_map = material.favorite_map;
                            let pagination = {
                                params: $params,
                                pageNumber: data.pageNumber,
                                totalPages: data.totalPages
                            }
                            that.material_pagination = pagination;
                            material.method.common_scroll_load(that.current_open_modal(), pagination, (pagination) => {
                                that.get_case_template_list({
                                    cid: $params.cid,
                                    pageNumber: pagination.pageNumber,
                                })
                            }, (limit) => {
                                that.visible_area_min = limit.min;
                                that.visible_area_max = limit.max;
                            })
                        },
                        error: () => {
                            that.$toast('数据获取失败');
                        }
                    })
                    that.loaderror = material.states.loaderror;
                    that.search_empty = material.states.search_empty;
                })
            },
            // 鼠标移入案例弹框的模板弹框中时移除案例弹框的滚动事件
            hover_case_template_list (type){
                if(type){
                    $(".case_contain_right").css({"overflow-x":"none","overflow-y":"hidden"})
                }else{
                    $(".case_contain_right").css({"overflow-x":"hidden","overflow-y":"auto"})
                }
            },
            // 图片放大预览
            images_enlarge($event, item) {
                material.method.images_enlarge($event, item);
            },
            // 关闭放大预览
            images_enlarge_restore () {
                material.method.images_enlarge_restore();
            },

            /** ---------------- 我的收藏 -------------------------*/
            // 我的收藏弹框打开初始化
            collect_open_init (callback) {
                let that = this;
                let category_id;
                that.home_data_list = [];
                that.current_selected = 'collection';
                // 区分设计实验室和幻灯片
                if (that.EditView.document_info.documentType === 'design') {
                    category_id = 'design';
                } else {
                    category_id = that.TEMPLATE_ID;
                }
                // 获取模板分类列表和图视分类列表
                material.api.commmon_get_category(category_id, (data) => {
                    that.loaderror = material.states.loaderror;
                    // 网络错误情况下、空列表状态情况下、数据列表0情况下，重新加载
                    if (that.loaderror || that.search_empty || that.collection_data_list.length === 0) {
                        // 获取模板分类列表
                        if(that.template_menu_list.length === 0) that.template_get_category(data);
                        // 获取图视分类列表
                        if(that.picview_menu_list.length === 0) that.picview_get_category();
                        // 获取案例分类列表
                        if(that.case_menu_list.length === 0) that.collect_cases_get_category();
                        that.collection_menu_checked(that.collection_current_menu || 'template_collection')
                    } else {
                        that.re_adapt();
                    }
                });
                if (typeof callback === 'function') callback();
            },
            // 切换我的...内一级分类
            collection_menu_checked (menu_key) {
                let that = this;
                switch(menu_key){
                    // 收藏的设计
                    case 'template_collection':
                        if(that.collection_current_menu !== menu_key){
                            that.collection_second_menu_checked(that.template_menu_list[0].id);
                        }
                        break;
                    // 收藏的图示
                    case 'pic_collection':
                        if(that.collection_current_menu !== menu_key){
                            that.collection_second_menu_checked(that.picview_menu_list[0].id);
                        }
                        break;
                    // 收藏的案例
                    case 'cases_collection':
                        if(that.collection_current_menu !== menu_key){
                            that.collection_second_menu_checked(that.case_menu_list[0].id);
                        }
                        break;
                }
                that.collection_current_menu = menu_key;
            },
            // 切换二级分类
            collection_second_menu_checked (menu_key) {
                let that = this;
                that.collection_current_second_menu = menu_key;
                // 清空数据列表，重置状态
                that.collection_show_back_menu = false;
                that.collection_data_list = [];
                that.images_get_mydata();
            },
            // 根据collection_current_menu获取数据
            images_get_mydata (param) {
                let that = this,
                    id = that.collection_current_second_menu;
                that.$nextTick(() => {
                    // 计算 pageSize
                    let conf = that.current_open_modal().base_conf;
                    let page_size = material.method.compute_page_size({
                        el: conf.el,
                        width: conf.width,
                        height: conf.height,
                        type: conf.type
                    });
                    // 合并接口参数
                    let api_url = '';
                    let $params = {
                        'pageNumber': 1,
                        'pageSize': page_size,
                    };
                    switch (that.collection_current_menu) {
                        // 收藏的设计
                        case 'template_collection':
                            api_url = '/api/member/favorite/list/';
                            $params['cid'] = id;
                            break;
                        // 收藏的设计
                        case 'pic_collection':
                            api_url = '/api/member/favorite/list/';
                            $params['cid'] = id;
                            break;
                        // 收藏的案例
                        case 'cases_collection':
                            api_url = '/api/member/favorite/list/';
                            $params['cid'] = id;
                            break;
                    }
                    if (!api_url) return false;
                    $params = Object.assign($params, param);
                    let is_design = that.template_menu_list.some(item => {
                        if(item.id === id) return true;
                    })
                    // 如果点击的是全套模板分类 || 点击的是设计实验室下的模板分类
                    if(id === that.TEMPLATE_SUIT_ID || (that.EditView.document_info.documentType === 'design' && is_design)){
                        // 获取数据列表
                        that.common_get_my_template({
                            url:'/api/member/my_collect',
                            current_modal: that.current_open_modal(),
                            params: {
                                params: 'template',
                                type: that.EditView.document_info.documentType === 'design' ? 'design' : 'slides',
                                cid: that.EditView.document_info.documentType === 'design' ? id : '',
                            },
                            beforeSend: () => {
                                that.search_empty = false;
                                that.loading = true;
                                that.loaderror = false;
                                // 更新节点信息
                                conf = that.current_open_modal().base_conf;
                                // 清空之前的列表
                                that.collection_data_list = [];
                            },
                            success: (data) => {
                                that.favorite_map = material.favorite_map;
                                that.search_empty = material.states.search_empty;
                                that.loading = false;
                                // 解析 attr 设置 imageWidth imageHeight
                                let format_list = data.map((item) => {
                                    let attr = {};
                                    try {
                                        attr = JSON.parse(item.attr);
                                    } catch (error) {
                                        attr = {
                                            'width': 200,
                                            'height': 200,
                                        };
                                    }
                                    item['imageWidth'] = attr.width;
                                    item['imageHeight'] = attr.height;
                                    return item;
                                });
                                let data_list = that.collection_data_list.concat(format_list);
                                // 更新节点信息
                                conf = that.current_open_modal().base_conf;
                                // 计算列表自适应布局
                                that.collection_data_list = material.method.material_adapt(data_list, {
                                    el: conf.el,
                                    type: conf.type,
                                    width: conf.width,
                                    height: conf.height,
                                });
                                if(data.favorite_map){
                                    that.favorite_map = material.favorite_map;
                                }
                                if(data_list.length === 0){
                                    that.search_empty = true;
                                }
                                // 将列表id存进收藏列表
                                for(let i = 0 ; i < that.collection_data_list.length ; i++){
                                    that.favorite_map[that.collection_data_list[i].documentId] = that.collection_data_list[i].id;
                                }
                            },
                        })
                    }else{
                        material.api.common_get_material({
                            url: api_url,
                            params: $params,
                            current_modal: that.current_open_modal(),
                            beforeSend: () => {
                                that.search_empty = false;
                                that.loading = true;
                                that.loaderror = false;
                                // 更新节点信息
                                conf = that.current_open_modal().base_conf;
                                // 页码 = 1 时，重新从第一页获取，则清除之前的列表
                                if ($params['pageNumber'] === 1) {
                                    that.collection_data_list = [];
                                    $(conf.el).scrollTop(0);
                                }
                            },
                            success: (data) => {
                                that.favorite_map = material.favorite_map;
                                that.search_empty = material.states.search_empty;
                                that.loading = false;
                                // 数据处理
                                data.dataList.forEach((item) => {
                                    if(!item['largeImage']) item['largeImage'] = item['image'];
                                });
                                let data_list = that.collection_data_list.concat(data.dataList);
                                if (that.search_empty) return false;
                                // 更新节点信息
                                conf = that.current_open_modal().base_conf;
                                // 计算列表自适应布局
                                that.collection_data_list = material.method.material_adapt(data_list, {
                                    el: conf.el,
                                    width: conf.width,
                                    height: conf.height,
                                    type: conf.type,
                                    offset: 10,
                                });
                                if(data.favorite_map){
                                    that.favorite_map = material.favorite_map;
                                }
                                if(data_list.length === 0){
                                    that.search_empty = true;
                                }
                                // 分页信息
                                let pagination = {
                                    pageNumber: data.pageNumber,
                                    pageSize: data.pageSize,
                                    totalPages: data.totalPages,
                                };
                                // 绑定滚动加载方法
                                material.method.common_scroll_load(that.current_open_modal(), pagination, (pagedata) => {
                                    // 加载下一页
                                    that.images_get_mydata({
                                        'pageNumber': pagedata.pageNumber,
                                        'pageSize': pagedata.pageSize,
                                    });
                                }, (limit) => {
                                    that.visible_area_min = limit.min;
                                    that.visible_area_max = limit.max;
                                });
                            },
                            error: () => {
                                that.loaderror = true;
                                that.$toast('数据获取失败');
                                if ($params['pageNumber'] === 1) {
                                    that.collection_data_list = [];
                                }
                            },
                        });
                    }
                });
            },
            // 获取模板分类列表
            template_get_category(category_data) {
                let that = this;
                // 区分设计实验室和幻灯片
                that.template_menu_list = category_data.childrenList;
                // 添加全套分类
                if(that.EditView.document_info.documentType !== 'design') that.template_push_group();
            },
            // 获取案例分类列表
            collect_cases_get_category() {
                let that = this;
                let $params = {
                    id: that.CASES_ID,
                    grade: '2',
                }
                material.api.commmon_get_category_by_id($params, (data) => {
                    data = data && data.length > 0 ? data[0].childrenList : [];
                    that.case_menu_list = data;
                });
            },
            // 获取我收藏的全套模板列表
            common_get_my_template(obj) {
                material.api.common_get_my_template(obj);
            },
            // 我收藏的全套模板 取消收藏删除dom 
            collection_template_favorite (id) {
                let that = this;
                if (!id) return false;
                material.api.common_template_favorite(id, (state) => {
                    if (state === 'delete') {
                        // 删除对应数据，更新视图
                        let index = that.collection_data_list.findIndex(item => item.documentId === id);
                        if (index >= 0) {
                            that.collection_data_list.splice(index, 1);
                        }
                        that.re_adapt();
                    }
                });
            },
            // 获取全套模板下的模板列表
            check_template_detail (id) {
                let that = this;
                if(!id) return false;
                that.collection_show_back_menu = true;
                // 获取该套模板全部页面
                that.$nextTick(() => {
                    let conf;
                    material.api.common_get_material({
                        url: `/api/template/detail/${id}/`,
                        current_modal: that.current_open_modal(),
                        beforeSend: () => {
                            that.search_empty = false;
                            that.loaderror = false;
                            that.loading = true;
                            // 更新节点信息
                            conf = that.current_open_modal().base_conf;
                            // 清除之前的数据，重置滚动条
                            that.collection_data_list = [];
                            $(conf.el).scrollTop(0);
                        },
                        success: (data) => {
                            this.template_group_data = data;
                            that.search_empty = material.states.search_empty;
                            that.loading = false;
                            // svgModal 渲染需要的数据
                            let doc = that.$common.document_dataparse(data.document);
                            let doc_pages = that.$common.document_pages_dataparse(data.documentPages);
                            let data_list = doc_pages.map((item) => {
                                let item_info = Object.assign({}, item);
                                item['page_info'] = item_info;
                                item['svg_width'] = doc.width;
                                item['svg_height'] = doc.height;
                                item['document'] = doc;
                                item['isVip'] = data.isVip;
                                return item;
                            });
                            data_list = that.collection_data_list.concat(data_list);
                            // 更新节点信息
                            conf = that.current_open_modal().base_conf;
                            // 计算列表自适应布局
                            that.collection_data_list = material.method.material_adapt(data_list, {
                                el: conf.el,
                                width: conf.width,
                                height: conf.height,
                                type: conf.type
                            });
                            material.method.common_scroll_load(that.current_open_modal(), undefined, false, (limit) => {
                                that.visible_area_min = limit.min;
                                that.visible_area_max = limit.max;
                            });
                        },
                        error: () => {
                            that.loaderror = true;
                            that.$toast('数据获取失败')
                        }
                    });
                });
            },
            // 图片静转动
            static2dynamic (event, item) {
                material.method.static2dynamic(event, item);
            },
            // 图片动转静
            dynamic2static (event, item) {
                material.method.dynamic2static(event, item);
            },
            // 图片加载完毕
            img_load_done (event) {
                // 图片库png图片加载完毕后清除背景图，防止背景图溢出
                if (event.target.getAttribute('lazy') === 'loaded') {
                    $(event.target).parents('li').css('background','#ffffff');
                }
            },
            // 插入我的...素材或模板
            collection_material_append (item){
                let that = this;
                switch(that.collection_current_menu){
                    case 'cases_collection':
                        that.template_material_append(item);
                        break;
                    default:
                        if (that.picview_menu_id_list.indexOf(that.collection_current_second_menu) >= 0){
                            that.picview_material_append(item);
                        } else {
                            if (that.collection_current_menu === "template_collection" && that.EditView.document_info.documentType === 'design') {
                                let newItem = Object.assign({}, item);
                                newItem.id = item.templateId;
                                newItem.type = item.templateType;
                                that.template_material_append(newItem);
                            } else {
                                that.template_material_append(item);
                            }
                        }
                        break;
                }
            },
            // 我的收藏的素材 取消收藏删除dom
            image_material_favorite (id) {
                let that = this;
                if (!id) return false;
                material.api.common_material_favorite(id, (state) => {
                    if (state === 'delete') {
                        // 删除对应数据，更新视图
                        let index = that.collection_data_list.findIndex(item => item.id === id);
                        if (index >= 0) {
                            that.collection_data_list.splice(index, 1);
                            that.search_empty = that.collection_data_list.length === 0;
                        }
                        that.re_adapt();
                    }
                });
            },
        },
    }
</script>

<style lang="less" scoped>
.material-template {
    width: calc(5 / 12 * 100vw);
    height: calc(55 / 192 * 100vw);
    min-width: 800px;
    min-height: 550px;
    background: #ffffff;
    border: 1px solid #eeeeee;
    border-radius: 11px;
    box-shadow: 0px 2px 50px 0px rgba(180, 187, 199, 0.4);
    &.home {
        overflow: hidden;
    }
    .template-top {
        width: 100%;
        height: 50px;
        border-bottom: 1px solid #eee;
        position: relative;
        .back,
        .filter_btn {
            position: absolute;
            top: 50%;
            transform: translateY(-50%);
            cursor: pointer;
            div{
                display: inline-block;
            }
        }
        .back {
            left: 22px;
            .icon {
                margin-right: 10px;
                transform: translateY(1px);
            }
        }
        .filter_btn {
            right: 27px;
            width: 68px;
            height: 32px;
            line-height: 32px;
            border-radius: 5px;
            text-align: center;
            user-select: none;
            .icon {
                margin-right: 9px;
                transform: translateY(2px);
            }
            &:hover,&.checked {
                background: #fafafa;
            }
        }
        .filter_frame {
            position: absolute;
            top: 0;
            right: -340px;
            width: 330px;
            border: 1px solid #eeeeee;
            border-radius: 6px;
            box-shadow: 0px 2px 20px 0px rgba(180,187,199,0.20);
            padding: 20px 28px 10px;
            background-color: #fff;
            font-size: 12px;
            user-select: none;
            z-index: 1;
            .icon {
                position: absolute;
                top: 13px;
                right: 13px;
                font-size: 15px;
                cursor: pointer;
            }
            .filter_content {
                &:nth-of-type(n+1) {
                    margin-top: 10px;
                }
                .group_btn {
                    width: 100%;
                    display: flex;
                    flex-wrap: wrap;
                    margin-top: 14px;
                    .btn {
                        display: block;
                        color: #666666;
                        min-width: calc((100% - 30px) / 4);
                        height: 24px;
                        background: #f4f4f4;
                        border-radius: 14px;
                        margin-right: 10px;
                        text-align: center;
                        line-height: 24px;
                        margin-bottom: 10px;
                        padding: 0 5px;
                        &.checked {
                            border: 1px solid #005bff;
                            border-radius: 15px;
                            background: rgba(0,91,255,0.10);
                            line-height: 22px;
                        }
                    }
                }
            }
        }
        .collect-category {
            width: 100%;
            height: 100%;
            display: flex;
            color: #666;
            font-size: 12px;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            & > li {
                padding: 0 15px;
                &:not(.checked):hover {
                    color: #111111;
                }
            }
            .checked {
                color: #005bff;
            }
        }
    }
    .template-main {
        display: flex;
        width: 100%;
        height: calc(100% - 50px);
        &.home {
            height: 100%;
        }
        .template-left {
            width: 194px;
            height: 100%;
            border-right: 1px solid #eeeeee;
            overflow: auto;

            .template-group,
            .collect-group {
                padding-top: 20px;
                width: 100%;
                .title {
                    margin-left: 20px;
                    font-size: 12px;
                    font-weight: 300;
                    color: #aaaaaa;
                }
                ul {
                    padding-top: 5px;
                    width: 100%;
                    li {
                        margin: 1px auto;
                        display: flex;
                        align-items: center;
                        width: 176px;
                        height: 38px;
                        border-radius: 5px;
                        cursor: pointer;

                        &:hover{
                            background: #fafafa;
                        }

                        &.current,
                        &.checked {
                            background: var(--mainColor);
                            span {
                                color: #ffffff;
                            }
                            > .base-icon {
                                color: #ffffff;
                            }
                            .icon {
                                background-color: #337BFF;
                            }
                        }

                        .icon {
                            margin: 0 10px;
                            width: 24px;
                            height: 24px;
                            line-height: 24px;
                            text-align: center;
                            border-radius: 5px;
                            color: #ffffff;
                            > .base-icon {
                                font-size: 12px;
                            }
                        }

                        span {
                            font-size: 12px;
                            font-weight: 400;
                            color: #111111;
                        }

                        > .base-icon {
                            margin-left: auto;
                            margin-right: 10px;
                            font-size: 12px;
                            color: #999999;
                        }
                    }
                }
            }

            .template-group .icon {
                background: #0067ff;
            }
            .collect-group .icon {
                background: #0699ff;
            }
        }
        .template-right {
            flex: 1;
            .search_empty {
                overflow: hidden;
                .scroll_window {
                    padding: 0;
                    height: calc(100% - 222px);
                }
            }
            .material_empty {
                .empty_contain {
                    font-size: 16px;
                    img {
                        transform: scale(0.8);
                    }
                }
            }
            .scroll_window {
                padding: 30px 15px 0 15px;
                .scroll_container {
                    & > li img{
                        width: 100%;
                    }
                    & > li:hover .look_btn {
                        opacity: 1;
                    }
                    & > li:hover{
                        display: inline-block;
                        .favorite-btn {
                            visibility: visible;
                        }
                    }
                    & > li.lock{
                        .vip_icon{
                            display: block;
                        }
                        &:hover {
                            .vip_icon{
                                display: none;
                            }
                        }
                        .lock-ico{
                            display: none;
                            position: absolute;
                            top: 4px;
                            left: 4px;
                            width: 20px;
                            height: 20px;
                            background-color: rgba(0, 0, 0, 0.5);
                            border-radius: 5px;
                            padding: 3px;
                            img{
                                background-color: transparent;
                            }
                            
                        }
                        &:hover .lock-ico{
                            display: inline-block;
                        }
                    }
                    .look_btn {
                        position: absolute;
                        top: 0;
                        left: 0;
                        bottom: 0;
                        right: 0;
                        background-color: rgba(0,0,0,.6);
                        opacity: 0;
                        transition: all 0.3s;
                        & > button {
                            position: absolute;
                            top: 0;
                            left: 0;
                            bottom: 0;
                            right: 0;
                            margin: auto;
                            width: 80px;
                            height: 28px;
                            line-height: 28px;
                            font-size: 12px;
                            text-align: center;
                            border-radius: 5px;
                            color: #fff;
                            background-color: var(--mainColor);
                        }
                    }
                    .edit-ico {
                        transform: scale(calc(2/3));
                    }
                    .vip_icon {
                        position: absolute;
                        top: 4px;
                        left: 4px;
                        z-index: 1;
                        display:none;
                        width: 26px;
                        height: 25px;
                        border-radius: 4px;
                        overflow: hidden;
                        background: #f7b500 url(../../../../assets/pc/images/common/vip.png) no-repeat center center;
                        background-size: 77%;
                        transform: scale(0.85);
                    }
                    .template_card {
                        position: absolute;     
                        display: inline-block;
                        border-radius: 4px;
                        border: 1px solid #f2f2f2;
                        &:hover .look_btn{
                            opacity: 1;
                            * {
                                opacity: 1;
                            }
                        }
                        &:hover{
                            border-color: var(--mainColor);
                            .lock-ico{
                                display: inline-block;
                            }
                        }
                        & > img{
                            display: inline-block;
                            border-radius: 4px;
                            width: 100%;
                            height: 100%;
                        }
                        .look_btn {
                            position: absolute;
                            top: 0;
                            left: 0;
                            bottom: 0;
                            right: 0;
                            background-color: transparent;
                            opacity: 0;
                            transition: all 0.3s;
                            cursor:pointer;
                            .lock-ico{
                                display: none;
                                position: absolute;
                                top: 4px;
                                left: 4px;
                                width: 20px;
                                height: 20px;
                                background-color: rgba(0, 0, 0, 0.5);
                                border-radius: 5px;
                                padding: 3px;
                                img{
                                    background-color: transparent;
                                }
                            }
                            .edit-ico{
                                position: absolute;
                                opacity: 1;
                                right: 0px;
                                top: 0px;
                                border-radius: 5px;
                                &.edit-ico-enlarge{
                                    top: 28px;
                                }
                            }
                        }
                    }
                    .template_card.lock {
                        &:hover .lock-ico{
                            display: inline-block;
                        }
                        .look_btn {
                            & > button {
                                i{
                                    width: 14px;
                                    height: 14px;
                                    margin-left: 10px;
                                    vertical-align: middle;
                                    display: inline-block;
                                    background: url(../../../../assets/pc/images/common/lock_white.png) no-repeat;
                                    background-size: cover;
                                }
                            }
                            .favorite-btn {
                                visibility: hidden;
                            }
                            .preview-btn {
                                top: 4px;
                            }
                        }
                    }
                    .case_title {
                        position: absolute;
                        top: -28px;
                        left: 0;
                        display: flex;
                        cursor: pointer;
                        color: #666666;
                        .icon {
                            margin-right: 4px;
                        }
                    }
                    &.case {
                        margin-top: 14px;
                    }
                    .is-group {
                        top: 4px;
                    }
                }
                .suit_list > li {
                    overflow: hidden;
                }
                .collect_empty{
                    position: absolute;
                    top: 0;
                    bottom: 0;
                    left: 0;
                    right: 0;
                    width: 214px;
                    height: 218px;
                    margin: auto;
                    text-align: center;
                    img{
                        display: inline-block;
                        width: 100%;
                        height:100%;
                        transform: scale(0.8);
                    }
                    p{
                        font-size: 16px;
                        text-align: center;
                    }
                }
                .home_page {
                    .scroll_container {
                        margin-bottom: 30px;
                        &.home_list {
                            position: static;
                            display: flex;
                            flex-wrap: wrap;
                            justify-content: space-between;
                            .header {
                                flex-basis: 100%;
                                display: flex;
                                align-items: center;
                                justify-content: space-between;
                                margin-bottom: 10px;
                                .name {
                                    color: #666666;
                                }
                                .more {
                                    color: #999999;
                                    cursor: pointer;
                                }
                            }
                            > li {
                                position: static;
                                margin-right: 10px;
                                &:last-of-type {
                                    margin-right: 0;
                                }
                            }
                        }
                        .edit-ico {
                            transform: scale(calc(2/3));
                        }
                    }
                }
                .case_container {
                    .cases_list{
                        position: relative;
                        border-radius: 10px;
                        &:last-of-type {
                            margin-bottom: 0;
                        }
                        .case_child_contain{
                            display: flex;
                            flex-wrap: wrap;
                            .cases_child_list{
                                width: 177px;
                                height: 100px;
                                display: inline-block;
                                align-self: flex-start;
                                flex: 1 1 auto;
                                margin-bottom: 10px;
                                margin-right: 10px;
                                .child_info{
                                    position: relative;
                                    height: 100%;
                                    width: 100%;
                                    border-radius: 4px;
                                    border: 1px solid #e8eaeb;
                                    background: #fafafa;
                                    vertical-align: top;
                                    z-index: 1;
                                    cursor: pointer;
                                    i{
                                        position: absolute;
                                        bottom: -20px;
                                        left: 100px;
                                        width: 0;
                                        height: 0;
                                        border-left: 8px solid transparent;
                                        border-right: 8px solid transparent;
                                        border-bottom: 8px solid #fff;
                                    }
                                    .child_image{
                                        position: absolute;
                                        top: 0;
                                        right: 0;
                                        left: 0;
                                        bottom: 0;
                                        width: 60px;
                                        height: 60px;
                                        margin: 15px auto 0;
                                        img{
                                            display: inline-block;
                                            position: absolute;
                                            top: 0;
                                            bottom: 0;
                                            left: 0;
                                            right: 0;
                                            max-width: 100%;
                                            max-height: 100%;
                                            margin: auto;
                                            transform: scale(.85);
                                        }
                                    }
                                    .child_title{
                                        display: inline-block;
                                        position: absolute;
                                        bottom: 0;
                                        width: 100%;
                                        text-align: center;
                                        font-size: 12px;
                                        color: #33373c;
                                        font-weight: 700;
                                        line-height: 35px;
                                    }
                                    &:hover{
                                        box-shadow: 0px 6px 5px 0px rgba(0, 0, 0, 0.05);
                                        transform: scale(1.04);
                                        transition: all .3s;
                                        .child_title{
                                            color: var(--mainColor);
                                        }
                                    }
                                }
                            }
                        }
                    }
                    .hide {
                        display: none;
                    }
                }
                .case_empty{
                    position: absolute;
                    top: 0;
                    bottom: 0;
                    left: 0;
                    right: 0;
                    width: 214px;
                    height: 218px;
                    margin: auto;
                    text-align: center;
                    img{
                        display: inline-block;
                        width: 100%;
                        height: 100%;   
                        transform: scale(0.8);
                    }
                    p{
                        font-size: 16px;
                        text-align: center;
                    }
                }
                .no_more {
                    .edit-ico {
                        transform: scale(0.8);
                    }
                    p {
                        font-size: 12px;
                        line-height: 20px;
                    }
                }
            }
            >.scroll_window >.scroll_container.case {
                .favorite-btn{
                    visibility: visible;
                }
            }
            >.scroll_window >ul >li,.home_page >ul >li{
                &:hover .preview-icon{
                    visibility: visible;
                }
                .preview-icon{
                    visibility: hidden;
                    position: absolute;
                    top: 28px;
                    right: 4px;
                    display: flex;
                    width: 20px;
                    height: 20px;
                    background: rgba(0, 0, 0, .5);
                    border-radius: 5px;
                    &:hover{
                        background: rgba(0, 0, 0, .8);
                    }
                    .base-icon{
                        margin: auto;
                        color: #ffffff;
                    }
                }
            }
            .favorite-btn{
                visibility: hidden;
                 &.has-collect {
                    color: #f7b500;
                }
            }
        }
    }
    @media screen and ( max-width: 1280px ){
        .template-top{
            .filter_frame {
                right: -210px;
                width: 200px;
                .filter_content {
                    .group_btn {
                        .btn {
                            min-width: calc((100% - 30px) / 2);
                            &:nth-of-type(2n) {
                                margin-right: 0;
                            }
                        }
                    }
                }
            }
        }
    }
    @media screen and ( min-width : 1281px ) and ( max-width: 1450px ){
        .template-top{
            .filter_frame {
                right: -265px;
                width: 255px;
                .filter_content {
                    .group_btn {
                        .btn {
                            min-width: calc((100% - 30px) / 3);
                            &:nth-of-type(3n) {
                                margin-right: 0;
                            }
                        }
                    }
                }
            }
        }
    }
    @media screen and ( min-width : 1451px ){
        .template-top{
            .filter_content {
                .group_btn {
                    .btn {
                        &:nth-of-type(4n) {
                            margin-right: 0;
                        }
                    }
                }
            }
        }
    }
}
</style>