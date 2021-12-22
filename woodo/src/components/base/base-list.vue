<template>
    <div class="base-list-main" ref="baseScroll" :class="[{'scroll': !scroll}, customClass]">
        <div class="base-list-wrap" ref="listWrap">
            <template v-if="type === 'common'">
                <div class="list-item common" v-for="(item, index) in handledList" :key="`${item.id || item.key || item.code}_${index}`">
                    <slot :item="item"></slot>
                </div>
            </template>
            <template v-else>
                <div class="list-item gallery"
                    v-for="(item, index) in handledList"
                    :key="`${item.id || item.key || item.code}_${index}`"
                    v-show="!visibleArea || (item._top <= visibleArea.max && (item._top + item._height) >= visibleArea.min)"
                    :style="{
                        'top': `${item._top}px`,
                        'left': `${item._left}px`,
                        'width': `${item._width}px`,
                        'height': `${item._height}px`
                    }"
                >
                    <slot :item="item" :index="index"></slot>
                </div>
            </template>
        </div>
        <!-- 加载loading -->
        <img class="scroll-loading" v-if="showScrollLoading" src="@/assets/images/loading/loading-4.gif" />
        <!-- 没有更多提示 -->
        <p class="nomore-tip" v-if="showBottom">这是我的底线</p>
        <!-- 回到顶部 -->
        <!-- <back-to-top v-if="showBackTop" :element="scrollElement"></back-to-top> -->
    </div>
</template>

<script>
/**
 * 通用列表框架组件
 * 该组件会统一处理：gallery view样式展示，瀑布流，自适应，可视区域滚动加载优化，滚动触底
 * 普通列表（type为common）暂不支持自适应，可视区域优化
 * @props list[array]                     数据列表
 * @props type[string]                    列表展示类型，默认fixed：common普通列表(非gallery) || fixed固定结构 || waterfall瀑布流
 * @props scroll[Element Objcet]          滚动节点，没有默认base-list-main
 * @props loadType[string,Boolean]        加载类型，默认scroll，目前只有滚动加载，若无需加载，传false即可
 * @props visibleLoad[Boolean]            是否添加可视区域加载优化，默认true
 * @props hideScrollbar[Boolean]          是否隐藏滚动条，滚动时再出现，默认true
 * @props heightFix[Boolean]              是否固定高度，不会随屏幕而变化，默认false
 * @props cardWidth[Number, String]       卡片宽度
 * @props cardHeight[Number, String]      卡片高度
 * @props cardOffsetX[Number, String]     卡片横向间隙，默认20
 * @props cardOffsetY[Number, String]     卡片纵向间隙，默认20    *注意:还有其它节点的卡片,可用间隙实现
 * @props rowNumber[Number, String]       一行固定个数，默认不固定，自动适配
 * @props customClass[String]             自定义class
 *
 * @event scrollLoad                      滚动触底加载事件
 *
 * 注意点:
 * 1、存在其它节点的卡片,可用间隙实现
 * 2、要确保滚动元素是scroll 或者 base-list-main
 *
 */
// import backToTop from '@/components/BackToTop.vue';
export default {
    name: "base-list",
    // components: { backToTop },
    props: {
        list: {
            type: Array,
            default: [],
        },
        type: {
            type: String,
            default: 'fixed',
        },
        scroll: null,
        loadType: {
            type: [String, Boolean],
            default: 'scroll',
        },
        visibleLoad: {
            type: Boolean,
            default: false
        },
        hideScrollbar: {
            type: Boolean,
            default: false
        },
        heightFix: {
            type: Boolean,
            default: false
        },
        cardWidth: {
            type: [Number, String],
            default: 400,
        },
        cardHeight: {
            type: [Number, String],
            default: 400,
        },
        cardAddHeight: {
            type: [Number, String],
            default: 0,
        },
        cardOffsetX: {
            type: [Number, String],
            default: 20
        },
        cardOffsetY: {
            type: [Number, String],
            default: 20
        },
        minRow: {
            type: [Number, String],
            default: 1
        },
        maxRow: {
            type: [Number, String],
            default: 6
        },
        maxLine: {
            type: [Number, String],
            default: ''
        },
        rowNumber: {
            type: [Number, String],
            default: null
        },
        customClass: {
            type: String,
            default: '',
        },
    },
    data() {
        return {
            // 处理后的列表
            handledList: [],
            scrollElement: null,
            // 可视区域数据
            visibleArea: {
                min: 0,
                max: 0
            },
            listTop: 0,
            showBackTop: false,
            showScrollLoading: false,
            showBottom: false,
        };
    },
    watch: {
        list(value) {
            // 列表初始化配置
            this.configureList(value);
            this.showBottom = false;
            this.showScrollLoading = false;
        },
        cardWidth() {
            this.configureList(this.list);
        }
    },
    computed: {
        isWindow() {
            return this.scrollElement === window || this.scrollElement === document.body;
        }
    },
    mounted () {
        if (!this.list.length) {
            return;
        }
        // 列表初始化配置
        this.configureList(this.list);
    },
    methods: {
        // 配置列表
        configureList(list) {
            let that = this;
            if (!list.length) {
                return;
            }
            let options = {};
            // 当存在多个 that.scroll 时，就获取可见的那个
            that.scrollElement = $(`${that.scroll}:visible`)[0] || document.querySelector('.base-list-main');
            options['el'] = that.scrollElement;
            options['type'] = that.type;
            options['width'] = +that.cardWidth;
            options['height'] = +that.cardHeight;
            options['addHeight'] = +that.cardAddHeight;
            options['offsetX'] = +that.cardOffsetX;
            options['offsetY'] = +that.cardOffsetY;
            options['row_number'] = +that.rowNumber;
            that.listTop = $(this.$refs.listWrap).offset().top - $(that.scrollElement).offset().top;
            let width = 0;
            // 监听滚动节点宽度变化  当列表可见时进行操作，反之会获取不到容器的宽高
            const resizeObserver = new ResizeObserver(utils.debounce(entries => {
                let entry = entries[0];
                let cr = entry.contentRect;
                let newWidth = cr.width;
                if (Math.abs(width - newWidth) < 10) return;
                width = newWidth;
                if ($(this.$refs.listWrap).is(':visible')) {
                    that.handledList = that.listAdapt(options, list);
                }
            }, 0));
            resizeObserver.observe(this.scrollElement);
            this.$once("hook:beforeDestroy", () => {
                resizeObserver.disconnect();
            });
            // 隐藏滚动条
            if (that.hideScrollbar) {
                $(that.scrollElement).addClass('hide-scroll');
            }
            // 绑定滚动加载事件
            if (this.loadType) {
                that.listScrollLoad();
            }
            this.$nextTick(() => {
                this.showBackTop = true;
            })
        },
        // 获列表内容尺寸
        getListContentSize(el) {
            let w = 0, h = 0;
            if (el && el.nodeType === 1) {
                // 获取容器内容width height
                let padding_top = +getComputedStyle(el)['paddingTop'].slice(0, -2),
                    padding_right = +getComputedStyle(el)['paddingRight'].slice(0, -2),
                    padding_bottom = +getComputedStyle(el)['paddingBottom'].slice(0, -2),
                    padding_left = +getComputedStyle(el)['paddingLeft'].slice(0, -2),
                    border_top = +getComputedStyle(el)['borderTopWidth'].slice(0, -2),
                    border_right = +getComputedStyle(el)['borderRightWidth'].slice(0, -2),
                    border_bottom = +getComputedStyle(el)['borderBottomWidth'].slice(0, -2),
                    border_left = +getComputedStyle(el)['borderLeftWidth'].slice(0, -2);
                w = el.offsetWidth - (padding_left + padding_right + border_left + border_right);
                h = el.offsetHeight - (padding_top + padding_bottom + border_top + border_bottom);
            }
            return {
                width: w,
                height: h,
            }
        },
        // 更新滚动可视区域数值
        updateVsibleArea() {
            if (!this.visibleLoad) {
                return false;
            }
            let result = {};
            let $el = this.scrollElement;
            if ($el) {
                let scrollTop = this.isWindow ? window.scrollY : $el.scrollTop;
                let clientHeight = this.isWindow ? document.body.clientHeight : $el.clientHeight;
                result.min = scrollTop - this.listTop;
                result.max = scrollTop + clientHeight - this.listTop;
                return result;
            }
        },

        /**
         * 列表自适应计算方法
         * @params obj 配置参数
         * @params list 数据列表
         */
        listAdapt(obj, list){
            let array = [];
            if (this.type === 'common') return list;
            if (!obj.el) return array;
            if (!Array.isArray(list)) return array;
            switch(obj.type){
                case 'waterfall':
                    array = this.waterfallList(obj, list);
                    break;
                case 'fixed':
                    array = this.fixedList(obj, list);
                    break;
                case 'contourWaterfall':
                    array = this.contourWaterfallList(obj, list);
                    break;
            }
            return array;
        },
        // 滚动加载事件
        listScrollLoad() {
            let that = this;
            let m1 = 0;     // 滚动的值
            let m2 = 0;     // 对比时间的值
            let timer = null;
            let scroll = that.scrollElement;
            that.visibleArea = that.updateVsibleArea();
            utils.onReachBottom({
                $scroll: scroll,
                onScroll: scrolling => {
                    if (that.hideScrollbar) {
                        $(scroll).removeClass('hide-scroll');
                        clearTimeout(timer);
                        timer = setTimeout(() => {
                            m2 = that.isWindow ? window.scrollY : scroll.scrollTop;
                            if (m2 === m1) {
                                $(scroll).addClass('hide-scroll');
                            }
                        }, 400);
                        m1 = that.isWindow ? window.scrollY : scroll.scrollTop;
                    }
                    that.visibleArea = that.updateVsibleArea();
                },
                onReach: () => {
                    console.log("触底了")
                    this.showScrollLoading = true;
                    that.$emit('scrollLoad', () => {
                        if (!(this.list[0] instanceof Object)) return;
                        this.showScrollLoading = false;
                        if (this.list.length > 20) {
                            this.showBottom = true;
                        }
                    });
                    // that.visibleArea = that.updateVsibleArea();
                },
            })
        },
        // 瀑布流列表
        waterfallList(obj, list){
            let array = [];
            let $scroll_contain = this.$refs.listWrap;
            let contain_width = this.getListContentSize($scroll_contain).width;
            // 计算一行可放的个数，多出的空间再平分加上， ~~向下取整
            let row_number = ~~(contain_width / (obj.width + obj.offsetX));
            if (row_number < this.minRow) row_number = this.minRow;
            if (row_number > this.maxRow) row_number = this.maxRow;
            if (obj.row_number) row_number = obj.row_number;
            if (row_number === 0) return array;
            // 更新 width height
            let item_width = ~~((contain_width - row_number * (obj.width + obj.offsetX)) / row_number + obj.width +  obj.offsetX / row_number);
            let item_height = ~~(obj.height / obj.width * item_width);
            let max_value = [];
            if (this.heightFix) item_height = obj.height;
            // 瀑布流显示
            list = list.filter(item => {
                let image_width = item.imageWidth || item.width || this.cardWidth;
                let image_height = item.imageHeight || item.height || this.cardHeight;
                return image_width && image_height;
            });
            array = list.map((item, index, self) => {
                if (!utils.isObject(item)) item = {};
                let image_width = item.imageWidth || item.width;
                let image_height = item.imageHeight || item.height;
                let ratio = image_width / image_height;
                item['_width'] = item_width;
                item_height = item_width / ratio + obj.addHeight;
                item['_height'] = item_height;
                /**
                 * 瀑布流实现
                 */
                // 当前所在列
                let current_col = index % row_number;
                // 获取当前元素之前的5行
                let before_item = [];
                for (let i = row_number * 5; i > 0; i--) {
                    let before_i = self[index - i];
                    if (before_i) {
                        before_item.push(before_i);
                    }
                }
                before_item = utils.deepClone(before_item);
                // 第一行元素正常排序
                if (before_item.length < row_number) {
                    item['_top'] = 0;
                    item['_left'] = (item_width + obj.offsetX) * current_col;
                } else {
                    /**
                     * 从第二行起，获取到之前的10个元素数组（js对10以内的数组使用插入排序）；
                     * 根据 top + height 从小到大排序，然后截取最后一行的个数，拿到第一个；
                     * 获取到的第一个为前面5行元素的最短列，根据这个元素的 top & left 计算当前元素的 top & left
                     */
                    // 预留10px的差值
                    utils.insertSort(before_item, (a, b) => {
                        if ((a['_top'] + a['_height']) - (b['_top'] + b['_height']) > 10) {
                            return 1;
                        } else {
                            return 0;
                        }
                    });
                    before_item = before_item.slice(-row_number);
                    item['_top'] = before_item[0]['_top'] + before_item[0]['_height'] + obj.offsetY;
                    item['_left'] = before_item[0]['_left'];
                }
                /**
                 * 瀑布流实现 end
                 */
                item['_place_type'] = obj.type;
                // 计算最高数值
                max_value.push(item['_top'] + item['_height']);
                return item;
            });
            // 容器高度设置
            if ($scroll_contain) {
                $scroll_contain.style.height = `${Math.max.apply(null, max_value) + obj.offsetY}px`;
            }
            return array;
        },
        // 网格式列表
        fixedList(obj, list){
            let array = [];
            let $scroll_contain = this.$refs.listWrap;
            let contain_width = this.getListContentSize($scroll_contain).width;
            // 计算一行可放的个数，多出的空间再平分加上， ~~向下取整
            let row_number = ~~(contain_width / (obj.width + obj.offsetX));
            if (row_number < this.minRow) row_number = this.minRow;
            if (obj.row_number) row_number = obj.row_number;
            if (row_number === 0) return array;
            // 更新 width height
            let item_width = ~~((contain_width - row_number * (obj.width + obj.offsetX)) / row_number + obj.width +  obj.offsetX / row_number);
            let item_height = ~~(obj.height / obj.width * item_width);
            let max_value = [];
            if (this.heightFix) item_height = obj.height;
            if (this.maxLine) list = list.slice(0, row_number * this.maxLine);
            array = list.map((item, index) => {
                if (!utils.isObject(item)) item = {};
                item['_width'] = item_width;
                item['_height'] = item_height;
                // 计算当前行的top偏移量
                let current_row = Math.ceil((index + 1) / row_number) - 1;
                let item_top = (item_height + obj.offsetY) * current_row;
                item['_top'] = item_top;
                // 计算当前列的left偏移量
                let current_col = index % row_number;
                let item_left = (item_width + obj.offsetX) * current_col;
                item['_left'] = item_left;
                // 排列类型
                item['_place_type'] = obj.type;
                // 计算最高数值
                max_value.push(item['_top'] + item['_height']);
                return item;
            });
            // 容器高度设置
            if ($scroll_contain) {
                $scroll_contain.style.height = `${Math.max.apply(null, max_value) + obj.offsetY}px`;
            }
            return array;
        },
        // 等高瀑布流
        contourWaterfallList(obj, list){
            let array = [];
            let $scroll_contain = this.$refs.listWrap;
            let contain_width = this.getListContentSize($scroll_contain).width;
            // 过滤掉没有宽高的元素
            list = list.filter(item => (item.imageWidth || item.width || this.cardWidth) && (item.imageHeight || item.height || this.cardHeight));
            // 行数
            let line_number = 0;
            // 基准高度
            let base_height = this.cardHeight;
            // 当前行已填充宽度
            let fill_line_width = 0;
            // 行列表
            let line_list = [];
            // 行列表 - 项
            let line_list_item = {
                lineArray: [], // 所在行的元素
                lineheight: base_height, // 所在行的高度
            }
            list.forEach((item, index, self) => {
                if (!utils.isObject(item)) item = {};
                if(!line_list[line_number]){
                    line_list[line_number] = utils.deepClone(line_list_item);
                }
                let image_width = item.imageWidth || item.width || this.cardWidth;
                let image_height = item.imageHeight || item.height || this.cardHeight;
                let ratio = image_width / image_height;
                image_width = base_height * ratio;
                item['_width'] = image_width;
                item['_height'] = line_list[line_number].lineheight;
                let fill_item_width = line_list[line_number].lineArray.length ? image_width + obj.offsetX : image_width;
                fill_line_width += fill_item_width;
                if(fill_line_width <= contain_width) {
                    line_list[line_number].lineArray.push(item);
                }else{
                    if(line_list[line_number].lineArray.length < 4){ // 如果一行的填充没有超过4个,那就整体缩小
                        line_list[line_number].lineArray.push(item);
                        let lineOffsetX = (line_list[line_number].lineArray.length - 1) * obj.offsetX; // 这一行的所有间距总和
                        let line_ratio = (fill_line_width - lineOffsetX) / line_list[line_number].lineheight;
                        line_list[line_number].lineheight = (contain_width - lineOffsetX) / line_ratio;
                        // 进入下一行
                        line_number++;
                        line_list[line_number] = utils.deepClone(line_list_item);
                        fill_line_width = 0;
                    }else{
                        let lineOffsetX = (line_list[line_number].lineArray.length - 1) * obj.offsetX; // 这一行的所有间距总和
                        fill_line_width -= fill_item_width;
                        let line_ratio = (fill_line_width - lineOffsetX) / line_list[line_number].lineheight;
                        line_list[line_number].lineheight = (contain_width - lineOffsetX) / line_ratio;
                        // 进入下一行
                        line_number++;
                        line_list[line_number] = utils.deepClone(line_list_item);
                        line_list[line_number].lineArray.push(item);
                        fill_line_width = image_width;
                    }
                }
            });
            let scroll_contain_height = 0;
            if (this.maxLine) line_list = line_list.slice(0, this.maxLine);
            line_list.forEach((list_item, list_index) => {
                if (list_item.lineArray.length === 0) return;
                list_item.lineArray = list_item.lineArray.map((item, index, lineArray)=>{
                    let ratio = item['_width'] / item['_height'];
                    item['_width'] = list_item.lineheight * ratio;
                    item['_height'] = list_item.lineheight;
                    item['_left'] = index ? lineArray[index - 1]._left + lineArray[index - 1]._width + obj.offsetX : 0;
                    item['_top'] = list_index ? scroll_contain_height : 0;
                    return item;
                });
                scroll_contain_height += list_item.lineheight + obj.offsetY;
                array.push(...list_item.lineArray);
            });
            // 容器高度设置
            if ($scroll_contain) {
                $scroll_contain.style.height = `${scroll_contain_height + obj.offsetY}px`;
            }
            return array;
        }
    },
};
</script>

<style lang="less" scoped>
    .base-list-main{
        width: 100%;
        overflow-x: hidden;
        overflow-y: hidden;
        &.scroll{
            height: 100%;
            overflow-y: auto;
        }
    }
    .base-list-wrap{
        position: relative;
        width: 100%;
        height: 100%;
    }
    .list-item.gallery{
        position: absolute;
    }
    .scroll-loading {
        display: block;
        width: 40px;
        height: 40px;
        margin: 0 auto;
    }
    .nomore-tip {
        margin-top: 10px;
        text-align: center;
        color: var(--dimColor);
    }
</style>
<style>
    .hide-scroll::-webkit-scrollbar{
        display: none;
    }
    .hide-scroll::-webkit-scrollbar:hover{
        display: block;
    }
</style>