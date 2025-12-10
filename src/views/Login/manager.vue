<!-- eslint-disable vue/multi-word-component-names -->
<template>
  <div class="layout-container">
    <!-- 顶部导航栏 -->
    <el-menu mode="horizontal" background-color="#545c64" text-color="#fff" active-text-color="#ffd04b">
      <el-menu-item index="/manager">首页</el-menu-item>
      <el-menu-item index="/feedback">用户反馈信息</el-menu-item>
    </el-menu>

    <!-- 中间主要内容 -->
    <div class="main-content">
      <el-card class="main-card">
        <div class="header">
          <h3>产品注册用户信息</h3>
          <div class="header-actions">
            <el-button type="primary" @click="showAddDialog">注册用户</el-button>
            <div class="search-container">
              <el-input v-model="searchKeyword" placeholder="输入账号或ID搜索" clearable @keyup.enter="handleSearch">
                <template #append>
                  <el-button :icon="Search" @click="handleSearch" />
                </template>
              </el-input>
            </div>
          </div>
        </div>

        <el-table :data="pagedData" v-loading="loading" style="width: 100%" height="calc(100vh - 340px)">
          <el-table-column prop="id" label="用户ID" width="120" />
          <el-table-column prop="account" label="账号" />
          <el-table-column prop="password" label="密码" width="180">
            <template #default="{ row }">
              <el-tooltip :content="row.password" placement="top">
                <span>{{ row.password?.replace(/./g, '•') }}</span>
              </el-tooltip>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="220" fixed="right">
            <template #default="{ row }">
              <el-button type="primary" size="small" @click="handleView(row)">查看</el-button>
              <el-button type="warning" size="small" @click="handleEdit(row)">修改</el-button>
              <el-button type="danger" size="small" @click="handleDelete(row.id)">删除</el-button>
            </template>
          </el-table-column>
        </el-table>

        <el-pagination class="pagination" :page-size="pageSize" :total="total" v-model:current-page="currentPage"
          :disabled="loading" layout="total, prev, pager, next, jumper" @current-change="handlePageChange" />
      </el-card>
      <el-card class="main-card">
        <div class="header">
          <h3>用户反馈信息</h3>
        </div>
        <el-table :data="feedbackData" style="width: 100%" height="calc(100vh - 340px)">
          <el-table-column prop="id" label="ID" width="120" />
          <el-table-column prop="username" label="用户名称" :min-width="120"/>
          <el-table-column prop="content" label="反馈信息" :min-width="120"/>
          <el-table-column prop="time" label="反馈时间" :min-width="120" />
        </el-table>
      </el-card>
    </div>

    <!-- 新增注册对话框 -->
    <el-dialog v-model="addDialogVisible" title="注册新用户" width="500px" center>
      <el-form ref="addFormRef" :model="newUser" :rules="addRules" label-width="80px">
        <el-form-item label="账号" prop="account">
          <el-input v-model="newUser.account" placeholder="请输入账号" />
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input v-model="newUser.password" type="password" show-password placeholder="请输入密码" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="submitAdd">提交</el-button>
          <el-button @click="addDialogVisible = false">取消</el-button>
        </el-form-item>
      </el-form>
    </el-dialog>

    <!-- 用户详情对话框 -->
    <el-dialog v-model="detailDialogVisible" title="用户详情" width="500px" center>
      <el-descriptions :column="1" border>
        <el-descriptions-item label="用户ID">{{ currentUser.id }}</el-descriptions-item>
        <el-descriptions-item label="账号">{{ currentUser.account }}</el-descriptions-item>
        <el-descriptions-item label="密码">
          <span class="password-display">{{ currentUser.password }}</span>
        </el-descriptions-item>
        <el-descriptions-item label="注册时间">{{ currentUser.createTime }}</el-descriptions-item>
      </el-descriptions>
    </el-dialog>

    <!-- 编辑用户对话框 -->
    <el-dialog v-model="editDialogVisible" title="修改用户信息" width="500px" center>
      <el-form ref="editFormRef" :model="currentUser" label-width="80px" :rules="editRules">
        <el-form-item label="用户ID" prop="id">
          <el-input v-model="currentUser.id" disabled />
        </el-form-item>
        <el-form-item label="账号" prop="account">
          <el-input v-model="currentUser.account" disabled />
        </el-form-item>
        <el-form-item label="新密码" prop="newPassword">
          <el-input v-model="currentUser.newPassword" type="password" show-password placeholder="请输入新密码" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="submitEdit">提交修改</el-button>
          <el-button @click="editDialogVisible = false">取消</el-button>
        </el-form-item>
      </el-form>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { Search } from '@element-plus/icons-vue'
import { useAdminStore } from '@/stores/adminStore'
import { ElMessage, ElMessageBox } from 'element-plus'
import { feedbackAPI } from '@/apis/admin'
const adminStore = useAdminStore()
const feedbackData = ref()
// 分页参数
const pageSize = 8
const currentPage = ref(1)
const loading = ref(false)
const searchKeyword = ref('')

// 对话框相关
const detailDialogVisible = ref(false)
const editDialogVisible = ref(false)
const currentUser = ref({})
const editFormRef = ref(null)

const feedback = async()=>{
  try{
    const res = await feedbackAPI()
    if(res.code === 200){
      feedbackData.value = res.data
    }
  }catch(e){
    console.error(e)
  }
}

// 注册相关
const addDialogVisible = ref(false)
const newUser = ref({ account: '', password: '' })
const addFormRef = ref(null)

// 表单验证规则
const addRules = {
  account: [
    { required: true, message: '请输入账号', trigger: 'blur' },
    { min: 4, max: 16, message: '账号长度需在4-16位之间', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, max: 16, message: '密码长度需在6-16位之间', trigger: 'blur' }
  ]
}

// 表单验证规则
const editRules = {
  newPassword: [
    { required: true, message: '请输入新密码', trigger: 'blur' },
    { min: 6, max: 16, message: '密码长度需在6-16位之间', trigger: 'blur' }
  ]
}

// 计算属性
const filteredData = computed(() => {
  return adminStore.catchUserInfo.filter(item => {
    const search = searchKeyword.value.toLowerCase()
    return String(item.id).includes(search) ||
      item.account.toLowerCase().includes(search)
  })
})

const total = computed(() => filteredData.value.length)
const pagedData = computed(() => {
  return filteredData.value.slice(
    (currentPage.value - 1) * pageSize,
    currentPage.value * pageSize
  )
})

// 方法
const handleSearch = () => {
  currentPage.value = 1
}

const handleView = (user) => {
  currentUser.value = { ...user }
  detailDialogVisible.value = true
}

const handleEdit = (user) => {
  currentUser.value = { ...user, newPassword: '' }
  editDialogVisible.value = true
}

const submitEdit = async () => {
  try {
    await editFormRef.value.validate()
    loading.value = true

    await adminStore.updateUser({
      id: currentUser.value.id,
      password: currentUser.value.newPassword
    })

    ElMessage.success('修改成功')
    editDialogVisible.value = false
    // 清除修改后的密码字段
    currentUser.value.newPassword = ''
    await adminStore.fetchUsers()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error(error.message || '修改失败')
    }
  } finally {
    loading.value = false
  }
}
// 新增方法
const showAddDialog = () => {
  newUser.value = { account: '', password: '' }
  addDialogVisible.value = true
}

const submitAdd = async () => {
  try {
    await addFormRef.value.validate()
    loading.value = true

    await adminStore.addUser(newUser.value)
    ElMessage.success('注册成功')

    addDialogVisible.value = false
    await adminStore.fetchUsers()

    // 跳转到最后一页
    currentPage.value = Math.ceil(total.value / pageSize)
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error(error.message || '注册失败')
    }
  } finally {
    loading.value = false
  }
}
const handlePageChange = (newPage) => {
  currentPage.value = newPage
}
const handleDelete = async (userId) => {
  try {
    await ElMessageBox.confirm('确定要删除该用户吗？此操作不可恢复！', '警告', {
      confirmButtonText: '确定删除',
      cancelButtonText: '取消',
      type: 'warning',
      confirmButtonClass: 'el-button--danger'
    })

    loading.value = true
    await adminStore.deleteUser(userId)
    ElMessage.success('删除成功')

    // 处理分页边界情况
    if (pagedData.value.length === 1 && currentPage.value > 1) {
      currentPage.value -= 1
    }
    await adminStore.fetchUsers()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('删除失败')
    }
  } finally {
    loading.value = false
  }
}

// 初始化加载
onMounted(async () => {
  feedback()
  try {
    loading.value = true

    await adminStore.fetchUsers()
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
.layout-container {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background-color: #f5f7fa;
}

.main-content {
  flex: 1;
  padding: 20px;
  min-width: 80%;
  margin: 0 auto;
}

.main-card {
  height: calc(100vh - 120px);
  display: flex;
  flex-direction: column;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding: 0 10px;
}

.header h3 {
  margin: 0;
  font-size: 18px;
  color: #303133;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 20px;
}

.search-container {
  width: 300px;
}

.pagination {
  margin-top: auto;
  padding: 20px 10px 0;
  justify-content: flex-end;
}

.el-table {
  flex: 1;
  margin: 0 -1px;
}

.el-table :deep(.cell) {
  padding: 0 12px;
}

.password-display {
  letter-spacing: 2px;
  font-family: monospace;
}

.el-dialog {
  border-radius: 8px;
}

.el-form-item {
  margin-bottom: 22px;
}

@media (max-width: 768px) {
  .header {
    flex-direction: column;
    align-items: flex-start;
    gap: 15px;
  }

  .header-actions {
    width: 100%;
    flex-direction: column;
    gap: 15px;
  }

  .search-container {
    width: 100%;
  }

  .main-card {
    height: auto;
    min-height: calc(100vh - 120px);
  }
}
</style>
