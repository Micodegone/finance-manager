<template>
  <div class="finance-container">
    <!-- 顶部概览 -->
    <el-row :gutter="20" class="mb-20">
      <el-col :span="8">
        <el-card class="summary-card income">
          <div class="summary-item">
            <span class="label">本年收入</span>
            <span class="value">¥ {{ yearIncomeTotal }}</span>
          </div>
        </el-card>
      </el-col>
      <el-col :span="8">
        <el-card class="summary-card expense">
          <div class="summary-item">
            <span class="label">本年支出</span>
            <span class="value">¥ {{ Number(yearExpenseTotal).toFixed(2) }}</span>
          </div>
        </el-card>
      </el-col>
      <el-col :span="8">
        <el-card class="summary-card tax">
          <div class="summary-item">
            <span class="label">本年已缴税</span>
            <span class="value">¥ {{ yearlyVATTotal }}</span>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 主内容区 -->
    <el-row :gutter="20">
      <!-- 左栏 - 增值税普通发票表单 -->
      <el-col :span="10">
        <el-card class="chart-card">
          <template #header>
            <div class="card-header">
              <span>增值税普通发票</span>
            </div>
          </template>
          <el-form :model="vatForm" :rules="vatRules" ref="vatFormRef">
            <el-form-item label="发票代码" prop="code">
              <el-input v-model="vatForm.code" />
            </el-form-item>
            <el-form-item label="发票号码" prop="number">
              <el-input v-model="vatForm.number" />
            </el-form-item>
            <el-form-item label="开票日期" prop="date">
              <el-date-picker v-model="vatForm.date" type="date" placeholder="选择日期" format="YYYY-MM-DD"
                value-format="YYYY-MM-DD" />
            </el-form-item>
            <el-form-item label="金额" prop="amount">
              <el-input v-model="vatForm.amount" type="number" />
            </el-form-item>
            <el-form-item label="销售方名称" prop="seller">
              <el-input v-model="vatForm.seller" />
            </el-form-item>
            <el-form-item label="购买方名称" prop="buyer">
              <el-input v-model="vatForm.buyer" />
            </el-form-item>
            <el-form-item label="发票图片" prop="image">
              <el-upload action="#" :auto-upload="false" :on-change="handleVatImageChange"
                :file-list="vatForm.imageList" name="vatImage">
                <el-button type="primary">点击上传</el-button>
                <template #tip>
                  <div class="el-upload__tip">支持JPG/PNG格式，大小不超过2MB</div>
                </template>
              </el-upload>
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="submitVatForm" style="flex: auto;">提交发票</el-button>
            </el-form-item>
          </el-form>
        </el-card>
      </el-col>

      <!-- 右栏 - 增值税发票列表 -->
      <el-col :span="14">
        <el-card class="mt-20">
          <template #header>
            <div class="card-header">
              <span>增值税发票列表</span>
            </div>
          </template>
          <el-table :data="vatInvoices" height="600" style="width: 100%;">
            <el-table-column prop="code" label="发票代码" width="120" />
            <el-table-column prop="number" label="发票号码" width="120" />
            <el-table-column prop="date" label="日期" width="120" />
            <el-table-column prop="amount" label="金额" width="120">
              <template #default="{ row }">
                ¥{{ formatAmount(row.amount) }}
              </template>
            </el-table-column>
            <el-table-column prop="img" label="凭证">
              <template #default="{ row }">
                <el-image style="width: 60px; height: 60px" :src="getFullImageUrl(row.img)" fit="cover"
                  :preview-src-list="[getFullImageUrl(row.img)]" hide-on-click-modal />
              </template>
            </el-table-column>
            <el-table-column label="操作" width="150">
              <template #default="{ row }">
                <el-button size="small" @click="showDetail(row)">详情</el-button>
                <el-button size="small" type="danger" @click="deleteVat(row.id)">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-col>
    </el-row>

    <!-- 发票详情弹窗 -->
    <el-dialog v-model="detailVisible" title="发票详情">
      <el-descriptions :column="1" border v-if="currentInvoice">
        <el-descriptions-item label="发票代码">{{ currentInvoice.code }}</el-descriptions-item>
        <el-descriptions-item label="发票号码">{{ currentInvoice.number }}</el-descriptions-item>
        <el-descriptions-item label="开票日期">{{ currentInvoice.date }}</el-descriptions-item>
        <el-descriptions-item label="金额">¥{{ formatAmount(currentInvoice.amount) }}</el-descriptions-item>
        <el-descriptions-item label="销售方">{{ currentInvoice.seller }}</el-descriptions-item>
        <el-descriptions-item label="购买方">{{ currentInvoice.buyer }}</el-descriptions-item>
        <el-descriptions-item label="发票图片">
          <el-image :src="getFullImageUrl(currentInvoice.img)" style="max-width: 300px; max-height: 300px"
            fit="contain" />
        </el-descriptions-item>
      </el-descriptions>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import axios from 'axios'
import { useVatTokenStore } from '@/stores/vatTokenStore'
import { storeToRefs } from 'pinia'
import { useVatStore } from '@/stores/vatStore'
import { getFullImageUrl } from '@/utils/imageDisplay'
import { useIncomeStore } from '@/stores/incomeStore'
import { useExpenseStore } from '@/stores/expenseStore'
import popmessage from '@/views/Layout/components/Message/index'
//获取后端接口,进行查看与新增操作
const vatStore = useVatStore()
const { vatInfo } = storeToRefs(vatStore)

// 获取百度OCR检测token
const vatTokenStore = useVatTokenStore()
const { vat_token } = storeToRefs(vatTokenStore)


// 加载发票数据
const loading = ref(false)
const loadData = async () => {
  try {
    loading.value = true
    await vatStore.getVatInfo()
  } catch (error) {
    console.error('数据加载失败:', error)
  } finally {
    loading.value = false
  }
}

// 数据格式化
const formatAmount = (value) => {
  return Number(value || 0).toLocaleString('zh-CN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })
}
// 发票列表
const vatInvoices = computed(() => {
  return vatInfo.value.map(item => ({
    ...item,
    date: item.date.split('T')[0],
    amount: Number(item.amount).toFixed(2)
  }))
  .sort((a, b) => {
      // 降序排列（最新日期在前）
      return new Date(b.date) - new Date(a.date)
  })
})
console.log(vatInfo.value)

const currentYear = new Date().getFullYear()

// 本年增值税总金额计算
const yearlyVATTotal = computed(() => {
  return vatInfo.value
    .filter(item => {
      const itemYear = new Date(item.date).getFullYear()
      return itemYear === currentYear
    })
    .reduce((sum, item) => {
      return sum + Number(item.amount || 0)
    }, 0)
})

//本年总收入/支出
const incomeStore = useIncomeStore()
const expenseStore = useExpenseStore()

const {incomeInfo} = storeToRefs(incomeStore)
const {expenseInfo} = storeToRefs(expenseStore)
const {deleteVat} = useVatStore()
const yearIncomeTotal = computed(()=>{
  return incomeInfo.value
    .filter(item=>{
      const itemYear = new Date(item.date).getFullYear()
      return itemYear === currentYear
    })
    .reduce((sum,item)=>{
      return sum + Number(item.amount || 0)
    },0)
})
const yearExpenseTotal = computed(()=>{
  return expenseInfo.value
    .filter(item=>{
      const itemYear = new Date(item.date).getFullYear()
      return itemYear === currentYear
    })
    .reduce((sum,item)=>{
      return sum + Number(item.amount || 0)
    },0)
})
// 增值税普通发票表单
const vatFormRef = ref(null)
const vatForm = reactive({
  code: '',
  number: '',
  date: '',
  amount: '',
  seller: '',
  buyer: '',
  imageList: [],
  image: null,
  imagePreview: ''
})
const vatRules = {
  code: [{ required: true, message: '请输入发票代码', trigger: 'blur' }],
  number: [{ required: true, message: '请输入发票号码', trigger: 'blur' }],
  date: [{ required: true, message: '请选择开票日期', trigger: 'change' }],
  amount: [{ required: true, message: '请输入金额', trigger: 'blur' }],
  seller: [{ required: true, message: '请输入销售方名称', trigger: 'blur' }],
  buyer: [{ required: true, message: '请输入购买方名称', trigger: 'blur' }],
  image: [{ required: true, message: '请上传发票图片', trigger: 'change' }]
}

// 新增OCR识别状态
const ocrLoading = ref(false)
// 图片转Base64
const toBase64 = file => new Promise((resolve, reject) => {
  const reader = new FileReader()
  reader.readAsDataURL(file)
  reader.onload = () => resolve(reader.result.split(',')[1])
  reader.onerror = error => reject(error)
})

// 修改图片上传处理
const handleVatImageChange = async (file) => {
  vatForm.imageList = [file]
  vatForm.image = file.raw
  vatForm.imagePreview = URL.createObjectURL(file.raw)
  const imgBase64 = await toBase64(file.raw)

  // 检查是否需要OCR
  const needOCR = !vatForm.code && !vatForm.number && !vatForm.date &&
    !vatForm.amount && !vatForm.seller && !vatForm.buyer

  if (needOCR) {
    try {
      ocrLoading.value = true

      const res = await axios.post(
        `https://aip.baidubce.com/rest/2.0/ocr/v1/multiple_invoice?access_token=${vat_token.value}`,
        `image=${encodeURIComponent(imgBase64)}&verify_parameter=false`,
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Accept': 'application/json'
          }
        }
      )

      const result = res.data.words_result[0]?.result
      if (result) {
        // 数据映射
        vatForm.code = result.InvoiceCode?.[0]?.word || ''
        vatForm.number = result.InvoiceNum?.[0]?.word || ''
        vatForm.amount = result.AmountInFiguers?.[0]?.word.replace(/[^0-9.]/g, '') || ''
        vatForm.seller = result.SellerName?.[0]?.word || ''
        vatForm.buyer = result.PurchaserName?.[0]?.word || ''

        // 日期格式转换
        const rawDate = result.InvoiceDate?.[0]?.word
        if (rawDate) {
          const match = rawDate.match(/(\d{4})年(\d{1,2})月(\d{1,2})日/)
          if (match) {
            const [, year, month, day] = match
            vatForm.date = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`
          }
        }
        vatForm.image = file.raw

        // 图片预览
        const reader = new FileReader()
        reader.onload = (e) => (e.target.result)
        reader.readAsDataURL(file.raw)
      }
    } catch (error) {
      console.error('OCR Error:', error)
    } finally {
      ocrLoading.value = false
    }
  } else {
    // 仅处理图片预览
    const reader = new FileReader()
    reader.onload = (e) => (vatForm.image = e.target.result)
    reader.readAsDataURL(file.raw)
  }
}

// 修改表单提交逻辑
const submitVatForm = async () => {
  try {
    await vatFormRef.value.validate()

    // 创建表单数据对象
    const formData = new FormData()
    formData.append('code', vatForm.code)
    formData.append('number', Number(vatForm.amount).toFixed(2))
    formData.append('date', vatForm.date)
    formData.append('amount', parseFloat(vatForm.amount))
    formData.append('seller', vatForm.seller)
    formData.append('buyer', vatForm.buyer)
    formData.append('img', vatForm.image)

    console.log(formData)

    await vatStore.addData(formData)
    popmessage({ type: "success", str: "提交成功" })
    resetForm()
  } catch (error) {
    console.error('提交失败:', error)
    popmessage({ type: "error", str: "提交失败" })
  }
}
// 重置表单
const resetForm = () => {
  vatFormRef.value.resetFields()
  vatForm.imageList = []
  vatForm.image = null
  vatForm.imagePreview = ''
}

// 详情弹窗
const detailVisible = ref(false)
const currentInvoice = ref(null)


const showDetail = (invoice) => {
  currentInvoice.value = invoice
  detailVisible.value = true
}

onMounted(() => {
  vatTokenStore.getVatToken()
  incomeStore.getIncomeInfo()
  expenseStore.getExpenseInfo()
  loadData()
})
</script>

<style scoped>
/* 修改布局相关样式 */
.el-row {
  display: flex;
  flex-wrap: wrap;
  align-items: stretch; /* 确保列等高 */
}

.el-col {
  display: flex;
  flex-direction: column;
}

/* 卡片高度设置 */
.chart-card,
.el-card.mt-20 {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 650px; /* 保留最小高度 */
}

/* 卡片内容区域填充 */
.el-card__body {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

/* 表单容器高度适配 */
.el-form {
  flex: 1;
  display: flex;
  flex-direction: column;
}

/* 表格容器高度适配 */
.el-table {
  flex: 1;
}

/* 其他保持原有样式不变 */
.finance-container {
  padding: 20px;
  background-color: #f5f7fa;
  min-height: 100vh;
}

.summary-card {
  text-align: center;
  transition: transform 0.3s;
}

.summary-card:hover {
  transform: translateY(-5px);
}

.summary-item {
  padding: 20px;
}

.summary-item .label {
  display: block;
  color: #909399;
  margin-bottom: 8px;
}

.summary-item .value {
  font-size: 24px;
  font-weight: bold;
}

.income {
  border-top: 4px solid #67C23A;
}

.expense {
  border-top: 4px solid #F56C6C;
}

.tax {
  border-top: 4px solid #409EFF;
}

.invoice-list {
  max-height: 600px;
  overflow-y: auto;
}

.invoice-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px solid #ebeef5;
}

.invoice-item:last-child {
  border-bottom: none;
}

.invoice-info {
  flex: 1;
  display: flex;
  align-items: center;
}

.invoice-thumbnail {
  width: 40px;
  height: 40px;
  object-fit: cover;
  margin-right: 10px;
  border-radius: 4px;
}

.amount {
  font-weight: bold;
  margin-right: 15px;
}

.category {
  color: #909399;
  margin-right: 15px;
}

.date {
  color: #909399;
  font-size: 0.9em;
}

.preview-image {
  width: 100%;
  max-height: 70vh;
  object-fit: contain;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.mt-20 {
  margin-top: 20px;
}

.mb-20 {
  margin-bottom: 20px;
}
</style>
