// stores/incomeStore.js
import { defineStore } from 'pinia'
import { ref } from 'vue'
import { rbsAPI, addRbsAPI } from '@/apis/rbs'

export const useRbsStore = defineStore('rbs', () => {
  // 获取收入数据
  // 将初始值改为空数组 []
  const rbsInfo = ref([])

  const getRbsInfo = async () => {
    try {
      const res = await rbsAPI()

      // 严格验证数据结构
      if (res?.code === 200) {
        rbsInfo.value = res.data
        console.log('接口原始响应:', res)
      } else {
        throw new Error('接口返回数据结构异常')
      }
    } catch (error) {
      console.error('完整错误追踪:', error)
      throw error
    }
  }

  //新增收入数据

  const addData = async (newRbs) => {
    try {
      const res = await addRbsAPI(newRbs)

      //严格验证响应结构
      if (res?.code !== 200) {
        throw new Error(res.message || '接口数据异常')
      }

      //使用服务端返回的真实数据
      rbsInfo.value = [
        formatIncomeItem(res.data),
        ...rbsInfo.value
      ]

      return res.data
    } catch (error) {
      console.error('添加失败:', error)
      await getRbsInfo()
      throw error
    }
  }
  // 数据格式化方法
  const formatIncomeItem = (item) => ({
    ...item,
    date: item.date.replace('T', ' ').slice(0, 19),
    amount: parseFloat(item.amount).toFixed(2),
    img: item.img ? `${item.img}` : null
  })
  return {
    rbsInfo,
    getRbsInfo,
    addData
  }
})
