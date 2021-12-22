<template>
    <div>
        跳转中...
    </div>
</template>

<script>
    export default {
        mounted () {
            let that = this;
            let docId = that.$route.query.docId;//文档id
            that.$axios.get(`/api/document/get_url/${docId}/`).then(function(data){
                data = data.data;
                if(data.type === 'success'){
                    location.href = `/mobile/document/slides/${data.data}/`;
                    return;
                }
                location.href = '/mobile/';
            });
        }
    }
</script>
