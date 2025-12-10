import request from '@/utils/http'

export const expenseAPI = () =>{
  return request({
    url: '/expense',
    method: 'GET',
  })
}
//新增支出API
export const addExpenseAPI = (formData)=>{
  return request({
    url: '/expense',
    method: 'POST',
    data: formData,
    headers: {
      'Content-Type': 'multipart/form-data' // 必须明确指定
    }
  })
}
// 更新支出API
export const updateExpenseAPI = (id, formData) => {
  return request({
    url: `/expense/${id}`,
    method: 'PUT',
    data: formData,
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
}
// 删除支出API
export const deleteExpenseAPI = (id) => {
  return request({
    url: `/expense/${id}`,
    method: 'DELETE'
  })
}
