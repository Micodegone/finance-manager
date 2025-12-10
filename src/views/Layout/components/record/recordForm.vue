<script setup>
import { ref, watch, computed } from 'vue'
import { getFullImageUrl } from '@/utils/imageDisplay'
const props = defineProps({
  initialData: Object,
  categories:Array
})
const emit = defineEmits(['submit'])

const formData = ref({
  amount: '',
  date: '',
  category: '',
  voucherFile: null,
  clearVoucher: false
})

// 图片预览相关
const currentVoucherPreview = ref('')
const newVoucherPreview = ref('')

// 初始化表单数据
watch(() => props.initialData, (newVal) => {
  if (newVal) {
    formData.value = {
      amount: Number(newVal.amount),
      date: newVal.date.replace(' ', 'T').slice(0, 19),
      category: newVal.category,
      voucherFile: null,
      clearVoucher: false
    }
    // 显示现有凭证预览
    currentVoucherPreview.value = newVal.voucher || ''
  }
}, { immediate: true })

// 处理文件上传
const handleFileChange = (file) => {
  formData.value.voucherFile = file.raw
  // 生成新凭证预览
  newVoucherPreview.value = URL.createObjectURL(file.raw)
}
// 清除新上传的预览
const clearNewPreview = () => {
  if (newVoucherPreview.value) {
    URL.revokeObjectURL(newVoucherPreview.value)
    newVoucherPreview.value = ''
    formData.value.voucherFile = null
  }
}

// 提交表单
const submitForm = () => {
  // 构建凭证逻辑
  let voucherValue = null
  if (formData.value.clearVoucher) {
    // 情况1：勾选清除凭证，无论是否有新文件都设为null
    voucherValue = ''
  } else if (formData.value.voucherFile) {
    // 情况2：未勾选清除但有新文件，使用新文件名（后端处理实际保存）
    voucherValue = formData.value.voucherFile
  } else {
    // 情况3：保持原有凭证（不需要修改）
    voucherValue = currentVoucherPreview.value
  }
  console.log("voucherValue:", voucherValue)
  const payload = {
    ...formData.value,
    date: formData.value.date.replace('T', ' '),
    voucher: voucherValue,
    clearVoucher: formData.value.clearVoucher
  }
  // 清理新预览的URL内存
  clearNewPreview()
  emit('submit', payload)
}
// 凭证显示逻辑
const showCurrentVoucher = computed(() => {
  console.log(formData.value.clearVoucher)
  console.log(formData.value.voucherFile)
  return currentVoucherPreview.value && !formData.value.clearVoucher
})
</script>

<template>
  <el-form label-width="80px">
    <el-form-item label="金额" required>
      <el-input-number v-model="formData.amount" :precision="2" :min="0.01" :step="0.01" />
    </el-form-item>

    <el-form-item label="日期" required>
      <el-date-picker v-model="formData.date" type="datetime" format="YYYY-MM-DD HH:mm:ss"
        value-format="YYYY-MM-DD HH:mm:ss" />
    </el-form-item>

    <el-form-item label="类别" required>
      <el-select v-model="formData.category" filterable allow-create
        placeholder="选择或输入类别">
        <el-option v-for="item in categories" :key="item" :label="item" :value="item" />
      </el-select>
    </el-form-item>

    <el-form-item label="凭证">
      <!-- 当前凭证预览 -->
      <div v-if="showCurrentVoucher" class="preview-container">
        <span class="preview-label">当前凭证：</span>
        <el-image style="width: 100px; height: 100px" :src="getFullImageUrl(currentVoucherPreview)" fit="cover"
          :preview-src-list="[getFullImageUrl(currentVoucherPreview)]" hide-on-click-modal />
      </div>
      <!-- 新凭证预览 -->
      <div v-if="newVoucherPreview" class="preview-container">
        <span class="preview-label">新凭证预览：</span>
        <el-image style="width: 100px; height: 100px" :src="newVoucherPreview" fit="cover" />
      </div>

    </el-form-item>
    <el-row :gutter="20" style="margin-left: 70px;margin-bottom: 20px;">
      <el-col :span="12">
        <!-- 上传控件 -->
        <el-upload :show-file-list="false" :before-upload="() => false" @change="handleFileChange">
          <el-button type="primary">上传新凭证</el-button>
        </el-upload>
      </el-col>
      <el-col :span="12">
        <!-- 清除凭证选项 -->
        <el-checkbox v-model="formData.clearVoucher" @change="val => {
          if (val) clearNewPreview()
        }">
          清除当前凭证
        </el-checkbox>
      </el-col>
    </el-row>
    <el-form-item>
      <el-button type="primary" @click="submitForm">提交</el-button>
    </el-form-item>
  </el-form>
</template>
<style scoped>
.preview-container {
  margin: 10px 0;
  padding: 10px;
  border: 1px solid #eee;
  border-radius: 4px;
}

.preview-label {
  display: block;
  margin-bottom: 8px;
  color: #606266;
  font-size: 12px;
}
</style>
