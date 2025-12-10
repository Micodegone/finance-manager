import request from '@/utils/http'

export const planAPI = () =>{
  return request({
    url: '/plan',
    method: 'GET',
  })
}
//新增计划目标API
export const addPlanAPI = (formData)=>{
  return request({
    url: '/plan',
    method: 'POST',
    data: formData,
    headers: {
      'Content-Type': 'multipart/form-data' // 必须明确指定
    }
  })
}
//添加已存金额API
export const updateStorageAPI = (data) => {
  return request({
    url: `/plan/${data.id}/storage`,
    method: 'PUT',
    data: { storage: data.storage },
    headers: {
      'Content-Type': 'application/json',
    },
  })
}
