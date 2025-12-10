<template>
  <div class="reimburse-container">
    <!-- 新建报销表单 -->
    <el-card class="action-card mb-20">
      <div class="action-header">
        <h3>新建报销申请</h3>
        <el-button type="primary" @click="submitForm">提交申请</el-button>
      </div>

      <el-form :model="form" :rules="rules" ref="formRef" label-width="100px">
        <el-row :gutter="20">
          <el-col :span="8">
            <el-form-item label="报销日期" prop="date">
              <el-date-picker v-model="form.date" type="date" placeholder="选择日期" value-format="YYYY-MM-DD"
                :disabled-date="disabledDate" />
            </el-form-item>
          </el-col>

          <el-col :span="8">
            <el-form-item label="报销类别" prop="category">
              <el-select v-model="form.category" placeholder="请选择类别">
                <el-option label="交通费用" value="交通费用" />
                <el-option label="餐饮费用" value="餐饮费用" />
                <el-option label="办公用品" value="办公用品" />
                <el-option label="差旅费用" value="差旅费用" />
              </el-select>
            </el-form-item>
          </el-col>

          <el-col :span="8">
            <el-form-item label="报销金额" prop="amount">
              <el-input-number v-model="form.amount" :precision="2" :min="0.01" controls-position="right"
                placeholder="请输入金额" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-form-item label="费用说明" prop="illustrate">
          <el-input v-model="form.illustrate" type="textarea" :rows="3" placeholder="请输入费用详细说明" />
        </el-form-item>

        <el-form-item label="上传凭证" prop="img">
          <el-upload v-model:file-list="fileList" action="#" list-type="picture-card" :auto-upload="false"
            :on-change="handleFileChange" :on-remove="handleFileRemove">
            <el-icon>
              <Plus />
            </el-icon>
          </el-upload>
          <div class="el-upload__tip">支持JPG/PNG格式，大小不超过5MB</div>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 历史记录表格 -->
    <el-card>
      <template #header>
        <div class="record-header">
          <span>历史报销记录</span>
          <div class="filter-group">
            <el-select v-model="filterCategory" placeholder="所有类别" clearable style="width: 120px; margin-right: 10px;">
              <el-option label="交通费用" value="交通费用" />
              <el-option label="餐饮费用" value="餐饮费用" />
              <el-option label="办公用品" value="办公用品" />
              <el-option label="差旅费用" value="差旅费用" />
            </el-select>
            <el-date-picker v-model="filterDate" type="month" placeholder="选择月份" value-format="YYYY-MM" clearable />
          </div>
        </div>
      </template>

      <el-table :data="paginatedData" stripe>
        <el-table-column prop="date" label="日期" min-width="120" />
        <el-table-column prop="category" label="类别" min-width="120">
          <template #default="{ row }">
            {{ row.category }}
          </template>
        </el-table-column>
        <el-table-column label="金额" min-width="120">
          <template #default="{ row }">
            <span style="color: #67C23A">¥ {{ formatAmount(row.amount) }}</span>
          </template>
        </el-table-column>
        <el-table-column label="操作" min-width="150">
          <template #default="{ row }">
            <el-button type="primary" link @click="viewDetail(row)">查看</el-button>
            <!-- <el-button type="danger" link>删除</el-button> -->
          </template>
        </el-table-column>
      </el-table>

      <el-pagination class="mt-20" background layout="prev, pager, next, total" :total="filteredData.length"
        :page-size="pageSize" v-model:current-page="currentPage" />
    </el-card>

    <!-- 详情弹窗 -->
    <el-dialog v-model="dialogVisible" title="报销详情" width="600px">
      <el-descriptions :column="1" border>
        <el-descriptions-item label="报销日期">{{ detailData.date }}</el-descriptions-item>
        <el-descriptions-item label="报销类别">{{ detailData.category }}</el-descriptions-item>
        <el-descriptions-item label="报销金额">¥ {{ formatAmount(detailData.amount) }}</el-descriptions-item>
        <el-descriptions-item label="费用说明" :span="2">{{ detailData.illustrate }}</el-descriptions-item>
        <el-descriptions-item label="凭证照片" :span="2">
          <el-image :src="getFullImageUrl(detailData.img)" style="max-width: 300px; max-height: 300px;" />
        </el-descriptions-item>
      </el-descriptions>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, nextTick } from 'vue'
import { Plus } from '@element-plus/icons-vue'
import { useRbsStore } from '@/stores/rbsStore'
import { getFullImageUrl } from '@/utils/imageDisplay'

const rbsStore = useRbsStore()
const formRef = ref(null)
const fileList = ref([])
const dialogVisible = ref(false)
const detailData = ref({})

// 分页相关
const currentPage = ref(1)
const pageSize = ref(5)

// 筛选条件
const filterDate = ref('')
const filterCategory = ref('')

// 表单数据
const form = ref({
  date: '',
  category: '',
  amount: 0,
  illustrate: '',
  img: null
})


// 表单验证规则
const rules = {
  date: [
    { required: true, message: '请选择报销日期', trigger: 'change' },
    {
      validator: (_, value, callback) => {
        const selectedDate = new Date(value);
        const currentDate = new Date();

        // 将日期归零，只保留年月日
        selectedDate.setHours(0, 0, 0, 0);
        currentDate.setHours(0, 0, 0, 0);

        if (selectedDate > currentDate) {
          callback(new Error('日期不能超过今天'))
        } else {
          callback()
        }
      }, trigger: 'change'
    }
  ],
  category: [
    { required: true, message: '请选择报销类别', trigger: 'change' }
  ],
  amount: [
    { required: true, message: '请输入报销金额', trigger: 'blur' },
    { type: 'number', min: 0.01, message: '金额必须大于0', trigger: 'blur' }
  ],
  illustrate: [
    { required: true, message: '请输入费用说明', trigger: 'blur' }
  ],
  img: [
    {
      required: true,
      validator: (_, __, callback) => {
        if (!form.value.img) {
          callback(new Error('请上传凭证照片'))
        } else {
          callback()
        }
      }, trigger: 'change'
    }
  ]
}

// 计算属性：排序和筛选后的数据
const filteredData = computed(() => {
  return rbsStore.rbsInfo
    .filter(item => {
      const dateMatch = filterDate.value ?
        item.date.startsWith(filterDate.value) : true
      const categoryMatch = filterCategory.value ?
        item.category === filterCategory.value : true
      return dateMatch && categoryMatch
    })
    .sort((a, b) => new Date(b.date) - new Date(a.date))
})

// 分页数据
const paginatedData = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  return filteredData.value.slice(start, start + pageSize.value)
})

// 初始化加载数据
onMounted(async () => {
  await rbsStore.getRbsInfo()
})

// 日期禁用函数
const disabledDate = (date) => {
  return date > new Date()
}
// 格式化金额
const formatAmount = (value) => {
  return Number(value || 0).toLocaleString('zh-CN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })
}

// 文件处理
const handleFileChange = (file) => {
  form.value.img = file.raw
}

const handleFileRemove = () => {
  form.value.img = null
}

// 提交表单
const submitForm = async () => {
  try {
    const formEl = formRef.value
    if (!formEl) return

    // 1. 保存表单数据副本
    const formCopy = { ...form.value }
    //2.  验证
    await formEl.validate()
    // 3. 创建FormData
    const formData = new FormData()
    formData.append('date', formCopy.date)
    formData.append('category', formCopy.category)
    formData.append('amount', formCopy.amount)
    formData.append('illustrate', formCopy.illustrate)
    formData.append('img', formCopy.img)
    // 4. 提交数据
    await rbsStore.addData(formData)
    // 5. 手动更新数据（避免重新请求）
    rbsStore.rbsInfo = [
      ...rbsStore.rbsInfo
    ]
    // 5. 延迟重置操作
    await nextTick()
    // 6. 安全重置表单
    if (formRef.value) {
      formRef.value.resetFields()
      fileList.value = []
      form.value = { ...form.value, img: null }
    }

    // 8. 维护分页状态
    currentPage.value = 1

  } catch (error) {
    if (error.message) {
      console.error('提交失败:', error)
    }
  }
}

// 查看详情
const viewDetail = (row) => {
  detailData.value = {
    ...row
  }
  dialogVisible.value = true
}
</script>

<style scoped>
.reimburse-container {
  padding: 20px;
  background-color: #f5f7fa;
  min-height: 100vh;
}

.action-card {
  :deep(.el-card__body) {
    padding-top: 10px;
  }
}

.action-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.record-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.filter-group {
  display: flex;
  gap: 10px;
  align-items: center;
}

.mt-20 {
  margin-top: 20px;
}

.mb-20 {
  margin-bottom: 20px;
}

:deep(.el-upload) {
  width: 100px;
  height: 100px;
}

.el-upload__tip {
  font-size: 12px;
  color: #909399;
  margin-top: 5px;
}

:deep(.el-descriptions__body) {
  padding: 20px;
}
</style>
