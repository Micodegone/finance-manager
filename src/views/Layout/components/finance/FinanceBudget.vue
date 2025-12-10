<template>
  <el-card class="financial-card">
    <template #header>
      <div class="card-header">
        <span class="card-title">预算规划</span>
        <el-date-picker v-model="timeRange" type="monthrange" range-separator="至" start-placeholder="开始月份"
          end-placeholder="结束月份" value-format="YYYY-MM" @change="handleTimeChange" />
        <el-tag type="warning">剩余预算 ¥{{ currentRemaining }}</el-tag>
      </div>
    </template>

    <el-row :gutter="20">
      <el-col :span="12">
        <el-card>
          <div ref="echartBudget" class="barchart"></div>
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card class="table-card">
          <el-table :data="processedData" height="400" style="width: 100%" v-loading="loading">
            <el-table-column prop="month" label="月份" width="120" />
            <el-table-column prop="budget" label="预算金额" width="120">
              <template #default="{ row }">¥{{ row.budget }}</template>
            </el-table-column>
            <el-table-column prop="expense" label="支出金额" width="120">
              <template #default="{ row }">¥{{ row.expense }}</template>
            </el-table-column>
            <el-table-column prop="overspend" label="超支金额">
              <template #default="{ row }">
                <el-tag :type="row.overspend > 0 ? 'danger' : 'success'">
                  ¥{{ row.overspend }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="remaining" label="剩余金额">
              <template #default="{ row }">
                <el-tag :type="row.remaining < 0 ? 'danger' : 'success'">
                  ¥{{ row.remaining }}
                </el-tag>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-col>
    </el-row>
  </el-card>
</template>

<!-- <script setup>
import { ref, computed, onBeforeUnmount, onMounted } from 'vue'
import * as echarts from 'echarts'
import { useExpenseStore } from '@/stores/expenseStore'
import { useBudgetStore } from '@/stores/budgetStore'
import { storeToRefs } from 'pinia'

//获取全部的支出数据和预算数据
const budgetStore = useBudgetStore()
const expenseStore = useExpenseStore()
const {budgetInfo} = storeToRefs(budgetStore)
const {expenseInfo} = storeToRefs(expenseStore)
console.log(budgetInfo)
console.log(expenseInfo)
//解构赋值info数据,该数据是一个数组
/**为以下形式
 * [
        {
            "id": 1,
            "amount": 4758.00,
            "date": "2025-12"
        },
        {
            "id": 2,
            "amount": 2473.00,
            "date": "2021-10"
        },
  ]
 */
// const {budgetInfo} = storeToRefs(budgetStore)
// const {expenseInfo} = storeToRefs(expenseStore)

/**
 * 根据得到的数据进行计算每月预算使用情况
 * 需要使用element-puls组件设计一个日期选择器用于范围年月选择
 * 柱状图根据时间范围显示预算使用情况
 * 柱状图显示为预算金额和支出金额两条柱状条进行对比
 * 在时间范围中如果有月份只有一个数据或没有数据,则另一条柱状条不显示,都没有则都为零
 *
*/

/**
 * 这里计算所有数据的情况用于显示列表数据
 * 合并支出和预算日期,用于显示预算使用情况
 * 只显示有数据的日期,如果某年某月只有支出,则预算为零,不计算是否超支,即该行数据只显示支出金额,不显示其他内容;如果某年某月只有预算,没有支出,则支出为零,正常计算预算使用情况
 * 若某年某月同时具有支出和预算数据,则正常计算预算使用情况;若
 */
onMounted(()=>{
  budgetStore.getBudgetInfo()
})
</script> -->
<script setup>
import { ref, computed, onBeforeUnmount, onMounted, watch } from 'vue'
import * as echarts from 'echarts'
import { useExpenseStore } from '@/stores/expenseStore'
import { useBudgetStore } from '@/stores/budgetStore'
import { storeToRefs } from 'pinia'

// 定义响应式变量
const timeRange = ref([])  // 用于存储筛选的时间范围
const echartBudget = ref(null)  // 用于存储echarts实例
let chartInstance = null  // echarts图表实例
const loading = ref(false)  // 控制加载状态

// 使用预算和支出的store
const budgetStore = useBudgetStore()  // 获取预算store
const expenseStore = useExpenseStore()  // 获取支出store

// 通过storeToRefs获取预算和支出信息
const { budgetInfo } = storeToRefs(budgetStore)  // 预算信息
const { expenseInfo } = storeToRefs(expenseStore)  // 支出信息

// 合并预算和支出数据的计算属性
const mergedData = computed(() => {
  // 使用Map来存储每个月的预算和支出总额
  const budgetMap = new Map()
  budgetInfo.value.forEach(item => {
    const month = item.date  // 获取预算的月份
    // 如果已有该月的预算数据，则累加，否则设置为当前的预算金额
    budgetMap.set(month, (budgetMap.get(month) || 0) + item.amount)
  })

  const expenseMap = new Map()
  expenseInfo.value.forEach(item => {
    const date = new Date(item.date)  // 将支出的日期转为Date对象
    const month = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`  // 获取支出的月份
    // 如果已有该月的支出数据，则累加，否则设置为当前的支出金额
    expenseMap.set(month, (expenseMap.get(month) || 0) + item.amount)
  })

  // 合并预算和支出数据的所有月份
  const allMonths = new Set([...budgetMap.keys(), ...expenseMap.keys()])

  // 返回包含月份、预算、支出、超支和剩余预算的对象，并按月份排序
  return Array.from(allMonths)
    .map(month => {
      const budget = budgetMap.get(month) || 0  // 获取该月的预算金额
      const expense = expenseMap.get(month) || 0  // 获取该月的支出金额
      return {
        month,  // 月份
        budget,  // 预算金额
        expense,  // 支出金额
        overspend: expense - budget,  // 超支金额
        remaining: budget - expense  // 剩余预算金额
      }
    })
    .sort((a, b) => a.month.localeCompare(b.month))  // 按月份排序
})

// 计算处理过的筛选数据，根据时间范围过滤数据
const processedData = computed(() => {
  if (!timeRange.value || timeRange.value.length !== 2) return mergedData.value  // 如果没有时间范围或时间范围无效，返回合并后的数据
  const [start, end] = timeRange.value  // 获取开始和结束月份
  // 根据时间范围过滤数据
  return mergedData.value.filter(item =>
    item.month >= start && item.month <= end
  )
})

// 计算当前剩余预算的总和
const currentRemaining = computed(() =>
  processedData.value.reduce((sum, item) => sum + item.remaining, 0)  // 累加所有处理后的数据的剩余预算
)

// 初始化图表的方法
function initChart() {
  if (!echartBudget.value) return  // 如果没有获取到图表容器，直接返回
  chartInstance = echarts.init(echartBudget.value)  // 初始化echarts实例
  updateChart()  // 更新图表数据
}

// 更新图表数据的方法
function updateChart() {
  if (!chartInstance) return  // 如果没有echarts实例，直接返回

  // 图表的配置项
  const option = {
    tooltip: {
      trigger: 'axis',  // 触发类型为坐标轴
      axisPointer: { type: 'shadow' }  // 使用阴影指示器
    },
    legend: {
      data: ['预算金额', '支出金额']  // 图例显示内容
    },
    xAxis: {
      type: 'category',  // x轴为类目轴
      data: processedData.value.map(item => item.month)  // x轴数据为月份
    },
    yAxis: {
      type: 'value'  // y轴为数值轴
    },
    series: [
      {
        name: '预算金额',  // 系列名称
        type: 'bar',  // 图表类型为柱状图
        data: processedData.value.map(item => item.budget),  // 数据为每个月的预算金额
        itemStyle: {
          // 渐变绿色
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: '#85ce61' },  // 起始颜色
            { offset: 1, color: '#5dbe8a' }  // 结束颜色
          ])
        },
        barGap: '0%',  // 设置柱状图之间的间隔为0（让预算和支出紧贴）
        barCategoryGap: '30%'  // 不同月份的柱状图之间保持适当间隙
      },
      {
        name: '支出金额',  // 系列名称
        type: 'bar',  // 图表类型为柱状图
        data: processedData.value.map(item => item.expense),  // 数据为每个月的支出金额
        itemStyle: {
          // 渐变红色
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: '#FF6344' },  // 起始颜色
            { offset: 1, color: '#A21235' }  // 结束颜色
          ])
        },
        barGap: '0%',  // 设置柱状图之间的间隔为0（让预算和支出紧贴）
        barCategoryGap: '30%'  // 不同月份的柱状图之间保持适当间隙
      }
    ]
  }

  chartInstance.setOption(option)  // 设置图表配置项
}



// 窗口resize处理
const handleResize = () => chartInstance?.resize()

onMounted(async () => {
  loading.value = true
  try {
    await Promise.all([
      budgetStore.getBudgetInfo(),
      expenseStore.getExpenseInfo()
    ])
    initChart()
    window.addEventListener('resize', handleResize)
  } catch (error) {
    console.error('数据加载失败:', error)
  } finally {
    loading.value = false
  }
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', handleResize)
  chartInstance?.dispose()
})

// 监听数据变化
watch([budgetInfo, expenseInfo], () => {
  updateChart()
})

// 监听时间范围变化
watch(timeRange, () => {
  updateChart()
})
</script>
<style scoped>
.financial-card {
  margin-bottom: 20px;
}

.barchart {
  height: 400px;
}

.table-card {
  height: 460px;
  overflow-y: auto;
}

.card-header {
  display: flex;
  align-items: center;
  gap: 20px;
}
</style>
