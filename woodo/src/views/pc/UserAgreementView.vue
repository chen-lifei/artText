<template>
    <div class="agreement_contain" ref="agreement">
        <div class="index_header fixed_head">
            <base-logo width="80"></base-logo>
            <div v-if="user.login" class="user_head">
                <a href="/home/">进入吾道</a>
            </div>
            <div v-if='!user.login' class="un_login">
                <a href="/home/" class="login">登录</a>
                <a href="/home/" class="sign_up">注册</a>
            </div>
        </div>
        <div class="content_box">
            <div class="agreement_title">
                吾道-用户协议
                <span>生效日期：2018-11-2</span>
            </div>
            <div class="agreement_nav">
                <ul>
                    <li v-for="item in nav_list"
                        :data-target="item.target"
                        :class="{active:item.active}"
                        @click="to_detail(item)"
                    >{{item.title}}</li>
                </ul>
            </div>
            <div class="agreement_detail">
                <div class="head">
                    欢迎来到吾道！<br/>
                    吾道是由广州爆裂科技有限公司（下称“爆裂科技”）提供的互联网软件服务。本服务条款（下称“服务条款”）是您与爆裂科技之间关于 您（“您”或“用户”）访问和使用吾道以及广州爆裂科技有限公司提供的其他服务（下称“服务”）的主要服务条款。您注册、登录吾道和/或 使用爆裂科技提供的服务，即表示您同意接受服务条款。因此，敬请仔细阅读。<br/>
                    <br/>
                    爆裂科技保留在不提前通知用户的情况下，对本服务条款做任何修改或补充的权利，修改或补充后的服务条款将在吾道网站上公布。通常情况下（例如当需要进行修改或补充以满足适用法律要求时），对服务条款的修改或补充将在公布时立即生效。您继续访问和使用吾道即视为您接受修订后的服务条款。否则， 您有权通过停止访问吾道且拒绝使用服务、删除您在吾道上的信息和帐户等方式来终止服务条款。
                    <br/><br/>
                </div>
                <div class="detail_list">
                    <ul>
                        <li id="A">
                            <span class="list_title">A. 服务内容</span>
                            <p class="list_content">
                                吾道的服务由广州爆裂科技有限公司提供技术支持，提供三个方向的演示文稿服务：<br/>
                                1、 提供在线演示文稿编辑工具；<br/>
                                2、 提供演示文稿模板下载服务；<br/>
                                3、 提供演示文稿定制服务。<br/>
                                <br/>
                                根据实际需要和爆裂科技不时提供的其他服务内容，爆裂科技可能与您另行签订其他服务条款。同时，即使未另行签订其他服务条款，您使用吾道的具体服务也将被视为您同意爆裂科技关于该具体服务的任何要求。如果其他服务条款和本条款之间存在冲突，应以其他服务条款为准，但以该冲突和与该服务 条款特定事宜相关为限。<br/>
                                <br/>
                                爆裂科技保留随时终止向您提供的收费服务的权利，并保留根据实际情况随时调整吾道提供的收费服务种类和形式的权利。如果爆裂科技终止提供某项收费服务，爆裂科技的义务仅在于向您返还您尚未使用的服务期对应的部分费用。但无论如何，爆裂科技将尽合理的努力给您预留合理的时间以便您为该等服务变更、中止或终止做出应对。
                            </p>
                        </li>
                        <li id="B">
                            <span class="list_title">B. 账户条款</span>
                            <p class="list_content">
                                您必须具有完全民事行为能力和民事权利能力方可使用本服务。 <br/>
                                <br/>
                                为了能正常访问吾道和使用服务，您必须依照吾道网站注册提示填写准确的、真实的电子邮箱、手机号以及其他任何在注册时要求的信息，并须确保在上 述注册信息发生变化时及时更新信息及确保更新信息的有效性和合法性。 <br/>
                                <br/>
                                若您提供任何错误、虚假、过时、不完整、不道德或违法的资料，或者爆裂科技保有理由怀疑资料为错误、虚假、过时、不完整、不道德或违法，不适合在吾道上展示的；或者爆裂科技保有理由怀疑您的资料属于病毒程序或恶意操作；或者您违反本服务条款的规定；或者未经爆裂科技保同意，将吾道用于商业目的，爆裂科技保有权限制、封禁您在吾道网站的帐户，及暂停或终止提供服务的部分或全部功能。在此情况下，吾道将不向您承担任 何责任。 <br/>
                                <br/>
                                尽管有前述规定，爆裂科技无义务对任何用户的任何登记资料承担任何责任，包括但不限于鉴别、核实任何登记资料的真实性、准确性、完整性、适用性及/或是否为最新资料的责任。 <br/>
                                <br/>
                                您的帐户只可以由您本人登录及使用，多人共享帐号是被禁止的。不过您可以根据购买的服务内容，在本服务条款及相关业务规则允许的范围内，添加多个子帐户。您知悉并同意，您与协作账户使用人之间或各协作账户使用人之间的任何纠纷将由您及/或相关方自行解决及承担责任，与吾道无关；吾道将不会介入该等 纠纷的处理，亦不会就此向您或任何相关方承担任何责任。<br/>
                                <br/>
                                您有责任维护您的帐户和密码的安全性。吾道不会因您未能遵守这一安全保障义务而对因此导致的任何损失或损害承担任何责任。如果您发现有人未经授权使用 您的帐户信息或怀疑任何人未经授权可能能够访问您的私有内容，您应立即更改密码，并向我们反馈。如果您提供的信息不正确或您未能确保您的帐户信息的安全而造 成任何损失或损害，爆裂科技不承担任何责任。<br/>
                                <br/>
                                您在使用本服务过程中应遵守所有可适用的法律法规及本服务条款、业务规则的规定，不得发生任何违法、违反本服务条款或侵犯第三方合法权益的行为；您应对您帐户项下的全部行为承担相应法律责任。
                            </p>
                        </li>
                        <li id="C">
                            <span class="list_title">C. 支付条款</span>
                            <p class="list_content">
                                所有的支付必须通过一个有效的信用卡/支付宝/微信/paypal完成。<br/>
                                <br/>
                                非因吾道原因导致本服务在服务期限内中止或终止的，已支付费用不予退还。吾道不会为未使用完的服务退款，也不会为服务计划中尚未使用的剩余期限退款。<br/>
                                <br/>
                                所有费用均为不含税价格，您应负责支付及自行承担所有及任何税金。<br/>
                                <br/>
                                服务到期后可能会导致您帐户项下的部分功能的丧失。您明确知悉并同意上述变化及风险，吾道对因此发生的任何损失不承担任何责任。<br/>
                                <br/>
                            </p>
                        </li>
                        <li id="D">
                            <span class="list_title">D. 服务和价格的修订</span>
                            <p class="list_content">
                                吾道保留随时变更、中止或终止部分或全部服务的权利，并保留根据实际情况随时调整吾道提供的服务种类、形式、费用标准的权利。<br/>
                                <br/>
                                所有服务的价格，包括但不限已有收费服务的改变，都会收到来自吾道的通知。<br/>
                                <br/>
                                吾道可通过推送通知、网站公告、微信公众号推文或改变吾道网站或服务本身等方式对服务的变更、中止或终止及服务价格及其变更进行通知。您继续访 问本网站及/或使用本服务，即视为您接受变更后的服务及价格。<br/>
                                <br/>
                                因服务变更、中止或终止，或服务价格变更对您与第三方之间的任何法律关系产生任何影响的，吾道将不承担任何责任。<br/>
                                <br/>
                                用户在吾道上填写的内容（包含但不限于吾道目前各产品功能里的内容）仅表明其个人的立场和观点，并不代表爆裂科技的立场或观点。作为内容的发布者，需自行对所发布的内容负责，因所发布内容引发的一切纠纷，由该内容的发布者承担全部法律责任及连带责任，爆裂科技不承担任何法律责任及连带 责任。<br/>
                                <br/>
                                对于用户在吾道发布侵犯他人知识产权或其他合法权益的内容，或在吾道看来包含非法的、攻击、威胁、中伤、诽谤、淫秽、色情或任何其他不良信息的 内容和帐户，或任何违反法律规定、本服务条款约定、对吾道任何用户、员工或第三方造成侵害或损害，或吾道认为可能存在任何其他不良影响的内容和 帐户，吾道有权利但无义务予以删除并保留移交司法机关处理的权利。无论是否删除或移交司法机关处理，吾道均不承担任何法律责任及连带责任。
                            </p>
                        </li>
                        <li id="E">
                            <span class="list_title">E. 内容使用权及合法性规则</span>
                            <p class="list_content">
                                用户不得使用吾道服务发送或传播敏感信息和违反国家法律制度的信息，包括但不限于下列信息：<br/>
                                1、反对宪法所确定的基本原则的；<br/>
                                2、危害国家安全，泄露国家秘密，颠覆国家政权，破坏国家统一的；<br/>
                                3、损害国家荣誉和利益的；<br/>
                                4、煽动民族仇恨、民族歧视，破坏民族团结的；<br/>
                                5、破坏国家宗教政策，宣扬邪教和封建迷信的；<br/>
                                6、散布谣言，扰乱社会秩序，破坏社会稳定的；<br/>
                                7、散布淫秽、色情、赌博、暴力、凶杀、恐怖或者教唆犯罪的；<br/>
                                8、侮辱或者诽谤他人，侵害他人合法权益的；<br/>
                                9、含有法律、行政法规禁止的其他内容的。<br/>
                                <br/>
                                用户承诺发布言论要：爱国、守法、自律、真实、文明。不传播任何非法的、骚扰性的、中伤他人的、辱骂性的、恐吓性的、伤害性的、庸俗的，淫秽的、危害国家安 全的、泄露国家机密的、破坏国家宗教政策和民族团结的以及其它违反法律法规及政策的内容。若用户的行为不符合以上提到的服务条款，吾道将作出独立判断 立即暂停或终止用户的服务帐号。用户需对自己在网上的行为承担法律责任，吾道不承担任何法律责任及连带责任。
                            </p>
                        </li>
                        <li id="F">
                            <span class="list_title">F. 版权</span>
                            <p class="list_content">
                                吾道的外观设计、应用程序、源代码、商标、标示图案（LOGO）、界面设计、应用程序编程接口及相关著作权，以及与吾道提供的服务有关的任何著作 权及其他知识产权均归吾道所有，其它本服务条款中未经提及的权利亦由吾道保留。未经爆裂科技事先书面许可，您不能复制、拷贝、或者使用上 述知识产权的任何部分，不得复制、拷贝或使用本服务的任何部分HTML/ CSS，JavaScript或视觉设计元素和理念。且不得为任何目的自行实施、利用、转让或许可他 人实施上述任何知识产权或其任何部分。
                            </p>
                        </li>
                        <li id="G">
                            <span class="list_title">G. 隐私政策</span>
                            <p class="list_content">
                                使用吾道和爆裂科技提供的服务，即表示您同意爆裂科技合法收集和使用有关您及您所使用服务的技术性或诊断性信息。收集到的这些信息将用于 改进吾道产品的内容和技术，提升吾道的服务品质。 <br/>
                                <br/>
                                爆裂科技不会将您的信息和内容提供或出售给其他的组织或个人，但以下情况除外：<br/>
                                1、 您的事先同意或授权，或您于吾道上主动与第三方进行分享操作；<br/>
                                2、 司法机关或有权政府机构或任何法律法规部门规章要求爆裂科技提供该等信息；<br/>
                                3、 您违反了本服务条款，且爆裂科技需要向第三方提供的。<br/>
                                <br/>
                                根据实际需要和爆裂科技不时提供的其他服务内容，爆裂科技可能与您另行签订其他服务条款。同时，即使未另行签订其他服务条款，您使用吾道的具体服务也将被视为您同意爆裂科技关于该具体服务的任何要求。如果其他服务条款和本条款之间存在冲突，应以其他服务条款为准，但以该冲突和与该服务 条款特定事宜相关为限。<br/>
                                <br/>
                                爆裂科技保留随时终止向您提供的收费服务的权利，并保留根据实际情况随时调整吾道提供的收费服务种类和形式的权利。如果爆裂科技终止提供某项收费服务，爆裂科技的义务仅在于向您返还您尚未使用的服务期对应的部分费用。但无论如何，爆裂科技将尽合理的努力给您预留合理的时间以便您为该等服务变更、中止或终止做出应对。
                            </p>
                        </li>
                        <li id="H">
                            <span class="list_title">H. 数据安全</span>
                            <p class="list_content">
                                爆裂科技将尽合理的努力保护您的信息安全，并为此采取合理的数据传输、存储、转换等预防保护措施。但是，互联网数据传输、存储、转换均可能存在一定未 知且不确定的数据安全风险，该等风险将导致包括但不限于数据丢失、泄露、损坏、无法读取或提取等后果。您确认，您已明确知晓并同意接受该等因互联网引发的风 险和后果，并已采取恰当的措施（例如数据备份等），以便在该等风险发生时将损失降至最低。<br/>
                                因互联网技术本身等非爆裂科技主观故意或重大过失导致危害您数据安全的，爆裂科技不承担任何赔偿责任。因爆裂科技重大过失危害您数据安全 的，爆裂科技的赔偿责任以向您收取的服务费用为上限。A
                            </p>
                        </li>
                        <li id="I">
                            <span class="list_title">I. 免责声明</span>
                            <p class="list_content">
                                一旦您注册成为用户即表示您与爆裂科技达成服务条款，完全接受本服务条款项下的全部条款。对免责声明的解释、修改及更新权均属于爆裂科技所有。<br/>
                                <br/>
                                1、由于您将用户密码告知他人或与他人共享注册帐户，由此导致的任何个人信息的泄漏，或其他非因爆裂科技原因导致的个人信息的泄漏，爆裂科技不 承担任何法律责任；<br/>
                                2、任何第三方根据爆裂科技各服务条款及声明中所列明的情况使用您的个人信息，由此所产生的纠纷，爆裂科技不承担任何法律责任以及连带责任；<br/>
                                3、任何由于黑客攻击、电脑病毒侵入或政府管制而造成的暂时性网站关闭，爆裂科技不承担任何法律责任；<br/>
                                4、我们鼓励用户充分利用吾道自由地发布和共享自己的信息。您可以自由发布文字、图片等内容，但这些内容必须位于公共领域内，或者您拥有这些内容的使用 权。同时，用户不应在自己的个人主页或吾道的任何其他地方发布受版权保护的内容；<br/>
                                5、用户在吾道发布侵犯他人知识产权或其他合法权益的内容，爆裂科技有权予以删除，并保留移交司法机关处理的权利；<br/>
                                6、用户对于自己创作并在吾道上发布的合法内容依法享有著作权及其他相关权利；<br/>
                                7、互联网是一个开放平台，用户将图片等资料上传到互联网上，有可能会被其他组织或个人复制、转载、擅改或做其它非法用途，用户必须充分意识到此类风险的存在。 用户明确同意使用爆裂科技服务所存在的风险将完全由用户自己承担；因用户使用爆裂科技服务而产生的一切后果也由用户自己承担，爆裂科技 对用户不承担任何责任。<br/>
                            </p>
                        </li>
                        <li id="J">
                            <span class="list_title">J. 服务变更/中断/终止</span>
                            <p class="list_content">
                                如因系统维护或升级的需要而暂停网络服务、调整服务功能的，爆裂科技将尽可能事先在网站上进行通告。<br/>
                                <br/>
                                如发生下列任何一种情形，爆裂科技有权单方面中断或终止向用户提供服务而无需通知用户：<br/>
                                1、用户提供的个人资料不真实；<br/>
                                2、用户违反本服务条款中规定的使用规则；<br/>
                                3、未经爆裂科技同意，将吾道用于商业目的。<br/>
                            </p>
                        </li>
                        <li id="K">
                            <span class="list_title">K. 服务条款的完善和修改</span>
                            <p class="list_content">
                                爆裂科技有权根据互联网的发展和中华人民共和国有关法律、法规的变化，不时地完善和修改爆裂科技服务条款。爆裂科技保留随时修改服务条款 的权利，用户在使用爆裂科技的服务时，有必要对最新的爆裂科技服务条款进行仔细阅读和重新确认，当发生相关争议时，以最新的服务条款为准。
                            </p>
                        </li>
                        <li id="L">
                            <span class="list_title">L. 其他规定</span>
                            <p class="list_content">
                                1、吾道公布的注册、登录、使用相关服务的方式为注册、登录、使用相关服务的唯一合法方式，您通过其他任何渠道、任何途径、任何方式获取的相关服务（ 包括且不限于账号、道币等服务）均为非法取得，吾道概不承认其效力，且一经发现吾道有权立即做出删除、取消、清零、封号等处理，任何因此导致 的一切不利后果均由您自行承担。<br/>
                                <br/>
                                2、用户帐户只可以由用户本人登录及使用，多人共享帐号是被禁止的，您在任何时候均无权以任何方式将本服务包含的任何部分或全部予以转让、转授权、分授权给 您以外的任何一方。<br/>
                                <br/>
                                3、不得利用吾道账户、道币等服务，进行倒卖、转手、置换、抵押、有价交易等当时非法牟利，一经发现，吾道有权严肃处理，包括但不限于：冻结道币、扣除道币、道币清零、封号。<br/>
                                <br/>
                                本服务条款项下吾道向您发出的所有通知，吾道可按以下任一方式发出：（1）通过推送通知、网站公告、微信公众号推文等形式发出；（2）向您注册 或者此后变更您信息时向吾道提供的手机号码/电子邮箱发送（发出即视为送达）。<br/>
                                <br/>
                                吾道未能或延迟行使本服务条款规定的任何权利、权力或特权不应视为放弃行使，且任何单一或部分权利、权力或特权的行使不应排除权利、权力或特权的任何 其他或进一步的行使或本服务条款项下任何其他权利、权力或特权的行使。<br/>
                                <br/>
                                本服务条款构成您与吾道之间的全部服务条款，并取代您与吾道之间的任何先前的服务条款（包括但不限于本服务条款的任何以前的版本）。<br/>
                                <br/>
                                本服务条款及其下的服务受中华人民共和国法律管辖，并按之解释。<br/>
                                <br/>
                                用户使用本服务的行为若有任何违反国家法律法规或侵犯任何第三方合法权益的情形，爆裂科技有权直接删除该违反规定的信息，并可以暂停或终止向该用户提 供服务。若用户利用本服务从事任何违法或侵权行为，由用户自行承担全部责任，爆裂科技不承担任何法律责任及连带责任。因此给爆裂科技或任何第三 方造成任何损失的，用户应负责全额赔偿。
                            </p>
                        </li>
                        <li id="M">
                            <span class="list_title">M. 联系我们</span>
                            <p class="list_content">
                                欢迎您对我们的服务条款提出意见。如有任何问题、意见或疑虑，请发邮件至
                                <span>service@woodo.cn</span>
                                。 联系方式作为本服务条款的组成部分可能会不时进行更新。
                            </p>
                        </li>
                    </ul>
                </div>
            </div>
        </div>
        <div class="agreement_foot">
            <span>© 2018 爆裂科技</span>
            <span>本服务条款最终解释权归广州爆裂科技有限公司所有。</span>
            <span><a href="https://beian.miit.gov.cn">粤ICP备18137964号</a></span>
        </div>
    </div>
</template>

<script>
    export default {
        name: "UserAgreementView",
        metaInfo: {
			title: '吾道-服务协议',
			meta: [
			    {
                    property: 'og:title',
                    content: '吾道-服务协议'
                },
                {
                    property: 'og:url',
                    content: 'https://www.woodo.cn/agreement/'
                },
			]
		},
        data(){
            return {
                user: {
                    login: false,
                    name:'',
                    photo:'',
                    email:'',
                },
                nav_list:[
                    {target:'#A', active:true, title:'A. 服务内容'},
                    {target:'#B', active:false, title:'B. 账户条款'},
                    {target:'#C', active:false, title:'C. 支付条款'},
                    {target:'#D', active:false, title:'D. 服务和价格的修订'},
                    {target:'#E', active:false, title:'E. 内容使用权及合法性规则'},
                    {target:'#F', active:false, title:'F. 版权'},
                    {target:'#G', active:false, title:'G. 隐私政策'},
                    {target:'#H', active:false, title:'H. 数据安全'},
                    {target:'#I', active:false, title:'I. 免责声明'},
                    {target:'#J', active:false, title:'J. 服务变更/中断/终止'},
                    {target:'#K', active:false, title:'K. 服务条款的完善和修改'},
                    {target:'#L', active:false, title:'L. 其他规定'},
                    {target:'#M', active:false, title:'M. 联系我们'},
                ],
                scroll_timeout:null,
            }
        },
        methods:{
            // 获取登陆状态
            get_login_state:function(){
                let that = this,
                    had_login = false,
                    name = '',
                    email = '',
                    photo = 'http://static.500d.me/resources/500d/images/default.jpg';
                if(that.get_cookies('woodo_memberHead')) had_login = true;
                if(had_login && that.get_cookies('woodo_memberHead').length > 2) photo = that.get_cookies('woodo_memberHead');
                if(had_login && that.get_cookies('woodo_memberNickName')) name = decodeURI(that.get_cookies('woodo_memberNickName'));
                if(had_login && that.get_cookies('woodo_memberEmail')) email = that.get_cookies('woodo_memberEmail');
                that.user = {
                    login: had_login,
                    name: name,
                    photo: photo,
                    email: email,
                };
            },
            // 退出登陆
            log_out: function() {
                let that = this;
                that.$axios.get("/api/logout/submit").then(function(data){
                    if(data.data.type === "success") {
                        that.$toast("退出登录成功", 800);
                        that.get_login_state();
                    } else {
                        that.$toast("退出登录失败，请稍后重试", 800);
                    }
                    that.get_login_state();
                    that.hide_user_box();
                });
            },
            // 获取cookies
            get_cookies: function(name) {
                var arr,
                    reg = new RegExp("(^| )"+name+"=([^;]*)(;|$)");
                return (arr=document.cookie.match(reg)) ? unescape(arr[2]) : null;
            },
            //鼠标覆盖和离开头像事件
            show_user_box: function(){
                this.boxShow = true;
            },
            hide_user_box: function() {
                this.boxShow = false;
            },
            // 滚动事件
            scroll_event:function(){
                let that = this,
                    scroll_top = window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop, //兼容
                    window_height = window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight,
                    active_line = window_height/3,
                    nav_list = that.nav_list;
                document.querySelectorAll('.detail_list li').forEach(function(item, index){
                    if(item.offsetTop - scroll_top - active_line <= 0){
                        nav_list.forEach(function(nav){
                            nav.active = false;
                        });
                        nav_list[index].active = true;
                    }
                });
                if(document.querySelector('.agreement_contain').clientHeight === window_height + scroll_top){
                    nav_list.forEach(function(nav){
                        nav.active = false;
                    });
                    nav_list[nav_list.length - 1].active = true;
                }
                that.nav_list = nav_list;
            },
            // 锚点点击
            to_detail:function(item){
                let that = this,
                    offset_top = document.querySelector(item.target).offsetTop - 120,
                    scroll_top = window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop;
                clearInterval(that.scroll_timeout);
                that.nav_list.forEach(function(nav){
                    nav.active = false;
                });
                item.active = true;
                that.scroll_timeout = setInterval(function(){
                    if(scroll_top !== offset_top){
                        if(scroll_top > offset_top){
                            scroll_top = scroll_top - 20 <= offset_top ? offset_top : scroll_top - 20;
                        }else{
                            scroll_top = scroll_top + 20 >= offset_top ? offset_top : scroll_top + 20;
                        }
                        window.pageYOffset = scroll_top;
                        document.documentElement.scrollTop = scroll_top;
                        document.body.scrollTop = scroll_top;
                    }else{
                        clearInterval(that.scroll_timeout);
                    }
                },10);
            },
        },
        mounted(){
            const that = this;
            window.addEventListener('scroll', that.scroll_event);
            that.scroll_event();
        },
    }
</script>

<style lang="less" scoped>
    @import url("../../assets/pc/css/common.css");
    @user_bg:url(../../assets/pc/images/common/user_info_bg.png) no-repeat;

    /*页面容器*/
    .agreement_contain{
        min-width:1240px;
        width:100%;
        margin:0 auto;
        padding-top:90px;
        font-family: "Microsoft YaHei";
    }
    /*头部*/
    .index_header{
        position:absolute;
        top:0;
        left:0;
        width:100%;
        height:60px;
        padding:0 80px;
        z-index:10;
        text-align:left;
        font-size:0;
        &.fixed_head{
            position:fixed;
            background:#ffffff;
            box-shadow:0 5px 5px rgba(0, 0, 0, 0.07);
            transition:all 0.2s;
            .un_login .login{
                color:#515151;
            }
            .user_center a{
                color:#515151;
            }
            .user_info{
                top:60px;
            }

        }
        img{
            margin-top:20px;
        }
        .un_login {
            position:absolute;
            top:0;
            right:80px;
            display:inline-block;
            height:60px;
            line-height:60px;
            font-size:0;
            a{
                display:inline-block;
                width:60px;
                height:30px;
                line-height:30px;
                font-size:14px;
                color:#ffffff;
                text-align:center;
                vertical-align:middle;
            }
            .login {
                color:#fff;
            }
            .sign_up{
                margin-left:8px;
                border-radius:30px;
                background:var(--mainColor);
            }
        }
        .user_head {
            position:absolute;
            top:0;
            right:80px;
            width:auto;
            height:60px;
            line-height:60px;
            a{
                display:inline-block;
                vertical-align:middle;
                height:30px;
                line-height:30px;
                padding:0 13px;
                font-size:14px;
                color:#fff;
                border-radius:30px;
                background:var(--mainColor);
                text-align:center;
            }
        }
    }
    /*协议容器*/
    .content_box{
        width:1240px;
        margin:0 auto;
        padding:80px 0 0 210px;
        .agreement_title{
            position:fixed;
            top:60px;
            left:50%;
            width:1240px;
            height:70px;
            line-height:100px;
            margin-left:-620px;
            border-bottom:1px solid #e5e5e5;
            background:#ffffff;
            font-size:20px;
            color:#1f1f1f;
            span{
                position:absolute;
                right:0;
                top:0;
                height:40px;
                font-size:12px;
                color:#96a0ac;
            }
        }
        .agreement_nav{
            position:fixed;
            top:170px;
            left:50%;
            width:210px;
            margin:0 0 0 -620px;
            li{
                height:24px;
                line-height:24px;
                margin-bottom:10px;
                font-size:14px;
                color:#404040;
                cursor:pointer;
                &.active, &:hover{
                    color:var(--mainColor);
                    text-decoration:underline;
                }
            }
        }
        .agreement_detail{
            line-height:20px;
            padding-bottom:80px;
            font-size:14px;
            color:#545454;
            .list_title{
                display:inline-block;
                margin:20px 0 10px;
                font-size:18px;
                color:#313131;
            }
            .list_content{
                color:#9c9c9c;
            }
        }
    }
    /*尾部*/
    .agreement_foot{
        position:relative;
        width:1240px;
        height:80px;
        line-height:40px;
        margin:0 auto;
        border-top:1px solid #e5e5e5;
        font-size:12px;
        color:#9c9c9c;
        span{
            &:first-child{
                padding-right:130px;
            }
            &:last-child{
                position:absolute;
                top:0;
                right:0;
                a{
                    color:#9c9c9c;
                }
            }
        }
    }
</style>