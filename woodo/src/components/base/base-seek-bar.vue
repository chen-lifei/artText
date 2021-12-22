<template>
    <div class="seekbar_module_contain" v-if="bar_data && seekbar_obj">
        <template v-if="!seekbar_obj.art_text">
            <!-- 减小按钮 -->
            <button v-if="btnShow" class="position_button reduce sp_ico_hover" @click="change_position('reduce')"><i class="edit-ico edit-ico-reduce"></i></button>
            <!-- 拖动主体 -->
            <div class="seekbar_box" :style="{width:bar_data.width + 'px'}">
                <!-- 结果值展示 -->
                <span v-if="valueShow" class="value_display" :style="{left: 'calc(' + bar_data.value + '% - 12px)'}">{{bar_data.value + unit_str}}</span>
                <!-- 进度条 -->
                <div class="seekbar_progress" @click="draggable_click($event)">
                    <div class="progress_bar" :style="{width: bar_data.value + '%', transition:'width ' + animation_speed + 's'}"></div>
                </div>
                <!-- 拖动按钮 -->
                <div class="seekbar_drag_btn" @mousedown="draggable_down($event)" :style="{left: 'calc(' + bar_data.value + '% - 6px)'}"></div>
            </div>
            <!-- 增加按钮 -->
            <button v-if="btnShow" class="position_button add sp_ico_hover" @click="change_position('add')"><i class="edit-ico edit-ico-add"></i></button>
        </template>
        <template v-else>
            <div class="art_seekbar_box" :style="{width:bar_data.width + 'px'}">
                <!-- 进度条 -->
                <div class="seekbar_progress" @click="draggable_click($event)">
                    <div class="progress_bar" :style="{width: bar_data.value + '%', transition:'width ' + animation_speed + 's'}"></div>
                </div>
                <!-- 拖动按钮 -->
                <div class="seekbar_drag_btn" @mousedown="draggable_down($event)" :style="{left: 'calc(' + bar_data.value + '% - 6px)'}"></div>
            </div>
        </template>
    </div>
</template>

<script>
    export default{
        /**
         * 初始值
         * obj:
         * @param {value}     拖动条当前数据
         * @param {width}     拖动条宽度
         * @param {unit}      拖动条数据单位
         * @param {max_value} 拖动条数据最大值 
         * @param {min_value} 拖动条数据最小值
         * @param {animation} 拖动条拖动动画速度
         * @param {callback}  拖动条回调方法
         */
        props:{
            seekbar_obj: Object,
            btnShow: {
                type: Boolean,
                default: true
            },
            valueShow:{
                type: Boolean,
                default: true
            }
        },
        data(){
            return {
                bar_data: {
                    value: 100,
                    width: 114,
                    unit: 'percent',
                    max_value: 100,
                    min_value: 0,
                    animation: 0.3,
                    callback: Function,
                },
                // 拖拽锁定标识
                drag_lock: false,
                // 动画速度
                animation_speed: 0,
                // 进度条定位
                position_x: 0,
                // 进度条按下坐标
                start_x: null,
                // 进度条当前位置
                distance: this.seekbar_obj && this.seekbar_obj.width,
                // 进度条上次操作结束位置
                end_distance: "",
                // 属性值单位
                unit_str: ''
            }
        },
        mounted(){
            this.unit_deal();
        },
        watch:{
            seekbar_obj:{
                handler(value) {
                    this.bar_data = Object.assign(this.bar_data, value);
                    if(this.bar_data.value > 100) this.bar_data.value = 100;
                    if(this.bar_data.value < 0) this.bar_data.value = 0;
                },
                deep: true
            },
        },
        methods:{
            unit_deal: function(){
                this.bar_data = Object.assign(this.bar_data, this.seekbar_obj);
                // 单位处理
                switch (this.bar_data.unit) {
                    case 'percent':
                        this.unit_str = '%';
                        break;
                    case 'pound':
                        this.unit_str = '磅';
                        break;
                    case 'px':
                        this.unit_str = 'px';
                        break;
                    default:
                        this.unit_str = '';
                        break;
                }
            },
            // 进度条按下
            draggable_down: function(e){
                let that = this,
                    value = '';
                $(e.target).addClass('check');
                // 设置速度为 0
                that.animation_speed = 0;
                // 存储当前位置
                that.save_position(e);
                // 设置起始位置
                that.start_x = that.position_x;
                // 关闭拖拽锁
                that.drag_lock = true;
                that.end_distance = that.distance = that.bar_data.value * (that.bar_data.width / 100);
                // 绑定移动
                if(document.addEventListener){
                    document.addEventListener('mousemove', that.draggable_move, false);
                    document.addEventListener('mouseup', that.draggable_end, false);
                }else if(document.attachEvent){
                    document.attachEvent('onmousemove', that.draggable_move);
                    document.attachEvent('onmouseup', that.draggable_end);
                }
            },
            // 存储鼠标位置
            save_position: function(e) {
                this.position_x = e.pageX;
                return this.position_x;
            },
            // 进度条拖拽
            draggable_move: function(e){
                let that = this,
                    position_x = that.save_position(e),
                    move_x = position_x - that.start_x;
                if (!that.drag_lock) return;
                if(that.distance >= that.bar_data.width){
                    that.distance = that.bar_data.width - 10;
                }else{
                    that.distance = that.end_distance + move_x;
                    that.count_num(that.distance);
                }
            },
            // 进度条拖拽结束
            draggable_end: function(){
                let that = this;
                that.animation_speed = that.bar_data.animation;
                that.drag_lock = false;
                $('.seekbar_drag_btn').removeClass('check');
                if( document.removeEventListener ){
                    document.removeEventListener('mousemove', that.draggable_move, false);
                    document.removeEventListener('mouseup', that.draggable_end, false);
                }else if( document.attachEvent ){
                    document.detachEvent('onmousemove', that.draggable_move);
                    document.detachEvent('onmouseup', that.draggable_end);
                }
            },
            // 点击拖动到指定位置
            draggable_click: function(e){
                let that = this,
                    x = e.offsetX;
                that.distance = that.bar_data.width / 2;
                let move_x = x - that.distance;
                that.distance += move_x;
                that.count_num(that.distance);
            },
            // 按钮更改拖动条位置
            change_position: function(type){
                let ratio = this.bar_data.width / 100,
                    data = this.bar_data.value * ratio;
                this.count_num(type === 'add' ? data + 1 * ratio : data - 1 * ratio);
            },
            // 计算百分比数值
            count_num: function(num){
                let that = this,
                    value = '';
                if(Math.ceil(num / (that.bar_data.width / 100)) < that.bar_data.min_value){
                    value = that.bar_data.min_value;
                }else if(Math.ceil(num / (that.bar_data.width / 100)) > that.bar_data.max_value){
                    value = that.bar_data.max_value
                }else{
                    value = Math.floor(num / (that.bar_data.width / 100));
                }
                this.bar_data.callback(value);
            },
        }
    }
</script>

<style lang="less" scoped>

    .position_button{
        display:inline-block;
        vertical-align:middle;
        width:14px;
        height:14px;
        cursor:pointer;
        &.reduce{
            margin-right:9px;
        }
        &.add{
            margin-left:9px;
        }
    }
    .seekbar_box{
        position: relative;
        display:inline-block;
        vertical-align:middle;
        height:14px;
        user-select:none;
        .value_display{
            position:absolute;
            bottom:14px;
            left:0;
            width:50px;
            font-size:12px;
            color:#707b8e;
            user-select:none;
        }
        .seekbar_progress{
            position:absolute;
            top: 50%;
            left:0;
            transform: translateY(-50%);
            width:100%;
            height:3px;
            border-radius:1px;
            background: #d8d8db;
            overflow:hidden;
            cursor: pointer;
            .progress_bar{
                height:100%;
                line-height:3px;
                background-color:var(--mainColor);
                font-size:12px;
                transition:width .3s ease;
            }
        }
        .seekbar_drag_btn{
            position: absolute;
            top: 50%;
            left: 45px;
            transform: translateY(-50%);
            width: 13px;
            height: 13px;
            background: #ffffff;
            border: 2px solid var(--mainColor);
            border-radius: 50%;
            cursor: pointer;
            &:hover,&.check{
                opacity:1;
            }
        }
    }
    .art_seekbar_box{
        position: relative;
        top: -2px;
        display:inline-block;
        vertical-align:middle;
        height:14px;
        user-select:none;
        .value_display{
            position:absolute;
            bottom:14px;
            left:0;
            width:50px;
            font-size:12px;
            color:#707b8e;
            user-select:none;
        }
        .seekbar_progress{
            position:absolute;
            top:3px;
            left:0;
            width:100%;
            height:3px;
            border-radius:1px;
            background: #d8d8db;
            overflow:hidden;
            cursor: pointer;
            .progress_bar{
                height:100%;
                line-height:3px;
                background-color:var(--mainColor);
                font-size:12px;
                transition:width .3s ease;
            }
        }
        .seekbar_drag_btn{
            position: absolute;
            top: -2px;
            left: 45px;
            width: 12px;
            height: 12px;
            cursor: pointer;
            background-color: #ffffff;
            border-radius: 50%;
            border: solid 1px #dadee6;
            cursor:pointer;
        }
    }
    .seekbar_title{
        width: 76px;
        margin-right: 20px;
        font-size: 14px;
        color:#222222;
    }
    .art_value_display{
        display: inline-block;
        width: 60px;
        font-size: 14px;
        color: #222222;
        text-align: right;
    }
</style>