<template>
  <!-- 收入卡片 -->
  <el-card class="financial-card">
    <template #header>
      <div class="card-header">
        <span class="card-title">收入管理</span>
        <div class="search-container">
          <!-- 时间范围搜索 -->
          <el-date-picker v-model="searchParams.dateRange" type="daterange" range-separator="-" start-placeholder="开始日期"
            end-placeholder="结束日期" value-format="YYYY-MM-DD" />

          <!-- 类别搜索 -->
          <el-select v-model="searchParams.category" clearable placeholder="选择类别" style="width: 150px">
            <el-option v-for="item in categoryOptions" :key="item" :label="item" :value="item" />
          </el-select>

          <!-- 金额范围搜索 -->
          <div class="amount-range">
            <el-input-number v-model="searchParams.minAmount" placeholder="最小金额" :precision="2" :min="0" />
            <span class="range-separator">-</span>
            <el-input-number v-model="searchParams.maxAmount" placeholder="最大金额" :precision="2" :min="0" />
          </div>

          <el-button type="primary" @click="handleSearch">重置</el-button>
          <el-button @click="showAddDialog">添加收入</el-button>
          <el-tag type="success">本月收入 ¥{{ formatAmount(currentMonthTotal) }}</el-tag>
        </div>
      </div>
    </template>

    <!-- 内容区 -->
    <el-row :gutter="20">
      <el-col :span="12">
        <el-card>
          <template #header>
            <div>
              <el-button :type="activeButton === '15days' ? 'primary' : ''"
                @click="handleTimeRange('15days')">近15日收入</el-button>
              <el-button :type="activeButton === 'month' ? 'primary' : ''"
                @click="handleTimeRange('month')">本月收入</el-button>
            </div>
          </template>
          <div ref="echartIncome" class="barchart"></div>
        </el-card>
      </el-col>

      <el-col :span="12">
        <el-card>
          <el-table :data="sortedIncomeData" height="400" style="width: 100%;" :fit="true">
            <el-table-column prop="date" label="日期" :min-width="100">
              <template #default="{ row }">
                {{ formatDate(row.date) }}
              </template>
            </el-table-column>

            <el-table-column prop="category" label="类别" :min-width="120"></el-table-column>

            <el-table-column prop="amount" label="金额" :min-width="140">
              <template #default="{ row }">
                ¥{{ formatAmount(row.amount) }}
              </template>
            </el-table-column>

            <el-table-column prop="voucher" label="凭证" :min-width="160">
              <template #default="{ row }">
                <el-image v-if="row.voucher" style="width: 100px; height: 100px" :src="getFullImageUrl(row.voucher)"
                  fit="cover" :preview-src-list="[getFullImageUrl(row.voucher)]" :hide-on-click-modal="true"
                  preview-teleported>
                  <template #error>
                    <div class="image-error">加载失败</div>
                  </template>
                </el-image>
                <span v-else>--</span>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-col>
    </el-row>

    <!-- 添加收入对话框 -->
    <el-dialog v-model="dialogVisible" title="新增收入" width="500px">
      <el-form :model="newData" :rules="dataRules" ref="formRef" label-width="80px">
        <!-- 日期选择 -->
        <el-form-item label="日期" prop="date" required>
          <el-date-picker v-model="newData.date" @change="formRef.validateField('date')" type="datetime"
            placeholder="选择日期时间" format="YYYY-MM-DD HH:mm:ss" value-format="YYYY-MM-DD HH:mm:ss" />
        </el-form-item>

        <!-- 类别选择/输入 -->
        <el-form-item label="类别" prop="category" required>
          <el-select v-model="newData.category" @blur="formRef.validateField('category')" filterable allow-create
            placeholder="选择或输入类别">
            <el-option v-for="item in categories" :key="item" :label="item" :value="item" />
          </el-select>
        </el-form-item>

        <!-- 金额输入 -->
        <el-form-item label="金额" prop="amount" required>
          <el-input-number v-model="newData.amount" @blur="formRef.validateField('amount')" :min="0" :step="1"
            :precision="2" style="width: 100%" />
        </el-form-item>

        <!-- 凭证上传 -->
        <el-form-item label="凭证">
          <el-upload :auto-upload="false" :on-change="handleUpload" :show-file-list="false"
            accept="image/jpeg,image/png">
            <template #trigger>
              <el-button type="primary">选择文件</el-button>
            </template>
            <div v-if="newData.voucherPreview" class="preview-container">
              <el-image :src="newData.voucherPreview" class="voucher-preview" style="width: 100px; height: 100px"
                fit="cover" alt="凭证预览" />
            </div>
          </el-upload>
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="resetForm">取消</el-button>
        <el-button type="primary" @click="submitData" :loading="isSubmitting">
          提交
        </el-button>
      </template>
    </el-dialog>
  </el-card>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import * as echarts from 'echarts'
import { useIncomeStore } from '@/stores/incomeStore'
import { storeToRefs } from 'pinia'
import { dataButton } from '../finance_react/submitButton'
import { getFullImageUrl } from '@/utils/imageDisplay'

const incomeStore = useIncomeStore()
const { incomeInfo, currentMonthTotal } = storeToRefs(incomeStore)


// 图表实例
const echartIncome = ref(null)
let barChartInstance = null
const activeButton = ref('month')

// 日期处理
const currentDate = new Date()
const currentYear = currentDate.getFullYear()
const currentMonth = currentDate.getMonth() + 1

// 获取当月天数
const getMonthDays = (year, month) => {
  return new Date(year, month, 0).getDate()
}

// 获取显示天数范围
const getDisplayDays = () => {
  if (activeButton.value === 'month') {
    return getMonthDays(currentYear, currentMonth)
  }

  const today = new Date()
  const currentDay = today.getDate()
  return currentDay > 15 ? 15 : currentDay
}

// 处理时间范围切换
const handleTimeRange = (type) => {
  activeButton.value = type
  updateChart()
}

// 格式化金额
const formatAmount = (value) => {
  return Number(value || 0).toLocaleString('zh-CN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })
}

// 处理表格数据排序
const sortedIncomeData = computed(() => {
  return filteredData.value
    .filter(item => {
      const date = new Date(item.date)
      return date.getFullYear() === currentYear &&
        date.getMonth() + 1 === currentMonth
    })
    .sort((a, b) => new Date(b.date) - new Date(a.date))
})

// 图表数据生成
const generateChartData = () => {
  const days = getDisplayDays()
  const data = Array.from({ length: days }, () => 0)

  incomeInfo.value.forEach(item => {
    const date = new Date(item.date)
    if (date.getFullYear() === currentYear &&
      date.getMonth() + 1 === currentMonth) {
      const day = date.getDate()
      if (day <= days) {
        data[day - 1] += item.amount
      }
    }
  })

  return {
    days: Array.from({ length: days }, (_, i) => `${i + 1}日`),
    data: data.map(v => Number(v.toFixed(2)))
  }
}

// 更新图表
const updateChart = () => {
  const { days, data } = generateChartData()
  const option = {
    tooltip: {
      trigger: 'axis',
      formatter: (params) => {
        const value = params[0]?.data || 0
        return `${params[0]?.axisValue}<br/>收入：¥${value.toFixed(2)}`
      }
    },
    xAxis: {
      type: 'category',
      data: days,
      axisLabel: {
        color: '#606266',
        fontSize: 12
      }
    },
    yAxis: {
      type: 'value',
      axisLabel: {
        color: '#606266',
        formatter: '¥{value}',
        fontSize: 12
      }
    },
    grid: {
      containLabel: true,
      left: '3%',
      right: '3%',
      top: '10%',
      bottom: '3%'
    },
    series: [{
      name: '收入',
      type: 'bar',
      data: data,
      itemStyle: {
        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
          { offset: 0, color: '#85ce61' },
          { offset: 1, color: '#5dbe8a' }
        ]),
      },
      barWidth: '70%'
    }]
  }
  barChartInstance.setOption(option)
}

// 初始化图表
const initBarChart = () => {
  barChartInstance = echarts.init(echartIncome.value)
  updateChart()
}

// 日期格式化
const formatDate = (dateString) => {
  const date = new Date(dateString)
  return `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')} ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`
}
// 新增搜索相关代码
const searchParams = ref({
  dateRange: [],
  category: '',
  minAmount: null,
  maxAmount: null
})

// 获取所有类别选项（从store或已有数据）
const categoryOptions = computed(() => {
  return [...new Set(incomeInfo.value.map(item => item.category))]
})

// 过滤后的数据
const filteredData = computed(() => {
  return incomeInfo.value.filter(item => {
    const date = new Date(item.date)
    const amount = Number(item.amount)

    // 日期范围过滤
    if (searchParams.value.dateRange?.length === 2) {
      const start = new Date(searchParams.value.dateRange[0])
      const end = new Date(searchParams.value.dateRange[1])
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
// 搜索和重置方法
const handleSearch = () => {
  // 触发图表更新
  resetSearch()
}

const resetSearch = () => {
  searchParams.value = {
    dateRange: [],
    category: '',
    minAmount: null,
    maxAmount: null
  }
}
//添加收入按钮
const {
  categories,
  dialogVisible,
  newData,
  dataRules,
  isSubmitting,
  formRef,
  resetForm,
  handleUpload,
  submitData,
  showAddDialog } = dataButton(incomeInfo, incomeStore)
// 响应式调整
const handleResize = () => {
  barChartInstance?.resize()
}

// 生命周期
onMounted(() => {
  incomeStore.getIncomeInfo()
  initBarChart()
  window.addEventListener('resize', handleResize)
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', handleResize)
  barChartInstance?.dispose()
})
</script>

<style scoped>
/* 添加搜索样式 */
.search-container {
  display: flex;
  gap: 10px;
  align-items: center;
  margin-top: 15px;
}

.amount-range {
  display: flex;
  align-items: center;
  gap: 5px;
}

.range-separator {
  padding: 0 5px;
  color: #606266;
}

/* 调整输入框宽度 */
.el-input-number {
  width: 150px;
}

.financial-card {
  margin-bottom: 20px;
}

.barchart {
  height: 300px;
}

.image-error {
  width: 100px;
  height: 100px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f5f7fa;
  color: #909399;
}

.card-header {
  display: flex;
  align-items: center;
  gap: 20px;
}

.card-title {
  font-size: 18px;
  font-weight: bold;
}

:deep(.el-card__header) {
  padding: 12px 20px;
}

:deep(.el-card__body) {
  padding: 15px;
}
/* 响应式调整 */
@media (max-width: 768px) {
  .search-container {
    flex-wrap: wrap;
  }

  .el-date-editor {
    width: 100%;
  }
}
</style>
