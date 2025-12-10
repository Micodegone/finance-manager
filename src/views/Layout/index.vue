<!-- eslint-disable vue/multi-word-component-names -->
<!--
    1. 登录/注册页
    2. 仪表盘（首页）
    3. 财务记录页
    4. 合规管理页
    5. 财务分析报告页
    6. 财务目标规划页
    7. 智能助手页
    8. 个人设置与安全页
 -->
<template>
  <el-container class="layout-container-demo" style="height:100vh">
    <el-aside width="200px">
      <el-scrollbar>
        <el-menu :default-openeds="['1', '4']" router :default-active="$route.path">

          <el-sub-menu index="1">
            <template #title>
              首页
            </template>
            <el-menu-item index="/dashboard">仪表盘</el-menu-item>
            <el-menu-item index="/financeplan">财务规划</el-menu-item>
          </el-sub-menu>

          <el-sub-menu index="2">
            <template #title>
              财务记录
            </template>
            <el-menu-item index="/Income">收入</el-menu-item>
            <el-menu-item index="/Expense">支出</el-menu-item>
            <el-menu-item index="/Transfor">转账</el-menu-item>
          </el-sub-menu>
          <el-sub-menu index="3">
            <template #title>
              智能财税系统
            </template>
            <el-menu-item index="/knowledge">知识库AI智能体</el-menu-item>
            <el-menu-item index="/MyFiscal">财税</el-menu-item>
            <el-menu-item index="/reimbursement">报销</el-menu-item>
          </el-sub-menu>

          <el-sub-menu index="4">
            <template #title>
              财务结论
            </template>
            <el-menu-item index="/myReports">财务分析报告</el-menu-item>
            <el-menu-item index="/myPlan">财务目标规划</el-menu-item>
          </el-sub-menu>
        </el-menu>
      </el-scrollbar>
    </el-aside>

    <el-container>
      <el-header style="text-align: right; font-size: 12px; position: relative;">
        <div class="toolbar">
          <h1 style="left: 30px;;font-size: 25px;position: absolute;">私人财务管理系统</h1>
          <el-button type="text" @click="logout">登出</el-button>
          <span style="margin-left: 20px;">{{ userInfo.account }}</span>
        </div>
      </el-header>

      <el-main>
        <RouterView />
      </el-main>

      <el-footer>
        <div style="float: right; margin-top: 10px;">
          联系我们：123456789
        </div>
        <div style="margin-top: 10px;">
          点击此处对我们进行反馈：
          <el-button @click="handleClick">反馈</el-button>
        </div>
      </el-footer>
      <!-- 反馈对话框 -->
      <el-dialog title="意见反馈" v-model="dialogVisible" width="500px">
        <el-form>
          <el-form-item label="反馈内容">
            <el-input type="textarea" :rows="4" v-model="feedbackText" placeholder="请输入您的反馈意见"></el-input>
          </el-form-item>
        </el-form>

        <template #footer>
          <span class="dialog-footer">
            <el-button @click="dialogVisible = false">取 消</el-button>
            <el-button type="primary" @click="submitFeedback">提 交</el-button>
          </span>
        </template>
      </el-dialog>
    </el-container>
  </el-container>
</template>

<script lang="ts" setup>
import { useUserStore } from '@/stores/userStore';
import { ref } from 'vue';

const { logout, userInfo ,addFeedback} = useUserStore()
const dialogVisible = ref(false)
const feedbackText = ref('')
const handleClick = () => {
  dialogVisible.value = true
  // console.log(userInfo.account)
}
// 日期格式化
const formatDate = () => {
  const date = new Date()
  return `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`
}
const submitFeedback = async() => {
  await addFeedback({
    username: userInfo.account,
    content: feedbackText.value,
    time: formatDate()
  })
  feedbackText.value = ''
  console.log(formatDate())
  dialogVisible.value = false
}
</script>

<style scoped>
.layout-container-demo .el-header {
  position: relative;
  background-color: #FAEBD7;
  color: var(--el-text-color-primary);
}

.layout-container-demo .el-footer {
  position: relative;
  background-color: #FAEBD7;
  color: var(--el-text-color-primary);
}

.layout-container-demo .el-aside {
  color: var(--el-text-color-primary);
  background: #FAEBD7;
}

.layout-container-demo .el-menu {
  border-right: 0;
  background-color: #FFDEAD;
}

.layout-container-demo .el-main {
  padding: 0;
}

.layout-container-demo .toolbar {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  right: 20px;
}

.el-menu-item {
  background-color: #FAEBD7;
}
</style>
