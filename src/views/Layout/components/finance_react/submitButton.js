import { ref, computed } from "vue"
import popmessage from '@/views/Layout/components/Message/index'
export const dataButton = (info, store) => {
  const dialogVisible = ref(false)
  const isSubmitting = ref(false)
  const formRef = ref(null) // 添加表单引用
  const newData = ref({
    date: '',
    category: '',
    amount: 0,
    voucherFile: null,      // 存储文件对象
    voucherPreview: null    // 存储预览URL
  })

  // 动态分类选项
  const categories = computed(() => {
    return [...new Set(info.value.map(i => i.category))].sort()
  })

  // 处理文件上传
  const handleUpload = (file) => {
    // 文件类型验证
    const allowedTypes = ['image/jpeg', 'image/png']
    if (!allowedTypes.includes(file.raw.type)) {

      return popmessage({ type: "warn", str: "文件格式错误" })
    }

    // 文件大小限制 (2MB)
    const maxSize = 2 * 1024 * 1024
    if (file.size > maxSize) {

      return popmessage({ type: "warn", str: "文件大小错误" })
    }

    newData.value.voucherFile = file.raw
    newData.value.voucherPreview = URL.createObjectURL(file.raw)
  }

  // 提交表单
  const submitData = async () => {
    try {
      const valid = await formRef.value.validate()
      if (!valid) return
      // 表单验证
      if (!validateForm()) return

      const formData = new FormData()
      formData.append('amount', newData.value.amount)
      formData.append('date', newData.value.date)
      formData.append('category', newData.value.category)
      if (newData.value.voucherFile) {
        formData.append('voucher', newData.value.voucherFile)
      }

      await store.addData(formData)
      popmessage({ type: "success", str: "添加成功" })
      dialogVisible.value = false
      resetForm()

    } catch (error) {
      popmessage({ type: "warn", str: "添加失败" })
      console.log(newData.value)
      console.log(error.message)
    }
  }

  // 表单验证
  const validateForm = () => {
    if (!newData.value.date) {
      return false
    }
    if (!newData.value.category?.trim()) {
      return false
    }
    if (isNaN(newData.value.amount) || newData.value.amount <= 0) {
      return false
    }
    return true
  }

  // 重置表单
  const resetForm = () => {
    dialogVisible.value = false
    newData.value = {
      date: '',
      category: '',
      amount: 0,
      voucherFile: null,
      voucherPreview: null
    }
  }

  // 打开对话框
  const showAddDialog = () => {
    dialogVisible.value = true
  }
  // 表单验证规则
  const dataRules = {
    amount: [
      { required: true, pattern: /^\d+(\.\d{1,2})?$/ ,message: '请输入预算金额', trigger: ['blur', 'change']  },
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
    ],
    category: [
      {
        required: true, message: "请输入内容", trigger: ['blur', 'change']
      }
    ],
    date: [
      { required: true, message: "日期不能为空且不能大于当前日期", trigger: ['blur', 'change'] },
      {
        validator: (_, value, callback) => {
          // 检查日期是否为空
          if (!value) {
            return callback(new Error("日期不能为空且不能大于当前日期"));
          }

          // 将输入的日期转为Date对象
          const inputDate = new Date(value);
          const currentDate = new Date();

          // 比较输入日期与当前日期
          if (inputDate > currentDate) {
            callback(new Error("日期不能大于当前日期"));
          } else {
            callback();  // 校验通过
          }
        },
        trigger: 'blur'
      }
    ]
  }
  return {
    categories,
    dialogVisible,
    newData,
    isSubmitting,
    dataRules,
    formRef,
    resetForm,
    handleUpload,
    submitData,
    showAddDialog,
    validateForm
  }
}
