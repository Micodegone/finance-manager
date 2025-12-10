import request from '@/utils/http'

//获取收入API
export const incomeAPI = () =>{
  return request({
    url: '/income',
    method: 'GET',
  })
}

//新增收入API
export const addIncomeAPI = (formData)=>{
  return request({
    url: '/income',
    method: 'POST',
    data: formData,
    headers: {
      'Content-Type': 'multipart/form-data' // 必须明确指定
    }
  })
}
// 更新收入API
export const updateIncomeAPI = (id, formData) => {
  return request({
    url: `/income/${id}`,
    method: 'PUT',
    data: formData,
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
}
// 删除收入API
export const deleteIncomeAPI = (id) => {
  return request({
    url: `/income/${id}`,
    method: 'DELETE'
  })
}

