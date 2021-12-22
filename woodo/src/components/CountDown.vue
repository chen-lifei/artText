<template>
  <span >{{count}}</span>
</template>
<script>
    export default{
        data () {
            return {
                count : 0,
                flag : false
            }
        },
        mounted () {
            this.count = this.maxCount;
            let time = setInterval(()=>{
                if(this.flag == true){
                    clearInterval(time)
                }
                this.countDown();
            },this.stepTime)
        },
        props : {
            maxCount : {
                default : 0,
                type : Number
            },
            step : {
                default : 1,
                type : Number
            },
            stepTime : {
                default : 1000,
                type : Number
            }
        },
        methods : {
            countDown () {
                let count = this.count - this.step;
                if(count <= 0){
                    this.flag = true
                    this.$emit('finish')
                }
                this.count = count;
            }
        }
    }
</script>
<style scoped></style>