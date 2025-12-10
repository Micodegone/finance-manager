import { ElMessageBox, ElMessage } from 'element-plus'
import { useIncomeStore } from '@/stores/incomeStore'

export const useIncomeOperations = () => {
  const incomeStore = useIncomeStore()

  // 删除操作
  const handleDelete = async (id) => {
    try {
      await ElMessageBox.confirm('确认删除该收入记录？', '警告', {
        confirmButtonText: '确认',
        cancelButtonText: '取消',
        type: 'warning'
      })

      await incomeStore.deleteData(id)
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
      const result = await incomeStore.updateData(id, formData)
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
