<template>
  <transition name="tooltip-fade">
    <div v-show="visible" class="tooltip-container"
        :style="boxStyle"
        :class="boxClass"
        @mouseenter="showTip"
        @mouseleave="hiddenTip(true)"
    >
        <div v-show="placement"
            class="tooltip-arrows"
            :class="placement"
            :style="arrowBox"
        >
        </div>
        <p v-if="content"
            class="tooltip-content"
            :style="contentHeight"
            v-html="content"
        ></p>
    </div>
  </transition>
</template>


<script>
    /**
     * 通用tooltip提示组件
     * 通过自定义指令注册来使用，指令名称为 v-tooltip
     * 指令修饰符：v-tooltip.click.light.top.transtion="'内容'"
     * @modifiers click                   点击触发，默认由 hover 触发
     * @modifiers light                   使用亮色主题，默认为 dark
     * @modifiers top right bottom left   可用于设置 tip 优先显示方向，默认top
     * @modifiers transition              是否为 tip 设置 tranfrom 过渡效果，默认false不适用
     * @modifiers self                    父级容器是否为绑定元素本身
     * 
     * 更多自定义配置，直接绑定配置对象
     * <button v-tooltip="options"></button>
     * @params content[String]                  显示的内容，默认为''
     * @params theme[String]                    主题色调 light || dark，默认'dark'
     * @params placements[Array]                用于设置 tip 显示的优先级	 ['top', 'right', 'bottom', 'left']
     * @params duration[Number]                 tip 窗口多久后自动消失	默认30ms
     * @params arrowsSize[Number]               提示用的小箭头大小，默认5
     * @params width[String, Number]            组件的宽度，默认auto
     * @params height[String, Number]           内容的高度，默认auto
     * @params customClass[String]              组件自定义 class 的类名，默认''
     * @params transition[Boolean]              是否为组件添加 transfrom 过渡，默认false
     * @params target[Element Objcet]           tip 绑定的目标元素，默认null
     * @params container[Element Objcet]        tip 父级容器，未设置容器是 tip 会自动从 target 元素的父级容器中挑选出一个合适的节点作为 tip 的容器， 推荐为 tip 手动指定一个显示容器
     * 
     * 注意：若不提示内容为空，即v-tooltip='' || options.content = '，tooltip不会展示（也可用作条件判断）
     * 
     */

    let supportsPassive = false
    const OVERFLOW_PROPERTYS = ['overflow', 'overflow-x', 'overflow-y'];
    const SCROLL_TYPES = ['scroll', 'auto'];
    // 根元素
    const ROOT = document.body;
    // 竖直方向
    const VERTICAL = ['top', 'bottom'];
    // 水平方向
    const HORIZONTAL = ['left', 'right'];
    // 默认限制显示方向如下，显示优先级按顺序以此递减
    const DEFAULT_PLACEMENT_QUEUE = ['top', 'right', 'bottom', 'left'];
    // 最大值
    const MAX = 4;
    
    export default {
        name: 'tooltp',
        props: {
            // 标题
            title: {
                type: String,
                default: ''
            },
            // 显示的内容
            content: {
                type: String,
                default: ''
            },
            // tip 绑定的目标元素
            target: null,
            // tip 的容器，默认插入 body 中
            container: document.body,
            // 用于限制 tip 展示的方向，优先级按顺序
            placements: {
                type: Array,
                default () {
                    return ['top', 'right', 'bottom', 'left']
                }
            },
            // tip 窗口多久后自动消失，为 <=0 不消失
            duration: {
                type: Number,
                default: 30
            },
            // 是否为 tip 添加 transfrom 过渡
            transition: Boolean,
            // 提示用的小箭头大小
            arrowsSize: {
                type: Number,
                default: 5
            },
            // 组件的宽度
            width: {
                type: [String, Number],
                default: 'auto'
            },
            // 内容的高度
            height: {
                type: [String, Number],
                default: 'auto'
            },
            // tip 的 z-index
            zIndex: {
                type: Number,
                default: 999
            },
            // 主题 light dark 默认为 light
            theme: {
                type: String,
                default: 'dark'
            },
            // 自定义 class 的类名
            customClass: {
                type: String,
                default: ''
            }
        },
        data () {
            this.containerNode = null
            this.targetParentNode = null
            this.visibleTimer = null
            return {
                // tip 的展示方向（小箭头的方向）
                placement: '',
                visible: false,
                arrowsPos: {}
            }
        },
        computed: {
            arrowBox () {
                return Object.assign({
                    borderWidth: `${this.arrowsSize}px`
                }, this.arrowsPos)
            },
            boxStyle () {
                const width = this.width
                return {
                    width: typeof width === 'string' ? width : `${width}px`,
                    zIndex: this.zIndex
                }
            },
            boxClass () {
                const { customClass, theme, transition } = this;
                const tsClass = transition ? 'transition-transfrom' : '';
                return [customClass, theme, tsClass];
            },
            contentHeight () {
                const height = this.height
                return {
                    height: typeof height === 'string' ? height : `${height}px`
                }
            }
        },
        mounted () {
            // passive support check
            document.addEventListener('passive-check', () => {}, {
                get passive () { supportsPassive = { passive: true } }
            });
        },
        methods: {
            showTip () {
                clearTimeout(this.visibleTimer)
                this.visible = true;
            },
            // 隐藏 tip
            hiddenTip (immedia) {
                if (immedia) {
                    this.visible = false
                } else {
                    this.setVisible(false)
                }
            },
            // 更新 tip 位置
            updateTip () {
                this.setContainerNode()
                this.showTip()
                this.asynSetCoordinate()
            },
            // 设置 tip 的容器
            setContainerNode () {
                const {
                    $el,
                    target,
                    container,
                    targetParentNode,
                    containerNode: oldNode
                } = this;
                // 目标元素的父级节点相同则不需要重新计算容器
                if (!target || target.parentNode === targetParentNode) return
                this.targetParentNode = target.parentNode
                const newNode = container || document.body || this.getScrollContainer(target)
                if (newNode === oldNode) return
                if ($el.parentNode !== newNode) {
                    newNode.appendChild($el)
                }
                const position = window.getComputedStyle(newNode, null).position
                if (newNode.tagName !== 'BODY' && (!position || position === 'static')) {
                    newNode.style.position = 'relative'
                }
                if (oldNode) {
                    oldNode.removeEventListener('scroll', this.scrollHandler, supportsPassive)
                }
                if (this.checkScrollable(newNode)) {
                    newNode.addEventListener('scroll', this.scrollHandler, supportsPassive)
                }
                this.containerNode = newNode
            },
            // 获取参考元素第一个可滚动的元素
            getScrollContainer (el) {
                if (!el) return ROOT
                let parent = el.parentNode
                while (parent && parent !== ROOT) {
                    if (this.checkScrollable(parent)) {
                    return parent
                    }
                    parent = parent.parentNode
                }
                return ROOT
            },

            setCoordinate () {
                const { $el, target, containerNode, placements, arrowsSize } = this
                if (!$el || !target || !containerNode) return
                const placementInfo = this.computePlacementInfo(target, containerNode, $el, placements, arrowsSize)
                const coordinate = placementInfo.mod === 'mid'
                    ? this.computeCoordinateBaseMid(placementInfo, arrowsSize)
                    : this.computeCoordinateBaseEdge(placementInfo, arrowsSize)
                this.setArrowsPos(coordinate)
                this.placement = coordinate.placement
                const x = coordinate.x + containerNode.scrollLeft
                const y = coordinate.y + containerNode.scrollTop;
                this.$el.style.transform = `translate3d(${x}px, ${y}px, 0)`
            },

            asynSetCoordinate () {
                this.$nextTick(this.setCoordinate)
            },

            // 设置小三角形的位置
            setArrowsPos ({ placement, arrowsOffset }) {
                this.arrowsPos = this.computeArrowPos(placement, arrowsOffset, this.arrowsSize)
            },
            // 用于计算小三角形在 tip 窗口中的位置
            computeArrowPos(placement, offset, size) {
                const start = offset + 'px'
                const end = offset - size * 2 + 'px'
                const posMap = {
                    'top-start': { top: '100%', left: start },
                    'top-mid': { top: '100%', left: '50%' },
                    'top-end': { top: '100%', right: end },

                    'bottom-start': { top: '0', left: start },
                    'bottom-mid': { top: '0', left: '50%' },
                    'bottom-end': { top: '0', right: end },

                    'left-start': { top: start, left: '100%' },
                    'left-mid': { top: '50%', left: '100%' },
                    'left-end': { bottom: end, left: '100%' },

                    'right-start': { top: start, left: '0' },
                    'right-mid': { top: '50%', left: '0' },
                    'right-end': { bottom: end, left: '0' }
                }
                return posMap[placement]
            },

            // 设置 tip 经过 duration ms 后的状态
            setVisible (v) {
                clearTimeout(this.visibleTimer)
                this.visibleTimer = setTimeout(() => {
                    this.visible = v
                    this.visibleTimer = null
                }, this.duration)
            },

            // 参考元素父级容器发生滚动时的处理
            // scrollHandler: this.debounce(function () {
            //     this.setCoordinate()
            // }, 200),

            // 是否是个可滚动的元素
            checkScrollable (element) {
                const css = window.getComputedStyle(element, null)
                return OVERFLOW_PROPERTYS.some(property => {
                    return ~SCROLL_TYPES.indexOf(css[property])
                })
            },

            // 基于参考元素的某一侧的中点来计算目标元素的坐标
            computeCoordinateBaseMid (placementInfo, offset) {
                const { placement, mid, tw, th } = placementInfo
                switch (placement) {
                    case 'top': return {
                    placement: 'top-mid',
                    x: mid.x - tw / 2,
                    y: mid.y - th - offset
                    }
                    case 'bottom': return {
                    placement: 'bottom-mid',
                    x: mid.x - tw / 2,
                    y: mid.y + offset
                    }
                    case 'left': return {
                    placement: 'left-mid',
                    x: mid.x - tw - offset,
                    y: mid.y - th / 2
                    }
                    case 'right': return {
                    placement: 'right-mid',
                    x: mid.x + offset,
                    y: mid.y - th / 2
                    }
                }
            },

            // 基于参考元素某一侧的边界来计算目标元素位置
            computeCoordinateBaseEdge (placementInfo, offset) {
                const { placement, start, end, dHor, dVer, tw, th, ew, eh } = placementInfo
                const nearRight = dHor > 0
                const nearBottom = dVer > 0
                switch (placement) {
                    case 'top': return {
                        placement: nearRight ? 'top-end' : 'top-start',
                        x: nearRight ? end.x - tw : start.x,
                        y: start.y - th - offset,
                        arrowsOffset: ew / 2
                    }
                    case 'bottom': return {
                        placement: nearRight ? 'bottom-end' : 'bottom-start',
                        x: nearRight ? end.x - tw : start.x,
                        y: end.y + offset,
                        arrowsOffset: ew / 2
                    }
                    case 'left': return {
                        placement: nearBottom ? 'left-end' : 'left-start',
                        x: start.x - tw - offset,
                        y: nearBottom ? end.y - th : start.y,
                        arrowsOffset: eh / 2
                    }
                    case 'right': return {
                        placement: nearBottom ? 'right-end' : 'right-start',
                        x: end.x + offset,
                        y: nearBottom ? end.y - th : start.y,
                        arrowsOffset: eh / 2
                    }
                }
            },
            // 获取目标元素相对于参考容器的位置信息
            getBoxMargin (el, parent) {
                if (!el) return
                const eBox = el.getBoundingClientRect()
                const pBox = parent.getBoundingClientRect()

                const { width: vw, height: vh } = pBox
                const { width, height } = eBox

                const top = eBox.top - pBox.top
                const left = eBox.left - pBox.left
                const right = eBox.right - pBox.left
                const bottom = eBox.bottom - pBox.top
                const midX = left + width / 2
                const midY = top + height / 2

                // 目标的顶点坐标 [top-left, top-right, bottom-right, botton-left]
                const vertex = {
                    tl: { x: left, y: top },
                    tr: { x: right, y: top },
                    br: { x: right, y: bottom },
                    bl: { x: left, y: bottom }
                }

                return {
                    width,
                    height,
                    margin: {
                    top: {
                        placement: 'top',
                        size: top,
                        start: vertex.tl,
                        mid: { x: midX, y: top },
                        end: vertex.tr
                    },
                    bottom: {
                        placement: 'bottom',
                        size: vh - bottom,
                        start: vertex.bl,
                        mid: { x: midX, y: bottom },
                        end: vertex.br
                    },
                    left: {
                        placement: 'left',
                        size: left,
                        start: vertex.tl,
                        mid: { x: left, y: midY },
                        end: vertex.bl
                    },
                    right: {
                        placement: 'right',
                        size: vw - right,
                        start: vertex.tr,
                        mid: { x: right, y: midY },
                        end: vertex.br
                    }
                    }
                }
            },
            // ref 参考元素，container 容器， target 需要动态计算坐标的元素，limitQueue 限制展示方向
            computePlacementInfo (ref, container, target, limitQueue, offset) {
                if (!ref || !target) return
                const placementQueue = limitQueue && limitQueue.length
                    ? limitQueue : DEFAULT_PLACEMENT_QUEUE
                const { width: ew, height: eh, margin } = this.getBoxMargin(ref, container)
                const { width: tw, height: th } = target.getBoundingClientRect()

                const dw = (tw - ew) / 2
                const dh = (th - eh) / 2

                const queueLen = placementQueue.length
                const processedQueue = Object.keys(margin)
                .map(key => {
                    const placementItem = margin[key]
                    // 这里 index 可以用来标记显示方向的优先级 index 越大，优先级越高
                    const index = placementQueue.indexOf(placementItem.placement)
                    placementItem.weight = index > -1 ? MAX - index : MAX - queueLen

                    // 上下方向上可容纳目标元素
                    const verSingleBiasCheck = (
                        ~VERTICAL.indexOf(placementItem.placement) &&
                        placementItem.size > th + offset
                    )
                    // 上下方向上可容纳目标元素 && 目标元素上下显示时左右也可完整显示目标元素
                    const verFullBiasCheck = (
                        verSingleBiasCheck &&
                        margin.left.size > dw &&
                        margin.right.size > dw
                    )
                    // 左右方向上可容纳目标元素
                    const horSingleBiasCheck = (
                        HORIZONTAL.indexOf(placementItem.placement) > -1 &&
                        placementItem.size > tw + offset
                    )
                    // 左右方向上可容纳目标元素 && 显示时上下也可完整显示目标元素
                    const horFullBiasCheck = (
                        horSingleBiasCheck &&
                        margin.top.size > dh &&
                        margin.bottom.size > dh
                    )
                    // 竖直方向上的 top 与 bottom 的间距差值
                    placementItem.dVer = margin.top.size - margin.bottom.size
                    // 水平方向上的 left 与 right 的间距差值
                    placementItem.dHor = margin.left.size - margin.right.size
                    placementItem.mod = 'edge'

                    if (verFullBiasCheck || horFullBiasCheck) {
                        placementItem.mod = 'mid'
                        placementItem.weight += 3 + placementItem.weight / MAX
                        return placementItem
                    }
                    if (verSingleBiasCheck || horSingleBiasCheck) {
                        placementItem.weight += 2 + placementItem.weight / MAX
                    }
                    return placementItem
                })
                return Object.assign({ ew, eh, tw, th, dw, dh }, processedQueue.sort((a, b) => b.weight - a.weight)[0])
            },
            debounce (fn, delay) {
               
            },

            clearScrollEvent () {
                if (this.containerNode) {
                    this.containerNode.removeEventListener('scroll', this.scrollHandler, supportsPassive)
                }
            },

            removeParentNode () {
                if (this.$el.parentNode) {
                    this.$el.parentNode.removeChild(this.$el)
                }
            },

            destroy () {
                this.clearScrollEvent()
                this.removeParentNode()
                this.$destroy()
            }
        }
    }
</script>

<style lang="less" scoped>
    @light-bdc: #d9d9d9;
    @light-bgc: #e9edf0;
    @light-ftc: #666666;
    @dark-bdc: #474d52;
    @dark-bgc: #474d52;
    @dark-ftc: #fff;

    .tooltip-container {
        position: absolute;
        top: 0;
        left: 0;
        z-index: 9999;
        box-sizing: border-box;
        width: 200px;
        min-width: 50px;
        padding: 6px 10px;
        margin: 0;
        font-size: 12px;
        box-shadow: 0 1px 6px rgba(0, 0, 0, .1);
        border-radius: 5px;
        transform: translate3d(0, 0, 0);
        transition: opacity .3s;
        will-change: opacity, transform;
        user-select: none;
        pointer-events: none;
        .tooltip-content {
            padding: 0;
            margin: 0;
        }
        .tooltip-content {
            overflow-y: auto;
            line-height: 1.4;
            text-align: center;
            word-wrap: break-word;
            background-color: inherit;
        }
        .tooltip-arrows {
            position: absolute;
            z-index: -1;
            width: 0;
            height: 0;
            padding: 0;
            margin: 0;
            border-color: transparent;
            border-style: inherit;
            border-width: 6px;
            &::after {
                content: '';
                position: absolute;
                width: 0;
                height: 0;
                border-color: transparent;
                border-style: inherit;
                border-width: inherit;
                transform: translate(-50%, -50%);
            }
            &[class^='top-'],
            &[class*=' top-'] {
                border-top-color: inherit;
                transform: translate(-50%, 0);
                &::after {
                    top: -2px;
                }
            }
            &[class^='bottom-'],
            &[class*=' bottom-'] {
                border-bottom-color: inherit;
                transform: translate(-50%, -100%);
                &::after {
                    top: 2px;
                }
            }
            &[class^='left-'],
            &[class*=' left-'] {
                border-left-color: inherit;
                transform: translate(0, -50%);
                &::after {
                    left: -2px;
                }
            }
            &[class^='right-'],
            &[class*=' right-'] {
                border-right-color: inherit;
                transform: translate(-100%, -50%);
                &::after {
                    left: 2px;
                }
            }
        }
        &.transition-transfrom {
            transition: opacity .3s, transform .5s cubic-bezier(.4, 0, .2, 1);
        }
        &.tooltip-fade-enter,
        &.tooltip-fade-leave-active {
            opacity: 0;
        }
    }
    &.light {
        color: @light-ftc;
        background: @light-bgc;
        border: 1px solid @light-bdc;
        [class^='top-'],
        [class*=' top-'] {
            &::after {
                border-top-color: @light-bgc;
            }
        }
        [class^='bottom-'],
        [class*=' bottom-'] {
            &::after {
                border-bottom-color: @light-bgc;
            }
        }
        [class^='left-'],
        [class*=' left-'] {
            &::after {
                border-left-color: @light-bgc;
            }
        }
        [class^='right-'],
        [class*=' right-'] {
            &::after {
                border-right-color: @light-bgc;
            }
        }
    }
    &.dark {
        color: @dark-ftc;
        background: @dark-bgc;
        border: 1px solid @dark-bdc;
        [class^='top-'],
        [class*=' top-'] {
            &::after {
                border-top-color: @dark-bdc;
            }
        }
        [class^='bottom-'],
        [class*=' bottom-'] {
            &::after {
                border-bottom-color: @dark-bdc;
            }
        }
        [class^='left-'],
        [class*=' left-'] {
            &::after {
                border-left-color: @dark-bdc;
            }
        }
        [class^='right-'],
        [class*=' right-'] {
            &::after {
                border-right-color: @dark-bdc;
            }
        }
    }
    &.white{
        color: #666666;
        background: #ffffff;
        border: 1px solid #eeeeee;
        border-radius: 2px 2px 2px 2px 0px 0px 0px;
        box-shadow: 0px 2px 20px 0px rgba(180,187,199,0.20); 
    }
</style>