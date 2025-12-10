// stores/incomeStore.js
import { defineStore } from 'pinia'
import { ref } from 'vue'
import { expenseAPI, addExpenseAPI,updateExpenseAPI,deleteExpenseAPI } from '@/apis/expense'

export const useExpenseStore = defineStore('expense', () => {
  // 将初始值改为空数组 []
  const expenseInfo = ref([])
  const currentMonthExpenseTotal = ref(0)
  const categories = ref([])
  const getExpenseInfo = async () => {
    try {
      const res = await expenseAPI()
      console.log('接口原始响应:', res)

      // 严格验证数据结构
      if (res?.code === 200) {
        expenseInfo.value = res.data
        currentMonthExpenseTotal.value = calculateCurrentMonthTotal()
        categories.value = expenseCategories()
        console.log("expense的categories",categories.value)
        console.log('存储后的数据:', expenseInfo.value)
      } else {
        throw new Error('接口返回数据结构异常')
      }
    } catch (error) {
      console.error('完整错误追踪:', error)
      throw error
    }
  }

  //新增支出数据
  const addData = async (newExpense) => {
    try {
      const res = await addExpenseAPI(newExpense)

      if (res?.code !== 200) {
        throw new Error(res.message || '接口数据异常')
      }

      expenseInfo.value = [
        formatExpenseItem(res.data),
        ...expenseInfo.value
      ]
    } catch (error) {
      console.error("支出数据添加失败", error)
    }
  }
  // 数据格式化方法
  const formatExpenseItem = (item) => ({
    ...item,
    date: item.date.replace('T', ' ').slice(0, 19),
    amount: parseFloat(item.amount).toFixed(2),
    voucher: item.voucher ? `${item.voucher}` : null
  })
  const currentDate = new Date()
  const currentYear = currentDate.getFullYear()
  const currentMonth = currentDate.getMonth() + 1
  // 计算每月总收入
  const calculateCurrentMonthTotal = () => {
    return expenseInfo.value
      .filter(item => {
        const date = new Date(item.date)
        return date.getFullYear() === currentYear &&
          date.getMonth() + 1 === currentMonth
      })
      .reduce((sum, item) => sum + item.amount, 0)
  }
  // 消费分类数据
  const expenseCategories =() => {
    return expenseInfo.value
      .filter(item => {
        const date = new Date(item.date)
        return date.getFullYear() === currentYear && date.getMonth() + 1 === currentMonth
      })
      .reduce((acc, item) => {
        acc[item.category] = (acc[item.category] || 0) + item.amount
        return acc
      }, {})
  }
  // 新增更新方法
    const updateExpenseData = async (id, updatedData) => {
      try {
        const formData = new FormData()
        formData.append('amount', updatedData.amount)
        formData.append('date', updatedData.date)
        formData.append('category', updatedData.category)
        if (updatedData.voucherFile) {
          formData.append('voucher', updatedData.voucherFile)
        }
        formData.append('clearVoucher', updatedData.clearVoucher)

        const res = await updateExpenseAPI(id, formData)

        if (res?.code === 200) {
          // 更新本地数据
          const index = expenseInfo.value.findIndex(item => item.id === id)
          if (index !== -1) {
            expenseInfo.value[index] = res.data
          }
          return res.data
        }
        throw new Error(res.message || '更新失败')
      } catch (error) {
        console.error('更新失败:', error)
        await getExpenseInfo()
        throw error
      }
    }

    // 新增删除方法
    const deleteExpenseData = async (id) => {
      try {
        const res = await deleteExpenseAPI(id)

        if (res?.code === 200) {
          // 从本地数据移除
          expenseInfo.value = expenseInfo.value.filter(item => item.id !== id)
          return true
        }
        throw new Error(res.message || '删除失败')
      } catch (error) {
        console.error('删除失败:', error)
        await getExpenseInfo()
        throw error
      }
    }
  return {
    expenseInfo,
    currentMonthExpenseTotal,
    categories,
    getExpenseInfo,
    addData,
    updateExpenseData,
    deleteExpenseData
  }
})
