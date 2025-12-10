import request from '@/utils/http'

//获取用户信息API
export const catchUserAPI = () =>{
  return request({
    url: '/user',
    method: 'GET',
  })
}

//新增用户API
export const addUserAPI = (formData)=>{
  return request({
    url: '/user',
    method: 'POST',
    data: formData,
    headers: {
      'Content-Type': 'multipart/form-data' // 必须明确指定
    }
  })
}
//更新用户API
export const updateUserAPI = (data)=>{
  return request({
    url: `/user/${data.id}/password`,
    method: 'PUT',
    data: {password: data.password},
    headers: {
      'Content-Type': 'application/json', // 必须明确指定
    }
  })
}
//删除用户API
export const deleteUserAPI = (userId)=>{
  return request({
    url: `/user/${userId}`,
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json' // 必须明确指定
    }
  })
}
