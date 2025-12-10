<template>
  <div class="report-container">
    <!-- 顶部概览 -->
    <el-row :gutter="20" class="mb-20">
      <el-col :span="6">
        <el-card class="summary-card">
          <div class="summary-item">
            <span class="label">本月总收入</span>
            <span class="value income">¥ {{ currentMonthTotal.toFixed(2) }}</span>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="summary-card">
          <div class="summary-item">
            <span class="label">本月总支出</span>
            <span class="value expense">¥ {{ currentMonthExpenseTotal.toFixed(2) }}</span>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="summary-card">
          <div class="summary-item">
            <span class="label">月度结余</span>
            <span class="value balance">¥ {{ (currentMonthTotal - currentMonthExpenseTotal).toFixed(2) }}</span>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="summary-card">
          <div class="summary-item">
            <span class="label">储蓄率</span>
            <span class="value save-rate">{{
              balanceRate.toFixed(2) }}%</span>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 主分析区 -->
    <el-row :gutter="20">
      <!-- 左栏 -->
      <el-col :span="16">
        <el-card>
          <template #header>
            <div class="chart-header">
              <span>月度收支趋势</span>
              <el-select v-model="timeRange" @change="updateTrendChart" placeholder="时间范围">
                <el-option label="近3个月" value="3" />
                <el-option label="近6个月" value="6" />
                <el-option label="近1年" value="12" />
              </el-select>
            </div>
          </template>
          <div ref="trendChart" class="chart-container"></div>
        </el-card>
      </el-col>
      <el-col :span="8">
        <el-card class="health-card">
          <template #header>
            <span>财务健康评分</span>
          </template>
          <div class="score-container">
            <div class="score-circle">{{ healthScore }}</div>
            <div class="score-label">财务健康指数</div>
          </div>
        </el-card>
      </el-col>

    </el-row>

    <el-card class="mt-20">
      <template #header>
        <span>消费分类TOP5</span>
      </template>
      <el-table :data="categoryData" stripe>
        <el-table-column prop="category" label="分类" />
        <el-table-column label="金额" width="150">
          <template #default="{ row }">
            <span class="expense">¥ {{ row.amount.toFixed(2) }}</span>
          </template>
        </el-table-column>
        <el-table-column label="占比" width="150">
          <template #default="{ row }">
            <el-progress :percentage="row.percentage" :show-text="false" />
            <span class="percentage">{{ row.percentage.toFixed(2) }}%</span>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 报告摘要 -->
    <el-card class="mt-20">
      <template #header>
        <span>月度报告摘要</span>
      </template>
      <div class="summary-text">
        <p>• 本月最大支出分类：{{ maxCategory.category }}（占比{{ maxCategory.percentage.toFixed(2) }}%）</p>
        <p>• 月度结余率：{{ balanceRate.toFixed(2) }}%</p>
        <p>• 消费波动指数：{{ consumptionVolatility.toFixed(2) }}</p>
      </div>
    </el-card>

  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import * as echarts from 'echarts'
import { useIncomeStore } from '@/stores/incomeStore'
import { useExpenseStore } from '@/stores/expenseStore'
import { storeToRefs } from 'pinia'

const incomeStore = useIncomeStore()
const expenseStore = useExpenseStore()
const { currentMonthTotal } = storeToRefs(incomeStore)
const { currentMonthExpenseTotal, categories } = storeToRefs(expenseStore)

// 图表相关
const trendChart = ref(null)
let chartInstance = null
const timeRange = ref('3')

// 消费分类TOP5
const categoryData = computed(() => {
  const total = currentMonthExpenseTotal.value
  return Object.entries(categories.value)
    .map(([category, amount]) => ({
      category,
      amount,
      percentage: (amount / total) * 100
    }))
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 5)
})

// 健康评分
const healthScore = computed(() => {
  const balance = currentMonthTotal.value - currentMonthExpenseTotal.value
  return Math.min(Math.floor((balance / currentMonthTotal.value) * 100), 100)
})

// 月度报告数据
const maxCategory = computed(() => {
  return categoryData.value[0] || { name: '无数据', percentage: 0 }
})

const balanceRate = computed(() => {
  return ((currentMonthTotal.value - currentMonthExpenseTotal.value) / currentMonthTotal.value) * 100
})

const consumptionVolatility = computed(() => {
  try {
    const amounts = categoryData.value.map(item => item.amount)

    // 处理空数组情况
    if (amounts.length === 0) return 0

    // 计算平均值（添加初始值）
    const total = amounts.reduce((a, b) => a + b, 0)
    const mean = total / amounts.length

    // 计算方差（添加初始值）
    const variance = amounts
      .map(x => Math.pow(x - mean, 2))
      .reduce((a, b) => a + b, 0) / amounts.length

    return Math.sqrt(variance)
  } catch (error) {
    console.error('计算消费波动指数出错:', error)
    return 0
  }
})

// 初始化图表
const initChart = () => {
  chartInstance = echarts.init(trendChart.value)
  updateTrendChart()
}

// 更新趋势图
const updateTrendChart = () => {
  const months = getRecentMonths(parseInt(timeRange.value))
  const incomeData = getMonthlyData(incomeStore.incomeInfo, months)
  const expenseData = getMonthlyData(expenseStore.expenseInfo, months)

  const option = {
    tooltip: {
      trigger: 'axis',
      formatter: params => `
        ${params[0].axisValue}<br/>
        收入: ¥${params[0].data.toFixed(2)}<br/>
        支出: ¥${params[1].data.toFixed(2)}
      `
    },
    xAxis: {
      type: 'category',
      data: months.map(m => `${m.year}-${m.month.toString().padStart(2, '0')}`)
    },
    yAxis: { type: 'value' },
    series: [
      {
        name: '收入',
        type: 'line',
        data: incomeData,
        itemStyle: { color: '#67C23A' },
        smooth: true
      },
      {
        name: '支出',
        type: 'line',
        data: expenseData,
        itemStyle: { color: '#F56C6C' },
        smooth: true
      }
    ]
  }
  chartInstance.setOption(option)
}

// 获取最近N个月
const getRecentMonths = (months) => {
  const result = []
  const date = new Date()
  for (let i = 0; i < months; i++) {
    result.unshift({
      year: date.getFullYear(),
      month: date.getMonth() + 1
    })
    date.setMonth(date.getMonth() - 1)
  }
  return result
}

// 获取月度数据
const getMonthlyData = (data, months) => {
  return months.map(({ year, month }) => {
    return data
      .filter(item => {
        const d = new Date(item.date)
        return d.getFullYear() === year && d.getMonth() + 1 === month
      })
      .reduce((sum, item) => sum + item.amount, 0)
  })
}
// 响应式调整
const handleResize = () => {
  chartInstance?.resize()
}

onMounted(async () => {
  await Promise.all(
    [
      incomeStore.getIncomeInfo(),
      expenseStore.getExpenseInfo(),
    ]
  )
  window.addEventListener('resize', handleResize)
  initChart()
})
</script>
<style scoped>
.chart-container {
  height: 400px;
}
.health-card {
  height: 100%;
  display: flex;
  flex-direction: column;

  :deep(.el-card__body) {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
  }
}

.report-container {
  padding: 20px;
  background-color: #f5f7fa;
  min-height: 100vh;
}

.summary-card {
  text-align: center;

  .summary-item {
    padding: 15px;

    .label {
      color: #909399;
      font-size: 14px;
    }

    .value {
      display: block;
      font-size: 20px;
      font-weight: bold;
      margin-top: 8px;

      &.income {
        color: #67C23A;
      }

      &.expense {
        color: #F56C6C;
      }

      &.balance {
        color: #409EFF;
      }

      &.save-rate {
        color: #E6A23C;
      }
    }
  }
}

.chart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.chart-placeholder {
  height: 300px;
  background: #f8f9fa;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #909399;

  &.pie {
    height: 250px;
  }
}

.asset-legend {
  padding: 15px;

  .legend-item {
    display: flex;
    align-items: center;
    margin: 8px 0;

    .dot {
      width: 12px;
      height: 12px;
      border-radius: 50%;
      margin-right: 10px;
    }

    .name {
      flex: 1;
      color: #606266;
    }

    .value {
      color: #909399;
    }
  }
}

.score-container {
  text-align: center;
  padding: auto;
  width: 100%;
  .score-circle {
    width: 100px;
    height: 100px;
    border-radius: 50%;
    background: #409EFF;
    color: white;
    font-size: 32px;
    line-height: 100px;
    margin: auto;
  }

  .score-label {
    color: #606266;
    margin-top: 10px;
    font-size: 14px;
  }
}

.summary-text {
  line-height: 2;
  color: #606266;

  p {
    margin: 8px 0;
  }
}

.mt-20 {
  margin-top: 20px;
}

.mb-20 {
  margin-bottom: 20px;
}
</style>
