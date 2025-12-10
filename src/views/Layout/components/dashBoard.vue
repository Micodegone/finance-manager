<template>
  <div class="dashboard-container">
    <!-- 核心指标卡片 -->
    <div class="grid-container">
      <div class="grid-item card">
        <h3>本月收支({{ currentMonth }}月)</h3>
        <div class="metrics">
          <div class="metric-item">
            <span class="label">收入</span>
            <span class="value positive">¥ {{ formatAmount(currentMonthIncome) }}</span>
          </div>
          <div class="metric-item">
            <span class="label">支出</span>
            <span class="value negative">¥ {{ formatAmount(currentMonthExpense) }}</span>
          </div>
        </div>
      </div>

      <div class="grid-item card">
        <h3>预算进度</h3>

        <template v-if="hasCurrentMonthBudget">
          <el-progress :percentage="validBudgetProgress" :stroke-width="16" :status="budgetStatus"
            :striped="isOverBudget" />
          <div class="budget-detail">
            <span>总预算 ¥{{ formatAmount(currentMonthBudget) }}</span>
            <span style="margin-left: 20px;">已用 ¥{{ formatAmount(currentMonthExpense) }}</span>
          </div>

          <!-- 超支提示容器 -->
          <div v-if="isOverBudget" class="over-budget-alert">
            <el-alert title="预算超支警告" type="error" :closable="false" show-icon>
              <template #default>
                已超支 ¥{{ formatAmount(overBudgetAmount) }} ({{ overBudgetPercentage }}%)
              </template>
            </el-alert>
          </div>
        </template>

        <!-- 无当月预算时的提示 -->
        <div v-else class="no-budget-alert">
          <p>暂未设置本月预算</p>
          <el-button type="primary" @click="showAddBudgetDialog" :loading="addingBudget">
            添加本月预算
          </el-button>
        </div>
      </div>

      <!-- 添加预算对话框 -->
      <el-dialog v-model="showBudgetDialog" title="添加本月预算" width="400px">
        <el-form :model="newBudget" :rules="budgetRules" ref="budgetForm">
          <el-form-item label="预算月份" prop="date">
            <el-input v-model="currentBudgetMonth" disabled placeholder="自动获取当前月份" />
          </el-form-item>

          <el-form-item label="预算金额" prop="amount">
            <el-input-number v-model="newBudget.amount" :min="0" :precision="2" :step="100" controls-position="right"
              placeholder="请输入预算金额" style="width: 100%" />
          </el-form-item>
        </el-form>

        <template #footer>
          <el-button @click="showBudgetDialog = false">取消</el-button>
          <el-button type="primary" @click="submitBudget" :loading="addingBudget">
            确认添加
          </el-button>
        </template>
      </el-dialog>

      <div class="grid-item card">
        <h3>净资产</h3>
        <div class="net-worth">
          <span class="value">¥ {{ formatAmount(netWorth) }}</span>
        </div>
      </div>
    </div>

    <div class="dashboard-container">
      <div class="grid-container">
        <!-- 收支趋势图表 -->
        <div class="grid-item card chart-card">
          <h3>收支趋势</h3>
          <div class="chart-box">
            <div ref="lineChart" class="chart-container"></div>
          </div>
        </div>

        <!-- 消费分类图表 -->
        <div class="grid-item card chart-card">
          <h3>消费分类</h3>
          <div class="chart-box">
            <div ref="pieChart" class="chart-container"></div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, watch, computed } from 'vue'
import * as echarts from 'echarts'
import { storeToRefs } from 'pinia'
import { useExpenseStore } from '@/stores/expenseStore'
import { useIncomeStore } from '@/stores/incomeStore'
import { useBudgetStore } from '@/stores/budgetStore'
import { bar } from './dashboard_funtion/progressBar'
import { amountDataDispose } from './dashboard_funtion/amountData'
import popmessage from '@/views/Layout/components/Message/index.js'
const budgetStore = useBudgetStore()
const expenseStore = useExpenseStore()
const incomeStore = useIncomeStore()

// 获取数据
const { expenseInfo } = storeToRefs(expenseStore)
const { incomeInfo } = storeToRefs(incomeStore)
const { budgetInfo } = storeToRefs(budgetStore)

//获取收入支出处理数据
const totalAmountDispose = amountDataDispose(incomeInfo, expenseInfo)
const { currentMonthIncome, currentMonthExpense, netWorth, expenseCategories, lineChartData, currentMonth } = totalAmountDispose
const { formatAmount } = totalAmountDispose


// 对话框状态
const showBudgetDialog = ref(false)
const addingBudget = ref(false)
const budgetForm = ref(null)

// 新预算数据
const newBudget = ref({
  date: currentMonth,
  amount: null
})
// 获取当前年月
const currentBudgetMonth = ref(getCurrentMonthString())

function getCurrentMonthString() {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  return `${year}-${month}`
}
// 计算当前月预算
const currentMonthBudget = computed(() => {
  const budget = budgetInfo.value.find(
    item => item.date === currentBudgetMonth.value
  )
  return budget ? Number(budget.amount) : 0
})

// 判断是否存在当月预算
const hasCurrentMonthBudget = computed(() => currentMonthBudget.value > 0)
// 显示添加对话框
const showAddBudgetDialog = () => {
  newBudget.value = { date: currentBudgetMonth.value, amount: null }
  showBudgetDialog.value = true
}
// 表单验证规则
const budgetRules = {
  amount: [
    { required: true, message: '请输入预算金额', trigger: 'blur' },
    {
      validator: (_, value, callback) => {
        if (value <= 0) {
          callback(new Error('金额必须大于0'))
        } else {
          callback()
        }
      },
      trigger: 'blur'
    }
  ]
}
// 提交预算
const submitBudget = async () => {
  try {
    await budgetForm.value.validate()
    addingBudget.value = true

    await budgetStore.addData({
      date: currentBudgetMonth.value,
      amount: Number(newBudget.value.amount)
    })
    popmessage({ type: "success", str: "添加成功" })
    showBudgetDialog.value = false
    await budgetStore.getBudgetInfo() // 刷新预算数据
  } catch (error) {
    popmessage({ type: "danger", str: "添加失败" })
    console.error('添加预算失败:', error)
  } finally {
    addingBudget.value = false
  }
}
// 图表实例
const lineChart = ref(null)
const pieChart = ref(null)
let lineChartInstance = null
let pieChartInstance = null

// 初始化折线图
const initLineChart = () => {
  lineChartInstance = echarts.init(lineChart.value)
  const option = {
    tooltip: {
      trigger: 'axis',
      formatter: params =>
        `
        <div style="padding: 5px 10px;">
          <div>日期：${params?.[0]?.axisValue}</div>
          <div style="
            display: flex;
            align-items: center;
            margin: 4px 0;
          ">
            <span style="
              display: inline-block;
              width: 12px;
              height: 12px;
              background: ${params[0]?.color || '#67c23a'};
              border-radius: 2px;
              margin-right: 8px;
            "></span>
            <span style="color: var(--text-color)">
              收入：<span style="font-weight:500">¥${(params[0]?.data || 0).toFixed(2)}</span>
            </span>
          </div>
          <div style="
            display: flex;
            align-items: center;
            margin: 4px 0;
          ">
            <span style="
              display: inline-block;
              width: 12px;
              height: 12px;
              background: ${params[1]?.color || '#f56c6c'};
              border-radius: 2px;
              margin-right: 8px;
            ""></span>
            <span style="color: var(--text-color)">
              支出：<span style="font-weight:500">¥${(params[1]?.data || 0).toFixed(2)}</span>
            </span>
          </div>
        </div>
      `
    },
    legend: {
      data: ['收入', '支出'],
      textStyle: {
        color: 'var(--text-color)',
      },
      bottom: 10
    },
    grid: {
      top: 50,
      bottom: 40,
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: lineChartData.value.days,
      axisLabel: { color: 'var(--text-color)', rotate: 45 }
    },
    yAxis: {
      type: 'value',
      axisLabel: {
        color: 'var(--text-color)',
        formatter: '¥{value}'
      }
    },
    series: [
      {
        name: '收入',
        type: 'line',
        smooth: true,
        data: lineChartData.value.income,
        itemStyle: { color: '#67c23a' },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(103,194,58,0.6)' },
            { offset: 1, color: 'rgba(103,194,58,0.1)' }
          ])
        }
      },
      {
        name: '支出',
        type: 'line',
        smooth: true,
        data: lineChartData.value.expense,
        itemStyle: { color: '#f56c6c' },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(245,108,108,0.6)' },
            { offset: 1, color: 'rgba(245,108,108,0.1)' }
          ])
        }
      }
    ]
  }
  lineChartInstance.setOption(option)
}

// 初始化饼图
const initPieChart = () => {
  pieChartInstance = echarts.init(pieChart.value)
  const data = Object.entries(expenseCategories.value).map(([name, value]) => ({
    name,
    value
  }))

  const option = {
    tooltip: {
      trigger: 'item',
      formatter: params => `
        <div style="padding: 5px 10px;">
          <div>类别：${params.name}</div>
          <div>金额：¥${params.value.toFixed(2)}</div>
          <div>占比：${params.percent}%</div>
        </div>
      `
    },
    legend: {
      orient: 'horizontal',
      top: 10,
      type: 'scroll',
      textStyle: {
        color: '#606266'
      }
    },
    series: [{
      type: 'pie',
      radius: ['40%', '70%'],
      avoidLabelOverlap: false,
      itemStyle: {
        borderRadius: 10,
        borderColor: 'var(--card-bg)',
        borderWidth: 2
      },
      label: {
        show: true,
        color: 'var(--text-color)',
        formatter: '{b}: {d}%'
      },
      data
    }]
  }
  pieChartInstance.setOption(option)
}

//进度条展示效果
const dashboardBar = bar(currentMonthExpense, currentMonthBudget)
const { validBudgetProgress, isOverBudget, budgetStatus, overBudgetPercentage, overBudgetAmount } = dashboardBar

// 响应式调整
const handleResize = () => {
  lineChartInstance?.resize()
  pieChartInstance?.resize()
}

// 数据监控
watch([expenseInfo, incomeInfo], () => {
  lineChartInstance?.dispose()
  pieChartInstance?.dispose()
  initLineChart()
  initPieChart()
})

onMounted(async () => {
  await Promise.all([
    expenseStore.getExpenseInfo(),
    incomeStore.getIncomeInfo(),
    budgetStore.getBudgetInfo()
  ])
  initLineChart()
  initPieChart()
  window.addEventListener('resize', handleResize)
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', handleResize)
  lineChartInstance?.dispose()
  pieChartInstance?.dispose()
})
</script>

<style scoped>
.dashboard-container {
  padding: 20px;
  transition: background 0.3s, color 0.3s;
}

/* 主题样式 */
.dark {
  --bg-color: #1a1a1a;
  --text-color: #ffffff;
  --card-bg: #2d2d2d;
}

.light {
  --bg-color: #f5f7fa;
  --text-color: #303133;
  --card-bg: #ffffff;
}

.control-bar {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-bottom: 20px;
}

.grid-container {
  display: grid;
  gap: 20px;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  margin-bottom: 30px;
}

.card {
  background: var(--card-bg);
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  color: var(--text-color);
}

.metrics {
  margin: 15px 0;
}

.metric-item {
  display: flex;
  justify-content: space-between;
  margin: 10px 0;
}

.value {
  font-size: 1.2em;
  font-weight: bold;
}

.positive {
  color: #67c23a;
}

.negative {
  color: #f56c6c;
}

.budget-detail {
  display: flex;
  justify-content: space-between;
  margin-top: 10px;
  font-size: 0.9em;
}

.net-worth {
  text-align: center;
  padding: 20px 0;
}

.net-worth .value {
  font-size: 2em;
  display: block;
  margin: 10px 0;
}

.chart-box {
  margin-top: 15px;
  height: calc(100% - 40px);
  /* 留出标题空间 */
}

.chart-container {
  width: 100%;
  height: 100%;
  min-height: 300px;
}


.chart-group {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.chart-card {
  background: var(--card-bg);
  color: var(--text-color);
  border-radius: 12px;
  padding: 20px;
  height: 400px;
}


.chart-placeholder {
  height: calc(100% - 40px);
  background: rgba(0, 0, 0, 0.05);
  border-radius: 8px;
  margin-top: 20px;
}

.quick-actions {
  position: fixed;
  right: 30px;
  bottom: 30px;
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.floating-btn {
  width: 56px;
  height: 56px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.net-worth .value {
  font-size: 2em;
  display: block;
  margin: 10px 0;
}

.dashboard-container {
  padding: 20px;
  transition: background 0.3s, color 0.3s;
}

.budget-detail {
  margin-top: 12px;
  display: flex;
  justify-content: space-between;
  font-size: 0.9em;
  color: var(--el-text-color-secondary);
}

/* 超支提示容器 */
.over-budget-alert {
  margin-top: 16px;
}

/* 自定义进度条颜色 */
:deep(.el-progress-bar__inner) {
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

/* 超支状态样式 */
:deep(.el-progress-bar__inner.exception) {
  background-color: #f56c6c;
}

/* 正常状态样式 */
:deep(.el-progress-bar__inner.success) {
  background-color: #67c23a;
}

@media (max-width: 768px) {
  .grid-container {
    grid-template-columns: 1fr;
  }

  .chart-container {
    min-height: 250px;
  }
}
</style>
