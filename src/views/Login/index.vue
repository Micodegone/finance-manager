<!-- eslint-disable vue/multi-word-component-names -->
<template>
  <div class="login-container">
    <div>
      <section class="login-section">
        <div>
          <h1 style="text-align: center">私人财务管理系统</h1>
          <div>
            <div>
              <el-form
                ref="formRef"
                :model="form"
                :rules="rules"
                label-position="right"
                label-width="60px"
                status-icon
              >
                <el-form-item prop="account" label="账户">
                  <el-input
                    v-model="form.account"
                    @input="clearError"
                    placeholder="请输入账号"
                  />
                </el-form-item>

                <el-form-item prop="password" label="密码" :error="loginError">
                  <el-input
                    v-model="form.password"
                    type="password"
                    show-password
                    @input="clearError"
                    placeholder="请输入密码"
                  />
                  <div v-if="loginError" class="error-message">
                    {{ loginError }}
                  </div>
                </el-form-item>

                <el-button
                  size="large"
                  :loading="loading"
                  @click="doLogin"
                  style="margin-left: 60%; background-color: gainsboro"
                >
                  {{ loading ? '登录中...' : '点击登录' }}
                </el-button>
              </el-form>
            </div>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/userStore'
import type { FormInstance } from 'element-plus'
import popmessage from '@/views/Layout/components/Message/index'

const router = useRouter()
const userStore = useUserStore()
const formRef = ref<FormInstance>()
const loading = ref(false)
const loginError = ref('')

// 表单数据
const form = ref({
  account: '',
  password: ''
})

// 验证规则
const rules = {
  account: [
    { required: true, message: '账号不能为空', trigger: 'blur' },
    { min: 4, max: 16, message: '账号长度为4-16个字符', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '密码不能为空', trigger: 'blur' },
    { min: 6, max: 16, message: '密码长度为6-16个字符', trigger: 'blur' }
  ]
}

// 清空错误提示
const clearError = () => {
  if (loginError.value) {
    loginError.value = ''
    formRef.value?.clearValidate('password')
  }
}

// 登录处理
const doLogin = async () => {
  try {
    loading.value = true
    const valid = await formRef.value?.validate()

    if (valid) {
      await userStore.getUserInfo(form.value)
      popmessage({ type: "success", str: "登录成功" })
      router.replace('/dashboard')
    }
  } catch (error: any) {
    loginError.value = error.message || '登录失败，请检查账号密码'
    formRef.value?.validateField('password')
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  if (userStore.getUserInfo) {
    router.replace('/dashboard')
  }
})
</script>

<style scoped>
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  min-height: 100vh;
  background: url('../images/background.png') no-repeat center center;
  background-size: cover;
}

.login-section {
  width: 100%;
  max-width: 500px;
  margin: 0 auto;
}

.el-form {
  width: 400px;
  padding: 30px;
  background-color: rgba(0, 0, 0, 0.5);
  border-radius: 15px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.error-message {
  color: #f56c6c;
  font-size: 12px;
  line-height: 1;
  padding-top: 4px;
  position: absolute;
  bottom: -22px;
  left: 0;
}

.el-form-item {
  margin-bottom: 28px;
  position: relative;
}

.el-form-item:deep(.el-form-item__error) {
  display: none; /* 隐藏原生错误提示 */
}

.el-button {
  transition: all 0.3s ease;
}

.el-button:hover {
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}
</style>
