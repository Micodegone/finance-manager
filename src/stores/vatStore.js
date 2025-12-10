// stores/vatStore.js
import { defineStore } from 'pinia'
import { ref } from 'vue'
import { VatAPI, addVatAPI ,deleteVatAPI} from '@/apis/vat'

export const useVatStore = defineStore('vat', () => {
  // 获取收入数据
  // 将初始值改为空数组 []
  const vatInfo = ref([])

  const getVatInfo = async () => {
    try {
      const res = await VatAPI()

      // 严格验证数据结构
      if (res?.code === 200) {
        vatInfo.value = res.data
        console.log('接口原始响应:', res)
        console.log("增值税发票数据: ",vatInfo.value)
      } else {
        throw new Error('接口返回数据结构异常')
      }
    } catch (error) {
      console.error('完整错误追踪:', error)
      throw error
    }
  }

  //新增收入数据
  const addData = async (newVat) => {
    try {
      const res = await addVatAPI(newVat)

      //严格验证响应结构
      if (res?.code !== 200) {
        throw new Error(res.message || '接口数据异常')
      }

      //使用服务端返回的真实数据
      vatInfo.value = [
        res.data,
        ...vatInfo.value
      ]
      console.log("增值税发票数据: ",vatInfo.value)
      return res.data
    } catch (error) {
      console.error('添加失败:', error)
      await getVatInfo()
      throw error
    }
  }

    // 新增删除方法
    const deleteVat = async (id) => {
      try {
        const res = await deleteVatAPI(id)

        if (res?.code === 200) {
          // 从本地数据移除
          vatInfo.value = vatInfo.value.filter(item => item.id !== id)
          return true
        }
        throw new Error(res.message || '删除失败')
      } catch (error) {
        console.error('删除失败:', error)
        await getVatInfo()
        throw error
      }
    }
  return {
    vatInfo,
    getVatInfo,
    addData,
    deleteVat
  }
})
