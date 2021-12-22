// 处理 elementList 转换成 动画需要的数据
function element_2_animation (element_list) {
    if (!Array.isArray(element_list)) {
        return [];
    }
    // 动画数据对象
    let animation_data = [];
    // 1.筛选出已设置动画的元素
    let init_data = [];
    let group_length = [];
    element_list.forEach(element_item => {
        if (!Array.isArray(element_item.animation)) {
            return;
        }
        element_item.animation.forEach(item => {
            if (!item.name) {
                return;
            }
            // 下标转数字，整理出组数量
            let index = item.index || [0, 0];
            index = index.map(_item => Number(_item));
            group_length.push(index[0]);
            // 整理动画需要的数据
            let obj = {
                id: element_item.id,
                name: item.name,
                duration: item.duration,
                delay: item.delay,
                index: index,
            };
            init_data.push(obj);
        });
    });
    // 2. 元素分组，将 元素 animation-index[0] 的值去重作为对象的 key 创建数组
    group_length = Array.from(new Set(group_length));
    for (let i = 0, len = group_length.length; i < len; i++) {
        let key = group_length[i];
        animation_data[key] = [];
    }
    // 3. 根据 index 升序重排数组
    init_data = init_data.sort((a, b) => a.index[0] - b.index[0] || a.index[1] - b.index[1]);
    // 4. 按下标顺序 push 到 animation_data
    init_data.forEach(item => {
        let animation_obj = {};
        let key = item.index[0];
        animation_obj['id'] = item.id;
        animation_obj['name'] = item.name;
        animation_obj['duration'] = item.duration;
        animation_obj['delay'] = item.delay;
        animation_data[key].push(animation_obj);
    });
    return animation_data;
}

// 设置指定页元素动画恢复到动画前状态
function reset_before_animation ($edit_page, animation_data) {
    if (!$edit_page || !Array.isArray(animation_data)) {
        return;
    }
    for (let i in animation_data) {
        let data_arr = animation_data[i];
        for (let j = 0; j < data_arr.length; j++) {
            let item = data_arr[j];
            let $item = $edit_page.find(`#${item.id}.ele_item`);
            $item.css({
                'animation-name': '',
                'animation-duration': '0',
                'animation-delay': '0',
            }).removeClass(`
                animation-fade 
                animation-leftFly 
                animation-rightFly 
                animation-topFly 
                animation-bottomFly 
                animation-enlarge 
                animation-narrow 
                animation-rotate 
                animation-appear 
            `).addClass(`animation-${item.name}`);
        }
    }
}

let nexttimer = null;
let animate = {
    /**
     * 此方法用于处理一页文档的动画数据并渲染执行
     * params: {
     *      contain: edit_page 容器
     *      elementList: 元素数组
     *      autoplay: 自动播放动画
     *      playTrigger: 手动播放动画触发器容器
     *      animationEnd: () => {} 动画结束回调
     * }
     */
    buildAnimation: function (opt) {
        let option = {
            contain: null,
            elementList: [],
            autoplay: false,
            playTrigger: null,
            animationEnd: null,
        }
        option = Object.assign(option, opt);
        if (!option.contain) {
            return;
        }
        if (!Array.isArray(option.elementList)) {
            return;
        }
        let $edit_page = $(option.contain).find('.edit_page');
        let trigger = option.playTrigger;
        let autoplay = option.autoplay;
        let animation_data = element_2_animation(option.elementList);
        // 重置元素动画状态
        reset_before_animation($edit_page, animation_data);
        /**
         * 内置方法（1）
         * 将 animation_data 数据渲染成 css 设置到节点上 自动播放时递归方法
         */
        function render_animation_data(_animation_data, _play_index) {
            let list = _animation_data[_play_index];
            // 清除触发条件dom
            $(trigger).find('.animation-start-click').remove();
            // 递归结束
            if (!list) {
                // 动画结束回调
                if (typeof option.animationEnd === 'function') option.animationEnd();
                return;
            }
            // 生成dom触发事件（动画是否播放完 = 此节点是否存在） tabindex：使元素可聚焦
            let $div = $(`<div class="animation-start-click" tabindex="0"></div>`);
            $div.css({
                'position': 'absolute',
                'top': 0,
                'right': 0,
                'bottom': 0,
                'left': 0,
                'z-index': 9999,
                'opacity': 0,
                'outline': 'none',
            });
            // 自动播放模式下 click触发操作 变为 自动（在上一组动画结束后触发）
            if (autoplay) {
                next();
            } else {
                $(trigger).append($div);
                // 第一组动画 key = 0， 则自动播放
                if (_play_index === 0) {
                    next();
                } else {
                    // 元素聚焦，绑定按键事件
                    $div.focus();
                    // 点击执行 鼠标滚轮执行 按键执行
                    $div.one('click touchend mousewheel keydown', e => {
                        e.preventDefault();
                        // 上下左右按键判断
                        if (e.type === 'keydown') {
                            let code = e.keyCode;
                            if ([37, 38, 39, 40].includes(code)) {
                                next();
                            }
                            return;
                        }
                        next();
                    });
                }
            }
            /**
             * 内置方法（2）
             * 执行动画操作
             */
            function next() {
                // 设置 动画css
                list.forEach(item => {
                    let $item = $edit_page.find(`#${item.id}.ele_item`);
                    $item.css({
                        'animation-name': item.name,
                        'animation-duration': `${item.duration}s`,
                        'animation-delay': `${item.delay}s`,
                    });
                });
                // 当前组动画结束，执行下一组动画
                let duration = +list[list.length - 1].duration;
                let delay = +list[list.length - 1].delay;
                nexttimer = setTimeout(() => {
                    _play_index++;
                    render_animation_data(_animation_data, _play_index);
                }, (duration + delay) * 1000);
            }
        }
        /**
         * 数据组装结束，开始渲染动画
         */
        let play_index = 0;
        if (!animation_data[play_index]) {
            play_index++;
        }
        render_animation_data(animation_data, play_index);
    },
    // 重置动画状态，设置为动画前状态
    resetTobefore: function ($edit_page, element_list) {
        let animation_data = element_2_animation(element_list);
        reset_before_animation($edit_page, animation_data);
    },
    clearAll: function ($contain) {
        clearTimeout(nexttimer);
        let $edit_page = $contain.find('.edit_page');
        $edit_page.css('perspective', 'none');
        // 清除动画class
        $edit_page.find('.ele_item').removeClass(`
            animation-fade 
            animation-leftFly 
            animation-rightFly 
            animation-topFly 
            animation-bottomFly 
            animation-enlarge 
            animation-narrow 
            animation-rotate 
            animation-appear 
        `).css({
            'animation-name': '',
            'animation-duration': '0',
            'animation-delay': '0',
        });
    },
};

export default animate;