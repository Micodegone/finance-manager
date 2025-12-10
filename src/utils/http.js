//axios基础封装
import axios from "axios";
import { useUserStore } from '@/stores/userStore'
import router from "@/router";

const httpInstance = axios.create({
  baseURL: 'http://127.0.0.1:8080/api',
  timeout: 3000
})

//拦截器

//axios请求拦截器
httpInstance.interceptors.request.use(config => {
  const userStore = useUserStore();
  const token = userStore.userInfo?.token; // 从 Pinia 或 localStorage 获取 Token
  console.log('当前Token:', token)
  if (token) {
    config.headers['X-Auth-Token'] = token; // 关键：添加 Token 到请求头
  }
  return config
}, e => Promise.reject(e))

// axios响应式拦截器
httpInstance.interceptors.response.use(res => {
  // 根据你的接口响应结构调整
  if (res.data.code !== 200) {
    return Promise.reject(res.data)
  }
  return res.data
}, e => {
  // 处理HTTP错误状态码
  if (e.response?.status === 401) {
    const userStore = useUserStore()
    userStore.logout()
    router.push('/auth/login')
  }
  return Promise.reject(e)
})

export default httpInstance
