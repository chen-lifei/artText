<template>
    <div class="format_panel_contain"
        :class="{'mask': edit_mode === 'custom' && element_type === ''}"
        @click.stop
    >
        <!-- 格式面板 -->
        <div class="format-contain" v-if="show_format_panel && element_type" @click="hide_all_list()">
            <div class="format-header">
                <span>{{format_title}}</span>
                <button class="close" @click="toggleFormatPanel()">
                    <base-icon class="iconguanbi1" size="14"></base-icon>
                </button>
            </div>
            <div class="format-main" v-if="!show_clip_ratio">
                <!-- 组合 -->
                <div class="bind-module" v-if="element_type === 'group'">
                    <div class="header-btn">
                        <span>组合</span>
                        <div class="btn-group">
                            <button class="unbind" :class="{current: !is_group}" @click="is_group && set_ele_group()" v-tooltip="`拆分`">
                                <base-icon class="iconjiekaizuhe"></base-icon>
                            </button>
                            <button class="bind" :class="{current: is_group}" @click="!is_group && set_ele_group()" v-tooltip="`组合`" >
                                <base-icon class="iconzuhe"></base-icon>
                            </button>
                        </div>
                        
                    </div>
                </div>
                <!-- 位置大小 -->
                <div class="layout-module" v-if="'layout' in formatTypeStatus">
                    <div class="header-btn" @click="toggleModule('layout')">
                        <span>位置大小</span>
                        <button class="arrow" :class="{current: formatTypeStatus.layout}">
                            <base-icon class="iconjiantou"></base-icon>
                        </button>
                    </div>
                    <div class="content" v-show="formatTypeStatus.layout">
                        <!-- 画布对齐 -->
                        <div class="ele-align">
                            <template v-for="(item, index) in group_align.format_list">
                                <div class="division" v-if="index === 6" :key="index">
                                    <base-icon class="iconfenge"></base-icon>
                                </div>
                                <div class="align-item" :key="item.name" v-tooltip="item.name"  @click="set_ele_align(item)">
                                    <base-icon :class="item.icon"></base-icon>
                                </div>
                            </template>
                        </div>

                        <!-- 位置 坐标 -->
                        <div class="position-group" v-if="element_message.not_position">
                            <!-- X轴位置 -->
                            <base-unit-input 
                                unit="X" 
                                maxlength="5"
                                :disabled="element_message.not_x"
                                v-model="element_message.x"
                                @focus="input_focus_save($event)"
                                @keydown="key_up_input($event,'x')"
                                @blur="set_ele_translate('x')"
                                @add="change_message($event, 'x','add')"
                                @cut="change_message($event, 'x','cut')"
                            ></base-unit-input>
                            <!-- Y轴位置 -->
                            <base-unit-input 
                                unit="Y" 
                                maxlength="5"
                                :disabled="element_message.not_y"
                                v-model="element_message.y"
                                @focus="input_focus_save($event)"
                                @keydown="key_up_input($event,'y')"
                                @blur="set_ele_translate('y')"
                                @add="change_message($event, 'y','add')"
                                @cut="change_message($event, 'y','cut')"
                            ></base-unit-input>
                        </div>

                        <!-- 尺寸 -->
                        <div class="size-group" v-if="!element_message.not_w">
                            <!-- 宽 -->
                            <base-unit-input 
                                unit="W" 
                                maxlength="4"
                                :disabled="element_message.not_w"
                                v-model="element_message.w"
                                @focus="input_focus_save($event)"
                                @keydown="key_up_input($event,'width')"
                                @blur="set_ele_size"
                                @add="change_message($event, 'width','add')"
                                @cut="change_message($event, 'width','cut')"
                            ></base-unit-input>
                            <!-- 高 -->
                            <base-unit-input 
                                unit="H" 
                                maxlength="4"
                                :disabled="element_message.not_h"
                                v-model="element_message.h"
                                @focus="input_focus_save($event)"
                                @keydown="key_up_input($event,'height')"
                                @blur="set_ele_size"
                                @add="change_message($event, 'height','add')"
                                @cut="change_message($event, 'height','cut')"
                            ></base-unit-input>
                        </div>

                        <!-- 旋转 -->
                        <div class="rotate-group" v-if="['line', 'table', 'chart'].indexOf(element_type) === -1 && !element_message.not_rotate">
                            <span>回转</span>
                            <base-knob :disabled="element_message.not_rotate" :max="360" v-model="element_message.rotate" @mouseup="set_ele_rotate()"></base-knob>
                            <base-unit-input 
                                unit="度" 
                                maxlength="3" 
                                :disabled="element_message.not_rotate"
                                v-model="element_message.rotate"
                                @focus="input_focus_save($event)"
                                @keydown="key_up_input($event,'rotate')"
                                @blur="set_ele_rotate()"
                                @add="change_message($event, 'rotate','add')"
                                @cut="change_message($event, 'rotate','cut')"
                            ></base-unit-input>
                        </div>

                        <!-- 翻转 -->
                        <div class="turn-group" v-if="['line', 'table', 'chart'].indexOf(element_type) === -1 && !element_message.not_rotate">
                            <span>翻转</span>
                            <div class="reversal-grouo">
                                <button class="reversal-btn" v-tooltip="`垂直镜像`" @click="set_ele_reversal('vertical')">
                                    <base-icon class="iconchuizhifanzhuan"></base-icon>
                                </button>
                                <button class="reversal-btn" v-tooltip="`水平镜像`" @click="set_ele_reversal('horizontal')">
                                    <base-icon class="iconshuipingfanzhuan"></base-icon>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
                <!-- 文本格式 -->
                <div class="style-module" v-if="'style' in formatTypeStatus">
                    <div class="header-btn" @click="toggleModule('style')">
                        <span>文本格式</span>
                        <button class="arrow" :class="{current: formatTypeStatus.style}">
                            <base-icon class="iconjiantou"></base-icon>
                        </button>
                    </div>
                    <div class="content" v-show="formatTypeStatus.style">
                        <!-- 字体 -->
                        <div class="font-family" :class="{ 'un-able': element_type === 'chart'}" @click.stop>
                            <div class="family-btn"  :class="{'current': pull_list_type === 'text_family'}" @click.stop="pull_module_toggle($event,'text_family',{append: true})">
                                <span>{{element_message.font_family}}</span>
                            </div>
                        </div>
                        <!-- 字号 -->
                        <div class="font-size">
                            <div class="size-btn" :class="{'current': pull_list_type === 'text_size'}" @click.stop="pull_module_toggle($event, 'text_size',{append:true})">
                                <input type="number" 
                                    maxlength="3" 
                                    title="字号"
                                    v-model="element_message.size"
                                    @focus="input_focus_save($event)"
                                    @input="check_input_number($event,'size')"
                                    @keydown.enter="key_up_input($event)"
                                    @blur="set_font_size()"
                                >
                            </div>
                        </div>
                        <!-- 字体样式列表 -->
                        <div class="font-style-list">
                            <!-- 字体颜色 -->
                            <div class="font-color">
                                 <button class="font-color-btn font-style-btn" :class="{current: pull_list_type === 'text'}" v-tooltip="`字体颜色`" @click.stop="pull_module_toggle($event,'text',{color: element_message.color})">
                                    <base-icon class="iconwenbenyanse"></base-icon>
                                    <i class="color-line" :style="{background:element_message.color}"></i>
                                </button>
                            </div>
                            <!-- 加粗 -->
                            <button class="text_bold_panel font-style-btn" :class="{current: element_message.font_weight === 'bold'}" v-tooltip="`粗体(Ctrl+B)`" @click="set_font_weight">
                                <base-icon class="iconzitiyangshi"></base-icon>
                            </button>
                            <!-- 斜体 -->
                            <button class="text_italic_panel font-style-btn" :class="{current: element_message.font_style === 'italic'}"  v-tooltip="`斜体(Ctrl+I)`" @click="set_font_italic">
                                <base-icon class="iconxieti1"></base-icon>
                            </button>
                            <!-- 下划线 -->
                            <button class="text_underline_panel font-style-btn" :class="{current: element_message.text_underline === 'underline', 'un-able': element_type === 'chart'}" v-tooltip="`下划线(Ctrl+U)`" @click="set_font_underline">
                                <base-icon class="iconxiahuaxian1"></base-icon>
                            </button>
                            <!-- 中划线 -->
                            <button class="text_through_panel font-style-btn" :class="{current: element_message.text_linethrough === 'linethrough', 'un-able': element_type === 'chart'}" v-tooltip="`中划线`" @click="set_font_linethrough">
                                <base-icon class="iconzhonghuaxian1"></base-icon>
                            </button>
                            <!-- 高亮 -->
                            <div class="text-background">
                                <button class="text_background_panel font-style-btn" :class="{current: pull_list_type === 'hilite', 'un-able': element_type === 'chart'}" v-tooltip="`高亮`" @click.stop="pull_module_toggle($event,'hilite',{color:element_message.hilite})">
                                    <base-icon class="icongaoliang1"></base-icon>
                                    <i class="color-line" :style="{background:element_message.hilite && element_message.hilite !== 'none' && element_message.hilite !== 'transparent' ? element_message.hilite : '#ffd800'}"></i>
                                </button>
                            </div>
                            <!-- 格式刷 -->
                            <button class="text-format font-style-btn" :class="{current: EditView.had_format_painter, 'un-able': element_type === 'chart'}" v-tooltip="EditView.had_format_painter ? '退出格式刷(Esc)' : '格式刷，双击可重复使用'" @click="set_format_painter(false)" @dblclick="set_format_painter(true)">
                                <base-icon class="icongeshishua1"></base-icon>
                            </button>
                        </div>
                    </div>
                </div>
                <!-- 文本调整 -->
                <div class="text-align-module" v-if="'textAlign' in formatTypeStatus">
                    <div class="header-btn" @click="toggleModule('textAlign')">
                        <span>文本调整</span>
                        <button class="arrow" :class="{current: formatTypeStatus.textAlign}">
                            <base-icon class="iconjiantou"></base-icon>
                        </button>
                    </div>
                    <div class="content" v-show="formatTypeStatus.textAlign">
                        <div class="text-align">
                            <div class="title">文本对齐</div>
                            <div class="btn-group">
                                <div class="btn" :class="{current: element_message.text_align === 'left'}" @click="set_font_align('left')">
                                    <base-icon class="iconwenbenzuoduiqi1"></base-icon>
                                </div>
                                <div class="btn" :class="{current: element_message.text_align === 'right'}" @click="set_font_align('right')">
                                    <base-icon class="iconwenbenyouduiqi"></base-icon>
                                </div>
                                <div class="btn" :class="{current: element_message.text_align === 'center'}" @click="set_font_align('center')">
                                    <base-icon class="iconwenbenjuzhong"></base-icon>
                                </div>
                                <div class="btn" :class="{current: element_message.text_align === 'justify'}" @click="set_font_align('justify')">
                                    <base-icon class="iconwenbenliangduanduiqi"></base-icon>
                                </div>
                            </div>
                        </div>
                        <div class="text-list">
                            <span class="title">编号</span>
                            <div class="list-group">
                                <div class="ul-menu-btn" @click="text_list_panel_show = text_list_panel_show === 'ul' ? null : 'ul'">
                                    <base-icon class="iconwuxudayuandian"></base-icon>
                                    <div class="menu-list" v-show="text_list_panel_show === 'ul'">
                                        <span class="label">无序列表</span>
                                        <div class="item-list">
                                            <div class="item none" :class="{current: element_message.ul === 'none'}" @click="set_font_orderedList('insertUnorderedList', 'none')">无</div>
                                            <div class="item" v-tooltip="item.name" :class="{current: element_message.ul === item.data}" @click="set_font_orderedList('insertUnorderedList', item.data)" v-for="(item,index) in text_unordered_list" :key="index">
                                                <base-icon :class="item.icon"></base-icon>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div class="ol-menu-btn" @click="text_list_panel_show = text_list_panel_show === 'ol' ? null : 'ol'">
                                    <base-icon class="icon123"></base-icon>
                                    <div class="menu-list" v-show="text_list_panel_show === 'ol'">
                                        <span class="label">有序列表</span>
                                        <div class="item-list">
                                            <div class="item none" :class="{current: element_message.ol === 'none'}" @click="set_font_orderedList('insertOrderedList', 'none')">无</div>
                                            <div class="item" v-tooltip="item.name" :class="{current: element_message.ol === item.data}" @click="set_font_orderedList('insertOrderedList', item.data)" v-for="(item,index) in text_ordered_list" :key="index">
                                                <base-icon :class="item.icon"></base-icon>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="text-range">
                            <div class="letter-space">
                                <span>字间距</span>
                                <base-seek-bar :seekbar_obj="seekbar_obj['letter_space']" :btn-show="false" :value-show="false" ></base-seek-bar>
                                <base-unit-input
                                    v-model="element_message.letter_spacing" 
                                    @focus="input_focus_save($event)"
                                    @keydown="key_up_input($event,'letter_spacing')"
                                    @blur="set_font_spacing(+element_message.letter_spacing)"
                                    @add="set_font_spacing(+element_message.letter_spacing + 0.1)"
                                    @cut="set_font_spacing(+element_message.letter_spacing - 0.1)">
                                </base-unit-input>
                            </div>
                            <div class="line-height">
                                <span>行间距</span>
                                <base-seek-bar :seekbar_obj="seekbar_obj['line_height']" :btn-show="false" :value-show="false" ></base-seek-bar>
                                <base-unit-input
                                    v-model="element_message.line_height" 
                                    @focus="input_focus_save($event)"
                                    @input="check_input_number($event)"
                                    @keydown="key_up_input($event,'line_height')"
                                    @blur="set_font_lineHeight(+element_message.line_height)"
                                    @add="set_font_lineHeight(+element_message.line_height + 0.1)"
                                    @cut="set_font_lineHeight(+element_message.line_height - 0.1)">
                                </base-unit-input>
                            </div>
                        </div>
                         <!-- 艺术字相关设置 -->
                        <div class="art-text-module" v-if="element_message.text_type === 'art'">
                            <template v-if="!element_message.disable_setting">
                                <!-- 艺术字背景图尺寸 -->
                                <div class="art_setting_option size" v-if="element_message.bg_size">
                                    <span class="option_title">背景尺寸</span>
                                    <base-seek-bar :seekbar_obj="art_text_style['bg_size']" :btn-show="false" :value-show="false"></base-seek-bar>
                                </div>
                                <!-- 艺术字描边粗细 -->
                                <div class="art_setting_option stroke_width" v-if="element_message.text_has_stroke">
                                    <span class="option_title">描边粗细</span>
                                    <base-seek-bar :seekbar_obj="art_text_style['stroke_width']" :btn-show="false" :value-show="false"></base-seek-bar>
                                </div>
                                <!-- 艺术字填充颜色 -->
                                <div class="art_setting_option fill_color" v-if="art_text_style.text_fill_color">
                                    <span class="option_title">填充颜色</span>
                                    <div class="color_block">
                                        <div class="edit-ico" :style="{background: art_text_style.text_fill_color}" @click.stop="pull_module_toggle($event,'fill_color',{color:art_text_style.text_fill_color})"></div>
                                    </div>
                                </div>
                                <!-- 艺术字阴影颜色-->
                                <div class="art_setting_option text_shadow_color" 
                                    v-for="(item, index) in art_text_style.text_shadow_color"
                                    v-show="art_text_style.text_shadow_color.length > 0" 
                                    :key="index"
                                >
                                    <span class="option_title">阴影颜色{{index + 1}}</span>
                                    <div class="color_block">
                                        <div class="edit-ico" :style="{background: item}" @click.stop="pull_module_toggle($event,'text_shadow_color',{art_index:index, color:item})"></div>
                                    </div>
                                </div>
                                <!-- 艺术字描边颜色-->
                                <div class="art_setting_option fill_color" v-if="element_message.text_has_stroke">
                                    <span class="option_title">描边颜色</span>
                                    <div class="color_block">
                                        <div class="edit-ico" :style="{background: art_text_style.text_stroke_color}" @click.stop="pull_module_toggle($event,'stroke_color',{color: art_text_style.text_fill_color})"></div>
                                    </div>
                                </div>
                            </template>

                            <!-- 艺术字渐变色-->
                            <div class="art_setting_option" v-if="element_type === 'text' && element_message.gradient_before">
                                <span class="option_title">渐变颜色</span>
                                <div class="color-group">
                                    <div class="gradient_color" @click.stop="pull_module_toggle($event,'gradient_before',{color:element_message.gradient_before})">
                                        <i :class="{'edit-ico-transparent':element_message.gradient_before === 'transparent'}" :style="{background:element_message.gradient_before === 'transparent' ? '' : element_message.gradient_before}"></i>
                                    </div>
                                    <div class="gradient_color" @click.stop="pull_module_toggle($event,'gradient_after',{color:element_message.gradient_after})">
                                        <i :class="{'edit-ico-transparent':element_message.gradient_after === 'transparent'}" :style="{background:element_message.gradient_after === 'transparent' ? '' : element_message.gradient_after}"></i>
                                    </div>
                                </div>
                            </div>

                        </div>
                    </div>
                </div>
                <!-- 样式设置 -->
                <div class="appearance-module" v-if="'appearance' in formatTypeStatus">
                    <div class="header-btn" @click="toggleModule('appearance')">
                        <span>样式设置</span>
                        <button class="arrow" :class="{current: formatTypeStatus.appearance}">
                            <base-icon class="iconjiantou"></base-icon>
                        </button>
                    </div>
                    <div class="content" v-show="formatTypeStatus.appearance">
                        <!-- 圆角 -->
                        <div class="filleted-corner" v-if="element_type === 'shape' && element_message.rect_fillet">
                            <div class="rect-fillet-group">
                                <span>圆角</span>
                                <div class="border-all">
                                    <base-unit-input
                                        v-model="element_message.rect_fillet_max"
                                        @blur="set_rect_fillet()"
                                        @keydown.enter="set_rect_fillet()"
                                        @add="+element_message.rect_fillet_max++&&set_rect_fillet()"
                                        @cut="+element_message.rect_fillet_max--&&set_rect_fillet()"
                                    ></base-unit-input>
                                </div>
                            </div>
                            <div class="value-group">
                                <div class="rect-item" v-for="(item, index) in element_message.rect_fillet" 
                                    :key="index" 
                                    :class="{'current': item > 0}" 
                                    @click.stop="toggle_rect_fillet(index)" 
                                >
                                    <base-icon v-if="index === 0" class="iconradius-upleft"></base-icon>
                                    <base-icon v-else-if="index === 1" class="iconradius-upright"></base-icon>
                                    <base-icon v-else-if="index === 2" class="iconradius-bottomright"></base-icon>
                                    <base-icon v-else-if="index === 3" class="iconradius-bottomleft"></base-icon>
                                </div>
                            </div>
                        </div>
                        <!-- 填充 -->
                        <div class="fill" v-if="['line', 'chart', 'video', 'audio', 'img'].indexOf(element_type) < 0 && element_message.background">
                            <div class="check-box" :class="{current: element_message.background.color !== 'transparent'}" @click="set_ele_background(element_message.background.color === 'transparent' ? 'color' : 'transparent')">
                                <base-icon v-show="element_message.background.color !== 'transparent'" class="icondagou"></base-icon>
                            </div>
                            <div class="fill-group">
                                <div class="color"  @click.stop="openColorPanel($event, element_message.background)">
                                    <template v-if="element_message.background.type === 'color'">
                                        <base-icon svg-id="iconwutianchongyanse" v-if="element_message.background.color === 'transparent'"></base-icon>
                                        <i v-else :style="{background: element_message.background.color}"></i>
                                    </template>
                                    <i v-else-if="element_message.background.type === 'gradient'" :style="{background: gradient_string}"></i>
                                </div>
                                <div class="fill-panel" v-if="['fill', 'gradient_fill', 'img_fill'].indexOf(pull_list_type) !== -1">
                                    <div class="fill-panel-header">
                                        <div class="fill-header-item" :class="{current: pull_list_type === 'fill'}" @click.stop="pull_module_toggle($event,'fill', {color: element_message.background, colorType: 'color'})">纯色填充</div>
                                        <div class="fill-header-item" :class="{current: pull_list_type === 'gradient_fill'}" @click.stop="pull_module_toggle($event,  'gradient_fill', {color: element_message.background, colorType: 'gradient'})">渐变填充</div>
                                        <div class="fill-header-item" :class="{current: pull_list_type === 'img_fill'}" @click.stop="pull_module_toggle($event,'img_fill')">图片填充</div>
                                    </div>
                                    <div class="fill-color-panel" ref="fill" v-if="pull_list_type === 'fill'"></div>
                                    <div class="fill-gradient-panel" ref="gradient_fill" v-if="pull_list_type === 'gradient_fill'"></div>
                                    <div class="fill-img-panel" ref="img_fill" v-if="pull_list_type === 'img_fill'">
                                        <label class="fill-img-btn local-upload" for="back_img_upload">
                                            <span>本地上传</span>
                                            <input v-show="false" type="file" id="back_img_upload" @change="set_ele_backgroundImage($event.target)" accept="image/gif, image/jpeg, image/png, image/bmp, image/webp, image/svg+xml">
                                        </label>
                                        <button class="fill-img-btn material" @click="set_ele_backgroundImage('material')">素材库</button>
                                        <div class="fill-image-type" v-if="element_type !== 'shape' && element_message.background.type === 'image'">
                                            <div class="cover">
                                                <div class="check-box" :class="{current: element_message.background.image.type === 'cover'}" @click="change_ele_backgroundImage_size('cover')">
                                                    <base-icon v-show="element_message.background.image.type === 'cover'" class="icondagou"></base-icon>
                                                </div>
                                                <span>铺满</span>
                                            </div>
                                            <div class="repeat">
                                                <div class="check-box" :class="{current: element_message.background.image.type === 'repeat'}" @click="change_ele_backgroundImage_size('repeat')">
                                                    <base-icon v-show="element_message.background.image.type === 'repeat'" class="icondagou"></base-icon>
                                                </div>
                                                <span>平铺</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <span>填充</span>
                        </div>
                        <!-- 描边 -->
                        <div class="line" v-if="['chart', 'video', 'audio'].indexOf(element_type) < 0 && !element_message.not_border">
                            <div class="check-box" :class="{current: element_message.border_s !== 'none'}" @click="set_ele_border_style(element_message.border_s === 'none' ? 'solid' : 'none')">
                                <base-icon v-show="element_message.border_s !== 'none'" class="icondagou"></base-icon>
                            </div>
                            <div class="color" @click.stop="pull_module_toggle($event,'line',{color:element_message.border_c, ref: 'line'})">
                                <base-icon svg-id="iconwutianchongyanse" v-if="element_message.border_c === 'transparent'"></base-icon>
                                <i v-else :style="{background: element_message.border_c}"></i>
                            </div>
                            <span>描边</span>
                            <!-- 描边颜色面板 -->
                            <div class="line-color" ref="line" v-if="pull_list_type === 'line'"></div>
                        </div>
                        <transition name="modal-fade">
                            <div class="line-panel" v-if="element_message.border_s !== 'none'">
                                <!-- 描边样式 -->
                                <div class="border-style-group">
                                    <div class="border-style-panel">
                                        <div class="border-style-btn" :class="{current: pull_list_type === 'line_style'}" @click.stop="pull_module_toggle($event,'line_style',{append:true})">
                                            <i class="edit-ico" :class="`edit-ico-line_${element_message.border_s}`"></i>
                                        </div>
                                        <!-- 描边样式 -->
                                        <transition name="modal-fade">
                                            <ul class="module_list border_style_list"
                                                ref="line_style" 
                                                v-if="pull_list_type === 'line_style'"
                                                @mouseenter="border_setting_toggle('line_style')"
                                                @mouseleave="border_setting_toggle('line')"
                                            >
                                                <li class="border_style_item sp_ico_hover" v-for="(item,index) in line_style_style.normal" 
                                                    :key="index" 
                                                    @click.stop="set_ele_border_style(item.data)" 
                                                    :class="{check:element_message.border_s === item.data}">
                                                    <i class="edit-ico" :class="element_message.border_s === item.data ? `edit-ico-line_${item.data}_hover` : `edit-ico-line_${item.data}`"></i>
                                                </li>
                                                <template v-if="['img', 'shape', 'line'].indexOf(element_type) >= 0">
                                                    <li class="border_style_item sp_ico_hover" v-for="(item,index) in line_style_style.special" 
                                                        :key="index" 
                                                        @click.stop="set_ele_border_style(item.data)" 
                                                        :class="{check:element_message.border_s === item.data}">
                                                        <i class="edit-ico" :class="element_message.border_s === item.data ? `edit-ico-line_${item.data}_hover` : `edit-ico-line_${item.data}`"></i>
                                                    </li>
                                                </template>
                                            </ul>
                                        </transition>
                                    </div>
                                    <span>类型</span>
                                </div>
                                <!-- 描边粗细 -->
                                <div class="line-size">
                                    <div class="line-size-panel">
                                        <input type="number" maxlength="3" class="moudle_display"
                                            :disabled="element_message.border_s === 'none'"
                                            v-model="element_message.border_w"
                                            @focus="input_focus_save($event)"
                                            @input="check_input_number($event, 'border_w')"
                                            @keydown="key_up_input($event,'border_w')"
                                            @blur="set_ele_border_width(element_message.border_w)"/>
                                        <span>磅</span>
                                        <div class="btn-group">
                                            <button class="add-btn" @mousedown="change_message($event, 'border_w','add')"></button>
                                            <button class="cut-btn" @mousedown="change_message($event, 'border_w','cut')"></button>
                                        </div>
                                    </div>
                                    <span>粗细</span>
                                </div>

                                <!-- 线条头部样式 -->
                                <div class="line-left" v-if="element_type === 'line'">
                                    <div class="line-left-panel">
                                        <div class="line-left-btn" :class="{current: pull_list_type === 'left_path'}" @click.stop="pull_module_toggle($event,'left_path')">
                                            <i class="edit-ico" :class="`edit-ico-${element_message.line_left}`" ></i>
                                        </div>
                                        <ul class="module_list" ref="left_path" v-if="pull_list_type === 'left_path'">
                                            <li v-for="(item, index) in line_marker_list"
                                                :key="index"
                                                :data-type="item.type"
                                                :class="{'currrent':element_message.line_left === item.type}"
                                                @click.stop="select_line_path('left', item)"
                                            >
                                                <i class="edit-ico" :class="`edit-ico-line_path_0${index + 1}`"></i>
                                            </li>
                                        </ul>
                                    </div>
                                    <span>头部</span>
                                </div>
                                <!-- 线条尾部样式 -->
                                <div class="line-right" v-if="element_type === 'line'">
                                    <div class="line-right-panel">
                                        <div class="line-right-btn" :class="{current: pull_list_type === 'right_path'}" @click.stop="pull_module_toggle($event,'right_path')">
                                            <i class="edit-ico" :class="`edit-ico-${element_message.line_right}`" ></i>
                                        </div>
                                        <ul class="module_list" ref="right_path" v-if="pull_list_type === 'right_path'">
                                            <li v-for="(item, index) in line_marker_list"
                                                :key="index"
                                                :data-type="item.type"
                                                :class="{'check':element_message.line_right === item.type}"
                                                @click.stop="select_line_path('right', item)"
                                            >
                                                <i class="edit-ico" :class="`edit-ico-line_path_0${index + 1}`"></i>
                                            </li>
                                        </ul>
                                    </div>
                                    <span>尾部</span>
                                </div>
                            </div>
                        </transition>

                        <!-- 阴影 -->
                        <div class="shadow" v-if="['shape', 'img'].indexOf(element_type) >= 0 || (element_type === 'group' && !element_message.not_shadow && element_message.shadow)">
                            <template v-if="element_message.shadow">
                                <div class="check-box" :class="{current: element_message.shadow.open}"  v-tooltip="element_message.shadow.open ? '关闭投影' : '开启投影'" @click="set_ele_shadow(!element_message.shadow.open,'open')">
                                    <base-icon v-show="element_message.shadow.open" class="icondagou"></base-icon>
                                </div>
                                <div class="color" @click.stop="pull_module_toggle($event,'shadow',{color: element_message.shadow.color, ref:'shadow'})">
                                    <base-icon svg-id="iconwutianchongyanse" v-if="element_message.shadow.color === 'transparent' || !element_message.shadow.open"></base-icon>
                                    <i v-else :style="{background: element_message.shadow.color}"></i>
                                </div>
                            </template>
                            <span>阴影</span>
                            <!-- 描边颜色面板 -->
                            <div class="shadow-color" ref="shadow" v-if="pull_list_type === 'shadow'"></div>
                        </div>
                        <transition name="modal-fade">
                            <div class="shadow-panel" v-if="element_message.shadow&&element_message.shadow.open">
                                <!-- 预置样式 -->
                                <div class="shadow-style">
                                    <button class="shadow-style-btn" :class="{current: pull_list_type === 'shadow_preset'}" @click.stop="pull_module_toggle($event,'shadow_preset')">
                                        <span>预置样式</span>
                                    </button>
                                    <ul class="preset_list" ref="shadow" v-if="pull_list_type === 'shadow_preset'">
                                        <li class="preset_item" 
                                            :class="{'current': item.shadow === element_message.shadow}"
                                            v-for="(item, index) in shadow_list" 
                                            :key="index" 
                                            @click="set_shadow(item)">
                                            <span :style="{boxShadow:item.box_shadow}"></span>
                                        </li>
                                    </ul> 
                                </div>

                                <div class="shadow-group" v-if="element_message.shadow">
                                    <base-knob :max="360" v-model="element_message.shadow.rotate" @mousemove="set_ele_shadow(element_message.shadow.rotate,'rotate')"></base-knob>
                                    <div class="shadow-value-item">
                                        <base-unit-input 
                                            v-model="element_message.shadow.rotate" 
                                            @input="check_shadow_rotate($event)"
                                            @keydown="key_up_input($event,'shaow_rotate')"
                                            @keydown.enter="set_ele_shadow(element_message.shadow.rotate,'rotate')"
                                            @blur="set_ele_shadow(element_message.shadow.rotate,'rotate')" 
                                            @focus="input_focus_save($event)"
                                            @add="set_ele_shadow(+element_message.shadow.rotate + 1,'rotate')"
                                            @cut="set_ele_shadow(+element_message.shadow.rotate - 1,'rotate')"
                                        >
                                        </base-unit-input>
                                        <span>角度</span>
                                    </div>
                                    <div class="shadow-value-item">
                                        <base-unit-input 
                                            v-model="element_message.shadow.blur" 
                                            @blur="set_ele_shadow(element_message.shadow.blur,'blur')" 
                                            @keydown.enter="set_ele_shadow(element_message.shadow.blur,'blur')" 
                                            @add="set_ele_shadow(Number(element_message.shadow.blur) + 1,'blur')"
                                            @cut="set_ele_shadow(Number(element_message.shadow.blur) - 1,'blur')"
                                        ></base-unit-input>
                                        <span>模糊</span>
                                    </div>
                                    <div class="shadow-value-item">
                                        <base-unit-input 
                                            v-model="element_message.shadow.distance" 
                                            @blur="set_ele_shadow(element_message.shadow.distance,'distance')" 
                                            @keydown.enter="set_ele_shadow(element_message.shadow.distance,'distance')" 
                                            @add="set_ele_shadow(Number(element_message.shadow.distance) + 1,'distance')"
                                            @cut="set_ele_shadow(Number(element_message.shadow.distance) - 1,'distance')"
                                        ></base-unit-input>
                                        <span>距离</span>
                                    </div>
                                </div>
                            </div>
                        </transition>

                        
                    </div>
                </div>
                <!-- 编辑图表 -->
                <div class="edit-chart" v-if="'editChart' in formatTypeStatus">
                    <div class="header-btn" @click="toggleModule('editChart')">
                        <span>编辑图表</span>
                        <button class="arrow" :class="{current: formatTypeStatus.editChart}">
                            <base-icon class="iconjiantou"></base-icon>
                        </button>
                    </div>
                    <div class="content" v-show="formatTypeStatus.editChart">
                        <!-- 替换图表样式 -->
                        <div class="replace-panel">
                            <button :class="{current: pull_list_type === 'chart_list'}" @click.stop="pull_module_toggle($event,'chart_list')">替换图表样式</button>
                            <div class="chart-list" ref="chart_list"  v-if="pull_list_type === 'chart_list'">
                                <ul>
                                    <li v-for="(value, name) in chart_class" :key="name" :class="{'current': name === element_message.chart_style}" @click="chart_chage_class(name)" v-bdtongji="'编辑器-全部格式-'+element_message.chart_style+'-左侧-更换样式'">
                                        <base-icon :class="value.icon"></base-icon>
                                        <span>{{value.name}}</span>
                                    </li>
                                </ul>
                            </div>
                            
                        </div>
                        <!-- 项目编辑 -->
                        <div class="item-edit-panel" v-if="element_message.chart_data.dataset">
                            <div class="chart_data_table" v-if="element_message.chart_data.dataset">
                                <!-- 数据集product -->
                                <div class="chart_data_col">
                                    <div class="col_item"></div>
                                    <div class="col_item">
                                        <input type="text" 
                                            placeholder="组" 
                                            v-model="element_message.chart_data.dataset.dimensions[1]" 
                                            @blur="update_chart_item($event)" 
                                            @keydown="update_chart_item($event)" 
                                        />
                                    </div>
                                    <div class="col_item">
                                        <input type="text" 
                                            placeholder="组" 
                                            v-model="element_message.chart_data.dataset.dimensions[2]" 
                                            @blur="update_chart_item($event)" 
                                            @keydown="update_chart_item($event)" 
                                        />
                                    </div>
                                    <div class="col_item">
                                        <input type="text" 
                                            placeholder="组" 
                                            v-model="element_message.chart_data.dataset.dimensions[3]" 
                                            @blur="update_chart_item($event)" 
                                            @keydown="update_chart_item($event)" 
                                        />
                                    </div>
                                    <div class="col_item">
                                        <input type="text" 
                                            placeholder="组" 
                                            v-model="element_message.chart_data.dataset.dimensions[4]" 
                                            @blur="update_chart_item($event)" 
                                            @keydown="update_chart_item($event)" 
                                        />
                                    </div>
                                    <div class="col_item">
                                        <input type="text" 
                                            placeholder="组" 
                                            v-model="element_message.chart_data.dataset.dimensions[5]" 
                                            @blur="update_chart_item($event)" 
                                            @keydown="update_chart_item($event)" 
                                        />
                                    </div>
                                </div>
                                <!-- 数据集表格 -->
                                <div class="chart_data_col" v-for="(source_item, source_index) in element_message.chart_data.dataset.source" :key="source_index">
                                    <!-- 固定显示5列数值 -->
                                    <div class="col_item">
                                        <input type="text" 
                                            placeholder="名称" 
                                            v-model="source_item[0]" 
                                            @focus="chart_item_focus($event)"
                                            @blur="update_chart_item($event)" 
                                            @keydown="update_chart_item($event)" 
                                        />
                                    </div>
                                    <div class="col_item">
                                        <input type="text" 
                                            placeholder="数值" 
                                            v-model="source_item[1]" 
                                            @focus="chart_item_focus($event)"
                                            @blur="update_chart_item($event)" 
                                            @keydown="update_chart_item($event)" 
                                            onkeypress="return (/[\d\.]/.test(String.fromCharCode(event.keyCode)))" 
                                        />
                                    </div>
                                    <div class="col_item">
                                        <input type="text" 
                                            placeholder="数值" 
                                            v-model="source_item[2]" 
                                            @focus="chart_item_focus($event)"
                                            @blur="update_chart_item($event)" 
                                            @keydown="update_chart_item($event)" 
                                            onkeypress="return (/[\d\.]/.test(String.fromCharCode(event.keyCode)))" 
                                        />
                                    </div>
                                    <div class="col_item">
                                        <input type="text" 
                                            placeholder="数值" 
                                            v-model="source_item[3]" 
                                            @focus="chart_item_focus($event)"
                                            @blur="update_chart_item($event)" 
                                            @keydown="update_chart_item($event)" 
                                            onkeypress="return (/[\d\.]/.test(String.fromCharCode(event.keyCode)))" 
                                        />
                                    </div>
                                    <div class="col_item">
                                        <input type="text" 
                                            placeholder="数值" 
                                            v-model="source_item[4]" 
                                            @focus="chart_item_focus($event)"
                                            @blur="update_chart_item($event)" 
                                            @keydown="update_chart_item($event)" 
                                            onkeypress="return (/[\d\.]/.test(String.fromCharCode(event.keyCode)))" 
                                        />
                                    </div>
                                    <div class="col_item">
                                        <input type="text" 
                                            placeholder="数值" 
                                            v-model="source_item[5]" 
                                            @focus="chart_item_focus($event)"
                                            @blur="update_chart_item($event)" 
                                            @keydown="update_chart_item($event)" 
                                            onkeypress="return (/[\d\.]/.test(String.fromCharCode(event.keyCode)))" 
                                        />
                                    </div>
                                    <a href="javascript:;" title="删除" class="col_delete" @click="chart_table_col_delete(source_index)"></a>
                                </div>
                                <button class="chart_data_add" title="添加项目" @click="add_chart_item" v-bdtongji="'编辑器-全部格式-'+element_message.element_message+'-左侧-添加项目'">+</button>
                            </div>
                        </div>
                        <!-- X轴名称 -->
                        <div class="x-name" v-if="element_message.chart_data.xAxis">
                            <span>X轴名称</span>
                            <input type="text" 
                                maxlength="20" 
                                v-model="element_message.chart_data.xAxis.name" 
                                @blur="update_chart_axis_name('x')" 
                                @keydown.enter="$event.target.blur()" 
                            />
                        </div>
                        <!-- Y轴名称 -->
                        <div class="y-name" v-if="element_message.chart_data.yAxis">
                            <span>Y轴名称</span>
                            <input type="text" 
                                maxlength="20" 
                                v-model="element_message.chart_data.yAxis.name" 
                                @blur="update_chart_axis_name('y')" 
                                @keydown.enter="$event.target.blur()" 
                            />
                        </div>
                        <!-- 折线设置 -->
                        <div class="chart-set-line-group" v-if="element_message.chart_style === 'line'">
                            <div class="chart_set_item" v-for="(item, index) in element_message.chart_data.line_style" :key="index" >
                                <span>折线{{index + 1}}</span>
                                <div class="line_style_item">
                                    <input type="number" 
                                        class="line_style_width" 
                                        maxlength="2" 
                                        v-model="item.width" 
                                        @blur="update_chart(null)" 
                                        @keydown.enter="$event.target.blur()" 
                                        v-bdtongji="'编辑器-全部格式-曲线图表-左侧-折线粗细'"
                                    />
                                    <div class="line_style_type">
                                        <div class="pull_module_btn" @click.stop="show_chart_line_style($event)">
                                            <span class="module_display">
                                                <i class="edit-ico" :class="`edit-ico-line_${item.type}`" ></i>
                                            </span>
                                        </div>
                                        <ul class="module_list">
                                            <li  class="border_style_item sp_ico_hover" v-for="_item in line_style_style.normal" :key="_item.name" @click="update_chart_line_style(_item.data, item)" v-bdtongji="'编辑器-全部格式-曲线图表-左侧-更换样式'">
                                                <i class="edit-ico" :class="element_message.border_s === _item.data ? `edit-ico-line_${_item.data}_hover` : `edit-ico-line_${_item.data}`"></i>
                                            </li>
                                        </ul>
                                    </div>
                                    <div class="color_block line_style_color" 
                                        :style="{'backgroundColor': element_message.chart_data.color[index]}" 
                                        @click.stop="selection_chart_theme_item($event,element_message.chart_data.color[index], index)" 
                                        v-bdtongji="'编辑器-全部格式-曲线图表-左侧-折线颜色'"
                                    ></div>
                                </div>
                            </div>
                        </div>
                        <!-- 显示图例 -->
                        <div class="show-legend">
                            <span>显示图例</span>
                            <div class="on-off" 
                                :class="{'current': element_message.chart_data.legend}" 
                                @click="update_chart_set('legend')">
                                <i class="slider"></i>
                            </div>
                        </div>
                        <!-- 显示数值 -->
                        <div class="show-value" v-if="['pie', 'funnel'].indexOf(element_message.chart_style) >= 0">
                            <span>显示数值</span>
                            <div class="on-off" 
                                :class="{'current': element_message.chart_data.show_series_value}" 
                                @click="update_chart_set('formatter_value')">
                                <i class="slider"></i>
                            </div>
                        </div>
                        <!-- 显示百分比 -->
                        <div class="show-percentage" v-if="['pie', 'funnel'].indexOf(element_message.chart_style) >= 0">
                            <span>显示百分比</span>
                            <div class="on-off" 
                                :class="{'current': element_message.chart_data.show_series_ratio}" 
                                @click="update_chart_set('formatter_ratio')">
                                <i class="slider"></i>
                            </div>
                        </div>
                        <template v-if="element_message.chart_style === 'pie'">
                        <!-- 数值标签内部显示 -->
                        <div class="show-tag">
                            <span>数值标签内部显示</span>
                            <div class="on-off" 
                                :class="{'current': element_message.chart_data.label_inside}" 
                                @click="update_chart_set('label_inside')">
                                <i class="slider"></i>
                            </div>
                        </div>
                        <!-- 环形图 -->
                        <div class="show-ring-chart" >
                            <span>环形图</span>
                            <div class="on-off" 
                                :class="{'current': element_message.chart_data.series_radius}" 
                                @click="update_chart_set('radius')">
                                <i class="slider"></i>
                            </div>
                        </div>
                        </template>
                        <!-- 南丁格尔玫瑰图 -->
                        <div class="show-rose" v-if="element_message.chart_style === 'pie'">
                            <span>南丁格尔玫瑰图</span>
                            <div class="on-off" 
                                :class="{'current': element_message.chart_data.series_roseType}" 
                                @click="update_chart_set('rose_type')">
                                <i class="slider"></i>
                            </div>
                        </div>
                        <!-- 堆叠放置 -->
                        <div class="show-heap" v-if="element_message.chart_style === 'bar'">
                            <span>堆叠放置</span>
                            <div class="on-off" 
                                :class="{'current': element_message.chart_data.series_pile}" 
                                @click="update_chart_set('pile')">
                                <i class="slider"></i>
                            </div>
                        </div>
                        <!-- 自定义颜色 -->
                        <div class="custom-color" v-if="element_message.chart_style !== 'line'">
                            <span>自定义颜色</span>
                            <div class="color-group" v-if="['pie', 'funnel'].indexOf(element_message.chart_style) >= 0">
                                <div class="color-block" 
                                    v-for="(item, index) in element_message.chart_data.dataset.source" 
                                    :key="index" 
                                    :style="{'backgroundColor': element_message.chart_data.color[index]}" 
                                    @click.stop="selection_chart_theme_item($event,element_message.chart_data.color[index], index)" 
                                ></div>
                            </div>
                            <div class="color-group" v-else>
                                <div class="color-block" 
                                    v-for="(item, index) in element_message.chart_data.series" 
                                    :key="index" 
                                    :style="{'backgroundColor': element_message.chart_data.color[index]}" 
                                    @click.stop="selection_chart_theme_item($event,element_message.chart_data.color[index], index)" 
                                ></div>
                            </div>
                        </div>
                    </div>
                </div>
                <!-- 透明度 -->
                <div class="transparency-module" v-if="'transparency' in formatTypeStatus">
                    <div class="header-btn" @click="toggleModule('transparency')">
                        <span>透明度</span>
                        <button class="arrow" :class="{current: formatTypeStatus.transparency}">
                            <base-icon class="iconjiantou"></base-icon>
                        </button>
                    </div>
                    <div class="content" v-show="formatTypeStatus.transparency">
                        <div class="transparency-group">
                            <template v-if="seekbar_obj['opacity']">
                                <base-seek-bar :seekbar_obj="seekbar_obj['opacity']" :btn-show="false" :value-show="false"></base-seek-bar>
                                <div class="input">
                                    <input type="number" min="0" max="100" maxlength="3" v-model="element_message.opacity" @input="set_ele_opacity(element_message.opacity)">
                                </div>
                            </template>
                        </div>
                    </div>
                </div>
                <!-- 音频设置 -->
                <div class="audio-setup-module" v-if="'audioSetup' in formatTypeStatus">
                    <div class="header-btn" @click="toggleModule('audioSetup')">
                        <span>设置</span>
                        <button class="arrow" :class="{current: formatTypeStatus.audioSetup}">
                            <base-icon class="iconjiantou"></base-icon>
                        </button>
                    </div>
                    <div class="content" v-show="formatTypeStatus.audioSetup">
                        <!-- 渐强 -->
                        <div class="fade-in">
                            <span>渐强</span>
                            <base-unit-input 
                                unit="秒" 
                                input-type="text"
                                 v-model="element_message.fadein" 
                                @blur="audio_fade('fadein')"
                                @keydown.enter="audio_fade('fadein')"
                                onkeypress="return (/[\d\.]/.test(String.fromCharCode(event.keyCode)))"
                                @add="audio_fade('fadein', 'add')"
                                @cut="audio_fade('fadein', 'reduce')"
                            ></base-unit-input>
                        </div>
                        <!-- 渐弱 -->
                        <div class="fade-out">
                            <span>渐弱</span>
                            <base-unit-input 
                                unit="秒" 
                                input-type="text"
                                v-model="element_message.fadeout" 
                                @blur="audio_fade('fadeout')"
                                @keydown.enter="$event.target.blur()" 
                                @add="audio_fade('fadeout', 'add')"
                                @cut="audio_fade('fadeout', 'reduce')"
                            ></base-unit-input>
                        </div>
                        <!-- 自动播放 -->
                        <div class="autoplay">
                            <span>自动播放</span>
                            <div class="on-off" 
                                :class="{'current': element_message.autoplay}" 
                                @click="audio_conf('autoplay')">
                                <i class="slider"></i>
                            </div>
                        </div>
                        <!-- 循环 -->
                        <div class="loop">
                            <span>循环</span>
                            <div class="on-off" 
                                :class="{'current': element_message.loop}" 
                                @click="audio_conf('loop')">
                                <i class="slider"></i>
                            </div>
                        </div>
                        <!-- 播放时隐藏图标 -->
                        <div class="hideonshow">
                            <span>播放时隐藏图标</span>
                            <div class="on-off" 
                                :class="{'current': element_message.hideonshow}" 
                                @click="audio_conf('hideonshow')">
                                <i class="slider"></i>
                            </div>
                        </div>
                    </div>
                </div>
                <!-- 视频设置 -->
                <div class="video-setup-module" v-if="'videoSetup' in formatTypeStatus">
                    <div class="header-btn" @click="toggleModule('videoSetup')">
                        <span>设置</span>
                        <button class="arrow" :class="{current: formatTypeStatus.videoSetup}">
                            <base-icon class="iconjiantou"></base-icon>
                        </button>
                    </div>
                    <div class="content" v-show="formatTypeStatus.videoSetup">
                        <!-- 显示控制栏 -->
                        <div class="show-controls" :class="{'disable': !element_message.can_set}" custom-tip="外链视频不支持设置">
                            <span>显示控制栏</span>
                            <div class="on-off" 
                                :class="{'current': element_message.controls}" 
                                @click="video_conf('controls')">
                                <i class="slider"></i>
                            </div>
                        </div>

                        <!-- 自动播放 -->
                        <div class="autoplay" :class="{'disable': !element_message.can_set}" custom-tip="外链视频不支持设置">
                            <span>自动播放</span>
                            <div class="on-off" 
                                :class="{'current': element_message.autoplay}" 
                                @click="video_conf('autoplay')">
                                <i class="slider"></i>
                            </div>
                        </div>

                        <!-- 循环 -->
                        <div class="loop" :class="{'disable': !element_message.can_set}" custom-tip="外链视频不支持设置">
                            <span>循环</span>
                            <div class="on-off" 
                                :class="{'current': element_message.loop}" 
                                @click="video_conf('loop')">
                                <i class="slider"></i>
                            </div>
                        </div>

                        <!-- 静音 -->
                        <div class="muted" :class="{'disable': !element_message.can_set}" custom-tip="外链视频不支持设置">
                            <span>静音</span>
                            <div class="on-off" 
                                :class="{'current': element_message.muted}" 
                                @click="video_conf('muted')">
                                <i class="slider"></i>
                            </div>
                        </div>

                        <!-- 视频封面 -->
                        <div class="video-cover">
                            <input type="file" id="upload_video_cover" accept="image/jpeg,image/jpg,image/png" @change="video_upload_cover" />
                            <div class="video-cover-img" v-if="element_message.cover">
                                <!-- 封面图片 -->
                                <img :src="element_message.cover" alt="">
                                <div class="mask">
                                    <!-- 删除 -->
                                    <div class="del-cover" @click.stop="video_cover_del">
                                        <base-icon class="iconshanchutianchong"></base-icon>
                                    </div>
                                    <!-- 更换封面 -->
                                    <label class="replace-cover" for="upload_video_cover">
                                        <base-icon class="icontihuan"></base-icon>
                                        <span>更换封面</span>
                                    </label>
                                </div>
                            </div>
                            <div class="video-upload-cover" v-else>
                                <!-- 上传封面 -->
                                <label class="replace-cover" for="upload_video_cover">
                                    <base-icon class="icontihuan"></base-icon>
                                    <span>上传封面</span>
                                </label>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="table-more" v-if="element_type === 'table'">
                    <!-- 替换对象 -->
                    <div class="replace-panel">
                        <button :class="{current: pull_list_type === 'table_preset'}" @click.stop="pull_module_toggle($event,'table_preset')">替换对象</button>
                        <transition name="modal-fade">
                            <ul class="preset_list_wrapper" ref="table_preset" v-if="pull_list_type === 'table_preset'">
                                <li v-for="(item, index) in table_preset_list" :key="index" @click="preset_table_style(item)" v-bdtongji="'编辑器-全部格式-表格-左侧-替换预设版式'">
                                    <img v-show="item.image" :src="item.image">
                                </li>
                            </ul>
                        </transition>
                    </div>

                    <!-- 行数 -->
                    <div class="row-num">
                        <span>行数</span>
                        <input 
                            type="number"
                            :value="element_message.row"
                            maxlength="2"
                            @focus="input_focus_save($event)"
                            @input="check_input_number($event,'row')"
                            @blur="add_table_size($event,'row')"
                            @keydown.enter="key_up_input($event)"
                            onkeypress="return (/[\d]/.test(String.fromCharCode(event.keyCode)))"
                        >
                    </div>
                    <!-- 列数 -->
                    <div class="col-num">
                        <span>列数</span>
                        <input 
                            type="number"
                            :value="element_message.line"
                            maxlength="2"
                            @focus="input_focus_save($event)"
                            @input="check_input_number($event,'line')"
                            @blur="add_table_size($event,'line')"
                            @keydown.enter="key_up_input($event)"
                            onkeypress="return (/[\d]/.test(String.fromCharCode(event.keyCode)))"
                        >
                    </div>
                </div>
                <div class="img-more" v-if="element_type === 'img'">
                    <button @click.stop="change_image_src('material')">替换对象</button>
                    <button @click.stop="toggle_clip_ratio">图片裁剪</button>
                </div>
                <div class="audio-more" v-if="element_type === 'audio'">
                    <button @click.stop="audio_reset">重置音频</button>
                    <p class="bgm-tips">对整个文档生效请在“全局设置-全局音乐”处操作</p>
                </div>
                <div class="video-more" v-if="element_type === 'video'">
                    <button @click.stop="video_reset">重置视频</button>
                </div>
            </div>

            <div class="format-clip-ratio" v-else-if="element_type === 'img' && show_clip_ratio">
                <!-- 自由裁剪 -->
                <div class="free-module">
                    <div class="header-btn" :class="{current: clip_ratio === 'free'}" @click.stop="begin_image_clip(clip_ratio_style[0])">
                        <span>自由裁剪</span>
                    </div>
                </div>
                <!-- 形状裁剪 -->
                <div class="shape-module">
                    <div class="header-btn" @click.stop="show_clip_shape()">
                        <span>形状裁剪</span>
                        <button class="arrow" :class="{current: format_clip_ratio_shape}">
                            <base-icon class="iconjiantou"></base-icon>
                        </button>
                    </div>
                    <div class="content" v-show="format_clip_ratio_shape">
                        <svg class="image_patten" viewBox="0 0 400 400">
                            <pattern id="shape_crop_thumbnail" patternUnits="userSpaceOnUse" x="0" y="0" width="400" height="400">
                                <image :href="clip_shape_image" :xlink:href="clip_shape_image" width="400" height="400"></image>
                            </pattern>
                        </svg>
                        <ul>
                            <li :class="{ 'skeleton':clip_image_load,  'current': element_message.clip_message.type === item.type}"
                                v-for="(item, index) in clip_shape_list" 
                                :key="index" 
                                @click="begin_image_clip(item)">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" enable-background="new 0 0 400 400">
                                    <path :d="item.d"></path>
                                </svg>
                            </li>
                            <li class="seat" v-for="v in 6" :key="v"></li>
                        </ul>
                    </div>
                </div>
                <!-- 比例裁剪 -->
                <div class="scale-module">
                    <div class="header-btn" @click.stop="format_clip_ratio_scale = !format_clip_ratio_scale">
                        <span>比例裁剪</span>
                        <button class="arrow" :class="{current: format_clip_ratio_scale}">
                            <base-icon class="iconjiantou"></base-icon>
                        </button>
                    </div>
                    <div class="content" v-show="format_clip_ratio_scale">
                        <div class="scale-item"
                            v-for="(item, index) in clip_ratio_style.slice(3)" 
                            :key="index"
                            @click="begin_image_clip(item)" 
                            :class="{'current': clip_ratio === item.data}">
                            {{ item.name }}
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <!-- 空状态 -->
        <div class="format-contain format-empty" v-if="show_format_panel && !element_type">
            <div class="format-header">
                <button class="close" @click="toggleFormatPanel()">
                    <base-icon class="iconguanbi1" size="14"></base-icon>
                </button>
            </div>
            <div class="format-main">
                <div class="empty-group">
                    <img :src="format_empty_svg" alt="">
                    <span>没有任何被选中的对象</span>
                </div>
            </div>
        </div>

        <!-- 快捷操作栏 -->
        <div class="convformat_contain" :style="{ visibility: element_type !== '' && !show_format_panel ? '' : 'hidden'}">
            <!-- 工具栏 -->
            <div class="tools-panel" v-if="!show_clip_ratio && !show_audio_controls && !show_format_panel" @click.stop>
                <!-- 替换形状 -->
                <div class="replace-shape" v-if="element_type === 'shape'">
                    <button class="replace-btn" v-tooltip="`替换`"
                        :class="{'current': pull_list_type === 'replace_shape'}" 
                        @click.stop="pull_module_toggle($event,'replace_shape')">
                        <base-icon class="icontihuan"></base-icon>
                    </button>
                    <div class="conv_list" ref="replace_shape" v-if="pull_list_type === 'replace_shape'">
                        <ul>
                            <li v-for="(item,index) in shape_type_list" :key="index" class="shape" @click="change_shape_type(item)">
                                <i class="edit-ico" :class="`edit-ico-change_shape_${index + 1}`"></i>
                            </li>
                            <li v-for="v in 4" :key="v" class="seat"></li>
                        </ul>
                    </div>
                </div>
                <!-- 替换图片 -->
                <div class="replace-img" v-if="element_type === 'img'">
                    <button class="replace-btn" v-tooltip="`替换`"
                        :class="{'current': pull_list_type === 'replace_img'}" 
                        @click.stop="pull_module_toggle($event,'replace_img')">
                        <base-icon class="icontihuan"></base-icon>
                    </button>
                    <div class="conv_list" ref="replace_img"  v-if="pull_list_type === 'replace_img'">
                        <div class="local_upload">
                            <label for="element_image_upload" class="upload">来自本地</label>
                            <input id="element_image_upload" type="file" 
                                accept="image/gif, image/jpeg, image/png, image/bmp, image/webp, image/svg+xml" 
                                @change="change_image_src('local_upload', $event.target)">
                        </div>
                        <button class="material" @click="change_image_src('material')">来自素材库</button>
                    </div>
                </div>
                
                <!-- 线条工具栏 -->
                <template v-if="element_type === 'line'">
                    <!-- 线条填充 -->
                    <div class="line-fill-panel">
                        <button class="fill-btn" v-tooltip="`填充`"
                            :class="{'current': pull_list_type === 'line'}" 
                            @click.stop="pull_module_toggle($event,'line',{color:element_message.border_c})">
                            <base-icon :color="element_message.border_c" class="icontianchong1" v-if="element_message.border_c && element_message.border_c !== 'transparent'"></base-icon>
                            <base-icon svg-id="iconwutianchongyanse" v-else></base-icon>
                        </button>
                        <div class="conv_list" ref="line" v-if="pull_list_type === 'line'"></div>
                    </div>
                    <!-- 线条粗细 -->
                    <div class="line-size-panel">
                        <div class="pull_module_btn"  @click.stop>
                            <input type="number" class="module_display" maxlength="3"
                                v-model="element_message.border_w"
                                :disabled="element_message.border_s === 'none'"
                                @focus="input_focus_save($event)"
                                @input="check_input_number($event, 'border_w')"
                                @keydown="key_up_input($event,'border_w')"
                                @blur="set_ele_border_width(element_message.border_w)"
                            >
                            <div class="size-btn" @click.stop>
                                <div class="add-size" @click="change_message($event, 'border_w','add')"></div>
                                <div class="cut-size" @click="change_message($event, 'border_w','cut')"></div>
                            </div>
                        </div>
                    </div>
                </template>

                <!-- 图表工具栏 -->
                <template v-if="element_type === 'chart'">
                    <!-- 替换图表 -->
                    <div class="replace-chart">
                        <button class="replace-btn" v-tooltip="`替换`"
                            :class="{'current': pull_list_type === 'replace_chart'}" 
                            @click.stop="pull_module_toggle($event,'replace_chart')">
                            <base-icon class="icontihuan"></base-icon>
                        </button>
                        <div class="conv_list" ref="replace_chart"  v-if="pull_list_type === 'replace_chart'">
                            <ul>
                                <li v-for="(value, name) in chart_class" :key="name" :class="{'current': name === element_message.chart_style}" @click="chart_chage_class(name)" v-bdtongji="'编辑器-全部格式-'+element_message.chart_style+'-左侧-更换样式'">
                                    <base-icon :class="value.icon"></base-icon>
                                    <span>{{value.name}}</span>
                                </li>
                            </ul>
                        </div>
                    </div>
                    <!-- 编辑图表数据 -->
                    <button class="edit-chart"
                        v-tooltip="'编辑图表'"
                        @click.stop="show_format_panel = !show_format_panel">
                        <base-icon class="iconbianjixiugai"></base-icon>
                        <span>编辑图表数据</span>
                    </button>
                </template>

                <!-- 音频工具栏 -->
                <template v-if="element_type === 'audio'">
                    <!-- 音频控件入口 -->
                    <button class="audio-controls" @click.stop="showAudioControls()">
                        <base-icon class="iconbofang"></base-icon>
                    </button>
                    <!-- 自动播放 -->
                    <div class="audio-autoplay" @click="audio_conf('autoplay')">
                        <div class="check-box" :class="{'current': element_message.autoplay}">
                            <base-icon v-show="element_message.autoplay" class="icondagou"></base-icon>
                        </div>
                        <span>自动播放</span>
                    </div>
                    <!-- 循环 -->
                    <div class="audio-loop" @click="audio_conf('loop')">
                        <div class="check-box" :class="{'current': element_message.loop}">
                            <base-icon v-show="element_message.loop" class="icondagou"></base-icon>
                        </div>
                        <span>循环</span>
                    </div>
                    <!-- 播放时隐藏图标 -->
                    <div class="audio-hideonshow" @click="audio_conf('hideonshow')">
                        <div class="check-box" :class="{'current': element_message.hideonshow}">
                            <base-icon v-show="element_message.hideonshow" class="icondagou"></base-icon>
                        </div>
                        <span>播放时隐藏图标</span>
                    </div>
                </template>

                <!-- 视频工具栏 -->
                <template v-if="element_type === 'video'">
                    <!-- 更换封面 -->
                    <button class="change-cover" v-tooltip="'更换封面'" @click.stop>
                        <input type="file" id="upload_video_cover" accept="image/jpeg,image/jpg,image/png" @change="video_upload_cover" />
                        <base-icon class="icontupian2"></base-icon>
                    </button>
                    <!-- 显示控制栏 -->
                    <div class="video-controls" :class="{disable: !element_message.can_set}" @click="video_conf('controls')" v-tooltip="!element_message.can_set ? '外链视频不支持设置':''">
                        <div class="check-box" :class="{'current': element_message.controls}">
                            <base-icon v-show="element_message.controls" class="icondagou"></base-icon>
                        </div>
                        <span>显示控制栏</span>
                    </div>
                    <!-- 自动播放 -->
                    <div class="video-autoplay" :class="{disable: !element_message.can_set}" @click="video_conf('autoplay')" v-tooltip="!element_message.can_set ? '外链视频不支持设置':''">
                        <div class="check-box" :class="{'current': element_message.autoplay}">
                            <base-icon v-show="element_message.autoplay" class="icondagou"></base-icon>
                        </div>
                        <span>自动播放</span>
                    </div>
                    <!-- 循环 -->
                    <div class="video-loop" :class="{disable: !element_message.can_set}" @click="video_conf('loop')" v-tooltip="!element_message.can_set ? '外链视频不支持设置':''">
                        <div class="check-box" :class="{'current': element_message.loop}">
                            <base-icon v-show="element_message.loop" class="icondagou"></base-icon>
                        </div>
                        <span>循环</span>
                    </div>
                    <!-- 静音 -->
                    <div class="video-muted" :class="{disable: !element_message.can_set}" @click="video_conf('muted')" v-tooltip="!element_message.can_set ? '外链视频不支持设置':''">
                        <div class="check-box" :class="{'current': element_message.muted}">
                            <base-icon v-show="element_message.muted" class="icondagou"></base-icon>
                        </div>
                        <span>静音</span>
                    </div>
                </template>

                <!-- 裁剪图片 -->
                <button class="tailor-img"  v-if="element_type === 'img'"
                    v-tooltip="'裁剪图片'"
                    @click.stop="toggle_clip_ratio">
                    <base-icon class="iconcaijian"></base-icon>
                </button>
                <!-- 字体 -->
                <div class="font_family_panel" v-if="tools_font_family">
                    <button class="font-family-btn" :class="{'current':pull_list_type === 'text_family' && conv_list_show, 'un_able': ['chart'].indexOf(element_type) >= 0}" @click.stop="pull_module_toggle($event,'text_family',{append: true})">
                        <span>{{element_message.font_family}}</span>
                    </button>
                </div>
                <!-- 字号 -->
                <div class="font_size_panel"  v-if="tools_font_size"
                    :class="{current: pull_list_type === 'text_size'}"
                    v-bdtongji="'编辑器-全部格式-文字-左侧-字号'">
                    <div class="pull_module_btn"  @click.stop="pull_module_toggle($event, 'text_size',{append:true})" @mousedown="save_text_selection($event)">
                        <input type="number" class="module_display" maxlength="3" title="字号"
                            v-model="element_message.size"
                            :disabled="true"
                            @focus="input_focus_save($event)"
                            @input="check_input_number($event,'size')"
                            @keydown.enter="key_up_input($event)"
                            @blur="set_font_size()"
                        >
                        <div class="size-btn" @click.stop>
                            <div class="add-size" @click="set_font_unit_size('add')"></div>
                            <div class="cut-size" @click="set_font_unit_size('reduce')"></div>
                        </div>
                    </div>
                </div>
                <!-- 文字颜色 -->
                <div class="font_color_panel" v-if="tools_font_color">
                    <button class="font_color_btn" v-tooltip="`字体颜色`" @click.stop="pull_module_toggle($event,'text',{color: element_message.color})">
                        <base-icon class="iconwenbenyanse"></base-icon>
                        <i class="color-line" :style="{background:element_message.color}"></i>
                    </button>
                </div>
                <!-- 文字样式 -->
                <div class="font-style-panel" v-if="tools_font_style">
                    <button class="font-style-btn" :class="{current: pull_list_type === 'text_style'}" v-tooltip="`样式`" @click.stop="pull_module_toggle($event, 'text_style')">
                        <base-icon class="iconfudongzitiyangshi"></base-icon>
                    </button>
                    <div class="conv_list" ref="text_style" v-if="pull_list_type === 'text_style' || pull_list_type === 'hilite'">
                        <!-- 加粗 -->
                        <button class="text_bold_panel icon-btn" :class="{'current': element_message.font_weight === 'bold'}" v-tooltip="`粗体(Ctrl+B`" @click="set_font_weight">
                            <base-icon class="iconzitiyangshi"></base-icon>
                        </button>
                        <!-- 斜体 -->
                        <button class="text_italic_panel icon-btn" :class="{'current': element_message.font_style === 'italic'}" v-tooltip="`斜体(Ctrl+I)`" @click="set_font_italic">
                            <base-icon class="iconxieti1"></base-icon>
                        </button>
                        <!-- 下划线 -->
                        <button class="text_underline_panel icon-btn" :class="{'current': element_message.text_underline === 'underline', 'un_able': ['chart'].indexOf(element_type) >= 0}"  v-tooltip="`下划线(Ctrl+U)`" @click="set_font_underline">
                            <base-icon class="iconxiahuaxian1"></base-icon>
                        </button>
                        <!-- 中划线 -->
                        <button class="text_through_panel icon-btn" :class="{'current': element_message.text_linethrough === 'linethrough', 'un_able': ['chart'].indexOf(element_type) >= 0}" v-tooltip="`中划线`" @click="set_font_linethrough">
                            <base-icon class="iconzhonghuaxian1"></base-icon>
                        </button>
                        <!-- 高亮 -->
                        <button class="text_background_panel icon-btn" v-tooltip="`高亮`" @click.stop="pull_module_toggle($event,'hilite',{color:element_message.hilite})">
                            <base-icon class="icongaoliang1"></base-icon>
                            <i class="color-line" :style="{background:element_message.hilite && element_message.hilite !== 'none' && element_message.hilite !== 'transparent' ? element_message.hilite : '#ffd800'}"></i>
                        </button>
                    </div>
                </div>
                <!-- 文本对齐 -->
                <div class="align_panel" v-if="tools_align">
                    <button class="align-btn" v-tooltip="`文本对齐`"
                        :class="{'current': pull_list_type === 'align'}" 
                        @click.stop="pull_module_toggle($event,'align')">
                        <base-icon class="iconwenbenzuoduiqi"></base-icon>
                    </button>
                    <div class="conv_list" ref="align" v-if="pull_list_type === 'align'">
                        <div class="text-align">
                            <div class="title">文本对齐</div>
                            <div class="btn-group">
                                <div class="btn" :class="{current: element_message.text_align === 'left'}" @click="set_font_align('left')">
                                    <base-icon class="iconwenbenzuoduiqi1"></base-icon>
                                </div>
                                <div class="btn" :class="{current: element_message.text_align === 'right'}" @click="set_font_align('right')">
                                    <base-icon class="iconwenbenyouduiqi"></base-icon>
                                </div>
                                <div class="btn" :class="{current: element_message.text_align === 'center'}" @click="set_font_align('center')">
                                    <base-icon class="iconwenbenjuzhong"></base-icon>
                                </div>
                                <div class="btn" :class="{current: element_message.text_align === 'justify'}" @click="set_font_align('justify')">
                                    <base-icon class="iconwenbenliangduanduiqi"></base-icon>
                                </div>
                            </div>
                        </div>
                        <div class="text-list">
                            <span class="title">编号</span>
                            <div class="list-group">
                                <div class="ul-menu-btn" @click="text_list_panel_show = text_list_panel_show === 'ul' ? null : 'ul'">
                                    <base-icon class="iconwuxudayuandian"></base-icon>
                                    <div class="menu-list" v-show="text_list_panel_show === 'ul'">
                                        <span class="label">无序列表</span>
                                        <div class="item-list">
                                            <div class="item none" :class="{current: element_message.ul === 'none'}" @click="set_font_orderedList('insertUnorderedList', 'none')">无</div>
                                            <div class="item" v-tooltip="item.name" :class="{current: element_message.ul === item.data}" @click="set_font_orderedList('insertUnorderedList', item.data)" v-for="(item,index) in text_unordered_list" :key="index">
                                                <base-icon :class="item.icon"></base-icon>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div class="ol-menu-btn" @click="text_list_panel_show = text_list_panel_show === 'ol' ? null : 'ol'">
                                    <base-icon class="icon123"></base-icon>
                                    <div class="menu-list" v-show="text_list_panel_show === 'ol'">
                                        <span class="label">有序列表</span>
                                        <div class="item-list">
                                            <div class="item none" :class="{current: element_message.ol === 'none'}" @click="set_font_orderedList('insertOrderedList', 'none')">无</div>
                                            <div class="item" v-tooltip="item.name" :class="{current: element_message.ol === item.data}" @click="set_font_orderedList('insertOrderedList', item.data)" v-for="(item,index) in text_ordered_list" :key="index">
                                                <base-icon :class="item.icon"></base-icon>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="text-range">
                            <span>字间距</span>
                            <div class="letter-space">
                                <base-seek-bar :seekbar_obj="seekbar_obj['letter_space']" :btn-show="false" :value-show="false" ></base-seek-bar>
                                <base-unit-input
                                    v-model="element_message.letter_spacing" 
                                    @focus="input_focus_save($event)"
                                    @keydown="key_up_input($event,'letter_spacing')"
                                    @blur="set_font_spacing(+element_message.letter_spacing)"
                                    @add="set_font_spacing(+element_message.letter_spacing + 0.1)"
                                    @cut="set_font_spacing(+element_message.letter_spacing - 0.1)">
                                </base-unit-input>
                            </div>
                            <span>行间距</span>
                            <div class="line-height">
                                <base-seek-bar :seekbar_obj="seekbar_obj['line_height']" :btn-show="false" :value-show="false" ></base-seek-bar>
                                <base-unit-input
                                    v-model="element_message.line_height" 
                                    @focus="input_focus_save($event)"
                                    @input="check_input_number($event)"
                                    @keydown="key_up_input($event,'line_height')"
                                    @blur="set_font_lineHeight(+element_message.line_height)"
                                    @add="set_font_lineHeight(+element_message.line_height + 0.1)"
                                    @cut="set_font_lineHeight(+element_message.line_height - 0.1)">
                                </base-unit-input>
                            </div>
                        </div>
                    </div>
                </div>
                <!-- 透明度 -->
                <div class="transparency" v-if="tools_transparency">
                    <button class="transparency-btn"
                        :class="{'current': pull_list_type === 'transparency'}"  
                        @click.stop="pull_module_toggle($event,'transparency')"
                        v-tooltip="`透明度`">
                        <base-icon class="icontoumingdu"></base-icon>
                    </button>
                    <div class="conv_list" ref="transparency" v-if="pull_list_type === 'transparency'">
                        <span>透明度：</span>
                        <base-seek-bar :seekbar_obj="seekbar_obj['opacity']" :btn-show="false" :value-show="false"></base-seek-bar>
                        <div class="input">
                            <input type="number" min="0" max="100" maxlength="3" v-model="element_message.opacity" @input="set_ele_opacity(element_message.opacity)">
                        </div>
                   </div>
                </div>
                <!-- 边框 -->
                <div class="border_panel" v-if="tools_border">
                    <button class="border-btn" v-tooltip="`边框`"
                        :class="{'current': ['line', 'border_style', 'line_style'].indexOf(pull_list_type) !== -1}" 
                        @click.stop="pull_module_toggle($event,'border_style', {position_ref: 'line_setting'})">
                        <base-icon v-if="!element_message.border_c || element_message.border_c === `transparent` || element_message.border_s === 'none'" class="iconwutianchongmiaobian"></base-icon>
                        <i v-else class="border-color-icon" :style="{'border-color': element_message.border_c}"></i>
                    </button>
                    <div class="conv_list" ref="line_setting" v-if="['line', 'border_style', 'line_style'].indexOf(pull_list_type) !== -1">
                        <div class="border-panel-header">
                            <div class="border-header-item" :class="{current: pull_list_type === 'line'}" @click.stop="pull_module_toggle($event,'line', {color: element_message.border_c, append: true})">边框颜色</div>
                            <div class="border-header-item" :class="{current: ['border_style', 'line_style'].indexOf(pull_list_type) !== -1}" @click.stop="pull_module_toggle($event,'border_style')">边框样式</div>
                        </div>
                        <div class="border-color-panel" ref="line" v-if="pull_list_type === 'line'"></div>
                        <div class="border-style-panel" ref="border_style" v-if="['border_style', 'line_style'].indexOf(pull_list_type) !== -1">
                            <div class="border-type">
                                <span>线条类型</span>
                                <div class="border-type-list">
                                    <div class="border-type-btn" :class="{current: pull_list_type === 'line_style'}" @click.stop="pull_list_type === 'line_style' ? pull_module_toggle($event,'border_style') : pull_module_toggle($event,'line_style',{append:true})">
                                        <span v-if="element_message.border_s === 'none'">无</span>
                                        <i v-else class="edit-ico" :class="`edit-ico-line_${element_message.border_s}`"></i>
                                    </div>
                                    <transition name="modal-fade">
                                        <ul class="module_list border_style_list" ref="line_style" v-if="pull_list_type === 'line_style'"
                                            @mouseenter="border_setting_toggle('line_style')"
                                            @mouseleave="border_setting_toggle('border')"
                                        >
                                            <li class="border_style_item sp_ico_hover" v-for="(item,index) in line_style_style.normal" 
                                                :key="index" 
                                                @click.stop="set_ele_border_style(item.data)" 
                                                :class="{check:element_message.border_s === item.data}">
                                                <i class="edit-ico" :class="element_message.border_s === item.data ? `edit-ico-line_${item.data}_hover` : `edit-ico-line_${item.data}`"></i>
                                            </li>
                                            <template v-if="['img', 'shape', 'line'].indexOf(element_type) >= 0">
                                                <li class="border_style_item sp_ico_hover" v-for="(item,index) in line_style_style.special" 
                                                    :key="index" 
                                                    @click.stop="set_ele_border_style(item.data)" 
                                                    :class="{check:element_message.border_s === item.data}">
                                                    <i class="edit-ico" :class="element_message.border_s === item.data ? `edit-ico-line_${item.data}_hover` : `edit-ico-line_${item.data}`"></i>
                                                </li>
                                            </template>
                                        </ul>
                                    </transition>
                                </div>
                            </div>
                            <div class="border-size">
                                <span>线条粗细</span>
                                <div class="group">
                                    <base-seek-bar :seekbar_obj="seekbar_obj['border_width']" :btn-show="false" :value-show="false" ></base-seek-bar>
                                    <base-unit-input 
                                        unit="磅"
                                        input-type="number" 
                                        maxlength="3"
                                        v-model="element_message.border_w"
                                        @focus="input_focus_save($event)"
                                        @input="check_input_number($event, 'border_w')"
                                        @keydown="key_up_input($event,'border_w')"
                                        @blur="set_ele_border_width(element_message.border_w)"
                                        @add="change_message($event, 'border_w','add')"
                                        @cut="change_message($event, 'border_w','cut')"
                                    >
                                    </base-unit-input>
                                </div>
                            </div>
                            <div class="border-transparency">
                                <span>不透明度</span>
                                <div class="group">
                                    <base-seek-bar :seekbar_obj="seekbar_obj['border_opacity']" :btn-show="false" :value-show="false" ></base-seek-bar>
                                    <base-unit-input 
                                        unit="%"
                                        input-type="number" 
                                        maxlength="3"
                                        v-model="element_message.border_o"
                                        @focus="input_focus_save($event)"
                                        @input="check_input_number($event, 'border_o')"
                                        @keydown.enter="set_ele_border_opacity(element_message.border_o)"
                                        @blur="set_ele_border_opacity(element_message.border_o)"
                                        @add="change_message($event, 'border_o','add')"
                                        @cut="change_message($event, 'border_o','cut')"
                                    >
                                    </base-unit-input>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <!-- 填充 -->
                <div class="fill_panel" v-if="tools_fill">
                    <button class="fill-btn" v-tooltip="`填充`"
                        v-if="element_message.background"
                        :class="{'current': pull_list_type === 'fill'}" 
                        @click.stop="openColorPanel($event, element_message.background)">
                        <template v-if="element_message.background.type === 'color'">
                            <!-- 无填充 -->
                            <base-icon svg-id="iconwutianchongyanse" v-if="element_message.background.color === 'transparent'"></base-icon>
                            <!-- 纯色填充 -->
                            <base-icon :class="{'icon-white': element_message.background.color.toLowerCase() === '#ffffff'}" :color="element_message.background.color" v-else class="icontianchong1"></base-icon>
                        </template>
                        <!-- 渐变填充 -->
                        <i class="gradient" v-else :style="{background: gradient_string}"></i>
                    </button>
                    <div class="conv_list" v-if="['fill', 'gradient_fill', 'img_fill'].indexOf(pull_list_type) !== -1">
                        <div class="fill-panel-header">
                            <div class="fill-header-item" :class="{current: pull_list_type === 'fill'}" @click.stop="pull_module_toggle($event,'fill', {color: element_message.background, colorType: 'color'})">纯色填充</div>
                            <div class="fill-header-item" :class="{current: pull_list_type === 'gradient_fill'}" @click.stop="pull_module_toggle($event,  'gradient_fill', {color: element_message.background, colorType: 'gradient'})">渐变填充</div>
                            <div class="fill-header-item" :class="{current: pull_list_type === 'img_fill'}" @click.stop="pull_module_toggle($event,'img_fill')">图片填充</div>
                        </div>
                        <div class="fill-color-panel" ref="fill" v-if="pull_list_type === 'fill'"></div>
                        <div class="fill-gradient-panel" ref="gradient_fill" v-if="pull_list_type === 'gradient_fill'"></div>
                        <div class="fill-img-panel" ref="img_fill" v-if="pull_list_type === 'img_fill'">
                            <label class="fill-img-btn local-upload" for="back_img_upload">
                                <span>本地上传</span>
                                <input v-show="false" type="file" id="back_img_upload" @change="set_ele_backgroundImage($event.target)" accept="image/gif, image/jpeg, image/png, image/bmp, image/webp, image/svg+xml">
                            </label>
                            <button class="fill-img-btn material" @click="set_ele_backgroundImage('material')">
                                <span>素材库</span>
                            </button>
                            <div class="fill-image-type" v-if="element_type !== 'shape' && element_message.background.type === 'image'">
                                <div class="cover">
                                    <div class="check-box" :class="{current: element_message.background.image.type === 'cover'}" @click="change_ele_backgroundImage_size('cover')">
                                        <base-icon v-show="element_message.background.image.type === 'cover'" class="icondagou"></base-icon>
                                    </div>
                                    <span>铺满</span>
                                </div>
                                <div class="repeat">
                                    <div class="check-box" :class="{current: element_message.background.image.type === 'repeat'}" @click="change_ele_backgroundImage_size('repeat')">
                                        <base-icon v-show="element_message.background.image.type === 'repeat'" class="icondagou"></base-icon>
                                    </div>
                                    <span>平铺</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <!-- 画布对齐 -->
                <div class="ele_align_panel" v-if="tools_ele_align">
                    <button class="ele-align-btn"
                        :class="{'current': pull_list_type === 'ele_align', 'first': !element_message.group_has_text}"  
                        @click.stop="pull_module_toggle($event,'ele_align')"
                        v-tooltip="`画布对齐`">
                        <base-icon class="iconzuoduiqi1"></base-icon>
                    </button>
                    <div class="conv_list" ref="ele_align" v-if="pull_list_type === 'ele_align'">
                        <div class="align-title">画布对齐</div>
                        <div class="align-item"  v-for="item in group_align.conv_list" :key="item.name">
                            <div class="align-btn" v-tooltip="item.tip" @click="set_ele_align(item)">
                                <base-icon :class="item.icon"></base-icon>
                                <span>{{item.name}}</span>
                            </div>
                        </div>
                        
                    </div>
                </div>
                <!-- 表格边框样式 -->
                <div class="table_border_panel"  v-if="tools_table">
                    <button class="table-border-btn" v-tooltip="`边框样式`"
                        :class="{'current': pull_list_type === 'table_border'}"  
                        @click.stop="pull_module_toggle($event, 'table_border')">
                        <base-icon class="iconbianxiankuang"></base-icon>
                    </button>
                    <div class="conv_list" ref="table_border" v-if="pull_list_type === 'table_border'">
                        <div class="table_border_list">
                            <div class="icon-btn" 
                                v-for="(item, index) in table_border_style_list" 
                                :key="index"
                                v-tooltip="item.name" 
                                @click="set_table_border(item.data)"
                                v-bdtongji="'编辑器-快捷操作-表格边框样式-'+item.name"
                            >
                                <base-icon :class="item.icon"></base-icon>
                            </div>
                        </div>
                    </div>
                </div>
                <!-- 合并/拆分单元格 -->
                <button class="merge_cel_panel"  v-if="tools_table"
                    :class="{disable: !element_message.cel_option}"
                    v-tooltip="element_message.cel_option ? ( element_message.cel_option==='split_cel' ? '取消合并单元格' : '合并单元格') : ''" 
                    @click.stop="element_message.cel_option && $parent.select_table_row(element_message.cel_option)" 
                >
                    <base-icon class="iconchaifendanyuange" v-if="element_message.cel_option === 'split_cel'"></base-icon>
                    <base-icon class="iconhebingdanyuange" v-else></base-icon>
                </button>
                <!-- 下载图片 -->
                <button class="dowload-img"  v-if="element_type === 'img'"
                    v-tooltip="'下载图片'"
                    @click.stop="EditView.download_image('material')">
                    <base-icon class="iconxiazai1"></base-icon>
                </button>
                <!-- 组合/拆分 -->
                <button class="group-panel" v-tooltip="is_group?`拆分`:`组合`" @click.stop="set_ele_group" v-if="element_type === 'group'">
                    <base-icon class="iconjiekaizuhe" v-if="is_group"></base-icon>
                    <base-icon class="iconzuhe" v-else></base-icon>
                </button>
                <!-- 切换格式面板 -->
                <button class="toggle-panel" v-tooltip="`格式面板`" @click="toggleFormatPanel()">
                    <base-icon class="icongengduoanniu"></base-icon>
                </button>
            </div>
            <!-- 二级工具栏 -->
            <div class="more-tools-panel" v-else>
                <!-- 裁剪 -->
                <template v-if="show_clip_ratio">
                    <!-- 返回 -->
                    <button class="back" @click="toggle_clip_ratio()">
                        <base-icon class="iconfanhuijiantou"></base-icon>
                    </button>
                    <!-- 自由裁剪 -->
                    <button class="free" :class="{'current': clip_ratio === 'free'}" @click.stop="begin_image_clip(clip_ratio_style[0])">
                        <span>自由裁剪</span>
                    </button>
                    <!-- 形状裁剪 -->
                    <div class="shape">
                        <button class="shape-btn"
                            :class="{'current': pull_list_type === 'clip'}" 
                            @click.stop="pull_module_toggle($event,'clip')">
                            <span>形状裁剪</span>
                        </button>
                        <div class="conv_list" ref="clip" v-if="pull_list_type === 'clip'">
                            <ul>
                                <svg class="image_patten" viewBox="0 0 400 400">
                                    <pattern id="shape_crop_thumbnail" patternUnits="userSpaceOnUse" x="0" y="0" width="400" height="400">
                                        <image :href="clip_shape_image" :xlink:href="clip_shape_image" width="400" height="400"></image>
                                    </pattern>
                                </svg>
                                <li :class="{ 'skeleton':clip_image_load,  'current': element_message.clip_message.type === item.type}"
                                    v-for="(item, index) in clip_shape_list" 
                                    :key="index" 
                                    @click.stop="begin_image_clip(item)">
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" enable-background="new 0 0 400 400">
                                        <path :d="item.d"></path>
                                    </svg>
                                </li>
                                <li class="seat" v-for="v in 6" :key="v"></li>
                            </ul>
                        </div>
                    </div>
                    <!-- 比例裁剪 -->
                    <div class="scale">
                        <button class="scale-btn"
                            :class="{'current': pull_list_type === 'scale_clip', 'check': ['shape','free','circle'].indexOf(clip_ratio) < 0 && clip_ratio}" 
                            @click.stop="pull_module_toggle($event,'scale_clip')">
                            <span>比例裁剪</span>
                        </button>
                        <div class="conv_list" ref="scale_clip" v-if="pull_list_type === 'scale_clip'">
                            <ul>
                                <li v-for="(item, index) in clip_ratio_style.slice(3)" 
                                    :key="index"
                                    @click.stop="begin_image_clip(item)" 
                                    :class="{'current': clip_ratio === item.data, 'division': [1, 3/2].indexOf(item.data) >= 0}"
                                >
                                    <div class="icon">
                                        <i class="edit-ico" :class="`edit-ico-${item.class}`"></i>
                                    </div>
                                    <span>{{ item.name }}</span>
                                </li>
                            </ul>
                        </div>
                    </div>
                </template>
                <!-- 音频控件 -->
                <template v-if="show_audio_controls">
                    <!-- 返回 -->
                    <button class="back" @click="hideAudioControls()">
                        <base-icon class="iconfanhuijiantou"></base-icon>
                    </button>
                    <div class="audio-controls" ref="audio_controls"></div>
                </template>
            </div>
        </div>

        <!-- 通用下拉弹框 -->
        <!-- 字体 -->
        <text-family-panel ref="text_family" v-if="pull_list_type === 'text_family'" :element_message="element_message" @set_font_family="set_font_family"></text-family-panel>

        <!-- 字号 -->
        <transition name="modal-fade">
            <div class="module_list font_size_list" ref="text_size" v-if="pull_list_type === 'text_size'">
                <ul>
                    <li v-for="(item,index) in text_size_list"
                         :key="index"
                        :class="{'checked': element_message.size == item.name}"
                        @click.stop="set_font_size(item.name)"
                    >
                        <p>{{item.name}}</p>
                    </li>
                </ul>
            </div>
        </transition>
        <!-- 字体样式 -->
        <transition name="modal-fade">
            <div class="module_list text_list" 
                @click.stop
                :class="{'short': ['table','chart','shape','group'].indexOf(element_type) >= 0}"
                ref="text_art" 
                v-if="pull_list_type === 'text_art'">
                <!-- 普通文本 -->
                <p class="title">常用文本</p>
                <ul class="list_wrapper normal_list_wrapper">
                    <li class="normal" v-for="(item,index) in normal_material_list.normal" :key="index"
                        @click="change_text_style(item)"
                        :style="{fontSize:`${item.size / 3}px`, color:`${item.color}`, fontWeight:`${item.weight}`}" v-html="item.name">
                    </li>
                </ul>
                <!-- 艺术字 -->
                <p class="title" v-show="['table','chart','shape','group'].indexOf(element_type) < 0">艺术字</p>
                <ul class="list_wrapper art_list_wrapper" v-show="['table','chart','shape','group'].indexOf(element_type) < 0">
                    <li v-for="(item,index) in art_material_list" :key="index" @click="change_text_art(item)">
                        <img v-show="item.image" :src="item.image" alt="" />
                    </li>
                </ul>
            </div>
        </transition>
        <!-- 描边粗细 -->
        <transition name="modal-fade">
            <ul class="module_list border_weight_list"
                ref="line_weight" 
                v-if="pull_list_type === 'line_weight'" 
                @mouseenter="border_setting_toggle('line_weight')"
                @mouseleave="border_setting_toggle('line')"
            >
                <li v-for="(item,index) in line_weight_list" :key="index" @click.stop="set_ele_border_width(item.data)" :title="item.name" :class="{check:element_message.border_w == item.data}">
                    <span>{{item.data + '磅'}}</span>
                    <span :style="{height:item.style + 'px'}"></span>
                </li>
            </ul>
        </transition>
        <!-- 描边类型 -->
        <transition name="modal-fade">
            <ul class="module_list border_type_list"
                ref="line_type" 
                v-if="pull_list_type === 'line_type'"
            >
                <li class="no_border_s" :class="{'check':element_message.border_s === 'none'}" @click.stop="set_ele_border_style('none')">无边框</li>
                <li class="have_border_s" :class="{'check': element_message.border_s !== 'none'}" @click.stop="set_ele_border_style('solid')">纯色边框</li>
            </ul>
        </transition>

        <format-color ref="format_color"></format-color>
    </div>
</template>

<script>
    import baseSeekBar from '@/components/base/base-seek-bar.vue';
    import baseUnitInput from '@/components/base/base-unit-input.vue';
    import baseKnob from '@/components/base/base-knob.vue';
    import FormatColor from '@/views/pc/EditView/FormatColor.vue';
    import TextFamilyPanel from '@/views/pc/EditView/TextFamilyPanel.vue';
    import table_preset from '@/assets/pc/json/TablePreset.json'
    import {edit_shape_json, replace_shape_json, edit_update_point} from '@/assets/pc/js/opt/shape_edit_opt.js';
    import {line_marker_list} from '@/assets/pc/js/opt/line_edit_opt.js';
    import font_family_array from '@/assets/font/fontFamily.js';
    import opt_factory from '@/assets/pc/js/opt/opt_factory.js';
    import operate_opt from '@/assets/pc/js/opt/operate_opt.js';
    import editor_opt from '@/assets/pc/js/opt/editor.js';
    import page_opt from '@/assets/pc/js/opt/page_opt.js';
    import format_empty_svg from '@/assets/pc/images/edit/format_empty.svg';


    export default{
        components: {
            baseKnob,
            baseSeekBar,
            baseUnitInput,
            FormatColor,
            TextFamilyPanel,
        },
        inject: ['EditView'],
        props:[
            'element_type',
            'edit_mode',
            'is_group',
            'element_message',
            'user_disable',
            'show_left_modal',
        ],
        data(){
            return {
                /* 组件相关 start */
                show_format_panel: false,
                commonColor: '',
                gradientColor: '',
                pull_list_type: null,
                conv_list_show: false,
                /* 组件相关 end */

                /* 元素通用 start */
                input_focused_value: '',       // 输入框初始值存储
                seekbar_obj: {},               // 拖动条数据对象（element_type变化时获取数据）
                fill_type_list: [
                    {name:'无填充',   key:'transparent'},
                    {name:'纯色填充', key:'color'},
                    {name:'渐变填充', key:'gradient'},
                    {name:'图片填充', key:'image'},
                ],
                /* 元素通用 end */

                /* 形状相关 start */
                shape_type_list: replace_shape_json,
                recommend_shape_list: {},
                /* 形状相关 end */

                /* 表格相关 start */
                table_preset_list: table_preset.table_preset_list,
                table_border_style_list: [
                    {name: '所有边框', icon: 'iconsuoyouxiankuang', data: 'all'},
                    {name: '内部边框', icon: 'iconzhongxiankuang1', data: 'inside'},
                    {name: '水平边框', icon: 'iconshuipingkuangxian1', data: 'horizontal'},
                    {name: '垂直边框', icon: 'iconchuizhikuangxian1', data: 'vertical'},
                    {name: '外部边框', icon: 'iconbianxiankuang', data: 'outside'},
                    {name: '左侧边框', icon: 'iconzuokuangxian', data: 'left'},
                    {name: '顶部边框', icon: 'iconshangkuangxian', data: 'top'},
                    {name: '右侧边框', icon: 'iconyoukuangxian', data: 'right'},
                    {name: '底部边框', icon: 'iconxiakuangxian', data: 'bottom'},
                    {name: '无边框', icon: 'iconwuxiankuang', data: 'none'},
                ],
                /* 表格相关 end */

                /* 文本相关 start */
                text_link_flag: false,                                    // 文本超链接标识
                select_family_list_index: 0,                              // 筛选显示列表的下标
                text_size_list: [
                    {name: "6", data: "12"},
                    {name: "8", data: "16"},
                    {name: "10", data: "20"},
                    {name: "12", data: "24"},
                    {name: "14", data: "28"},
                    {name: "16", data: "32"},
                    {name: "18", data: "36"},
                    {name: "20", data: "40"},
                    {name: "24", data: "48"},
                    {name: "26", data: "52"},
                    {name: "28", data: "56"},
                    {name: "30", data: "60"},
                    {name: "32", data: "64"},
                    {name: "36", data: "72"},
                    {name: "40", data: "80"},
                    {name: "44", data: "88"},
                    {name: "48", data: "96"},
                    {name: "50", data: "100"},
                    {name: "54", data: "108"},
                    {name: "60", data: "120"},
                    {name: "68", data: "136"},
                    {name: "72", data: "144"},
                    {name: "80", data: "160"},
                    {name: "88", data: "176"},
                    {name: "90", data: "180"},
                    {name: "96", data: "192"},
                ],                                                        // 字号列表
                text_family_list:   font_family_array.family,             // font-family列表  -- 所有的
                art_material_list:  font_family_array.art,                // 艺术字素材列表
                filter_family_list: [],                                   // 筛选显示的font-family列表
                font_family_childrenList: [],                             // 显示的子字体列表
                text_family_list_show: 'family',                          // 字体下拉列表显示状态 family => 字体, art => 艺术字
                family_lately_use_list: [],                               // 最近字体使用列表
                family_childrenList_remove_timer: null,                   // 控制字体子列表显示或隐藏定时器
                family_childrenList_show: false,                          // 子列表显示 / 隐藏标识
                art_text_style: {},
                normal_material_list:{
                    'normal':[
                        {name:'大标题', content:'', key:'h1', size:64, weight:'bold', color:''},
                        {name:'小标题', content:'', key:'h2', size:48, weight:'bold', color:''},
                        {name:'正文', content:'', key:'body', size:32, weight:'normal', color:''},
                        {name:'正文（小）', content:'', key:'body_s', size:24, weight:'normal', color:''},
                        {name:'<span style="display:inline-block;width:34px;height:20px;line-height:20px;background:#67aafc">说明</span>', 
                            content:'<span style="background:#67aafc">说明</span>', key:'explain_fill', size:20, weight:'normal', color:'#ffffff'
                        },
                        {name:'<span style="display:inline-block;width:36px;height:18px;line-height:20px;border-bottom:1px solid #005bff;">超链接</span>', 
                            content:'', key:'link', size:20, weight:'normal', color:'#005bff', type:'link'
                        },
                        {name:'[注释]', content:'', key:'notes', size:20, weight:'normal', color:'#707b8e'},
                        {name:'警告', content:'', key:'warning', size:20, weight:'normal', color:'#ff0000'},
                    ],
                },

                // 无序列表
                text_unordered_list:[
                    {name: "圆形", icon:'iconwuxudayuandian', data: "disc"},
                    {name: "方形", icon:'iconwuxufangxing', data: "square"},
                    {name: "菱形", icon:'iconwuxulingxing', data: "diamond"},
                    {name: "镂空", icon:'iconkongfangxing', data: "square-box"},
                    {name: "打勾", icon:'iconwuxuxuanzhong', data: "hook"},
                    {name: "箭头", icon:'iconwuxujiantou', data: "arrow"},
                    {name: "圆点", icon:'iconwuxuxiaoyuandian', data: "spot"},
                ],
                // 有序列表
                text_ordered_list:[
                    {name: "阿拉伯", icon:'icon123', data: "decimal"},
                    {name: "中文", icon:'iconyiersan', data: "cjk-ideographic"},
                    {name: "大写字母", icon:'iconABC1', data: "upper-latin"},
                    {name: "小写字母", icon:'iconABC', data: "lower-latin"},
                    {name: "罗马", icon:'iconIII', data: "upper-roman"},
                ],
                // 无序、有序面板显示 ul =>　无序, ol => 有序
                text_list_panel_show: null,
                /* 文本相关 end */

                /* 图片相关 start */
                begin_clip: false,
                show_clip_ratio: false,
                clip_image_load: true,
                clip_ratio: null,
                clip_shape_image: '',
                clip_shape_list: opt_factory.init_opt('img').clip_shape,
                // 裁剪比例
                clip_ratio_style: [
                    { mode: 'free', name: '自由裁剪', data: 'free', },
                    { mode: 'circle', name: '圆形', data: 'circle', },
                    { mode: 'shape', name: '形状裁剪', data: 'shape', },
                    { mode: 'rule', name: '1:1', class: 'clip_1_1', data: 1, },
                    { mode: 'rule', name: '2:3', class: 'clip_2_3', data: 2/3, },
                    { mode: 'rule', name: '3:4', class: 'clip_3_4', data: 3/4, },
                    { mode: 'rule', name: '3:5', class: 'clip_3_5', data: 3/5, },
                    { mode: 'rule', name: '4:5', class: 'clip_4_5', data: 4/5, },
                    { mode: 'rule', name: '3:2', class: 'clip_3_2', data: 3/2, },
                    { mode: 'rule', name: '4:3', class: 'clip_4_3', data: 4/3, },
                    { mode: 'rule', name: '5:3', class: 'clip_5_3', data: 5/3, },
                    { mode: 'rule', name: '5:4', class: 'clip_5_4', data: 5/4, },
                    { mode: 'rule', name: '16:9', class: 'clip_16_9', data: 16/9, },
                    { mode: 'rule', name: '16:10', class: 'clip_16_10', data: 16/10, },
                ],
                /* 图片相关 end */

                /* 线条相关 start */
                line_weight_list: [
                    {name: "1", data: "1", style: "1"},
                    {name: "2", data: "2", style: "2"},
                    {name: "3", data: "3", style: "3"},
                    {name: "4", data: "4", style: "4"},
                    {name: "5", data: "5", style: "5"},
                    {name: "6", data: "6", style: "6"},
                    {name: "7", data: "7", style: "7"},
                    {name: "8", data: "8", style: "8"},
                    {name: "12", data: "12", style: "10"},
                    {name: "16", data: "16", style: "12"},
                    {name: "24", data: "24", style: "14"},
                ],
                line_style_style: {
                    normal:[
                        {name: "line1", data: 'solid'},
                        {name: "line2", data: 'dotted'},
                        {name: "line3", data: 'dashed'},
                    ],
                    special:[
                        {name: 'lin4', data: 'dashed1'},
                        {name: 'lin5', data: 'dashed2'},
                        {name: 'lin6', data: 'dashed3'},
                        {name: 'lin7', data: 'dashed4'},
                        {name: 'lin8', data: 'dashed5'},
                    ]
                },
                line_marker_list: line_marker_list,
                /* 线条相关 end */

                /* 组合相关 start */
                group_align:{
                    conv_list: [
                        {name:'左对齐', tip:'(Ctrl+Alt+ 1)', icon:'iconzuoduiqi1', i_bg:'horizontal_left', data: 'left', key: 'horizontal'},
                        {name:'右对齐', tip:'(Ctrl+Alt+ 3)', icon:'iconyouduiqi', i_bg:'horizontal_right', data: 'right', key: 'horizontal'},
                        {name:'水平居中', tip:'(Ctrl+Alt+ 2)', icon:'iconshuipingjuzhong', i_bg:'horizontal_center', data: 'center', key: 'horizontal'},
                        {name:'垂直居中', tip:'(Ctrl+Alt+ I)', icon:'iconchuizhijuzhong', i_bg:'vertical_middle', data: 'middle', key: 'vertical'},
                        {name:'顶对齐', tip:'(Ctrl+Shift+ U)', icon:'icondingduiqi', i_bg:'vertical_top', data: 'top', key: 'vertical'},
                        {name:'底对齐', tip:'(Ctrl+Alt+ 0)', icon:'icondiduiqi', i_bg:'vertical_bottom', data: 'bottom', key: 'vertical'},
                        {name:'水平等间距', tip:'', icon:'iconshuipingdengjianju', i_bg:'horizontal_deuce', data: 'deuce', key: 'horizontal'},
                        {name:'垂直等间距', tip:'', icon:'iconchuizhidengjianju', i_bg:'vertical_deuce', data: 'deuce', key: 'vertical'},
                    ],
                    format_list: [
                        {name:'左对齐', tip:'(Ctrl+Alt+ 1)', icon:'iconzuoduiqi1', i_bg:'horizontal_left', data: 'left', key: 'horizontal'},
                        {name:'水平居中', tip:'(Ctrl+Alt+ 2)', icon:'iconshuipingjuzhong', i_bg:'horizontal_center', data: 'center', key: 'horizontal'},
                        {name:'右对齐', tip:'(Ctrl+Alt+ 3)', icon:'iconyouduiqi', i_bg:'horizontal_right', data: 'right', key: 'horizontal'},
                        {name:'顶对齐', tip:'(Ctrl+Shift+ U)', icon:'icondingduiqi', i_bg:'vertical_top', data: 'top', key: 'vertical'},
                        {name:'垂直居中', tip:'(Ctrl+Alt+ I)', icon:'iconchuizhijuzhong', i_bg:'vertical_middle', data: 'middle', key: 'vertical'},
                        {name:'底对齐', tip:'(Ctrl+Alt+ 0)', icon:'icondiduiqi', i_bg:'vertical_bottom', data: 'bottom', key: 'vertical'},
                        {name:'水平等间距', tip:'', icon:'iconshuipingdengjianju', i_bg:'horizontal_deuce', data: 'deuce', key: 'horizontal'},
                        {name:'垂直等间距', tip:'', icon:'iconchuizhidengjianju', i_bg:'vertical_deuce', data: 'deuce', key: 'vertical'},
                    ]
                },
                /* 组合相关 end */

                /* 图表相关 start */
                chart_class: {
                    'bar': {
                        class: 'edit-ico-bar_V',
                        icon: 'icontiaoxingtu',
                        name: '柱状图',
                    },
                    'pie': {
                        class: 'edit-ico-pie',
                        icon: 'iconbingzhuangtu',
                        name: '饼状图',
                    },
                    'line': {
                        class: 'edit-ico-line',
                        icon: 'iconquxiantu',
                        name: '折线图',
                    },
                    'funnel': {
                        class: 'edit-ico-funnel',
                        icon: 'iconloudoutu',
                        name: '漏斗图',
                    },
                },                                 // 图表类
                chart_item_color_current: {},       // 当前需要调整颜色的图表项目 {color, index}
                /* 图表相关 end */

                /* 预置投影相关 start */
                shadow_list:[
                    {name:"1",box_shadow:"3px 3px 5px 0 rgba(0, 0, 0, 0.5)",shadow:{opacity:"50",blur:"14",distance:"3",rotate:"135"}},
                    {name:"2",box_shadow:"0 4px 5px 0 rgba(0, 0, 0, 0.5)",shadow:{opacity:"50",blur:"14",distance:"3",rotate:"180"}},
                    {name:"3",box_shadow:"-2px 4px 5px 0 rgba(0, 0, 0, 0.5)",shadow:{opacity:"50",blur:"14",distance:"3",rotate:"225"}},
                    {name:"4",box_shadow:"4px 1px 5px 0 rgba(0, 0, 0, 0.5)",shadow:{opacity:"50",blur:"14",distance:"3",rotate:"90"}},
                    {name:"5",box_shadow:"0 0 5px 0 rgba(0, 0, 0, 0.5)",shadow:{opacity:"50",blur:"14",distance:"0",rotate:"0"}},
                    {name:"6",box_shadow:"-4px 0 5px 0 rgba(0, 0, 0, 0.5)",shadow:{opacity:"50",blur:"14",distance:"3",rotate:"270"}},
                    {name:"7",box_shadow:"4px -2px 5px 0 rgba(0, 0, 0, 0.5)",shadow:{opacity:"50",blur:"14",distance:"3",rotate:"45"}},
                    {name:"8",box_shadow:"0 -3px 5px 0 rgba(0, 0, 0, 0.5)",shadow:{opacity:"50",blur:"14",distance:"3",rotate:"0"}},
                    {name:"9",box_shadow:"-4px -1px 5px 0 rgba(0, 0, 0, 0.5)",shadow:{opacity:"50",blur:"14",distance:"3",rotate:"315"}},
                ],
                /* 预置投影相关 end */

                /* 音频相关 */
                show_audio_controls: false,             // 音频控件显示状态
                audio_controls: null,                   // 音频控件类
                /* 音频相关 end*/

                /* 格式面板的显示状态 */
                /*  { layout: 位置大小, style: 文本格式, textAlign: 文本调整, 
                    appearance: 样式设置, editChart: 编辑图表, transparency: 透明度, 
                    audioSetup: 音频设置, videoSetup: 视频设置 } */
                formatShowStatus: {
                    // 文本
                    'text': {
                        layout: false,
                        style: true,
                        textAlign: true,
                        appearance: false,
                        transparency: false,
                    },
                    // 线条
                    'line': {
                        layout: false,
                        appearance: true,
                    },
                    // 形状
                    'shape': {
                        layout: true,
                        style: false,
                        textAlign: false,
                        appearance: true,
                        transparency: true,
                    },
                    // 表格
                    'table': {
                        layout: false,
                        style: false,
                        textAlign: false,
                        appearance: false,
                        transparency: false,
                    },
                    // 图表
                    'chart': {
                        layout: false,
                        style: false,
                        editChart: true,
                        transparency: false,
                    },
                    // 图片
                    'img': {
                        layout: true,
                        appearance: true,
                        transparency: true,
                    },
                    // 音频
                    'audio': {
                        audioSetup: true,
                    },
                    // 视频
                    'video': {
                        videoSetup: true,
                    },
                    // 组合
                    'group': {
                        layout: false,
                    }
                },

                format_clip_ratio_shape: false, // 图片 - 形状裁剪
                format_clip_ratio_scale: false, // 图片 - 比例裁剪
                /* 格式面板的显示状态 end */
                format_empty_svg, // 格式面板空状态svg
            }
        },
        computed:{
            // 当前艺术字图片筛选
            text_art_key: function () {
                let that = this;
                return that.art_material_list.filter(item => item.key === that.element_message.text_art_key)[0].image;
            },
            // 当前文字预设版式信息筛选
            text_preset_key: function(){
                let that = this;
                let normal = that.normal_material_list.normal.filter(item => item.key === that.element_message.text_preset_key);
                if(normal.length > 0) return normal[0];
            },
            // 面板渐变样式
            gradient_string: function(){
                return opt_factory.init_opt('group').gradient_obj_2_style(this.element_message.background.color);
            },
            // 格式面板标题
            format_title(){
                let title = '';
                let element_type = this.element_type;
                switch(element_type){
                    case 'text':
                        title = '文本';
                        break;
                    case 'shape':
                        title = '形状';
                        break;
                    case 'line':
                        title = '线条';
                        break;
                    case 'table':
                    case 'tab_cel':
                        title = '表格';
                        break;
                    case 'chart':
                        title = '图表';
                        break;
                    case 'img':
                        title = '图像';
                        break;
                    case 'audio':
                        title = '音频';
                        break;
                    case 'video':
                        title = '视频';
                        break;
                    case 'group':
                        title = '多选';
                        break;
                }
                return title;
            },
            // 当前元素类型的显示状态
            formatTypeStatus() {
                return this.formatShowStatus[this.element_type] || {};
            },
            // 工具栏-字体
            tools_font_family(){
                // 单选元素是否显示
                let is_el_correct = ['text', 'shape', 'table', 'tab_cel'].indexOf(this.element_type) !== -1;
                // 多选元素是否显示
                let is_group_correct = this.element_type === 'group' && this.element_message.group_has_text;
                return is_el_correct || is_group_correct;
            },
            // 工具栏-字号
            tools_font_size(){
                // 单选元素是否显示
                let is_el_correct = ['text', 'shape', 'table', 'tab_cel'].indexOf(this.element_type) !== -1;
                // 多选元素是否显示
                let is_group_correct = this.element_type === 'group' && this.element_message.group_has_text;
                return is_el_correct || is_group_correct;
            },
            // 工具栏-文字颜色
            tools_font_color(){
                // 单选元素是否显示
                let is_el_correct = ['text', 'shape', 'table', 'tab_cel'].indexOf(this.element_type) !== -1;
                // 多选元素是否显示
                let is_group_correct = this.element_type === 'group' && this.element_message.group_has_text;
                return is_el_correct || is_group_correct;
            },
            // 工具栏-文字样式
            tools_font_style(){
                // 单选元素是否显示
                let is_el_correct = ['text', 'shape', 'table', 'tab_cel'].indexOf(this.element_type) !== -1;
                // 多选元素是否显示
                let is_group_correct = this.element_type === 'group' && this.element_message.group_has_text;
                return is_el_correct || is_group_correct;
            },
            // 工具栏-文本对齐
            tools_align(){
                // 单选元素是否显示
                let is_el_correct = ['text', 'shape', 'table', 'tab_cel'].indexOf(this.element_type) !== -1;
                // 多选元素是否显示
                let is_group_correct = this.element_type === 'group' && this.element_message.group_has_text;
                return is_el_correct || is_group_correct;
            },
            // 工具栏-透明度
            tools_transparency(){
                // 单选元素是否显示
                let is_el_correct = ['text', 'shape'].indexOf(this.element_type) !== -1;
                // 多选元素是否显示
                let is_group_correct = this.element_type === 'group' && this.element_message.all_text;
                return is_el_correct || is_group_correct;
            },
            // 工具栏-边框
            tools_border(){
                return ['shape', 'table', 'tab_cel', 'img'].indexOf(this.element_type) !== -1;
            },
            // 工具栏-填充
            tools_fill(){
                // 单选元素是否显示
                let is_el_correct = ['shape', 'table', 'tab_cel'].indexOf(this.element_type) !== -1;
                // 多选元素是否显示
                let is_group_correct = this.element_type === 'group' && !this.element_message.all_text && this.element_message.group_has_text;
                return is_el_correct || is_group_correct;
            },
            // 工具栏-画布对齐
            tools_ele_align(){
                return ['group', 'table', 'tab_cel'].indexOf(this.element_type) !== -1;
            },
            // 工具栏-表格边框样式
            tools_table_border(){
                return ['table', 'tab_cel'].indexOf(this.element_type) !== -1
            },
            // 工具栏-表格边框样式/合并单元格
            tools_table(){
                return ['table', 'tab_cel'].indexOf(this.element_type) !== -1
            }
        },
        watch:{
            element_type:function(n, o){
                this.hide_all_list();
                this.show_clip_ratio = false;
                this.hideAudioControls();
            },
            show_format_panel(n){
                this.$nextTick(()=>{
                    let $ele = $('.page_contain .ele_item.checked');
                    // 重新计算画布缩放
                    page_opt.save_page_offset(this.EditView);
                    // 更新屏幕最佳比例
                    this.EditView.compute_suitable_scale();
                    // 重新选中
                    this.EditView.set_ele_checked($ele);
                });
            },
            element_message:{
                handler(value, old_message) {
                    // 更新拖拽组件数据
                    this.get_seekbar_data();
                },
                deep:true
            },
            pull_list_type(n, o) {
                // 字体下拉框展开 选中项显示在最前
                if (n === 'text_family') {
                    this.$nextTick(() => {
                        let $scroll = document.querySelector('.font-family-content');
                        if ($scroll) {
                            let top = $scroll.querySelector('.checked') ? $scroll.querySelector('.checked').offsetTop - 60 : 0;
                            $scroll.scrollTop = top;
                        }
                    });
                }
                // 字体大小下拉框展开 选中项显示在最前
                if (n === 'text_size'){
                    this.$nextTick(() => {
                        let $scroll = document.querySelector('.font_size_list');
                        let top = $scroll.querySelector('.checked') ? $scroll.querySelector('.checked').offsetTop - 60 : 0;
                        $scroll.scrollTop = top;
                    });
                }
                if (n == null) {
                    // 关闭操作栏列表
                    this.conv_list_show = false;
                    // 关闭序列表
                    this.text_list_panel_show = null;
                    // 关闭拾色器
                    this.commonColor.close();
                    // 关闭渐变弹框
                    this.gradientColor.close();
                    // 恢复选区
                    this.recover_text_selection();
                }
            },
            // 最近字体使用列表 监听
            family_lately_use_list: {
                handler(nArr) {
                    if(!Array.isArray(nArr) || nArr.length > 5) return;
                    localStorage.setItem('family_lately_use_list', JSON.stringify(nArr));
                },
                deep:true
            },
        },
        created () {
            let that = this;
            let font_array = opt_factory.init_opt('text').fn.clone_object(font_family_array);
                that.filter_family_list = font_array.family[0].item;
            // 整理内置形状列表
            let resource_recommend_shape = edit_shape_json || {};
            let recommend_shape_list = {};
            for (let item in resource_recommend_shape) {
                let material = resource_recommend_shape[item].material;
                let shape = resource_recommend_shape[item].shape;
                // 类型分类，有则直接push
                if (recommend_shape_list[material]) {
                    recommend_shape_list[material].push(shape);
                } else {
                    let material_arr = [];
                    material_arr.push(shape);
                    recommend_shape_list[material] = material_arr;
                }
            }
            that.recommend_shape_list = recommend_shape_list;
        },
        mounted(){
            const that = this;
            // 图片裁剪-裁剪框移动
            $("#clip_wrap").draggable({
                cancel: ".operate-rotate",
                scroll: true,
                containment: ".cropper",
                start: function (event, ui) {
                    that.pull_list_type = null;
                    $('.convformat_contain').hide();
                },
                drag: function (event, ui) {
                    // 实时更新裁剪框位置，但不更新图片位置
                    let $clip_path = $('#operate_clip_path');
                    $clip_path.attr({
                        'data-translate': `${ui.position.left},${ui.position.top}`,
                        'transform': `translate(${ui.position.left},${ui.position.top})`,
                    });
                },
                stop: function (event, ui) {
                    // 设置图片位置
                    let $ele = $('.page_contain .ele_item.checked'),
                        option = opt_factory.init_opt('img'),
                        param = ui.position;
                    option.clip_move($ele, param);
                    $('.convformat_contain').show();
                },
            });
            // 图片裁剪-裁剪框缩放
            $("#clip_wrap").resizable({
                handles: 'ne, se, sw, nw',
                containment: ".cropper",
                resize: function (event, ui) {
                    let $ele = $('.page_contain .ele_item.checked'),
                        option = opt_factory.init_opt('img'),
                        param = {
                            w: ui.size.width,
                            h: ui.size.height,
                            x: ui.position.left,
                            y: ui.position.top,
                        };
                    option.clip_scale($ele, param);
                    that.pull_list_type = null;
                }
            });

            that.commonColor = that.$refs.format_color;
            that.gradientColor = that.$parent.$refs.gradient_color;
            // 最近使用字体列表数据
            let family_lately_use_list = localStorage.getItem('family_lately_use_list');
            that.family_lately_use_list = JSON.parse(family_lately_use_list) || [];
        },
        methods:{
            // element_type 被选中，此组件面板显示
            show_up: function () {
                let that = this;
                that.$nextTick(() => {
                    that.chart_data_table();
                    // 音频试听 播放事件绑定
                    that.audio_try_play();
                });
            },
            // 格式面板模块显示状态切换
            toggleModule(moduleType) {
                let elementType = this.element_type;
                if(this.formatShowStatus[elementType]) {
                    this.formatShowStatus[elementType][moduleType] = !this.formatShowStatus[elementType][moduleType];
                }
            },
            /**
             * 其余功能方法
             */
            // 隐藏所有下拉框
            hide_all_list:function(){
                if (!this.commonColor.show_color_picker) {
                    this.pull_list_type = null;
                    // 文本元素相关
                    this.text_link_flag = false;
                    // 裁剪图片
                    this.begin_clip = false;
                    this.quitImageClip();
                    // 颜色相关
                    this.gradientColor.close();
                }
            },
            // 下拉模块列表点击事件 type=下拉列表类型 obj=列表设置选项
            pull_module_toggle: function(event, type, obj){
                let that = this;
                let $target = $(event.target);
                let $left_contain = $('.edit_right');
                let list_type = that.pull_list_type;
                let params = {
                    append: false,
                    color: null,
                    ref: null,
                    colorType: ''
                };
                params = Object.assign(params,obj);
                let is_common = params.append;
                let is_color = params.color || params.color == '';
                let is_ref = params.ref;
                // 面板是否在快捷工具栏打开的
                let is_conv = $target.parents('.convformat_contain').length;
                // 关闭颜色面板(除快捷面板内的边框粗细/样式外)
                if(!is_conv || ['line_weight','line_style'].indexOf(type) < 0){
                    this.commonColor.close();
                    this.gradientColor.close();
                }
                // 设置列表开启/关闭状态
                list_type = list_type === type ? null : type;
                that.pull_list_type = list_type;
                that.pull_list_type === 'clip' && that.get_clip_shape_image();
                that.$parent.show_right_menu = false;
                // 关闭状态阻止
                if(!list_type && that.conv_list_show === is_conv) return;
                that.conv_list_show = is_conv;
                that.$nextTick(() => {
                    let pullList = that.$refs[list_type];
                    if (pullList.$el) pullList = pullList.$el;
                    // 通用列表插入对应位置
                    if (is_common) {
                        $(event.target.offsetParent).append(pullList);
                    }
                    // 通用颜色面板插入对应位置
                    if(is_color){
                        let target = $(event.target.offsetParent);
                        let prepend = false;
                        if(['line', 'fill', 'gradient_fill'].indexOf(type) !== -1){
                            target = that.$refs[type];
                            prepend = !is_common;
                        }
                        if(is_ref){
                            target = that.$refs[is_ref];
                            prepend = !is_common;
                        }

                        if(params.colorType === 'gradient') {
                            that.gradientColor.show({
                                value: that.element_message.background.color,
                                $em: $(target),
                                click: (data) => {
                                    that.set_ele_background('gradient',data);
                                }
                            });
                        } else {
                            that.toggle_common_color({
                                target: target,
                                prepend: prepend,
                                value: params.color,
                                art_index: params.art_index
                            });
                        }
                    }
                    that.$nextTick(function(){
                        if(is_color) {
                            pullList = $('.conv_list')[0] || that.$refs[type] || $('.common_color')[0];
                        };
                        if(params.position_ref){
                            pullList = that.$refs[params.position_ref];
                        }
                        let windowW = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
                        let windowH = window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight;
                        let {width:listWidth, height:listHeight, top:listTop, left:listLeft} = pullList.getBoundingClientRect();
                        // 判断列表是否超出屏幕
                        if (listHeight + listTop > windowH || listWidth + listLeft > windowW) {
                            // 快捷操作栏
                            if(is_conv){
                                // 列表在上方时,超出屏幕大小
                                if (listTop < listHeight){
                                    // 上方距离小于下方距离
                                    if (listTop - 38 < windowH - listTop){
                                        if(['fill','line'].indexOf(type) >= 0){
                                            $(pullList).find('.common_color').css({
                                                'max-height': `${windowH - listTop - 100}px`,
                                                'overflow-y': 'scroll'
                                            });
                                        }else{
                                            $(pullList).css({
                                                'max-height': `${windowH - listTop}px`,
                                                'overflow-y': 'scroll'
                                            });
                                        }
                                    }else{
                                        if(['fill','line'].indexOf(type) >= 0){
                                            $(pullList).css({
                                                'top': `-${listTop - 38}px`,
                                            });
                                            $(pullList).find('.common_color').css({
                                                'max-height': `${listTop - 38 - 100}px`,
                                                'overflow-y': 'scroll'
                                            });
                                        }else{
                                            $(pullList).css({
                                                'top': `-${listTop - 38}px`,
                                                'max-height': `${listTop - 38}px`,
                                                'overflow-y': 'scroll'
                                            });
                                        }
                                    }
                                }else{
                                    $(pullList).css({
                                        'top': `-${listHeight + 5}px`
                                    });
                                }
                                
                                if(listLeft > windowW - listWidth){
                                    $(pullList).css({
                                        'left': `${pullList.offsetLeft + (windowW - listWidth - listLeft)}px`
                                    });
                                }
                            } else {
                                // 格式面板滚动条定位
                                let scrollTop = $target.offset().top + $left_contain.scrollTop();
                                let left_height = $left_contain[0].offsetHeight;
                                // 超出左侧栏
                                if (!is_color && (scrollTop + listHeight > left_height) && type !== 'shape_type'){
                                    $left_contain.animate({scrollTop: left_height}, 300);
                                    // 文字类型下拉高度428
                                    let text_height = 428 - (scrollTop + listHeight - left_height);
                                    $(pullList).css({
                                        'max-height': `${scrollTop + listHeight - left_height + text_height }px`,
                                        'overflow-y': 'scroll'
                                    });
                                }else{
                                    $left_contain.animate({scrollTop: scrollTop}, 300);
                                }
                            }
                        }
                    })
                });
            },
            // 切换格式面板
            toggleFormatPanel(){
                this.pull_list_type = null;
                this.show_format_panel = !this.show_format_panel;
            },

            /**
             * 拾色器功能方法
             */
            // 调用颜色选择器
            toggle_common_color: function(obj){
                let that = this;
                let params = {
                    taget: null,
                    value: '',
                    prepend: false,
                    art_index: null,
                };
                params = Object.assign(params, obj);
                if(!(params.target instanceof jQuery)){
                    params.target = $(params.target);
                }
                // 调用通用拾色器打开方法
                that.commonColor.show({
                    value: params.value,
                    $em: params.target,
                    prepend: params.prepend,
                    click: (data) => {
                        that.color_set_event(data,{art_index: params.art_index});
                        that.hide_all_list();
                    },
                    input: (color) => {
                        that.color_set_event(color);
                    }
                });
            },
            // 颜色设置事件分发
            color_set_event: function(data,params){
                let that = this;
                switch (that.pull_list_type) {
                    // 文本颜色
                    case 'text':
                        that.set_font_color(data);
                        break;
                    case 'hilite':
                        that.set_font_hilite(data);
                        break;
                    // 边框颜色
                    case 'line':
                        that.set_ele_border_color(data);
                        break;
                    // 阴影颜色
                    case 'shadow':
                        that.set_ele_shadow_color(data);
                        break;
                    // 元素背景色
                    case 'fill':
                        that.set_ele_background('color',data);
                        break;
                    // 图表项目主题色
                    case 'chart_item':
                        that.update_chart_theme(data);
                        break;
                    // 艺术字渐变色设置:
                    case 'gradient_before':
                        that.set_font_gradient(data);
                        break;
                    // 艺术字渐变色设置:
                    case 'gradient_after':
                        that.set_font_gradient(data);
                        break;
                    // 艺术字填充颜色
                    case 'fill_color':
                        that.set_art_text_style(data, 'fill_color');
                        break;
                    // 艺术字描边颜色
                    case 'stroke_color':
                        that.set_art_text_style(data, 'stroke_color');
                        break;
                    // 艺术字文本阴影颜色
                    case 'text_shadow_color':
                        that.set_art_text_style(data, 'shadow_color', params.art_index);
                        break;
                    default:
                        break;
                }
            },
            // 打开颜色面板
            openColorPanel(event, color) {
                switch(color.type){
                    case `color`:
                        this.pull_module_toggle(event, `fill`, {color, colorType: 'color'});
                        break;
                    case `gradient`:
                        this.pull_module_toggle(event, `gradient_fill`, {color, colorType: 'gradient'});
                        break;
                    case `image`:
                        this.pull_module_toggle(event,'img_fill');
                        break;
                }
            },
            
            // 输入框聚焦存储初始值
            input_focus_save: function(e){
                this.input_focused_value = e.target.value; 
            },
            // 通用方法输入框监听
            check_input_number:function(e,type){
                let that = this,
                    value = e.target.value,
                    $checked = $('.page_contain .ele_item.checked');
                if(isNaN(value) || value < 0){
                    that.$parent.element_message[type] = that.input_focused_value;
                    that.$toast('输入正确参数',800);
                    return false;
                }
            },
            // 按键监听
            key_up_input:function(e,type){
                let that = this,
                    key_code = e.keyCode;
                switch (key_code) {
                    case 13:
                        $(e.target).blur();
                        $(':focus').blur()
                        e.preventDefault();
                        break;
                    case 38:
                        switch (type) {
                            case 'width':
                                that.element_message.w = +that.element_message.w + 1;
                                that.set_ele_size();
                                break;
                            case 'height':
                                that.element_message.h = +that.element_message.h + 1;
                                that.set_ele_size();
                                break;
                            case 'x':
                                that.element_message.x = +that.element_message.x + 1;
                                that.set_ele_translate();
                                break;
                            case 'y':
                                that.element_message.y = +that.element_message.y + 1;
                                that.set_ele_translate();
                                break;
                            case 'rotate':
                                let rotate = +that.element_message.rotate;
                                rotate = rotate + 1 > 360 ? 1 : rotate + 1;
                                that.element_message.rotate = rotate;
                                that.set_ele_rotate();
                                break;
                            case 'shadow_rotate':
                                let shadow_rotate = +that.element_message.shadow.rotate;
                                shadow_rotate = shadow_rotate + 1 > 360 ? 1 : shadow_rotate + 1;
                                that.set_ele_shadow(shadow_rotate,'rotate');
                                break;
                            case 'line_height':
                                let line_height = +that.element_message.line_height + 0.1;
                                that.set_font_lineHeight(line_height);
                                break;
                            case 'letter_spacing':
                                let letter_spacing = +that.element_message.letter_spacing + 1;
                                that.set_font_spacing(letter_spacing);
                                break;
                            case 'border_w':
                                let border_width = +that.element_message.border_w + 1;
                                that.set_ele_border_width(border_width);
                                break;
                        }
                        break;
                    case 40:
                        switch (type) {
                            case 'width':
                                if (+that.element_message.w - 1 <= 0) {
                                    return;
                                }
                                that.element_message.w = +that.element_message.w - 1;
                                that.set_ele_size();
                                break;
                            case 'height':
                                if (+that.element_message.h - 1 <= 0) {
                                    return;
                                }
                                that.element_message.h = +that.element_message.h - 1;
                                that.set_ele_size();
                                break;
                            case 'x':
                                that.element_message.x = +that.element_message.x - 1;
                                that.set_ele_translate();
                                break;
                            case 'y':
                                that.element_message.y = +that.element_message.y - 1;
                                that.set_ele_translate();
                                break;
                            case 'rotate':
                                let rotate = +that.element_message.rotate;
                                rotate = rotate - 1 < 0 ? 360 : rotate - 1;
                                that.element_message.rotate = rotate;
                                that.set_ele_rotate();
                                break;
                            case 'shadow_rotate':
                                let shadow_rotate = +that.element_message.shadow.rotate;
                                shadow_rotate = shadow_rotate - 1 < 0 ? 360 : shadow_rotate - 1;
                                that.element_message.shadow.rotate = shadow_rotate;
                                that.set_ele_shadow(shadow_rotate,'rotate');
                                break;
                            case 'line_height':
                                let line_height = +that.element_message.line_height - 0.1;
                                that.set_font_lineHeight(line_height);
                                break;
                            case 'letter_spacing':
                                let letter_spacing = +that.element_message.letter_spacing - 1;
                                that.set_font_spacing(letter_spacing);
                                break;
                            case 'border_w':
                                let border_width = +that.element_message.border_w - 1;
                                that.set_ele_border_width(border_width);
                                break;
                        }
                        break;
                }
                return;
            },
            // 箭头按键增减
            change_message:function(event, name, type){
                let that = this;
                switch (name) {
                    case 'width':
                        if(type === 'add'){
                            that.element_message.w = +that.element_message.w + 1;
                        }
                        if(type === 'cut'){
                            if (+that.element_message.w - 1 <= 0) {
                                return;
                            }
                            that.element_message.w = +that.element_message.w - 1;
                        }
                        that.set_ele_size();

                        break;
                    case 'height':
                        if(type === 'add'){
                            that.element_message.h = Number(that.element_message.h) + 1;
                        }
                        if(type === 'cut'){
                            if (Number(that.element_message.h) - 1 <= 0) {
                                return;
                            }
                            that.element_message.h = Number(that.element_message.h) - 1;
                        }
                        that.set_ele_size();

                        break;
                    case 'x':
                        if(type === 'add'){
                            that.element_message.x = Number(that.element_message.x) + 1;
                        }else{
                            that.element_message.x = Number(that.element_message.x) - 1;
                        }
                        that.set_ele_translate();
                        break;
                    case 'y':
                        if(type === 'add'){
                            that.element_message.y = Number(that.element_message.y) + 1;
                        }else{
                            that.element_message.y = Number(that.element_message.y) - 1;
                        }
                        that.set_ele_translate();
                        break;
                    case 'rotate':
                        let rotate = Number(that.element_message.rotate);
                        if(type === 'add'){
                            rotate = rotate + 1 > 360 ? 1 : rotate + 1;
                        }else{
                            rotate = rotate - 1 < 0 ? 360 : rotate - 1;
                        }
                        that.element_message.rotate = rotate;
                        that.set_ele_rotate();
                        break;
                    case 'line_h':
                        let line_h = Number(that.element_message.column_height);
                        if(type === 'add'){
                            line_h ++;
                        }else{
                            line_h = line_h - 1 < 0 ? 0 : line_h - 1;
                        }
                        that.element_message.column_height = line_h;
                        that.set_line_h(line_h);
                        break;
                    case 'row_w':
                        let row_w = Number(that.element_message.row_width);
                        if(type === 'add'){
                            row_w ++;
                        }else{
                            row_w = row_w - 1 < 0 ? 0 : row_w - 1;
                        }
                        that.element_message.row_width = row_w;
                        that.set_row_w(row_w);
                        break;
                    case 'border_w':
                        let border_w = Number(that.element_message.border_w);
                        if (type === 'add') {
                            border_w = border_w + 1 > 24 ? 24 : border_w + 1;
                        } else {
                            border_w = border_w -1 < 0 ? 0 : border_w - 1;
                        }
                        that.element_message.border_w = border_w;
                        that.set_ele_border_width(border_w);
                        break;
                    case 'border_o':
                        let border_o = Number(that.element_message.border_o);
                        if (type === 'add') {
                            border_o = border_o + 1 > 100 ? 100 : border_o + 1;
                        } else {
                            border_o = border_o - 1 < 0 ? 0 : border_o - 1;
                        }
                        that.element_message.border_o = border_o;
                        that.set_ele_border_opacity(border_o);
                        break;
                }
            },
            // 获取拖拽条数据（在挂载时无法获取数据）
            get_seekbar_data: function(){
                let that = this;
                let message = that.element_message;
                that.seekbar_obj = {
                    opacity:{
                        value: message.opacity,
                        callback: (data) => that.set_ele_opacity(data)
                    },
                    border_opacity:{
                        value: message.border_o,
                        callback: (data) => that.set_ele_border_opacity(data)
                    },
                    border_width:{
                        // 最大 24
                        value: Number(message.border_w)  * (100 / 24),
                        callback: (data) => that.set_ele_border_width(data * (24 / 100))
                    },
                    shadow_opacity:{
                        value: message.shadow ? message.shadow.opacity : '',
                        callback: (data) => that.set_ele_shadow(data,'opacity')
                    },
                    shadow_blur:{
                        unit: 'pound',
                        value: message.shadow ? message.shadow.blur : '',
                        callback: (data) => that.set_ele_shadow(data,'blur')
                    },
                    shadow_distance:{
                        unit: 'pound',
                        value: message.shadow ? message.shadow.distance : '',
                        callback: (data) => that.set_ele_shadow(data,'distance')
                    },
                    letter_space:{
                        // 字间距范围 (-50, 200)
                        value: (Number(message.letter_spacing) + 50) / 2.5,
                        callback: data => that.set_font_spacing(data * 2.5 - 50)
                    },
                    line_height:{
                        // 行高范围 (0, 20)
                        value: Number(message.line_height) * 5,
                        callback: data => that.set_font_lineHeight(data / 5)
                    }
                };
                // 艺术字相关属性
                let $text = $('.page_contain .ele_item.checked').find('.show_text');
                if(that.element_message.text_type === 'art'){
                    that.art_text_style = {
                        // 背景尺寸
                        bg_size:{
                            // unit: 'percent',
                            art_text: true,
                            value: message.bg_size,
                            // title: '背景尺寸',
                            callback: (data) => that.set_art_text_style(data, 'bg_size')
                        },
                        // 描边粗细
                        stroke_width:{
                            // unit: 'pound',
                            art_text: true,
                            value: message.text_stroke_width,
                            // title: '描边粗细',
                            callback: (data) => that.set_art_text_style(data, 'stroke_width')
                        },
                        // 描边颜色
                        text_stroke_color: message.text_stroke_color,
                        // 填充颜色
                        text_fill_color: message.text_fill_color,
                        // 文本阴影
                        text_shadow: message.art_text_shadow,
                        // 阴影颜色
                        text_shadow_color: message.text_shadow_color
                    }
                }
            },
            
            /**
             * 元素通用功能方法
             */
            // 快捷操作边框设置下拉框展示/隐藏
            border_setting_toggle: function(type){
                if (!this.conv_list_show) return;
                this.pull_list_type = type;
            },
            // 设置元素组合 || 拆分
            set_ele_group: function(){
                let that = this,
                    option = opt_factory.init_opt('group'),
                    $ele = $('.page_contain .ele_item.checked');
                // 设置组合
                that.$parent.is_group = !that.$parent.is_group;
                option.toggle_group($ele);
                // 更新虚线框
                operate_opt.reset_rect($ele);
                //拆分后，取消选中
                if(!that.$parent.is_group){
                    that.$parent.ele_cancel_checked();
                    // 拆分成功时toast提示
                    that.$toast('拆分成功',800);
                }else{
                    // 组合成功时toast提示
                    that.$toast('组合成功',800);
                }
            },
            // 设置元素对齐
            set_ele_align: function(item){
                let that = this;
                let option = opt_factory.init_opt('group');
                let $ele = option.get_checked_element().element;
                that.hide_all_list();
                let data = item.data;
                if ($ele.length === 1 && data === 'deuce') {
                    data = 'center&middle';
                }
                // 元素水平对齐
                if (item.key === 'horizontal') {
                    option.hor_align(data);
                }
                // 元素竖直对齐
                if (item.key === 'vertical'){
                    option.ver_align(data);
                }
                operate_opt.reset_rect($ele);
                // 更新message位置
                let result = option.get_common_message($ele);
                that.$set(that.element_message, 'x', result.x);
                that.$set(that.element_message, 'y', result.y);
            },
            // 设置线条宽度
            set_ele_border_width: function(data){
                let that = this,
                    $checked = $('.page_contain .ele_item.checked');
                data = Math.floor(data * 10) / 10;
                data = data >= 24 ? 24 : data;
                // 遍历选中元素
                $checked.each(function(){
                    let $ele = $(this),
                        type = $ele.attr('data-type'),
                        option = opt_factory.init_opt(type);
                    switch (type){
                        case 'text':
                            option.set_border_width($ele, data);
                            // 同步内容尺寸
                            that.$parent.element_message.h = opt_factory.init_opt('text').set_ele_sync_content($ele);
                            break;
                        case 'shape':
                            option.set_border_width($ele, data);
                            that.$parent.element_message.border_s = option.get_edit_message($ele).border_s;
                            break;
                        case 'img':
                            option.set_border_width($ele, data);
                            break;
                        case 'line':
                            option.set_border_width($ele, data);
                            break;
                        case 'table':
                            option.set_border_width($ele, data);
                            option.table_edit_listener($ele);
                            break;
                    }
                });
                let color_history = JSON.parse(localStorage.getItem("color_history")) || [];
                // 最近使用过颜色、边框颜色为透明且不是多选状态下
                if(color_history.length > 0 && that.element_message.border_c === 'transparent' && $checked.length === 1){
                    that.set_ele_border_color(color_history[0]);
                }
                // 更新虚线框
                operate_opt.reset_rect($checked);
                // 更新左侧栏数据
                that.$parent.element_message.border_w = data;
            },
            // 设置线条样式
            set_ele_border_style: function(data){
                let that = this,
                    $checked = $('.page_contain .ele_item.checked');
                // 隐藏其他下拉框
                that.hide_all_list();
                // 遍历选中元素
                $checked.each(function(){
                    let $ele = $(this),
                        type = $ele.attr('data-type'),
                        option = opt_factory.init_opt(type);
                    if (['line', 'shape', 'image'].indexOf(that.$parent.element_type) >= 0 
                    && ['solid', 'none'].indexOf(data) < 0 && that.$parent.element_message.border_w <= 1) {
                        option.set_border_width($ele, 2);
                    }
                    switch (type){
                        case 'text':
                            option.set_border_style($ele, data);
                            break;
                        case 'shape':
                            option.set_border_style($ele, data);
                            break;
                        case 'img':
                            option.set_border_style($ele, data);
                            break;
                        case 'line':
                            option.set_border_style($ele, data);
                            break;
                        case 'table':
                            option.set_border_style($ele, data);
                            break;
                    }
                    if(data === 'none') {
                        that.$parent.element_message.border_c = 'transparent';
                    }else{
                        that.$parent.element_message.border_c = option.get_edit_message($checked).border_c;
                    }
                    that.$parent.element_message.border_w = option.get_edit_message($checked).border_w;
                });
                // 更新虚线框
                operate_opt.reset_rect($checked);
                // 更新左侧栏数据
                that.$parent.element_message.border_s = data;
            },
            // 设置线条颜色
            set_ele_border_color: function(data){
                let that = this,
                    $checked = $('.page_contain .ele_item.checked');
                if(data !== 'transparent' && that.$parent.element_message.border_s === 'none') that.$parent.element_message.border_s = 'solid';
                // 遍历选中元素
                $checked.each(function(){
                    let $ele = $(this),
                        type = $ele.attr('data-type'),
                        option = opt_factory.init_opt(type);
                    switch (type){
                        case 'text':
                            option.set_border_color($ele, data);
                            break;
                        case 'shape':
                            option.set_border_color($ele, data);
                            break;
                        case 'img':
                            option.set_border_color($ele, data);
                            break;
                        case 'line':
                            option.set_border_color($ele, data);
                            break;
                        case 'table':
                            option.set_border_color($ele, data);
                            break;
                    }
                });
                // 更新虚线框
                operate_opt.reset_rect($checked);
                // 更新左侧栏数据
                that.$parent.element_message.border_c = data === 'none' ? 'transparent' : data;
            },
            // 设置线条透明度
            set_ele_border_opacity: function(data){
                let that = this,
                    $checked = $('.page_contain .ele_item.checked');
                // 遍历选中元素
                $checked.each(function(){
                    let $ele = $(this),
                        type = $ele.attr('data-type'),
                        option = opt_factory.init_opt(type);
                    option.set_border_opacity($ele, data);
                });
                // 更新虚线框
                operate_opt.reset_rect($checked);
                // 更新左侧栏数据
                that.$parent.element_message.border_o = data;
            },
            // 设置元素 纯色/渐变/图片 填充
            set_ele_background: function(type, data){
                let that = this,
                    $checked = $('.page_contain .ele_item.checked');
                // 设置初始值
                if(!data){
                    if(type === that.element_message.background.type && that.element_message.background.color !== 'transparent') return;
                    switch (type) {
                        case 'color':
                            if(that.element_message.background.type !== 'color' || that.element_message.background.color === 'transparent'){
                                data = '#42464b'
                            }
                            break;
                        case 'gradient':
                            if(that.element_message.background.type !== 'gradient'){
                                data = {
                                    type: 'linear',
                                    rotate: that.element_type === 'shape' ? 0 : 90,
                                    direction: {},
                                    code: [{color:'#ffffff',offset:0,opacity:100},{color:'#000000',offset:100,opacity:100}],
                                    graStr: 'linear-gradient(90deg, rgb(255, 255, 255) 0%, rgb(0, 0, 0) 100%)'
                                }
                            }
                            break;
                        case 'image':
                            // 调起素材库
                            return that.set_ele_backgroundImage('material');
                            break;
                        default:
                            type = 'color';
                            data = 'transparent';
                            break;
                    }
                }
                data = {
                    type: type,
                    color: type === 'image' ? '#000000' : data,
                    image: type === 'image' ? data : null
                }
                // 遍历选中元素
                $checked.each(function(){
                    let $ele = $(this),
                        ele_type = $ele.attr('data-type'),
                        option = opt_factory.init_opt(ele_type);
                    if(['chart', 'img', 'video', 'audio'].indexOf(ele_type) < 0) option.set_background($ele, data);
                    // 更新数据
                    let {border_s, border_o} = option.get_edit_message($ele);
                    that.$parent.element_message.border_s = border_s;
                    that.$parent.element_message.border_o = border_o;
                });
                // 更新左侧栏数据
                that.$parent.element_message.background = data;
                // 当格式面板隐藏时，点击快捷操作面板的渐变和图片填充，直接唤起格式面板并定位至填充位置
                if(['image'].indexOf(type) >= 0 && !that.show_format_panel){
                    // 唤起填充面板
                    that.$parent.toggle_format_panel();
                    setTimeout(() => {
                        let top = document.getElementById('fill_panel').offsetTop - 60;
                        $('.format_panel_body').scrollTop(top);
                    }, 16)
                }
            },
            // 设置元素图片填充
            set_ele_backgroundImage: function(param){
                if(param === 'material'){
                    this.$parent.$refs.material_library.images_operation_state_open('background_src');
                }else{
                    this.$parent.upload_img(param.files, 'change_ele_background');
                    $(param).val('');
                }
            },
            // 设置元素图片填充类型
            change_ele_backgroundImage_size: function(item){
                let that = this;
                let $checked = opt_factory.init_opt('group').get_checked_element().element;
                let data = '';
                // 遍历选中元素
                $checked.each(function(){
                    let $ele = $(this);
                    let ele_type = $ele.attr('data-type');
                    let option = opt_factory.init_opt(ele_type);
                    data = option.get_edit_message($(this)).background;
                    data.image.type = item;
                    option.set_background($(this), data);
                });
                // 更新左侧栏数据
                that.$parent.element_message.background.image.type = item;
            },
            // 设置元素透明度
            set_ele_opacity: function(val){
                if(parseFloat(val) > 100) val = 100;
                if(parseFloat(val) < 0) val = 0;
                let that = this,
                    option = opt_factory.init_opt('group'),
                    $ele = $('.page_contain .ele_item.checked');
                that.seekbar_obj['opacity'].value = val;
                let data = (val / 100).toFixed(2);
                if($ele.length <= 0) return false;
                option.set_opacity($ele, data);
                that.$parent.element_message.opacity = (data * 100).toFixed(0);
            },
            // 设置元素大小
            set_ele_size: function(){
                let that = this;
                let option = opt_factory.init_opt('group');
                let get_checked = option.get_checked_element();
                let $checked = get_checked.element;
                let size_w = that.element_message.w;
                let size_h = that.element_message.h;
                // 组合元素
                if (get_checked.type === 'group') {
                    option.set_group_size($checked, {w: size_w, h: size_h});
                } else {
                    option = opt_factory.init_opt(get_checked.type);
                    option.set_size($checked, {w: size_w, h: size_h});
                    // 文本情况需判断最小值
                    if (get_checked.type === 'text') {
                        let ele_min = option.compute_min_size($checked);
                        if (size_w < ele_min.w) {
                            that.element_message.w = size_w = ele_min.w;
                        }
                    }
                }
                // 更新组合单选虚线框
                if ($checked.length === 1 && get_checked.group) {
                    let $group = get_checked.group;
                    operate_opt.set_group_operate($group);
                }
                // 更新虚线框
                operate_opt.reset_rect($checked);
            },
            // 设置元素定位
            set_ele_translate: function(){
                let that = this;
                let option = opt_factory.init_opt('group');
                let get_checked = option.get_checked_element();
                let $checked = get_checked.element;
                let x = that.element_message.x;
                let y = that.element_message.y;
                // 组合元素
                if (get_checked.type === 'group') {
                    option.set_group_translate($checked, x, y);
                } else {
                    option = opt_factory.init_opt(get_checked.type);
                    option.set_translate($checked, x, y);
                }
                // 更新虚线框
                operate_opt.reset_rect($checked);
            },
            // 设置元素旋转
            set_ele_rotate: function(data){
                let that = this,
                    $checked = $('.page_contain .ele_item.checked'),
                    $operate = $('.operate'),
                    type = $checked.attr('data-type'),
                    group_opt = opt_factory.init_opt('group'),
                    value = parseFloat(data || that.element_message.rotate);
                if(data) value = (Number(data) + Number(that.element_message.rotate)) >= 360 ?  360 - (Number(data) + Number(that.element_message.rotate)) : Number(data) + Number(that.element_message.rotate);
                if(value < 0) value = 360 + value;
                // 单选情况
                if($checked.length === 1){
                    // 设置元素旋转
                    group_opt.set_rotate($checked, value % 360);
                    // 更新虚线框
                    operate_opt.reset_rect($checked);
                }
                // 多选情况
                else if($checked.length > 1){
                    let operate_rect = operate_opt.get_inside_rect(),
                        page_rect = group_opt.window_2_page_offset(operate_rect, true).normal,
                        operate_middle = {
                            x: page_rect.x + (page_rect.w / 2),
                            y: page_rect.y + (page_rect.h / 2)
                        };
                    // 判断为初次旋转 -> 记录初始旋转值
                    if(operate_rect.rotate <= 0){
                        $checked.each(function(){
                            let $ele = $(this),
                                rotate = group_opt.get_transform($ele, 'rotate');
                            $ele.attr('data-rotate', rotate[0]);
                        });
                    }
                    // 遍历元素
                    $checked.each(function(){
                        let $ele = $(this),
                            ele_transform = group_opt.get_transform($ele),
                            ele_translate = ele_transform.translate,
                            ele_rotate = Number(ele_transform.rotate[0]),
                            ele_w = group_opt.compute_ele_offset($ele).page.w,
                            ele_h = group_opt.compute_ele_offset($ele).page.h,
                            ele_middle = {
                                x: Number(ele_translate[0]) + ele_w / 2,
                                y: Number(ele_translate[1]) + ele_h / 2
                            },
                            o_rotate = Number($ele.attr('data-rotate')),
                            n_rotate = (o_rotate + value) % 360,
                            point_deg = value + o_rotate - ele_rotate,
                            n_middle = group_opt.fn.after_rotate_point(ele_middle, operate_middle, point_deg),
                            n_x = n_middle.x - ele_w / 2,
                            n_y = n_middle.y - ele_h / 2;
                        // 设置元素旋转
                        group_opt.set_rotate($ele, n_rotate);
                        // 设置元素定位
                        group_opt.set_translate($ele, n_x, n_y);
                    });
                    // 更新虚线框旋转
                    operate_opt.set_operate_rotate($operate, {width: operate_rect.width, height: operate_rect.height, rotate: value});
                }
                // 更新左侧栏数据
                that.$parent.element_message.rotate = value;
            },
            // 设置元素镜像翻转
            set_ele_reversal: function(value){
                let that = this;
                let group_opt = opt_factory.init_opt('group');
                let ver = value === 'vertical';
                let hor = value === 'horizontal';
                let set = function ($ele) {
                    let type = $ele.attr('data-type');
                    let option = opt_factory.init_opt(type);
                    switch (type) {
                        case 'text':
                            //文本元素在PPT里无法镜像翻转，这里特殊处理一下仅平面翻转
                            let minus_rotate = Number(that.element_message.rotate);
                            let taget_rotate = minus_rotate;
                            // 垂直翻转
                            if (ver) {
                                if (minus_rotate <= 180) {
                                    taget_rotate = 180 - minus_rotate * 2;
                                } else {
                                    taget_rotate = 360 - minus_rotate * 2 + 180;
                                }
                            }
                            // 水平翻转
                            if (hor) {
                                taget_rotate = 360 - minus_rotate * 2;
                            }
                            that.set_ele_rotate(taget_rotate);
                            break;
                        case 'shape':
                            option.set_reversal($ele, value);
                            break;
                        case 'img':
                            option.set_reversal($ele, value);
                            break;
                    }
                }
                // 组合元素翻转需要修改元素位置，对称点为组合矩形中心点
                let checked_element = group_opt.get_checked_type_element();
                checked_element.format.forEach($ele => {
                    let is_group = $ele.length > 1;
                    // 组合元素，需相对组合矩形中心点翻转位置
                    if ($ele.length > 1) {
                        let group_rect = group_opt.compute_ele_seat($ele).page;
                        let group_point_x = group_rect.w / 2 + group_rect.x;
                        let group_point_y = group_rect.h / 2 + group_rect.y;
                        $ele.each((i, ele) => {
                            let _$ele = $(ele);
                            let ele_rect = group_opt.compute_ele_offset(_$ele).page;
                            let x = ele_rect.x;
                            let y = ele_rect.y;
                            if (hor) {
                                let ele_point_x = ele_rect.w / 2 + ele_rect.x;
                                x = x + (group_point_x - ele_point_x) * 2;
                            }
                            if (ver) {
                                let ele_point_y = ele_rect.h / 2 + ele_rect.y;
                                y = y + (group_point_y - ele_point_y) * 2;
                            }
                            group_opt.set_translate(_$ele, x, y);
                            set(_$ele);
                        });
                    } else {
                        // 单元素正常翻转
                        set($ele);
                    }
                });
                // 更新虚线框
                operate_opt.reset_rect(checked_element.origin);
            },
            // 设置预置投影类型
            set_shadow:function (data) {
                let that = this,
                    $ele = $('.page_contain .ele_item.checked'),
                    ele_type = $ele.attr('data-type'),
                    option = opt_factory.init_opt(ele_type);
                let obj = data.shadow;
                obj.open = true;
                obj.color = '#000000';
                // 更新左侧栏数据
                that.$set(that.element_message, 'shadow', obj);
                option.set_shadow($ele,that.element_message.shadow);                
            },
            // 设置元素阴影
            set_ele_shadow: function(value,type){
                let that = this;
                let $ele = opt_factory.init_opt('group').get_checked_element().element;
                if(!value) value = 0;
                // 数据预处理
                if(that.element_message.shadow.color === 'transparent' && value !== 0){
                    that.element_message.shadow.color = '#000000';
                }
                switch (type) {
                    case 'open':
                        let param = that.element_message.shadow;
                        let obj = that.shadow_list[4].shadow;
                        obj.color = '#000000';
                        obj.open = value;
                        // 更新左侧栏数据
                        Object.assign(that.element_message.shadow,obj);
                        break;
                    case 'distance':
                        that.element_message.shadow.distance = value;
                        break;
                    case 'rotate':
                        value = value > 360 ? value - 360 : value;
                        value = value < 0 ? 360 + value : value;
                        that.element_message.shadow.rotate = value;
                        break;
                    case 'opacity':
                        value = (value / 100).toFixed(2);
                        that.element_message.shadow.opacity = (value * 100).toFixed(0);
                        break;
                    case 'blur':
                        // 更新左侧栏数据
                        that.element_message.shadow.blur = value;
                        break;
                };
                $ele.each(function(){
                    let ele_type = $(this).attr('data-type');
                    let option = opt_factory.init_opt(ele_type);
                    option.set_shadow($(this),that.element_message.shadow);
                })
            },
            // 监控渐变角度合法性
            check_shadow_rotate: function(e){
                if(e.target.value < 0){
                    this.$parent.element_message.shadow.rotate = 0;
                }else if(e.target.value > 365){
                    this.$parent.element_message.shadow.rotate = 365;
                }
            },
            // 设置元素投影颜色
            set_ele_shadow_color: function(data){
                let that = this;
                if(!that.element_message.shadow.open){
                    that.set_ele_shadow(true, 'open');
                }
                let $ele = $('.page_contain .ele_item.checked');
                let ele_type = $ele.attr('data-type');
                let option = opt_factory.init_opt(ele_type);
                let obj = JSON.parse(JSON.stringify(that.element_message.shadow));
                obj.color = data;
                
                // 数据预处理
                if(data !== 'transparent' && obj.distance == 0 && obj.blur == 0){
                    obj.distance = 8;
                    obj.blur = 6;
                    obj.rotate = 60;
                }else if(data === 'transparent'){
                    obj.distance = 0;
                    obj.blur = 0;
                    obj.rotate = 0;
                }
                // 更新左侧栏数据
                that.$set(that.element_message, 'shadow', obj);
                // 设置投影
                option.set_shadow($ele,obj);
            },
            // 设置圆角矩形圆角度
            set_rect_fillet: function () {
                let that = this;
                let shape_edit = edit_shape_json[that.element_message.support_edit];
                let int_fillet_val = Math.floor(that.element_message.rect_fillet_max);
                if (shape_edit) {
                    let $ele = $('.page_contain .ele_item.checked');
                    let $path = $ele.find('.ele_scale path')[0];
                    let $clipPath = $ele.find('clipPath path')[0];
                    let d = $path.getAttribute('d');
                    let info = shape_edit.getPath(d);
                    let min = info.w < info.h ? info.w : info.h;
                    // 超过最大 或 最小值
                    if (int_fillet_val > min / 2) {
                        int_fillet_val = min / 2;
                    }
                    if (int_fillet_val < 0) {
                        int_fillet_val = 0;
                    }
                    // 更改之前的形状 4个角如果全为0，再次设置则设置4个角，否则只设置存在圆角的角
                    let r1 = !!info.r1 ? int_fillet_val : 0;
                    let r2 = !!info.r2 ? int_fillet_val : 0;
                    let r3 = !!info.r3 ? int_fillet_val : 0;
                    let r4 = !!info.r4 ? int_fillet_val : 0;
                    if (r1 === 0 && r2 === 0 && r3 === 0 & r4 === 0) {
                        r1 = int_fillet_val;
                        r2 = int_fillet_val;
                        r3 = int_fillet_val;
                        r4 = int_fillet_val;
                    }
                    let new_d = shape_edit.setPath(info.w, info.h, r1, r2, r3, r4);
                    $path.setAttribute('d', new_d);
                    if($clipPath) $clipPath.setAttribute('d', new_d);
                    let path_point = [{ x: r1, y: 0, }];
                    let data_points = [{ x: r1, y: 0, }];
                    edit_update_point(path_point, $ele, data_points);
                    that.$set(that.element_message.svg_path, 0, new_d);
                    that.$set(that.element_message, 'rect_fillet', [r1, r2, r3, r4]);
                    that.$set(that.element_message, 'rect_fillet_max', Math.floor(int_fillet_val));
                }
            },
            // 设置矩形是否开启圆角
            toggle_rect_fillet: function (index) {
                let that = this;
                let shape_edit = edit_shape_json[that.element_message.support_edit];
                if (shape_edit) {
                    let $ele = $('.page_contain .ele_item.checked');
                    let $path = $ele.find('.ele_scale path')[0];
                    let $clipPath = $ele.find('clipPath path')[0];
                    let d = $path.getAttribute('d');
                    let info = shape_edit.getPath(d);
                    that.$set(that.element_message, 'rect_fillet', [info.r1, info.r2, info.r3, info.r4]);
                    // 当前的圆角度数
                    let max = Math.max(...that.element_message.rect_fillet);
                    // 在 0 与 圆角度数间切换
                    if(!max) {
                        that.$set(that.element_message.rect_fillet, index, 45);
                    } else {
                        that.$set(that.element_message.rect_fillet, index, that.element_message.rect_fillet[index] ? 0 : max);
                    }
                    let new_d = shape_edit.setPath(info.w, info.h, ...that.element_message.rect_fillet);
                    $path.setAttribute('d', new_d);
                    if($clipPath) $clipPath.setAttribute('d', new_d);
                    let r1 = that.element_message.rect_fillet[0];
                    let path_point = [{ x: r1, y: 0, }];
                    let data_points = [{ x: r1, y: 0, }];
                    edit_update_point(path_point, $ele, data_points);
                    that.$set(that.element_message.svg_path, 0, new_d);
                    // 获取新的圆角度数
                    let newMax = Math.max(...that.element_message.rect_fillet);
                    that.$set(that.element_message, 'rect_fillet_max', Math.floor(newMax));
                }
            },
            // 设置元素层级
            set_ele_level: function(type){
                this.$parent.set_ele_level(type);
                this.hide_all_list();
            },

            /**
             * 富文本功能方法
             */
            // 储存文本选区
            save_text_selection:function(event){
                let that = this,
                    $ele = $('.page_contain .ele_item.checked');
                if($ele.length > 1) return false;
                editor_opt.save_text_selection($ele);
                // 获取选中区域
                if(window.getSelection){
                    let sel = window.getSelection();
                    if (sel.getRangeAt && sel.rangeCount) {
                        // 判断选中文本时候包含超链接
                        let $select_node = $(sel.focusNode);
                        if($select_node[0].tagName === 'DIV'){
                            if($select_node.find('a').length < 0 || $select_node.find('a').length > 1 || $select_node.find('a').attr('href') === ''){
                                that.text_link_flag = false
                            }else{
                                that.text_link_flag = $select_node.find('a').attr('href')
                            }
                        }else{
                            if($select_node.parents('a').attr('href') && $select_node.parents('a').attr('href') !== ''){
                                that.text_link_flag = $select_node.parents('a').attr('href');
                            }else {
                                that.text_link_flag = false;
                            }
                        }
                    }
                }
                setTimeout(() => {
                    if(event) $(event.target).attr('disabled',false).focus()
                },300)
            },
            // 恢复储存选区
            recover_text_selection: function(){
                let that = this,
                    $ele = $('.page_contain .ele_item.checked');
                if($ele.length !== 1) return false;
                editor_opt.recover_text_selection($ele);
            },
            // 选择文本字体语言
            select_family_lang: function (type, index) {
                let that = this;
                that.text_family_list_show = type;
                if (index === that.select_family_list_index || type === 'art') return;
                that.select_family_list_index = index;
                that.filter_family_list = that.text_family_list[index].item;
            },
            // 选择文本字体
            set_font_family:function(item){
                console.log(item);
                let that = this,
                    fonts = document.fonts,
                    data = item.data,
                    $checked = $('.page_contain .ele_item.checked');
                that.family_childrenList_show = false;
                // 添加进最近字体使用列表
                that.addFamilyLatelyUse(item);
                // 恢复文本选区
                that.recover_text_selection();
                let setFontFamily = () => {
                    // 设置字体
                    $checked.each(function(){
                        let $ele = $(this),
                            type = $ele.attr('data-type'),
                            option = opt_factory.init_opt(type);
                        switch (type) {
                            case 'text':
                                let $text = $ele.hasClass('show_text') ? $ele : $ele.find('.show_text');
                                // 非艺术字 或者 全选 或 节点选 
                                let is_inherit = !$text.hasClass('art') && editor_opt.decideSelectAll($ele);
                                // 判断是否要继承
                                if(is_inherit){
                                    // 继承字体
                                    option.using_data.family = data;
                                }
                                // 设置字体
                                editor_opt.set_family($ele, data);
                                break;
                            case 'shape':
                                editor_opt.set_family($ele, data);
                                break;
                            case 'table':
                                let $selected = option.get_edit_cel($ele);
                                $selected.each(function(){
                                    editor_opt.set_family($(this), data);
                                });
                                break;
                        }
                    });
                    // 更新虚线框
                    operate_opt.reset_rect($checked);
                    // 更新左侧栏数据
                    that.$parent.element_message.font_family = item.name;
                }
                // 加载字体
                if(fonts){
                    // 字体开始加载
                    fonts.load(`1em ${item.data}`);
                    if (fonts.status === 'loading') item.loading = true;
                    // 字体加载完成后设置字体
                    fonts.ready.then((face)=>{
                        item.loading = false;
                        that.pull_list_type = null;
                        setFontFamily();
                    }).catch((err)=>{
                        item.loading = false;
                    });
                }
            },
            addFamilyLatelyUse(item){
                // 添加进最近字体使用列表
                let family_lately_use_list = this.family_lately_use_list.filter(v => v.name !== item.name);;
                family_lately_use_list.unshift(item);
                if(family_lately_use_list.length > 5) family_lately_use_list.length = 5;
                this.family_lately_use_list = family_lately_use_list;
            },
            // 控制有子集的字体显示或隐藏
            toggle_font_child (e, item) {
                let that = this;
                // 当前字体没有子列表时return
                if(!item.childrenList) return;
                // 移入时获取当前字体的子列表，显示子列表并修改列表视图定位
                if(e.type === 'mouseenter') {
                    clearTimeout(that.family_childrenList_remove_timer);
                    that.font_family_childrenList = item.childrenList;
                    let win_w = window.innerWidth;
                    let $font_family_child = $('.font_family_childrenList');
                    let font_family_child_width = $font_family_child.innerWidth();
                    let offset = $(e.target).offset();
                    let left = offset.left + e.target.clientWidth + 7;
                    if(left + font_family_child_width > win_w){
                        left = offset.left - font_family_child_width;
                    }
                    $font_family_child.css({
                        'top': `${offset.top}px`,
                        'left': `${left}px`,
                    });
                    that.family_childrenList_show = true;
                }else{
                    // 移出时隐藏子列表
                    that.family_childrenList_remove_timer = setTimeout(() => {
                        that.family_childrenList_show = false;
                    }, 16);
                }
            },
            //  控制有子集的字体显示或隐藏
            toggle_fontfamily_childList_show (e) {
                if (e.type === 'mouseenter') {
                    clearTimeout(this.family_childrenList_remove_timer);
                } else {
                    this.family_childrenList_remove_timer = setTimeout(() => {
                        this.family_childrenList_show = false;
                    }, 16);
                }
            },
            // 选择文本字号
            set_font_size:function(size, ele){
                // 恢复文本选区
                this.recover_text_selection();
                let that = this;
                let data = '';
                let scale = [0.5, 0.5];
                let sel = window.getSelection();
                let $checked = ele || $('.page_contain .ele_item.checked');
                let message_size = (Number(that.element_message.size) < 6 ? 12 : Number(that.element_message.size));
                let select_text = window.getSelection().toString().replace(/\s+/g, '');
                // 隐藏其他弹框
                that.hide_all_list();
                // 设置文字大小方法
                let set_size_function = function(){
                    $checked.each(function(){
                        let $ele = $(this);
                        let type = $ele.attr('data-type');
                        let option = opt_factory.init_opt(type);
                        if (type === 'text') {
                            scale = option.get_transform($ele, 'scale');
                        }
                        data = size / Number(scale[0]) || message_size / Number(scale[0]);
                        switch (type) {
                            case 'text':
                                let $text = $ele.hasClass('show_text') ? $ele : $ele.find('.show_text');
                                // 非艺术字 或者 全选 或 节点选 
                                let is_inherit = !$text.hasClass('art') && editor_opt.decideSelectAll($ele);
                                // 判断是否要继承
                                if(is_inherit){
                                    // 继承字体
                                    option.using_data.size = data;
                                }
                                // 设置字体大小
                                editor_opt.set_size($ele, data);
                                that.$parent.element_message.h = option.set_ele_sync_content($ele);
                                break;
                            case 'shape':
                                editor_opt.set_size($ele, data);
                                break;
                            case 'table':
                                let $selected = option.get_edit_cel($ele);
                                $selected.each(function(){
                                    editor_opt.set_size($(this), data);
                                });
                                // 相关数据同步
                                option.table_edit_listener($ele);
                                break;
                            case 'chart':
                                that.update_chart_text('size', data);
                                break;
                        }
                    });
                }
                if($checked.length === 1 && select_text.length === 0 && $checked.attr('data-type') !== 'table' && window.getSelection){
                    if(window.getSelection().getRangeAt && window.getSelection().rangeCount){
                        if($(window.getSelection().getRangeAt(0).commonAncestorContainer).parents().hasClass('show_text')){
                            if ($checked.attr('data-type') === 'text') {
                                scale = opt_factory.init_opt('text').get_transform($checked, 'scale');
                            }
                            data = size / Number(scale[0]) || message_size / Number(scale[0]);
                            editor_opt.set_next_size($checked, data);
                        }else{
                            set_size_function();
                        }
                    }else{
                        set_size_function();
                    }
                }else{
                    set_size_function();
                }
                // 更新虚线框
                operate_opt.reset_rect($checked);
                // 更新左侧栏数据
                if(!ele) that.$parent.element_message.size = data * scale[0];
            },
            // 设置文本字号(一单位)
            set_font_unit_size: function(type){
                let that = this,
                    $checked = $('.page_contain .ele_item.checked'),
                    scale = [0.5, 0.5],
                    data = '';
                $checked.each(function(){
                    let $ele = $(this);
                    let ele_type = $ele.attr('data-type');
                    let option = '';
                    switch (ele_type) {
                        case 'text':
                            option = opt_factory.init_opt('text');
                            let $text = $ele.hasClass('show_text') ? $ele : $ele.find('.show_text');
                            // 非艺术字 或者 全选 或 节点选 
                            let is_inherit = !$text.hasClass('art') && editor_opt.decideSelectAll($ele);
                            // 判断是否要继承
                            if(is_inherit){
                                data = that.element_message.size;
                                data = type === 'add' ? data + 1 : data - 1;
                                data = data  / Number(scale[0]);
                                // 继承字体
                                option.using_data.size = data;
                            }
                            scale = option.get_transform($ele, 'scale');
                            editor_opt.set_node_size($ele,scale,type);
                            that.$parent.element_message.h = option.set_ele_sync_content($ele);
                            break;
                        case 'shape':
                            option = opt_factory.init_opt('shape');
                            editor_opt.set_node_size($ele,scale,type);
                            break;
                        case 'table':
                            option = opt_factory.init_opt('table');
                            let $td = $ele.find('td');
                            if($ele.find('.cel_selected').length > 0) $td = $ele.find('.cel_selected');
                            if($ele.find('.cel_edit').length > 0) $td = $ele.find('.cel_edit');
                            $td.each(function(){
                                let $text = $(this);
                                editor_opt.set_node_size($text,scale,type);
                            })
                            // 相关数据同步
                            option.table_edit_listener($ele);
                            break;
                        case 'chart':
                            data = that.element_message.size;
                            if(type === 'add'){
                                data++;
                            }else{
                                data--;
                            }
                            that.update_chart_text('size', data * 2);
                            break;
                        default:
                            break;
                    }
                })
                // 更新虚线框
                operate_opt.reset_rect($checked);
                // 更新左侧栏数据
                if(type === 'add'){
                    that.$parent.element_message.size++;
                }else{
                    that.$parent.element_message.size > 6 && that.$parent.element_message.size--;
                }
            },
            // 选择文本粗体
            set_font_weight:function(){
                let that = this,
                    $checked = $('.page_contain .ele_item.checked'),
                    type = $checked.attr('data-type'),
                    option;
                switch (type) {
                    case 'chart':
                        if(that.element_message.chart_data) {
                            option = opt_factory.init_opt('chart');
                            that.update_chart_text('weight', 'bold');
                            // 更新左侧栏数据
                            that.element_message.font_weight = that.element_message.chart_data.textStyle.fontWeight;
                        }
                        break;
                    default:
                        option = opt_factory.init_opt('group');
                        // 设置文本粗体
                        option.ele_set_weight($checked);
                        // 更新虚线框
                        operate_opt.reset_rect($checked);
                        // 更新左侧栏数据
                        that.element_message.font_weight = option.get_edit_message($checked).font_weight;
                        break;
                }
            },
            // 选择文本斜体
            set_font_italic:function(){
                let that = this,
                    $checked = $('.page_contain .ele_item.checked'),
                    type = $checked.attr('data-type'),
                    option;
                switch (type) {
                    case 'chart':
                        if(that.element_message.chart_data) {
                            option = opt_factory.init_opt('chart');
                            that.update_chart_text('italic', 'italic');
                            // 更新左侧栏数据
                            that.element_message.font_style = that.element_message.chart_data.textStyle.fontStyle;
                        }
                        break;
                    default:
                        option = opt_factory.init_opt('group');
                        // 设置文本斜体
                        option.ele_set_italic($checked);
                        // 更新虚线框
                        operate_opt.reset_rect($checked);
                        // 更新左侧栏数据
                        that.element_message.font_style = option.get_edit_message($checked).font_style;
                        break;
                }
            },
            // 选择文本下划线
            set_font_underline:function(){
                let that = this,
                    $checked = $('.page_contain .ele_item.checked'),
                    group_opt = opt_factory.init_opt('group');
                // 设置文本下划线
                group_opt.ele_set_underline($checked);
                // 更新虚线框
                operate_opt.reset_rect($checked);
                // 更新左侧栏数据
                that.$parent.element_message.text_underline = group_opt.get_edit_message($checked).text_underline;
            },
            // 选择文本中划线
            set_font_linethrough:function(){
                let that = this,
                    $checked = $('.page_contain .ele_item.checked'),
                    group_opt = opt_factory.init_opt('group');
                // 设置文本中划线
                group_opt.ele_set_linethrough($checked);
                // 更新虚线框
                operate_opt.reset_rect($checked);
                // 更新左侧栏数据
                that.$parent.element_message.text_linethrough = group_opt.get_edit_message($checked).text_linethrough;
            },
            // 选择文本高亮
            set_font_hilite:function(data){
                let that = this,
                    $checked = $('.page_contain .ele_item.checked'),
                    group_opt = opt_factory.init_opt('group');
                // 设置文本高亮
                group_opt.ele_set_hilite($checked,data);
                // 更新格式面板数据
                that.$parent.element_message.hilite = data;
                // 更新虚线框
                operate_opt.reset_rect($checked);
            },
            // 选择文本投影
            set_font_shadow:function(){
                let that = this,
                    $checked = $('.page_contain .ele_item.checked'),
                    group_opt = opt_factory.init_opt('group');
                // 设置文本投影
                group_opt.ele_set_shadow($checked);
                // 更新虚线框
                operate_opt.reset_rect($checked);
                // 更新左侧栏数据
                that.$parent.element_message.text_shadow = group_opt.get_edit_message($checked).text_shadow;
            },
            // 选择文本对齐
            set_font_align:function(data){
                let that = this,
                    $checked = $('.page_contain .ele_item.checked'),
                    group_opt = opt_factory.init_opt('group');
                that.hide_all_list();
                group_opt.ele_set_align($checked, data);
                that.$parent.element_message.text_align = data;
            },
            // 设置文本行高
            set_font_lineHeight: function(data){
                let that = this,
                    $checked = $('.page_contain .ele_item.checked'),
                    group_opt = opt_factory.init_opt('group');
                if(data <= 0){
                    data = 0.1;
                }else if(data > 20){
                    data = 20.0
                }
                // 设置文本行高
                group_opt.ele_set_lineHeight($checked, data);
                // 同步内容尺寸
                $checked.each(function(){
                    if($(this).attr('data-type') === 'text') {
                        that.$parent.element_message.h = opt_factory.init_opt('text').set_ele_sync_content($(this));
                    }
                })
                // 更新虚线框
                operate_opt.reset_rect($checked);
                // 更新左侧栏数据
                that.$parent.element_message.line_height = data.toFixed(1);
            },
            // 设置文本有序无序
            set_font_orderedList:function(data, style){
                // 恢复文本选区
                this.recover_text_selection();
                let that = this;
                let $checked = $('.page_contain .ele_item.checked');
                that.hide_all_list();
                $checked.each(function(){
                    let $ele = $(this),
                        type = $ele.attr('data-type'),
                        option = opt_factory.init_opt(type);
                    // 双击取消序列表
                    if(style === that.element_message.ul || style === that.element_message.ol) style = 'none';
                    switch (type) {
                        case 'text':
                            editor_opt.set_font_list($ele, data, style);
                            that.$parent.element_message.h = option.set_ele_sync_content($ele);
                            break;
                        case 'shape':
                            editor_opt.set_font_list($ele, data, style);
                            break;
                        case 'table':
                            // 获取正在编辑单元格
                            let $cel = option.get_edit_cel($ele);
                            $cel.each(function(){
                                editor_opt.set_font_list($(this), data, style);
                            });
                            // 相关数据同步
                            option.table_edit_listener($ele);
                            break;
                    }
                    // 组合元素取消单个元素选区选中
                    if ($checked.length > 1)  document.execCommand('Unselect'); 
                });
                if(data === 'insertUnorderedList'){
                    that.$parent.element_message.ol = 'none';
                    that.$parent.element_message.ul = style;
                }else{
                    that.$parent.element_message.ul = 'none';
                    that.$parent.element_message.ol = style;
                }
                // 更新虚线框
                operate_opt.reset_rect($checked);
            },
            // 格式刷功能(stay:保持状态)
            set_format_painter:function(stay){
                let that = this;
                let $ele = $('.page_contain .ele_item.checked');
                if ($ele.length > 1) {
                    return that.$toast('请单选文本操作');
                }
                let type = $ele.attr('data-type');
                let format_style;
                if(type === 'table'){
                    // 获取正在编辑单元格
                    let option = opt_factory.init_opt(type),
                        $cel = option.get_edit_cel($ele);
                    if(!$cel || $cel.length > 1) {
                        return that.$toast('请单选文本操作');
                    }
                    format_style = editor_opt.get_font_format($cel);
                }else{
                    if(!window.getSelection().anchorNode) {
                        return that.$toast('请单选文本操作');
                    }
                    format_style = editor_opt.get_font_format($ele);
                }
                that.EditView.formatPainterIsArt = $ele.find('.art').length;
                that.EditView.format_painter_style = format_style;
                that.EditView.stay_format_painter = stay;
                that.EditView.had_format_painter = true;
            },
            // 设置字间距
            set_font_spacing: function(data){
                let that = this,
                    $checked = $('.page_contain .ele_item.checked');
                if(data > 200) { 
                    data = 200;
                }else if(data < -50){
                    data = -50;
                }
                $checked.each(function(){
                    let $ele = $(this),
                        type = $ele.attr('data-type'),
                        option = opt_factory.init_opt(type);
                    switch (type) {
                        case 'text':
                            editor_opt.set_font_spacing($ele, data);
                            // 同步内容尺寸
                            that.$parent.element_message.h = opt_factory.init_opt('text').set_ele_sync_content($ele);
                            break;
                        case 'shape':
                            editor_opt.set_font_spacing($ele, data);
                            break;
                        case 'table':
                            let $cel = option.get_edit_cel($ele);
                            if(!$cel) break;
                            $cel.each(function () {
                                editor_opt.set_font_spacing($(this), data);
                            });
                            // 相关数据同步
                            option.table_edit_listener($ele);
                            break;
                    }
                });
                // 更新虚线框
                operate_opt.reset_rect($checked);
                // 刷新元素对象数据
                that.$parent.element_message.letter_spacing = data.toFixed(1);
            },
            // 设置文本颜色
            set_font_color: function(data){
                let that = this,
                    $checked = $('.page_contain .ele_item.checked');
                // 设置字体
                $checked.each(function(){
                    let $ele = $(this),
                        type = $ele.attr('data-type');
                    switch (type) {
                        case 'text':
                            editor_opt.set_color($ele, data);
                            break;
                        case 'shape':
                            editor_opt.set_color($ele, data);
                            break;
                        case 'table':
                            let $cel = opt_factory.init_opt('table').get_edit_cel($ele);
                            if(!$cel) break;
                            $cel.each(function () {
                                editor_opt.set_color($(this), data);
                            });
                            break;
                        case 'chart':
                            that.update_chart_text('color', data);
                            break;
                    }
                });
                // 刷新元素对象数据
                that.$parent.element_message.color = data;
            },
            // 弹出文本超链接
            open_text_link:function(){
                let that = this,
                    $ele = $('.page_contain .ele_item.checked');
                that.save_text_selection();
                // 判断是否存在自定义选区
                let $selector = $ele.find('.customize_selection');
                if($selector.length <= 0) return that.$toast('请选中文本后操作',800);
                // 立即执行无效 延迟200毫秒
                that.$parent.show_ele_link_modal = false;
                setTimeout(() => {
                    $('.ele_link_str').focus();
                    that.$parent.can_change_link = true;
                },1200);
            },
            // 添加文本超链
            set_font_link:function(){
                let that = this,
                    $ele = $('.page_contain .ele_item.checked'),
                    _link = $('.ele_link_str').val(),
                    $selector = $ele.find('.customize_selection');
                if(_link.indexOf('http') < 0) _link = 'http://' + _link;
                if(!that.text_link_flag){
                    if(_link === '') return that.$toast('未检测到链接',800);
                    if($selector.length <= 0) return that.$toast('请选中文本后操作',800);
                    // 恢复储存选区
                    that.recover_text_selection();
                    // 设置超链接
                    document.execCommand("createLink", false, _link);
                    let sel = window.getSelection();

                    // 超链接默认添加下划线
                    if (sel.anchorNode.parentNode.nodeName === 'A' && window.getComputedStyle(sel.anchorNode.parentNode.parentNode)['textDecoration'].indexOf('underline') < 0) {
                        document.execCommand("styleWithCSS",false,null);
                        document.execCommand('underline');
                    }
                }else{
                    // 恢复储存选区
                    that.recover_text_selection();
                    let sel = window.getSelection();
                    // 存在下划线时取消超链接同时删除下划线
                    if (sel.anchorNode && sel.anchorNode.parentNode.nodeName === 'A') {
                        // 判断选中的元素是文本节点 还是 dom 并且是否有下划线
                        if (window.getComputedStyle(sel.anchorNode.parentNode.parentNode)['textDecoration'].indexOf('underline') >= 0) document.execCommand('underline');
                    }
                    document.execCommand("unlink", false);
                    that.text_link_flag = false;
                }
            },

            /**
             * 文本元素功能方法
             */
            // 设置文本艺术字渐变
            set_font_gradient: function(color){
                let that = this,
                    $ele = opt_factory.init_opt('group').get_checked_element().element;
                editor_opt.set_font_gradient($ele, that.pull_list_type, color);
                that.$parent.element_message[that.pull_list_type] = color;
            },
            // 更换艺术字
            change_text_art: function(item){
                let that = this;
                // 关闭下拉框
                that.hide_all_list();
                let option = opt_factory.init_opt('text');
                let $checked = option.get_checked_element();
                let $ele = $checked.element;
                if ($checked.type === 'group') {
                    return;
                }
                // 仅继承font-size
                $ele.attr('data-image','');
                let $text = $ele.find('.show_text');
                let $art = $(item.content).css({
                    'fontSize': $text.css('fontSize'),
                    'textAlign': $text.css('textAlign'),
                });
                // 内容替换
                $text.attr({
                    'class': $art.attr('class'),
                    'style': $art.attr('style'),
                });
                that.$parent.element_message = option.get_edit_message($ele);
                that.element_message.text_art_key = item.key;
                operate_opt.reset_rect($ele);
            },
            // 清空艺术字
            clearTextArt() {
                let that = this;
                // 关闭下拉框
                that.hide_all_list();
                let option = opt_factory.init_opt('text');
                let $checked = option.get_checked_element();
                let $ele = $checked.element;
                if ($checked.type === 'group') return;
                let $text = $ele.find('.show_text');
                if(!$text.hasClass('art')) return;
                $ele.attr('data-image', '');
                // 保留的默认创建文本的属性
                let saveCss = $text.css(['font-size', 'color', 'line-height', 'padding', 'word-break', 'font-weight']);
                // 艺术字转普通文本样式时，清除艺术字的className及内置样式
                $text.attr({'class':'show_text', 'style': ''});
                $text.css(saveCss);
                that.EditView.element_message.text_type = 'text';
                that.EditView.element_message.text_preset_key = 'body';
                that.EditView.element_message.text_art_key = '';
                that.EditView.element_message.h = option.set_ele_sync_content($ele);
                operate_opt.reset_rect($ele);
            },
            // 更换文本预设版式
            change_text_style: function(item){
                let that = this;
                // 关闭下拉框
                that.hide_all_list();
                let option = opt_factory.init_opt('text');
                let $checked = option.get_checked_element().element;
                if (option.get_checked_element().type === 'group') {
                    return;
                }
                $checked.attr('data-image','');
                let $text = $checked.find('.show_text');
                let $content = $text.html();
                // 艺术字转普通文本样式时，清除艺术字的className及内置样式
                if($text.hasClass('art')) {
                    $text.attr({'class':'show_text', 'style': ''});
                }
                $text.css({
                    'color': item.color,
                    'fontSize': item.size,
                    'fontWeight': item.weight,
                });
                // 内容替换
                if (item.content) {
                    $content = $(item.content).html($content).prop('outerHTML');
                }
                if (item.key === 'notes') {
                    $content = `[${$content}]`;
                }
                $text.html($content);
                that.$parent.element_message.text_type = 'text';
                that.$parent.element_message.text_preset_key = item.key;
                that.$parent.element_message.h = option.set_ele_sync_content($checked);
                operate_opt.reset_rect($checked);
            },

            /**
             * 形状元素功能方法
             */
            // 替换形状
            change_shape_type:function(item){
                let that = this,
                    option = opt_factory.init_opt('shape'),
                    $checked = $('.page_contain .ele_item.checked');
                // 更新节点
                option.change($checked, item);
                // 重新选中元素
                that.$parent.element_message = option.select($checked);
                // 更新虚线框
                operate_opt.reset_rect($checked);
                // 收起下拉面板
                that.hide_all_list();
            },
            
            /**
             * 图片元素功能方法
             */
            // 开关显示裁剪比例下拉列表
            toggle_clip_ratio: function(){
                this.show_clip_ratio = !this.show_clip_ratio;
                if (this.show_clip_ratio) {
                    this.choose_clip_ratio();
                }else{
                    // 退出裁剪
                    this.quitImageClip()
                }
            },
            // 展示图片裁剪设置
            choose_clip_ratio: function () {
                let that = this;
                // 获取图片裁剪类型 包括(RECT ELLIPSE shape)
                let type = that.element_message.clip_message.type;
                // 获取选中的图片信息
                let option = opt_factory.init_opt('img');
                let $ele = option.get_checked_element().element;
                // 图片裁剪后与裁剪前的宽高
                let new_w = that.element_message.clip_message.new_w;
                let new_h = that.element_message.clip_message.new_h;
                let old_w = that.element_message.clip_message.old_w;
                let old_h = that.element_message.clip_message.old_h;
                let clip_ratio_style = utils.deepClone(that.clip_ratio_style.find(item => item.mode === 'free'));
                // 前后宽/高不同 => 已经裁剪过
                if (Math.abs(old_w - new_w) >= 1 || Math.abs(old_h - new_h) >= 1) {
                    // 用选中图片的裁剪类型判断
                    switch(type){
                        // 矩形
                        case 'RECT':
                            // 宽高比
                            let scale = Number((new_w / new_h).toFixed(2));
                            let rect_ratio_type = that.clip_ratio_style.find(item => Math.abs(scale - item.data) < 0.01);
                            if (rect_ratio_type) {
                                clip_ratio_style = utils.deepClone(rect_ratio_type);
                            }
                            break;
                        case 'ELLIPSE':
                            // 圆形裁剪
                            clip_ratio_style = utils.deepClone(that.clip_ratio_style.find(item => item.mode === 'circle'));
                        break;
                        // 形状
                        default:
                            clip_ratio_style = utils.deepClone(that.clip_shape_list.find(item => item.mode === 'shape' && item.type === type));
                            clip_ratio_style.mode === clip_ratio_style.mode || 'shape';
                            break;
                    }
                }
                that.clip_ratio = clip_ratio_style.mode;
                // 进入裁剪状态
                if (!that.begin_clip) {
                    clip_ratio_style.echo = true;
                    that.begin_image_clip(clip_ratio_style);
                }
            },
            // 开始图片裁剪
            begin_image_clip:function(item = {}){
                let that = this;
                var opt = {
                    mode: '',
                    type: '',
                    data: null,
                    echo: false,
                };
                opt = Object.assign(opt, item);
                let option = opt_factory.init_opt('img');
                let $ele = option.get_checked_element().element;
                that.pull_list_type = !that.begin_clip ? that.pull_list_type : null;
                let aspectRatio = false;
                let clip_shape;
                switch (opt.mode) {
                    // 自由裁剪
                    case 'free':
                        clip_shape = that.clip_shape_list[0];
                        break;
                    // 形状裁剪
                    case 'circle':
                    case 'shape':
                        if (!opt.type && opt.mode !== 'circle') {
                            that.hide_all_list();
                            that.begin_clip = true;
                            that.show_clip_shape();
                            return;
                        }
                        aspectRatio = 1;
                        clip_shape = opt;
                        if (opt.mode === 'circle') {
                            clip_shape = that.clip_shape_list[7];
                        }
                        break;
                    // 比例裁剪
                    case 'rule':
                        aspectRatio = opt.data;
                        clip_shape = that.clip_shape_list[0];
                        break;
                    default:
                        return;
                }
                // 设置裁剪类型回显
                that.clip_ratio = opt.data || opt.mode;
                // 设置是否等比
                $('#clip_wrap').resizable('option', 'aspectRatio', aspectRatio);
                // 更新虚线框
                operate_opt.reset_rect($ele);
                // 进入裁剪
                option.clip_begin({
                    ele: $ele,
                    shape: clip_shape,
                    ratio: aspectRatio,
                    echo: opt.echo,
                })
                // 设置裁剪状态
                that.begin_clip = true;
                // 禁止输入 和 滚动
                that.$parent.element_message.not_w = true;
                that.$parent.element_message.not_h = true;
                that.$parent.element_message.not_x = true;
                that.$parent.element_message.not_y = true;
                that.$parent.element_message.not_rotate = true;
                if (utils.deviceENV().firefox) {
                    document.removeEventListener("DOMMouseScroll", that.$parent.mousewheel_listener);
                } else {
                    window.onmousewheel = document.onmousewheel = null;
                }
            },
            // 退出裁剪
            quitImageClip(){
                let that = this;
                let $ele = $('.page_contain .ele_item.checked');
                // 退出裁剪
                if ($("#operate").hasClass("clip_image")) {
                    let image_opt = opt_factory.init_opt('img');
                    image_opt.clip&&image_opt.clip.sure();
                    that.begin_clip = false;
                    that.EditView.element_message.not_w = false;
                    that.EditView.element_message.not_h = false;
                    that.EditView.element_message.not_x = false;
                    that.EditView.element_message.not_y = false;
                    that.EditView.element_message.not_rotate = false;
                    if (utils.deviceENV().firefox) {
                        document.removeEventListener("DOMMouseScroll", that.EditView.mousewheel_listener);
                        document.addEventListener("DOMMouseScroll", that.EditView.mousewheel_listener);
                    } else {
                        window.onmousewheel = document.onmousewheel = that.EditView.mousewheel_listener;
                    }
                    // 取消选中
                    that.EditView.ele_cancel_checked();
                    // 选中元素
                    that.EditView.set_ele_checked($ele);
                    
                    that.show_clip_ratio = false;
                }
            },
            // 显示形状裁剪选择框
            show_clip_shape: function(){
                if(this.format_clip_ratio_shape){
                    this.format_clip_ratio_shape = false;
                }else{
                    this.get_clip_shape_image(() => {
                        this.format_clip_ratio_shape = true;
                    });
                }
            },
            // 获取要被裁剪的图片url
            get_clip_shape_image: function(callback){
                let that = this;
                let option = opt_factory.init_opt('img');
                let $ele = option.get_checked_element().element;
                let data = option.dom_2_ele($ele);
                let min = Math.floor(Math.min(data.image_w, data.image_h));
                that.clip_shape_image = `${data.url}?x-oss-process=image/crop,w_${min},h_${min},g_center/resize,m_lfit,w_200`;
                that.choose_clip_ratio();
                that.clip_image_load = false;
                typeof callback === 'function' && callback();
            },
            // 确认裁剪
            sure_image_clip:function(){
                let that = this,
                    option = opt_factory.init_opt('img'),
                    $ele = $('.page_contain .ele_item.checked');
                option.clip_sure($ele);
                // 更新裁剪状态标识
                that.begin_clip = false;
                that.clip_ratio = null;
                // 裁剪结束 释放禁止项
                that.$parent.element_message.not_w = false;
                that.$parent.element_message.not_h = false;
                that.$parent.element_message.not_x = false;
                that.$parent.element_message.not_y = false;
                that.$parent.element_message.not_rotate = false;
                if (utils.deviceENV().firefox) {
                    document.removeEventListener("DOMMouseScroll", that.$parent.mousewheel_listener);
                    document.addEventListener("DOMMouseScroll", that.$parent.mousewheel_listener);
                } else {
                    window.onmousewheel = document.onmousewheel = that.$parent.mousewheel_listener;
                }
            },
            // 更换图片
            change_image_src: function(type, target){
                let that = this;
                // 从素材库更换
                if(type === 'material'){
                    that.$parent.$refs.material_library.images_operation_state_open('element_src');
                }else{
                    // 从本地更换
                    that.$parent.change_local_image(target,'change');
                }
            },

            /**
             * 线条元素功能方法
             */
            // 设置线条箭头
            select_line_path:function(type, data){
                let that = this,
                    $ele = $('.page_contain .ele_item.checked'),
                    ele_type = $ele.attr('data-type'),
                    option = opt_factory.init_opt(ele_type);
                // 隐藏下拉框
                that.hide_all_list();
                // 更新左侧栏数据
                if(type === 'left'){
                    that.element_message.line_left = data.type;
                }else{
                    that.element_message.line_right = data.type;
                }
                // 设置箭头
                option.set_path($ele, type, data);
            },
            
            /**
             * 表格元素功能方法
             */
            // 增加行列方法
            add_table_size:function(e,type){
                let that = this,
                    option = opt_factory.init_opt('table'),
                    $ele = $('.page_contain .edit_page .ele_item.checked'),
                    value = e.target.value,
                    _data, _max, diff;
                $('.cel_selected').removeClass('cel_selected');
                if(type === 'row'){
                    _data = "add_bottom";
                    _max = that.element_message.row;
                }else{
                    _data = "add_right";
                    _max = that.element_message.line;
                }
                if(value < _max){
                    that.$toast('不可比当前行列小哦~',800)
                    e.target.value = _max;
                    return;
                };
                if (value > 31 && type === 'row') return that.$toast('表格行数值应不超过30',1000);
                if (value > 21 && type === 'line') return that.$toast('表格列数值应不超过20',1000);
                diff = value - _max;
                $('.cel_selected').removeClass('cel_selected');
                for(let i = 0;i < diff; i++){
                    option.set_row_column($ele,_data,function(){
                        that.$parent.ele_cancel_checked();
                    });
                }
            },
            // 设置表格列宽度方法
            set_row_w:function(data){
                let option = opt_factory.init_opt('table'),
                    $checked = $('.page_contain .ele_item.checked');
                // 错误状态判断
                if(isNaN(data) || data < 0){
                    // that.element_message.column_height = edit.main.get_table_edit(that.$parent).line_height;
                    return this.$toast('请输入正确数字', 800);
                }
                option.set_column_width($checked,data);
            },
            // 设置表格列宽度方法
            set_line_h:function(data){
                let option = opt_factory.init_opt('table'),
                    $checked = $('.page_contain .ele_item.checked');
                // 错误状态判断
                if(isNaN(data) || data < 0){
                    // that.element_message.column_height = edit.main.get_table_edit(that.$parent).line_height;
                    return this.$toast('请输入正确数字', 800);
                }
                option.set_row_height($checked,data);
            },
            // 更换预设表格
            preset_table_style: function(item){
                let that = this,
                    $checked = $('.page_contain .ele_item.checked'),
                    table_opt = opt_factory.init_opt('table');
                // 预设表格样式处理
                $checked.find('table').attr({
                    'data-preset': item.table.preset,
                    'data-border-width': item.table.tr_list[0][0].border.width,
                    'data-border-color': item.table.tr_list[0][0].border.color[0],
                    'data-border-style': item.table.tr_list[0][0].border.style[0]=='none'?'solid':item.table.tr_list[0][0].border.style[0]
                });
                table_opt.preset_cel_arrange($checked);
                // 更新左侧表格信息
                that.$parent.element_message = table_opt.get_edit_message($checked);
                // 同步表格
                table_opt.table_edit_listener($checked)
            },
            // 设置表格边框
            set_table_border: function(item){
                let that = this,
                    $checked = $('.page_contain .ele_item.checked'),
                    table_opt = opt_factory.init_opt('table');
                table_opt.set_border_type($checked,item);
                that.hide_all_list();
            },

            /**
             * 图表元素功能方法
             */
            // 更新图表数据
            update_chart: function (checked) {
                let that = this;
                let $checked = checked || $('#page_contain .ele_item.checked');
                let type = $checked.attr('data-type');
                if ($checked.length !== 1 || type !== 'chart') {
                    return;
                }
                let option = opt_factory.init_opt('chart');
                let chart_data = that.element_message.chart_data || {};
                option.update_instance($checked, chart_data, () => {
                    // 更新图表数据展示
                    let msg = option.get_edit_message($checked);
                    for (let key in msg) {
                        that.$set(that.element_message, key, msg[key]);
                    }
                });
            },
            // 处理图表数据表格
            chart_data_table: function () {
                let that = this;
                let $checked = $('#page_contain .ele_item.checked');
                let $item = $('.chart_data_table .chart_data_col .col_item:not(:nth-child(1), :nth-child(2))');
                let $input = $item.children('input');
                if (['pie', 'funnel'].indexOf(that.element_message.chart_style) >= 0) {
                    $input.attr({
                        'disabled': 'disabled',
                        'readonly': 'readonly',
                    });
                    $item.css('background-color', '#f8f8f8').attr('title', '当前图表无法编辑此列数据');
                } else {
                    $input.removeAttr('disabled readonly');
                    $item.removeAttr('style title');
                }
            },
            // 图表删除行
            chart_table_col_delete: function (index) {
                let that = this,
                    chart_data = that.element_message.chart_data,
                    $checked = $('#page_contain .ele_item.checked');
                if ($checked.length === 1) {
                    let type = $checked.attr('data-type');
                    if (type !== 'chart') return;
                    if (!chart_data.dataset.source[index]) return;
                    chart_data.dataset.source.splice(index, 1);
                    that.$nextTick(() => {
                        that.update_chart($checked);
                    });
                }
            },
            // 更新图表项目数据
            update_chart_item: function (event) {
                let that = this,
                    $this = $(event.target),
                    val = $this.val(),
                    $parent = $this.parents('.chart_data_table'),
                    row_length = $parent.find('.chart_data_col').length,
                    col_length = $parent.find('.chart_data_col:first .col_item').length,
                    current_row = $this.parents('.chart_data_col').index(),
                    current_col = $this.parent('.col_item').index();
                if (event.type === 'blur') {
                    that.chart_item_blur();
                }
                if (event.type === 'keydown') {
                    let code = event.keyCode,
                        select_position = event.target.selectionStart;
                    switch(code) {
                        case 13:    // 回车修改数据，对空项操作时不保存数据，最后项回车时新增一栏
                            if (val) {
                                that.update_chart();
                            }
                            if (current_row + 1 === row_length && current_col + 1 === col_length) {
                                that.add_chart_item();
                                that.$nextTick(() => {
                                    $parent.find('.chart_data_col:last .col_item:first input').focus();
                                });
                            }
                            break;
                        case 37:    // 左
                            if (select_position > 0) return;
                            if (current_row === 0 && current_col === 0) return;
                            if (current_col > 0) {
                                $parent.find(`.chart_data_col:eq(${current_row}) .col_item:eq(${current_col - 1}) input`).focus();
                            } else {
                                $parent.find(`.chart_data_col:eq(${current_row - 1}) .col_item:last input`).focus();
                            }
                            break;
                        case 38:    // 上
                            if (current_row === 0) return;
                            $parent.find(`.chart_data_col:eq(${current_row - 1}) .col_item:eq(${current_col}) input`).focus();
                            break;
                        case 39:    // 右
                            if (select_position < val.length) return;
                            if (current_row + 1 === row_length && current_col + 1 === col_length) return;
                            if (current_col + 1 < col_length) {
                                $parent.find(`.chart_data_col:eq(${current_row}) .col_item:eq(${current_col + 1}) input`).focus();
                            } else {
                                $parent.find(`.chart_data_col:eq(${current_row + 1}) .col_item:first input`).focus();
                            }
                            break;
                        case 40:    // 下
                            if (current_row + 1 === row_length) return;
                            $parent.find(`.chart_data_col:eq(${current_row + 1}) .col_item:eq(${current_col}) input`).focus();
                            break;
                    }
                }
            },
            // 图表数据表格聚焦
            chart_item_focus: function (event) {
                let $del = $(event.target).parent().siblings('.col_delete');
                $del.hide();
            },
            // 图表数据表格失焦更新数据，需判断是否是在继续编辑中
            chart_item_blur: function () {
                let that = this;
                let timer = null;
                let $checked = $('#page_contain .ele_item.checked');
                $('.chart_data_table .col_delete').show();
                setTimeout(() => {
                    if ($('.chart_data_table input:focus').length === 1) {
                        clearTimeout(timer);
                    }
                }, 5);
                timer = setTimeout(() => {
                    that.update_chart($checked);
                }, 10);
            },
            // 更新图表文本样式
            update_chart_text: function (key, data) {
                let that = this;
                let chart_data = that.element_message.chart_data;
                // 元素组合时element_message中没有chart_data属性
                if(!chart_data) return;
                switch (key) {
                    case 'size':
                        chart_data.textStyle.fontSize = data / 2;
                        break;
                    case 'color':
                        chart_data.textStyle.color = data;
                        break;
                    case 'italic':
                        chart_data.textStyle.fontStyle = chart_data.textStyle.fontStyle === 'italic' ? 'normal' : 'italic';
                        break;
                    case 'weight':
                        chart_data.textStyle.fontWeight = chart_data.textStyle.fontWeight === 'bold' ? 'normal' : 'bold';
                        break;
                }
                that.update_chart();
            },
            // 更新图表 x y 轴名称
            update_chart_axis_name: function (axis) {
                let that = this;
                let chart_data = that.element_message.chart_data;
                if (typeof chart_data.xAxis === 'undefined' && typeof chart_data.xAxis.name === 'undefined') {
                    return;
                }
                switch (axis) {
                    case 'x':
                        if (chart_data.xAxis.name.length > 20) {
                            chart_data.xAxis.name = chart_data.xAxis.name.slice(0, 20);
                        }
                        that.update_chart();
                        break;
                    case 'y':
                        if (chart_data.yAxis.name.length > 20) {
                            chart_data.yAxis.name = chart_data.yAxis.name.slice(0, 20);
                        }
                        that.update_chart();
                        break;
                }
            },
            // 更新图表设置
            update_chart_set: function (key, value) {
                let that = this;
                let chart_data = that.element_message.chart_data || {};
                switch (key) {
                    case 'legend':
                        chart_data.legend = !chart_data.legend;
                        break;
                    case 'formatter_ratio':
                        chart_data.show_series_ratio = !chart_data.show_series_ratio;
                        break;
                    case 'formatter_value':
                        chart_data.show_series_value = !chart_data.show_series_value;
                        break;
                    case 'radius':
                        chart_data.series_radius = !chart_data.series_radius;
                        break;
                    case 'rose_type':
                        chart_data.series_roseType = !chart_data.series_roseType;
                        break;
                    case 'label_inside':
                        chart_data.label_inside = !chart_data.label_inside;
                        break;
                    case 'pile':
                        chart_data.series_pile = !chart_data.series_pile;
                        break;
                }
                that.update_chart();
            },
            // 线条设置下拉框
            show_chart_line_style: function (event) {
                let $this = $(event.target);
                $this.parents('.line_style_type').toggleClass('show');
            },
            // 设置 折线图图表 线条样式
            update_chart_line_style: function (data, item) {
                let that = this;
                that.hide_all_list();
                if (item.type === data) return false;
                item.type = data;
                that.update_chart();
            },
            // 添加图表项
            add_chart_item: function () {
                let that = this,
                    chart_data = that.element_message.chart_data,
                    $checked = $('#page_contain .ele_item.checked');
                if ($checked.length === 1) {
                    let type = $checked.attr('data-type');
                    if (type !== 'chart') return;
                    if(chart_data.dataset.source.length >= 12){
                        return that.$toast("新增项目最多12个",1000);
                    }
                    if (chart_data.dataset.source.length > 0) {
                        // 复制第一组数组，填充空内容
                        let copy_arr = chart_data.dataset.source[0].concat();
                        copy_arr.fill('');
                        chart_data.dataset.source.push(copy_arr);
                    } else {
                        chart_data.dataset.source.push(['项目1', 0]);
                    }
                    //颜色处理
                    if(chart_data.dataset.source.length > chart_data.color.length){
                        chart_data.color.push(chart_data.color[chart_data.color.length - 1].concat());
                    }
                    that.$nextTick(() => {
                        that.chart_data_table();
                    });
                }
            },
            // 改变图表类
            chart_chage_class: function (change_type) {
                let that = this,
                    $checked = $('#page_contain .ele_item.checked');
                if ($checked.length === 1) {
                    let type = $checked.attr('data-type'),
                        option = opt_factory.init_opt(type);
                    if (type !== 'chart') return;
                    option.switch_instance($checked, change_type);
                    that.element_message.chart_style = change_type;
                    that.chart_data_table();
                }
            },
            // 选中主题调出调色板
            selection_chart_theme_item: function (event, item, index) {
                let that = this;
                that.pull_list_type = 'chart_item';
                that.chart_item_color_current = {
                    'color': item,
                    'index': index,
                };
                that.toggle_common_color({
                    target: $(event.target.offsetParent),
                    value: that.chart_item_color_current['color'] || '#fff',
                });
            },
            // 修改图表项目主题色，CommonColor 组件中调用
            update_chart_theme: function (color) {
                let that = this,
                    arr_index = that.chart_item_color_current['index'] || 0,
                    theme = that.element_message.chart_data.color;
                if (theme) {
                    theme[arr_index] = color;
                    that.update_chart();
                }
            },

            /* ------------------------------视频元素方法---------------------------------------------- */
            // 视频参数设置
            video_conf: function (key) {
                let that = this;
                if (!that.element_message.can_set) {
                    return;
                }
                let $checked = $('#page_contain .ele_item.checked');
                let type = $checked.attr('data-type');
                if ($checked.length !== 1 || type !== 'video') {
                    return;
                }
                let option = opt_factory.init_opt(type);
                let value = !that.element_message[key];
                option.set_config($checked, key, value);
                that.$set(that.element_message, key, value);
            },
            // 视频重置 
            video_reset: function () {
                let that = this;
                let $checked = $('#page_contain .ele_item.checked');
                let type = $checked.attr('data-type');
                if ($checked.length !== 1 || type !== 'video') {
                    return;
                }
                // 删除元素
                that.$parent.ele_delete();
                that.$nextTick(() => {
                    that.$parent.open_media_panel('video');
                });
            },
            // 上传视频封面
            video_upload_cover: function (event) {
                let that = this;
                let $checked = $('#page_contain .ele_item.checked');
                let type = $checked.attr('data-type');
                if ($checked.length !== 1 || type !== 'video') {
                    return;
                }
                let $input = event.target;
                if ($input.files.length === 0) {
                    return that.$toast('请选择图片~', 2000);
                }
                let file = $input.files[0];
                let option = opt_factory.init_opt(type);
                option.cover_upload({
                    file: file,
                    success: url => {
                        option.set_config($checked, 'cover', url);
                        // 同步侧边栏
                        that.$set(that.element_message, 'cover', url);
                    },
                    error: err => {
                        if (err) {
                            switch (err.message) {
                                case 'size':
                                    that.$toast('文件大小超出限制~', 2000);
                                    break;
                                case 'type':
                                    that.$toast('请选择正确的文件格式~', 2000);
                                    break;
                                default:
                                    that.$toast('视频封面上传失败~', 2000);
                                    break;
                            }
                        } else {
                            that.$toast('视频封面上传失败~', 2000);
                        }
                    },
                });
                $input.value = '';
            },
            // 删除视频封面
            video_cover_del: function () {
                let that = this;
                let $checked = $('#page_contain .ele_item.checked');
                let type = $checked.attr('data-type');
                if ($checked.length !== 1 || type !== 'video') {
                    return;
                }
                let option = opt_factory.init_opt(type);
                option.set_config($checked, 'cover', '');
                // 同步侧边栏
                that.$set(that.element_message, 'cover', '');
            },

            /* ------------------------------音频元素方法---------------------------------------------- */
            // 显示音频控件
            showAudioControls(){
                this.show_audio_controls = true;
                let $ele = $('.page_contain .ele_item.checked');
                this.$nextTick(()=>{
                    let $audio_controls = $(this.$refs.audio_controls);
                    let $audio = $audio_controls.find('audio');
                    if($audio.length){
                        $audio.remove();
                    }
                    let option = opt_factory.init_opt('audio');
                    this.audio_controls = option.audio_control_show($ele, $audio_controls);
                });
            },
            hideAudioControls(){
                this.show_audio_controls = false;
                if(this.audio_controls){
                    this.audio_controls.destroy();
                    this.audio_controls = null;
                }
            },
            // 音频参数设置
            audio_conf: function (key) {
                let that = this;
                let $checked = $('#page_contain .ele_item.checked');
                let type = $checked.attr('data-type');
                if ($checked.length !== 1 || type !== 'audio') {
                    return;
                }
                let option = opt_factory.init_opt(type);
                let value = !that.element_message[key];
                option.set_config($checked, key, value);
                that.$set(that.element_message, key, value);
            },
            // 设置音频渐强渐弱
            audio_fade: function (key, step) {
                let that = this;
                let $checked = $('#page_contain .ele_item.checked');
                let type = $checked.attr('data-type');
                if ($checked.length !== 1 || type !== 'audio') {
                    return;
                }
                let option = opt_factory.init_opt(type);
                let value = that.element_message[key];
                // 格式校验
                if (isNaN(value)) {
                    value = '00.00';
                } else {
                    value = Number(value).toFixed(2);
                }
                // 递减
                if (step === 'reduce') {
                    value = (Number(value) - 0.25).toFixed(2);
                } else 
                // 递增
                if (step === 'add') {
                    value = (Number(value) + 0.25).toFixed(2);
                }
                // 范围控制
                if (Number(value) <= 0) {
                    value = '00.00';
                }
                if (Number(value) > 300) {
                    value = '300.00';
                }
                option.set_config($checked, key, value);
                that.$set(that.element_message, key, value);
            },
            // 音频重置 
            audio_reset: function () {
                let that = this;
                let $checked = $('#page_contain .ele_item.checked');
                let type = $checked.attr('data-type');
                if ($checked.length !== 1 || type !== 'audio') {
                    return;
                }
                // 删除元素
                that.$parent.ele_delete();
                that.$nextTick(() => {
                    that.$parent.open_media_panel('audio');
                });
            },
            // 音频播放试听
            audio_try_play: function () {
                let audio = $('#page_contain .ele_item.checked audio')[0];
                if (!audio) {
                    return;
                }
                let option = opt_factory.init_opt('audio');
                option.fadein_and_fadeout(audio);
            },
            
            

            /** 
                艺术字相关设置 start
            */
            // 设置艺术字属性  ===>  data: 值, type: 属性, index: 用于判断修改的文本阴影
            set_art_text_style(data, type, index){
                let that = this;
                let option = opt_factory.init_opt('group');
                let $text = option.get_checked_element().element.find('.show_text');
                switch(type){
                    // 背景图尺寸
                    case 'bg_size': 
                        $text.css('backgroundSize', `${data}%`);
                        that.art_text_style['bg_size'].value = data;
                        break;
                    // 文本填充颜色
                    case 'fill_color': 
                         // 颜色转rgb
                        data = data.indexOf('rgb') >= 0 ? data : option.fn.color_exchange_function('hex',data);
                        $text.css('textFillColor', data);
                        that.art_text_style.text_fill_color = data;
                        break;
                    // 文本描边粗细
                    case 'stroke_width': 
                        $text.css('textStrokeWidth', `${data / 1000}em`);
                        that.art_text_style['stroke_width'].value = data;
                        break;
                    // 文本描边颜色
                    case 'stroke_color': 
                        data = data.indexOf('rgb') >= 0 ? data : option.fn.color_exchange_function('hex',data);
                        $text.css('textStrokeColor',data);
                        that.art_text_style.text_stroke_color = data;
                        break;
                    // 文本阴影颜色
                    case 'shadow_color':
                        // 颜色转rgb
                        let newcolor = data.indexOf('rgb') >= 0 ? data : option.fn.color_exchange_function('hex',data);
                        // 更改对应索引的阴影颜色
                        that.art_text_style.text_shadow[index]  = that.art_text_style.text_shadow[index].replace(that.art_text_style.text_shadow_color[index], newcolor);
                        that.art_text_style.text_shadow_color[index] = newcolor;
                        // 设置文本阴影
                        $text.css('textShadow', that.art_text_style.text_shadow.join(','));
                        break;
                }
            }
        },
    }
</script>

<style lang="less" scoped>
    /* 
        *    class模板:
        *        1.图标按钮 --> icon_btn
        *        2.下拉模块 --> pull_module
    */
    @bg_hover: #fafafa;

    // Edge滚动条隐藏
    *{
        -ms-overflow-style:none;
        scrollbar-width: none;
    }
    .format_panel_contain{
        height:100%;
        &.hide{
            height: 0;
        }
        &.mask{
            opacity:0.3;
            pointer-events:none;
        }
    }
    // 格式面版
    .format-contain{
        width: 300px;
        height: 100%;
        background: #ffffff;
        border-left: 5px solid #eeeeee;
        user-select: none;
        &.format-empty{
            .format-header .close{
                margin-left: auto;
            }
            .format-main{
                display: flex;
                border-top: none;
                .empty-group{
                    margin: auto;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    span{
                        margin-top: 20px;
                        font-size: 12px;
                        color: #666666;
                    }
                }
            }
        }
        .format-header{
            padding: 0 20px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            width: 100%;
            height: 57px;

            span{
                font-size: 14px;
                font-weight: 600;
                color: #444444;
            }

            .close{
                color: #999999;
                cursor: pointer;
                transition: transform .3s;
                &:hover{
                    transform: rotate(90deg);
                }
            }
        }

        .format-main{
            padding-bottom: 20px;
            width: 100%;
            height: calc(100% - 57px);
            border-top: 1px solid #eeeeee;
            overflow-y: auto;
            overflow-x: hidden;
            .un-able{
                opacity: .3;
                pointer-events: none;
                cursor:default !important;
            }

            // 组合
            >.bind-module{
                width: 100%;
                border-bottom: 1px solid #eeeeee;
                >.header-btn{
                    padding: 0 20px;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    width: 100%;
                    height: 50px;
                    cursor: pointer;
                    span{
                        font-size: 12px;
                        font-weight: 600;
                        color: #444444;
                    }

                    .btn-group{
                        display: flex;
                        button{
                            margin-right: 10px;
                            display: flex;
                            width: 24px;
                            height: 24px;
                            border-radius: 4px;
                            &:hover{
                                background: @bg_hover;
                            }
                            &.current{
                                background: #f4f4f4;
                            }
                            .base-icon{
                                margin: auto;
                            }
                        }
                    }
                }
            }
            // 位置大小
            >.layout-module{
                width: 100%;
                border-bottom: 1px solid #eeeeee;
                >.header-btn{
                    padding: 0 20px;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    width: 100%;
                    height: 50px;
                    cursor: pointer;
                    span{
                        font-size: 12px;
                        font-weight: 600;
                        color: #444444;
                    }
                    .arrow{
                        transform: rotate(180deg);
                        color: #444444;
                        transition: transform .3s;
                        &.current{
                            transform: rotate(270deg);
                        }
                    }
                }
                >.content{
                    padding: 5px 20px 20px 40px;
                    width: 100%;

                    // 画布对齐
                    .ele-align{
                        display: flex;
                        justify-content: space-between;
                        .align-item{
                            display: flex;
                            width: 24px;
                            height: 24px;
                            border-radius: 4px;
                            cursor: pointer;
                            &:hover{
                                background: @bg_hover;
                            }
                            .base-icon{
                                margin: auto;
                            }
                        }
                        .division{
                            display: flex;
                            width: 24px;
                            height: 24px;
                            .base-icon{
                                margin: auto;
                            }
                        }
                    }

                    // 位置 坐标
                    .position-group{
                        margin-top: 15px;
                        display: flex;
                        justify-content: space-between;
                    }

                    // 尺寸
                    .size-group{
                        margin-top: 20px;
                        display: flex;
                        justify-content: space-between;
                    }

                    // 旋转
                    .rotate-group{
                        margin-top: 20px;
                        display: flex;
                        align-items: center;
                        span{
                            font-size: 12px;
                            color: #444444;
                        }
                        .knob{
                            margin-left: 80px;
                        }
                        .unit-input{
                            margin-left: auto;
                            width: 80px;
                        }
                    }

                    // 翻转
                    .turn-group{
                        margin-top: 20px;
                        display: flex;
                        align-items: center;
                        justify-content: space-between;
                        span{
                            font-size: 12px;
                            color: #444444;
                        }
                        .reversal-grouo{
                            display: flex;
                            align-items: center;
                            height: 32px;
                            .reversal-btn{
                                margin: auto 5px;
                                display: flex;
                                width: 24px;
                                height: 24px;
                                border-radius: 4px;
                                cursor: pointer;
                                &:hover{
                                    background: @bg_hover;
                                }
                                .base-icon{
                                    margin: auto;
                                }
                            }
                        }
                    }
                }
            }
            // 文本格式
            >.style-module{
                width: 100%;
                border-bottom: 1px solid #eeeeee;
                >.header-btn{
                    padding: 0 20px;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    width: 100%;
                    height: 50px;
                    cursor: pointer;
                    span{
                        font-size: 12px;
                        font-weight: 600;
                        color: #444444;
                    }
                    .arrow{
                        transform: rotate(180deg);
                        color: #444444;
                        transition: transform .3s;
                        &.current{
                            transform: rotate(270deg);
                        }
                    }
                }
                >.content{
                    padding: 5px 20px 20px 40px;
                    display: flex;
                    flex-wrap: wrap;
                    justify-content: space-between;
                    width: 100%;

                    // 字体
                    .font-family{
                        position: relative;
                        width: 160px;
                        height: 32px;
                        background: #ffffff;
                        border: 1px solid #dddddd;
                        border-radius: 6px;
                        .family-btn{
                            padding: 0 10px;
                            display: flex;
                            justify-content: space-between;
                            align-items: center;
                            width: 100%;
                            height: 100%;
                            cursor: pointer;
                            span{
                                font-size: 12px;
                                font-weight: 700;
                            }

                            &::after{
                                content: '';
                                margin-top: 2px;
                                width: 0;
                                height: 0;
                                border-width: 4px;
                                border-style: solid;
                                border-color: #999999 transparent transparent transparent;

                            }
                            &.current::after{
                                margin-top: -2px;
                                border-color: transparent transparent #999999 transparent;
                            }
                        }

                        // 字体下拉列表
                        .font_family_list{
                            width: 100%;
                        }
                    }

                    // 字号
                    .font-size{
                        position: relative;
                        width: 60px;
                        height: 32px;
                        background: #ffffff;
                        border: 1px solid #dddddd;
                        border-radius: 6px;
                        .size-btn{
                            padding: 0 10px;
                            display: flex;
                            justify-content: space-between;
                            align-items: center;
                            width: 100%;
                            height: 100%;
                            cursor: pointer;
                            input{
                                width: 100%;
                                height: 100%;
                                font-size: 12px;
                                font-weight: 700;
                            }

                            &::after{
                                content: '';
                                margin-top: 2px;
                                width: 0;
                                height: 0;
                                border-width: 4px;
                                border-style: solid;
                                border-color: #999999 transparent transparent transparent;

                            }
                            &.current::after{
                                margin-top: -2px;
                                border-color: transparent transparent #999999 transparent;
                            }
                        }
                    }
                    .font-style-list{
                        margin-top: 15px;
                        display: flex;
                        justify-content: space-between;
                        width: 100%;

                        .font-style-btn{
                            width: 24px;
                            height: 24px;
                            border-radius: 4px;
                            &:hover{
                                background: @bg_hover;
                            }
                            &.current{
                                background: #f4f4f4;
                            }
                        }
                        
                        // 字体颜色
                        .font-color{
                            position: relative;
                            .font-color-btn {
                                display: flex;
                                flex-direction: column;
                                justify-content: center;
                                align-items: center;
                                .base-icon{
                                    color: #444444;
                                }
                                .color-line{
                                    display: block;
                                    width: 18px;
                                    height: 4px;
                                    margin: 0 auto;
                                    border: 1px solid #a9a9a9;
                                }
                            }

                            /deep/ .common_color{
                                top: calc(100% + 5px);
                                left: -25px;
                                right: 0;
                                margin: 0;
                            }

                        }

                        //字体加粗
                        .text_bold_panel{
                            .base-icon{
                                color: #444444;
                                &.bold{
                                    color: var(--mainColor);
                                }
                            }
                        }
                        // 斜体
                        .text_italic_panel{
                            .base-icon{
                                color: #444444;
                                &.italic{
                                    color: var(--mainColor);
                                }
                            }
                        }
                        // 下划线
                        .text_underline_panel{
                            .base-icon{
                                color: #444444;
                                &.underline{
                                    color: var(--mainColor);
                                }
                            }
                        }
                        // 中划线
                        .text_through_panel{
                            .base-icon{
                                color: #444444;
                                &.through{
                                    color: var(--mainColor);
                                }
                            }
                        }
                        // 高亮
                        .text-background{
                            position: relative;
                            .text_background_panel{
                                .base-icon{
                                    font-size: 14px;
                                    color: #444444;
                                }
                                .color-line{
                                    display:block;
                                    width: 20px;
                                    height: 4px;
                                    margin:0 auto;
                                    margin-top: -3px;
                                }
                            }

                            /deep/ .common_color{
                                right: -40px;
                            }
                        }
                        // 格式刷
                        .text-format{
                            .base-icon{
                                color: #444444;
                                &.through{
                                    color: var(--mainColor);
                                }
                            }
                        }
                        
                    }
                    
                }
            }
            // 文本调整
            >.text-align-module{
                width: 100%;
                border-bottom: 1px solid #eeeeee;
                >.header-btn{
                    padding: 0 20px;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    width: 100%;
                    height: 50px;
                    cursor: pointer;
                    span{
                        font-size: 12px;
                        font-weight: 600;
                        color: #444444;
                    }
                    .arrow{
                        transform: rotate(180deg);
                        color: #444444;
                        transition: transform .3s;
                        &.current{
                            transform: rotate(270deg);
                        }
                    }
                }
                >.content{
                    padding: 5px 20px 20px 40px;
                    width: 100%;
                    .text-align{
                        .title{
                            font-size: 12px;
                            color: #666666;
                        }
                        .btn-group{
                            margin-top: 10px;
                            display: flex;
                            width: 100%;
                            height: 30px;
                            border: 1px solid #dddddd;
                            border-radius: 6px;
                            >.btn{
                                flex: 1;
                                display: flex;
                                color: #666666;
                                cursor: pointer;
                                &:hover{
                                    background: @bg_hover;
                                }
                                &.current{
                                    background: #f4f4f4;
                                }
                                .base-icon{
                                    margin: auto;
                                }
                                span{
                                    margin-left: 5px;
                                    font-size: 12px;
                                    color: inherit;
                                }
                            }
                        }
                    }
                    .text-list{
                        padding-top: 20px;
                        .title{
                            font-size: 12px;
                            color: #666666;
                        }
                        .list-group{
                            margin-top: 10px;
                            display: flex;
                            justify-content: space-between;
                            .ul-menu-btn,
                            .ol-menu-btn{
                                padding: 0 10px;
                                position: relative;
                                display: flex;
                                align-items: center;
                                justify-content: space-between;
                                width: 110px;
                                height: 32px;
                                background: #ffffff;
                                border: 1px solid #dddddd;
                                border-radius: 6px;
                                cursor: pointer;

                                &:hover{
                                    background: @bg_hover;
                                }

                                >.base-icon{
                                    font-size: 20px;
                                    font-weight: bolder;
                                }

                                &::after{
                                    content: '';
                                    width: 0;
                                    height: 0;
                                    border-width: 4px;
                                    border-style: solid;
                                    transform: translateY(2px);
                                    border-color: #787f87 transparent transparent transparent;
                                }
                                &.current::after{
                                    transform: translateY(2px) rotate(180deg);
                                }

                                .menu-list{
                                    position: absolute;
                                    top: calc(100% + 5px);
                                    left: 0;
                                    z-index: 1;
                                    padding: 20px;
                                    width: 130px;
                                    background: #ffffff;
                                    border: 1px solid #eeeeee;
                                    border-radius: 6px;
                                    box-shadow: 0px 0px 8px 0px rgba(153,153,153,0.10); 

                                    >.label{
                                        font-size: 12px;
                                        color: #666666;
                                    }

                                    >.item-list{
                                        margin-top: 10px;
                                        display: flex;
                                        justify-content: space-between;
                                        flex-wrap: wrap;
                                        
                                        >.item{
                                            margin-bottom: 10px;
                                            display: flex;
                                            justify-content: center;
                                            align-items: center;
                                            width: 40px;
                                            height: 48px;
                                            font-size: 24px;
                                            border: 1px dashed #dddddd;
                                            cursor: pointer;
                                            &.none{
                                                font-size: 12px;
                                                font-weight: 400;
                                                color: #666666;
                                            }
                                            &:hover{
                                                background: @bg_hover;
                                            }
                                            &.current{
                                                background: #f4f4f4;
                                            }
                                            .base-icon{
                                                font-size: 45px;
                                                color: #666666;
                                            }
                                        }
                                    }

                                }
                            }
                        }
                    }
                    .text-range{
                        margin-top: 20px;
                        
                        .letter-space,
                        .line-height{
                            margin-top: 10px;
                            margin-bottom: 20px;
                            display: flex;
                            justify-content: space-between;
                            align-items: center;
                            span{
                                font-size: 12px;
                                color: #444444;
                            }
                            /deep/.unit-input{
                                width: 64px;
                                height: 32px;
                                .unit,
                                .btn-group{
                                    width: 20px;
                                }
                            }
                        }
                    }

                    // 艺术字设置
                    .art-text-module{
                        margin-top: 20px;
                        width: 100%;
                        >.title{
                            font-size: 12px;
                            color:#444444;
                        }
                        .art_setting_option{
                            margin-top: 20px;
                            display: flex;
                            justify-content: space-between;
                            align-items: center;

                            .option_title{
                                margin-right: 10px;
                                font-size: 12px;
                                color:#444444;
                            }
                            
                            .color_block{
                                position: relative;
                                width: 105px;
                                height: 25px;
                                padding: 4px;
                                background-color: #ffffff;
                                border-radius: 4px;
                                border: solid 1px #e9eaec;
                                transition: all 0.3s;
                                .edit-ico{
                                    vertical-align: top;
                                    height: 100%;
                                    width: 100%;
                                    cursor: pointer;
                                }
                                &:hover{
                                    border-color: var(--mainColor);
                                }
                            }
                            
                            .pull_module{
                                display: inline-block;
                                vertical-align: top;
                                width: 105px;
                                height: 25px;
                                line-height: 23px;
                                font-size: 12px;
                                ul{
                                    position: absolute;
                                    top: 27px;
                                    left: 0;
                                    width: 100%;
                                    height: auto;
                                    padding: 12px 1px;
                                    color: #707b8e;
                                    font-size: 12px;
                                    text-align: left;
                                    background-color: #ffffff;
                                    box-shadow: 0 9px 10px 0 rgba(0, 0, 0, 0.08);
                                    border: solid 1px #e9eaec;
                                    border-top: 0;
                                    z-index: 99;
                                    li{
                                        padding: 0;
                                        text-align: center;
                                        height: 30px;
                                        line-height: 30px;
                                        span{
                                            display: inline-block;
                                            vertical-align: middle;
                                            width: 80%;
                                            background: #727b93;
                                        }
                                    }
                                }
                            }

                            .color-group{
                                position: relative;
                                display: flex;
                                .gradient_color{
                                    margin-right: 10px;
                                    width: 50px;
                                    height: 25px;
                                    padding: 4px;
                                    background-color: #ffffff;
                                    border: solid 1px #e9eaec;
                                    border-radius: 4px;
                                    transition: all 0.3s;
                                    cursor: pointer;
                                    i{
                                        display: block;
                                        width: 100%;
                                        height: 100%;
                                    }
                                    &:hover{
                                        border-color: var(--mainColor);
                                    }
                                }
                                /deep/.common_color{
                                    top: 100%;
                                }
                            }
                        }
                    }
                }
            }
            // 样式设置
            >.appearance-module{
                width: 100%;
                border-bottom: 1px solid #eeeeee;
                >.header-btn{
                    padding: 0 20px;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    width: 100%;
                    height: 50px;
                    cursor: pointer;
                    span{
                        font-size: 12px;
                        font-weight: 600;
                        color: #444444;
                    }
                    .arrow{
                        transform: rotate(180deg);
                        color: #444444;
                        transition: transform .3s;
                        &.current{
                            transform: rotate(270deg);
                        }
                    }
                }
                >.content{
                    padding: 5px 20px 20px 40px;
                    width: 100%;

                    // 圆角
                    .filleted-corner{
                        display: flex;
                        align-items: flex-start;
                        .rect-fillet-group{
                            display: flex;
                            align-items: center;
                            span{
                                font-size: 12px;
                                color: #444444;
                            }

                            .opt{
                                margin-left: 10px;
                                display: flex;
                                border-radius: 5px;
                                border: 1px solid #dddddd;
                                button{
                                    display: flex;
                                    width: 32px;
                                    height: 32px;
                                    background: #ffffff;
                                    .base-icon{
                                        margin: auto;
                                        color: #444444;
                                    }
                                    &.current{
                                        background: var(--mainColor);
                                        .base-icon{
                                            color: #ffffff;
                                        }
                                    }
                                    &.all-btn{
                                        border-top-left-radius: 5px;
                                        border-bottom-left-radius: 5px;
                                    }
                                    &.split-btn{
                                        border-top-right-radius: 5px;
                                        border-bottom-right-radius: 5px;
                                    }
                                }
                            }

                            .border-all{
                                margin-left: 10px;
                                width: 48px;
                                height: 32px;
                                background: #ffffff;
                                border-radius: 5px;
                                /deep/.unit-input{
                                    width: 100%;
                                    height: 100%;
                                    .unit,
                                    .btn-group{
                                        width: 15px;
                                    }
                                }
                            }
                        }
                        .value-group {
                            margin-left: 10px;
                            display: flex;
                            justify-content: center;
                            align-items: center;
                            .rect-item {
                                display: flex;
                                justify-content: center;
                                align-items: center;
                                width: 32px;
                                height: 32px;
                                color: #444444;
                                border: 1px solid #eeeeee;
                                border-radius: 5px;
                                cursor: pointer;
                                &.current{
                                    color: #ffffff;
                                    background: var(--mainColor);
                                }
                                .base-icon{
                                    font-size: 20px;
                                    margin: auto;
                                }
                            }
                        }
                    }

                    // 填充
                    .fill{
                        margin-top: 20px;
                        display: flex;
                        align-items: center;
                        width: 100%;
                        .check-box{
                            display: flex;
                            width: 16px;
                            height: 16px;
                            border: 1px solid #dddddd;
                            border-radius: 5px;
                            cursor: pointer;
                            &.current{
                                border: none;
                                background: #444444;
                            }
                            .base-icon{
                                margin: auto;
                                font-size: 12px;
                                color: #ffffff;
                            }
                        }
                        .fill-group{
                            position: relative;
                            margin: 0 20px;
                            user-select: none;
                            .color{
                                display: flex;
                                justify-content: center;
                                align-items: center;
                                width: 20px;
                                height: 20px;
                                cursor: pointer;
                                .base-icon{
                                    font-size: 20px;
                                    transform: scale(1.2);
                                }
                                i{
                                    display: block;
                                    width: 100%;
                                    height: 100%;
                                    border-radius: 50%;
                                }
                            }
                            .fill-panel{
                                margin: 3px 0;
                                position: absolute;
                                top: 100%;
                                left: -71px;
                                z-index: 5;
                                width: 272px;
                                background: #ffffff;
                                border: 1px solid #eeeeee;
                                border-radius: 6px;
                                box-shadow: 0px 0px 8px 0px rgba(153,153,153,0.10); 
                                .fill-panel-header{
                                    display: flex;
                                    width: 100%;
                                    background: #fafafa;
                                    .fill-header-item{
                                        display: flex;
                                        justify-content: center;
                                        align-items: center;
                                        width: 82px;
                                        height: 40px;
                                        font-size: 12px;
                                        font-weight: 500;
                                        color: #444444;
                                        border-right: 1px solid #eeeeee;
                                        border-bottom: 1px solid #eeeeee;
                                        cursor: pointer;
                                        &.current{
                                            border-bottom: none;
                                            background: #ffffff;
                                        }
                                    }
                                    &::after{
                                        content: '';
                                        flex: 1;
                                        border-bottom: 1px solid #eeeeee;
                                    }
                                }

                                .fill-color-panel{
                                    position: relative;
                                    width: 100%;
                                    /deep/ .common_color{
                                        position: static;
                                        box-shadow: none;
                                        .color_menu{
                                            box-shadow: none;
                                            border: none;
                                        }
                                    }
                                }
                                .fill-gradient-panel{
                                    position: relative;
                                    width: 100%;
                                    /deep/.gradient_color_modal{
                                        position: static;
                                        box-shadow: none;
                                        border: none;
                                        border-radius: none;
                                    }
                                }
                                .fill-img-panel{
                                    padding: 20px 0;
                                    display: flex;
                                    flex-direction: column;
                                    align-items: center;
                                    width: 100%;
                                    .fill-img-btn{
                                        margin-bottom: 10px;
                                        display: flex;
                                        justify-content: center;
                                        align-items: center;
                                        width: 204px;
                                        height: 32px;
                                        background: #fafafa;
                                        border-radius: 5px;
                                        cursor: pointer;
                                        &:hover{
                                            background: #f4f4f4;
                                        }
                                        span{
                                            font-size: 12px;
                                            color: #444444;
                                        }
                                    }

                                    .fill-image-type{
                                        margin-top: 10px;
                                        display: flex;
                                        align-items: center;
                                        .cover,
                                        .repeat{
                                            margin: 0 15px;
                                            display: flex;
                                            align-items: center;

                                            .check-box{
                                                display: flex;
                                                width: 16px;
                                                height: 16px;
                                                border: 1px solid #dddddd;
                                                border-radius: 5px;
                                                cursor: pointer;
                                                &.current{
                                                    border: none;
                                                    background: #444444;
                                                }
                                                .base-icon{
                                                    margin: auto;
                                                    font-size: 12px;
                                                    color: #ffffff;
                                                }
                                            }
                                            span{
                                                margin-left: 10px;
                                                font-size: 12px;
                                                color: #444444;
                                            }
                                        }
                                    }
                                }
                            }
                        }

                        span{
                            font-size: 12px;
                            color: #444444
                        }

                        
                    }

                    // 描边
                    .line{
                        position: relative;
                        margin-top: 20px;
                        display: flex;
                        align-items: center;
                        width: 100%;
                        .check-box{
                            display: flex;
                            width: 16px;
                            height: 16px;
                            border: 1px solid #dddddd;
                            border-radius: 5px;
                            cursor: pointer;
                            &.current{
                                border: none;
                                background: #444444;
                            }
                            .base-icon{
                                margin: auto;
                                font-size: 12px;
                                color: #ffffff;
                            }
                        }
                        .color{
                            margin: 0 20px;
                            display: flex;
                            justify-content: center;
                            align-items: center;
                            width: 20px;
                            height: 20px;
                            cursor: pointer;
                            .base-icon{
                                font-size: 20px;
                                transform: scale(1.2);
                            }
                            i{
                                display: block;
                                width: 100%;
                                height: 100%;
                                border-radius: 50%;
                            }
                        }

                        span{
                            font-size: 12px;
                            color: #444444
                        }

                        /deep/.common_color{
                            top: 100%;
                        }
                    }
                    .line-panel{
                        padding: 10px 10px 0 30px;

                        // 描边样式
                        .border-style-group{
                            margin-top: 10px;
                            display: flex;
                            justify-content: space-between;
                            align-items: center;
                            .border-style-panel{
                                position: relative;
                                .border-style-btn{
                                    padding: 0 10px 0 15px;
                                    display: flex;
                                    align-items: center;
                                    width: 140px;
                                    height: 24px;
                                    background: #ffffff;
                                    border: 1px solid #dddddd;
                                    border-radius: 5px;
                                    cursor: pointer;
    
                                    &::after{
                                        content: '';
                                        margin-top: 2px;
                                        margin-left: auto;
                                        width: 0;
                                        height: 0;
                                        border-width: 4px;
                                        border-style: solid;
                                        border-color: #999999 transparent transparent transparent;
                                    }
                                    &.current::after {
                                        margin-top: -2px;
                                        border-color: transparent transparent #999999 transparent;
                                    }
                                }

                                .border_style_list{
                                    width: 100%;
                                }
                            }
                            span{
                                font-size: 12px;
                                font-weight: 400;
                                color: #444444;
                            }
                        }

                        // 描边粗细
                        .line-size{
                            margin-top: 10px;
                            display: flex;
                            justify-content: space-between;
                            align-items: center;
                            .line-size-panel{
                                display: flex;
                                align-items: center;
                                width: 140px;
                                height: 24px;
                                background: #ffffff;
                                border: 1px solid #dddddd;
                                border-radius: 5px;
                                cursor: pointer;
                                input{
                                    padding: 0 10px;
                                    width: 100%;
                                    height: 100%;
                                    font-size: 12px;
                                    font-weight: 400;
                                    color: #111111;
                                }
                                >span{
                                    font-size: 12px;
                                    font-weight: 400;
                                    color: #444444;
                                }
                                .btn-group{
                                    display: flex;
                                    flex-direction: column;
                                    width: 30px;

                                    button{
                                        flex: 1;
                                        width: 100%;
                                        cursor: pointer;
                                        &::after {
                                            content: '';
                                            display: block;
                                            margin: auto;
                                            width: 0;
                                            height: 0;
                                            border-width: 4px;
                                            border-style: solid;
                                        }
                                    }
                                    button.add-btn {
                                        &::after {
                                            margin: auto auto 2px auto;
                                            border-color: transparent transparent #999999 transparent;
                                        }
                                        &:hover::after {
                                            border-bottom-color: var(--mainColor);
                                        }
                                    }

                                    button.cut-btn {
                                        &::after {
                                            margin: 2px auto auto auto;
                                            border-color: #999999 transparent transparent transparent;
                                        }
                                        &:hover::after {
                                            border-top-color: var(--mainColor);
                                        }
                                    }
                                }

                            }
                            >span{
                                font-size: 12px;
                                font-weight: 400;
                                color: #444444;
                            }
                        }

                        // 线条头部样式
                        .line-left{
                            margin-top: 10px;
                            display: flex;
                            justify-content: space-between;
                            align-items: center;
                            .line-left-panel{
                                position: relative;
                                .line-left-btn{
                                    padding: 0 10px 0 15px;
                                    display: flex;
                                    align-items: center;
                                    width: 140px;
                                    height: 24px;
                                    background: #ffffff;
                                    border: 1px solid #dddddd;
                                    border-radius: 5px;
                                    cursor: pointer;
    
                                    &::after{
                                        content: '';
                                        margin-top: 2px;
                                        margin-left: auto;
                                        width: 0;
                                        height: 0;
                                        border-width: 4px;
                                        border-style: solid;
                                        border-color: #999999 transparent transparent transparent;
                                    }
                                    &.current::after {
                                        margin-top: -2px;
                                        border-color: transparent transparent #999999 transparent;
                                    }
                                }

                                .module_list{
                                    width: 100%;
                                }
                            }
                            span{
                                font-size: 12px;
                                font-weight: 400;
                                color: #444444;
                            }
                        }

                        // 线条尾部样式
                        .line-right{
                            margin-top: 10px;
                            display: flex;
                            justify-content: space-between;
                            align-items: center;
                            .line-right-panel{
                                position: relative;
                                .line-right-btn{
                                    padding: 0 10px 0 15px;
                                    display: flex;
                                    align-items: center;
                                    width: 140px;
                                    height: 24px;
                                    background: #ffffff;
                                    border: 1px solid #dddddd;
                                    border-radius: 5px;
                                    cursor: pointer;
    
                                    &::after{
                                        content: '';
                                        margin-top: 2px;
                                        margin-left: auto;
                                        width: 0;
                                        height: 0;
                                        border-width: 4px;
                                        border-style: solid;
                                        border-color: #999999 transparent transparent transparent;
                                    }
                                    &.current::after {
                                        margin-top: -2px;
                                        border-color: transparent transparent #999999 transparent;
                                    }
                                }

                                .module_list{
                                    width: 100%;
                                }
                            }
                            span{
                                font-size: 12px;
                                font-weight: 400;
                                color: #444444;
                            }
                        }
                    }

                    // 阴影
                    .shadow{
                        position: relative;
                        margin-top: 20px;
                        display: flex;
                        align-items: center;
                        width: 100%;
                        .check-box{
                            display: flex;
                            width: 16px;
                            height: 16px;
                            border: 1px solid #dddddd;
                            border-radius: 5px;
                            cursor: pointer;
                            &.current{
                                border: none;
                                background: #444444;
                            }
                            .base-icon{
                                margin: auto;
                                font-size: 12px;
                                color: #ffffff;
                            }
                        }
                        .color{
                            margin: 0 20px;
                            display: flex;
                            justify-content: center;
                            align-items: center;
                            width: 20px;
                            height: 20px;
                            cursor: pointer;
                            .base-icon{
                                font-size: 20px;
                                transform: scale(1.2);
                            }
                            i{
                                display: block;
                                width: 100%;
                                height: 100%;
                                border-radius: 50%;
                            }
                        }

                        span{
                            font-size: 12px;
                            color: #444444
                        }

                        /deep/.common_color{
                            top: 100%;
                        }
                    }

                    .shadow-panel{
                        padding: 10px 10px 0 30px;

                        .shadow-style{
                            margin-top: 20px;
                            position: relative;
                            .shadow-style-btn{
                                width: 100%;
                                height: 31px;
                                background: #fafafa;
                                border-radius: 5px;
                                cursor: pointer;
                                &.current{
                                    background: #f4f4f4;
                                }
                            }
                            .preset_list{
                                display: flex;
                                flex-wrap: wrap;
                                justify-content: space-between;
                                position: absolute;
                                z-index: 1;
                                top: 100%;
                                width: 100%;
                                height: 170px;
                                padding: 15px 5px 10px;
                                background-color: #ffffff;
                                border-radius: 5px;
                                box-shadow: 0px 0px 8px 0px rgba(153,153,153,0.10); 
                                border: solid 1px rgba(194, 201, 211, 0.32);
                                cursor: default;
                                .preset_item{
                                    width: 44px;
                                    height: 44px;
                                    margin: 0 7px 5px 0;
                                    background: #ffffff;
                                    border-radius: 4px;
                                    text-align: center;
                                    cursor: pointer;
                                    span{
                                        display: inline-block;
                                        width: 28px;
                                        height: 28px;
                                        margin-top: 8px;
                                        border-radius: 4px;
                                        border: solid 1px #898989;
                                        background-image: linear-gradient(-42deg, #afafaf 0%, #ffffff 100%), linear-gradient(#ffffff, #ffffff);
                                    }
                                    &:hover,&.current span{
                                        border-color: var(--mainColor);
                                    }
                                }
                            }
                        }

                        .shadow-group{
                            margin-top: 20px;
                            display: flex;
                            justify-content: space-between;
                            width: 100%;

                            .shadow-value-item{
                                display: flex;
                                flex-direction: column;
                                justify-content: center;
                                width: 48px;
                                /deep/.unit-input{
                                    width: 100%;
                                    height: 23px;
                                    background: #ffffff;
                                    border: 1px solid #dddddd;
                                    border-radius: 5px;
                                    .unit,
                                    .btn-group{
                                        width: 15px;
                                    }
                                }
                                span{
                                    font-size: 12px;
                                    color: #999999;
                                    text-align: center;
                                }
                            }
                        }
                    }


                }
            }
            // 编辑图表
            >.edit-chart{
                width: 100%;
                border-bottom: 1px solid #eeeeee;
                >.header-btn{
                    padding: 0 20px;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    width: 100%;
                    height: 50px;
                    cursor: pointer;
                    span{
                        font-size: 12px;
                        font-weight: 600;
                        color: #444444;
                    }
                    .arrow{
                        transform: rotate(180deg);
                        color: #444444;
                        transition: transform .3s;
                        &.current{
                            transform: rotate(270deg);
                        }
                    }
                }
                >.content{
                    padding: 5px 20px 20px 40px;
                    width: 100%;
                    // 替换图表样式
                    .replace-panel{
                        position: relative;
                        width: 100%;
                        button{
                            display: flex;
                            justify-content: center;
                            align-items: center;
                            width: 100%;
                            height: 32px;
                            background: #fafafa;
                            border-radius: 5px;
                            cursor: pointer;
                            &.current{
                                background: #f4f4f4;
                            }
                        }
                        .chart-list{
                            padding: 20px;
                            position: absolute;
                            top: 100%;
                            left: 0;
                            z-index: 3;
                            margin: 3px 0;
                            display: flex;
                            justify-content: center;
                            align-items: center;
                            width: 100%;
                            background: #ffffff;
                            border: 1px solid #eeeeee;
                            border-radius: 6px;
                            box-shadow: 0px 0px 8px 0px rgba(153,153,153,0.10); 
                            ul {
                                li{
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
                                    &.current{
                                        opacity: .5;
                                        pointer-events: none;
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
                    // 项目编辑
                    .item-edit-panel{
                        margin-top: 10px;
                        .chart_data_table {
                            position: relative;
                            display: table;
                            border: solid 1px #e0e1e4;
                            background-color: #ffffff;
                            border-radius: 4px;
                            margin-bottom: 18px;
                            .chart_data_col {
                                position: relative;
                                width: 100%;
                                border-bottom: solid 1px #e0e1e4;
                                &:hover {
                                    .col_delete {
                                        opacity: 1;
                                    }
                                }
                                .col_item {
                                    display: table-cell;
                                    height: 34px;
                                    line-height: 34px;
                                    width: 28%;
                                    vertical-align: top;
                                    & + .col_item{
                                        width: auto;
                                        border-left: solid 1px #e0e1e4;
                                        text-align: center;
                                    }
                                }
                                input {
                                    display: block;
                                    width: 100%;
                                    height: 100%;
                                    padding: 4px;
                                    font-size: 12px;
                                    color: #545f72;
                                    outline: 2px solid transparent;
                                    text-align: inherit;
                                    transition: outline 0.2s;
                                    &::placeholder {
                                        color: #c8c8c8;
                                    }
                                    &:focus {
                                        outline-color: var(--mainColor);
                                    }
                                    &[disabled] {
                                        cursor: no-drop;
                                    }
                                }
                                .col_delete {
                                    position: absolute;
                                    left: -8px;
                                    top: 50%;
                                    margin-top: -7px;
                                    width: 14px;
                                    height: 14px;
                                    border-radius: 50%;
                                    background-color: #ff3b3f;
                                    opacity: 0;
                                    transition: all 0.2s;
                                    &::before {
                                        content: "";
                                        position: absolute;
                                        top: 0;
                                        left: 0;
                                        bottom: 0;
                                        right: 0;
                                        width: 6px;
                                        height: 2px;
                                        margin: auto;
                                        background-color: #ffffff;
                                    }
                                }
                            }
                            .chart_data_add {
                                position: relative;
                                width: 100%;
                                height: 34px;
                                line-height: 34px;
                                font-size: 32px;
                                text-align: center;
                                color: #545f72;
                            }
                        }
                    }

                    // X轴名称
                    .x-name{
                        margin-top: 20px;
                        display: flex;
                        align-items: center;
                        justify-content: space-between;
                        span{
                            font-size: 12px;
                            font-weight: 400;
                            color: #444444;
                        }
                        input{
                            padding-left: 10px;
                            width: 120px;
                            height: 32px;
                            background: #ffffff;
                            border: 1px solid #dddddd;
                            border-radius: 5px;
                        }
                    }
                    
                    // Y轴名称
                    .y-name{
                        margin-top: 10px;
                        display: flex;
                        align-items: center;
                        justify-content: space-between;
                        span{
                            font-size: 12px;
                            font-weight: 400;
                            color: #444444;
                        }
                        input{
                            padding-left: 10px;
                            width: 120px;
                            height: 32px;
                            background: #ffffff;
                            border: 1px solid #dddddd;
                            border-radius: 5px;
                        }
                    }

                    // 折线设置
                    .chart-set-line-group {
                        margin-top: 10px;
                        position: relative;
                        /deep/ .common_color {
                            top: 100%;
                        }
                        .chart_set_item {
                            position: relative;
                            height: 30px;
                            line-height: 30px;
                            margin-bottom: 12px;
                            &.btn_item {
                                height: 22px;
                                line-height: 22px;
                                margin-bottom: 18px;
                            }
                            >span {
                                float: left;
                                font-weight: 400;
                                color: #444444;
                            }
                            >input {
                                float: right;
                                width: 150px;
                                height: 30px;
                                padding: 0 4px;
                                background-color: #ffffff;
                                border-radius: 4px;
                                border: solid 1px rgba(233, 234, 236, 0.72);
                                transition: all 0.2s;
                                &:focus {
                                    border-color: var(--mainColor);
                                }
                            }
                            .toggle_round_btn {
                                float: right;
                            }
                            .item_theme_color {
                                width: 100%;
                                padding: 5px 0 0 80px;
                                line-height: 20px;
                                font-size: 0;
                                .color_block {
                                    display: inline-block;
                                    width: 20px;
                                    height: 20px;
                                    margin-left: 6px;
                                    border-radius: 4px;
                                    cursor: pointer;
                                }
                            }
                            .line_style_item {
                                float: right;
                                height: 30px;
                                font-size: 0;
                                .line_style_width {
                                    display: inline-block;
                                    vertical-align: middle;
                                    width: 50px;
                                    height: 28px;
                                    line-height: 26px;
                                    background-color: #ffffff;
                                    font-size: 12px;
                                    color: #707b8e;
                                    text-align: center;
                                    border-radius: 4px;
                                    border: solid 1px rgba(233, 234, 236, 0.72);
                                    transition: all 0.2s;
                                    &:focus {
                                        border-color: var(--mainColor);
                                    }
                                }
                                .line_style_type {
                                    padding-left: 12px;
                                    margin-left: 8px;
                                    position: relative;
                                    display: inline-block;
                                    vertical-align: middle;
                                    width: 80px;
                                    height: 28px;
                                    line-height: 26px;
                                    text-align: left;
                                    background-color: #ffffff;
                                    border-radius: 4px;
                                    border: solid 1px rgba(233, 234, 236, 0.72);
                                    transition: all 0.3s;
                                    cursor: pointer;
                                    overflow: hidden;
                                    &.show {
                                        overflow: visible;
                                        .pull_module_btn::after{
                                            top: 6px;
                                            transform: rotate(180deg);
                                            border-color: var(--mainColor) transparent transparent transparent;
                                        }
                                        .module_list {
                                            opacity: 1;
                                        }
                                    }
                                    .pull_module_btn{
                                        display: block;
                                        width: 100%;
                                        height: 100%;
                                        .module_display {
                                            display: inline-block;
                                            vertical-align: middle;
                                            width: 70%;
                                            height: 100%;
                                            color: #707b8e;
                                            font-size: 12px;
                                            white-space: nowrap;
                                            overflow: hidden;
                                        }
                                        &::after{
                                            content: '';
                                            position: absolute;
                                            right: 7px;
                                            top: 10px;
                                            width: 0;
                                            height: 0;
                                            border-width: 4px;
                                            border-style: solid;
                                            border-color: #9aa2ae transparent transparent transparent;
                                            transition: all 0.3s;
                                        }
                                    }
                                    .module_list {
                                        opacity: 0;
                                        transition: all 0.3s;
                                        li {
                                            padding: 0 8;
                                            overflow: hidden;
                                            &:hover {
                                                background-color: #70727c1a;
                                            }
                                            .edit-ico {
                                                width: 58px;
                                            }
                                        }
                                    }
                                }
                                .line_style_color {
                                    display: inline-block;
                                    vertical-align: middle;
                                    width: 28px;
                                    height: 28px;
                                    margin-left: 8px;
                                    border-radius: 4px;
                                    cursor: pointer;
                                }
                            }
                        }
                    }

                    // 显示图例
                    .show-legend{
                        margin-top: 20px;
                        display: flex;
                        justify-content: space-between;
                        span{
                            font-size: 12px;
                            font-weight: 400;
                            color: #444444;
                        }
                        .on-off{
                            display: flex;
                            width: 28px;
                            height: 16px;
                            border: 1px solid #dddddd;
                            border-radius: 8px;
                            cursor: pointer;
                            >.slider{
                                margin: auto auto auto 2px;
                                display: block;
                                width: 10px;
                                height: 10px;
                                background: #dddddd;
                                border-radius: 50%;
                                transition: margin .8s;
                            }

                            &.current .slider{
                                margin: auto 2px auto auto;
                                background: var(--mainColor);
                            }
                        }
                    }

                    // 显示数值
                    .show-value{
                        margin-top: 20px;
                        display: flex;
                        justify-content: space-between;
                        span{
                            font-size: 12px;
                            font-weight: 400;
                            color: #444444;
                        }
                        .on-off{
                            display: flex;
                            width: 28px;
                            height: 16px;
                            border: 1px solid #dddddd;
                            border-radius: 8px;
                            cursor: pointer;
                            >.slider{
                                margin: auto auto auto 2px;
                                display: block;
                                width: 10px;
                                height: 10px;
                                background: #dddddd;
                                border-radius: 50%;
                                transition: margin .8s;
                            }

                            &.current .slider{
                                margin: auto 2px auto auto;
                                background: var(--mainColor);
                            }
                        }
                    }

                    // 显示百分比
                    .show-percentage{
                        margin-top: 20px;
                        display: flex;
                        justify-content: space-between;
                        span{
                            font-size: 12px;
                            font-weight: 400;
                            color: #444444;
                        }
                        .on-off{
                            display: flex;
                            width: 28px;
                            height: 16px;
                            border: 1px solid #dddddd;
                            border-radius: 8px;
                            cursor: pointer;
                            >.slider{
                                margin: auto auto auto 2px;
                                display: block;
                                width: 10px;
                                height: 10px;
                                background: #dddddd;
                                border-radius: 50%;
                                transition: margin .8s;
                            }

                            &.current .slider{
                                margin: auto 2px auto auto;
                                background: var(--mainColor);
                            }
                        }
                    }

                    // 数值标签内部显示
                    .show-tag{
                        margin-top: 20px;
                        display: flex;
                        justify-content: space-between;
                        span{
                            font-size: 12px;
                            font-weight: 400;
                            color: #444444;
                        }
                        .on-off{
                            display: flex;
                            width: 28px;
                            height: 16px;
                            border: 1px solid #dddddd;
                            border-radius: 8px;
                            cursor: pointer;
                            >.slider{
                                margin: auto auto auto 2px;
                                display: block;
                                width: 10px;
                                height: 10px;
                                background: #dddddd;
                                border-radius: 50%;
                                transition: margin .8s;
                            }

                            &.current .slider{
                                margin: auto 2px auto auto;
                                background: var(--mainColor);
                            }
                        }
                    }

                    // 环形图
                    .show-ring-chart{
                        margin-top: 20px;
                        display: flex;
                        justify-content: space-between;
                        span{
                            font-size: 12px;
                            font-weight: 400;
                            color: #444444;
                        }
                        .on-off{
                            display: flex;
                            width: 28px;
                            height: 16px;
                            border: 1px solid #dddddd;
                            border-radius: 8px;
                            cursor: pointer;
                            >.slider{
                                margin: auto auto auto 2px;
                                display: block;
                                width: 10px;
                                height: 10px;
                                background: #dddddd;
                                border-radius: 50%;
                                transition: margin .8s;
                            }

                            &.current .slider{
                                margin: auto 2px auto auto;
                                background: var(--mainColor);
                            }
                        }
                    }

                    // 南丁格尔玫瑰图
                    .show-rose{
                        margin-top: 20px;
                        display: flex;
                        justify-content: space-between;
                        span{
                            font-size: 12px;
                            font-weight: 400;
                            color: #444444;
                        }
                        .on-off{
                            display: flex;
                            width: 28px;
                            height: 16px;
                            border: 1px solid #dddddd;
                            border-radius: 8px;
                            cursor: pointer;
                            >.slider{
                                margin: auto auto auto 2px;
                                display: block;
                                width: 10px;
                                height: 10px;
                                background: #dddddd;
                                border-radius: 50%;
                                transition: margin .8s;
                            }

                            &.current .slider{
                                margin: auto 2px auto auto;
                                background: var(--mainColor);
                            }
                        }
                    }

                    // 堆叠放置
                    .show-heap{
                        margin-top: 20px;
                        display: flex;
                        justify-content: space-between;
                        span{
                            font-size: 12px;
                            font-weight: 400;
                            color: #444444;
                        }
                        .on-off{
                            display: flex;
                            width: 28px;
                            height: 16px;
                            border: 1px solid #dddddd;
                            border-radius: 8px;
                            cursor: pointer;
                            >.slider{
                                margin: auto auto auto 2px;
                                display: block;
                                width: 10px;
                                height: 10px;
                                background: #dddddd;
                                border-radius: 50%;
                                transition: margin .8s;
                            }

                            &.current .slider{
                                margin: auto 2px auto auto;
                                background: var(--mainColor);
                            }
                        }
                    }

                    // 自定义颜色
                    .custom-color{
                        margin-top: 20px;
                        display: flex;
                        justify-content: space-between;
                        span{
                            font-size: 12px;
                            font-weight: 400;
                            color: #444444;
                        }

                        .color-group{
                            position: relative;
                            display: flex;
                            flex-wrap: wrap;
                            max-width: 180px;
                            .color-block{
                                margin-right: 5px;
                                width: 20px;
                                height: 20px;
                                border-radius: 50%;
                                cursor: pointer;
                            }
                        }

                    }


                }
            }
            // 透明度
            >.transparency-module{
                width: 100%;
                border-bottom: 1px solid #eeeeee;
                >.header-btn{
                    padding: 0 20px;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    width: 100%;
                    height: 50px;
                    cursor: pointer;
                    span{
                        font-size: 12px;
                        font-weight: 600;
                        color: #444444;
                    }
                    .arrow{
                        transform: rotate(180deg);
                        color: #444444;
                        transition: transform .3s;
                        &.current{
                            transform: rotate(270deg);
                        }
                    }
                }
                >.content{
                    padding: 5px 20px 20px 40px;
                    width: 100%;

                    .transparency-group{
                        display: flex;
                        justify-content: center;
                        align-items: center;
                        .input{
                            margin-left: 35px;
                            font-size: 12px;
                            position: relative;
                            display: flex;
                            justify-content: center;
                            align-items: center;
                            width: 50px;
                            height: 24px;
                            text-align: center;
                            color: #444444;
                            border: 1px solid #dddddd;
                            border-radius: 6px;
                            user-select: none;
                            &::after{
                                content: '%';
                                position: absolute;
                                top: 50%;
                                right: 5px;
                                transform: translateY(-50%);
                                display: flex;
                                align-items: center;
                                height: 100%;

                            }
                            input{
                                padding-top: 2px;
                                padding-right: 18px;
                                padding-left: 5px;
                                width: 100%;
                                height: 100%;
                                line-height: 24px;
                                color: #444444;
                            }
                        }
                        
                    }
                }
            }
            // 音频设置
            >.audio-setup-module{
                width: 100%;
                border-bottom: 1px solid #eeeeee;
                >.header-btn{
                    padding: 0 20px;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    width: 100%;
                    height: 50px;
                    cursor: pointer;
                    span{
                        font-size: 12px;
                        font-weight: 600;
                        color: #444444;
                    }
                    .arrow{
                        transform: rotate(180deg);
                        color: #444444;
                        transition: transform .3s;
                        &.current{
                            transform: rotate(270deg);
                        }
                    }
                }
                >.content{
                    padding: 5px 20px 20px 40px;
                    width: 100%;

                    // 渐强
                    .fade-in{
                        margin-top: 20px;
                        display: flex;
                        justify-content: space-between;
                        align-items: center;
                        span{
                            font-size: 12px;
                            font-weight: 400;
                            color: #444444;
                        }
                        
                    }

                    // 渐弱
                    .fade-out{
                        margin-top: 10px;
                        display: flex;
                        justify-content: space-between;
                        align-items: center;
                        span{
                            font-size: 12px;
                            font-weight: 400;
                            color: #444444;
                        }
                        
                    }

                    // 自动播放
                    .autoplay{
                        margin-top: 20px;
                        display: flex;
                        justify-content: space-between;
                        align-items: center;
                        span{
                            font-size: 12px;
                            font-weight: 400;
                            color: #444444;
                        }
                        .on-off{
                            display: flex;
                            width: 28px;
                            height: 16px;
                            border: 1px solid #dddddd;
                            border-radius: 8px;
                            cursor: pointer;
                            >.slider{
                                margin: auto auto auto 2px;
                                display: block;
                                width: 10px;
                                height: 10px;
                                background: #dddddd;
                                border-radius: 50%;
                                transition: margin .8s;
                            }

                            &.current .slider{
                                margin: auto 2px auto auto;
                                background: var(--mainColor);
                            }
                        }
                    }

                    // 循环
                    .loop{
                        margin-top: 20px;
                        display: flex;
                        justify-content: space-between;
                        align-items: center;
                        span{
                            font-size: 12px;
                            font-weight: 400;
                            color: #444444;
                        }
                        .on-off{
                            display: flex;
                            width: 28px;
                            height: 16px;
                            border: 1px solid #dddddd;
                            border-radius: 8px;
                            cursor: pointer;
                            >.slider{
                                margin: auto auto auto 2px;
                                display: block;
                                width: 10px;
                                height: 10px;
                                background: #dddddd;
                                border-radius: 50%;
                                transition: margin .8s;
                            }

                            &.current .slider{
                                margin: auto 2px auto auto;
                                background: var(--mainColor);
                            }
                        }
                    }

                    // 播放时隐藏图标
                    .hideonshow{
                        margin-top: 20px;
                        display: flex;
                        justify-content: space-between;
                        align-items: center;
                        span{
                            font-size: 12px;
                            font-weight: 400;
                            color: #444444;
                        }
                        .on-off{
                            display: flex;
                            width: 28px;
                            height: 16px;
                            border: 1px solid #dddddd;
                            border-radius: 8px;
                            cursor: pointer;
                            >.slider{
                                margin: auto auto auto 2px;
                                display: block;
                                width: 10px;
                                height: 10px;
                                background: #dddddd;
                                border-radius: 50%;
                                transition: margin .8s;
                            }

                            &.current .slider{
                                margin: auto 2px auto auto;
                                background: var(--mainColor);
                            }
                        }
                    }
                }
            }

            // 视频设置
            >.video-setup-module{
                width: 100%;
                border-bottom: 1px solid #eeeeee;
                >.header-btn{
                    padding: 0 20px;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    width: 100%;
                    height: 50px;
                    cursor: pointer;
                    span{
                        font-size: 12px;
                        font-weight: 600;
                        color: #444444;
                    }
                    .arrow{
                        transform: rotate(180deg);
                        color: #444444;
                        transition: transform .3s;
                        &.current{
                            transform: rotate(270deg);
                        }
                    }
                }
                >.content{
                    padding: 5px 20px 20px 40px;
                    width: 100%;

                    // 显示控制栏
                    .show-controls{
                        margin-top: 20px;
                        display: flex;
                        justify-content: space-between;
                        align-items: center;
                        span{
                            font-size: 12px;
                            font-weight: 400;
                            color: #444444;
                        }
                        .on-off{
                            display: flex;
                            width: 28px;
                            height: 16px;
                            border: 1px solid #dddddd;
                            border-radius: 8px;
                            
                            >.slider{
                                margin: auto auto auto 2px;
                                display: block;
                                width: 10px;
                                height: 10px;
                                background: #dddddd;
                                border-radius: 50%;
                                transition: margin .8s;
                            }

                            &.current .slider{
                                margin: auto 2px auto auto;
                                background: var(--mainColor);
                            }
                        }
                    }

                    // 自动播放
                    .autoplay{
                        margin-top: 20px;
                        display: flex;
                        justify-content: space-between;
                        align-items: center;
  
                        span{
                            font-size: 12px;
                            font-weight: 400;
                            color: #444444;
                        }
                        .on-off{
                            display: flex;
                            width: 28px;
                            height: 16px;
                            border: 1px solid #dddddd;
                            border-radius: 8px;
                            cursor: pointer;
                            >.slider{
                                margin: auto auto auto 2px;
                                display: block;
                                width: 10px;
                                height: 10px;
                                background: #dddddd;
                                border-radius: 50%;
                                transition: margin .8s;
                            }

                            &.current .slider{
                                margin: auto 2px auto auto;
                                background: var(--mainColor);
                            }
                        }
                    }

                    // 循环
                    .loop{
                        margin-top: 20px;
                        display: flex;
                        justify-content: space-between;
                        align-items: center;
                        span{
                            font-size: 12px;
                            font-weight: 400;
                            color: #444444;
                        }
                        .on-off{
                            display: flex;
                            width: 28px;
                            height: 16px;
                            border: 1px solid #dddddd;
                            border-radius: 8px;
                            cursor: pointer;
                            >.slider{
                                margin: auto auto auto 2px;
                                display: block;
                                width: 10px;
                                height: 10px;
                                background: #dddddd;
                                border-radius: 50%;
                                transition: margin .8s;
                            }

                            &.current .slider{
                                margin: auto 2px auto auto;
                                background: var(--mainColor);
                            }
                        }
                    }

                    // 播放时隐藏图标
                    .muted{
                        margin-top: 20px;
                        display: flex;
                        justify-content: space-between;
                        align-items: center;
                        span{
                            font-size: 12px;
                            font-weight: 400;
                            color: #444444;
                        }
                        .on-off{
                            display: flex;
                            width: 28px;
                            height: 16px;
                            border: 1px solid #dddddd;
                            border-radius: 8px;
                            cursor: pointer;
                            >.slider{
                                margin: auto auto auto 2px;
                                display: block;
                                width: 10px;
                                height: 10px;
                                background: #dddddd;
                                border-radius: 50%;
                                transition: margin .8s;
                            }

                            &.current .slider{
                                margin: auto 2px auto auto;
                                background: var(--mainColor);
                            }
                        }
                    }

                    .disable[custom-tip] {
                        position: relative;
                        opacity: .8;
                        cursor: no-drop;
                        &::after {
                            content: attr(custom-tip);
                            position: absolute;
                            top: 50%;
                            left: 50%;
                            z-index: 2;
                            line-height: 1;
                            padding: 4px;
                            background-color: rgba(0,0,0,0.6);
                            color: #fff;
                            border-radius: 3px;
                            opacity: 0;
                            transform: translate(-50%, -50%);
                            transition: opacity 0.2s;
                        }

                        &:hover::after{
                            opacity: 1;
                        }
                    }

                    // 视频封面
                    .video-cover{
                        margin-top: 20px;
                        position: relative;
                        width: 100%;
                        height: 135px;
                        #upload_video_cover{
                            display: none;
                        }
                        .video-cover-img{
                            position: relative;
                            width: 100%;
                            height: 100%;
                            img{
                                display: block;
                                width: 100%;
                                height: 100%;
                                object-fit: cover;
                            }
                            &:hover .mask{
                                opacity: 1;
                            }
                            .mask{
                                position: absolute;
                                top: 0;
                                left: 0;
                                display: flex;
                                width: 100%;
                                height: 100%;
                                opacity: 0;
                                transition: .5s;
                                .del-cover{
                                    position: absolute;
                                    top: 10px;
                                    left: 10px;
                                    display: flex;
                                    width: 24px;
                                    height: 24px;
                                    background: rgba(0, 0, 0, 0.5);
                                    border-radius: 5px;
                                    cursor: pointer;
                                    .base-icon{
                                        margin: auto;
                                        color: #ffffff;
                                    }
                                    &:hover .base-icon{
                                        color: #fafafa;
                                    }
                                }
                                .replace-cover{
                                    position: relative;
                                    margin: auto;
                                    display: flex;
                                    color: #ffffff;
                                    cursor: pointer;
                                    &:hover{
                                        color: #fafafa;
                                    }
                                    span{
                                        margin-left: 5px;
                                        font-size: 14px;
                                        font-weight: 500;
                                    }
                                }
                            }
                        }
                        .video-upload-cover{
                            display: flex;
                            width: 100%;
                            height: 100%;
                            background: #ffffff;
                            border: 1px dashed #eeeeee;
                            .replace-cover{
                                margin: auto;
                                display: flex;
                                color: #000000;
                                cursor: pointer;
                                &:hover{
                                    color: var(--mainColor);
                                }
                                span{
                                    margin-left: 5px;
                                    font-size: 14px;
                                    font-weight: 500;
                                }
                            }
                        }
                        
                    }
                }
            }

            .table-more{
                padding: 20px 20px 20px 40px;
                width: 100%;
                // 替换对象
                .replace-panel{
                    position: relative;
                    width: 100%;

                    button{
                        display: flex;
                        justify-content: center;
                        align-items: center;
                        width: 100%;
                        height: 32px;
                        background: #fafafa;
                        border-radius: 5px;
                        cursor: pointer;
                        &.current{
                            background: #f4f4f4;
                        }
                    }
                    .preset_list_wrapper{
                        position:absolute;
                        top: 100%;
                        left: 0;
                        width: 100%;
                        height: auto;
                        padding:10px 15px 20px;
                        border-radius:4px;
                        box-shadow:0px 9px 10px 0px rgba(0, 0, 0, 0.08);
                        border:solid 1px #e9eaec;
                        background:#fff;
                        text-align:left;
                        font-size:0;
                        z-index:20;
                        li {
                            display: inline-block;
                            vertical-align:top;
                            width: calc(100%/3 - 4px);
                            height:55px;
                            margin:10px 0 0 5px;
                            cursor: pointer;
                            &:nth-child(3n + 1) {
                                margin-left:0;
                            }
                            img {
                                display:inline-block;
                                vertical-align:top;
                                width:100%;
                            }
                            &:hover{
                                opacity:.7;
                            }
                        }
                    }
                }
                // 行数
                .row-num{
                    margin-top: 20px;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    width: 100%;
                    span{
                        font-size: 12px;
                        font-weight: 400;
                        color: #444444;
                    }

                    input{
                        padding-left: 15px;
                        width: 100px;
                        height: 32px;
                        background: #ffffff;
                        border: 1px solid #dddddd;
                        border-radius: 6px;
                        font-size: 14px;
                        font-weight: 400;
                        color: #444444;
                    }
                }
                .col-num{
                    margin-top: 10px;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    width: 100%;
                    span{
                        font-size: 12px;
                        font-weight: 400;
                        color: #444444;
                    }
                    
                    input{
                        padding-left: 15px;
                        width: 100px;
                        height: 32px;
                        background: #ffffff;
                        border: 1px solid #dddddd;
                        border-radius: 6px;
                        font-size: 14px;
                        font-weight: 400;
                        color: #444444;
                    }
                }

            }

            .img-more{
                padding: 20px 20px 20px 40px;
                width: 100%;
                button{
                    margin-bottom: 10px;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    width: 100%;
                    height: 32px;
                    background: #fafafa;
                    border-radius: 5px;
                    cursor: pointer;
                    &:hover{
                        background: #f4f4f4;
                    }
                }

            }

            .audio-more{
                padding: 20px 20px 20px 40px;
                width: 100%;
                button{
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    width: 100%;
                    height: 32px;
                    background: #fafafa;
                    border-radius: 5px;
                    cursor: pointer;
                    &:hover{
                        background: #f4f4f4;
                    }
                }
                .bgm-tips{
                    margin-top: 10px;
                    font-size: 12px;
                    color: #ccaa7e;
                }
            }

            .video-more{
                padding: 20px 20px 20px 40px;
                width: 100%;
                button{
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    width: 100%;
                    height: 32px;
                    background: #fafafa;
                    border-radius: 5px;
                    cursor: pointer;
                    &:hover{
                        background: #f4f4f4;
                    }
                }

            }
        }

        // 图片裁剪 格式面板
        .format-clip-ratio{
            padding-bottom: 50px;
            width: 100%;
            height: 100%;
            border-top: 1px solid #eeeeee;
            overflow-y: auto;

            // 自由裁剪
            .free-module{
                width: 100%;
                border-bottom: 1px solid #eeeeee;
                >.header-btn{
                    padding: 0 20px;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    width: 100%;
                    height: 50px;
                    cursor: pointer;
                    span{
                        font-size: 12px;
                        font-weight: 600;
                        color: #444444;
                    }
                }
                >.header-btn.current{
                    background: #f2f7ff;
                    span{
                        color: var(--mainColor);
                    }
                }
            }
            // 形状裁剪
            .shape-module{
                >.header-btn{
                    padding: 0 20px;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    width: 100%;
                    height: 50px;
                    cursor: pointer;
                    span{
                        font-size: 12px;
                        font-weight: 600;
                        color: #444444;
                    }
                    .arrow{
                        transform: rotate(180deg);
                        color: #444444;
                        transition: transform .3s;
                        &.current{
                            transform: rotate(270deg);
                        }
                    }
                }
                >.content{
                    padding: 5px 20px 20px 40px;
                    position: relative;
                    width: 100%;
                    .image_patten{
                        position: absolute;
                        width: 1px;
                        height: 1px;
                    }
                    ul{
                        display: flex;
                        flex-wrap: wrap;
                        justify-content: space-between;
                        width: 100%;
                        
                        li{
                            margin-bottom: 10px;
                            width: 50px;
                            height: 50px;
                            cursor: pointer;
                            &.skeleton{
                                background:url('~@/assets/pc/images/edit/left_scroll_loading.gif') no-repeat center;
                            }
                            &:hover, &.current{
                                opacity:0.8;
                                svg{
                                    stroke:var(--mainColor);
                                    stroke-width:10px;
                                }
                            }
                            svg{
                                width:100%;
                                height:100%;
                                stroke:#252a38;
                                stroke-width:2px;
                                fill: url(#shape_crop_thumbnail);
                            }
                            &.seat{
                                margin-bottom: 0;
                                height: 0;
                            }
                        }
                    }
                }
            }
            .scale-module{
                >.header-btn{
                    padding: 0 20px;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    width: 100%;
                    height: 50px;
                    cursor: pointer;
                    span{
                        font-size: 12px;
                        font-weight: 600;
                        color: #444444;
                    }
                    .arrow{
                        transform: rotate(180deg);
                        color: #444444;
                        transition: transform .3s;
                        &.current{
                            transform: rotate(270deg);
                        }
                    }
                }
                >.content{
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    width: 100%;
                    .scale-item{
                        margin-top: 10px;
                        display: flex;
                        justify-content: center;
                        align-items: center;
                        width: 240px;
                        height: 32px;
                        background: #fafafa;
                        border-radius: 5px;
                        font-size: 12px;
                        font-weight: 400;
                        color: #444444;
                        cursor: pointer;
                        &:hover{
                            background: #f4f4f4;
                        }
                        &.current{
                            color: var(--mainColor);
                            background: #f2f7ff;
                        }
                    }
                }
            }

        }

    }
    // 快捷操作
    .convformat_contain{
        position:fixed;
        z-index: 10;
        display: flex;
        width:auto;
        height:40px;
        color:#787f87;
        background: #ffffff;
        border: 1px solid #eeeeee;
        border-radius: 20px;
        box-shadow: 0px 0px 8px 0px rgba(153,153,153,0.10); 
        text-align:left;
        white-space: nowrap;
        box-sizing: content-box;
        user-select:none;
        .next{
            width:36px;
            height:100%;
            line-height:36px;
            border-left:1px solid #d5dbe3;
            text-align:center;
            font-size:12px;
            cursor:pointer;
            &:hover{
                opacity: .8;
            }
            .base-icon{
                font-size: 12px;
                color: #444444;
            }
        }
        // 图标按钮
        .icon_btn{
            display:inline-block;
            vertical-align:top;
            width:36px;
            height:36px;
            text-align:center;
            cursor:pointer;
        }
        .pull_module_btn{
            position:relative;
            display:inline-block;
            vertical-align:middle;
            height:36px;
            cursor:pointer;
            &:hover{
                color:var(--mainColor);
            }
            &::after{
                content:"";
                display:inline-block;
                vertical-align:middle;
                width:0;
                height:0;
                margin:2px 0 0 5px;
                border-width:4px;
                border-style:solid;
                border-color:#787f87 transparent transparent transparent;
                transition:all .3s;
                cursor:pointer;
            }
            &.show::after{
                top:6px;
                transform:rotate(180deg);
                border-color:var(--mainColor) transparent transparent transparent;
            }
        }
        .module_list{
            top: 40px;
            max-height:400px;
            border-top:solid 1px #e9eaec;
        }
        .text_panel,.element_panel{
            display: inline-block;
            vertical-align: top;
            width:auto;
            &>div{
                display: inline-block;
                vertical-align: top;
                width:auto;
            }
        }

        // 工具栏
        .tools-panel{
            display: flex;
            align-items: center;
            .base-icon{
                color: #444444;
            }
            // 公共下拉面板
            .conv_list{
                position: absolute;
                margin: 3px 0;
                background: #ffffff;
                border: 1px solid #eeeeee;
                border-radius: 6px;
                box-shadow: 0px 0px 8px 0px rgba(153,153,153,0.10); 
            }
            // 替换形状
            .replace-shape{
                position: relative;
                &::after{
                    content: '';
                    position: absolute;
                    right: 0;
                    top: 50%;
                    transform: translateY(-50%);
                    width: 1px;
                    height: 12px;
                    background: #dddddd;
                }
                .replace-btn{
                    width: 60px;
                    height: 40px;
                    border-top-left-radius: 20px;
                    border-bottom-left-radius: 20px;
                    &:hover{
                        background: @bg_hover;
                    }
                    &.current{
                        background: #f4f4f4;
                    }
                }
                .conv_list{
                    padding: 10px;
                    width: 241px;
                    max-height: 300px;
                    overflow: auto;
                    ul{
                        display: flex;
                        flex-wrap: wrap;
                        justify-content: space-between;
                        width: 100%;
                        li{
                            margin: 5px;
                            display: flex;
                            width: 40px;
                            height: 40px;
                            cursor: pointer;
                            &:hover{
                                background: @bg_hover;
                            }
                            i{
                                margin: auto;
                            }
                            &.seat{
                                height: 0;
                                margin-top: 0;
                                margin-bottom: 0;
                            }
                        }
                    }

                }
            }
            // 替换图片
            .replace-img{
                position: relative;
                &::after{
                    content: '';
                    position: absolute;
                    right: 0;
                    top: 50%;
                    transform: translateY(-50%);
                    width: 1px;
                    height: 12px;
                    background: #dddddd;
                }
                .replace-btn{
                    width: 60px;
                    height: 40px;
                    border-top-left-radius: 20px;
                    border-bottom-left-radius: 20px;
                    &:hover{
                        background: @bg_hover;
                    }
                    &.current{
                        background: #f4f4f4;
                    }
                }
                .conv_list{
                    padding: 10px 0;
                    .local_upload,
                    button{
                        display: block;
                        padding: 0 13px;
                        width: 100%;
                        line-height: 38px;
                        font-size: 12px;
                        color: #4f5764;
                        cursor: pointer;
                        i{
                            margin-right: 14px;
                        }
                        &:hover{
                            background: #f3f5f9;
                            color: var(--mainColor);
                        }
                    }
                    .local_upload input{
                        display: none;
                    }
                }
            }
            // 线条填充
            .line-fill-panel{
                position: relative;
                .fill-btn{
                    width: 40px;
                    height: 40px;
                    border-top-left-radius: 20px;
                    border-bottom-left-radius: 20px;
                    &:hover{
                        background: @bg_hover;
                    }
                    &.current{
                        background: #f4f4f4;
                    }
                    .base-icon{
                        font-size: 18px;
                    }
                }
                .conv_list{
                    top: 100%;
                    .common_color{
                        position: static;
                    }
                }
            }
            // 线条粗细
            .line-size-panel{
                display: flex;
                align-items: center;
                justify-content: center;
                height:100%;
                text-align:center;

                .pull_module_btn{
                    padding: 0 20px;
                    display: flex;
                    align-items: center;
                    &::after{
                        content: none;
                    }
                    input{
                        width: 20px;
                        display: inline-block;
                        vertical-align: middle;
                        text-align: center;
                        &:hover{
                            color:var(--mainColor);
                        }
                        &:focus{
                            color:#787f87;
                            border-bottom:1px solid var(--mainColor);
                        }
                    }
                    .size-btn{
                        display: flex;
                        flex-direction: column;
                        width: 20px;
                        height: 100%;

                        .add-size,
                        .cut-size{
                            flex: 1;
                            display: flex;
                            cursor: pointer;
                            &::after{
                                content: '';
                                margin: auto;
                                width: 0;
                                height: 0;
                                border-width: 4px;
                                border-style: solid;
                            }
                        }

                        .add-size::after{
                            margin: auto auto 2px auto;
                            border-color: transparent transparent #787f87 transparent;
                        }

                        .cut-size::after{
                            margin: 2px auto auto auto;
                            border-color: #787f87 transparent transparent transparent;
                        }
                    }
                }
            }
            // 替换图表
            .replace-chart{
                position: relative;
                &::after{
                    content: '';
                    position: absolute;
                    right: 0;
                    top: 50%;
                    transform: translateY(-50%);
                    width: 1px;
                    height: 12px;
                    background: #dddddd;
                }
                .replace-btn{
                    width: 60px;
                    height: 40px;
                    border-top-left-radius: 20px;
                    border-bottom-left-radius: 20px;
                    &:hover{
                        background: @bg_hover;
                    }
                    &.current{
                        background: #f4f4f4;
                    }
                }
                .conv_list{
                    padding: 20px;
                    ul {
                        li{
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
                            &.current{
                                opacity: .5;
                                pointer-events: none;
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
            // 编辑图表数据
            .edit-chart{
                display: flex;
                justify-content: center;
                align-items: center;
                width: 138px;
                height: 40px;
                cursor: pointer;
                &:hover{
                    background: @bg_hover;
                }
                span{
                    margin-left: 5px;
                    color: #444444;
                }
            }
            // 音频-音频控件入口
            .audio-controls{
                width: 60px;
                height: 40px;
                border-top-left-radius: 20px;
                border-bottom-left-radius: 20px;
                cursor: pointer;
                &:hover{
                    background: @bg_hover;
                }
            }
            // 音频-自动播放
            .audio-autoplay{
                padding: 0 10px;
                display: flex;
                justify-content: center;
                align-items: center;
                height: 40px;
                cursor: pointer;
                &:hover{
                    background: @bg_hover;
                }
                .check-box{
                    display: flex;
                    width: 16px;
                    height: 16px;
                    border: 1px solid #dddddd;
                    border-radius: 5px;
                    &.current{
                        border: none;
                        background: #444444;
                    }
                    .base-icon{
                        margin: auto;
                        font-size: 12px;
                        color: #ffffff;
                    }
                }
                span{
                    margin-left: 5px;
                    font-size: 12px;
                    font-weight: 400;
                    color: #444444
                }
            }
            // 音频-循环
            .audio-loop{
                padding: 0 10px;
                display: flex;
                justify-content: center;
                align-items: center;
                height: 40px;
                cursor: pointer;
                &:hover{
                    background: @bg_hover;
                }
                .check-box{
                    display: flex;
                    width: 16px;
                    height: 16px;
                    border: 1px solid #dddddd;
                    border-radius: 5px;
                    &.current{
                        border: none;
                        background: #444444;
                    }
                    .base-icon{
                        margin: auto;
                        font-size: 12px;
                        color: #ffffff;
                    }
                }
                span{
                    margin-left: 5px;
                    font-size: 12px;
                    font-weight: 400;
                    color: #444444
                }
            }
            // 音频-播放时隐藏图标
            .audio-hideonshow{
                padding: 0 10px;
                display: flex;
                justify-content: center;
                align-items: center;
                height: 40px;
                cursor: pointer;
                &:hover{
                    background: @bg_hover;
                }
                .check-box{
                    display: flex;
                    width: 16px;
                    height: 16px;
                    border: 1px solid #dddddd;
                    border-radius: 5px;
                    &.current{
                        border: none;
                        background: #444444;
                    }
                    .base-icon{
                        margin: auto;
                        font-size: 12px;
                        color: #ffffff;
                    }
                }
                span{
                    margin-left: 5px;
                    font-size: 12px;
                    font-weight: 400;
                    color: #444444
                }
            }
            // 视频-更换封面
            .change-cover{
                position: relative;
                width: 40px;
                height: 40px;
                border-top-left-radius: 20px;
                border-bottom-left-radius: 20px;
                cursor: pointer;
                &:hover{
                    background: @bg_hover;
                }
                input{
                    position: absolute;
                    left: 0;
                    top: 0;
                    width: 100%;
                    height: 100%;
                    opacity: 0;
                    cursor: pointer;
                }
            }
            // 视频-显示控制栏
            .video-controls{
                padding: 0 10px;
                display: flex;
                justify-content: center;
                align-items: center;
                height: 40px;
                cursor: pointer;
                &:hover{
                    background: @bg_hover;
                }
                &.disable{
                    opacity: 0.5;
                    cursor: no-drop;
                    &:hover{
                        background: none;
                    }
                }
                .check-box{
                    display: flex;
                    width: 16px;
                    height: 16px;
                    border: 1px solid #dddddd;
                    border-radius: 5px;
                    &.current{
                        border: none;
                        background: #444444;
                    }
                    .base-icon{
                        margin: auto;
                        font-size: 12px;
                        color: #ffffff;
                    }
                }
                span{
                    margin-left: 5px;
                    font-size: 12px;
                    font-weight: 400;
                    color: #444444
                }
            }
            // 视频-自动播放
            .video-autoplay{
                padding: 0 10px;
                display: flex;
                justify-content: center;
                align-items: center;
                height: 40px;
                cursor: pointer;
                &:hover{
                    background: @bg_hover;
                }
                &.disable{
                    opacity: 0.5;
                    cursor: no-drop;
                    &:hover{
                        background: none;
                    }
                }
                .check-box{
                    display: flex;
                    width: 16px;
                    height: 16px;
                    border: 1px solid #dddddd;
                    border-radius: 5px;
                    &.current{
                        border: none;
                        background: #444444;
                    }
                    .base-icon{
                        margin: auto;
                        font-size: 12px;
                        color: #ffffff;
                    }
                }
                span{
                    margin-left: 5px;
                    font-size: 12px;
                    font-weight: 400;
                    color: #444444
                }
            }
            // 视频-循环
            .video-loop{
                padding: 0 10px;
                display: flex;
                justify-content: center;
                align-items: center;
                height: 40px;
                cursor: pointer;
                &:hover{
                    background: @bg_hover;
                }
                &.disable{
                    opacity: 0.5;
                    cursor: no-drop;
                    &:hover{
                        background: none;
                    }
                }
                .check-box{
                    display: flex;
                    width: 16px;
                    height: 16px;
                    border: 1px solid #dddddd;
                    border-radius: 5px;
                    &.current{
                        border: none;
                        background: #444444;
                    }
                    .base-icon{
                        margin: auto;
                        font-size: 12px;
                        color: #ffffff;
                    }
                }
                span{
                    margin-left: 5px;
                    font-size: 12px;
                    font-weight: 400;
                    color: #444444
                }
            }
            // 视频-静音
            .video-muted{
                padding: 0 10px;
                display: flex;
                justify-content: center;
                align-items: center;
                height: 40px;
                cursor: pointer;
                &:hover{
                    background: @bg_hover;
                }
                &.disable{
                    opacity: 0.5;
                    cursor: no-drop;
                    &:hover{
                        background: none;
                    }
                }
                .check-box{
                    display: flex;
                    width: 16px;
                    height: 16px;
                    border: 1px solid #dddddd;
                    border-radius: 5px;
                    &.current{
                        border: none;
                        background: #444444;
                    }
                    .base-icon{
                        margin: auto;
                        font-size: 12px;
                        color: #ffffff;
                    }
                }
                span{
                    margin-left: 5px;
                    font-size: 12px;
                    font-weight: 400;
                    color: #444444
                }
            }
            // 裁剪图片
            .tailor-img{
                width: 40px;
                height: 40px;
                cursor: pointer;
                &:hover{
                    background: @bg_hover;
                }
            }
            // 字体
            .font_family_panel{
                position: relative;
                width: auto;
                min-width: 78px;
                height: 100%;
                padding:0 20px;
                text-align:center;
                &:after{
                    content:"";
                    position:absolute;
                    top:11px;
                    right:0;
                    width:1px;
                    height:14px;
                    background:#d5dbe3;
                }
                >.font-family-btn{
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    height: 100%;
                    span{
                        margin-right: 10px;
                        font-size: 14px;
                        color: #111111;
                    }
                    &:hover span{
                        color: var(--mainColor);
                    }
                    &::after{
                        content: '';
                        width: 0;
                        height: 0;
                        border-width: 4px;
                        border-style: solid;
                        border-color: #999999 transparent transparent transparent;
                        transform: translateY(25%);
                    }
                    &.current::after{
                        border-color: transparent transparent #999999 transparent;
                        transform: translateY(-25%);
                    }
                }
            }
            // 字号
            .font_size_panel{
                position: relative;
                display: flex;
                align-items: center;
                justify-content: center;
                height:100%;
                text-align:center;

                .pull_module_btn{
                    padding: 0 20px;
                    display: flex;
                    align-items: center;
                    &::after{
                        content: none;
                    }
                    input{
                        width: 20px;
                        display: inline-block;
                        vertical-align: middle;
                        text-align: center;
                        &:hover{
                            color:var(--mainColor);
                        }
                        &:focus{
                            color:#787f87;
                            border-bottom:1px solid var(--mainColor);
                        }
                    }
                    .size-btn{
                        margin-left: 5px;
                        display: flex;
                        flex-direction: column;
                        width: 20px;
                        height: 100%;

                        .add-size,
                        .cut-size{
                            flex: 1;
                            display: flex;
                            cursor: pointer;
                            &::after{
                                content: '';
                                margin: auto;
                                width: 0;
                                height: 0;
                                border-width: 4px;
                                border-style: solid;
                            }
                        }

                        .add-size::after{
                            margin: auto auto 2px auto;
                            border-color: transparent transparent #787f87 transparent;
                        }

                        .cut-size::after{
                            margin: 2px auto auto auto;
                            border-color: #787f87 transparent transparent transparent;
                        }
                    }
                }
                
                &:after{
                    content:"";
                    position:absolute;
                    top:11px;
                    right:0;
                    width:1px;
                    height:14px;
                    background:#d5dbe3;
                }
            }
            // 字体颜色
            .font_color_panel{
                position:relative;
                .font_color_btn{
                    width: 40px;
                    height: 40px;
                    &:hover{
                        background: @bg_hover;
                    }
                    &.current{
                        background: #f4f4f4;
                    }
                    .base-icon{
                        color: #444444;
                        margin-bottom:2px;
                    }
                    .color-line{
                        display:block;
                        width: 18px;
                        height:4px;
                        margin:0 auto;
                        border: 1px solid #a9a9a9;
                    }
                }
            }
            // 文字样式
            .font-style-panel{
                position: relative;
                .font-style-btn{
                    width: 40px;
                    height: 40px;
                    &:hover{
                        background: @bg_hover;
                    }
                    &.current{
                        background: #f4f4f4;
                    }
                }
                .conv_list{
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    height: 40px;
                    .icon-btn{
                        margin: 0 5px;
                        width: 24px;
                        height: 24px;
                        &:hover{
                            background: @bg_hover;
                        }
                        &.current{
                            background: #f4f4f4;
                        }
                    }
                    //字体加粗
                    .text_bold_panel{
                        .base-icon{
                            color: #444444;
                            &.bold{
                                color: var(--mainColor);
                            }
                        }
                    }
                    // 斜体
                    .text_italic_panel{
                        .base-icon{
                            color: #444444;
                            &.italic{
                                color: var(--mainColor);
                            }
                        }
                    }
                    // 下划线
                    .text_underline_panel{
                        .base-icon{
                            color: #444444;
                            &.underline{
                                color: var(--mainColor);
                            }
                        }
                    }
                    // 中划线
                    .text_through_panel{
                        .base-icon{
                            color: #444444;
                            &.through{
                                color: var(--mainColor);
                            }
                        }
                    }
                    // 高亮
                    .text_background_panel{
                        .base-icon{
                            font-size: 14px;
                            color: #444444;
                        }
                        .color-line{
                            display:block;
                            width: 20px;
                            height: 4px;
                            margin:0 auto;
                            margin-top: -3px;
                        }
                    }
                }
            }
            // 文本对齐
            .align_panel{
                .align-btn{
                    width: 40px;
                    height: 40px;
                    &:hover{
                        background: @bg_hover;
                    }
                    &.current{
                        background: #f4f4f4;
                    }
                }
                .conv_list{
                    padding: 20px;
                    width: 241px;
                    text-align: left;
                    .text-align{
                        .title{
                            font-size: 12px;
                            color: #666666;
                        }
                        .btn-group{
                            margin-top: 10px;
                            display: flex;
                            width: 200px;
                            height: 30px;
                            border: 1px solid #dddddd;
                            border-radius: 6px;
                            >.btn{
                                flex: 1;
                                display: flex;
                                color: #666666;
                                cursor: pointer;
                                &:hover{
                                    background: @bg_hover;
                                }
                                &.current{
                                    background: #f4f4f4;
                                }
                                .base-icon{
                                    margin: auto;
                                }
                                span{
                                    margin-left: 5px;
                                    font-size: 12px;
                                    color: inherit;
                                }
                            }
                        }
                    }
                    .text-list{
                        padding-top: 20px;
                        .title{
                            font-size: 12px;
                            color: #666666;
                        }
                        .list-group{
                            margin-top: 10px;
                            display: flex;
                            justify-content: space-between;
                            .ul-menu-btn,
                            .ol-menu-btn{
                                padding: 0 10px;
                                position: relative;
                                display: flex;
                                align-items: center;
                                justify-content: space-between;
                                width: 90px;
                                height: 32px;
                                background: #ffffff;
                                border: 1px solid #dddddd;
                                border-radius: 6px;
                                cursor: pointer;

                                &:hover{
                                    background: @bg_hover;
                                }

                                >.base-icon{
                                    font-size: 20px;
                                    font-weight: bolder;
                                }

                                &::after{
                                    content: '';
                                    width: 0;
                                    height: 0;
                                    border-width: 4px;
                                    border-style: solid;
                                    transform: translateY(2px);
                                    border-color: #787f87 transparent transparent transparent;
                                }
                                &.current::after{
                                    transform: translateY(2px) rotate(180deg);
                                }

                                .menu-list{
                                    position: absolute;
                                    top: calc(100% + 5px);
                                    left: 0;
                                    z-index: 1;
                                    padding: 20px;
                                    width: 130px;
                                    background: #ffffff;
                                    border: 1px solid #eeeeee;
                                    border-radius: 6px;
                                    box-shadow: 0px 0px 8px 0px rgba(153,153,153,0.10); 

                                    >.label{
                                        font-size: 12px;
                                        color: #666666;
                                    }

                                    >.item-list{
                                        margin-top: 10px;
                                        display: flex;
                                        justify-content: space-between;
                                        flex-wrap: wrap;
                                        
                                        >.item{
                                            margin-bottom: 10px;
                                            display: flex;
                                            justify-content: center;
                                            align-items: center;
                                            width: 40px;
                                            height: 48px;
                                            font-size: 24px;
                                            border: 1px dashed #dddddd;
                                            cursor: pointer;
                                            &.none{
                                                font-size: 12px;
                                                font-weight: 400;
                                                color: #666666;
                                            }
                                            &:hover{
                                                background: @bg_hover;
                                            }
                                            &.current{
                                                background: #f4f4f4;
                                            }
                                            .base-icon{
                                                font-size: 45px;
                                                color: #666666;
                                            }
                                        }
                                    }

                                }
                            }
                        }
                    }
                    .text-range{
                        margin-top: 20px;
                        span{
                            font-size: 12px;
                            color: #444444;
                        }
                        .letter-space,
                        .line-height{
                            margin-top: 10px;
                            margin-bottom: 20px;
                            display: flex;
                            justify-content: space-between;
                            align-items: center;
                            
                            /deep/.unit-input{
                                width: 64px;
                                height: 32px;
                                .unit,
                                .btn-group{
                                    width: 20px;
                                }
                            }
                        }
                    }
                }
            }
            // 透明度
            .transparency{
                .transparency-btn{
                    width: 40px;
                    height: 40px;
                    &:hover{
                        background: @bg_hover;
                    }
                    &.current{
                        background: #f4f4f4;
                    }
                }
                
                .conv_list{
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    width: 300px;
                    height: 45px;
                    >span,
                    .input{
                        margin: 0 20px;
                        font-size: 12px;
                    }
                    >span{
                        color: #666666;
                    }
                    .input{
                        position: relative;
                        display: flex;
                        justify-content: center;
                        align-items: center;
                        width: 50px;
                        height: 24px;
                        text-align: center;
                        color: #444444;
                        border: 1px solid #dddddd;
                        border-radius: 6px;
                         &::after{
                            content: '%';
                            position: absolute;
                            top: 50%;
                            right: 5px;
                            transform: translateY(-50%);
                            display: flex;
                            align-items: center;
                            height: 100%;

                        }
                        input{
                            padding-top: 2px;
                            padding-right: 18px;
                            padding-left: 5px;
                            width: 100%;
                            height: 100%;
                            line-height: 24px;
                            color: #444444;
                        }
                    }
                }
            }
            // 边框
            .border_panel{
                .border-btn{
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    width: 40px;
                    height: 40px;
                    &:hover{
                        background: @bg_hover;
                    }
                    &.current{
                        background: #f4f4f4;
                    }

                    .border-color-icon {
                        display: block;
                        width: 40%;
                        height: 40%;
                        border: 2px solid;
                        border-radius: 50%;
                        box-shadow: 0 0 5px 5px #eeeeee;
                    }
                }
                .conv_list{
                    width: 272px;
                    background: #ffffff;
                    border: 1px solid #eeeeee;
                    border-radius: 6px;
                    box-shadow: 0px 0px 8px 0px rgba(153,153,153,0.10); 
                    .border-panel-header{
                        display: flex;
                        width: 100%;
                        background: #fafafa;
                        .border-header-item{
                            display: flex;
                            justify-content: center;
                            align-items: center;
                            width: 82px;
                            height: 40px;
                            font-size: 12px;
                            font-weight: 500;
                            color: #444444;
                            border-right: 1px solid #eeeeee;
                            border-bottom: 1px solid #eeeeee;
                            cursor: pointer;
                            &.current{
                                border-bottom: none;
                                background: #ffffff;
                            }
                        }
                        &::after{
                            content: '';
                            flex: 1;
                            border-bottom: 1px solid #eeeeee;
                        }
                    }

                    .border-color-panel{
                        position: relative;
                        width: 100%;
                        /deep/ .common_color{
                            position: static;
                            box-shadow: none;
                            .color_menu{
                                box-shadow: none;
                                border: none;
                            }
                        }
                    }
                    .border-style-panel{
                        padding: 20px;
                        width: 100%;
                        .border-type{
                            width: 100%;
                            span{
                                font-size: 12px;
                                font-weight: 400;
                                color: #333333;
                            }
                            .border-type-list{
                                margin-top: 10px;
                                position: relative;
                                width: 232px;
                                .border-type-btn{
                                    padding: 0 10px 0 15px;
                                    display: flex;
                                    align-items: center;
                                    width: 100%;
                                    height: 28px;
                                    background: #ffffff;
                                    border: 1px solid #dddddd;
                                    border-radius: 5px;
                                    cursor: pointer;
                                    &::after{
                                        content: '';
                                        margin-top: 2px;
                                        margin-left: auto;
                                        width: 0;
                                        height: 0;
                                        border-width: 4px;
                                        border-style: solid;
                                        border-color: #999999 transparent transparent transparent;
                                    }
                                }

                                .border_style_list{
                                    top: 100%;
                                    width: 100%;
                                    max-height: 200px;
                                }
                            }
                        }

                        .border-size,
                        .border-transparency{
                            margin-top: 20px;
                            width: 100%;
                            span{
                                font-size: 12px;
                                font-weight: 400;
                                color: #333333;
                            }
                            .group{
                                margin-top: 10px;
                                display: flex;
                                align-items: center;
                                justify-content: space-between;
                                .seekbar_module_contain{
                                    /deep/.seekbar_drag_btn{
                                        top: 50%;
                                        transform: translateY(-50%);
                                        width: 13px;
                                        height: 13px;
                                        opacity: 1;
                                        background: #ffffff;
                                        border: 2px solid #005cff;
                                        border-radius: 50%;
                                    }
                                }
                                .unit-input{
                                    width: 80px;
                                    height: 28px;
                                }
                            }
                        }
                    }

                    
                }
            }
            // 填充
            .fill_panel{
                
                .fill-btn{
                    display: flex;
                    width: 40px;
                    height: 40px;
                    &:hover{
                        background: @bg_hover;
                    }
                    &.current{
                        background: #f4f4f4;
                    }
                    .base-icon{
                        margin: auto;
                        font-size: 18px;
                        &.icon-white{
                            text-shadow: #999 1px 0 0, #999 0 1px 0, #999 -1px 0 0, #999 0 -1px 0;
                        }
                    }
                    .gradient{
                        margin: auto;
                        display: block;
                        width: 20px;
                        height: 20px;
                        border: 1px solid #dddddd;
                        border-radius: 50%;
                    }
                }

                .conv_list{
                    width: 272px;
                    background: #ffffff;
                    border: 1px solid #eeeeee;
                    border-radius: 6px;
                    box-shadow: 0px 0px 8px 0px rgba(153,153,153,0.10); 
                    .fill-panel-header{
                        display: flex;
                        width: 100%;
                        background: #fafafa;
                        .fill-header-item{
                            display: flex;
                            justify-content: center;
                            align-items: center;
                            width: 82px;
                            height: 40px;
                            font-size: 12px;
                            font-weight: 500;
                            color: #444444;
                            border-right: 1px solid #eeeeee;
                            border-bottom: 1px solid #eeeeee;
                            cursor: pointer;
                            &.current{
                                border-bottom: none;
                                background: #ffffff;
                            }
                        }
                        &::after{
                            content: '';
                            flex: 1;
                            border-bottom: 1px solid #eeeeee;
                        }
                    }

                    .fill-color-panel{
                        position: relative;
                        width: 100%;
                        /deep/ .common_color{
                            position: static;
                            box-shadow: none;
                            .color_menu{
                                box-shadow: none;
                                border: none;
                            }
                        }
                    }
                    .fill-gradient-panel{
                        position: relative;
                        width: 100%;
                        /deep/.gradient_color_modal{
                            position: static;
                            box-shadow: none;
                            border: none;
                            border-radius: none;
                        }
                    }
                    .fill-img-panel{
                        padding: 20px 0;
                        display: flex;
                        flex-direction: column;
                        align-items: center;
                        width: 100%;
                        .fill-img-btn{
                            margin-bottom: 10px;
                            display: flex;
                            justify-content: center;
                            align-items: center;
                            width: 204px;
                            height: 32px;
                            background: #fafafa;
                            border-radius: 5px;
                            cursor: pointer;
                            &:hover{
                                background: #f4f4f4;
                            }
                            span{
                                font-size: 12px;
                                color: #444444;
                            }
                        }

                        .fill-image-type{
                            margin-top: 10px;
                            display: flex;
                            align-items: center;
                            .cover,
                            .repeat{
                                margin: 0 15px;
                                display: flex;
                                align-items: center;

                                .check-box{
                                    display: flex;
                                    width: 16px;
                                    height: 16px;
                                    border: 1px solid #dddddd;
                                    border-radius: 5px;
                                    cursor: pointer;
                                    &.current{
                                        border: none;
                                        background: #444444;
                                    }
                                    .base-icon{
                                        margin: auto;
                                        font-size: 12px;
                                        color: #ffffff;
                                    }
                                }
                                span{
                                    margin-left: 10px;
                                    font-size: 12px;
                                    color: #444444;
                                }
                            }
                        }
                    }
                }
            }
            // 画布对齐
            .ele_align_panel{
                .ele-align-btn{
                    width: 40px;
                    height: 40px;
                    &:hover{
                        background: @bg_hover;
                    }
                    &.current{
                        background: #f4f4f4;
                    }
                    &.first{
                        border-top-left-radius: 20px;
                        border-bottom-left-radius: 20px;
                    }
                }
                .conv_list{
                    padding: 20px 10px;
                    display: flex;
                    flex-wrap: wrap;
                    justify-content: space-between;
                    width: 250px;
                    .align-title{
                        padding-left: 10px;
                        margin-bottom: 10px;
                        width: 100%;
                        text-align: left;
                        font-size: 12px;
                        font-weight: 400;
                        color: #444444;
                    }
                    .align-item{
                        width: 50%;
                        .align-btn{
                            display: inline-block;
                            padding: 10px;
                            border-radius: 5px;
                            cursor: pointer;
                            &:hover{
                                background: #fafafa;
                            }
                            .base-icon{
                                color: #444444;
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
            // 表格边框
            .table_border_panel{
                .table-border-btn{
                    width: 40px;
                    height: 40px;
                    &:hover{
                        background: @bg_hover;
                    }
                    &.current{
                        background: #f4f4f4;
                    }
                }
                .conv_list{
                    width: 224px;
                    padding: 12px;
                    .table_border_list{
                        display: flex;
                        flex-wrap: wrap;
                        justify-content: space-between;
                        .icon-btn{
                            display: flex;
                            width: 36px;
                            height: 36px;
                            cursor: pointer;
                            &:hover{
                                background: #fafafa;
                            }
                            .base-icon{
                                margin: auto;
                            }
                        }
                    }
                }
            }
            // 合并/拆分单元格
            .merge_cel_panel{
                width: 40px;
                height: 40px;
                cursor: pointer;
                &:hover{
                    background: @bg_hover;
                }
                &.disable{
                    &:hover{
                        background: none;
                    }
                    .base-icon{
                        color: #d0d0d0;
                    }
                }
            }
            // 下载图片
            .dowload-img{
                width: 40px;
                height: 40px;
                cursor: pointer;
                &:hover{
                    background: @bg_hover;
                }
            }
            // 组合/拆分
            .group-panel{
                width: 40px;
                height: 40px;
                cursor: pointer;
                &:hover{
                    background: @bg_hover;
                }
            }
            // 切换格式面板
            .toggle-panel{
                padding: 0 20px;
                position: relative;
                display: flex;
                height: 40px;
                border-bottom-right-radius: 20px;
                border-top-right-radius: 20px;
                &:hover{
                    background: @bg_hover;
                }
                .base-icon{
                    margin: auto;
                }
                &::after{
                    content: '';
                    position: absolute;
                    left: 0;
                    top: 50%;
                    transform: translateY(-50%);
                    width: 1px;
                    height: 12px;
                    background: #dddddd;
                }
            }
        }

        // 二级工具栏
        .more-tools-panel{
            display: flex;
            align-items: center;
            // 公共下拉面板
            .conv_list{
                position: absolute;
                margin: 3px 0;
                background: #ffffff;
                border: 1px solid #eeeeee;
                border-radius: 6px;
                box-shadow: 0px 0px 8px 0px rgba(153,153,153,0.10); 
            }
            // 返回
            .back{
                padding: 0 20px;
                position: relative;
                display: flex;
                height: 40px;
                border-bottom-left-radius: 20px;
                border-top-left-radius: 20px;
                &::after{
                    content: '';
                    position: absolute;
                    right: 0;
                    top: 50%;
                    transform: translateY(-50%);
                    display: block;
                    width: 1px;
                    height: 12px;
                    background: #dddddd;
                }
                &:hover{
                    background: @bg_hover;
                    &::after{
                        visibility: hidden;
                    }
                }
                .base-icon{
                    margin: auto;
                }
            }


            /* 图片裁剪 */
            // 自由裁剪
            .free{
                display: flex;
                width: 68px;
                height: 100%;
                cursor: pointer;
                &:hover{
                    background: @bg_hover;
                }
                &.current{
                    background: #f4f4f4;
                }
                span{
                    margin: auto;
                    font-size: 12px;
                    font-weight: 400;
                    color: #444444;
                }
            }
            // 形状裁剪
            .shape{
                height: 100%;
                .shape-btn {
                    display: flex;
                    width: 68px;
                    height: 100%;
                    &:hover{
                        background: @bg_hover;
                    }
                    &.current{
                        background: #f4f4f4;
                    }

                    span{
                        margin: auto;
                    }
                }
                .conv_list{
                    width: 241px;
                    max-height: 420px;
                    background: #ffffff;
                    border: 1px solid #eeeeee;
                    border-radius: 6px;
                    box-shadow: 0px 0px 8px 0px rgba(153,153,153,0.10); 
                    overflow-y: auto;
                    
                    ul{
                        padding: 20px;
                        position: relative;
                        display: flex;
                        flex-wrap: wrap;
                        justify-content: space-between;
                        width: 100%;
                        .image_patten{
                            position: absolute;
                            width: 1px;
                            height: 1px;
                        }
                        li{
                            margin-bottom: 10px;
                            width: 42px;
                            height: 42px;
                            cursor: pointer;
                            &.skeleton{
                                background:url('~@/assets/pc/images/edit/left_scroll_loading.gif') no-repeat center;
                            }
                            &:hover, &.current{
                                opacity:0.8;
                                svg{
                                    stroke:var(--mainColor);
                                    stroke-width:10px;
                                }
                            }
                            svg{
                                width:100%;
                                height:100%;
                                stroke:#252a38;
                                stroke-width:2px;
                                fill: url(#shape_crop_thumbnail);
                            }
                            &.seat{
                                margin-bottom: 0;
                                height: 0;
                            }
                        }
                    }
                }
            }
            // 比例裁剪
            .scale{
                height: 100%;
                .scale-btn {
                    display: flex;
                    width: 68px;
                    height: 100%;
                    border-bottom-right-radius: 20px;
                    border-top-right-radius: 20px;
                    &:hover{
                        background: @bg_hover;
                    }
                    &.current{
                        background: #f4f4f4;
                    }

                    span{
                        margin: auto;
                    }
                }
                .conv_list{
                    width: 104px;
                    max-height: 177px;
                    background: #ffffff;
                    border: 1px solid #eeeeee;
                    border-radius: 6px;
                    box-shadow: 0px 0px 8px 0px rgba(153,153,153,0.10); 
                    overflow-y: auto;
                    
                    ul{
                        padding: 10px;
                        position: relative;
                        display: flex;
                        flex-wrap: wrap;
                        justify-content: space-between;
                        width: 100%;
                        li{
                            margin-bottom: 5px;
                            display: flex;
                            align-items: center;
                            width: 76px;
                            height: 28px;
                            border-radius: 5px;
                            cursor: pointer;
                            &:hover{
                                background: #fafafa;
                            }
                            &.current{
                                background: #f2f7ff;
                                span{
                                    color: var(--mainColor);
                                }
                            }
                            .icon{
                                width: 15px;
                            }
                            .icon,
                            span{
                                margin-left: 10px;
                                font-size: 12px;
                                font-weight: 400;
                                color: #444444;
                            }
                        }
                    }
                }
            }
            /* 图片裁剪 end */

            /* 音频控件 */
            .audio-controls{
                height: 100%;
                /deep/.media-controls{
                    height: 100%;
                    border: none;
                    background: none;
                }
            }
            /* 音频控件end */
        }

        /deep/ .common_color{
            top: 40px;
            right: auto;
            margin: 0;
        }
    }
    // 通用下拉框
    .module_list{
        position:absolute;
        top:27px;
        left:0;
        width:100%;
        height:auto;
        overflow:hidden;
        padding:12px 1px;
        color: #707b8e;
        font-size:12px;
        text-align:left;
        background-color:#ffffff;
        box-shadow:0 9px 10px 0 rgba(0, 0, 0, 0.08);
        border:solid 1px #e9eaec;
        border-top:0;
        overflow-y: auto;
        z-index:99;
        ul{
            height:100%;
        }
        li{
            position:relative;
            display:block;
            width:100%;
            padding-left:8px;
            &:hover{
                background:#f3f5f9;
                color:var(--mainColor);
            }
            &.current{
                color:#fff;
                background:var(--mainColor);
            }
            &.check{
                background:#f3f5f9;
            }
        }
        // 通用
        // 字体
        &.font_family_list{
            width: 202px;
            height: auto;
            overflow-y: auto;

            .family_panel{
                width:100%;
                height:100%;
                user-select: none;
                .family_lang{
                    padding:0 12px;
                    margin-bottom:10px;
                    font-size:0;
                    button{
                        display:inline-block;
                        vertical-align:top;
                        width:calc(50% - 10px);
                        height:30px;
                        line-height:30px;
                        text-align:center;
                        color:#4d4d4d;
                        font-size:12px;
                        border-radius:4px;
                        background:#e6e6e6;
                        transition:all 0.3s;
                        cursor:pointer;
                        &:first-child{
                            margin-right:20px;
                        }
                        &:not(.check):hover {
                            opacity:0.85;
                        }
                        &.check {
                            color:#ffffff;
                            background-color:var(--mainColor);
                        }
                    }
                }
                .family_list_scroll{
                    width:100%;
                    height: calc(100vh - 400px);
                }
                .family_list{
                    margin-bottom: 10px;
                    li {
                        position: relative;
                        height: 34px;
                        line-height: 34px;
                        padding: 0 20px;
                        font-size: 14px;
                        color: #a6adb9;
                        cursor: pointer;
                        overflow: hidden;
                        &.image {
                            padding-left: 10px;
                            font-size: 0;
                            .preview {
                                display: block;
                            }
                        }
                        .preview {
                            display: none;
                            height: 28px;
                            width: auto;
                            margin: 3px 0;
                        }
                        .loading {
                            position: absolute;
                            right: 30px;
                            top: 7px;
                            width: 20px;
                            height: 20px;
                            background-color: transparent;
                            border: none;
                        }
                        &:not(.label):hover {
                            background-color: #8dbdf9;
                        }
                        &.checked {
                            cursor: default;
                            background-color:#8dbdf9;
                            pointer-events: none;
                            &::after {
                                content: "";
                                position: absolute;
                                right: 8px;
                                top: 12px;
                                width: 12px;
                                height: 5px;
                                border: 2px solid #666;
                                border-top: none;
                                border-right: none;
                                transform: rotate(-54deg);
                            }
                        }
                        &.current {
                            cursor: default;
                            background-color:#8dbdf9;
                        }
                        &.haschild {
                            &::after {
                                content: "";
                                position: absolute;
                                right: 6px;
                                top: 12px;
                                width: 0;
                                height: 0;
                                margin: 0 auto;
                                border-width: 6px;
                                border-style: solid;
                                border-color: #202735 transparent transparent transparent;
                                transition: all 0.3s;
                                transform: rotate(-90deg);
                                cursor: pointer;
                            }
                        }
                    }
                }
            }
            .font_family_childrenList{
                position:fixed;
                width: 76px;
                height: auto;
                padding: 10px 0;
                background-color: #ffffff;
                box-shadow: 0px 6px 8px 0px rgba(80, 85, 94, 0.2);
                border-radius: 4px;
                z-index: 100;
                li{
                    line-height: 30px;
                    padding-left: 15px;
                    color:#202124;
                    font-size: 10px;
                    overflow: hidden;
                    white-space:nowrap;
                    text-overflow: ellipsis;  
                    cursor: pointer;  
                    &.checked {
                        background-color: #8dbdf9;
                    }
                    &:hover{
                        background-color: #8dbdf9;
                    }
                }
                &:hover{
                    display:block;
                }
            }
        }
        // 字号
        &.font_size_list{
            height:430px;
            overflow-y:scroll;
            li{
                height:30px;
                line-height:30px;
                &.checked {
                    color: var(--mainColor);
                    background: #fafafa;
                }
            }
        }
        // 文本样式
        &.text_list{
            top: 79px;
            height: 428px;
            padding:20px 30px;
            box-shadow: 0px 6px 8px 0px rgba(80, 85, 94, 0.2);
            border-radius: 2px;
            overflow-y: auto;
            overflow-x: hidden;
            cursor: default;
            .title{
                color: #393c44;
                line-height: 12px;
                font-size: 12px;
                text-align: left;
                background-color: #ffffff;
                font-weight: bold;
                cursor: default;
            }
            .list_wrapper{
                width:100%;
                border-radius:4px;
                background:#fff;
                font-size: 0;
                li{
                    display: inline-block;
                    width: calc(50% - 8px);
                    margin: 15px 8px 0 0;
                    padding-left: 0;
                    cursor: pointer;
                    &:nth-of-type(2n){
                        float: right !important;
                        margin-right: 0;
                    }
                }
                &.normal_list_wrapper{
                    margin-bottom: 24px;
                    height: auto;
                    li{
                        float: left;
                        height: 34px;
                        line-height: 34px;
                        border: 1px solid #dadee7;
                        border-radius: 4px;
                        text-align: center;
                        &:hover{
                            border-color: var(--mainColor);
                        }
                    }
                    &::before, &::after{
                        content: " ";
                        display: block;
                        height: 0;
                        overflow: hidden;
                        clear: both;
                    }
                }
                &.art_list_wrapper{
                    margin-top: 10px;
                    text-align: left;
                    li{
                        float: left;
                        position: relative;
                        height: 48px;
                        line-height: 48px;
                        margin-top: 15px;
                        background-color: #eaedf4;
                        transition: all .2s;
                        &:hover{
                            transform: scale(1.1);
                        }
                        &.check{
                            border: 1px solid var(--mainColor);
                        }
                        img{
                            position: absolute;
                            top: 0;
                            right: 0;
                            bottom: 0;
                            left: 0;
                            width: 52px;
                            height: 27px;
                            margin: auto;
                        }
                    }
                    &::before, &::after{
                        content: " ";
                        display: block;
                        height: 0;
                        overflow: hidden;
                        clear: both;
                    }
                }
            }
            &.short{
                height: 250px;
                .normal_list_wrapper{
                    margin-bottom: 0;
                }
            }
        }
        // 线条粗细
        &.border_weight_list{
            width: 103px;
            max-height: 300px;
            padding: 12px 0;
            li{
                padding:0 4px;
                text-align:right;
                height: 30px;
                line-height: 30px;
                cursor: pointer;
                span{
                    display:inline-block;
                    vertical-align:middle;
                    &:first-child{
                        float: left;
                        font-size: 10px;
                        color: #515a6e;
                    }
                    &:last-child{
                        width:60%;
                        background:#727b93;
                    }
                }
            }
        }
        // 线条样式
        &.border_style_list{
            width: 104px;
            li{
                padding:0 0 0 12px;
                text-align: left;
                height: 30px;
                line-height: 30px;
                cursor: pointer;
            }
        }
        &.border_type_list{
            width: 104px;
            padding: 5px 0;
            li{
                padding-left: 6px;
                height: 30px;
                line-height: 30px;
                text-align:left;
                cursor: pointer;
                &:hover, &.check{
                    color: var(--mainColor);
                }
            }
        }
    }
</style>