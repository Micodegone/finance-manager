<template>
  <div class="income-container">
    <el-row :gutter="20">
      <!-- 饼图卡片 -->
      <el-col :xs="24" :sm="24" :md="12" :lg="10">
        <el-card class="chart-card" shadow="hover">
          <template #header>
            <div class="card-header">
              <span>转账人员占比</span>
            </div>
          </template>
          <div ref="pieChart" style="height: 63vh"></div>
        </el-card>
      </el-col>

      <!-- 数据列表卡片 -->
      <el-col :xs="24" :sm="24" :md="12" :lg="14">
        <el-card class="list-card" shadow="hover">
          <template #header>
            <div class="card-header">
              <span>转账明细</span>
              <el-button size="small" @click="refreshData" tabindex="-1">刷新数据</el-button>
              <el-button >添加收入</el-button>
            </div>
          </template>

          <!-- 加载状态 -->
          <div v-if="loading" class="loading-container">
            <el-icon class="loading-icon">
              <Loading />
            </el-icon>
            数据加载中...
          </div>

          <el-table v-else :data="tableData" stripe style="width: 100%;height: 56vh;">
            <el-table-column prop="date" label="日期" :min-width="100" sortable />

            <el-table-column prop="category" label="转账对象" :min-width="100">
              <template #default="{ row }">
                <el-tag effect="plain">{{ row.category }}</el-tag>
              </template>
            </el-table-column>

            <el-table-column prop="amount" label="金额" :min-width="100">
              <template #default="{ row }">
                <span style="color: #67C23A">¥ {{ formatAmount(row.amount) }}</span>
              </template>
            </el-table-column>

            <el-table-column prop="illustrate" label="转账备注" :min-width="140">
              <template #default="{ row }">
                <span>
                  {{ row.illustrate }}
                </span>
              </template>
            </el-table-column>
          </el-table>

          <div class="pagination-container">
            <el-pagination background layout="prev, pager, next" :total="total" :page-size="pageSize"
              @current-change="handlePageChange" />
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { storeToRefs } from 'pinia'
import { useTransforStore } from '@/stores/transforStore'
import { ElMessage } from 'element-plus'
import { Loading } from '@element-plus/icons-vue'
import { totalListData } from './pie_list/listData'
import { totalPieChart } from './pie_list/pieData'

const transforStore = useTransforStore()
const { transforInfo } = storeToRefs(transforStore)

// 加载状态
const loading = ref(false)


//初始化图表
const pieChart = ref(null)
const useTotalPieChart = totalPieChart(transforInfo, pieChart)
const { initPieChart, updatePieChart, handleResize, destroyChart } = useTotalPieChart


//列表数据显示
const useTotalListData = totalListData(transforInfo)
const { total, tableData, formatAmount, handlePageChange } = useTotalListData

// 刷新数据
const refreshData = async () => {
  try {
    loading.value = true
    await transforStore.getTransforInfo()
    updatePieChart()
  }
  finally {
    loading.value = false

  }
}
// 生命周期
onMounted(async () => {
  try {
    loading.value = true
    await transforStore.getTransforInfo()
    initPieChart()
    window.addEventListener('resize', handleResize)
  } catch (error) {
    ElMessage.error(`初始化失败: ${error.message}`)
  } finally {
    loading.value = false
  }
})

onBeforeUnmount(() => {
  destroyChart()
})
</script>

<style scoped>
.income-container {
  padding: 20px;
}

.list-card {
  margin-bottom: 10px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  font-size: 16px;
  font-weight: 600;
  color: #303133;
}

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: #606266;
}

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: center;
}

@keyframes rotating {
  from {
    transform: rotate(0deg);
  }

  to {
    transform: rotate(360deg);
  }
}

/* 调整表格行高 */
.el-table :deep(.el-table__row) {
  height: 56px;
}

/* 优化移动端显示 */
@media (max-width: 768px) {
  .el-col {
    margin-bottom: 16px;
  }

  .chart-card,
  .list-card {
    margin-bottom: 0;
  }

  .card-header {
    flex-direction: column;
    gap: 8px;
  }
}
</style>
