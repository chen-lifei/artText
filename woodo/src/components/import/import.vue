<template>
    <!-- 导入动画 -->
    <transition name="modal-fade">
        <div class="import-masking">
            <div class="import-loading"></div>
            <span>{{ progress }}%</span>
            <span>正在导入文件，请稍后</span>
        </div>
    </transition>
</template>

<script>
    export default{
        props: {
            source: {
                type: String,
                default: 'local'
            },
            file: Object,
            online: Object
        },
        data() {
            return{
                progress: 0,          // 上传进度标识
            }
        },
        mounted () {
            this.open();
        },
        methods: {
            open() {
                if (!this.file) {
                    this.$toast('未获取到文件,请重试', 1500);
                    this.$emit('fail');
                    return;
                }
                let file_name = this.file.name.toLowerCase();
                if (!/(pptx|pdf)$/.test(file_name)) {
                    this.$toast('限定只有.pptx/.pdf 为后缀的文件才能上传', 1500);
                    this.$emit('fail');
                    return;
                }
                if (this.file.size / 1024 / 1024 > 100) {
                    this.$toast('只能上传100M以下的文件', 1500);
                    this.$emit('fail');
                    return;
                }
                this.start();
                this.$emit('start');
            },
            // 导入ppt
            start() {
                let timer;
                let that = this;
                let file = this.file;
                let file_name = file.name.toLowerCase();
                let formData = new FormData();
	            formData.append('file', file);
                switch (true) {
                    case /(pptx)$/.test(file_name):
                        that.$axios({
                            url: '/api/member/document/import_doc/',
                            headers: { 'Content-Type': 'multipart/form-data' },
                            method: 'post',
                            dataType: 'file',
                            data: formData,
                            timeout: 60000
                        }).then(res => {
                            clearInterval(timer);
                            let {data, code} = res.data;
                            if (code == 2) {
                                that.progress = 100;
                                that.$emit('success', data);
                            } else {
                                that.$toast(data.content, 3000);
                                this.$emit('fail', data.content);
                            }
                        }).catch(error => {
                            that.$toast('导入失败,请刷新页面重试',800);
                            that.$emit('fail', error);
                        })
                        timer = setInterval(() => {
                            if(that.progress >= 95){
                                clearInterval(timer);
                            }else{
                                that.progress += 5;
                            }
                        }, 1000);
                        break;
                    case /(pdf)$/.test(file_name):
                        that.$common.import_pdf(that, formData, data => {
                            clearInterval(timer);
                            that.$emit('success', data.data.data)
                        }, error => {
                            if(error && error.data.content){
                                that.$toast(error.data.content, 2000);
                            }else{
                                that.$toast('导入失败', 1000);
                            }
                            that.$emit('fail', error);
                        });
                        timer = setInterval(() => {
                            if(that.progress >= 95){
                                clearInterval(timer);
                            }else{
                                that.progress += 5;
                            }
                        }, 1000);
                        break;
                    case this.source === 'online':
                        that.$axios.post('/api/member/document/import_online_doc/',
                            {
                                docId: that.online.id,
                                targetDocId: that.online.targetId
                            }
                        )
                        .then(res => {
                            let {code, data} = res.data;
                            if (code === 2) {
                                this.$emit('success', data.data);
                            } else {
                                this.$emit('fail', data.content);
                            }
                        })
                        .catch(() => {
                            that.$toast('导入失败', 1000);
                        });
                        break;
                }
			},
        }
    }
</script>

<style lang="less" scoped>
    .import-masking{
        position: fixed;
        top: 0;
        left: 0;
        z-index: 999;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, .5);
        text-align: center;
        .import-loading{
            position: absolute;
            top: 50%;
            left: 50%;
            width: 4em;
            height: 4em;
            margin: -2em;
            background-color: var(--mainColor);
            -webkit-animation: import-loading 1.2s infinite ease-in-out;
            animation: import-loading 1.2s infinite ease-in-out;
        }
        span{
            position:absolute;
            top:50%;
            left:50%;
            display:inline-block;
            width:80px;
            height:20px;
            margin:30px 0 0 -40px;
            font-size:16px;
            color:#ffffff;
            &:last-child{
                width: 230px;
                margin:60px 0 0 -115px;
            }
        }
    }
    @-webkit-keyframes import-loading {
        0% {
            -webkit-transform: perspective(120px) rotateX(0deg) rotateY(0deg);
            transform: perspective(120px) rotateX(0deg) rotateY(0deg);
        }
        50% {
            -webkit-transform: perspective(120px) rotateX(-180.1deg) rotateY(0deg);
            transform: perspective(120px) rotateX(-180.1deg) rotateY(0deg);
        }
        100% {
            -webkit-transform: perspective(120px) rotateX(-180deg) rotateY(-179.9deg);
            transform: perspective(120px) rotateX(-180deg) rotateY(-179.9deg);
        }
    }
    @keyframes import-loading {
        0% {
            -webkit-transform: perspective(120px) rotateX(0deg) rotateY(0deg);
            transform: perspective(120px) rotateX(0deg) rotateY(0deg);
        }
        50% {
            -webkit-transform: perspective(120px) rotateX(-180.1deg) rotateY(0deg);
            transform: perspective(120px) rotateX(-180.1deg) rotateY(0deg);
        }
        100% {
            -webkit-transform: perspective(120px) rotateX(-180deg) rotateY(-179.9deg);
            transform: perspective(120px) rotateX(-180deg) rotateY(-179.9deg);
        }
    }
</style>