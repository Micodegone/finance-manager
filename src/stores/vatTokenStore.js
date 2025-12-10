import { VatTokenAPI } from '@/apis/vat_token'
import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useVatTokenStore = defineStore('vatToken', () => {
  const vat_token = ref(null)

  const getVatToken = async () => {
    try{
      const res = await VatTokenAPI()
      if(res?.code === 200){
        vat_token.value = res.data.access_token
      }else{
        throw new Error('接口返回数据结构异常')
      }
    }catch(error){
      console.error(error)
      throw error
    }
  }
  return {
    getVatToken,
    vat_token
  }
})
