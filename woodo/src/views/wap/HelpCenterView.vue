<template>
    <div class="help-container">
        <div class="help-body" v-show="loaddone">
            <!-- 常见问题 -->
            <div class="help-question" v-for="(item, i) in question_list" :key="i">
                <div class="title">
                    <h2>{{ item.helpCategoryName }}</h2>
                    <div class="toggle" 
                        v-show="item.helps.length > close_show_length"
                        :class="{'open': item.open}" 
                        @click="toggle(item)"
                    >
                        <span>{{ item.open ? '收起' : '展开' }}</span>
                    </div>
                </div>
                <ul class="question-list" :style="listHeight(item)">
                    <li v-for="(_item, j) in item.helps" :key="j" @click="to_help_detail(_item.id)">
                        <a href="javascript:void(0)">{{ _item.title }}</a>
                    </li>
                </ul>
            </div>
        </div>
    </div>
</template>

<script>
export default {
    name: 'HelpCenterView',
    metaInfo() {
        return {
            title: '帮助中心',
            meta: [{
                name: 'keywords',
                content: 'PPT在线制作，协作工具，演示文稿，PPT模板下载'
            }, {
                name: 'description',
                content: '「吾道幻灯片」是一款全新的office生产力工具，支持演示文稿、PPT模板、协同办公，可以帮助用户轻松创建具有视觉吸引力的幻灯片，作为一款办公软件，吾道具备了简洁，易用，功能强大的特点，通过云端技术实现在线编辑设计，让分享过程更加方便、高效。'
            }],
        }
    },
    data() {
        return {
            loaddone: false,
            question_list: [],
            close_show_length: 5,
            is_miniprogram: false,  //是否为小程序环境
            wx_miniprogram: {},     // 小程序环境下私有对象
        }
    },
    mounted() {
        this.get_question_list();
        // 小程序环境判断
        utils.isMiniProgramENV().then(res =>{
            this.wx_miniprogram = res.wx.miniProgram;
            this.is_miniprogram = res.miniprogram ? true : false;
        }).catch((res) =>{
            console.error("error " + res);
        });
    },
    methods: {
        // 获取问题列表
        get_question_list: function () {
            let that = this;
            // 获取常见问题列表
            that.$axios.get('/api/help/common_questions/').then(res => {
                that.loaddone = true;
                let res_data = res.data;
                if (res_data.type !== 'success') {
                    return that.$toast(res_data.content);
                }
                let data = res_data.data;
                let common_question_list = {
                    helpCategoryName: '常见问题',
                    helps: data,
                    open: false,
                };
                that.question_list.unshift(common_question_list);
            }).catch(err => {
                that.$toast('获取常见问题列表失败~');
            });
            // 分类问题
            that.$axios.get('/api/help/list/group_by_category/', {
                params: {
                    count: 100,
                }
            }).then(res => {
                that.loaddone = true;
                let res_data = res.data;
                if (res_data.type !== 'success') {
                    return that.$toast(res_data.content);
                }
                let data = res_data.data;
                data.forEach(item => {
                    item.open = false;
                });
                that.question_list = that.question_list.concat(data);
            }).catch(err => {
                that.$toast('获取问题列表错误');
            });
        },
        // 设置收起 / 展开高度
        listHeight(item) {
            let height;
            if (item.open) {
                height = item.helps.length;
            } else {
                height = this.close_show_length;
                if (item.helps.length < 5) {
                    height = item.helps.length;
                }
            }
            return {
                'height': `calc(1.8rem * ${height})`,
            };
        },
        // 展开 / 收起
        toggle(item) {
            item.open = !item.open;
        },
        // 跳转问题详情
        to_help_detail(id) {
            let that = this;
            let url = encodeURIComponent(`/mobile/help/detail/?problemId=${id}`);
            // 小程序环境
            if(that.is_miniprogram){
                that.wx_miniprogram.navigateTo({
                    'url': `/pages/common/webview/webview?location=${url}`,
                });
            } else {
                that.$router.push({
                    path: '/mobile/help/detail/',
                    query: {problemId: id},
                });
            }
        }
    },
}
</script>

<style lang="less" scoped>
@import url('../../assets/wap/css/common.css');
.help-container {
    position: relative;
    width: 100%;
    height: 100%;
    overflow-x: hidden;
    overflow-y: auto;
    background-color: #f8f8f8;
}

.help-body {
    width: 100%;
    padding: 0.6rem 0.9rem;
    .help-question {
        width: 100%;
        height: auto;
        padding: 0.35rem 0.75rem;
        background-color: #ffffff;
        border-radius: 0.35rem;
        & + .help-question {
            margin-top: 0.65rem;
        }
        .title {
            line-height: 1.45rem;
            border-bottom: 0.03rem solid #dcdcdc;
            h2 {
                display: inline;
                font-size: 0.69rem;
                font-weight: bold;
                color: #3c3c3c;
            }
            .toggle {
                position: relative;
                float: right;
                height: 100%;
                padding-right: 0.6rem;
                &.open::after {
                    right: 0.04rem;
                    margin-top: -0.28rem;
                    transform: rotate(135deg);
                }
                span {
                    display: inline-block;
                    vertical-align: middle;
                    font-size: 0.6rem;
                    color: #b1b1b1;
                }
                &::after {
                    content: "";
                    position: absolute;
                    top: 50%;
                    right: 0.16rem;
                    margin-top: -0.2rem;
                    width: 0.32rem;
                    height: 0.32rem;
                    border: 0.065rem solid #b1b1b1;
                    border-left: none;
                    border-bottom: none;
                    transform: rotate(45deg);
                }
            }
        }
        .question-list {
            width: 100%;
            margin: 0.5rem 0 0.25rem;
            line-height: 1.8rem;
            overflow: hidden;
            transition: height 0.1s;
            li {
                text-overflow: ellipsis;
                white-space: nowrap;
                overflow: hidden;
                &::before {
                    content: "";
                    display: inline-block;
                    vertical-align: middle;
                    margin-right: 0.5em;
                    width: 0.2rem;
                    height: 0.2rem;
                    border-radius: 50%;
                    background-color: #3b424a;
                    opacity: 0.85;
                }
            }
            a {
                display: inline-block;
                vertical-align: middle;
                color: #3b424a;
                font-size: 0.6rem;
            }
        }
    }
}
</style>