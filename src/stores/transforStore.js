import { defineStore } from "pinia";
import { ref } from "vue";
import { transforAPI } from "@/apis/transfor";

export const useTransforStore = defineStore('transfor',()=>{
  //定义空数组存储data数据
  const transforInfo = ref([])

  const getTransforInfo = async() =>{
    try{
      const res = await transforAPI()
      console.log(res)

      if(res?.code === 200){
        transforInfo.value = res.data
        console.log(transforInfo.value)
      }else{
        throw new Error('接口返回数据结构异常')
      }
    }catch(error){
      console.error(error)
      throw error
    }
  }
  return{
    transforInfo,
    getTransforInfo
  }
})
