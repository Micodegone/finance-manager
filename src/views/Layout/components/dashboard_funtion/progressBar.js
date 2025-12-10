import { computed } from "vue"
export const bar = (currentMonthExpense,currentMonthBudget) => {

  // 计算属性
  const validTotalBudget = computed(() => Math.max(currentMonthBudget.value, 1)) // 防止除零错误

  const budgetProgress = computed(() => {
    return (currentMonthExpense.value / validTotalBudget.value) * 100
  })

  // 有效进度百分比（最大显示100%）
  const validBudgetProgress = computed(() =>
    Math.min(budgetProgress.value, 100).toFixed(1)
  )

  // 是否超支
  const isOverBudget = computed(() => budgetProgress.value > 100)

  // 预算状态颜色
  const budgetStatus = computed(() =>
    isOverBudget.value ? 'exception' : 'success'
  )

  // 超支金额计算
  const overBudgetAmount = computed(() =>
    Math.max(currentMonthExpense.value - currentMonthBudget.value, 0)
  )

  // 超支百分比
  const overBudgetPercentage = computed(() =>
    isOverBudget.value
      ? ((overBudgetAmount.value / currentMonthBudget.value) * 100).toFixed(1)
      : 0
  )
  return {
    validBudgetProgress,
    budgetStatus,
    isOverBudget,
    overBudgetPercentage,
    overBudgetAmount
  }
}
