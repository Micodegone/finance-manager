import request from '@/utils/http'
//获取发票信息API
export const VatAPI = () =>{
  return request({
    url: '/vat',
    method: 'GET',
  })
}

//新增发票API
export const addVatAPI = (formData)=>{
  return request({
    url: '/vat',
    method: 'POST',
    data: formData,
    headers: {
      'Content-Type': 'multipart/form-data' // 必须明确指定
    }
  })
}
// 删除收入API
export const deleteVatAPI = (id) => {
  return request({
    url: `/vat/${id}`,
    method: 'DELETE'
  })
}

