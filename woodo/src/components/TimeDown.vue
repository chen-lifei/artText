<template>
  <span >{{time}}</span>
</template>
<script>
    export default{
        data () {
            return {
                time : '',
                flag : false
            }
        },
        mounted () {
            let time = setInterval(()=>{
                if(this.flag == true){
                    clearInterval(time)
                }
                this.timeDown()
            },1000)
        },
        props : {
            endTime : {
                type : Number
            }
        },
        methods : {
            timeDown () {
                const endTime = new Date(this.endTime)
                const nowTime = new Date();
                let leftTime = parseInt((endTime.getTime()-nowTime.getTime())/1000)
                let h = this.formate(parseInt(leftTime/(60*60)))
                let m = this.formate(parseInt(leftTime/60%60))
                let s = this.formate(parseInt(leftTime%60))
                if(leftTime <= 0){
                    this.flag = true
                    this.$emit('finish')
                }
                this.time = `${h}:${m}:${s}`
            },
            formate (time) {
                if(time>=10){
                    return time
                }else{
                    return `0${time}`
                }
            }
        }
    }
</script>
<style scoped></style>