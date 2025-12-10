import request from '@/utils/http'

export const budgetAPI = () =>{
  return request({
    url: '/budget',
    method: 'GET',
  })
}
//新增支出API
export const addBudgetAPI = (formData)=>{
  return request({
    url: '/budget',
    method: 'POST',
    data: formData,
    headers: {
      'Content-Type': 'multipart/form-data' // 必须明确指定
    }
  })
}
