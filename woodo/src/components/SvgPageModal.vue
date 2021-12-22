<template>
    <div id="edit_page" class="edit_page"
        ref="edit_page"
        v-if="read"
        :data-id="new_page_info.id"
        :data-uuid="new_page_info.uuid"
        :style="{width:`${svg_view[2]}px`, height:`${svg_view[3]}px`, margin:`${svg_view[1]}px 0 0 ${svg_view[0]}px`, transform:`scale(${svg_w / svg_view[2]},${svg_h / svg_view[3]})`}"
    >
        <!--背景色 & 背景图-->
        <!-- 纯色 / 渐变色 -->
        <div class="page_bg" v-if="new_background.type === 'color'" :style="new_background.color"></div>
        <!-- 图片 -->
        <div class="page_bg" v-else
            v-dim2webp="{ url: new_background.url, disableDim: !preloaddim, simple: thumbnail }"
            :style="new_background.image"
        ></div>
        <!--元素渲染-->
        <div class="ele_item"
             v-show="ele.id"
             v-for="(ele, index) in new_page_info.elementList"
             :key="index"
             :id="ele.id"
             :class="{lock: ele.lock}"
             :style="{'top':`${ele.translate.split(',')[1]}px`, 'left':`${ele.translate.split(',')[0]}px`, 'width':`auto`, 'height':`auto`}"
             :data-type="ele.type"
             :data-group="ele.group ? ele.group : ''"
        >
            <!--文本元素-->
            <div class="ele_rotate"
                 v-if="ele.type === 'text' && data_ready"
                 :data-rotate="ele.rotate"
                 :style="{'width':`${ele.width * ele.scale.split(',')[0]}px`, 'height':`${ele.height * ele.scale.split(',')[1]}px`, 'opacity':ele.opacity, 'transform':`rotate(${ele.rotate.split(',')[0]}deg)`}"
            >
                <div class="ele_scale" :data-scale="ele.scale" :data-matrix="ele.reversal.matrix" :data-translate="ele.reversal.translate" :style="{transform:`scale(${ele.scale})translate(${ele.reversal.translate.split(',')[0] +'px,'+ele.reversal.translate.split(',')[1]+'px'})matrix(${ele.reversal.matrix})`}">
                    <div class="text_content"
                        :style="ele.style_str"
                        v-html="ele.content"
                    ></div>
                </div>
            </div>
            <!--形状元素-->
            <div class="ele_rotate"
                 v-else-if="ele.type === 'shape' && data_ready"
                 :data-rotate="ele.rotate"
                 :title="ele.link"
                 @click="to_link($event, ele.link)"
				 @touchstart="to_link($event, ele.link)"
                 :style="{'width':`${ele.width}px`, 'height':`${ele.height}px`, 'opacity':ele.opacity, 'transform':` rotate(${ele.rotate.split(',')[0]}deg)`,'filter':`${ele.shadow_str}`}"
            >
                <div class="shape_path">
                    <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" overflow="visible" :width="ele.width" :height="ele.height">
                        <!-- 渐变填充 -->
                        <defs class="gradient_bg" v-if="ele.background.type === 'gradient'">
                            <linearGradient v-if="ele.background.color.type === 'linear'" x1="0%" y1="0%" x2="100%" y2="0%" :id="ele.background_id" :gradientTransform="`rotate(${ele.background.color.rotate},0.5,0.5)`">
                                <stop v-for="(item,index) in ele.background.color.code" :key="index" :offset="`${item.offset}%`" :stop-color="item.color" :stop-opacity="item.opacity/100"></stop>
                            </linearGradient>
                            <radialGradient v-if="ele.background.color.type === 'radial'" :id="ele.background_id" :cx="ele.background.color.direction.cx" :cy="ele.background.color.direction.cy" :r="ele.background.color.direction.r" :data-type="ele.background.color.direction.type" gradientUnits="userSpaceOnUse">
                                <stop v-for="(item,index) in ele.background.color.code" :key="index" :offset="`${item.offset}%`" :stop-color="item.color" :stop-opacity="item.opacity/100"></stop>
                            </radialGradient>
                        </defs>
                        <!-- 图片填充 -->
                        <clipPath v-if="ele.background.type.indexOf('image') >= 0" :id="ele.background_id">
                            <path v-for="(path, index) in ele.d" :key='index' :d="path"></path>
                        </clipPath>
                        <g class="ele_scale" :clip-path="ele.background.type !== 'color' ? `url(#${ele.background_id})` : ''" :data-background="ele.background.type" :data-scale="ele.scale" :data-matrix="ele.reversal.matrix" :data-translate="ele.reversal.translate" :style="{transform:`scale(${ele.scale})translate(${ele.reversal.translate.split(',')[0] +'px,'+ele.reversal.translate.split(',')[1]+'px'})matrix(${ele.reversal.matrix})`}">
                            <image v-if="ele.background.type.indexOf('image') >= 0" preserveAspectRatio="none" x="0" y="0" style="pointer-events: none;" :width="ele.width /  Number(ele.scale.split(',')[0])" :height="ele.height / Number(ele.scale.split(',')[1])" :xlink:href="ele.background.image.src"></image>
                            <!--渲染多个 path 情况-->
                            <path v-for="(path, index) in ele.d"
                                  :key='index'
                                  :d="path"
                                  :fill="ele.background.type === 'gradient' ? `url(#${ele.background_id})` : (ele.background.type === 'color' ? ele.background.color : 'transparent')"
                                  :stroke="ele.border_c"
                                  :stroke-width="ele.border_w / 2"
                                  :stroke-opacity="ele.border_o / 100"
                                  :stroke-dasharray="ele.border_s == 16 ? ele.border_w/2 + ','+ (ele.border_w/2)*3 : ele.border_s"
                                  :stroke-linecap="Number(ele.border_s) === 16 ? 'butt' : ''"
                                  :stroke-linejoin="Number(ele.border_s) === 16 ? 'round' : ''"
                                  :stroke-miterlimit="Number(ele.border_s) === 16 ? 8 : ''"
                                  vector-effect="non-scaling-stroke"
                            ></path>
                        </g>
                    </svg>
                </div>
                <div v-html="ele.text && ele.text.content"></div>
            </div>
            <!--线条元素-->
            <div class="ele_rotate" 
                v-else-if="ele.type === 'line' && data_ready" 
                :data-rotate="ele.rotate" 
                :title="ele.link" 
                @click="to_link($event, ele.link)"
				@touchstart="to_link($event, ele.link)"
                :style="{'opacity':ele.opacity}"
            >
                <div class="ele_scale">
                    <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" overflow="visible" :width="ele.rect.width" :height="ele.rect.height">
                        <g>
                            <!-- 箭头样式 -->
                            <defs v-html="ele.marker_html"></defs>
                            <!--线条主体-->
                            <path class="line"
                                fill="none"
                                :d="ele.line"
                                :stroke="ele.border_c || `#000000`"
                                :stroke-width="ele.border_w / 2"
                                :stroke-dasharray="Number(ele.border_s) === 16 ? `${ele.border_w / 2},${ele.border_w * 1.5}` : Number(ele.border_s) === 8 ? `${ele.border_w * 1.5},${ele.border_w * 1.5}` : ele.border_s"
                                :stroke-linecap="Number(ele.border_s) === 16 ? 'butt' : ''"
                                :stroke-linejoin="Number(ele.border_s) === 16 ? 'round' : ''"
                                :stroke-miterlimit="Number(ele.border_s) === 16 ? 10 : ''"
                                :stroke-opacity="ele.border_o / 100"
                                :marker-start="`url(#${ele.marker_l.id})`"
                                :marker-end="`url(#${ele.marker_r.id})`"
                            ></path>
                        </g>
                    </svg>
                </div>
            </div>
            <!--图片元素渲染-->
            <div class="ele_rotate"
                 v-else-if="ele.type === 'img' && data_ready"
                 :data-rotate="ele.rotate"
                 :title="ele.link"
                 @click="to_link($event, ele.link)"
				 @touchstart="to_link($event, ele.link)"
                 :style="{'width':`${ele.clip.w * ele.scale.split(',')[0]}px`, 'height':`${ele.clip.h * ele.scale.split(',')[1]}px`, 'opacity':ele.opacity, 'transform':`rotate(${ele.rotate.split(',')[0]}deg)`,'filter':`${ele.shadow_str}`}">
                <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" overflow="visible" :width="ele.clip.w * ele.scale.split(',')[0]" :height="ele.clip.h * ele.scale.split(',')[1]" class="img_content">
                    <g class="ele_scale" :data-scale="ele.scale" :data-matrix="ele.reversal.matrix" :data-translate="ele.reversal.translate" :style="{transform:`scale(${ele.scale})` + 'translate(' + ele.reversal.translate.split(',')[0] + 'px,' + ele.reversal.translate.split(',')[1] + 'px)' + `matrix(${ele.reversal.matrix})`}">
                        <!--边框部分-->
                        <g class="image_border" :transform="`scale(${ele.clip.scale})`">
                            <path fill="transparent"
                                  :vector-effect="(svg_w > 1000 ? 'non-scaling-stroke' : '')"
                                  :d="ele.clip.d"
                                  :stroke="ele.border_c"
                                  :stroke-width="ele.border_w"
                                  :stroke-opacity="ele.border_o / 100"
                                  :stroke-dasharray="Number(ele.border_s) === 16 ? `${ele.border_w/2},${(ele.border_w / 2) * 3}` : ele.border_s"
                                  :stroke-linecap="Number(ele.border_s) === 16 ? 'butt' : ''"
                                  :stroke-linejoin="Number(ele.border_s) === 16 ? 'round' : ''"
                                  :stroke-miterlimit="Number(ele.border_s) === 16 ? 8 : ''"
                            ></path>
                        </g>
                        <!--图片部分-->
                        <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1"
                             :width="ele.clip.w"
                             :height="ele.clip.h"
                             :viewBox="`${ele.clip.x} ${ele.clip.y} ${ele.clip.w} ${ele.clip.h}`"
                        >
                            <image xmlns:xlink="http://www.w3.org/1999/xlink"
                                   v-dim2webp="{ url: ele.url, disableDim: !preloaddim, simple: thumbnail }"
                                   :width="ele.image_w"
                                   :height="ele.image_h"
                                   :clip-path="`url(#${ele.clip.id})`"
                            ></image>
                        </svg>
                        <!--裁剪部分-->
                        <defs>
                            <clipPath class="image_clip" :id="ele.clip.id" :data-type="ele.clip.type" :transform="`translate(${ele.clip.x},${ele.clip.y})`">
                                <path fill="transparent" :d="ele.clip.d" :transform="`scale(${ele.clip.scale})`"></path>
                            </clipPath>
                        </defs>
                    </g>
                </svg>
            </div>
            <!--表格元素渲染-->
            <div class="ele_rotate" 
                v-else-if="ele.type === 'table' && data_ready" 
                :data-rotate="ele.rotate" 
                :style="{'width':`${ele.width * ele.scale.split(',')[0]}px`, 'height':`${ele.height * ele.scale.split(',')[1]}px`, 'opacity':ele.opacity, 'transform':`rotate(${ele.rotate.split(',')[0]}deg)`}"
            >
                <div class="ele_scale" :data-scale="ele.scale" :style="{width:`${ele.width}px`, height:`${ele.height}px`, transform:`scale(${ele.scale})`}">
                    <table border="0" cellpadding="0" cellspacing="0" :style="{width:`${ele.width}px`, height:`${ele.height}px`}">
                        <tbody>
                            <tr v-for="(tr,tr_index) in ele.tr_list" 
                                :key="tr_index"
                                :data-row="tr_index" 
                                :height="ele.row_height[tr_index]"
                            >
                                <td v-for="(td,td_index) in tr"
                                    :key="td_index"
                                    :data-column="td_index"
                                    :data-row="tr_index"
                                    v-html="td.content"
                                    :class="{'merge_hide':td.hide}"
                                    :style="td.style_str"
                                    :width="ele.column_width[td_index]"
                                    :colspan="td.colspan"
                                    :rowspan="td.rowspan">
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
            <!-- 图表元素渲染 -->
            <div class="ele_rotate" 
				v-else-if="ele.type === 'chart' && data_ready" 
				:data-rotate="ele.rotate" 
				:style="{'opacity':ele.opacity}" 
				:title="ele.link"
				@click="to_link($event, ele.link)"
				@touchstart="to_link($event, ele.link)"
			>
                <div class="ele_scale" :data-scale="ele.scale">
                    <div class="chart_content" :chart-data="JSON.stringify(ele.chart_data)" :chart-style="ele.chart_style" :style="{width:`${ele.width}px`, height:`${ele.height}px`, 'border':`${ele.border_w}px ${ele.border_s} ${ele.border_c}`, 'background-color':ele.background_c,}"></div>
                    <img class="chart_preview" v-show="ele.chart_image" 
                        v-dim2webp="{ url: ele.chart_image, disableDim: !preloaddim, simple: thumbnail }" 
                        :width="ele.width" 
                        :height="ele.height" />
                </div>
            </div>
            <!-- 视频元素渲染 -->
            <div class="ele_rotate" 
                v-else-if="ele.type === 'video' && data_ready" 
                :style="{'width':`${ele.width}px`, 'height':`${ele.height}px`, 'opacity':ele.opacity, 'transform':` rotate(${ele.rotate.split(',')[0]}deg)`}"
            >
                <div class="ele_scale" :data-scale="ele.scale" v-if="!thumbnail && ele.outside && ['outside', 'all'].indexOf(use_video) >= 0">
                    <div class="video_layer"
                        @click.stop
                        @touchstart.stop
                        @touchend.stop
                    >
                        <iframe :src="ele.src"
                            :data-src="ele.src"
                            :style="{'width': `${ele.width}px`, 'height': `${ele.height}px`}"
                        ></iframe>
					</div>
                </div>
                <div class="ele_scale" :data-scale="ele.scale" v-else-if="!thumbnail && !ele.outside && ['inside', 'all'].indexOf(use_video) >= 0">
                    <div class="video_layer"
                        @click.stop
                        @touchstart.stop
                        @touchend.stop
                    >
                        <video :width="ele.width"
                            :height="ele.height"
                            :controls="ele.controls"
                            :loop="ele.loop"
                            :muted="ele.muted"
                            :src="ele.src"
                            :data-autoplay="ele.autoplay"
                            @play="video_playing"
                            @pause="video_playing"
                        ></video>
                        <div class="video_play_layer" @click="video_play_2_pause">
                            <div class="video_play">
                                <svg viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M852.727563 392.447107C956.997809 458.473635 956.941389 565.559517 852.727563 631.55032L281.888889 993.019655C177.618644 1059.046186 93.090909 1016.054114 93.090909 897.137364L93.090909 126.860063C93.090909 7.879206 177.675064-35.013033 281.888889 30.977769L852.727563 392.447107 852.727563 392.447107Z" fill="#ffffff"></path>
                                </svg>
                            </div>
						</div>
					</div>
                </div>
                <div class="ele_scale" :data-scale="ele.scale" v-else>
                    <div class="video_layer">
						<img class="video_cover" :src="ele.cover" />
                        <div class="video_play">
							<svg viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg">
								<path d="M852.727563 392.447107C956.997809 458.473635 956.941389 565.559517 852.727563 631.55032L281.888889 993.019655C177.618644 1059.046186 93.090909 1016.054114 93.090909 897.137364L93.090909 126.860063C93.090909 7.879206 177.675064-35.013033 281.888889 30.977769L852.727563 392.447107 852.727563 392.447107Z" fill="#ffffff"></path>
							</svg>
						</div>
                        <slot name="cannotplayTips"></slot>
					</div>
                </div>
            </div>
            <!-- 音频元素渲染 -->
            <div class="ele_rotate" 
                v-else-if="ele.type === 'audio' && data_ready"
                :style="{'width':`${ele.width}px`, 'height':`${ele.height}px`, 'opacity':ele.opacity, 'transform':` rotate(${ele.rotate.split(',')[0]}deg)`}"
                @click.stop="audio_play_2_pause"
                @touchstart.stop="audio_play_2_pause"
                @touchend.stop
            >
                <div class="ele_scale" :data-scale="ele.scale" :style="{'width':`${ele.width}px`, 'height':`${ele.height}px`}">
                    <div class="audio_layer">
                        <svg class="audio_icon" viewBox="0 0 1280 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" cursor="pointer" 
                            :width="ele.width" 
                            :height="ele.height"
                        >
                            <path d="M529.1 901.6 C526.4 901.6 517 897.5 512.1 892.6 L511.8 892.3 L281.4 702.2 H96.1 C87.2 702.2 77.8 697.6 73.4 693.2 C69 688.8 64.4 679.4 64.4 670.5 V351.5 C64.4 344.5 67.1 338.6 68.8 336.9 H71 L73.4 334.5 C77.8 330.1 87.2 325.5 96.1 325.5 H281.4 L511.8 129.7 L512 129.5 C517.8 123.7 524.9 122.5 529.8 122.5 C534.2 122.5 538.7 123.5 542.4 125.4 L542.9 125.7 L543.4 125.9 C555.9 130.1 560.6 137.2 560.6 152.3 V870.1 C560.6 885.2 555.9 892.4 543.4 896.5 L541.6 897.1 L540.2 898.5 C537.2 901.5 534.6 901.6 529.1 901.6Z" fill="#3695ff"></path>
                            <path d="M688.6 696.6 C680.3 696.6 666 686.9 661.7 678.3 L661.5 677.8 L661.2 677.4 C653 665 662 647 675.7 637.7 C682.1 634.3 736.6 602.2 736.6 505.4 C736.6 458.9 718.6 427 703.4 408.4 C686.9 388.2 670.3 379 669.7 378.6 L669.1 378.3 L668.4 378.1 C662.6 376.2 657 369.6 654.1 361.3 C651.2 353 651.8 344.7 655.5 339.1 L656.1 338.2 L656.4 337.2 C659.3 328.6 672 321.1 683.7 321.1 C688.2 321.1 692.3 322.2 695.4 324.3 L697.5 325.7 H699 C703.5 327.4 728.1 339.7 752.5 367.6 C774.2 392.5 800.1 435.7 800.1 499.8 C800.1 572.7 775.6 620 755.1 646.9 C732.5 676.4 709.5 689.1 704.7 691 H702.3 L699.9 693.4 C696.7 696.4 694.2 696.6 688.6 696.6Z" fill="#3695ff"></path>
                            <path d="M808.2 821.9 C798.3 821.9 785.1 816.8 781.3 809.3 C772.3 791.3 775.5 772.9 789.2 763.2 C794 761.2 800.8 756 809.5 747.6 C818.4 738.9 831.9 723.9 845.7 701.9 C868.7 665.1 896.1 602.2 896.1 511 S867.1 356.8 842.8 319.9 C828.3 297.9 814 282.9 804.6 274.3 C798 268.2 789.7 261.3 783.6 258.8 C771 249.7 766.6 227.4 774.7 214.3 C784.1 205.2 795.3 200 805.5 200 C810.9 200 815.9 201.4 820.3 204.2 C821 204.8 821.9 205.5 823.3 206.6 C852.7 229.7 878.2 258 899.1 290.7 C939.2 353.6 959.6 427.7 959.6 511 C959.6 594.7 939.9 669.1 901.2 732.1 C881.1 764.8 856.7 793 828.6 815.7 C826.9 817.1 826 817.8 825.3 818.5 C821.9 821.9 812 821.9 808.2 821.9Z" fill="#3695ff"></path>
                        </svg>
                        <audio v-if="!thumbnail && use_audio" 
                            v-show="false" 
                            :src="ele.src" 
                            :loop="ele.loop" 
                            :data-autoplay="ele.autoplay" 
                            :data-fadein="ele.fadein" 
                            :data-fadeout="ele.fadeout"
                            :data-hideonshow="ele.hideonshow"
                            @play="audio_playing"
                            @pause="audio_playing"
                        ></audio>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
    import opt_factory from '@/assets/pc/js/opt/opt_factory.js';

    export default{
        props: {
            svg_w: Number,
            svg_h: Number,
            svg_view: Array,
            page_info: Object,
            mode: {                         // 模式：normal=正常，mini=缩略，preload=预加载模糊图
                type: String,
                default: 'normal',
            },
            lazyshow: undefined,            // 懒加载模式下文档显示标识
            use_link: Boolean,              // 是否启用元素链接事件
            use_chart: Boolean,             // 是否启用图表实例化
            use_audio: Boolean,             // 是否启用音频，渲染音频元素
            use_video: {                    // 是否启用视频，no = 不渲染视频， all = 渲染任何格式视频， outside = 外链视频， inside = 上传的视频
                type: String,
                default: 'no',
            },
        },
        data() {
            return {
                read: false,
                data_ready: false,
                thumbnail: this.mode === 'mini',
                preloaddim: this.mode === 'preload',
                new_page_info: '',
                new_background: {
                    type: 'color',
                    color: '',
                    image: null,
                    url: ''
                },
            }
        },
        watch: {
            page_info:{
                handler(value) {
                    this.data_ready = false;
                    this.new_page_info = utils.deepClone(value);
                    this.format_element_data();
                    this.format_background();
                    this.element_show_init();
                },
                deep: true
            },
            // 懒加载模式已读状态更新
            lazyshow: function (n) {
                if (this.read) {
                    return;
                }
                this.read = !!n;
                this.element_show_init();
            },
        },
        created() {
            // 懒加载模式已读状态设置
            this.read = typeof this.lazyshow === 'boolean' ? this.lazyshow : true;
        },
        mounted:function(){
            this.new_page_info =  utils ? utils.deepClone(this.page_info) : this.page_info;
            this.format_element_data();
            this.format_background();
            this.element_show_init();
        },
        methods:{
            // 背景数据处理
            format_background() {
                let page_info = this.new_page_info;
                if (!page_info.background) return;
                let page_background = utils.deepClone(page_info.background);
                let color_data = page_background.color;
                // 无背景色时默认白色
                if (color_data === 'transparent' || page_background.type === 'gradient' || (image_data && image_data.src.indexOf('png') < 0)) {
                    color_data = "#ffffff";
                }
                // 旧背景图数据
                if (page_info.backgroundImageWidth && page_info.backgroundImageHeight){
                    page_background.image.width = page_info.backgroundImageWidth;
                    page_background.image.height = page_info.backgroundImageHeight;
                }
                // 获取背景样式
                let background_style = opt_factory.init_opt('group').background_obj_2_style(page_background);
                // 设置新背景对象
                let image_data = page_background.image;
                if (image_data && image_data.src) {
                    this.new_background.type = 'image';
                    this.new_background.image = background_style;
                    this.new_background.url = image_data.src;
                } else {
                    this.new_background.type = 'color';
                    this.new_background.color = background_style;
                }
            },
            // 元素数据处理
            format_element_data:function(){
                let that = this;
                if(!that.new_page_info.elementList) return;
                let new_element = [];
                that.new_page_info.elementList.forEach(i => {
                    let item = utils.deepClone(i);
                    // 坐标值异常，过滤处理（会导致整个页面不显示）
                    if (item.translate.indexOf('e') >= 0) {
                        return;
                    }
                    switch (item.type) {
                        case 'table':
                            item = that.table_deal(item);
                            break;
                        case 'shape':
                            item = that.shape_deal(item);
                            break;
                        case 'img':
                            item = that.img_deal(item);
                            break;
                        case 'line':
                            item = that.line_deal(item);
                            break;
                        case 'text':
                            item = that.text_deal(item);
                            break;
                    }
                    new_element.push(item);
                });
                
                that.new_page_info.elementList = new_element;
                // 开始渲染
                that.data_ready = true;
                // 演示用的文档编辑属性修改
                that.$nextTick(() => {
                    $('.edit_page[data-id] .ele_item [contenteditable]').attr('contenteditable', 'false');
                });
            },
            // 表格元素旧数据处理
            table_deal: function (item) {
                let option = opt_factory.init_opt('table');
                item = option.format_table_data(item);
                return item;
            },
            // 形状元素旧数据处理
            shape_deal(item) {
                let option = opt_factory.init_opt('shape');
                // 旧数据处理
                item = option.format_shape_data(item);
                // 获取阴影样式字符串
                item.shadow_str = option.split_shadow_data(item);
                // 定义渐变id
                item.background_id = `background_${utils.uuid()}`;
                return item;
            },
            // 图片元素旧数据处理
            img_deal(item) {
                let option = opt_factory.init_opt('img');
                // 旧数据处理
                item = option.format_image_data(item);
                // 阴影属性计算
                item.shadow_str = option.split_shadow_data(item);
                // 定义裁剪id -> 处理编辑页多标签同id导致裁剪失效问题
                item.clip.id = `image_clip_${utils.uuid()}`;
                return item;
            },
            // 线条元素旧数据处理
            line_deal(item) {
                return opt_factory.init_opt('line').line_to_path(item);
            },
            // 文字元素旧数据处理
            text_deal(item) {
                return opt_factory.init_opt('text').format_text_data(item);
            },

            // 元素链接跳转
            to_link: function (event, link) {
                if (!this.use_link) {
                    return;
                }
                if (!link) {
                    return;
                }
                // 如果支持 touch 并且事件为 click 则禁止掉
                if (('ontouchstart' in window) && event.type === 'click') {
                    return;
                }
                let link_str = $validate(link).url() ? link : `http://${link}`;
                utils.windowOpenNewtab(link_str);
                event.stopPropagation();
                event.preventDefault();
            },
            // 音频播放/暂停
            audio_play_2_pause: function (event) {
                if (!event || !event.target) {
                    return;
                }
                // 如果支持 touch 并且事件为 click 则禁止掉
                if (('ontouchstart' in window) && event.type === 'click') {
                    return;
                }
                let audio = $(event.target).parents('.ele_item').find('audio')[0];
                if (!audio) {
                    return;
                }
                if (audio.paused) {
                    audio.play();
                } else {
                    audio.pause();
                }
            },
            // 音频放映
            audio_playing: function (event) {
                if (!this.use_audio) {
                    return;
                }
                if (!event || !event.target) {
                    return;
                }
                let option = opt_factory.init_opt('audio');
                let audio = event.target;
                let is_hide = audio.getAttribute('data-hideonshow') === 'true';
                let parent = $(audio).parents('.audio_layer');
                let $icon = parent.find('.audio_icon');
                // 淡入淡出
                option.fadein_and_fadeout(audio);
                // 播放时隐藏
                if (is_hide) {
                    parent.css('visibility', audio.paused ? 'visible' : 'hidden');
                }
                // 播放时图标动画
                if (event.type === 'play') {
                    $icon.addClass('playing');
                }
                if (event.type === 'pause') {
                    $icon.removeClass('playing');
                }
            },
            // 音频播放/暂停
            video_play_2_pause: function (event) {
                if (!event || !event.target) {
                    return;
                }
                let video = $(event.target).parents('.ele_item').find('video')[0];
                if (!video) {
                    return;
                }
                if (video.paused) {
                    video.play();
                } else {
                    video.pause();
                }
            },
            // 视频放映
            video_playing: function (event) {
                if (!event || !event.target) {
                    return;
                }
                let video = event.target;
                if (video.paused) {
                    $(video).siblings('.video_play_layer').show();
                } else {
                    $(video).siblings('.video_play_layer').hide();
                }
            },
            // 元素实例化处理
            element_show_init: function () {
                let that = this;
                that.$nextTick(() => {
                    let page = that.$refs.edit_page;
                    if (!page || page.nodeType !== 1) {
                        return;
                    }
                    // 富文本处理
                    page.querySelectorAll('[contenteditable="true"]').forEach(item => item.setAttribute('contenteditable', 'false'));
                    page.querySelectorAll('[contenteditable] a').forEach(item => {
                        item.setAttribute('target', '_blank');
                        item.setAttribute('rel', 'noreferrer noopener');
                    });
                    // 图表实例化
                    if (that.use_chart && page.querySelectorAll('.ele_item[data-type="chart"]').length) {
                        let chart_opt = opt_factory.init_opt('chart');
                        page.querySelectorAll('.ele_item[data-type="chart"]').forEach(item => chart_opt.init_instance($(item), true));
                    }
                });
            },
        },
    }
</script>

<style lang="less">
@import url('../assets/font/fontFamily.css');
/* 画布 & 元素基本样式 */
.edit_page {position:relative; transform-origin:0 0; overflow:hidden;}
.edit_page .page_bg {width:100%; height:100%; background:transparent;}
.edit_page .ele_item {position:absolute; width:0; height:0; font-size:0;}
.edit_page .ele_item div[data-scale] {transform-origin:0 0;}
.edit_page .ele_item div[data-rotate] {width:100%; height:100%;}
/* 富文本内容元素 文本、表格、形状 */
.edit_page .ele_item.lock [contenteditable=true] {pointer-events:none;}
.edit_page .ele_item .show_text:focus {border:none; outline:none;}
.edit_page .ele_item .show_text{line-height:1.4; background-color:transparent; word-break:break-all; text-align: left; cursor:text; -webkit-user-select:text !important;}
.edit_page .ele_item .show_text *{-webkit-user-select:text!important}
.edit_page .ele_item .show_text a{color:inherit; cursor:inherit;}
.edit_page .ele_item .show_text a:hover{opacity: 1;}
.edit_page .ele_item .show_text .customize_selection,
.edit_page .ele_item .show_text .customize_selection *{color: #ffffff !important;}
.edit_page .ele_item .show_text ul{padding-left: 1em; list-style:initial;}
.edit_page .ele_item .show_text ol{padding-left: 1.5em; list-style:initial;}
.edit_page .ele_item .show_text li{list-style:inherit;}
.edit_page .ele_item .show_text ul.diamond,
.edit_page .ele_item .show_text ul.square-box,
.edit_page .ele_item .show_text ul.hook,
.edit_page .ele_item .show_text ul.arrow,
.edit_page .ele_item .show_text ul.spot{list-style:none;}
.edit_page .ele_item .show_text ul.diamond li::before {content:"◆"; display:inline-block; position:relative; width:1em; margin-left:-1em;}
.edit_page .ele_item .show_text ul.square-box li::before {content:"□"; display:inline-block; position:relative; width:1em; margin-left:-1em;}
.edit_page .ele_item .show_text ul.hook li::before {content:"✓"; display:inline-block; position:relative; width:1em; margin-left:-1em;}
.edit_page .ele_item .show_text ul.arrow li::before {content:"➤"; display:inline-block; position:relative; width:1em; margin-left:-1em;}
.edit_page .ele_item .show_text ul.spot li::before {content:"•"; display:inline-block; position:relative; width:1em; margin-left:-1em;}
/* 文本元素 */
.edit_page .ele_item[data-type="text"] .show_text{display: inline-block !important;}
.edit_page .ele_item[data-type="text"] .show_text.art:empty::before{content: '请输入内容'; color: inherit;}
.edit_page .ele_item[data-type="text"] .show_text.art[style*="background-image"],
.edit_page .ele_item[data-type="text"] .show_text.art[style*="background-image"] a,
.edit_page .ele_item[data-type="text"] .show_text.art[style*="background-image"] span,
.edit_page .ele_item[data-type="text"] .show_text.art[style*="background-image"] div{background-repeat:repeat; background-size:100% 100%; -webkit-text-fill-color:transparent; -webkit-background-clip:text; background-clip:text;}
/* 形状元素 */
.edit_page .ele_item[data-type="shape"] .show_text {position: absolute; top: 50%; left: 50%; width: calc(200% - 40px) !important; height: auto !important; min-width: 1em; min-height: 1em; transform: translate(-25%, -25%) scale(0.5, 0.5); transform-origin: 0 0; overflow: visible; cursor: move;}
.edit_page .ele_item[data-type="shape"] .show_text:focus {cursor: text;}
/* 表格元素 */
.edit_page .ele_item[data-type="table"] table {width:100%; border-collapse:collapse;}
.edit_page .ele_item[data-type="table"] table td {padding:5px;  border:2px solid currentColor;  vertical-align:middle;  min-width:6px;  outline:none;  word-break:break-word;  cursor:text;}
.edit_page .ele_item[data-type="table"] table td.merge_hide {display:none;}
.edit_page .ele_item[data-type="table"] table td .show_text {display:block; outline:none; min-height:5px; font-size:20px;}
.edit_page .ele_item[data-type="table"] table .cel_selected{background:#a2e7ff !important;}
.edit_page .ele_item[data-type="table"] .table_resizer{display:none;}
.edit_page .ele_item[data-type="table"].checked .table_resizer{display:block; position:absolute; z-index:10; opacity:0; background-color:rgba(22,155,213,0.4);}
.edit_page .ele_item[data-type="table"].checked .table_resizer.table_column_resizer{width:12px;height:100%;top:0;margin-left:-5px;cursor:col-resize;}
.edit_page .ele_item[data-type="table"].checked .table_resizer.table_column_resizer.left{margin-left:0;}
.edit_page .ele_item[data-type="table"].checked .table_resizer.table_row_resizer{width:100%; height:12px; top:0; margin-top:-5px; cursor:row-resize;}
.edit_page .ele_item[data-type="table"].checked .table_resizer.table_row_resizer.top{margin-top:0;}
.edit_page .ele_item[data-type="table"].checked .table_resizer:hover{opacity:1;}
.edit_page .ele_item[data-type="table"].checked td.standard_merge{position:relative; z-index:11;}
/* 图表元素 */
.edit_page .ele_item[data-type="chart"] .chart_preview {display: none; position: absolute; top: 0; left: 0; pointer-events: none;}
.edit_page .ele_item[data-type="chart"] .chart_content:empty + .chart_preview {display: block;}
/* 媒体元素 */
.edit_page .ele_item video,
.edit_page .ele_item audio{outline: none;}
.edit_page .ele_item[data-type="video"] .ele_scale {width: 100%; height: 100%;}
.edit_page .ele_item[data-type="video"] .video_layer {position: relative; width: 100%; height: 100%; background-color: #333333;}
.edit_page .ele_item[data-type="video"] .video_layer::after {content: ""; position: absolute; top: 0; left: 0; z-index: 1; width: 100%; height: 100%; background-color: rgba(0,0,0,0.4);}
.edit_page .ele_item[data-type="video"] .video_layer .video_play_layer {position: absolute; top: 0; left: 0; width: 100%; height: 100%; z-index: 4;}
.edit_page .ele_item[data-type="video"] .video_layer .video_play {position: absolute; top: 50%; left: 50%; z-index: 2; width: 80px; height: 80px; margin: -40px 0 0 -40px; cursor: pointer; background-color: rgba(0,0,0,0.8); border-radius: 50%;}
.edit_page .ele_item[data-type="video"] .video_layer .video_play svg {position: absolute; top: 50%; left: 50%; width: 40px; height: 40px; margin: -20px 0 0 -16px; transform: scale(1);}
.edit_page .ele_item[data-type="video"] .video_layer iframe,
.edit_page .ele_item[data-type="video"] .video_layer video {position: relative; z-index: 3;}
.edit_page .ele_item[data-type="video"] .video_layer img {display: none; width: 100%; height: 100%; object-fit: cover;}
.edit_page .ele_item[data-type="video"] .video_layer img[src^=http] {display: block;}
.edit_page .ele_item[data-type="audio"] svg.playing path:nth-of-type(2),
.edit_page .ele_item[data-type="audio"] svg.playing path:nth-of-type(3) {transform-origin: center center; animation: play 1s linear infinite both;}
@keyframes play {
    0% { opacity: 1; transform: translateX(0) scale(1); }
    100% { opacity: 0; transform: translateX(10%) scale(1.5); }
}
/* 切换页动画 */
[data-switch]{opacity: 0;}
[data-switch].show{z-index: 2; opacity: 1;}
/* 淡入淡出 */
[data-switch=fadeInAndOut]{opacity: 0; transition: opacity 0.6s;}

/* 上下翻页 */
[data-switch=pagingDown]{opacity: 0; animation-fill-mode: both;}
[data-switch=pagingDown].prev_in{animation: pagingtop_in 0.6s ease-out;}
@keyframes pagingtop_in{
    0%{ opacity: 0; transform: translateY(-100%) scale(0.5); }
    100%{ opacity: 1; transform: translateY(0) scale(1); }
}
[data-switch=pagingDown].prev_out{animation: pagingtop_out 0.6s ease-out;}
@keyframes pagingtop_out{
    0%{ opacity: 1; transform: translateY(0) scale(1); }
    100%{ opacity: 0; transform: translateY(-100%) scale(0.5); }
}
[data-switch=pagingDown].next_in{animation: pagingbottom_in 0.6s ease-out;}
@keyframes pagingbottom_in{
    0%{ opacity: 0; transform: translateY(100%) scale(0.5); }
    100%{ opacity: 1; transform: translateY(0) scale(1); }
}
[data-switch=pagingDown].next_out{animation: pagingbottom_out 0.6s ease-out;}
@keyframes pagingbottom_out{
    0%{ opacity: 1; transform: translateY(0) scale(1); }
    100%{ opacity: 0; transform: translateY(100%) scale(0.5);}
}

/* 左右翻页 */
[data-switch=pagingRight]{opacity: 0; animation-fill-mode: both;}
[data-switch=pagingRight].prev_in{animation: pagingleft_in 0.6s ease-out;}
@keyframes pagingleft_in{
    0%{ opacity: 0; transform: translateX(-100%) scale(0.5);}
    100%{ opacity: 1; transform: translateX(0) scale(1);}
}
[data-switch=pagingRight].prev_out{animation: pagingleft_out 0.6s ease-out;}
@keyframes pagingleft_out{
    0%{ opacity: 1; transform: translateX(0) scale(1);}
    100%{ opacity: 0; transform: translateX(-100%) scale(0.5);}
}
[data-switch=pagingRight].next_in{animation: pagingright_in 0.6s ease-out;}
@keyframes pagingright_in{
    0%{ opacity: 0; transform: translateX(100%) scale(0.5);}
    100%{ opacity: 1; transform: translateX(0) scale(1);}
}
[data-switch=pagingRight].next_out{animation: pagingright_out 0.6s ease-out;}
@keyframes pagingright_out{
    0%{ opacity: 1; transform: translateX(0) scale(1);}
    100%{ opacity: 0; transform: translateX(100%) scale(0.5);}
}

/* 上下推移 */
[data-switch=gooseDown]{opacity: 0; animation-fill-mode: both;}
[data-switch=gooseDown].prev_in{animation: goosetop_in 0.6s ease-in-out;}
@keyframes goosetop_in{
    0%{ opacity: 0; transform: translateY(-100%);}
    100%{ opacity: 1; transform: translateY(0);}
}
[data-switch=gooseDown].prev_out{animation: goosetop_out 0.6s ease-in-out;}
@keyframes goosetop_out{
    0%{ opacity: 1; transform: translateY(0);}
    100%{ opacity: 0; transform: translateY(-100%);}
}
[data-switch=gooseDown].next_in{animation: goosebottom_in 0.6s ease-in-out;}
@keyframes goosebottom_in{
    0%{ opacity: 0; transform: translateY(100%);}
    100%{ opacity: 1; transform: translateY(0);}
}
[data-switch=gooseDown].next_out{animation: goosebottom_out 0.6s ease-in-out;}
@keyframes goosebottom_out{
    0%{ opacity: 1; transform: translateY(0);}
    100%{ opacity: 0; transform: translateY(100%);}
}

/* 左右推移 */
[data-switch=gooseRight]{opacity: 0; animation-fill-mode: both;}
[data-switch=gooseRight].prev_in{animation: gooseleft_in 0.6s ease-in-out;}
@keyframes gooseleft_in{
    0%{ opacity: 0; transform: translateX(-100%); }
    100%{ opacity: 1; transform: translateX(0); }
}
[data-switch=gooseRight].prev_out{animation: gooseleft_out 0.6s ease-in-out;}
@keyframes gooseleft_out{
    0%{ opacity: 1; transform: translateX(0); }
    100%{ opacity: 0; transform: translateX(-100%); }
}
[data-switch=gooseRight].next_in{animation: gooseright_in 0.6s ease-in-out;}
@keyframes gooseright_in{
    0%{ opacity: 0; transform: translateX(100%); }
    100%{ opacity: 1; transform: translateX(0); }
}
[data-switch=gooseRight].next_out{animation: gooseright_out 0.6s ease-in-out;}
@keyframes gooseright_out{
    0%{ opacity: 1; transform: translateX(0); }
    100%{ opacity: 0; transform: translateX(100%); }
}

/* 翻转 */
[data-switch=flipping]{opacity: 0; animation-fill-mode: both;}
[data-switch=flipping].prev_in{animation: flip_prev_in 0.6s ease-out;}
@keyframes flip_prev_in {
    0%{ opacity: 0; transform-origin: center center; transform: rotateY(180deg); }
    50%{ opacity: 0; transform-origin: center center; transform: rotateY(90deg);}
    51%{ opacity: 1; transform-origin: center center; transform: rotateY(88.2deg);}
    100%{ opacity: 1; transform-origin: center center; transform: rotateY(0deg);}
}
[data-switch=flipping].prev_out{animation: flip_prev_out 0.6s ease-out;}
@keyframes flip_prev_out {
    0%{ opacity: 1; transform-origin: center center; transform: rotateY(0); }
    50%{ opacity: 1; transform-origin: center center; transform: rotateY(90deg);}
    51%{ opacity: 0; transform-origin: center center; transform: rotateY(91.8deg);}
    100%{ opacity: 0; transform-origin: center center; transform: rotateY(180deg);}
}
[data-switch=flipping].next_in{animation: flip_next_in 0.6s ease-out;}
@keyframes flip_next_in{
    0%{ opacity: 0; transform-origin: center center; transform: rotateY(-180deg); }
    50%{ opacity: 0; transform-origin: center center; transform: rotateY(-90deg);}
    51%{ opacity: 1; transform-origin: center center; transform: rotateY(-88.2deg);}
    100%{ opacity: 1; transform-origin: center center; transform: rotateY(0deg);}
}
[data-switch=flipping].next_out{animation: flip_next_out 0.6s ease-out;}
@keyframes flip_next_out{
    0%{ opacity: 1; transform-origin: center center; transform: rotateY(0); }
    50%{ opacity: 1; transform-origin: center center; transform: rotateY(-90deg);}
    51%{ opacity: 0; transform-origin: center center; transform: rotateY(-91.8deg);}
    100%{ opacity: 0; transform-origin: center center; transform: rotateY(-180deg);}
}

/* 切换 */
[data-switch=switching]{opacity: 0; animation-fill-mode: both;}
[data-switch=switching].prev_in{opacity: 1; animation: switch_prev_in 1.2s;}
@keyframes switch_prev_in {
    0% { transform: translate3d(0, 0, 0) rotateY(0); z-index: 1; }
    49% { transform: translate3d(49%, 0, -98px) rotateY(-25deg); z-index: 1; }
    50% { transform: translate3d(50%, 0, -100px) rotateY(-25deg); z-index: 2; }
    100% { transform: translate3d(0, 0, 0) rotateY(0); z-index: 2; }
}
[data-switch=switching].prev_out{opacity: 1; animation: switch_prev_out 1.2s;}
@keyframes switch_prev_out {
    0% { transform: translate3d(0, 0, 0) rotateY(0); z-index: 2; }
    49% { transform: translate3d(49%, 0, -98px) rotateY(-25deg); z-index: 2; }
    50% { transform: translate3d(50%, 0, -100px) rotateY(-25deg); z-index: 1; }
    100% { transform: translate3d(0, 0, 0) rotateY(0); z-index: 1; }
}
[data-switch=switching].next_in{opacity: 1; animation: switch_next_in 1.2s;}
@keyframes switch_next_in {
    0% { transform: translate3d(0, 0, 0) rotateY(0); z-index: 1; }
    49% { transform: translate3d(-49%, 0, -98px) rotateY(25deg); z-index: 1; }
    50% { transform: translate3d(-50%, 0, -100px) rotateY(25deg); z-index: 2; }
    100% { transform: translate3d(0, 0, 0) rotateY(0); z-index: 2; }
}
[data-switch=switching].next_out{opacity: 1; animation: switch_next_out 1.2s;}
@keyframes switch_next_out {
    0% { transform: translate3d(0, 0, 0) rotateY(0); z-index: 2; }
    49% { transform: translate3d(-49%, 0, -98px) rotateY(25deg); z-index: 2; }
    50% { transform: translate3d(-50%, 0, -100px) rotateY(25deg); z-index: 1; }
    100% { transform: translate3d(0, 0, 0) rotateY(0); z-index: 1; }
}

/* 库 */
[data-switch=library]{opacity: 0; animation-fill-mode: both;}
[data-switch=library].prev_in{opacity: 1; animation: library_prev_in 1s ease-in-out;}
@keyframes library_prev_in {
    0% { transform: translateX(-115%) rotateY(0); transform-origin: 225% 50%; }
    33% { transform: translateX(-115%) rotateY(-15deg); transform-origin: 225% 50%; }
    66% { transform: translateX(0) rotateY(-15deg); transform-origin: 225% 50%; }
    100% { transform: translateX(0) rotateY(0); transform-origin: 225% 50%; }
}
[data-switch=library].prev_out{opacity: 1; animation: library_prev_out 1s ease-in-out;}
@keyframes library_prev_out {
    0% { transform: translateX(0) rotateY(0); transform-origin: 225% 50%; }
    33% { transform: translateX(0) rotateY(-15deg); transform-origin: 225% 50%; }
    66% { transform: translateX(-115%) rotateY(-15deg); transform-origin: 225% 50%; }
    100% { transform: translateX(-115%) rotateY(0); transform-origin: 225% 50%; }
}
[data-switch=library].next_in{opacity: 1; animation: library_next_in 1s ease-in-out;}
@keyframes library_next_in {
    0% { transform: translateX(115%) rotateY(0); transform-origin: 125% 50%; }
    33% { transform: translateX(115%) rotateY(-15deg); transform-origin: 125% 50%; }
    66% { transform: translateX(0) rotateY(-15deg); transform-origin: 125% 50%; }
    100% { transform: translateX(0) rotateY(0); transform-origin: 125% 50%; }
}
[data-switch=library].next_out{opacity: 1; animation: library_next_out 1s ease-in-out;}
@keyframes library_next_out {
    0% { transform: translateX(0) rotateY(0); transform-origin: 125% 50%; }
    33% { transform: translateX(0) rotateY(-15deg); transform-origin: 125% 50%; }
    66% { transform: translateX(115%) rotateY(-15deg); transform-origin: 125% 50%; }
    100% { transform: translateX(115%) rotateY(0); transform-origin: 125% 50%; }
}
/* 立方体 */


/* 缩放 */
[data-switch=zoom]{opacity: 0; animation-fill-mode: both;}
[data-switch=zoom].prev_in{opacity: 0; animation: zoom_prev_in 0.6s ease-in-out;}
@keyframes zoom_prev_in {
    0% { transform: scale(1.5); transform-origin: 50% 50%; opacity: 0; }
    100% { transform: scale(1); transform-origin: 50% 50%; opacity: 1; }
}
[data-switch=zoom].prev_out{opacity: 1; animation: zoom_prev_out 0.6s ease-in-out;}
@keyframes zoom_prev_out {
    0% { transform: scale(1); transform-origin: 50% 50%; opacity: 1; }
    100% { transform: scale(1.5); transform-origin: 50% 50%; opacity: 0; }
}
[data-switch=zoom].next_in{opacity: 0; animation: zoom_next_in 0.6s ease-in-out;}
@keyframes zoom_next_in {
    0% { transform: scale(0.5); transform-origin: 50% 50%; opacity: 0;}
    100% { transform: scale(1); transform-origin: 50% 50%; opacity: 1;}
}
[data-switch=zoom].next_out{opacity: 1; animation: zoom_next_out 0.6s ease-in-out;}
@keyframes zoom_next_out {
    0% { transform: scale(1); transform-origin: 50% 50%; opacity: 1; }
    100% { transform: scale(0.5); transform-origin: 50% 50%; opacity: 0; }
}

/* 摩天轮 */
[data-switch=ferrisWheel]{opacity: 0; animation-fill-mode: both;}
[data-switch=ferrisWheel].prev_in{opacity: 1; animation: ferrisWheelout_prev_in 1.5s;}
@keyframes ferrisWheelout_prev_in {
    0% { transform-origin: 50% 150% -150px; transform: translate3d(0, 50%, 1500px) rotateX(85deg) rotateZ(8deg); opacity: 0; }
    100% { transform-origin: 50% 150% 0; transform: translate3d(0, 0, 0) rotateX(0) rotateZ(0); opacity: 1; }
}
[data-switch=ferrisWheel].prev_out{opacity: 1; animation: ferrisWheel_prev_out 1.5s;}
@keyframes ferrisWheel_prev_out {
    0% { transform-origin: 50% 150% 0; transform: translate3d(0, 0, 0) rotateX(0) rotateZ(0); opacity: 1; }
    100% { transform-origin: 50% 150% -150px; transform: translate3d(0, 50%, 1500px) rotateX(85deg) rotateZ(8deg); opacity: 0; }
}
[data-switch=ferrisWheel].next_in{opacity: 1; animation: ferrisWheelout_next_in 1.5s;}
@keyframes ferrisWheelout_next_in {
    0% { opacity: 0; transform-origin: 10% 10% -300px; transform: translate3d(-100%, -240%, -2500px) scale(0.5) rotateZ(-35deg) rotateX(-90deg); }
    100% { opacity: 1; transform-origin: 0 0 0; transform: translate3d(0, 0, 0) scale(1) rotateZ(0) rotateX(0); }
}
[data-switch=ferrisWheel].next_out{opacity: 1; animation: ferrisWheel_next_out 1.5s;}
@keyframes ferrisWheel_next_out {
    0% { opacity: 1; transform-origin: 0 0 0; transform: translate3d(0, 0, 0) scale(1) rotateZ(0) rotateX(0); }
    100% { opacity: 0; transform-origin: 10% 10% -300px; transform: translate3d(-100%, -240%, -2500px) scale(0.5) rotateZ(-35deg) rotateX(-90deg); }
}

/* 轨道 */
[data-switch=track]{opacity: 0; animation-fill-mode: both;}
[data-switch=track].prev_in{opacity: 1; animation: track_prev_in 1.5s linear;}
@keyframes track_prev_in {
    0% { transform-origin: 50% 50% 45vw; transform: rotateY(90deg) translateZ(0) translateX(-50%); }
    50% { transform-origin: 50% 50% 45vw; transform: rotateY(45deg) translateZ(-45vw) translateX(0); }
    100% { transform-origin: 50% 50% 0; transform: rotateY(0) translateZ(0) translateX(0); }
}
[data-switch=track].prev_out{opacity: 1; animation: track_prev_out 1.5s linear;}
@keyframes track_prev_out {
    0% { transform-origin: 50% 50% 0; transform: rotateY(0) translateZ(0) translateX(0); }
    50% { transform-origin: 50% 50% 45vw; transform: rotateY(45deg) translateZ(-45vw) translateX(0); }
    100% { transform-origin: 50% 50% 45vw; transform: rotateY(90deg) translateZ(0) translateX(-50%); }
}
[data-switch=track].next_in{opacity: 1; animation: track_next_in 1.5s linear;}
@keyframes track_next_in {
    0% { transform-origin: 50% 50% 45vw; transform: rotateY(-90deg) translateZ(0) translateX(50%); }
    50% { transform-origin: 50% 50% 45vw; transform: rotateY(-45deg) translateZ(-45vw) translateX(0); }
    100% { transform-origin: 50% 50% 0; transform: rotateY(0) translateZ(0) translateX(0); }
}
[data-switch=track].next_out{opacity: 1; animation: track_next_out 1.5s linear;}
@keyframes track_next_out {
    0% { transform-origin: 50% 50% 0; transform: rotateY(0) translateZ(0) translateX(0); }
    50% { transform-origin: 50% 50% 45vw; transform: rotateY(-45deg) translateZ(-45vw) translateX(0); }
    100% { transform-origin: 50% 50% 45vw; transform: rotateY(-90deg) translateZ(0) translateX(50%); }
}

/* 元素动画  切换效果对应的默认动画 */
/* 淡入淡出 */
.animation-fade{opacity: 0; animation-fill-mode: both; animation-timing-function: linear;}
@keyframes fade {
    from {opacity: 0;}
    to {opacity: 1;}
}
/* 左飞入 */
.animation-leftFly{transform: translateX(-100vmax); transform-style: preserve-3d; animation-fill-mode: both; animation-timing-function: linear;}
@keyframes leftFly {
    from {transform: translateX(-100vmax);}
    to {transform: translateX(0);}
}
/* 右飞入 */
.animation-rightFly{transform: translateX(100vmax); transform-style: preserve-3d; animation-fill-mode: both; animation-timing-function: linear;}
@keyframes rightFly {
    from {transform: translateX(100vmax);}
    to {transform: translateX(0);}
}
/* 上飞入 */
.animation-topFly{transform: translateY(-100vmax); transform-style: preserve-3d; animation-fill-mode: both; animation-timing-function: linear;}
@keyframes topFly {
    from {transform: translateY(-100vmax);}
    to {transform: translateY(0);}
}
/* 底飞入 */
.animation-bottomFly{transform: translateY(100vmax); transform-style: preserve-3d; animation-fill-mode: both; animation-timing-function: linear;}
@keyframes bottomFly {
    from {transform: translateY(100vmax);}
    to {transform: translateY(0);}
}
/* 放大*/
.animation-enlarge{transform: scale(1); transform-style: preserve-3d; transform-origin: center center; animation-fill-mode: both; animation-timing-function: linear;}
@keyframes enlarge {
    from {transform: scale(1);}
    to {transform: scale(1.5);}
}
/* 缩小 */
.animation-narrow{transform: scale(1); transform-style: preserve-3d; transform-origin: center center; animation-fill-mode: both; animation-timing-function: linear;}
@keyframes narrow {
    from {transform: scale(1);}
    to {transform: scale(0.5);}
}
/* 旋转 */
.animation-rotate{opacity: 0; transform: rotateY(0); transform-style: preserve-3d; transform-origin: center center; animation-fill-mode: both; animation-timing-function: linear;}
@keyframes rotate {
    from {transform: rotateY(0); opacity: 0;}
    to {transform: rotateY(360deg); opacity: 1;}
}
/* 出现 */
.animation-appear{visibility: hidden; animation-fill-mode: both; animation-timing-function: linear;}
@keyframes appear{
    0% {visibility: hidden;}
    99% {visibility: hidden;}
    100% {visibility: visible;}
}
</style>