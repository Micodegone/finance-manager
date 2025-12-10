import { ref, computed } from "vue"
export const totalListData = (info) => {
  // 分页配置
  const pageSize = ref(5)
  const currentPage = ref(1)
  const total = computed(() => filteredData.value?.length || 0)

  // 金额格式化
  const formatAmount = (amount) => {
    return Number(amount).toLocaleString('zh-CN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })
  }
  // 处理分页变化
  const handlePageChange = (page) => {
    currentPage.value = page
  }

  // 计算当前页数据
  const tableData = computed(() => {
    const start = (currentPage.value - 1) * pageSize.value
    const end = start + pageSize.value
    return filteredData.value.slice(start, end)
  })
  // 新增搜索相关代码
  const searchParams = ref({
    dateRange: [],
    category: '',
    minAmount: null,
    maxAmount: null
  })

  // 获取所有类别选项
  const categoryOptions = computed(() => {
    return [...new Set(info.value.map(item => item.category))]
  })

  // 过滤后的数据
  const filteredData = computed(() => {
    return info.value.filter(item => {
      const date = new Date(item.date)
      const amount = Number(item.amount)

      // 日期范围过滤
      if (searchParams.value.dateRange?.length === 2) {
        const start = new Date(searchParams.value.dateRange[0])
        const end = new Date(searchParams.value.dateRange[1])
        end.setHours(23, 59, 59) // 包含结束日期的全天
        if (date < start || date > end) return false
      }

      // 类别过滤
      if (searchParams.value.category &&
        item.category !== searchParams.value.category) {
        return false
      }

      // 金额范围过滤
      if (searchParams.value.minAmount !== null &&
        amount < searchParams.value.minAmount) {
        return false
      }

      if (searchParams.value.maxAmount !== null &&
        amount > searchParams.value.maxAmount) {
        return false
      }

      return true
    })
  })

  return {
    total,
    tableData,
    currentPage,
    pageSize,
    categoryOptions,
    searchParams,
    formatAmount,
    handlePageChange
  }

}
