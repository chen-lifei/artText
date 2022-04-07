<template>
    <div class="link-panel" ref="linkPanel" @click="showPage = false" :style="position">
        <div class="link-panel-content flex" v-if="showLinkInfo">
            <div class="page" v-if="isPage">本作品第 {{ linkParams.page }} 页</div>
            <div class="link text-ellipsis" v-else>{{ linkParams.link }}</div>
            <div class="icon" @click="openEditPanel">
                <base-icon class="iconbianjixiugai" :size="20"></base-icon>
            </div>
            <div class="icon">
                <base-icon class="iconshanchu" :size="20"></base-icon>
            </div>
        </div>
        <div class="link-edit" v-else>
            <p class="title">编辑链接</p>
            <base-icon class="iconguanbi1 close-icon" color="#5F6063" @click="close"></base-icon>
            <div class="text-wrapper">
                <div class="label">文本：</div>
                <input type="text" v-model="linkParams.text" :class="{ 'error': !linkParams.text }">
                <div class="error-tip" v-if="!linkParams.text">文本内容不能为空</div>
            </div>
            <div class="link-wrapper">
                <div class="label">请输入链接或选择：</div>
                <div :class="{ 'page-input': isPage }" @click.stop="showPage = true">
                    <input ref="link" type="text" :value="linkValue" @input="getLink">
                </div>
                <div class="clear-icon" v-if="linkValue" @click.stop="clearLink">
                    <base-icon class="iconguanbi1" color="#5F6063" :size="12"></base-icon>
                </div>
                <div class="page-wrapper" v-show="showPage" @click.stop>
                    <div class="top flex">
                        <div class="desc">本作品中的页面</div>
                        <div class="toggle-button" :class="{ 'open': openPage }" @click="openPage = !openPage">
                            <div class="inner-button"></div>
                        </div>
                    </div>
                    <div class="page flex" v-show="openPage">
                        <div class="page-card-wrapper"
                            v-for="item in pageList"
                            :key="item.id"
                            :class="{ 'select': item.pageNumber == linkParams.page }"
                            @click="selectPage(item)"
                        >
                            <div class="page-card">
                                <div class="card-wrapper" :style="{ width:`${svgSize.width}px`, height:`${svgSize.height}px` }">
                                    <svg-modal ref="svgPageModal"
                                        :svg_w="svgSize.width"
                                        :svg_h="svgSize.height"
                                        :svg_view="svgSize.view"
                                        :document="documentInfo"
                                        :page_info="item"
                                        :mode="`mini`"
                                    ></svg-modal>
                                </div>
                            </div>
                            <div class="page-number">第 {{ item.pageNumber }} 页</div>
                            <base-icon v-if="item.pageNumber == linkParams.page" class="icondagou icon-select" color="#000000"></base-icon>
                        </div>
                    </div>
                </div>
            </div>
            <div class="confirm-button" @click="editLink" :class="{ 'disabled': editDisable }">确定</div>
        </div>
    </div>
</template>

<script>
    import SvgModal from '@/components/SvgPageModal.vue';

    // 超链接编辑面板
    export default {
        name: 'LinkPanel',
        components: {
            SvgModal,
        },
        data() {
            return {
                position: {},
                linkParams: {
                    text: '',
                    link: '',
                    page: ''
                },
                isEdit: false,
                showPage: false,
                openPage: true,
                pageList: [],
                documentInfo: null,
                svgSize: {
                    width: 64,
                    height: 36,
                    view: [0, 0, 910, 512]
                },
            }
        },
        computed: {
            // 是否显示链接信息面板
            showLinkInfo() {
                return (this.linkParams.link || this.linkParams.page) && !this.isEdit;
            },
            isPage() {
                return this.linkParams.page;
            },
            linkValue() {
                return this.isPage ? `第 ${this.linkParams.page} 页面` : this.linkParams.link;
            },
            editDisable() {
                let linkValidate = $validate(this.linkParams.link).urlReg();
                console.log(linkValidate);
                return !this.linkParams.text || (!this.linkParams.link && !this.linkParams.page) || !linkValidate;
            }
        },
        watch: {
            openPage() {
                this.getPagePosition();
            },
            showPage() {
                this.getPagePosition();
            },
        },
        mounted() {
            if (!this.linkParams.link && !this.linkParams.page) this.isEdit = true;
            document.addEventListener('click', this.clickEvent);
        },
        beforeDestroy() {
            document.removeEventListener('click', this.clickEvent);
        },
        methods: {
            clickEvent(event) {
                if (!this.$refs.linkPanel.contains(event.target)) {
                    if (this.showPage) {
                        this.showPage = false;
                    } else {
                        this.close();
                    }
                };
            },
            close() {
                this.$emit('close');
            },
            openEditPanel() {
                this.isEdit = true;
                this.$nextTick(() => {
                    this.$refs.link.focus();
                    this.showPage = true;
                    if (!this.linkParams.link && !this.linkParams.page) {
                        this.openPage = true;
                    } else {
                        this.openPage = false;
                    }
                });
                this.getSvgSize();
            },
            getLink(event) {
                this.linkParams.link = event.target.value;
            },
            clearLink() {
                this.linkParams.link = '';
                this.linkParams.page = '';
            },
            selectPage(page) {
                let link = window.location.protocol + '//' + window.location.host + '/edit/?docId=' + this.documentInfo.id + '&pId=' + page.id;
                this.linkParams.link = link;
                this.linkParams.page = page.pageNumber;
                this.showPage = false;
            },
            getSvgSize() {
                const CARD_WIDTH = 64;
                const CARD_HEIGHT = 36;

                let width = this.documentInfo.width || 910;
                let height = this.documentInfo.height || 512;
                let ratio = width / height;
                if (ratio <= 1 || (CARD_WIDTH / ratio) > CARD_HEIGHT) {
                    this.svgSize.width = CARD_HEIGHT * ratio;
                    this.svgSize.height = CARD_HEIGHT;
                } else {
                    this.svgSize.width = CARD_WIDTH;
                    this.svgSize.height = CARD_WIDTH / ratio;
                }
                this.svgSize.view[2] = width;
                this.svgSize.view[3] = height;
            },
            editLink() {
                if (this.editDisable) return;
                let isLink = /^http(s?):\/\//.test(this.linkParams.link);               // 判断是否添加http或者https协议开头
                if (!isLink) this.linkParams.link = 'http://' + this.linkParams.link;
                console.log('panel edit', this.linkParams);
                this.$emit('edit', this.linkParams);
            },
            getPagePosition() {
                if (this.showPage && this.openPage && this.isPage) {
                    this.$nextTick(() => {
                        let page = document.querySelector('.link-panel .page-wrapper .page');
                        if (page) {
                            let selectPage = page.querySelector('.select');
                            page.scrollTop = selectPage ? selectPage.offsetTop - 60 : 0;
                        }
                    });
                }
            }
        }
    }
</script>

<style lang="less" scoped>
    .link-panel {
        position: fixed;
        padding: 0;
        width: auto;
        border: none;
        background: none;
        .link-panel-content {
            position: relative;
            justify-content: space-between;
            width: 360px;
            height: 56px;
            padding: 0 20px;
            font-size: 14px;
            color: #242529;
            border-radius: 10px;
            box-shadow: 0 8px 15px rgba(85,90,98,0.1);
            background-color: #FFFFFF;
            .link,
            .page {
                width: 240px;
            }
            .icon {
                width: 32px;
                height: 32px;
                line-height: 32px;
                text-align: center;
                border-radius: 8px;
                cursor: pointer;
                z-index: 21;
                &:hover {
                    background-color: #F6F6F9;
                }
            }
            &::before {
                content: '';
                position: absolute;
                width: 100%;
                height: 100%;
                top: -14px;
                left: 0;
                cursor: pointer;
                z-index: 20;
            }
        }
        .link-edit {
            position: relative;
            width: 350px;
            height: 350px;
            padding: 20px 30px;
            border-radius: 10px;
            box-shadow: 0 8px 15px rgba(85,90,98,0.1);
            background-color: #FFFFFF;
            .title {
                font-size: 16px;
                font-weight: bold;
                color: #242529;
            }
            .close-icon {
                position: absolute;
                top: 20px;
                right: 20px;
                cursor: pointer;
            }
            .text-wrapper,
            .link-wrapper {
                position: relative;
                margin-top: 20px;
                .label {
                    color: #5F6063;
                    margin-bottom: 6px;
                }
                input {
                    width: 100%;
                    height: 48px;
                    color: #242529;
                    padding: 16px 20px;
                    border-radius: 5px;
                    border: 1px solid #E3E6EC;
                    background-color: #F6F6F9;
                    &:focus {
                        border-color: var(--mainColor);
                    }
                }
            }
            .text-wrapper {
                input.error {
                    border-color: var(--errorColor);
                }
                .error-tip {
                    position: absolute;
                    right: 0;
                    bottom: -20px;
                    color: var(--errorColor);
                }
            }
            .link-wrapper {
                .page-input {
                    cursor: pointer;
                    input {
                        pointer-events: none;
                    }
                }
                input {
                    padding-right: 40px;
                }
                .clear-icon {
                    position: absolute;
                    bottom: 14px;
                    right: 10px;
                    width: 20px;
                    height: 20px;
                    line-height: 20px;
                    text-align: center;
                    border-radius: 50%;
                    cursor: pointer;
                    background-color: #FFFFFF;
                }
                .page-wrapper {
                    position: absolute;
                    top: calc(100% + 2px);
                    left: 0;
                    width: 100%;
                    height: auto;
                    z-index: 2;
                    border-radius: 5px;
                    overflow: hidden;
                    box-shadow: 0 8px 15px rgba(85,90,98,0.1);
                    background-color: #FFFFFF;
                    .top {
                        justify-content: space-between;
                        margin: 20px;
                        .desc {
                            color: #242529;
                            font-weight: bold;
                        }
                        .toggle-button {
                            width: 24px;
                            height: 12px;
                            border-radius: 6px;
                            cursor: pointer;
                            background-color: #E3E6EC;
                            .inner-button {
                                width: 8px;
                                height: 8px;
                                border-radius: 50%;
                                background-color: #FFFFFF;
                                transform: translate(2px, 2px);
                                transition: all .2s ease;
                            }
                            &.open {
                                background-color: var(--mainColor);
                                .inner-button {
                                    transform: translate(14px, 2px);
                                }
                            }
                        }
                    }
                    .page {
                        height: 230px;
                        flex-direction: column;
                        justify-content: flex-start;
                        overflow-y: scroll;
                    }
                    .page-card-wrapper {
                        display: flex;
                        align-items: center;
                        position: relative;
                        width: 100%;
                        height: auto;
                        padding: 5px 0;
                        cursor: pointer;
                        .page-card {
                            width: 64px;
                            height: 36px;
                            margin: 0 10px 0 20px;
                            .card-wrapper {
                                border-radius: 5px;
                                overflow: hidden;
                            }
                        }
                        .page-number {
                            color: #5F6063;
                        }
                        .icon-select {
                            position: absolute;
                            right: 20px;
                        }
                        &:hover {
                            background-color: #F6F6F9;
                        }
                    }
                }
            }
            .confirm-button {
                position: absolute;
                left: 50%;
                bottom: 20px;
                width: 120px;
                height: 40px;
                color: #FFFFFF;
                line-height: 40px;
                text-align: center;
                cursor: pointer;
                border-radius: 20px;
                background-color: var(--mainColor);
                transform: translateX(-50%);
                &:hover {
                    background-color: var(--mainHoverColor);
                }
                &.disabled {
                    color: #5F6063;
                    cursor: no-drop;
                    background-color: #F6F6F9;
                }
            }
        }
    }
</style>