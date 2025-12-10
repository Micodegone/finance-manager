import { ElMessageBox, ElMessage } from 'element-plus'
import { useExpenseStore } from '@/stores/expenseStore'

export const useExpenseOperations = () => {
  const expenseStore = useExpenseStore()

  // 删除操作
  const handleDelete = async (id) => {
    try {
      await ElMessageBox.confirm('确认删除该收入记录？', '警告', {
        confirmButtonText: '确认',
        cancelButtonText: '取消',
        type: 'warning'
      })

      await expenseStore.deleteExpenseData(id)
      ElMessage.success('删除成功')
      return true
    } catch (error) {
      if (error !== 'cancel') {
        ElMessage.error(error.message || '删除失败')
      }
      return false
    }
  }

  // 更新操作
  const handleUpdate = async (id, formData) => {
    try {
      const result = await expenseStore.updateExpenseData(id, formData)
      ElMessage.success('更新成功')
      return result
    } catch (error) {
      ElMessage.error(error.message || '更新失败')
      throw error
    }
  }

  return {
    handleDelete,
    handleUpdate
  }
}
