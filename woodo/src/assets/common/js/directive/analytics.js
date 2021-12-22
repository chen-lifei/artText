import Vue from 'vue';

//百度统计
const bdtongji = function(value, eventType){
	if(!value){
		return;
	}
	let arr = value.split("|");//多事件分割
	for (let i = 0; i < arr.length; i++) {
		window._hmt && window._hmt.push(['_trackEvent', arr[i], eventType || 'click']);  
    }  
};


// 已经被曝光的数据
let exposed = {};
// 曝光延时器对象
let exposedTimeouts = {};
// 百度统计 监听实例
const bdtongjiObserver = new IntersectionObserver((entries, oi)=>{
	// console.log(entries);
	// return;
	entries.forEach(v => {
		// 获取 上报值 事件类型
		let {value, eventType, massRemoving} = v.target.option;
		// 是否显示在可视区
		if(!v.isIntersecting) {
			exposedTimeouts[value] && clearTimeout(exposedTimeouts[value]);
			exposedTimeouts[value] = null;
			return false;
		};
		// 进入可视区 创建延时器
		exposedTimeouts[value] = setTimeout(() => {
			clearTimeout(exposedTimeouts[value]);
			// 是否去重
			if(massRemoving){
				// 检查是否已经上报 && 调用百度统计方法
				!exposed[value] && bdtongji(value, eventType);
				// 记录上报
				exposed[value] = exposed[value] || eventType;
			}else{
				// 调用百度统计方法
				bdtongji(value, eventType);
			}
			// 解除监听
			oi.unobserve(v.target);
		}, 1000);
	});
}, {threshold: 1}); 

//自定义指令
Vue.directive('bdtongji', {
	bind(el, binding) {
		let option = {
			// 上报值
			value: '',
			// 事件类型
			eventType: 'click', 
			// 是否去重
			massRemoving: true
		};
		// 字符串默认 click 事件
		if(typeof binding.value === 'string'){
			option.value = binding.value;
		}else{
			option = binding.value;
		}
		// 事件类型区分
		switch (option.eventType) {
			case 'click':
				el.addEventListener(option.eventType, () => {
					bdtongji(option.value, option.eventType);
				});
				break;
			case 'scroll':
				el.option = option;
				bdtongjiObserver.observe(el);
				break;
		}
	},
	update(el, binding){
		let option = {
			// 上报值
			value: '',
			// 事件类型
			eventType: 'click', 
			// 是否去重
			massRemoving: true
		};

		if(typeof binding.value === 'string'){
			option.value = binding.value;
		}else{
			option = binding.value;
		}

		if(binding.value !== binding.oldValue){
			el.option = option;
		}
	}
});

export default {
	bdtongji : bdtongji
};