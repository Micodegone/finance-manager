import request from '@/utils/http'

//获取报销API
export const rbsAPI = () =>{
  return request({
    url: '/rbs',
    method: 'GET',
  })
}

//新增报销API
export const addRbsAPI = (formData)=>{
  return request({
    url: '/rbs',
    method: 'POST',
    data: formData,
    headers: {
      'Content-Type': 'multipart/form-data' // 必须明确指定
    }
  })
}
