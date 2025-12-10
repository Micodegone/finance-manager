// stores/incomeStore.js
import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import {
  incomeAPI, addIncomeAPI, updateIncomeAPI, deleteIncomeAPI} from '@/apis/income'

export const useIncomeStore = defineStore('income', () => {
  // 获取收入数据
  // 将初始值改为空数组 []
  const incomeInfo = ref([])
  const currentMonthTotal = ref(0)
  const categories = ref()
  const getIncomeInfo = async () => {
    try {
      const res = await incomeAPI()

      // 严格验证数据结构
      if (res?.code === 200) {
        incomeInfo.value = res.data
        categories.value = computed(()=>{
          return [...new Set(incomeInfo.value.map(i=>i.category))].sort()
        })
        currentMonthTotal.value = calculateCurrentMonthTotal()
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
  const addData = async (newIncome) => {
    try {
      const res = await addIncomeAPI(newIncome)

      //严格验证响应结构
      if (res?.code !== 200) {
        throw new Error(res.message || '接口数据异常')
      }

      //使用服务端返回的真实数据
      incomeInfo.value = [
        formatIncomeItem(res.data),
        ...incomeInfo.value
      ]

      return res.data
    } catch (error) {
      console.error('添加失败:', error)
      await getIncomeInfo()
      throw error
    }
  }
  // 数据格式化方法
  const formatIncomeItem = (item) => ({
    ...item,
    date: item.date.replace('T', ' ').slice(0, 19),
    amount: parseFloat(item.amount).toFixed(2),
    voucher: item.voucher ? `${item.voucher}` : null
  })
  // 计算每月总收入
  const calculateCurrentMonthTotal = () => {
    const currentDate = new Date()
    const currentYear = currentDate.getFullYear()
    const currentMonth = currentDate.getMonth() + 1

    return incomeInfo.value
      .filter(item => {
        const date = new Date(item.date)
        return date.getFullYear() === currentYear &&
          date.getMonth() + 1 === currentMonth
      })
      .reduce((sum, item) => sum + item.amount, 0)
  }

  // 新增更新方法
  const updateData = async (id, updatedData) => {
    try {
      const formData = new FormData()
      formData.append('amount', updatedData.amount)
      formData.append('date', updatedData.date)
      formData.append('category', updatedData.category)
      if (updatedData.voucherFile) {
        formData.append('voucher', updatedData.voucherFile)
      }
      formData.append('clearVoucher', updatedData.clearVoucher)

      const res = await updateIncomeAPI(id, formData)

      if (res?.code === 200) {
        // 更新本地数据
        const index = incomeInfo.value.findIndex(item => item.id === id)
        if (index !== -1) {
          incomeInfo.value[index] = formatIncomeItem(res.data)
        }
        return res.data
      }
      throw new Error(res.message || '更新失败')
    } catch (error) {
      console.error('更新失败:', error)
      await getIncomeInfo()
      throw error
    }
  }

  // 新增删除方法
  const deleteData = async (id) => {
    try {
      const res = await deleteIncomeAPI(id)

      if (res?.code === 200) {
        // 从本地数据移除
        incomeInfo.value = incomeInfo.value.filter(item => item.id !== id)
        currentMonthTotal.value = calculateCurrentMonthTotal()
        return true
      }
      throw new Error(res.message || '删除失败')
    } catch (error) {
      console.error('删除失败:', error)
      await getIncomeInfo()
      throw error
    }
  }

  return {
    incomeInfo,
    currentMonthTotal,
    categories,
    getIncomeInfo,
    addData,
    updateData,
    deleteData
  }
})
