let collaborate = {};
// 权限列表
collaborate.authority_map = {
    owner: {
        id:1,
        type: 'owner',
        name: '所有者',
        describe: ''
    },
    edit: {
        id:2,
        type: 'edit',
        name: '可以编辑',
        describe: '可以编辑、评论、分享文件'
    },
    onlyReview: {
        id:3,
        type: 'onlyReview',
        name: '只能评论',
        describe: '可以评论、不能编辑、分享文件'
    },
    onlyView: {
        id:4,
        type: 'onlyView',
        name: '只能查看',
        describe: '不能编辑、评论、分享文件'
    },
    remove: {
        type: 'remove',
        name: '移除协作',
    },
};
// 获取全部文档协作者方法
collaborate.all = function(that, params){
    let inside = {
            id: '',
            arr:[],
            success: '',
            fail: '',
        },
        new_params = Object.assign(inside, params);
    // 判断错误情况
    if(!that) return false;
    if(typeof new_params.success !== 'function') return false;
    that.$axios.get('/api/member/document_collaborate/list/')
        .then(function(data){
            if(typeof new_params.success === 'function') new_params.success(data);
        })
        .catch(function(info){
            if(typeof new_params.fail === 'function') new_params.fail(info);
        })
};
// 获取指定文档协作者方法
collaborate.specific = function(that, params){
    let inside = {
            id: '',
            success: function(){},
            fail: function(){},
        },
        new_params = Object.assign(inside, params);
    // 判断错误情况
    if(!that) return false;
    if(new_params.id === '') return false;
    that.$axios.get('/api/member/document_collaborate/list/', {params: {
            docId: new_params.id,
        }})
        .then(function(data){
            if(data.data.code === '2' && data.data.data[new_params.id].length > 1){
                let list = data.data.data[new_params.id],
                    no_owner = list.filter(item => item.collaborateRoleType !== 'owner'),
                    owner = list.filter(item => item.collaborateRoleType === 'owner');
                data.data.data[new_params.id] = owner.concat(no_owner);
            }
            if(typeof new_params.success === 'function') new_params.success(data);
        })
        .catch(function(info){
            if(typeof new_params.fail === 'function') new_params.fail(info);
        })
};
// 增加协作者方法
collaborate.add = function(that, params){
    let inside = {
            id: '',
            arr:[],
            success: function(){},
            fail: function(){},
        },
        new_params = Object.assign(inside, params);
    // 判断错误情况
    if(!that) return false;
    if(new_params.id === '') return false;
    if(typeof new_params.arr !== 'object' || new_params.arr.length <= 0) return false;
    that.$axios.post('/api/member/document_collaborate/batch_add/', {
        docId: new_params.id,
        addDocumentCollaborates: JSON.stringify(new_params.arr)
    })
        .then(function(data){
            if(typeof new_params.success === 'function') new_params.success(data);
        })
        .catch(function(info){
            if(typeof new_params.fail === 'function') new_params.fail(info);
        })
};
// 删除协作者方法
collaborate.delete = function(that, params){
    let inside = {
            id: '',
            partner:{},
            success: function(){},
            fail: function(){},
        },
        new_params = Object.assign(inside, params);
    // 判断错误情况
    if(!that) return false;
    if(new_params.id === '') return false;
    if(typeof new_params.partner !== 'object' || !new_params.partner.documentCollaborateId) return false;
    that.$axios.post('/api/member/document_collaborate/delete/',{
        docId: new_params.id,
        documentCollaborateId: new_params.partner.documentCollaborateId
    })
        .then(function(data){
            if(typeof new_params.success === 'function') new_params.success(data);
        })
        .catch(function(info){
            if(typeof new_params.fail === 'function') new_params.fail(info);
        })
};
// 协作者退出方法
collaborate.quit = function(that, params){
    let inside = {
            id: '',
            success: function(){},
            fail: function(){},
        },
        new_params = Object.assign(inside, params);
    // 判断错误情况
    if(!that) return false;
    if(new_params.id === '') return false;
    that.$axios.post('/api/member/document_collaborate/exit/', {docId: new_params.id})
        .then(function(data){
            if(typeof new_params.success === 'function') new_params.success(data);
        })
        .catch(function(info){
            if(typeof new_params.fail === 'function') new_params.fail(info);
        })
};
// 修改权限方法
collaborate.change = function(that, params){
    let inside = {
            id: '',
            role: '',
            collaborateId: '',
            success: function(){},
            fail: function(){},
        },
        new_params = Object.assign(inside, params);
    // 判断错误情况
    if(!that) return false;
    if(new_params.id === '') return false;
    if(new_params.role === '') return false;
    if(new_params.collaborateId === '') return false;
    that.$axios.post('/api/member/document_collaborate/collaborate_role/update/', {
        docId: new_params.id,
        role: new_params.role,
        documentCollaborateId: new_params.collaborateId
    })
        .then(function(data){
            if(typeof new_params.success === 'function') new_params.success(data);
        })
        .catch(function(info){
            if(typeof new_params.fail === 'function') new_params.fail(info);
        })

};
// 查找协作者
collaborate.search = function(that, params){
    let inside = {
            id: '',
            keyword: '',
            success: function(){},
            fail: function(){},
        },
        new_params = Object.assign(inside, params);
    // 判断错误情况
    if(!that) return false;
    if(new_params.id === '') return false;
    that.$axios.get('/api/member/document_collaborate/search/',{params: {
            docId: new_params.id,
            keyword: new_params.keyword
        }})
        .then(function(data){
            if(typeof new_params.success === 'function') new_params.success(data);
        })
        .catch(function(info){
            if(typeof new_params.fail === 'function') new_params.fail(info);
        })

};
// 查找最近协作者
collaborate.search_recent = function(that, params){
    let inside = {
            id: '',
            success: function(){},
            fail: function(){},
        },
        new_params = Object.assign(inside, params);
    // 判断错误情况
    if(!that) return false;
    if(new_params.id === '') return false;
    that.$axios.get('/api/member/document_collaborate/search/',{params: {
            docId: new_params.id,
            isRecent: true
        }})
        .then(function(data){
            if(data.data.code === "2"){
                data.data.data = data.data.data.sort(function(a, b) {return b.createDate - a.createDate;});
            }
            if(typeof new_params.success === 'function') new_params.success(data);
        })
        .catch(function(info){
            if(typeof new_params.fail === 'function') new_params.fail(info);
        })

};
// 移除最近协作者
collaborate.remove_recent = function (that, params) {
    let param = {
        data: {},
        success: null,
        fail: null,
    };
    param = Object.assign(param, params);
    let arr = [];
    arr.push(param.data.email, param.data.memberId, param.data.mobile, param.data.invitee);
    arr = arr.map((item) => {
        if (!!item) {
            return `${item}`;
        }
    });
    if (arr.length === 0) {
        if(typeof param.fail === 'function') param.fail();
        return false;
    }
    that.$axios.post('/api/member/document_collaborate/delete_recent/', {
        invitees: arr.join(',')
    }).then((res) => {
        let res_data = res.data;
        if(res_data.code === "2"){
            if(typeof param.success === 'function') param.success(res_data);
        }
    }).catch((err) => {
        if(typeof param.fail === 'function') param.fail(err);
    });
};
// 导出
module.exports = collaborate;