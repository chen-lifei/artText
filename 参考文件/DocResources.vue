<template>
    <div class="doc-resources">
        <div class="group" v-for="item in resource_list" :key="item.name">
            <div class="title">{{item.name}}</div>
            <div class="list">
                <a v-for="v in item.list" :key="v.title" class="link-item" :href="v.link" target="_blank" :title="v.content">
                    <div class="img-box">
                        <img :src="v.image" :alt="v.title">
                    </div>
                    <div class="item-main">
                        <div class="title">{{v.title}}</div>
                        <div class="exp">{{v.content}}</div>
                    </div>
                    <base-icon class="iconchangjiantou arrow"></base-icon>
                </a>
                <a v-for="v in 5" :key="v" class="link-item seat"></a>
            </div>
        </div>

    </div>
</template>

<script>
export default {
    data() {
        return {
            // 资源导航 第三方资源数据
            resource_list: [
                {
                    name: '图库',
                    list: [
                        {
                            title: 'Magdeleine',
                            content: '高清灵感图片资源下载。',
                            image: 'http://file.woodo.cn/upload/image/201812/17/29d3da6e-732e-415b-a63a-3b4ce8aa486f.png',
                            link: 'http://magdeleine.co/browse/'
                        },
                        {
                            title: 'InterfaceLIFT',
                            content: '支持多尺寸的高清壁纸图库网站。',
                            image: 'http://file.woodo.cn/upload/image/201812/17/b5fffb30-b1ac-4c9a-a29e-ec5de101a119.png',
                            link: 'https://interfacelift.com/wallpaper/downloads/date/any/'
                        },
                        {
                            title: 'Unsplash',
                            content: '免费高清图库。',
                            image: 'http://file.woodo.cn/upload/image/201812/17/e71cb8b4-5146-4b8d-ba3c-aa8f59081be7.png',
                            link: 'https://unsplash.com'
                        },
                        {
                            title: 'Gratisography',
                            content: '免费高清图库。',
                            image: 'http://file.woodo.cn/upload/image/201812/17/318161f0-9e80-4126-b18e-086c76494cba.png',
                            link: 'http://www.gratisography.com'
                        },
                        {
                            title: 'Wallpaper Abyss',
                            content: '壁纸分享网站。',
                            image: 'http://file.woodo.cn/upload/image/201812/17/3a2eab98-0ab4-411b-96cc-75ee64b87c27.png',
                            link: 'https://wall.alphacoders.com/?lang=Chinese'
                        },
                        {
                            title: 'HD wallpapers',
                            content: '高清壁纸图库。',
                            image: 'http://file.woodo.cn/upload/image/201812/17/f925c6a3-aaf0-4968-b085-73e4c0905359.png',
                            link: 'https://www.hdwallpapers.net'
                        },
                        {
                            title: '天堂图片网',
                            content: '高清无水印图片素材。',
                            image: 'http://file.woodo.cn/upload/image/201812/17/7757edf8-9cc7-4302-b28e-42794fe93a8b.png',
                            link: 'http://www.ivsky.com'
                        },
                        {
                            title: 'FreeImages',
                            content: '图片搜索引擎。',
                            image: 'http://file.woodo.cn/upload/image/201812/17/d1c0fe2d-8274-4f22-9fe2-42918e0195ed.png',
                            link: 'http://cn.freeimages.com'
                        },
                    ]
                },
                {
                    name: '图标',
                    list: [
                        {
                            title: 'Iconfinder',
                            content: '图标搜索。',
                            image: 'http://file.woodo.cn/upload/image/201812/17/457a1dc2-d2a9-44bc-8f42-369a8d12e18f.png',
                            link: 'https://www.iconfinder.com'
                        },
                        {
                            title: 'iconmonstr',
                            content: '图标搜索。',
                            image: 'http://file.woodo.cn/upload/image/201812/17/bbe259ce-c9d4-4c48-904f-1f7a1ad0b617.png',
                            link: 'http://iconmonstr.com'
                        },
                        {
                            title: 'Worldvectorlogo',
                            content: '品牌标识与常用LOGO的矢量资源下载。',
                            image: 'http://file.woodo.cn/upload/image/201812/17/27748043-4135-4156-b0c4-1cd7712fa904.png',
                            link: 'https://worldvectorlogo.com'
                        },
                        {
                            title: 'EmojiOne',
                            content: '在线打包下载 Emoji 表情图标，提供 PNG、SVG、单色版和字体版等。',
                            image: 'http://file.woodo.cn/upload/image/201812/17/5349d8ab-9e17-4b74-85a1-eac3340050fc.png',
                            link: 'http://emojione.com/demo/'
                        },
                        {
                            title: 'Iconsfeed',
                            content: 'iOS 应用图标收集展示。',
                            image: 'http://file.woodo.cn/upload/image/201812/17/d3403dcd-111a-4973-9f0b-7d263cfb76de.png',
                            link: 'http://www.iconsfeed.com'
                        },
                        {
                            title: 'Icon Archive',
                            content: '图标搜索。',
                            image: 'http://file.woodo.cn/upload/image/201812/17/37694f9e-221a-4946-9ac1-c9e61d949a9d.png',
                            link: 'http://www.iconarchive.com'
                        },
                        {
                            title: 'iOS Icon Gallery',
                            content: 'iOS App 图标欣赏。',
                            image: 'http://file.woodo.cn/upload/image/201812/17/dbcb41a7-19ba-4a5d-acb0-e04bca1818f4.png',
                            link: 'http://iosicongallery.com'
                        },
                        {
                            title: 'Find Icons',
                            content: '图标搜索。',
                            image: 'http://file.woodo.cn/upload/image/201812/17/cce3629d-acc7-4405-844e-cca3be4a7d41.png',
                            link: 'http://findicons.com'
                        },
                    ]
                },
                {
                    name: '素材资源',
                    list: [
                        {
                            title: 'UI8',
                            content: 'UI素材资源交易平台。',
                            image: 'http://file.woodo.cn/upload/image/201812/17/1738345a-1f7e-4bba-b7b1-f1abc5bdc527.png',
                            link: 'https://ui8.net/'
                        },
                        {
                            title: 'UpLabs',
                            content: '设计作品展示、分析，设计素材下载，交易平台。',
                            image: 'http://file.woodo.cn/upload/image/201812/17/a589de32-92d9-42e9-884f-7c53e264c0e2.png',
                            link: 'https://www.uplabs.com'
                        },
                        {
                            title: 'Subtle Patterns',
                            content: '免费背景纹理图片素材下载。',
                            image: 'http://file.woodo.cn/upload/image/201812/17/72e77665-e360-4c52-ac99-5098bff976bc.png',
                            link: 'http://subtlepatterns.com'
                        },
                        {
                            title: 'Freebiesbug',
                            content: '免费设计素材下载。',
                            image: 'http://file.woodo.cn/upload/image/201812/17/6efde20b-cb58-4728-87e5-e0746ff27290.png',
                            link: 'http://freebiesbug.com'
                        },
                        {
                            title: '1001 Free Downloads',
                            content: '设计资源搜索。',
                            image: 'http://file.woodo.cn/upload/image/201812/17/ffdeae7e-9378-44ec-a70b-a6c6f33468e3.png',
                            link: 'http://www.1001freedownloads.com'
                        },
                        {
                            title: 'iOSpirations',
                            content: 'UI设计欣赏与iOS 与 macOS 设计素材。',
                            image: 'http://file.woodo.cn/upload/image/201812/17/f64793c1-84b7-4369-bda1-d561195bcbf9.png',
                            link: 'http://www.iospirations.com'
                        },
                        {
                            title: 'Naldz Graphics',
                            content: '设计教程与素材。',
                            image: 'http://file.woodo.cn/upload/image/201812/17/3a691aa3-b020-4d9b-acb6-00f7d6dd0eed.png',
                            link: 'http://naldzgraphics.net'
                        },
                        {
                            title: '昵图网',
                            content: '设计资源与素材下载。',
                            image: 'http://file.woodo.cn/upload/image/201812/17/3b824889-1238-4495-a4b9-85e13217e72a.png',
                            link: 'http://www.nipic.com/index.html'
                        },
                        {
                            title: '矢量图搜索引擎',
                            content: '免费矢量图素材搜索。',
                            image: 'http://file.woodo.cn/upload/image/201812/17/97d9ff0b-853c-4c81-a744-e7a187c02b58.png',
                            link: 'http://cn.vector.me'
                        },
                        {
                            title: '68design',
                            content: '网页设计师联盟素材站。',
                            image: 'http://file.woodo.cn/upload/image/201812/17/3e44e7e9-07bc-45e0-b27d-b69a4d276c4b.png',
                            link: 'http://sc.68design.net'
                        },
                        {
                            title: 'One Page Love',
                            content: '单页面网站设计欣赏，模版下载、交易。',
                            image: 'http://file.woodo.cn/upload/image/201812/17/f282b60e-693f-4db1-b318-62f6360f0c13.png',
                            link: 'https://onepagelove.com'
                        },
                        {
                            title: 'Vecteezy',
                            content: '免费矢量素材搜索下载、SVG在线设计工具。',
                            image: 'http://file.woodo.cn/upload/image/201812/17/2d9b2273-5ca8-4ed6-8107-c23d29267807.png',
                            link: 'https://www.vecteezy.com'
                        },
                        {
                            title: 'Worldvectorlogo',
                            content: '品牌标识与常用LOGO的矢量资源下载。',
                            image: 'http://file.woodo.cn/upload/image/201812/17/27748043-4135-4156-b0c4-1cd7712fa904.png',
                            link: 'https://worldvectorlogo.com'
                        },
                        {
                            title: 'Clipart.me',
                            content: '矢量设计资源与PSD设计资源搜索下载。',
                            image: 'http://file.woodo.cn/upload/image/201812/17/120b9f5e-d80b-440d-93af-0c0d402f1315.png',
                            link: 'http://cn.clipart.me'
                        },
                    ]
                },
                {
                    name: '设计平台',
                    list: [
                        {
                            title: 'Dribbble',
                            content: '设计师作品分享平台，个人作品交流与分享。',
                            image: 'http://file.woodo.cn/upload/image/201812/18/96b2e42b-47fd-42fc-8818-6aa909bdd0fa.png',
                            link: 'https://dribbble.com/#869'
                        },
                        {
                            title: 'Behance',
                            content: 'Adobe旗下的设计师交流平台，来自世界各地的设计师在这里分享自己的作品。',
                            image: 'http://file.woodo.cn/upload/image/201812/18/f54b3d42-8546-4f05-b24e-fb21b301b373.png',
                            link: 'https://behance.net'
                        },
                        {
                            title: 'UI中国',
                            content: '图形交互与界面设计交流、作品展示、学习平台。',
                            image: 'http://file.woodo.cn/upload/image/201812/18/83da01ce-4b16-490a-a8de-91aa9d2cd0ec.png',
                            link: 'https://www.ui.cn/'
                        },
                        {
                            title: 'UI8',
                            content: 'UI素材资源交易平台。',
                            image: 'http://file.woodo.cn/upload/image/201812/17/1738345a-1f7e-4bba-b7b1-f1abc5bdc527.png',
                            link: 'https://ui8.net/'
                        },
                        {
                            title: '字体传奇网',
                            content: '字体品牌设计师交流平台。',
                            image: 'http://file.woodo.cn/upload/image/201812/17/e1590d48-cd4a-46c1-b51a-7d24e36c2dc6.png',
                            link: 'http://www.ziticq.com'
                        },
                        {
                            title: '站酷网',
                            content: '设计师交流平台，分享与学习的好去处。',
                            image: 'http://file.woodo.cn/upload/image/201812/17/635780dd-7d79-437b-802c-d56161de35a9.png',
                            link: 'http://www.zcool.com.cn'
                        },
                        {
                            title: 'GAMEUI',
                            content: '游戏类UI设计师的作品展示与交流平台。',
                            image: 'http://file.woodo.cn/upload/image/201812/17/a95a81b1-9c96-4301-92e7-c20f40d835e2.png',
                            link: 'http://www.gameui.cn'
                        },
                        {
                            title: '秀设计',
                            content: '设计资讯、设计大赛与设计师作品展示。',
                            image: 'http://file.woodo.cn/upload/image/201812/17/8f97df74-56d6-4b60-afe7-691991579486.png',
                            link: 'http://www.xiusheji.com'
                        },
                        {
                            title: '优阁网',
                            content: 'UI设计师学习交流社区。',
                            image: 'http://file.woodo.cn/upload/image/201812/17/415c4f32-f398-4694-883f-fdb4f4753b2c.png',
                            link: 'http://www.uigreat.com'
                        },
                    ]
                },
                {
                    name: '设计软件',
                    list: [
                        {
                            title: 'Sketch',
                            content: 'Mac 上的 UI/UX 设计软件，堪称神器。',
                            image: 'http://file.woodo.cn/upload/image/201812/18/8487bc58-5db2-4096-9cdd-d4e8b2983628.png',
                            link: 'https://sketchapp.com'
                        },
                        {
                            title: 'Affinity Designer',
                            content: '媲美PS的设计软件新秀。',
                            image: 'http://file.woodo.cn/upload/image/201812/18/c7b257ec-5963-4d84-9c5b-44a27d893f75.png',
                            link: 'https://affinity.serif.com/zh-cn/designer/'
                        },
                        {
                            title: 'Adobe Photoshop CC',
                            content: '数字图像设计的全新体验。',
                            image: 'http://file.woodo.cn/upload/image/201812/18/48b931fd-5413-4344-8bac-5e843f271dc3.png',
                            link: 'http://www.adobe.com/cn/products/photoshop.html'
                        },
                        {
                            title: 'Adobe Illustrator CC',
                            content: '行业标准的矢量图形设计软件。',
                            image: 'http://file.woodo.cn/upload/image/201812/18/e58d21a8-c195-49f9-85c5-65b5595142bc.png',
                            link: 'http://www.adobe.com/cn/products/illustrator.html'
                        },
                        {
                            title: 'Adobe After Effects CC',
                            content: '数字动画/动效设计软件。',
                            image: 'http://file.woodo.cn/upload/image/201812/18/395efb02-e294-495d-a87f-6efd645ffe0a.png',
                            link: 'http://www.adobe.com/cn/products/aftereffects.html'
                        },
                        {
                            title: 'Adobe Animate CC',
                            content: '矢量动画设计软件（原Adobe Flash）。',
                            image: 'http://file.woodo.cn/upload/image/201812/18/fe9df91b-c219-40f6-803b-6a4ae8d1028d.png',
                            link: 'http://www.adobe.com/cn/products/animate.html'
                        },
                        {
                            title: 'Pixelmator',
                            content: '轻型的Mac版图像设计、处理软件。',
                            image: 'http://file.woodo.cn/upload/image/201812/18/b846d283-856c-4163-9497-62f94c3dd8e3.png',
                            link: 'http://www.pixelmator.com/mac/'
                        },
                        {
                            title: 'Squash 2',
                            content: '图片压缩与优化软件。',
                            image: 'http://file.woodo.cn/upload/image/201812/18/84828c6c-ea28-4994-af03-f2d2e05f5c46.png',
                            link: 'https://realmacsoftware.com/squash/'
                        },
                        {
                            title: 'Craft',
                            content: '填充随机内容、样式整理、复制排版、云分享组件的PS、Sketch插件。',
                            image: 'http://file.woodo.cn/upload/image/201812/18/1612636c-f4c5-4ead-ad98-130e23117a27.png',
                            link: 'https://www.invisionapp.com/craft'
                        },
                        {
                            title: 'Spectrum',
                            content: '配色工具，可以自动识别图片中的主色调。',
                            image: 'http://file.woodo.cn/upload/image/201812/18/5cc7b460-e46f-4549-9549-18bad6acf130.png',
                            link: 'http://www.eigenlogik.com/spectrum/mac'
                        },
                        {
                            title: 'Optimage',
                            content: '图片优化，无损压缩软件。',
                            image: 'http://file.woodo.cn/upload/image/201812/18/bd3ad11c-0624-4e5d-9442-158bf1332c17.png',
                            link: 'http://getoptimage.com/'
                        },
                        {
                            title: 'Touch Bar Preview',
                            content: '在 Macbook Touch-Bar 上预览设计的软件。',
                            image: 'http://file.woodo.cn/upload/image/201812/18/31467437-8431-4265-94c5-35a4736fcd14.png',
                            link: 'https://touchbar.github.io'
                        },
                        {
                            title: 'Image2icon',
                            content: '自定义设计各种规范图标。',
                            image: 'http://file.woodo.cn/upload/image/201812/18/5dda2053-dddb-4441-9890-198a90799acd.png',
                            link: 'https://itunes.apple.com/cn/app/image2icon-zhi-zuo-zi-ji-tu/id992115977?mt=12'
                        },
                        {
                            title: 'Analog',
                            content: 'Mac 版图片滤镜快捷处理软件。',
                            image: 'http://file.woodo.cn/upload/image/201812/18/ae9b6e19-4412-46b0-8378-fbb588e051fc.png',
                            link: 'https://itunes.apple.com/cn/app/analog/id418343177?mt=12'
                        },
                        {
                            title: 'IconKit',
                            content: '将图标针对不同设备批量处理尺寸的软件。',
                            image: 'http://file.woodo.cn/upload/image/201812/18/1b8d6b75-d0df-4d8f-a94d-ca9987a3074b.png',
                            link: 'https://itunes.apple.com/cn/app/iconkit-icon-resizer-for-app/id507135296?mt=12'
                        },
                        {
                            title: 'Ps Play',
                            content: '在移动设备上同步预览 Photoshop 设计界面的工具。由腾讯 ISUX 开发。',
                            image: 'http://file.woodo.cn/upload/image/201812/18/a13f1057-3d45-4c4c-b5a7-4b53c16fcd4e.png',
                            link: 'https://isux.tencent.com/app/psplay'
                        },
                        {
                            title: 'Color Cube',
                            content: '支持批量网页截图，屏幕吸管，色彩分析，色板导出等功能的配色神器。',
                            image: 'http://file.woodo.cn/upload/image/201812/17/37694f9e-221a-4946-9ac1-c9e61d949a9d.png',
                            link: 'http://www.fancynode.com/colorcube/'
                        },
                        {
                            title: 'ColorZilla for Chrome',
                            content: '在线取色查色的Chrome内核浏览器插件。',
                            image: 'http://file.woodo.cn/upload/image/201812/18/429d8817-c2bd-4749-8bd1-990b86b9db82.png',
                            link: 'http://www.colorzilla.com/chrome/'
                        },
                    ]
                },
            ]
        }
    },
}
</script>

<style lang="less" scoped>
.doc-resources {
    padding: 60px 35px;
    .group {
        padding: 0 30px;
        padding-top: 24px;
        margin: 0 auto;
        margin-bottom: 30px;
        background: #ffffff;
        > .title {
            font-size: 16px;
            font-weight: 700;
            color: #000000;
        }
        .list {
            margin-top: 20px;
            display: flex;
            flex-wrap: wrap;
            justify-content: space-between;
            width: calc(100% + 30px);
            .link-item {
                margin-bottom: 30px;
                margin-right: 30px;
                flex: 1 1 auto;
                display: flex;
                align-items: center;
                width: 300px;
                height: 72px;
                background: #f6f6f9;
                border-radius: 5px;
                cursor: pointer;
				transition: .3s;
                &:hover {
                    box-shadow: 0px 6px 12px 0px rgba(0, 0, 0, 0.09);
                    .arrow {
                        visibility: visible;
                    }
                }
                &.seat {
                    margin-bottom: 0;
                    height: 0;
                }

                .img-box {
                    margin-left: 20px;
                    margin-right: 11px;
                    width: 32px;
                    height: 32px;
                    line-height: 32px;
                    img {
                        display: inline-block;
                        width: 100%;
                        height: auto;
                    }
                }

                .item-main {
					width: 55%;
                    > .title {
                        font-size: 12px;
                        font-weight: 700;
                        color: #333333;
                    }
                    .exp {
                        width: 100%;
                        font-size: 12px;
                        font-weight: 400;
                        color: #999999;
                        overflow: hidden;
                        white-space: nowrap;
                        text-overflow: ellipsis;
                    }
                }

                .arrow {
                    margin-right: 44px;
					margin-left: auto;
                    visibility: hidden;
                    font-size: 22px;
					color: #a6a6a6;
                }
            }
        }
    }
}
</style>