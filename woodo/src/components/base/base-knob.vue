<template>
    <!-- 旋扭 -->
    <div class="knob" ref="knob" @mousedown="drag($event)">
        <div class="btn" :style="{transform: `rotate(${value}deg)`}">
            <i></i>
        </div>
    </div>
</template>

<script>
export default {
    model: {
        prop: 'value',
        event: 'mousemove'
    },
    props: {
        max: {
            type: Number,
            default: 360
        },
        value: 0,
        disabled: false
    },
    data() {
        return {}
    },
    methods: {
        drag(e) {
            if (this.disabled) return;
            let client_rect = this.$refs.knob.getBoundingClientRect();;
            let point = {
                x: client_rect.left + client_rect.width / 2,
                y: client_rect.top + client_rect.height / 2
            };
            let max = this.max;
            let value = this.value;
            let prevAngle = Math.atan2(e.pageY - point.y, e.pageX - point.x) - value * Math.PI / 180;
            $(document).on('mousemove', ev => {
                let event = ev || window.event;
                let angle = Math.atan2(event.pageY - point.y, event.pageX - point.x);
                value = (Math.floor((angle - prevAngle) * 180 / Math.PI) % 360) < 0 ? 360 + Math.floor((angle - prevAngle) * 180 / Math.PI) : (Math.floor((angle - prevAngle) * 180 / Math.PI) % 360);
                if (value > max) value %= max;
                this.mousemove(value);
            });
            $(document).on('mouseup', () => {
                $(document).unbind('mousemove');
                $(document).unbind('mouseup');
                this.$emit('mouseup', value);
            });
        },
        mousemove(val) {
            this.$emit('mousemove', val);
        }
    }
}
</script>

<style lang="less" scoped>
.knob {
    width: 28px;
    height: 28px;
    background: #ffffff;
    border: 2px solid #dddddd;
    border-radius: 50%;
    user-select: none;
    cursor: pointer;

    .btn {
        position: relative;
        width: 100%;
        height: 100%;

        i {
            position: absolute;
            top: 0;
            left: 50%;
            transform: translate(-50%, -50%);
            display: block;
            width: 10px;
            height: 10px;
            background: #ffffff;
            border: 1px solid #dddddd;
            border-radius: 50%;
            box-shadow: 0px 0px 5px 0px rgba(110, 115, 123, 0.2);
        }
    }
}
</style>