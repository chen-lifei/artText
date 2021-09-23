/**
 * 工程生成方法集，通过 Vue.mixin 方法合并到 Vue 实例
 * 模块功能提供：生成播放器、播放器操作、播放器样式设置、渲染元素、播放器缩放等方法，以及工程数据
 * this 指向 EditorView 实例
 * 注意方法命名不要过于常见，以防重复，方法命名以 PMIX（page mix in） 开头
 */
import '@/assets/js/project/filter.js';
import { TransitionDraw } from '@/assets/js/project/transition.js';
import { BorderDraw, BorderLoadSuccess } from '@/assets/js/project/border.js';
import { buildAnimateAttr } from '@/assets/js/project/effect.js';
// 工程html模板
const createPageDOM = `<div class="editor-inner">
							<div class="editor-page">
								<div hidden class="page-data"></div>
								<div class="page-background"></div>
								<div class="page-elements"></div>
								<div class="page-border"></div>
								<div class="page-watermark"></div>
							</div>
						</div>`;
// 工程初始数据
const newProjectData = function () {
    return {
        page: {
            width: 1920,
            height: 1080,
            lengthUnit: "px",
            duration: 0, // 单位 ms
            speed: 1, // 范围 0.1 - 5
            volume: 50, // 范围 0 - 100
            muted: false,
            bg: {
                color: "#222222",
                image: "",
                fill: "cover", // 背景填充方式  [cover铺满][repeat平铺]
            },
            border: {
                style: "", // 边框样式标识
            },
            watermark: {
                text: "",
                textStyle: {
                    fontSize: 48,
                    fontFamily: "",
                    color: "",
                },
                image: "/images/watermark.png",
                opacity: 0.7,
                position: "top-left", // 水印位置  [top-left][top-right][bottom-left][bottom-right]
                width: 0,
                height: 48,
                scale: 1,
            },
        },
        // 轨道数据结构 [ ... { id, type } ]
        tracks: [
            {
                id: util.uuid("track"),
                type: "master",
            }
        ],
        // 元素数据列表
        elements: [],
        // 转场效果数据列表 [ ... { id, name, duration } ]
        transition: [],
    };
}

/**
 * 元素模拟媒体播放的动画对象map
 * { projectUUID:{ elementId: animation } }
 * （因可能同时存在多个播放器对象，所有需要创建一个当前播放器唯一标识的子对象）
 */
let ELEMENT_ANIMATE_MAP = {};

let PMIX = {
    data() {
        return {
            projectUUID: util.uuid(`page`),
            PMIXprojectData: newProjectData(),
            // 播放器缩放值
            PMIXPageScale: {
                current: 1,
                suitable: 1,
            },
        };
    },
    methods: {
        // 生成新工程数据
        PMIXcreateProject() {
            return newProjectData();
        },
        /**
         * 数据同步
         * @param {object} data 工程数据
         */
        PMIXprojectLoader(data) {
            if (!util.isObject(data)) {
                return;
            }
            let project = newProjectData();
            for (let key in project) {
                if (data[key] === undefined) {
                    continue;
                }
                // 对象深合并
                if (key === `page`) {
                    project[key] = util.deepAssign(project[key], data[key]);
                } else {
                    project[key] = data[key];
                }
            }
            this.PMIXprojectData = util.deepClone(project);
        },
        // 播放器画布渲染
        PMIXrendering() {
            const that = this;
            let projectPage = that.PMIXprojectData.page;
            let $inner = $(createPageDOM);
            let $content = $inner.find(`.editor-page`);
            $content.css({
                'width': projectPage.width,
                'height': projectPage.height,
            }).attr(`id`, that.projectUUID);
            // 写入数据
            let $data = $content.find(`.page-data`);
            $data.attr({
                "data-lengthunit": projectPage.lengthUnit,
                "data-speed": projectPage.speed,
                "data-volume": projectPage.volume,
                "data-muted": projectPage.muted,
            });
            // 渲染背景
            let $back = $content.find(`.page-background`);
            let backgroundStyle = {};
            switch (projectPage.bg.fill) {
                case `repeat`:
                    backgroundStyle.backgroundRepeat = `repeat`;
                    break;
                default:
                    backgroundStyle.backgroundSize = `cover`;
                    break;
            }
            if (projectPage.bg.color) {
                backgroundStyle.backgroundColor = projectPage.bg.color;
            }
            if (projectPage.bg.image) {
                backgroundStyle.backgroundImage = `url(${projectPage.bg.image})`;
            }
            $back.css(backgroundStyle);
            $back.attr(`background-fill`, projectPage.bg.fill);
            // 渲染边框
            let $border = $content.find(`.page-border`);
            $border.attr(`data-border`, projectPage.border.style);
            let $canvas = $(`<canvas id="pageBorder" class="page-canvas-border" width="${projectPage.width}" height="${projectPage.height}"></canvas>`);
            if (projectPage.border.style) {
                $border.prepend($canvas);
            }
            // 渲染水印
            let $wm = $content.find(`.page-watermark`);
            let hasWatermark = projectPage.watermark.image || projectPage.watermark.text;
            if (hasWatermark) {
                let $wmEle;
                if (projectPage.watermark.image && !projectPage.watermark.width) {
                    projectPage.watermark.height = this.getWatermarkSize('image');
                    this.getImageRatio(projectPage.watermark.image).then(res => {
                        projectPage.watermark.width = Math.floor(projectPage.watermark.height * res);
                        $wmEle = this.PMIXgetWatermarkHtml(watermark);
                        $wm.prepend($wmEle);
                        return;
                    });
                }
                $wmEle = this.PMIXgetWatermarkHtml(watermark);
                $wm.prepend($wmEle);
            }
            // 生成元素
            let $elems = $content.find(`.page-elements`);
            let elementsHtml = PElement().toHtml(that.PMIXprojectData.elements);
            $elems.html(elementsHtml);
            // 生成转场层
            let $transition = $(`<canvas id="transition" class="page-transition" width="${projectPage.width}" height="${projectPage.height}"></canvas>`);
            $elems.prepend($transition);
            return $inner.prop(`outerHTML`);
        },
        // 播放器画布节点转数据
        PMIXprojectToData() {
            const that = this;
            let $page = that.PMIXpage();
            let project = util.deepClone(that.PMIXprojectData);
            if ($page) {
                let $data = $page.querySelector(`.page-data`);
                let dataset = $data.dataset;
                // 获取画布数据
                project.page.width = $page.clientWidth;
                project.page.height = $page.clientHeight;
                project.page.lengthUnit = dataset.lengthunit;
                project.page.bg.color = $page.querySelector(`.page-background`).style.backgroundColor;
                let watermarkImg = $page.querySelector(`.page-watermark img`);
                let watermarkText = $page.querySelector(`.page-watermark p`);
                let hasWatermark = watermarkImg && watermarkImg.getAttribute('src') || watermarkText && watermarkText.innerText;
                if (hasWatermark) {
                    let watermark = watermarkImg && watermarkImg.getAttribute('src') ? watermarkImg : watermarkText;
                    let option = newProjectData().page.watermark;
                    let tb = watermark.style.top ? 'top' : watermark.style.bottom ? 'bottom' : '';
                    let lr = watermark.style.left ? 'left' : watermark.style.right ? 'right' : '';
                    if (tb && lr) {
                        option.position = `${tb}-${lr}`;
                    }
                    option.opacity = Number(watermark.style.opacity);
                    if (watermarkImg) {
                        option.image = watermarkImg.getAttribute('src');
                        option.width = util.fix(watermarkImg.style.width);
                        option.height = util.fix(watermarkImg.style.height);
                        option.scale = watermarkImg.style.transform ? Number(watermarkImg.style.transform.replace(/[^0-9.]/ig, '')) : 1;
                    }
                    if (watermarkText) {
                        option.text = watermarkText.innerText ? watermarkText.innerText : '';
                        option.textStyle.fontSize = util.fix(watermarkText.style.fontSize);
                        option.textStyle.fontFamily = watermarkText.style.fontFamily;
                        option.textStyle.color = watermarkText.style.color;
                    }
                    project.page.watermark = option;
                } else {
                    project.page.watermark = newProjectData().page.watermark;
                }
                project.page.border.style = $page.querySelector(`.page-border`).getAttribute(`data-border`);
                project.page.speed = util.NumberRange(dataset.speed, baseConfig.minPlaybackspeed, baseConfig.maxPlaybackspeed);
                project.page.volume = util.NumberRange(dataset.volume, 0, 100);
                project.page.muted = !!JSON.parse(dataset.muted);
                // 获取元素数据
                project.elements = PElement("").toData();
            }
            return project;
        },
        // 画布边框绘制
        PMIXborderDraw(style) {
            let $canvas = $(`#pageBorder`)[0];
            let $page = this.PMIXpage();
            if (!$canvas) {
                // 渲染边框
                let $border = $page.querySelector(`.page-border`);
                $canvas = $(`<canvas id="pageBorder" class="page-canvas-border" width="${this.PMIXprojectData.page.width}" height="${this.PMIXprojectData.page.height}"></canvas>`)[0];
                $border.insertBefore($canvas, $border.firstChild);
            }
            let borderStyle = style || this.PMIXprojectData.page.border.style;
            if (!borderStyle) return;
            $canvas.setAttribute(`width`, $page.clientWidth);
            $canvas.setAttribute(`height`, $page.clientHeight);
            let ctx = $canvas.getContext(`2d`);
            ctx.clearRect(0, 0, $page.clientWidth, $page.clientHeight);
            if (style === `none`) return;
            BorderLoadSuccess(borderStyle).then(() => {
                BorderDraw({ pageWidth: $page.clientWidth, pageHeight: $page.clientHeight, pageScale: this.PMIXPageScale.current, canvas: $canvas, ctx: ctx, style: borderStyle });
            });
        },
        /**
         * 元素设置转场动画方法
         * @param {object} options 转场属性对象 { id, name, duration, in, out }
         */
        PMIXaddTransition(options) {
            const that = this;
            let option = Object.assign({
                id: "", 				// 转场id没有则新增
                type: "",               // 转场类型 (普通normal, 重叠overlap)
                in: null, 				// 转场进场的元素
                out: null, 				// 转场出场的元素
                name: "", 				// 转场动画名称
                duration: 1000, 		// 转场效果时长
            }, options);
            if (!isPElement(option.out) || !isPElement(option.in)) {
                return console.error(`元素设置转场动画错误，不是有效的元素对象`);
            }
            let outPelem = option.out;
            let inPelem = option.in;
            // 移除转场
            if (!option.name) {
                outPelem.attr(`data-outtransition`, "");
                inPelem.attr(`data-intransition`, "");
            }
            if (option.duration < 0) {
                return;
            }
            let projectTransition = that.PMIXprojectData.transition;
            if (!Array.isArray(projectTransition)) {
                projectTransition = [];
            }
            let newId = util.uuid(`t`);
            let current = projectTransition.find(i => i.id === option.id);
            if (option.id && current) {
                current.name = option.name;
                current.type = option.type;
                current.duration = option.duration;
            } else {
                option.id = newId;
                projectTransition.push({
                    id: option.id,
                    type: option.type,
                    name: option.name,
                    duration: option.duration,
                });
            }
            outPelem.attr(`data-outtransition`, option.id);
            inPelem.attr(`data-intransition`, option.id);
            // 主轨重排
            that.masterTrackPropCloser();
        },
        /**
         * 元素通用插入轨道方法
         * @param {PElement} Pelem 元素构造对象
         * @param {string/number} trackappoint 该参数可以是轨道下标、轨道类型、轨道id
         * @param {string} insertpoint 插入位置 [current:当前时间帧位置 | first:开始位置 | last:结尾位置 | 默认按元素指定的入场时间]
         */
        PMIXpushToTrack(Pelem, trackappoint, insertpoint, fn) {
            if (!isPElement(Pelem) || !Pelem.$element.length) {
                return console.error(`元素插入轨道错误，不是有效的元素对象`);
            }
            const that = this;
            let timelineCurrent = that.timelineCurrent || 0;
            let trackUUIDmark = `track`;
            let tracks = that.PMIXprojectData.tracks;
            let trackTypeList = [`master`, `audio`, `element`];
            let createTrack = {
                id: util.uuid(trackUUIDmark),
                type: `element`,
            };
            let PelemGroup = Pelem.getGroup();
            that.selectedProp = Pelem.firstElement.id;
            // 指定插入位置
            switch (insertpoint) {
                // 当前位置插入
                case `current`:
                    Pelem.moveTime(timelineCurrent);
                    break;
                // 开头插入
                case `first`:
                    Pelem.moveTime(0);
                    break;
                case `last`:
                    break;
                default:
                    Pelem.moveTime(isNaN(insertpoint) ? (Pelem.getInformation().inTime || timelineCurrent) : insertpoint);
                    break;
            }
            // 指定插入规则
            switch (true) {
                // 指定开始下标新增插入
                case typeof trackappoint === "number" && trackappoint < tracks.length:
                    createTrack.type = tracks[trackappoint].type;
                    //（主轨道类型无法继承轨道类型新增插入）
                    // 音频元素只插入audio轨道
                    if (Pelem.type === `audio`) {
                        createTrack.type = `audio`;
                    } else {
                        createTrack.type = `element`;
                    }
                    tracks.splice(trackappoint === 0 ? 0 : trackappoint + 1, 0, createTrack);
                    PelemGroup.$element.forEach(item => { item.setAttribute(`data-track`, createTrack.id) });
                    break;
                // 指定轨道类型新增插入
                case trackTypeList.includes(trackappoint):
                    // 插入主轨道
                    if (trackappoint === `master`) {
                        let getMaster = tracks.find(i => i.type === trackappoint);
                        createTrack.type = `master`;
                        if (getMaster) {
                            Pelem.attr(`data-track`, getMaster.id);
                        } else {
                            tracks.push(createTrack);
                            PelemGroup.$element.forEach(item => { item.setAttribute(`data-track`, createTrack.id) });
                        }
                        // 定义classify属性，设置为不可选中（片头，片尾，主轨道片段除外）
                        if (![`fragment`, `fragmentstart`, `fragmentending`].includes(Pelem.classify)) {
                            Pelem.attr(`data-classify`, `fragment`);
                        }
                        if (insertpoint === `last`) {
                            // 默认插入到最后
                            let outTimes = [0].concat(that.PMIXprojectData.elements.filter(i => i.track === getMaster.id).map(i => i.outTime));
                            Pelem.moveTime(Math.max.apply(null, outTimes));
                        } else {
                            // 获取主轨上元素
                            let masterElements = that.PMIXprojectData.elements.filter(i => i.track === getMaster.id);
                            // 获取当前时间所在元素
                            let currentElement = masterElements.filter(i => i.inTime <= timelineCurrent && i.outTime >= timelineCurrent)[0];
                            if (currentElement) {
                                let currentPelemInfo = PElement(`#${currentElement.id}`).getInformation();
                                // 当前时间在所在元素的前半段，则插入所在元素之前
                                if (currentElement.outTime - timelineCurrent > (currentElement.outTime - currentElement.inTime) / 2) {
                                    Pelem.moveTime(currentPelemInfo.inTime);
                                    // 主轨上元素重排
                                    masterElements.forEach(item => {
                                        if (item.outTime > timelineCurrent) {
                                            let info = Pelem.getInformation();
                                            let itemPelem = PElement(`#${item.id}`);
                                            itemPelem.moveTime(itemPelem.getInformation().inTime + info.outTime - info.inTime);
                                        }
                                    })
                                }
                                else {
                                    // 当前时间在所在元素的后半段，则插入所在元素之后
                                    Pelem.moveTime(currentPelemInfo.outTime);
                                    // 主轨上元素重排
                                    masterElements.forEach(item => {
                                        if (item.inTime > timelineCurrent) {
                                            let info = Pelem.getInformation();
                                            let itemPelem = PElement(`#${item.id}`);
                                            itemPelem.moveTime(itemPelem.getInformation().inTime + info.outTime - info.inTime);
                                        }
                                    })
                                }
                            }
                        }
                    } else {
                        // 查找有空位的轨道
                        let nearestTrack = false;
                        if (Pelem.type === `audio`) {
                            nearestTrack = this.PMIXfindNearestTrack(tracks.filter(item => item.type === `audio`), Pelem);
                        }
                        if (nearestTrack) {
                            createTrack.type = nearestTrack.type;
                            PelemGroup.$element.forEach(item => { item.setAttribute(`data-track`, nearestTrack.id) });
                        } else {
                            createTrack.type = trackappoint;
                            tracks.push(createTrack);
                            PelemGroup.$element.forEach(item => { item.setAttribute(`data-track`, createTrack.id) });
                        }
                    }
                    break;
                // 指定轨道id插入
                case String(trackappoint).indexOf(trackUUIDmark) > -1 && !!tracks.find(i => i.id === trackappoint):
                    let findTrack = tracks.find(i => i.id === trackappoint);
                    createTrack.type = findTrack.type;
                    // 插入主轨道
                    if (findTrack.type === `master`) {
                        // 定义classify属性，设置为不可选中（片头，片尾，主轨道片段除外）
                        if (![`fragment`, `fragmentstart`, `fragmentending`].includes(Pelem.classify)) {
                            Pelem.attr(`data-classify`, `fragment`);
                        }
                        // 当前位置插入
                        if (insertpoint === `last`) {
                            // 默认插入到最后
                            let outTimes = [0].concat(that.PMIXprojectData.elements.filter(i => i.track === findTrack.id).map(i => i.outTime));
                            Pelem.moveTime(Math.max.apply(null, outTimes));
                        } else {
                            // 获取主轨上元素
                            let masterElements = that.PMIXprojectData.elements.filter(i => i.track === findTrack.id);
                            // 获取当前时间所在元素
                            let currentElement = masterElements.filter(i => i.inTime < timelineCurrent && i.outTime > timelineCurrent)[0];
                            if (currentElement) {
                                // 当前时间在所在元素的前半段，则插入所在元素之前
                                if (currentElement.outTime - timelineCurrent > (currentElement.outTime - currentElement.inTime) / 2) {
                                    Pelem.moveTime(PElement(`#${currentElement.id}`).getInformation().inTime);
                                    // 主轨上元素重排
                                    masterElements.forEach(item => {
                                        if (item.outTime > timelineCurrent) {
                                            let info = Pelem.getInformation();
                                            let itemPelem = PElement(`#${item.id}`);
                                            itemPelem.moveTime(itemPelem.getInformation().inTime + info.outTime - info.inTime);
                                        }
                                    })
                                }
                                // 当前时间在所在元素的后半段，则插入所在元素之后
                                else {
                                    Pelem.moveTime(PElement(`#${currentElement.id}`).getInformation().outTime);
                                    // 主轨上元素重排
                                    masterElements.forEach(item => {
                                        if (item.inTime > timelineCurrent) {
                                            let info = Pelem.getInformation();
                                            let itemPelem = PElement(`#${item.id}`);
                                            itemPelem.moveTime(itemPelem.getInformation().inTime + info.outTime - info.inTime);
                                        }
                                    })
                                }
                            }
                        }
                    } else {
                        if (insertpoint === `current`) insertpoint = timelineCurrent;
                        let elements = that.PMIXprojectData.elements.filter(i => i.track === findTrack.id);
                        let PelemInfo = Pelem.getInformation();
                        let duration = PelemInfo.outTime - PelemInfo.inTime;
                        let currentElement = elements.filter(i => (i.inTime >= insertpoint && i.inTime < insertpoint + duration) || (i.outTime > insertpoint && i.outTime <= insertpoint + duration));
                        if (currentElement.length) {
                            let findTrackIndex = tracks.findIndex(i => i.id === trackappoint);
                            tracks.splice(findTrackIndex + 1, 0, createTrack);
                            trackappoint = createTrack.id;
                        }
                    }
                    PelemGroup.$element.forEach(item => { item.setAttribute(`data-track`, trackappoint) });
                    break;
                // 默认最近一条有空位的轨道插入
                default:
                    // 查找有空位的轨道
                    let elemTracks = tracks.filter(item => item.type !== `master` && item.type !== `audio`);
                    let nearestTrack = this.PMIXfindNearestTrack(elemTracks, Pelem);
                    if (nearestTrack) {
                        createTrack.type = nearestTrack.type;
                        PelemGroup.$element.forEach(item => { item.setAttribute(`data-track`, nearestTrack.id) });
                    } else {
                        tracks.push(createTrack);
                        PelemGroup.$element.forEach(item => { item.setAttribute(`data-track`, createTrack.id) });
                    }
                    break;
            }
            util.isFunctionCall(fn, Pelem);
            // 主轨道片段插入其他的轨道，除去片段标识
            if (createTrack.type !== `master` && Pelem.attr(`data-classify`) === `fragment`) {
                Pelem.attr(`data-classify`, ``);
            }
            if (createTrack.type === `master`) {
                // 主轨元素默认锁定
                Pelem.setLock();
            }
            // 轨道跳转
            setTimeout(() => {
                that.setDefaultFragmentData(`ending`);
                that.scrollToSelect();
            }, 200);
            return tracks;
        },
        /**
         * 元素通用查找有空位的轨道
         * @param {Array} tracks 参与查找的轨道数组
         * @param {PElement} Pelem 元素构造对象
         */
        PMIXfindNearestTrack(tracks, Pelem) {
            let nearestTrack = false;
            // 查找有空位的轨道
            try {
                tracks.forEach(track => {
                    let elemList = PElement(`[data-track="${track.id}"]`).toData().sort((a, b) => {
                        return a.inTime - b.inTime;
                    });
                    // 获取轨道上的空位
                    let trackSpace = elemList.map((item, index) => {
                        let start = 0;
                        let end = item.inTime;
                        if (index > 0) {
                            start = elemList[index - 1].outTime;
                        }
                        return { start, end };
                    });
                    trackSpace.push({
                        start: elemList[elemList.length - 1].outTime,
                        end: Infinity,
                    });
                    // 判断是否在当前时间,有可放位置
                    let PelemInfo = Pelem.getInformation();
                    let canPush = trackSpace.filter(i => i.start <= PelemInfo.inTime && i.end >= PelemInfo.outTime).length;
                    if (!!canPush) {
                        nearestTrack = track;
                        throw new Error(``);
                    }
                })
                return nearestTrack;
            } catch (e) {
                return nearestTrack;
            }
        },
        /**
         * 媒体元素插入画布和轨道
         * @param {object} data 元素数据对象
         * @param {number} size 元素插入大小
         */
        PMIXappendMedia(data, size = 1) {
            if (!util.isObject(data)) {
                return;
            }
            let track = ``;
            if (data.classify === `fragment`) {
                track = `master`;
            }
            if (data.type === `audio`) {
                track = `audio`;
            }
            let Pelem = PElement().append(data);
            this.ECMIXsizeAdaptation(Pelem, size);
            Pelem.align(`deuce`, `horizontal`);
            let insertPoint = ``;
            if (!data.inTime) {
                insertPoint = `current`
            } else {
                insertPoint = ``;
            }
            // 非静音的媒体文件插入后,工程的静音取消
            if ((data.type === `video` || data.type === `audio`) && !data.media.muted) {
                this.PMIXMonitorMuted(false, true);
            }
            this.PMIXpushToTrack(Pelem, track, insertPoint);
        },
        /**
         * 添加空白片段到主轨道
         * @param {string} c 颜色
         */
        PMIXappendSpaceFragment(c = `black`) {
            const that = this;
            let color;
            switch (c) {
                case `white`:
                    color = `#ffffff`;
                    break;
                case `black`:
                    color = `#000000`;
                    break;
                default:
                    color = c;
                    break;
            }
            if (!util.isColor(color)) {
                return;
            }
            let projectPage = that.PMIXprojectData.page;
            that.PMIXpushToTrack(PElement().append({
                type: `shape`,
                path: [`M0 0 L100 0 L100 100 L0 100 Z`],
                top: 0,
                left: 0,
                width: 100,
                height: 100,
                background: {
                    color: color
                },
                content: `<div contenteditable="true" style="display: none;"></div>`,
            }).setSize({
                width: projectPage.width,
                height: projectPage.height,
            }), `master`, `last`);
        },
        /**
         * 添加片头元素
         * @param {array} elems 元素数据列表
         * @param {object} rect 元素尺寸
         */
        PMIXappendFragmentStart({ elems, rect }) {
            if (!Array.isArray(elems)) {
                return;
            }
            const that = this;
            // 删除现有的片头
            let oldPelem = PElement(`[data-classify="fragmentstart"]`);
            let oldFragmentDuration = 0;
            if (!!oldPelem.$element.length) {
                let oldPelemInfo = oldPelem.getInformation();
                oldFragmentDuration = oldPelemInfo.outTime - oldPelemInfo.inTime;
                oldPelem.delete();
            }
            // 新增片头
            let group = util.uuid();
            let fragmentArr = elems.map(item => {
                item.id = util.uuid();
                item.group = group;
                item.classify = `fragmentstart`;
                item.lock = true;
                item.fragment = {};
                item.fragment['frame'] = elems.frame;
                item.fragment['cover'] = elems.cover || "";
                item.fragment['rect'] = { width: rect.width, height: rect.height };
                item.power = {};
                if (item.type === `text` || item.type === `image`) {
                    item.power.unablePage = true;
                } else {
                    item.power.unablePage = true;
                    item.power.unablePick = true;
                }
                return item;
            });
            let Pelem = PElement().append(fragmentArr);
            that.ECMIXfragmentAdaptation(Pelem, rect);
            that.PMIXpushToTrack(Pelem, `master`, undefined, newPelem => {
                // 片头处理
                let PelemInfo = newPelem.getInformation();
                let fragmentDuration = PelemInfo.outTime - PelemInfo.inTime;
                // 遍历全部元素处理进场出场当前时间
                that.PMIXpropsEach((item, $elem) => {
                    PElement($elem).moveTime(item.inTime - oldFragmentDuration + fragmentDuration);
                })
            });
        },
        /**
         * 添加片尾元素
         * @param {array} elems 元素数据列表
         * @param {object} rect 元素尺寸
         */
        PMIXappendFragmentEnding({ elems, rect }) {
            if (!Array.isArray(elems)) {
                return;
            }
            const that = this;
            // 删除现有的片尾
            PElement(`[data-classify="fragmentending"]`).delete();
            // 新增片尾
            let group = util.uuid();
            let fragmentArr = elems.map(item => {
                item.id = util.uuid();
                item.group = group;
                item.classify = `fragmentending`;
                item.lock = true;
                item.fragment = {};
                item.fragment['frame'] = elems.frame;
                item.fragment['cover'] = elems.cover || "";
                item.fragment['rect'] = { width: rect.width, height: rect.height };
                item.power = {};
                if (item.type === `text` || item.type === `image`) {
                    item.power.unablePage = true;
                } else {
                    item.power.unablePage = true;
                    item.power.unablePick = true;
                }
                return item;
            });
            let Pelem = PElement().append(fragmentArr);
            that.ECMIXfragmentAdaptation(Pelem, rect);
            Pelem.align(`deuce`, `horizontal`);
            that.PMIXpushToTrack(Pelem, `master`);
        },
        /**
         * 工程播放器元素遍历方法
         * @param {function} fn 遍历回调 (item, element, index, array)
         * @param {array} arr 指定新的数组
         */
        PMIXpropsEach(fn, arr) {
            const that = this;
            let $page = that.PMIXpage();
            let elements = Array.isArray(arr) ? arr : that.PMIXprojectData.elements;
            if (Array.isArray(elements) && elements.length && $page) {
                for (let i = 0; i < elements.length; i++) {
                    let item = elements[i];
                    let elem = $page.querySelector(`#${item.id}`);
                    if (!elem) continue;
                    let callResult = util.isFunctionCall(that, fn, item, elem, i, $page, elements);
                    // return false 停止运行
                    if (typeof callResult === "boolean" && !callResult) {
                        break;
                    }
                }
            }
        },
        /**
         * 工程播放器媒体加载检测
         * @param {function} beforeCall 加载前回调，没有媒体加载时不触发
         */
        PMIXMonitorMediaReady(beforeCall) {
            const that = this;
            let mediaElements = [];
            that.PMIXpropsEach((item, elem, i, $page, elements) => {
                if ([`audio`, `video`].includes(item.type)) {
                    if ([`pending`, `fail`].includes(item.upload) && !this.$task.get(item.id).length) {
                        return;
                    }
                    mediaElements.push(elem.querySelector(`audio, video`));
                }
            });
            return new Promise((resolve, reject) => {
                if (!mediaElements.length) {
                    resolve();
                    return;
                }
                let isError = false;
                let length = mediaElements.length;
                mediaElements.forEach(item => {
                    // 已加载
                    if (item.readyState >= 3) {
                        length--;
                        return;
                    }
                    // 加载完成
                    item.onloadeddata = function () {
                        length--;
                    }
                    // 加载错误，加载中断
                    item.onabort = item.onerror = item.onstalled = function () {
                        isError = true;
                    }
                });
                if (length > 0) {
                    util.isFunctionCall(that, beforeCall);
                }
                let timer = setInterval(() => {
                    if (isError) {
                        clearInterval(timer);
                        reject();
                        return;
                    }
                    if (length <= 0) {
                        clearInterval(timer);
                    }
                    resolve();
                }, 200);
            });
        },
        PMIXMonitorMediaBuffered(elemIds = []) {
            const that = this;
            let mediaBuffered = {};
            that.PMIXpropsEach((item, elem, i, $page, elements) => {
                if ([`audio`, `video`].includes(item.type)) {
                    if (elemIds.length > 0 && !elemIds.includes(item.id)) {
                        return true;
                    }
                    let $media = elem.querySelector(`audio, video`);
                    let buffer = $media.buffered;
                    let bufferArr = [];
                    for (let i = 0; i < buffer.length; i++) {
                        bufferArr.push({
                            //0.5偏差值
                            start: buffer.start(i) - 0.5,
                            end: buffer.end(i) + 0.5,
                        });
                    }
                    mediaBuffered[item.id] = bufferArr;
                }
            });
            return mediaBuffered;
        },
        // 工程播放器元素模拟媒体核心功能
        PMIXMonitorPropsAnimate() {
            const that = this;
            let projectPage = that.PMIXprojectData.page;
            // 获取 / 创建当前页的元素动画对象
            let projectAnimate = {};
            if (ELEMENT_ANIMATE_MAP[that.projectUUID]) {
                projectAnimate = ELEMENT_ANIMATE_MAP[that.projectUUID];
            } else {
                ELEMENT_ANIMATE_MAP[that.projectUUID] = projectAnimate;
            }
            that.PMIXpropsEach((item, $elem, index, $page, arr) => {
                if (!$elem) {
                    return;
                }
                // 降低主轨道元素层级
                let currentTrack = that.PMIXprojectData.tracks.find(i => i.id === item.track);
                if (currentTrack && currentTrack.type === `master`) {
                    $elem.style.zIndex = 1;
                } else {
                    $elem.style.zIndex = 3;
                }
                // 移除旧的动画
                if (projectAnimate[item.id]) {
                    projectAnimate[item.id].animate.cancel();
                }
                // 创建新的动画
                let animateOption = buildAnimateAttr(item.animate, {
                    windowWidth: projectPage.width,
                    windowHeight: projectPage.height,
                    elementTop: item.top,
                    elementLeft: item.left,
                    elementWidth: item.width,
                    elementHeight: item.height,
                });
                let animate = $elem.querySelector(`.element-animate`).animate(animateOption.keyframes, animateOption.options);
                animate.pause();
                projectAnimate[item.id] = {
                    animate: animate,
                };
                // 媒体音量、静音、播放速度初始化
                let $media = $elem.querySelector(`video, audio`);
                let mediaData = item.media;
                if ($media && util.isObject(mediaData)) {
                    // 音量
                    $media.volume = mediaData.volume * (projectPage.volume / 100) / 100;
                    // 播放速度
                    $media.playbackRate = mediaData.speed * projectPage.speed;
                    // 静音
                    $media.muted = projectPage.muted || mediaData.muted;
                }
            });
        },
        /**
         * 工程播放器更新播放进度
         * @param {number} currentTime 当前时间值
         * @param {boolean} paused 是否暂停状态
         */
        PMIXMonitorTimeupdate(currentTime, paused, callback) {
            if (isNaN(currentTime) || paused === undefined) {
                return console.error(`播放器运行失败，缺少必要参数`);
            }
            const that = this;
            let $page = this.PMIXpage();
            if (!$page) {
                return;
            }
            let projectPage = that.PMIXprojectData.page;
            let projectAnimate = ELEMENT_ANIMATE_MAP[that.projectUUID];
            let projectDuration = projectPage.duration;
            let isEnd = currentTime >= projectDuration;
            let SeeElem = [];
            // 遍历全部元素处理进场出场当前时间
            that.PMIXpropsEach((item, $elem, index, $page, arr) => {
                let inTime = item.inTime;
                let outTime = item.outTime;
                let mediaData = item.media;
                let rate = 1000 / 30;
                let isLast = outTime === projectDuration;
                if ($elem) {
                    // 媒体播放，设置 媒体当前时间值（以秒计）
                    let $media = $elem.querySelector(`video, audio`);
                    if ($media && util.isObject(mediaData)) {
                        if (currentTime >= inTime && currentTime < outTime) {
                            let mediaCurrentTime = (currentTime - inTime + mediaData.startTime) / 1000 * mediaData.speed;
                            // 工程播放暂停状态下，只调整媒体当前时间值
                            if (paused) {
                                $media.currentTime = mediaCurrentTime;
                            } else {
                                // 工程播放状态下，媒体从暂停状态改为播放状态
                                let isVideo = $media.tagName === `VIDEO`;
                                if ($media.paused) {
                                    let time = $media.currentTime === 0 ? $media.currentTime + (mediaData.startTime / 1000) : $media.currentTime;
                                    if (mediaCurrentTime >= time || isVideo) {
                                        $media.currentTime = mediaCurrentTime;
                                        let play = $media.play();
                                        if (play) {
                                            play.catch(err => {
                                                console.log(err);
                                            });
                                        }
                                    }
                                } else {
                                    if (!isVideo && Math.abs(mediaCurrentTime - $media.currentTime) * 100 > rate) {
                                        $media.pause();
                                    }
                                }
                            }
                            // 渐强渐弱调整音量
                            if (mediaData.fadeIn || mediaData.fadeOut) {
                                let volume = mediaData.volume * (projectPage.volume / 100) / 100;
                                let duration = (outTime - inTime) / 1000;
                                let fadeIn = isNaN(mediaData.fadeIn) ? 0 : mediaData.fadeIn / 1000;
                                let fadeOut = isNaN(mediaData.fadeOut) ? 0 : mediaData.fadeOut / 1000;
                                let updateVolume = volume;
                                let currentTime = $media.currentTime - (mediaData.startTime / 1000);
                                // 渐强
                                if (currentTime < fadeIn) {
                                    updateVolume = (currentTime / fadeIn) * volume;
                                } else
                                    // 渐弱
                                    if (currentTime > (duration - fadeOut)) {
                                        updateVolume = ((duration - currentTime) / fadeOut) * volume;
                                    }
                                if (updateVolume > volume) {
                                    updateVolume = volume;
                                } else if (updateVolume < 0) {
                                    updateVolume = 0;
                                }
                                $media.volume = updateVolume;
                            }
                        } else {
                            // 工程播放状态下，媒体元素在非显示时间段内调整为暂停状态并恢复当前时间值
                            !$media.paused && $media.pause();
                            $media.currentTime = (isEnd && isLast) ? outTime : mediaData.startTime / 1000;
                        }
                    }
                    // 元素入场出场控制
                    if (currentTime >= inTime && currentTime <= outTime) {
                        $elem.removeAttribute(`out-range`);
                        // 元素动画进度控制
                        if (projectAnimate && projectAnimate[item.id]) {
                            let animate = projectAnimate[item.id].animate;
                            animate.currentTime = (isEnd && isEnd) ? currentTime - inTime - 1 : currentTime - inTime;
                        }
                        // 正在播放的元素
                        SeeElem.push({ item, $elem, index });
                    } else {
                        $elem.setAttribute(`out-range`, `out-range`);
                    }
                }
            });
            // 处理转场数据
            let transitionData = [];
            let $canvas = $page.querySelector(`#transition`);
            let canvasContext;
            if ($canvas) {
                that.PMIXprojectData.transition.forEach(transition => {
                    let outProp;
                    let inProp;
                    that.PMIXpropsEach((item, $elem, index) => {
                        if (item.outTransition === transition.id && !outProp) {
                            outProp = { item, $elem };
                        }
                        if (item.inTransition === transition.id && !inProp) {
                            inProp = { item, $elem };
                        }
                        if (outProp && inProp) {
                            return false;
                        }
                    });
                    if (outProp && inProp) {
                        let startTime = '';
                        let endTime = '';
                        if (transition.type === `normal`) {
                            startTime = outProp.item.outTime - transition.duration / 2;
                            endTime = inProp.item.inTime + transition.duration / 2;
                        } else {
                            startTime = outProp.item.outTime - transition.duration;
                            endTime = outProp.item.outTime;
                        }
                        transitionData.push({
                            id: transition.id,
                            name: transition.name,
                            duration: transition.duration,
                            startTime: startTime,
                            endTime: endTime,
                            aheadTime: transition.type === `overlap` ? 20 : 0,   // 叠化的转场需要提前一帧开始绘制，否则入场视频一开始播放
                            outElement: outProp.$elem,
                            inElement: inProp.$elem,
                            outItem: outProp.item,
                            inItem: inProp.item,
                        });
                    }
                });
                // 清除canvas
                canvasContext = $canvas.getContext(`2d`);
                canvasContext.clearRect(0, 0, $canvas.width, $canvas.height);  // 不能清除路径
                $canvas.width = $canvas.width; // 可以清除路径
                // 绘制当前需要的转场
                let requestTransition = transitionData.find(i => currentTime > i.startTime - i.aheadTime && currentTime < i.endTime);
                if (requestTransition) {
                    TransitionDraw({
                        canvasContext,
                        requestTransition,
                        projectPage,
                        currentTime,
                        pageScale: that.PMIXPageScale.current,
                    });
                } else {
                    document.querySelectorAll(`.element[data-transition-hidden], .element[data-transition-below]`).forEach(item => {
                        item.removeAttribute(`data-transition-hidden`);
                        item.removeAttribute(`data-transition-below`);
                    })
                }
            }
            if (SeeElem.length) {
                let testBuffer = function (tbCurrentTime) {
                    SeeElem = [];
                    that.PMIXpropsEach((item, $elem, index, $page, arr) => {
                        let inTime = item.inTime;
                        let outTime = item.outTime;
                        if ($elem) {
                            let show = tbCurrentTime >= inTime && tbCurrentTime < outTime;
                            if (show) {
                                SeeElem.push({ item, $elem, index });
                            }
                        }
                    });
                    let playingMedia = SeeElem.filter(i => [`audio`, `video`].includes(i.item.type));
                    return playingMedia.some(i => {
                        let wait = true;
                        let m = that.PMIXMonitorMediaBuffered([i.item.id])[i.item.id];
                        if (m) {
                            let c = i.$elem.querySelector(`audio, video`).currentTime;//媒体当前时间
                            let c1 = (tbCurrentTime - i.item.inTime + i.item.media.startTime) / 1000 * i.item.media.speed;//媒体当前时间（基于轨道）
                            wait = !m.some(j => {
                                return c >= j.start && c < j.end && c1 >= j.start && c1 < j.end;
                            });
                        }
                        return wait;
                    });
                }
                let wait = testBuffer(currentTime);
                util.isFunctionCall(that, callback, {
                    type: `waiting`,
                    wait: wait,
                    test: testBuffer,
                });
            } else {
                util.isFunctionCall(that, callback, {
                    type: `action`,
                });
            }
        },
        // 工程播放器暂停
        PMIXMonitorPause() {
            this.PMIXpropsEach((item, $elem, index, $page, arr) => {
                if (!$elem) {
                    return;
                }
                let $media = $elem.querySelector(`video, audio`);
                $media && !$media.paused && $media.pause();
            });
        },
        /**
         * 工程播放器音量调整
         * @param {number} volume 0 - 100
         */
        PMIXMonitorVolume(volume) {
            const that = this;
            let v = isNaN(volume) ? 100 : util.NumberRange(volume, 0, 100);
            that.PMIXpropsEach((item, $elem, index, $page, arr) => {
                if ($page) {
                    $page.querySelector(`.page-data`).setAttribute(`data-volume`, v);
                }
                if ($elem) {
                    let $media = $elem.querySelector(`video, audio`);
                    let mediaData = item.media;
                    if ($media && util.isObject(mediaData)) {
                        // 音量
                        $media.volume = mediaData.volume * (v / 100) / 100;
                    }
                    PElement($elem).direct(item.type, `setVolume`, $elem, v);
                }
            });
        },
        /**
         * 工程播放器静音
         * @param {boolean} muted 
         * @param {boolean} onlyPage  只设置工程
         */
        PMIXMonitorMuted(muted, onlyPage) {
            const that = this;
            let m = !!muted;
            that.PMIXpropsEach((item, $elem, index, $page, arr) => {
                if ($page) {
                    if (!that.paused) that.PMIXprojectData.page.muted = m;
                    $page.querySelector(`.page-data`).setAttribute(`data-muted`, m);
                }
                if ($elem && !onlyPage) {
                    let $media = $elem.querySelector(`video, audio`);
                    let mediaData = item.media;
                    if ($media && util.isObject(mediaData)) {
                        // 静音
                        $media.muted = m;
                    }
                    if (item.media && !that.paused) item.media.muted = m;
                    PElement($elem).direct(item.type, `setMuted`, $elem, m);
                }
            });
            if (!that.paused) that.drawTracks();
        },
        /**
         * 工程播放器变速调整
         * @param {number} speed 0.1 - 5
         */
        PMIXMonitorSpeed(speed) {
            const that = this;
            let s = isNaN(speed) ? baseConfig.minPlaybackspeed : util.NumberRange(util.fix(speed, 1), baseConfig.minPlaybackspeed, baseConfig.maxPlaybackspeed);
            that.PMIXpropsEach((item, $elem, index, $page, arr) => {
                if ($page) {
                    $page.querySelector(`.page-data`).setAttribute(`data-speed`, s);
                }
                if ($elem) {
                    let $media = $elem.querySelector(`video, audio`);
                    let mediaData = item.media;
                    if ($media && util.isObject(mediaData)) {
                        // 播放速度
                        $media.playbackRate = mediaData.speed * s;
                    }
                    PElement($elem).direct(item.type, `setSpeed`, $elem, speed);
                }
            });
        },
        // 时间数值（ms）转时间格式
        PMIXtimeTransform(stamp, useH, hasMillisecond) {
            return util.timeStampTransform(stamp, useH, hasMillisecond);
        },
        // 获取播放器元素
        PMIXpage() {
            return document.querySelector(`#${this.projectUUID}`) || document.querySelector(`.editor-page`);
        },
        // 播放器自适应缩放
        PMIXautoSuit() {
            let $page = this.PMIXpage();
            if ($page) {
                let $inner = $page.parentNode;
                let width = $inner.clientWidth;
                let height = $inner.clientHeight;
                // 位置适配
                let { wrapW, wrapH } = this.PMIXpositionCenter();
                // 尺寸适配
                let scale = 1;
                if (height / width > wrapH / wrapW) {
                    scale = +(wrapH / height).toFixed(2);
                } else {
                    scale = +(wrapW / width).toFixed(2);
                }
                this.PMIXPageScale.suitable = scale;
                this.PMIXsetScale(scale);
            }
        },
        // 播放器居中定位
        PMIXpositionCenter() {
            let $page = this.PMIXpage();
            let wrapW = 0;
            let wrapH = 0;
            if ($page) {
                let $inner = $page.parentNode;
                let $wrap = $inner.parentNode;
                let pageWidth = $inner.clientWidth;
                let pageHeight = $inner.clientHeight;
                let gap = Math.max(util.fix(getComputedStyle($wrap)[`paddingLeft`]), util.fix(getComputedStyle($wrap)[`paddingTop`]));
                wrapW = $wrap.clientWidth - gap * 2;
                wrapH = $wrap.clientHeight - gap * 2;
                // 位置适配
                let pageY = (wrapH - pageHeight) / 2 + gap;
                let pageX = (wrapW - pageWidth) / 2 + gap;
                this.PMIXsetPosition(pageX, pageY);
            }
            return {
                wrapW,
                wrapH,
            };
        },
        /**
         * 播放器设置缩放
         * @param {number} value 缩放数值
         */
        PMIXsetScale(value) {
            let $page = this.PMIXpage();
            if ($page) {
                let $inner = $page.parentNode;
                let scale = +Number(value).toFixed(2);
                if (scale <= this.PMIXPageScale.suitable) {
                    this.PMIXpositionCenter();
                }
                this.PMIXPageScale.current = scale;
                $inner.style.transform = `scale(${scale})`;
                this.PMIXsyncOperation();
                this.PMIXborderDraw();
            }
        },
        /**
         * 播放器设置位置
         * @param {number} x
         * @param {number} y
         */
        PMIXsetPosition(x, y) {
            let $page = this.PMIXpage();
            if ($page) {
                let $inner = $page.parentNode;
                $inner.style.top = `${y}px`;
                $inner.style.left = `${x}px`;
                this.PMIXsyncOperation();
            }
        },
        // 同步编辑器元素操作域位置（仅限编辑器运行）
        PMIXsyncOperation() {
            let $operation = document.querySelector('#editor-operation');
            let $page = this.PMIXpage();
            if ($page) {
                let $inner = $page.parentNode;
                let $wrap = $inner.parentNode;
                if ($operation && $inner && $wrap && $operation.parentNode === $wrap.parentNode) {
                    let wrapRect = $wrap.getBoundingClientRect();
                    let innerRect = $inner.getBoundingClientRect();
                    $operation.style.top = `${innerRect.top - wrapRect.top}px`;
                    $operation.style.left = `${innerRect.left - wrapRect.left}px`;
                }
            }
        },
        /**
         * 设置播放器背景
         * @param {object} options {color, image, fill}
         */
        PMIXsetBackground(options) {
            let $page = this.PMIXpage();
            if (!$page) {
                return;
            }
            let $back = $page.querySelector(`.page-background`);
            let option = Object.assign({
                color: $back.style.backgroundColor,
                image: $back.style.backgroundImage,
                fill: $back.getAttribute(`background-fill`),
            }, options);
            // 背景色
            if (util.isColor(option.color)) {
                $back.style.backgroundColor = option.color;
            }
            // 背景图
            if (option.image) {
                if (validate(option.image).url()) {
                    option.image = `url("${option.image}")`;
                }
                $back.style.backgroundImage = option.image;
            }
            // 填充方式
            switch (option.fill) {
                case `repeat`:
                    $back.style.backgroundRepeat = `repeat`;
                    $back.style.backgroundSize = ``;
                    break;
                default:
                    $back.style.backgroundRepeat = ``;
                    $back.style.backgroundSize = `cover`;
                    break;
            }
        },
        /**
         * 设置播放器边框
         * @param {string} style 样式名称
         */
        PMIXsetBorder(style) {
            const that = this;
            let $page = that.PMIXpage();
            if (!$page) {
                return;
            }
            let $border = $page.querySelector(`.page-border`);
            $border.setAttribute('data-border', style === `none` ? '' : style);
            this.PMIXborderDraw(style);
        },
        /**
         * 设置播放器尺寸
         * @param {number} w 指定宽度
         * @param {number} h 指定高度
         */
        PMIXsetSize(w, h) {
            const that = this;
            let $page = that.PMIXpage();
            if (!$page || (w === that.PMIXprojectData.page.width && h === that.PMIXprojectData.page.height)) {
                return false;
            }
            let $canvas = $page.querySelector(`#transition`);
            let width = util.NumberRange(w, baseConfig.minPageSize, baseConfig.maxPageSize);
            let height = util.NumberRange(h, baseConfig.minPageSize, baseConfig.maxPageSize);
            if (width) {
                $page.style.width = `${width}px`;
                $canvas.width = width;
            }
            if (height) {
                $page.style.height = `${height}px`;
                $canvas.height = height;
            }
            that.PMIXautoSuit();
            return true;
        },
        /**
         * 根据画布尺寸获取水印大小
         * @param {string} type {image, text, position} 
         */
        getWatermarkSize(type) {
            const PAGE_HEIGHT = this.PMIXprojectData.page.height;
            const PAGE_WIDTH = this.PMIXprojectData.page.width;
            const IMAGE_SCALE = newProjectData().page.watermark.height / 1080;
            const TEXT_SCALE = newProjectData().page.watermark.height / 1080;
            const POSITION_TOP = 40 / 1080;
            const POSITION_LEFT = 40 / 1920;
            if (type === 'image') {
                return Math.floor(IMAGE_SCALE * PAGE_HEIGHT);
            } else if (type === 'text') {
                return Math.floor(TEXT_SCALE * PAGE_HEIGHT);
            } else if (type === 'position') {
                return { width: `${Math.floor(POSITION_LEFT * PAGE_WIDTH)}px`, height: `${Math.floor(POSITION_TOP * PAGE_HEIGHT)}px` };
            }

            /* const OFFSET = 40;
            let defaultPage = util.deepClone(newProjectData()).page;
            let projectPage = this.PMIXprojectData.page;
            let positionTop = OFFSET / defaultPage.height;
            let positionLeft = OFFSET / defaultPage.width;
            let imageScale = defaultPage.watermark.height / defaultPage.height;
            let textScale = defaultPage.page.textStyle.fontSize / defaultPage.height;
            return {
                x: `${Math.floor(positionLeft * projectPage.width)}px`,
                y: `${Math.floor(positionTop * projectPage.height)}px`,
                size: Math.floor((type === `image` ? imageScale : textScale) * projectPage.height)
            } */
        },
        PMIXgetWatermarkHtml(option) {
            if (!option.image || !option.text) return;	
            let positionRatio = this.getWatermarkSize('position');
            let positionValue = { top: '', left: '', right: '', bottom: '' };   // 水印方位
            let transformOrigin = '';
            switch (option.position) {
                case 'top-left':
                    positionValue['top'] = positionRatio.y;
                    positionValue['left'] = positionRatio.x;
                    transformOrigin = '0 0';
                    break;
                case 'top-right':
                    positionValue['top'] = positionRatio.y;
                    positionValue['right'] = positionRatio.x;
                    transformOrigin = '100% 0';
                    break;
                case 'bottom-left':
                    positionValue['bottom'] = positionRatio.y;
                    positionValue['left'] = positionRatio.x;
                    transformOrigin = '0 100%';
                    break;
                case 'bottom-right':
                    positionValue['bottom'] = positionRatio.y;
                    positionValue['right'] = positionRatio.x;
                    transformOrigin = '100% 100%';
                    break;
            };
            if (option.image) {
                if (!option.height) {
                    option.height = this.getWatermarkSize('image');
                }
                if (!option.width) {
                    this.getImageRatio(option.image).then(res => {
                        option.width = Math.floor(option.height * res);
                    });
                    return $(`<img class="watermark-img" src="${option.image}" style="width: ${option.width}px; height: ${option.height}px; opacity: ${option.opacity}; top: ${positionValue['top']}; left: ${positionValue['left']}; bottom: ${positionValue['bottom']}; right: ${positionValue['right']}; transform: scale(${option.scale}); transform-origin: ${transformOrigin}"></img>`);
                }
                return $(`<img class="watermark-img" src="${option.image}" style="width: ${option.width}px; height: ${option.height}px; opacity: ${option.opacity}; top: ${positionValue['top']}; left: ${positionValue['left']}; bottom: ${positionValue['bottom']}; right: ${positionValue['right']}; transform: scale(${option.scale}); transform-origin: ${transformOrigin}"></img>`);
            } else if (option.text) {
                if (!options.textStyle.fontSize && options.textStyle.fontSize !== 0) {
                    options.textStyle.fontSize = this.getWatermarkSize('text');
                }
                // 添加阴影
                let shadow = PElement().direct('text', 'getShadow', null, options.textStyle.color);
                return $(`<p class="watermark-text" style="opacity: ${option.opacity}; font-size: ${option.textStyle.fontSize}px; font-family: ${option.textStyle.fontFamily}; color: ${option.textStyle.color}; top: ${positionValue['top']}; left: ${positionValue['left']}; bottom: ${positionValue['bottom']}; right: ${positionValue['right']}; text-shadow: ${shadow.color} ${shadow.x / 100}em ${shadow.y / 100}em ${shadow.blur / 100}em;">${option.text}</p>`);
            }
        },
        /**
         * 设置播放器水印
         * @param {object} options {image, opacity, position, width, height, scale}
         */
        PMIXsetWatermark(options) {
            let $page = this.PMIXpage();
            if (!$page) return;
            let watermark = util.deepClone(newProjectData()).page.watermark;	// 默认的水印数据
            switch (type) {
                case `image`:
                    break;
                case `text`:
                    watermark.image = ``;
                    watermark.text = `迦剪`;
                    watermark.opacity = 1;
                    break;
                case `close`:
                    watermark.image = ``;
                    watermark.text = ``;
                    break;
                default:
                    watermark = Object.assign(watermark, options);
            }
            this.PMIXgetWatermarkHtml(watermark);

            let $watermark = $page.querySelector('.page-watermark');
            if ($watermark.querySelector('img')) $watermark.querySelector('img').remove();
            if ($watermark.querySelector('p')) $watermark.querySelector('p').remove();
            let watermarkNode = this.PMIXgetWatermarkHtml(watermark);
            $watermark.append(watermarkNode);
        }
    },
};

export default PMIX;
