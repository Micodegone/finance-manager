<template>
  <div class="goal-container">
    <!-- 新建目标表单 -->
    <el-card class="form-card mb-20">
      <template #header>
        <h3>新建财务目标</h3>
      </template>
      <el-form :model="form" :rules="rules" ref="formRef" label-width="100px">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="目标名称" prop="name">
              <el-input v-model="form.name" placeholder="例如：欧洲旅行基金" />
            </el-form-item>
          </el-col>
          <el-col :span="5">
            <el-form-item label="目标金额" prop="amount">
              <el-input-number v-model="form.amount" :min="0" :precision="2" controls-position="right" />
            </el-form-item>
          </el-col>
          <el-col :span="5">
            <el-form-item label="已存金额">
              <el-input-number v-model="form.storage" :min="0" :precision="2" controls-position="right" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="开始日期" prop="startdate">
              <el-date-picker v-model="form.startdate" type="date" placeholder="选择日期" value-format="YYYY-MM-DD" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="截止日期" prop="overdate">
              <el-date-picker v-model="form.overdate" type="date" placeholder="选择日期" value-format="YYYY-MM-DD" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-form-item label="优先级" prop="priority">
          <el-select v-model="form.priority">
            <el-option label="高优先级" value="高优先级" />
            <el-option label="中优先级" value="中优先级" />
            <el-option label="低优先级" value="低优先级" />
          </el-select>
        </el-form-item>

        <el-form-item>
          <el-button type="primary" @click="submitForm">创建目标</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 目标概览 -->
    <el-row :gutter="20">
      <!-- 进行中目标 -->
      <el-col :span="16">
        <el-card>
          <template #header>
            <div class="section-header">
              <span>进行中目标 ({{ activeGoals.length }})</span>
              <el-tag type="success">总进度 {{ totalProgress }}%</el-tag>
            </div>
          </template>

          <div class="goal-list">
            <el-card v-for="goal in activeGoals" :key="goal.id" class="goal-item">
              <div class="goal-header">
                <h4>{{ goal.name }}</h4>
                <el-tag :type="priorityMap[goal.priority]">
                  {{ goal.priority }}
                </el-tag>
              </div>

              <div class="goal-progress">
                <el-progress :percentage="goal.progress" :color="progressColor" :show-text="false" />
                <div class="progress-info">
                  <span>已存 ¥{{ goal.storage.toFixed(2) }}</span>
                  <span>目标 ¥{{ goal.amount.toFixed(2) }}</span>
                  <span>剩余 {{ goal.daysLeft }}天</span>
                </div>
              </div>
              <!-- 新增日期显示 -->
              <div class="date-info">
                <span>开始日期：{{ goal.startdate }}</span>
                <span>结束日期：{{ goal.overdate }}</span>
              </div>
              <div class="action-group">
                <el-button type="primary" @click="openAddStorage(goal)">
                  添加已存金额
                </el-button>
              </div>

            </el-card>
          </div>
        </el-card>
      </el-col>

      <!-- 已完成目标 -->
      <el-col :span="8">
        <el-card>
          <template #header>
            <div class="section-header">
              <span>已完成目标 ({{ completedGoals.length }})</span>
              <el-tag type="info">累计达成 {{ completedGoals.length }}个</el-tag>
            </div>
          </template>

          <el-table :data="completedGoals" stripe>
            <el-table-column prop="name" label="目标名称" />
            <el-table-column label="达成日期" width="120">
              <template #default="{ row }">{{ row.actualdate || row.overdate }}</template>
            </el-table-column>
            <el-table-column label="目标金额" width="120">
              <template #default="{ row }">¥{{ row.amount.toFixed(2) }}</template>
            </el-table-column>
            <el-table-column label="已存金额" width="120">
              <template #default="{ row }">¥{{ row.storage.toFixed(2) }}</template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-col>
    </el-row>

    <!-- 添加金额弹窗 -->
    <el-dialog v-model="storageDialogVisible" title="添加已存金额" width="400px">
      <el-form :model="storageForm">
        <el-form-item label="金额">
          <el-input-number v-model="storageForm.amount" :min="0.01" :precision="2" controls-position="right" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="storageDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="addStorage">确认</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { usePlanStore } from '@/stores/planStore'
import { ElMessage } from 'element-plus'
import popmessage from '@/views/Layout/components/Message/index'
const planStore = usePlanStore()
const formRef = ref()
const storageDialogVisible = ref(false)
const selectedGoal = ref(null)

const form = ref({
  name: '',
  amount: 0.01,
  startdate: '',
  overdate: '',
  priority: '中优先级',
  storage: 0
})

const storageForm = ref({
  amount: 0.01
})

const rules = {
  name: [{ required: true, message: '请输入目标名称', trigger: 'blur' }],
  amount: [
    { required: true, message: '请输入目标金额', trigger: 'blur' },
    { type: 'number', min: 0.01, message: '金额必须大于0', trigger: 'blur' }
  ],
  startdate: [{ required: true, message: '请选择开始日期', trigger: 'change' }],
  overdate: [{ required: true, message: '请选择截止日期', trigger: 'change' }],
  priority: [{ required: true, message: '请选择优先级', trigger: 'change' }]
}

const priorityMap = {
  '高优先级': 'danger',
  '中优先级': 'warning',
  '低优先级': 'success'
}

// 计算属性
const activeGoals = computed(() => {
  return planStore.planInfo.filter(goal =>
    goal.storage < goal.amount
  ).map(goal => ({
    ...goal,
    progress: Math.min((goal.storage / goal.amount) * 100, 100),
    daysLeft: Math.ceil(
      (new Date(goal.overdate) - new Date()) / (1000 * 60 * 60 * 24))
  }))
})

const completedGoals = computed(() => {
  return planStore.planInfo.filter(goal =>
    goal.storage >= goal.amount
  )
})

const totalProgress = computed(() => {
  const total = activeGoals.value.reduce((sum, goal) => sum + goal.amount, 0)
  const saved = activeGoals.value.reduce((sum, goal) => sum + goal.storage, 0)
  return total > 0 ? ((saved / total) * 100).toFixed(2) : 0
})

// 生命周期
onMounted(async () => {
  await planStore.getPlanInfo()
})

// 表单提交
const submitForm = async () => {
  try {
    await formRef.value.validate()

    const formData = {
      name: form.value.name,
      amount: form.value.amount,
      startdate: form.value.startdate,
      overdate: form.value.overdate,
      priority: form.value.priority,
      storage: form.value.storage || 0
    }

    await planStore.addData(formData)
    popmessage({ type: "success", str: "创建成功" })
    formRef.value.resetFields()
    form.value = {
      name: '',
      amount: 0.01,
      update: '',
      overdate: '',
      priority: '中优先级',
      storage: 0
    }
  } catch (error) {
    ElMessage.error(error.message)
  }
}

// 添加金额
const openAddStorage = (goal) => {
  selectedGoal.value = goal
  storageForm.value.amount = 0.01
  storageDialogVisible.value = true
}

const addStorage = async () => {
  try {
    if (!selectedGoal.value) return
    await planStore.updateStorage({
      id: selectedGoal.value.id,
      storage: storageForm.value.amount
    })
    storageDialogVisible.value = false
    popmessage({ type: "success", str: "添加成功" })
  } catch (error) {
    console.error(error.message)
  } finally {
    storageDialogVisible.value = false
  }
}
</script>

<style scoped>
/* 新增日期样式 */
.date-info {
  display: flex;
  justify-content: space-between;
  color: #909399;
  font-size: 12px;
  margin-top: 8px;
}

/* 保持原有样式不变 */
.goal-container {
  padding: 20px;
  background-color: #f5f7fa;
  min-height: 100vh;
}

.form-card {
  :deep(.el-card__body) {
    padding-top: 10px;
  }
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.goal-list {
  display: grid;
  gap: 16px;
}

.goal-item {
  margin-bottom: 16px;

  .goal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
  }

  .goal-progress {
    margin: 16px 0;

    .progress-info {
      display: flex;
      justify-content: space-between;
      color: #606266;
      font-size: 14px;
      margin-top: 8px;
    }
  }

  .action-group {
    margin-top: 16px;
    text-align: right;
  }
}

.mb-20 {
  margin-bottom: 20px;
}
</style>
