import { defineStore } from 'pinia'
import { ref } from 'vue'
import { loginAPI,feedbackAddAPI } from '@/apis/user'
import router from '@/router'
export const useUserStore = defineStore('user', () => {
  //获取用户数据
  const userInfo = ref(null)

  //定义获取接口数据的action函数
  const getUserInfo = async ({ account, password }) => {
    try {
      console.log('发送登录请求:', { account, password })
      const res = await loginAPI({ account, password })

      //验证返回数据
      if (res.code === 200) {
        userInfo.value = { account, token: res.data }
        localStorage.setItem('user', JSON.stringify(userInfo.value))
        await router.replace('/dashboard')
      } else {
        const errorMap = {
          401: '账号或密码错误',
          404: '账号或密码错误',
          403: '账号或密码错误',
          500: '账号或密码错误'
        }
        throw new Error(errorMap[res.code] || '登录失败')
      }
    } catch (e) {
      userInfo.value = null
      localStorage.removeItem('user')
      if (!e.response) {
        throw new Error('账号或密码错误')
      }
      throw e
    }
  }

  //初始化时尝试从本地存储恢复登录状态
  const initUser = () => {
    const user = localStorage.getItem('user')
    if (user) {
      userInfo.value = JSON.parse(user)
    }
  }
  // 新增登出方法
  const logout = () => {
    // 清除Pinia状态
    userInfo.value = null
    // 清除本地存储
    localStorage.removeItem('user')
    // 清除会话存储（如果有）
    sessionStorage.clear()
    // 清除浏览器缓存
    caches.keys().then(cacheNames => {
      cacheNames.forEach(cacheName => {
        caches.delete(cacheName)
      })
    })
    // 跳转登录页
    router.replace('/auth/login')
  }
  // 添加反馈信息
  const addFeedback = async (newFeedback) =>{
    try{
      const res = await feedbackAddAPI(newFeedback)
      if(res.code === 200){
        return Promise.resolve(res.data) // 返回成功结果
      }
    }catch(e){
      console.error(e)
    }
  }
  return {
    userInfo,
    getUserInfo,
    initUser,
    logout,
    addFeedback
  }
})
