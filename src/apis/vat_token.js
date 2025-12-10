import request from '@/utils/http'

export const VatTokenAPI = () =>{
  return request({
    url: '/auth/token',
    method: 'GET',
  })
}
