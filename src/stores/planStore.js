// stores/incomeStore.js
import { defineStore } from 'pinia'
import { ref } from 'vue'
import { planAPI, addPlanAPI,updateStorageAPI } from '@/apis/plan'

export const usePlanStore = defineStore('plan', () => {
  // 获取收入数据
  // 将初始值改为空数组 []
  const planInfo = ref([])

  const getPlanInfo = async () => {
    try {
      const res = await planAPI()

      // 严格验证数据结构
      if (res?.code === 200) {
        planInfo.value = res.data
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

  const addData = async (newPlan) => {
    try {
      const res = await addPlanAPI(newPlan)

      //严格验证响应结构
      if (res?.code !== 200) {
        throw new Error(res.message || '接口数据异常')
      }

      //使用服务端返回的真实数据
      planInfo.value = [
        formatPlanItem(res.data),
        ...planInfo.value
      ]

      return res.data
    } catch (error) {
      console.error('添加失败:', error)
      await getPlanInfo()
      throw error
    }
  }
  const updateStorage = async (data) => {
    const res = await updateStorageAPI(data)
    if (res?.code === 200) {
      const index = planInfo.value.findIndex(p => p.id === data.id)
      if (index !== -1) {
        planInfo.value[index] = formatPlanItem(res.data)
      }
    }
    return res.data
  }
  // 数据格式化方法
  const formatPlanItem = (item) => ({
    ...item,
    startdate: item.startdate.replace('T', ' ').slice(0, 19),
    overdate: item.overdate.replace('T', ' ').slice(0, 19),
  })
  return {
    planInfo,
    getPlanInfo,
    addData,
    updateStorage
  }
})
