import { AdminAPI } from "@/apis/admin";
import { addUserAPI, catchUserAPI ,updateUserAPI,deleteUserAPI} from "@/apis/catch_user";
import { defineStore } from "pinia";
import { ref } from "vue";

export const useAdminStore = defineStore('admin', () => {
  const adminInfo = ref(false)
  const catchUserInfo = ref([])

  const getAdminInfo = async ({ account, password }) => {
    try {
      const res = await AdminAPI({ account, password })

      if (res.code === 200) {
        adminInfo.value = true
        await fetchUsers()
        return true
      } else {
        const errorMap = {
          401: '账号或密码错误',
          404: '账号或密码错误',
          403: '账号或密码错误',
          500: '账号或密码错误'
        }
        throw new Error(errorMap[res.code] || '登录失败')
      }
    } catch (error) {
      adminInfo.value = false
      if (!error.response) {
        throw new Error('账号或密码错误')
      }
      throw error
    }
  }

  const fetchUsers = async () => {
    try {
      const res = await catchUserAPI()
      if (res.code === 200) {
        catchUserInfo.value = res.data
      }
    } catch (error) {
      console.error('获取用户数据失败:', error)
      throw error
    }
  }
  const updateUser = async (userData) => {
    try {
      const res = await updateUserAPI(userData)
      if (res?.code === 200) {
        // 更新本地数据
        const index = catchUserInfo.value.findIndex(u => u.id === userData.id)
        if (index !== -1) {
          catchUserInfo.value[index] = {
            ...catchUserInfo.value[index],
            password: userData.password
          }
        }
        return res.data
      }
      throw new Error(res.message || '更新失败')
    } catch (error) {
      console.error('用户更新失败:', error)
      throw error
    }
  }
  const addUser = async (userData)=>{
    try{
      const res = await addUserAPI(userData)
      if(res?.code === 200){
        catchUserInfo.value = [
          res.data,
          ...catchUserInfo.value
        ]
      }
    }catch(error){
      console.error(error)
    }
  }
  const deleteUser = async (userId)=>{
    try{
      const res = await deleteUserAPI(userId)
      if(res?.code === 200){
        await fetchUsers()
        return true
      }
    }catch(error){
        console.error("删除用户失败",error)
      }
  }
  return {
    adminInfo,
    catchUserInfo,
    getAdminInfo,
    updateUser,
    fetchUsers,
    addUser,
    deleteUser
  }
})
