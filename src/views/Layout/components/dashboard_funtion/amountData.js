import { computed } from "vue"
export const amountDataDispose = (incomeInfo,expenseInfo) => {

  // 工具函数
  const currentDate = new Date()
  const currentYear = currentDate.getFullYear()
  const currentMonth = currentDate.getMonth() + 1

  // 格式金额显示
  const formatAmount = (value) => {
    return Number(value || 0).toLocaleString('zh-CN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })
  }

  // 获取当月天数
  const getMonthDays = (year, month) => {
    return new Date(year, month, 0).getDate()
  }
  // 新增计算当前已过天数
  const getCurrentDaysPassed = () => {
    const today = new Date()
    // 确认当前月份是否匹配
    if (today.getMonth() + 1 !== currentMonth) return 0
    return today.getDate()
  }

  // 本月收支数据计算
  const currentMonthIncome = computed(() => {
    return incomeInfo.value
      .filter(item => {
        const date = new Date(item.date)
        return date.getFullYear() === currentYear && date.getMonth() + 1 === currentMonth
      })
      .reduce((sum, item) => sum + item.amount, 0)
  })

  const currentMonthExpense = computed(() => {
    return expenseInfo.value
      .filter(item => {
        const date = new Date(item.date)
        return date.getFullYear() === currentYear && date.getMonth() + 1 === currentMonth
      })
      .reduce((sum, item) => sum + item.amount, 0)
  })

  // 净资产计算
  const netWorth = computed(() => {
    const totalIncome = incomeInfo.value.reduce((sum, item) => sum + item.amount, 0)
    const totalExpense = expenseInfo.value.reduce((sum, item) => sum + item.amount, 0)
    return totalIncome - totalExpense
  })

  // 消费分类数据
  const expenseCategories = computed(() => {
    return expenseInfo.value
      .filter(item => {
        const date = new Date(item.date)
        return date.getFullYear() === currentYear && date.getMonth() + 1 === currentMonth
      })
      .reduce((acc, item) => {
        acc[item.category] = (acc[item.category] || 0) + item.amount
        return acc
      }, {})
  })

  // 趋势图数据
  const lineChartData = computed(() => {
    const days = getMonthDays(currentYear, currentMonth)
    const daysPassed = getCurrentDaysPassed()
    const displayDays = daysPassed > 0 ? daysPassed : days

    const dailyData = Array.from({ length: displayDays }, () => ({ income: 0, expense: 0 }))

    // 处理收入数据
    incomeInfo.value.forEach(item => {
      const date = new Date(item.date)
      if (date.getFullYear() === currentYear && date.getMonth() + 1 === currentMonth && date.getDate() <= displayDays) {
        const day = date.getDate() - 1
        if (day < displayDays) {
          dailyData[day].income += (item.amount || 0)
        }
      }
    })

    // 处理支出数据
    expenseInfo.value.forEach(item => {
      const date = new Date(item.date)
      if (date.getFullYear() === currentYear && date.getMonth() + 1 === currentMonth && date.getDate() <= displayDays) {
        const day = date.getDate() - 1
        if (day < displayDays) {
          dailyData[day].expense += (item.amount || 0)
        }
      }
    })

    return {
      days: Array.from({ length: displayDays }, (_, i) => `${i + 1}日`),
      income: dailyData.map(d => d.income),
      expense: dailyData.map(d => d.expense)
    }
  })
  return{
    formatAmount,
    currentMonthIncome,
    currentMonthExpense,
    netWorth,
    expenseCategories,
    lineChartData,
    currentMonth
  }
}
