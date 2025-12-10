<template>
  <div class="income-container">
    <el-row :gutter="20">
      <!-- 饼图卡片 -->
      <el-col :xs="24" :sm="24" :md="12" :lg="8">
        <el-card class="chart-card" shadow="hover">
          <template #header>
            <div class="card-header">
              <span>收入类别分布</span>
            </div>
          </template>
          <div ref="pieChart" style="height: 63vh"></div>
        </el-card>
      </el-col>

      <!-- 数据列表卡片 -->
      <el-col :xs="24" :sm="24" :md="12" :lg="16">
        <el-card class="list-card" shadow="hover">
          <template #header>
            <div class="card-header">
              <span>收入明细</span>
              <div class="search-container">
                <!-- 时间范围搜索 -->
                <el-date-picker v-model="searchParams.dateRange" type="daterange" range-separator="-"
                  start-placeholder="开始日期" end-placeholder="结束日期" value-format="YYYY-MM-DD" style="width: 240px" />

                <!-- 类别搜索 -->
                <el-select v-model="searchParams.category" clearable placeholder="选择类别" style="width: 120px">
                  <el-option v-for="item in categoryOptions" :key="item" :label="item" :value="item" />
                </el-select>

                <!-- 金额范围搜索 -->
                <div class="amount-range">
                  <el-input-number v-model="searchParams.minAmount" placeholder="最小金额" :precision="2" :min="0"
                    :controls="false" style="width: 120px" />
                  <span class="range-separator">-</span>
                  <el-input-number v-model="searchParams.maxAmount" placeholder="最大金额" :precision="2" :min="0"
                    :controls="false" style="width: 120px" />
                </div>
                <el-button @click="resetSearch">重置</el-button>
                <el-button size="small" @click="refreshData" tabindex="-1">刷新数据</el-button>
              </div>
            </div>
          </template>

          <!-- 加载状态 -->
          <div v-if="loading" class="loading-container">
            <el-icon class="loading-icon">
              <Loading />
            </el-icon>
            数据加载中...
          </div>

          <!-- 数据表格 -->
          <el-table v-else :data="tableData" stripe style="width: 100%; height: 56vh;" empty-text="暂无数据">
            <el-table-column prop="date" label="日期" :min-width="100" sortable />

            <el-table-column prop="category" label="类别" :min-width="100">
              <template #default="{ row }">
                <el-tag effect="plain">{{ row.category }}</el-tag>
              </template>
            </el-table-column>

            <el-table-column prop="amount" label="金额" :min-width="120">
              <template #default="{ row }">
                <span style="color: #67C23A">¥ {{ formatAmount(row.amount) }}</span>
              </template>
            </el-table-column>

            <el-table-column prop="voucher" label="凭证" :min-width="120">
              <template #default="{ row }">
                <el-image v-if="row.voucher" style="width: 50px; height: 50px; cursor: pointer"
                  :src="getFullImageUrl(row.voucher)" fit="cover" :preview-src-list="[getFullImageUrl(row.voucher)]"
                  :hide-on-click-modal="true" preview-teleported>
                  <template #error>
                    <div class="image-error">加载失败</div>
                  </template>
                </el-image>
                <span v-else>--</span>
              </template>
            </el-table-column>
            <el-table-column label="操作" width="150" fixed="right">
              <template #default="{ row }">
                <el-button size="small" @click="openEditDialog(row)">编辑</el-button>
                <el-button size="small" type="danger" @click="handleDelete(row.id)">删除</el-button>
              </template>
            </el-table-column>

          </el-table>

          <!-- 分页器 -->
          <div class="pagination-container">
            <el-pagination background layout="prev, pager, next" :total="total" :page-size="pageSize"
              :current-page="currentPage" @current-change="handlePageChange" />
          </div>
        </el-card>
      </el-col>
    </el-row>
    <!-- 新增编辑对话框 -->
    <el-dialog v-model="dialogVisible" title="编辑收入记录" width="500px">
      <recordForm :initial-data="currentIncome" :categories="categories.value" @submit="submitUpdate" />
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { storeToRefs } from 'pinia'
import { useIncomeStore } from '@/stores/incomeStore'
import { ElMessage } from 'element-plus'
import { Loading } from '@element-plus/icons-vue'
import { totalPieChart } from './pie_list/pieData'
import { totalListData } from './pie_list/listData'
import { getFullImageUrl } from '@/utils/imageDisplay'
import { useIncomeOperations } from '@/utils/oprations'
import recordForm from './recordForm.vue'

const { handleDelete, handleUpdate } = useIncomeOperations()
const incomeStore = useIncomeStore()
const { incomeInfo, categories } = storeToRefs(incomeStore)

const dialogVisible = ref(false)
const currentIncome = ref(null)
// 打开编辑对话框
const openEditDialog = (row) => {
  currentIncome.value = { ...row }
  dialogVisible.value = true
}
// 提交更新
const submitUpdate = async (formData) => {
  try {
    await handleUpdate(currentIncome.value.id, formData)
    dialogVisible.value = false
  } catch (error) {
    console.error('更新失败:', error)
  }
}
// 加载状态
const loading = ref(false)

//初始化图表
const pieChart = ref(null)
const useTotalPieChart = totalPieChart(incomeInfo, pieChart)
const { initPieChart, updatePieChart, handleResize, destroyChart } = useTotalPieChart

//列表数据显示
const useTotalListData = totalListData(incomeInfo)
const {
    total,
    tableData,
    currentPage,
    pageSize,
    categoryOptions,
    searchParams,
    formatAmount,
    handlePageChange } = useTotalListData

// 刷新数据
const refreshData = async () => {
  try {
    loading.value = true
    await incomeStore.getIncomeInfo()
    updatePieChart()
  }
  finally {
    loading.value = false

  }
}

const resetSearch = () => {
  searchParams.value = {
    dateRange: [],
    category: '',
    minAmount: null,
    maxAmount: null
  }
  currentPage.value = 1
}
// 生命周期
onMounted(async () => {
  try {
    loading.value = true
    await incomeStore.getIncomeInfo()
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
.search-header {
  display: flex;
  flex-direction: column;
  gap: 12px;
  width: 100%;
}

.search-container {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  align-items: center;
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

@media (max-width: 768px) {
  .search-container {
    flex-direction: column;
    align-items: stretch;

    .el-date-editor,
    .el-select,
    .amount-range {
      width: 100%;
    }
  }
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
