/**
 * 此方法在入口文件中已挂载到window对象下，使用方法：
 * MediaControls(audio, document.getElementById('control'), element.id);
 */
class MediaControls {
    // 媒体控件 原型
    constructor(audioElement, controlParentElement, controlId) {
        let audio = audioElement;
        let controlParent = controlParentElement || document.body;
        if (!audio) {
            return console.error('audio is not defined')
        }
        if (Object.prototype.toString.call(audio) !== '[object HTMLAudioElement]') {
            return console.error('audio is not element');
        }
        let t = this;
        t.audio = audio;
        t.control = `control-${controlId}`;
        t.controlParent = controlParent;
        // 加载状态检查
        if (audio.readyState) {
            t.build();
        } else {
            audio.onloadedmetadata = e => {
                t.build();
            }
        }
    }
    /**
     * 实例方法
     */
    // 控件模板
    controlView() {
        let div = document.createElement('div');
        div.id = this.control;
        div.className = 'media-controls';
        div.innerHTML = `<div class="media-body">
                            <div class="media-play"></div>
                            <div class="media-progress">
                                <div class="media-progress-now"></div>
                                <div class="media-progress-position"></div>
                            </div>
                            <div class="media-duration">00:00/00:00</div>
                            <div class="media-volume">
                                <div class="media-volume-icon">
                                    <svg viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M529.1 901.6c-2.7 0-12.1-4.1-17-9l-0.3-0.3-230.4-190.1H96.1c-8.9 0-18.3-4.6-22.7-9-4.4-4.4-9-13.8-9-22.7v-319c0-7 2.7-12.9 4.4-14.6H71l2.4-2.4c4.4-4.4 13.8-9 22.7-9h185.3l230.4-195.8 0.2-0.2c5.8-5.8 12.9-7 17.8-7 4.4 0 8.9 1 12.6 2.9l0.5 0.3 0.5 0.2c12.5 4.2 17.2 11.3 17.2 26.4v717.8c0 15.1-4.7 22.3-17.2 26.4l-1.8 0.6-1.4 1.4c-3 3-5.6 3.1-11.1 3.1z m279.1-79.7c-9.9 0-23.1-5.1-26.9-12.6-9-18-5.8-36.4 7.9-46.1 4.8-2 11.6-7.2 20.3-15.6 8.9-8.7 22.4-23.7 36.2-45.7 23-36.8 50.4-99.7 50.4-190.9s-29-154.2-53.3-191.1c-14.5-22-28.8-37-38.2-45.6-6.6-6.1-14.9-13-21-15.5-12.6-9.1-17-31.4-8.9-44.5 9.4-9.1 20.6-14.3 30.8-14.3 5.4 0 10.4 1.4 14.8 4.2 0.7 0.6 1.6 1.3 3 2.4 29.4 23.1 54.9 51.4 75.8 84.1 40.1 62.9 60.5 137 60.5 220.3 0 83.7-19.7 158.1-58.4 221.1-20.1 32.7-44.5 60.9-72.6 83.6-1.7 1.4-2.6 2.1-3.3 2.8-3.4 3.4-13.3 3.4-17.1 3.4zM688.6 696.6c-8.3 0-22.6-9.7-26.9-18.3l-0.2-0.5-0.3-0.4c-8.2-12.4 0.8-30.4 14.5-39.7 6.4-3.4 60.9-35.5 60.9-132.3 0-46.5-18-78.4-33.2-97-16.5-20.2-33.1-29.4-33.7-29.8l-0.6-0.3-0.7-0.2c-5.8-1.9-11.4-8.5-14.3-16.8-2.9-8.3-2.3-16.6 1.4-22.2l0.6-0.9 0.3-1c2.9-8.6 15.6-16.1 27.3-16.1 4.5 0 8.6 1.1 11.7 3.2l2.1 1.4h1.5c4.5 1.7 29.1 14 53.5 41.9 21.7 24.9 47.6 68.1 47.6 132.2 0 72.9-24.5 120.2-45 147.1-22.6 29.5-45.6 42.2-50.4 44.1h-2.4l-2.4 2.4c-3.2 3-5.7 3.2-11.3 3.2z" fill="#7f7f7f"></path>
                                    </svg>
                                </div>
                                <div class="media-volume-slider">
                                    <div class="media-volume-now"></div>
                                    <div class="media-volume-position"></div>
                                </div>
                            </div>
                        </div>`;
        return div;
    }
    // 更新控件内容
    updateView() {
        let t = this;
        let control = document.getElementById(t.control);
        if (!control) {
            return;
        }
        // 更新节点内容
        let audio = t.audio;
        control.querySelector('.media-play').setAttribute('paused', t.paused);
        control.querySelector('.media-duration').textContent = `${t.currentTime}/${t.duration}`;
        let progress_number = audio.currentTime / audio.duration * 100;
        control.querySelector('.media-progress-now').style.width = `${progress_number}%`;
        control.querySelector('.media-progress-position').style.left = `${progress_number}%`;
        control.querySelector('.media-volume-icon').setAttribute('muted', t.muted);
        control.querySelector('.media-volume-now').style.height = `${t.volume}%`;
        control.querySelector('.media-volume-position').style.bottom = `${t.volume}%`;
    }
    // 控件事件绑定
    operation() {
        let t = this;
        let audio = t.audio;
        let control = document.getElementById(this.control);
        // 更新视图
        let updateinfo = () => {
            if(!t.audio) return;
            t.getMediaInfo();
        }
        let updateprogress = value => {
            let total = audio.duration;
            let current = total * value;
            audio.currentTime = current;
        }
        let updatevolume = value => {
            if (value > 1) {
                value = 1;
            }
            if (value < 0) {
                value = 0;
            }
            audio.volume = value;
        }
        // 音频事件
        audio.removeEventListener('play', updateinfo);
        audio.removeEventListener('timeupdate', updateinfo);
        audio.removeEventListener('pause', updateinfo);
        audio.removeEventListener('ended', updateinfo);
        audio.removeEventListener('volumechange', updateinfo);
        audio.addEventListener('play', updateinfo);
        audio.addEventListener('timeupdate', updateinfo);
        audio.addEventListener('pause', updateinfo);
        audio.addEventListener('ended', updateinfo);
        audio.addEventListener('volumechange', updateinfo);
        // 控件事件
        // 播放/暂停
        control.querySelector('.media-play').onclick = e => {
            if (audio.paused) {
                audio.play();
            } else {
                audio.pause();
            }
        }
        // 播放进度调整
        control.querySelector('.media-progress').onmousedown = e => {
            let $this = e.target;
            if ($this.className.indexOf('media-progress-position') >= 0) {
                $this = $this.parentElement;
            }
            let total = $this.clientWidth;
            let down = e.clientX - $this.getBoundingClientRect().left;
            let current = down / total;
            audio.pause();
            updateprogress(current);
            let move = ev => {
                down = ev.clientX - $this.getBoundingClientRect().left;
                current = down / total;
                updateprogress(current);
            }
            let up = eve => {
                document.removeEventListener('mousemove', move);
                document.removeEventListener('mouseup', up);
                audio.play();
            }
            document.addEventListener('mousemove', move);
            document.addEventListener('mouseup', up);
        }
        // 静音
        control.querySelector('.media-volume-icon').onclick = e => {
            audio.muted = !t.muted;
        }
        // 音量调整
        control.querySelector('.media-volume-slider').onmousedown = e => {
            let $this = e.target;
            if ($this.className.indexOf('media-volume-position') >= 0) {
                $this = $this.parentElement;
            }
            let total = $this.clientHeight;
            let rect = $this.getBoundingClientRect();
            let down = rect.top + rect.height - e.clientY;
            let current = down / total;
            updatevolume(current);
            let move = ev => {
                down = down = rect.top + rect.height - ev.clientY;
                current = down / total;
                updatevolume(current);
            }
            let up = eve => {
                document.removeEventListener('mousemove', move);
                document.removeEventListener('mouseup', up);
            }
            document.addEventListener('mousemove', move);
            document.addEventListener('mouseup', up);
        }
    }
    // 更新实例属性
    build() {
        let t = this;
        // 生成控件节点
        let control = document.getElementById(t.control);
        if (!control) {
            t.controlParent.appendChild(t.controlView());
            control = document.getElementById(t.control);
        }
        // 更新状态
        t.getMediaInfo();
        // 绑定事件
        t.operation();
    }
    // 获取媒体信息
    getMediaInfo() {
        let audio = this.audio;
        this.paused = audio.paused;
        this.muted = audio.muted;
        this.currentTime = number2duration(audio.currentTime);
        this.duration = number2duration(audio.duration);
        this.volume = audio.volume.toFixed(2) * 100;
        // 更新节点信息
        this.updateView();
    }
    // 销毁
    destroy() {
        let t = this;
        try {
            t.controlParent.removeChild(document.getElementById(t.control));
            t.paused = true;
            t.muted = false;
            t.currentTime = '00:00';
            t.duration = '00:00';
            t.volume = 100;
            t.audio.pause();
            t.audio = null;
            t.control = '';
        } catch (error) {
            console.error(error);
        }
    }
    // 加载完成
    loaded(callback) {
        let t = this;
        if (!t.audio) {
            return;
        }
        let timer = setInterval(() => {
            if (t.audio.readyState && document.getElementById(t.control)) {
                clearInterval(timer);
                if (typeof callback === 'function') callback();
            }
        }, 4);
    }
}
// 数字转时间 例 60 => 01:00
function number2duration(number) {
    let result = '00:00';
    if (isNaN(number)) {
        return result;
    }
    let date = parseInt(number);
    let s = date % 60;
    s = s < 10 ? '0' + s : s;
    let m = Math.floor(date / 60) % 60;
    m = m < 10 ? '0' + m : m;
    m += ':';
    let h = Math.floor(date / (60 * 60)) % 60;
    h = h < 10 ? '0' + h : h;
    h = Number(h) ? h + ':' : '';
    return h + m + s;
}

export default (a, b, c) => {
    return new MediaControls(a, b, c);
}