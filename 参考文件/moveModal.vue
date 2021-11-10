<template>
    <transition name="modal-fade">
        <div class="options_masking" v-if="show_modal" :class="{hide: hide_modal}">
			<div class="move_folder_modal" v-if="desktop_folder_list.length > 0 || team_folder_list.length > 0">
				<div class="header">
					<h1>{{ modal_title }}</h1>
					<button class="modal-close" @click="close"></button>
				</div>
				<div class="body">
					<!-- 我的文档 -->
					<div class="folder_list_contain" v-if="desktop_folder_list.length > 0">
						<a class="folder_item parent" @click="check_target(desktop_folder_list[0],0,'myDesktop')" :class="{check:desktop_folder_list[0] === target_folder_info,open:desktop_folder_list[0].open && desktop_folder_list.length > 1}">
							<p><span>我的文档</span></p>
						</a>
						<div class="list_wrapper document" v-if="desktop_folder_list[0].open">
							<a v-for='(item,index) in desktop_folder_list' class="folder_item"
								v-if="item.show && index > 0"
								:key="index"
								@click="check_target(item,index,'myDesktop')"
								:class="{check:item === target_folder_info,open:item.open,nochild:item.nochild}"
								:style="{paddingLeft: item.grade > 1 ? item.grade * 10 + 'px' : 0}">
								<p><span>{{item.name}}</span></p>
							</a>
							</div>
						</div>
						<!-- 我的团队 -->
						<div class="folder_list_contain" v-if="team_folder_list.length > 0">
							<a class="folder_item parent" 
								@click="check_target(team_folder_list[0],0,'myTeam')" 
								:class="{check:team_folder_list[0] === target_folder_info,open:team_folder_list[0].open && team_folder_list.length > 1}"
							>
								<p><span>我的团队</span></p>
							</a>
							<div class="list_wrapper team" v-if="team_folder_list[0].open">
								<a v-for='(item,index) in team_folder_list' class="folder_item" 
									v-if="item.show && index > 0" 
									:key="index"
									@click="check_target(item,index,'myTeam')" 
									:class="{check:item === target_folder_info,open:item.open,nochild:item.nochild}"
									:style="{paddingLeft: item.grade > 1 ? item.grade * 10 + 'px' : 0}">
									<p><span>{{item.name}}</span></p>
								</a>
							</div>
						</div>
						<!-- 空状态  -->
						<div class="no_folder" v-if="desktop_folder_list.length === 0 && team_folder_list.length === 0">
							<p>你还没有子文件夹噢~</p>
						</div>
				</div>
                <div class="footer">
                    <p>移动至 {{target_folder_info && target_folder_info.name}}</p>
                    <button class="ok_btn" @click="sure">{{show_next ? '下一步' : '确定'}}</button>
                    <button class="cancel_btn" @click="close">取消</button>
                </div>
			</div>
		</div>
	</transition>
</template>
<style lang="less" scoped>
	// 通用设置弹框
	.options_masking{
		position: fixed;
		top: 0;
		left: 0;
        z-index:10;
		width: 100%;
		height: 100%;
		text-align: center;
		background-color: rgba(0, 0, 0, 0.502);
		font-size: 16px;
		color: #666666;
		&:after{
			content: "";
			display: inline-block;
			vertical-align: middle;
			width: 0;
			height: 100%;
        }
        &.hide{
            display:none;
        }
    }
    .move_folder_modal{
        position:relative;
        display:inline-block;
        vertical-align:middle;
        width:500px;
        min-height:295px;
        max-height:600px;
        height:auto;
        padding:0 30px;
        overflow:hidden;
        border-radius:4px;
        background:#fff;
        user-select:none;
        .header{
            h1{
                display:block;
                height:70px;
                line-height:70px;
                font-size:20px;
                color:#0d1c2e;
                text-align:left;
            }
            .modal-close{
                position: absolute;
                right: 5px;
                top: 5px;
            }
        }
        .body{
            .folder_list_contain{
                padding-bottom:10px;
                &:first-child{
                    border-bottom:1px solid #e5e5e5;
                    margin-bottom:15px;
                }
                .list_wrapper{
                    max-height:200px;
                    overflow-y:auto;
                    &::-webkit-scrollbar-track{
                        background-color:#ffffff;
                    }
                    &::-webkit-scrollbar-thumb{
                        background-color:#e4e4e4;
                    }
                }
                .document{
                    min-height:145px;
                    margin-bottom:5px;
                }
                .team{
                    min-height:122px;
                }
                .folder_item{
                    position:relative;
                    display:block;
                    width:100%;
                    height:33px;
                    line-height:33px;
                    margin-bottom:4px;
                    color:#505050;
                    font-size:14px;
                    text-align:left;
                    cursor:default;
                    &:hover{
                        opacity:1;
                    }
                    &::before{
                        content: "";
                        position: absolute;
                        top: 15px;
                        left: 0;
                        width: 4px;
                        height: 4px;
                        margin-left:1px;
                        border: 1px solid #a6a6a6;
                        border-left: transparent;
                        border-top: transparent;
                        transform: rotate(-45deg);
                        transition: all 0.2s;
                    }
                    p{
                        display: inline-block;
                        width: calc(100% - 11px);
                        padding: 0 0 0 6px;
                        margin-left: 11px;
                        cursor:pointer;
                        &:hover{
                            background:#e8f3ff;
                        }
                    }
                    span{
                        display: inline-block;
                        vertical-align: middle;
                        width: 100%;
                        padding-right:6px;
                        white-space: nowrap;
                        text-overflow: ellipsis;
                        overflow: hidden;
                        &::before{
                            content:"";
                            display:inline-block;
                            vertical-align:middle;
                            width: 22px;
                            height: 18px;
                            margin:0 10px 3px 0;
                            background: url(../assets/pc/images/doc/folder_list_icon.png) no-repeat;
                            background-size:contain;
                        }
                    }
                    &.open::before{
                        transform: rotate(45deg);
                        border-color:#000000;
                    }
                    &.check p{
                        background:#e8f3ff;
                    }
                    &.nochild::before{
                        display:none;
                    }
                    &.parent{
                        p{
                            width:auto;
                            height:25px;
                            line-height:23px;
                        }
                        span::before{
                            display:none;
                        }
                    }
                }
            }
        }
        .footer{
            width:100%;
            height:60px;
            line-height:40px;
            text-align:left;
            p{
                width:55%;
                white-space: nowrap;
                text-overflow: ellipsis;
                overflow: hidden;
                font-size:14px;
                color:#838f9f;
            }
            button{
                position:absolute;
                right:30px;
                bottom:20px;
                height:40px;
                line-height:40px;
                border-radius:5px;
                text-align:center;
                font-size:14px;
                &:hover{
                    opacity:0.7;
                }
                &.cancel_btn{
                    width:60px;
                    right:153px;
                    background:#e9edf4;
                    color:#707b8e;
                }
                &.ok_btn{
                    width:110px;
                    background:var(--mainColor);
                    color:#fff;
                }
            }
        }
    }
</style>
<script>
export default {
    name:'MoveModal',
    data(){
        return{                        
            show_modal: false,                    // 展示移动弹框
            hide_modal: false,                    // 隐藏移动弹框
            show_team: true,                      // 展示我的团队文档列表
            show_desktop: true,                   // 展示我的桌面文档列表
            show_next: false,                     // 展示按钮类型(确定，下一步)
            modal_title: '移动至',                // 弹框标题
            cur_listType: null,                   // 当前文档列表类型key
			team_folder_list: [],                 // 团队文档列表
			desktop_folder_list: [],              // 桌面文档列表
			target_folder_info: {},               // 移动目标文件夹信息
            target_folder_type: 'myDesktop',      // 移动目标文件夹类型 (myDesktop:我的文档, myTeam:我的团队)
        }
    },  
    methods: {
        // 打开移动弹框
        open(opt) {
            let that = this;
            let option = {
                modal_title: '移动至',
                cur_listType: null,
                show_desktop: true,
                show_team: true,
            };

            option = Object.assign(option, opt);
            that.modal_title    = option.modal_title;
            that.show_desktop   = option.show_desktop;
            that.show_team      = option.show_team;
            that.cur_listType   = option.cur_listType;

            that.show_modal = true;
            // 获取文件夹列表
            that.get_folder(() => {
                // 设置初始选中文件夹
                if(that.cur_listType === 'myTeam' && that.team_folder_list.length > 0){
                    that.target_folder_info = that.team_folder_list[0];
                    that.team_folder_list[0].check = true;
                }else{
                    that.target_folder_info = that.desktop_folder_list[0];
                    that.desktop_folder_list[0].check = true;
                }
            });            
        },
        // 关闭移动弹框
        close() {
            this.show_modal = false;
            this.hide_modal = false;
        },
        // 获取文件夹列表
        get_folder(callback) {
            let that = this;
            // 获取我的文档文件夹列表
            let get_desktop = function(){
                that.$axios.get("/api/member/folder/list/")
                .then(function(data){
                    if(data.data.code == 2){
                        success_callback(data.data.data,'desktop_folder_list');
                    }else{
                        that.$toast(data.data.content,1000);
                    }
                })
            }
            // 获取我的团队文件夹列表
            let get_team = function(){
                that.$axios.get("/api/member/team/folder/list/")
                .then(function(data){
                    if(data.data.code == 2){
                        if (data.data.data.length === 0) that.show_team = false;
                        success_callback(data.data.data,'team_folder_list');
                    }
                })
            }              				
            // 成功回调
            let success_callback = function(list,result){
                $.each(list,function(index,item){
                    // 第0级文件夹默认展示
                    if(item.grade === 0){
                        item.show = true;
                        item.open = true;
                    }
                    // 第1级文件夹默认展示
                    if(item.grade === 1){
                        item.show = true;
                    }
                    // 判断是否还有子级文件夹
                    if(list.filter(data => data.treePath.indexOf("," + item.id + ",") != -1 ).length === 0){
                        item.nochild = true;
                    }
                })
                that[result] = list;
                setTimeout(() => {
                    if(typeof callback === 'function') callback();
                }, 300);
            }
            if(that.show_team) get_team();
            if(that.show_desktop) get_desktop();
        },
        // 选中移动目标文件夹 & 打开文件夹
        check_target(p_item,p_index,type) {
            let that = this,
                cur_result = type === 'myTeam' ? 'team_folder_list' : 'desktop_folder_list',
                oth_result = type === 'myTeam' ? 'desktop_folder_list' : 'team_folder_list',                    
                cur_list = that[cur_result],
                oth_list = that[oth_result],                   
                open = !cur_list[p_index].open;
            that.target_folder_type = type;
            that.target_folder_info = p_item;                         
            // 其余列表清除选中状态
            $.each(oth_list,function(o_index,o_item){                   
                o_item.check = false;                   
            })
            let open_folder = function () {
                // 无子文件夹拦截
                if(p_item.nochild){                       
                    $.each(cur_list,function(c_index,c_item){
                        c_item.check = false;
                        if(c_index == p_index) c_item.check = true;
                    })
                    that[cur_result] = cur_list;                        
                    return false;
                }                    
                // 文件夹打开/关闭
                cur_list[p_index].open = open;                       
                // 首级文件夹选中时才可打开关闭
                if(p_index === 0 && !cur_list[p_index].check) cur_list[p_index].open = open = true 
                $.each(cur_list,function(c_index,c_item){
                    c_item.check = false;
                    if(c_index === p_index) c_item.check = true;
                    // 打开
                    if(open){
                        //当前文件夹的下一层显示
                        if(c_item.treePath.indexOf("," + p_item.id + ",") != -1 && c_item.grade === p_item.grade + 1){
                            c_item.show = true;
                        }
                    }
                    // 关闭
                    else{
                        //当前文件夹的子级全部隐藏
                        if(c_item.treePath.indexOf("," + p_item.id + ",") != -1){
                            c_item.show = false;
                            c_item.open = false;
                        }
                    }                    
                });
                that[cur_result] = cur_list;
                that[oth_result] = oth_list;    
                // 强制刷新
                that.$forceUpdate();   
            }
            // 判断按钮状态
            if(that.cur_listType === 'myDesktop' && that.target_folder_type === 'myTeam'){
                that.show_next = true;
            }else{
                that.show_next = false;
            }
            // 打开文件列表
            open_folder();                  
        },
        // 点击按钮事件
        sure() {
            this.$emit('confirm_location',{
                has_next:    this.show_next,
                folder:      this.target_folder_info,
                folder_type: this.target_folder_type,
            })
        }       
    },
}
</script>