<template>
    <transition name="modal-fade">
        <div class="font-family-list">
            <div class="font-family-header">
                <!-- 中/英文 -->
                <button class="font-family-btn" 
                    :class="{'current': text_family_list_show === 'family' && select_family_list_index === index}" 
                    @click.stop="selectFamilyLang('family', index)" 
                    v-for="(item, index) in text_family_list" 
                    :key="index"
                >
                    <span>{{item.lang}}</span>
                </button>
                <!-- 艺术字 -->
                <button class="font-family-btn" :class="{'current': text_family_list_show === 'art'}" @click.stop="selectFamilyLang('art')">
                    <span>艺术字</span>
                </button>
            </div>
            <div class="font-family-content" v-if="text_family_list_show === 'family'">
                <div class="family-lately-use" v-if="family_lately_use_list && family_lately_use_list.length">
                    <span>最近使用</span>
                    <ul class="lately-use-list">
                        <li v-for="font in family_lately_use_list" 
                            :key="font.name" 
                            v-show="font.show" 
                            :class="{
                                'image': !!font.image, 
                                'haschild': font.childrenList, 
                                'current': font.childrenList && element_message.font_family.indexOf(font.f_name) >= 0
                            }" 
                            @click="set_font_family(font)" 
                            @mouseenter="toggle_font_child($event, font)" 
                            @mouseleave="toggle_font_child($event, font)">
                            <img class="preview" :src="font.image" alt="字体预览图" />
                            {{font.alias || font.name}}
                            <img v-show="font.loading" class="loading" src="../../../assets/common/images/loading.gif" alt="加载中" />
                        </li>
                    </ul>
                </div>
                <ul class="family_list" v-for="(item, index) in filter_family_list" :key="index">
                    <li v-for="font in item.item" 
                        :key="font.name" 
                        v-show="font.show" 
                        :class="{
                            'image': font.image, 
                            'checked': element_message.font_family === font.name && !font.childrenList, 
                            'haschild': font.childrenList, 
                            'current': font.childrenList && element_message.font_family.indexOf(font.f_name) >= 0
                        }" 
                        @click="set_font_family(font)" 
                        @mouseenter="toggle_font_child($event, font)" 
                        @mouseleave="toggle_font_child($event, font)">
                        <img class="preview" :src="font.image" alt="字体预览图" />
                        {{font.name}}
                        <img v-show="font.loading" class="loading" src="../../../assets/common/images/loading.gif" alt="加载中" />
                    </li>
                </ul>
                <ul class="font_family_childrenList" 
                    v-show="family_childrenList_show"
                    @mouseenter="toggle_fontfamily_childList_show" 
                    @mouseleave="toggle_fontfamily_childList_show">
                    <li v-for="(item, index) in font_family_childrenList" 
                        :id="item.data"
                        :key="index" 
                        :class="{'current':element_message.font_family === item.name}"
                        @click="set_font_family(item)"
                    >
                        {{ item.alias }}
                    </li>
                </ul>
            </div>
            <div class="font-art-content" v-if="text_family_list_show === 'art'">
                <ul class="font-art-list">
                    <li :class="{'current': element_message.text_type !== 'art'}" @click="clearTextArt()">
                        <span>无</span>
                    </li>
                    <li :class="{'current': item.key === element_message.text_art_key}" v-for="(item,index) in art_material_list" :key="index" @click="change_text_art(item)">
                        <img v-show="item.image" :src="item.image" alt="" />
                    </li>
                </ul>
            </div>
        </div>
    </transition>
</template>

<script>
    import font_family_array from '@/assets/font/fontFamily.js';
    import opt_factory from '@/assets/pc/js/opt/opt_factory.js';
    export default {
        name: 'TextFamilyPanel',
        props: {
            element_message: {
                type: Object,
                default: () => {}
            }
        },
        data() {
            return {
                select_family_list_index: 0,                              // 筛选显示列表的下标
                text_family_list:   font_family_array.family,             // font-family列表  -- 所有的
                art_material_list:  font_family_array.art,                // 艺术字素材列表
                filter_family_list: [],                                   // 筛选显示的font-family列表
                font_family_childrenList: [],                             // 显示的子字体列表
                text_family_list_show: 'family',                          // 字体下拉列表显示状态 family => 字体, art => 艺术字
                family_lately_use_list: [],                               // 最近字体使用列表
                family_childrenList_remove_timer: null,                   // 控制字体子列表显示或隐藏定时器
                family_childrenList_show: false,                          // 子列表显示 / 隐藏标识
            }
        },
        created () {
            let font_array = opt_factory.init_opt('text').fn.clone_object(font_family_array);
            this.filter_family_list = font_array.family[0].item;
        },
        mounted() {
            // let font_array = opt_factory.init_opt('text').fn.clone_object(font_family_array);
            // this.filter_family_list = font_array.family[0].item;

            // 最近使用字体列表数据
            let family_lately_use_list = localStorage.getItem('family_lately_use_list');
            this.family_lately_use_list = JSON.parse(family_lately_use_list) || [];
        },
        methods: {
            // 选择文本字体语言
            selectFamilyLang(type, index) {
                this.text_family_list_show = type;
                if (index === this.select_family_list_index || type === 'art') return;
                this.select_family_list_index = index;
                this.filter_family_list = this.text_family_list[index].item;
            },
            // 选择文本字体
            set_font_family:function(item){
                this.addFamilyLatelyUse(item);
                this.$emit('set_font_family', item);
                console.log(item);
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
        },
    }
</script>

<style lang="less" scoped>
.font-family-list{
    position: absolute;
    top: calc(100% + 5px);
    left: 0;
    z-index: 10;
    width: 200px;
    background: #ffffff;
    border: 1px solid #eeeeee;
    border-radius: 6px;
    box-shadow: 0px 0px 8px 0px rgba(153,153,153,0.10); 
    .font-family-header{
        display: flex;
        width: 100%;
        background: #fafafa;
        .font-family-btn{
            display: flex;
            align-items: center;
            justify-content: center;
            width: 60px;
            height: 40px;
            border-right: 1px solid #eeeeee;
            border-bottom: 1px solid #eeeeee;
            cursor: pointer;
            &.current{
                border-bottom: none;
                background: #ffffff;
                span{
                    font-weight: 500;
                }
            }
            span{
                font-size: 12px;
                font-weight: 400;
                color: #444444;
            }
        }
        &::after{
            content: '';
            flex: 1;
            border-bottom: 1px solid #eeeeee;
        }
    }
    .font-family-content{
        width: 100%;
        max-height: 480px;
        background: #ffffff;
        overflow-y: auto;

        .family-lately-use{
            padding: 10px;
            width: 100%;
            text-align: left;

            span{
                font-size: 12px;
                color: #cccccc;
            }
            .lately-use-list{
                margin-top: 10px;
                width: 100%;
                li{
                    padding-left: 12px;
                    position: relative;
                    display: flex;
                    align-items: center;
                    width: 180px;
                    height: 32px;
                    border-radius: 5px;
                    font-size: 14px;
                    color: #444444;
                    cursor: pointer;
                    overflow: hidden;
                    &.image {
                        padding-left: 0;
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
                    &:hover {
                        background-color: #fafafa;
                    }
                    &.checked {
                        cursor: default;
                        background-color: #f4f4f4;
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
                            border-width: 4px;
                            border-style: solid;
                            border-color: #999999 transparent transparent transparent;
                            transition: all 0.3s;
                            transform: rotate(-90deg);
                            cursor: pointer;
                        }
                    }
                }
            }
        }

        .family_list{
            padding: 10px;
            width: 100%;
            border-top: 1px solid #eeeeee;
            li{
                padding-left: 12px;
                position: relative;
                display: flex;
                align-items: center;
                width: 180px;
                height: 32px;
                border-radius: 5px;
                font-size: 14px;
                color: #444444;
                cursor: pointer;
                overflow: hidden;
                &.image {
                    padding-left: 0;
                    font-size: 0;
                    .preview {
                        display: block;
                    }
                }
                .preview {
                    display: none;
                    height: 28px;
                    width: auto;
                    max-width: calc(100% - 50px);
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
                &:hover {
                    background-color: #fafafa;
                }
                &.checked {
                    cursor: default;
                    background-color: #f4f4f4;
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
                        border-width: 4px;
                        border-style: solid;
                        border-color: #999999 transparent transparent transparent;
                        transition: all 0.3s;
                        transform: rotate(-90deg);
                        cursor: pointer;
                    }
                }
            }
        }
        .font_family_childrenList{
            position:fixed;
            width: 120px;
            height: auto;
            padding: 10px;
            background: #ffffff;
            border: 1px solid #eeeeee;
            border-radius: 6px;
            box-shadow: 0px 0px 8px 0px rgba(153,153,153,0.10); 
            z-index: 100;
            li{
                display: flex;
                justify-content: center;
                align-items: center;
                width: 100px;
                height: 32px;
                border-radius: 5px;
                color:#202124;
                font-size: 10px;
                overflow: hidden;
                white-space: nowrap;
                text-overflow: ellipsis;  
                cursor: pointer;  
                &.current {
                    background: #f4f4f4;
                }
                &:hover{
                    background: #fafafa;
                }
            }
            &:hover{
                display:block;
            }
        }
    }

    .font-art-content{
        width: 100%;
        max-height: 480px;
        background: #ffffff;
        overflow-y: auto;

        .font-art-list{
            padding: 15px;
            display: flex;
            flex-wrap: wrap;
            justify-content: space-between;
            width: 100%;

            li{
                margin-bottom: 10px;
                display: flex;
                width: 75px;
                height: 48px;
                background: #f4f4f4;
                cursor: pointer;
                &:hover{
                    background: #ffffff;
                    box-shadow: 0px 4px 8px 0px rgba(102, 111, 127, 0.2);
                }
                &.current{
                    border: 1px solid var(--mainColor);
                }
                img{
                    margin: auto;
                    width: 48px;
                }
                span {
                    margin: auto;
                    font-size: 24px;
                    font-weight: bolder;
                }
            }
        }
    }

}
</style>