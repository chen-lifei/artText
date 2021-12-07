<template>
    <div class="view-container">
        <div class="project-loading" v-if="!readyDone">
            <img src="@/assets/images/loading/loading-logo.gif" alt="">
            <span>做视频，就用迦剪</span>
        </div>
        <!-- 顶栏 -->
        <div class="editor-header flex flex-between">
            <div class="header-left">
                <div class="Soft-UI concave header-back">
                    <base-button class="UI-active-primary" height="30" :round="true" @click="commonMixinToWorkspace">创作者中心</base-button>
                </div>
                <div class="header-save-status">
                    <img class="save-icon" src="@/assets/images/loading/loading-1.svg" v-if="saveStatus === `saveing`" />
                    <base-icon class="iconshijian" v-else></base-icon>
                    <span v-text="saveTips"></span>
                </div>
            </div>
            <div class="header-center flex flex-between">
                <template v-if="titleEditing">
                    <base-input class="project-title-input" ref="projectTitle" :value="projectInfo.title" @keydown.enter="$event.target.blur()" @blur="saveProjectTitle"></base-input>
                </template>
                <template v-else>
                    <span class="project-title text-ellipsis">{{ projectInfo.title }}</span>
                    <base-icon class="iconwenbenbianjixiugai" @click="editProjectTitle"></base-icon>
                </template>
            </div>
            <div class="header-right flex flex-between">
                <page-scale ref="pagescale" :scale="PMIXPageScale.current"></page-scale>
                <base-button class="undo flat" height="36" @click="projectUndo" v-tooltip.bottom="`撤回<br/>Ctrl+Z`">
                    <base-icon class="iconchexiao"></base-icon>
                </base-button>
                <base-button class="redo flat" height="36" @click="projectRedo" v-tooltip.bottom="`恢复<br/>Ctrl+Y`">
                    <base-icon class="iconhuifu"></base-icon>
                </base-button>
                <div class="Soft-UI concave header-right-btn" @click="openShareModal">
                    <base-button class="UI-active-primary" height="40" :round="true">分享</base-button>
                </div>
                <div class="Soft-UI concave header-right-btn" @click="openExportModal">
                    <base-button class="UI-active-primary" height="40" :round="true">导出</base-button>
                </div>
                <div class="Soft-UI concave header-right-btn" @click="openPublishModal" v-if="userInfo.memberType === `designer`">
                    <base-button class="UI-active-primary" height="40" :round="true">发布</base-button>
                </div>
                <div class="Soft-UI concave header-right-login" v-if="!userInfo.login">
                    <base-button class="primary" width="60" height="40" :round="true" @click="openLoginModal('login')">登录</base-button>
                    <base-button class="flat register" width="60" height="40" :round="true" @click="openLoginModal('register')">注册</base-button>
                </div>
            </div>
        </div>
        <!-- 编辑器窗口 -->
        <div class="editor-container flex flex-between">
            <!-- 左侧元素添加工具栏 -->
            <stock-bar ref="stockbar"></stock-bar>
            <!-- 编辑器 & 轨道 -->
            <div class="center-wrap Soft-UI concave">
                <!-- 编辑器画布 -->
                <div id="editor-window" class="editor-window">
                    <div id="editor-wrap" class="editor-wrap">
                        <div id="editor-call-element" class="editor-call-element"></div>
                    </div>
                    <!-- 元素编辑操作区 -->
                    <div id="editor-operation" class="editor-operation">
                        <!-- 鼠标框选 -->
                        <div id="editor-surface" class="editor-surface"></div>
                        <!-- 元素操作选区 -->
                        <div id="operate-main" class="operate-main">
                            <!-- 虚线框 -->
                            <div class="operate-outline t"></div>
                            <div class="operate-outline r"></div>
                            <div class="operate-outline b"></div>
                            <div class="operate-outline l"></div>
                            <div class="operate-group-mask"></div>
                            <!-- 旋转点 -->
                            <div class="operate-rotate">
                                <div class="rotate-degree" onselect="return false;">0°</div>
                                <div class="rotate-icon"></div>
                            </div>
                            <!-- 缩放点 -->
                            <div class="operate-resizable">
                                <span class="resize-handle tl" style="cursor: nwse-resize;"></span>
                                <span class="resize-handle t" style="cursor: ns-resize;"></span>
                                <span class="resize-handle tr" style="cursor: nesw-resize;"></span>
                                <span class="resize-handle r" style="cursor: ew-resize;"></span>
                                <span class="resize-handle br" style="cursor: nwse-resize;"></span>
                                <span class="resize-handle b" style="cursor: ns-resize;"></span>
                                <span class="resize-handle bl" style="cursor: nesw-resize;"></span>
                                <span class="resize-handle l" style="cursor: ew-resize;"></span>
                            </div>
                            <!-- 锁定按钮 -->
                            <div class="operate-lock" v-tooltip="`点击解锁`" @click.stop="ECMIXsetLock" @mouseover="showOperateUnlock = true" @mouseout="showOperateUnlock = false">
                                <base-icon v-if="!showOperateUnlock" class="iconsuotou" size="14" color="#ffffff"></base-icon>
                                <base-icon v-else class="iconjiesuo" size="14" color="#ffffff"></base-icon>
                            </div>
                            <!-- 缩放数值 -->
                            <!-- <div class="operate-resize-number" v-if="['group','audio'].indexOf(ECMIXinfo.type) < 0">
                                {{ Number(ECMIXinfo.width).toFixed(0) }} x {{ Number(ECMIXinfo.height).toFixed(0) }}
                            </div> -->
                            <!-- 图片裁剪 -->
                            <div class="operate-cropper">
                                <!--svg 裁剪模板-->
                                <svg width="0" height="0">
                                    <defs>
                                        <clipPath id="operate-clip-path">
                                            <path fill="transparent"></path>
                                        </clipPath>
                                    </defs>
                                </svg>
                                <!--动态设置图片宽高，与虚线框保持一致-->
                                <img src="" width="" height="" alt="裁剪图片" style="position: absolute; opacity: 0.3;">
                                <img src="" width="" height="" alt="裁剪图片" style="position: absolute; clip: rect(31.2199px, 228.02px, 143.883px, 85.4943px);">
                                <div class="cropper-hor-line"></div>
                                <div class="cropper-ver-line"></div>
                                <div id="clip-wrap" class="clip-wrap pos-ab" style="left:0; top: 0; width: 200px; height: 100px;"></div>
                            </div>
                        </div>
                        <!-- 单选组合元素内的子元素 生成临时组合操作选区 -->
                        <div id="operate-fake-group" class="operate-fake-group"></div>
                        <!-- 右键面板 -->
                        <div id="operate-contextmenu" class="operate-contextmenu floating-layer">
                            <div class="menu-bar split-line" v-for="(children, i) in contextmenuFilter" :key="i">
                                <div class="menu-item" v-for="(item, j) in children.children" :key="j" v-show="item.show" @click="contextmenuCall(item.call)">
                                    <span>{{ item.title }}</span>
                                    <span class="right">{{ item.key }}</span>
                                </div>
                            </div>
                        </div>
                        <!-- 画布编辑提示 -->
                        <div class="operate-edit-tip"></div>
                        <!-- 画布参考线 -->
                        <div class="page-reference vertical" v-for="item in pageReferencePoint.x" :key="item" :style="{'height': `${PMIXprojectData.page.height * PMIXPageScale.current}px`, 'left': `${item}px`}"></div>
                        <div class="page-reference horizontal" v-for="item in pageReferencePoint.y" :key="item" :style="{'width': `${PMIXprojectData.page.width * PMIXPageScale.current}px`, 'top': `${item}px`}"></div>
                        <!-- 网格实体 -->
                        <svg id="editor-grid" class="editor-grid" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" :style="{'width': `${PMIXprojectData.page.width * PMIXPageScale.current}px`, 'height': `${PMIXprojectData.page.height * PMIXPageScale.current}px`}">
                            <path :d="gridPathValue" fill="none" stroke="rgba(173, 173, 173, 0.3)" stroke-width="0.4" :style="{'transform': `scale(${PMIXPageScale.current})`}"></path>
                        </svg>
                    </div>
                    <div class="unabledit-masking" v-show="unableEdit"></div>
                    <div class="buffering-masking" v-show="playerBuffering"><i></i></div>
                </div>
                <!-- 编辑器轨道 -->
                <div id="editor-tracks" class="editor-tracks Soft-UI" tabindex="-1">
                    <!-- 工程视频控件栏 -->
                    <div class="tracks-header flex flex-between">
                        <div class="header-left">
                            <!-- 剪辑 -->
                            <base-button class="flat" width="32" height="32" :disabled="!checkCuttingState" v-tooltip.bottom="`分割(Ctrl + B)`" @click="trackPropCutting">
                                <base-icon class="iconjianji"></base-icon>
                            </base-button>
                            <!-- 速度 (暂时隐藏) -->
                            <div class="speed" v-if="false">
                                <base-button class="flat" width="32" height="32" v-tooltip.bottom="`变速`">
                                    <base-icon class="iconbiansu"></base-icon>
                                </base-button>
                                <div class="control floating-layer">
                                    <div class="speed-slider">
                                        <base-slider
                                            :progress="[speedPreviewValue / maxSpeed * 100]"
                                            :autofit="[0, 1 / maxSpeed * 100, 2 / maxSpeed * 100, 3 / maxSpeed * 100, 4 / maxSpeed * 100, 100]"
                                            @change="projectPreviewSpeed"
                                            @stop="projectSetSpeed"
                                        >
                                            <template v-slot:dot>{{ Math.floor(speedPreviewValue * 10) / 10 }}x</template>
                                        </base-slider>
                                    </div>
                                    <ul class="speed-list">
                                        <li style="left: 2%;" @click="projectSetSpeed([0])">{{ Number(minSpeed).toFixed(1) }}x</li>
                                        <li style="left: 20%;" @click="projectSetSpeed([1 / maxSpeed * 100])">1.0x</li>
                                        <li style="left: 40%;" @click="projectSetSpeed([2 / maxSpeed * 100])">2.0x</li>
                                        <li style="left: 100%;" @click="projectSetSpeed([100])">{{ Number(maxSpeed).toFixed(1) }}x</li>
                                    </ul>
                                </div>
                            </div>
                            <!-- 复制 -->
                            <base-button class="flat" width="32" height="32" :disabled="!selectedProp" v-tooltip.bottom="`复制(Ctrl + C)`" @click="trackPropCopy">
                                <base-icon class="iconfuzhi"></base-icon>
                            </base-button>
                            <!-- 粘贴 -->
                            <base-button class="flat" width="32" height="32" :disabled="!canPaste" v-tooltip.bottom="`粘贴(Ctrl + V)`" @click="trackPropPaste">
                                <base-icon class="iconniantie"></base-icon>
                            </base-button>
                            <!-- 删除 -->
                            <base-button class="flat" width="32" height="32" :disabled="!selectedProp" v-tooltip.bottom="`删除 Del`" @click="trackPropDelete">
                                <base-icon class="iconbianjiqixixianshanchu"></base-icon>
                            </base-button>
                        </div>
                        <div class="header-center">
                            <!-- 重新播放 -->
                            <base-button class="flat" height="34" v-tooltip.bottom="`重新播放`" @click="projectReplay">
                                <base-icon class="iconzhongxinbofang"></base-icon>
                            </base-button>
                            <!-- 上一个片段 -->
                            <base-button class="flat" height="34" v-tooltip.bottom="`上一个片段(Shift + ↑)`" @click="projectToFragment(`prev`)">
                                <base-icon class="iconxiayipianduan" :rotate="180"></base-icon>
                            </base-button>
                            <!-- 播放/暂停 -->
                            <base-button class="playtoggle flat" height="40" v-tooltip.bottom="paused ? `暂停(Space)` : `播放(Space)`" @click="projectPlayToggle">
                                <base-icon :class="paused ? `iconbofang` : `iconzanting`"></base-icon>
                            </base-button>
                            <!-- 下一个片段 -->
                            <base-button class="flat" height="34" v-tooltip.bottom="`下一个片段(Shift + ↓)`" @click="projectToFragment(`next`)">
                                <base-icon class="iconxiayipianduan"></base-icon>
                            </base-button>
                            <!-- 当前时间 -->
                            <div class="header-timer">
                                <span class="current">{{ PMIXtimeTransform(timelineCurrent, false, true) }}</span>
                                <span> / </span>
                                <span class="duration">{{ PMIXtimeTransform(PMIXprojectData.page.duration, false, true) }}</span>
                            </div>
                            <!-- 全屏播放 -->
                            <base-button class="flat" height="34" v-tooltip.bottom="`全屏播放(Ctrl + F)`" @click="projectFullToggle">
                                <base-icon class="iconfullscreen" size="22"></base-icon>
                            </base-button>
                        </div>
                        <div class="header-right">
                            <div class="volume">
                                <base-button class="flat" height="28" v-tooltip.bottom="PMIXprojectData.page.muted ? `静音` : `${PMIXprojectData.page.muted ? 0 : volumePreviewValue}%`" @click="projectSetMuted">
                                    <base-icon :class="PMIXprojectData.page.muted ? `iconguanbishengyin` : `icondakaishengyin`"></base-icon>
                                </base-button>
                                <div class="control floating-layer">
                                    <div class="value">{{ PMIXprojectData.page.muted ? 0 : volumePreviewValue }}%</div>
                                    <base-slider
                                        :vertical="true"
                                        :progress="[PMIXprojectData.page.muted ? 0 : volumePreviewValue]"
                                        :autofit="[0, 25, 50, 75, 100]"
                                        @change="projectPreviewVolume"
                                        @stop="projectSetVolume"
                                    ></base-slider>
                                </div>
                            </div>
                            <div class="axis-adjust">
                                <base-button class="flat" height="28" v-tooltip.bottom="`缩小(Alt + -)`" :class="{disabled: !axisGapActive(`reduce`)}" @click="scaleAxis(`reduce`)">
                                    <base-icon class="iconzuixiaohua"></base-icon>
                                </base-button>
                                <base-button class="flat auto" height="28" v-tooltip.bottom="`使时间轴适应屏幕(Alt + 0)`" @click="scaleAxis">
                                    <span>适应屏幕</span>
                                </base-button>
                                <base-button class="flat" height="28" v-tooltip.bottom="!axisGapActive(`add`) ? '轨道无法继续放大' : '放大(Alt + +)'" :class="{disabled: !axisGapActive(`add`)}" @click="scaleAxis(`add`)">
                                    <base-icon class="iconpianduantianjia"></base-icon>
                                </base-button>
                            </div>
                            <base-button class="panel-toggle" v-if="tracksVerticalScrollbar.height < 100 || trackPull" height="24" :round="true" v-tooltip.bottom="`(Alt + 1)`" @click="tracksPanelPullToggle">{{ trackPull ? `收起` : `展开` }}</base-button>
                        </div>
                    </div>
                    <!-- 轨道组 -->
                    <div class="tracks-body">
                        <!-- 特殊情况滚动条（无法封装为方法，暂不封装） -->
                        <div class="custom-vertical-scrollbar Soft-UI concave tracks-vertical-scrollbar">
                            <div class="scrollbar-thumb" v-show="tracksVerticalScrollbar.height < 100" :style="{ top: `${tracksVerticalScrollbar.top}%`, height: `${tracksVerticalScrollbar.height}%` }" @mousedown="tracksScrollbarScroll"></div>
                        </div>
                        <div class="timeline-wrap" ref="tracksDesk" v-show="timelineAxis.length">
                            <div class="timeline" ref="timeline" :style="{ width: timelineAxis.length && timelineAxis[timelineAxis.length - 1].left }" @mousedown="timeLineModify">
                                <div class="timeline-axis Soft-line line-row">
                                    <div class="axis-mark Soft-line line-column"
                                        v-for="(item, index) in timelineAxis"
                                        :key="index"
                                        :style="{ left: item.left, height: item.height }"
                                    >
                                        <span class="axis-time">{{ item.time }}</span>
                                    </div>
                                </div>
                                <div class="timeline-tracks" ref="tracksContainer" @mousedown="trackClearSelect" @scroll="tracksScrollbarUpdate($event)">
                                    <div class="timeline-tracks-middle">
                                        <div class="track Soft-UI concave erase" v-for="(item, index) in trackList" :key="item.id" :class="item.type" :id="item.id" :track-type="item.type">
                                            <!-- 轨道元素可放置预显示 -->
                                            <div class="premove-prop-wrap"></div>
                                            <!-- 轨道元素 -->
                                            <div class="prop-wrap"
                                                :class="{ selected: trackIsCheck(elem.id) }"
                                                v-for="elem in item.track"
                                                :key="elem.id"
                                                :style="elem.TRACKSTYLE"
                                                :data-id="elem.id"
                                                :data-group="elem.group"
                                                @mousedown.stop="trackPropMove($event, elem, item)"
                                            >
                                                <div class="prop-handle">
                                                    <div class="handle-left" @mousedown.stop="trackPropDurationModify($event, `inTime`, elem, item)">
                                                        <base-icon class="iconfenge"></base-icon>
                                                    </div>
                                                    <div class="handle-right" @mousedown.stop="trackPropDurationModify($event, `outTime`, elem, item)">
                                                        <base-icon class="iconfenge"></base-icon>
                                                    </div>
                                                    <div class="handle-tip">
                                                        <span>{{ PMIXtimeTransform(extentToTime(util.fix(elem.TRACKSTYLE.left) > 0 ? util.fix(elem.TRACKSTYLE.left) : 0), false, true) }}</span>
                                                    </div>
                                                </div>
                                                <div class="prop-content" v-html="elem.CONTENT"></div>
                                            </div>
                                            <!-- 主轨道转场设置按钮 -->
                                            <div class="prop-transition-wrap" v-if="item.type === `master`">
                                                <div class="prop-transition-item"
                                                    v-for="(item, index) in transitionList"
                                                    v-show="!trackIsCheck(item)"
                                                    :key="index"
                                                    :data-in="item.in"
                                                    :data-out="item.out"
                                                    :style="item.TRANSITIONSTYLE"
                                                    @click="fragmentTransitionOpen(item)"
                                                >
                                                    <base-icon :class="item.name ? `iconzhuanchang` : `iconfenge`"></base-icon>
                                                </div>
                                            </div>
                                            <!-- 轨道间新增插入线（主轨道不显示插入线） -->
                                            <div class="track-insert-line before"></div>
                                            <div v-if="index === trackList.length - 1" class="track-insert-line after"></div>
                                        </div>
                                    </div>
                                </div>
                                <div class="timeline-seek" :style="{ transform: `translateX(${timeToExtent(timelineCurrent)})` }"></div>
                                <!-- 轨道参考线 -->
                                <div class="timeline-reference" v-for="(item, index) in trackReferencePoint" :key="index" :style="{'left': `${item}px`}"></div>
                            </div>
                        </div>
                        <!-- 轨道空状态 -->
                        <div v-show="!timelineAxis.length" class="empty-timeline flex flex-evenly">
                            <div class="flex flex-between">
                                <div class="empty-timeline-push Soft-UI concave">
                                    <base-button id="trackUploadBtn" height="100" type="file" :accept="['video','audio','image']" :multiple="true" @change="trackUploadEvent">
                                        <base-icon class="iconshangchuan1"></base-icon>
                                        <span>从本地新增素材</span>
                                    </base-button>
                                </div>
                                <div class="empty-timeline-push Soft-UI concave">
                                    <base-button height="100" @click="addLibraryFragment">
                                        <base-icon class="iconpianduantianjia"></base-icon>
                                        <span>从库里新增素材</span>
                                    </base-button>
                                </div>
                            </div>
                            <p>开始你的视频创作吧～</p>
                        </div>
                    </div>
                </div>
            </div>
            <!-- 右侧元素编辑工具栏 -->
            <format-bar ref="formatbar"></format-bar>
        </div>

        <!-- 播放器预览组件 -->
        <div class="project-preview-fixed" v-if="projectFullPreviewState">
            <project-player ref="projectPlayer" :project="projectPreviewData" @ready="projectPreviewReady"></project-player>
        </div>

        <!-- 分享弹框 -->
        <base-modal class="share-modal" ref="shareModal" :showClose="false">
            <template v-slot:custom>
                <share-card :project="projectInfo" :modal="true" @success="projectInfoUpdate" @close="$refs.shareModal.close"></share-card>
            </template>
        </base-modal>
        <!-- 导出弹窗 -->
        <export-modal ref="export" :projectInfo="projectInfo"></export-modal>
        <!-- 发布弹窗 -->
        <publish-modal ref="publish" :projectInfo="projectInfo"></publish-modal>
        <!-- 设计师发布弹窗 -->
        <designer-publish ref="designerPublish" :projectInfo="projectInfo" :projectData="PMIXprojectData"></designer-publish>
        <!-- 转场动画设置弹窗 -->
        <transition-modal ref="transitionModal" @setTransition="setFragmentTransition"></transition-modal>
        <!-- 保存失败弹窗 -->
        <save-error ref="saveError"></save-error>
        <!-- 导出封面 -->
        <export-cover ref="exportcover"></export-cover>
    </div>
</template>

<script>
/**
 * 编辑器页面
 * 核心运行逻辑：
 * 1、初始化播放器，创建播放器事件监听； new EditorPlayer() -> vue.runningPlayer()
 * 2、工程数据装载； vue.PMIXprojectLoader()
 * 3、初始化事件监听器； vue.globalEventListener()
 * 4、工程编辑器内容渲染，事件监听； vue.PMIXrendering() -> vue.editorEventListener() -> vue.startPlayerObserver()
 * 5、播放器数据注入，如时长，倍速等数据； vue.dataInjectPlayer() -> vue.PMIXMonitorPropsAnimate() -> vue.PMIXMonitorTimeupdate()
 * 6、观察者监听工程编辑器； new MutationObserver()
 * 7、修改内容触发渲染更新； vue.PMIXprojectToData() -> watch: PMIXprojectData -> vue.dataInjectPlayer() -> vue.PMIXMonitorPropsAnimate() -> vue.PMIXMonitorTimeupdate()
 * 8、修改内容触发保存； vue.projectSave()
 */

// 插件
import WaveSurfer from 'wavesurfer.js';

import { effects } from '@/assets/js/project/effect.js';
import aliOss from '@/assets/js/upload/alioss.js';
import baseElement from '@/assets/js/project/elements/base.js';
import Player from '@/assets/js/project/player.js';
import projectHistory from '@/assets/js/project/history.js';
// 编辑器画布渲染以及自适应方法处理 mixin
import projectMixin from '@/assets/js/project/project.js';
// 编辑器元素操作控制 mixin，包含元素选中、取消等方法，元素选中信息等数据
import ECMIX from '@/assets/js/project/elementControls.js';
// 元素基本操作模块，拖动、旋转、缩放
import elementOperate from '@/assets/js/project/elements/operation.js';
// 富文本编辑方法集模块
import { richText } from '@/assets/js/project/elements/richText.js';
// 组件
import logintip from '@/components/logintip/logintip.js';
import stockBar from "@/views/Editor/components/StockBar.vue";
import formatBar from "@/views/Editor/components/FormatBar.vue";
import pageScale from "@/views/Editor/components/PageScale.vue";
import saveError from '@/views/Editor/components/SaveError.vue';
import transitionModal from '@/views/Editor/components/TransitionModal.vue';
import projectPlayer from '@/components/Player.vue';
import shareCard from '@/components/ShareCard.vue';
import exportModal from '@/components/Export.vue';
import publishModal from '@/components/Publish.vue';
import designerPublish from '@/components/DesignerPublish.vue';
import exportCover from '@/components/ExportCover.vue';

const EditorPlayer = new Player();

export default {
    name: "Editor",
    components: {
        stockBar,
        formatBar,
        pageScale,
        shareCard,
        exportModal,
        publishModal,
        transitionModal,
        projectPlayer,
        saveError,
        designerPublish,
        exportCover
    },
    mixins: [projectMixin, ECMIX],
    provide() {
        return {
            editor: this,
            EditorPlayer: EditorPlayer,
        };
    },
    data() {
        return {
            util: util,
            RunningTime: new Date().getTime(),
            timerPackage: {},
            isLongKeyPress: 0,
            /**
             * 工程运行必需属性
             */
            // 编辑器观察者
            playerObserver: null,
            // 时间戳在页面上每秒显示的长度和精度
            axisGap: {gap: 80, accuracy: 2},
            // 时间线刻度轴
            timelineAxis: [],
            // 工程视频当前时间值（只由播放器方法事件更新，禁止通过vue直接修改）
            timelineCurrent: 0,
            // 工程视频暂停状态（只由播放器方法事件更新，禁止通过vue直接修改）
            paused: true,
            // 工程最大播放速度
            maxSpeed: baseConfig.maxPlaybackspeed,
            minSpeed: baseConfig.minPlaybackspeed,
            // 画布可编辑状态，禁止编辑
            unableEdit: false,
            // 工程缓冲状态
            playerBuffering: false,
            // 播放器时间更新状态 (用于粘贴)
            playerTimeUpdated: false,
            /**
             * 编辑器相关属性
             */
            // 工程加载完成标识
            readyDone: false,
            // 禁止保存标识
            unableSave: false,
            // 保存状态 initial | saveing | success | fail
            saveStatus: `initial`,
            // 工程信息
            projectInfo: {
                id: null,
                title: "未命名的工程",
                url: "",
                createDate: 0,
                modifyDate: 0,
                visitType: "open",
                visitPwd: null,
                attr: {
                    editCount: 0,
                    image: null,
                    playTimes: 0,
                    urlExpireDate: null,
                    urlExpireType: "forever",
                    urlPlayTime: null,
                },
            },
            // 工程标题编辑状态 projectInfo.title
            titleEditing: false,
            // 中文输入监听
            isComposition: false,
            // 使用右键面板
            useContextmenu: true,
            // 是否可粘贴
            canPaste: false,
            // 右键面板 { 显示，标题，快捷键，方法名 }
            contextmenu: [
                {
                    show: true,
                    children: [
                        { show: true, title: `取消组合`, key: `Ctrl Shift G`, call: `ECMIXsetGroup` },
                        { show: true, title: `组合`, key: `Ctrl G`, call: `ECMIXsetGroup` },
                        { show: true, title: `剪切`, key: `Ctrl X`, call: `ECMIXcut` },
                        { show: true, title: `复制`, key: `Ctrl C`, call: `ECMIXcopy` },
                        { show: true, title: `全选`, key: `Ctrl A`, call: `ECMIXsetSelectAll` },
                    ]
                }, {
                    show: true,
                    children: [
                        { show: true, title: `置于顶层`, key: `Ctrl Shift ↑`, call: `ECMIXsetLevelTop` },
                        { show: true, title: `置于底层`, key: `Ctrl Shift ↓`, call: `ECMIXsetLevelBottom` },
                        { show: true, title: `上移一层`, key: `Ctrl Alt ↑`, call: `ECMIXsetLevelUp` },
                        { show: true, title: `下移一层`, key: `Ctrl Alt ↓`, call: `ECMIXsetLevelDown` },
                    ]
                }, {
                    show: true,
                    children: [
                        { show: true, title: `锁定`, key: ``, call: `ECMIXsetLock` },
                        { show: true, title: `删除`, key: `Del`, call: `ECMIXdelete` },
                    ]
                }, {
                    show: true,
                    children: [
                        { show: true, title: `解锁`, key: ``, call: `ECMIXsetLock` },
                    ]
                }
            ],
            showOperateUnlock: false,

            // 网格线坐标
            gridSize: {
                s: 40,
                m: 80,
                l: 120,
            },
            gridModel: {
                small: {
                    x: [],
                    y: [],
                },
                middle: {
                    x: [],
                    y: [],
                },
                large: {
                    x: [],
                    y: [],
                },
            },
            // (small || middle || large) = 开启
            grid_using: false,
            gridPathValue: '',
            // 画布参考线渲染坐标
            pageReferencePoint: {
                x: [],
                y: [],
            },
            // 画布自动吸附坐标
            pageAutoFitPoint: {
                x: [],
                y: [],
            },
            /**
             * 轨道相关属性
             */
            // 轨道列表 [ { id, type, track } ]
            trackList: [],
            // 轨道上选中的元素
            selectedProp: "",
            // 轨道模拟滚动条数据
            tracksVerticalScrollbar: {
                top: 0,
                height: 100,
            },
            // 轨道展开状态
            trackPull: false,
            // 转场效果列表
            transitionList: [],
            // 轨道参考线集合
            trackReferencePoint: [],
            // 轨道帧图
            trackFrameMap:{},
            // 轨道波形图
            trackWaveMap:{},
            // 轨道选中元素标识
            isCheckFromTrack: false,

            // 显示 变速、音量 预览数值
            showSpeedPreview: null,
            showVolumePreview: null,

            // 工程播放器全屏预览状态
            projectFullPreviewState: false,
            projectPreviewData: {},
        };
    },
    computed: {
        saveTips() {
            let text = ``;
            switch (this.saveStatus) {
                case `saveing`:
                    text = `正在保存...`;
                    break;
                case `success`:
                    text = `已自动保存`;
                    break;
                case `fail`:
                    text = `保存失败`;
                    break;
                default:
                    let time = this.projectInfo.modifyDate;
                    text = time > 0 ? `最近保存 ${util.timeStampDetail(time / 1000)}` : `未保存`;
                    break;
            }
            return text;
        },
        // 变速预览值
        speedPreviewValue() {
            return this.showSpeedPreview !== null ? this.showSpeedPreview : this.PMIXprojectData.page.speed;
        },
        // 音量预览值
        volumePreviewValue() {
            return this.showVolumePreview !== null ? this.showVolumePreview : this.PMIXprojectData.page.volume;
        },
        // 右键菜单过滤
        contextmenuFilter() {
            return this.contextmenu.filter(i => i.show);
        },
        // 检查轨道元素剪辑按钮状态
        checkCuttingState() {
            const that = this;
            let currentTime = that.timelineCurrent;
            if (!that.selectedProp) {
                return true;
            } else {
                let Pelem = PElement(`:not([data-classify=fragmentstart]):not([data-classify=fragmentending])`);
                let length = Pelem.$element.filter(item => item.querySelector(`.element-animate`).dataset.intime < currentTime && item.querySelector(`.element-animate`).dataset.outtime > currentTime).length;
                if (length) return true;
            }
            return false;
        },
        // 轨道单位调整状态
        axisGapActive() {
            return (type) => {
                const maxGap = 250;
                const minAccuracy = 1;
                let axisGap = this.axisGap;
                if (type === `add` && axisGap.accuracy === minAccuracy && axisGap.gap >= maxGap) {
                    return false;
                }
                return true;
            }
        },
        // 轨道是否选中
        trackIsCheck() {
            return (value) => {
                if (!this.selectedProp) return false;
                if (util.isObject(value)) {
                    if (value.in === this.selectedProp || value.out === this.selectedProp) return true;
                } else {
                    if (value === this.selectedProp) return true;
                    if (!!PElement(`#${value}`).getGroup().$element.filter(item => item.value === this.selectedProp).length) return true;
                }
                return false;
            }
        },
    },
    watch: {
        // 轨道缩放调整
        axisGap(n) {
            this.drawAxisMark();
            this.drawTracks();
        },
        // 监听画布缩放，更新到其他模块
        PMIXPageScale: {
            handler(n) {
                baseElement.pageScale = n.current;
            },
            deep: true,
        },
        // 监听工程数据对象修改
        PMIXprojectData: {
            handler(n, o) {
                // 轨道绘制
                this.drawTracks();
                this.selectedProp && this.ECMIXupdateInfo(PElement(`#${this.selectedProp}`).getGroup().getSelected().getInformation());
            },
        },
        // 监听时间轴绘制
        timelineAxis: {
            handler(n, o) {
                // 初始新增轨道渲染节点，渲染滚动条
                if (n.length && !o.length) {
                    this.$nextTick(() => {
                        this.tracksScrollbarUpdate();
                    });
                } else {
                    this.$nextTick(() => {
                        this.scrollToSeek();
                    })
                }
            },
        },
        // 监听轨道元素选中，同步选中画布元素，隐藏|显示选中轨道相连的转场按钮
        selectedProp(n) {
            let Pelem = PElement().getSelected();
            if (Pelem.$element.length > 1 && !Pelem.group) {
                this.ECMIXcancelSelect();
            };
            if (n) {
                let isCheckFromTrack = this.isCheckFromTrack;
                if ($(`#${n}`).attr(`checked`) !== `checked`) {
                    this.ECMIXcancelSelect();
                    this.ECMIXsetSelect(document.querySelector(`#${n}`));
                    this.isCheckFromTrack = isCheckFromTrack;
                }
                if (!this.paused) EditorPlayer.pause();
            } else {
                this.ECMIXcancelSelect();
            }
        },
    },
    created() {
        if (window) {
            let wraperArray = [`html`, `body`, `#app`];
            let oldMinWidth = {};
            wraperArray.forEach(item => {
                // 获取原来的样式
                oldMinWidth[item] = document.querySelector(item).style.minWidth;
                // 动态修改全局css （由css处理会影响其他页面）
                document.querySelector(item).style.minWidth = `${baseConfig.minEditorScreenWidth}px`;
            });
            // 组件销毁时还原样式
            this.$once('hook:beforeDestroy', () => wraperArray.forEach(item => document.querySelector(item).style.minWidth = oldMinWidth[item]));
        }
    },
    mounted() {
        // 播放器运行
        this.runningPlayer();
        // 编辑器加载
        this.loadReady();
        // 元素操作方法运行
        elementOperate.ready($(`#operate-main`));
        // 全局事件
        this.globalEventListener();
        // 任务管理器方法监听
        this.taskManagerListener();
    },
    beforeDestroy() {
        EditorPlayer.destroy();
    },
    methods: {
        /**
         * 特定工具类方法 ----------------------------------------------------------
         */
        // 时间数值（ms）转视图长度
        timeToExtent(stamp) {
            return `${((stamp / 1000) / (this.axisGap.accuracy / 2)) * this.axisGap.gap}px`;
        },
        // 视图长度转时间数值（ms）
        extentToTime(px) {
            return ((px / this.axisGap.gap) / 2) * this.axisGap.accuracy * 1000;
        },
        // 查找指定轨道上可用最小及最大进出场时间  PelemInfo=object{元素数据}  relativeOther=boolean{是否相对其他}
        trackUsableTimeFrame(PelemInfo, relativeOther) {
            const that = this;
            let result = {
                isMaster: false,
                minInTime: 0,
                maxInTime: 0,
                minOutTime: 0,
                maxOutTime: 0,
            };
            if (util.isObject(PelemInfo)) {
                let trackItem = that.trackList.find(i => i.id === PelemInfo.track);
                if (trackItem) {
                    let track = trackItem.track;
                    let isMaster = trackItem.type === `master`;
                    let mediaData = PelemInfo.media;
                    let trackPropsInTime = track.map(i => i.inTime);
                    let trackPropsOutTime = track.map(i => i.outTime);
                    let inTime = PelemInfo.inTime;
                    let outTime = PelemInfo.outTime;
                    let minInTime = trackPropsOutTime.filter(i => i <= inTime).sort((a, b) => b - a)[0] || 0;
                    let maxInTime = mediaData ? outTime - (baseConfig.minPropDuration > mediaData.duration ? mediaData.duration : baseConfig.minPropDuration) : outTime - baseConfig.minPropDuration;
                    let minOutTime = mediaData ? inTime +  (baseConfig.minPropDuration > mediaData.duration ? mediaData.duration : baseConfig.minPropDuration) : inTime + baseConfig.minPropDuration;
                    let maxOutTime = trackPropsInTime.filter(i => i >= outTime).sort((a, b) => a - b)[0] || Infinity;
                    // 主轨道非媒体元素不限制进场出场时间
                    if (isMaster) {
                        minInTime = -1;
                        maxOutTime = Infinity;
                    }
                    // 媒体类元素 最小进场时间 和 最大出场时间 无法超过自身媒体时长
                    if (util.isObject(mediaData) && !relativeOther) {
                        let startTime = mediaData.startTime;
                        let mediaDuration = mediaData.duration / mediaData.speed;
                        let mediaMinInTime = inTime - startTime;
                        let mediaMaxOutTime = mediaMinInTime + mediaDuration;
                        // 主轨道视频取消 与其他元素不重叠限制
                        if (isMaster) {
                            minInTime = mediaMinInTime;
                            maxOutTime = mediaMaxOutTime;
                        } else {
                            if (mediaMinInTime > minInTime) {
                                minInTime = mediaMinInTime;
                            }
                            if (mediaMaxOutTime < maxOutTime) {
                                maxOutTime = mediaMaxOutTime;
                            }
                        }
                    }
                    result.isMaster = isMaster;
                    result.minInTime = minInTime;
                    result.maxInTime = maxInTime;
                    result.minOutTime = minOutTime;
                    result.maxOutTime = maxOutTime;
                }
            }
            return result;
        },
        // 更新工程信息
        projectInfoUpdate(data) {
            if (util.isObject(data)) {
                if (data.id !== undefined) {
                    this.projectInfo.id = data.id;
                }
                if (data.title !== undefined) {
                    this.projectInfo.title = data.title;
                }
                if (data.url !== undefined) {
                    this.projectInfo.url = data.url;
                }
                if (data.createDate !== undefined) {
                    this.projectInfo.createDate = data.createDate;
                }
                if (data.modifyDate !== undefined) {
                    this.projectInfo.modifyDate = data.modifyDate;
                }
                if (data.visitType !== undefined) {
                    this.projectInfo.visitType = data.visitType;
                }
                if (data.visitPwd !== undefined) {
                    this.projectInfo.visitPwd = data.visitPwd;
                }
                if (util.isObject(data.attr)) {
                    if (data.attr.editCount !== undefined) {
                        this.projectInfo.attr.editCount = data.attr.editCount;
                    }
                    if (data.attr.image !== undefined) {
                        this.projectInfo.attr.image = data.attr.image;
                    }
                    if (data.attr.playTimes !== undefined) {
                        this.projectInfo.attr.playTimes = data.attr.playTimes;
                    }
                    if (data.attr.urlExpireDate !== undefined) {
                        this.projectInfo.attr.urlExpireDate = data.attr.urlExpireDate;
                    }
                    if (data.attr.urlExpireType !== undefined) {
                        this.projectInfo.attr.urlExpireType = data.attr.urlExpireType;
                    }
                    if (data.attr.urlPlayTime !== undefined) {
                        this.projectInfo.attr.urlPlayTime = data.attr.urlPlayTime;
                    }
                }
            }
            document.title = `${this.projectInfo.title ? this.projectInfo.title : '未命名的工程'}-迦剪`;
        },
        // 工程数据 注入到 播放器
        dataInjectPlayer() {
            const that = this;
            // 媒体文件加载状态
            that.PMIXMonitorMediaReady(() => {
                that.playerBuffering = true;
            }).then(() => {
                EditorPlayer.duration = that.PMIXprojectData.page.duration;
                EditorPlayer.speed = that.PMIXprojectData.page.speed;
                that.PMIXMonitorPropsAnimate();
                that.PMIXMonitorPropstTransition();
                that.PMIXMonitorTimeupdate(EditorPlayer.currentTime, that.paused);
            }).catch(err => {
                console.log(err);
                that.$toast(`视频资源加载失败`);
            }).finally(() => {
                that.playerBuffering = false;
            });
        },
        // 主轨道媒体元素清除空白间隔区域
        masterTrackPropCloser() {
            const that = this;
            let masterTrack = that.trackList.find(i => i.type === `master`);
            if (masterTrack) {
                let masterPropsArr = PElement(`[data-classify="fragment"][data-track="${masterTrack.id}"]`).toData().sort((a, b) => {
                    let aItem = masterTrack.track.filter(item => item.id === a.id);
                    let bItem = masterTrack.track.filter(item => item.id === b.id);
                    let aLeft = aItem[0] ? aItem[0].TRACKSTYLE.left : a.inTime;
                    let bLeft = bItem[0] ? bItem[0].TRACKSTYLE.left : b.inTime;
                    return util.fix(aLeft) - util.fix(bLeft);
                });
                // 片头
                let fsProps = PElement(`[data-classify="fragmentstart"]`);
                fsProps.moveTime(0);
                let featureStart = Math.max.apply(null, [0].concat(fsProps.toData().map(i => i.outTime)));
                let featureEnd = featureStart;
                // 普通元素重排
                for (let i = 0; i < masterPropsArr.length; i++) {
                    let item = masterPropsArr[i];
                    let Pelem = PElement(`#${item.id}`);
                    let prev = masterPropsArr[i - 1];
                    if (prev) {
                        let prevPelem = PElement(`#${prev.id}`);
                        let outTime = prevPelem.getInformation().outTime;
                        // 当前转场效果进场与前一个转场效果出场不相同，清除转场效果
                        if (!(item.inTransition && item.inTransition === prev.outTransition)) {
                            Pelem.attr(`data-intransition`, "");
                            prevPelem.attr(`data-outtransition`, "");
                        } else {
                            let PelemTransition = that.PMIXprojectData.transition.filter(transition => transition.id === item.inTransition)[0];
                            if (PelemTransition.type === `overlap`) {
                                outTime = prevPelem.getInformation().outTime - PelemTransition.duration;
                            }
                        }
                        Pelem.moveTime(outTime);
                    } else {
                        Pelem.moveTime(featureStart);
                    }
                    // 获取正片结束时间
                    if (i === masterPropsArr.length - 1) {
                        featureEnd = Pelem.getInformation().outTime;
                    }
                }
                // 片尾
                let feProps = PElement(`[data-classify="fragmentending"]`);
                feProps.moveTime(featureEnd);
            }
        },
        // 轨道横向滚动，返回值为滚动后的值
        trackHorizontalScroll(number) {
            let $desk = this.$refs.tracksDesk;
            if (!$desk) {
                return 0;
            }
            if (!isNaN(number)) {
                $desk.scrollLeft = Number(number);
            }
            return $desk.scrollLeft;
        },
        // 轨道垂直滚动，返回值为滚动后的值
        trackVerticalScroll(number) {
            let $contain = this.$refs.tracksContainer;
            if (!$contain) {
                return 0;
            }
            if (!isNaN(number)) {
                $contain.scrollTop = Number(number);
            }
            return $contain.scrollTop;
        },
        // 轨道模拟滚动条 长度&位置 更新
        tracksScrollbarUpdate() {
            const that = this;
            that.$nextTick(() => {
                let $tracksWrap = that.$refs.tracksContainer;
                if ($tracksWrap) {
                    let scrollbar = that.tracksVerticalScrollbar;
                    scrollbar.height = $tracksWrap.offsetHeight / $tracksWrap.scrollHeight * 100;
                    scrollbar.top = $tracksWrap.scrollTop / $tracksWrap.scrollHeight * 100;
                }
            });
        },
        // 主轨道片段添加按钮定位
        masterTrackAddFragmentPosition() {
            const that = this;
            that.$nextTick(() => {
                let addFragment = that.$refs.masterAddFragment;
                let masterTrack = that.PMIXprojectData.tracks.find(i => i.type === `master`);
                if (Array.isArray(addFragment)) {
                    addFragment = addFragment[0];
                }
                if (util.isNode(addFragment) && masterTrack) {
                    let elements = that.PMIXprojectData.elements;
                    let masterOutTime = [0].concat(elements.filter(i => i.track === masterTrack.id).map(i => i.outTime));
                    let maxOutTime = Math.max.apply(null, masterOutTime);
                    addFragment.style.left = that.timeToExtent(maxOutTime);
                }
            });
        },
        // 轨道横向滚动到当前时间帧处
        scrollToSeek() {
            const that = this;
            let $desk = that.$refs.tracksDesk;
            if (!$desk) {
                return;
            }
            that.trackHorizontalScroll(util.fix(that.timeToExtent(that.timelineCurrent)) - $desk.offsetWidth / 2);
        },
        // 轨道定位到当前选中元素的轨道位置
        scrollToSelect(time) {
            const that = this;
            let $tracksWrap = that.$refs.tracksContainer;
            if (!$tracksWrap || !that.selectedProp) {
                return;
            }
            // 时间线定位到选中元素进场时间
            if (!time) {
                let PelemInfo = PElement(`#${that.selectedProp}`).getGroup().getInformation();
                // 当前时间已经在选中元素时间区域内，不再移动
                if (PelemInfo.inTime <= that.timelineCurrent && PelemInfo.outTime >= that.timelineCurrent) {
                    return;
                }
                time = PelemInfo.inTime + 50;
            } else if (time === `center`) {
                let PelemInfo = PElement(`#${that.selectedProp}`).getGroup().getInformation();
                time = PelemInfo.inTime + (PelemInfo.outTime - PelemInfo.inTime) / 2;
            }
            EditorPlayer.currentTime = time;
            // 横向滚动条定位
            that.scrollToSeek();
            // 纵向滚动条定位
            let $selectedTrack = $(`.prop-wrap[data-id=${that.selectedProp}]`);
            if (!$selectedTrack[0] || !$selectedTrack[0].offsetParent) {
                return;
            }
            that.trackVerticalScroll($selectedTrack[0].offsetParent.offsetTop - $tracksWrap.clientHeight + $selectedTrack[0].clientHeight + 30);
        },
        // 生成波形图
        trackWaveform(){
            let audioTrackList = [];
            let tracksContainer = this.$refs.tracksContainer;
            this.trackList.forEach(item => item.type === `audio` && audioTrackList.push(...item.track));
            for(let key in this.trackWaveMap){
                // 判断当前这个波形图对应的音频是否还存在
                let isHas = audioTrackList.some(v => v.id == key);
                // 不存在的音频就清除实例 以及 对象
                if(!isHas&&this.trackWaveMap[key]){
                    this.trackWaveMap[key].WaveSurfer?.destroy();
                    this.trackWaveMap[key] = null;
                }
            }
            audioTrackList.forEach((elem, index) => {
                // 获取音频封面节点
                let coverElem = tracksContainer.querySelector(`[track-type="audio"] .prop-wrap[data-id="${elem.id}"] .frame-cover`);
                let options = {
                    container: coverElem, // 容器
                    // waveColor 和 progressColor 相同时 只渲染一个canvas
                    waveColor: 'rgba(255, 255, 255, .3)',
                    progressColor: 'rgba(255, 255, 255, .3)',
                    height: 30, // 音频波形高度 默认值128
                    barWidth: 1,
                    barMinHeight: 1, // 音频波形最小高度
                    loopSelection: false, // 关闭所选区域的循环
                    // backend: 'MediaElement', // 开启峰值预加载
                    hideScrollbar: true, // 隐藏X轴滚动条
                    partialRender: true, // 自适应宽度
                }
                if(this.trackWaveMap[elem.id]) {
                    options.backend = 'MediaElement';
                    // 删除实例
                    this.trackWaveMap[elem.id].waveSurfer?.destroy();
                    this.trackWaveMap[elem.id].waveSurfer = null;
                    // 生成可用峰值的实例
                    this.trackWaveMap[elem.id].waveSurfer = WaveSurfer.create(options);
                    let peaks = this.trackWaveMap[elem.id].peaks;
                    // 重新加载波形图
                    this.trackWaveMap[elem.id].waveSurfer.load(elem.src, peaks);
                }else{
                    let wave_item= {
                        // WaveSurfer.create 返回的实例
                        waveSurfer: null,
                        // 峰值数组
                        peaks: []
                    }
                    wave_item.waveSurfer = WaveSurfer.create(options);
                    wave_item.waveSurfer.on('ready', async () => {
                        let peaks = await wave_item.waveSurfer.exportPCM(1024, 10000, true, 0);
                        wave_item.peaks = peaks;
                        if(this.trackWaveMap[elem.id]){
                            this.trackWaveMap[elem.id]?.waveSurfer?.destroy();
                        }
                        this.trackWaveMap[elem.id] = wave_item;
                    });
                    wave_item.waveSurfer.load(elem.src);
                }
            });
        },
        // 生成帧图
        trackSliceFrame() {
            const that = this;
            const frameHeight = 57;
            const frameSplitSecond = 1000;
            let masterTrack = that.trackList.find(i => i.type === `master`);
            let $tracksWrap = that.$refs.tracksContainer;
            if (masterTrack && $tracksWrap) {
                masterTrack = masterTrack.track.filter(i => i.type === `video` || i.classify === `fragmentstart` || i.classify === `fragmentending`);
                masterTrack.forEach(item => {
                    if (item.upload === `pending` && that.$task.get(item.id).length) return;
                    let $frameWrap = $tracksWrap.querySelector(`[data-id=${item.id}] .frame-cover`);
                    if (!$frameWrap) return;
                    //使用封面图
                    $frameWrap.style.backgroundImage = `url(${item.cover})`;
                    $frameWrap.style.backgroundSize = `contain`;
                    //使用帧图
                    let $frame = document.createElement('canvas');
                    $frameWrap.innerHTML = $frame.outerHTML;
                    $frame = $frameWrap.querySelector('canvas');
                    $frame.height = frameHeight;
                    if (item.classify === `fragmentstart` || item.classify === `fragmentending`) {
                        $frame.width = util.fix(item.TRACKSTYLE.width) + util.fix(that.timeToExtent(0));
                    } else {
                        $frame.width = util.fix(item.TRACKSTYLE.width) + util.fix(that.timeToExtent(item.media.startTime));
                    }
                    let ctx = $frame.getContext('2d');
                    let renderFrame = function(data){
                        let width = data.width,height = data.height;
                        let ratio = frameHeight / height;
                        width *= ratio;
                        let frames = data.framesByCanvas;
                        let frameArr = new Array(frames.length).fill(0).map((i, index) => {
                            return {
                                time: index * frameSplitSecond,
                                frame: index
                            }
                        });
                        if (frameArr.length) {
                            let frameLength = '';
                            if (item.classify === `fragmentstart` || item.classify === `fragmentending`) {
                                frameLength = Math.ceil((util.fix(item.TRACKSTYLE.width) + util.fix(that.timeToExtent(0))) / width);
                            } else {
                                frameLength = Math.ceil((util.fix(item.TRACKSTYLE.width) + util.fix(that.timeToExtent(item.media.startTime))) / width);
                            }
                            // 计算接下来一帧图像的位置所处时间轴上的时间点，根据时间轴上的时间点与帧图时间计算得出最近的帧图渲染
                            for (let i = 0; i < frameLength; i++) {
                                let fnodeTime = that.extentToTime(i * width);
                                let sortFrameArr = util.deepClone(frameArr).map(i => {
                                    i.time -= fnodeTime;
                                    return i;
                                });
                                let fresh = sortFrameArr.filter(i => i.time <= 0).sort((a, b) => b.time - a.time);
                                ctx.drawImage(frames[fresh[0].frame],i * width, 0 , width , frameHeight);
                            }
                        }
                    }
                    let srcRes = that.trackFrameMap[item.id]
                    if (srcRes) {
                        renderFrame(srcRes);
                    } else {
                        let frame = item.fragment.frame || item.frame;
                        if (!frame) return;
                        that.commonMixinGetVideoFrame(frame).then(srcRes => {
                            renderFrame(srcRes);
                            that.trackFrameMap[item.id] = srcRes;
                        }).catch(()=>{});
                    }
                });
            }
        },

        /**
         * 数据请求加载类方法 ----------------------------------------------------------
         */
        // 工程加载
        loadReady() {
            const that = this;
            // 用户工程
            if (that.$route.query.id && !isNaN(that.$route.query.id)) {
                that.fetchMemberProject();
                try {
                    let axis = JSON.parse(JSON.parse(localStorage.getItem('product_axisgap'))[that.$route.query.id]);
                    that.axisGap = util.isObject(axis) ? axis : {gap: 80, accuracy: 2};
                } catch (error) {
                    that.axisGap = {gap: 80, accuracy: 2};
                }
                return;
            }
            // 模板工程
            if (that.$route.query.model && !isNaN(that.$route.query.model)) {
                that.fetchTemplateProject();
                return;
            }
            if (that.$route.query.designId && !isNaN(that.$route.query.designId)) {
                that.fetchDesignProject();
                return;
            }
            if (that.$route.query.materialId && !isNaN(that.$route.query.materialId)) {
                that.fetchMaterialProject();
                return;
            }
            // 预设尺寸
            let preset = baseConfig.ProjectSizeTemplate.find(i => i.key === that.$route.query.preset);
            if (preset) {
                that.PMIXprojectData.page.width = preset.width;
                that.PMIXprojectData.page.height = preset.height;
            }
            // 自定义尺寸
            let units = baseConfig.ProjectSizeUnits.find(i => i.value === that.$route.query.units);
            if (units) {
                that.PMIXprojectData.page.lengthunit = that.$route.query.units;
                if (that.$route.query.width && that.$route.query.height) {
                    that.PMIXprojectData.page.width = that.$route.query.width;
                    that.PMIXprojectData.page.height = that.$route.query.height;
                }
            }
            that.fetchProjectComplete();
        },
        // 获取用户工程
        fetchMemberProject() {
            const that = this;
            that.$api.PROJECT_DETAIL({
                data: {
                    id: that.$route.query.id,
                }
            }).then(res => {
                let data = res.data;
                let project = data.content;
                for (let key in project) {
                    try {
                        project[key] = JSON.parse(project[key]);
                    } catch (error) {}
                }
                // 工程数据装载
                that.PMIXprojectLoader(project);
                // 设置工程信息
                that.projectInfoUpdate(data);
            }).catch(err => {
                console.log(`创建新工程`);
                // 清除无效id
                if (that.$route.query.id) {
                    let query = Object.assign({}, that.$route.query);
                    delete query.id;
                    that.$router.push({
                        query: query,
                    });
                }
                if (err && util.isObject(err.data)) {
                    let tips = ``;
                    switch (err.data.errorType) {
                        case `projectNotFound`:
                            tips = `工程不存在，`;
                            break;
                        case `projectForbidden`:
                            tips = `无权限访问此工程，`;
                            break;
                        default:
                            tips = `无效工程，`;
                            break;
                    }
                    that.$toast(`${tips}已为您准备创建新的工程~`, 2000);
                }
            }).finally(() => {
                let files = that.$route.params.files;
                let uploadFileIds = that.$route.params.uploadFileIds;
                if (uploadFileIds?.length) {
                    that.fetchProjectComplete(fn => {
                        that.$api.UPLOAD_LIST().then(res => {
                            let uploadList = res.data.content;
                            let append = index => {
                                let element = uploadList[index];
                                if(!element){
                                    fn();
                                    return;
                                }
                                if(uploadFileIds.some(id => id == element.id)){
                                    let properties = element.properties;
                                    let classify = [`image`, `video`].includes(element.type) ? `fragment` : ``;
                                    that.PMIXappendMedia({
                                        type: element.type,
                                        src: element.content,
                                        title: element.name,
                                        classify,
                                        media: {duration: properties.duration},
                                        cover: element.image,
                                        frame: properties.frame || properties.waveform,
                                        width: properties.width,
                                        height: properties.height,
                                    });
                                    that.$nextTick(() => {
                                        index++;
                                        append(index);
                                    })
                                }else{
                                    index++;
                                    append(index);
                                }
                            }
                            append(0);
                        })
                    });
                } else if(files?.length) {
                    that.fetchProjectComplete(fn => {
                        fn();
                        that.$nextTick(()=>{
                            that.trackUploadEvent(files, {masterTypeArray: [`image`, `video`]});
                        });
                    });
                } else {
                    that.fetchProjectComplete();
                }
            });
        },
        // 获取模板工程
        fetchTemplateProject() {
            const that = this;
            that.$api.TEMPLATE_DETAIL({
                data: {
                    id: that.$route.query.model,
                }
            }).then(res => {
                let data = res.data;
                if (!util.isObject(data.project)) {
                    return;
                }
                let project = data.project.content;
                for (let key in project) {
                    try {
                        project[key] = JSON.parse(project[key]);
                    } catch (error) {}
                }
                // 工程数据装载
                that.PMIXprojectLoader(project);
                // 设置工程信息
                that.projectInfoUpdate(data);
            }).catch(err => {
                console.log(`创建新工程`);
                // 清除无效id
                if (that.$route.query.model) {
                    let query = Object.assign({}, that.$route.query);
                    delete query.model;
                    that.$router.push({
                        query: query,
                    });
                }
                if (err && err.content) {
                    that.$toast(`${err.content}，已为您准备创建新的工程~`, 2000);
                }
            }).finally(() => {
                that.fetchProjectComplete();
            });
        },
        // 获取素材工程
        fetchDesignProject() {
            const that = this;
            that.fetchProjectComplete(fn => {
                that.$api.MATERIAL_DETAIL({
                    data: {
                        id: that.$route.query.designId,
                        saveLatelyUsed: true
                    }
                }).then(res => {
                    fn();
                    if (res.data.type === 'elements') {
                        that.PMIXappendMaterial(res.data);
                    } else {
                        // 元素插入轨道
                        let {type, content, name, image, properties, category} = res.data;
                        that.PMIXappendMedia({
                            type: type,
                            src: content,
                            title: name,
                            classify: type === `video` ? `fragment` : ``,
                            media: {duration: properties.duration},
                            cover: image,
                            frame: properties.frame || properties.waveform,
                            width: properties.width,
                            height: properties.height,
                        }, type === `image` ? Number(category.properties.insertSize) / 100 : 1);
                    }
                }).catch(err => {
                    console.log(`创建新工程`);
                    // 清除无效id
                    if (that.$route.query.designId) {
                        let query = Object.assign({}, that.$route.query);
                        delete query.designId;
                        that.$router.push({
                            query: query,
                        });
                    }
                    if (err && err.content) {
                        that.$toast(`${err.content}，已为您准备创建新的工程~`, 2000);
                    }
                }).finally(() => {
                    that.PMIXsetWatermark();
                });
            });
        },
        // 获取素材工程
        fetchMaterialProject() {
            const that = this;
            that.fetchProjectComplete(fn => {
                that.$api.MATERIAL_DETAIL({
                    data: {
                        id: that.$route.query.materialId,
                        saveLatelyUsed: false
                    }
                }).then(res => {
                    fn();
                    let data = res.data;
                    that.PMIXsetSize(data.properties.width || 1080, data.properties.height || 1080);
                    that.PMIXsetBackground({color: data.imageBackgroundColor || '#ffffff'});
                    let elements = JSON.parse(res.data.content);
                    elements.forEach(item => {
                        item.id = util.uuid();
                    })
                    let Pelem = PElement().append(elements);
                    Pelem.setGroup();
                    Pelem.align(`deuce`, `horizontal`);
                    Pelem.unGroup();
                    Pelem.$element.forEach(item => {
                        let _Pelem = PElement(item);
                        let PelemInfo = _Pelem.getInformation();
                        that.PMIXpushToTrack(_Pelem, undefined, PelemInfo.inTime);
                    })
                    that.ECMIXcancelSelect();
                }).catch(err => {
                    console.log(`创建新工程`);
                    // 清除无效id
                    if (that.$route.query.materialId) {
                        let query = Object.assign({}, that.$route.query);
                        delete query.materialId;
                        that.$router.push({
                            query: query,
                        });
                    }
                    if (err && err.content) {
                        that.$toast(`${err.content}，已为您准备创建新的工程~`, 2000);
                    }
                }).finally(() => {
                    that.PMIXsetWatermark();
                });
            });
        },
        // 获取工程当前封面
        fetchProjectCurrentCover(option) {
            return new Promise(resolve => {
                let projectData = this.PMIXprojectData;
                let currentTime = EditorPlayer.currentTime;
                this.$refs.exportcover.export(option || { currentTime }, projectData, resolve);
            });
        },
        // 工程保存
        projectSave(success) {
            const that = this;
            // 未登录不触发保存，登录成功后再触发保存
            if (!that.userInfo.login) return;
            // 素材编辑不触发保存
            if (that.$route.query.materialId) return;
            let projectId = that.$route.query.id;
            let query = {};
            if (projectId) {
                query[`id`] = projectId;
                let image = that.projectInfo.attr.image;
                if(image){
                    let index = image.indexOf('?');
                    if(index > -1){
                        image = image.substring(0, index);
                    }
                    query[`image`] = util.addTimertamp(image);
                }
            }
            if (!projectId) {
                if (that.$route.query.folderId) {
                    query[`folderId`] = that.$route.query.folderId;
                    // 清除 folderId
                    let newQuery = Object.assign({}, that.$route.query);
                    delete newQuery.folderId;
                    that.$router.push({
                        query: newQuery,
                    });
                }
            }
            clearTimeout(that.timerPackage[`saveDebounce`]);
            that.timerPackage[`saveDebounce`] = setTimeout(() => {
                // 禁止保存
                if (that.unableSave) {
                    return;
                }
                // 保存前
                that.saveStatus = `saveing`;
                clearTimeout(that.timerPackage[`saveStatus`]);
                clearTimeout(that.timerPackage[`saveStatusReset`]);
                let content = util.deepClone(that.PMIXprojectData);
                for (let key in content) {
                    content[key] = JSON.stringify(content[key]);
                }
                content = JSON.stringify(content);
                that.$api.PROJECT_SAVE({
                    data: content,
                    query: query,
                }).then(res => {
                    let data = res.data;
                    that.timerPackage[`saveStatus`] = setTimeout(() => {
                        that.saveStatus = `success`;
                        that.timerPackage[`saveStatusReset`] = setTimeout(() => {
                            that.saveStatus = `initial`;
                        }, 30000);
                    }, 1000);
                    // 更新工程信息
                    that.projectInfoUpdate(data);
                    // 此次保存为创建文档
                    if (!projectId) {
                        projectHistory.loader(that.projectInfo.id);
                    }
                    // 替换当前路由参数
                    if (Number(projectId) !== Number(that.projectInfo.id)) {
                        that.$router.push({
                            query: Object.assign({}, that.$route.query, {
                                id: that.projectInfo.id,
                                model: undefined,
                            }),
                        });
                    }
                    util.isFunctionCall(that, success);
                }).catch(err => {
                    console.log(`保存失败`, err);
                    that.timerPackage[`saveStatus`] = setTimeout(() => {
                        that.saveStatus = `fail`;
                    }, 1000);
                    that.$refs.saveError.open();
                });
                that.saveProjectCover();
            }, 500);
        },
        // 保存工程标题
        saveProjectTitle(event) {
            const that = this;
            let vali = validate(event.value);
            that.titleEditing = false;
            if (event.value === that.projectInfo.title) {
                return;
            }
            if (vali.empty()) {
                return that.$toast(`请输入工程标题`);
            }
            if (vali.illegal() || vali.special()) {
                return that.$toast(`标题存在非法字符，请清除后保存`);
            }
            if (!vali.rangelength(60)) {
                return that.$toast(`标题最大可输入60字`);
            }
            let save = function () {
                that.$api.PROJECT_RENAME({
                    data: {
                        id: that.projectInfo.id,
                        title: event.value,
                    }
                }).then(res => {
                    that.projectInfo.title = event.value;
                    document.title = `${that.projectInfo.title}-迦剪`;
                }).catch(err => {
                    that.$toast(`工程标题设置失败~`);
                });
            }
            if (that.projectInfo.id) {
                save();
            } else {
                that.projectSave(() => {
                    save();
                });
            }
        },
        // 保存工程封面图
        saveProjectCover(content){
            const that = this;
            let id = that.projectInfo.id;
            if(!id) return
            let cover = that.projectInfo.attr.image;
            if (cover && cover.indexOf('project_cover_') < 0) return;
            that.fetchProjectCurrentCover({currentTime: 1000, base64: true}).then(content => {
                let blob = util.base64ToBlob(content.image);
                aliOss.upload({
                    file: blob,
                    fileName: `project_cover_${id}.jpg`,
                    fileType: 'project',
                }).then(data => {
                    that.projectInfo.attr.image = data;
                })
            })
        },


        /**
         * 渲染类方法 ----------------------------------------------------------
         */
        // 获取工程信息完成，渲染编辑器
        fetchProjectComplete(fn) {
            const that = this;
            // 编辑器渲染
            that.drawInitialProject(() => {
                that.editorEventListener();
                setTimeout(() => {
                    projectHistory.loader(that.projectInfo.id, that.PMIXprojectData);
                    that.startPlayerObserver();
                }, 200);
                if (typeof fn === `function`) {
                    setTimeout(() => {
                        fn(() => {
                            // 编辑器准备完成
                            that.readyDone = true;
                        })
                    }, 400);
                } else {
                    // 编辑器准备完成
                    setTimeout(() => {
                        that.readyDone = true;
                    }, 2000 - (new Date().getTime() - that.RunningTime));
                }
            });
        },
        // 绘制工程画布
        drawInitialProject(next) {
            const that = this;
            that.ECMIXcancelSelect();
            // 编辑器渲染
            $(`#editor-wrap`).children(`:not(#editor-call-element)`).remove();
            $(`#editor-wrap`).append($(that.PMIXrendering()));
            // 编辑器自适应
            that.PMIXautoSuit();
            // 加载完成
            that.$nextTick(() => {
                // 播放器数据注入
                that.dataInjectPlayer();
                // 网格初始化
                that.initCanvasGrid();
                util.isFunctionCall(that, next);
            });
        },
        // 工程撤回
        projectUndo() {
            const that = this;
            let undo = projectHistory.undo();
            if (!undo) {
                return that.$toast(`无法继续撤回`);
            }
            that.stopPlayerObserver();
            // 工程数据装载
            that.PMIXprojectLoader(undo);
            // 编辑器渲染
            that.drawInitialProject(() => {
                that.projectSave();
                that.startPlayerObserver();
            });
        },
        // 工程重做（恢复）
        projectRedo() {
            const that = this;
            let redo = projectHistory.redo();
            if (!redo) {
                return that.$toast(`无法继续恢复`);
            }
            that.stopPlayerObserver();
            // 工程数据装载
            that.PMIXprojectLoader(redo);
            // 编辑器渲染
            that.drawInitialProject(() => {
                that.projectSave();
                that.startPlayerObserver();
            });
        },
        // 绘制时间轴刻度
        drawAxisMark() {
            const that = this;
            let result = [];
            let axisGap = that.axisGap;
            if (this.PMIXprojectData.page.duration > 0) {
                // 刻度轴默认增加 30 秒
                let duration = this.PMIXprojectData.page.duration;
                let $trackBody = document.querySelector(`.tracks-body`);
                if (!$trackBody) return;
                if (util.fix(that.timeToExtent(duration)) < $trackBody.clientWidth - 100) {
                    duration = that.extentToTime($trackBody.clientWidth - 100);
                }
                let length = Math.ceil((duration / 1000) / axisGap.accuracy) * 2 + 1;
                for (let i = 0; i < length; i++) {
                    let gap = i * axisGap.gap;
                    let data = {
                        left: `${gap}px`,
                        height: `${i % 2 == 0 ? 10 : 8}px`,
                        time: i % 2 == 0 ? util.timeStampTransform(i / 2 * axisGap.accuracy * 1000) : ``,
                    };
                    result.push(data);
                }
            }
            let localAxisgap = JSON.parse(localStorage.getItem(`product_axisgap`));
            if (util.isObject(localAxisgap)) {
                localAxisgap[that.projectInfo.id] = JSON.stringify(that.axisGap);
            } else {
                localAxisgap = {[that.projectInfo.id]: JSON.stringify(that.axisGap)};
            }
            localStorage.setItem("product_axisgap", JSON.stringify(localAxisgap));
            that.timelineAxis = result;
        },
        // 绘制轨道
        drawTracks() {
            const that = this;
            let result = [];
            let project = that.PMIXprojectData;
            // 遍历轨道数组，并查找到轨道内对应的元素对象，生成渲染的数组
            if (Array.isArray(project.tracks) && Array.isArray(project.elements)) {
                project.tracks.forEach(track => {
                    let newElemList = [];
                    let isMaster = track.type === `master`;
                    let fragmentstart = [];
                    let fragmentending = [];
                    // 查找对应普通元素对象
                    let elemList = project.elements.filter(i => i.track === track.id);
                    elemList.forEach(item => {
                        let elem = util.deepClone(item);
                        if (isNaN(elem.inTime) || isNaN(elem.outTime)) {
                            return;
                        }
                        if (elem.outTime - elem.inTime < 100) {
                            return;
                        }
                        // 片头片尾额外处理
                        if (isMaster) {
                            if (elem.classify === `fragmentstart`) {
                                fragmentstart.push(item);
                                return;
                            }
                            if (elem.classify === `fragmentending`) {
                                fragmentending.push(item);
                                return;
                            }
                        }
				        let mediaData = elem.media;
                        let type = elem.group ? `group` : elem.type;
                        let style = {
                            top: 0,
                            left: that.timeToExtent(elem.inTime),
                            width: that.timeToExtent(elem.outTime - elem.inTime),
                        };
                        // 各元素展示差异
                        let $div = document.createElement(`div`);
                        let anim = elem.animate;
                        let animateMarker = ``;
                        if (anim.animation.length) {
                            // 循环动画
                            if (anim.iterations === Infinity) {
                                animateMarker = `<div class="animate-marker"><sub class="infinity"></sub></div>`;
                            } else {
                                let inMarker = ``;
                                let outMarker = ``;
                                anim.animation.forEach(item => {
                                    let effect = effects[item.name];
                                    if (!effect) {
                                        return;
                                    }
                                    switch (effect.type) {
                                        case `in`:
                                            inMarker = `<sub class="in" style="width: ${item.offset * 100}%"></sub>`;
                                            break;
                                        case `out`:
                                            outMarker = `<sub class="out" style="width: ${item.offset * 100}%"></sub>`;
                                            if (that.getElementAnimateType(elem.animate) === `inAndout`) {
                                                outMarker = `<sub class="out" style="width: ${100 - item.offset * 100}%"></sub>`;
                                            }
                                            break;
                                    }
                                });
                                animateMarker = `<div class="animate-marker">${inMarker}${outMarker}</div>`;
                            }
                        }
                        switch (type) {
                            case `text`:
                                style.backgroundColor = `#FF6263`;
                                $div.innerHTML = elem.content;
                                $div.innerHTML = `${animateMarker}<span class="name">${$div.textContent || "输入文字内容"}</span>`;
                                break;
                            case `image`:
                                // 主轨道图片
                                if (track.type === `master`) {
                                    style.backgroundImage = `url(${elem.src})`;
                                    style.backgroundSize = `contain`;
                                    style.backgroundRepeatX = `repeat`;
                                } else {
                                    style.backgroundColor = `#17D0BC`;
                                    $div.innerHTML = `${animateMarker}<img class="cover" src="${elem.src}" />`;
                                }
                                break;
                            case `shape`:
                                // 主轨道空白片段
                                if (track.type === `master`) {
                                    style.backgroundColor = elem.background.color;
                                } else {
                                    style.backgroundColor = `#766AF6`;
                                    $div.innerHTML = PElement().toHtml(elem);
                                    // 轨道上的形状不显示描边
                                    let svgEle = $div.querySelector(`svg`).cloneNode(true);
                                    let pathEle = svgEle.querySelectorAll(`path`);
                                    pathEle.forEach(path => {
                                        path.setAttribute('stroke-width', 0);
                                    });
                                    $div.innerHTML = `${animateMarker}<img class="cover" src="${util.svgToBase64(svgEle)}" />`;
                                }
                                break;
                            case `audio`:
                                style.backgroundColor = `#156B4C`;
                                let audioframe = `</div><div class="frame-cover" style="width: ${that.timeToExtent(elem.outTime - elem.inTime)}; left: -${that.timeToExtent(mediaData.startTime)};"></div>`;
                                let audioFade = `${mediaData.fadeIn || mediaData.fadeOut ? `<div class="fade-cover" ${mediaData.fadeIn ? 'data-in': ''} ${mediaData.fadeOut ? 'data-out' : ''}></div>` : ''}`;
                                let mutedNode = (mediaData.muted || mediaData.volume === 0) ? `<span class="badge muted"><i class="iconfont iconshengyinguan"></i></span>` : ``;
                                let uploadMasking = ``;
                                if (elem.upload === `pending` && that.$task.get(elem.id).length) {
                                    uploadMasking = `<div class="prop-upload-masking"><p class="upload-process">${elem.title} 上传中: 0%</p></div>`;
                                    $div.innerHTML = `<i class="iconfont iconyinpin"></i>${uploadMasking}`;
                                } else if (elem.upload) {
                                    style.backgroundColor = `transparent`;
                                    uploadMasking = `<div class="prop-upload-fail"><span>${elem.title}</span> 上传失败，请 <a id="track-reupload" href="javascript:;">重新上传</a></div>`
                                    $div.innerHTML = `${uploadMasking}`;
                                } else {
                                    $div.innerHTML = `${uploadMasking}${mutedNode}${audioFade}${audioframe}<i class="iconfont iconyinpin"></i><span class="name">${elem.title}</span>`;
                                }
                                break;
                            case `video`:
                                // 主轨道视频显示图标
                                let _divcontent = ``;
                                if (track.type === `master` && elem.classify === `fragment`) {
                                    let videoframe = `<div class="frame-cover" style="width: ${that.timeToExtent(elem.outTime - elem.inTime)}; left: -${that.timeToExtent(mediaData.startTime)};"></div>`;
                                    let speedNode = mediaData.speed !== 1 ? `<span class="badge speed">${Number(mediaData.speed).toFixed(1)}x</span>` : ``;
                                    let mutedNode = (mediaData.muted || mediaData.volume === 0) ? `<span class="badge muted"><i class="iconfont iconshengyinguan"></i></span>` : ``;
                                    let filterNode = elem.filter.name ? `<span class="badge filter"><i class="iconfont iconlvjingxiantiao"></i></span>` : ``;
                                    let durationNode = `<span class="badge duration">${util.timeStampTransform((elem.outTime - elem.inTime))}</span>`;
                                    let uploadMasking = ``;
                                    if (elem.upload === `pending` && that.$task.get(elem.id).length) {
                                        uploadMasking = `<div class="prop-upload-masking"><p class="upload-process">${elem.title} 上传中: 0%</p></div>`;
                                    } else if (elem.upload) {
                                        uploadMasking = `<div class="prop-upload-fail"><span>${elem.title}</span>上传失败，请 <a id="track-reupload" href="javascript:;">重新上传</a></base-button></div>`
                                    }
                                    _divcontent = [videoframe, speedNode, mutedNode, filterNode, durationNode, uploadMasking].join("");
                                } else {
                                    style.backgroundColor = `#43BBF1`;
                                    _divcontent = `${animateMarker}<img class="cover" src="${elem.cover}" />`;
                                }
                                $div.innerHTML = _divcontent;
                                break;
                            case `group`:
                                // 定制组合中不是文本元素的不参与处理
                                if (elem.customize && elem.customize.id && elem.type !== `text`) {
                                    return;
                                }
                                // 当前组合已存在则跳过生成
                                if (!!newElemList.find(i => i.group === elem.group)) {
                                    return;
                                }
                                let groupArr = elemList.filter(i => i.group === elem.group);
                                let groupInTime = Math.min.apply(null, groupArr.map(i => i.inTime));
                                let groupOutTime = Math.max.apply(null, groupArr.map(i => i.outTime));
                                style.width = that.timeToExtent(groupOutTime - groupInTime);
                                style.left = that.timeToExtent(groupInTime);
                                // 定制组合
                                if (elem.customize && elem.customize.id) {
                                    style.backgroundColor = `#AE895C`;
                                    $div.innerHTML = elem.content;
                                    $div.innerHTML = `${animateMarker}<i class="iconfont icondongtaiwenben"></i><span class="name">${$div.textContent || `请输入内容`}</span>`;
                                } else {
                                    style.backgroundColor = `#F8C11B`;
                                    $div.innerHTML = `${animateMarker}<i class="iconfont iconzuhe"></i><span class="name">组合</span>`;
                                }
                                break;
                            case `line`:
                                style.backgroundColor = `#4166EA`;
                                break;
                        }
                        elem.TRACKSTYLE = style;
                        elem.CONTENT = $div.innerHTML;
                        elem.unableHandle = false;
                        newElemList.push(elem);
                    });
                    // 前置片头
                    if (fragmentstart.length) {
                        let elem = util.deepClone(fragmentstart[0]);
                        let startMinIn = Math.min.apply(null, fragmentstart.map(i => i.inTime));
                        let startMaxOut = Math.max.apply(null, fragmentstart.map(i => i.outTime));
                        let duration = startMaxOut - startMinIn;
                        let videoframe = `<div class="frame-cover" style="width: ${that.timeToExtent(duration)}; left: 0px;"></div>`;
                        let durationNode = `<span class="badge duration">${util.timeStampTransform(duration)}</span>`;
                        elem.TRACKSTYLE = {
                            top: 0,
                            left: 0,
                            width: that.timeToExtent(duration),
                            backgroundColor: validate(elem.fragment.frame).url() ? '' : '#000000'
                        };
                        elem.CONTENT = `${ videoframe }<i class="iconfont iconbofangcishu badge-icon"></i><span class="badge">片头</span>${durationNode}`;
                        elem.unableHandle = true;
                        newElemList.unshift(elem);
                    }
                    // 后置片尾
                    if (fragmentending.length) {
                        let elem = util.deepClone(fragmentending[0]);
                        let {frame} = elem.fragment;
                        let startMinIn = Math.min.apply(null, fragmentending.map(i => i.inTime));
                        let startMaxOut = Math.max.apply(null, fragmentending.map(i => i.outTime));
                        let duration = startMaxOut - startMinIn;
                        let videoframe = `<div class="frame-cover" style="width: ${that.timeToExtent(duration)}; left: 0px;"></div>`;
                        let durationNode = `<span class="badge duration">${util.timeStampTransform(duration)}</span>`;
                        elem.TRACKSTYLE = {
                            top: 0,
                            left: that.timeToExtent(startMinIn),
                            width: that.timeToExtent(duration),
                            backgroundColor: validate(frame).url() ? '' : '#000000'
                        };
                        elem.CONTENT = `${validate(frame).url() ? videoframe : ''}<i class="iconfont iconbofangcishu badge-icon"></i><span class="badge">片尾</span>${durationNode}`;
                        elem.unableHandle = true;
                        newElemList.push(elem);
                    }
                    // 主轨道 & 存在元素的轨道
                    if (isMaster || newElemList.length) {
                        // 转场效果列表生成
                        if (isMaster) {
                            let transitionList = [];
                            newElemList.sort((a, b) => a.inTime - b.inTime).forEach((item, index) => {
                                let prev = newElemList[index - 1];
                                // 检测是否支持设置转场
                                if (item.classify === `fragment` && prev && prev.classify === `fragment`) {
                                    // 查找是否存在转场动画
                                    let hasTransition = !!(item.inTransition && item.inTransition === prev.outTransition);
                                    if (hasTransition && project.transition.length > 0) {
                                        hasTransition = project.transition.find(i => i.id === item.inTransition);
                                        if (hasTransition.type === `overlap`) {
                                            item.TRACKSTYLE = Object.assign({
                                                "clipPath": `polygon(${that.timeToExtent(hasTransition.duration)} 0, 100% 0, 100% 100%, 0 100%, 0 100%)`
                                            }, item.TRACKSTYLE)
                                        }
                                    }
                                    transitionList.push({
                                        id: hasTransition ? hasTransition.id : "",
                                        in: item.id,
                                        out: prev.id,
                                        name: hasTransition ? hasTransition.name : "",
                                        type: hasTransition ? hasTransition.type : "normal",
                                        duration: hasTransition ? hasTransition.duration : 0,
                                        TRANSITIONSTYLE: {
                                            left: that.timeToExtent(item.inTime + (hasTransition && hasTransition.type === `overlap` ? hasTransition.duration / 2 : 0)),
                                        },
                                    });
                                }
                            });
                            that.transitionList = transitionList;
                        }
                        result.push({
                            id: track.id,
                            type: track.type,
                            track: newElemList,
                        });
                    }
                });
            }
            // 检测高度变化，更新模拟滚动条
            if (that.trackList.length !== result.length) {
                that.tracksScrollbarUpdate();
            }
            that.trackList = result;
            that.$nextTick(() => {
                // 生成帧图
                that.trackSliceFrame();
                // 生成波形图
                that.trackWaveform();
            });
        },


        /**
         * 工程监听类方法 ----------------------------------------------------------
         */
        // 播放器运行，并监听播放数据改变
        runningPlayer() {
            let vue = this;
            // 播放事件
            EditorPlayer.onplay = function () {
                vue.stopPlayerObserver();
                vue.unableSave = true;
                // 清除选中
                vue.selectedProp = "";
                if (vue.paused) {
                    vue.paused = false;
                }
            };
            // 暂停事件
            EditorPlayer.onpause = function () {
                vue.startPlayerObserver();
                vue.unableSave = false;
                // 清除选中
                vue.selectedProp = "";
                if (!vue.paused) {
                    vue.paused = true;
                    vue.PMIXMonitorPause();
                }
            };
            // 播放结束事件
            EditorPlayer.onended = function () {
                vue.startPlayerObserver();
                vue.unableSave = false;
                vue.paused = true;
            };
            // 播放进度改变事件
            let beforeBufferedplaying = false;
            let testTimes = [500, 1000, 1500, 2000];
            let testTimeIndex = 0;
            EditorPlayer.ontimeupdate = function () {
                vue.timelineCurrent = EditorPlayer.currentTime;
                vue.PMIXMonitorTimeupdate(vue.timelineCurrent, vue.paused, event => {
                    // 缓冲停止检测
                    if (event.type === `waiting`) {
                        if (event.wait) {
                            vue.playerBuffering = true;
                            beforeBufferedplaying = !vue.paused;
                            EditorPlayer.pause();
                            vue.$nextTick(()=>{
                                clearInterval(vue.timerPackage[`testTimer`]);
                                let testTime = testTimes[testTimeIndex] || testTimes[0];
                                testTimeIndex = testTimes.indexOf(testTime);
                                testTimeIndex++;
                                vue.timerPackage[`testTimer`] = setInterval(() => {
                                    if (!event.test(vue.timelineCurrent)) {
                                        clearInterval(vue.timerPackage[`testTimer`]);
                                        vue.playerBuffering = false;
                                        if (beforeBufferedplaying) {
                                            EditorPlayer.play();
                                        }
                                    }
                                }, testTime);
                            })
                        }
                    }
                });
                if (!vue.paused) {
                    vue.scrollToSeek();
                }
            };
            // 时长改变事件
            EditorPlayer.ondurationchange = function () {
                vue.drawAxisMark();
            };
            // 速率改变事件
            EditorPlayer.onspeed = function () {
                vue.PMIXMonitorSpeed(EditorPlayer.speed);
            };
            // 播放器状态改变事件
            EditorPlayer.onplaystate = function () {
                // vue.unableEdit = EditorPlayer.playState === `running`;
            };
        },
        // 开始播放器观察者
        startPlayerObserver() {
            const that = this;
            let $page = that.PMIXpage();
            if (!that.playerObserver && $page) {
                // 文档观察者过滤无修改
                let filterAttr = [`out-range`, `checked`, `clipping`];
                let pass = function (mutationList) {
                    let flag = true;
                    for (let i = 0; i < mutationList.length; i++) {
                        let item = mutationList[i];
                        // 过滤状态属性修改
                        if (filterAttr.includes(item.attributeName)) {
                            continue;
                        }
                        // 过滤动态生成滤镜效果
                        if (item.target === $page.querySelector(`.page-elements`) && item.type === `attributes` && item.attributeName === `style`) {
                            continue;
                        }
                        // 过滤转场canvas
                        if (item.target === $page.querySelector(`#transition`)) {
                            continue;
                        }
                        flag = false;
                        break;
                    }
                    return flag;
                }
                // 创建文档观察者
                let drawDebounceTimer = null;
                let mutationObserver = new MutationObserver((mutationList, observer) => {
                    // 过滤不触发更新的节点操作
                    if (pass(mutationList)) {
                        return;
                    }
                    // 新增元素
                    let isAdded = mutationList.some(i => i.target === $page.querySelector(`.page-elements`) && i.type === `childList` && i.addedNodes.length > 0);
                    // 删除元素
                    let isRemove = mutationList.some(i => i.target === $page.querySelector(`.page-elements`) && i.type === `childList` && i.removedNodes.length > 0);
                    // 新增或删除元素触发 主轨道重排
                    if (isRemove) {
                        that.masterTrackPropCloser();
                    }
                    /**
                     * 更新绘制
                     */
                    clearTimeout(drawDebounceTimer);
                    drawDebounceTimer = setTimeout(() => {
                        let project = that.PMIXprojectToData();
                        // 更新视频时长
                        project.page.duration = Math.max.apply(null, project.elements.map(i => i.outTime).concat([0]));
                        // 更新轨道，清除空轨道（主轨道除外）
                        project.tracks = project.tracks.filter(item => {
                            let notEmpty = !!project.elements.find(i => i.track === item.id);
                            let isMaster = item.type === `master`;
                            return isMaster || notEmpty;
                        });
                        // 按 音频 -> 主轨道 -> 元素轨道 顺序排序
                        project.tracks = project.tracks.sort((a, b) => {
                            if (a.type === `audio` && b.type === `audio`) return 0;
                            if (a.type === `audio`) return -1;
                            if (b.type === `audio`) return 1;
                            if (a.type === `master`) return -1;
                            if (b.type === `master`) return 1;
                            return 0;
                        });
                        // 调整主轨道元素在 elements 列表中的顺序（前排）
                        project.elements = project.elements.sort((a, b) => {
                            let isMaster = function (track) {
                                let m = project.tracks.find(i => i.type === `master`);
                                return m && m.id === track;
                            }
                            if (isMaster(a.track) && !isMaster(b.track)) return -1;
                            if (!isMaster(a.track) && isMaster(b.track)) return 1;
                            return 0;
                        });
                        // 更新转场效果数组
                        project.transition = project.transition.filter(item => {
                            return !!project.elements.find(i => i.outTransition === item.id || i.inTransition === item.id);
                        });
                        // 更新数据
                        let cloneProject = util.deepClone(that.PMIXprojectData);
                        that.PMIXprojectData = project;
                        that.$nextTick(() => {
                            that.dataInjectPlayer();
                        });
                        // 差异对比，触发保存
                        if (JSON.stringify(cloneProject) === JSON.stringify(project)) {
                            return;
                        }
                        projectHistory.push(project);
                        that.projectSave();
                    }, 200);
                });
                // 运行文档观察者
                mutationObserver.observe($page, {
                    subtree: true,
                    attributeOldValue: true,
                    attributes: true,
                    characterData: true,
                    characterDataOldValue: true,
                    childList: true,
                });
                that.playerObserver = mutationObserver;
            }
        },
        // 停止播放器观察者
        stopPlayerObserver() {
            if (this.playerObserver && this.playerObserver.constructor === MutationObserver) {
                this.playerObserver.disconnect();
                this.playerObserver = null;
            }
        },


        /**
         * 事件监听类方法 ----------------------------------------------------------
         */
        // 全局绑定事件
        globalEventListener() {
            const that = this;
            if (!window || !document) {
                return;
            }
            window.onresize = util.debounce(this.resizeEventListener, 30, true);
            window.onkeydown = this.keydownEventListener;
            window.onmousedown = this.mousedownEventListener;
            window.oncontextmenu = this.contextmenuEventListener
            if (util.deviceENV().firefox) {
                window.addEventListener("DOMMouseScroll", this.mousewheelEventListener, { passive: false });
            } else {
                window.addEventListener("mousewheel", this.mousewheelEventListener, { passive: false });
            }
            document.oncopy = this.copyEventListener;
            document.oncut = this.cutEventListener;
            document.onpaste = util.debounce(this.pasteEventListener, 100, true);
            $(document).on({
                dragenter: event => this.dropEventListener(event, `dragenter`),
                dragover: event => this.dropEventListener(event, `dragover`),
                dragleave: event => this.dropEventListener(event, `dragleave`),
                drop: event => this.dropEventListener(event, `drop`)
            });
            // 全局中文输入法监听
            $(document).on(`compositionstart compositionend`, event => {
                if (event.type === `compositionstart`) {
                    that.isComposition = true;
                } else {
                    that.isComposition = false;
                }
            });
            // 编辑器文本选区保存
            document.onselectionchange = event => {
                // 更新左侧栏富文本数据
                if (this.$refs.formatbar) this.$refs.formatbar.getRichTextInfo(true);
            };
            // 剪切板状态判断
            this.clipboardAvailable();
            // 元素构造对象删除方法监听
            PElement().deleteListener(elem => {
                this.deleteFragmentStartListener(elem);
            })
            // 轨道上传失败，重新上传点击事件
            $(document).on(`click`, `#track-reupload`, event => {
                this.trackPropDelete();
                $(`#trackUploadBtn`).trigger(`click`);
            })
        },
        // 浏览器窗口尺寸调整事件
        resizeEventListener(event) {
            const that = this;
            if (!that.readyDone) {
                return;
            }
            if ($(`.operate-main`).hasClass(`clip-image`)) {
                return;
            }
            that.ECMIXcancelSelect();
            that.PMIXautoSuit();
            that.initCanvasGrid();
        },
        // 全局鼠标滚轮事件
        mousewheelEventListener(event) {
            const that = this;
            const alt = event.altKey;
            const ctrl = event.ctrlKey || event.metaKey;
            const shift = event.shiftKey;
            // 阻止浏览器缩放
            if (ctrl) {
                event.preventDefault();
            }
            if (alt) {
                // Alt + 滚轮上下  ->  轨道左右滚动
                if ($(event.target).is(`.timeline-wrap`) || !!$(event.target).parents(`.timeline-wrap`).length) {
                    event.preventDefault();
                    that.trackHorizontalScroll(that.trackHorizontalScroll() + (event.deltaY > 0 ? 20 : -20));
                }
            }
        },
        // 全局鼠标按键事件
        mousedownEventListener(event) {
            const that = this;
            const alt = event.altKey;
            const ctrl = event.ctrlKey || event.metaKey;
            const shift = event.shiftKey;
            const $target = $(event.target);
            // 阻止文本进入编辑
            if (event.button === 2) {
                event.preventDefault();
            }
            // 右键面板处理
            if (!$target.closest(`#operate-contextmenu`).length) {
                that.ECMIXremoveContextMenu();
            }
        },
        // 全局右键事件
        contextmenuEventListener(event) {
            event.preventDefault();
            const that = this;
            const alt = event.altKey;
            const ctrl = event.ctrlKey || event.metaKey;
            const shift = event.shiftKey;
            const $target = $(event.target);
            const $menu = $(`#operate-contextmenu`);
            if (!that.useContextmenu) {
                return;
            }
            if ($target.closest($menu).length) {
                return;
            }
            that.useContextmenu = true;
            let top = event.pageY;
            let left = event.pageX;
            let showContextmenu = false;
            // 编辑器
            if ($target.parents(`#editor-window`).length) {
                // 画布右键
                if ($target.closest(`#editor-call-element`).length) {
                    that.ECMIXcancelSelect();
                }
                // 元素右键
                if ($target.parents(`.page-elements`).length) {
                    showContextmenu = true;
                    let _Pelem = PElement($target[0]);
                    if (!_Pelem.selected) {
                        that.ECMIXcancelSelect();
                    }
                    that.ECMIXsetSelect($target[0], {
                        asyncGroup: !_Pelem.selected
                    });
                }
                // 操作框右键
                if ($target.parents(`#operate-main`).length) {
                    showContextmenu = true;
                }
            }
            let Pelem = PElement().getSelected();
            if (showContextmenu) {
                // 按需显示右键菜单
                that.contextmenu.forEach(item => {
                    let children = item.children;
                    children.forEach(jtem => {
                        switch (jtem.title) {
                            case `取消组合`:
                                jtem.show = !!(!Pelem.lock && !Pelem.multi && Pelem.group && Pelem.canSplit);
                                break;
                            case `组合`:
                                jtem.show = !!(!Pelem.lock && Pelem.multi);
                                break;
                            case `剪切`:
                                jtem.show = !Pelem.lock;
                                break;
                            case `复制`:
                                jtem.show = !Pelem.lock;
                                break;
                            case `全选`:
                                jtem.show = !Pelem.lock;
                                break;
                            case `置于顶层`:
                                jtem.show = !Pelem.lock;
                                break;
                            case `置于底层`:
                                jtem.show = !Pelem.lock;
                                break;
                            case `上移一层`:
                                jtem.show = !Pelem.lock;
                                break;
                            case `下移一层`:
                                jtem.show = !Pelem.lock;
                                break;
                            case `锁定`:
                                jtem.show = !Pelem.lock;
                                break;
                            case `删除`:
                                jtem.show = !Pelem.lock;
                                break;
                            case `解锁`:
                                jtem.show = Pelem.lock;
                                break;
                        }
                    });
                    item.show = children.some(i => i.show);
                });
                setTimeout(() => {
                    $menu.css({
                        top: top,
                        left: left,
                    });
                }, 10);
            } else {
                that.ECMIXremoveContextMenu();
            }
        },
        // 全局按键按下事件
        keydownEventListener(event) {
            const that = this;
            let alt = event.altKey;
            let ctrl = event.ctrlKey || event.metaKey;
            let shift = event.shiftKey;
            let aCtrl = ctrl && !shift && !alt;
            let aShift = !ctrl && shift && !alt;
            let aAlt = !ctrl && !shift && alt;
            let ctrlAndShift = ctrl && shift && !alt;
            let ctrlAndAlt = ctrl && !shift && alt;
            let shiftAndAlt = !ctrl && shift && alt;
            let a = !ctrl && !alt && !shift;
            let code = event.keyCode;
            let $target = $(event.target);
            let $active = $(document.activeElement);
            let focusEditable = $active.is(`[contenteditable="true"]`) && (!!$active.parents(`#editor-window`).length);
            let focusInput = $active.is(`input`);
            let focusTextarea = $active.is(`textarea`);
            let focusEditor = !focusEditable && !focusInput && !focusTextarea && !that.unableEdit && ($active.is(`body`) || (that.selectedProp && !that.isCheckFromTrack));
            let focusTrack = !focusEditable && !focusInput && !focusTextarea && ($active.is(`#editor-tracks`) || that.selectedProp);
            that.isLongKeyPress = that.isLongKeyPress + 1;
            // 阻止浏览器功能默认功能
            if (ctrl && [189, 187, 109, 107, 61, 173, 83, 71, 70].includes(code) || aAlt) {
                event.preventDefault();
            }
            switch (true) {
                case code === 122: // F11 禁用全屏按键
                    event.preventDefault();
                    break;
                case a && code === 27: // esc退出
                    break;
                case a && code === 32: // space
                    // 播放 / 暂停
                    if (focusTrack || $active.is(`body`)) {
                        that.projectPlayToggle();
                    }
                    break;
                case aCtrl && code === 83: // Ctrl + S 保存
                    that.projectSave(() => {
                        that.$toast(`保存成功`);
                    });
                    break;
                case aCtrl && code === 65: // Ctrl + A 全选
                    if (focusInput || focusEditable || focusTextarea) {
                        break;
                    } else {
                        // 非输入控件聚焦，禁止全选
                        event.preventDefault();
                    }
                    // 元素全选
                    if ($active.is(`body`) || !!$active.parents(`.center-wrap`).length) {
                        that.ECMIXcancelSelect();
                        that.ECMIXsetSelectAll();
                    }
                    break;
                case aCtrl && code === 70: // Ctrl + F 播放器全屏播放 / 退出全屏
                    if (focusTrack || $active.is(`body`)) {
                        that.projectFullToggle();
                    }
                    break;
                case aCtrl && code === 71: // Ctrl + G 组合
                    if (focusEditor) {
                        that.ECMIXsetGroup();
                    }
                    break;
                case code === 13:  // 换行
                    if (focusEditable) {
                        $active.css({whiteSpace: `normal`, wordBreak: `break-word`});
                        document.execCommand('formatBlock', false, 'p');
                    }
                    break;
                case aCtrl && code === 66: // Ctrl + B 加粗 | 轨道分割
                    // 富文本
                    if (focusEditable || focusEditor) {
                        richText.execCommand('bold');
                    } else {
                        // 轨道元素分割
                        that.trackPropCutting();
                    }
                    break;
                case aCtrl && code === 73: // Ctrl + I 斜体 | 导入媒体、图像
                    if (focusEditable || focusEditor) {
                        event.preventDefault();
                        richText.execCommand('italic');
                    } else {
                        $(`#trackUploadBtn`).trigger(`click`);
                        event.preventDefault();
                    }
                    break;
                case aCtrl && code === 85: // Ctrl + U 下划线
                    if (focusEditable || focusEditor) {
                        event.preventDefault();
                        richText.execCommand('underline');
                    }
                    break;
                case aCtrl && code === 38: // Ctrl + ↑ 增大行高
                    if (focusEditable || focusEditor) {
                        event.preventDefault();
                        richText.execCommand('lineHeight', richText.getInfo().lineHeight + 0.1);
                    }
                    break;
                case aCtrl && code === 40: // Ctrl + ↓ 缩小行高
                    if (focusEditable || focusEditor) {
                        event.preventDefault();
                        richText.execCommand('lineHeight', richText.getInfo().lineHeight - 0.1 < 0 ? 0 : richText.getInfo().lineHeight - 0.1);
                    }
                    break;
                case aCtrl && code === 37: // Ctrl + ← 居左
                    if (focusEditable || focusEditor) {
                        event.preventDefault();
                        richText.execCommand('align', 'justifyLeft');
                    }
                    break;
                case aCtrl && code === 191: // Ctrl + / 居中
                    if (focusEditable || focusEditor) {
                        event.preventDefault();
                        richText.execCommand('align', 'justifyCenter');
                    }
                    break;
                case aCtrl && code === 39: // Ctrl + → 居右
                    if (focusEditable || focusEditor) {
                        event.preventDefault();
                        richText.execCommand('align', 'justifyRight');
                    }
                    break;
                case aCtrl && code === 68: // Ctrl + D 复制并粘贴
                    event.preventDefault();
                    that.copyEventListener(event, true);
                    break;
                case ctrlAndShift && code === 71: // Ctrl + Shift + G 解除组合
                    if (focusEditor) {
                        that.ECMIXsetGroup(false);
                    }
                    break;
                case a && code === 37: // ← 元素移动 | 元素时间调整
                    // 元素移动
                    if (focusEditor) {
                        event.preventDefault();
                        that.ECMIXsetTranslate({ x: that.isLongKeyPress > 10 ? -20 : -1 });
                    } else if (focusTrack && that.selectedProp) {
                        // 轨道元素进场时间移动
                        event.preventDefault();
                        let Pelem = PElement(`#${that.selectedProp}`).getGroup();
                        let PelemInfo = Pelem.getInformation();
                        let usableTimeFrame = that.trackUsableTimeFrame(PelemInfo, true);
                        // 对主轨道无效
                        if (!usableTimeFrame.isMaster) {
                            EditorPlayer.currentTime -= 100;
                            Pelem.moveTime(util.NumberRange(PelemInfo.inTime - 100, usableTimeFrame.minInTime));
                        }
                    }
                    break;
                case a && code === 38: // ↑ 元素移动
                    if (focusEditor) {
                        event.preventDefault();
                        that.ECMIXsetTranslate({ y: that.isLongKeyPress > 10 ? -20 : -1 });
                    }
                    break;
                case a && code === 39: // → 元素移动 | 元素时间调整
                    if (focusEditor) {
                        event.preventDefault();
                        that.ECMIXsetTranslate({ x: that.isLongKeyPress > 10 ? 20 : 1 });
                    } else if (focusTrack && that.selectedProp) {
                        // 轨道元素进场时间移动
                        event.preventDefault();
                        let Pelem = PElement(`#${that.selectedProp}`).getGroup();
                        let PelemInfo = Pelem.getInformation();
                        let usableTimeFrame = that.trackUsableTimeFrame(PelemInfo, true);
                        // 对主轨道无效
                        if (!usableTimeFrame.isMaster) {
                            EditorPlayer.currentTime += 100;
                            Pelem.moveTime(util.NumberRange(PelemInfo.inTime + 100, undefined, usableTimeFrame.maxOutTime - (PelemInfo.outTime - PelemInfo.inTime)));
                        }
                    }
                    break;
                case a && code === 40: // ↓ 元素移动
                    if (focusEditor) {
                        event.preventDefault();
                        that.ECMIXsetTranslate({ y: that.isLongKeyPress > 10 ? 20 : 1 });
                    }
                    break;
                case ctrlAndShift && code === 38: // Ctrl + Shift + ↓ 置于顶层
                    if (focusEditor) {
                        that.ECMIXsetLevelTop();
                    }
                    break;
                case ctrlAndShift && code === 40: // Ctrl + Shift + ↓ 置于底层
                    if (focusEditor) {
                        that.ECMIXsetLevelBottom();
                    }
                    break;
                case ctrlAndAlt && code === 38: // Ctrl + Alt + ↑ 上移一层
                    if (focusEditor) {
                        that.ECMIXsetLevelUp();
                    }
                    break;
                case ctrlAndAlt && code === 40: // Ctrl + Alt + ↓ 下移一层
                    if (focusEditor) {
                        that.ECMIXsetLevelDown();
                    }
                    break;
                case aShift && code === 37: // Shift + ← 播放器上一秒 | 元素移动
                    if (focusEditor) {
                        that.ECMIXsetTranslate({ x: -10 });
                    } else if (focusTrack) {
                        that.ECMIXcancelSelect();
                        EditorPlayer.pause();
                        EditorPlayer.currentTime -= 1000;
                    }
                    break;
                case aShift && code === 38: // Shift + ↑ 播放器上一个片段 | 元素移动
                    if (focusEditor) {
                        that.ECMIXsetTranslate({ y: -10 });
                    } else if (focusTrack) {
                        that.ECMIXcancelSelect();
                        that.projectToFragment(`prev`);
                    }
                    break;
                case aShift && code === 39: // Shift + → 播放器下一秒 | 元素移动
                    if (focusEditor) {
                        that.ECMIXsetTranslate({ x: 10 });
                    } else if (focusTrack) {
                        that.ECMIXcancelSelect();
                        EditorPlayer.pause();
                        EditorPlayer.currentTime += 1000;
                    }
                    break;
                case aShift && code === 40: // Shift + ↓ 播放器下一个片段 | 元素移动
                    if (focusEditor) {
                        that.ECMIXsetTranslate({ y: 10 });
                    } else if (focusTrack) {
                        that.ECMIXcancelSelect();
                        that.projectToFragment(`next`);
                    }
                    break;
                case ctrlAndShift && code === 77: // Ctrl + Shift + M 播放器静音
                    event.preventDefault();
                    if (focusTrack) {
                        that.projectSetMuted();
                    }
                    break;
                case a && code === 36: // Home 播放器跳到开始
                    if (focusTrack || $active.is(`body`)) {
                        EditorPlayer.pause();
                        EditorPlayer.currentTime = 0;
                        that.trackHorizontalScroll(0);
                    }
                    break;
                case a && code === 35: // End 播放器跳到结束
                    if (focusTrack || $active.is(`body`)) {
                        EditorPlayer.pause();
                        EditorPlayer.currentTime = EditorPlayer.duration;
                        that.scrollToSeek();
                    }
                    break;
                case a && [46, 8].includes(code): // delete backspace 删除
                    if (focusEditor) {
                        // 画布元素删除（不可删除锁定元素）
                        that.ECMIXdelete();
                    } else if (focusTrack) {
                        // 轨道元素删除（可删除锁定元素）
                        that.trackPropDelete();
                    }
                    break;
                case ctrlAndAlt && [97, 49, 98, 50, 99, 51].includes(code): // Ctrl + Alt + 1 左对齐 | Ctrl + Alt + 2 水平居中 | Ctrl + Alt + 3 右对齐
                    let Hkey = ``;
                    if (code === 97 || code === 49) {
                        Hkey = `left`;
                    } else if (code === 98 || code === 50) {
                        Hkey = `center`;
                    } else if (code === 99 || code === 51) {
                        Hkey = `right`;
                    }
                    if (focusEditor) {
                        that.ECMIXsetAlign(Hkey, `horizontal`);
                        event.preventDefault();
                    }
                    break;
                case ctrlAndShift && [85, 73, 79].includes(code): // Ctrl + shift + U 顶对齐 | Ctrl + shift + I 垂直居中 | Ctrl + shift + O 底对齐
                    let Vkey = ``;
                    if (code === 85) {
                        Vkey = `top`;
                    } else if (code === 73) {
                        Vkey = `center`;
                    } else if (code === 79) {
                        Vkey = `bottom`;
                    }
                    if (focusEditor) {
                        that.ECMIXsetAlign(Vkey, `vertical`);
                        event.preventDefault();
                    }
                    break;
                case aCtrl && code === 90: // Ctrl + Z 撤回
                    if (focusEditor || focusTrack || focusEditable) {
                        event.preventDefault();
                        that.projectUndo();
                    }
                    break;
                case aCtrl && code === 89: // Ctrl + Y 恢复
                    if (focusEditor || focusTrack || focusEditable) {
                        event.preventDefault();
                        that.projectRedo();
                    }
                    break;
                case aCtrl && [107, 187].includes(code): // Ctrl + + 画布放大
                    that.$refs.pagescale && that.$refs.pagescale.setScale(`add`);
                    break;
                case aCtrl && [109, 189].includes(code): // Ctrl + - 画布缩小
                    that.$refs.pagescale && that.$refs.pagescale.setScale(`reduce`);
                    break;
                case aCtrl && [96, 48].includes(code): // Ctrl + 0 画布自适应
                    that.$refs.pagescale && that.$refs.pagescale.setAutoScale();
                    break;
                case aCtrl && [97, 49].includes(code): // Ctrl + 1 画布尺寸100%
                    that.$refs.pagescale && that.$refs.pagescale.setScale(1);
                    break;
                case aAlt && [107, 187].includes(code): // Alt + + 轨道放大
                    that.scaleAxis(`add`);
                    break;
                case aAlt && [109, 189].includes(code): // Alt + - 轨道缩小
                    that.scaleAxis(`reduce`);
                    break;
                case aAlt && [96, 48].includes(code):  // Alt + 0 轨道适应屏幕
                    that.scaleAxis();
                    break;
                case aAlt && [97, 49].includes(code):  // Alt + 1 轨道展开/收起
                    if (that.tracksVerticalScrollbar.height < 100 || that.trackPull) {
                        that.tracksPanelPullToggle();
                    }
                    break;
            }
            // 当前节点绑定弹起事件
            $target.on(`keyup`, uevent => {
                that.isLongKeyPress = 0;
                $target.off(`keyup`);
                alt = uevent.altKey;
                ctrl = uevent.ctrlKey || uevent.metaKey;
                shift = uevent.shiftKey;
                aCtrl = ctrl && !shift && !alt;
                aShift = !ctrl && shift && !alt;
                aAlt = !ctrl && !shift && alt;
                ctrlAndShift = ctrl && shift && !alt;
                ctrlAndAlt = ctrl && !shift && alt;
                shiftAndAlt = !ctrl && shift && alt;
                a = !ctrl && !alt && !shift;
                code = uevent.keyCode;
                switch (true) {
                    case a && [46, 8].includes(code): // delete backspace 删除
                        if (focusEditable) {
                            // 富文本空内容去除
                            if (!$target.text() && $target.find(`br`).length === 1) {
                                $target.text("");
                            }
                        }
                        break;
                }
            });
        },
        // 全局复制事件
        copyEventListener(event, needPaste) {
            const that = this;
            let $active = $(document.activeElement);
            let focusEditable = $active.is(`[contenteditable="true"]`) && (!!$active.parents(`#editor-window`).length);
            let focusInput = $active.is(`input`);
            let focusTextarea = $active.is(`textarea`);
            let focusEditor = !focusEditable && !focusInput && !focusTextarea && $active.is(`body`) && !that.unableEdit;
            let focusTrack = !focusEditable && !focusInput && !focusTextarea && $active.is(`#editor-tracks`);
            // 画布元素复制
            if (focusEditor) {
                that.ECMIXcopy();
            }
            // 轨道元素复制
            if (focusTrack && that.selectedProp) {
                PElement(`#${that.selectedProp}`).getGroup().copy();
            }
            // 剪切板状态判断
            that.clipboardAvailable();
            that.playerTimeUpdated = false;
            if (needPaste) {
                that.pasteEventListener(new ClipboardEvent(`paste`));
            }
        },
        // 全局剪切事件
        cutEventListener(event) {
            const that = this;
            let $active = $(document.activeElement);
            let focusEditable = $active.is(`[contenteditable="true"]`) && (!!$active.parents(`#editor-window`).length);
            let focusInput = $active.is(`input`);
            let focusTextarea = $active.is(`textarea`);
            let focusEditor = !focusEditable && !focusInput && !focusTextarea && $active.is(`body`) && !that.unableEdit;
            let focusTrack = !focusEditable && !focusInput && !focusTextarea && $active.is(`#editor-tracks`);
            // 画布元素剪切
            if (focusEditor) {
                that.ECMIXcut();
            }
            // 轨道元素剪切
            if (focusTrack && that.selectedProp) {
                let Pelem = PElement(`#${that.selectedProp}`).getGroup()
                Pelem.copy();
                Pelem.delete();
                that.ECMIXcancelSelect();
            }
            that.clipboardAvailable();
        },
        // 全局粘贴事件
        pasteEventListener(event) {
            const that = this;
            let result = that.clipboardDataHandle(event.clipboardData);
            let $active = $(document.activeElement);
            let focusEditable = $active.is(`[contenteditable="true"]`) && (!!$active.parents(`#editor-window`).length);
            let focusInput = $active.is(`input`);
            let focusTextarea = $active.is(`textarea`);
            let focusEditor = !focusEditable && !focusInput && !focusTextarea && $active.is(`body`) && !that.unableEdit;
            let focusTrack = !focusEditable && !focusInput && !focusTextarea && $active.is(`#editor-tracks`);
            // 元素粘贴
            if ((focusEditor || focusTrack) && result.text) {
                // 粘贴元素，在被复制元素的元素后放置,如果不够位置,则放置最后
                if (result.text.indexOf(baseConfig.COPYMARK) === 0) {
                    let selectedProp = that.selectedProp;
                    let isCheckFromTrack = that.isCheckFromTrack;
                    let groupMap = {};
                    that.trackClearSelect();
                    let append = pelem => {
                        let PelemInfo = pelem.getInformation();
                        let isGroup = pelem.group && groupMap[pelem.group]
                        if (PelemInfo.track) {
                            let findTrack = that.trackList.find(i => i.id === PelemInfo.track);
                            // 从主轨道复制，则插入到主轨道
                            if (findTrack && findTrack.type === `master`) {
                                that.PMIXpushToTrack(pelem, `master`, `master`);
                            } else if (!findTrack && !isGroup) {
                                that.PMIXpushToTrack(pelem, undefined, PelemInfo.inTime || that.timelineCurrent);
                            } else {
                                let time = `current`;
                                let track = undefined;
                                // 组合处理
                                if (!isGroup) {
                                    if (!that.playerTimeUpdated && (isCheckFromTrack || !selectedProp)) {
                                        track = findTrack.id;
                                        time = PelemInfo.outTime;
                                        // 判断被复制元素后方是否有位置可以放置
                                        let elements = that.PMIXprojectData.elements.filter(i => i.track === track);
                                        let duration = PelemInfo.outTime - PelemInfo.inTime;
                                        let currentElement = elements.filter(i => (i.inTime >= PelemInfo.outTime && i.inTime < PelemInfo.outTime + duration) || (i.outTime > PelemInfo.outTime && i.outTime <= PelemInfo.outTime + duration));
                                        // 如果没有,向下新增轨道
                                        if (currentElement.length) {
                                            track = that.trackList.findIndex(i => i.id === track);
                                        }
                                    } else if (!that.playerTimeUpdated && !isCheckFromTrack) {
                                        time = PelemInfo.inTime;
                                    }
                                    if (pelem.group) {
                                        groupMap[pelem.group] = {track: track, time: time};
                                    }
                                } else {
                                    track = groupMap[pelem.group].track;
                                    time = groupMap[pelem.group].time;
                                }
                                that.PMIXpushToTrack(pelem, track, time);
                            }
                        }
                    }
                    let Pelems = PElement().paste(result.text, {transform: !that.playerTimeUpdated && !isCheckFromTrack});
                    Pelems.$element.forEach(item => {
                        append(PElement(item));
                    })
                } else if (result.text.indexOf(`<svg`) >= 0) {
                    that.trackClearSelect();
                    let shapeObject = PElement().direct(`shape`, `formatPasteData`, result.text);
                    let datastring = baseConfig.COPYMARK + JSON.stringify(shapeObject);
                    let Pelems = PElement().paste(datastring);
                    if (Pelems.group) {
                        that.PMIXpushToTrack(Pelems, undefined, `current`);
                    } else {
                        Pelems.$element.forEach(item => {
                            that.PMIXpushToTrack(PElement(item), undefined, `current`);
                        })
                    }
                    that.ECMIXsizeAdaptation(Pelems, 0.4);
                    Pelems.align(`deuce`, `horizontal`);
                } else {
                    // 粘贴纯文本，生成文本元素
                    let Pelem = PElement().append({
                        type: `text`,
                        content: baseElement.getTextHtmlTemplate(result.text),
                        width: that.PMIXprojectData.page.width / 2,
                    });
                    Pelem.direct(Pelem.type, `autoHeight`, Pelem.firstElement);
                    Pelem.align(`deuce`, `horizontal`);
                    that.PMIXpushToTrack(Pelem, undefined, `current`);
                }
            }
        },
        // 剪切板数据处理  DataTransfer构造函数对象
        clipboardDataHandle(DataTransfer) {
            let result = {
                text: ``,
                html: ``,
                files: [],
            };
            if (DataTransfer) {
                let text = DataTransfer.getData(`text/plain`);
                let html = DataTransfer.getData(`text/html`);
                // 获取文件
                if (DataTransfer.items.length) {
                    result.files = DataTransfer.items;
                }
                // 获取纯文本
                if (text) {
                    result.text = text;
                }
                // 获取html
                if (html) {
                    let clipboardTextPrefix = `<!--StartFragment-->`;
                    let clipboardTextSuffix = `<!--EndFragment-->`;
                    if (util.deviceENV().mac) {
                        clipboardTextPrefix = `<meta charset='utf-8'>`;
                        clipboardTextSuffix = ``;
                    }
                    let start;
                    let end;
                    if (html.indexOf(clipboardTextPrefix) > -1) {
                        start = html.indexOf(clipboardTextPrefix) + clipboardTextPrefix.length;
                    }
                    if (html.indexOf(clipboardTextSuffix) > 0) {
                        end = html.indexOf(clipboardTextSuffix);
                    }
                    result.html = html.slice(start, end);
                }
            }
            return result;
        },
        // 剪切板可访问判断
        clipboardAvailable() {
            if (navigator && navigator.clipboard) {
                navigator.clipboard.readText().then(res => {
                    if (res) {
                        this.canPaste = true;
                    } else {
                        this.canPaste = false;
                    }
                }).catch(err => {
                    this.canPaste = false;
                })
            } else {
                this.canPaste = false;
            }
        },
        // 全局拖拽事件
        dropEventListener(event, type) {
            event.preventDefault();
            const that = this;
            let $target = event.target;
            switch (type) {
                case `dragenter`:
                    break;
                case `dragover`:
                    break;
                case `dragleave`:
                    break;
                case `drop`:
                    that.trackUploadEvent(event.originalEvent.dataTransfer.files);
                    break;
            }
        },
        // 编辑器元素操作事件
        editorEventListener() {
            const that = this;
            // 画布操作事件
            let $wrap = document.querySelector("#editor-wrap");
            let $callEl = document.querySelector("#editor-call-element");
            if (util.deviceENV().firefox) {
                $wrap.addEventListener("DOMMouseScroll", this.pageEventMousewheel);
            } else {
                $wrap.addEventListener("mousewheel", this.pageEventMousewheel);
            }
            $wrap.addEventListener("mousedown", event => {
                // 右键
                if (event.button === 2) {
                    that.pageEventMousemove(event);
                }
            });
            $callEl.addEventListener("mousedown", event => {
                // 画布点击事件同步至播放器
                that.pageEventSyncEditor(event);
                // 左键
                if (event.button === 0) {
                    that.ECMIXcancelSelect();
                    that.pageEventSurface(event);
                }
            });
            $(document).on("mousedown", "#editor-wrap .element" ,event => {
                // 画布点击事件同步至播放器
                that.pageEventSyncEditor(event);
            })
            elementOperate.hoverEvent({
                handle: `#editor-wrap .editor-page .page-elements .element`,
                enter(event) {
                    const currentTarget = event.currentTarget;
                    let tPelem = PElement(currentTarget);
                    let tip = '';
                    if (tPelem.customize) {
                        tPelem = tPelem.getGroup();
                        tip = `双击编辑文字`;
                    }
                    if (currentTarget.getAttribute(`unable-pick`) === `unable-pick` && !tPelem.customize) return;
                    if (currentTarget.getAttribute(`checked`) === `checked`) return;
                    let rect = tPelem.getClientRectData();
                    elementOperate.setPreviewRect(currentTarget.getAttribute(`id`), rect, {lock: tPelem.lock, tip: tip});
                },
                leave(event) {
                    elementOperate.removePreviewRect();
                }
            })
            /**
             * 元素移动操作
             */
            // 单选组合元素内的子元素选中操作标识
            let selectGroupChild = false;
            elementOperate.moveEvent({
                handle: `#editor-wrap .editor-page .page-elements .element, #operate-main .operate-outline, #operate-main .operate-group-mask .child`,
                // 包含元素选中操作
                beforeDown(event, rect) {
                    const ctrl = event.ctrlKey;
                    const crttarget = event.currentTarget;
                    const $target = $(event.target);
                    let $editable = $target.closest(`[contenteditable="true"]`);
                    let isEditable = !!$editable.length;
                    let Pelem = PElement().getSelected();
                    // 锁定状态无法拖动
                    if (Pelem.lock) {
                        that.ECMIXcancelSelect();
                        elementOperate.enableDrag = false;
                    }
                    $(`.operate-preview`).remove();
                    $(`.operate-edit-tip`).hide();
                    // 触发元素判断
                    let jqcrttarget = $(crttarget);
                    switch (true) {
                        // 通过操作框操作框拖动，继续保持操作当前选中的元素
                        case jqcrttarget.hasClass(`operate-outline`):
                            break;
                        // 组合子元素操作框拖动
                        case jqcrttarget.hasClass(`child`):
                            // 禁止画布操作的元素
                            let elemId = jqcrttarget.attr(`id`);
                            if (elemId && $(`#${jqcrttarget.attr(`id`)}`).attr(`unable-page`)) {
                                break;
                            }
                            selectGroupChild = true;
                            // 多选并且ctrl键按下时 取消当前元素选中
                            if (Pelem.multi && ctrl) {
                                let groupId = jqcrttarget.attr(`data-group`);
                                if (groupId) {
                                    PElement(`[data-group=${groupId}]`).cancelSelect();
                                }
                                if (elemId) {
                                    PElement(`#${elemId}`).cancelSelect();
                                }
                                that.ECMIXresetOperateRect();
                            }
                            break;
                        // 直接操作元素
                        default:
                            let tPelem = PElement(crttarget);
                            // 没有元素时，可触发框选操作
                            if (!tPelem.$element.length) {
                                that.ECMIXcancelSelect();
                                that.pageEventSurface(event);
                                break;
                            }
                            // 锁定状态时，可触发框选操作，且阻止默认操作, 但可以选中
                            if (tPelem.lock) {
                                that.ECMIXcancelSelect();
                                that.pageEventSurface(event);
                                event.preventDefault();
                            }
                            // 点击已选中的元素，继续保持操作
                            if (Pelem.$element.includes(crttarget)) {
                                // 非ctrl键按下，单选组合元素
                                selectGroupChild = !ctrl && !Pelem.multi && !!Pelem.group;
                            } else {
                                let isMulti = !!Pelem.$element.length;
                                let elements = [crttarget];
                                // 非ctrl键多选，清除之前选中的元素
                                if (!ctrl || selectGroupChild) {
                                    that.ECMIXcancelSelect();
                                }
                                if (isMulti && ctrl) {
                                    elements = elements.concat(Pelem.$element);
                                }
                                selectGroupChild = false;
                                that.ECMIXsetSelect(elements, {ctrl: isMulti && ctrl});
                            }
                            // 点击文本域处理
                            if (isEditable) {
                                // 文本输入域聚焦后元素无法拖动
                                if ($editable.is(`:focus`) || tPelem.type === `text`) {
                                    // 并且：非多选、组合元素子元素、组合文本操作
                                    if ($editable.is(`:focus`) || (!tPelem.multi && (!tPelem.group || selectGroupChild) && !tPelem.customize)) {
                                        elementOperate.enableDrag = false;
                                    }
                                }
                                // 非聚焦情况下，组合元素、形状元素、ctrl键多选、非组合元素子元素操作 状态下 禁止聚焦编辑
                                if (!$editable.is(`:focus`) && (((ctrl || tPelem.group) && !selectGroupChild) || tPelem.customize)) {
                                    that.ECMIXcancelRanges();
                                    event.preventDefault();
                                }
                            }
                            break;
                    }
                },
                down(event, rect) {
                    let Pelem = PElement().getSelected();
                    if (!!Pelem.$element.length) {
                        // 获取画布吸附点
                        that.pageAutoFit(Pelem.$element);
                        // 显示网格
                        that.toggleGridDisplay(true);
                    }
                },
                beforeMove(event, rect) {
                    // 更新单选组合元素内的子元素操作的状态
                    const ctrl = event.ctrlKey;
                    let Pelem = PElement().getSelected();
                    // 锁定状态无法拖动
                    if (Pelem.lock) {
                        elementOperate.enableDrag = false;
                    }
                    // 非ctrl键按下，单选组合元素
                    if (!ctrl && !Pelem.multi && Pelem.group && Pelem.$element.length > 1) {
                        selectGroupChild = false;
                    }
                    that.ECMIXremoveFakeGRect();
                },
                move(event, rect, diff) {
                    let scale = that.PMIXPageScale.current;
                    that.ECMIXsetTranslate({
                        x: diff.x / scale,
                        y: diff.y / scale,
                    })
                    let Pelem = PElement().getSelected();
                    let fitX = that.setPageFit(rect, 'x');
                    let fitY = that.setPageFit(rect, 'y');
                    Pelem.$element.forEach(item => {
                        let itemRect = PElement(item).getClientRectData();
                        if (fitX) item.style.left = `${(itemRect.x - (rect.x - fitX)) / scale}px`;
                        if (fitY) item.style.top = `${(itemRect.y - (rect.y - fitY)) / scale}px`;
                    });
                },
                beforeUp(event, rect) {
                    const ctrl = event.ctrlKey;
                    let jqcrttarget = $(event.currentTarget);
                    if (jqcrttarget.hasClass(`child`)) {
                        let crttarget;
                        let groupId = jqcrttarget.attr(`data-group`);
                        if (groupId) {
                            crttarget = `[data-group=${groupId}]`;
                        }
                        let elemId = jqcrttarget.attr(`id`);
                        if (elemId) {
                            crttarget = `#${elemId}`;
                        }
                        let Pelem = PElement().getSelected();
                        // 未拖动并且非ctrl键按下操作
                        if (!ctrl && !elementOperate.dragged) {
                            // 单选组合元素内的子元素操作
                            if (!Pelem.multi && Pelem.group && selectGroupChild) {
                                that.ECMIXcancelSelect();
                                that.ECMIXsetSelect(crttarget, {
                                    asyncGroup: false,
                                    ctrl: ctrl
                                });
                                // 单选组合元素内的子元素操作后，更新操作框
                                that.ECMIXsetFakeGRect();
                            }
                            // 临时组合多选解除，单选点击的元素
                            if (Pelem.multi) {
                                that.ECMIXcancelSelect();
                                that.ECMIXsetSelect(crttarget, {ctrl: ctrl});
                            }
                        }
                    }
                },
                up(event, rect) {
                    // 清空画布参考线
                    that.pageReferencePoint = {x: [], y: []};
                    that.pageAutoFitPoint = {x: [], y: []};
                    // 显示网格
                    that.toggleGridDisplay()
                    // 单选组合元素内的子元素操作后，更新操作框
                    if (elementOperate.dragged && selectGroupChild) {
                        that.ECMIXsetFakeGRect();
                    }
                },
            });
            /**
             * 元素旋转操作
             */
            // 缓存元素旋转前的角度值
            let beforeRotateAngle = {};
            elementOperate.rotateEvent({
                handle: `#operate-main .operate-rotate`,
                setOrigin() {
                    return that.PMIXpage().getBoundingClientRect();
                },
                beforeDown(event, rect) {},
                down(event, rect) {
                    that.ECMIXremoveFakeGRect();
                    // 保存操作前的角度
                    let Pelem = PElement().getSelected();
                    if (Pelem.$element.length > 1) {
                        Pelem.$element.forEach(item => {
                            beforeRotateAngle[item.id] = PElement(item).getRectData().rotate;
                        });
                    }
                },
                beforeMove(event, rect) {},
                move(event, rect) {
                    let Pelem = PElement().getSelected();
                    // 多选旋转 && 组合旋转
                    if (Pelem.$element.length > 1) {
                        const scale = that.PMIXPageScale.current;
                        // 操作框相对于画布中心点
                        let middle = {
                            x: rect.x / scale + rect.width / scale / 2,
                            y: rect.y / scale + rect.height / scale / 2,
                        };
                        // 逐个计算角度与位置
                        Pelem.$element.forEach(item => {
                            let _Pelem = PElement(item);
                            let _PelemRect = _Pelem.getRectData();
                            let beforeAngle = beforeRotateAngle[item.id];
                            // 单个元素相对于画布中心点
                            let _PelemMiddle = {
                                x: _PelemRect.x + _PelemRect.width / 2,
                                y: _PelemRect.y + _PelemRect.height / 2,
                            };
                            // 计算旋转后的位置
                            let _angle = rect.rotate + beforeAngle - _PelemRect.rotate;
                            let afterMiddle = util.afterRotatePoint(_PelemMiddle, middle, _angle);
                            let left = afterMiddle.x - _PelemRect.width / 2;
                            let top = afterMiddle.y - _PelemRect.height / 2;
                            let deg = (beforeAngle + rect.rotate) % 360;
                            _Pelem.setAbsoluteTranslate({
                                x: left,
                                y: top,
                            }).setRotateAngle(deg);
                        });
                    } else {
                        Pelem.setRotateAngle(rect.rotate);
                    }
                    $(`.operate-rotate .rotate-degree`).html(rect.rotate + "°").css("transform", "rotate(" + -rect.rotate + "deg)").show();
                },
                beforeUp(event, rect) {},
                up(event, rect) {
                    $(`.operate-rotate .rotate-degree`).hide();
                    beforeRotateAngle = {};
                    that.ECMIXresetOperateRect();
                    // 单选组合元素内的子元素操作后，更新操作框
                    if (selectGroupChild) {
                        that.ECMIXsetFakeGRect();
                    }
                },
            });
            /**
             * 元素缩放操作
             */
            elementOperate.resizeEvent({
                handle: `#operate-main .operate-resizable .resize-handle`,
                setOrigin() {
                    return that.PMIXpage().getBoundingClientRect();
                },
                beforeDown(event, rect) {},
                down(event, rect) {
                    that.ECMIXremoveFakeGRect();
                },
                beforeMove(event, rect) {},
                move(event, orect, nrect) {
                    const $target = $(event.target);
                    const scale = that.PMIXPageScale.current;
                    const scaleW = nrect.width / orect.width;
                    const scaleH = nrect.height / orect.height;
                    const equalRatio = $target.is(`.tl`) || $target.is(`.tr`) || $target.is(`.bl`) || $target.is(`.br`);
                    // 缩放后的操作框相对于画布尺寸与位置
                    let nsize = {
                        x: nrect.x / scale,
                        y: nrect.y / scale,
                        w: nrect.width / scale,
                        h: nrect.height / scale,
                    };
                    let Pelem = PElement().getSelected();
                    // 多选缩放 && 组合缩放
                    if (Pelem.$element.length > 1) {
                        // 缩放前的操作框相对于画布尺寸与位置
                        let osize = {
                            x: orect.x / scale,
                            y: orect.y / scale,
                            w: orect.width / scale,
                            h: orect.height / scale,
                        }
                        // 缩放后操作框中心点
                        let nMiddle = {
                            x: nsize.x + nsize.w / 2,
                            y: nsize.y + nsize.h / 2,
                        }
                        // 缩放前操作框中心点
                        let oMiddle = {
                            x: osize.x + osize.w / 2,
                            y: osize.y + osize.h / 2,
                        }
                        // 逐个计算尺寸与位置
                        Pelem.$element.forEach(item => {
                            let _Pelem = PElement(item);
                            let _PelemRect = _Pelem.getRectData();
                            // 计算元素缩放前中心点
                            let elemOMiddle = {
                                x: _PelemRect.x + _PelemRect.width / 2,
                                y: _PelemRect.y + _PelemRect.height / 2,
                            }
                            // 计算元素缩放后宽高
                            let _PelemW = _PelemRect.width * scaleW;
                            let _PelemH = _PelemRect.height * scaleH;
                            // 计算元素缩放前中心点 X Y 轴差量
                            let middleDiffX = elemOMiddle.x - oMiddle.x;
                            let middleDiffY = elemOMiddle.y - oMiddle.y;
                            // 计算元素缩放后中心点
                            let elemNMiddle = {
                                x: nMiddle.x + middleDiffX * scaleW,
                                y: nMiddle.y + middleDiffY * scaleH,
                            };
                            // 计算元素缩放后 X Y 轴坐标
                            let _PelemX = elemNMiddle.x - _PelemW / 2;
                            let _PelemY = elemNMiddle.y - _PelemH / 2;
                            _Pelem.setAbsoluteTranslate({
                                x: _PelemX,
                                y: _PelemY,
                            }).setSize({
                                width: _PelemW,
                                height: _PelemH,
                                scaleX: scaleW,
                                scaleY: scaleH,
                            }, equalRatio);
                        });
                    } else {
                        Pelem.setSize({
                            width: nsize.w,
                            height: nsize.h,
                            scaleX: scaleW,
                            scaleY: scaleH,
                        }, equalRatio).setAbsoluteTranslate({
                            x: nsize.x,
                            y: nsize.y,
                        });
                    }
                    // 文本改为高度适应
                    if (!equalRatio) {
                        Pelem.$element.forEach(item => {
                            PElement(item).direct(`text`, `setWhiteSpace`, item, `wrap`);
                        })
                    }
                    that.ECMIXresetOperateRect();
                    // 展示缩放数值
                    $('.operate-resize-number').show();
                },
                beforeUp(event, rect) {},
                up(event, rect) {
                    // 隐藏缩放数值
                    $('.operate-resize-number').hide();
                    // 单选组合元素内的子元素操作后，更新操作框
                    if (selectGroupChild) {
                        that.ECMIXsetFakeGRect();
                    }
                },
            });
            // 元素文本聚焦监听
            $(document).on(`focusin`, `#editor-wrap .editor-page .page-elements .element [contenteditable="true"]`, event => {
                let target = event.target;
                $(`.operate-edit-tip`).hide();
                // 元素文本失焦监听
                $(document).on(`focusout`, event => {
                    $(document).off("focusout");
                    // 画布归位
                    // $(`#editor-wrap .editor-page`).addClass(`fresh`);
                    richText.clearRange();
                    that.$nextTick(() => {
                        // $(`#editor-wrap .editor-page`).removeClass(`fresh`);
                        // 文本输入宽高度自适应
                        let Pelem = PElement(target);
                        if (!Pelem.group && Pelem.type === `text` && target.textContent === ``) {
                            Pelem.delete();
                            that.ECMIXcancelSelect();
                        }
                    })
                });
            })
            // 元素文本输入监听
            $(document).on(`input`, `#editor-wrap .editor-page .page-elements .element [contenteditable="true"]`, event => {
                let Pelem = PElement(event.target);
                // 文本输入宽高度自适应
                if (!Pelem.multi && Pelem.type === `text`) {
                    if (event.target.getAttribute(`style`).indexOf(`nowrap`) > -1) {
                        Pelem.direct(Pelem.type, `autoWidth`, Pelem.firstElement);
                    } else {
                        Pelem.direct(Pelem.type, `autoHeight`, Pelem.firstElement);
                    }
                    setTimeout(() => {
                        that.ECMIXresetOperateRect();
                    }, 16);
                }
            });
            // 元素双击事件
            $(document).on(`dblclick`, `#editor-wrap .editor-page .page-elements .element, #operate-main .operate-group-mask .child`, event => {
                let crttarget = event.currentTarget;
                let jqcrttarget = $(crttarget);
                let Pelem = '';
                if (jqcrttarget.hasClass(`child`)) {
                    Pelem = PElement(`#${jqcrttarget.attr(`id`)}`);
                } else {
                    Pelem = PElement(event.target);
                }
                switch (true) {
                    case !!Pelem.customize:
                        that.ECMIXremoveFakeGRect();
                        that.ECMItextFocus(Pelem);
                        break;
                }
            });
        },
        // 编辑器滚轮事件
		pageEventMousewheel(event) {
            const alt = event.altKey;
            const ctrl = event.ctrlKey || event.metaKey;
            const shift = event.shiftKey;
            // ctrl + wheel 缩放画布
			if (ctrl && !alt && !shift) {
                this.ECMIXcancelSelect();
                let detail = event.wheelDelta || event.detail;
                let scale = this.PMIXPageScale.current;
                // 向上
                if (detail > 0) {
                    this.PMIXsetScale(scale + 0.02);
                }
                // 向下
                if (detail < 0) {
                    this.PMIXsetScale(scale - 0.02);
                }
            }
		},
		// 编辑器鼠标拖动事件
		pageEventMousemove(event) {
            const that = this;
            let $page = that.PMIXpage();
			// 画布大于合适尺寸 右键拖动
			if ($page && event.button === 2 && this.PMIXPageScale.current > this.PMIXPageScale.suitable) {
				let $inner = $($page.parentNode);
				let startX = event.pageX;
				let startY = event.pageY;
                setTimeout(() => {
                    $('#editor-wrap').addClass('editor-grabbing');
                    this.$forceUpdate();
                }, 0);
				let mousemove = function(mevent) {
					let moveX = mevent.pageX - startX;
					let moveY = mevent.pageY - startY;
					startX = mevent.pageX;
					startY = mevent.pageY;
					let pageX = util.fix($inner.css("left"));
					let pageY = util.fix($inner.css("top"));
					that.PMIXsetPosition(pageX + moveX, pageY + moveY);
                    that.useContextmenu = false;
				};
				let mouseup = function(uevent) {
                    $('#editor-wrap').removeClass('editor-grabbing');
                    setTimeout(() => { that.useContextmenu = true}, 0);
					document.removeEventListener("mousemove", mousemove);
					document.removeEventListener("mouseup", mouseup);
				};
				document.addEventListener("mousemove", mousemove);
				document.addEventListener("mouseup", mouseup);
			}
		},
		// 编辑器鼠标框选元素事件
		pageEventSurface(event) {
			const that = this;
			if (event.button === 0) {
				let $surface = $("#editor-surface");
				let wrapOffset = $surface.parent().offset();
				let startX = event.pageX - wrapOffset.left;
				let startY = event.pageY - wrapOffset.top;
				let moveX = startX;
				let moveY = startY;
				let rect = {
					top: startY,
					left: startX,
					width: 0,
					height: 0,
				};
				let mousemove = function(mevent) {
					moveX = mevent.pageX - startX - wrapOffset.left;
					moveY = mevent.pageY - startY - wrapOffset.top;
					if (moveX > 0) {
						rect.left = startX;
						rect.width = moveX;
					} else {
						rect.left = startX - Math.abs(moveX);
						rect.width = Math.abs(moveX);
					}
					if (moveY > 0) {
						rect.top = startY;
						rect.height = moveY;
					} else {
						rect.top = startY - Math.abs(moveY);
						rect.height = Math.abs(moveY);
					}
					$surface.css(rect);
				};
				let mouseup = function(uevent) {
					if (rect.width && rect.height) {
						rect.right = rect.left + rect.width;
						rect.bottom = rect.top + rect.height;
						let Pelem = PElement(``).getCanSelect().getUnlock().getVisible();
						let select = [];
						Pelem.$element.forEach(element => {
							let _Pelem = PElement(element);
							let elemRect = _Pelem.getClientRectData();
							/*判断  &&
								左上角碰撞检测
									元素左偏移量 <= 拉选框的宽 + 左偏移量
									元素上偏移量 <= 拉选框的高 + 上偏移量
								右下角碰撞检测
									元素的宽 + 左偏移量 >= 拉选框左偏移量
									元素的高 + 上偏移量 >= 拉选框上偏移量
							*/
							if (elemRect.x <= rect.right && elemRect.y <= rect.bottom && (elemRect.x + elemRect.width) >= rect.left && (elemRect.y + elemRect.height) >= rect.top) {
								select = select.concat(_Pelem.$element);
							}
						});
                        that.ECMIXcancelSelect();
						that.ECMIXsetSelect(select);
					}
					$surface.removeAttr("style");
					document.removeEventListener("mousemove", mousemove);
					document.removeEventListener("mouseup", mouseup);
				};
				document.addEventListener("mousemove", mousemove);
				document.addEventListener("mouseup", mouseup);
			}
        },
        // 画布事件同步到播放器
        pageEventSyncEditor(event) {
            const that = this;
            if (that.paused) {
                return;
            }
            let moveX = '';
            let moveY = '';
            let target = event.target;
            let cancelSelect = that.selectedProp || document.querySelector(`[checked]`);
            let mousemove = function(mevent) {
                moveX = mevent.pageX - event.pageX;
                moveY = mevent.pageY - event.pageY;
            };
            let mouseup = function(uevent) {
                if (Math.abs(moveX) < 5 && Math.abs(moveY) < 5 && !cancelSelect) {
                    let isElement = $(target).is('.element') || $(target).parents('.element').length;
                    if (isElement) {
                        let $elem = $(target).is('.element') ? $(target) : $(target).parents('.element');
                        let classify = $elem.attr(`data-classify`);
                        if ([`fragmentstart`, `fragmentending`].indexOf(classify) > -1) isElement = false;
                    }
                    if (isElement && !that.paused) {
                        EditorPlayer.pause();
                    } else if (!isElement) {
                        that.paused ? EditorPlayer.play() : EditorPlayer.pause();
                    }
                } else if (!that.paused) {
                    EditorPlayer.pause();
                }
                document.removeEventListener("mousemove", mousemove);
                document.removeEventListener("mouseup", mouseup);
            };
            document.addEventListener("mousemove", mousemove);
            document.addEventListener("mouseup", mouseup);
        },
        // 任务管理器事件监听
        taskManagerListener() {
            const that = this;
            that.$task.manager.forEach(manager => {
                manager.$on('confirm', (data, complete) => {
                    if (data.type === 'append'){
                        data.result.forEach(res => {
                            let item = res.result;
                            let properties = item.properties;
                            that.PMIXappendMedia({
                                type: item.type,
                                src: item.content,
                                title: item.name,
                                media: {duration: properties.duration},
                                cover: item.image,
                                frame: properties.frame || properties.waveform,
                                width: properties.width,
                                height: properties.height,
                            });
                        })
                        complete();
                    } else if (data.type === 'stt'){
                        if (this.$refs.stockbar) this.$refs.stockbar.openstt();
                    }
                })
            })
        },


        /**
         * 工程操作类方法 ----------------------------------------------------------
         */
        // 工程 播放 / 暂停
        projectPlayToggle() {
            let state = EditorPlayer.playState;
            if (this.playerBuffering) {
                return;
            }
            switch (state) {
                case `paused`:
                    EditorPlayer.play();
                    break;
                case `running`:
                    EditorPlayer.pause();
                    break;
                case `finished`:
                    EditorPlayer.currentTime = 0;
                    EditorPlayer.play();
                    this.trackHorizontalScroll(0);
                    break;
            }
        },
        // 工程 重新播放
        projectReplay() {
            EditorPlayer.pause();
            EditorPlayer.currentTime = 0;
            if (this.playerBuffering) {
                return;
            }
            EditorPlayer.play();
            this.trackHorizontalScroll(0);
        },
        // 工程 上/下一个片段
        projectToFragment(type) {
            let current = this.timelineCurrent;
            let masterTrack = this.PMIXprojectData.tracks.find(i => i.type === `master`);
            if (masterTrack) {
                let masterIntime = this.PMIXprojectData.elements.filter(i => i.track === masterTrack.id && i.classify === `fragment`).map(i => i.inTime);
                switch (type) {
                    case `prev`:
                        let prevTime = masterIntime.filter(i => i <= current).sort((a, b) => b - a);
                        prevTime.shift();
                        EditorPlayer.pause();
                        EditorPlayer.currentTime = prevTime[0] || 0;
                        break;
                    case `next`:
                        let nextTime = masterIntime.filter(i => i > current).sort((a, b) => a - b);
                        EditorPlayer.pause();
                        EditorPlayer.currentTime = nextTime[0] || Math.max.apply(null, this.PMIXprojectData.elements.filter(i => i.track === masterTrack.id && i.classify === `fragment`).map(i => i.outTime));
                        break;
                }
                this.scrollToSeek();
            }
        },
        // 工程静音设置
        projectSetMuted() {
            this.PMIXMonitorMuted(!this.PMIXprojectData.page.muted);
        },
        // 工程音量数值预览
        projectPreviewVolume(event) {
            let volume = Math.floor(event[0]);
            this.showVolumePreview = volume;
        },
        // 工程音量设置
        projectSetVolume(event) {
            let volume = Math.floor(event[0]);
            this.showVolumePreview = volume;
            this.PMIXMonitorVolume(volume);
            this.PMIXMonitorMuted(false);
        },
        // 工程变速数值预览
        projectPreviewSpeed(event) {
            let speed = util.NumberRange(Math.floor((this.maxSpeed * event[0] / 100) * 100) / 100, this.minSpeed, this.maxSpeed);
            this.showSpeedPreview = speed;
        },
        // 工程设置变速
        projectSetSpeed(event) {
            let speed = util.NumberRange(Math.floor((this.maxSpeed * event[0] / 100) * 100) / 100, this.minSpeed, this.maxSpeed);
            this.showSpeedPreview = speed;
            EditorPlayer.speed = speed;
        },
        // 工程全屏预览
        projectFullToggle() {
            if (!this.projectFullPreviewState) {
                EditorPlayer.pause();
                this.projectPreviewData = util.deepClone(this.PMIXprojectData);
            }
            this.projectFullPreviewState = !this.projectFullPreviewState;
        },
        // 工程全屏预览组件准备完成
        projectPreviewReady() {
            const that = this;
            // 默认进入全屏
            that.$refs.projectPlayer.setCurrentTime(that.timelineCurrent);
            that.$refs.projectPlayer.toggleFullScreen();
            // 进入全屏后，监听退出全屏
            setTimeout(() => {
                that.$refs.projectPlayer.$on(`fullscreen`, isFull => {
                    if (!isFull) {
                        that.$refs.projectPlayer.pause();
                        that.projectFullPreviewState = false;
                        EditorPlayer.currentTime = that.$refs.projectPlayer.timelineCurrent;
                        that.scrollToSeek();
                    }
                });
            }, 300);
        },


        /**
         * 轨道操作类方法 ----------------------------------------------------------
         */
        // 轨道元素剪辑（切割）
        trackPropCutting() {
            const that = this;
            let currentTime = that.timelineCurrent;
            let Pelems = that.selectedProp ? PElement(`#${that.selectedProp}`).getGroup() : PElement(``);
            Pelems.$element.forEach(item => {
                let Pelem = PElement(item);
                if ([`fragmentstart`, `fragmentending`].indexOf(Pelem.classify) > -1) {
                    return;
                }
                let $animate = item.querySelector(`.element-animate`);
                if (Number($animate.getAttribute(`data-intime`) > currentTime) || Number($animate.getAttribute(`data-outtime`)) < currentTime) {
                    return;
                }
                let clone = Pelem.toData();
                if (clone[0].outTime - currentTime < 100) {
                    return;
                }
                // 修改被切割元素的出场时间
                Pelem.outTime(currentTime);
                // 清除被切割元素的淡入淡出
                if (Pelem.type === `audio`) {
                    Pelem.direct(Pelem.type, `setFadeIn`, Pelem.firstElement, 0);
                    Pelem.direct(Pelem.type, `setFadeOut`, Pelem.firstElement, 0);
                }
                // 克隆元素并修改进场时间
                let groupId = "";
                if (Pelem.group) {
                    groupId = util.uuid();
                }
                clone.forEach(item => {
                    item.id = util.uuid();
                    item.group = groupId;
                    item.animate = {
                        animation: [],
                        duration: 1000,
                        easing: "linear",
                        iterations: 1,
                    };
                    item.inTransition = '';
                    item.outTransition = '';
                    if (item.type === `audio`) {
                        item.media.fadeIn = 0
                        item.media.fadeOut = 0
                    }
                    if (item.clipId) item.clipId = util.uuid();
                });
                PElement().append(clone).inTime(currentTime);
            })
        },
        // 轨道元素复制
        trackPropCopy() {
            const that = this;
            if (!that.selectedProp) {
                return;
            }
            PElement(`#${that.selectedProp}`).getGroup().copy();
        },
        // 轨道元素粘贴
        trackPropPaste() {
            const that = this;
            if (navigator && navigator.clipboard) {
                navigator.clipboard.readText().then(res => {
                    if (!res) {
                        return;
                    }
                    // 模拟 粘贴事件对象
                    let clipboardData = new DataTransfer();
                    clipboardData.effectAllowed = `uninitialized`;
                    clipboardData.setData(`text/plain`, res);
                    $(`#editor-tracks`).focus();
                    that.pasteEventListener(new ClipboardEvent(`paste`, {
                        clipboardData: clipboardData,
                    }));
                }).catch(err => {
                    if (err && err.message === `Read permission denied.`) {
                        that.$toast(`客户端未开启剪贴板读取权限`);
                    }
                });
            } else {
                that.$toast(`您的浏览器不支持读取剪贴板内容`);
            }
        },
        // 轨道元素删除
        trackPropDelete() {
            const that = this;
            if (!that.selectedProp) {
                that.ECMIXdelete();
                return;
            }
            let Pelem = PElement(`#${that.selectedProp}`);
            Pelem.getGroup().delete();
            that.trackClearSelect();
        },
        // 轨道展开收起
        tracksPanelPullToggle() {
            const that = this;
            let $timeline = this.$refs.timeline;
            let $tracksWrap = that.$refs.tracksContainer;
            let $desk = document.querySelector(`#editor-tracks`);
            let $editorWrap = document.querySelector(`#editor-wrap`);
            if ($timeline && $tracksWrap) {
                let $timelineWrap = $timeline.parentNode;
                let pullHeight = $tracksWrap.scrollHeight - $tracksWrap.offsetHeight;
                let maxPullHeight = Math.ceil($editorWrap.offsetHeight / 2);
                that.trackPull = !that.trackPull;
                $timelineWrap.style.height = ``;
                // 轨道高度可拉升
                if (pullHeight > 0) {
                    pullHeight = util.NumberRange(pullHeight, undefined, maxPullHeight);
                    if (that.trackPull) {
                        $timelineWrap.style.height = `${$timelineWrap.offsetHeight + pullHeight}px`;
                    }
                }
                $editorWrap.style.height = `calc(100% - ${$desk.clientHeight}px)`;
                that.resizeEventListener();
            }
            that.tracksScrollbarUpdate();
        },
        // 清除轨道内元素选中以及轨道选中
        trackClearSelect() {
            const that = this;
            that.selectedProp = "";
            $(that.$refs.timeline).find(`.track`).addClass(`erase`);
        },
        // 修改当前时间线
        timeLineModify(event, isClick) {
            const that = this;
            let edgeAutoMove; // 边缘自动滚动定时器
            let startX = event.pageX;
            let timeline = that.$refs.timeline;
            let wrapRect = timeline.parentNode.getBoundingClientRect();
            let offsetLeft = timeline.offsetLeft + wrapRect.left;
            let focusTransition = $(event.target).is('.prop-transition-wrap') || $(event.target).parents('.prop-transition-wrap').length;
            if (EditorPlayer.playState === `running`) {
                EditorPlayer.pause();
            }
            // 转场动画拦截
            if (focusTransition) {
                return;
            }
            // 更新当前时间值
            let update = function (x) {
                EditorPlayer.currentTime = util.NumberRange(that.extentToTime(x), 0, EditorPlayer.duration);
            };
            update(event.pageX + that.trackHorizontalScroll() - offsetLeft);
            that.playerTimeUpdated = true;
            /**
             * 鼠标移动事件
             */
            let mouseMove = function (mevent, scrollLeft) {
                let $tracksWrap = that.$refs.tracksContainer;
                $(`.timeline-seek`).addClass(`seeking`);
                // 轨道移动时移除时间线移动事件
                if (!$tracksWrap || $tracksWrap.querySelectorAll(`.track:not(.erase)`).length) {
                    document.removeEventListener("mousemove", mouseMove);
                    return;
                } else if (Math.abs(startX - mevent.pageX) > 5) {
                    // 取消元素选中
                    // that.ECMIXcancelSelect();
                }
                update(mevent.pageX + that.trackHorizontalScroll(scrollLeft) - offsetLeft);
                // 边缘自动滚动
                clearTimeout(edgeAutoMove);
                edgeAutoMove = setTimeout(() => {
                    switch (true) {
                        // 左移动
                        case mevent.pageX - wrapRect.left < 30:
                            mouseMove(mevent, that.trackHorizontalScroll() - 40);
                            break;
                        // 右移动
                        case wrapRect.right - mevent.pageX < 30:
                            mouseMove(mevent, that.trackHorizontalScroll() + 40);
                            break;
                    }
                }, 30);
            }
            if (isClick) {
                return;
            }
            // 鼠标事件
            util.mouseDownMoveEvent(mouseMove, uevent => {
                // 当前时间线不在选中片段时间范围之内时，取消元素选中
                let PelemInfo = PElement(``).getSelected().getInformation();
                if (that.timelineCurrent > PelemInfo.outTime || that.timelineCurrent < PelemInfo.inTime) {
                    that.ECMIXcancelSelect();
                }
                $(`.timeline-seek`).removeClass(`seeking`);
                clearTimeout(edgeAutoMove);
            });
        },
        // 轨道元素时长修改
        trackPropDurationModify(event, type, elem, trackItem) {
            const that = this;
            that.selectedProp = elem.id;
            // 禁止操作
            if (elem.unableHandle) {
                return;
            }
            let start = event.pageX;
            let isGroup = elem.group;
            let startScrollLeft = that.trackHorizontalScroll();
            let inTime = util.fix(elem.TRACKSTYLE.left);
            let outTime = util.fix(elem.TRACKSTYLE.width) + util.fix(elem.TRACKSTYLE.left);
            let $frameCover = $(event.target).parents(`.prop-wrap[data-id=${elem.id}]`).find(`.frame-cover`);
            let coverLeft = util.fix($frameCover.css(`left`));
            let {
                isMaster,
                minInTime,
                maxInTime,
                minOutTime,
                maxOutTime,
            } = that.trackUsableTimeFrame(PElement(`#${elem.id}`).getGroup().getInformation())
            minInTime = util.fix(that.timeToExtent(minInTime));
            maxInTime = util.fix(that.timeToExtent(maxInTime));
            minOutTime = util.fix(that.timeToExtent(minOutTime));
            maxOutTime = util.fix(that.timeToExtent(maxOutTime));
            /**
             * 鼠标移动事件
             */
            let timeline = that.$refs.timeline;
            let wrapRect = timeline.parentNode.getBoundingClientRect();
            let edgeAutoMove; // 边缘自动滚动定时器
            let mouseMove = function (mevent, scrollLeft) {
                let moveScrollLeft = that.trackHorizontalScroll(scrollLeft);
                let pageX = mevent.pageX + (moveScrollLeft - startScrollLeft);
                let move = pageX - start;
                that.trackReferencePoint = [];
                switch (type) {
                    case `inTime`:
                        let updateInTime = util.NumberRange(inTime + move, minInTime, maxInTime);
                        // 自动贴合 && 参考线 处理
                        updateInTime = that.setTrackFit(elem, updateInTime).value;
                        elem.TRACKSTYLE.left = `${updateInTime}px`;
                        elem.TRACKSTYLE.width = `${util.fix(outTime - inTime) - (updateInTime - inTime)}px`;
                        // 更新帧图
                        $frameCover.css(`left`, util.NumberRange(coverLeft - move, -(maxInTime - inTime), 0));
                        break;
                    case `outTime`:
                        let updateOutTime = util.NumberRange(outTime + move, minOutTime, maxOutTime);
                        // 自动贴合 && 参考线 处理
                        updateOutTime = that.setTrackFit(elem, updateOutTime).value;
                        elem.TRACKSTYLE.width = `${updateOutTime - inTime}px`;
                        break;
                }
                // 边缘自动滚动
                clearTimeout(edgeAutoMove);
                edgeAutoMove = setTimeout(() => {
                    switch (true) {
                        // 左移动
                        case mevent.pageX - wrapRect.left < 40:
                            mouseMove(mevent, that.trackHorizontalScroll() - 20);
                            break;
                        // 右移动
                        case wrapRect.right - mevent.pageX < 40:
                            mouseMove(mevent, that.trackHorizontalScroll() + 20);
                            break;
                    }
                }, 30);
            }
            // 移动鼠标调整时长
            util.mouseDownMoveEvent(mouseMove, uevent => {
                clearTimeout(edgeAutoMove);
                // 清空参考线
                that.trackReferencePoint = [];
                // 更新元素数据
                let Pelem = PElement(`#${elem.id}`).getGroup();
                let updateInTime = util.fix(elem.TRACKSTYLE.left);
                let updateDuration = util.fix(elem.TRACKSTYLE.width);
                switch (type) {
                    case `inTime`:
                        Pelem.inTime(isGroup ? that.extentToTime(inTime - updateInTime) : that.extentToTime(updateInTime));
                        break;
                    case `outTime`:
                        Pelem.outTime(isGroup ? that.extentToTime(outTime - updateInTime - updateDuration) : that.extentToTime(updateInTime + updateDuration));
                        break;
                }
                // 重排主轨道元素
                that.masterTrackPropCloser();
            });
        },
        // 轨道元素拖动
        trackPropMove(event, elem, trackItem) {
            const that = this;
            if (EditorPlayer.playState === `running`) {
                EditorPlayer.pause();
            }
            if ($(event.target).is(`.muted`) || $(event.target).parents(`.muted`).length) {
                that.iconSetMuted(elem);
            }
            // 选中轨道
            that.selectedProp = elem.id;
            that.isCheckFromTrack = true;
            // 禁止操作
            if (elem.unableHandle || elem.upload === `pending`) {
                if (that.timelineCurrent > elem.outTime || that.timelineCurrent < elem.inTime) {
                    that.timeLineModify(event, true);
                }
                return;
            }
            // 轨道选中样式
            let $currentTrack = document.querySelector(`#${trackItem.id}`);
            if (!$currentTrack) {
                return;
            }
            let timeline = that.$refs.timeline;
            let tracksContainer = that.$refs.tracksContainer;
            let $selectedProp = tracksContainer.querySelector(`[data-id=${elem.id}]`);
            let isMaster = trackItem.type === `master`;
            // 轨道元素拖动
            let position = {
                top: util.fix(elem.TRACKSTYLE.top),
                left: util.fix(elem.TRACKSTYLE.left),
            };
            let startX = event.pageX;
            let startY = event.pageY;
            let startScrollLeft = that.trackHorizontalScroll();
            let startScrollTop = that.trackVerticalScroll();
            let $changeTrack = null;
            let defaultMasterTrack = util.deepClone(that.trackList.find(i => i.type === `master`));
            let getTracksRects = Array.from(tracksContainer.querySelectorAll(`.track[track-type]`)).map(i => {
                let rect = i.getBoundingClientRect();
                return {
                    track: i,
                    top: rect.top,
                    bottom: rect.bottom,
                }
            });
            let $lastTrack = getTracksRects[getTracksRects.length - 1].track;
            let $insertLine = null;
            let getTracksInsertRects = Array.from(tracksContainer.querySelectorAll(`.track-insert-line`)).map(i => {
                let rect = i.getBoundingClientRect();
                return {
                    line: i,
                    top: rect.top - 4,
                    bottom: rect.bottom + 4,
                }
            });
            let isMove = false;
            /**
             * 鼠标移动事件
             */
            let wrapRect = timeline.parentNode.getBoundingClientRect();
            let tracksRect = tracksContainer.getBoundingClientRect();
            let edgeAutoMove; // 边缘自动滚动定时器
            let mouseMove = function (mevent, scrollLeft, scrollTop) {
                let moveScrollLeft = that.trackHorizontalScroll(scrollLeft);
                let moveScrollTop = that.trackVerticalScroll(scrollTop);
                let pageX = mevent.pageX + (moveScrollLeft - startScrollLeft);
                let pageY = mevent.pageY + (moveScrollTop - startScrollTop);
                let moveX = pageX - startX;
                let moveY = pageY - startY;
                // 未移动鼠标
                if (Math.abs(moveX) < 3 && Math.abs(moveY) < 3) {
                    return false;
                }
                isMove = true;
                // 添加移动标识
                $selectedProp.classList.add(`moving`);
                let minX = (0 - util.fix(elem.TRACKSTYLE.width)) / 2;
                let minY = 0 - ($currentTrack.offsetTop + $currentTrack.offsetHeight / 2);
                let maxY = $lastTrack.offsetTop + $lastTrack.offsetHeight - $currentTrack.offsetTop;
                let updateX = util.NumberRange(position.left + moveX, minX);
                let updateY = util.NumberRange(position.top + moveY, minY, maxY);
                // 自动贴合 && 参考线 处理
                let fittestInValue, fittestOutValue;
                let updateOut = updateX + util.fix(elem.TRACKSTYLE.width);
                that.trackReferencePoint = [];
                fittestInValue = that.setTrackFit(elem, updateX);
                fittestOutValue = that.setTrackFit(elem, updateOut);
                if (fittestOutValue.diff >= fittestInValue.diff) {
                    updateX = fittestInValue.value;
                } else {
                    updateX = fittestOutValue.value - util.fix(elem.TRACKSTYLE.width);
                }
                elem.TRACKSTYLE.top = `${updateY}px`;
                elem.TRACKSTYLE.left = `${updateX}px`;
                // 解决移动时卡顿问题
                that.$forceUpdate();
                // 轨道选中样式
                getTracksRects.forEach(item => {
                    item.track.classList.add(`erase`);
                    item.track.querySelector(`.premove-prop-wrap`) && item.track.querySelector(`.premove-prop-wrap`).removeAttribute(`style`);
                });
                $currentTrack.classList.remove(`erase`);
                /**
                 * 轨道移动检测
                 * 计算移入预切换的轨道
                 * 检测元素和对应轨道是否符合：主轨道和元素轨道的视频图片可互相移动
                 * 音频和其他只能在当前类型轨道移动
                 */
                let preSelectTrack = getTracksRects.find(i => {
                    let can = false;
                    if (elem.group) {
                        can = false;
                    } else if ([`image`, `video`].includes(elem.type)) {
                        can = [`master`, `element`].includes(i.track.getAttribute(`track-type`));
                    } else {
                        can = i.track.getAttribute(`track-type`) === trackItem.type;
                    }
                    return i.top <= pageY && i.bottom >= pageY && can;
                });
                if (preSelectTrack) {
                    $changeTrack = preSelectTrack.track;
                    $changeTrack.classList.remove(`erase`);
                } else {
                    $changeTrack = $currentTrack;
                }
                // 轨道插入线选中样式
                getTracksInsertRects.forEach(item => {
                    item.line.classList.remove(`hover`);
                });
                // 计算移入预插入的轨道
                let preInsertLine = getTracksInsertRects.find((i, index) => {
                    // 插入规则
                    let $parent = $(i.line.parentNode);
                    let $elemTrack = $(`.track[id=${elem.track}]`);
                    // 1 黑白片段不可先其它轨道拖动
                    if (elem.classify === `fragment` && elem.type === `shape`) return false;
                    // 2 当前选中元素的轨道的上方不可插入(无意义)
                    if (!$elemTrack.is(`.master`) && $elemTrack.find(`.prop-wrap`).length <= 1 && $parent.attr(`id`) === elem.track) return false;
                    // 3 当前选中元素的轨道不可插入下一个轨道的上方(无意义)
                    if (!$elemTrack.is(`.master`) && $elemTrack.find(`.prop-wrap`).length <= 1 && $(i.line).hasClass(`before`) && $parent.prev().attr(`id`) === elem.track) return false;
                    // 4 非音频元素不可诧插入主轨以上
                    if (elem.type !== `audio` && ($parent.hasClass(`audio`) || ($parent.hasClass(`master`) && $(i.line).hasClass(`before`)))) return false;
                    // 5 音频元素不可插入主轨以下
                    if (elem.type === `audio` && ((!$parent.hasClass(`audio`) && !$parent.hasClass(`master`)) || ($parent.hasClass(`master`) && $(i.line).hasClass(`after`)))) return false;
                    return index === getTracksInsertRects.length - 1 ? i.top <= pageY : i.top <= pageY && i.bottom >= pageY;
                });
                if (preInsertLine) {
                    preInsertLine.line.classList.add(`hover`);
                    $insertLine = preInsertLine.line;
                } else {
                    $insertLine = null;
                }
                /**
                 * 实时计算渲染元素拖动可放置位置
                 */
                if (!$insertLine) {
                    let track = trackItem.track;
                    let $premove = $currentTrack.querySelector(`.premove-prop-wrap`);
                    if ($changeTrack) {
                        let changeTrack = $changeTrack.id;
                        $premove = $changeTrack.querySelector(`.premove-prop-wrap`);
                        track = that.trackList.find(i => i.id === changeTrack).track;
                    }
                    if ($premove) {
                        let updateInTime = that.extentToTime(util.fix(elem.TRACKSTYLE.left));
                        let updateDuration = that.extentToTime(util.fix(elem.TRACKSTYLE.width));
                        let updateOutTime = updateDuration + updateInTime;
                        // 剔除当前元素占位
                        track = track.filter(i => i.id !== elem.id);
                        if (track.length) {
                            // 按进场时间升序排序
                            track.sort((a, b) => a.inTime - b.inTime);
                            // 获取轨道上的空位
                            let trackSpace = track.map((item, index) => {
                                let start = 0;
                                let end = item.inTime;
                                if (index > 0) {
                                    start = track[index - 1].outTime;
                                }
                                return { start, end };
                            });
                            trackSpace.push({
                                start: track[track.length - 1].outTime,
                                end: Infinity,
                            });
                            // 找出可放置的位置
                            trackSpace = trackSpace.filter(i => i.end - i.start >= updateDuration);
                            // 检测当前位置是否可放置
                            let testingInPlace = !!trackSpace.find(i => updateInTime >= i.start && updateOutTime <= i.end);
                            // 当前位置不可放置，寻找最近的可放置位置
                            if (!testingInPlace) {
                                let nearSpace = trackSpace[0];
                                let propMiddle = (updateOutTime - updateInTime) / 2 + updateInTime;
                                trackSpace.forEach((item, index) => {
                                    let prev = trackSpace[index - 1];
                                    let next = trackSpace[index + 1];
                                    let start = item.start;
                                    let end = item.end;
                                    if (next) {
                                        end += (next.start - end) / 2;
                                    }
                                    if (prev) {
                                        start -= (start - prev.end) / 2;
                                    }
                                    if (propMiddle >= start && propMiddle <= end) {
                                        nearSpace = item;
                                    }
                                });
                                if (propMiddle >= ((nearSpace.end - nearSpace.start) / 2 + nearSpace.start)) {
                                    updateInTime = nearSpace.end - updateDuration;
                                } else {
                                    updateInTime = nearSpace.start;
                                }
                            }
                        }
                        if (updateInTime < 0) {
                            updateInTime = 0;
                        }
                        $premove.style.left = that.timeToExtent(updateInTime);
                        $premove.style.width = elem.TRACKSTYLE.width;
                    }
                }
                /**
                 * 主轨道拖动排序预览
                 */
                let changeToMaster = $changeTrack && $changeTrack.getAttribute(`track-type`) === `master`;
                let masterTrackItem = that.trackList.find(i => i.type === `master`);
                if (isMaster || changeToMaster) {
                    // 清空转场图标
                    that.transitionList.splice(0);
                    let filterClassify = [];
                    let originTrack = util.deepClone(masterTrackItem.track);
                    // 其它轨道移入主轨
                    if (elem.track !== masterTrackItem.id) {
                        let _elem = util.deepClone(elem);
                        _elem.classify = `fragment`;
                        if (originTrack[originTrack.length - 1]) {
                            _elem.TRACKSTYLE.top = originTrack[originTrack.length - 1].TRACKSTYLE.top;
                            if (originTrack.filter(i => i.classify === `fragmentending`).length > 0) {
                                if (util.fix(_elem.TRACKSTYLE.left) > util.fix(originTrack[originTrack.length - 1].TRACKSTYLE.left)) {
                                    _elem.TRACKSTYLE.left = originTrack[originTrack.length - 1].TRACKSTYLE.left;
                                    originTrack[originTrack.length - 1].TRACKSTYLE.left = `${util.fix(_elem.TRACKSTYLE.left) + 1}px`
                                }
                            }
                        }
                        originTrack.push(_elem);
                        filterClassify = [`fragment`, `fragmentending`];
                    } else {
                        filterClassify = [`fragment`];
                    }
                    // 排序
                    let sortTrack = originTrack.filter(i => filterClassify.indexOf(i.classify) > -1).sort((a, b) => {
                        return that.extentToTime(util.fix(a.TRACKSTYLE.left)) - that.extentToTime(util.fix(b.TRACKSTYLE.left));
                    });
                    let featureStart = 0;
                    let fsProp = originTrack.find(i => i.classify === `fragmentstart`);
                    if (fsProp) {
                        featureStart = fsProp.TRACKSTYLE.width;
                    }
                    // 移入其他轨道，取消主轨道占位预览
                    if (!changeToMaster && $changeTrack && $changeTrack.id !== $currentTrack.id) {
                        sortTrack = sortTrack.filter(i => i.id !== elem.id);
                    }
                    // 重排元素
                    for (let i = 0; i < sortTrack.length; i++) {
                        let item = sortTrack[i];
                        let prev = sortTrack[i - 1];
                        if (prev) {
                            item.TRACKSTYLE.left = `${util.fix(prev.TRACKSTYLE.left) + util.fix(prev.TRACKSTYLE.width)}px`;
                            // 转场重叠处理
                            if (item.inTransition && item.inTransition === prev.outTransition) {
                                let PelemTransition = that.PMIXprojectData.transition.filter(transition => transition.id === item.inTransition)[0];
                                if (PelemTransition.type === `overlap`) {
                                    item.TRACKSTYLE.left = `${util.fix(prev.TRACKSTYLE.left) + util.fix(prev.TRACKSTYLE.width) - util.fix(that.timeToExtent(PelemTransition.duration))}px`;
                                    item.TRACKSTYLE.clipPath = `polygon(${that.timeToExtent(PelemTransition.duration)} 0, 100% 0, 100% 100%, 0 100%, 0 100%)`;
                                }
                            } else if (item.inTransition && item.inTransition !== prev.outTransition) {
                                item.TRACKSTYLE.clipPath = `none`;
                            }
                        } else {
                            item.TRACKSTYLE.left = featureStart;
                        }
                        // 更新元素位置（当前操作的元素除外）
                        if (item.id !== elem.id) {
                            let _item = masterTrackItem.track.find(i => i.id === item.id);
                            _item.TRACKSTYLE.left = item.TRACKSTYLE.left;
                            _item.TRACKSTYLE.clipPath = item.TRACKSTYLE.clipPath;
                        } else if ($changeTrack) {
                            let $premove = $changeTrack.querySelector(`.premove-prop-wrap`);
                            if ($premove) {
                                $premove.style.left = item.TRACKSTYLE.left;
                                $premove.style.width = item.TRACKSTYLE.width;
                            }
                        }
                    }
                } else {
                    // 恢复主轨道排序
                    for (let i = 0; i < masterTrackItem.track.length; i++) {
                        let item = masterTrackItem.track[i];
                        let _item = defaultMasterTrack.track.find(i => i.id === item.id);
                        item.TRACKSTYLE.left = _item.TRACKSTYLE.left;
                        item.TRACKSTYLE.clipPath = _item.TRACKSTYLE.clipPath;
                    }
                }
                // 边缘自动滚动
                clearTimeout(edgeAutoMove);
                edgeAutoMove = setTimeout(() => {
                    switch (true) {
                        // 左移动
                        case mevent.pageX - wrapRect.left < 40:
                            mouseMove(mevent, that.trackHorizontalScroll() - 20);
                            break;
                        // 右移动
                        case wrapRect.right - mevent.pageX < 40:
                            mouseMove(mevent, that.trackHorizontalScroll() + 20);
                            break;
                        // 上移动
                        case mevent.pageY - tracksRect.top < 10:
                            mouseMove(mevent, undefined, that.trackVerticalScroll() - 5);
                            break;
                        // 下移动
                        case tracksRect.bottom - mevent.pageY < 10:
                            mouseMove(mevent, undefined, that.trackVerticalScroll() + 5);
                            break;
                    }
                }, 30);
            }
            // 鼠标事件
            util.mouseDownMoveEvent(mouseMove, uevent => {
                clearTimeout(edgeAutoMove);
                // 清除移动标识
                $selectedProp.classList.remove(`moving`);
                // 清空参考线
                that.trackReferencePoint = [];
                // 仅点击
                if (!isMove) {
                    // 当前时间线不在选中片段时间范围之内时，修改当前时间线 (允许冒泡会导致清空轨道选中状态)
                    if (that.timelineCurrent > elem.outTime || that.timelineCurrent < elem.inTime) {
                        that.timeLineModify(event, true);
                    }
                    return;
                }
                getTracksInsertRects.forEach(item => {
                    item.line.classList.remove(`hover`);
                });
                let Pelem = PElement(`#${elem.id}`).getGroup();
                // 获取所在轨道
                let track = trackItem.track;
                // 获取放置位置的相对时间
                let updateInTime = that.extentToTime(util.fix(elem.TRACKSTYLE.left));
                let updateDuration = that.extentToTime(util.fix(elem.TRACKSTYLE.width));
                let updateOutTime = updateDuration + updateInTime;
                /**
                 * 切换轨道并计算可放置位置
                 */
                // 检测是否已切换轨道
                let changeTrack = $changeTrack && $changeTrack.id;
                let changeToMaster = false;
                let currentIsMaster = $currentTrack.getAttribute(`track-type`) === `master`;
                if (changeTrack !== $currentTrack.id) {
                    // 变换轨道
                    if (changeTrack) {
                        // 更新所在轨道
                        let findTrack = that.trackList.find(i => i.id === changeTrack);
                        track = findTrack.track;
                        // 是否切换到主轨道
                        changeToMaster = findTrack.type === `master`;
                        if (currentIsMaster && changeTrack) {
                            that.ECMIXsizeAdaptation(Pelem, 0.6);
                            that.ECMIXsetLock(false);
                            Pelem.align(`deuce`, `horizontal`);
                        } else if (changeToMaster) {
                            that.ECMIXsizeAdaptation(Pelem, 1);
                            Pelem.align(`deuce`, `horizontal`);
                        }
                        that.PMIXpushToTrack(Pelem, changeTrack);
                    } else {
                        track = null;
                    }
                } else {
                    changeToMaster = $currentTrack.getAttribute(`track-type`) === `master`;
                }
                // 新增轨道放置元素
                if ($insertLine) {
                    let preInsertIndex = that.trackList.findIndex(i => i.id === $insertLine.parentNode.id);
                    if ($insertLine.classList.contains(`before`) && preInsertIndex >= 0) {
                        preInsertIndex = preInsertIndex === 0 ? 0 : preInsertIndex - 1;
                    }
                    if (currentIsMaster) {
                        that.ECMIXsizeAdaptation(Pelem, 0.6);
                        that.ECMIXsetLock(false);
                        Pelem.align(`deuce`, `horizontal`);
                    }
                    that.PMIXpushToTrack(Pelem, preInsertIndex);
                } else
                // 轨道内放置（主轨道除外，主轨道自动排序）
                if (Array.isArray(track) && !changeToMaster) {
                    // 剔除当前元素占位
                    track = util.deepClone(track).filter(i => i.id !== elem.id);
                    if (track.length) {
                        // 按进场时间升序排序
                        track.sort((a, b) => a.inTime - b.inTime);
                        // 获取轨道上的空位
                        let trackSpace = track.map((item, index) => {
                            let start = 0;
                            let end = item.inTime;
                            if (index > 0) {
                                start = track[index - 1].outTime;
                            }
                            return { start, end };
                        });
                        trackSpace.push({
                            start: track[track.length - 1].outTime,
                            end: Infinity,
                        });
                        // 找出可放置的位置
                        trackSpace = trackSpace.filter(i => i.end - i.start >= updateDuration);
                        // 检测当前位置是否可放置
                        let testingInPlace = !!trackSpace.find(i => updateInTime >= i.start && updateOutTime <= i.end);
                        // 当前位置不可放置，寻找最近的可放置位置
                        if (!testingInPlace) {
                            let nearSpace = trackSpace[0];
                            let propMiddle = (updateOutTime - updateInTime) / 2 + updateInTime;
                            trackSpace.forEach((item, index) => {
                                let prev = trackSpace[index - 1];
                                let next = trackSpace[index + 1];
                                let start = item.start;
                                let end = item.end;
                                if (next) {
                                    end += (next.start - end) / 2;
                                }
                                if (prev) {
                                    start -= (start - prev.end) / 2;
                                }
                                if (propMiddle >= start && propMiddle <= end) {
                                    nearSpace = item;
                                }
                            });
                            if (propMiddle >= ((nearSpace.end - nearSpace.start) / 2 + nearSpace.start)) {
                                updateInTime = nearSpace.end - updateDuration;
                            } else {
                                updateInTime = nearSpace.start;
                            }
                        }
                    }
                }
                getTracksRects.forEach(item => {
                    item.track.classList.add(`erase`);
                    item.track.querySelector(`.premove-prop-wrap`) && item.track.querySelector(`.premove-prop-wrap`).removeAttribute(`style`);
                });
                // 进场时间无法小于0，主轨道自动排序需小于0才能排在前
                if (updateInTime <= 0) {
                    updateInTime = changeToMaster ? -1 : 0;
                }
                // 更新元素入场时间
                Pelem.moveTime(updateInTime);
                setTimeout(() => {
                    that.ECMIXresetOperateRect();
                }, 116);
                // 重排主轨道元素
                that.masterTrackPropCloser();
                // 时间线定位
                that.scrollToSelect();
            });
        },
        // 检测指定元素是否可见，不可见则调整当前时间线至可见
        timeLineMoveToElement(Pelem) {
            if (!isPElement(Pelem)) {
				return console.error(`元素插入轨道错误，不是有效的元素对象`);
            }
            if (!Pelem.firstElement) {
                return;
            }
            // 点击选中轨道元素，将工程视频当前时间值调整到元素显示
            let elem = baseElement.getAnimate(Pelem.firstElement);
            if (this.timelineCurrent < elem.inTime || this.timelineCurrent >= elem.outTime) {
                EditorPlayer.currentTime = elem.inTime;
            }
        },
        // 删除片头监听方法
        deleteFragmentStartListener(elems) {
            if (!elems.length) {
                return;
            };
            let fragmentInfo = PElement(elems).getInformation();
            if (fragmentInfo.classify !== `fragmentstart`) {
                return;
            }
            // 获取片头时长
            let fragmentDuration = fragmentInfo.outTime;
            let trackList = this.trackList;
            trackList.forEach(trackItem => {
                let track = trackItem.track;
                if (track.length) {
                    // 按进场时间升序排序
                    track.sort((a, b) => a.inTime - b.inTime);
                    track.forEach((elem, i) => {
                        if (elem.classify === `fragmentstart`) {
                            return;
                        }
                        // 入场时间减去片头时长
                        let inTime = elem.inTime;
                        let timeOffset = inTime - fragmentDuration;
                        // 如果不是轨道上第一个元素，要计算与上一个元素间的时长是否小于片头时长，小于的话，入场时间即为上一个元素的出场时间
                        if (i > 0) {
                            let lastOutTime = track[i - 1].outTime;
                            if (timeOffset < lastOutTime) timeOffset = lastOutTime;
                        } else {
                            if (timeOffset < 0) timeOffset = 0;
                        }
                        elem.outTime = timeOffset + (elem.outTime - elem.inTime);
                        elem.inTime = timeOffset;
                        PElement(`#${elem.id}`).moveTime(timeOffset);
                    })
                }
            })
        },
        // 获取轨道元素动画类型
        getElementAnimateType(info) {
            let animateArr = info.animation;
            let type = `in`;
            let firstType, lastType;
            if (animateArr.length) {
                firstType = effects[animateArr[0].name].type;
                lastType = effects[animateArr[animateArr.length - 1].name].type;
            }
            // 存储 当前元素动画类型、对应动画效果、当前选中动画类型
            switch (true) {
                // 入场
                case animateArr.length === 1 && firstType === 'in':
                    type = 'in';
                    break;
                // 出场
                case animateArr.length === 1 && firstType === 'out':
                    type = 'out';
                    break;
                // 循环
                case animateArr.length === 1 && firstType === 'loop':
                    type = 'loop';
                    break;
                // 入场&出场
                case animateArr.length === 2 && lastType === 'out':
                    type = 'inAndout';
                    break;
                // 无动画
                default:
                    type = 'none';
                    break;
            }
            return type;
        },
        // 轨道吸附点整理
        trackAutoFit(elem) {
            let result = [];
            // 1 所有元素前后时间点
            let groupArr = [];
            PElement(``).$element.forEach(item => {
                // 排除拖动元素本身
                if (elem.id == item.getAttribute(`id`)) {
                    return;
                }
                let groupId = item.getAttribute(`data-group`);
                if (!!groupId) {
                    if (groupArr.indexOf(groupId) > -1) return;
                    groupArr.push(item.getAttribute(`data-group`));
                }
                let PelemInfo = PElement(item).getGroup().getInformation();
                result.push(util.fix(this.timeToExtent(PelemInfo.inTime)));
                result.push(util.fix(this.timeToExtent(PelemInfo.outTime)));
            });
            // 2 当前时间线
            result.push(util.fix(this.timeToExtent(this.timelineCurrent)));
            // 3 时间轴上时间节点
            let timelineAxis = this.timelineAxis;
            timelineAxis.forEach(item => {
                result.push(util.fix(item.left));
            })
            return [...new Set(result)];
        },
        // 画布吸附点整理
        pageAutoFit(elems) {
            const scale = this.PMIXPageScale.current;
            let { width, height } = this.PMIXprojectData.page;
            // 生成相对于画布的自动贴合点
            let autoFitX = [0, (width / 2) * scale, width * scale];
            let autoFitY = [0, (height / 2) * scale, height * scale];
            // 生成相对于其他元素的自动贴合点
            PElement(``).$element.forEach(item => {
                // 排除拖动元素本身 & 主轨元素
                if (elems.filter(check => check.getAttribute(`id`) == item.getAttribute(`id`)).length) {
                    return;
                }
                if (item.getAttribute(`data-classify`)) {
                    return;
                }
                let _Pelem = PElement(item);
                let rect = _Pelem.getRectData();
                autoFitX.push(rect.x * scale, (rect.x + rect.width / 2) * scale, (rect.x + rect.width) * scale);
                autoFitY.push(rect.y * scale, (rect.y + rect.height / 2) * scale, (rect.y + rect.height) * scale);
            });
            // 从小到大重新排序并去重
            autoFitX = [...new Set(autoFitX.insertSort((a, b) => a - b))];
            autoFitY = [...new Set(autoFitY.insertSort((a, b) => a - b))];
            // 合并网格线自动贴合点并去重
            let gridModel = util.deepClone(this.gridModel[`middle`]);
            if (gridModel) {
                gridModel.x = gridModel.x.map(item => item * scale);
                gridModel.y = gridModel.y.map(item => item * scale);
                autoFitX = [...new Set(autoFitX.concat(gridModel.x).insertSort((a, b) => a - b))];
                autoFitY = [...new Set(autoFitY.concat(gridModel.y).insertSort((a, b) => a - b))];
            }
            this.pageAutoFitPoint = {
                x: autoFitX,
                y: autoFitY,
            }
        },
        // 设置轨道参考线&吸附
        setTrackFit(elem, time) {
            const RANGE = 5;
            let autoFitPoint = this.trackAutoFit(elem);
            let fittest, fittestValue;
            let fitArr = autoFitPoint.filter(item => Math.abs(time - item) <= RANGE);
            if (fitArr.length) {
                this.trackReferencePoint.push(fitArr);
                let fitDiffArr = [];
                fitArr.forEach(item => {
                    fitDiffArr.push({value: item, diff: Math.abs(time - item)});
                })
                // 获取最近的吸附点
                fittest = Math.min.apply(null, fitDiffArr.map(item => item.diff));
                fittestValue = fitDiffArr.filter(item => item.diff === fittest)[0].value;
                return {diff: fittest, value: fittestValue};
            }
            return {diff: 100, value: time};
        },
        // 设置画布参考线&吸附
        setPageFit(rect, type) {
            this.pageReferencePoint[type] = [];
            let size = rect[type === `x` ? 'width' : 'height'];
            let find = (value, position) => {
                const RANGE = 1.5;
                let autoFitPoint = util.deepClone(this.pageAutoFitPoint[type]);
                let fitArr = autoFitPoint.filter(item => Math.abs(value - item) <= RANGE);
                let fittest, fittestValue;
                if (fitArr.length) {
                    let fitDiffArr = [];
                    fitArr.forEach(item => {
                        fitDiffArr.push({value: item, diff: Math.abs(value - item)});
                    })
                    // 获取最近的吸附点
                    fittest = Math.min.apply(null, fitDiffArr.map(item => item.diff));
                    fittestValue = fitDiffArr.filter(item => item.diff === fittest)[0].value;
                    let transform = '';
                    switch (position) {
                        case `start`:
                            transform = fittestValue;
                            break;
                        case `middle`:
                            transform = fittestValue - size / 2;
                            break;
                        case `end`:
                            transform = fittestValue - size;
                            break;
                    }
                    return {line: fittestValue, transform: transform};
                }
                return false;
            }
            let fitFinalArr = [];
            fitFinalArr.push(find(rect[type], `start`));
            fitFinalArr.push(find(rect[type] + size / 2, `middle`));
            fitFinalArr.push(find(rect[type] + size, `end`));
            fitFinalArr = fitFinalArr.filter(item => item);
            if (fitFinalArr.length) {
                let fittestFinal = Math.min.apply(null, fitFinalArr.map(item => item.transform));
                let fittestValue = fitFinalArr.filter(item => item.transform === fittestFinal)[0].line;
                this.pageReferencePoint[type].push(fittestValue);
                return fittestFinal;
            }
            return false;
        },
        // 初始化网格
        initCanvasGrid() {
            let width = document.querySelector(`.editor-page`).clientWidth;
            let height = document.querySelector(`.editor-page`).clientHeight;
            if (!width || !height) {
                return false;
            }
            // 生成网格坐标方法
            let create = size => {
                let obj = { x: [], y: [], };
                let w = Math.ceil(width / size);
                let h = Math.ceil(height / size);
                let x = (width - size * (w - 1)) / 2;
                let y = (height - size * (h - 1)) / 2;
                for (let i = 0; i < w; i++) {
                    obj.x.push(i * size + x);
                }
                for (let i = 0; i < h; i++) {
                    obj.y.push(i * size + y);
                }
                return obj;
            }
            this.gridModel = {
                'small': create(this.gridSize.s),
                'middle': create(this.gridSize.m),
                'large': create(this.gridSize.l),
            };
            this.gridRender();
        },
        // 渲染网格
        gridRender() {
            let result = '';
            let model = this.gridModel[`middle`];
            if (model) {
                let x = model.x[0];
                let y = model.y[0];
                let width = model.x[model.x.length - 1];
                let height = model.y[model.y.length - 1];
                // 生成 竖线
                result += model.x.map(i => {
                    return `M${i},${y}L${i},${height}`;
                }).join('');
                // 生成 横线
                result += model.y.map(i => {
                    return `M${x},${i}L${width},${i}`;
                }).join('');
            }
            this.gridPathValue = result;
        },
        // 显示/隐藏网格线
        toggleGridDisplay(b) {
            $('#editor-grid path').css('opacity', Number(!!b));
        },


        /**
         * 其他操作类方法 ----------------------------------------------------------
         */
        // 缩放时间轴
        scaleAxis(val) {
            const that = this;
            const minGap = 50;
            const maxGap = 250;
            const minAccuracy = 1;
            let gap = Number(that.axisGap.gap);
            let accuracy = Number(that.axisGap.accuracy);
            let getGapArr = (accuracy) => {
                switch (accuracy) {
                    case 1:
                        return [50, 60, 70, 80, 100, 120, 145, 175, 210, 250];
                    case 2:
                        return [50, 60, 70, 80];
                    default:
                        return [50, 60];
                }
            }
            let gapArr, gapIndex;
            switch (val) {
                // 放大
                case `add`:
                    if (accuracy === minAccuracy && gap === maxGap) return;
                    gapArr = getGapArr(accuracy);
                    gapIndex = gapArr.findIndex(item => item === gap);
                    if (gapIndex === gapArr.length - 1) {
                        accuracy = accuracy - 1;
                        gapArr = getGapArr(accuracy);
                        gap = gapArr[0];
                    } else {
                        gap = gapArr[gapIndex + 1];
                    }
                    break;
                // 缩小
                case `reduce`:
                    gapArr = getGapArr(accuracy);
                    gapIndex = gapArr.findIndex(item => item === gap);
                    if (gapIndex === 0) {
                        accuracy = accuracy + 1;
                        gapArr = getGapArr(accuracy);
                        gap = gapArr[gapArr.length - 1];
                    } else {
                        gap = gapArr[gapIndex - 1];
                    }
                    break;
                // 适应屏幕
                default:
                    let done = false;
                    for (var i = 1; i < 10; i++) {
                        if (done) break;
                        gapArr = getGapArr(i);
                        gapArr.forEach(ngap => {
                            let result = that.$refs.tracksDesk.offsetWidth - ((that.PMIXprojectData.page.duration / 1000) / (i / 2) * ngap)
                            if (result <= 2 * ngap && result > 0) {
                                gap = ngap;
                                accuracy = i;
                                done = true;
                                return;
                            }
                        })
                    }
                    break;
            }
            that.axisGap = {gap, accuracy};
        },
        // 轨道模拟滚动条触发监听
        tracksScrollbarScroll(event) {
            const that = this;
            let $scroll = this.$refs.tracksContainer;
            let barLenght = event.target.parentNode.clientHeight;
            let startY = event.pageY;
            let startTop = that.tracksVerticalScrollbar.top;
            util.mouseDownMoveEvent(mevent => {
                let updateTop = (mevent.pageY - startY) / barLenght * 100 + startTop;
                let max = 100 - that.tracksVerticalScrollbar.height;
                let scrollTop = util.NumberRange(updateTop, 0, max);
                // 计算滚动距离，更新滚动容器
                that.trackVerticalScroll(($scroll.scrollHeight - $scroll.offsetHeight) * scrollTop / max);
            });
        },
        // 主轨道片段添加按钮上传文件监听
        masterTrackAddFragment(event) {
            if (this.$refs.stockbar) this.$refs.stockbar.upload(event);
        },
        // 轨道上传文件进度监听（图片、音频、视频）
        trackUploadEvent(e, options) {
            const that = this;
            let files = e.target ? e.target.files : e;
            if(!files.length) return;

            // 默认配置
            let appendMediaConfig = {
                masterTypeArray: [`video`]
            }
            util.isObject(options) && Object.assign(appendMediaConfig, options);
            let inTime = 0;
            let append = index => {
                let file = files[index];
                // 拦截其它格式文件
                let type = file.type.split(`/`)[0];
                if ([`audio`, `video`, `image`].indexOf(type) < 0) {
                    return;
                }
                let fileUrl = util.getFileUrl(file);
                let id = util.uuid();
                that.commonMixinGetMediaInfo(fileUrl).then(res => {
                    let classify = appendMediaConfig.masterTypeArray.includes(res.type) ? `fragment` : ``;
                    that.PMIXappendMedia({
                        id: id,
                        type: type,
                        src: res.src,
                        title: file.name,
                        upload: ``,
                        classify,
                        media: {duration: res.media ? res.media.duration : ``},
                        cover: ``,
                        frame: ``,
                        width: res.width,
                        height: res.height,
                        inTime: inTime,
                        outTime: inTime + (res.media ? res.media.duration : 5000)
                    });
                    if (classify === 'fragment') inTime += res.media ? res.media.duration : 5000;
                    if (index < files.length - 1) {
                        index++;
                        append(index);
                    }
                });
                let t = setInterval(() => {
                    if ($(`.prop-wrap[data-id=${id}]`).length) {
                        let $track = $(`.prop-wrap[data-id=${id}]`);
                        // 获取帧图
                        that.commonMixinGetVideoFrame(fileUrl, 1, 1).then(srcRes => {
                            let frame = srcRes.frames[0];
                            $track.find(`.prop-content`).attr('style', `background-image:url(${frame});background-size:contain;`);
                        }).catch(()=>{});
                        clearInterval(t);
                        let Pelem = PElement(`#${id}`);
                        that.$task.add({
                            id: id,
                            key: 'upload',
                            type: 'append',
                            file: file,
                            projectId: that.projectInfo.id,
                            process: (process) => {
                                let $masking = $track.find(`.prop-upload-masking`);
                                $masking.find(`.upload-process`)[0].innerHTML = `${file.name} 上传中...${process}%`;
                            },
                            transferProcess: (process) => {
                                let $masking = $track.find(`.prop-upload-masking`);
                                $masking.find(`.upload-process`)[0].innerHTML = `${file.name} ${process === 0 ? `转码准备中，请稍后` : `转码中...${process}%`}`;
                            },
                            success: data => {
                                Pelem.refreshUpload('success', data);
                                $track.find(`.prop-content`).attr('style', ``);
                            },
                            fail: data => {
                                Pelem.refreshUpload('fail');
                            }
                        })
                        Pelem.refreshUpload('pending');
                    }
                }, 30);
            }
            append(0);
        },
        // 设置默认片段数据 opening => 片头 ending => 片尾
        setDefaultFragmentData(type) {
            const ENDING_ID = 83;
            switch (type) {
                case 'opening':
                    break;
                case 'ending':
                    let operatedMaster = JSON.parse(localStorage.getItem('procut_operated_master') || '{}');
                    // 未添加过默认片尾
                    if (!operatedMaster[this.projectInfo.id]) {
                        // 前端写死默认片尾 id
                        this.$api.TEMPLATE_DETAIL({ data: { id: ENDING_ID } }).then(res => {
                            let project = res.data.project;
                            let elems = JSON.parse(project.content.elements);
                            let rect = JSON.parse(project.content.page);
                            elems.frame = project.attr.frame;
                            this.PMIXappendFragmentEnding({elems, rect});
                        });
                        operatedMaster[this.projectInfo.id] = true;
                        localStorage.setItem('procut_operated_master', JSON.stringify(operatedMaster));
                    }
                    break;
            }
        },
        // 从库新增素材按钮点击
        addLibraryFragment() {
            if(this.$refs.stockbar) this.$refs.stockbar.open('media');
        },
        // 转场动画设置弹窗按钮点击
        fragmentTransitionOpen(item) {
            this.$refs.transitionModal.open(item);
        },
        // 主轨道转场效果设置
        setFragmentTransition(option) {
            const that = this;
            // 应用所有
            if (option.useAll) {
                that.transitionList.forEach(item => {
                    that.PMIXaddTransition({
                        id: item.id,
                        in: PElement(`#${item.in}`),
                        out: PElement(`#${item.out}`),
                        name: option.name,
                        type: option.type,
                        duration: option.duration,
                    });
                });
            } else {
                that.PMIXaddTransition({
                    id: option.id,
                    in: PElement(`#${option.in}`),
                    out: PElement(`#${option.out}`),
                    name: option.name,
                    type: option.type,
                    duration: option.duration,
                });
            }
        },
        // 轨道内icon取消静音
        iconSetMuted(elem) {
            this.PMIXMonitorMuted(false, true);
            let Pelem = PElement(`#${elem.id}`);
            Pelem.direct(Pelem.type, `setMuted`, Pelem.firstElement, false);
            if (Pelem.getInformation().media.volume === 0) {
                Pelem.direct(Pelem.type, `setVolume`, Pelem.firstElement, 100);
            }
        },
        // 编辑工程标题
        editProjectTitle() {
            this.titleEditing = true;
            this.$nextTick(() => {
                this.$refs.projectTitle.focus();
            });
        },
        // 右键菜单方法分发
        contextmenuCall(funname) {
            util.isFunctionCall(this[funname]);
            this.ECMIXremoveContextMenu();
        },
        // 打开分享弹出
        openShareModal() {
            this.$refs.shareModal.open();
        },
        // 打开导出弹出
        openExportModal() {
            if(this.userInfo.login){
                this.$refs.export.open();
            }else{
                logintip({
                    content: '亲，登录账号才能导出视频哦',
                    success: () => {
                        this.projectSave();
                    }
                });
            }
        },
        // 打开发布弹出
        openPublishModal() {
            let member = this.userInfo;
            if (member.memberType === `designer`) {
                this.$refs.designerPublish.open();
            } else {
                this.$refs.publish.open();
            }
        },
        // 打开登录注册弹窗
        openLoginModal(type){
            if(type === "login"){
                this.$login({
                    success: ()=>{
                        this.projectSave()
                    }
                });
            }else{
                this.$login({
                    type: 'accountRegister'
                });
            }
        },
    },
    destroyed(){
        for(let key in document){
            let index = key.indexOf('on');
            if(index === 0){
                document[key] = null;
            }
        }
        for(let key in window){
            let index = key.indexOf('on');
            if(index === 0){
                window[key] = null;
            }
        }
        $(document).unbind();
        window.removeEventListener("mousewheel", this.mousewheelEventListener);
    }
};
</script>

<style lang="less" scoped>
.view-container {
    position: relative;
    width: 100%;
    height: 100%;
    overflow: hidden;
    background-color: var(--backColor);
}
.project-loading {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 99999;
    background-color: #363b4c;
    img {
        position: absolute;
        top: -60px;
        left: 0;
        right: 0;
        bottom: 0;
        margin: auto;
        width: 400px;
    }
    span {
        position: absolute;
        top: 100px;
        left: 0;
        right: 0;
        bottom: 0;
        margin: auto;
        width: 100%;
        height: 40px;
        font-size: 18px;
        letter-spacing: 6px;
        color: #ffffff;
        text-align: center;
    }
}
.editor-header {
    position: relative;
    width: 100%;
    height: 70px;
    padding: 15px 25px;
    .header-left{
        width: 240px;
        white-space: nowrap;
        .base-button {
            width: 100%;
            font-size: 12px;
        }
        .header-back{
            display: inline-block;
            vertical-align: middle;
            width: 120px;
            height: 40px;
            padding: 4px;
            border-radius: 20px;
        }
        .header-save-status {
            display: inline-block;
            vertical-align: middle;
            margin-left: 15px;
            .save-icon {
                display: inline-block;
                vertical-align: middle;
                width: 20px;
                height: 20px;
                margin-right: 4px;
            }
            .base-icon {
                display: inline-block;
                vertical-align: middle;
                margin-right: 4px;
                font-size: 18px;
            }
            span {
                display: inline-block;
                vertical-align: middle;
                font-size: 12px;
            }
        }
    }
    .header-center{
        font-size: 14px;
        text-align: center;
        .project-title {
            display: inline-block;
            vertical-align: middle;
            max-width: 200px;
            margin-right: 10px;
            cursor: text;
        }
        .base-icon {
            display: inline-block;
            vertical-align: middle;
            font-size: 18px;
            cursor: pointer;
        }
    }
    .header-right{
        user-select: none;
        .redo,
        .undo {
            padding: 0;
            width: 36px;
            margin-right: 10px;
            .base-icon {
                font-size: 24px;
            }
        }
        .redo {
            margin-right: 50px;
        }
        .header-right-btn {
            width: 50px;
            height: 50px;
            padding: 4px;
            border-radius: 50px;
            overflow: hidden;
            & + .header-right-btn {
                margin-left: 15px;
            }
            .base-button {
                padding: 0;
                width: 40px;
                text-align: center;
                font-size: 12px;
            }
            .base-icon {
                font-size: 20px;
            }
        }

        .header-right-login{
            display: flex;
            align-items: center;
            justify-content: center;
            width: 132px;
            height: 50px;
            margin-left: 10px;
            border-radius: 25px;
            .register:hover {
                box-shadow: none;
            }
        }
    }
}
.editor-container {
    position: relative;
    width: 100%;
    height: calc(100% - 70px);
}
.center-wrap {
    position: relative;
    width: calc(100% - 88px - 325px);
    height: 100%;
    border-width: 0;
    border-radius: 20px 20px 0px 0px;
    .editor-window {
        position: relative;
        width: 100%;
        height: 100%;
        border-radius: inherit;
        .editor-wrap,
        .unabledit-masking,
        .buffering-masking {
            position: relative;
            width: 100%;
            height: calc(100% - 340px);
            padding: 10px;
            overflow: hidden;
            border-radius: inherit;
        }
        .editor-grabbing {
            cursor: grabbing !important;
        }
        .editor-grabbing .editor-page * {
            pointer-events: none !important;
        }
        .editor-call-element {
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            user-select: none;
        }
        .unabledit-masking {
            position: absolute;
            top: 0;
            left: 0;
            padding: 0;
            border-radius: 0;
        }
        .buffering-masking {
            position: absolute;
            top: 0;
            left: 0;
            padding: 0;
            border-radius: 0;
            pointer-events: none;
            i {
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                margin: auto;
                width: 80px;
                height: 80px;
                border: 6px solid var(--mainColor);
                border-radius: 50%;
                border-right-color: transparent;
                animation: rotate 0.8s infinite;
                @keyframes rotate {
                    from {
                        transform: rotate(0);
                    }
                    to {
                        transform: rotate(360deg);
                    }
                }
            }
        }
    }
}
.project-preview-fixed {
    position: fixed;
    top: 0;
    left: 0;
    z-index: 21;
    width: 100%;
    height: 100%;
    background: #000000 url("~@/assets/images/watermark.png") repeat;
}
</style>
<style lang="less">
// 元素操作框样式
.editor-operation {
    position: absolute;
    top: 0;
    left: 0;
    width: 0;
    height: 0;
    user-select: none;
    .operate-main {
        display: none;
        position: absolute;
        top: 0;
        left: 0;
        width: 0;
        height: 0;
        outline: 1px solid #999;
        pointer-events: none;
        &[style*="top"][style*="left"][style*="width"][style*="height"] {
            display: block;
        }
        &[data-lock="true"] {
            pointer-events: none;
            outline-color: var(--mainColor) !important;
            .operate-outline {
                cursor: default;
                pointer-events: none;
            }
            .operate-rotate,
            .operate-resizable {
                display: none !important;
            }
            & > .operate-group-mask .child {
                outline-color: var(--mainColor) !important;
            }
        }
        &[data-type*="text"] {
            .operate-resizable .t,
            .operate-resizable .b {
                display: none !important;
            }
        }
        &[data-type*="video"] {
            .operate-resizable .t,
            .operate-resizable .b,
            .operate-resizable .l,
            .operate-resizable .r {
                display: none !important;
            }
        }
        &[data-unpage] {
            .operate-rotate,
            .resize-handle {
                display: none !important;
            }
        }
        &.multi-select {
            outline-style: solid;
        }
        /* clip-image  图片元素裁剪状态（禁止元素移动、缩放、旋转）*/
        &.clip-image {
            outline: none;
            .operate-outline {
                display: none;
            }
            .operate-cropper {
                display: block;
                .cropper-hor-line,
                .cropper-ver-line {
                    display: none;
                }
            }
            & > .operate-resizable {
                display: none;
            }
            .operate-rotate {
                display: none;
            }
        }
        .operate-outline {
            position: absolute;
            opacity: 0;
            cursor: move;
            pointer-events: auto;
            &.t {
                top: -5px;
                left: 0;
                width: 100%;
                height: 10px;
            }
            &.r {
                right: -5px;
                top: 0;
                width: 10px;
                height: 100%;
            }
            &.b {
                bottom: -5px;
                left: 0;
                width: 100%;
                height: 10px;
            }
            &.l {
                left: -5px;
                top: 0;
                width: 10px;
                height: 100%;
            }
        }
        .operate-group-mask {
            position: absolute;
            top: 0;
            left: 0;
            width: 0;
            height: 0;
            .child {
                position: absolute;
                outline: 1px dashed #999;
                pointer-events: auto;
                cursor: move;
            }
        }
        .operate-rotate {
            position: absolute;
            top: 0;
            left: 100%;
            margin: -25px 0 0 5px;
            width: 20px;
            height: 20px;
            pointer-events: auto;
            user-select: none;
            cursor: url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAMAAAAoLQ9TAAAANlBMVEUAAADNzc3Pz8/Nzc3Nzc3Nzc3Nzc3Pz8/MzMzNzc3MzMzPz8/MzMzPz8/Nzc3MzMzNzc3Nzc0JGSgBAAAAEXRSTlMAwBDwcOCQIKBgUEDPMNCvgDLJyPEAAABtSURBVBjTbYxbDsMwCARtMOBX0u79L1sbI1WRMj+ws9KmV0wFmIWSdc8NB2mcI7OOUrfbwtahXZQQCvZsHEKgvjTyoq0HGOkB0J/iRv2HGL/O18kPCXicZp7iYmDqR4CbwmQ41bPTv7kWS6/8AKRcBKjFjx4KAAAAAElFTkSuQmCC") 8 8, default;
            .rotate-degree {
                position: absolute;
                left: 16px;
                top: calc(50% - 20px);
                display: none;
                font-size: 12px;
                text-align: center;
                color: #505050;
            }
            .rotate-icon {
                display: block;
                width: 100%;
                height: 100%;
                background-image: url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABMAAAAUCAMAAABYi/ZGAAAA51BMVEUAAABKS01KS01KS01KS03+/v78/PxKS01KS01KS03t7e1KS01KS039/f3////09fXe39/////Nzc7////9/f1KS02pqqr+/v7+/v7////5+fn////9/f3////9/f3////09PX09PX6+vri4uL+/v7f3+Dg4ODJycr////////////4+PhpaWtKS03///8dISY+QUTv7+/////p6enf4OAPDw/5+fns7e11dXVfYGFZXF8WFhYBAQHz8/Pc3N3Q0NDJycnAwMChoaGVlZWAgIBaXWBXV1dVVVVLS0s7OzspKSkgICAGBgYIF6eyAAAAL3RSTlMAChsGGL1UIhANfyoU/NnIjIpzcVAwI/Tw6OTEurisqKiHdHBrW0xDPzYeGRgPDMCa2qAAAADHSURBVBjTZczljkIxEIbhzrTHD7oL665oewx3t/u/HgglJAPvn0mefBl2yDRMdtFN0DHqFxQrGfRTD0+50tnSSvaSZNddt0Zv/yf7HCgZ3qWi8Wy7aJS1gRt0Mlgt/n40Vq2cNsfKZ/IWIoqfqBtV9A69giV8XyC+t6ffR+O2QN8BcGzxNVm+Mo0A/Hhrf8NNmtGgGCT3nJpphL3w+ZaYMZdStl/orqmkatIdd2MVu/QhYPYxi0BNeAVPUOM2WmhzRhEc0HTVHsWTEulp+V6xAAAAAElFTkSuQmCC");
                background-size: 100% 100%;
            }
        }
        .operate-resizable {
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            .resize-handle {
                position: absolute;
                width: 10px;
                height: 10px;
                border: 1px solid #a1a4ad;
                background-color: #ffffff;
                transform: translate(-50%, -50%);
                border-radius: 50%;
                pointer-events: auto;
                &::after {
                    content: "";
                    position: absolute;
                    top: -5px;
                    left: -5px;
                    width: 20px;
                    height: 20px;
                }
                &.t,
                &.b {
                    width: 16px;
                    height: 8px;
                    border-radius: 5px;
                }
                &.l,
                &.r {
                    width: 8px;
                    height: 16px;
                    border-radius: 5px;
                }
                &.tl {
                    top: 0;
                    left: 0;
                }
                &.t {
                    top: 0;
                    left: 50%;
                }
                &.tr {
                    top: 0;
                    left: 100%;
                }
                &.r {
                    top: 50%;
                    left: 100%;
                }
                &.br {
                    top: 100%;
                    left: 100%;
                }
                &.b {
                    top: 100%;
                    left: 50%;
                }
                &.bl {
                    top: 100%;
                    left: 0;
                }
                &.l {
                    top: 50%;
                    left: 0;
                }
            }
        }
        // 锁定按钮
        .operate-lock {
            display: none;
            position: absolute;
            right: -12px;
            top: -12px;
            width: 24px;
            height: 24px;
            background-color: var(--mainColor);
            border: 1px solid rgba(0, 0, 0, 0.2);
            border-radius: 50%;
            cursor: pointer;
            pointer-events: auto;
            .base-icon {
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
            }
        }
        .operate-resize-number {
            position: fixed;
            right: 0;
            top: 0;
            z-index: 9;
            display: none;
            width: 60px;
            width: min-content;
            height: 22px;
            line-height: 22px;
            padding: 0 5px;
            background-color: #202735;
            border-radius: 4px;
            opacity: 0.3;
            text-align: center;
            font-size: 10px;
            color: #ffffff;
        }
        // 裁剪框
        .operate-cropper {
            position: absolute;
            top: 0;
            left: 0;
            bottom: 0;
            right: 0;
            display: none;
            pointer-events: auto;
            .clip-wrap {
                position: absolute;
                cursor: move;
                outline: 2px solid var(--mainColor);
            }
            .ui-resizable-handle {
                position: absolute;
                width: 14px;
                height: 14px;
                background: #ffffff;
                border: 2px solid var(--mainColor);
            }
            .ui-resizable-nw {
                top: -7px;
                left: -7px;
                cursor: nw-resize;
                &::before {
                    top: 2px;
                    left: 2px;
                    width: 3px;
                    height: 13px;
                }
                &::after {
                    top: 2px;
                    left: 6px;
                    width: 10px;
                    height: 3px;
                    border-left: none;
                }
            }
            .ui-resizable-ne {
                top: -7px;
                right: -7px;
                cursor: ne-resize;
            }
            .ui-resizable-sw {
                bottom: -7px;
                left: -7px;
                cursor: sw-resize;
            }
            .ui-resizable-se {
                bottom: -7px;
                right: -7px;
                cursor: se-resize;
            }

            .cropper-hor-line {
                &::before,
                &::after {
                    content: '';
                    position: absolute;
                    border: 0 dashed #a1a4ad;
                }
                &::before {
                    left: 0;
                    top: 0;
                    width: 100%;
                    border-top-width: 1px;
                }
                &::after {
                    left: 0;
                    bottom: 0;
                    width: 100%;
                    border-bottom-width: 1px;
                }
            }
            .cropper-ver-line {
                &::before,
                &::after {
                    content: '';
                    position: absolute;
                    border: 0 dashed #a1a4ad;
                }
                &::before {
                    left: 0;
                    top: 0;
                    height: 100%;
                    border-left-width: 1px;
                }
                &::after {
                    right: 0;
                    top: 0;
                    height: 100%;
                    border-right-width: 1px;
                }
            }
        }
    }
    .operate-edit-tip {
        display: none;
        position: absolute;
        left: 0;
        top: -34px;
        width: max-content;
        height: 25px;
        padding: 0 10px;
        line-height: 26px;
        background-color: rgba(0, 0, 0, 0.4);
        border-radius: 4px;
        color: #fff;
        font-size: 12px;
    }
    .operate-preview {
        position: absolute;
        top: 0;
        left: 0;
        width: 0;
        height: 0;
        outline: 1px dashed #999;
        pointer-events: none;
        &.lock {
            outline: 1px dashed var(--mainColor);
        }
    }
    .operate-fake-group {
        display: none;
        position: absolute;
        top: 0;
        left: 0;
        width: 0;
        height: 0;
        outline: 1px dashed #a1a4ad;
        pointer-events: none;
        &[style*="top"][style*="left"][style*="width"][style*="height"] {
            display: block;
        }
    }
}
.editor-surface {
    display: none;
    position: absolute;
    top: 0;
    left: 0;
    width: 0;
    height: 0;
    z-index: 11;
    border: 1px solid var(--mainColor);
    opacity: 0.6;
    &[style*="top"][style*="left"][style*="width"][style*="height"] {
        display: block;
    }
}
.operate-contextmenu {
    &[style*="top"][style*="left"] {
        display: block;
    }
    display: none;
    position: fixed;
    top: 0;
    left: 0;
    z-index: 99;
    width: 215px;
    padding: 10px 30px;
    border-radius: 5px;
    .menu-bar {
        padding: 8px 0;
    }
    .menu-item {
        padding: 8px 0;
        line-height: 16px;
        cursor: pointer;
        &:hover span {
            color: var(--mainColor);
        }
        .right {
            float: right;
            color: #888888;
        }
    }
}
// 网格实体
.editor-grid {
    position: absolute;
    top: 0;
    left: 0;
    z-index: 5;
    width: 100%;
    height: 100%;
    pointer-events: none;
    path {
        opacity: 0;
        transform-origin: 0 0;
        transition: opacity 0.1s;
    }
}
 // 画布参考线
.page-reference {
    position: absolute;
    top: 0;
    left: 0;
    z-index: 2;
    &.vertical {
        width: 0;
        height: 100%;
        border-left: 1px dashed var(--mainColor);
    }
    &.horizontal {
        width: 100%;
        height: 0;
        border-top: 1px dashed var(--mainColor);
    }
}
</style>
<style lang="less">
// 轨道面板样式
.editor-tracks {
    position: absolute;
    left: 10px;
    right: 10px;
    bottom: 0;
    height: auto;
    border-radius: 10px 10px 0px 0px;
    .tracks-header {
        height: 84px;
        padding: 30px 20px;
        font-size: 12px;
        white-space: nowrap;
        .header-left {
            width: 300px;
            & > * {
                display: inline-block;
                vertical-align: middle;
                & + * {
                    margin-left: 15px;
                }
            }
            .base-icon {
                font-size: 20px;
            }
            .base-button.flat {
                border-radius: 5px;
                .base-icon,
                span {
                    display: inline-block;
                    vertical-align: middle;
                }
            }
            .speed {
                position: relative;
                overflow: hidden;
                &:hover {
                    overflow: visible;
                    .control {
                        opacity: 1;
                    }
                }
                .control {
                    position: absolute;
                    left: -68px;
                    bottom: calc(100% + 20px);
                    z-index: 11;
                    padding: 40px 20px 20px;
                    width: 300px;
                    height: 90px;
                    border-radius: 5px;
                    opacity: 0;
                    &::before {
                        content: "";
                        position: absolute;
                        top: 0;
                        left: 0;
                        right: 0;
                        bottom: -20px;
                    }
                    &:active::before {
                        top: -200px;
                        left: -200px;
                        right: -200px;
                    }
                    .speed-slider {
                        position: relative;
                        width: 240px;
                        margin: 0 auto;
                        .base-slider {
                            width: 100%;
                            padding: 0;
                        }
                    }
                    .speed-list {
                        position: relative;
                        width: 240px;
                        margin: 0 auto;
                        line-height: 20px;
                        li {
                            position: absolute;
                            top: 0;
                            left: 0;
                            transform: translateX(-50%);
                            cursor: pointer;
                        }
                    }
                }
            }
        }
        .header-center {
            & > * {
                display: inline-block;
                vertical-align: middle;
                & + * {
                    margin-left: 10px;
                }
            }
            .base-button.flat {
                width: 34px;
                padding: 0;
                border-radius: 5px;
                &.playtoggle {
                    width: 40px;
                }
            }
            .base-icon {
                font-size: 20px;
            }
            .base-icon.iconbofang,
            .base-icon.iconzanting {
                font-size: 30px;
            }
            .header-timer {
                width: 120px;
                font-size: 14px;
                .duration {
                    color: var(--dimColor);
                }
            }
        }
        .header-right {
            width: 300px;
            text-align: right;
            & > * {
                display: inline-block;
                vertical-align: middle;
                & + * {
                    margin-left: 10px;
                }
            }
            .base-icon {
                font-size: 20px;
            }
            .volume {
                position: relative;
                overflow: hidden;
                &:hover {
                    overflow: visible;
                    .control {
                        opacity: 1;
                    }
                }
                .base-button {
                    width: 28px;
                    padding: 0;
                }
                .control {
                    position: absolute;
                    left: -6px;
                    bottom: calc(100% + 10px);
                    z-index: 4;
                    padding: 10px 0 0;
                    width: 40px;
                    height: 180px;
                    border-radius: 5px;
                    opacity: 0;
                    text-align: center;
                    &::before {
                        content: "";
                        position: absolute;
                        top: 0;
                        left: 0;
                        right: 0;
                        bottom: -10px;
                    }
                    &:active::before {
                        top: -200px;
                        left: -200px;
                        right: -200px;
                    }
                    .value {
                        font-size: 12px;
                        line-height: 20px;
                    }
                    .base-slider {
                        height: 150px;
                        padding: 12px 14px;
                    }
                }
            }
            .axis-adjust {
                .base-button + .base-button {
                    margin-left: 4px;
                }
                .base-button:not(.auto) {
                    width: 28px;
                    padding: 0;
                    .base-icon {
                        font-size: 14px;
                    }
                }
                .auto {
                    padding: 0 10px;
                }
            }
        }
    }
}
.tracks-body {
    position: relative;
    user-select: none;
    padding: 0 20px;
}
.empty-timeline {
    width: 100%;
    height: 254px;
    flex-direction: column;
    .empty-timeline-push {
        width: 202px;
        height: 112px;
        padding: 5px;
        border-radius: 5px;
        & + .empty-timeline-push {
            margin-left: 60px;
        }
        .base-button {
            width: 100%;
            padding: 0;
            .base-icon {
                font-size: 20px;
                &.iconpianduantianjia {
                    width: 20px;
                    height: 20px;
                    line-height: 20px;
                    border-radius: 50%;
                    color: #ffffff;
                    font-size: 12px;
                    text-align: center;
                    background-color: var(--textColor);
                }
            }
            span {
                display: block;
                line-height: 16px;
                margin-top: 10px;
                font-size: 12px;
                color: var(--stressColor);
            }
        }
    }
}
.timeline-wrap {
    display: block;
    position: relative;
    width: 100%;
    height: 254px;
    padding: 0 10px;
    overflow-x: auto;
    overflow-y: hidden;
}
.timeline {
    display: block;
    position: relative;
    width: auto;
    min-width: 100%;
    height: 100%;
}
.timeline-axis {
    position: relative;
    width: 100%;
    height: 30px;
    pointer-events: none;
    &::before {
        top: auto;
        bottom: 0;
    }
    .axis-mark {
        position: absolute;
        bottom: 2px;
        left: 0;
        height: 4px;
        &:first-child .axis-time {
            transform: translateX(0);
        }
        .axis-time {
            position: absolute;
            bottom: 120%;
            font-size: 12px;
            transform: translateX(-50%);
            font-weight: 100;
            font-family: Arail;
            white-space: nowrap;
        }
    }
}
.timeline-tracks {
    width: 100%;
    height: calc(100% - 30px);
    overflow-x: hidden;
    overflow-y: auto;
    &::-webkit-scrollbar {
        display: none !important;
    }
    &::before {
        content: "";
        display: inline-block;
        vertical-align: middle;
        width: 0;
        height: 100%;
    }
    .timeline-tracks-middle {
        position: relative;
        display: inline-block;
        vertical-align: middle;
        width: 100%;
        padding: 10px 0 20px;
    }
    .track {
        position: relative;
        width: 100%;
        height: 32px;
        line-height: 30px;
        border-radius: 4px;
        & + .track {
            margin-top: 4px;
        }
        &.master {
            height: 60px;
            line-height: 58px;
            .prop-wrap {
                &.selected,
                &:hover {
                    clip-path: none !important;
                    .prop-content .badge {
                        &.duration {
                            opacity: 1;
                        }
                    }
                }
                .prop-content {
                    padding: 0 22px;
                }
                .prop-handle {
                    min-width: 40px;
                    .handle-left,
                    .handle-right {
                        width: 20px;
                        .base-icon {
                            width: 20px;
                            font-size: 20px;
                        }
                    }
                }
            }
        }
        &.element {
            .prop-wrap {
                .prop-handle {
                    min-width: 24px;
                }
            }
        }
        &.audio {
            .prop-wrap {
                .prop-content {
                    & > .frame-cover {
                        & ~ * {
                            position: relative;
                        }
                    }
                    & > .fade-cover{
                        position: absolute;
                        top: 0;
                        left: 0;
                        width: 100%;
                        height: 100%;
                        background: linear-gradient(to right,rgba(255,255,255,.3), rgba(255,255,255,.01), rgba(255,255,255,.3));
                        &[data-in]{
                            border-top-left-radius: 30%;
                            border-bottom-left-radius: 30%;
                        }
                        &[data-out]{
                            border-top-right-radius: 30%;
                            border-bottom-right-radius: 30%;
                        }
                    }
                }
            }
        }
        &:not(.erase){
            .prop-wrap{
                &.selected{
                    .handle-tip{
                        display: block;
                    }
                }
            }
        }
    }
    .prop-wrap {
        position: absolute;
        top: 0;
        left: 0;
        width: auto;
        height: 100%;
        padding-right: 3px;
        border-radius: 4px;
        overflow: hidden;
        cursor: pointer;
        &.moving {
            cursor: grabbing !important;
        }
        &:hover,
        &.selected {
            z-index: 2 !important;
            .prop-handle {
                display: block;
            }
        }
    }
    .premove-prop-wrap {
        display: none;
        position: absolute;
        top: 0;
        left: 0;
        width: 100px;
        height: 100%;
        border-radius: 4px;
        border: 2px dashed var(--mainColor);
        pointer-events: none;
        overflow: hidden;
        &::before {
            content: "";
            display: block;
            width: 100%;
            height: 100%;
            background-color: var(--mainColor);
            opacity: 0.15;
        }
        &[style*="left"][style*="width"] {
            display: block;
        }
    }
    .prop-handle {
        display: none;
        position: absolute;
        top: 0;
        left: 0;
        z-index: 1;
        width: 100%;
        height: 100%;
        border: 2px solid #000000;
        border-radius: inherit;
        .handle-left,
        .handle-right {
            position: absolute;
            top: -2px;
            bottom: -2px;
            width: 12px;
            text-align: center;
            color: var(--stressColor);
            background: rgba(0, 0, 0, .6);
            cursor: ew-resize;
            transition: color 0.15s;
            &:hover {
                color: var(--mainColor);
                .base-icon{
                    color: var(--mainColor);
                }
            }
            .base-icon {
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                margin: auto;
                width: 12px;
                height: 20px;
                line-height: 20px;
                font-size: 12px;
                color: #ffffff;
            }
        }
        .handle-left {
            left: 0;
            border-radius: 4px 0 0 4px;
        }
        .handle-right {
            right: 0;
            border-radius: 0 4px 4px 0;
        }
        .handle-tip{
            display: none;
            position: absolute;
            top: -30px;
            left: -15px;
            height: 20px;
            line-height: 20px;
            padding: 0 8px;
            background: #e9edf0;
            border: 1px solid #d7dee4;
            border-radius: 9px;
            font-size: 12px;
            color: #666666;
            text-align: center;
            &::before{
                content: "";
                position: absolute;
                top: 18px;
                left: 6px;
                border-top: 7px solid #d7dee4;
                border-left: 7px solid transparent;
                border-right: 7px solid transparent;
            }
            &::after{
                content: "";
                position: absolute;
                top: 18px;
                left: 8px;
                border-top: 5px solid #e9edf0;
                border-left: 5px solid transparent;
                border-right: 5px solid transparent;
            }
        }
    }
    .prop-content {
        display: block;
        position: relative;
        height: 100%;
        padding: 0 14px;
        color: #ffffff;
        font-size: 0;
        overflow: hidden;
        white-space: nowrap;
        border-radius: inherit;
        &::before {
            content: "";
            display: inline-block;
            vertical-align: middle;
            width: 0;
            height: 100%;
        }
        & > * {
            display: inline-block;
            vertical-align: middle;
            color: inherit;
            font-size: 12px;
        }
        & > .cover {
            width: auto;
            height: auto;
            max-width: 50px;
            max-height: 24px;
            margin-right: 5px;
        }
        & > .iconfont {
            font-size: 18px;
            margin-right: 5px;
        }
        & > .name {
            width: 100%;
            overflow: hidden;
            white-space: nowrap;
        }
        & > .badge {
            position: relative;
            vertical-align: top;
            height: 18px;
            line-height: 19px;
            padding: 0 4px;
            margin: 5px 0 0 0;
            border-radius: 2px;
            font-size: 12px;
            background-color: rgba(0, 0, 0, 0.5);
            &.duration {
                opacity: 0;
                transition: opacity 0.1s;
            }
            & + .badge {
                margin-left: 2px !important;
            }
            .iconfont {
                font-size: 14px;
            }
        }
        & > .badge-icon {
            position: relative;
            vertical-align: top;
            height: 18px;
            line-height: 18px;
            margin: 6px 0 0 0;
            font-size: 22px;
        }
        & > .frame-cover {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            image-rendering: pixelated;
            background-size: 100% 100%;
            .frame-item {
                position: absolute;
                top: 0;
                left: 0;
            }
        }
        & > .animate-marker {
            position: absolute;
            left: 14px;
            bottom: 2px;
            width: calc(100% - 24px);
            height: 4px;
            .infinity {
                position: absolute;
                bottom: 0;
                left: 2px;
                right: 2px;
                height: 1px;
                background-color: #ffffff;
                &::before,
                &::after {
                    content: "";
                    position: absolute;
                    top: -3px;
                    width: 8px;
                    height: 4px;
                    border-radius: 1px;
                    background-color: #ffffff;
                }
                &::before {
                    left: -1px;
                }
                &::after {
                    right: -1px;
                }
            }
            .in,
            .out {
                position: absolute;
                bottom: 2px;
                height: 1px;
                background-color: #ffffff;
            }
            .in {
                left: 0;
                &::after {
                    content: "";
                    position: absolute;
                    top: -3px;
                    right: -8px;
                    width: 8px;
                    height: 4px;
                    border-radius: 1px;
                    background-color: #ffffff;
                }
            }
            .out {
                right: 0;
                &::before {
                    content: "";
                    position: absolute;
                    top: -3px;
                    left: -8px;
                    width: 8px;
                    height: 4px;
                    border-radius: 1px;
                    background-color: #ffffff;
                }
            }
        }
        & > .muted {
            z-index: 1;
            cursor: pointer;
        }
    }
    .track-insert-line {
        position: absolute;
        left: 0 !important;
        width: 100% !important;
        height: 4px;
        padding: 1px 0;
        transition: all .3s;
        &.hover::before {
            content: "";
            display: block;
            width: 100%;
            height: 100%;
            background-color: var(--mainColor);
        }
        &.open{
            position: relative;
            width: 100%;
            height: 32px;
            line-height: 30px;
            border-radius: 4px;
        }
        &.before {
            top: -5px;
        }
        &.after {
            bottom: -5px;
        }
    }
    .prop-transition-wrap {
        position: absolute;
        top: 0;
        left: 0;
        width: 0;
        height: 100%;
        .prop-transition-item {
            position: absolute;
            top: 50%;
            left: 0;
            margin: -9px 0 0 -9px;
            width: 18px;
            height: 18px;
            line-height: 18px;
            border-radius: 3px;
            text-align: center;
            background-color: #ffffff;
            box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.3);
            cursor: pointer;
            z-index: 2;
        }
        .base-icon {
            font-size: 13px;
            color: var(--textColor);
        }
    }
    .prop-upload-masking{
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, .2);
        text-align: left;
        padding-left: 22px;
        .upload-process{
            color: #fff;
            font-size: 12px;
        }
    }
    .prop-upload-fail{
        position: absolute;
        left: 0;
        width: 100%;
        height: 100%;
        padding-left: 20px;
        border: 1px dashed #ff807f;
        background: rgba(255,128,127,0.10);
        border-radius: 5px;
        text-align: left;
        color: #FF807F;
        font-weight: bold;
        z-index: 2;
        span {
            color: #999999;
            font-weight: normal;
        }
        a {
            color: inherit;
            text-decoration: underline;
        }
    }
}
.timeline-seek {
    position: absolute;
    top: 0;
    left: 0;
    z-index: 3;
    width: 15px;
    height: 100%;
    margin-left: -7px;
    padding: 0 6.5px;
    background-clip: content-box;
    background-color: var(--antiColor);
    cursor: grab;
    transform: translateX(0);
    &::before {
        content: "";
        position: absolute;
        top: 0;
        left: 0;
        width: 15px;
        height: 15px;
        background-color: inherit;
    }
    &::after {
        content: "";
        position: absolute;
        top: 15px;
        left: 0;
        bottom: 0;
        width: 1px;
        height: 1px;
        background-clip: content-box;
        background-color: inherit;
        border: 7px solid var(--antiColor);
        border-left-color: transparent;
        border-right-color: transparent;
        border-bottom-color: transparent;
    }
    &.seeking {
        cursor: grabbing;
    }
}
.timeline-reference {
    position: absolute;
    top: 0;
    left: 0;
    width: 2px;
    height: 100%;
    background: var(--mainColor);
}
.tracks-vertical-scrollbar {
    top: 30px;
    right: -10px;
}
</style>